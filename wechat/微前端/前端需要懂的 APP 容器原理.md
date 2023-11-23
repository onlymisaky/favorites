> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/MgMyAEVKKhuB16LdX07j1A)

> 本文来自阿里巴巴飞猪前端专家 @孝瓘，在移动端容器建设有深厚的经验，热爱**前端 / iOS/Android 开发，从端视角负责过飞猪 H5/RN/Weex / 小程序 / Flutter 容器的建设**，本文试图从前端视角，向读友揭一揭 “App 容器” 的面纱，欢迎大伙一起交流。

App 容器，简言之，App 承载某类应用（H5/RN/Weex / 小程序 / Flutter ...）的运行环境，可主动干预并进行功能扩展，达到丰富能力、优化性能、提升体验的目的，如页面数据预取（prefetch）缩短页面可用耗时、WebAR 将 AR 能力赋予 H5、Native 地图与 H5 复合渲染交互。

<table data-tool="mdnice编辑器"><thead><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); text-align: center;">数据预取</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); text-align: center;">WebAR 能力</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); text-align: center;">Native 与 H5 复合</th></tr></thead><tbody><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); text-align: center;"><img class="" src="https://mmbiz.qpic.cn/mmbiz_gif/4P9LjTnOGMvIylE7sXQTCFhuDDWIbnEyHYwOIkRAPyFrTkFwxbeGqUAK5Z4XRns8hnV4bFayF4CKIeYK52AOeQ/640?wx_fmt=gif"></td><td data-style="border-color: rgb(204, 204, 204); text-align: center;"><img class="" src="https://mmbiz.qpic.cn/mmbiz_gif/4P9LjTnOGMvIylE7sXQTCFhuDDWIbnEyPmwZlKCxY0Uujkh2kUKibqqPWLDtabM60xTvIolgCVEuoUq9J3xdJeg/640?wx_fmt=gif"></td><td data-style="border-color: rgb(204, 204, 204); text-align: center; word-break: break-all;"><img class="" src="https://mmbiz.qpic.cn/mmbiz_gif/4P9LjTnOGMvIylE7sXQTCFhuDDWIbnEyvrsSsbZkZxatEEZGxnhn4M13VUACFcBMATwMIYFWS78JcibH9AwBdCQ/640?wx_fmt=gif"></td></tr></tbody></table>

本篇主要就 H5 容器（WebView）相关建设进行概要展开。

我们先来做一个类比，通过 H5 的视角简要看一看 Android、iOS，进而更容易理解 WebView 容器建设机理。

<table data-tool="mdnice编辑器"><thead><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); text-align: right;">内容</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); text-align: center;">H5</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); text-align: center;">Android</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); text-align: center;">iOS</th></tr></thead><tbody><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); text-align: right;">窗口</td><td data-style="border-color: rgb(204, 204, 204); text-align: center;">Window</td><td data-style="border-color: rgb(204, 204, 204); text-align: center;">PhoneWindow</td><td data-style="border-color: rgb(204, 204, 204); text-align: center;">UIWindow</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); text-align: right;">页面控制</td><td data-style="border-color: rgb(204, 204, 204); text-align: center;">Html</td><td data-style="border-color: rgb(204, 204, 204); text-align: center;">Activity</td><td data-style="border-color: rgb(204, 204, 204); text-align: center;">UIViewController</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); text-align: right;">内容区</td><td data-style="border-color: rgb(204, 204, 204); text-align: center;">body</td><td data-style="border-color: rgb(204, 204, 204); text-align: center;">contentView(DecorView)</td><td data-style="border-color: rgb(204, 204, 204); text-align: center;">view</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); text-align: right;">常规 UI(容器、文本、图片)</td><td data-style="border-color: rgb(204, 204, 204); text-align: center;">div、content、img</td><td data-style="border-color: rgb(204, 204, 204); text-align: center;">View、TextView、ImageView</td><td data-style="border-color: rgb(204, 204, 204); text-align: center;">UIView、UILabel、UIImageView</td></tr></tbody></table>

