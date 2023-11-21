> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/yXt_YHmYEoJR21rZVMWreQ)

前言
--

> ❝
> 
> `修改input placeholder样式`、`多行文本溢出`、`隐藏滚动条`、`修改光标颜色`、`水平垂直居中`... 多么熟悉的功能呀！前端童鞋几乎每天都会和他们打交道，一起来总结我们的 css 幸福小片段吧！下次不用百度、不用谷歌，这里就是你的港湾。
> 
> ❞

1. 解决图片 5px 间距
--------------

> ❝
> 
> 你是否经常遇到图片底部莫名其妙多出来 5px 的间距，不急，这里有 4 种方式让它消失
> 
> ❞

![](https://mmbiz.qpic.cn/mmbiz_png/d3KxlCFgM05MopQXt8BOnz4VbUDQtOz6aRIcGGQ2fl4oclgWPqEx2wmKicT7SwibuiahWfpxDgsgO0S8Hbp5AT7Ig/640?wx_fmt=png)

**「方案 1：给父元素设置`font-size: 0`」**

**「效果」**

![](https://mmbiz.qpic.cn/mmbiz_png/d3KxlCFgM05MopQXt8BOnz4VbUDQtOz6Bn2rOHeib0hOoToXzXwqbqibf9fHP5rbqTwjyBCG3MaYTSgTV8XURnTg/640?wx_fmt=png)

**「html」**

```
<div class="img-container">  <img src="https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fc-ssl.duitang.com%2Fuploads%2Fitem%2F202002%2F05%2F20200205093101_yfocq.png&refer=http%3A%2F%2Fc-ssl.duitang.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1636215521&t=203563292576c66ba434651680281e8a" alt=""></div>
```

**「css」**

```
html,body{  margin: 0;  padding: 0;}.img-container{  background-color: lightblue;  font-size: 0;}img{  width: 100%;}
```

**「方案 2：给 img 设置`display: block`」**

**「效果同上」**

**「html」**

```
<div class="img-container">  <img src="https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fc-ssl.duitang.com%2Fuploads%2Fitem%2F202002%2F05%2F20200205093101_yfocq.png&refer=http%3A%2F%2Fc-ssl.duitang.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1636215521&t=203563292576c66ba434651680281e8a" alt=""></div>
```

**「css」**

```
html,body{  margin: 0;  padding: 0;}.img-container{  background-color: lightblue;}img{  width: 100%;  /*关键css*/  display: block;}
```

**「方案 3：给 img 设置`vertical-align: bottom`」**

**「效果同上」**

**「html」**

```
<div class="img-container">  <img src="https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fc-ssl.duitang.com%2Fuploads%2Fitem%2F202002%2F05%2F20200205093101_yfocq.png&refer=http%3A%2F%2Fc-ssl.duitang.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1636215521&t=203563292576c66ba434651680281e8a" alt=""></div>
```

**「css」**

```
html,body{  margin: 0;  padding: 0;}.img-container{  background-color: lightblue;}img{  width: 100%;  /*关键css*/  vertical-align: bottom;}
```

**「方案 4：给父元素设置`line-height: 5px;`」**

**「效果同上」**

**「html」**

```
<div class="img-container">  <img src="https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fc-ssl.duitang.com%2Fuploads%2Fitem%2F202002%2F05%2F20200205093101_yfocq.png&refer=http%3A%2F%2Fc-ssl.duitang.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1636215521&t=203563292576c66ba434651680281e8a" alt=""></div>
```

**「css」**

```
html,body{  margin: 0;  padding: 0;}.img-container{  background-color: lightblue;  /*关键css*/  line-height: 5px;}img{  width: 100%;}
```

2. 元素高度跟随窗口
-----------

> ❝
> 
> 有时候希望某个元素的高度和窗口是一致的，如果用百分比设置，那 html、body 等元素也要跟着一顿设置`height: 100%`有没有更简单的方法呢？
> 
> ❞

**「效果」**

![](https://mmbiz.qpic.cn/mmbiz_png/d3KxlCFgM05MopQXt8BOnz4VbUDQtOz6E7NLg37HHemLe06rFupohX4ueHCb81rxQ1KVgic2iaxZasZsqbQ81Yww/640?wx_fmt=png)

**「html」**

```
<div class="app">  <div class="child"></div></div>
```

**「css」**

```
*{  margin: 0;  padding: 0;}.child{  width: 100%;  /*关键css*/  height: 100vh;  background-image: linear-gradient(180deg, #2af598 0%, #009efd 100%);}
```

3. 修改 input placeholder 样式
--------------------------

**「第一个是经过改写的 placeholder，第二个是原生的」**

**「效果」**

![](https://mmbiz.qpic.cn/mmbiz_png/d3KxlCFgM05MopQXt8BOnz4VbUDQtOz6twIjWlDFJXm0sYOcVMVEOpbicHCxE8ibfM3ibabqc0JtxgzlHhCceD5vA/640?wx_fmt=png)

**「html」**

```
<input type="text" class="placehoder-custom" placeholder="请输入用户名搜索"><input type="text" placeholder="请输入用户名搜索">
```

**「css」**

```
input{  width: 300px;  height: 30px;  border: none;  outline: none;  display: block;  margin: 15px;  border: solid 1px #dee0e9;  padding: 0 15px;  border-radius: 15px;}.placehoder-custom::-webkit-input-placeholder{  color: #babbc1;  font-size: 12px;}
```

4. 巧用 not 选择器
-------------

> ❝
> 
> 有些情况下`所有`的元素都需要某些样式，唯独`最后一个`不需要，这时候使用 not 选择器将会特别方便
> 
> ❞

如下图：最后一个元素没有下边框

**「效果」**

![](https://mmbiz.qpic.cn/mmbiz_png/d3KxlCFgM05MopQXt8BOnz4VbUDQtOz6AZLrx8v9NhOJWib7nnCJpYeYB8CPXDzR9wbdyWRNdG1ExmnCiczYRh4w/640?wx_fmt=png)

**「html」**

```
<ul>    <li>      <span>单元格</span>      <span>内容</span>    </li>    <li>      <span>单元格</span>      <span>内容</span>    </li>    <li>      <span>单元格</span>      <span>内容</span>    </li>    <li>      <span>单元格</span>      <span>内容</span>    </li></ul>
```

**「关键 css」**

```
li:not(:last-child){  border-bottom: 1px solid #ebedf0;}
```

5. 使用 flex 布局实现智能固定底部
---------------------

> ❝
> 
> 内容不够时，`规则说明`要处于底部，内容足够多时，`规则说明`随着内容往下沉，大家一定也遇到过类似的需求，使用 flex 巧妙实现布局。
> 
> ❞

![](https://mmbiz.qpic.cn/mmbiz_gif/d3KxlCFgM05MopQXt8BOnz4VbUDQtOz6PD8ibibcwyFNcMxIKlj5N8ibaxAfMicC3twjHJoyQ3aO1NASbib9Lia1zOsA/640?wx_fmt=gif)

**「html」**

```
<div class="container">  <div class="main">我是内容区域</div>  <div class="footer">规则说明</div></div>
```

**「css」**

```
.container{  height: 100vh;  /* 关键css处 */  display: flex;  flex-direction: column;  justify-content: space-between;}.main{  /* 关键css处 */  flex: 1;  background-image: linear-gradient(45deg, #ff9a9e 0%, #fad0c4 99%, #fad0c4 100%);  display: flex;  align-items: center;  justify-content: center;  color: #fff;}.footer{  padding: 15px 0;  text-align: center;  color: #ff9a9e;  font-size: 14px;}
```

6. 使用 caret-color 改变光标颜色
------------------------

> ❝
> 
> 在做表单相关需求的时候，有时候需要修改一闪一闪光标的颜色。`caret-color`属性完美支持这个需求。
> 
> ❞

![](https://mmbiz.qpic.cn/mmbiz_gif/d3KxlCFgM05MopQXt8BOnz4VbUDQtOz6SqHDWKVozKOo6hzaFqDe8MzEJziaGz0T6xibzeiaicBOxVFFs0cib7Ob3Pw/640?wx_fmt=gif)

**「html」**

```
<input type="text" class="caret-color" />
```

**「css」**

```
.caret-color {  /* 关键css */  caret-color: #ffd476;}
```

7. 移除`type="number"`尾部的箭头
-------------------------

> ❝
> 
> 默认情况下`input type="number"`时尾部会出现小箭头，但是很多时候我们想去掉它，应该怎么办呢？
> 
> ❞

如图：第一个输入框没有去掉小箭头的效果，第二个去掉了。

**「效果」**

![](https://mmbiz.qpic.cn/mmbiz_gif/d3KxlCFgM05MopQXt8BOnz4VbUDQtOz6yIicqIlGbdQaeJY97Kv8tia4W7g1zYicoPOiawQbGay20dNExibl9rV5ibhg/640?wx_fmt=gif)

**「html」**

```
<input type="number" /><input type="number" class="no-arrow" />
```

**「css」**

```
/* 关键css */.no-arrow::-webkit-outer-spin-button,.no-arrow::-webkit-inner-spin-button {  -webkit-appearance: none;}
```

8. `outline:none`移除 input 状态线
-----------------------------

> ❝
> 
> 输入框选中时，默认会带蓝色状态线，使用`outline:none`一键移除
> 
> ❞

**「效果」**

如图：第一个输入框移除了，第二个没有移除

![](https://mmbiz.qpic.cn/mmbiz_gif/d3KxlCFgM05MopQXt8BOnz4VbUDQtOz61OCADNG043f7vmdicpnrIibeJk2R6ia3WVg7icgu9vpqR0GdpQjlfIvfFQ/640?wx_fmt=gif)

**「html」**

```
<input type="number" /><input type="number" class="no-arrow" />
```

**「css」**

```
.no-outline{  outline: none;}
```

9. 解决 IOS 滚动条卡顿
---------------

> ❝
> 
> 在 IOS 机器上，经常遇到元素滚动时卡顿的情况，只需要一行 css 即可让其支持弹性滚动
> 
> ❞

```
body,html{     -webkit-overflow-scrolling: touch;}
```

10. 画三角形
--------

**「效果」**

![](https://mmbiz.qpic.cn/mmbiz_png/d3KxlCFgM05MopQXt8BOnz4VbUDQtOz6dEyoaJeVcKfvkZgTBcMQeLuz26raavtwOUuhmwVmoTJreKq2pTUJqA/640?wx_fmt=png)

**「html」**

```
<div class="box">  <div class="box-inner">    <div class="triangle bottom"></div>    <div class="triangle right"></div>    <div class="triangle top"></div>    <div class="triangle left"></div>  </div></div>
```

**「css」**

```
.triangle {  display: inline-block;  margin-right: 10px;  /* 基础样式 */  border: solid 10px transparent;}  /*下*/.triangle.bottom {  border-top-color: #0097a7;}  /*上*/.triangle.top {  border-bottom-color: #b2ebf2;}/*左*/.triangle.left {  border-right-color: #00bcd4;}/*右*/.triangle.right {  border-left-color: #009688;}
```

11. 画小箭头
--------

**「效果」**

![](https://mmbiz.qpic.cn/mmbiz_png/d3KxlCFgM05MopQXt8BOnz4VbUDQtOz6octIpIWsPlEeNglhI7LUicwibszaibnIQwJuB9AO6dpnBPSa9U6yg9ic4g/640?wx_fmt=png)

**「html」**

```
<div class="box">  <div class="box-inner">    <div class="triangle bottom"></div>    <div class="triangle right"></div>    <div class="triangle top"></div>    <div class="triangle left"></div>  </div></div>
```

**「css」**

```
.arrow {    display: inline-block;    margin-right: 10px;    /* 基础样式 */    width: 0;    height: 0;    /* 基础样式 */    border: 16px solid;    border-color: transparent #CDDC39 transparent transparent;    position: relative;  }  .arrow::after {    content: "";    position: absolute;    /* 通过位移覆盖背景 */    right: -20px;    top: -16px;    border: 16px solid;    border-color: transparent #fff transparent transparent;  }  /*下*/  .arrow.bottom {    transform: rotate(270deg);  }  /*上*/  .arrow.top {    transform: rotate(90deg);  }  /*左*/  .arrow.left {    transform: rotate(180deg);  }  /*右*/  .arrow.right {    transform: rotate(0deg);  }
```

12. 图片尺寸自适应
-----------

**「vw vs padding」**

**「效果」**

![](https://mmbiz.qpic.cn/mmbiz_gif/d3KxlCFgM05MopQXt8BOnz4VbUDQtOz60Fic091Iuic8qG9Q96cvhhGxaQhCib8tvic73NzE7DHFFIUxMbReUPerwQ/640?wx_fmt=gif)

**「html」**

```
<div class="box">  <div class="img-container">    <img src="https://i0.hippopx.com/photos/179/171/625/sparkler-holding-hands-firework-preview.jpg" alt="">  </div></div><div class="box">  <div class="img-container">    <img src="https://i0.hippopx.com/photos/179/171/625/sparkler-holding-hands-firework-preview.jpg" alt="">  </div></div><div class="box-vw">  <div class="img-container">    <img src="https://i0.hippopx.com/photos/179/171/625/sparkler-holding-hands-firework-preview.jpg" alt="">  </div></div>
```

**「css」**

```
.box, .box-vw{  background-color: #f5f6f9;  border-radius: 10px;  overflow: hidden;  margin-bottom: 15px;}.box:nth-of-type(2){  width: 260px;}/* vw方案 */.box-vw .img-container{  width: 100vw;  height: 66.620879vw;  padding-bottom: inherit;}/* padding方案 */.img-container{  width: 100%;  height: 0;  /* 图片的高宽比 */  padding-bottom: 66.620879%;}img{width: 100%;}
```

13. 隐藏滚动条
---------

**「第一个可以看到滚动条，第二个已隐藏了」**

**「效果」**

![](https://mmbiz.qpic.cn/mmbiz_gif/d3KxlCFgM05MopQXt8BOnz4VbUDQtOz6ZKMVJJ9h6vJ5Zic8aAVYeVcNZ8jDaeS3sZkEk9kDHbZkK2kbyv7Xeew/640?wx_fmt=gif)

> ❝
> 
> **「注意」**这里指的是容器可以滚动，但是滚动条仿佛透明一样被隐藏**「html」**
> 
> ❞

```
<div class="box">  <div>    爱情会离开，朋友会离开，快乐会离开，但是考试不会,因为你不会就不会  </div></div><div class="box box-hide-scrollbar">  <div>只是因为在人群中多看了你一眼，你就--问我游泳健身了解一下？</div></div>
```

**「css」**

```
.box {  width: 375px;  overflow: scroll;}/* 关键代码 */.box-hide-scrollbar::-webkit-scrollbar {  display: none; /* Chrome Safari */}.box > div {  margin-bottom: 15px;  padding: 10px;  background-color: #f5f6f9;  border-radius: 6px;  font-size: 12px;  width: 750px;}
```

14. 自定义文本选中的样式
--------------

**「第一个是默认选中状态，第二个是自定义选中状态」**

**「效果」**

![](https://mmbiz.qpic.cn/mmbiz_png/d3KxlCFgM05MopQXt8BOnz4VbUDQtOz6SjBPq6YWwL7zlB8WAbibwCwKPGq2GqIxZ5ic4KgdHMVbz4liamn6pYUew/640?wx_fmt=png)

**「html」**

```
<div class="box">  <p class="box-default">    昨天遇见小学同学，没有想到他混的这么差--只放了一块钱到我的碗里  </p>  <p class="box--custom">    今年情人节，不出意外的话，一个人过，出意外的话--去医院过  </p></div>
```

**「css」**

```
.box-custom::selection {  color: #ffffff;  background-color: #ff4c9f;}
```

15. 禁止选择文本
----------

**「第一个可以选中，第二个无法选中」**

**「效果」**

![](https://mmbiz.qpic.cn/mmbiz_png/d3KxlCFgM05MopQXt8BOnz4VbUDQtOz6PejSicGxl5szYLlWR0yogSQI4ZeT3ytYhic7bYZ4CrLjCeZI18mqT4qw/640?wx_fmt=png)

**「html」**

```
<div class="box">  <p>好不容易习惯了自己的长相--去理了个发，又换了一种丑法</p>  <p>国庆节放假，想跟女朋友去旅游，请大家帮忙推荐下--哪里有女朋友</p></div>
```

**「css」**

```
.box p:last-child{  user-select: none;}
```

16. 水平垂直居中
----------

**「效果」**

![](https://mmbiz.qpic.cn/mmbiz_png/d3KxlCFgM05MopQXt8BOnz4VbUDQtOz62Yx5MzMt3OZbMUcicw0g3jm4P78PTltpiaFlbTlticLzwwbkrcOAY4NCQ/640?wx_fmt=png)**「html」**

```
<div class="parent">  <p class="child">每次临时抱佛脚的时候--佛祖他总是给我一脚</p></div>
```

**「css」**

```
.parent{  padding: 0 10px;  background-color: #f5f6f9;  height: 100px;  border-radius: 6px;  font-size: 14px;  // 以下是水平垂直居中关键代码  display: flex;  align-items: center;  justify-content: center;}
```

17. 单行文本溢出显示省略号
---------------

> ❝
> 
> 这个点估计全世界的前端都知道如何写，所以还是看为您准备的笑话乐一乐更有价值。
> 
> ❞

**「效果」**

![](https://mmbiz.qpic.cn/mmbiz_png/d3KxlCFgM05MopQXt8BOnz4VbUDQtOz6O45u0AWEwk0NnfGfviaqzeVIKcMoJMLMEV2XQSgPSheViaFAibWveusfA/640?wx_fmt=png)

**「html」**

```
<p class="one-line-ellipsis">不要轻易向命运低头，因为一低头就会看到赘肉 如果你愿意一层一层剥开我的心</p>
```

**「css」**

```
.one-line-ellipsis {  overflow: hidden;  white-space: nowrap;  text-overflow: ellipsis;  /* 非必须，只是为了制造一行放不下的效果 */  max-width: 375px; }
```

18. 多行文本溢出显示省略号
---------------

**「示例」**

![](https://mmbiz.qpic.cn/mmbiz_png/d3KxlCFgM05MopQXt8BOnz4VbUDQtOz6ZNH9wYu3YzuOJZTkJA3ZexpOpDibjDNZyprtgJuhQ34DsSYPuiarpnZg/640?wx_fmt=png)

**「html」**

```
<p class="more-line-ellipsis">上帝对人都是公平的给了你丑外表--也会配给你低智商 如果你愿意一层一层剥开我的心，你会发现--我缺心眼啊！</p>
```

**「css」**

```
.more-line-ellipsis {  overflow: hidden;  text-overflow: ellipsis;  display: -webkit-box;  /* 设置n行，也包括1 */  -webkit-line-clamp: 2;  -webkit-box-orient: vertical;}
```

19. 清除浮动
--------

> ❝
> 
> 一个仿佛有年代感的布局方式😄。现在移动端应该大部分不采用该布局方式了。
> 
> ❞

**「从图中可以看出，外层高度并未塌陷，就是使用了 clearfix 类的原因」**

**「效果」**

![](https://mmbiz.qpic.cn/mmbiz_png/d3KxlCFgM05MopQXt8BOnz4VbUDQtOz6eX2xXs48Nx1X92mAEzTL9NqWgGVzpiaLW5neHdpjCQvialoGJp7609Rw/640?wx_fmt=png)

**「html」**

```
<div class="box clearfix">  <div class="float-left"></div>  <div class="float-left float-left2"></div>  <div class="float-left float-left3"></div></div>
```

**「css」**

```
body {  padding: 15px;  color: #324b64;}/* 关键代码 */.clearfix{  zoom: 1;}.clearfix::after{  display: block;  content: '';  clear: both;}.box {  padding: 10px;  background-color: #f5f6f9;  border-radius: 6px;  font-size: 12px;}.box >div{  width: 29%;  height: 100px;}.float-left{  background-color: #faa755;  float: left;  margin-right: 10px;}.float-left2{  background-color: #7fb80e;}.float-left3{  background-color: #b2d235;}
```

20. 使用 filter:grayscale(1) 使网页呈现哀悼模式
------------------------------------

> ❝
> 
> 伟大的革命先烈们为我们祖国的诞生做出了巨大的牺牲，在相应节日里，我们的站点会呈现灰色哀悼模式，以此来纪念先烈们。
> 
> ❞

**「效果」**

![](https://mmbiz.qpic.cn/mmbiz_png/d3KxlCFgM05MopQXt8BOnz4VbUDQtOz68rjJPL96IiaBr8vF9guZEhxXFM8v0ibjXCrxwlHrWI2SaMvEnOttn3ibQ/640?wx_fmt=png)

**「css」**

```
body{  filter: grayscale(1);}
```