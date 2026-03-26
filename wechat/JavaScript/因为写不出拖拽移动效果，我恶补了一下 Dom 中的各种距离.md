> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/tpto7JQKeJcBltzZWei-wA)

### 背景

最近在项目中要实现一个拖拽头像的移动效果，一直对 JS Dom 拖拽这一块不太熟悉，甚至在网上找一个示例，都看得云里雾里的，发现遇到最大的拦路虎就是 JS Dom 各种各样的距离，让人头晕眼花，看到一个距离属性，大脑中的印象极其模糊，如同有一团雾一样，不知其确切含义。果然是基础不牢，地动山摇。今天决心夯实一下基础，亲自动手验证一遍 dom 各种距离的含义。

### JS Dom 各种距离释义

下面我们进入正题, 笔者不善于画图, 主要是借助浏览器开发者工具，通过获取的数值给大家说明一下各种距离的区别。

#### 第一个发现 window.devicePixelRatio 的存在

本打算用截图软件丈量尺寸，结果发现截图软件显示的屏幕宽度与浏览器开发者工具获取的宽度不一致，这是为什么呢?

*   截图软件显示的屏幕宽度是 1920
    

![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQQXekzJJonjziaX4A79HnVQFwqtNbE9ZQ28Gic29kkSxXy4W8hdNRqLfPicsZqfUMiaPC6RXibfSlHD1Bg/640?wx_fmt=other)image.png

*   window.screen.width 显示的屏幕宽度是 1536
    

![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQQXekzJJonjziaX4A79HnVQF95FTDXq9lV8Bs32PtpfL7BGWpYpFMA7TIkmOMMBHfcpVMQgQLibKHqA/640?wx_fmt=other)image.png

这是怎么回事？原来在 PC 端，也存在一个设备像素比的概念。它告诉浏览器一个 css 像素应该使用多少个物理像素来绘制。要说设备像素比，得先说一下像素和分辨率这两个概念。

*   **像素** 屏幕中最小的色块，每个色块称之为一个像素（Pixel）
    

![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQQXekzJJonjziaX4A79HnVQFD4RZO0rNrop11xD6aia4DJj9KoJN8Jx3CnKib2fDw46Xia5cTJQvNmxzQ/640?wx_fmt=other)image.png

*   **分辨率** 分辨率 = 屏幕水平方向的像素点数 * 屏幕垂直方向的像素点数; 另外说一下, 关于分辨率有多种定义, 可以细分为显示分辨率 [1]、图像分辨率 [2]、打印分辨率 [3] 和扫描分辨率 [4] 等，此处是指显示分辨率。
    

![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQQXekzJJonjziaX4A79HnVQFj19edjicpvtaicLPA74fAeUrntYpYqvf8kgDz4aFsamV8wYfvGUZo2PA/640?wx_fmt=other)image.png

*   **设备像素比**
    

设备像素比的定义是：

`window.devicePixelRatio` = 显示设备物理像素分辨率显示设备 CSS 像素分辨率 \ frac{显示设备物理像素分辨率}{显示设备 CSS 像素分辨率} 显示设备 CSS 像素分辨率显示设备物理像素分辨率

根据设备像素比的定义, 如果知道显示设备横向的 css 像素值，根据上面的公式，就能计算出显示设备横向的物理像素值。

```
显示设备宽度物理像素值 = window.screen.width * window.devicePixelRatio;
```

设备像素比在我的笔记本电脑上显示的数值是 1.25, 代表一个 css 逻辑像素对应着 1.25 个物理像素。

![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQQXekzJJonjziaX4A79HnVQFFVxndszlNQ3kdzdUickCBicJnDz7TiaySpLxfzpmgngiak4q5Jgqytb0Gg/640?wx_fmt=other)image.png

我前面的公式计算了一下，与截图软件显示的像素数值一致。这也反过来说明，截图软件显示的是物理像素值。

![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQQXekzJJonjziaX4A79HnVQFZ2e6JicdC3qYsMUWNVdUWOIZiazQQVXjFicFchguNS9MIxAibrcH1iaHzUA/640?wx_fmt=other)image.png

