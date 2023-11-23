> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/56g-dnE2ZUSjGvJwLgCXrg)

本文是我在第七届中国开源年会演讲的主题《Remesh 介绍：用以开发大型复杂 Web App 的 DDD 框架》的 PPT 和演讲稿。

主要内容取自之前发布过的两篇文章：《[Remesh 介绍：用以开发大型复杂 Web App 的 DDD 框架](http://mp.weixin.qq.com/s?__biz=MzA4Njc2MTE3Ng==&mid=2456151856&idx=1&sn=fdf326dbcf0cd4e7f547a5c851204881&chksm=88528c87bf250591810384e0451a0f0a00ffd636ab8faeabaf38ab6a89ec2002023709311d71&scene=21#wechat_redirect)》和《[用 DDD(领域驱动设计) 和 ADT(代数数据类型) 提升代码质量](http://mp.weixin.qq.com/s?__biz=MzA4Njc2MTE3Ng==&mid=2456151799&idx=1&sn=09b5255fb59ad57c6a7830486981088e&chksm=88528d40bf250456b67df3994e4079a941e6c75409545c97c973b6768e5e3cf1e56683f63434&scene=21#wechat_redirect)》。

同时，还补充了一些额外的材料，以及重新梳理脉络。因此，本文是一个更综合的版本。

正文开始：

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwnaTuichO4wupgZU7gpLBviamFfYOIOCvy2ibaCbdOB1KB6oyibiaR8RwQ0utEQBGIlnaLIt2zwkddB5ticg/640?wx_fmt=png)

Hello，大家好。很高兴来参加今天的大会。我的分享题目是《Remesh: 用以开发大型复杂 Web App 的 DDD 框架》。

Remesh 是我最近开源的一个前端项目，这个项目跟我之前的项目显著不同的地方在于，不只是从技术的角度去设计和开发，还引入了 DDD 的理念，把 Remesh 设计成一个 DDD 框架。

不熟悉 DDD 的同学，可以暂时把它理解为状态管理框架。在这次分享的尾声部分，我们会对比 DDD 框架和状态管理的关系。

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwnaTuichO4wupgZU7gpLBviamFcm7lY7BgCeZD2CbLPHynFCfynUiawVYeyoXo9CsiaiaPUKMlgAOiaLicoicg/640?wx_fmt=png)

这次分享将分为 5 个部分，第一部分介绍领域驱动设计的必要性和必然性，第二部分介绍如何在不使用 DDD 框架的前提下，用 DDD + ADT 提升代码质量，第三部分则介绍 DDD 框架的必要性和必然性，第四部分更具体地描述其中一种 DDD 框架的设计思路，第五部分简单介绍 Remesh，最后再做总结。

那么， 让我们进入第一部分，领域驱动设计的必要性和必然性。

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwnaTuichO4wupgZU7gpLBviamFOqha1DqoucSHLz1o5hRrXgSZ7ibcxcUlwEPUibO1ORicKAc8icePd8IPsQ/640?wx_fmt=png)

领域驱动设计，这个词来自 2003 年 Eric Evans 的一本书，书名就叫《领域驱动设计》。在这本书中，作者说他把他观察到的，至少存在 20 年的一种软件设计的思潮，总结提炼成更体系化的描述，并命名这种软件设计方法为——领域驱动设计。

如果按照这本书出版时间倒推 20 年，就是上世纪 80 年代，当时互联网还不存在，但可能已经有软件项目，有意无意地采用了领域驱动设计。从某种意义上说，领域驱动设计，并不是作者的一种发明创造，更多是一种发现和总结的成果。

即便有团队不知道领域驱动设计这个概念，他们也可能无意中使用了领域驱动设计这种模式。

那么，领域驱动设计，到底解决什么问题？

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwnaTuichO4wupgZU7gpLBviamFibdrMtepC3QvtL12vFqGOf5cdoiaibYEBQtibIxwpRlpKicvfd1cJGRsEibA/640?wx_fmt=png)  

DDD 想要解决的问题，简单地说，就是需求模型不清晰的问题。

开发团队经常面对的情况是，需求描述不清晰啦，不准确啦，或者压根不可行，逻辑不完备，或者又难以理解，也缺乏数据支撑，等等等等，这些问题在 DDD 看来，都是一个问题。

就是，在领域建模还不清晰可靠的时候，开发团队就要开始写代码了。这里的问题很大，我们的需求模型，常常是用自然语言（就是日常用语、甚至口语）的形式呈现的，它天生就自带模糊性，但是软件是用特定编程语言的代码写出来的。

在需求模型中，所有省略的、模糊的地方，在写代码的时候，都必须补充和明确。如果开发团队在开发时没有可靠的领域模型，作为指导，那写代码时他们补充的细节，就属于个人发挥。

除非写代码的人，他自己就是领域专家；否则，缺乏对领域问题的专业知识，开发团队常常解决的是伪需求，交付的是不满足预期的功能，并且还显著增加了代码库里不必要的复杂性。

领域知识的可靠传递，不是一个简单的过程，不是一个随意的过程。我们接下来可以看一下，朴素的软件开发流程，为什么不够好。

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwnaTuichO4wupgZU7gpLBviamFMicXbYTGS5V45iaakqEYcF8lmXtsFPf34efPOEn2ibqMmbS7urILq6zpw/640?wx_fmt=png)

上面的图片，是一种比较常见的软件设计与开发模式，可以称之为流水线。在这种模式中，开发团队往往被排除在领域建模之外，开发团队面对的主要知识媒介，通常是用自然语言描述的需求文档。

开发团队主要是读者。创作过程，发生在产品经理和业务团队沟通环节。在一般情况下，领域专家角色，会出现在业务团队中。所以，这个软件开发模式，相当于把开发团队跟领域专家隔离。

开发团队，阅读的是拥有巨大歧义空间的自然语言所描述的需求文档。当开发者不理解需求的时候，他可能还可以反过来问一下产品经理，问题不大。但是，当开发者误解需求的时候，他们根本不知道自己理解有问题，也没有机会被纠正。

那最终进入代码的，就不是真正的需求，而是被误解的需求。如果是有 QA 或者测试团队，再验一遍，那还有机会报 Bug，让开发返工修改，只是这个纠错成本更高了。

相比写完代码之后再发现问题，明显写代码之前发现更问题，纠错成本更低。现在又流行一种开发自测的潮流，将来可能开发团队就是测试团队，开发团队就是最后一环。

那被误解的需求，可就直接上线了，由生产用户反馈问题了。这里的成本更高，代价更大，并且常常是不可接受的。

