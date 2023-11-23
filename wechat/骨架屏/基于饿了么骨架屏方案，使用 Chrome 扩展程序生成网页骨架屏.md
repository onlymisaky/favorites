> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/434-NVOHZ_-5rLwCpY9y3A)

前言
--

> ❝
> 
> 之前写移动端项目的时候，使用骨架屏来解决首屏渲染时出现短暂空白现象，采用了就是饿了么`page-skeleton-webpack-plugin`方法
> 
> ❞

但是`page-skeleton-webpack-plugin`需要`puppeteer`这个依赖，这玩意会导致整个项目在开发阶段`很笨重`, 而且不是所有的页面都要用到骨架屏，后面找了套方案，决定使用`谷歌插件`代替`puppeteer`

Chrome 扩展程序生成网页骨架屏
------------------

> ❝
> 
> 谷歌插件下载
> 
> ❞

![](https://mmbiz.qpic.cn/mmbiz_png/ygUAW1Il7aSLLDD5HzXNKRiaxZ3dIlqs0FZzfQJ8r8v55lMWY0EIh7hUxmbwGhD2ibk75uZI6Aibv30FdyGMS5U6w/640?wx_fmt=png)image.png

最新版本下载地址，还未通过谷歌官方审核, PS: 谷歌插件如何安装，自行谷歌

### 效果图

![](https://mmbiz.qpic.cn/mmbiz_png/ygUAW1Il7aSLLDD5HzXNKRiaxZ3dIlqs0O4E63CWvATq68OLwI55erID04ZgQ08HB3fr8aA65Ah5QXPFXqTHFyg/640?wx_fmt=png)

![](https://mmbiz.qpic.cn/mmbiz_png/ygUAW1Il7aSLLDD5HzXNKRiaxZ3dIlqs0S5azbRubh4kFnIlOVibFtAD9UaKrbscH3081Xu3byDsDyjShENt1cwg/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/ygUAW1Il7aSLLDD5HzXNKRiaxZ3dIlqs0INlcdwPcFDdfiatStQMpq6Eetko3N1xQ09zjicGV34aklg6JAzHGVllg/640?wx_fmt=png)

如何使用
----

### 插件参数

> ❝
> 
> 同饿了么骨架屏文档保持一样，如下图
> 
> ❞

![](https://mmbiz.qpic.cn/mmbiz_png/ygUAW1Il7aSLLDD5HzXNKRiaxZ3dIlqs09aBh5TyTwhwCw27TbibJ47R0yPbBs0SiaW1vRJ8TAWnxxAIFMrfBEv7A/640?wx_fmt=png)

骨架屏原理
-----

> ❝
> 
> 饿了么骨架屏原理, 具体可以看看这篇文章
> 
> ❞

其实思路很简单，我们可以根据`已有的dom结构`，覆盖指定上的颜色，这样就大致实现了，不过这套方案有两个`难点`

*   如何辨别`容器和块`
    
*   css 冗余样式和冗余 dom 结构处理
    

容器和块
----

> ❝
> 
> 因为不是所有的 dom 节点都覆盖指定的背景色，有些 dom 是`作为容器`，来看`饿了么`是怎么处理的
> 
> ❞

```
// 将所有拥有 textChildNode 子元素的元素的文字颜色设置成背景色，这样就不会在显示文字了。  if (ele.childNodes && Array.from(ele.childNodes).some((n) => n.nodeType === Node.TEXT_NODE)) {   transparent(ele)  }  if (checkHasTextDecoration(styles)) {   ele.style.textDecorationColor = TRANSPARENT  }  // 隐藏所有 svg 元素  if (ele.tagName === 'svg') {   return svgs.push(ele)  }  // ! 针对于容器中如果有background或者img的 如果有需要当做块处理 否则就以容器为处理  if (EXT_REG.test(styles.background) || EXT_REG.test(styles.backgroundImage)) {   return hasImageBackEles.push(ele)  }  // export const GRADIENT_REG = /gradient/  // CSS linear-gradient() 函数用于创建一个表示两种或多种颜色线性渐变的图片  if (GRADIENT_REG.test(styles.background) || GRADIENT_REG.test(styles.backgroundImage)) {   return gradientBackEles.push(ele)  }  if (ele.tagName === 'IMG' || isBase64Img(ele)) {   return imgs.push(ele)  }  if (   ele.nodeType === Node.ELEMENT_NODE &&   (ele.tagName === 'BUTTON' || (ele.tagName === 'A' && ele.getAttribute('role') === 'button'))  ) {   return buttons.push(ele)  }  if (   ele.childNodes &&   ele.childNodes.length === 1 &&   ele.childNodes[0].nodeType === Node.TEXT_NODE &&   /\S/.test(ele.childNodes[0].textContent)  ) {   return texts.push(ele)  } })(rootElement) // ! dom节点 引用类型  这里统一收集对应类型的dom 然后集中用对应的handler处理 console.log('button数组', buttons) console.log('hasImageBackEles', hasImageBackEles) console.log(pseudos, gradientBackEles, grayBlocks) svgs.forEach((e) => handler.svg(e, svg, cssUnit, decimal)) texts.forEach((e) => handler.text(e, text, cssUnit, decimal)) buttons.forEach((e) => handler.button(e, button)) console.log('imgs数组', imgs) hasImageBackEles.forEach((e) => handler.background(e, image)) imgs.forEach((e) => handler.image(e, image)) pseudos.forEach((e) => handler.pseudos(e, pseudo)) gradientBackEles.forEach((e) => handler.background(e, image)) grayBlocks.forEach((e) => handler.grayBlock(e, button))
```

解决的方式很简单，根据该 dom 是否有`background、backgroundImage、linear-gradient`是否为`容器`

css 冗余样式和冗余 dom 结构处理
--------------------

> ❝
> 
> `饿了么`那套解决方案是有对冗余节点和样式做了处理，但是效果并不是很明显，我们换种思路想，竟然我们已经知道那个节点是容器，那个节点是`块`，那么我们是不是对于`容器`这种节点做剔除，因为真正展示在页面的是对应的`骨架屏块`，而对于具体位置，可以使用绝对定位，通过`getBoundingClientRect`这个 api 获取
> 
> ❞

最后
--

欢迎关注【前端瓶子君】✿✿ヽ (°▽°) ノ✿  

回复「算法」，加入前端算法源码编程群，每日一刷（工作日），每题瓶子君都会很认真的解答哟！  

回复「交流」，吹吹水、聊聊技术、吐吐槽！

回复「阅读」，每日刷刷高质量好文！

如果这篇文章对你有帮助，「在看」是最大的支持  

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQQYTquARVybx8MjPHdibmMQ3icWt2hR5uqZiaZs5KPpGiaeiaDAM8bb6fuawMD4QUcc8rFEMrTvEIy04cw/640?wx_fmt=png)

》》面试官也在看的算法资料《《

“在看和转发” 就是最大的支持