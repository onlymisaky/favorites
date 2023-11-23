> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/W9blFhv5fX-nV62oztcX5A)

点击上方 前端瓶子君，关注公众号  

回复算法，加入前端编程面试算法每日一题群

![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHrBPOs1OFIWuxw354WxNWGLnG4YmbacJ96JBbt6I0rnMvVjwMmveGtSr7pDZ3pV0W0Dy1EBwo3jbw/640?wx_fmt=png)

前言
==

面试官:" 你了解`虚拟DOM(Virtual DOM)`跟`Diff算法`吗, 请描述一下它们 ";

我:"额,... 鹅, 那个", 完了😰, 突然智商不在线, 没组织好语言没答好或者压根就答不出来;

所以这次我总结一下相关的知识点, 让你可以有一个清晰的认知之余也会让你在今后遇到这种情况可以**坦然自若, 应付自如, 游刃有余**:

* * *

相关知识点:
------

*   虚拟 DOM(Virtual DOM):
    

*   **什么是虚拟 dom**
    
*   **为什么要使用虚拟 dom**
    
*   虚拟 DOM 库
    

*   DIFF 算法:
    

*   init 函数
    
*   h 函数
    
*   **patch 函数**
    
*   **patchVnode 函数**
    
*   **updateChildren 函数**
    
*   snabbDom 源码
    

* * *

虚拟 DOM(Virtual DOM)
-------------------

### 什么是虚拟 DOM

一句话总结虚拟 DOM 就是一个用来描述真实 DOM 的 **javaScript 对象**, 这样说可能不够形象, 那我们来举个🌰: 分别用代码来描述`真实DOM`以及`虚拟DOM`

`真实DOM`:

```
<ul class="list">    <li>a</li>    <li>b</li>    <li>c</li></ul>复制代码
```

`对应的虚拟DOM`:

```
let vnode = h('ul.list', [  h('li','a'),  h('li','b'),  h('li','c'),])console.log(vnode)复制代码
```

#### 控制台打印出来的 **Vnode**:

![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHrBPOs1OFIWuxw354WxNWGLfDQbT3YnicB8GCBnDpF4K3uCL9yt7F05tKuwS1kxMIrAkLcCic7zK2Dw/640?wx_fmt=png)image.png

#### h 函数生成的虚拟 DOM 这个 JS 对象 (Vnode) 的源码:

```
export interface VNodeData {    props?: Props    attrs?: Attrs    class?: Classes    style?: VNodeStyle    dataset?: Dataset    on?: On    hero?: Hero    attachData?: AttachData    hook?: Hooks    key?: Key    ns?: string // for SVGs    fn?: () => VNode // for thunks    args?: any[] // for thunks    [key: string]: any // for any other 3rd party module}export type Key = string | numberconst interface VNode = {    sel: string | undefined, // 选择器    data: VNodeData | undefined, // VNodeData上面定义的VNodeData    children: Array<VNode | string> | undefined, //子节点,与text互斥    text: string | undefined, // 标签中间的文本内容    elm: Node | undefined, // 转换而成的真实DOM    key: Key | undefined // 字符串或者数字}复制代码
```

##### 补充:

上面的 h 函数大家可能有点熟悉的感觉但是一时间也没想起来, 没关系我来帮大伙回忆; `开发中常见的现实场景,render函数渲染`:

```
// 案例1 vue项目中的main.js的创建vue实例new Vue({  router,  store,  render: h => h(App)}).$mount("#app");//案例2 列表中使用render渲染columns: [    {        title: "操作",        key: "action",        width: 150,        render: (h, params) => {            return h('div', [                h('Button', {                    props: {                        size: 'small'                    },                    style: {                        marginRight: '5px',                        marginBottom: '5px',                    },                    on: {                        click: () => {                            this.toEdit(params.row.uuid);                        }                    }                }, '编辑')            ]);        }    }]复制代码
```

* * *

### 为什么要使用虚拟 DOM

*   MVVM 框架解决视图和状态同步问题
    
*   模板引擎可以简化视图操作, 没办法跟踪状态
    
*   虚拟 DOM 跟踪状态变化
    
*   参考 github 上 virtual-dom[1] 的动机描述
    

*   虚拟 DOM 可以维护程序的状态, 跟踪上一次的状态
    
*   通过比较前后两次状态差异更新真实 DOM
    

*   跨平台使用
    

*   浏览器平台渲染 DOM
    
