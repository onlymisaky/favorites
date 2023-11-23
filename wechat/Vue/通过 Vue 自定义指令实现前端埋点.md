> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/baVNEeZZdmqUiolyssZgqg)

在营销活动中，通过埋点可以获取用户的喜好及交互习惯，从而优化流程，进一步提升用户体验，提高转化率。

在之前的埋点方案实现中，都是在具体的按钮或者图片被点击或者被曝光时主动通过事件去上报埋点。这种方法在项目中埋点比较少时还行，一旦项目中需要大量埋点时，不可避免的要添加很多业务代码。也很大程度上造成了埋点逻辑与业务逻辑的高耦合。

为了改造这种情况，我们对于原有的埋点方式做了一些小改进，使得埋点效率得到了极大提升。

在阐述我们的埋点改造之前，有必要对埋点的一些常识做下简单的了解。

埋点上报方式都有哪些？
-----------

要知道埋点的类型有很多，上报的方式也是五花八门。前端常见的埋点方法有三种：

*   手动埋点
    
*   可视化埋点
    
*   无痕埋点
    

手动埋点，顾名思义就是纯手动写代码，调用埋点 SDK 提供的函数，在需要埋点的业务逻辑中添加对应方法，上报埋点数据。这种也是之前一直在使用的方法。

可视化埋点是指通过可视化系统配置埋点，这种方式接触的不是很多，就不展开说了。

无痕埋点，也叫自动埋点、全埋点。即对全局所有事件和页面加载周期进行拦截埋点。

一般对哪些数据做埋点？
-----------

为了达到数据分析，便于后续的运营及产品策略调整的目的，一般需要对以下几点做埋点统计：

*   页面埋点：统计用户进入或者离开页面的信息，如页面浏览次数（pv）、浏览页面人数（uv）、页面停留时长、设备信息等
    
*   点击埋点：统计用户在页面浏览过程中触发的点击事件，如按钮、导航或者图片的点击次数
    
*   曝光埋点：统计具体元素是否得到有效曝光
    

需求分析
----

本文是基于最近项目中添加埋点的需求，我们需要的一种理想化方案是：

*   埋点与业务尽量分离，埋点逻辑更应该是独立于业务的
    
*   尽量不对业务代码有侵入
    
*   约定规范，通过统一收口来处理埋点逻辑
    

由于项目是`Vue`开发的，所以考虑使用自定义指令的方式来完成埋点上报。选择自定义指令的原因也是因为他能一定程度上能让业务和埋点解耦。

页面埋点在框架层面已经帮我们做掉了，这里主要关心的是点击埋点和曝光埋点。

实现思路其实也很清晰：在需要埋点的`DOM`节点挂载特殊属性，通过埋点`SDK`监听挂载了相应属性对应的事件，在事件触发时进行埋点数据上报。

那么问题来了，怎么监听呢？

对于点击事件，我们可以采用`addEventListener`来监听`click`事件。这很简单。

对于元素的曝光就稍微有点麻烦了。

首先我们来看一下为什么需要监测曝光：

