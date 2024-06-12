> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/Dr-1giVL6sCC9o5SmjEr9Q)

```
大厂技术  高级前端  Node进阶

点击上方 程序员成长指北，关注公众号

回复1，加入高级Node交流群

```

前言  

探讨了不同的 React 状态管理组件，包括 Redux、Zustand、Jotai、Recoil、MobX 和 Valtio，并比较了它们在解决 props drilling 和 context 造成整个子树重新渲染的问题上的不同方法和原理实现。还简要介绍了 Flux 架构及其对 React 状态管理的影响。

关于本文作者：@Leo Chiu

原文：https://medium.com / 手寫筆記 / a-comparison-of-react-state-management-libraries-ba61db07332b

#### React 状态管理

#### 状态管理

React 是一个单向数据流的 library，在随着组件越来越复杂之后，我们会选择用不同的方式管理状态，例如当两个同层级的 Child 组件需要共用状态时，首选的策略是 lifting state up，将原本在 Child 的状态移动到 Parent 管理，再从 Parent 向下传递到需要共用状态的 Child，这个是一个常见的情境。

再更复杂一点的时候，不同层级的组件或是多层级的组件需要共用状态，根据 lifting state up 的规则，状态被不断地被往上提之后，状态会在多层的组件之间传递，这便是 props drilling 的问题。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/meG6Vo0MevgBSNqMoKVFbvyic6SAoztEpyTmy4EeKia8FibgZu3xM0zUYQlQxBNrcXricZ4fKmQiaZRKPoibakhg8cJQ/640?wx_fmt=other&from=appmsg)

为了解决 props drilling 的问题，React 提供了 context 可以用来跨组件传递状态，基本上简单的情境用 context 已经绰绰有余，如果情境复杂一点，搭配 useReducer 也可以很方便的管理状态。

但是使用 context 会遇到一些常见的问题，像是 provider 传递的状态如果不使用 useMemo 跟 useCallback 封装，以及 Child 不使用 memo，在 provider 的组件 re-render 时，所有使用到 context 的地方都会被重新渲染。

另一个问题则是如果 provider 传递的状态越来越多时，经常会因为 provider 的其中一状态改变导致整颗子树都 re-render。要解决这个问题则是要把 Provider 的状态切分的更细，用不同的 Provider 分离状态。但如果分成多个 Provider，随着需要管理的状态越来越多，Provider 也会越来越多，介时也不好管理。

##### 要解决的问题

重新整理一下使用 React 原生的状态管理机制主要会遭遇以下几个问题，在这篇文章中会一直提及以下两个问题，讲到各个工具包怎么解决的：

*   props drilling 的问题
    
*   context 造成整颗子树渲染的问题
    

#### 第三方组件

React 的状态管理组件有非常多选择，从 mental model 来说可以分成三大类 Flux、Atomic、Proxy，而被实现出来的组件包括 Redux、MobX、Recoil、Zustand、 Jotai、Valtio 等等。

而我们从下载量来看目前是 Redux 跟 Zustand 的下载量最多，再来是 Mobx，而另外两个实现 atomic 机制的 Jotai 跟 Recoil 每周下载量大约是 50 万左右，最少人用的 Valtio 目前差不多是每周 30 万。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/meG6Vo0MevgBSNqMoKVFbvyic6SAoztEphTRFxE2XzejiajSLS5gQDcd63xiafP7UNibtlH5h8f08DAZT3qVgwnCvA/640?wx_fmt=other&from=appmsg)https://npmtrends.com/jotai-vs-mobx-vs-recoil-vs-redux-vs-valtio-vs-zustand

在今年年初的时候 signal 突然变成热门的关键字之一，以 React 的生态系来说有两个组件相继出现，分别是 @preact/signals 、 jotai-signal，但从下载量来看，目前使用这两个组件的人数极少，后续在文中会提到为什么比较少人使用的原因。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/meG6Vo0MevgBSNqMoKVFbvyic6SAoztEpq3BToFgh6FicUltobSLrzKiaoYyotVJRMRjbX1NmdymSUBeBlGxgtibng/640?wx_fmt=other&from=appmsg)https://npmtrends.com/ jotai-signal-vs-@preact/signals

#### Flux

##### MVC 架构遇到的问题

在 2014 年以前，Facebook 大量使用了 MVC 架构在 Web 上，然而 MVC 架构让整个数据流变得相当复杂，而且让应用程序变得难以扩展（scale），且新的工程师加入之后会难以上手，因此很难在短时间内就有很高效的产出。

