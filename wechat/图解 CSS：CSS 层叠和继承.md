> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/4DzZ9czVs1pd2DOtcukXDw)

CSS 中有三个概念是必须要掌握的：**层叠**、**继承**和**权重**。今天我们主要来了解 CSS 中的层叠和继承，对于 CSS 权重这一部分将放到 CSS 的选择器中来介绍，因为这一部分和 CSS 的选择器耦合的更为紧密。不管是初学者还是有一定工作经验的同学，花点时间阅读这篇文章都是很有必要的，这样有利于你对 CSS 更清楚的了解和理解。

在很多 Web 开发人员眼中，CSS 不是一门程序语言，但它真真切切的是一门计算机语言。主要用来为结构化文档，比如 HTML、XML 等添加样式，其主要由 W3C 定义和维护。而 CSS 是由 Cascading Style Sheets 三个词的首字母缩写，很多人将其称为**层叠样式表**或者**级联样式表**。接下来要聊的第一个概念就是 CSS 中的层叠，也对应的是 CSS 中的第一个字母 C 。看到这里，或许你就知道为什么会说层叠是 CSS 的重要概念之一了。

**层叠**
------

层叠是 CSS 固有的一个东东，它赋予了**层叠样式表层叠性，也常称级联**。层叠是一个很强大的工具，如果错误的使用它可能会导致样式表的脆弱性，会致使 Web 开发人员在任何时候不得不进行更改时都感到头痛。比如说：初学 CSS 的同学，特别是 Web 其他端的程序员（比如服务端、客户端）在独立编写 CSS 的时候，经常会碰到这样的一个现象：“**为什么写的样式不起作用呢？** ” 面对这样的场景很多人会采用非常暴力的手段来处理，比如通过添加 `!important` 或直接在 HTML 的元素上添加内联 CSS。这就是令很多同学感到疑惑的一点？为什么要这样做呢？其实这和接下来要介绍的层叠（也有很多人称之为**级联**）有很大的关系。

### **层叠定义**

因为我们将要深入的学习和讨论 CSS 层叠是如何工作的相关细节，因此我们有必要的了解 W3C 规范是如何定义它的：

> The cascade takes a unordered list of declared values for a given property on a given element, sorts them by their declaration’s precedence, and outputs a single cascaded value.

大致意思是：**该层叠将获取给定元素上给定属性的声明值的无序列表，按声明的优先级对它们进行排序，并输出单个层叠值**。

CSS 层叠是一种算法，浏览器通过它来决定将哪些 CSS 样式规则应用到一个元素上。很多人喜欢把它看作是 “获胜” 的样式，按照 CSS 中的术语来说，它的**权重**更高（后面我们会深入介绍）。

为了更好的理解 CSS 层叠，将 CSS 声明看作具体的 “属性”（Property）。这些属性可以是声明的各个部分，比如说 CSS 选择器或 CSS 属性，甚至是 CSS 声明的位置相关（比如它的原始或源代码中的位置）。

CSS 层叠将会根据自己的算法，采用这些属性中的一些，并为每个属性分配一个权重。如果 CSS 规则在高优先级上获胜（选择器权重高），那么这个样式规则就会获胜，即生效。但是，如果在给定的权重下有两个规则冲突，算法将继续” **向下层叠**”，并且会检查低优先级属性，直到找到一个胜出的规则。

简单的说，当多个相互冲突的 CSS 声明应用于同一个元素时，CSS 层叠算法会根据一定的机制，从最高权重到最低权重的顺序列出：

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zib533Fg6TVEekjZhxNczeJleVcnhAEChcKr9tS2dv8vOcERpfdwt6tHjgza2r4SfaEEnwnW8GpcPA/640?wx_fmt=png&from=appmsg)

*   来源和重要性
    
*   选择器权重
    
*   出现的顺序
    
*   初始和继承属性（默认值）
    

接下来围绕这几点来进行展开。

### **来源和重要性**

层叠检查的最高加权属性是给定规则的重要性和来源的组合。就 CSS 规则的来源而言，规则主要来自三个地方：

*   **编写者规则（Author）** ：这是 HTML 文档声明的 CSS。也就是前端开发人员编写的，根据文档语言（比如 HTML）约定给源文档指定样式表。这也是我们能够控制的唯一来源
    
*   **用户（User）** ：这是由浏览器的用户定义和控制的。不是每个人都会有一个，但是当人们添加一个时，通常是为了覆盖样式和增加网站的可访问性。比如，用户可以指定一个具有样式表的文件，或者用户代理可能会提供一个用来生成用户样式（或者表现得像这样做了一样）的界面
    