> 通过如上对比可知，Native 与 H5 有很多相通之处的，如：H5 是一个 html 创建一个页面；Android 是一个 Activity 创建一个页面；iOS 是 UIViewController 创建一个页面。不同处在于， Native 本身有完善的页面栈管理机制，在同一个 runtime 环境里控制页面间转换；还可以管理多个窗口 (Window)，有多线程 / 进程(仅 Android) 辅助合理使用资源保障主线程 / 进程性能，是 App 的体验。而 H5 本身受运行环境限制，只能在一个窗口里活动，目前缺少同一个 Runtime 内成熟的页面栈管理机制，当前 SPA 方式切换 view 来模拟“页面转场”，已是 WebApp 体验的一种较佳实现了。所以，在 App 里，H5 期望能借助更多的 Native 能力。

在 App 里，是通过 WebView 来访问 h5 页面的，先来看一下 WebView 的官方释义：

> A View that displays web pages. This class is the basis upon which you can roll your own web browser or simply display some online content within your Activity. It uses the **WebKit rendering engine** to display web pages and includes methods to navigate forward and backward through a history, zoom in and out, perform text searches and more.

其实，WebView 在 Android/iOS 两端的实现，都是继承自其 View/UIView 基类。对于 Native 原生来说，WebView 本身通过加载 h5 页面、通过 Chromium/WebKit 内核解析并进行 UI 合成，生成 view，Activity/UIViewController 实例的 View 通过 addView(Android)/addSubview(iOS) 将 web view 添加进视图层，UI 合成，然后上屏展示。

我们知道，App 可以使用系统能力，但 WebView（类比浏览器）出于安全等考虑，默认并不提供。我们建设容器的一个主要目的是将 App 这些可用能力开放给容器。下面就谈一谈这部分能力是如何提供出来的，也就是下面要讲的桥通道相关建设。

桥通道
---

桥有接连之义，将本不互通的二者通过桥连通起来，形象化的描述了 “App 能力” 以“通道”的形式输送给容器使用，本质上就是如何让我们的 H5 能够使用这些能力。下面分开来看两端的实现思路：

### Android

通过  WebView  的  addJavascriptInterface  方法来建立 Java 与 JS 对象映射关系互通。对系统版本要求 4.2+ ，主流 App 基本都基于 5 + 适配了，兼容低版本的方案就略过了。如下：

1.  定义与  WebView JS 上下文（即 window 挂载对象）建立映射关系的 Android JavascriptInterface 实现类及 call 方法
    
    ```
    package ......import android.webkit.JavascriptInterface;public class JSBridgeChannel {    @JavascriptInterface    // JS侧JSON.stringify序列化处理options对象    public void call(String api, String options){        //根据api及传递过来的参数处理Native对应的功能        ...    }}
    ```
    
2.  在 WebView 的 loadUrl 时机（保证 H5 JS 运行前桥通道已准备 ok），通过  WebView  的  addJavascriptInterface  方法建立 Android 类实例对象 与 JS 对象 的映射关系
    
    ```
    @Overridepublic void loadUrl(String url) {    ...    //…构造函数所需参数；AliJSBridge 为JS映射对象名    mWebView.addJavascriptInterface(new JSBridgeChannel(…), "JSBridge");}
    ```
    
3.  WebView 里 JS 即可同步调用
    
    ```
    window.JSBridge.call("api", JSON.stringify(options));
    ```
    

也可以借助 Android 系统 提供的 JS 在调试 Native 代码里面打印日志的 API onConsoleMessage，通过获取 message 来做通讯数据，但不推荐。

### iOS

WKWebView 提供了 MessageHandler 方式来处理 JS 与 Native 的数据交互，其优点是同步调用，性能 / 稳定性更优，更少内存占用。对系统版本要求 iOS 8+，主流 App 基本都基于 9 + 适配了。

WKWebView 在初始化时：`[[WKWebView alloc] initWithFrame:frame configuration:config]`，其配置参数`configuration` 是 WKWebViewConfiguration 类型参数，WKWebViewConfiguration 有一个属性叫 userContentController，是 WKUserContentController 类型参数，WKUserContentController 有个实例方法 `[addScriptMessageHandler:name:](https://developer.apple.com/documentation/webkit/wkusercontentcontroller/1537172-addscriptmessagehandler?language=objc)`，官方释义清晰地说明了，其可建立起 JS 与 Native 的通讯通道：

