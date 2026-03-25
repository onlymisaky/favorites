import path from "node:path";

export function resolveMarkdownPath(docsRoot: string, relativePath: string) {
  if (!relativePath.endsWith(".md")) {
    return null;
  }

  const normalizedPath = path.posix.normalize(relativePath);

  if (
    normalizedPath.startsWith("../") ||
    normalizedPath.includes("/../") ||
    path.posix.isAbsolute(normalizedPath)
  ) {
    return null;
  }

  const resolvedPath = path.resolve(docsRoot, normalizedPath);
  const relativeToRoot = path.relative(docsRoot, resolvedPath);

  if (relativeToRoot.startsWith("..") || path.isAbsolute(relativeToRoot)) {
    return null;
  }

  return resolvedPath;
}

export function splitFrontmatter(source: string) {
  const match = source.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n*/);

  if (!match) {
    return {
      frontmatter: "",
      body: source,
    };
  }

  return {
    frontmatter: match[0],
    body: source.slice(match[0].length),
  };
}

export function extractFirstHeading(body: string) {
  const match = body.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : "";
}

export function normalizeGeneratedMarkdown(content: string) {
  const trimmedContent = content.trim();
  const fencedMatch = trimmedContent.match(
    /^```(?:markdown|md)?\r?\n([\s\S]*?)\r?\n```$/,
  );

  return (fencedMatch ? fencedMatch[1] : trimmedContent).trim();
}

export function composeSummaryDocument(summaryBody: string, title: string) {
  const cleanSummaryBody = stripLeadingTitle(
    normalizeGeneratedMarkdown(summaryBody),
  );

  if (!title) {
    return cleanSummaryBody;
  }

  return `# ${title}\n\n${cleanSummaryBody}`.trim();
}

export function composeDocument(frontmatter: string, body: string) {
  const normalizedBody = normalizeGeneratedMarkdown(body);
  return `${frontmatter}${normalizedBody}\n`;
}

export function stripLeadingTitle(content: string) {
  return content.replace(/^#\s+.+?(?:\r?\n){1,2}/, "").trim();
}

export function toPosixPath(filePath: string) {
  return filePath.split(path.sep).join("/");
}

export function getTopLevelDirectoryName(relativePath: string) {
  return toPosixPath(relativePath).split("/")[0] ?? "";
}

export function stripBasePath(pathname: string, siteBase: string) {
  if (pathname.startsWith(siteBase)) {
    return pathname.slice(siteBase.length - 1);
  }

  return pathname;
}
