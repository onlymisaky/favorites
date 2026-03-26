> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/6ROt3BU8u1FUss-pRe8EEg)

> 本文作者系 360 奇舞团前端开发工程师

在 AI 技术高速发展的今天，Prompt 工程已经成为开发者必须掌握的新技能。尤其是在前端开发、产品设计、自动化运维等场景，如何用高效、精准的 Prompt 快速引导 AI 输出所需结果，直接决定了我们的开发效率和产品体验。

很多开发者在使用大语言模型时，常常会遇到：

*   AI 答非所问，结果偏离预期
    
*   API Token 大量浪费，调用效率低
    
*   企业难以规模化复用，每次都要重新写 Prompt
    

这些问题的根本，其实就是 **Prompt 工程没有设计好。**

本文将从实战出发，带你掌握 Prompt 工程的核心技巧，帮你写出更高效、更可控、更专业的提示词。

**一、为什么你的 Prompt 总失效？**
-----------------------

某电商公司客服机器人曾因错误回答「如何退货」导致日均投诉增加 47%。调试发现根本原因是：**缺少角色设定、任务模糊**

```
❌ 旧 Prompt：  "回答用户关于退货的问题"✅ 修正后：  "你是一名电商售后专家，严格按以下规则响应：1. 仅处理中国大陆订单2. 必须分步骤说明（1.填写工单 2.快递要求 3.退款时效）3. 遇到海外订单时回复：'请联系国际客服'"
```

**二、Prompt 工程核心六要素**
--------------------

### 2.1 六要素详细分析

一个高质量 Prompt，至少包含 6 个关键要素：

<table><thead><tr><th><section>要素</section></th><th><section>作用</section></th><th><section>技术原理</section></th><th><section>示例</section></th><th><section>道路避坑</section></th></tr></thead><tbody><tr><td><section>背景</section></td><td><section>构造场景</section></td><td><section>建立上下文</section></td><td><section>你是前端团队的代码审查助手</section></td><td><section>避免缺失上下文</section></td></tr><tr><td><section>角色</section></td><td><section>限定知识范围</section></td><td><section>解锁 LLM 转置频道</section></td><td><section>你是前端性能优化专家</section></td><td><section>避免模糊评价</section></td></tr><tr><td><section>目标</section></td><td><section>明确输出目的</section></td><td><section>纯化生成输出空间</section></td><td><section>请列出总结性能问题</section></td><td><section>避免处理多重任务</section></td></tr><tr><td><section>输入</section></td><td><section>确定信息输入</section></td><td><section>使用规范化结构</section></td><td><section>输入代码块：{{code}}</section></td><td><section>避免非结构化文本</section></td></tr><tr><td><section>输出格式</section></td><td><section>方便解析</section></td><td><section>强制 JSON / Markdown 格式</section></td><td><section>{"issue": string, "line": number}</section></td><td><section>避免自由表达</section></td></tr><tr><td><section>约束条件</section></td><td><section>限制范围</section></td><td><section>控制 Token 消耗</section></td><td><section>最多列出 5 个问题</section></td><td><section>避免较缩词组</section></td></tr></tbody></table>

### 2.2 六要素互联结构

背景、角色是 AI 上下文启动器，目标决定任务转换效率，输入、输出是解析优先线，约束条件、思考模型构成防御层。

**示例**

```
# 企业级Prompt模板（React代码审查场景）"""你是一名10年经验的前端架构师（角色），专门优化React性能（专精领域）。请分析以下代码（任务），重点关注useMemo/useCallback滥用（目标）：${code}（输入）按此JSON格式输出（格式）：{ "line": int, "issue": str, "fix": str }约束条件：1. 仅返回JSON，无解释文本2. 每个问题提供具体修复方案3. 不超过3个关键问题（控制成本）思考步骤：1. 识别非常规依赖项2. 评估重渲染风险3. 建议优化方案"""
```

背景：你是前端团队的代码审查助手  
角色：你是 React 性能优化专家  
目标：分析代码中的性能问题  
输入：{{code}}  
输出格式：{"issue": string, "line": number}  
约束：最多列出 5 个问题，不允许附代码说明

**避坑指南**：用「正向约束」替代 "不要" 类表述（如用 "仅返回" 替代 "不要解释"）

