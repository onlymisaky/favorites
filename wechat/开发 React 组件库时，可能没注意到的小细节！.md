> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/3nEJwjCJMNl4MLRwauSLRQ)

开发一套组件库，到底难不难？  

> 作者：@Taiming ; 原文：https://just-taiming.medium.com/

> Q: 你觉得刻一套组件库，到底难不难？为什么？Q: 有没有自己或公司团队开发过组件库的经验？是否能够分享当时的情境，为什么公司想要这么做？希望这个组件库对团队带来什么好处？

这个问题，从我参加铁人赛之前，到目前已经出书了，都还一直围绕著我。

最一开始是我自己问我这个问题，“我选这个题目，到底难不难？能不能完赛？”

可能有些人觉得很简单，有些人觉得很难。

因为每个人实现的能力不一样，或是看事情的角度也不一样。

事实上，“难不难” 这个问题，定义得有点模糊，随着他不同的题目条件，难度也会不同。

在跟一些开发者聊天的时候，不知不觉就会发现，很多开发团队、公司都有尝试过想要自己开发一套公司自己的组件库。所以，开发一套组件库并不是那么特别的事情，很多人都有类似的经验，只是在不同的环境、条件之下，这些经验会有些不同。举例：

#### 考量开发时间

给你半年、一年的时间开发一套组件库，当作你的年度绩效，或许不难。

但如果要在 “30 天内”，完成一套约有 30 个组件的组件库呢？难度就会不一样，时间充裕的话，我们可以：组件

*   前期规划的时候，考虑更多实现、规格的细节
    
*   不用考虑时间的急迫性，你要做得多复杂都可以，不需要为了时间而舍弃功能
    
*   实现的过程中，有时间可以除错、优化、重构
    
*   可以仔细、慢慢的写测试，确保每一个细节运作正常、符合规格
    

但如果你只有 30 天呢？你会想要怎么取舍这些功能？

> 当天有听众回馈或许会考虑使用一些 headless component，然后自己再基于这些基础，实现自己想要的样式或延伸功能

#### 考量开发人数

一个团队一起合作完成一套组件库？还是一个人独自完成一套组件库？

其实各有其难处

团队优点：

*   有许多人可以一起讨论，看见彼此疏忽的地方
    
*   有机会发挥 1+1 > 2 的效果，开发更快
    

团队缺点：

*   人多嘴杂，难以下决定的时候，或许会拖慢开发时间
    
*   需要订定合作规范、统一 coding style，否则大家写的 code 都不一样。
    
*   跟你讨厌的人 / 讨厌你的人一起开发 (处理人的问题，又是另外一件故事了)
    

个人优点：

*   自己能够决定所有一切，自己就是主宰
    
*   较能统一风格
    

个人缺点：

*   所有事情都要自己来、所有规格、设计、实现都要自己来
    
*   只能用自己的角度看事情，没有人一起讨论，自己的盲点或疏失没有人发现
    

#### 考量组件库的目标使用者

过去在跟一些开发者聊天交流的时候，曾经被问过下面这个问题：

> 每一个 component 开发，你是怎么去想他的使用者行为？或者，你当初在设计这些 component 的时候，你是怎么让他更 general，假设你的 UI Library 要 release 出去的时候，如何符合大部分的人期待的使用场景？

开发这套组件是要给谁用？这确实也是在开发组件时需要好好考虑的一个面向，这套组件库是要：

*   使用在自己心爱的 sideproject 上面，当然，那你就是这一切的主宰
    
*   公司内部使用，或许不同公司规模也有不同考量，假设只有一两个团队，那相对比较单纯一点。但如果是有五六个团队以上，每个团队又有自己的设计师、工程师，那这样复杂度又更高了
    
*   公开给全世界的开发者使用，可能又要考虑不同国家、各种不同情境，例如适合用在 B2C、B2B 产品？前台产品或后台产品的使用？要随取随用？还是要能够适应各种客制化？考量点也又不一样了
    

