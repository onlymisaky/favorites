import { computed, ref, type Ref } from "vue";
import { withBase } from "vitepress";
import {
  DEFAULT_DOC_REVIEW_MODEL,
  DEFAULT_DOC_SUMMARY_MODEL,
  DOC_MANAGER_BASE,
  DOC_SUMMARY_MODELS,
  type DocSummaryModel,
  type SummaryReviewDetails,
} from "../../shared";
import type {
  MutationResponse,
  SummaryPreviewResponse,
  SummaryStreamEvent,
} from "../../shared/types";
import {
  buildReviewRetryFeedback,
  normalizeReviewDetails,
  parseSummaryStreamEvent,
} from "../utils/summaryPreview";

export function useSummaryPreview(relativePath: Ref<string>) {
  const isSummaryLoading = ref(false);
  const summaryPhase = ref<
    "idle" | "generating" | "reviewing" | "result" | "error"
  >("idle");
  const summaryPreviewContent = ref("");
  const summaryError = ref("");
  const summaryStatusMessage = ref("");
  const summaryReviewMessage = ref("");
  const reviewPassed = ref<boolean | null>(null);
  const reviewAttemptCount = ref<number | null>(null);
  const reviewFeedback = ref("");
  const reviewIssues = ref<string[]>([]);
  const reviewDetails = ref<SummaryReviewDetails | undefined>(undefined);
  const summaryRetryFeedback = ref("");
  const summaryRetryContent = ref("");
  const summaryRetryDetails = ref<SummaryReviewDetails | undefined>(undefined);
  const summaryRetryAttemptCount = ref(1);
  const selectedSummaryModel = ref<DocSummaryModel>(DEFAULT_DOC_SUMMARY_MODEL);
  const selectedReviewModel = ref<DocSummaryModel>(DEFAULT_DOC_REVIEW_MODEL);
  const summaryPreviewController = ref<AbortController | null>(null);
  const summaryPreviewRequestId = ref(0);

  const summaryModelOptions = computed(() =>
    DOC_SUMMARY_MODELS.map((model) => ({
      label: model,
      value: model,
    })),
  );

  function resetSummaryState() {
    stopSummaryPreviewRequest();
    summaryPhase.value = "idle";
    summaryError.value = "";
    summaryPreviewContent.value = "";
    summaryStatusMessage.value = "";
    summaryReviewMessage.value = "";
    reviewPassed.value = null;
    reviewAttemptCount.value = null;
    reviewFeedback.value = "";
    reviewIssues.value = [];
    reviewDetails.value = undefined;
    summaryRetryFeedback.value = "";
    summaryRetryContent.value = "";
    summaryRetryDetails.value = undefined;
    summaryRetryAttemptCount.value = 1;
    isSummaryLoading.value = false;
  }

  function stopSummaryPreviewRequest() {
    summaryPreviewController.value?.abort();
    summaryPreviewController.value = null;
  }

  function isCurrentSummaryRequest(requestId: number) {
    return summaryPreviewRequestId.value === requestId;
  }

  async function generateSummaryPreview() {
    stopSummaryPreviewRequest();
    isSummaryLoading.value = true;
    summaryPhase.value = "generating";
    summaryError.value = "";
    summaryStatusMessage.value = "";
    summaryReviewMessage.value = "";
    reviewPassed.value = null;
    reviewAttemptCount.value = null;
    reviewFeedback.value = "";
    reviewIssues.value = [];
    reviewDetails.value = undefined;
    summaryPreviewContent.value = "";
    const retryFeedback = summaryRetryFeedback.value;
    const previousSummaryContent = summaryRetryContent.value;
    const previousReviewDetails = summaryRetryDetails.value;
    const attemptCount = retryFeedback
      ? summaryRetryAttemptCount.value + 1
      : 1;
    summaryRetryFeedback.value = "";
    summaryRetryContent.value = "";
    summaryRetryDetails.value = undefined;
    summaryRetryAttemptCount.value = attemptCount;

    const controller = new AbortController();
    const requestId = summaryPreviewRequestId.value + 1;
    summaryPreviewRequestId.value = requestId;
    summaryPreviewController.value = controller;

    try {
      const response = await fetch(
        withBase(DOC_MANAGER_BASE + "/summarize/preview"),
        {
          method: "POST",
          headers: {
            Accept: "text/event-stream",
            "Content-Type": "application/json",
          },
          signal: controller.signal,
          body: JSON.stringify({
            relativePath: relativePath.value,
            model: selectedSummaryModel.value,
            reviewModel: selectedReviewModel.value,
            reviewFeedback: retryFeedback,
            previousSummaryContent,
            previousReviewDetails,
            attemptCount,
          }),
        },
      );

      if (!response.ok) {
        const data = (await response
          .json()
          .catch(() => null)) as SummaryPreviewResponse | null;
        summaryPhase.value = "error";
        summaryError.value = data?.error ?? "总结生成失败。";
        return;
      }

      if (!response.body) {
        summaryPhase.value = "error";
        summaryError.value = "总结生成失败。";
        return;
      }

      await consumeSummaryPreviewStream(response, requestId, controller.signal);
    } catch (error) {
      if (controller.signal.aborted) {
        return;
      }

      if (isCurrentSummaryRequest(requestId)) {
        summaryPhase.value = "error";
        summaryError.value =
          error instanceof Error ? error.message : "总结生成失败。";
      }
    } finally {
      if (isCurrentSummaryRequest(requestId)) {
        summaryPreviewController.value = null;
        isSummaryLoading.value = false;
      }
    }
  }

  async function applySummary() {
    const response = await fetch(
      withBase(DOC_MANAGER_BASE + "/summarize/apply"),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          relativePath: relativePath.value,
          summaryContent: summaryPreviewContent.value,
        }),
      },
    );

    return (await response.json()) as MutationResponse;
  }

  async function consumeSummaryPreviewStream(
    response: Response,
    requestId: number,
    signal: AbortSignal,
  ) {
    const reader = response.body?.getReader();

    if (!reader) {
      throw new Error("总结生成失败。");
    }

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      if (signal.aborted || !isCurrentSummaryRequest(requestId)) {
        await reader.cancel().catch(() => undefined);
        return;
      }

      const { value, done } = await reader.read();

      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split(/\r?\n\r?\n/);
      buffer = events.pop() ?? "";

      for (const eventText of events) {
        const parsedEvent = parseSummaryStreamEvent(eventText);

        if (!parsedEvent) {
          continue;
        }

        const shouldStop = handleSummaryStreamEvent(parsedEvent, requestId);

        if (shouldStop) {
          await reader.cancel().catch(() => undefined);
          return;
        }
      }
    }

    if (buffer.trim()) {
      const parsedEvent = parseSummaryStreamEvent(buffer);

      if (parsedEvent) {
        handleSummaryStreamEvent(parsedEvent, requestId);
      }
    }
  }

  function handleSummaryStreamEvent(
    event: SummaryStreamEvent,
    requestId: number,
  ) {
    if (!isCurrentSummaryRequest(requestId)) {
      return true;
    }

    switch (event.event) {
      case "status":
        summaryStatusMessage.value = event.data.message ?? "";
        return false;
      case "coverage-extracted":
        if (typeof event.data.chunkCount === "number") {
          summaryStatusMessage.value = `已提取覆盖要点，待处理 ${event.data.chunkCount} 段内容`;
        }
        return false;
      case "chunk-start":
        if (
          typeof event.data.chunkIndex === "number" &&
          typeof event.data.chunkCount === "number"
        ) {
          summaryStatusMessage.value = `正在整理第 ${event.data.chunkIndex}/${event.data.chunkCount} 段内容...`;
        }
        return false;
      case "chunk-complete":
        if (
          typeof event.data.chunkIndex === "number" &&
          typeof event.data.chunkCount === "number"
        ) {
          summaryStatusMessage.value = `已完成第 ${event.data.chunkIndex}/${event.data.chunkCount} 段整理，准备继续...`;
        }
        return false;
      case "attempt-start":
        summaryPhase.value = "generating";
        summaryPreviewContent.value = "";
        summaryReviewMessage.value = "";
        reviewPassed.value = null;
        reviewAttemptCount.value = null;
        reviewFeedback.value = "";
        reviewIssues.value = [];
        reviewDetails.value = undefined;
        if (typeof event.data.attemptCount === "number") {
          summaryStatusMessage.value = `开始第 ${event.data.attemptCount} 次生成`;
        }
        return false;
      case "summary-delta":
        if (typeof event.data.delta === "string") {
          summaryPreviewContent.value += event.data.delta;
        }
        return false;
      case "summary-complete":
        if (typeof event.data.attemptCount === "number") {
          summaryStatusMessage.value = `第 ${event.data.attemptCount} 次生成完成，等待校验...`;
        }
        return false;
      case "review-start":
        summaryPhase.value = "reviewing";
        if (typeof event.data.attemptCount === "number") {
          summaryStatusMessage.value = `正在校验第 ${event.data.attemptCount} 次总结...`;
        }
        return false;
      case "review-result": {
        const feedback =
          typeof event.data.feedback === "string"
            ? event.data.feedback.trim()
            : "";
        const issues = Array.isArray(event.data.issues)
          ? event.data.issues.filter(
              (issue): issue is string => typeof issue === "string",
            )
          : [];
        const details = normalizeReviewDetails(event.data.details);

        summaryPhase.value = "reviewing";
        reviewPassed.value = event.data.passed === true;
        reviewAttemptCount.value =
          typeof event.data.attemptCount === "number"
            ? event.data.attemptCount
            : null;
        reviewFeedback.value = feedback;
        reviewIssues.value = issues;
        reviewDetails.value = details;
        summaryStatusMessage.value =
          event.data.passed === true
            ? typeof event.data.attemptCount === "number"
              ? `第 ${event.data.attemptCount} 次校验通过`
              : "校验通过"
            : typeof event.data.attemptCount === "number"
              ? `第 ${event.data.attemptCount} 次校验未通过`
              : "校验未通过";
        if (event.data.passed === true) {
          summaryReviewMessage.value = "";
          summaryRetryFeedback.value = "";
          summaryRetryContent.value = "";
          summaryRetryDetails.value = undefined;
          summaryRetryAttemptCount.value =
            typeof event.data.attemptCount === "number"
              ? event.data.attemptCount
              : summaryRetryAttemptCount.value;
        } else {
          summaryReviewMessage.value = "";
          summaryRetryFeedback.value = buildReviewRetryFeedback({
            feedback,
            issues,
            details,
          });
          summaryRetryContent.value = summaryPreviewContent.value.trim();
          summaryRetryDetails.value = details;
          summaryRetryAttemptCount.value =
            typeof event.data.attemptCount === "number"
              ? event.data.attemptCount
              : summaryRetryAttemptCount.value;
        }
        return false;
      }
      case "result":
        summaryPhase.value = "result";
        if (typeof event.data.summaryContent === "string") {
          summaryPreviewContent.value = event.data.summaryContent;
        }
        reviewPassed.value =
          typeof event.data.reviewPassed === "boolean"
            ? event.data.reviewPassed
            : true;
        reviewAttemptCount.value =
          typeof event.data.attemptCount === "number"
            ? event.data.attemptCount
            : reviewAttemptCount.value;
        reviewFeedback.value =
          typeof event.data.reviewMessage === "string"
            ? event.data.reviewMessage
            : "";
        reviewIssues.value = Array.isArray(event.data.reviewIssues)
          ? event.data.reviewIssues.filter(
              (issue): issue is string => typeof issue === "string",
            )
          : [];
        reviewDetails.value = normalizeReviewDetails(event.data.reviewDetails);
        summaryStatusMessage.value =
          typeof event.data.attemptCount === "number"
            ? `第 ${event.data.attemptCount} 次校验通过`
            : "校验通过";
        summaryReviewMessage.value = "";
        summaryRetryFeedback.value = "";
        summaryRetryContent.value = "";
        summaryRetryDetails.value = undefined;
        return false;
      case "error":
        summaryPhase.value = "error";
        summaryError.value = event.data.error ?? "总结生成失败。";
        return true;
      case "done":
        return true;
    }
  }

  return {
    isSummaryLoading,
    summaryPhase,
    summaryPreviewContent,
    summaryError,
    summaryStatusMessage,
    summaryReviewMessage,
    reviewPassed,
    reviewAttemptCount,
    reviewFeedback,
    reviewIssues,
    reviewDetails,
    summaryRetryFeedback,
    summaryRetryContent,
    summaryRetryDetails,
    summaryRetryAttemptCount,
    selectedSummaryModel,
    selectedReviewModel,
    summaryModelOptions,
    generateSummaryPreview,
    applySummary,
    resetSummaryState,
    stopSummaryPreviewRequest,
  };
}
