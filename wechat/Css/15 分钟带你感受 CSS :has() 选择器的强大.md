> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/RouM9h_IUuYOX0k60PCDnQ)

```
点击上方 程序员成长指北，关注公众号

回复1，加入高级Node交流群

```

最近看到了许多关于 `:has()` 选择器的知识点，在此总结下来。

MDN 对 `:has()` 选择器 的解释是这样的：

> CSS 函数式伪类 [1]  **`:has()`**  表示一个元素，如果作为参数传递的任何相对选择器 [2] 在锚定到该元素时，至少匹配一个元素。这个伪类通过把可容错相对选择器列表 [3] 作为参数，提供了一种针对引用元素选择父元素或者先前的兄弟元素的方法。

下面一起来感受下 `:has()` 选择器的强大之处吧。

`:has()` 选择器选择父元素和前面的兄弟元素
-------------------------

邻接兄弟选择器（`+`）用来选中恰好处于另一个在继承关系上同级的元素旁边的物件。例如，选中所有紧随`<p>`元素之后的`<img>`元素：

```
p + img


```

通用兄弟关系选择器（`~`）用来选中一个元素**后面的**所有兄弟元素。例如，选中`<p>`元素之后的所有的`<img>`元素：

```
p ~ img


```

css 并没有提供直接选择父元素或者前面的兄弟元素的选择器，但 `:has()` 可以做到这点。

1、比如选择所有包含 `<p>`元素的父元素：

```
:has(p)


```

2、选择直接后代元素包含 `<p>`元素的父元素：

```
:has(> p)


```

3、选择直接后代元素包含 `<p>`元素的父级标签名是 `div` 父元素：

```
div:has(> p)


```

4、选择 `<p>`元素的相邻的前一个标签名是 `div` 的兄弟元素:

```
div:has(+ p)


```

5、选择 `<p>`元素的前面所有标签名是 `div` 的兄弟元素:

```
div:has(~ p)


```

`:has()` 选择器中的 `且` 和 `或`
------------------------

在 `:has()` 选择器中表示 `且` 和 `或` 很简单，例如：

`p:has(.a):has(.b)` 表示选择同时包含子元素 `a` 和 子元素 `b` 的 元素 `p`

`p:has(.a, .b)` 表示选择包含子元素 `a` 或者包含子元素 `b` 的 元素 `p`

`:has()` 选择器选择一个范围内的元素
----------------------

现在有如下元素

```
<div>
  <h2>标题开始（选择第一行字体为绿色，最后一行字体为红色）</h2>
  <p>h2中间第一行</p>
  <h4>h2中间第二行</h4>
  <h5>h2中间最后一行</h5>
  <h2>标题结束</h2>
</div>


```

要求选择第一行字体为绿色，最后一行字体为红色。需要注意的是，`中间元素可以是任意的`。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/yRIqhMamWtT8JicT7RnwFYChLjkexVjTkGFiaXuJD3RUwB2uGjTyb4weMdaafY0WJgjU1p5WpDKMFhODSvMibNUkw/640?wx_fmt=other&from=appmsg)cc.png

使用 :has() 实现上面效果，可以这么做

```
/* 选择 h2 中间第一行 */
h2 + :has(~ h2){
  color:green;
}
/* 选择 h2 中间最后一行 */
h2 ~ :has(+ h2){
  color:red;
}


```

`h2 + :has(~ h2)` 表示选择紧跟着 `h2` 的并且后面还有 `h2` 元素的兄弟元素。也就选择到了 `h2` 范围内的第一个元素。

`h2 ~ :has(+ h2)` 表示选择 `h2` 后面的兄弟元素，并且该兄弟元素的下一个兄弟元素是 `h2`，也就选择到了 `h2` 范围内最后一个元素

那如果要选择中间所有元素呢，可以这样做

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/yRIqhMamWtT8JicT7RnwFYChLjkexVjTkibKVV04t4AsqTFnjn0AzwlmBQOIaEQrlZm9QLczVXUJjiacqSHFB7ESA/640?wx_fmt=other&from=appmsg)dd.png

```
/* 选择 hr 中间所有行 */
hr ~ :has(~ hr){
  color:blue;
}


```

`:has()` 选择器的应用
---------------

#### 1、CSS :has() 选择器之星级评分

关于星级评分，之前写过一篇文章分享过 三种方式使用纯 CSS 实现星级评分 [4]。

这里介绍下使用 `:has() 选择器 + :not() 选择器` 实现星级评分的方式。

