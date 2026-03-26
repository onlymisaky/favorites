> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/h6vlkf5rgyI9GpEpPxO9cg)

![](https://mmbiz.qpic.cn/mmbiz_png/xdDaByDutCjAmyLtEqTAMsib5OJh6S6mPiadQyCOHNzUdyYbWTfk32WkUfq4DV9FJsfiatfYcicXiaL0Dwm8UdSDemw/640?wx_fmt=png)

**概述**  

在混合应用开发中，一种常见且成熟的技术方案是将原生应用与 WebView 结合，使得复杂的业务逻辑可以通过网页技术实现。实现这种类型的混合应用时，就需要解决 H5 与 Native 之间的双向通信。JSBridge 是一种在混合应用中实现 Web 和原生代码之间通信的重要机制。

**混合开发**

混合开发（Hybrid）是一种开发模式，指使用多种开发模型开发 App，通常会涉及到两大类技术：原生 Native、Web H5。

*   原生技术主要指 iOS、Android，原生开发效率较低，开发完成需要重新打包整个 App，发布依赖用户的更新，性能较高功能覆盖率更高
    
*   Web H5 可以更好的实现发布更新，跨平台也更加优秀，但性能较低，特性也受限
    

混合开发的意义就在于吸取两者的优点，而且随着手机硬件的升级迭代、系统（Android 5.0+、ISO 9.0+）对于 Web 特性的较好支持，H5 的劣势被逐渐缩小。

**JSBridge 的概念和作用**  

*   通信桥梁：JSBridge 充当了 Web 应用和原生应用之间的通信桥梁。通过 JSBridge，我们可以在 web 和原生代码之间进行双向通信，使这两者能够互相调用和传递数据。
    
*   原生功能调用：使用 JSBridge，我们可以在 JavaScript 中调用原生应用中的功能。我们可以通过 web 来触发原生应用中的特定操作，如打开相机、发送通知、调用硬件设备等。
    
*   数据传递：JSBridge 使得 JavaScript 和原生代码之间可以方便地传递数据。意味着我们可以在 web 和原生代码之间传递复杂的数据结构，如对象、数组等，以满足应用的功能需求。
    
*   回调机制：JSBridge 支持回调机制，使得在原生代码执行完某些操作后可以通知 JavaScript，并传递相应的结果。
    

**为什么在混合应用开发中 JSBridge 如此重要**  

*   跨平台开发：JSBridge 允许我们在混合应用中使用一套代码同时运行在不同的平台上。这意味着我们可以使用 Web 技术来开发应用的核心逻辑，并在需要时通过 JSBridge 调用原生功能，从而实现跨平台开发，提高开发效率。
    
*   原生功能扩展：使用 JSBridge，我们可以充分利用原生平台提供的功能和能力，例如访问硬件设备、调用系统 API 等。这使得我们可以为应用添加更多丰富的功能，提升用户体验。
    
*   灵活性和扩展性：JSBridge 提供了一种灵活和可扩展的方式来实现 Web 和原生代码之间的通信。开发人员可以根据应用的需求随时添加新的原生功能，并通过 JSBridge 在 JavaScript 中调用这些功能，从而实现应用的功能扩展和升级。 
    

**JSBridge 做了什么**  

在 Hybrid 模式下，H5 会需要使用 Native 的功能，比如打开二维码扫描、调用原生页面、获取用户信息等，同时 Native 也需要向 Web 端发送推送、更新状态等，而 JavaScript 是运行在单独的 JS Context 中（Webview 容器）与原生有运行环境的隔离，所以需要有一种机制实现 Native 端和 Web 端的 双向通信 ，这就是 JSBridge：以 JavaScript 引擎或 Webview 容器作为媒介，通过协定协议进行通信，实现 Native 端和 Web 端双向通信的一种机制。

通过 JSBridge，Web 端可以调用 Native 端的 Java 接口，同样 Native 端也可以通过 JSBridge 调用 Web 端的 JavaScript 接口，实现彼此的双向调用。

![](https://mmbiz.qpic.cn/mmbiz_png/xdDaByDutCiad0Pn0LzbSL7dUTjDZ0l1UCz68B2WNKTKia630TWym6apDghr3hePjBzMaEsdI5cOPYhvXVQx84vw/640?wx_fmt=png&from=appmsg)

**J****SBridge 实现原理**

把 Web 端和 Native 端的通信比作 Client/Server 模式。JSBridge 充当了类似于 HTTP 协议的角色，实现了 Web 端和 Native 端之间的通信。

将 Native 端原生接口封装成 JavaScript 接口：在 Native 端将需要被调用的原生功能封装成 JavaScript 接口，让 JavaScript 代码可以调用。JavaScript 接口会被注册到全局对象中，以供 JavaScript 代码调用。

将 Web 端 JavaScript 接口封装成原生接口：这一步是在 Web 端将需要被调用的 JavaScript 功能封装成原生接口。这些原生接口会通过 WebView 的某些机制暴露给原生代码，以供原生代码调用。

**Native -> Web**  

Native 端调用 Web 端，JavaScript 作为解释性语言，最大的一个特性就是可以随时随地地通过解释器执行一段 JS 代码，所以可以将拼接的 JavaScript 代码字符串，传入 JS 解析器执行就可以，JS 解析器在这里就是 webView。

**1. Android**

Android 提供了 evaluateJavascript 来执行 JS 代码，并且可以获取返回值执行回调：

```
String jsCode = String.format("window.showWebDialog('%s')", text);
webView.evaluateJavascript(jsCode, new ValueCallback<String>() {
  @Override
  public void onReceiveValue(String value) {

  }
});
```

**2. IOS**

IOS 的 WKWebView 使用 evaluateJavaScript：

```
[webView evaluateJavaScript:@"执行的JS代码" 
  completionHandler:^(id _Nullable response, NSError * _Nullable error) {
  // 
}];
```

**Web -> Native**  

Web 调用 Native 端主要有两种方式：

**1. URL Schema**

URL Schema 是类 URL 的一种请求格式，格式如下：

```
<protocol>://<host>/<path>?<qeury>#fragment
  
// 我们可以自定义JSBridge通信的URL Schema，比如：
hellobike://showToast?text=hello
```

Native 加载 WebView 之后，Web 发送的所有请求都会经过 WebView 组件，所以 Native 可以重写 WebView 里的方法，从来拦截 Web 发起的请求，我们对请求的格式进行判断：

*   符合我们自定义的 URL Schema，对 URL 进行解析，拿到相关操作、操作，进而调用原生 Native 的方法
    
*   不符合我们自定义的 URL Schema，我们直接转发，请求真正的服务
    

例如：

```
get existOrderRedirect() {
    let url: string;
    if (this.env.isHelloBikeApp) {
      url = 'hellobike://hellobike.com/xxxxx_xxx?from_type=xxxx&selected_tab=xxxxx';
    } else if (this.env.isSFCApp) {
      url = 'hellohitch://hellohitch.com/xxx/xxxx?bottomTab=xxxx';
    }
    return url;
  }
```

这种方式从早期就存在，兼容性很好，但是由于是基于 URL 的方式，长度受到限制而且不太直观，数据格式有限制，而且建立请求有时间耗时。

**2. 在 Webview 中注入 JS API**

通过 webView 提供的接口，App 将 Native 的相关接口注入到 JS 的 Context（window）的对象中

Web 端就可以直接在全局 window 下使用这个暴露的全局 JS 对象，进而调用原生端的方法。

Android 注入方法：

*   4.2 前，Android 注入 JavaScript 对象的接口是 addJavascriptInterface 但是这个接口有漏洞
    
*   4.2 之后，Android 引入新的接口 @JavascriptInterface 以解决安全问题，所以 Android 注入对对象的方式是有兼容性问题的。
    

IOS 注入方法：

*   iOS 的 UIWebView：JavaSciptCore 支持 iOS 7.0 及以上系统
    
*   iOS 的 WKWebView：WKScriptMessageHandler 支持 iOS 8.0 及以上系统
    

例如：

*   注入全局对象
    

```
// 注入全局JS对象
webView.addJavascriptInterface(new NativeBridge(this), "NativeBridge");

class NativeBridge {
    private Context ctx;
    NativeBridge(Context ctx) {
        this.ctx = ctx;
    }

    // 绑定方法
    @JavascriptInterface
    public void showNativeDialog(String text) {
        new AlertDialog.Builder(ctx).setMessage(text).create().show();
    }
}
```

*   Web 调用方法：
    

```
// 调用nativeBridge的方法
window.NativeBridge.showNativeDialog('hello');
```

**H5 具体实现**  

将功能抽象为一个 AppBridge 类，封装两个方法，处理交互和回调。

具体步骤：

*   首先需要定义一个 JavaScript 类或者对象来封装 JSBridge 方法。
    
*   在 JavaScript 类或对象的构造函数中，初始化桥接回调的方法。这个方法负责接收来自原生应用的回调数据，并根据回调数据中的信息执行相应的操作。
    
*   调用原生方法：定义一个方法，用于在 JavaScript 中调用原生方法。这个方法需要接收原生类的映射、要调用的原生方法名以及传递给原生方法的参数，并将这些信息传递给原生应用。
    
*   处理原生回调：在初始化桥接回调的方法中，需要定义处理原生回调的逻辑。当收到原生应用的回调数据时，根据回调数据中的信息执行相应的操作，比如调用 JavaScript 中注册的回调函数，并传递执行结果或错误信息等。
    

具体实现代码：

*   调用原生方法：
    

```
// 定义一个名为 callNative 的方法，用于在 JavaScript 中调用原生方法
callNative<P, R>(classMap: string, method: string, params: P): Promise<R> {
    return new Promise<R>((resolve, reject) => {
        // 生成一个唯一的回调 ID
        const id = v4();
        // 将当前的回调函数保存到 __callbacks 对象中，以 callbackId 作为键
        this.__callbacks[id] = { resolve, reject, method: `${classMap} - ${method}` };
        // 构造通信数据，包括原生类映射、要调用的方法、参数和 callbackId 
        const data = {
            classMap,
            method,
            params: params === null ? '' : JSON.stringify(params),
            callbackId: id,
        };
        const dataStr = JSON.stringify(data);
        // 根据当前环境判断是 iOS 还是 Android，并调用相应平台的原生方法
        if (this.env.isIOS && isFunction(window?.webkit?.messageHandlers?.callNative?.postMessage)) {
            // 如果是 iOS 平台，则调用 iOS 的原生方法
            window.webkit.messageHandlers.callNative.postMessage(dataStr);
        } else if (this.env.isAndroid && isFunction(window?.AppFunctions?.callNative)) {
            // 如果是 Android 平台，则调用 Android 的原生方法
            window.AppFunctions.callNative(dataStr);
        }
    });
}
```

*   回调处理：
    

```
// 初始化桥接回调函数，该参数在 constructor 中调用
private initBridgeCallback() {
    // 保存旧的回调函数到 oldCallback 变量中
    const oldCallback = window.callBack;
    // 重新定义 window.callBack 方法，用于处理原生应用的回调数据
    window.callBack = (data) => {
        // 如果存在旧的回调函数，则调用旧的回调函数
        if (isFunction(oldCallback)) {
            oldCallback(data);
        }
        // 获取原生应用的回调信息，包括数据和回调 ID
        console.info('native callback', data, data.callbackId);
        // 从回调数据中获取回调 ID
        const { callbackId } = data;
        // 根据回调 ID 查找对应的回调函数
        const callback = this.__callbacks[callbackId];
        // 如果找到了对应的回调函数
        if (callback) {
            // 如果回调数据中的 code 为 0，则表示执行成功，调用 resolve 方法处理成功的结果
            if (data.code === 0) {
                callback.resolve(data.data);
            } else {
                // 否则，表示执行失败，构造一个错误对象并调用 reject 方法处理错误信息
                const error = new Error(data.msg) as Error & {response:unknown};
                error.response = data;
                callback.reject(error);
            }
            // 删除已经处理过的回调函数
            delete this.__callbacks[callbackId];
        }
    };
}
```

*   使用：
    

```
// 调用原生方法的封装函数
callNative<P, R>(classMap: string, method: string, params: P) {
    // 从容器中解析出 AppBridge 实例
    const bridge = container.resolve<AppBridge>(AppBridge);
    // 使用 bind 方法将 AppBridge 实例中的 callNative 方法绑定到 bridge 对象上，并保存到 func 变量中
    const func = bridge.callNative.bind(bridge);
    // 调用 func 方法，并传入 classMap、method 和 params 参数，实现调用原生方法的功能
    return func<P, R>(classMap, method, params);
}


// 打开 webview
// 调用 callNative 方法，传入参数 url，classMap 为 'xxxxx/hitch'，method 为 'openWebview'
openWebView(url: string): Promise<void> {
    return this.callNative<{url:string}, void>('xxxxx/hitch', 'openWebview', { url });
}


// 获取驾驶证 OCR 信息
getDriverLicenseOcrInfo(
    params: HBNative.getDriverLicenseOcrInfo.Params,
): Promise<HBNative.getDriverLicenseOcrInfo.Result> {
    // 调用 callNative 方法，传入参数 params，classMap 为 'xxxxx/hitch'，method 为 'getOcrInfo'
    // 返回一个 Promise 对象，该 Promise 对象用于处理异步结果
    return this.callNative<
        HBNative.getDriverLicenseOcrInfo.Params,
        HBNative.getDriverLicenseOcrInfo.Result>(
            'xxxxx/hitch', 'getOcrInfo', params,
        );
}
```

The End

如果你觉得这篇内容对你挺有启发，请你轻轻点下小手指，帮我两个小忙呗：

1、点亮**「在看」**，让更多的人看到这篇满满干货的内容；

2、关注公众号「哈啰技术」，可第一时间收到最新技术推文。

如果喜欢就点个👍喔，有您的喜欢⛽，我们会更有动力输出有价值的技术分享滴。

![](https://mmbiz.qpic.cn/mmbiz_png/xdDaByDutChvEuVqH7YqMpINOLvAvnPRa7WxcazMGJ9TBw8BZcY7aXACCP1775tMGxviaV7XCMOztGobpLJT9BA/640?wx_fmt=other&wxfrom=5&wx_lazy=1&wx_co=1&tp=webp)