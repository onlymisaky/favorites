> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/mLXre4hdwcUX19Xq0qHGVw)

Web Component 是什么？
------------------

### 简介

> Web Components 是一套不同的技术，允许您创建可重用的定制元素（它们的功能封装在您的代码之外）并且在您的 web 应用中使用它们。
> 
> -- Web Components | MDN[1]

关于它的其它介绍：

*   组件是前端的发展方向，现在流行的 React 和 Vue 都是组件框架。而 Web Component 相比第三方框架，原生组件简单直接，符合直觉，不用加载任何外部模块，代码量小。目前，已经发展的比较成熟，并用于生产环境。
    
*   组件化开发使得我们可以将页面切割成模块便于封装和开发，而 Web Component 在此基础上，可以将每个组件渲染在独立的 DOM 树中，天然支持模块间样式和逻辑的隔离。
    

### 特性

这里会对 Web Component 的相关属性做一个简单介绍。

Web Component 特性完整代码：

https://codesandbox.io/s/snowy-darkness-jmdip7

#### Custom Elements

一组 Javascript API，允许您定义 Custom Elements 及其行为，然后在您的用户界面中按照需要使用它们。

##### window.customElements

```
// custom buttonclass CustomButton extends HTMLElement {  constructor() {    super();    const button = document.createElement("button");    button.innerText = this.getAttribute("name") || "custom button";    button.disabled = true;    this.appendChild(button);  }}window.customElements.define("custom-button", CustomButton);
```

*   window.customElements.get
    

该方法用来获取自定义组件的构造函数，接收一个参数，即声明的自定义组件的 name，返回构造函数。

```
const getCustomConstructorBefore = customElements.get('custom-button');// getCustomConstructorBefore before:  undefinedconsole.log('getCustomConstructorBefore before: ', getCustomConstructorBefore);customElements.define("custom-button", CustomButton);const getCustomConstructorAfter = customElements.get('custom-button');// getCustomConstructorAfter after:  ƒ CustomButton() {}console.log('getCustomConstructorAfter after: ', getCustomConstructorAfter);
```

*   window.customElements.upgrade
    

customElements upgrade() 方法升级节点子树中文档的所有包含 shadow dom 的（亲测，可以不包含 shadow dom）自定义元素，甚至在它们连接到主文档之前。接收一个参数，即一个自定义组件节点，无返回值。

```
// 先创建自定义标签const el = document.createElement("spider-man");class SpiderMan extends HTMLElement {}// 后声明构造函数customElements.define("spider-man", SpiderMan);// falseconsole.log(el instanceof SpiderMan);// 建立自定义标签与构造函数之间的绑定关系customElements.upgrade(el);// trueconsole.log(el instanceof SpiderMan);
```

*   window.customElements.whenDefined
    

该方法用来检测并提供自定义组件被定义声明完毕的时机，接收一个参数，即自定义元素的 name，返回值是一个 Promise，若提供的 name 无效，则触发 Promise 的 catch，可以用来判断是否定义了同名的 Custom Element。

Custom Element 重复定义的报错：

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zibYtOpR6wbuWhLkB7iaUq6cwjyWnoGd2eIyGgTGBtQuE7ibbZVwzdkCT6cW7gYGRZRdzh11dUNQ8VPw/640?wx_fmt=png)

我们可以用这个方法来捕获重复定义的报错，最推荐 define 之前先 get 一下～

```
customElements.whenDefined('custom-button').then(() => {  customElements.define('custom-button', CustomButton);}).catch((err) => {  console.log(err, 'err-----')});
```

捕获的报错信息：

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zibYtOpR6wbuWhLkB7iaUq6cwMG9zQCXFQPUmmgJVW970tHX92ibAzdLhMiaiacTvibcibzaMSVE6c9GSMRA/640?wx_fmt=png)

##### 生命周期

`Custom Elements`提供了一些生命周期函数，使得我们能在自定义元素在 DOM 中的行为变化后执行相关逻辑。

*   ConnectedCallback：当自定义元素第一次被连接到文档 DOM 时调用（类似组件 Mounted）；
    
*   attributeChangedCallback：当自定义元素的一个属性被增加、移除或更改时被调用，需要配合静态方法 observedAttributes 来使用，设置只有注册在 observedAttributes 中的属性才被监听；
    
*   disconnectedCallback：当自定元素与文档 DOM 断开连接时调用（类似 Unmount）；
    
*   adoptedCallback：当自定义元素被移动到新文档时被调用；
    

示例代码：

```
class CustomButton extends HTMLElement {  constructor() {    super();    const button = document.createElement("button");    button.innerText = "custom button";    button.addEventListener("click", this.changeAttribute.bind(this));    const textSpan = document.createElement("span");    textSpan.innerText = this.getAttribute("text") || "default";    textSpan.className = "info";    this.appendChild(button);    this.appendChild(textSpan);  }  connectedCallback() {    console.log("自定义button被连接到DOM啦～");  }  // observedAttributes，定义特定属性变化时，触发attributeChangedCallback函数  // 未定义的属性改变，则不会触发回调  static get observedAttributes() {    return ["style", "text"];  }  // 与observedAttributes结合使用  attributeChangedCallback(name, oldValue, newValue) {    if (      name === "text" &&      oldValue !== newValue &&      this.querySelector(".info")    ) {      this.querySelector(".info").innerText = newValue;    }  }  changeAttribute() {    this.setAttribute("text", "sfsdfd");  }  disconnectedCallback() {    console.log("自定义button与DOM断开连接啦～");  }  adoptedCallback() {    // 创建一个iframe的document，并移动进去    console.log("自定义button移动到新文档啦～");  }  clickToRemove() {    // 从DOM中移除自身    this.parentNode.removeChild(this);  }}window.customElements.define("custom-button", CustomButton);
```

#### Shadow DOM

一组 Javascript API，可以将封装的 “Shadow DOM” 树附加到元素（与主文档分开呈现），并控制其关联的功能。通过这种方式，您可以拥有一个天然的沙箱环境，保持元素的功能私有，实现样式和脚本的隔离，不用担心与文档的其他部分发生冲突。

示例代码：

```
class CustomShadowDOM extends HTMLElement {  constructor() {    super();    // 创建一个shadowDOM    const shadow = this.attachShadow({ mode: "open" });    const info = document.createElement("span");    const style = document.createElement("style");    const css = "span { color: red; }";    style.type = "text/css";    style.appendChild(document.createTextNode(css));    info.setAttribute("class", "info");    info.textContent = this.getAttribute("text") || "default";    // shadow可以创建一个不受外部影响，切拥有内部js运行逻辑，拥有独立的    // css的自定义元素（也就是web component），    shadow.appendChild(style);    shadow.appendChild(info);  }}window.customElements.define("custom-shadow-dom", CustomShadowDOM);
```

*   并非只能在 CustomElement 下使用，即便是普通的 HTMLElement 也能使用这一技术来实现样式保护，详见 👉：Using shadow DOM - Web Components | MDN[2]。
    
*   Shadow DOM 与 Light DOM 不能共存，若两者同时存在则通常情况下 Light DOM 不会被渲染。
    

#### HTML Template

`<template>` 和 `<slot>` 元素使您可以编写呈现页面中显示的标记模版。`<template>`可以作为自定义元素结构的基础被多次重用，也就是我们常做的组件复用。

`<template>` 元素是一种保护客户端内容机制，该内容在加载页面时不会呈现，但随后可以在运行时使用 JavaScript 实例化。

将模板视为一个可存储在文档中以便后续使用的内容片段，虽然解析器在加载页面时确实会处理 template 元素的内容，但这样做只是为了确保内容有效，元素不会被渲染。

*   `<template>`
    

下面我们来定义一个人员信息卡片的`template`，组件的样式应该与代码封装在一起，只对自定义元素生效，不影响外部的全局样式，可以把样式写在 template 里面。

示例代码：

```
<!-- 人员信息卡片标签 --><user-card  image="https://s1-imfile.feishucdn.com/static-resource/v1/v2_b2741d84-5d05-4739-b349-a3887b61039g~?image_size=noop&cut_type=&quality=&format=image&sticker_format=.webp"  yourmail@some-email.com"  age="18"></user-card><!-- 在HTML中定义template --><template id="userCardTemplate">  <style>    .box {      display: flex;      align-items: center;      width: 450px;      height: 180px;      background-color: #d4d4d4;      border: 1px solid #d5d5d5;      box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.1);      border-radius: 3px;      overflow: hidden;      padding: 10px;      box-sizing: border-box;    }    .image {      flex: 0 0 auto;      width: 160px;      height: 160px;      vertical-align: middle;      border-radius: 5px;    }    .container {      box-sizing: border-box;      padding: 20px;      height: 160px;    }    .container > .name {      font-size: 20px;      font-weight: 600;      line-height: 1;      margin: 0;      margin-bottom: 5px;    }    .container > .email {      font-size: 14px;      opacity: 0.75;      line-height: 1;      margin: 0;      margin-bottom: 15px;    }    .container > .age {      padding: 10px 25px;      font-size: 14px;      border-radius: 5px;      text-transform: uppercase;    }  </style>  <div class="box">    <img class="image" />    <div class="container">      <p class="name"></p>      <p class="email"></p>      <p class="age"></p>    </div>  </div></template>
```

```
// UserTemplate.jsclass UserCard extends HTMLElement {  constructor() {    super();    var templateElem = document.getElementById("userCardTemplate");    var content = templateElem.content.cloneNode(true);    content      .querySelector(".image")      .setAttribute("src", this.getAttribute("image"));    content.querySelector(".name").innerText = this.getAttribute("name");    content.querySelector(".email").innerText = this.getAttribute("email");    content.querySelector(".age").innerText = this.getAttribute("age");    this.appendChild(content);  }}window.customElements.define("user-card", UserCard);
```

运行效果：

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zibYtOpR6wbuWhLkB7iaUq6cwMbQAfxP1iakb3rPQmdcr1iaMl020eIrdU3OcbhQR3deeXcHdLGJl0BFw/640?wx_fmt=png)

*   `<slot>`
    

使用模版我们只能传递一些文本变量，这很有局限性，于是 Web Components 引入了`<slot>`（插槽）的概念来增加编码的灵活度。

我们可以使用 slot 来实现基于模版的部分自定义内容（标签、样式）的渲染，slot 插槽需要在 Shadow DOM 里才能生效。

