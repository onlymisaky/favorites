> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/WIqoQ_diUPRfQfj9Lk73jA)

一 前言
----

React 是一款非常受前端开发者青睐的 UI 框架, 它不仅可以应用到传统 web 领域，还可以应用客户端应用，小程序应用，甚至是桌面应用。

可以说前端领域半片天都能看到 React 的影子，React 如此受欢迎的原因有很多，比如灵活的 JSX 语法，函数式编程思想，以及应用多种设计模式等。正是因为 React 的这些优点，近些年也有了 “殊的 React” 特应用。这些应用给 React 开发者更大的发挥空间。

这些应用长的像 React ，但又不是真正的 React, 它们和 React 有相同的语法，可以跑在 web 端，也可以跑在 Native 端，甚至桌面端。基于编译时和运行时，它们可以在多端中相互转化，实现一码多端，一定程度上节约了开发成本，提高了开发效率。

这个应用我们叫它基于 React 语法的 DSL 应用，也就是我们今天讨论的主题，那么接下来我们就揭开 React DSL 的面纱。

二 React DSL 背景介绍
----------------

### 2.1 什么是 DSL

在正式介绍 React DSL 之前，先来看一下 DSL 的概念：英语：domain-specific language）简称 DSL，比如 SQL， JSON 等。

DSL 分为内部 DSL 和外部 DSL 。

*   使用独立的解释器或编译器实现的 DSL 被称为外部 DSL。 外部 DSL 的优点在于它是独立于程序开发语言的。对某个特定领域进行操作的程序不一定是使用同一种语言来写的。SQL 就是一种 DSL，学会了 SQL 就可以在不同的语言中使用相同的 SQL 来操作数据库。
    
*   内部 DSL。（则是在一个宿主语言（host language）中实现，它一般以库的形式实现，并倾向于使用宿主语言中的语法。内部 DSL 的优点和缺点与外部 DSL 相反，它借助了宿主语言的语法，程序员无需学习一种新的语言。但是它被限制在宿主语言能够描述的范围内，因此自由度较低。
    

**React DSL 是内部的 DSL，它运行在 JavaScript 引擎中，以 React JSX 和基础 api 为语法。JSX 能够形象的表示出视图层的结构，有这数据层 state，以及改变 state 的方法 `setState` 和 `useState` 等。它们和 React API 保持一致，也可能是阉割版或者是加强版。**

明白了 DSL 之后，我们来看一下 React DSL 的本质。首先看一下 React 框架的本质。

### 2.2 React 框架本质

对于 DSL 框架的理解，从**运行时**和**编译时**角度分析会更加清晰。如下图所示：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/2KticQlBJtdw40ufib4SrRxOV3JUiboqDqc3an4p32QLV45MMtmVn7cnlBljTbJhCE89lJibI1WhTdMW30IvXmXWIg/640?wx_fmt=png)2.png

编译时：我们描述一下整个流程，首先通过 React cli 可以是 `react-create-app`，来编译解析 jsx ，scss/less 等文件，jsx 语法会变成 React.createElement 的形式。最终形成 html，css，js 等浏览器能够识别的文件。

运行时：接下来当浏览器打开应用的时候，会加载这些文件，然后 js 会通过 React 运行时提供的 API 变成 fiber 树结构，接下来就会形成 DOM 树，然后浏览器用 html 作为载体，加入 css 树和 DOM 树，形成渲染树，这样视图就呈现了。

### 2.3 React DSL 本质

React DSL 本质也非常好理解。本质上也分为**编译时**和**运行时**两种。

基于编译时的 DSL:

![](https://mmbiz.qpic.cn/sz_mmbiz_png/2KticQlBJtdw40ufib4SrRxOV3JUiboqDqcSkYaaeFiap4ACmSthXFuwR9JWvbp7aafmXicygkazS0sdG0DRUQVujibw/640?wx_fmt=png)1.png

基于编译时的 React DSL 框架，长的和 React ，但是本质完全不相同，因为在编译阶段已经转化成其他产物了，比如小程序。

其原理就是通过 parse 将 JSX css 等文件转成不同的 AST （抽象语法树），然后就可以用不同的 transformer 生成不同的产物:

*   想转化成小程序，那么用小程序的 transformer 转化，产物是 wxml ，wxss, js 和 json。
    
*   想转化成 web 应用，那么可以通过 web 的 transformer 转化，产物为 css，html，和 js 三件套。
    

举个例子，比如在 React DSL 中这么写到：

```
class Home extends MyReact.Component{    handleClick(){        Router.push('xxx')    }    render(){        return <View>            <View onClick={ this.handleClick } >点击</View>        </View>    }}
```

那么可以通过编译的方式转化成微信小程序，如下所示：

```
<view>    <view bind:tap="handleClick" >点击</view></view>
```

```
Page({    handleClick(){        wx.navigateTo({ url:'xxx' })    },})
```

接下来我们看一下基于运行时 React DSL 本质：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/2KticQlBJtdw40ufib4SrRxOV3JUiboqDqclFPdxhwpLDH8ymticIJH3Yngia1M9nB4gWV5g91avGysV0lPfxg0Fa6w/640?wx_fmt=png)2.png

