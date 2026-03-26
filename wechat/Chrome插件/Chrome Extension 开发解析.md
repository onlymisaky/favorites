> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/6L5evort4dO9XXBGvuVoag)

一、Chrome Extension 简介
=====================

Chrome Extension，本质上是一个由 HTML、CSS、JavaScript 等前端技术开发的程序，就像我们平时开发的前端项目一样，它只是一个有各种资源组成的程序，被安装到浏览器后，能极大地扩展浏览器的功能。Chrome Extension 可以理解为一个独立运行在 Chrome 浏览器下的 APP，能够与打开的网页、Chrome 控制面板、第三方插件等进行通信。比如，它可以实现屏蔽广告（如 Adblock Plus）、帮助开发者进行调试开发（如 React Developers Tools）、自动更换壁纸（如 Momentum）、解决跨域问题（如 Allow CORS）、翻译网页内容等诸多功能。2009 年，Google Chrome Web Store 推出，标志着 Chrome Extension 正式进入开发者社区。此后，随着 Chrome 浏览器用户基数的增加，Chrome Extension 也在不断发展。2010 年开始稳步增长，发布了许多实用的拓展；2013 年，Chrome App 和扩展合并；2014 年，采用 Material Design 风格并增加更多 API；2016 年，Google 宣布推出 Manifest V3 计划；2021 年，Manifest V3 正式发布；2022 年持续发展，到 2024 年 Manifest V2 将会被逐步弃用。使用 Chrome Extension 可以根据个人需求自定义浏览器功能，提高工作效率，改善隐私和安全，同时也为开发者创造了创新和实用的工具。它不仅是技术的体现，还能调整用户使用浏览器的心态，让用户更加舒适、高效地浏览网页。

二、开发基础
======

1. 基本组成
-------

Chrome Extension 主要由以下几个部分组成：

manifest.json：这是扩展的核心配置文件，就像项目的 “说明书” 一样，详细列出了扩展的名称、版本、描述、权限等重要信息。它位于扩展的根目录，是 Chrome 浏览器识别和运行扩展的关键。例如，通过 “manifest_version” 指定清单文件的版本，目前逐渐向 Manifest V3 过渡，到 2024 年 Manifest V2 将被逐步弃用。“name” 定义扩展的名称，方便用户识别；“version” 明确扩展的版本号，便于开发者进行版本管理；“description” 提供扩展的描述，帮助用户了解其功能。此外，“icons” 属性可以设置不同尺寸的图标，适应不同的显示场景，如在扩展管理页面、安装过程以及浏览器工具栏上的显示。“browser_action” 或 “page_action” 配置项可以定义扩展在浏览器工具栏上的表现行为，包括图标、标题和点击图标时弹出的页面等。“permissions” 则用于声明扩展所需的权限，确保扩展能够正常运行并访问必要的资源。总之，manifest.json 是 Chrome Extension 不可或缺的重要组成部分。

background script：可以理解为插件运行在浏览器中的一个后台 “网站” 或脚本，与当前浏览页面无关。它通常包含对扩展很重要的浏览器事件的侦听器，处于休眠状态，直到触发事件才执行相应的逻辑。有效的后台脚本仅在需要时加载，并在空闲时卸载。例如，可以调用全部的 Chrome API，实现跨域请求、网页截屏、弹出 Chrome 通知消息等功能。在 manifest.json 文件中，通过 “background” 配置项来指定后台脚本的相关信息，如 “scripts” 属性可以指定要执行的脚本文件。

content script：是在网页上下文中运行的文件，能够读取浏览器访问的网页的详细信息，对其进行更改，并将信息传递给父级扩展。它可以操作 DOM，但是和页面其他的脚本是隔离的，访问不到其他脚本定义的变量、函数等，相当于运行在单独的沙盒里。在 manifest.json 中，通过 “content_scripts” 属性来配置内容脚本，包括匹配的域名、要执行的脚本文件以及脚本运行的时刻等。

popup：当用户点击插件图标时弹出的页面，包含 HTML、CSS 和 JavaScript 文件。它会在每次点击插件图标时重新载入，可以实现与用户的交互功能。在 manifest.json 中，通过 “browser_action” 或 “page_action” 的 “default_popup” 属性来指定弹出页面的路径。

这些组成部分相互协作，共同构成了功能强大的 Chrome Extension。

2. 开发准备
-------