以下是当初 Facebook 在 2014 年在发布 Flux 跟 React 的演讲时用的一张图，这张原意应该是要表明数据流的问题，但是后来许多人都在 reddit 上都诽谤这张图，说 Facebook 的开发人员并不是很了解 MVC 架构，在 MVC 架构中 View 跟 Model 是不会双向沟通的。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/meG6Vo0MevgBSNqMoKVFbvyic6SAoztEpt5unG3agI2oYNNQMzRAEBdTnP8GvdO5yuBEviabnJ8kxrqt6Zxpg4Jg/640?wx_fmt=other&from=appmsg)https://www.youtube.com/watch?v=nYkdrAPrdcw&t=1454s&ab_channel=MetaDevelopers

但演讲的上下文有提到 Facebook 遇到的问题是在一个页面中的许多区块（View）会依赖多个（Model），所以我觉得可以理解成他们想解决的问题是让画面的数据可以更好得被管理。

此外，在那个时候他们用的框架是 imperative programming，所以很容易造成 cascading update 的问题，会让一个 function 需要管理状态，又需要管理 UI，所以为了解决上述的问题，最后就有了 Flux 跟 React 的出现。

> 虽然这张图还是有点问题，但大家可以超译一下，想象一下 Facebook 的工程师想讲什么 😅

下面这张图是 2014 年左右时 Facebook 的聊天区，可以想象聊天的数据、是否已读的数据散落在四个地方，为了同步四个地方的数据以及画面的一致性，imperative programming 会让代码变得难以阅读。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/meG6Vo0MevgBSNqMoKVFbvyic6SAoztEpLQJXUFWfLOiau2t8mSzBkqNKP40EZ8qMIvFjCsUIRoMACgLXibwlicwDg/640?wx_fmt=other&from=appmsg)https://www.youtube.com/watch?v=nYkdrAPrdcw&t=1454s&ab_channel=MetaDevelopers

因此，Facebook 提出了 Flux 这个概念，它是一个单向数据流的架构，主要组成有 dispatcher、store、action、view 四个部分。view 实际上就是 React 本身，在有事件发生时会发出 action，然后由 dispatcher 派发更新 store 中储存的状态，最后 React 会使用 store 中的这些状态改变 view。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/meG6Vo0MevgBSNqMoKVFbvyic6SAoztEpFx2lGfSakiaseOT9vnAeUJfvDlx2YTOVicPBDxWYI7Jaj6OPtlZjulBQ/640?wx_fmt=other&from=appmsg)https://github.com/facebookarchive/flux

Flux 对比于 MVC 的前端架构有以下几个优点：

*   改善数据的一致性
    
*   更容易找出哪里有 bug
    
*   写出更好的 unit tests
    

以上的是优点是在 Facebook 发表 React 跟 Flux 时提到的优点

这些优点在现今仍然存在，但是在随着 React 蓬勃发展这些优点仿佛已经变得理所当然，不论选择的是哪个套件或是在 React 都有这些优点。

Flux 在初期只是一个概念，后来在 2015 年的时候 Facebook 开源了 flux 这个套件，但最后还是由 Redux 成为现今最多人使用的套件，而 flux 开源专案也在 2023 年 3 月的时候被 archived 了，在 flux 的 repo 中也提到如果需要状态管理的套件，就去使用 Redux、MobX、Recoil、Zustand 或 Jotai 这几个套件。

现在最多人使用的状态管理套件是 Redux 跟 Zustand，在 2023 年 9 月的现在，Redux 每周有将近 900 万的下载次数，基本上只要想到状态管理就会想到 Redux。而 Zustand 目前每周也有 200 万的人数，在 2019 年发布之后，至今已经是第二多人使用的状态管理套件，比起老牌的 Mobx 其每周下载量多了将近一倍。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/meG6Vo0MevgBSNqMoKVFbvyic6SAoztEpKZ6YJqIyFfqXmVLSC42ntpvgTic8AIDBqQJ3yibRiaZQCD3j1vKa2KP2g/640?wx_fmt=other&from=appmsg)https://npmtrends.com/redux-vs-zustand

#### Redux

Redux 是在 2015 年由 Dan Abramov 开发的一个基于 Flux 架构的状态管理套件，目前是个每周将近有 900 万下载次数的套件，也是大部分的人在学习 React 时第一个会碰到的状态管理套件。

原生的 Redux 在设置与使用上比较琐碎，像是 action、reducer 等等的，甚至如果有 TypeScript 的话在类型设置上更为繁琐，如果有一处需要修改时往往会需要动到不少的地方。