在编译时，可以通过 React DSL 脚手架工具，将 JSX 转化成 createElement 形式。最终的产物可以理解成一个 JS 文件，可以称之为 JSBundle 。

重点来了，在运行时，我们分别从 **web 应用** 和 **Native 应用** 两个角度来解析流程：

*   如果是 React DSL web 应用，那么可以通过浏览器加载 JSBundle ，然后通过运行时的 api 将页面结构，转化成虚拟 DOM , 虚拟 DOM 再转化成真实 DOM, 然后浏览器可以渲染真实 DOM 。
    
*   如果是 React DSL Native 应用，那么 Native 会通过一个 JS 引擎来运行 JSBundle ，然后同样通过运行时的 API 转化成虚拟 DOM, 接下来因为 Native 应用，所以不能直接转化的 DOM, 这个时候可以生成一些绘制指令，可以通过**桥**的方式，把指令传递给 Native 端，Native 端接收到指令之后，就可以绘制页面了。这样的好处就可以动态上传 bundle ，来实现动态化更新。
    

接下来，我们来从零到一实现一个类似 Native 端的 React DSL 方案。因为纯前端实现，所以这里的 Native 端也用前端的 html 文件来模拟了。

三 实现一个跨端 React DSL 运行时应用
------------------------

下面用一个非常简单案例，来用前端的方式模拟 React DSL Native 渲染流程。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/2KticQlBJtdw40ufib4SrRxOV3JUiboqDqcp4xfOmANuMjI2aJdNrYbrrCnLQJicTWmEia1TLMotXWkZSttOv9hwv1Q/640?wx_fmt=png)5.png

如上：

*   index.html 为视图层, 这里用**视图层模拟代替了 Native 应用**。
    
*   bridge 为 JS 层和 Native 层的代码。
    
*   service.js 为我们写在 js 业务层的代码。
    

核心流程如下：

*   本质上 service.js 运行在 Native 的 JS 引擎中，形成虚拟 DOM ，和绘制指令。
    
*   绘制指令可以通过 bridge 传递给 Native 端 （案例中的 html 和 js ）, 然后渲染视图。
    
*   当触发更新时候，Native 端响应事件，然后把事件通过桥方式传递给 service.js， 接下来 service.js 处理逻辑，发生 diff 更新，产生新的绘制指令，通知给 Native 渲染视图。
    

因为这个案例是用 web 应用模拟的 Native , 所以实现细节和真实场景有所不同，尽请谅解，本案例主要让读者更清晰了解渲染流程。

选今天的主角 React 语法作为 DSL ，简单描述一下完整的流程。比如我们在 React DSL 应用中，写如下代码：

```
class Home extends Component{    state={        show:true    }    handleClick(){      this.setState({ show:false  })    }    render(){        const { show } = this.state        return <view style="height:400px;width:300px;border:1px solid #ccc;" >                    <view style="height:100px;width:300px;background:blue"  >小册名：大前端跨端开发指南</view>                    { show && <view style="height:100px;width:300px;background:pink" >作者：我不是外星人</view> }                    <button onClick={handleClick} >删除作者</button>        </view>    }}
```

这段代码描述了一个视图结构，有一个点击方法，当触发点击方法的时候，改变 show 状态，这个时候可以把 `<view>作者：我不是外星人</view>` 删除。

这段代码首先会被编译，jsx 语法变成 createNode 形式。如下：

