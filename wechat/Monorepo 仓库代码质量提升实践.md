> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/_xh-VJlFAhd_PVE6-59sWA)

一、背景
====

> Monorepo 是一种项目代码管理方式，指单个仓库中管理多个项目，有助于简化代码共享、版本控制、构建和部署等方面的复杂性，并提供更好的可重用性和协作性。

Monorepo 仓库包含多个项目，可能涉及跨业务方向乃至跨部门的开发者，迭代频繁且代码量通常较大。公共代码的调用方往往涉及多个项目，修改公共代码的影响范围广，回归成本高。因此可以从以下两个角度出发，建立代码质量保障机制，将代码变更的风险拦截在开发阶段：

*   自动化测试：创建及更新 MR 时自动运行测试用例，确认代码变更对于历史功能的影响
    
*   人工 review：基于 Code Owner 机制，根据代码修改范围指定对应的代码负责人进行 review。
    

二、以 Git Submodule 的形式引入单元测试
===========================

2.1 名词解释
--------

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zibSlkt86WLibfxwPqSxtHNsNia0wSuib4oKQ3Kx5CWBibDjYJFcAA6EoDZiaQFO1pZHHU6LYFAGAeA1zSw/640?wx_fmt=png&from=appmsg)![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zibSlkt86WLibfxwPqSxtHNsNtmndFLm4eLZ6wKEhSHd2cmqyUOUYtb8dWR6TGhkJgr7CGVp9FLt62g/640?wx_fmt=png&from=appmsg)

2.2 使用 Git Submodule 引入单测的原因
----------------------------

从代码仓库维度上隔离生产环境的业务代码和开发环境的测试代码，各自独立维护。一方面避免测试代码影响生产环境，另一方面测试仓库的变更风险可控，可以采取更宽松的变更规则（如无需 review），降低测试代码的变更成本。

2.3 接入步骤
--------

### 2.3.1 初始化测试仓库

测试仓库主要用于承载测试用例、jest 配置文件。

### 2.3.2 主仓库引入测试模块

```
git submodule add xxx.git(测试仓库git地址) test(本地目录)
```

### 2.3.3 配置测试环境

1.  待测项目下安装测试依赖
    

```
npm i -D @ies/eden-test
```

2.  根据测试模块（子模块）是否放在待测项目下，有两种配置方案
    

*   方案一：子模块放在待测项目的目录下，在待测项目中运行测试命令，即可执行子模块中的测试用例
    
    ![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zibSlkt86WLibfxwPqSxtHNsNK6mnUMnQVqFPNRkQXJx1qNd11x2EiaLo4rZSTOsY2icF8TLB7pKtyauA/640?wx_fmt=png)
    

*   在待测项目中配置测试命令，将子模块中的 jest 配置文件软链到待测项目根目录下，并执行测试用例
    
    ```
    // src/infrastructure/package.json{  "scripts": {  // 首次使用需要初始化submodule  "test:init": "git submodule update --init && git submodule foreach git checkout origin/master && ln submodule/jest.config.js(子模块中jest配置文件的路径) jest.config.js && eden-test",  // 已有子模块后运行单测  "test": "ln submodule/jest.config.js(子模块中jest配置文件的路径) jest.config.js && eden-test"  }}
    ```
    

*   方案二：子模块不在待测项目的目录下，需要将子模块中的测试用例和测试配置文件软链到待测项目下，确保测试过程中找到子模块的测试用例
    
    ![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zibSlkt86WLibfxwPqSxtHNsNic3vD8xwVfeWk6byC4M6YGf0aSjKRdCBFZ3gwGRemwzF5tdkQ2O2pLg/640?wx_fmt=png)
    

*   编写测试脚本 src/infrastructure/link.sh ，把测试子模块的内容 (测试用例和 jest 配置) 递归地软链到待测项目下。
    
    > 由于 jest 支持文件软链而暂不支持目录软链，因此此处采用递归创建文件软链的方式，而非直接创建目录软链。
    
    ```
    #!/bin/bash# 递归创建软链脚本# 软链的源目录source_dir=${1:-../../test/infrastructure/src/utils}# 软链的目标目录target_dir=${2:-test/utils}# jest.config.js目录config_dir='../../test/infrastructure/jest.config.js'if [ ! -f 'jest.config.js' ]; then    ln -s $config_dir jest.config.jsfi# 遍历源目录下的所有文件和目录for file in $source_dir/*do    # 获取文件或目录名    filename=$(basename $file)    # 如果是目录，则递归调用脚本创建同名目录    if [ -d $file ]; then        mkdir -p "$target_dir/$filename"        bash $0 "$file" "$target_dir/$filename"    fi    # 如果是文件，则在目标目录下创建软链    if [ -f $file ]; then    # echo "===from===" "$PWD/$file" "===to===" "$PWD/$target_dir/$filename"        ln -s "$PWD/$file" "$PWD/$target_dir/$filename"    fidoneecho "软链创建完成！"
    ```
    
