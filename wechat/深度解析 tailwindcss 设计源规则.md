> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/EGJ7h010NiW4RenL1an6fA)

这段时间陆陆续续收到了很多朋友对于如何更进一步使用 tailwindcss 的提问，发现大家在学习和使用 tailwindcss 的过程中，并没有掌握真正的核心的要点。所以经常会在一些时候比较无所适从。例如，**如果公司有自己的设计规范，我应该如何调整 tailwindcss 去自定义我的设计方案？**

又或者有的同学不太喜欢 tailwindcss 的默认尺寸 `m-1` 表示 `margin: 0.25rem`。要如何通过配置去修改它。

这篇文章，我就从 tailwindcss **源规则**的角度，为大家重新分享一些如何去做自定义的设置。

* * *

### 读懂基本规则

虽然 tailwindcss 的源规则比较简单，但是很显然，很多人并没有读懂它。

我们以其中一个比较常用的 class 为例，为大家解析一下源规则。

当我想要给一个元素这只 margin 值时，我会采用如下的写法

```
<div class="m-4"></div>
```

针对 `m-4` 我们要分成两个部分去解读它。

前面一个部分 `m-` 表示具体的 css 属性的缩写。`m-` 表示 `margin:`

> !
> 
> > 在刚开始使用的时候，一个比较麻烦的事情是我们并不那么熟悉每个属性对应的缩写是什么，因此，tw 的官方文档中，提供了每一个属性的对照表

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcGc5Fyc5TFaxSlFC7l7HgfIa148SicUEicoFPu9GaAl2T3WkhbdSPsKxx2VkJricMYGZHbq3JooVfbAA/640?wx_fmt=png&from=appmsg)

如图中所示，我们可以简单看到有如下常用属性

<table><thead><tr><th data-style="line-height: 1.5em; letter-spacing: 0em; width: auto; height: auto; border-radius: 0px; padding: 14px; min-width: 85px; text-align: left; font-size: 13px !important; background-color: rgb(0, 0, 0); color: rgb(255, 255, 255) !important; border-top-width: 1px !important; border-color: rgb(0, 0, 0);">缩写</th><th data-style="line-height: 1.5em; letter-spacing: 0em; width: auto; height: auto; border-radius: 0px; padding: 14px; min-width: 85px; text-align: left; font-size: 13px !important; background-color: rgb(0, 0, 0); color: rgb(255, 255, 255) !important; border-top-width: 1px !important; border-color: rgb(0, 0, 0);">css 属性</th></tr></thead><tbody><tr data-style="background: none 0% 0% / auto no-repeat scroll padding-box border-box rgb(255, 255, 255); width: auto; height: auto;"><td data-style="padding-top: 12px; padding-bottom: 12px; padding-left: 14px; line-height: 2em; min-width: 85px; border-color: rgba(204, 204, 204, 0.4); border-radius: 0px; font-size: 13px !important;">m-</td><td data-style="padding-top: 12px; padding-bottom: 12px; padding-left: 14px; line-height: 2em; min-width: 85px; border-color: rgba(204, 204, 204, 0.4); border-radius: 0px; font-size: 13px !important;">margin</td></tr><tr data-style="width: auto; height: auto; background: rgb(250, 247, 254);"><td data-style="padding-top: 12px; padding-bottom: 12px; padding-left: 14px; line-height: 2em; min-width: 85px; border-color: rgba(204, 204, 204, 0.4); border-radius: 0px; font-size: 13px !important;">mx-</td><td data-style="padding-top: 12px; padding-bottom: 12px; padding-left: 14px; line-height: 2em; min-width: 85px; border-color: rgba(204, 204, 204, 0.4); border-radius: 0px; font-size: 13px !important;">margin-left, margin-right</td></tr><tr data-style="background: none 0% 0% / auto no-repeat scroll padding-box border-box rgb(255, 255, 255); width: auto; height: auto;"><td data-style="padding-top: 12px; padding-bottom: 12px; padding-left: 14px; line-height: 2em; min-width: 85px; border-color: rgba(204, 204, 204, 0.4); border-radius: 0px; font-size: 13px !important;">my-</td><td data-style="padding-top: 12px; padding-bottom: 12px; padding-left: 14px; line-height: 2em; min-width: 85px; border-color: rgba(204, 204, 204, 0.4); border-radius: 0px; font-size: 13px !important;">margin-top, margin-bottom</td></tr><tr data-style="width: auto; height: auto; background: rgb(250, 247, 254);"><td data-style="padding-top: 12px; padding-bottom: 12px; padding-left: 14px; line-height: 2em; min-width: 85px; border-color: rgba(204, 204, 204, 0.4); border-radius: 0px; font-size: 13px !important;">mt-</td><td data-style="padding-top: 12px; padding-bottom: 12px; padding-left: 14px; line-height: 2em; min-width: 85px; border-color: rgba(204, 204, 204, 0.4); border-radius: 0px; font-size: 13px !important;">margin-top</td></tr><tr data-style="background: none 0% 0% / auto no-repeat scroll padding-box border-box rgb(255, 255, 255); width: auto; height: auto;"><td data-style="padding-top: 12px; padding-bottom: 12px; padding-left: 14px; line-height: 2em; min-width: 85px; border-color: rgba(204, 204, 204, 0.4); border-radius: 0px; font-size: 13px !important;">mb-</td><td data-style="padding-top: 12px; padding-bottom: 12px; padding-left: 14px; line-height: 2em; min-width: 85px; border-color: rgba(204, 204, 204, 0.4); border-radius: 0px; font-size: 13px !important;">margin-bottom</td></tr></tbody></table>

