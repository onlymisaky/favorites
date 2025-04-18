> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/d53FlmYfaJgoOr2zsgFXAA)

```
本文属于在前端小组的一次小分享
这里做个同步分享。

```

  
一、pro 权益说明
-------------

目前公司购买了 2 个 pro 月付账号，权益包括无限制 tab 补全与 ai 聊天，但每个月只有 500 个快速请求权益，如果 500 次用完后将进入慢速排队机制，不过从目前体验来看，即便是慢速对于 tab 补全影响也非常小。

但 cursor 有多设备检测，如果多设备高频使用 chat 会导致聊天出现报错并进入冷却期，不过 tab 补全并不会受影响。

关于多设备限制的问题目前已给官方写邮件，看能否解除限制，等待官方答复。(三天了，没回我)

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHqsqgbUfRy9FXg2BHPMskvL8cOPleg8nhzsbyKFNWEJOza9lqwDb1Se0YI94Lqk12uU7Vue9EpPLg/640?wx_fmt=other&from=appmsg)

  
二、tab 补全
-----------

事实上即便没看过 cursor 文档，会使用 tab 补全和 AI chat 已经其实掌握了 cursor 最核心的功能，这也是我觉得 cursor 做的非常好的地方，不需要文档说明什么，上手就是惊艳的体验，这里还是简单给大家介绍 cursor 基础能力：

cursor 会根据用户行为预测代码补全，除了早期 copilot 写注释以及理解上下文的代码补全，cursor 支持用户任意修改智能预测以及修正代码格式错误，比如大括号闭合缺失修正；以及多行代码批量预测（一次 tab 自定修改多行），光标预测（cursor 会在预测你下次修改的地方出现 tab 图标）。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHqsqgbUfRy9FXg2BHPMskvL9Nm523uUsE9toJt4dPn6W1ibAgFW9ZhxZPjSRWohehgNibN4I1yCwrCQ/640?wx_fmt=other&from=appmsg)

我个人觉得最惊艳的是 cursor 会理解我的操作意图，有一天我希望修复一个 bug，于是尝试输出了几个变量的值，跟踪代码在哪一步出现了异常，当我理清思路鼠标点击要修改的地方， cursor 直接把我接下来要写的 bug 修复代码直接生成了，我觉得这一点确实是目前其它 AI ide 或者插件没带给我的体验。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHqsqgbUfRy9FXg2BHPMskvLGVAAX6MSdzrn5rv8wmbPz1o1bT6dPTFs6MJCtnOpINOBmREzssUw4A/640?wx_fmt=other&from=appmsg)

由于 tab 预测属于 cursor 被动技能，大家只管使用和体验就好了，这里就不过多叙述了。

  
三、 cursor 的三种问答方式
--------------------

cursor 支持 `command + K`、`command + i` 和 `command + l` 分别唤醒三种聊天方式，这里简单给大家解释下区别：

####   
3.1 内联聊天：  

一般操作是直接选中部分代码后通过 `command + K` 唤醒，适合小范围代码提问优化或者修改，比如我全选了一个组件，让它帮我补全关键注释或者帮我编写 readme 文档，对于不爱写注释和文档的同学简直是福音。

在生成之后点击  accept 接收 AI 建议即可，需要注意的是，当下无论什么 AI 可能都会在无意识修改你的代码，可能会造成意料之外的代码篡改或丢失，所以如果有 AI 建议的采纳，强烈建议写好 commit 信息便于后续跟踪和回溯。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHqsqgbUfRy9FXg2BHPMskvL0Wk1V1RmswASxcWukS9GB4UpxtqDfyicdibh3kTqxVoootoLK4GPJMibA/640?wx_fmt=other&from=appmsg)

除此之外在内联弹窗右下角，我们可以切换大模型选项，不过在 deepseek 爆火的春节期间， cursor 官方有提及设计编码方向，目前所有模型中代码体验最佳的还是 `claude-3.5-sonnet`。

####   
3.2 AI Chat（聊天）  