```
class UserCard extends HTMLElement {  constructor() {    super();    var templateElem = document.getElementById("userCardTemplate");    var content = templateElem.content.cloneNode(true);    content      .querySelector(".image")      .setAttribute("src", this.getAttribute("image"));    content.querySelector(".name").innerText = this.getAttribute("name");    content.querySelector(".email").innerText = this.getAttribute("email");    content.querySelector(".age").innerText = this.getAttribute("age");    const shadowRoot = this.attachShadow({mode: 'open'})         .appendChild(content);  }}window.customElements.define("user-card", UserCard);
```

所有特性的完整 Demo ：

https://codesandbox.io/s/snowy-darkness-jmdip7?file=/index.html

### 兼容性

支持程度、存在问题、对应版本的浏览器在市场中的占比（不支持 IE）。

#### Custom Elements

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zibYtOpR6wbuWhLkB7iaUq6cw7feZpQeqx3HZLMz2dDRFcX5UibtnNh9pibQXHTcy3yT1mbhXdO2mgzdg/640?wx_fmt=png)

#### Shadow DOM

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zibYtOpR6wbuWhLkB7iaUq6cwodgbvFWdEYHj4HX8j0V1ajb0pUnsvjtSKibq6F1bK4icicmaKSRMMVGQQ/640?wx_fmt=png)

#### HTML templates

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zibYtOpR6wbuWhLkB7iaUq6cwCpOprZPG2B9yjX2Lyria3v4SRVFiasC2iaGKluCQZJVQK0QsvLGtHbGeA/640?wx_fmt=png)

Web Component 的使用实践
-------------------

### React 与 Web Component 结合

#### 自定义标签 `custom-button`

Web Component & React 完整代码：

https://codesandbox.io/s/sleepy-euclid-00crli?file=/src/CustomButton.tsx:256-261

```
// customButton.tsxclass CustomButton extends HTMLElement {  constructor() {    super();    this.shadow = this.attachShadow({      mode: "open"    });    const style = document.createElement("style");    style.textContent = `span { display: block; color: black };`;    this.shadow.appendChild(style);    const child = document.createElement("span");    child.className = "shadowInfo";    child.textContent = "default";    this.shadow.appendChild(child);  }  connectedCallback() {    if (this.querySelector(".shadowInfo")) {      this.querySelector(".shadowInfo").textContent = this.getAttribute("text");    }  }  // observedAttributes，定义特定属性变化时，触发attributeChangedCallback函数  static get observedAttributes() {    return ["text"];  }  // 与observedAttributes结合使用  attributeChangedCallback(name, oldValue, newValue) {    if (      name === "text" &&      oldValue !== newValue    ) {      this.shadow.querySelector(".shadowInfo").innerText = newValue;    }  }}window.customElements.define("custom-button", CustomButton);
```

#### 在组件中引入

```
const Main = (props) => {  const [text, setText] = useState("custom button");  return (    <>      <button onClick={() => setText("muzishuiji")}>change text</button>      点击按钮change text      <custom-button        text={text}        onClick={clickHandler}      ></custom-button>    </>  );};export default Main;
```

#### 运行效果：

[视频详情](javascript:;)

### Vue 与 Web Component 结合

Vue 提供了一个和定义一般 Vue 组件几乎完全一致的 `defineCustomElement` 方法来支持创建自定义元素。这个方法接收的参数和 `defineComponent` 完全相同。但它会返回一个继承自 `HTMLElement` 的自定义元素构造器：

```
import { defineCustomElement } from "vue";const MyVueElement = defineCustomElement({  // 普通vue组件选项});customElements.define("my-vue-element", MyVueElement);
```

`defineCustomElement`这个 API 允许开发者创建 Vue 驱动的 UI 组件库，这些库可以与任何框架一起使用，或者根本没有框架。

### Web Component 在「飞书项目」的插件体系的尝试

创建一个 React 工程，接下来根据示例代码操作，插件的 js 资源通过网络请求加载，css 资源通过 string 引入。

Web Component 在「飞书项目」的插件体系的尝试完整代码：

https://codesandbox.io/s/goofy-gauss-pmi46i?file=/src/App.tsx

#### 主工程的代码示例

##### App.js

```
import './pluginTemplate';import './App.css';import { useEffect, useState } from "react";function App() {  const [userId] = useState('123456789');  const [count, setCount] = useState(0);  useEffect(() => {    const timer = setInterval(() => {      setCount(pre => pre + 1);    }, 1000);    return () => {      clearInterval(timer)    }  }, []);  return (    <div class>      <h1>我是一个依赖人员卡片的业务方</h1>      <div>这里有一个定时器： {count}</div>      <div>        <a href="">宿主环境的a标签</a>      </div>      <plugin-template userId={userId}></plugin-template>    </div>  );}export default App;
```

##### 关键角色 pluginTemplate.js

