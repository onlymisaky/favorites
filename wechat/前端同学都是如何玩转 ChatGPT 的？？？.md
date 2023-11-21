> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/ZQHk-Fjl8Q5ZLwSUTBDRxQ)

大厂技术  高级前端  精选文章

点击上方 全站前端精选，关注公众号

回复 1，加入高级前段交流群

`ChatGPT`最近一周忽然登上了国内各大平台的`热搜榜`，应该在`去年11月末`的时候就有不少同学了解并使用过，那个时候它刚刚问世，在`互联网圈子`里有了很大的热度，但是对于大众来说，还是不太了解的。

我在去年的时候就跟风注册了一波，其`回答问题的准确性`和`编码能力`让我吃惊。不得不说，ChatGPT 作为一个新兴的 AI 产品，和老美的电影里的人工智能有那么一些相像了，甩了三问一不知的小爱、小度和小 E 不止一条街。

上周它忽然就`🔥出了圈`，让很多人`惊喜`的同时，也让很多人产生了`担忧`，下面我们一起来聊聊它，以及如何使用它来让我们`生动有趣的编码生活`变得更有趣起来 (斜眼笑)。

HOT! HOT! HOT! 🔥 🔥 🔥
-----------------------

首先我们先来看下最近的热度来的有多么的突然，那简直是太`炸裂`了，语言不好描述，我收集了一些常见平台的指数截图，大家可以感受一下：

### 百度指数

