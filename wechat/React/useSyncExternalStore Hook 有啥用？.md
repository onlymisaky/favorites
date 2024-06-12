> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/g5Bc2vD0Tr8lTPTgGpcSqA)

您可能已经熟悉 React 提供的一组内置 Hook，例如 useState、useEffect、useMemo 等等。其中包括 useSyncExternalStore Hook，它在库作者中非常常用，但在客户端 React 项目中很少见到。

在本文中，将探讨 useSyncExternalStore Hook，以更好地了解它是什么、它如何工作、为什么有用以及何时应该在前端项目中利用它。

useSyncExternalStore 简介
-----------------------

如果您想订阅外部数据存储，useSyncExternalStore 可能是完美的 API。大多数时候，开发人员选择 useEffect Hook。但是，如果您的数据存在于 React 树之外，则 useSyncExternalStore 可能更合适。

基本的 useSyncExternalStore API 接受三个参数：

```
useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)<br style="visibility: visible;">
```

*   subscribe 是一个回调，它接收订阅外部存储数据的函数
    
*   getSnapshot 是一个返回外部存储数据当前快照的函数
    
*   getServerSnapshot 是一个可选参数，用于发送初始存储数据的快照。可以在服务器数据的初始水合作用期间使用它
    

useSyncExternalStore 返回订阅的外部数据的当前快照。

考虑这样一种情况，外部数据不在 React 树中——换句话说，它存在于你的前端代码或一般应用程序之外。在这种情况下，可以使用 useSyncExternalStore 订阅该数据存储。

为了更好地理解 useSyncExternalStore Hook，让我们看一个非常简单的实现。可以将其分配给一个变量（例如下面示例中的 list ），并根据需要将其呈现给 UI：

```
import { useSyncExternalStore } from 'react';import externalStore from './externalStore.js';function Home() {const list = useSyncExternalStore(externalStore.subscribe, externalStore.getSnapshot);  return (    <>      <section>        {list.map((itm, index) => (          <div key={index}>            <div>{itm?.title}</div>          </div>        ))}      </section>    </>  );}
```

如您所见， externalStore 现已订阅，将获得对 externalStore 数据执行的任何更改的实时快照。您可以使用 list 进一步映射外部源中的项目并进行实时 UI 渲染。

外部存储中的任何更改都会立即反映出来，React 将根据快照更改重新渲染 UI。

useSyncExternalStore 的用例
------------------------

useSyncExternalStore Hook 是许多利基用例的理想解决方案，例如：

*   缓存来自外部 API 的数据：由于此 Hook 主要用于订阅外部第三方数据源，因此缓存数据也变得更简单。可以使应用程序的数据与外部数据源保持同步，以后还可以将其用于离线支持
    
*   WebSocket 连接：由于 WebSocket 是一个 “持续” 连接，因此可以使用此 Hook 来实时管理 WebSocket 连接状态数据
    
*   管理浏览器存储：在这种情况下，需要在 Web 浏览器存储（例如 IndexedDB 或 localStorage ）与应用程序状态之间同步数据，可以使用 useSyncExternalStore 订阅更新外部 store
    

在很多这样的情况下，这个 Hook 可能比流行的 useEffect Hook 非常有用并且更容易管理。让我们在下一节中比较这两个 Hook。

useSyncExternalStore 与 useEffect
--------------------------------

您可以选择更常用的 useEffect Hook 来实现与上面示例类似的功能：

```
const [list, setList] = useState([]);  useEffect(() => {    const fetchData = async () => {      try {        // assuming externalStore has a fetchData method or it is an async operation        const newList = await externalStore.fetchData();        setList(newList);      } catch (error) {        console.error(error);      }    };    // calling the async function here    fetchData();  }, []);
```

但是， useEffect Hook 不提供每次状态更新的当前快照，并且它比 useSyncExternalStore Hook 更容易出错。此外，它还存在臭名昭著的重新渲染问题。接下来我们简单回顾一下这个问题。

在处理 useEffect Hook 时，可能会遇到的一个主要问题是渲染顺序。浏览器完成绘制后，只有 useEffect Hook 会触发。这种延迟（尽管是故意的）会在管理正确的事件链方面带来意想不到的错误和挑战。

考虑以下示例：

```
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log('count- ', count);
    // Imagine some asynchronous task here, like fetching data from an API
    // This could introduce a delay between the state update and the effect running
    // afterwards.
  }, [count]);

  const increment = () => {
    setCount(count + 1);
  };

  console.log('outside the effect count - ', count);

  return (
    <div>
      <div>Counter</div>
      <div>Count: {count}</div>
      <button onClick={increment}>Increment</button>
    </div>
  );
}

export default Counter;
```

