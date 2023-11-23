> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/qrpwgUKlow7EjZO7WkJUew)

> 原文链接： Understanding useMemo and useCallback[1] 翻译原文: https://juejin.cn/post/7165338403465068552 译者: oil 欧哟

前言
--

作为一个 React 开发者，如果你一直觉得 `useMemo` 和 `useCallback` 这两个 Hook 比较难以理解，那么别害怕，事实上很多人都如此。我和其他公司很多的 React 开发者交流过，大多数对这两个 Hook 都是一知半解的状态。

这篇文章就为你答疑解惑，为大家介绍这两个 Hook 的具体作用，它们的实现原理以及在实际开发中如何应用。

> 这篇文章更适合初 / 中级 React 开发者用于加深对 React 的理解，如果你才刚刚开始学习 React ，那么你也可以先将这篇文章收藏起来，在你对 React 有了一定使用经验后再回来学习。

基础概念
----

我们先从 `useMemo` 开始介绍，useMemo 的基本概念就是：**它能帮助我们 “记录” 每次渲染之间的计算值**。这句话可能有些抽象，想要理解它需要你对 React 复杂的工作原理有一定的心智模型。所以我们先讲讲 React 的基本工作原理。

React 所做的主要事情是让我们的 **UI** 与我们的 **状态** 保持同步，而要实现它们的同步，就需要执行一个叫做 “re-render” (重新渲染) 的操作。

每一次 **重新渲染** 都是一次快照，它基于当前应用程序的状态告诉了应用程序的 UI 在某一特定时刻应该是什什么样的。我们可以把它想象成一叠照片，每张照片都记录了在每个状态变量的特定值下事物的样子。

举个例子，我们先定义一个状态 a ，它的初始值是 `hello`，我们先把它渲染到页面上，这时候我们的 UI 上就会有一行 `hello`

```
const [a, setA] = useState("hello")return (<span>{a}</span>)
```

如果我们将 `a` 设置为 `world`，

```
setA("world")
```

此时页面上还是 ”hello“，为了保持状态和 UI 同步，就需要触发一次 **重新渲染** ，这样 UI 上也变为了 “hello”，当然重新渲染不需要我们自己执行 ，你在使用 `setA` 时 React 就会帮我们处理。

每一次 **重新渲染** 都会根据当前的状态产生一个 DOM 应该是什么样子的心理图景。在上面的例子中，我们的状态被描绘成 HTML，但本质上它是一堆 JS 对象。如果了解过的话就知道它也被称为 **虚拟 DOM**。

我们并不需要告诉 React 有哪些 DOM 节点需要改变。相反，我们告诉 React 的是基于当前状态渲染的 UI 应该是什么样的。通过重新渲染，React 创建了一个新的快照，它可以通过比较快照找出需要改变的地方，就像玩一个 "找不同" 的游戏。

React 在你开箱使用时就进行了大量的优化，所以一般来说，重新渲染并不是啥大问题。但是，在某些情况下，这些快照确实需要一段时间来创建。这可能会导致性能问题，比如当用户执行某些操作后，UI 却不能够快速的同步修改。

所以从本质上，`useMemo` 和 `useCallback` 都是用来帮助我们优化 **重新渲染** 的工具 Hook。它们通过以下两种方式实现优化的效果。

*   减少在一次渲染中需要完成的工作量。
    
*   减少一个组件需要重新渲染的次数。
    

下面我们通过一些实际场景介绍一下这两个 API。

1. 需要进行大量计算的场景
--------------

假设我们写一个工具来帮助用户找到 0 和一个用户传入的数字参数 `selectedNum` 之间的所有质数

> 质数就是一个只能被 1 和它自己整除的数字，比如 17。

下面是实现的代码:

```
import React from 'react';function App() {  const [selectedNum, setSelectedNum] = React.useState(100);    // We calculate all of the prime numbers between 0 and the  // user's chosen number, `selectedNum`:  const allPrimes = [];  for (let counter = 2; counter < selectedNum; counter++) {    if (isPrime(counter)) {      allPrimes.push(counter);    }  }    return (    <>      <form>        <label htmlFor="num">Your number:</label>        <input          type="number"          value={selectedNum}          onChange={(event) => {            // 为了防止电脑烧起来，我们限制一下传入的值最大为 100k            let num = Math.min(100_000, Number(event.target.value));                        setSelectedNum(num);          }}        />      </form>      <p>        There are {allPrimes.length} prime(s) between 1 and {selectedNum}:        {' '}        <span class>          {allPrimes.join(', ')}        </span>      </p>    </>  );}// isPrime 用于计算传入的参数是否为质数function isPrime(n){  const max = Math.ceil(Math.sqrt(n));    if (n === 2) {    return true;  }    for (let counter = 2; counter <= max; counter++) {    if (n % counter === 0) {      return false;    }  }  return true;}export default App;
```

你不需要看懂上面的每一行代码，这里分析一下以上代码的重点：

*   我们维护了一个状态 `selectedNum`
    
*   我们使用一个 `for` 循环手动计算 0 和 `selectedNum` 之间的所有质数
    
*   我们渲染了一个输入框，用户通过输入改变 `selectedNum` 的值
    
*   我们在页面中向用户展示了所有计算出来的质数。
    

**以上这段代码执行时需要进行大量的计算**。如果用户选择了一个值很大的 selectedNum，我们将需要遍历数以万计的数字去判断每一个是否为质数。而且即使有比我上面使用的算法更有效的素数判断算法，但肯定也是需要进行大量计算的。

在实际开发中我们很有可能遇到类似的场景。但是有时候我们并不需要重新计算，但仍然执行了计算操作，就有会遇到一些性能问题。比如下面这种情况：

```
import React from 'react';
import format from 'date-fns/format';

function App() {
  const [selectedNum, setSelectedNum] = React.useState(100);
  
  // `time` 是一个状态变量，每秒钟变化一次，所以它总是与当前时间同步
  const time = useTime();
  
  const allPrimes = [];
  for (let counter = 2; counter < selectedNum; counter++) {
    if (isPrime(counter)) {
      allPrimes.push(counter);
    }
  }
  
  return (
    <>
      <p class>
        {format(time, 'hh:mm:ss a')}
      </p>
      <form>
        <label htmlFor="num">Your number:</label>
        <input
          type="number"
          value={selectedNum}
          onChange={(event) => {
            // 为了防止电脑烧起来，我们限制一下传入的值最大为 100k
            let num = Math.min(100_000, Number(event.target.value));
            
            setSelectedNum(num);
          }}
        />
      </form>
      <p>
        There are {allPrimes.length} prime(s) between 1 and {selectedNum}:
        {' '}
        <span class>
          {allPrimes.join(', ')}
        </span>
      </p>
    </>
  );
}

function useTime() {
  const [time, setTime] = React.useState(new Date());
  
  React.useEffect(() => {
    const intervalId = window.setInterval(() => {
      setTime(new Date());
    }, 1000);
  
    return () => {
      window.clearInterval(intervalId);
    }
  }, []);
  
  return time;
}

// isPrime 用于计算传入的参数是否为质数
function isPrime(n){
  const max = Math.ceil(Math.sqrt(n));
  
  if (n === 2) {
    return true;
  }
  
  for (let counter = 2; counter <= max; counter++) {
    if (n % counter === 0) {
      return false;
    }
  }

  return true;
}

export default App;
```

现在代码里定义了两个状态：`selectedNum` 和 `time`。`time` 每秒钟改变一次，并且在页面的右上角渲染出来。

**这时我们会发现一个问题**：即便我们没有改变 `selectedNum` ，但是由于 `time` 的改变会引起重新渲染，而重新渲染又会导致质数的大量计算，这样就浪费了很多性能。

Javascript 运行时是单线程的，如果我们反复执行这段代码，就会一直有一个计算任务占用着线程。这会导致我们其他任务没法快速执行，整个应用会让人感觉很迟钝，尤其是在低性能的设备上感知更加明显。

那么我们该如何 **绕过** 这个计算的事件呢，如果我们已经有了某个数字的质数列表，为什么不重复使用这个值，而是每次都从头计算呢？

