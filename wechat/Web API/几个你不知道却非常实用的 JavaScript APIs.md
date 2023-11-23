> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/m0Ey3wu1-FQEuxz6IoZebw)

```
大厂技术  高级前端  Node进阶

点击上方 程序员成长指北，关注公众号

回复1，加入高级Node交流群

```

前言
--

在本文中，将介绍一些鲜为人知但却非常有用的 API，如：

*   `Page Visibility API`
    
*   `Web Share API`
    
*   `Broadcast Channel API`
    
*   `Internationalization API`
    

我们将一起看看它们是什么，我们应该在哪里使用它们，以及如何使用它们。

Page Visibility API
-------------------

这是一个鲜为人知的 web API，在 JS 现状调查 [1] 中，它的认知度排名倒数第四。它可以让你知道用户何时离开了页面。准确地说，只要页面的可见性状态发生变化，无论是用户最小化、最大化窗口还是切换标签页，该 API 都会触发一个事件。

在过去，你不得不使用一些噱头来了解用户是否切换了标签页或最小化了窗口。最流行的方式是使用`blur`和`focus`浏览器事件。使用这些事件会导致类似下面情况的发生：

```
window.addEventListener("focus", function () {
    // User is back on the page
    // Do Something
});

window.addEventListener("blur", function () {
    // User left the page
    // Do Something
});


```

前面的代码可以工作，但是不符合预期。因为`blur`事件是在页面失去焦点时触发的，所以当用户点击搜索栏、`alert`对话框、控制台或窗口边框时，它就会被触发。所以，`blur`和`focus`只告诉我们页面是否被激活，但不告诉我们页面的内容是否被隐藏或显示。

### 什么时候使用

一般来说，我们想要使用`Page Visibility API`，是希望用来停止不必要的程序。比如说当用户没有看到页面时，或者执行后台操作时。具体的场景可以是：

*   当用户离开页面时暂停视频、图像旋转或动画；
    
*   如果页面显示来自 API 的实时数据，在用户离开时暂时停止实时显示的行为；
    
*   发送用户分析报告。
    

### 如何使用

`Page Visibility API`带来了两个属性和一个事件，用于访问页面可见性状态：

*   `document.hidden`：该属性是全局可见并且只读。尽量避免使用该属性，因为现在已经被废弃了。当访问该属性时，如果页面是隐藏状态则返回`true`，如果页面是可见状态则返回`false`。
    
*   `document.visibilityState`：该属性是`document.hidden`更新后的版本。当访问该属性时，会根据页面的可见性状态返回四个可能的值：
    

*   `visible`：该页面是可见的，或者准确地说，它没有被最小化，也不在另一个标签页。
    
*   `hidden`：该页面不可见，它是最小化的，或者在另一个标签页。
    
*   `prerender`：这是一个可见页面在预渲染时的初始状态。一个页面的可见性状态可以从`prerender`开始，然后改变到另一个状态，但它不能从另一个状态改变到`prerender`。
    
*   `unloaded`：该页面正在从内存中卸载。
    

*   `visibilitychange`：这是一个由`document`对象提供的事件，当页面的`visibilityState`发生变化时被触发。
    

```
document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
        // page is visible
    } else {
        // page is hidden
    }
});


```

为了了解如何使用`Page Visibility API`，让我们用该特性来实现当用户离开页面时，暂停视频以及停止从 API 获取资源。首先，我将使用`vite.js`，它是一个快速启动新项目的神奇工具：

```
npm create vite@latest unknown-web-apis


```

当被要求选择一个框架时，选择`vanilla`来创建一个`vanilla`javascript 项目。完成之后，前往新文件夹，安装必要的`npm`包并启动开发服务器：

```
cd unknown-web-apis
npm install
npm run dev


```

打开 localhost:3000/[2]，你将看到你的 Vite 项目启动和运行！

