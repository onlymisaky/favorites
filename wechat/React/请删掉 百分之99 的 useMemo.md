> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/mbDjUmV6E30FDkkp_gA1iA)

![](https://mmbiz.qpic.cn/mmbiz_jpg/Z6bicxIx5naLVe9jbwCGjoILoSXWmpjBz1UsNgcRofN0XiaAibiatmpp5ia0GxCK6WTEiacwiaV0meqw2Ml4qiclRuhFqw/640?wx_fmt=jpeg&from=appmsg)  

导读

你的 useMemo 真正为你的项目带来了多少性能上的优化？由于 useMemo 和 useCallback 类似，所以本文全文会在大部分地方以 useMemo 为例，部分例子使用 useCallback 帮助大家更好的理解两个 hooks。

不知道大家在什么情况下会考虑使用 useMemo，你是不是这么想的？  

「不知道行不行，但是感觉这里需要 memo 一下，用了指定能优化，就算不行也没啥影响」

「需要对数据处理，量好像还挺多，且不怎么需要变化，符合 memo 的能力」

「数据处理起来很麻烦，写方法不乐意，memo 好像可以帮我套一层用方法的写法返回数据，真不戳」

useMemo 能带来性能优化，但是你的 useMemo 真的为你的项目带来了多少性能上的优化？你确定你写的真的有带来优化，还是你的自我安慰？

你为什么要用 useMemo？

我用了 useMemo，减少了不必要的重渲染，应该是我能想到非常好的**优化**手段了。

我加了 useMemo 之后，就能够让我写的代码重渲染**代价**更小，太好了。

好好好，都这样想是吧？希望读完今天这篇文章能够让你的充满**「自信」**地删除你现在代码中 95% 的 useMemo，然后你还会发现，项目可能反而运行的**更快**了，维护的成本**更小**了。

![](https://mmbiz.qpic.cn/mmbiz_jpg/Z6bicxIx5naLVe9jbwCGjoILoSXWmpjBzNlsqHgT63iaI19LPkaaib9fDicChyOU8y2UOll7ALRSmFC7VhicETQQJ4A/640?wx_fmt=jpeg&from=appmsg)

理解感悟阶段图

啥是 useMemo？

从官方的文档中可以看到 useMemo 这个 hooks 的定义：它在每次重新渲染的时候能够缓存计算的结果。

![](https://mmbiz.qpic.cn/mmbiz_png/Z6bicxIx5naLVe9jbwCGjoILoSXWmpjBzXfvXu3bZZ5Oq7pTHlZIicXlndNvvia7M7j0lRmw6SNCYFNUQC3JSeToA/640?wx_fmt=png&from=appmsg)﻿﻿

官方文档定义

很多人了解 useMemo，可能也就是这一句话，利用了 useMemo 能够缓存计算结果的特性。

对 useMemo 再了解多一些会知道 useMemo 并不能帮助你提高组件第一次渲染的速度，只可能会在你重新渲染之后提高重渲染的速度（前提是你会正确使用 useMemo）。

对于 useMemo 能够了解以上的信息，我觉得是处于**「熟悉并使用了很久」**阶段的同学，那么接下来我们再继续看一下官方文档中 useMemo 的用法有哪些：

1. 跳过代价昂贵的重新计算

2. 跳过组件的重渲染

3. 记忆另一个 Hook 的依赖

4. 记忆一个函数

核心源码

> 只挑重点，转换为白话，减少源码带来的恐惧感，请各位客官放心食用～

这里只看源码的重点部分，在重渲染时，useMemo 会比较每一个依赖项，具体的比较参考 Object.is()，虽然这个比较非常的快，但是这里想要给大家一个概念就是使用 useMemo 并不是百利而无一害，它也需要处理和比较。具体的后面我们会用例子来说明。

```
function areHookInputsEqual(
  nextDeps: Array<mixed>,
  prevDeps: Array<mixed> | null,
): boolean {
  // 省略部分
  ...
  // $FlowFixMe[incompatible-use] found when upgrading Flow
  for (let i = 0; i < prevDeps.length && i < nextDeps.length; i++) {
    // $FlowFixMe[incompatible-use] found when upgrading Flow
    if (is(nextDeps[i], prevDeps[i])) {
      continue;
    }
    return false;
  }
  return true;
}
```

```
function is(x: any, y: any) {
  return (
    (x === y && (x !== 0 || 1 / x === 1 / y)) || (x !== x && y !== y) // eslint-disable-line no-self-compare
  );
}
```

为什么一个组件会重渲染它自己？

众所周知：state 或者 props 变化时，组件就会重渲染它自己

![](https://mmbiz.qpic.cn/mmbiz_png/Z6bicxIx5naLVe9jbwCGjoILoSXWmpjBzhOd4MUbPPEYhLoVVNC0mMLL5WjSXdicQ4EicF3oxIn9sHQsmJjYYmviag/640?wx_fmt=png&from=appmsg)﻿﻿

**A 是 B 的充分条件，并不意味着 !A 是 !B 的充分条件**

导致组件重渲染的还有一个可能性，那就是**父组件重渲染**

下面来看一段代码：

```
const Page = () => <Item />;

const App = () => {
  const [state, setState] = useState(1);
  return (
    <div>

      <button onClick={() => setState(state + 1)}>
        click to re-render {state}
      </button>

      // Page是子组件，且没有props，里面也没有state
      <Page />

    </div>
  );
};
```

Page 是一个没有 props 也没有 state 的组件，但是当我点击按钮时，App 重渲染了（因为 state 变化），Page 依旧重渲染，并且 Page 里面的 Item 也会重渲染，整个链路都会重渲染。如何打断这个重渲染？**- React.memo**

```
const Page = () => <Item />;
const PageMemoized = React.memo(Page);

const App = () => {
  const [state, setState] = useState(1);
  return (
   // ... same code as before
    <PageMemoized />
  );
};
```

当这些工作都做好了，此时，再去考虑你的 Page 的 props，才是有意义的。

思考一下上面示例，我们可以得出结论，只有在唯一的一种场景下，缓存 props 才是有意义的：当组件的每一个 prop，以及组件本身被缓存的时候。

如果组件代码里有以下情形，我们可以毫无心理负担地删掉 useMemo 和 useCallback：

*   它们被作为 attributes ，直接地或作为依赖树的上层，被传递到某个 DOM 上；
    
*   它们被作为 props，直接地或作为依赖树的上层，被传递到某个未被缓存的组件上；
    
*   它们被作为 props，直接地或作为依赖树的上层，被传递到某个组件上，而那个组件至少有一个 prop 未被缓存；
    

![](https://mmbiz.qpic.cn/mmbiz_png/Z6bicxIx5naLVe9jbwCGjoILoSXWmpjBzL5p15cc9EdKsKHTWKJaTph7Jz2V5RlDZctMCQYP9E5wM3zDyg8GFAQ/640?wx_fmt=png&from=appmsg)

避免每次渲染时进行昂贵的计算

> 这里暂时使用这篇文章计算的数据：https://www.developerway.com/posts/how-to-use-memo-use-callback﻿

> 计算代码：https://codesandbox.io/s/measure-without-memo-tnhggk?file=/src/page.tsx﻿

读到这边，想必读者也应该知道 useMemo 到底是做啥的，正如这一个小标题所说的——useMemo 的主要目标是避免每次渲染时进行昂贵的计算。那什么是**昂贵的计算**？

不知道，官网好像没写，或者说你没找到。所以你就不管他三七二十一，用就完事了。创建新日期？过滤、映射或排序数组？创建一个对象？全部 useMemo 一把梭，useMemo 终将占领所有的 React 项目！

好吧，那我们拿数据来看看，比如说我这有一系列的国家和地区（250 个），你希望对它进行排序，然后展示出来。

```
const Item = ({ country }: { country: Country }) => {
  return <button>{country.name}</button>;
};


const List = ({ countries }) => {
  // sorting list of countries here
  const sortedCountries = orderBy(countries, 'name', sort);

  return (
    <>
      {sortedCountries.map((country) => (
        <Item country={country} key={country.id} />
      ))}
    </>
  );
};
```

![](https://mmbiz.qpic.cn/mmbiz_png/Z6bicxIx5naLVe9jbwCGjoILoSXWmpjBzs157u9rM5btmTq5UWfv5FwJvKX5Uic3ykiajhJXTzgkiaibQWiaCKJenQWA/640?wx_fmt=png&from=appmsg)

渲然后的按钮列表

在没有 memo 的情况下，将整个 CPU 速度降低 6 倍，对包含 250 个数据进行排序只需要不到 2 毫秒，相比之下，渲染整个列表（只是 button 带文字），需要超过 **20 毫秒**。

日常开发来说，我们很少有这么多数据的处理。再者我们只渲染了普通的 Button

所以，你真正要做的是 memo 这个数组的操作，还是说 memo 组件的渲染和更新呢？

```
const List = ({ countries }) => {
  const content = useMemo(() => {
    const sortedCountries = orderBy(countries, 'name', sort);

    return sortedCountries.map((country) => <Item country={country} key={country.id} />);
  }, [countries, sort]);

  return content;
};
```

当我们 memo 了组件之后我们发现整体的的渲染列表时间从原先的 **20 毫秒**，减少了不到 2 毫秒（18 毫秒左右）

在实际场景中，数组往往比示例中的更小，同时渲染的内容比示例中的更复杂，因此更慢。所以总的来说「计算」与「渲染」之间的耗时往往**超过 10 倍**。

问题又来了，那为啥一定要删掉它们呢？把所有东西缓存起来不是更好吗？哪怕只让重渲染速度提升了 2ms，这里提升 2ms，那里提升 2ms，累加起来就很可观了呀。换个角度看，如果完全不写 useMemo，那么应用就会在这里慢 2ms，在那里又慢 2ms，很快我们的应用就会比它们原本能达到的程度慢的多了。

听起来很有道理 ，并且，如果不是考虑到另一点的话，以上推论确实 100% 说得通。这一点便是：缓存并不是毫无开销的。如果我们使用 useMemo，在初始渲染过程中 React 就需要缓存其值了——这当然也产生耗时。没错，这耗时很微小，在我们的应用中，缓存上述提到过的排序国家列表耗时不超过 1ms。但是！**这才会产生货真价实的叠加效应！**在初始渲染让你的应用第一次呈现在屏幕前的过程中，当前页面的每一个元素都会经历这一过程，这将导致 10~20 ms，或更糟糕的，**接近 100ms 的不必要的延时。**

与初始渲染相比，重渲染仅仅在页面某些部分改变时发生。在一个架构合理的应用中，只有这些特定区域的组件才会重渲染，而非整个应用（页面）。那么在一次寻常的重渲染中，总的 “计算” 的消耗和我们上面提到的例子（注：指 250 个元素的排序列表）相比，会高出多少呢？2~3 倍？，就假设有 5 倍好了，那也仅仅是节省了 10ms 的渲染时间，这么短的时间间隔我们的肉眼是无法察觉的，并且在十倍的渲染时间下，这 10 ms 也确实很不起眼。可作为代价的是，它确实**拖慢了每次都会发生的初始渲染过程😔。**

常见的错误用法（重点）

**初级**

这里的 useCallback 毫无用处，当 Component 重渲染，所有相关的子组件全部都会重渲染（无视 props），在这个情形下，对于 click 的 memo 将毫无意义。

```
const Component = () => {
  const onClick = useCallback(() => {
    /* do something */
  }, []);
  return <button onClick={onClick}>Click me</button>
};
```

此时你的子组件被 memo 包裹，onClick 也被 useCallback 包裹，但是 value 并没有被包裹，这个时候，你的 Component 重渲染，你的 MemoItem 依旧会重渲染，此时 useCallback 还是什么都没做。

```
const Item = () => <div> ... </div>
const MemoItem = React.memo(Item)
const Component = () => {
  const onClick = useCallback(() => {
    /* do something */
  }, []);
  return <MemoItem onClick={onClick} value={[1,2,3]}/>
};
```

**中级**

这个看起来应该没啥问题了吧？onClick 被 useCallback 包裹了，然后 MemoItem 也被 memo 了，这回天王老子来了都不能重渲染吧，不然我学的知识都白学了？

```
const Item = () => <div> ... </div>
const MemoItem = React.memo(Item)
const Component = () => {
  const onClick = useCallback(() => {
    /* do something */
  }, []);
  return 
  <MemoItem onClick={onClick}>
    <div>something</div>
  </MemoItem>
};
```

没错，这个会重渲染哦。上面这段代码相当于：

```
// 以下写法均等价，也就是说在props中传递children，和直接children嵌套是一致的
React.createElement('div',{
  children:'Hello World'
})

React.createElement('div',null,'Hello World')

<div>Hello World</div>
```

```
const Item = () => <div> ... </div>
const MemoItem = React.memo(Item) // useless
const Component = () => {
  const onClick = useCallback(() => { //useless
    /* do something */
  }, []);
  return 
  <MemoItem 
    onClick={onClick} 
    children={<div>something</div>}
  />
};
```

有些同学看到这里还不理解：“就算你说子组件相当于 children，但是我 div 还是一模一样的，你凭啥说我 props 变化了”。有这种想法的同学先放一放，我们看最后一个。

**高级**

好好好，你要这样说是吧，行，那我都包裹起来。这回玉皇大帝来了也拦不住我，这回必 memo 住了！

```
const Item = () => <div> ... </div>
const Child = () => <div>sth</div>

const MemoItem = React.memo(Item)
const MemoChild = React.memo(Child)

const Component = () => {
  const onClick = useCallback(() => { 
    /* do something */
  }, []);
  return (
    <MemoItem onClick={onClick}>
      <MemoChild />
    </MemoItem>
  )
};
```

答案还是没有 memo 住，为什么呢？来我们把 MemoChild 单独拿出来解析一下，它是怎么执行的：

```
const child = <MemoChild />;
```

```
const child = React.createElement(MemoChild,props,childen);
```

```
const child = {
  type: MemoChild,
  props: {}, // same props
  ... // same interval react stuff
}
```

前面的问题也迎刃而解，其实每次 create 的时候，创建的 child 都是不一样的对象，所以一比较就重渲染了。

**终极解决思路**

如果你真的想要 memo 住，你应该 memo 的目标是 Element 本身，而不是 Component。useMemo 会缓存之前的值，如果 memo 的依赖项没有变化，则会用缓存的数据返回。

```
const Child = () => <div>sth</div>

const MemoItem = React.memo(Item)

const Component = () => {
  const onClick = useCallback(() => { 
    /* do something */
  }, []);
  const child = useMemo(()=> <Child /> ,[])
  return (
    <MemoItem onClick={onClick}>
      {child}
    </MemoItem>
  )
};
```

终于，我们的组件 memo 成功了！

如果你觉得自己之前完全不知道这个特性，不需要沮丧，React-Query 作者 Dominik 很长一段时间也不知道这个特性。对于这一块可以展开说很多知识点，涵盖了 JSX 本质，react 本身的 diff，这里不再展开赘述，感兴趣的可以查看这篇文档：

《One simple trick to optimize React re-renders》https://kentcdodds.com/blog/optimize-react-re-renders

anyway，成功来之不易，现在还觉得 useMemo 好用吗？你现在辛辛苦苦打下的江山，下一个人过来只需要随手传递一些东西作为 props，我们又回到了最初的起点。

你应该在所有地方加上 useMemo 吗？

一般来说，如果是基础的中后台应用，大多数交互都比较粗糙，通常不需要。如果你的应用类似图形编辑器，大多数交互是颗粒状的（比如说移动形状），那么此时 useMemo 可能会起到很大的帮助。

使用 useMemo 进行优化仅在少数情况下有价值：

*   你明确知道这个计算非常的昂贵，而且它的依赖关系很少改变。
    
*   如果当前的计算结果将作为 memo 包裹组件的 props 传递。计算结果没有改变，可以利用 useMemo 缓存结果，跳过重渲染。
    
*   当前计算的结果作为某些 hook 的依赖项。比如其他的 useMemo/useEffect 依赖当前的计算结果。
    

这几句是不是很熟悉，就是开头我说的 useMemo 的官方文档的用法中提到的这几项。

在其他情况下，将计算过程包装在 useMemo 中没有任何好处。不过这样做也没有重大危害，所以一些团队选择不考虑具体情况，尽可能多地使用 useMemo，这种做法会降低代码可读性。此外，并不是所有 useMemo 的使用都是有效的：一个 “**永远是新的**” 的单一值就足以破坏整个组件的记忆化效果。

没了 useMemo，我不知道怎么办了

**例子**

这是一个存在严重渲染性能问题的组件，ExpensiveTree 是一个渲染极其昂贵的组件：

```
import { useState } from 'react';
 
export default function App() {
  let [color, setColor] = useState('red');
  return (
    <div>
      <input value={color} onChange={(e) => setColor(e.target.value)} />
      <p style={{ color }}>Hello, world!</p>
      <ExpensiveTree />
    </div>
  );
}
 
function ExpensiveTree() {
  let now = performance.now();
  while (performance.now() - now < 100) {
    // Artificial delay -- do nothing for 100ms
  }
  return <p>I am a very slow component tree.</p>;
}
```

﻿try it﻿：https://codesandbox.io/s/frosty-glade-m33km?file=/src/App.js:23-513

当 color 改变的时候，ExpensiveTree 也会重渲染，而 ExpensiveTree 的渲染非常的昂贵。

经过我们前面的学习，我们知道，这里适合用 useMemo 来解决，因为它确实是**昂贵的计算**，并且我确实感觉到了卡顿和缓慢，影响了我的项目正常渲染。

但是真的一定要用 useMemo 吗？

#### 解决方案 1：状态下移

如果你仔细的看这段代码，你会发现，返回的结果中只有部分与 color 关联：

```
export default function App() {
  let [color, setColor] = useState('red');
  return (
    <div>
      <input value={color} onChange={(e) => setColor(e.target.value)} />
      <p style={{ color }}>Hello, world!</p>
      <ExpensiveTree />
    </div>
  );
}
```

所以我们可以将该部分提取出来，并将状态下移到其他组件中：

```
export default function App() {
  return (
    <>
      <Form />
      <ExpensiveTree />
    </>
  );
}
 
function Form() {
  let [color, setColor] = useState('red');
  return (
    <>
      <input value={color} onChange={(e) => setColor(e.target.value)} />
      <p style={{ color }}>Hello, world!</p>
    </>
  );
}
```

至此，color 改变，只有 Form 会重渲染，问题解决了！

﻿try it﻿：https://codesandbox.io/s/billowing-wood-1tq2u?file=/src/App.js:64-380

#### 解决方案 2：内容提升

如果说我们在 div 的最外层也用到了 color，此时解决方案 1 就失效了：

```
export default function App() {
  let [color, setColor] = useState('red');
  return (
    <div style={{ color }}>
      <input value={color} onChange={(e) => setColor(e.target.value)} />
      <p>Hello, world!</p>
      <ExpensiveTree />
    </div>
  );
}
```

完了，这回还咋提取啊？最外层父级 <div> 还得用 color 呢，这只能用 memo 了吧？

```
export default function App() {
  return (
    <ColorPicker>
      <p>Hello, world!</p>
      <ExpensiveTree />
    </ColorPicker>
  );
}
 
function ColorPicker({ children }) {
  let [color, setColor] = useState("red");
  return (
    <div style={{ color }}>
      <input value={color} onChange={(e) => setColor(e.target.value)} />
      {children}
    </div>
  );
}
```

﻿try it ﻿：https://codesandbox.io/s/wonderful-banach-tyfr1?file=/src/App.js:58-423

我们将程序一分为二，依赖颜色的部分以及变量 color 本身已经都放在 ColorPicker 中了。

不依赖 color 的部分保留在 App 中，并作为 ColorPicker 的 children。

当 color 改变，colorPicker 重渲染，但是 children 的 props 并没有变化，因此 React 会复用之前的 children，ExpensiveTree 没有重渲染，问题解决！

#### 总结

在用 useMemo 和 memo 等优化方案之前，看看是否可以将变化的部分与不受影响的部分分开，可能是更有意义的。

使用拆分的方法有趣的是，我们并不会借助到任何的性能工具，而拆分本质也与性能无关。使用 children 也能遵循从上到下的数据流，并减少通过树向下查找的属性数量。在这种情况下，提高性能只是锦上添花，而不是最终目标，真正意义上做到一举两得。

为什么一定要移除？

![](https://mmbiz.qpic.cn/mmbiz_png/Z6bicxIx5naLVe9jbwCGjoILoSXWmpjBzG1DoDQfCMuUNNY0ia5prnb1yY3L0dNXl55u0iaZKE6CtrNRQndbkIMJg/640?wx_fmt=png&from=appmsg)

图源自：Dominik【ReactJs • TypeScript • Father of two】

有些人可能说，我就是喜欢 useMemo 和 useCallback，为啥要我移除，我只要捋清楚前面说的逻辑，让我的 useMemo 真正派上用场就好了！

技术上来说，是的，你可以。

但是你到现在都没发现 useMemo 和 useCallback 使用的有问题，那么说明你现在正在写的程序并没有性能问题。

如果你坚持一定要用，好的，你理解了使用规则，非常完美的将你的程序用 memo 包裹起来，密不透风。并且你告诫自己，以后开发 / 增加需求的时候，一定要注意不要破坏掉整个 memo 的链路，你小心翼翼。那请问你能否保证与你一起合作同学在开发时也能注意到这一点？你能否保证项目交付给下一任同学时，他 / 她能够坚持你的维护之道？

React 团队的看法

> 原视频链接：https://www.youtube.com/watch?v=lGEMwh32soc&t=620s﻿

React 团队也发现了，如果我们不用 memo，可能会导致部分性能问题。但是如果我们要用 memo，又要有很强的心智负担，需要考虑多个依赖关系能被正确的使用和包裹。

![](https://mmbiz.qpic.cn/mmbiz_png/Z6bicxIx5naLVe9jbwCGjoILoSXWmpjBzqRSOMA1ibQQXwhNzLaUVS39tyv1AhI1WMdRibdpDkdCouCMmSOXMC6pw/640?wx_fmt=png&from=appmsg)

颜色选择器优化

如果说，有一个东西能将你要做的所有全部都正确的 memo 住，岂不妙哉？

![](https://mmbiz.qpic.cn/mmbiz_png/Z6bicxIx5naLVe9jbwCGjoILoSXWmpjBzPPWEwE8alxbZ1019rIZcIvqsbU3lPPX23UmzZQt6uIemlMxxfeyXbw/640?wx_fmt=png&from=appmsg)﻿﻿

自动记忆

代号：**React Forget** 正在研究中，这是一个可以帮助你自动 memo 的编译器，你们对于自动 memo 的问题，他们也正在解决当中。

![](https://mmbiz.qpic.cn/mmbiz_png/Z6bicxIx5naLVe9jbwCGjoILoSXWmpjBzGp1RueLp90xeJQVbPAib4nzak7z2qOpyu3kOCgkeeicqvZzc1qgL57Qw/640?wx_fmt=png&from=appmsg)

React Forget

最后

最后我们再一起看一下前面提到的几个想法，你们现在会怎么考虑这几种 case：

*   「不知道行不行，但是感觉这里需要 memo 一下，用了指定能优化，就算不行也没啥影响」
    
*   「需要对数据处理，量好像还挺多，且不怎么需要变化，符合 memo 的能力」
    
*   「数据处理起来很麻烦，写方法不乐意，memo 好像可以帮我套一层用方法的写法返回数据，真不戳」
    

我的看法是，如果你发现你的项目并没有明显的迟钝或者卡顿的现象，不要使用；不要期待你现在写的 memo 能为项目带来长远的收益，因为它太容易被破坏了，一旦有新的项目维护同学不懂 memo，就容易将整个 memo 链路打破；如果确实有卡顿的现象，请合理使用 memo 的记忆化功能（参考常见的错误用法），帮助优化卡顿或者迟缓现象。

**参考文章：**
---------

> 这些文章都非常优秀，可以帮助您更好的了解 useMemo 的正确使用

﻿https://react.dev/reference/react/useMemo﻿

﻿https://react.dev/reference/react/memo#memo﻿

﻿https://tkdodo.eu/blog/the-uphill-battle-of-memoization﻿

﻿https://www.developerway.com/posts/how-to-use-memo-use-callback﻿

﻿https://overreacted.io/before-you-memo/﻿

﻿https://kentcdodds.com/blog/what-is-jsx﻿

﻿https://kentcdodds.com/blog/optimize-react-re-renders﻿

﻿https://juejin.cn/post/7251802404877893689#heading-2