```
class Home extends Component{    state={        show:true    }    handleClick(){      this.setState({ show:false  })    }    render(){        const { show } = this.state        return createNode('view',{ style:'height:400px;width:300px;border:1px solid #ccc;' }, [            createNode('view',{ style:'height:100px;width:300px;background:blue' }, '小册名：大前端跨端开发指南'),            show && createNode('view',{ style:'height:100px;width:300px;background:pink' }, '作者：我不是外星人'),            createNode('button',{ onClick: this.handleClick }, '删除作者')        ] )    }}
```

在 React 中，用 createElment 来描述视图结构，但是本次实现的是以 React 语法做 DSL 应用，本质上并不是 React，（语法一样，但是实现完全不同）所以这里我们直接用 createNode 来代替。createNode 实现非常简单如下：

```
function createNode(tag,props,children){    const node = {        tag,        props,        children,    }    return node}
```

createNode 会创建一个虚拟 DOM 节点，其中包括 tag，props 和 children 三个属性，这样视图结构就变成了如下的结构：

```
{  tag: 'view',  props: { style },  children: [    {      tag: 'view',      props: { style },      children: '小册名：大前端跨端开发指南',    },    {      tag: 'view',      props:{ style },      children: '作者：我不是外星人',    },    {      tag: 'button',      props: { onClick },      children: '删除作者',    }  ],}
```

**初始化流程：**

在初始化的时候，Native 开始加载 JS bundle，加载完 JS bundle ，同时通过桥向 JS 通信，开始运行加载 service.js 。

```
<!DOCTYPE html><html lang="en"><head>    <meta charset="UTF-8">    <meta http-equiv="X-UA-Compatible" content="IE=edge">    <meta  ></script><script>    /* 指令解析器 */    function handleDirect(directList){        //...    }    /* 监听 JS （service.js）向 Native (index.html,index.js) 通信 */    window.port2.onmessage = function(event) {        //...    }    /* 模拟加载 bundle 流程 */    const script = document.createElement('script')    script.src = './service.js'    script.onload = function(){        /* 初始化逻辑层 */        NativeToJs({ type:'init' })    }    document.body.appendChild(script)</script></html>
```

因为涉及到桥通信，我们这里用 postMessage 来模拟了 **Native<->JS** 双向通信流程。代码如下：

```
const { port1, port2 } = new MessageChannel();window.port1 = port1window.port2 = port2/* JS 向 Native 通信 */function JsToNative(payload){    console.warn('JS -> Native ')    port1.postMessage(payload)}/* Native 向 JS 通信 */function NativeToJs(payload){    console.warn('Native -> JS ')    port2.postMessage(payload)}
```

MessageChannel 会产生两个端口，port1 和 port2，可以通过两个端口的 postMessage 和 onmessage 方法来实现双向的通信。**注意：真实场景下，是通过 JSbridge 来实现的，在 React Native 通信章节，会介绍相关通信机制和背后运行的原理，这里只是用 MessageChannel 来模拟效果。**

如上在 bundle 加载之后，会调用 NativeToJs 方法来完成 JS 层的初始化流程。在 service.js 中，我们模拟一下对 Native

```
let workInProgress  /* 监听 Native (index.html) 向 JS （service.js） 通信 */window.port1.onmessage = function(event){    const { type,nodeId } = event.data    /* 初始化逻辑层 */    if(type === 'init'){        workInProgress = renderInstance()     /* 发生点击事件 */       }else if(type === 'click') {        console.log(nodeId)        const event = eventMap.get(nodeId)        event && event.call(workInProgress)    }}
```

这里主要监听两种事件：

*   第一种就是 Native 通信 JS 层完成初始化，初始化完成，渲染视图。
    
*   第二种就是 Native 发生事件，触发 JS 对应的回调函数。
    

刚刚在模拟 bundle 初始化的过程中，最终调用的是 NativeToJs({type:'init'}) 方法。那么就会走到 renderInstance 逻辑中。

```
/* 应用初始化 */function renderInstance(){    /* 初始化-渲染形成元素节点 */    const instance = new Home()    const newVode = instance.render()    instance.vnode = diff(newVode,null,'root')    /* 发送绘制指令 */    JsToNative({ type:'render' ,data: JSON.stringify(directList) })    return instance}
```

这个逻辑非常重要，主要可以分成三部分：

*   第一部分：就是实例化上面写的 Home 组件，然后调用 render 函数生成虚拟 DOM 结构。
    
*   第二部分: 调用 diff 来对比新老节点，如果初始化的时候，是没有老元素的，所以 diff 的第二个参数为 null。在 diff 期间，会收集各种渲染指令，**有了这些渲染指令，既可以在 Native 端渲染，也可以在 web 渲染，这样就可以轻松的实现跨端**。这里为了做新来元素的 diff , 通过 vnode 属性来保存了最新构建的虚拟 DOM 树。
    
