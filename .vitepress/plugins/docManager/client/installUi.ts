import type { App } from "vue";
import ElementPlus from "element-plus";

const installKey = "__favorites_doc_manager_element_plus_installed__";

export function installDocManagerUi(app: App) {
  const appState = app.config.globalProperties as Record<string, unknown>;

  if (appState[installKey]) {
    return;
  }

  app.use(ElementPlus);
  appState[installKey] = true;
}