等等。

因此，在刚开始使用的时候，一定要多翻阅官方文档，把这些属性与缩写的对应关系用熟练之后，就好了。**这也是 tailwindcss 上手难度最高的地方。**

后面一个部分 `-1` 表示具体的值。这里就是大家理解起来比较困难的一个地方了，因为这个值，有点问题。`1` 表达的不是 `1px`，而是 `0.25rem`。

这样的话，那可就太麻烦了。例如，我从设计稿上，量出来的外边距是 6px，那么，我应该怎么写呢？这样搞就不行。所以有的人会觉得 tailwindcss 用到真实项目中会非常痛苦，这个换算成本也太高了。

好在 tailwindcss 提供了一个不太优雅的简写方式，让大家用起来要稍微舒服一点，那就是使用一个中括号表示具体的数值

```
<div class="m-[6px]"></div>
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcGc5Fyc5TFaxSlFC7l7HgfI15ibesBAZhiaHmz7vkHrehIxeD8bolR5smgCqSatdcVGM66rvBlw4pwg/640?wx_fmt=png&from=appmsg)

实际上，我们大可不必如此使用，这里有一个很重要的理解门槛，就是大家对于 `1 -> 0.25rem` 的映射规则理解错了，如果你读过 tailwind 官方提到的 **Refactoring UI**，你就知道这种映射规则，是一种设计语言，而不是技术语言。当我们试图把它当成技术语言的话，自然就会出现理解偏差

> ✓
> 
> 至于我为啥会那么无聊的去读 Refactoring UI 这本书，那是因为我曾经也是一个半吊子设计师，对这方面一直都有默默沉淀和积累

因此，我们还需要抛开这层隔膜，从技术语言的角度去理解它。他的真实映射关系其实是：

**`1` 是 `--spacing-1` 的缩写**

```
1 -> --spacing-1
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcGc5Fyc5TFaxSlFC7l7HgfIdfTY0MwKibyWc8wKsQtPXxybRVSy6r15bQSyIVWb7dK8LmnPBtE7jDA/640?wx_fmt=png&from=appmsg)

因此，接下来这里落点就需要落在如何去理解这个 `--spacing-1` 上面。

* * *

### 重新理解 css 变量

很明显，这是 **css 变量**。它的理解非常简单。

我们可以通过如下方式定义一个变量

```
:root {  --main-bg-color: brown;}
```

然后在其他地方，使用 var 去使用它

```
element {  background-color: var(--main-bg-color);}
```

css 中的 `var()` 函数可以接收两个值，第一个值表示 css 变量，第二值表示一个兜底的回退值。

因此，当我有如下代码时

```
:root {  --main-bg-color: red}body {  color: var(--main-bg-color, orange);}
```

此时优先级更高的是我们在 `:root` 中定义的色值，最终的表现字体颜色为红色。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcGc5Fyc5TFaxSlFC7l7HgfIx4Y8sGI35LArGISGcbCK3nFURoNVKxBmxhu2DKg1P3KGTWnVYGDavQ/640?wx_fmt=png&from=appmsg)

当时，如果我并没有定义好 `--main-bg-color` 的值，那么此时就会使用兜底的回退值作为生效颜色