*   第三部分：就是通过桥的方式，来把指令信息传递过去，在传递过程中，因为只能传递字符串，所以这里用 stringify 来序列化生成的指令。
    

来看一下核心 diff 的实现：

```
let directList = []const CREATE = 'CREATE'  /* 创建 */const UPDATE = 'UPDATE'  /* 更新 */const DELETE = 'DELETE'  /* 删除 */let nodeId = -1const eventMap = new Map()function diffChild(newVNode,oldVNode,parentId){    const newChildren = newVNode?.children    const oldChildren = oldVNode?.children    if(Array.isArray(newChildren)){        newChildren.forEach((newChildrenNode,index)=>{            const oldChildrenNode = oldChildren ? oldChildren[index] : null            diff(newChildrenNode,oldChildrenNode,parentId)        })    }}/* 对比获取渲染指令 */function diff(newVNode,oldVNode,parentId){    /* 新增元素 */    if(newVNode && !oldVNode){        newVNode.nodeId = ++nodeId        newVNode.parentId = parentId        let content = ''        /* 如果存在点击事件，那么映射dui */        if(newVNode?.props?.onClick){            const onClick = newVNode.props.onClick            eventMap.set(nodeId,onClick)            newVNode.props.onClick = onClick.name // handleClick        }        if(Array.isArray(newVNode.children)){            diffChild(newVNode,null,nodeId)        }else {            content = newVNode.children        }        /* 创建渲染指令 */        const direct = {            type:CREATE,            tag:newVNode.tag,            parentId,            nodeId:newVNode.nodeId,            content,            props:newVNode.props        }        directList.push(direct)         /* 删除元素 */    }else if(!newVNode && oldVNode) {       /* 创建删除指令 */       const direct = {            type:DELETE,            tag:oldVNode.tag,            parentId,            nodeId:oldVNode.nodeId,       }       directList.push(direct)    }else {        /* 更新元素 */        newVNode.nodeId = oldVNode.nodeId        newVNode.parentId = oldVNode.parentId        /* 只有文本发生变化的时候，才算元素发生了更新 */        if(typeof newVNode.children === 'string' && newVNode.children !== oldVNode.children){            /* 创建更新指令 */            const direct = {                type:UPDATE,                parentId,                nodeId:oldVNode.nodeId,                content: newVNode.children,                props:newVNode.props           }           directList.push(direct)        }else{            diffChild(newVNode,oldVNode,newVNode.nodeId)        }            }    return newVNode}
```

如上就是整个 diff 流程，在 diff 过程中，会判断新老节点，来收集不同的指令，在 React 是通过 render 阶段，来给 fiber 打不同的 flag 。

*   在 diff 过程中，会通过 nodeId 和 parentId 来记录当前元素节点的唯一性和当前元素的父元素是哪个。
    
*   **如果有新元素，没有老元素，那么证明元素创建**，会收集 create 指令，在这期间会特殊处理一下函数，把函数通过 eventMap 来保存。
    
*   **如果没有新元素，只有老元素，证明元素是删除**，会收集 delete 指令，让 Native 去删除元素。
    
*   **如果新老元素都存在，那么证明有可能发生了更新**，这里做了偷懒，判定只有文本内容更新的时候，才触发更新.
    
*   接下就通过 diffChild 来递归元素节点，完成整个 DOM 树的遍历。
    

如果 `Home` 组件经过如上流程之后，会产生如下的绘制指令：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/2KticQlBJtdw40ufib4SrRxOV3JUiboqDqcqNdpwRfVKkhicjJVkWRkichLzZFt4htibMSoAMAkusDQibzoYD57V2bgxw/640?wx_fmt=png)6.png

有了这些指令之后，接下来就会把消息传递给 Native 端（index.html）, 那么 Native 端同样要监听来自 JS 端的消息。

```
/* 监听 JS （service.js）向 Native (index.html) 通信 */window.port2.onmessage = function(event) {    const { type,data } = event.data    if(type === 'render'){        const directList = JSON.parse(data)        /* 处理绘制指令 */        handleDirect(directList)    }}
```

如上当接受到渲染指令 render 的时候，会调用 handleDirect 来完成页面的绘制。