> Adding a script message handler with name name causes the JavaScript function window.webkit.messageHandlers.name.postMessage(messageBody) to be defined in all frames in all web views that use the user content controller.

1.  在 VC init 时机进行 WKWebView  初始化，创建 WKWebViewConfiguration 对象，配置 MessageHandler 对象。通过`addScriptMessageHandler:name:` 添加实现 WKScriptMessageHandler 协议的对象，以及被 JS 调用的方法名。注：记得在 VC dealloc 时，通过`removeScriptMessageHandlerForName` 移除释放。
    
    ```
    WKWebViewConfiguration *configuration = [[WKWebViewConfiguration alloc] init];//添加ScriptMessageHandler，即H5侧可以调用的方法bridge[configuration.userContentController addScriptMessageHandler:self initWithDelegate:self] name:@"bridge"];//创建WKWebView[[WKWebView alloc] initWithFrame:frame configuration:configuration];
    ```
    
2.  实现`WKScriptMessageHandler`协议代理方法，当 JS 通过 window.webkit.messageHandlers 发送 Native 消息时，此方法会被调用
    
    ```
    - (void)userContentController:(WKUserContentController *)userContentController didReceiveScriptMessage:(WKScriptMessage *)message{    if ([@"bridge" isEqualToString:message.name]){        //提取api        NSString *api = [NSString stringWithString:message.body[@"_api_"]];        //根据api及传递过来的参数去调用Native对应的功能        ...    }}
    ```
    
3.  WebView 里 JS 即可同步调用
    
    ```
    const options = {    //注意这里，是一个技巧性的处理方式，可以避免过多的messageHandlers注册   _api_: ‘apiName',   ...};window.webkit.messageHandlers['bridge'].postMessage(options);
    ```
    

#### 统一桥 API 调用方式

如上是两端通过同步方式向 WebView 的 JSContext 上，即 Window 上挂载了 JS 可以调用的对象方法，但两端的使用方式还是有差异。为了能够方便 H5 使用统一，两端还可以分别注入一段兼容封装的 JS 脚本，将两端的桥功能统一成 `JSBridge.call(api, options, success, failure)` 形式调用。

*   Android 侧 JS 脚本注入（在 mWebView.addJavascriptInterface 之后注入即可）：
    
    ```
    String js = "!(_ => {   // JS封装code })();";mWebView.evaluateJavascript(js, new ValueCallback<String>() {    @Override    public void onReceiveValue(String value) {        ...    }});
    ```
    
*   iOS 侧 JS 脚本注入：
    
    ```
    NSString *js = @"!(_ => {   // JS封装code })();";WKUserScript *script = [[WKUserScript alloc] initWithSource: js                                              injectionTime:WKUserScriptInjectionTimeAtDocumentStart  // 注入时机按需配置即可：WKUserScriptInjectionTimeAtDocumentStart->刚开始创建 Dom 时；WKUserScriptInjectionTimeAtDocumentEnd -> DomReady时                                           forMainFrameOnly:NO];[_webView.configuration.userContentController addUserScript: script];
    ```
    

**若对更底层的实现有兴趣，可以继续向下深入**：

*   Android 下，Java 的 JVM 是 C/C++ 语言开发，V8 编程语言是 C++，提供了数据类型间转换的 Value 类及其子类，在其官网 About V8 里也有明确说明：`V8 enables any C++ application to expose its own objects and functions to JavaScript code.`。与 Java 的 JNI 同理。
    
*   iOS 下，Objective-C 是 C 语言的严格超集，支持 C++，JavaScriptCore 编程语言也是 C++，同样提供了数据类型间转换的 JSValue 类，其官网释义也有明确说明：
    
    > A JSValue instance is a reference to a JavaScript value. ... You can also use this class to create JavaScript objects that wrap native objects of custom classes or JavaScript functions whose implementations are provided by native methods or blocks.
    
