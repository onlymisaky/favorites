export const DOCS_ROOT_NAME = "wechat";
export const RESULT_FORMAT_VERSION = 1;
export const DEFAULT_MODEL = "anthropic/claude-sonnet-4.6";
export const DEFAULT_BATCH_SIZE = 50;
export const DEFAULT_RESULT_FILE =
  "scripts/.cache/reclassify-wechat-by-title.result.json";
export const FAILED_JSON_DEBUG_DIR = "scripts/.cache/reclassify/failed-json";
export const DOC_SUMMARY_MODELS = [
  "openai/gpt-5.1-codex-mini",
  "anthropic/claude-sonnet-4.6",
  "google/gemini-3-flash",
];
export const CURSOR_CHAT_URL = "https://cursor.com/api/chat";
export const DEFAULT_CURSOR_COOKIE =
  "IndrX2ZuSmZramJSX0NIYUZoRzRzUGZ0cENIVHpHNXk0VE0ya2ZiUkVzQU14X2Fub255bW91c1VzZXJJZCI%3D=ImI5M2IyNzg1LWJiZmMtNGE5My04YzRkLWQ4NWNiYWRlNTFiOCI=; ph_phc_TXdpocbGVeZVm5VJmAsHTMrCofBQu3e0kN8HGMNGTVW_posthog=%7B%22distinct_id%22%3A%220191db79-dfc5-7771-b6a9-b654777830b3%22%2C%22%24sesid%22%3A%5B1760085676769%2C%220199cd48-12b5-7195-80f4-c36dccf66529%22%2C1760085676725%5D%7D; htjs_anonymous_id=5c714ccd-db77-44a1-97f5-38e48cc308e3; htjs_sesh={%22id%22:1760085677619%2C%22expiresAt%22:1760087477619%2C%22timeout%22:1800000%2C%22sessionStart%22:true%2C%22autoTrack%22:true}; muxData==undefined&mux_viewer_id=f95b568f-6404-411d-9a29-03b857d1929c&msn=0.6395640329292229&sid=ef2c9898-67b4-4658-a768-953c57d1929f&sst=1762409943711&sex=1762411449706; __stripe_mid=7995652d-210b-4858-b920-c41dc0ed33c3b1aa55; cursor_anonymous_id=92c6cb8f-7129-4207-92f4-2639d925d8c0; logoCountry=US; generaltranslation.referrer-locale=en-US; statsig_stable_id=40d8bf9c-e206-49dc-8a3e-1e2df7ae89af; generaltranslation.locale-routing-enabled=true";
