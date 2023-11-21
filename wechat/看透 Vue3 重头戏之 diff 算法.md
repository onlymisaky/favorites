> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/z7jbJyDK8H4PJ8JcEuxGMA)

点击上方 三分钟学前端，关注公众号  

回复交流，加入前端编程面试算法每日一题群

面试官也在看的前端面试资料

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlZqb5N0Kru5ojyribc5Q6dIHMDZk2EDlR4vGBibqqUviaSicVxeqISicJbM8T3rzbE0y5NsuS5N1SWeRA/640?wx_fmt=other)微信图片_20210407172754.jpg

### 前言

终于迎来了`DOM diff`流程的重头戏：`diff`算法，前面的流程只能算是附加项，重要的是各种节点是如何进行对比，然后进行更新。下面就对每一种节点的对比流程进行分析。

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlZqb5N0Kru5ojyribc5Q6dID5IZNElGEHIlViaHxcbEoeN0c9Th2J9Vuqv0CVCGclByDlaULbLmG9w/640?wx_fmt=other)image.png

在 vue3.2 初始化的时候做了什么？[1] 文章的的末尾，提到了传入`effect`的回调函数和响应式数据之前产生一个依赖关系，等同于产生了一个`watcher`。当数据发生变化的时候，会以参数二的方法执行参数一，具体细节和调度器有关，以后再说，最终会进入`componentUpdateFn`函数中，我们就直接进入到更新阶段的`componentUpdateFn`。

### `patch`之前的处理

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlZqb5N0Kru5ojyribc5Q6dIe8TpY7PlgrlocxVgcx3pWH1ic4fTLBxjia3Z2d4uDj2E8ibARf6fC4dNw/640?wx_fmt=other)image.png

在开始执行`patch`函数之前，会先执行一些生命周期钩子函数，有`beforeUpdate`和`VNode`的`hook:beforeUpdate`。

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlZqb5N0Kru5ojyribc5Q6dIXuHJmNJEgM3vVAYTj1mGOMIlxDCbwsAUe4gtRBcaZP6ibkicOl3uAVVw/640?wx_fmt=other)image.png![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlZqb5N0Kru5ojyribc5Q6dINP25Tp4RANB95XJN5jQfQteyYLSWtdfsafa6fNW4CAJ4dDL6BXDibZA/640?wx_fmt=other)image.png

最主要的一点，如果是父组件数据变化而导致的子组件更新，会多执行一个东西，里面会进行更新`props`和`slots`以及换成新的`VNode`，做完这些之后可能会导致更新，需要在`patch`之前把它们执行。(PS：更新`props`和`slots`流程可以看看我前面的文章《Vue3.2 vDOM diff 流程之一：插槽的初始化和更新》[2] 和《Vue3.2 vDOM diff 流程分析之一：props 和 attrs 的初始化和更新》[3])

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlZqb5N0Kru5ojyribc5Q6dIX9o41wVcyqbIwpSLpDrop4voB1Bh3EWjIOk4xzS0xibzMmshk5wjWLg/640?wx_fmt=other)image.png

做完这一些，就可以产生新的`VNode`，将新旧`VNode`传入`patch`开始进行对比，`Suspense`和`Teleport`的`diff`已经在前面的文章中说明，这里就不在提及。

### 对比元素类型节点

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlZqb5N0Kru5ojyribc5Q6dIwgiacElBpKwdrsibk4n6qq6nnGTOjlUZX4e984RHCMrhtrrwbib2Oay5g/640?wx_fmt=other)image.png![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlZqb5N0Kru5ojyribc5Q6dIKMCoxotiaThlvr2wic8IWiaITjVahtvN8nugnnVichgsebmOI6Gnkauosw/640?wx_fmt=other)image.png

对比元素进入`processElement`，这次是进入更新流程，执行`patchElement`。n1 是旧`VNode`，n2 是新`VNode`

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlZqb5N0Kru5ojyribc5Q6dImpINgIeCnP2set6lCCXrKibzetcnoqpj6ctMf0Xd6cQfIUpCcsl07sg/640?wx_fmt=other)image.png

