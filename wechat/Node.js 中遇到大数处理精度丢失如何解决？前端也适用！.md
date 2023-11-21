> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/p2kpOYZkPP-xx-mJBGVUMg)

在 JavaScript 中浮点数运算时经常出现 0.1+0.2=0.30000000000000004 这样的问题，除此之外还有一个不容忽视的**大数危机（大数处理精度丢失）问题**

JavaScript 最大安全整数
-----------------

IEEE 754 双精确度浮点数（Double 64 Bits）中尾数部分是用来存储整数的有效位数，为 52 位，加上省略的一位 1 可以保存的实际数值为 。

```
Math.pow(2, 53) // 9007199254740992Number.MAX_SAFE_INTEGER // 最大安全整数 9007199254740991 Number.MIN_SAFE_INTEGER // 最小安全整数 -9007199254740991
```

只要不超过 JavaScript 中最大安全整数和最小安全整数范围都是安全的。

大数处理精度丢失问题复现
------------

**例一**

当你在 Chrome 的控制台或者 Node.js 运行环境里执行以下代码后会出现以下结果，What？为什么我定义的 200000436035958034 却被转义为了 200000436035958050，在了解了 JavaScript 浮点数存储原理之后，应该明白此时已经触发了 JavaScript 的最大安全整数范围。

```
const num = 200000436035958034;console.log(num); // 200000436035958050
```

**例二**

以下示例通过流读取传递的数据，保存在一个字符串 data 中，因为传递的是一个 application/json 协议的数据，我们需要对 data 反序列化为一个 obj 做业务处理。

```
const http = require('http');http.createServer((req, res) => {    if (req.method === 'POST') {        let data = '';        req.on('data', chunk => {            data += chunk;        });        req.on('end', () => {            console.log('未 JSON 反序列化情况：', data);                        try {                // 反序列化为 obj 对象，用来处理业务                const obj = JSON.parse(data);                console.log('经过 JSON 反序列化之后：', obj);                res.setHeader("Content-Type", "application/json");                res.end(data);            } catch(e) {                console.error(e);                res.statusCode = 400;                res.end("Invalid JSON");            }        });    } else {        res.end('OK');    }}).listen(3000)
```

运行上述程序之后在 POSTMAN 调用，200000436035958034 这个是一个大数值。

  

以下为输出结果，发现没有经过 JSON 序列化的一切正常，当程序执行 JSON.parse() 之后，又发生了精度问题，这又是为什么呢？JSON 转换和大数值精度之间又有什么猫腻呢？

```
未 JSON 反序列化情况： {        "id": 200000436035958034}经过 JSON 反序列化之后： { id: 200000436035958050 }
```

这个问题也实际遇到过，发生的方式是调用第三方接口拿到的是一个大数值的参数，结果 JSON 之后就出现了类似问题，下面做下分析。

JSON 序列化对大数值解析有什么猫腻？
--------------------

先了解下 JSON 的数据格式标准，Internet Engineering Task Force 7159，简称（IETF 7159），是一种轻量级的、基于文本与语言无关的数据交互格式，源自 ECMAScript 编程语言标准.

https://www.rfc-editor.org/rfc/rfc7159.txt 访问这个地址查看协议的相关内容。

我们本节需要关注的是 “**一个 JSON 的 Value 是什么呢？**” 上述协议中有规定必须为 **object, array, number, or string** 四个数据类型，也可以是 **false, null, true** 这三个值。

到此，也就揭开了这个谜底，JSON 在解析时对于其它类型的编码都会被默认转换掉。对应我们这个例子中的大数值会默认编码为 number 类型，这也是造成精度丢失的真正原因。

大数运算的解决方案
---------

### 1. 常用方法转字符串

在前后端交互中这是通常的一种方案，例如，对订单号的存储采用数值类型 Java 中的 long 类型表示的最大值为 2 的 64 次方，而 JS 中为 Number.MAX_SAFE_INTEGER (Math.pow(2, 53) - 1)，显然超过 JS 中能表示的最大安全值之外就要丢失精度了，最好的解法就是将订单号**由数值型转为字符串**返回给前端处理，这是在工作对接过程中实实在在遇到的一个坑。

### 2. 新的希望 BigInt

Bigint 是 JavaScript 中一个新的数据类型，可以用来操作超出 Number 最大安全范围的整数。

**创建 BigInt 方法一**

一种方法是在数字后面加上数字 n

```
200000436035958034n; // 200000436035958034n
```

