<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useData, useRouter, withBase } from "vitepress";
import { DOC_MANAGER_BASE } from "../../shared";
import type { CategoryResponse, MutationResponse } from "../../shared/types";
import { getDocManagerFallbackPath, getDocManagerReturnPath } from "../history";
import { useDraggablePanel } from "../composables/useDraggablePanel";
import { useSummaryPreview } from "../composables/useSummaryPreview";
import DocManagerMoveDialog from "./DocManagerMoveDialog.vue";
import DocManagerSummaryDialog from "./DocManagerSummaryDialog.vue";

const createMode = "create";
const existingMode = "existing";

const router = useRouter();
const { page, frontmatter } = useData();

const panelRef = ref<HTMLElement | null>(null);
const isSubmitting = ref(false);
const isMoveDialogOpen = ref(false);
const isSummaryDialogOpen = ref(false);
const categories = ref<string[]>([]);
const categoriesLoaded = ref(false);
const categoriesError = ref("");
const selectedMode = ref<"existing" | "create">(existingMode);
const selectedCategory = ref("");
const newCategoryName = ref("");
const feedbackMessage = ref("");
const feedbackType = ref<"error" | "success" | "">("");
const summarizeOnOpen = ref(true);

const isVisible = computed(() => {
  if (!import.meta.env.DEV) {
    return false;
  }

  if (page.value.isNotFound || frontmatter.value.layout === "home") {
    return false;
  }

  const nextRelativePath = page.value.relativePath;
  return (
    Boolean(nextRelativePath) &&
    nextRelativePath.endsWith(".md") &&
    !nextRelativePath.endsWith("/index.md")
  );
});

const relativePath = computed(() => page.value.relativePath);
const currentCategory = computed(() => relativePath.value.split("/")[0] ?? "");
const currentFileName = computed(
  () => relativePath.value.split("/").at(-1) ?? "",
);
const availableCategories = computed(() =>
  categories.value.filter((category) => category !== currentCategory.value),
);
const newCategoryError = computed(() =>
  validateCategoryName(newCategoryName.value, currentCategory.value),
);
const moveDisabled = computed(() => {
  if (isSubmitting.value) {
    return true;
  }

  if (selectedMode.value === existingMode) {
    return !selectedCategory.value;
  }

  return Boolean(newCategoryError.value);
});
const feedbackAlertType = computed(() =>
  feedbackType.value === "error" ? "error" : "success",
);

const {
  isSummaryLoading,
  summaryPhase,
  summaryPreviewContent,
  summaryError,
  summaryStatusMessage,
  reviewPassed,
  reviewAttemptCount,
  reviewFeedback,
  reviewIssues,
  reviewDetails,
  selectedSummaryModel,
  selectedReviewModel,
  summaryModelOptions,
  generateSummaryPreview,
  applySummary,
  resetSummaryState,
} = useSummaryPreview(relativePath);

const summaryApplyDisabled = computed(
  () =>
    isSubmitting.value ||
    isSummaryLoading.value ||
    !summaryPreviewContent.value.trim(),
);

const { panelStyle, isDragging, handleDragStart } = useDraggablePanel(
  panelRef,
  isVisible,
  isMoveDialogOpen,
  isSummaryDialogOpen,
);

watch(
  availableCategories,
  (nextCategories) => {
    if (selectedMode.value === existingMode) {
      selectedCategory.value = nextCategories[0] ?? "";
    }
  },
  { immediate: true },
);

watch(isMoveDialogOpen, (open) => {
  if (!open) {
    categoriesError.value = "";
  }
});

watch(isSummaryDialogOpen, (open) => {
  if (!open) {
    resetSummaryState();
  }
});

async function openMoveDialog() {
  isMoveDialogOpen.value = true;
  clearPanelFeedback();

  if (!categoriesLoaded.value) {
    await loadCategories();
  }
}

async function openSummaryDialog() {
  if (isSubmitting.value || isSummaryLoading.value) {
    return;
  }

  isSummaryDialogOpen.value = true;
  clearPanelFeedback();

  if (summarizeOnOpen.value) {
    await generateSummaryPreview();
  }
}

function closeSummaryDialog() {
  isSummaryDialogOpen.value = false;
}

