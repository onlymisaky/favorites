import type { IncomingMessage, ServerResponse } from 'node:http'
import type { JsonBody } from '../utils/http'
import fs from 'node:fs/promises'
import { resolveMarkdownPath } from '../utils/document'
import {
  readJsonBody,
  sendJson,
} from '../utils/http'

export interface DocManagerRequestContext {
  req: IncomingMessage
  res: ServerResponse
  docsRoot: string
}

export type RouteHandler = (
  context: DocManagerRequestContext,
) => Promise<void>

export interface RouteDefinition {
  method: string
  path: string
  handler: RouteHandler
}

export async function readRequiredJsonBody<T extends JsonBody>(
  context: DocManagerRequestContext,
) {
  const body = await readJsonBody(context.req)

  if (!body) {
    sendJson(context.res, 400, {
      success: false,
      error: '请求体不是合法的 JSON，或内容为空。',
    })
    return null
  }

  return body as T
}

export async function resolveRequiredSourcePath(
  context: DocManagerRequestContext,
  relativePath: unknown,
) {
  if (typeof relativePath !== 'string') {
    sendJson(context.res, 400, {
      success: false,
      error: '缺少 relativePath。',
    })
    return null
  }

  const sourcePath = resolveMarkdownPath(context.docsRoot, relativePath)

  if (!sourcePath) {
    sendJson(context.res, 400, {
      success: false,
      error: '文档路径不合法。',
    })
    return null
  }

  try {
    await fs.access(sourcePath)
  }
  catch {
    sendJson(context.res, 404, {
      success: false,
      error: '未找到文档。',
    })
    return null
  }

  return sourcePath
}
