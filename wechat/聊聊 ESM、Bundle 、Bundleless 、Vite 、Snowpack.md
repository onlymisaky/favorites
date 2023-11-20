> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/qW9geA6QD-wAthyzaFqUDg)

编者按：本文转载皮小蛋的 segmentfault 文章，来一起快乐学习吧

前言
--

一切要都要从打包构建说起。

当下我们很多项目都是基于 webpack 构建的， 主要用于：

*   本地开发
    
*   打包上线
    

首先，webpack 是一个伟大的工具。

经过不断的完善，webpack 以及周边的各种轮子已经能很好的满足我们的日常开发需求。

我们都知道，webpack 具备将各类资源打包整合在一起，形成 bundle 的能力。

可是，当资源越来越多时，打包的时间也将越来越长。

一个中大型的项目， 启动构建的时间能达到数分钟之久。

拿我的项目为例， 初次构建大概需要三分钟， 而且这个时间会随着系统的迭代越来越长。

相信不少同学也都遇到过类似的问题。打包时间太久，这是一个让人很难受的事情。

那有没有什么办法来解决呢？

当然是有的。

这就是今天的主角 ESM， 以及以它为基础的各类构建工具， 比如：

1.  **Snowpack**
    
    https://www.snowpack.dev/#what-is-snowpack%3F
    
2.  **Vite**
    
    https://github.com/vitejs/vite
    
3.  **Parcel**
    
    https://www.parceljs.cn/getting_started.html
    

等等。

今天，我们就这个话题展开讨论， 希望能给大家一些启发和帮助。

文章较长，提供一个传送门：

1.  **什么是 ESM**
    
    https://segmentfault.com/a/1190000025137845?_ea=67042700#item-2-1  
    
2.  **ESM 是如何工作的**
    
    https://segmentfault.com/a/1190000025137845?_ea=67042700#item-2-2  
    
3.  **Bundle & Bundleless**
    
    https://segmentfault.com/a/1190000025137845?_ea=67042700#item-2-3  
    
4.  **实现一个乞丐版 Vite**
    
    https://segmentfault.com/a/1190000025137845?_ea=67042700#item-2-4  
    
5.  **Snowpack & 实践**
    
    https://segmentfault.com/a/1190000025137845?_ea=67042700#item-2-5  
    
6.  **bundleless 模式在实际开发中存在的一些问题**
    
    https://segmentfault.com/a/1190000025137845?_ea=67042700#item-2-6  
    
7.  **结论**
    
    https://segmentfault.com/a/1190000025137845?_ea=67042700#item-2-7  
    

正文
--

### 什么是 ESM

ESM 是理论基础， 我们都需要了解。

「 ESM 」 全称 ECMAScript modules，基本主流的浏览器版本都以已经支持。