*   服务端渲染 SSR(Nuxt.js/Next.js), 前端是 vue 向, 后者是 react 向
    
*   原生应用 (Weex/React Native)
    
*   小程序 (mpvue/uni-app) 等
    

*   真实 DOM 的属性很多，创建 DOM 节点开销很大
    
*   虚拟 DOM 只是普通 JavaScript 对象，描述属性并不需要很多，创建开销很小
    
*   **复杂视图情况下提升渲染性能** (操作 dom 性能消耗大, 减少操作 dom 的范围可以提升性能)
    

**灵魂发问**: 使用了虚拟 DOM 就一定会比直接渲染真实 DOM 快吗? 答案当然是`否定`的, 且听我说:![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHrBPOs1OFIWuxw354WxNWGLOqRQpVxXrpsrQicImZicauU14gEaQsytr9ctPwnribnp8RumzfVibLJ5TA/640?wx_fmt=jpeg)

**举例**: 当一个节点变更时 DOMA->DOMB

![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHrBPOs1OFIWuxw354WxNWGLMicqWYBn2NDILaboY0599tJPkaaOl2fJKJIScBrdjmUcGP20MxJgmRQ/640?wx_fmt=png) 上述情况: `示例1`是创建一个`DOMB`然后替换掉`DOMA`; `示例2`去`创建虚拟DOM+DIFF算法`比对发现`DOMB`跟`DOMA`不是相同的节点, 最后还是创建一个`DOMB`然后替换掉`DOMA`; 可以明显看出 1 是更快的, 同样的结果, 2 还要去创建虚拟 DOM+DIFF 算啊对比 所以说使用虚拟 DOM 比直接操作真实 DOM 就一定要快这个说法是`错误的,不严谨的`

**举例**: 当 DOM 树里面的某个子节点的内容变更时:

![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHrBPOs1OFIWuxw354WxNWGLawXVuJrQgyv2RIt2c8XXFPADLfbDMJ55ibzBib36sAbTLXv6Qgg2sySQ/640?wx_fmt=png) 当一些复杂的节点, 比如说一个父节点里面有多个子节点, 当只是一个子节点的内容发生了改变, 那么我们没有必要像`示例1`重新去渲染这个`DOM树`, 这个时候`虚拟DOM+DIFF算法`就能够得到很好的体现, 我们通过`示例2`使用`虚拟DOM+Diff算法`去找出改变了的子节点更新它的内容就可以了

总结: **复杂视图情况下提升渲染性能**, 因为`虚拟DOM+Diff算法`可以精准找到 DOM 树变更的地方, 减少 DOM 的操作 (重排重绘)

* * *

### 虚拟 dom 库

*   Snabbdom[2]
    

*   Vue.js2.x 内部使用的虚拟 DOM 就是改造的 Snabbdom
    
*   大约 200SLOC(single line of code)
    
*   通过模块可扩展
    
*   源码使用 TypeScript 开发
    
*   最快的 Virtual DOM 之一
    

*   virtual-dom[3]
    

* * *

Diff 算法
-------

在看完上述的文章之后相信大家已经对 Diff 算法有一个初步的概念, 没错, Diff 算法其实就是找出两者之间的差异;

> diff 算法首先要明确一个概念就是 Diff 的对象是虚拟 DOM（virtual dom），更新真实 DOM 是 Diff 算法的结果。

下面我将会手撕`snabbdom`源码核心部分为大家打开`Diff`的心, 给点耐心, 别关网页, 我知道你们都是这样:

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHrBPOs1OFIWuxw354WxNWGLmiaaGkkBAmSsUpkaFzPL6DXA5wPrSePTiajHt6GbtZjs6gQvdRUlhwdA/640?wx_fmt=jpeg)src=http___img.wxcha.com_file_201905_17_f5a4d33d48.jpg&refer=http___img.wxcha.jpeg

* * *

snabbdom 的核心
------------

*   `init()`设置模块. 创建`patch()`函数
    
*   使用`h()`函数创建 JavaScript 对象`(Vnode)`描述`真实DOM`
    
*   `patch()`比较`新旧两个Vnode`
    
*   把变化的内容更新到`真实DOM树`
    

### init 函数

init 函数时设置模块, 然后创建 patch() 函数, 我们先通过场景案例来有一个直观的体现:

