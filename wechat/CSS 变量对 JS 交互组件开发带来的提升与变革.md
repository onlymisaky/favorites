> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/FSPISPvM2IzloTAWdpEoRQ)

#### 作者：@张鑫旭 原文：https://www.zhangxinxu.com/wordpress/2020/07/css-var-improve-components/

#### 一、CSS 变量带来的质变

CSS 变量带来的提升绝不仅仅是节约点 CSS 代码，以及降低 CSS 开发和维护成本。

更重要的是，把组件中众多的交互开发从原来的 JS 转移到了 CSS 代码中，让组件代码更简洁，同时让视觉表现实现更加灵活了。

我们通过几个案例来说明这一变化。

#### 二、简化了 JS 对 DOM 设置的介入

##### 案例 1：loading 进度效果

例如实现下图所示的变量效果：

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQSkds3aULlGvHoFGaRHYYXgkOWbIo9Tia0iaKv2Ax7QNjiavJ8ccG0RQQ5JDUKmYxtJrYzrJhsur1N0g/640?wx_fmt=png)

外面有一层背景层，然后里面有进度条，还有进度值。

在过去，会使用两层 div 元素，然后 JS 去改变里面有颜色条条的宽度，同时设置进度值。

也就是，loading 的进度效果和进度值全部都是 JS 直接设置的，JS 同时对应多个 HTML 信息。

现在，有了 CSS 变量，JS 所做的工作就非常简单，仅仅在容器元素上设置 loading 进度值即可，其他什么都不需要做，至于样式表现，或者进度值如何显示，全部都是 CSS 的事情。

相关代码如下：

html 代码

```
<label>图片1：</label>
<div class="bar" style="--percent: 60;"></div>
<label>图片2：</label>
<div class="bar" style="--percent: 40;"></div>
<label>图片3：</label>
<div class="bar" style="--percent: 20;"></div>
```

css 代码

```
.bar {
    height: 20px; width: 300px;
    background-color: #f5f5f5;
}
.bar::before {
    display: block;
    counter-reset: progress var(--percent);
    content: counter(progress) '%\2002';
    width: calc(1% * var(--percent));
    color: #fff;
    background-color: #2486ff;
    text-align: right;
    white-space: nowrap;
    overflow: hidden;
}
```

可以看到，我们只需要一层 div 标签，DOM 层级简单了，然后，需要修改的 HTML 变化项仅仅是一个 --percent 自定义属性而已。

#### 三、CSS 变量成为了 CSS API 接口

![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQSkds3aULlGvHoFGaRHYYXgq2LzlEQQeURETZaAqww1X4t55elhxNxMDfNqibchmXrlSmqhChUhFiaA/640?wx_fmt=jpeg)

过去点击提示，点击切换等效果都需要 JS 针对特定的元素进行样式设置，现在有了 CSS 变量，我们只需要一段非常简单的通用的全局 JS 就可以了，然后 JS 就可以玩耍自己应该玩耍的东西，其他效果，全部交给 CSS 处理。

这段 JS 如下：

```
/**
 * @author zhangxinxu(.com)
 * @description 点击页面任意位置，标记坐标位置
 */
document.addEventListener('mousedown', function (event) {
    var target = event.target;
    var body = document.body;
    var html = document.documentElement;
    // 设置自定义属性值
    body.style.setProperty('--pagex', event.pageX);
    body.style.setProperty('--pagey', event.pageY);
    html.style.setProperty('--clientx', event.clientX);
    html.style.setProperty('--clienty', event.clientY);
    html.style.setProperty('--scrolly', window.pageYOffset);
    target.style.setProperty('--offsetx', event.offsetX);
    target.style.setProperty('--offsety', event.offsetY);
    target.parentElement.style.setProperty('--target-width', target.clientWidth);
    target.parentElement.style.setProperty('--target-height', target.clientHeight);
    target.parentElement.style.setProperty('--target-left', target.offsetLeft);
    target.parentElement.style.setProperty('--target-top', target.offsetTop);
});
```