我们可以通过 `command + L`快速唤醒聊天窗口，与内联聊天一样，我们也可以鼠标选择部分代码作为上下文进行聊天。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHqsqgbUfRy9FXg2BHPMskvLcAUOxQXlBmGr4KZABsGjNxRRoWGqhfft7mZeMTu0uq3oo1jMZw8IRQ/640?wx_fmt=other&from=appmsg)

让我们快速了解聊天的功能点，这里我按数字标注进行解释

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHqsqgbUfRy9FXg2BHPMskvL2EfVLWjxmnkEAhXmOhan8rpd2MhxXZedR2nsfHoEx1OviayGn0L8qlg/640?wx_fmt=other&from=appmsg)

1：`Add context`可添加聊天上下文，在下拉框中支持搜索文件

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHqsqgbUfRy9FXg2BHPMskvLQ3VyHEWQGVCdpaGYaAPVWt2Mg1qeZ0Be1hRJXcGvPNgCmBxlwIicUaw/640?wx_fmt=other&from=appmsg)

2：聊天历史，在这可以看到历史聊天，记录同样支持搜索，类似 openAI，点击历史记录可以看到当时的聊天记录。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHqsqgbUfRy9FXg2BHPMskvLwdTRAA7oqqA1z0j6uoojeGkzmuCFfd5CSgTzyM806T6DH0aiaDiblkDQ/640?wx_fmt=other&from=appmsg)

3：与内联聊天一样，我们可以在这选择模型。

4：支持上传图片进行问答，比如设计稿比较简单的组件我们可以提供好需求上下文后让 cursor 帮我实现，之后我们再润色。

5：在输入问题后，cursor 支持两种提问，如果直接 `enter` cursor 会基于 AI 检索信息以及你的上下文进行回答，但有时候我们只想聊聊项目的问题，比如 base utils 有封装 axios ，后续有元改了包的结构和内容，我想知道现在这个文件在哪，很显然互联网信息帮助不了我们，我可以直接描述问题后 `command + enter`，此时就是基于项目代码来提问，这对于项目找代码或者理解项目非常有帮助。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHqsqgbUfRy9FXg2BHPMskvLur1zEN5m54vrdibiaRTfYflk2Z5F1y575N4QKdV6h371pDAS0HKLxlicA/640?wx_fmt=other&from=appmsg)

  
3.3 Composer（编写器）
--------------------

我们可以通过 `command + I` 快速唤醒 Composer 窗口，可能有同学发现这个跟 Chat 窗口好像非常相似，而且用起来好像没什么问题，都能问问题和写代码，但事实上 cursor 对这两者的定位完全不同，我们先说清楚 composer 的作用。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHqsqgbUfRy9FXg2BHPMskvLA2v9BZicYxDIX8DcuVQW6xntu92QwNqaTvesRLmhR0Kr9OiccpKOibtRw/640?wx_fmt=other&from=appmsg)

与 Chat 类似，此功能统一支持上下文添加模型切换等基础功能，但在右下角与 Chat 有明显区别，Composer 支持 normal 和 agent 两种模式：

**normal（普通模式）**: 适合复杂度不高单一的任务。

```
用户: 生成一个 Button 组件
AI: 这是一个简单的 Button 组件：
[直接生成代码]

用户: 生成一个 Button 组件
AI: 这是一个简单的 Button 组件：
[直接生成代码]


```

**agent（代理模式）**：适合复杂度高的重构或者多步骤任务，这类任务往往需要拆解成多步骤进行多次沟通，agent 模式对于 normal 模式代码理解能力会更强。

```
用户: 生成一个 Button 组件
AI: 让我们一步步来：
1. 您需要什么样的按钮风格？
   - 基础按钮
   - 描边按钮
   - 图标按钮
2. 是否需要以下功能：
   - 加载状态
   - 禁用状态
   - 不同尺寸
请告诉我您的具体需求。

用户: 生成一个 Button 组件
AI: 让我们一步步来：
1. 您需要什么样的按钮风格？
   - 基础按钮
   - 描边按钮
   - 图标按钮
2. 是否需要以下功能：
   - 加载状态
   - 禁用状态
   - 不同尺寸
请告诉我您的具体需求。


```

