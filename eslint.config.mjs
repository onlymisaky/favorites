import antfu from '@antfu/eslint-config'
import globals from 'globals'

export default antfu(
  {
    vue: true,
    lessOpinionated: true,
    ignores: [
      'wechat/**',
      '.vitepress/cache/**',
      '.vitepress/dist/**',
      'scripts/.cache/**',
      '.vitepress/config.mts.timestamp-*.mjs',
    ],
  },
  {
    rules: {
      'e18e/prefer-static-regex': 'off',
      'node/prefer-global/buffer': 'off',
      'node/prefer-global/process': 'off',
      'regexp/no-super-linear-backtracking': 'off',
    },
  },
  {
    files: [
      '.vitepress/config.mts',
      '.vitepress/theme/**/*.{ts,mts,vue}',
      '.vitepress/plugins/**/*.{ts,mts,vue}',
      'scripts/**/*.{js,mjs,cjs,ts,mts,cts}',
      'eslint.config.mjs',
    ],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    files: [
      '.vitepress/theme/**/*.{ts,mts,vue}',
      '.vitepress/plugins/docManager/client/**/*.{ts,mts,vue}',
    ],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },
)
