> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [www.51cto.com](https://www.51cto.com/article/782195.html)

> 随着前端开发的不断发展，CSS 的功能日益强大，其中 @规则扮演着举足轻重的角色。

随着前端开发的不断发展，CSS 的功能日益强大，其中 @规则扮演着举足轻重的角色。它们不仅扩展了 CSS 的功能边界，还为开发者提供了更加灵活和高效的样式定义方式，让我们来一同探索这些强大而实用的 @ 规则吧！

![](https://s7.51cto.com/oss/202402/27/e756fc39305e4fffc63875353a85c271528d48.png)

随着前端开发的不断发展，CSS 的功能日益强大，其中 `@`规则扮演着举足轻重的角色。它们不仅扩展了 CSS 的功能边界，还为开发者提供了更加灵活和高效的样式定义方式，让我们来一同探索这些强大而实用的 `@` 规则吧！

### @font-face

@font-face 用于使用自定义字体。它的基本用法包括定义一个字体家族并为这个家族指定一个或多个字体源文件。字体家族是为字体取的名字，而字体源文件则是字体的实际文件，可以通过 URL 指定。字体文件可以有多种格式，如 TrueType (.ttf)、OpenType (.otf)、Embedded OpenType (.eot)、SVG (.svg) 和 WOFF (.woff) 等。

例如，可以这样使用 @font-face：

```
@font-face {  
  font-family: "MyCustomFont";  
  src: url("MyCustomFont.woff2") format("woff2"),  
       url("MyCustomFont.woff") format("woff");  
}
```

这里定义了一个名为 "MyCustomFont" 的字体家族，并指定了两个字体源文件，一个是 WOFF 2 格式，另一个是 WOFF 格式。浏览器会首先尝试加载 WOFF 2 格式的字体，如果不支持，则会尝试加载 WOFF 格式的字体。

注意，虽然 @font-face 提供了很大的灵活性，但字体文件的体积可能非常大，而且需要额外的 HTTP 连接，这可能会降低网站页面的加载速度。因此，在使用 @font-face 时，需要权衡其优点和可能带来的性能问题。

### @keyframes

@keyframes 是 CSS3 动画中的一个关键特性，它允许定义动画过程中一系列关键帧的状态。通过这些关键帧，可以创建复杂的动画效果，指定动画在不同时间点的样式。

@keyframes 规则由两部分组成：名称和一组 CSS 样式规则。名称是定义动画的名称，而 CSS 样式规则描述了动画在每个关键帧时的样式。

下面是一个简单的例子，创建一个从红色渐变到蓝色的动画：

```
@keyframes color-change {  
  0% {  
    background-color: red;  
  }  
  50% {  
    background-color: yellow;  
  }  
  100% {  
    background-color: blue;  
  }  
}
```

其中，color-change 是动画的名称。0%、50% 和 100% 是关键帧，分别表示动画的开始、中间和结束状态。在每个关键帧中，定义了背景颜色。

要应用这个动画到一个元素上，需要使用 animation 属性，如下所示：

```
div {  
  width: 100px;  
  height: 100px;  
  animation-name: color-change;  
  animation-duration: 4s;  
  animation-iteration-count: infinite;  
}
```

这里将 color-change 动画应用到了一个 div 元素上。animation-duration 属性定义了动画的持续时间，animation-iteration-count 属性定义了动画的迭代次数（infinite 表示无限次）。

这样，div 元素的背景颜色就会从红色渐变到蓝色，然后再从蓝色渐变回红色，如此循环往复。

### @page

@page 是 CSS3 中的一个规则，用于指定打印文档时的页面样式。与屏幕显示的样式不同，@page 规则允许控制打印页面的布局和外观，例如页面大小、边距、页眉、页脚等。

可以使用 @page 规则为整个文档或特定页面设置样式。例如，可以指定页面大小、页边距的大小和方向，甚至可以添加背景图像或颜色。这对于创建适合打印的文档非常有用，因为打印输出通常需要不同的样式和布局来适应纸张的大小和方向。

下面是一个简单的例子，用于设置页面的大小和边距：

```
@page {  
  size: A4; /* 设置页面大小为 A4 */  
  margin: 2cm; /* 设置页边距为 2 厘米 */  
}
```

还可以使用 @page 伪类选择器来为文档中的不同页面指定不同的样式。例如，为第一页设置特殊的样式：

```
@page :first {  
  @top-left {  
    content: "前端充电宝"; /* 在第一页的左上角添加标题 */  
  }  
  @bottom-right {  
    content: "页码 " counter(page); /* 在第一页的右下角显示页码 */  
  }  
}
```

注意，@page 规则仅适用于打印样式表，并且不会影响屏幕显示。这意味着当创建一个样式表时，可能需要包含两个不同的部分：一个用于屏幕显示（使用媒体查询 @media screen），另一个用于打印（使用媒体查询 @media print）。

```
/* 屏幕显示样式 */  
@media screen {  
  /* ... */  
}  
  
/* 打印样式 */  
@media print {  
  @page {  
    size: A4;  
    margin: 2cm;  
  }  
  /* ... */  
}
```

这样，当打印文档时，浏览器会应用打印样式表，并使用 @page 规则来格式化页面。

### @media

@media 用于根据设备的媒体类型和特性应用不同的样式规则，也就是我们常说的媒体查询。它的基本语法如下：

```
@media mediatype and|not|only (media feature) { 
  /* ... */
}
```

其中 mediatype 是媒体类型，如 screen、print 等；media feature 则定义了媒体的一些特性，如 max-width、min-width 等。

使用 @media，可以针对不同的屏幕尺寸、设备类型等条件来应用不同的样式，以实现响应式布局或适配不同设备的显示效果。例如，可以设置当屏幕宽度小于 600px 时应用一套样式，而当屏幕宽度大于 900px 时应用另一套样式。

#### 应用场景：

*   **响应式布局**：随着移动设备的普及，越来越多的网站需要能够在不同大小的屏幕上都有良好的显示效果。使用 @media，可以根据屏幕的大小来调整布局、字体大小、图片大小等，以实现响应式布局。
*   **适配不同设备**：不同的设备可能有不同的显示特性，如电视、投影仪等可能有较高的分辨率，而手机、平板等则可能屏幕较小。使用 @media，可以针对这些设备的特性来应用不同的样式，以确保网站在这些设备上都能正常显示。
*   **打印样式**：在打印网页时，可能希望使用与屏幕显示不同的样式，如去掉背景图片、减小字体大小等。通过 @media print，可以定义只在打印时应用的样式规则。

下面来看一个使用 @media 的例子：

```
/* 默认样式，适用于所有设备 */  
body {  
  background-color: lightgray;  
  font-size: 16px;  
}  
  
/* 当屏幕宽度小于 600px 时应用的样式 */  
@media screen and (max-width: 599px) {  
  body {  
    background-color: pink;  
    font-size: 14px;  
  }  
}  
  
/* 当屏幕宽度在 600px 到 900px 之间时应用的样式 */  
@media screen and (min-width: 600px) and (max-width: 900px) {  
  body {  
    background-color: lightblue;  
    font-size: 18px;  
  }  
}  
  
/* 当屏幕宽度大于 900px 时应用的样式 */  
@media screen and (min-width: 901px) {  
  body {  
    background-color: lightgreen;  
    font-size: 20px;  
  }  
}
```

在这个例子中，定义了几个不同的 @media 查询，每个查询针对不同的屏幕尺寸应用不同的样式。当浏览器加载这个 CSS 文件时，它会根据当前设备的屏幕尺寸来确定应用哪个样式规则。

### @layer

@layer 声明了一个级联层，同一层内的规则将级联在一起，这给予了开发者对层叠机制的更多控制。

```
@layer default, theme, state;

@layer default {
  button {
    background: rebeccapurple;
    color: white;
  }    
}

@layer state {
  :disabled {
    background: dimgray;
  }    
}

@layer theme {
  button.danger {
    background: maroon;
  }

  button.info {
    background: darkslateblue;
  }

  #call-to-action {
    background: mediumvioletred;
  }
}
```

上面例子中定义了多个级联层，当一个声明中具有多个级联层时，后定义的级联层具有更高的优先级。因此上面例子中，state 层具有更高的优先级，即使 theme 样式中具有更高的特定性（权重）并且在代码中出现得更晚。

还可以嵌套图层：

```
@layer reset, framework, components, utilities;

@layer components {
  @layer default, theme, state;

  @layer state {
    /* components.state 层 */
    :disabled { background: dimgray; }    
  }
}

@layer components.state {
  /* components.state 层 */
  :focus-visible { outline: thin dashed hotpink; }
}
```

层按照每个层名称首次出现在代码库中的顺序堆叠，后面的层名称优先于前面的层。这意味着可以允许它们隐式堆叠：

```
@layer low { /* 最低层 */ }
@layer medium { /* 中间层 */ }
@layer high { /* 最高层 */ }
```

或者可以像上面例子一样，按顺序引入层名称来明确定义层顺序：

```
@layer low, medium, high;
```

### @scope

@scope 规则允许明确地定义样式的作用范围，分为两个部分。首先，通过选择特定的根元素来定义范围的边界。

```
@scope (.block) { /* 这里的样式仅适用于 .block 及其子元素 */  
  /* 样式 */  
}
```

在这个范围内，可以定义仅适用于该范围的子选择器，确保样式不会泄漏到范围外部：

```
@scope (.block) {  
  .element { /* 这里的样式仅适用于 .block 内的 .element 元素 */  
    /* 样式 */  
  }  
}
```

这与 CSS 嵌套的概念相似，但 @scope 提供了更明确的范围定义。在嵌套中，每个嵌套选择器前都可以有一个隐式的 &，代表父选择器。但在 @scope 中，不需要使用 &，因为范围已经通过 .block 明确定义了。 举个例子，下面的嵌套 CSS 代码：

```
.block {  
  &.active { /* 这里的 & 代表 .block，所以选择的是 .block.active */  
    color: red;  
  }  
    
  .element { /* 选择的是 .block .element */  
    background-color: yellow;  
  }  
}
```

使用 @scope 可以更简洁地写成：

```
@scope (.block) {  
  &.active {  
    color: red;  
  }  
    
  .element {  
    background-color: yellow;  
  }  
}
```

@scope 提供了一种更明确、更简洁的方式来定义和限制 CSS 规则的作用范围，从而减少了全局样式冲突的可能性，并提高了代码的可维护性。

### @container

@container 允许开发者根据容器（而非视口或屏幕）的尺寸变化来设置内部元素的样式。这种机制被称为 “容器查询”，它使得开发者能够更精细地控制页面布局，特别是当页面内部元素的尺寸变化时。

#### 基本用法：

*   首先，需要定义一个容器元素，例如 <div>，并为其指定一个唯一的名称或标识符。
*   然后，使用 @container 规则来定义当容器尺寸变化时应该如何调整内部元素的样式。

假设有一个名为. container 的 <div> 元素，它内部有一个 < p > 元素。当. container 的宽度小于 800px 时，改变 < p > 元素的字体颜色。可以这样实现：

```
.container {  
  container-name: myContainer; /* 为容器指定名称 */  
}  
  
@container myContainer (max-width: 800px) {  
  p {  
    color: gray; /* 当容器宽度小于800px时，<p>元素的字体颜色变为灰色 */  
  }  
}
```

### @starting-style

@starting-style 用于在元素首次应用样式或显示类型从 "none" 更改为其他类型时启动 CSS 过渡效果。这个规则使得开发者能够创建更平滑的动画效果，尤其是在元素从隐藏变为可见时。

@starting-style 的基本语法如下：

```
@starting-style {  
  /* 初始样式 */  
}  
  
/* 常规样式 */
```

当元素首次应用样式时，它将从 @starting-style 定义的初始样式开始过渡，到达在常规样式定义中指定的样式。

假设有一个 div 元素，希望在页面加载时它从透明变为不透明，同时背景颜色从绿色过渡到橙色。可以这样使用 @starting-style：

```
div {  
  transition: opacity 0.5s, background-color 0.5s;  
  opacity: 1;  
  background-color: lime;  
}  
  
@starting-style {  
  div {  
    opacity: 0;  
    background-color: green;  
  }  
}
```

在这个例子中，当 div 元素首次渲染时，它会从 opacity 为 0 和背景颜色为绿色的状态开始，然后过渡到 opacity 为 1 和背景颜色为橙色的状态。

### @property

@property 是 CSS Houdini API 的一部分。这个规则允许开发者显式地定义 CSS 自定义属性，并进行属性类型检查、设定默认值以及定义该自定义属性是否可以被继承。通过 @property，可以直接在样式表中注册自定义属性，无需运行任何 JavaScript 代码；同时，它也配备了相应的 JavaScript 语法来注册自定义属性。

@property 自定义属性可以看作是 CSS 变量声明变量的升级版本，它提供了更加规范和严谨的方式来定义和使用自定义属性。在 CSS 中使用自定义属性，可以使样式更加灵活和可维护，同时也能够减少重复的代码。

在定义一个 @property 时，需要指定自定义属性的名称、语法结构、初始值以及是否允许继承等参数。例如，可以使用以下语法来定义一个名为 --my-color 的自定义属性：

```
@property --my-color {  
  syntax: '<color>';  
  inherits: false;  
  initial-value: red;  
}
```

这里，--my-color 是一个自定义属性名称，syntax 指定了该属性的语法结构为颜色值，inherits 指定了该属性不被继承，initial-value 指定了该属性的初始值为红色。定义了这个自定义属性之后，就可以在 CSS 中使用它了：

```
.element {  
  --my-color: blue;  
  background-color: var(--my-color);  
}
```

在这个例子中，.my-element 的背景颜色被设置为蓝色，这是通过自定义属性 --my-color 来实现的。同时，也可以使用 JavaScript 来动态地改变这个自定义属性的值，从而改变元素的样式。

### @charset

@charset 用于定义样式表中使用的字符编码。这个规则必须写在样式表的最开头，并且前面不可有别的字符，包括注释。在 @charset 之后，需要指定字符编码的名称，例如：

这个规则的主要为了在 CSS 文件中明确指定字符编码，以确保样式表能够正确解析和显示。当 CSS 文档没有声明字符编码时，将使用 HTML 文档声明的字符编码。如果两者都没有声明，那么默认会使用 “UTF-8” 编码。

### @import

@import 用于从其他样式表中导入样式规则。这意味着可以将一个大的样式表拆分成多个较小的文件，并使用 @import 规则将它们组合在一起。这有助于更好地组织和管理样式表，特别是当项目变得庞大且复杂时。

@import 规则的基本语法：

```
@charset 'UTF-8';
```

其中'path/to/styles.css'是要导入的外部样式表的路径。

还可以使用媒体查询与 @import 结合，以便在不同条件下导入不同的样式表。例如：

```
@import url('path/to/styles.css');
```

然而，需要注意的是，虽然 @import 提供了拆分和组织样式表的便利，但过度使用它可能会导致性能问题。因为每个 @import 都会触发一个新的 HTTP 请求，这可能会增加页面加载时间。因此，在实际项目中，建议谨慎使用 @import，并考虑使用其他技术（如 CSS 预处理器）来更好地管理和组织样式表。

另外，关于 @import 的使用还有一些限制和注意事项：

*   @import 规则必须位于样式表的顶部，位于所有其他规则之前（除了 @charset 规则之外）。
*   @import 不是一个嵌套语句，这意味着不能在条件组的规则或媒体查询内部使用 @import。

### @namespace

@namespace 用于定义 XML 命名空间。它可以把通配、元素和属性选择器限制在指定命名空间里的元素。这在处理包含多个命名空间的文档时非常有用，例如 HTML5 中的内联 SVG、MathML 或者混合多个词汇表的 XML。

@namespace 规则也可以用来定义默认命名空间。当定义过默认命名空间后，所有的通配选择器和类型选择器（但不包括属性选择器）都只应用在这个命名空间的元素中。此外，@namespace 规则还可以用于定义命名空间前缀，当一个通配、类型、属性选择器前面有命名空间前缀修饰时，这个选择器将只匹配那些命名空间与元素名或属性匹配的元素。

下面来在 CSS 中使用 @namespace 来为 SVG 元素定义样式：

```
@import url('mobile.css') screen and (max-width: 768px);。
```

在这个例子中，首先使用 @namespace 声明了 SVG 的命名空间 URL。然后，使用命名空间前缀 svg| 来指定想要选择的是 SVG 命名空间中的 circle 元素。这样，fill、stroke 和 stroke-width 的样式就只会应用到 SVG 命名空间中的 circle 元素，而不是 HTML 中的其他元素。

注意，在实际开发中，由于 HTML5 允许 SVG 直接嵌入而不需要显式地声明命名空间，因此在大多数情况下可能不需要使用 @namespace。

### @supports

@supports 是 CSS3 引入的一个特性查询规则，用于检查浏览器是否支持某个 CSS 属性或属性值，然后根据检查结果应用不同的样式规则。如果浏览器支持指定的属性或属性值，那么就会应用相应的样式；如果不支持，则不会应用。

@supports 的基本语法如下：

```
<!DOCTYPE html>  
<html>  
  <head>  
    <style>  
      /* 定义 SVG 命名空间 */  
      @namespace svg url(http://www.w3.org/2000/svg);  

      /* 为 SVG 命名空间中的元素定义样式 */  
      svg|circle {  
        fill: blue;  
        stroke: pink;  
        stroke-width: 5;  
      }  
    </style>  
  </head>  
  <body>  

    <svg width="100" height="100">  
      <circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red" />  
    </svg>  

  </body>  
</html>
```

下面是一个使用 @supports 的例子，检查浏览器是否支持 display: grid 属性，并据此应用不同的布局样式：

```
@supports (property: value) {  
  /* 如果浏览器支持 property: value，则应用这些样式 */  
}
```

这里，如果浏览器支持 display: grid，.container 类将使用网格布局；否则，它将使用默认的块级布局。

@supports 的主要应用场景是渐进增强和优雅降级。通过 @supports，可以编写更灵活的 CSS，确保在不支持某些新特性的旧浏览器中仍然有可接受的样式表现，而在支持这些特性的新浏览器中则能享受更先进的布局和功能。

@supports 还支持使用逻辑操作符 and、or 和 not 来组合多个条件，这使得特性查询更加灵活。

```
.container {  
  display: block; /* 默认布局 */  
}  
  
@supports (display: grid) {  
  .container {  
    display: grid;  
    grid-template-columns: 1fr 1fr; /* 如果支持 grid，则应用网格布局 */  
  }  
}
```

在这个例子中，@supports 查询会检查浏览器是否支持标准的 display: flex 或者 WebKit 前缀的 display: -webkit-flex，如果满足其中一个条件，就会应用内部的样式规则。

### @counter-style

@counter-style 允许定义如何将计数器的整数值转化为字符串表示，从而自定义计数器的样式。这个规则非常灵活，可以指定计数系统的类型、使用的符号、前缀、后缀等。

@counter-style 的基本语法如下：

```
@supports (display: flex) or (display: -webkit-flex) {  
  /* 如果浏览器支持 flex 或 -webkit-flex，则应用这些样式 */  
}
```

其中 <counter-style-name> 是自定义计数器样式的名称，<countersystem> 指定了计数系统（如循环、数值、字母等），<countersymbols> 定义了一组用于表示计数器值的符号。

假设想要创建一个名为 "thumbs" 的计数器样式，该样式使用 Unicode 字符 "👍" 和 "👎" 作为计数符号，并且每两个计数值循环一次。可以这样定义：

```
@counter-style <counter-style-name> {  
  system: <countersystem>;  
  symbols: <countersymbols>;  
  /* 其他描述符，如 prefix, suffix, range, pad, speak-as, fallback 等 */  
}
```

这里创建了一个名为 "thumbs" 的计数器样式，它使用循环计数系统（system: cyclic），并且定义了两个符号（"👍" 和 "👎"）。然后，将这个样式应用到了一个有序列表（ol.thumbs-list）上，这样列表项就会使用我们定义的 "thumbs" 样式来显示计数器。

### @font-palette-values

@font-palette-values 用于定义指定字体的配色方案。这个规则允许开发者不仅可以选择字体内置的各种配色方案，还可以自定义配色方案。通过 @font-palette-values 规则，开发者可以为特定的字体指定一组颜色，并在 CSS 中使用这些颜色来为网页元素提供一致的配色。

基本语法如下：

```
@counter-style thumbs {  
  system: cyclic;  
  symbols: "👍" "👎";  
  suffix: " ";  
}  
  
/* 使用自定义的计数器样式 */  
ol.thumbs-list {  
  list-style: thumbs;  
}
```

其中 <font-family> 是指定的字体家族名称，<palette-name> 是自定义的配色方案名称，<color-stop> 是颜色值，<percentage> 是该颜色在配色方案中的位置（百分比）。

例如，假设有一个名为 "MyCustomFont" 的字体，并想为它定义一个名为 "MyPalette" 的配色方案：

```
@font-palette-values <font-family> {  
  <palette-name> {  
    <color-stop> <percentage>;  
    <color-stop> <percentage>;  
    /* ... */  
  }  
  /* 可以定义多个配色方案 */  
}
```

这里定义了一个从红色渐变到橙色，再到黄色的配色方案。然后，在 CSS 中，可以使用这个配色方案来为网页元素设置颜色：

```
@font-palette-values MyCustomFont {  
  MyPalette {  
    red 0%;  
    orange 50%;  
    yellow 100%;  
  }  
}
```

注意，@font-palette-values 的支持和可用性可能取决于浏览器和字体文件本身，并非所有字体都支持自定义配色方案。

### @font-feature-values

@font-feature-values 用于定义字体特性的替代值。这个规则允许开发者为特定的字体家族定义命名的特性值，然后在 font-variant-alternates 属性中使用这些命名值来应用字体特性，从而简化 CSS 的编写。

这个规则的基本语法如下：

```
h1 {  
  font-family: MyCustomFont;  
  font-palette: MyPalette;  
}
```

其中 <font-family-name> 是想要应用特性值的字体家族名称，<feature-name> 是字体特性（如 swash、styleset 等），<feature-value-name> 是为特性定义的名称，而 <feature-value-index> 是该特性值在字体中的索引。

举个例子，假设有一个名为 "FancyFont" 的字体，它支持 "swash" 特性，该特性有三个不同的样式。可以使用 @font-feature-values 来定义这些样式的命名值：

```
@font-feature-values <font-family-name> {  
  <feature-name> {  
    <feature-value-name>: <feature-value-index>;  
    /* ... */  
  }  
  /* 可以定义多个特性及其值 */  
}
```

然后，在 CSS 中，可以使用这些命名值来应用 "swash" 特性的不同样式：

```
@font-feature-values FancyFont {  
  swash {  
    fancy-style: 1;  
    more-fancy-style: 2;  
    wild-style: 3;  
  }  
}
```

这样，<p> 元素将使用 "fancy-style" 的 swash 特性，而 <h1> 元素将使用 "more-fancy-style" 的 swash 特性。