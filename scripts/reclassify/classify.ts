import type OpenAI from 'openai'
import type {
  AiResultItem,
  BatchClassificationResponse,
  BatchInput,
  Decision,
} from './types.ts'
import fs from 'node:fs/promises'
import path from 'node:path'
import { callChatCompletionJson } from 'openai-api-helpers'
import { FAILED_JSON_DEBUG_DIR } from './config.ts'
import {
  createErrorDecision,
  createInvalidDecision,
  createKeepDecision,
  createMoveDecision,
} from './result-file.ts'
import { normalizeConfidence, sanitizeCategoryName } from './utils/common.ts'
import { ensureDirectory, getTopLevelDirectoryName } from './utils/path.ts'

const SYSTEM_PROMPT_LINES = [
  '你在帮助维护一个 VitePress 文档目录。',
  '任务：对一批 Markdown 文档只根据文件名进行顶层分类判断。',
  '禁止读取、推断或依赖正文内容；如果文件名信息不足，只能基于文件名做最稳妥判断。',
  '重要：只有当你建议把文件移动到新分类（targetCategory != currentCategory）时，才输出该文件的结果；如果你认为当前分类合适，不要输出该 id。',
  '请优先复用已有分类，只有在明显不适合时才创建新分类。',
  'reason 必须简短说明为什么这个标题属于该分类，不要复述原始标题，不要直接引用标题中的引号内容。',
  'confidence 输出 0 到 1 之间的小数；当 confidence < 0.7（或你不提供 confidence）时，必须提供 reason；当 confidence >= 0.7 时，reason 可以省略。',
  '如果你确实输出字符串字段，必须保证是合法 JSON 字符串，内部双引号必须写成 \\"。',
  '',
  '错误示例：',
  '{"id":1,"reason":"文件名提到"后台管理模板"","confidence":0.8}',
  '正确示例：',
  '{"id":1,"reason":"标题明确提到后台管理模板","confidence":0.8}',
  '',
  '只输出 JSON，不要解释，不要 Markdown。',
  'JSON 格式：{"results":{"<id>":{"targetCategory":"string","confidence":0.0,"reason":"string"}}}',
]

const BATCH_CLASSIFICATION_RESPONSE_FORMAT: OpenAI.Chat.ChatCompletionCreateParams['response_format'] = {
  type: 'json_schema',
  json_schema: {
    name: 'batch_classification_results',
    schema: {
      type: 'object',
      additionalProperties: false,
      required: ['results'],
      properties: {
        results: {
          type: 'object',
          propertyNames: {
            pattern: '^[1-9]\\d*$',
          },
          additionalProperties: {
            type: 'object',
            additionalProperties: false,
            required: ['targetCategory'],
            properties: {
              targetCategory: {
                type: 'string',
              },
              confidence: {
                type: 'number',
              },
              reason: {
                type: 'string',
              },
            },
          },
        },
      },
    },
  },
}

export async function classifyBatchByTitle(options: {
  apiKey: string
  baseUrl: string | null
  batchFiles: string[]
  categories: string[]
  includeNewCategories: boolean
  model: string
}): Promise<Decision[]> {
  const batchInputs = createBatchInputs(options.batchFiles)
  const userPrompt = buildUserPrompt({
    batchInputs,
    categories: options.categories,
    includeNewCategories: options.includeNewCategories,
  })

  let response: Awaited<ReturnType<typeof callChatCompletionJson<BatchClassificationResponse>>>

  try {
    response = await callChatCompletionJson<BatchClassificationResponse>({
      apiKey: options.apiKey,
      baseURL: options.baseUrl ?? undefined,
      model: options.model,
      temperature: 0,
      response_format: BATCH_CLASSIFICATION_RESPONSE_FORMAT,
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT_LINES.join('\n'),
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    })
  }
  catch (error) {
    throw new Error(error instanceof Error ? error.message : '批量分类请求失败。')
  }

  if (response.parseError) {
    await writeFailedBatchJsonSample({
      batchFiles: options.batchFiles,
      rawText: response.parseError.preview,
      diagnostic: `JSON 解析失败: ${response.parseError.message}`,
    })
    throw new Error('无法解析 AI 返回的批量分类 JSON。')
  }

  if (response.schemaError) {
    await writeFailedBatchJsonSample({
      batchFiles: options.batchFiles,
      rawText: JSON.stringify(response.data, null, 2),
      diagnostic: `JSON Schema 校验失败: ${response.schemaError.message}`,
    })
    throw new Error('AI 返回的批量分类 JSON 不符合预期结构。')
  }

  return normalizeDecisions({
    batchFiles: options.batchFiles,
    batchInputs,
    categories: options.categories,
    includeNewCategories: options.includeNewCategories,
    results: toIndexedResults(response.data),
  })
}

export function createBatchFailureDecisions(batchFiles: string[], reason: string): Decision[] {
  return batchFiles.map(relativePath => createErrorDecision(relativePath, reason))
}

function createBatchInputs(batchFiles: string[]): BatchInput[] {
  return batchFiles.map((relativePath, index) => ({
    id: index + 1,
    relativePath,
    currentCategory: getTopLevelDirectoryName(relativePath),
    fileName: path.posix.basename(relativePath),
  }))
}

