> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/reNPWk4gRkSrP_Oo_JTIGg)

### 前言

chatGPT 是 openAI 于 2022 年 11 月推出的人工智能聊天程序，chatGTP 一经推出便火爆全网，通过一问一答且结合上下文的方式自动生成问题答案，作为前端开发工程师，我们可以使用 chatGTP 进行代码纠错，代码优化等一系列的代码调试，当然，作为一个已经失业一个月的前端开发，我们还可以让 chatGTP 作为面试官，来对我们进行一次模拟面试。

### 向 chatGPT 提问

提问内容需要对它进行一个身份设定，它是一名前端开发的面试官。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHrEvtIDYnBmzjPpeEzR8Dm2uehOnvSUjHykNp4ia1N4Cl0Ggu663Q7aN2sla7npWkUduxUGfRaSlvg/640?wx_fmt=other)image.png

然后将自己的简历复制一份，最好先整理一下格式，然后抛给它。

### chatGPT 返回的问题

根据我的简历他问了我以下几个问题：

面试官：尊敬的面试者，您的简历显示您具备丰富的前端开发经验，我们非常高兴能邀请您来参加面试。现在让我们开始探讨一些与您工作经历和技能相关的问题，期待您的精彩回答。

1.  请详细阐述您在使用 HTML5、CSS3 和 ES6 新特性中的心得体会，以及如何在实际项目中应用这些新特性提升工作效率与用户体验。
    
2.  闭包、原型和作用域等 JavaScript 基础知识在您的项目中发挥了什么作用？请结合实际项目案例，谈谈您如何运用这些知识解决实际问题。
    
3.  在您的项目经历中，如何运用 Vue 全家桶以及 MVVM 思想来提升开发效率？请结合具体项目案例谈谈您的实践经验。
    
4.  您曾尝试写过一个简单的 MVVM 框架，可以简要介绍下您的实现思路和遇到的挑战吗？
    
5.  您在 xxx 问题的经验和方法值得我们借鉴，请详细介绍这个过程以及您对于类似问题的解决方案。
    
6.  您如何运用 three.js 进行 3D 可视化开发？请举例说明您在项目中的具体应用。
    
7.  您在项目中遇到过哪些让您印象深刻的技术挑战？您是如何克服这些挑战的？
    
8.  请谈谈您对于前端开发中代码规范和项目管理的理解，以及您在实际工作中如何保证高质量的代码输出。
    
9.  在您看来，一个优秀的前端开发者应具备哪些品质和技能？请结合您的实际经历分享一下。
    

期待您对这些问题的精彩回答。祝您面试顺利，前程似锦！

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHrEvtIDYnBmzjPpeEzR8Dm2EBgY3QBcnQiaJ92hs1xkib8KaCgOhJN8qMJghvJQofXt17LSibfvnwqoA/640?wx_fmt=other)image.png

可以看出 chatGTP 的模拟面试其实更偏向于对项目方面进行模拟面试，而我要求面试中包含大量八股文，这个是没有给到的，我意识到它可能是无法理解 “八股文” 在前端开发面试中代表的意思，于是我又换了个说法提问它。

### 提示 chatGPT 提问八股文

你是一名前端开发工程师，请根据我的简历对我进行面试，面试主要面试常见的基础知识？

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHrEvtIDYnBmzjPpeEzR8Dm2kkibrE15vLGJdEibc9JdMYUaTnLjPiasKUGu47XMuarMicnIEGWJTibTiciaQ/640?wx_fmt=other)image.png

### chatGPT 面试官对于八股文的提问

面试官：你好，根据你的简历，我了解到你具备扎实的前端开发基础。在接下来的面试环节中，我将针对一些常见的前端基础知识进行提问。请放轻松，尽量展示你的技能和经验。

1.  请谈谈你对 HTML5 和 CSS3 新特性的理解。你在实际项目中如何运用这些新特性？
    
2.  请解释一下 JavaScript 中的闭包（closure），并给出一个闭包的应用场景。
    
3.  请简述原型链（prototype chain）的概念，以及它在 JavaScript 中的应用。
    
4.  在你的项目中，你是如何处理跨域请求的？
    
5.  请谈谈你对前端性能优化的理解，以及在项目中采取了哪些措施来提升性能？
    
