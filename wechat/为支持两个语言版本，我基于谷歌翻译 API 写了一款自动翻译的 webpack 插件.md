> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/nO5dD8fGTJTXzfj41zw-gg)

> 本文来自读者 @漫思维 投稿授权
> 
> 原文链接：https://juejin.cn/post/7072677637117706270

1 前言
----

以下我会列举出我业务中遇到的问题难点及相对应的解决方法，解释简繁体插件怎么诞生的整个过程

2 背景
----

目前开发工作有大量的营销活动需要编写，特点是**小而多**，同时现阶段项目需要做**大陆与港台两个版本**

3 **现阶段实现的方案**
--------------

1.  先做完大陆版本，最后再复刻一份代码, 改成港台版本
    
2.  将项目中的汉字、价格、登录方式进行替换。
    

4 **存在的问题**
-----------

1.  首先复制来复制去就不是一个很好的方案，容易复制出问题，其次两个版本都是需要同一个时间点上线，复刻代码的代码的时机存在问题，如果复刻的过早，如果提测阶段大陆版本有 bug, 那么就需要修改两份 bug， 如果复刻的过晚那么会存在港台版本测试时间不足，也易导致问题发生。
    
2.  简繁体转换，都是将简体手动复制到谷歌翻译网页端中翻译好，再手动替换，繁琐且工程量大， 登录方式需要单独的复制一份。
    

5 **两个版本之间存在以下不同点**
-------------------

1.  登录方式的不同， 大陆主要是用账号密码登录，而港台使用谷歌、脸书、苹果登录
    
2.  价格、单位不同，￥ 与 NT$
    
3.  汉字的形式不同，中文简体与中文繁体
    

核心问题在于复刻出一份项目存在的工作量与潜在风险较大，所以需要将两个项目合成一个项目，怎么解决？

6 **解决方案**
----------

### 1. **将两个项目合并成一个项目**

如果需要将两个项目合成一个项目，并解决以上分析出来的不同点，那么显而易见，需要有个一标识去区分，那么使用`环境变量`解决这个问题是非常合适的，以 vue 项目举例, 可以编写对应的环境变量配置。

大陆版本生产环境：.env

```
VUE_APP_ENV=prod
VUE_APP_PUBLIC_PATH=/mainland
```

大陆版本开发环境：.env

```
VUE_APP_ENV=dev
VUE_APP_PUBLIC_PATH=/mainland
```

港台版本开发环境：.env.ht

```
VUE_APP_ENV=ht
VUE_APP_PUBLIC_PATH=/ht
NODE_ENV=production
```

package.json

```
"serve": "vue-cli-service serve","build": "vue-cli-service build","build:ht": "vue-cli-service build --mode ht",
```

可以看到这里使用了一个自定义变量 `VUE_APP_ENV`, 在项目代码中就可以使用 `process.env.VUE_APP_ENV` 去做区分当前是大陆还是港台了，同时为什么不使用`NODE_ENV`作为变量，因为该变量往往会有其他用途，如当`NODE_ENV`设置为`production` 时，打包时会做一些如压缩等优化操作。

**注：** 港台版本不做测试环境的区分，因为往往大陆版的逻辑没有问题，港台版的就没有问题，所以只需要基于大陆版开发，港台版只需要最后打包一次即可 **(测试环境可选，只需要多添加一个配置即可)**。

**其他注意点：** `process.env.VUE_APP_ENV`通常只能在`node`环境下才能访问的，但是`vue-cli`创建项目会自动将`.env`里的变量注入到运行时环境中，也就是使用一个全局变量存起来，通常是使用`webpack`的 define-plugin 插件实现的。

解决了环境变量的问题，接下来的工作就比较好进行了。

### 2. **解决登录方式的不同**

