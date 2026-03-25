import fs from "node:fs/promises";
import type { IncomingMessage, ServerResponse } from "node:http";
import { resolveMarkdownPath } from "../utils/document";
import {
  type JsonBody,
  readJsonBody,
  sendJson,
} from "../utils/http";

export type DocManagerRequestContext = {
  req: IncomingMessage;
  res: ServerResponse;
  docsRoot: string;
};

export type RouteHandler = (
  context: DocManagerRequestContext,
) => Promise<void>;

export type RouteDefinition = {
  method: string;
  path: string;
  handler: RouteHandler;
};

export async function readRequiredJsonBody<T extends JsonBody>(
  context: DocManagerRequestContext,
) {
  const body = await readJsonBody(context.req);

  if (!body) {
    sendJson(context.res, 400, {
      success: false,
      error: "Invalid or empty JSON body.",
    });
    return null;
  }

  return body as T;
}

export async function resolveRequiredSourcePath(
  context: DocManagerRequestContext,
  relativePath: unknown,
) {
  if (typeof relativePath !== "string") {
    sendJson(context.res, 400, {
      success: false,
      error: "Missing relativePath.",
    });
    return null;
  }

  const sourcePath = resolveMarkdownPath(context.docsRoot, relativePath);

  if (!sourcePath) {
    sendJson(context.res, 400, {
      success: false,
      error: "Invalid document path.",
    });
    return null;
  }

  try {
    await fs.access(sourcePath);
  } catch {
    sendJson(context.res, 404, {
      success: false,
      error: "Document not found.",
    });
    return null;
  }

  return sourcePath;
}
