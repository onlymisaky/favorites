import { ref } from "vue";
import { DOC_MANAGER_FALLBACK_PATH } from "../shared";

const currentPath = ref<string | null>(null);
const previousPath = ref<string | null>(null);

export function initializeDocManagerHistory(initialPath: string) {
  if (!currentPath.value) {
    currentPath.value = initialPath;
  }
}

export function recordDocManagerRoute(nextPath: string) {
  if (!nextPath) {
    return;
  }

  if (currentPath.value && currentPath.value !== nextPath) {
    previousPath.value = currentPath.value;
  }

  currentPath.value = nextPath;
}

export function getDocManagerReturnPath() {
  return previousPath.value ?? DOC_MANAGER_FALLBACK_PATH;
}

export function getDocManagerFallbackPath() {
  return DOC_MANAGER_FALLBACK_PATH;
}