函数开头，需要重新通过旧节点的`patchFlag`重新确认新节点`patchFlag`，因为用户可以克隆由`complie`产生的`VNode`，或许可能添加一些新的`props`，比如`cloneVNode(vnode, {class: 'cloneVNode'})`，它将选择`FULL_PROPS`。

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlZqb5N0Kru5ojyribc5Q6dIW4d6YIFZp3U4JYfk7N7VubMnibKx1diaXVqACNkhTYMUy1wOtrJhu9HA/640?wx_fmt=other)image.png

紧接着执行新的`VNode`自定义指令的`beforeUpdate`生命周期函数，如果在`dev`模式下且 HMR 正在更新，则放弃优化且把`dynamicChildren`清空，使用全量`diff`。这会影响后面`diff`，但是 prod 模式下一般都是优化模式，使用`areChildrenSVG`是判断新`VNode`是不是 SVG。

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlZqb5N0Kru5ojyribc5Q6dIq7NGyM9ice4BgYCj3gqia0lZAn0OpJ7ibnjYgqzWsy4h8jm2G2D6m3qBQ/640?wx_fmt=other)image.png

这里分为优化模式和非优化模式，这里进入优化模式的条件是`dynamicChildren`不为空，非优化模式是`optimized`为`true`，但是这两个是互斥的，一个存在另一个肯定不存在。

#### 优化模式下进行`diff`

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlZqb5N0Kru5ojyribc5Q6dIMe9V3TzcaOSe77CHMUnkuhbKnHJFKEcy5rEjbg6Cd7t6mkOr9iaic4ZA/640?wx_fmt=other)image.png

进入到这个函数，他会遍历新`VNode`中`dynamicChildren`，并从旧的`VNode`的`dynamicChildren`取出按索引顺序一致的节点进行对比。

在这之前，先要找到`parent node`，也就这一大坨的三元运算符，不要慌张，逐个逐个条件分析，`oldVNode.el`是为了在异步组件的情况下确保元素节点的真实`DOM`要存在。

在`oldVNode.el`存在的情况下，并且符合以下三个条件中的其中一个：1. `oldVNode`的节点类型是`Fragment`、2.`oldVNode`和`newVNode`不是同一种元素 (`key`值不一样也算)、3.`oldVNode`是组件，就组件而言，它可以包含任何东西。`container`就是`oldVNode.el`的`parent`。不然在其他的情况下，实际上没有父容器，因此传递一个`block`元素，避免`parentNode`，就是传递`fallbackContainer`(是 n2 的真实`DOM`)，

确认好`container`就和`oldVNode`与`newVNode`再次传递给`patch`，接下来就要根据`newVNode`的节点类型从而确定走哪个分支进行`diff`。

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlZqb5N0Kru5ojyribc5Q6dIDNhIy1Dj4O56ibe330yhHNC2hCB1n59ICrUAsiaLGwxS7RSWoibKgOIEA/640?wx_fmt=other)image.png

`diff`流程结束之后还需要做一件事，在 dev 模式下，如果`parentComponent`存在并且`parentComponent`启用 HMR，需要递归寻找或者是定位旧的 el 以便在更新节点进行引用 防止更新阶段会抛出`el is null`。优化模式分析完毕。

#### 非优化模式下进行全量`diff`

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlZqb5N0Kru5ojyribc5Q6dI8RffRZ8iaXiaydicoHYaCK4p83ybv0In7oQtB8xIKZM7VaTLd7SJbp6lA/640?wx_fmt=other)image.png

非优化模式下交给`patchChildren`处理，在`diff`之前先要拿到一些东西：n1、n2 的`Children`和 n2 的`shapeFlag`。接下来的流程分为很多种情况，一一分析。

##### 快速`diff`

首先根据 n2 的`patchFlag`判断能不能快速更新，也就是 “靶向更新”，进入之后又分为两种情况，是否键控 (是否绑定了`key`)，键控可以是完全键控也可以是混合键控 (一部分带`key`，一部分不带`key`)，分别交给`patchKeyedChildren`和`patchUnKeyedChildren`处理。

