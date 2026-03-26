import {
  DEFAULT_BATCH_SIZE,
  DEFAULT_MODEL,
  DEFAULT_RESULT_FILE,
  DOC_SUMMARY_MODELS,
} from "./config.mjs";
import {
  parseBoolean,
  parseNonNegativeInteger,
  parsePositiveInteger,
} from "./utils/common.mjs";

export function parseArgs(argv) {
  const args = createDefaultArgs();

  for (const arg of argv) {
    if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }

    if (!arg.startsWith("--")) {
      throw new Error(`无法识别的参数: ${arg}`);
    }

    const [rawKey, ...valueParts] = arg.slice(2).split("=");
    const key = rawKey.trim();
    const value = valueParts.join("=").trim();

    switch (key) {
      case "mode":
        args.mode = value || args.mode;
        break;
      case "model":
        args.model = value || args.model;
        break;
      case "dir":
        args.dir = value || "";
        break;
      case "limit":
        args.limit = parseNonNegativeInteger(value, "limit");
        break;
      case "batch-size":
        args.batchSize = parsePositiveInteger(value, "batch-size");
        break;
      case "include-new-categories":
        args.includeNewCategories = parseBoolean(value);
        break;
      case "result-file":
        args.resultFile = value || args.resultFile;
        break;
      default:
        throw new Error(`未知参数: --${key}`);
    }
  }

  return args;
}

export function createDefaultArgs() {
  return {
    mode: "preview",
    model: DEFAULT_MODEL,
    dir: "",
    limit: 0,
    includeNewCategories: true,
    batchSize: DEFAULT_BATCH_SIZE,
    resultFile: DEFAULT_RESULT_FILE,
  };
}

export function printHelp() {
  console.log(`根据 wechat 下文章文件名进行 AI 批量重归类。

用法:
  node scripts/reclassify-wechat-by-title.mjs [--mode=preview|apply] [--model=<model>] [--dir=<path>] [--limit=<n>] [--batch-size=<n>] [--include-new-categories=true|false] [--result-file=<path>]

示例:
  node scripts/reclassify-wechat-by-title.mjs
  node scripts/reclassify-wechat-by-title.mjs --mode=preview --dir=-not-classified
  node scripts/reclassify-wechat-by-title.mjs --mode=preview --batch-size=50 --limit=200
  node scripts/reclassify-wechat-by-title.mjs --mode=apply --dir=-not-classified

可选模型:
  ${DOC_SUMMARY_MODELS.join(", ")}

默认结果文件:
  ${DEFAULT_RESULT_FILE}
`);
}

export function validateMode(mode) {
  if (mode !== "preview" && mode !== "apply") {
    throw new Error(`mode 仅支持 preview 或 apply，收到: ${mode}`);
  }
}

export function validateModel(model) {
  if (!DOC_SUMMARY_MODELS.includes(model)) {
    throw new Error(`不支持的模型: ${model}`);
  }
}

export function validateBatchSize(batchSize) {
  if (!Number.isInteger(batchSize) || batchSize <= 0) {
    throw new Error(`batch-size 必须是正整数，收到: ${batchSize}`);
  }
}
