> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/lxzMy26OEO_v_JvTlh4Kpw)

深入了解 useMemo 和 useCallback
==========================

许多人对 `useMemo` 和 `useCallback`的理解和使用都不太正确，他们都对这两个钩子感到困惑。本文中的目标就是要澄清所有这些困惑。本文将学习它们是做什么的，为什么它们是有用的，以及如何最大限度地利用它们。

本文的目的是帮助初学者 or 中级 React 开发人员更好地使用 React。如果你刚刚开始使用 React，你可能会希望将这篇文章收藏起来，几周后再回来看它！

1. 基本思想
-------

我们从 `useMemo` 开始。`useMemo` 的基本思想是它允许我们在渲染之间 “记住” 计算值。这个定义需要一些解释，我们先来解决这个问题。

React 做的主要事情是保持 UI 与应用程序状态同步。它用来做这件事的工具叫做 “re-render”。基于当前应用程序状态，每次重新呈现都是应用程序 UI 在给定时刻应该是什么样子的快照。我们可以把它想象成一堆照片，每一张照片都记录了给定每个状态变量的特定值时事物的样子。

每次 “re-render” 都会根据当前状态在脑海中生成 DOM 应该是什么样子的图像。但实际上它是一堆 JS 对象，被称为“**「virtual DOM」**”。

我们不直接告诉 React 需要更改哪些 DOM 节点。相反，我们根据当前状态告诉 React UI 应该是什么样子。通过重新渲染，React 创建一个新的快照，它可以通过比较快照找出需要更改的内容，就像玩 “寻找差异” 游戏一样。

React 在开箱即用时进行了大量优化，所以通常情况下，重新渲染不是什么大问题。但是，在某些情况下，创建这些快照确实需要一些时间。这可能会导致性能问题，比如 UI 在用户执行操作后更新不够快。

而 `useMemo` 和 `useCallback` 是用来帮助我们优化重渲染的工具。他们通过两种方式做到这一点：

1.  减少在给定渲染中需要完成的工作量。
    
2.  减少组件需要重新呈现的次数。
    

让我们通过下面的栗子来理解它们吧。

2. 示例 1：大量的计算
-------------

假设我们正在构建一个工具来帮助用户查找 0 到 `selectedNum` 之间的所有素数，其中 `selectedNum` 是用户提供的值。**「质数是只能被 1 和自身整除的数，比如 17。」**下面是一个可能的实现：

```
import React from 'react';function App() {  // 存储用户所选号码的状态。  const [selectedNum, setSelectedNum] = React.useState(100);  // 计算从 0 到用户选择的数字 selectedNum 之间的所有素数  const allPrimes = [];  for (let counter = 2; counter < selectedNum; counter++) {    if (isPrime(counter)) {      allPrimes.push(counter);    }  }  return (    <>      <form>        <label htmlFor="num">Your number:</label>        <input          type="number"          value={selectedNum}          onChange={(event) => {            // 为了防止太大，我们将最大值设定在10万            let num = Math.min(100_000, Number(event.target.value));            setSelectedNum(num);          }}        />      </form>      <p>        There are {allPrimes.length} prime(s) between 1 and {selectedNum}:{' '}        <span class>{allPrimes.join(', ')}</span>      </p>    </>  );}// 计算给定数字是否是素数的 Helper 函数function isPrime(n) {  const max = Math.ceil(Math.sqrt(n));  if (n === 2) {    return true;  }  for (let counter = 2; counter <= max; counter++) {    if (n % counter === 0) {      return false;    }  }  return true;}export default App;
```

我们有一个状态，一个叫做 `selectedNum` 的数字。使用 `for` 循环，我们手动计算 0 到 `selectedNum` 之间的所有素数。我们呈现一个受控制的数字输入，因此用户可以更改 `selectedNum` 。我们向用户显示我们计算的所有质数。

