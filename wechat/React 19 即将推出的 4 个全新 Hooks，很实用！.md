> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/KFUikcgNvNw15wqM2wPHJw)

近日，React 团队成员在社交平台表示，团队正在开发 React v19 版本，并且没有计划发布 v18.3 版本。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/EO58xpw5UMOC7eDHRdomjPRmbDyf9iaSbTGI5EZpyl4WX4mJKUIibtSGqVlbiaK534OC5O78Rr8HIE6JVQtnnyI7Q/640?wx_fmt=png&from=appmsg)React 19 预计将推出 4 个全新 Hooks，这些 Hooks 主要关注 React 中的两个痛点：**数据获取**和**表单。** 这些 Hooks 目前在 React 预览版本中作为实验性 API 提供，预计会成为 React 19 的一部分，但是最终发布之前，API 可能会有所变化。

新的 Hooks 包括：

*   use
    
*   useOptimistic
    
*   useFormState
    
*   useFormStatus
    

use
---

use 是一个实验性 React Hook，它可以让读取类似于 Promise 或 context 的资源的值。

```
const value = use(resource);
```

**官方文档**：https://zh-hans.react.dev/reference/react/use

### use(Promise)

`use` 可以在客户端进行 “挂起” 的 API。可以将一个 promise 传递给它，React 将会在该 promise 解决之前进行挂起。它的基本语法如下：

```
const value = use(resource);
```

下面来看一个简单的例子：

```
import { use } from 'react';function MessageComponent({ messagePromise }) {    const message = use(messagePromise);    // ...}
```

在上面的例子中，每次刷新时，都会先显示 “请求中...”，请求到数据后进行展示：

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/EO58xpw5UMOC7eDHRdomjPRmbDyf9iaSbvVCv76EklwDSv7Iqicofvib8iabdKln5CMrKO2IYFibB9vc2H2myRib5QgQ/640?wx_fmt=gif&from=appmsg)官方文档中，关于 `<Suspense>` 有一个警告：

> 目前尚不支持在不使用固定框架的情况下进行启用 Suspense 的数据获取。实现支持 Suspense 数据源的要求是不稳定的，也没有文档。React 将在未来的版本中发布官方 API，用于与 Suspense 集成数据源。

在新版本中，`use` 可能就是用于与 Suspense 集成数据源的官方 API。

这个全新的`use` hook 与其他 Hooks 不同，它可以在循环和条件语句中像 if 一样被调用。这意味着我们可能不再需要依赖像 TanStack Query 这样的第三方库在客户端进行数据获取。然而，这仍需进一步观察，因为 Tanstack Query 的功能远不止解析 Promise 这么简单。

### use(Context)

这个 `use` hook 也可以用来读取 React Context。它与 `useContext` 作用完全相同，只是可以在循环（如 for）和条件语句（如 if）中调用。

```
import { use } from 'react';function MessageComponent({ messagePromise }) {    const message = use(messagePromise);    // ...}
```

这将简化某些场景下的组件层级结构，因为在循环或条件语句中读取 `context`，之前唯一的方法就是将组件一分为二。

在性能方面，这一改进也是巨大的进步，因为现在即使 `context` 发生变化，我们也可以有条件地跳过组件的重新渲染。

useOptimistic
-------------

`useOptimistic` Hook 允许在进行提交动作的同时，能够乐观地更新用户界面，提升用户体验。其语法如下：

```
import * as React from 'react';import { useState, use, Suspense } from 'react';import { faker } from '@faker-js/faker';export const App = () => {  const [newsPromise, setNewsPromise] = useState(() => fetchNews());  const handleUpdate = () => {    fetchNews().then((news) => {      setNewsPromise(Promise.resolve(news));    });  };  return (    <>      <h3>        新闻列表    		<button onClick={handleUpdate}>刷新</button>      </h3>      <NewsContainer newsPromise={newsPromise} />    </>  );};let news = [...new Array(4)].map(() => faker.lorem.sentence());const fetchNews = () =>  new Promise<string[]>((resolve) =>    // 使用 setTimeout 模拟数据获取    setTimeout(() => {      // 每次刷新时添加一个标题      news.unshift(faker.lorem.sentence());      resolve(news);    }, 1000)  );const NewsContainer = ({ newsPromise }) => (  <Suspense fallback={<p>请求中...</p>}>    <News newsPromise={newsPromise} />  </Suspense>);const News = ({ newsPromise }) => {  const news = use<string[]>(newsPromise);  return (    <ul>      {news.map((title, index) => (        <li key={index}>{title}</li>      ))}    </ul>  );};
```

