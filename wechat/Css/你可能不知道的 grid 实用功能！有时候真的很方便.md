> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/IgOq0luezMGYFv5GnDdLOA)

```
大厂技术  高级前端  Node进阶

点击上方 程序员成长指北，关注公众号

回复1，加入高级Node交流群

```

> 作者：欲买炸鸡同载可乐
> 
> 原文：https://juejin.cn/post/7326816030042669110

flex 布局大家应该已经运用的炉火纯青了，相信在日常开发中大家和我一样不管遇到什么都是 flex 一把搜哈。直到我遇到 grid，才发现有些场景下，不是说 flex 实现不了而是使用 grid 能够更加轻松的完成任务。下面拿几个场景和大家分享一下。

宫格类的布局
------

比如我要实现一个布局，最外层元素的宽度是 1000px，高度自适应。子元素宽度为 300px，一行展示 3 个，从左到右排列。其中最左边与最右边的元素需要紧挨父元素的左右边框。如下图所示：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/XP4dRIhZqqUhV0X9klWdFub6fPn7RlvJt8WSQdf6dKXvvmv0WIK9RQRsKdzX4SBCAbEdBEsLrgljnuLzDeeiaqQ/640?wx_fmt=other&from=appmsg)

### 使用 flex 实现

这个页面布局在日常开发中非常常见，考虑下使用 flex 布局如何实现，横向排列元素，固定宽度 300，wrap 设置换行显示，设置双端对齐。看起来很简单，来实现一下。

```
<!DOCTYPE html>
<html lang="en">

<head>
    <style>
        .box{
            width: 1000px;
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            gap: 10px;
        }
        .item{
            background: pink;
            width: 300px;
            height: 150px;
        }
    </style>
</head>

<body>
    <div class="box">
        <div class="item">1</div>
        <div class="item">2</div>
        <div class="item">3</div>
        <div class="item">4</div>
        <div class="item">5</div>
        <div class="item">6</div>
        <div class="item">7</div>
        <div class="item">8</div>
    </div>
</body>

</html>


```

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/XP4dRIhZqqUhV0X9klWdFub6fPn7RlvJHkJFGd04Lh3svrueuEwCSY8ibkNsZLZaRib9FhG9yNicY7zbjYThMPl2g/640?wx_fmt=other&from=appmsg)

实现之后发现了问题，由于我们设置了双端对齐导致，当最后一行的个数不足三个时，页面展示的效果和我们预期的效果有出入。使用 flex 实现这个效果就要对这个问题进行额外的处理。

处理的方式有很多种，最常见的处理方式是在元素后面添加空元素，使其成为 3 的倍数即可。其实这里添加空元素的个数没有限制，因为空元素不会展示到页面上，即使添加 100 个空元素用户也是感知不到的。个人觉得这并不是一个好办法，在实际处理的时候可能还会遇到别的问题。个人觉得还是把 flex 下的子元素设置成百分比好一点。

### 使用 grid 实现

面对这种布局使用 grid 是非常方便的，设置 3 列，每列 300px，剩下的元素让它自己往下排即可。几行代码轻松实现该效果，不需要 flex 那样额外的处理。

```
<!DOCTYPE html>
<html lang="en">

<head>
    <style>
        .box {
            display: grid;
            grid-template-columns: repeat(3, 300px);
            justify-content: space-between;
            gap: 10px;
            width: 1000px;
        }

        .item {
            background: pink;
            height: 100px;
        }
    </style>
</head>

<body>
    <div class="box">
        <div class="item">1</div>
        <div class="item">2</div>
        <div class="item">3</div>
        <div class="item">4</div>
        <div class="item">5</div>
        <div class="item">6</div>
        <div class="item">7</div>
        <div class="item">8</div>

    </div>
</body>

</html>


```

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/XP4dRIhZqqUhV0X9klWdFub6fPn7RlvJY2WqamfHk4FY0Z429QNOEZBnjo18bDRdN7WicExuSPgvgxagMKkI0Dw/640?wx_fmt=other&from=appmsg)