<table><thead><tr><th><strong>特性</strong></th><th><strong>Normal</strong></th><th><strong>Agent</strong></th></tr></thead><tbody><tr><td><section>交互方式</section></td><td><section>一问一答</section></td><td><section>持续对话</section></td></tr><tr><td><section>任务分析</section></td><td><section>简单直接</section></td><td><section>深入分析</section></td></tr><tr><td><section>上下文理解</section></td><td><section>基础</section></td><td><section>更强</section></td></tr><tr><td><section>代码生成</section></td><td><section>一次性</section></td><td><section>迭代式</section></td></tr><tr><td><section>适用复杂度</section></td><td><section>低 - 中</section></td><td><section>中 - 高</section></td></tr></tbody></table>

虽然 agent 模式更强大，但还是建议根据实际需求场景采取最佳的问答方式，在 agent 模式下每次提问会消耗 2 个快请求额度。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHqsqgbUfRy9FXg2BHPMskvLW9ubwHaPQxiaGVUFXqVseiag1tn5GANN68r2CzjMCiaVSLibma0w072mvg/640?wx_fmt=other&from=appmsg)

OK，介绍完 Composer 我们解释下与 Chat 的区别，其实光从名称上大家可能已经有所感知，Chat 更适合问答，因为它支持本地项目的问答和互联网信息问答，而 Composer 就是标准的代码生成器，适合处理更复杂的需求场景，如果你是提问建议使用 Chat，如果是要写代码做重构使用 Composer 即可。

```
// Chat 场景
1. "这段代码为什么会报错？"
2. "如何优化这个函数的性能？"
3. "帮我检查一下这段代码的问题"
4. "这个 API 该如何使用？"
5. 代码审查和讨论

// Chat 工作流
1. 选中代码或打开文件
2. 发起问题或讨论
3. AI 回答并可能提供修改建议
4. 确认修改后自动创建分支
5. 提交修改并保留对话历史

// Composer 场景
1. "生成一个 React 表单组件"
2. "重构这个类为函数组件"
3. "编写这个功能的单元测试"
4. "实现这个算法"
5. 大段代码生成和重写

// Composer 工作流
1. 描述需要生成的代码
2. AI 生成代码建议
3. 调整和修改生成的代码
4. 手动复制或应用代码
5. 手动管理版本控制

// Chat 场景
1. "这段代码为什么会报错？"
2. "如何优化这个函数的性能？"
3. "帮我检查一下这段代码的问题"
4. "这个 API 该如何使用？"
5. 代码审查和讨论

// Chat 工作流
1. 选中代码或打开文件
2. 发起问题或讨论
3. AI 回答并可能提供修改建议
4. 确认修改后自动创建分支
5. 提交修改并保留对话历史

// Composer 场景
1. "生成一个 React 表单组件"
2. "重构这个类为函数组件"
3. "编写这个功能的单元测试"
4. "实现这个算法"
5. 大段代码生成和重写

// Composer 工作流
1. 描述需要生成的代码
2. AI 生成代码建议
3. 调整和修改生成的代码
4. 手动复制或应用代码
5. 手动管理版本控制


```

  
四、 cursor 的 context
----------------------

在 chat 和 composer 模式除了通过 `Add context` 添加上下文之外，我们还可以通过 @ 灵活选择上下文，这里解释几种常用模式：

基本功能

*   **Files**
    
    : 基于文件上下文进行提问，直接直接把文件拖拽到聊天作为上下文。
    

*   有同学可能要说了，我的文件分布很散且多，我难道要一个个拖拽吗，其实不用，我们在聊天窗口按下 `/`即可唤醒上下文，可以直接关联目前所有打开的文件或者被激活的文件。
    
*   ![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHqsqgbUfRy9FXg2BHPMskvLWTksTM5EWLuWOnY1IrSEoIAVsViaLWOPNCqLtgVrtgic0xkib7f1JeaSw/640?wx_fmt=other&from=appmsg)
    

*   **Folders**
    
    : 基于目录作为上下文，同样支持目录拖拽，非常方便。
    
*   **Code**
    
    : 基于具体的代码块作为上下文，更方便的做法是先选中然后 `Command + L/I`。
    
*   **Codebase**
    
    : 将整个项目作为上下文（仅限 Chat ），与 `command + enter` 功能相同，我们可以 `@codebase` 后回车询问本地项目中感兴趣的问题。
    
