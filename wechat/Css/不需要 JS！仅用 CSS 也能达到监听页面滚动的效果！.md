> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/kk5oXTAe72hbe72hnc0Jrg)

在网页中，经常会用阴影来突出层级关系，特别是顶部导航，但有时候设计觉得没必要一开始就显示阴影，只有滚动后才出现。比如下面这个例子，注意观察头部阴影

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtLoLfF1yl6ewqguXEmsj780Nxiacv98O7covgOELiaImEW95QaXM7UQaxZKXEj3LdLoLrXb8uJWD0wA/640?wx_fmt=gif)

作家专区

可以看到，只有滚动以后才出现阴影。一般情况下，使用 JS 监听滚动事件动态添加类名就可以实现，不过经过我的一番尝试，发现这种效果仅仅使用 CSS 也能轻易实现，下面是实现效果

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtLoLfF1yl6ewqguXEmsj780ElvFhzZzgicASlzjbJ5m45jBVX1ZfQI4tt23ufsLII4MNB90oy6C3TA/640?wx_fmt=gif)实现效果

你也可以提前访问 CSS auto header shadow(juejin.cn)[1] 查看实际效果。那 如何实现的呢，花两分钟时间看看吧~

一、头部固定定位
--------

假设有这样一个布局

```
<header>LOGO</header><main>很多内容文本</main>
```

简单修饰一下

```
header{  background: #fff;  font-size: 20px;  padding: 10px;}
```

头部固定定位有很多种方式，比较常见的是使用 `fixed`定位

```
header{  position: fixed;  top: 0}
```

但是，`fixed`定位是不占空间的，会导致遮挡内容区域，所以一般还需要预留头部一部分空间出来，比如这样

```
main{  margin-top: 头部的高度}
```

在这里，我更推荐使用`sticky`定位，**在吸顶的同时，还能保留原有的占位**

```
header{  position: sticky;  top: 0}
```

效果如下，只是没有阴影

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtLoLfF1yl6ewqguXEmsj7805icUIialHevib67Tu9J30dEBmCvnNPmwVNL8HoopMnF1cxn2su9AsDqibw/640?wx_fmt=gif)头部固定定位

二、CSS 实现原理
----------

实现这个效果，需要一点点 “CSS 障眼法”。假设有一层阴影，在默认情况下用一个元素遮挡起来，以下都称之为 “遮挡物”。这里需要考虑好各个部分的层级关系，稍微有些复杂，如下所示（侧面层级关系图）

![](https://mmbiz.qpic.cn/mmbiz_jpg/xvBbEKrVNtLoLfF1yl6ewqguXEmsj780hXb7KNtsEdcHh7o3r7LzyfmLbVghknWNQDOfpHstqRfJict7FenibUibA/640?wx_fmt=jpeg)层级关系

> 层级关系为：头部 > 遮挡物 > 阴影 > 内容

在滚动过程中，阴影就自动就可见了，遮挡物正好又会被头部遮住，注意，遮挡物和内容是一起滚动的，动态演示如下

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtLoLfF1yl6ewqguXEmsj780R3O29NxqkKDrriaVAcPofboVBXTQPoYrtNiaib3HMWBrJ4tM47xgZgerw/640?wx_fmt=gif)

层级关系滚动原理

原理就是这样，下面看具体实现

三、CSS 具体实现
----------

根据以上原理，这里需要添加一个元素，阴影和遮挡物都可以用伪元素生成

```
<header>LOGO</header><shadow></shadow><main>很多内容文本</main>
```

这里阴影的位置是固定的，也不需要占据空间，所以可以直接用`fixed`定位，也可以不设置`top`值，因为默认就位于非定位时的位置（又体现出 `sticky` 的好处了），也就是头部下面

```
shadow::before{  content: '';  box-shadow: 0 0 10px 1px #333;  position: fixed; /*无需 top 值*/  width: 100%;}
```

