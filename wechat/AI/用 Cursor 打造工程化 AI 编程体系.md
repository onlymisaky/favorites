> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/lMDc3HrEc4x1zA2EEPj06Q)

Cursor 已经成为现代化开发团队的标配 IDE 了，如何用好它，规避它各种问题，真正能够深入我们的软件项目中，解决实际问题，非常关键。本文梳理了关键的一些思路和体系，希望有帮助。

1. 背景：当 AI 开始 “胡说八道”
--------------------

如果 AI 生成这个代码：

```
# AI 生成的“危险”代码def authenticate(name, pwd):    sql = f"SELECT * FROM users WHERE name='{name}' AND pwd='{pwd}'"    return run(sql)  # ← SQL 注入
```

三连踩坑：

1.  1. 安全规范全丢：字符串拼 SQL。
    
2.  2. 业务上下文缺失：没走加密模块。
    
3.  3. 日志与追踪脱节：诊断难度指数级上升。
    

内部追踪发现，两大元凶始终如一：

<table><tbody><tr><td data-colwidth="132">痛点</td><td>触发场景</td><td>影响</td></tr><tr><td data-colwidth="132">幻觉</td><td>缺少项目约束、提示不清</td><td>产出与业务冲突的代码</td></tr><tr><td data-colwidth="132">上下文截断</td><td>对话过长 &gt; 模型 token 上限</td><td>早期约束消失，生成质量雪崩</td></tr></tbody></table>

2. 方法论总览：三块基石、两个护栏、一条闭环
-----------------------

三块基石：知识库模板 + 规则体系 + 多模型协作   

两个护栏：上下文管理 + 提问 / 任务拆分   

一条闭环：PRD → DB → API → 代码 → 测试

只有把三块基石筑牢，再用两个护栏兜底，最后配合闭环流程，才能真正把 AI 从 “写代码的玩具” 升级为“靠谱的工程伙伴”。

3. 基石一：知识库模板
------------

### 3.1 目录规范

```
docs/└─ ai-template/   ├─ 01_tech_stack.md          # 语言 / 框架 / 版本   ├─ 02_architecture.md        # 架构分层 / 目录结构   ├─ 03_coding_rules.md        # 命名、异常、日志、SQL 安全   ├─ 04_business_glossary.md   # 领域术语   └─ 99_prompt_snippets.md     # 常用提示词片段
```

*   版本化：与代码同库，任何增删改一目了然。
*   即插即用：新同事或新会话只需 @ 文件即可继承全部上下文。

### 3.2 持续迭代

*   结构或框架调整 → 更新 02_architecture.md
*   踩坑补救经验 → 写入 03_coding_rules.md
*   高频 prompt → 收录到 99_prompt_snippets.md

这套模板就是 AI 的《员工手册》，随项目共同进化。

4. 基石二：规则体系
-----------

### 4.1 通用 rules（示例片段）

```
1. 回复使用中文；代码注释中英双语。2. 每次回复末尾打印 "#END" 以便校验上下文。3. 输出顺序：变更摘要 → 完整文件 diff → #END。4. 遵循 docs/ai-template/03_coding_rules.md。5. 信息不足时先提问，不得臆测。
```

### 4.2 场景 rules

*   SQL 安全

```
- [强制] 仅用参数化查询- [强制] 密码字段存 bcrypt hash
```

*   Go 错误处理

```
错误码前缀：DB_ERROR_/AUTH_ERROR_
```

把 rules 当作 ESLint for LLM——先扫描再输出。

5. 基石三：多模型协作
------------

<table><tbody><tr><td>任务类别</td><td data-colwidth="222">推荐模型</td><td>核心优势说明</td></tr><tr><td>架构设计 / 长文总结</td><td data-colwidth="222">Claude-3.7-Sonnet-thinkGemini-2.5-ProChatGPT-4o</td><td>逻辑推理能力强</td></tr><tr><td>生产级代码生成</td><td data-colwidth="222">Claude-3.5-SonnetClaude-3.7-SonnetDeepSeek-V3.1Gemini-2.5-Pro</td><td>代码质量稳定</td></tr><tr><td>快速草稿 / 批量试验</td><td data-colwidth="222">Gemini-2.0-FlashDeepSeek-V3.1</td><td>低成本快速迭代</td></tr></tbody></table>

协作策略

1.  1. 让两款模型独立生成。
    
2.  2. 用第三款模型做 diff 评论。
    
3.  3. 合并交集，由人类确认冲突。
    

6. 护栏一：上下文管理
------------

模型很容易因为丢失上下文而不了解背景，然后随意发挥，乱改项目，导致无可回来的痛苦。

如何解决这个问题。

