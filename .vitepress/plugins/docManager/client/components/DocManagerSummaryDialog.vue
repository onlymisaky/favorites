<script setup lang="ts">
import { computed } from "vue";
import type { DocSummaryModel } from "../../shared";

const props = defineProps<{
  open: boolean;
  currentFileName: string;
  isSubmitting: boolean;
  isSummaryLoading: boolean;
  summaryPhase: "idle" | "generating" | "reviewing" | "result" | "error";
  summaryError: string;
  summaryStatusMessage: string;
  summaryPreviewContent: string;
  summaryApplyDisabled: boolean;
  reviewPassed: boolean | null;
  reviewAttemptCount: number | null;
  reviewFeedback: string;
  reviewIssues: string[];
  reviewDetails?: {
    missingSections: string[];
    missingLinks: string[];
    missingImages: string[];
    missingConcepts: string[];
    missingConstraints: string[];
  };
  summaryModelOptions: Array<{ label: string; value: DocSummaryModel }>;
  selectedSummaryModel: DocSummaryModel;
  selectedReviewModel: DocSummaryModel;
}>();

const emit = defineEmits<{
  (event: "close"): void;
  (event: "generate"): void;
  (event: "apply"): void;
  (event: "update:selectedSummaryModel", value: DocSummaryModel): void;
  (event: "update:selectedReviewModel", value: DocSummaryModel): void;
  (event: "update:summaryPreviewContent", value: string): void;
}>();

const selectedSummaryModelModel = computed({
  get: () => props.selectedSummaryModel,
  set: (value: DocSummaryModel) => emit("update:selectedSummaryModel", value),
});

const selectedReviewModelModel = computed({
  get: () => props.selectedReviewModel,
  set: (value: DocSummaryModel) => emit("update:selectedReviewModel", value),
});

const summaryPreviewContentModel = computed({
  get: () => props.summaryPreviewContent,
  set: (value: string) => emit("update:summaryPreviewContent", value),
});

const hasSummaryContent = computed(() =>
  props.summaryPreviewContent.trim().length > 0,
);

const loadingMessage = computed(() => {
  if (!props.isSummaryLoading) {
    return "";
  }

  return props.summaryStatusMessage
    ? props.summaryStatusMessage
    : props.summaryPhase === "reviewing"
      ? "正在校验总结内容，请稍候..."
      : "正在生成便于快速复习的笔记体总结...";
});

const failureSummary = computed(() => {
  if (props.reviewPassed !== false) {
    return "";
  }

  return props.summaryStatusMessage || "校验未通过";
});

const errorMessage = computed(() => {
  if (!props.summaryError) {
    return null;
  }

  return {
    type: "error" as const,
    message: props.summaryError,
  };
});

const successMessage = computed(() => {
  if (props.reviewPassed !== true || props.summaryPhase !== "result") {
    return "";
  }

  return props.summaryStatusMessage || "校验通过";
});

const currentAlert = computed(() => {
  if (errorMessage.value) {
    return {
      type: "error" as const,
      className: "",
      message: errorMessage.value.message,
    };
  }

  if (props.reviewPassed === false) {
    return {
      type: "error" as const,
      className: "",
      message: failureSummary.value,
    };
  }

  if (successMessage.value) {
    return {
      type: "success" as const,
      className: "",
      message: successMessage.value,
    };
  }

  if (props.isSummaryLoading || props.summaryStatusMessage) {
    return {
      type: "info" as const,
      className: "doc-manager-alert--neutral",
      message: props.isSummaryLoading ? loadingMessage.value : props.summaryStatusMessage,
    };
  }

  return null;
});

const reviewDetailGroups = computed(() => {
  const groups: Array<{ label: string; items: string[] }> = [];

  if (props.reviewFeedback.trim()) {
    groups.push({ label: "反馈摘要", items: [props.reviewFeedback.trim()] });
  }

  if (props.reviewIssues.length > 0) {
    groups.push({ label: "问题列表", items: props.reviewIssues });
  }

  if (props.reviewDetails?.missingSections?.length) {
    groups.push({ label: "遗漏章节", items: props.reviewDetails.missingSections });
  }

  if (props.reviewDetails?.missingLinks?.length) {
    groups.push({ label: "遗漏链接", items: props.reviewDetails.missingLinks });
  }

  if (props.reviewDetails?.missingImages?.length) {
    groups.push({ label: "遗漏图片", items: props.reviewDetails.missingImages });
  }

  if (props.reviewDetails?.missingConcepts?.length) {
    groups.push({ label: "遗漏概念", items: props.reviewDetails.missingConcepts });
  }

  if (props.reviewDetails?.missingConstraints?.length) {
    groups.push({ label: "遗漏限制", items: props.reviewDetails.missingConstraints });
  }

  return groups;
});