> `fixed` 定位在不设置 top 或者 left 值时，仍然位于原先位置，但是会在这个位置固定下来

遮挡物可以用纯色填充，**而且需要跟随内容滚动，也不需要占据空间，同时也为了提升层级**，可以设置一个`absolute`定位

```
shadow::after{  content: '';  width: 100%;  height: 15px;  background: #fff;  position: absolute; /*无需 top 值*/}
```

> `absolute`定位在不设置 top 或者 left 值时，仍然位于原先位置，也会跟随内容滚动

现在再来看看层级关系，**头部、阴影、遮挡物都设置了定位**，根据 dom 先后顺序，此时

> 层级关系为：遮挡物 > 阴影 >  头部 > 内容

头部应该是最高的，所以需要单独改变一下层级

```
header{  /**/  z-index: 1;}
```

> 层级关系为：头部 > 遮挡物 > 阴影  > 内容

这样就实现了文章开头所示效果，效果如下

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtLoLfF1yl6ewqguXEmsj780ElvFhzZzgicASlzjbJ5m45jBVX1ZfQI4tt23ufsLII4MNB90oy6C3TA/640?wx_fmt=gif)实际效果

三、更柔和的阴影
--------

其实上面的效果已经很好了，但是稍微有点生硬。仔细观察，在慢慢滚动过程中，阴影有一种 “向上推进” 的感觉，如下

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtLoLfF1yl6ewqguXEmsj780r1tYYfrSHPkQUKw9QWFdyUjDB3bnU3PKpBJmarJcYiaVH6ic41Y5KBzg/640?wx_fmt=gif)略微生硬的效果

有没有办法让这个过程更柔和一点呢？比如透明度的变化？

当然也是可以的，实现也比较简单。上面比较生硬的原因是，遮挡物是纯色的，如果换成**半透明渐变**是不是就好一些呢？

```
shadow::after{  height: 30px;  background: linear-gradient(to bottom, #fff 50% , transparent);}
```

效果如下

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtLoLfF1yl6ewqguXEmsj780uxgczHsY4nUKXnTkDLhEW1FEoYNUy5DjyYD96UkBBRVGy7k3BDaK9A/640?wx_fmt=gif)比较柔和的效果

这样阴影出现的效果就不再是 “向上推进” 的效果，你觉得怎么样呢？

**重点来了~** 下面是完整 CSS 代码（20 行不到~）

```
header{  position: sticky;  background: #fff;  top: 0;  font-size: 20px;  padding: 10px;  z-index: 1;}shadow::before{  content: '';  box-shadow: 0 0 10px 1px #333;  position: fixed;  width: 100%;}shadow::after{  content: '';  width: 100%;  height: 30px;  background: linear-gradient(to bottom, #fff 50% , transparent);  position: absolute;}
```

HTML 结构也很简单

```
<header>LOGO</header><shadow></shadow><main>很多内容文本</main>
```

你可以访问在线链接 CSS auto header shadow(codepen.io)[2] 或者 CSS auto header shadow(juejin.cn)[3]

四、总结和展望
-------

以上就是全部分享内容了，是不是又掌握一个 CSS 小技巧？用到了 3 个定位属性，几乎零成本，复制几行代码，马上就可以用起来了，下面总结一下实现要点：

1.  固定头部的布局推荐用 `sticky` 实现，好处是可以保留头部占位，无需额外预留
    
2.  整体实现思路是 CSS 障眼法和 CSS 层级，相互遮挡
    
3.  `fixed` 定位在不设置 top 或者 left 值时，仍然位于原先位置，但是会在这个位置固定下来
    
4.  `absolute`定位在不设置 top 或者 left 值时，仍然位于原先位置，也会跟随内容滚动
    
5.  纯色遮挡在滚动时有些生硬，半透明渐变遮挡在滚动时会更加柔和
    

