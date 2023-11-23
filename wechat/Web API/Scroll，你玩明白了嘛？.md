> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/EhD8YIh8yAGRgXcibeEFsw)

**1、引言**
--------

最近在实现列表的滚动交互时，算是被复杂的业务场景整得怀疑人生了。今天主要聊一下关于 scroll 的应用：

*   CSS 平滑滚动
    
*   JS 滚动方法
    
*   区分人为滚动和脚本滚动
    

**2、CSS 平滑滚动**
--------------

### **2.1 一行样式改善体验**

在一些滚动交互比较频繁的场景，我们可以通过在可滚动容器上增加一行样式来改善用户体验。

```
scroll-behavior: smooth;
```

比如说，在文档网站里，我们常使用 `#` 来去定位到对应的浏览位置。

![](https://mmbiz.qpic.cn/mmbiz_gif/xsw6Lt5pDCvxAWWCOfot6lMb4WjPvYwdVxFRXcQDbCIkOUvYBaZA3jCJAT73QUCGLfybJJfqye59gt1vDz4Owg/640?wx_fmt=gif)

像上面这个例子，我们首先通过 `#` 去锚定对应内容，实现了一个 tab 切换的效果：

```
<div>  <a href="#A">A</a>  <a href="#B">B</a>  <a href="#C">C</a></div><div class>    C  </div></div>
```

同时，为了实现平滑滚动，我们在滚动容器上设置了如下的 CSS：

```
.scroll-ctn {  display: block;  width: 100%;  height: 300px;  overflow-y: scroll;  scroll-behavior: smooth;  border: 1px solid grey;}
```

在 `scroll-behavior: smooth` 的作用下，容器内的默认滚动呈现了平滑滚动的效果。

### **2.2 兼容性**

IE 和 移动端 ios 上兼容性较差，必要时需要依赖 polyfill。

![](https://mmbiz.qpic.cn/mmbiz_png/xsw6Lt5pDCvxAWWCOfot6lMb4WjPvYwdsxjHs5d6t6iaUBtTTK0qL88EKs8X6Jfbtauklcztj4RFMva1OPdEqZQ/640?wx_fmt=png)

### **2.3 注意**

1、在可滚动的容器上设置了 `scroll-behavior: smooth` 之后，其优先级是高于 JS 方法的。也就是说，在 JS 中指定 `behavior: auto`，想要恢复立即滚动到目标位置的效果，将不会生效。

2、在可滚动的容器上设置了 `scroll-behavior: smooth` 之后，还能够影响到浏览器 Ctrl+F 的表现，使其也呈现平滑滚动的效果。

**3、JS 滚动方法**
-------------

### **3.1 基本方法**

我们熟知的原生 scroll 方法，大概有这些：

*   **scrollTo**：滚动到目标位置
    
*   **scrollBy**：相对当前位置滚动
    
*   **scrollIntoView**：让元素滚动到视野内
    
*   **scrollIntoViewIfNeeded**：让元素滚动到视野内（如果不在视野内）
    

以大家用得比较多的 `scrollTo` 为例，它有两种调用方式：

```
// 第一种形式const x = 0, y = 200;element.scrollTo(x, y);// 第二种形式const options = {  top: 200,  left: 0,  behavior: 'smooth'};element.scrollTo(options);
```

而滚动的行为，即方法参数中的 `behavior` 分为两种：

*   **auto**：立即滚动
    
*   **smooth**：平滑滚动
    

除了上述的 3 个 api，我们还可以通过简单粗暴的 `scrollTop`、 `scrollLeft` 去设置滚动位置：

```
// 设置 container 上滚动距离 200container.scrollTop = 200;// 设置 container 左滚动距离 200container.scrollLeft = 200;
```

值得一提的是， `scrollTop`、 `scrollLeft` 的兼容性很好。而且相较于其他的方法，一般不会出什么幺蛾子（后文会讲到）。

### **3.2 应用**

自己以往需要用到滚动的场景有：

*   组件初始化，定位到目标位置
    
*   点击当前页靠底部的某个元素，触发滚动翻页
    
*   ......
    

举个例子，现在我希望在列表组件加载完成后，列表能够自动滚动到第三个元素。

根据上面提到的我们可以用很多种方式去实现，假设我们已经为列表容器增加了 `scroll-behavior: smooth` 的样式，然后在 useEffect hook 中去调用滚动方法：

```
import React, { useEffect, useRef } from "react";import "./styles.css";export default function App() {  const listRef = useRef({ cnt: undefined, items: [] });  const listItems = ["A", "B", "C", "D"];  useEffect(() => {    // 定位到第三个    const { cnt, items } = listRef.current;    // 第一种    // cnt.scrollTop = items[2].offsetTop;    // 第二种    // cnt.scrollTo(0, items[2].offsetTop);    // 第三种    // cnt.scrollTo({ top: items[2].offsetTop, left: 0, behavior: "smooth" });    // 第四种    items[2].scrollIntoView();    // items[2].scrollIntoViewIfNeeded();Ï  }, []);  return (    <div class ref={(ref) => (listRef.current.cnt = ref)}>        {listItems.map((item, index) => {          return (            <li              class              ref={(ref) => (listRef.current.items[index] = ref)}              key={item}            >              {item}            </li>          );        })}      </ul>    </div>  );}
```

上述代码中，提到了四种方式：

*   容器的 scrollTop 赋值
    
*   容器的 scrollTo 方法，传入横纵滚动位置
    
*   容器的 scrollTo 方法，传入滚动配置
    
*   元素的 scrollIntoView / scrollIntoViewIfNeeded 方法
    

虽然最后效果都是一样的，但这几种方法实际上还是有些许差异的。

![](https://mmbiz.qpic.cn/mmbiz_gif/xsw6Lt5pDCvxAWWCOfot6lMb4WjPvYwdUIBHXTOmb1ES64vp1hCIiaDYib00nstjUqaXV0EYgt72ug7OB0BictLDA/640?wx_fmt=gif)

### **3.3 scrollIntoView 的奇怪现象**

#### **3.3.1 页面整体偏移**

最近在过一些历史用例的时候，遇到了这种情况：

![](https://mmbiz.qpic.cn/mmbiz_gif/xsw6Lt5pDCvxAWWCOfot6lMb4WjPvYwd7DMlwaZMtMsudfBEqRoaFiatibske1j6khpw1cf41E9XudibtKI6dDskw/640?wx_fmt=gif)

现象大概就是，当我通过按钮，滚动定位到聊天区域的某条消息时，页面整体发生了偏移（向上移动）。再看一眼代码，发现使用的是 scrollIntoView：

![](https://mmbiz.qpic.cn/mmbiz_png/xsw6Lt5pDCvxAWWCOfot6lMb4WjPvYwdvz35gf06T8yxQ4scrwQ2KDdRqvL76qiczhGn0n2Udia8JIfNy9g3K3Gg/640?wx_fmt=png)

因为是第一次遇到，所以上万能的 stack overflow 上逛了一圈，看到了类似的问题：scrollIntoView 导致页面整体移动 。

**这个问题常常发生在哪些情况下呢？**

1、页面有 iframe 的情况下，比如说这个例子。

表现是当 iframe 内的内容发生滚动时，主页面也发生了滚动。这显然和 MDN 上的描述不一致：

> Element 接口的 scrollIntoView () 方法会滚动元素的父容器，使被调用 scrollIntoView () 的元素对用户可见。

2、直接使用 `scrollIntoView()` 的默认参数

先说说 `scrollIntoView()` 支持什么参数：

```
element.scrollIntoView(alignToTop); // Boolean 型参数element.scrollIntoView(scrollIntoViewOptions); // Object 型参数
```

（1）alignToTop

*   如果为 `true`，元素的顶端将和其所在滚动区的可视区域的顶端对齐。相应的 `scrollIntoViewOptions: {block: "start", inline: "nearest"}`。这是这个参数的默认值。
    
*   如果为 `false`，元素的底端将和其所在滚动区的可视区域的底端对齐。相应的 `scrollIntoViewOptions: {block: "end", inline: "nearest"}`。
    

（2）scrollIntoViewOptions

包含下列属性：

*   `behavior` 可选
    
    定义动画过渡效果， `"auto"` 或 `"smooth"` 之一。默认为 `"auto"`。
    
*   `block` 可选
    
    定义垂直方向的对齐， `"start"`, `"center"`, `"end"`, 或 `"nearest"` 之一。默认为 `"start"`。
    
*   `inline` 可选
    
    定义水平方向的对齐， `"start"`, `"center"`, `"end"`, 或 `"nearest"` 之一。默认为 `"nearest"`。
    

回到我们的问题，为什么使用默认参数，即 `element.scrollIntoView()`，会引发页面偏移的问题呢？

关键在于 `block: "start"`，从上面的参数说明我们了解到，默认不传参数的情况下，取的是 `block: start`，它表示 “元素顶端与所在滚动区的可视区域顶端对齐”。但从现象上看，影响的不只是 “所在滚动区” 或者 “父容器”，祖先 DOM 元素也被影响了。

由于寻觅不到 `scrollIntoView` 的源码，暂时只能定位到是 `start` 这个默认值在做妖。既然原生的方法有问题，我们需要采取一些别的方式来代替。

#### **3.3.2 解决方式**

1、更换参数

既然是 `block: start` 有问题，那咱们换一个效果就好了，这里建议使用 `nearest`。

```
element.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
```

可能也有好奇的朋友想问，这些对齐的选项具体代表了什么含义？在 MDN 里面好像都没有做特别的解释。这里引用 stackoverflow 上的一个高赞解答，可以帮助你更好的理解。

> 1.  使用 `{block: "start"}`，元素在其祖先的顶部对齐。
>     
> 2.  使用 `{block: "center"}`，元素在其祖先的中间对齐。
>     
> 3.  使用 `{block: "end"}`，元素在其祖先的底部对齐。
>     
> 4.  使用 `{block: "nearest"}`：
>     
> 
> *   如果您当前位于其祖先的下方，则元素在其祖先的顶部对齐。
>     
> *   如果您当前位于其祖先之上，则元素在其祖先的底部对齐。
>     
> *   如果它已经在视图中，保持原样。
>     

2、scrollTop/scrollLeft

上文也提到 scrollTop/scrollLeft 赋值是兼容性最好的滚动方式，我们可以利用它来代替默认的 scrollIntoView () 的表现。

比如说置顶某个元素，可以定义可滚动容器的 scrollTop 为该元素的 offsetTop：

```
container.scrollTop = element.offsetTop;
```

值得一提的是，结合 CSS 的 scroll-behavior，这种赋值方式也可以实现平滑滚动效果。

**4、如何区分人为滚动和脚本滚动**
-------------------

### **4.1 背景**

最近遇到这么一个需求，做一个实时高亮当前播放内容的字幕文稿。核心的交互是：

1、当用户没有人为滚动文稿时，会保持自动翻页的功能

2、当用户人为滚动文稿时，后续将不会自动翻页，并出现 “回到当前播放位置” 的按钮

3、假如点击了 “回到当前播放位置” 的按钮，会回到目标位置，并恢复自动翻页的功能。

![](https://mmbiz.qpic.cn/mmbiz_gif/xsw6Lt5pDCvxAWWCOfot6lMb4WjPvYwdWxNCDwGUZ2a1opVR1iaMb7WFglctfoybjpiatePswHvObicjWqvQPZzMA/640?wx_fmt=gif)

像上面的演示中，用户触发了人为滚动，之后点击 “回到当前播放位置”，触发了脚本滚动。

### **4.2 人为滚动**

怎么定义 “人为滚动” 呢？我们所了解的人为滚动，包含：

*   鼠标滚动
    
*   键盘方向键滚动
    
*   缩进键滚动
    
*   翻页键滚动
    
*   ......
    

假如说，我们通过 onWheel、onKeyDown 等事件，去监听人为滚动，定是不能尽善尽美的。那么我们换个思路，能否去对 “脚本滚动” 下功夫？

### **4.3 脚本滚动**

怎么定义 “脚本滚动”？我们将由代码触发的滚动，定义为 “脚本滚动”。

我们需要用一种方式描述 “脚本滚动”，来和 “人为滚动” 做区分。由于它们是非此即彼的关系，那实际上我们只需要在 `onScroll` 这个事件上，通过一个 flag 去区分即可。

流程图如下：

![](https://mmbiz.qpic.cn/mmbiz_png/xsw6Lt5pDCvxAWWCOfot6lMb4WjPvYwddVnTRO6FWFiacZc9BaAYVfjzBAp8CODq94h9VZeyJcZSSlv11ia0zDBQ/640?wx_fmt=png)

而这其中唯一需要关注的点在于，需要通过什么方式知道，脚本滚动结束了？  

scrollTo 等原生方式，显然没有给我们提供回调方法，来告诉我们滚动在什么时候结束。所以我们还是需要依赖 onScroll 去监听当前的滚动位置，来得知滚动什么时候达到目标位置。

所以上面的流程还要再加一步：

![](https://mmbiz.qpic.cn/mmbiz_png/xsw6Lt5pDCvxAWWCOfot6lMb4WjPvYwdIZHWenG8r5A4zyIDKD2Sk0xozvDogeanJxF4NjzOR9z6OBeiaZvmZiaw/640?wx_fmt=png)

接下来看看代码要怎么组织。

### **4.4 代码实现**

首先看一下我们想要实现的 demo：

![](https://mmbiz.qpic.cn/mmbiz_gif/xsw6Lt5pDCvxAWWCOfot6lMb4WjPvYwdEiaHynicic80HBCV0yeaUufyVer2hAdDNcIicA5LyG1pkhU35vbY403Kww/640?wx_fmt=gif)

接下来先实现基本的页面结构。

1、定义一个长列表，并通过 `useRef` 记录：

*   滚动容器的 `ref`
    
*   脚本滚动的判断变量 `isScriptScroll`
    
*   当前的滚动位置 `scrollTop`
    

2、接着，为滚动容器绑定一个 `onScroll` 方法，在其中分别编写人为滚动和脚本滚动的逻辑，并使用节流来避免频繁触发。

在人为滚动和脚本滚动的逻辑中，我们通过更新 wording 这个状态，来区分当前处于人为滚动还是脚本滚动。

3、用一个 button 来触发脚本滚动，调用 `listScroll` 方法，传入容器 `ref`，想要滚动到的 `scrollTop` 以及滚动结束后的 `callback` 方法。

如下：

```
import throttle from "lodash.throttle";import React, { useRef, useState } from "react";import { listScroll } from "./utils";import "./styles.css";const scrollItems = new Array(1000).fill(0).map((item, index) => {  return index + 1;});export default function App() {  const [wording, setWording] = useState("等待中");  const cacheRef = useRef({    isScriptScroll: false,    cnt: null,    scrollTop: 0  });  const onScroll = throttle(() => {    if (cacheRef.current.isScriptScroll) {      setWording("脚本滚动中");    } else {      cacheRef.current.scrollTop = cacheRef.current.cnt.scrollTop;      setWording("人为滚动中");    }  }, 200);  const scriptScroll = () => {    cacheRef.current.scrollTop += 600;    cacheRef.current.isScriptScroll = true;    listScroll(cacheRef.current.cnt, cacheRef.current.scrollTop, () => {      setWording("脚本滚动结束");      cacheRef.current.isScriptScroll = false;    });  };  return (    <div class        onClick={() => {          scriptScroll();        }}      >        触发一次脚本滚动      </button>      <p class>当前状态：{wording}</p>      <ul        class        onScroll={onScroll}        ref={(ref) => (cacheRef.current.cnt = ref)}      >        {scrollItems.map((item) => {          return (            <li class key={item}>              {item}            </li>          );        })}      </ul>    </div>  );}
```

接下来重点就在于 `listScroll` 怎么实现了。我们需要再去绑定一个 scroll 事件，不断去监听容器的 scrollTop 是否已经达到目标值，所以可以这么组织：

```
import debounce from "lodash.debounce";/** 误差范围内 */export const withErrorRange = (  val: number,  target: number,  errorRange: number) => {  return val <= target + errorRange && val >= target - errorRange;};/** 列表滚动封装 */export const listScroll = (  element: HTMLElement,  targetPos: number,  callback?: () => void) => {  // 是否已成功卸载  let unMountFlag = false;  const { scrollHeight: listHeight } = element;  // 避免一些边界情况  if (targetPos < 0 || targetPos > listHeight) {    return callback?.();  }  // 调用滚动方法  element.scrollTo({    top: targetPos,    left: 0,    behavior: "smooth"  });  // 没有回调就直接返回  if (!callback) return;  // 如果已经到达目标位置了，可以先行返回  if (withErrorRange(targetPos, element.scrollTop, 10)) return callback();  // 防抖处理  const cb = debounce(() => {    // 到达目标位置了，可以返回    if (withErrorRange(targetPos, element.scrollTop, 10)) {      element.removeEventListener("scroll", cb);      unMountFlag = true;      return callback();    }  }, 200);  element.addEventListener("scroll", cb, false);  // 兜底：卸载滚动回调，避免对之后的操作产生影响  setTimeout(() => {    if (!unMountFlag) {      element.removeEventListener("scroll", cb);      callback();    }  }, 1000);};
```

按严谨的流程来写的话，我们需要依靠 scroll 事件去不断判断 scrollTop，直至在误差范围内相等。

但实际上滚动是一个很快的过程，跟我们兜底的定时器逻辑，也就是前后脚的事情，是不是可以只保留兜底的逻辑？

而且，考虑到那些异常情况：

*   脚本滚动发生异常
    
*   脚本滚动被人为滚动打断
    

我们都得保证执行了一次回调，确保外部状态被释放，下一次滚动的逻辑正常。

所以在不那么严格的场景下，上述的代码其实可以抛弃 eventListener 的部分，只保留兜底的逻辑，进一步简化：

```
/** 列表滚动封装 */export const listScroll = (  element: HTMLElement,  targetPos: number,  callback?: () => void) => {  const { scrollHeight: listHeight } = element;  // 避免一些边界情况  if (targetPos < 0 || targetPos > listHeight) {    return callback?.();  }  // 调用滚动方法  element.scrollTo({    top: targetPos,    left: 0,    behavior: "smooth"  });  // 没有回调就直接返回  if (!callback) return;  // 如果已经到达目标位置了，可以先行返回  if (withErrorRange(targetPos, element.scrollTop, 10)) return callback();    // 兜底：卸载滚动回调，避免对之后的操作产生影响  setTimeout(() => {    callback();  }, 1000);};
```

当然，这个实现只是一种参考，相信大家也有别的更好的思路。

**5、小结**
--------

回顾整篇文章，简单介绍了关于 scroll 的一些 api 使用，原生 `scrollIntoView` 的坑以及区分人为滚动和脚本滚动的实现参考。

滚动，这一个看似微小的交互点，实际上可能隐藏着不少的工作量，在往后的评估或者实践中，需要多加重视和思考，隐藏在交互体验之下的复杂逻辑。

![](https://mmbiz.qpic.cn/mmbiz_gif/7QRTvkK2qC6D2OhibHUMz1XiaC7v0RcUA1thKEXck4AzcEnKnOXEHJibw1OEpzrL0n2O4FNrfgNaAZRcDyzDkKqiaw/640?wx_fmt=gif)

紧追技术前沿，深挖专业领域

扫码关注我们吧！

![](https://mmbiz.qpic.cn/mmbiz_png/xsw6Lt5pDCvxAWWCOfot6lMb4WjPvYwdx7Qlicw98GicMfx6UOwzrKNibrYo1pwuickd1V9tYmMaP3QIXll37LD76A/640?wx_fmt=png)

![](https://mmbiz.qpic.cn/mmbiz_gif/7QRTvkK2qC6D2OhibHUMz1XiaC7v0RcUA1thKEXck4AzcEnKnOXEHJibw1OEpzrL0n2O4FNrfgNaAZRcDyzDkKqiaw/640?wx_fmt=gif)