**三、编写 Prompt 的两大核心原则**
-----------------------

### 3.1 原则一：指令明确、目标清晰，避免模糊请求

AI 需要被精确指令，模糊或开放式请求会导致回答不稳定、不聚焦。

**策略一：任务拆解法（避免多目标冲突）**

将复杂目标，拆解为单一、具体的指令，避免多目标冲突。

**示例**

```
#反例帮我检查以下代码，顺便解释一下为什么这么写更好。
```

缺点：双重目标，AI 难以确定优先级。

```
#正解请检查以下 React 代码，列出所有潜在性能问题，不要解释原因。拆解后：一个请求只包含一个目标。
```

**策略二：使用动词驱动任务（避免 AI 自由发挥）**

首选 “列出”、“总结”、“判断”、“生成” 等任务型动词，避免用 “帮我”、“分析一下” 这种模糊语气。

**示例**

```
#反例帮我看看这段代码有没有问题？
```

缺点：模糊，输出方向不确定。

```
#正解请列出以下代码中所有潜在的 TypeScript 类型错误，最多 3 个。
```

明确请求动词，输出更精准。

**策略三：指定边界和重点（控制任务范围）**

通过约束关键词（最多、必须、只能），帮助 AI 控制输出范围。

**示例**

```
#反例请分析这段前端代码。
```

缺点：范围过大，容易偏题。

```
#正解请检查以下 Vue3 代码，重点关注：- 是否存在响应式数据丢失- 是否存在无意义的 DOM 更新最多列出 5 个问题。
```

明确边界，提升 AI 聚焦能力。

### 3.2 **原则二：**结构化输出，方便解析与集成

AI 的输出应该尽量易于程序解析，特别适用于 API 场景，必须要求结构化。

**策略一：强制输出格式（推荐 JSON）**

提前约定 JSON、表格、列表等输出格式。

**示例**

```
#反例请列出这段代码的问题。
```

缺点：AI 可能用自然语言输出，难以解析。

```
#正解请列出以下代码的问题，使用 JSON 格式返回：[ { "line": 行号, "issue": "问题描述" }]输入代码：{{code}}
```

要求结构化输出，方便后端解析。

**策略二：给出输出模板示例（提高一致性）**

明确输出格式，提供参考答案，提升准确率。提供示例，AI 输出更稳定。

**示例**

```
请检查以下 JavaScript 代码的潜在错误。请使用以下 JSON 格式输出：[  { "line": 12, "issue": "变量未定义" },  { "line": 27, "issue": "潜在内存泄漏" }]输入代码：{{code}}约束：- 不要输出解释- 每个问题描述不超过 15 字- 最多列出 5 个问题
```

**策略三：指定语言、字数、数量**

控制输出，防止 Token 浪费。

**示例**

```
请用中文回答，答案不要超过 100 字。最多列出 3 个建议。请输出 Markdown 表格，表头为「问题位置」和「建议改进」。
```

四、 Prompt 实用技巧
--------------

### **4.1 角色锚定法**

通过为 AI 设定特定角色身份，使其输出更符合专业场景需求的高效技巧。

**技巧 1：角色 + 领域双锁定**

*   公式：`角色身份 + 专业领域 + 任务目标`
    

```
# 反例"解释量子计算"# 正解"作为麻省理工量子物理教授，用高中生能理解的比喻解释量子隧穿效应"
```

**技巧 2：权威背书强化**

*   为角色附加权威属性（机构 / 资历 / 成就）
    

```
#示例"你是有15年临床经验的协和医院心内科主任，正在为《柳叶刀》撰写关于..."
```

**技巧 3：角色性格植入**

*   定义表达风格（严谨 / 幽默 / 犀利等）
    

```
#示例"扮演毒舌美食评论家，用尖锐但专业的口吻批评这道分子料理的三大缺陷"
```

**技巧 4：多角色对抗输出**

*   要求 AI 切换不同角色视角辩论
    

```
#示例"先以环保组织发言人立场陈述反对核电站的理由，再切换为能源部长身份逐条反驳"
```

**技巧 5： 角色行为约束**

*   限制角色响应方式（如只给结论 / 必须附数据来源）
    