6.  请解释一下 Event Loop（事件循环）机制以及它在 JavaScript 中的作用。
    
7.  你在实际项目中如何使用 Vue 全家桶（Vue-router、Vuex 等）？请分享一下你的经验。
    
8.  在你的项目中，你是如何处理浏览器兼容性问题的？
    
9.  请解释一下 HTTP 缓存机制，以及如何在项目中利用 HTTP 缓存提高性能？
    
10.  请谈谈你对响应式设计（Responsive Design）的理解以及如何在项目中实现响应式设计。
    

请根据这些问题，尽量详细地展示你的知识和实际经验。如果对某个问题不太了解，也可以跳过，我们会综合评估你的技能。祝你面试顺利！

### 或许这些八股文还不够，可以要求它提问更多八股文

你是一名前端开发工程师，请根据我的简历对我进行面试，面试请提供更多面试常见的基础知识问题

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHrEvtIDYnBmzjPpeEzR8Dm2oPoIKP06mzEXMAPoa8GYjkrw3RnVAhfWIR9kVn3TibRvpiceNia0lqMkg/640?wx_fmt=other)image.png

### chatGPT 再次提问八股文

面试官：你好，根据你的简历，我了解到你具备扎实的前端开发基础。在接下来的面试环节中，我将针对一些更多的前端基础知识进行提问。请放轻松，尽量展示你的技能和经验。

1.  请解释一下 HTML 语义化的概念及其优点。
    
2.  请描述 CSS 盒模型（Box Model）的组成部分以及在布局中的作用。
    
3.  请简要介绍一下 Flex 布局和 Grid 布局，以及它们各自的应用场景。
    
4.  在 JavaScript 中，谈谈你对作用域和作用域链的理解。
    
5.  请解释一下 JavaScript 的同步和异步，以及如何使用 Promise、async/await 处理异步操作。
    
6.  请谈谈你对 Vue 的生命周期钩子函数的理解以及常见的应用场景。
    
7.  请描述一下 Vue 中的计算属性（computed property）和侦听属性（watch property）以及它们的区别和应用场景。
    
8.  在你的项目中，你是如何使用 Webpack 进行模块化打包和优化的？
    
9.  请解释一下浏览器的渲染机制以及如何利用这一知识进行页面性能优化。
    
10.  在项目中，你是如何进行前端安全防范，例如防止 XSS 攻击和 CSRF 攻击的？
    
11.  请谈谈你对前端单元测试的理解，以及在项目中如何进行单元测试。
    
12.  请解释一下前端 MVC 和 MVVM 设计模式的概念及其区别。
    
13.  请谈谈你对前端性能监控和数据埋点的理解以及在项目中的应用。
    
14.  请简要介绍一下如何在项目中实现前后端分离以及它带来的好处。
    
15.  请谈谈你对 Web Accessibility（网络无障碍）的理解以及如何在项目中实现无障碍访问。
    

请根据这些问题，尽量详细地展示你的知识和实际经验。如果对某个问题不太了解，也可以跳过，我们会综合评估你的技能。祝你面试顺利！

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHrEvtIDYnBmzjPpeEzR8Dm2F8sxO8tkt3G1aITdBWbsRxYoHSlJntoQkcTeXdkjqT8AiaGywPribqmw/640?wx_fmt=other)image.png

### 关于此次模拟面试提问的总结

这样我们此次模拟面试就获得了 9 条关于项目的问题，和 25 条关于基础的问题，细看这几个问题都是明显贴合我的简历所问的问题，大部分面试官都是会针对简历进行面试，所以根据自己的简历整理可能提到的问题是非常重要的，而关于项目方面提出的问题，与我进行大厂模拟面试所遇到的问题更为相像。通过 chatGPT 进行模拟面试，算得上是一场挺有质量的面试了。

### 尝试回答部分 chatGPT 模拟面试提出的问题

**1. 请谈谈你对 HTML5 和 CSS3 新特性的理解。你在实际项目中如何运用这些新特性？**

HTML5 新出了许多语义化标签（nav，header，main 等）和 API（canvas,webGL），语义化标签优点在于提高代码可读性和可维护性，有利于搜索引擎更容易读懂（seo），有些特殊的屏幕阅读器可以通过分析语义化标签进行展示（比如盲人阅读器）。CSS3 新出了圆角，阴影，过渡，动画，弹性布局等使创造复杂样式和交互变得更简单，也使我们可以更快的去完成页面样式。