*   **Git**
    
    : 基于 Git 历史 commit 快速了解代码变化或者提交信息，比如基于某个 commit 让 cursor 帮我撤销这个提交。
    
*   **Summarized Composers**
    
    : 与之前 AI 问答的历史记录进行对话
    
*   **Docs**
    
    : 基于文档作为上下文，比如我们项目使用了 react，我们可以将 react 官方文档保存为文档，后续方便提问。
    
*   **Web**
    
    : 类似 deepseek 联网，获取互联网最新信息作为辅助上下文进行提问。
    
*   **Lint errors**
    
    : 询问代码中的语法错误和潜在问题。
    
*   **Recent Changes**
    
    : 自动跟踪代码库最近更改作为上下文。
    
*   **Cursor Rules**
    
    : 基于 Cursor 的自定义规则和设置对话，关于规则下面有介绍。
    

  
五、通过 cursorrules 提升代码规范
--------------------------

Cursor AI 是只是一个 AI 驱动的代码编辑器，不同人可能使用 cursor 做不同类型的项目，可能是 react 、Python 各类型项目，除了库版本不同，不同项目组可能有自己的规范，所以 cursorrules 文件的意义就是定义 Cursor AI 在生成代码时遵循的定制规则，允许我们根据特定需求和偏好调整其行为。

事实上 cursor 活跃的社区已经存在了大量成熟  cursorrules  可供参考，这就像 eslint 社区也有通用的社区规范，如果前期你没有细化的头绪可以直接拿来使用，这里分享几个成熟的  cursorrules 规范项目供大家参考，大家也可以先使用，再根据自己特定规范进行修改。

另外，早期的 cursorrule 是在项目根目录创建一份全局 `.cursorrules` 文件，后续版本已更新为在 cursor/rules 目录下创建不同规则的文件，`.cursorrules` 的做法会在未来版本移出，建议采用最新的做法。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHqsqgbUfRy9FXg2BHPMskvLW9ubwHaPQxiaGVUFXqVseiag1tn5GANN68r2CzjMCiaVSLibma0w072mvg/640?wx_fmt=other&from=appmsg)

cursor 支持为项目创建多个 rule，并通过 globs 配置为 rule 指定特定生效的文件或者目录，目前 notta web 已增加了一份全局开发规则，大家感兴趣可以看看，后续若有新建或者调整建议在前端社区做同步，避免带来额外影响。

