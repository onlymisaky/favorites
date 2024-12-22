> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/5gY4klHbW-UThNJtmfnE1w)

```
void BytecodeGenerator::VisitArithmeticExpression(BinaryOperation* expr) {
  FeedbackSlot slot = feedback_spec()->AddBinaryOpICSlot();
  Expression* subexpr;
  Smi* literal;
  
  if (expr->IsSmiLiteralOperation(&subexpr, &literal)) {
    VisitForAccumulatorValue(subexpr);
    builder()->SetExpressionPosition(expr);
    builder()->BinaryOperationSmiLiteral(expr->op(), literal,
                                         feedback_index(slot));
  } else {
    Register lhs = VisitForRegisterValue(expr->left());
    VisitForAccumulatorValue(expr->right());
    builder()->SetExpressionPosition(expr);  //  保存源码位置 用于调试
    builder()->BinaryOperation(expr->op(), lhs, feedback_index(slot)); //  生成Add字节码
  }
}
```

前言
--

本文主要讲解的是 V8 的技术，是 V8 的入门篇，主要目的是了解 V8 的内部机制，希望对前端，快应用，浏览器，以及 nodejs 同学有些帮助。这里不涉及到如何编写优秀的前端，只是对 JS 内部引擎技术的讲解。

一、V8 来源

