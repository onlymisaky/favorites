> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/LGqsWCHSqqtRQelNoWncBg)

_【 简介 】_
--------

React 合成事件是 React **模拟原生 DOM 事件所有能力的一个对象**，它根据 W3C 规范来定义合成事件，**兼容所有浏览器**，**拥有与浏览器原生事件相同的接口。**

**react 官方描述**![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIpys4zoaW3Wg9AL8QnSXicAVpYPr6VBuGdxatQOuxAkiccdlnIB1D7F1YnA2eFtRYNmgicPKxjicFbzicQ/640?wx_fmt=png)**分别打印出合成事件对象 e 和原生对象 e.nativeEvent**![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIpys4zoaW3Wg9AL8QnSXicAVGFIxqh2H3ibKpTpfW2Bj6Z16SicFJiaHFGhdb93n8VLSyczvt1QLccZicg/640?wx_fmt=png)

_【 React 事件系统架构 】_
------------------

![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIpys4zoaW3Wg9AL8QnSXicAV3o0MetcVpE6lmBSh5D5CyicXFLia3tic4znwY3vcyf8VkpibiayO47qqb6Q/640?wx_fmt=png)image.png

_【 核心代码 】// _我们可以将 react 系统分成注册和执行两部分去理解：
-----------------------------------------

### 一、注册：

```
// function enqueuePutListener(inst, registrationName, listener, transaction) {    ...  var isDocumentFragment = containerInfo._node && containerInfo._node.nodeType === DOC_FRAGMENT_TYPE;  1. 找到document  var doc = isDocumentFragment ? containerInfo._node : containerInfo._ownerDocument;  2. 注册事件，将事件注册到document上  3. listenTo(registrationName, doc);  存储事件,放入事务队列中}
```

**react 事件系统内部对事件在不同浏览器上的执行做了兼容因此无需使用者考虑浏览器相关情况：**

```
listen: function listen(target, eventType, callback) {    if (target.addEventListener) {      将原生事件添加到target这个dom上,也就是上边传递的document上      这就是只有document这个DOM节点上有原生事件的原因      target.addEventListener(eventType, callback, false);      ...    } else if (target.attachEvent) {      target.attachEvent('on' + eventType, callback);      ...    }  }
```

### 二、执行：

#### 事件分发 dispatchEvent（react 合成事件的冒泡机制）

```
function handleTopLevelImpl(bookKeeping) {  1. 找到事件触发的DOM和React Component  var nativeEventTarget = getEventTarget(bookKeeping.nativeEvent);  var targetInst = ReactDOMComponentTree.getClosestInstanceFromNode(nativeEventTarget);  2. 执行事件回调前,先由当前组件向上遍历它的所有父组件。  得到ancestors这个数组，这个数组同时也是冒泡顺序。  var ancestor = targetInst;  do {    bookKeeping.ancestors.push(ancestor);    ancestor = ancestor && findParent(ancestor);  } while (ancestor);  这个顺序就是冒泡的顺序,并且我们发现不能通过stopPropagation来阻止'冒泡'。  for (var i = 0; i < bookKeeping.ancestors.length; i++) {    targetInst = bookKeeping.ancestors[i];    ReactEventListener._handleTopLevel(bookKeeping.topLevelType, targetInst, bookKeeping.nativeEvent, getEventTarget(bookKeeping.nativeEvent));  }}
```

#### handleTopLevel 构造合成事件并执行（依赖 EventPluginHub）

```
1. 初始化时将eventPlugin注册到EventPluginHub中，不同plugin分别构造不同类型的合成事件  ReactInjection.EventPluginHub.injectEventPluginsByName({    ...不同插件  });  2. 将事件放入事件池：   EventPluginHub.enqueueEvents(events);3. 再处理队列中的事件,包括之前未处理完的：   EventPluginHub.processEventQueue(false);
```

_【 合成事件、原生事件混用 demo】_
---------------------

刚接触 react 的同学，往往在 react 事件使用时会与原生事件混合（这里并非指责这种混用行为，只是在混用阶段需要区分出 react 时间系统和 js 本身事件的执行差异），时常会有事件执行出现不符合预期的情况，这里我们用一个小 demo 来感受下二者执行的差异：![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIpys4zoaW3Wg9AL8QnSXicAVq07sXgOQsEl4vt1J7qYGt1Xib0EH1FSqrQ0001HiceqOVkAU8k3pCGjQ/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIpys4zoaW3Wg9AL8QnSXicAVVYUvmm1fL6OiaMunKHXexTxzibyJniaLXPjNvwv7xTXHzEETZxoQTc2TA/640?wx_fmt=png)打印出执行结果：

