<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  open: boolean;
  currentCategory: string;
  categoriesError: string;
  availableCategories: string[];
  isSubmitting: boolean;
  selectedMode: "existing" | "create";
  selectedCategory: string;
  newCategoryName: string;
  newCategoryError: string;
  moveDisabled: boolean;
}>();

const emit = defineEmits<{
  (event: "close"): void;
  (event: "confirm"): void;
  (event: "update:selectedMode", value: "existing" | "create"): void;
  (event: "update:selectedCategory", value: string): void;
  (event: "update:newCategoryName", value: string): void;
}>();

const selectedModeModel = computed({
  get: () => props.selectedMode,
  set: (value: "existing" | "create") => emit("update:selectedMode", value),
});

const selectedCategoryModel = computed({
  get: () => props.selectedCategory,
  set: (value: string) => emit("update:selectedCategory", value),
});

const newCategoryNameModel = computed({
  get: () => props.newCategoryName,
  set: (value: string) => emit("update:newCategoryName", value),
});
</script>

<template>
  <ElDialog
    :model-value="open"
    width="560px"
    destroy-on-close
    append-to-body
    align-center
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
        <section class="space-y-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
          <div class="space-y-2">
            <p class="m-0 text-sm font-medium text-slate-700">归类方式</p>
            <ElRadioGroup v-model="selectedModeModel" class="flex flex-col gap-3">
              <ElRadio value="existing" size="large">移动到已有分类</ElRadio>
              <ElRadio value="create" size="large">新建分类</ElRadio>
            </ElRadioGroup>
          </div>
        </section>

        <section class="space-y-4">
          <div class="space-y-2">
            <p class="m-0 text-sm font-medium text-slate-700">已有分类</p>
            <ElSelect
              v-model="selectedCategoryModel"
              placeholder="选择目标分类"
              class="w-full"
              :disabled="selectedMode !== 'existing' || availableCategories.length === 0"
            >
              <ElOption
                v-for="category in availableCategories"
                :key="category"
                :label="category"
                :value="category"
              />
            </ElSelect>
            <p
              v-if="availableCategories.length === 0"
              class="m-0 text-xs leading-5 text-slate-500"
            >
              暂无可选分类。
            </p>
          </div>

          <div class="space-y-2">
            <p class="m-0 text-sm font-medium text-slate-700">新分类</p>
            <ElInput
              v-model="newCategoryNameModel"
              placeholder="输入新的一级分类名"
              :disabled="selectedMode !== 'create'"
            />
            <ElAlert
              v-if="selectedMode === 'create' && newCategoryError"
              type="error"
              :closable="false"
              show-icon
              :title="newCategoryError"
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
