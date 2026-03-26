> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/gPv86YeucqBOtLWEiYp_FA)

```
大厂技术  高级前端  Node进阶

点击上方 程序员成长指北，关注公众号

回复1，加入高级Node交流群

```

今天和同事讨论时，讨论了`页面滚动加载数据`的事情，正好我去年年底也做过相同的功能，只是当时因为各种原因吧，没有做总结。现在回想起来，只是记得以前做过，在哪个页面实现的，具体实现的方法，确实有点忘记了。记得当时好像也尝试了很多的方法，最后才实现，这里又要吐槽一下自己的笨了。

所以把当时的代码给扒出来，是利用`IntersectionObserver`这个 api 实现的，然后在网上找了一些资料，准备输出整理一下相关的文档。

好，我们正式开始介绍。

介绍
--

> `IntersectionObserver` 是一种现代 Web API，它允许开发者异步观察`一个目标元素与其祖先元素或视口（viewport）交叉状态`的变化。这对于实现图片懒加载或无限滚动功能非常有用。

这里我们借用`阮一峰大佬`的图片介绍：

图片来源为：IntersectionObserver API 使用教程 [1]

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/YBFV3Da0NwumbcOdugDP3XODmic4FfXNqV331orqUkO66QWWwZibjQgVQWxfXgrO3kCpdL8amFt5wUK8YxwkSVhA/640?wx_fmt=other&from=appmsg)

传统的实现方法是，在监听到`scroll`事件后，调用目标元素（绿色方块）的`getBoundingClientRect()`方法，获取它相对于视口左上角的坐标，然后判断是否在视口内。然而，这种方法的缺点在于由于 scroll 事件频繁触发，计算量较大，容易导致性能问题。

而现在就可以使用`IntersectionObserver` 这个 api 实现。

具体实现见下文。

API
---

> `IntersectionObserver` API 是一个用于异步监听目标元素与其祖先或视口 (viewport) 交叉状态的 API。它可以有效地观察页面上的元素，特别是在需要实现懒加载 (lazy loading)、无限滚动(infinite scrolling) 或者特定动画效果时非常有用。

在介绍`IntersectionObserver` API 之前，我们先介绍一些概念，便于在后面使用。

1.  **目标元素 (Target Element)** ：需要被观察交叉状态的 DOM 元素。
    
2.  **根元素 (Root Element)** ：IntersectionObserver 的根元素，即用来定义视口的边界。如果未指定，默认为浏览器视口。
    
3.  **交叉状态 (Intersection)** ：目标元素与根元素或视口相交的部分。可以通过 IntersectionObserver 的回调函数获取交叉状态的详细信息。
    
4.  **阈值 (Threshold)** ：一个介于 0 和 1 之间的值，用来指定目标元素什么时候被视为 “交叉”。例如，一个阈值为 0.5 表示当目标元素 50% 可见时触发回调。
    

### 基本使用

使用 `IntersectionObserver` API 的基本步骤如下：

1.  **`创建一个IntersectionObserver对象`**：
    

```
let observer = new IntersectionObserver(callback, options);


```

*   `callback` 是一个回调函数，当目标元素与根元素（或视口）交叉状态发生变化时被调用。
    
*   `options` 是一个配置对象，用于设置观察选项。
    

2.  **`定义一个回调函数，用于处理元素与视窗的交叉状态变化`**：
    

```
let callback = (entries, observer) => {
  entries.forEach(entry => {
    // 处理交叉状态变化
    if (entry.isIntersecting) {
      // 元素进入视窗
    } else {
      // 元素离开视窗
    }
  });
};


```

*   `entries` 是一个包含所有被观察目标元素的 `IntersectionObserverEntry` 对象数组。
    
*   `observer` 是调用回调函数的 `IntersectionObserver` 实例。
    

3.  **`指定要观察的目标元素，并开始观察`**：
    

```
let targetElement = document.querySelector('.target-element');
observer.observe(targetElement);


```

*   `targetElement` 是要观察的目标元素。可以通过选择器、getElementById 等方法获取。
    

4.  **`可选：配置IntersectionObserver的行为，包括根元素、根元素的边界和交叉比例的阈值等属性`**：
    