这段代码需要大量的计算。如果用户选择一个较大的 `selectedNum`，我们将需要遍历成千上万个数字，检查是否每个数字都是素数。而且，虽然有比我上面使用的更有效的质数检查算法，但它总是需要大量的计算。

有时我们确实需要执行这个计算，比如当用户选择一个新的 `selectedNum` 时。但是我们可能会遇到一些性能问题，如果我们在不需要做的时候无偿地做这项工作。

例如，让我们假设我们的例子还包含一个数字时钟:

```
import React from 'react';import format from 'date-fns/format';function App() {  const [selectedNum, setSelectedNum] = React.useState(100);    // time 是一个每秒改变一次的状态变量，因此它总是与当前时间同步。  const time = useTime();    // 计算所有质数（与前面的示例相同）  const allPrimes = [];  for (let counter = 2; counter < selectedNum; counter++) {    if (isPrime(counter)) {      allPrimes.push(counter);    }  }    return (    <>      <p class>        {format(time, 'hh:mm:ss a')}      </p>      <form>        <label htmlFor="num">Your number:</label>        <input          type="number"          value={selectedNum}          onChange={(event) => {            // 为了防止太大，我们将最大值设定在10万            let num = Math.min(100_000, Number(event.target.value));            setSelectedNum(num);          }}        />      </form>      <p>        There are {allPrimes.length} prime(s) between 1 and {selectedNum}:        {' '}        <span class>          {allPrimes.join(', ')}        </span>      </p>    </>  );}function useTime() {  const [time, setTime] = React.useState(new Date());    React.useEffect(() => {    const intervalId = window.setInterval(() => {      setTime(new Date());    }, 1000);      return () => {      window.clearInterval(intervalId);    }  }, []);    return time;}function isPrime(n){  const max = Math.ceil(Math.sqrt(n));  if (n === 2) {    return true;  }  for (let counter = 2; counter <= max; counter++) {    if (n % counter === 0) {      return false;    }  }  return true;}export default App;
```

我们的应用程序现在有两个状态，`selectedNum` 和 `time`。时间变量每秒更新一次，以反映当前时间，该值用于呈现右上角的数字时钟。

问题在于：**「每当这些状态变量发生变化时，我们就会重新运行那些昂贵的质数计算。因为时间每秒改变一次，这意味着我们不断地重新生成质数列表，即使用户选择的数字没有改变！！！」**

在 JavaScript 中，我们只有一个主线程，我们通过一遍又一遍地运行这段代码让它非常繁忙，每一秒。这意味着当用户尝试做其他事情时，应用程序可能会感到迟缓，特别是在低端设备上。

但如果我们可以 “跳过” 这些计算呢？如果我们已经有了一个给定数字的质数列表，为什么不重用这个值而不是每次都从头计算呢？这正是 `useMemo` 允许我们做的。它看起来是这样的：

```
const allPrimes = React.useMemo(() => {  const result = [];  for (let counter = 2; counter < selectedNum; counter++) {    if (isPrime(counter)) {      result.push(counter);    }  }  return result;}, [selectedNum]);
```

`useMemo` 有两个参数：

1.  要执行的工作块，封装在函数中
    
2.  依赖项列表
    

在挂载期间，当这个组件第一次呈现时，React 将调用这个函数来运行所有的逻辑，计算所有的质数。无论我们从这个函数返回什么，都被赋值给 `allPrimes` 变量。

然而，对于每一个后续渲染，React 都要做出选择。

1.  再次调用函数，重新计算值
    
2.  重用它上次执行此工作时已经拥有的数据。
    

为了做出选择，React 查看提供的依赖项列表。对于之前的渲染有任何改变吗？如果是，React 将重新运行提供的函数，以计算一个新的值。否则，它将跳过所有这些工作并重用之前计算的值。

`useMemo` 本质上类似于缓存，依赖项是缓存失效策略。在本例中，我们实际上是在说 “只有当 `selectedNum` 发生变化时才重新计算质数列表”。当组件由于其他原因重新呈现时（例如。当时间状态变量发生变化时），`useMemo` 忽略函数并传递缓存的值。