*   window.devicePixelRatio 是由什么决定的 ?
    

发现是由笔记本电脑屏幕的缩放设置决定的，如果设置成 100%, 此时 window.screen.width 与笔记本电脑的显示器分辨率 X 轴方向的数值一致, 都是 1920(如右侧图所示), 此时屏幕上的字会变得比较小, 比较伤视力。

![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQQXekzJJonjziaX4A79HnVQFTLGibSQX6ZAPrW1PsbIl6gjVhcNalBBIQBUFkiaeCgiafxdaBicNsEEUbw/640?wx_fmt=other) ![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQQXekzJJonjziaX4A79HnVQFB8u0g5Ta8Ea6oXr58DKD9ibzYanvpvAb7KOmGzJl2gTaA9oYGyudqnw/640?wx_fmt=other)

*   逻辑像素是为了解决什么问题?
    

逻辑像素是为了解决屏幕相同，分辨率不同的两台显示设备， 显示同一张图片大小明显不一致的问题。比如说两台笔记本都是 15 英寸的，一个分辨率是`1920*1080`, 一个分辨率是`960*540`, 在`1920*1080`分辨率的设备上，每个格子比较小，在`960*540`分辨率的设备上，每个格子比较大。一张`200*200`的图片，在高分率的设备上看起来会比较小，在低分辨率的设备上，看起来会比较大。观感不好。为了使同样尺寸的图片，在两台屏幕尺寸一样大的设备上，显示尺寸看起来差不多一样大，发明了逻辑像素这个概念。规定所有电子设备呈现的图片等资源尺寸统一用逻辑像素表示。然后在高分辨率设备上，提高 devicePixelRatio, 比如说设置`1920*1080`设备的 devicePixelRatio(dpr) 等于 2, 一个逻辑像素占用两个格子, 在低分辨率设备上，比如说在`960*540`设备上设置 dpr=1, 一个 css 逻辑像素占一个格子, 这样两张图片在同样的设备上尺寸大小就差不多了。通常设备上的逻辑像素是等于物理像素的，在高分辨率设备上，物理像素是大于逻辑像素数量的。由此也可以看出，物理像素一出厂就是固定的，而设备的逻辑像素会随着设备像素比设置的值不同而改变。但图片的逻辑像素值是不变的。

#### document.body、document.documentElement 和 window.screen 的宽高区别

差别是很容易辨别的，如下图所示：

*   document.body -- body 标签的宽高
    
*   document.documentElement -- 网页可视区域的宽高 (**不包括滚动条**)
    
*   window.screen -- 屏幕的宽高
    

![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQQXekzJJonjziaX4A79HnVQFMIYgmfTfZoLCGArZTqxobxvqgqopsC8viaRv1fLPUKDF1jGnvAT5DoA/640?wx_fmt=other) image.png

*   网页可视区域不包括滚动条
    

如下图所示，截图时在未把网页可视区域的滚动条高度计算在内的条件下, 截图工具显示的网页可视区域高度是 168, 浏览器显示的网页可视区域的高度是 167.5, 误差 0.5，由于截图工具是手动截图，肯定有误差，结果表明，网页可视区域的高度 **不包括滚动条高度**。宽度同理。

![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQQXekzJJonjziaX4A79HnVQFnJqUl5Jo6cbWJWvFLf1CLeoFrC1Ym42qpP2guHxBNxtXDKIWLGywIA/640?wx_fmt=other)image.png

*   屏幕和网页可视区域的宽高区别如下：
    

屏幕宽高是个固定值，网页可视区域宽高会受到缩放窗口影响。

![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQQXekzJJonjziaX4A79HnVQFJjSkGxfZhAgaafVeIEqYsIy730iaSQ4uaibq1NRuyWWYcbibhOkopO6YQ/640?wx_fmt=other)image.png

*   屏幕高度和屏幕可用高度区别如下：
    

屏幕可用高度 = 屏幕高度 - 屏幕下方任务栏的高度，也就是：

```
window.screen.availHeight = window.screen.height - 系统任务栏高度
```

