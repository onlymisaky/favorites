import type { DOC_SUMMARY_MODELS } from "./constants";

export type DocSummaryModel = (typeof DOC_SUMMARY_MODELS)[number];

export type SummaryReviewDetails = {
  missingSections: string[];
  missingLinks: string[];
  missingImages: string[];
  missingConcepts: string[];
  missingConstraints: string[];
};

export type DocManagerOptions = {
  docsRoot?: string;
  siteBase?: string;
  mountSlot?: string;
};

export type SummaryCoverageSnapshot = {
  sourceLinks: string[];
  referenceLinks: string[];
  importantImages: string[];
  coreConcepts: string[];
  keyConclusions: string[];
  constraints: string[];
  codeBlocksSummary: string[];
};

export type SummaryChunk = {
  chunkIndex: number;
  heading: string;
  content: string;
};

export type ChunkSummary = {
  chunkIndex: number;
  heading: string;
  summary: string;
};

export type SummaryReviewResult = {
  passed: boolean;
  feedback: string;
  issues: string[];
  details: SummaryReviewDetails;
};

export type SummaryAttemptOptions = {
  body: string;
  relativePath: string;
  title: string;
  model: DocSummaryModel;
  reviewModel: DocSummaryModel;
  reviewFeedback?: string;
  previousSummaryContent?: string;
  previousReviewDetails?: SummaryReviewDetails;
  attemptCount?: number;
};

export type SummaryPlan = {
  normalizedBody: string;
  coverageSnapshot: SummaryCoverageSnapshot;
  chunkSummaries: ChunkSummary[];
};

export type SummaryPlanHooks = {
  onCoverageExtracted?: (
    snapshot: SummaryCoverageSnapshot,
    chunkCount: number,
  ) => void;
  onChunkStart?: (chunkIndex: number, chunkCount: number) => void;
  onChunkComplete?: (chunkIndex: number, chunkCount: number) => void;
};

export type CategoryResponse = {
  success: boolean;
  categories?: string[];
  error?: string;
};

export type MutationResponse = {
  success: boolean;
  redirectPath?: string;
  targetPath?: string;
  error?: string;
};

export type SummaryPreviewResponse = {
  success: boolean;
  summaryContent?: string;
  attemptCount?: number;
  reviewPassed?: boolean;
  reviewMessage?: string;
  reviewIssues?: string[];
  reviewDetails?: SummaryReviewDetails;
  error?: string;
};

export type SummaryStatusStage =
  | "started"
  | "generating"
  | "reviewing"
  | "retrying"
  | "completed";

export type SummaryStreamEvent =
  | {
      event: "status";
      data: {
        stage?: SummaryStatusStage;
        message?: string;
        attemptCount?: number;
      };
    }
  | {
      event: "coverage-extracted";
      data: {
        attemptCount?: number;
        chunkCount?: number;
        coverageSnapshot?: SummaryCoverageSnapshot;
      };
    }
  | {
      event: "chunk-start" | "chunk-complete";
      data: {
        attemptCount?: number;
        chunkIndex?: number;
        chunkCount?: number;
      };
    }
  | {
      event: "attempt-start" | "summary-complete" | "review-start";
      data: {
        attemptCount?: number;
      };
    }
  | {
      event: "summary-delta";
      data: {
        attemptCount?: number;
        delta?: string;
      };
    }
  | {
      event: "review-result";
      data: {
        attemptCount?: number;
        passed?: boolean;
        feedback?: string;
        issues?: string[];
        details?: SummaryReviewDetails;
      };
    }
  | {
      event: "result";
      data: {
        summaryContent?: string;
        attemptCount?: number;
        reviewPassed?: boolean;
        reviewMessage?: string;
        reviewIssues?: string[];
        reviewDetails?: SummaryReviewDetails;
      };
    }
  | {
      event: "error";
      data: {
        error?: string;
      };
    }
  | {
      event: "done";
      data: {
        success?: boolean;
      };
    };

export type SummaryPreviewRequest = {
  relativePath: string;
  model?: DocSummaryModel;
  reviewModel?: DocSummaryModel;
  reviewFeedback?: string;
  previousSummaryContent?: string;
  previousReviewDetails?: SummaryReviewDetails;
  attemptCount?: number;
};

export type SummaryApplyRequest = {
  relativePath: string;
  summaryContent: string;
};

export type MoveDocumentRequest = {
  relativePath: string;
  targetDirName: string;
};

export type DeleteDocumentRequest = {
  relativePath: string;
};
