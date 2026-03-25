import type { DocSummaryModel } from "../../shared";
import type {
  SummaryAttemptOptions,
  SummaryChunk,
  SummaryCoverageSnapshot,
  SummaryPlan,
  SummaryPlanHooks,
} from "../../shared/types";
import { callCursorChat, streamCursorChat } from "../clients/cursorChatClient";
import {
  buildChunkSummaryPrompt,
  buildCoverageExtractionPrompt,
  buildSummaryPrompt,
  buildSummaryReviewPrompt,
} from "../prompts/docSummaryPrompts";
import {
  parseCoverageSnapshot,
  parseSummaryReviewResult,
} from "../utils/parsing";
import { composeSummaryDocument } from "../utils/document";

const SUMMARY_CHUNK_TARGET_SIZE = 5000;
const SUMMARY_CHUNK_SOFT_LIMIT = 6500;

export async function generateQualifiedSummaryMarkdown(
  options: SummaryAttemptOptions,
) {
  const summaryPlan = await buildSummaryPlan(options);
  const summaryBody = await generateFinalSummaryMarkdown({
    ...options,
    coverageSnapshot: summaryPlan.coverageSnapshot,
    chunkSummaries: summaryPlan.chunkSummaries,
  });
  const reviewResult = await reviewSummaryMarkdown({
    coverageSnapshot: summaryPlan.coverageSnapshot,
    chunkSummaries: summaryPlan.chunkSummaries,
    relativePath: options.relativePath,
    title: options.title,
    summaryBody,
    model: options.reviewModel,
  });

  return {
    summaryBody,
    attemptCount:
      typeof options.attemptCount === "number" ? options.attemptCount : 1,
    reviewMessage: reviewResult.feedback,
    reviewResult,
  };
}

export async function streamSingleSummaryAttempt(
  options: SummaryAttemptOptions,
  emit: (event: string, data: Record<string, unknown>) => void,
) {
  const attemptCount =
    typeof options.attemptCount === "number" && options.attemptCount > 0
      ? options.attemptCount
      : 1;

  emit("status", {
    stage: "started",
    attemptCount,
    message: "已开始生成总结。",
  });
  emit("attempt-start", { attemptCount });
  emit("status", {
    stage: "generating",
    attemptCount,
    message: "正在提取文章覆盖要点...",
  });

  const summaryPlan = await buildSummaryPlan(options, {
    onCoverageExtracted(snapshot, chunkCount) {
      emit("coverage-extracted", {
        attemptCount,
        chunkCount,
        coverageSnapshot: snapshot,
      });
    },
    onChunkStart(chunkIndex, chunkCount) {
      emit("chunk-start", { attemptCount, chunkIndex, chunkCount });
      emit("status", {
        stage: "generating",
        attemptCount,
        message: `正在整理第 ${chunkIndex}/${chunkCount} 段内容...`,
      });
    },
    onChunkComplete(chunkIndex, chunkCount) {
      emit("chunk-complete", { attemptCount, chunkIndex, chunkCount });
    },
  });

  emit("status", {
    stage: "generating",
    attemptCount,
    message: `正在汇总第 ${attemptCount} 次总结...`,
  });

  let attemptSummaryBody = "";
  await streamFinalSummaryMarkdown(
    {
      ...options,
      coverageSnapshot: summaryPlan.coverageSnapshot,
      chunkSummaries: summaryPlan.chunkSummaries,
      attemptCount,
    },
    (delta) => {
      attemptSummaryBody += delta;
      emit("summary-delta", { attemptCount, delta });
    },
  );

  emit("summary-complete", { attemptCount });
  emit("review-start", { attemptCount });
  emit("status", {
    stage: "reviewing",
    attemptCount,
    message: `正在校验第 ${attemptCount} 次总结...`,
  });

  const reviewResult = await reviewSummaryMarkdown({
    coverageSnapshot: summaryPlan.coverageSnapshot,
    chunkSummaries: summaryPlan.chunkSummaries,
    relativePath: options.relativePath,
    title: options.title,
    summaryBody: attemptSummaryBody,
    model: options.reviewModel,
  });

  emit("review-result", {
    attemptCount,
    passed: reviewResult.passed,
    feedback: reviewResult.feedback,
    issues: reviewResult.issues,
    details: reviewResult.details,
  });

  if (reviewResult.passed) {
    emit("status", {
      stage: "completed",
      attemptCount,
      message: `第 ${attemptCount} 次通过校验。`,
    });
    emit("result", {
      summaryContent: composeSummaryDocument(attemptSummaryBody, options.title),
      attemptCount,
      reviewPassed: true,
      reviewMessage: reviewResult.feedback,
      reviewIssues: reviewResult.issues,
      reviewDetails: reviewResult.details,
    });
  }
}

