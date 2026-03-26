> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/RXYlTwptnj_j_OMomHOdaQ)

![](https://mmbiz.qpic.cn/mmbiz_jpg/QRibyjewM1IDIGftZ93w2UwP5kLVar5NxyxibQHuK0j5U8UpHwYgwiasFo6qsdK8ucNtXDTBp0OC8K3ia2oLBgl7dA/640?wx_fmt=jpeg)

在 [基于 Observable 构建前端防腐策略](https://mp.weixin.qq.com/s?__biz=MzIzOTU0NTQ0MA==&mid=2247507816&idx=1&sn=dcdde828985ecbee80c15ba64a1bc60e&scene=21#wechat_redirect) 发布后，有一些读者留言对文章中使用 Observable 构建防腐层的典型应用感到困惑，觉得代码中的例子过于简单，不少可以通过 Promise 解决，引入 RxJS Observable 会提高而非降低复杂度。  

这种顾虑是完全有道理的，在 RxJS 中可以由 Promise 操作符来替代的场景还有很多，事实上，所有能由 Observable 实现的场景理论上都可以 Promise 来实现，毕竟 RxJS 是基于 JavaScript 构建，整个 Observable 的核心实现也不过只有 100 行 代码。

然而前文的例子只是用来说明防腐层的场景，而并非复杂到一定要使用防腐层的情况。实际业务中的场景不可能只有 2 个接口，3 个组件这样简单。在复杂的业务场景下，基于 Observable 构建的防腐层可以提升我们的代码开发效率，更好的抽象和封装底层接口。以下举几个项目中防腐层的实战场景 ，每个场景均附加了在线示例。

**接口稳定提升**

  

> 将低成功率接口组装抽象为高成功率接口 
> 
> 在线示例：https://stackblitz.com/edit/rxjs-stable-improvement
> 
> 操作符：retry / retryWhen / delay

有些时候后端接口的成功率较低，但是前端为了保证视图层稳定，需要对这些接口的成功率进行增强。这里，我们使用 Promise 模拟一个成功率只有 50% 的接口，代码如下：

```
// 成功率 50% 的接口function unstableAPI(): Promise<boolean> {  return new Promise((resolve, reject) => {    if (Math.random() < 0.5) {      resolve(true);    } else {      reject('error');    }  });}
```

通过 RxJS 的 `retry` 操作符，我们可以很容易将 50% 成功率的接口组装为成功率 99.9% 的接口，即每次当接口失败时，自动重试最多 10 次。

```
function stabilizedAPI(): Promise<boolean> {  return lastValueFrom(    from(defer(() => unstableAPI())).pipe(retry(10))  );}
```

![](https://mmbiz.qpic.cn/mmbiz_png/QRibyjewM1IDIGftZ93w2UwP5kLVar5NxtWd4gKfRvTXvqS4MGubuVib9pn6viaP2VibYJlS8JWyF6qMlfldAscc8w/640?wx_fmt=png)image.png

实际的业务中，以上代码会导致代码短时间内多次重试，可能会导致接口雪崩。在 RxJS 中我们可以轻松实现错误回退机制，以花费更多时间的代价来获得更大的成功几率。

我们将 `stabilizedAPI` 的代码修改为以下代码，当发生错误时，等待 1s 后重新发起请求，最多发送 10 次。更完善的 RxJS 退避策略可以参考 Power of RxJS when using exponential backoff 一文。

```
function stabilizedAPI(): Promise<boolean> {  return lastValueFrom(    from(defer(() => unstableAPI())).pipe(      retryWhen((errors) => errors.pipe(delay(1000), take(10)))    )  );}
```

![](https://mmbiz.qpic.cn/mmbiz_png/QRibyjewM1IDIGftZ93w2UwP5kLVar5Nxfbv4FJ6eAJLPgeHoAEdgh0c2YYFP41lVyBDuFtK5jTkT13iaShBqlibA/640?wx_fmt=png)image.png

**接口时序调整**

> 为启动屏目单独提供加载接口 
> 
> 在线示例：https://stackblitz.com/edit/rxjs-minimal-response-time
> 
> 操作符：forkJoin / delay

绝大部分的前端应用都会有启动屏幕，启动屏幕中可能包含广告、加载动画或者应用 logo 信息等内容，应用启动屏幕的展示时间通常由以下两个因素决定：

1.  网络加载耗时 networkDelay: 应用加载所需的关键数据接口，例如用户个人信息的最长返回时间
    
2.  页面最小展示时间 minimalDelay: 启动屏幕包含的有效信息需要有一个最短展示时间，防止屏幕闪烁
    

启动屏幕的展示时间应当由以下逻辑计算：当网络加载耗时小于页面最小展示时间时，将以页面最小展示时间为准，当大于页面最小展示时间时，将网络加载耗时为准。简化公式为：

```
启动屏幕展示时间 = Max(关键接口加载时间，最短加载时间)
```

我们使用 Promise 来模拟关键数据返回，其中网络接口延时由 setTimeout 来模拟

```
function initData(): Promise<{ name: string }> {  return new Promise((resolve) => {    const networkDelay = Math.random() * 3000;    setTimeout(() => {      resolve({ name: 'lucy' });    }, networkDelay);  });}
```

通过 `forkJoin` `delay` 等 operator，我们可以组装出给启动屏幕使用的最短返回时间接口

```
// 初始化数据，返回时间必定大于 minimalDelay msfunction initDataWithMinimalDelay(minimalDelay: number): Promise<{ name: string }> {  return lastValueFrom(    forkJoin([      from(defer(() => initData())),      of(true).pipe(delay(minimalDelay)),    ]).pipe(map(([data]) => data))  );}
```

在以上代码中，当 networkDelay 调用时间小于 minimalDelay 时，将以 minimalDelay 为准，当大于 minimalDelay 时，将以 networkDelay 为准。

![](https://mmbiz.qpic.cn/mmbiz_png/QRibyjewM1IDIGftZ93w2UwP5kLVar5NxdNW91FjhelSpiaeZAhib9hg3ZtqrNkU0zNibQhLic6dmqMG3Ymm01Ozm0Q/640?wx_fmt=png)image.png

**接口择优使用**

> 自动选择较快的接口使用 
> 
> 在线示例：https://stackblitz.com/edit/rxjs-race-query
> 
> 操作符：raceWith

有时相同的数据可以从后端多个接口中获取，我们使用 Promise 模拟快慢两个接口

```
// 快速接口function fastAPI(): Promise<string> {  return new Promise((resolve) => {    setTimeout(() => {      resolve('fast data');    }, 1000);  });}// 慢速接口function slowAPI(): Promise<string> {  return new Promise((resolve) => {    setTimeout(() => {      resolve('slow data');    }, 3000);  });}
```

在实际的使用中，我们无法提前知晓接口的网络情况，通过 `raceWith` 操作符，我们可以对任意个接口进行封装，自动获取其中最快的那个

```
function getFasterOne(): Promise<string> {  return lastValueFrom(    from(defer(() => fastAPI())).pipe(raceWith(from(defer(() => slowAPI()))))  );}
```

![](https://mmbiz.qpic.cn/mmbiz_png/QRibyjewM1IDIGftZ93w2UwP5kLVar5Nx8hM4yO53GqQkia4bvmsjt5QnnibM1B5hHbx5MNlAQHSUISBYEWSDUIuw/640?wx_fmt=png)image.png

**接口竞态处理**

> Observable 防腐层自带竞态处理功能 
> 
> 在线示例：https://stackblitz.com/edit/rxjs-race-condition
> 
> 操作符：exhaustMap / switchMap / concatMap

接口的请求结果返回的顺序不能保证一致，这就要求我们在业务中需要对接口的竞态问题进行处理。Dan Abramov 在 useEffect 完整指南 使用了布尔值来对数据进行处理。但是如果你使用 Observable 构建了防腐层，就会有更简单的方法来处理竞态问题。

我们使用 `randomuser.me` 的服务与 `fromFetch` operator 构建一个简单的数据层

```
function getData() {  return fromFetch('https://api.randomuser.me/?page=1&results=10').pipe(    map((data) => data.json())  );}
```

### 以第一次请求为准

由于防腐层 Observable 的特性，使用 Observable 与 `exhaustMap` 结合就可以获得与 flag 标注相同的效果，即当前一次请求未返回时，下一次请求会被直接抛弃。

```
fromEvent(document.getElementById('button'), 'click')  .pipe(exhaustMap(() => getData()));
```

![](https://mmbiz.qpic.cn/mmbiz_png/QRibyjewM1IDIGftZ93w2UwP5kLVar5NxVRbqAenBMxv2O6raLFnm2JjJeW6MpSoYNZSEIVEO843UKuabibV9xRw/640?wx_fmt=png)image.png

### 以最后一次请求为准

我们也可以选择以最后一次请求为基准，将之前所有的请求都抛弃，在组件内直接使用 `switchMap` operator 来保证请求顺序与返回数据一致，`fromFetch` 中内置了 `AbortController` 可以将过期但仍未返回的接口置为 `canceled` 状态。

```
fromEvent(document.getElementById('button'), 'click')  .pipe(switchMap(() => getData()));
```

![](https://mmbiz.qpic.cn/mmbiz_png/QRibyjewM1IDIGftZ93w2UwP5kLVar5NxjHu71jkDva3fGV3a3rxm25Z1iaoxkKP6Z7fWiaVD5zMJJZicp63q4ShQQ/640?wx_fmt=png)image.png![](https://mmbiz.qpic.cn/mmbiz_png/QRibyjewM1IDIGftZ93w2UwP5kLVar5Nx87q8LTwmcnhYkqd8d9ETWicQwUObv8ViaE2c3ODVn8Kf6bQe5Maib3kAQ/640?wx_fmt=png)image.png

### 所有请求排队处理

将所有发出的请求排队处理，不丢弃任何一次请求，当上一次请求未返回时，下一次请求进入队列排队。

```
fromEvent(document.getElementById('button'), 'click')  .pipe(concatMap(() => getData()));
```

![](https://mmbiz.qpic.cn/mmbiz_png/QRibyjewM1IDIGftZ93w2UwP5kLVar5NxdRR5pcSMULEBicNznibjh9kaLFNyEWUDBFd8zx4MO9Ydt9RVgjScBj9Q/640?wx_fmt=png)image.png

**高阶数据组装**

> 将高阶数据请求抽象为单个接口 
> 
> 在线示例：https://stackblitz.com/edit/rxjs-high-order-query
> 
> 操作符：mergeMap / map / forkJoin

有些时候需要二次请求才能获得视图层的数据，例如下图中的数据可能由 getList 与 getStatus 两个接口才能完整获取。当我们需要同步渲染这些数据时，在防腐层中抽象出 getListWithStatus 会是更好的选择。

![](https://mmbiz.qpic.cn/mmbiz_png/QRibyjewM1IDIGftZ93w2UwP5kLVar5Nx8CCVU5XsMUiazVI187ibsWGGwzNAZQhJBT3CxGDZuibQ3t6YLgztAEZHg/640?wx_fmt=png)image.png

我们使用 Promise 模拟出两个接口的内容

```
// 模拟获取列表数据的接口function getList(): Promise<  Array<{    name: string;    id: string;  }>> {  return new Promise((resolve) => {    resolve([      {        name: 'John Brown',        id: '1',      },      {        name: 'Jim Green',        id: '2',      }    ]);  });}// 模拟获取状态接口function getStatus(id: string) {  return new Promise((resolve) => {    if (id === '2') {      resolve('old');    } else {      resolve('young');    }  });}
```

通过 `mergeMap` 与 `forkJoin`，我们可以将高阶的请求直接打平为一阶数组，获得含有 status 列表数据的接口抽象

```
// 抽象后含有 status 的列表数据function getListWithStatus() {  const getList$ = from(defer(() => getList()));  const getStatus$ = (id: string) => from(defer(() => from(getStatus(id))));  const data$ = getList$.pipe(    mergeMap((list) => {      const queryList = list.map((item) =>        getStatus$(item.id).pipe(map((status) => ({ ...item, status })))      );      return forkJoin(queryList);    })  );  return lastValueFrom(data$);}
```

调用 getListWithStatus 返回的数据为

```
[    {        "name": "John Brown",        "id": "1",        "status": "young"    },    {        "name": "Jim Green",        "id": "2",        "status": "old"    }]
```

**总结**

Observable 的思想更广泛的应用在于响应式编程，但是其在防腐层构建上同样可以发挥很大作用，本文给出了 实际项目中的一些相对复杂的例子，通过 Observable 防腐层的引入可以使用较少代码来实现上述复杂功能。

复杂业务的有效设计对于简单场景来说很可能是过度设计。不建议读者在没有场景的时候强行引入 Observable，工程领域实践中没有银弹，感谢大家的阅读。

关注「Alibaba F2E」微信公众号把握阿里巴巴前端新动向