这通常被称为记忆，这就是为什么这个钩子被称为 `useMemo`。下面是这个解决方案的实时版本：

```
import React from 'react';import format from 'date-fns/format';function App() {  const [selectedNum, setSelectedNum] = React.useState(100);  const time = useTime();    const allPrimes = React.useMemo(() => {    const result = [];        for (let counter = 2; counter < selectedNum; counter++) {      if (isPrime(counter)) {        result.push(counter);      }    }        return result;  }, [selectedNum]);    return (    <>      <p class>        {format(time, 'hh:mm:ss a')}      </p>      <form>        <label htmlFor="num">Your number:</label>        <input          type="number"          value={selectedNum}          onChange={(event) => {            // 为了防止太大，我们将最大值设定在10万            let num = Math.min(100_000, Number(event.target.value));                        setSelectedNum(num);          }}        />      </form>      <p>        There are {allPrimes.length} prime(s) between 1 and {selectedNum}:        {' '}        <span class>          {allPrimes.join(', ')}        </span>      </p>    </>  );}function useTime() {  const [time, setTime] = React.useState(new Date());  React.useEffect(() => {    const intervalId = window.setInterval(() => {      setTime(new Date());    }, 1000);      return () => {      window.clearInterval(intervalId);    }  }, []);    return time;}function isPrime(n){  const max = Math.ceil(Math.sqrt(n));  if (n === 2) {    return true;  }  for (let counter = 2; counter <= max; counter++) {    if (n % counter === 0) {      return false;    }  }  return true;}
```

因此，`useMemo` 钩子确实可以帮助我们避免这里不必要的计算。但它真的是这里的最佳解决方案吗？通常，我们可以通过重组应用程序中的内容来避免对 `useMemo` 的需求。我们可以这样做：

1.  `PrimeCalculator.js`
    

```
import React from 'react';function PrimeCalculator() {  const [selectedNum, setSelectedNum] = React.useState(100);  const allPrimes = [];  for (let counter = 2; counter < selectedNum; counter++) {    if (isPrime(counter)) {      allPrimes.push(counter);    }  }    return (    <>      <form>        <label htmlFor="num">Your number:</label>        <input          type="number"          value={selectedNum}          onChange={(event) => {            // 为了防止太大，我们将最大值设定在10万            let num = Math.min(100_000, Number(event.target.value));                        setSelectedNum(num);          }}        />      </form>      <p>        There are {allPrimes.length} prime(s) between 1 and {selectedNum}:        {' '}        <span class>          {allPrimes.join(', ')}        </span>      </p>    </>  );}function isPrime(n){  const max = Math.ceil(Math.sqrt(n));  if (n === 2) {    return true;  }  for (let counter = 2; counter <= max; counter++) {    if (n % counter === 0) {      return false;    }  }  return true;}export default PrimeCalculator;
```

2.  `Clock.js`
    

```
import React from 'react';import format from 'date-fns/format';function Clock() {  const time = useTime();    return (    <p class>      {format(time, 'hh:mm:ss a')}    </p>  );}function useTime() {  const [time, setTime] = React.useState(new Date());    React.useEffect(() => {    const intervalId = window.setInterval(() => {      setTime(new Date());    }, 1000);      return () => {      window.clearInterval(intervalId);    }  }, []);    return time;}export default Clock;
```

3.  `App.js`
    

```
import React from 'react';import Clock from './Clock';import PrimeCalculator from './PrimeCalculator';function App() {  return (    <>      <Clock />      <PrimeCalculator />    </>  );}export default App;
```

我提取了两个新组件，`Clock` 和 `PrimeCalculator`。通过从 `App` 分支，这两个组件各自管理自己的状态。一个组件中的重新渲染不会影响另一个组件。