```
import {init} from 'snabbdom/build/package/init.js'import {h} from 'snabbdom/build/package/h.js'// 1.导入模块import {styleModule} from "snabbdom/build/package/modules/style";import {eventListenersModule} from "snabbdom/build/package/modules/eventListeners";// 2.注册模块const patch = init([  styleModule,  eventListenersModule])// 3.使用h()函数的第二个参数传入模块中使用的数据(对象)let vnode = h('div', [  h('h1', {style: {backgroundColor: 'red'}}, 'Hello world'),  h('p', {on: {click: eventHandler}}, 'Hello P')])function eventHandler() {  alert('疼,别摸我')}const app = document.querySelector('#app')patch(app,vnode)复制代码
```

当 init 使用了导入的模块就能够在 h 函数中用这些模块提供的 api 去创建`虚拟DOM(Vnode)对象`; 在上文中就使用了`样式模块`以及`事件模块`让创建的这个虚拟 DOM 具备样式属性以及事件属性, 最终通过`patch函数`对比`两个虚拟dom`(会先把 app 转换成虚拟 dom), 更新视图;

![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHrBPOs1OFIWuxw354WxNWGLaFBls2pciaaK7XfSjuKBuTicUq5wUUmX7tF5BSPF0Hr8bruzUMSjt3Tw/640?wx_fmt=png)image.png

我们再简单看看 init 的源码部分:

```
// src/package/init.ts/* 第一参数就是各个模块   第二参数就是DOMAPI,可以把DOM转换成别的平台的API,也就是说支持跨平台使用,当不传的时候默认是htmlDOMApi,见下文   init是一个高阶函数,一个函数返回另外一个函数,可以缓存modules,与domApi两个参数,那么以后直接只传oldValue跟newValue(vnode)就可以了*/export function init (modules: Array<Partial<Module>>, domApi?: DOMAPI) {...return function patch (oldVnode: VNode | Element, vnode: VNode): VNode {}}复制代码
```

* * *

### h 函数

些地方也会用`createElement`来命名, 它们是一样的东西, 都是创建`虚拟DOM`的, 在上述文章中相信大伙已经对 h 函数有一个初步的了解并且已经联想了使用场景, 就不作场景案例介绍了, 直接上源码部分:

```
// h函数export function h (sel: string): VNodeexport function h (sel: string, data: VNodeData | null): VNodeexport function h (sel: string, children: VNodeChildren): VNodeexport function h (sel: string, data: VNodeData | null, children: VNodeChildren): VNodeexport function h (sel: any, b?: any, c?: any): VNode {  var data: VNodeData = {}  var children: any  var text: any  var i: number    ...  return vnode(sel, data, children, text, undefined) //最终返回一个vnode函数};复制代码
```

```
// vnode函数export function vnode (sel: string | undefined,  data: any | undefined,  children: Array<VNode | string> | undefined,  text: string | undefined,  elm: Element | Text | undefined): VNode {  const key = data === undefined ? undefined : data.key  return { sel, data, children, text, elm, key } //最终生成Vnode对象}复制代码
```

**总结**:`h函数`先生成一个`vnode`函数, 然后`vnode`函数再生成一个`Vnode`对象 (虚拟 DOM 对象)

#### 补充:

在 h 函数源码部分涉及一个`函数重载`的概念, 简单说明一下:

*   参数个数或参数类型不同的函数 ()
    
*   JavaScript 中没有重载的概念
    
*   TypeScript 中有重载, 不过重载的实现还是通过代码调整参数
    

> 重载这个概念个参数相关, 和返回值无关

*   实例 1(函数重载 - 参数个数)
    

```
function add(a:number,b:number){console.log(a+b)}function add(a:number,b:number,c:number){console.log(a+b+c)}add(1,2)add(1,2,3)复制代码
```

*   实例 2(函数重载 - 参数类型)
    

```
function add(a:number,b:number){console.log(a+b)}function add(a:number,b:string){console.log(a+b)}add(1,2)add(1,'2')复制代码
```

* * *

### patch 函数 (核心)

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHrBPOs1OFIWuxw354WxNWGLdMiaEDJ8ZsO8A93InplfPM97XWqSnm6Y3nLH4QwOdVyqrwpVvJP5VJg/640?wx_fmt=jpeg)src=http___shp.qpic.cn_qqvideo_ori_0_e3012t7v643_496_280_0&refer=http___shp.qpic.jpeg

要是看完前面的铺垫, 看到这里你可能走神了,`醒醒啊,这是核心啊,上高地了兄弟`;

*   pactch(oldVnode,newVnode)
    
