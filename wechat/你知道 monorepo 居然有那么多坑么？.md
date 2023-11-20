> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/vWzKDuzU0dBTwThdrK_xtg)

前言
--

今天文章的话题是 monorepo。在进入正文之前，笔者先来概括下什么是 monorepo 以及本文会从哪几个点来聊聊 monorepo。

monorepo 简单来说就是将多个项目整合到了一个仓库里来管理，很多开源库都采用了这种代码管理方式，比如 Vue 3.0：

![](https://mmbiz.qpic.cn/mmbiz_jpg/tibUxowsg9P0xSKMrEqXnpxllMU3drysCqiaq4llpeWh4DQDa9DsQbmj4GnyPPoSWA3AiawJxbsTGkDbuhFbKic6mA/640?wx_fmt=jpeg)

从上图我们可以看到 packages 文件夹下存在一堆文件夹，这每个文件夹都对应一个 npm 包，我们把这一些 npm 包都管理在一个仓库下了。

了解 monorepo 的读者肯定听过 lerna，想必也看过不少 lerna 配置相关的文章。本文不会来聊 lerna 该怎么怎么配置，而是主要来聊聊当我们使用 monorepo 后会引入哪些问题？lerna 这些工具链解决了什么问题以及是如何解决的，总的来说将会从以下几点来聊聊 monorepo：

*   对比一下几种代码管理方式的不同处
    
*   这些代码管理方式各自有什么优缺点，为什么我们会选择 monorepo
    
*   选择 monorepo 会给我们带来哪些挑战
    
*   市面上流行的工具链，比如 lerna 是如何帮助我们解决问题的
    

两种代码管理的方式及优缺点
-------------

目前流行的就两种代码管理方式，分别为：

*   multi repo
    
*   mono repo
    

![](https://mmbiz.qpic.cn/mmbiz_png/tibUxowsg9P0xSKMrEqXnpxllMU3drysCJoEwlwvEfp03ld6QrD6NX9fZgFWDLOjdjKzS5WFH55xZ8nPU3x8PHA/640?wx_fmt=png)j55G0G

接下来聊聊它们各自的优缺点。

### 开发

**mono repo**

✅ 只需在一个仓库中开发，编码会相当方便。

✅ 代码复用高，方便进行代码重构。

❌ 项目如果变的很庞大，那么 git clone、安装依赖、构建都会是一件耗时的事情。

**multi repo**

✅ 仓库体积小，模块划分清晰。

❌ 多仓库来回切换（编辑器及命令行），项目一多真的得晕。如果仓库之间存在依赖，还得各种 `npm link`。

❌ 不利于代码复用。

### 工程配置

**mono repo**

✅ 工程统一标准化

**multi repo**

❌ 各个团队可能各自有一套标准，新建一个仓库又得重新配置一遍工程及 CI / CD 等内容。

### 依赖管理

**mono repo**

✅ 共同依赖可以提取至 root，版本控制更加容易，依赖管理会变的方便。

**multi repo**

❌ 依赖重复安装，多个依赖可能在多个仓库中存在不同的版本，`npm link` 时不同项目的依赖可能会存在冲突问题。

### 代码管理

**mono repo**

❌ 代码全在一个仓库，项目一大，几个 G 的话，用 Git 管理会存在问题。

**multi repo**

✅ 各个团队可以控制代码权限，也几乎不会有项目太大的问题。

### 部署

这部分两者其实都存在问题。

multi repo 的话，如果各个包之间不存在依赖关系倒没事，一旦存在依赖关系的话，开发者就需要在不同的仓库按照依赖先后顺序去修改版本及进行部署。

而对于 mono repo 来说，有工具链支持的话，部署会很方便，但是没有工具链的话，存在的问题一样蛋疼，后续文章中会讲到。

看了上文中的对比，相信读者应该是能认识到 mono repo 在一些痛点上还是解决得很不错的，这也是很多开源项目采用它的原因。但是实际上当我们引入 mono repo 架构以后，又会带来一大堆新的问题，无非市面上的工具链帮我们解决了大部分问题，比如 lerna。

接下来笔者就来聊聊 monorepo 在**不使用工具链**的情况下会存在哪些问题，以及市面上的工具链是如何解决问题的。

monorepo 带来了什么问题
----------------

### 安装依赖

各个包之间都存在各自的依赖，有些依赖可能是多个包都需要的，我们肯定是希望相同的依赖能提升到 root 目录下安装，其它的依赖装哪都行。

此时我们可以通过 yarn 来解决问题（npm 7 之前不行），需要在 package.json 中加上 `workspaces` 字段表明多包目录，通常为 `packages`。

之后当我们安装依赖的时候，yarn 会尽量把依赖拍平装在根目录下，存在版本不同情况的时候会把使用最多的版本安装在根目录下，其它的就装在各自目录里。

```
|   ├── node_modules
|   |   ├── axios@0.21.1
├── packages
|   ├── pkg1
|   |   ├── package.json -> 依赖了 axios 0.21.1
|   ├── pkg2
|   |   ├── package.json -> 依赖了 axios 0.21.1
|   ├── pkg3
|   |   ├── node_modules
|   |   |   ├── axios@0.21.0
|   |   ├── package.json -> 依赖了 axios 0.21.0
```

**这种看似正确的做法，可能又会带来更恶心的问题。**

比如说多个 package 都依赖了 React，但是它们版本并不都相同。此时 node_modules 里可能就会存在这种情况：根目录下存在这个 React 的一个版本，包的目录中又存在另一个依赖的版本。

![](https://mmbiz.qpic.cn/mmbiz_png/tibUxowsg9P0xSKMrEqXnpxllMU3drysCb9aUe0p28icjWiaTGJ3w3L3GlTdLZtcsibyxsRUCD4oktH29UcgNhiafhg/640?wx_fmt=png)guYtrn

因为 node 寻找包的时候都是从最近目录开始寻找的，此时在开发的过程中可能就会出现多个 React 实例的问题，熟悉 React 开发的读者肯定知道这就会报错了。

遇到这种情况的时候，我们就得用 `resolutions` 去解决问题，当然也可以通过阻止 yarn 提升共同依赖来解决（更麻烦了）。笔者已经不止一次遇到过这种问题，多是安装**依赖的依赖**造成的多版本问题。这种**依赖的依赖**术语称之为「幽灵依赖」。

### link

在 multi repo 中各种 link 已经够头疼了，我可不想在 mono repo 中继续 link 了。

此时 yarn 又拯救了我们，在安装依赖的时候会帮助我们将各个 package 软链到根目录中，这样每个 package 就能找到另外的 package 以及依赖了。

但是实际上这样的方式还会带来一个坑。因为各个 package 都能访问到拍平在根目录中的依赖了，因此此时其实我们无需在 package.json 中声明 dependencies 就能使用别人的依赖了。这种情况很可能会造成我们最终忘了加上 dependencies，一旦部署上线项目就运行不起来了。

以上两块主要聊了依赖以及 link 层面的问题，这部分我们可以虽然可以通过 yarn 解决，但是又引入了别的问题。

![](https://mmbiz.qpic.cn/mmbiz_png/tibUxowsg9P0xSKMrEqXnpxllMU3drysC1esEM1l1XQHlZb6aINiaTQgDNrGCEQksIJuSgeOicWLLibpEytP5Cmkxg/640?wx_fmt=png)zQRUpt

接下来聊聊 mono repo 在 CI 中会遇到的挑战，包括了构建、单测、部署环节。

### 构建

构建是我们会遇到的第一个问题。这时候可能有些读者就会迷惑了，构建不就是跑个 build 么，能有个啥问题。哎，接下来我就跟你聊聊这些问题。

首先因为所有包都存在一个仓库中了，如果每次执行 CI 的时候把所有包都构建一遍，那么一旦代码量变多，每次构建可能都要花上不少的时间。

这时候肯定有读者会想到**增量构建**，每次只构建修改了代码的 package，这个确实能够解决问题，核心代码也很简单：

```
git diff --name-only {git tag / commit sha} --{package path}
```

上述命令的功能是寻找从上次的 git tag 或者初次的 commit 信息中**查找某个包是否存在文件变更**，然后我们拿到这些信息只针对变更的包做构建就行。但是注意这个命令的前提是在部署的时候打上 tag，否则就找不到上次部署的节点了。

但是单纯这样的做法是不够的，因为在 mono repo 中我们还会遇到**多个 package 之间有依赖**的场景：

![](https://mmbiz.qpic.cn/mmbiz_png/tibUxowsg9P0xSKMrEqXnpxllMU3drysCic3ZQFehd4kYibialXa7MN135PtIGUe0m12Ky3QHYBRzOuWNJ0nunWtcQ/640?wx_fmt=png)RdUElM

在这种情况下假如此时在 CI 中发现只有 A 包需要构建并且只去构建了 A 包，那么就会出现问题：在 TS 环境下肯定会报错找不到 D 包的类型。

在这种存在包于包之间有依赖的场景时，我们需要去**构建一个有向无环图（DAG）来进行拓扑排序**，关于这个概念有兴趣的读者可以自行查阅资料。

总之在这种场景下，我们需要寻找出各个包之间的依赖关系，然后根据这个关系去构建。比如说 A 包依赖了 D 包，当我们在构建 A 包之前得先去构建 D 包才成。

以上是没有工具链时可能会出现的问题。如果我们用上 lerna 的话，内置的一些命令就可以基本帮助我们解决问题了：

*   `lerna changed` 寻找代码有变动的包，接下来我们就可以自己去进行增量构建了。
    
*   通过 lerna 执行命令，本身就会去进行拓扑排序，所以包之间存在依赖时的构建问题也就被解决了。
    

总结一下构建时我们会遇到的问题：

![](https://mmbiz.qpic.cn/mmbiz_png/tibUxowsg9P0xSKMrEqXnpxllMU3drysCOBG9z5ETTFuSXnF0rmWz8DVa1mJwyFbtI2UXDJicSU6HenAP5dCgrZw/640?wx_fmt=png)T95y1Q

### 单测

单测的问题其实和构建遇到的问题类似。每次把所有用例都跑一遍，可能耗时比构建还长，引入增量单测很有必要。

这个需求一般来说单测工具都会提供，比如 Jest 通过以下命令我们就能实现需求了：

```
jest --coverage --changedSince=master
```

但是这种单测方式会引来一个小问题：单测覆盖率是以「测试用例覆盖的代码 / 修改过的代码」来算的，很可能会出现覆盖率不达标的问题，虽然整体的单测覆盖率可能是达标的。常写单测的读者肯定知道有时候一部分代码就是很难写单测，出现这种问题也在所难免，但是如果我们在 CI 中配置了低于覆盖率就不能通过 CI 的话就会有点蛋疼。

当然这个问题其实仁者见仁智者见智，往好了说也是在提高每次 commit 的代码质量。

### 部署

部署是最重要的一环了，这里会遇到的问题也是最复杂的，当然大部分问题其实之前都解决过了，问题大致可分为：

*   如何给单个 package 部署？
    
*   单个 package 部署时有依赖关系如何解决？
    
*   package 部署时版本如何自动计算？
    

首先来看前两个问题。

第一个问题的解决办法其实和增量构建那边做法一样，通过命令找到修改过代码的 package 就行。但是光找到需要部署的 package 还不够，我们还需要通过拓扑排序看看这个 package 有没有被别的 package 所依赖。如果被别的 package 所依赖的话，依赖方即使代码没有变动也是需要进行部署的，这就是第二个问题的解决方案。

第三个问题解决起来涉及的东西会有点多，笔者之前也给自动化部署系统写过一篇文章：链接 ，有兴趣的读者可以一读。

这里笔者就简短地聊聊解决方案。

首先我们需要引入 commitizen 这个工具。

这个工具可以帮助我们提交规范化的 commit 信息：

![](https://mmbiz.qpic.cn/mmbiz_jpg/tibUxowsg9P0xSKMrEqXnpxllMU3drysCibjdy40ltgaAXqqzgpvzWLEFUwpQreIShwGpUyzZSggPIDSrJAMdPAg/640?wx_fmt=jpeg)

上图中最重要的就是 `feat、fix` 这些信息，我们需要根据这个 type 信息来计算最终的部署版本号。

接下来在 CI 中我们需要分析这个规范化的 commit 信息来得出 type。

其实原理很简单，还是用到了 git command：

```
git log -E --format=%H=%B
```

![](https://mmbiz.qpic.cn/mmbiz_jpg/tibUxowsg9P0xSKMrEqXnpxllMU3drysCWMAwMSkLNH9icXd0m1du2IKtybwWOtDiaKd1wialnbvHdBmIbtJcwH8NQ/640?wx_fmt=jpeg)

对于以上 commit，我们可以通过执行命令得出以下结果：

![](https://mmbiz.qpic.cn/mmbiz_jpg/tibUxowsg9P0xSKMrEqXnpxllMU3drysCJNwvNOQp4xfzbWEK7ZwDZ6gLvYRR7t4b3ziaK1ZnhQOlaPCGPRVPhLw/640?wx_fmt=jpeg)

当然这样分析是把当前分支的所有 commit 都分析进去了，大部分发版时候我们只需要分析上次发版至今的所有变更，因此需要修正 command 为：

```
git log 上次的 commit id...HEAD -E --format=%H=%B
```

最后我们就可以通过正则来拿到 type，然后通过 semver 计算出版本号。

当然了，使用 lerna 也能帮我们把这些问题解决的差不多了：

```
lerna publish --conventional-commits
```

执行以上代码就基本解决了部署会遇到的问题。但是公司内部的部署系统一般都会自己去实现这部分的功能，毕竟自定义一些功能会更加方便。

总结一下部署环节中我们可能会遇到的问题：

![](https://mmbiz.qpic.cn/mmbiz_png/tibUxowsg9P0xSKMrEqXnpxllMU3drysC5dlxRCXolJr3oZoV6ruUZmShjYbJgTp8t1j4rkBSTLIdqQgIfTj8Zg/640?wx_fmt=png)kGUdyE

工具链带来的好处及坏处
-----------

从上文中读者们应该也可以发现比如 lerna 这些工具链帮助我们解决了很多问题，以至于把问题都隐藏了起来，导致了很多开发者可能都不了解使用 monorepo 到底会带来哪些问题，因为 monorepo 就是一个完美方案了。

另外这些工具链解决问题的方式也并不是完美的，使用它们以后其实又会带来一些别的问题。

比如说我们用 yarn workspaces 解决了 link 以及安装依赖的问题，但是又带来了版本间的冲突以及非法访问依赖的问题，解决这些问题我们可能又得引入新的包管理器，比如 pnpm 来解决。

总的来说，在编程世界里还真的没啥银弹，看似不错的工具，在帮助我们解决了不少问题的同时必然又会引入新的问题，选择工具无非是在看当下哪个使用起来成本更低收益更大罢了。

总结
--

mono repo 并不是银弹，使用这个架构还是会带来很多问题，无非市面上的工具帮助我们解决了大部分。文章主要聊了聊在没有这些工具的时候我们可能会遇到哪些问题，以及使用这些工具后解决了什么又带来了什么。

欢迎读者们一起交流探讨。

[![](https://mmbiz.qpic.cn/mmbiz_png/MpGQUHiaib4ib44VcWJtWJHE1rbIx4WLwG6Wicxpy9V4SCLxLHqW2SVoibogZU9FTyiaTkZgTCwQVsk1iao7Vot4yibZjQ/640?wx_fmt=png)](http://mp.weixin.qq.com/s?__biz=MzA5NzkwNDk3MQ==&mid=2650596986&idx=1&sn=3e2b70e4a516f313d3dc0a60922eb8e8&chksm=8891f65ebfe67f48fd731f105053a589e02ddf1fbfa949f5e51ac3004cb531670f1dcfffc585&scene=21#wechat_redirect)

关于奇舞精选
------

《奇舞精选》是 360 公司专业前端团队「奇舞团」运营的前端技术社区。关注公众号后，直接发送链接到后台即可给我们投稿。

奇舞团是 360 集团最大的大前端团队，代表集团参与 W3C 和 Ecma 会员（TC39）工作。奇舞团非常重视人才培养，有工程师、讲师、翻译官、业务接口人、团队 Leader 等多种发展方向供员工选择，并辅以提供相应的技术力、专业力、通用力、领导力等培训课程。奇舞团以开放和求贤的心态欢迎各种优秀人才关注和加入奇舞团。

![](https://mmbiz.qpic.cn/mmbiz_png/MpGQUHiaib4ib4qicEgQn5sg3voicN157DwoPSfbcXs2JwdT04a1LPsia81Rd0N9Ol3EoYg9LFT9h4OHxlsCeYk3Y2icA/640?wx_fmt=png)