```
:root {}body {  color: var(--main-bg-color, orange);}
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcGc5Fyc5TFaxSlFC7l7HgfIzNRp0pVicehQjicyIPn1Y844chWu1ZslxzGUwGlNy4SB8AaDHt8FTc2Q/640?wx_fmt=png&from=appmsg)

* * *

### 如何自定义

有了这个规则之后，其实剩下的就非常简单了，我们重新看仔细看一下 `m-1` 对应的 css 代码

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcGc5Fyc5TFaxSlFC7l7HgfIJib98ibDSwWyu1bV5YhwzGkrpPzDuB2VEib3wgzWtKndNn6lyPTPbndVg/640?wx_fmt=png&from=appmsg)

我们发现，他这里是把  `0.25rem` 作为 `--spacing-1` 的回退值。由于默认情况下，我们也并没有去设置 `--spacing-1` 的值具体是多少，所以，通常情况下，是回退值生效，也就是 `0.25rem`。

那如果我不想要使用这个回退值，怎么办？很简单，我们自己重新定义一个 `--spacing-1` 的值就行，按照你认为的样子去定义即可

```
:root {  --spacing-1: 1px;}
```

定义好了之后，我们再来看一下页面效果

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcGc5Fyc5TFaxSlFC7l7HgfI61ID5JeRl5hrzcr2iajEPWzx2HrR9TJjuy1ibC3z3F70UepgojnjhLMw/640?wx_fmt=png&from=appmsg)

最终，是 1px 生效

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcGc5Fyc5TFaxSlFC7l7HgfI4XYTic2cWicibR9S4vFOLCkHGL2Ql3RdelIqqqoQptS2s4HlCuosUUvPg/640?wx_fmt=png&from=appmsg)

因此，我们可以通过这种比较简单的方式去把后续数值的部分全部给覆盖了，改成你自己以为最合理的方式。

```
:root {  --spacing-1: 1px;  --spacing-2: 2px;  --spacing-3: 3px;  --spacing-4: 4px;}
```

当然，这是最简单的方式，不过这种方式会存在一些问题，那就是虽然我最终生效的值已经改了，但是回退值还是 `0.25rem` ，因此在插件上和调试工具中的可读性就非常低

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcGc5Fyc5TFaxSlFC7l7HgfIgDUhehb8nqicatR5NrJibCceyPCLm6Vkn7GZrLgbyZm43MG4ZGYibdZMA/640?wx_fmt=png&from=appmsg)

因此，通常情况下我们并不会这么直接通过新增 css 变量的方式去修改优先级更高的生效值，而是在 `tailwind.config.js` 中去修改回退值

```
module.exports = {  theme: {    spacing: {      1: 'var(--spacing-1, 1px)',      2: 'var(--spacing-2, 2px)',      3: 'var(--spacing-3, 3px)',      4: 'var(--spacing-4, 4px)'    }  }}
```

然后我们就发现，回退值也变成了我们设计好的样子。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcGc5Fyc5TFaxSlFC7l7HgfIG9RDpDIg4EwvGicPatyTnBQ32DUicicqmXacbbWTGDB8OuSHicbguiaH7jA/640?wx_fmt=png&from=appmsg)

当然，我们也可以直接简单粗暴的去定义好直接生效的值。

```
module.exports = {  theme: {    spacing: {      1: '1px',      2: '2px',      3: '3px',      4: '4px'    }  }}
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcGc5Fyc5TFaxSlFC7l7HgfIicff2e38e1Yuq7AK5ofNtDQONsutrYJRqWlS7MSs1iaOH04c29d3m9EA/640?wx_fmt=png&from=appmsg)

这样做的好处就是，`m-1` 从此就失去了设计语言的属性，变成了纯技术语言，对于没有团队规范的开发者来说，理解起来就非常容易了。

**坏处就是，失去了设计语言。**

`spacing` 是一个公用的配置，官方文档明确的说明了哪些属性会用到这个配置来映射自己的值。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcGc5Fyc5TFaxSlFC7l7HgfIZ4M9RbuEv3BWgeRibvExIicE7zw8sK5W15tujs42tmp1ZU4u4IaGOMeA/640?wx_fmt=png&from=appmsg)

* * *

### 特别说明

tailwindcss **并不是那么提倡大家完全抛弃设计语言**。因此在配置能力上做了一些限制。例如，我们无法像 unocss 那样，可以通过一个正则匹配任意的 px 数值

