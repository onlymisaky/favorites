import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import { createDocManagerTheme } from "../plugins/docManager/theme";
import "./style.css";

const docManagerTheme = createDocManagerTheme();

export default {
  extends: DefaultTheme,
  Layout: docManagerTheme.Layout,
  enhanceApp: docManagerTheme.enhanceApp,
} satisfies Theme;
