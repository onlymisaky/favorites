> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/Kb1K_IJ4GSUSwINSs9NIAg)

CSS 中你可能不知道的 Selectors 特性
=========================

> 本文作者为奇舞团前端开发工程师

引言
--

最近看了 2022 年全球 CSS 调查报告，发现了一些不常见的伪类和伪元素。

伪类
--

### :has()

html

```
<div><br style="visibility: visible;">  <h1>H1</h1><br style="visibility: visible;">  <h2>H2</h2><br style="visibility: visible;">  <p>h1{margin: 0 0 0.25rem 0}</p><br style="visibility: visible;"></div><br style="visibility: visible;">
```

css

```
 h1, h2 {<br style="visibility: visible;">  margin: 0 0 1.0rem 0;<br style="visibility: visible;"> }<br style="visibility: visible;"><br style="visibility: visible;"> h1:has(+ h2) { // h1后面相邻兄弟元素是h2时
  margin: 0 0 0.25rem 0;
 }
```

### :is()

html

```
<div>
  <h1>H1</h1>
  <h2>H2</h2>
  <h3>H3</h3>
  <h4>H4</h4>
  <p>h1、h2和h3 {margin: 0 0 0.25rem 0}</p>
</div>
```

css

```
 h1, h2, h3 {
  margin: 0 0 1.0rem 0;
 }

 :is(h1, h2, h3):has(+ :is(h2, h3, h4)) { // h1 or h2 or h3 后面相邻兄弟是 h2 or h3 or h4 时
  margin: 0 0 0.25rem 0;
 }
```

### :host

html

```
<!DOCTYPE html><html>  <head>    <meta charset="utf-8">     <title>:host</title>  </head>  <body>    <my-component></my-component>    <script>      let shadow = document.querySelector("my-component").attachShadow({ mode: "open"})      let styleEle = document.createElement("style")      styleEle.textContent = `        :host{          display: block;          margin: 20px;          width: 500px;          height: 300px;          border: 3px solid green;        }        :host div {          font-size: 30px;          border: 2px solid blue;        }      `      let headerEle = document.createElement("div");      headerEle.innerText = "选取内部使用该部分 CSS 的 Shadow host 元素，其实也就是自定义标签元素。(注意：:host 选择器只在 Shadow DOM 中使用才有效果。)";      shadow.appendChild(headerEle);      shadow.appendChild(styleEle);    </script>  </body></html>
```