const showReviewDetails = computed(
  () => props.reviewPassed === false && reviewDetailGroups.value.length > 0,
);

const showEmptySkeleton = computed(
  () =>
    !hasSummaryContent.value &&
    !errorMessage.value,
);
</script>

<template>
  <ElDialog
    :model-value="open"
    width="min(920px, calc(100vw - 32px))"
    destroy-on-close
    append-to-body
    align-center
    class="doc-manager-el-dialog"
    @close="emit('close')"
  >
    <template #header>
      <div class="font-medium text-slate-700">{{ currentFileName }}</div>
    </template>

    <div class="doc-manager-dialog-stack">
      <div class="flex flex-wrap items-center gap-x-4 gap-y-3">
        <label class="flex min-w-[320px] flex-1 items-center gap-3">
          <span class="w-16 shrink-0 text-sm font-medium text-slate-600">总结模型</span>
          <ElSelect
            v-model="selectedSummaryModelModel"
            class="min-w-0 flex-1"
            :disabled="isSubmitting || isSummaryLoading"
          >
            <ElOption
              v-for="model in summaryModelOptions"
              :key="model.value"
              :label="model.label"
              :value="model.value"
            />
          </ElSelect>
        </label>

        <label class="flex min-w-[320px] flex-1 items-center gap-3">
          <span class="w-16 shrink-0 text-sm font-medium text-slate-600">评审模型</span>
          <ElSelect
            v-model="selectedReviewModelModel"
            class="min-w-0 flex-1"
            :disabled="isSubmitting || isSummaryLoading"
          >
            <ElOption
              v-for="model in summaryModelOptions"
              :key="`review-${model.value}`"
              :label="model.label"
              :value="model.value"
            />
          </ElSelect>
        </label>
      </div>

      <ElAlert
        v-if="currentAlert"
        :type="currentAlert.type"
        :closable="false"
        show-icon
        :class="currentAlert.className"
      >
        <template #title>
          <span class="break-words [overflow-wrap:anywhere]">{{ currentAlert.message }}</span>
        </template>
      </ElAlert>

      <ElCollapse v-if="showReviewDetails" class="doc-manager-review-collapse">
        <ElCollapseItem name="review-details">
          <template #title>查看校验细节</template>
          <div class="space-y-4 pt-2">
            <section
              v-for="group in reviewDetailGroups"
              :key="group.label"
              class="space-y-2"
            >
              <p class="m-0 text-sm font-medium text-slate-700">{{ group.label }}</p>
              <ul class="m-0 list-disc space-y-1 pl-5 text-sm text-slate-600">
                <li
                  v-for="item in group.items"
                  :key="`${group.label}-${item}`"
                  class="break-words [overflow-wrap:anywhere]"
                >
                  {{ item }}
                </li>
              </ul>
            </section>
          </div>
        </ElCollapseItem>
      </ElCollapse>

      <div
        v-if="showEmptySkeleton"
        class="rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 px-4 py-4"
      >
        <div class="space-y-3">
          <p class="m-0 text-sm text-slate-500">总结内容会显示在这里</p>
          <ElSkeleton animated :rows="5" />
        </div>
      </div>

      <div v-else class="max-h-[min(56vh,680px)] overflow-y-auto pr-1">
        <ElInput
          v-model="summaryPreviewContentModel"
          type="textarea"
          :autosize="{ minRows: 12, maxRows: 20 }"
          resize="vertical"
          spellcheck="false"
          placeholder="总结内容会显示在这里"
          :readonly="isSummaryLoading || isSubmitting"
          class="doc-manager-summary-textarea"
        />
      </div>
    </div>

    <template #footer>
      <div class="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <ElButton :disabled="isSubmitting || isSummaryLoading" @click="emit('generate')">
          重新生成
        </ElButton>
        <ElButton :disabled="isSubmitting" @click="emit('close')">取消</ElButton>
        <ElButton
          type="primary"
          :disabled="summaryApplyDisabled"
          @click="emit('apply')"
        >
          应用覆盖
        </ElButton>
      </div>
    </template>
  </ElDialog>
</template>