开发 Chrome Extension 非常简单，仅需 Chrome 浏览器和一个带语法高亮的文本编辑器即可。首先，打开 Chrome 浏览器，在地址栏中输入 “chrome://extensions/”，进入扩展程序管理页面，然后开启开发者模式。这样就可以通过加载已解压的扩展程序来进行本地开发和调试。对于文本编辑器，可以选择 Visual Studio Code、Sublime Text 等，它们提供了丰富的插件和语法高亮功能，方便开发者编写和编辑 Chrome Extension 的代码。在开发过程中，可以利用 Chrome 浏览器提供的开发者工具来调试扩展程序，查看日志输出、检查元素等，提高开发效率。总之，开发 Chrome Extension 所需的工具简单易获取，使得开发者能够快速上手并实现各种创意功能。

三、开发步骤
======

1. 创建 manifest
--------------

manifest.json 文件是 Chrome Extension 的核心配置文件，它定义了插件的基本属性信息和运行路径等。在创建这个文件时，我们需要明确以下几个关键部分：

manifest_version：指定清单文件的版本。目前，逐渐向 Manifest V3 过渡，到 2024 年 Manifest V2 将被逐步弃用。这个版本号的选择会影响到插件能够使用的 API 和功能。name：插件的名称，应简洁明了，方便用户识别。例如，可以根据插件的功能来命名，如 “广告拦截器”、“语法检查助手” 等。

version：插件的版本号，便于开发者进行版本管理。每次对插件进行更新时，应该相应地增加版本号，以便用户了解插件的更新情况。

description：对插件功能的简短描述，帮助用户在安装之前了解插件的用途。描述应该清晰、准确，突出插件的主要特点和优势。

icons：定义一系列图标，用于在不同的场景下显示插件的图标。可以根据需要提供不同尺寸的图标，以适应不同的显示环境。例如，可以提供 16x16、32x32、48x48 等尺寸的图标。

browser_action 或 page_action：配置插件在浏览器工具栏上的表现行为。可以定义图标、标题和点击图标时弹出的页面等。如果插件对在浏览器中加载的所有网页都生效，可以选择 browser_action；如果只针对特定的网页生效，则可以选择 page_action。

permissions：声明插件所需的权限，确保插件能够正常运行并访问必要的资源。例如，如果插件需要访问存储功能，就需要在 permissions 中添加 “storage” 权限。

总之，创建 manifest.json 文件是开发 Chrome Extension 的重要一步，它为插件的运行提供了基本的配置信息和权限声明。

2. 加载插件
-------

加载插件的方法非常简单。首先，在地址栏中输入 “chrome://extensions/”，进入扩展程序管理页面。然后，开启开发者模式，这将允许我们加载未经过 Chrome Web Store 审核的本地插件。接着，点击左上角的 “加载已解压的扩展程序”，并选择插件所在的目录。这样，插件就会被成功载入到 Chrome 浏览器中。

需要注意的是，插件不会热更新，每次修改代码后，需要点击扩展程序管理页面中的刷新按钮，才能载入最新的代码。此外，为了方便使用，可以将插件固定到标签栏里，这样可以快速访问插件的功能。

3. 添加功能
-------

注册 background.js，作为后台脚本初始化事件监听并设置存储初始值。

background.js 是一种后台脚本，它在插件安装或重新加载时被扫描并初始化。在这个脚本中，我们可以添加事件监听器，以响应各种浏览器事件。例如，可以在插件安装完毕后，设置一个初始值为空数组的存储字段，以便后续存储用户的访问历史。

以下是一个示例代码：

```
chrome.runtime.onInstalled.addListener(() => {
    console.log('后台脚本运行成功！')
    chrome.storage.sync.set({ history: [] });
});


```

这段代码在插件安装后，打印一段日志信息，并通过 storage API 设置一个初始值为空数组的存储字段。覆盖默认 popup 界面，展示用户访问历史，包括从 storage 读取历史内容并组装成 html 插入文档。为了展示用户的访问历史，我们需要覆盖默认的 popup 界面。在 manifest.json 文件中，可以通过 “action” 配置项的 “default_popup” 属性来指定弹出页面的路径。例如：

```
{
    "action": {
        "default_popup": "popup.html"
    }
}


```

在 popup.html 文件中，可以使用 HTML、CSS 和 JavaScript 来构建用户界面。以下是一个示例代码：

```
    <!DOCTYPE html>
    <html>
    <head>
        <link rel="stylesheet" href="popup.css">
    </head>
    <body>
        <div id="container">暂无浏览记录～</div>
        <script src="popup.js"></script>
    </body>
    </html>


```