> **乐观更新**：一种更新应用程序中数据的策略。这种策略通常会先更改前端页面，然后向服务器发送请求，如果请求成功，则结束操作；如果请求失败，则页面回滚到先前状态。这种做法可以防止新旧数据之间的跳转或闪烁，提供更快的用户体验。

下面来看一个添加购物车的例子：

```
import * as React from 'react';import { useState, use, Suspense } from 'react';import { faker } from '@faker-js/faker';export const App = () => {  const [newsPromise, setNewsPromise] = useState(() => fetchNews());  const handleUpdate = () => {    fetchNews().then((news) => {      setNewsPromise(Promise.resolve(news));    });  };  return (    <>      <h3>        新闻列表    		<button onClick={handleUpdate}>刷新</button>      </h3>      <NewsContainer newsPromise={newsPromise} />    </>  );};let news = [...new Array(4)].map(() => faker.lorem.sentence());const fetchNews = () =>  new Promise<string[]>((resolve) =>    // 使用 setTimeout 模拟数据获取    setTimeout(() => {      // 每次刷新时添加一个标题      news.unshift(faker.lorem.sentence());      resolve(news);    }, 1000)  );const NewsContainer = ({ newsPromise }) => (  <Suspense fallback={<p>请求中...</p>}>    <News newsPromise={newsPromise} />  </Suspense>);const News = ({ newsPromise }) => {  const news = use<string[]>(newsPromise);  return (    <ul>      {news.map((title, index) => (        <li key={index}>{title}</li>      ))}    </ul>  );};
```

在上面的例子中，将商品添到购物车时，会先在购物车列表看到刚刚添加的商品，而不必等到数据请求完成。这样，用户可以更快地看到更新后的购物车内容，提供更加流畅的用户体验。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/EO58xpw5UMOC7eDHRdomjPRmbDyf9iaSbicU7mO632t2NGKWc4xbNXhvORQxIpRFzYvOJqDq7fHt9Cl2ZJicYL01g/640?wx_fmt=png&from=appmsg)

useFormState
------------

在介绍这个 Hook 之前，先来看以下这个 Hook 使用的背景。

### `<form>`

React 将引入一个新组件：`<form>`，它是创建用于提交信息的交互式控件，可以将一个函数作为`action`的属性值。当用户提交表单时，React 将自动调用此函数，以执行相应的操作。

```
import { use } from 'react';function HorizontalRule({ show }) {    if (show) {        const theme = use(ThemeContext);        return <hr className={theme} />;    }    return false;}
```

注意，如果在 React 18 中添加`<form action>`属性，就会收到警告：

> ⚠️ Warning: Invalid value for prop action on `<form>` tag. Either remove it from the element or pass a string or number value to keep it in the DOM.

这里的意思是，`<form>`标签上的 prop `action`无效。要么从元素中删除它，要么传递一个字符串或数字值以将其保留在 DOM 中。

而在新版本中，可以直接在`<form>`标签上设置`action`属性。例如，在上面的购物车例子中，：

```
import { use } from 'react';function HorizontalRule({ show }) {    if (show) {        const theme = use(ThemeContext);        return <hr className={theme} />;    }    return false;}
```

`addToCart` 函数并不是在服务器端执行的，而是在客户端（例如用户的浏览器）上运行的。这个函数可以是一个异步函数，如网络请求，而不阻止其他代码的执行。通过使用`addToCart`函数，开发者可以更简单地处理 React 中的 AJAX 表单，例如在搜索表单中。然而，这可能还不足以完全摆脱像 React Hook Form 这样的第三方库，因为它们不仅处理表单提交，还包括验证、副作用等多种功能。

看完这个新功能，下面就来看看这一部分要介绍的新 Hook：`useFormState`。

### useFormState

useFormState 是一个可以根据某个表单动作的结果更新 state 的 Hook。

```
import { useOptimistic } from 'react';function AppContainer() {    const [optimisticState, addOptimistic] = useOptimistic(        state,        // 更新函数        (currentState, optimisticValue) => {            // 合并并返回带有乐观值的新状态          },    );}
```