而导入 Redux Toolkit 后可以减少创建 store、reducer 的 boilerplate code，并且让原本更新 Redux store 中的状态时需要以 immutable 的语法变成可以用 mutable 的方式撰写，所以现今使用 Redux 时通常都会同时导入 RTK。

```
import { createSlice, configureStore } from '@reduxjs/toolkit'

const counterSlice = createSlice({
  name: 'counter',
  initialState: {
    value: 0
  },
  reducers: {
    incremented: state => {
      state.value += 1
    },
    decremented: state => {
      state.value -= 1
    }
  }
})

export const { incremented, decremented } = counterSlice.actions

const store = configureStore({
  reducer: counterSlice.reducer
})

store.dispatch(incremented())
store.dispatch(decremented())


```

Redux 如何解决渲染的问题 现在 Redux 通常会跟 react-redux 一起使用，react-redux 提供了 useSelector 让我们可以从 redux store 选择我们需要的状态，并且 react-redux 会侦测选择的状态是否改变，并且触发重新渲染。

例如以下面这个例子来说，当 counter 改变了，但是 username 没有变，这时候 useSelector 知道 counter 前后的值不一样了，因此会触发渲染，这时候只有 ComponentA 会被渲染：

```
import { useSelector } from 'react-redux'

const ComponentA = () => {
  const counter = useSelector((state) => state.counter)
  return <div>{counter}</div>
} 

const ComponentB = () => {
  const username = useSelector((state) => state.username)
  return <div>{username}</div>
}


```

在 2021 年的之前 react-redux 还是使用 useReducer 建立强制渲染的 function ， useSelector 会先把 state.counter 的值储存起来，当从 redux store 取得的值改变时就会使用 forceRerender() 重新渲染该元件。

```
const [, forceRender] = useReducer((s) => s + 1, 0)


```

但在 React 18 的 hook 出来之后，react-redux 就使用了 useSyncExternalStoreWithSelector 作为侦测状态并重新渲染的解决方案。

```
import type { useSyncExternalStoreWithSelector } from 'use-sync-external-store/with-selector'


```

#### Zustand

Zustand（德语的状态）是由 Jotai 跟 Valtio 的作者 Daishi Kato 开发的一个基于 Flux 架构的状态管理套件，它比 Redux 使用起来更简单，而且写起来更简洁，不需要像是 Redux 用 context provider 将 store 传递下去，便可以让全域使用 Zustand 的状态。

在 Zustand 中只要使用 create() 就可以快速建立 store 跟 action ，不像是 Redux 在建立 store 时即使使用 RTK 也是要写不少的 boilerplate：

```
import { create } from 'zustand'

const useBearStore = create((set) => ({
  bears: 0,
  increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
  removeAllBears: () => set({ bears: 0 }),
}))


```

而要读取状态以及 dispatch action 也是很简单，直接使用 create() 建立的 hook 就可以将状态跟 action 从 store 中读取出来：

```
function BearCounter() {
  const bears = useBearStore((state) => state.bears)
  return <h1>{bears} around here ...</h1>
}

function Controls() {
  const increasePopulation = useBearStore((state) => state.increasePopulation)
  return <button onClick={increasePopulation}>one up</button>
}


```

而在 Redux 中甚至要先建立 dispatcher 的 instance，还要 import action 才能使用，Zustand 的其中一个特点就是 DX 比 Redux 更好。

##### Zustand 如何解决渲染的问题

Zustand 跟 react-redux 一样，都是透过判断 selector 的值是否改变了，并触发重新渲染。以下面这个例子来说， useBearStore 会侦测 state.bears 的值是否改变，当改变时会重新渲染该元件：

```
const bears = useBearStore((state) => state.bears)


```

在 2022 年 8 月之前，Zustand 使用了 useReducer 自己维护 forceUpdate() 的 function，但是后在 #550 之后使用了 useSyncExternalStoreWithSelector 取代作为触发渲染的 function。

目前看到这里发现 react-redux 跟 Zustand 都使用了 use-sync-external-store 这个套件，它是 React 18 的其中一个 hook，但也被分离出来变成独立的套件，尽管不用升级到 React 18 也可以透过安装套件使用这个 hook。

##### Zustand vs Redux

👉 Download trend

