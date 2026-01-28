> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/wvK8Wx1aa41v4yeSiiPGlQ)

当前的 AI 智能体就像是一位**拥有超强算力却患有‘短期失忆症’的超级员工**：虽然它能迅速掌握复杂的单次指令，却无法将过往的交互经验沉淀为长期的工作记忆。每一次对话窗口的开启都等同于‘恢复出厂设置’，迫使你不得不反复进行基础的背景同步与流程教学，导致大量精力被消耗在低效的重复沟通之中。

继 2025 年初以 MCP 协议解决连接难题后，Anthropic 于 10 月再推杀手锏——**Agent Skills**。它将复杂的任务流程固化为可复用的‘技能组件’，让 AI 能够按需调用能力，无需重复训练。这一创新直接重塑了 AI 开发生态，让‘能力复用’成为新常态。

一、什么是 Agent Skills？
-------------------

### 1.1 Agent Skills 概念

Agent Skills 是包含指令、脚本和资源的文件夹，智能体可以发现并使用它们来更准确、更高效地完成特定任务。

用一个更生动的比喻：

*   **传统方式**：每次都要向 AI 详细解释 "如何做"
    
*   **Agent Skills**：给 AI 一本 "操作手册"，需要时自动调用
    

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEDAIGjsILsUkDOCJD2TYrOdzdYZRQUj15xnib1PK86R6SVOr5nI1WgewJ36U2IaTvTqY6e19JQ6XNQ/640?wx_fmt=png&from=appmsg#imgIndex=0)

### 1.2 Skills 与其他技术的区别

很多人会困惑：Skills、Prompts、MCP 有什么区别？

<table><thead><tr><th><section>技术</section></th><th><section>本质</section></th><th><section>作用范围</section></th><th><section>持久性</section></th></tr></thead><tbody><tr><td><strong>Prompts</strong></td><td><section>对话级指令</section></td><td><section>单次任务</section></td><td><section>临时</section></td></tr><tr><td><strong>Agent Skills</strong></td><td><section>领域知识包</section></td><td><section>可复用能力</section></td><td><section>持久化</section></td></tr><tr><td><strong>MCP</strong></td><td><section>工具连接协议</section></td><td><section>外部系统对接</section></td><td><section>持久化</section></td></tr></tbody></table>

**用软件架构来理解**：

```
应用层：Agent Skills（领域知识、工作流、最佳实践）    ↓传输层：MCP（标准化接口、工具调用）    ↓基础设施层：数据库、API、文件系统
```

如果说 MCP 为智能体提供了 "手" 来操作工具，那么 Skills 就提供了 "操作手册" 或 "SOP"，教导智能体如何正确使用这些工具。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEDAIGjsILsUkDOCJD2TYrOdiaJ2jFXwCqnL3nibhOhLb8wgia5ibV0P6gicxUf8H7Uqib3DoSb8OT9dNPicg/640?wx_fmt=png&from=appmsg#imgIndex=1)

二、Agent Skills 的技术原理
--------------------

### 2.1 渐进式披露（Progressive Disclosure）

Agent Skills 最核心的创新是**三层渐进式加载机制**：

#### **第一层：发现阶段（~50 tokens）**

智能体启动时，只加载所有技能的元数据（名称 + 描述）

```
---name: data-analysis-expertdescription: 专业数据分析技能，支持CSV/Excel处理和可视化---
```

#### **第二层：激活阶段**

当任务相关时，才加载完整的 SKILL.md 指令文档

#### **第三层：执行阶段**

按需动态访问引用的脚本和资源文件

这种设计让智能体可以同时 "掌握" 数十甚至上百个技能，而不会因为上下文过载而失效。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEDAIGjsILsUkDOCJD2TYrOdG8VXIAGTLnhJMkGuef3jfGcnJEic75ZylaVhZMibQu6KLDYYLBiaia59Wg/640?wx_fmt=png&from=appmsg#imgIndex=2)