星级评分效果包括鼠标滑入和点击，滑入或点击到第几颗星的位置，该位置之前的星高亮，之后的星不高亮或者有高亮的则取消高亮；

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/yRIqhMamWtT8JicT7RnwFYChLjkexVjTkgtUzWp9zbBh0fibmnaZbxfZlPTsu6iblrENRpcxuYoOcxEYTkDz8LgSQ/640?wx_fmt=other&from=appmsg)star.webp

html 结构

```
<div>
  <input type="radio" >
  <label for="radio1">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" style=""><path fill="currentColor" d="M283.84 867.84 512 747.776l228.16 119.936a6.4 6.4 0 0 0 9.28-6.72l-43.52-254.08 184.512-179.904a6.4 6.4 0 0 0-3.52-10.88l-255.104-37.12L517.76 147.904a6.4 6.4 0 0 0-11.52 0L392.192 379.072l-255.104 37.12a6.4 6.4 0 0 0-3.52 10.88L318.08 606.976l-43.584 254.08a6.4 6.4 0 0 0 9.28 6.72z"></path></svg>
  </label>
  <input type="radio" >
  <label for="radio2">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" style=""><path fill="currentColor" d="M283.84 867.84 512 747.776l228.16 119.936a6.4 6.4 0 0 0 9.28-6.72l-43.52-254.08 184.512-179.904a6.4 6.4 0 0 0-3.52-10.88l-255.104-37.12L517.76 147.904a6.4 6.4 0 0 0-11.52 0L392.192 379.072l-255.104 37.12a6.4 6.4 0 0 0-3.52 10.88L318.08 606.976l-43.584 254.08a6.4 6.4 0 0 0 9.28 6.72z"></path></svg>
  </label>
  <input type="radio" >
  <label for="radio3">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" style=""><path fill="currentColor" d="M283.84 867.84 512 747.776l228.16 119.936a6.4 6.4 0 0 0 9.28-6.72l-43.52-254.08 184.512-179.904a6.4 6.4 0 0 0-3.52-10.88l-255.104-37.12L517.76 147.904a6.4 6.4 0 0 0-11.52 0L392.192 379.072l-255.104 37.12a6.4 6.4 0 0 0-3.52 10.88L318.08 606.976l-43.584 254.08a6.4 6.4 0 0 0 9.28 6.72z"></path></svg>
  </label>
  <input type="radio" >
  <label for="radio4">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" style=""><path fill="currentColor" d="M283.84 867.84 512 747.776l228.16 119.936a6.4 6.4 0 0 0 9.28-6.72l-43.52-254.08 184.512-179.904a6.4 6.4 0 0 0-3.52-10.88l-255.104-37.12L517.76 147.904a6.4 6.4 0 0 0-11.52 0L392.192 379.072l-255.104 37.12a6.4 6.4 0 0 0-3.52 10.88L318.08 606.976l-43.584 254.08a6.4 6.4 0 0 0 9.28 6.72z"></path></svg>
  </label>
  <input type="radio" >
  <label for="radio5">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" style=""><path fill="currentColor" d="M283.84 867.84 512 747.776l228.16 119.936a6.4 6.4 0 0 0 9.28-6.72l-43.52-254.08 184.512-179.904a6.4 6.4 0 0 0-3.52-10.88l-255.104-37.12L517.76 147.904a6.4 6.4 0 0 0-11.52 0L392.192 379.072l-255.104 37.12a6.4 6.4 0 0 0-3.52 10.88L318.08 606.976l-43.584 254.08a6.4 6.4 0 0 0 9.28 6.72z"></path></svg>
  </label>
</div>


```

为了使星星有点击效果，利用 `radio + label` 的方式实现点击效果；label 代表星星。

当点击星星时，高亮当前星星

```
input:checked + label{
    color:gold;
}


```

当鼠标移入星星时，高亮当前星星，并且该位置之后的星星取消高亮；

```
label:hover{
  color:gold;
  & ~ label{
    color:#ccc!important;
  }
}


```

让当前位置之前的所有星星也高亮，可以利用 :not ，排除掉当前位置和当前位置之后的星星。

```
label:not(:hover,:hover ~ *){
  color:gold;
}


```

并且只有鼠标滑入时添加这些效果。

```
div:has(label:hover) label:not(:hover,:hover ~ *){
  color:gold;
}


```

同样，当点击星星时，点亮当前选择的之前所有的星星也如此