*   把新节点中变化的内容渲染到真实 DOM, 最后返回新节点作为下一次处理的旧节点 (核心)
    
*   对比新旧`VNode`是否相同节点 (节点的 key 和 sel 相同)
    
*   如果不是相同节点, 删除之前的内容, 重新渲染
    
*   如果是相同节点, 再判断新的`VNode`是否有`text`, 如果有并且和`oldVnode`的`text`不同直接更新文本内容`(patchVnode)`
    
*   如果新的 VNode 有 children, 判断子节点是否有变化`(updateChildren,最麻烦,最难实现)`
    

源码:

```
return function patch(oldVnode: VNode | Element, vnode: VNode): VNode {        let i: number, elm: Node, parent: Node    const insertedVnodeQueue: VNodeQueue = []    // cbs.pre就是所有模块的pre钩子函数集合    for (i = 0; i < cbs.pre.length; ++i) cbs.pre[i]()    // isVnode函数时判断oldVnode是否是一个虚拟DOM对象    if (!isVnode(oldVnode)) {        // 若不是即把Element转换成一个虚拟DOM对象        oldVnode = emptyNodeAt(oldVnode)    }    // sameVnode函数用于判断两个虚拟DOM是否是相同的,源码见补充1;    if (sameVnode(oldVnode, vnode)) {        // 相同则运行patchVnode对比两个节点,关于patchVnode后面会重点说明(核心)        patchVnode(oldVnode, vnode, insertedVnodeQueue)    } else {        elm = oldVnode.elm! // !是ts的一种写法代码oldVnode.elm肯定有值        // parentNode就是获取父元素        parent = api.parentNode(elm) as Node        // createElm是用于创建一个dom元素插入到vnode中(新的虚拟DOM)        createElm(vnode, insertedVnodeQueue)        if (parent !== null) {            // 把dom元素插入到父元素中,并且把旧的dom删除            api.insertBefore(parent, vnode.elm!, api.nextSibling(elm))// 把新创建的元素放在旧的dom后面            removeVnodes(parent, [oldVnode], 0, 0)        }    }    for (i = 0; i < insertedVnodeQueue.length; ++i) {        insertedVnodeQueue[i].data!.hook!.insert!(insertedVnodeQueue[i])    }    for (i = 0; i < cbs.post.length; ++i) cbs.post[i]()    return vnode}复制代码
```

#### 补充 1: sameVnode 函数

```
function sameVnode(vnode1: VNode, vnode2: VNode): boolean { 通过key和sel选择器判断是否是相同节点    return vnode1.key === vnode2.key && vnode1.sel === vnode2.sel}复制代码
```

* * *

### patchVnode

*   第一阶段触发`prepatch`函数以及`update`函数 (都会触发 prepatch 函数, 两者不完全相同才会触发 update 函数)
    
*   第二阶段, 真正对比新旧`vnode`差异的地方
    
*   第三阶段, 触发`postpatch`函数更新节点
    

源码:

```
function patchVnode(oldVnode: VNode, vnode: VNode, insertedVnodeQueue: VNodeQueue) {    const hook = vnode.data?.hook    hook?.prepatch?.(oldVnode, vnode)    const elm = vnode.elm = oldVnode.elm!    const oldCh = oldVnode.children as VNode[]    const ch = vnode.children as VNode[]    if (oldVnode === vnode) return    if (vnode.data !== undefined) {        for (let i = 0; i < cbs.update.length; ++i) cbs.update[i](oldVnode, vnode)        vnode.data.hook?.update?.(oldVnode, vnode)    }    if (isUndef(vnode.text)) { // 新节点的text属性是undefined        if (isDef(oldCh) && isDef(ch)) { // 当新旧节点都存在子节点            if (oldCh !== ch) updateChildren(elm, oldCh, ch, insertedVnodeQueue) //并且他们的子节点不相同执行updateChildren函数,后续会重点说明(核心)        } else if (isDef(ch)) { // 只有新节点有子节点            // 当旧节点有text属性就会把''赋予给真实dom的text属性            if (isDef(oldVnode.text)) api.setTextContent(elm, '')             // 并且把新节点的所有子节点插入到真实dom中            addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue)        } else if (isDef(oldCh)) { // 清除真实dom的所有子节点            removeVnodes(elm, oldCh, 0, oldCh.length - 1)        } else if (isDef(oldVnode.text)) { // 把''赋予给真实dom的text属性            api.setTextContent(elm, '')        }    } else if (oldVnode.text !== vnode.text) { //若旧节点的text与新节点的text不相同        if (isDef(oldCh)) { // 若旧节点有子节点,就把所有的子节点删除            removeVnodes(elm, oldCh, 0, oldCh.length - 1)        }        api.setTextContent(elm, vnode.text!) // 把新节点的text赋予给真实dom    }    hook?.postpatch?.(oldVnode, vnode) // 更新视图}复制代码
```