**创建 BigInt 方法二**

另一种方法是使用构造函数 BigInt()，还需要注意的是使用 BigInt 时最好还是使用字符串，否则还是会出现精度问题，看官方文档也提到了这块 github.com/tc39/proposal-bigint#gotchas--exceptions 称为疑难杂症

```
BigInt('200000436035958034') // 200000436035958034n// 注意要使用字符串否则还是会被转义BigInt(200000436035958034) // 200000436035958048n 这不是一个正确的结果
```

**检测类型**

BigInt 是一个新的数据类型，因此它与 Number 并不是完全相等的，例如 1n 将不会全等于 1。

```
typeof 200000436035958034n // bigint1n === 1 // false
```

**运算**

BitInt 支持常见的运算符，但是永远不要与 Number 混合使用，请始终保持一致。

```
// 正确200000436035958034n + 1n // 200000436035958035n// 错误200000436035958034n + 1                                ^TypeError: Cannot mix BigInt and other types, use explicit conversions
```

**BigInt 转为字符串**

```
String(200000436035958034n) // 200000436035958034// 或者以下方式(200000436035958034n).toString() // 200000436035958034
```

**与 JSON 的冲突**

使用 JSON.parse('{"id": 200000436035958034}') 来解析会造成精度丢失问题，既然现在有了一个 BigInt 出现，是否使用以下方式就可以正常解析呢？

```
JSON.parse('{"id": 200000436035958034n}');
```

运行以上程序之后，会得到一个 `SyntaxError: Unexpected token n in JSON at position 25` 错误，最麻烦的就在这里，因为 JSON 是一个更为广泛的数据协议类型，影响面非常广泛，不是轻易能够变动的。

在 TC39 proposal-bigint 仓库中也有人提过这个问题 github.comtc39/proposal-bigint/issues/24 截至目前，该提案并未被添加到 JSON 中，因为这将破坏 JSON 的格式，很可能导致无法解析。

**BigInt 的支持**

BigInt 提案目前已进入 Stage 4，已经在 Chrome，Node，Firefox，Babel 中发布，在 Node.js 中支持的版本为 12+。

**BigInt 总结**

我们使用 BigInt 做一些运算是没有问题的，但是和第三方接口交互，如果对 JSON 字符串做序列化遇到一些大数问题还是会出现精度丢失，显然这是由于与 JSON 的冲突导致的，下面给出第三种方案。

### 3. 第三方库

通过一些第三方库也可以解决，但是你可能会想为什么要这么曲折呢？转成字符串大家不都开开心心的吗，但是呢，有的时候你需要对接第三方接口，取到的数据就包含这种大数的情况，且遇到那种拒不改的，业务总归要完成吧！这里介绍第三种实现方案。

还拿我们上面 **大数处理精度丢失问题复现** 的第二个例子进行讲解，通过 json-bigint 这个库来解决。

知道了 JSON 规范与 JavaScript 之间的冲突问题之后，就不要直接使用 JSON.parse() 了，在接收数据流之后，先通过字符串方式进行解析，利用 json-bigint 这个库，会自动的将超过 2 的 53 次方类型的数值转为一个 BigInt 类型，再设置一个参数 `storeAsString: true` 会将 BigInt 自动转为字符串。

```
const http = require('http');const JSONbig = require('json-bigint')({ 'storeAsString': true});http.createServer((req, res) => {  if (req.method === 'POST') {    let data = '';    req.on('data', chunk => {      data += chunk;    });    req.on('end', () => {      try {        // 使用第三方库进行 JSON 序列化        const obj = JSONbig.parse(data)        console.log('经过 JSON 反序列化之后：', obj);        res.setHeader("Content-Type", "application/json");        res.end(data);      } catch(e) {        console.error(e);        res.statusCode = 400;        res.end("Invalid JSON");      }    });  } else {    res.end('OK');  }}).listen(3000)
```

再次验证会看到以下结果，这次是正确的，问题也已经完美解决了！

```
JSON 反序列化之后 id 值： { id: '200000436035958034' }
```

json-bigint 结合 Request client
-----------------------------

介绍下 axios、node-fetch、undici、undici-fetch 这些请求客户端如何结合 json-bigint 处理大数。

### 模拟服务端

使用 BigInt 创建一个大数模拟服务端返回数据，此时，若请求的客户端不处理是会造成精度丢失的。

