> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/gkkJTnAZVu81EK8H5DAjQw)

之前的文章稍微有点问题，调整重发一下 ～

大家好，我是 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf&scene=21#wechat_redirect)。

**智能总结：** 这篇文章深入探讨了如何通过微调技术来优化大语言模型（如 `DeepSeek`）的表现，使其在特定领域或任务中更具优势。文章首先解释了微调的必要性及其在特定领域中的应用场景，并将微调与长文本处理、知识库的使用进行对比，帮助读者理解何时选择微调。接着，文章详细介绍了微调的基本流程，包括选择预训练模型、准备数据集、设置超参数等。通过硅基流动平台，读者可以体验在线微调的流程。最后，文章提供了一个使用 `Colab` 和 `Unsloth` 工具进行本地微调的实战指南，展示了如何从头到尾微调一个算命大师模型，并将其部署到本地环境中使用。

学习要点：

*   理解微调的概念及其在特定任务中的重要性。
    
*   掌握微调与长文本处理、知识库的区别和应用场景。
    
*   熟悉微调的基本流程，包括选择预训练模型、准备数据集和设置超参数。
    
*   了解如何使用 `Colab` 和 `Unsloth` 工具进行本地微调。
    
*   学会将微调后的模型上传到 `Hugging Face` 并在本地通过 `Ollama` 运行。
    

前几天发了一篇本地部署大模型的教程文章：《[如何拥有一个无限制、可联网、带本地知识库的私人 DeepSeek？](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247502512&idx=1&sn=b389a8484d176573422c69adc936c504&token=1894055887&lang=zh_CN&scene=21#wechat_redirect)》深受大家喜爱。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdTYVEslk3Pn0s5yD86p0sEWmoDvAdvmVXGXJ77A9ac5Ln02MVerro3eSWYB3fh4Xbia8EZGfktdsGA/640?wx_fmt=png&from=appmsg)

同时我也收到了很多小伙伴的反馈，表示本地部署 + 知识库并不能很好的满足一些需求场景，另外我还看到很多同学对于大模型的理解还存在一些误解，以为本地模型 + 知识库就是在 “训练 “ 自己的模型。为了解答大家的问题，今天我们一起来聊聊大模型的进阶使用：“模型微调” ，也就是较大家真正的 “调教 “ 出一个能够满足特定需求场景、更贴合个人使用习惯的个性化模型。

最近 “大模型算命” 很火，我们今天的例子就以 “算命” 为主题，教大家微调出一个更专业的 “算命大师” 模型。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdTYVEslk3Pn0s5yD86p0sEWZ5bcRzGQPPrKKhXt7sFko8vIqHaVfYwpM6FznWe57hP1MghaKxooSA/640?wx_fmt=png&from=appmsg)

我们先看看微调前后的效果对比：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdTYVEslk3Pn0s5yD86p0sEWzDria1GWWRW6dyviaEJts9R3ibfEOCZFibeuGP73HmynoxblqYSJ2L2ynQ/640?wx_fmt=png&from=appmsg)![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdTYVEslk3Pn0s5yD86p0sEWfCsuPD0XQDb2ApywFvgrwPUT38JEwK8PSQGqIC50DPTwJ54YjLfM2w/640?wx_fmt=png&from=appmsg)

> 相信很多同学看到 “微调” 这个概念就有点想劝退了，觉得这已经属于比较深度的技术了，但我想告诉大家，其实微调并不会有大家想象中那么复杂，尤其是在 DeepSeek 热潮开始后，AI 开源社区和工具已经越来越成熟和发达，即使是非专业的技术爱好者，也能做到轻松上手。

在开始这篇文章之前，建议大家先阅读：《[如何拥有一个无限制、可联网、带本地知识库的私人 DeepSeek？](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247502512&idx=1&sn=b389a8484d176573422c69adc936c504&token=1894055887&lang=zh_CN&scene=21#wechat_redirect)》，其中介绍的一些专业术语，在本文中不再特殊说明。

为什么需要微调？
--------

在开始学习微调之前，大家首先还是要搞清楚为什么要微调？在什么情况下需要微调？

我们平常接触到的大模型如 GPT、DeepSeek 等都是基于海量的通用数据训练而成的，它们具备非常强大的语言理解和生成能力，能够处理多种自然语言任务。但是，这些模型在某些特定领域或任务上的表现可能并不理想，或者说还能够做到表现的更好。下面是需要微调的几个主要原因：

*   **让模型更懂 “专业话”**：通用模型就像一个 “万事通”，它学过很多东西，但对一些特别专业的领域（比如医学、法律、金融）可能不会特别精通。通过微调，我们可以给模型 “补课”，让它学会这些专业领域的知识，从而在这些领域表现得更好。
    
*   **让模型适应不同的 “工作”**：不同的任务对模型的要求不一样。比如，有些任务需要模型判断一段文字是好是坏（比如评论是正面还是负面），这就需要模型输出一个明确的答案；而有些任务需要模型写一篇文章或者回答问题，这就需要模型生成流畅、连贯的文字。微调可以让模型根据任务的需求调整自己的能力，更好地完成这些 “工作”。
    
*   **让模型表现得更 “平衡”**：通用模型在很多通用任务上表现不错，但在一些特定任务上可能会 “失衡”。比如，它可能会对某些问题过于敏感，或者对某些问题反应不够。通过微调，我们可以调整模型的 “参数”，就像调整汽车的引擎一样，让它在特定任务上表现得更 “平衡”。
    
*   **保护数据的隐私和安全**：有时候，我们的数据可能包含一些敏感信息，比如公司的机密文件或者个人隐私。这些数据不能随便上传到云端，否则可能会泄露。微调允许我们在自己的电脑或服务器上训练模型，这样数据就一直掌握在自己手里，不用担心泄露。
    
*   **节省时间和成本**：如果从头开始训练一个模型，就像从零开始盖一座房子，需要很多时间和资源。而微调就像是在现成的房子里进行装修，只需要调整一下细节，就可以让它更适合自己的需求。这样不仅节省时间和成本，而且微调后的模型在特定任务上表现更好，用起来也更高效。
    

下面是几个可能需要用到微调的需求场景：

*   **定制模型的风格和语气**：训练一个文案生成模型，让它以一种幽默、轻松的风格撰写广告文案。
    
*   **让模型的回答更靠谱**：训练一个医学问答模型，让它根据症状给出准确的医疗建议。
    
*   **让模型理解复杂的指令**：用户输入复杂的提示（如生辰八字、面相、手相等），模型需要根据这些提示给出符合算命逻辑的回答。
    
*   **让模型处理特殊情况**：训练一个法律咨询模型，让它处理一些特殊的边缘情况，如 “未成年人的合同效力”。
    
*   **让模型学会新技能**：训练一个心理咨询模型，让它学会一种新技能——情绪疏导。
    

长文本 & 知识库 & 微调的区别
-----------------

现在各大模型都支持超长上下文，从最开始的 `4K` 到现在的 `200K`，我们不能用一个比较完善的提示词来解决这些问题吗？

现在各种知识库工具这么灵活，我们不能自己搭建一个非常全面的数据库来解决这些问题吗？

这可能会是很多小伙伴存在的疑问，下面我们就来看看长文本、知识库、微调究竟有什么区别，我们又该在什么场景下做什么样的选择呢？

为了方便大家理解，我们后面把模型回答一个问题类比为参加一场考试。

### 长文本

通俗理解：你参加了一场考试，题目是一篇超长的阅读理解。这篇文章内容很多，可能有几千字，你需要在读完后回答一些问题。这就像是 “长文本” 的任务。模型需要处理很长的文本内容，理解其中的细节和逻辑，然后给出准确的答案。比如，模型要读完一篇长篇小说，然后回答关于小说情节的问题。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdTYVEslk3Pn0s5yD86p0sEWbCcfLB9pWJjwZm6A2YicSsrl29h5KgOss3libZKjL4t3jCk9gSgDsIEA/640?wx_fmt=png&from=appmsg)

