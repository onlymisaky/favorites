> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/3vHIaIrhSZBP5LfA5K9bSw)

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcGF4OJnZrrzcf8XnvdiaL2MhBjo9bxIwrZwN1y0jyelFmHUfH7WTgL2mqtUojicPNntlMILrjvMnyzw/640?wx_fmt=png&from=appmsg)

由于最近遇到了好几个付费找我咨询过的朋友都因为工作中需要实现一些复杂的动画而遭遇了一些职场瓶颈，所以我可能最近会多写几篇关于 `motion/react` 的文章，帮助大家快速掌握一些实用又简单的动画技巧来应对工作中的一些看上去有点难度的动画需求。

这，是一篇值得收藏的文章。

因为，我将要为大家分享，如何实现**视差滚动**：一个哪怕我工作了十多年，也觉得能够大幅度提高网站质感的重要技术点。

通常情况下，由于它的实现难度相对偏高，逻辑比较复杂，加上许多人在实现滚动视差时，没有找到合适的布局方案，加重了实现的复杂度，因此，要完成一个滚动视差效果，需要花费大量的时间才能做到。

这篇文章为要分享的是，如何基于 `motion`，再结合巧妙的布局思路，来**用少量代码快速实现滚动视差效果**。

先来看一下我在我的专栏《React 19 全解》网站上运用的效果，注意观察背景图在滚动过程中的变化。

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/Kn1wMOibzLcGF4OJnZrrzcf8XnvdiaL2MhWEONzibX9d1hBfHl8diaD99dBSl8hjnt7H4Nib7OuPw3iaCbwSeiciaavFicw/640?wx_fmt=gif&from=appmsg)

> ✓
> 
> 你可以点击文末的**阅读原文**访问网站体验效果，也可以直接在浏览器中访问 `usehook.cn` 体验

学习这篇文章时，如果你发现有一些基础不清楚，可以翻到前面的文章补充学习

*   [往期 1、motion 基础知识介绍](https://mp.weixin.qq.com/s?__biz=MzI4NjE3MzQzNg==&mid=2649871371&idx=1&sn=6bc9d4401befb3851c072f770bdd5310&scene=21#wechat_redirect)
    

### 1、useScroll()

`useScroll` 用于创建容器滚动与动画之间的链接关系。

引入

```
import {motion, useScroll} from 'motion/react'
```

使用

```
const { scrollYProgress } = useScroll()return <motion.div style={{ scaleX: scrollYProgress }} />
```

**在使用时一定要注意，这个函数和普通的 React 自定义 hook 是不同的，它不是基于 state 来维护状态。因此，并不会在滚动的过程中频繁的导致组件重新执行。**

他的实现原理是直接与真实 DOM 节点建立绑定关系，然后控制有限的几个节点。因此在使用过程中，我们**无须担心 React 的渲染机制对动画造成额外的负担**。

`useScroll` 返回 4 个值

*   1、scrollX：目标容器在 x 轴方向的滚动位置，以像素为单位
    
*   2、scrollXProgress：定义的偏移量的滚动位置，这个值在 0 ~ 1` 之间变化，记录的是滚动位置与偏移总量之间的比值
    
*   3、scrollY：目标容器在 y 轴方向的滚动位置，以像素为单位
    
*   4、scrollYProgress：定义的偏移量的滚动位置，这个值在 0 ~ 1` 之间变化，记录的是滚动位置与偏移总量之间的比值
    

有了这个知识点，我们来实现一个记录滚动位置的顶部横向进度条。演示效果如下图所示

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/Kn1wMOibzLcGF4OJnZrrzcf8XnvdiaL2MhLOCcopNvFVu0GXdDVaVhslR6UnN3ibcC19ZJphuCibKjqQ6mysMbSnwQ/640?wx_fmt=gif&from=appmsg)

核心代码非常简单

