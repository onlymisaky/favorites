> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/Xur4s28bmqGsxV7f4d2GZQ)

今天跟大家介绍个人开源的新项目——Remesh。

> https://github.com/remesh-js/remesh
> 
> A CQRS-based DDD framework
> 
> for large and complex TypeScript/JavaScript applications

Remesh 是一个为开发大型复杂 Web App 服务的 DDD 框架。对 DDD 框架感到陌生的读者，可以暂且理解为状态管理框架（State-Management）。当然，Remesh 不止于此。

我们将通过这篇文章，介绍 DDD 的起源和目标，介绍实现 DDD 的方式，推导出使用 DDD 框架的必然性和必要性，介绍 Remesh 的设计理念和使用等。

**1、Domain-Driven Design (DDD)  是什么？**

我们先来看一下，当我们说 DDD 时，我们指什么？

DDD 这个词儿，来自 Evans Eric 在 2003 年的一本书《Domain-Driven Design: Tackling Complexity in the Heart of Software》_[1]_

在这本书中，Evans 提出了他对软件的复杂性来源的一个关键洞察——软件模型跟领域模型的不匹配，并提出他的解决方案（即 DDD）。

Evans 认为，软件模型和领域模型不匹配，让软件的复杂度不必要地增加，让软件的迭代和维护都变得过分困难，远超它们应有的复杂度。

他认为，其根本原因在于，领域专家（可以理解为业务同事）和开发团队之间缺乏通用的沟通语言，存在很多误解和曲解。

  
具体表现为，尽管业务专家和开发团队使用同一些词汇，比如账户、订单、优惠等，但他们脑中这些词汇的含义却可能不同。很容易出现表面上大家彼此达成一致，实质上各干各的。

软件交付后，业务同事开始责怪功能跟他们预期不符，跟最初说好的不一样。开发团队却觉得我们就是按照需求描述来的，怎么交付后对方不承认了。

他们的感受都对，也都不对。他们各自在自己的逻辑中正确，但在对方的逻辑中，同一个词却有不同的意义，从而产生了不匹配。

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwnbmchb8r9tXvjOuBvbFkEReMbw5Y67FGcSEtOP1f4vkAr0XtHGhA6SgHl6DfJUxXto1hGQ1MMz1Rw/640?wx_fmt=png)

为避免上述虚假共识现象，DDD 认为，需要培养团队的 Ubiquitous Language，确保领域专家和开发团队对同一个词的理解总是相同的。

之前的模式下，业务同事和产品同事前期讨论的成果，汇总为产品需求文档（PRD）。开发人员主要是读者。

而 DDD 模式下，开发团队更早参与到业务讨论中，跟业务专家走得更近。每一个业务里的关键词汇，都是在讨论过程中，在所有人的见证下确立的。开发人员成为了创作者之一。

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwnbmchb8r9tXvjOuBvbFkEReK5brlmBO5U9ADyFHIwUOfAKn20TJib68eIOvmTToFkFzl0PNwk8pbAg/640?wx_fmt=png)

在这种情况下，开发团队带着跟领域专家们的共识去编写代码。此时更可能得到一个反映了真实需求、真实问题的软件。其中的复杂度，都是来自业务领域的真实复杂度。

维基百科对 DDD 也有一个很好的介绍 _[2]_：

> Domain-driven design is a major software design approach, focusing on modeling software to match a domain according to input from that domain's experts

我们可以提炼出几个关键部分：

*   A major software design approach
    
*   Focuses on modeling software to match a domain
    
*   According to input from that domain's experts
    

我们可以看到，DDD 是一种软件设计方法，它不仅仅是团队之间的沟通技巧。它必须涉及到软件开发的部分，也就是必须跟代码有关系。并且，代码必须跟领域相匹配，而领域模型则来自领域专家们。

DDD 的核心是代码模型和领域模型的匹配关系，两者缺一不可。  

  
强调这一点非常有必要。很多开发者形成了一些常见误解。

**1.1、第一类误解是，认为 DDD 跟代码实现无关。**

DDD 指导下的代码实践，不是一件容易的事情，甚至长期以来，并未带来显著的成效。

  
它里面主要是一些简单的分类名词，如 Entity, ValueObject, Aggregate 等。比如当一个对象存在唯一的 id 或 key 时，它被归类为 Entity，否则为 ValueObject。很多 Entity/ValueObject 放到一起，构成 Aggregate 等等。

很容易看到，除了规范一些代码命名以外，上述 DDD 代码指导没有提供真正有技术含量的内容。

因而，DDD 开始分化为两类，上面那种被称之为 DDD-Lite，或者 Tactical Design（战术设计）。它是更接近技术的部分，也就是更接近写代码的部分。

而更接近团队沟通和协作部分的 DDD，则被称之为 Strategic Design（战略设计）。它主要关于 Bounded Context， Context Maps 和 Ubiquitous Language 等概念，旨在让开发团队和领域专家们一起，理清不同的上下文边界，构建特定上下文内部的通用沟通语言。

一些开发者看到后续的 DDD 著作，主要集中在更通用的战略设计部分，削弱了战术设计部分的比重，就误以为 DDD 的核心在于战略设计部分，甚至认为只需要战略设计部分。

这是把战略设计和战术设计对立起来。其实它们并非互斥，并不是有两种 DDD。

而是 DDD 有两个阶段：

1.  战略建模阶段，重视团队沟通和协作。这个阶段输出：Bounded Context， Context Maps 和 Ubiquitous Language 。
    
2.  战术建模阶段，重视软件的开发和维护。这个阶段的输入是战略建模阶段的输出，输出的是交付的软件。  
    

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwnYlgic5dQyhpuG5TNK8ibWNAQ1YWTHwx1j2cETjY2FGWUQ13mvmQQOhoCsXLjzlH6WcJ1uRNJoHYGag/640?wx_fmt=png)

在团队协同设计阶段，需要通过特定团队运作方式，提炼出团队共识（Ubiquitous Language）。这部分做好了，我们可以说在 DDD 的第一部分达到了比如 80 分。  
  
在第二部分（代码实现），如果没有采用和匹配第一部分的产物，那么我们说在 DDD 的第二部分只有比如说 20 分（取决于代码实现有多随意）。

DDD 的核心目标是交付高质量的软件，它需要全链路地考量软件开发的过程。既不能只考虑怎么写代码，忽视业务逻辑的来源的可靠性；也不能只考虑业务模型，忽视写代码的部分。缺少任何一部分，都难以有效地管理软件的复杂度，也难以保障软件的交付质量。  

实际上，如果只考虑战略设计，即团队协作沟通以达成共识这块。DDD 提供的 Bounded Context， Context Maps 和 Ubiquitous Language 缺乏科学理论和实验支撑，并不是一个好的选择，并且很容易流俗于开发流程的培训活动。

失去代码支撑的战略设计，也达不到 DDD 所承诺的目标。

如果所谓的 Ubiquitous Language 并不需要体现在代码里，那开发团队参与讨论时，难以全情投入，难以被激发主观能动性。很容易变成，开发团队最后说：“你就告诉我你们想要什么吧”。他们不再愿意深入理解领域问题，反正跟代码没什么关系，他们更愿意把时间放在写代码上，认为拿到一个需求结论即可。

在论文《A new approach to the semantics of model diagrams》，作者 

JG Granström 写道：

> 有时，一张图比一千行代码更能说明问题。但是，可悲的是，大多数情况下，软件工程师在过了设计阶段后就放弃了图表，所有真正的工作都是在代码中完成。如果图表就是代码，那么代码对图表的优势地位将被抹平。