*   配置测试命令，运行创建软链的脚本并运行测试用例
    
    ```
    // package.json{    "scripts": {        // 首次使用需要初始化submodule        "test:init": "git submodule update --init && git submodule foreach git checkout origin/master && ./link.sh && eden-test",        // 已有子模块后运行单测        "test": "./link.sh && eden-test"    }}
    ```
    
*   修改子模块的 jest 配置，在运行测试用例的过程中支持抓取软链接
    
    ```
    // submodule/jest.config.jsmodule.exports = {    ...,    watchman: false,      haste: {        enableSymlinks: true,      },}
    ```
    

### 2.3.4 CI 环境自动运行

创建 CI 配置文件，定义两个执行步骤，分别为 Unit Test 和 codecov，其中 Unit Test 用于运行单测、生成测试覆盖率文件，codecov 用于定义前端页面如何显示测试覆盖率。

> **测试模块的版本管理**
> 
> *   默认的版本管理方式：
>     
>     子模块被提交到主仓库时，会记录子模块的 commit id。在下一次拉取子模块时自动切换到对应的 commit id，从而实现子模块的版本管理。因此理论上更新测试用例时，需要去主仓库更新 commit id。
>     
> *   预期效果 & 解决思路：
>     
>     为了达到主仓库无感知的效果，本方案在 CI 环境下会忽略 commit id，执行切换分支的操作。切换原则为若测试仓库存在与当前 MR 的源分支同名的分支，则使用同名分支的测试用例，否则使用测试仓库 master 的测试用例。
>     
> *   使用流程：
>     
>     在主仓库 A 分支开发时新增了公共方法（待测代码），则需要在测试仓库起一个同名的 A 分支编写对应的测试用例，提交 MR 后触发测试流水线，CI 环境下会拉取子模块并切换到 A 分支运行测试用例。在完成开发后再分别将主仓库和测试仓库的 A 分支合入 master。
>     

运行单测的核心命令

```
# 初始化子模块- git submodule update --init# 进入子模块目录下切换分支- cd test/infrastructure# 优先使用同名分支的测试用例，master的测试用例作为兜底- git checkout master- git show-branch $CI_EVENT_CHANGE_SOURCE_BRANCH &>/dev/null && git checkout $CI_EVENT_CHANGE_SOURCE_BRANCH || echo $CI_EVENT_CHANGE_SOURCE_BRANCH not exist# 回到待测项目下执行测试用例- cd ../../src/infrastructure- mkdir -p test- cp -r ../../test/infrastructure/src/utils test- npm i- npm run test
```

2.4 接入效果
--------

### 2.3.1 本地开发

主仓库和测试仓库的代码独立提交

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zibSlkt86WLibfxwPqSxtHNsNDheUJh4SvUga9DhoftTdibicvj9wO5srE89gzel1DAkKriaCaE2tnZUbw/640?wx_fmt=png&from=appmsg)

### 2.3.2 CI 环境自动运行

创建 MR 后自动运行流水线，在 MR 界面查看测试用例运行结果及覆盖率。当测试用例执行失败，或测试覆盖率不达标时，阻塞 merge 操作。

三、人工 review
===========

3.1 引入 Code Owner 机制
--------------------

### 3.1.1 为什么需要 Code Owner 机制

我们在日常开发时，通常会约定一些 review 规则，如：

*   修改公共代码时，存在一定风险，需要对应的模块负责人 review。
    
*   在代码按领域组织的场景下，修改领域层代码需要对应的领域负责人 review。
    

在落地过程中，存在的问题可能包括：**忘记自己修改了公共代码**、**不确定模块负责人从而增加沟通成本**等，因此需要从流程上规范 review 规则，对公共代码的修改进行严格把关。

为了满足更细粒度的准入控制，引入 CODE OWNERS 机制，基于 change 的代码变更添加 reviewer 并要求这些 reviewer approve 后才能合入。