现今在社群推荐如果想要挑选基于 Flux 架构的状态管理套件，不妨可以直接选择 Zustand，虽然以目前的社群声量以及下载量 Redux 每周有 800 万的下载次数，但是也别忘记 Zustand 也已经到了每周 200 万。以开源项目可维护性已经社群大小，Zustand 不仅可以在小项目中使用，也可以用产品中。

👉 Developer experience

从以上快速开箱的范例就可以看到在使用 Zustand 比 Redux 简单许多，不需要撰写繁杂 boilerplate，使用上也很直观，基本上就是当作 custom hook 在使用。

#### Atomic

接下来要提及的是一个跟 Flux 很不一样的概念 — Atomic，也是 Recoil 跟 Jotai 的基本概念。在一开始 Recoil 介绍影片中想解决的问题有两个，

*   如果使用 context 或是 props 传递状态则会容易造成 re-render 的问题，这个问题也是本文一开始提到的其中一个问题；
    
*   另一个问题是使用 context 会让 code-splitting 无法切分的更细，因为整个 component tree 都使用了 context 或 props 的状态。
    

Atomic 的核心概念就是想让 React 的状态管理可以被分散在 component tree 中，这些状态就是 atom，而 atom 可以像是 context 取得状态，同时又可以让 code-splitting 将元件切分的更细。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/meG6Vo0MevgBSNqMoKVFbvyic6SAoztEpo6YthP5SIGdiaIAAwtUaNwaQQLKbqda5bBz9KnOIAydNI6h8nfzovRQ/640?wx_fmt=other&from=appmsg)https://youtu.be/_ISAA_Jt9kI?si=3fzywPPnwL-3sr_U

#### Recoil

Recoil 是由 Facebook 开发与维护的一个套件，在 2020 的时候被发布出来。Recoil 主要想解决的问题如上述，第一个是 context render 的问题，第二个是 code-splitting 的问题。

除此之外，大概是为了跟内部复杂的大型系统整合，Recoil 的 API 非常的丰富，可以用各种方式使用 Recoil。

在建立状态可以用 atom 跟 selector ， atom 即是一般的状态，如 React 的 state，但与 useState 不一样的地方是在建立 atom 时会在 component 外面；而 selector 是拿来建构 derived data，可以从另一个 atom 生成新的状态，如果有写过 Vue，也可以想像是 Vue 的 computed API。

```
const todoListState = atom({
  key: 'TodoList',
  default: [],
});

const filteredTodoListState = selector({
  key: 'FilteredTodoList',
  get: ({get}) => {
    const filter = get(todoListState);
    const list = get(todoListState);

    switch (filter) {
      case 'Show Completed':
        return list.filter((item) => item.isComplete);
      case 'Show Uncompleted':
        return list.filter((item) => !item.isComplete);
      default:
        return list;
    }
  },
});


```

以下是渲染 todo list 的示例，想要使用状态时可以使用 useRecoilValue 取得 atom 的值：

```
function TodoList() {
  const todoList = useRecoilValue(todoListState);

  return (
    <>
      {todoList.map((todoItem) => (
        <TodoItem key={todoItem.id} item={todoItem} />
      ))}
    </>
  );
}


```

如果想要设定 atom 的数值，则是可以使用 useSetRecoilState 这个 API，它会回传一个像是 setState 的 function，可以直接拿来设定 atom 的值：

```
function TodoItemCreator() {
  const [inputValue, setInputValue] = useState('');
  const setTodoList = useSetRecoilState(todoListState);

  const addItem = () => {
    setTodoList((oldTodoList) => [
      ...oldTodoList,
      {
        id: getId(),
        text: inputValue,
        isComplete: false,
      },
    ]);
    setInputValue('');
  };

  const onChange = ({target: {value}}) => {
    setInputValue(value);
  };

  return (
    <div>
      <input type="text" value={inputValue} onChange={onChange} />
      <button onClick={addItem}>Add</button>
    </div>
  );
}


```

如前面所说，Recoil 提供的 API 非常丰富，还提供了 useRecoilState 、 useRecoilStateLoadable 等等，如果有兴趣的读者在去官方文件上面看看吧！

##### Recoil 如何解决渲染的问题

Recoil 解决渲染的方式基本上与 Redux、Zustand 有些相似，Redux 跟 Zustand 都使用了 selector 的机制判断选取的值时否改变来触发渲染。换言之，Recoil 会判断 atom 的值是否改变来触发元件渲染，例如使用 useRecoilValue 时会判断 todoListState 是否改变了，进而触发渲染：

```
const todoList = useRecoilValue(todoListState);


```

