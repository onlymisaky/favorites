> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/EA3qpsj_BsAiVCGweGpKiw)

前言
--

提到 React 状态管理，我最初是接触的 Context，就是用 useContext 和 useReducer 去做状态管理，写多了发现还是挺麻烦的，还会出现 “Provider 嵌套地狱” 的问题，对于不同的 state 也不好组合计算。后面了解到 Redux，固有的模式使得用户需要编写很多重复和复杂的代码，甚至开发者也说了 “Try MobX”。对于 MobX，和前者的的函数式编程不同，它采用的是面向对象式的对状态进行管理，我本身并不是很习惯面向对象，这些状态管理库的心智负担，都太大了些。

现在我要推荐今天的主角——Valtio，这是我见过的使我的心智负担最低、需要编写的代码量最少的状态管理库，我本身也写 Vue3，我使用 Valtio 的感受就相当于，用了很久的 VueX，然后遇到了 Pinia！

Valtio 的优点：

1.  概念简单，就是一个 proxy
    
2.  文档友好，各种应用场景都有举例
    
3.  使用方式和 API 简单，易于上手和使用，几乎没有什么心智负担...
    
4.  有 `devtools` api，完美支持 Debug
    
5.  当然，完全支持 TypeScript
    

使用体验下来，简直就是 React 版本的 Pinia 😍

下面，我将类比 Pinia，来讲讲如何使用 Valtio 和管理应用状态。

基本使用
----

首先使用 Vite 创建一个 React + TS 项目，这个不用讲了。不需要注册，不需要引入一个 Provider 或者 Root 什么根组件来包裹 App 组件，直接新建一个 store 文件夹，然后创建 modules 和 index.ts，如下所示：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHq4WoQjscVPTibxk17KwsBSSUOPamwO3DUuxMPe8GuD3PxMwch5qt09U0EBHPuNibXF7I1QdGmMT5RQ/640?wx_fmt=png&from=appmsg)

*   store：整个应用的状态管理
    

*   modules：存放各个 store，proxy 是自由的，没有约束单一状态源
    
*   index.ts：导出 modules 中的各个 store
    

```
// index.ts export * from './modules/counter'
```

```
// counter.ts import { proxy } from 'valtio' export const counterStore = proxy({ // state count: 0, // action increase: () => { counterStore.count++ }, // action decrease: () => { counterStore.count-- } })
```

上面的 `count` 就相当于一个 state，`increase` 和 `decrease` 就是 actions，负责对状态进行修改。使用起来也相当简单：

```
// components/CompA.index.tsx import { counterStore } from '~/store' import { useSnapshot } from 'valtio' export function CompA() { const { count, increase } = useSnapshot(counterStore) return ( <div> CompA <div>count: {count}</div> <button onClick={increase}>+</button> </div> ) }
```

这里使用了 `useSnapshot` api，是为了保持 `count` state 的响应式，这样 Valtio 就会自动追踪更新，然后触发组件的 re-render，当然，这是可选的。

如果你要避免组件的 re-render：

```
const { count } = counterStore
```

如果你仅仅需要 actions 来更新状态：

```
const { increase } = counterStore
```

actions 的更多写法
-------------

上面的示例中，我使用了合并 state 和 acions 的写法，Valtio 还支持更多写法，任君挑选。

1.  单独分开写法
    
    ```
    export const state = proxy({ count: 0, }) export const increase = () => { ++state.count } export const decrease = () => { --state.count }
    ```
    
2.  方法合并式写法
    
    ```
    export const state = proxy({ count: 0, }) export const actions = { increase: () => { ++state.count }, decrease: () => { --state.count }, }
    ```
    
3.  this 写法
    
    ```
    export const state = proxy({ count: 0, increase() { ++this.count }, decrease() { --this.count }, })
    ```
    
4.  class 写法
    
    ```
    class State { count = 0 increase() { ++this.count } decrease() { --this.count } } export const state = proxy(new State())
    ```
    

计算属性
----

在 Pinia 中，我们可以直接使用 `computed` 来基于一个 state 进行计算，结果依然是响应式的。在 Valtio 中，没有直接提供这类 api，但是我们可以使用 `subscribeKey` 和 `subscribe` 来订阅某个状态的更新，从而即时的计算属性。

```
import { proxy } from 'valtio' import { subscribeKey } from 'valtio/utils' const initialState = { count: 0 } export const counterStore = proxy({ count: initialState.count, // computed，需要手动订阅更新 double: initialState.count * 2, update: (value: number) => { counterStore.count = value } }) // 订阅更新 subscribeKey(counterStore, 'count', () => { counterStore.double = counterStore.count * 2 })
```

