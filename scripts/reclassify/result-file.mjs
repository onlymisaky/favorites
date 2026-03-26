import fs from "node:fs/promises";
import path from "node:path";
import { DOCS_ROOT_NAME, RESULT_FORMAT_VERSION } from "./config.mjs";
import { getTopLevelDirectoryName, ensureDirectory } from "./utils/path.mjs";

export function createResultPayload(options) {
  const summary = summarizeDecisions(options.decisions);

  return {
    formatVersion: RESULT_FORMAT_VERSION,
    generatedAt: new Date().toISOString(),
    docsRoot: DOCS_ROOT_NAME,
    targetDir: options.targetDir,
    model: options.args.model,
    batchSize: options.args.batchSize,
    includeNewCategories: options.args.includeNewCategories,
    totalFiles: options.totalFiles,
    selectedFileCount: options.selectedFileCount,
    categories: options.categories,
    summary,
    decisions: options.decisions,
  };
}

// preview 的结果文件既是审阅材料，也是 apply 阶段的唯一输入来源。
export async function writeResultFile(resultFilePath, payload) {
  await ensureDirectory(path.dirname(resultFilePath));
  await fs.writeFile(resultFilePath, `${JSON.stringify(payload, null, 2)}\n`, "utf-8");
}

export async function readResultFile(resultFilePath) {
  let content = "";

  try {
    content = await fs.readFile(resultFilePath, "utf-8");
  } catch {
    throw new Error(`找不到结果文件: ${resultFilePath}。请先运行 preview。`);
  }

  let parsed = null;

  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error(`结果文件不是有效 JSON: ${resultFilePath}`);
  }

  if (
    !parsed ||
    typeof parsed !== "object" ||
    parsed.formatVersion !== RESULT_FORMAT_VERSION
  ) {
    throw new Error(`结果文件版本不匹配: ${resultFilePath}`);
  }

  return parsed;
}

export function summarizeDecisions(decisions) {
  const summary = {
    move: 0,
    keep: 0,
    invalid: 0,
    error: 0,
    newCategories: [],
  };

  for (const decision of decisions) {
    switch (decision.status) {
      case "move":
        summary.move += 1;

        if (
          decision.isNewCategory &&
          decision.targetCategory &&
          !summary.newCategories.includes(decision.targetCategory)
        ) {
          summary.newCategories.push(decision.targetCategory);
        }
        break;
      case "keep":
        summary.keep += 1;
        break;
      case "invalid":
        summary.invalid += 1;
        break;
      default:
        summary.error += 1;
        break;
    }
  }

  summary.newCategories.sort((left, right) => left.localeCompare(right, "zh-Hans-CN"));
  return summary;
}

export function createDecisionBase(relativePath) {
  return {
    relativePath,
    fileName: path.posix.basename(relativePath),
    currentCategory: getTopLevelDirectoryName(relativePath),
  };
}

export function createErrorDecision(relativePath, reason) {
  return {
    ...createDecisionBase(relativePath),
    status: "error",
    reason,
    aiReason: "",
    confidence: null,
    targetCategory: "",
  };
}

export function createInvalidDecision(baseDecision, options) {
  return {
    ...baseDecision,
    status: "invalid",
    reason: options.reason,
    aiReason: options.aiReason,
    confidence: options.confidence,
    targetCategory: options.targetCategory,
  };
}

export function createKeepDecision(baseDecision, options) {
  return {
    ...baseDecision,
    status: "keep",
    reason: "AI 判断当前分类已合适。",
    aiReason: options.aiReason,
    confidence: options.confidence,
    targetCategory: options.targetCategory,
    isNewCategory: options.isNewCategory,
  };
}

export function createMoveDecision(baseDecision, options) {
  return {
    ...baseDecision,
    status: "move",
    reason: "AI 建议移动到新分类。",
    aiReason: options.aiReason,
    confidence: options.confidence,
    targetCategory: options.targetCategory,
    isNewCategory: options.isNewCategory,
  };
}

export function printPreview(options) {
  console.log("\n=== 预览结果 ===");
  console.log(`总数: ${options.decisions.length}`);
  console.log(`目录范围: ${options.targetDir ?? "(all)"}`);
  console.log(`建议移动: ${options.summary.move}`);
  console.log(`保持原位: ${options.summary.keep}`);
  console.log(`无效结果: ${options.summary.invalid}`);
  console.log(`请求失败: ${options.summary.error}`);
  console.log(`结果文件: ${options.resultFilePath}`);

  if (options.summary.newCategories.length > 0) {
    console.log(`新分类: ${options.summary.newCategories.join(", ")}`);
  }

  const errorDecisions = options.decisions.filter(
    (decision) => decision.status === "error" || decision.status === "invalid",
  );
  const moveDecisions = options.decisions.filter(
    (decision) => decision.status === "move",
  );

  if (errorDecisions.length > 0) {
    console.log("\n=== 失败项 ===");

    for (const decision of errorDecisions) {
      console.log(`[${decision.status.toUpperCase()}] ${decision.relativePath}`);
      console.log(`  reason: ${decision.reason}`);
    }
  }

  if (moveDecisions.length > 0) {
    console.log("\n=== 待移动 ===");

    for (const decision of moveDecisions) {
      const confidenceText =
        typeof decision.confidence === "number"
          ? ` | confidence=${decision.confidence}`
          : "";
      console.log(
        `${decision.relativePath} -> ${decision.targetCategory}/${decision.fileName}${confidenceText}`,
      );
      if (decision.aiReason) {
        console.log(`  reason: ${decision.aiReason}`);
      }
    }
  }
}
