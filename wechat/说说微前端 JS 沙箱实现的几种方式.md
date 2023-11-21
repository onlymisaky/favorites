> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/3vfKsxdOC_yJdMT1qi8GnQ)

> 原文 https://juejin.cn/post/6981374562877308936

### 前言

在微前端领域当中，沙箱是很重要的一件事情。像微前端框架`single-spa`没有实现 js 沙箱，我们在构建大型微前端应用的时候，很容易造成一些变量的冲突，对应用的可靠性面临巨大的风险。在微前端当中，有一些全局对象在所有的应用中需要共享，如`document`,`location`, 等对象。子应用开发的过程中可能是多个团队在做，很难约束他们使用全局变量。有些页面可能会有多个不同的子应用，需要我们支持多沙箱，每个沙箱需要有加载，卸载，在恢复的能力。

### `iframe`实现沙箱

在前端中，有一个比较重要的 html 标签 iframe，实际上，我们可以通过 iframe 对象，把原生浏览器对象通过`contentWindow`取出来，这个对象天然具有所有的属性，而且与主应用的环境隔离。下面我们通过代码看下

```
let iframe  = document.createElement('iframe',{src:'about:blank'});document.body.appendChild(iframe);const sandboxGlobal = iframe.contentWindow;
```

注意：只有同域的 ifame 才能取出对应的`contentWindow`, iframe 的 src 设置为`about:blank`, 可以保证一定是同域的，也不会发生资源加载，参考 iframe src

在前言中我们提到，微前端除了有一个隔离的 window 环境外，其实还需要共享一些全局对象, 这时候我们可以用代理去实现。下面我们通过代码看下

```
class SandboxWindow {    /**     * 构造函数     * @param {*} context 需要共享的对象     * @param {*} frameWindow iframe的window     */    constructor(context, frameWindow) {                return new Proxy(frameWindow, {            get(target, name) {                if (name in context) { // 优先使用共享对象                    return context[name];                }                return target[name];            },            set(target, name, value) {                if (name in context) { // 修改共享对象的值                    return context[name] = value;                }                target[name] = value;            }        })    }}// 需要全局共享的变量const context = { document:window.document, history: window.history }// 创建沙箱const newSandboxWindow = new SandboxWindow(context, sandboxGlobal);  // 判断沙箱上的对象和全局对象是否相等console.log('equal',newSandboxWindow.document === window.document)newSandboxWindow.abc = '1'; //在沙箱上添加属性console.log(window.abc);   // 在全局上查看属性console.log(newSandboxWindow.abc) //在沙箱上查看属性
```

我们运行起来，看下结果