> Sometimes, a diagram can say more than a thousand lines of code.  But, sadly, most of the time, software engineers give up on diagrams after the design phase, and all real work is done in code.  The supremacy of code over diagrams would be leveled if diagrams were code.

在软件开发活动中，代码在被写出来之后，就拥有了相对其他任何知识媒介的巨大优势。不管是 UML 图、PRD，知识库还是口口相传，都在逐渐过时甚至被遗弃，只有代码在随着迭代不断有序更新和持续。  

只有代码这一知识媒介，得到了更好的版本管理、模块化、语义化、结构化、类型检查、编辑器提示等全方面的支持和提升。当其它知识媒介都找不到了，或者失去时效性了，翻代码成了最后的手段。

那么，如果 DDD 可以脱离代码，代码也无需有效地反映领域知识，翻代码找业务逻辑的意义何在呢？  

DDD 的价值，其实就在于让代码这一优秀的知识载体，跟领域知识保持有效的同步。既可以用领域知识检查代码写得对不对，也可以从代码中准确地反推领域知识。

有个不错的比喻可以说明这点，在《吐槽大会》中，李诞吐槽张艺兴 “唱跳第一人” 的 Title，说：唱也不是第一，跳也不是第一，但唱跳是第一。

DDD 也是类似，在团队沟通和协作的科学模式上，DDD 没有可靠理论支撑；在写代码的技术上，DDD 缺乏明确的做法 。但在强调团队沟通得到的领域模型，跟软件开发里的代码模型的匹配关系上，DDD 就成立了，就有了它的独特性和竞争力。

**1.2、第二类误解是，认为 DDD 即便跟代码有关，代码的编写也是比较自由的，可以选择不同的架构模式、编程语言和代码风格。**  

尽管可以在不同编程语言下实现 DDD ，但它们都需要满足——代码必须反映领域知识——这个要求。DDD 代码并不是随意编写的。  

传统的 OOP 语言的 DDD 代码实践，并不能很好地达到用代码反映领域知识的目标。在这方面，函数式语言（FP）大放异彩。  

在《Domain Modeling Made Functional: Tackle Software Complexity with Domain-Driven Design and F#》中 _[4]_，作者 Scott Wlaschin 介绍了用函数式语言 F# 实现 DDD 的方式。

我在[《用 DDD(领域驱动设计) 和 ADT(代数数据类型) 提升代码质量》](http://mp.weixin.qq.com/s?__biz=MzA4Njc2MTE3Ng==&mid=2456151799&idx=1&sn=09b5255fb59ad57c6a7830486981088e&chksm=88528d40bf250456b67df3994e4079a941e6c75409545c97c973b6768e5e3cf1e56683f63434&scene=21#wechat_redirect)中着重介绍过，感兴趣的同学可以先阅读该文章。

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwnakIFJkcPIx4vHBCfIDC4GTIfXyvGUsAdR2oGQBiaYf66M4zj7tmVL2Tm8z96yDxoP8b1Ln16DB0fQ/640?wx_fmt=png)

其核心依据就是——柯里 - 霍华德同构 (Curry–Howard isomorphism)_[5]_。

*   命题即类型 (Propositions as Types)
    
*   证明即程序 (Proofs as Programs)
    
*   Type-Driven Development(类型驱动开发)
    
*   用类型去表达领域知识 (领域里的真命题)
    
*   代码即知识  
    

我们可以看到，没有良好的 Sum Type 支持的语言，缺乏有效的语言特性去编码领域知识。这正是过去进二十年，OOP 里的 DDD 代码实践进展缓慢的原因之一。  

随着 FP 语言 / 特性的崛起，DDD 代码实践将焕发第二春。甚至有开发者认为，之前 DDD 所谓的 Ubiquitous Language 是一种模糊的说法，不同团队之间有不尽相同的描述方式，缺乏明确的规范。因此，他们认为可以选择 Type System 作为 Ubiquitous Language  的表达规范。也就是，用类型的语言去刻画领域知识。

类型的语言，尽管也算代码的一部分，但它是更宏观的、简洁的、非开发者也容易掌握的语言。

Scott Wlaschin 在 2020 年做的一次 DDD 技术分享《Domain Modeling with FP 》中有两张有趣的 Slides _[6]_。

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwnYlgic5dQyhpuG5TNK8ibWNAQhyYzQkmb07PBsIpNNsMo1basArS7EdB54Tx7vibAPfaYjdXuqSprpUw/640?wx_fmt=png)

非开发者认为代码就是像上面那样。

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwnYlgic5dQyhpuG5TNK8ibWNAQpapVMhCfkbia4pG9A2e4BNQEem0gj4ic6LG750ocpqqUk90wdYdskt9A/640?wx_fmt=png)

实际上，代码也可以像上面那样，用类型的语言作为 Shared Language 表达领域知识。

总的来说，DDD 代码实践不是任意的，是在 TypeDD（类型驱动开发） 模式下用 ADT（代数数据类型）准确表达领域知识的过程。

类型系统不够完善，缺乏对 ADT 良好支持的语言中，DDD 代码实践将难以有效展开。

**1.3、第三类误解是，认为 DDD 即便跟代码有关，也主要是后端代码，跟前端没什么关系。**

前端 / 后端，某种意义上只是代码运行的位置和设备不同。很难想象，同一段 JavaScript 代码，运行在 Node.js 上时它可以属于 DDD，运行在 Browser/APP 上时它却不属于 DDD 了。

其实 DDD 跟代码在哪里运行无关，跟业务逻辑有关。

当我们的业务逻辑，放在服务端完成，由后端工程师跟进编写，DDD 就发生在了后端。

当我们的业务逻辑，放在前端完成，由前端工程师跟进编写，DDD 就发生在了前端。

DDD 在前端和后端中，也不是互斥的。它们可以同时成立，只要它们都承担着足够的业务逻辑。

我们正处于一种大趋势中，前端层面开始承担越发重要的作用，其代码量、业务逻辑复杂度都在急剧增加。DDD 开发模式，对前端的价值也与日俱增了。

在软件发展过程中，不断涌现新维度的复杂度，编译器、操作系统、桌面软件、互联网乃至物联网……

而过去二三十年互联网里的复杂度，又可以粗略划分出两个部分：  

第一部分是重 Data Providers 的阶段，现实世界中的信息开始不断上传到数字世界，被放到各种储存软件中统筹管理。数据库和后端服务等技术是核心。

第二部分则是重 Data Consumers 的阶段，各种终端（如手机、手表、头戴设备等）不断强化了用户消费数据的方式和体验。在这个阶段，前端的重要性不断提升，其复杂性也将不断增加。

DDD 之所以在 2003 年由 Evans Eric 围绕后端实践整理出来，并非由于 DDD 跟后端有什么天然的绑定关系。而是 Evans Eric 恰好踩在了后端技术复杂度的上涨趋势中。

而现在，软件复杂度在前端也开始爆发，是时候引入 DDD 来优化前端项目了。

**1.4、第四类误解是，DDD 是 CTO 和架构师的工作，跟普通开发者无关**

其实 DDD 可以分为两类：

*   狭义 DDD，围绕企业盈利逻辑的软件需求  
    
*   广义 DDD，围绕我们关心的特定领域问题
    

许多开发者所理解的 DDD 是狭义的，这是因为他们阅读的大部分 DDD 书籍，都是以企业的软件需求为主要案例。  

比如他们会把跟企业核心竞争力有关的盈利逻辑，称之为核心子域（Core Suddomain）。把非核心的，又根据通用性分成——通用子域（generic subdomain）和支撑子域（Supporting Subdomain）。