可能有同学会说，只要让产品经理把需求文档写清楚一点，不就行了吗？

那么问题来了，第一，有没有可能，理论上就不可能写得足够清楚。第二，有没有可能，让开发团队更早介入需求讨论，比把需求写得足够清楚，成本更低，效果更好呢？

接下来，我们来看一下，为什么说，需求很难通过文档的方式写清楚。

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwnaTuichO4wupgZU7gpLBviamFpXVlAawcApkBTQzYPLJs7uThLmbhOLDGhByv4qSmCoDtpKw5pvyyDg/640?wx_fmt=png)

在前面，我们一直在强调自然语言和编程语言的差别。自然语言是更模糊的，它允许省略很多细节，通过语境上下文，让听的人自己联想出来。这对于文学创作来说，是一件好事儿。一千个读者就有一千个哈姆雷特，就是因为自然语言允许不同的读者，面对相同的文本，可以根据他们自身的背景和情感偏好，做出不同的解读。

但是这种可省略性，也带来另一个结果，是一种不那么好的结果；就是歧义。

有两种歧义，一种是同一个人对同一文本可以做多种解读，一种是不同的人对同一文本可以做不同解读。

无线电法国别研究，属于第一种，不同的断句方式，就产生不同的意思。

我们来看几个案例：

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwnaTuichO4wupgZU7gpLBviamFiaibVcAz3048aoL50uTZ6GYSL7DVR2ybfYcqLmjMQLz9IJKoYQsY5mHg/640?wx_fmt=png)

第一个案例，内容含义受到句子上下文的影响。

“玛丽从前有一只小羊羔”，这是一个事实描述，简单清晰。

但是，这个事实描述后面，接上不同的句子，就能产生不同的意向。

比如，玛丽从前有一只小羊羔，而不是约翰有过。这句的重点是，小羊羔的归属者。

玛丽从前有一只小羊羔，现在已经没有了。这句的重点是，小羊羔的存在性。

玛丽从前有一只小羊羔，但别人有好几只。这句强调的是，小羊羔的数量。

玛丽从前有一只小羊羔，并不是一只大羊。这句强调的是，羊的大小。

玛丽从前有一只小羊羔，那只狗是亨利的。这句强调的是，玛丽有过的是羊而不是狗。

从这个案例里，我们可以看到，产品经理在需求文档中，有意无意省略的句子，可能导致开发团队对内容做完全不同的解读。

产品经理是需求文档的创作者，他们知道很多上下文，所以很容易受到知识的诅咒；想当然地认为其他人也有相同的认知基础，容易不自觉地省略内容。或者用很多缩写。

而开发团队作为读者，他们没有参与前期讨论，他们没有那些上下文，所以很多内容不可省略。这里就产生了创作者和读者之间的矛盾。

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwnaTuichO4wupgZU7gpLBviamFRibLViakE1s3YicMl32NyvpiaicicpNV8ML1vp4yQGPeNzaGX2WG95JQ1weA/640?wx_fmt=png)

第二个案例，内容含义受到语气上下文的影响。

同一句话，把重音放在不同的字上，就可以表达出不同的含义。

*   我没说她偷我钱（语气重点落在 “我” 上，含义：是别人如此说的）
    
*   我没说她偷我钱（语气重点落在 “没” 上，含义：我的确没有说过）
    
*   我没说她偷我钱（语气重点落在 “说” 上，含义：但是心里这样想）
    
*   我没说她偷我钱（语气重点落在 “她” 上，含义：我说的是其他人）
    
*   我没说她偷我钱（语气重点落在 “偷” 上，含义：可是他曾经动过）
    
*   我没说她偷我钱（语气重点落在 “我” 上，含义：他偷了别人的钱）
    
*   我没说她偷我钱（语气重点落在 “钱” 上，含义：偷的是其它东西）
    

从这个案例里，我们可以看到，如果开发团队没有参与前期讨论，他们只看文字内容，听不到大家表达的语气，有些信息即便文字部分写出来了，也是 Get 不到的。

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwnaTuichO4wupgZU7gpLBviamFL7PBmS62tyVjbsllicZe56pyFO3lwncb9Uw1AIsgHCic2Bz8qDdwK0ibg/640?wx_fmt=png)

第三个案例，内容含义受到神态上下文的影响。

我们来看个短视频，在这个视频里，用相同的配音，演绎两种不同的神态，一种是友好的，一种是虚伪的。

从这个案例中，我们可以看到，开发团队没有参与现场面对面讨论，看不到大家的神态，即便听到了声音，也有信息丢失。

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwnaTuichO4wupgZU7gpLBviamFx6ib9x0JuyzYpmCA8Zym05enUj1lyPJ3kHOgOiaqPxW6Db6ZybAIsxzg/640?wx_fmt=png)

前面几个案例，要说明的是，当开发团队没有参与跟领域专家的紧密沟通，他们看不到神态，听不到语气，并且面对的是可能不完整的文本内容。在这种情况下，对需求有误解、曲解，或者搞错重点，这在所难免。

这个问题，不仅仅在软件设计中存在，在生活中也很常见，甚至在比软件开发更庞大、更重要的人类活动中，也没有得到解决，并且历史上带来过很大的灾难。

史蒂芬 · 平克在《风格感觉：21 世纪写作指南》里，列举了三个现实生活中歧义带来的实际危害。第一个是核事故，第二个是飞机失事，第三个是美国总统大选票选事故。

这本书很有启发意义，推荐大家读一下，大家也可以把这本书推荐给自己的产品经理们。

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwnaTuichO4wupgZU7gpLBviamFpFN4hmYQoRibufwzLchSlib3lSibWjElKRcA0MpRuc9BpgIiaL4D34BOrQ/640?wx_fmt=png)

在《你的灯亮着吗》这本书中，作者说 “任何一位计算机程序员都能举出十几个例子，说明一个产生歧义的词、一个放错地方的逗号、一个表意不清晰的句子怎样造成了 1 万美元、10 万美元、100 万美元乃至更惨重的损失。”

这种资金损失，其实是比较罕见的事件，容易被大家注意到，但带有一定的偶然性。大家可能会有侥幸心理，觉得自己仔细一点，就能规避问题。

所以，我们要看到歧义带来的另一种不容易被注意到的、隐性的，但却是必然的成本，就是不必要的复杂度。

简单地说就是，我们的软件复杂度，可能比它要解决的问题自身的复杂度还高，并且多出来的复杂度，也没有产生多少价值，而是负担。最终软件项目会因为复杂度管理失控，很难甚至不能交付有意义的新功能。

