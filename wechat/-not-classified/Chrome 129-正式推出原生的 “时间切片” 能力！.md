> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/_SV1yjvPYQoyM8QEsbI73g)

大家好，我是 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf&scene=21#wechat_redirect)。  

最近 Chrome 发布了 129 正式版本，其中包括了几项值得我们关注的更新，今天一起来学习下。

【Web API】scheduler.yield()
--------------------------

JS 执行耗时较长的任务会让浏览器响应用户输入的能力变得更慢，使人觉得网站卡顿，并影响 `INP` 等关键性能指标。

借助最新推出的 `scheduler.yield()`，我们可以将耗时较长的任务分解为较小的任务块，通过明确返回主线程来提高响应能力。

`scheduler.yield()` 在 `Chrome 115` 版本开始推出试用版，并在当前版本正式推出稳定版本。

> 开始试用时写过一篇关于 `scheduler.yield()` 的详细介绍，感兴趣可看：[浏览器也拥有了原生的 “时间切片” 能力！](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247498852&idx=1&sn=5e9de1d0d4c08bc68c61cb2be8cfa853&chksm=c2e1094ff5968059632a33491c5f399348268c50fc6161eb730ec0b0066b08d17f68554de38d&token=2006521491&lang=zh_CN&scene=21#wechat_redirect)

直白点讲，`scheduler.yield()` 的作用就是告诉浏览器：

> “我即将要做的工作可能需要很长一段时间，如果你需要渲染页面、响应用户输入或有其他更重要多任务，没关系，我可以等你们做完再继续！”

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdTDM9JR4kY9UjHCJjUQ4WA6BPYIR71SCL1edxSCjV090rWMXpicBpOJOMT3USna5Aq3fIdW2v48uWQ/640?wx_fmt=png&from=appmsg)

我们可以模拟一堆需要一定耗时的长任务：

```
// 示例任务函数async function validateForm() {  // 模拟任务延迟  return new Promise(resolve => setTimeout(resolve, 500));}async function showSpinner() {  return new Promise(resolve => setTimeout(resolve, 500));}async function saveToDatabase() {  return new Promise(resolve => setTimeout(resolve, 500));}async function updateUI() {  return new Promise(resolve => setTimeout(resolve, 500));}async function sendAnalytics() {  return new Promise(resolve => setTimeout(resolve, 500));}
```

然后使用 `scheduler.yield()` 来保持主线程的响应性：