*   C++ 几乎又是 C 的超集，在理解 JS 与 Java、OC 交互就明了了。以 V8 示例，比如实现一个 function 让 JS 调用：
    
    V8 中，有两个模板 (Template) 类：对象模板 (ObjectTemplate) 与 函数模板 (FunctionTemplate) ，用以定义 JavaScript 对象和 JavaScript 函数。
    
    ```
    // function 定义Handle<Value> fn(const Arguments& args){    //do something}// JSContextHandle<ObjectTemplate> global = ObjectTemplate::New();// 将fn Binding到JSContext上，JS便可调用 fn 了Handle<FunctionTemplate> fn_template = FunctionTemplate::New(fn);global->Set(String::New("fn"), fn_template);
    ```
    

通过桥通道支持，H5 便有了 App 级的能力，下面谈一点容器在性能上的优化建设 - 网络优化。

网络优化
----

原生 Native 之所以体验平滑，有一关键点，是其页面依赖的静态资源大部分已打进安装包，跟随 App 的安装到了用户本地，节省了网络 IO 开销。顺着这个思路，在 5G 真正平民化之前，网络 IO 消耗，仍是提升性能的一个优化点，这块简要谈一下思路。

主要是两方面：

1.  静态资源，html/js/css / 图片 / 字体 / 视频等，通过离线化、预加载、懒加载、开启 WebView 缓存复用等进行文件获取前置备用或复用，当前用户访问页面加载资源时，容器拦截资源网络请求，命中离线或缓存的资源文件并使用。离线化与预加载可直接节省首次网络 IO 性能消耗，其他方式可以节省二次网络 IO 性能消耗。
    

*   离线化：即像 Native 一个打进 App 安装包内
    
*   预加载：App 启动后，在页面使用前，提前加载资源到用户本地备用
    

3.  接口数据预取，选择合适的时机在用户访问页面前将接口数据获取到，当用户进入页面时，拦截接口网络请求直接命中本地缓存数据并使用。
    

这层优化，需要有配套的端远程控制机制与管理后台。合理设计总控机制，管控静态文件的发布、版本 / patch 更新、下线等，以及接口数据预取的匹配规则、生命周期管理、静态 / 动态参数配置处理等。