![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQQXekzJJonjziaX4A79HnVQFwnT3Ygo4DTfYrDbEB6ZLCYFbZAncgFhDbAb56zzSWhycBtcUswkSBA/640?wx_fmt=other)image.png

#### scrollWidth, scrollLeft, clientWidth 关系

```
scrollWidth(滚动宽度,包含滚动条的宽度)=scrollLeft(左边卷去的距离)+clientWidth(可见部分宽度); // 同理 scrollHeight(滚动高度,包含滚动条的高度)=scrollTop(上边卷去的距离)+clientHeight(可见部分高度);
```

需要注意的是，上面这三个属性，都取的是溢出元素的**父级元素属性**。而不是溢出元素本身。本例中溢出元素是 body(document.body), 其父级元素是 html(document.documentElement)。另外，

```
溢出元素的宽度(document.body.scrollWidth）=父级元素的宽度(document.documentElement.scrollWidth) - 滚动条的宽度(在谷歌浏览器上滚动条的宽度是19px)
```

![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQQXekzJJonjziaX4A79HnVQF1Co9G8q1xIKMBL2eHhibI3tMro4nyXs1stV3M97b4M8rXVpyH0PZN7A/640?wx_fmt=other)image.png

```
<!DOCTYPE html> <html lang="en">   <head>         <meta charset="UTF-8">         <meta http-equiv="X-UA-Compatible" content="IE=edge">         <!-- <meta > -->         <title>JS Dom各种距离</title>         <style>               html, body {                     margin: 0;               }               body {                     width: 110%;                     border: 10px solid blue;               }               .rect {                     height: 50px;                     background-color: green;               }         </style>   </head>   <body>         <div id="rect" class="rect"></div>   </body> </html>
```

#### 元素自身和父级元素的 scrollWidth 和 scrollLeft 关系?

从下图可以看出:

*   元素自身没有 X 轴偏移量，元素自身的滚动宽度不包含滚动条
    
*   父级元素有 X 轴便宜量, 父级元素滚动宽度包含滚动条 ![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQQXekzJJonjziaX4A79HnVQF26ChfJ5UkFMmmO5GU6xk8aDnpCuiasaWNWjy2qUliaTiargzZWf8m9MHQ/640?wx_fmt=other)
    

```
<!DOCTYPE html><html lang="en"><head>    <meta charset="UTF-8">    <meta http-equiv="X-UA-Compatible" content="IE=edge">    <!-- <meta > -->    <title>JS Dom各种距离</title>    <style>        div {            border: 1px solid #000;            width: 200px;            height: 600px;            padding: 10px;            background-color: green;            margin: 10px;        }    </style></head><body>    <div class="rect">    111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111    </div></body><script></script></html>
```

#### offsetWidth 和 clientWidth 的关系?

offsetWidth 和 clientWidth 的共同点是都包括 自身宽度 + padding , 不同点是 **offsetWidth 包含 border**。

如下图所示:

*   rect 元素的 clientWidth=200px(自身宽度) + 20px(左右 padding) = 220px
    
*   rect 元素的 offsetWidth=200px(自身宽度) + 20px(左右 padding) + 2px(左右 boder) = 222px
    

![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQQXekzJJonjziaX4A79HnVQFiaictGEjFKVJLzBacfSVEBte6VQ3MW8SNk4F424dpfWof3O99PgdibhTQ/640?wx_fmt=other)image.png

```
<!DOCTYPE html><html lang="en"><head>    <meta charset="UTF-8">    <meta http-equiv="X-UA-Compatible" content="IE=edge">    <!-- <meta > -->    <title>JS Dom各种距离</title>    <style>        div {            border: 1px solid #000;            width: 200px;            height: 100px;            padding: 10px;            background-color: green;            margin: 10px;        }    </style></head><body>    <div class="rect">111111111111111111111111111111111111111111111111</div></body><script></script></html>
```

#### event.clientX，event.clientY, event.offsetX 和 event.offsetY 关系

代码如下，给 rect 元素添加一个 mousedown 事件，打印出事件源的各种位置值。

