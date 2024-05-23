> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/GpEO4vh4edPfdldixNhJZQ)

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcFkBcL6mW2dMvPvpgFHu2qa4BQaWaBfQdqjMfpYt5kialggxvtopPDT2icOJhEQlUb2mkMH7RtK0THg/640?wx_fmt=png&from=appmsg)

这是一个超强的特性。仔细看完你就能体会。

**在 html 的基础知识中，表单是很重要的一个环节**。但是由于各种原因，原生的表单开发方式相关知识被部分前端开发所遗忘，他们对 form action，formdata 有一种陌生感。

因此，当看到有消息称 React 19 支持了 form action 之后，许多前端感觉有点懵。不知道这是啥。这篇文章就先给大家科普一下相关的知识。

本文一共包含如下内容：

*   html 中默认的表单数据与 action 的表现
    
*   重温 fromdata 数据结构与使用方式
    
*   React Form Action 的基础知识与基础案例
    
*   具体的案例
    
*   它对服务端渲染的划时代意义
    

全文共 4322 字，阅读预计花费 8 分钟。

1
-

**HTML form action**

先来看一段简单的代码

```
<form id="form" method="get">  First name:  <input type="text" value="Jake" ></form>
```

当我们使用表单 form 元素时，内部的表单元素可以根据 `name` 属性与 `value` 值自动组合成一个完整的序列化表单对象。我们不再需要额外去拼接他们。

合成的序列化对象，我们称之为 FormData， 这是一个特殊的对象。我们可以直接通过如下方式获取到该对象

```
let formdata = new FormData(form)console.log(formdata.get('fname'))console.log(formdata.get('lname'))
```

> i
> 
> > > 我们无法直接观察到 FormData 的值，需要使用 `.get` 方法来获取。

FormData 也可以被网络请求支持，例如我们可以把 `FormData` 对象作为 fetch 请求的 `body`，直接发送

```
form.onsubmit = async e => {  e.preventDefault()    const response = await fetch('/post/user', {    method: 'POST',    body: new FormData(form)  })  let res = await response.json()  // do something}
```

在这个案例中，当 `type='submit'` 的按钮点击提交时，`onsubmit` 就会触发，我们可以在这个回调函数里执行自己的提交逻辑。

> ✓
> 
> HTTP 中 content-type 字段有专门支持 FormData 的值，如下所示

```
Content-Type: multipart/form-data
```

除此之外，我们可以使用 form 元素的 `action` 属性来简化提交。不过它的表现会不太一样。

action 接收一个 `URL` 作为参数，可以是绝对路径，也是可以相对路径。它表示携带表单数据向该地址发送请求。默认情况下页面会跳转到指定的 URL 地址。

```
<form id="form" action="xx.html" method="post">  First name:  <input type="text" value="Jake" ></form>
```

服务端可以拦截该地址，并定义响应行为。

这样做的好处就是我们可以简化提交行为的代码。无需使用 JavaScript 对逻辑进行任何额外的处理，就能完成一次提交操作。在没有额外要求的情况下，我们可以非常方便的使用这种方式来提交表单数据，上传文件等。

2
-

**FormData 使用详解**

FormData API 如下图所示。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcFkBcL6mW2dMvPvpgFHu2qannRnKc32icS7BMIgV8uAu8COuGbHIjkgjgFmKtUaDUeDHvyB0SnPzJA/640?wx_fmt=png&from=appmsg)

我们可以先创建一个空的 FormData 对象，然后通过 `append` 方法来添加属性。

```
const formdata = new FormData()formdata.append('title', 'hello world')
```

也可以直接使用 form 元素对象进行初始化。并在子表单元素中合并具体的字段和值。

```
<form id="form" method="post">  First name:  <input type="text" value="Jake" ></form>
```

```
const formdata = new FormData(form)
```

我们可以通过 `.get` 方法获取具体字段的值。在表单元素中，`name` 属性表示字段名。

```
formdata.get('fname')
```

可以有多个同名的 name，因此 `.get()` 表示获取第一个，`.getAll()` 表示获取所有

```
// 获取所有 name 为 age 的字段，返回数组formdata.getAll('age')
```

我们可以通过 `.set` 方法设置对应字段的值。如果字段名不存在，则添加该字段。

```
formdata.set('fname', 'Jake')
```

可以通过 `.has(key)` 来判断是否存在某个字段。

```
formdata.has('fname') // true
```