export async function buildSummaryPlan(
  options: SummaryAttemptOptions,
  hooks?: SummaryPlanHooks,
): Promise<SummaryPlan> {
  const normalizedBody = normalizeArticleSource(options.body);
  const chunks = splitArticleIntoChunks(normalizedBody);
  const coverageSnapshot = await extractSummaryCoverageSnapshot({
    body: normalizedBody,
    relativePath: options.relativePath,
    title: options.title,
    model: options.reviewModel ?? options.model,
  });
  hooks?.onCoverageExtracted?.(coverageSnapshot, chunks.length);

  const chunkSummaries = [];

  for (const chunk of chunks) {
    hooks?.onChunkStart?.(chunk.chunkIndex, chunks.length);
    const summary = await summarizeChunkMarkdown({
      chunk,
      chunkCount: chunks.length,
      coverageSnapshot,
      relativePath: options.relativePath,
      title: options.title,
      model: options.model,
    });
    chunkSummaries.push({
      chunkIndex: chunk.chunkIndex,
      heading: chunk.heading,
      summary,
    });
    hooks?.onChunkComplete?.(chunk.chunkIndex, chunks.length);
  }

  return {
    normalizedBody,
    coverageSnapshot,
    chunkSummaries,
  };
}

async function generateFinalSummaryMarkdown(options: {
  relativePath: string;
  title: string;
  model: DocSummaryModel;
  coverageSnapshot: SummaryCoverageSnapshot;
  chunkSummaries: SummaryPlan["chunkSummaries"];
  reviewFeedback?: string;
  previousSummaryContent?: string;
  previousReviewDetails?: SummaryAttemptOptions["previousReviewDetails"];
  attemptCount?: number;
}) {
  return callCursorChat({
    model: options.model,
    relativePath: options.relativePath,
    prompt: buildSummaryPrompt(options),
    emptyContentError: "Summary generation returned empty content.",
    failureMessage: "Summary generation failed.",
  });
}

async function streamFinalSummaryMarkdown(
  options: {
    relativePath: string;
    title: string;
    model: DocSummaryModel;
    coverageSnapshot: SummaryCoverageSnapshot;
    chunkSummaries: SummaryPlan["chunkSummaries"];
    reviewFeedback?: string;
    previousSummaryContent?: string;
    previousReviewDetails?: SummaryAttemptOptions["previousReviewDetails"];
    attemptCount?: number;
  },
  onDelta: (delta: string) => void,
) {
  return streamCursorChat(
    {
      model: options.model,
      relativePath: options.relativePath,
      prompt: buildSummaryPrompt(options),
      emptyContentError: "Summary generation returned empty content.",
      failureMessage: "Summary generation failed.",
    },
    onDelta,
  );
}

async function reviewSummaryMarkdown(options: {
  coverageSnapshot: SummaryCoverageSnapshot;
  chunkSummaries: SummaryPlan["chunkSummaries"];
  relativePath: string;
  title: string;
  summaryBody: string;
  model: DocSummaryModel;
}) {
  const content = await callCursorChat({
    model: options.model,
    relativePath: options.relativePath,
    prompt: buildSummaryReviewPrompt(options),
    emptyContentError: "Summary review returned empty content.",
    failureMessage: "Summary review failed.",
  });

  const reviewResult = parseSummaryReviewResult(content);

  if (!reviewResult) {
    throw new Error("Summary review returned invalid JSON.");
  }

  return reviewResult;
}

async function extractSummaryCoverageSnapshot(options: {
  body: string;
  relativePath: string;
  title: string;
  model: DocSummaryModel;
}) {
  const content = await callCursorChat({
    model: options.model,
    relativePath: options.relativePath,
    prompt: buildCoverageExtractionPrompt(options),
    emptyContentError: "Summary coverage extraction returned empty content.",
    failureMessage: "Summary coverage extraction failed.",
  });
  const snapshot = parseCoverageSnapshot(content);

  if (!snapshot) {
    throw new Error("Summary coverage extraction returned invalid JSON.");
  }

  return snapshot;
}