可以说，歧义偶尔让软件产生巨大的资金损失，但常常让软件产生不必要的复杂度，甚至后者的代价和成本，累计起来更高。

那么，DDD 是怎么解决这个问题的？

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwnaTuichO4wupgZU7gpLBviamFtUUUaXdgDcXNH42PBZss5uzvSYkfIeCZP4Bv8c2teUHsOKCJXz7ygg/640?wx_fmt=png)

领域驱动设计所提倡的软件设计的开发模式，就像这张图。

左侧部分，是领域建模的部分，也被称之为 DDD 的战略设计，而右侧部分，是软件开发的部分，则被称之为 DDD 的战术设计。

战略设计的核心是，开发团队要参与到领域建模环节，所有相关团队，比如业务团队、测试团队、产品经理等，都要在一起紧密沟通。最好是现场面对面，看得见彼此的神态、听得到大家的语气，每个相关职能角色，都在一个交流的上下文里，共同把领域模型搭建起来。

搭建领域模型的过程中，会提炼出很多领域上下文，每个上下文有它们的边界，因此这些上下文也被称之为——边界上下文。

在每个边界上下文里，它们的核心概念都会构成一张词汇表、术语表，这被叫做统一语言。同一个词，在不同的边界上下文里，可以有不同的含义；但在同一个边界上下文里，一个词只有唯一一种含义。

比如前面的 “无线电法国别研究”，把它们放到一个边界上下文里，我们就得到了一种唯一确定的分词，里面根本没有“法国” 这个词，所以在这个边界上下文里，也不可能产生错误的断句。

另一个案例是 “烘手机”，它也可以有两种解读，一种是烘干手的机器，另一种是烘干手机。这两种解读其实是在两个边界上下文里，我们可以构造一个边界上下文，把有意义的词汇提炼出来，里面根本没有“手机” 的概念，所以也不可能有额外的解读。

通过边界上下文和统一语言，我们可以得到更少歧义的领域模型描述，并且开发团队全程参与，减少信息缺失。但是，领域模型搭建好了，只能算完成了 DDD 的一半工作。

DDD 的另一半工作是，开发团队把这个领域模型，同步到软件模型里。这种同步，不是随便来的，而是一一对应的。软件模型，可以反推出领域模型。所以，注意看，图里面的开发团队，有双向箭头，既有领域模型到软件模型的箭头，也有软件模型到领域模型的箭头。

领域模型里的边界上下文，映射到软件模型里，可能是服务或者模块。而统一语言里的词汇，则变成变量名、函数名或者方法名。

通过这种一一对应的方式，我们才更有信心地说，软件里包含的复杂度，跟领域自身复杂度是匹配的。因为 DDD 把软件从黑盒变成白盒，不仅仅要求功能实现出来，还要求代码的内在结构，跟领域模型也是对应的。

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwnaTuichO4wupgZU7gpLBviamF0xQRicFEjH3PhGN1OS3HVZgqvic5K0cCXu86em3hrGfwLodibbfhgnIsQ/640?wx_fmt=png)

为什么要求领域模型跟代码模型必须保持同步？

我们可以看看 DDD 作者自己怎么说，在 2003 年的那本书里，作者举了一个例子，说他曾经看到一个项目，在建模部分做得很好，但是开发人员被隔离了，建模跟实现脱节，项目最后宣告失败。

DDD 是个软件设计方法，它必须能最终体现到代码里，只是概念上的领域模型是不够的，必须整合到代码里，让领域模型变成可执行的软件。

第二段来自 DDD 作者在 2015 年写的《DDD 参考》，这一段强调的是开发人员，要知道怎么用代码表达模型，要知道代码的改变，意味着模型的改变，模型的改变也意味着代码要改变，这是一个双向同步的过程。

代码跟模型脱离的话，就导致整个 DDD 过程不成立了。

所以，在 DDD 里，领域模型跟代码模型的双向同步，是一个铁一般的原则。

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwnaTuichO4wupgZU7gpLBviamFDdqVibVuSWymib6WZ3YE8zEiaj5D9nYoI1gdJ1pSfa5w8HepzZWcibR46Q/640?wx_fmt=png)

到这里，我们来小结一下，领域驱动设计的必要性和必然性。

我们推理的起点是——自然语言歧义空间大，所以开发团队应该更早介入讨论，补充必要的交流上下文。

然后，在交流过程中，不是所有人都对问题领域有足够的专业知识，也就是说，不是所有人的意见都一样重要。所以需要引入领域专家，整个领域建模过程，应该是要围绕领域专家的。其他成员主要是参与学习，以及做补充。

构建的领域模型，必须要同步到代码里，代码也必须要反映领域模型；通过模型跟代码的双向同步，我们最终得到可靠的软件交付。

而软件迭代，就是在交付完这一版的软件功能后，重新进入 DDD 的全流程。

这就是 DDD 模式的运作方式，抓住了它的必要性和必然性这个核心之后，DDD 还是很容易理解的。

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwnaTuichO4wupgZU7gpLBviamFn63ibeiaDqCAm91Ixiaa6Bvon3OiaF5bdNqmJVN9DsLExo1OWJCh3sicLkQ/640?wx_fmt=png)

在第一部分，我们了解了 DDD 模式，但是，也只是概念上的理解。这种理解，对我们开发者来说，对我们写代码来说，能有什么帮助吗？

这就是我们第二部分的内容，不需要用到框架，用 DDD ＋ ADT 提升代码质量。

不管是性能提升，还是代码质量提升，它们的关键因素都是，要先有一个量化指标，不能只靠感觉，只靠主观评估。正所谓，没有度量，就没有优化。

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwnaTuichO4wupgZU7gpLBviamFMZCSoppUncY4MF9icSs3H3B40VZ1w0kciaibczds9uhia0K9gUf1vQIPmA/640?wx_fmt=png)

我们现在拥有一些代码质量的定性指标，比如可拓展性、可维护性、可读性、可测试性等等。

还有一些耳熟能详的提升代码的指导方法或者原则，比如 SOLID 原则，整洁代码、设计模式，以及低耦合高内聚等等。

这些都是很经典的，出现至少二三十年的方法。但是呢，还是有些让人不够满意，甚至有待商榷的地方。

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwnaTuichO4wupgZU7gpLBviamFsBzwjIE6QIrelCcm9ic1k3qzD48qlFOoziaHEusqhfYW1JabeX4gfb5Q/640?wx_fmt=png)

比如，相关性跟因果关系的问题。

SOLID 等编程原则，主要是一种工程总结，而不是演绎跟推理。也就是说，它们表达的是一种相关性，而不是因果关系。

