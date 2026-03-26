> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/Jauo0ZYmvx9LTaic-8sOww)

前言
--

在很多业务场景中，我们的`style`样式可能会根据业务逻辑的变化而变化，这个时候大家最容易想到的方案就是多写几个`class`类，根据不同场景应用不同的类，比如这样：

```
<div  :class="{  [$style.sign_day]: true,  [$style.sign_today]: getSignStatus(item) == 1,  [$style.sign_notyet_day]: getSignStatus(item) == 6,  [$style.sign_day_dark]: theme == 'dark',  }"></div>
```

```
<style lang="scss" module> .sign_day { background: red; } .sign_today { background: yellow; } .sign_notyet_day { background: blue; } .sign_day_dark { background: orange; } </style>
```

这样虽然也是一种不错的方式，但是如果类型有非常多的话，那么你就得在`vue`模版里面写大量的判断表达式，并且在`style`中写大量的`class`类。

要是在`style`中也可以直接使用`script`中的 **JS 变量**，那么这种场景处理起来是不是会更方便一点呢？

Vue2 CSS 变量
-----------

在`Vue2`中，遇到以上业务场景如果我们不想写大量的`class`类的话，可以借助`css`中的`var()`函数来实现

> ❝
> 
> `var()`可以插入一个自定义属性（有时也被称为 “CSS 变量”）的值，用来代替非自定义属性中值的任何部分。

**比如：**

在模版中调用`getStyle`函数获取颜色值，并且定义成`css变量`

```
<div v-for="item in signList"      :key="item.day"      :class="$style.sign_day"      :style="{ '--color': getStyle(item) }" >   {{ item.title }} </div>
```

生成颜色值

```
getStyle(item) {  switch (item.status) {    case 0:      return '#f8ae00'    case 1:      return '#e5353e'    case 2:      return '#1fddf4'    case 3:      return '#1ff46a'    default:      return '#191919'  }},
```

然后就可以只写一个`css类`了

```
.sign_day {   width: calc((100vw - 72px) / 4);   height: 80px;   margin-top: 8px;   border-radius: 8px;   display: flex;   justify-content: center;   align-items: center;   background-color: #f5f5f5;   color: var(--color); }
```

  

