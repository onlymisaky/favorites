> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/DyeiUXRpdtzydtvEybPpRw)

![](https://mmbiz.qpic.cn/mmbiz_jpg/KEXUm19zKo7KEUmmKaxdcDKZdfDia0GcNF9TKtZDvLpr3dPX1Q9QguuTXvyLIOiadX9qaXDTxSZ7OlJcju4ZCEFg/640?wx_fmt=jpeg)

编辑整理 | web 前端开发（web_qdkf)

如果你想从事开发工作，我们在准备面试的时候，总会遇到很多面试题，这些面试题，都是企业作为筛选人员的一种方式，虽然，不一定能够找到合适的员工，但是这样的方式会提升他们的工作效率。

而作为应聘者的我们，特别是作为一个行业新人，认真准备每一次面试真的非常重要，因为我们期望得到自己心仪的工作机会。

其实，很多时候，我们在面试的时候，企业也不会故意出难题为难大家，并且我发现一般的企业，都不是要求大家掌握所有技能，当然，这也不科学，他们只希望前来面试的人对 HTML、CSS 和最重要的 JavaScript 等基本 Web 技术有一些深入的了解，特别是 JavaScript 技术，真的是可以出题的内容太多了。

因此，今天，在这里，我们整理了一些面试中的高频又基础的 JavaScript 面试题，希望对你有所帮助。

好了，我们现在开始今天的内容。

**1、ES6 版本引入了哪些特性？**

*   let 和 const 关键字。
    
*   箭头函数。
    
*   多行字符串。
    
*   解构赋值。
    
*   增强的对象文字。
    
*   Promises
    

**2、var、const 和 let 的主要区别是什么？**

*   用 let 和 const 声明的变量是块范围的；用 var 声明的变量是全局范围的或函数范围的。
    
*   var 变量可以在其范围内更新和重新声明；让变量可以更新但不能重新声明；const 变量既不能更新也不能重新声明。
    
*   var 可以提升到其作用域的顶部。其中 var 变量初始化为未定义，let 和 const 变量未初始化（临时死区，TDZ）。
    
*   虽然可以在不初始化的情况下声明 var 和 let，但必须在声明期间初始化 const。
    

**3、什么是 promise 和 async-await？**

Promises 是一种在 JavaScript 中启用异步编程的方法。一般来说，Promise 意味着程序调用函数时期它返回调用程序可以在进一步计算中使用的结果。

Async-await 也有助于异步编程。它是 promise 的语法糖。Async-await 语法简单，很容易在单个函数中维护大量异步调用。此外， async-wait 可以防止回调地狱。

```
const myPromise = new Promise((resolve, reject) => { 
 // condition
});
```

**4、什么是闭包？**

在 JavaScript 函数中定义的函数称为闭包。它可以访问 3 种类型的范围（内部、外部和全局），在外部函数的情况下，除了访问变量之外，它还可以查看参数。

**5、如何用 JavaScript 编写 “Hello World”？**

这可能是向所有新人提出的非常基本的 JavaScript 面试高频问题。它可以使用以下语法编写，可以放置在 HTML 文件的正文中。

```
document.write(“JavaScript Hello World!”);
```

**6、如何使用外部 JS 文件？**

可以通过使用以下语法从 HTML 文档调用文件来完成，就像调用外部 CSS 文件一样。

```
<script type="text/javascript" src="custom.js"></script>
```

**7、JavaScript 如何保持并发？**

*   事件循环。
    
*   微和宏队列。
    
*   回调。
    
*   线程池和集群（多线程）。
    

**8、什么是回调，并**提供一个简单的例子****

回调函数是作为参数传递给另一个函数并在某些操作完成后执行的函数。下面是一个简单的回调函数示例，该函数在某些操作完成后记录到控制台。

```
function modifyArray(arr, callback) {
  // do something to arr here
  arr.push(100);
  // then execute the callback function that was passed
  callback();
}

var arr = [1, 2, 3, 4, 5];

modifyArray(arr, function() {
  console.log("array has been modified", arr);
});
```

**9、我们有多少种方式来声明一个函数，它们之间有什么不同？**

函数声明由 function 关键字组成，后跟一个强制性的函数名称，一对括号中的参数列表。

可以在对象字面量和 ES2015 类的方法声明中使用速记方法定义。

使用包含参数列表的一对括号定义箭头函数。后面是一个粗箭头 => 和一对分隔正文语句的花括号。

在函数表达式中，您将函数分配给变量。

可以使用 Function 构造函数动态创建函数，但存在安全和性能问题，不建议使用。

**10、什么是对象以及如何创建它？**

一切都是对象，因为 JavaScript 是一种基于对象的语言。不过，我们可以将对象定义为具有自己的行为和状态的实体。