```
div:has(input:checked) label:not(input:checked ~ label){
  color:gold;
}


```

完整示例 [5]

#### 2、CSS :not 和 :has() 模拟 :only-of-type

有下面的 `html` 结构

```
<div>
  <p>第一页</p>
  <p class="this">第二页</p>
  <p>第三页</p>
  <p>第四页</p>
</div>


```

要选择类名为 `this` 的元素，并设置颜色为红色，使用 `.this{color:red;}` 可以轻松做到。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/yRIqhMamWtT8JicT7RnwFYChLjkexVjTkNY4TLI1CbJLKhic0CzSEPbs2hfXvsc9MfSn4JYQFgH3pDluoXBFRaLw/640?wx_fmt=other&from=appmsg)aa.png

如果现在有两个 `div` 元素块

```
<div>
  <p>第一页</p>
  <p class="this">第二页</p>
  <p>第三页</p>
  <p>第四页</p>
</div>

<div>
  <p>第一页</p>
  <p class="this">第二页</p>
  <p class="this">第三页</p>
  <p>第四页</p>
</div>


```

现要求选择 div 的子元素中只有含有一个类名为 this 的元素（也就是第一个 div 元素块），并且设置其颜色为红色，该怎么做呢？

`:only-of-type` 代表了任意一个元素，这个元素没有其他相同类型的兄弟元素。

但 :only-of-type 判断是否有相同类型的依据是**标签名**，而不是类名。所以并不能达到想要的效果。

```
//这种写法是无效的，无法判断元素有没有其他相同的类名。
.this:only-of-type {
    color:red;
}

//这种写法是有效的，但判断的是没有相同的 p 的元素，显然无法满足上面的要求，但能匹配下面 ul 中的 p
p:only-of-type {
    color:red;
}

<ul>
  <li>第一页</li>
  <li class="this">第二页</li>
  <li class="this">第三页</li>
  <p>第四页</p>
</ul>


```

而 :has 能做到，要选择前后没有相同类名的元素 ，也就是排除前后的 .this 。

排除前面的 .this

```
// 表示选择前面没有 .this 的 .this
.this:not(.this ~)


```

排除后面的 .this,

```
// 表示排除后面有 .this 的 .this
.this:not(:has(~ .this))


```

两个做并集，也就选择到了唯一的 .this

```
.this:not(:has(~ .this)):not(.this ~ *){
  color:red;
}


```

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/yRIqhMamWtT8JicT7RnwFYChLjkexVjTkQWmDlfp2l8wzVSocB358Wgf1N8yKqhX5ZAdnfAbRQ4f335FdoqiccBg/640?wx_fmt=other&from=appmsg)bb.png

完整示例 [6]

#### 3、CSS :has() 选择器之模仿 mac 电脑 dock 栏 [7]

利用 :has() 可以选择到前面的兄弟元素的特点，还能做出下面的动画效果

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/yRIqhMamWtT8JicT7RnwFYChLjkexVjTkJhTgic5AibEaAkby7thgC1EyMZbOvY0H5cbKfC75wlQ1tjKEcl6HHicwg/640?wx_fmt=other&from=appmsg)aa.gif

当鼠标滑入到一个元素时，该元素放大，该元素的前一个元素和后一个元素缩小，除了这三个元素之外的其他元素缩的更小并且有一定透明度；

html 结构如下

```
<div class="box">
  <div class="son">乔丹</div>
  <div class="son">科比</div>
  <div class="son">詹姆斯</div>
  <div class="son">奥尼尔</div>
  <div class="son">邓肯</div>
  <div class="son">卡特</div>
  <div class="son">麦迪</div>
  <div class="son">艾弗森</div>
  <div class="son">库里</div>
  <div class="son">杜兰特</div>
</div>


```

关键 css 代码

```
.son{
    ...
    ...
    ...
    &:hover{
      background-color:#67c23a;
      transform:scale(1.4);
      & + .son{
        transform:scale(1.1); // 后一个相邻的兄弟元素
      }
    }
  }


```

让前一个元素也缩放为原来的 1.1

```
// 选择存在 后一个相邻的被hover的兄弟元素 的元素
.son:has( + .son:hover){
  transform:scale(1.2);
}


```

然后对这三个元素之外的其他元素缩放为原来的 0.8

```
.box:has(.son:hover) .son:not(:hover, :has(+ :hover), .son:hover + *) {
  transform:scale(0.8);
  opacity:0.7;
}


```