![](https://mmbiz.qpic.cn/sz_mmbiz_png/aw5KtMic7pia49J72f7meOWc1Fl2Zz0yOwB1AvjUQrZpFnh3k81vEHFRGsnJEtu4kdWxQnPkeicLSphbPDia1eicTFg/640?wx_fmt=png&from=appmsg)

**这种方案的原理其实就是借助了 CSS 的自定义变量以及 CSS 的作用域来实现的**

所以它需要两步：

*   自定义 CSS 变量（考虑作用域范围）
    
*   使用 CSS 变量
    

实际上在 Vue3 中还有更简便的方案！

Vue3 v-bind()
-------------

> ❝
> 
> 在 Vue3 单文件组件的 `<style>` 标签支持使用 `v-bind`  函数将 CSS 的值链接到组件中的数据。

所以以上场景还可以这样实现：

模版：

```
<div :class="$style.day_item"> {{ dayItem.title }} </div>
```

计算颜色值：

```
const color = computed(() => {    switch (props.dayItem.status) {    case 0:        return '#f8ae00'    case 1:        return '#e5353e'    case 2:        return '#1fddf4'    case 3:        return '#1ff46a'    default:        return '#191919'    }})
```

style 调用`v-bind()`使用 setup 中的变量

```
<style lang="scss" module> .day_item {   color: v-bind(color); } </style>
```

  

![](https://mmbiz.qpic.cn/sz_mmbiz_png/aw5KtMic7pia49J72f7meOWc1Fl2Zz0yOwg2eb2sYnc6W83mweXMh0FkLz3njVkxiawiabPXsiaoNXahYvoJpcE4XjA/640?wx_fmt=png&from=appmsg)

从该图我们可以发现 Vue3 中的`v-bind()`原理与上面的 CSS 变量的原理一样，都是**借助了 CSS 的自定义变量以及 CSS 的作用域来实现的**

只不过不同的是`v-bind()`生成的 CSS 变量前面多了一串`hash`

Vue3 是如何编译 v-bind() 的？
----------------------

### 猜测流程

我们可以从编译结果来进行反推

首先是我们的 JS 部分，编译成了以下内容：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/aw5KtMic7pia49J72f7meOWc1Fl2Zz0yOwKuHDicGYYkapIEX6iaibQDuxBSlMKXNA63dCyfvDto6sbz83fjl1q1xoQ/640?wx_fmt=png&from=appmsg)

这里会比没使用`v-bind()`的组件多出一个`_useCssVars()`函数

```
_useCssVars((_ctx) => ({  "5d92a9f9-color": color.value}));
```

能不能猜到这个函数的作用是什么？如果不能，接着看下面一张图👇

![](https://mmbiz.qpic.cn/sz_mmbiz_png/aw5KtMic7pia49J72f7meOWc1Fl2Zz0yOw00Lkcy38EuaxmBQibQr9Ba2h5eTpZTu20M7VibR3244Vae6cJVMcagZA/640?wx_fmt=png&from=appmsg)

这张图是组件的`style`部分编译之后的产物，可以看到

```
.day_item {    color: v-bind(color);}
```

编译成了

```
"._day_item_1oe25_1 {\n  color: var(--5d92a9f9-color);\n}"
```

也就是说我们使用的`v-bind`最终也是编译成了原生 CSS 中`var`函数，原理也是使用 **CSS 的自定义变量**

但是这里只有使用，并没看到`css变量定义`的地方🤔，现在能够猜测到`_useCssVars()`函数的作用是什么吗？大概率就是用来生成`css自定义变量`了。

接下来我们可以到源码中进行验证：

### 源码验证

1. 找到源码中的 doCompileStyle 函数，打上断点，然后就可以启动 debug 模式了

![](https://mmbiz.qpic.cn/sz_mmbiz_png/aw5KtMic7pia49J72f7meOWc1Fl2Zz0yOwcNPyZlKmEgL8cogDkUZJpHf5t97CgjgU07Qr078NYic9uxU63OCaCrw/640?wx_fmt=png&from=appmsg)

2. 接着往下走你会看到一个 shortId 变量，它此时的值是什么呢？

  

![](https://mmbiz.qpic.cn/sz_mmbiz_png/aw5KtMic7pia49J72f7meOWc1Fl2Zz0yOw7zY60nMMbIDQPsfYST7WicGucNbVCOicN4fRd31EvZBiagNlhJxLPt2fQ/640?wx_fmt=png&from=appmsg)

  

是不是有点眼熟，没错它就是后面会出现在 CSS 变量前面的那一串`hash`

3. 再接着往下走，我们可以看到 postcss 插件中添加了一个 cssVarsPlugin 插件

![](https://mmbiz.qpic.cn/sz_mmbiz_png/aw5KtMic7pia49J72f7meOWc1Fl2Zz0yOw8TCJojX3YgiasibJK2bIPt874Wb8JQq3wXW0nVict0keZYPu9St39b1Fg/640?wx_fmt=png&from=appmsg)

这个插件的作用大家是不是已经猜到是干嘛的了，接着往下走

4. 在 cssVarsPlugin 这个方法中再加一个断点

![](https://mmbiz.qpic.cn/sz_mmbiz_png/aw5KtMic7pia49J72f7meOWc1Fl2Zz0yOwjsFWB4VF6LT1CyuEzM1Xr2HAib2VIedQZFicYtwHg5cL5GXcRJSflYyw/640?wx_fmt=png&from=appmsg)

可以看到此时进来的`decl`参数是：`color: v-bind(color)`

熟悉`postcss`的同学应该能知道`decl`是什么意思，它表示的是 css 转化为`AST`后的一个节点类型

```
const vBindRE = /v-bind\s*\(/g;
```

将 CSS 声明中的属性值 **v-bind(color)** 经过`vBindRE`正则进行检测是否为`v-bind()`语句

再往下，这里就是`v-bind()`语句编译的核心代码了

![](https://mmbiz.qpic.cn/sz_mmbiz_png/aw5KtMic7pia49J72f7meOWc1Fl2Zz0yOwfzXiau3yE00hWib96Um9IFySghqg5siapBsmbl4z1oIwx6PNnvm1ickntw/640?wx_fmt=png&from=appmsg)

首先是提取变量名

![](https://mmbiz.qpic.cn/sz_mmbiz_png/aw5KtMic7pia49J72f7meOWc1Fl2Zz0yOwe85lhNmTxq3RfNNSUdkXdkjwt4r9W7HPgsMMhk88fql6YY89CP3T9g/640?wx_fmt=png&from=appmsg)

这里可以看到，执行后的结果是`'color'`，也就是`v-bind()`括号中的这个变量了

再往下

![](https://mmbiz.qpic.cn/sz_mmbiz_png/aw5KtMic7pia49J72f7meOWc1Fl2Zz0yOwNDZEc82CJyQ52sysRugabibK11gETgJnQ0xFibd7FHibfIA2xqibDkwiaOQ/640?wx_fmt=png&from=appmsg)

此时就能看到整个编译结果了：`v-bind(color)` --->`var(--5d92a9f9-color)`

**可以看到`v-bind()`的编译其实就是通过正则处理重新生成字符串**

现在知道`v-bind()`是如何编译的，剩下一个重点就是：Vue 是如何把`style`中使用的变量转换成`CSS变量`并设置在对应 dom 节点上的

这个突破点在我们上面猜测流程的第一张图，里面有这样一段代码：

```
_useCssVars((_ctx) => ({  "5d92a9f9-color": color.value}));
```

很明显，它就是用来生成 CSS 变量

5. 接下来我们可以在源码中找到这个函数，并打上断点

在源码中搜索`_useCssVars`，你会发现什么也搜不到，这时我们可以尝试去掉`_`仔进行搜索，你会发现有这样一段代码：

```
const CSS_VARS_HELPER = `useCssVars`;
```

很明显，后面在源码中我们只需要搜索`CSS_VARS_HELPER`就可以，找到以下代码，打上断点，刷新页面

![](https://mmbiz.qpic.cn/sz_mmbiz_png/aw5KtMic7pia49J72f7meOWc1Fl2Zz0yOwZnYziczNdJ3K1AseeCAND7rFe85YVF2heyMdk26y8gb5gxXaH5V4Qmg/640?wx_fmt=png&from=appmsg)

我们会发现这一段其实就是生成了我们上面那一段代码：

```
_useCssVars((_ctx) => ({  "5d92a9f9-color": color.value}));
```

走到这里你会发现好像走不下去了，没有下一步了，因为最终我们看到的编译后的代码就是这个，具体是怎么把`style`中使用的变量转换成`CSS变量`并设置在对应 dom 节点上的这个并不是在**编译时**处理的。

想搞清楚这个我们还得在**运行时**打断点调试（这里换成了火狐浏览器进行断点调试，不要问为什么，问就是断点调试比谷歌好用）

![](https://mmbiz.qpic.cn/sz_mmbiz_png/aw5KtMic7pia49J72f7meOWc1Fl2Zz0yOwvkyuVkAL9umwBDnO9QUwZpibrmozubQhUbMzuBrG3aU78odx9phJ9Bg/640?wx_fmt=png&from=appmsg)

接着往下走，会来到`setVars`方法这里

![](https://mmbiz.qpic.cn/sz_mmbiz_png/aw5KtMic7pia49J72f7meOWc1Fl2Zz0yOwKydeQuDOpjZtfmQa3bFhqWgFrL0gyQqdVFDgd1yprVrB4jbBJzI2Vw/640?wx_fmt=png&from=appmsg)

从方法名我们一眼就能看出它就是用来设置 CSS 变量的！

再往下走`setVars` ->`setVarsOnVNode` ->`setVarsOnNode`

![](https://mmbiz.qpic.cn/sz_mmbiz_png/aw5KtMic7pia49J72f7meOWc1Fl2Zz0yOwUpVayxlUDk2nmvZKAJHubfKOxY22aDwr1wuMKybe2m2BIbMhrrTGSQ/640?wx_fmt=png&from=appmsg)

在这里最终会调用`setProperty`方法来设置 css 变量。

到这里整个流程就结束了！