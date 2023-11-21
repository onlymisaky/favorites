> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/jvZWWtpsWP7gt9eL7OkSPg)

大厂技术  坚持周更  精选好文
================

前言
==

最近接手的业务需求由于历史原因，项目部署在阿里云服务器上，所以没有使用公司内部的流水线进行集成和部署。其中流水线使用到了 GitLab 自带的 CI 工具进行集成，所以正好借此机会给大家分享一下 GitLab CI/CD，教大家如何打造一条项目的流水线。

CI/CD 的背景
=========

正式介绍之前我们先简单过一下 CI/CD 的背景

CI/CD 是什么
---------

> https://www.redhat.com/zh/topics/devops/what-is-CI-CD

CI (Continuous Integration)

即持续集成，它是指频繁地（一天多次）将代码集成到主干，目的就为了让产品保证质量的同时快速迭代；通常它需要通过自动化测试，从而保证集成的代码的稳定性；

CD (Continuous Delivery/Deployment)

即持续交付 / 部署，可以看作持续集成的下一步，它指的是频繁地将软件的新版本，交付给质量团队 or 用户测试。如果测试通过，代码就可以部署到生产环境中。

为什么需要 CI/CD？
------------

过去，一个团队的开发人员可能会孤立地工作很长一段时间，只有在他们的工作完成后，才会将他们的更改合并到主分支中。这使得合并代码更改变得困难而耗时，而且还会导致错误积累很长时间而得不到纠正。这些因素导致更加难以迅速向客户交付更新。

而有了 CI/CD，我们可以获得以下收益：

1.  解放了重复性劳动。自动化部署工作可以解放集成、测试、部署等重复性劳动，而机器集成的频率明显比手工高很多。
    

2.  更快地修复问题。持续集成更早的获取变更，更早的进入测试，更早的发现问题，解决问题的成本显著下降。
    

3.  更快的交付成果。更早发现错误减少解决错误所需的工作量。集成服务器在构建环节发现错误可以及时通知开发人员修复。集成服务器在部署环节发现错误可以回退到上一版本，服务器始终有一个可用的版本。
    

4.  减少手工的错误。在重复性动作上，人容易犯错，而机器犯错的几率几乎为零。
    

5.  减少了等待时间。缩短了从开发、集成、测试、部署各个环节的时间，从而也就缩短了中间可以出现的等待时机。持续集成，意味着开发、集成、测试、部署也得以持续。
    
6.  更高的产品质量。集成服务器往往提供代码质量检测等功能，对不规范或有错误的地方会进行标志，也可以设置邮件和短信等进行警告。
    

GitLab CI/CD
============

GitLab-CI 是 GitLab 提供的 CI 工具。它可以通过指定通过如 push/merge 代码、打 tag 等行为触发 CI 流程；同时也可以指定不同场景要触发的不同的构建脚本（脚本可以看作是流水线中的一个操作步骤 or 单个任务）

![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIrL3IFdgRCAias5BQt9BMbcDsduBZvmZicdUmus2Csu2rNqibn1RYZT1GnaAWsjsws6MJEkPSPg8mmTg/640?wx_fmt=png)

具体的使用方式是在项目根目录中配置一个 .gitlab-ci.yml 文件来启动其功能；我们先了解一下这个 .gitlab-ci.yml 文件

配置文件介绍
------

gitlab-ci.yml 用的是 YAML 语法 [1] ，我们可以把它理解类似 json 的格式，只不过语法方面有一些不同。比如：

```
 tabitha:
    name: Tabitha Bitumen
    job: Developer
     skills:
      - lisp
      - fortran
      - erlang
```

对应到 json：

```
{
     tabitha : {
         name :  Tabitha Bitumen ,
         job :  Developer ,
         skills ： [ lisp ,  fortran ,  erlang ],
    }
}
```

即：缩进对应的是 json 对象中的 key，`-` 对应的是数组中的一项，还是比较好理解的~