```
// my-preset.tsimport { Preset } from 'unocss'export const myPreset: Preset = {  name: 'my-preset',  rules: [    [/^m-([.\d]+)$/, ([_, num]) => ({ margin: `${num}px` })],    [/^p-([.\d]+)$/, ([_, num]) => ({ padding: `${num}px` })],  ],  variants: [/* ... */],  shortcuts: [/* ... */],  // ...}
```

tailwindcss 提倡你约定一组固定的数组，然后在这组固定的数值上做能力的配置。

例如，对于间隔数值而言，在 antd 的设计语言中，他们是这样处理的，以下是 antd 设计语言的原话

> ✓
> 
> 蚂蚁中后台涵盖了大量的不同类型和量级的产品，为了帮助不同设计能力的设计者们在界面布局上的一致性和韵律感，统一设计到开发的布局语言，减少还原损耗，Ant Design 提出了 UI 模度的概念。在大量的实践中，我们提取了一组可以用于 UI 布局空间决策的数组，他们都保持了 **8 倍数的原则**、具备动态的韵律感。经过验证，可以在一定程度上帮助我们更快更好的实现布局空间上的设计决策。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcGc5Fyc5TFaxSlFC7l7HgfISONJljA8TRWZqq4SibQZ8ic0rfFkqqre2lfz2IPVHEXPrLibNTj6Y0QCw/640?wx_fmt=png&from=appmsg)

**又例如在字体的设计上，他们也做了数值的设计**

字阶和行高决定着一套字体系统的动态与秩序之美。字阶是指一系列有规律的不同尺寸的字体。行高可以理解为一个包裹在字体外面的无形的盒子。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcGc5Fyc5TFaxSlFC7l7HgfID1EzlY20TRQE8KufGNbpgB60TA68NhiaJGtly5jWyYRPDys0IjiafpNg/640?wx_fmt=png&from=appmsg)

Ant Design 受到 5 音阶以及自然律的启发定义了 10 个不同尺寸的字体以及与之相对应的行高。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcGc5Fyc5TFaxSlFC7l7HgfIgVicl19VF0advjc4DNmqBSDQBicDj64biaN7GIaLEBEyQrYQNJVRM6PEg/640?wx_fmt=png&from=appmsg)

把这种设计语言的规则，对应 tailwindcss 上，你就会发现理解起来起来 tw 的属性非常自然

例如，他的数值设计，就和 antd 的数值设计保持了神奇的默契，居然一模一样。

```
class="text-2xl"
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcGc5Fyc5TFaxSlFC7l7HgfIKpexXl5NM6vak7kuYU0mBa7tbl3U6IeznWR9KyLnFZImkjAmvlNWZw/640?wx_fmt=png&from=appmsg)

当然，你们团队的设计师不一定是这种设计标准。如果不一致的话，那么我们就需要对应的去调整以达到符合团队的要求。

* * *

### 总结

tailwindcss 的映射包含两个部分，一个是字符缩写与 css 属性名之间的映射。一个是值缩写与 css 属性值之间的映射。由于 tw 在默认映射的设计过程中，加入了设计语言，而并非纯技术语言，因此，许多小伙伴在理解和运用的时候往往不得其法。

理解 tailwindcss 设计语言，是彻底成为资深 tailwindcss 高手的关键。这能够让你与团队的设计师更加紧密的合作。当然，如果你们团队没有优秀的设计师，或者你自身也更想要随意发挥的自由度，那么 **unocss 可能会更适合你。**

但是我认为，调整项目的架构与自身设计团队紧密的契合在一起，是一名前端工程师进阶为资深道路上需要去做好的一件事情，也是一名**前端架构师必备的基础能力之一**。很多团队在这件事情上面没有处理好，所以在开发 C 端项目时，整个团队都会有非常多的困扰，最糟糕的是，团队成员相互之间也不清楚困扰到底是如何产生的。

* * *

**推荐阅读**

成为 React 高手，推荐阅读 [`React 哲学`](http://mp.weixin.qq.com/s?__biz=MzI4NjE3MzQzNg==&mid=2649867007&idx=1&sn=6443ff970cd077bbb50de74ce84afa06&chksm=f3e5936cc4921a7aba3fbf748b2f5a40369d8be7b6b2acf618f0701f477abea48b00e953165e&scene=21#wechat_redirect)

点击阅读原文，系统学习 `React 19`