```
async function saveSettings() {  // 创建任务数组  const tasks = [    validateForm,    showSpinner,    saveToDatabase,    updateUI,    sendAnalytics  ];  // 循环执行任务  while (tasks.length > 0) {    // 从任务数组中移除第一个任务    const task = tasks.shift();    // 运行当前任务   task();    // 记录任务执行    console.log(`${task.name} 已运行`);    // 调用调度器的让出机制以保持主线程的响应性    await scheduler.yield();  }}
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdTDM9JR4kY9UjHCJjUQ4WA65icV3tQiaZ1jxtibP4qwwgHqibud38bmdJpw2ZiaqVoYYwO1SRicw0ScMYicQ/640?wx_fmt=png&from=appmsg)

`scheduler.yield()` 的主要优势是 **延续性**，这意味着在一组任务中如果你使用 `yield` 暂停执行，其他已安排的任务将在 `yield` 点后继续按顺序执行。这可以避免第三方脚本的代码打乱你代码执行的顺序。

如果我们使用 `scheduler.postTask()` 且设定 `priority: 'user-blocking'` 也具有比较好的延续性，因为这种高优先级会让任务尽快执行，减少中断。这种方法可以作为当 `scheduler.yield()` 不可用时的替代方案。

使用 `setTimeout()` （或 `scheduler.postTask()` 且没有设定优先级或者设定为 `priority: 'user-visible'`）会把任务安排到队列的尾部，让其他挂起的任务先运行，这样就不保证任务执行的延续性。

【Web API】Intl.DurationFormat
----------------------------

`Intl` 支持了一种新的格式化持续时间的方法，并支持多种语言环境：

```
const l = "fr-FR";const d = {hours: 1, minutes: 46, seconds: 40};const opts = {style: "long"};new Intl.DurationFormat(l, opts).format(d);// "1 heure, 46 minutes et 40 secondes"
```

【CSS】interpolate-size 属性和 calc-size() 函数
----------------------------------------

CSS 可以实现很多非常酷炫的动画，但我们通常需要明确的指定尺寸，无法使用诸如 `auto`、`min-content` 或 `fit-content` 等内置的尺寸关键词。

`interpolate-size` CSS 属性可以让我们实现一种新的动画效果，当使用内置的尺寸关键词时，之前是无法实现的。

没有 `interpolate-size` 时，下面视频中的按钮没有过渡效果。

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/e5Dzv8p9XdTDM9JR4kY9UjHCJjUQ4WA6cxA3pQRy9TmYwSs0qhzGorq9ZLE7HsaQMsgjFwiau3iboiblx96ibvlqYw/640?wx_fmt=gif&from=appmsg)

添加了 `interpolate-size: allow-keywords` 后，下面视频中的按钮可以拥有丝滑的过渡动画效果。

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/e5Dzv8p9XdTDM9JR4kY9UjHCJjUQ4WA6vQBdXS5jWpZzVKgOH5v2WbsEjMmV5JCHGtBiagOJDBN3DDviajbHrqaA/640?wx_fmt=gif&from=appmsg)

如果我们在 `Root` 元素上指定 `interpolate-size: allow-keywords` 会为整个页面都设置这种新行为。

```
:root {  interpolate-size: allow-keywords;}.item {  height: auto;  @starting-style {    height: 0;  }}
```

为了更精细的控制，类似于 `calc()` 的 CSS `calc-size()` 函数也支持对一个内在尺寸关键词进行操作。在执行布局计算时，尺寸关键词会根据 `calc-size-basis` 评估为原始尺寸。

```
nav a {  width: 17px;  overflow-x: clip;  transition: width 0.17s ease;  &:hover {    width: calc-size(auto, size);  }}
```

【CSS】锚点定位的变更
------------

CSS 锚点定位在 Chrome 125 中已经实现：

> 详情可以看我之前的文章：[Chrome 125：CSS 锚点定位来了！](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247500878&idx=1&sn=a5ab52b4a8b44309025bd6fc9b03b913&chksm=c2e13165f596b873f67cdea8d21752ccf3b11050db472742445bc7feed8e5d69d7129294a671&token=2006521491&lang=zh_CN&poc_token=HFI47majE6agBVqy0ic6qGIxTF7Miyk55kBeBdu7&scene=21#wechat_redirect)

但在 CSS 工作组内部进行了一些额外讨论后，锚点定位的规范和实现上有了一些更改。如果你已经在使用 CSS 锚定位，需要尽快更新你的代码。

首先，`inset-area` 已更名为 `position-area`。之所以更改名称，是因为 `position-` 这种表述更能帮助我们记住这个属性是应用于定位元素的，而不是锚点元素。

其次，`position-try-options` 已更名为 `position-try-fallbacks`。这能帮助我们记住这些只是主要位置的备选方案，主要位置是由基础样式决定的。

最后，`inset-area()` 函数语法从 `position-try` 中移除了。因此，请使用 `position-try-fallbacks: top` 代替 `position-try-fallbacks: inset-area(top)`。

> 了解变更详情：https://developer.chrome.com/blog/anchor-syntax-changes

最后
--

参考：

*   https://developer.chrome.com/release-notes/129
    
*   https://developer.chrome.com/blog/anchor-syntax-changes
    

抖音前端架构团队目前放出不少新的 HC ，有看起会的小伙伴可以看看这篇文章：[抖音前端架构团队正在寻找人才！FE/Client/Server/QA](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247499434&idx=1&sn=8c7497876efc458dca19b6f6a27cadd4&chksm=c2e10b81f5968297533fcfced9ebad6eba072f6436bf040eaa8920256577258ef1077d1f122a&token=1091255868&lang=zh_CN&scene=21#wechat_redirect)，25 届校招同学可以直接用内推码：`DRZUM5Z`，或者加我微信联系。

> 如果你想加入高质量前端交流群，或者你有任何其他事情想和我交流也可以添加我的个人微信 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf&scene=21#wechat_redirect) 。

`点赞`和`在看`是最大的支持⬇️❤️⬇️