这就是 `useMemo` 能够帮助我们做到的事情，如下例所示：

```
const allPrimes = React.useMemo(() => {
  const result = [];
  for (let counter = 2; counter < selectedNum; counter++) {
    if (isPrime(counter)) {
      result.push(counter);
    }
  }
  return result;
}, [selectedNum]);
```

`useMemo` 接受两个参数：

1.  需要执行的一些计算处理工作，包裹在一个函数中
    
2.  一个依赖数组
    

在组件挂载的过程中，当这个组件第一次被渲染时，React 都会调用这个函数来执行这段计算逻辑，计算所有的质数。无论我们从这个函数中返回什么值，都会分配给 `allPrimes` 变量。

然而，对于每一个后续的渲染，React 都要从以下两种情况中做出选择：

1.  再次调用 `useMemo` 中的计算函数，重新计算数值
    
2.  重复使用上一次已经计算出来的数据
    

为了做出一个正确的选择，React 会判断你传入的依赖数组，这个数组中的每个变量是否在两次渲染间 **值是否改变了** ，如果发生了改变，就重新执行计算的逻辑去获取一个新的值，否则不重新计算，直接返回上一次计算的值。

**`useMemo` 本质上就像一个小的缓存，而依赖数组就是缓存的失效策略。**

在上面的例子中，其实本质上是在说 “只有当 `selectedNum` 的值变化时才重新计算质数列表 “。 当组件因为其他情况重新渲染，例如状态 `time` 的值改变了，`useMemo` 就会忽略这个计算函数，直接返回之前缓存的值。

这种缓存的过程通常被称为 **memoization**，这就是为什么这个钩子被称为 **“useMemo”**。

### 另一种解决方法

`useMemo` 钩子确实可以帮助我们避免这里不必要的计算……，但它真的是这里最好的解决方案吗？

通常情况下，我们都会通过一些重构来避免掉需要使用 useMemo 进行优化的场景。如下例：

```
//App.jsimport React from 'react';import { getHours } from 'date-fns';import Clock from './Clock';import PrimeCalculator from './PrimeCalculator';// 将 PrimeCalculator 转换为纯组件const PurePrimeCalculator = React.memo(PrimeCalculator);function App() {  const time = useTime();  // 基于当前时间动态计算一个背景颜色  const backgroundColor = getBackgroundColorFromTime(time);  return (    <div style={{ backgroundColor }}>      <Clock time={time} />      <PurePrimeCalculator />    </div>  );}const getBackgroundColorFromTime = (time) => {  const hours = getHours(time);    if (hours < 12) {    // A light yellow for mornings    return 'hsl(50deg 100% 90%)';  } else if (hours < 18) {    // Dull blue in the afternoon    return 'hsl(220deg 60% 92%)'  } else {    // Deeper blue at night    return 'hsl(220deg 100% 80%)';  }}function useTime() {  const [time, setTime] = React.useState(new Date());    React.useEffect(() => {    const intervalId = window.setInterval(() => {      setTime(new Date());    }, 1000);      return () => {      window.clearInterval(intervalId);    }  }, []);    return time;}export default App;
```

```
// PrimeCalculator.js
import React from 'react';

function PrimeCalculator() {
  const [selectedNum, setSelectedNum] = React.useState(100);

  const allPrimes = [];
  for (let counter = 2; counter < selectedNum; counter++) {
    if (isPrime(counter)) {
      allPrimes.push(counter);
    }
  }
  
  return (
    <>
      <form>
        <label htmlFor="num">Your number:</label>
        <input
          type="number"
          value={selectedNum}
          onChange={(event) => {
            // 为了防止电脑烧起来，我们限制一下传入的值最大为 100k
            let num = Math.min(100_000, Number(event.target.value));
            
            setSelectedNum(num);
          }}
        />
      </form>
      <p>
        There are {allPrimes.length} prime(s) between 1 and {selectedNum}:
        {' '}
        <span class>
          {allPrimes.join(', ')}
        </span>
      </p>
    </>
  );
}

function isPrime(n){
  const max = Math.ceil(Math.sqrt(n));
  
  if (n === 2) {
    return true;
  }
  
  for (let counter = 2; counter <= max; counter++) {
    if (n % counter === 0) {
      return false;
    }
  }

  return true;
}

export default PrimeCalculator;
```