![](https://mmbiz.qpic.cn/mmbiz_png/dm4opUyMicZfEvLYdv1QeZYrkluD2g1n2wa91UeU85TOKLDynt7T63AXicUvACRtnbVHk7Mht3naibEAJW5whE4Zw/640?wx_fmt=png)pic_f5240179.png

以上我们利用 iframe 沙箱可以实现以下特性：

*   全局变量隔离，如 setTimeout、location、react 不同版本隔离
    
*   路由隔离，应用可以实现独立路由，也可以共享全局路由
    
*   多实例，可以同时存在多个独立的微应用同时运行
    

### `diff`方式实现沙箱

在不支持代理的浏览器中，我们可以通过 diff 的方式实习沙箱。在应用运行的时候保存一个快照 window 对象，将当前 window 对象的全部属性都复制到快照对象上，子应用卸载的时候将 window 对象修改做个 diff，将不同的属性用个`modifyMap`保存起来，再次挂载的时候再加上这些修改的属性。代码如下：

```
class DiffSandbox {  constructor(name) {    this.name = name;    this.modifyMap = {}; // 存放修改的属性    this.windowSnapshot = {};  }  active() {    // 缓存active状态的沙箱    this.windowSnapshot = {};    for (const item in window) {      this.windowSnapshot[item] = window[item];    }    Object.keys(this.modifyMap).forEach(p => {      window[p] = this.modifyMap[p];    })  }  inactive() {    for (const item in window) {      if (this.windowSnapshot[item] !== window[item]) {        // 记录变更        this.modifyMap[item] = window[item];        // 还原window        window[item] = this.windowSnapshot[item];      }    }  }}const diffSandbox = new DiffSandbox('diff沙箱');diffSandbox.active();  // 激活沙箱window.a = '1'console.log('开启沙箱：',window.a);diffSandbox.inactive(); //失活沙箱console.log('失活沙箱：', window.a);diffSandbox.active();   // 重新激活console.log('再次激活', window.a);
```

我们运行一下，查看结果

![](https://mmbiz.qpic.cn/mmbiz_png/dm4opUyMicZfEvLYdv1QeZYrkluD2g1n27LQAibTnicaEba8iciaQLiaHw6k73H7WJMc1ZcLoT9Y2EUaxL9gUVFcSCHQ/640?wx_fmt=png)pic_62ed1cec.png

这种方式也无法支持多实例，因为运行期间所有的属性都是保存在 window 上的。

### 基于代理`(Proxy)`实现单实例沙箱

在 ES6 当中，我们可以通过代理`(Proxy)`实现对象的劫持。基本实录也是通过 window 对象的修改进行记录，在卸载时删除这些记录，在应用再次激活时恢复这些记录，来达到模拟沙箱环境的目的。代码如下

```
// 修改window属性的公共方法const updateWindowProp = (prop, value, isDel) => {    if (value === undefined || isDel) {        delete window[prop];    } else {        window[prop] = value;    }}class ProxySandbox {    active() {        // 根据记录还原沙箱        this.currentUpdatedPropsValueMap.forEach((v, p) => updateWindowProp(p, v));    }    inactive() {        // 1 将沙箱期间修改的属性还原为原先的属性        this.modifiedPropsMap.forEach((v, p) => updateWindowProp(p, v));        // 2 将沙箱期间新增的全局变量消除        this.addedPropsMap.forEach((_, p) => updateWindowProp(p, undefined, true));    }    constructor(name) {        this.name = name;        this.proxy = null;        // 存放新增的全局变量        this.addedPropsMap  = new Map();         // 存放沙箱期间更新的全局变量        this.modifiedPropsMap = new Map();        // 存在新增和修改的全局变量，在沙箱激活的时候使用        this.currentUpdatedPropsValueMap = new Map();        const { addedPropsMap, currentUpdatedPropsValueMap, modifiedPropsMap } = this;        const fakeWindow = Object.create(null);        const proxy = new Proxy(fakeWindow, {            set(target, prop, value) {                if (!window.hasOwnProperty(prop)) {                    // 如果window上没有的属性，记录到新增属性里                    // debugger;                    addedPropsMap.set(prop, value);                } else if (!modifiedPropsMap.has(prop)) {                    // 如果当前window对象有该属性，且未更新过，则记录该属性在window上的初始值                    const originalValue = window[prop];                    modifiedPropsMap.set(prop, originalValue);                }                // 记录修改属性以及修改后的值                currentUpdatedPropsValueMap.set(prop, value);                // 设置值到全局window上                updateWindowProp(prop, value);                return true;            },            get(target, prop) {                return window[prop];            },        });        this.proxy = proxy;    }}const newSandBox = new ProxySandbox('代理沙箱');const proxyWindow = newSandBox.proxy;proxyWindow.a = '1'console.log('开启沙箱：', proxyWindow.a, window.a);newSandBox.inactive(); //失活沙箱console.log('失活沙箱：', proxyWindow.a, window.a);newSandBox.active(); //失活沙箱console.log('重新激活沙箱：', proxyWindow.a, window.a);
```

我们运行代码，看下结果

![](https://mmbiz.qpic.cn/mmbiz_png/dm4opUyMicZfEvLYdv1QeZYrkluD2g1n2gsCMCT8RKbiaKVR46KHF7pW8LjgQfG9LkJtyL3x5fia5q1qeq8n6UI7A/640?wx_fmt=png)pic_81871c9c.png

这种方式同一时刻只能有一个激活的沙箱，否则全局对象上的变量会有两个以上的沙箱更新，造成全局变量冲突。

### 基于代理`(Proxy)`实现多实例沙箱

在单实例的场景总，我们的 fakeWindow 是一个空的对象，其没有任何储存变量的功能，微应用创建的变量最终实际都是挂载在 window 上的，这就限制了同一时刻不能有两个激活的微应用。

```
class MultipleProxySandbox {    active() {        this.sandboxRunning = true;    }    inactive() {        this.sandboxRunning = false;    }    /**     * 构造函数     * @param {*} name 沙箱名称      * @param {*} context 共享的上下文     * @returns      */    constructor(name, context = {}) {        this.name = name;        this.proxy = null;        const fakeWindow = Object.create({});        const proxy = new Proxy(fakeWindow, {            set: (target, name, value) => {                if (this.sandboxRunning) {                    if (Object.keys(context).includes(name)) {                        context[name] = value;                    }                    target[name] = value;                }            },            get: (target, name) => {                // 优先使用共享对象                if (Object.keys(context).includes(name)) {                    return context[name];                }                return target[name];            }        })        this.proxy = proxy;    }}const context = { document: window.document };const newSandBox1 = new MultipleProxySandbox('代理沙箱1', context);newSandBox1.active();const proxyWindow1 = newSandBox1.proxy;const newSandBox2 = new MultipleProxySandbox('代理沙箱2', context);newSandBox2.active();const proxyWindow2 = newSandBox2.proxy;console.log('共享对象是否相等', window.document === proxyWindow1.document, window.document ===  proxyWindow2.document);proxyWindow1.a = '1'; // 设置代理1的值proxyWindow2.a = '2'; // 设置代理2的值window.a = '3';  // 设置window的值console.log('打印输出的值', proxyWindow1.a, proxyWindow2.a, window.a);newSandBox1.inactive(); newSandBox2.inactive(); // 两个沙箱都失活proxyWindow1.a = '4'; // 设置代理1的值proxyWindow2.a = '4'; // 设置代理2的值window.a = '4';  // 设置window的值console.log('失活后打印输出的值', proxyWindow1.a, proxyWindow2.a, window.a);newSandBox1.active(); newSandBox2.active(); // 再次激活proxyWindow1.a = '4'; // 设置代理1的值proxyWindow2.a = '4'; // 设置代理2的值window.a = '4';  // 设置window的值console.log('失活后打印输出的值', proxyWindow1.a, proxyWindow2.a, window.a);
```

运行代码，结果如下：

![](https://mmbiz.qpic.cn/mmbiz_png/dm4opUyMicZfEvLYdv1QeZYrkluD2g1n28cqroibtxNdYicicwBohZICVibceuAgPvGULwdl0K2TehvZb7wWCaicmmog/640?wx_fmt=png)pic_ab5cb2c5.png

这种方式同一时刻只能有一个激活的多个沙箱，从而实现多实例沙箱。

### 结束语

以上是微前端比较常用的沙箱实现方式，想要在生产中使用，需要我们做很多的判断和约束。下篇我们通过源码看下微前端框架`qiankun`是怎么实现沙箱的。上面的代码在 github，如需查看，请移步 js-sandbox

### 参考

*   iframe src
    
*   ES6 Proxy
    

  

往期回顾

  

#

[如何使用 TypeScript 开发 React 函数式组件？](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458468369&idx=1&sn=710836a0f836c1591b4953ecf09bb9bb&chksm=b1c2603886b5e92ec64f82419d9fd8142060ee99fd48b8c3a8905ee6840f31e33d423c34c60b&scene=21#wechat_redirect)

#

[11 个需要避免的 React 错误用法](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458468180&idx=1&sn=63da1eb9e4d8ba00510bf344eb408e49&chksm=b1c21f7d86b5966b160bf65b193b62c46bc47bf0b3965ff909a34d19d3dc9f16c86598792501&scene=21#wechat_redirect)

#

[6 个 Vue3 开发必备的 VSCode 插件](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458467984&idx=1&sn=f9f71530f15124fe44cd22eff3170981&chksm=b1c21eb986b597af806837a37b87b1e8bc06b26b16af578deddd8bb503a768f78f5a7acdb909&scene=21#wechat_redirect)

#

[3 款非常实用的 Node.js 版本管理工具](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458467880&idx=1&sn=ca7e12574d88a6b36ccfd47d9ddc7a4f&chksm=b1c21e0186b5971758792950721938b4a4efbc3024b0b01965c25a4ea73ec838767783ade6ea&scene=21#wechat_redirect)

#

[6 个你必须明白 Vue3 的 ref 和 reactive 问题](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458467756&idx=1&sn=902e85685a50ba7cdc75e410e10b9718&chksm=b1c21d8586b5949326c8836132b20dc4294af449473b6db4592cbfd00788345534a07d77fa6d&scene=21#wechat_redirect)

#

[6 个意想不到的 JavaScript 问题](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458467612&idx=1&sn=44ea5238a6500f44a47ea316c634bcf6&chksm=b1c21d3586b594237333a306f00353fba450514076e54ac32df7485ae358d0cefb25a6c1f329&scene=21#wechat_redirect)

#

[试着换个角度理解低代码平台设计的本质](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458467471&idx=2&sn=7990678e19544372ff43b5a84f491337&chksm=b1c21ca686b595b07b097c764f9304887282d737b4dd0a2634c47b25c8f223c785a6c8714382&scene=21#wechat_redirect)

![](https://mmbiz.qpic.cn/mmbiz_gif/dy9CXeZLlCXukR16d8fyyeJ4icloLCW0cvbCvibfaBxbY22lN51mYaLeKictjOeobKmxCVfb3AwIZ3t6eKicIicTtow/640?wx_fmt=gif)