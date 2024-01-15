> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/jrViaXf0dMKtiqN2NU3Akg)

众所周知，`JavaScript` 中的闭包（`Closures`）一定是这种语言最可怕的特性之一，即使是无所不知的 `ChatGPT` 也是这样说的。另外它可能也是最隐蔽的语言特性之一，我们在编写 `React` 代码时经常会用到它，但是大多数时候我们甚至没有意识到这一点。但是，我们终究还是离不开它：如果我们想编写复杂且性能很好的 `React` 应用，就必须了解闭包。所以，今天我们一起来学习以下几点：

*   什么是闭包，它们是如何出现的，为什么我们需要它们。
    
*   什么是过期的闭包，它们为什么会出现。
    
*   React 中导致过期闭包的常见场景是什么，以及如何应对它们。
    

警告：如果你从未接触过 `React` 中的闭包，本文可能会让你脑浆迸裂，在阅读本文时，请确保随身携带足够的巧克力来刺激你的脑细胞。

一个常见的问题
-------

比如现在有这样一个场景：你正在实现一个带有几个输入字段的表单。其中一个字段是来自某个外部的组件库。你无法访问它的内部结构，所以也没办法解决它的性能问题。但你确实需要在表单中使用它，因此你决定用 `React.memo` 封装它，以便在表单中的状态发生变化时尽量减少它的重新渲染。类似这样：

```
const HeavyComponentMemo = React.memo(HeavyComponent);const Form = () => {  const [value, setValue] = useState();  return (    <>      <input        type="text"        value={value}        onChange={(e) => setValue(e.target.value)}      />      <HeavyComponentMemo />    </>  );};
```

这个 `Heavy` 组件只接受一个字符串 `props`（比如 `title`）和一个 `onClick` 回调。当你点击该组件中的 "完成" 按钮时，就会触发这个回调。如果你想在点击时提交表单数据。这也很简单：只需将 `title` 和 `onClick` 这两个 `props` 传递给它即可。

```
const HeavyComponentMemo = React.memo(HeavyComponent);const Form = () => {  const [value, setValue] = useState();  const onClick = () => {    // submit our form data here    console.log(value);  };  return (    <>      <input        type="text"        value={value}        onChange={(e) => setValue(e.target.value)}      />      <HeavyComponentMemo        title="Welcome to the form"        onClick={onClick}      />    </>  );};
```

现在，你又会面临一个新的问题。我们知道，`React.memo` 封装的组件上的每个 `props` 都必须是原始值，或者在重新渲染时是保持不变的。否则，`memoization` 就是不起作用的。所以，从技术上讲，我们需要将 `onClick` 包装为 `useCallback`：

```
const onClick = useCallback(() => {  // submit data here}, []);
```

但我们也知道，`useCallback` 钩子应在其依赖关系数组中声明所有依赖关系。因此，如果我们想在其中提交表单数据，就必须将该数据声明为依赖项：

```
const onClick = useCallback(() => {  // submit data here  console.log(value);  // adding value to the dependency}, [value]);
```

现在的难题是：即使我们的 `onClick` 被 `memo` 化了，但每次表单有重新输入时，它仍然会发生变化。因此，我们的性能优化毫无用处。

下面让我们寻找一下其他的解决方案。`React.memo` 有一个叫做比较函数的东西，它允许我们对 `React.memo` 中的 `props` 比较进行更精细的控制。通常，`React` 会自行比较前后的 `props` 。如果我们提供这个函数，它将依赖于其返回的结果。如果返回结果为 `true`，那么 `React` 就会知道 `props` 是相同的，组件就不应该被重新渲染，听起来正是我们需要的。我们只需要更新一个 `props` ，那就是我们的 `title` ，所以不会很复杂：

```
const HeavyComponentMemo = React.memo(  HeavyComponent,  (before, after) => {    return before.title === after.title;  },);
```

这样，完整的代码就是这样的：

```
const HeavyComponentMemo = React.memo(  HeavyComponent,  (before, after) => {    return before.title === after.title;  },);const Form = () => {  const [value, setValue] = useState();  const onClick = () => {    // submit our form data here    console.log(value);  };  return (    <>      <input        type="text"        value={value}        onChange={(e) => setValue(e.target.value)}      />      <HeavyComponentMemo        title="Welcome to the form"        onClick={onClick}      />    </>  );};
```

起作用了，我们在输入框中输入内容，`Heavy` 组件不会重新渲染，性能也不会受到影响。

