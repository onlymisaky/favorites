> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/FmWHg1thVaFoJrZ7XAXAVQ)

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcEhHMDNMDTevMAKdbxhJ7Uicw0hTNf0LuAn01BVs19nVj6GBOaFwc4YmKvYXKickurmMWRnFGL1K4VQ/640?wx_fmt=png&from=appmsg)

之前一个群友「三年经验」找我诉苦。说遇到一个奇葩的面试，千辛万苦过了三面，等对方团队着发 offer 的时候，结果对方 hr 说有另外一个人也过了面试，各方面都跟他差不多。所以对方团队不知道如何抉择，想要加面一个面试题，聊十分钟来最终决定选谁。

**这么一搞，他突然就紧张了。**

然后对方问了同样的问题，想看看他们两个谁回答得更好：**我们现在有一个输入关键词搜索功能，想要在输入时有更好的使用体验，你们之前在实现这个功能时是如何思考的？**

可惜的是，群友在这十分钟里因为紧张没有表达好，遗憾的错失得之不易的 offer。

真是太冤了。

我敢打赌，但凡有点开发经验的前端，一定对这个功能的实现和优化非常熟悉。可能也有个别前端开发并没有接触过这个功能，但是我们经常使用**百度 / 谷歌搜索**，那么对这个功能也不会陌生，至少是一个资深用户。

我们一起来探讨一下，如果要回答好这个问题，应该从哪些方面入手。

00
--

**分析题目**

这个问题看着简单，但是由于他是一个开放性的话题，加上时间有限，因此反而增加了紧迫感和难度。

对方专门提到了**更好的使用体验**，因此我们要大概知道常规的方式是如何实现，后续再考虑在这个基础之上如何优化。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcEhHMDNMDTevMAKdbxhJ7UicTOvnZmZXgzXEabEfMXldAvHjvZpCXAmUqbRwzA7ZONACuNSg25XjLQ/640?wx_fmt=png&from=appmsg)

例如我们以百度搜索框为例。

**常规**的实现其实是在输入框旁边放置一个**确认按钮**，使用者会首先在输入框中输入好想要搜索的关键字，然后再鼠标点击该按钮。

在这个基础之上，我们可以逐渐提高使用体验。

一个最基础的优化思路：输入完成之后，再使用鼠标去点击，有点麻烦，因此我们可以在输入之后，**点击空格键**代替确认按钮。

接下来，然后我们可以新增一个历史记录或者**智能提示**用于提高用户的输入体验。如下图所示。因为有的时候，我们也不知道什么样的关键词更合适，因此合理的智能提示能有效帮助使用者增加搜索的精准度。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcEhHMDNMDTevMAKdbxhJ7Uic1LD9HyMArLmcsfBygvVBUiadGq67C2UJydmsNN6skzibSw4jibDf4sQNQ/640?wx_fmt=png&from=appmsg)

再然后，我们可以简化输入完成之后，再确认才能搜索的流程。直接在输入时自动搜索。把请求列表的过程前置到输入框的 `onchange` 事件中。

很显然，这样优化是一个非常棒的思路，因为简化了用户的操作步骤。但是，每一个字符的输入，都会导致 input 元素的 `onChange` 执行，因此频繁的输入会导致频繁的执行。

我们要在技术上去解决这个频繁请求的问题。

在以前，我们经常会使用**防抖**或者**节流**来控制请求发生的次数。因为这个确实被聊过很多次了，我就不咱开细谈。

不过防抖或者节流都会有一个非常小的弊端，那就是，我们可能会利用定时器预设一个时间，比如 `300ms` 来确保这个期间内请求不会发生，但是现在的网络速度，可能处理得比较好的一个接口请求只需要 `20ms` 就请求成功了。那么其实我们可以让搜索结果的响应速度变得更快一点。

但是防抖 / 节流的方案里，我们并不能判断用户的设备网络环境，设置多少时间合适也不知道。因此

在现有的解决方案中，最佳实践是当下一次请求发生时，如果上一个请求还没成功，则取消上一次的请求。我们可以观察一下百度搜索在快速输入内容时的请求情况，如下图所示

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcEhHMDNMDTevMAKdbxhJ7UicG25qN8VnhbDnNtK7iaX725vjgQk0o4lyWd89LImTZzOKZZ7yVlTAsaw/640?wx_fmt=png&from=appmsg)

前面还没来得及成功的都被取消掉了。

在 react19 中，我们可以利用 `fetch` 来非常简单的实现这个能力。

1
-

**fetch 中如何取消请求**

在 JavaScript 中，有一个特殊的内建对象 `AbortController` 可以终止异步任务。我们可以利用该对象实例来终止 `fetch` 请求。

```
let controller = new AbortController();
```

`controller` 具有单个属性 `signal`，我们可以在这个属性上设置事件监听。