### 2.2 标准文件结构

一个完整的 Skill 通常包含：

```
my-skill/├── SKILL.md           # 核心指令文档（必需）├── scripts/           # 可执行脚本│   ├── process.py│   └── validate.sh├── reference/         # 参考文档│   └── api-docs.md└── assets/            # 资源文件    ├── templates/    └── examples/
```

**SKILL.md 示例**：

```
---name: github-actions-debuggerdescription: 帮助调试失败的GitHub Actions工作流---# GitHub Actions调试专家## 使用时机当用户遇到CI/CD失败、构建错误或部署问题时使用## 工作流程1. 使用`list_workflow_runs`工具查看最近的运行状态2. 使用`summarize_job_log_failures`获取失败摘要3. 分析日志，定位问题根源4. 提供修复建议和代码示例## 常见问题检查清单- [ ] 环境变量和密钥配置- [ ] 依赖版本兼容性- [ ] 权限设置- [ ] 超时配置
```

三、Agent Skills 的使用
------------------

### 3.1 适用场景分析

#### **场景 1：发现自己总是重复相同的指令**

**案例**：每次让 AI 写技术文档，都要说明：

*   使用 Markdown 格式
    
*   包含目录
    
*   代码块要标注语言
    
*   添加实例和图表
    

**Skills 解决方案**：创建`technical-writing`技能包，将这些规范固化。

#### **场景 2：需要遵循特定的领域知识或规范**

**案例**：公司的品牌设计规范（颜色、字体、布局）

**Skills 解决方案**：

```
---name: brand-guidelinedescription: 公司品牌视觉规范---## 品牌色彩- 主色：#FF6B6B（活力红）- 辅色：#4ECDC4（清新蓝）- 文字色：#2C3E50（深灰）## 字体规范- 标题：思源黑体 Bold- 正文：思源宋体 Regular- 代码：Fira Code## 应用原则所有输出的视觉内容必须遵循以上规范...
```

#### **场景 3：复杂多步骤工作流**

**案例**：竞品分析报告制作

1.  收集竞品数据
    
2.  数据清洗和分析
    
3.  生成可视化图表
    
4.  撰写分析报告
    
5.  制作 PPT 演示
    

**Skills 解决方案**：组合多个技能模块