比如右侧的图里，紫色大圈是代码宇宙，包含所有可能的代码，绿圈则是优质代码，黄圈是符合 SOLID 等编程原则的代码。在这个图呈现的关系中，优质代码大多满足 SOLID 特征，但还有更多符合 SOLID 特征的代码，属于低质量代码。

同时，也有一些不符合 SOLID 特征的代码，属于优质代码。

这里想表达的是什么呢？就是，当我们盲目推广 SOLID 等编程原则的时候，我们可能不是在发展绿圈，而是在发展黄圈，在产出更多低质量代码，而不是高质量代码。

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwnaTuichO4wupgZU7gpLBviamFXmEIYeyyTbicQiaVGDTnM9T40dClPz9w062cicoROhuVUJ4lictiaoDt4EA/640?wx_fmt=png)

总的来说，我觉得，当前流行的代码指南，还有很多不足之处，主要体现在：

*   Unclear: 表述模糊，不够清晰
    
*   Subjective: 依赖开发者主观经验
    
*   Imprecise: 不够精确，不够准确，非量化指标
    
*   Hindsight: 对已写就的代码做事后评估，对写代码本身缺乏建设性指导
    
*   External: 围绕代码表面的形式，忽视问题的本质特征，或者假设问题已经被解决
    
*   etc.
    

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwnaTuichO4wupgZU7gpLBviamFohXUh49bOiacSddX0B7cXEck5JsGFRPJUtEiahs24ZNDAjrpmYKdI2vw/640?wx_fmt=png)

反过来，我们真正想要的代码质量评估方法是：

*   Clear: 表述清晰明确，无歧义
    
*   Objective: 客观的、一致的认知
    
*   Precise: 量化的、精确的代码评估标准
    
*   Insight，在写代码之前或写代码之时就能帮助洞察问题
    
*   Internal，围绕问题本质出发，不仅仅是代码的表面编写形式
    
*   etc.
    

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwnaTuichO4wupgZU7gpLBviamF1VrnibF8Pr7jen8ia1icOmJzRTG9MjHLzxovEJW8IWK016icORj7vOzzRg/640?wx_fmt=png)

那么，为什么 DDD 有助于提升代码质量？

这是因为，高质量的代码来自对问题正确的认知，很难在不理解问题的基础上优雅地解决问题。代码的写法、风格、模式等手段，也只有建立在正确认知的基础上，才能达到最佳效果。

如果没有提高对问题的认知水平，只是盲目运用一些代码技巧，往往让代码更糟糕。而 DDD，就是获取和传递可靠的知识的一个有效手段。

领域知识＋技术能力，才能产出高质量代码。

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwnaTuichO4wupgZU7gpLBviamFic25v5ib8s9vp8f5GFKT6SeLpOOlHmpSzMxIzquX7rySibSI5c0RmKLyw/640?wx_fmt=png)

这就到了 DDD 的战术设计的部分，用一句话来总结就是，代码应当忠诚地反映领域知识。

代码和知识之间，存在互相的映射关系，满足这个映射关系，就是高质量代码，反之就是有问题的代码。

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwnaTuichO4wupgZU7gpLBviamFhpEXNNFYg8mKyZEjng5pVW1ujcic73CU4DzmDWtyBWCUn1LAGb4YXcw/640?wx_fmt=png)

跟自然语言不同，写代码的时候，我们没法隐藏细节，也没法省略内容。所以，如果我们想要知道 DDD 代码应该怎么写，必须先更精确地定义什么是领域，以及什么是领域知识。

在这里，我们把领域定义为一系列关联问题构成的集合，这个集合是数学意义上的集合，它包含很多领域相关的命题描述。

而领域知识，则是这个集合里真命题所构成的集合。

有了这个更精确的定义之后，我们就可以做很多事儿了。

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwnaTuichO4wupgZU7gpLBviamFyQzgMug4c5S8KbYXlYibTWn3My1Ya8IVbrF8s6HEC6MsULAL1E1UnNw/640?wx_fmt=png)

比如，用柯里 - 霍华德同构，把命题转换成类型。

柯里 - 霍华德同构，是理论计算机科学领域的一个重要结论。它描述的是，逻辑系统跟类型系统之间，存在着一一对应的结构。

当我们用至少包含一个值的类型，表达真命题，用不包含任何值的类型，表达假命题。那很多逻辑操作，比如 AND 跟 OR 操作，就对应着 Product type 和 Sum type。

通过柯里 - 霍华德同构，我们得到的是，把领域知识翻译成类型代码的通用方法。用一句话来描述就是，命题即类型，证明即程序，用类型去表达领域知识。

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwnaTuichO4wupgZU7gpLBviamFsaUsz7BJMQ0yuFjAzky1MEQ7QLbwJFesBCXIPjQv0K36ZuAozAeBkg/640?wx_fmt=png)

按照这个模型，我们很容易定义 Bug：Bug 就是代码里的命题跟领域里的命题不一致。

比如，领域里的真命题，在代码里却是假命题。领域里的假命题，在代码里却是真命题。

这种不匹配，反映了软件没有满足领域需求。

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwnaTuichO4wupgZU7gpLBviamF6Oz1xOQibzyMX6GrZSBk4JSS8ToQ09Xib6FCQGOfd6X9IZMstl6Fbbcg/640?wx_fmt=png)

同时，高质量的代码的判别标准也有了，就是反过来，领域里的命题跟代码里的命题一致。

领域里的真命题，代码里也是真命题；领域里的假命题，代码里也是假命题。

这种匹配关系，反映了软件满足了领域需求。

即便如此，这个模型，仍然停留在定性指标上，还没有达到定量指标的目的。

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwnaTuichO4wupgZU7gpLBviamFS4VshSkexFMd69ibNb2Ejqf5SLicbVcPIFyRKIbHgwESfUBibaG7iatuEQ/640?wx_fmt=png)

那接下来，我们要构造一个定量指标，这个指标，类型论已经给出了，我们来过一遍简单的基础知识。

在类型论里，所有的 term 或者说 value，都有一个类型，写法就是 term: type。

然后，我们来看一些基本类型。比如 Empty type（空类型），就是一个值都没有的类型，按照前面说的柯里 - 霍华德同构，空类型表达的是假命题。

Unit type，就是有且只有一个值的类型；Boolean type，有且只有两个值的类型；自然数类型就是拥有无限多个值的类型，依此类推。

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwnaTuichO4wupgZU7gpLBviamFlyl45ay4FwuQowErweiayfWMEBuddF0IF0XC8fAF8c7SyNkGv1156Kg/640?wx_fmt=png)

