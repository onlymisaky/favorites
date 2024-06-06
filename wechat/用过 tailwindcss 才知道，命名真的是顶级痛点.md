> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/IIVGyqjNh3ykBTAuTTmPLA)

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcHzyzwSxfiadeuj5PH8yRvSHBffQ7picTh4a0FCXwjBf04Oj3pydYs3QPdWIOb6mGGArpKdN6ebxz7Q/640?wx_fmt=png&from=appmsg)

tailwindcss **那是真香！**

对 tailwindcss 早有耳闻，但在我以前的观念里，tailwindcss 那简直就是**开历史倒车**，所谓的原子化 css，不就是早年的 bootstrap 么？我怎么可能接受这样的技术方案？

早年 **bootstrap** 盛行的时候，我都没看它一眼。在 jquery 与 angular 的年代里，bootstrap 有多火呢？

那会儿许多公司都把 bootstrap 作为基本要求写在职位要求里的，你不会，找工作别人都不要你，现在 antd 这么火，可都没这个待遇。可它都火成这样了，我也没把它放在心上，因为这个技术方案就是有着很明显的痛点。你一看这代码一长串的 class 名，就感觉很糟心。

```
<figure class="md:flex bg-slate-100 rounded-xl p-8 md:p-0 dark:bg-slate-800">  <img class="w-24 h-24 md:w-48 md:h-auto md:rounded-none rounded-full mx-auto" src="/sarah-dayan.jpg" alt="" width="384" height="512">  <div class="pt-6 md:p-8 text-center md:text-left space-y-4">    <blockquote>      <p class="text-lg font-medium">        “Tailwind CSS is the only framework that I've seen scale        on large teams. It’s easy to customize, adapts to any design,        and the build size is tiny.”      </p>    </blockquote>    <figcaption class="font-medium">      <div class="text-sky-500 dark:text-sky-400">        Sarah Dayan      </div>      <div class="text-slate-700 dark:text-slate-500">        Staff Engineer, Algolia      </div>    </figcaption>  </div></figure>
```

所以 tailwindcss 这风格，我第一时间哪里能接受得了。直到后来，我深度使用了小半年的鸿蒙开发之后，我这刻板印象直接就变了。

**道友们，谁懂啊，不用想怎么写 class 名有多爽？**

_0_
---

**arkUI 风格**

鸿蒙开发的语言风格设计，其实被许多的前端所不接受。我随便贴一段代码，大家感受一下

```
Circle({ width: 120, height: 120 })  .fill('#e6f1fe')  .stroke(Color.White)  .strokeWidth(1)  .position({ x: '50%', y: '50%' })  .translate({x: -60, y: -60})
```

可以很明显的看出，第一排是组件名，后面跟的都是各种样式。这玩意儿第一印象给人的感觉，就是 tailwindcss 一毛一样。这么也太复杂了，如果样式写多了，那还得了，代码还能看吗？

但是我写着写着，你猜怎么着？越写越爽。为什么呢？这个跟 arkUI 独特的布局设计有关系。他默认支持了许多自带默认布局风格的容器组件。这些容器组件你一看就知道他要支持什么布局，例如

```
Flex()
Stack()
Row()
Clomn()
Tab()
```

所以呢，这种直接以容器属性来主导的布局风格就跟传统的 css 不一样。有了这种思维引导，我在开始写代码的时候，我就想好了布局是个什么特性，就顺着往下写了。然后要补什么样式，就直接跟在后面补充，我的布局思路是基本上连贯的，一气呵成。

但是我以前写 css 的时候是个什么思维呢。首先第一步，我要先思考布局结构是什么，所以我就会先这样写

```
<div>  <div>01</div>  <div>02</div>  <div>03</div>  <div>04</div></div>
```

写好之后呢，我才回过头去重新分析布局特性是什么，应该用什么样的属性来约束。这个时候，其实我的布局思维已经被拆解成了两个步骤。

**然后紧跟着大问题就来了，我这个父级容器，应该叫个什么名字呢？**

