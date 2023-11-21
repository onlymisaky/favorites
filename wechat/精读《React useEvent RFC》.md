> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/8MNUgKBRFPNNb8_nD1BKgg)

useEvent 要解决一个问题：如何同时保持函数引用不变与访问到最新状态。

本周我们结合 RFC 原文与解读文章 What the useEvent React hook is (and isn't) 一起了解下这个提案。

借用提案里的代码，一下就能说清楚 `useEvent` 是个什么东西：

```
function Chat() {  const [text, setText] = useState('');  // ✅ Always the same function (even if `text` changes)  const onClick = useEvent(() => {    sendMessage(text);  });  return <SendButton onClick={onClick} />;}
```

`onClick` 既保持引用不变，又能在每次触发时访问到最新的 `text` 值。

为什么要提供这个函数，它解决了什么问题，在概述里慢慢道来。

概述
--

定义一个访问到最新 state 的函数不是什么难事：

```
function App() {  const [count, setCount] = useState(0)  const sayCount = () => {    console.log(count)  }  return <Child onClick={sayCount} />}
```

但 `sayCount` 函数引用每次都会变化，这会直接破坏 `Child` 组件 memo 效果，甚至会引发其更严重的连锁反应（`Child` 组件将 `onClick` 回调用在 `useEffect` 里时）。

想要保证 `sayCount` 引用不变，我们就需要用 `useCallback` 包裹：

```
function App() {  const [count, setCount] = useState(0)  const sayCount = useCallback(() => {    console.log(count)  }, [count])  return <Child onClick={sayCount} />}
```

但即便如此，我们仅能保证在 `count` 不变时，`sayCount` 引用不变。如果想保持 `sayCount` 引用稳定，就要把依赖 `[count]` 移除，这会导致访问到的 `count` 总是初始值，逻辑上引发了更大问题。

一种无奈的办法是，维护一个 countRef，使其值与 count 保持同步，在 `sayCount` 中访问 `countRef`：

```
function App() {  const [count, setCount] = useState(0)  const countRef = React.useRef()  countRef.current = count  const sayCount = useCallback(() => {    console.log(countRef.current)  }, [])  return <Child onClick={sayCount} />}
```

这种代码能解决问题，但绝对不推荐，原因有二：

1.  每个值都要加一个配套 Ref，非常冗余。
    
2.  在函数内直接同步更新 ref 不是一个好主意，但写在 `useEffect` 里又太麻烦。
    

另一种办法就是自创 hook，如 `useStableCallback`，这本质上就是这次提案的主角 - `useEvent`：

```
function App() {  const [count, setCount] = useState(0)  const sayCount = useEvent(() => {    console.log(count)  })  return <Child onClick={sayCount} />}
```

所以 `useEvent` 的内部实现很可能类似于自定义 hook `useStableCallback`。在提案内也给出了可能的实现思路：

```
// (!) Approximate behaviorfunction useEvent(handler) {  const handlerRef = useRef(null);  // In a real implementation, this would run before layout effects  useLayoutEffect(() => {    handlerRef.current = handler;  });  return useCallback((...args) => {    // In a real implementation, this would throw if called during render    const fn = handlerRef.current;    return fn(...args);  }, []);}
```

其实很好理解，我们将需求一分为二看：

1.  既然要返回一个稳定引用，那最后返回的函数一定使用 `useCallback` 并将依赖数组置为 `[]`。
    
2.  又要在函数执行时访问到最新值，那么每次都要拿最新函数来执行，所以在 Hook 里使用 Ref 存储每次接收到的最新函数引用，在执行函数时，实际上执行的是最新的函数引用。
    

注意两段注释，第一个是 `useLayoutEffect` 部分实际上要比 `layoutEffect` 执行时机更提前，这是为了保证函数在一个事件循环中被直接消费时，可能访问到旧的 Ref 值；第二个是在渲染时被调用时要抛出异常，这是为了避免 `useEvent` 函数被渲染时使用，因为这样就无法数据驱动了。

精读
--

其实 `useEvent` 概念和实现都很简单，下面我们聊聊提案里一些有意思的细节吧。

### 为什么命名为 useEvent

提案里提到，如果不考虑名称长短，完全用功能来命名的话，`useStableCallback` 或 `useCommittedCallback` 会更加合适，都表示拿到一个稳定的回调函数。但 `useEvent` 是从使用者角度来命名的，即其生成的函数一般都被用于组件的回调函数，而这些回调函数一般都有 “事件特性”，比如 `onClick`、`onScroll`，所以当开发者看到 `useEvent` 时，可以下意识提醒自己在写一个事件回调，还算比较直观。（当然我觉得主要原因还是为了缩短名称，好记）

### 值并不是真正意义上的实时

虽然 `useEvent` 可以拿到最新值，但和 `useCallback` 拿 `ref` 还是有区别的，这个差异体现在：

```
function App() {  const [count, setCount] = useState(0)  const sayCount = useEvent(async () => {    console.log(count)    await wait(1000)    console.log(count)  })  return <Child onClick={sayCount} />}
```

`await` 前后输出值一定是一样的，在实现上，`count` 值仅是调用时的快照，所以函数内异步等待时，即便外部又把 `count` 改了，当前这次函数调用还是拿不到最新的 `count`，而 `ref` 方法是可以的。在理解上，为了避免夜长梦多，回调函数尽量不要写成异步的。

### useEvent 也救不了手残

如果你坚持写出 `onSomething={cond ? handler1 : handler2}` 这样的代码，那么 `cond` 变化后，传下去的函数引用也一定会变化，这是 `useEvent` 无论如何也避免不了的，也许解救方案是 Lint and throw error。

其实将 `cond ? handler1 : handler2` 作为一个整体包裹在 `useEvent` 就能解决引用变化的问题，但除了 Lint，没有人能防止你绕过它。

### 可以用自定义 hook 代替 useEvent 实现吗？

不能。虽然提案里给了一个近似解决方案，但实际上存在两个问题：

1.  在赋值 ref 时，`useLayoutEffect` 时机依然不够提前，如果值变化后理解访问函数，拿到的会是旧值。
    
2.  生成的函数被用在渲染并不会给出错误提示。
    

总结
--

`useEvent` 显然又给 React 增加了一个官方概念，在结结实实增加了理解成本的同时，也补齐了 React Hooks 在实践中缺失的重要一环，无论你喜不喜欢，问题就在那，解法也给了，挺好。

> 讨论地址是：精读《React useEvent RFC》· Issue #415 · dt-fe/weekly

**如果你想参与讨论，请 点击这里，每周都有新的主题，周末或周一发布。前端精读 - 帮你筛选靠谱的内容。**

> 版权声明：自由转载 - 非商用 - 非衍生 - 保持署名（创意共享 3.0 许可证）