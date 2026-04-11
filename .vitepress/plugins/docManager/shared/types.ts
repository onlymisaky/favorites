import type { DOC_SUMMARY_MODELS } from './constants'

export type DocSummaryModel = (typeof DOC_SUMMARY_MODELS)[number]

export interface SummaryReviewDetails {
  missingSections: string[]
  missingLinks: string[]
  missingImages: string[]
  missingConcepts: string[]
  missingConstraints: string[]
}

export interface DocManagerOptions {
  docsRoot?: string
  siteBase?: string
  mountSlot?: string
}

export interface SummaryCoverageSnapshot {
  sourceLinks: string[]
  referenceLinks: string[]
  importantImages: string[]
  coreConcepts: string[]
  keyConclusions: string[]
  constraints: string[]
  codeBlocksSummary: string[]
}

export interface SummaryChunk {
  chunkIndex: number
  heading: string
  content: string
}

export interface ChunkSummary {
  chunkIndex: number
  heading: string
  summary: string
}

export interface SummaryReviewResult {
  passed: boolean
  feedback: string
  issues: string[]
  details: SummaryReviewDetails
}

export interface SummaryAttemptOptions {
  body: string
  relativePath: string
  title: string
  model: DocSummaryModel
  reviewModel: DocSummaryModel
  reviewFeedback?: string
  previousSummaryContent?: string
  previousReviewDetails?: SummaryReviewDetails
  attemptCount?: number
}

export interface SummaryPlan {
  normalizedBody: string
  coverageSnapshot: SummaryCoverageSnapshot
  chunkSummaries: ChunkSummary[]
}

export interface SummaryPlanHooks {
  onCoverageExtracted?: (
    snapshot: SummaryCoverageSnapshot,
    chunkCount: number,
  ) => void
  onChunkStart?: (chunkIndex: number, chunkCount: number) => void
  onChunkComplete?: (chunkIndex: number, chunkCount: number) => void
}

export interface CategoryResponse {
  success: boolean
  categories?: string[]
  error?: string
}

export interface MutationResponse {
  success: boolean
  redirectPath?: string
  targetPath?: string
  error?: string
}

export interface SummaryPreviewResponse {
  success: boolean
  summaryContent?: string
  attemptCount?: number
  reviewPassed?: boolean
  reviewMessage?: string
  reviewIssues?: string[]
  reviewDetails?: SummaryReviewDetails
  error?: string
}

export type SummaryStatusStage
  = | 'started'
    | 'generating'
    | 'reviewing'
    | 'retrying'
    | 'completed'

export type SummaryStreamEvent
  = | {
    event: 'status'
    data: {
      stage?: SummaryStatusStage
      message?: string
      attemptCount?: number
    }
  }
  | {
    event: 'coverage-extracted'
    data: {
      attemptCount?: number
      chunkCount?: number
      coverageSnapshot?: SummaryCoverageSnapshot
    }
  }
  | {
    event: 'chunk-start' | 'chunk-complete'
    data: {
      attemptCount?: number
      chunkIndex?: number
      chunkCount?: number
    }
  }
  | {
    event: 'attempt-start' | 'summary-complete' | 'review-start'
    data: {
      attemptCount?: number
    }
  }
  | {
    event: 'summary-delta'
    data: {
      attemptCount?: number
      delta?: string
    }
  }
  | {
    event: 'review-result'
    data: {
      attemptCount?: number
      passed?: boolean
      feedback?: string
      issues?: string[]
      details?: SummaryReviewDetails
    }
  }
  | {
    event: 'result'
    data: {
      summaryContent?: string
      attemptCount?: number
      reviewPassed?: boolean
      reviewMessage?: string
      reviewIssues?: string[]
      reviewDetails?: SummaryReviewDetails
    }
  }
  | {
    event: 'error'
    data: {
      error?: string
    }
  }
  | {
    event: 'done'
    data: {
      success?: boolean
    }
  }

export interface SummaryPreviewRequest {
  relativePath: string
  model?: DocSummaryModel
  reviewModel?: DocSummaryModel
  reviewFeedback?: string
  previousSummaryContent?: string
  previousReviewDetails?: SummaryReviewDetails
  attemptCount?: number
}

export interface SummaryApplyRequest {
  relativePath: string
  summaryContent: string
}

export interface MoveDocumentRequest {
  relativePath: string
  targetDirName: string
}

export interface DeleteDocumentRequest {
  relativePath: string
}
