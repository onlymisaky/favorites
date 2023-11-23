> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/mC-u3pNH6dbtl8tePdWFbw)

👆  这是第 176 篇不掺水的原创，想要了解更多，请戳下方卡片关注我们吧～

  

> 微前端框架 qiankun 的沙箱方案解析
> 
> http://zoo.zhengcaiyun.cn/blog/article/qiankun

![](https://mmbiz.qpic.cn/mmbiz_png/sticlevzdTIBIGkxSMDhNc6OUgzDk3YjtYUfzt0KFe0m73wbSmCWYGonrsgo9Rpok2xZs8B4V0OorNIKl9kMUkw/640?wx_fmt=png)

简介
--

本文主要讨论微前端框架 qiankun 的沙箱实现方案，及各方案的实现原理，希望大家对 js 沙箱隔离有更深的理解。

什么是 js 沙箱
---------

我们在使用微前端框架的时候，经常听到 js 沙箱这个词，那究竟什么是 js 沙箱，js 沙箱又是来做什么的。

在计算机安全中，沙箱（Sandbox）是一种用于隔离正在运行程序的安全机制，通常用于执行未经测试或不受信任的程序或代码，它会为待执行的程序创建一个独立的执行环境，内部程序的执行不会影响到外部程序的运行。而 js 沙箱也是来源于这个概念。![](https://mmbiz.qpic.cn/mmbiz_jpg/sticlevzdTIBIGkxSMDhNc6OUgzDk3YjtkZYGclezmvG8mV5SMy4YcdzsCaFXpGMq5xfXs5qWX7CbxGYg154v1w/640?wx_fmt=jpeg)

在前端中最直观的副作用 / 危害就是污染、篡改全局 window 状态。首先我们先来看一个场景，我们在 A 微应用中定义了一个全局变量 city，有很多业务是基于 city 变量展开的。但是突然有一天微应用 B 也因为业务需求定义了一个全局变量 city，这时候在 A, B 微应用互相切换的时候，会导致基于  city 的代码逻辑互相影响。这时我们首先想到的是在定义的时候可以互相沟通一下避免这种重复的情况，或者每个微应用定义全局变量时可以加一个自己独有的前缀。但是在微应用数量增多或者团队人员增多的时候，这个问题就会越发凸显，因为前面的提出的解决方案严重依赖沟通和对编码规则的彻底执行，这样就总会出现遗漏的状况。这时我们就要产出一种方案，达到即使两个微应用定义了相同的全局变量也不会互相影响的效果，其中一种解决方案就是  js 沙箱隔离。

那 js 沙箱的原理是什么，又是如何来解决上面的问题的。其实原理很简单，就是在不同的微应用中记录在当前微应用中定义以及改变了哪些全局变量，并且在切换微应用的时候恢复和删除之前的修改，这样就可以做到互不影响了。

qiankun 中的沙箱实现方案及优缺点
--------------------

目前在乾坤的代码中一共有三种沙箱实现方案。这三种方案也是随着技术的成熟和微前端的逐步发展而不断进化出来的，我们可以在这三种方案的实现源码中体会出微前端的发展历程。

### SnapshotSandbox 沙箱快照方案

在乾坤中，所有子应用都有加载 (active) 和卸载 (inactive) 两个周期函数。![](https://mmbiz.qpic.cn/mmbiz_jpg/sticlevzdTIBIGkxSMDhNc6OUgzDk3YjticD1IKULQhZdzmu9jP73OsQcXUwHjFEGkVHCQX5EibyibGopD2GkO9UZA/640?wx_fmt=jpeg)

#### active(加载函数)

1.  循环 window，把子应用加载前的 window 进行复制暂存，用于卸载时恢复初始 window。
    
2.  恢复之前的变更。上次子应用运行时改变的 window 变量会再存下来，再次加载时会恢复之前的 window 变更。
    
3.  修改 sandboxRunning 标识，标识子应用运行中。
    

```
active() {    // 记录当前快照    this.windowSnapshot = {} as Window;    iter(window, (prop) => {      this.windowSnapshot[prop] = window[prop];    });    // 恢复之前的变更    Object.keys(this.modifyPropsMap).forEach((p: any) => {      window[p] = this.modifyPropsMap[p];    });    this.sandboxRunning = true;  }
```

#### inactive(卸载函数)

1.  循环 window 与之前的暂存 window 做对比，记录变更。
    
2.  恢复子应用加载前的 window 状态。
    
3.  修改 sandboxRunning 标识，标识子应用已卸载。
    

```
inactive() {    this.modifyPropsMap = {};    iter(window, (prop) => {      if (window[prop] !== this.windowSnapshot[prop]) {        // 记录变更，恢复环境        this.modifyPropsMap[prop] = window[prop];        window[prop] = this.windowSnapshot[prop];      }    });    this.sandboxRunning = false;  }
```

#### 总结

优点：实现简单易懂，代码兼容性好。不足：每次激活，卸载都要遍历 window，性能较差。只能支持加载一个子应用。

### legacySandbox 沙箱快照方案

![](https://mmbiz.qpic.cn/mmbiz_jpg/sticlevzdTIBIGkxSMDhNc6OUgzDk3Yjt72MbxNic4iaIKw60SCMCm4vIbicKf1vBT1myqUbPSFnHCZPc9SKBJ3wZQ/640?wx_fmt=jpeg)legacySandbox.jpg

#### constructor

创建变量 fakeWindow(虚拟的 window)，并代理 fakeWindow，在每次更改 fakeWindow 时，记录下更改记录，并存放在子应用的内存变量内。内存变量有：addedPropsMapInSandbox : 沙箱期间新增的全局变量, 用于卸载子应用时删除此变量 modifiedPropsOriginalValueMapInSandbox ：沙箱期间更新的全局变量，用于卸载时删除修改。currentUpdatedPropsValueMap ：所有的更改记录 (新增和修改的), 用于下次再加载自用时时恢复 window。通过这三个变量记录子应用以及原来环境的变化，qiankun 也能以此作为恢复环境的依据。

```
export default class LegacySandbox implements SandBox {  .....    /** 沙箱期间新增的全局变量 */  private addedPropsMapInSandbox = new Map<PropertyKey, any>();  /** 沙箱期间更新的全局变量 */  private modifiedPropsOriginalValueMapInSandbox = new Map<PropertyKey, any>();  /** 持续记录更新的(新增和修改的)全局变量的 map，用于在任意时刻做 snapshot */  private currentUpdatedPropsValueMap = new Map<PropertyKey, any>();  private setWindowProp(prop: PropertyKey, value: any, toDelete?: boolean) {    if (value === undefined && toDelete) {      // eslint-disable-next-line no-param-reassign      delete (this.globalContext as any)[prop];    } else if (isPropConfigurable(this.globalContext, prop) && typeof prop !== 'symbol') {      Object.defineProperty(this.globalContext, prop, { writable: true, configurable: true });      // eslint-disable-next-line no-param-reassign      (this.globalContext as any)[prop] = value;    }  }  constructor(name: string, globalContext = window) {    this.name = name;    this.globalContext = globalContext;    this.type = SandBoxType.LegacyProxy;    const { addedPropsMapInSandbox, modifiedPropsOriginalValueMapInSandbox, currentUpdatedPropsValueMap } = this;    const rawWindow = globalContext;    const fakeWindow = Object.create(null) as Window;    const setTrap = (p: PropertyKey, value: any, originalValue: any, sync2Window = true) => {      if (this.sandboxRunning) {        if (!rawWindow.hasOwnProperty(p)) {          addedPropsMapInSandbox.set(p, value);        } else if (!modifiedPropsOriginalValueMapInSandbox.has(p)) {          // 如果当前 window 对象存在该属性，且 record map 中未记录过，则记录该属性初始值          modifiedPropsOriginalValueMapInSandbox.set(p, originalValue);        }        currentUpdatedPropsValueMap.set(p, value);        return true;      }      return true;    };    const proxy = new Proxy(fakeWindow, {      set: (_: Window, p: PropertyKey, value: any): boolean => {        const originalValue = (rawWindow as any)[p];        return setTrap(p, value, originalValue, true);      },      get(_: Window, p: PropertyKey): any {        if (p === 'top' || p === 'parent' || p === 'window' || p === 'self') {          return proxy;        }        const value = (rawWindow as any)[p];        return getTargetValue(rawWindow, value);      },    });    this.proxy = proxy;  }}
```

#### active(加载函数)

1.  恢复子工程上次运行时修改的全局变量。
    
2.  更改标识，标记当前子应用运行中。
    

```
active() {    if (!this.sandboxRunning) {      this.currentUpdatedPropsValueMap.forEach((v, p) => this.setWindowProp(p, v));    }    this.sandboxRunning = true;  }
```

#### inactive(卸载函数)

1.  恢复应用加载前的全局变量。
    
2.  删除沙箱本次运行中新增的全局变量。
    
3.  更改标识，标记当前子应用已卸载。
    

```
inactive() {    this.modifiedPropsOriginalValueMapInSandbox.forEach((v, p) => this.setWindowProp(p, v));    this.addedPropsMapInSandbox.forEach((_, p) => this.setWindowProp(p, undefined, true));    this.sandboxRunning = false;  }
```

#### 总结

优点：相比第一种，采用代理的方式修改 window, 不用再遍历 window, 性能得到提升。不足：兼容性不如第一种，只能支持加载一个子应用。

### proxySandbox 沙箱快照方案

![](https://mmbiz.qpic.cn/mmbiz_jpg/sticlevzdTIBIGkxSMDhNc6OUgzDk3Yjt8HGG71fu1uNqWm9iczB1CmSUGpX3M6DKNhVDKbiasyd5ajBiamtEQ1tkQ/640?wx_fmt=jpeg)proxySandbox.jpg

#### constructor

与 legacySandbox 方案一样，创建变量 fakeWindow(虚拟的 window)，并代理 fakeWindow。每个子应用在创建时都会分配一个空的 fakeWindow 变量。每当设置全局变量时，都会改变 fakeWindow 的值，同时判断如果 fakeWindows 上没有当前设置的值才会更改 window。取值时，先判断当前的 fakeWindow 里是否有要取的值，如果有，则直接返回，没有再从 window 上获取；

设置变量时:

```
constructor(name: string, globalContext = window) {    this.name = name;    this.globalContext = globalContext;    this.type = SandBoxType.Proxy;    const { updatedValueSet } = this;  // 创建变量 fakeWindow   const { fakeWindow, propertiesWithGetter } = createFakeWindow(globalContext);    const descriptorTargetMap = new Map<PropertyKey, SymbolTarget>();    const hasOwnProperty = (key: PropertyKey) => fakeWindow.hasOwnProperty(key) || globalContext.hasOwnProperty(key);    // 设置代理    const proxy = new Proxy(fakeWindow, {      set: (target: FakeWindow, p: PropertyKey, value: any): boolean => {        if (this.sandboxRunning) { // 子应用挂在中时执行一下逻辑          this.registerRunningApp(name, proxy);          // 当前 fakeWindows 没有时，改变windows变量          if (!target.hasOwnProperty(p) && globalContext.hasOwnProperty(p)) {            const descriptor = Object.getOwnPropertyDescriptor(globalContext, p);            const { writable, configurable, enumerable } = descriptor!;            if (writable) {              Object.defineProperty(target, p, {                configurable,                enumerable,                writable,                value,              });            }          } else { // 当前 fakeWindows 有值时，改变fakeWindows变量            // @ts-ignore            target[p] = value;          }          if (variableWhiteList.indexOf(p) !== -1) {            // @ts-ignore            globalContext[p] = value;          }          updatedValueSet.add(p);          this.latestSetProp = p;          return true;        }        return true;      },      get: (target: FakeWindow, p: PropertyKey): any => {        this.registerRunningApp(name, proxy);        // 当前 fakeWindows 有值时，取fakeWindows变量，没有时取window上的值        const value = propertiesWithGetter.has(p)          ? (globalContext as any)[p]          : p in target          ? (target as any)[p]          : (globalContext as any)[p];        const boundTarget = useNativeWindowForBindingsProps.get(p) ? nativeGlobal : globalContext;        return getTargetValue(boundTarget, value);      },      getOwnPropertyDescriptor(target: FakeWindow, p: string | number | symbol): PropertyDescriptor | undefined {        if (target.hasOwnProperty(p)) {          const descriptor = Object.getOwnPropertyDescriptor(target, p);          descriptorTargetMap.set(p, 'target');          return descriptor;        }        if (globalContext.hasOwnProperty(p)) {          const descriptor = Object.getOwnPropertyDescriptor(globalContext, p);          descriptorTargetMap.set(p, 'globalContext');          // A property cannot be reported as non-configurable, if it does not exists as an own property of the target object          if (descriptor && !descriptor.configurable) {            descriptor.configurable = true;          }          return descriptor;        }        return undefined;      },    });    this.proxy = proxy;    activeSandboxCount++;  }
```

#### active(加载函数)

```
active() {    if (!this.sandboxRunning) activeSandboxCount++;    this.sandboxRunning = true;  }
```

#### inactive(卸载函数)

```
inactive() {    this.sandboxRunning = false;  }
```

#### 总结

优点：相比第二种，不用在加载和卸载时恢复全局变量，性能得到进一步提升。并且支持加载多个子应用。不足：兼容性不如第一种。

### qiankun 如何调用

文章到这里有个问题，就是除了第一种方案之外的其他两种方案如何设置全局变量。如果看代码，我要设置设置一个 window.city = "杭州"，要用 LegacySandbox.proxy.city = “杭州”，这明显不符合大家的书写习惯啊。但是大家都知道，在乾坤的子应用中直接用 window.xxx 设置我们需要的变量。其实这里的实现是通过 import-html-entry 包来实现的，它支持执行页级 js 脚本以及拉取上述 html 中所有的外联 js 并支持执行。

```
function fn(window, self, globalThis) {    // 你的 JavaScript code  }  const bindedFn = fn.bind(window.proxy);  // 将子应用中的window.proxy指向window  bindedFn(window.proxy, window.proxy, window.proxy);
```

因此，当我们在 JS 文件里有 window.city = "杭州" 时，实际上会变成：

```
function fn(window, self, globalThis) {    window.city = "杭州"  }  const bindedFn = fn.bind(window.proxy);  bindedFn(window.proxy, window.proxy, window.proxy);
```

那么此时，window.city 的 window 就不是全局 window 而是 fn 的入参 window 了。又因为我们把 window.proxy 作为入参传入，所以 window.city 实际上为 window.proxy.city = "杭州"。

##### 参考资料

*   Qiankun 原理详解 JS 沙箱是如何做隔离 (https://www.zhangshengrong.com/p/Z9a2Q3jk1V/)
    

看完两件事
-----

如果你觉得这篇内容对你挺有启发，我想邀请你帮我两件小事

1. 点个「**在看**」，让更多人也能看到这篇内容（点了「**在看**」，bug -1 😊）

2. 关注公众号「**政采云前端**」，持续为你推送精选好文

招贤纳士
----

政采云前端团队（ZooTeam），一个年轻富有激情和创造力的前端团队，隶属于政采云研发部，Base 在风景如画的杭州。团队现有 80 余个前端小伙伴，平均年龄 27 岁，近 3 成是全栈工程师，妥妥的青年风暴团。成员构成既有来自于阿里、网易的 “老” 兵，也有浙大、中科大、杭电等校的应届新人。团队在日常的业务对接之外，还在物料体系、工程平台、搭建平台、性能体验、云端应用、数据分析及可视化等方向进行技术探索和实战，推动并落地了一系列的内部技术产品，持续探索前端技术体系的新边界。

如果你想改变一直被事折腾，希望开始能折腾事；如果你想改变一直被告诫需要多些想法，却无从破局；如果你想改变你有能力去做成那个结果，却不需要你；如果你想改变你想做成的事需要一个团队去支撑，但没你带人的位置；如果你想改变既定的节奏，将会是 “5 年工作时间 3 年工作经验”；如果你想改变本来悟性不错，但总是有那一层窗户纸的模糊… 如果你相信相信的力量，相信平凡人能成就非凡事，相信能遇到更好的自己。如果你希望参与到随着业务腾飞的过程，亲手推动一个有着深入的业务理解、完善的技术体系、技术创造价值、影响力外溢的前端团队的成长历程，我觉得我们该聊聊。任何时间，等着你写点什么，发给 `ZooTeam@cai-inc.com`

![](https://mmbiz.qpic.cn/mmbiz_jpg/vzEib9IRhZD7b2jpsibTsaZxWjfhyfqIpeMmOsdx6heH7KYxYXS1c6eQ30TrnyLyRa0SSs74NUM7BNTK8cu5XoibQ/640?wx_fmt=jpeg)