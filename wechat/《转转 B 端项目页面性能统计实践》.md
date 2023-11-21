> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/3eSXgZsuh0321SRFB5P1CA)

  

  

### 背景

由于转转前端业务方向主要偏向于 C 端，比如 App 端内 H5、 小程序内 H5 等，并且技术栈以 Hybrid 为主（承载容器为转转标准化 webview）。但是，近些年随着业务不断扩大，逐渐出现了如`乾数据平台`、`行星平台`等 专门服务 B 端的 FE 项目。但是没有相关性能数据来作为参考支撑，比如需要分析用户体验质量；分析现有页面性能缺陷以及后续需要做性能优化的方向等。因此，需要一款符合转转内部埋点上报体系的 PC 端项目网页的性能统计平台。

### B 端性能统计面临的问题

由于内部性能埋点统计体系不支持分批 / 分段上报，每个 Router 都需要作为一个单独的页面进行一次性的性能数据上报。在 B 端，一些新的指标需要支持和特殊处理。因此，在数据采集统计方面，我们会遇到以下几个问题。

1.  SPA Router 问题 转转内部 C 端项目主要采用 hybrid 技术栈，因此不需要对 SPA 项目路由做特殊处理（因为每次都开启一个 webview，类似于多页面应用应用场景）。但是，基于 React 技术栈的 B 端项目是 SPA 项目，为了方便统计每个 Router 页面的性能数据，我们需要对每个 Router 页面的加载进行一些特殊处理。
    
2.  SPA 资源统计问题 现在的前端 SPA 项目一般都会通过异步加载页面资源的方式，进行页面打包体积的优化，以提升页面首屏性能。因此，在进行资源统计时，我们需要单独对相应的 Router 页面的加载资源进行统计处理。
    
3.  B 端指标定义问题 转转 B 端性能统计主要参考核心指标：白屏、首屏、完全加载。页面性能分数评估也主要基于这三个指标进行加权计算。但是，在 Router 页面加载时，我们会遇到核心性能指标无法直接获取的问题，因为 Router 切换并不会产生页面的 load，而只是 div 的显示隐藏。当然了，还需要其他 B 端特有的业务标识定义，这里不一一列举。
    

### 主要内容

#### 1. 性能指标定义

定义好哪些性能指标需要上报，是做好一个完善的采集性能数据采集 sdk 的前提条件，经过分析主要将指标分为两类：1. 纯 H5 页面性能指标 2. 页面相关业务性指标。

*   纯 H5 页面性能指标
    

1.  性能核心指标主要包括：`白屏时间` 、 `首屏时间`、 `页面完全加载时间`，以及新增的用户体验指标 `LCP`、 `FID`、 `CLS` 。
    
2.  辅助性性能指标包括：`DNS 解析` 、`请求响应时间`、 `DOM开始构建时间`、 `页面可交互时间`、 `DOM构建完成时间`、 `网络速度`、 `各类静态资源耗时`、 `ajax请求耗时`、 `LongTask` 等等。
    

以上提到的绝大部分指标，可以通过浏览器提供的 `PerformanceNavigationTiming` `PerformanceResourceTiming` API 和 谷歌团队提供的 `web-vitals` 工具函数很方便的进行获取和计算。

*   业务性相关指标:
    

所谓业务性指标，主要是作为查询分析的一些要素，比如 我们想查询某个业务线的某个项目的某个页面在某个平台下某个性能指标的表现如何？那么就需要一些非页面性能本身的业务要素指标进行定义和上报统计。

业务指标主要包括：`actiontype` 埋点类型标识 、 `pagetype` 业务线 / 项目标识、`pageid` 页面标识 、 `clientType` 端信息、 `pagestate` 页面状态、`pageurl` 页面 url、 `cookieid` 用户 id、 `fromType` 来源、 `loadcnt` 加载次数 等等。

> PS: web-vitals 由于在苹果和低版本安卓的兼容性存在问题，因此没有在 C 端作为一个必选项，但 B 端用户绝大多数使用 chromium 内核浏览器，所以大胆的将 web-vitals 纳入采集指标中