但是我们又遇到了新的问题：如果在输入框中输入内容，然后按下按钮，我们在 `onClick` 中打印的值是 `undefined` 。但它不可能是 `undefined`，如果我在 `onClick` 之外添加 `console.log`，它就会正确打印。

```
// those one logs it correctlyconsole.log(value);const onClick = () => {  // this is always undefined  console.log(value);};
```

这是怎么回事呢？

这就是所谓的 "过期闭包" 问题。为了解决这个问题，我们首先需要了解一下 `JavaScript` 中最令人恐惧的话题：闭包及其工作原理。

JavaScript、作用域和闭包
-----------------

让我们从函数和变量开始，当我们在 `JavaScript` 中声明一个普通函数或者尖头函数会发生什么呢？

```
function something() {  //}const something = () => {};
```

通过这样的操作，我们创建了一个局部作用域：代码中的一个区域，其中声明的变量从外部是不可见的。

```
const something = () => {  const value = 'text';};console.log(value); // not going to work, "value" is local to "something" function
```

每次我们创建函数时都会发生这种情况。在另一个函数内部创建的函数将具有自己的局部作用域，对于外部函数不可见。

```
const something = () => {  const inside = () => {    const value = 'text';  };  console.log(value); // not going to work, "value" is local to "inside" function};
```

然而，在相反的方向就不一样了，最里面的函数可以访问到外部声明的所有变量。

```
const something = () => {  const value = 'text';  const inside = () => {    // perfectly fine, value is available here    console.log(value);  };};
```

这就是通过创建所谓的 “闭包” 来实现的。内部函数 “闭包” 了来自外部的所有数据，它本质上就是所有 “外部” 数据的快照，这些数据被冻结并单独存储在内存中。如果我们不是在 `something` 函数内创建该值，而是将其作为参数传递并返回内部函数呢：

```
const something = (value) => {  const inside = () => {    // perfectly fine, value is available here    console.log(value);  };  return inside;};
```

我们会得到这样的行为：

```
const first = something('first');const second = something('second');first(); // logs "first"second(); // logs "second"
```

我们调用 `something` 函数时传入值 `first`，并将结果分配给一个变量。结果是对内部声明的函数的引用，形成闭包。从现在开始，只要保存这个引用的第一个变量是存在的，我们传递给它的值 `“first”` 就会被冻结掉，并且内部函数将可以访问它。

第二次调用也是同样的情况：我们传递了一个不同的值，形成一个闭包，返回的函数也将永远可以访问该变量。

在 `something` 函数中本地声明的任何变量都是如此：

```
const something = (value) => {  const r = Math.random();  const inside = () => {    // ...  };  return inside;};const first = something('first');const second = something('second');first(); // logs random numbersecond(); // logs another random number
```

这就像拍摄一些动态场景的照片一样：只要按下按钮，整个场景就会永远 “冻结” 在照片中。下次按下按钮不会改变之前拍摄的照片中的任何内容。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdRzS2ZlJWZI0Af7ddia7vpTjYPGJ49rvvBNNTibtqfR5UlfwV9uhjqJwGAFE5GHLOFxD6hYdcDUfayQ/640?wx_fmt=png)

在 `React` 中，我们一直都在创建闭包，甚至没有意识到，组件内声明的每个回调函数都是一个闭包：

```
const Component = () => {  const onClick = () => {    // closure!  };  return <button onClick={onClick} />;};
```

`useEffect` 或 `useCallback` 钩子中的所有内容都是一个闭包：

```
const Component = () => {  const onClick = useCallback(() => {    // closure!  });  useEffect(() => {    // closure!  });};
```

它们都可以访问组件中声明的 `state`、`props` 和局部变量：

```
const Component = () => {  const [state, setState] = useState();  const onClick = useCallback(() => {    // perfectly fine    console.log(state);  });  useEffect(() => {    // perfectly fine    console.log(state);  });};
```

组件内的每个函数都是一个闭包，因为组件本身只是一个函数。

过期闭包的问题
-------

但是，以上所有的内容，如果你之前没有接触过闭包的话会觉得挺新奇的，但其实还是挺简单的，你多创建几个函数，就会变得很自然了。我们写了这么久的 `React` 甚至也不需要理解 “闭包” 的概念。

那么问题出在哪里呢？为什么闭包是 `JavaScript` 中最可怕的东西之一，并让如此多的开发者感到痛苦？

因为只要引起闭包的函数存在引用，闭包就会一直存在。而函数的引用只是一个值，可以赋给任何东西。