看得可能有点蒙蔽, 下面再上一副思维导图:

![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHrBPOs1OFIWuxw354WxNWGLHNVic3kCtibTYFxoJKuJxNsibX6CrbylKsKXUUoWAwAXfyxSCapNOJJUw/640?wx_fmt=png)image.png

* * *

### 题外话: diff 算法简介

**传统 diff 算法**

*   虚拟 DOM 中的 Diff 算法
    
*   `传统算法`查找两颗树每一个节点的差异
    
*   会运行 n1(dom1 的节点数)*n2(dom2 的节点数) 次方去对比, 找到差异的部分再去更新
    

![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHrBPOs1OFIWuxw354WxNWGLskFaGFxm1An1LMPCcD7CeVLs3tyrVjzibiaDoLBrP38qQk78NewUP40Q/640?wx_fmt=png) image.png

**snabbdom 的 diff 算法优化**

*   Snbbdom 根据 DOM 的特点对传统的 diff 算法做了`优化`
    
*   DOM 操作时候很少会跨级别操作节点
    
*   只比较`同级别`的节点
    

![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHrBPOs1OFIWuxw354WxNWGLhTt5D51vDv7tKQJxPMIoJBiaZVnGVEyulmeDO6XoaOgg0wcAcfib0huw/640?wx_fmt=png) image.png![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHrBPOs1OFIWuxw354WxNWGLPiclzDgbxv9NeLzmfvHlj8c4nG4GyIC5ibnxSxj9iaAIibvQy6ic8kDcUdw/640?wx_fmt=jpeg)src=http___img.wxcha.com_file_202004_03_1ed2e19e4f.jpg&refer=http___img.wxcha.jpeg

下面我们就会介绍`updateChildren`函数怎么去对比子节点的`异同`, 也是`Diff算法`里面的一个核心以及难点;

* * *

### updateChildren(核中核: 判断子节点的差异)

*   这个函数我分为三个部分,`部分1:声明变量`,`部分2:同级别节点比较`,`部分3:循环结束的收尾工作`(见下图);
    

![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHrBPOs1OFIWuxw354WxNWGLo4beynIyjicqy8USxBRKW2lTSiaD7ZNaM4aT77B7cqnsPz1b66dULSBQ/640?wx_fmt=png)image.png

*   `同级别节点比较`的`五种`情况:
    

1.  `oldStartVnode/newStartVnode`(旧开始节点 / 新开始节点) 相同
    
2.  `oldEndVnode/newEndVnode`(旧结束节点 / 新结束节点) 相同
    
3.  `oldStartVnode/newEndVnode`(旧开始节点 / 新结束节点) 相同
    
4.  `oldEndVnode/newStartVnode`(旧结束节点 / 新开始节点) 相同
    
5.  `特殊情况当1,2,3,4的情况都不符合`的时候就会执行, 在`oldVnodes`里面寻找跟`newStartVnode`一样的节点然后位移到`oldStartVnode`, 若没有找到在就`oldStartVnode`创建一个
    

*   执行过程是一个循环, 在每次循环里, 只要执行了上述的情况的五种之一就会结束一次循环
    
*   `循环结束的收尾工作`: 直到 oldStartIdx>oldEndIdx || newStartIdx>newEndIdx(代表旧节点或者新节点已经遍历完)
    

为了更加直观的了解, 我们再来看看`同级别节点比较`的`五种`情况的实现细节:

#### 新开始节点和旧开始节点 (情况 1)

![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHrBPOs1OFIWuxw354WxNWGL0FukiaVosSclGTu0CVmzFnDl25vU2xDfGFqrdib1ApyMxbicfJHU7hxoQ/640?wx_fmt=png)image.png

*   若`情况1符合:(从新旧节点的开始节点开始对比`,`oldCh[oldStartIdx]和newCh[newStartIdx]`进行`sameVnode(key和sel相同)`判断是否相同节点)
    
*   则执行`patchVnode`找出两者之间的差异, 更新图; 如没有差异则什么都不操作, 结束一次循环
    