但是 Recoil 的实施方式有点复杂，它被开发出来就是为了在复杂且庞大的系统中使用，所以判断是否要渲染的方式有很多种，粗略切分可以分为三种，分别为：

*   TRANSITION_SUPPORT
    
*   SYNC_EXTERNAL_STORE
    
*   LEGACY
    

第一种 TRANSITION_SUPPORT 模式则是需要通过设置 RecoilEnv 来达到，在这种模式下，Recoil 会使用内部自己建立的 subscribeToRecoilValue 来判断 atom 是否改变了，如果改变则用 useState 建立的 forceUpdate 来触发渲染：

```
RecoilEnv.RECOIL_GKS_ENABLED.add('recoil_transition_support');


```

subscribeToRecoilValue 的设计跟 useSyncExternalStore 很像，基本上就是会判断传进去的状态是否改变了，如果改变的时候就触发 callback。如果有兴趣内部实施的读者再自己去看原始码吧！

第二种 SYNC_EXTERNAL_STORE 模式则是会看 React 有没有 useSyncExternalStore 可以使用，如果没有会 fallback 到第一种 TRANSITION_SUPPORT 的模式。

```
SYNC_EXTERNAL_STORE: currentRendererSupportsUseSyncExternalStore()
  ? useRecoilValueLoadable_SYNC_EXTERNAL_STORE
  : useRecoilValueLoadable_TRANSITION_SUPPORT


```

第三种 LEGACY 则是会使用前面说的类似 useSyncExternalStore 的 subscribeToRecoilValue 来判断 atom 是否改变，如果改变则触发渲染。

#### Jotai

Jotai（日文的状态）是由 Zustand 跟 Valtio 的作者 Daishi Kato 在 2020 年发布的基于 Atomic 的套件，它的 API 启发于 Recoil，但使用起来比 Recoil 更简单。

在 Jotai 中 atom 是用来建立 atom 状态的设定档，并不是像 React.useState 回传可读取的状态，实际上的状态是被存在于 store 中，需要透过 useAtom 才能读写状态。

而 atom 跟 useState 一样都是传入初始化的状态，同时 atom 也可以被传入到另一个 atom 中使用，相较于 Recoil 如果要产生 derived data，则是要使用 selector 这个 API，但在 Jotai 中统一都是使用 atom：

```
import { atom } from 'jotai'

const countAtom = atom(0)
const countryAtom = atom('Japan')
const citiesAtom = atom(['Tokyo', 'Kyoto', 'Osaka'])
const mangaAtom = atom({ 'Dragon Ball': 1984, 'One Piece': 1997, Naruto: 1999 })
const isJapanAtom = atom((get) => get(countryAtom) === 'Japan')


```

useAtom 跟 useState 的使用方式很类似，都是回传一个 tuple，第一个值用来读取状态，第二个值用来设定状态：

```
import { useAtom } from 'jotai'

function Counter() {
  const [count, setCount] = useAtom(countAtom)
  return (
    <h1>
      {count}
      <button onClick={() => setCount((c) => c + 1)}>one up</button>
      ...


```

##### Jotai 如何解决渲染的问题

看到这里，Jotai 与 Redux、Zustand、Recoil 解决渲染问题的方式都很相，在用 useAtom 的时候 Jotai 会自动判断 atom 的值是否改变了，当改变时才会重新渲染该元件。

```
const [count, setCount] = useAtom(countAtom)


```

然而，既然与 Redux、Zustand、Recoil 的机制类似，那是不是内部实现都使用 useSyncExternalStore，但是实际上不是这样。

Jotai 为了解决 time slicing 的问题，使用了 useReducer 来处理 re-render 的问题。而像是 Zustand 使用了 useSyncExternalStore ，在搭配 useTransition 就会发生非预期的问题，比如作者提供的一个范例 https://codesandbox.io/s/9ss9r6，在这个范例中预期应该要显示「Pending…」，而不是 Suspense 的「Loading…」。

如果想要知道后多的细节可以参考作者发的这篇文章 Why useSyncExternalStore Is Not Used in Jotai，或是可以 follow 这个 discussion#2137。

##### Recoil vs Jotai

Jotai 的官方文件中也有讨论一直开着，有些人帮忙整理了两者的不同，例如：

*   Jotai 的源代码更加简单
    
*   Jotai 有更少的 boilerplate code，不需要像 Recoil
    
*   建立 atom 时要使用 key Recoil 的 bundle size 比 Jotai 多了 10 倍
    
*   在 DX 上 Jotai 更加直观
    