在 popup.js 文件中，可以从 storage 中读取历史内容，并将其组装成 html 插入到文档中。以下是一个示例代码：

```
chrome.storage.sync.get("history", ({ history }) => {
    const contentHTML = history.length === 0? "暂无浏览记录～" : history.map((record) => {
        return `<div class="item-box"><div class="item-box_time">${record.time}</div><a class="item-box_text" href="${record.url}">${record.title}</a></div>`;
    }).join("");
    document.querySelector('#container').innerHTML = contentHTML
});


```

通过内容脚本记录浏览历史，将访问页面的标题、url 和时间存储到 storage。为了记录用户的浏览历史，我们需要在内容脚本中编写记录的逻辑。在 manifest.json 文件中，可以通过 “content_scripts” 配置项来指定要注入到网页中的脚本。例如：

```
{
    "content_scripts": [{
        "matches": ["*://*/*"],
        "js": ["content/index.js"]
    }]
}


```

在 content/index.js 文件中，可以获取访问的页面的标题、url 和时间，并将其存储到 storage 中。以下是一个示例代码：

```
chrome.storage.sync.get("history", ({ history }) => {
    console.log("history--->", history);
    history.unshift({
        title: document.title,
        url: location.href,
        time: new Date().toLocaleString(),
    });
    chrome.storage.sync.set({ history });
});


```

### 4. 添加自定义 icon

为了让插件更加个性化，可以使用熊猫图片作为插件的 icon。首先，在插件目录中新增一个 assets 目录，并将熊猫图片命名为 icon.png 放入该目录。然后，在 manifest.json 文件中，通过 “action” 配置项的 “default_icon” 属性来指定 icon 的路径。例如：

```
{
    "action": {
        "default_icon": {
            "16": "/assets/icon.png"
        }
    }
}


```

这样，插件就会使用熊猫图片作为 icon 显示在浏览器工具栏上。

四、开发注意事项
--------

### 1.chrome 传递消息

chrome 传递消息的 API 在不同版本有变化，需进行兼容处理。在开发 Chrome Extension 的过程中，需要注意 chrome 传递消息的 API 在不同版本有变化。为了确保插件在不同版本的 Chrome 浏览器上都能正常运行，可以进行兼容处理。以下是一段兼容处理的代码示例：

```
function compatibleChrome() {
    if (!chrome.runtime) {
        // Chrome 20 - 21
        chrome.runtime = chrome.extension;
    } else if (!chrome.runtime.onMessage) {
        // Chrome 22 - 25
        chrome.runtime.onMessage = chrome.extension.onMessage;
        chrome.runtime.sendMessage = chrome.extension.sendMessage;
        chrome.runtime.onConnect = chrome.extension.onConnect;
        chrome.runtime.connect = chrome.extension.connect;
    }
}


```

通过这段代码，可以在不同版本的 Chrome 浏览器中实现对传递消息 API 的兼容，确保插件能够正常接收和发送消息。

### 2. 本地存储

本地存储 Localstorage 只能设置字符串，json 需转成字符串形式，配置 background.js 可随时读取本地数据。在使用 Chrome Extension 的本地存储 Localstorage 时，需要注意它只能设置字符串类型的值。如果要存储 JSON 对象，需要将其转换为字符串形式。例如：

```
// 设置 JSON 对象到 Localstorage
const jsonObject = { key: 'value' };
window.localStorage.setItem('domain:key', JSON.stringify(jsonObject));

// 从 Localstorage 获取 JSON 对象
const storedValue = window.localStorage.getItem('domain:key');
const parsedObject = JSON.parse(storedValue);


```

此外，如果要随时读取本地数据，可以在 manifest.json 中配置 background.js。例如：

```
{
    "background": {
        "scripts": ["js/background.js"]
    }
}


```

这样，content_script 里面的代码就可以随时读取 Localstorage 里面的数据，避免了需要 Browser_action 的 popup.html 一直打开的情况。通过这种方式，可以更加方便地管理和使用插件的本地存储数据。

五、开发案例展示
--------

### 1.git 提交的 emoji 速查工具

此工具由一个 manifest.json 文件、html 文件和一个 png 图片文件组成。功能非常简单，点击弹出一个 html 页面，以达到速查的目的，html 里可以替换成任何想要的内容。以下是 manifest.json 的基本配置：

```
{
"manifest_version":2,
"name":"git commit emoji速查",
"description":"git commit emoji对照表",
"version":"1.0.0",
"browser_action":{
    "default_icon":"icon.png",
    "default_title":"这是一个 git commit emoji 速查的Chrome插件",
    "default_popup":"popup.html"
    }
}


```