其中，核心子域是企业的核心竞争力所在，值得我们投入最强的开发资源。

而通用子域（比如开发票、UV 流量统计分析等需求），可以购买成熟第三方服务或者外包出去。  

至于支撑子域的软件需求，可能是该企业的定制需求，不容易购买到现成方案。这类软件被认为可以交给经验不那么丰富的开发者完成，或者干脆也外包出去。

很明显，其实上述分析不局限于企业维度。在所有软件开发中，我们都可以挖掘出它们自己的核心子域、通用子域和支撑子域，对应的就是核心代码、库 / 框架 / 中间件代码（通用性），以及非核心代码（支撑性）。

这就进入了广义 DDD 的范畴。DDD 不只跟企业里的 CTO 和架构师有关系，跟每一位软件工程师都有关系。在宏观和微观的各个 Scope 里，DDD 都可以发挥作用。

DDD 的核心是——领域知识和代码逻辑的同构；服务于让代码反映真实的领域需求，从而提高交付的软件质量。它并未限定其它条件。

在业务领域，开发团队和领域专家往往是两拨人；然而在技术领域，开发团队同时就是该领域的专家本身，因此不容易被看到 DDD 战略设计中团队协作的环节，但不意味着 DDD 不存在。

不只是两个团队之间需要通过沟通建立通用语言，在一个团队内，不同成员之间，也需要如此同步起来。

著名函数式编程语言 Haskell 的编译器 GHC，最近做了一些重构改进。他们在《Modularizing GHC》_[7]_ 的第四部分 "Refactoring GHC using Domain-Driven Design" 说到：

> GHC 缺乏 ubiquitous language：一些用于描述领域模型的词汇是模糊的，或者使用不一致，甚至在 GHC 开发者之间也是如此。

> GHC lacks an ubiquitous language: some words used to describe the domain model are ambiguous or are not used consistently, even among GHC developers.

> 我们将引用 Eric Evans 的《领域驱动设计：解决软件核心的复杂性》中的一些内容。这本书 介绍了 "领域驱动设计" 的概念和原则。这些原则与我们在 GHC 中要解决的问题非常相关。

> We will quote several excerpts from “Domain-Driven Design: Tackling Complexity in heart of Software” by Eric Evans. This book introduced "Domain-Driven Design" concept and principles which prove to be very relevant to the issues we want to solve in GHC.

GHC 既不是前端应用，也不是后端应用，更是跟商业模型无关，它是一门编程语言的编译器。但 GHC 的开发团队， 依然采用了 DDD 的理念，去解决和优化他们遇到的问题。

DDD 的适用性，远比一些开发者想象的要广。既可以宏观到企业级维度，也可以微观到普通的业务模块里的代码。  

每当前端工程师在代码库里，重复实现 lodash 的某些方法时，核心子域和通用子域的区分，就可以带来启发：应该将主要精力放在我们关心的核心领域问题上，底层通用问题则优先使用成熟开源方案，除非有别的必要性。

**小结**  

DDD 是一种端到端全链路考量软件设计的模式，致力于在每一个关键环节提升质量、降低复杂度。  

*   DDD 有两个阶段：战略设计和战术设计。
    
*   DDD 战略设计的核心是通过有效的团队协作，划分边界上下文（Bounded-Context），构建团队通用语言（Ubiquitous Language）。
    
*   DDD 战略设计为其战术设计部分提供了可靠的领域知识 / 业务模型。
    
*   DDD 战术设计的理论依据是——柯里 - 霍华德同构 (Curry–Howard isomorphism)，它提供了用类型代码表达领域知识的方法。
    
*   DDD 分为狭义和广义两种，广义 DDD 可普惠软件工程的所有层面，不局限于系统架构和商业模型等宏观层次。  
    

**2、DDD 框架的必要性和必然性**  

前面我们介绍了 DDD 需要跟写代码有关，代码需要反映领域知识，需要使用来自 Ubiquitous Language 里的词汇。

就像《Modularizing GHC》里说的：

> 4.1 Ubiquitous Language and Type-Driven Design 
> 
> 通用语言原则，包括在代码中、在文档中、在对话中，一致的且精确的使用领域术语。在 Haskell 中，我们可以扩展这一原则，要求领域术语在 Type-Level 中体现出来：type-driven design（类型驱动设计）。通过这种方式，函数接口就能反映通用语言里的意图，并且可以被 type-checker 检查。

我们主要是用 type 去表达领域知识，而 type 属于编程语言特性。那么，我们还需要什么 DDD 框架吗？  

DDD 框架能提供什么帮助呢？

问题的关键在于，Haskell 的 type system（类型系统）远比当前工业界的主流编程语言强大，但即便如此，很多领域知识，在 Haskell 里都难以表达。需要更完备的 Dependent type _[8]_（依赖类型）特性的支持。

DDD 框架发挥作用的地方就在于，它可以补充一门编程语言的类型系统所不能覆盖的部分。

举个例子，假设我们要对旅客（Traveller）进行建模，通过跟旅游行业的领域专家们的沟通，我们得到了对旅客的一些认识，我们简化如下：  

1.  有两种旅客：成人旅客和未成年旅客
    
2.  所有旅客都需要提供姓名和年龄
    
3.  年龄大于等于 18 的为成人旅客  
    
4.  成人旅客必须提供联系方式
    
5.  未成年旅客可以提供，也可以不提供联系方式  
    

这几条非常简单和常见的业务规则，就已经超出了很多编程语言的 type system 的表达能力了。我们尝试用 TypeScript 代码来表达，如下所示：

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwnYKxEf0agQibVSkL8aYyicOrd5dXOibDttNej5AUXoIwdBzAD6UdhmcKOGmnYE7Snia1cMgutmrhhfg4w/640?wx_fmt=png)

我们用 Union type 表达了互斥的两种 Traveler，分别是 AdultTraveler 表达成人旅客，ChildTraveler 表达未成年旅客，满足了规则①。

AdultTraveler 和 ChildTraveler 都有 name 和 age 字段，满足了规则②。  

AdultTraveler 的 contact 字段是必选的，满足了规则④。

ChildTraveler 的 concatc 字段是可选的，满足了规则⑤。

然而，平平无奇的规则③，其实在类型上很难表达。  

它要求 AdultTraveler 的 age 必须是大于等于 18 的正整数，而不能是小于 18 的正整数。

它要求 ChildTraveler 的 age 必须是小于 18 的正整数，而不能是大于等于 18 的正整数。  

这种类型表达能力，需要引入 Refinement types _[8]_ 或者 Dependent types。

其中，Refinement types 提供的特性是，在给定类型的基础上可以做一些精细化的范围判断。

比如，在论文《Refinement Types for TypeScript》_[10]_ 中，作者们尝试给 TypeScript 添加了 Refinement types 特性。  

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwnYSKYB2zgTVlC8vQIIkQmj6bare1xQV7FOIXzrqNSIsXxLHA5C77gS1X3zCd28ibA0pJoicBfuiagWXA/640?wx_fmt=png)

如上所示，他们用 | 将类型表达式分割成两部分：type 标注和 predicate 判断。

比如，nat 是一个 number 类型，它的取值范围受到了精细约束，必须 >= 0。而 pos 则是指正数，需要大于 0。

显然，通过同样的方式，我们也可以定义出 AdultAge 和 ChildAge 两个类型。  

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwnYKxEf0agQibVSkL8aYyicOrdHCvK7ZkJtZACSmXHjMicO0iaiasQVZtSiaqzOUj0AtI0zBCoDUYAyia15icQ/640?wx_fmt=png)