function buildUserPrompt(options: {
  batchInputs: BatchInput[]
  categories: string[]
  includeNewCategories: boolean
}): string {
  const existingCategories = options.categories.map(item => `- ${item}`).join('\n')
  const batchInputJson = JSON.stringify(options.batchInputs, null, 2)
  const newCategoryRule = options.includeNewCategories
    ? '如果现有分类都不合适，可以提出新的顶层分类名；新分类名必须简洁、通用、适合作为长期目录名。'
    : '只能从现有分类中选择，不允许输出新分类。'

  return [
    '现有顶层分类：',
    existingCategories,
    '',
    newCategoryRule,
    '',
    '待分类文件列表(JSON)：',
    batchInputJson,
  ].join('\n')
}

function normalizeDecisions(options: {
  batchFiles: string[]
  batchInputs: BatchInput[]
  categories: string[]
  includeNewCategories: boolean
  results: Record<number, AiResultItem>
}): Decision[] {
  const decisions: Decision[] = []
  const batchSize = options.batchFiles.length

  for (const id of Object.keys(options.results).map(Number)) {
    if (id > batchSize) {
      return createBatchFailureDecisions(
        options.batchFiles,
        `AI 返回了批次之外的 id: ${id}`,
      )
    }
  }

  for (const input of options.batchInputs) {
    const rawResult = options.results[input.id]

    if (!rawResult) {
      decisions.push(createKeepDecision(toDecisionBase(input)))
      continue
    }

    decisions.push(
      createDecisionFromResult({
        categories: options.categories,
        includeNewCategories: options.includeNewCategories,
        input,
        rawResult,
      }),
    )
  }

  return decisions
}

function toIndexedResults(data: BatchClassificationResponse | null): Record<number, AiResultItem> {
  const indexedResults: Record<number, AiResultItem> = {}
  const rawResults = data?.results ?? {}

  for (const [idText, value] of Object.entries(rawResults)) {
    indexedResults[Number.parseInt(idText, 10)] = value
  }

  return indexedResults
}

function createDecisionFromResult(options: {
  categories: string[]
  includeNewCategories: boolean
  input: BatchInput
  rawResult: AiResultItem
}): Decision {
  const baseDecision = toDecisionBase(options.input)
  const targetCategory = sanitizeCategoryName(options.rawResult.targetCategory)
  const confidence = normalizeConfidence(options.rawResult.confidence)
  const aiReason = typeof options.rawResult.reason === 'string'
    ? options.rawResult.reason.trim()
    : ''

  if (!targetCategory) {
    return createInvalidDecision(baseDecision, {
      reason: 'AI 返回了空分类或非法分类名。',
      aiReason,
      confidence,
      targetCategory: '',
    })
  }

  if (targetCategory === baseDecision.currentCategory) {
    return createInvalidDecision(baseDecision, {
      reason: 'AI 输出了与当前分类相同的 targetCategory。',
      aiReason,
      confidence,
      targetCategory,
    })
  }

  const isNewCategory = !options.categories.includes(targetCategory)

  if (isNewCategory && !options.includeNewCategories) {
    return createInvalidDecision(baseDecision, {
      reason: `AI 返回了新分类 "${targetCategory}"，但当前配置不允许创建新分类。`,
      aiReason,
      confidence,
      targetCategory,
    })
  }

  if ((confidence === null || confidence < 0.7) && !aiReason) {
    return createInvalidDecision(baseDecision, {
      reason: 'confidence 小于 0.7 或缺失时，reason 不能为空。',
      aiReason,
      confidence,
      targetCategory,
    })
  }

  return createMoveDecision(baseDecision, {
    aiReason,
    confidence,
    targetCategory,
    isNewCategory,
  })
}

function toDecisionBase(input: BatchInput) {
  return {
    relativePath: input.relativePath,
    fileName: input.fileName,
    currentCategory: input.currentCategory,
  }
}

async function writeFailedBatchJsonSample(options: {
  batchFiles: string[]
  rawText: string
  diagnostic: string
}): Promise<void> {
  const debugPath = path.join(FAILED_JSON_DEBUG_DIR, createBatchDebugFileName(options.batchFiles))
  const payload = [
    `generatedAt: ${new Date().toISOString()}`,
    `diagnostic: ${options.diagnostic.trim() || '(empty)'}`,
    '',
    '=== batchFiles ===',
    options.batchFiles.join('\n'),
    '',
    '=== rawContent ===',
    options.rawText || '(empty)',
    '',
  ].join('\n')

  await ensureDirectory(FAILED_JSON_DEBUG_DIR)
  await fs.writeFile(debugPath, payload, 'utf-8')
}

function createBatchDebugFileName(batchFiles: string[]): string {
  const firstFile = batchFiles[0] || 'unknown'
  const baseName = path.posix.basename(firstFile, path.posix.extname(firstFile))
  const safeBaseName = baseName.replace(/[^\p{L}\p{N}._-]+/gu, '_').slice(0, 80) || 'unknown'

  return `${Date.now()}-${safeBaseName}.txt`
}