```
#示例"作为最高法院法官，仅引用宪法条文和既往判例作答，不提供个人观点"
```

**实例实践**

```
// 低效写法"帮我优化这段React代码"// 高效写法"""你是一名Meta公司React核心团队成员，专门优化性能瓶颈。请审查以下代码：${code}聚焦问题：1. useMemo依赖项是否合理2. 是否存在重复渲染输出格式：{ "issue": string, "line": number, "fix": string }[]"""
```

**效果对比**：专业角色设定可使代码建议准确率提升 60%

### **4.2 约束条件设计**

**技巧**：

*   明确限制输出格式（字数、结构、语言风格）。
    
*   使用数字量化要求（如 "3 个要点""500 字内 "）。
    
*   禁止使用否定句，改用正向指令：
    

```
# 反例（易被忽略）"不要解释实现原理""总结这篇文章"# 正解（强制生效）"用50字总结，包含3个关键数据，用中文 bullet points 呈现""仅返回ES6箭头函数改写后的代码"
```

### **4.3 Few-shot 示例注入**

```
prompt = """你是一名CSS-in-JS专家，按示例转换代码：示例输入：.container { display: flex; }示例输出：const styles = { container: { display: 'flex' } }现在转换：${userInput}"""
```

**五、从单次到工程化**
-------------

### 5.1 链式思维（CoT）实战

**问题**：AI 直接跳转结论导致错误**解法**：强制分步推理

```
请按步分析：1. [数据提取] 从日志找出 ERROR 级记录2. [模式归纳] 统计各错误类型频率3. [根因推测] 结合时间戳分析触发条件
```

### 5.2 动态 Prompt 生成

```
# 根据用户水平调整输出def build_prompt(user_level):    examples = {        "beginner": "用比喻解释概念",        "expert": "直接给出数学推导"    }    return f"你是一名{user_level}级教师，教学风格：{examples[user_level]}"
```

### 5.3 企业 Prompt 模板管理

```
def build_prompt(task_type, params):    templates = {        "code_review": {            "role": f"你是{params.get('company', '某公司')}的{params['language']}技术专家",            "task": f"分析{params['framework']}代码的{params['focus']}问题",            "output": """{"issue": string, "fix": string}"""        },        "doc_gen": {            "role": "技术文档工程师",            "task": f"生成{params['component']}的API文档",            "output": "Markdown格式包含Props表格"        }    }    return"\n".join([        f"角色：{templates[task_type]['role']}",        f"任务：{templates[task_type]['task']}",        f"输出格式：{templates[task_type]['output']}",        "## 安全规则：\n1. 所有建议必须符合ESLint规范"    ])
```

六要素分析：

1. 角色是否包含「公司 + 领域 + 职级」三级信息？

2. 任务目标是否可量化测量？

3. 输入规范能否被 JSON Schema 验证？

4. 输出约束是否机器可解析？

5. 思考步骤是否覆盖异常分支？

6. 安全规则是否处理了 OWASP Top 10 风险？

总结
--

**写在最后：Prompt 是工程，不是魔法。**

高质量 Prompt 的核心，从结构设计到企业级工程化，必须通过角色、目标、输入、格式、思考、安全的系统搭建，才能让 AI 成为你真正可控的开发助手。

-END -

**如果您关注前端 + AI 相关领域可以扫码进群交流**

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/cAd6ObKOzEArGqlLlZmLVB61keywZ2APgWHNwTdK8OicE1utUcAJj1m5ZMFTL8iac51bGglnIeCR5KHicCBh5lh3A/640?wx_fmt=jpeg#imgIndex=0)

添加小编微信进群😊  

关于奇舞团
-----

奇舞团是 360 集团最大的大前端团队，非常重视人才培养，有工程师、讲师、翻译官、业务接口人、团队 Leader 等多种发展方向供员工选择，并辅以提供相应的技术力、专业力、通用力、领导力等培训课程。奇舞团以开放和求贤的心态欢迎各种优秀人才关注和加入奇舞团。  

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEBLicibtcprJISN18FgTtg2N1ichPnMqRhicrP20VfwnC4vday7gtEoiaSynIH1bas4N5kgicliakrLdtT2Q/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1#imgIndex=1)