对于 AdultAge，只允许大于等于 18 的数字，其它数字或类型，都会报类型错误，无法通过 type-check。ChildAdult 同理。

可惜，从图中飘红的波浪线来看，很明显 TypeScript 并未实现该特性。  

我们很难在 type-level 表达出成人年龄，不仅约束不了它必须大于等于 18，  

甚至还不能约束它必须是个整数。即便有开发者设置它为小数，TypeScript 也不会有任何异议。

TypeScript 的类型系统，在主流编程语言中，其实已经算是比较强大的一个了。当我们无法在 type-level 编码领域知识时，我们应该怎么办？  

我们可以使用 DDD 框架，作为补充。

其中 CQRS_[11]_ 是一个非常实用的模式。  

**2.1、Command Query Responsibility Segregation(CQRS)**

CQRS 的全称是命令查询职责分离，它受到了 OOP 里命令与查询分离 (Command Query Separation, CQS) 的启发，由开发者 Greg Young 在 2010 年提出。

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwnYelRsjK4LJ7R5HkyYyn3dTTYLyjrT57zBDo3C3huFNHiaUh0rXFuC9nWRGzicq00xs4jUylptGQxew/640?wx_fmt=png)

在后端 CQRS 实践中，常常将 Data Storage 配置成两组。一组只读（Read Database），另一组则支持写入（Write Database）。然后在两者之间进行同步。通过对数据库的读写分离，增加应用 Scale 的能力。

因此，很多后端开发者容易误解 CQRS 的核心是数据库的读写分离，所以一定得是两组数据库，而不能让 Query Model 和 Command Model 访问同一个数据库。

Event Store 网站的文章《A Beginner's Guide to CQRS》里 _[12]_，对此有专门的澄清。

> "命令和查询需要在不同的数据库上运行，一切都必须存储在不同的数据库中。"
> 
> 不必然如此，只有两者的行为和责任应该分开。(...) 并不要求它们在不同的数据库中。

> "Commands and queries need to be run on separate databases, and everything must be stored in separate databases."
> 
> This isn’t necessarily true; only the behaviours and responsibilities for both should be separated.(...)It is not a requirement that they are in separate databases.

不仅如此，CQRS 甚至不要求数据库.

> 在此基础上扩展，CQRS 甚至不需要使用数据库。它可以通过 Excel 电子表格或其他任何含有数据的东西来运行。

> Expanding on this, CQRS doesn’t even have to use a database: It could be run off an Excel spreadsheet, or anything else containing data.

我们可以将上述 CQRS 提炼更抽象的软件设计模式，脱离具体的存储实现（数据库）和具体的消费者（UI）。  

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwnYSKYB2zgTVlC8vQIIkQmj6TxukepVuCtKzTxIVQzvVbPyhyAg82etsFaDuyJFnLP8QT8e5iatJofg/640?wx_fmt=png)

如上所示，在 Data Consumers（数据消费者）和 Data Storage（数据储存）之间，我们架起了两个中间层：Command Model 和 Query Model。

其中，Command Model 主要负责提供数据写入的能力，Query Model 主要负责提供数据查询的能力。

Data Consuemrs 可以是 UI，也可以是别的数据消费者。可以只有一个，也可以有多个。  

Data Storage 可以是数据库（在后端的 CQRS 中），也可以是别的存储抽象（如在前端中的 Store）。当它是数据库时，可以只有一个，也可以有两个甚至更多。

CQRS 模式能带来什么？我们还是以前面 Traveller 为例。

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwnYKxEf0agQibVSkL8aYyicOrdfORfiaIXQRTt6A3rBbnSQSPLbrqlx9UvbprhZmMvevyQRJpRjnbTjTg/640?wx_fmt=png)

如上所示，我们创建了一个 Traveler 函数，它有一个局部变量 traveler 保存着旅客信息，外部不能直接访问该数据。  

我们封装了两类函数，其中 updateTraveler 属于 Command 性质，而 getTraveler 则属于 Query 性质。所有对 traveler 变量的更新操作，都得通过 command 函数，所有对 traveler 得读取操作，都得通过 query 函数。

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwnYKxEf0agQibVSkL8aYyicOrdibxaVUbts3dT07tDarGxXt53XQAp31iaU0LezHF2ZWLTHyoEzHV4FWXA/640?wx_fmt=png)

在 updateTraveler command 函数中，我们根据 AdultTraveler 规则对参数们进行了验证，只有满足条件的情况下，traveler 会被赋值为 AdultTraveler，否则将抛出错误信息。

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwnYKxEf0agQibVSkL8aYyicOrddra3cbIXy1QeV6KTPcxpeZbnwYPiaTW3FUfHtsCZGYqPxko6jZ6PvRw/640?wx_fmt=png)

在 getTraveler query 函数中，我们也应用了 AdultTraveler 领域规则，进行了判空和验证。

上面是极其简单和简化的场景，旨在让我们清晰地看到 Command Model 和 Query Model 分别贡献了什么价值。  

*   Command Model 保证了只有合法的数据能够写入 Data Storage，拒绝外部非法的数据的侵入
    
*   Query Model 保证了合法的数据能够被查询出来，拒绝底层非法数据的泄露  
    

当 Type System 表达能力达不到要求，Type-Checker 无法帮助我们在 Compile-Time（编译期）拒绝某些参数或赋值，我们通过 CQRS 模式自行在 Runtime（运行时）主动拒绝某些参数或赋值。  

Domain rules（领域规则），要么出现在 Compile-Time，要么则在 Runtime。并且，它应当优先放到 Compile-Time，让开发者可以更早察觉潜在的问题。  

上面的 Traveler 案例是简化的，并且只需要处理它自身的领域逻辑即可。然而，整个软件应用通常是复杂的，由多个组成部分有机整合起来的。我们的 Query Model 不只是服务于一个数据源，可以是很多个数据源，并且 queries 之间还可能存在联动的依赖关系。Command Model 同理，多个 commands 之间可能存在复杂的调用关系，更新多个数据源。

DDD 框架的必要性和必然性在此体现为：  

*   主流编程语言类型系统不够强大，需要通过 CQRS 等模式在 Runtime 进行补充，守护业务逻辑的一致性和完整性。
    
*   模块化的 CQRS 不是简单的事情，只靠编程语言提供的基础特性，很难满足要求，需要引入精心设计的框架，系统性地提供便利性和保证机制。
    

**2.2、Domain Events（领域事件）**  

在 Traveler 的案例中，遇到错误的参数时，我们通过 throw error 抛出了错误，这是一个简陋的做法。

当 Consumer（消费者）调用一个 Commmand 函数时，它是一个 Function-Call（函数调用）行为，它属于 one-to-one（一对一）的消息传递。即，Caller 向 Callee 提供参数，Callee 向 Caller 提供返回值或者抛出错误。  

Consumer 是 Command Caller，并且每次 Command 有且只有一个 Caller。那么问题来了，其它 Consumers 如果关心领域内的某些关键行为和事件，它们如何获知？  

其它消费者无法通过订阅数据 / 状态变化来获知特定事件，因为当 Command 遇到非法参数，不会更新状态，而是抛出错误。

  
但只有它的 Caller 能捕获该错误，只有它的 Caller 能够响应这个领域事件。这是不合理的。

Domain Event：领域内已发生的特定事件。它们应当能被所有关心该事件的消费者所订阅。

因此，Command Model 除了具备更新底层数据的职责以外，还应拓展新的职责——发布领域事件。即，Command Model 具备两种能力。

1.  更新数据
    
2.  发布事件  
    

发布事件的能力，将导致新的事物——Event Model（事件模型）。  

