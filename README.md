# favorites

文章收集。

## 批量重归类脚本

项目内置了一个基于 OpenAI Chat Completions 的批量重归类脚本：

```bash
npm run docs:reclassify -- [options]
```

这个脚本会扫描 `wechat` 下所有 Markdown 文件，排除任意 `index.md`，只根据文件名做 AI 归类。
脚本源码按职责拆分在 `scripts/reclassify/` 目录，入口是 `scripts/reclassify-wechat-by-title.ts`，通过 `tsx` 运行。

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
  - 不传时读取 `OPENAI_MODEL`

- `--baseUrl=<url>` / `--base-url=<url>`
  - 指定 OpenAI 兼容接口的基础地址
  - 不传时读取 `OPENAI_BASE_URL`

- `--apiKey=<key>` / `--api-key=<key>`
  - 指定 API Key
  - 不传时读取 `OPENAI_API_KEY`

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

显式指定模型和接口地址：

```bash
npm run docs:reclassify -- --model=gpt-4.1-mini --baseUrl=https://api.openai.com/v1
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
