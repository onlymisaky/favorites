> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/eAYIK43TVxNzN2wdHdYrxg)

![](https://mmbiz.qpic.cn/sz_mmbiz_png/dy9CXeZLlCUPLRe8KViagAIoPtpcNgAW4277PZKE3Qs9iabMFVxq3OkKyRZkzX8ghqBlxbI5TOt94NQ67g1y9orw/640?wx_fmt=png)

> 作者：七包辣条
> 
> https://blog.csdn.net/m0_73257876/article/details/126721777

ECMAScript 发展进程中，会有很多功能的更新，比如销毁，箭头功能，模块，它们极大的改变 JavaScript 编写方式，可能有些人喜欢，有些人不喜欢，但像每个新功能一样，我们最终会习惯它们。

新版本的 ECMAScript 引入了三个新的逻辑赋值运算符：空运算符，AND 和 OR 运算符，这些运算符的出现，也是希望让我们的代码更干净简洁，下面分享几个优雅的 JavaScript 运算符使用技巧。

#### 一、可选链接运算符【？.】

**可选链接运算符（Optional Chaining Operator）** 处于 ES2020 提案的第 4 阶段，因此应将其添加到规范中。它改变了访问对象内部属性的方式，尤其是深层嵌套的属性。它也可以作为 TypeScript 3.7 + 中的功能使用。

相信大部分开发前端的的小伙伴们都会遇到 null 和未定义的属性。JS 语言的动态特性使其无法不碰到它们。特别是在处理嵌套对象时，以下代码很常见：

```
if (data && data.children && data.children[0] && data.children[0].title) {    // I have a title!}
```

上面的代码用于 API 响应，我必须解析 JSON 以确保名称存在。但是，当对象具有可选属性或某些配置对象具有某些值的动态映射时，可能会遇到类似情况，需要检查很多边界条件。

这时候，如果我们使用可选链接运算符，一切就变得更加轻松了。它为我们检查嵌套属性，而不必显式搜索梯形图。我们所要做的就是使用 “？” 要检查空值的属性之后的运算符。我们可以随意在表达式中多次使用该运算符，并且如果未定义任何项，它将尽早返回。

**对于静态属性**用法是：

```
object?.property
```

**对于动态属性**将其更改为：

```
object?.[expression] 
```

上面的代码可以简化为：

```
let title = data?.children?.[0]?.title;
```

然后，如果我们有:

```
let data;console.log(data?.children?.[0]?.title) // undefineddata  = {children: [{title:'codercao'}]}console.log(data?.children?.[0]?.title) // codercao
```

这样写是不是更加简单了呢？由于操作符一旦为空值就会终止，因此也可以使用它来有条件地调用方法或应用条件逻辑

```
const conditionalProperty = null;let index = 0;console.log(conditionalProperty?.[index++]); // undefinedconsole.log(index);  // 0
```

**对于方法**的调用你可以这样写

```
object.runsOnlyIfMethodExists?.()
```

例如下面的`parent`对象，如果我们直接调用`parent.getTitle()`, 则会报`Uncaught TypeError: parent.getTitle is not a function`错误，`parent.getTitle?.()`则会终止不会执行

```
let parent = {    name: "parent",    friends: ["p1", "p2", "p3"],    getName: function() {      console.log(this.name)    }  };    parent.getName?.()   // parent  parent.getTitle?.()  //不会执行
```

**与无效合并一起使用**

提供了一种方法来处理未定义或为空值和表达提供默认值。我们可以使用`??`运算符，为表达式提供默认值

```
console.log(undefined ?? 'codercao'); // codercao
```

因此，如果属性不存在，则可以将无效的合并运算符与可选链接运算符结合使用以提供默认值。

```
let title = data?.children?.[0]?.title ?? 'codercao';console.log(title); // codercao
```

#### 二、逻辑空分配（?? =）

```
expr1 ??= expr2
```

逻辑空值运算符仅在 nullish 值（`null` 或者 `undefined`）时才将值分配给 expr1，表达方式：

```
x ??= y
```

可能看起来等效于：

```
x = x ?? y;
```

但事实并非如此！有细微的差别。

空的合并运算符（??）从左到右操作，如果 x 不为 **nullish 值**则中表达式不执行。因此，如果 x 不为`null` 或者 `undefined`，则永远不会对表达式`y`进行求值。如果`y`是一个函数，它将根本不会被调用。因此，此逻辑赋值运算符等效于

```
x ?? (x = y);
```

#### 三、逻辑或分配（|| =）

此逻辑赋值运算符仅在左侧表达式为 **falsy 值（虚值）** 时才赋值。Falsy 值（虚值）与 null 有所不同，因为 falsy 值（虚值）可以是任何一种值：undefined，null，空字符串 (双引号 ""、单引号’’、反引号 ``)，NaN，0。IE 浏览器中的 document.all，也算是一个。

语法

```
x ||= y
```

等同于

```
x || (x = y)
```

在我们想要保留现有值（如果不存在）的情况下，这很有用，否则我们想为其分配默认值。例如，如果搜索请求中没有数据，我们希望将元素的内部 HTML 设置为默认值。否则，我们要显示现有列表。这样，我们避免了不必要的更新和任何副作用，例如解析，重新渲染，失去焦点等。我们可以简单地使用此运算符来使用 JavaScript 更新 HTML：

```
document.getElementById('search').innerHTML ||= '<i>No posts found matching this search.</i>'
```

#### 四、逻辑与分配（&& =）

可能你已经猜到了，此逻辑赋值运算符仅在左侧为真时才赋值。因此：

```
x &&= y
```

等同于

```
x && (x = y)
```

##### 最后

本次分享几个优雅的 JavaScript 运算符使用技巧，重点分享了可选链接运算符的使用，这样可以让我们不需要再编写大量我们例子中代码即可轻松访问嵌套属性。但是 IE 不支持它，因此，如果需要支持该版本或更旧版本的浏览器，则可能需要添加 Babel 插件。对于 Node.js，需要为此升级到 Node 14 LTS 版本，因为 12.x 不支持该版本。

如果你也有优雅的优雅的 JavaScript 运算符使用技巧，请不要吝惜，在评论区一起交流~

  

往期回顾

  

#

[如何使用 TypeScript 开发 React 函数式组件？](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458468369&idx=1&sn=710836a0f836c1591b4953ecf09bb9bb&chksm=b1c2603886b5e92ec64f82419d9fd8142060ee99fd48b8c3a8905ee6840f31e33d423c34c60b&scene=21#wechat_redirect)

#

[11 个需要避免的 React 错误用法](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458468180&idx=1&sn=63da1eb9e4d8ba00510bf344eb408e49&chksm=b1c21f7d86b5966b160bf65b193b62c46bc47bf0b3965ff909a34d19d3dc9f16c86598792501&scene=21#wechat_redirect)

#

[6 个 Vue3 开发必备的 VSCode 插件](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458467984&idx=1&sn=f9f71530f15124fe44cd22eff3170981&chksm=b1c21eb986b597af806837a37b87b1e8bc06b26b16af578deddd8bb503a768f78f5a7acdb909&scene=21#wechat_redirect)

#

[3 款非常实用的 Node.js 版本管理工具](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458467880&idx=1&sn=ca7e12574d88a6b36ccfd47d9ddc7a4f&chksm=b1c21e0186b5971758792950721938b4a4efbc3024b0b01965c25a4ea73ec838767783ade6ea&scene=21#wechat_redirect)

#

[6 个你必须明白 Vue3 的 ref 和 reactive 问题](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458467756&idx=1&sn=902e85685a50ba7cdc75e410e10b9718&chksm=b1c21d8586b5949326c8836132b20dc4294af449473b6db4592cbfd00788345534a07d77fa6d&scene=21#wechat_redirect)

#

[6 个意想不到的 JavaScript 问题](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458467612&idx=1&sn=44ea5238a6500f44a47ea316c634bcf6&chksm=b1c21d3586b594237333a306f00353fba450514076e54ac32df7485ae358d0cefb25a6c1f329&scene=21#wechat_redirect)

#

[试着换个角度理解低代码平台设计的本质](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458467471&idx=2&sn=7990678e19544372ff43b5a84f491337&chksm=b1c21ca686b595b07b097c764f9304887282d737b4dd0a2634c47b25c8f223c785a6c8714382&scene=21#wechat_redirect)

![](https://mmbiz.qpic.cn/mmbiz_gif/dy9CXeZLlCXukR16d8fyyeJ4icloLCW0cvbCvibfaBxbY22lN51mYaLeKictjOeobKmxCVfb3AwIZ3t6eKicIicTtow/640?wx_fmt=gif)

回复 “**加群**”，一起学习进步