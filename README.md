# favorites

文章收集。

## 批量重归类脚本

项目内置了一个基于 `.vitepress/plugins/docManager` AI 接口的批量重归类脚本：

```bash
npm run docs:reclassify -- [options]
```

这个脚本会扫描 `wechat` 下所有 Markdown 文件，排除任意 `index.md`，只根据文件名做 AI 归类。
脚本源码已按职责拆分到 `scripts/reclassify/` 目录，`scripts/reclassify-wechat-by-title.mjs` 只保留兼容入口。

### 执行流程

- `preview`：扫描文件、按批调用 AI、归一化结果、写入结果文件
- `apply`：读取 `preview` 产出的结果文件，并按结果执行移动
- 结果文件既是预览记录，也是 `apply` 阶段的唯一输入

### 参数说明

- `--mode=preview|apply`
  - `preview`：调用 AI 批量归类，打印预览结果，并把结果写入 JSON 文件
  - `apply`：读取已有结果文件，按结果实际移动文件
  - 默认值：`preview`

- `--model=<model>`
  - 指定使用的 AI 模型
  - 可选值：
    - `openai/gpt-5.1-codex-mini`
    - `anthropic/claude-sonnet-4.6`
    - `google/gemini-3-flash`
  - 默认值：`anthropic/claude-sonnet-4.6`

- `--dir=<path>`
  - 只处理 `wechat` 下某个子目录
  - 路径按相对 `wechat` 解释，例如 `React`、`-not-classified`
  - 不传时表示处理整个 `wechat`
  - `apply` 时可以不传；不传时会直接使用结果文件里的目录范围
  - 如果 `apply` 显式传了 `--dir`，则必须和结果文件里的目录范围一致

- `--limit=<n>`
  - 只处理前 `n` 篇文章，便于先小范围验证
  - `0` 表示处理全部
  - 默认值：`0`

- `--batch-size=<n>`
  - 每次请求 AI 时，单批包含多少篇文章
  - 数值越大，请求次数越少；数值越小，单次返回更短
  - 默认值：`50`

- `--include-new-categories=true|false`
  - `true`：允许 AI 提出新的顶层分类目录
  - `false`：只能归到现有 `wechat` 顶层目录
  - 默认值：`true`

- `--result-file=<path>`
  - 指定预览结果 JSON 文件路径
  - `preview` 会写入这个文件
  - `apply` 会读取这个文件
  - 默认值：`scripts/.cache/reclassify-wechat-by-title.result.json`

### 常用命令

先预览全部：

```bash
npm run docs:reclassify -- --mode=preview
```

先预览 100 篇：

```bash
npm run docs:reclassify -- --mode=preview --limit=100
```

只预览 `-not-classified` 目录：

```bash
npm run docs:reclassify -- --mode=preview --dir=-not-classified
```

指定每批 20 篇：

```bash
npm run docs:reclassify -- --mode=preview --batch-size=20
```

不允许新分类：

```bash
npm run docs:reclassify -- --mode=preview --include-new-categories=false
```

使用已有结果执行移动：

```bash
npm run docs:reclassify -- --mode=apply
```

对目录级预览结果执行移动：

```bash
npm run docs:reclassify -- --mode=apply --dir=-not-classified
```

指定结果文件执行移动：

```bash
npm run docs:reclassify -- --mode=apply --result-file=/tmp/reclassify.json
```