正式介绍 .gitlab-ci.yml 配置文件之前，我们要提一下 GitLab CI 中的几个相关概念  

### Job

Job[2] 可以理解为 CI 流程中的单个任务。

job 是一个顶级元素（相当于 yml 配置的一个根元素），它可以起任意的名称、并且不限数量，但必须至少包含 script 子句，用于指定当前任务要执行的脚本，如：

```
job1:  script:  execute-script-for-job1 job2:  stage: build  script:    - scripts/build.sh  only:    - master# job n...
```

### Stages

Stages 用来定义一次 CI 有哪几个阶段，如下

```
stages:  - build  - test  - deploy
```

同时每个 stage 又可以与若干个 job 关联，即一个阶段可以并行执行多个 job；如下，在每个 job 中使用`stage`关键字关联到对应 stage 即可：

```
stages:  - build  - test  - deploy  build_job:  stage: build  script:    - scripts/build.shtest_job:  stage: test  script:    - scripts/test.shdeploy_job:  stage: deploy  script:    - scripts/deploy.sh
```

### Pipeline

Pipeline[3] 是持续集成、交付和部署的顶级组件，它可以理解为是流水线的一次完整的任务流程；

Pipeline 可以包含若干 Stage，而每个 Stage 又可以指定执行若干 job，这样我们就可以把整个构建的流程串起来了。如下，我们就可以在 GitLab 的 pipeline 中看到这些 Stages，及其对应的 job：

![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIrL3IFdgRCAias5BQt9BMbcDIojG9xjJmK3ZS9rYC49jfwAjSZrMHu3Bz7k41eZakLotfFsc4XMzrg/640?wx_fmt=png)

如果 Pipeline 中的一个任务成功，将进入其下一个 Stage 的 Job；反之如果中途失败，则默认会中断流水线的执行。

### 常用配置

接下来重点介绍一下 .gitlab-ci.yml 配置 [4] 的常用关键字：

#### stage

上述有提到过，用 `stage` 可以定义 job 在哪个阶段运行：

```
stages:  - build  - test  - deploy
```

#### script

用于指定运行器要执行的脚本命令，可以指定多条

```
job:  script:       - echo  start job!       - scripts/deploy.sh
```

#### before_script & after_script

用于定义应在 job 在执行脚本之前 / 后时要执行的内容：

```
job:  before_script:    - echo  Execute this command before the `script` section completes.   script:    - echo  An example script section.   after_script:    - echo  Execute this command after the `script` section completes.
```

#### allow_failure

用于配置当前 job 失败时 pipeline 是否应继续运行：

```
job2:  stage: test  script:    - execute_script_2  allow_failure: true # or false (default)
```

#### cache

指定缓存的文件列表，用户在不同的 job 之间共享；

`cache:key`：可以给每个缓存一个唯一的标识键，如果未设置，则默认键为`default`；

`cache:paths`：指定要缓存的文件或目录

```
rspec:  script:    - echo  This job uses a cache.   cache:    key: binaries-cache    paths:      - binaries/*.apk      - .config
```

#### only / except

only 用于定义何时执行 job，反之 except 用于定义何时**不**执行 job；

它们有四个关键字可以一起配合使用：

*   ref：匹配 分支名称 或 分支名匹配的的正则；
    

*   variables：变量表达式；
    

*   changes：对应路径的文件是否修改；
    

```
job1:  script: echo  only: # or except    - main # ref可省略    ref:      - tags      - /^feat-.*$/      - merge_requests    variables:      - $RELEASE ==  staging       - $STAGING    changes:      - Dockerfile      - docker/scripts/*      - dockerfiles/**/*      - more_scripts/*.{rb,py,sh}      -  **/*.json
```

#### retry

设置在 job 执行失败时候重试次数：

```
job:  script: rspec  retry:    max: 2    when: # 搭配when关键字，在下列情况下重试      - runner_system_failure      - stuck_or_timeout_failure
```

#### variables

可用于定义执行过程中的一些变量