除了那些给定的类型以外，类型论还提供了类型的组合操作。

比如 Sum type，表达的是一个值，要么是 A 类型，要么是 B 类型，但不能两者都是。Sum type 的 size，对应的是一个相加的操作。

而 Product type，表达的是个值，既满足 A 类型，也满足 B 类型，两者必须同时满足。Product type 的 size，对应的是一个相乘的操作。

我们说的 ADT，指的就是 Algebraic data types，它就是由 Sum type 和  Product type 这两种操作构成的。

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwnaTuichO4wupgZU7gpLBviamFXFUZOCZXjMydQ05FFD00CJr3zAOWFq2lFYDVQKdCjqcXaqFKBKWE6g/640?wx_fmt=png)

到这了一步，我们就得到了从领域模型到程序模型的转换过程。

我们将领域知识，转换成逻辑命题的形式，然后通过柯里 - 霍华德同构，得到了对应的类型定义，再用类型背后的代数计算，得到了一个定量的分析。

从知识，到代码，再到定量分析，整个链条串起来了。如果用前面的标准，校验一下这个模型，我们可以看到：

它的表达是清晰明确的，没有歧义的，因为我们得到的就是逻辑命题、类型代码、代数计算这类数学性质的描述。

逻辑、类型和代数，都是形式系统，它们是客观的，所有人都可以按照相同的推导规则，得到相同的结论。

我们引入了代数计算，可以精确计算类型背后的代数。并且，通过领域知识，我们在写代码之前就能得到指导意见。

代码就是按照领域知识编写的，围绕着问题的本质，不是随意的。

可以说，DDD + ADT 模式，比传统的代码评估和指导原则，更加系统、完备以及可量化。

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwnaTuichO4wupgZU7gpLBviamFkFzc2IPe3JcmACYG7WX6qcUO8m723bSx6HV2FUdiaNNNqias3COv9R0A/640?wx_fmt=png)

前面讲的是原理，现在我们来看一下方法论。

有三种驱动，分别是领域驱动、类型驱动、测试驱动，它们并不是对立的，它们在不同阶段发挥作用。

在产品设计阶段，领域优先，领域驱动设计；

在程序设计阶段，类型优先，类型驱动开发；

在代码实现阶段，测试优先，测试驱动开发。

我们先得到领域知识，然后推导出对应的类型定义。有了类型定义，才能写出相应的测试代码。而具体的代码实现过程，就是通过一个个测试用例的过程。

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwnaTuichO4wupgZU7gpLBviamFMArwB3VBzAicVZaADXL2RJk3f7ou1su43fHcggH4wWeqaMNfibJzbtAg/640?wx_fmt=png)

现在，我们有了原理跟方法论，可以来看一下，在具体的实战案例中，究竟怎么做。

假设我们已经完成了 DDD 的战略设计部分，已经得到了领域模型，就是左侧的领域规则描述。为了演示的方便，它做了高度的简化。

我们可以看到：

*   用户要么是已登录用户，要么是未登录用户（游客）
    
*   游客拥有随机的昵称
    
*   已登录用户拥有昵称、Email 信息
    
*   Email 信息要么是已验证的 Email，要么是未验证的 Email
    
*   已验证的 Email 有验证时间戳
    
*   用户信息通过 Http API 获取
    

规则非常简单，这个场景也非常常见。我们可以把领域规则，转换成逻辑命题的形式，就像右侧那样。

不过，这里只是演示所有领域规则，都可以细化成逻辑命题。但是，在实际的开发中，这一步骤不是必要的。我们可以直接把领域规则，翻译成类型定义。

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwnaTuichO4wupgZU7gpLBviamFCqJFzbO4X5Ojiaqv0Js246icrcbiaOBoR5myuiaSiaqx77yUbBkWU1uBaiaQ/640?wx_fmt=png)

比如像右边代码截图，它定义了两个类型：UserInfo 和 JsonResponse。

这种接口定义，简单清晰，注释完整，大部分开发者都能写出来，基本上就是数据库表结构的直接体现。

但是，从 DDD 的角度，它是有问题的代码。

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwnaTuichO4wupgZU7gpLBviamFV6qN1PNzIg1RXfTJRpAaT3QTnmPKMSwkw077gL1iaeoyNLwicPjGOB0w/640?wx_fmt=png)

更符合 DDD 的类型定义，像右边这样。

从两个类型，变成了 9 个类型，一行注释都没有，代码行数也比前面的版本多出一倍以上，并且还有很多重复字段，比如 name 和 email 在好几个类型里都出现了。

如果只从代码的表面形式来判断，它明显不符合 Don’t  Repeat Yourself 等原则。它属于过度复杂的代码，属于不够简单直接的代码，也很难看出它怎么储存到数据库里。

在这种意义上，前面的版本，比这个版本更好。

但是，从 DDD 角度，它却是更优质的代码，因为它更加忠诚地反映了领域知识。比如，用户要么是登录用户，要么是未登录用户；这条规则对应的类型定义，就是 UserInfo 等于 LoginUserInfo 跟 GestUserInfo 两个类型的联合类型。

也就是说，UserInfo 是用 Sum type 定义的，而 Sum type 对应的逻辑操作是 “或” 的关系：要么是这个，要么是那个，但不是两者都是。它精准地对应了领域规则。

同理，EmailInfo 也应该是 Sum type，因为领域规则是要么是已验证，要么是未验证。JsonResponse 也应该是 Sum  type，因为领域规则是要么是成功的响应，要么是失败的响应。

那么问题来了，如果说，现在这个过度复杂的版本，才是 DDD 意义上的优质代码；那前面简单清晰的版本，是什么代码？

在 DDD 意义上，前面的版本，其实属于过度简化的版本。也就是说，不是我们现在这个版本过度复杂，而是前面版本过度简化。它有很多问题。

比如，领域知识被写成了注释，它说当用户未登录时，email 字段为空字符串。但这只是注释啊，谁能保证，在运行时，email 字段一定为空？

你把领域知识写成了注释，但注释是不参与代码的执行跟验证的。注释通常是自然语言编写的，它也没有解决歧义问题。注释还常常过时，失去时效性。

把领域知识写成注释，是一个次优的选择。而我们新的版本，领域知识被编码到类型里，我们不用根据注释去猜测 UserInfo 可以分裂成多种组合，可以一眼直观地看到，两种就是两种。

并且，当用户未登录时，它命中的是 GestUserInfo，它压根没有 email 字段，所以我们的代码也不可能错判。我们用类型把非法状态，扼杀在编译期，由类型系统提供约束能力。