比如这个函数，它返回一个完全无辜的闭包：

```
const something = (value) => {  const inside = () => {    console.log(value);  };  return inside;};
```

问题是每次调用都会重新创建内部函数，如果我决定尝试缓存它，会发生什么情况呢？类似这样：

```
const cache = {};const something = (value) => {  if (!cache.current) {    cache.current = () => {      console.log(value);    };  }  return cache.current;};
```

从表面上看，这段代码并没有什么问题。我们只是创建了一个名为 `cache` 的外部变量，并将内部函数分配给 `cache.current` 属性。然后，我们就不会再每次都重新创建这个函数了，而是直接返回已经保存的值。

但是，如果我们尝试多调用几次，就会发现一个奇怪的现象：

```
const first = something('first');const second = something('second');const third = something('third');first(); // logs "first"second(); // logs "first"third(); // logs "first"
```

无论我们用不同的参数调用多少次 `something` 函数，记录的值始终是第一个参数！

我们刚刚就创建了一个所谓的 "过期闭包"。每个闭包在创建时都是冻结的，当我们第一次调用 `something` 函数时，我们创建了一个值变量中包含 `"first"` 的闭包。然后，我们把它保存在 `something` 函数之外的一个对象中。

当我们下一次调用 `something` 函数时，我们将返回之前创建的闭包，而不是创建一个带有新闭包的新函数。这个闭包会与 `"first"` 变量永远冻结在一起。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdRzS2ZlJWZI0Af7ddia7vpTj6QFwlhHNBxZ2m3croC042vf3ysQIoASnPJQm7ibjB4Ffomq1tf54EKA/640?wx_fmt=png)

为了修复这种问题，我们可以在每次值发生变化时重新创建函数及其闭包，类似这样：

```
const cache = {};let prevValue;const something = (value) => {  // check whether the value has changed  if (!cache.current || value !== prevValue) {    cache.current = () => {      console.log(value);    };  }  // refresh it  prevValue = value;  return cache.current;};
```

将值保存在变量中，以便我们可以将下一个值与前一个值进行比较。如果变量发生了变化，则刷新 `cache.current` 闭包。现在，它就会正确打印变量，如果我们比较具有相同值的函数，比较结果将返回 `true`：

```
const first = something('first');const anotherFirst = something('first');const second = something('second');first(); // logs "first"second(); // logs "second"console.log(first === anotherFirst); // will be true
```

React 中的过期闭包：useCallback
------------------------

我们刚刚实现了与 `useCallback` 钩子几乎一模一样的功能！每次使用 `useCallback` 时，我们都会创建一个闭包，并缓存传递给它的函数：

```
// that inline function is cached exactly as in the section beforeconst onClick = useCallback(() => {  }, []);
```

如果我们需要访问此函数内的 `state` 或 `props`，我们需要将它们添加到依赖项数组中：

```
const Component = () => {  const [state, setState] = useState();  const onClick = useCallback(() => {    // access to state inside    console.log(state);    // need to add this to the dependencies array  }, [state]);};
```

这个依赖关系数组会让 `React` 刷新缓存的闭包，就像我们在比较 `value !== prevValue` 时所做的一样。如果我忘记了这个数组，我们的闭包就会过期：

```
const Component = () => {  const [state, setState] = useState();  const onClick = useCallback(() => {    // state will always be the initial state value here    // the closure is never refreshed    console.log(state);    // forgot about dependencies  }, []);};
```

每次我们触发该回调时，所有将被打印的内容都是 `undefined`。

React 中的过期闭包：Refs
-----------------

在 `useCallback` 和 `useMemo` 钩子之后，引入过期闭包问题的第二个最常见的方法是 `Refs`。

如果我尝试对 `onClick` 回调使用 `Ref` 而不是 `useCallback` 钩子，会发生什么情况呢？有些文章会建议通过这样做来 `memoize` 组件上的 `props`。从表面上看，它确实看起来更简单：只需将一个函数传递给 `useRef` 并通过 `ref.current` 访问它，没有依赖性，不用担心。

```
const Component = () => {  const ref = useRef(() => {    // click handler  });  // ref.current stores the function and is stable between re-renders  return <HeavyComponent onClick={ref.current} />;};
```

然而，组件内的每个函数都会形成一个闭包，包括我们传递给 `useRef` 的函数。我们的 `ref` 在创建时只会初始化一次，并且不会自行更新。这基本上就是我们一开始创建的逻辑，只是我们传递的不是值，而是我们想要保留的函数。像这样：