```
// Clock.jsimport React from 'react';import format from 'date-fns/format';function Clock() {  const time = useTime();    return (    <p class>      {format(time, 'hh:mm:ss a')}    </p>  );}import React from 'react';import format from 'date-fns/format';function Clock({ time }) {  return (    <p class>      {format(time, 'hh:mm:ss a')}    </p>  );}export default Clock;
```

我将之前的例子抽离为了两个单独的组件 `Clock` 和 `PrimeCalculator`，从 App 组件抽离出来后，这两个组件各自维护自己的状态数据，即使其中一个组件重新渲染了也不会影响另外一个。

这里我们使用 `React.memo` 包裹着组件保护它不受到无关状态更新的影响。只有在 `PurePrimeCalculator` 只会在收到新数据或内部状态发生变化时重新渲染。这种组件被称为 **纯组件**。本质上，我们告诉 React 这个组件在 **给定相同输入的情况下总是会产生相同的输出** ，并且我们可以跳过没有 props 和状态改变的重渲染。

> 在上例中我们将组件引入 App.tsx 后再通过 `React.memo` 进行包裹，在实际开发中我们更多的是在组件 export 的时候就使用 `React.memo` 进行包裹，这样可以保证组件一直是纯组件。上例只是为了更加清楚的在 App.tsx 中展示所有内容。

**这里有一个有趣的视角转变：** 在前面的例子中，我们是缓存了计算质数的结果。然而在重构后，我们已经缓存了了整个组件。但无论使用哪种方式，昂贵的计算操作只有在 `selectedNum` 的值改变时才会执行了，这里两种方法没有优劣之分，根据实际情境来使用即可。

但在实际开发中你可能会发现 **纯组件也经常发生重新渲染**，即便它并没有发生什么改变。接下来就为大家介绍可以使用 `useMemo` 来解决的第二种场景。

2. 引用保留
-------

在下面的示例中，我们创建了一个 `Boxes` 组件用于展示几个不同颜色的容器，纯粹是用于装饰。然后我们还定义了一个跟 `Boxes` 组件没啥关系的 `user's name` 变量。

```
// App.jsximport React from 'react';import Boxes from './Boxes';function App() {  const [name, setName] = React.useState('');  const [boxWidth, setBoxWidth] = React.useState(1);    const id = React.useId();    // Try changing some of these values!  const boxes = [    { flex: boxWidth, background: 'hsl(345deg 100% 50%)' },    { flex: 3, background: 'hsl(260deg 100% 40%)' },    { flex: 1, background: 'hsl(50deg 100% 60%)' },  ];    return (    <>      <Boxes boxes={boxes} />            <section>        <label htmlFor={`${id}-name`}>          Name:        </label>        <input          id={`${id}-name`}          type="text"          value={name}          onChange={(event) => {            setName(event.target.value);          }}        />        <label htmlFor={`${id}-box-width`}>          First box width:        </label>        <input          id={`${id}-box-width`}          type="range"          min={1}          max={5}          step={0.01}          value={boxWidth}          onChange={(event) => {            setBoxWidth(Number(event.target.value));          }}        />      </section>    </>  );}export default App;
```

```
//Boxes.jsximport React from 'react';function Boxes({ boxes }) {  return (    <div class>      {boxes.map((boxStyles, index) => (        <div          key={index}          class          style={boxStyles}        />      ))}    </div>  );}export default React.memo(Boxes);
```

效果如下图：