```
import { LoremIpsum } from "./components/LoremIpsum";import { motion, useScroll } from "framer-motion";export default function App() {  const { scrollYProgress } = useScroll();  return (    <>      <motion.div        class        style={{ scaleX: scrollYProgress }}      />      <h1>        <code>useScroll</code> demo      </h1>      <LoremIpsum />    </>  );}
```

> i
> 
> > > 案例演示地址：https://codesandbox.io/p/sandbox/framer-motion-usescroll-xwdxbt?file=%2Fsrc%2FApp.tsx%3A1%2C1-21%2C1&from-embed

### 2、useSpring()

在上面的案例中，元素的缩放样式是直接被修改。我们可以使用 `useSpring` 将它对元素值的修改加上动画样式，让改变变得更加柔和。

演示效果如下所示

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/Kn1wMOibzLcGF4OJnZrrzcf8XnvdiaL2MhBte2WYHAKknw1cYEAxic9jVoAvwtfibAd1YSvKficgKo16Osvmp5ga2Pg/640?wx_fmt=gif&from=appmsg)

核心代码为

```
import "./styles.css";import { LoremIpsum } from "./components/LoremIpsum";import { motion, useScroll, useSpring } from "framer-motion";export default function App() {  const { scrollYProgress } = useScroll();  const scaleX = useSpring(scrollYProgress, {    stiffness: 100,    damping: 30,    restDelta: 0.001  });  return (    <>      <motion.div         class         style={{ scaleX }}       />      <h1>        <code>useScroll</code> with spring smoothing      </h1>      <LoremIpsum />    </>  );}
```

### 3、useMotionValueEvent()

由于 `useScroll` 并不是基于 react state 创建的自定义 hook，因此滚动过程中不会触发组件函数 `rerender`，所以，如果你想要获得滚动过程中，`scrollYProgress` 的每一次回调的值，不能直接通过打印获得

```
const { scrollYProgress } = useScroll()// 滚动过程中仅执行一次console.log(scrollYProgress)
```

如果需要获得每一次滚动回调的值，我们需要借助 `useMotionValueEvent` 来实现

```
const { scrollY } = useScroll()useMotionValueEvent(scrollY, "change", (latest) => {  console.log("Page scroll: ", latest)})
```

### 4、判断滚动方向

在页面的动画交互中，判断滚动方向是一个很常见的需求，我们可以使用 `useMotionValueEvent` 来判断滚动方向，核心代码如下

```
const { scrollY } = useScroll()const [scrollDirection, setScrollDirection] = useState("down")useMotionValueEvent(scrollY, "change", (current) => {  const diff = current - scrollY.getPrevious()  setScrollDirection(diff > 0 ? "down" : "up")})
```

### 5、案例：圆环记录滚动位置

我们前面提到过一个知识点很重要，`useScroll` 是记录滚动元素的滚动信息，也就意味着，我们可以通过传入参数绑定我们需要的滚动容器元素。默认情况下，是以页面作为滚动容器。

当我们以页面作为滚动容器时，一个非常麻烦的事情就是如果其他元素的样式，要根据页面滚动位置进行计算，就变得非常麻烦，因为参照物范围太大了，这种额外的计算工作量让视差的实现变得非常复杂。

因此，一个巧妙的方式就是我们可以通过绑定不同的滚动容器，**让滚动容器与动画元素保持一致的参照物**，那么，滚动视差效果的实现，就会简单很多。

我们可以传入 `container` ，来绑定目标滚动容器。

```
const { scrollXProgress } = useScroll({ container: ref });
```

现在基于这个理论，我们来实现一个横向滚动的案例，用圆环填充进度来记录滚动位置。演示效果如下所示

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/Kn1wMOibzLcGF4OJnZrrzcf8XnvdiaL2MhTxiamy7BdkckC5Un5xjrKQuPmnkpibFZu6aupdyibxENNFJOs18GPIt8w/640?wx_fmt=gif&from=appmsg)