### 6.1 “暗号侦测”

在 global rules 要求回复末尾输出 #END 或者商定好的特殊暗号，比如 “你好帅”。

*   若缺失，则说明早期上下文已被截断，需要换会话或补信息。

### 6.2 四种续命术

<table><tbody><tr><td data-colwidth="102">方法名称</td><td>操作指南</td><td>最佳实践场景</td><td data-colwidth="187">技术要点</td></tr><tr><td data-colwidth="102">即时总结</td><td>1. 输入</td><td>• 话题切换时 • 跨团队协作交接</td><td data-colwidth="187">总结需包含：- 核心决策 - 待办事项 - 技术约束</td></tr><tr><td data-colwidth="102">关键回顾</td><td>每 30 分钟发送：1. XX 架构选择 2. YY 接口规范</td><td>• 长周期对话 • 复杂需求讨论</td><td data-colwidth="187">建议模板：【决策点】采用 Redis 集群【依据】QPS≥1 万</td></tr><tr><td data-colwidth="102">路径索引</td><td>在核心文件头部添加：// 用途：订单状态机控制</td><td>• 大型代码仓库 • 历史项目维护</td><td data-colwidth="187">注释三要素：1. 核心功能 2. 修改风险 3. 关联文档</td></tr><tr><td data-colwidth="102">文件引用</td><td>使用绝对路径：</td><td>• 重复性任务 • 规范检查</td><td data-colwidth="187">文件要求：- 版本控制 - 可读性标记</td></tr></tbody></table>

7. 护栏二：提问与任务拆分
--------------

原则：一次只让 AI 做一件事，并且可验证。

可以使用 cursor rules，设定如何管理识别任务清单，无论是 Checklist 模版还是 tasklist。

Cursor rules 参考：