![](https://mmbiz.qpic.cn/mmbiz_png/YBFV3Da0Nwu2Wapz1IX4v4hK2exuCTuQotic1YqCSB7LIap7iaciaEjEuYicDzn15cwQFTfmYZTsf1GtnGlHS4oZqw/640?wx_fmt=png)image.png

我们使用了 `React.memo` 包裹着 `Boxes` 组件，使它成为一个纯组件，这说明只有在 props 更改时它才会重新渲染

然而实际使用时你会发现，当用户输入 Name 时，`Boxes` 也会重新渲染。这时候你可能会好奇，有没有搞错？！为什么我们的 `React.memo()` 没有在这里保护我们的组件？

`Boxes` 组件只有 1 个 prop `boxes`，看似我们在每次渲染时都为其提供了完全相同的数据。它每次渲染也总是一样的：一个红色的盒子，一个宽紫色的盒子，一个黄色的盒子。我们确实有一个 `boxWidth` 会影响 `boxes` 数组的状态变量，但我们没有改变它！

问题在于每次 React 重新渲染时，都会重新产生一个 `boxes` 数组，这个数组的值虽然每一次重新渲染都是相同的，但是它的 **引用** 却是不同的。

这里暂时抛开 React 单纯讨论 JavaScript 可能比较好理解，让我们看一个类似的例子：

```
function getNumbers() {  return [1, 2, 3];}const firstResult = getNumbers();const secondResult = getNumbers();console.log(firstResult === secondResult);
```

你怎么看？`firstResult` 等于 `secondResult` ? 从某种意义上说，它们是相同的。因为两个变量具有相同的结构`[1, 2, 3]`。但这不是 `===` 操作符实际判断的标准。相反，`===` 判断的是两个表达式 **是否完全相同**。

我们创建了两个不同的数组。它们可能包含相同的内容，但它们不是同一个数组，就像 **两个同卵双胞胎不是同一个人一样。**

![](https://mmbiz.qpic.cn/mmbiz_png/YBFV3Da0Nwu2Wapz1IX4v4hK2exuCTuQw2PyQibGuAw08bSmD7scHyN2pGmm2woK2gOczmxh7LPn5hsey0ICtuw/640?wx_fmt=png)image.png

每次我们调用 `getNumbers` 函数时都会创建一个全新的数组，一个保存在计算机内存中的独特数组。如果我们多次调用它，我们将在内存中存储该数组的多个副本。

请注意，简单的数据类型比如 **字符串、数字和布尔值** 可以通过值进行比较。但是当涉及到数组和对象时，它们只能通过引用进行比较。这部分内容大家可以参考其他讲引用类型的文章，这里不详细展开。

回到 React， 我们的 `Boxs` React 组件也是一个 JavaScript 函数。当我们渲染它时，我们调用以下函数:

```
// 每次渲染组件都会调用 App 函数function App() {  // ...创建一个全新的数组...  const boxes = [    { flex: boxWidth, background: 'hsl(345deg 100% 50%)' },    { flex: 3, background: 'hsl(260deg 100% 40%)' },    { flex: 1, background: 'hsl(50deg 100% 60%)' },  ];  // ...然后将数组作为 prop 传入组件!  return (    <Boxes boxes={boxes} />  );}
```

当 `name` 状态更改时，我们的 App 组件将重新渲染，该组件将重新运行所有代码，并构建一个全新的 `boxes` 数组，并将其传递到 `Boxes` 组件。此时 `Boxes` 组件重新渲染，因为我们给了它一个全新的数组！

`boxes` 数组的结构在不同的渲染之间虽然没有变化，但是这不相关。React 只知道 `Boxes` 组件 prop 收到了一个新创建的，从未见过的数组。

为了解决这个问题，我们可以使用 `useMemo` hook:

```
const boxes = React.useMemo(() => {  return [    { flex: boxWidth, background: 'hsl(345deg 100% 50%)' },    { flex: 3, background: 'hsl(260deg 100% 40%)' },    { flex: 1, background: 'hsl(50deg 100% 60%)' },  ];}, [boxWidth]);
```

这里不像我们之前的例子，相比于质数，这里我们不需要担心计算的代价。我们的唯一目标是保留对特定数组的引用。我们将 `boxWidth` 列为一个依赖项，因为我们确实希望在用户调整红色框的宽度时重新渲染 `Box` 组件。

这里有一个图可以帮助你理解。在此之前，我们创建了一个全新的数组，作为每张快照的一部分:

![](https://mmbiz.qpic.cn/mmbiz_png/YBFV3Da0Nwu2Wapz1IX4v4hK2exuCTuQIw1lbhwvuz7koAzks4y8ibUqLYayEfdetmM7udBbY7czPkpdpAjyOYQ/640?wx_fmt=png)image.png

然而通过 `useMemo` 我们复用了一个之前创建的 `boxes` 数组。

![](https://mmbiz.qpic.cn/mmbiz_png/YBFV3Da0Nwu2Wapz1IX4v4hK2exuCTuQZtg5Un4bJ27nib9NE5Yiao54pQia3IKjUme9qFnLib1wl3e3I8OAsTjL5Q/640?wx_fmt=png)image.png

通过在多次渲染中保留相同的引用，我们允许纯组件以我们想要的方式运作，忽略掉那些不影响用户界面的渲染。

useCallback hook
----------------

好不容易介绍完了 `useMemo`，那么 `useCallback` 呢？

简单概括：`useMemo` 和 `useCallback` 是一个东西，只是将返回值从 **数组 / 对象** 替换为了 **函数**。

函数是与数组和对象类似，都是通过引用而不是通过值进行比较的:

```
const functionOne = function() {  return 5;};const functionTwo = function() {  return 5;};console.log(functionOne === functionTwo); // false
```

这意味着如果我们在组件中定义一个函数，它将在每个渲染中重新生成，每次生成一个相同但是唯一的函数。

让我们看一个例子:

```
//App.jsximport React from 'react';import MegaBoost from './MegaBoost';function App() {  const [count, setCount] = React.useState(0);  function handleMegaBoost() {    setCount((currentValue) => currentValue + 1234);  }  return (    <>      Count: {count}      <button        onClick={() => {          setCount(count + 1)        }}      >        Click me!      </button>      <MegaBoost handleClick={handleMegaBoost} />    </>  );}export default App;
```

```
// MegaBoost.jsximport React from 'react';function MegaBoost({ handleClick }) {  console.log('Render MegaBoost');    return (    <button      class      onClick={handleClick}    >      MEGA BOOST!    </button>  );}export default React.memo(MegaBoost);
```

效果如图：

![](https://mmbiz.qpic.cn/mmbiz_png/YBFV3Da0Nwu2Wapz1IX4v4hK2exuCTuQMkhcUedHmAflcECTFEibEnCcbt897CW8mluzzwT4BurfQturWB2EtWA/640?wx_fmt=png)image.png

这段代码写了一个经典的计数器 app，但是带有一个特殊的 “Mega Boost” 按钮。点击按钮会大量增加计数，以防您赶时间并且不想多次单击标准按钮。

由于使用了 `React.memo` 进行包裹, `MegaBoost` 组件是纯组件, 它虽然不依赖于 `count` …… **但它会在更改时重新渲染 `count`！**

就像我们在前面 `boxes` 数组中看到的那样，这里的问题是我们在每次渲染时都生成了一个全新的函数。如果我们渲染 3 次，我们将创建 3 个独立 `handleMegaBoost` 的函数，突破 `React.memo` 的保护。

如果使用我们前面所学到的 `useMemo`，我们可以解决这样的问题：

```
const handleMegaBoost = React.useMemo(() => {  return function() {    setCount((currentValue) => currentValue + 1234);  }}, []);
```

这里不是返回一个数组，而是返回一个 **函数**。然后将该函数存储在 `handleMegaBoost` 变量中。

这种写法虽然也可以，但是有一种更好的方法：

```
const handleMegaBoost = React.useCallback(() => {  setCount((currentValue) => currentValue + 1234);}, []);
```

`useCallback` 的用途与 `useMemo` 相同，但它是专门为函数构建的。我们直接给返回它一个函数，它会记住这个函数，在渲染之间线程化它。

换句话说就是以下的两种实现方式的效果是相同的：

```
React.useCallback(function helloWorld(){}, []);// ...功能相当于:React.useMemo(() => function helloWorld(){}, []);
```

**`useCallback` 是一种语法糖**，它的存在存粹是为了让我们在缓存回调函数的时候可以方便点。

当使用这些 Hook 时
------------

好了，我们已经学习了 `useMemo` 和 `useCallback` 时如何允许我们在多次渲染之间线程化引用，以复用复杂的计算或者避免破坏纯组件。

但还有一个问题是: **我们应该在什么情况下使用这两个 Hook ？**

在我个人看来，将每个对象 / 数组 / 函数包装在这些 hook 是在浪费时间。在大多数情况下，这些优化的好处几乎可以忽略不计; 因为 React 内部是高度优化的，并且 **重新渲染通常并不像我们通常认为的那样慢或昂贵！**

使用这些 hook 的最佳方法是响应问题。如果你注意到你的 app 变得有些迟钝，你可以使用 React Profiler 来寻找慢速渲染。在某些情况下，可以通过重构 app 来提高性能。在其他情况下，`useMemo` 和 `useCallback` 可以帮助加快速度。

也就是说，在某些情况下，我确实会先发制人地应用这些 hook。

> **未来可能会发生的改变**
> 
> React 团队正在积极研究是否有可能在编译步骤中 “自动缓存” 代码。虽然它仍然处于研究阶段，但是通过早期的实验看起来很有希望。
> 
> 也许在未来这些优化 React 都会为我们提前做好，但在此之前我们还是得自己去做一些优化
> 
> 要了解更多信息，可以看看黄玄的这个演讲 “React without memo”[2]

### 通用自定义 hook

我最喜欢的自定义 hook 之一是 `useToggle`，这是一个友好的助手，其工作方式几乎与 useState 完全相同，但只能在 true 和 false 之间切换状态变量:

```
function App() {  const [isDarkMode, toggleDarkMode] = useToggle(false);  return (    <button onClick={toggleDarkMode}>      Toggle color theme    </button>  );}
```

这里是这个自定义 hook 的代码实现：

```
function useToggle(initialValue) {  const [value, setValue] = React.useState(initialValue);    const toggle = React.useCallback(() => {    setValue(v => !v);  }, []);    return [value, toggle];}
```

注意这里的 `toggle` 函数使用了 `useCallback` 进行缓存。

当咱们构建这样的自定义可复用 hook 时，我希望使它们尽可能高性能，因为我不知道它们将来在哪里使用。在 95% 的情况下，这可能是过度封装的，但是如果我使用这个 hook **30** 或 **40** 次，这将很有可能有助于提高我们的 app 的性能。

### 内部 context providers

当我们通过 context 在组件之间共享数据时，通常会传递一个大的对象作为 `value` 属性。

一般来说，将这个对象缓存起来是个好方法:

```
const AuthContext = React.createContext({});function AuthProvider({ user, status, forgotPwLink, children }){  const memoizedValue = React.useMemo(() => {    return {      user,      status,      forgotPwLink,    };  }, [user, status, forgotPwLink]);    return (    <AuthContext.Provider value={memoizedValue}>      {children}    </AuthContext.Provider>  );}
```

这样写有什么好处呢？因为可能有几十个纯组件使用这个 context 。如果没有使用 `useMemo`，那么当 `AuthProvider` 的父组件恰好重新渲染时，这些使用 context 组件都将被迫重新渲染。

React 的乐趣
---------

恭喜你看到了这里，我知道这里面可能有些内容你从未了解过。这两个 hook 确实是比较棘手，毕竟 React 本身就是庞大且复杂的，是一个上手难度比较高的工具！

但事实是: 如果你能克服最初的困难，使用 React 绝对是一种乐趣。

我从 2015 年开始使用 React，它已经成为我最喜欢的构建复杂用户界面和 Web 应用程序的方式。我已经尝试了几乎所有的 JS 框架，但是我觉得它们的效率都不如 React 的效率。

如果你觉得这篇博客文章哪怕只有一点点帮助，你都会从中学到很多东西。

### 参考资料

[1]

https://www.joshwcomeau.com/react/usememo-and-usecallback/: https://www.joshwcomeau.com/react/usememo-and-usecallback/

[2]

https://www.youtube.com/watch?v=lGEMwh32soc: https://www.youtube.com/watch?v=lGEMwh32soc

```
   “分享、点赞、在看” 支持一波👍

```