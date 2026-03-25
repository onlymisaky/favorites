import type { SummaryReviewDetails } from "../../shared";
import type {
  SummaryCoverageSnapshot,
  SummaryReviewResult,
} from "../../shared/types";
import { normalizeGeneratedMarkdown } from "./document";

export function readStringList(value: unknown) {
  return Array.isArray(value)
    ? value.filter(
        (item): item is string =>
          typeof item === "string" && item.trim().length > 0,
      )
    : [];
}

export function parseSummaryReviewDetails(
  input: unknown,
): SummaryReviewDetails | undefined {
  if (!input || typeof input !== "object") {
    return undefined;
  }

  const record = input as Record<string, unknown>;

  return {
    missingSections: readStringList(record.missingSections),
    missingLinks: readStringList(record.missingLinks),
    missingImages: readStringList(record.missingImages),
    missingConcepts: readStringList(record.missingConcepts),
    missingConstraints: readStringList(record.missingConstraints),
  };
}

export function extractJsonObject(content: string) {
  const fencedMatch = content.match(/```(?:json)?\r?\n([\s\S]*?)\r?\n```/);

  if (fencedMatch) {
    return fencedMatch[1].trim();
  }

  const startIndex = content.indexOf("{");
  const endIndex = content.lastIndexOf("}");

  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    return "";
  }

  return content.slice(startIndex, endIndex + 1).trim();
}

export function parseCoverageSnapshot(content: string) {
  const normalizedContent = normalizeGeneratedMarkdown(content);
  const jsonText = extractJsonObject(normalizedContent);

  if (!jsonText) {
    return null;
  }

  try {
    const parsed = JSON.parse(jsonText) as Record<string, unknown>;
    return {
      sourceLinks: readStringList(parsed.sourceLinks),
      referenceLinks: readStringList(parsed.referenceLinks),
      importantImages: readStringList(parsed.importantImages),
      coreConcepts: readStringList(parsed.coreConcepts),
      keyConclusions: readStringList(parsed.keyConclusions),
      constraints: readStringList(parsed.constraints),
      codeBlocksSummary: readStringList(parsed.codeBlocksSummary),
    } satisfies SummaryCoverageSnapshot;
  } catch {
    return null;
  }
}

export function parseSummaryReviewResult(content: string) {
  const normalizedContent = normalizeGeneratedMarkdown(content);
  const jsonText = extractJsonObject(normalizedContent);

  if (!jsonText) {
    return null;
  }

  try {
    const parsed = JSON.parse(jsonText) as Record<string, unknown>;
    const issues = readStringList(parsed.issues);
    const feedback =
      typeof parsed.feedback === "string"
        ? parsed.feedback.trim()
        : issues.join("；");

    if (typeof parsed.passed !== "boolean") {
      return null;
    }

    return {
      passed: parsed.passed,
      feedback:
        feedback || (parsed.passed ? "摘要校验通过。" : "摘要校验未通过。"),
      issues,
      details: {
        missingSections: readStringList(parsed.missingSections),
        missingLinks: readStringList(parsed.missingLinks),
        missingImages: readStringList(parsed.missingImages),
        missingConcepts: readStringList(parsed.missingConcepts),
        missingConstraints: readStringList(parsed.missingConstraints),
      },
    } satisfies SummaryReviewResult;
  } catch {
    return null;
  }
}

export function getErrorMessageFromPayload(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return "";
  }

  const record = payload as Record<string, unknown>;

  if (typeof record.error === "string") {
    return record.error;
  }

  if (
    record.error &&
    typeof record.error === "object" &&
    typeof (record.error as Record<string, unknown>).message === "string"
  ) {
    return (record.error as Record<string, unknown>).message as string;
  }

  if (typeof record.message === "string" && record.type === "error") {
    return record.message;
  }

  return "";
}

export function extractSummaryContentFromPayload(payload: unknown): string {
  if (!payload) {
    return "";
  }

  if (typeof payload === "string") {
    return payload;
  }

  if (Array.isArray(payload)) {
    return payload
      .map((item) => extractSummaryContentFromPayload(item))
      .join("");
  }

  if (typeof payload !== "object") {
    return "";
  }

  const record = payload as Record<string, unknown>;
  const directTextKeys = [
    "text",
    "delta",
    "content",
    "completion",
    "response",
    "output_text",
  ];

  for (const key of directTextKeys) {
    if (typeof record[key] === "string") {
      return record[key] as string;
    }
  }

  const nestedKeys = [
    "message",
    "data",
    "chunk",
    "result",
    "delta",
    "content",
    "parts",
    "choices",
    "messages",
  ];

  for (const key of nestedKeys) {
    if (key in record) {
      const extracted = extractSummaryContentFromPayload(record[key]);

      if (extracted) {
        return extracted;
      }
    }
  }

  return "";
}
