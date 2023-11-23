> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/sy5ZoXu09_bwhDUb1TcLvw)

React 16 之前和之后最大的区别就是 16 引入了 fiber，又基于 fiber 实现了 hooks。整天都提 fiber，那 fiber 到底是啥？它和 vdom 是什么关系？

与其看各种解释，不如手写一个 fiber 版 React，当你能实现的时候，一定是彻底理解了。

vdom 和 fiber
------------

首先，我们用 vdom 来描述界面结构，比如这样：

```
{  "type": "ul",  "props": {      "className": "list",      "children": [          {              "type": "li",              "props": {                  "className": "item",                  "children": [                    "aa"                  ]              }          },          {            "type": "li",            "props": {                "className": "item",                "children": [                  "bb"                ]            }          }        ]   }}
```

这很明显就是一个 ul、li 的结构。但是我们不会直接手写 vdom，而是会用 jsx：

```
const data = {    item1: 'bb',    item2: 'cc'}const jsx =  <ul class style={{ background: 'blue', color: 'pink' }} onClick={() => alert(2)}>aa</li>    <li class>{data.item1}<i>xxx</i></li>    <li class>{data.item2}</li></ul>;
```

jsx 使用 babel 编译，我们配置一下 .babelrc.js：

```
module.exports = {    presets: [        [            '@babel/preset-react',            {                pragma: 'Dong.createElement'            }        ]    ]}
```

然后用 babel 编译它：

```
babel index.js -d ./dist
```

编译结果是这样的：

```
const data = {  item1: 'bb',  item2: 'cc'};const jsx = Dong.createElement("ul", {  className: "list"}, Dong.createElement("li", {  className: "item",  style: {    background: 'blue',    color: 'pink'  },  onClick: () => alert(2)}, "aa"), Dong.createElement("li", {  className: "item"}, data.item1, Dong.createElement("i", null, "xxx")), Dong.createElement("li", {  className: "item"}, data.item2));
```

这里的 createElement 就叫做 render function，它的执行结果是 vdom。

为什么不直接把 jsx 编译为 vdom 呢？

因为 render function 可以执行动态逻辑呀。我们可以加入 state、props，也可以包装一下实现组件。

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGiaDAHZNFOtRMWDI9v2EicichSpFOquZqSZKicgfO8mRGtDBMyfv6BKfR8QyYqoLDibELfHia3ibgiaaWrfzA/640?wx_fmt=png)

这样，我们只要实现 Dong.createElement 就能拿到 vdom 了：

createElement 就是返回 type、props、children 的对象。

我们把 children 也放在 props 里，并且文本节点单独创建：

```
function createElement(type, props, ...children) {    return {        type,        props: {            ...props,            children: children.map(child =>                typeof child === "object"                ? child                : createTextElement(child)            ),        }    }}function createTextElement(text) {    return {        type: "TEXT_ELEMENT",        props: {            nodeValue: text,            children: [],        },    }}const Dong = {    createElement}
```

这样执行以后渲染出来的就是 vdom：

我打印了一下：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGiaDAHZNFOtRMWDI9v2EicichSAvNxJXN08dgFpAfHdghjzqoBl9NvibYSEHt2kY8XDic6PPUmfLZico6Kw/640?wx_fmt=png)

接下来递归渲染这棵 vdom 不就是渲染么，也就是通过 document.createElement 创建元素、设置属性、样式、事件监听器等。

等等，如果这样做，那就是 React 16 之前的架构了。这个我们实现过：