### 2. 自定义右键菜单

鼠标右键的菜单使用 chrome.contextMenus 实现。例如：

```
chrome.contextMenus.create({id: 'page',title: '测试右键菜单'});
chrome.contextMenus.create({id: 'baidu-search',title: '使用百度搜索：%s',contexts: ['selection']});
chrome.contextMenus.onClicked.addListener(function(info, tab) {
    switch(info.menuItemId){
        case'baidu-search':
        chrome.tabs.create({url: 'https://www.baidu.com/s?ie=utf-8&wd=' + encodeURI(info.selectionText)});
        break;
    }
});


```

### 3. 覆盖特定页面

在 manifest.json 里添加 chrome_url_overrides，可以被替换的只有新标签页 newtab、历史记录页 history、书签页 bookmarks 这三个选项，但是一个插件只能重写一个默认页。例如：

```
"chrome_url_overrides":{
    "newtab":"newtab.html"
}


```

### 4. 开发者工具自定义面板

通过 chrome.devtools API 来实现自定义开发者工具面板，大家熟悉的 vue 插件就是通过这种方式实现。例如：

```
// 几个参数依次为：panel标题、图标（其实设置了也没地方显示）、要加载的页面、加载成功后的回调
chrome.devtools.panels.create("TestPanel", "", "devtools.html", function(panel) {
    console.log("自定义面板创建成功！", panel);
});
// 创建自定义侧边栏
chrome.devtools.panels.elements.createSidebarPane("Images", function(sidebar) {
    sidebar.setExpression('document.querySelectorAll("img")', 'All Images');
});


```

### 5. 选项页

选项页实际上是指插件的详细信息介绍，配置在 manifest.json 里的 options_ui。例如：

```
"options_ui":{
    "page":"options.html",
    "browser_style":true
}


```

### 6. 搜索建议

在 manifest.json 里配置触发关键词，配置后再地址栏输入关键词后按空格键触发插件搜索建议。例如：

```
"omnibox":{
    "keyword":"go"
}
chrome.omnibox.onInputChanged.addListener((text, suggest) => {
    console.log('inputChanged: ' + text);
    if(!text) return;
    if(text == 'c') {
        suggest([{
            content: 'extension' + text, 
            description: 'chrome://extension'
        },
        {
            content: 'bookmarks' + text, 
            description: 'chrome://bookmarks'
        },
        {
            content: 'history' + text,
            description: 'chrome://history'
        }]);
    }
});
chrome.omnibox.onInputEntered.addListener((text) => {
    console.log('inputEntered: ' + text);
    if(!text) return;
    var href = '';
    if(text.endsWith('extension')) href = 'chrome://extension'
    else if(text.endsWith('history')) href = 'chrome://history'
    else href = 'chrome://bookmarks'
    openUrlCurrentTab(href);
});
function getCurrentTabId(callback){
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
        if(callback) callback(tabs.length? tabs[0].id: null);
    });
}
function openUrlCurrentTab(url){
    getCurrentTabId(tabId => {
    chrome.tabs.update(tabId, {url: url});
})
}


```

### 7. 桌面通知

使用 chrome.notifications API，首先在 permissions 里声明 notifications 权限，再在 background 里创建通知。例如：

```
chrome.notifications.create('', {
    type: 'basic',
    iconUrl: 'icons/icon.png',
    title: '这是标题',
    message: '您刚才点击了自定义右键菜单！'
});


```

六、框架
----

### 1.WXT 框架介绍

WXT 是一个免费的开源浏览器插件开发框架，致力于为开发者带来最好的开发体验和最快的开发速度。

特性：支持所有浏览器：包括 Chrome、Firefox、Edge、Safari 和一切基于 Chromium 的浏览器，大大提高了开发效率和代码的复用性。

一套代码支持 Manifest V2 和 V3 的插件：开发者可以根据需要选择适合的扩展版本，以满足不同浏览器的兼容性和性能要求。

支持 HMR：更新内容不再需要重新加载整个插件，极大地提高了开发效率。

入口点：manifest.json 是根据入口点的文件生成，方便快捷。

默认使用 typescript：使代码更加健壮、易于维护和扩展。

自动导入：与 Nuxt 一样的自动导入功能，默认的接口无需导入即可使用，加速开发过程。

自动下载远程代码：Google Manifest V3 要求拓展程序不依赖远程代码，WXT 满足这一要求。