ok，是个父元素，那么我就叫他 `wrapper`，结果一回头，发现这个单词，已经被根节点用过了。这就不能用了，那我叫 `container`，也被用了....

那我用 box... 那下一个容器节点用啥？我加前缀 `flex-wrapper` ...

回过头来一看，想个名字，10 分钟过去了。不管了，用 `container_1`...

然后问题又来了，子元素又起什么名字呢？....

一通头脑风暴之后，随便吧...

```
<div class='container_1'>  <div class='item'>01</div>  <div class='item'>02</div>  <div class='item'>03</div>  <div class='item'>04</div></div>
```

接下来我要干啥来着？忘记了... 我得重新顺一遍思路

想起来了，要在 css 文件里加样式。这里加样式也有一个痛点。那就是调样式的时候。文件要来回切换....

我一直都知道这是个痛点，所以我用的编辑器就得支持分屏，把 css 拖在另外一边。但是这样搞了之后，改的页面多了吧，css 堆来堆去的，最后就对应不上了，也不太爽 ...

这个时候，我才会重新思考，父节点是一个 flex 容器，然后开始慢慢加样式。

```
.container_1 {  display: flex}.item {}
```

一看，效果不对，哦，原来 item 已经被其他地方用过了，不能直接这样使用，然后又要调整一下

```
.container_1 {  display: flex    .item {...}}
```

**我以前当然知道起名字，切文件是个痛点，但是没觉得有这么痛啊。** 习惯了 arkUI 这种流畅的编写体验之后，我回来写前端项目，我尼玛，这什么鬼...

回不去了！

一个非常明显的感受就是，css 分离的方式，思维经常被打断，不连贯，但是 arkUI 写布局就非常舒适，我现在甚至可以做到直接一口气把样式写完，然后再看一眼预览，发现就跟设计图长得一样，但是我以前写 css 的时候，就很难做到这一点

_1_
---

**tailwindcss 拯救了我**

所以我就想，前端里面有没有什么 css in js 的方案，可以做到类似 arkUI 的开发体验。然后我就重新发现了 tailwindcss。这次我强迫自己不要去思考写出来的结果有多糟心，反正用了再说。

这里我有一个很重要的思维转变就是接了别人的项目之后，我想的反正这个项目最后也不是我来维护，交给别人去做就行，于是 class 名很长一串，看着挺恶心我也觉得没什么了，但是写着写着发现，维护起来也没那么麻烦，反而非常的方便

项目中集成了 tailwindcss 之后，猛然发现在 webStorm 中，居然默认支持了这个玩意儿非常完整的代码提示

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcHzyzwSxfiadeuj5PH8yRvSHE9L4J7xKYibZgCRb5sNZAIxR1ucdpOIbHCbqbaDPrxDWYzAd6bAwdxw/640?wx_fmt=png&from=appmsg)

这个时候，非常爽的地方来了。比如我想要一个 `margin: 1px` 这样的属性，我只需要输入 `m1` 然后回车，就可以直接得到 `m-1` 的显示结果。

> ✓
> 
> margin: 1px 与 m-1 的映射关系可以自己配置

对我来说，这个地方爽在哪呢？这不就跟我以前输入 css 样式的时候，基本上一致的补全逻辑吗。而且 tailwindcss 的这个自动补全还要更简单更好用一些。我刚开始还以为需要很高的学习成本，这尼玛，0 成本上手了呀。

所以其他的优势劣势什么的不考虑了，冲着这个这么好用的自动补全插件，all in！我又再次找回了写 arkUI 那种很爽的感觉。以后写组件也不用单独创建额外的样式文件了。

不用分屏之后，你猜怎么着，在一个很宽的代码区域里，看着这样的代码，居然也没觉得有多糟心。还行...

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcHzyzwSxfiadeuj5PH8yRvSHfYGRqrpdYDxJXgUaMEuXuzS17ibeHiaz1UKpqDeGIum90ibV8ozYa3hibQ/640?wx_fmt=png&from=appmsg)

_2_
---

**其他爽点**