```
# Cursor notta web 编码规范指南


你是以下技术栈的专家：
- TypeScript
- Node.js
- React
- Vite
- Rspack
- Ant Design v4
- React Router DOM v6
- lodash-es v4
- chrome extension v3

### 核心原则：

- 编写简洁、技术性的响应，并提供准确的 TypeScript 示例
- 使用函数式、声明式编程，避免使用类
- 优先使用迭代和模块化，而不是代码重复定义
- 使用描述性变量名，包含助动词（如 isLoading）
- 目录使用小写字母加横线（如 components/auth-wizard）
- 组件优先使用命名导出
- 使用接收对象返回对象（RORO）模式

### JavaScript/TypeScript 规范：

- 纯函数使用 "function" 关键字。省略分号
- 所有代码都使用 TypeScript。优先使用接口（interface）而不是类型（type）
- 文件结构：导出组件、子组件、辅助函数、静态内容、类型定义
- 条件语句中避免不必要的大括号
- 单行条件语句省略大括号
- 简单条件语句使用简洁的单行语法（如 if (condition) doSomething()）
- 工具函数若 lodash-es 有提供则尽量复用，避免重复定义
- 禁止三元表达式嵌套，使用阅读性更好的条件语句
- if-else 过多时优化为 map 设计

### 错误处理优先级：
- 在函数开始处处理错误和边界情况
- 对错误条件使用提前返回，避免深层嵌套的 if 语句
- 将正常执行路径放在函数末尾以提高可读性
- 避免不必要的 else 语句；使用 if-return 模式
- 使用守卫子句尽早处理前置条件和无效状态
- 实现适当的错误日志记录和用户友好的错误消息
- 考虑使用自定义错误类型或错误工厂以保持错误处理的一致性

### 依赖项：
- React v17
- Ant Design v4
- Rspack
- React Router DOM v6

### React/Next.js 规范：

- 使用函数组件和 TypeScript 接口
- 使用声明式 JSX
- 组件使用 function 而不是 const 声明
- 使用 Ant Design v4 进行组件开发和样式设计
- 采用移动优先的响应式设计方法
- 静态内容和接口放在文件末尾
- 静态内容变量放在渲染函数外
- 最小化 'use client'、'useEffect' 和 'setState' 的使用。优先使用 RSC
- 使用 Suspense 包装客户端组件并提供 fallback
- 非关键组件使用动态加载
- 图片优化：WebP 格式、尺寸数据、懒加载

### 关键约定：

1. 依赖 React Router DOM 进行状态变更
2. 优先考虑 Web Vitals（LCP、CLS、FID）

# Cursor notta web 编码规范指南


你是以下技术栈的专家：
- TypeScript
- Node.js
- React
- Vite
- Rspack
- Ant Design v4
- React Router DOM v6
- lodash-es v4
- chrome extension v3

### 核心原则：

- 编写简洁、技术性的响应，并提供准确的 TypeScript 示例
- 使用函数式、声明式编程，避免使用类
- 优先使用迭代和模块化，而不是代码重复定义
- 使用描述性变量名，包含助动词（如 isLoading）
- 目录使用小写字母加横线（如 components/auth-wizard）
- 组件优先使用命名导出
- 使用接收对象返回对象（RORO）模式

### JavaScript/TypeScript 规范：

- 纯函数使用 "function" 关键字。省略分号
- 所有代码都使用 TypeScript。优先使用接口（interface）而不是类型（type）
- 文件结构：导出组件、子组件、辅助函数、静态内容、类型定义
- 条件语句中避免不必要的大括号
- 单行条件语句省略大括号
- 简单条件语句使用简洁的单行语法（如 if (condition) doSomething()）
- 工具函数若 lodash-es 有提供则尽量复用，避免重复定义
- 禁止三元表达式嵌套，使用阅读性更好的条件语句
- if-else 过多时优化为 map 设计

### 错误处理优先级：
- 在函数开始处处理错误和边界情况
- 对错误条件使用提前返回，避免深层嵌套的 if 语句
- 将正常执行路径放在函数末尾以提高可读性
- 避免不必要的 else 语句；使用 if-return 模式
- 使用守卫子句尽早处理前置条件和无效状态
- 实现适当的错误日志记录和用户友好的错误消息
- 考虑使用自定义错误类型或错误工厂以保持错误处理的一致性

### 依赖项：
- React v17
- Ant Design v4
- Rspack
- React Router DOM v6

### React/Next.js 规范：

- 使用函数组件和 TypeScript 接口
- 使用声明式 JSX
- 组件使用 function 而不是 const 声明
- 使用 Ant Design v4 进行组件开发和样式设计
- 采用移动优先的响应式设计方法
- 静态内容和接口放在文件末尾
- 静态内容变量放在渲染函数外
- 最小化 'use client'、'useEffect' 和 'setState' 的使用。优先使用 RSC
- 使用 Suspense 包装客户端组件并提供 fallback
- 非关键组件使用动态加载
- 图片优化：WebP 格式、尺寸数据、懒加载

### 关键约定：

1. 依赖 React Router DOM 进行状态变更
2. 优先考虑 Web Vitals（LCP、CLS、FID）


```

此外分享几个成熟的 rules 项目供大家参考。

*   https://cursor.directory/
    
*   https://cursorlist.com/
    
*   https://github.com/PatrickJS/awesome-cursorrules
    

  
六、关于 windows 锁版本破解
---------------------

目前存在 cursor 锁版本破解办法，大家如果感兴趣可以尝试下，这里分享两个持续更新的 GitHub 项目，文档写的非常详细，跟着步骤走即可：

https://github.com/yuaotian/go-cursor-help/blob/master/README_CN.md

https://github.com/chengazhen/cursor-auto-free/blob/main/README.md

作者：行星飞行

原文链接：https://juejin.cn/post/7472597127488700452