轻松使用任何带有 vite 插件的前端框架：开发者可以根据项目需求选择合适的前端框架，而不必受限于特定的技术栈。内置包分析工具：方便优化，最小化扩展应用。官方提供多个快速入门模板：方便生成开发者习惯的技术方案。未来还会推出自动压缩、上传、发布功能。

安装与目录结构：执行命令 npx wxt@latest init 或使用 pnpm 的 pnpx wxt@latest init 进行安装。安装后会出现选择起始模板的选项，可根据喜欢的框架选择。目录结构包括. output / 构建结果目录、.vscode / 和. wxt / 配置目录、assets / 资源目录、public / 资源目录、components / 通用组件目录、entrypoints / 核心业务源码目录、package.json 和 wxt.config.ts 重要配置文件目录。

配置：打开 wxt.config.ts 文件，里面有 vite 的配置，代表不论使用什么框架都构建于 vite。WXT 提供 defineConfig 方法，携带完全的 ts 类型说明，方便配置。重要配置项包括目录配置（不建议修改官方提供的目录结构）、添加前端框架支持（如在 wxt.config.ts 文件中安装框架的 Vite 插件并添加到配置中，可支持 Vue、React、Svelte 等框架）。

支持 Storage API：WXT 提供简化的 API 来替换 browser.storage.* API，可以使用从 wxt/storage 自动导入的 storage 或手动导入。所有存储键都必须以其存储区域为前缀，还可以使用 local:、session:、sync: 或 Managed:。如果使用 TypeScript，可以向大多数方法添加类型参数来指定键值的预期类型。

支持远程代码：WXT 将自动下载并打包带有 url: 前缀的导入，满足 Google 对 MV3 的要求，扩展不依赖于远程代码。

### 2. 框架横向对比

WXT 与另一款常用框架 Plasmo 相比，各有优劣。

Plasmo 的优势：已有 7.7k star，在知名度上遥遥领先于 WXT。支持多种前端框架，如 React、Svelte 和 Vue。采用组件化开发方式，提高代码的可维护性和可重用性。内置热更新功能，仅支持 React，但能让开发者在开发过程中实时查看代码更改的效果。提供从开发到测试再到发布的完整解决方案，包括高效开发工具、真实环境测试和自动化发布流程。

WXT 的优势：支持所有前端框架，不受限于特定技术栈。支持自动打开浏览器并安装扩展，提升开发体验。除了支持 React 的热更新外，在内容 / 后台脚本变更时不会重新加载整个插件。未来会推出自动压缩、上传、发布功能，目前已具备内置包分析工具等特性。综上所述，开发者可以根据自己的需求和技术栈选择适合的框架进行 Chrome Extension 开发。

七、总结
====

Chrome Extension 的开发虽然在技术上存在一定的复杂性，但通过对各种组成部分的理解和运用，开发者能够创造出功能强大、个性化的浏览器扩展。

从基本组成来看，manifest.json 文件作为核心配置，明确了扩展的各项属性和权限；background script 提供了后台运行的能力，可实现各种高级功能；content script 能够与网页交互，实现对页面内容的操作；popup 则为用户提供了直观的交互界面。

在开发过程中，仅需简单的工具即可上手，Chrome 浏览器和带语法高亮的文本编辑器为开发者提供了便捷的开发环境。通过一系列的开发步骤，从创建 manifest 到加载插件、添加功能，开发者可以逐步实现自己的创意。

同时，开发过程中也需要注意一些事项，如 chrome 传递消息 API 的版本变化和本地存储的使用限制等。通过兼容处理和合理配置，可以确保插件在不同版本的 Chrome 浏览器上稳定运行。

Chrome Extension 官网有大量的案例可供参考，从简单的速查工具到复杂的开发者工具自定义面板，都体现了其强大的功能。而框架的出现，如 WXT 和 Plasmo，为开发者提供了更高效的开发方式和更多的选择。WXT 以其全面的特性和对多种前端框架的支持，为开发者带来了良好的开发体验和未来的发展潜力。

总之，Chrome Extension 的开发为用户和开发者带来了更多的可能性和便利。无论是提高工作效率、改善浏览体验还是实现个性化需求，Chrome Extension 都发挥着重要的作用。随着技术的不断发展，相信 Chrome Extension 将在未来继续为我们带来更多的惊喜和创新。

DEMO 案例：  
Chrome extensions: https://developer.chrome.com/docs/extensions/samples?hl=zh-cn  
Wxt: https://wxt.dev/examples.html