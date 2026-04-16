import fs from 'node:fs/promises'
import path from 'node:path'

export function toRelativeDocsPath(docsRoot: string, absolutePath: string): string {
  return toPosixPath(path.relative(docsRoot, absolutePath))
}

export function toPosixPath(filePath: string): string {
  return normalizeToForwardSlash(filePath)
}

export function normalizeToForwardSlash(value: string): string {
  return value.split(path.sep).join('/')
}

export function getTopLevelDirectoryName(relativePath: string): string {
  return toPosixPath(relativePath).split('/')[0] ?? ''
}

export function normalizeCliDir(inputDir: string | null | undefined): string | null {
  if (typeof inputDir !== 'string') {
    return null
  }

  const trimmed = inputDir.trim()

  if (!trimmed) {
    return null
  }

  return trimmed.replace(/\\/gu, '/').replace(/^\.\/+/u, '').replace(/\/+$/u, '')
}

export function normalizeStoredTargetDir(targetDir: string | null | undefined): string | null {
  if (typeof targetDir !== 'string' || !targetDir.trim()) {
    return null
  }

  return normalizeCliDir(targetDir)
}

export async function ensureDirectory(directoryPath: string): Promise<void> {
  await fs.mkdir(directoryPath, { recursive: true })
}

export async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath)
    return true
  }
  catch {
    return false
  }
}
