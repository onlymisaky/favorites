import { DefaultTheme, defineConfig } from 'vitepress'
import vitepressBar from 'vite-plugin-vitepress-bar'
import * as compiler from '@vue/compiler-sfc'
import path from 'path'

const compilerProxy = new Proxy(compiler, {
  get(target, prop, receiver) {
    const originalMethod = Reflect.get(target, prop, receiver)
    if (typeof originalMethod === 'function') {
      return function (...args: any[]) {
        const result = originalMethod.apply(this, args)
        if (prop === 'parse') {
          // "<script >\nexport const __pageData = JSON.parse(\"{\\\"title\\\":\\\"\\\",\\\"description\\\":\\\"\\\",\\\"frontmatter\\\":{},\\\"headers\\\":[],\\\"relativePath\\\":\\\"not-classified/a.md\\\",\\\"filePath\\\":\\\"a.md\\\",\\\"lastUpdated\\\":null}\")\nexport default {name:\"not-classified/a.md\"}</script>\n<template><div></div></template>"
          if (result.errors && result.errors.length > 0) {
            const [content, ...otherArgs] = args
            // const scriptContentRegex = /<script\s*>(.+?)<\/script>/s;
            // const scriptContent = scriptContentRegex.exec(content as string)![1];
            const allScriptTagsRegex = /<script\s*>.*?<\/script>/gs;
            const scriptTags = content.match(allScriptTagsRegex)
            return originalMethod.apply(this,
              [scriptTags[0] + "\n<template><div>" + path.basename(args[1].filename) + "</div></template>", ...otherArgs]
            )
          }
        }
        return result
      }
    }
    return originalMethod
  }
})

export default defineConfig({
  title: '笔记&收藏&学习',
  description: '好记性不如烂笔头',
  srcDir: 'wechat',
  base: '/favorites/',
  ignoreDeadLinks: true,
  vue: {
    compiler: compilerProxy
  },
  vite: {
    build: {
      rollupOptions: {
        external: ['video.mp4', 'placeholder.jpg']
      }
    },
    plugins: [
      vitepressBar({
        filter(fileInfo) {
          return fileInfo.name.toLowerCase() !== 'readme.md'
        },
        complete(bar) {
          debugger
          const notClassified = bar.nav.find(item => item.text === '-not-classified')!
          const classified = bar.nav.filter(item => item.text !== '-not-classified')
          bar.nav = [
            {
              text: '已归类',
              items: classified.map((item) => {
                return {
                  text: item.text!,
                  link: item.items![0].link!
                }
              }),
            },
            {
              text: '未归类',
              link: bar.sidebar['/-not-classified/']![0].items![0].link!,
              activeMatch: '/-not-classified',
            }
          ]
          debugger
          bar.sidebar['/-not-classified/'] = bar.sidebar['/-not-classified/']![0].items!
          return bar
        }
      })
    ],
  },
  head: [
    [
      'meta',
      { name: 'referrer', content: 'no-referrer' }
    ]
  ],
  lastUpdated: true,
  themeConfig: {
    search: {
      provider: 'local',
    },
    lastUpdated: {
      text: 'Updated at',
      formatOptions: {
        dateStyle: 'full',
        timeStyle: 'medium'
      }
    },
    // https://vitepress.dev/reference/default-theme-config
    socialLinks: [
      { icon: 'github', link: 'https://github.com/onlymisaky' },
      { icon: 'npm', link: 'https://www.npmjs.com/~onlymisaky' },
    ],
  }
})