因此，符合 DDD 要求的 CQRS 将扩充为——CQRS & Event。

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwnYKxEf0agQibVSkL8aYyicOrdicBKmSrYPsG6jKVqrktric3MFlYwECDgIvnpTYMMoXGztVLfLe6lYSmQ/640?wx_fmt=png)

如上所示，我们引入了 Event-Model，它只跟 Consumers 和 Command Model 之间有关系。也就是说：

1.  Command Model 内可以发布 Event，可以更新 Storages
    
2.  Event Model 内可以发送 Command，但不能直接更新 Storages
    
3.  Consumers 可以订阅 Event，但不能发布 Event
    

限制 Consumers 不能发布领域事件的原因是，领域事件是在特定领域状态和条件下有业务含义的事件，不是技术意义上通用的事件。如果允许在领域外部随意发布，则很容易构造非法事件出来。

因此，领域事件不能在领域外部随意发布，总是需要通过 Command 的验证。

**2.3、Domain Effects（领域副作用）**

尽管我们引入了 Domain Events，支持了一对多的事件派发，但仍有一些领域问题未能覆盖——Time(时间) 和 Self-Driven(自驱)。  

很多领域问题，不只是关于更新数据或事件通讯，也跟时间有关，并且是自驱的。自驱是指，领域内的数据和行为可以自我驱动，不需要外部发送 Commands 也能运转。

比如：

*   2 秒内多次发布指令以最后一次为准（防抖，Debounce）  
    
*   2 秒内不能多次响应指令（节流，Throttle）
    
*   红绿灯（倒计时，Count-down；自驱动，Self-Driven）
    
*   复杂动画交互（动画，Animation）
    
*   当 A 事件发生后，如果 B 时间内 C 事件不发生，则发送 D 指令 (时间相关的条件事件，Time-related conditional events)
    

CQRS & Event 模式，很难表达上述领域逻辑，往往需要泄露给 Consumer-side，让消费端去不断发送 Commands 以驱动领域内部发生变化。  

这是不合理的，领域模型不只是数据模型和通讯模型，还包括行为模型。

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwnYxibQAwic98e0dp3icHX6T3jzAxrOeFh8v3C4IUGPLCj4d8OAN9alFopzWtUicSCXgEucibY2EicpR11pA/640?wx_fmt=png)

我们可以引入——Domain Effects（领域副作用）。

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwnYxibQAwic98e0dp3icHX6T3jzq2lbpu8bp8QClmYtMt1RAXO29icj8mhU0M5U1MGHbvz48qFocMBNQVw/640?wx_fmt=png)

如上所示，我们新增了 Effect Model（副作用模型），它具备以下职责：

*   对接 Timer, AnimationFrame, WebSocket 等 IO/Side-Effects  
    
*   订阅领域事件
    
*   发布领域事件
    
*   发送指令
    

以红绿灯为例，之前我们只能提供 TrafficLight 的 Data Model 和 Event Model，需要外部消费者自行去倒计时，发送 TurnNextCommand 转换颜色，然后发布 TurnedEvent 表达 “切换了” 事件。  

倒计时是红绿灯的核心逻辑，它不应当由外部消费者处理。

有了 Effect Model，我们的 Domain Model 更加完整，可以实现内驱循环的复杂行为。

因此，TrafficLight 模块不再需要外部消费者驱动，Effect Model 将订阅在 StartCountDownEvent 事件，启动定时器这一副作用，每秒发布 CountDownCommand 更新 Data Model，最后发布 CountDownCompletedEvent 事件表达结束。

  
整个行为过程，不需要外部消费者的介入，是领域内部活动。  

通过 CQRS & Event & Effect 模型，我们得到了更完整领域建模工具。

**小结**  

DDD 框架不是随意的发明设计，而是基于完整表达 DDD 意义上的领域知识的目标所作的推导结果。

*   主流编程语言的类型系统，不足以在类型层面充分表达领域知识（需要使用很多 Dependent types 特性），导致特定 DDD 开发框架的出现，有其必要性和必然性
    
*   在代码中内聚地表达领域模型，涉及三大要素：数据模型、通讯模型和行为模型
    
*   CQRS 模式可以优化 Data Model，使数据的读写更符合业务模型 / 领域规则的要求，更少非法状态的写入和读取。
    
*   一对一的 Command Model 无法满足 Domain Events 一对多的需求，有必要引入 Event Model。
    
*   处理时间和自驱动相关的领域逻辑，需要引入 Domain Effects 概念，构建 Effect Model。
    
*   CQRS & Event & Effect 架构可以有效地表达 Domain Model(领域模型) 在数据、通讯和副作用等多方面的要素。
    
*   缺少 Query & Command & Event & Effect 等任意要素的开发框架，都将导致领域逻辑的泄露，增加下游消费者的代码复杂度。
    

**3、用 CQRS & Event & Effect 重新审视流行的前端 State-Management 方案**

我们可以用 CQRS & Event & Effect 模式的视角，重新审视当下或之前流行过的 State-Management 方案，会得到一些有趣的洞察。

对于每个状态管理方案，我们都会问：

1.  它有 Command Model 隔离外部对数据模型的直接操作吗？
    
2.  它有 Query Model 隔离外部对数据模型的直接查询吗？
    
3.  它有 Event Model 向多个外部订阅者发布领域事件吗？
    
4.  它有 Effect Model 可以内部自我驱动和执行副作用吗？
    

**3.1 Redux** 

首先是 Redux，它主要包含了 Action, Reducer, State/Store, Middleware 等概念。

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwnYxibQAwic98e0dp3icHX6T3jz6aH4adRXax5fjiaarf8RUExEN5MZeIa5U0LA1mzO9ia7EoYmfSibaZC7A/640?wx_fmt=png)

如上图所示，View 属于 Consumers（消费者）角色，它可以 subscribe 订阅 store 的状态变化，然后通过 store.getState() 获取全部状态。  

也就是说，Redux 缺乏 Query Model，它的底层数据模型对外部消费者是完全暴露的。

外部消费者可以 dispatch 一个 action 到 store，经过 store 内部的 reducer(state, action) 后，产生一个 next-state，并触发状态变更。  

也就是说，Redux 具备 Command Model 的部分特征，即不能直接更新状态，需要通过一道抽象层。之所以说是部分特征，是因为 Command Model 可以发布领域事件，而 Redux 没有事件概念。

这就导致，Reducer 接收到一个 Invalid Action 时，它除了直接 return currentState 以外，并不能做什么。而状态没有变化，外部消费者就不会得到通知，直接就静默了。这是不合理的。

这将导致领域逻辑的泄露。比如，每一个外部消费者在 dispatch(action) 之前，需要先自行校验一下 action 的有效性，自行根据校验结果，选择 dispatch 还是 emit(event) 或者响应别的行为。

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwnYxibQAwic98e0dp3icHX6T3jzLdfuptGiboFFhIHeH90jWIvZOt1NkVXAuaIDpNHesgxn3P5TSnDfLQw/640?wx_fmt=png)

如上图所示，粉色圆圈代表代码逻辑。左侧是正确的处理方式是，上游（这里是领域模型）处理一次，所有下游（这里是外部消费者）都复用同一份逻辑。右侧是错误的处理方式，上游逻辑泄露给下游，每个下游消费者，都需要重复实现同一份逻辑处理。任意一个下游消费者，忘记处理，或者处理方式跟其它同层消费者不一致时，Bug 就产生了。  