![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIpys4zoaW3Wg9AL8QnSXicAVQtqvUNTmUbBwWWrWqAjAV10IkTibJiaunjfdO0cPyjz2FqIZUrKrqF1Q/640?wx_fmt=png)image.png

### 由此我们可以了解到如下原生事件、react 事件、document 上挂载事件执行顺序：

![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIpys4zoaW3Wg9AL8QnSXicAVdsPZGib01Vm0vFmxVMxkH7pibwqXv1ZOblWVgC3LqzCHXFAH3D36ialAw/640?wx_fmt=png)image.png

_【 合成事件存在意义 】_
--------------

### 1. 统一管理（document）

react 事件集中在 document 上集中管理

### 2. 不同浏览器兼容问题

### 3. 减少事件创建销毁的性能损耗（避免频繁的垃圾回收机制）

react 事件队列的存储和取出使用缓解了 dom 元素注册销毁所消耗的性能

### 4. 利用合成事件的冒泡从 document 中触发的特性

_【 合成事件中存在的问题 】_
----------------

#### 1. 原生事件和合成事件混用时原生事件对 react 合成事件的影响

*   原生事件中禁止冒泡会阻止 react 合成事件的执行
    
*   react 合成事件禁止冒泡不会对原生生效
    

#### 2. 事件池中中事件处理函数全部被调用之后，所有属性都会被置为 null

![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIpys4zoaW3Wg9AL8QnSXicAVL0XZSFqxL0tZZBKmhHHWeic7wwV9ZndLQO0I27H7jrBrcoACEDXRuqQ/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIpys4zoaW3Wg9AL8QnSXicAVpIe0u8E834lWRmKpWVZvxicGOEyYjzygNeEF7hJJBDvbElEcva7wF2Q/640?wx_fmt=png)

##### 避免方法：

*   `e.persist()` // 可以阻止事件池清掉取出事件
    
*   17 版本 react 会有废弃事件池等更改，此现象也不会存在
    

#### 3. 不同版本的 React 组件嵌套使用时，e.stopPropagation 无法正常工作（两个不同版本的事件系统是独立的，都注册到 document 时的时间不相同）

_【 相关参考 】_
----------

*   https://react.docschina.org/
    
*   https://github.com/facebook/react/[1]
    
*   React 17 要来了，非常特别的一版 - 梦烬 - 博客园 [2]
    

### 参考资料

[1]

https://github.com/facebook/react/: _https://github.com/facebook/react/_

[2]

React 17 要来了，非常特别的一版 - 梦烬 - 博客园: _https://www.cnblogs.com/ayqy/p/react-17.html_

❤️ 谢谢支持
-------

以上便是本次分享的全部内容，希望对你有所帮助 ^_^

喜欢的话别忘了 **分享、点赞、收藏** 三连哦~。

[![](https://mmbiz.qpic.cn/mmbiz_png/MpGQUHiaib4ib44VcWJtWJHE1rbIx4WLwG6Wicxpy9V4SCLxLHqW2SVoibogZU9FTyiaTkZgTCwQVsk1iao7Vot4yibZjQ/640?wx_fmt=png)](http://mp.weixin.qq.com/s?__biz=Mzg4MTYwMzY1Mw==&mid=2247496626&idx=1&sn=699dc2b117d43674b9e80a616199d5b6&chksm=cf61d698f8165f8e2b7f6cf4a638347c3b55b035e6c2095e477b217723cce34acbbe943ad537&scene=21#wechat_redirect)

关于奇舞团
-----

奇舞团是 360 集团最大的大前端团队，代表集团参与 W3C 和 ECMA 会员（TC39）工作。奇舞团非常重视人才培养，有工程师、讲师、翻译官、业务接口人、团队 Leader 等多种发展方向供员工选择，并辅以提供相应的技术力、专业力、通用力、领导力等培训课程。奇舞团以开放和求贤的心态欢迎各种优秀人才关注和加入奇舞团。

![](https://mmbiz.qpic.cn/mmbiz_png/MpGQUHiaib4ib7CaF3RtAQ9LZVCQoBVJcib6QuKBADtIicEu8gRNg6goj3o52KbV7e5x5XoQDq6icqBjZsWRrhWsTcvg/640?wx_fmt=png)