*   **用户代理（User-Agent）** ：这些是浏览器为元素提供的默认样式。这就是为什么`input` 在不同的浏览器上看起来略有不同，这也是人们喜欢使用 CSS 重置样式，以确保重写用户代理样式的原因之一
    

注意，用户可能会修改系统设置（例如，系统配色），这会影响默认样式表。然而，有些用户代理实现让默认样式表中的值不可改变

这三种样式表将在一定范围内重叠，并且它们按照层叠互相影响。

CSS 层叠给每个样式规则赋予了权重，应用这几条规则时，权重最大的优先。默认情况下，编写者样式表中的规则比用户样式表中的规则权重高。CSS 声明的重要性由适当命名的 `!important` 语法决定。`!important` 的 CSS 规则自动将它跳到层叠算法的前面，这也是为什么不鼓励在样式中使用 `!important` 的原因之一。覆盖使用 `!important` 的样式只能使用其他的 `!important` 的规则来完成，如果你的项目足够大，用的 `!important` 又足够地多，那么你的 CSS 就会变得更为脆弱，更难以维护。对于 `!important` 的使用，建议你只在其他所有方法都失效的情况之下使用。

那么 CSS 中层叠算法又是如何判断哪个声明获胜：

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zib533Fg6TVEekjZhxNczeJlKNc6MWwpERHCeBwGshLdG71vyagiaTictibYHjIpQXiaR4FkIialdmA7e2Q/640?wx_fmt=png&from=appmsg)

CSS 层叠在判断哪个声明获胜时考虑这两个属性的组合。每个组合都有一个权重（类似声明的部分权重），权重最高的规则获胜。以下是浏览器考虑的各种来源和重要性的组合，按从最高权重到最低权重的顺序列出：

*   带 `!important` 的用户代理规则
    
*   带 `!important` 的用户规则
    
*   带 `!important` 的编写者规则
    
*   CSS 动画 `@keyframes` 中的规则（这是较为特殊的一部分，它仍然来自编写者规则，但是由于动画是临时的或短暂的，所以浏览器对它们的权重略高于正常的编写者规则）
    
*   编写者规则
    
*   用户规则
    
*   用户代理规则
    

当浏览器遇到两个或更多冲突的 CSS 声明，其中一个在来源和重要性级别获胜时，CSS 层叠就会解决这个规则。但是，如果相互冲突的声明具有相同的重要性和来源级别，则层叠将继续考虑选择器的权重。

### **选择器权重**

CSS 层叠中的第二个权重是**选择器的权重**。在这个层中，浏览器查看 CSS 声明中使用的选择器。作为前端开发人员，我们只能控制编写者样式规则。因为我们无法对来源的规则做太多的更改。但是，你会发现，只要在代码中不使用`!important`，对于 CSS 层叠中的选择器权重这一层，还是有较多的方式可以控制。

对于一个选择器的权重，将会按下面这样的规则进行计算：

*   如果声明来自一个行内样式（`style`属性）而不是一条选择器样式规则，算`1`，否则就是`0`（`=a`）。HTML 中，一个元素的`style`属性值是样式规则，这些属性没有选择器，所以`a=1, b = 0, c = 0, d = 0`，即`1, 0, 0, 0`
    
*   计算选择器中`ID`属性的数量 (`= b`)
    
*   计算选择器中其它属性和伪类的数量 (`= c`)
    
*   计算选择器中元素名和伪元素的数量 (`= d`)
    

`4`个数连起来`a-b-c-d`（在一个基数很大的数字系统中）表示特殊性，比如下面这样的示例：

```
{}                   /* a=0 b=0 c=0 d=0 -> 选择器权重 = 0,0,0,0 * /li {}                /* a=0 b=0 c=0 d=1 -> 选择器权重 = 0,0,0,1 * /li:first-line {}     /* a=0 b=0 c=0 d=2 -> 选择器权重 = 0,0,0,2 * /ul li {}             /* a=0 b=0 c=0 d=2 -> 选择器权重 = 0,0,0,2 * /ul ol+li {}          /* a=0 b=0 c=0 d=3 -> 选择器权重 = 0,0,0,3 */h1 + [rel=up] {} /* a=0 b=0 c=1 d=1 -> 选择器权重 = 0,0,1,1 * /ul ol li.red {}     /* a=0 b=0 c=1 d=3 -> 选择器权重 = 0,0,1,3 * /li.red.level {}     /* a=0 b=0 c=2 d=1 -> 选择器权重 = 0,0,2,1 * /#x34y {}            /* a=0 b=1 c=0 d=0 -> 选择器权重 = 0,1,0,0 * /style=""            /* a=1 b=0 c=0 d=0 -> 选择器权重 = 1,0,0,0 */
```