#### 2. 指标数据的获取与上报

上面进行了各种指标的定义，那么如何高效有序的接入到转转埋点体系内进行上报统计呢？转转内部其实已经有了 C 端埋点体系，其实只需要按照一定的规则进行接入即可，主要是性能平台 B 端项目需要的字段和后端已有日志表结构做好关系映射和扩展。

为了解决上面提到 B 端项目的特有问题，以及满足上述提到所有性能指标、业务指标都可以很优雅的进行上报统计，方便在代码层面更好的进行结构上的解耦，并且尽量做到性能计算统计相关程序不影响页面本身的性能，在技术实现设计层我们把上面的指标做了一些分类，比如 同步计算指标（基础业务同步指标、基础性能资源同步指标）、异步计算指标（性能异步指标、后置异步指标）等。具体如下图所示。

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNN9A1B6Pr8mSFYmGMcwiaiaBHy6ocxCyItsoLX078Uhibl19uAaaficFY7Bv3Wv6QP4MjYDHiasCy5hPN1A/640?wx_fmt=png)技术层面指标分类

下面详细介绍一下一些关键逻辑是怎么处理的？各类性能指标具体是怎么计算的？下面列出了部分指标怎么获取和计算的关键代码。

SPA 项目的路由页面的拦截关键逻辑：

```
const hackRouter = () => {  if (!window?.history?.pushState) {    return;  }  // 浏览器的历史记录发生变化时被触发, 导航前进、后退  const oldOnPopState = window.onpopstate;  window.onpopstate = function(this: WindowEventHandlers, ...args: any[]): any {    const to = window.location.href;    const from = lastHref;    lastHref = to;    // 通知订阅的回调    triggerHandlers('history', {      from,      to    });    if (oldOnPopState) {      try {        return oldOnPopState.apply(this, args);      } catch (e) {}    }  };  // history pushState 或 replaceState 触发，通过 history api 方式  const wrapHistoryFn = (type: 'pushState'|'replaceState') => {    const originalHistoryFunction = window.history[type]    return function(this: History, ...args: any[]): void {      const url = args.length > 2 ? args[2] : undefined;      if (url) {        // coerce to string (this is what pushState does)        const from = lastHref;        const to = String(url);        lastHref = to;        // 通知订阅的回调        triggerHandlers('history', {          from,          to        });      }      return originalHistoryFunction.apply(this, args);    };  };  window.history.pushState = wrapHistoryFn("pushState");  window.history.replaceState = wrapHistoryFn("replaceState");}
```

性能基础指标的获取相关代码：

```
// 获取 PerformanceTiming 相关数据export const getPerformanceTimingData = (task: TaskTypes) => {  if (!window?.performance?.timing) return {}  const { metrics } = task;  const { state } = task.ctx;  const ptiming = performance.timing;  // 默认为 -1 方便过滤无效值  const result = {    blankTime: -1,    dnsTime: -1,    httpTime: -1,    domTime: -1,    domReady: -1,    // ...  }  // 页面加载状态  if(state === 'pageload') {    // ...    // 白屏    result.blankTime = fix(ptiming.responseStart - ptiming.navigationStart);    // DNS查询    result.dnsTime = fix(ptiming.domainLookupEnd - ptiming.domainLookupStart);    // HTTP请求    result.httpTime = fix(ptiming.responseEnd - ptiming.responseStart);    // 解析dom树    result.domTime = fix(ptiming.domComplete - ptiming.domInteractive);    // DOMready    result.domReady = fix(ptiming.domContentLoadedEventEnd - ptiming.navigationStart)    // ...  }  // 路由切换状态  if (state === 'navigation') {    // ...  }  return result}
```

资源相关指标的数据获取关键逻辑：