![](https://mmbiz.qpic.cn/mmbiz_png/MpGQUHiaib4ib6gIw3f9QRquCbmJJ9HYEO4XsNlIrMCwGxyoNV1Az8SibDgCf5VCHbkCOoibZfhPVdOCfmENcvS9bibA/640?wx_fmt=png)

### ESM 是如何工作的

![](https://mmbiz.qpic.cn/mmbiz_png/MpGQUHiaib4ib6gIw3f9QRquCbmJJ9HYEO43ydVO1ZX9vTeA6EeMQeovUsoyr1ukZf3xHRSPOicwicFe9sjEkiaBD7tw/640?wx_fmt=png)

当使用 ESM 模式时， 浏览器会构建一个依赖关系图。不同依赖项之间的连接来自你使用的导入语句。

通过这些导入语句， 浏览器 或 Node 就能确定加载代码的方式。

通过指定一个入口文件，然后从这个文件开始，通过其中的 import 语句，查找其他代码。

![](https://mmbiz.qpic.cn/mmbiz_png/MpGQUHiaib4ib6gIw3f9QRquCbmJJ9HYEO4DnNo8dCPdvVfbNVjUSufBp170mDdEFMnFy9HYYlRCqhN60RicUtmv0g/640?wx_fmt=png)

通过指定的文件路径， 浏览器就找到了目标代码文件。但是浏览器并不能直接使用这些文件，它需要解析所有这些文件，以将它们转换为称为模块记录的数据结构。

![](https://mmbiz.qpic.cn/mmbiz_png/MpGQUHiaib4ib6gIw3f9QRquCbmJJ9HYEO4m9beJnVPtu2zl722evzc3icbNRwKk3Adiaa9pctBPNXFxzrF6Rar7x6A/640?wx_fmt=png)

然后，需要将 模块记录 转换为 模块实例 。

![](https://mmbiz.qpic.cn/mmbiz_png/MpGQUHiaib4ib6gIw3f9QRquCbmJJ9HYEO4sKoicb1Br7kdFDHEvAtrDjib6Y2dLXh8uiaxKqqxiajlY4TpYHvq0r2AEA/640?wx_fmt=png)

模块实例， 实际上是 「 代码 」（指令列表）与「 状态」（所有变量的值）的组合。

对于整个系统而言， 我们需要的是每个模块的模块实例。

模块加载的过程将从入口文件变为具有完整的模块实例图。

对于 ES 模块，这分为 三个步骤：

1.  构造—查找，下载所有文件并将其解析为模块记录。
    
2.  实例化—查找内存中的框以放置所有导出的值（但尚未用值填充它们）。然后使导出和导入都指向内存中的那些框，这称为链接。
    
3.  运行—运行代码以将变量的实际值填充到框中。
    

![](https://mmbiz.qpic.cn/mmbiz_png/MpGQUHiaib4ib6gIw3f9QRquCbmJJ9HYEO45MIwTVMwD4GgtLiaX0uHODtaR0DD38tq8IAohdzTbyvNuRCXMwb6Fpw/640?wx_fmt=png)

在构建阶段时， 发生三件事情：

1.  找出从何处下载包含模块的文件
    
2.  提取文件（通过从 URL 下载文件或从文件系统加载文件）
    
3.  将文件解析为模块记录
    

##### 1. 查找

首先，需要找到入口点文件。

在 HTML 中，可以通过脚本标记告诉加载程序在哪里找到它。

![](https://mmbiz.qpic.cn/mmbiz_png/MpGQUHiaib4ib6gIw3f9QRquCbmJJ9HYEO43ydVO1ZX9vTeA6EeMQeovUsoyr1ukZf3xHRSPOicwicFe9sjEkiaBD7tw/640?wx_fmt=png)

但是，如何找到下一组模块， 也就是 main.js 直接依赖的模块呢？

这就是导入语句的来源。

导入语句的一部分称为模块说明符， 它告诉加载程序可以在哪里找到每个下一个模块。

![](https://mmbiz.qpic.cn/mmbiz_png/MpGQUHiaib4ib6gIw3f9QRquCbmJJ9HYEO4HFhWVHF61kR8mjLf2YJg0VhiaicHic6jaUK42XQxKxOnn6g8tPuunCib8w/640?wx_fmt=png)

在解析文件之前，我们不知道模块需要获取哪些依赖项，并且在提取文件之前，也无法解析文件。

这意味着我们必须逐层遍历树，解析一个文件，然后找出其依赖项，然后查找并加载这些依赖项。

![](https://mmbiz.qpic.cn/mmbiz_png/MpGQUHiaib4ib6gIw3f9QRquCbmJJ9HYEO4IWHr31dRRR0k2pp2SiaWnmXhgAN2CibCRyST9zww5BfH3LHZdUxIYGPA/640?wx_fmt=png)

如果主线程要等待这些文件中的每个文件下载，则许多其他任务将堆积在其队列中。

那是因为当浏览器中工作时，下载部分会花费很长时间。

![](https://mmbiz.qpic.cn/mmbiz_png/MpGQUHiaib4ib6gIw3f9QRquCbmJJ9HYEO4icqFxU9S8pCMbw0wA98EQnUqZ3zuBM6Z9Uu12os0oRWxM5ynrVw2L2w/640?wx_fmt=png)

这样阻塞主线程会使使用模块的应用程序使用起来太慢。

这是 ES 模块规范将算法分为多个阶段的原因之一。

将构造分为自己的阶段，使浏览器可以在开始实例化的同步工作之前获取文件并建立对模块图的理解。

这种方法（算法分为多个阶段）是 ESM 和 CommonJS 模块 之间的主要区别之一。

CommonJS 可以做不同的事情，因为从文件系统加载文件比通过 Internet 下载花费的时间少得多。

这意味着 Node 可以在加载文件时阻止主线程。

并且由于文件已经加载，因此仅实例化和求值（在 CommonJS 中不是单独的阶段）是有意义的。

这也意味着在返回模块实例之前，需要遍历整棵树，加载，实例化和评估任何依赖项。![](https://mmbiz.qpic.cn/mmbiz_png/MpGQUHiaib4ib6gIw3f9QRquCbmJJ9HYEO4AhhIcEU23xGmCu5l7WFaXcAyMWLHicT1NibzVuPPe1KHRwuXR56MYKuQ/640?wx_fmt=png)

在具有 CommonJS 模块的 Node 中，可以在模块说明符中使用变量。

require 在寻找下一个模块之前，正在执行该模块中的所有代码。这意味着当进行模块解析时，变量将具有一个值。

但是，使用 ES 模块时，需要在进行任何评估之前预先建立整个模块图。

这意味着不能在模块说明符中包含变量，因为这些变量还没有值。

![](https://mmbiz.qpic.cn/mmbiz_png/MpGQUHiaib4ib6gIw3f9QRquCbmJJ9HYEO43421QYsHgdVzY54A3dhoDB4FibqgiaibnFzticNUTPrU49iblGQHSxa0X3g/640?wx_fmt=png)

但是，有时将变量用于模块路径确实很有用。

例如，你可能要根据代码在做什么，或者在不同环境中运行来记载不同的模块。

为了使 ES 模块成为可能，有一个建议叫做动态导入。有了它，您可以使用类似的导入语句：

import(${path}/foo.js)。

这种工作方式是将使用加载的任何文件 import() 作为单独图的入口点进行处理。

动态导入的模块将启动一个新图，该图将被单独处理。

![](https://mmbiz.qpic.cn/mmbiz_png/MpGQUHiaib4ib6gIw3f9QRquCbmJJ9HYEO4bETVdqQ8ueWPXbPHfQckg8uia4ibgzUDWkCs0dSHGsLUAp1vFmuAogqQ/640?wx_fmt=png)

但是要注意一件事–这两个图中的任何模块都将共享一个模块实例。

这是因为加载程序会缓存模块实例。对于特定全局范围内的每个模块，将只有一个模块实例。

这意味着发动机的工作量更少。

例如，这意味着即使多个模块依赖该模块文件，它也只会被提取一次。（这是缓存模块的一个原因。我们将在评估部分中看到另一个原因。）

加载程序使用称为模块映射的内容来管理此缓存。每个全局变量在单独的模块图中跟踪其模块。

当加载程序获取一个 URL 时，它将把该 URL 放入模块映射中，并记下它当前正在获取文件。然后它将发出请求并继续以开始获取下一个文件。![](https://mmbiz.qpic.cn/mmbiz_png/MpGQUHiaib4ib6gIw3f9QRquCbmJJ9HYEO4JVpHIzyuzbjHna5feRkcDjKLOW2EBeRl3Wh5rwhxefBicaxQhZCIvpA/640?wx_fmt=png)

如果另一个模块依赖于同一文件会怎样？加载程序将在模块映射中查找每个 URL。如果在其中看到 fetching，它将继续前进到下一个 URL。

但是模块图不仅跟踪正在获取的文件。模块映射还充当模块的缓存，如下所示。

##### 2. 解析

现在我们已经获取了该文件，我们需要将其解析为模块记录。这有助于浏览器了解模块的不同部分。

![](https://mmbiz.qpic.cn/mmbiz_png/MpGQUHiaib4ib6gIw3f9QRquCbmJJ9HYEO4gxOZbjnZgePLCPwcpdFXp9l6JPoqF1G10OGAZmyyLaYzT0oBf9ljHQ/640?wx_fmt=png)

创建模块记录后，它将被放置在模块图中。这意味着无论何时从此处请求，加载程序都可以将其从该映射中拉出。

![](https://mmbiz.qpic.cn/mmbiz_png/MpGQUHiaib4ib6gIw3f9QRquCbmJJ9HYEO44WQnqq0mEH4vflX35vepqfDicZJicpyJWw5cCXM7IWUF6gkqJTNhBOHw/640?wx_fmt=png)

解析中有一个细节看似微不足道，但实际上有很大的含义。

解析所有模块，就像它们 "use strict" 位于顶部一样。还存在其他细微差异。

例如，关键字 await 是在模块的顶级代码保留，的值 this 就是 undefined。

这种不同的解析方式称为 “解析目标”。如果解析相同的文件但使用不同的目标，那么最终将得到不同的结果。因此，需要在开始解析之前就知道要解析的文件类型是否是模块。

在浏览器中，这非常简单。只需放入 type="module" 的 script 标签。这告诉浏览器应将此文件解析为模块。并且由于只能导入模块，因此浏览器知道任何导入也是模块。

![](https://mmbiz.qpic.cn/mmbiz_png/MpGQUHiaib4ib6gIw3f9QRquCbmJJ9HYEO4YIMmSODWeZjyOpia57CibAkTmSRAbrzic8RonRAeksGtbR1d8gibicQrY1A/640?wx_fmt=png)

但是在 Node 中，您不使用 HTML 标记，因此无法选择使用 type 属性。社区尝试解决此问题的一种方法是使用 .mjs 扩展。使用该扩展名告诉 Node，“此文件是一个模块”。您会看到人们在谈论这是解析目标的信号。目前讨论仍在进行中，因此尚不清楚 Node 社区最终决定使用什么信号。

无论哪种方式，加载程序都将确定是否将文件解析为模块。如果它是一个模块并且有导入，则它将重新开始该过程，直到提取并解析了所有文件。

我们完成了！在加载过程结束时，您已经从只有入口点文件变为拥有大量模块记录。

![](https://mmbiz.qpic.cn/mmbiz_png/MpGQUHiaib4ib6gIw3f9QRquCbmJJ9HYEO4zicdSuvdibWUGqWIngnE5a3NfIhrWvES166PWmjPeHLWebbVfiawiccdhw/640?wx_fmt=png)

下一步是实例化此模块并将所有实例链接在一起。

##### 3. 实例化

就像我之前提到的，实例将代码与状态结合在一起。

该状态存在于内存中，因此实例化步骤就是将所有事物连接到内存。

首先，JS 引擎创建一个模块环境记录。这将管理模块记录的变量。然后，它将在内存中找到所有导出的框。模块环境记录将跟踪与每个导出关联的内存中的哪个框。

内存中的这些框尚无法获取其值。只有在评估之后，它们的实际值才会被填写。该规则有一个警告：在此阶段中初始化所有导出的函数声明。这使评估工作变得更加容易。

为了实例化模块图，引擎将进行深度优先的后顺序遍历。这意味着它将下降到图表的底部 - 底部的不依赖其他任何内容的依赖项 - 并设置其导出。

![](https://mmbiz.qpic.cn/mmbiz_png/MpGQUHiaib4ib6gIw3f9QRquCbmJJ9HYEO4crYWEc2SNZ67pzcXN5ck5q2jUkkO6SjlpGLh0oRoZH9icX3YxMeZ0RQ/640?wx_fmt=png)

引擎完成了模块下面所有出口的接线 - 模块所依赖的所有出口。然后，它返回一个级别，以连接来自该模块的导入。

请注意，导出和导入均指向内存中的同一位置。首先连接出口，可以确保所有进口都可以连接到匹配的出口。

![](https://mmbiz.qpic.cn/mmbiz_png/MpGQUHiaib4ib6gIw3f9QRquCbmJJ9HYEO4IflmkGaCObapJ1YbNc3icxFAWlDCn8HbuAXel47ibl9YpicZmsGVZzRRQ/640?wx_fmt=png)

这不同于 CommonJS 模块。在 CommonJS 中，整个导出对象在导出时被复制。这意味着导出的任何值（例如数字）都是副本。

这意味着，如果导出模块以后更改了该值，则导入模块将看不到该更改。

![](https://mmbiz.qpic.cn/mmbiz_png/MpGQUHiaib4ib6gIw3f9QRquCbmJJ9HYEO4fgvbhib3e30Stgt1XZwsrs92zMdnVUE6iadIFjJZMHPYkqdNTicBDsLbQ/640?wx_fmt=png)

相反，ES 模块使用称为实时绑定的东西。两个模块都指向内存中的相同位置。这意味着，当导出模块更改值时，该更改将显示在导入模块中。

导出值的模块可以随时更改这些值，但是导入模块不能更改其导入的值。话虽如此，如果模块导入了一个对象，则它可以更改该对象上的属性值。

![](https://mmbiz.qpic.cn/mmbiz_png/MpGQUHiaib4ib6gIw3f9QRquCbmJJ9HYEO4lo72vs6609vC3BAKLtNuo96ibJcHAQWRpAwUaqCfExTZTBvkrSTZ1ibg/640?wx_fmt=png)

之所以拥有这样的实时绑定，是因为您可以在不运行任何代码的情况下连接所有模块。当您具有循环依赖性时，这将有助于评估，如下所述。

因此，在此步骤结束时，我们已连接了所有实例以及导出 / 导入变量的存储位置。

现在我们可以开始评估代码，并用它们的值填充这些内存位置。

##### 4. 执行

最后一步是将这些框填充到内存中。JS 引擎通过执行顶级代码（函数外部的代码）来实现此目的。

除了仅在内存中填充这些框外，评估代码还可能触发副作用。例如，模块可能会调用服务器。

![](https://mmbiz.qpic.cn/mmbiz_png/MpGQUHiaib4ib6gIw3f9QRquCbmJJ9HYEO489wk7wBCxDSSvicFkwHDHVIQW1AFtO35NwyMddPkylItYibZ7zFIwWyQ/640?wx_fmt=png)

由于存在潜在的副作用，您只需要评估模块一次。与实例化中发生的链接可以完全相同的结果执行多次相反，评估可以根据您执行多少次而得出不同的结果。

这是拥有模块映射的原因之一。模块映射通过规范的 URL 缓存模块，因此每个模块只有一个模块记录。这样可以确保每个模块仅执行一次。与实例化一样，这是深度优先的后遍历。

那我们之前谈到的那些周期呢？

在循环依赖关系中，您最终在图中有一个循环。通常，这是一个漫长的循环。但是为了解释这个问题，我将使用一个简短的循环的人为例子。

![](https://mmbiz.qpic.cn/mmbiz_png/MpGQUHiaib4ib6gIw3f9QRquCbmJJ9HYEO43ibC2JhDoWShyaia8GQgFGls4PVsNM8Ht8o4bA2lYVOCreRCneqiako7A/640?wx_fmt=png)

让我们看一下如何将其与 CommonJS 模块一起使用。首先，主模块将执行直到 require 语句。然后它将去加载计数器模块。

![](https://mmbiz.qpic.cn/mmbiz_png/MpGQUHiaib4ib6gIw3f9QRquCbmJJ9HYEO4rtrVuj1uepOiaD5XfNl2jVuejDiauReqxfFsIapPEVhDiaPX8Ht8HPHSw/640?wx_fmt=png)

然后，计数器模块将尝试 message 从导出对象进行访问。但是由于尚未在主模块中对此进行评估，因此它将返回 undefined。JS 引擎将在内存中为局部变量分配空间，并将其值设置为 undefined。

![](https://mmbiz.qpic.cn/mmbiz_png/MpGQUHiaib4ib6gIw3f9QRquCbmJJ9HYEO4zsZDgxxz70Ch32Q5zibKJLurB4pfMeXiaeiavOxdXxmtohKl8VZhF6QzQ/640?wx_fmt=png)

评估一直持续到计数器模块顶级代码的末尾。我们想看看我们是否最终将获得正确的消息值（在评估 main.js 之后），因此我们设置了超时时间。然后评估在上恢复 main.js。

![](https://mmbiz.qpic.cn/mmbiz_png/MpGQUHiaib4ib6gIw3f9QRquCbmJJ9HYEO40ueV3tFSolTN29tl3c8WjU8IpSNnYoicHmRfMaoCdWuDwU8Ir5pdWxA/640?wx_fmt=png)

消息变量将被初始化并添加到内存中。但是由于两者之间没有连接，因此在所需模块中它将保持未定义状态。![](https://mmbiz.qpic.cn/mmbiz_png/MpGQUHiaib4ib6gIw3f9QRquCbmJJ9HYEO41YMe2Z9z00c1TdHAZrfviaOV2Eo4ysl7hrGZHjzD5icQQ4cFy8lLBsnA/640?wx_fmt=png)

如果使用实时绑定处理导出，则计数器模块最终将看到正确的值。到超时运行时，main.js 的评估将完成并填写值。

支持这些循环是 ES 模块设计背后的重要理由。正是这种设计使它们成为可能。

（以上是关于 ESM 的理论介绍， 原文链接在文末）。

### Bundle & Bundleless

谈及 Bundleless 的优势，首先是**启动快**。

因为不需要过多的打包，只需要处理修改后的单个文件，所以响应速度是 O(1) 级别，刷新即可即时生效，速度很快。

![](https://mmbiz.qpic.cn/mmbiz_png/MpGQUHiaib4ib6gIw3f9QRquCbmJJ9HYEO4v13NjDahFIic7Y9GAn1WAFCY57oGuAkdxbuXGBhUNvfc7ibRu3UL7tcw/640?wx_fmt=png)

所以， 在开发模式下，相比于 Bundle，Bundleless 有着巨大的优势。

#### 基于 Webpack 的 bundle 开发模式

![](https://mmbiz.qpic.cn/mmbiz_png/MpGQUHiaib4ib6gIw3f9QRquCbmJJ9HYEO4r5x2VwROV8ibDicHVq87lSLlDG6NtWIprETWwCGw7lwjZJN41m1gN9AA/640?wx_fmt=png)上面的图具体的模块加载机制可以简化为下图：![](https://mmbiz.qpic.cn/mmbiz_png/MpGQUHiaib4ib6gIw3f9QRquCbmJJ9HYEO4riafFbTibs6x4W0P4Qo7NtMiaiaB349J104psGJGbicxnIcpaV7RRPPlR5w/640?wx_fmt=png)在项目启动和有文件变化时重新进行打包，这使得项目的启动和二次构建都需要做较多的事情，相应的耗时也会增长。

#### 基于 ESModule 的 Bundleless 模式

![](https://mmbiz.qpic.cn/mmbiz_png/MpGQUHiaib4ib6gIw3f9QRquCbmJJ9HYEO4wsRUJXw3362eZ5yuPQicH2y877TFxVn4FSOA8RrgLhrgiaO7oIVHr9XQ/640?wx_fmt=png)从上图可以看到，已经不再有一个构建好的 bundle、chunk 之类的文件，而是直接加载本地对应的文件。![](https://mmbiz.qpic.cn/mmbiz_png/MpGQUHiaib4ib6gIw3f9QRquCbmJJ9HYEO4z99Dm8r013wZ85AicC9EXcHoZSV2otYXib7QTCaGibibPHQKDMHfSypG5A/640?wx_fmt=png)从上图可以看到，在 Bundleless 的机制下，项目的启动只需要启动一个服务器承接浏览器的请求即可，同时在文件变更时，也只需要额外处理变更的文件即可，其他文件可直接在缓存中读取。

#### 对比总结

![](https://mmbiz.qpic.cn/mmbiz_png/MpGQUHiaib4ib6gIw3f9QRquCbmJJ9HYEO42pficUysMosiakbpuhAN841q8Oia7Zygkia9bRONVwFXN2ibEtCicOMra0Sg/640?wx_fmt=png)

Bundleless 模式可以充分利用浏览器自主加载的特性，跳过打包的过程，使得我们能在项目启动时获取到极快的启动速度，在本地更新时只需要重新编译单个文件。

### 实现一个乞丐版 Vite

Vite 也是基于 ESM 的， 文件处理速度 O(1) 级别， 非常快。

作为探索， 我就简单实现了一个乞丐版 Vite:

GitHub 地址：**Vite-mini**(https://github.com/beMySun/vite-mini)，

![](https://mmbiz.qpic.cn/mmbiz_png/MpGQUHiaib4ib6gIw3f9QRquCbmJJ9HYEO4Xibymhn4InZgCvdq8rqzNlJ94cmE2s359ZqwRTD4Tj8v7sVplCbW4vA/640?wx_fmt=png)

简要分析一下。

> ```
> <body>
> 
>   <div id="app"></div>
> 
>   <script type="module" src="/src/main.js"></script>
> 
> </body>
> ```

html 文件中直接使用了浏览器原生的 ESM（type="module"） 能力。

所有的 js 文件经过 vite 处理后，其 import 的模块路径都会被修改，在前面加上 /@modules/。当浏览器请求 import 模块的时候，vite 会在 node_modules 中找到对应的文件进行返回。![](https://mmbiz.qpic.cn/mmbiz_png/MpGQUHiaib4ib6gIw3f9QRquCbmJJ9HYEO45vvuroEeCypicXsjiaXTiaFIOmJu4wibDB2BvKpFjzK6opibsUeLUu9UsWA/640?wx_fmt=png)其中最关键的步骤就是模块的记载和解析， 这里我简单用 koa 简单实现了一下， 整体结构：

> ```
> const fs = require('fs');
> 
> const path = require('path');
> 
> const Koa = require('koa');
> 
> const compilerSfc = require('@vue/compiler-sfc');
> 
> const compileDom = require('@vue/compiler-dom');
> 
> const app = new Koa();
> 
> 
> 
> 
> // 处理引入路径
> 
> function rewriteImport(content) {
> 
>   // ...
> 
> }
> 
> 
> 
> 
> // 处理文件类型等， 比如支持ts, less 等类似webpack的loader的功能
> 
> app.use(async (ctx) => {
> 
>   // ...
> 
> }
> 
> 
> 
> 
> app.listen(3001, () => {
> 
>   console.log('3001');
> 
> });
> ```

我们先看路径相关的处理：

> ```
> function rewriteImport(content) {
> 
>     return content.replace(/from ['"]([^'"]+)['"]/g, function (s0, s1) {
> 
>         // import a from './c.js' 这种格式的不需要改写
> 
>         // 只改写需要去node_module找的
> 
>         if (s1[0] !== '.' && s1[0] !== '/') {
> 
>           return `from '/@modules/${s1}'`;
> 
>         }
> 
>         return s0;
> 
>     });
> 
> }
> ```

处理文件内容：源码地址 (https://github.com/beMySun/vite-mini/blob/master/server.js#L32)

![](https://mmbiz.qpic.cn/mmbiz_png/MpGQUHiaib4ib6gIw3f9QRquCbmJJ9HYEO4ydXhrTplVCBDnM1by4DQFvOKq62Ze0ePHWia0RGROrNn477e5FcDkqg/640?wx_fmt=png)

后续的都是类似的：

![](https://mmbiz.qpic.cn/mmbiz_png/MpGQUHiaib4ib6gIw3f9QRquCbmJJ9HYEO4mgo2aQEvaqcHfmVniaAxr66J1batmibpUF2iao23ab1SE9QKWPZrRxs0A/640?wx_fmt=png)

这个代码只是解释实现原理， 不同的文件类型处理逻辑其实可以抽离出去， 以中间件的形式去处理。

代码实现的比较简单， 就不额解释了。

### Snowpack

![](https://mmbiz.qpic.cn/mmbiz_png/MpGQUHiaib4ib6gIw3f9QRquCbmJJ9HYEO4DGstbBQujF8yS5iaI6u76jQ0UvRER7xXD0BUrhySibhrsyE6harvrUEA/640?wx_fmt=png)

和 webpack 的对比：

![](https://mmbiz.qpic.cn/mmbiz_png/MpGQUHiaib4ib6gIw3f9QRquCbmJJ9HYEO47zwW0ibhrXmQeTxZDbpUP32h4mvILxLArFOQy4pSpbGicPsozy1YKVFg/640?wx_fmt=png)

我使用 Snowpack 做了个 demo , 支持打包， 输出 bundle。

github: Snowpack-React-Demo(https://github.com/beMySun/snowpack-react-demo/tree/kk/app)

![](https://mmbiz.qpic.cn/mmbiz_png/MpGQUHiaib4ib6gIw3f9QRquCbmJJ9HYEO4ZH4MvEowynbWXnMibOXMp7odYicJiaMFkshC6aIZ7VnyIbRLrSzAAickfg/640?wx_fmt=png)

能够清晰的看到， 控制台产生了大量的文件请求 (也叫瀑布网络请求)，

不过因为都是加载的本地文件， 所以速度很快。

配合 HMR， 实现编辑完成立刻生效， 几乎不用等待：

![](https://mmbiz.qpic.cn/mmbiz_png/MpGQUHiaib4ib6gIw3f9QRquCbmJJ9HYEO4yuzpXWynIicwTickPh2BwmfYmjsSicNNFuJ16BmC04RAO5mibgJnvxiadhA/640?wx_fmt=png)

但是如果是在生产中，这些请求对于生产中的页面加载时间而言， 就不太好了。

尤其是 HTTP1.1，浏览器都会有并行下载的上限，大部分是 5 个左右，所以如果你有 60 个依赖性要下载，就需要等好长一点。

虽然说 HTTP2 多少可以改善这问题，但若是东西太多，依然没办法。

关于这个项目的打包， 直接执行 build：

![](https://mmbiz.qpic.cn/mmbiz_png/MpGQUHiaib4ib6gIw3f9QRquCbmJJ9HYEO4nPicPGOLDKzXtBwZmOSnDj0A5jm0gLdSDYsFSQUq1ZSZjyGxBJ6rnBg/640?wx_fmt=png)

打包完成后的文件目录，和传统的 webpack 基本一致：

![](https://mmbiz.qpic.cn/mmbiz_png/MpGQUHiaib4ib6gIw3f9QRquCbmJJ9HYEO4rE7htXNOib58mqDnAKzwvscdUUAHDicuFDVicAnVz8UqQRrDWDbzBvnJA/640?wx_fmt=png)

在 build 目录下启动一个静态文件服务：

![](https://mmbiz.qpic.cn/mmbiz_png/MpGQUHiaib4ib6gIw3f9QRquCbmJJ9HYEO4KNZjvsX8uXNQQpFh7pOQZzXqMhV9fd2libXdjaOaPdsOV2u9c7nyktQ/640?wx_fmt=png)

build 模式下，还是借助了 webpack 的打包能力：

![](https://mmbiz.qpic.cn/mmbiz_png/MpGQUHiaib4ib6gIw3f9QRquCbmJJ9HYEO4Q07avGuBd5DonjF5TGhjUEiccmicAsCHeKsUeVbic8PUPe1hKHUqfgqAQ/640?wx_fmt=png)

做了资源合并：

![](https://mmbiz.qpic.cn/mmbiz_png/MpGQUHiaib4ib6gIw3f9QRquCbmJJ9HYEO4FtNgNgxicjI7IWGz5mL8Jm6IkgyLoUhRdJtjd6peQKgmbjhV7gLJufw/640?wx_fmt=png)

就这点而言， 我认为未来一段时间内， 生产环境还是不可避免的要走 bundle 模式。

### bundleless 模式在实际开发中的一些问题

开门见山吧， 开发体验不是很友好，几点比较突出的问题：

*   部分模块没有提供 ESModule 的包。（这一点尤为致命）
    
*   生态不够健全，工具链不够完善；
    

当然还有其他方方面面的问题， 就不一一列举。

我简单改造了一个页面， 就遇到很多奇奇怪怪的问题， 开发起来十分难受， 尽管代码的修改能立刻生效。

### 结论

bundleless 能在开发模式下带了很大的便利。但就目前来说，要运用到生产的话， 还是有一段路要走的。

就目当下而言， 如果真的要用的话，可能还是 bundleless(dev) + bundle(production) 的组合。

至于未来能不能全面铺开 bundleless，我认为还是有可能的， 交给时间吧。

结尾
--

本文主要介绍了 esm 的原理， 以及介绍了以此为基础的 Vite, Snowpack 等工具， 提供了两个可运行的 demo：

1. **vite-mini**

    https://github.com/beMySun/vite-mini

2. **Snowpack-React-Demo**

    https://github.com/beMySun/snowpack-react-demo/tree/kk/app

并探索了 bundleless 在生产中的可行性。

Bundleless, 本质上是将原先 Webpack 中模块依赖解析的工作交给浏览器去执行，使得在开发过程中代码的转换变少，极大地提升了开发过程中的构建速度，同时也可以更好地利用浏览器的相关开发工具。

最后，也非常感谢 ESModule、Vite、Snowpack 等标准和工具的出现，为前端开发提效。

才疏学浅， 文中若有错误，还能各位大佬指正， 谢谢。

参考资料
----

1. https://hacks.mozilla.org/2018/03/es-modules-a-cartoon-deep-dive/

2. https://developer.aliyun.com/article/768060

关于奇舞周刊
------

《奇舞周刊》是 360 公司专业前端团队「奇舞团」运营的前端技术社区。关注公众号后，直接发送链接到后台即可给我们投稿。

![](https://mmbiz.qpic.cn/mmbiz_png/MpGQUHiaib4ib6j9X9s2kibfaicBLmIm6dUBqymVmiaKqGFEPn0G3VyVnqQjvognHq4cMibayW2400j4OyEtdz5fkMbmA/640?wx_fmt=jpeg)