```
<!DOCTYPE html><html lang="en"><head>    <meta charset="UTF-8">    <meta http-equiv="X-UA-Compatible" content="IE=edge">    <!-- <meta > -->    <title>JS Dom各种距离</title>    <style>        html,        body {            margin: 0;        }        body {            width: 200px;            padding: 10px;            border: 10px solid blue;        }        .rect {            height: 50px;            background-color: green;        }    </style></head><body>    <div id="rect" class="rect"></div></body><script>    const rectDom = document.querySelector('#rect');    rectDom.addEventListener('mousedown', ({ offsetX, offsetY, clientX, clientY, pageX, pageY, screenX, screenY }) => {        console.log({ offsetX, offsetY, clientX, clientY, pageX, pageY, screenX, screenY });    })</script></html>
```

我们通过 y 轴方向的高度值, 了解一下这几个属性的含义。 绿色块的高度是 50px, 我们找个特殊的位置（绿色块的右小角）点击一下，如下图所示:

*   offsetY=49, 反推出这个值是相对于元素自身的顶部的距离
    
*   clientY=69, body 标签的 border-top 是 10，paiding 是 10, 反推出这个值是相对网页可视区域顶部的距离
    
*   screenY=140，目测肯定是基于浏览器窗口，
    

所以它们各自的含义, 就很清楚了。

![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQQXekzJJonjziaX4A79HnVQFSmNGpual30MDZDXPFMicfSkLXs6NZcw8wOTOwNKA1alV60jGmTDk17Q/640?wx_fmt=other)image.png

<table><thead><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); text-align: center; min-width: 85px;">事件源属性</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); text-align: center; min-width: 85px;">表示的距离</th></tr></thead><tbody><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;"><strong>event.offsetX、event.offsetY</strong></td><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;">鼠标相对于事件源元素（srcElement）的 X,Y 坐标，</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;"><strong>event.clientX、event.clientY</strong></td><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;">鼠标相对于浏览器窗口可视区域的 X，Y 坐标（窗口坐标），可视区域不包括工具栏和滚动偏移量。</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;"><strong>event.pageX、event.pageY</strong></td><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;">鼠标相对于文档坐标的 x,y 坐标，文档坐标系坐标 ＝ 视口坐标系坐标 ＋ 滚动的偏移量</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;"><strong>event.screenX、event.screenY</strong></td><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;">鼠标相对于用户显示器屏幕左上角的 X,Y 坐标</td></tr></tbody></table>

*   pageX 和 clientX 的关系
    

我们点击下图绿色块的右下角，把 pageX 和 clientX 值打印出来。如下图所示:

*   可视区域的宽度是 360，点击点的 clientX=359(由于是手动点击, 有误差也正常)
    
*   水平方向的偏移量是 56
    
*   pageX 是 415，360+56=416, 考虑到点击误差，可以推算出 `ele.pageX = ele.clientX + ele.scrollLeft`
    

![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQQXekzJJonjziaX4A79HnVQFCiayH9OOajpjn0jdibQw9GCaglBia3icHYRIlFSAwuCmKXsTu9EN26uzKQ/640?wx_fmt=other)image.png

#### getBoundingClientRect 获取的 top,bottom,left,right 的含义

从下图可以看出，上下左右这四个属性，都是相对于浏览器可视区域左上角而言的。

![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQQXekzJJonjziaX4A79HnVQFAMzLtdDJUaen4zQzdofsY0P6JCp1BsYmJ6ribhuX9Kqxb22jXrEHmIQ/640?wx_fmt=other)

从下图可以看出，当有滚动条出现的时候，right 的值是 359.6，而不是 360+156(x 轴的偏移量), 说明通过 getBoundingClientRect 获取的属性值是**不计算滚动偏移量的**，是相对浏览器可视区域而言的。

![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQQXekzJJonjziaX4A79HnVQFLOibFULYjEVxPObiblP1j7ooEY50XwjOFWCiahJlZf41Ja1Q3ibicnMbDBg/640?wx_fmt=other)image.png

#### movementX 和 movementY 的含义?