基本上以目前的趋势来看， Jotai 的未来是优于 Recoil 的。过了几年 Recoil 还放在 facebookexperimental 这个 GitHub repo，如果要选择 Recoil 的话需要谨慎思考一下。

#### Proxy-based

以 proxy-based 实作的套件，较多人使用的套件有 Mobx 跟 Valtio，Mobx 已经行之有年，从 2015 年就已经问世，到现在仍然是许多开发者的选择，每周还有 100 万的下载量。而 Valtio 作为新起之秀，从 2020 年开始经过了三年，到目前为止每周大概有 30 万的下载量，从趋势看起来未来会越来越多人使用 Valtio。

##### 使用 Valtio 的 proxy-state

Valtio 是由 Zustand 跟 Jotai 的作者 Daishi Kato 开发的一个 proxy-state 状态管理工具，它使用起来非常容易上手，官方文件写得很完整，各种实用情境都有举例，而且也支援 TypeScript，如果是 React 的新手或是想要一个简单的状态管理套件，Valtio 可以作为首选之一。

在 Valtio 中两个核心的 API 是 proxy 跟 useSnapshot ， proxy 被用在代理原始的物件，当代理的物件改变时，Valtio 会通知使用这个物件的地方进行更新并重新渲染：

```
import { proxy, useSnapshot } from 'valtio'

const state = proxy({ count: 0, text: 'hello' })


```

要取得 proxy 的状态则是用 useSnapshot ，而要改变状态可以直接 mutate 原始的 state：

```
function Counter() {
  const snap = useSnapshot(state)
  return (
    <div>
      {snap.count}
      <button onClick={() => ++state.count}>+1</button>
    </div>
  )
}


```

而 proxy 代理的不只是物件，也可以是类别或是另外一个 proxy：

```
// 代理 class
class User {
  first = null
  last = null
  constructor(first, last) {
    this.first = first
    this.last = last
  }
  greet() {
    return `Hi ${this.first}!`
  }
  get fullName() {
    return `${this.first}${this.last}`
  }
}
const state = proxy(new User('Timo', 'Kivinen'))

// 代理 proxy
const obj1State = proxy({ a: 1 })
const obj2State = proxy({ a: 2 })

const state = proxy({
  obj1: obj1State,
  obj2: obj2State,
})


```

##### Valtio 如何解决渲染的问题

在 Valtio 中并不是使用如 Redux 或是 Zustand 的 selector 方式取得状态，而是直接把代理的状态直接拿出来使用，在风格上更接近 atom 的用法。Valtio 判断代理的对象中任何一个属性改变时，就会触发元件重新渲染。

以下面这个例子来说，当 count 改变时两个元件都会渲染，而且 text 改变也会造成两个元件都渲染：

```
const state = proxy({ count: 0, text: 'hello' })

const ComponentA = () => {
  const snap = useSnapshot(state)
  return <div>{snap.count}</div>
}

const ComponentB = () => {
  const snap = useSnapshot(state)
  return <div>{snap.text}</div>
}


```

由此可知，Valtio 在根本的设计上比较适合较小的对象，否则容易因为对象的其中一个属性改变了，造成多处的元件都被重新渲染。从这个用法看起来其实也很像是原生的 context API，只是不需要 context provider。

Valtio 在处理重新渲染的方式在 2021 年 9 月之前是使用 useReducer 作为重新渲染的手段，但在 #234 之后就改成了使用 useSyncExternalStore 侦测代理状态是否改变，并且触发重新渲染。

#### Mobx

Mobx 是非常老牌的全域状态管理套件，跟 Redux 是差不多时期出现的套件，在目前较有名气的状态管理套件下载量排行第三，每周大约有 100 万的下载量。

从现今为数众多的状态管理套件中，它的写法可以说是独树一格，非常得不一样，尽管后来 Mobx 推出了 hook API，但其核心的概念导致写起来有点神奇，接下来就让我们来看看吧！

会把 Mobx 归类在 proxy-based 的状态管理套件中，这意味着在它的底层有 proxy API 存在，Mobx 会「观察」所有使用的状态，在改变时通知相对应的元件渲染。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/meG6Vo0MevgBSNqMoKVFbvyic6SAoztEpPBdwxD93Lyoe5YoswXoTvvVIibSTjZKVSTCdbw5raeSK1CibhU3CCcwA/640?wx_fmt=other&from=appmsg)https://mobx.js.org/README.html

