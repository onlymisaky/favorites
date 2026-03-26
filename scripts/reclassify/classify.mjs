import fs from "node:fs/promises";
import path from "node:path";
import { FAILED_JSON_DEBUG_DIR } from "./config.mjs";
import { callCursorChat } from "./cursor-chat.mjs";
import {
  createDecisionBase,
  createErrorDecision,
  createInvalidDecision,
  createKeepDecision,
  createMoveDecision,
} from "./result-file.mjs";
import { extractJsonObject, normalizeConfidence, sanitizeCategoryName } from "./utils/common.mjs";
import { ensureDirectory, getTopLevelDirectoryName } from "./utils/path.mjs";

export async function classifyBatchByTitle(options) {
  const batchInputs = createBatchInputs(options.batchFiles);
  const prompt = buildBatchClassificationPrompt({
    batchInputs,
    categories: options.categories,
    includeNewCategories: options.includeNewCategories,
  });
  const content = await callCursorChat({
    model: options.model,
    relativePath: options.batchFiles[0],
    prompt,
    emptyContentError: "批量分类结果为空。",
    failureMessage: "批量分类请求失败。",
  });
  const parsed = parseBatchClassificationResult(content);

  if (!parsed.ok) {
    await writeFailedBatchJsonSample({
      batchFiles: options.batchFiles,
      content,
      debugDir: options.debugDir,
      diagnostic: parsed.diagnostic,
      candidateJson: parsed.candidateJson,
    });
    throw new Error(`无法解析 AI 返回的批量分类 JSON。${parsed.diagnostic}`);
  }

  return parsed.results;
}

export function createBatchInputs(batchFiles) {
  return batchFiles.map((relativePath, index) => ({
    id: index + 1,
    relativePath,
    currentCategory: getTopLevelDirectoryName(relativePath),
    fileName: path.posix.basename(relativePath),
  }));
}

export function buildBatchClassificationPrompt(options) {
  const existingCategories = options.categories.map((item) => `- ${item}`).join("\n");
  const batchInputJson = JSON.stringify(options.batchInputs, null, 2);
  const newCategoryRule = options.includeNewCategories
    ? "如果现有分类都不合适，可以提出新的顶层分类名；新分类名必须简洁、通用、适合作为长期目录名。"
    : "只能从现有分类中选择，不允许输出新分类。";

  return [
    "你在帮助维护一个 VitePress 文档目录。",
    "任务：对一批 Markdown 文档只根据文件名进行顶层分类判断。",
    "禁止读取、推断或依赖正文内容；如果文件名信息不足，只能基于文件名做最稳妥判断。",
    "请覆盖输入中的每一个 id，并且每个 id 只输出一次。",
    "",
    "现有顶层分类：",
    existingCategories,
    "",
    newCategoryRule,
    "请优先复用已有分类，只有在明显不适合时才创建新分类。",
    "reason 必须简短说明为什么这个标题属于该分类，不要复述原始标题，不要直接引用标题中的引号内容。",
    "confidence 输出 0 到 1 之间的小数。",
    "relativePath 仅作为输入参考。输出时优先使用 id，不要手写或复述 relativePath。",
    "如果你确实输出字符串字段，必须保证是合法 JSON 字符串，内部双引号必须写成 \\\"。",
    "",
    "错误示例：",
    '{"id":1,"reason":"文件名提到"后台管理模板"","confidence":0.8}',
    "正确示例：",
    '{"id":1,"reason":"标题明确提到后台管理模板","confidence":0.8}',
    "",
    "待分类文件列表(JSON)：",
    batchInputJson,
    "",
    '只输出 JSON，不要解释，不要 Markdown。推荐格式：{"results":[{"id":1,"targetCategory":"string","reason":"string","confidence":0.0}]}。兼容格式：{"results":[{"relativePath":"string","targetCategory":"string","reason":"string","confidence":0.0}]}',
  ].join("\n");
}