可以通过 `.delete(key)` 删除某一个字段。

```
formdata.delete('fname')
```

我们可以使用 formdata 来实现一个上传文件的功能。

```
<form id="form">  <input type="text" ></form>
```

```
form.onsubmit = async e => {  e.preventDefault()  const response = await fetch('/post/file', {    method: 'POST',    body: new FormData(form)  })  let res = await response.json()  // do something}
```

可以明确的是，HTML 本身对 form 表单的支持非常强大与完整，它已经足以支撑我们开发大多数功能。React 19 进一步明确支持 form 表单，并非是一种作妖，而是一种回归。

3
-

**React Form Action**

React 19 在表单上提供了更多充满想象空间都 API，它们用好了非常爽，不过一个麻烦的事情是如果你通过自学，想要透彻理解并找到最佳实践可能会非常困难。

这里最核心的原因是因为开发思维发生了比较彻底的变化，主要体现在 React19 在尝试弱化受控组件的概念，尝试引导开发者尽可能少的使用 useEffect，并且尽可能少的使用 useState 存储数据。

抛开学习成本不谈，我个人认为这是一个非常好的变化，新的开发方式上在开发体验和性能表现上都有非常大的提升。它充分利用了 HTML 中表单元素本身已经支持的能力，例如表单验证，自定义异常样式，自定义错误信息等。

这里的学习成本主要来源于三个方面

*   许多前端开发对 HTML 表单组件本身的了解程度不够
    
*   对 React 并发模式了解不够
    
*   对 React 19 新 api 难以彻底消化
    
*   对表单开发的复杂场景认知不够
    

> !
> 
> > 因此，许多前端开发在之前的表单开发中，掌握得都比较吃力

不过没关系，我们会尽量拆分去学习。确保大家都能读有所得。这一章节就先简单给大家介绍一下 React 在表单上的基础表现。

> ✓
> 
> 先用最基础的知识内容铺垫一下

在 HTML 的表单元素中，我们可以通过监听 form 对象的 onsubmit 来回调函数的执行。也可以通过 `action` 属性来直接向服务端发送请求。

在 React 19 中，form 元素支持的 action 在这个基础之上发生了一些变化。它支持给 action 传递一个回调函数以供我们使用。该回调函数会将 FormData 作为参数传入。我们可以通过这种方式拿到表单里的所有数据。

> ✓
> 
> 这个变化主要是 React 中并不提倡直接获取元素对象，以及直接往后端发送请求的方式并不常用

```
function action(formdata) {  // do something   }
```

```
<form action={action}>  <input type="text" ></form>
```

当我们点击提交按钮时，action 方法就会触发执行。当然，我们也可以给 `submit` 一个 `formAction` 属性来达到同样的效果

```
<form>  <input type="text" >  <input formAction={action} type="submit"></form>
```

> i
> 
> > > 默认情况下，当我们点击提交之后，form 会自动清空内部的所有数据，如下图所示

> i
> 
> > > 如果你在设置了 action 的同时，又设置了 onSbumit 回调，那么 action 将不会执行

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/Kn1wMOibzLcFkBcL6mW2dMvPvpgFHu2qaIncdPNiaPfaVRy9uHDDK07TzWX2d1yMydlgF2fQ2icubynNCpX1VOHlA/640?wx_fmt=gif&from=appmsg)

4
-

**案例**

学习了这些基础知识之后，我们来完成一个比较简单的案例。我们在表单中输入信息，并把信息记录展示在一个列表中。案例演示效果如下

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/Kn1wMOibzLcFkBcL6mW2dMvPvpgFHu2qamQMeq20jj6atp127pLkLmISldfmhuI3vOHF0EkticWrZvUuAaeg9HDg/640?wx_fmt=gif&from=appmsg)

首先我们要定义一个数据，用于存储列表

```
const [posts, setPosts] = useState([])
```

然后在 `jsx` 中，定义一个表单内容，和列表渲染

```
<div>  <div>基础的表单提交案例</div>  <form action={action}>    <div class>      <button className='primary' type='submit'>Submit</button>    </div>  </form>  <ul className='_07_list'>    {posts.map((post, index) => (      <div key={`${post.title}-${index}`} className='_07_item'>        <h2>{post.title}</h2>        <p>{post.content}</p>      </div>    ))}  </ul></div>
```

提交之后的逻辑在 action 中处理，action 回调函数能拿到最新的 formdata。然后把对应的数据拿出来，设置到 posts 里面即可。