```
function handleDirect(directList){    console.log(directList)    directList.sort((a,b)=> a.nodeId - b.nodeId ).forEach(item=>{        const { content , nodeId, parentId, props, type, tag } = item        /* 插入节点  */        if(type ==='CREATE'){            let curtag = 'div'            switch(tag){                case 'view':                curtag = 'div'                break                default:                curtag = tag                break              }            const node = document.createElement(curtag)            node.id = 'node' + nodeId            if(content) node.innerText = content            /* 处理点击事件 */            if(props.style) node.style = props.style            if(props.onClick) {            node.onclick = function(){                /* 向 js 层发送事件 */                NativeToJs({ type:'click', nodeId })            }            }            if(parentId === 'root'){                const root = document.getElementById('root')                root.appendChild(node)            }else{                const parentNode = document.getElementById('node'+ parentId)                parentNode && parentNode.appendChild(node)            }        }else if(type === 'DELETE'){            /* 删除节点 */            const parentNode = document.getElementById('node'+ parentId)            const node = document.getElementById('node'+ nodeId)            parentNode.removeChild(node)        }    })}
```

这里用前端的方式，来模拟了整个绘制流程，具体内容包括：事件的处理，元素的处理，属性的处理等等。

其中有一个细节，就是如果发现指令中有绑定事件的时候，就会给元素绑定一个事件函数，当发生点击的时候，触发函数，向 JS 层发送信息。

来看一下最终样子。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/2KticQlBJtdw40ufib4SrRxOV3JUiboqDqcaCo1eTia2GDyMEgf245qukH1rKuql87tz0MNiceibuOQxkqZS1MZwt4DQ/640?wx_fmt=png)7.png

可以看到 Native -> JS , JS -> Native 两次通信，完成了初始化流程，视图也渲染了。接下来就是发生点击触发更新的流程。

**更新流程**

触发点击事件，Native 首先响应，然后向 JS 层发送事件，通过传递 NodeId:

```
/* 向 js 层发送事件 */NativeToJs({ type:'click', nodeId })
```

JS 层接受到事件，执行对应的事件：

```
else if(type === 'click') {    const event = eventMap.get(nodeId)    event && event.call(workInProgress)}
```

JS 可以通过唯一标志 nodeId 来找到对应的函数，然后执行函数，在函数中会触发 setState, 改变 show 的状态，然后让 view 卸载：

```
handleClick(){    this.setState({ show:false  })}
```

因为我们写的是 DSL ，并非真正的 React ，所以对于 Component 和 setStata 需要手动去实现，原理如下：

```
/* Component 构造函数 */function Component (){    this.setState = setState}/* 触发更新 */function setState (state){    /* 合并 state */    Object.assign(this.state,state)    directList = []    const newVode = this.render()    this.vnode = diff(newVode,this.vnode,'root')    /* 发送绘制指令 */    JsToNative({ type:'render' ,data: JSON.stringify(directList) })}
```

Component 很简单，就是给实例上绑定 this.setState 方法。handleClick 中会触发 setState 方法，其内部会合并 state ，然后重制指令，接下来重新调用 render 形成新 node, 和老 node 进行对比，对比哪些发生变化，会重新生成绘制指令。

当触发 show = false 时候，会触发 delete 指令，销毁元素。指令如下：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/2KticQlBJtdw40ufib4SrRxOV3JUiboqDqcW2sC5blHhXT7ac6Arf6x8cthPfjhxId5MD0dtCibe5Qaw746m40Yacw/640?wx_fmt=png)8.png

整体流程如下：

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/2KticQlBJtdw40ufib4SrRxOV3JUiboqDqcVSNdvohicCe0aqFZYLXSe7bpRXDwl6EOVV3ouUt4Tk229HDnyDdXwDw/640?wx_fmt=gif)9.gif

四 总结
----

本文介绍了 React DSL 的本质和原理，并且从零到一写了一个跨端的 React DSL 应用，觉得有帮助的朋友可以**点赞 + 收藏**一波，鼓励我继续创作前端硬文。

前端 社群

  

  

下方加 Nealyang 好友回复「 加群」即可。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/udZl15qqib0N4k0zoSSTiaUeicvTRStJYYmGWa6YpNqicxibYmM4oSD8oWs9X8b9DfK3CpUmGMWzIriaiaOf1L59t9nGA/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

如果你觉得这篇内容对你有帮助，我想请你帮我 2 个小忙：  

1. 点个「在看」，让更多人也能看到这篇文章