在互联网上也有很多很形象的图来解释 CSS 选择器权重的，比如下图：

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zib533Fg6TVEekjZhxNczeJl4KEtDfHhDhpj7O2VpCBGicn2YOk0AwWXCMhgAlssC5pHZsax4ylibziaA/640?wx_fmt=png&from=appmsg)

> _上图来自于 @Estelle Weyl 的《_ _CSS Specificity_ _》一文。_

### **出现的顺序**

CSS 层叠算法的最后一个主要层是按源码中出现的顺序来计算。当两个选择器具有相同的权重时，在源代码中最后的声明获胜。

因为 CSS 在层叠中考虑源顺序，所以加载样式表的顺序就显得尤为重要。如果在 HTML 文档的`<head>`引入了两个样式表，那么第二个样式表将覆盖第一个样式表中的规则。

### **初始和继承属性**

虽然初始值`initial`和继承值`inherit`并不是 CSS 层叠中真正组成部分，但是如果没有针对元素的 CSS 声明，它们将确定发生什么。通过这种方式，它们确定元素的默认样式值。

> 有关于初始和继承更详细的介绍，将在下一节中进行详细地阐述。感兴趣的同学，请继续往下阅读。

### **参与层叠计算的 CSS 实体**

只有 CSS 声明，就是属性名值对，会参与层叠计算。这表示包含 CSS 声明以外实体的`@`规则不参与层叠计算，比如包含描述符的`@font-face`。对于这些情形，`@`规则是做为一个整体参与层叠计算，比如`@font-face`的层叠是由其描述符`font-family`确定的。如果对同一个描述符定义了多次 `@font-face`，则最适合的 `@font-face`是做为一个整体而被考虑的。

包含在大多数`@`规则的 CSS 声明是参与层叠计算的，比如包含于`@media`、`@documents`或者`@supports`的 CSS 声明，但是包含于`@keyframes`的声明不参与计算，正如`@font-face`，它是作为一个整体参与层叠算法的筛选。

> **注意** **`@import`** **和** **`@charset`** **遵循特定的算法，并且不受层叠算法影响**。

### CSS 的 @layer 规则

为了解决诸如此类的问题（级联与权重），现代 CSS 新增了一个级联层的规则，即 @layer 。

简单地说： **级联层提供了一种结构化的方式来组织和平衡单一来源中的 CSS 规则，最终决定谁获胜**！。

由于 CSS 的级联层在 CSS 级联中有着独特的地位，使用它有一些好处，使开发者对级联有更多的控制。CSS 的级联层一般位于 “Style 属性”（Style Attribute）和 CSS 选择器权重（Specificity）之间，即：

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zib533Fg6TVEekjZhxNczeJlsviaQbe861DNJtAGicxAZ4QRicwhWXkZkIK5b1J4tmWHXiaZj3f8XdaSOw/640?wx_fmt=png&from=appmsg)

我使用下图来阐述有级联层 `@layer` 前后，CSS 级联的差异：

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zib533Fg6TVEekjZhxNczeJljny3G5qqNeibsb4Th52yMkkiaFpZE7W20hYK7SMviaGsc9ib8icLmDHJ9rg/640?wx_fmt=png&from=appmsg)

带来的直接变化是权重计算规则变了：

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zib533Fg6TVEekjZhxNczeJlao2P7Fyurc9PUN2bTwN2HiaGNMicTUpbfcto2Uk0zhs4P5T4p4tSEXGg/640?wx_fmt=png&from=appmsg)

有了 CSS 级联层 `@layer` 特性之后，你可以抛弃以前的一些 CSS 方法论（例如 ITCSS），因为 `@layer` 能更好的帮助你管理 CSS 的级联。

简单地说，级联层 `@layer` 是 CSS 的一个新特性，它影响着样式规则的应用和优先级。以下是级联层的一些关键细节：

*   添加到级联层： 可以通过 `@layer` 规则将样式添加到指定的级联层中。这使得开发者能够更有序地组织样式。
    
*   匿名级联层： 如果未使用 `@layer` 规则，样式将被放入默认的匿名级联层。这样可以确保未指定级联层的样式不会影响到指定级联层的样式。
    
*   预定义级联层顺序： 级联层可以预定义一个顺序，确保在样式规则中未明确指定级联层的情况下，样式按照默认的预定义级联层顺序应用。
    
*   加载外部 CSS 文件到级联层： 可以通过 `@layer` 规则加载外部 CSS 文件到指定的级联层中，这样可以更灵活地组织和加载样式。
    
*   无级联层样式： 可以使用 `@layer unlayered` 规则将样式添加到无级联层的样式层，这样的样式在默认情况下不会被任何级联层继承。
    
*   级联层嵌套： 可以将一个级联层嵌套在另一个级联层中，以创建更复杂的样式层次结构。
    
