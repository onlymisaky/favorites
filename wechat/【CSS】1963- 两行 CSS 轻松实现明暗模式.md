> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/O9yg8XdSZA31ZEC8elSG5Q)

在 Web 开发中，为了根据用户的偏好模式（明暗模式）调整网页颜色，我们以前可能会使用媒体查询（`prefers-color-scheme`）。如今，CSS 提供了一种更为简便的方法：`light-dark()`函数。此函数能够根据当前颜色方案自动选择两种颜色中的一种进行输出，从而实现颜色的自适应显示。  

以前的明暗模式实现
---------

要根据所使用的浅色模式或深色模式更改颜色值，可以使用 `prefers-color-scheme` 媒体查询来更改自定义属性的值：

```
:root {  --text-color: #333; /* 浅色模式的值 */}@media (prefers-color-scheme: dark) {  --text-color: #ccc; /* 深色模式的值 */}
```

在实现深色模式时，通常会出现一堆重复的 CSS 变量，用于设置每种模式的值。然后，CSS 将使用这些自定义属性进行实际声明。

```
:root {  --text-color: #333; /* 浅色模式的值 */}@media (prefers-color-scheme: dark) {  --text-color: #ccc; /* 深色模式的值 */}
```

未来的明暗模式实现
---------

CSS Color Module Level 5 Specification[1] 新增了一个 `light-dark()` 函数。该函数接受两个颜色值作为其参数。根据正在使用的颜色方案，它将输出第一个或第二个颜色参数。

```
body {  color: var(--text-color);}
```

根据规范，如果使用的颜色方案是`light`或未知，则该函数计算为第一种颜色的计算值；如果使用的颜色方案是`dark`，则计算为第二种颜色的计算值。

使用的颜色方案不仅是用户选择的亮暗模式，还需要根据`color-scheme`属性的值确定使用的颜色方案。`color-scheme`属性可以指示元素使用哪种颜色方案进行渲染，这个方案会与用户的偏好进行协商，最终确定使用的颜色方案。因此，在使用`light-dark()`函数时，还需要在 CSS 中包含对应的`color-scheme`声明，以确保函数能够正确工作。

```
body {  color: var(--text-color);}
```

对于上面的代码，在浅色模式下返回第一个值，在深色模式下返回第二个值。

可以在特定元素上设置`color-scheme`，以覆盖默认值，从而强制元素进入所需的模式。

```
light-dark(<color>, <color>);
```

对于上面的代码，该元素及其子元素上的 `light-dark()` 将始终返回 `dark`对应的值。

下面来看一个简单的例子。以下 Demo 将展示几个带有`.auto`类的`<div>`元素。这些元素能够智能地适应系统颜色模式，自动切换为浅色或深色主题。而带有`.light`或`.dark`类的`<div>`元素则会强制应用对应的颜色模式。

```
light-dark(<color>, <color>);
```

非颜色值呢？
------

`light-dark(`) 函数的设计初衷是为了提供一个简单的中间解决方案，仅支持亮色和暗色的切换，并仅适用于颜色值。这一设计选择是有意为之，因为它旨在为最终的解决方案提供一个渐进的过渡。

根据 CSS 工作组的提议，未来的目标是引入一个更强大的函数，暂命名为 `schemed-value()`。这个函数将具有以下特性：

*   能够响应任何颜色方案值，不仅限于亮色和暗色。
    
*   支持除颜色之外的多种类型的值，以提供更广泛的定制选项。
    

它可能看起来像这样：

```
:root {  color-scheme: light dark;}:root {  --text-color: light-dark(#333, #ccc); }
```

当前只有`light-dark()`函数，但已足够应对当前浏览器功能的实际情况：

*   它仅支持浅色和深色模式，因为当前浏览器还不支持`color-scheme`中的`<custom-ident>`，因此支持其他模式尚无实际意义。
    
*   它仅处理`<color>`值，因为解析器需要提前知道正在解析的值类型。`light-dark()`被明确地定义为处理`<color>`值。
    

将功能范围从广泛的`schemed-value()`缩小到简洁的`light-dark()`，使得该函数能够按照当前的定义进行工作，而不需要将其纳入长期的发展轨道。此外，`light-dark()`的名称和语法非常易于记忆和使用，最重要的是它为开发者提供了一个实用的解决方案，满足了他们当前的需求。

浏览器支持
-----

`light-dark()` 函数的浏览器支持如下：

*   **Chromium (Blink)：** ⚠️ 已表示发布意图。预期将包含在 Chrome 123 中。
    
*   **Firefox (Gecko)：** ✅ Firefox 120 开始支持
    
*   **Safari (WebKit)：** ⚠️  已在主分支的 WebKit 中实现该功能。预期将包含在 Safari TP 188 中。
    

可以通过以下代码来判断当前使用的浏览器是否支持 CSS `light-dark()`函数：

```
:root {  color-scheme: light dark;}:root {  --text-color: light-dark(#333, #ccc); }
```

关注浏览器的支持情况：

*   Chromium/Blink: Issue #1490618[2] — 已开始（开放状态）
    
*   Firefox/Gecko: Issue #1856999[3] — 已解决
    
*   Safari/WebKit: Issue #262914[4] — 已解决
    

### 相关链接

[1]CSS Color Module Level 5 Specification： _https://drafts.csswg.org/css-color-5/_

[2]Issue #1490618： _https://bugs.chromium.org/p/chromium/issues/detail?id=1490618_

[3]Issue #1856999： _https://bugzilla.mozilla.org/show_bug.cgi?id=1856999_

[4]Issue #262914： _https://bugs.webkit.org/show_bug.cgi?id=262914_