export function parseBatchClassificationResult(content) {
  const trimmed = content.trim();
  const directParsed = tryParseBatchClassificationRoot(trimmed);

  if (directParsed.ok) {
    return directParsed;
  }

  const fencedJson = extractJsonObject(trimmed);
  const fencedCandidate = fencedJson || "";

  if (fencedCandidate) {
    const fencedParsed = tryParseBatchClassificationRoot(fencedCandidate);

    if (fencedParsed.ok) {
      return {
        ...fencedParsed,
        candidateJson: fencedCandidate,
      };
    }
  }

  const candidateJson = fencedCandidate || trimmed;
  const repairedJson = repairBatchClassificationJson(candidateJson);

  if (repairedJson && repairedJson !== candidateJson) {
    const repairedParsed = tryParseBatchClassificationRoot(repairedJson);

    if (repairedParsed.ok) {
      return {
        ...repairedParsed,
        candidateJson,
        diagnostic: fencedCandidate
          ? " fenced JSON 解析失败，但自动修复后成功。"
          : " 直接解析失败，但自动修复了未转义引号。",
      };
    }

    return {
      ok: false,
      diagnostic:
        fencedCandidate
          ? ` fenced JSON 自动修复后仍解析失败。${repairedParsed.diagnostic}`
          : ` 自动修复后仍解析失败。${repairedParsed.diagnostic}`,
      candidateJson,
    };
  }

  return {
    ok: false,
    diagnostic: fencedCandidate
      ? ` fenced JSON 解析失败。${tryParseBatchClassificationRoot(fencedCandidate).diagnostic}`
      : directParsed.diagnostic,
    candidateJson,
  };
}

export function normalizeBatchResults(options) {
  const decisions = [];
  const resultsByPath = buildBatchResultMap(options.batchFiles, options.batchResults);

  // 模型输出不一定严格遵守约束，这里统一补齐缺项、过滤批外 id/路径、拦截重复项。
  for (const relativePath of options.batchFiles) {
    const rawResult = resultsByPath.get(relativePath);

    if (!rawResult) {
      decisions.push(createErrorDecision(relativePath, "AI 未返回该文件的分类结果。"));
      continue;
    }

    if (rawResult.status === "error") {
      decisions.push(rawResult);
      continue;
    }

    decisions.push(
      createDecisionFromBatchResult({
        categories: options.categories,
        includeNewCategories: options.includeNewCategories,
        rawResult,
        relativePath,
      }),
    );
  }

  return decisions;
}

export function buildBatchResultMap(batchFiles, batchResults) {
  const indexedBatchFiles = createBatchInputs(batchFiles);
  const batchFileSet = new Set(batchFiles);
  const idToPath = new Map(indexedBatchFiles.map((item) => [item.id, item.relativePath]));
  const seenPaths = new Set();
  const resultsByPath = new Map();

  for (const item of batchResults) {
    const matchedPath = resolveBatchResultPath(item, batchFileSet, idToPath);

    if (!matchedPath) {
      continue;
    }

    if (seenPaths.has(matchedPath)) {
      resultsByPath.set(
        matchedPath,
        createErrorDecision(matchedPath, "AI 返回了重复的 id 或 relativePath。"),
      );
      continue;
    }

    seenPaths.add(matchedPath);
    resultsByPath.set(matchedPath, {
      ...item,
      relativePath: matchedPath,
    });
  }

  return resultsByPath;
}

export function resolveBatchResultPath(item, batchFileSet, idToPath) {
  if (typeof item.id === "number" && Number.isInteger(item.id)) {
    return idToPath.get(item.id) ?? "";
  }

  if (item.relativePath && batchFileSet.has(item.relativePath)) {
    return item.relativePath;
  }

  return "";
}

export function createDecisionFromBatchResult(options) {
  const baseDecision = createDecisionBase(options.relativePath);
  const targetCategory = sanitizeCategoryName(options.rawResult.targetCategory);
  const confidence = normalizeConfidence(options.rawResult.confidence);
  const aiReason = options.rawResult.reason;

  if (!targetCategory) {
    return createInvalidDecision(baseDecision, {
      reason: "AI 返回了空分类或非法分类名。",
      aiReason,
      confidence,
      targetCategory: options.rawResult.targetCategory ?? "",
    });
  }

  const isNewCategory = !options.categories.includes(targetCategory);

  if (isNewCategory && !options.includeNewCategories) {
    return createInvalidDecision(baseDecision, {
      reason: `AI 返回了新分类 "${targetCategory}"，但当前配置不允许创建新分类。`,
      aiReason,
      confidence,
      targetCategory,
    });
  }

  if (targetCategory === baseDecision.currentCategory) {
    return createKeepDecision(baseDecision, {
      aiReason,
      confidence,
      targetCategory,
      isNewCategory,
    });
  }

  return createMoveDecision(baseDecision, {
    aiReason,
    confidence,
    targetCategory,
    isNewCategory,
  });
}

export function createBatchFailureDecisions(batchFiles, reason) {
  return batchFiles.map((relativePath) => createErrorDecision(relativePath, reason));
}

export function tryParseBatchClassificationRoot(content) {
  try {
    const parsed = JSON.parse(content);

    return {
      ok: true,
      results: normalizeParsedBatchItems(parsed),
      candidateJson: "",
      diagnostic: "",
    };
  } catch (error) {
    return {
      ok: false,
      diagnostic: ` 直接解析失败: ${error instanceof Error ? error.message : "unknown error"}`,
      candidateJson: "",
    };
  }
}