```
const ref = {};const useRef = (callback) => {  if (!ref.current) {    ref.current = callback;  }  return ref.current;};
```

因此，在这种情况下，一开始（即组件刚刚初始化时）形成的闭包将会被保留，永远不会刷新。当我们试图访问存储在 `Ref` 中的函数内部的 `state` 或 `props` 时，我们只能得到它们的初始值：

```
const Component = ({ someProp }) => {  const [state, setState] = useState();  const ref = useRef(() => {    // both of them will be stale and will never change    console.log(someProp);    console.log(state);  });};
```

为了解决这个问题，我们需要确保每次我们试图访问的内容发生变化时，`ref` 值都会更新。本质上，我们需要实现 `useCallback` 钩子的依赖数组所做的事情。

```
const Component = ({ someProp }) => {  // initialize ref - creates closure!  const ref = useRef(() => {    // both of them will be stale and will never change    console.log(someProp);    console.log(state);  });  useEffect(() => {    // update the closure when state or props change    ref.current = () => {      console.log(someProp);      console.log(state);    };  }, [state, someProp]);};
```

React 中的过期闭包：React.memo
-----------------------

最后，我们回到文章的开头，回到引发这一切的谜团。让我们再来看看有问题的代码：

```
const HeavyComponentMemo = React.memo(  HeavyComponent,  (before, after) => {    return before.title === after.title;  },);const Form = () => {  const [value, setValue] = useState();  const onClick = () => {    // submit our form data here    console.log(value);  };  return (    <>      <input        type="text"        value={value}        onChange={(e) => setValue(e.target.value)}      />      <HeavyComponentMemo        title="Welcome to the form"        onClick={onClick}      />    </>  );};
```

每次点击按钮时，都会打印 "`undefined`" 。我们在 `onClick` 中的值从未更新过，你能告诉我为什么吗？

当然，这又是一个过期闭包。当我们创建 `onClick` 时，首先使用默认状态值（`undefined`）形成闭包。我们将该闭包与 `title` 属性一起传递给我们的 `Memo` 组件。在比较函数中，我们只比较了标题。它永远不会改变，它只是一个字符串。比较函数始终返回 `true`，`HeavyComponent` 永远不会更新，因此，它保存的是对第一个 `onClick` 闭包的引用，并具有冻结的 `undefined` 值。

既然我们知道了问题所在，那么该如何解决呢？说起来容易做起来难...

理想情况下，我们应该在比较函数中对每个 `props` 进行比较，因此我们需要在其中加入 `onClick`：

```
(before, after) => {  return (    before.title === after.title &&    before.onClick === after.onClick  );};
```

不过，在这种情况下，这意味着我们只是重新实现了 `React` 的默认行为，做的事情与不带比较函数的 `React.memo` 完全一样。因此，我们可以放弃它，只保留 `React.memo(HeavyComponent)`。

但这样做意味着我们需要将 `onClick` 包装为 `useCallback`。但这取决于 `state` ，我们又回到了原点：每次状态改变时，我们的 `HeavyComponent` 都会重新渲染，这正是我们想要避免的。

我们还可以尝试很多其他方法，但我们不必进行任何大量的重构就能摆脱闭包陷阱，有一个很酷的技巧可以帮助我们。

使用 Refs 逃离闭包陷阱
--------------

让我们暂时摆脱 `React.memo` 和 `onClick` 实现中的比较函数。只需一个具有 `state` 和 `memo` 化 `HeavyComponent` 的 `pure component` 即可：

```
const HeavyComponentMemo = React.memo(HeavyComponent);const Form = () => {  const [value, setValue] = useState();  return (    <>        <input type="text" value={value} onChange={(e) => setValue(e.target.value)} />        <HeavyComponentMemo title="Welcome to the form" onClick={...} />    </>  );}
```

现在我们需要添加一个 `onClick` 函数，该函数在重新渲染的时候会保持稳定，但也可以访问最新状态而无需重新创建。我们将把它存储在 `Ref` 中，所以我们暂时添加一个空的：

```
const Form = () => {  const [value, setValue] = useState();  // adding an empty ref  const ref = useRef();};
```

为了让函数能够访问最新状态，每次重新渲染时都需要重新创建函数，这是无法避免的，这也是闭包的本质，与 `React` 无关。我们应该在 `useEffect` 中修改 `Ref`，而不是直接在渲染中修改 `Ref`，所以我们可以这样做：