**2. 请解释一下 JavaScript 中的闭包（closure），并给出一个闭包的应用场景。**

闭包是指函数有权访问其作用域以外的变量，这就叫闭包，闭包有两种表现形式，一种是函数作为参数传递，一种是函数作为返回值，闭包的应用场景有防抖节流函数、setTimeout、封装私有变量。闭包的缺点在于，其访问的变量不会被回收（会一直占用内存），所以会造成内存泄漏。

**3. 请简述原型链（prototype chain）的概念，以及它在 JavaScript 中的应用。**

原型链是 js 的一种继承方式，每个对象都有自己的__proto__属性指向其构造函数的 prototype 属性，当对象调用某个方法且对象里并没有定义这个方法时就会通过__proto__去寻找这个方法，如果其__proto__没有就会顺着其__proto__的__proto__就是顺着其原型链去寻找方法直到 null。

**4. 在你的项目中，你是如何处理跨域请求的？**

因为浏览器的同源策略（ip，端口，协议需要一致），我们跨域请求的时候会出现跨域问题， 在开发环境中，我使用代理服务器（如`vue.config.js`中的 proxy 配置）解决跨域问题。在生产环境中，我是用 nginx 的代理解决跨域问题。当然也可以让后端在服务器端设置响应头，允许跨域请求。或者是用 websocket，websocket 没有跨域问题。

**5. 请谈谈你对前端性能优化的理解，以及在项目中采取了哪些措施来提升性能？**

前端性能优化分为两类，一种是让文件加载更快，另一种是让文件渲染更快。

加载更快的方法

*   让传输的数据包更小（压缩文件 / 图片）：图片压缩和文件压缩
    
*   减少网络请求的次数：雪碧图 / 精灵图、节流防抖
    
*   减少渲染的次数：缓存（HTTP 缓存、本地缓存、Vue 的 keep-alive 缓存等）
    
*   使用 CDN：利用内容分发网络（Content Delivery Network）加速静态资源的加载速度，将资源部署到离用户更近的服务器
    

文件渲染更快的方法

*   提前渲染：ssr 服务器端渲染
    
*   避免渲染阻塞：CSS 放在 HTML 的 head 中 JS 放在 HTML 的 body 底部
    
*   避免无用渲染：懒加载
    
*   减少渲染次数：对 dom 查询进行缓存、将 dom 操作合并、减少重排重绘
    

**6. 请解释一下 Event Loop（事件循环）机制以及它在 JavaScript 中的作用。**

Event Loop 是 js 实现异步的一种机制，它让 js 这个单线程语言可以实现并发操作。JavaScript 引擎在执行栈为空时，会从任务队列中取出任务执行；任务队列有两类。

*   宏任务：包括 script（整个代码）、setTimeout、setInterval、setImmediate 和 I/O 等。
    
*   微任务：Promise、process.nextTick 等
    

先执行宏任务再执行微任务

**7. 你在实际项目中如何使用 Vue 全家桶（Vue-router、Vuex 等）？请分享一下你的经验**。

我通过 vue-router 进行路由管理，通过 Vuex 管理全局状态，我会对路由进行懒加载，通过 ES6 的 import，当然也可以用 vue 的动态组件，Vuex 的核心包括 state、getter、mutation 和 action，通过 mutation 去更改 state 的值，要注意异步操作只能放在 action 里。

**8. 在你的项目中，你是如何处理浏览器兼容性问题的？**

处理浏览器兼容性问题，我会使用 autoprefixer 自动添加 CSS 前缀，使用 Babel 转译新语法，使用 Polyfill 补充缺失功能，并针对特定浏览器进行特殊处理。

**9. 请解释一下 HTTP 缓存机制，以及如何在项目中利用 HTTP 缓存提高性能？**

http 缓存包括强缓存和协商缓存

*   强缓存：浏览器自己的缓存策略
    

强缓存是通过 Cache-Control 字段来控制的，值有 max-age（缓存的最大时间）、no-cache（无需强制缓存）、no-store（服务端直接返回）