```
variables:  DEPLOY_SITE:  https://example.com/ deploy_job:  stage: deploy  script:    - deploy-script --url $DEPLOY_SITE --path  / deploy_review_job:  stage: deploy  variables:    REVIEW_PATH:  /review   script:    - deploy-review-script --url $DEPLOY_SITE --path $REVIEW_PATH
```

#### when

用于配置 job 运行的条件：

*   `on_success`（默认）：仅在之前 stage 的所有 job 都成功或配置了`allow_failure: true`；
    

*   `manual`：仅在手动触发时运行 job；
    

*   `always`：无论之前 stage 的 job 状态如何，都运行；
    

*   `on_failure`：仅当至少一个之前 stage 的 job 失败时才运行；
    

*   `delayed`：延迟执行 job；
    

*   `never`: 永不执行 job；
    

```
cleanup_build_job:
  stage: cleanup_build
  script:
    - cleanup build when failed
  when: on_failure
```

#### tags

选择特定 tag 的 GitLab-runner 来执行

```
job:
  tags:
    - ruby
    - postgres
```

GitLab-runner 安装 & 注册
---------------------

配置好我们的 yml 文件之后，还需要配置 GitLab-runner，用于执行对应的脚本。

安装 [5]：

```
# 下载# Replace ${arch} with any of the supported architectures, e.g. amd64, arm, arm64# A full list of architectures can be found here https://GitLab-runner-downloads.s3.amazonaws.com/latest/index.htmlcurl -LJO  https://GitLab-runner-downloads.s3.amazonaws.com/latest/rpm/GitLab-runner_${arch}.rpm # 安装rpm -i GitLab-runner_<arch>.rpm
```

注册 [6]：

> 注册时需要的 URL & token 可以在 GitLab -> Settings -> CI/CD -> Runners 中获取

```
sudo GitLab-runner register# Enter the GitLab instance URL (for example, https://GitLab.com/):${url}# Enter the registration token:${token}# Enter a description for the runner:${description}# Enter tags for the runner (comma-separated):${tags}# Registering runner... succeeded # Enter an executor: shell, virtualbox, docker+machine, docker-ssh+machine, docker, docker-ssh, parallels, custom, ssh, kubernetes:${executor}# Runner registered successfully. Feel free to start it, but if it's running already the config should be automatically reloaded!
```

打造一条流水线
=======

预览 Pipeline
-----------

当有了以上的准备，我们配置好 .gitlab-ci.yml 文件、写好对应的脚本，同时配置好 GitLab-runner 后，就可以开启并体验 CI 流水线了。当提交代码后（当然也可以按上述的 only 关键字设置为打 tag、提 mr 时触发），就可以触发 GitLab CI 的 Pipeline，并执行对应的 stages 及其 jobs 啦 🎉

如下图，我们可以在 GitLab -> CI/CD -> Pipeline 中看到：

![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIrL3IFdgRCAias5BQt9BMbcDgiaA18vQ5j3NtI56MDpeBSpJHpdv4dzFlpHRQzsUUA6LqIvtNNOcmiaQ/640?wx_fmt=png)

配置一条流水线
-------

规划实现如下：

*   代码编译：提供一个 build.sh 脚本，用于编译代码；
    

*   自动化测试：scripts 关键字执行测试的指令，从而运行事先编写好的自动化测试脚本；
    

*   人工卡点：利用上述提到的`when:manual`人工触发，配合`allow_failure: false`，即可达到卡点效果；
    

*   项目部署：也是利用一个脚本，将我们之前的构建产物发送到目标机器、目录下进行部署；同时使用`only:master`指定只有在提交到 master 分支才执行该步骤的 job。
    

综合以上，我们可以得到以下大致的 .gitlab-ci.yml 配置 (job 对应的 script 可根据实际情况和需要编写)：