```
// 记录let performanceCursor: number = 0;// 获取当前页面资源列表export const startPerformance = (task: TaskTypes) => {  const { timeOrigin } = task.ctx;  if (!window.performance || !window.performance.getEntries || !timeOrigin) {    return;  }  // performanceEntries  const performanceEntries = performance.getEntries();  const pss = performanceEntries.slice(performanceCursor);  // 处理 各种 performanceEntry 资源  formatResourceEntries(task, pss);  performanceCursor = Math.max(performanceEntries.length - 1, 0);}export const formatResourceEntries = (task: TaskTypes, entries: PerformanceEntryList) => {  const { state, startTimestamp, timeOrigin } = task.ctx;  const { metrics } = task  entries.forEach(entry => {    const startTime = entry.startTime;    // console.log( timeOrigin, startTime, startTimestamp, timeOrigin + startTime < startTimestamp)    if (state === 'navigation' && timeOrigin + startTime < startTimestamp) {      return;    }    const baseStartTime = startTimestamp - timeOrigin;    switch (entry.entryType) {      case 'navigation':        // 处理 bodysize         // ...      case 'paint':        // 处理 paint 指标 fcp fp        // ...      case 'resource':        // 序列化各种资源, 如js/css/img/jsonp/ajax/fetch/iframe...        calcResource(entry, result, baseStartTime);    }    // ...}
```

业务指标数据的获取：

```
// 初始化基础业务指标export const initBaseData = (task: TaskTypes) => {  const { params = { backup: {} }, options = {} } = task;  // ...  Object.assign(params, {    pagetype: options?.pagetype || pagetype,    actiontype: options?.actiontype || actiontype,    appid: options?.appid || appid,    // and more ...  });  return task;}
```

longTask 的记录获取：

```
function startLongTasks(): void {  const entryHandler = (entries: PerformanceEntry[]): void => {    for (const entry of entries) {      const startTime = entry.startTime      const duration = entry.duration;      const endTime = startTime + duration;      const longtask = {        name: `longtask-${++n}`,        startTime,        endTime,        duration      }      longTasks.push(longtask);    }  };  if(PerformanceObserver?.supportedEntryTypes?.includes('longtask')) {    // 注册 longtask 异步任务    observe('longtask', entryHandler);  }}
```

> 在实际项目统计时，发现一些性能指标算法的适用性问题需要注意：
> 
> 1.  LCP 算法存在的问题。  
>     比如：触发条件限制的问题，当检测到用户输入时候 FMP 算法会停止计算，就导致某些场景触发不了（比如主要内容还没显示就点击页面）。白屏占位图问题，页面初始有较大的白屏占位图时 即使后面被移除了，LCP 算法还会把它当作主要内容。
>     
> 2.  FMP 算法不适合某些特殊场景。比如：2/3 是金刚位图片布局，最下面 1/3 区域有一个瀑布流，由于 FMP 算法计算规则会导致统计时间在瀑布流请求之后展现后，就导致直观上的页面首屏时间变大。
>     

数据可以计算并获取了，那么如何进行友好的处理上报？

由于内部埋点提下不支持回话形式的分段上报，那么就需要在前端提前准备好所有需要需要上报的数据的处理，整体 B 端 SPA 项目性能数据处理的上报处理机制，以及同步任务数据、异步任务数据任务的处理流如下图所示。![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNN9A1B6Pr8mSFYmGMcwiaiaBHyatGSnCxd57XRXXK1h39bZ0NuRF03DxxIHUXmJMiazicDm6uYbj67PibBw/640?wx_fmt=png)

#### 3. 上报数据的体积优化

在进行数据上报时，如果页面的静态资源加载 / ajax 请求数量很多时，埋点上报请求接口的 body 会很大，导致请求耗时长而影响页面本身的性能。因此针对 body 过大的问题，对一些资源的统计做了序列化处理。

比如：单条静态资源的原始数据结构为：

```
const entry:PerformanceResourceTiming = {  "name": "https://xxx.zzz.com/yyy.css?v=5J1NDtbnnIr2Rc2SdhEMlMxD4l9Eydj88B31E7_NhS4",  "entryType": "resource",  "startTime": 1924.6000000238419,  "duration": 1400.5999999642372,  "initiatorType": "link",  "fetchStart": 1924.6000000238419,  "responseEnd": 3325.199999988079,}
```