###### 不带有`key`的对比

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlZqb5N0Kru5ojyribc5Q6dICA6l6heUmxDG66wgibFSGRlaao2tkPygvdgjhOhrt0fvZmwcw4bkMSw/640?wx_fmt=other)image.png

由于带有`key`的对比有点复杂，我放的后面说，这里先看没有带`key`。没有带`key`的对比简单粗暴，因为不确保 n1 和 n2 都有`children`列表，没有就默认给一个空数组。需要注意这里获取长度，从新旧`children`列表两个列表长度中取出长度的最小的作为基准，接下来的对比最多只会对比到这个位置。具体用图解释。

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlZqb5N0Kru5ojyribc5Q6dIUqu14LJueRSJ23LX1A6anXkxZhvfFxnAjYNcNLBDvw5M3gMIjdK1ZQ/640?wx_fmt=other)image.png

如图所示，旧`children`列表长度是 5，新`children`列表长度是 3，取小的也就是 3，代表在循环一对一对比中只会对比前三个，剩下会交给下面的流程。

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlZqb5N0Kru5ojyribc5Q6dIhpf8R0EaaoMBf9UErJMr0oXx13wuv6qUzD7BWpEyXTOVqZZJg0EW0Q/640?wx_fmt=other)image.png

剩下流程分为两种情况，在循环对比后，如果是新`children`列表比旧`children`列表长度长说明有新节点，就会去挂载新节点，反之说明有不需要的旧节点，就会去卸载。流程结束。

###### 带`key`的对比

回到`patchChildren`中，我们看带有`key`是如何对比，将会结合图一步步分析。

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlZqb5N0Kru5ojyribc5Q6dItb4YlIxtkLAVMznIQ8ibfcxmNTTKIVIcJ23OEX3vaAE8QKUzMMMsF8g/640?wx_fmt=other)image.png

这里先拿到一些东西，`l2`是新`children`列表的长度，`e1`是旧`children`列表中最后一位的索引，`e2`是新`children`列表最后一位的索引。`i`这里有特殊意义，代表对比的开始索引。带有`key`的对比主要有五个流程，

假如有如下新旧`children`列表，可以准确看出只有 2 移动了位置，下面就看经过五个流程是如何进行对比的。

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlZqb5N0Kru5ojyribc5Q6dI5p58qlqwznPutELMibTkRZyRyGruas3cFWyuMZ7EQnEpdARy770cTCQ/640?wx_fmt=other)image.png

1. 流程一：对比开始位置

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlZqb5N0Kru5ojyribc5Q6dIoiaVlIcJgGiaiaicpaOJNQ5YL1LiacUYGMicddCRXU4q2IlPwHmSGJ68bjAw/640?wx_fmt=other)image.png

在这一阶段会遍历新旧`children`列表，只有新旧节点是用一种元素才会交给`patch`函数对比，每过一对新旧子节点，`i`就会加一，如果有一方遍历到最后一个就会结束或者是遍历到两个是不同元素。例子中，前面没有相同的节点，所以不会有任何操作

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlZqb5N0Kru5ojyribc5Q6dIYb8dic92IvAT9CnbibIebI9oke6slCnxYbIDhaHDPkI55K2Mk6r3zS8g/640?wx_fmt=other)image.png

2. 流程二：对比末尾位置

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlZqb5N0Kru5ojyribc5Q6dI6Sgh1OOLVHMSFNIcd0xBFHUzpglFOVicAnzjqx09dhKsy00wBrtH64Q/640?wx_fmt=other)image.png

在这一阶段一样会遍历新旧`children`列表，和阶段一一样，新旧节点是同一种元素才会交给`patch`函数对比，不同的是从末尾开始对比子节点，每过一对子节点，新旧最大位置索引同时会减一。例子中，从末尾的 3、4、5 是相同元素可以排除。

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlZqb5N0Kru5ojyribc5Q6dIqlicRgPNz2W279ly4dZhTqATsrSkz8aiaf45paQ18ptjewuTMsEOMgEg/640?wx_fmt=other)image.png