*   协商缓存：由服务器判断资源是否一样，一致则返回 304，否则返回 200 和最新资源
    

判断资源是否一致，这主要通过 Last-Modified/If-Modified-Since 和 ETag/If-None-Match 头部字段实现。Last-Modified：资源最后修改时间。If-Modified-Since：客户端下次请求相同资源时，会发送该字段，值为上次收到的 Last-Modified 的值。ETag：资源的唯一标识 If-None-Match：客户端下次请求相同资源时，会发送该字段，值为上次收到的 ETag 值。

**10. 请谈谈你对响应式设计（Responsive Design）的理解以及如何在项目中实现响应式设计。**

响应式设计就是指让网站在不同设备下实现自适应展示，实现响应式设计有以下几种方法

*   不使用固定单位使用相对单位，如百分比，rem，vw/vh 等
    
*   尽可能的使用弹性布局
    
*   媒体查询：针对不同的屏幕尺寸，修改对应的 css
    

**11. 在 JavaScript 中，谈谈你对作用域和作用域链的理解。**

作用域是指变量和函数的可访问的上下文，就是其作用域，作用域链是由指变量或函数查找时先从当前的执行上下文往其夫级的上下文寻找，直到最外层的 window。

**12. 请解释一下 JavaScript 的同步和异步，以及如何使用 Promise、async/await 处理异步操作。**

js 是一个单线程语言，所以会同步执行代码，为了防止代码阻塞，通过时间循环机制实现了代码异步处理，当同步代码都执行完毕之后，再去执行异步代码，常见的异步代码有网络请求、alert、setTimeout 等，promise 是异步的解决方案，它解决了之前通过回调函数实现异步而产生的回调地狱的问题，promise 有三种状态，pendding、reject、fulfilled，只能从 pedding 到其他状态，且过程不可逆，async 和 await 是基于 promise 实现的，它是为了让异步代码看起来像同步代码，使代码更容易阅读和维护。

**13. 请谈谈你对 Vue 的生命周期钩子函数的理解以及常见的应用场景。**

vue 的组件的生命周期包括组件创建、组件挂载、组件更新、组件销毁，从中产生了生命周期钩子函数。vue2 中包括 beforeCreate、created、beforeMounte、Mouted、beforeUpadte、updated、beforeDestory、destroyed，如果组件使用了 keep-alive 进行缓存的话，还会有 active、deactive。

vue3 中的生命周期包括 setup，onBeforeMount、onMounted、onBeforeUpdate，onUpdatedon、onBeforeUnmount、onUnmounted。

mouted（onMounted）钩子函数可以做一些关于 dom 的操作，beforeDestroy（BeforeUnmount）在此阶段可以执行清理工作，如移除事件监听器、取消计时器等。

**14. 请描述一下 Vue 中的计算属性（computed property）和侦听属性（watch property）以及它们的区别和应用场景。**

计算属性是依赖其他属性变化得出结果，而侦听属性是针对数据变化而触发操作，计算属性具有缓存机制。

**15. 请谈谈您对于前端开发中代码规范和项目管理的理解，以及您在实际工作中如何保证高质量的代码输出。**

前端代码规范和项目管理在前端开发中非常重要，他可以保证代码风格一致，提高代码可读性，提高项目可维护性和团队协作效率。

在实际工作中我使用如下内容保证高质量的代码输出。

*   统一的编码风格：用代码风格指南和自动化工具（如 ESLint、Prettier 等）
    
*   使用版本控制系统：通过 git 来管理代码
    
*   注释和文档：编写清晰明了的 readme.md
    
*   Code Review：团队成员对代码进行代码审查
    

### 总结

本次面试，各位面试官满意吗？如有什么错误欢迎大佬们评论区反馈纠正。

关于本文  

作者：三三两两的小久

https://juejin.cn/post/7220274775914037285

The End

如果你觉得这篇内容对你挺有启发，我想请你帮我三个小忙：

1、点个 「在看」，让更多的人也能看到这篇内容

2、关注官网 https://muyiy.cn，让我们成为长期关系

3、关注公众号「高级前端进阶」，公众号后台回复 「加群」 ，加入我们一起学习并送你精心整理的高级前端面试题。

》》面试官都在用的题库，快来看看《《  

```
最后不要忘了点赞呦！
```