[手写简易前端框架：vdom 渲染和 jsx 编译](https://mp.weixin.qq.com/s?__biz=Mzg3OTYzMDkzMg==&mid=2247487842&idx=1&sn=4576f83fbf8ac974fe0223ab7b3efeff&chksm=cf00de59f877574f695024890de3a3c8063ebf2dd0fb36702b6e63b974be405ca6b39043c739&token=992576547&lang=zh_CN&scene=21#wechat_redirect)

[手写简易前端框架：function 和 class 组件](https://mp.weixin.qq.com/s?__biz=Mzg3OTYzMDkzMg==&mid=2247487869&idx=1&sn=a2591ac0519401de05f1462f6dd10d47&chksm=cf00de46f8775750a84dd9c93c4f9a5563d81a20acbe30b047e1636111f5b5a9b9da0a7b0e7d&token=992576547&lang=zh_CN&scene=21#wechat_redirect)

[手写简易前端框架：vdom 渲染和 jsx 编译](https://mp.weixin.qq.com/s?__biz=Mzg3OTYzMDkzMg==&mid=2247487842&idx=1&sn=4576f83fbf8ac974fe0223ab7b3efeff&chksm=cf00de59f877574f695024890de3a3c8063ebf2dd0fb36702b6e63b974be405ca6b39043c739&token=992576547&lang=zh_CN&scene=21#wechat_redirect)

React 16 之后引入了 fiber 架构，就是在这里做了改变，它不是直接渲染 vdom 了，而是先转成 fiber：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGiaDAHZNFOtRMWDI9v2EicichSVr3b40J7eKfejHib8R6rC8CCXrJpYBFdBxBUVqZjwh8aHCbgGJHGWsg/640?wx_fmt=png)

本来 vdom 里通过 children 关联父子节点，而 fiber 里面则是通过 child 关联第一个子节点，然后通过 sibling 串联起下一个，所有的节点可以 return 到父节点。

这样不就把一颗 vdom 树，变成了 fiber 链表么？

然后渲染 fiber 就可以了，和渲染 vdom 的时候一样。

为什么费这么多事转成另一种结构再渲染呢？这不是多此一举么？

那肯定不是，fiber 架构的意义在这：

之前我们是递归渲染 vdom 的，然后 diff 下来做 patch 的渲染：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGiaDAHZNFOtRMWDI9v2EicichS6bLTpE9Y7A2fria6hEfljjRAVwuicbswicaImeFicAUicc4TZibWhZ7tqFog/640?wx_fmt=png)

这个渲染和 diff 是递归进行的。

现在变成了这样：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGiaDAHZNFOtRMWDI9v2EicichSlYxgqIER1hQIk5sBG8hUmqiaR43Ern8LYvYQtI62Vc4G05yFXHav8qg/640?wx_fmt=png)

先把 vdom 转 fiber，也就是 reconcile 的过程，因为 fiber 是链表，就可以打断，用 schedule 来空闲时调度（requestIdleCallback）就行，最后全部转完之后，再一次性 render，这个过程叫做 commit。

这样，之前只有 vdom 的 render 和 patch，现在却变成了 vdom 转 fiber 的 reconcile，空闲调度 reconcile 的 scdule，最后把 fiber 渲染的 commit 三个阶段。

意义就在于这个可打断上。因为递归渲染 vdom 可能耗时很多，JS 计算量大了会阻塞渲染，而 fiber 是可打断的，就不会阻塞渲染，而且还会在这个过程中把需要用到的 dom 创建好，做好 diff 来确定是增是删还是改。

dom 有了，增删改也知道了咋做了，一次性 commit 不就很快了么。

这就是 fiber 架构的意义！

接下来我们实现下。

实现 fiber 版 react
----------------

我们从上到下来做吧，也就是分别实现 schedule、reconcile、commit

### schedule

schdule 就是空闲调度，也就是这样的：

```
function workLoop(deadline) {    // do xxx    requestIdleCallback(workLoop);}requestIdleCallback(workLoop);
```

它就是一个不断的循环，就像 event loop 一样，可以叫做 reconcile loop。

然后它做的事情就是 vdom 转 fiber，也就是 reconcile：

我们用两个全局变量来记录当前处理到的 fiber 节点、根 fiber 节点：

```
let nextFiberReconcileWork = null;let wipRoot = null;
```

它做的事情就是循环处理完所有的 reconcile：

```
let shouldYield = false;while (nextFiberReconcileWork && !shouldYield) {    nextFiberReconcileWork = performNextWork(        nextFiberReconcileWork    );    shouldYield = deadline.timeRemaining() < 1;}
```

如果有下一个 fiber，并且还有空闲时间，那就执行下一个 vdom 转 fiber 的 renconcile

如果全部都转完了，那就 commit：

```
if (!nextFiberReconcileWork) {    commitRoot();}
```

所以，schedule 的代码就是这样的：