或许你听到很多关于提升状态的说法，但有时，更好的方法是将状态向下推。每个组件应该有一个单独的职责，在上面的例子中，`App` 正在做两件完全不相关的事情。

现在，这并不总是一个选择。在一个大型的现实应用中，有许多状态需要向上提升，而不能向下推。对于这种情况，我还有另一个妙计。让我们看一个例子。假设我们需要将 `time` 变量提升到 `PrimeCalculator` 之上：

1.  `PrimeCalculator.js`
    

```
import React from 'react';function PrimeCalculator() {  const [selectedNum, setSelectedNum] = React.useState(100);  const allPrimes = [];  for (let counter = 2; counter < selectedNum; counter++) {    if (isPrime(counter)) {      allPrimes.push(counter);    }  }    return (    <>      <form>        <label htmlFor="num">Your number:</label>        <input          type="number"          value={selectedNum}          onChange={(event) => {            // 为了防止太大，我们将最大值设定在10万            let num = Math.min(100_000, Number(event.target.value));                        setSelectedNum(num);          }}        />      </form>      <p>        There are {allPrimes.length} prime(s) between 1 and {selectedNum}:        {' '}        <span class>          {allPrimes.join(', ')}        </span>      </p>    </>  );}function isPrime(n){  const max = Math.ceil(Math.sqrt(n));  if (n === 2) {    return true;  }  for (let counter = 2; counter <= max; counter++) {    if (n % counter === 0) {      return false;    }  }  return true;}export default PrimeCalculator;
```

2.  `Clock.js`
    

```
import React from 'react';import format from 'date-fns/format';function Clock({ time }) {  return (    <p class>      {format(time, 'hh:mm:ss a')}    </p>  );}export default Clock;
```

3.  `App.js`
    

```
import React from 'react';import { getHours } from 'date-fns';import Clock from './Clock';import PrimeCalculator from './PrimeCalculator';// 将我们的PrimeCalculator转换为一个纯组件const PurePrimeCalculator = React.memo(PrimeCalculator);function App() {  const time = useTime();  // 根据一天中的时间选择一个合适的背景色  const backgroundColor = getBackgroundColorFromTime(time);  return (    <div style={{ backgroundColor }}>      <Clock time={time} />      <PurePrimeCalculator />    </div>  );}const getBackgroundColorFromTime = (time) => {  const hours = getHours(time);    if (hours < 12) {    // 早晨用的淡黄色    return 'hsl(50deg 100% 90%)';  } else if (hours < 18) {    // 下午暗淡的蓝色    return 'hsl(220deg 60% 92%)'  } else {    // 夜晚的深蓝色    return 'hsl(220deg 100% 80%)';  }}function useTime() {  const [time, setTime] = React.useState(new Date());    React.useEffect(() => {    const intervalId = window.setInterval(() => {      setTime(new Date());    }, 1000);      return () => {      window.clearInterval(intervalId);    }  }, []);    return time;}export default App;
```

`React.memo` 包在组件周围，保护它免受不相关的更新。`PurePrimeCalculator` 只有在接收到新数据或内部状态发生变化时才会重新呈现。这就是所谓的纯组件。本质上，我们告诉 React 这个组件将总是在相同的输入条件下产生相同的输出，我们可以跳过没有任何改变的重新呈现。

在上面的例子中，我应用了 `React.memo` 到导入的 `PrimeCalculator` 组件。事实上, 我选择了这样的结构，以便所有内容都在同一个文件中可见，以便更容易理解。在实践中，使用 `React.memo` 组件导出，如下所示：

```
// PrimeCalculator.jsfunction PrimeCalculator() {  /* 这里的组件内容 */}export default React.memo(PrimeCalculator);
```

我们的 `PrimeCalculator` 组件现在将始终是纯的，当我们要使用它时，不需要对它进行修补。

这里有一个视角转换：之前，我们在记忆一个特定计算的结果，计算质数。然而，在本例中，我记住了整个组件。无论哪种方式，只有当用户选择一个新的 `selectedNum` 时，昂贵的计算才会重新运行。但我们优化的是父组件，而不是特定的慢代码行。