```
function action(data) {  const title = data.get('title')  const content = data.get('content')  if (title && content) {    setPosts([...posts, {title, content}])  }}
```

我们可以简单扩展一下，在这个基础之上做一些校验。我们把其中一个 input 做一些简单的调整

```
<input  onInput={onInput}    placeholder='Enter you name'  required  pattern={'abc'}/>
```

在 css 中，新增如果校验不通过的样式

```
input:invalid {  border: 1px dashed red;}
```

演示效果如下

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/Kn1wMOibzLcFkBcL6mW2dMvPvpgFHu2qaia5JIO1OKlAm06lwC6bDWUeoyg08xliaKGx1lkzlaz93MHAwToib4mKnw/640?wx_fmt=gif&from=appmsg)

我们还可以通过 input 的 onInput 事件对验证样式进行自定义。

```
function onInput(event) {  let input = event.target  console.log(input.validity)  if (input.validity.valid) {    console.log('xxxxx', input.validity)  }}
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcFkBcL6mW2dMvPvpgFHu2qa8EdPSI2sKibibz5Ct1VR3kiaUS45f5iarzkZD7kr47Q3mBH8AR8X7UevFw/640?wx_fmt=png&from=appmsg)

这里面有许多状态可以支持我们做许多自己的扩展。

5
-

**它对服务端渲染的划时代意义**

这里大家需要注意的一个小细节就是，许多针对表单功能增强的 API，都不是从 `react` 中引入，而是从 `react-dom` 中引入。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcFkBcL6mW2dMvPvpgFHu2qaNHupANAaKNSpGaMQlaldvuKDwrzQqB3HJq08Ber4CJ9FRJFJ1pqb2w/640?wx_fmt=png&from=appmsg)

第一时间我还没想通这到底咋回事。感觉好奇怪。后来我才意识到，这对于服务端渲染有着巨大的划时代的重要意义。

在评估网页性能中，有一个重要的性能指标：**TTI：可交互时间**。页面加载完成，并且首屏显示，并且页面可以交互。

但是，在以前的服务端渲染项目中，想要页面元素可以被点击，可交互，需要经历一个重要的过程，那就是 **Hydrate 水合**。意思就是说，第一时间从服务端给到页面上的只是字符串，并不具备可交互功能，它需要浏览器渲染之后，变成 DOM 元素，再通过 React 水合之后，再变成 React 组件，然后才可以正常点击交互。

因此，React 服务端渲染项目虽然首屏直出理论上会快一些，但是 TTI 要多经历一个水合的过程，那么可交互时间等待就比较久了。

> ✓
> 
> 其实也不一定，处理不好，服务端渲染项目也会更慢。

React 19 支持的 form action，实际上是极大的利用了浏览器的自带的表单能力，**它要可交互，并不需要经历水合过程**，浏览器渲染成 DOM 就可以正常交互了。

道友们，谁懂啊，这就有点厉害了。

> ✓
> 
> 有的服务端渲染项目首屏渲染时间只需要不到 1s，但是首次可交互时间，能长达 8s 之久。从这个简单的数据对比，你就能领会不需要水合是多大的提升了

这不仅在客户端组件中，直接挣脱了之前受控组件在性能上的桎梏，还更进一步在服务端渲染项目有更强的体现。如果一旦跟 **next.js** 有机结合...

不得不佩服 React 团队在设计项目架构解决方案上的超前思维。

6
-

**总结**

React form Action 是一个很小的知识点，但是它代表的是表单开发的另一种思路，是一种开发方式的隆重回归。因此这要求我们对 HTML 本身已经支持的表单能力要有所了解。我们在后续的开发使用中，会逐渐弱化受控组件的使用，这会带来开发体验和性能上的提升。

除此之外，React 在表单开发中还提供了许多功能增强的 hook，我们在后续的分享慢慢学习。

> ✓
> 
> 顶尖前端都在关注我，就差你啦，戳左下角
> 
> 加我好友`icanmeetu`，进 React19 先锋讨论群
> 
> 成为 React 高手，[推荐阅读 React 哲学](http://mp.weixin.qq.com/s?__biz=MzI4NjE3MzQzNg==&mid=2649867007&idx=1&sn=6443ff970cd077bbb50de74ce84afa06&chksm=f3e5936cc4921a7aba3fbf748b2f5a40369d8be7b6b2acf618f0701f477abea48b00e953165e&scene=21#wechat_redirect)