```
let options = {
  root: null, // 观察元素的根元素，null表示视窗
  rootMargin: '0px', // 根元素的边界
  threshold: 0.5 // 交叉比例的阈值，0.5表示元素一半进入视窗时触发回调
};


```

5.  **`在回调函数中处理元素的交叉状态变化，根据需要执行相应的操作`**。
    
6.  **`停止观察元素（可选）`** ：
    

```
observer.unobserve(targetElement);


```

7.  **`停止观察所有元素并清除所有观察者（可选）`** ：
    

```
observer.disconnect();


```

通过以上步骤，您可以使用 IntersectionObserver API 来监测元素与视窗的交叉状态，并根据需要执行相应的操作，实现一些常见的交互效果和性能优化。

```
// 开始观察
io.observe(document.getElementById('example'));

// 停止观察
io.unobserve(element);

// 关闭观察器
io.disconnect();


```

### `IntersectionObserver` 构造函数 实例返回方法

当你使用 `IntersectionObserver` 构造函数创建一个观察器实例后，这个实例会携带四个主要方法来管理和操作观察的行为。这些方法包括：

1.  `observe(targetElement)`
    

*   用于开始观察指定的目标元素。一旦目标元素进入或离开视口，观察器就会触发回调函数。
    

3.  `unobserve(targetElement)`
    

*   用于停止观察指定的目标元素。当你不再需要观察某个元素时，可以使用该方法来取消观察。
    

5.  `disconnect()`
    

*   用于停止观察所有目标元素，并将观察器从所有目标元素中移除。当你不再需要观察任何元素时，可以使用该方法来完全关闭观察器。
    

7.  `takeRecords()`
    

*   用于获取当前观察器实例尚未处理的所有交叉记录（Intersection Records）。该方法返回一个数组，包含所有未处理的交叉记录对象。每个交叉记录对象表示一个目标元素与根元素（或根元素的可视窗口）的交叉信息。
    

这些方法可以帮助你控制 `IntersectionObserver` 实例的行为，以及对特定元素进行观察和取消观察。

```
// 开始观察
io.observe(document.getElementById('example'));

// 停止观察
io.unobserve(element);

// 关闭观察器
io.disconnect();

// 返回所有观察目标的 IntersectionObserverEntry 对象数组
io.takeRecords();


```

### entries 介绍

`entries` 是传递给 `IntersectionObserver` 回调函数的一个参数，它是一个包含 `IntersectionObserverEntry` 对象的数组。每个 `IntersectionObserverEntry` 对象表示一个被观察目标元素的最新交叉状态（即目标元素与根元素或视口的交集）。

**`IntersectionObserverEntry 对象`**

每个 `IntersectionObserverEntry` 对象包含了以下重要信息：

1.  **`time`**
    

*   一个时间戳，表示交叉状态变化的时间戳，精确到毫秒，通常用于性能测量。
    

3.  **`target`**
    

*   被观察的目标元素，即观察器正在观察的具体 DOM 元素。
    

5.  **`rootBounds`**
    

*   一个 `DOMRectReadOnly` 对象，表示根元素的边界框。如果根元素是视口，则表示视口的边界框。
    

7.  **`boundingClientRect`**
    

*   一个 `DOMRectReadOnly` 对象，表示目标元素的边界框，即元素在视口中的位置和尺寸。
    

9.  **`intersectionRect`**
    

*   一个 `DOMRectReadOnly` 对象， 表示目标元素与视口（或指定的根元素）交叉部分的矩形区域的信息。如果没有交叉，它的值为 `{top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0}`。
    

11.  **`intersectionRatio`**
    

*   一个数值，表示目标元素可见部分占自身的比例，取值范围在 `0.0` 到 `1.0` 之间。当元素完全不可见时，值为 `0.0`；当元素完全可见时，值为 `1.0`。
    

13.  **`isIntersecting`**
    

*   一个布尔值，表示目标元素当前是否与视口（或指定的根元素）交叉。如果元素至少部分可见，则为 `true`；否则为 `false`。
    

以下是一个简单的示例，演示了如何在 IntersectionObserver 的回调函数中处理 `entries` 数组：