实现后台管理布局
--------

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/XP4dRIhZqqUhV0X9klWdFub6fPn7RlvJVVhhtsicAfujTeuPJ6eMOoIBVyxe6iazIU7ljzh4ftpm6mYruGKOVLkw/640?wx_fmt=other&from=appmsg)

这种后台管理的布局，使用 flex 实现当然也没有问题。首先需要纵向排列红色的两个 div，然后再横向的排列蓝色的两个 div，最后再纵向的排列绿色的两个 div 实现布局。达到效果是没有问题的，但是实现起来较为繁琐，而且需要很多额外的标签嵌套。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/XP4dRIhZqqUhV0X9klWdFub6fPn7RlvJkTgcESKCKySfMc65wxcB20Sf5bIgXeKlfRibdqh0k3l8DibDoOE79gmQ/640?wx_fmt=other&from=appmsg)

由于 grid 是二维的，所以它不需要额外的标签嵌套。html 里面结构清晰，如果需要改变页面结构，只需要改变 container 的样式就可以了，不需要对 html 进行修改。

```
<!DOCTYPE html>
<html lang="en">

<head>
    <style>
        .container {
            display: grid;
            grid-template-columns: 250px 1fr;
            grid-template-rows: 100px 1fr 100px;
            grid-template-areas:
                'header header'
                'aside  main'
                'aside footer';
            height: 100vh;
        }

        .header {
            grid-area: header;
            background: #b3c0d1;
        }

        .aside {
            grid-area: aside;
            background: #d3dce6;
        }

        .main {
            grid-area: main;
            background: #e9eef3;
        }

        .footer {
            grid-area: footer;
            background: #b3c0d1;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">Header</div>
        <div class="aside">Aside</div>
        <div class="main">Main</div>
        <div class="footer">Footer</div>
    </div>
</body>

</html>


```

实现响应式布局
-------

借助 grid 的`auto-fill`与`minmax`函数可以实现类似响应式布局的效果，可以应用在后台管理的表单布局等场景。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/XP4dRIhZqqUhV0X9klWdFub6fPn7RlvJeuCFGeicEiacEHz9xup1VghyAdYib2Z3watLmcMJmiaUJcw9ialm8CXIBXw/640?wx_fmt=other&from=appmsg)

```
<!DOCTYPE html>
<html lang="en">

<head>
    <style>
        .box {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            justify-content: space-between;
            gap: 10px;
        }

        .item {
            background: pink;
            height: 100px;
        }
    </style>
</head>

<body>
    <div class="box">
        <div class="item">1</div>
        <div class="item">2</div>
        <div class="item">3</div>
        <div class="item">4</div>
        <div class="item">5</div>
        <div class="item">6</div>
        <div class="item">7</div>
        <div class="item">8</div>
    </div>
</body>

</html>


```

兼容性对比
-----

flex 的兼容性

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/XP4dRIhZqqUhV0X9klWdFub6fPn7RlvJibHkUFpOEIXmACyqQTibfn8j5Nazbgtqayicw23HSWibUYibPDgx1RMcYFA/640?wx_fmt=other&from=appmsg)image.png

grid 的兼容性

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/XP4dRIhZqqUhV0X9klWdFub6fPn7RlvJFhPKoPyqicQMDY0VibmXzibOBlof7OrGEI5uWF0sCc4xCEx0Ba3qdhxhg/640?wx_fmt=other&from=appmsg)image.png

可以看到 grid 在兼容性上还是不如 flex，grid 虽然强大，但是在使用前还是需要先考虑一下项目的用户群体。

结尾
--

除了上述场景外肯定还有许多场景适合使用`grid`来完成。`grid`和 `flex`都是强大的布局方式，它们并没有明显的优劣之分。关键在于掌握这两种方法，并在开发中根据实际情况选择最合适的方案。

希望大家能有所收获！

### 最后  

Node 社群

```
我组建了一个氛围特别好的 Node.js 社群，里面有很多 Node.js小伙伴，如果你对Node.js学习感兴趣的话（后续有计划也可以），我们可以一起进行Node.js相关的交流、学习、共建。下方加 考拉 好友回复「Node」即可。

   “分享、点赞、在看” 支持一下

```