但我觉得，想办法做得 general 一点，固然是很有企图心，不过如果要顾到每一种情境和开发者，一方面难度很高，另一方面会有点失去产品的定位。就像是你要开一家服饰店，你不能设定你的衣服要符合所有年龄层、男女通吃、中式、西式、欧式、美式、各种式都能够满足。你要做一个社群平台，你不能让他同时又是 FB，又是 LinkedIn，又是 IG，又是 Twitter，又是 Youtube，这样你的产品什么都不是。

所以，到底要做出什么样的组件库？设定好特定一个族群的需求，也或许是一个聪明的选择，你的目标很明确，也会让产品很有特色！

#### 刻一套组件库，到底难不难？

回到先前提到的这个问题，到底刻一套组件库难不难？我觉得，如果：

“自己独自一人”+“没有设计师帮你设计 Design Guideline”＋“时间有限 (如 30 天内)”＋“需要完成的组件很多 (如要完整刻一套组件库)”＋“目标使用者设定得很 general”

那我自己个人觉得，这个任务就会变得非常难！

但反之，若想要做一套品质好一点的组件库，那么，我们就应该要尽量避免上述的情况，免得让自己深陷险境。

可以的话，组一个好的团队，有一群好的工程师伙伴互相良性讨论，然后一位可以跟工程师沟通良好的设计师、PM，时间不要压那么紧，适量的组件数量，并且设定好使用者对象，那么，我相信这个组件库将会是非常棒的！

#### 为何自己当初想不开，想独自刻一套组件库？

##### 一、面对曾经面试失利

很久以前，曾经有一个面试官问我说，“你有没有刻过什么组件呢？”，身为一个前端工程师，当然是回答 “有！”，说了一轮之后，问我有没有做过某个组件可以广泛被用在产品当中，例如 “Button” 这种组件，那我的回答当然也是 “有呀！”，但下一个问题是，“那你怎么去设计一个 Button 呢？”，当下真的因为经验不足，所以面对这个问题有点傻住了，心想 “Button 不就 Button 吗？要怎么去设计是什么意思？”，所以这个面试也就在这样的尴尬氛围下结束。这成为我面试经验当中一个很不堪的回忆，因此很希望能够透过做点什么来累积经验，藉此弥补自己的不足。

##### 二、觉得要凑 IT 铁人赛 30 天，容易凑到 30 篇

如这个标题所说，理由就是这麽单纯，世界上组件那么多，随随便便应该就可以凑到 30 个吧？一天一个，刚好 30 篇，完美！但是，开始拟定大纲的时候才发现，参考各大组件库之后，挤出二十几个就已经很不容易了，若真的要凑到 30 个的话，真的会需要去挑战一些自己没把握的组件。但所幸最后还是顺利完成，可说是有惊无险。

##### 三、觉得这个题目够硬、够疯

这个题目真的很硬，有理论、有分析、有实现。所以我觉得，虽然可能大家也有想过这个题目，但是应该没有人敢衝。所以选这个题目，要跟人家重複的机会应该是很难，因此也更能显示出我的作品的独特性，觉得算是有亮点。很高深的技术、知识，我没有把握，但是做一些疯狂的挑战，对我来说很可以，大不了咬著牙，眼睛一闭，撑一下就过去了。毕竟，痛苦会过去，幸福会来临。

##### 四、对自己误会太深

事实上我对这个题目难度的评估也是超出我意料之外，我想，这也算是我经验不足的一个体现吧！选定这个题目之时，我觉得有点难，但应该没问题。实际上头洗下去之后，才发现，天啊，这真的有够硬！早知道就不选这个题目了！不过既然已经深陷泥沼，也是自己选的，终究要对自己负责，还是硬著头皮完成挑战。

#### 在自己开发组件之前，那些不曾想过的琐事

大家在工作的时候，不知道有没有这样的经验？

有些组件、功能，原本觉得应该很简单。但是，实际上动手去做的时候，才发现跟自己原本想像的不同，很多细节是过去没有考虑过的，会出现很多意外。

这些事情真的很多，今天我选三个小琐事来跟大家分享：

*   Infinite Scroll
    
*   Pagination
    
*   进场 / 离场动画
    