将两套登录封装成两个不同的组件，因为登录往往涉及到一些全局状态，项目一般都会使用`vuex`等全局状态管理工具，所以默认使用`vuex`储存状态，把整个包含登录逻辑的代码制作成一个项目的基础模板，使用`自定义脚手架`拉取即可，同时注意使用`vuex`时，为登录相关的状态，放置到一个`module`下，这样基于该模板创建项目后, 每个项目的其它状态单独再写`module`即可，避免修改登录的`module`。

`自定义脚手架`：交互式创建项目，输入一些选项，如项目名称，项目描述之类的，再从`gitlab`等远程仓库拉取已经写好的模板，将模板中的一些特定变量，使用模板引擎将模板中的项目名称等替换，最终产生一个新的项目。**（脚手架还有其他用途，这里只描述使用它创建一个简单的项目）**

*   没有脚手架那就只能使用`git clone` 下来后再修改项目名称之类的东西，会增加一点额外的工作，但不影响不大。
    

**封装的部分逻辑：**

比如大陆的登录组件叫做 `mainlandLogin`, 港台的登录组件叫 `htLogin`，再写一个 `login`组件将他们整合，通过`环境变量`进行区分引入不同的组件，使用`component`动态加载对应的登录组件如下：

**login.vue:**

```
<component :is="currentLogin" @sure="sure" cancel="cancel"></component>data:{    return {        currentLogin: process.env.VUE_APP_ENV === 'ht' ? 'mainlandLogin' : 'htLogin'    }},components: {        mainlandLogin: () => import("./components/mainlandLogin.vue"),        htLogin: () => import("./components/htLogin.vue"),},method:{    sure(){        this.$emit('sure')    },    cancel(){        this.$emit('cancel')    }}
```

**注意：** 引入组件的方式使用动态加载，打包时会将两个组件打包成两个单独的`chunk`, 因为大陆版本与港台版本只会用到一种登录，另一个用不到的不需要引入

**经过如上操作将登录的组件封装好以后使用起来就很简单了**

```
<login @sure="sure" cancel="cancel"></login>
```

### 3. **解决价格不一致问题**

与登录一样，根据环境变量区分即可，在原来大陆版本的商品 JSON 中加入一个字段即可如`htPrice`

```
const commodityList = [    {        id: 1        name: "xxx",        count:1,        price:1,        htPrice: 2    }]
```

遍历的时候还是根据`process.env.VUE_APP_ENV === 'ht'`进行显示对应价格与单位

```
{{ isHt ? `${commodity.htPrice} NT$` : `${commodity.price} ￥` }}data() {    return {        isHt: process.env.VUE_APP_ENV === 'ht'    }}
```

### 4. **简繁体转换**

解决了两个项目合并成一个项目和登录、价格、单位不一致的问题，最后只剩下简体转繁体，也是最难解决的一部分，经过了多次技术调研没有找到合适的方案，最后只能自己写一套。

**1. 使用 i18n, 维护两套语言文件**

**优点：** 国际化使用的最多的一个库，不用改动代码中的文字，使用变量替换，只需维护两套语言文件，改动点集中在一个文件中

**缺点：** 使用变量进行替换一定程度上增加了代码的复杂性，无法省去手动复制简体去翻译在额外写入特定的语言文件这一过程，对于这个场景不是一个最好的方案

**2. 采用：language-tw-loader**

**优点:**   `看似` 可以自动化将简体转换成繁体，方便快捷

**缺点：** 在使用时发现一个致命的缺点， 无法准确替换，原因: 不同的词组，同一个词可能对应多个字形，如：联系 -> 聯繫， 系鞋带 -> 系鞋带。

**基本原理：** 列举常用的中文简体与繁体，一一对应，逐一替换, 如下图所示：