```
// 偷个懒，cssText就不请求了import cssContent from "./cssContent";class PluginTemplate extends HTMLElement {  constructor() {    super();    this.shadow = this.attachShadow({      mode: "open"    });    // 给插件搞一个容器    const container = document.createElement("div");    container.id = "root";    // 如果有modal需要作为getPopupcontainer    container.style.position = "relative";    // container.innerHTML = divText;    this.shadow.appendChild(container);    // 插件的style设置不会影响到外部    const style = document.createElement("style");    style.innerText =      "body{backgrount-color: red;}#root{  --semi-shadow-elevated: 0 0 1px rgba(0, 0, 0, .3), 0 4px 14px rgba(0, 0, 0, .1);}";    const styleNode = document.createTextNode(cssContent.toString());    style.appendChild(styleNode);    this.shadow.appendChild(style);  }  connectedCallback() {    // 动态插入插件的打包资源    const script = document.createElement("script");    script.type = "text/javascript";    fetch(      "https://raw.githubusercontent.com/muzishuiji/demo_resource/main/web_component/bundle.js"    )      .then((response) => {        response.text().then((data) => {          script.innerText = `(function (){let __temp_exports__={};with({exports:__temp_exports__}){console.log(document);${data.replace(            /[\r\n]*/[/*](?=# sourceMap "\r\n]*/[/*").*[\r\n]*/g,            ""          )};}return __temp_exports__;})();`;          this.shadow?.appendChild(script);        });      })      .catch((err) => {        console.log(err, "err-----");      });    // 引入一个会导致栈溢出的script    // const errScript = document.createElement("script");    // errScript.type = "text/javascript";    // errScript.innerText = (function () {    //   function sum(n) {    //     if (n === 1) {    //       return 1;    //     }    //     return n + sum(n - 1);    //   }    //   sum(1e5);    // })();    // this.shadow?.appendChild(errScript);  }  // observedAttributes，定义特定属性变化时，触发attributeChangedCallback函数  static get observedAttributes() {    return ["userId"];  }}if (!window.customElements.get("plugin-template")) {  window.customElements.define("plugin-template", PluginTemplate);}
```

##### constant.js 的 cssContent

```
// 这里是插件资源的css，生产环境会通过网络请求获取// 在这里偷个懒不发请求了，存成一个Stringexport const cssContent = `#root{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,Fira Sans,Droid Sans,Helvetica Neue,sans-serif;margin:0}code{font-family:source-code-pro,Menlo,Monaco,Consolas,Courier New,monospace}#root{--semi-transition_duration-slowest:0ms;--semi-transition_duration-slower:0ms;--semi-transition_duration-slow:0ms;--semi-transition_duration-normal:0ms;--semi-transition_duration-fast:0ms;--semi-transition_duration-faster:0ms;--semi-transition_duration-fastest:0ms;--semi-transition_duration-none:0ms;--semi-transition_function-linear:linear;--semi-transition_function-ease:ease;--semi-transition_function-easeIn:ease-in;--semi-transition_function-easeOut:ease-out;--semi-transition_function-easeInIOut:ease-in-out;--semi-transition_delay-none:0ms;--semi-transition_delay-slowest:0ms;--semi-transition_delay-slower:0ms;--semi-transition_delay-slow:0ms;--semi-transition_delay-normal:0ms;--semi-transition_delay-fast:0ms;--semi-transition_delay-faster:0ms;--semi-transition_delay-fastest:0ms;--semi-transform_scale-none:scale(1,1);--semi-transform_scale-small:scale(1,1);--semi-transform_scale-medium:scale(1,1);--semi-transform_scale-large:scale(1,1);--semi-transform-rotate-none:rotate(0deg);--semi-transform_rotate-clockwise90deg:rotate(90deg);--semi-transform_rotate-clockwise180deg:rotate(180deg);--semi-transform_rotate-clockwise270deg:rotate(270deg);--semi-transform_rotate-clockwise360deg:rotate(360deg);--semi-transform_rotate-anticlockwise90deg:rotate(-90deg);--semi-transform_rotate-anticlockwise180deg:rotate(-180deg);--semi-transform_rotate-anticlockwise270deg:rotate(-270deg);--semi-transform_rotate-anticlockwise360deg:rotate(-360deg)}#root,#root .semi-always-light{--semi-amber-0:254,251,235;--semi-amber-1:252,245,206;--semi-amber-2:249,232,158;--semi-amber-3:246,216,111;--semi-amber-4:243,198,65;--semi-amber-5:240,177,20;--semi-amber-6:200,138,15;--semi-amber-7:160,102,10;--semi-amber-8:120,70,6;--semi-amber-9:80,43,3;--semi-black:0,0,0;--semi-blue-0:234,245,255;--semi-blue-1:203,231,254;--semi-blue-2:152,205,253;--semi-blue-3:101,178,252;--semi-blue-4:50,149,251;--semi-blue-5:0,100,250;--semi-blue-6:0,98,214;--semi-blue-7:0,79,179;--semi-blue-8:0,61,143;--semi-blue-9:0,44,107;--semi-cyan-0:229,247,248;--semi-cyan-1:194,239,240;--semi-cyan-2:138,221,226;--semi-cyan-3:88,203,211;--semi-cyan-4:44,184,197;--semi-cyan-5:5,164,182;--semi-cyan-6:3,134,152;--semi-cyan-7:1,105,121;--semi-cyan-8:0,77,91;--semi-cyan-9:0,50,61;--semi-green-0:236,247,236;--semi-green-1:208,240,209;--semi-green-2:164,224,167;--semi-green-3:125,209,130;--semi-green-4:90,194,98;--semi-green-5:59,179,70;--semi-green-6:48,149,59;--semi-green-7:37,119,47;--semi-green-8:27,89,36;--semi-green-9:17,60,24;--semi-grey-0:249,249,249;--semi-grey-1:230,232,234;--semi-grey-2:198,202,205;--semi-grey-3:167,171,176;--semi-grey-4:136,141,146;--semi-grey-5:107,112,117;--semi-grey-6:85,91,97;--semi-grey-7:65,70,76;--semi-grey-8:46,50,56;--semi-grey-9:28,31,35;--semi-indigo-0:236,239,248;--semi-indigo-1:209,216,240;--semi-indigo-2:167,179,225;--semi-indigo-3:128,144,211;--semi-indigo-4:94,111,196;--semi-indigo-5:63,81,181;--semi-indigo-6:51,66,161;--semi-indigo-7:40,52,140;--semi-indigo-8:31,40,120;--semi-indigo-9:23,29,99;--semi-light-blue-0:233,247,253;--semi-light-blue-1:201,236,252;--semi-light-blue-2:149,216,248;--semi-light-blue-3:98,195,245;--semi-light-blue-4:48,172,241;--semi-light-blue-5:0,149,238;--semi-light-blue-6:0,123,202;--semi-light-blue-7:0,99,167;--semi-light-blue-8:0,75,131;--semi-light-blue-9:0,53,95;--semi-light-green-0:243,248,236;--semi-light-green-1:227,240,208;--semi-light-green-2:200,226,165;--semi-light-green-3:173,211,126;--semi-light-green-4:147,197,91;--semi-light-green-5:123,182,60;--semi-light-green-6:100,152,48;--semi-light-green-7:78,121,38;--semi-light-green-8:57,91,27;--semi-light-green-9:37,61,18;--semi-lime-0:242,250,230;--semi-lime-1:227,246,197;--semi-lime-2:203,237,142;--semi-lime-3:183,227,91;--semi-lime-4:167,218,44;--semi-lime-5:155,209,0;--semi-lime-6:126,174,0;--semi-lime-7:99,139,0;--semi-lime-8:72,104,0;--semi-lime-9:47,70,0;--semi-orange-0:255,248,234;--semi-orange-1:254,238,204;--semi-orange-2:254,217,152;--semi-orange-3:253,193,101;--semi-orange-4:253,166,51;--semi-orange-5:252,136,0;--semi-orange-6:210,103,0;--semi-orange-7:168,74,0;--semi-orange-8:126,49,0;--semi-orange-9:84,29,0;--semi-pink-0:253,236,239;--semi-pink-1:251,207,216;--semi-pink-2:246,160,181;--semi-pink-3:242,115,150;--semi-pink-4:237,72,123;--semi-pink-5:233,30,99;--semi-pink-6:197,19,86;--semi-pink-7:162,11,72;--semi-pink-8:126,5,58;--semi-pink-9:90,1,43;--semi-purple-0:247,233,247;--semi-purple-1:239,202,240;--semi-purple-2:221,155,224;--semi-purple-3:201,111,209;--semi-purple-4:180,73,194;--semi-purple-5:158,40,179;--semi-purple-6:135,30,158;--semi-purple-7:113,22,138;--semi-purple-8:92,15,117;--semi-purple-9:73,10,97;--semi-red-0:254,242,237;--semi-red-1:254,221,210;--semi-red-2:253,183,165;--semi-red-3:251,144,120;--semi-red-4:250,102,76;--semi-red-5:249,57,32;--semi-red-6:213,37,21;--semi-red-7:178,20,12;--semi-red-8:142,8,5;--semi-red-9:106,1,3;--semi-teal-0:228,247,244;--semi-teal-1:192,240,232;--semi-teal-2:135,224,211;--semi-teal-3:84,209,193;--semi-teal-4:39,194,176;--semi-teal-5:0,179,161;--semi-teal-6:0,149,137;--semi-teal-7:0,119,111;--semi-teal-8:0,89,85;--semi-teal-9:0,60,58;--semi-violet-0:243,237,249;--semi-violet-1:226,209,244;--semi-violet-2:196,167,233;--semi-violet-3:166,127,221;--semi-violet-4:136,91,210;--semi-violet-5:106,58,199;--semi-violet-6:87,47,179;--semi-violet-7:70,37,158;--semi-violet-8:54,28,138;--semi-violet-9:40,20,117;--semi-white:255,255,255;--semi-yellow-0:255,253,234;--semi-yellow-1:254,251,203;--semi-yellow-2:253,243,152;--semi-yellow-3:252,232,101;--semi-yellow-4:251,218,50;--semi-yellow-5:250,200,0;--semi-yellow-6:208,170,0;--semi-yellow-7:167,139,0;--semi-yellow-8:125,106,0;--semi-yellow-9:83,72,0}#root .semi-always-dark,#root[theme-mode=dark]{--semi-red-0:108,9,11;--semi-red-1:144,17,16;--semi-red-2:180,32,25;--semi-red-3:215,51,36;--semi-red-4:251,73,50;--semi-red-5:252,114,90;--semi-red-6:253,153,131;--semi-red-7:253,190,172;--semi-red-8:254,224,213;--semi-red-9:255,243,239;--semi-pink-0:92,7,48;--semi-pink-1:128,14,65;--semi-pink-2:164,23,81;--semi-pink-3:199,34,97;--semi-pink-4:235,47,113;--semi-pink-5:239,86,134;--semi-pink-6:243,126,159;--semi-pink-7:247,168,188;--semi-pink-8:251,211,220;--semi-pink-9:253,238,241;--semi-purple-0:74,16,97;--semi-purple-1:94,23,118;--semi-purple-2:115,31,138;--semi-purple-3:137,40,159;--semi-purple-4:160,51,179;--semi-purple-5:181,83,194;--semi-purple-6:202,120,209;--semi-purple-7:221,160,225;--semi-purple-8:239,206,240;--semi-purple-9:247,235,247;--semi-violet-0:64,27,119;--semi-violet-1:76,36,140;--semi-violet-2:88,46,160;--semi-violet-3:100,57,181;--semi-violet-4:114,70,201;--semi-violet-5:136,101,212;--semi-violet-6:162,136,223;--semi-violet-7:190,173,233;--semi-violet-8:221,212,244;--semi-violet-9:241,238,250;--semi-indigo-0:23,30,101;--semi-indigo-1:32,41,122;--semi-indigo-2:41,54,142;--semi-indigo-3:52,68,163;--semi-indigo-4:64,83,183;--semi-indigo-5:95,113,197;--semi-indigo-6:129,145,212;--semi-indigo-7:167,180,226;--semi-indigo-8:209,216,241;--semi-indigo-9:237,239,248;--semi-blue-0:5,49,112;--semi-blue-1:10,70,148;--semi-blue-2:19,92,184;--semi-blue-3:29,117,219;--semi-blue-4:41,144,255;--semi-blue-5:84,169,255;--semi-blue-6:127,193,255;--semi-blue-7:169,215,255;--semi-blue-8:212,236,255;--semi-blue-9:239,248,255;--semi-light-blue-0:0,55,97;--semi-light-blue-1:0,77,133;--semi-light-blue-2:3,102,169;--semi-light-blue-3:10,129,204;--semi-light-blue-4:19,159,240;--semi-light-blue-5:64,180,243;--semi-light-blue-6:110,200,246;--semi-light-blue-7:157,220,249;--semi-light-blue-8:206,238,252;--semi-light-blue-9:235,248,254;--semi-cyan-0:4,52,61;--semi-cyan-1:7,79,92;--semi-cyan-2:10,108,123;--semi-cyan-3:14,137,153;--semi-cyan-4:19,168,184;--semi-cyan-5:56,187,198;--semi-cyan-6:98,205,212;--semi-cyan-7:145,223,227;--semi-cyan-8:198,239,241;--semi-cyan-9:231,247,248;--semi-teal-0:2,60,57;--semi-teal-1:4,90,85;--semi-teal-2:7,119,111;--semi-teal-3:10,149,136;--semi-teal-4:14,179,161;--semi-teal-5:51,194,176;--semi-teal-6:94,209,193;--semi-teal-7:142,225,211;--semi-teal-8:196,240,232;--semi-teal-9:230,247,244;--semi-green-0:18,60,25;--semi-green-1:28,90,37;--semi-green-2:39,119,49;--semi-green-3:50,149,61;--semi-green-4:62,179,73;--semi-green-5:93,194,100;--semi-green-6:127,209,132;--semi-green-7:166,225,168;--semi-green-8:208,240,209;--semi-green-9:236,247,236;--semi-light-green-0:38,61,19;--semi-light-green-1:59,92,29;--semi-light-green-2:81,123,40;--semi-light-green-3:103,153,52;--semi-light-green-4:127,184,64;--semi-light-green-5:151,198,95;--semi-light-green-6:176,212,129;--semi-light-green-7:201,227,167;--semi-light-green-8:228,241,209;--semi-light-green-9:243,248,237;--semi-lime-0:49,70,3;--semi-lime-1:75,105,5;--semi-lime-2:103,141,9;--semi-lime-3:132,176,12;--semi-lime-4:162,211,17;--semi-lime-5:174,220,58;--semi-lime-6:189,229,102;--semi-lime-7:207,237,150;--semi-lime-8:229,246,201;--semi-lime-9:243,251,233;--semi-yellow-0:84,73,3;--semi-yellow-1:126,108,6;--semi-yellow-2:168,142,10;--semi-yellow-3:210,175,15;--semi-yellow-4:252,206,20;--semi-yellow-5:253,222,67;--semi-yellow-6:253,235,113;--semi-yellow-7:254,245,160;--semi-yellow-8:254,251,208;--semi-yellow-9:255,254,236;--semi-amber-0:81,46,9;--semi-amber-1:121,75,15;--semi-amber-2:161,107,22;--semi-amber-3:202,143,30;--semi-amber-4:242,183,38;--semi-amber-5:245,202,80;--semi-amber-6:247,219,122;--semi-amber-7:250,234,166;--semi-amber-8:252,246,210;--semi-amber-9:254,251,237;--semi-orange-0:85,31,3;--semi-orange-1:128,53,6;--semi-orange-2:170,80,10;--semi-orange-3:213,111,15;--semi-orange-4:255,146,20;--semi-orange-5:255,174,67;--semi-orange-6:255,199,114;--semi-orange-7:255,221,161;--semi-orange-8:255,239,208;--semi-orange-9:255,249,237;--semi-grey-0:28,31,35;--semi-grey-1:46,50,56;--semi-grey-2:65,70,76;--semi-grey-3:85,91,97;--semi-grey-4:107,112,117;--semi-grey-5:136,141,146;--semi-grey-6:167,171,176;--semi-grey-7:198,202,205;--semi-grey-8:230,232,234;--semi-grey-9:249,249,249;--semi-white:255,255,255;--semi-black:0,0,0}#root,#root[theme-mode=dark] .semi-always-light{--semi-color-white:rgba(var(--semi-white),1);--semi-color-black:rgba(var(--semi-black),1);--semi-color-primary:rgba(var(--semi-blue-5),1);--semi-color-primary-hover:rgba(var(--semi-blue-6),1);--semi-color-primary-active:rgba(var(--semi-blue-7),1);--semi-color-primary-disabled:rgba(var(--semi-blue-2),1);--semi-color-primary-light-default:rgba(var(--semi-blue-0),1);--semi-color-primary-light-hover:rgba(var(--semi-blue-1),1);--semi-color-primary-light-active:rgba(var(--semi-blue-2),1);--semi-color-secondary:rgba(var(--semi-light-blue-5),1);--semi-color-secondary-hover:rgba(var(--semi-light-blue-6),1);--semi-color-secondary-active:rgba(var(--semi-light-blue-7),1);--semi-color-secondary-disabled:rgba(var(--semi-light-blue-2),1);--semi-color-secondary-light-default:rgba(var(--semi-light-blue-0),1);--semi-color-secondary-light-hover:rgba(var(--semi-light-blue-1),1);--semi-color-secondary-light-active:rgba(var(--semi-light-blue-2),1);--semi-color-tertiary:rgba(var(--semi-grey-5),1);--semi-color-tertiary-hover:rgba(var(--semi-grey-6),1);--semi-color-tertiary-active:rgba(var(--semi-grey-7),1);--semi-color-tertiary-light-default:rgba(var(--semi-grey-0),1);--semi-color-tertiary-light-hover:rgba(var(--semi-grey-1),1);--semi-color-tertiary-light-active:rgba(var(--semi-grey-2),1);--semi-color-default:rgba(var(--semi-grey-0),1);--semi-color-default-hover:rgba(var(--semi-grey-1),1);--semi-color-default-active:rgba(var(--semi-grey-2),1);--semi-color-info:rgba(var(--semi-blue-5),1);--semi-color-info-hover:rgba(var(--semi-blue-6),1);--semi-color-info-active:rgba(var(--semi-blue-7),1);--semi-color-info-disabled:rgba(var(--semi-blue-2),1);--semi-color-info-light-default:rgba(var(--semi-blue-0),1);--semi-color-info-light-hover:rgba(var(--semi-blue-1),1);--semi-color-info-light-active:rgba(var(--semi-blue-2),1);--semi-color-success:rgba(var(--semi-green-5),1);--semi-color-success-hover:rgba(var(--semi-green-6),1);--semi-color-success-active:rgba(var(--semi-green-7),1);--semi-color-success-disabled:rgba(var(--semi-green-2),1);--semi-color-success-light-default:rgba(var(--semi-green-0),1);--semi-color-success-light-hover:rgba(var(--semi-green-1),1);--semi-color-success-light-active:rgba(var(--semi-green-2),1);--semi-color-danger:rgba(var(--semi-red-5),1);--semi-color-danger-hover:rgba(var(--semi-red-6),1);--semi-color-danger-active:rgba(var(--semi-red-7),1);--semi-color-danger-light-default:rgba(var(--semi-red-0),1);--semi-color-danger-light-hover:rgba(var(--semi-red-1),1);--semi-color-danger-light-active:rgba(var(--semi-red-2),1);--semi-color-warning:rgba(var(--semi-orange-5),1);--semi-color-warning-hover:rgba(var(--semi-orange-6),1);--semi-color-warning-active:rgba(var(--semi-orange-7),1);--semi-color-warning-light-default:rgba(var(--semi-orange-0),1);--semi-color-warning-light-hover:rgba(var(--semi-orange-1),1);--semi-color-warning-light-active:rgba(var(--semi-orange-2),1);--semi-color-focus-border:rgba(var(--semi-blue-5),1);--semi-color-disabled-text:rgba(var(--semi-grey-9),.35);--semi-color-disabled-border:rgba(var(--semi-grey-1),1);--semi-color-disabled-bg:rgba(var(--semi-grey-1),1);--semi-color-disabled-fill:rgba(var(--semi-grey-8),.04);--semi-color-shadow:rgba(var(--semi-black),.04);--semi-color-link:rgba(var(--semi-blue-5),1);--semi-color-link-hover:rgba(var(--semi-blue-6),1);--semi-color-link-active:rgba(var(--semi-blue-7),1);--semi-color-link-visited:rgba(var(--semi-blue-5),1);--semi-color-border:rgba(var(--semi-grey-9),.08);--semi-color-nav-bg:rgba(var(--semi-white),1);--semi-color-overlay-bg:rgba(22,22,26,.6);--semi-color-fill-0:rgba(var(--semi-grey-8),.05);--semi-color-fill-1:rgba(var(--semi-grey-8),.09);--semi-color-fill-2:rgba(var(--semi-grey-8),.13);--semi-color-bg-0:rgba(var(--semi-white),1);--semi-color-bg-1:rgba(var(--semi-white),1);--semi-color-bg-2:rgba(var(--semi-white),1);--semi-color-bg-3:rgba(var(--semi-white),1);--semi-color-bg-4:rgba(var(--semi-white),1);--semi-color-text-0:rgba(var(--semi-grey-9),1);--semi-color-text-1:rgba(var(--semi-grey-9),.8);--semi-color-text-2:rgba(var(--semi-grey-9),.62);--semi-color-text-3:rgba(var(--semi-grey-9),.35);--semi-shadow-elevated:0 0 1px rgba(0,0,0,.3),0 4px 14px rgba(0,0,0,.1);--semi-border-radius-extra-small:3px;--semi-border-radius-small:3px;--semi-border-radius-medium:6px;--semi-border-radius-large:12px;--semi-border-radius-circle:50%;--semi-border-radius-full:9999px;--semi-color-highlight-bg:rgba(var(--semi-yellow-4),1);--semi-color-highlight:rgba(var(--semi-black),1)}#root,#root .semi-always-dark,#root[theme-mode=dark],#root[theme-mode=dark] .semi-always-light{-webkit-font-smoothing:antialiased;font-family:Inter,-apple-system,BlinkMacSystemFont,Segoe UI,PingFang SC,Hiragino Sans GB,Microsoft YaHei,Helvetica Neue,Helvetica,Arial,sans-serif}#root .semi-always-dark,#root[theme-mode=dark]{--semi-color-white:#e4e7f5;--semi-color-black:rgba(var(--semi-black),1);--semi-color-primary:rgba(var(--semi-blue-5),1);--semi-color-primary-hover:rgba(var(--semi-blue-6),1);--semi-color-primary-active:rgba(var(--semi-blue-7),1);--semi-color-primary-disabled:rgba(var(--semi-blue-2),1);--semi-color-primary-light-default:rgba(var(--semi-blue-5),.2);--semi-color-primary-light-hover:rgba(var(--semi-blue-5),.3);--semi-color-primary-light-active:rgba(var(--semi-blue-5),.4);--semi-color-secondary:rgba(var(--semi-light-blue-5),1);--semi-color-secondary-hover:rgba(var(--semi-light-blue-6),1);--semi-color-secondary-active:rgba(var(--semi-light-blue-7),1);--semi-color-secondary-disabled:rgba(var(--semi-light-blue-2),1);--semi-color-secondary-light-default:rgba(var(--semi-light-blue-5),.2);--semi-color-secondary-light-hover:rgba(var(--semi-light-blue-5),.3);--semi-color-secondary-light-active:rgba(var(--semi-light-blue-5),.4);--semi-color-tertiary:rgba(var(--semi-grey-5),1);--semi-color-tertiary-hover:rgba(var(--semi-grey-6),1);--semi-color-tertiary-active:rgba(var(--semi-grey-7),1);--semi-color-tertiary-light-default:rgba(var(--semi-grey-5),.2);--semi-color-tertiary-light-hover:rgba(var(--semi-grey-5),.3);--semi-color-tertiary-light-active:rgba(var(--semi-grey-5),.4);--semi-color-default:rgba(var(--semi-grey-0),1);--semi-color-default-hover:rgba(var(--semi-grey-1),1);--semi-color-default-active:rgba(var(--semi-grey-2),1);--semi-color-info:rgba(var(--semi-blue-5),1);--semi-color-info-hover:rgba(var(--semi-blue-6),1);--semi-color-info-active:rgba(var(--semi-blue-7),1);--semi-color-info-disabled:rgba(var(--semi-blue-2),1);--semi-color-info-light-default:rgba(var(--semi-blue-5),.2);--semi-color-info-light-hover:rgba(var(--semi-blue-5),.3);--semi-color-info-light-active:rgba(var(--semi-blue-5),.4);--semi-color-success:rgba(var(--semi-green-5),1);--semi-color-success-hover:rgba(var(--semi-green-6),1);--semi-color-success-active:rgba(var(--semi-green-7),1);--semi-color-success-disabled:rgba(var(--semi-green-2),1);--semi-color-success-light-default:rgba(var(--semi-green-5),.2);--semi-color-success-light-hover:rgba(var(--semi-green-5),.3);--semi-color-success-light-active:rgba(var(--semi-green-5),.4);--semi-color-danger:rgba(var(--semi-red-5),1);--semi-color-danger-hover:rgba(var(--semi-red-6),1);--semi-color-danger-active:rgba(var(--semi-red-7),1);--semi-color-danger-light-default:rgba(var(--semi-red-5),.2);--semi-color-danger-light-hover:rgba(var(--semi-red-5),.3);--semi-color-danger-light-active:rgba(var(--semi-red-5),.4);--semi-color-warning:rgba(var(--semi-orange-5),1);--semi-color-warning-hover:rgba(var(--semi-orange-6),1);--semi-color-warning-active:rgba(var(--semi-orange-7),1);--semi-color-warning-light-default:rgba(var(--semi-orange-5),.2);--semi-color-warning-light-hover:rgba(var(--semi-orange-5),.3);--semi-color-warning-light-active:rgba(var(--semi-orange-5),.4);--semi-color-focus-border:rgba(var(--semi-blue-5),1);--semi-color-disabled-text:rgba(var(--semi-grey-9),.35);--semi-color-disabled-border:rgba(var(--semi-grey-1),1);--semi-color-disabled-bg:rgba(var(--semi-grey-1),1);--semi-color-disabled-fill:rgba(var(--semi-grey-8),.04);--semi-color-link:rgba(var(--semi-blue-5),1);--semi-color-link-hover:rgba(var(--semi-blue-6),1);--semi-color-link-active:rgba(var(--semi-blue-7),1);--semi-color-link-visited:rgba(var(--semi-blue-5),1);--semi-color-nav-bg:#232429;--semi-shadow-elevated:inset 0 0 0 1px hsla(0,0%,100%,.1),0 4px 14px rgba(0,0,0,.25);--semi-color-overlay-bg:rgba(22,22,26,.6);--semi-color-fill-0:rgba(var(--semi-white),.12);--semi-color-fill-1:rgba(var(--semi-white),.16);--semi-color-fill-2:rgba(var(--semi-white),.20);--semi-color-border:rgba(var(--semi-white),.08);--semi-color-shadow:rgba(var(--semi-black),.04);--semi-color-bg-0:#16161a;--semi-color-bg-1:#232429;--semi-color-bg-2:#35363c;--semi-color-bg-3:#43444a;--semi-color-bg-4:#4f5159;--semi-color-text-0:rgba(var(--semi-grey-9),1);--semi-color-text-1:rgba(var(--semi-grey-9),.8);--semi-color-text-2:rgba(var(--semi-grey-9),.6);--semi-color-text-3:rgba(var(--semi-grey-9),.35);--semi-border-radius-extra-small:3px;--semi-border-radius-small:3px;--semi-border-radius-medium:6px;--semi-border-radius-large:12px;--semi-border-radius-circle:50%;--semi-border-radius-full:9999px;--semi-color-highlight-bg:rgba(var(--semi-yellow-2),1);--semi-color-highlight:rgba(var(--semi-white),1)}.semi-light-scrollbar ::-webkit-scrollbar,.semi-light-scrollbar::-webkit-scrollbar{height:8px;width:8px}.semi-light-scrollbar ::-webkit-scrollbar-track,.semi-light-scrollbar::-webkit-scrollbar-track{background:transparent}.semi-light-scrollbar ::-webkit-scrollbar-corner,.semi-light-scrollbar::-webkit-scrollbar-corner{background-color:transparent}.semi-light-scrollbar ::-webkit-scrollbar-thumb,.semi-light-scrollbar::-webkit-scrollbar-thumb{background:transparent;border-radius:6px;-webkit-transition:all 1s;transition:all 1s}.semi-light-scrollbar :hover::-webkit-scrollbar-thumb,.semi-light-scrollbar:hover::-webkit-scrollbar-thumb{background:var(--semi-color-fill-2)}.semi-light-scrollbar ::-webkit-scrollbar-thumb:hover,.semi-light-scrollbar::-webkit-scrollbar-thumb:hover{background:var(--semi-color-fill-1)}.semi-avatar{align-items:center;display:inline-flex;justify-content:center;overflow:hidden;position:relative;text-align:center;vertical-align:middle;white-space:nowrap}.semi-avatar:focus-visible{outline:2px solid var(--semi-color-primary-light-active)}.semi-avatar-focus{outline:2px solid var(--semi-color-primary-light-active)}.semi-avatar-no-focus-visible:focus-visible{outline:none}.semi-avatar .semi-avatar-label{align-items:center;display:flex;font-family:Inter,-apple-system,BlinkMacSystemFont,Segoe UI,PingFang SC,Hiragino Sans GB,Microsoft YaHei,Helvetica Neue,Helvetica,Arial,sans-serif;font-size:14px;font-weight:600;line-height:20px}.semi-avatar-content{-webkit-user-select:none;user-select:none}.semi-avatar-extra-extra-small{border-radius:3px;height:20px;width:20px}.semi-avatar-extra-extra-small .semi-avatar-content{-webkit-transform:scale(.8);transform:scale(.8);-webkit-transform-origin:center;transform-origin:center}.semi-avatar-extra-extra-small .semi-avatar-label{font-size:10px;line-height:15px}.semi-avatar-extra-small{border-radius:3px;height:24px;width:24px}.semi-avatar-extra-small .semi-avatar-content{-webkit-transform:scale(.8);transform:scale(.8);-webkit-transform-origin:center;transform-origin:center}.semi-avatar-extra-small .semi-avatar-label{font-size:10px;line-height:15px}.semi-avatar-small{border-radius:3px;height:32px;width:32px}.semi-avatar-small .semi-avatar-label{font-family:Inter,-apple-system,BlinkMacSystemFont,Segoe UI,PingFang SC,Hiragino Sans GB,Microsoft YaHei,Helvetica Neue,Helvetica,Arial,sans-serif;font-size:12px;line-height:16px}.semi-avatar-default{border-radius:3px;height:40px;width:40px}.semi-avatar-default .semi-avatar-label{font-family:Inter,-apple-system,BlinkMacSystemFont,Segoe UI,PingFang SC,Hiragino Sans GB,Microsoft YaHei,Helvetica Neue,Helvetica,Arial,sans-serif;font-size:18px;line-height:24px}.semi-avatar-medium{border-radius:3px;height:48px;width:48px}.semi-avatar-medium .semi-avatar-label{font-family:Inter,-apple-system,BlinkMacSystemFont,Segoe UI,PingFang SC,Hiragino Sans GB,Microsoft YaHei,Helvetica Neue,Helvetica,Arial,sans-serif;font-size:20px;line-height:28px}.semi-avatar-large{border-radius:6px;height:72px;width:72px}.semi-avatar-large .semi-avatar-label{font-family:Inter,-apple-system,BlinkMacSystemFont,Segoe UI,PingFang SC,Hiragino Sans GB,Microsoft YaHei,Helvetica Neue,Helvetica,Arial,sans-serif;font-size:32px;line-height:44px}.semi-avatar-extra-large{border-radius:12px;height:128px;width:128px}.semi-avatar-extra-large .semi-avatar-label{font-size:64px;line-height:77px}.semi-avatar-circle{border-radius:var(--semi-border-radius-circle)}.semi-avatar-image{background-color:initial}.semi-avatar>img{display:block;height:100%;object-fit:cover;width:100%}.semi-avatar-hover{height:100%;left:0;position:absolute;top:0;width:100%}.semi-avatar:hover{cursor:pointer}.semi-avatar-group{display:inline-block}.semi-avatar-group .semi-avatar{box-sizing:border-box}.semi-avatar-group .semi-avatar:first-child{margin-left:0}.semi-avatar-group .semi-avatar-extra-large{border:3px solid var(--semi-color-bg-1);margin-left:-32px}.semi-avatar-group .semi-avatar-large{border:3px solid var(--semi-color-bg-1);margin-left:-18px}.semi-avatar-group .semi-avatar-default,.semi-avatar-group .semi-avatar-medium,.semi-avatar-group .semi-avatar-small{border:2px solid var(--semi-color-bg-1);margin-left:-12px}.semi-avatar-group .semi-avatar-extra-small{border:1px solid var(--semi-color-bg-1);margin-left:-10px}.semi-avatar-group .semi-avatar-extra-extra-small{border:1px solid var(--semi-color-bg-1);margin-left:-4px}.semi-avatar-group .semi-avatar-item-start-0{z-index:100}.semi-avatar-group .semi-avatar-item-end-0{z-index:80}.semi-avatar-group .semi-avatar-item-start-1{z-index:99}.semi-avatar-group .semi-avatar-item-end-1{z-index:81}.semi-avatar-group .semi-avatar-item-start-2{z-index:98}.semi-avatar-group .semi-avatar-item-end-2{z-index:82}.semi-avatar-group .semi-avatar-item-start-3{z-index:97}.semi-avatar-group .semi-avatar-item-end-3{z-index:83}.semi-avatar-group .semi-avatar-item-start-4{z-index:96}.semi-avatar-group .semi-avatar-item-end-4{z-index:84}.semi-avatar-group .semi-avatar-item-start-5{z-index:95}.semi-avatar-group .semi-avatar-item-end-5{z-index:85}.semi-avatar-group .semi-avatar-item-start-6{z-index:94}.semi-avatar-group .semi-avatar-item-end-6{z-index:86}.semi-avatar-group .semi-avatar-item-start-7{z-index:93}.semi-avatar-group .semi-avatar-item-end-7{z-index:87}.semi-avatar-group .semi-avatar-item-start-8{z-index:92}.semi-avatar-group .semi-avatar-item-end-8{z-index:88}.semi-avatar-group .semi-avatar-item-start-9{z-index:91}.semi-avatar-group .semi-avatar-item-end-9{z-index:89}.semi-avatar-group .semi-avatar-item-end-10,.semi-avatar-group .semi-avatar-item-start-10{z-index:90}.semi-avatar-group .semi-avatar-item-start-11{z-index:89}.semi-avatar-group .semi-avatar-item-end-11{z-index:91}.semi-avatar-group .semi-avatar-item-start-12{z-index:88}.semi-avatar-group .semi-avatar-item-end-12{z-index:92}.semi-avatar-group .semi-avatar-item-start-13{z-index:87}.semi-avatar-group .semi-avatar-item-end-13{z-index:93}.semi-avatar-group .semi-avatar-item-start-14{z-index:86}.semi-avatar-group .semi-avatar-item-end-14{z-index:94}.semi-avatar-group .semi-avatar-item-start-15{z-index:85}.semi-avatar-group .semi-avatar-item-end-15{z-index:95}.semi-avatar-group .semi-avatar-item-start-16{z-index:84}.semi-avatar-group .semi-avatar-item-end-16{z-index:96}.semi-avatar-group .semi-avatar-item-start-17{z-index:83}.semi-avatar-group .semi-avatar-item-end-17{z-index:97}.semi-avatar-group .semi-avatar-item-start-18{z-index:82}.semi-avatar-group .semi-avatar-item-end-18{z-index:98}.semi-avatar-group .semi-avatar-item-start-19{z-index:81}.semi-avatar-group .semi-avatar-item-end-19{z-index:99}.semi-avatar-group .semi-avatar-item-start-20{z-index:80}.semi-avatar-group .semi-avatar-item-end-20{z-index:100}.semi-avatar-group .semi-avatar-item-more{background-color:rgba(var(--semi-grey-5),1)}.semi-avatar-amber{background-color:rgba(var(--semi-amber-3),1);color:rgba(var(--semi-white),1)}.semi-avatar-blue{background-color:rgba(var(--semi-blue-3),1);color:rgba(var(--semi-white),1)}.semi-avatar-cyan{background-color:rgba(var(--semi-cyan-3),1);color:rgba(var(--semi-white),1)}.semi-avatar-green{background-color:rgba(var(--semi-green-3),1);color:rgba(var(--semi-white),1)}.semi-avatar-grey{background-color:rgba(var(--semi-grey-3),1);color:rgba(var(--semi-white),1)}.semi-avatar-indigo{background-color:rgba(var(--semi-indigo-3),1);color:rgba(var(--semi-white),1)}.semi-avatar-light-blue{background-color:rgba(var(--semi-light-blue-3),1);color:rgba(var(--semi-white),1)}.semi-avatar-light-green{background-color:rgba(var(--semi-light-green-3),1);color:rgba(var(--semi-white),1)}.semi-avatar-lime{background-color:rgba(var(--semi-lime-3),1);color:rgba(var(--semi-white),1)}.semi-avatar-orange{background-color:rgba(var(--semi-orange-3),1);color:rgba(var(--semi-white),1)}.semi-avatar-pink{background-color:rgba(var(--semi-pink-3),1);color:rgba(var(--semi-white),1)}.semi-avatar-purple{background-color:rgba(var(--semi-purple-3),1);color:rgba(var(--semi-white),1)}.semi-avatar-red{background-color:rgba(var(--semi-red-3),1);color:rgba(var(--semi-white),1)}.semi-avatar-teal{background-color:rgba(var(--semi-teal-3),1);color:rgba(var(--semi-white),1)}.semi-avatar-violet{background-color:rgba(var(--semi-violet-3),1);color:rgba(var(--semi-white),1)}.semi-avatar-yellow{background-color:rgba(var(--semi-yellow-3),1);color:rgba(var(--semi-white),1)}.semi-portal-rtl .semi-avatar,.semi-rtl .semi-avatar{direction:rtl}.semi-portal-rtl .semi-avatar-extra-extra-small .semi-avatar-content,.semi-portal-rtl .semi-avatar-extra-small .semi-avatar-content,.semi-rtl .semi-avatar-extra-extra-small .semi-avatar-content,.semi-rtl .semi-avatar-extra-small .semi-avatar-content{-webkit-transform:scale(.8);transform:scale(.8)}.semi-portal-rtl .semi-avatar-hover,.semi-rtl .semi-avatar-hover{left:auto;right:0}.semi-portal-rtl .semi-avatar-group,.semi-rtl .semi-avatar-group{direction:rtl}.semi-portal-rtl .semi-avatar-group .semi-avatar:first-child,.semi-rtl .semi-avatar-group .semi-avatar:first-child{margin-left:auto;margin-right:0}.semi-portal-rtl .semi-avatar-group .semi-avatar-extra-large,.semi-rtl .semi-avatar-group .semi-avatar-extra-large{margin-left:auto;margin-right:-32px}.semi-portal-rtl .semi-avatar-group .semi-avatar-large,.semi-rtl .semi-avatar-group .semi-avatar-large{margin-left:auto;margin-right:-18px}.semi-portal-rtl .semi-avatar-group .semi-avatar-medium,.semi-portal-rtl .semi-avatar-group .semi-avatar-small,.semi-rtl .semi-avatar-group .semi-avatar-medium,.semi-rtl .semi-avatar-group .semi-avatar-small{margin-left:auto;margin-right:-12px}.semi-portal-rtl .semi-avatar-group .semi-avatar-extra-small,.semi-rtl .semi-avatar-group .semi-avatar-extra-small{margin-left:auto;margin-right:-10px}.semi-portal-rtl .semi-avatar-group .semi-avatar-extra-extra-small,.semi-rtl .semi-avatar-group .semi-avatar-extra-extra-small{margin-left:auto;margin-right:-4px}@-webkit-keyframes semi-popover-zoomIn{0%{opacity:0;-webkit-transform:scale(.8);transform:scale(.8)}50%{opacity:1}}@keyframes semi-popover-zoomIn{0%{opacity:0;-webkit-transform:scale(.8);transform:scale(.8)}50%{opacity:1}}@-webkit-keyframes semi-popover-zoomOut{0%{opacity:1}60%{opacity:0;-webkit-transform:scale(.8);transform:scale(.8)}to{opacity:0}}@keyframes semi-popover-zoomOut{0%{opacity:1}60%{opacity:0;-webkit-transform:scale(.8);transform:scale(.8)}to{opacity:0}}.semi-popover-wrapper{background-color:var(--semi-color-bg-3);border-radius:var(--semi-border-radius-medium);box-shadow:var(--semi-shadow-elevated);font-family:Inter,-apple-system,BlinkMacSystemFont,Segoe UI,PingFang SC,Hiragino Sans GB,Microsoft YaHei,Helvetica Neue,Helvetica,Arial,sans-serif;font-size:14px;line-height:20px;opacity:0;position:relative;z-index:1030}.semi-popover-wrapper-show{opacity:1}.semi-popover-trigger{display:inline-block;height:auto;width:auto}.semi-popover-title{border-bottom:1px solid var(--semi-color-border);padding:8px}.semi-popover-confirm{position:absolute}.semi-popover-with-arrow{box-sizing:border-box;padding:12px}.semi-popover-animation-show{-webkit-animation:semi-popover-zoomIn .1s cubic-bezier(.215,.61,.355,1);animation:semi-popover-zoomIn .1s cubic-bezier(.215,.61,.355,1)}.semi-popover-animation-hide{-webkit-animation:semi-popover-zoomOut .1s cubic-bezier(.215,.61,.355,1);animation:semi-popover-zoomOut .1s cubic-bezier(.215,.61,.355,1)}.semi-popover-wrapper .semi-popover-icon-arrow{color:inherit;height:8px;position:absolute;width:24px}.semi-popover-wrapper[x-placement=top] .semi-popover-icon-arrow{bottom:-7px;left:50%;-webkit-transform:translateX(-50%);transform:translateX(-50%)}.semi-popover-wrapper[x-placement=top] .semi-popover-with-arrow,.semi-popover-wrapper[x-placement=top].semi-popover-with-arrow{min-width:36px}.semi-popover-wrapper[x-placement=topLeft] .semi-popover-icon-arrow{bottom:-7px;left:6px}.semi-popover-wrapper[x-placement=topLeft] .semi-popover-with-arrow,.semi-popover-wrapper[x-placement=topLeft].semi-popover-with-arrow{min-width:36px}.semi-popover-wrapper[x-placement=topRight] .semi-popover-icon-arrow{bottom:-7px;right:6px}.semi-popover-wrapper[x-placement=topRight] .semi-popover-with-arrow,.semi-popover-wrapper[x-placement=topRight].semi-popover-with-arrow{min-width:36px}.semi-popover-wrapper[x-placement=leftTop] .semi-popover-icon-arrow{height:24px;right:-7px;top:6px;width:8px}.semi-popover-wrapper[x-placement=leftTop] .semi-popover-with-arrow,.semi-popover-wrapper[x-placement=leftTop].semi-popover-with-arrow{min-height:36px}.semi-popover-wrapper[x-placement=left] .semi-popover-icon-arrow{height:24px;right:-7px;top:50%;-webkit-transform:translateY(-50%);transform:translateY(-50%);width:8px}.semi-popover-wrapper[x-placement=left] .semi-popover-with-arrow,.semi-popover-wrapper[x-placement=left].semi-popover-with-arrow{min-height:36px}.semi-popover-wrapper[x-placement=leftBottom] .semi-popover-icon-arrow{bottom:6px;height:24px;right:-7px;width:8px}.semi-popover-wrapper[x-placement=leftBottom] .semi-popover-with-arrow,.semi-popover-wrapper[x-placement=leftBottom].semi-popover-with-arrow{min-height:36px}.semi-popover-wrapper[x-placement=rightTop] .semi-popover-icon-arrow{height:24px;left:-7px;top:6px;-webkit-transform:rotate(180deg);transform:rotate(180deg);width:8px}.semi-popover-wrapper[x-placement=rightTop] .semi-popover-with-arrow,.semi-popover-wrapper[x-placement=rightTop].semi-popover-with-arrow{min-height:36px}.semi-popover-wrapper[x-placement=right] .semi-popover-icon-arrow{height:24px;left:-7px;top:50%;-webkit-transform:translateY(-50%) rotate(180deg);transform:translateY(-50%) rotate(180deg);width:8px}.semi-popover-wrapper[x-placement=right] .semi-popover-with-arrow,.semi-popover-wrapper[x-placement=right].semi-popover-with-arrow{min-height:36px}.semi-popover-wrapper[x-placement=rightBottom] .semi-popover-icon-arrow{bottom:6px;height:24px;left:-7px;-webkit-transform:rotate(180deg);transform:rotate(180deg);width:8px}.semi-popover-wrapper[x-placement=rightBottom] .semi-popover-with-arrow,.semi-popover-wrapper[x-placement=rightBottom].semi-popover-with-arrow{min-height:36px}.semi-popover-wrapper[x-placement=bottomLeft] .semi-popover-icon-arrow{left:6px;top:-7px;-webkit-transform:rotate(180deg);transform:rotate(180deg)}.semi-popover-wrapper[x-placement=bottomLeft] .semi-popover-with-arrow,.semi-popover-wrapper[x-placement=bottomLeft].semi-popover-with-arrow{min-width:36px}.semi-popover-wrapper[x-placement=bottom] .semi-popover-icon-arrow{left:50%;top:-7px;-webkit-transform:translateX(-50%) rotate(180deg);transform:translateX(-50%) rotate(180deg)}.semi-popover-wrapper[x-placement=bottom] .semi-popover-with-arrow,.semi-popover-wrapper[x-placement=bottom].semi-popover-with-arrow{min-width:36px}.semi-popover-wrapper[x-placement=bottomRight] .semi-popover-icon-arrow{right:6px;top:-7px;-webkit-transform:rotate(180deg);transform:rotate(180deg)}.semi-popover-wrapper[x-placement=bottomRight] .semi-popover-with-arrow,.semi-popover-wrapper[x-placement=bottomRight].semi-popover-with-arrow{min-width:36px}.semi-popover.semi-popover-rtl{direction:rtl}@-webkit-keyframes semi-tooltip-zoomIn{0%{opacity:0;-webkit-transform:scale(.8);transform:scale(.8)}50%{opacity:1}}@keyframes semi-tooltip-zoomIn{0%{opacity:0;-webkit-transform:scale(.8);transform:scale(.8)}50%{opacity:1}}@-webkit-keyframes semi-tooltip-bounceIn{0%{opacity:0;-webkit-transform:scale(.6);transform:scale(.6)}70%{opacity:1;-webkit-transform:scale(1.01);transform:scale(1.01)}to{-webkit-animation-timing-function:cubic-bezier(.215,.61,.355,1);animation-timing-function:cubic-bezier(.215,.61,.355,1);opacity:1;-webkit-transform:scale(1);transform:scale(1)}}@keyframes semi-tooltip-bounceIn{0%{opacity:0;-webkit-transform:scale(.6);transform:scale(.6)}70%{opacity:1;-webkit-transform:scale(1.01);transform:scale(1.01)}to{-webkit-animation-timing-function:cubic-bezier(.215,.61,.355,1);animation-timing-function:cubic-bezier(.215,.61,.355,1);opacity:1;-webkit-transform:scale(1);transform:scale(1)}}@-webkit-keyframes semi-tooltip-zoomOut{0%{opacity:1}60%{opacity:0;-webkit-transform:scale(.8);transform:scale(.8)}to{opacity:0}}@keyframes semi-tooltip-zoomOut{0%{opacity:1}60%{opacity:0;-webkit-transform:scale(.8);transform:scale(.8)}to{opacity:0}}.semi-tooltip-wrapper{background-color:rgba(var(--semi-grey-7),1);border-radius:var(--semi-border-radius-medium);color:var(--semi-color-bg-0);font-family:Inter,-apple-system,BlinkMacSystemFont,Segoe UI,PingFang SC,Hiragino Sans GB,Microsoft YaHei,Helvetica Neue,Helvetica,Arial,sans-serif;font-size:14px;left:0;line-height:20px;max-width:240px;opacity:0;padding:8px 12px;position:relative;top:0}.semi-tooltip-wrapper-show{opacity:1}.semi-tooltip-trigger{display:inline-block;height:auto;width:auto}.semi-tooltip-with-arrow{align-items:center;box-sizing:border-box;display:flex;justify-content:center}.semi-tooltip-animation-show{-webkit-animation:semi-tooltip-zoomIn .1s cubic-bezier(.215,.61,.355,1);animation:semi-tooltip-zoomIn .1s cubic-bezier(.215,.61,.355,1)}.semi-tooltip-animation-hide{-webkit-animation:semi-tooltip-zoomOut .1s cubic-bezier(.215,.61,.355,1);animation:semi-tooltip-zoomOut .1s cubic-bezier(.215,.61,.355,1)}.semi-tooltip-wrapper .semi-tooltip-icon-arrow{color:rgba(var(--semi-grey-7),1);height:7px;position:absolute;width:24px}.semi-tooltip-wrapper[x-placement=top] .semi-tooltip-icon-arrow{bottom:-6px;left:50%;-webkit-transform:translateX(-50%);transform:translateX(-50%)}.semi-tooltip-wrapper[x-placement=top] .semi-tooltip-with-arrow,.semi-tooltip-wrapper[x-placement=top].semi-tooltip-with-arrow{min-width:36px}.semi-tooltip-wrapper[x-placement=topLeft] .semi-tooltip-icon-arrow{bottom:-6px;left:6px}.semi-tooltip-wrapper[x-placement=topLeft] .semi-tooltip-with-arrow,.semi-tooltip-wrapper[x-placement=topLeft].semi-tooltip-with-arrow{min-width:36px}.semi-tooltip-wrapper[x-placement=topRight] .semi-tooltip-icon-arrow{bottom:-6px;right:6px}.semi-tooltip-wrapper[x-placement=topRight] .semi-tooltip-with-arrow,.semi-tooltip-wrapper[x-placement=topRight].semi-tooltip-with-arrow{min-width:36px}.semi-tooltip-wrapper[x-placement=leftTop] .semi-tooltip-icon-arrow{height:24px;right:-6px;top:5px;width:7px}.semi-tooltip-wrapper[x-placement=leftTop] .semi-tooltip-with-arrow,.semi-tooltip-wrapper[x-placement=leftTop].semi-tooltip-with-arrow{min-height:34px}.semi-tooltip-wrapper[x-placement=left] .semi-tooltip-icon-arrow{height:24px;right:-6px;top:50%;-webkit-transform:translateY(-50%);transform:translateY(-50%);width:7px}.semi-tooltip-wrapper[x-placement=left] .semi-tooltip-with-arrow,.semi-tooltip-wrapper[x-placement=left].semi-tooltip-with-arrow{min-height:34px}.semi-tooltip-wrapper[x-placement=leftBottom] .semi-tooltip-icon-arrow{bottom:5px;height:24px;right:-6px;width:7px}.semi-tooltip-wrapper[x-placement=leftBottom] .semi-tooltip-with-arrow,.semi-tooltip-wrapper[x-placement=leftBottom].semi-tooltip-with-arrow{min-height:34px}.semi-tooltip-wrapper[x-placement=rightTop] .semi-tooltip-icon-arrow{height:24px;left:-6px;top:5px;-webkit-transform:rotate(180deg);transform:rotate(180deg);width:7px}.semi-tooltip-wrapper[x-placement=rightTop] .semi-tooltip-with-arrow,.semi-tooltip-wrapper[x-placement=rightTop].semi-tooltip-with-arrow{min-height:34px}.semi-tooltip-wrapper[x-placement=right] .semi-tooltip-icon-arrow{height:24px;left:-6px;top:50%;-webkit-transform:translateY(-50%) rotate(180deg);transform:translateY(-50%) rotate(180deg);width:7px}.semi-tooltip-wrapper[x-placement=right] .semi-tooltip-with-arrow,.semi-tooltip-wrapper[x-placement=right].semi-tooltip-with-arrow{min-height:34px}.semi-tooltip-wrapper[x-placement=rightBottom] .semi-tooltip-icon-arrow{bottom:5px;height:24px;left:-6px;-webkit-transform:rotate(180deg);transform:rotate(180deg);width:7px}.semi-tooltip-wrapper[x-placement=rightBottom] .semi-tooltip-with-arrow,.semi-tooltip-wrapper[x-placement=rightBottom].semi-tooltip-with-arrow{min-height:34px}.semi-tooltip-wrapper[x-placement=bottomLeft] .semi-tooltip-icon-arrow{left:6px;top:-6px;-webkit-transform:rotate(180deg);transform:rotate(180deg)}.semi-tooltip-wrapper[x-placement=bottomLeft] .semi-tooltip-with-arrow,.semi-tooltip-wrapper[x-placement=bottomLeft].semi-tooltip-with-arrow{min-width:36px}.semi-tooltip-wrapper[x-placement=bottom] .semi-tooltip-icon-arrow{left:50%;top:-6px;-webkit-transform:translateX(-50%) rotate(180deg);transform:translateX(-50%) rotate(180deg)}.semi-tooltip-wrapper[x-placement=bottom] .semi-tooltip-with-arrow,.semi-tooltip-wrapper[x-placement=bottom].semi-tooltip-with-arrow{min-width:36px}.semi-tooltip-wrapper[x-placement=bottomRight] .semi-tooltip-icon-arrow{right:6px;top:-6px;-webkit-transform:rotate(180deg);transform:rotate(180deg)}.semi-tooltip-wrapper[x-placement=bottomRight] .semi-tooltip-with-arrow,.semi-tooltip-wrapper[x-placement=bottomRight].semi-tooltip-with-arrow{min-width:36px}.semi-portal-rtl .semi-tooltip-wrapper,.semi-rtl .semi-tooltip-wrapper{direction:rtl;left:auto;padding-left:12px;padding-right:12px;right:0}.semi-portal{left:0;position:absolute;top:0;width:100%;z-index:1}.semi-portal-inner{background-color:initial;min-width:-webkit-max-content;min-width:max-content;position:absolute}.user-info-container{position:relative}.user-info-content{background-color:#fff;border-radius:10px;padding-bottom:20px;width:320px}.user-info{display:inline-block;min-width:50px}.img-box{height:140px}.img-box,.img-box>img{border-top-left-radius:8px;border-top-right-radius:8px;width:100%}.img-box>img{height:100%}.info-box{line-height:26px;padding:0 16px}.username{font-size:20px;font-weight:600;line-height:28px;margin-bottom:10px}.signature{color:#646a73;margin-bottom:16px}.avatar{border-radius:50%;height:100px;margin-top:-50px;width:100px}.info{display:flex;margin-bottom:16px;width:100%}.desc{color:#646a73;flex:0 0 72px;width:72px}.info-text{color:#1f2329;flex:1 1}a{color:#3370ff;text-decoration:none}.App-header{align-items:center;background-color:#282c34;color:#fff;display:flex;flex-direction:column;font-size:calc(10px + 2vmin);justify-content:center;min-height:100vh}`;
```

#### 插件侧的代码示例：

##### constants.ts

```
// 存放插件的自定义标签export const webComponentName = "plugin-template";
```

##### Index.tsx

```
import React from "react";import ReactDOM from "react-dom/client";import "./index.css";import App from "./App";import { webComponentName } from "./constants";const renderDocument = document.querySelector(webComponentName);const root = ReactDOM.createRoot(  renderDocument?.shadowRoot?.getElementById("root") ??    document.getElementById("root"));root.render(  <React.StrictMode>    <App />  </React.StrictMode>);
```

##### App.tsx

```
import { useEffect, useMemo, useState } from "react";import { Popover, Avatar } from "@douyinfe/semi-ui";import { webComponentName } from "./constants";import "./App.css";function App(props) {  const { userId } = props;  const [userInfo, setUserInfo] = useState({});  useEffect(() => {    // 根据userId获得相关信息    const getUserData = async () => {      await setTimeout(() => {}, 1000);      setUserInfo({        userId,        username: "木子水吉",        bgSrc:          "https://github.com/muzishuiji/demo_resource/blob/main/web_component/bg.png?raw=true",        avatar:          "https://github.com/muzishuiji/demo_resource/blob/main/web_component/avatar.jpeg?raw=true",        signature: "想清楚，表达清楚~",        department: "Lark Productivity Engineering-Frontend",        okr:          "https://xxx.xxx.cn/okr/user/xxx",        email: "xxx.xxx@xxx.com",        city: "杭州",        people:          "https://xxx.xxx.net/person"      });    };    getUserData();  }, [userId]);  const content = useMemo(    () => (      <div class src={userInfo.bgSrc} />        </div>        <div class src={userInfo.avatar} />          <div class>{userInfo.username}</div>          <div class>{userInfo.signature}</div>          <div class>{userInfo.department}</div>          </div>          <div class>              <a href={userInfo.okr}>查看详情</a>            </div>          </div>          <div class>{userInfo.email}</div>          </div>          <div class>{userInfo.city}</div>          </div>          <div class>              <a href={userInfo.okr}>查看详情</a>            </div>          </div>        </div>      </div>    ),    [userInfo]  );  return (    <div class>      <Popover        autoAdjustOverflow={true}        content={content}        contentClass        getPopupContainer={() =>          document            .querySelector(webComponentName)            ?.shadowRoot?.getElementById("root") ??          document.querySelector(".user-info-container")        }      >        <span class>          <Avatar src={userInfo.avatar} />                     {userInfo.username}        </span>      </Popover>    </div>  );}export default App;
```

#### 运行效果

[视频详情](javascript:;)

在学习过程中的一些发现，结合`Web Component`的`Custom Elements`和`Shadow DOM` 确实可以提供一个比较良好的脚本和 CSS 的隔离环境，但使用`Web Component`做隔离的一些缺点：

*   不能帮助你实现沙箱，如果你需要沙箱化模块逻辑代码，需要手动实现或额外引入一些库。
    
*   `Web Component`的 DOM 隔离是把双刃剑，如果是很多模块共用的样式，你需要分别处理加载到对应的子模块使其生效，一个比较明显的是插件内部如果使用除 semi 外的库，在 body 上设置相关 style 会不生效，需要提取出来设置到 shadow dom 的最上层容器上或者手动插入到外层的 body 上。
    
*   子模块和子模块之间是不同的 dom 树，因此每个模块`querySelectorAll`等方法上下文也是单独的，模块之间不能互相`select`到对方的`dom`，需要先获取其他模块的`Web Component`节点，再在其上使用`querySelectorAll`。
    

### 微前端的简单实践

Web Component 在微前端中的简单实践完整代码：

https://codesandbox.io/s/ren-yuan-qia-pian-zu-jian-forked-z9yyb7?file=/src/App.tsx

#### App.js

```
import { useState } from "react";import { Tabs, TabPane } from "@douyinfe/semi-ui";import "./reactTemplate.js";import "./vueTemplate.js";import "./App.css";function App() {  const [userId] = useState("123456789");  return (    <>      <p>        实际使用过程，会根据appid动态获取插件资源的地址，从而请求对应资源的地址      </p>      <Tabs type="line">        <TabPane tab="React App" itemKey="1">          <div class>            <react-app userId={userId} appid="11111"></react-app>          </div>        </TabPane>        <TabPane tab="快速起步" itemKey="2">          <div class>暂不支持，敬请期待~</flutter-app>          </div>        </TabPane>      </Tabs>    </>  );}export default App;
```

#### ReactTemplate.js

```
// 偷个懒，cssText就不请求了import { cssContent } from "./constants";class ReactPluginTemplate extends HTMLElement {  constructor() {    super();    this.shadow = this.attachShadow({      mode: "open"    });    // 给插件搞一个容器    const container = document.createElement("div");    container.id = "root";    // 如果有modal需要作为getPopupcontainer    container.style.position = "relative";    // container.innerHTML = divText;    this.shadow.appendChild(container);    // 插件的style设置不会影响到外部    const style = document.createElement("style");    style.innerText =      "body{backgrount-color: red;}#root{  --semi-shadow-elevated: 0 0 1px rgba(0, 0, 0, .3), 0 4px 14px rgba(0, 0, 0, .1);}";    const styleNode = document.createTextNode(cssContent.toString());    style.appendChild(styleNode);    this.shadow.appendChild(style);  }  connectedCallback() {    // 动态插入插件的打包资源    const script = document.createElement("script");    script.type = "text/javascript";    fetch(      "https://raw.githubusercontent.com/muzishuiji/demo_resource/main/web_component/bundle.js"    )      .then((response) => {        response.text().then((data) => {          script.innerText = `(function (){let __temp_exports__={};with({exports:__temp_exports__}){console.log(document);${data.replace(            /[\r\n]*/[/*](?=# sourceMap "\r\n]*/[/*").*[\r\n]*/g,            ""          )};}return __temp_exports__;})();`;          this.shadow?.appendChild(script);        });      })      .catch((err) => {        console.log(err, "err-----");      });  }  // observedAttributes，定义特定属性变化时，触发attributeChangedCallback函数  static get observedAttributes() {    return ["userId"];  }}if (!window.customElements.get("react-app")) {  window.customElements.define("react-app", ReactPluginTemplate);}
```

#### VueTemplate.js

```
import { vueCssContent } from "./constants";class VuePluginTemplate extends HTMLElement {  constructor() {    super();    this.shadow = this.attachShadow({      mode: "open"    });    // 给插件搞一个容器    const container = document.createElement("div");    container.id = "root";    container.style.position = "relative";    // container.innerHTML = divText;    this.shadow.appendChild(container);    // 插件的style设置不会影响到外部    const style = document.createElement("style");    const styleNode = document.createTextNode(vueCssContent.toString());    style.appendChild(styleNode);    this.shadow.appendChild(style);  }  connectedCallback() {    // 动态插入插件的打包资源    const script = document.createElement("script");    script.type = "text/javascript";    fetch(      "https://raw.githubusercontent.com/muzishuiji/demo_resource/main/web_component/app.js"    )      .then((response) => {        response.text().then((data) => {          script.innerText = `(function (){${data.replace(            /[\r\n]*/[/*](?=# sourceMap "\r\n]*/[/*").*[\r\n]*/g,            ""          )};})();`;          this.shadow?.appendChild(script);        });      })      .catch((err) => {        console.log(err, "fetch err-----");      });    const chunkScript = document.createElement("script");    chunkScript.type = "text/javascript";    fetch(      "https://raw.githubusercontent.com/muzishuiji/demo_resource/main/web_component/chunk.js"    )      .then((response) => {        response.text().then((data) => {          chunkScript.innerText = `(function (){${data.replace(            /[\r\n]*/[/*](?=# sourceMap "\r\n]*/[/*").*[\r\n]*/g,            ""          )};})();`;          this.shadow?.appendChild(chunkScript);        });      })      .catch((err) => {        console.log(err, "fetch err-----");      });  }  // observedAttributes，定义特定属性变化时，触发attributeChangedCallback函数  static get observedAttributes() {    return ["userId"];  }  // 与observedAttributes结合使用  attributeChangedCallback(name, oldValue, newValue) {    if (name === "userId" && oldValue !== newValue) {    }  }}if (!window.customElements.get("vue-app")) {  window.customElements.define("vue-app", VuePluginTemplate);}
```

#### Constans.js

```
// 内容过多省略，前往demo查看完整的css设置export const cssContent = ``; export const vueCssContent =``;
```

#### 运行效果

[视频详情](javascript:;)

### 飞书的人员卡片

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zibYtOpR6wbuWhLkB7iaUq6cwdq6oVpVWzJpILlbEDiavaicTJ1H70PEicvb0ibibQKaKOyRGLW3MtmJcXpg/640?wx_fmt=png)

在飞书，飞书 doc 等很多网站上都能看到的人员卡片, 理论上可以采取类似的实现，使用 Web Component 开发，然后打包成一个独立的 js 文件（类似于 JS SDK），供给各业务方接入。这里就不做详细的探索了，感兴趣的可以试试。

### 跨框架的 UI 组件库

一个简单的想法，感觉可以基于 Web Component 来实现跨框架的 UI 组件库，但还实践过，感觉可以实现一个 semi design 练练手～

Web Component 与框架之间的对比？
-----------------------

Web Component 与框架相比的优势在哪里？

*   不用加载外部模块，轻量
    

Web Component 作为 Web W3C 规范的一部分，被浏览器原生支持，使用时，不需要像 React.js、Vue.js 等引入大体积的 Runtime 文件，所有组件声明、实例化均由浏览器负责，使得最终编译的体积足够小。

*   可以很方便的与其他框架组合使用
    

Web Component 已经被各大框架支持，React 和 Vue 都在自己的官方文档中着重介绍了与 Web Comonent 的相互调用。使用时，可像普通组件一样引入 Web Component 模块，轻松和已有框架整合。

*   易维护，上手成本低
    

Web Component 是 web 规范的一部分，未来应当被大家所熟知，不像框架那样有那么多的概念，当模块更换维护人员，不会有很高的学习成本。

Web Component 的缺点有哪些？

*   兼容性要求
    

Custom Element 定义时使用 ES6 的 Class，无法传递 ES5 的构造函数，需要额外引入 Polyfill 解决问题；

*   一旦定义无法撤回
    

*   无法使用不同的 ES6 Class 定义同名 CustomElement，仅首次定义生效；
    
*   需要解决多团队协作的 CustomElement 命名冲突的问题；
    

*   状态管理
    

*   因为没有 state 的概念，Web Component 组件的内部属性的变化需要监听属性变化的回调事件，手动处理重渲染，心智负担可能会略重一些。
    

感觉 Web Component 想要出线，单纯依赖原生的 API 是远远不够的，能颠覆框架的必然是框架，拥有一个框架需要具备的基础生态（路由解决方案、状态管理、dom 性能优化等）。

一些延伸
----

### Lit

Lit[3] 是 Google 出品的一个用于构建快速、轻量级的 Web Components 库。Lit 的核心是一个消除样板代码的组件基类，它提供`reactive state`、 `scoped styles`和一个小巧、快速、且富有表现力的`declarative template system`。我们可以基于这个库来实现`semi design`那样的组件库。

简单使用示例：

https://codesandbox.io/s/sad-sinoussi-cvlnob?file=/index.html:0-228

```
<html>  <head>    <title>Lit TypeScript Template</title>    <meta charset="UTF-8" />  </head>  <body>    <main-container></main-container>    <script type="module" src="src/mainContainer.ts"></script>  </body></html>
```

```
// src/mainContainer.tsimport { LitElement, html, css } from 'lit';import { customElement } from 'lit/decorators.js';@customElement('main-container')export class LitApp extends LitElement {  static styles = css`    :host {      width: 100px;      height: 100px;      color: red;    }  `;  render() {    return html`      <div>        Hello from Muzishuiji!      </div>    `;  }}
```

### Omi

Omi[4] 是一款基于 Web Component 的相关特性开发的前端跨框架跨平台框架，任何框架可以使用 Omi 自定义元素。感兴趣的朋友可以自行去了解～

点击上方关注

![](https://mmbiz.qpic.cn/mmbiz_gif/JaFvPvvA2J3MKYVlmXC32WtRJEYsPM9zbyZQtPicnOVfKibj5PuaiarJibbQgR5WWf52x1FicLIhiaweLvCoqia0TGibqg/640?wx_fmt=gif)

  

追更不迷路

  

### 参考资料

[1]

Web Components | MDN: _https://developer.mozilla.org/zh-CN/docs/Web/Web_Components_

[2]

Using shadow DOM - Web Components | MDN: _https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM_

[3]

Lit: _https://lit.dev/docs/_

[4]

Omi: _https://github.com/Tencent/omi/blob/master/README.CN.md_