```
const http = require('http');const JSONbig = require('json-bigint')({ 'storeAsString': true});http.createServer((req, res) => {  res.end(JSONbig.stringify({    num: BigInt('200000436035958034')  }))}).listen(3000)
```

### axios

创建一个 axios 请求实例 request，其中的 transformResponse 属性我们对原始的响应数据做一些自定义处理。

```
const axios = require('axios').default;const JSONbig = require('json-bigint')({ 'storeAsString': true});const request = axios.create({  baseURL: 'http://localhost:3000',  transformResponse: [function (data) {    return JSONbig.parse(data)  }],});request({  url: '/api/test'}).then(response => {  // 200000436035958034  console.log(response.data.num);});
```

### node-fetch

node-fetch 在 Node.js 里用的也不少，一种方法是对返回的 text 数据做处理，其它更便捷的方法没有深入研究。

```
const fetch = require('node-fetch');const JSONbig = require('json-bigint')({ 'storeAsString': true});fetch('http://localhost:3000/api/data')  .then(async res => JSONbig.parse(await res.text()))  .then(data => console.log(data.num));
```

### undici

request 这个已标记为废弃的客户端就不介绍了，**再推荐一个值得关注的 Node.js 请求客户端 `undici`**，前一段也写过一篇文章介绍 [request 已废弃 - 推荐一个超快的 Node.js HTTP Client undici](https://mp.weixin.qq.com/s?__biz=MzIyNDU2NTc5Mw==&mid=2247495651&idx=1&sn=d04489066d1050cc4170baa82b15fbd9&scene=21#wechat_redirect)。

```
const undici = require('undici');const JSONbig = require('json-bigint')({ 'storeAsString': true});const client = new undici.Client('http://localhost:3000');(async () => {  const { body } = await client.request({    path: '/api',    method: 'GET',  });    body.setEncoding('utf8');  let str = '';  for await (const chunk of body) {    str += chunk;  }  console.log(JSONbig.parse(str)); // 200000436035958034  console.log(JSON.parse(str)); // 200000436035958050 精度丢失})();
```

### undici-fetch

undici-fetch 是一个构建在 undici 之上的 WHATWG fetch 实现，使用和 node-fetch 差不多。

```
const fetch = require('undici-fetch');const JSONbig = require('json-bigint')({ 'storeAsString': true});(async () => {  const res = await fetch('http://localhost:3000');  const json = JSONbig.parse(await res.text());  console.log(json.num); // 200000436035958034})();
```

总结
--

本文提出了一些产生大数精度丢失的原因，同时又给出了几种解决方案，如遇到类似问题，都可参考。还是建议大家在系统设计时去遵循双精度浮点数的规范来做，在查找问题的过程中，有看到有些使用正则来匹配，个人角度还是不推荐的，一是正则本身就是一个耗时的操作，二操作起来还要查找一些匹配规律，一不小心可能会把返回结果中的所有数值都转为字符串，也是不可行的。

Reference  

------------

*   v8.dev/features/bigint
    
*   github.com/tc39/proposal-bigint
    
*   en.wikipedia.org/wiki/Double-precision_floating-point_format
    

- END -

[![](https://mmbiz.qpic.cn/mmbiz_png/MpGQUHiaib4ib44VcWJtWJHE1rbIx4WLwG6Wicxpy9V4SCLxLHqW2SVoibogZU9FTyiaTkZgTCwQVsk1iao7Vot4yibZjQ/640?wx_fmt=png)](http://mp.weixin.qq.com/s?__biz=Mzg4MTYwMzY1Mw==&mid=2247496626&idx=1&sn=699dc2b117d43674b9e80a616199d5b6&chksm=cf61d698f8165f8e2b7f6cf4a638347c3b55b035e6c2095e477b217723cce34acbbe943ad537&scene=21#wechat_redirect)

关于奇舞团
-----

奇舞团是 360 集团最大的大前端团队，代表集团参与 W3C 和 ECMA 会员（TC39）工作。奇舞团非常重视人才培养，有工程师、讲师、翻译官、业务接口人、团队 Leader 等多种发展方向供员工选择，并辅以提供相应的技术力、专业力、通用力、领导力等培训课程。奇舞团以开放和求贤的心态欢迎各种优秀人才关注和加入奇舞团。

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEAvpoDMMDRyr6DPXbHAb7uUbWQnXrd4ZBkdfVCXKkVvOEYEmWic0W4Cu5w6NZbHniaMpbQflnLZuXbw/640?wx_fmt=png)