*   回滚级联层： 可以通过 `@layer` 规则回滚到之前的级联层状态，以便撤销某些样式的更改。
    

级联层为开发者提供了更精细的样式管理和组织的能力，使得在大型项目中更容易维护和扩展样式。

> 有关于 CSS 级联层 `@layer` 特性更详细的介绍，请移步阅读《现代 CSS》中的《CSS 分层：@layer 》课程！

**继承**
------

在 CSS 中，每个 CSS 属性定义的概述都指出了这个属性是默认继承的还是默认不继承的。这决定了当你没有为元素的属性指定值时该如何计算值。当元素的一个 继承属性没有指定值时，则取父元素的同属性的计算值。只有文档根元素取该属性的概述中给定的初始值；当元素的一个非继承属性没有指定值时，则取属性的初始值。比如：

```
html {
    font-size: small;
}
```

这个规则在 HTML 文档的根元素 `html` 设置了一个 `font-size` 属性，而这个属性是会被继承的（在 CSS 中有些属性天性就会被继承）。正如上面所示，`html` 元素的所有后代元素都将被继承这个属性，比如下图中蓝框中显示的一样：

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zib533Fg6TVEekjZhxNczeJliarGrjt2INECPyrLkmyUyGxmGSfRmLnfrbZFAyZdnbgmCqgaCTkR3iaw/640?wx_fmt=png&from=appmsg)

上图蓝框中告诉 `body` 元素继承 `html` 元素的 `font-size: small;`。开发者工具中会提示我们 “**Inherited from html**”。那么问题来了，在 CSS 中哪些属性是会被继承的？其实在 W3C 规范中各个属性的描述已经很清楚的告诉我们了。比如说 `border` 属性，在描述其语法时，在列表中有一个 **Inherited** 描述项的值为 **no**。这也就告诉我们 `border` 属性是不能被继承的。反之，再看 `font-size` 属性，语法描述的列表中同样有一个 **Inherited** 描述项，只不过它的值不是 **no**，而是 **yes**，也就是说 `font-size` 属性是会被继承的。

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zib533Fg6TVEekjZhxNczeJlAkQpWcktFFOickq7iaXrwSLIXvp5INW9xoKfLhFnZZMr7iaBiaIxbbIzEQ/640?wx_fmt=png&from=appmsg)

这决定了当你没有为元素的属性指定值时该如何计算值。

如果你平时阅读规范仔细的话，不难发现，在介绍每个属性的语法参数的时候，都会有一个 **Initial** 参数，该参数主要指定每个属性的初始值。CSS 属性已经给出的初始值针对不同的继承和非继承属性有不同的含义：

*   对于继承属性，初始值只能被用于没有指定值的根元素上
    
*   对于非继承属性，初始值可以被用于任意没有指定的元素上
    

这样我们引出两个概念：**初始值**和**继承值**，除了这两个概念之外，在 CSS 属性中还有一个**计算值**，该值由指定的值计算而来：

*   处理特殊的值`inherit`和`initial`
    
*   根据属性的摘要中关于计算值描述的方法计算出值
    

计算属性的计算值通常包括将相对值转换成绝对值，比如 `em` 和 `%` 这样的单位。例如：

```
font-size: 16px;
padding-top: 2em;
```

其中 `padding-top: 2em` 就是一个计算值，其计算出来的值将根据 `font-size` 做为基数计算（在此示例中），在此计算出来的值是 `32px`。然而，有些属性的百分比值会转换成百分比的计算值（比如 `width` ）。另外， `line-height` 属性值是没有单位的数字，其值也是一个计算值。

> 对于 CSS 的计算值，在不同的浏览器中其计算出来的值有时候会略有偏差。

如果你感兴趣的话，可以打开浏览器的开发者工具，查看对应的计算值（比如，Chrome 开发者工具，有一个 **Computed 选项**，该选项展示的就是对应的 CSS 计算值），如下图所示：

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zib533Fg6TVEekjZhxNczeJlJ0MOQRwUibmkoDMp9pHQHY8xmGRx9zeBaASp5c0y5WyrPglWPu72H7w/640?wx_fmt=png&from=appmsg)

> 其中计算值的最主要用处是继承，包括`inherit`关键词。

最后总结两点：

*   当元素的一个继承属性没有指定值时，则取父元素的同属性的计算值，只有文档根元素取该属性的概术中给定的初始值
    
*   当元素的一个非继承属性没有指定值时，则取属性的初始值
    

看到这里，或许你知道了什么叫继承和非继承，以及他们取值方式。但你可能还在纠结，在 CSS 中到底哪些属性是继承属性，哪些不是继承属性？其实这个问题我也没办法准确的回答您，因为我也没有做过这方面的统计。不过我可以告诉大家两个小经验：