在 Mobx 中有许多建立 store 的方式，但基本上都可以理解成装饰器模式，把自定义的状态及 function 加上额外的功能。例如以下的例子，使用 @observable 监听了 count 的变化，并且定义了一个 @action 叫做 setCount：

```
import { action, observable } from 'mobx';

class Store {
    @observable
    count = 1;

    @action
    setCount = () => {
        this.count++;
    }
}


```

传递 store 方式官方推荐使用 React 的 context API，因为这样比较好做单元测试。而在使用 store 的时候，需要在组件外使用 HOC observer 包起来。

```
import { createContext, useContext } from "react"
import ReactDOM from "react-dom"
import { observer } from "mobx-react-lite"

const StoreContext = createContext()

const App = observer(() => {
    const store = useContext(StoreContext) // See the Timer definition above.
    return (
        <div>
            <button>count++</button>
            <span>Count: {store.count}</span>
        </div>
    )
})

ReactDOM.render(
    <StoreContext.Provider value={new Store()}>
        <App />
    </StoreContext.Provider>,
    document.body
)


```

Mobx 如何解决渲染的问题 在 Mobx 中同样也优化渲染的机制，例如以下有两个组件在 username 改变时，只有 MyComponent 会重新渲染：

```
const MyComponent = observer(() => {
  const { todos, username } = useContext(StoreContext)

  return (
    <div>
        {username}
        <TodosView todos={todos} />
    </div>
  )
})

const TodosView = observer(() => {
  const { todos } = useContext(StoreContext)

  return (
    <ul>
        {todos.map(todo => <li>{todo}</li>)}
    </ul>
  )
})


```

Mobx 的实施机制是看到目前为止最特别也是最复杂的，简单来说，Mobx 的机制是观察者模式，在使用 store 中的状态时会触发订阅，而状态改变时 Mobx 会通知相应的组件触发更新。

而实施观察者的方式是将 observable 定义的属性和对象都用 Proxy 代理，并且在其属性和对象上都加了点料，在执行 get 和 set 时都会触发 Mobx 的观察者模式。

我们会在需要使用 store 的组件加上 observer，当在组件里面使用某个属性时，该属性就会被挂到 observer 上，然后再把 observer 挂到 Mobx 全局对象，可以想象成该 observer 订阅了使用的属性。当有属性被改变时，就会把所有订阅该属性的 observer 都执行一遍。

在订阅发布时，observer 内部会去呼叫 useSyncExternalStore 的 callback，通知 React 应该重新渲染该组件了。

以上是非常抽象的描述了 Mobx 的实施逻辑，如果对于实施有兴趣的读者再去看源代码或是读一些相关的文章吧！在这边我们只要了解到大方向的实施细节即可。

#### Preact 的 signals

Signals 是 Preact 在 2022 年 9 月发表的状态管理套件，其命名的灵感是来自于 SolidJS，而且是用 pure Javascript 编写的套件，如果需要的话，你甚至可以在 React、Vue、Svelte 中使用 @preact/signals-react。

起初 Preact 团队在一个 startup 团队中发现，随着项目越来越大，有 100 多对工程师在 commit code，对于 component 的 render 优化就变得非常难以管。

虽然有 useMemo 、 useCallback 、 memo 等等的优化方法，但是大型项目在优化 render 这一块是非常不容易的，往往开发者都必须花费许多时间检查 dependencies array 中的对象为何改变了，有时候这是非常不符合效益成本，为了优化 render 花费比开发功能更多的时间。

Preact 为了让开发体验以及优化的效果可以更好，所以建立了 Signals 这个套件，不再需要处理麻烦的 dependencies array，而且在项目中开箱即可使用。

而且相对于 Flux、Atomic、Proxy 等等套件解决的是组件等级的重新渲染问题，但 Signal 的目标是 element 等级的渲染问题。

以下面这个例子来说，如果用 React 的逻辑来看，预期当 count.value++ 的时候 `<App/>` 跟 `<Child/>` 都会被重新渲染，这是 setState 时会触发的流程。但是使用 `@preact/signals-react` 则是会直接破坏 reconciliation 的过程，在每一秒 count.value++ 时，只有 `<h1>` 会被重新渲染。

```
import { useSignal, useSignalEffect } from '@preact/signals-react';

function Child() {
  console.log('render child');
  return <div>child</div>;
}

export default function App() {
  const count = useSignal(0);
  useSignalEffect(() => {
    setInterval(() => {
      count.value++;
    }, 1000);
  });
  console.log('rendering');

  return (
    <div>
      <h1>{count}</h1>
      <Child />
    </div>
  );
}


```