`.box:has(.son:hover)` 表示选择子元素 `son` 被 `hover` 时的 `.box`

`.son:not(:hover, :has(+ :hover), .son:hover + *)` 表示排除 `son` 元素里面被 `hover` 的元素，被 `hover` 的元素的前一个邻接的兄弟元素，被 `hover` 的元素的后一个邻接的兄弟元素；

完整示例 [8]

#### 4、CSS :has() 选择器之单选题

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/yRIqhMamWtT8JicT7RnwFYChLjkexVjTkUxkrxl6vq6gr7Mx6dxRxRFUsL9FROvoibsYNpZ5IHpzwricjZO3bC2ng/640?wx_fmt=other&from=appmsg)bb.gif

这是个有趣的应用，当选择的是错误的选项时，选择题的标题和当前选择项标红。并且会给正确的选项添加动画效果提示用户这才是正确选项。

这里用 `data-correct="false"` 表示错误的选项，`data-correct="true"` 表示正确的选项。

```
<input type="radio"  />
<label for="option1">Responsive design</label>

<input type="radio"  />
<label for="option2">Responsive design</label>

<input type="radio"  />
<label for="option3">Responsive design</label>


```

选择错误选项时，标红当前选项。选择正确选项时标绿当前选项。

```
.question{
  --correct: #5ed235; // 正确选项的颜色
  --wrong: #f83d56; // 错误选项的颜色
  --wrong-bg: rgba(248 ,61, 86,0.8);
  --correct-bg: rgb(94 ,210, 53,0.8);
}

input[data-correct="false"]:checked + label{
  color: #fff;
  background-color: var(--wrong);
  border-color: var(--wrong);
}
input[data-correct="true"]:checked + label{
  color: #fff;
  background-color: var(--correct);
  border-color: var(--correct);
}


```

选择错误选项时，标红标题；这里用 `:has` 选择器获取子元素中有错误选项选中时。

```
.question:has(input[data-correct="false"]:checked) {
  .questionHeader {
    box-shadow: inset 0 7px 0 0 var(--wrong);
    background-color: var(--wrong-bg);
  }
}


```

并且给正确选项增加提示动画

```
.question:has(input[data-correct="false"]:checked) {
  input[data-correct="true"] + label {
    animation: flash 2s infinite;
  }
}

@keyframes flash {
  0% {
    background-color: white;
  }
  25% {
    background-color: #5ed235;
  }
  50% {
    background-color: white;
  }
  75% {
    background-color: #5ed235;
  }
  100% {
    background-color: white;
  }
}


```

选择正确选项时，标绿标题；

```
.question:has(input[data-correct="true"]:checked) {
  .questionHeader {
    box-shadow: inset 0 7px 0 0 var(--correct);
    background-color: var(--correct-bg);
  }
}


```

完整示例 [9]

总结
--

本文介绍了 `:has()` 选择器的基本用法以及四个实际应用；

*   选择父元素和前面的兄弟元素
    
*   `:has()` 选择器中的 `且` 和 `或`
    
*   选择一个范围内的元素
    

在 `:has()` 选择器出来之前，使用 `CSS` 是无法直接选择到父级元素和前面的兄弟元素的，但 `:has()` 选择器的出现使这个变成了可能；

如果对本文感兴趣或对你有帮助，麻烦动动你们的发财手，点点赞~

原文: https://juejin.cn/post/7349360925185802251

作者：xingba

标注地址

[1]

https://developer.mozilla.org/zh-CN/docs/Web/CSS/Pseudo-classes

[2]

https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_selectors#relative_selector

[3]

https://developer.mozilla.org/zh-CN/docs/Web/CSS/Selector_list

[4]

https://juejin.cn/post/7345821800880259135

[5]

https://codepen.io/xingba-coder/pen/oNOxodj

[6]

https://codepen.io/xingba-coder/pen/zYXqWoy

[7]

https://codepen.io/xingba-coder/pen/ZEZQyNz

[8]

https://codepen.io/xingba-coder/pen/ZEZQyNz

[9]

https://codepen.io/xingba-coder/pen/LYvGWor

Node 社群

```
我组建了一个氛围特别好的 Node.js 社群，里面有很多 Node.js小伙伴，如果你对Node.js学习感兴趣的话（后续有计划也可以），我们可以一起进行Node.js相关的交流、学习、共建。下方加 考拉 好友回复「Node」即可。

   “分享、点赞、在看” 支持一波👍

```