您可能期望计数器应用程序以简单的方式运行，其中状态更新，组件重新渲染，最后运行效果。然而，由于 API 调用的延迟，事情变得有点棘手，并且事件的顺序可能不是我们所期望的。

现在考虑一个具有许多此类副作用和不同依赖项数组的应用程序。在这种情况下，以正确的顺序跟踪状态更新将是一场噩梦。

如果您的数据位于外部并且不依赖于现有的 React API 来处理，那么您可以避免所有这些并使用 useSyncExternalStore Hook 来修复此性能差距。与 useEffect Hook 不同，此 Hook 会立即触发，不会造成任何延迟。

useSyncExternalStore 还可以防止前面提到的重新渲染问题，只要状态发生变化，您就可能会遇到 useEffect 问题。有趣的是，使用 useSyncExternalStore 订阅的状态不会重新渲染两次，从而解决了巨大的性能问题。

useSyncExternalStore 与 useState
-------------------------------

使用 useSyncExternalStore Hook 时，您可能会觉得您只是订阅一个状态并将其分配给一个变量，类似于使用 useState Hook。然而， useSyncExternalStore 不仅仅是简单地分配状态。

useState Hook 的一个限制是它被设计为以 “每个组件” 的方式管理状态。换句话说，你定义的状态仅限于它自己的 React 组件，无法全局访问。您可以使用回调、全局强制状态，甚至可以在组件中使用 prop-drilling 状态，但这可能会减慢您的 React 应用程序的速度。

useSyncExternalStore Hook 通过设置一个全局状态来防止此问题，您可以从任何 React 组件订阅该状态，无论其嵌套有多深。更好的是，如果您正在处理非 React 代码库，您只需关心订阅事件。

useSyncExternalStore 将向您发送可以在任何 React 组件中使用的全局存储当前状态的正确快照。

使用 useSyncExternalStore 构建待办事项应用
--------------------------------

让我们通过构建一个演示待办事项应用程序来看看 useSyncExternalStore Hook 在实际项目中有多有用。首先，创建一个用作外部全局状态的 store.js 文件。稍后我们将为我们的待办事项订阅此状态：

```
let todos = [];let subscribers = new Set();const store = {  getTodos() {    // getting all todos    return todos;  }, // subscribe and unsubscribe from the store using callback  subscribe(callback) {    subscribers.add(callback);    return () => subscribers.delete(callback);  },// adding todo to the state  addTodo(text) {    todos = [      ...todos,      {        id: new Date().getTime(),        text: text,        completed: false,      },    ];    subscribers.forEach((callback) => {      callback();    });  },// toggle for todo completion using id  toggleTodo(id) {    todos = todos.map((todo) => {      return todo.id === id ? { ...todo, completed: !todo.completed } : todo;    });    subscribers.forEach((callback) => callback());  },};// exporting the default store stateexport default store;
```

您的 store 现在已准备好在 React 组件中订阅。继续创建一个简单的 Todo 组件，该组件将通过订阅您之前创建的商店将待办事项呈现到 UI：

```
import { useSyncExternalStore } from "react";import store from "./store.js";function Todo() {// subscribing to the store  const todosStore = useSyncExternalStore(store.subscribe, store.getTodos);  return (    <div>      {todosStore.map((todo, index) => (        <div key={index}>           <input              type="checkbox"              value={todo.completed}              onClick={() => store.toggleTodo(todo.id)}            />            // toggle based on completion logic             {todo.completed ? <div>{todo.text}</div> : todo.text}        </div>      ))}    </div>  );}export default Todo;
```

至此，我们使用 useSyncExternalStore 的迷你演示项目就完成了。结果应如下所示：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/83d3vL8fIicbLibHU3ctzTFM8BkGLpHx6Wfq5IF0Yn8DZVPXh4BoE8n02F9HIXvdlZ3Vib0opodJ4cmZwCia51ibRGw/640?wx_fmt=png&from=appmsg)

总结
--

React 提供了很多内置的 Hook，其中一些在开发人员中非常常用。然而，像 useSyncExternalStore 这样真正有用的 Hook 经常会被掩盖。

在这篇文章中，您已经了解了此 Hook 有许多出色的使用示例，它们不仅可以改善整体应用程序体验，还可以防止您在使用 useEffect Hook 时可能遇到的讨厌的错误。

如果您是 JavaScript 库作者，可能已经在使用它来获得使用 useEffect Hook 或 useState Hook 无法实现的性能提升。正如我们在本文中探讨的那样，如果正确使用，useSyncExternalStore Hook 可以为您节省大量的开发时间。

原文链接：https://blog.logrocket.com/exploring-usesyncexternalstore-react-hook/