优点：

*   连贯性强：能够生成或理解长篇幅的内容，保持逻辑和语义的连贯性。
    
*   适合复杂任务：适合处理需要深入理解背景信息的任务，比如长篇阅读理解或复杂的文章生成。
    

缺点：

*   资源消耗大：处理长文本需要更多的计算资源和内存，因为模型需要同时处理大量信息。
    
*   上下文限制：即使是强大的模型，也可能因为上下文长度限制而丢失一些细节信息。
    

适用场景：

*   写作助手：生成长篇博客、报告或故事。
    
*   阅读理解：处理长篇阅读理解任务，比如学术论文或小说。
    
*   对话系统：在需要长篇回答的场景中，比如解释复杂的概念。
    

### 知识库

通俗理解：你参加的是一场开卷考试，你可以带一本厚厚的资料书进去。考试的时候，你可以随时翻阅这本资料书，找到你需要的信息来回答问题。这就像是 “知识库” 的作用。知识库就像是一个巨大的资料库，模型可以在里面查找信息，然后结合这些信息来回答问题。比如，你问模型：“爱因斯坦的相对论是什么？”模型可以去知识库中查找相关内容，然后给出详细的解释。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdTYVEslk3Pn0s5yD86p0sEWiaub5elcJYJKWVxWmyYVZ8DFE0JVKR0fZlTnrsGxcmLBN29nUasM0BQ/640?wx_fmt=png&from=appmsg)

优点：

*   灵活性高：可以随时更新知识库中的内容，让模型获取最新的信息。
    
*   扩展性强：不需要重新训练模型，只需要更新知识库，就能让模型回答新的问题。
    

缺点：

*   依赖检索：如果知识库中的信息不准确或不完整，模型的回答也会受影响。
    
*   实时性要求高：需要快速检索和整合知识库中的信息，对性能有一定要求。
    

适用场景：

*   智能客服：快速查找解决方案，回答用户的问题。
    
*   问答系统：结合知识库回答复杂的、需要背景知识的问题。
    
*   研究辅助：帮助研究人员快速查找相关文献或数据。
    

### 微调

通俗理解：你在考试之前参加了一个课外辅导班，专门学习了考试相关的知识和技巧。这个辅导班帮你复习了重点内容，还教你如何更好地答题。这就像是 “微调”。微调是让模型提前学习一些特定的知识，比如某个领域的专业术语或者特定任务的技巧，这样它在考试（也就是实际任务）中就能表现得更好。比如，你让模型学习了医学知识，那么它在回答医学相关的问题时就能更准确。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdTYVEslk3Pn0s5yD86p0sEWv3Zr2BicXQtQibDeogRVlpz5tvglNSozPg6IlGudibJYA3dHS3iavBZb7g/640?wx_fmt=png&from=appmsg)

优点：

*   性能提升：显著提升模型在特定任务或领域的表现。
    
*   定制化强：可以根据需求调整模型的行为，比如改变回答风格或优化任务性能。
    

缺点：

*   需要标注数据：需要准备特定领域的标注数据，这可能需要时间和精力。
    
*   硬件要求高：微调需要一定的计算资源，尤其是 GPU。
    

适用场景：

*   专业领域：如医疗、法律、金融等，让模型理解专业术语和逻辑。
    
*   特定任务：如文本分类、情感分析等，优化模型的性能。
    
*   风格定制：让模型生成符合某种风格的内容，比如幽默、正式或古风。
    

### 对比

