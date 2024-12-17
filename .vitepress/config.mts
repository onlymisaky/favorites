import { DefaultTheme, defineConfig } from 'vitepress'
import vitepressBar from 'vite-plugin-vitepress-bar'

export default defineConfig({
  title: '笔记&收藏&学习',
  description: '好记性不如烂笔头',
  srcDir: 'wechat',
  rewrites(id) {
    if (id.split('/').length === 1) {
      return `/not-classified/${id}`
    }
    return id
  },
  vite: {
    plugins: [
      vitepressBar({
        excluded: ['README.md'],
        complete(bar) {
          const classified = bar.nav.reduce((acc, cur) => {
            const { link, items: _items, ...others } = cur as DefaultTheme.NavItemWithLink
            const items = _items as unknown as DefaultTheme.NavItemWithLink[]

            // 未分类
            if (!items || items.length === 0) return acc

            // 已分类,且含有 index.md
            if (link) {
              acc.push({ link, ...others } as DefaultTheme.NavItemWithLink)
              return acc
            }

            // 已分类，但不含有 index.md
            acc.push({ link: items[0].link, ...others })
            return acc
          }, [] as DefaultTheme.NavItemWithLink[])

          const notClassified = bar.nav.filter(item => !item.items && item.link) as DefaultTheme.NavItemWithLink[]
          const nav: DefaultTheme.NavItem[] = [
            { text: '已归类', items: classified, },
            { text: '未归类', link: notClassified[0].link, activeMatch: '/not-classified' }
          ]

          const sidebar = bar.sidebar;
          sidebar['/not-classified'] = sidebar['/'] || []
          delete sidebar['/']

          return { nav, sidebar }
        }
      })
    ],
  },

  themeConfig: {
    search: {
      provider: 'local',

    },
    // https://vitepress.dev/reference/default-theme-config
    socialLinks: [
      { icon: 'github', link: 'https://github.com/onlymisaky' },
      { icon: 'npm', link: 'https://www.npmjs.com/~onlymisaky' },
    ],
  }
})