走完前面的两个，说明新旧`children`列表中首尾的相同节点已经被处理了，就剩下中间的部分，接下来的三个流程是挂载列表中的新节点和卸载不需要的旧节点以及无序对比。

但这三个流程中只会执行其中一个或者都不执行，总共有三种情况：1. 只需要安装新节点、 2. 只需要卸载旧节点、 3. 无序。这和前面的讲到的全量`diff`和像，这就要看`i`了, 如果`i`大于`e1`并且小于或者等于`e2`说明有新节点，执行流程三，如果`i`是大于`e2`说明有不需要的旧节点，执行流程四。都不符合执行流程五

3. 流程三：挂载新节点 (此流程不一定执行)

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlZqb5N0Kru5ojyribc5Q6dItA45ohKEiam2dq7mX5IXxspyNPVGt2cTV7iaibj8RIkZsB1hPgjKVYNtw/640?wx_fmt=other)image.png

`nextPos`是用来确定新增节点的位置，一般到了这一阶段`e2`是没有处理的新节点列表的最大索引，要加一是因为`vue`新增节点的方式了，`vue`新增元素是通过`insert`，实现原理是`insertBefore`，所以这里会拿到将要插入元素的位置的后一个。具体看下面的示意图。(ps：红色框内是被处理过的)

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlZqb5N0Kru5ojyribc5Q6dI4jQ6j5z7GQvUpN3KGIqofN04HWOBHLhWrWyKm34n9ZH13XygDNPtxQ/640?wx_fmt=other)image.png

在这个案例中，6 是新增的节点，因为经过了流程一和二的处理，`i`变成了 5，`e2`变成 5，`e2`正好是节点 6 的索引，如果我们需要把它插入列表中，我们需要知道他的后一个节点是谁，以便做为瞄点，这就要加一后去新`children`列表中找。

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlZqb5N0Kru5ojyribc5Q6dIqHnxtajyafL78hEtC6lqELpJpexRrlRlribZR9aKUNMIxKEibDcoqVMg/640?wx_fmt=other)image.png

但是还有第二种情况，如果新增的节点是新`children`列表中的最后一个，那么加一就会超出其长度，那么就会把`parentAnchor`作为瞄点，`parentAnchor`是当前列表的父容器中的最后一个节点，一般都是空字符串，(注意：这里是节点，不是元素节点)。例子中不符合，不会执行该流程

4. 流程四：卸载不需要的旧节点 (此流程不一定执行)

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlZqb5N0Kru5ojyribc5Q6dIoP98Ezacc2VYH3EZw9ibL9VNYmiaPsxwLS77dEekPibdzcuaNPHrVY3Ug/640?wx_fmt=other)image.png

卸载旧节点的操作就比较简单了，每卸载一个`i`就加一，通过`unmount`方法进行卸载，实现原理是通过找到要卸载的节点的父节点，调用`removeChildren`进行卸载。前提是`i`大于`e2`但小于等于`e1`。例子中不符合，不会执行该流程

5. 流程五：无序对比 (此流程不一定执行)

如果到了流程五，说明`children`列表中有一部分是无序的，前面的流程无法处理，需要进行无序对比。这流程五分为三部分。

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlZqb5N0Kru5ojyribc5Q6dIX0o9PJxTEUuspawicX1kwz38Rib8hYy3zic77FkicPTgGibp9g6pQrmPtyw/640?wx_fmt=other)这第一部分是为了产生`index`和新`children`列表中的`key`的映射图，它会拿`i`作为新旧`children`列表的开始索引，当找到`newChildren`，准确来说是找到`newChild`身上的`key`，就会连同`i`一起保存进`keyToNewIndexMap`中。

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlZqb5N0Kru5ojyribc5Q6dIicT2iasXrRXzEmkuiboTaR0890eXJkZGTn9SNejjdXNxk7Q6NPLqCS1Tg/640?wx_fmt=other)code.png

