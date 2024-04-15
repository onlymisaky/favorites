> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/FjHItYwxJalEPP2b52dQOA)

### 我的需求是什么

我希望实现一个能适应不同分辨率的大屏，因为客户要求大屏能同时部署在普通 pc 端及加宽大屏上。这个需求比较普遍，一般的大屏布局是基本没问题的，如果你没有用百分比或者 vw/vh 布局，直接用 px 也是可以的，高度自适应，宽度写死也能自动适应，因为大屏横向的留白很多。

### 总是会遇到新问题

然而，有些时候总会遇到一些特殊情况，比如分辨率变化后，有些 vw/vh 代表的值相应会变化，再杂揉 transform: rotate 一些效果，原来相连的折线可能就连不上了。所以，针对这种情况，你需要针对不同分辨率，做一些判断，甚至再加一些计算。

### 为什么用 less

基于上面的需求和问题，我最后选择了 less 实现了。选择 Less 而不是 sass 就是感觉这个更轻便，也不用管 node 版本，而且基本够用了。如果不知道 less 的，less 中文官网可以先看看。

### 实现方案

其实我也尝试过用 less.modifyVars 去动态修改变量，但是最终并没有成功，因为引用 less 文件这一步就把我难住了，这是很奇怪的地方。看过很多方案，都是在 index.html 页面静态引用，我尝试过，并没有成功，如果有哪个大佬实现了，欢迎在文章后面给出示例。接下来就给大家说下我的方案吧。

#### 静态编译配置

直接在 vuecli 配置文件里引用 less 文件，这样我感觉是最简单的，官网的那种静态引用着实没看明白。你还可以在这里定义你要用到的变量，它们会覆盖 less 文件中变量的初始值。

```
css: {    loaderOptions: {      less: {        additionalData: `@import "~public/css/utils.less";`,        lessOptions: {          modifyVars: {            designWidth: 2510,            designHeight: 960,          },          javascriptEnabled: true,        },      },    },  },
```

前面说了，我其实是想用 less.modifyVars 这种高级手法来动态改变变量值的，奈何我一开始就选择了`静态编译`这个方案，这就意味着，变量值是无法改变的，你可以理解为 less 代码已经被编译过了，不会再编译第二次，所以动态修改无效。于是我想到了媒体查询。。

#### 用媒体查询解决变量

媒体查询应该知道的都知道，用法很简单，上代码：

```
// 默认设计稿的宽度1920\2510
@designWidth: 1920;

// 默认设计稿的高度1080\960
@designHeight: 1080;

.px2vw(@name, @px) {
  @media all and (max-width: 3700px) {
    @{name}: (@px / 3700) * 100vw;
  }
  @media all and (max-width: 2510px) {
    @{name}: (@px / @designWidth) * 100vw;
  }
  @media all and (max-width: 1920px){
    @{name}: (@px / 1920) * 100vw;
  }
}

.px2top(@px) {
  @media all and (max-width: 3700px) {
    top: ((@px - 12) / 960) * 100vh;
  }
  @media all and (max-width: 2510px) {
    top: ((@px - 15) / @designHeight) * 100vh;
  }

  @media all and (max-width: 1920px){
    top: (@px / 1080) * 100vh;
  }
}
```

我只摘取了部分示例代码，这里用到 less 混合写法，混合写法还不清楚的可以到官网这里多看下，我就不啰嗦了。它既有 vue 中混入的概念，又能像函数一样带参数，甚至还有函数计算，非常好用。

另外这个示例中要注意的是媒体查询的用法，我是把分辨率高的放上面，从大到小按顺序排列，这样保证各个分辨率对应的样式不会冲突。

### 正文用法

在代码中使用这些混合也比较简单，这里给出示例：

```
.line1 {        position: relative;        .px2vw(width,2);        .px2line(258);        .px2top(250);        .px2vw(left, -4);        transform: rotate(-90deg);        background: #fffd77;      }
```

基本上，你已经可以把混入理解成自定义函数了，用起来还是挺爽的，试一下吧。本来想用 less.modifyVars 实现动态切换样式的，结果整了一个这套拼凑的方案，管他呢，能抓老鼠就是好猫！

### 接榜领题

如何用 less.modifyVars 实现动态切换样式，希望有大佬给出明示，网上案例我基本试了一遍，没成功的。在此感谢！