```
let nextFiberReconcileWork = null;let wipRoot = null;  function workLoop(deadline) {    let shouldYield = false;    while (nextFiberReconcileWork && !shouldYield) {        nextFiberReconcileWork = performNextWork(            nextFiberReconcileWork        );        shouldYield = deadline.timeRemaining() < 1;    }    if (!nextFiberReconcileWork) {        commitRoot();    }    requestIdleCallback(workLoop);}requestIdleCallback(workLoop);
```

每次执行的 performNextWork 就是 reconcile：

```
function performNextWork(fiber) {    reconcile(fiber);    if (fiber.child) {        return fiber.child;    }    let nextFiber = fiber;    while (nextFiber) {        if (nextFiber.sibling) {            return nextFiber.sibling;        }        nextFiber = nextFiber.return;    }}
```

reconcile 当前 fiber 节点，然后再按照顺序继续处理 child、sibling，处理完之后回到 return 的 fiber 节点。

这样不断的调度 reconcile。

这就是 schedule 做的事情：**schedule 就是通过空闲调度每个 fiber 节点的 reconcile（vdom 转 fiber），全部 reconcile 完了就执行 commit**。

接下来实现 reconcile：

### reconcile

schdule 的 loop 已经在不断进行了，那么只要提交一个 nextFiberReconcileWork，下次 loop 就能处理到。

所以，这就是 render 的实现：

```
function render(element, container) {    wipRoot = {        dom: container,        props: {            children: [element],        }    }    nextFiberReconcileWork = wipRoot}
```

创建根 fiber 节点，赋值给 wipRoot，也就是 working in progress 的 fiber  root 的意思。并且下一个处理的 fiber 节点指向它，那么下次 schedule 就会调度这个 fiber 节点，开始 reconcile。

reconcile 是 vdom 转 fiber，但还会做两件事：一个是提前创建对应的 dom 节点，一个是做 diff，确定是增、删还是改。

reconcile 的实现是这样的：

```
function reconcile(fiber) {    if (!fiber.dom) {        fiber.dom = createDom(fiber)    }    reconcileChildren(fiber, fiber.props.children)}
```

fiber.props.children 就是 vdom 的子节点，这里的 reconcileChildren 就是把之前的 vdom 转成 child、sibling、return 这样串联起来的 fiber 链表：

循环处理每一个 vdom 的 elements，如果 index 是 0，那就是 child 串联，否则是 sibling 串联。创建出的节点都要用 return 指向父节点：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGiaDAHZNFOtRMWDI9v2EicichSnd80V0rARUmEfOeTicTkGROxXUIVQtMqvibeb4eVw48p7wLpebLY3yJQ/640?wx_fmt=png)

```
function reconcileChildren(wipFiber, elements) {    let index = 0    let prevSibling = null    while (        index < elements.length    ) {        const element = elements[index]        let newFiber = {            type: element.type,            props: element.props,            dom: null,            return: wipFiber,            effectTag: "PLACEMENT",        }        if (index === 0) {            wipFiber.child = newFiber        } else if (element) {            prevSibling.sibling = newFiber        }        prevSibling = newFiber        index++    }}
```

因为我们只实现渲染，暂时不做 diff 和删除修改，所以这里的 effectTag 都是 placement，也就是新增元素。

通过 schdule 空闲调度这样处理每一个 vdom 转 fiber，就能生成整个 fiber 链表。

所以，这就是 reconcile 做的事情：**reconcile 负责 vdom 转 fiber，并且还会准备好要用的 dom 节点、确定好是增、删、还是改，通过 schdule 的调度，最终把整个 vdom 树转成了 fiber 链表**。

当 fiber 转完了，那么 schdule 调度就进入到了这里：

```
if (!nextFiberReconcileWork) {    commitRoot();}
```

开始执行 commit：

### commit

commit 就是对 dom 的增删改，而且比之前 vdom 架构时的渲染还要快，因为 dom 都提前创建了、也知道是增是删还是改了，那剩下的不就很简单了么？

我们从根 fiber 开始 commit，并且把 wipRoot 设置为空，因为不再需要调度它了：

```
function commitRoot() {    commitWork(wipRoot.child);    wipRoot = null}
```

每个 fiber 节点的渲染就是按照 child、sibling 的顺序以此插入到 dom 中：