这第二部分是循环旧节点列表 以匹配需要更新的节点和删除不需要的节点，先提前创建一个数组 (`newIndexToOldIndexMap`)，长度是还需要进行对比 (`toBePatched`) 的数量，作为新旧索引对应的存放 (默认全部都是 0)

开始循环旧`children`列表，当`patched`大于`toBePatched`时就都是卸载节点，但是一开始`patched`是 0 并不会大于，继续往下走，开始找`newIndex`，先从在前面保存的`key:index`的映射图中找，没找到就尝试在旧`children`列表中定位同一种类型没有`key`的节点的索引。还是没有就只能`undefined`。

最后，如果`newIndex`是`undefined`，说明旧节点没有对应的新节点直接卸载，不然，会修改`newIndexToOldIndexMap`中对应索引位置，如果`newIndex`小于新节点最大位置 (`maxNewIndexSoFar`)，说明这个节点移动了，不然`maxNewIndexSoFar`就赋值成`newIndex`。过了这么多，终于可以传递给`patch`进行对比，`patched`也会加一。

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlZqb5N0Kru5ojyribc5Q6dIxozgliafjT0dpWzNJ8uzT4gLYyc2TW7p7hlDWOPE0hQtLfsjZrGINyA/640?wx_fmt=other)这最后一部分，主要是为了移动节点和新增节点，如果有需要移动节点它会先根据新旧节点索引的映射产生一个最长递增子序列。而从最后开始循环也便于我们可以使用最后一个修补的节点作为瞄点，找出新节点中的最长递增子序列，移动不在这个范围内的节点，如果映射的`oldIndex`是 0 说明是新增节点，需要进行挂载。在例子中，就会移动 1。

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlZqb5N0Kru5ojyribc5Q6dIbXorg1dp3QPZU09ZZUfAaelHbh6MibotTGZ3u5mMcic0cRciaQklBvx4w/640?wx_fmt=other)image.png

这流程五是最复杂的，其中不仅包含了挂载和卸载，还包含了移动节点，提高了对节点利用，到此`patchKeyedChildren`流程结束。

##### 其他情况

回到`patchChildren`中，继续看`patchFlag`不存在如何进行对比，这要根据新旧节点的情况进行更新

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlZqb5N0Kru5ojyribc5Q6dI7jo3p75X4iagNku8vJol3SImb3oXMSMDkic2QQ8b5lOMrVYCv4nxG7Eg/640?wx_fmt=other)code.png

看起来复杂其实很简单，先说如果新节点是`TEXT_CHILDREN`, 如果旧节点是`ARRAY_CHILDREN`，会先卸载所有旧节点，再挂载新节点，旧节点也是`TEXT_CHILDREN`需要和新节点对比确认不同后再更新。

如果两个都是`ARRAY_CHILDREN`，需要走`patchKeyedChldren`，但也有可能只是卸掉旧的并没有新节点，卸载所有旧节点。

当旧节点是`TEXT_CHILDREN`新节点是`ARRAY_CHILDREN`时，会先将其变为空字符串，再进行挂载新节点。

后面对比`props`的部分，在我之前的文章 Vue3.2 vDOM diff 流程分析之一：props 和 attrs 的初始化和更新 [4] 中讲过，感兴趣可以去看看，到这里对比元素的流程结束。

### 对比组件类型节点

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlZqb5N0Kru5ojyribc5Q6dIlpuGqEtvrnPWYicrIwzJK88B6Oe7Ktfx8LDdqfwQuBkRiaoU5XAFh3vw/640?wx_fmt=other)image.png

在`patch`函数中，对比组件分支执行的是`processComponent`, 最终会执行`updateComponent`，组件更新新的会继承旧的实例。