![图片](https://mmbiz.qpic.cn/mmbiz_png/4g5IMGibSxt4j2mKUJUOO7pyAHc1YcTxNe4XQrZ3T1IpNgMdLVJ2gPLrzOfrTicUMs6VSn7ibykrko7GbHAkJCMyg/640?wx_fmt=png)

V8 的名字来源于汽车的 “V 型 8 缸发动机”（V8 发动机）。V8 发动机主要是美国发展起来，因为马力十足而广为人知。V8 引擎的命名是 Google 向用户展示它是一款强力并且高速的 JavaScript 引擎。

V8 未诞生之前，早期主流的 JavaScript 引擎是 JavaScriptCore 引擎。JavaScriptCore 是主要服务于 Webkit 浏览器内核，他们都是由苹果公司开发并开源出来。据说 Google 是不满意 JavaScriptCore 和 Webkit 的开发速度和运行速度，Google 另起炉灶开发全新的 JavaScript 引擎和浏览器内核引擎，所以诞生了 V8 和 Chromium 两大引擎，到现在已经是最受欢迎的浏览器相关软件。

二、V8 的服务对象

V8 是依托 Chrome 发展起来的，后面确不局限于浏览器内核。发展至今 V8 应用于很多场景，例如流行的 nodejs，weex，快应用，早期的 RN。

三、V8 的早期架构

V8 引擎的诞生带着使命而来，就是要在速度和内存回收上进行革命的。JavaScriptCore 的架构是采用生成字节码的方式，然后执行字节码。Google 觉得 JavaScriptCore 这套架构不行，生成字节码会浪费时间，不如直接生成机器码快。所以 V8 在前期的架构设计上是非常激进的，采用了直接编译成机器码的方式。后期的实践证明 Google 的这套架构速度是有改善，但是同时也造成了内存消耗问题。可以看下 V8 的初期流程图：

![图片](https://mmbiz.qpic.cn/mmbiz_png/4g5IMGibSxt4j2mKUJUOO7pyAHc1YcTxNtMrIMyfoiaiavCCXZb1qcfts5ib1h9nxdFrW0pujo2j6D5g30e1EVPUgg/640?wx_fmt=png)

早期的 V8 有 Full-Codegen 和 Crankshaft 两个编译器。V8 首先用 Full-Codegen 把所有的代码都编译一次，生成对应的机器码。JS 在执行的过程中，V8 内置的 Profiler 筛选出热点函数并且记录参数的反馈类型，然后交给 Crankshaft 来进行优化。所以 Full-Codegen 本质上是生成的是未优化的机器码，而 Crankshaft 生成的是优化过的机器码。

四、V8 早期架构的缺陷

随着版本的引进，网页的复杂化，V8 也渐渐的暴露出了自己架构上的缺陷：

1.  Full-Codegen 编译直接生成机器码，导致内存占用大
    
2.  Full-Codegen 编译直接生成机器码，导致编译时间长，导致启动速度慢
    
3.  Crankshaft 无法优化 try，catch 和 finally 等关键字划分的代码块
    
4.  Crankshaft 新加语法支持，需要为此编写适配不同的 Cpu 架构代码
    

五、V8 的现有架构

为了解决上述缺点，V8 采用 JavaScriptCore 的架构，生成字节码。这里是不是感觉 Google 又绕回来了。V8 采用生成字节码的方式，整体流程如下图：

![图片](https://mmbiz.qpic.cn/mmbiz_png/4g5IMGibSxt4j2mKUJUOO7pyAHc1YcTxN2b5ABh2FiaAJkSNIkOKHKcEakChPkRSMS5PbbBbo7AMqqZ09yVNeZUQ/640?wx_fmt=png)

Ignition 是 V8 的解释器，背后的原始动机是减少移动设备上的内存消耗。在 Ignition 之前，V8 的 Full-codegen 基线编译器生成的代码通常占据 Chrome 整体 JavaScript 堆的近三分之一。这为 Web 应用程序的实际数据留下了更少的空间。

Ignition 的字节码可以直接用 TurboFan 生成优化的机器代码，而不必像 Crankshaft 那样从源代码重新编译。Ignition 的字节码在 V8 中提供了更清晰且更不容易出错的基线执行模型，简化了去优化机制，这是 V8 自适应优化的关键特性。最后，由于生成字节码比生成 Full-codegen 的基线编译代码更快，因此激活 Ignition 通常会改善脚本启动时间，从而改善网页加载。

TurboFan 是 V8 的优化编译器，TurboFan 项目最初于 2013 年底启动，旨在解决 Crankshaft 的缺点。Crankshaft 只能优化 JavaScript 语言的子集。例如，它不是设计用于使用结构化异常处理优化 JavaScript 代码，即由 JavaScript 的 try，catch 和 finally 关键字划分的代码块。很难在 Crankshaft 中添加对新语言功能的支持，因为这些功能几乎总是需要为九个支持的平台编写特定于体系结构的代码。

**采用新架构后的优势**

不同架构下 V8 的内存对比，如图：

![图片](https://mmbiz.qpic.cn/mmbiz_png/4g5IMGibSxt4j2mKUJUOO7pyAHc1YcTxNBVmJ3jgLk4HW1se1lK9hibibOBhr63A8EJEyK9MnSHz22W6jD7N5sUaQ/640?wx_fmt=png)

**结论：**可以明显看出 Ignition+TurboFan 架构比 Full-codegen+Crankshaft 架构内存降低一半多。

不同架构网页速度提升对比，如图：

![图片](https://mmbiz.qpic.cn/mmbiz_png/4g5IMGibSxt4j2mKUJUOO7pyAHc1YcTxNibqs6wMIBrapBlczicVHD2Ozb1VkMpVAOthpqzLRorGBDcHZFoibLtHPw/640?wx_fmt=png)

**结论：**可以明显看出 Ignition+TurboFan 架构比 Full-codegen+Crankshaft 架构 70% 网页速度是有提升的。

接下来我们大致的讲解下现有架构的每个流程：

六、V8 的词法分析和语法分析

学过编译原理的同学可以知道，JS 文件只是一个源码，机器是无法执行的，词法分析就是把源码的字符串分割出来，生成一系列的 token，如下图可知不同的字符串对应不同的 token 类型。

![图片](https://mmbiz.qpic.cn/mmbiz_png/4g5IMGibSxt4j2mKUJUOO7pyAHc1YcTxNGxic3e1ovNULQZEoriaTRGTGm2yrKCxZQHOwDzEGBrvCU3xNNBVNKfcA/640?wx_fmt=png)

词法分析完后，接下来的阶段就是进行语法分析。语法分析语法分析的输入就是词法分析的输出，输出是 AST 抽象语法树。当程序出现语法错误的时候，V8 在语法分析阶段抛出异常。

![图片](https://mmbiz.qpic.cn/mmbiz_png/4g5IMGibSxt4j2mKUJUOO7pyAHc1YcTxNWdjc6GsY1pXjYsTWx1zeqd0oGaMwiaIgaxdgFWx1oV9krD3BFjTZPng/640?wx_fmt=png)

七、V8 AST 抽象语法树

下图是一个 add 函数的抽象语法树数据结构

![图片](https://mmbiz.qpic.cn/mmbiz_png/4g5IMGibSxt4j2mKUJUOO7pyAHc1YcTxNm1dj266DutTZSYnqS6ibk3c4tsBkZPIVf2p1RDiclE75c5Dfl3TTlqfg/640?wx_fmt=png)

V8 Parse 阶段后，接下来就是根据抽象语法树生成字节码。如下图可以看出 add 函数生成对应的字节码：

![图片](https://mmbiz.qpic.cn/mmbiz_png/4g5IMGibSxt4j2mKUJUOO7pyAHc1YcTxNcOrN6icN2TEicZXmicF2lLL5hoOjafUo3hia7pZ9ziaD62IN6tMrXicVHFXQ/640?wx_fmt=png)

BytecodeGenerator 类的作用是根据抽象语法树生成对应的字节码，不同的 node 会对应一个字节码生成函数，函数开头为 Visit****。如下图 + 号对应的函数字节码生成：

![图片](https://mmbiz.qpic.cn/mmbiz_png/4g5IMGibSxt4j2mKUJUOO7pyAHc1YcTxNQE9OEiaKbf6ZaPDV0s8fjgL7gHRVSxBliakbn6IJibiah6TLQSh3AbqT0A/640?wx_fmt=png)

```
IGNITION_HANDLER(Add, InterpreterBinaryOpAssembler) {
   BinaryOpWithFeedback(&BinaryOpAssembler::Generate_AddWithFeedback);
}
  
void BinaryOpWithFeedback(BinaryOpGenerator generator) {
    Node* reg_index = BytecodeOperandReg(0);
    Node* lhs = LoadRegister(reg_index);
    Node* rhs = GetAccumulator();
    Node* context = GetContext();
    Node* slot_index = BytecodeOperandIdx(1);
    Node* feedback_vector = LoadFeedbackVector();
    BinaryOpAssembler binop_asm(state());
    Node* result = (binop_asm.*generator)(context, lhs, rhs, slot_index,                            
feedback_vector, false);
    SetAccumulator(result);  // 将ADD计算的结果设置到累加器中
    Dispatch(); // 处理下一条字节码
  
}
```

（滑动可查看）  

上述可知有个源码位置记录，然后下图可知源码和字节码位置的对应关系：

![图片](https://mmbiz.qpic.cn/mmbiz_png/4g5IMGibSxt4j2mKUJUOO7pyAHc1YcTxN3tUQm9wS6NpCO5uMbUA0tCw984gdBXicR1UlhThL89iaxB2ZeKElzsmg/640?wx_fmt=png)

生成字节码，那字节码如何执行的呢？接下来讲解下：  

八、字节码

首先说下 V8 字节码：

1.   每个字节码指定其输入和输出作为寄存器操作数
    
2.   Ignition 使用 registers 寄存器 r0，r1，r2... 和累加器寄存器（accumulator register）
    
3.   registers 寄存器：函数参数和局部变量保存在用户可见的寄存器中
    
4.  累加器：是非用户可见寄存器，用于保存中间结果
    

如下图 ADD 字节码：

![图片](https://mmbiz.qpic.cn/mmbiz_png/4g5IMGibSxt4j2mKUJUOO7pyAHc1YcTxNgg2Z3FpyAsknnlibHdtbVQ1BKeAH5EBicnxvqJSopn23MLicMIslyOv7w/640?wx_fmt=png)

**字节码执行**

下面一系列图表示每个字节码执行时，对应寄存器和累加器的变化，add 函数传入 10,20 的参数，最终累加器返回的结果是 50。

![图片](https://mmbiz.qpic.cn/mmbiz_png/4g5IMGibSxt4j2mKUJUOO7pyAHc1YcTxN5WVSzEs2lV9rMFew7MeuOUTwXpBmWCKVdFic1gicV6fgQwia3VzhS0Gew/640?wx_fmt=png)

![图片](https://mmbiz.qpic.cn/mmbiz_png/4g5IMGibSxt4j2mKUJUOO7pyAHc1YcTxNia8MicHO3PEQk3alCfEKEZZIj7V0LcHIvrsOPF3Saw1eXzib5dqvLHGZg/640?wx_fmt=png)

![图片](https://mmbiz.qpic.cn/mmbiz_png/4g5IMGibSxt4j2mKUJUOO7pyAHc1YcTxNpT5Hr31410kWfF4UVXcbfl9ibq4yIbs5t9Ka20jbY8GhcSA64q1Xg8w/640?wx_fmt=png)

![图片](https://mmbiz.qpic.cn/mmbiz_png/4g5IMGibSxt4j2mKUJUOO7pyAHc1YcTxNTjEe9gghHuSMuh5UpKEykDTesI3vjsqHOcfpvrgyXmhO0rCUEGV8DQ/640?wx_fmt=png)

![图片](https://mmbiz.qpic.cn/mmbiz_png/4g5IMGibSxt4j2mKUJUOO7pyAHc1YcTxNA0jmjMtrjynl65OXSiaDib7GpTPYkbLRYQos60jwG7CBX0CMmViahib7Hg/640?wx_fmt=png)![图片](https://mmbiz.qpic.cn/mmbiz_png/4g5IMGibSxt4j2mKUJUOO7pyAHc1YcTxNbhEhZibqgSlW6Cl8g9Vto40J0rBpEfRB4KxW5YhtiaeYb6Qfib4cMU0ew/640?wx_fmt=png)

![图片](https://mmbiz.qpic.cn/mmbiz_png/4g5IMGibSxt4j2mKUJUOO7pyAHc1YcTxN4aMZrYfKcf3fnFULicQvQTGkzESySkNic4aibnkoianSWn6BxST4HSfib6A/640?wx_fmt=png)

![图片](https://mmbiz.qpic.cn/mmbiz_png/4g5IMGibSxt4j2mKUJUOO7pyAHc1YcTxNyhCZZo7UPAVyBwR0TYrpxCuB5WCwbtw5ZrzPHicIW7k4D8I3aVEooTw/640?wx_fmt=png)

每个字节码对应一个处理函数，字节码处理程序保存的地址在 dispatch_table_中。执行字节码时会调用到对应的字节码处理程序进行执行。Interpreter 类成员 dispatch_table_保存了每个字节码的处理程序地址。

![图片](https://mmbiz.qpic.cn/mmbiz_png/4g5IMGibSxt4j2mKUJUOO7pyAHc1YcTxNTvvicxku7jysfvZd5dlboICSR55RYdWmjs4Fc6VBibmbZ2fbYCFx5vdw/640?wx_fmt=png)

![图片](https://mmbiz.qpic.cn/mmbiz_png/4g5IMGibSxt4j2mKUJUOO7pyAHc1YcTxNd2llbK00GwLXGI6cebZk47bfvqx8jCzG3iawefdQoM1oaickj1PBK9Uw/640?wx_fmt=jpeg)

例如 ADD 字节码对应的处理函数是（当执行 ADD 字节码时候，会调用 InterpreterBinaryOpAssembler 类）：  

```
function add(x, y) {
  return x+y;
}
add(1, 2);
%OptimizeFunctionOnNextCall(add);
add(1, 2);
```

（滑动可查看）

其实到此 JS 代码就已经执行完成了。在执行过程中，发现有热点函数，V8 会启用 Turbofan 进行优化编译，直接生成机器码。所以接下来讲解下 Turbofan 优化编译器：

九、Turbofan

Turbofan 是根据字节码和热点函数反馈类型生成优化后的机器码，Turbofan 很多优化过程，基本和编译原理的后端优化差不多，采用的 sea-of-node。

![图片](https://mmbiz.qpic.cn/mmbiz_png/4g5IMGibSxt4j2mKUJUOO7pyAHc1YcTxNibARC3a2bJiaxtGLI8Ceg7kfxibXzPbiaMqeibxvcjictEGic5okbY9APoGrg/640?wx_fmt=png)

add 函数优化：

```
function add(x, y) {
  return x+y;
}
add(1, 2);
%OptimizeFunctionOnNextCall(add);
add(1, 2);
```

（滑动可查看）

V8 是有函数可以直接调用指定优化哪个函数，执行 %OptimizeFunctionOnNextCall 主动调用 Turbofan 优化 add 函数，根据上次调用的参数反馈优化 add 函数，很明显这次的反馈是整型数，所以 turbofan 会根据参数是整型数进行优化直接生成机器码，下次函数调用直接调用优化好的机器码。（注意执行 V8 需要加上 --allow-natives-syntax，OptimizeFunctionOnNextCall 为内置函数，只有加上 --allow-natives-syntax，JS 才能调用内置函数 ，否则执行会报错）。

JS 的 add 函数生成对应的机器码如下：

![图片](https://mmbiz.qpic.cn/mmbiz_png/4g5IMGibSxt4j2mKUJUOO7pyAHc1YcTxNJFibtt7MpCvibE0Fqk33YVb8GJGN2veWkUrGico90jeaXVjbdYx1wT0PQ/640?wx_fmt=png)

这里会涉及 small interger 小整数概念，可以查看这篇文章 https://zhuanlan.zhihu.com/p/82854566

如果把 add 函数的传入参数改成字符

```
function add(x, y) {
  return x+y;
}
add(1, 2);
%OptimizeFunctionOnNextCall(add);
add(1, 2);
```

（滑动可查看）

优化后的 add 函数生成对应的机器码如下：

![图片](https://mmbiz.qpic.cn/mmbiz_png/4g5IMGibSxt4j2mKUJUOO7pyAHc1YcTxN7YZ3zEibPibzbHxYIrMYcSiaUaQMbVdtbuJ6aRX9oiaCWp7EvBnoApy6WA/640?wx_fmt=png)

对比上面两图，add 函数传入不同的参数，经过优化生成不同的机器码。

如果传入的是整型，则本质上是直接调用 add 汇编指令

如果传入的是字符串，则本质上是调用 V8 的内置 Add 函数

到此 V8 的整体执行流程就结束了。文章中可能存在理解不正确的地方敬请指出。

*   **参考文章**
    

1.  https://v8.dev/docs
    
2.  https://docs.google.com/presentation/d/1HgDDXBYqCJNasBKBDf9szap1j4q4wnSHhOYpaNy5mHU/edit#slide=id.g17d335048f_1_1105
    
3.  https://docs.google.com/presentation/d/1Z9iIHojKDrXvZ27gRX51UxHD-bKf1QcPzSijntpMJBM/edit#slide=id.p
    
4.  https://zhuanlan.zhihu.com/p/82854566
    

```
Node 社群




我组建了一个氛围特别好的 Node.js 社群，里面有很多 Node.js小伙伴，如果你对Node.js学习感兴趣的话（后续有计划也可以），我们可以一起进行Node.js相关的交流、学习、共建。下方加 考拉 好友回复「Node」即可。

   “分享、点赞、在看” 支持一波👍
```