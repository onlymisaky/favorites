> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/v4EKb3A3QsZMK_-C5cnAVg)

大厂技术  高级前端  Node 进阶
===================

点击上方 程序员成长指北，关注公众号

回复 1，加入高级 Node 交流群

前言
--

写过 hybrid 的同学，想必都会遇到这样的需求，如果用户安装了自己的 APP，就打开 APP 或跳转到 APP 内某个页面，如果没安装则引导用户到对应页面或应用商店下载。这里就涉及到了 H5 与 Native 之间的交互，为什么 H5 能够唤起 APP 并且跳转到对应的页面？

就算你没写过想必也体验过，最常见的就是一些广告了，如果你点击了广告，他判断你手机装了对应 APP，那他就会去打开那个 APP，如果没安装，他会帮你跳转到应用商店去下载，这个还算人性化一点的，有些直接后台给你去下载，你完全无感知。

哈哈，是不是觉得这种技术很神奇，今天我们就一起来看看它是如何实现的～

唤端体验
----

实现之前我们先简单体验一下什么是唤端

![](https://mmbiz.qpic.cn/mmbiz_gif/aw5KtMic7pia6icU11ic02jBzqZXc3MmNWl4jUFevRrY3cjUXymB3rIjUyjIe8gvdggLTZy20xV6lwCbhfjzwak2Rw/640?wx_fmt=gif)

从上图中，我们可以看到在浏览器中我们点击打开知乎，系统会提示我们是否在知乎中打开，当我们点击打开时，知乎就被打开了，这就是一个简单的唤端体验。

**「有了这项技术我们就可以实现 H5 唤起 APP 应用了，现阶段的引流方式大都得益于这种技术，比如广告投放、用户拉新等。」**

唤端技术
----

体验过后，我们就来聊一聊它的实现技术是怎样的，唤端技术我们也称之为`deep link`技术。当然，不同平台的实现方式有些不同，一般常见的有这几种，分别是：

*   URL Scheme（通用）
    
*   Universal Link （iOS）
    
*   App Link、Chrome Intents（android）
    

### URL Scheme（通用）

这种方式是一种比较通用的技术，各平台的兼容性也很好，它一般由`协议名、路径、参数`组成。这个一般是由 Native 开发的同学提供，我们前端同学再拿到这个 scheme 之后，就可以用来打开 APP 或 APP 内的某个页面了。

#### URL Scheme 组成

> ❝
> 
> `[scheme:][//authority][path][?query][#fragment]`
> 
> ❞

#### 常用 APP 的 URL Scheme

<table><thead><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">APP</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">微信</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">支付宝</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">淘宝</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">QQ</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">知乎</th></tr></thead><tbody><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">URL Scheme</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">weixin://</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">alipay://</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">taobao://</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">mqq://</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">zhihu://</td></tr></tbody></table>

#### 打开方式

常用的有以下这几种方式

*   直接通过 window.location.href 跳转
    

```
window.location.href = 'zhihu://'
```

*   通过 iframe 跳转
    

```
const iframe = document.createElement('iframe')iframe.style.display = 'none'iframe.src = 'zhihu://'document.body.appendChild(iframe)
```

*   直接使用 a 标签进行跳转
    
*   通过 js bridge 来打开
    

```
window.miduBridge.call('openAppByRouter', {url: 'zhihu://'})
```

#### 判断是否成功唤起

当用户唤起 APP 失败时，我们希望可以引导用户去进行下载。那么我们怎么才能知道当前 APP 是否成功唤起呢？

我们可以监听当前页面的`visibilitychange`事件，如果页面隐藏，则表示唤端成功，否则唤端失败，跳转到应用商店。

OK，我们尝试来实现一下：

首先我手机上并没有安装腾讯微博，所以也就无法唤起，我们让他跳到应用商店对应的应用下载页，这里就用淘宝的下载页来代替一下～

```
<template>
  <div class="open_app">
      <div class="open_app_title">前端南玖唤端测试Demo</div>
      <div class="open_btn" @click="open">打开腾讯微博</div>
  </div>
</template>

<script>
let timer
export default {
    name: 'openApp',
    methods: {
        watchVisibility() {
            window.addEventListener('visibilitychange', () => {
                // 监听页面visibility
                if(document.hidden) {
                    // 如果页面隐藏了，则表示唤起成功，这时候需要清除下载定时器
                    clearTimeout(timer)
                }
            })
        },
        open() {
            timer = setTimeout(() => {
              // 没找到腾讯微博的下载页，这里暂时以淘宝下载页代替
                window.location.href = 'http://apps.apple.com/cn/app/id387682726'
            }, 3000)
            window.location.href = 'TencentWeibo://'
        }
    }
}
</script>

<style lang="less">
.open_app_title {
    font-size: (20/@rem);
}
.open_btn{
    margin-top:(20/@rem);
    padding:(10/@rem) 0;
    border-radius: (8/@rem);
    background: salmon;
    color: #fff;
    font-size: (16/@rem);
}
</style>
```

![](https://mmbiz.qpic.cn/mmbiz_gif/aw5KtMic7pia6icU11ic02jBzqZXc3MmNWl42KHG7jz11pGhafz5GXeZRqt5fZLNgkuuZ3S6G4nJ7WAjsqRE2TVQBw/640?wx_fmt=gif)

#### 适用性

URL Scheme 这种方式兼容性好，无论安卓或者 iOS 都能支持，是目前最常用的方式。从上图我们能够看出它也有一些比较明显的缺点：

*   无法准确判断是否唤起成功，因为本质上这种方式就是打开一个链接，并且还不是普通的 http 链接，所以如果用户没有安装对应的 APP，那么尝试跳转后在浏览器中会没有任何反应，通过定时器来引导用户跳到应用商店，但这个定时器的时间又没有准确值，不同手机的唤端时间也不同，我们只能大概的估计一下它的时间来实现，一般设为 3000ms 左右比较合适；
    
*   从上图中我们可以看到会有一个弹窗提示你是否在对应 APP 中打开，这就可能会导致用户流失；
    
*   有 URL Scheme 劫持风险，比如有一个 app 也向系统注册了 `zhihu://` 这个 scheme ，唤起流量可能就会被劫持到这个 app 里；
    
*   容易被屏蔽，app 很轻松就可以拦截掉通过 URL Scheme 发起的跳转，比如微信内经常能看到一些被屏蔽的现象。
    

### Universal Link （iOS）

Universal Link 是在`iOS 9`中新增的功能，使用它可以直接通过`https`协议的链接来打开 APP。它相比前一种`URL Scheme`的优点在于它是使用`https`协议，所以如果没有唤端成功，那么就会直接打开这个网页，不再需要判断是否唤起成功了。并且使用 Universal Link，不会再弹出是否打开的弹出，对用户来说，唤端的效率更高了。

#### 原理

*   在 APP 中注册自己要支持的域名；
    
*   在自己域名的根目录下配置一个 `apple-app-site-association` 文件即可。（具体的配置前端同学不用关注，只需与 iOS 同学确认好支持的域名即可）
    

#### 打开方式

```
openByUniversal () {  // 打开知乎问题页  window.location.href = 'https://oia.zhihu.com/questions/64966868'  // oia.zhihu.com},
```

![](https://mmbiz.qpic.cn/mmbiz_gif/aw5KtMic7pia6icU11ic02jBzqZXc3MmNWl45j1TmiaroOkKiaRS2YMLNUhr9iaVJmiagkuGciaZoHj25yonbDN6XkS00Vg/640?wx_fmt=gif)

#### 适用性

*   相对 URL Scheme，universal links 有一个较大优点是它唤端时没有弹窗提示是否打开，提升用户体验，可以减少一部分用户流失；
    
*   无需关心用户是否安装对应的 APP，对于没有安装的用户，点击链接就会直接打开对应的页面，因为它也是 http 协议的路径，这样也能一定程度解决 URL Scheme 无法准确判断唤端失败的问题；
    
*   只能够在 iOS 上使用
    
*   只能由用户主动触发
    

### App Link、Chrome Intents（Android）

#### App Link

在 2015 年的 Google I/O 大会上，Android M 宣布了一个新特性：App Links 让用户在点击一个普通 web 链接的时候可以打开指定 APP 的指定页面，前提是这个 APP 已经安装并且经过了验证，否则会显示一个打开确认选项的弹出框，只支持 Android M 以上系统。

App Links 的最大的作用，就是可以避免从页面唤醒 App 时出现的选择浏览器选项框;

前提是必须注册相应的 Scheme，就可以实现直接打开关联的 App。

*   App links 在国内的支持还不够，部分安卓浏览器并不支持跳转至 App，而是直接在浏览器上打开对应页面。
    
*   系统询问是否打开对应 App 时，假如用户选择 “取消” 并且选中了“记住此操作”，那么用户以后就无法再跳转 App。
    

#### Chrome Intents

*   Chrome Intent 是 Android 设备上 Chrome 浏览器中 URI 方案的深层链接替代品。
    
*   如果 APP 已安装，则通过配置的 URI SCHEME 打开 APP。
    
*   如果 APP 未安装，配置了 fallback url 的跳转 fallback url，没有配置的则跳转应用市场。
    

**「这两种方案在国内的应用都比较少。」**

### 方案对比

<table><thead><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;"><br></th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">URL Scheme</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">Universal Link</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">App Link</th></tr></thead><tbody><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">&lt;ios9</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">支持</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">不支持</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">不支持</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">&gt;=ios9</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">支持</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">支持</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">不支持</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">&lt;android6</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">支持</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">不支持</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">不支持</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">&gt;=android6</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">支持</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">不支持</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">支持</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">是否需要 HTTPS</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">不需要</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">需要</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">需要</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">是否需要客户端</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">需要</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">需要</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">需要</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">无对应 APP 时的现象</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">报错 / 无反应</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">跳到对应的页面</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">跳到对应的页面</td></tr></tbody></table>

**「URI Scheme:」**

*   URI Scheme 的兼容性是最高，但使用体验相对较差:
    
*   当要被唤起的 APP 没有安装时，这个链接就会出错，页面无反应。
    
*   当注册有多个 scheme 相同的时候，没有办法区分。
    
*   不支持从其他 app 中的 UIWebView 中跳转到目标 APP， 所以 ios 和 android 都出现了自己的独有解决方案。
    

**「Universal Link」**

*   已经安装 APP，直接唤起 APP；APP 没有安装，就会跳去对应的 web link。
    
*   universal Link 是从服务器上查询是哪个 APP 需要被打开，所以不会存在冲突问题
    
*   universal Link 支持从其他 app 中的 UIWebView 中跳转到目标 app
    
*   缺点在于会记住用户的选择：在用户点击了 Universal link 之后，iOS 会去检测用户最近一次是选择了直接打开 app 还是打开网站。一旦用户点击了这个选项，他就会通过 safiri 打开你的网站。并且在之后的操作中，默认一直延续这个选择，除非用户从你的 webpage 上通过点击 Smart App Banner 上的 OPEN 按钮来打开。
    

**「App link」**

*   优点与 Universal Link 类似
    
*   缺点在于国内的支持相对较差，在有的浏览器或者手机 ROM 中并不能链接至 APP，而是在浏览器中打开了对应的链接。
    
*   在询问是否用 APP 打开对应的链接时，如果选择了 “取消” 并且 “记住选择” 被勾上，那么下次你再次想链接至 APP 时就不会有任何反应
    

```
Node 社群




我组建了一个氛围特别好的 Node.js 社群，里面有很多 Node.js小伙伴，如果你对Node.js学习感兴趣的话（后续有计划也可以），我们可以一起进行Node.js相关的交流、学习、共建。下方加 考拉 好友回复「Node」即可。

   “分享、点赞、在看” 支持一波👍

```