import type { Dirent, Stats } from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'
import { DOCS_ROOT_NAME } from './config.ts'
import {
  normalizeCliDir,
  normalizeToForwardSlash,
  toPosixPath,
  toRelativeDocsPath,
} from './utils/path.ts'

export async function listTopLevelCategories(docsRoot: string): Promise<string[]> {
  const entries = await fs.readdir(docsRoot, { withFileTypes: true })

  return entries
    .filter(entry => entry.isDirectory() && !entry.name.startsWith('.'))
    .map(entry => entry.name)
    .sort((left, right) => left.localeCompare(right, 'zh-Hans-CN'))
}

export async function listMarkdownFiles(scanRoot: string, docsRoot: string): Promise<string[]> {
  const results: string[] = []

  async function walk(directory: string): Promise<void> {
    const entries = await fs.readdir(directory, { withFileTypes: true })

    for (const entry of entries) {
      if (entry.name.startsWith('.')) {
        continue
      }

      const absolutePath = path.join(directory, entry.name)

      if (entry.isDirectory()) {
        await walk(absolutePath)
        continue
      }

      if (!shouldIncludeMarkdownEntry(entry)) {
        continue
      }

      results.push(toRelativeDocsPath(docsRoot, absolutePath))
    }
  }

  await walk(scanRoot)
  results.sort((left, right) => left.localeCompare(right, 'zh-Hans-CN'))
  return results
}

export async function resolveTargetDir(
  docsRoot: string,
  inputDir: string,
): Promise<string | null> {
  const normalizedDir = normalizeCliDir(inputDir)

  if (!normalizedDir) {
    return null
  }

  if (path.isAbsolute(normalizedDir)) {
    throw new Error(`dir 只能是相对 ${DOCS_ROOT_NAME} 的路径，收到绝对路径: ${inputDir}`)
  }

  const posixDir = normalizeToForwardSlash(normalizedDir)

  if (
    posixDir === '.'
    || posixDir === '..'
    || posixDir.startsWith('../')
    || posixDir.includes('/../')
  ) {
    throw new Error(`dir 非法，不能越出 ${DOCS_ROOT_NAME}: ${inputDir}`)
  }

  const absoluteDir = path.resolve(docsRoot, normalizedDir)
  const relativeToRoot = path.relative(docsRoot, absoluteDir)

  if (
    !relativeToRoot
    || relativeToRoot.startsWith('..')
    || path.isAbsolute(relativeToRoot)
  ) {
    throw new Error(`dir 非法，必须是 ${DOCS_ROOT_NAME} 下的子目录: ${inputDir}`)
  }

  let stat: Stats | null = null

  try {
    stat = await fs.stat(absoluteDir)
  }
  catch {
    throw new Error(`指定目录不存在: ${DOCS_ROOT_NAME}/${posixDir}`)
  }

  if (!stat.isDirectory()) {
    throw new Error(`指定路径不是目录: ${DOCS_ROOT_NAME}/${posixDir}`)
  }

  return toPosixPath(relativeToRoot)
}

function shouldIncludeMarkdownEntry(entry: Dirent): boolean {
  return entry.isFile() && entry.name.endsWith('.md') && entry.name !== 'index.md'
}
