> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/X8W5lVW3-NkBBWcW14nSVQ)

英文原文：https://www.builder.io/blog/ai-prompts-for-web-developers-chatgpt

作者：VISHWAS GOPINATH  
译者：Jothy

![](https://mmbiz.qpic.cn/mmbiz_jpg/SWQiazQLicf2cfHNCpZfiaicoduY9bL0vNPPkc4NpmjdokwqWrLCjc2eXkEQ4ky3hZRLKdwE8mibLxKSibiaDdFapULibg/640?wx_fmt=other)

如果你已经厌倦了繁琐重复的编码日常，想要提升自己的效率，那你可是来对地方了！借助 ChatGPT 的强大能力，你可以简化你的工作流程，减少错误，甚至获得代码改进方面的见解。

在这篇文章中，我们将提供 50+ 个使用 ChatGPT 的提示 (prompt) 和策略(strategy)，帮你加速你的 Web 开发工作流程。从入门学习概念到准备面试，你将找到作为 Web 开发者充分利用 AI 所需要的方方面面。

但首先，提前了解 ChatGPT 的局限性也至关重要。虽然 ChatGPT 是个强大的工具，但它不能替代你自己的知识和技能。你还得对它列出的每一条研究数据都进行事实核查，因为它自己不能核实事实。此外，它的训练数据只更新到 2021 年，因此它可能并不知道当下的趋势或事件。了解了这些注意事项后，就让我们深入探索由 AI 驱动的激动人心的 Web 开发世界吧！

所有的提示都可以到 https://chat.openai.com/ 运行

代码生成
----

ChatGPT 可以为各种 Web 开发任务生成代码，从而节省你的时间、让你的工作更高效。它可以帮你生成语义化的 HTML 和 CSS 代码、JavaScript 函数，甚至数据库查询语句。

提示 (Prompt)：生成一份语义化且可访问的 HTML 和（指定框架 (framework)）CSS [UI 组件 (UI component)]，它由 [组件部分 (component parts)] 组成。[组件部分] 应该呈现 [指定布局 (layout)]。

示例 (Example, Prompt 的实际例子)：生成一份语义化 HTML 和 Tailwind CSS “联系支持” 表单，它由用户名、电子邮件、问题类型和消息组成。表单元素应垂直堆叠，并放置在卡片内。

提示：编写一个 JavaScript 函数，它接受 [输入 (input)] 并返回 [输出 (output)]。

示例：编写一个 JavaScript 函数，它接受全名作为输入，并返回头像化字母。

**提示：**编写一个实现 [指定功能 (functionality)] 的 [指定框架 (framework)] API, 它应该使用 [指定数据库 (database)]。

示例：编写一个 Express.js API 来获取当前用户的个人信息，数据库使用 MongoDB.

提示：数据库有 [以逗号分隔的表名 (comma-separated table names)]，编写一段 [数据库 (database)] 查询语句来获取 [指定需求 (requirement)]。

示例：数据库有学生表和课程表，编写一段 PostgreSQL 语句查询至少注册了 3 门课程的学生列表。

代码补全
----

借助 AI 的强大能力，ChatGPT 还可以提供符合你代码上下文和风格的代码补全建议。

提示：补全下列代码 [代码片段 (code snippet)]

示例：补全下列代码

```
const animals = ["dogs", "cats", "birds", "fish"];let animal = animals[Math.floor(Math.random() * animals.length)];switch (animal) {  case "dogs":    console.log(      "Dogs are wonderful companions that bring joy and loyalty into our lives. Their wagging tails and wet noses never fail to make us smile."    );    break;}
```

一般来说，你最好以冒号结束提示，并另起一行粘贴你的代码块。用三个反引号 ```[代码 (code)]``` 或三个引号 """[代码 (code)]""" 分隔开代码块也是个不错的选择。

代码转换
----

作为开发者，你可能经常得和不同语言或框架的代码打交道。有了 ChatGPT, 你可以轻松地将代码片段从某种语言或框架转换为另一种语言或框架。

提示：将下面的代码片段从 [某语言 / 框架 (language/ framework)] 转换为 [指定语言 / 框架 (language/ framework)]：[代码片段 (code snippet)]

示例：将下列代码片段从 JavaScript 转换为 TypeScript

```
function nonRepeatingWords(str1, str2) {  const map = new Map();  const res = [];  // Concatenate the strings  const str = str1 + " " + str2;  // Count the occurrence of each word  str.split(" ").forEach((word) => {    map.has(word) ? map.set(word, map.get(word) + 1) : map.set(word, 1);  });  // Select words which occur only once  for (let [key, val] of map) {    if (val === 1) {      res.push(key);    }  }  return res;}
```

提示：将下列使用 [某 CSS 框架 (CSS framework)] 的代码转换为 [指定 CSS 框架 (CSS framework)]

示例：将下列使用 Bootstrap 的代码转换为使用 Tailwind CSS: [代码片段 (code snippet)]

代码解释
----

ChatGPT 可以通过提供解释、回答代码相关的具体问题来帮助你理解代码。这在你处理其他人写的代码或试图理解复杂的代码片段时相当有用。

提示：解释以下 [语言 (language)] 代码片段：[代码块 (code block)]

提示：这段代码做了什么：[Stack Overflow 上被接受的回答代码 (accepted answer code from stack overflow)]

代码审查
----

代码审查是软件开发的重要环节，当你独自一人工作时，你一般很难发现每一个潜在问题。在 ChatGPT 的帮助下，你可以识别代码中的异常和安全漏洞，来让它更加高效和安全。

提示：审查以下 [语言 (language)] 代码的代码异常并提出改进建议：[代码块 (code block)]

提示：找出以下代码中的任何潜在的安全漏洞：[代码片段 (code snippet)]

代码重构
----

你有没有写过 // 待办：重构 (todo: refactor) 这样的代码注释却从来没有做到？ChatGPT 可以帮你减少这种情况，它会给出重构和改进代码的建议，让你无需花费太多时间或精力。

提示：重构给定 [语言 (language)] 代码以改进其错误处理和弹性：[代码块 (code block)]

提示：重构给定 [语言 (language)] 代码以使其更加模块化：[代码块 (code block)]

提示：重构给定 [语言 (language)] 代码来提高它的性能：[代码块 (code block)]

提示：重构以下组件代码，使其支持跨移动设备、平板和桌面屏幕响应：[代码块 (code block)]

提示：为变量和函数给出具描述性和有意义的名称建议，使你代码中每个元素的编写目的更易理解：[代码片段 (code snippet)]

提示：给出简化复杂条件，以使其更易于阅读和理解的方法建议：[代码片段 (code snippet)]

漏洞检测和修复
-------

作为开发者，我们知道想要捕获代码中的所有漏洞 (bugs) 并非易事。不过，借助 ChatGPT 的提示，我们可以轻松识别并解决那些可能导致问题的讨厌漏洞。

提示：找出以下代码中的错误：[代码片段 (code snippet)] 

提示：我运行以下代码出错了 [错误 (error)]：[代码片段 (code snippet)]。我该如何解决？

系统设计和架构
-------

关于如何使用特定技术栈设计系统，或者对比不同技术栈的设计和架构，ChatGPT 可以提供宝贵的见解和建议。无论你是想构建 Web 应用、移动端应用还是分布式系统，ChatGPT 都可以帮你设计一套满足你需求的可扩展、可靠又可维护的架构。

**提示：**你是系统设计和架构方面的专家，告诉我如何设计一个 [系统 (system)]，技术栈是 [以逗号分隔的技术列表 (comma-separated list of technologies)]。

示例：你是系统设计和架构方面的专家，请告诉我如何设计酒店预订系统，技术栈是 Next.js 和 Firebase。

提示：对比以 [逗号分隔的技术列表 (comma-separated list of technologies)] 作为技术堆栈的设计和架构。

示例：对比以 React 和 Supabase 作为技术栈的设计和架构。

搜索引擎优化
------

ChatGPT 可以为你提供提示和最佳实践，对你的网站进行搜索引擎优化。

提示：如何优化落地页的 SEO?

提示：给出一个通过 HTML 代码的 部分对 [网站 (website)] 进行搜索引擎优化 (SEO) 的例子

示例：给出一个通过 HTML 代码的 部分对运动员社交网站进行搜索引擎优化 (SEO) 的例子

模拟数据生成
------

无论是为了测试还是演示，有一份真实的具有代表性的数据都至关重要。ChatGPT 可以帮你快速生成各种领域和格式的模拟数据。

提示：为 [指定域 (domain)] 生成 [指定数量 (number)] [实体 (entity)] 的示例 [数据格式 (data format)]

示例：为服装电子商务网站生成 5 种产品的示例 JSON

提示：你还可以在每次响应后继续输入提示，以进行更细粒度的控制

1.  给我一个电子商务网站上 [实体 (entity)] 的 [指定数量 (number)] 字段列表
    
2.  添加一个 “id” 字段，该字段对每个 [实体(entity)] 都是唯一的。将 [现有字段(existing field)] 替换为 [新字段(new field)]
    
3.  生成具有真实值的 [指定数量 (number)] 此类 [实体 (entity)] 的示例 [数据格式 (data format)]
    

测试
--

ChatGPT 可以帮你编写单元测试、生成测试用例列表、选择合适的测试框架或库。  

**提示：**使用 [指定测试框架 / 库 (testing framework/ library)] 为以下 [库 / 框架 (library/ framework)] 组件的 [组件代码 (component code)] 编写单元测试

提示：生成一份可以手动测试 Web / 移动端应用中用户注册功能的测试用例列表。

提示：我应该为 React Native 应用选择哪些测试框架或库？

文档
--

无论你在做个人项目还是团队项目，好文档都可以大大节省时间并且避免出问题。

提示：为以下代码写注释：[代码片段 (code snippet)]

提示：为以下 JavaScript 函数编写 JSDoc 注释：[代码片段 (code snippet)]

Shell 命令
--------

作为开发者，你要做的不仅仅是写代码。ChatGPT 可以协助你执行 Shell 命令和使用 Git 进行版本控制。

提示：写一个实现 [指定需求 (requirement)] 的 Shell 命令

示例：写一个删除'logs' 文件夹下所有扩展名为 '.log' 文件的 Shell 命令

提示：写一个实现 [指定需求 (requirement)] 的 Git 命令

示例：写一个撤消上次提交 (commit) 的 Git 命令

提示：解释以下命令 [命令 (command)]

示例：解释以下命令 [git switch -c feat/qwik-loaders]

正则表达式
-----

借助 ChatGPT，你可以理解复杂的正则表达式，生成与文本中特定模式匹配的正则表达式。

**提示：**解释这个正则表达式：[regex]

示例：解释这个 JavaScript 中的正则表达式：const regex = /^[A-Za-z0–9._%+-]+@[A-Za-z0–9.-]+\.[A-Za-z]{2,}$/;

**提示：**你的任务是生成匹配文本中特定模式的正则表达式，你给出的正则表达式要能轻松复制粘贴到支持正则表达式的文本编辑器或编程语言中使用。生成匹配 [指定文本 (text)] 的正则表达式。

内容
--

借助 ChatGPT，你可以根据你的特定需求生成各式各样的内容。

提示：生成电子商务网站的常见问题列表

提示：为课程落地页面生成内容。该课程是 “[课程名称 (course title)]”。它至少应包括以下部分：课程内容、主要受众是谁、他们将如何受益、课程组成和结构、教学方法、作者简介和定价部分。对于定价部分，提供三个等级供用户选择。

简历和求职信
------

制作抓人眼球的精美简历和求职信对许多人来说可能是一项艰巨的任务，但有了 ChatGPT, 一切就不再困难。ChatGPT 也能严格遵守任何字符或单词限制。

提示：使用我的简历写一个 LinkedIn 关于我的部分：[简历 (résumé)]，使用这些关键字 [逗号分隔的关键字 (comma-separated keywords)]。以第一人称书写、语气友好。不要超过 2,600 个字符。

提示：我想让你担任求职信写手。我会向你提供我的简历，你将生成一封求职信来进行完善。我希望求职信带有更多 [指定形容词 (adjective)] 的语气，因为我将申请一家 [指定公司类型 (type of company)] 的公司。以下是我的简历 [简历 (resume)]。以下是职位描述 [职位描述 (job description)]。

提示：[你的简历 (Your resume)] 根据 [指定公司 (company)] 的这个 [职称 (title)] 职位完善我的简历，包括展示影响和指标 [指定职位描述 (Job description)] 的关键成就。注意：你可以要求 ChatGPT 以 LaTex 标记生成输出。

面试准备
----

在 ChatGPT 的帮助下，你可以为即将到来的工作面试做好充分准备。

**提示：**我有一场 [指定公司 (company name)] [指定职称 (job title)] 的面试，帮助我回答以下问题：

1.  该公司本身、所在行业、竞争对手的信息
    
2.  该公司的企业文化
    
3.  我可以在面试结束时问的问题
    

提示：我正在面试一个 [指定职称 (job title)] 岗位。请列出 [该职称 (job title)] 职位的 10 个最常被问到的面试问题。  

**示例：**我正在面试高级 React 开发者岗位，请列出高级 React 开发者职位的 10 个最常被问到的面试问题。

提示：我正在面试一个 [指定职称 (job title)] 岗位，请生成 10 个专属于以下职业岗位的面试问题 [职业岗位 (job role)]

提示：随机问我一个简单 / 中等 / 困难的 Leetcode 问题，并根据正确性、时间和空间复杂性评估我的答题方案。

学习
--

Web 开发永远学无止境。无论是学习新的编程语言、了解最佳实践，还是提高网站性能，ChatGPT 都能满足你的需求。

提示：我是一名 Web 开发者，正在学习 [语言 / 技术 (language/ technology)]。给出前 5 个建议关注的 [社交媒体 (social media)] [帐户 / 渠道 / 个人资料 (accounts/ channels/ profiles)]。

提示：创建登录表单时的最佳实践是什么？

提示：解释 Web 无障碍的重要性并列出三种确保网站实现无障碍的方法

提示：在 [指定语言 / 框架 (language/framework)] 中编写干净且可维护的代码有哪些最佳实践？

提示：创建包含以下要求的 [指定技术 / 框架 (technology/ framework)] 博客应用，操作步骤有哪些？

1.  所有文章的列表页面
    
2.  文章详情阅读页面
    
3.  关于我的页面
    
4.  链接到我的社交媒体账号
    
5.  高性能
    

提示：[指定语言 / 框架 (language/ framework])] 中的 [相似概念列表 (list of similar concepts)] 有什么区别

示例：JavaScript 中的 var、let 和 const 关键字有什么区别

提示：用现实世界的类比解释 [语言 / 框架 (language/ framework)] [概念 (concept)]

示例：用现实世界的类比解释 JavaScript promises

提示：提高网站性能的不同方法有哪些？

结论
--

如果你是个 Web 开发者，ChatGPT 可以为你提供提示和策略来简化你的编码任务，从而优化你的工作流程并提高效率。虽然 ChatGPT 是一个强大的工具，但你也要牢记它的局限性，并把它当作你的知识和技能的补充。通过核实它的研究数据和紧跟时事，你可以充分利用 AI 在 Web 开发中的优势。将 ChatGPT 作为宝贵的资源，你可以自信地驾驭 Web 开发世界，大大提高你的技能。