这是更好的做法。

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwnaTuichO4wupgZU7gpLBviamF9bic7IN2MgFMic2TeqRVBYqlPf3PkxVSO3mmVrpreuZCrFNdJkQB7BYA/640?wx_fmt=png)

另外，需要强调的是，表面上的简单跟复杂，跟实质上的简单和复杂，也不是一回事儿。

左侧是第一个版本的类型定义结构，右侧则是更符合 DDD 的那个版本。

表面上看，左侧层次更少，字段更少，更加简单。而右侧层次多，字段多，形式上更加复杂。

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwnaTuichO4wupgZU7gpLBviamFrz9Nn4J2CWd5YoTmTWheVfqfBRh1CFGALG4WGNqCicics7RMfQqF2wMA/640?wx_fmt=png)

但是，如果我们把类型之间的代数关系标出来，把加号和乘号标出来。

我们可以看到，左侧拥有更多的乘号，而右侧却有几个加号。

左侧的类型的 size 更大，接受更多的 value；而右侧类型的 size 更小，接受更少的 value。

左侧比右侧多出来的 value，都属于非法状态。也就是说，右侧的类型定义，实质上比左侧更加简单和精准，左侧实质上是更复杂的一个。

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwnaTuichO4wupgZU7gpLBviamFK7L6GQiasD0axAGrsJP5ia9GkS66ayRVMmhahL7NiaRmmbGs3jmJ0InVQ/640?wx_fmt=png)

总的来说，就是用 product type 去替换 sum type，让代码变简短的同时，也包含着很多代价。

*   领域知识里 Or 的关系，被曲解为 And ，类型由加法复杂度，变成乘法复杂度
    
*   代码上能写出来的值 (value) 的数量(terms size)，大于领域知识里的真命题的需求
    
*   代码里的真命题 (多出来的值)，是领域里的假命题，它们成了非法状态（Illegal-States）
    
*   所有消费数据的地方，都需要做防御性判断，排除非法状态，否则就导致程序出现 BUG
    
*   系统的可维护性，跟非法状态在代码库里的泄漏程度成反比，泄漏越多，越难以维护和预测
    

而更加符合 DDD 的代码，就像这个截图里显示的那样，在写代码的时候就能给出正确提示。开发团队如果写出错误的代码，根本通不过编译。

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwnaTuichO4wupgZU7gpLBviamF6TyReltyGH60ibmiaicHMD36ytX4yU0kabLNs4xQr5KeSm4PQPv36mXYg/640?wx_fmt=png)

用一句话来概括就是，用 DDD + ADT 模式，可以锁死非法状态，让我们的代码库更加健壮。

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwnaTuichO4wupgZU7gpLBviamFwlXm7WIOaLlXv5nXnmZWicXNVBAgsEic1LEAU2EJVyeGRxm0r7esnQmg/640?wx_fmt=png)

我们再来看第二个经典案例，它是关于流程建模的，也很简单，领域规则是：

*   用户发帖有 3 个阶段：草稿、审核、发布
    
*   草稿不能跳过审核直接发布
    
*   草稿可以提交审核
    
*   审核通过后可以发布
    
*   审核中的帖子不能修改
    
*   审核不通过退回草稿阶段
    

我们很容易写出右侧的代码，定义一个 Post class，封装所有操作，遇到非法操作就抛出错误。

很明显，按照 DDD 的要求，这种方式也是不好的。因为，审核中的帖子不能修改，不是指调用 edit 方法就报错，而是压根没有 edit 方法。

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwnaTuichO4wupgZU7gpLBviamFjPQsBqhg0S6QSyNwzuibEueq14q6uK4tFD5PiaMGz5qOJcc9M2cR8Cjg/640?wx_fmt=png)

所以，从 DDD 角度，应该写成右侧那样。不是一个 Post class，而是 3 个表达不同阶段的 Post class。

DraftPost 对应草稿阶段，它可以编辑和提交审核，所以有 edit 和 review 两个方法。

ReviewPost 对应审核阶段，它不能编辑，所以没有 edit 方法。

PublishedPost 对应发布阶段，它只有 getContent 方法，也不能编辑。

不同发帖阶段的转换过程，体现在调用方法的时候，return 不同阶段的 Post 的实例。

这个版本，比前面的版本，更加忠诚地反映了领域规则。

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwnaTuichO4wupgZU7gpLBviamF8t5RqT2mld5Y0Pib8CVHzy6iaxTroQLBW6rn3Ee4bwLFqF6kw0lqReicA/640?wx_fmt=png)

简单地说，

*   将互斥的操作放到一起并存，关系从 Or 变成了 And ，从加法复杂度变成乘法复杂度
    
*   代码上能调用的函数 / 方法的数量 (terms size)，大于领域知识里的真命题的实际需求
    
*   代码里的真命题（多出来的方法调用），是领域里的假命题，它们成了非法操作 (Illegal-Operations)
    
*   所有调用方法的地方，都需要做防御性判断，排除非法调用，否则可能导致程序抛错和出 Bug
    
*   系统的可维护性，跟非法操作在代码库里的泄漏程度成反比，泄漏越多，越难以维护和预测
    

而更加符合 DDD 的代码，就像这个截图里显示的那样，在写代码的时候就能给出正确提示。开发团队甚至写不出错误的方法调用，因为根本通不过编译。

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwnaTuichO4wupgZU7gpLBviamFgEUanAJh6icHFAodZ5ROCicW2Kp1o3HZqMgHJ8VkwCibUtibfqbjppe5ng/640?wx_fmt=png)

用一句话来概括就是，用 DDD + ADT 模式，可以锁死非法操作，让我们的代码库更加健壮。

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwnaTuichO4wupgZU7gpLBviamF06Gb7eVoBzqQfcuX8icZaMOLbPpKD3ib8WeR1gkibeYLQeTsibMBEV6ic9g/640?wx_fmt=png)

我们来做个小结，在第二部分，我们了解到的是：

*   运用领域驱动设计 (DDD)，建立团队统一用语，可以获得可靠的领域知识，挖掘真实需求
    
*   运用代数数据类型 (ADT)，对领域知识进行一比一建模，获得可靠的代码设计
    
*   DDD + ADT：从知识中可以推导出代码，从代码中可以推导出知识，知识与代码的同构
    
*   核心技巧：多用 Sum type，少用 Product type，减少非法状态和非法操作的泄漏
    

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwnaTuichO4wupgZU7gpLBviamFQ2sqThW3zj2yYrlsoU13KZDdXIq9DzdOacWYib8Uko8VbJsqlMZGliaA/640?wx_fmt=png)