*   在 CSS 中一些关于字体、文本和颜色等属性都是可继承属性
    
*   在 CSS 中一些跟布局和盒子模型的属性都是非继承属性
    

如果你想准确的知道答案，可以通过这里整理的属性表格进行查看。只要 **Inherited** 选项是 **Yes** 的都表示是继承属性，否则都是非继承属性。

### **处理 CSS 继承的机制**

在 CSS 中提供了处理 CSS 继承的机制，简单地讲就是 CSS 提供了几个属性值，可以用来处理属性的继承。这几个属性值就是`initial`、`inherit`、`unset` 和 `revert`。其实除了这四个属性值之外，还有一个 `all` 属性值。虽然这几个属性值主要用来帮助大家处理 CSS 属性继承的，但他们之间的使用，还是有一定的差异化。先用一张图来阐述它们之间的差异：

![](https://mmbiz.qpic.cn/mmbiz_jpg/lP9iauFI73zib533Fg6TVEekjZhxNczeJlibxbHEsXtJIkuWic7aJibvmsvk5hWj539LVy9838C7k3GyjbZLmyz7XFw/640?wx_fmt=jpeg&from=appmsg)

接下来我们一看看这几个属性值的实际使用以及对应的差异化。

#### **initial**

在 CSS 中，每个属性都具有一个初始值，其实也就是 CSS 属性的默认值。在 CSS 规范中，都对每个属性的初始值做出了相关的定义。比如`text-align` 的初始值是 `left`，`display` 的初始值是 `inline`。

而这里，我们要说的是 CSS 的关键词 `initial`：

> If the cascaded value is the initial keyword, the property’s initial value becomes its specified value.

大致的意思是：“如果层叠值是 `initial` 关键词，则属性的初始值将成为其指定值”。换句话说，如果你在元素样式的设置中显式的设置某个属性的值为`initial` 时，其实就表示设置了该属性的默认值。

从文字上理解可能有点困惑，我们通过一个小例来帮助大家理解。假设我们有一个 `<p>` 元素，接触过 CSS 的同学都知道，它是一个块元素，为了好看，咱们添加一点修饰的样式代码：

```
p {    background: #f36;    padding: 2rem;    font-size: 2rem;    color: #fff;}
```

效果看起来像下面这样：

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zib533Fg6TVEekjZhxNczeJlrxVM5B8UkC0IEBrvTntVBSlVQLicVhlQn0jVVUEbicoiaEKs7MpDicib2Ow/640?wx_fmt=png&from=appmsg)

如果我们希望 `p` 元素变成行内元素时，按照我们以前的处理方式，需要手动处理浏览器默认样式（User-Agent 用户代理样式），也就是显示的重置：

```
p{
    dispaly: inline;
}
```

`block` 和 `inline`效果对比如下：

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zib533Fg6TVEekjZhxNczeJl2ms42abOTdStb8NMZ3GyAOq1gJX3gonRibMUeaDP5GKCd2bSfEJyCaQ/640?wx_fmt=png&from=appmsg)

前面提到过 `inline` 是 `display` 的初始值（也就是默认值），而在规范中也提到过：

> **你在元素样式的设置中显示的设置某个属性的值为** **`initial`** **时，其实就表示设置了该属性的默认值**。

也就是说，我们可以给 `display` 设置`initial` 关键词：

```
p {
    display: initial;
}
```

这个时候得到的效果其实和使用 `display:inline` 是一样的：

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zib533Fg6TVEekjZhxNczeJlIyEJT9E5Jz28MSZN8PlZiaHp8zQRWZ6AmPQlVnGQ9iaMaRXpPDBiawr8g/640?wx_fmt=png&from=appmsg)

如果我们通过浏览器检查器中的计算值（Computed）一项可以看出来，`display` 设置为 `initial` 时，会覆盖用户代理的样式值 `block`：

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zib533Fg6TVEekjZhxNczeJlW052kibheRribiaweut5tmr89cWIISib2polRvibqJRknrRb6OOeEqkZdrA/640?wx_fmt=png&from=appmsg)

接下来，我们再来看一个继承属性 `color`。所以 `<p>` 元素的后代元素 `<strong>` 也会继承 `<p>` 元素中设置的 `color: #fff` 值。如果我们显式的在 `strong` 中设置 `color` 的值为 `initial` 时，那么 `strong` 的 `color` 将重置为默认值。由于我们没有设置默认的 `color` 颜色，那么这个时候，浏览器将会把一个计算值赋予成 `color` 的初始值：

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zib533Fg6TVEekjZhxNczeJlQdAn3ST8mHthSiag4PsicUzVXzCUwrpswKJctj7e0LEg5m5FmWp5k7gQ/640?wx_fmt=png&from=appmsg)

#### **inherit**