只有在表单提交触发 action 后才会被更新的值，如果该表单没有被提交，该值会保持传入的初始值不变。

例如，这可以用来显示由表单操作返回的确认消息或错误消息。

```
import { useOptimistic } from 'react';function AppContainer() {    const [optimisticState, addOptimistic] = useOptimistic(        state,        // 更新函数        (currentState, optimisticValue) => {            // 合并并返回带有乐观值的新状态          },    );}
```

效果如下：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/EO58xpw5UMOC7eDHRdomjPRmbDyf9iaSbqGscibEb8ex8P9xmdaDmIor0U180FvgzkbSiaA3IguQYGyx3Wh2v2LZw/640?wx_fmt=png&from=appmsg)**注意**：`useFormState` 需要从 `react-dom` 中导入，而不是从 `react` 中导入。

useFormStatus
-------------

`useFormStatus` 用于获取上次表单提交的状态信息。

```
import { useState, useOptimistic } from 'react';const AddToCartForm = ({ id, title, addToCart, optimisticAddToCart }) => {  const formAction = async (formData) => {    optimisticAddToCart({ id, title });    try {      await addToCart(formData, title);    } catch (e) {      // 捕获错误    }  };  return (    <form action={formAction}>      <h2>{title}</h2>      <input type="hidden"  value={id} />      <button type="submit">添加到购物车</button>    </form>  );};type Item = {  id: string;  title: string;};const Cart = ({ cart }: { cart: Item[] }) => {  if (cart.length == 0) {    return null;  }  return (    <>      购物车:      <ul>        {cart.map((item, index) => (          <li key={index}>{item.title}</li>        ))}      </ul>      <hr />    </>  );};export const App = () => {  const [cart, setCart] = useState<Item[]>([]);  const [optimisticCart, optimisticAddToCart] = useOptimistic<Item[], Item>(    cart,    (state, item) => [...state, item]  );  const addToCart = async (formData: FormData, title) => {    const id = String(formData.get('itemID'));    await new Promise((resolve) => setTimeout(resolve, 1000));    setCart((cart: Item[]) => [...cart, { id, title }]);    return { id };  };  return (    <>      <Cart cart={optimisticCart} />      <AddToCartForm        id="1"        title="JavaScript权威指南"        addToCart={addToCart}        optimisticAddToCart={optimisticAddToCart}      />      <AddToCartForm        id="2"        title="JavaScript高级程序设计"        addToCart={addToCart}        optimisticAddToCart={optimisticAddToCart}      />    </>  );};
```

它不接收任何参数，会返回一个包含以下属性的 `status` 对象：

*   `pending`：布尔值。如果为 `true`，则表示父级 `<form>` 正在等待提交；否则为 false。
    
*   `data`：包含父级 `<form>` 正在提交的数据；如果没有进行提交或没有父级 `<form>`，它将为 `null`。
    
*   `method`：字符串，可以是'get' 或'post'。表示父级 `<form>` 使用 GET 或 POST HTTP 方法 进行提交。默认情况下，`<form>` 将使用 GET 方法，并可以通过 method 属性指定。
    
*   `action`：一个传递给父级 `<form>` 的 `action` 属性的函数引用。如果没有父级 `<form>`，则该属性为 `null`。如果在 `action` 属性上提供了 URI 值，或者未指定 `action` 属性，`status.action` 将为 `null`。
    

下面来继续看购物车的例子，将商品添加到购物车成功前，禁用添加按钮：