<table><thead><tr><th>对比维度</th><th>长文本处理</th><th>知识库</th><th>微调</th></tr></thead><tbody><tr><td>核心目标</td><td>理解和生成长篇内容</td><td>提供背景知识，增强回答能力</td><td>优化模型在特定任务或领域的表现</td></tr><tr><td>优点</td><td>连贯性强，适合复杂任务</td><td>灵活性高，可随时更新</td><td>性能提升，定制化强</td></tr><tr><td>缺点</td><td>资源消耗大，上下文限制</td><td>依赖检索，实时性要求高</td><td>需要标注数据，硬件要求高</td></tr><tr><td>适用场景</td><td>写作助手、阅读理解</td><td>智能客服、问答系统</td><td>专业领域、特定任务、风格定制</td></tr><tr><td>额外数据</td><td>不需要，但可能需要优化上下文长度</td><td>需要知识库数据</td><td>需要特定领域的标注数据</td></tr><tr><td>重新训练</td><td>不需要，但可能需要优化模型</td><td>不需要，只需更新知识库</td><td>需要对模型进行进一步训练</td></tr><tr><td>技术实现</td><td>扩大上下文窗口</td><td>检索 + 生成（RAG）</td><td>调整模型参数</td></tr><tr><td>数据依赖</td><td>无需额外数据</td><td>依赖结构化知识库</td><td>需要大量标注数据</td></tr><tr><td>实时性</td><td>静态（依赖输入内容）</td><td>动态（知识库可随时更新）</td><td>静态（训练后固定）</td></tr><tr><td>资源消耗</td><td>高（长文本计算成本高）</td><td>中（需维护检索系统）</td><td>高（训练算力需求大）</td></tr><tr><td>灵活性</td><td>中（适合单次长内容分析）</td><td>高（可扩展多知识库）</td><td>低（需重新训练适应变化）</td></tr></tbody></table>

微调的基本流程
-------

以下是一个常见的模型微调的过程：

*   选定一款用于微调的预训练模型，并加载
    
*   准备好用于模型微调的数据集，并加载
    
*   准备一些问题，对微调前的模型进行测试（用于后续对比）
    
*   设定模型微调需要的超参数
    
*   执行模型微调训练
    
*   还使用上面的问题，对微调后的模型进行测试，并对比效果
    
*   如果效果不满意，继续调整前面的数据集以及各种超参数，直到达到满意效果
    
*   得到微调好的模型
    

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdTYVEslk3Pn0s5yD86p0sEWHVaw7C7rAqlPiaicRdb09ibojJbZ5aXibc3I83MvPRDfY8lCXJ4cGJV6yA/640?wx_fmt=png&from=appmsg)

在这个流程里，有几个基本概念需要大家提前了解，我们还用上面考试的例子举例，微调模型的过程就像是给一个已经很聪明的学生 “补课”，让他在某个特定领域变得更擅长。

### 概念 1：预训练模型

预训练模型就是我们选择用来微调的基础模型，就像是一个已经受过基础教育的学生，具备了基本的阅读、写作和理解能力。这些模型（如 `GPT、DeepSeek` 等）已经在大量的通用数据上进行了训练，能够处理多种语言任务。选择一个合适的预训练模型是微调的第一步。![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdTYVEslk3Pn0s5yD86p0sEWux5Qa8PK4lKAwDhcENuj0juhCtic8Hyw9E83vwHGafAAcZtmZkXGU6w/640?wx_fmt=png&from=appmsg)

一般来说，为了成本和运行效率考虑，我们都会选择一些开源的小参数模型来进行微调，比如 `Mate` 的 `llama`、阿里的 `qwen`，以及最近爆火的 `DeepSeek`（蒸馏版）

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdTYVEslk3Pn0s5yD86p0sEW77zzSAxQPvjv0dwcyu0AaeKpkwneXFyCTHicQmJs6FVdgnOIwoJ2JBQ/640?wx_fmt=png&from=appmsg)

### 概念 2：数据集

数据集就是我们用于模型微调的数据，就像是 “补课” 时用的教材，它包含了特定领域的知识和任务要求。这些数据需要经过标注和整理，以便模型能够学习到特定领域的模式和规律。比如，如果我们想让模型学会算命，就需要准备一些标注好的命理学知识作为数据集。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdTYVEslk3Pn0s5yD86p0sEWm7Pk4L1A8YEYvSlcsR5Gpr64JWKQewlGgoAKRmGLxSljIu7V2COa6w/640?wx_fmt=png&from=appmsg)

一般情况下，用于模型训练的数据集是没有对格式强要求的，比如常见的结构化数据格式：JSON、CSV、XML 都是支持的。

数据集中的数据格式也没有强要求，一般和我们日常与 AI 的对话类似，都会包括输入、输出，比如下面就是一个最简单的数据集：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdTYVEslk3Pn0s5yD86p0sEWKKoepHHwJdAxOlL7GW6YCBPibG3hCpNKTXnLXibt2p0ooqgoibxM8pbhA/640?wx_fmt=png&from=appmsg)

为了模型的训练效果，有时候我们也会为数据集添加更丰富的上下文，比如在下面的数据集中，以消息（messages）进行组织，增加了 System（系统消息，类似于角色设定），user（用户消息）、assistant（助手回复消息）的定义，这样就可以支持存放多轮对话的数据，这也是 OPEN AI 官方推荐的数据集格式：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdTYVEslk3Pn0s5yD86p0sEWywb6Qh9F7I2NmL0R3rKXwjqkTaD0W8YdtNr0FIMKnfhA8ibV2l0XMWQ/640?wx_fmt=png&from=appmsg)

大家练习或测试的话可以去网上找一些公开数据集，这里推荐两个可以获取公开数据集的网站：

第一个：`Hugging Face`（🪜），我们可以把 Hugging Face 平台比作 AI 领域的 `GitHub`，它为开发者提供了一个集中化的平台，用于分享、获取和使用预训练模型和数据集。就像 `GitHub` 是代码共享和协作的中心一样，`Hugging Face` 是 `AI` 模型和数据共享的中心。在后面的实战环节中我们还会用到它：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/e5Dzv8p9XdTYVEslk3Pn0s5yD86p0sEWDxoagGiaYiakLELGGd2jR7o4N44chic3dmxDXWWKaH3YNKZQmwa1XE4Ug/640?wx_fmt=jpeg&from=appmsg)https://huggingface.co/datasets

如果你没有🪜，也可以退而求其次，选择国内的一些类似社区，比如 GitCode 的 AI 社区：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/e5Dzv8p9XdTYVEslk3Pn0s5yD86p0sEWdEyhtkwQa5tmAfckbMiaPb2zgMA6D0Pvmtibpn9Cub0hLn6j9sNK03nQ/640?wx_fmt=jpeg&from=appmsg)https://ai.gitcode.com/datasets