Signal 的设计跟 Mobx 还有 Valtio 很类似，都是让状态双向绑定，但是做到重新渲染的颗粒度变成只有使用状态的 element。

在 Preact 的官方文件中甚至提到使用了 signal 后，相比与原本使用 state 的背后是 virtual dom，其效能优化了许多倍，因为 signal 在传递状态时会直接略过没有使用到 signal 的组件。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/meG6Vo0MevgBSNqMoKVFbvyic6SAoztEpcX4ic4fSJ33jicMcxicwU9ZN9P3lGjPm2sf868GybHrJgA1VshNrSr1qw/640?wx_fmt=other&from=appmsg)https://preactjs.com/blog/introducing-signals/

#### Signal 是未来吗？

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/meG6Vo0MevgBSNqMoKVFbvyic6SAoztEpq3BToFgh6FicUltobSLrzKiaoYyotVJRMRjbX1NmdymSUBeBlGxgtibng/640?wx_fmt=other&from=appmsg)https://npmtrends.com/ jotai-signal-vs-@preact/signals

从下载量来看的话 signal 的套件下载量是少之又少，会比较少人使用的原因除了是这两个套件比较新之外，signal 并不是 React 团队所推崇的状态管理机制，因为它破坏了 React 的生命周期。

Dan 本人也提到 @preact/signals 的实作原理是基于一个脆弱的假设，React 完全并不支援 signal 的状态管理机制，如果使用像是 @preact/signals 这种套件导致 React 发生问题，React 团队无法帮忙找出问题。

以结论来说，目前在 React 生态系中使用 signal 并不是一个好的时间点或是好的选择，不如使用原生的状态管理机制或是较多人使用的状态管理套件。

不过虽然说 signal 目前没办法在 React 中使用，但是许多框架已经逐渐拥抱这个概念，像是 Solid、Qwik、Vue、Preact、Angular 等等的框架都有实现 signal。

题外话，在 13 年前 https://knockoutjs.com/ 这个套件已经有 signal 这个概念

结论 在这篇文章中我们探讨了使用 React 原生的状态管理机制主要会遭遇以下两个问题：

props drilling 的问题 context 造成整颗子树渲染的问题 基本上 props drilling 的问题在本质上都是透过 context API 来解决，但就衍生 context 造成整颗子树渲染的问题。我们可以看到不论是基于 Flux、Atomic、Proxy 实作的套件，除了 Jotai 以外，在侦测状态改变并触发元件渲染的实作都采用了 useSyncExternalStore 这个 API，只是会根据不同的核心概念实作。

最后也稍微提到了 signal 这个在 React 圈子较新的概念，但是实际上并不适合在 React 生态系中，而且面临的 issue 可能 React 的开发者也无法解决。

以我个人的判断，目前在团队中使用 Redux、Zustand 跟 Jotai 是较好的选择；不考虑 Recoil 主因是 issue 太多而且至今还放在 facebookexperimental repo，如果要使用 Atomic 的写法，Jotai 是更好的选择；而 Valtio 看起来很酷，但是 mutable 的写法与 React 经常使用的 immutable 写法背道而驰，如果要在团队中使用也许就要有更好的教育训练，否则 coding style 会差别太多。Mobx 的写法…，个人不爱 😅。

#### Reference

*   Hacker Way: Rethinking Web App Development at Facebook
    
*   https://github.com/facebookarchive/flux
    
*   https://github.com/pmndrs/zustand
    
*   https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy
    
*   https://github.com/pmndrs/valtio
    
*   https://valtio.pmnd.rs/docs/introduction/getting-started
    
*   https://jotai.org/
    
*   Differences between Recoil and Jotai
    
*   When to use Valtio, when to use Jotai #128
    
*   Why are signals still not so popular?
    
*   How Valtio Proxy State Works (Vanilla Part)
    
*   https://mobx.js.org/README.html
    
*   How does observer HoC work?
    
*   A simple Mobx under 50 LOC to understand observer pattern
    
*   https://juejin.cn/post/7274211579692269583?searchId=20231129222759956FB008A6CDB12EF5EF
    
*   https://preactjs.com/guide/v10/signals/
    

Node 社群

```
我组建了一个氛围特别好的 Node.js 社群，里面有很多 Node.js小伙伴，如果你对Node.js学习感兴趣的话（后续有计划也可以），我们可以一起进行Node.js相关的交流、学习、共建。下方加 考拉 好友回复「Node」即可。

   “分享、点赞、在看” 支持一下

```