好的，第二部分我们介绍了，不用框架，怎么写 DDD 代码。在第三部分，我们讨论的问题是，DDD 框架的必要性和必然性。

什么是 DDD 框架？为什么我们需要它？

我们可以先来看一个案例，一种简单的旅客模型：

1.  有两种旅客：成人旅客和未成年旅客
    
2.  所有旅客都需要提供姓名和年龄
    
3.  年龄大于等于 18 的为成人旅客
    
4.  成人旅客必须提供联系方式
    
5.  未成年旅客可以提供，也可以不提供联系方式
    

按照前面介绍的 DDD + ADT 的模式，我们很容易写出右侧的代码，我们可以看到：

旅客是成人旅客和儿童旅客构成的 Sum type，满足了规则①；

两种旅客类型，都有名字和年龄属性，满足了规则②；

成人旅客有字符串类型的联系方式，满足了规则④；

而儿童旅客的联系方式是一个可选字段，满足了规则⑤；

但是，看似不起眼的规则③，却没有满足，因为 number 类型允许所有数字，它没有表达出大于或等于 18 的关系。

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwnaTuichO4wupgZU7gpLBviamFV63icUhoL2x023J8YdM4X0xVKa5ibanWRIvibRCwGPG9GzX5c4RYTMXag/640?wx_fmt=png)

想要在类型上，表达出大于或等于 18，需要用到 Refinment types 或者 Dependent types 这两种高级的类型特性。

在 2016 年，有一篇论文《Refinement Types for TypeScript》，尝试给 TS  添加 Refinment types。

具体来说就是，用花括号去定义类型，但它表达的不是一个对象，而是一个类型表达式。在花括号内，竖杠左侧是类型定义，跟它对应的值，比如 v。

竖杠的右侧，则是一个取值范围的判断。实现的效果是，对特定类型的取值范围进行更细致的约束。比如右侧代码截图的成人年龄类型，就是数字类型，但必须是大于或等于 18 的数字，小于 18 的数字赋值给这个类型时，会报类型错误。

同理，儿童年龄类型，接受的值是，大于或等于 0 但小于 18 的数字，其它数字或者值，都会被拒绝。

很明显，从代码截图里的红色波浪线来看，现在的 TS 没有实现 Refinement types 特性，所以我们很难写出满足前面的规则③的类型。

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwnaTuichO4wupgZU7gpLBviamFDiaIplu2NT454ua6Qdq6jiacdeUdicDBL7gXTDQjv58jBEHicE8vuCWLCQ/640?wx_fmt=png)

因此，DDD 框架的必要性和必然性，体现在：

1.  主流语言缺乏对 Refinement types 和 Dependent types 足够的支持
    
2.  所以，许多领域知识对应的命题，无法在类型上充分表达
    
3.  那么，类型约束不够，就会导致很多非法状态泄露到 Rumtime 运行时
    
4.  所以，我们需要引入 DDD 框架，在 Runtime 约束非法状态的 Read/Write，读和写
    

接下来，我们将会介绍一种 DDD 框架的设计。

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwnaTuichO4wupgZU7gpLBviamFPfUMQibNMpGBYO2uw0s42eSwbQ0icviaINLJceDYO0amt9GSfYOuj8F1Q/640?wx_fmt=png)

首先是 CQRS，命令查询职责分离。它是由 Greg Young 在 2010 年提出的，受到了 OOP 里 CQS 的启发，一般被用在后端领域。

看下面的左图，就是 CQRS 模式在后端领域的一种实现方式，其中数据的消费者，一般是 UI，而数据的存储，则是数据库，一般是有两组数据库，一组负责查询职责，一种负责写入，两个数据库之间存在一种同步机制，满足最终一致性的原则。

这只是 CQRS 的其中一种实现，我们可以提炼出更加抽象的、面向接口的  CQRS 模式，就像右侧那样。它没有指定 Data Consumers 数据消费者是谁，也没有指定 Data Storage 数据怎么储存。

它表达的是，在在数据消费者和数据储存之间，存在一个中间层：Command Model 负责写入数据，Query Model 负责查询数据。

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwnaTuichO4wupgZU7gpLBviamFubAZ8ZxibdSUVgQEKSxluMnI1Dywk2ZumBeTkgEIU46iabd4SbibJexlQ/640?wx_fmt=png)

用 CQRS 去实现前面的旅客模型，大概像右边截图那样。

我们没有直接暴露底层状态，而是暴露两组方法，query 部分负责查询，command 部分负责写入。

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwnaTuichO4wupgZU7gpLBviamFicBzPnicYELTEUlAU4n1Tnn7oDsFXZ7GNCia2mBldULeicnr8ekFR1KO7A/640?wx_fmt=png)

在 updateTraveler 这个 command 方法里，我们更新状态，总是按照领域规则，验证年龄，遇到非法输入，就抛出错误。

有了这一层，我们的底层数据就难以被写入非法状态。

也就是说，当我们无法在类型上约束数据的读写，我们就得在运行时去约束，比如使用 CQRS 模式。

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwnaTuichO4wupgZU7gpLBviamFXvBOw4Ph7Nypk3HrVV9FYNjcsIoXVvic4JvxnAOaEGRW9WBOnrFneHw/640?wx_fmt=png)

前面的代码，还有一个问题，就是当遇到非法输入的时候，我们抛出运行时错误，这是一个一对一的关系，只有 command 的调用者能够 catch 到这个错误。

那么，如果其它数据消费者，也关心某个事件，应该怎么做呢？

我们需要引入 Domain Event (领域事件) 这个概念，CQRS 是面向数据模型的，领域事件则面向通讯模型。它是一对多的关系，数据消费者可以订阅特定的领域事件，然后 Command Model 里可以发布领域事件。

那么，当遇到非法输入时，我们可以发布一个领域事件，让所有关心这个事件的消费者，能够做出响应。

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwnaTuichO4wupgZU7gpLBviamFsStlUdVnEHsgbC6j8Ny2R7uGUTm2NyUKcJmGwn99ic2KyjSqicxceq7g/640?wx_fmt=png)

只是加入 “领域事件” 的概念，也不足够，我们还需要引入 Domain Effect (领域副作用)。

有很多领域问题，是跟副作用相关的，或者不需要外部调用 command 去驱动的。比如：

*   2 秒内多次发布指令以最后一次为准（防抖，Debounce）
    
*   2 秒内不能多次响应指令（节流，Throttle）
    
*   红绿灯（倒计时，Count-down；自驱动，Self-Driven）
    