*   `oldStartIdx++/newStartIdx++`
    

#### 新结束节点和旧结束节点 (情况 2)

![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHrBPOs1OFIWuxw354WxNWGLVLrlUWMxPpwEeGcyyqNlav4kQ39b67C6udVcSBVQMUCbJ2cQuy2Mrw/640?wx_fmt=png)image.png

*   若`情况1不符合`就判断`情况2`, 若符合:(从新旧节点的结束节点开始对比,`oldCh[oldEndIdx]和newCh[newEndIdx]`对比, 执行`sameVnode(key和sel相同)`判断是否相同节点)
    
*   执行`patchVnode`找出两者之间的差异, 更新视图,; 如没有差异则什么都不操作, 结束一次循环
    
*   `oldEndIdx--/newEndIdx--`
    

#### 旧开始节点 / 新结束节点 (情况 3)

![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHrBPOs1OFIWuxw354WxNWGLZVArY457qurQ68lYhlOoMwPsP0MH6vwhmCCqbkFA9UticROnNkicLHMw/640?wx_fmt=png)image.png

*   若`情况1,2`都不符合, 就会尝试情况 3:(旧节点的开始节点与新节点的结束节点开始对比,`oldCh[oldStartIdx]和newCh[newEndIdx]`对比, 执行`sameVnode(key和sel相同)`判断是否相同节点)
    
*   执行`patchVnode`找出两者之间的差异, 更新视图, 如没有差异则什么都不操作, 结束一次循环
    
*   `oldCh[oldStartIdx]对应的真实dom`位移到`oldCh[oldEndIdx]对应的真实dom`后
    
*   `oldStartIdx++/newEndIdx--`;
    

#### 旧结束节点 / 新开始节点 (情况 4)

![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHrBPOs1OFIWuxw354WxNWGLrSn8AFYYhe5PkXz3mvF8vmlgMIVWMib7ia6M8RPLiaF0icOjecqDARRQrw/640?wx_fmt=png)image.png

*   若`情况1,2,3`都不符合, 就会尝试情况 4:(旧节点的结束节点与新节点的开始节点开始对比,`oldCh[oldEndIdx]和newCh[newStartIdx]`对比, 执行`sameVnode(key和sel相同)`判断是否相同节点)
    
*   执行`patchVnode`找出两者之间的差异, 更新视图, 如没有差异则什么都不操作, 结束一次循环
    
*   `oldCh[oldEndIdx]对应的真实dom`位移到`oldCh[oldStartIdx]对应的真实dom`前
    
*   `oldEndIdx--/newStartIdx++`;
    

#### 新开始节点 / 旧节点数组中寻找节点 (情况 5)

![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHrBPOs1OFIWuxw354WxNWGLDfkGugZlWV20ibb28fccQYyfnVQrKRkbI0OhQk7YWMfzGa2lhRZiatYQ/640?wx_fmt=png)image.png

*   从旧节点里面寻找, 若寻找到与`newCh[newStartIdx]`相同的节点 (且叫`对应节点[1]`), 执行`patchVnode`找出两者之间的差异, 更新视图, 如没有差异则什么都不操作, 结束一次循环
    
*   `对应节点[1]对应的真实dom`位移到`oldCh[oldStartIdx]对应的真实dom`前
    

![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHrBPOs1OFIWuxw354WxNWGLH3WaEve0S2DSdgSNRG7ZD6wEvRbGkXZzGx1MkprolMTtTzbW9UdeSg/640?wx_fmt=png) image.png

*   `若没有寻找到相同的节点`, 则创建一个与`newCh[newStartIdx]`节点对应的`真实dom`插入到`oldCh[oldStartIdx]对应的真实dom`前
    
*   `newStartIdx++`
    

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHrBPOs1OFIWuxw354WxNWGLzpq1l65ibHAOJ2cmVFjzribYZmcS4tEFAO9Y7vLvum5w6PtZic5Fve3Fw/640?wx_fmt=jpeg)379426071b8130075b11ba142f9468e2.jpeg

* * *

下面我们再介绍一下`结束循环`的收尾工作`(oldStartIdx>oldEndIdx || newStartIdx>newEndIdx)`:

![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHrBPOs1OFIWuxw354WxNWGLmYk2PhgcCYDS65VF1IO40oePD81kk9mnXtEGzmFRSz6twwVHPNRYYQ/640?wx_fmt=png)image.png

*   `新节点的所有子节点`先遍历完 (`newStartIdx>newEndIdx`), 循环结束
    
