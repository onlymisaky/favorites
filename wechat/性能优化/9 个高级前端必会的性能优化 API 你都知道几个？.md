> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/Dx8FCTsEkBPPe6bBlFxWnw)

requestIdleCallback
-------------------

`requestIdleCallback` 是 **浏览器提供的 API**，用于在 **浏览器空闲时执行低优先级任务**，不会阻塞主线程，也不会影响动画和用户交互。

### 使用场景

1.  **非紧急任务**（如日志上报、数据同步、预加载）
    
2.  **避免影响 UI 渲染**（不会卡顿）
    
3.  **Web3 DApp**（如区块链数据同步、NFT 预加载）
    

```
// 传统方式(可能阻塞交互，导致界面发生卡顿)
setTimeout(processAnalyticsData, 1000);

// 优化方式
function doWork(deadline) {
  while (deadline.timeRemaining() > 0) {
    processDataChunk(); //分块处理数据
    requestIdleCallback(doWork);
  }
}



```

IntersectionObserver
--------------------

`IntersectionObserver` 是浏览器提供的一个 API，用于异步观察一个元素（target element）与其祖先元素或顶级文档视口（viewport）之间的交集变化。简单来说，它可以监听某个元素是否进入或离开视口，以及可见部分的比例。

### 主要用途

1.  **懒加载（Lazy Loading）** ：当图片或组件进入视口时才加载，提高性能。
    
2.  **无限滚动（Infinite Scroll）** ：监测滚动到底部，自动加载新内容。
    
3.  **动画触发**：当元素进入视口时，触发 CSS 动画或 JavaScript 事件。
    
4.  **广告曝光统计**：检测广告是否被用户看到，以进行数据分析。
    

```
// 传统懒加载
window.addEventListener("scroll", () => {
  imgs.forEach((img) => {
    if (rect.top < window.innerHeight) {
      img.src = img.dataset.src;
    }
  });
});

// 优化实现（无布局抖动）
document.addEventListener("DOMContentLoaded", function() {
const images = document.querySelectorAll('img.lazy-load');

const lazyLoad = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.remove('lazy-load');
        observer.unobserve(img);
      }
    });
  };

const observer = new IntersectionObserver(lazyLoad, {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  });

  images.forEach(img => {
    observer.observe(img);
  });
});



```

WeakMap
-------

`WeakMap` 是 JavaScript 提供的一种 **弱引用（Weak References）** 的 `Map` 结构，主要用于 **存储对象的临时数据，而不会阻止垃圾回收**。它的键（`key`）**必须是对象**，而 **值（`value`）可以是任意类型**。

### 代码示例

```
// 传统方式(内存泄漏风险):
const domDataMap = new Map();
domDataMap.set(element, { count: 0 });

// 优化方案:
const weakMap = new WeakMap();
weakMap.set(element, { count: 0 }); // 当element被移除D0M时，关联数据自动GC



```

ResizeObserver
--------------

`ResizeObserver` 是 **原生 JavaScript API**，用于监听 **DOM 元素尺寸的变化**，并在尺寸变化时执行回调函数。它可以检测元素的 `width` 和 `height` 变化，而 **不需要监听 `window.resize` 事件**。

### 常见用途

1.  **响应式布局**：当元素大小变化时，调整 UI。
    
2.  **动态文本溢出检测**：监听文本容器大小变化，动态调整样式。
    
3.  **Canvas / SVG 适配**：根据容器大小调整绘制区域。
    
4.  **Web3 / DApp 开发**：适用于自适应的 NFT 画廊、区块链数据可视化等。
    

```
// 传统响应式布局
window.addEventListener(
"resize",
  debounce(() => {
    const width = container.offsetWidth;
    adjustElements(width);
  }, 200),
);

// 优化方案
const resizeObserver = new ResizeObserver(entries => {
for (let entry of entries) {
    console.log('Element:', entry.target);
    console.log('Content Rect:', entry.contentRect);
    console.log('Width:', entry.contentRect.width);
    console.log('Height:', entry.contentRect.height);
  }
});

const element = document.querySelector('#myElement');

resizeObserver.observe(element);


```

Web Workers
-----------

`Web Workers` 是 **浏览器提供的多线程技术**，用于 **在后台运行 JavaScript 代码**，避免主线程阻塞，提高应用的 **性能和响应速度**。

```
// 主线程阻塞案例:
function processData(data) {
  // 30秒计算...
  updateUI(); //界面卡死
}

// 并行优化方案:
const worker = new Worker("processor.js')
worker.postMessage(data)//处理完数据后会有消息通知
worker.onmessage =e => updateUI(e.data)


```

requestAnimationFrame
---------------------

`requestAnimationFrame`（简称 `rAF`）是浏览器提供的 **高性能动画 API**，用于在 **下一帧渲染时执行回调函数**，使动画更加 **流畅**，并且 **降低 CPU/GPU 资源消耗**。

```
// 传统动画卡顿
function animate() {
  element.style.left = (pos += 2) + "px";
  setTimeout(animate, 16); //时间不精确
}

// 流畅动画方案
function animate() {
  console.log("下一帧执行动画");
  requestAnimationFrame(animate); // 递归调用，创建动画循环
}

requestAnimationFrame(animate);


```

URL.createObjectURL
-------------------

`URL.createObjectURL()` 是 **浏览器提供的 API**，用于创建 **Blob 或 File 对象的临时 URL**，可以用来 **本地预览文件（如图片、视频）、下载文件**，而不需要上传到服务器。

```
// 传统 base64方式读取内容:
const reader = new FileReader()
reader.onload =e => img.src = e.target.result // 内存膨胀
reader.readAsDataURL(100MBFile)//耗时5s+

// 高性能方案:
const url = URL.createObjectURL(100MBFile)
img.src = url // 瞬时完成
//使用后记得 revoke0bjectURL 释放内存


```

content-visibility
------------------

隐藏不在视口中的元素，减少不必要的渲染，提高滚动性能。

```
.lazy-load {
  content-visibility: auto;
}


```

**适用场景**：

*   **长列表渲染**（如消息流、新闻）
    
*   只渲染视口内的元素
    

Fetch API + Streams
-------------------

支持流式传输，减少等待时间，适用于大文件加载。

```
fetch('/large-file').then(response => {
  const reader = response.body.getReader();
  reader.read().then(({ done, value }) => {
    console.log("流式加载部分数据:", value);
  });
});


```

**适用场景**：

*   大文件传输（如视频、JSON）
    
*   SSR（服务器端流式渲染）
    

作者：至简简

https://juejin.cn/post/7485285613463535670