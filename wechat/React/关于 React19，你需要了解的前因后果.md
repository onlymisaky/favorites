> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/dPcxZtaUZZ59FVDpT_Kfgw)

大家好，我卡颂。  

`React`当前的稳定版本是 18.2，发布时间是 22 年 6 月，在此之后就没有新的稳定版本发布。

![](https://mmbiz.qpic.cn/mmbiz_png/5Q3ZxrD2qNBRDSETN6u70r6sia76jbFmTVIXibeovZ4FzXtUNKlJw7Sm41oQia1vp9Ao4WMkp0t78kbhVwMfemOJQ/640?wx_fmt=png&from=appmsg)

直到今年 2 月 15 日，官方博客 [1] 才透露下一个稳定版本的计划。没错，他就是`React19`。

![](https://mmbiz.qpic.cn/mmbiz_png/5Q3ZxrD2qNBRDSETN6u70r6sia76jbFmTqPbWSoo8mWKAztvUL2lrcGWt2Xja74vtk8jwNNG8DekibybMY4tlahw/640?wx_fmt=png&from=appmsg)

为什么时隔 1 年多才公布下个稳定版本的计划？

为什么下个版本直接跳到了 19？

18 我都还没升呢，19 就来了，是不是要学很多东西？

这篇文章会为你详细解答这些疑问。

从 React16 聊起
------------

近年来`React`最为人津津乐道的版本应该是`16.8`，这个版本引入了`Hooks`，为`React`（乃至整个前端框架领域）注入了新的活力。

再之后的`v17`没有新特性引入。既然没有新特性引入，为什么要发布一个大版本（从 16 到 17）呢？

这是因为从**「同步更新」**升级到**「并发更新」**的`React`，中间存在`breaking change`。

这么大体量的框架，在升级时需要保证过程尽可能平顺。这除了是一种专业、负责的体现，更重要的，版本割裂会造成大量用户损失（参考当年`ng1`升级到`anuglar2`时）。

当升级到 18 后，`React团队`发现 —— 真正升级到 18，并大量使用并发特性（比如`useTransition`）的开发者并不多。

更常见的场景是 —— 知名开源库集成并发特性，开发者再直接用这些库。

所以，`React团队`转变策略，将迭代重心从**「赋能开发者」**转变为**「赋能开源库」**。那么，什么样的库受众最多呢？显然是框架。

所以，`React`的重心逐渐变为 —— 赋能上层框架，开发者通过使用上层框架间接使用`React`。

为什么我说`React团队`转变了策略，而不是`React团队`一开始的计划就是**「赋能上层框架」**呢？

如果一开始的计划就是**「赋能上层框架」**，`React团队`就不会花大量精力在**「版本的渐进升级上」** —— 反正开发者最终使用的会是上层框架（而不是`React`），版本割裂上层框架会解决，根本不需要引导开发者升级`React`。

策略改变造成的影响
---------

策略转变造成的影响是深远且广泛的，这也是为什么 18.2 后一年多都没有新的稳定版本出现。

最基本的影响是 —— 特性的迭代流程变了。

`React`诞生的初衷是为了解决`Meta`内部复杂的前端应用，所以`React`之前的特性迭代流程是：

1.  新特性开发完成
    
2.  新特性在`React`内部产品试用，并最终达到稳定状态
    
3.  开源供广大开发者使用
    

但随着策略转变为**「赋能上层框架」**，势必需要与主流上层框架团队（主要是`Next.js`）密切合作。

如果按照原来的迭代流程，上层框架团队属于`Meta`之外的第三方团队，只能等新特性开源后才能使用，这种合作模式显然太低效了。

于是，`React`团队提出了一个新的特性发布渠道 —— `canary`，即：新特性开发完成后，可以先打一个`canary版本的React`供外部试用，等特性稳定后再考虑将其加入稳定版本中。

可能有些存在于`canary`中的特性永远不会出现在稳定版本的`React`中，但不妨碍一些开源库锁死`canary`版本的`React`，进而使用这些特性。

那么，为什么时隔 1 年多才公布下个稳定版本的计划？主要有 4 个原因。

原因 1：新特性主要服务于 Next，没必要出现在稳定版本中
------------------------------

策略改变除了影响**「特性的迭代流程」**，还让`React团队成员`陷入一个两难的境地 —— 我该优先服务上层框架还是`Meta`？

我们可以发现，在之前的迭代流程中，一切都围绕`Meta`自身需求展开。`React团队成员`作为`Meta`员工，这个迭代流程再自然不过。

但是，新的迭代流程需要密切与`Next`团队合作，那么问题来了 —— 作为`Meta`员工，新特性应该优先考虑`Next`的需求还是`Meta`的需求？

为了完成**「赋能上层框架」**的任务，显然应该更多考虑`Next`的需求。我们能看到一些`React团队成员`最终跳槽到`Vercel`，进入`Next`团队。

所以，在此期间产出的特性（比如`server action`、`useFormStatus`、`useFormState`）更多是服务于`Next`，而不是`React`。

如果基于这些特性发布新的稳定版本，那不用`Next`的开发者用不到这些特性，用`Next`的开发者依赖的是`canary React`，所以此时升级稳定版本是没意义的。

原因 2：新特性必须满足各种场景，交付难度大
----------------------

`Next`是`web框架`，围绕他创造的新`React`特性只用考虑`web`这一场景。

但`React`自身的定位是`宿主环境无关的UI库`，还有大量开发者在`非web`的环境使用`React`（比如`React Native`），所以这些特性要出现在稳定版本的`React`中，必须保证他能适配所有环境。

举个例子，`Server Actions`这一特性，用于**「简化客户端与服务器数据发送的流程」**，当前主要应用于`Next`的`App Router`模式中。

比如下面代码中的`MyForm`组件，当表单提交后，`serverAction`函数的逻辑会在服务端执行，这样就能方便的进行`IO`操作（比如操作数据库）：

```
// 服务端代码async function serverAction(event) {  'use server'  // 在这里处理服务端逻辑，比如数据库操作读写等}function MyForm() {  return (    <form action={serverAction}>      <input >Search</button>    </form>  );}
```

`App Router`的场景主要是`RSC`（React Server Component），除了`RSC`外，`SSR`场景下是不是也有表单？不使用服务端相关功能，单纯使用`React`进行客户端渲染，是不是也有表单的场景？

所以，`Server Actions`特性后来改名为`Actions`，因为不止`Server`场景，其他场景也要支持`Actions`。

比如下面代码中，在客户端渲染的场景使用`Actions`特性：

```
// 前端代码const search = async (event) => {  event.preventDefault();  const formData = new FormData(event.target);  const query = formData.get('query');  // 使用 fetch 或其他方式发送数据  const response = await fetch('/search', /*省略*/);  // ...处理响应};function MyForm() {  return (    <form action={search}>      <input >Search</button>    </form>  );}
```

你以为这就完了？还早。`form`组件支持`Actions`，那开发者自定义的组件能不能支持`Actions`这种**「前、后端交互模式」**？

比如下面的`Calendar`组件，之前通过`onSelect`事件响应交互：

```
<Calendar onSelect={eventHandler}>
```

以后能不能用`Actions`的模式响应交互：

```
<Calendar selectAction={action}>
```

如何将平平无奇的交互变成`Actions交互`呢？`React团队`给出的答案是 —— 用`useTransition`包裹。所以，这后面又涉及到`useTransition`功能的修改。

`Actions`只是一个例子，可以发现，虽然新特性是以`web`为始，但为了出现在稳定版本中，需要以**「覆盖全场景」**为终，自然提高了交付难度。

### 原因 3：老特性需要兼容的场景越来越多，工作量很大

新特性越来越多，老特性为了兼容这些新特性也必须作出修改，这需要大量的时间开发、测试。

举两个例子，`Suspense`在 v16.6 就引入了，它**「允许组件 “等待” 某些内容变得可用，并在此期间显示一个加载指示器（或其他后备内容）」**。

`Suspense`最初只支持懒加载组件（`React.lazy`）这一场景。随着`React`新特性不断涌现，`Suspense`又相继兼容了如下场景：

*   `Actions`提交后的等待场景
    
*   并发更新的等待场景
    
*   `Selective Hydration`的加载场景
    
*   `RSC`流式传输的等待场景
    
*   任何`data fetching`场景
    

为了兼容这些场景，`Suspense`的代码量已经非常恐怖了，但开发者对此是无感知的。

再举个和`Suspense`、`useEffect`这两个特性相关的例子。

`Suspense`为什么能在**「中间状态」**与**「完成状态」**之间切换？是因为在`Suspense`的源码中，他的内部存在一个`Offscreen`组件，用于完成两颗子`Fiber树`的切换。

`React团队`希望将`Offscreen`组件抽离成一个单独的新特性（新名字叫`Activity`组件），起到类似`Vue`中`Keep-Alive`组件的作用。

`Activity`组件既然能让组件显 / 隐，那势必会影响组件的`useEffect`的触发时机。毕竟，如果一个组件隐藏了，但他的`useEffect create`函数触发了，会是一件很奇怪的事情。

所以，为了落地`Activity`组件，`useEffect`的触发逻辑又会变得更复杂。

### 原因 4：特性必须形成体系才能交付

虽然这一年`React团队`开发了很多特性，但很多特性无法单独交付，必须构成一个体系后再统一交付。

比如刚才提到的`useFormStatus`、`useFormState`是服务于`Actions`特性的，`Actions`又是由`Server Actions`演化而来的，`Server Actions`又是`RSC`（React 服务端组件）体系下的特性。

单独将`useFormStatus`发布在稳定版本中是没意义的，他属于`RSC`体系下的一环。

所以，即使新特性已经准备就绪，他所在的体系还没准备好的话，那体系下的所有特性都不能在稳定版本中交付。

总结
--

为什么时隔 1 年多才公布下个稳定版本的计划？主要是 4 个原因：

1.  新特性主要服务于 Next，没必要出现在稳定版本中
    
2.  新特性必须满足各种场景，交付难度大
    
3.  老特性需要兼容的场景越来越多，工作量很大
    
4.  特性必须形成体系才能交付
    

那为什么下个稳定版本不是 v18.x 而是 v19 呢？这是因为部分新特性（主要是`Asset Loading`、`Document Metadata`这两类特性）对于一些应用会产生`breaking change`，所以需要发一个大版本。

从上述 4 个原因中的第四点可以知道，既然有 v19 的消息，势必是因为**「已经有成体系的新特性可以交付」**，那是不是意味着要学很多东西呢？

这一点倒不用担心，如果你不用`Next`，那你大概率不会接触到`RSC`，既然不会接触`RSC`，那么`RSC`体系下的新特性你都不会用到。

v19 对你最大的影响可能就是新特性对老 API 的影响了，比如：

*   `useContext`变为`use(promise)`
    
*   `Activity`组件使`useEffect`的触发时机更复杂（应该不会在 v19 的第一个版本中）
    

这些的学习成本都不大。

关于 v19 的进一步消息，会在今年 5 月 15～16 的 React Conf[2] 公布。

参考资料

[1]

官方博客: _https://react.dev/blog/2024/02/15/react-labs-what-we-have-been-working-on-february-2024_

[2]

React Conf: _https://conf.react.dev/_

顺风不浪，逆风不投，我是卡颂：

*   自由职业程序员，不上班多年
    
*   《React 设计原理》作者（电子工业出版社）
    
*   前 360、字节跳动技术专家
    
*   在职时副业收入就超百万
    

欢迎加我微信，让自己多一个「门路多的程序员好友」：

![](https://mmbiz.qpic.cn/mmbiz_gif/5Q3ZxrD2qNDvxh93JHfZD80m7GhBmGicoYpnLCanxmxvpVm4ACYNms63xnCgKt1Py5rvMCEDkWebYCTpfDVBq7g/640?wx_fmt=gif)