```
// 创建 IntersectionObserver 实例
let observer = new IntersectionObserver(callback, options);

// 观察目标元素
let target = document.querySelector('.lazy-load');
observer.observe(target);

// 回调函数
function callback(entries, observer) {
  entries.forEach(entry => {
    // 输出目标元素的交叉状态信息
    console.log('Target:', entry.target);
    console.log('Time:', entry.time);
    console.log('Bounding Client Rect:', entry.boundingClientRect);
    console.log('Intersection Rect:', entry.intersectionRect);
    console.log('Intersection Ratio:', entry.intersectionRatio);
    console.log('Is Intersecting:', entry.isIntersecting);

    // 根据交叉状态执行相应操作
    if (entry.isIntersecting) {
      // 如果元素进入视口，加载内容或执行其他操作
      loadContent(entry.target);
      observer.unobserve(entry.target); // 停止观察已加载的元素
    }
  });
}

function loadContent(element) {
  // 加载内容的具体实现
}


```

**`注意事项`**

*   **多目标处理**: `IntersectionObserverEntry` 对象在数组中返回，因此你可以同时处理多个目标元素的交叉状态变化。
    
*   **性能优化**: 使用 `intersectionRatio` 属性可以帮助优化性能，因为你可以根据元素的可见性决定何时加载或操作内容，而无需频繁地检查元素位置或滚动事件。
    
*   **观察器管理**: 在回调函数中，你可以通过 `observer.unobserve(entry.target)` 来停止观察已经处理过的元素，避免不必要的性能损耗。
    

应用
--

`IntersectionObserver` 特别适用于懒加载图像、无限滚动内容、以及其他需要根据元素可见性触发的操作。

### 图片懒加载

当页面上有大量图片或其他资源需要加载时，可以使用 IntersectionObserver 来延迟加载这些资源。只有当图片进入视窗时才加载图片，可以提高页面加载性能和用户体验。

下面是一个实现图片懒加载功能的 React 组件 `LazyLoadImage`。

```
import { useEffect, useRef, useState } from 'react';

const LazyLoadImage = ({ src, alt, className }) => {
    const imgRef = useRef();
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = src;
                        img.onload = () => setIsLoaded(true);
                        observer.unobserve(img);
                    }
                });
            },
            { threshold: 0.1 }
        );

        const imgElement = imgRef.current;
        if (imgElement) {
            observer.observe(imgElement);
        }

        return () => {
            if (imgElement) {
                observer.unobserve(imgElement);
            }
        };
    }, [src]);

    return (
        <img
            ref={imgRef}
            alt={alt}
            className={className}
            style={{
                opacity: isLoaded ? 1 : 0.5,
                transition: 'opacity 0.5s ease-in-out',
            }}
        />
    );
};

export default LazyLoadImage;


```

该组件使用 `useEffect` 和 `IntersectionObserver` 来检测图片是否进入视口，并在图片进入视口时加载图片资源。图片的透明度从 0.5 渐变为 1，实现渐显效果。

### 无限滚动加载数据

当用户滚动到页面底部时，自动加载更多数据，以实现无限滚动效果。

```
import { useEffect, useState, useRef } from 'react'

interface NewsItem {
  id: number
  title: string
  content: string
}

const fetchNews = async (lastId: number): Promise<NewsItem[]> => {
  // 模拟从API获取新闻数据
  return new Promise((resolve) => {
    setTimeout(() => {
      const newsItems: NewsItem[] = []
      // 设置总共169条数据，后面展示暂无数据
      const ten = lastId > 150 ? 9 : 10
      for (let i = lastId + 1; i <= lastId + ten; i++) {
        newsItems.push({ id: i, title: `News ${i}`, content: `Content of News ${i}` })
      }
      resolve(newsItems)
    }, 1000)
  })
}

const InfiniteNewsList: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [noMoreData, setNoMoreData] = useState<boolean>(false)
  const loaderRef = useRef<any>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && !noMoreData) {
          const lastNews = news[news.length - 1]
          if (lastNews || news.length === 0) {
            setIsLoading(true)
            fetchNews(lastNews?.id || 0).then((newNews) => {
              if (newNews.length < 10) {
                setNoMoreData(true) // 如果返回的新闻少于10条，则没有更多数据
              }
              setNews([...news, ...newNews])
              setIsLoading(false)
            })
          }
        }
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 1.0
      }
    )

    if (loaderRef.current) {
      observer.observe(loaderRef.current)
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current)
      }
    }
  }, [isLoading, news, noMoreData])

  return (
    <div>
      {!news.length && <div>暂无数据</div>}
      {news.map((item) => (
        <div
          key={item.id}
          style={{ width: '20%', backgroundColor: '#999', padding: '10px', marginBottom: '10px', color: '#fff' }}
        >
          <h2>{item.title}</h2>
          <p>{item.content}</p>
        </div>
      ))}
      {!noMoreData && <div ref={loaderRef} style={{ height: '10px' }}></div>}
      {isLoading && <div style={{ color: 'pink' }}>Loading more news...</div>}
      {noMoreData && <div style={{ color: 'green' }}>没有更多数据了</div>}
    </div>
  )
}

export default InfiniteNewsList


```

