import type { SummaryReviewDetails } from "../../shared";
import type {
  ChunkSummary,
  SummaryChunk,
  SummaryCoverageSnapshot,
} from "../../shared/types";

function formatNamedList(label: string, values: string[]) {
  return `${label}：${values.length > 0 ? values.join("；") : "无"}`;
}

function formatCoverageSnapshot(snapshot?: SummaryCoverageSnapshot) {
  if (!snapshot) {
    return "未提取到覆盖要点。";
  }

  return [
    formatNamedList("原文链接", snapshot.sourceLinks),
    formatNamedList("参考链接", snapshot.referenceLinks),
    formatNamedList("重要图片", snapshot.importantImages),
    formatNamedList("核心概念", snapshot.coreConcepts),
    formatNamedList("关键结论", snapshot.keyConclusions),
    formatNamedList("限制条件", snapshot.constraints),
    formatNamedList("代码要点", snapshot.codeBlocksSummary),
  ].join("\n");
}

function formatChunkSummaries(chunkSummaries: ChunkSummary[]) {
  if (chunkSummaries.length === 0) {
    return "无分段摘要。";
  }

  return chunkSummaries
    .map((chunk) =>
      [
        `### 分段 ${chunk.chunkIndex}${chunk.heading ? ` · ${chunk.heading}` : ""}`,
        chunk.summary.trim(),
      ].join("\n"),
    )
    .join("\n\n");
}

function formatReviewDetails(details?: SummaryReviewDetails) {
  if (!details) {
    return "";
  }

  const sections = [
    formatNamedList("遗漏章节", details.missingSections),
    formatNamedList("遗漏链接", details.missingLinks),
    formatNamedList("遗漏图片", details.missingImages),
    formatNamedList("遗漏概念", details.missingConcepts),
    formatNamedList("遗漏限制条件", details.missingConstraints),
  ].filter((section) => !section.endsWith("：无"));

  if (sections.length === 0) {
    return "";
  }

  return ["", "以下是上一次评审识别出的具体缺失项：", ...sections].join("\n");
}

export function buildSummaryPrompt(options: {
  relativePath: string;
  title: string;
  reviewFeedback?: string;
  previousSummaryContent?: string;
  previousReviewDetails?: SummaryReviewDetails;
  attemptCount?: number;
  coverageSnapshot?: SummaryCoverageSnapshot;
  chunkSummaries?: ChunkSummary[];
}) {
  const {
    relativePath,
    title,
    reviewFeedback = "",
    previousSummaryContent = "",
    previousReviewDetails,
    attemptCount = 1,
    coverageSnapshot,
    chunkSummaries = [],
  } = options;

  const retryInstructions = reviewFeedback
    ? [
        "",
        `这是第 ${attemptCount} 次生成，上一次摘要未通过校验。`,
        previousSummaryContent
          ? [
              "以下是上一次提交的摘要，请在此基础上修复问题，不要重复提交同类缺陷：",
              previousSummaryContent,
            ].join("\n")
          : "",
        "",
        "以下是上一次评审结论，请逐条修复：",
        reviewFeedback,
        formatReviewDetails(previousReviewDetails),
      ]
    : [];

  return [
    "你是一个专业的技术文章总结助手。",
    "请基于我提供的文章覆盖要点和分段事实摘要，输出一份高保真的最终总结。",
    "**总体要求**",
    "- 不改变原文中的知识点、结论、观点",
    "- 不做额外延伸或主观补充",
    "- 内容必须准确、克制、信息密度高",
    "**输出格式**",
    "- 输出必须为 Markdown 正文",
    "- 使用清晰的标题层级（# / ## / ###）",
    "- 多用短句 + 要点化（bullet points）",
    "- 避免长段落和废话",
    "- 句子尽可能短（<= 15字优先）",
    "- 删除所有废话、过渡词",
    "**内容保留规则**",
    "1. 核心内容优先保留",
    " - 核心概念",
    " - 关键结论",
    " - 适用场景",
    " - 限制条件 / 注意事项",
    "2. 代码处理",
    " - 保留关键代码片段（不要删减核心逻辑）",
    " - 删除无关/冗长代码（如样板代码）",
    " - 使用 ```语言 标注代码块",
    "3. 图片处理",
    " - 保留所有重要图片",
    " - 使用 Markdown 图片格式：![](图片URL)",
    " - 不丢失图片链接",
    "4. 链接处理（必须完整保留）",
    " - 保留文中所有：",
    "   - 外部引用链接",
    "   - 参考资料链接",
    "   - 官方文档链接",
    " - 不允许遗漏",
    "5. 原文链接",
    " - 如果文章中提供“原文链接 / 来源链接”，必须放在最顶部单独一行",
    "6. 如果我提供了上一轮失败摘要和评审反馈，你必须基于它们修复问题，不要重复提交相同问题版本",
    "7. 仅输出最终 Markdown，不要解释，不要附带额外说明",
    "",
    `文件路径：${relativePath}`,
    `文章标题：${title || "未显式声明"}`,
    "",
    "【必须保留的覆盖要点】",
    formatCoverageSnapshot(coverageSnapshot),
    "",
    "【分段事实摘要】",
    formatChunkSummaries(chunkSummaries),
    ...retryInstructions.filter(Boolean),
  ].join("\n");
}