tailwindcss 的媒体查询的便捷性确实让我感到很舒服。主要是媒体查询这玩意儿，我经常忘记它的语法。哪怕以前连续写了一年多的响应式布局，这语法还是没记住。

然后在 tailwindcss 中，我只需要加个前缀 `md:w-32`，轻松搞定。而且他默认给定的断点数值跟我的工作经验中得到的结论是比较一致的。

<table><thead><tr><th data-style="line-height: 1.5em; letter-spacing: 0em; width: auto; height: auto; border-radius: 0px; padding: 14px; min-width: 85px; text-align: left; font-size: 13px !important; background-color: rgb(0, 0, 0); color: rgb(255, 255, 255) !important; border-top-width: 1px !important; border-color: rgb(0, 0, 0);">pre</th><th data-style="line-height: 1.5em; letter-spacing: 0em; width: auto; height: auto; border-radius: 0px; padding: 14px; min-width: 85px; text-align: left; font-size: 13px !important; background-color: rgb(0, 0, 0); color: rgb(255, 255, 255) !important; border-top-width: 1px !important; border-color: rgb(0, 0, 0);">value</th><th data-style="line-height: 1.5em; letter-spacing: 0em; width: auto; height: auto; border-radius: 0px; padding: 14px; min-width: 85px; text-align: left; font-size: 13px !important; background-color: rgb(0, 0, 0); color: rgb(255, 255, 255) !important; border-top-width: 1px !important; border-color: rgb(0, 0, 0);">css</th></tr></thead><tbody><tr data-style="background: none 0% 0% / auto no-repeat scroll padding-box border-box rgb(255, 255, 255); width: auto; height: auto;"><td data-style="padding-top: 12px; padding-bottom: 12px; padding-left: 14px; line-height: 2em; min-width: 85px; border-color: rgba(204, 204, 204, 0.4); border-radius: 0px; font-size: 13px !important;">sm</td><td data-style="padding-top: 12px; padding-bottom: 12px; padding-left: 14px; line-height: 2em; min-width: 85px; border-color: rgba(204, 204, 204, 0.4); border-radius: 0px; font-size: 13px !important;">640px</td><td data-style="padding-top: 12px; padding-bottom: 12px; padding-left: 14px; line-height: 2em; min-width: 85px; border-color: rgba(204, 204, 204, 0.4); border-radius: 0px; font-size: 13px !important;">@media (min-width: 640px) {}</td></tr><tr data-style="width: auto; height: auto; background: rgb(250, 247, 254);"><td data-style="padding-top: 12px; padding-bottom: 12px; padding-left: 14px; line-height: 2em; min-width: 85px; border-color: rgba(204, 204, 204, 0.4); border-radius: 0px; font-size: 13px !important;">md</td><td data-style="padding-top: 12px; padding-bottom: 12px; padding-left: 14px; line-height: 2em; min-width: 85px; border-color: rgba(204, 204, 204, 0.4); border-radius: 0px; font-size: 13px !important;">768px</td><td data-style="padding-top: 12px; padding-bottom: 12px; padding-left: 14px; line-height: 2em; min-width: 85px; border-color: rgba(204, 204, 204, 0.4); border-radius: 0px; font-size: 13px !important;">@media (min-width: 768px) {}</td></tr><tr data-style="background: none 0% 0% / auto no-repeat scroll padding-box border-box rgb(255, 255, 255); width: auto; height: auto;"><td data-style="padding-top: 12px; padding-bottom: 12px; padding-left: 14px; line-height: 2em; min-width: 85px; border-color: rgba(204, 204, 204, 0.4); border-radius: 0px; font-size: 13px !important;">lg</td><td data-style="padding-top: 12px; padding-bottom: 12px; padding-left: 14px; line-height: 2em; min-width: 85px; border-color: rgba(204, 204, 204, 0.4); border-radius: 0px; font-size: 13px !important;">1024px</td><td data-style="padding-top: 12px; padding-bottom: 12px; padding-left: 14px; line-height: 2em; min-width: 85px; border-color: rgba(204, 204, 204, 0.4); border-radius: 0px; font-size: 13px !important;">@media (min-width: 1024px) {}</td></tr><tr data-style="width: auto; height: auto; background: rgb(250, 247, 254);"><td data-style="padding-top: 12px; padding-bottom: 12px; padding-left: 14px; line-height: 2em; min-width: 85px; border-color: rgba(204, 204, 204, 0.4); border-radius: 0px; font-size: 13px !important;">xl</td><td data-style="padding-top: 12px; padding-bottom: 12px; padding-left: 14px; line-height: 2em; min-width: 85px; border-color: rgba(204, 204, 204, 0.4); border-radius: 0px; font-size: 13px !important;">1280px</td><td data-style="padding-top: 12px; padding-bottom: 12px; padding-left: 14px; line-height: 2em; min-width: 85px; border-color: rgba(204, 204, 204, 0.4); border-radius: 0px; font-size: 13px !important;">@media (min-width: 1280px) {}</td></tr></tbody></table>