async function summarizeChunkMarkdown(options: {
  chunk: SummaryChunk;
  chunkCount: number;
  coverageSnapshot: SummaryCoverageSnapshot;
  relativePath: string;
  title: string;
  model: DocSummaryModel;
}) {
  return callCursorChat({
    model: options.model,
    relativePath: options.relativePath,
    prompt: buildChunkSummaryPrompt(options),
    emptyContentError: "Chunk summary generation returned empty content.",
    failureMessage: "Chunk summary generation failed.",
  });
}

function normalizeArticleSource(body: string) {
  return body
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function splitArticleIntoChunks(body: string) {
  const blocks = splitArticleIntoBlocks(body);
  const chunks: SummaryChunk[] = [];
  let currentHeading = "";
  let currentLength = 0;
  let currentParts: string[] = [];

  const pushChunk = () => {
    const content = currentParts.join("\n\n").trim();

    if (!content) {
      currentParts = [];
      currentLength = 0;
      return;
    }

    chunks.push({
      chunkIndex: chunks.length + 1,
      heading: currentHeading,
      content,
    });
    currentParts = [];
    currentLength = 0;
  };

  for (const block of blocks) {
    if (
      currentParts.length > 0 &&
      currentLength + block.length > SUMMARY_CHUNK_SOFT_LIMIT
    ) {
      pushChunk();
    }

    currentParts.push(block);
    currentLength += block.length;

    if (looksLikeHeading(block)) {
      currentHeading = block.replace(/^#+\s*/, "").trim();
    }

    if (currentLength >= SUMMARY_CHUNK_TARGET_SIZE) {
      pushChunk();
    }
  }

  pushChunk();

  return chunks.length > 0
    ? chunks
    : [
        {
          chunkIndex: 1,
          heading: "",
          content: body,
        },
      ];
}

function splitArticleIntoBlocks(body: string) {
  const paragraphs = body.split(/\n{2,}/).map((paragraph) => paragraph.trim());
  const blocks: string[] = [];
  let codeFenceOpen = false;
  let currentCodeBlock: string[] = [];

  for (const paragraph of paragraphs) {
    if (!paragraph) {
      continue;
    }

    if (paragraph.startsWith("```")) {
      codeFenceOpen = !codeFenceOpen;
      currentCodeBlock.push(paragraph);

      if (!codeFenceOpen) {
        blocks.push(currentCodeBlock.join("\n\n"));
        currentCodeBlock = [];
      }

      continue;
    }

    if (codeFenceOpen) {
      currentCodeBlock.push(paragraph);
      continue;
    }

    if (paragraph.length > SUMMARY_CHUNK_SOFT_LIMIT) {
      blocks.push(...splitOversizedBlock(paragraph));
      continue;
    }

    blocks.push(paragraph);
  }

  if (currentCodeBlock.length > 0) {
    blocks.push(currentCodeBlock.join("\n\n"));
  }

  return blocks;
}

function splitOversizedBlock(block: string) {
  const segments: string[] = [];
  let remaining = block.trim();

  while (remaining.length > SUMMARY_CHUNK_SOFT_LIMIT) {
    const slice = remaining.slice(0, SUMMARY_CHUNK_TARGET_SIZE);
    const breakpoints = [
      slice.lastIndexOf("\n- "),
      slice.lastIndexOf("\n1. "),
      slice.lastIndexOf("\n"),
      slice.lastIndexOf("。"),
      slice.lastIndexOf("；"),
      slice.lastIndexOf("，"),
      slice.lastIndexOf(" "),
    ].filter((index) => index > SUMMARY_CHUNK_TARGET_SIZE * 0.5);

    const breakpoint =
      breakpoints.length > 0
        ? Math.max(...breakpoints)
        : SUMMARY_CHUNK_TARGET_SIZE;
    const segment = remaining.slice(0, breakpoint + 1).trim();

    if (!segment) {
      break;
    }

    segments.push(segment);
    remaining = remaining.slice(breakpoint + 1).trim();
  }

  if (remaining) {
    segments.push(remaining);
  }

  return segments;
}

function looksLikeHeading(block: string) {
  if (/^#{1,6}\s+.+/.test(block)) {
    return true;
  }

  const firstLine = block.split(/\r?\n/)[0]?.trim() ?? "";

  return (
    firstLine.length > 0 &&
    firstLine.length <= 60 &&
    !/[。！？：；,，]/.test(firstLine)
  );
}