CSS 添加了一个 `inherit` 关键词属性值，可以让元素强制继承父元素的某个属性的值。前面也说过，CSS 中有些属性自动就是可继承属性，比如 `font-size`、`color` 之类，但也有很多属性又是非继承属性，比如 `border`、`border-radius` 之类的。在这里，如果在非常继承的属性上显示的设置了 `inherit` 关键词，表示该元素将继承父元素指定的属性值或者计算值。

为了同样的能更好理解 `inherit` ，来看一个示例，在这个示例中，我们用 `border` 来做例子：

```
<div class="wrapper" style="border:5px solid blue;">    <div>...</div></div>
```

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zib533Fg6TVEekjZhxNczeJlLIDmgwkComEK6NWSAJFibvic6g1gaW14hb5upo6qNtJgMw6eLKWlJPGg/640?wx_fmt=png&from=appmsg)

从效果上可以看出来，`div.wrapper` 上的 `border` 样式并没有继承其子元素 `div` 上。如果我们想让 `.wrapper` 的子元素 `div` 也要具有与 `.wrapper` 元素的 `border` 样式，就需要在该元素 `div` 上显式设置相同的 `border` 样式：

```
<div class="wrapper" style="border:5px solid blue;">    <div style="border:5px solid blue;">...</div></div>
```

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zib533Fg6TVEekjZhxNczeJl3iapabXDVTH1A0ANu54HibAYjO5tC7icaiachtREhoKLd99licWT5WnAd3Q/640?wx_fmt=png&from=appmsg)

有了 `inherit` 关键词之后，事情要变得简单地多，只需要在 `.wrapper` 的子元素上设置 `border: inherit;`：

```
<div class="wrapper" style="border:5px solid blue;">    <div style="border: inherit;">...</div></div>
```

得到的效果将是一样的：

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zib533Fg6TVEekjZhxNczeJl3iapabXDVTH1A0ANu54HibAYjO5tC7icaiachtREhoKLd99licWT5WnAd3Q/640?wx_fmt=png&from=appmsg)

上面的示例是父元素设置了 `border` 样式，所以其继承了父元素的 `border` 样式。那如果将上面的示例稍做修改，在元素外套一个 `div` ，而这个 `div` 不做任何样式的设置。将又会变成一个什么样呢？直接上示例吧：

```
<div class="wrapper" style="border:5px solid blue;">    <div>        <div style="border: inherit;" class="ele">...</div>    </div></div>
```

效果如下：

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zib533Fg6TVEekjZhxNczeJliaGyiaA41X6FKmxHfvtTdmNn0eIekoYYWdJVYibzf8YkkO9GALGL1D5dg/640?wx_fmt=png&from=appmsg)

可以看到 `div.ele` 仅继承了其父元素 `div` 的 `border` 属性的计算值，并未继承其祖先元素 `.wrapper` 的`border` 属性的设置值，通过浏览器开发者工具，可以看得一目了然：

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zib533Fg6TVEekjZhxNczeJlnhlOMzLxcaqXbPgZeeGze1O9P5ib01902DKSjAggSpich7K1FSU1VZVA/640?wx_fmt=png&from=appmsg)

这个示例说明：仅管元素自身显式的设置了 `inherit` 关键词，但是，如果其父元素没有明确指定样式，那么其最终效果将和 `revert` 的效果一致。**即继承的是其父元素的计算值，也就是浏览器默认样式（User Agent Stylesheet）** 。

#### **revert**

`revert` 值早前被称之为 `default`。表示没有使用任何属性值。

我们都知道，如果没有使用作者样式表（也就是 Web 开发人员自己写的样式表），那么浏览器将会按这样的过程去检测，元素调用的样式：

*   浏览器首先会检测元素是否有使用作者样式表的属性
    
*   如果没有找到，将会检测客户端默认样式
    
*   如果没有找到客户端样式，相当于元素应用了`unset`
    

还是拿示例来说吧。比如我们一个 `div` 元素，我们并没有显式的在自己的样式表中设置其 `display` 属性的值。对于最后的渲染结果，浏览器将会使用用户代理规则的样式 `display:block`。

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zib533Fg6TVEekjZhxNczeJls3ZJO3yMWHOFd45bZqpJQcHlgKZyF82tc8GNm2bZQuGrNjJZ0pQDkg/640?wx_fmt=png&from=appmsg)

根据前面介绍的，就算是我们在 `div` 中显式的设置 `display:revert`，该元素也将使用用户代理规则中的 `display:block` 样式。同样，我们在另一个 `div` 元素中使用 `display:initial` ，根据前面介绍的，那在这个 `div` 将会采用 `display` 的初始值 `inline` 。比如下面的效果：

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zib533Fg6TVEekjZhxNczeJl2Nt0Qu8uIbY5v0ibOpEmtZsLhl5XtNGFo8U1IcwznNfXzgzyfxtAYlw/640?wx_fmt=png&from=appmsg)