所以在以前我其实非常不愿意写媒体查询，因为写出来的 css 代码真的乱，而且写完之后，逻辑也经常自己都看不懂。在 tailwindcss 中写媒体查询就非常简单了

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/Kn1wMOibzLcHzyzwSxfiadeuj5PH8yRvSHdKMOic1w8Y0BqLzuqwYWMLN2T02ib23sicPHqNS82NNNL8ia0bvXNSia10g/640?wx_fmt=gif&from=appmsg)

```
<div className='w-16 md:w-32 lg:w-48'></div>
```

> ✓
> 
> tailwindcss 的约定是移动端优先，因此这里的小屏幕尺寸直接使用 `w-16`，不用特别加前缀标注。这里还有一个小小的爽点就是之前输入过的变量名，在提示列表中会排在前列

在 UI 设计上，tailwindcss 也提供了非常高级的设计效果。他不仅专门设计了一款更优雅的字体，还**提供了超赞的 icon**

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcHzyzwSxfiadeuj5PH8yRvSHpezHXPRGLwtJ6Zc8N3UpqfwSib1vIgfexTZvRtw8lbhLMAQuh0icHJbg/640?wx_fmt=png&from=appmsg)

我们在做个人项目的时候非常有用，直接从里面找合适的就可以了，我甚至感觉以后都不用去 iconfont 上找图标了。

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/Kn1wMOibzLcHzyzwSxfiadeuj5PH8yRvSHH8aZzfibxvhkmy1gzbZXZDtmMa48OibJb6PAJtdFC9qIGbH3ZYchp1MQ/640?wx_fmt=gif&from=appmsg)

最屌的是，他们还提供了非常多完整的组件和模板。我们想用的组件，直接去它的官方复制过来就行了。我复制了一个组件用于介绍我的项目首页，大家看看怎么样

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcHzyzwSxfiadeuj5PH8yRvSHPuXdX8pRGB5dooClt8ABzDibVt9lZZn9DvzoicymTNEMYicLLDjl0ibp5A/640?wx_fmt=png&from=appmsg)

最要命的是，这个组件，居然还支持了完备的响应式布局。以后就直接从官网拷组件出来用就行了，还能轻松的改样式。这不比 antd 好用么？

**真 . 按需加载。**

可惜的是，他提供的大量的，更丰富的网页模板，要收费... 所以用用的很舒服的话，前期许多地方还得自己加工一下。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcHzyzwSxfiadeuj5PH8yRvSHzuREricOF0RpZOSvXy7JPRWuCvSL9Ghpia0gyEgk9WLIfAGAJib0OrG8A/640?wx_fmt=png&from=appmsg)

_3_
---

**headless**

tailwindcss 官网中还提到了一个很神奇的概念：**headless component**。对于我这样一个，刚从鸿蒙开发那边回过神来的人来说，这是一个新概念。具体效果怎么样我还不是很清楚，没有深度体会过。有深度使用经验的道友们可以在评论区跟我们分享一下具体的使用感受。