### 3.1.2 接入步骤

在 CODEOWNERS 文件中定义 review 规则，每条规则包含匹配路径及 reviewer。每行一个规则，从上到下匹配，后匹配到的规则会覆盖先匹配到的规则。

```
# 每行一个规则，从上到下匹配，后匹配到的规则会覆盖先匹配到的规则# 例如:/sample_feature/ @user1 @user2*.js @user3/sample_feature/*.js @group1
```

> 路径语法同 gitignore：
> 
> *   所有空行或者以 ＃ 开头的行都会被 Git 忽略。
>     
> *   可以使用标准的 glob 模式匹配。
>     
> 
> *   星号（*）匹配零个或多个任意字符；
>     
> *   [abc] 匹配任何一个列在方括号中的字符（这个例子要么匹配一个 a，要么匹配一个 b，要么匹配一个 c）；
>     
> *   问号（?）只匹配一个任意字符；
>     
> *   如果在方括号中使用短划线分隔两个字符，表示所有在这两个字符范围内的都可以匹配（比如 [0-9] 表示匹配所有 0 到 9 的数字）。
>     
> *   使用两个星号（**）表示匹配任意中间目录，比如`a/**/z`可以匹配 a/z, a/b/z 或 a/b/c/z 等。
>     
> 
> *   匹配模式可以以（/）开头防止递归。
>     
> *   匹配模式可以以（/）结尾指定目录。
>     
> *   要忽略指定模式以外的文件或目录，可以在模式前加上惊叹号（!）取反。
>     

### 3.1.3 接入效果

创建 MR 后，在 MR 界面会查看命中的各个代码路径匹配规则、对应的 owner 及满足情况。（需要确保目标分支下已有 OWNERS 文件）

3.2 CR 通知收敛到飞书话题群
-----------------

### 3.2.1 解决的问题

*   部分 MR 命中的 owner 规则比较多，需要在群里一一 @或者私聊，存在一定的触达成本
    
*   现有的触达方案中，通知内容包含 MR 所有的状态变更（发起、approve、评论、更新、合入等），因此通知比较频繁、触达效率较低
    

### 3.2.2 解决思路

*   将发送群通知提醒 review 的能力集成到 MR 流水线中，并支持通过 MR 标题中的 WIP 标识来决定是否发送群通知。
    
*   结合飞书话题群的功能，在发送群通知时 @相关的 reviewers 及发起人，相关人员自动订阅话题，在话题下回复的消息均会以消息卡片的形式推送给相关人。可以用于在 MR 状态变更时提醒相关人员，同时将 MR 相关的讨论收敛到一个话题下，提升沟通效率。
    

四、总结
====

在代码评审阶段，根据代码修改范围邀请评审人、运行单元测试，可以在较大程度上保障代码功能符合预期，降低代码修改带来的质量风险。后续可以尝试与 AI 结合，例如集成大模型自动生成测试用例、review 代码的能力，进一步降低质量保障方案的实现成本，从而提升研发效率。

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zibSlkt86WLibfxwPqSxtHNsNvjOOjicgBAGKW8rZTfwkrswmqsuHugjtyT2RiazFw5zCz9vPmgQhyYhg/640?wx_fmt=png&from=appmsg)

加入我们
====

抖音电商前端部门物流 / 供应链管理团队主要负责支撑以抖音电商为代表的电商业务相关的物流供应链前端相关业务。我们主要负责产品有：物流管理中心、供应链管理平台、wms 平台等等。

欢迎志同道合的伙伴扫描二维码或点击左下方 “**阅读原文**” 加入我们，一起做有挑战的事！

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zibSlkt86WLibfxwPqSxtHNsNqcJm7enfxvr7lpcrNOrufGl3DZCiasWs2Mwq5F8XVh9rKJWibbrJw9rA/640?wx_fmt=png&from=appmsg)

资深前端研发工程师 - 抖音电商供应链与物流：北京 / 杭州职位开放

_https://job.toutiao.com/s/iRL7uVvQ_

点击上方关注

![](https://mmbiz.qpic.cn/mmbiz_gif/JaFvPvvA2J3MKYVlmXC32WtRJEYsPM9zbyZQtPicnOVfKibj5PuaiarJibbQgR5WWf52x1FicLIhiaweLvCoqia0TGibqg/640?wx_fmt=gif)

  

我们下期再见