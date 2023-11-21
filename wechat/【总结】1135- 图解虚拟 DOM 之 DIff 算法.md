> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/U8Y_9erztwIr0Nve3mbOYA)

![](https://mmbiz.qpic.cn/mmbiz_jpg/dy9CXeZLlCVuIXHQDNwicmtvImlrBxCYafiaFibIKiaGI4XjY1yqQdf51Z3AaicxC5Jmutoy7ibF8UIuPsicrsYFKwPiag/640?wx_fmt=jpeg)

> 原文: https://juejin.cn/post/7000266544181674014

1. 目录
-----

*   `1. 相关知识点:`
    
*   `2. 虚拟DOM(Virtual DOM)`
    

*   `2.1. 什么是虚拟DOM`
    
*   `2.2. 为什么要使用虚拟DOM`
    
*   `2.3. 虚拟dom库`
    

*   `3. Diff算法`
    
*   `4. snabbdom的核心`
    

*   `4.1. init函数`
    
*   `4.2. h函数`
    
*   `4.3. patch函数(核心)`
    
*   `4.4. patchVnode`
    
*   `4.5. 题外话:diff算法简介`
    
*   `4.6. updateChildren(核中核:判断子节点的差异)`
    

*   `5. 最后`
    

面试官:" 你了解`虚拟DOM(Virtual DOM)`跟`Diff算法`吗, 请描述一下它们 ";

我:"额,... 鹅, 那个", 完了😰, 突然智商不在线, 没组织好语言没答好或者压根就答不出来;

所以这次我总结一下相关的知识点, 让你可以有一个清晰的认知之余也会让你在今后遇到这种情况可以「坦然自若, 应付自如, 游刃有余」:

2. 相关知识点:
---------

*   虚拟 DOM(Virtual DOM):
    

*   「什么是虚拟 dom」
    
*   「为什么要使用虚拟 dom」
    
*   虚拟 DOM 库
    

*   DIFF 算法:
    

*   init 函数
    
*   h 函数
    
*   「patch 函数」
    
*   「patchVnode 函数」
    
*   「updateChildren 函数」
    
*   snabbDom 源码
    

3. 虚拟 DOM(Virtual DOM)
----------------------

### 3.1. 什么是虚拟 DOM

一句话总结虚拟 DOM 就是一个用来描述真实 DOM 的「javaScript 对象」, 这样说可能不够形象, 那我们来举个🌰: 分别用代码来描述`真实DOM`以及`虚拟DOM`

`真实DOM`:

```
<ul class="list">    <li>a</li>    <li>b</li>    <li>c</li></ul>
```

`对应的虚拟DOM`:

```
let vnode = h('ul.list', [  h('li','a'),  h('li','b'),  h('li','c'),])console.log(vnode)
```

#### 3.1.1 控制台打印出来的「Vnode」:

![](https://mmbiz.qpic.cn/sz_mmbiz_png/po6IxVbAMcQAlaWibia3Sxw7MG2BPDwEO2ZqfZ8pSIibSLBcN94ibbHOn1ch3OxvcZnS7SCcuUZqiaKtuGQVglKdWqw/640?wx_fmt=png)

#### 3.1.2 h 函数生成的虚拟 DOM 这个 JS 对象 (Vnode) 的源码:

```
export interface VNodeData {    props?: Props    attrs?: Attrs    class?: Classes    style?: VNodeStyle    dataset?: Dataset    on?: On    hero?: Hero    attachData?: AttachData    hook?: Hooks    key?: Key    ns?: string // for SVGs    fn?: () => VNode // for thunks    args?: any[] // for thunks    [key: string]: any // for any other 3rd party module}export type Key = string | numberconst interface VNode = {    sel: string | undefined, // 选择器    data: VNodeData | undefined, // VNodeData上面定义的VNodeData    children: Array<VNode | string> | undefined, //子节点,与text互斥    text: string | undefined, // 标签中间的文本内容    elm: Node | undefined, // 转换而成的真实DOM    key: Key | undefined // 字符串或者数字}
```

##### 3.1.2 补充:

上面的 h 函数大家可能有点熟悉的感觉但是一时间也没想起来, 没关系我来帮大伙回忆;  
`开发中常见的现实场景,render函数渲染`:

```
// 案例1 vue项目中的main.js的创建vue实例new Vue({  router,  store,  render: h => h(App)}).$mount("#app");//案例2 列表中使用render渲染columns: [    {        title: "操作",        key: "action",        width: 150,        render: (h, params) => {            return h('section', [                h('Button', {                    props: {                        size: 'small'                    },                    style: {                        marginRight: '5px',                        marginBottom: '5px',                    },                    on: {                        click: () => {                            this.toEdit(params.row.uuid);                        }                    }                }, '编辑')            ]);        }    }]
```

### 3.2. 为什么要使用虚拟 DOM

*   MVVM 框架解决视图和状态同步问题
    
*   模板引擎可以简化视图操作, 没办法跟踪状态
    
*   虚拟 DOM 跟踪状态变化
    
*   参考 github 上 virtual-dom 的动机描述
    
    长按识别二维码查看原文
    
    https://github.com/Matt-Esch/virtual-dom
    
    ![](https://mmbiz.qpic.cn/sz_mmbiz_png/po6IxVbAMcQAlaWibia3Sxw7MG2BPDwEO2GWfucXWTakp7RMickHFkjiaIGPFSvZOX7cgoibmpjvNZnQxbF6sUwcKOA/640?wx_fmt=png)      
    

*   虚拟 DOM 可以维护程序的状态, 跟踪上一次的状态
    
*   通过比较前后两次状态差异更新真实 DOM
    

*   跨平台使用
    

*   浏览器平台渲染 DOM
    
*   服务端渲染 SSR(Nuxt.js/Next.js), 前端是 vue 向, 后者是 react 向
    
*   原生应用 (Weex/React Native)
    
*   小程序 (mpvue/uni-app) 等
    

*   真实 DOM 的属性很多，创建 DOM 节点开销很大
    
*   虚拟 DOM 只是普通 JavaScript 对象，描述属性并不需要很多，创建开销很小
    
*   「复杂视图情况下提升渲染性能」(操作 dom 性能消耗大, 减少操作 dom 的范围可以提升性能)
    

「灵魂发问」: 使用了虚拟 DOM 就一定会比直接渲染真实 DOM 快吗? 答案当然是`否定`的, 且听我说:  
![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/po6IxVbAMcQAlaWibia3Sxw7MG2BPDwEO2ttvXHJ7JQ9fia1LUELMibDHJ47h41XYRBuzjbCuQ8dnEaibPOk4vX11bA/640?wx_fmt=jpeg)

「举例」: 当一个节点变更时 DOMA->DOMB

![](https://mmbiz.qpic.cn/sz_mmbiz_png/po6IxVbAMcQAlaWibia3Sxw7MG2BPDwEO2sPjAwOAIXUqBhwia2L5gyK3iap5Wd3XNw8J0ZWfeAOkkRJMUrTzRknYw/640?wx_fmt=png)

「举例」: 当 DOM 树里面的某个子节点的内容变更时:

![](https://mmbiz.qpic.cn/sz_mmbiz_png/po6IxVbAMcQAlaWibia3Sxw7MG2BPDwEO2WZ2dBic2h0TnJt6DAswyXLHRth7BeSahI42NAryGfjd3azTuYcmTFKQ/640?wx_fmt=png)

总结:「复杂视图情况下提升渲染性能」, 因为`虚拟DOM+Diff算法`可以精准找到 DOM 树变更的地方, 减少 DOM 的操作 (重排重绘)

### 3.3. 虚拟 dom 库

*   Snabbdom
    
    长按识别二维码查看原文
    
    https://github.com/snabbdom/snabbdom
    

*   Vue.js2.x 内部使用的虚拟 DOM 就是改造的 Snabbdom
    
*   大约 200SLOC(single line of code)
    
*   通过模块可扩展
    
*   源码使用 TypeScript 开发
    
*   最快的 Virtual DOM 之一
    

*   virtual-dom
    
    长按识别二维码查看原文
    
    https://github.com/Matt-Esch/virtual-dom
    
    ![](https://mmbiz.qpic.cn/sz_mmbiz_png/po6IxVbAMcQAlaWibia3Sxw7MG2BPDwEO2GWfucXWTakp7RMickHFkjiaIGPFSvZOX7cgoibmpjvNZnQxbF6sUwcKOA/640?wx_fmt=png)      
    

4. Diff 算法
----------

在看完上述的文章之后相信大家已经对 Diff 算法有一个初步的概念, 没错, Diff 算法其实就是找出两者之间的差异;

> diff 算法首先要明确一个概念就是 Diff 的对象是虚拟 DOM（virtual dom），更新真实 DOM 是 Diff 算法的结果。

下面我将会手撕`snabbdom`源码核心部分为大家打开`Diff`的心, 给点耐心, 别关网页, 我知道你们都是这样:

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/po6IxVbAMcQAlaWibia3Sxw7MG2BPDwEO2u9uNV0MyFSogtoDx4R6oBcsncS2PpLGmEKFbm8K86gFAlklY7WY9Iw/640?wx_fmt=jpeg)src=http___img.wxcha.com_file_201905_17_f5a4d33d48.jpg&refer=http___img.wxcha.jpeg

5. snabbdom 的核心
---------------

*   `init()`设置模块. 创建`patch()`函数
    
*   使用`h()`函数创建 JavaScript 对象`(Vnode)`描述`真实DOM`
    
*   `patch()`比较`新旧两个Vnode`
    
*   把变化的内容更新到`真实DOM树`
    

### 5.1. init 函数

init 函数时设置模块, 然后创建 patch() 函数, 我们先通过场景案例来有一个直观的体现:

```
import {init} from 'snabbdom/build/package/init.js'import {h} from 'snabbdom/build/package/h.js'// 1.导入模块import {styleModule} from "snabbdom/build/package/modules/style";import {eventListenersModule} from "snabbdom/build/package/modules/eventListeners";// 2.注册模块const patch = init([  styleModule,  eventListenersModule])// 3.使用h()函数的第二个参数传入模块中使用的数据(对象)let vnode = h('section', [  h('h1', {style: {backgroundColor: 'red'}}, 'Hello world'),  h('p', {on: {click: eventHandler}}, 'Hello P')])function eventHandler() {  alert('疼,别摸我')}const app = document.querySelector('#app')patch(app,vnode)
```

当 init 使用了导入的模块就能够在 h 函数中用这些模块提供的 api 去创建`虚拟DOM(Vnode)对象`; 在上文中就使用了`样式模块`以及`事件模块`让创建的这个虚拟 DOM 具备样式属性以及事件属性, 最终通过`patch函数`对比`两个虚拟dom`(会先把 app 转换成虚拟 dom), 更新视图;

![](https://mmbiz.qpic.cn/sz_mmbiz_png/po6IxVbAMcQAlaWibia3Sxw7MG2BPDwEO2tIZUaQf5cLotvzVxwD9US9TrVNTkZ20dqmFkQPDWuib5ClsKjLxVQsQ/640?wx_fmt=png)

我们再简单看看 init 的源码部分:

```
// src/package/init.ts/* 第一参数就是各个模块   第二参数就是DOMAPI,可以把DOM转换成别的平台的API,也就是说支持跨平台使用,当不传的时候默认是htmlDOMApi,见下文   init是一个高阶函数,一个函数返回另外一个函数,可以缓存modules,与domApi两个参数,那么以后直接只传oldValue跟newValue(vnode)就可以了*/export function init (modules: Array<Partial<Module>>, domApi?: DOMAPI) {...return function patch (oldVnode: VNode | Element, vnode: VNode): VNode {}}
```

### 5.2. h 函数

些地方也会用`createElement`来命名, 它们是一样的东西, 都是创建`虚拟DOM`的, 在上述文章中相信大伙已经对 h 函数有一个初步的了解并且已经联想了使用场景, 就不作场景案例介绍了, 直接上源码部分:

```
// h函数export function h (sel: string): VNodeexport function h (sel: string, data: VNodeData | null): VNodeexport function h (sel: string, children: VNodeChildren): VNodeexport function h (sel: string, data: VNodeData | null, children: VNodeChildren): VNodeexport function h (sel: any, b?: any, c?: any): VNode {  var data: VNodeData = {}  var children: any  var text: any  var i: number    ...  return vnode(sel, data, children, text, undefined) //最终返回一个vnode函数};
```

```
// vnode函数export function vnode (sel: string | undefined,  data: any | undefined,  children: Array<VNode | string> | undefined,  text: string | undefined,  elm: Element | Text | undefined): VNode {  const key = data === undefined ? undefined : data.key  return { sel, data, children, text, elm, key } //最终生成Vnode对象}
```

「总结」:`h函数`先生成一个`vnode`函数, 然后`vnode`函数再生成一个`Vnode`对象 (虚拟 DOM 对象)

#### 5.2.1 补充:

在 h 函数源码部分涉及一个`函数重载`的概念, 简单说明一下:

*   参数个数或参数类型不同的函数 ()
    
*   JavaScript 中没有重载的概念
    
*   TypeScript 中有重载, 不过重载的实现还是通过代码调整参数
    

> 重载这个概念个参数相关, 和返回值无关

*   实例 1(函数重载 - 参数个数)
    

```
function add(a:number,b:number){console.log(a+b)}function add(a:number,b:number,c:number){console.log(a+b+c)}add(1,2)add(1,2,3)
```

*   实例 2(函数重载 - 参数类型)
    

```
function add(a:number,b:number){console.log(a+b)}function add(a:number,b:string){console.log(a+b)}add(1,2)add(1,'2')
```

### 5.3. patch 函数 (核心)

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/po6IxVbAMcQAlaWibia3Sxw7MG2BPDwEO25VPlicJ1kE21AhdgzibVkRsYOQd9eNyKAc9FnQl95siciasXjRZZsZO5Dg/640?wx_fmt=jpeg)src=http___shp.qpic.cn_qqvideo_ori_0_e3012t7v643_496_280_0&refer=http___shp.qpic.jpeg

要是看完前面的铺垫, 看到这里你可能走神了,`醒醒啊,这是核心啊,上高地了兄弟`;

*   pactch(oldVnode,newVnode)
    
*   把新节点中变化的内容渲染到真实 DOM, 最后返回新节点作为下一次处理的旧节点 (核心)
    
*   对比新旧`VNode`是否相同节点 (节点的 key 和 sel 相同)
    
*   如果不是相同节点, 删除之前的内容, 重新渲染
    
*   如果是相同节点, 再判断新的`VNode`是否有`text`, 如果有并且和`oldVnode`的`text`不同直接更新文本内容`(patchVnode)`
    
*   如果新的 VNode 有 children, 判断子节点是否有变化`(updateChildren,最麻烦,最难实现)`
    

源码:

```
return function patch(oldVnode: VNode | Element, vnode: VNode): VNode {        let i: number, elm: Node, parent: Node    const insertedVnodeQueue: VNodeQueue = []    // cbs.pre就是所有模块的pre钩子函数集合    for (i = 0; i < cbs.pre.length; ++i) cbs.pre[i]()    // isVnode函数时判断oldVnode是否是一个虚拟DOM对象    if (!isVnode(oldVnode)) {        // 若不是即把Element转换成一个虚拟DOM对象        oldVnode = emptyNodeAt(oldVnode)    }    // sameVnode函数用于判断两个虚拟DOM是否是相同的,源码见补充1;    if (sameVnode(oldVnode, vnode)) {        // 相同则运行patchVnode对比两个节点,关于patchVnode后面会重点说明(核心)        patchVnode(oldVnode, vnode, insertedVnodeQueue)    } else {        elm = oldVnode.elm! // !是ts的一种写法代码oldVnode.elm肯定有值        // parentNode就是获取父元素        parent = api.parentNode(elm) as Node        // createElm是用于创建一个dom元素插入到vnode中(新的虚拟DOM)        createElm(vnode, insertedVnodeQueue)        if (parent !== null) {            // 把dom元素插入到父元素中,并且把旧的dom删除            api.insertBefore(parent, vnode.elm!, api.nextSibling(elm))// 把新创建的元素放在旧的dom后面            removeVnodes(parent, [oldVnode], 0, 0)        }    }    for (i = 0; i < insertedVnodeQueue.length; ++i) {        insertedVnodeQueue[i].data!.hook!.insert!(insertedVnodeQueue[i])    }    for (i = 0; i < cbs.post.length; ++i) cbs.post[i]()    return vnode}
```

#### 5.3.1 补充 1: sameVnode 函数

```
function sameVnode(vnode1: VNode, vnode2: VNode): boolean { 通过key和sel选择器判断是否是相同节点    return vnode1.key === vnode2.key && vnode1.sel === vnode2.sel}
```

### 5.4. patchVnode

*   第一阶段触发`prepatch`函数以及`update`函数 (都会触发 prepatch 函数, 两者不完全相同才会触发 update 函数)
    
*   第二阶段, 真正对比新旧`vnode`差异的地方
    
*   第三阶段, 触发`postpatch`函数更新节点
    

源码:

```
function patchVnode(oldVnode: VNode, vnode: VNode, insertedVnodeQueue: VNodeQueue) {    const hook = vnode.data?.hook    hook?.prepatch?.(oldVnode, vnode)    const elm = vnode.elm = oldVnode.elm!    const oldCh = oldVnode.children as VNode[]    const ch = vnode.children as VNode[]    if (oldVnode === vnode) return    if (vnode.data !== undefined) {        for (let i = 0; i < cbs.update.length; ++i) cbs.update[i](oldVnode, vnode)        vnode.data.hook?.update?.(oldVnode, vnode)    }    if (isUndef(vnode.text)) { // 新节点的text属性是undefined        if (isDef(oldCh) && isDef(ch)) { // 当新旧节点都存在子节点            if (oldCh !== ch) updateChildren(elm, oldCh, ch, insertedVnodeQueue) //并且他们的子节点不相同执行updateChildren函数,后续会重点说明(核心)        } else if (isDef(ch)) { // 只有新节点有子节点            // 当旧节点有text属性就会把''赋予给真实dom的text属性            if (isDef(oldVnode.text)) api.setTextContent(elm, '')             // 并且把新节点的所有子节点插入到真实dom中            addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue)        } else if (isDef(oldCh)) { // 清除真实dom的所有子节点            removeVnodes(elm, oldCh, 0, oldCh.length - 1)        } else if (isDef(oldVnode.text)) { // 把''赋予给真实dom的text属性            api.setTextContent(elm, '')        }    } else if (oldVnode.text !== vnode.text) { //若旧节点的text与新节点的text不相同        if (isDef(oldCh)) { // 若旧节点有子节点,就把所有的子节点删除            removeVnodes(elm, oldCh, 0, oldCh.length - 1)        }        api.setTextContent(elm, vnode.text!) // 把新节点的text赋予给真实dom    }    hook?.postpatch?.(oldVnode, vnode) // 更新视图}
```

看得可能有点蒙蔽, 下面再上一副思维导图:

![](https://mmbiz.qpic.cn/sz_mmbiz_png/po6IxVbAMcQAlaWibia3Sxw7MG2BPDwEO2zjsf5GW8Afs0ibqWg2CzHTjEpVGZzjwTHVKibLQP4ianV4ib8BhCibJVXXw/640?wx_fmt=png)

### 5.5. 题外话: diff 算法简介

「传统 diff 算法」

*   虚拟 DOM 中的 Diff 算法
    
*   `传统算法`查找两颗树每一个节点的差异
    
*   会运行 n1(dom1 的节点数)*n2(dom2 的节点数) 次方去对比, 找到差异的部分再去更新
    

![](https://mmbiz.qpic.cn/sz_mmbiz_png/po6IxVbAMcQAlaWibia3Sxw7MG2BPDwEO2JmQKtBfTsNKzLWEhKSp57d2IyicTWvvGaoPDuDpafbLibSlyIiaImx0dg/640?wx_fmt=png)

「snabbdom 的 diff 算法优化」

*   Snbbdom 根据 DOM 的特点对传统的 diff 算法做了`优化`
    
*   DOM 操作时候很少会跨级别操作节点
    
*   只比较`同级别`的节点
    

![](https://mmbiz.qpic.cn/sz_mmbiz_png/po6IxVbAMcQAlaWibia3Sxw7MG2BPDwEO2icy9FSpXKrUmR7RPGjQya6uec0SjET2FZ7lZQ02BH6lsJCaiahSQ5CGg/640?wx_fmt=png)![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/po6IxVbAMcQAlaWibia3Sxw7MG2BPDwEO2OOLXN333K4yFK5J3Mpq5VY1mdfkVDpZXK8hqdHSLvz1GPt8dPuIhqA/640?wx_fmt=jpeg) src=http___img.wxcha.com_file_202004_03_1ed2e19e4f.jpg&refer=http___img.wxcha.jpeg

下面我们就会介绍`updateChildren`函数怎么去对比子节点的`异同`, 也是`Diff算法`里面的一个核心以及难点;

### 5.6. updateChildren(核中核: 判断子节点的差异)

*   这个函数我分为三个部分,`部分1:声明变量`,`部分2:同级别节点比较`,`部分3:循环结束的收尾工作`(见下图);
    

![](https://mmbiz.qpic.cn/sz_mmbiz_png/po6IxVbAMcQAlaWibia3Sxw7MG2BPDwEO2KBtrsJicVBdYrv6TbibksbjicsQib4XE5YKcbXFnHIpHicicqrH9iacxXjdaA/640?wx_fmt=png)

*   `同级别节点比较`的`五种`情况:
    

1.  `oldStartVnode/newStartVnode`(旧开始节点 / 新开始节点) 相同
    
2.  `oldEndVnode/newEndVnode`(旧结束节点 / 新结束节点) 相同
    
3.  `oldStartVnode/newEndVnode`(旧开始节点 / 新结束节点) 相同
    
4.  `oldEndVnode/newStartVnode`(旧结束节点 / 新开始节点) 相同
    
5.  `特殊情况当1,2,3,4的情况都不符合`的时候就会执行, 在`oldVnodes`里面寻找跟`newStartVnode`一样的节点然后位移到`oldStartVnode`, 若没有找到在就`oldStartVnode`创建一个
    

*   执行过程是一个循环, 在每次循环里, 只要执行了上述的情况的五种之一就会结束一次循环
    
*   `循环结束的收尾工作`: 直到 oldStartIdx>oldEndIdx || newStartIdx>newEndIdx(代表旧节点或者新节点已经遍历完)
    

为了更加直观的了解, 我们再来看看`同级别节点比较`的`五种`情况的实现细节:

#### 5.6.1 新开始节点和旧开始节点 (情况 1)

![](https://mmbiz.qpic.cn/sz_mmbiz_png/po6IxVbAMcQAlaWibia3Sxw7MG2BPDwEO2QKicQD97ibNeO3FnFmH0rykcEkraCKe3B3dmowSfYdW2hlEPsDibyYxqg/640?wx_fmt=png)

*   若`情况1符合:(从新旧节点的开始节点开始对比`,`oldCh[oldStartIdx]和newCh[newStartIdx]`进行`sameVnode(key和sel相同)`判断是否相同节点)
    
*   则执行`patchVnode`找出两者之间的差异, 更新图; 如没有差异则什么都不操作, 结束一次循环
    
*   `oldStartIdx++/newStartIdx++`
    

#### 5.6.2 新结束节点和旧结束节点 (情况 2)

![](https://mmbiz.qpic.cn/sz_mmbiz_png/po6IxVbAMcQAlaWibia3Sxw7MG2BPDwEO2iah8JqFGRWjHDOmWe4LOxYrRT0CJ5n1Jp7z9W5PeGOJsXt7cSl08aEg/640?wx_fmt=png)

*   若`情况1不符合`就判断`情况2`, 若符合:(从新旧节点的结束节点开始对比,`oldCh[oldEndIdx]和newCh[newEndIdx]`对比, 执行`sameVnode(key和sel相同)`判断是否相同节点)
    
*   执行`patchVnode`找出两者之间的差异, 更新视图,; 如没有差异则什么都不操作, 结束一次循环
    
*   `oldEndIdx--/newEndIdx--`
    

#### 5.6.3 旧开始节点 / 新结束节点 (情况 3)

![](https://mmbiz.qpic.cn/sz_mmbiz_png/po6IxVbAMcQAlaWibia3Sxw7MG2BPDwEO2ia7ciaeibhZZgSRJuXf7icsWsVzT5DQFlYiblYkYufWrNg0QxEHkqc6AwZA/640?wx_fmt=png)

*   若`情况1,2`都不符合, 就会尝试情况 3:(旧节点的开始节点与新节点的结束节点开始对比,`oldCh[oldStartIdx]和newCh[newEndIdx]`对比, 执行`sameVnode(key和sel相同)`判断是否相同节点)
    
*   执行`patchVnode`找出两者之间的差异, 更新视图, 如没有差异则什么都不操作, 结束一次循环
    
*   `oldCh[oldStartIdx]对应的真实dom`位移到`oldCh[oldEndIdx]对应的真实dom`后
    
*   `oldStartIdx++/newEndIdx--`;
    

#### 5.6.4 旧结束节点 / 新开始节点 (情况 4)

![](https://mmbiz.qpic.cn/sz_mmbiz_png/po6IxVbAMcQAlaWibia3Sxw7MG2BPDwEO2MSerlzjqFWjyvUHyatN1mevFmltAPsC0lmsnFFo84pW7s2hIRRSWGA/640?wx_fmt=png)

*   若`情况1,2,3`都不符合, 就会尝试情况 4:(旧节点的结束节点与新节点的开始节点开始对比,`oldCh[oldEndIdx]和newCh[newStartIdx]`对比, 执行`sameVnode(key和sel相同)`判断是否相同节点)
    
*   执行`patchVnode`找出两者之间的差异, 更新视图, 如没有差异则什么都不操作, 结束一次循环
    
*   `oldCh[oldEndIdx]对应的真实dom`位移到`oldCh[oldStartIdx]对应的真实dom`前
    
*   `oldEndIdx--/newStartIdx++`;
    

#### 5.6.5 新开始节点 / 旧节点数组中寻找节点 (情况 5)

![](https://mmbiz.qpic.cn/sz_mmbiz_png/po6IxVbAMcQAlaWibia3Sxw7MG2BPDwEO23XIOtTHFwus52hJGwExUcktj7qCibJFibxOoMhZP5nv6VW3X6jYtIHuA/640?wx_fmt=png)

*   从旧节点里面寻找, 若寻找到与`newCh[newStartIdx]`相同的节点 (且叫`对应节点[1]`), 执行`patchVnode`找出两者之间的差异, 更新视图, 如没有差异则什么都不操作, 结束一次循环
    
*   `对应节点[1]对应的真实dom`位移到`oldCh[oldStartIdx]对应的真实dom`前
    

![](https://mmbiz.qpic.cn/sz_mmbiz_png/po6IxVbAMcQAlaWibia3Sxw7MG2BPDwEO2dOnybB0J6HxMyCsWU7FPPWjnFvKTCWpiasExuCgtrl5u5lIfsDN2iarQ/640?wx_fmt=png)

*   `若没有寻找到相同的节点`, 则创建一个与`newCh[newStartIdx]`节点对应的`真实dom`插入到`oldCh[oldStartIdx]对应的真实dom`前
    
*   `newStartIdx++`
    

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/po6IxVbAMcQAlaWibia3Sxw7MG2BPDwEO2oqBLm03eaDZ0G4zytT0w7GMkribAWy7icQfGRJf8avcqDoSKEX9YsYibw/640?wx_fmt=jpeg)379426071b8130075b11ba142f9468e2.jpeg

下面我们再介绍一下`结束循环`的收尾工作`(oldStartIdx>oldEndIdx || newStartIdx>newEndIdx)`:

![](https://mmbiz.qpic.cn/sz_mmbiz_png/po6IxVbAMcQAlaWibia3Sxw7MG2BPDwEO2Vg6ic1KichGW1T8Bpj3ay2PThNbRBboSH4pNv185VicVWWURn5hHNfVicQ/640?wx_fmt=png)

*   `新节点的所有子节点`先遍历完 (`newStartIdx>newEndIdx`), 循环结束
    
*   `新节点的所有子节点`遍历结束就是把没有对应相同节点的`子节点`删除
    

![](https://mmbiz.qpic.cn/sz_mmbiz_png/po6IxVbAMcQAlaWibia3Sxw7MG2BPDwEO2iaGAxOR3U2L6sHgpGaicBLMzTTk90clRkqmbmzkibaudEwDjJT7xuoxiaQ/640?wx_fmt=png)

*   `旧节点的所有子节点`先遍历完 (`oldStartIdx>oldEndIdx`), 循环结束
    
*   `旧节点的所有子节点`遍历结束就是在多出来的`子节点`插入到`旧节点结束节点`前;(源码:`newCh[newEndIdx + 1].elm)`, 就是对应的`旧结束节点的真实dom`,newEndIdx+1 是因为在匹配到相同的节点需要 - 1, 所以需要加回来就是结束节点
    

最后附上源码:

```
function updateChildren(parentElm, oldCh, newCh, insertedVnodeQueue) {    let oldStartIdx = 0;                // 旧节点开始节点索引    let newStartIdx = 0;                // 新节点开始节点索引    let oldEndIdx = oldCh.length - 1;   // 旧节点结束节点索引    let oldStartVnode = oldCh[0];       // 旧节点开始节点    let oldEndVnode = oldCh[oldEndIdx]; // 旧节点结束节点    let newEndIdx = newCh.length - 1;   // 新节点结束节点索引    let newStartVnode = newCh[0];       // 新节点开始节点    let newEndVnode = newCh[newEndIdx]; // 新节点结束节点    let oldKeyToIdx;                    // 节点移动相关    let idxInOld;                       // 节点移动相关    let elmToMove;                      // 节点移动相关    let before;    // 同级别节点比较    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {        if (oldStartVnode == null) {            oldStartVnode = oldCh[++oldStartIdx]; // Vnode might have been moved left        }        else if (oldEndVnode == null) {            oldEndVnode = oldCh[--oldEndIdx];        }        else if (newStartVnode == null) {            newStartVnode = newCh[++newStartIdx];        }        else if (newEndVnode == null) {            newEndVnode = newCh[--newEndIdx];        }        else if (sameVnode(oldStartVnode, newStartVnode)) { // 判断情况1            patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue);            oldStartVnode = oldCh[++oldStartIdx];            newStartVnode = newCh[++newStartIdx];        }        else if (sameVnode(oldEndVnode, newEndVnode)) {   // 情况2            patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue);            oldEndVnode = oldCh[--oldEndIdx];            newEndVnode = newCh[--newEndIdx];        }        else if (sameVnode(oldStartVnode, newEndVnode)) { // Vnode moved right情况3            patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue);            api.insertBefore(parentElm, oldStartVnode.elm, api.nextSibling(oldEndVnode.elm));            oldStartVnode = oldCh[++oldStartIdx];            newEndVnode = newCh[--newEndIdx];        }        else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left情况4            patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue);            api.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);            oldEndVnode = oldCh[--oldEndIdx];            newStartVnode = newCh[++newStartIdx];        }        else {                                             // 情况5            if (oldKeyToIdx === undefined) {                oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);            }            idxInOld = oldKeyToIdx[newStartVnode.key];            if (isUndef(idxInOld)) { // New element        // 创建新的节点在旧节点的新节点前                api.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm);            }            else {                elmToMove = oldCh[idxInOld];                if (elmToMove.sel !== newStartVnode.sel) { // 创建新的节点在旧节点的新节点前                    api.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm);                }                else {                                                           // 在旧节点数组中找到相同的节点就对比差异更新视图,然后移动位置                    patchVnode(elmToMove, newStartVnode, insertedVnodeQueue);                    oldCh[idxInOld] = undefined;                    api.insertBefore(parentElm, elmToMove.elm, oldStartVnode.elm);                }            }            newStartVnode = newCh[++newStartIdx];        }    }    // 循环结束的收尾工作    if (oldStartIdx <= oldEndIdx || newStartIdx <= newEndIdx) {        if (oldStartIdx > oldEndIdx) {            // newCh[newEndIdx + 1].elm就是旧节点数组中的结束节点对应的dom元素            // newEndIdx+1是因为在之前成功匹配了newEndIdx需要-1            // newCh[newEndIdx + 1].elm,因为已经匹配过有相同的节点了,它就是等于旧节点数组中的结束节点对应的dom元素(oldCh[oldEndIdx + 1].elm)            before = newCh[newEndIdx + 1] == null ? null : newCh[newEndIdx + 1].elm;            // 把新节点数组中多出来的节点插入到before前            addVnodes(parentElm, before, newCh, newStartIdx, newEndIdx, insertedVnodeQueue);        }        else {            // 这里就是把没有匹配到相同节点的节点删除掉            removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);        }    }}
```

#### 5.6.6 key 的作用

*   Diff 操作可以`更加快速`;
    
*   Diff 操作可以更加准确;`(避免渲染错误)`
    
*   `不推荐使用索引`作为 key
    

以下我们看看这些作用的实例:

##### 5.6.6 Diff 操作可以更加准确;`(避免渲染错误)`:

实例: a,b,c 三个 dom 元素中的 b,c 间插入一个 z 元素

没有设置 key  
![](https://mmbiz.qpic.cn/sz_mmbiz_png/po6IxVbAMcQAlaWibia3Sxw7MG2BPDwEO2Ua9xL1PMLMfYfaoLQqjg2YgKUaXlA6BZDphxsWMDLQAAw15xmR408Q/640?wx_fmt=png)  
当设置了 key:

![](https://mmbiz.qpic.cn/sz_mmbiz_png/po6IxVbAMcQAlaWibia3Sxw7MG2BPDwEO2UOwIMrxib7BWe3OdLmT2tw2bBnKpQQeW4I5OktnmoZBhsYibW1RTaibFQ/640?wx_fmt=png)

##### 5.6.6 Diff 操作可以更加准确;`(避免渲染错误)`

实例: a,b,c 三个 dom 元素, 修改了 a 元素的某个属性再去在 a 元素前新增一个 z 元素

没有设置 key:

![](https://mmbiz.qpic.cn/sz_mmbiz_png/po6IxVbAMcQAlaWibia3Sxw7MG2BPDwEO267Lhv5lVRYZF26eUK9ibCB31AMZiavibTcXYXUBoC1QuSzqWmBa5ibu3DQ/640?wx_fmt=png)![](https://mmbiz.qpic.cn/sz_mmbiz_png/po6IxVbAMcQAlaWibia3Sxw7MG2BPDwEO2FNC8THXwlSBNtHRg50ckDNXCSmWoqSbias3dlkmibIfob9QDI5WGcG3A/640?wx_fmt=png)

因为没有设置 key, 默认都是 undefined, 所以节点都是相同的, 更新了 text 的内容但还是沿用了之前的 dom, 所以实际上`a->z(a原本打勾的状态保留了,只改变了text),b->a,c->b,d->c`, 遍历完毕发现还要增加一个 dom, 在最后新增一个 text 为 d 的 dom 元素

设置了 key:

![](https://mmbiz.qpic.cn/sz_mmbiz_png/po6IxVbAMcQAlaWibia3Sxw7MG2BPDwEO21CxIZvpMy4ianbNFNLpSm6RGyX0CmibbjuOTHicH3LP3g24VTdsC92evg/640?wx_fmt=png)![](https://mmbiz.qpic.cn/sz_mmbiz_png/po6IxVbAMcQAlaWibia3Sxw7MG2BPDwEO2K6AYVU2UAmdWZ58kCQbr2z1OwbE9UqHfmpcTice7EtzsVmKDTlbmVZQ/640?wx_fmt=png)

当设置了 key,a,b,c,d 都有对应的 key,`a->a,b->b,c->c,d->d`, 内容相同无需更新, 遍历结束, 新增一个 text 为 z 的 dom 元素

##### 5.6.6 `不推荐使用索引`作为 key:

设置索引为 key:

![](https://mmbiz.qpic.cn/sz_mmbiz_png/po6IxVbAMcQAlaWibia3Sxw7MG2BPDwEO2FQHVq89wJ0yOJYTicUjCCiasp5s3oxkrhSQQ7fDd7icW04MIXGwPPOv2g/640?wx_fmt=png)

这明显效率不高, 我们只希望找出不同的节点更新, 而使用索引作为 key 会增加运算时间, 我们可以把 key 设置为与节点 text 为一致就可以解决这个问题:

![](https://mmbiz.qpic.cn/sz_mmbiz_png/po6IxVbAMcQAlaWibia3Sxw7MG2BPDwEO20yPciaqHiaqS959DfkdthWxvKg0MrrgqZyttdICkJah7rpa8PclyUabA/640?wx_fmt=png)

6. 关注我
------

![](https://mmbiz.qpic.cn/mmbiz_gif/usyTZ86MDicgqjLq0USF6icibfWiaLSV8bz17cBjvXylU7dz9mIMP7lUF50OE2gFrlZDQlIyWvGcUiaprq92fq8tgXg/640?wx_fmt=gif)

[1. JavaScript 重温系列（22 篇全）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453187&idx=1&sn=a69b4d7d991867a07a933f86e66b9f55&chksm=b1c224ea86b5adfc10c3aa1841be3879b9360d671e98cc73391c2490246f1348857b9821d32c&scene=21#wechat_redirect)  

[2. ECMAScript 重温系列（10 篇全）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453193&idx=1&sn=e5392cb77bc17c9e94b6c826b5f52a83&chksm=b1c224e086b5adf6dad41a0d36b77a9bfb4bc9f0d29a816266b3e28c892e54274967dbce380b&scene=21#wechat_redirect)  

[3. JavaScript 设计模式 重温系列（9 篇全）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453194&idx=1&sn=e7f0734b04484bee5e10a85a7cbb85c1&chksm=b1c224e386b5adf554ab928cdeaf7ee16dbb2d895be17f2a12a59054a75b913470ca7649bbc7&scene=21#wechat_redirect)

4. [正则 / 框架 / 算法等 重温系列（16 篇全）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453195&idx=1&sn=1e0c8b7ea8ddc207b523ec0a636a5254&chksm=b1c224e286b5adf432850f82db18cc8647d639836798cf16b478d9a6f7c81df87c6da5257684&scene=21#wechat_redirect)

5. [Webpack4 入门（上）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453302&idx=1&sn=904e40a421024ea0d394e9850b674012&chksm=b1c2251f86b5ac09dbbbb7c8e1d80c6cbd793a523cdfa690f8734def57812e616b9906aeec79&scene=21#wechat_redirect)|| [Webpack4 入门（下）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453303&idx=1&sn=422f2b5e22c3b0e91a8353ee7e53fed9&chksm=b1c2251e86b5ac08464872cd880811423e0d1bbcebbe11dcac9d99fa38c5332c089c06d65d95&scene=21#wechat_redirect)

6. [MobX 入门（上）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453605&idx=1&sn=0a506769d5eeb7953f676e93fb4d18eb&chksm=b1c2264c86b5af5aa7300a04d55efead6223e310d68e10222cd3577a25c783d3429f00767960&scene=21#wechat_redirect) ||  [MobX 入门（下）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453609&idx=1&sn=f0c22e82f2537204d9b173161bae6b82&chksm=b1c2264086b5af5611524eedb0d409afe86d859dce6ceff1c17ddab49d353c385e45611a73fa&scene=21#wechat_redirect)

7. 120[+ 篇原创系列汇总](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453236&idx=2&sn=daf00392f960c115463c5aaf980620b4&chksm=b1c224dd86b5adcbd98189315e60de6a0106993690b69927cc1c1f19fd8f591fefce4e3db51f&scene=21#wechat_redirect)

![](https://mmbiz.qpic.cn/mmbiz_gif/dy9CXeZLlCV6wPNEuicaKGdia24OVNBZxUyfVhbEBnxdxfwKuJwLovlZicn7ccq5GbhNFwtk6libKiaxTLO4v2C5LRQ/640?wx_fmt=gif)

回复 “**加群**” 与大佬们一起交流学习~

点击 “**阅读原文**” 查看 120+ 篇原创文章