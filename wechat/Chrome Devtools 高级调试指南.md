> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/xpnBlI2QGdEB2GDrCcp2LQ)

前言  

本文暂未涉及`Performance`面板的内容。  
后续会单独出一篇，以下是目录：

1.  常用命令和调试
    
2.  黑盒脚本：`Blackbox Script`
    
3.  控制台内置指令
    
4.  远程调试`WebView`
    

1. Chrome Devtools 的用处
----------------------

*   前端开发：开发预览、远程调试、性能调优、`bug`跟踪、断点调试等
    
*   后端开发：网络抓包、开发调试 Response
    
*   测试：服务端`API`数据是否正确、审查页面元素样式及布局、页面加载性能分析、自动化测试
    
*   其他：安装扩展插件，如`AdBlock、Gliffy、Axure`等
    

2. 菜单面板拆解
---------

![](https://mmbiz.qpic.cn/mmbiz_png/icnrNBicEhkVXqmSCKJU2AL5oLThKJq1GRoEQdUegQQNDcxYqRKqb5LbiaNlCicIDEEfbcrTu2FmkktsAxwRSKNx3Q/640?wx_fmt=png)

*   `Elements` - 页面 dom 元素
    
*   `Console` - 控制台
    
*   `Sources` - 页面静态资源
    
*   `Network` - 网络
    
*   `Performance` - 设备加载性能分析
    
*   `Application` - 应用信息，`PWA/Storage/Cache/Frames`
    
*   `Security` - 安全分析
    
*   `Audits` - 审计，自动化测试工具
    

3. 常用命令和调试
----------

### 1. 呼出快捷指令面板：cmd + shift + p

在`Devtools`打开的情况下，键入`cmd + shift + p`将其激活，然后开始在栏中键入要查找的命令或输入`"?"`号以查看所有可用命令。

![](https://mmbiz.qpic.cn/mmbiz_png/icnrNBicEhkVXqmSCKJU2AL5oLThKJq1GRibYV6zkK2skd3WYJmPLEibacN6vgFJ5wpVgFJddrrDRSmF6kFpqfsR3A/640?wx_fmt=png)

*   `…`: 打开文件
    
*   `:`: 前往文件
    
*   `@`：前往标识符（函数，类名等）
    
*   `!`: 运行脚本文件
    
*   `>;`: 打开某菜单功能
    

![](https://mmbiz.qpic.cn/mmbiz_gif/icnrNBicEhkVXqmSCKJU2AL5oLThKJq1GRP2TegvKPCpEBeDRg7qeSYVVJcKLdZiccSFDJhwocGODmXWa9ibA75iaPA/640?wx_fmt=gif)

#### 1. 性能监视器：> performance monitor

![](https://mmbiz.qpic.cn/mmbiz_gif/icnrNBicEhkVXqmSCKJU2AL5oLThKJq1GRJagKcanjNKk1Z0XBdd3SdxEtjibNl3AHLLdSF3w9ibpEvTuGicxFYF0Ag/640?wx_fmt=gif)  
将显示性能监视器以及相关信息，例如 CPU，JS 堆大小和 DOM 节点。

#### 2.FPS 实时监控性能：> FPS 选择第一项

![](https://mmbiz.qpic.cn/mmbiz_gif/icnrNBicEhkVXqmSCKJU2AL5oLThKJq1GRYgkozMM9mSbu6VU3VsnDiaJiac2Oc0VueibU81bjcAok21ia3swlmUmicnQ/640?wx_fmt=gif)

#### 3. 截图单个元素：> screen 选择 Capture node screenhot

![](https://mmbiz.qpic.cn/mmbiz_png/icnrNBicEhkVXqmSCKJU2AL5oLThKJq1GRLgAibhYeUhu4dZlahkBwMhcibBCA6nFhTGZrSDZfW7JYGxeIws7vnFBw/640?wx_fmt=png)  
![](https://mmbiz.qpic.cn/mmbiz_gif/icnrNBicEhkVXqmSCKJU2AL5oLThKJq1GRkvgLhm8bPkz5uX6KmgUaLKXVgt9P7F80jhVe5oTa1TRVHwnpwIYsNw/640?wx_fmt=gif)

### 2. DOM 断点调试

当你要调试特定元素的 DOM 中的更改时，可以使用此选项。这些是 DOM 更改断点的类型：  

![](https://mmbiz.qpic.cn/mmbiz_png/icnrNBicEhkVXqmSCKJU2AL5oLThKJq1GRIzpdGdoER17ebyxNz6h0q4BYsfpHSBx5bbB2xuxk3WJRwC9HicuQL7w/640?wx_fmt=png)

*   `Subtree modifications`: 子节点删除或添加时
    
*   `Attributes modifications`: 属性修改时
    
*   `Node Removal`: 节点删除时
    

![](https://mmbiz.qpic.cn/mmbiz_gif/icnrNBicEhkVXqmSCKJU2AL5oLThKJq1GRUVTmWOuJOb3erMPzvw1kL0brUjr0icDQpENu77OibwMf6ia1O8PxmpD1w/640?wx_fmt=gif)

如上图：**监听`form`标签，在`input`框获得焦点时，触发断点调试**

### 3. 黑盒脚本：Blackbox Script

剔除多余脚本断点。

例如第三方（`Javascript`框架和库，广告等的堆栈跟踪）。

为避免这种情况并集中精力处理核心代码，在`Sources`或网络选项卡中打开文件，右键单击并选择`Blackbox Script`  

![](https://mmbiz.qpic.cn/mmbiz_gif/icnrNBicEhkVXqmSCKJU2AL5oLThKJq1GRPBmj4ZZgX55SpHsfuMoKJPBudiaRfqkPhCqpdFcPoXCiaHAKDeOPKmnw/640?wx_fmt=gif)。

### 4. 事件监听器：Event Listener Breakpoints

1.  点击`Sources`面板
    
2.  展开`Event Listener Breakpoints`
    
3.  选择监听事件类别，触发事件启用断点
    

![](https://mmbiz.qpic.cn/mmbiz_gif/icnrNBicEhkVXqmSCKJU2AL5oLThKJq1GRk2nBONQU3TlzpOrbPoku7aWgJSPt95FXriaMPbG2icJg8icuTHWOpYmqQ/640?wx_fmt=gif)  
如上图：**监听了键盘输入事件，就会跳到断点处。**

### 5. 本地覆盖：Local overrides

使用我们自己的本地资源覆盖网页所使用的资源。

类似的，使用`DevTools`的工作区设置持久化，将本地的文件夹映射到网络，在`chrome`开发者功能里面对 css 样式的修改，都会直接改动本地文件，页面重新加载，使用的资源也是本地资源，达到持久化的效果。

*   创建一个文件夹以在本地添加替代内容；
    
*   打开`Sources >; Overrides >; Enable local Overrides`，选择本地文件夹  
    
    ![](https://mmbiz.qpic.cn/mmbiz_png/icnrNBicEhkVXqmSCKJU2AL5oLThKJq1GRbQ48HLJ7ZEdj96V19TiaaeeBnhqsJ4lziaO44BR1lSmeGYicQbcMEagUw/640?wx_fmt=png)
*   打开`Elements`，编辑样式，自动生成本地文件。
    
*   返回`Sources`，检查文件，编辑更改。  
    
    ![](https://mmbiz.qpic.cn/mmbiz_gif/icnrNBicEhkVXqmSCKJU2AL5oLThKJq1GRXrdFIsuPYUY6CYBPXG912GT0TmhEMxekpgK418jvIecbc2JLmfO2lQ/640?wx_fmt=gif)

### 6. 扩展：Local overrides 模拟 Mock 数据

> 来自：chrome 开发者工具 - local overrides

对于返回 json 数据的接口，可以利用该功能，简单模拟返回数据。

比如：

*   `api` 为: `http://www.xxx.com/api/v1/list`
    
*   在根目录下，新建文件`www.xxx.com/api/v1/list`，`list` 文件中的内容，与正常接口返回格式相同。
    

![](https://mmbiz.qpic.cn/mmbiz_png/icnrNBicEhkVXqmSCKJU2AL5oLThKJq1GRGr95ZFVKTPDvXpWBUicvBDucATERiaDkx8l7cCxVmWEobN9pM7nia4gYg/640?wx_fmt=png)

对象或者数组类型，从而覆盖掉原接口请求。

4. 控制台内置指令
----------

可以执行常见任务的功能，例如选择`DOM`元素，触发事件，监视事件，在`DOM`中添加和删除元素等。

这像是`Chrome`自身实现的`jquery`加强版。

### 1. $(selector, [startNode])：单选择器

`document.querySelector`的简写  
语法：

```
$('a').href;$('[test-id="logo-img"]').src;$('#movie_player').click();
```

![](https://mmbiz.qpic.cn/mmbiz_gif/icnrNBicEhkVXqmSCKJU2AL5oLThKJq1GRFsItUKkHVuLLu2ctF80VO3briafT1d31TBEEiaGAp0AcjuqZn7G4hEMA/640?wx_fmt=gif)  
控制台还会预先查询对应的标签，十分贴心。  
还可以触发事件，如暂停播放：  
![](https://mmbiz.qpic.cn/mmbiz_gif/icnrNBicEhkVXqmSCKJU2AL5oLThKJq1GRPjaxHDvtscDWhuDCbReUNv76lfgypyfY77NrvqrDU3BhWWUxcllXaQ/640?wx_fmt=gif)

此函数还支持第二个参数 startNode，该参数指定从中搜索元素的 “元素” 或 Node。此参数的默认值为 document

### 2. $$（选择器，[startNode]）：全选择器

`document.querySelectorAll`的简写，返回一个数组标签元素  
语法：

```
$$('.button')
```

![](https://mmbiz.qpic.cn/mmbiz_gif/icnrNBicEhkVXqmSCKJU2AL5oLThKJq1GRh8b74JIlgyqxBEibuWpLb1I4V21Tl1V0KWzMUjlZ41NeTUaL9qLeDicw/640?wx_fmt=gif)  
可以用过循环实现切换全选  
![](https://mmbiz.qpic.cn/mmbiz_gif/icnrNBicEhkVXqmSCKJU2AL5oLThKJq1GRWfpQRqXgQyBiceQicLMqgkc05dr25LVOiayWqJsYJiaPwcT3NgslANOiaaQ/640?wx_fmt=gif)  
或者打印属性![](https://mmbiz.qpic.cn/mmbiz_png/icnrNBicEhkVXqmSCKJU2AL5oLThKJq1GR1Jozcibn5c2uqS0z2l6Kyf8Nf4nuc4hibMtbBvbYW0PtvicmcM3FBrJ6Q/640?wx_fmt=png)  
此函数还支持第二个参数 startNode，该参数指定从中搜索元素的 “元素” 或 Node。此参数的默认值为 document  
用法：

```
var images = $$('img', document.querySelector('.devsite-header-background'));   for (each in images) {       console.log(images[each].src);}
```

![](https://mmbiz.qpic.cn/mmbiz_png/icnrNBicEhkVXqmSCKJU2AL5oLThKJq1GRcLM6WaOTdP5oicaBlaDhRic3ZD0TiczTFMMTh6KzX6icTU3NFJjuf0AD7g/640?wx_fmt=png)

### 3. $x(path, [startNode])：xpath 选择器

`$x(path)`返回与给定`xpath`表达式匹配的 DOM 元素数组。

例如，以下代码返回`<p>`页面上的所有元素：

```
$x("//p")
```

![](https://mmbiz.qpic.cn/mmbiz_png/icnrNBicEhkVXqmSCKJU2AL5oLThKJq1GRZjAic8uN3qRfxac2VWRu3g0ap6SpgGK6YaOiavynuwe7PXd1GGBZIDdA/640?wx_fmt=png)  
以下代码返回`<p>`包含`<a>`元素的所有元素：

```
$x("//p[a]")
```

![](https://mmbiz.qpic.cn/mmbiz_png/icnrNBicEhkVXqmSCKJU2AL5oLThKJq1GRts0Mr1ibKibFficNQc60jKCxJZ4G3B6pibSsnicPXVSz7Ygq1iavLuy5UHpw/640?wx_fmt=png)

**`xpath`多用于爬虫抓取，前端的同学可能不熟悉。**

### 4. getEventListeners（object）：获取指定对象的绑定事件

`getEventListeners(object)`返回在指定对象上注册的事件侦听器。返回值是一个对象，其中包含每个已注册事件类型（例如，`click`或`keydown`）的数组。每个数组的成员是描述为每种类型注册的侦听器的对象。  
用法:

```
getEventListeners(document);
```

![](https://mmbiz.qpic.cn/mmbiz_png/icnrNBicEhkVXqmSCKJU2AL5oLThKJq1GRTwQa1b2457JNLQiclRRrDqubdBxicP4ROuKkPKoXibxLT5w1KjYcgYSJg/640?wx_fmt=png)  
相对于到监听面板里查事件，这个`API`便捷多了。

5. 花式 console
-------------

![](https://mmbiz.qpic.cn/mmbiz_png/icnrNBicEhkVXqmSCKJU2AL5oLThKJq1GRHwsspQKaVQlHUnnanAcA4ib4RQEoTNHAY9Mv5Hqr0e5I2cEp69E7N7g/640?wx_fmt=png)  
除了不同等级的`warn`和`error`打印外  
![](https://mmbiz.qpic.cn/mmbiz_png/icnrNBicEhkVXqmSCKJU2AL5oLThKJq1GREYlmIby05icY4DP7UfF0bBkkL5217jMPq4ALWWMic543hBXib885q3sZw/640?wx_fmt=png)  
还有其它非常实用的打印。

### 1. 变量打印：%s、%o、%d、和 %c

```
const text = "文本1"console.log(`打印${text}`)
```

除了标准的`ES6`语法，实际上还支持四种字符串输出。  
分别是：

```
console.log("打印 %s", text)
```

*   `%s`：字符串
    
*   `%o`：对象
    
*   `%d`：数字或小数
    

还有比较特殊的`%c`，可用于改写输出样式。

```
console.log('%c 文本1', 'font-size:50px; background: ; text-shadow: 10px 10px 10px blue')
```

![](https://mmbiz.qpic.cn/mmbiz_png/icnrNBicEhkVXqmSCKJU2AL5oLThKJq1GRwiaLZGM1varquW2nia3aVmWVaHUPTFX23wOic1OdpJ2aXI9ro59KHcxUg/640?wx_fmt=png)  
当然，你也可以结合其它一起用 (注意占位的顺序)。

```
const text = "文本1"console.log('%c %s', 'font-size:50px; background: ; text-shadow: 10px 10px 10px blue', text)
```

![](https://mmbiz.qpic.cn/mmbiz_png/icnrNBicEhkVXqmSCKJU2AL5oLThKJq1GRGZsN69Y87U4dzcnVf0L95zwEZuMDXIMibAJdYQJBLxawSljbJ7hhxPw/640?wx_fmt=png)

你还可以这么玩：

```
console.log('%c Auth ',             'color: white; background-color: #2274A5',             'Login page rendered');console.log('%c GraphQL ',             'color: white; background-color: #95B46A',             'Get user details');console.log('%c Error ',             'color: white; background-color: #D33F49',             'Error getting user details');
```

![](https://mmbiz.qpic.cn/mmbiz_png/icnrNBicEhkVXqmSCKJU2AL5oLThKJq1GRReNwhbl6BKZA8oSOicBeyOibWDLYEgAcuPKAXpmJVvCNiaibIoc82bzKJw/640?wx_fmt=png)

### 2. 打印对象的小技巧

当我们需要打印多个对象时，经常一个个输出。且看不到对象名称，不利于阅读：

![](https://mmbiz.qpic.cn/mmbiz_png/icnrNBicEhkVXqmSCKJU2AL5oLThKJq1GRgd8bYIC6ibfXoicCSzeBlNLwU6ZuNX4ibOic2x9TMxXg5l5HRRuF29XZ8w/640?wx_fmt=png)

以前我的做法是这么打印：

```
console.log('hello', hello);console.log('world', world);
```

这显然有点笨拙繁琐。其实，输出也支持对象解构：

```
console.log({hello, world});
```

![](https://mmbiz.qpic.cn/mmbiz_gif/icnrNBicEhkVXqmSCKJU2AL5oLThKJq1GRkRcr061klYFJvjW2Siau1lQibqGXnAC5UrErzsTHENsSpsaVmm3xNvJw/640?wx_fmt=gif)

### 3. 布尔断言打印：console.assert()

当你需要在特定条件判断时打印日志，这将非常有用。

*   如果断言为 false，则将一个错误消息写入控制台。
    
*   如果断言是 true，没有任何反应。
    

语法

```
console.assert（assertion，obj）
```

用法

```
const value = 1001console.assert(value===1000,"value is not 1000")
```

![](https://mmbiz.qpic.cn/mmbiz_png/icnrNBicEhkVXqmSCKJU2AL5oLThKJq1GRwUa2EGAyaAC8BR8gmNibaRnwanjnqgO7KD1Hq5aABSaRFmmNbKK8gmA/640?wx_fmt=png)

### 4. 给 console 编组：console.group()

当你需要将详细信息分组或嵌套在一起以便能够轻松阅读日志时，可以使用此功能。

```
console.group('用户列表');console.log('name: 张三');console.log('job: 🐶前端');// 内层console.group('地址');console.log('Street: 123 街');console.log('City: 北京');console.log('State: 在职');console.groupEnd(); // 结束内层console.groupEnd(); // 结束外层
```

![](https://mmbiz.qpic.cn/mmbiz_png/icnrNBicEhkVXqmSCKJU2AL5oLThKJq1GRP2dyDMltD8uaIIhp7Q5VER29Dh3bYr0e5NVdIjtJhUczDTe39s3Zzg/640?wx_fmt=png)

### 5. 测试执行效率：console.time()

没有`Performance API` 精准，但胜在使用简便。

```
let i = 0;console.time("While loop");while (i < 1000000) {  i++;}console.timeEnd("While loop");console.time("For loop");for (i = 0; i < 1000000; i++) {  // For Loop}console.timeEnd("For loop");
```

![](https://mmbiz.qpic.cn/mmbiz_png/icnrNBicEhkVXqmSCKJU2AL5oLThKJq1GREVibAx42GWp05iavWnb5oAwudLHXVzTibxmXk3DpLiazrGicSJPOGvOQoTw/640?wx_fmt=png)

### 6. 输出表格：console.table()

这个适用于打印数组对象。。。

```
let languages = [    { name: "JavaScript", fileExtension: ".js" },    { name: "TypeScript", fileExtension: ".ts" },    { name: "CoffeeScript", fileExtension: ".coffee" }];console.table(languages);
```

![](https://mmbiz.qpic.cn/mmbiz_png/icnrNBicEhkVXqmSCKJU2AL5oLThKJq1GR4Hg962oG9U9uXTPPnlUf2BWZ40IbxUP1ribaERu9anGVLgxLzzxW3Uw/640?wx_fmt=png)

### 7. 打印 DOM 对象节点：console.dir()

打印出该对象的所有属性和属性值.  
`console.dir()`和`console.log()`的作用区别并不明显。若用于打印字符串，则输出一摸一样。

```
console.log（"Why，hello!"）；console.dir（"Why，hello!"）;
```

![](https://mmbiz.qpic.cn/mmbiz_png/icnrNBicEhkVXqmSCKJU2AL5oLThKJq1GRHT8iaylxZSb10ohbRzm2giabHJwjgfQM2VF1BRD1B19micQTBRGUfWhyA/640?wx_fmt=png)  
在输出对象时也仅是显示不同（`log`识别为字符串输出，`dir`直接打印对象。）。  
![](https://mmbiz.qpic.cn/mmbiz_png/icnrNBicEhkVXqmSCKJU2AL5oLThKJq1GRPq4Xv4quEFXeruIVUL233NFM3wKbAQnAEthzAFIEOxjKudiaQvfoQ6g/640?wx_fmt=png)

唯一显著区别在于打印`dom`对象上：

```
console.log(document)console.dir(document)
```

![](https://mmbiz.qpic.cn/mmbiz_png/icnrNBicEhkVXqmSCKJU2AL5oLThKJq1GRgVFpzFxgPxKb6YTUVOJUXnOpIkXFticUpP7gRT2AB7qicLpxSyp4n7LA/640?wx_fmt=png)  
一个打印出纯标签，另一个则是输出`DOM`树对象。

6. 远程调试 WebView
---------------

使用`Chrome`开发者工具在原生`Android`应用中调试`WebView`。

1.  配置`WebViews`进行调试。
    
    在 `WebView`类上调用静态方法`setWebContentsDebuggingEnabled`。
    
    ```
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {    WebView.setWebContentsDebuggingEnabled(true);}
    ```
    
2.  手机打开`usb`调试，插上电脑。
    
3.  在`Chrome`地址栏输入：`Chrome://inspect`
    

![](https://mmbiz.qpic.cn/mmbiz_png/icnrNBicEhkVXqmSCKJU2AL5oLThKJq1GRQdovBojs1UA0jZSBSP0pqy9xL7yS54FH0LsaIyc8UYSSaTEyowfnMA/640?wx_fmt=png)  
   正常的话在`App`中打开`WebView`时，`chrome`中会监听到并显示你的页面。

4.  点击页面下的`inspect`，就可以实时看到手机上`WebView`页面的显示状态了。（第一次使用可能会白屏，这是因为需要去`https://chrome-devtools-frontend.appspot.com`那边下载文件）  
    
    ![](https://mmbiz.qpic.cn/mmbiz_png/icnrNBicEhkVXqmSCKJU2AL5oLThKJq1GRxG1AOMjKDBd6eNwY2ibqUsFzuVJvCjichnGawzfKsYZIe2EnQFvXia2sg/640?wx_fmt=png)

除了`inspect`标签，还有 **`Focus tab`**:

*   它会自动触发`Android`设备上的相同操作
    

**其他应用里的`WebView`也可以，例如这是某个应用里的游戏，用的也是网页：**

![](https://mmbiz.qpic.cn/mmbiz_png/icnrNBicEhkVXqmSCKJU2AL5oLThKJq1GRAXWKnkmUQZsSfM6vYQBibYmbyDvXNrCqEuCKD0ichicsyDmLKwHEOeib9w/640?wx_fmt=png)

参考资料
----

> 1.  Practical Chrome Devtools — Common commands & Debugging
>     
> 2.  Mobile web specialist — Remote Debugging
>     
> 3.  Console Utilities API Reference
>     
> 4.  Console API Reference
>