### 概念 3：超参数

超参数就像是你在给模型 “补课” 之前制定的教学计划和策略。它们决定了你如何教学、教学的强度以及教学的方向。如果你选择的教学计划不合适（比如补课时间太短、讲解速度太快或复习策略不合理），可能会导致学生学习效果不好。同样，如果你选择的超参数不合适，模型的性能也可能不理想。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdTYVEslk3Pn0s5yD86p0sEWZh8Piaic1PqmKxDjyicsmtIB1WMNKUeooSCaicIXoRbGn74TzhqV45ewJQ/640?wx_fmt=png&from=appmsg)

一些关键的超参数的含义，我们将在后面的实战中继续讲解。

初识：通过平台微调大模型
------------

目前市面上很多 AI 相关平台都提供了在线微调模型的能力，比如我们以最近比较火的硅基流动为例：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdTYVEslk3Pn0s5yD86p0sEWtq96faSice9zfmibUFAS1u9d9KD8ibHBe1CiahTpNibzZiadQVWR0RG89ylg/640?wx_fmt=png&from=appmsg)https://docs.siliconflow.cn/cn/userguide/guides/fine-tune

我们进入硅基流动后台的第二项功能就是模型微调：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdTYVEslk3Pn0s5yD86p0sEWT4eSPvAyR9icf6AJzxuDaeCxUJE2dOibJaXWBv0oI1xaHbdgrveffHWg/640?wx_fmt=png&from=appmsg)https://cloud.siliconflow.cn/fine-tune

### 选择预训练模型

我们尝试新建一个微调任务，可以看到目前硅基流动支持微调的模型还不是很多，而且也没看到 DeepSeek 相关模型，这里我们选择 `Qwen2.5-7B` 来测试一下：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdTYVEslk3Pn0s5yD86p0sEWqPGSEsEPeR3HSeBZEjvSSiczxFhmztcic7UL1HX61cdiac3ge5OjmWDBw/640?wx_fmt=png&from=appmsg)选择预训练模型

### 准备数据集

下一步就是选择数据集：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdTYVEslk3Pn0s5yD86p0sEW4rVsJgp5FnKq8tR4ic3wvuqQPib3Ho6CMXcrlj5yUdxmCW7KKQqoC2vg/640?wx_fmt=png&from=appmsg)上传数据集

我们目前硅基流动仅支持 .jsonl 格式的数据集：

`JSONL` 文件（JSON Lines）是一种特殊的 JSON 格式，每一行是一个独立的 JSON 对象，JSONL 文件是 “扁平化” 的，彼此之间没有嵌套关系。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdTYVEslk3Pn0s5yD86p0sEWk8PSr9EjiaYUz2hKYmn8q5JySFs8Uud7vSBiaYAk34nliagf35Y0bXkdA/640?wx_fmt=png&from=appmsg)

且需符合以下要求：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdTYVEslk3Pn0s5yD86p0sEWlFNKxaOCsRdN9sl5XA1ia3o50QpSk0G4V8Aib3mVXcFpic7K9p01Dqd4w/640?wx_fmt=png&from=appmsg)jsonl 格式说明

看着挺复杂的，其实和我们上面介绍的 `OPEN AI` 官方推荐的数据集格式要求是一样的：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdTYVEslk3Pn0s5yD86p0sEWywb6Qh9F7I2NmL0R3rKXwjqkTaD0W8YdtNr0FIMKnfhA8ibV2l0XMWQ/640?wx_fmt=png&from=appmsg)

对应 jsonl 的数据就是这样：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/e5Dzv8p9XdTYVEslk3Pn0s5yD86p0sEWe8y54FYcicLm3HeG2MwBfqhYguFiatV4LF1KsfsKVTficOcOQibiaDUKwMg/640?wx_fmt=jpeg&from=appmsg)

### 验证数据集

数据集上传完成后，下一步就是输入一个微调后模型的名字，以及设置验证数据集。

首先我们想要微调一个算命大师模型，那我们就以 fortunetelling 来命名：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdTYVEslk3Pn0s5yD86p0sEW7DWxNTBicfGM2438TTnlMiacKhk3lImxyYmhBoCoGoRVldBgTiconwDdw/640?wx_fmt=png&from=appmsg)

然后就是验证数据集：

**验证数据集** 就是从我们的整体数据中划分出来的一部分数据。它通常占总数据的一小部分（比如 10%~20%）。这部分数据在训练过程中不会被用来直接训练模型，而是用来评估模型在未见过的数据上的表现。

简单来说，验证数据集就像是一个 “模拟考试”，用来检查模型是否真正学会了知识，而不是只是“背诵” 了训练数据。

这里我们选择默认的 `10%` 即可。

### 超参数设置

最后就是设置一些模型训练的 “超参数” 了，给出可以设置的参数非常多，我们这里只介绍最关键的三个参数：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdTYVEslk3Pn0s5yD86p0sEW6tZ2CoXJGO0C4uAOGTIahNvdppy9PTV3ojpfoZeiczeGNianbDoiawu4w/640?wx_fmt=png&from=appmsg)

为了方便理解，我们还以考试前复习的例子来进行讲解，假设你正在准备一场重要的考试，你有一本厚厚的复习资料书，里面有 1000 道题目。你需要通过复习这些题目来掌握考试内容。

**训练轮数（Number of Epochs）** Epoch 是机器学习中用于描述模型训练过程的一个术语，指的是模型完整地遍历一次整个训练数据集的次数。换句话说，一个 `Epoch` 表示模型已经看到了所有训练样本一次。

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/e5Dzv8p9XdTYVEslk3Pn0s5yD86p0sEW05ehUQfRDGtvadE7nOfEqUhKeD9wgic08wRic07bUgroBbia6lotqKNBA/640?wx_fmt=gif&from=appmsg)

通俗来说，训练轮数就是我们从头到尾复习这本书的次数。

