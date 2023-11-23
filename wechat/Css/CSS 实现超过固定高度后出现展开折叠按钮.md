> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/ADW_WIAObf8KEP_XsBiioA)

在平时开发中，经常会碰到一些需要判断高度的场景，比如当超过一定高度后，需要自动出现展开折叠按钮，如下

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtJrFYEkXnekoiaecn5t0fibk9XujtMpIBc0icISBPOL7kgXFMwA2wD12WAImKbVCqWD026xn4nVxtSZA/640?wx_fmt=gif)

传统的思路肯定是通过`JS`去动态计算容器的高度，但这样就涉及到加载时机的问题，获取早了可能元素还没渲染好，晚了又会有明显的卡顿感，或者会引起页面的闪烁。

那有没有仅通过`CSS`的方法呢？

当然也是有的！要实现上面这个例子的效果，需要解决以下几个问题：

1.  如何判断不同的高度？
    
2.  如何在不同的高度下展示隐藏点击按钮？
    
3.  如何点击切换？
    

花几分钟一起看看吧😁

一、先思考一下布局
---------

明确来讲，`CSS`现在已经有相关方法可以判断高度了，那就是 CSS 容器查询 [1]。不过这个特性太高级了，目前几乎还不能实战，我们这次介绍一种更加传统的方式。

如何判断不同的高度？换句话来说，**什么样的布局在不同的高度下会有截然不同的效果**？

思考一下

🤔

🤔

绝对定位？位置完全固定了，不行。

`flex`布局？好像也只能控制水平方向上

`grid`布局？这个水太深，没来得及研究（可能也行？）

等等，除了以上，还有一个现在都避而不谈的浮动布局，为啥现在都很少用了呢，原因在于**浮动布局非常脆弱**，细小的尺寸变化都能引起整个布局的坍塌。我记得以前用浮动布局的时候，都需要尺寸精确，稍微出一点差错就导致浮动元素不知道跑哪去了...

既然对尺寸非常敏感，是不是和本文的临界高度有一定联系呢？

没错，今天要用到的方式就是**浮动布局**。

二、浮动布局的奥妙
---------

一步一步，来搭建我们所需要的页面雏形。

我们先来看一个有趣的现象，这里有一个容器，里面有`3`个子节点，分别为`A`、`B`、`C`，其中`A`左**浮动**，`B`、`C`**右浮动**

```
<div class="box"> <div class="a">A</div> <div class="b">B</div> <div class="c">C</div></div>
```

```
.a{ width: 100px; height: 100px; float: left; background-color: cadetblue;}.b{ width: 300px; height: 100px; float: right; background-color: coral;}.c{ width: 50px; height: 100px; float: right; background-color: darkgreen;}
```

当横向空间足够时，效果是这样的