其中，`subscribeKey` 用于 primitive state（原始值类型），`subscribe` 用于引用类型（这里一般指 plain object）。

当然，你也可以不指定订阅某个状态，而直接使用 `watch` api，Valtio 会自动追踪依赖值。

```
watch((get) => { get(counterStore) counterStore.double = counterStore.count * 2 })
```

状态组合
----

需求：在一个 store 中来使用另一个 store。

在 Valtio 中，状态组合也非常简单，直接引入使用即可，如果是在不同文件中的 store，则需要进行订阅更新。

我们新建一个 hello.ts：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHq4WoQjscVPTibxk17KwsBSSoJrLCsdBcN6ibSZCuibGZibRbRdS13274ic7ic1hTuWKmBVzvtCOhLlTFxw/640?wx_fmt=png&from=appmsg)

```
// hello.ts import { counterStore } from './counter' import { watch } from 'valtio/utils' import { proxy } from 'valtio' const initGreet = 'hello counter' export const helloStore = proxy({ greets: Array.from({ length: counterStore.count }, () => initGreet), add: (value: string) => { helloStore.greets.push(value) } }) // 监听 counterStore 的更新 watch((get) => { get(counterStore) helloStore.greets = Array.from({ length: counterStore.count }, () => initGreet) })
```

功能：上面代码中，每次 count 更新的时候，greets 都会更新，计算关系为 greets 数组长度等于 count，每个元素都是 `'hello counter'`。

```
greets.length === count
```

数据持久化
-----

得益于 Valtio 的自由和简洁，你完全可以使用现有的 api 做到这点，基本思路是订阅某个你需要持久化的 state，然后检测到更新到时候，即时的存一下 Storage 即可，每次获取的时候就从 Storage 中获取。（仅需要两行代码）

> Storage 可以是 localStorage 和 sessionStorage

示例代码：

```
import { proxy } from 'valtio' import { subscribeKey } from 'valtio/utils' const initialState = { count: 0 } export const counterStore = proxy({ // 取值的时候，本地存储有就从本地获取 count: Number(localStorage.getItem('count') ?? initialState.count), double: initialState.count * 2, update: (value: number) => { counterStore.count = value } }) subscribeKey(counterStore, 'count', () => { // 更新的时候，订阅更新一下本地存储 localStorage.setItem('count', counterStore.count.toString()) }) // 模拟计算属性 watch((get) => { get(counterStore) counterStore.double = counterStore.count * 2 })
```

历史记录
----

历史记录？没错，Valtio 还支持状态的回退和前进，因为 Valtio 保存了状态的每一个 snapshot（状态快照），我们可以使用 `proxyWithHistory` 来创建一个可保存历史状态记录的 proxy，该方法创建的 proxy 暴露了 `undo` 和 `redo` 方法能让我们对状态进行回退和复现，相当于 ctrl z 和 ctrl y。

```
import { proxyWithHistory } from 'valtio/utils' export const counerStore = proxyWithHistory({ count: 0, increase: () => { counerStore.value.count++ }, decrease: () => { counerStore.value.count-- } })
```

使用的时候主要这里需要使用 `.value` 来获取 state 和 actions。

```
// CompC/index.tsx import { useSnapshot } from 'valtio' import { counerStore } from '~/store/modules/counter2' export function CompC() { const counter = useSnapshot(counerStore) const { count, increase } = counter.value return ( <> <div>{count}</div> <button onClick={increase}>+</button> <br /> <button onClick={counter.undo}>undo</button> <button onClick={counter.redo}>redo</button> </> ) }
```

devtools debug
--------------

我们知道，pinia 支持使用 vue devtools 进行状态的追踪和 debug，那么我们的 Valtio 也支持 redux devtools。

下载好 redux devtools 插件后，在代码之加入下面这一行代码，即可轻松开启 debug：

```
devtools(counterStore, { name: 'state name', enabled: true })
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHq4WoQjscVPTibxk17KwsBSSmU11FbLjZ6EeIkQayHTBFAAoKvJYCPNMR06OFoicBpSss9BXq0ltDpw/640?wx_fmt=png&from=appmsg)

一切都是那么的自然，几乎没有什么学习的负担，文档友好，api 简单，仅 3.1 kb 的库，赶快使用它来提升你的开发效率吧！(●'◡'●)

更多请参考官方文档：Valtio, makes proxy-state simple for React and Vanilla[1]

### 参考资料

[1]

https://valtio.pmnd.rs/docs/introduction/getting-started: _https://link.juejin.cn/?target=https%3A%2F%2Fvaltio.pmnd.rs%2Fdocs%2Fintroduction%2Fgetting-started_

> 作者：MurphyChen
> 
> https://juejin.cn/post/7225934630506643513