async function loadCategories() {
  categoriesError.value = "";

  try {
    const response = await fetch(withBase(DOC_MANAGER_BASE + "/categories"));
    const data = (await response.json()) as CategoryResponse;

    if (!response.ok || !data.success || !data.categories) {
      categoriesError.value = data.error ?? "分类列表加载失败。";
      return;
    }

    categories.value = data.categories;
    categoriesLoaded.value = true;
  } catch {
    categoriesError.value = "分类列表加载失败。";
  }
}

async function handleDelete() {
  if (isSubmitting.value || isSummaryLoading.value) {
    return;
  }

  try {
    await ElMessageBox.confirm(
      `确认删除文档「${currentFileName.value}」吗？`,
      "删除文档",
      {
        type: "warning",
        confirmButtonText: "确认删除",
        cancelButtonText: "取消",
        draggable: true,
      },
    );
  } catch {
    return;
  }

  await submitMutation(
    "/delete",
    { relativePath: relativePath.value },
    "文档已删除。",
  );
}

async function handleMove() {
  if (moveDisabled.value) {
    return;
  }

  const targetDirName =
    selectedMode.value === existingMode
      ? selectedCategory.value
      : newCategoryName.value.trim();

  await submitMutation(
    "/move",
    {
      relativePath: relativePath.value,
      targetDirName,
    },
    "文档已归类。",
  );
}

async function handleApplySummary() {
  if (summaryApplyDisabled.value) {
    return;
  }

  isSubmitting.value = true;
  summaryError.value = "";
  clearPanelFeedback();

  try {
    const data = await applySummary();

    if (!data.success) {
      summaryError.value = data.error ?? "总结写回失败。";
      return;
    }

    feedbackType.value = "success";
    feedbackMessage.value = "总结已覆盖原文。";
    ElMessage.success("总结已覆盖原文。");
    isSummaryDialogOpen.value = false;

    window.setTimeout(() => {
      window.location.reload();
    }, 300);
  } catch {
    summaryError.value = "总结写回失败。";
  } finally {
    isSubmitting.value = false;
  }
}