核心代码非常简单

```
import "./styles.css";import { useRef } from "react";import { motion, useScroll } from "framer-motion";export default function App() {  const ref = useRef(null);  const { scrollXProgress } = useScroll({ container: ref });  return (    <>      <svg id="progress" width="100" height="100" viewBox="0 0 100 100">        <circle cx="50" cy="50" r="30" pathLength="1" class          style={{ pathLength: scrollXProgress }}        />      </svg>      <ul ref={ref}>        <li></li>        <li></li>        <li></li>        <li></li>        <li></li>        <li></li>        <li></li>        <li></li>        <li></li>        <li></li>        <li></li>      </ul>    </>  );}
```

> i
> 
> > > 完整演示地址：https://eg6fm3.csb.app/

### 6、计算值 `useTransform()`

走动这里，基本上都能实现我们的目标效果了，但是，别急，还有技术细节需要注意。

我已经在文章中强调了好几遍，`useScroll` 不会导致函数组件重新执行，因此，当我们想要修改的动画元素属性，是基于 `scrollYProgress` 算出来的，又应该怎么办呢？

如果我们按照常规的 React 思维，这样做就会发现毫无效果，例如

```
return <motion.div style={{ backgroundColor: `rgba(0, 0, 0, scrollYProgress)` }} />
```

一定要再次强调，`motion` 并没有基于 React 的本身的 diff 更新机制来实现元素属性的变化，**他更类似于是在 React 内部重写了一套 Vue**，因此，在开发思维上要做好调整与转变。

> ✓
> 
> 理解这句话特别重要，是无痛使用 `motion/react` 的关键

此时，我们需要重新使用另外的一个 API 来实现计算属性：`useTransform()`

```
const { scrollXProgress } = useScroll({ container: ref });const backgroundColor = useTransform(  scrollYProgress,  [0, 0.5, 1],  ["#f00", "#0f0", "#00f"])return <motion.div style={{ backgroundColor }} />
```

`useTransform` 有两种传参的方式

```
// Transform functionuseTransform(() => x.get() * 2)// Value mappinguseTransform(x, [0, 100], ["#f00", "00f"])
```

这里留一下一个简单的思考题，为什么需要使用 `x.get()` 来参与计算属性的计算，以及关于 `scrollY` 应该是一个什么类型的值？

第二种参数方案，专门针对动画变换，第一个参数表示计算的基础值

第二个参数和第三个参数都是数组，其中第二个参数数组表示输入值的范围，例如 `scrollYProgress` 输入值的范围是 `0 ~ 1`，

第三个参数数组表示输出值范围。输出值是当前我们所需要的动画值的变化范围。他必须要与第二个数组值一一对应。

例如，针对背景颜色的变化，我们就可以这样传参

```
useTransform(  scrollYProgress,   [0, 0.5, 1],   ["#f00", "#0f0", "#00f"])
```

语义表示为，

当 scrollYProgress = 0 时，背景颜色为 `#f00`

当 scrollYProgress = 0.5 时，背景颜色为 `#0f0`

当 scrollYProgress = 1 时，背景颜色为 `#00f`

这个需要大家在使用时好好揣摩理解一下，有点绕。

### 7、案例：我的首页效果

OK，铺垫了这么多基础知识，我们终于可以来实现我的专栏首页所展示的效果了。重新看一眼演示效果。

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/Kn1wMOibzLcGF4OJnZrrzcf8XnvdiaL2MhWEONzibX9d1hBfHl8diaD99dBSl8hjnt7H4Nib7OuPw3iaCbwSeiciaavFicw/640?wx_fmt=gif&from=appmsg)

首先，**确定一致性的参照物**。这一点非常非常重要，是简化我们实现逻辑的重要思想。

因此，我们的滚动容器标记为 `banner` 组件，并且变化的背景图片，在布局上也以 banner 为参考。具体的布局信息请注意观察 `className`，我这里使用的是 tw，并没有额外使用其他的样式。

