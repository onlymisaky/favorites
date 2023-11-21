> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/RVswilfm0MMOBGaMs_3b4g)

大家好，我是 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf&scene=21#wechat_redirect)。

今天继续来为大家解读今年的 `Google I/O` ，我会重点为大家解读前端开发者应该关注的信息，应该包括以下这些方向：

*   一、[Web 平台的最新动态](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247497504&idx=1&sn=5dd6d9659bfdba30419f0c64bcd85030&chksm=c2e1020bf5968b1d1c24322b1e65b2c1c63a5d494c33f06e16eef2f3db6c02b4f72fe8cb9836&scene=21#wechat_redirect)（已发布）
    
*   二、`提升 Web 核心性能指标优化建议（当前篇）`
    
*   三、准备好迎接三方 Cookie 的终结
    
*   四、Web UI 开发的最新动态
    
*   五、Web  动画开发的最新动态
    
*   六、合作打造稳定的 Web 体验
    
*   七、移动端 Web 开发的新功能
    

![](https://mmbiz.qpic.cn/mmbiz_png/e5Dzv8p9XdSd26nVVHUNhVURjkc5a9XPuyc2w2gI8ib2J9xms1SK1UCibWCoHWMF1gfuGLyOwJvp7PS3d3uzj5WA/640?wx_fmt=png)  
`Barry Pollard` 本在章节中分享了 `2023` 年的最佳 `Core Web Vitals` 的优化建议。`Web` 性能方面有非常多的建议，但很难判断哪些建议会产生最大的影响。`Chrome` 团队花费了一年的时间确定了每个核心 `Web` 指标的三项最佳建议，这些建议对于大多数网站都是相关的，并且对于大多数开发人员来说也是实际可行的。

> 在开始之前，如果你对 `Core Web Vitals` 还不够了解，可以先看我这篇文章：[解读新一代 Web 性能体验和质量指标](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247490403&idx=1&sn=9d408c8264fda966e3254ece8d663601&chksm=c2e2ee48f595675ef574b1e39ed72ea1e032ee0465e255da7a2dfafc7217521b205d3ef5120b&token=619618305&lang=zh_CN&scene=21#wechat_redirect)

LCP 优化建议
--------

![](https://mmbiz.qpic.cn/mmbiz_png/e5Dzv8p9XdSd26nVVHUNhVURjkc5a9XP3hTcyQz1rgHNl1evUlNsv23UCSMoLLB9Acv3vWicFUOBrC7GdRueTOw/640?wx_fmt=png)  
首先，让我们来看看网站最大内容渲染时间（`LCP`）的建议。`LCP` 是渲染网页最大内容的时间，相比于 `CLS` 或 `FID`，`LCP` 往往是大多数网站最难以应付的衡量指标。  
![](https://mmbiz.qpic.cn/mmbiz_png/e5Dzv8p9XdSd26nVVHUNhVURjkc5a9XPBibohQThekVorr52Y3kJta1BDMppVU5TqRE1JQE3CWvKRHzIcpCFDoA/640?wx_fmt=png)  
在大多数情况下，约 `70-80%` 的网站是因为需要渲染或下载图片引起的。去年的 `Google I/O` 活动上，他们展示了实际的下载时间往往不是图像的最大延迟，今年的分析进一步证实了这一点。  
![](https://mmbiz.qpic.cn/mmbiz_png/e5Dzv8p9XdSd26nVVHUNhVURjkc5a9XPJcCBK68ayNqC8dn0nhbx8MpuiadpUJrJ3c1F34YFQib0seVF5RN4s19Q/640?wx_fmt=png)

### Image 加载优化

为了优化 `LCP` 的时间，我们可以让使静态 `HTML` 中的图片资源更易于被发现，这有可以让浏览器的预加载扫描程序更早的找到并加载它。  
![](https://mmbiz.qpic.cn/mmbiz_png/e5Dzv8p9XdSd26nVVHUNhVURjkc5a9XPyHS9pamw7CxysSibCr8ZVhMP2KclZat5N0Bfeby2XX2oT8O6P4GRYTA/640?wx_fmt=png)  
使用背景图片、客户端渲染和懒加载等方法是可能存在问题的，它们不利于 `LCP` 的发现。  
![](https://mmbiz.qpic.cn/mmbiz_png/e5Dzv8p9XdSd26nVVHUNhVURjkc5a9XPiafZWcaLDULBZF0BZyN2Xzic9jmECz3R7ciaZibcmhu9z0NBX8nibU7PUDg/640?wx_fmt=png)  
而使用传统的 `img` 元素或添加预加载链接等方式则可以使图像资源被预加载扫描程序发现，并被浏览器尽早加载。  
![](https://mmbiz.qpic.cn/mmbiz_png/e5Dzv8p9XdSd26nVVHUNhVURjkc5a9XPY6yBORUE8icZkK09xU8AfAiaKzp6DlbZxUWy776HTV0ich6CRgCPaYpng/640?wx_fmt=png)  
你还可以使用 `Chrome devtools` 中的加载瀑布工具来识别开始加载较晚的资源，通过把图片包含在 `HTML` 中（让图片元素预加载）即可解决这个问题。但是在将 `LCP` 图像优化的可以被易于发现后，并不代表就可以更快的加载。因为浏览器更倾向于优先处理阻塞渲染的内容，如 `CSS` 和同步 `JavaScript`，而不是图像。  
![](https://mmbiz.qpic.cn/mmbiz_png/e5Dzv8p9XdSd26nVVHUNhVURjkc5a9XPCwOicmm7Gx5QmmiaS7U1ufxVMAzfobuKv6VLQ7hAg87scicE8qjAlXAfw/640?wx_fmt=png)

### fetch proirity API

新的 `fetch proirity API` 允许我们自定义标记资源的优先级。只需将 `fetchprority` 属性添加到我们的图像或预加载 `LCP` 元素中，就可以使浏览器更早地开始下载它们，并具有更高的优先级，这可以对 `LCP` 时间产生很大的影响。这个 `API` 已经在基于 `chromium` 的浏览器中提供，`Safari` 和 `Firefox` 也正在实现相关代码，并且这个属性是渐进式的，在不支持它的其他浏览器中会被简单地忽略。  
回到之前的例子，我们解决了图片可尽早被发现的问题，但是请求图像和开始下载依然会存在很大的延迟。使用  `fetch proirity API` 可以将延迟最小化，并且让图像尽快下载。  
![](https://mmbiz.qpic.cn/mmbiz_png/e5Dzv8p9XdSd26nVVHUNhVURjkc5a9XPvU6grNAZ2OZUJ8dQJqiagyGbpgsGnQCcmicbesESIUciboGicSfEUYy4YA/640?wx_fmt=png)  
这是一个优化 `LCP` 指标的最佳示例，我们还可以通过其他多种方式降低非关键资源的优先级。  
![](https://mmbiz.qpic.cn/mmbiz_png/e5Dzv8p9XdSd26nVVHUNhVURjkc5a9XPIIIUQiaZBRPcEibotdAricgS2kpZt359TK8KRajzQwxSMxqmygGSsH68Q/640?wx_fmt=png)  
例如使用`fetchprority=low` 或者对它们进行懒加载，以便按需获取，这样就可以让浏览器集中处理更重要的资源，比如影响 `LCP` 指标的元素。我们只需要确保不要在 `LCP` 图像本身上使用这些技术即可。  
![](https://mmbiz.qpic.cn/mmbiz_png/e5Dzv8p9XdSd26nVVHUNhVURjkc5a9XP5GdkA7l6ibKoAmf3ViajibaXHKGibpPbNppRwEbLOhAjXRjpfNiccXDz0jQ/640?wx_fmt=png)  
如果我们使用了 `JavaScript` 框架，建议使用 `Chrome Aurora` 团队开发的 `Image` 组件添加图像。其中 `Angular` 和 `XJS` 组件已经内置了提取优先级的支持，团队也正在开发 `Next.js` 的 `Image` 组件，以支持这个新的 `API` 。  
![](https://mmbiz.qpic.cn/mmbiz_png/e5Dzv8p9XdSd26nVVHUNhVURjkc5a9XP4oz2nB4SVm1lkv5buO8KxnF4PNiczEQXIJiahBBkCQTUibIKOMvribOL3w/640?wx_fmt=png)  
`Chrome` 团队也与其他平台有着合作，例如如果大家使用的是 `WordPress`，就可以尝试使用官方 `WordPress` 性能实验室插件的新提取优先级模块。这是 `Chrome` 团队与 `WordPress` 核心性能团队开发合作的成果。

### 使用 CDN

前两个 `LCP` 的建议是和如何构建 `HTML` 来让 `LCP` 资源易于被发现以及优先下载有关，但这都取决于首屏加载 `HTML` 的速度。所以，最后一个建议是使用 `CDN` 来优化 `First Byte` 的时间。  
![](https://mmbiz.qpic.cn/mmbiz_png/e5Dzv8p9XdSd26nVVHUNhVURjkc5a9XPxncI906ribK0c1FYXdef9IH9axM3Jicznf0s0HwF9p3ibxKdQVHef3Tlw/640?wx_fmt=png)  
在浏览器收到第一次 `HTML` 请求响应的第一个字节之前，网站是无法开始加载任何子资源的。越快将首节传递给浏览器，浏览器就可以越快地开始处理它，同时也可以让其他所有的操作都更快的进行。下面是两个减少 `ttfb` 的最佳方法：

*   （1）尽可能地将内容服务器设置为地理位置更靠近用户的位置来减少用户与服务器之间的距离；
    
*   （2）对内容进行缓存，以便最近请求的内容可以快速再次提供。
    

![](https://mmbiz.qpic.cn/mmbiz_png/e5Dzv8p9XdSd26nVVHUNhVURjkc5a9XPvUBk0F0Xt5N9uzsMQjfMCe2iceHxGywiaWeS18DtuW5suEF9n6eyIqtw/640?wx_fmt=png)  
内容分发网络（`CDN`）是执行这两个操作的最佳方法。`CDN` 是一组全球分布式的服务器，它作为用户的连接点。由于最后一英里的传输速度往往是最慢的，而使用 `CDN` 可以尽可能的优化这个问题。  
`CDN` 还允许在这些边缘节点上缓存内容，从而进一步降低加载时间，所以即使必须要返回到我们的源服务器进行回源加载，`CDN` 通常也可以更快地完成。  
![](https://mmbiz.qpic.cn/mmbiz_png/e5Dzv8p9XdSd26nVVHUNhVURjkc5a9XPMPMdicxLicFicb1YHVk8pcQ3YmfiaMpicjzJnOicibPjhQqHRIcRTQia2Kmy3Q/640?wx_fmt=png)  
开发者经常使用 `CDN` 来托管静态资源，如 `CSS、JavaScript` 或  `Media` 文件，但是通过 `CDN` 提供 `HTML` 也可以获得更多的好处。根据 `Web Almanac` 的统计结果，只有 `29%` 的 `HTML` 文档请求会通过 `CDN` 服务加载。如果你不是这样做的，那么这意味着你还有很大的机会来优化网站的性能。

CLS 优化建议
--------

下面，我们来看看累积布局移位（`CLS`）的优化建议。`CLS` 是网页视觉稳定性的度量指标，意味着当有新的内容加载时，页面的内容是否经常跳动。  
![](https://mmbiz.qpic.cn/mmbiz_png/e5Dzv8p9XdSd26nVVHUNhVURjkc5a9XPxteDmqh2kEzLEWBaAOZQUote6t1gg64NpSoFXskWr1iaxIpVhicT66Zg/640?wx_fmt=png)  
虽然 `CLS` 在 `2020` 年以来得到了很大的改进，但仍然有约四分之一的网站未达到推荐的阈值，所以很多网站在这方面还有很好的改进用户体验的机会。

### 内容大小

第一个 `CLS` 优化建议是确保内容能被显式地缩放，当它第一次被浏览器渲染时，它就可以以正确的尺寸渲染。  
![](https://mmbiz.qpic.cn/mmbiz_png/e5Dzv8p9XdSd26nVVHUNhVURjkc5a9XPWuGWR1PPkNWiczyicKWS2Dd1qXP3Bcx88Pias1gXWyw8ycOAIlvma1bBw/640?wx_fmt=png)一般情况下，我们都会热衷于推荐大家设定图像的宽度和高度的尺寸或 `CSS` 等效尺寸，现在这仍然是影响 `CLS` 的主要原因，网站也往往可以通过提供这些尺寸来轻松的优化 `CLS`，但还有一些其他的优化点。  
![](https://mmbiz.qpic.cn/mmbiz_png/e5Dzv8p9XdSd26nVVHUNhVURjkc5a9XPjYQT5EHL8nyutK7xA6K3icia4hAeg40T0iaj301GtCj7QIicAXMUtGfqhA/640?wx_fmt=png)  
比如我们可以通过新的 `CSS`  `aspect-ratio` 属性，就可以确保像视频这样的其他非图像内容也能够较好的响应。  
![](https://mmbiz.qpic.cn/mmbiz_png/e5Dzv8p9XdSd26nVVHUNhVURjkc5a9XP6EFEUGYt6dEHUsFsMib20GozxpANZDxbXfO8V6TYLiaftrd4k8FehJfg/640?wx_fmt=png)  
另外还可以将渲染的文字设置适当的高度，例如使用 `min-height` 来为广告卡片等动态的内容保留最小空间，空元素的默认高度为零像素，所以即使对于某些动态的内容，我们不能确定实际的高度，也是可以通过使用 `min-height` 来减少 `CLS` 的影响。

### BF Cache

我们去年看到 `CLS` 的最大改进之一是在 `Chrome` 中推出的回退缓存或 `BF` 缓存中。另外，`Safari` 和 `Firefox` 也已经上线这个功能一段时间了。  
![](https://mmbiz.qpic.cn/mmbiz_png/e5Dzv8p9XdSd26nVVHUNhVURjkc5a9XPV7l6lCrQnibd01eTLicePDicewfjzHOJkOEd5IpjXzFfVFwiacBmPVBa2g/640?wx_fmt=png)  
一个页面可能在初始加载时具有很大的 `CLS` ，因为随着其他内容（如图像和广告）的加载，页面的结构会一直产生变化，从而影响 `CLS`。当然，我们应该尽量在首屏页面渲染时避免加载这些内容。  
![](https://mmbiz.qpic.cn/mmbiz_png/e5Dzv8p9XdSd26nVVHUNhVURjkc5a9XPibRNyPBNT3J8T5pR55hcrxSvZickiazJF25iaFbRkiajJEiaMNp6lkOpQthA/640?wx_fmt=png)  
`BF` 缓存会在用户离开之后，在内存中存储一个用户加载页面后的完整 `CLS` 快照。如果用户返回了这个页面，就会恢复这个快照。同样的，如果用户再次向前访问，则也可以恢复这个快照。这就完全消除了任何 `CLS` 的加载，如果从头开始重新渲染页面，`BF` 缓存也会默认启用，我们不需要采取任何措施来主动启用它，但是我们可以使用某些 `API` 阻止浏览器使用它，但这可能会导致浏览器没办法更好的响应，建议大家不要放弃这种免费的性能优化方案。  
![](https://mmbiz.qpic.cn/mmbiz_png/e5Dzv8p9XdSd26nVVHUNhVURjkc5a9XPJQnZ7esvCHYsFQicEic96g0WUiaHhGTTvlFSOzPQj6FwndMHLGklMVd1g/640?wx_fmt=png)  
`Chrome DevTools` 有一个工具，可以让我们测试页面是否有使用 `BF Cache` 的资格。如果没办法使用 `BF Cache` ，工具一般都会告诉我们具体原因。最常见的原因是我们设定了 `cache-control` 这个 `Header` 的值为 `no-storage`或者在页面中使用了 `unload handler`，这两者都会阻止 `BF Cache` 的使用。  
![](https://mmbiz.qpic.cn/mmbiz_png/e5Dzv8p9XdSd26nVVHUNhVURjkc5a9XPNltZbibeDibc57lM9tPeA15fOmHe3dpU99QUOtZZT9faTQX1WmAQ8ibKg/640?wx_fmt=png)  
在 `Lighthouse 10` 中，也添加了一个类似的检测能力，也可以解释页面不符合资格的原因。  
![](https://mmbiz.qpic.cn/mmbiz_png/e5Dzv8p9XdSd26nVVHUNhVURjkc5a9XPr66Y2HpuibRGOsqwDse6byEWvpU5r0U2A7CPjghcfPYYGxFUvvRyXRA/640?wx_fmt=png)  
`BF Cache` 是 `Chrome` 团队为了让网页浏览更快的正在开发的一系能力之一，这个领域还有一些其他的能力，比如预加载和预渲染也是可以改善网站 `CLS` 指标的。

### 动画和转换的处理

最后一个 `CLS` 建议是处理动画和转换。动画通常用于移动端的内容，如 `cookie banner` 或从顶部或底部滑入的其他通知横幅，者具体取决于这些动画或过渡是怎么编码的，它们可以更少或者更有效，并且可以帮助优化 `CLS`。  
![](https://mmbiz.qpic.cn/mmbiz_png/e5Dzv8p9XdSd26nVVHUNhVURjkc5a9XPcxIv8DCZIEdfnjJud9A9EWZpmFbuHQb8e9NapfDgBmCWXXWQhA2HsA/640?wx_fmt=png)  
动画的渲染需要浏览器重新布局页面，因此需要更多的工作，即使脱离正常文档流的绝对定位元素，例如使用 `top` 或 `left` 移动内容，也会将其计算为布局移位，即使它不会移动任何周围其他的内容，内容本身也在移动，并且有可能影响其他内容，所以这也会影响 `CLS`。  
![](https://mmbiz.qpic.cn/mmbiz_png/e5Dzv8p9XdSd26nVVHUNhVURjkc5a9XPzeaSjZ46W2icdH4vjjBebrttfGxDPzsrrq7fDd8a6BPAn9K0FKUaDdg/640?wx_fmt=png)  
使用 `translate` 进行相同的动画不会在浏览器的布局处理中移动内容，而是在合成器层中进行的，除了对于浏览器来说工作量较小之外，这还意味着它无法影响其他的内容，这也意味着它对 `CLS` 的影响就变小了。所以我们的解决方案就是替换使用 `top` 或 `left` 的动画，并且这种方式在所有的浏览器中都得到了支持。  
![](https://mmbiz.qpic.cn/mmbiz_png/e5Dzv8p9XdSd26nVVHUNhVURjkc5a9XPOvnXDrP18IJCAFhjX1RHtsagibicClqo7ib3sbeB16TibWnv1vvbubRtkA/640?wx_fmt=png)  
始终优先使用复合动画，比如如 `transform` ，而不是图层诱导的非复合动画，如更改 `top、right、bottom` 和 `left`。  
![](https://mmbiz.qpic.cn/mmbiz_png/e5Dzv8p9XdSd26nVVHUNhVURjkc5a9XPJ3rcY3CxicgSYPhIjeKmVJzkibiasSFwqLiawPuzNlKLmyBA3icgqBzlWCw/640?wx_fmt=png)  
并且 `Lighthouse` 也有一个相关的能力来识别这些问题。

FID 优化建议
--------

最后我们来看看用户响应相关的优化建议，这包括用户和页面进行首次交互操作所花费的时间（`FID`），以及更全面的交互到下一次绘制的时间（`INP`）。  
![](https://mmbiz.qpic.cn/mmbiz_png/e5Dzv8p9XdSd26nVVHUNhVURjkc5a9XPZraOdezKQ6Rr1vQybd9KGicic4wn5hzT6cue1e295stCdzE1Qhj7K2rw/640?wx_fmt=png)  
网站响应性的关键在于确保不阻塞主线程，因为这会导致浏览器无法响应用户输入。

### 分解长任务

第一个建议是识别并分解长任务，相当于给浏览器一些喘息的空间，以便它能够响应用户输入。  
![](https://mmbiz.qpic.cn/mmbiz_png/e5Dzv8p9XdSd26nVVHUNhVURjkc5a9XPIPoXW1uuRaPFuzUpAfp70qKZxibSxITuuCjIpJsa4kM6owwgpdT32NQ/640?wx_fmt=png)  
`Chrome Devtools`和 `Lighthouse` 将长任务定义为需要 `50` 毫秒或更长时间的渲染工作。这可能听起来不是很多，但在浏览器术语中，这可以是网站能感觉到比较好的响应或不响应的区别。  
![](https://mmbiz.qpic.cn/mmbiz_png/e5Dzv8p9XdSd26nVVHUNhVURjkc5a9XPV0yS2V3uOx8BmKh0APW0TrMOPxBDgvFiblYStwCISKq7rUj3dqUeT8A/640?wx_fmt=png)  
`JavaScript` 是单线程且贪婪的，一旦它占用了 `CPU`，它就会尽可能地一直保持它，直到它不能处理或者处理完毕为止。在这个例子中，即使有五个子进程，所有的五个进程也是会一个接一个地执行。所以，在我们的代码中放置一些断点就是关键了。  
![](https://mmbiz.qpic.cn/mmbiz_png/e5Dzv8p9XdSd26nVVHUNhVURjkc5a9XPgialKYH235Qd4icQLZrZ79g294kC0leLrKgt0iao30vgZEYib1AYgFKdDQ/640?wx_fmt=png)  
我们可以使用设置超时 `settimeout 0` 毫秒延迟来放入非关键的工作和新的任务，这些新任务就会在已经排队的任何任务之后执行。  
![](https://mmbiz.qpic.cn/mmbiz_png/e5Dzv8p9XdSd26nVVHUNhVURjkc5a9XPYnTRcBmMH0tRHfLfU9HKweur91k3SUGjdcFUedrxj1M07AZlTwh3fA/640?wx_fmt=png)  
还有一些新的和即将推出的浏览器 `API` ，如 `isInputPending`、`scheduler.postTask` 和 `scheduler.yield`，它们可以帮助大家决定何时以及如何放弃主线程。有关更多详细的信息，可以去看 `web.dev` 上优化长任务的相关文章 ：https://web.dev/optimize-long-tasks/ 。另外，在 `Google I/O` 上，还有一个专门关于优化长任务的独立演讲。

### 去除不必要的 JS

尽管优化我们页面上的 JavaScript 代码执行是一个不错的方法，但更好的方式是一开始就不要发送太大的 `JavaScript`。  
![](https://mmbiz.qpic.cn/mmbiz_png/e5Dzv8p9XdSd26nVVHUNhVURjkc5a9XPlcwFga7SqWCp0TwcNclGNctM5nYtDJL2E1ick7ZkJBicbWDYEHx3tOfg/640?wx_fmt=png)  
现在的网站上加载的 `JavaScript` 越来越大了，但我们需要重新检查一下有这些 `JavaScript` 是否都是必要的。  
![](https://mmbiz.qpic.cn/mmbiz_png/e5Dzv8p9XdSd26nVVHUNhVURjkc5a9XPNll8nfdhtYtm2icnvicEJHboTDuSsuxYN823o3ytN7Tmq0RycMiaMXeDw/640?wx_fmt=png)  
我们可以使用 `Chrome Devtools` 的 `Coverage` 特性来查看我们的 `JavaScript` 有多少被执行了。如果在页面加载期间没有使用的大部分 `JavaScript` ，都可以考虑进行代码分离以在需要时或浏览器不太繁忙的时候加载这些代码。  
![](https://mmbiz.qpic.cn/mmbiz_png/e5Dzv8p9XdSd26nVVHUNhVURjkc5a9XPw82LTKI6fYggQ32CT26DayAibJ8EolNel937bVmhKxbsCrcEciaAIOwA/640?wx_fmt=png)  
`Aurora` 团队还开发了一个 `xjs`  脚本组件，允许我们加载较少且关键的第三方代码，并采用各种策略来减少这些脚本的影响。标签管理器是另一个容易积累旧 `JavaScript` 代码的地方，这些代码可能不再需要了。定期检查我们的标签，以确保删除所有标签，因为即使它们不再触发，它们仍然需要下载、解析和编译。

### 避免大型渲染更新

改善响应性的最后一个建议是避免大型渲染更新。`JavaScript` 不是唯一可以影响我们网站响应性的东西，如果浏览器需要大量的工作来将页面渲染到屏幕上，那么浏览器本身也可能会变慢。大型渲染更新可能会在有大量`Dom` 更改时发生，无论是有意还是由于一个更改导致许多其他元素需要重新计算。避免大型渲染更新的最佳方法是保持较小的 `Dom` 结构，以便即使存在关联效应，也可以快速处理它们。  
![](https://mmbiz.qpic.cn/mmbiz_png/e5Dzv8p9XdSd26nVVHUNhVURjkc5a9XPJSJgX2J2Y0AkD9kA5uS0Ewb1uqIbVIe9GOk7TPes6FxmN15Iny9e4w/640?wx_fmt=png)  
我们还有一个 `Lighthouse` 审计工具来帮助大家实现这一目标。  
![](https://mmbiz.qpic.cn/mmbiz_png/e5Dzv8p9XdSd26nVVHUNhVURjkc5a9XPD2GtuZIq3xFunsjfjr6icMsSSouics4JjE8cb5O8vmAbEad0IzJIGBFw/640?wx_fmt=png)  
`CSS containment` 是另一种分离网页区域的方法，它可以告诉浏览器某些区域中的元素可以不受其他区域更改的影响，从而减少布局的工作。  
![](https://mmbiz.qpic.cn/mmbiz_png/e5Dzv8p9XdSd26nVVHUNhVURjkc5a9XP6LrwDyVORDmXibXycXxKxUgibcV8CdKqcGyZyw0gOqtK4YB0aX3jiaO9A/640?wx_fmt=png)  
`content-visibility` 是 `CSS containment` 的一种扩展能力，允许我们能完全跳过离屏内容的布局和渲染。  
![](https://mmbiz.qpic.cn/mmbiz_png/e5Dzv8p9XdSd26nVVHUNhVURjkc5a9XPQwnOrxvK9ib3Ft45oVDa7OqdGa0IVw2s0FeSwKibdcNHQlXDaCFSIr8Q/640?wx_fmt=png)  
最后，大家应该避免滥用 `requestAnimationFrame API`，它应应该只用于关键的渲染工作，如果通过这个 `API` 安排了过多的工作，它会导致渲染变慢。  
![](https://mmbiz.qpic.cn/mmbiz_png/e5Dzv8p9XdSd26nVVHUNhVURjkc5a9XPRibR9bK5dW641gpEEaJFF9gtTCag35nvhYUPpVrBUyBQcUVxaGmnOibg/640?wx_fmt=png)  
这些就是我们认为大家首先应考虑的九个改善网站核心性能指标的优化建议。这并不是一个明确的列表，而是我们的研究表明可以真正提高大家网站性能的几个更有影响力的选项。包括 `Chrome Devtools、Lighthouse` 和我们添加到 `JavaScript` 框架和平台中的组件，许多这些建议已经涵盖在我们的各种工具中。但我们并没有放松警惕，并且也在一直更新我们的工具和文档，来呈现这些关键建议。

最后
--

参考：https://youtu.be/mdB-J6BRReo

> 如果你想加入高质量前端交流群，或者你有任何其他事情想和我交流也可以添加我的个人微信 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf&scene=21#wechat_redirect) 。

`点赞`和`在看`是最大的支持⬇️❤️⬇️