MouseEvent.movementX/movementX 是一个相对偏移量。返回当前位置与上一个 mousemove 事件之间的水平 / 垂直距离。以当前位置为基准, 鼠标向左移动, movementX 就是负值，向右移动，movementX 就是正值。鼠标向上移动, movementY 就是负值，向下移动，movementY 就是正值。数值上，它们等于下面的计算公式。 这两个值在设置拖拽距离的时候高频使用，用起来很方便。

```
curEvent.movementX = curEvent.screenX - prevEvent.screenX; 
curEvent.movementY = curEvent.screenY - prevEvent.screenY;
```

### 想移动元素，mouse 和 drag 事件怎么选?

mouse 事件相对简单，只有 mousedown(开始),mousemove(移动中),mouseup(结束) 三种。与之对应的移动端事件是 touch 事件，也是三种 touchstart(手指触摸屏幕), touchmove(手指在屏幕上移动), touchend(手指离开屏幕)。

相对而言, drag 事件就要丰富一些。

*   被拖拽元素事件
    

<table><thead><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); text-align: center; min-width: 85px;">事件名</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); text-align: center; min-width: 85px;">触发时机</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); text-align: center; min-width: 85px;">触发次数</th></tr></thead><tbody><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;">dragstart</td><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;">拖拽开始时触发一次</td><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;">1</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;">drag</td><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;">拖拽开始后反复触发</td><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;">多次</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;">dragend</td><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;">拖拽结束后触发一次</td><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;">1</td></tr></tbody></table>

*   目标容器事件
    

<table><thead><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); text-align: center; min-width: 85px;">事件名</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); text-align: center; min-width: 85px;">触发时机</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); text-align: center; min-width: 85px;">触发次数</th></tr></thead><tbody><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;">dragenter</td><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;">被拖拽元素进入目标时触发一次</td><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;">1</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;">dragover</td><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;">被拖拽元素在目标容器范围内时反复触发</td><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;">多次</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;">drop</td><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;">被拖拽元素在目标容器内释放时 (前提是设置了 dropover 事件)</td><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;">1</td></tr></tbody></table>

想要移动一个元素，该如何选择这两种事件类型呢？ 选择依据是:

<table><thead><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); text-align: center; min-width: 85px;">类型</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); text-align: center; min-width: 85px;">选择依据</th></tr></thead><tbody><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;">mouse 事件</td><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;">1. 要求丝滑的拖拽体验 2. 无固定的拖拽区域 3. 无需传数据</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;">drag 事件</td><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;">1. 拖拽区域有范围限制 2. 对拖拽流畅性要求不高 3. 拖拽时需要传数据</td></tr></tbody></table>

### 现在让我们写个拖拽效果

光说不练假把式, 扫清了学习障碍后，让我们自信满满地写一个兼容 PC 端和移动端的拖动效果。不积跬步无以至千里，幻想一口吃个胖子，是不现实的。这一点在股市上体现的淋漓尽致。都是有耐心的人赚急躁的人的钱。所以，要我们沉下心来，打牢基础，硬骨头啃一点就会少一点，步步为营，稳扎稳打，硬骨头也会被啃成渣。

![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQQXekzJJonjziaX4A79HnVQFibQpZO0kflptge7SbWF38VJXgYrXZpn7ZJoLa8WUeo0viamuDmN1Cw5A/640?wx_fmt=other)