创建对象的常用方法是使用 “new” 关键字创建实例。

```
Var object = new Object();
```

**11、“this” 是什么意思？**

与其他面向对象的编程语言中 “this” 是由类实例化的对象不同，在 JavaScript 中，“this”是一个对象，它是方法的所有者。

**12、什么是匿名函数？**

顾名思义，它是一个没有名字的函数，它们是在运行时使用函数运算符动态声明的，因为它提供了比声明符更大的灵活性。

```
var display=function()  
{  
 alert("Anonymous Function is declared");  
}  
display();
```

**13、您对 BOM 了解多少？**

BOM，也称为浏览器对象模型，用作浏览器的交互介质。默认对象是窗口，所有函数都可以直接调用，也可以通过指定窗口来调用。History、Screen、location，是 Window 的不同属性。

**14、什么是 DOM 及其用法？**

Document Object Model，俗称 DOM，代表 HTML 文档，它用于更改 HTML 文档的内容。

**15、如何从特定索引返回字符？**

charAt() 方法可用于找出任何特定索引处的字符值，考虑到 “n” 是字符串的长度，索引可以从 0 开始，到 “n-1” 结束。然而，索引的值不能为负数，不能等于或大于字符串的长度。

```
var str="LambdaTest";    
document.writeln(str.charAt(4));
```

**16、“==”和 “===” 的区别**

这可能是被问得最多的 JavaScript 面试问题。

类型转换相等 (==) 检查 2 个变量是否相似，无论它们的数据类型如何。例如 (“3” ==3) 将返回 true。

严格相等 (===) 检查 2 个变量是否具有相似的数据类型和值。例如 (“3” ===3) 将返回 false。

**17、JS 中有哪些不同的数据类型？**

JavaScript 有以下数据类型：

![](https://mmbiz.qpic.cn/mmbiz_png/eXCSRjyNYcZ4qm1ce31JL7FDvhHXicc4LfMLiabjHia5MBjY9N2OmkNm6ITBh10VIBoR4StANa1TTBq9HbsDkhgtg/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

**18、什么是原型属性？**

原型属性通常用于实现继承。每个函数都有一个，默认值为空。方法和属性被添加到原型中以使其可用于实例。你可以用一个计算矩形周长的例子来回答这个 JavaScript 面试问题。

```
function Rectangle(x, y) {
this.x = x;
this.y = y;
}
Rectangle.prototype.perimeter = function() {
return 2 * (this.x + this.y);
}
var rectangle = new Rectangle(4, 3);
console.log(rectangle.perimeter()); // outputs '14'
```

**19、异步编程及其重要性**

在这里，JS 引擎在事件循环中运行。当遇到阻塞操作时，会触发请求并且代码会不断运行。一旦响应准备好，就会触发中断。执行事件处理程序，而控制流继续。因此，通过异步编程，单个线程可以同时处理多个操作。

**20、窗口对象的使用**

这不是 JavaScript 对象，而是浏览器自动创建的外部窗口。它用于显示弹出对话框。例如

alert() - 显示带有自定义消息和 “确定” 按钮的警报框。

注意：- 英特尔 XDK 测试 — 跨 3000 多种不同的桌面和移动浏览器测试您基于英特尔 XDK CSS 框架的网站。

**21、客户端 JavaScript 与服务器端有何不同？**

客户端 JavaScript 通常由基本语言以及与在浏览器中运行的脚本相关的某些预定义对象组成。由 HTML 直接嵌入，在运行时由浏览器执行。

服务器端 JS 几乎类似于客户端。但是，它是在服务器中执行的，并且只有在代码编译完成后才能部署。

**22、JavaScript 中变量的命名约定**

在命名变量时，我们必须遵循一定的规则：

*   不要使用 JavaScript 保留的关键字。例如——布尔值、中断等。
    
*   不要以数字开头的变量名。以 “_” 或字母开头。例如，不要写 123func，而是写 func123 或 _123func。
    
*   变量区分大小写。‘Func’ 和 ‘func’ 将被区别对待。
    

**总结**

以上就是在 JavaScript 面试中，被经常问到的一些问题，当然，这不是全部，我们在面试中，经常被问到一些关于 JavaScript 的问题，其实，都是比较基础的知识。

当然，在实际面试中，具体面试官会问什么，谁也没有办法预料，但是，如果我们有备而来，就不至于太慌张，还有就是，面试时被问的技术问题，有时候，也取决于面试官的知识技能储备以及工作中实际需要的知识。

总之，我们需要平时多加学习，以备不时之需，技多不压身。

最后，希望今天内容对你有帮助，如果你觉得有用的话，请记得点赞我，关注我，并将它分享给你的朋友，也许能够帮助到他。

感谢你的阅读，祝编程愉快！

  

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