> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/PrxVNteD6zOwymh9zITRcg)

在 Web 开发领域中，CSS（层叠样式表）是构建网站视觉美感和布局的支柱。虽然许多开发人员熟悉常用的 CSS 属性，但仍有大量隐藏的宝石等待被发现。  

在今天这篇文章中，我们揭示了 15 个隐藏的 CSS 属性，这些属性可能没有引起您的注意，但在增强您的网页设计能力方面具有巨大的潜力。

**1.backdrop-filter:**

此属性将图形效果（例如模糊或色移）应用于元素内容后面的区域。它非常适合创建磨砂玻璃效果或为元素添加微妙的视觉增强效果。

```
.element {
    backdrop-filter: blur(5px);
}
```

**2.clip-path：**

剪切路径允许您定义剪切区域以有选择地显示元素的一部分，从而实现简单矩形之外的复杂且富有创意的形状。

```
.element {
    clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
}
```

**3.mix-blend-mode:**

此属性控制元素的内容与其背景混合的方式，提供与图形设计软件中类似的各种混合模式。

```
.element {
    mix-blend-mode: screen;
}
```

**4. text-overflow:**

文本溢出允许您控制溢出其容器的文本的显示方式，提供省略号或自定义溢出指示器的选项。

```
.element {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
```

**5. scroll-behavior:**

该属性定义了溢出元素的滚动行为，只需简单的声明即可实现平滑的滚动动画。

```
.element {
    overflow-y: auto;
    scroll-behavior: smooth;
}
```

**6. shape-outside:**

Shape-outside 允许文本环绕不规则形状的元素，为文本布局和设计开辟了新的可能性。

```
.element {
    float: left;
    width: 200px;
    height: 200px;
    shape-outside: circle(50%);
}
```

**7. 图像渲染：**

此属性控制图像在浏览器中的渲染方式，提供优化图像质量和渲染速度的选项。

```
img {
    image-rendering: pixelated;
}
```

**8. overscroll-behavior:**

过度滚动行为确定用户过度滚动元素时的行为，允许开发人员进一步自定义滚动体验。

```
.element {
    overscroll-behavior: contain;
}
```

**9. user-select:**

user-select 控制用户是否可以选择元素内的文本，从而更好地控制用户交互和界面设计。

```
.element {
    user-select: none;
}
```

**10. text-align-last:**

Text-align-last 指定块或行的最后一行（强制换行符之前）如何在其容器内对齐。

```
.element {
    text-align: justify;
    text-align-last: center;
}
```

**11. column-span:**

Column-span 允许元素在多列布局中跨越多个列，从而有助于创建复杂且动态的布局。

```
.element {
    column-span: all;
}
```

**12. counter-increment:**

计数器递增增加一个或多个计数器，提供一种动态对元素进行编号或基于计数器值生成内容的方法。

```
ol {
    counter-reset: section;
}
```

```
li::before {
    content: counter(section) ".";
    counter-increment: section;
}
```

**13. object-fit:**

Object-fit 指定如何调整元素内容的大小以适合其容器、保留纵横比并控制溢出行为。

```
img {
    width: 200px;
    height: 200px;
    object-fit: cover;
}
```

**14. mask-image:**

mask-image 应用图像来选择性地遮盖或显示元素内容的部分内容，从而实现复杂且具有视觉吸引力的设计。

```
.element {
    mask-image: url('mask.png');
}
```

**15. overscroll-behavior-block:**

Overscroll-behavior-block 确定用户垂直滚动块级元素时的行为，从而提供对滚动交互的精细控制。

```
.element {
    overscroll-behavior-block: none;
}
```