我们再来看一个继承属性的运用场景。因为在 `div` 元素上设置了 `color:#fff;` 样式，这是用户写的样式，而且 `color` 是一个继承属性，只要是 `div` 的后代元素都将会继承 `color` 的属性值。根据前面所说 `revert` 的检测机制是，先检测用户自己写的样式，然后再检测用户代理样式，如果两都没有，才会设置 `unset` 的样式。所以最终我们看到的效果如下：(第二个设置了 `color:initial;`)。

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zib533Fg6TVEekjZhxNczeJl5wvG2Jmrfj15bARnosvesDh7LxT8aANUfWtcgC720txV6m6cMYpIqg/640?wx_fmt=png&from=appmsg)

#### **unset**

`unset` 是 `initial` 和 `inherit` 的组合。当属性设置为 `unset` 时，如果它是一个继承属性，那么它相当于是 `inherit`；如果它不是，则相当于 `initial`。

有一些属性，如果没有明确指定，将默认是 `inherit`。比如，我们给元素设置一个 `color`，那它将适用于所有默认的子元素。而其它属性，如 `border` 则默认是非继承属性。

```
<div class="wrapper" style="border: 5px solid blue;color: #fff;">    <div class="ele">...</div></div>
```

此时效果如下：

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zib533Fg6TVEekjZhxNczeJltib8noYrBr7lA7oRCd1U5A6OwvzvuibFicuSc6lZOLFPsYrR5ZpvcrXxQ/640?wx_fmt=png&from=appmsg)

示例中 `color` 属性被继承了，但 `border` 属性没有被继承。将上面的示例代码稍作调整：

```
<div class="wrapper" style="border: 5px solid blue;color: #fff;">    <div class="ele" style="border: unset; color:unset;">...</div></div>
```

`div.ele` 元素的 `border` 和 `color` 都设置了 `unset` 值。也就是说它将运用 `initial` 或者 `inherit` 的值。具体取决于哪个值，这得根据属性的默认行为是什么来决定。如果默认属性是 `inherit`，那将运用的是 `inherit`；如果默认属性是 `initial`，那将运用的是 `initial`。

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zib533Fg6TVEekjZhxNczeJlmqiczWcrgXhXCic8MQ1ABxtKL1a1HytMYRaicNlWmudyNFSTCU0EQup3A/640?wx_fmt=png&from=appmsg)

上面的示例中，`border` 属性采用的是 `initial`，`color` 属性采用的是 `inherit`。

#### **all**

在 CSS 中，`all` 是一个简写属性，其重设除了 `unicode-bidi` 和 `direction` 之外的所有属性至它们的初始值或继承值。`all` 有三个值：

*   `initial`：该关键字代表改变该元素或其父元素的所有属性至初始值。
    
*   `inherit`：该关键字代表改变该元素或其父元素的所有属性的值至他们的父元素属性的值。
    
*   `unset`：该关键字代表如果该元素的属性的值是可继承的，则改变该元素或该元素的父元素的所有属性的值为他们父元素的属性值，反之则改变为初始值。
    

来看示例。比如我们一个这样的一个 HTML 结构：

```
<div>...<strong>...</strong> ...</div>
```

给他们设置一些样式：

```
body {    padding: 2vw;}div {    background: #f36;    padding: 2rem;    font-size: 2rem;    color: #fff;    margin-bottom: 3rem;}strong {    font-size: 3rem;}
```

看到的效果如下：

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zib533Fg6TVEekjZhxNczeJlibwFy4SEWiafnQYV7K8UrHRDePDDnks9AM7G9D29iaAzvRicCL3Zy7OAow/640?wx_fmt=png&from=appmsg)

这效果正是我们想要的。`div` 显式的指定了`background`、`padding`、`font-size`、`color`和`margin-bottom`属性值，而其中`background`、`padding`、`margin-bottom`是非继承属性, 而`color`和`font-size`是继承属性。除此之外，`div`还有一个客户端代理样式`display:block`，这个属性也是一个非继承属性。另外`strong`元素设置了一继承属性`font-size`，这个元素默认情况下继承了共父元素的`color`属性，同时还继承了`html`元素的`font-family`和`line-height`属性。当然，`strong`元素也有一个客户端代理样式`font-weight:bold`。

上面看到的效果是我们平时使用的时候效果。如果这个时候，我们在`div`和`strong`同时设置`all:inherit;`时，得到的效果和前面的效果完全不一样：

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zib533Fg6TVEekjZhxNczeJlvN3Gz11RWWPBn7mXC1WyFzF9uKLYss6ANkuwbTY9lUNedOmoZpyZXA/640?wx_fmt=png&from=appmsg)