我并不是说一种方法比另一种更好；每种工具在工具箱中都有自己的位置。但在这个特定的情况下，我更喜欢这种方法。现在，如果您曾经尝试在现实世界的设置中使用纯组件，您可能会注意到一些特殊的东西：纯组件经常重新渲染相当多，即使看起来没有任何变化！这很好地将我们引入了 `useMemo` 解决的第二个问题。

3. 示例 2：保留引用
------------

在下面的示例中，我创建了一个 `Boxes` 组件。它展示了一组彩色的盒子，用于某种装饰目的。我还有一个不相关的状态：用户名。

1.  `Boxes.js`
    

```
import React from 'react';function Boxes({ boxes }) {  return (    <div class>      {boxes.map((boxStyles, index) => (        <div          key={index}          class          style={boxStyles}        />      ))}    </div>  );}export default React.memo(Boxes);
```

2.  `App.js`
    

```
import React from 'react';import Boxes from './Boxes';function App() {  const [name, setName] = React.useState('');  const [boxWidth, setBoxWidth] = React.useState(1);    const id = React.useId();    // 尝试改变这些值  const boxes = [    { flex: boxWidth, background: 'hsl(345deg 100% 50%)' },    { flex: 3, background: 'hsl(260deg 100% 40%)' },    { flex: 1, background: 'hsl(50deg 100% 60%)' },  ];    return (    <>      <Boxes boxes={boxes} />            <section>        <label htmlFor={`${id}-name`}>          Name:        </label>        <input          id={`${id}-name`}          type="text"          value={name}          onChange={(event) => {            setName(event.target.value);          }}        />        <label htmlFor={`${id}-box-width`}>          First box width:        </label>        <input          id={`${id}-box-width`}          type="range"          min={1}          max={5}          step={0.01}          value={boxWidth}          onChange={(event) => {            setBoxWidth(Number(event.target.value));          }}        />      </section>    </>  );}export default App;
```

由于在 `boxes.js` 中使用了`React.memo()` 封装默认导出，`Boxes` 是一个纯组件。这意味着它应该只在它的`props`改变时重新渲染。然而，每当用户更改其名称时，`Boxes` 也会重新呈现。

为什么我们的 `React.memo()` 没有保护我们？盒子组件只有 1 个`prop`，盒子，它看起来好像我们给它在每次渲染完全相同的数据。总是一样的东西：一个红盒子，一个紫色的宽盒子，一个黄色的盒子。我们确实有一个影响`boxes` 数组的 `boxWidth` 状态变量，但我们没有更改它！

问题在于：每次 React 重新渲染时，我们都会生成一个全新的数组。它们在值上是相等的，但在参照物上是不同的。我想如果我们先不谈 React，只谈普通的 JavaScript，会很有帮助。让我们来看一个类似的情况：

```
function getNumbers() {  return [1, 2, 3];}const firstResult = getNumbers();const secondResult = getNumbers();console.log(firstResult === secondResult);
```

你怎么看？`firstResult` 是否等于 `secondResult`？从某种意义上说，的确如此。两个变量都具有相同的结构`[1,2,3]`。但这不是 `===` 运算符实际检查的内容。相反，`===` 检查两个表达式是否相同。我们已经创建了两个不同的数组。它们可能包含相同的内容，但它们不是同一个数组。

每次调用 `getNumbers` 函数时，我们都会创建一个全新的数组，它是保存在计算机内存中的一个不同的东西。如果我们多次调用它，我们将在内存中存储该数组的多个副本。注意，简单的数据类型——比如**「字符串」**、**「数字」**和**「布尔值」**——可以按值进行比较。但是当涉及到**「数组」**和**「对象」**时，它们只能通过**「引用」**进行比较。

