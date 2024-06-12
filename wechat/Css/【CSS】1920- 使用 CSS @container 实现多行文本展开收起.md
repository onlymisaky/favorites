> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/Q0KegvJdaoe2vghA4cgmww)

之前写过这样一篇文章：[CSS 实现多行文本 “展开收起”](http://mp.weixin.qq.com/s?__biz=MzU4MzUzODc3Nw==&mid=2247484409&idx=1&sn=16867c8fd111b6e5c18b5740015d9397&chksm=fda6c2cfcad14bd99bec298d3dd2acf8e919192dc06dde2f60f38c6beb3702f3f7ceb9ca3b50&scene=21#wechat_redirect)，介绍了一些纯 CSS 实现多行文本展开收起的小技巧，非常巧妙，有兴趣的可以回顾一下。

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtIgrXbuPaiceG8ycKqCcBibvyvy4v9xqC0JhhibBMurrdjWgJkyESEIkpbetegJNiaSt1rkwiamoibaZWkw/640?wx_fmt=gif&from=appmsg)

不过展开收起按钮的隐藏和显示采用了 “障眼法”，也就是通过一个伪元素设置和背景相同的颜色覆盖实现的，如下

![](https://mmbiz.qpic.cn/mmbiz_png/xvBbEKrVNtIgrXbuPaiceG8ycKqCcBibvy27eYiaSsBYibbawkNEktKtTKicsZNbNhHxFRjuiaGyG8JCXNhg7LE7Hdaw/640?wx_fmt=png&from=appmsg)

时代在进步，CSS 也在不断发展。 CSS 容器查询 [1] 出来也有一段时间了，能够动态判断容器尺寸，赶紧拿来用一下，发现并没有想象中的那么顺利，甚至还有些难用，一起看看吧

一、简单介绍一下容器查询
------------

CSS 容器查询，顾名思义，就是可以动态查询到容器的尺寸，然后设置不同的样式。

比如有这样一个容器

```
<div class="card">  <h2>欢迎关注前端侦探</h2></div>
```

简单美化一下

```
.card{  display: grid;  place-content: center;  width: 350px;  height: 200px;  background-color: #FFE8A3;  border-radius: 8px;  border: 1px dashed #9747FF;}
```

效果如下

![](https://mmbiz.qpic.cn/mmbiz_png/xvBbEKrVNtIgrXbuPaiceG8ycKqCcBibvyzFekOQlgdQPjAvy0bONiaFIQO3piciawPgo6XQWzzDSiabviclvB9UKgic9Q/640?wx_fmt=png&from=appmsg)

现在这个容器宽度是 `350px`，现在希望在宽度小于 `250px`时文字颜色变为绿色，要怎么做呢？

非常简单，只需要规定一下容器的类型，然后写一个查询语句就行了，关键实现如下

```
.card{  /**/  container-type: size;}@container (width < 250px){  .card h2{    color: #14AE5C;  }}
```

这样在动态改变元素尺寸时就会自动改变颜色了，效果如下

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtIgrXbuPaiceG8ycKqCcBibvycOxic7bbfEmTbY1t1L1v9jrQibStj4lIricibrKcQqOHpSELpkibCjknSQg/640?wx_fmt=gif&from=appmsg)

是不是非常简单？

可事实是这样吗，其实还有很多局限

二、容器查询的局限
---------

主要是有两点局限

第一点，容器查询不可更改容器本身样式，比如像这样，直接改颜色是不生效的

```
.card{  /**/  container-type: size;}@container (width < 250px){  .card{    color: #14AE5C;  }}
```

白白浪费了一层标签。

也无法通过`:has`去匹配父级

```
.card{  /**/  container-type: size;}@container (width < 250px){  body:has(.card h2){    color: #14AE5C;  }}
```

还有一点问题更大，容器必须手动指明尺寸，不可以由内容撑开，也就是自适应内容尺寸，比如我们将上面的宽高去除

![](https://mmbiz.qpic.cn/mmbiz_png/xvBbEKrVNtIgrXbuPaiceG8ycKqCcBibvyg1agWwuchltrAgYaPaI6jXVHCQOgtD8U0c9ZiczLbaj1SHUFdl0OzWQ/640?wx_fmt=png&from=appmsg)

可以看到，在设置成容器查询类型后，**「容器的宽高都变成了 0」**，必须手动设置宽高

所以，在实际应用中，必须要想办法规避这两个问题。

三、多行文本展开收起中的应用
--------------

现在回头看多行文本的例子，通过之前的文章，我们可以很 “轻松” 的实现这样一个布局，如果不太清楚的可以回顾一下，这里就不多描述了

```
<div class="text-wrap">  <div class="text-content">    <label class="expand"><input type="checkbox" hidden></label>    欢迎关注前端侦探，这里有一些有趣的、你可能不知道的HTML、CSS、JS小技巧技巧。  </div></div>
```

相关样式如下

```
.text-wrap{  display: flex;  position: relative;  width: 300px;  padding: 8px;  outline: 1px dashed #9747FF;  border-radius: 4px;  line-height: 1.5;  text-align: justify;  font-family: cursive;}.expand{  font-size: 80%;  padding: .2em .5em;  background-color: #9747FF;  color: #fff;  border-radius: 4px;  cursor: pointer;}.expand::after{  content: '展开';}.text-content{  display: -webkit-box;  -webkit-box-orient: vertical;  -webkit-line-clamp: 3;  overflow: hidden;}.text-content::before{  content: '';  float: right;  height: calc(100% - 24px);}.expand{  float: right;  clear: both;  position: relative;}.text-wrap:has(:checked) .text-content{  -webkit-line-clamp: 999;}.text-wrap:has(:checked) .expand::after{  content: '收起';}
```

这样就得到了一个 “右下角” 可以展开收起的布局，不过目前按钮是始终可见的

![](https://mmbiz.qpic.cn/mmbiz_png/xvBbEKrVNtIgrXbuPaiceG8ycKqCcBibvyOziaOQuGB6kAiacgnegDWbkoZMjsibO4K6K3icfGU5WKfx8Xg56jy5CpBg/640?wx_fmt=png&from=appmsg)

我们尝试用容器查询来判断一下

```
.text-wrap{  /**/  container-type: size;}
```

结果... 高度都变成了 0

![](https://mmbiz.qpic.cn/mmbiz_png/xvBbEKrVNtIgrXbuPaiceG8ycKqCcBibvyyvPRxFjBbBWvTY06JNRDbWrAhfrqFsMvKGxNCoMsJE5NlKZIZXdqWA/640?wx_fmt=png&from=appmsg)

所以直接添加是不行的

有什么办法可以让容器查询可以自适应内容高度呢？我这里想到的办法是，外层用一个自适应内容高度的容器，然后容器查询盒子用绝对定位的方式，高度跟随外层，原理如下

![](https://mmbiz.qpic.cn/mmbiz_png/xvBbEKrVNtIgrXbuPaiceG8ycKqCcBibvyNYhhzLbPLbV3iaibx2bObuiaC1szZS2fDM8FTew6Gs0skRUTTbhD8TicWQ/640?wx_fmt=png&from=appmsg)

因此，我们需要添加两层，一层作为自适应内容的容器，一层作为容器查询盒子，自适应内容的文本可以用伪元素来代替，和真实内容保持一致就行了

```
<div class="text-wrap">    <div class="text" title="欢迎关注前端侦探，这里有一些有趣的、你可能不知道的HTML、CSS、JS小技巧技巧。">      <div class="text-size">        <div class="text-flex">          <div class="text-content">            <label for="check" class="expand"><input type="checkbox" id="check" hidden></label>            欢迎关注前端侦探，这里有一些有趣的、你可能不知道的HTML、CSS、JS小技巧技巧。          </div>        </div>      </div>    </div>  </div>
```

然后把`.text-size`座位容器查询盒子

```
.text-size{  position: absolute;  inset: 0;  container-type: size;}@container (height <= 4.5em) {  .text-size .expand{    display: none;  }}
```

虽然现在有点乱，但容器查询已经生效了，在小于等于`4.5em`（3 行）的时候，右下角按钮已经消失了

![](https://mmbiz.qpic.cn/mmbiz_png/xvBbEKrVNtIgrXbuPaiceG8ycKqCcBibvyibzhrv2XxWV2hhpeOVU5Fdj2hiaj3hYQFub7GzLNpBfQgnPhXibjqYAKw/640?wx_fmt=png&from=appmsg)

如果隐藏占位伪元素，其实是这样的

![](https://mmbiz.qpic.cn/mmbiz_png/xvBbEKrVNtIgrXbuPaiceG8ycKqCcBibvyALH7013bFKyIju7ibnfVIjGxOfhTjbFa4DnFGsoPibWW618KNPECHK4g/640?wx_fmt=png&from=appmsg)

空出一大段空白确实不雅，由于我们需要查询的高度是最大高度，所以外层自适应高度不能再变了，相当于 `JS` 中的 `scrollHeight`，因此，这层容器需要设置绝对定位，从而不影响最外层容器

```
.text{  position: absolute}
```

同时将占位伪元素隐藏后，效果如下

![](https://mmbiz.qpic.cn/mmbiz_png/xvBbEKrVNtIgrXbuPaiceG8ycKqCcBibvynpQphtpibBAt56tPic4DkXolWJ9E8yiag7Js6pKiaYwp5XXNZcAq3qCLnQ/640?wx_fmt=png&from=appmsg)

现在高度都回到了 0，因此我们需要额外一份文本来自适应最外层容器，而且也能展开收起

```
<div class="text-wrap">  <div class="text" title="欢迎关注前端侦探，这里有一些有趣的、你可能不知道的HTML、CSS、JS小技巧技巧。">    <div class="text-size">      <div class="text-flex">        <div class="text-content">          <label class="expand"><input type="checkbox" hidden></label>          欢迎关注前端侦探，这里有一些有趣的、你可能不知道的HTML、CSS、JS小技巧技巧。        </div>      </div>    </div>  </div>  <div class="text-content text-place">    欢迎关注前端侦探，这里有一些有趣的、你可能不知道的HTML、CSS、JS小技巧技巧。  </div></div>
```

我们只需要它的高度，所以可以设置为不可见

```
.text-place{  visibility: hidden;}
```

这样容器的高度其实是由`text-place`这一层撑开的，效果如下

![](https://mmbiz.qpic.cn/mmbiz_png/xvBbEKrVNtIgrXbuPaiceG8ycKqCcBibvy868jTlEc41C0S7micfBgVeETEicLdWLWb9hP8RysG82bNgmLteg3ecCg/640?wx_fmt=png&from=appmsg)

总算实现了动态查询自适应文本容器高度，效果如下

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtIgrXbuPaiceG8ycKqCcBibvyHFNibxf8YPIopowpL8SvMDr3KmsaTXgRaseIyGEsuQdQibdibF6rOytEQ/640?wx_fmt=gif&from=appmsg)

还有很多细节，可以查看以下 demo

*   CSS @container clamp (juejin.cn)[2]
    
*   CSS @container clamp (codepen.io)[3]
    

四、总结：容器查询还是不太适合
---------------

总的来说，容器查询并没有想象中那么 “好用”，甚至有些难用，也有可能使用过场景并不在这里，虽然最终勉强实现了，但是代价太大了，多了两份相同的文本内容，`HTML`结构也复杂了好多。下面总结一下

1.  容器查询可以根据容器的尺寸匹配不同的样式
    
2.  容器查询并没有那么 “好用”，有两个局限性
    
3.  一个是容器查询不可更改容器本身样式，导致白白浪费一层标签
    
4.  还有一个是容器必须手动指明尺寸，不可以由内容撑开，也就是自适应内容尺寸，否则容器尺寸就是 0
    
5.  为了规避容器查询的局限性，使用一层额外的文本充当容器查询
    
6.  使用另一层额外的文本来撑开最外层容器
    

仅仅作为尝试，实际并不推荐，最终结构还是过于复杂，3 份相同的内容有些过于冗余，其实`HTML`结构实现到右下角按钮那里就可以了，动态高度还是交给 `JS`去判断吧。最后，如果觉得还不错，对你有帮助的话，欢迎点赞、收藏、转发 ❤❤❤

[1] 容器查询： _https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Container_Queries_

[2]CSS @container clamp (juejin.cn)： _https://code.juejin.cn/pen/7312418754502066214_

[3]CSS @container clamp (codepen.io)： _https://codepen.io/xboxyan/pen/oNmRbvR_