可能有开发者会机智地想到，用 State 来代替 Event。即，新增一个状态属性，比如 status 去额外表达 Invalid action 的处理。这样 Reducer 就不用静默了，它可以返回新的 status，外部消费者都能得到状态变更的通知。也就是说，用 StateChangedEvent 这个特定事件，来表达更广泛的 Domain Events。

这将遇到 State 和 Event 的本质差异带来的一些问题。

比如，发送两次相同的 invalid action，产生两次相同的 state.status 状态时，状态不变，则不会触发 StateChangedEvent，但两次相同的 Event 不能像 State 一样折叠为一次。比如 ClickEvent。

比如，state 中混入了 event 相关的节点，在做 time-travel 时，event 随着 state 变化而不断重新触发，这是不合理的。状态的回滚，不意味着发生着事件。  

Event 并非特殊的 State，它可以重复多次，它的持久化的策略和方式跟业务数据也不同。强行用 StateChangedEvent 模拟出 Event Model 实属下策，不如独立实现。

说完 Redux 里的 Event Model，我们再来看 Effect Model 部分。Redux 里的 reducer 是 pure function，不能包含副作用。它提供了 Middleware（中间件）机制，可以捕获 action，对接 IO/Side-Effects 相关的模块。

其中的 Redux-Observable 库是一个不错的 Event Model & Effect Model 补充，可以跟 Redux 配合，组成 Commmand Model & Event Model & Effect Model 模型。  

**3.2、Recoil**  

Recoil 是 Meta 在 2020 年开源的 React 状态管理库。它的有趣之处在于，跟 Redux 相反，它拥有出色的 Query Model，但把 Command Model 外包给了 React 处理。

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwnYxibQAwic98e0dp3icHX6T3jzoSrXhUgaMLdoRhrcrMmW4Zh868650PZ5TY7G2H4HnvXoYB5EGsiaHQg/640?wx_fmt=png)

它实现了 Data-Flow Graph 可以不断从 atom/selector 中派生出新的 selector。它的 selector 概念，就起着 Query Model 的作用。

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwnYxibQAwic98e0dp3icHX6T3jzqFJJjQM1vBkic4Bia6hibdSmDEB775tLXX05Jtx4BjAWicJ02Ijv9pMjhg/640?wx_fmt=png)

如上图所示，Recoil 的基本用法是，通过 atom 定义底层原子 state，通过 selector 去不断地派生出 query。  

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwnYxibQAwic98e0dp3icHX6T3jzQ1LG9hm3mUQiaTwT6CM20picksLyPNkib8B8CBScs9uyn29via5E91UyPg/640?wx_fmt=png)

  
Recoil 提供了 Atom Effects 概念，可以通过 atom 的 effects 选项，添加 onSet 等事件的订阅，并执行一些副作用。

从 DDD 导向的 CQRS & Event & Effect 模型来看，Recoil 缺乏 Command Model，泄漏给了 React 这个消费者。

*   useSetRecoilState 可以在 react 中获取到更新任意 atom state 的函数。
    
*   useRecoilState 可以在 react 中获取到访问任意 atom state 的函数。
    

Recoil 自身没有提供隔离 atom state 的直接 get/set 的机制。从 DDD 的角度，开发者很容易在使用 Recoil 的过程中，未经验证地写入非法状态，或者未经验证地读取到底层非法状态。  

需要精心地额外管理和组织 Recoil 代码，比如用过模块的 export 来管理和隐藏 atom effect，只暴露特定 react-hooks 封装，去作为 Command Model。  

**3.3、Rxjs**  

有相当部分的开发者，将 Rxjs 视为终极状态管理方案。

因为熟悉 Rxjs 的开发者，很容易看出，将 Rxjs 的 subject + scan 组合起来，就可以模拟 redux 的 reducer 行为。将 subject + share + combineLatest 组合起来，就可以模拟 recoil 的 selector 行为。

然而，Rxjs 缺乏 State-Management 的很多条件，很难作为状态管理的核心角色，更适合作为 Event Management(事件管理) 和 Effect Management(副作用管理)。即前面所述的 Event Model 和 Effect Model 部分。

原因如下：

**3.3.1、缺乏 Query 机制**  

Rxjs 的核心概念——Observable，它的消费方式是通过 subscriber 或 operator。它们都是被动等待上游推送数据。

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwnbkSrc91j0We42zIng3nCm1jYEn7DKc0ZMhqcaHOdgJjNrsAddFQ8DyrDh0zxd8frF3fBFwLT5e1Q/640?wx_fmt=png)

如上所示，当用户点击页面文档时，数据沿着 operators 执行和转换，流向最末端的 subscriber。

这就是 push-based 的特征，而 Query 查询动作，包含 pull-based 的需求。也就是说，外部消费者希望随时可以主动地通过 query 探查数据，了解当前的系统状态，而不只是被动等待。

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwna4h9xdP7AMRy9Sic8FydZ5j9J8QqGok9RcjLnsmujiaajsL75gsAbicia5aVVkUBhTUKksLX11rTbkww/640?wx_fmt=png)

为满足该需求，可以基于 rxjs 建立 snapshot 机制，即总有一个可被 pull/query 的状态快照在旁边等候着，当新的数据进来时，该快照也得到同步更新。  

**3.3.2、缺乏 Transaction 机制**

在《A Survey on Reactive Programming》_[13]_ 中，作者们从 6 大维度对比了多种 Reactive Programming 实践。其中有个 Case 是这样的：

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwna4h9xdP7AMRy9Sic8FydZ5jw6H1icGdR3YiaCOKLaIIZUwTmPuX47p62bF5QONWMuh0DR4vrHuHMAtA/640?wx_fmt=png)

var1 是数据源，var2 依赖 var1，var3 依赖 var2 和 var1。  

*   从浅层依赖来看，var3 依赖 var2 和 var1 各一次。
    
*   从深层依赖来看， var3 依赖 var1 两次，一次是直接依赖，一次是间接依赖 (通过 var2)
    

那么，当 var1 发生变化，var3 有可能被更新两次，第一次是最新的 var1 和旧的 var2，第二次是最新的 var1 和最新的 var2。这取决于 var3 背后的依赖节点的计算顺序。

显然，最新的 var1 和旧的 var2 所计算出的 var3，是我们所不预期的。如果一个 Reactive Programming 方案可以避免该现象，作者们称之为——Glitch Avoidance。

用 Rxjs 表达上述计算，代码如下：   

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwna4h9xdP7AMRy9Sic8FydZ5jiaSvq9SU9vbfFNjORIy8qgiaWG7ufXmpN4NDWuK3bmzibCJ0xaTSMQtjg/640?wx_fmt=png)

var1 有两个值：1 和 2。如果 var3 被执行 2 次，则满足 Glitch Avoidance；如果执行 3 次，则不满足。

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwna4h9xdP7AMRy9Sic8FydZ5jyoD2RsyvEkps1m0akg4LARAZgZohGAeUPyCic8oY2o18ibH3BiaC7vI3A/640?wx_fmt=png)

执行结果如上，Rxjs 没有实现 Glitch Avoidance，它会过度响应数据变化。

这对于 State-Management 来说很危险，状态管理需要可靠的 Transaction 机制。也就是说，可以将有内在关联的 state updates 在同一批次中完成。在所有状态更新之前，不会有 Event 被发出，不会有 Subscriber 被调用，以避免中间不一致的数据暴露出去，产生意料之外的行为。

比如银行转账动作，转出账户、转入账户和金额，是 3 个有内在关联的数据，不管是过度反应（转账多次），还是中间不一致数据状态泄露（转错账户或者金额），都是不可接受的。