让我们回到 React：我们的 `Boxes` React 组件也是一个 JavaScript 函数。当我们渲染它时，我们调用那个函数：

```
// 每次渲染这个组件时，我们调用这个函数…function App() {  // 最后创造了一个全新的数组  const boxes = [    { flex: boxWidth, background: 'hsl(345deg 100% 50%)' },    { flex: 3, background: 'hsl(260deg 100% 40%)' },    { flex: 1, background: 'hsl(50deg 100% 60%)' },  ];  // .然后将其作为 prop 传递给该组件!  return (    <Boxes boxes={boxes} />  );}
```

当名称状态改变时，我们的 `App` 组件将重新呈现，这将重新运行所有的代码。我们构造一个全新的 `boxes` 数组，并将其传递给我们的 `Boxes` 组件。从而导致盒子重新渲染，因为我们给了它一个全新的数组。盒子数组的结构在渲染之间没有改变，但这无关紧要。React 所知道的是，箱子 `prop` 已经收到了一个新创建的，从未见过的数组。要解决这个问题，我们可以使用 `useMemo` hook：

```
const boxes = React.useMemo(() => {  return [    { flex: boxWidth, background: 'hsl(345deg 100% 50%)' },    { flex: 3, background: 'hsl(260deg 100% 40%)' },    { flex: 1, background: 'hsl(50deg 100% 60%)' },  ];}, [boxWidth]);
```

与我们之前看到的质数例子不同，这里我们不担心计算成本很高的计算。我们的唯一目标是**「保留对特定数组的引用」**。我们将 `boxWidth` 列为一个依赖项，因为我们确实希望在用户调整红色框的宽度时重新呈现 `Boxes` 组件。然而，在 `useMemo` 中，我们重用了之前创建的 `boxes` 数组。

通过在多个渲染中保留相同的引用，我们允许纯组件按我们希望的方式工作，忽略不影响 UI 的渲染。

4. useCallback
--------------

前面我们了解了 `useMemo`。那 `useCallback` 呢？这是一个简短的版本：**「这是完全相同的事情，但用于函数而不是数组 / 对象」**。与数组和对象类似，函数是根据引用比较的，而不是根据值：

```
const functionOne = function() {  return 5;};const functionTwo = function() {  return 5;};console.log(functionOne === functionTwo); // false
```

这意味着，如果我们在组件中定义一个函数，它将在每次渲染时重新生成，每次生成一个相同但唯一的函数。让我们看一个例子：

1.  `MegaBoost.js`
    

```
import React from 'react';function MegaBoost({ handleClick }) {  console.log('Render MegaBoost');    return (    <button      class      onClick={handleClick}    >      MEGA BOOST!    </button>  );}export default React.memo(MegaBoost);
```

2.  `App.js`
    

```
import React from 'react';import MegaBoost from './MegaBoost';function App() {  const [count, setCount] = React.useState(0);  function handleMegaBoost() {    setCount((currentValue) => currentValue + 1234);  }  return (    <>      Count: {count}      <button        onClick={() => {          setCount(count + 1)        }}      >        Click me!      </button>      <MegaBoost handleClick={handleMegaBoost} />    </>  );}export default App;
```

这个栗子描述了一个典型的计数器应用程序，但有一个特殊的 “Mega Boost” 按钮。这个按钮大大增加了计数，以防你很匆忙，不想多次点击标准按钮。

多亏了 `React.memo`, `MegaBoost` 组件是一个纯组件。它不依赖于计数，但每当计数改变时它就会重新呈现！就像我们看到的盒子数组，这里的问题是我们在每个渲染上生成一个全新的函数。如果我们渲染 3 次，我们将创建 3 个单独的 `handleMegaBoost` 函数，突破 `React.memo`的保护。利用我们对 `useMemo` 的了解，我们可以像这样解决问题：

```
const handleMegaBoost = React.useMemo(() => {  return function() {    setCount((currentValue) => currentValue + 1234);  }}, []);
```