*   复杂动画交互（动画，Animation）
    
*   当 A 事件发生后，如果 B 时间内 C 事件不发生，则发送 D 指令 (时间相关的条件事件，Time-related conditional events)
    

我们需要引入 Effect Model，去对接定时器等副作用来源，否则我们的领域模型，甚至连简单的红绿灯都不能自洽地表达出来。

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwnaTuichO4wupgZU7gpLBviamFFtfo5ib8hjL50DSUnbSr0w47tL8nfwMBJBsZT183C5o9Kz1bBdsRtmw/640?wx_fmt=png)

总的来说，完整的领域模型，包含三个要素：数据模型、通讯模型和行为模型。

领域模型，不只是一种数据结构，也包含通讯能力跟副作用行为。

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwnaTuichO4wupgZU7gpLBviamFPIAbPYNl1PjVicuAdIuic7NYAHOQyeXEDX5kibOy2JCYOOpZvnM7lI0RA/640?wx_fmt=png)

当我们的领域模型不完备，就会产生领域逻辑的泄露。

也就是说，领域模型的外部消费者，它们没办法只是面向接口，它们必须把模型里缺失的部分，在外部实现一遍。

比如左下的图片，表达的是上游 Provider 跟下游 Consumer 的关系。粉色圆点是代码编写位置，我们可以看到，当上游的 Provider 可以自洽地包含所有领域逻辑，下游多个消费者只需要调用接口，就能满足需求。

当上游的 Provider 不完备，那它所有下游消费者，都需要补充缺少的部分。也就是说，很多领域逻辑，被多个下游消费者重复实现。每次更改，都要改动很多次，否则就产生了逻辑不一致。系统的复杂度就不必要地升高了。

右侧的图片，是一个大杂烩；它把 DDD，CQRS，整洁架构、端口适配器模式等，全部整合到一起。这个图，跟我们今天的分享，没有直接关系。

用这个图想说的是，很多开发者，特别是软件架构师，都发现，代码里的依赖顺序很重要，不合理的依赖顺序，会带来很多隐患。

并且，大家不约而同地把领域模型，放到了最核心的位置，把数据库、UI 等 IO 设备，隔离到最外部。内圈模块，不能依赖外圈模块，外圈模块才可以依赖内圈模块。

这种架构，其实就是 DDD 强调的——代码应该忠诚地反映领域知识。代码模块之间的依赖关系，也应该反映领域之间的依赖关系。

为什么领域模型，应该放到最内圈的位置，因为事实上，领域模型确实不依赖它的展现方式，或者存储方式。不管是以数据库为中心，还是以 UI 为中心，其实都不能反映领域模型的真实情况。

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwnaTuichO4wupgZU7gpLBviamFoTicpfeUZ4icpSDKtmgIvUQHj2YiaLDdrecn8nX9qjn9N9CnDggCxyXBA/640?wx_fmt=png)

OK，我们终于到了第五部分，Remesh 介绍。

Remesh，是一个用以开发大型复杂 Web App 的 DDD 框架，它完整实现了前面介绍的 CQRS & Event & Effect 模式。

在代码实现上，它吸收了 Redux, Recoil 和 Rxjs 的精髓部分。

Remesh 支持 SSR 服务端渲染，采用的是 immutable state 不可变状态，并且它是框架无关的：同一份 Remesh 代码，既可以跑在 React 应用里，也可以跑在 Vue 应用里。

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwnaTuichO4wupgZU7gpLBviamFAOgMwgdvvHJUjkzL1ITgcjAn9WQKltrgyqZcTvic6JA8pOjTLbyvU8Q/640?wx_fmt=png)  

使用 Remesh 的方式，类似写组件一样，只不过不是 UI 组件，而是领域组件。

Remesh 提供了领域状态、领域查询、领域命令、领域事件和领域副作用几个基本概念，对应 CQRS & Event & Effect 模式，代码写起来大概像右侧截图那样。

更具体的内容，这里就不展开了，感兴趣的同学，可以在 Github 搜索 Remesh 了解更多。

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwnaTuichO4wupgZU7gpLBviamFTDlPKUohAWV3F3SNzEz0gSibdB81asiayDjyZB6RXHoJyyuCatiaficl7w/640?wx_fmt=png)

现在，我们可以来回答状态管理跟 DDD 框架之间的关系。

状态管理主要围绕的是数据模型，可能部分状态管理库，会提供一些事件和副作用的功能，但一般不成体系。

所以，可以说，DDD 框架包含状态管理职责，但它提供了内聚领域逻辑所需要的更完备的结构，并且 DDD 框架强调模块依赖顺序跟领域之间的依赖关系保持一致。

举例来说，比如一个状态管理库，往往不会阻止你在 React 组件里编写异步请求代码，获取数据。但是，DDD 框架会阻止你。

因为，React 组件属于 UI 层，在依赖关系的最外圈；而异步数据请求，却是接近内圈的领域模型的一部分。所以，它应该写在领域模型里，在 React 组件只剩下调用接口的代码，可能就只剩下一行代码。

总的来说，DDD 框架会强调领域逻辑的独立性和内聚，领域模型可以脱离数据库、脱离 UI，独立地运行和测试。

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwnaTuichO4wupgZU7gpLBviamFcBWaNJcr93ka8Pqiak1iaxOj4zhQqsL4YTLJPlLeicuRAkTPjDyG71Qlw/640?wx_fmt=png)

最后，让我们来回顾一下，今天这个分享我们讲的内容。我们知道了：

*   领域驱动设计，是一种自然萌生的软件设计潮流
    
*   软件里的代码模型，需要反映现实中的问题模型
    
*   软件迭代是领域模型跟代码模型不断同步的过程
    
*   软件内的模块依赖关系也应遵循领域之间的关系
    
*   柯里 - 霍华德同构给出了从知识到代码的转换方法
    
*   方法论：DomainDD-> TypeDD-> TestDD-> Impl
    
*   Remesh：为复杂 Web App 服务的 DDD 框架设计
    

右侧图片表达了 DDD 的精华，从 DDD 战略设计到 DDD 战术设计，以及衔接战略和战术的柯里 - 霍华德同构。

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwnaTuichO4wupgZU7gpLBviamFdribTibq5ZzicgdQtqIE86xzlaSn8qMZFq0dNJzYZtKPfkO7Kxd64L5gQ/640?wx_fmt=png)

以上就是今天分享的全部内容。

对 DDD 或者对 Remesh 感兴趣的同学，可以扫码关注我的微信公众号。后续我将会把今天的 PPT 和演讲稿，发布上去。

感谢~