```
stages:  - scm  - test  - manual-point  - deployscm:  stage: scm  script:    - scripts/build.shtest:  stage: test  script:    - scripts/test.shmanual-point:  stage: manual-point  script:    - echo  I am manual job   only:    - master  when: manual  allow_failure: falsedeploy:  stage: deploy  script:    - scripts/deploy.sh  only:    - master
```

触发 pipeline 后，我们可以看到，经过了 scm 编译、test 自动化测试的步骤后，到了 Manual-point 卡点，此时流水线已经锁定执行，需要人工手动点击确认才可以继续执行；

![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIrL3IFdgRCAias5BQt9BMbcDyUKxhGXgzRC28DUVTkH6pJialo0XATXfOUdhYJB26Itkib3RtRprpicicg/640?wx_fmt=png)

当点击执行 job 后

![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIrL3IFdgRCAias5BQt9BMbcD9uGC3YhkWZq8HpCjML1QwtjBheL0OrIG120RxkujE1TAlTxmCTR9Ow/640?wx_fmt=png)

定时任务
----

有些场景我们想定时地执行 Pipeline，而不是通过事件触发，可以在 GitLab -> Setting -> Schedule 进行设置

![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIrL3IFdgRCAias5BQt9BMbcDGomXv0LeN5REAyzyiaPOEMnVFpnJScKURN3QfYx9eZzJNNU4kIu2Gzg/640?wx_fmt=png)

> 间隔的设置采用的是 cron 语法 [7]，它是 Unix 和类 Unix 系统中设置定时任务的语法；
> 
> 它使用 5 个占位符分别代表 分钟、小时、月份的日期、月份、周几；如下：
> 
> ```
> # ┌─────────── minute (0 - 59)# │ ┌─────────── hour (0 - 23)# │ │ ┌─────────── day of the month (1 - 31)# │ │ │ ┌─────────── month (1 - 12)# │ │ │ │ ┌─────────── day of the week (0 - 6) (Sunday to Saturday;# │ │ │ │ │                                 7 is also Sunday on some systems)# │ │ │ │ │# │ │ │ │ │# * *  *  *  * <command to execute># 例子：* * * * * # 每分钟执行30 10 * * * # 每天10:3030 10 * * SAT,SUN # 每周六、周天10:300 8 1-20 * * # 每个月的1-20号的8点
> ```

设置好后即可看到定时任务列表：

![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIrL3IFdgRCAias5BQt9BMbcDLaEfgicg94vvyvjevFzgsm6wUKEN5slicSicpAl6hJCWic1omiajITQY8ZQ/640?wx_fmt=png)

### 参考资料

[1]

YAML 语法: _https://docs.ansible.com/ansible/latest/reference_appendices/YAMLSyntax.html_

[2]

Job: _https://docs.gitlab.com/ee/ci/jobs/_

[3]

Pipeline: _https://docs.gitlab.com/ee/ci/pipelines/_

[4]

.gitlab-ci.yml 配置: _https://docs.gitlab.com/ee/ci/yaml/_

[5]

安装: _https://docs.gitlab.com/runner/install/linux-manually.html_

[6]

注册: _https://docs.gitlab.com/runner/register/index.html#linux_

[7]

cron 语法: _https://en.wikipedia.org/wiki/Cron_

❤️ 谢谢支持  

----------

以上便是本次分享的全部内容，希望对你有所帮助 ^_^

喜欢的话别忘了 **分享、点赞、收藏** 三连哦~。

欢迎关注公众号 **ELab 团队** 收获大厂一手好文章~

> 我们来自字节跳动，是旗下大力教育前端部门，负责字节跳动教育全线产品前端开发工作。
> 
> 我们围绕产品品质提升、开发效率、创意与前沿技术等方向沉淀与传播专业知识及案例，为业界贡献经验价值。包括但不限于性能监控、组件库、多端技术、Serverless、可视化搭建、音视频、人工智能、产品设计与营销等内容。

字节跳动校 / 社招内推码: YWF3ZXH 

投递链接: https://jobs.toutiao.com/s/NRArN4k