```
# Issues 目录管理规范## 目录结构- `/issues` 目录用于统一管理代码问题与功能开发  - 采用双层目录结构确保良好组织## 命名规范    ### 第一层目录    - 以里程碑(milestone)命名    - 格式: `m{序号}-{描述}`    - 示例: `m001-InitProject`    ### 第二层文件    - 每个文件表示一个独立issue    - 全局唯一ID: 在整个`/issues`目录中保持ID唯一性    - 文件命名格式:      - 功能需求: `{id}-f-{描述}.md`      - 缺陷修复: `{id}-bug-{描述}.md`## 文件内容规范    每个issue文件必须包含以下部分:    1. `#Title`: issue标题    2. `#Introduction`: issue详细描述    3. `#Tasks`: 任务列表       - 每项任务使用`- [ ]`格式标记       - 子任务可关联其他任务文件    4. `#Dependencies`: 依赖关系       - 使用`- [ ]`格式标记依赖的其他issue## 任务状态管理    - 仅允许修改任务状态标记，不得随意更改其他内容    - 状态标记说明:      - `[ ]`: 未开始      - `[x]`: 已完成      - `[-]`: 进行中      - `[*]`: 已跳过      - `[!]`: 已放弃
```

### 7.1 Checklist 模板

```
@file ./docs/ai-template/03_coding_rules.md@file ./docs/er/quiz_platform.sql请按 Checklist 逐项完成：- [ ] 生成 GORM DAO- [ ] 为 DAO 生成单元测试- [ ] 输出 diff 并附 #END
```

### 7.2 任务清单驱动

Cursor 支持 Markdown task‑list。AI 可自动勾选已完成项，人类随时把控进度。

```
# Title实现基础用户管理功能# Introduction创建基础的用户管理系统,包含用户的基本信息:唯一标识ID、用户名称、头像和手机号。这将作为整个应用的基础用户模型。- User   - id, bigint, 主键, 自增  - name, varchar(255), 用户名称  - avatar_url, varchar(255), 头像URL  - mobile, varchar(255), 手机号  - coin, bigint, 积分，默认 0# Tasks- [ ] 设计并实现用户数据库架构  - [ ] 创建用户表,包含字段:id、name、avatar_url、mobile。avatar_url 或者是 oss 的链接- [ ] 实现用户CRUD接口  - [ ] 创建用户接口(带字段验证)  - [ ] 获取用户信息接口  - [ ] 更新用户信息接口  - [ ] 删除用户接口(软删除)  - [ ] 用户列表接口(带分页)
```

8. 全链路实践
--------

#### 链路流程：PRD ➜ 数据库 ➜ API ➜ 代码 ➜ 测试

<table><tbody><tr><td data-colwidth="122">阶段</td><td data-colwidth="130">输入</td><td>AI 产出</td><td>模板 / 工具</td></tr><tr><td data-colwidth="122">PRD 解析</td><td data-colwidth="130">PRD + 原型</td><td>实体列表 + 用例</td><td>PRD2Entity.md</td></tr><tr><td data-colwidth="122">ER 设计</td><td data-colwidth="130">实体列表</td><td>DDL + ERD SVG</td><td>DB_template.sql</td></tr><tr><td data-colwidth="122">API 契约</td><td data-colwidth="130">表结构</td><td>OpenAPI YAML</td><td>api_standard.yaml</td></tr><tr><td data-colwidth="122">代码生成</td><td data-colwidth="130">契约 + rules</td><td>Controller/Service/Test</td><td>场景 rules</td></tr><tr><td data-colwidth="122">测试生成</td><td data-colwidth="130">diff</td><td>E2E + 单测脚本</td><td>test_template.md</td></tr></tbody></table>

如果设计得当，这条流水线能将传统 14 天开发周期压缩到 7-10 天。

9. 案例建议：7 天重构用户认证系统
-------------------

可以实战测试一下

### 第 0 天 17:00 —— 投喂 PRD

拖入 PRD、流程图，附 PRD2Entity.md

*   AI 输出：users / password_reset_tokens 两张表

### 第 1 天 10:00 —— 生成 DDL & ERD

Prompt：

```
请用 PostgreSQL 语法生成 DDL，并输出 mermaid SVG ER 图。
```

*   产出：DDL 脚本 + ERD SVG，5 分钟完成

### 第 1 天 14:00 —— API 契约

@api_standard.yaml + 一句话指令

*   输出：RESTful 路由、请求 / 响应样例

### 第 2-4 天 —— 代码生成和调试

Checklist：DAO → Service → Domain → Controller

*   双模型（Claude-3.7/GPT-4o）交叉评审
*   争取首次编译通过率 80 %
*   迭代修改 bug 和代码
*   接口联调

### 第 5 天 —— 自动化测试

@test_template.md

*   生成 JWT 登录、密码重置单测
*   跑通所有单测程序

### 第 6 天 —— 内部测试

*   尝试一些 AI 自动化测试工具

### 第 7 天 —— 发布上下

*   发布 CD 线上回归功能

最终收益

*   人工编码时间 ↓ 50 %
*   PR 评审耗时 ↓ 50%

10. 飞轮机制：持续改进与经验沉淀
------------------

1.  1. 模板迭代会（双周）
    

1.  评审 ai‑template 命中率，剔除冗余，补充新场景。

1.  3. 质量门禁（PR Hook）
    

1.  自动检查 AI diff 是否满足规则，不合规直接回滚。

1.  5. 经验沉淀
    

1.  99_prompt_snippets.md 收录高命中 Prompt； 红榜 / 黑榜案例贴醒目标记。

循环往复，团队整体效率呈指数级爬升。

<table><tbody><tr><td data-colwidth="140">类别</td><td data-colwidth="259">操作</td><td>频率</td></tr><tr><td data-colwidth="140">模板更新</td><td data-colwidth="259">规则 / 技术栈 / 目录结构</td><td>每迭代结束</td></tr><tr><td data-colwidth="140">模型评估</td><td data-colwidth="259">多模型 A/B 结果对比</td><td>每两周</td></tr><tr><td data-colwidth="140">上下文体检</td><td data-colwidth="259">检查暗号、手动摘要</td><td>每日首次对话</td></tr><tr><td data-colwidth="140">PR 流程</td><td data-colwidth="259">让 LLM 先写 diff，再由人审</td><td>每提交</td></tr><tr><td data-colwidth="140">知识共享</td><td data-colwidth="259">在 docs/ai-template 写实战笔记</td><td>持续</td></tr></tbody></table>

11. 结语：把 AI 变成可信的工程伙伴
---------------------

第一、AI 是工具，不是魔法。 当你给它 足够上下文、清晰约束、微粒度任务， 它就能成为可靠的协作伙伴，而非 “惊喜制造机”。

第二、把 LLM 当作一位「天才实习生」：

给他完善的员工手册、分解后的可验证任务，以及随时补钙的知识套餐，他才能真正成为你高效、可靠且少犯错的最佳拍档。

建议的下一步行动清单（5 分钟即可启动）

1.  1. git checkout -b ai-template，创建目录结构。
    
2.  2. 把你的技术栈、目录结构、编码规范写入 Markdown。
    
3.  3. 在 Cursor 全局 rules 里加上本文示例片段。
    
4.  4. 用 Checklist 模板跑一遍 “小功能” 试水。
    
5.  5. 双周后开一次模板迭代会，记录坑点。
    

知行合一，才能真正拥抱 AI 工程化。

【喜欢请关注本公众号】