更新前他会执行`shouldUpdateComponent`判断是否需要更新。但是属实是情况太多，这里就不一一列举了，具体可以到源码中查看 `shouldUpdateComponent`[5] 函数。

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlZqb5N0Kru5ojyribc5Q6dIWsichpqcJ18rzkYQhP8a4oejZJvCteoYKSrtjiaFZ8Cdv1urjibfcbH5Q/640?wx_fmt=other)image.png

进入需要更新的流程，他是会优先处理`Suspense`(存在`asyncDep`且`asyncResolved`不存在)，不是`Suspense`就正常更新，把新`VNode`(`instance.next`) 赋值成 n2，如果当前组件已经在更新队列中，请将它移除，避免重复更新同一组件，然后就可以调用实例上的更新器进行更新了。

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlZqb5N0Kru5ojyribc5Q6dIbtOjjW1TZJKLG0399gVArwc94T0e6EbQs4PAQrNlJhBT1B9Y5Pgqsw/640?wx_fmt=other)image.png

注意这里的`instance.next`, 如果这个存在，在调用`componentUpdateFn`中会调用`updateComponentPreRender`函数，这是因为组件数据变化导致其子组件更新，所以需要去更新实例中的`VNode`以及`props`和`slots`，顺带把更新`props`导致的更新执行了。如果只是单纯的数据变化，没有影响到子组件，那`next`就会是原本实例上的`VNode`。

后面的就是正常调用生命周期函数和钩子函数，产生新的`VNode`和旧的`VNode`一起交给`patch`进行对比，后面的就要看组件里面是啥东西然后走哪个流程。

### 对比文本类型、注释类型、静态节点类型节点

*   文本类型
    

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlZqb5N0Kru5ojyribc5Q6dIFBp6rlEWUnicVvAiavCWz3MKUfDsrGIHzq8zAq7cOsEgFZsDav7qNqVw/640?wx_fmt=other) image.png

文本类型节点的更新在`processText`中，会先进行对比，不同才会更新文本

*   注释类型
    

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlZqb5N0Kru5ojyribc5Q6dIPhfngiaSd9UcymwsibUoNSQINaF9AA9rmL3VpsJ0amjyvLSqaKRBlu7A/640?wx_fmt=other) image.png

注释节点的更新在`processCommentNode`中，但是因为不支持动态更新注释，所以是直接拿以前的。

*   静态节点类型
    

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlZqb5N0Kru5ojyribc5Q6dI2PkqTHUPSvVeNA2yrq7ib2uOjXqWxqS37D1Z6vfKic6BZibIudpWicm5ZA/640?wx_fmt=other) image.png

静态节点的更新执行的是`patchStaticNode`，因为 vue 会把静态节点进行序列化成字符串所以可以直接进行字符串对比，相同只会赋值以前的`el`和`anchor`, 不同会先循环移除旧的，连带着`anchor`一起移除，再挂载新的静态节点。

### 总结

本篇文章分析了 vue 中`diff`算法的处理，清楚 vue 中 diff 算法的处理流程，知道每一个节点对比如何进行，如何书写模板可以进行最优的对比、复用节点，从而提高性能，在列表对比中，优化模式只会对比`dynmaicChildren`中的节点，也就是动态节点，非优化模式下，虽然说是全量`diff`但是可以复用节点也不会损耗太多性能。

好了，到了文章的最后，还是希望各位哥哥姐姐能指导指导。有说错或者遗漏的欢迎在评论区讲解，谢谢。

关于本文

作者：咸鱼是如何练成的

https://juejin.cn/post/7072321805792313357

最后
--

欢迎关注「三分钟学前端」，回复「交流」自动加入前端三分钟进阶群，每日一道编程算法面试题（含解答），助力你成为更优秀的前端开发！

号内回复：  

「网络」，自动获取三分钟学前端网络篇小书（90 + 页）

「JS」，自动获取三分钟学前端 JS 篇小书（120 + 页）

「算法」，自动获取 github 2.9k+ 的前端算法小书

「面试」，自动获取 github 23.2k+ 的前端面试小书

「简历」，自动获取程序员系列的 `120` 套模版

》》面试官也在看的前端面试资料《《  

“在看和转发” 就是最大的