export function buildSummaryReviewPrompt(options: {
  coverageSnapshot: SummaryCoverageSnapshot;
  chunkSummaries: ChunkSummary[];
  relativePath: string;
  title: string;
  summaryBody: string;
}) {
  const { coverageSnapshot, chunkSummaries, relativePath, title, summaryBody } =
    options;

  return [
    "你是一个严格的技术文章摘要评审助手。",
    "请对照文章覆盖要点和分段事实摘要，判断最终摘要是否合格。",
    "合格标准：",
    "1. 不改变原文知识点、结论、观点",
    "2. 核心概念、关键结论、适用场景、限制条件不能遗漏",
    "3. 关键代码逻辑不能被错误删减",
    "4. 重要图片、链接、参考资料、原文链接不能遗漏",
    "5. 输出应为结构清晰、信息密度高的 Markdown 摘要",
    "6. 不允许主观发挥或引入原文没有的信息",
    '请只输出 JSON，不要输出 Markdown，不要解释。JSON 格式必须为：{"passed":boolean,"feedback":"string","issues":["string"],"missingSections":["string"],"missingLinks":["string"],"missingImages":["string"],"missingConcepts":["string"],"missingConstraints":["string"]}',
    "",
    `文件路径：${relativePath}`,
    `文章标题：${title || "未显式声明"}`,
    "",
    "【文章覆盖要点】",
    formatCoverageSnapshot(coverageSnapshot),
    "",
    "【分段事实摘要】",
    formatChunkSummaries(chunkSummaries),
    "",
    "【待评审摘要】",
    summaryBody.trim(),
  ].join("\n");
}

export function buildCoverageExtractionPrompt(options: {
  body: string;
  relativePath: string;
  title: string;
}) {
  return [
    "你是一个技术文章信息抽取助手。",
    "请从文章中抽取后续摘要必须保留的覆盖要点。",
    "文章可能不是标准 Markdown，可能来自公众号或其他拷贝来源，请根据文本内容识别结构，不要依赖 Markdown 标题。",
    '只输出 JSON，不要解释。JSON 格式必须为：{"sourceLinks":["string"],"referenceLinks":["string"],"importantImages":["string"],"coreConcepts":["string"],"keyConclusions":["string"],"constraints":["string"],"codeBlocksSummary":["string"]}',
    "",
    `文件路径：${options.relativePath}`,
    `文章标题：${options.title || "未显式声明"}`,
    "",
    options.body.trim(),
  ].join("\n");
}

export function buildChunkSummaryPrompt(options: {
  chunk: SummaryChunk;
  chunkCount: number;
  coverageSnapshot: SummaryCoverageSnapshot;
  relativePath: string;
  title: string;
}) {
  return [
    "你是一个技术文章分段整理助手。",
    "请根据当前分段内容，产出一份高信息密度的分段事实摘要。",
    "文章可能不是标准 Markdown，不要依赖 Markdown 结构本身。",
    "要求：",
    "- 只总结当前分段，不补充原文没有的信息",
    "- 保留本段中的关键概念、结论、限制、链接、图片、代码要点",
    "- 输出 Markdown 正文，优先用短句和要点",
    "- 不要写总览，不要重复其他分段内容",
    "",
    `文件路径：${options.relativePath}`,
    `文章标题：${options.title || "未显式声明"}`,
    `当前分段：${options.chunk.chunkIndex}/${options.chunkCount}`,
    options.chunk.heading
      ? `分段标题：${options.chunk.heading}`
      : "分段标题：未识别",
    "",
    "【全局必须保留的覆盖要点】",
    formatCoverageSnapshot(options.coverageSnapshot),
    "",
    "【当前分段原文】",
    options.chunk.content.trim(),
  ].join("\n");
}