*   轮数少：比如你只复习一遍，可能对书里的内容还不是很熟悉，考试成绩可能不会太理想。
    
*   轮数多：比如你复习了 10 遍，对书里的内容就很熟悉了，但可能会出现一个问题——你对书里的内容背得很熟，但遇到新的、类似的问题就不会解答了，简单讲就是 “学傻了 “，只记住这本书里的内容了，稍微变一变就不会了（**过拟合**）。
    

**学习率（Learning Rate）** 决定了模型在每次更新时参数调整的幅度，通常在 (0, 1) 之间。也就是告诉模型在训练过程中 “学习” 的速度有多快。学习率越大，模型每次调整的幅度就越大；学习率越小，调整的幅度就越小。

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/e5Dzv8p9XdTYVEslk3Pn0s5yD86p0sEWRHrrrJqQIWyLVRFyiaVnVicmx9fTTSS6UgsrLe7CGz8ViaPqW8ANRGhLA/640?wx_fmt=gif&from=appmsg)

通俗来说，学习率可以用来控制复习的 “深度”，确保不会因为调整幅度过大而走偏，也不会因为调整幅度过小而进步太慢。如果你每次复习完一道题后，你会根据答案和解析调整自己的理解和方法。

*   学习率大（比如 0.1）：每次做完一道题后，你会对解题方法进行很大的调整。比如，你可能会完全改变解题思路。优点是进步可能很快，因为你每次都在进行较大的调整。缺点就是可能会因为调整幅度过大而 “走偏”，比如突然改变了一个已经掌握得很好的方法，导致之前学的东西都忘了。
    
*   学习率小（比如 0.0001）：每次做完一道题后，你只对解题方法进行非常细微的调整。比如，你发现某个步骤有点小错误，就只调整那个小错误。优点是非常稳定，不会因为一次错误而 “走偏”，适合需要精细调整的场景。缺点就是进步会很慢，因为你每次只调整一点点。
    

**批量大小（Batch Size）** 是指在模型训练过程中，每次更新模型参数时所使用的样本数量。它是训练数据被分割成的小块，模型每次处理一个小块的数据来更新参数。

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/e5Dzv8p9XdTYVEslk3Pn0s5yD86p0sEWvkTiaBQZic7iccw3fwKuALa2TtvJzZXkVc1Fv6kkDBHR0HAl4YhB5vl8Q/640?wx_fmt=gif&from=appmsg)

通俗来说，批量大小可以用来平衡复习速度和专注度，确保既能快速推进复习进度，又能专注细节。假设你决定每次复习时集中精力做一定数量的题目，而不是一次只做一道题。

*   批量大（比如 100）：每次复习时，你集中精力做 100 道题。优点是复习速度很快，因为你每次处理很多题目，能快速了解整体情况。缺点是可能会因为一次处理太多题目而感到压力过大，甚至错过一些细节。
    
*   批量小（比如 1）：每次复习时，你只做一道题，做完后再做下一道。优点是可以非常专注，能仔细分析每道题的细节，适合需要深入理解的场景。缺点就是复习速度很慢，因为每次只处理一道题。
    

在实际的微调场景中，我们需要通过一次次的调整这些参数，最后验证对比模型效果，来产出效果最好的微调模型。当然，如果你是小白用户，这些参数简单理解就行了，刚开始不需要调整这些参数，默认推荐的一般可以满足大部分场景的需求。

### 微调后调用

微调完成后，我们可以得到一个微调后模型的标识符：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/e5Dzv8p9XdTYVEslk3Pn0s5yD86p0sEWMRjC1AmVHibwWjYes9FrjJr9GXqHqmAa1Vo2s98ibCFEZjB4G8rFgn8g/640?wx_fmt=jpeg&from=appmsg)

后续我们可以通过接口（/chat/completions）即可直接调用微调后的模型：

```
from openai import OpenAIclient = OpenAI(    api_key="您的 APIKEY", # 从https://cloud.siliconflow.cn/account/ak获取    base_url="https://api.siliconflow.cn/v1")messages = [    {"role": "user", "content": "用当前语言解释微调模型流程"},]response = client.chat.completions.create(    model="您的微调模型名",    messages=messages,    stream=True,    max_tokens=4096)for chunk in response:    print(chunk.choices[0].delta.content, end='')
```

我们现在已经了解了模型微调需要的大部分基础概念，也通过硅基流动平台走完了一个完整的微调流程，但是在这个过程中我们发现有几个问题：

*   可以选择的基础模型太少了，没有我们想要的 DeepSeek 相关模型
    
*   模型训练过程中的 Token 消耗是要自己花钱的，对于有海量数据集的任务可能消耗比较大
    
*   微调任务触发不太可控，作者在测试的时候创建的微调任务，等了一天还没有被触发，当然这可能是硅基流动最近调用量太大，资源不足的问题，换成其他平台（比如 OPEN AI Platfrom）可能好一点，但是总归这个任务还是不太可控的。
    

为了解决这个问题，最终我们还是要使用代码来微调，这样我们就能灵活选择各种开源模型，无需担心训练过程中的 Token 损耗，灵活的控制微调任务了。

当然，看到这里，不会写代码的同学也不要放弃，因为前面大部分的概念我们已经了解过了，下面我会尽可能的让大家在不懂代码的情况下也能完整运行这个过程。

进阶：要了解的工具
---------

在开始实战之前，我们先了解后续模型微调过程中需要用到的两个核心工具 `Colab` 和 `unsloth`。

### Colab

`Colab` 是一个基于云端的编程环境，由 Google 提供。它的主要功能和优势包括：

*   免费的 GPU 资源：Colab 提供免费的 GPU，适合进行模型微调。虽然免费资源有一定时间限制，但对于大多数微调任务来说已经足够。
    
*   易于上手：Colab 提供了一个基于网页的 Jupyter Notebook 环境，用户无需安装任何软件，直接在浏览器中操作。
    