![](https://mmbiz.qpic.cn/mmbiz_png/Mpt86EGjlpvw8lKKnx7wVW00DKybcmPDHK74KHgYRQmCXYvFDc5lxEXmBuY7qELov3EPySkSJmbNDe8eS8K73w/640?wx_fmt=png)image.png

**3. 采用 v-google-translate** **优点：** 运行时采用谷歌翻译，自动将网页的简体翻译成繁体

**缺点：** 因为是运行时转义，所以页面始终会先展示简体，过一段时间再显示繁体

**综上所述：** 现有的一些方案存在以下几个问题

1.  需要维护额外的语言文件，使用变量替换文字
    
2.  编译时转换无法正确转换，运行时转换有延时
    

**为了解决以上问题：**

**1. 无需写多套语言文件，正常开发使用中文进行编写即可**

需要一个翻译的 API，且翻译要准确，经测试简繁体转换谷歌翻译是最准确的。

**2. 在编译时转换**

编写打包工具的`plugin`，这里主要以`webpack`为打包工具，所以需要编写一个`webpack`的`plugin`。

#### 翻译 API

需要一个免费、准确、且不易挂的翻译服务，但是谷歌翻译 API 是需要付费的，有钱付费的很方便就能享受这个服务，但是为了一个简体转繁体产生额外的支出，不太现实。

开源项目中有`很多`的免费谷歌`API`, 但都是去尝试模拟生成其加密`token`，进行请求，服务很容易挂掉，所以`很多` 直接变成了`没有`。

**但是！！！你要记得，谷歌翻译是提供免费的网页版的！**

所以只需要打开一个浏览器，填入需要翻译的文字，获取翻译后的文字即可，只不过需要程序自动帮我们打开一个浏览器，你没想错，已经有很成熟的方案`puppeteer` 就是干这件事情的。

**所以最终采用：** 基于`puppeteer`的访问谷歌 https://translate.google.cn 获得翻译结果，比其他方案都要稳定。

同时已有大佬写了一个基于`puppeteer`的转换服务 translateer，感兴趣的可以看看其源码，也不复杂。

**但是注意，基于 `translateer` 启动 API 服务， 存在几个可以优化的点：**

先看下为什么需要优化, 首先我们得要知道谷歌翻译网页端最大支持多少字符，测试得知如下最大支持一页最大支持 `5000`字符，超过的部分可以翻页。

![](https://mmbiz.qpic.cn/mmbiz_png/Mpt86EGjlpvw8lKKnx7wVW00DKybcmPDwoXZCicTGlczMSu9wf11LgWXXFeMTUrNOlTvePeD9Om6Z9l0WsSWTvA/640?wx_fmt=png)再以上左侧输入框内输入源文本，该网页会发送一个`post`请求，一小会延迟右侧出现翻译后的内容，同时注意导航栏上的链接会变成如下形式：

```
https://translate.google.cn/?sl=zh-CN&tl=zh-TW&text=哈哈哈&op=translate
```

上面几个参数分别的含义

```
sl: 源语言; tl: 目标语言; text: 翻译的文本; op: translate (翻译)
```

如果直接使用以上链接进行请求，经过测试，将 text 值替换为`'1'.repeat(16346)`， `16346` 个字符时 **(该数值不包括 url 上其它字符，算上其它字符，那么总的 url 长度是 16411)** ，谷歌接口会返回 400 错误。

![](https://mmbiz.qpic.cn/mmbiz_png/Mpt86EGjlpvw8lKKnx7wVW00DKybcmPDAbCzNOKrTX6otxfnJDbknJHZ2hGSvUufYyfjkQfPQUU0iblXFmibVRZg/640?wx_fmt=png)image.png

**值得提的是：** 看了很多的文章都说`chrome`的`get`请求最大字符长度限制是`2048`或`8182`，但是都不太准确，上述测试就可以证明，总长度少于`16411` 谷歌翻译依旧可以正常访问，超过以后还是由谷歌翻译对应的后台服务器抛出的`400` 错误。

**参考了 GET 请求的长度限制， 以下几点是可以知道的：**

1、首先即使有长度限制，也是限制的是整个`URI`长度，而不仅仅是你的参数值数据长度。

2、`HTTP`协议从未规定`GET/POST`的请求长度限制是多少

3、所谓的请求长度限制是由浏览器和 web 服务器决定和设置的，浏览器和 web 服务器的设定均不一样

**所以浏览器到底限制的是多少字符呢，暂时还没有找到正确答案，有知道的大佬可以帮忙解释一下**

**测试所用的谷歌浏览器版本：** `98.0.4758.102（正式版本）(64 位)`

**分析了以上基本的限制，接下来看看`translateer` 的实现：**

`translateer` 服务启动时创建一个 `PagePool`页面池，开启`5`个`tab`页面并且都跳转至`https://translate.google.cn/`， 以下为删减后的部分代码：

```
export default class PagePool {  private _pages: Page[] = [];  private _pagesInUse: Page[] = [];  constructor(private browser: Browser, private pageCount: number = 5) {    pagePool = this;  }  public async init() {    this._pages = await Promise.all(      [...Array(this.pageCount)].map(() =>        this.browser.newPage().then(async (page) => {          await page.goto("https://translate.google.cn/", {            waitUntil: "networkidle2",          });          return page;        })      )    );  }}
```

然后使用`fastify`启动一个 Node 服务器，对外提供一个`get请求API`。以下为删减后的部分代码：

```
fastify.get("/",    async (request, reply) => {      const { text, from = "auto", to = "zh-CN", lite = false } = request.query;      const page = pagePool.getPage();        await page.evaluate(([from, to, text]) => {        location.href = `?sl=${from}&tl=${to}&text=${encodeURIComponent(          text        )}`;      },      [from, to, text]    );    // translating...    await page.waitForSelector(`span[lang=${to}]`);    // get translated text    let result = await page.evaluate(      (to) =>        (document.querySelectorAll(`span[lang=${to}]`)[0] as HTMLElement)          .innerText,      to    );}
```

传入`sl: 源语言; tl: 目标语言; text: 翻译的文本` 这几个参数，`location.href` 跳转至

`?sl=${from}&tl=${to}&text=${encodeURIComponent(text)}` 从而获得右侧输入框的返回结果。

**分析了其基本的实现原理，接下来分析其中存在的坑点。**

`location.href` 是个`get`请求，经过上面的分析暂时不知道浏览器 get 请求的字符长度限制，但是已经知道谷歌后台服务的对请求长度的限制为`16411`， 再粗略减去`411`个字符作为`url`的其他字符长度， 那么每次的`翻译文本`最大支持长度就为`16000`个字符。

而如上代码对`text`进行`encodeURIComponent` 编码 **(get 请求默认也会对中文及其它特殊字符进行编码)**

需要注意的是中文一个字符编码后为 9 个字符 `联` => `%E8%81%94`, 那么`16000 / 9` 约等于 `1777`个汉字

**阶段总结：**

由于谷歌翻译网页版的一些限制，直接使用 get 请求，一次最大支持翻译`1777`个汉字， 而在输入框内模拟输入汉字无字符长度限制，一页最大支持`5000` 字符，超出的部分可进行翻页。

需要达到的效果是一次翻译最少要能翻译`5000`个字符，尽量少请求次数，能减少翻译的时间，进而加快`插件编译`的速度，所以需要开始改进 `translateer`：

1.  使用`fastify`创建一个新的`post`请求`API`
    

```
export const post = ((fastify, opts, done) => {  fastify.post('/',async (request, reply) => {      ...more...    }  );  done();});
```

2.  跳转时只添加参数`sl源语言`与`tl目标语言`不加`text`参数
    

```
await page.evaluate(    ([from, to]) => {      location.href = `?sl=${from}&tl=${to}`;    },    [from, to]  );
```

3.  选中谷歌翻译页面左侧的文本输入框，并将`需要翻译的文本`赋值给输入框，并且需要使用`page.type`键入一个空字符，触发一次文本框的`input`事件，网页才会执行翻译。
    

```
await page.waitForSelector(`span[lang=${from}] textarea`);  const fromEle = await page.$(`span[lang=${from}] textarea`);  await page.evaluate((el, text) => {    el.value= text  },fromEle, text)  // 模拟一次输入触发input事件，使得谷歌翻译可以翻译  await page.type(`span[lang=${from}] textarea`, ' ');   // translating...  await page.waitForSelector(`span[lang=${to}]`);  // get translated text  const result = await page.evaluate(    (to) =>      (document.querySelectorAll(`span[lang=${to}]`)[0] as HTMLElement)        .innerText,    to  );
```

这里有个坑点，就是 `page.type` 是模拟用户输入所以他会一个字一个字的输入，一开始的时候我使用它去给文本输入框赋值，文本过长时，输入的时间巨长，当时不知道怎么处理，为此我还专门提了个`issue`, 被指导后才改写成现在的写法:  issues

**总结：**

前面提到，超过`5000`字符可以进行翻页，这里没有进行翻译处理，目前限制就每次请求翻译`5000`个字符已经够用，超过`5000`再请求一次翻译接口 **(后续可处理一下翻页，不管多长的字符都一次翻译完毕， 不过还需要进一步对比两者的所用时间长短)**

最后以上修改过的代码 github 地址: Translateer

#### translate-language-webpack-plugin

解决了翻译 API 的问题，剩下的事情就只剩将代码中的中文简体转换成繁体了，由于打包工具使用的`webpack`, 所以编写`webpack plugin` 进行读取中文并替换， 同时需要支持`webpack5.0`与`webpack4.0`版本，以下以`5.0`版本为例：

**首先理一下该插件的思路**

1.  编写 webpack 插件
    
2.  读取代码中所有的中文
    
3.  请求翻译 API, 获得翻译后的结果
    
4.  将翻译后的结果写入至代码中
    
5.  额外的功能：将每次读取的源文本与目标文本输出至日志中， 特别是在翻译返回的文本长度与源文本长度不一致时用于对照。
    

**接下来一步步实现上述功能**

**1. 第一步需要编写一个插件，怎么写？这是个问题**

`4.0版本` 和 `5.0版本` 的钩子是不一样的，而且很多，这里不会介绍 webpack plugin 中每个钩子的含义，不是两句话能说的清楚的, 网上有很多介绍的如揭秘 webpack 插件工作流程和原理，要想快速的写一个插件，那么最快的方式就是参考现有的成熟的插件，我在编写的时候就是直接参照的`html-webpack-plugin`, `4.0版本`与`5.0版本`都是参照其对应版本写的。

**tips:**  看开源项目的源码的意义就在于此，可以学到很多的成熟的解决方案，可以稍微少踩一点坑， 所以最基本也需要学会如何找入口文件，如何调试代码。

部分代码如下，参考如下注释：

```
const { sources, Compilation } = require('webpack');// 日志输出文件const TRANSFROMSOURCETARGET = 'transform-source-target.txt';// 谷歌翻译一次最大支持字符const googleMaxCharLimit = 5000;// 插件名称const pluginName = 'TransformLanguageWebpackPlugin';class TransformLanguageWebpackPlugin {  constructor(options = {}) {     // 默认的一些参数    const defaultOptions = {     translateApiUrl: '', from: 'zh-CN', to: 'zh-TW', separator: '-',     regex: /[\u4e00-\u9fa5]/g, outputTxt: false, limit: googleMaxCharLimit,    };    // translateApiUrl 翻译API必须传    if (!options.translateApiUrl)      throw new ReferenceError('The translateApiUrl parameter is required');    // 将传入的参数与默认参数合并    this.options = { ...defaultOptions, ...options };  }  // 添加apply方法，供webpack调用  apply(compiler) {    const {separator, translateApiUrl, from, to, regex, outputTxt, limit} = this.options;    // 监听compiler 的thisCompilation 钩子    compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {     // 监听compilation 的processAssets 钩子      compilation.hooks.processAssets.tapAsync(        {          name: pluginName,          // stage 代表资源处理的阶段， PROCESS_ASSETS_STAGE_ANALYSE：analyze the existing assets.          stage: Compilation.PROCESS_ASSETS_STAGE_ANALYSE,        },        // assets 代表所有chunk文件`路径及内容        async (assets, callback) => {           // TODO：在此处填充要实现的功能        })      })  }}
```

以上为该插件的基本结构， `webpack5.0`中`processAssets`钩子用于处理文件，我们主要看一下 `Compilation.PROCESS_ASSETS_STAGE_ANALYSE`阶段`assets` 中有什么. 以提供的 github 仓库中提供的例子为例

![](https://mmbiz.qpic.cn/mmbiz_png/Mpt86EGjlpvw8lKKnx7wVW00DKybcmPD8ck7g6IibHxgaC1LSCCmRA1YHVkbIE23ibAVp88lfTnSCeMFc1NEStHw/640?wx_fmt=png)可以看到`assets`就是最终会输出的文件，根据需要做的事选择不同的`stage`, 这里选择`PROCESS_ASSETS_STAGE_ANALYSE`的原因是，需要处理`index.htm`中的中文，所以需要选择一个非常靠后的钩子，其他钩子参考 **(相关文档)**

**2. 读取代码中所有的中文**

首先需要写一个函数，用于匹配相邻的中文字符，如，源码中含有`<p>失联</p><div>系鞋带</div>, 返回：['失联', '系鞋带']`。将返回的字符数组，以`分隔符分隔`，如`['失联', '系鞋带']` => `失联'-'系鞋带'` , 分隔的原因：如中文简体 => 中文繁体 (存在多形字)：失联系鞋带 => 失聯繫鞋帶, 而正确的结果应该是 `失联系鞋带`， `失联`是一个词组，`系鞋带`是一个词组，转换后不会有变化的， 而`联系`在一起的时候就会变成 `聯繫`

```
/** * @description 返回中文词组数组, 如: <p>你好</p><div>世界</div>,  返回： ['你好', '世界'] * @param {*} content 打包后的bundle文件内容 * @returns */function getLanguageList(content, regex) {  let index = 0,    termList = [],    term = '',    list; // 遍历获取到的中文数组  while ((list = regex.exec(content))) {    if (list.index !== index + 1 && term) {      termList.push(term);      term = '';    }    term += list[0];    index = list.index;  }  if (term !== '') {    termList.push(term);  }  return termList;}
```

在以上代码`TODO:` 的位置继续编写， 获取所有 chunk 中的中文并保存至`chunkAllList`数组中

```
let chunkAllList = [];// 先将所有的chunk中的`指定字符词组`存起来for (const [pathname, source] of Object.entries(assets)) {    // 只读取js与html文件中的中文，其他的文件不需要    if (!(pathname.endsWith('js') || pathname.endsWith('.html'))) {      continue;    }    // 获取当前chunk的源代码字符串    let chunkSourceCode = source.source();    // 获取chunk中所有的中文。    const chunkSourceLanguageList = getLanguageList(chunkSourceCode, regex);    // 如果小于0，说明当前文件中没有 `指定字符词组`，不需要替换    if (chunkSourceLanguageList.length <= 0) continue;    chunkAllList.push({      // 原文本数组      chunkSourceLanguageList,      // separator为分割符默认为： -      chunkSourceLanguageStr: chunkSourceLanguageList.join(separator),      // chunk原代码      chunkSourceCode,      // chunk的输出路径      pathname,    });}
```

**3. 请求翻译 API, 获得翻译后的结果**

因为有些`chunk`中中文是很少的， 比如一个`chunk`中只有`2`个字，另一个`chunk`中只有`3`个字，那么就没必要请求两次翻译接口，为了减少请求次数，先将所有`chunk`中的中文合成一个字符串，并用`_`分隔开用于区分是属于那个`chunk`中的内容。

```
const chunkAllSourceLanguageStr = chunkAllList.map((item) => item.chunkSourceLanguageStr).join(`_`);
```

合成一个字符串以后，还需要进行切割，因为一次最大支持翻译`5000`个字符

```
// 合理的分割所有chunk中读取的字符，供谷歌API翻译，不能超过谷歌翻译的限制const sourceList = this.getSourceList(chunkAllSourceLanguageStr, limit);
```

```
getSourceList(sourceStr, limit) {    let len = sourceStr.length;    let index = 0;    if (limit) {    }    const chunkSplitLimitList = [];    while (len > 0) {      let end = index + limit;      const str = sourceStr.slice(index, end);      chunkSplitLimitList.push(str);      index = end;      len = len - limit;    }    return chunkSplitLimitList;}
```

切割完成后，最后使用`Promise.all`去请求所有的接口，所有的翻译成功才能算成功

```
// 翻译const tempTargetList = await Promise.all(  sourceList.map(async (text) => {    return await transform({      translateApiUrl: translateApiUrl,      text: text,      from: from,      to: to,    });  }));
```

**4. 将翻译后的结果写入至代码中**

得到了所有 chunk 中的中文简体翻译后的繁体，最后遍历 chunk 数组`chunkAllList`，将源代码中的

```
for (let i = 0; i < chunkAllList.length; i++) {  const {    chunkSourceLanguageStr,    chunkSourceLanguageList,    pathname,    chunkSourceCode,  } = chunkAllList[i];  let sourceCode = chunkSourceCode;  // 将简体转换为繁体  targetList[i].split(separator).forEach((phrase, index) => {    sourceCode = sourceCode.replace(      chunkSourceLanguageList[index],      phrase    );  }); //   if (outputTxt) {    writeContent += this.writeFormat(      pathname,      chunkSourceLanguageStr,      targetList[i]    );  }  compilation.updateAsset(pathname, new sources.RawSource(sourceCode));}
```

以上代码为不完全代码，完整代码及插件使用方式请参考：translate-language-webpack-plugin

**5. 输出对照文本**

如下：主要是输出每个`chunk`中的中文用于对照，如果说页面**没有其它动态的文字**，且这些文字需要应用特殊的字体，也可以使用这些读取出来的字打包一个字体文件，比一整个字体文件小很多很多。

![](https://mmbiz.qpic.cn/mmbiz_png/Mpt86EGjlpvw8lKKnx7wVW00DKybcmPDd2ncQhXrGrnxXiaWaOW3shamtKBry70FppHPuba0jQtbKvqXgm9eVeQ/640?wx_fmt=png)image.png

7 总结
----

注意：会将页面上包括 js 中的中文全部替换，但是接口返回的文字是无法转换的，由后端返回对应繁体

至此一个完整的业务需求就已经优化的七七八八了，翻译插件理论上支持任意语言互转，但是由于翻译的语义不同，往往翻译出来的意思不是我们想要的，适用于简体繁体互转。

[![](https://mmbiz.qpic.cn/mmbiz_png/MpGQUHiaib4ib44VcWJtWJHE1rbIx4WLwG6Wicxpy9V4SCLxLHqW2SVoibogZU9FTyiaTkZgTCwQVsk1iao7Vot4yibZjQ/640?wx_fmt=png)](http://mp.weixin.qq.com/s?__biz=Mzg4MTYwMzY1Mw==&mid=2247496626&idx=1&sn=699dc2b117d43674b9e80a616199d5b6&chksm=cf61d698f8165f8e2b7f6cf4a638347c3b55b035e6c2095e477b217723cce34acbbe943ad537&scene=21#wechat_redirect)

关于奇舞团
-----

奇舞团是 360 集团最大的大前端团队，代表集团参与 W3C 和 ECMA 会员（TC39）工作。奇舞团非常重视人才培养，有工程师、讲师、翻译官、业务接口人、团队 Leader 等多种发展方向供员工选择，并辅以提供相应的技术力、专业力、通用力、领导力等培训课程。奇舞团以开放和求贤的心态欢迎各种优秀人才关注和加入奇舞团。

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEA7SicpkibzkJ0pMZpozvAAg60n9ZhaXaPzzDbzLziapG8P8zfTnzs7nRahMIP3gvXamaCR4NVU35TCw/640?wx_fmt=png)