兼容性
---

![](https://mmbiz.qpic.cn/sz_mmbiz_png/IlE1Y2rl1uabRKwjye6UXvfJh4euMg0aU4wicicfzKfHzg3T1sIMvSknNTffVkqkhVo8bo5fuVL3vcw2HWUV1sVA/640?wx_fmt=png&from=appmsg)

  

`IntersectionObserver` API 的浏览器兼容性总体上相当不错，但仍需要注意某些旧版浏览器和特定浏览器中的支持情况。以下是截至 2024 年的主要浏览器的兼容性概况：

**支持 `IntersectionObserver` 的浏览器**

*   **Google Chrome**: 58+
    
*   **Mozilla Firefox**: 55+
    
*   **Microsoft Edge**: 15+
    
*   **Safari**: 12+
    
*   **Opera**: 45+
    
*   **Samsung Internet**: 6.0+
    

**不支持 `IntersectionObserver` 的浏览器**

*   **Internet Explorer**: 所有版本都不支持。
    

对于不支持 `IntersectionObserver` 的浏览器（如 Internet Explorer），可以使用 Polyfill 来提供支持。以下是如何使用 Polyfill 的示例：

1.  **安装 Polyfill**：
    
    你可以通过 npm 安装 `intersection-observer` Polyfill：
    

```
npm install intersection-observer


```

2.  **在你的项目中引入 Polyfill**：
    
    在你的 JavaScript 入口文件（如 `index.js`）中引入：
    

```
import 'intersection-observer';


```

或者你可以直接在 HTML 文件中通过 CDN 引入：

```
 <script src="https://polyfill.io/v3/polyfill.min.js?features=IntersectionObserver"></script>


```

以下是一个完整的示例代码，包括如何使用 `IntersectionObserver` 和在不支持的浏览器中加载 Polyfill：

```
// 定义回调函数来处理交叉状态变化
const callback = (entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      console.log('元素进入视图:', entry.target);
      // 在这里执行相关操作（例如，加载图片）
      entry.target.src = entry.target.dataset.src;
      // 元素进入视图后停止观察
      observer.unobserve(entry.target);
    }
  });
};

// 设置观察器选项
const options = {
  root: null, // 使用视口作为根
  rootMargin: '0px', // 根的周围外边距
  threshold: 0.1 // 当目标元素的10%可见时触发回调
};

const observer = new IntersectionObserver(callback, options);

// 获取目标元素并开始观察
const targets = document.querySelectorAll('img.lazy-load');
targets.forEach(target => observer.observe(target));


```

作者：Aplee 原文地址：https://juejin.cn/post/7389077092137517108  

-----------------------------------------------------------

参考文献
----

IntersectionObserver API 使用教程 [2]

IntersectionObserver：实现滚动动画、懒加载、虚拟列表...[3]

IntersectionObserver 使用 ， 懒加载实现 ， 虚拟列表探索 [4]

  

```
Node 社群




我组建了一个氛围特别好的 Node.js 社群，里面有很多 Node.js小伙伴，如果你对Node.js学习感兴趣的话（后续有计划也可以），我们可以一起进行Node.js相关的交流、学习、共建。下方加 考拉 好友回复「Node」即可。

   “分享、点赞、在看” 支持一波👍

```