export function normalizeParsedBatchItems(parsed) {
  const items = Array.isArray(parsed)
    ? parsed
    : parsed && typeof parsed === "object" && Array.isArray(parsed.results)
      ? parsed.results
      : null;

  if (!items) {
    throw new Error('JSON 根结构无效，期望 {"results":[...]} 或数组。');
  }

  return items.map((item) => ({
    id: Number.isInteger(item.id) ? item.id : null,
    relativePath: typeof item.relativePath === "string" ? item.relativePath.trim() : "",
    targetCategory:
      typeof item.targetCategory === "string" ? item.targetCategory.trim() : "",
    reason: typeof item.reason === "string" ? item.reason.trim() : "",
    confidence: item.confidence,
  }));
}

export function repairBatchClassificationJson(content) {
  const fieldNames = new Set(["relativePath", "reason"]);
  let repaired = "";
  let inString = false;
  let isEscaped = false;
  let activeField = "";
  let stringRole = "";
  let tokenBuffer = "";

  for (let index = 0; index < content.length; index += 1) {
    const char = content[index];

    if (!inString) {
      repaired += char;

      if (char === "\"") {
        inString = true;
        isEscaped = false;
        stringRole = classifyJsonStringRole(content, index);
        tokenBuffer = "";
      }

      continue;
    }

    if (isEscaped) {
      repaired += char;
      tokenBuffer += char;
      isEscaped = false;
      continue;
    }

    if (char === "\\") {
      repaired += char;
      tokenBuffer += char;
      isEscaped = true;
      continue;
    }

    if (char !== "\"") {
      repaired += char;
      tokenBuffer += char;
      continue;
    }

    const previousNonWhitespace = findPreviousNonWhitespaceChar(content, index);
    const nextNonWhitespace = findNextNonWhitespaceChar(content, index);

    if (stringRole === "value") {
      if (
        fieldNames.has(activeField) &&
        nextNonWhitespace &&
        nextNonWhitespace !== "," &&
        nextNonWhitespace !== "}" &&
        nextNonWhitespace !== "]"
      ) {
        repaired += "\\\"";
        tokenBuffer += "\"";
        continue;
      }

      inString = false;
      repaired += char;
      tokenBuffer = "";
      stringRole = "";
      continue;
    }

    if (stringRole === "key") {
      inString = false;
      activeField = tokenBuffer;
      repaired += char;
      tokenBuffer = "";
      stringRole = "";
      continue;
    }

    inString = false;
    repaired += char;
    tokenBuffer = "";
    stringRole = "";
  }

  return repaired;
}

export function classifyJsonStringRole(content, index) {
  const previousNonWhitespace = findPreviousNonWhitespaceChar(content, index);

  if (previousNonWhitespace === ":") {
    return "value";
  }

  if (previousNonWhitespace === "{" || previousNonWhitespace === ",") {
    return "key";
  }

  return "";
}

export function findPreviousNonWhitespaceChar(content, index) {
  for (let cursor = index - 1; cursor >= 0; cursor -= 1) {
    const char = content[cursor];

    if (!/\s/u.test(char)) {
      return char;
    }
  }

  return "";
}

export function findNextNonWhitespaceChar(content, index) {
  for (let cursor = index + 1; cursor < content.length; cursor += 1) {
    const char = content[cursor];

    if (!/\s/u.test(char)) {
      return char;
    }
  }

  return "";
}

export async function writeFailedBatchJsonSample(options) {
  const debugDir = options.debugDir || FAILED_JSON_DEBUG_DIR;
  const safeName = createBatchDebugFileName(options.batchFiles);
  const debugPath = path.join(debugDir, safeName);
  const payload = [
    `generatedAt: ${new Date().toISOString()}`,
    `diagnostic: ${options.diagnostic.trim() || "(empty)"}`,
    "",
    "=== batchFiles ===",
    options.batchFiles.join("\n"),
    "",
    "=== candidateJson ===",
    options.candidateJson || "(none)",
    "",
    "=== rawContent ===",
    options.content,
    "",
  ].join("\n");

  await ensureDirectory(debugDir);
  await fs.writeFile(debugPath, payload, "utf-8");
}

export function createBatchDebugFileName(batchFiles) {
  const firstFile = batchFiles[0] || "unknown";
  const baseName = path.posix.basename(firstFile, path.posix.extname(firstFile));
  const safeBaseName = baseName.replace(/[^\p{L}\p{N}._-]+/gu, "_").slice(0, 80) || "unknown";

  return `${Date.now()}-${safeBaseName}.txt`;
}
