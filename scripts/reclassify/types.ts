export type ScriptMode = 'preview' | 'apply'

export interface CliArgs {
  mode: ScriptMode
  dir: string
  limit: number
  batchSize: number
  includeNewCategories: boolean
  resultFile: string
  baseUrl: string | null
  apiKey: string | null
  model: string | null
}

export interface BatchInput {
  id: number
  relativePath: string
  currentCategory: string
  fileName: string
}

export interface AiResultItem {
  targetCategory?: unknown
  confidence?: unknown
  reason?: unknown
}

export interface BatchClassificationResponse {
  results?: Record<string, AiResultItem>
}

export type DecisionStatus = 'move' | 'keep' | 'invalid' | 'error'

export interface DecisionBase {
  relativePath: string
  fileName: string
  currentCategory: string
}

export interface MoveDecision extends DecisionBase {
  status: 'move'
  reason: string
  aiReason: string
  confidence: number | null
  targetCategory: string
  isNewCategory: boolean
}

export interface KeepDecision extends DecisionBase {
  status: 'keep'
  reason: string
  aiReason: string
  confidence: number | null
  targetCategory: string
}

export interface InvalidDecision extends DecisionBase {
  status: 'invalid'
  reason: string
  aiReason: string
  confidence: number | null
  targetCategory: string
}

export interface ErrorDecision extends DecisionBase {
  status: 'error'
  reason: string
  aiReason: string
  confidence: number | null
  targetCategory: string
}

export type Decision = MoveDecision | KeepDecision | InvalidDecision | ErrorDecision

export interface ResultSummary {
  move: number
  keep: number
  invalid: number
  error: number
  newCategories: string[]
}

export interface ResultPayload {
  formatVersion: number
  generatedAt: string
  docsRoot: string
  targetDir: string | null
  model: string | null
  baseUrl: string | null
  batchSize: number
  includeNewCategories: boolean
  totalFiles: number
  selectedFileCount: number
  categories: string[]
  summary: ResultSummary
  decisions: Decision[]
}

export interface ApplyResult {
  moved: Array<{
    from: string
    to: string
  }>
  skipped: Array<{
    relativePath: string
    reason: string
    targetPath: string
  }>
  createdCategories: string[]
}