*   丰富的社区支持：Colab 上有许多现成的代码示例和教程，可以帮助新手快速入门。
    

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdTYVEslk3Pn0s5yD86p0sEWJRjCJTxVMpE4uS5l5SGZCkt6kn7Agic8qibALOakwFGIhqVGfQJ2daVA/640?wx_fmt=png&from=appmsg)

简单来说，有了 `Colab` ，可以让你没有在比较好的硬件资源的情况下，能够在线上微调模型，如果只是学习的话，免费的资源就够了。另外，市面上很多模型微调的 DEMO ，都是通过  `Colab` 给出的，大家可以非常方便的直接进行调试运行。

### unsloth

`Unsloth` 是一个开源工具，专门用来加速大语言模型（LLMs）的微调过程。它的主要功能和优势包括：

*   高效微调：Unsloth 的微调速度比传统方法快 2-5 倍，内存占用减少 50%-80%。这意味着你可以用更少的资源完成微调任务。
    
*   低显存需求：即使是消费级 GPU（如 RTX 3090），也能轻松运行 Unsloth。例如，仅需 7GB 显存就可以训练 1.5B 参数的模型。
    
*   支持多种模型和量化：Unsloth 支持 Llama、Mistral、Phi、Gemma 等主流模型，并且通过动态 4-bit 量化技术，显著降低显存占用，同时几乎不损失模型精度。
    
*   开源与免费：Unsloth 提供免费的 Colab Notebook，用户只需添加数据集并运行代码即可完成微调。
    

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdTYVEslk3Pn0s5yD86p0sEWv9icxxbvzKzAIUBsQeFMC77WC7R6ZTUYCtS61AzP4OsOr3UPayUNQ1A/640?wx_fmt=png&from=appmsg)

简单来说，`Unsloth` 采用了某些优化技术，可以帮助我们在比较低级的硬件设备资源下更高效的微调模型。在 `Unsloth` 出现之前，模型微调的成本非常高，普通人根本就别想了，微调一次模型至少需要几万元，几天的时间才能完成。

我们看到 `Unsloth` 官方提供了很多通过 `Colab` 提供的各种模型的微调案例，我们可以很方便的在 `Colab` 上直接运行这些案例：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdTYVEslk3Pn0s5yD86p0sEWSYYZIXt7Cy3IrFeic0FRdppWHicsmrLtmIGg36rWibkiafaI183GgPFFCg/640?wx_fmt=png&from=appmsg)

但是在官方的示例中，我们没有找到 DeepSeek R1 模型的微调案例，不过我找到了官方的一段介绍：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdTYVEslk3Pn0s5yD86p0sEWpxTVmI5XOdk8m4weR0sFAicGuH2dD4Wic6NNBdiaGR5k6cibQ3uWK1tuIg/640?wx_fmt=png&from=appmsg)

我们可以直接在现有案例中，直接将模型名称进行替换，就可以运行 `DeepSeek R1` 推理模型的微调，不过在实际运行中，我发现还需要调整数据集的格式以及一些参数，这个我们后面具体讲解。

下面我们就用一个实际的例子（微调算命大师模型）来带大家走一遍这个过程，大家只需要跟随我把每个步骤里的代码复制到自己的 `Colab` 里运行即可，期间大家只需要自己调整一些关键的部分，例如数据集和测试问题等等。

实战：使用 unsloth 微调算命大师模型
----------------------

在开始前我们再回顾下前面我们总结的微调的基本流程，在下面的案例中流程基本也是一样的：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdTYVEslk3Pn0s5yD86p0sEWHVaw7C7rAqlPiaicRdb09ibojJbZ5aXibc3I83MvPRDfY8lCXJ4cGJV6yA/640?wx_fmt=png&from=appmsg)

### 第一步：创建环境、安装依赖

这里推荐大家创建一个自己的空白 `Colab` 环境来一步步将我的代码贴进去执行。

大家可以访问这个链接（需要🪜）：

https://colab.research.google.com/#create=true

然后我们更改一下运行时类型（在 Colab 中用于执行代码的计算资源类型，其决定了你的代码运行时会使用哪种硬件支持）。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdTYVEslk3Pn0s5yD86p0sEWGXO4VjYmp0Q70ZfzOEH9E9INDibcialHzjzRCB3oL7d1zEibJibdzgEJuQ/640?wx_fmt=png&from=appmsg)

将运行时类型改为 T4 GPU（`NVIDIA` 推出的一款高性能 GPU，特别适合深度学习任务）：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdTYVEslk3Pn0s5yD86p0sEWA1LqQ9RSC0chEqa50P1ns6SPvyrGEY4baBeEgfuTicMNBqODA0MPMlw/640?wx_fmt=png&from=appmsg)

然后我们执行第一段最简单的代码，主要功能是安装一些 Python 包和库，这些库是运行 AI 模型微调任务所必需的工具。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdTYVEslk3Pn0s5yD86p0sEWNCOsXbyzTlVh3icq5v06Llticgo1xficiaSm91TzTkbatWUy8nQkPG0L7w/640?wx_fmt=png&from=appmsg)

### 第二步：加载预训练模型

下一步就是要加载一个预训练模型，可以看到这里的参数是 `model_name`，然后我们选择的是 `DeepSeek-R1-Distill-Llama-8B`（基于 Llama 的 DeepSeek-R1 蒸馏版本，80 亿参数），如果大家想更换成其他的模型，直接改这个参数即可，比如可以改成：`unsloth/DeepSeek-R1-Distill-Qwen-7`，然后运行代码我们可以看到模型的拉取日志：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdTYVEslk3Pn0s5yD86p0sEWITaCH5ibswCacd9armMdQ0iamaXCr6fvaCqbspPrIemWa3W2iaW3fTibAA/640?wx_fmt=png&from=appmsg)

> 选择了解：4bit 量化（4bit Quantization）：一种技术，通过减少模型的精度来节省内存，就像把一个大箱子压缩成一个小箱子，方便携带。

### 第三步：微调前测试

在开始微调之前，我们先用一个算命相关的问题来测试一下，方便我们在训练完后进行对比。