在 Recoil 中，同类的计算的代码如下：

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwna4h9xdP7AMRy9Sic8FydZ5jgzCg0exPDVp9aJmMJSvTeJrQRKSnqvZwsXWaW7HJ8pRtd2qJiaSkUnQ/640?wx_fmt=png)

var1 是 atom 数据源，用 selector 实现 var2 和 var3。

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwna4h9xdP7AMRy9Sic8FydZ5jNF3CIx7k3PbMRjSVNcqH9UpwxEHniaibaplAUGR5OE552VKBAwUL9OOQ/640?wx_fmt=png)

同样是将，var1 从 1 变成 2。Recoil 正确响应了有且只有 2 次，满足 Glitch Avoidance。

不仅如此，Recoil 还额外提供了  useRecoilTransaction API，可以在同一事务批次中，更新多个有内在关联的 atom。

因此，从 Transaction 机制的角度来看，Rxjs 不适合做状态管理，Recoil 相较之下更适合。

当然，我们依然可以基于 Rxjs 去补充额外的 Transaction 机制，就像补充 Snapshot 机制一样。

不过，当我们完成了状态管理所必须的 Query/Transaction 特性时，可能已经相当于独立实现了一套状态管理的核心模型。Rxjs 沦为辅助角色，在 Event & Effect 维度发挥作用，并不能说是在用 Rxjs 做状态管理。

**小结**

我们用 DDD 的 CQRS & Event & Effect 模式，分别分析了在 Redux, Recoil 和 Rxjs 里的情况。我们发现尽管它们各自在某些方面很优秀，但它们都未能充分覆盖到所需的特性。

它们各自的开发思路，也没有明确包含 DDD 的理念，因此可以看到有诸多领域逻辑泄露的地方。

*   Redux 缺乏明确的  Query Model，暴露了底层裸状态，泄露了查询维度  
    
*   Recoil 没有隔离对底层 atom state 的直接操作，泄露 Command Model
    
*   Rxjs 缺乏 Snapshot 和 Transaction，不能提供数据一致性的可靠保证
    

尽管如此，Redux, Recoil 和 Rxjs 为我们提供了实现 CQRS & Event & Effect 的巨大启发。

Remesh 萌芽于此。

**4、Remesh**  

Remesh 是基于 CQRS 的 DDD 框架，为复杂 TypeScript/JavaScript 应用而生。

**4.1、Remesh 简单介绍**

它的主要灵感来源如下：

*   Domain-Driven-Design 启发了 Remesh 的概念模型
    
*   CQRS/ES 启发了架构模型
    
*   Redux 启发了 command 模型的实现
    
*   Recoil 启发了 query 模型的实现
    
*   Rxjs 启发了 event 模型的实现
    

它的核心特性如下：

*   DDD 原则
    
*   CQRS 架构
    
*   Event-driven 架构
    
*   增量更新
    
*   反应式编程
    
*   可变状态
    
*   类型友好的 APIs
    
*   框架无关 (官方支持 React/Vue)
    
*   支持 SSR
    
*   支持多人协作 (提供官方 yjs 集成)
    
*   支持时间旅行 / Undo/Redo（借助 remesh/modules/history）
    

它完整实现了 DDD 所需的 CQRS & Event & Effect 的模式。  

在 Remesh 中，一个 domain 就像你的应用中的一个 component, 不过它不是关于 UI 的, 而是关于你的业务逻辑。

我们可以将 Domain 所有相关的事物封装和内聚到一起，用下面 5 个概念去表达：

*   Domain States: 你希望存储在 domain 中的状态.
    
*   Domain Queries: 查询 states, 或者驱动另一个 query.
    
*   Domain Commands: 更新 states, 或 emit events, 或什么都不做.
    
*   Domain Effects: 一个可观察对象 (observable), 用于执行副作用, 发送 commands 或者 events.
    
*   Domain Events: 指明 domain 中会发生的某些事情.
    

对于任意 domain 而言, 只有 domain-query, domain-command, domain-event 可以被暴露出去，分别表达查询、命令和事件。

domain-state 既不会被暴露出去, 也不能在 domain 以外被直接访问。

对于 domains 的消费方而言：

*   唯一读取 states 的方式, 是 domain-query, 以此阻止那些无效的读取。
    
*   唯一更新 states 的方式, 是 domain-command, 以此阻止那些无效的更新。
    

用 Remesh 实现前面的表达式问题，代码如下：  

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwna4h9xdP7AMRy9Sic8FydZ5jwFYHp9FpaxkPFMzHo45Rcq6I2tibhMQPAHvia92W8L9XNGKJl99QgibZQ/640?wx_fmt=png)

我们用 Remesh.domain 定义了一个领域，它的 impl 包含该领域的具体实现。  

*   用 domain.state 表达领域背后的底层状态
    
*   用 domain.query 表达对底层状态的查询
    
*   用 domain.command 表达对底层状态的更新
    
*   通过 return 语句表达该领域对外的接口，它只能是 {query, command, event} 的形式  
    

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwna4h9xdP7AMRy9Sic8FydZ5jhXEWiaYBbeRooYpNyUz0qhuSkmiaIRhqCsDsIQKicRm1ahjDgEaS2ic2ow/640?wx_fmt=png)

上面是每个 domain 概念里的具体实现，可以看到，它的 query 部分跟 Recoil 很相似，command 部分跟 redux 很相似。  

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwna4h9xdP7AMRy9Sic8FydZ5jicAlH7HiaPXWyX7dGNQibyzzdADhQQSUsnosMaaV0KNwS7icfJibfXumtCA/640?wx_fmt=png)

将 var1 从 1 更新为 2，输出上面截图里的 2 个值。这意味着 Remesh 实现了 Glitch Avoidance。

除了 State/Query/Command 以外，我们还可以通过 domain.event 去定义领域事件，并在 domain.command 中发布。  

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwna4h9xdP7AMRy9Sic8FydZ5jbXMkrD8yKVdIicJT4ia9ibhqricnpmIOpeK5moyNQem7mQsn45TXxaiccXA/640?wx_fmt=png)

如上所示，外部所有订阅了 CountChangedEvent 的消费者，都可以在 SetCountCommand 被调用后，得到一对多的通知。  

Effect Model 部分，则通过 domain.effect 去表达。  

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwna4h9xdP7AMRy9Sic8FydZ5jshHbMPh57loOugicMQbUQPYurb1ycW8pXibzuicZZgb8T2iauVVEAr4v1Q/640?wx_fmt=png)

如上所示，我们基于 Rxjs 实现了 Effect Model。当 StartEvent 触发后，将启动一个定时器副作用，每 100 毫秒触发一次，发送 ChangeCountByModeCommand。当 StopEvent 被触发时，则停止定时器。

**4.1、Remesh 的优势与场景**

Remesh 在设计阶段，就充分考量了 DDD 的需求，并完整实现了 CQRS & Event & Effect 模式。这意味着，Remesh 开发者更少面临 “因技术上的问题，而被迫泄露领域逻辑到外部” 的情况。  

此外，Remesh 还包含以下特点：

*   模块化: 你不必将你的状态聚合到一起, 它可以原子化的方式被定义和处理, 并可以 `domain.query` 聚合为其它的派生状态.
    
*   高性能: 如果没有订阅, 你的组件不会因 `domain.query` 的变化而重新渲染.
    
*   可维护性: Remesh 提供了一组极具表达能力的 APIs, 鼓励你通过规范的编码方式, 维护业务逻辑, 如此提高代码的可维护性.
    
*   可组合性: 无需仅为你的多个页面构建单一的 domain, 你可以按需定义多个 domain, 并且在一个 domain 中通过 `domain.getDomain(...)` 来访问其它 domains.
    
