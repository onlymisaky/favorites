> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/9HbgT7CPRcoMZrPz92osxA)

基本用法
----

useMemo 是 React 中的一个 Hooks 函数，用于缓存计算结果，以避免不必要的重复计算。它接受一个函数和一个依赖数组作为参数，并返回一个缓存的值。当依赖数组中的任何一个值发生变化时，useMemo 将重新计算并返回新的缓存值。

以下是 useMemo 的基本语法：

```
import React, { useMemo } from 'react';const MyComponent = () => {  const memoizedValue = useMemo(() => {    // 执行一些计算或逻辑    // 返回计算结果  }, [dependency1, dependency2]);  return (    <div>      {/* 使用缓存的值 */}      <p>{memoizedValue}</p>    </div>  );};
```

在上面的例子中，useMemo 钩子用于缓存一个计算结果或逻辑。作为第一个参数的函数在初始渲染时被调用一次，并且只有在依赖数组中的值发生变化时才会重新计算。函数的返回值将被缓存起来，并在后续渲染中重复使用。这样可以避免在不必要的情况下重复执行昂贵的计算操作，提高性能。

React 的 useMemo 钩子可以帮助减少组件的重新渲染，通过缓存计算结果来避免不必要的计算和渲染。当某个组件的渲染过程中涉及到昂贵的计算或者是从外部传递的属性（props）的变化不会对渲染结果产生影响时，你可以使用 useMemo 来提升性能。下面是一个示例，展示如何使用 useMemo 来减少重新渲染：

```
import React, { useMemo } from 'react';const MyComponent = ({ data }) => {  // 使用useMemo缓存计算结果  const memoizedValue = useMemo(() => {    // 执行昂贵的计算操作    // 返回计算结果  }, [data]);  return (    <div>      {/* 使用缓存的值 */}      <p>{memoizedValue}</p>    </div>  );};
```

在上述示例中，data 是一个从外部传递给 MyComponent 的属性（props）。通过将 data 添加到依赖数组中，我们告诉 React 只有在 data 发生变化时才重新执行计算函数。否则，将使用上一次的计算结果，从而避免不必要的重新渲染。

浅比较
---

useMemo 钩子默认使用引用相等性检查，也就是使用浅比较（===）来比较前一个值和当前值。对于两个对象来说，某些情况下虽然引用发生变化，但是对象的值有可能不变：

```
const obj1 = { name: 'John', age: 30 };const obj2 = { name: 'John', age: 30 };obj1 === obj2 // false
```

在这种情况下，有时我们为了减少重新渲染，并不希望 React useMemo 重新计算，那么我们需要在 useMemo 依赖中详细列出每一项：

```
const obj = { name: 'John', age: 30 };  const memoizedValue = useMemo(() => {    // 执行昂贵的计算操作    // 返回计算结果  }, [obj.name, obj.age]);
```

但是当对象比较复杂的时候，将每个对象属性都列出来会十分繁琐，而对于数组对象处理起来更困难，比如下面这种情况：

```
console.log(fruits);// => ['apple', 'banana', 'grapes']const yellowFruits = useMemo(  () => fruits.filter((fruit) => fruit === "banana"),  [fruits]);// => ['banana']
```

当 fruits 的值发生变化，yellowFruits 的引用发生变化，但是 yellowFruits 数组里面的值并未变化：

```
console.log(fruits);// => ['apple', 'banana', 'grapes', 'pineapple'] // ✅ new content, new referenceconst yellowFruits = useMemo(  () => fruits.filter((fruit) => fruit === "banana"),  [fruits]);// => ['banana'] // ❌ same content, new reference
```

深比较
---

因此，在一些使用场景下，只对比引用是无法判断值到底有没有变化，我们需要的是深比较。其中的一种解决方法是使用 JSON.stringify 将依赖项数组转换为字符串，并将其作为依赖项传递，以下是如何使用 useMemo 与字符串化依赖项的示例：

```
import React, { useMemo } from 'react';const MyComponent = ({ data }) => {  const stringifiedData = JSON.stringify(data);    const memoizedValue = useMemo(() => {    // 执行昂贵的计算或逻辑    // 返回计算结果  }, [stringifiedData]);  return (    <div>      {/* 使用缓存的值 */}      <p>{memoizedValue}</p>    </div>  );};
```

在上面的示例中，data 属性通过 JSON.stringify 转换为字符串，生成的字符串 stringifiedData 被用作 useMemo 的依赖项。这确保只有在 data 属性的字符串表示发生更改时才重新计算记忆化的值。然而，使用这种方法时要小心。如果字符串化的版本发生变化，即使实际数据没有变化，也可能会导致不必要的重新计算。重要的是要考虑具体的用例，并确定字符串化依赖项是否是你场景中最合适的方法。

另外一种解决方案是，使用自定义相等性检查来确定依赖项是否实际发生了变化，比如借助 lodash.isEqual 来判断对象的值是否发生变化。lodash.isEqual 是 lodash 库中的一个函数，用于深度比较两个值是否相等。它递归地比较两个值的每个属性和元素，以确定它们是否具有相同的值。以下是 lodash.isEqual 的示例：

```
const _ = require('lodash');const obj1 = { name: 'John', age: 30 };const obj2 = { name: 'John', age: 30 };const obj3 = { name: 'John', age: 25 };console.log(_.isEqual(obj1, obj2)); // trueconsole.log(_.isEqual(obj1, obj3)); // false
```

但是这些并不能直接来用，需要做一些改造：使用 isEqual 比较的是组件状态更新前后的值，在函数组件中是无法直接拿到旧的 props 或 state 值，那么就需要借助 useRef 做一下缓存，

```
import React, { useMemo, useRef } from 'react';import _ from 'lodash';const MyComponent = ({ data }) => {  const ref = React.useRef(data);    const memoizedValue = useMemo(() => {    if (!_.isEqual(ref.current, data)) {      // 执行昂贵的计算或逻辑      ref.current = data;    }    // 返回计算结果    return ref.current;  }, [data]);  return (    <div>      {/* 使用缓存的值 */}      <p>{memoizedValue}</p>    </div>  );};
```

这种用法的目的是在 data 发生变化时，通过引用对象 ref.current 缓存计算结果，避免重复计算。只有当 data 发生变化时，才会执行昂贵的计算逻辑。这可以提高性能，并确保在 data 未发生变化时仍使用之前计算的值。

对于自定义的检查函数，很多人提议 React 支持这样的 API，希望 useMemo 支持第三个参数，用于自定义对比函数：

```
const memoizedValue = useMemo(() => {    // 执行昂贵的计算操作    // 返回计算结果- }, dependencies);+ }, dependencies, isEqual);
```

如果我们去问 ChatGPT，ChaGPT 也会推荐我们这样去使用，但是当前 React 并不支持这样做，不要被 ChaGPT 误导了。

总结
--

useMemo 是一个非常有用的工具，可以帮助优化 React 组件的性能。通过在适当的地方使用 useMemo，可以避免不必要的计算，提高应用程序的响应性和效率。但是它只支持对于依赖的浅比较，如果需要深比较我们可以使用 JSON.stringify 或 isEqual 去实现。同理，useEffect、useCallback 与之类似。