序列化之后，将各个关键数据合并成一个字符串，即：

```
// 将 entries 分类，并把单个entry 进行字符串化后，再将所有 css entry 合并const cssEntry:string = 'https://xxx.zzz.com/yyy.css|1924|1924|3325'
```

可以发现系列化精简后将 255 个字符优化成了 42 个字符。

> 往往 B 端 SPA 项目静态资源和请求多达几十上百个，这样序列化处理合并之后，能将埋点上报请求 body 体积减少数千个字节。当然了，如果服务支持编解码，还可以通过其他更优的序列化方案进行 body 体积压缩。

#### 4. 数据存储与处理

在对数据进行处理时，也遇到了一些问题。

> 1.  每天上报的性能埋点数据存储在哪里？
>     
> 2.  如何计算数据？如何扩展数据？如何查询数据？
>     
> 3.  二次计算后的数据量依旧非常大，该怎么办？
>     

*   原始性能数据通过 SDK 采集后，经过数据仓库的清洗，存储在 Hadoop 中。虽然 Hadoop 可以存储 PB 级别的数据，但查询速度较慢，不适合实时性能分析查询。为了解决这个问题，我们尝试将清洗后的数据复制一份存储在 MySQL 中，但随着数据量的增加，MySQL 方案出现了许多问题。考虑到实际场景的并发量不会太高，我们最终选择将明细数据存储在 ClickHouse 中。
    
*   虽然明细数据可以通过查询 ClickHouse 获取，但对于许多聚合计算得出的数据，如果仍然通过查询并实时计算，效率并不理想。因此，在数据落库后，我们通过定时任务预先计算一部分聚合数据，然后将其导入 MySQL 中。这种做法的好处在于，这部分预先计算好的数据可以进行查询，用户体验更好，而且后续需要扩展时，只需要对聚合数据进行二次计算加工即可。目前，聚合数据使用了 6 个维度进行分组计算，这些维度也可以用于组合查询，方便后续扩展。
    
*   尽管聚合数据已经合并计算过，但由于多维度组合，数据量仍然非常庞大。随着后续维度的扩展，整体数据量呈指数级增长。考虑到性能分析的周期性不会太长，我们决定只保留整体聚合数据 7 天，并进行分表处理。如果数据量激增，我们会采取将数据转入 TiDB 中，并按日期进行分区存储。
    

为了解决数据处理中的两个核心问题，我们采用了这个完整的流程。在面对如此庞大的数据时，我们需要考虑它们存储在何处。同时，我们也需要考虑如何查找和计算需要的指标。这个流程可以帮助我们更好地处理数据，提高效率。

此外，这个流程还有一个重要的作用，那就是保证数据的准确性和完整性。在数据处理过程中，我们需要遵循一定的规则和标准，以确保数据的可靠性。这样才能让我们在分析数据时得出正确的结论，更好的进行针对性的优化。

#### 5. 性能查询展示平台

web 平台部分功能页面展示如下:

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNN9A1B6Pr8mSFYmGMcwiaiaBHy7KcUfFsx48QnGucBG1jyVAsA5hrIzIQaDAkEBaFXaStfJ24ELuF9ew/640?wx_fmt=png)历史变化曲线![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNN9A1B6Pr8mSFYmGMcwiaiaBHyEY2qpC8ckBGqtqaU1EVr5ONBed9vRlHPDT9vxPc0aibz9TGwh7iaVWUg/640?wx_fmt=png)性能数据查询

总结
--

在 B 端项目中，页面性能统计是非常有必要的，因为可以帮助我们了解实际用户的具体页面的加载速度、用户体验，以便了解当前页面的质量，并且为优化页面性能提供方向，从而提高用户满意度。

* * *

最后，感谢大家阅读，如有不足，欢迎指正。

  打个小广告，欢迎关注作者个人公众号