![](https://mmbiz.qpic.cn/mmbiz_jpg/xvBbEKrVNtJrFYEkXnekoiaecn5t0fibk9dCuiapPibvpOpuOLgFiab1MfmAsoD5p7lnATb7NQNszzaTFv4MicdNbUicA/640?wx_fmt=jpeg)

image-20230218152108445

此时，`A`贴近左边，`B`贴近右边，`C`贴着`B`

如果横向空间不足，那么`C`就会换行

![](https://mmbiz.qpic.cn/mmbiz_jpg/xvBbEKrVNtJrFYEkXnekoiaecn5t0fibk9GN0zrictibh6J4svlHwxcqcXg0G7pPvAo7ykDVLhJyDmbOMbFl3RYgBA/640?wx_fmt=jpeg)

image-20230218152226257

现在`C`看似好像跑到了`B`的下方，其实是因为`B`的高度还没有超过`A`

当`B`的高度超过`A`时，那么`C`会有如下表现

![](https://mmbiz.qpic.cn/mmbiz_png/xvBbEKrVNtJrFYEkXnekoiaecn5t0fibk9bxInfRqHCaBXfCHFaniczLFH9ibW8SJ4sGFC2uHqib3Ss6EpboDFED6Rw/640?wx_fmt=png)image-20230218152356049

此时，`C`贴在`B`的左侧，`A`的下方

是不是很神奇？除了浮动布局，没有什么方法可以实现这样的效果了吧。😲那么，这和本文的例子有什么关系呢？

别急，其实这是一种极端情况，接着往下看

三、极端情况下的浮动表现
------------

我们可以设置一个极限状态，比如`A`的高度充满容器，`B`的宽度充满容器，此时`B`肯定会掉下来，我们用负的`margin`让`B`仍保持在一行，如下

```
.a{  width: 50px;  height: 100%;}.b{  width；100%；  margin-left: -50px;}
```

![](https://mmbiz.qpic.cn/mmbiz_jpg/xvBbEKrVNtJrFYEkXnekoiaecn5t0fibk9XmVmKqh54DuMGiciausEy4msmmbwUZR5e4lEKII4AibtorWnacnzMqloQ/640?wx_fmt=jpeg)

image-20230218153506242

此时，`B`的高度不高于`A`，所以`C`仍然是贴在`B`的下方，并且靠右。现在让`B`的高度超过`A`，也就是超出容器高度，就变成了这样

![](https://mmbiz.qpic.cn/mmbiz_jpg/xvBbEKrVNtJrFYEkXnekoiaecn5t0fibk9F3cmP8gw1TGf5CHrwo9wic4oicO9T6N9JjrK41pombjVVUKGCpGFzljg/640?wx_fmt=jpeg)

image-20230218153656713

此时，`C`位于`A`的下方。也就是，仅仅因为高度超过了一个临界值，`C`就得到了两种截然不同的位置，如下

![](https://mmbiz.qpic.cn/mmbiz_jpg/xvBbEKrVNtJrFYEkXnekoiaecn5t0fibk9t2QHicMkrqyOensRD3jJalh7g8ZicaQrxhPFkIjYibu3sSwbFxQJwOUsw/640?wx_fmt=jpeg)

image-20230218154221505

下面是动态演示（动态改变 B 的高度）

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtJrFYEkXnekoiaecn5t0fibk9M3tfLW7EstVuBEDjQXQJl0RyqrYnuYyej3HqQUD22KJJ0CZKCTCGVA/640?wx_fmt=gif)

Kapture 2023-02-18 at 15.48.09

试想一下，把`C`当做是 “展开折叠” 按钮，在这个基础上挪动一下`C`的相对位置，移到正下方，是不是就是我们需要的效果了呢？下面的虚线框示意移动后的位置，这样在视区范围内，虚线框在高度不足时就是不可见的，只有在超过固定高度后才可见，示意如下（观察虚线框的位置）

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtJrFYEkXnekoiaecn5t0fibk9PPqpv5n6QDApUhWdehNsR58qib2MxkVC8ZS0GdpdCIibX8vYAFHdj4OA/640?wx_fmt=gif)

Kapture 2023-02-18 at 15.56.02

完整 demo 可以查看以下任意链接

*   float demo (juejin.cn)[2]
    
*   float demo (codepen.io)[3]
    
*   float demo (runjs.work)[4]
    

整个原理就是这样了，下面来看具体实现

四、CSS 具体实现
----------

现在回到最开头的例子，根据前面的 demo 原型，可以改造成以下结构

```
<div class="content">  <pre class="text">        很多内容...        很多内容...  </pre>  <label for="c1" class="btn"></label></div>
```

这里`.text`就相当于`B`，`.btn`就相当于`C`，至于`A`完全可以用伪元素`::before`来代替

由于有点击切换的交互，所以需要用到`input checkbox`，和`label`关联起来，所以结构最终改造成这样

```
<div class="section">  <input class="content-check" type="checkbox" id="c1" hidden>  <div class="content">    <pre class="text">        很多内容...        很多内容...        </pre>    <label for="c1" class="btn"></label>  </div></div>
```

然后加点样式美化一下吧，由于原理和前面是完全一致的，这里就不重复展示具体细节了

```
.content{  width: 400px;  max-height: 200px;  overflow: hidden;  border-radius: 4px;  outline: 2px dashed royalblue;}.section{  display: flex;}pre{  white-space: pre-wrap;}.content::before{  content: '';  width: 100px;  height: 100%;  float: left;}.btn{  float: right;  width: 100px;  text-align: center;  position: relative;  left: calc(50% - 50px);  transform: translateY(-100%);  cursor: pointer;}.btn::after{  content: '';  display: block;  height: 34px;  background-color: #666;  transition: .2s background-color;  -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 512'%3E %3Cpath d='M143 352.3L7 216.3c-9.4-9.4-9.4-24.6 0-33.9l22.6-22.6c9.4-9.4 24.6-9.4 33.9 0l96.4 96.4 96.4-96.4c9.4-9.4 24.6-9.4 33.9 0l22.6 22.6c9.4 9.4 9.4 24.6 0 33.9l-136 136c-9.2 9.4-24.4 9.4-33.8 0z'%3E%3C/path%3E %3C/svg%3E") center/ 24px 24px no-repeat;}.btn:hover::after{  background-color: royalblue;}.btn::before{  content: '';  position: absolute;  left: 0;  right: 0;  bottom: 0;  height: 34px;}.text{  box-sizing: border-box;  width: 100%;  padding: 10px 15px;  float: right;  line-height: 1.5;  margin: 0;  margin-left: -100px;  font-size: 18px;  color: #232323;}
```

效果如下：

![](https://mmbiz.qpic.cn/mmbiz_jpg/xvBbEKrVNtJrFYEkXnekoiaecn5t0fibk9gVZXkNoPacwQBPdFhDyNPuknQh8dll2FE4wbSlzaVqSjY9MSvmCpdw/640?wx_fmt=jpeg)

image-20230218164549895

然后是点击切换效果，可以用`:checked`来控制

```
.content-check:checked+.content{  max-height: fit-content;}.content-check:checked+.content .btn{  left: auto;  right: calc(50% - 50px);}.content-check:checked+.content .btn::after{  transform: scaleY(-1);}
```

这样就可以控制不同的状态了

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtJrFYEkXnekoiaecn5t0fibk9vcAYpBSUQzZoOO2nbEXnwyX6puqiaiaiaXkHZOXDj5EWd6mzibCHSNdvvw/640?wx_fmt=gif)

Kapture 2023-02-18 at 16.48.09

还可以加点遮罩，让点击处有一种淡出弱化的效果，表示下面还有内容

```
.text{  /* */  -webkit-mask: linear-gradient(red 150px, transparent 200px);}
```

效果如下

![](https://mmbiz.qpic.cn/mmbiz_jpg/xvBbEKrVNtJrFYEkXnekoiaecn5t0fibk9b5ewH72amiakEYUMSHRdvjFLxPuWxrdFrZteh64X5iaRg98mUu4QlHYA/640?wx_fmt=jpeg)

image-20230218165117500

完整 demo 可以访问以下任意链接

*   CSS auto height expansion (juejin.cn)[5]
    
*   CSS auto height expansion (codepen.io)[6]
    
*   CSS auto height expansion (runjs.work)[7]
    

五、最后总结一下
--------

想不到浮动布局还能实现这样的功能，总的来说，这是一种成本低廉但需要点想象力的实现方式，适应性和兼容性也都不错，下面总结一下

1.  布局有很多种，浮动布局比较特殊
    
2.  浮动布局非常脆弱，细小的尺寸都能引起整个布局的坍塌
    
3.  超过指定高度后，由于浮动布局引起的坍塌，正好可以区分两种情况
    
4.  通过改变按钮本身的相对位置，可以让案例在超出指定高度后才可见
    
5.  点击切换可以用`input:check`和`label`相关联实现
    
6.  淡出弱化效果可以添加一层蒙版`mask`，表示下面还有内容
    

最后，如果觉得还不错，对你有帮助的话，欢迎**点赞、收藏、转发❤❤❤**

### 

参考资料

[1]

CSS 容器查询: _https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Container_Queries_

[2]

float demo (juejin.cn): _https://code.juejin.cn/pen/7201418511582199842_

[3]

float demo (codepen.io): _https://codepen.io/xboxyan/pen/zYJvxaN_

[4]

float demo (runjs.work): _https://runjs.work/projects/b7e36f3a248144cd_

[5]

CSS auto height expansion (juejin.cn): _https://code.juejin.cn/pen/7201418292035059764_

[6]

CSS auto height expansion (codepen.io): _https://codepen.io/xboxyan/pen/xxawbWd_

[7]

CSS auto height expansion (runjs.work): _https://runjs.work/projects/5aa0d64cc2d74d09_