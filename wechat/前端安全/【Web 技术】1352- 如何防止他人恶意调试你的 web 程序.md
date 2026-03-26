> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/fc3rQdoLfPfaywDXzx7ENQ)

![](https://mmbiz.qpic.cn/mmbiz_gif/mhEq05rZhZ976ILp7oorg2njd04Y70icYlIHMIXLBzQPEDM4nLH6vd47kjWcyone9e9SY168CCHlGUZibx7lRoPg/640?wx_fmt=gif)

1 前言
----

看到社区很多都在讨论**如何调试, 如何高级的调试, 以及一些调试的奇技淫巧**, 今天我想和大家聊聊, **怎么禁止调试, 禁止他人调试我们的程序**

为什么会有这篇文章呢, 源自一次我寻找盗版电影的遭遇, 一次好奇心的驱使下, 由于很多这种平台都是只做搬运, 不做存储, 因为存储盗版电影向他人提供是违法的, 特别是那种刚出的新电影! 当时好奇想通过看某站的控制台, 想了解一下他们是怎么是通过啥接口, 怎么请求, 请求来的格式啥样的, 抱着这样的好奇心, 开始了我的奇妙之旅...

**看完本篇文章你将学会**  
我无法断定你能学到什么, 但是以下是我希望你能从本篇文章中学到的:

1.  如何简单的防止你的程序被他人恶意调试
    
2.  逆向思维学会如何更好的调试
    

2 具体实现
------

防止调试的方法, 这里我们主要是通过不断`debugger`的方法来疯狂输出断点, 让控制台打开后程序就无法正常执行  
我们都知道`debugger`只有在控制台被打开的时候才会执行, 所以后面的所有方法都是围绕着这一特性来进行, 废话不多说, 我将通过以下几个案例向你们展示**道高一尺魔高一丈**的道理, 先上代码:

### 方法一:

```
(() => {    function block() {        setInterval(() => {            debugger;        }, 50);    }    try {        block();    } catch (err) {}})();
```

通过上方的代码我们可以看到, 在页面中打开控制台后, 会有以下结果:

![](https://mmbiz.qpic.cn/mmbiz_gif/mhEq05rZhZ976ILp7oorg2njd04Y70icYbQibhhMPnpvhDccPTMgeAesRJyiaPAqbSww5tk3DjibHPicXKEzND2ibJ0Q/640?wx_fmt=gif)

需要在这里说明以下几点:

1.  程序被`debugger`阻泄了, 我们无法像以往一样在 Source Tab 中的对应 js 代码处添加断点调试, 无法调试程序的执行逻辑. 在程序异常复杂且被混淆后的代码是异常难读的! 通常我们会在 source 的左边加上 `breakpoint` 来让程序每次走到加点的地方停下来, 以便让我们查看一些变量的值或是步骤的流程逻辑 (如下图所示)
    

![](https://mmbiz.qpic.cn/mmbiz_png/mhEq05rZhZ976ILp7oorg2njd04Y70icY6hQ3G1SuzYqaSjroUEr2mESib3GLhiamtfiaAF1s0tMxwfvx9EHctYFUA/640?wx_fmt=png)

2.  我们都知道, 第一次打开控制台是看不到 network tab 中的任何请求的, 所以我们想通过 network tab 来查看网页都做了哪些请求, 也是看不到的, 当我们打开控制台就会出`debugger`阻挡我们, 我们可以通过下面的解决方法来处理, 或者是用抓包工具来查看具体的请求
    

**大家可以先不看解决方法, 想想如果是你, 这个时候怎么突破这个屏障呢?** 第一次遇到这种情况我也是很懵, 不知道咋处理, 后面发现问题简直不要太简单, 我们可以带着疑问来看:

**对于第一个示例, 我们如何解决?(绕过它)**

![](https://mmbiz.qpic.cn/mmbiz_gif/mhEq05rZhZ976ILp7oorg2njd04Y70icYdwLeR1UnKtk1lXyuXIP2BjArYzKicurBK4ULlE968GnMaKNNKlYpktQ/640?wx_fmt=gif)

**答案是: 禁止断点**

可以看到很简单, 在 Chrome 控制台的 Source Tab 页点击 Deactivate breakpoints 按钮或者按下 Ctrl + f8(如下图所示)。但是对于控制台不熟悉的小伙伴, 很难会想到这里去.

![](https://mmbiz.qpic.cn/mmbiz_png/mhEq05rZhZ976ILp7oorg2njd04Y70icY5j58hRRElafxOj0OicNLJ2ALPvC9fmPPal4kLXQtWPESg5oP2oetFvQ/640?wx_fmt=png)

但是, 难道这篇文章就这样结束了? 那我可顶不住小伙伴们的 **"就这?"** 😂

其实, 上面的解决方法并没有帮我们解决根本问题, **我们需要做的是调试, 上面虽然把`debugger`都去掉了, 但是我们也无法在通过点击每一行代码左边的行号添加 `breakpoint` 了**, 所以根本性的问题, 并没有解决, 只是去除了那碍眼的疯狂 debugger, 我们还是得另辟蹊径

### 方法二:

对对应的代码行, 通过添加`logpoint`为 false，然后按回车后刷新网页，发现成功跳过无限 debugger, 于是我们就可以愉快的自由调试了~

![](https://mmbiz.qpic.cn/mmbiz_gif/mhEq05rZhZ976ILp7oorg2njd04Y70icYNS8zrsgu95w4Ix8ic4ia1E1oJSuoIK4b5paCvamEC0SIyqNt8617jR0A/640?wx_fmt=gif)

**对应的还有一种方法**

即通过`add script ignore list`来添加需要忽略执行代码行或文件

![](https://mmbiz.qpic.cn/mmbiz_gif/mhEq05rZhZ976ILp7oorg2njd04Y70icYtGkLQeGa2y3ulsqIW2CHESd7myNVic6VzPVzE04BayUC9dFbUGSOvTg/640?wx_fmt=gif)  
**可以看到, 我们也可以通过删除 script ignore list 里已添加的忽略代码, 恢复初始状态**

![](https://mmbiz.qpic.cn/mmbiz_png/mhEq05rZhZ976ILp7oorg2njd04Y70icYNuLwESYCQA0mBJWNU3LLbTrgFpibqicD0VWicX2utfgYxw0nMxibic63ic0w/640?wx_fmt=png)

**但是, 你这么聪明, 那人家不得想想对策?**

**对于上面的第一个方法** 🎈

将`setInterval(() => {debugger;}, 50);`写在一行中, 你即使通过添加`logpoint`为 false, 也没用, 仍然是疯狂 debugger, 即使你可能想到, 通过左下角的代码格式化, 来格式一下`setInterval(() => {debugger;}, 50);`将它变成多行的, 也是没用的, 仍然会在刷新后重新弹 debugger

```
(() => {    function block() {        setInterval(() => {debugger;}, 50);    }    try {        block();    } catch (err) {}})();
```

![](https://mmbiz.qpic.cn/mmbiz_png/mhEq05rZhZ976ILp7oorg2njd04Y70icYgskbYvusQQCBQVawBRWPngpXhcxanwkNUiaN22MAyAEVJia6DOLdKvHw/640?wx_fmt=png)

**对于第二个方法, 我们对代码进行如下改造**😬

```
(() => {    function block() {        setInterval(() => {            Function("debugger")();        }, 50);    }    try {        block();    } catch (err) {}})();
```

我们可以通过将`debugger`改写成`Function("debugger")();`的形式, 来应对; Function 构造器生成的 debugger 会在每一次执行时开启一个临时 js 文件, 哈哈~ 对方表示好无奈 😅

**于是会有以下结果**

![](https://mmbiz.qpic.cn/mmbiz_gif/mhEq05rZhZ976ILp7oorg2njd04Y70icYUWib0IAc4SkibbAVSZWIbxpsGHEB5Ds2CibOMwXKMaeMHZ9dqn6VicAlZA/640?wx_fmt=gif)

这无限套娃, 真够狠的, 我们要坚信**正义最后总会胜利**, 不能给想非法调试我们程序的人机会, 所以我们要把各种情况都考虑周全, **可以说这种方法是最恨的, 但是这还不算完~** (好家伙~ 😀 想非法调试我程序, 那你就得战胜我)

### 强化以上方法

上面的代码由于没有加密混淆, 多少可能还是会被别人读一些, 那么我们加密混淆看看是啥样的  
好家伙, 你这咋读?

```
eval(function(c,g,a,b,d,e){d=String;if(!"".replace(/^/,String)){for(;a--;)e[a]=b[a]||a;b=[function(f){return e[f]}];d=function(){return"\\w+"};a=1}for(;a--;)b[a]&&(c=c.replace(new RegExp("\\b"+d(a)+"\\b","g"),b[a]));return c}('(()=>{1 0(){2(()=>{3("4")()},5)}6{0()}7(8){}})();',9,9,"block function setInterval Function debugger 50 try catch err".split(" "),0,{}));
```

格式化后的样子

![](https://mmbiz.qpic.cn/mmbiz_png/mhEq05rZhZ976ILp7oorg2njd04Y70icY72lYrlcBppv01WN2UTcHGv8uJHAskXIqcoWHvu7nq8BV9mRV1VK3kg/640?wx_fmt=png)

我们继续对代码进行改造, 让对方尽量的难以识别我们的代码  
将`Function("debugger").call()`改成`(function(){return false;})["constructor"]("debugger")["call"]();`并且, 添加条件, 当窗口外部宽高, 和内部宽高的差值大于一定的值, 我把 body 里的内容全部清空掉, 看你还能不能操作我的按钮啊啥的~ 哈哈哈 😀

![](https://mmbiz.qpic.cn/mmbiz_png/mhEq05rZhZ976ILp7oorg2njd04Y70icY2ic0OTxYjw01qret2OfKkf8PZvWjTtfMdw3XzHRbmAnuu95gQ0U5wYw/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_gif/mhEq05rZhZ976ILp7oorg2njd04Y70icY0r7hqMy2GJtb3o4TgpiahySTEqEhIR99eoxIjzdicwO5gk7ibkGicXqbfg/640?wx_fmt=gif)

**需要特别说明的是**: 像 toG 的项目或者是一些为了保护自己的版权又或者是一些比较敏感的项目, 出于安全的考虑在部署到生产环境后最好是不让别人调试的, 当然, 前端所做的也就那么一些, 需要前后端一起配合, 便可以很好的对项目或者数据进行私密的保护 🧡

**最后: 附上这份未混淆的来之不易的的代码 (记得混淆后使用哦~)** 😢 一定要记得点赞加关注~ 原创太不容易了.

你可以把它当作你的工具函数, 在需要不让别人轻易调试的项目中引用

```
(() => {    function block() {        if (            window.outerHeight - window.innerHeight > 200 ||            window.outerWidth - window.innerWidth > 200        ) {            document.body.innerHTML =                "检测到非法调试,请关闭后刷新重试!";        }        setInterval(() => {            (function () {                return false;            }                ["constructor"]("debugger")                ["call"]());        }, 50);    }    try {        block();    } catch (err) {}})();
```

3 推荐一个调试页面的小技巧
--------------

说了那么多的防止被人调试, 那么最后也说一个本人觉得眼前一亮的调试样式的方法  
通过给`style`标签添加`style="display: block"`,`contenteditable`两个属性实现在页面中便捷的调试样式

![](https://mmbiz.qpic.cn/mmbiz_gif/mhEq05rZhZ976ILp7oorg2njd04Y70icY2gB8bXbm5qZc5aqOKjoqgLOeX01WAowrLR3LDVfXVmHES1MibrGQChw/640?wx_fmt=gif)

复制下方代码到你的 html 文件中, 玩一下~

```
<!DOCTYPE html><body>    <div>来调试我吧~</div>    <style style="display: block" contenteditable>        body {            background-color: rgb(140, 209, 230);            color: white;        }        div {            background-color: green;            width: 300px;            height: 300px;            line-height: 300px;            text-align: center;        }    </style></body>
```

4 最后
----

我所知道的禁止调试的方法就只有如上所述, 但是肯定还有很多好玩的, 小伙伴们可以在评论区留言, 一起共同学习~

**最后抛出一个问题, 如何监测控制台是否被打开 (我上面提到过), 感兴趣且有头绪, 或者已经有方法的小伙伴可以小伙伴可以在评论下方说说自己的想法, 也可以加我们交流群一起玩耍~**