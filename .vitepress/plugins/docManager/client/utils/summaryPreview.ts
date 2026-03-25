import type { SummaryReviewDetails } from "../../shared";
import type { SummaryStreamEvent } from "../../shared/types";

export function parseSummaryStreamEvent(
  eventText: string,
): SummaryStreamEvent | null {
  const lines = eventText.split(/\r?\n/);
  let eventName = "message";
  const dataLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith("event:")) {
      eventName = line.slice(6).trim();
      continue;
    }

    if (line.startsWith("data:")) {
      dataLines.push(line.slice(5).trim());
    }
  }

  if (dataLines.length === 0) {
    return null;
  }

  try {
    return {
      event: eventName,
      data: JSON.parse(dataLines.join("\n")) as Record<string, unknown>,
    } as SummaryStreamEvent;
  } catch {
    return null;
  }
}

export function normalizeReviewDetails(
  details: SummaryReviewDetails | undefined,
): SummaryReviewDetails | undefined {
  if (!details) {
    return undefined;
  }

  return {
    missingSections: normalizeStringArray(details.missingSections),
    missingLinks: normalizeStringArray(details.missingLinks),
    missingImages: normalizeStringArray(details.missingImages),
    missingConcepts: normalizeStringArray(details.missingConcepts),
    missingConstraints: normalizeStringArray(details.missingConstraints),
  };
}

export function buildReviewStatusMessage(options: {
  attemptCount?: number;
  passed: boolean;
  feedback?: string;
  issues: string[];
}) {
  const segments: string[] = [];

  if (typeof options.attemptCount === "number") {
    segments.push(
      options.passed
        ? `第 ${options.attemptCount} 次通过校验`
        : `第 ${options.attemptCount} 次未通过校验`,
    );
  }

  if (options.feedback) {
    segments.push(options.feedback);
  }

  if (options.issues.length > 0) {
    segments.push(options.issues.join("；"));
  }

  return segments.join(" · ");
}

export function buildSummaryStatusMessage(options: {
  attemptCount?: number;
  reviewPassed?: boolean;
  reviewMessage?: string;
}) {
  const segments: string[] = [];

  if (typeof options.attemptCount === "number" && options.attemptCount > 0) {
    segments.push(`第 ${options.attemptCount} 次通过校验`);
  }

  if (options.reviewPassed && options.reviewMessage) {
    segments.push(options.reviewMessage);
  }

  return segments.join(" · ");
}

export function buildReviewFailureMessage(options: {
  attemptCount?: number;
  feedback?: string;
  issues: string[];
  details?: SummaryReviewDetails;
}) {
  const segments: string[] = [];

  if (typeof options.attemptCount === "number") {
    segments.push(`第 ${options.attemptCount} 次校验未通过`);
  }

  if (options.feedback) {
    segments.push(options.feedback);
  }

  if (options.issues.length > 0) {
    segments.push(`问题：${options.issues.join("；")}`);
  }

  const detailSegments = buildReviewDetailSegments(options.details);

  if (detailSegments.length > 0) {
    segments.push(detailSegments.join("；"));
  }

  return segments.join(" · ");
}

export function buildReviewRetryFeedback(options: {
  feedback?: string;
  issues: string[];
  details?: SummaryReviewDetails;
}) {
  const segments = [options.feedback?.trim() ?? ""];

  if (options.issues.length > 0) {
    segments.push(
      "具体问题：\n" + options.issues.map((issue) => `- ${issue}`).join("\n"),
    );
  }

  const detailSegments = buildReviewDetailSegments(options.details);

  if (detailSegments.length > 0) {
    segments.push(
      "缺失清单：\n" +
        detailSegments.map((segment) => `- ${segment}`).join("\n"),
    );
  }

  return segments.filter(Boolean).join("\n\n");
}

function buildReviewDetailSegments(details: SummaryReviewDetails | undefined) {
  if (!details) {
    return [];
  }

  const segments: string[] = [];

  if (details.missingSections.length > 0) {
    segments.push(`遗漏章节：${details.missingSections.join("；")}`);
  }

  if (details.missingLinks.length > 0) {
    segments.push(`遗漏链接：${details.missingLinks.join("；")}`);
  }

  if (details.missingImages.length > 0) {
    segments.push(`遗漏图片：${details.missingImages.join("；")}`);
  }

  if (details.missingConcepts.length > 0) {
    segments.push(`遗漏概念：${details.missingConcepts.join("；")}`);
  }

  if (details.missingConstraints.length > 0) {
    segments.push(`遗漏限制：${details.missingConstraints.join("；")}`);
  }

  return segments;
}

function normalizeStringArray(value: string[] | undefined) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}