![](https://mmbiz.qpic.cn/mmbiz_png/DByMFBAKmy47BMQiaZicIgP2ib2pxib2XzkYrgnJ7k4S398icib71T4sOH6BGj8O28VkeYsmjExWxF01niaibetOKzr8XA/640?wx_fmt=png)

为了衡量用户对产品的兴趣程度，需要计算区域的点击率（点击次数 / 曝光次数）。为了保证点击率的准确性，我们必须保证用户真正的浏览到了这些产品（就比如上图中最下方的机酒产品区域，由于需要滚动页面，用户才有可能看到这一区域）。

那么怎么判断元素出现在页面的可视区域呢？

按照以往的做法：监听滚动事件，通过`getBoundingClientRect()`方法计算监测区域与视窗的位置，然后判断元素是否出现在页面的可视区域内。但是由于`scroll`事件的频繁触发，性能问题很大。

基于此，浏览器特意为我们打造了一个`Intersection Observer`API，把性能相关的细节都处理掉，让开发者只关心业务逻辑即可：

![](https://mmbiz.qpic.cn/mmbiz_png/DByMFBAKmy47BMQiaZicIgP2ib2pxib2XzkY7ffk5YibKaRxqicPcvxRgqh5rlbAOGGLDmyPhiaQEeppibmvUpNqoFfQMg/640?wx_fmt=png)

由于用户浏览页面的不确定性，还必须要避免重复的曝光行为。这个在曝光之后，移除观察即可。

代码实现
----

上面的需求分析还是比较抽象，下面让我们结合代码来看一下最终的实现。

### Click 类封装

点击事件的处理相对比较简单，每次点击触发数据上报即可：

```
// src/directives/track/click.jsimport { sendUBT } from "../../utils/ctrip"export default class Click {  add(entry) {    // console.log("entry", entry);    const traceVal = entry.el.attributes["track-params"].value    const traceKey = entry.el.attributes["trace-key"].value    const { clickAction, detail } = JSON.parse(traceVal)    const data = {      action: clickAction,      detail,    }    entry.el.addEventListener("click", function() {      console.log("上报点击埋点", JSON.parse(traceVal))      console.log("埋点key", traceKey)      sendUBT(traceKey, data)    })  }}
```

### Exposure 类封装

曝光的相对复杂一些。

首先通过`new IntersectionObserver()` 实例化一个全局`_observer`，如果得到有效曝光的（这里当元素出现一半以上则进行曝光），就去获取 DOM 节点上的`trace-key`（埋点 key）和`track-params`（埋点 value）。

```
// src/directives/track/exposure.jsimport "intersection-observer"import { sendUBT } from "../../utils/ctrip"// 节流时间调整，默认100msIntersectionObserver.prototype["THROTTLE_TIMEOUT"] = 300export default class Exposure {  constructor() {    this._observer = null    this.init()  }  init() {    const self = this    // 实例化监听    this._observer = new IntersectionObserver(      function(entries, observer) {        entries.forEach((entry) => {          // 出现在视窗内          if (entry.isIntersecting) {            // 获取参数            // console.log("埋点节点", entry.target.attributes);            const traceKey = entry.target.attributes["trace-key"].value            const traceVal = entry.target.attributes["track-params"].value            console.log("traceKey", traceKey)            console.log("traceVal", traceVal)            const { exposureAction, detail } = JSON.parse(traceVal)            const data = {              action: exposureAction,              detail,            }            // 曝光之后取消观察            self._observer.unobserve(entry.target)              self.track(traceKey, data)          }        })      },      {        root: null,        rootMargin: "0px",        threshold: 0.5, // 元素出现面积，0 - 1，这里当元素出现一半以上则进行曝光      }    )  }  /**   * 元素添加监听   *   * @param {*} entry   * @memberof Exposure   */  add(entry) {    this._observer && this._observer.observe(entry.el)  }  /**   * 埋点上报   *   * @memberof Exposure   */  track(traceKey, traceVal) {    // console.log("曝光埋点", traceKey, JSON.parse(traceVal));    sendUBT(traceKey, traceVal)  }}
```

### 指令封装

有了点击和曝光类，下一步就是 Vue 指令的封装了，也是之所以能实现半自动埋点的核心。

这里存在一个场景就是对于同一个按钮或者图片，同时存在既需要点击埋点又需要曝光埋点的场景。所以在指令的设计时支持了单独传入和同时传入的场景：

*   `v-track:click|exposure`
    
*   `v-track:exposure`
    

```
// src/directives/track/index.jsimport Vue from "vue"import Click from "./click"import Exposure from "./exposure"// 实例化曝光和点击const exp = new Exposure()const cli = new Click()Vue.directive("track", {  bind(el, binding) {    // 获取指令参数    const { arg } = binding    arg.split("|").forEach((item) => {      // 点击      if (item === "click") {        cli.add({ el })      } else if (item === "exposure") {        exp.add({ el })      }    })  },})
```

同时需要在`src/index.js`引入即可：

```
import "./directives/track"
```

使用
--

在需要埋点的地方使用也是很简单的：

```
<img  ref="imageDom"  trace-key="o_img"  v-track:click|exposure  :track-params="    JSON.stringify({      exposureAction: 's_pictures',      clickAction: 'c_pictures',      detail: {        value: '测试',      },    })  "/>
```

不足
--

通过`Vue`自定义指令的一个简单封装，业务代码和埋点代码就达到了一定的解耦，相较之前，无论是埋点的开发成本还是维护成本都降低了很多。

但是这也只是一个最简单的实现，还有很多情况需要考虑：

*   曝光时频次很高，是否可以考虑批量上报？
    
*   用户访问一半页面，突然切出，之后又重新进入，这种情况埋点又该如何上报？
    
*   用户设备不支持`Intersection Observer`API 情况，是否要考虑向下兼容？
    

鉴于这套埋点方案还在不断完善中，等后续完善并在业务中落地平稳运行后。我再分享其中的细节给到大家。

本文先到这里～