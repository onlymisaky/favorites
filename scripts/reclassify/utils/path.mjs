import fs from "node:fs/promises";
import path from "node:path";

export function toRelativeDocsPath(docsRoot, absolutePath) {
  return toPosixPath(path.relative(docsRoot, absolutePath));
}

export function toPosixPath(filePath) {
  return normalizeToForwardSlash(filePath);
}

export function normalizeToForwardSlash(value) {
  return value.split(path.sep).join("/");
}

export function getTopLevelDirectoryName(relativePath) {
  return toPosixPath(relativePath).split("/")[0] ?? "";
}

export function normalizeCliDir(inputDir) {
  if (typeof inputDir !== "string") {
    return null;
  }

  const trimmed = inputDir.trim();

  if (!trimmed) {
    return null;
  }

  return trimmed.replace(/\\/gu, "/").replace(/^\.\/+/u, "").replace(/\/+$/u, "");
}

export function normalizeStoredTargetDir(targetDir) {
  if (typeof targetDir !== "string" || !targetDir.trim()) {
    return null;
  }

  return normalizeCliDir(targetDir);
}

export async function ensureDirectory(directoryPath) {
  await fs.mkdir(directoryPath, { recursive: true });
}

export async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}