我们返回的不是一个数组，而是一个函数。然后将此函数存储在 `handleMegaBoost` 变量中。这很有效，但还有更好的方法：

```
const handleMegaBoost = React.useCallback(() => {  setCount((currentValue) => currentValue + 1234);}, []);
```

`useCallback` 的作用与 `useMemo` 相同，但它是专门为函数构建的。我们直接给它一个函数，它记住那个函数，在渲染之间进行线程处理。换句话说，这两个表达有相同的效果：

```
React.useCallback(function helloWorld(){}, []);// 在功能上等价于React.useMemo(() => function helloWorld(){}, []);
```

`useCallback` 是语法糖。它的存在纯粹是为了让我们在记忆回调函数时更加方便。

5. 什么时候使用这些 hook
----------------

好了，我们已经看到了 `useMemo` 和 `useCallback` 如何允许我们跨多个渲染线程引用重用复杂的计算或避免破坏纯组件。问题是：我们应该多经常使用它？

在我个人看来，将每个对象 / 数组 / 函数包装在这些钩子中是浪费时间。在大多数情况下，好处是可以忽略不计的；React 是高度优化的，重新渲染通常不像我们通常认为的那样缓慢或昂贵！

使用这些钩子的最佳方式是响应问题。如果你注意到你的应用程序变得有点迟缓，你可以使用 `React Profiler` 来查找缓慢的渲染。在某些情况下，可以通过重构应用程序来提高性能。在其他情况下，`useMemo` 和`useCallback` 可以帮助加快速度。

### 5.1 用于自定义 hook 内部

例如下面这个自定义 hook `useToggle`，它的工作方式几乎和 `useState` 完全一样，但只能在 `true` 和 `false` 之间切换状态变量：

```
function App() {  const [isDarkMode, toggleDarkMode] = useToggle(false);    return (    <button onClick={toggleDarkMode}>      Toggle color theme    </button>  );}
```

下面是如何定义这个自定义 hook 的：

```
function useToggle(initialValue) {  const [value, setValue] = React.useState(initialValue);    const toggle = React.useCallback(() => {    setValue(v => !v);  }, []);    return [value, toggle];}
```

注意，`toggle` 函数是用 `useCallback` 记忆的。当我构建这样的自定义可重用钩子时，我希望使它们尽可能高效，因为我不知道将来会在哪里使用它们。在 95% 的情况下，这可能是多余的，但如果我使用这个钩子 30 或 40 次，这很有可能有助于提高应用程序的性能。

### 5.2 在 context 提供者

当我们在具有 `context` 的应用程序之间共享数据时，通常会传递一个大对象作为 `value` 属性。记住这个对象通常是个好主意：

```
const AuthContext = React.createContext({});function AuthProvider({ user, status, forgotPwLink, children }){  const memoizedValue = React.useMemo(() => {    return {      user,      status,      forgotPwLink,    };  }, [user, status, forgotPwLink]);    return (    <AuthContext.Provider value={memoizedValue}>      {children}    </AuthContext.Provider>  );}
```

为什么这是有益的？可能有几十个纯组件使用这个上下文。如果没有 `useMemo`，如果 `AuthProvider` 的父组件碰巧重新渲染，那么所有这些组件都将被迫重新渲染。

- END -

关于奇舞团
-----

奇舞团是 360 集团最大的大前端团队，代表集团参与 W3C 和 ECMA 会员（TC39）工作。奇舞团非常重视人才培养，有工程师、讲师、翻译官、业务接口人、团队 Leader 等多种发展方向供员工选择，并辅以提供相应的技术力、专业力、通用力、领导力等培训课程。奇舞团以开放和求贤的心态欢迎各种优秀人才关注和加入奇舞团。

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEBLicibtcprJISN18FgTtg2N1ichPnMqRhicrP20VfwnC4vday7gtEoiaSynIH1bas4N5kgicliakrLdtT2Q/640?wx_fmt=png)