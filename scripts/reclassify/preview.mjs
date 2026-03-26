import path from "node:path";
import { classifyBatchByTitle, createBatchFailureDecisions, normalizeBatchResults } from "./classify.mjs";
import { chunkItems } from "./utils/common.mjs";
import { createResultPayload, printPreview, writeResultFile } from "./result-file.mjs";
import { listMarkdownFiles, listTopLevelCategories, resolveTargetDir } from "./scan.mjs";

export async function runPreview(options) {
  const scanContext = await collectPreviewScanContext(options);

  if (scanContext.selectedFiles.length === 0) {
    console.log("没有可处理的 Markdown 文件。");
    return;
  }

  printPreviewHeader({
    args: options.args,
    targetDir: scanContext.targetDir,
    selectedFileCount: scanContext.selectedFiles.length,
    totalFileCount: scanContext.markdownFiles.length,
  });

  const decisions = await classifyFilesInBatches({
    batchSize: options.args.batchSize,
    batchOptions: {
      categories: scanContext.categories,
      model: options.args.model,
      includeNewCategories: options.args.includeNewCategories,
    },
    selectedFiles: scanContext.selectedFiles,
  });
  const resultPayload = createResultPayload({
    args: options.args,
    categories: scanContext.categories,
    decisions,
    selectedFileCount: scanContext.selectedFiles.length,
    targetDir: scanContext.targetDir,
    totalFiles: scanContext.markdownFiles.length,
  });

  await writeResultFile(options.resultFilePath, resultPayload);
  printPreview({
    decisions,
    summary: resultPayload.summary,
    resultFilePath: options.resultFilePath,
    targetDir: scanContext.targetDir,
  });
}

export async function collectPreviewScanContext(options) {
  const targetDir = await resolveTargetDir(options.docsRoot, options.args.dir);
  const scanRoot = targetDir
    ? path.join(options.docsRoot, targetDir)
    : options.docsRoot;
  const categories = await listTopLevelCategories(options.docsRoot);
  const markdownFiles = await listMarkdownFiles(scanRoot, options.docsRoot);
  const selectedFiles =
    options.args.limit > 0
      ? markdownFiles.slice(0, options.args.limit)
      : markdownFiles;

  return {
    targetDir,
    scanRoot,
    categories,
    markdownFiles,
    selectedFiles,
  };
}

export function printPreviewHeader(options) {
  console.log(
    [
      "Mode: preview",
      `Model: ${options.args.model}`,
      `Files: ${options.selectedFileCount}/${options.totalFileCount}`,
      `Dir: ${options.targetDir ?? "(all)"}`,
      `Batch size: ${options.args.batchSize}`,
      `Include new categories: ${String(options.args.includeNewCategories)}`,
    ].join(" | "),
  );
}

export async function classifyFilesInBatches(options) {
  const batches = chunkItems(options.selectedFiles, options.batchSize);
  const decisions = [];

  for (let batchIndex = 0; batchIndex < batches.length; batchIndex += 1) {
    const batchFiles = batches[batchIndex];

    console.log(
      `[Batch ${batchIndex + 1}/${batches.length}] 分析 ${batchFiles.length} 篇文件名`,
    );

    decisions.push(
      ...(await classifySingleBatch({
        batchFiles,
        categories: options.batchOptions.categories,
        includeNewCategories: options.batchOptions.includeNewCategories,
        model: options.batchOptions.model,
      })),
    );
  }

  return decisions;
}

export async function classifySingleBatch(options) {
  try {
    const batchResults = await classifyBatchByTitle({
      batchFiles: options.batchFiles,
      categories: options.categories,
      model: options.model,
      includeNewCategories: options.includeNewCategories,
    });

    return normalizeBatchResults({
      batchFiles: options.batchFiles,
      batchResults,
      categories: options.categories,
      includeNewCategories: options.includeNewCategories,
    });
  } catch (error) {
    return createBatchFailureDecisions(
      options.batchFiles,
      error instanceof Error ? error.message : "批量分类请求失败。",
    );
  }
}