首先我们定义问题（这里大家可以自行更改，比如你想要训练一个医学相关大模型，那这里就改成看病相关的问题）：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdTYVEslk3Pn0s5yD86p0sEWhGvKkh958uUu7X2KscUOyN3zXZ3keJSMKZVD9fVkthYSFxbwn0ImCA/640?wx_fmt=png&from=appmsg)

然后我们调用模型进行推理，并打印出推理结果（这里完全不需要大家改，照搬就行）：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdTYVEslk3Pn0s5yD86p0sEW1lGLYDlvYoGHaF4AJh3I7J1j9kgYnVdw3FYYckQuIZh9I2dibQcd3xw/640?wx_fmt=png&from=appmsg)

微调前输出的结果：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdTYVEslk3Pn0s5yD86p0sEWELKyQZpKcDHoOc7IFnZj9f4bGo4ZafK2JOD9zm4SfpibVbI2dMUdLGw/640?wx_fmt=png&from=appmsg)

可以看到，现在模型给的结果比较简单，也没有 “大师” 的语气风格。

### 第四步：加载数据集

首先我们把这个数据集预期要训练出来的模型风格定义出来（这里大家也可以自行更改，比如你想要训练一个医学相关大模型，那这里就改成专业医生相关的描述）：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdTYVEslk3Pn0s5yD86p0sEWv0e8GqDfmibmWXeF4r8TiaQphaRErV84MnfOlExicL2Alx3aicFRk5ibNKQ/640?wx_fmt=png&from=appmsg)

下面我们要准备一个用于微调的数据集，大家可以去前面提到的 `HuggingFace` 上搜索符合自己需求的数据集，命理相关的数据集比较少，这里我自己生成了一些，然后上传到 `HuggingFace` 了，大家有需要的可以自取：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdTYVEslk3Pn0s5yD86p0sEWWCY8EibqXBVG25VoobhQiateOT4ibOCQYuao69CQIQTjEtD1N9KrqrReQ/640?wx_fmt=png&from=appmsg)https://huggingface.co/datasets/Conard/fortune-telling/viewer/default/train

需要注意的是，这里字段格式和前面提到的格式略有区别，除了包含基本的问题（Question）、回答（Response），还包含了模型的思考过程（Complex_CoT），因为我们现在要训练的是一个推理模型，所以数据集中最好也要包含模型的思考过程，这样训练出来的推理模型效果更好。

下面我们看看加载数据集的代码，我们把数据集加载进来，然后打印出数据集包含的字段名：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdTYVEslk3Pn0s5yD86p0sEWtftN6KibC183zbB5hSVb2iaiaVRwd7GriceCgZN8SE7vG7IZx7qKaxb5JA/640?wx_fmt=png&from=appmsg)

这里重点关注 `load_dataset` 函数的几个参数，数据集的名称（默认会从 HuggingFace 拉取），数据集的语言以及取数据集的哪部分数据用作训练。

然后我们对数据集进行一些格式化，再打印一条出来看看：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdTYVEslk3Pn0s5yD86p0sEWys1iclSjrdfmJ4DyWwX3lcWvYic2jfGnGdzVWcCiaM4H4jEBd9bQXmqAw/640?wx_fmt=png&from=appmsg)

目前所有准备工作已经完成，下一步就是开始微调训练。

### 第六步：执行微调

在这一步，我们需要设置各种关键参数，我们把关键代码分为三段：

第一段（模型微调准备）：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdTYVEslk3Pn0s5yD86p0sEWZ7noh1G4zewWBCxEakKicIeB7Bf2PROISRJrxFLWic5m9micMCRALicTAg/640?wx_fmt=png&from=appmsg)

这段代码是通过 LoRA 技术对预训练模型进行了微调准备，使其能够在特定任务上进行高效的训练，同时保留预训练模型的大部分知识。LoRA 我们在这篇文章中不做深度讲解，大家先了解即可，参数也先不用改。

第二段（配置微调参数）：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdTYVEslk3Pn0s5yD86p0sEWYXjfctugXibf58gibNheuQQRqqJgGgXMAjgLjZcIK7D9ia5WV50dl3cNg/640?wx_fmt=png&from=appmsg)

在这段代码中，包括一大堆参数，不需要大家都理解，我们只需要关注上面我们已经介绍过的三个参数：

*   学习率（Learning Rate）：通过 `TrainingArguments` 中的 `learning_rate` 参数设置的，这里的值为 `2e-4`（即 0.0002）。
    
*   批量大小（Batch Size）：由两个参数共同决定（实际的批量大小：`per_device_train_batch_size * gradient_accumulation_steps`，也就是 `2 * 4 = 8`）：
    

*   `per_device_train_batch_size`：每个设备（如 GPU）上的批量大小。
    
*   `gradient_accumulation_steps`：梯度累积步数，用于模拟更大的批量大小。
    

*   训练轮数（Epochs）：通过 `max_steps`(最大训练步数) 和数据集大小计算得出，在这段代码中，最大训练 70 步，每一步训练 8 个，数据集大小为 200，那训练论数就是 `70 * 8 / 200 = 3`
    

我们来看最后一段代码（执行训练）：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdTYVEslk3Pn0s5yD86p0sEW8Zvmv8aTbP5VchSYxJ9rkXFzh9m7TAXhMyILcqxdLS3b47HBvdmS3A/640?wx_fmt=png&from=appmsg)

这段代码非常简单，就一行，我们执行后可以看到一些关键参数，比如训练轮数、批量大小等，也可以看到每一步训练的进度。

### 第七步：微调后测试

微调训练完成后，我们测试运行一下，还使用和之前一模一样的问题：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdTYVEslk3Pn0s5yD86p0sEWZbqAHLAib2dBcjaBAgvyu0oe5LVGDkMNxXudvk2W6roiat3yGLdH7Hibw/640?wx_fmt=png&from=appmsg)

回答效果：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdTYVEslk3Pn0s5yD86p0sEWwL6A4d73o8oiaOYfD94pgyyjtEHw4IsmHTUEu6cTcOzBccJm1rsbhmA/640?wx_fmt=png&from=appmsg)

