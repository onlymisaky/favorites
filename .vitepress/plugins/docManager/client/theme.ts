import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import "element-plus/dist/index.css";
import { h } from "vue";
import type { DocManagerOptions } from "../shared/types";
import { initializeDocManagerHistory, recordDocManagerRoute } from "./history";
import { installDocManagerUi } from "./installUi";
import DocManagerPanel from "./components/DocManagerPanel.vue";
import "./style.css";

export function createDocManagerTheme(options: DocManagerOptions = {}) {
  const mountSlot = options.mountSlot ?? "doc-top";
  const shouldMountPanel = import.meta.env.DEV;

  return {
    Layout: () =>
      h(DefaultTheme.Layout, null, {
        [mountSlot]: () => (shouldMountPanel ? h(DocManagerPanel) : null),
      }),
    enhanceApp: (({ app, router }) => {
      if (!shouldMountPanel) {
        return;
      }

      installDocManagerUi(app);
      initializeDocManagerHistory(router.route.path);
      router.onAfterRouteChange = (to) => {
        recordDocManagerRoute(to);
      };
    }) satisfies NonNullable<Theme["enhanceApp"]>,
  };
}
