> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/n_k8fBlgbKYRkwAxey5sCA)

### 

背景

在 Github 发现了一个有趣的开源项目，阅读过所有文档和 youtube 视频之后学习到了不少。

它主要有两个功能：

1.  1. 增强 Cursor 的能力，让 AI 生成约束自己的 rule 规范。
    

3.  2. 让 Cursor 来帮你把想法落地。只需要提供 idea，Cursor 就能帮你生成 prd、技术方案，按照 epic -> story -> task -> subtask 拆解任务，一步步完成。
    

核心是通过 cursor-auto-rules-agile-workflow 这个库，来将提前写好的 rule 复制到你的项目本地。

```
# Clone this repository
git clone https://github.com/bmadcode/cursor-auto-rules-agile-workflow.git
cd cursor-auto-rules-agile-workflow

# 在你自己的项目生成 rule
./apply-rules.sh /path/to/your/project
```

### 

 模式一

自动生成 rule 按照环境配置之后，你的项目里面会多出几条 rule。这几条 rule 的作用就是制定了一系列 mdc 文件规范，让你和 AI 聊天的时候可以自动帮你按照规范生成 rule。 

接下来，你只需要通过 agent 模式和 Cursor 聊天就能生成 rule。

![](https://mmbiz.qpic.cn/mmbiz_png/VgnGRVJVoHFreVnTotM7rmAr9uWIeOuUFN6LXv7tFpsg15LfelDVOINnEfe5bJPGt18pwb1Ttnq95vuY4dGIjQ/640?wx_fmt=png&from=appmsg)

![](https://mmbiz.qpic.cn/mmbiz_png/VgnGRVJVoHFreVnTotM7rmAr9uWIeOuUR6ERKu2NkBELVA4WUdhAgxzlXX3iaCyZCjXxNLQyf7T9xlpzquT819w/640?wx_fmt=png&from=appmsg)

### 

模式二：workflow

这是一种自动化工作流模式，可以让 AI 帮你管理工作流，拆解任务。 在项目里面选择开启 notepad，然后在 notepad 目录下创建新的 notepad，比如这个 notepad 叫 agile。然后将 xnotes/workflow-agile.md 文件复制到这个 notepad。

![](https://mmbiz.qpic.cn/mmbiz_png/VgnGRVJVoHFreVnTotM7rmAr9uWIeOuUT6qcSWBVpRWlmdpcZwGmtOtlFGFMHYoKFe6kiaIu2HzyB02ibJ3VqRwg/640?wx_fmt=png&from=appmsg)

这样在 Context 里面就会出现一个叫 agile 的 notepad，你在 agent 模式下也可以艾特它。 接下来，你只需要按照 project-idea-prompt.md 里面的格式来提问就好了。

![](https://mmbiz.qpic.cn/mmbiz_png/VgnGRVJVoHFreVnTotM7rmAr9uWIeOuUx3YXjDDfopHlaSfcdfbqFLXicaZzh84AOSQGtDxEKAfpzgfTiaQq8XcA/640?wx_fmt=png&from=appmsg)

AI 会先帮你创建出来 ai 目录和 prd 文件，在 prd 文件里面会有需求状态以及需求分析、解决方案等等，这是一份比较完善的文档了。 如果你想做得更加细致，可以给出更详细地的需求，让 AI 帮你输出 prd。

![](https://mmbiz.qpic.cn/mmbiz_png/VgnGRVJVoHFreVnTotM7rmAr9uWIeOuUqaplv8jWiakLm47LacI7Iia4GsL7N0mMAaqaYEFwWR3DrqEhmPO4gMvg/640?wx_fmt=png&from=appmsg)

然后 AI 会根据 prd 文档来输出一份架构设计文档，接着根据需求拆解，会创建第一个 Story 级别的任务。

![](https://mmbiz.qpic.cn/mmbiz_png/VgnGRVJVoHFreVnTotM7rmAr9uWIeOuUn04hANDwibiafeBYlt2ibI9cbROQ2IGOCnq1IoxwUiabickdrVNwj75ibV1w/640?wx_fmt=png&from=appmsg)

这样第一阶段就完成了，它创建了 PRD、ARCH、Story-1 三个文档，可以进行下一步开发任务了。

![](https://mmbiz.qpic.cn/mmbiz_png/VgnGRVJVoHFreVnTotM7rmAr9uWIeOuUkNIqOKkibYezAOceichicow0vARPian9zd2haiaM5QPNUkXKVUGENaF1sqg/640?wx_fmt=png&from=appmsg)

基础任务完成之后，它就会拆解后续任务，创建第二个 Story 文档出来，在第二个 Story 文档里面，它增加了很多功能，比如桌面消息通知、收藏等等，真是个合格的产品经理。![](https://mmbiz.qpic.cn/mmbiz_png/VgnGRVJVoHFreVnTotM7rmAr9uWIeOuUtkpEwQ2SvEtOHclLOEzjvz4vspyu7UXXKdiaoxMHibC5I1enGrXLsJgQ/640?wx_fmt=png&from=appmsg)

完成所有开发之后，我就去试用一下这个 Chrome 插件，结果遇到了报错，那就按照报错一步步提示它，让它来帮忙修改

![](https://mmbiz.qpic.cn/mmbiz_png/VgnGRVJVoHFreVnTotM7rmAr9uWIeOuUnIIwOZibkN7QrcDIaVt7SuK3hPndXSTeoN6HUuvt8ouFKW6fzScTib5g/640?wx_fmt=png&from=appmsg)

虽然界面比较简约，但这个 Chrome 插件的开发只花了半个小时左右。对于前端程序员来说，真的是致命打击。

![](https://mmbiz.qpic.cn/mmbiz_png/VgnGRVJVoHFreVnTotM7rmAr9uWIeOuUGo8fEaW4wh8nnUvhgYU06qibJ8mQjAXVAg6LWVCEl79XdE2HYC4xxGA/640?wx_fmt=png&from=appmsg)

最后，我们的 Chrome 插件就可以发布出去了。

![](https://mmbiz.qpic.cn/mmbiz_png/VgnGRVJVoHFreVnTotM7rmAr9uWIeOuUrW5LCt4PvaNicexnEordqWTHkByaDuZXVw0VvJxL52VBPP1R2zziaaAg/640?wx_fmt=png&from=appmsg)