![](https://mmbiz.qpic.cn/mmbiz_png/VyEdgX6S7iaboHV28La5PgSkRWtUbGYd96jDJj620IuEj9qrcLvZDNHHMVrgITYicqbCN9a8ysmRwTQf2hdxFUug/640?wx_fmt=png)vite-new-project.png

首先，我们直接跳转到`/main.js`文件并删除所有样板代码。其次，打开`/index.html`，在`id`为`#app`的`div`标签内部添加一个`video`元素，上面可以添加你想添加的任意视频文件。这里我使用了一只正在跳舞的耀西。

```
<div id="app">
    <video controls id="video">
        <source src="./yoshi.mp4" />
    </video>
</div>


```

![](https://mmbiz.qpic.cn/mmbiz_png/VyEdgX6S7iaboHV28La5PgSkRWtUbGYd9K0psz7I2oWeC3tmtm9Odia3x6pKSevoLMeJAZrv563piaWDicKyrBjiaHQ/640?wx_fmt=png)dancing-Yoshi.png

回到`/main.js`，我们将向`document`对象添加一个事件监听器，用来监听`visibilitychange`事件。然后当页面显示或隐藏时，我们可以访问`document.visibilityState`属性的值。

```
document.addEventListener("visibilitychange", () => {
    console.log(document.visibilityState);
});


```

你可以前往页面的控制台，当最小化窗口或者切换到另一个标签页时，查看页面可见性状态。现在，在事件监听器内部，我们可以检查`document.visibilityState`属性，当属性值为`hidden`时暂停视频，当属性值为`visible`时播放视频。当然，我们首先要使用`document.querySelector()`选择`video`元素。

```
const video = document.querySelector("#video");

document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
        video.play();
    } else {
        video.pause();
    }
});


```

现在，只要用户离开页面，视频就会停止。另一个使用`Page Visibility API`的场景是，当用户没有查看页面时，停止获取不必要的资源。为了看效果，我们将编写一个函数不间断地从 quotable.io[3] API 获取随机引用，并当页面隐藏时暂停该行为。首先，我们将在`/index.html`创建一个新的`div`标签来存储引用。

```
<div id="app">
    <video controls id="video">
        <source src="./yoshi.mp4" />
    </video>
    <div id="quote"></div>
</div>


```

回到`/main.js`，我们使用 Fetch API[4] 发起对`quotable.io`端点 https://api.quotable.io/random[5] 的调用，然后将结果插入到`quote`div 中。

```
const quote = document.querySelector('#quote');

const getQuote = async () => {
  try {
    const response = await fetch('<https://api.quotable.io/random>');
    const { content, author, dateAdded } = await response.json();
    const parsedQuote = ` <q>${content}</q> <br> <p>- ${author}</p><br> <p>Added on ${dateAdded}</p>`;
    quote.innerHTML = parsedQuote;
  } catch (error) {
    console.error(error);
  }
};


```

让我们简单地解释一下此处发生了什么。首先我们从 DOM 中选中了`quote`元素。然后声明`getQuote`函数，该函数是一个异步函数，允许我们使用`await`关键字进行等待，直到从 API 中获取到数据。获取的数据是 JSON 格式的，因此我们再次使用`await`关键字来等待，直到数据被解析为 JavaScript 对象。

`quotable.io`的 API 为我们提供了`content`、`author`和`dateAdded`等属性，我们把这些属性注入并显示在`quote`div 中。这样做是没问题的，但是引用只会获取一次，因此我们可以使用`setInterval()`每 10 秒来调用一次函数。

```
const quote = document.querySelector('#quote');

const getQuote = async () => {
  try {
    const response = await fetch('<https://api.quotable.io/random>');
    const { content, author, dateAdded } = await response.json();
    const parsedQuote = ` <q>${content}</q> <br> <p>- ${author}</p><br> <p>Added on ${dateAdded}</p>`;
    quote.innerHTML = parsedQuote;
  } catch (error) {
    console.error(error);
  }
};

getQuote();

setInterval(getQuote, 10000);


```

如果用户最小化窗口或者切换标签页，该页面仍然会获取引用，创建没有必要的网络加载。为了解决这个问题，在获取引用之前我们可以检查当前页面是否可见。

```
const getQuote = async () => {
  if (document.visibilityState === 'visible') {
    try {
      const response = await fetch('<https://api.quotable.io/random>');
      const { content, author, dateAdded } = await response.json();
      const parsedQuote = `
          <q>${content}</q> <br> 
          <p>- ${author}</p><br> 
          <p>Added on ${dateAdded}</p>`;
      quote.innerHTML = parsedQuote;
    } catch (error) {
      console.error(error);
    }
  }
};

getQuote();

setInterval(getQuote, 10000);


```

现在，我们只会在页面对用户可见的情况下获取引用。

### 兼容性

广泛支持 [6]

Web Share API
-------------

### 这是什么

`Web Share API`也是最不为人所知的 API 之一，但却非常有用。它可以让你访问操作系统的原生分享机制，这对移动端用户特别有用。有了这个 API，你可以分享文本、链接和文件，而不需要创建你自己的分享机制或使用第三方的分享机制。

### 什么时候使用

用途已经不言自明。你可以用它将你的页面内容分享到社交媒体上，或将其复制到用户的剪贴板上。

### 如何使用

`Web Share API`赋予我们两个接口来访问用户的分享系统：

1.  `navigator.canShare()`：接受你想分享的数据作为参数，并根据其是否可分享，来返回一个布尔参数。
    
2.  `navigator.share()`：返回一个`promise`，如果分享成功的话，该`promise`将会`resolve`。该接口会调用原生分享机制，并接收你想分享的数据作为参数。注意，它只能在用户按下链接或按钮时调用。也就是说，它需要 transient activation[7]（瞬时激活）。分享数据是一个可以具有以下属性的对象：
    

*   `url`：要分享的链接
    
*   `text`：要分享的文本
    
*   `title`：要分享的标题
    
*   `files`：表示要分享的`File`对象数组
    

为了了解如何使用该 API，我们将回收先前的用例，做一个选项使用`Web Sharing API`来分享我们的引用。首先，我们必须在`/index.html`新增一个分享按钮：

```
<div id="app">
    <video controls id="video">
        <source src="./yoshi.mp4" />
    </video>
    <div id="quote"></div>
    <button type="button" id="share-button">Share Quote</button>
</div>


```

前往`/main.js`从 DOM 中选择分享按钮。然后，创建`async`函数来分享想要分享的数据。

```
const shareButton = document.querySelector("#share-button");

const shareQuote = async (shareData) => {
    try {
        await navigator.share(shareData);
    } catch (error) {
        console.error(error);
    }
};


```

现在，我们可以为`shareButton`元素添加`click`事件监听器，以此来调用`shareQuote`函数。`shareData.text`的值会是`quote.textContent`属性，`shareData.url`的值会是页面的 URL，也就是`location.href`属性。

```
const shareButton = document.querySelector("#share-button");

const shareQuote = async (shareData) => {
    try {
        await navigator.share(shareData);
    } catch (error) {
        console.error(error);
    }
};

shareButton.addEventListener("click", () => {
    let shareData = {
        title: "A Beautiful Quote",
        text: quote.textContent,
        url: location.href,
    };

    shareQuote(shareData);
});


```

现在你可以通过你的原生操作系统与任何人分享你的引用。然而，需要注意的是，`Web Share API`只有在上下文安全的情况下才会起作用，也就是说，页面是通过`https://`或`wss://` URLs 提供的。

### 兼容性

基本不支持 [8]

Broadcast Channel API
---------------------

### 这是什么

我想谈论的另一个 API 是`Broadcast Channel API` 。它允许浏览器上下文互相发送和接收基本数据。浏览器上下文是指标签页、窗口、`iframe`等元素，或任何可以显示页面的地方。出于安全考量，浏览器上下文之间的通信是不被允许的，除非它们是同源的并使用`Broadcast Channel API`。对于两个同源的浏览器上下文，它们的 URL 必须有相同的协议（如`http/https`）、域（如`example.com`）和端口（如`:8080`）。

### 什么时候使用

`Broadcast Channel API`通常用于在不同的标签页和窗口之间保持页面状态同步，以提高用户体验或出于安全原因考虑。它也可以用来知道一个服务在另一个标签页或窗口中何时完成。使用场景有：

*   在所有标签页上登录或注销用户。
    
*   检测资源何时上传，并在所有页面中展示它。
    
*   指示`service worker`做一些幕后工作。
    

### 如何使用

`Broadcast Channel API`涉及一个`BroadcastChannel`对象，该对象可用于向其他上下文发送信息。构造函数只有一个参数：作为标识符的字符串，该标识符从其他上下文连接到频道。

```
const broadcast = new BroadcastChannel("new_channel");


```

一旦我们在两个上下文中创建了具有相同标识符的`BroadcastChannel`对象，这个新的`BroadcastChannel`对象将有两个可用的方法来开始进行通信：

*   `BroadcastChannel.postMessage()`：在所有连接的上下文中发送消息。它接受任意类型的对象作为其唯一的参数，因此你可以发送各种各样的数据。
    
    ```
    broadcast.postMessage("Example message");
    
    
    ```
    
*   `BroadcastChannel.close()`：关闭通道，向浏览器表明它不会再收到任何信息，这样它就可以把这些信息收集到垃圾回收中。
    

为了接受信息，`BroadcastChannel`有一个`message`事件，我们可以使用`addEventListener`或其`onmessage`属性来监听。`message`事件有一个`data`属性，包含发送的数据和其他属性，以识别发送消息的上下文，如`origin`、`lastEventId`、`source`和`ports`。

```
broadcast.onmessage = ({data, origin}) => {
    console.log(`${origin} says ${data}`);
};


```

让我们看看如何通过使用先前的例子来使用`Broadcast Channel API`。我们的目标是制作另一个具有同源的浏览器上下文，并在两个上下文中展示相同的引用。为了做到这一点，我们将创建一个名为`new-origin`的新文件夹，里面有一个新的`/index.html`和`/main.js`文件。

`/new-origin/index.html`将是一个新的 HTML 模板，里面有一个`#quote`div：

```
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <link rel="icon" type="image/svg+xml" href="../favicon.svg" />
        <meta  />
        <title>Vite App</title>
    </head>
    <body>
        <div id="quote"></div>
        <script type="module" src="./main.js"></script>
    </body>
</html>


```

在`/new-origin/main.js`文件中，我们将创建一个新的`broadcast channel`，并从 DOM 中选择`#quote`元素：

```
const broadcast = new BroadcastChannel("quote_channel");
const quote = document.querySelector("#quote");


```

在先前的`/main.js`文件中，我们将创建新的`BroadcastChannel`对象，并连接到`"quote_channel"`。我们还将修改`getQuote`函数，将引用作为消息发送到其他上下文。

```
const broadcast = new BroadcastChannel("quote_channel");

//...

const getQuote = async () => {
 try {
  const response = await fetch("<https://api.quotable.io/random>");
  const {content, author, dateAdded} = await response.json();
  const parsedQuote = ` <q>${content}</q> <br> <p>- ${author}</p><br> <p>Added on ${dateAdded}</p>`;
  quote.innerHTML = parsedQuote;
  broadcast.postMessage(parsedQuote);
 } catch (error) {
  console.error(error);
 }
};


```

回到`/new-origin/main.js`文件，我们将监听`message`事件并在每次发送新的引用时改变`quote.innerHTML`。

```
const broadcast = new BroadcastChannel("quote_channel");
const quote = document.querySelector("#quote");

broadcast.onmessage = ({data}) => {
    quote.innerHTML = data;
};


```

现在你可以看到`http://localhost:3000/new-origin/`中的引用是如何变化为`http://localhost:3000`中的引用的。你也可以注意到，当`http://localhost:3000`标签被隐藏时，引用并没有改变，因为它只在其页面可见性状态为可见时才会去获取引用。

### 兼容性

广泛支持 [9]

Internationalization API
------------------------

### 这是什么

在开发一个网页或应用程序时，需要将其内容翻译成其他语言以覆盖更广泛的受众是非常常见的。然而，仅仅将你的网页文本翻译成你所需要的任何语言，并不足以使你的内容对讲该语言的人可用，因为像日期、数字、单位等东西在不同国家是不同的，可能会给你的用户带来困惑。

我们假设你想在你的网页上展示日期 "2022 年 11 月 8 日"，就像 "11/8/22"。根据读者所在的国家，这些数据可以用三种不同的方式来阅读：

*   "11/8/2022" 或美国用户的 MM/DD/YY。
    
*   "8/11/2022" 或欧洲和拉美用户的 DD/MM/YY。
    
*   "2011/8/22" 或日本、中国和加拿大用户的 YY/MM/DD。
    

这就是`Internationalization API`（或`I18n API`）来解决不同语言和地区的格式问题的地方。`I18n API`是一个了不起的工具，有多种用途，但我们不会深入研究，以免使本文过于复杂。

### 如何使用

`I18n API`使用`locale`标识符来起作用。`locale`标识符是一个字符串，用来表示用户的语言、城市、地区、方言以及其他偏好。准确的说，`locale`标识符是一个字符串，由连字符分隔的子标签组成。子标签代表了用户偏好，比如语言、国家、地区或文字，并以以下方式格式化：

1.  `"zh"`：中文（语言）；
    
2.  `"zh-Hant"`：用繁体字（文字）书写的中文（语言）；
    
3.  `"zh-Hant-TW"`：在台湾（地区）使用的繁体字（文字）书写的中文（语言）。
    

还有更多的子标签来解决更多用户的偏好（如果你想了解更多，你可以查看 RFC[10] 对语言标签的定义），但简而言之，`I18n API`使用这些`locale`标识符来知道如何格式化所有语言敏感的数据。

更确切地说，`I18n API`提供了一个`Intl`对象，它带来了一堆专门的构造函数来处理对语言敏感的数据。在我看来，一些对国际化最有用的`Intl`构造函数是：

*   `Intl.DateTimeFormat()`：用于格式化日期和时间。
    
*   `Intl.DisplayNames()`：用于格式化语言、地区和文字显示名字。
    
*   `Intl.Locale()`：用于构建和操作`locale`标识符标签。
    
*   `Intl.NumberFormat()`：用于格式化数字。
    
*   `Intl.RelativeTimeFormat()`：用于格式化相对时间描述。
    

在我们的例子中，我们将重点关注`Intl.DateTimeFormat()`构造函数，以根据用户的区域设置来格式化引用的`dateAdded`属性。`Intl.DateTimeFormat()`构造函数接收两个参数：定义日期格式约定的`locale`字符串和用于自定义日期格式的`options`对象。

创建的`Intl.DateTimeFormat()`对象有一个`format()`方法，它接收两个参数：我们要格式化的`Date`对象和用于自定义如何显示格式化日期的`options`对象。

```
const logDate = (locale) => {
    const newDate = new Date("2022-10-24"); // YY/MM/DD
    const dateTime = new Intl.DateTimeFormat(locale, {timeZone: "UTC"});
    const formatedDate = dateTime.format(newDate);
    console.log(formatedDate);
};

logDate("en-US"); // 10/24/2022
logDate("de-DE"); // 24.10.2022
logDate("zh-TW"); // 2022/10/24


```

注意：在`Intl.DateTimeFormat`构造函数的`options`参数中，我们将`timeZone`属性设置为`"UTC"`，这样日期就不会被格式化为用户的当地时间。在我的例子中，没有`timeZone`的选项，日期被解析为 "10/23/2022"。

正如你所看到的，`dateTime.format()`根据`locale`的日期格式约定改变日期。我们可以使用`navigator.language`全局属性在引用的日期上实现这一行为，该全局属性具有用户的首选`locale`设置。为此，我们将创建一个新的函数，接收一个日期字符串（YYYY-MM-DD 格式），并根据用户的`locale`返回格式化的日期。

```
const formatDate = (dateString) => {
    const date = new Date(dateString);
    const locale = navigator.language;
    const dateTimeFormat = new Intl.DateTimeFormat(locale, {timeZone: "UTC"});

    return dateTimeFormat.format(date);

};


```

我们可以在`getQuote()`函数中添加这个函数来解析`dateAdded`日期。

```
const getQuote = async () => {
    if (document.visibilityState === "visible") {
        try {
            const response = await fetch("<https://api.quotable.io/random>");
            const {content, author, dateAdded} = await response.json();
            const parsedQuote = `
            <q>${content}</q> <br> 
            <p>- ${author}</p><br> 
            <p>Added on ${formatDate(dateAdded)}</p>`;
            quote.innerHTML = parsedQuote;
            broadcast.postMessage(parsedQuote);
        } catch (error) {
            console.error(error);
        }
    }
};


```

有了这个，我们的引用就被本地化为用户的首选语言了！在我的例子中，我的`navigator.language`值是`"en"`，所以我的日期被格式化为 MM/DD/YY。

### 兼容性

广泛支持 [11]

总结
--

读完这篇文章后，你现在可以灵活地了解这些 API 的存在以及如何使用它们。尽管它们在 JS 现状调查中的认知度排名最后，但它们非常有用，知道如何使用它们肯定会提高你的开发经验。这些强大的 API 并不为人所知，这意味着还有一些你我都不知道的有用的 API，所以现在是探索并找到那个可以简化你的代码，并为你节省大量开发时间的 API 的最佳时机。

以上就是本文的所有内容，如有对你有所帮助，欢迎点赞收藏转发~

### 参考资料

[1]

JS 现状调查: https://2021.stateofjs.com/en-US/features/

[2]

localhost:3000/: http://localhost:3000/

[3]

quotable.io: https://github.com/lukePeavey/quotable

[4]

Fetch API: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API

[5]

https://api.quotable.io/random: https://api.quotable.io/random

[6]

广泛支持: https://caniuse.com/pagevisibility

[7]

transient activation: https://developer.mozilla.org/en-US/docs/Glossary/Transient_activation

[8]

基本不支持: https://caniuse.com/web-share

[9]

广泛支持: https://caniuse.com/mdn-api_broadcastchannel_name

[10]

RFC: https://datatracker.ietf.org/doc/html/rfc5646

[11]

广泛支持: https://caniuse.com/internationalization

Node 社群  

```
我组建了一个氛围特别好的 Node.js 社群，里面有很多 Node.js小伙伴，如果你对Node.js学习感兴趣的话（后续有计划也可以），我们可以一起进行Node.js相关的交流、学习、共建。下方加 考拉 好友回复「Node」即可。

   “分享、点赞、在看” 支持一波👍

```