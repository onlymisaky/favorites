> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/88XO2ooWkTuMJhhyQJ12MA)

![](https://mmbiz.qpic.cn/mmbiz_png/VY8SELNGe97bCSICdmD5k5Jibib2IpkhLFtkOzvD2504vSVCg0ricAJ8DBknMIDgGN2c7LmRtoAwLDibBkZTMCkALA/640?wx_fmt=png&from=appmsg&wxfrom=5&wx_lazy=1&wx_co=1&randomid=hby4jggm&tp=webp#imgIndex=0)

![](https://mmbiz.qpic.cn/mmbiz_gif/VY8SELNGe96srmm5CxquJGSP4BbZA8IDLUj8l7F3tzrm8VuILsgUPDciaDLtvQx78DbkrhAqOJicxze5ZUO5ZLNg/640?wx_fmt=gif&wxfrom=5&wx_lazy=1&randomid=db0qaopu&tp=webp#imgIndex=1)

  

👉目录

1 基础优化技巧

2 中级技巧  

3 高级技巧

4 实用模板

5 最佳实践

在与 AI 结对编程的过程中，优秀的 Prompt 设计是充分发挥 AI 能力的关键。本文将分享一些开发中实用的 Prompt 优化技巧，帮助开发者更高效地与 AI 协作。

关注腾讯云开发者，一手技术干货提前解锁👇

  

7 小时不间断直播，看腾讯最新黑科技，赢百份周边好礼！

  

  

01
==

  

  

基础优化技巧

   1.1 明确角色定义

**❌ 低效写法：**

```
帮我写个登录功能
```

✅ 优化写法：

```
你是一个资深的全栈工程师，请为我设计一个基于 JWT 的用户登录系统，
包括前端表单验证、后端 API 接口和数据库设计。
技术栈：React + Node.js + Golang + MySQL
```

   1.2 结构化输出

❌ 低效写法：

```
解释一下微服务架构
```

✅ 优化写法：

```
请按以下结构解释微服务架构：
1. 核心概念（2-3句话）
2. 与单体架构的对比（表格形式）
3. 适用场景（3个具体例子）
4. 技术栈推荐（分类说明）
5. 实施步骤（有序列表）
```

   1.3 提供上下文

✅ 带上下文的写法：

```
项目情况：
- 内容列表页，展示200条记录
- 当前加载时间：2秒
- 目标：优化到1秒以内
- 用户主要用手机访问

技术栈：React + Next.js + MySQL
主要问题：首屏渲染慢，图片加载慢

请提供具体的优化方案和代码示例。
```

  

  

02
==

  

  

中级技巧

   2.1 分步骤思考（Chain of Thought）

```
任务：设计一个实时聊天系统

请按以下步骤思考：
1. 首先分析需求（用户量、消息类型、实时性要求）
2. 然后选择技术方案（WebSocket vs Server-Sent Events vs 轮询）
3. 接着设计数据结构（用户、房间、消息）
4. 最后提供核心代码实现

每一步都要说明你的思考过程。
```

   2.2 Few-Shot Learning（示例学习）

```
我需要你帮我写 API 文档，格式如下：

示例1：
**POST /api/users**
- 描述：创建新用户
- 参数：{ name: string, email: string }
- 响应：{ id: number, name: string, email: string, createdAt: string }
- 错误：400 - 参数验证失败，409 - 邮箱已存在

示例2：
**GET /api/users/:id**
- 描述：获取用户信息
- 参数：id (路径参数)
- 响应：{ id: number, name: string, email: string }
- 错误：404 - 用户不存在

现在请为以下接口写文档：
- 用户登录接口
- 获取用户列表接口
- 更新用户信息接口
```

   2.3 约束条件设置

```
请设计一个用户管理系统的数据库 Schema，约束条件：
- 必须支持用户角色权限管理
- 支持用户分组和部门管理
- 需要记录用户操作日志
- 支持多种登录方式（邮箱、手机、第三方）
- 数据库：PostgreSQL
- 输出格式：SQL CREATE TABLE 语句
- 包含必要的索引和外键约束
- 每个表不超过12个字段
- 考虑数据安全和隐私保护
```

   2.4 假设验证法

```
假设我们的 React 应用首屏加载时间超过 3 秒，请：

1. 列出 5 个最可能的原因
2. 针对每个原因提出验证方法
3. 如果验证为真，给出对应的解决方案
4. 按优先级排序（影响大小 × 实施难度）

项目信息：SPA应用，webpack打包，有状态管理
```

   2.5 对比分析法

```
技术选型对比：GraphQL vs REST API

请制作对比表格，包含以下维度：
| 维度 | GraphQL | REST API | 胜出方 | 说明 |
|------|---------|----------|--------|------|
| 开发效率 | | | | |
| 性能表现 | | | | |
| 学习成本 | | | | |
| 生态成熟度 | | | | |

最后给出在以下场景的推荐：
- 移动端 App 后端
- 微服务架构
- 快速原型开发
```

   2.6 错误预演法

```
我准备这样实现用户权限系统：[描述方案]

请扮演"墨菲定律专家"，预测可能出现的问题：
1. 开发阶段可能遇到的坑
2. 测试阶段可能暴露的问题  
3. 上线后可能出现的故障
4. 长期维护可能面临的挑战

每个问题提供：发生概率、影响程度、预防措施
```

  

  

03
==

  

  

高级技巧

   3.1 元提示（Meta-Prompting）

```
你是一个 Prompt 工程专家。我将给你一个需求，请你：

1. 首先分析这个需求的关键要素
2. 然后设计一个优化的 Prompt
3. 最后执行这个 Prompt 并给出结果

需求：我想让 AI 帮我做代码 Review，重点关注性能和安全问题。

请按上述三步骤进行。
```

   3.2 动态角色切换

```
场景：个人中心页面优化评审会议

请模拟以下角色对 "个人中心页面用户体验优化" 进行讨论：

👩‍💻 前端开发：关注技术实现和性能优化
👨‍💼 产品经理：关注用户需求和业务目标  
🎨 视觉设计师：关注界面美观性和品牌一致性
🖱️ 交互设计师：关注用户体验和操作流程

每个角色提出2-3个关键问题或建议，格式：
**[角色]**: 观点内容
```

   3.3 渐进式优化

```
任务：优化这段 React 代码的性能

第一轮：基础优化
- 识别明显的性能问题
- 提供简单的修复方案

第二轮：深度优化  
- 分析渲染性能
- 考虑状态管理优化

第三轮：架构级优化
- 考虑代码分割
- 提供监控方案

每轮优化后，请评估性能提升程度（1-10分）。

代码：
[这里放入具体代码]
```

   3.4 多维度评估

```
请从以下维度评估前端动画框架的选择（Framer Motion vs GSAP vs Lottie）：

技术维度：
- 性能表现 (1-10分 + 理由)
- 开发效率 (1-10分 + 理由)  
- 学习成本 (1-10分 + 理由)
- 包体积影响 (1-10分 + 理由)

业务维度：
- 团队适配度 (当前团队主要使用 React/Vue)
- 项目时间线 (3个月内完成复杂交互动画)
- 维护成本 (考虑长期迭代和人员变动)
- 设计师协作 (设计团队使用 After Effects)

使用场景评估：
- 页面转场动画
- 复杂的数据可视化动画
- 微交互和悬停效果
- 移动端性能表现

最后给出推荐方案，并提供决策矩阵。
```

   3.5 反向工程法

```
目标：将页面加载时间从 5 秒优化到 2 秒以内

请反向推导：
1. 要达到 2 秒，各个环节的时间分配应该是？
2. 当前 5 秒的时间都花在哪里？
3. 每个优化点能节省多少时间？
4. 优化的先后顺序应该是？
5. 如何验证优化效果？

使用数据驱动的方式分析。
```

  

  

04
==

  

  

实用模板

   4.1 代码生成模板

```
角色：{技术栈}专家
任务：实现{具体功能}
要求：
- 代码风格：{编码规范}
- 包含错误处理
- 添加必要注释
- 提供使用示例
- 考虑{特定约束}

输出格式：
1. 实现思路（简述）
2. 核心代码
3. 测试用例
4. 注意事项
```

   4.2 问题诊断模板

```
系统问题诊断：

现象：{具体表现}
环境：{技术栈和版本}
重现步骤：{详细步骤}
错误日志：{相关日志}

请按以下流程分析：
1. 问题定位（可能原因排序）
2. 诊断步骤（如何验证）
3. 解决方案（临时+永久）
4. 预防措施（避免再次发生）
```

   4.3 技术调研模板

```
技术调研：{具体技术/框架}

**基本信息**：
- 官方文档质量：⭐⭐⭐⭐⭐
- 社区活跃度：GitHub stars/issues/PR
- 更新频率：最近版本发布时间

**技术评估**：
- 学习曲线：[平缓/陡峭] + 理由
- 性能基准：与主流方案对比数据
- 生态完整度：周边工具/插件丰富程度

**业务适配**：
- 团队技能匹配度：[高/中/低]
- 项目时间线影响：[加速/无影响/延期]
- 长期维护成本：[高/中/低]

**决策建议**：[采用/观望/放弃] + 理由
```

  

  

05
==

  

  

最佳实践

1.  迭代优化：从简单开始，逐步添加约束和要求。
    
2.  版本管理：保存有效的 Prompt 模板，建立自己的库。
    
3.  A/B 测试：对比不同 Prompt 的效果。
    
4.  领域专精：针对特定技术栈优化专用 Prompt。
    
5.  反馈循环：根据输出质量持续调整。
    

   学习参考  

https://www.promptingguide.ai/zh

https://www.deeplearning.ai/short-courses/chatgpt-prompt-engineering-for-developers/

https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview

-End-

原创作者｜刘涛

感谢你读到这里，不如关注一下？👇

![](https://mmbiz.qpic.cn/mmbiz_png/VY8SELNGe975eiakGydXqTICibuXvLhyqN5sicc7ia7Cvb8nJGK2gjavrfIIYr5oicm20W8hFPvUdSm8UTzzWiaFco9Q/640?wx_fmt=other&from=appmsg&wxfrom=5&wx_lazy=1&wx_co=1&randomid=b80pnw43&tp=webp#imgIndex=2)

你还有哪些技巧可以分享？欢迎评论留言分享。我们将选取 1 则优质的评论，送出腾讯云定制文件袋套装 1 个（见下图）。9 月 17 日中午 12 点开奖。

![](https://mmbiz.qpic.cn/mmbiz_png/VY8SELNGe96Ad6VYX3tia1sGJkFMibI6902he72w3I4NqAf7H4Qx1zKv1zA4hGdpxicibSono28YAsjFbSalxRADBg/640?wx_fmt=other&from=appmsg&wxfrom=5&wx_lazy=1&wx_co=1&randomid=vzehblvy&tp=webp#imgIndex=3)

![](https://mmbiz.qpic.cn/mmbiz_png/VY8SELNGe979Bb4KNoEWxibDp8V9LPhyjmg15G7AJUBPjic4zgPw1IDPaOHDQqDNbBsWOSBqtgpeC2dvoO9EdZBQ/640?wx_fmt=other&wxfrom=5&wx_lazy=1&wx_co=1&randomid=k6ek17wp&tp=webp#imgIndex=4)

[![](https://mmbiz.qpic.cn/mmbiz_png/VY8SELNGe951ia9iadG3cGPp3OjMQBY8jULsg1uibXBJ24VMO3MC30UmvwHbaALDxu5hM11ibicZMZvKfHfian6RPAAQ/640?wx_fmt=png&from=appmsg#imgIndex=5)](https://mp.weixin.qq.com/s?__biz=MzI2NDU4OTExOQ==&mid=2247691279&idx=1&sn=5da2fbe1159f12e45d3d7f4b673a0108&scene=21#wechat_redirect)

[![](https://mmbiz.qpic.cn/mmbiz_png/VY8SELNGe951ia9iadG3cGPp3OjMQBY8jUBwh4MBSTjwD7NIF5KIOXLbPI3quyt8wEcdkylgcGREcAM8uOd7eiatA/640?wx_fmt=png&from=appmsg#imgIndex=6)](https://mp.weixin.qq.com/s?__biz=MzI2NDU4OTExOQ==&mid=2247691682&idx=1&sn=8eac13cc848ee0779e1a4ab85142d87a&scene=21#wechat_redirect)

[![](https://mmbiz.qpic.cn/mmbiz_png/VY8SELNGe951ia9iadG3cGPp3OjMQBY8jUVU4nJ5icTPibsgNT17xNWyHEmhjJ1wT2tPlwC3VRFCjKAQdxwvic0xZTQ/640?wx_fmt=png&from=appmsg#imgIndex=7)](https://mp.weixin.qq.com/s?__biz=MzI2NDU4OTExOQ==&mid=2247691610&idx=1&sn=99c2ab7608d2ed7edc1e1aa029dd08ed&scene=21#wechat_redirect)

![](https://mmbiz.qpic.cn/mmbiz_png/VY8SELNGe95pIHzoPYoZUNPtqXgYG2leyAEPyBgtFj1bicKH2q8vBHl26kibm7XraVgicePtlYEiat23Y5uV7lcAIA/640?wx_fmt=other&from=appmsg&wxfrom=5&wx_lazy=1&wx_co=1&randomid=qxwo93ci&tp=webp#imgIndex=8)