```
<motion.div id='banner' ref={containerRef} className='relative overflow-hidden -mt-16'>  <div className='bg-white bg-opacity-90'>    ...  </div>  <motion.div className='absolute -z-10 bottom-0 h-full w-full bg-blue-300 min-w-[1255px]' style={{opacity, translateY, scale }}>    <img classhttps://buildui.com/_next/image?url=https%3A%2F%2Fmedia.graphassets.com%2F82X8TbwR0mxbABn6Hyoi&w=750&q=75" alt="" />  </motion.div></motion.div>
```

敲定了统一参照物之后，代码上就体现为，注意看 target

```
const containerRef = useRef(null)const {scrollYProgress} = useScroll({  target: containerRef,  offset: ['end start', 'start start']})
```

剩下的就是根据 `scrollYProgress` 计算出要变化的值。这里由于元素是默认出现，然后滚动消失，因此输入值数组传入的是 `[1, 0]`

当我们滚动容器时，由于容器 banner 会正常滚动，默认情况下，背景图片基于 banner 进行的绝对定位，也会同步跟随滚动，为了营造视差效果，我们让图片的 y 轴位置发生一个额外的新变化：translateY 向下小幅度移动。然后在移动的过程中进行缩放与透明度变化

```
const translateY = useTransform(  scrollYProgress,  [1, 0],  [0, 555])const opacity = useTransform(  scrollYProgress,  [1, 0],  [1, 0])const scale = useTransform(  scrollYProgress,  [1, 0],  [1.5, 1])
```

然后把这些值，复制给动画元素的 `style` 即可。

### 8、总结

最终的代码非常简单，但是中间需要掌握的前置知识点和小巧思是比较多的。因此要彻底消化为自己的东西，还是需要一点时间。

实际上这些小巧思的方案最终很简单，但是许多朋友通过自己的思考很难想到这里去，所以在面对这些需求时往往会一筹莫展。所以在看到最终代码比较简单的同时，我们也要学会对其实现难度保持高度的认可，而并不是因为最终的方案简单，而判定他本身就简单。这一点认知在职场中，对与自我价值评定非常重要。

如果你总是把方案简单，与这个东西也简单完全对等起来的话，你会损失大量的自我价值认知。

除此之外，`motion/react` 一个非常有意思的点是，他没有基于 `react` 的更新机制来实现状态联动，而是在 react 内部维护了一套类似于 `vue3` 的方案来保持动画元素与状态之间的联系。这种有机结合的实践非常值得我们借鉴和思考。

最后，关于 `motion` 的更详细的解读和学习，我会放在我的付费小册 `https://react.usehook.cn` 中供大家学习，购买了 《NextJS 启动》的朋友可以完整阅读体验。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcGF4OJnZrrzcf8XnvdiaL2Mhx9YHPucMBoTMalcLIK8Fs0XYtRTa1bM8sZxqicuQicictODiaCEPiaHu4Fg/640?wx_fmt=png&from=appmsg)

### **9、付费专栏推荐**

*   [基础知识体系：JavaScript 核心进阶](https://mp.weixin.qq.com/s?__biz=MzI4NjE3MzQzNg==&mid=2649870830&idx=1&sn=a3ac2d44208853efba3a24b87aad8fd5&scene=21#wechat_redirect)
    
*   [React 进阶：React 哲学](https://mp.weixin.qq.com/s?__biz=MzI4NjE3MzQzNg==&mid=2649867007&idx=1&sn=6443ff970cd077bbb50de74ce84afa06&scene=21#wechat_redirect)
    
*   [全新开发思维：React 19 全解](https://mp.weixin.qq.com/s?__biz=MzI4NjE3MzQzNg==&mid=2649870562&idx=1&sn=7364fcc9ae398e1c78bfb013a93e24e3&scene=21#wechat_redirect)