```
<!DOCTYPE html><html lang="en"><head>            <meta charset="UTF-8" />        <meta  />       <title>移动小鸟</title>    <style>        body {            margin: 0;            font-size: 0;            position: relative;            height: 100vh;        }        .bird {            position: absolute;            width: 100px;            height: 100px;            cursor: grab;            z-index: 10;        }    </style></head><body>    <img class="bird" src="./bird.png" alt="" />  </body><script>    let evtName = getEventName();    // 鼠标指针相对于浏览器可视区域的偏移    let offsetX = 0, offsetY = 0;    // 限制图片可以X和Y轴可以移动的最大范围，防止溢出    let limitX = 0, limitY = 0;    // 确保图片加载完    window.onload = () => {        const bird = document.querySelector(".bird");        const { width, height } = bird;        limitX = document.documentElement.clientWidth - width;        limitY = document.documentElement.clientHeight - height;        bird.addEventListener(evtName.start, (event) => {            // 监听鼠标指针相对于可视窗口移动的距离            // 注意移动事件要绑定在document元素上，防止移动过快,位置丢失            document.addEventListener(evtName.move, moveAt);        });        // 鼠标指针停止移动时,释放document上绑定的移动事件        // 不然白白产生性能开销        document.addEventListener(evtName.end, () => {            document.removeEventListener(evtName.move, moveAt);        })        // 移动元素        function moveAt({ movementX, movementY }) {            const { offsetX, offsetY } = getSafeOffset({ movementX, movementY });            window.requestAnimationFrame(() => {                bird.style.cssText = `left:${offsetX}px;top:${offsetY}px;`;            });        };    };    // 获取安全的偏移距离    const getSafeOffset = ({ movementX, movementY }) => {        // //距上次鼠标位置的X,Y方向的偏移量        offsetX += movementX;        offsetY += movementY;        // 防止拖拽元素被甩出可视区域        if (offsetX > limitX) {            offsetX = limitX;        }        if (offsetX < 0) {            offsetX = 0;        }        if (offsetY > limitY) {            offsetY = limitY;        }        if (offsetY < 0) {            offsetY = 0;        }        // console.log({ movementX, movementY, offsetX, offsetY });        return { offsetX, offsetY };    }    // 区分是移动端还是PC端移动事件    function getEventName() {        if ("ontouchstart" in window) {            return {                start: "touchstart",                move: "touchmove",                end: "touchend",            };        } else {            return {                start: "pointerdown",                move: "pointermove",                end: "pointerup",            };        }    }</script></html>
```

### 彩蛋

在 chrome 浏览器上发现一个奇怪的现象, 设置的 border 值是整数，计算出来的值却带有小数

![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQQXekzJJonjziaX4A79HnVQFKkrgZAY5pWAIg2zBlgyb39DibU1P3jN77ic2zR45GCQA4bR6cLL8GRkg/640?wx_fmt=other)image.png

而当 border 值是 4 的整数倍的时候, 计算值是正确的

![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQQXekzJJonjziaX4A79HnVQFZLnocy7JkQusiawp8kRh2YuUx7f2vsia3MDB8AkH0eSuHK1PAzl05QXw/640?wx_fmt=other)image.png

看了这篇文章 [5] 解释说，浏览器可能只能渲染具有整数物理像素的 border 值，不是整数物理像素的值时，计算出的是近似 border 值。这个解释似乎讲得通，在设备像素比是 window.devicePixelRatio=1.25 的情况下, 1px 对应的是 1.25 物理像素, `1.25*4的倍数`才是整数，所以设置的逻辑像素是 4 的整数倍数，显示的渲染计算值与设置值一致, 唯一让人不理解的地方，为什么 padding,margin，width/height 却不遵循同样的规则。

### 参考资料

[1]

https://baike.baidu.com/item/%E6%98%BE%E7%A4%BA%E5%88%86%E8%BE%A8%E7%8E%87/3431933?fromModule=lemma_inlink

[2]

https://baike.baidu.com/item/%E5%9B%BE%E5%83%8F%E5%88%86%E8%BE%A8%E7%8E%87/872374?fromModule=lemma_inlink

[3]

https://baike.baidu.com/item/%E6%89%93%E5%8D%B0%E5%88%86%E8%BE%A8%E7%8E%87/9560832?fromModule=lemma_inlink

[4]

https://baike.baidu.com/item/%E6%89%AB%E6%8F%8F%E5%88%86%E8%BE%A8%E7%8E%87/7122498?fromModule=lemma_inlink

[5]

https://www.w3.org/TR/CSS22/cascade.html#specified-value

关于本文

来源：去伪存真

https://juejin.cn/post/7225206098692407355

最后
--

欢迎关注【前端瓶子君】✿✿ヽ (°▽°) ノ✿

回复「交流」，吹吹水、聊聊技术、吐吐槽！

回复「阅读」，每日刷刷高质量好文！

如果这篇文章对你有帮助，「在看」是最大的支持！