import fs from "node:fs/promises";
import type {
  SummaryApplyRequest,
  SummaryPreviewRequest,
} from "../../../shared/types";
import {
  composeDocument,
  composeSummaryDocument,
  extractFirstHeading,
  normalizeGeneratedMarkdown,
  splitFrontmatter,
} from "../../utils/document";
import {
  acceptsEventStream,
  endSse,
  sendJson,
  startSse,
  writeSseEvent,
} from "../../utils/http";
import { parseSummaryReviewDetails } from "../../utils/parsing";
import {
  validateReviewModel,
  validateSummaryModel,
} from "../../utils/validation";
import {
  generateQualifiedSummaryMarkdown,
  streamSingleSummaryAttempt,
} from "../../services/summaryService";
import {
  readRequiredJsonBody,
  resolveRequiredSourcePath,
  type RouteHandler,
} from "../shared";

export const handleSummaryPreviewRequest: RouteHandler = async (context) => {
  const wantsEventStream = acceptsEventStream(context.req);
  const body = await readRequiredJsonBody<SummaryPreviewRequest>(context);

  if (!body) {
    return;
  }

  const sourcePath = await resolveRequiredSourcePath(
    context,
    body.relativePath,
  );

  if (!sourcePath) {
    return;
  }

  try {
    const sourceContent = await fs.readFile(sourcePath, "utf-8");
    const { body: markdownBody } = splitFrontmatter(sourceContent);
    const title = extractFirstHeading(markdownBody);
    const model = validateSummaryModel(body.model);
    const reviewModel = validateReviewModel(body.reviewModel);
    const reviewFeedback =
      typeof body.reviewFeedback === "string" ? body.reviewFeedback.trim() : "";
    const previousSummaryContent =
      typeof body.previousSummaryContent === "string"
        ? body.previousSummaryContent.trim()
        : "";
    const previousReviewDetails = parseSummaryReviewDetails(
      body.previousReviewDetails,
    );
    const attemptCount =
      typeof body.attemptCount === "number" &&
      Number.isFinite(body.attemptCount) &&
      body.attemptCount > 0
        ? Math.floor(body.attemptCount)
        : 1;

    if (wantsEventStream) {
      startSse(context.res);
      await streamSingleSummaryAttempt(
        {
          body: markdownBody,
          relativePath: body.relativePath,
          title,
          model,
          reviewModel,
          reviewFeedback,
          previousSummaryContent,
          previousReviewDetails,
          attemptCount,
        },
        (event, data) => {
          writeSseEvent(context.res, event, data);
        },
      );
      endSse(context.res, true);
      return;
    }

    const summaryResult = await generateQualifiedSummaryMarkdown({
      body: markdownBody,
      relativePath: body.relativePath,
      title,
      model,
      reviewModel,
      reviewFeedback,
      previousSummaryContent,
      previousReviewDetails,
      attemptCount,
    });

    sendJson(context.res, 200, {
      success: true,
      summaryContent: composeSummaryDocument(summaryResult.summaryBody, title),
      attemptCount: summaryResult.attemptCount,
      reviewPassed: summaryResult.reviewResult.passed,
      reviewMessage: summaryResult.reviewMessage,
      reviewIssues: summaryResult.reviewResult.issues,
      reviewDetails: summaryResult.reviewResult.details,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Summary generation failed.";

    if (wantsEventStream) {
      endSse(context.res, false, message);
      return;
    }

    sendJson(context.res, 500, {
      success: false,
      error: message,
    });
  }
};

export const handleSummaryApplyRequest: RouteHandler = async (context) => {
  const body = await readRequiredJsonBody<SummaryApplyRequest>(context);

  if (!body) {
    return;
  }

  const sourcePath = await resolveRequiredSourcePath(
    context,
    body.relativePath,
  );

  if (!sourcePath) {
    return;
  }

  if (typeof body.summaryContent !== "string") {
    sendJson(context.res, 400, {
      success: false,
      error: "Missing summaryContent.",
    });
    return;
  }

  const summaryContent = normalizeGeneratedMarkdown(body.summaryContent);

  if (!summaryContent) {
    sendJson(context.res, 400, {
      success: false,
      error: "Summary content is empty.",
    });
    return;
  }

  try {
    const sourceContent = await fs.readFile(sourcePath, "utf-8");
    const { frontmatter, body: markdownBody } = splitFrontmatter(sourceContent);
    const title = extractFirstHeading(markdownBody);
    await fs.writeFile(
      sourcePath,
      composeDocument(
        frontmatter,
        composeSummaryDocument(summaryContent, title),
      ),
      "utf-8",
    );

    sendJson(context.res, 200, { success: true });
  } catch (error) {
    sendJson(context.res, 500, {
      success: false,
      error: error instanceof Error ? error.message : "Summary apply failed.",
    });
  }
};