```
function commitWork(fiber) {    if (!fiber) {        return    }    let domParentFiber = fiber.return    while (!domParentFiber.dom) {        domParentFiber = domParentFiber.return    }    const domParent = domParentFiber.dom    if (        fiber.effectTag === "PLACEMENT" &&        fiber.dom != null    ) {        domParent.appendChild(fiber.dom)    }     commitWork(fiber.child)    commitWork(fiber.sibling)}
```

这里每个 fiber 节点都要往上找它的父节点，因为我们只是新增，那么只需要 appendChild 就行。

dom 已经在 reconcile 节点就创建好了，当时我们没细讲，现在来看下 dom 创建逻辑：

```
function createDom(fiber) {    const dom = fiber.type == "TEXT_ELEMENT" ? document.createTextNode("") : document.createElement(fiber.type);    for (const prop in fiber.props) {        setAttribute(dom, prop, fiber.props[prop]);    }    return dom;}
```

就是根据类型创建元素，然后设置属性：

属性要分别处理 style、文本节点的 value、事件监听器：

```
function isEventListenerAttr(key, value) {    return typeof value == 'function' && key.startsWith('on');}function isStyleAttr(key, value) {    return key == 'style' && typeof value == 'object';}function isPlainAttr(key, value) {    return typeof value != 'object' && typeof value != 'function';}const setAttribute = (dom, key, value) => {    if (key === 'children') {        return;    }    if (key === 'nodeValue') {        dom.textContent = value;    } else if (isEventListenerAttr(key, value)) {        const eventType = key.slice(2).toLowerCase();        dom.addEventListener(eventType, value);    } else if (isStyleAttr(key, value)) {        Object.assign(dom.style, value);    } else if (isPlainAttr(key, value)) {        dom.setAttribute(key, value);    }};
```

这在 reconcile 时就做好了，commit 自然很快。

这就是 commit 做的事情：**把 reconcile 产生的 fiber 链表一次性添加到 dom 中，因为 fiber 对应的节点提前创建好了、是增是删还是改也都知道了，所以，这一个阶段很快。**

这样，我们就实现了简易版 React，当然，目前只实现了渲染，我们来试下效果：

这样一段 jsx：

```
const data = {    item1: 'bb',    item2: 'cc'}const jsx =  <ul class style={{ background: 'blue', color: 'pink' }} onClick={() => alert(2)}>aa</li>    <li class>{data.item1}<i>xxx</i></li>    <li class>{data.item2}</li></ul>;console.log(JSON.stringify(jsx, null, 4));Dong.render(jsx, document.getElementById("root"));
```

渲染以后是这样的：

![](https://mmbiz.qpic.cn/mmbiz_gif/YprkEU0TtGiaDAHZNFOtRMWDI9v2EicichSWH3g8fNnVKfSRaOqjWPL4Z5ibJiajJ44SgagWaldp6RIVdZusCPQnLoQ/640?wx_fmt=gif)

代码上传到了 github：https://github.com/QuarkGluonPlasma/frontend-framework-exercize

总结
--

fiber 是 React16 引入的架构变动，为了彻底理解它，我们实现了一个简易版的 fiber 架构的 React。

界面通过 vdom 描述，但是不是直接手写 vdom，而是 jsx 编译产生的 render function 之后以后生成的。这样就可以加上 state、props 和一些动态逻辑，动态产生 vdom。

vdom 生成之后不再是直接渲染，而是先转成 fiber，这个 vdom 转 fiber 的过程叫做 reconcile。

fiber 是一个链表结构，可以打断，这样就可以通过 requestIdleCallback 来空闲调度 reconcile，这样不断的循环，直到处理完所有的 vdom 转 fiber 的 reconcile，就开始 commit，也就是更新到 dom。

reconcile 的过程会提前创建好 dom，还会标记出增删改，那么 commit 阶段就很快了。

从之前递归渲染时做 diff 来确定增删改以及创建 dom，提前到了可打断的 reconcile 阶段，让 commit 变得非常快，这就是 fiber 架构的目的和意义。

当然，我们还没实现 hooks 以及更新删除，后续会陆续实现。

如果想彻底搞懂 fiber 架构，不妨按照文章所写来实现一遍 reconcile 的过程，一定会让你对它有更深的认识。