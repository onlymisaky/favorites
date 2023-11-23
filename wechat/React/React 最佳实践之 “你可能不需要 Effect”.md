> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/brQYKlQGoSRU8rvvGL1siA)

_**点击**__**关注**__**公众号，回复”**_ _**福利**__**”**_ 
==============================================

_**即可参与文末抽奖**__![](https://mmbiz.qpic.cn/mmbiz_png/b96CibCt70iaajvl7fD4ZCicMcjhXMp1v6UibM134tIsO1j5yqHyNhh9arj090oAL7zGhRJRq6cFqFOlDZMleLl4pw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)_
=========================================================================================================================================================================================

前言
==

本文思想来自 React 官方文档 You Might Not Need an Effect，保熟，是我近几天读了 n 遍之后自己的理解，感觉受益匪浅，这里小记一下跟大家分享。

曾经本小白 R 的水平一直停留在会用 React 写业务，讲究能跑就行的程度，最近尝试学习一些关于 React 的最佳实践，感兴趣的朋友一起上车吧！！

useEffect 痛点概述
==============

`useEffect`的回调是异步宏任务，在 React 根据当前状态更新视图之后，下一轮事件循环里才会执行`useEffect`的回调，一旦`useEffect`回调的逻辑中存在状态修改等操作，就会触发渲染的重新执行（FC 函数体重新运行，渲染视图），不光存在一定的性能损耗，而且因为前后两次渲染的数据不同，可能造成用户视角下视图的闪动，所以在开发过程中应该避免滥用`useEffect`。

如何移除不必要的 Effect
===============

*   对于渲染所需的数据，如果可以用组件内状态（`props`、`state`）转换而来，转换操作避免放在`Effect`中，而应该直接放在 FC 函数体中。
    
    如果转换计算的消耗比较大，可以用`useMemo`进行缓存。
    
*   对于一些用户行为引起数据变化，其后续的逻辑不应该放在`Effect`中，而是在事件处理函数中执行逻辑即可。
    
    比如点击按钮会使组件内`count`加一，我们希望`count`变化后执行某些逻辑，那么就没必要把代码写成：
    
    ```
    function Counter() {    const [count, setCount] = useState(0);        function handleClick() {        setCount(prev => prev + 1);    }        useEffect(() => {        // count改变后的逻辑...    }, [count])        // ...}
    ```
    
    上面的 demo 大家肯定也看出来了，直接把`Effect`中的逻辑移动到事件处理函数中即可。
    

根据`props`或`state`来更新`state`（类似于 vue 中的计算属性）
===========================================

如下`Form`组件中`fullName`由`firstName`与`lastName`计算（简单拼接）而来，错误使用`Effect`：

```
function Form() {  const [firstName, setFirstName] = useState('Taylor');  const [lastName, setLastName] = useState('Swift');  // 🔴 避免：多余的 state 和不必要的 Effect  const [fullName, setFullName] = useState('');  useEffect(() => {    setFullName(firstName + ' ' + lastName);  }, [firstName, lastName]);  // ...}
```

分析一下，按照上面的写法，如果`firstName`或者`lastName`改变之后，首先根据新的`firstName`与`lastName`与旧的`fullName`进行渲染，然后才是`useEffect`回调的执行，最后根据最新的`fullName`再次渲染视图。

我们要做的是尽可能把渲染的效果进行统一（同步`fullName`与两个组成 state 的新旧），并且减少渲染的次数：

```
function Form() {  const [firstName, setFirstName] = useState('Taylor');  const [lastName, setLastName] = useState('Swift');  // ✅ 非常好：在渲染期间进行计算  const fullName = firstName + ' ' + lastName;  // ...}
```

缓存昂贵的计算
=======

基于上面的经验，我们如果遇到比较复杂的计算逻辑，把它放在 FC 函数体中可能性能消耗较大，可以使用`useMemo`进行缓存，如下，`visibleTodos`这个数据由`todos`与`filter`两个`props`数据计算而得，并且计算消耗较大：

```
import { useMemo } from 'react';function TodoList({ todos, filter }) {      // ✅ 除非 todos 或 filter 发生变化，否则不会重新执行 getFilteredTodos()  const visibleTodos = useMemo(() => getFilteredTodos(todos, filter), [todos, filter]);  // ...}
```

当 props 变化时重置所有 state
=====================

比如一个`ProfilePage`组件，它接收一个`userId`代表当前正在操作的用户，里面有一个评论输入框，用一个 state 来记录输入框中的内容。我们为了防止切换用户后，原用户输入的内容被当前的用户发出这种误操作，有必要在`userId`改变时置空 state，包括`ProfilePage`组件的所有子组件中的评论`state`。

错误操作：

```
export default function ProfilePage({ userId }) {  const [comment, setComment] = useState('');  // 🔴 避免：当 prop 变化时，在 Effect 中重置 state  useEffect(() => {    setComment('');  }, [userId]);  // ...}
```

为什么避免上诉情况，本质还是避免`Effect`的痛点，我们可以利用组件 **`key`不同将会完全重新渲染 ** 的特点解决这个问题，只需要在父组件中给这个组件传递一个与`props`同步的`key`值即可：

```
export default function ProfilePage({ userId }) {  return (    <Profile      userId={userId}      key={userId}    />  );}function Profile({ userId }) {  // ✅ 当 key 变化时，该组件内的 comment 或其他 state 会自动被重置  const [comment, setComment] = useState('');  // ...}
```

当 prop 变化时调整部分 state
====================

其实说白了还是上面的基于`props`和`state`来计算其它所需`state`的逻辑，如下`List`组件，当传入的`items`改变时希望同步`selection`（被选中的数据），那么我们直接在渲染阶段计算所需内容就好了：

```
function List({ items }) {  const [isReverse, setIsReverse] = useState(false);  const [selectedId, setSelectedId] = useState(null);  // ✅ 非常好：在渲染期间计算所需内容  const selection = items.find(item => item.id === selectedId) ?? null;  // ...}
```

在事件处理函数中共享逻辑
============

比如两种用户操作都可以修改某个数据，然后针对数据修改有相应的逻辑处理，这时候有一种错误（不好）的代码逻辑：事件回调——> 修改 state——>state 修改触发 Effect——>Effect 中执行后续逻辑。

我们不应该多此一举的添加一个 Effect，这个 Effect 就类似于数据改变的监听器一样，完全是多余的，我们只需要在数据改变之后接着写后续的逻辑就好了！！

如下，用户的购买与检查两种行为都可以触发`addToCart`的逻辑，进而修改`product`这个数据，然后可能触发后续逻辑`showNotification`：

```
function ProductPage({ product, addToCart }) {  // 🔴 避免：在 Effect 中处理属于事件特定的逻辑  useEffect(() => {    if (product.isInCart) {      showNotification(`已添加 ${product.name} 进购物车！`);    }  }, [product]);  function handleBuyClick() {    addToCart(product);  }  function handleCheckoutClick() {    addToCart(product);    navigateTo('/checkout');  }  // ...}
```

我们把`Effect`中的逻辑提取出来放到事件处理函数中就好了：

```
function ProductPage({ product, addToCart }) {  // ✅ 非常好：事件特定的逻辑在事件处理函数中处理  function buyProduct() {    addToCart(product);    showNotification(`已添加 ${product.name} 进购物车！`);  }  function handleBuyClick() {    buyProduct();  }  function handleCheckoutClick() {    buyProduct();    navigateTo('/checkout');  }  // ...}
```

发送 POST 请求
==========

也有一些典型的需要使用`Effect`的情景，比如有些数据、逻辑是页面初次渲染，因为组件的呈现而需要的，而不是后续交互触发的，比如异步数据的获取，我们就可以写一个依赖数组为`[]`的`Effect`。

如下`Form`组件，页面加载之际就需要发送一个分析请求，这个行为与后续交互无关，是因为页面的呈现就需要执行的逻辑，所以放在`Effect`中，而表单提交的行为触发的网络请求，我们直接放在事件回调中即可。

切忌再多写一个`state`和一个`Effect`，然后把一部分逻辑写在`Effect`里面，比如下面`handleSubmit`中修改`firstName`与`lastName`，然后多写一个`Effect`监听这两个数据发送网络请求，这就是上面我们一直纠正的问题，我就不放代码了。

```
function Form() {  const [firstName, setFirstName] = useState('');  const [lastName, setLastName] = useState('');  // ✅ 非常好：这个逻辑应该在组件显示时执行  useEffect(() => {    post('/analytics/event', { eventName: 'visit_form' });  }, []);  function handleSubmit(e) {    e.preventDefault();    // ✅ 非常好：事件特定的逻辑在事件处理函数中处理    post('/api/register', { firstName, lastName });  }  // ...}
```

链式计算
====

避免通过 state 将`Effect`变成链式调用，如下`Game`组件中，类似于一个卡牌合成游戏，`card`改变可能触发`goldCardCount`的改变，`goldCardCount`的改变可能触发`round`的改变，最终`round`的改变可能触发`isGameOver`的改变，试想如果某次`card`改变，从而正好所有条件都依次满足，最后`isGameOver`改变，`setCard` → 渲染 → `setGoldCardCount` → 渲染 → `setRound` → 渲染 → `setIsGameOver` → 渲染，有三次不必要的重新渲染！！

```
function Game() {  const [card, setCard] = useState(null);  const [goldCardCount, setGoldCardCount] = useState(0);  const [round, setRound] = useState(1);  const [isGameOver, setIsGameOver] = useState(false);  // 🔴 避免：链接多个 Effect 仅仅为了相互触发调整 state  useEffect(() => {    if (card !== null && card.gold) {      setGoldCardCount(c => c + 1);    }  }, [card]);  useEffect(() => {    if (goldCardCount > 3) {      setRound(r => r + 1)      setGoldCardCount(0);    }  }, [goldCardCount]);  useEffect(() => {    if (round > 5) {      setIsGameOver(true);    }  }, [round]);  useEffect(() => {    alert('游戏结束！');  }, [isGameOver]);  function handlePlaceCard(nextCard) {    if (isGameOver) {      throw Error('游戏已经结束了。');    } else {      setCard(nextCard);    }  }  // ...
```

因为`Game`中所有`state`改变之后的行为都是可以预测的，也就是说某个卡牌数据变了，后续要不要继续合成更高级的卡牌，或者游戏结束等等这些逻辑都是完全明确的，所以直接把数据修改的逻辑放在同一个事件回调中即可，然后根据入参判断是哪种卡牌然后进行后续的操作即可：

```
function Game() {  const [card, setCard] = useState(null);  const [goldCardCount, setGoldCardCount] = useState(0);  const [round, setRound] = useState(1);  // ✅ 尽可能在渲染期间进行计算  const isGameOver = round > 5;  function handlePlaceCard(nextCard) {    if (isGameOver) {      throw Error('游戏已经结束了。');    }    // ✅ 在事件处理函数中计算剩下的所有 state    setCard(nextCard);    if (nextCard.gold) {      if (goldCardCount <= 3) {        setGoldCardCount(goldCardCount + 1);      } else {        setGoldCardCount(0);        setRound(round + 1);        if (round === 5) {          alert('游戏结束！');        }      }    }  }  // ...
```

初始化应用
=====

因为 React 严格模式 & 开发模式下：

```
ReactDOM.createRoot(document.getElementById('root')).render(  <React.StrictMode>    <App />  </React.StrictMode>,)
```

组件的渲染会执行两次（挂载 + 卸载 + 挂载），包括依赖为`[]`的`Effect`同样会执行两次，这是 React 作者为了提醒开发者 cleanup 有意而设计之的（比如一些需要手动清除的原生事件如果没写清除逻辑，事件触发时就会执行两次回调从而引起注意），所以执行两次的逻辑可能会造成一些逻辑问题，我们可以用一个全局变量来保证即使在 React 严格模式 & 开发模式下也只执行一次`Effect`的回调：

```
let didInit = false;function App() {  useEffect(() => {    if (!didInit) {      didInit = true;      // ✅ 只在每次应用加载时执行一次      loadDataFromLocalStorage();      checkAuthToken();    }  }, []);  // ...}
```

通知父组件有关 state 变化的信息
===================

最佳实践的本质还是我们刚刚一直强调的：减少 Effect 的使用，可以归并到回调函数中的逻辑就不要放在`Effect`中。

如下，假设我们正在编写一个有具有内部 state `isOn` 的 `Toggle` 组件，该 state 可以是 `true` 或 `false`，希望在 `Toggle` 的 state 变化时通知父组件。

错误示范：

（事件回调只负责修改 state， Effect 中执行通知父组件的逻辑）

```
function Toggle({ onChange }) {  const [isOn, setIsOn] = useState(false);  // 🔴 避免：onChange 处理函数执行的时间太晚了  useEffect(() => {    onChange(isOn);  }, [isOn, onChange])  function handleClick() {    setIsOn(!isOn);  }  function handleDragEnd(e) {    if (isCloserToRightEdge(e)) {      setIsOn(true);    } else {      setIsOn(false);    }  }  // ...}
```

删除`Effect`：

```
function Toggle({ onChange }) {  const [isOn, setIsOn] = useState(false);  function updateToggle(nextIsOn) {    // ✅ 事件回调中直接通知父组件即可    setIsOn(nextIsOn);    onChange(nextIsOn);  }  function handleClick() {    updateToggle(!isOn);  }  function handleDragEnd(e) {    if (isCloserToRightEdge(e)) {      updateToggle(true);    } else {      updateToggle(false);    }  }  // ...}
```

将数据传递给父组件
=========

避免在 `Effect` 中传递数据给父组件，这样会造成数据流的混乱。我们应该考虑把获取数据的逻辑提取到父组件中，然后通过`props`将数据传递给子组件：

错误示范：

```
function Parent() {  const [data, setData] = useState(null);  // ...  return <Child onFetched={setData} />;}function Child({ onFetched }) {  const data = useSomeAPI();  // 🔴 避免：在 Effect 中传递数据给父组件  useEffect(() => {    if (data) {      onFetched(data);    }  }, [onFetched, data]);  // ...}
```

理想情况：

```
function Parent() {  const data = useSomeAPI();  // ...  // ✅ 非常好：向子组件传递数据  return <Child data={data} />;}function Child({ data }) {  // ...}
```

订阅外部 store
==========

说白了就是 React 给我们提供了一个专门的 hook 用来绑定外部数据（所谓外部数据，就是一些环境运行环境里的数据，比如`window.xxx`）

我们曾经常用的做法是在`Effect`中编写事件监听的逻辑：

```
function useOnlineStatus() {  // 不理想：在 Effect 中手动订阅 store  const [isOnline, setIsOnline] = useState(true);  useEffect(() => {    function updateState() {      setIsOnline(navigator.onLine);    }    updateState();    window.addEventListener('online', updateState);    window.addEventListener('offline', updateState);    return () => {      window.removeEventListener('online', updateState);      window.removeEventListener('offline', updateState);    };  }, []);  return isOnline;}function ChatIndicator() {  const isOnline = useOnlineStatus();  // ...}
```

这里可以换成`useSyncExternalStore`这个 hook，关于这个 hook，还是有一点理解成本的，我的基于 useSyncExternalStore 封装一个自己的 React 状态管理模型吧这篇文章里有详细的解释，下面直接放绑定外部数据最佳实践的代码了：

```
function subscribe(callback) {  window.addEventListener('online', callback);  window.addEventListener('offline', callback);  return () => {    window.removeEventListener('online', callback);    window.removeEventListener('offline', callback);  };}function useOnlineStatus() {  // ✅ 非常好：用内置的 Hook 订阅外部 store  return useSyncExternalStore(    subscribe, // 只要传递的是同一个函数，React 不会重新订阅    () => navigator.onLine, // 如何在客户端获取值    () => true // 如何在服务端获取值  );}function ChatIndicator() {  const isOnline = useOnlineStatus();  // ...}
```

获取异步数据
======

比如组件内根据`props`参数`query`与一个组件内状态`page`来实时获取异步数据，下面组件获取异步数据的逻辑之所以没有写在事件回调中，是因为首屏即使用户没有触发数据修改，我们也需要主动发出数据请求（类似于首屏数据获取），总之因为业务场景需求吧，我们把请求逻辑放在一个`Effect`中：

```
function SearchResults({ query }) {  const [results, setResults] = useState([]);  const [page, setPage] = useState(1);  useEffect(() => {    // 🔴 避免：没有清除逻辑的获取数据    fetchResults(query, page).then(json => {      setResults(json);    });  }, [query, page]);  function handleNextPageClick() {    setPage(page + 1);  }  // ...}
```

上面代码的问题在于，由于每次网络请求的不可预测性，我们不能保证请求结果是根据当前最新的组件状态获取的，也即是所谓的**「竞态条件：两个不同的请求 “相互竞争”，并以与你预期不符的顺序返回。」**

**「所以可以给我们的`Effect`添加一个清理函数，来忽略较早的返回结果，」** 如下，说白了用一个变量`ignore`来控制这个`Effect`回调的 "有效性"，只要是执行了下一个`Effect`回调，上一个`Effect`里的`ignore`置反，也就是让回调的核心逻辑失效，保证了只有最后执行的`Effect`回调是 “有效” 的：

```
function SearchResults({ query }) {  const [results, setResults] = useState([]);  const [page, setPage] = useState(1);  useEffect(() => {    // 说白了用一个ignore变量来控制这个Effect回调的"有效性",    let ignore = false;    fetchResults(query, page).then(json => {      if (!ignore) {        setResults(json);      }    });    return () => {      ignore = true;    };  }, [query, page]);  function handleNextPageClick() {    setPage(page + 1);  }  // ...}
```

_**点击**__**小卡片**__**，**__**参与粉丝专属福利！！**__![](https://mmbiz.qpic.cn/mmbiz_png/b96CibCt70iaajvl7fD4ZCicMcjhXMp1v6UibM134tIsO1j5yqHyNhh9arj090oAL7zGhRJRq6cFqFOlDZMleLl4pw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)_

如果文章对你有帮助的话欢迎

**「关注 + 点赞 + 收藏」**