##### Infinite Scroll

> Infinite scroll 能在面对多笔资料时，让滚轴滑动到底部时再载入下一页面的资料。

![](https://mmbiz.qpic.cn/mmbiz_jpg/meG6Vo0MevhlLb6aE7bBibdcFI9OY8nE80nziaib2fLDOibVdfdW9N09NIKGcZhZGfFicuibLt3ToxrlIxFfh3jgNRMw/640?wx_fmt=jpeg&wxfrom=5&wx_lazy=1&wx_co=1)

相信大家对这个组件都不陌生，大部分的社群软体，例如脸书、IG 等等，都是不断往下滑就能够看见更多贴文。

But how?

Infinite Scroll 的特点是让资料滚到底部时自动载入，所以这边的关键是，我们要如何判断 “是否已经滚动到底部”？

Infinite Scroll 的讨论在网路上非常多，但假设我们是一个新手，如果以前真的完全没有实作过这个组件，过去也没有看过网路上文章的分享，那你会想要怎么做呢？

最直觉的方法就是，对 scroll 做事件监听，并且不断的去计算高度。

“滚动到底部” 换句话来说，就是你滚过的距离加上自己元素的高度，大于等于可滚动范围的高度。

![](https://mmbiz.qpic.cn/mmbiz_jpg/meG6Vo0MevhlLb6aE7bBibdcFI9OY8nE88wgfekic6DLQDAkv4VibnwpAWt27sbMHWhQqdEPEy76NMt6mAGJ6IzGA/640?wx_fmt=jpeg&wxfrom=5&wx_lazy=1&wx_co=1)图片

“滚过的距离”＋“自己元素的高度” ≥ “可滚动范围的高度”

写成程序代码大概会是这样：

![](https://mmbiz.qpic.cn/mmbiz_jpg/meG6Vo0MevhlLb6aE7bBibdcFI9OY8nE8HJ3tT2LD2fvHzhqWkztRic0ticpiamWLNpp4XAHXicibTdKX2eKp6FBBYibA/640?wx_fmt=jpeg&wxfrom=5&wx_lazy=1&wx_co=1)图片

用 React 来实现，我们可以考虑在 useEffect 里面对 scroll 做事件监听，当滚动到底部的条件达成时，去加载更多的内容：

![](https://mmbiz.qpic.cn/mmbiz_jpg/meG6Vo0MevhlLb6aE7bBibdcFI9OY8nE8iamBtvNEken4vhYme7lWCzq29jVg1T3XX3mGen19agYLj7wJUb5HnEQ/640?wx_fmt=jpeg&wxfrom=5&wx_lazy=1&wx_co=1)图片

这个做法的优点是很直觉、很简单，基本上我们第一时间应该都可以想到这个做法。

但缺点也是很显而易见，这些程序代码都在 main thread 上运行，需要不断监听 scroll 事件，每次滚动时都需要重新计算元素的位置信息，因此可能会影响性能。

即使，你不是往下滑，而是往上滑，因著 scroll 事件，这个计算的 function 还是会不断的被触发，显然这是个没有效率的做法，因为他一直在做一些无谓的运算。

当你意识到这个问题，开始想要去找一些解决方案的时候，我们就能看到许多开发者会推荐你另一种做法，就是透过 “Intersection Observer API” 来实现。

> Intersection Observer API 的核心精神是 “当被观察者与观察范围重叠到某个百分比时，呼叫我的 callback function 做某件事”。

所以重点有三个，“观察者”、“被观察者”、“要被呼叫的 callback”。

![](https://mmbiz.qpic.cn/mmbiz_jpg/meG6Vo0MevhlLb6aE7bBibdcFI9OY8nE8YIP42n3PQNrIUUvfScgNdSLdiafpzyypVB9IRy0BqGI67b25Iw1jSEg/640?wx_fmt=jpeg&wxfrom=5&wx_lazy=1&wx_co=1)图片

以上图来说

*   观察者：蓝色的框框就是我们观察的范围，上述例子是 Browsers viewport。
    
*   被观察者：我们可以看到蓝色框框下面有一个深色矩形，这表示被观察的对象。
    
*   要被呼叫的 callback：当被观察的深色矩形因著滚动事件进到蓝色的框框的可视范围内，就触发这个 callback，里面做的事情就是去加载更多内容进来。
    

详细的实现方式我就不在这边说明了，我想说的是，直觉的做法固然很好，也很有用，但是如果能够参考别人的做法，就能够得到意外的收获和学习！这是我曾经忽略的部分。

参考文章：

*   React window 与 IntersectionObserver API 实现无限捲动 Dcard 文章阅读器之心得纪录 — Kyle Mo
    
*   [教学] 如何用 Intersection Observer API 实作 Infinite Scroll/Lazy Loading — Shubo 的程式开发笔记
    

##### Pagination

Pagination 是一个分页组件。当页面中一次要载入过多的资料时，载入及渲染将会花费更多的时间，因此，考虑分批载入资料的时候，需要分页组件来帮助我们在不同页面之间切换。

![](https://mmbiz.qpic.cn/mmbiz_jpg/meG6Vo0MevhlLb6aE7bBibdcFI9OY8nE8q1G6gwcc2Fp7VlyMs8HB2qMubOLFkPLdaxV6scX97EbicdqChtCeF0A/640?wx_fmt=jpeg&wxfrom=5&wx_lazy=1&wx_co=1)Pagination

[情境一]

当我们开开心心的完成了一个 Pagination 组件的时候：

![](https://mmbiz.qpic.cn/mmbiz_jpg/meG6Vo0MevhlLb6aE7bBibdcFI9OY8nE8XLht9k1gnCbQ4t6cicSaCxcR1mu8mRTEelbicGQl3jIwbVKRHrVbMuFA/640?wx_fmt=jpeg&wxfrom=5&wx_lazy=1&wx_co=1)图片

我们是否能够想到，会不会有一天他会变得太长呢？如下图：

![](https://mmbiz.qpic.cn/mmbiz_jpg/meG6Vo0MevhlLb6aE7bBibdcFI9OY8nE89OKIy1OO9Ub7FYS1zYOHYr41KaIw6xayib6HQYHnN6rJhxJMFjWial1A/640?wx_fmt=jpeg&wxfrom=5&wx_lazy=1&wx_co=1)图片

我个人觉得，能够想到这一步其实就已经蛮厉害的了！

过往比较没有经验的时候，通常会忽略页数太长的问题，因为自己在测试的时候通常觉得功能没什么问题就 ok。刚刚上到正式机，因为资料量也还没那么多，所以也不会发现问题。等到使用者新增的资料越来越多，才发现，怎么页数会变这麽多！或是使用者发现怎么破版了！这时候才会突然惊觉糗大了！

所以我才觉得，能够在这之前就发现，真的是拥有丰富的经验，或是曾经被这件事情给雷过。

在移动设备普及的当代，Pagination 太长很容易造成破版，因此需要适当的缩短节点。但是，缩短节点应该要怎么处理？

在没有时间考虑太多的情况下，我想了一个规则来缩短节点：

*   留头、留尾
    
*   留 current — 1, current, current + 1 这几个 page
    
*   其他的都省略
    

成功缩短之后成果如下图：

![](https://mmbiz.qpic.cn/mmbiz_jpg/meG6Vo0MevhlLb6aE7bBibdcFI9OY8nE8p4T6kajcIibK5l1wIoKNq37cf1aWGtVmzs57iaOkjLIhmbjLiaho1DiaIw/640?wx_fmt=jpeg&wxfrom=5&wx_lazy=1&wx_co=1)图片

看起来有模有样的不是吗？我当初真的觉得自己很聪明…

但事实上，这样想还是太单纯了，怎么说呢？

想想看，考虑到边界状况，例如头尾刚好就是 current + 1, current — 1 ，我们可能就会这样处理：

![](https://mmbiz.qpic.cn/mmbiz_jpg/meG6Vo0MevhlLb6aE7bBibdcFI9OY8nE8FUX7XW5xlyUhmYcNx9xlZVeJ7PuocvPianPD6XVzdAJLlppK4JyobnA/640?wx_fmt=jpeg&wxfrom=5&wx_lazy=1&wx_co=1)图片

另外，符合上述三个规则的还有这样：

![](https://mmbiz.qpic.cn/mmbiz_jpg/meG6Vo0MevhlLb6aE7bBibdcFI9OY8nE8Pibs2tuFAfwiaMLPfI3jLfhnibibTibUu6MNNwl5GuYPTricPXSPia1bxZwug/640?wx_fmt=jpeg&wxfrom=5&wx_lazy=1&wx_co=1)图片

符合上述三个规则的其实有各种可能性，简单条列一下如下图：

![](https://mmbiz.qpic.cn/mmbiz_jpg/meG6Vo0MevhlLb6aE7bBibdcFI9OY8nE8HeyKpQR1esVg3c14Drpl19jvkf95VkniakeicWqnL27hXRUmX9kicuJqA/640?wx_fmt=jpeg&wxfrom=5&wx_lazy=1&wx_co=1)图片

有没有发现一件事？我们的 Pagination 居然在不同的边界条件之下会有不同的节点数量，会像金箍棒一样变长变短。

因此，使用者没有办法透过你的 Pagination 做 “连续点击”。换句话说，当你的 Pagination 会忽长忽短的时候，使用者在滑鼠游标位置不变的情况下，有可能会点击到他预期以外的节点。

这真的是非常的糟糕，就像是你在看漫画网站的时候，想要点下一页，却不小心点到突然跳出来的色情网站广告一样惨，因为你妈妈可能要叫你去吃饭的时候来到你房间，而你刚好就在那个不小心的时间点出意外。

因此，要如何让 Pagination 能够固定长度，确保使用者不会不小心点到他不想要点的按钮？这真的也是容易被我们忽略的小细节呀！

[情境二]

Pagination 是一个很常见的组件，因此在各个产品上面都很容易发现他的踪迹。也因此，常常他也需要为了符合各个产品的情境而需要做出对应的调整。

有时候我们需要不同样式，但同样逻辑的 Pagination。例如：

*   比较庞大复杂的系统，为了符合不同页面功能的需要
    
*   一个大公司内部有好多个不同产品的团队，虽然公司有内部开发的 UI Library，但是不同产品希望有不同的样式
    
*   开放给大众用的 Pagination，希望尽可能做得 general 一点
    

那该怎么做才能够让这个 Pagination 能够 general 一点呢？

其中一个很直觉的想法就是，或许我们可以用 props 来控制各种可以客制化的属性，例如节点大小、填充模式、颜色、外观是否有圆角、隐藏节点的时候该保留几个兄弟节点… 等等。

要客制化的话，会有非常多的属性可以设置，但是，如果这些属性全部都由 props 来控制的话，那想必你的 Pagination 有可能就会变成下面这样：

![](https://mmbiz.qpic.cn/mmbiz_jpg/meG6Vo0MevhlLb6aE7bBibdcFI9OY8nE8wSJnw8aSXw1zGDNctX2X0mia2V9ZQMW5so6X8KC3bgpyEROpa0s1aHg/640?wx_fmt=jpeg&wxfrom=5&wx_lazy=1&wx_co=1)图片

我想，看到这样千疮百孔的 props 传入的时候，必定会眉头一皱，因为这样真的很不容易看出这个组件长什么样子，密密麻麻的，很难阅读也很难维护。

而且 props 太多的话，到时候我们的 Pagination 要用在各个页面的时候，也会很难移植，因为你必须要确保每一个 props 传入的值都是你所预期的，未来要改也会很难改，因为东西一多，就可能会漏东漏西。

就在这个时候，我发现 Material UI 提供了一个令我醍醐灌顶的想法，“usePagination”。

> usePagination For advanced customization use cases, a headless usePagination() hook is exposed. It accepts almost the same options as the Pagination component minus all the props related to the rendering of JSX. The Pagination component is built on this hook.

一个天外之音打进我的心头，“谁跟你讲组件一定要带有样式？”

usePagination 很漂亮的把 Pagination 的逻辑和选染样式拆开来处理。usePagination 只处理逻辑的部分，而样式的部分则留给开发者自己客制化。

因为这是一个 “React” 的组件库，因此他使用到了 React 的特色，Custom Hooks 来实作，这点我真的觉得很厉害！

> 在 React 中，Custom Hooks 是一种函数，它们可以让你在多个组件之间共享逻辑、状态和行为，从而帮助你更好地组织和重用程序代码。

如果我们把逻辑跟样式分开，逻辑的部分共用成 usePagination 的话，这样各团队就能够共用程序代码，也能够拥有自己客制的样式了。

简单示范一下 usePagination 的使用：

![](https://mmbiz.qpic.cn/mmbiz_jpg/meG6Vo0MevhlLb6aE7bBibdcFI9OY8nE8t07G83DTics0kejO4sb6llIl0GTqaP8zVYqDmz4JLCzwZ6MuXCm59RQ/640?wx_fmt=jpeg&wxfrom=5&wx_lazy=1&wx_co=1)图片

我们只需要传入适当的参数，就能够得到一系列的节点，这些节点包含了每一个节点所需要的资讯还有被点击时触发的事件，例如上一页、下一页：

![](https://mmbiz.qpic.cn/mmbiz_jpg/meG6Vo0MevhlLb6aE7bBibdcFI9OY8nE8R7zurpec6RFqyQ9pYQyS9r2JczKR2c7wsKn0ROBe8OJibicFW1UfCzGA/640?wx_fmt=jpeg&wxfrom=5&wx_lazy=1&wx_co=1)图片

“谁跟你讲组件一定要带有样式？” 这句话真的带我从原本固定习惯的思维当中跳脱出来。

##### 进场 / 离场动画

![](https://mmbiz.qpic.cn/mmbiz_jpg/meG6Vo0MevhlLb6aE7bBibdcFI9OY8nE8etDVUc01PLkVBNZEMW6smAZNP22aTbROtwbZYhZ15ymXn0CJ4RxhdA/640?wx_fmt=jpeg&wxfrom=5&wx_lazy=1&wx_co=1)图片

在写前端应用程式难免会碰到需要动画的时候，尤其是组件的进场与离场动画。例如 Modal, Drawer… 等等。

动画在前端介面当中， 真的扮演了画龙点睛的角色。

想想看，如果我们很生硬的直接把组件塞进画面，那组件在使用者看来就会很 “突然的” 出现或消失，像是下面这样：

![](https://mmbiz.qpic.cn/mmbiz_gif/meG6Vo0MevhlLb6aE7bBibdcFI9OY8nE8oDJReQ82tJszjfHqibP2NIvIeOSlor11rBBB6IyeicjxFLDh9zKlngjA/640?wx_fmt=gif&wxfrom=5&wx_lazy=1)图片

这真的是非常的突兀、非常不优雅！

因此，为了比较好的使用者体验，我们会让组件 “优雅的” 进场或离场，例如滑入 (Slide In)／滑出 (Slide Out) ，所以我们加上一些 transition：

![](https://mmbiz.qpic.cn/mmbiz_jpg/meG6Vo0MevhlLb6aE7bBibdcFI9OY8nE8bxxx6A0aAx1DZEJJrKm5Edd05PW6NhI8nnZwqv9Vj5QapicLcXN1ffQ/640?wx_fmt=jpeg&wxfrom=5&wx_lazy=1&wx_co=1)图片

我们可以看到上述程序代码当中，透过 styled-components 的 props 传入，来控制组件的样式，因此，我们就会得到了一个拥有优雅动画的 Drawer 组件了：

![](https://mmbiz.qpic.cn/mmbiz_gif/meG6Vo0MevhlLb6aE7bBibdcFI9OY8nE8DIb811aUT7EnWkF22CbrLKXNYFvZy467T7R5GNviaBO7YvjBibjiaGnbA/640?wx_fmt=gif&wxfrom=5&wx_lazy=1)图片

看起来真的是令人通体舒畅不是吗？

然而，当你沉浸在这个优雅的动画中时，突然开启了检视原始码，就会赫然想到一件令人介意的事，那就是，当 Drawer 离场之后，他的节点在 DOM Tree 里面还是没有消失，只是使用者看到的画面消失而已。

因此，为了让节点可以消失，所以除了动画的 open 以外，我们再把 open 拿来控制节点是否渲染：

![](https://mmbiz.qpic.cn/mmbiz_jpg/meG6Vo0MevhlLb6aE7bBibdcFI9OY8nE8JncnbNicibyibkWVfyrovEZzph5AlBCA6iaw1TXQPnicv2zu5h2YoPtTFvw/640?wx_fmt=jpeg&wxfrom=5&wx_lazy=1&wx_co=1)图片

这样，我们同时有了可以控制动画的 props，也会在 open 变成 false 的时候把 Drawer 组件拿掉。

但事实上真是如此吗？我们来看一下成果：

![](https://mmbiz.qpic.cn/mmbiz_gif/meG6Vo0MevhlLb6aE7bBibdcFI9OY8nE8oDJReQ82tJszjfHqibP2NIvIeOSlor11rBBB6IyeicjxFLDh9zKlngjA/640?wx_fmt=gif&wxfrom=5&wx_lazy=1)图片

你会发现你又回到了不优雅的样子……

虽然这个方法解决了节点不渲染在 DOM Tree 上的问题，可是原本写的 transition 动画却消失了！

原因是若直接把组件拔掉，他没有时间可以做 Transition。

我的天啊！原来这件事情比我想像的还要复杂许多！

可是我们观察那些常用的组件库，例如 MUI，却可以发现 Drawer 在离场的时候，DOM Tree 里面的节点会被移除，并且拥有非常优雅的动画：

![](https://mmbiz.qpic.cn/mmbiz_gif/meG6Vo0MevhlLb6aE7bBibdcFI9OY8nE8GuuXX6U1A8Zw4dtm4pFMslEMoOX3q3RTVWKXiaIVR3iaMXfxvyTXKpxA/640?wx_fmt=gif&wxfrom=5&wx_lazy=1)图片

这表示，我们想要保持优雅动画的同时，要控制 Drawer 退场后在 DOM Tree 里面的节点会被移除这件事情是可行的，只是我们的方法或想法错了。

仔细想想，只透过一个 boolean 来控制的话，有点难同时做到这个效果。因为滑入、滑出，跟是否在 DOM Tree 当中渲染，是两件独立不同的事情。没有一开始想的那么单纯。

那我们有可能的解决方法如下：

*   使用 setTimeout 搭配 open/visible 两个参数分别控制这两件事
    
*   使用 react-transition-group 等处理动画的套件帮忙
    
*   其他厉害的方法
    

犯了这个蠢，确实让我思考了一些事。有时候我们乍看之下很自然、很简单的东西，仔细观察之后会发现其实有很多巧思在其中，瞭解他的巧思之后，

不禁会对这个组件设计的用心敬畏三分。

#### 总结

在做组件库的过程当中，除了今天小聚提到的几个主题之外，还有许多我没注意到的小细节，例如 `Controlled vs Uncontrolled` 的问题、props 参数命名的问题、组件库整体性一致性的问题… 等等，有许多小细节在实作的过程当中值得拿出来讨论。

另外，在忽略这些小细节的过程当中，越来越觉得自己关起来蛮干是一个对工程师而言自杀式的做法，所谓 “独自做一套组件库” 并不意味著你的环境没有人可以跟你合作。不愿意倾听别人的意见和想法，觉得别人的想法都不如自己、都有疏漏，其实也是一种闭门造车。然而，如果你的团队里面只有你一个人，也不代表没办法跟别人交流，现今网路这麽发达，懂得寻找资源，也能够避免让自己成为井底之蛙。

最后，有时候我们乍看之下很自然、很简单的东西，仔细观察之后会发现其实有很多巧思在其中，有他厉害的地方、值得学习的地方。事实上，不只是对自己手上的专案是如此，对于身边的人、合作的同事也是一样，在这部分我也是有深刻的感触。