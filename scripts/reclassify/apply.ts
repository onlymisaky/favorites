import type { ApplyResult, CliArgs, MoveDecision } from './types.ts'
import fs from 'node:fs/promises'
import path from 'node:path'
import { readResultFile } from './result-file.ts'
import {
  normalizeCliDir,
  normalizeStoredTargetDir,
  pathExists,
  toRelativeDocsPath,
} from './utils/path.ts'

export async function runApply(options: {
  args: CliArgs
  docsRoot: string
  resultFilePath: string
}): Promise<void> {
  const resultPayload = await readResultFile(options.resultFilePath)
  const decisions = Array.isArray(resultPayload.decisions)
    ? resultPayload.decisions
    : null

  if (!decisions) {
    throw new Error('结果文件缺少 decisions 字段，请先重新运行 preview。')
  }

  const expectedTargetDir = normalizeCliDir(options.args.dir)
  const resolvedTargetDir = validateApplyTargetDir({
    expectedTargetDir,
    resultTargetDir: normalizeStoredTargetDir(resultPayload.targetDir),
    resultFilePath: options.resultFilePath,
  })

  console.log(
    [
      'Mode: apply',
      `Result file: ${options.resultFilePath}`,
      `Generated at: ${resultPayload.generatedAt ?? 'unknown'}`,
      `Dir: ${resolvedTargetDir ?? '(all)'}`,
      `Decisions: ${decisions.length}`,
    ].join(' | '),
  )

  const moveDecisions = decisions.filter(
    (decision): decision is MoveDecision => decision.status === 'move',
  )
  const applyResult = await applyDecisions({
    docsRoot: options.docsRoot,
    decisions: moveDecisions,
  })

  printApplyResult(applyResult)
}

function validateApplyTargetDir(options: {
  expectedTargetDir: string | null
  resultTargetDir: string | null
  resultFilePath: string
}): string | null {
  const expected = options.expectedTargetDir ?? null
  const actual = options.resultTargetDir ?? null

  if (!expected) {
    return actual
  }

  if (expected === actual) {
    return actual
  }

  if (!actual) {
    throw new Error(
      `结果文件 ${options.resultFilePath} 是全量预览结果，不能配合 --dir=${expected} 使用。`,
    )
  }

  throw new Error(
    `结果文件 ${options.resultFilePath} 的目录范围是 ${actual}，与当前 --dir=${expected} 不一致。`,
  )
}

async function applyDecisions(options: {
  docsRoot: string
  decisions: MoveDecision[]
}): Promise<ApplyResult> {
  const result: ApplyResult = {
    moved: [],
    skipped: [],
    createdCategories: [],
  }

  for (const decision of options.decisions) {
    const moveResult = await applyMoveDecision(options.docsRoot, decision)

    if (moveResult.status === 'moved') {
      result.moved.push(moveResult.item)

      if (
        moveResult.createdCategory
        && !result.createdCategories.includes(moveResult.createdCategory)
      ) {
        result.createdCategories.push(moveResult.createdCategory)
      }

      continue
    }

    result.skipped.push(moveResult.item)
  }

  return result
}

async function applyMoveDecision(docsRoot: string, decision: MoveDecision) {
  const paths = getDecisionPaths(docsRoot, decision)
  const directoryExisted = await pathExists(paths.targetDirectory)

  try {
    await fs.mkdir(paths.targetDirectory, { recursive: true })

    if (await pathExists(paths.targetPath)) {
      return {
        status: 'skipped' as const,
        item: createSkippedMoveItem(
          docsRoot,
          decision.relativePath,
          paths.targetPath,
          '目标分类下已存在同名文件。',
        ),
      }
    }

    await fs.rename(paths.sourcePath, paths.targetPath)

    return {
      status: 'moved' as const,
      createdCategory:
        decision.isNewCategory && !directoryExisted ? decision.targetCategory : null,
      item: {
        from: decision.relativePath,
        to: toRelativeDocsPath(docsRoot, paths.targetPath),
      },
    }
  }
  catch (error) {
    return {
      status: 'skipped' as const,
      item: createSkippedMoveItem(
        docsRoot,
        decision.relativePath,
        paths.targetPath,
        error instanceof Error ? error.message : '移动失败。',
      ),
    }
  }
}

function getDecisionPaths(docsRoot: string, decision: MoveDecision) {
  const targetDirectory = path.join(docsRoot, decision.targetCategory)

  return {
    sourcePath: path.join(docsRoot, decision.relativePath),
    targetDirectory,
    targetPath: path.join(targetDirectory, decision.fileName),
  }
}

function createSkippedMoveItem(
  docsRoot: string,
  relativePath: string,
  targetPath: string,
  reason: string,
) {
  return {
    relativePath,
    reason,
    targetPath: toRelativeDocsPath(docsRoot, targetPath),
  }
}

function printApplyResult(result: ApplyResult): void {
  console.log('\n=== 执行结果 ===')
  console.log(`成功移动: ${result.moved.length}`)
  console.log(`跳过: ${result.skipped.length}`)

  if (result.createdCategories.length > 0) {
    console.log(`创建分类: ${result.createdCategories.join(', ')}`)
  }

  if (result.moved.length > 0) {
    console.log('\n=== 已移动 ===')

    for (const item of result.moved) {
      console.log(`${item.from} -> ${item.to}`)
    }
  }

  if (result.skipped.length > 0) {
    console.log('\n=== 已跳过 ===')

    for (const item of result.skipped) {
      console.log(`${item.relativePath} | ${item.reason} | ${item.targetPath}`)
    }
  }
}