```
import { useState, useOptimistic } from 'react';const AddToCartForm = ({ id, title, addToCart, optimisticAddToCart }) => {  const formAction = async (formData) => {    optimisticAddToCart({ id, title });    try {      await addToCart(formData, title);    } catch (e) {      // 捕获错误    }  };  return (    <form action={formAction}>      <h2>{title}</h2>      <input type="hidden"  value={id} />      <button type="submit">添加到购物车</button>    </form>  );};type Item = {  id: string;  title: string;};const Cart = ({ cart }: { cart: Item[] }) => {  if (cart.length == 0) {    return null;  }  return (    <>      购物车:      <ul>        {cart.map((item, index) => (          <li key={index}>{item.title}</li>        ))}      </ul>      <hr />    </>  );};export const App = () => {  const [cart, setCart] = useState<Item[]>([]);  const [optimisticCart, optimisticAddToCart] = useOptimistic<Item[], Item>(    cart,    (state, item) => [...state, item]  );  const addToCart = async (formData: FormData, title) => {    const id = String(formData.get('itemID'));    await new Promise((resolve) => setTimeout(resolve, 1000));    setCart((cart: Item[]) => [...cart, { id, title }]);    return { id };  };  return (    <>      <Cart cart={optimisticCart} />      <AddToCartForm        id="1"        title="JavaScript权威指南"        addToCart={addToCart}        optimisticAddToCart={optimisticAddToCart}      />      <AddToCartForm        id="2"        title="JavaScript高级程序设计"        addToCart={addToCart}        optimisticAddToCart={optimisticAddToCart}      />    </>  );};
```

添加购物车时效果如下：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/EO58xpw5UMOC7eDHRdomjPRmbDyf9iaSbZicWReTm5FuT3EMYsjyiaHZiagib32YZKT5YeH4XJVcjYhSUlxsWT1YIcA/640?wx_fmt=png&from=appmsg)

**注意**：`useFormState` 需要从 `react-dom` 中导入，而不是从 `react` 中导入。此外，它仅在父级表单使用 `action` 属性时才有效。

往期推荐
----

[盘点 2023 年前端大事件](http://mp.weixin.qq.com/s?__biz=MzU2MTIyNDUwMA==&mid=2247525342&idx=1&sn=c97ab520c5394f56d88fa32cd80d8bd9&chksm=fc7e2d85cb09a493bca6a0af3fdbb730a2d983fd911d55d7e0adfb3100b4f68ea02a7fcdcc64&scene=21#wechat_redirect)

[都 2024 年了，该如何搭建新的 React 项目？](http://mp.weixin.qq.com/s?__biz=MzU2MTIyNDUwMA==&mid=2247526553&idx=1&sn=fee83d0243b6652d94928f78fe8c6c9a&chksm=fc7e26c2cb09afd46470fa0955518829df62550e3547b1066e4dfcc8aa6a9d4e7ccc7b71af45&scene=21#wechat_redirect)

[太失望了！前端社区对 React 的抱怨越来越多...](http://mp.weixin.qq.com/s?__biz=MzU2MTIyNDUwMA==&mid=2247526449&idx=1&sn=79a2c160efdab8d4e7c4691a025f6dce&chksm=fc7e266acb09af7ce9ca73ac4c08f508ab368e269646a513bb836ef039be6475e79607c9b4c0&scene=21#wechat_redirect) 

[npm 淘宝镜像到期了，尽快切换~](http://mp.weixin.qq.com/s?__biz=MzU2MTIyNDUwMA==&mid=2247526442&idx=2&sn=6845f106fcf62065322c01633d81616c&chksm=fc7e2671cb09af67a9aad2249de87c37deb4981d41dc8cc5894b3475d799a4ca863ef8bb09eb&scene=21#wechat_redirect)

[Prettier + ESLint + Rust = ??  快，真是太快了！](http://mp.weixin.qq.com/s?__biz=MzU2MTIyNDUwMA==&mid=2247526398&idx=1&sn=b84964bec04e8852395475e4e1f62f43&chksm=fc7e29a5cb09a0b3ac789124c8a323b21eab08890579e3346163a8333b833271683058a47f85&scene=21#wechat_redirect)

[78k Star！爆火的高质量前端工具集，超实用！](http://mp.weixin.qq.com/s?__biz=MzU2MTIyNDUwMA==&mid=2247526368&idx=1&sn=be7625f077f8767b784c8246ed568eb4&chksm=fc7e29bbcb09a0ad6a9b291dc631bd80e51bbde4beed92e99acde1e001a8e73b99248dd094b6&scene=21#wechat_redirect)

[推荐 12 个 yyds 的开源鸿蒙实战项目](http://mp.weixin.qq.com/s?__biz=MzU2MTIyNDUwMA==&mid=2247526363&idx=1&sn=d89b110901d6e7392c6a0752ad7b8484&chksm=fc7e2980cb09a096bbee0ecfa0d796a7253f0fb6f143222d4df32274b418660a05c910bd783c&scene=21#wechat_redirect)