![](https://mmbiz.qpic.cn/mmbiz_png/4P9LjTnOGMvIylE7sXQTCFhuDDWIbnEyspTIDC7zQscNEfypZS7RllKcibUsWQUgEpqkcSyhnP8kgQgRlrJCCRg/640?wx_fmt=png)

我们主要就静态资源网络优化实现，分端简要介绍一下实现思路，主要是对静态资源网络请求进行拦截处理：

### Android

通过`shouldInterceptRequest`方法拦截处理（系统要求 4.0+），官方释义清晰明了：

> Notify the host application of a resource request and allow the application to return the data. If the return value is null, the WebView will continue to load the resource as usual. Otherwise, the return response and data will be used.

```
@Overridepublic WebResourceResponse shouldInterceptRequest(WebView view, String url) {    WebResourceResponse response = null;    if(// 匹配拦截规则){        // 容器生成response        // WebResourceResponse(String mimeType, String encoding, int statusCode, String reasonPhrase, Map<String, String> responseHeaders, InputStream data)        response =  new WebResourceResponse(...);    }    return response;}
```

### iOS

受 “官方” 因素影响，iOS 的实现相对复杂些，了解过其发版审核的同学应该懂得的，这里就略过了。。。

### 注意事项

response 的 header 要处理正确

1.  要正确处理拦截资源的 content-type
    
2.  要正确处理拦截资源的`Access-Control-Allow-Origin`，避免跨域资源校验问题
    

接口数据预取本质上也是拦截识别处理，因为涉及静态 / 动态参数处理、有效期控制等，要复杂的多，这里就不再展开了。

下面这块，我们概要性地谈一谈容器增强能力的建设~ WebAR 支持的实现思路：

WebAR
-----

在说 WebAR 之前，先看一下 AR。简要讲：AR 是通过启动摄像头获取现实环境，以视频帧的形式将现实环境数据传输给 识别模块 与 绘制模块，识别模块将识别结果数据传递给绘制模块（根据业务配置的识别规则处理成对应的虚拟事物），绘制模块将 现实环境数据与识别结果数据处理后进行展现。

![](https://mmbiz.qpic.cn/mmbiz_png/4P9LjTnOGMvIylE7sXQTCFhuDDWIbnEy00ch5XG2icjHbSiaicUMU1pHKlHRfY97nnb8r8dBdbhX71wn7edekU6nw/640?wx_fmt=png)

WebAR 是两个概念，是 Web + AR，在 Web 端提供 AR 能力。Web 自身，依靠 WebGL 实时图形渲染 与 WebRTC 实时视频流处理能力，能够实现 AR 体验。但受其运行环境标准不一、渲染性能差等因素影响，我们在容器侧进行了能力干预支持，以保障其功能与性能体验等。

在容器侧建设上，将 AR 能力集成到 App 上，再将 AR 能力提供给 WebView 使用（结合上面讲到的桥通道能力理解），以 H5 页的形式呈现。我们 Android 侧接入的是 UCWebView 提供的 AR 能力，使用 WebGL 渲染；iOS 是集成的 ARKit，通过全屏的 OpenGLView 上放置一个背景透明的 WebView 实现的混合渲染。

两端提供了配置识别模块能力支持。目前识别主要分为两类：一类基于 Maker 的识别（此类是常用的，识别标记图），另一类是基于位置的识别（通俗理解是通过手机传感器的方向和位置增强沉浸感，如位置远显示的内容较小，反之则大）。

当前小程序正如日中天，其有一项能力是很好的结合了 Native 与 H5，即 “同层渲染”，下面我们也“纸上谈兵” 一次。不过，我们也已有业务诉求，要做同层渲染的建设，将 Native 的 Video 等原生组件应用到 WebView 上满足业务体验需要。

同层渲染
----

这里讲的同层渲染，是将 Native view 合成到 WebView 上，可以通过 CSS 控制 Native View 在页面的样式。

以下介绍的两端方案，是基于目前笔者了解到的实现方案里最佳的。

### Android

需要基于 Chromium 内核扩展自研的 WebView。Chromium 支持 WebPlugin 机制，用来识别解析 dom 标签。其思路：

1.  html 里创建 dom 节点，指定组件类型，供容器识别处理
    
2.  Chromium 创建 WebPlugin 实例，并生成 RenderLayer，其作用是创建独立的层并返回相应的画布供视图绘制使用
    
3.  Android 根据识别的 组件类型 ，初始化一个对应的原生组件
    
4.  Android 将原生组件的视图绘制 到 RenderLayer 所绑定的 SurfaceTexture 上（将 Android 的 UI Toolkit 的视图的数据送到 Texture 供 openGL 绘制使用）
    
5.  Chromium 将此 RenderLayer 与 Web 页面的 View 进行合成渲染
    

### iOS

基于 WKWebView，WK 在内部采用的是分层的方式进行渲染，一般会将多个 dom 节点，合并到一个层上进行渲染。因此，dom 节点和层之间不存在一一对应关系。但是，若将一个 dom 节点的 CSS 属性设置为 “overflow: scroll” 后，WKWebView 便会为其生成一个 WKChildScrollView，**且 WebKit 内核已经处理了 WKChildScrollView 与其他 dom 节点之间的层级关系**，这时 dom 节点就和层之间有一一对应关系了。所以，同层渲染可基于 WKChildScrollView 实现：

1.  html 里创建 din 节点并设置其 CSS 属性为 overflow: scroll，指定组件类型，供容器识别处理
    
2.  iOS 查找到该 dom 节点对应的原生 WKChildScrollView 组件
    
3.  iOS 根据识别的 组件类型 ，初始化一个对应的原生组件
    
4.  iOS 将原生组件挂载到该 WKChildScrollView 节点上作为其子 view，这样原生组件就被插入到了 webView 上
    
5.  WebKit 完成渲染
    

结语
--

先到这了 👀

关于奇舞周刊
------

《奇舞周刊》是 360 公司专业前端团队「奇舞团」运营的前端技术社区。关注公众号后，直接发送链接到后台即可给我们投稿。

![](https://mmbiz.qpic.cn/mmbiz_png/MpGQUHiaib4ib6j9X9s2kibfaicBLmIm6dUBqymVmiaKqGFEPn0G3VyVnqQjvognHq4cMibayW2400j4OyEtdz5fkMbmA/640?wx_fmt=jpeg)