*   `新节点的所有子节点`遍历结束就是把没有对应相同节点的`子节点`删除
    

![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHrBPOs1OFIWuxw354WxNWGLxpzF89kARG0zoXdXQXupc0PXWK4SyBSUib2vyLlemRV1zNHiaYRXpoDA/640?wx_fmt=png) image.png

*   `旧节点的所有子节点`先遍历完 (`oldStartIdx>oldEndIdx`), 循环结束
    
*   `旧节点的所有子节点`遍历结束就是在多出来的`子节点`插入到`旧节点结束节点`前;(源码:`newCh[newEndIdx + 1].elm)`, 就是对应的`旧结束节点的真实dom`,newEndIdx+1 是因为在匹配到相同的节点需要 - 1, 所以需要加回来就是结束节点
    

最后附上源码:

```
function updateChildren(parentElm, oldCh, newCh, insertedVnodeQueue) {    let oldStartIdx = 0;                // 旧节点开始节点索引    let newStartIdx = 0;                // 新节点开始节点索引    let oldEndIdx = oldCh.length - 1;   // 旧节点结束节点索引    let oldStartVnode = oldCh[0];       // 旧节点开始节点    let oldEndVnode = oldCh[oldEndIdx]; // 旧节点结束节点    let newEndIdx = newCh.length - 1;   // 新节点结束节点索引    let newStartVnode = newCh[0];       // 新节点开始节点    let newEndVnode = newCh[newEndIdx]; // 新节点结束节点    let oldKeyToIdx;                    // 节点移动相关    let idxInOld;                       // 节点移动相关    let elmToMove;                      // 节点移动相关    let before;    // 同级别节点比较    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {        if (oldStartVnode == null) {            oldStartVnode = oldCh[++oldStartIdx]; // Vnode might have been moved left        }        else if (oldEndVnode == null) {            oldEndVnode = oldCh[--oldEndIdx];        }        else if (newStartVnode == null) {            newStartVnode = newCh[++newStartIdx];        }        else if (newEndVnode == null) {            newEndVnode = newCh[--newEndIdx];        }        else if (sameVnode(oldStartVnode, newStartVnode)) { // 判断情况1            patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue);            oldStartVnode = oldCh[++oldStartIdx];            newStartVnode = newCh[++newStartIdx];        }        else if (sameVnode(oldEndVnode, newEndVnode)) {   // 情况2            patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue);            oldEndVnode = oldCh[--oldEndIdx];            newEndVnode = newCh[--newEndIdx];        }        else if (sameVnode(oldStartVnode, newEndVnode)) { // Vnode moved right情况3            patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue);            api.insertBefore(parentElm, oldStartVnode.elm, api.nextSibling(oldEndVnode.elm));            oldStartVnode = oldCh[++oldStartIdx];            newEndVnode = newCh[--newEndIdx];        }        else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left情况4            patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue);            api.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);            oldEndVnode = oldCh[--oldEndIdx];            newStartVnode = newCh[++newStartIdx];        }        else {                                             // 情况5            if (oldKeyToIdx === undefined) {                oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);            }            idxInOld = oldKeyToIdx[newStartVnode.key];            if (isUndef(idxInOld)) { // New element        // 创建新的节点在旧节点的新节点前                api.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm);            }            else {                elmToMove = oldCh[idxInOld];                if (elmToMove.sel !== newStartVnode.sel) { // 创建新的节点在旧节点的新节点前                    api.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm);                }                else {                                                           // 在旧节点数组中找到相同的节点就对比差异更新视图,然后移动位置                    patchVnode(elmToMove, newStartVnode, insertedVnodeQueue);                    oldCh[idxInOld] = undefined;                    api.insertBefore(parentElm, elmToMove.elm, oldStartVnode.elm);                }            }            newStartVnode = newCh[++newStartIdx];        }    }    // 循环结束的收尾工作    if (oldStartIdx <= oldEndIdx || newStartIdx <= newEndIdx) {        if (oldStartIdx > oldEndIdx) {            // newCh[newEndIdx + 1].elm就是旧节点数组中的结束节点对应的dom元素            // newEndIdx+1是因为在之前成功匹配了newEndIdx需要-1            // newCh[newEndIdx + 1].elm,因为已经匹配过有相同的节点了,它就是等于旧节点数组中的结束节点对应的dom元素(oldCh[oldEndIdx + 1].elm)            before = newCh[newEndIdx + 1] == null ? null : newCh[newEndIdx + 1].elm;            // 把新节点数组中多出来的节点插入到before前            addVnodes(parentElm, before, newCh, newStartIdx, newEndIdx, insertedVnodeQueue);        }        else {            // 这里就是把没有匹配到相同节点的节点删除掉            removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);        }    }}复制代码
```

* * *

#### key 的作用

*   Diff 操作可以`更加快速`;
    
*   Diff 操作可以更加准确;`(避免渲染错误)`
    
*   `不推荐使用索引`作为 key
    

以下我们看看这些作用的实例:

##### Diff 操作可以更加准确;`(避免渲染错误)`:

实例: a,b,c 三个 dom 元素中的 b,c 间插入一个 z 元素

没有设置 key ![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHrBPOs1OFIWuxw354WxNWGLQBlov7cLbsewuYickoDtZ3FLd4nK1icFQnPib2jtradgpQcsLl8laVRibA/640?wx_fmt=png) 当设置了 key:

![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHrBPOs1OFIWuxw354WxNWGLmpEtqe7pwqUuBoRHKoiaUF6b80gmCQicxWJQxErUp47TeMRJ7NXBR0Dw/640?wx_fmt=png)image.png

##### Diff 操作可以更加准确;`(避免渲染错误)`

实例: a,b,c 三个 dom 元素, 修改了 a 元素的某个属性再去在 a 元素前新增一个 z 元素

没有设置 key:

![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHrBPOs1OFIWuxw354WxNWGLicShV9Z6VakI8f5xOAdNRYtmlHNAmqx4UgOAWztdoicryEgImaNiaKTQQ/640?wx_fmt=png)image.png![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHrBPOs1OFIWuxw354WxNWGLppGHLibOEHonGxhLfqeNKp2u4vs6vNvg9OwMrSu3cCjOpuQATp8XicMA/640?wx_fmt=png)image.png

因为没有设置 key, 默认都是 undefined, 所以节点都是相同的, 更新了 text 的内容但还是沿用了之前的 dom, 所以实际上`a->z(a原本打勾的状态保留了,只改变了text),b->a,c->b,d->c`, 遍历完毕发现还要增加一个 dom, 在最后新增一个 text 为 d 的 dom 元素

设置了 key:

![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHrBPOs1OFIWuxw354WxNWGLNqCAPYsxRaFeAI4CyhalcedtaGYicWQmkz1ibtdqN4xwzoDiaoTIXSwag/640?wx_fmt=png)image.png![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHrBPOs1OFIWuxw354WxNWGL3bJXibeUugGXzPCEDibqhdKqWsibJMibahnicqjfOQfr8JHC5LTSEymKiaGA/640?wx_fmt=png)image.png

当设置了 key,a,b,c,d 都有对应的 key,`a->a,b->b,c->c,d->d`, 内容相同无需更新, 遍历结束, 新增一个 text 为 z 的 dom 元素

##### `不推荐使用索引`作为 key:

设置索引为 key:

![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHrBPOs1OFIWuxw354WxNWGLXyG20PYXWkPjWciaFFZPtO6nd3cia8mXE4otXqq1FeYbNb6j0VzFLwyA/640?wx_fmt=png)image.png

这明显效率不高, 我们只希望找出不同的节点更新, 而使用索引作为 key 会增加运算时间, 我们可以把 key 设置为与节点 text 为一致就可以解决这个问题:

![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHrBPOs1OFIWuxw354WxNWGLdzMXJFmut6AoNtXKorxW9HAbcMsctLKDrsH3z99F79KApCIGHyZ4rA/640?wx_fmt=png)image.png

* * *

最后
--

如有描述错误或者不明的地方请在下方评论联系我, 我会立刻更新, 如有收获, 请为我点个赞👍这是对我的莫大的支持, 谢谢各位

关于本文  

作者：渣渣 xiong
===========

https://juejin.cn/post/7000266544181674014

最后
--

欢迎关注【前端瓶子君】✿✿ヽ (°▽°) ノ✿  

回复「算法」，加入前端编程源码算法群，每日一道面试题（工作日），第二天瓶子君都会很认真的解答哟！  

回复「交流」，吹吹水、聊聊技术、吐吐槽！

回复「阅读」，每日刷刷高质量好文！

如果这篇文章对你有帮助，「在看」是最大的支持

 》》面试官也在看的算法资料《《  

“在看和转发” 就是最大的支持