```
const Form = () => {  const [value, setValue] = useState();  // adding an empty ref  const ref = useRef();  useEffect(() => {    // our callback that we want to trigger    // with state    ref.current = () => {      console.log(value);    };    // no dependencies array!  });};
```

不带依赖数组的 `useEffect` 会在每次重新渲染时触发。这正是我们想要的，所以现在在我们的 `ref.current` 中，我们有一个每次重新渲染都会重新创建的闭包，因此打印的 `state` 始终是最新的。

但我们不能把 `ref.current` 直接传递给 `memoized` 组件。每次重新渲染时，这个值都会不同， `memoization` 将无法工作。

```
const Form = () => {  const ref = useRef();  useEffect(() => {    ref.current = () => {      console.log(value);    };  });  return (    <>      {/* Can't do that, will break memoization */}      <HeavyComponentMemo onClick={ref.current} />    </>  );};
```

所以，我们创建一个封装在 `useCallback` 中的空函数，并且不依赖于此函数。

```
const Form = () => {  const ref = useRef();  useEffect(() => {    ref.current = () => {      console.log(value);    };  });  const onClick = useCallback(() => {    // empty dependency! will never change  }, []);  return (    <>      {/* Now memoization will work, onClick never changes */}      <HeavyComponentMemo onClick={onClick} />    </>  );};
```

现在，`memoization` 可以完美地工作，因为 `onClick` 从未改变。但有一个问题：它什么也会不做。

这里有一个神奇的窍门：我们只需在 `memoized` 回调中调用 `ref.current` 即可：

```
useEffect(() => {  ref.current = () => {    console.log(value);  };});const onClick = useCallback(() => {  // call the ref here  ref.current();  // still empty dependencies array!}, []);
```

注意到 `ref` 并不在 `useCallback` 的依赖关系中吗？`ref` 本身是不会改变的。它只是 `useRef` 钩子返回的一个可变对象的引用。但是，当闭包冻结周围的一切时，并不会使对象不可变或被冻结。对象存储在内存的不同部分，多个变量可以包含对完全相同对象的引用。

```
const a = { value: 'one' };// b is a different variable that references the same objectconst b = a;
```

如果我通过其中一个引用更改对象，然后通过另一个引用访问它，更改就会出现：

```
a.value = 'ConardLi';console.log(b.value); // will be "ConardLi"
```

在我们的案例中，这种情况并没有发生：我们在 `useCallback` 和 `useEffect` 中拥有完全相同的引用。因此，当我们更改 `useEffect` 中 `ref` 对象的 `current` 属性时，我们可以在 `useCallback` 中访问该属性，这个属性恰好是一个捕获了最新状态数据的闭包。完整代码如下：

```
const Form = () => {  const [value, setValue] = useState();  const ref = useRef();  useEffect(() => {    ref.current = () => {      // will be latest      console.log(value);    };  });  const onClick = useCallback(() => {    // will be latest    ref.current?.();  }, []);  return (    <>      <input        type="text"        value={value}        onChange={(e) => setValue(e.target.value)}      />      <HeavyComponentMemo        title="你好 code秘密花园"        onClick={onClick}      />    </>  );};
```

现在，我们获得了两全其美的结果：`Heavy` 组件被适当地 `memoization`，不会因为每次状态变化而重新渲染。它的 `onClick` 回调可以访问组件中的最新数据，而不会破坏 `memoization`。现在，我们可以安全地将所需的一切发送到后端！

最后
--

下面我们再总结一下本文中提到的知识点：

*   每次在另一个函数内部创建一个函数时，都会形成闭包。
    
*   由于 `React` 组件只是函数，因此内部创建的每个函数都会形成闭包，包括 `useCallback` 和 `useRef` 等钩子。
    
*   当一个形成闭包的函数被调用时，它周围的所有数据都会被 "冻结"，就像快照一样。
    
*   要更新这些数据，我们需要重新创建 "闭包" 函数。这就是使用 `useCallback` 等钩子的依赖关系允许我们做的事情。
    
*   如果我们错过了依赖关系，或者没有刷新分配给 `ref.current` 的闭包函数，闭包就会 "过期"。
    
*   在 `React` 中，我们可以利用 `Ref` 是一个可变对象这一特性，从而摆脱 "过期闭包" 的问题。我们可以在过期闭包之外更改 `ref.current`，然后在闭包之内访问它，就可以获取最新的数据。
    

`React`  太复杂了，还是用 `Vue` 吧 ... 你怎么看？唤应在评论区留言。

本文译自：https://www.developerway.com/posts/fantastic-closures