> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/l6dNUFE1b2xKzncpt4CL_A)

```
大厂技术  高级前端  Node进阶


点击上方 程序员成长指北，关注公众号

回复1，加入高级Node交流群

```

关于本文  
作者：@w3sft：）  
原文：https://zhuanlan.zhihu.com/p/624988530

debugger 指令，一般用于调试，在如浏览器调试执行环境中，可以在 JavaScript 代码中产生中断。  

如果想要拦截 debugger，是不容易的，常用的函数替代、proxy 方法均对它无效，如：

```
 window.debugger = (function() {
     var origDebug = console.debugger;
     return function() {
     // do something before debugger statement execution
     origDebug.apply(console, arguments);
     // do something after debugger statement execution
     };
 })();

```

或：

```
 var handler = {
   get: function(target, prop, receiver) {
     if (prop === 'debugger') {
       throw new Error("Debugger statement not allowed!");
     }
     return Reflect.get(target, prop, receiver);
   }
 };
 var obj = new Proxy({}, handler);

```

以上两方法，都无法对 debugger 生效。

![](https://mmbiz.qpic.cn/mmbiz_png/meG6Vo0Mevha0jdodYgVQCTBcLptzIRE6GDZEz8uXLJDk1kubrqtgPB2icuA4vL98uEChhLXNzBGpOaOjpaOFzA/640?wx_fmt=png)

而 debugger 有多种写法，如：

1、`debugger`;  
2、`Function("debugger").call()`;  
3、`eval("debugger")`;  
4、`setInterval(function(){debugger;},1000)`;  
5、`[].constructor.constructor('debugger')()`;

最原始的 debugger，想要拦截这一个单词，确实是似乎不可行，但它在现实中的使用频率是不高的，更多的是后面几种用法。

这是因为，debugger 更多的被人们用于反调试，比如用 JShaman 对 JavaScript 代码进行混淆加密后，就可以被加入多种不同的 debugger 指令用于反调试。

![](https://mmbiz.qpic.cn/mmbiz_png/meG6Vo0Mevha0jdodYgVQCTBcLptzIRE5tJUW08U6YpN20sMRuU02jSwn5iccSk2Z2nLUo3JH8wuhLBh1NaNAXw/640?wx_fmt=png)

而上面展示的后 4 种用法，是可以在代码中进行拦截的。

#### `Function("debugger").call()`

拦截示例：

```
 Function_backup = Function;
 Function = function(a){
     if (a =='debugger'){
         console.log("拦截了debugger，中断不会发生1")
         return Function_backup("console.log()")
     }else{
         return Function_backup(a)
     }
 }
 Function("debugger").call();

```

运行效果：

![](https://mmbiz.qpic.cn/mmbiz_png/meG6Vo0Mevha0jdodYgVQCTBcLptzIREVNQQnkvDNgMRlTKc8hicMJL5JCT6XiaoAaPSAE4JarcoBkCtL21LkoVQ/640?wx_fmt=png)

#### `eval("debugger")`

拦截示例：

```
 eval_backup = eval;
 eval = function(a){
 if(a=='debugger'){
 console.log("拦截了debugger，中断不会发生0")
         return ''
     }else{
         return eval_backup(a)
     }
 }
 eval("debugger");

```

运行效果：

![](https://mmbiz.qpic.cn/mmbiz_png/meG6Vo0Mevha0jdodYgVQCTBcLptzIREuYia0t03cwQVYQsdNicpHluyNSu6FMyicN1kicN1clxjRuG1ulicFNz8S4Q/640?wx_fmt=png)

#### `setInterval(function(){debugger;},1000)`

拦截示例：

```
 var setInterval_backup = setInterval
 setInterval = function(a,b){
     if(a.toString().indexOf('debugger') != -1){
         console.log("拦截了debugger，中断不会发生2")
         return null;
     }
     setInterval_backup(a, b)
 }
 setInterval(function(){
     debugger;
 },1000);

```

运行效果：

![](https://mmbiz.qpic.cn/mmbiz_png/meG6Vo0Mevha0jdodYgVQCTBcLptzIRE8nPrOfBvjia0bicXPczWkQmTPFm7CIDPuO22efHMLu7zb3ibQ7BejtHkQ/640?wx_fmt=png)

#### `[].constructor.constructor('debugger')()`

拦截示例：

```
 var constructor_backup = [].constructor.constructor;
 [].constructor.constructor = function(a){
     if(a=="debugger"){
         console.log("拦截了debugger，中断不会发生3");
     }else{
         constructor_backup(a);
     }
 }
 try {
     [].constructor.constructor('debugger')();
 } catch (error) {
     console.error("Anti debugger");
 }

```

运行效果：

![](https://mmbiz.qpic.cn/mmbiz_png/meG6Vo0Mevha0jdodYgVQCTBcLptzIREKYURSNs1MuI5jjickIRReLxdb9COx2f2uFu8JV1kngnj5ricNqVJlyaA/640?wx_fmt=png)

```
Node 社群




我组建了一个氛围特别好的 Node.js 社群，里面有很多 Node.js小伙伴，如果你对Node.js学习感兴趣的话（后续有计划也可以），我们可以一起进行Node.js相关的交流、学习、共建。下方加 考拉 好友回复「Node」即可。

   “分享、点赞、在看” 支持一波

```