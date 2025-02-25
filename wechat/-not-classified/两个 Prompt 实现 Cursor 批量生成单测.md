> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/xPcZumj6MHsaeLkmRTrv-w)

我是范文杰，一个专注于 AI 辅助编程与前端工程化领域的工程师，**近期有不少 HC，感兴趣的同学可联系我内推！**欢迎关注：

  

最近用 Cursor 生成了一批单测代码，合计 1.1w 行代码，最开始生成的效果并不好，经过一番调教，目前我所维护的仓库已经实现某种半自动化的 UT 生成能力：**在我并不理解代码逻辑的情况下，仅需一行 Prompt ，即可为** **Monorepo** **中某个 Package 所有****源码****批量生成单测**  的效果：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/3xDuJ3eiciblkTt00g4sFxwwnZtZ2dTVA13kastOY1vpw6obhOjNPYKAhia5KpjBSsnAVHh3KGaj869rBTpBfuznw/640?wx_fmt=png&from=appmsg)![](https://mmbiz.qpic.cn/sz_mmbiz_png/3xDuJ3eiciblkTt00g4sFxwwnZtZ2dTVA1bmOvQf9SsJDn4YyQFUGNpNFLs8wHw15vLTP79gtICwbTSnQxsJNiazw/640?wx_fmt=png&from=appmsg)

这里面 Cursor 逐次做了几件事情：

1.  根据包名找到源码目录；
    
2.  扫描源码目录，确定需要生成单测的源码文件，并记录到 `.cursor/task.md` 文件中；
    

![](https://mmbiz.qpic.cn/sz_mmbiz_png/3xDuJ3eiciblkTt00g4sFxwwnZtZ2dTVA1ImsB4t7ibQ9ZvVclbKUOHtraRazN8NKfDcoQibveRq41spluzBlg8ZQw/640?wx_fmt=png&from=appmsg)

1.  针对 `.cursor/task.md` 标记的每一个任务，根据 `.cursor/rules/instruct-ut.mdc` 指令迭代生成单测代码，直至测试通过且覆盖率达标；
    

这是怎么做到的呢？PE！纯粹的 PE，没有增加任何一行代码！

  
Prompt 解析  

---------------

首先，Cursor 支持多文件编辑，支持仓库索引，支持配置 `.cursorrules` 等特性，因此其本身就有能力批量完成编程任务，但在过往的测试中，批量生成单测的效果并不好，遇到过不少问题，主要可归结为两个点：

1.  Package 的文件可能很多，Cursor Composer 经常生成一部分文件后就会退出生成过程，只能部分完成任务；
    
2.  我所维护的是一个 Monorepo 仓库，体积很大，合计 300+ Package，200w 行代码，代码的嵌套层次很深，模块依赖关系非常复杂，并且大量使用 TS Alias 等特性，导致单测的复杂度也相应增加了许多；
    

针对第二点，实测只需补充若干 Prompt ，用于明确单测代码规范、技术栈等关键上下文信息即可 (`.cursor/rules/spec-for-ut.mdc`)：

```
# Unit Test Specification Expert## Skills1. Writing unit tests for React components and functions using Vitest.2. Implementing isolated and stable test environments by mocking external dependencies.3. Structuring test code following the arrange-act-assert pattern.4. Ensuring compliance with file placement conventions for test files.5. Avoiding source code modifications solely for unit testing purposes.## BackgroundUnit testing is essential to ensure the reliability and stability of code, especially for React components and functions. Adhering to best practices and ensuring high test coverage is critical to maintaining a robust codebase.## Goals1. Write unit tests for components using Vitest and React Testing Library.2. Implement integration tests for critical user flows.3. Maintain unit test coverage of at least 80%.4. Ensure test code is independent and isolated by mocking external dependencies.5. Follow test file placement conventions to organize code effectively.6. Avoid modifying source code for testing purposes.## Rules1. Use Vitest exclusively for unit testing; avoid Jest.2. Use snapshot testing judiciously and only where appropriate.3. Ensure test files are placed in the correct `__tests__` directory structure:   - Example 1: The unit test file for `root/packages/community/pages/src/bot/components/bot-store-chat-area-provider/index.tsx` should be placed in `root/packages/community/pages/__tests__/bot/components/bot-store-chat-area-provider/index.test.tsx`.   - Example 2: The unit test file for `root/xxx/src/foo/bar/xxx.ts` should be placed in `root/xxx/__tests__/foo/bar/xxx.test.tsx`.4. Follow the arrange-act-assert pattern in test code organization.5. Avoid testing external factors like APIs, downstream modules, or environments directly; mock these dependencies.6. Use `expect(ele?.className).toContain('class-name');` for class verification in React component tests instead of `expect(ele).toHaveClass('class-name');`.7. Maintain English usage throughout - avoid Chinese comments, test case names, etc.# ReferenceIf necessary, you can refer to the following documents:- [Vitest](https://vitest.dev/guide/)- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)- [Arrange-Act-Assert](https://github.com/civic/arrange-act-assert)
```

难点在于第一点：如何持续性地生成代码？这里取了个巧，让 Cursor 在将任务进度记录到外部文件中 (`.cursor/rules/instruct-ut.mdc`)：

```
# InstructionsWhen a user requests to generate unit tests for a directory of packages, first check the task progress in the `.cursor/unit-test` directory and prioritize resuming the previous progress. If no previous progress is recorded, start a new task and execute:1. Find the code location corresponding to the package name;2. Locate the source files containing logic code in the directory, record them as a task list, and save to `.cursor/unit-test/tasks.md`, for example:- [ ] `src/index.ts`- [ ] `src/utils/index.ts`- [ ] `src/hooks/index.ts`- [ ] `src/components/index.ts`- [ ] `src/pages/index.ts`- [ ] `src/services/index.ts`- [ ] `src/types/index.ts`3. Following the instructions in `./.cursor/spec-for-ut.md`, generate unit tests for each file from the previous step. After generation and passing tests, record in `.cursor/unit-test/tasks.md`, for example:- [x] `src/index.ts`- [x] `src/utils/index.ts`- [x] `src/hooks/index.ts`- [x] `src/components/index.ts`- [x] `src/pages/index.ts`- [x] `src/services/index.ts`- [x] `src/types/index.ts`4. If some unit test files consistently fail and only have one or two failing test cases, remove those test cases to ensure overall test passing5. If any error cases are encountered during generation, record them in `.cursor/lessons` to avoid repeating the same mistakes in the future;6. Recursively generate unit tests for each file until all files are completed, then exit the execution process7. after all the files are completed, you should update the `.cursor/unit-test/tasks.md` file to reflect the progress.# Limitations- you can just use vitest to generate the unit test code.
```

之后，Cursor 每次生成单测时都会先到 `tasks.md` 文件中查找任务列表，恢复上次执行进度。

  
效果  

--------

在上述 Cursor Rules 基础上，后续的交互就简单许多了，只需使用下述 Prompt 即可：

```
为 @coze/api 包生成单测//or 为 xxx 目录/文件生成单测
```

至此，至少从 “量” 上，Cursor 已经能帮助生成比较完整的单测代码了，并且大部分简单代码都能一次性通过。但对于复杂场景、复杂组件，生成的代码通常会存在一些问题，没法直接跑通，例如：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/3xDuJ3eiciblkTt00g4sFxwwnZtZ2dTVA1QicHPGdFDMArmkPnxTSJia0YU3fKZcDicEhUhIbhFkF5lWECD3cXVJyNA/640?wx_fmt=png&from=appmsg)![](https://mmbiz.qpic.cn/sz_mmbiz_png/3xDuJ3eiciblkTt00g4sFxwwnZtZ2dTVA1V8TeDWYiaic8UOyKP3rlNgZ2XG6UUOQ1S1L8cJhVvChviaiaGbDbvEcoJQ/640?wx_fmt=png&from=appmsg)

接下来就需要人工介入修复这些疑难杂症了，有一些小技巧：

1.  使用 测试框架 (vitest/jest 都有提供) 的 `[only](https://vitest.dev/api/#describe-only)` 接口配合 Filter 能力，只跑存在问题的用例，降低信息噪音；
    
2.  可以使用 terminal 右上角的 `Add to Composer` 按钮，让 LLM 继续帮你解决问题；
    

![](https://mmbiz.qpic.cn/sz_mmbiz_png/3xDuJ3eiciblkTt00g4sFxwwnZtZ2dTVA1HfAvIIBVcCYB10czia6JWe5ytxcZhcXf3oD9HqkSABkibjtCVV5HZiayw/640?wx_fmt=png&from=appmsg)

1.  其次，绝大部分问题都出在 `Mock` 上面，例如下图所示，错误看起来是 ESM 与 CommonJS 互相调用的问题，实则可以通过 Mock 解决，因此需要有意识 Mock 掉所有下游模块调用、环境变量调用等 (LLM 在这方面做的并不是很好，还是需要比较多人工介入)；
    

![](https://mmbiz.qpic.cn/sz_mmbiz_png/3xDuJ3eiciblkTt00g4sFxwwnZtZ2dTVA1RkChUCW5oC24tnHUia0Ln1AeUCCqdoyMIQR1PiaWfHZeuWNV31D0b8hw/640?wx_fmt=png&from=appmsg)

  
最后  

--------

为免遗漏，最后在总结几个必要条件：

1.  安装 Cursor，尽可能充上会员；
    
2.  开启 Codebase Indexing；
    
3.  打开 Cursor Agent Yolo 模式，它能自动调用各类 cli 工具，验证生成的代码是否符合预期，比如自动调用 lint 检查代码风格，ts 检查类型合规，vitest 检测单测是否通过等；
    

![](https://mmbiz.qpic.cn/sz_mmbiz_png/3xDuJ3eiciblkTt00g4sFxwwnZtZ2dTVA1kja4SAuQFgOfc2gng8aBXkciaID8ho18LV7K7y4ejYCmGkicqE9PFEUA/640?wx_fmt=png&from=appmsg)

1.  把上述两段 Rules 加进 `.cursor/rules` 中
    

其次，面对复杂代码时，LLM 通常无法顺利生成对应单测，甚至在人类智能介入的情况下，成本依然很高，因此更建议尽可能保持源码的简洁性，遵循一些最佳实践规则，下一篇文章我会总结一些 **LLM 背景下，前端单测的最佳实践指南** ，欢迎关注。