```
# 智能体自动调用技能链$web-scraper → $data-analyzer → $chart-generator → $report-writer → $pptx-creator
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEDAIGjsILsUkDOCJD2TYrOd1RvSibBtgPWRRFibBNSeWiciaFB1wd1jsLI9rCia0mjiaHx23LSjESoHQg1A/640?wx_fmt=png&from=appmsg#imgIndex=3)

### 3.2 快速上手：使用 Claude Code

#### **1: 安装 Claude Code**

```
# macOS/Linuxcurl -fsSL https://code.claude.com/install.sh | sh# Windows (使用PowerShell)irm https://code.claude.com/install.ps1 | iex
```

#### **2: 安装预构建技能**

Claude 提供官方技能包：

```
# 在Claude Code中/skills# 选择要安装的技能- PowerPoint处理 (pptx)- Excel数据分析 (xlsx)- Word文档编辑 (docx)- PDF生成 (pdf)
```

#### **3: 使用技能**

**方式 1：显式调用**

```
# 使用$符号直接指定技能$pptx 帮我创建一个产品发布会PPT，包含封面、产品特性、市场分析、Q&A四个部分
```

**方式 2：自动触发**

```
# Claude会自动判断需要使用的技能帮我分析这个销售数据Excel，生成月度报告并制作可视化图表# → 自动激活 $xlsx 和 $chart-generator
```

### 3.3 创建自定义技能

#### **方法 1：手动创建**

```
# 1. 创建技能文件夹mkdir -p ~/.config/claude-code/skills/my-first-skill# 2. 创建SKILL.mdcat > ~/.config/claude-code/skills/my-first-skill/SKILL.md << 'EOF'---name: blog-writerdescription: 专业技术博客写作助手---# 技术博客写作专家## 写作规范1. 标题：简洁有力，包含关键词2. 结构：引言→核心内容→实战案例→总结3. 代码：必须可运行，包含完整示例4. 配图：每个核心概念配示意图## 输出格式- 使用Markdown- 代码块标注语言- 添加emoji增强可读性- 文末附参考资源
```

#### **方法 2：使用 Skill Creator**

如果你不想从零开始写 Skill，那么可以直接让 AI 来帮你生成。官方提供了一个叫做 skill-creator 的工具，只需要简单描述你希望 Skill 实现的功能和能力，它就能自动生成对应的 Skill，让你把精力更多放在业务本身，而不是重复造轮子。

```
# 安装官方skill-creator$skill-creator# 描述你的需求我需要一个技能包，用于：- 自动化代码审查- 检查代码规范（变量命名、注释完整性）- 生成审查报告# AI会自动生成完整的SKILL.md和相关脚本
```

### 3.4 技能组合

在实际工作中，很多任务并不是单一技能就能搞定的。比如你要做一份市场分析报告，需要先从网上收集数据，再用 Excel 处理数据，然后生成可视化图表，最后写成 Word 报告。如果每个步骤都要你手动切换技能、传递数据，那和没用 AI 有什么区别？技能组合要解决的就是这个痛点，它让多个技能能够协同工作、数据自动流转，你只需要一句话触发整个工作流，中间完全不用插手。更重要的是，整个流程按照统一标准执行，避免了人为失误，而且一旦定义好，就可以反复使用，彻底告别重复劳动。

**案例：自动化内容生产流水线**

痛点：每次写公众号文章都要经历选题→资料收集→撰写→配图→SEO 优化→发布，至少半天时间。

```
# content-pipeline技能---name:content-pipelinedescription:全自动内容生产流程---## 工作流1.$web-researcher:收集行业资讯和热点话题2.$content-outliner:根据SEO策略生成文章大纲3.$blog-writer:撰写正文内容4.$image-generator:生成配图（调用DALL-EAPI）5.$seo-optimizer:优化关键词和meta标签6.$social-publisher:发布到各平台## 执行触发当用户说"写一篇关于[主题]的文章"时自动启动
```

**使用结果：**

```
# 你只需要说一句话写一篇关于"2025年AI发展趋势"的文章# AI自动完成：✓ 搜索最新AI新闻和报告（2分钟）✓ 生成结构化大纲（1分钟）✓ 撰写5000字文章（3分钟）✓ 生成3张配图（2分钟）✓ SEO优化（1分钟）✓ 一键发布到公众号、知乎、掘金（1分钟）总耗时：10分钟 vs 人工4小时
```

四、Agent Skills 生态与工具
--------------------

### 4.1 官方技能库

**Anthropic 官方技能集**：

*   文档处理（PowerPoint、Excel、Word、PDF）
    
*   数据分析和可视化
    
*   Anthropic 品牌规范
    

### 4.2 社区生态工具

#### **Skill Seekers**

自动抓取文档网站、GitHub 仓库和 PDF 文件转换为 Agent Skills

**应用**：

```
# 将Spring官方文档转换为技能包skill-seeker convert https://spring.io/docs --output spring-framework-skill
```

#### **Superpowers**

涵盖完整编程项目工作流的技能集合，包括：

*   项目初始化和配置
    
*   代码规范检查
    
*   测试覆盖率分析
    
*   CI/CD 自动化
    

#### **技能商店（SkillsMP）**

*   自动抓取 GitHub 上的所有 Skills 项目
    
*   按分类、更新时间、Star 数量整理
    
*   一键下载和安装
    

### 4.3 跨平台支持

Agent Skills 作为开放标准，已被多个平台支持：

<table><thead><tr><th><section>平台</section></th><th><section>支持状态</section></th><th><section>使用方式</section></th></tr></thead><tbody><tr><td><strong>Claude Code</strong></td><td><section>完整支持</section></td><td><section>原生集成</section></td></tr><tr><td><strong>Claude.ai</strong></td><td><section>完整支持</section></td><td><section>设置上传</section></td></tr><tr><td><strong>VS Code</strong></td><td><section>完整支持</section></td><td><section>chat.useAgentSkills</section></td></tr><tr><td><strong>Cursor</strong></td><td><section>完整支持</section></td><td><section>文档支持</section></td></tr><tr><td><strong>GitHub Copilot</strong></td><td><section>完整支持</section></td><td><section>原生集成</section></td></tr><tr><td><strong>OpenAI Codex</strong></td><td><section>完整支持</section></td><td><section>官方支持</section></td></tr></tbody></table>

五、最佳实践与注意事项
-----------

### 5.1 技能设计原则

#### **1. 单一职责**

每个技能专注一个明确的能力领域

**错误示例**：

```
name: everything-helperdescription: 可以做任何事情的全能助手
```

**正确示例**：

```
name: api-documentation-generatordescription: 根据代码自动生成API文档
```

#### **2. 清晰的触发条件**

明确说明何时应该使用这个技能

```
## 使用时机- 用户提到"生成API文档"- 用户上传了包含接口定义的代码文件- 用户询问"如何记录API"
```

#### **3. 提供具体示例**

包含完整的输入输出示例

```
## 示例### 输入```python@app.route('/users/<int:user_id>', methods=['GET'])def get_user(user_id):    """获取用户信息"""    user = User.query.get(user_id)    return jsonify(user.to_dict())
```

### 输出

```
## GET /users/{user_id}获取指定ID的用户信息**参数**：- `user_id` (integer): 用户唯一标识**返回**：- 200: 用户对象- 404: 用户不存在
```

### 5.2 常见问题

#### **1：过度复杂**

不要把太多逻辑塞进一个技能，善用技能组合

#### **2：缺乏维护**

技能需要随着业务变化及时更新

#### **3：忽略错误处理**

在脚本中添加健壮的错误处理逻辑

```
# scripts/process.pyimport systry:    # 核心逻辑    result = process_data()    print(result)except FileNotFoundError:    print("错误：找不到输入文件", file=sys.stderr)    sys.exit(1)except Exception as e:    print(f"处理失败：{str(e)}", file=sys.stderr)    sys.exit(1)
```

六、总结
----

Agent Skills 不仅是技术工具，更是一种思维方式的转变——**将专业知识模块化、流程化、可复用化**。在 AI 时代，这将成为个人和组织的核心竞争力。

参考资源
----

Agent Skills 官方文档: https://agentskills.io Anthropic 工程博客: https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills 官方技能库: https://github.com/anthropics/skills Awesome Agent Skills:https://github.com/skillmatic-ai/awesome-agent-skills SkillsMP 技能商店: https://skillsmp.com

-END -

**如果您关注前端 + AI 相关领域可以扫码进群交流**

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/cAd6ObKOzEArGqlLlZmLVB61keywZ2APgWHNwTdK8OicE1utUcAJj1m5ZMFTL8iac51bGglnIeCR5KHicCBh5lh3A/640?wx_fmt=jpeg#imgIndex=4)

添加小编微信进群😊  

关于奇舞团
-----

奇舞团是 360 集团最大的大前端团队，非常重视人才培养，有工程师、讲师、翻译官、业务接口人、团队 Leader 等多种发展方向供员工选择，并辅以提供相应的技术力、专业力、通用力、领导力等培训课程。奇舞团以开放和求贤的心态欢迎各种优秀人才关注和加入奇舞团。  

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEBLicibtcprJISN18FgTtg2N1ichPnMqRhicrP20VfwnC4vday7gtEoiaSynIH1bas4N5kgicliakrLdtT2Q/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1#imgIndex=5)