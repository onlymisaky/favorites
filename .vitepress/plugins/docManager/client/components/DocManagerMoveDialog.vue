<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  open: boolean;
  currentCategory: string;
  categoriesError: string;
  availableCategories: string[];
  isSubmitting: boolean;
}>();

const emit = defineEmits<{
  (event: "close"): void;
  (event: "confirm"): void;
}>();

const selectedCategoryModel = defineModel<string>("category");

function validateCategoryName(value: string, currentDirName: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return "请选择或输入分类名。";
  }

  if (props.availableCategories.includes(trimmedValue)) {
    return "";
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

const selectCategoryError = computed(() =>
  validateCategoryName(selectedCategoryModel.value, props.currentCategory),
);

const moveDisabled = computed(() => {
  if (props.isSubmitting) {
    return true;
  }

  return Boolean(selectCategoryError.value);
});

</script>

<template>
  <ElDialog
    :model-value="open"
    width="560px"
    destroy-on-close
    append-to-body
    class="doc-manager-el-dialog"
    @close="emit('close')"
  >
    <template #header>
      <div class="flex min-w-0 items-start gap-4">
        <div class="min-w-0">
          <h2 class="m-0 text-lg font-semibold text-slate-900">归类文档</h2>
          <p class="mt-1 break-words text-sm text-slate-500 [overflow-wrap:anywhere]">
            当前分类：<span class="font-medium text-slate-700">{{ currentCategory }}</span>
          </p>
        </div>
      </div>
    </template>

    <div class="doc-manager-dialog-stack">
      <ElAlert
        v-if="categoriesError"
        type="error"
        :closable="false"
        show-icon
        :title="categoriesError"
      />

      <template v-else>
        <section class="space-y-4">
          <div class="space-y-2">
            <ElSelect
              v-model="selectedCategoryModel"
              placeholder="选择目标分类"
              class="w-full"
              allow-create
              filterable
            >
              <ElOption
                v-for="category in availableCategories"
                :key="category"
                :label="category"
                :value="category"
              />
            </ElSelect>
            <ElAlert
              v-if="selectCategoryError"
              type="error"
              :closable="false"
              show-icon
              :title="selectCategoryError"
            />
          </div>
        </section>
      </template>
    </div>

    <template #footer>
      <div class="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <ElButton :disabled="isSubmitting" @click="emit('close')">取消</ElButton>
        <ElButton type="primary" :disabled="moveDisabled" @click="emit('confirm')">
          确认归类
        </ElButton>
      </div>
    </template>
  </ElDialog>
</template>
