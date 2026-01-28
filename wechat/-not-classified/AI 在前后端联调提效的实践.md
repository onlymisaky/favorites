> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/BNEOh6gSR1H9ZVfmahuPqA)

### 一、背景介绍

现阶段前后端自测 + 联调耗时较长，经过摸底，耗时主要在以下几个方面：**接口录入**、**接口转为前端代码**、**mock 数据生成**。但是在我们预期中，联调耗时占比应该很少，理想情况下就像两个匹配的齿轮，各自完成开发后，组装在一起便可顺利运行。为了达到这种状态，需要重新梳理我们现有的工具和流程，融入 AI 的能力，让联调自测环节更加高效。

目前存在的问题包括：接口文档维护不及时，导致前后端理解不一致；手动编写接口调用代码效率低下；mock 数据缺乏真实性，无法充分验证业务逻辑；联调过程中频繁的沟通协调消耗大量时间。这些问题不仅影响了开发效率，也降低了代码质量和项目的整体交付速度。

### 二、项目目标

通过 AI 智能化，改进接口从定义到联调的全流程，提升前后端联调效率。将自测联调占开发时间的比值显著降低。

预期效果

通过引入 AI 能力，实现接口文档的智能生成和维护，自动化的代码生成，以及更真实的 mock 数据模拟。让前后端开发能够无缝对接，大大减少联调阶段的沟通成本和问题排查时间，最终实现开发效率的质的提升。

### 三、项目方案

针对这些问题，我们计划通过 AI 改进现有系统的方式，让开发同学可以围绕接口平台（ZAPI） 和 IDE（Cursor）来实现从接口定义到自测联调的全部流程，从而提升自测联调效率。

传统的流程中，接口的定义往往是先写一个简陋的文档，然后前后端根据文档，编写具体的代码，过程中再不断完善文档。但如果放到现在，这个流程相对就比较繁琐了，并且不可避免的有重复的工作（比如接口说明、描述等）

结合当前 AI 能力，我们重构了一下我们接口的定义与联调流程，更多的将整个流程整合到我们的核心工具链条中（Cursor + ZAPI）

这里面特别是 Cursor，对于程序员来说，我们最终的产物都会落在代码上，而最懂你代码的就是你的 IDE（Cursor），所以我们整体思路上，就是能在 Cursor 上完成的，就在 Cursor 上完成。