这个时候`div`和`strong`重置了当初自己设置的属性，并且继承了各自父元素的一些属性：

*   `div`元素继承了`body`元素的`padding`、`font-family`、`line-height`，同时也继承了`body`代理客户端的样式`color`、`background`和`display`
    
*   `strong`元素继承了`div`元素的样式
    

所以最后你看到的效果就像上图那样子。我们再把`all`的值设置为`initial`：

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zib533Fg6TVEekjZhxNczeJlEsh4plF7f6SUIp33aUCvtJFRI4INPTGyTwiaa0JAVzvIMjwkxcFF4mw/640?wx_fmt=png&from=appmsg)

这个时候`div`和`strong`样式都重置到了对应的初始样式，也就是对应的属性的默认样式，包括代理客户端样式也重置为对应属性的初始值。

最后来看`all`的值设置为`unset`的效果，下面的示例，我只在`strong`元素上设置`all:unset`，其效果就足以说明一切：

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zib533Fg6TVEekjZhxNczeJl1Eicam6C5F5YrX2XBJYmy7ibhIfpVtZaxQTI1YuLyIvqNwQr4ruxTnqQ/640?wx_fmt=png&from=appmsg)

效果中的第一个是没设置`all:unset`，第二个设置了`all:unset`。这个时候`strong`元素的`font-size`和`font-weight`继承了其父元素的`font-size`和`font-weight`。

`all`在 CSS 中有时候是一个属性，比如这里说的就是属性，但有的时候它还是 CSS 中某些属性的值。比如我们常在`transition`中用到的`all`，那这个时候就是属性值。到目前为止，CSS 中的`all`属性也得到了众多浏览器的支持。

如果你想更深入的了解 `initial` 、`inherit` 、`revert` 、`unset` ，那么请移步阅读《现代 CSS》的《CSS 显式默认值：inherit 、initial 、revert 和 unset》

**CSS 样式的计算**
-------------

CSS 属性的最终值会经过四步计算：

*   通过指定来确定值，常称之为**指定值（Specified Value）**
    
*   接着处理得到一个用于继承的值，常称之为**计算值（Computed Value）**
    
*   然后如果有必要的话转化为一个绝对值，常称之为**应用值（Used Value）**
    
*   最后根据本地环境限 tmhj 进行转换，常称之为**实际值（Actual Value）**
    

那么什么是**指定值**、**计算值**、**应用值**和**实际值**呢？

### **指定值**

用户代理必须先根据下列机制（按优先顺序）给每个属性赋值一个指定值：

*   如果层叠产生了一个值，就使用它
    
*   否则，如果属性是继承的并且该元素不是文档树的根元素，使用其父元素的计算值
    
*   否则使用属性的初始值，每个属性的初始值都在属性定义中指出了
    

### **计算值**

指定值通过层叠被处理为计算值，例如，`URI`被转换成绝对的，`em`和`ex`单位被计算为像素或者绝对长度。计算一个值并不需要用户代理渲染文档。用户代理规则无法处理为绝对 URI 的话，该`URI`的计算值就是指定值。

一个属性的计算值由属性定义中 Computed Value 行决定。当指定值为`inherit`时，计算值的定义可以依据继承中介绍的规则来计算。即使属性不适用（于当前元素），其计算值也存在，定义在'Applies To'行。然而，有些属性可能根据属性是否适用于该元素来定义元素属性的计算值。

### **应用值**

处理计算值时，尽可能不要格式化文档。然而，有些值只能在文档布局完成时确定。例如，如果一个元素的宽度是其包含块的特定百分比，在包含块的宽度确定之前无法确定这个宽度。应用值是把计算值剩余的依赖（值）都处理成绝对值后的（计算）结果。

### **实际值**

原则上，应用值应该用于渲染，但用户代理可能无法在给定的环境中利用该值。例如，用户代理或许只能用整数像素宽度渲染边框，因此不得不对宽度的计算值做近似处理，或者用户代理可能被迫只能用黑白色调而不是全彩色。实际值是经过近似处理后的应用值。

**小结**
------

本文涉及了大量的内容，希望它能帮助大家理解样式是如何受到我们编写和应用的影响。特别是 CSS 的层叠和继承。在实际使用的时候，如果很好的运用这些概念和手段，可以更好的帮助大家少写很多样式代码，而且更易于维护自己的 CSS 代码。

用张图来表示如下：

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zib533Fg6TVEekjZhxNczeJljA0CTN4CJtOsvfL06eyiaRHAaq0HHRrExvfpmKBzM3abvFJY6IxZxgA/640?wx_fmt=png&from=appmsg)