![](https://mmbiz.qpic.cn/mmbiz_jpg/cAd6ObKOzEDicC6D1oP8YsBO84BB0e0uM9DiazRia6ZXTyGb5H712DJQ0lflLjGIXaKgC2UbwrjxtDpYoZaUWrLPA/640?wx_fmt=jpeg)host

### :host()

html

```
<!DOCTYPE html><html>  <head>    <meta charset="utf-8">     <title>:host()伪类函数</title>  </head>  <body>    <my-component class="my-component"></my-component>    <my-component></my-component>    <script>      class MyComponent extends HTMLElement {        constructor () {          super();          this.shadow = this.attachShadow({mode: "open"});          let styleEle = document.createElement("style");          styleEle.textContent = `            :host(.my-component){              display: block;              margin: 20px;              width: 300px;              height: 200px;              border: 3px solid green;            }            :host .component-header{              border: 2px solid yellow;              padding:10px;              background-color: grey;              font-size: 16px;              font-weight: bold;            }          `;          this.shadow.appendChild(styleEle);          let headerEle = document.createElement("div");          headerEle.className = "component-header";          headerEle.innerText = ":host() 的作用是获取给定选择器的 Shadow Host。(注：:host() 的参数是必传的，否则选择器函数失效)";          this.shadow.appendChild(headerEle);        }      }        window.customElements.define("my-component", MyComponent);      </script>  </body></html>
```

![](https://mmbiz.qpic.cn/mmbiz_jpg/cAd6ObKOzEDicC6D1oP8YsBO84BB0e0uMJlicsasibQAwWfUvUJaYcD2ULKvyFPHXvtFw1K659Gqe1QNO6DF3VORQ/640?wx_fmt=jpeg)host

### :host-textContent()

html

```
<!DOCTYPE html><html>  <head>    <meta charset="utf-8">     <title>:host-textContent()伪类函数</title>  </head>  <body>    <div id="container">      <my-component></my-component>    </div>    <my-component></my-component>    <script>      class MyComponent extends HTMLElement {        constructor () {          super();          this.shadow = this.attachShadow({mode: "open"});          let styleEle = document.createElement("style");          styleEle.textContent = `            :host-context(#container){              display: block;              margin: 20px;              width: 300px;              height: 200px;              border: 3px solid green;            }            :host .component-header{              border: 2px solid yellow;              padding:10px;              background-color: #4caf50;              font-size: 16px;              font-weight: bold;            }          `;          this.shadow.appendChild(styleEle);          let headerEle = document.createElement("div");          headerEle.className = "component-header";          headerEle.innerText = ":host-context() 用来选择特定祖先内部的自定义元素，祖先元素选择器通过参数传入。(注：:host-context() 的参数是必传的，否则选择器函数失效)";          this.shadow.appendChild(headerEle);        }      }          window.customElements.define("my-component", MyComponent);        </script>  </body></html>
```

效果：![](https://mmbiz.qpic.cn/mmbiz_jpg/cAd6ObKOzEDicC6D1oP8YsBO84BB0e0uMRwj2HLIJqLZt008RbNPpIQzdoe7Fkuwd688oFLGBDIQ2OfaujNPu2w/640?wx_fmt=jpeg)

### :in-range & :out-of-range

html

```
<style>  input {    width: 180px;    height: 32px;    color: white;    font-weight: bold;    font-size: 20px;  }  input:in-range {    background: yellowgreen;  }  input:out-of-range {    background-color: brown;  }</style><p>:in-range 输入的值在指定区间内时，设置指定样式</p><p>:out-of-range 输入的值在指定区间外时，设置指定样式</p><input type="number" min="5" max="10" value="7" /><input type="number" min="5" max="10" value="3" />
```

效果：![](https://mmbiz.qpic.cn/mmbiz_jpg/cAd6ObKOzEDicC6D1oP8YsBO84BB0e0uMuwJhTVyIXLfzfBqHUS9hic1TUzIUkYDozHZnl8t57yYARoN4GKfNT5g/640?wx_fmt=jpeg)

### :root

html

```
<style>  :root {    --green: #9acd32;    --font-size: 14px;    --font-family-sans-serif: -apple-system, BlinkMacSystemFont;  }  body {    color: var(--green);    font-size: var(--font-size);    font-family: var(--font-family-sans-serif);  }</style><div>  :root中声明相当于全局属性，页面可以使用var()来引用</div>
```

## 伪元素

### ::first-letter

html

```
<style>
  p::first-letter {
    font-size: 1.5rem;
    font-weight: bold;
    color: brown;
  }
</style>

<p>Scientists exploring the depths of Monterey Bay unexpectedly encountered a rare and unique species of dragonfish. This species is the rarest of its species.</p>

<p>中文字体时.</p>
```

结果：![](https://mmbiz.qpic.cn/mmbiz_jpg/cAd6ObKOzEDicC6D1oP8YsBO84BB0e0uMUFOcAqwd5VUw3NpS7lZJ5abOqiadBpBGQjdhBb2GU6VrfRuR4cDVmNA/640?wx_fmt=jpeg)

### ::placeholder 设置 placeholder 的样式

### ::selection 鼠标选中文本的样式

## 总结

*   :host 范围最大，匹配所有的自定义元素实例；
    
*   :host() 只选择自身包含特定选择器的自定义元素；
    
*   :host-context() 选择拥有特定选择器父元素的自定义元素。
    

## 参考资料 mdn web docs

2022 年全球 CSS 调查报告

- END -

关于奇舞团
-----

奇舞团是 360 集团最大的大前端团队，代表集团参与 W3C 和 ECMA 会员（TC39）工作。奇舞团非常重视人才培养，有工程师、讲师、翻译官、业务接口人、团队 Leader 等多种发展方向供员工选择，并辅以提供相应的技术力、专业力、通用力、领导力等培训课程。奇舞团以开放和求贤的心态欢迎各种优秀人才关注和加入奇舞团。

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEBLicibtcprJISN18FgTtg2N1ichPnMqRhicrP20VfwnC4vday7gtEoiaSynIH1bas4N5kgicliakrLdtT2Q/640?wx_fmt=png)