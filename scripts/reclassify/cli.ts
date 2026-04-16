import type { CliArgs, ScriptMode } from './types.ts'
import { DEFAULT_BATCH_SIZE, DEFAULT_RESULT_FILE } from './config.ts'
import {
  parseBoolean,
  parseNonNegativeInteger,
  parsePositiveInteger,
} from './utils/common.ts'

export function parseArgs(argv: string[]): CliArgs {
  const args = createDefaultArgs()

  for (const arg of argv) {
    if (arg === '--help' || arg === '-h') {
      printHelp()
      process.exit(0)
    }

    if (!arg.startsWith('--')) {
      throw new Error(`无法识别的参数: ${arg}`)
    }

    const [rawKey, ...valueParts] = arg.slice(2).split('=')
    const key = rawKey.trim()
    const value = valueParts.join('=').trim()

    switch (key) {
      case 'mode':
        args.mode = (value || args.mode) as ScriptMode
        break
      case 'dir':
        args.dir = value || ''
        break
      case 'limit':
        args.limit = parseNonNegativeInteger(value, 'limit')
        break
      case 'batch-size':
        args.batchSize = parsePositiveInteger(value, 'batch-size')
        break
      case 'include-new-categories':
        args.includeNewCategories = parseBoolean(value)
        break
      case 'result-file':
        args.resultFile = value || args.resultFile
        break
      case 'baseUrl':
      case 'base-url':
        args.baseUrl = value || null
        break
      case 'apiKey':
      case 'api-key':
        args.apiKey = value || null
        break
      case 'model':
        args.model = value || null
        break
      default:
        throw new Error(`未知参数: --${key}`)
    }
  }

  return args
}

export function validateArgs(args: CliArgs): void {
  validateMode(args.mode)
  validateBatchSize(args.batchSize)

  if (args.mode === 'preview') {
    if (!args.apiKey) {
      throw new Error('preview 模式需要提供 apiKey，或设置 OPENAI_API_KEY。')
    }

    if (!args.model) {
      throw new Error('preview 模式需要提供 model，或设置 OPENAI_MODEL。')
    }
  }
}

function createDefaultArgs(): CliArgs {
  return {
    mode: 'preview',
    dir: '',
    limit: 0,
    includeNewCategories: true,
    batchSize: DEFAULT_BATCH_SIZE,
    resultFile: DEFAULT_RESULT_FILE,
    baseUrl: process.env.OPENAI_BASE_URL?.trim() || null,
    apiKey: process.env.OPENAI_API_KEY?.trim() || null,
    model: process.env.OPENAI_MODEL?.trim() || null,
  }
}

function printHelp(): void {
  console.log(`根据 wechat 下文章文件名进行 AI 批量重归类。

用法:
  tsx scripts/reclassify-wechat-by-title.ts [--mode=preview|apply] [--dir=<path>] [--limit=<n>] [--batch-size=<n>] [--include-new-categories=true|false] [--result-file=<path>] [--baseUrl=<url>] [--apiKey=<key>] [--model=<model>]

说明:
  --baseUrl / --base-url  默认读取 OPENAI_BASE_URL
  --apiKey / --api-key    默认读取 OPENAI_API_KEY
  --model                 默认读取 OPENAI_MODEL

示例:
  tsx scripts/reclassify-wechat-by-title.ts
  tsx scripts/reclassify-wechat-by-title.ts --mode=preview --dir=-not-classified
  tsx scripts/reclassify-wechat-by-title.ts --mode=preview --batch-size=50 --limit=200
  tsx scripts/reclassify-wechat-by-title.ts --mode=apply --dir=-not-classified

默认结果文件:
  ${DEFAULT_RESULT_FILE}
`)
}

function validateMode(mode: string): void {
  if (mode !== 'preview' && mode !== 'apply') {
    throw new Error(`mode 仅支持 preview 或 apply，收到: ${mode}`)
  }
}

function validateBatchSize(batchSize: number): void {
  if (!Number.isInteger(batchSize) || batchSize <= 0) {
    throw new Error(`batch-size 必须是正整数，收到: ${batchSize}`)
  }
}
