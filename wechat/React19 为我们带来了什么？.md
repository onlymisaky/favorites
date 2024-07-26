> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/Js07x8awKyE-O0CiG0Ro-A)

> ❝
> 
> 本文为稀土掘金技术社区首发签约文章
> 
> ❞

引言
==

截止今日 React 团队已经在 NPM 上发布了关于 19.0.0 版本的 Release Candidate。

在即将到来的 React 19 版本中 React 团队为我们提供了数个素未谋面的新功能，同时对于被大多数同学所诟病的 Api 进行了删除和简化。

在这篇文章中，就让我们一起来看看 React 19 中带给我们哪些新功能以及我们可以在新版本中删除哪些令人诟病的代码。

新增 Api
======

use
---

在 React 19 中，React 团队引入了一个新的多用途 Api `use`，它有两个用途：

*   通过 `use` 我们可以在组件渲染函数（render）执行时进行数据获取。
    
*   同时通过 `use` 有条件在组件中读取 Context。
    

### 异步数据获取

首先，我们来看 use Api 的第一个用途：数据获取。

使用 use 时，它接受传入一个 Promise 作为参数，会在 Promise 状态非 fullfilled 时阻塞组件 Render。

通常我们会使用 use Api 配合 Suspense 来一起使用，从而处理在数据获取时的页面加载态展示。

以往在 use 出现之前，我们需要在组件中进行数据获取通常需要经历一下步骤：

*   首先创建 `useState` 用于存储获取后的数据以及控制 Loading 加载态。
    
*   其次，初始化时在 `useEffect` 中进行异步数据获取。
    
*   最后，在数据获取返回后调用 `setState` 更新数据和 UI 展示。
    

我们来看一个非常简单的例子：

```
import { useState, useEffect } from 'react';
import './App.css';

function getPerson(): Promise<{ name: string }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ name: '19Qingfeng' });
    }, 1000);
  });
}

const personPromise = getPerson();

function App() {
  // 使用 useState 控制 UI 展示和数据存储
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState<string>();

  // useEffect 中进行数据获取
  useEffect(() => {
    setLoading(true);
    personPromise.then(({ name }) => {
      // 数据获取成功后调用 setState 更新页面展示
      setName(name);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <p>Hello:</p>
      {loading ? 'loading' : <div>userName: {name}</div>}
    </div>
  );
}

export default App;
```

在 React 19 新增的 use Api 后，我们可以使用 use 配合 Suspense 来简化这一过程：

```
import { use, Suspense } from 'react';
import './App.css';

function getPerson(): Promise<{ name: string }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ name: '19Qingfeng' });
    }, 1000);
  });
}

const personPromise = getPerson();

function Person() {
  // use Api 接受传入一个 Promise 作为参数
  const person = use(personPromise);

  return <div>userName: {person.name}</div>;
}

function App() {
  return (
    <div>
      <p>Hello:</p>
      {/* 同时配合 Suspense 实现使用 use 组件的渲染加载态 */}
      <Suspense fallback={<div>Loading...</div>}>
        <Person />
      </Suspense>
    </div>
  );
}

export default App;
```

上边的 Demo 中我们使用 use Api 来实现了相同的数据内容获取，相较以往的数据获取步骤的确让我们的代码简洁了许多。