![](https://mmbiz.qpic.cn/mmbiz/kzFgl6ibibNKqC8QJrXV8KxQBK9u8mbeKDmVnicxlsekficY5QKZ3SlBBibWmeh0vNPKflWicBYUln3ibq1icPazygXO2A/640?wx_fmt=jpeg)image.png

> 注意，近期的峰值可比去年 11 月底刚推出的时候高的不是一星半点。

![](https://mmbiz.qpic.cn/mmbiz/kzFgl6ibibNKqC8QJrXV8KxQBK9u8mbeKDK3VZiaoW027HrFj9xNuqjza3GoYvAgtvlLJ0T7BDCZLNISs7Mw6ib0Ig/640?wx_fmt=jpeg)image.png

### Google Trends

![](https://mmbiz.qpic.cn/mmbiz/kzFgl6ibibNKqC8QJrXV8KxQBK9u8mbeKDlQ8UEjIicqTtVb56NKic0iavqtc24jjtxztbNYVvrKzHFzINjDMFXg7Bg/640?wx_fmt=jpeg)image.png

> 注意，搜索热度最高的国家是中国，这还是在有墙的前提下，看来中国人的`忧患意识`不是一般的强

### 微博指数

![](https://mmbiz.qpic.cn/mmbiz/kzFgl6ibibNKqC8QJrXV8KxQBK9u8mbeKDR4uSMia1J1gs1pfxdD9ZJACiaZ2ozZUHl8ygHNKn9N6dkfJfKCWUN5Hw/640?wx_fmt=jpeg)image.png

ChatGPT 是什么❓
------------

在这个产品推出之前，大家应该`听说过他们公司的一些其他产品`，比如：

*   DALL·E 2：openai.com/dall-e-2/
    

> 这是一款`图像AI`，主要功能有 “根据文案绘画”、“无限拓展图像的边界”...

*   CodeX：openai.com/blog/openai…
    

> 这是一款`自然语言转化成代码`的 AI 产品，它就是之前比较火的微软的`GitHub Copilot`的驱动模型。

包括 ChatGPT 在内，他们几个都是衍生自`GPT-3`的产物，那么 GPT 到底是什么意思呢？

2018 年 6 月，OpenAI 发布了一篇关于通用语言模型的研究（openai.com/blog/langua… ），虽然全文都没有出现过 GPT 这个名词，但其实它就是 GPT-1。

这篇文章提出了一个叫作`Generative Pre-traing`的概念：`生成式预训练`。

和传统的以任务为导向的训练方法不一样，生成式预训练`不需要人工标注`，比如我们之前分享的《手把手带你实现 ” 在浏览器上进行目标检测 “ \- 掘金》，里面就有需要人工在图片上标注二维码的位置，生成数据集告诉 AI，然后 AI 再根据这些去学习；再比如说你想训练一个可以做中英文翻译的 AI，你就需要提前准备好大量的中英文对照的句子给 AI 去学习。

生成式预训练的思想就不一样了，我`直接拿着人类已有的现成的文字资料去训练 AI`，怎么训练呢？我就让 AI 根据上文去`续写下文`，比如一句话，张三每天都很认真地学习，老师们都夸他是好____，“好” 字后面我让 AI 去写，如果 AI 写出来的是 “学生”，这就和原文一样，那就判断正确了，要是不对，就继续训练它朝着对的方向去走，这种训练方式的好处，就是研究人员`不再需要花大量的资源去人工准备答案`，每句话里下一个词就是上一段话的答案，理论上人类现有的所有文字资料，都可以作为训练数据直接喂给 AI 去学习，这就`远远大于现有的任何人工制作的数据集`。

因为这个预训练过程不需要人工编写答案，所以`人类现有的所有文字信息，小说、典籍、歌词、论坛里的回帖`，甚至是软件代码，`只要硬盘装得下，都可以喂给 AI 模型去学习`，不断地增大神经网络模型的参数量，不断地增加训练数据里的文本量，预训练模型的能力就会继续增长，用标注好的数据引导它去做各类具体任务的水平也会相应提升，这种生成式预训练，与一种叫做变形器`Transformer`的模型结构相结合，就成了 `Generative Pre-trained Transformer`，取三个字母缩写，就是 `GPT`。

此后 2019 年的 `GPT-2`、2020 年的 `GPT-3`，核心迭代思路都是利用 “钞能力” 扩大模型规模，GPT-2 的参数总量是 `15` 亿，GPT-3 更是提高到了惊人的 `1750` 亿，而截至今天，这条 “钞能力” 路线依然没有摸到天花板， 还在`往下继续`。

![](https://mmbiz.qpic.cn/mmbiz/kzFgl6ibibNKqC8QJrXV8KxQBK9u8mbeKDGIicTPickU7bpmiaia4oIasoO4MntvCo1swN2WrloOyicpTCPml7ZOgTtJQ/640?wx_fmt=jpeg)image.png

> 以上文案和数据部分来自 B 站 UP 主 `@林亦LYi`：ChatGPT 诞生记：先捞钱，再谈理想｜OpenAI 翻身史 \_哔哩哔哩 \_bilibili  讲解的特别好，大家感兴趣的可以看一下！

ChatGPT 能做什么❓❓
--------------

ChatGPT 不单是聊天机器人，它还能进行撰`写邮件、视频脚本、文案、翻译、代码`等任务，我尝试使用它来进行了一些测试，下面是一些示例截图：

写邮件

![](https://mmbiz.qpic.cn/mmbiz/kzFgl6ibibNKqC8QJrXV8KxQBK9u8mbeKDFfZIkxwj9q7Zdx5ibRWS2iaa0XJr6aILIblaaianw8FxVsvLNN8UPIZnA/640?wx_fmt=jpeg)image.png

写短视频脚本

![](https://mmbiz.qpic.cn/mmbiz/kzFgl6ibibNKqC8QJrXV8KxQBK9u8mbeKDIGbf41yzkZLm2sbZBX8r7GsckJ8mSb3GwfxZ4ZicEwpopeCsY25I7KA/640?wx_fmt=jpeg)image.png

写代码

![](https://mmbiz.qpic.cn/mmbiz/kzFgl6ibibNKqC8QJrXV8KxQBK9u8mbeKDvnMreJeON79sl5rVa4LRKsqz1KjuAFLatLHqR6HA4znwJlgFyqSZicg/640?wx_fmt=jpeg)image.png![](https://mmbiz.qpic.cn/mmbiz/kzFgl6ibibNKqC8QJrXV8KxQBK9u8mbeKDbTfYia8KWvibxXxR62iakk4hR4skjC1U6CLiaN0Tic6WKk3jeicNBI0bqdIA/640?wx_fmt=jpeg)image.png

案件分析

![](https://mmbiz.qpic.cn/mmbiz/kzFgl6ibibNKqC8QJrXV8KxQBK9u8mbeKDTxj8HX47TVwuKNRnlVA66pshr5QmVR8sZibRmXJCUUU6VnwGGe32oNA/640?wx_fmt=jpeg)image.png

优化周报

![](https://mmbiz.qpic.cn/mmbiz/kzFgl6ibibNKqC8QJrXV8KxQBK9u8mbeKDBCkriamvdSkPLEMouxy7DDJ4nrPM6rNdSVrEsRRBSpzUahEAjbaQtKw/640?wx_fmt=jpeg)image.png

写小诗

![](https://mmbiz.qpic.cn/mmbiz/kzFgl6ibibNKqC8QJrXV8KxQBK9u8mbeKDjkpicXGJ6pdic7esfUj2MXV8J5UjzibLLQHLYfXN2eYQbLkn8Dxo8fKkQ/640?wx_fmt=jpeg)image.png

......

💻 ChatGPT ✖️ 前端
----------------

> 作为一名前端开发同学，我这段时间就在想，在日常生活里`我如何使用ChatGPT来帮我做些什么事情来提高开发效率呢`？最后想出了几个场景以及我的示例，大家可以参考一下：

### 一、技术调研 + 文档编写阶段

#### 1、Cover 不住的需求点应该用什么技术点来实现比较合适

> 以我最近在做的需求为例，我需要实现一个比较复杂的`树图`，类似 XMind 的那种脑图，我就问了一下它，得到的`结果还是比较令我满意的`，`即使还是有些问题存在`。

![](https://mmbiz.qpic.cn/mmbiz/kzFgl6ibibNKqC8QJrXV8KxQBK9u8mbeKDia47MNOBTyS34se4HcsoO0jlIWial8raziboEPaWqYdgBRQms0VtQYgRA/640?wx_fmt=jpeg)image.png![](https://mmbiz.qpic.cn/mmbiz/kzFgl6ibibNKqC8QJrXV8KxQBK9u8mbeKDBUGQia4OK9kzKjiaib2aFJFVBQlnm1Xbn1ekHVR0ejOJK3jvpQic6ExFDA/640?wx_fmt=jpeg)image.png![](https://mmbiz.qpic.cn/mmbiz/kzFgl6ibibNKqC8QJrXV8KxQBK9u8mbeKDYpLywdY1FmRzPAINurAgQa3pvE5S4ZnicjRh7qKibDwCficCvyUCeicAMQ/640?wx_fmt=jpeg)image.png

#### 2、不确定的技术方案（1）

![](https://mmbiz.qpic.cn/mmbiz/kzFgl6ibibNKqC8QJrXV8KxQBK9u8mbeKD3eKoP11u8uUu7d3ykIqBCmmOHKbgyMgUmXqWzIL7faurtwiceJrhYDg/640?wx_fmt=jpeg)image.png![](https://mmbiz.qpic.cn/mmbiz/kzFgl6ibibNKqC8QJrXV8KxQBK9u8mbeKD5Y0ibBibFLiabiaQQNfIkY5oUDAWbwRiaAHZdmaXWW11I5xctHwweYXxRXQ/640?wx_fmt=jpeg)image.png

#### 2、不确定的技术方案（2）

> 之前实现过一个`浏览器插件`，可以一键识别你当前屏幕中所有的二维码，并且将识别结果返回到对应的位置，我想以这个需求为例，让它帮我想想方案。之前的文章：手把手带你实现 ” 在浏览器上进行目标检测 “ \- 掘金

插件效果：![](https://mmbiz.qpic.cn/mmbiz/kzFgl6ibibNKqC8QJrXV8KxQBK9u8mbeKDTeGmaEEqh0Mo2NjN2U65FQoM8MwkZyQB2kz6sr3CN5CGwlS9Eye2dg/640?wx_fmt=jpeg)

![](https://mmbiz.qpic.cn/mmbiz/kzFgl6ibibNKqC8QJrXV8KxQBK9u8mbeKD8BDU3qEKLhherN9bEqvTTicOFmia7VUc5ekKueTq8c1iauEpJoYcX2VQg/640?wx_fmt=jpeg)image.png![](https://mmbiz.qpic.cn/mmbiz/kzFgl6ibibNKqC8QJrXV8KxQBK9u8mbeKDzIGia0Dic66YFgXFxPqPJry9PffGQicJTSbvSUKO2YMwBZp4HMPgibkD4A/640?wx_fmt=jpeg)image.png![](https://mmbiz.qpic.cn/mmbiz/kzFgl6ibibNKqC8QJrXV8KxQBK9u8mbeKDc6XQUqNvbTIhW17ibAuJIHH8ibtsOKprgS5j1ibZDcUOiasQ80LPIDkHibQ/640?wx_fmt=jpeg)image.png![](https://mmbiz.qpic.cn/mmbiz/kzFgl6ibibNKqC8QJrXV8KxQBK9u8mbeKDpEsGfldHLnhNyoYbKUwCZt3iaMWJKBib68f09CYDuvwEn26RHDBSfzAg/640?wx_fmt=jpeg)image.png![](https://mmbiz.qpic.cn/mmbiz/kzFgl6ibibNKqC8QJrXV8KxQBK9u8mbeKDvhk1eP4bI7HH7A0dwB8CKEHONrc9coWEVxyFsHT4a25DfASHrP3jfg/640?wx_fmt=jpeg)image.png![](https://mmbiz.qpic.cn/mmbiz/kzFgl6ibibNKqC8QJrXV8KxQBK9u8mbeKDSYTWJ97libu2OnMia7wAxt5OicrKxKxXolZmVd6kr8TvnIzZiaTKkfR0bA/640?wx_fmt=jpeg)image.png![](https://mmbiz.qpic.cn/mmbiz/kzFgl6ibibNKqC8QJrXV8KxQBK9u8mbeKDIaENoeD1jVCficu6eKrVvGqtEdRyKayjibcGOIr7hIXnfDAf3ODSZyEA/640?wx_fmt=jpeg)image.png![](https://mmbiz.qpic.cn/mmbiz/kzFgl6ibibNKqC8QJrXV8KxQBK9u8mbeKDXqj27FInM0Bhrsbps3ZBV4N3ATIfr3N1uOhrgjQa7con480A6bueUw/640?wx_fmt=jpeg)image.png![](https://mmbiz.qpic.cn/mmbiz/kzFgl6ibibNKqC8QJrXV8KxQBK9u8mbeKDTG7lyicS7rsJHM2EBdUTicqZovYkp7Z15fy3tIRy1q1JGXznMYAWKGCQ/640?wx_fmt=jpeg)image.png

### 二、编码阶段

#### 1、正则表达式就不需要自己去写了

![](https://mmbiz.qpic.cn/mmbiz/kzFgl6ibibNKqC8QJrXV8KxQBK9u8mbeKDQy4XpS91O9JzcVNiaGfz03bLR0f8zoQMLibNzSxYSCmicNibOHSxDuobkA/640?wx_fmt=jpeg)image.png

#### 2、代码优化（1）

![](https://mmbiz.qpic.cn/mmbiz/kzFgl6ibibNKqC8QJrXV8KxQBK9u8mbeKDD4eb7yUORow0A9pr1icnv0sfyzialqdCiaYibICVGMJmpSiaLibTAo83RPEQ/640?wx_fmt=jpeg)image.png![](https://mmbiz.qpic.cn/mmbiz/kzFgl6ibibNKqC8QJrXV8KxQBK9u8mbeKDEFMMGUdHLtvyeM6FfAeFCjPRkP4wZKc2ZkibdrQRJhQddzGSm5ho2Bw/640?wx_fmt=jpeg)image.png

#### 3、代码优化（2）

![](https://mmbiz.qpic.cn/mmbiz/kzFgl6ibibNKqC8QJrXV8KxQBK9u8mbeKDeciaoNe26l5fTnf2icH9ZIISu6TQu77Q7zotezrfa0lb4QshichPrfkGw/640?wx_fmt=jpeg)image.png

#### 4、我想实现一个 XX 功能，帮我在 github 上找一个 demo

![](https://mmbiz.qpic.cn/mmbiz/kzFgl6ibibNKqC8QJrXV8KxQBK9u8mbeKD3DWTB6iaiaEnQpREiaq19MXFBh8rJVNmt3iafoZ60ppXDbclg14icbaL5ZQ/640?wx_fmt=jpeg)image.png

### 三、自测阶段

#### 1、帮我测试一下 XX 方法

![](https://mmbiz.qpic.cn/mmbiz/kzFgl6ibibNKqC8QJrXV8KxQBK9u8mbeKD3sNenV4q0ntUsWicYLI7dnVEu7nhXpw3IWefIQDQEpYKHbaC2cdyhPw/640?wx_fmt=jpeg)image.png![](https://mmbiz.qpic.cn/mmbiz/kzFgl6ibibNKqC8QJrXV8KxQBK9u8mbeKDWvFjWjD4R5J4tYHFlAZEordLBLfZVqTH9rw0rG9wQVdt3FPtBoM7Ww/640?wx_fmt=jpeg)image.png

#### 2、运行不及预期，帮我看看有什么问题

![](https://mmbiz.qpic.cn/mmbiz/kzFgl6ibibNKqC8QJrXV8KxQBK9u8mbeKDSkiaiberrYiasCdnYicELCDo1ibu4VQiajt0EBMwE5y6mmZRcGXIZH3bW9Hg/640?wx_fmt=jpeg)image.png![](https://mmbiz.qpic.cn/mmbiz/kzFgl6ibibNKqC8QJrXV8KxQBK9u8mbeKDibu56mohbic6jfaPQebgFb3qY5ibFqYVPg3QVoMQV2GXDaL9icBiasU6icBA/640?wx_fmt=jpeg)image.png

### 四、读源码

![](https://mmbiz.qpic.cn/mmbiz/kzFgl6ibibNKqC8QJrXV8KxQBK9u8mbeKDjEGiaf6HqN6DV3TXRt2u7Qt6DccwcEmy7OzJxvYIzprxia93bTc0Rovw/640?wx_fmt=jpeg)image.png![](https://mmbiz.qpic.cn/mmbiz/kzFgl6ibibNKqC8QJrXV8KxQBK9u8mbeKDYdAT0SU1sicjtFDxpW9hsFzUCmqsxuJlQbNicmvIIGtmKZaGOMCkXXYQ/640?wx_fmt=jpeg)

> `Σ(⊙▽⊙"a 下面的这些回答把我惊艳到了！它是真的懂这些代码！而且还能帮我找类似的代码！！！`

![](https://mmbiz.qpic.cn/mmbiz/kzFgl6ibibNKqC8QJrXV8KxQBK9u8mbeKDp9TWbpibs8p9OB7PGlk5jyrntys5IOLEvLsDB8jMibXhlvjLbIbd0PFw/640?wx_fmt=jpeg)![](https://mmbiz.qpic.cn/mmbiz/kzFgl6ibibNKqC8QJrXV8KxQBK9u8mbeKDiaA0OuLnzCb8ticsHvjA2pWN04cs412anVaxZECvsBb1dzOl7awyaNOA/640?wx_fmt=jpeg)![](https://mmbiz.qpic.cn/mmbiz/kzFgl6ibibNKqC8QJrXV8KxQBK9u8mbeKD18vibbjpyssVRlMTDTAtjnLXmKQVrQicvS6Dr1Ar3KOS26OgPOQwhBwA/640?wx_fmt=jpeg)

### 五、不错的 VsCode 插件

1、ChatGPT 中文版

![](https://mmbiz.qpic.cn/mmbiz/kzFgl6ibibNKqC8QJrXV8KxQBK9u8mbeKDJ1h4ibUhxcLaq4Byy8vKNGMMplgdhQia6IpusD94Y0ncI401nkXiakSnA/640?wx_fmt=jpeg)

（`不太推荐`，当使用之后，就无法使用`上下文`的方式和 ChatGPT 交流了，不过因为是中文版，可以装上玩玩）

2、ChatGPT 👍

![](https://mmbiz.qpic.cn/mmbiz/kzFgl6ibibNKqC8QJrXV8KxQBK9u8mbeKDyPZxkGhaDHJAwQtFcJVTiaC6YLrjQQglbicrK0bgdENnZUtRVu7ibTdNA/640?wx_fmt=jpeg)

`推荐!`，简单使用下来比较顺畅，该有的快捷功能也都有，最重要的是聊天时是`支持上下文`的。

![](https://mmbiz.qpic.cn/mmbiz/kzFgl6ibibNKqC8QJrXV8KxQBK9u8mbeKDuLS23PIiayWBrvTMupkFzZfPP14iadicIgHViaeeBN0t1jXgcJoZibACUYg/640?wx_fmt=jpeg)

使用展示图：

![](https://mmbiz.qpic.cn/mmbiz/kzFgl6ibibNKqC8QJrXV8KxQBK9u8mbeKDW3XECnQG2UKLccuoIPxAmIstAic0Dhto916mEdOibKia66iakOu0UajapQ/640?wx_fmt=jpeg)

🙋🏻 指令的美学
----------

`如何和ChatGPT这一类的AI沟通`，他们叫做 “`指令`”，好的指令和坏的指令得到的效果是非常不一样的，如果经常使用一些宽泛的生活用语和它交流，那么得到的结果往往不尽人意，甚至和手机里的语音助手没太大的区别。

我们先看一个`不太好`的例子：

![](https://mmbiz.qpic.cn/mmbiz/kzFgl6ibibNKqC8QJrXV8KxQBK9u8mbeKDfichMaUx0yzibLtrmekF1EthM94r6IalBZlsx1XLEuMgKUgMsDuDNomQ/640?wx_fmt=jpeg)

我们可以看到，它的回答和网上搜索出来的结果没什么两样，当看到这种结果之后，很多人就会觉得：“啊，它不过如此，对我帮助不大”，可是当我们`换一种方式`来问它，结果可能让你惊艳到，我们`重新问`：

![](https://mmbiz.qpic.cn/mmbiz/kzFgl6ibibNKqC8QJrXV8KxQBK9u8mbeKD4HtyiaIh8HZKqyXYUTs0KKLGflzuOUnYrsjU3gBk9C2SbhMpKNXHQTQ/640?wx_fmt=jpeg)![](https://mmbiz.qpic.cn/mmbiz/kzFgl6ibibNKqC8QJrXV8KxQBK9u8mbeKDUhNfK6giaT77MFGZaKMCdm1HUozqBcEMztNLdKicoekicTTCXwUic5NcNA/640?wx_fmt=jpeg)![](https://mmbiz.qpic.cn/mmbiz/kzFgl6ibibNKqC8QJrXV8KxQBK9u8mbeKDVyo9mdyT1oqibQmkJpVDCFF6yAjtnm7lguxib3RXIWJMJSnMD4IvhTIw/640?wx_fmt=jpeg)

可以看到，当我们向它发送一些`比较专业`一些的指令的时候，得到的`结果往往也是更专业的`，同样，这种结果也是`更有参考意义`，也是我们更想要的结果。

在发送指令前，希望你的指令最好满足以下几点：

*   `内容清晰`（省去不必要的文字，每个字尽可能都有用）
    
*   `任务定义明确`（帮我制作表格，我要你提供事物的重量和数量）
    
*   `要求具体`（比如我要一个清单、我要计算我的 TDEE、我要去超市你帮我准备 xxx）
    
*   `具有迭代思维`（一句话可能问不出来你想要的结果，你可以持续性的和它聊，基于一个或者几个点深入一下）
    

> 以上参考：抖音 @绝对社，对于如何使用更精确的指令讲解的特别好！推荐大家去看~

🔫 杀死那个 ChatGPT？
----------------

#### 1、For 教育

> 在美国，有很大比例的学生拿 ChatGPT 写作业、写论文、考试，而且 ChatGPT 给出的答卷往往成绩都很棒~

在一项由宾夕法尼亚大学沃顿商学院 Christian Terwiesch 教授进行的研究显示：`ChatGPT能够通过沃顿MBA课程的期末考试`。这位宾大教授 1 月 17 日发表的名为《ChatGPT 能否获得 MBA 学位》的论文中称：经过实际测试，其考试得分`介于B-和B`之间。

该教授指出，ChatGPT“在`解决基本运营管理和流程分析问题方面，包括基于案例研究的问题方面`都表现出色”。机器人给出的解释也非常优秀，它还 “`非常擅长根据人类提示修改其答案`”。

鉴于这一系列情况，`斯坦福大学终于坐不住了`。他们的研究人员已经开发了一种名为`DetectGPT`的工具。这工具可以帮助教师识别使用 ChatGPT 或其他类似的大型语言模型 (LLM) 生成的内容。（`魔法才能打败魔法😎`）

号称 “干翻媒体人” 的 ChatGPT，已被多家出版机构“封杀”

多家期刊、出版机构禁止将 ChatGPT 列为论文合著者

ChatGPT 遭美国多市学校封杀

#### 2、For 程序员

> 它面进 Google 了！你怕不怕！它的工资可能比你还高哈哈哈！

18 万美元 offer！ChatGPT 通过谷歌 L3 入职测试，人类码农危？

ChatGPT 通过谷歌 L3 工程师入职测试，年薪 18 万美元

ChatGPT 版必应搜索悄悄上线又下线，但评测已经出炉

#### 3、For 其他岗位

> 从这周的搜索数据趋势来看，很多人还是怕了的，`“它究竟会不会代替我！”`

瑟瑟发抖？基于 ChatGPT 的 AI 律师太过强大 被人类律师疯狂阻挠

放心 ChatGPT 们不会完全取代会计, 也不会完全取代审计, 理由如下 \_会计审计第一门户 - 中国会计视野

ChatGPT 来编辑部上班了，这篇推送它写的

🔚 结束语
------

如上，ChatGPT 像一个💣一样引爆了全网的讨论热潮，`但是这个热潮终将会慢慢褪去`，在兴奋的向他人疯狂安利它之余，我也看到了很多人的`思考`，综合一些我自己的思考，总结了以下几点：

*   它的出现真的会让很多人`失业`吗？
    
*   它的出现无疑是划时代的，当前时间节点还正处在 “新” 时代的前期，我应该怎样接受它的存在并且高效且合理的使用它来`为我服务`？
    
*   未来 AI 遍地的时候，究竟还需要什么样的人才？中国式教育下出来的高材生在那个时代还有什么`竞争力`？
    
*   这应该是一波`风口`，新的风口下，会出现什么新的岗位，未来的社会又会发生什么样的变化？
    
*   未来互联网上发言的 AI 是不是会`超过真实的用户`？如果出现一些谁声音大谁就有理的公共议题讨论会怎么办？
    

当然，以上的一些想法会比较`偏保守`一些，后期肯定也会有更多的法律或者条款来限制 AI 的野蛮生长，前段时间`马斯克`也讲到 “`人工智能比核弹更可怕，要成立AI监管机构`”。

不过作为一个`普通用户`来看，目前的 ChatGPT 还是一个`值得一试`的产品，它真的可以为我们提升蛮多的效率。

目前大家使用的 ChatGPT 是从 GPT3.5 衍生出来的 AI 产品，其训练集并不是互联网上实时的数据，而是来自`截止到2021年的数据`。

![](https://mmbiz.qpic.cn/mmbiz/kzFgl6ibibNKqC8QJrXV8KxQBK9u8mbeKDpgFYjo2qh8MMrKticlOHajicOQ8RzhiaDqbMhPMU2Dd9BG7BicXLgQt0ew/640?wx_fmt=jpeg)

它还处于一个`婴儿阶段`，还有很多不成熟的地方，据 OpenAI 统计，从 2012 年到 2020 年，人工智能模型训练消耗的算力增长了 30 万倍，平均`每3.4个月翻一番`，超过了摩尔定律的每 18 个月翻番的增速😱。

畅想一下未来~ 我们可以和钢铁侠一样，拥有一个知晓所有事物的 Jarvis，你在工作、生活中的时候来上那么一句：帮我看看这段代码有没有什么漏洞、帮我想一下 xx 功能怎么实现、我想做一个 xxx，帮我画个图纸，图纸画好之后，交给 3D 打印机，打印好之后告诉我...

而且这个未来，应该很近。

作者：木头就是我呀 

原文链接：https://juejin.cn/post/7199607659992907832

```
前端 社群








下方加 Nealyang 好友回复「 加群」即可。







如果你觉得这篇内容对你有帮助，我想请你帮我2个小忙：


1. 点个「在看」，让更多人也能看到这篇文章
```