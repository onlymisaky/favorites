import { defineConfig } from "vitepress";
import tailwindcss from "@tailwindcss/vite";
import { compilerProxy } from "./plugins/compilerProxy";
import { createDocManagerPlugin } from "./plugins/docManager/vite";
import { createSidebarNavigationPlugin } from "./plugins/sidebarNavigation";

export default defineConfig(({ command }) => ({
  title: "笔记&收藏&学习",
  description: "好记性不如烂笔头",
  srcDir: "wechat",
  base: "/favorites/",
  ignoreDeadLinks: true,
  vue: {
    compiler: compilerProxy,
  },
  vite: {
    build: {
      rollupOptions: {
        external: ["video.mp4", "placeholder.jpg"],
      },
    },
    plugins: [
      tailwindcss(),
      createSidebarNavigationPlugin(),
      ...(command === "serve" ? [createDocManagerPlugin()] : []),
    ],
  },
  head: [["meta", { name: "referrer", content: "no-referrer" }]],
  lastUpdated: true,
  themeConfig: {
    search: {
      provider: "local",
    },
    lastUpdated: {
      text: "Updated at",
      formatOptions: {
        dateStyle: "full",
        timeStyle: "medium",
      },
    },
    socialLinks: [
      { icon: "github", link: "https://github.com/onlymisaky" },
      { icon: "npm", link: "https://www.npmjs.com/~onlymisaky" },
    ],
  },
}));
