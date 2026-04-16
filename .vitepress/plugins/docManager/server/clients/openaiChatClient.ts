import type { SummaryCoverageSnapshot, SummaryReviewResult } from '../../shared/types'
import {
  callChatCompletion,
  callChatCompletionJson,
  callChatCompletionStream,
} from 'openai-api-helpers'
import { normalizeGeneratedMarkdown } from '../utils/document'

const DOC_MANAGER_OPENAI_BASE_URL = 'http://127.0.0.1:3000/v1'
const DOC_MANAGER_OPENAI_API_KEY = '__DOC_MANAGER_OPENAI_API_KEY__'
const DOC_MANAGER_OPENAI_MODEL = '__DOC_MANAGER_OPENAI_MODEL__'

interface PromptOptions {
  systemPrompt: string
  userPrompt: string
}

const coverageSnapshotSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'sourceLinks',
    'referenceLinks',
    'importantImages',
    'coreConcepts',
    'keyConclusions',
    'constraints',
    'codeBlocksSummary',
  ],
  properties: {
    sourceLinks: stringListSchema(),
    referenceLinks: stringListSchema(),
    importantImages: stringListSchema(),
    coreConcepts: stringListSchema(),
    keyConclusions: stringListSchema(),
    constraints: stringListSchema(),
    codeBlocksSummary: stringListSchema(),
  },
} as const

const summaryReviewSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'passed',
    'feedback',
    'issues',
    'missingSections',
    'missingLinks',
    'missingImages',
    'missingConcepts',
    'missingConstraints',
  ],
  properties: {
    passed: { type: 'boolean' },
    feedback: { type: 'string' },
    issues: stringListSchema(),
    missingSections: stringListSchema(),
    missingLinks: stringListSchema(),
    missingImages: stringListSchema(),
    missingConcepts: stringListSchema(),
    missingConstraints: stringListSchema(),
  },
} as const

export async function requestMarkdown(options: PromptOptions) {
  assertOpenAiConfig()
  const response = await callChatCompletion({
    apiKey: DOC_MANAGER_OPENAI_API_KEY,
    baseURL: DOC_MANAGER_OPENAI_BASE_URL,
    model: DOC_MANAGER_OPENAI_MODEL,
    messages: buildMessages(options),
  })
  const text = normalizeGeneratedMarkdown(response.text)

  if (!text) {
    throw new Error('AI 返回内容为空。')
  }

  return text
}

export async function streamMarkdown(
  options: PromptOptions,
  onChunk: (chunk: string) => void,
) {
  assertOpenAiConfig()
  const text = normalizeGeneratedMarkdown(
    await callChatCompletionStream({
      apiKey: DOC_MANAGER_OPENAI_API_KEY,
      baseURL: DOC_MANAGER_OPENAI_BASE_URL,
      model: DOC_MANAGER_OPENAI_MODEL,
      messages: buildMessages(options),
      onChunk(chunk) {
        onChunk(chunk)
      },
    }),
  )

  if (!text) {
    throw new Error('AI 返回内容为空。')
  }

  return text
}

export async function requestCoverageSnapshot(options: PromptOptions) {
  assertOpenAiConfig()
  const response = await callChatCompletionJson<SummaryCoverageSnapshot>({
    apiKey: DOC_MANAGER_OPENAI_API_KEY,
    baseURL: DOC_MANAGER_OPENAI_BASE_URL,
    model: DOC_MANAGER_OPENAI_MODEL,
    messages: buildMessages(options),
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'doc_manager_coverage_snapshot',
        schema: coverageSnapshotSchema,
      },
    },
  })

  if (response.parseError) {
    throw new Error(`AI 返回结果不是合法 JSON：${response.parseError.message}`)
  }

  if (response.schemaError) {
    throw new Error(`AI 返回结果结构不符合要求：${response.schemaError.message}`)
  }

  if (!response.data) {
    throw new Error('AI 未返回覆盖要点数据。')
  }

  return response.data
}

export async function requestSummaryReview(options: PromptOptions) {
  assertOpenAiConfig()
  const response = await callChatCompletionJson<SummaryReviewResult>({
    apiKey: DOC_MANAGER_OPENAI_API_KEY,
    baseURL: DOC_MANAGER_OPENAI_BASE_URL,
    model: DOC_MANAGER_OPENAI_MODEL,
    messages: buildMessages(options),
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'doc_manager_summary_review',
        schema: summaryReviewSchema,
      },
    },
  })

  if (response.parseError) {
    throw new Error(`AI 返回结果不是合法 JSON：${response.parseError.message}`)
  }

  if (response.schemaError) {
    throw new Error(`AI 返回结果结构不符合要求：${response.schemaError.message}`)
  }

  if (!response.data) {
    throw new Error('AI 未返回摘要评审结果。')
  }

  return response.data
}

function buildMessages(options: PromptOptions) {
  return [
    {
      role: 'system' as const,
      content: options.systemPrompt,
    },
    {
      role: 'user' as const,
      content: options.userPrompt,
    },
  ]
}

function stringListSchema() {
  return {
    type: 'array',
    items: {
      type: 'string',
    },
  } as const
}

function assertOpenAiConfig() {
  if (!DOC_MANAGER_OPENAI_BASE_URL.trim()) {
    throw new Error('文档管理插件未配置 AI 的 Base URL。')
  }

  if (
    !DOC_MANAGER_OPENAI_API_KEY.trim()
    || DOC_MANAGER_OPENAI_API_KEY === '__DOC_MANAGER_OPENAI_API_KEY__'
  ) {
    throw new Error('文档管理插件未配置 AI 的 API Key。请先修改 openaiChatClient.ts。')
  }

  if (!isAscii(DOC_MANAGER_OPENAI_API_KEY)) {
    throw new Error('文档管理插件的 API Key 包含非 ASCII 字符，无法写入请求头。')
  }

  if (
    !DOC_MANAGER_OPENAI_MODEL.trim()
    || DOC_MANAGER_OPENAI_MODEL === '__DOC_MANAGER_OPENAI_MODEL__'
  ) {
    throw new Error('文档管理插件未配置固定模型。请先修改 openaiChatClient.ts。')
  }
}

function isAscii(value: string) {
  return Array.from(value).every(char => char.charCodeAt(0) <= 0x7F)
}
