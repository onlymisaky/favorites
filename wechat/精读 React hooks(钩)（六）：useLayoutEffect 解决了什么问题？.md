> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [zhuanlan.zhihu.com](https://zhuanlan.zhihu.com/p/674771514)

> 【专栏：精读 React Hooks】我用 16 篇文章详细解读 16 个 React 官方的 Hook，每一篇都尽力做到比官方文档更仔细且更易读，同时提供了开源 demo 作为演示。如果你是新手，可以把这个专栏当作学习材料，如果你有一定经验了，可以把这份专栏当作查缺补漏的资料。 专栏首发地址：[J 实验室 - React Hooks(钩)](https://weijunext.com/tag/React%20hooks)

如果你会用`useEffect`（**[精读 React hook(钩)（五）：useEffect 使用细节知多少？](https://weijunext.com/ar%3C/b%3Eticle/772e7900-ead5-4468-8a68-599e916bc651) ），那么你一定也会用`useLayoutEffect`。因为它们的用法一模一样。**

`useEffect`和`useLayoutEffect`的区别仅有一个：

*   `useEffect`执行时机是在 React 的渲染和提交阶段之后；
*   `useLayoutEffect`执行时机是在 React 的提交阶段之后，但在浏览器实际绘制屏幕之前。

本文首发于我的博客 **「 [J 实验室](https://weijunext.com/)」** 和我的公众号**「 [BigYe 程普](https://mp.weixin.qq.com/s/RXpu-Ck13zoHyLP1OOUZ-g)」**

useEffect vs useLayoutEffect
----------------------------

我们通过一个例子来看看阻塞和非阻塞对用户来说有什么区别。

```
import React, { useEffect, useLayoutEffect, useState, useRef } from 'react';

    function BoxComparison() {
      const [heightEffect, setHeightEffect] = useState(0);
      const [heightLayoutEffect, setHeightLayoutEffect] = useState(0);
      const refEffect = useRef(null);
      const refLayoutEffect = useRef(null);

      useEffect(() => {
        if (refEffect.current) {
          setHeightEffect(refEffect.current.offsetWidth);
        }
      }, []);

      useLayoutEffect(() => {
        if (refLayoutEffect.current) {
          setHeightLayoutEffect(refLayoutEffect.current.offsetWidth);
        }
      }, []);

      return (
        <div>
          <div>
            <h2>使用 useEffect</h2>
            <div ref={refEffect} style={{ width: '200px', height: '50px', background: 'lightgray' }}>这是一个方块</div>
            <div style={{ width: '100px', height: `${heightEffect}px`, background: 'red', marginTop: '10px' }}>红色方块</div>
          </div>

          <div style={{ marginTop: '30px' }}>
            <h2>使用 useLayoutEffect</h2>
            <div ref={refLayoutEffect} style={{ width: '200px', height: '50px', background: 'lightgray' }}>这是一个方块</div>
            <div style={{ width: '100px', height: `${heightLayoutEffect}px`, background: 'blue', marginTop: '10px' }}>蓝色方块</div>
          </div>
        </div>
      );
    }

    export default BoxComparison;
```

这个例子写了两个方块，分别使用`useEffect`和`useLayoutEffect`来更新高度，代码实际效果在[我的演示站](https://nextjs.weijunext.com/hooks/useLayoutEffect)查看。

当你在性能较差的设备上肉眼可以明显看到区别：

*   `useEffect`的方块会闪一下
*   `useLayoutEffect`的方块则不会闪

如果你的电脑性能比较好，可以尝试多次刷新，也有一定几率看到`useEffect`的闪动。

我们应该这样描述二者的区别：

*   `useEffect`: 执行时机是在 React 的渲染和提交阶段之后。这意味着当任何相关 DOM 更改被应用并且组件已被重新渲染后，`useEffect`里的代码会执行。但它是异步的，所以可能会在浏览器的下一个绘制周期之后才执行。
*   `useLayoutEffect`: 执行时机是在 React 的提交阶段之后，但在浏览器实际绘制屏幕之前。这使得你可以同步地读取或更改 DOM，然后让浏览器在下一次绘制时立即体现这些更改，从而避免不必要的闪烁或布局跳动。

useLayoutEffect 的作用
-------------------

我们已经清楚了`useLayoutEffect`的特性了，那么可以猜想，`useLayoutEffect`是作用于这样的场景：需要在浏览器绘制前获取 DOM 元素的大小或位置，或者在浏览器绘制前修改 DOM。

这里有一个非常典型的场景——tooltip 组件。我们就来写一个 tooltip 组件，应用`useLayoutEffect`来自适应设置 tooltip 位置。

我们的需求是：鼠标移入一个按钮，能够判断 tooltip 展示区域，如果按钮上方空间足够，则显示在上方，如果按钮上方空间不够，则自适应显示在按钮下方。

为了保证没有页面抖动，我们要使用`useLayoutEffect`来更新显示的位置，示例代码如下：

```
import React, { useLayoutEffect, useRef, useState } from "react";
    import { createPortal } from "react-dom";

    export default function HoverTooltip() {
      const containerRef = useRef(null);

      return (
        <div
          ref={containerRef}
          class
        >
          <ButtonWithTooltip
            containerRef={containerRef}
            tooltipContent="This tooltip does not fit above the button. This is why it's displayed below instead!"
          >
            Hover over me (tooltip above)
          </ButtonWithTooltip>
          <ButtonWithTooltip
            containerRef={containerRef}
            tooltipContent="This tooltip fits above the button"
          >
            Hover over me (tooltip below)
          </ButtonWithTooltip>
          <ButtonWithTooltip
            containerRef={containerRef}
            tooltipContent="This tooltip fits above the button"
          >
            Hover over me (tooltip below)
          </ButtonWithTooltip>
        </div>
      );
    }

    const ButtonWithTooltip = ({ tooltipContent, containerRef, children }) => {
      const [targetRect, setTargetRect] = useState(null);
      const [containerRect, setContainerRect] = useState(null);
      const buttonRef = useRef(null);

      return (
        <div class>
          <button
            ref={buttonRef}
            class
            onMouseEnter={() => {
              buttonRef.current &&
                setTargetRect(buttonRef.current.getBoundingClientRect());
              containerRef.current &&
                setContainerRect(containerRef.current.getBoundingClientRect());
            }}
            onMouseLeave={() => setTargetRect(null)}
          >
            {children}
          </button>
          {targetRect && containerRect && (
            <Tooltip targetRect={targetRect} containerRect={containerRect}>
              {tooltipContent}
            </Tooltip>
          )}
        </div>
      );
    };

    const Tooltip = ({ children, targetRect, containerRect }) => {
      const ref = useRef(null);
      const [tooltipHeight, setTooltipHeight] = useState(0);

      useLayoutEffect(() => {
        if (ref.current) {
          const { height } = ref.current.getBoundingClientRect();
          setTooltipHeight(height); // 设置高度
        }
      }, [children]);

      let tooltipX = targetRect.left;
      let tooltipY =
        targetRect.top - containerRect.top - tooltipHeight < 0
          ? targetRect.bottom
          : targetRect.top - tooltipHeight; // 计算位置

      return createPortal(
        <div
          ref={ref}
          class
          style={{
            left: `${tooltipX}px`,
            top: `${tooltipY}px`,
          }}
        >
          {children}
        </div>,
        document.body
      );
    };
```

这里示例中，我们写了三个按钮，每次鼠标移入按钮的时候，计算按钮到父级上沿的空间是否可以容纳一个 tooltip，如果足够，tooltip 就在按钮上方展示，如果不够，则在按钮下方展示。实际效果如图：

![](https://pic1.zhimg.com/v2-1872635b39bf33636d5bc62c25997e44_r.jpg)

你也可以[到演示站](https://nextjs.weijunext.com/hooks/useLayoutEffect)试一试。

总结
--

最后，我们再明确一下`useEffect`和`useLayoutEffect`分别在何时使用、`useLayoutEffect`的使用注意事项。

### **何时使用`useEffect`**

*   **副作用与 DOM 无关**：例如，数据获取、设置订阅、手动更改浏览器的 URL 等。
*   **不需要立即同步读取或更改 DOM**：如果你不关心可能的微小布局跳动或闪烁，那么`useEffect`就足够了。
*   **性能考虑**：`useEffect`通常对性能影响较小，因为它不会阻塞浏览器渲染。

### 何时使用`useLayoutEffect`

*   **需要同步读取或更改 DOM**：例如，你需要读取元素的大小或位置并在渲染前进行调整。
*   **防止闪烁**：在某些情况下，异步的`useEffect`可能会导致可见的布局跳动或闪烁。例如，动画的启动或某些可见的快速 DOM 更改。
*   **模拟生命周期方法**：如果你正在将旧的类组件迁移到功能组件，并需要模拟 `componentDidMount`、`componentDidUpdate`和`componentWillUnmount`的同步行为。

### 使用注意事项

*   避免过度使用`useLayoutEffect`，因为它是同步的，可能会影响应用的性能。只有当你确实需要同步的 DOM 操作时才使用它。
*   如果代码在服务器端渲染（SSR）中出现问题，考虑回退到`useEffect`。`useLayoutEffect`在服务器端渲染时不会运行，可能会引发警告或错误。

专栏资源
----

专栏首发地址： [精读 React Hooks(钩)](https://weijunext.com/tag/React%20hooks)  
专栏演示地址： [React Hooks(钩) Demos](https://nextjs.weijunext.com/hooks)  
进群交流： [加入「前端 & Node 交流群」](https://weijunext.com/make-a-friend)