import type { CliArgs, Decision } from './types.ts'
import path from 'node:path'
import { classifyBatchByTitle, createBatchFailureDecisions } from './classify.ts'
import { createResultPayload, printPreview, writeResultFile } from './result-file.ts'
import { listMarkdownFiles, listTopLevelCategories, resolveTargetDir } from './scan.ts'
import { chunkItems } from './utils/common.ts'

export async function runPreview(options: {
  args: CliArgs
  docsRoot: string
  resultFilePath: string
}): Promise<void> {
  const scanContext = await collectPreviewScanContext(options.docsRoot, options.args)

  if (scanContext.selectedFiles.length === 0) {
    console.log('没有可处理的 Markdown 文件。')
    return
  }

  printPreviewHeader({
    args: options.args,
    targetDir: scanContext.targetDir,
    selectedFileCount: scanContext.selectedFiles.length,
    totalFileCount: scanContext.markdownFiles.length,
  })

  const decisions = await classifyFilesInBatches({
    args: options.args,
    categories: scanContext.categories,
    selectedFiles: scanContext.selectedFiles,
  })
  const resultPayload = createResultPayload({
    args: options.args,
    categories: scanContext.categories,
    decisions,
    selectedFileCount: scanContext.selectedFiles.length,
    targetDir: scanContext.targetDir,
    totalFiles: scanContext.markdownFiles.length,
  })

  await writeResultFile(options.resultFilePath, resultPayload)
  printPreview({
    decisions,
    summary: resultPayload.summary,
    resultFilePath: options.resultFilePath,
    targetDir: scanContext.targetDir,
  })
}

async function collectPreviewScanContext(docsRoot: string, args: CliArgs) {
  const targetDir = await resolveTargetDir(docsRoot, args.dir)
  const scanRoot = targetDir
    ? path.join(docsRoot, targetDir)
    : docsRoot
  const categories = await listTopLevelCategories(docsRoot)
  const markdownFiles = await listMarkdownFiles(scanRoot, docsRoot)
  const selectedFiles
    = args.limit > 0
      ? markdownFiles.slice(0, args.limit)
      : markdownFiles

  return {
    targetDir,
    categories,
    markdownFiles,
    selectedFiles,
  }
}

function printPreviewHeader(options: {
  args: CliArgs
  selectedFileCount: number
  targetDir: string | null
  totalFileCount: number
}): void {
  const headerItems = [
    'Mode: preview',
    `Files: ${options.selectedFileCount}/${options.totalFileCount}`,
    `Dir: ${options.targetDir ?? '(all)'}`,
    `Batch size: ${options.args.batchSize}`,
    `Include new categories: ${String(options.args.includeNewCategories)}`,
    `Model: ${options.args.model ?? '(unset)'}`,
  ]

  if (options.args.baseUrl) {
    headerItems.push(`Base URL: ${options.args.baseUrl}`)
  }

  console.log(headerItems.join(' | '))
}

async function classifyFilesInBatches(options: {
  args: CliArgs
  categories: string[]
  selectedFiles: string[]
}): Promise<Decision[]> {
  const batches = chunkItems(options.selectedFiles, options.args.batchSize)
  const decisions: Decision[] = []

  for (let batchIndex = 0; batchIndex < batches.length; batchIndex += 1) {
    const batchFiles = batches[batchIndex]

    console.log(
      `[Batch ${batchIndex + 1}/${batches.length}] 分析 ${batchFiles.length} 篇文件名`,
    )

    try {
      decisions.push(
        ...(await classifyBatchByTitle({
          apiKey: options.args.apiKey!,
          baseUrl: options.args.baseUrl,
          batchFiles,
          categories: options.categories,
          includeNewCategories: options.args.includeNewCategories,
          model: options.args.model!,
        })),
      )
    }
    catch (error) {
      decisions.push(
        ...createBatchFailureDecisions(
          batchFiles,
          error instanceof Error ? error.message : '批量分类请求失败。',
        ),
      )
    }
  }

  return decisions
}