在未来，像这类滚动相关的交互都可以通过`@scroll-timeline`来实现，有兴趣的可以提前了解这方面内容，只是现在几乎不可实际生产使用（目前需要手动开启实验特性），可以预料，随着 CSS 新特性的不断发展，像这类 “CSS 奇技淫巧” 肯定会被官方逐步替代，体验也会更加完善，

但是，并不是说这些思考是无用了，实际需求千千万，官方不可能一一照顾到，就算有规划，有草案，可能已经是多年以后了，所以学习 CSS 一定不要停止思考，停止想象，这大概也是 CSS 比较有趣的地方吧~ 最后，如果觉得还不错，对你有帮助的话，欢迎点赞、收藏、转发❤❤❤

### 参考资料

[1]

**CSS auto header shadow(juejin.cn):** _https://code.juejin.cn/pen/7110857388135022606_

[2]

**CSS auto header shadow(codepen.io):** _https://codepen.io/xboxyan/pen/yLvdgXw_

[3]

**CSS auto header shadow(juejin.cn):** _https://code.juejin.cn/pen/7110857388135022606_

- EOF -

![](https://mmbiz.qpic.cn/mmbiz_svg/SQd7RF5caa2sRkiaG4Lib8FHMVW1Ne13lrN37SiaB2ibEDF4OD31Vxh71vWXuOC2VaWME2CltDJsGdA5LnsdhdJianUR3GkoXe1Nx/640?wx_fmt=svg)

**加主页君微信，不仅前端技能 + 1**

![](https://mmbiz.qpic.cn/mmbiz_svg/SQd7RF5caa2sRkiaG4Lib8FHMVW1Ne13lr4b5vuiaNBnGZKzQI3kAgC4XOZVFnBxvvrXI2GOpiaH06UjrJSc4fqoPBZDKzPVRicCN/640?wx_fmt=svg)![](https://mmbiz.qpic.cn/mmbiz_png/UzDNI6O6hCFBc2O6VZiaHtzQn9pYBAmTD9EaEHCDBLkxE8Pln85fKLpIy3sRib8FX0Lzoagbs8TYxC5aAgTubZyw/640?wx_fmt=png)

主页君日常还会在个人微信分享**前端开发学习资源**和**技术文章精选**，不定期分享一些**有意思的活动**、**岗位内推**以及**如何用技术做业余项目**

![](https://mmbiz.qpic.cn/mmbiz_png/zPh0erYjkib2sa7NhibalQwGOAtRbK4f2BucxJ3KdFXHqP6mfstVnTOe4ibUMptslaG2KCdy0hsWGTmia081OOLkCw/640?wx_fmt=png)

加个微信，打开一扇窗

推荐阅读  点击标题可跳转

1、[离谱！CSS 实现中国传统剪纸艺术](http://mp.weixin.qq.com/s?__biz=MzAxODE2MjM1MA==&mid=2651607846&idx=2&sn=cf6a84ccb7f70332f9d27c1afb5b6599&chksm=802284e7b7550df1b81b35638117461419d1ff54cca01b30b8308dcc871fcd2a59d9037a99f4&scene=21#wechat_redirect)

2、[如何用一行 CSS 实现 10 种现代布局](http://mp.weixin.qq.com/s?__biz=MzAxODE2MjM1MA==&mid=2651607614&idx=1&sn=6ed684e836828d0d61a92b934c70bb00&chksm=802285ffb7550ce91a84f7af0ca585c1da76a3e3d19c49a3705e24a766f42b867230730b242f&scene=21#wechat_redirect)

3、[纯 CSS 实现十个还不错的 Loading 效果](http://mp.weixin.qq.com/s?__biz=MzAxODE2MjM1MA==&mid=2651605972&idx=2&sn=5d00a4997252d45a1dcdc438498e8f8c&chksm=80229c15b755150370849607e01fb41e5a64fae0b752d2f8851b8720ddf2b5fb75cd5c4c5f98&scene=21#wechat_redirect)

觉得本文对你有帮助？请分享给更多人

推荐关注「前端大全」，提升前端技能

点赞和在看就是最大的支持❤️