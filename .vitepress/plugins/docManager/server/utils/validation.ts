import {
  DEFAULT_DOC_REVIEW_MODEL,
  DEFAULT_DOC_SUMMARY_MODEL,
  DOC_SUMMARY_MODELS,
  type DocSummaryModel,
} from "../../shared";

export function validateSummaryModel(input: unknown): DocSummaryModel {
  if (
    typeof input === "string" &&
    (DOC_SUMMARY_MODELS as readonly string[]).includes(input)
  ) {
    return input as DocSummaryModel;
  }

  return DEFAULT_DOC_SUMMARY_MODEL;
}

export function validateReviewModel(input: unknown): DocSummaryModel {
  if (
    typeof input === "string" &&
    (DOC_SUMMARY_MODELS as readonly string[]).includes(input)
  ) {
    return input as DocSummaryModel;
  }

  return DEFAULT_DOC_REVIEW_MODEL;
}

export function validateDirectoryName(name: string) {
  if (!name) {
    return "Category name is required.";
  }

  if (name === "." || name === "..") {
    return "Category name is invalid.";
  }

  if (/[\\/]/.test(name)) {
    return "Only top-level categories are supported.";
  }

  if (/[:*?\"<>|]/.test(name)) {
    return "Category name contains unsupported characters.";
  }

  return null;
}