![](https://mmbiz.qpic.cn/mmbiz_jpg/T81bAV0NNN8VdJHNB70FSicj0RyDaSn47nN6CjadWarycQJ1Uf8NK8R1TCQ1F22dKtvolRbCIWpInu4ibuH6emEw/640?wx_fmt=jpeg&from=appmsg#imgIndex=0)

### 3.1 接口录入

在软件开发过程中，接口文档的维护一直是开发团队面临的挑战。无论是手工编写文档的低效与错误，还是代码变更后文档同步的滞后，再到不同数据源文档格式的不统一，这些问题都直接影响着开发效率和团队协作。接下来，让我们具体看看这些常见的问题：

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNN8VdJHNB70FSicj0RyDaSn47NhBWRV061eSzqfhiaCY7HicCvWLfqjE7VaQcg9lPekayyKmNBKnDg55w/640?wx_fmt=png&from=appmsg#imgIndex=1)

#### 3.1.1 方案概要

方案概要主要是将目前三种可生成接口数据源统一落到 ZAPI 平台里，然后通过工程化处理后调用模型生成 OpenAPI，中间再有一些规范校验、差异检测操作后落入到 ZAPI 平台上进行接口管理。

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNN8VdJHNB70FSicj0RyDaSn47aF6UQzXhDDRXbKVRWverpAOQV5BuDDv1cguPDTfT9Cw0ggzOTGIPibw/640?wx_fmt=png&from=appmsg#imgIndex=2)

#### 3.1.2 技术架构

大神文档和纯文档方案是相似的，都是把富文本转化成 Markdown，所以下面的内容主要着重 Git 代码生成接口部分。

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNN8VdJHNB70FSicj0RyDaSn47xT3fVml5f8I11JCSbPP1LeXn1Xh3LZS5H2JAbcianZyQz4Ro6VuGictw/640?wx_fmt=png&from=appmsg#imgIndex=3)

在调用模型接口之前，还需要做一些工程化能力：`精准识别变更方法`、`按方法数进行文件拆分`、`解析Java代码上下文`。

#### 3.1.3 精准识别变更方法

只获取目标方法（变更、新增），而不是代码里所有方法。

<table><tbody><tr><td><section nodeleaf=""><img class="" src="https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNN8VdJHNB70FSicj0RyDaSn47pxfoHXNdic5kH0BfXCCXcFg1JxXuwWjtNOGQOhKopccicKorHnNZOGLA/640?wx_fmt=png&amp;from=appmsg#imgIndex=4"></section><section>&nbsp;<p>普通 web 接口</p><br><section nodeleaf=""><img class="" src="https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNN8VdJHNB70FSicj0RyDaSn47iaib2vCWuJT9MmpEfWR6yQuw5ENiathVSgKe2s1micz58rDLHHwDicYKFZg/640?wx_fmt=png&amp;from=appmsg#imgIndex=5"></section>&nbsp;<p>SCF 接口</p></section></td><td><section nodeleaf=""><img class="" src="https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNN8VdJHNB70FSicj0RyDaSn47WW1LicTM661OwZCV4Xt1xdkowu9RugKmqkq8xQ8bgdtktHxum5f70PA/640?wx_fmt=png&amp;from=appmsg#imgIndex=6" style="width: auto;"></section></td></tr></tbody></table>

#### 3.1.4 拆分文件

拆分文件的目的：如果某个分支代码影响的方法过多，比如新起了一个项目新增了很多接口，过长的代码作为输入 token 就会导致模型接口超时或模型输出 token 不完整等问题，而且拆分后还可以并发调用模型接口提高生成速度。

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNN8VdJHNB70FSicj0RyDaSn47BZuaCwX11vcEgwpdicjkQGviaVOUib8IHVb8cd0ibupicGXDP6h8XK5QYLw/640?wx_fmt=png&from=appmsg#imgIndex=7)

**目前按 2 个方法拆分文件**

ICemUserTestService.java_part1 包含前两个方法

ICemUserTestService.java_part2 包含最后一个方法

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNN8VdJHNB70FSicj0RyDaSn47QOvDficJiacLicU70U4D9YN98dFWuwjUqsOWl1CTk99iaQUk3Yct7AL1ng/640?wx_fmt=png&from=appmsg#imgIndex=8)

#### 3.1.5 解析 Java 代码上下文

识别到方法后，如果没有解析出相关联的引入类那么模型生成的数据在出入参等字段上就会有缺失，因此还需要解析出方法关联的入参、返回值类，这样我们获取到完整 java 代码后，再把这些代码和对应的路径作为 prompt 的一部分。

<table><tbody><tr><td><section nodeleaf=""><img class="" src="https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNN8VdJHNB70FSicj0RyDaSn47U3cT7wDqEUtJwKpmAViagpQpEOKyNXicBW6DZh9ZJxqGIYn7LwCjNLZg/640?wx_fmt=png&amp;from=appmsg#imgIndex=9"></section><section>&nbsp;<section nodeleaf=""><img class="" src="https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNN8VdJHNB70FSicj0RyDaSn47icobXbt91XYNyLhPOaV0Zr1OJEAYQQaiaeib2UYhGic5fwjwH3dCjkdjow/640?wx_fmt=png&amp;from=appmsg#imgIndex=10"></section>&nbsp;<section nodeleaf=""><img class="" src="https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNN8VdJHNB70FSicj0RyDaSn47o6WRr3tmKc8exyy0jticzm24G9p2CyekpYLemJzaBRKIX5VcNTQPicZw/640?wx_fmt=png&amp;from=appmsg#imgIndex=11"></section>&nbsp;</section></td></tr><tr><td><section nodeleaf=""><img class="" src="https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNN8VdJHNB70FSicj0RyDaSn47QOvDficJiacLicU70U4D9YN98dFWuwjUqsOWl1CTk99iaQUk3Yct7AL1ng/640?wx_fmt=png&amp;from=appmsg#imgIndex=12"></section></td></tr></tbody></table>

#### 3.1.6 模型 Prompt 编写

经过上面步奏获取到完整上下文的 java 代码后调用模型接口生成 openapi json，我们主要关心`接口名称（ZAPI接口名称）`、`接口路径`、`请求方法`、`请求格式`、`请求参数`、`字段属性`、`Tag（ZAPI分类）`这些生成的准确度，下面着重讲解下`请求格式`、`请求参数`、`字段属性`：

<table><tbody><tr><td><b>请求格式</b></td><td><section nodeleaf=""><img class="" src="https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNN8VdJHNB70FSicj0RyDaSn47tA5zX26ibh7jAeFONskicq9ibGrtnQMK9GiakliaRhap7mNicjiaKUMK6CdAA/640?wx_fmt=png&amp;from=appmsg#imgIndex=13"></section></td></tr><tr><td><b>请求参数</b></td><td><section nodeleaf=""><img class="" src="https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNN8VdJHNB70FSicj0RyDaSn47K0OuKUxZ9yiaCwib06ZlHpb7JD3wcMJPWyHR37bT3Be7Yje0qtq9SuWA/640?wx_fmt=png&amp;from=appmsg#imgIndex=14"></section></td></tr><tr><td><b>字段属性</b></td><td><section nodeleaf=""><img class="" src="https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNN8VdJHNB70FSicj0RyDaSn47038hAn3IID5cReVSjDhG5NBh5iaFnYY7I3WXtLqZDV5rFEWMBfgDpTQ/640?wx_fmt=png&amp;from=appmsg#imgIndex=15"></section></td></tr></tbody></table>

#### 3.1.7 总结

和传统静态解析相比，利用 AI 只需要关注接口生成的规则给予相应的 prompt，则无需修改代码，智能理解业务逻辑，自动生成高质量接口文档。

### 3.2 zapi 接口智能转为前端代码

以往我们在编写前端调用接口代码，都是对着 ZAPI 文档手工编写，在前端也需要写一份和后端类似的各种类型定义，这种过程是繁琐且耗时的，有下列痛点：

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNN8VdJHNB70FSicj0RyDaSn47NhBWRV061eSzqfhiaCY7HicCvWLfqjE7VaQcg9lPekayyKmNBKnDg55w/640?wx_fmt=png&from=appmsg#imgIndex=16)

#### 3.2.1 MCP-ZAPI 实现代码生成

现在我们在 cursor 中利用 MCP-ZAPI 来实现前端调用接口代码的自动编码，有更快的速度和更一致的代码风格。

支持单个、多个 URL，并且支持提供文件或不提供文件两种方式。

提供对应文件时，会先理解该文件中的代码风格，并将接口定义生成到对应文件中。

不提供对应文件时，会先理解该工程中接口定义的代码风格，新建语义化文件并将接口定义生成到新建的文件中。

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNN8VdJHNB70FSicj0RyDaSn47I0Zibju4buw0cf1ErqcqFRH06M98FJrTrTXrfrISe5r3K2AzDhazF1A/640?wx_fmt=png&from=appmsg#imgIndex=17)

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNN8VdJHNB70FSicj0RyDaSn47z5kUfBMLibNbicRibjupze85Tq0Lp9lSYTm3WvEQmjibyd77ickkUJyiaV0Q/640?wx_fmt=png&from=appmsg#imgIndex=18)

1.  首先会对引用的 url 进行分析，并获取到接口 schema。
    
2.  判断是否有引用的目标文件以及分析当前工程的接口定义风格。
    
3.  保证相同的代码风格并生成接口定义代码。
    

### 3.3 AI_MOCK 工具集成

前端 mock 数据一般是使用 mockjs 生成，但是还存在以下问题：

*   需要手动编写 mock 数据
    
*   同一接口 mock 数据只有一份，使用者不能方便自定义使用修改 mock 数据
    
*   全是随机数据，无法满足业务自测场景
    

#### 3.3.1 接入集成

在项目中接入内部 npm 包，这个实现原理主要是拦截 ajax 和 fetch 请求，接入后会在页面展示气泡入口。

<table><tbody><tr><td><section nodeleaf=""><img class="" src="https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNN8VdJHNB70FSicj0RyDaSn47DUViaqcoSZvtXicnTy7ib6WpdnDAN5JNgb2VnoU7KFJI5Rhs1kT29zZHw/640?wx_fmt=png&amp;from=appmsg#imgIndex=19"></section></td><td><section nodeleaf=""><img class="" src="https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNN8VdJHNB70FSicj0RyDaSn470MiavwtouMVoejRfwK1uKF3UQKRncYWTGBpD8KXKMJQ2PzVHWHlEPiag/640?wx_fmt=png&amp;from=appmsg#imgIndex=20"></section></td></tr></tbody></table>

#### 3.3.2 使用

点击气泡弹出有抽屉，展示拦截的接口列表。

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNN8VdJHNB70FSicj0RyDaSn470PAFftblJVcEg7rflx1r2HW3MRicibthxILIYfBvIvCK6pnRL1NIWd7A/640?wx_fmt=png&from=appmsg#imgIndex=21)

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNN8VdJHNB70FSicj0RyDaSn47LR4Vh9sZ1vBsInusMvibfRkG8PzfK3FDj79fTFsBF112QARc4jErjJA/640?wx_fmt=png&from=appmsg#imgIndex=22)

点击查看按钮，可查看或修改响应数据。可以使用 mockjs 生成 mock 数据，或者也可以点击`AI生成按钮`来生成，通过匹配 ZAPI 接口 schema 后调用模型接口来生成更加符合业务语义化的 mock 数据。

#### 3.3.3 总结

通过集成 AI_MOCK 工具后，每个使用者可自定义接口 mock 数据，在开发阶段可使用更加真实符合业务的数据，尤其是 demo 演示时更加真实。

### 四、总结与展望

#### 4.1 总结

通过系统化引入 AI 技术改进前后端联调流程，我们在接口录入、代码生成、Mock 数据等关键环节取得了显著成效，验证了 AI 在软件开发流程中提质增效的巨大潜力。在多个典型实践场景中，AI 展现出在接口文档自动生成、前端代码智能转换、业务语义化 Mock 数据生成等方面的突出能力，大幅降低了重复性、规范化工作的开发成本，同时有效保障了接口定义的一致性和代码风格的可维护性。

#### 4.2 展望

随着生成式 AI 技术的持续演进，我们正站在一场前后端联调流程变革的起点。传统的 "接口文档→手工编码→联调测试→问题修复" 的线性流程将被彻底重构。

从 "文档驱动" 到 "代码驱动" 未来 AI 将直接从代码变更中智能提取接口定义，实现 "代码即文档" 的实时同步，前后端开发者无需再维护冗余文档。

从 "接口到页面" 的智能生成链路 当接口调用代码生成完成后，AI 将结合原型图自动生成完整的页面代码

从 "手工 Mock" 到 "智能仿真" AI 将基于业务上下文生成真实、多样化的测试数据，模拟复杂业务场景，让联调测试更贴近生产环境。

从 "问题发现" 到 "问题预防" AI 将在开发过程中实时分析接口兼容性，预测潜在问题，在代码提交前就给出修改建议。

从 "经验依赖" 到 "智能沉淀" AI 将学习团队的最佳实践，形成标准化的开发模式和代码模板，让新成员也能快速产出高质量代码。

通过持续优化 AI 辅助工具链，我们有望实现从 "人适应流程" 到 "流程适应人" 的转变，让整个开发过程从传统的手工模式转变为 AI 驱动的智能化开发模式。

想了解更多转转公司的业务实践，点击关注下方的公众号吧！