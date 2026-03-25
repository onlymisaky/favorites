import type { DefaultTheme } from "vitepress";
import vitepressBar from "vite-plugin-vitepress-bar";

export function createSidebarNavigationPlugin() {
  return vitepressBar({
    filter(fileInfo) {
      const normalizedName = fileInfo.name.toLowerCase();
      return normalizedName !== "readme.md" && !fileInfo.name.startsWith(".");
    },
    complete(bar) {
      const classified = bar.nav.filter((item) => item.text !== "-not-classified");
      const classifiedItems = classified
        .map((item) => {
          const firstItemLink = item.items?.[0]?.link;
          const link = firstItemLink ?? item.link;

          if (!item.text || !link) {
            return null;
          }

          return {
            text: item.text,
            link,
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);

      const notClassifiedGroup = bar.sidebar["/-not-classified/"]?.[0];
      const notClassifiedItems = notClassifiedGroup?.items ?? [];
      const notClassifiedLink =
        notClassifiedItems[0]?.link ?? notClassifiedGroup?.link;
      const nextNav: DefaultTheme.NavItem[] = [
        {
          text: "已归类",
          items: classifiedItems,
        },
      ];

      if (notClassifiedLink) {
        nextNav.push({
          text: "未归类",
          link: notClassifiedLink,
          activeMatch: "/-not-classified",
        });
      }

      bar.nav = nextNav;
      bar.sidebar["/-not-classified/"] = notClassifiedItems;
      return bar;
    },
  });
}