可以看到，JavaScript 代码再也不负责任何与交互行为相关的逻辑，直接变成了工具人，一个单纯地传递点击坐标位置，以及点击元素偏移和尺寸信息的工具人。

CSS 得到了什么呢？

得到了一个巨大的宝藏，一个随时可以拿来使用的宝藏。

我想要点击按钮的时候有什么花哨的反馈，或者点击页面空白也来个创意的交互提示，完全不成问题，随用随取，无比方便，无比自由。

可以说，上面这段 JS，或者类似的 JS 代码是未来 web 开发的标配。

我们来看看上面的代码可以实现怎样的效果。

##### 案例 2：按钮点击圈圈效果

点击按钮的时候有个圈圈放大的效果，圈圈放大的中心点就是点击的位置。

效果如下 GIF 所示：

![](https://mmbiz.qpic.cn/mmbiz_gif/pfCCZhlbMQSkds3aULlGvHoFGaRHYYXgH8ic7nYC7Vm6UI1micRu4SiaybNP9u7ConY2lAsDNXOrKq3wicT6DYs9JA/640?wx_fmt=gif)

核心 CSS 代码如下：

```
.btn:not([disabled]):active::after {
    transform: translate(-50%,-50%) scale(0);
    opacity: .3;
    transition: 0s;
}
.btn::after {
    content: "";
    display: block;
    position: absolute;
    width: 100%; height: 100%;
    left: var(--x, 0); top: var(--y, 0);
    pointer-events: none;
    background: radial-gradient(circle, currentColor 10%, transparent 10.01%) no-repeat 50%;
    transform: translate(-50%,-50%) scale(10);
    opacity: 0;
    transition: transform .3s, opacity .8s;
}
```

:active 时候隐藏，同时设置过渡时间为 0。于是，点击释放的时候，就会有过渡效果。

大家可以访问这个地址进行体验：https://xy-ui.codelabo.cn/docs/#/xy-button

##### 案例 3：点击页面出现文字效果

又例如，点击本文页面任意位置都会出现下图所示的提示信息。

![](https://mmbiz.qpic.cn/mmbiz_gif/pfCCZhlbMQSkds3aULlGvHoFGaRHYYXga0wdjawDw3hQUYEW1rnsQCeezB3HohQT0Xibm1en4A6JKic9iaHfRnz4w/640?wx_fmt=gif)

就是下面上面那段万能工具人 JS 加下面这段 CSS 实现的：

```
body:active::after {
    transform: translate(-50%, -100%);
    opacity: 0.5;
    transition: 0s;
    left: -999px;
}
body::after {
    content: 'zhangxinxu.com';
    position:fixed;
    z-index: 999;
    left: calc(var(--clientx, -999) * 1px);
    top: calc(var(--clienty, -999) * 1px);
    transform: translate(-50%, calc(-100% - 20px));
    opacity: 0;
    transition: transform .3s, opacity .5s;
}
```

##### 案例 4：两个按钮下划线滑来滑去效果

以前，下图这种点击选项卡按钮，然后下划线滑来滑去，尺寸还变化效果，使用纯 CSS 实现很考验功力，几乎 99.99% 的开发都是借助 JS 去查询对应 DOM 元素，然后设置宽高和位置实现的交互效果。

![](https://mmbiz.qpic.cn/mmbiz_gif/pfCCZhlbMQSkds3aULlGvHoFGaRHYYXgBQmCAI3tmDia47Lic5vAStIIvU55xRqg7Yq2lib67oToNFK18s2ND3kJQ/640?wx_fmt=gif)

现在，有了工具人 JS，只需要一段 CSS 就可以搞定了，甚至文字的高亮切换都可以纯 CSS 搞定，就是这么神奇。

下面这里的效果就是实现的实时效果（若没有效果，请访问原文）：

点击任意的选项卡元素，就可以看到下划线滑到对应位置，同时文字有高亮的效果。

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQSkds3aULlGvHoFGaRHYYXgcHU6VfSCIfJ8tCibLW0voglbhjtgnlu8tuwg9ejLhpsXVdkLFEC0oUg/640?wx_fmt=png)

相关代码如下：

```
<div class="yw-tab-tab"> 
  <a href="javascript:" class="yw-tab-a">QQ阅读</a>
  <a href="javascript:" class="yw-tab-a">起点读书</a>
  <a href="javascript:" class="yw-tab-a">红袖读书</a>
  <a href="javascript:" class="yw-tab-a">飞读免费小说</a>
</div>
```

```
.yw-tab-tab {
    position: relative;
    display: flex;
    max-width: 414px;
    justify-content: space-between;
    border-bottom: 1px solid #717678;
    background-color: #fff;
    margin: 30px auto;
}
.yw-tab-tab::before,
.yw-tab-tab::after {
    position: absolute;
    width: calc(var(--target-width, 0) * 1px);
    left: calc(var(--target-left, -299) * 1px);
    color: #2a80eb;
}
.yw-tab-tab[style]::before,
.yw-tab-tab[style]::after  {
    content: '';
}
.yw-tab-tab::before {
    background-color: currentColor;
    height: calc(var(--target-height) * 1px);
    mix-blend-mode: overlay;
}
.yw-tab-tab::after {
    border-bottom: solid;    
    bottom: -2px;
    transition: left .2s, width .2s;
}
.yw-tab-a {
    color: #717678;
    padding: 10px 0;
}
```

如果是移动端访问，需要 mousedown 事件修改成 touchstart，我就懒得调整了。

#### 四、web 组件的很多 API 接口可以拜拜了

以前 web 组件有一个什么功能，就新增一个 API 接口，看上去很厉害，实际上，加着加着，API 越来越多，组件也越来越重，学习成本也越来越高，最后走向了死胡同，变得笨重，迎来了灭亡。

现在，可以改变思路了。

那些与交互表现密切相关的功能，事实上仅仅在组件容器元素上传递 CSS 自定义属性就可以了，无需负责具体的定位，显隐，或者样式变化，全部交给 CSS。

因为设计表现的东西是上层的，灵活的，个性的，应该在 CSS 层面进行驾驭才是合理的，匹配的。

例如上面提到的 loading 组件，无论是条状的还是饼状的都是这样的处理逻辑，只负责传递进度值，样式无需关心。

又例如滑条框（如下图 Ant Design 中的滑条的位置和提示效果）、popup 提示框等都可以通过一个 CSS 自定义属性完成，JS 仅需要把 CSS 无法获取的数据传递到祖先元素上，不需要负责 UI 样式。

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQSkds3aULlGvHoFGaRHYYXgZiaD0U8c0mHoPWnm4TMnibJ7W5sjcC4crpfxcuWD3icK4ibulP0xgWW5Fg/640?wx_fmt=png)

#### 五、结语

结语个鬼大头啊，眼睛都睁不开了。

总之，交互开发实现的思路可以发展转变了，CSS 变量，真香！

最后
--

欢迎关注【前端瓶子君】✿✿ヽ (°▽°) ノ✿  

欢迎关注「前端瓶子君」，回复「算法」，加入前端算法源码编程群，每日一刷（工作日），每题瓶子君都会很认真的解答哟！  

回复「交流」，吹吹水、聊聊技术、吐吐槽！

回复「阅读」，每日刷刷高质量好文！

如果这篇文章对你有帮助，「在看」是最大的支持  

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQQYTquARVybx8MjPHdibmMQ3icWt2hR5uqZiaZs5KPpGiaeiaDAM8bb6fuawMD4QUcc8rFEMrTvEIy04cw/640?wx_fmt=png)

》》面试官也在看的算法资料《《

“在看和转发” 就是最大的支持