可以发现，回答效果专业了很多，说明本次训练是有效果的。

实战：本地运行微调后的算命大师模型
-----------------

现在，我们已经在 Colab 上完成了完整的模型微调训练过程，下一步就是使用我们微调后的模型了，在之前的文章中我们学习了如何使用 `Ollama` 运行 `Ollama` 平台上的开源模型，其实 `Ollama` 也是可以支持直接从 `Hugging Face` 上拉取并运行模型了，所以我们可以把刚刚训练好的模型上传到 `Hugging Face` 上。

> 如果大家还没读过本地部署这篇文章，建议先阅读一下：《[如何拥有一个无限制、可联网、带本地知识库的私人 DeepSeek？](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247502512&idx=1&sn=b389a8484d176573422c69adc936c504&token=1894055887&lang=zh_CN&scene=21#wechat_redirect)》

### 第八步：将微调后的模型保存为 GGUF 格式

将微调后的模型上传到 `Hugging Face Hub` 之前，我们先将它转换为 GGUF 格式。

`GGUF` 是一种高效的格式，它支持多种量化方法（如 4 位、8 位、16 位量化），可以显著减小模型文件的大小，便于存储和传输，适合在资源受限的设备上运行模型，例如在 Ollama 上部署时。量化后的模型在资源受限的设备上运行更快，适合边缘设备或低功耗场景。

转换的代码大家不用做任何更改：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdTYVEslk3Pn0s5yD86p0sEWTh8iczXQSPjQuM2DXGaIhOzxM8gJ7FMgB5f453yiccsGGG9jVffN1VEA/640?wx_fmt=png&from=appmsg)

这里还有一个需要大家关注，就是设置 `HuggingFace` 的 `Access Token`，因为我们要直接调用 `HuggingFace` 的 API 把模型上传到我们自己的 `HuggingFace` 仓库，这个 Token 就是用来做权限校验的。

我们可以到 `HuggingFace` 的 `Settings - Access Tokens` 下创建一个自己的 Token：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdTYVEslk3Pn0s5yD86p0sEWNXIlDGUQf1QbpBH9Zn7oEGfWCdEsUcBWYNRYuiaa9XEEJ4e3HeqPnfg/640?wx_fmt=png&from=appmsg)https://huggingface.co/settings/tokens

注意一定要配置为写权限，不然后面没有权限创建仓库：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdTYVEslk3Pn0s5yD86p0sEW8kEyDX7Pbq3I1LwM40wSx1alwslXlS6ibQP0dU7QvgMFcqKPicUiaDfJg/640?wx_fmt=png&from=appmsg)

然后我们将这个 Token 复制到 Colab 左侧的 `Secret` 下，创建一个名为 `HUGGINGFACE_TOKEN` 的  `Secret` ：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdTYVEslk3Pn0s5yD86p0sEWWTs9bNGNr2sR4AsB4L3abs2PwPBjYVFoe5v626XOPOZzlBIWyQULVQ/640?wx_fmt=png&from=appmsg)

### 第九步：将微调后的模型上传到 HuggingFace

下面就是使用上面配置好的 Token，调用 HuggingFace 的 API，创建一个新的模型仓库，然后把我们刚刚微调训练好的模型推送上去：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdTYVEslk3Pn0s5yD86p0sEWQ6AEpUjXq1d9ZP6CcBRIPaJIsvdiaibGmnMxgRwBPyVuVOIkdqsVlvQA/640?wx_fmt=png&from=appmsg)

注意这里大家可以把仓库名称改为自己的「用户名 + 模型名」，然后大功告成，我们去 `HuggingFace` 上查看一下：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdTYVEslk3Pn0s5yD86p0sEWU6BsCSAWGzvzbwElQnNkO4CmX851SAmwVKicTqPQmBhxPdVw48ufnLg/640?wx_fmt=png&from=appmsg)https://huggingface.co/Conard/fortunetelling

### 第十步：使用 Ollama 运行 HuggingFace 模型

`Ollama` 支持直接从 `Hugging Face` 拉取模型，格式如下：

```
ollama run hf.co/{username}/{repository}
```

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/e5Dzv8p9XdTYVEslk3Pn0s5yD86p0sEWS6Ttr9lgBTjlZ9XFoOw8ZnrPdNiarfTl5DXlcEVVdsibiaUqErPpial2dA/640?wx_fmt=jpeg&from=appmsg)ollama run hf.co/Conard/fortunetelling

下载完成后我们尝试运行一下：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/e5Dzv8p9XdTYVEslk3Pn0s5yD86p0sEWC95XbxcuPibtGHKnWk13OjvFI0c8gL2RKz3ab5lvVjF8KY0eeE8Mx1A/640?wx_fmt=jpeg&from=appmsg)

我们也可在 `Chatbox、Anything LLM` 这些工具下使用：![](https://mmbiz.qpic.cn/sz_mmbiz_gif/e5Dzv8p9XdTYVEslk3Pn0s5yD86p0sEWXzROfiackj4QziaIFudJTco28ejFZI89QZLWO5BkEvYiaoPkCnOPicjjuA/640?wx_fmt=gif&from=appmsg)

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdTYVEslk3Pn0s5yD86p0sEWgy6xTvrtv6I5GKILJOPFJoYn9JYfPkgELMUKPG3G8jqQIY1AAtQgibA/640?wx_fmt=png&from=appmsg)

最后
--

大家有任何问题，欢迎在评论区留言。

为了方便大家交流学习，我准备组建一个 AI 交流群，本文中微调案例中使用到的完整代码，我也会发到群里，想要在群里和大家一起讨论 AI 技术的小伙伴可以添加我的个人微信（备注 AI），拉你进群：

![](https://mmbiz.qpic.cn/mmbiz_jpg/e5Dzv8p9XdQ6O3F19TpB7uHeslhpV2zWIFR7pyasl6qRicaOEDN77LzmJOUYLia2SIZuVYjNw5a4UYq0ibMz4bnCg/640?wx_fmt=jpeg)

`点赞`、`评论`、`关注` 是最大的支持 ⬇️❤️⬇️