async function submitMutation(
  pathname: string,
  payload: Record<string, string>,
  successMessage: string,
) {
  isSubmitting.value = true;
  clearPanelFeedback();
  let succeeded = false;

  try {
    const response = await fetch(withBase(DOC_MANAGER_BASE + pathname), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = (await response.json()) as MutationResponse;

    if (!response.ok || !data.success) {
      feedbackType.value = "error";
      feedbackMessage.value = data.error ?? "操作失败。";
      ElMessage.error(feedbackMessage.value);
      return;
    }

    feedbackType.value = "success";
    feedbackMessage.value = successMessage;
    ElMessage.success(successMessage);
    succeeded = true;

    const redirectPath =
      getDocManagerReturnPath() ||
      data.redirectPath ||
      getDocManagerFallbackPath();
    await router.go(redirectPath);
  } catch {
    feedbackType.value = "error";
    feedbackMessage.value = "操作失败。";
    ElMessage.error("操作失败。");
  } finally {
    isSubmitting.value = false;
    if (succeeded) {
      isMoveDialogOpen.value = false;
    }
  }
}

function clearPanelFeedback() {
  feedbackMessage.value = "";
  feedbackType.value = "";
}

function updateSelectedMode(value: "existing" | "create") {
  selectedMode.value = value;
}

function updateSelectedCategory(value: string) {
  selectedCategory.value = value;
}

function updateNewCategoryName(value: string) {
  newCategoryName.value = value;
}

function updateSelectedSummaryModel(
  value: (typeof selectedSummaryModel)["value"],
) {
  selectedSummaryModel.value = value;
}

function updateSelectedReviewModel(
  value: (typeof selectedReviewModel)["value"],
) {
  selectedReviewModel.value = value;
}

function updateSummaryPreviewContent(value: string) {
  summaryPreviewContent.value = value;
}

function validateCategoryName(value: string, currentDirName: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return "请输入分类名。";
  }

  if (trimmedValue === "." || trimmedValue === "..") {
    return "分类名不合法。";
  }

  if (/[\\/]/.test(trimmedValue)) {
    return "仅支持一级分类。";
  }

  if (/[:*?"<>|]/.test(trimmedValue)) {
    return "分类名包含不支持的字符。";
  }

  if (trimmedValue === currentDirName) {
    return "当前文档已在该分类下。";
  }

  return "";
}
</script>

<template>
  <section
    v-if="isVisible"
    ref="panelRef"
    class="fixed right-6 bottom-6 z-[60] flex w-[min(360px,calc(100vw-32px))] flex-col gap-4 overflow-hidden rounded-[24px] border border-slate-200/80 bg-white/92 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.22)] backdrop-blur-xl max-sm:right-4 max-sm:bottom-4 max-sm:left-4 max-sm:w-auto"
    :class="{ 'select-none cursor-grabbing': isDragging }"
    :style="panelStyle"
  >
    <button
      class="inline-flex w-fit cursor-grab items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:border-slate-300 hover:bg-slate-100 max-sm:w-full max-sm:justify-center"
      type="button"
      aria-label="拖拽移动文档工具卡片"
      @mousedown="handleDragStart"
      @touchstart="handleDragStart"
    >
      <span
        aria-hidden="true"
        class="h-3.5 w-3.5 rounded-full bg-[radial-gradient(circle,currentColor_1.2px,transparent_1.2px)] [background-size:7px_7px]"
      />
      <span>拖拽移动</span>
    </button>

    <div class="flex min-w-0 flex-col items-start gap-3">
      <span
        class="inline-flex items-center justify-center rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold tracking-[0.18em] text-blue-700 uppercase"
      >
        Dev
      </span>
      <span class="line-clamp-2 text-sm leading-6 text-slate-500">{{ relativePath }}</span>
    </div>

    <div class="flex flex-col gap-4">
      <div
        class="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4"
      >
        <ElButton
          type="primary"
          plain
          :disabled="isSubmitting || isSummaryLoading"
          @click="openSummaryDialog"
        >
          总结
        </ElButton>
        <ElCheckbox
          v-model="summarizeOnOpen"
          :disabled="isSubmitting || isSummaryLoading"
          class="!mr-0 text-xs !text-slate-600"
        >
          打开弹窗立即总结
        </ElCheckbox>
      </div>

      <div class="flex gap-3 max-sm:flex-col">
        <ElButton
          type="danger"
          class="!min-w-[96px] !flex-1"
          :disabled="isSubmitting || isSummaryLoading"
          @click="handleDelete"
        >
          删除
        </ElButton>
        <ElButton
          type="primary"
          class="!ml-0 !min-w-[96px] !flex-1"
          :disabled="isSubmitting || isSummaryLoading"
          @click="openMoveDialog"
        >
          归类
        </ElButton>
      </div>
    </div>

    <ElAlert
      v-if="feedbackMessage"
      :type="feedbackAlertType"
      :closable="false"
      show-icon
    >
      <template #title>{{ feedbackMessage }}</template>
    </ElAlert>

    <DocManagerMoveDialog
      :open="isMoveDialogOpen"
      :current-category="currentCategory"
      :categories-error="categoriesError"
      :available-categories="availableCategories"
      :is-submitting="isSubmitting"
      :selected-mode="selectedMode"
      :selected-category="selectedCategory"
      :new-category-name="newCategoryName"
      :new-category-error="newCategoryError"
      :move-disabled="moveDisabled"
      @close="isMoveDialogOpen = false"
      @confirm="handleMove"
      @update:selected-mode="updateSelectedMode"
      @update:selected-category="updateSelectedCategory"
      @update:new-category-name="updateNewCategoryName"
    />

    <DocManagerSummaryDialog
      :open="isSummaryDialogOpen"
      :current-file-name="currentFileName"
      :is-submitting="isSubmitting"
      :is-summary-loading="isSummaryLoading"
      :summary-phase="summaryPhase"
      :summary-error="summaryError"
      :summary-status-message="summaryStatusMessage"
      :summary-preview-content="summaryPreviewContent"
      :summary-apply-disabled="summaryApplyDisabled"
      :review-passed="reviewPassed"
      :review-attempt-count="reviewAttemptCount"
      :review-feedback="reviewFeedback"
      :review-issues="reviewIssues"
      :review-details="reviewDetails"
      :summary-model-options="summaryModelOptions"
      :selected-summary-model="selectedSummaryModel"
      :selected-review-model="selectedReviewModel"
      @close="closeSummaryDialog"
      @generate="generateSummaryPreview"
      @apply="handleApplySummary"
      @update:selected-summary-model="updateSelectedSummaryModel"
      @update:selected-review-model="updateSelectedReviewModel"
      @update:summary-preview-content="updateSummaryPreviewContent"
    />
  </section>
</template>