```
let signal = controller.signalsignal.addEventListener('abort', () => alert("abort!"));
```

`controller` 具有单个方法：`abort()`，当 `abort()` 调用时，signal 的事件监听就会执行。

```
controller.abort();// 事件触发，signal.aborted 变为 truealert(signal.aborted); // true
```

`fetch` 中封装了 `signal` 的事件监听，因此它可以很好的与 `AbortController` 对象一起工作。

`fetch` 的第二个参数 option 可以接收 `signal`

```
fetch(url, {  signal: controller.signal});
```

当我们在任意地方调用 `abort` 时，对应的请求就会被取消

```
controller.abort();
```

借助这些基础知识，我们就可以封装一个可以被取消的 promise。

2
-

**封装一个新的 api 函数**

封装代码如下

```
const postApi = () => {  let controller = new AbortController();  let signal = controller.signal;  const promise = new Promise(async (resolve) => {    const res = await fetch('https://jsonplaceholder.typicode.com/posts', {signal})    resolve(res.json())  })  promise.cancel = () => controller.abort()  return promise}
```

我这里使用了一个返回结果是一个列表的案例接口。然后将 `abort` 函数挂载到返回的 `promise` 中

使用时，只需要调用 `promise.cancel()` 就可以取消对应的请求了。

3
-

**结合 react 19 使用**

我们接下来要完成如下的演示效果。注意仔细感受一下代码的简洁性。

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/Kn1wMOibzLcEhHMDNMDTevMAKdbxhJ7UiciaNMwlrYL34nmQzicUOIeNBn1JdIlhkDHibPPtKQibBOWibh7etodswmS7A/640?wx_fmt=gif&from=appmsg)

和以前一样，我们将 `postApi` 执行返回的 promise 作为返回结果存在 state 中。

```
const __api = postApi()export default function Index() {  const [api, setApi] = useState(__api)  ...
```

input 输入时，我们只需要取消上一次的请求，并且发送新的请求即可

```
function __inputChange() {  api.cancel()  setApi(postApi())}
```

就没别的其他什么逻辑了。完事。写好 jsx 就可以了

```
return (    <div class         placeholder='输入内容模拟重新请求'         onChange={__inputChange}      />      <Suspense fallback={<div>loading...</div>}>        <List api={api} />      </Suspense>    </div>  )}
```

完整代码如下

```
import {use, Suspense, useState} from 'react'import './index.css'const postApi = () => {  let controller = new AbortController();  let signal = controller.signal;  const promise = new Promise(async (resolve) => {    const res = await fetch('https://jsonplaceholder.typicode.com/posts', {signal})    resolve(res.json())  })  promise.cancel = () => controller.abort()  return promise}const __api = postApi()export default function Index() {  const [api, setApi] = useState(__api)  function __inputChange() {    api.cancel()    setApi(postApi())  }    return (    <div class         placeholder='输入内容模拟重新请求'         onChange={__inputChange}      />      <Suspense fallback={<div>loading...</div>}>        <List api={api} />      </Suspense>    </div>  )}const List = ({api}) => {  const posts = use(api)    return (    <ul className='_04_list'>      {posts.map((post) => (        <div key={post.id} className='_04_item'>          <h2>{post.title}</h2>          <p>{post.body}</p>        </div>      ))}    </ul>  )}
```

我们来看一下快速输入时，接口取消的具体情况

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/Kn1wMOibzLcEhHMDNMDTevMAKdbxhJ7Uicaia9s6Z2fgNxicZpKjDO1ibBPbSjU1k6w8psicZUtphHUhs9N6bIMATF8Q/640?wx_fmt=gif&from=appmsg)

搞定！

那么问题来了，我这样的回答，足够拿到那个 offer 了吗？

end
---

**最后**

给大家介绍一本我写的高质量小册：**React 知命境**。这是一本从知识体系顶层出发，理论结合实践，通俗易懂，覆盖面广的精品小册。点击「前端码易」即可阅读。

> 首页 --> 合集 --> React 知名境

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcEhHMDNMDTevMAKdbxhJ7Uicib6U92JuGgEkGoS5zU2OlVHZu5MSUuL8n0VeYiaQkvwNGIHlErXqFylQ/640?wx_fmt=png&from=appmsg)

[购买 React 哲学，](http://mp.weixin.qq.com/s?__biz=MzI4NjE3MzQzNg==&mid=2649867007&idx=1&sn=6443ff970cd077bbb50de74ce84afa06&chksm=f3e5936cc4921a7aba3fbf748b2f5a40369d8be7b6b2acf618f0701f477abea48b00e953165e&scene=21#wechat_redirect)或者赞赏本文 30 元，可进入 **React 付费讨论群**，学习氛围良好，学习进度加倍。进群之后可在群公告观看高质量直播录屏。