![](https://mmbiz.qpic.cn/mmbiz_gif/lCQLg02gtibuVV5G4mnaDn9s9Fc1ZCgETGDcRiasIOeDgwpJIgu6tDoeb7bsBmL05gKlY63g5umlXDRYgGGJtQuA/640?wx_fmt=gif&from=appmsg)  

### 有条件的读取 Context

之后，让我们再来看看 use Api 的另一个用途：有条件的读取 React Context。

在 React 19 之前要使用 Context (FunctionComponent) 中，只能通过 useContenxt hook 来使用。

由于 ReactHook 的特殊性，hook 是无法出现在条件判断语句中。无论之后的条件中是否用得到这部分数据，我们都需要将 useContext 声明在整个组件最顶端。

但在 React19 之后，我们可以通过 use api 来有条件的获取 Context 而不必局限于传统 hook 的限制。

```
import { use } from 'react';
import ThemeContext from './ThemeContext';

function Heading({ children }) {
  if (children == null) {
    return null;
  }

  // 使用 use APi 有条件的获取 Context
  const theme = use(ThemeContext);
  return <h1 style={{ color: theme.color }}>{children}</h1>;
}
```

需要额外注意的是虽然 `use` Api 可以突破 hook 的限制有条件的调用，但在调用时必须保证在渲染函数中被调用。

> ❝
> 
> 关于更多 use 的使用说明，你可以参考官方文档。
> 
> ❞

预加载 Api
-------

同时在 React19 之后，我们可以在任意组件中通过简单的 API 来调用来告诉浏览器需要被预加载的资源从而显著提高页面性能。

```
import { prefetchDNS, preconnect, preload, preinit } from 'react-dom'
function MyComponent() {
  preinit('https://.../path/to/some/script.js', {as: 'script' }) // loads and executes this script eagerly
  preload('https://.../path/to/font.woff', { as: 'font' }) // preloads this font
  preload('https://.../path/to/stylesheet.css', { as: 'style' }) // preloads this stylesheet
  prefetchDNS('https://...') // when you may not actually request anything from this host
  preconnect('https://...') // when you will request something but aren't sure what
}
```

```
<!-- the above would result in the following DOM/HTML --><html>  <head>    <!-- links/scripts are prioritized by their utility to early loading, not call order -->    <link rel="prefetch-dns" href="https://...">    <link rel="preconnect" href="https://...">    <link rel="preload" as="font" href="https://.../path/to/font.woff">    <link rel="preload" as="style" href="https://.../path/to/stylesheet.css">    <script async="" src="https://.../path/to/some/script.js"></script>  </head>  <body>    ...  </body></html>
```

如果你有兴趣详细了解这些 Api 可以参考 文档链接（https://zh-hans.react.dev/reference/react-dom#resource-preloading-apis）。

Actions
=======

在 React 中核心的理念便是数据改变驱动视图渲染。

通常当用户提交表单更改某些值时，我们的应用程序将发出对应 API 请求，等待结果返回后根据响应内容去处理交互行为。

在 React19 版本之前，我们需要通过一系列的 hook 来手动处理待处理状态、错误、乐观更新和顺序请求等等状态。

比如一个常见提交表单的用例：

```
import { useState } from 'react';

function UpdateName() {
  const [name, setName] = useState<string>('');
  const [error, setError] = useState<any>(null);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async () => {
    setIsPending(true);
    const error = await updateName(name);
    setIsPending(false);
    if (error) {
      setError(error);
      return;
    }
    console.log('表单更新完毕')
  };

  return (
    <div>
      <input value={name} onChange={(event) => setName(event.target.value)} />
      <button onClick={handleSubmit} disabled={isPending}>
        Update
      </button>
      {error && <p>{error}</p>}
    </div>
  );
}
```

而在 React19 中，对于 useTransition 提供了异步函数的支持，从而可以使用 useTransition 更加便捷的进行异步的数据处理：

```
import { useState, useTransition } from 'react';

function updateName(name) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(undefined);
    }, 1000);
  });
}

export default function UpdateName() {
  const [name, setName] = useState('');
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    // startTransition 中的异步函数被称为 Action
    // 当 startTransition 被调用时 React 会自动变更 isPending 为 true
    // 同理，当函数执行完毕后 isPending 会自动变更为 false
    startTransition(async () => {
      const error = await updateName(name);
      if (error) {
        setError(error);
        return;
      }
      console.log('表单更新完毕')
    });
  };

  return (
    <div>
      <input value={name} onChange={(event) => setName(event.target.value)} />
      <button onClick={handleSubmit} disabled={isPending}>
        Update
      </button>
      {error && <p>{error}</p>}
    </div>
  );
}
```

可以看到在 useTransition 返回的 startTransition 函数中，异步的 startTransition 在点击 update 时会将 isPending 状态自动设置为 true 同时发起异步更新请求。

在 updateName 异步更新请求完成后，React 会自动将 isPending 重置为 false 从而自动控制 button 的禁用状态。

![](https://mmbiz.qpic.cn/mmbiz_gif/lCQLg02gtibuVV5G4mnaDn9s9Fc1ZCgETDCzdhunzIqwS0Maiar2MnWRh63PLQvO7hVV9ggs6GsHvLiaDcIOLoAVw/640?wx_fmt=gif&from=appmsg)

  

通常，我们将 transition 中的异步方法称之为 “Action”，在 React 19 中提供了一些更加便捷的 Hook 帮助我们处理 Action 中的数据的更新和提交：

*   Pending State：Action 会从异步请求开始时设置 Pending State，同时在异步请求结束后重置 Pending State。
    
*   Optimistic updates：Action 中支持新的 `useOptimistic` Hook，因此我们可以在提交请求时向用户显示即时反馈，稍后我们会详细讲到这个 hook 。
    
*   Error handling：Action 提供错误处理的值，因此我们可以在请求失败时显示错误边界，并自动将 Optimistic updates 恢复为其原始值。
    
*   Form：`<form>` 元素现在支持将函数传递给 `action` 和 `formAction` 属性，将函数传递给 `action` 属性默认使用 Actions，同时在提交后自动重置表单。
    

useActionState
--------------

在即将到来的 React19 中，对于表单提交行为的 Action React 提供了更加便捷的方式：

```
import { useActionState } from 'react';

let index = 0;

function updateName(name) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      index++ === 0 ? resolve('表单更新完成') : reject();
    }, 200);
  });
}

export default function ChangeName() {
  const [state, submitAction, isPending] = useActionState(
    async (previousState, formData) => {
      try {
        const result = await updateName(formData.get('name'));
        return result;
      } catch (e) {
        return e;
      }
    },
    null
  );

  return (
    <form action={submitAction}>
      <input type="text"  />
      <button type="submit" disabled={isPending}>
        Update
      </button>
      <p>{state}</p>
    </form>
  );
}
```

`useActionState` 接受一个函数（“Action”），同时返回被包装好的 Action 方法（submitAction）。

当调用被包装好的 submitAction 方法时，`useActionState` 返回的第三个 isPending 用于控制当前是否为 isPending （被执行状态），同时在 Action 执行完毕后 useActionState 会自动将 Action 的返回值更新到 state 中。

useFormState
------------

同时，在即将到来的 ReactDom 中提供了一个全新的 Hook `useFormStatus` 用于在表单内部元素获取到表单当前状态：

```
import { useFormStatus } from 'react-dom';

function DesignButton() {
  // 通过 useFormStatus 可以快速获取外层 form 元素的状态
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending} />;
}
```

`useFormStatus` 会根据当前表单是否为 pending 态从而返回当前表单状态下的所有数据  `FormStatus` ：

```
export interface FormStatusNotPending {
    pending: false;
    data: null;
    method: null;
    action: null;
}

export interface FormStatusPending {
    pending: true;
    data: FormData;
    method: string;
    action: string | ((formData: FormData) => void | Promise<void>);
}

export type FormStatus = FormStatusPending | FormStatusNotPending;
```

当然，以往我们可以通过 props 或者 context 来实现这样的功能。但在 `useFormStatus` 出现后帮助我们大大简化了这部分代码。

useOptimistic
-------------

在 Actions 的基础上，React 19 引入了`useOptimistic` 来管理乐观更新。

所谓 **「Optimistic updates」**(乐观更新) 是**「一种更新应用程序中数据的策略」**，这种策略通常会理解修改前端页面，然后再向服务器发起请求。

*   当请求成功后，则结束操作。
    
*   当请求失败后，则会将页面 UI 回归到更新前的状态。
    

这种做法可以防止新旧数据之间的跳转或闪烁，提供更快的用户体验。

比如，在绝大多数提交表单的场景中。通常在某个 input 输入完毕后，我们需要将 input 的值输入提交到后台服务中保存后再来更新页面 UI ，这种情况就可以使用 useOptimistic 来进行我所谓的 “乐观更新”。

```
// Thread.tsx
import { useOptimistic, useRef } from 'react';

export async function deliverMessage(message) {
  await new Promise((res, rej) => setTimeout(res, 1000));
  return message;
}

export function Thread({ messages, sendMessage }) {
  const formRef = useRef();
  async function formAction(formData) {
    addOptimisticMessage(formData.get('message'));
    formRef.current.reset();
    await sendMessage(formData);
  }
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    (state, newMessage) => [
      ...state,
      {
        text: newMessage,
        sending: true
      }
    ]
  );

  return (
    <>
      {optimisticMessages.map((message, index) => (
        <div key={index}>
          {message.text}
          {!!message.sending && <small> (Sending...)</small>}
        </div>
      ))}
      <form action={formAction} ref={formRef}>
        <input type="text" Hello!" />
        <button type="submit">Send</button>
      </form>
    </>
  );
}
// main.tsx
import { Thread, deliverMessage } from './actions/happy.tsx';
import './index.css';

function App() {
  const [messages, setMessages] = useState([
    { text: 'Hello there!', sending: false, key: 1 }
  ]);
  async function sendMessage(formData) {
    try {
      const sentMessage = await deliverMessage(formData.get('message'));
      setMessages((messages) => [...messages, { text: sentMessage }]);
    } catch (e) {
      console.error(e);
    }
  }
  return <Thread messages={messages} sendMessage={sendMessage} />;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

上边的例子中我们使用 useOptimistic 来每次表单提交发送数据前调用 `addOptimisticMessage` 将页面立即更新。

之后等待 `deliverMessage` 异步方法完成后，`useOptimistic` 会根据异步方法是否正常执行完毕从而进行是否保留 useOptimistic 乐观更新后的值。

当 sendMessage Promise Resolved 后，useOptimistic 会更新父组件中的 state 保留之前乐观更新的值：

![](https://mmbiz.qpic.cn/mmbiz_gif/lCQLg02gtibuVV5G4mnaDn9s9Fc1ZCgETorMwS6xws1AfYDJUlaialUbRgBwdibA7tCxbIHYZfDxxOEtECiaYLEAXw/640?wx_fmt=gif&from=appmsg)

  

当 sendMessage Promise Rejected 后，useOptimistic 并不会更新 App 中的 state 自然也会重置乐观更新的值：

![](https://mmbiz.qpic.cn/mmbiz_gif/lCQLg02gtibuVV5G4mnaDn9s9Fc1ZCgETGYibmO6dT4iagjCdLSt4HzKc3ic8hFO5pRlxaEqib5tcTvvby2aZ01viaUw/640?wx_fmt=gif&from=appmsg)

  

改进内容
====

forwardRef
----------

从 React 19 开始， `forwardRef` 是一个即将要被废弃的 API/

现在，我们可以将 ref 通过 props 在父子组件中进行传递

```
function MyInput({placeholder, ref}) {  
  return <input placeholder={placeholder} ref={ref} />  
}  

//...  

<MyInput ref={ref} />
```

> ❝
> 
> 需要注意的是在 ClassComponent 中，`ref` 不可以作为 props 传递。因为它们引用的是组件实例，如果我们仍然需要在类组件中需要访问 `ref`，我们仍需要使用 `React.forwardRef` 或者 `React.createRef`。
> 
> ❞

更好的 Hydrate 错误提示
----------------

通常，在排查 SSR 应用下发生的 hydrate 错误是一件非常令开发同学头疼的事情：

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibuVV5G4mnaDn9s9Fc1ZCgETNSALtu2yT0sHnbZzpL5Ooiaumicm17zD7tVshMgUebfgzyC4xscHZXAg/640?wx_fmt=png&from=appmsg)  

在即将到来的新版 ReactDom 中优化了这一错误提示，现在 ReactDOM 会记录一条带有不匹配差异的单一消息来方便开发同学排障：

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibuVV5G4mnaDn9s9Fc1ZCgETbViaYyuXky1vdvQdUX7QkNKWy1SRcYcLT59jKMOa1VD1tQwaSkiaZrXw/640?wx_fmt=png&from=appmsg)  

可直接使用的 ReactContext
-------------------

在 React19 之前，对于 Context 上下文我们需要使用 `<Context.Provider>` 来作为上下文提供者。

在 React 19 之后，我们可以将 `<Context>` 渲染为提供者，就无需再使用 `<Context.Provider>` 了：

```
const ThemeContext = createContext('');

function App({children}) {
  return (
    <ThemeContext value="dark">
      {children}
    </ThemeContext>
  );  
}
```

可清理的 Ref
--------

通常，在 React19 之前对于组件中的 useRef 引用，往往我们需要自行编写额外的清理逻辑来清理 ref 的实例引用。

而在 React19 之后，refs 支持一个返回的清理函数：当元素从 DOM 中被移除后会立刻调用该清理函数。

```
<input
  ref={(ref) => {
    // ref 创建
    // 新特性: 当元素从 DOM 中被移除时
    // 返回一个清理函数来重置 ref 的值
    return () => {
      // ref cleanup
    };
  }}
/>
```

React Compiler
==============

当然，随着 React19 的到来 React 团队同时也发布了一些其他令人振奋的新功能，比如 React Compiler。

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibuVV5G4mnaDn9s9Fc1ZCgETtEtXTqm2CVYRZxtIIqa8NLHe7AZmzbEnicXrxLkJ1dhXebuONUfBS9g/640?wx_fmt=png&from=appmsg)  

> ❝
> 
> 需要额外留意的是虽然 React19 和 React Comiler 发布在 2024（https://react.dev/blog/2024/02/15/react-labs-what-we-have-been-working-on-february-2024） 同一篇博文中进行介绍，但两者之间并没有强相关性。
> 
> ❞

顾名思义 React Compiler 是 React 团队打造的一款编译器，在 Compiler 中一切的数据都会被 memoized。

通常，开发 React 的同学都会清楚无论组件的 Props 是否发生变化每次状态更新都会导致 render 函数重新执行。

又或者，我们需要通过一些 `useMemo`、`useCallback` 来 Api 显式声明在某些状态发生改变时在重新渲染。

在 Compiler 出现之前，我们需要在编写代码时时刻留意这些。不过，在 React Compiler 出现之后，React 会在编译时自动为我们的代码增加响应的 memoized 优化。

这个过程往简单来说，就像是：

```
// before
const Component = () => {

  const onSubmit = () => {};

  const onMount = () => {};

  useEffect(() => {
    onMount();
  }, [onMount]);

  return <Form onSubmit={onSubmit} />;
};
```

```
// after
const FormMemo = React.memo(Form);


const Component = () => {
  // 经过 React Compiler 编译后的代码会自动添加对应 memoized 从而来带更好的性能体现
  const onSubmit = useCallback(() => {}, []);
  const onMount = useCallback(() => {}, []);


  useEffect(() => {
    onMount();
  }, [onMount]);


  return <FormMemo onSubmit={onSubmit} />;
};
```

当然，上边的代码只是一个简单的示例。React Compiler 实际内部比这些复杂的多。

目前 React Compiler 仍然处于 experimental 状态，有兴趣尝试 Compiler 的同学可以自行翻阅 React Compiler（https://zh-hans.react.dev/learn/react-compiler） 官方文档地址。

*   欢迎`长按图片加 ssh 为好友`，我会第一时间和你分享前端行业趋势，学习途径等等。2024 陪你一起度过！
    

*   ![](https://mmbiz.qpic.cn/mmbiz_png/iagNW4Zy9CyYB7lXXMibCMPY61fjkytpQrer2wkVcwzAZicenwnLibkfPZfxuWmn0bNTbicadZFXzcOvOFom7h9zeJQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)
    
*     
    

关注公众号，发送消息：

指南，获取高级前端、算法**学习路线**，是我自己一路走来的实践。

简历，获取大厂**简历编写指南**，是我看了上百份简历后总结的心血。

面经，获取大厂**面试题**，集结社区优质面经，助你攀登高峰

因为微信公众号修改规则，如果不标星或点在看，你可能会收不到我公众号文章的推送，请大家将本**公众号星标**，看完文章后记得**点下赞**或者**在看**，谢谢各位