不过这对于喜欢定制自己 UI 的道友们而言，应该会很喜欢它。因为我总能时不时遇到有人在群里问如何修改 antd 的样式。如果能够比较自由定制自己的样式，或者小幅度调整组件样式，应该会很爽。

React 的 Tailwind UI 依赖于 Headless UI 来支持所有交互行为，并依赖于 Heroicons 来提供图标，因此你需要将这两个库添加到你的项目中：

```
npm install @headlessui/react @heroicons/react
```

> !
> 
> > 这些库和 Tailwind UI 本身都需要 React >= 16。

_4_
---

**在 vite + react 中引入**

具体如何引入，有许多文章都有说，大家可以用的时候针对性的去寻找解决方案。我这里就简单介绍一下如何在 vite + react 的项目中引入

> ✓
> 
> 后续我准备在我的小程序项目中引入 tailwindcss，如果考虑到要兼容 PC 端，兼容我之前的那一套响应式方案，那么复杂度就上来了，有不少难度要攻克，等我后面引入成功之后再跟大家分享使用体验

先在项目中引入

```
npm install tailwindcss@latest
npm install postcss@latest
npm install autoprefixer@latest
```

然后在根目录中创建配置文件

```
npx tailwindcss init
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcHzyzwSxfiadeuj5PH8yRvSH3oNCWbpjA51avuyFZmFU8ZkDlwMJudGzAd8JKWlHrNGNMxpZ9TichFQ/640?wx_fmt=png&from=appmsg)

然后就在根目录生成了一个最基础的默认配置项

```
/** @type {import('tailwindcss').Config} */export default {  content: [],  theme: {    extend: {},  },  plugins: [],}
```

这里需要根据你的实际情况做一下修改，把你想要的配置和尺寸映射关系都加上。当然这里你也可以直接使用他默认的配置，我这里就简单修改了一下。

```
/** @type {import('tailwindcss').Config} */export default {  content: [    "./index.html",    './src/**/*.{vue,js,ts,jsx,tsx}'  ],  theme: {    extend: {},  },  plugins: [],}
```

然后在根目录中创建 `postcss.config.js`，写入如下配置

```
export default {  plugins: {    tailwindcss: {},    autoprefixer: {},  },}
```

> ✓
> 
> 或者也可以在 vite.config.js 中配置 postcss

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcHzyzwSxfiadeuj5PH8yRvSH45icncz9ic7LF3ROpFfRP8PGC1FNY231q7Zfk8qibt3Wa2olIsIVkLhicg/640?wx_fmt=png&from=appmsg)

然后就可以了。创建一个 tailwind.css 文件用于引入你需要的 css 模块

```
@tailwind base;@tailwind components;@tailwind utilities;
```

并且在项目中的入口文件 `main.js` 中，引入该 css 文件，搞定。

```
import './tailwind.css'
```

_5_
---

**总结**

tailwindcss 配置了非常多的规则，因此有一定的上手难度。而且为了与有设计规范要求的项目相匹配，还需要额外做许多自定义的工作，因此刚开始使用还是需要花一点心思。使用熟练之后，在正式项目中，我们会逐渐发现有一些方式可以优雅的减少 class 名的数量，是一个用好了之后确实比较爽的技术方案。还有一些其他原子化 css 的优缺点我就不做扩展了，反正包体积大小影响也不是那么大，对我来说，核心的还是开发体验。

当然要用好的话，对于 css 基础能力还是有一点要求。我在群里讨论的时候，发现大多数群友都已经用上了，他们比我有经验得多，在群友的指导和分析利弊之下，我选择了它，也推荐给还没开始用的道友们去试试

_-_
---

**友情链接**

*   成为 React 高手，推荐阅读 [React 哲学](http://mp.weixin.qq.com/s?__biz=MzI4NjE3MzQzNg==&mid=2649867007&idx=1&sn=6443ff970cd077bbb50de74ce84afa06&chksm=f3e5936cc4921a7aba3fbf748b2f5a40369d8be7b6b2acf618f0701f477abea48b00e953165e&scene=21#wechat_redirect)