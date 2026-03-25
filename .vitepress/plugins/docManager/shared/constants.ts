export const DOC_MANAGER_BASE = "/__doc-manager__";
export const DOC_MANAGER_FALLBACK_PATH = "/-not-classified/";
export const DEFAULT_DOC_SUMMARY_MODEL = "anthropic/claude-sonnet-4.6";
export const DEFAULT_DOC_REVIEW_MODEL = "openai/gpt-5.1-codex-mini";
export const DOC_SUMMARY_MODELS = [
  "openai/gpt-5.1-codex-mini",
  "anthropic/claude-sonnet-4.6",
  "google/gemini-3-flash",
] as const;