*   复用性: 你可以编写 remesh 自定义模块以在多个 domains 中复用逻辑, 就像编写 react-hooks 那样.
    
*   可测试性: 你的 Remesh code 是视图无关的, 因此你可以在测试环境下更简单地测试你的业务逻辑.
    
*   可预测性: Remesh 帮助你将业务逻辑划分为 pure 和 effect 部分: pure 部分是纯函数和不可变数据, 它们安全且可预测, 并且构成了你业务逻辑的核心. effect 部分则通过 rxjs 以组合的方式管理副作用, 因此我们可以轻松的控制数据的流向.
    
*   可持续性: 你的业务逻辑并不和你的视图层绑定, 即便你从一个视图库迁移到另一个 (比如从 react 到 vue), 你仍然可以重用所有的 remesh 代码, 并且无需重构或重写即可继续迭代.
    

如果你的场景中，上述特点是重要的，则可以考虑使用 Remesh 优化项目代码。

介绍了 Remesh 这个具体的 DDD 框架案例，我们可以来回答，State-Management 和 DDD 框架之间的差异所在。

**4.2、State-Management 和 DDD 框架之间的差异**  

朴素 State-Management，偏向 Data Model，主要用以管理数据的组织、变更和派生等活动。它往往是纯技术语义的，不要求代码必须匹配领域知识。

通常情况下，状态管理库不提供 Event Model，并且对于 Effect Model，常常只有 Async Effect 去对接 Data fetching 相关的副作用。

而 DDD 框架，则在 State-Management 的基础上，提出了更多要求。  

它要求 Data Model 必须使用 ADT 去匹配领域知识，在 ADT 无法约束的部分，通过 Query Model 去在 Runtime 约束数据查询，通过 Command Model 去在 Runtime 约束数据变更。并且明确需要引入 Event Model 以表达一对多的领域事件概念。它要求引入 Effect Model，表达时间和自驱动等行为。

![](https://mmbiz.qpic.cn/mmbiz_png/PeB3s8AJwna4h9xdP7AMRy9Sic8FydZ5jsXpiaguziaoYRUrtmibfiaNGhGIgeDFdIph2bwKqhEjlS3K8ZnV600xpmw/640?wx_fmt=png)

如上图所示， State-Management 常常落在红色斜纹区域，即主要是 Data Model 和少许的 Event & Effect 拓展。而 DDD 框架则需要系统性地构建 Data Model， Communication Model 和 Behavioral Model。

也就是说，DDD 框架包含 State-Management 但不止于此。  

除了结构上的差异以外，DDD 框架和 State-Management 的另一个重大差异是——模块依赖管理。

很多状态管理框架，是基于视图框架 (如 React 和 Vue）构建的，脱离视图框架，可能无法正常运行。

这对于状态管理来说，不是问题，甚至是优势所在。这样可以跟视图框架整合得更紧密，开发起来也更加简单，只需要使用视图框架提供的概念。

但对于 DDD 框架来说，这是不可接受的，这是代码模块之间的依赖关系，跟领域之间依赖关系不匹配的现象。  

领域模型属于一种 Model，它不依赖 View 层的事物存在，它是更上游的模块。它应当可以在多个 View 框架中被使用，而不是跟特定 View 框架所绑定。

因此，DDD 框架需要是 View 框架无关的，可独立运行和测试的。用 DDD 的思路去开发时，开发者不被建议在 View 层直接写 Data-fetching 相关的逻辑，而应当将它放到 Effect Model 中。  

在 View 层没有 impl，只有 function-call 性质的调用。

DDD 要求解耦代码的编写和调用。代码的编写位置不是任意的，代码在哪个模块编写，跟它处理的领域逻辑有关。就像 atom state 和 selector state 一样，也存在 atom domain 和 combined/derived domain 的关系，因此有 atom module 和 combined/derived module 的区分。  

也就是说，当一个 domain 不依赖其它任意 domain（比如 Math 模块），这个特点应当在代码中也有体现，比如它是一个不依赖其它模块的 atom 模块。它可以被其它模块所依赖。

因此，被写在 View 层的代码，在这种意义上属于不合理的模块依赖管理，它损害了可复用性和可测试性等指标。按照 DDD 的要求，我们需要将它们挪到更独立的模块中编写代码，然后让 View 层依赖它、调用它、消费它，而非在 View 层实现它。

值得强调的是，对于中小型应用来说，直接写在 View 层的 Model 代码，引发的问题可能不大，带来的收益却可能不小。某种程度上是合理的选择。

对于长期迭代的大型应用来说，我们可以预测将来会遭受模块依赖关系不合理带来的重大隐患问题，因此可以在更早的开发阶段就去设法避免。

这正是 DDD 管理软件复杂度的具体做法之一：合理安排模块依赖关系，减少重复实现，增加代码的可复用性、可测试性等指标。

**5、总结**  

在这篇文章中，我们简单介绍了 DDD，强调了——代码模型匹配领域模型——的重要性，并推导出了实现 DDD 所需的 CQRS & Event & Effect 模式。

我们介绍了基于 CQRS & Event & Effect 模式的 DDD 框架——Remesh，简单演示了它的基本用法和特性。

我们可以看到，DDD 是一个有用的模式，对前端项目也可以带来价值。

欢迎大家来使用 Remesh 并反馈改进意见，参与共建。  

**参考资料**  

[1]  Evans, Eric (2004). Domain-Driven Design: Tackling Complexity in the Heart of Software. Boston: Addison-Wesley. ISBN 978-032-112521-7. Retrieved 2012-08-12.

[2] Wikipedia contributors. "Domain-driven design." Wikipedia, The Free Encyclopedia. Wikipedia, The Free Encyclopedia, 31 Aug. 2022. Web. 7 Sep. 2022.

[3] Granström, Johan G. "A new approach to the semantics of model diagrams." 18th International Workshop on Types for Proofs and Programs (TYPES 2011). Schloss Dagstuhl-Leibniz-Zentrum fuer Informatik, 2013.

[4] Scott Wlaschin, "Domain Modeling Made Functional: Tackle Software Complexity with Domain-Driven Design and F#"

[5] Wikipedia contributors. "Curry–Howard correspondence." Wikipedia, The Free Encyclopedia. Wikipedia, The Free Encyclopedia, 3 Jun. 2022. Web. 8 Sep. 2022.  

[6] Scott Wlaschin, "Domain Modeling with FP (DDD Europe 2020)"   
https://www.slideshare.net/ScottWlaschin/domain-modeling-with-fp-ddd-europe-2020

[7] Henry, Sylvain, John Ericson, and Jeffrey M. Young. "Modularizing GHC."

[8] Wikipedia contributors. "Dependent type." Wikipedia, The Free Encyclopedia. Wikipedia, The Free Encyclopedia, 27 Jul. 2022. Web. 8 Sep. 2022.

[9] Wikipedia contributors. "Refinement type." Wikipedia, The Free Encyclopedia. Wikipedia, The Free Encyclopedia, 14 Jan. 2021. Web. 8 Sep. 2022.

[10] Vekris, Panagiotis, Benjamin Cosman, and Ranjit Jhala. "Refinement types for TypeScript." Proceedings of the 37th ACM SIGPLAN Conference on Programming Language Design and Implementation. 2016.

[11] CQRS (Command-Query Responsibility Segregation)

https://www.eventstore.com/cqrs-pattern

[12] A Beginner's Guide to CQRS

https://www.eventstore.com/cqrs-pattern

[13] A Survey on Reactive Programming

https://jose.proenca.org/post/reactive-programming/slides/survey-on-RP.pdf