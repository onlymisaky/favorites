> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/8XJiwILdCy6IgkMHayRPSg)

```
点击上方 程序员成长指北，关注公众号

回复1，加入高级Node交流群

```

hello 大家好，我是考拉🐨。

【如何排查页面白屏】，算是前端面试中一个很经典的题目了，除了基础的前端代码的排查，还涉及到大量的计算机网络、DNS 解析、CDN 等方面的知识，对前端 er 综合能力要求比较高。今天带来一篇文章，系统性的讲了作者关于页面白屏问题的梳理，感兴趣的同学可以了解下。

下面是正文部分。

❝

前段时间面试字节，面试官对我的埋点项目比较感兴趣，聊着聊着突然来了一个问题（原话）：**既然说到了这样一个叫做监控，其实有一个比较经典的 case 也想探讨一下，就是比如说你有在开发过程中，假如你的页面被反馈说白屏了，对吧？正常情况下你要去排查问题、解决问题，那我想让你就是简单的描述一下你会去怎么去做，就是把你要准备处理的过程也描述一下。**

我的**回答**：有提到检查 `DOM 挂载` / `网络请求状态` / `JS 执行错误`，但未覆盖`资源加载失败`、`CDN 异常` 等场景。虽然有简单了解过页面白屏相关的内容，不过还没在实习工作中遇到过这类问题，还是缺少了些系统性排查的思维，这篇文章就来总结学习一下。（先了解页面白屏原因 -> 梳理一下排查思路 -> 学习下如何在 SDK 中实现白屏检测）

一、先来总览一下，什么是页面白屏？
-----------------

*   前端白屏是指用户打开网页时，页面未能正常加载或渲染，导致浏览器显示一片空白。
    
*   一般情况下 是由 JS 执行错误 / 资源加载失败 / 网络问题 / 渲染逻辑错误 引起的。
    
*   在单页面应用中（SPA），前端白屏问题会变得更加复杂，可能导致用户无法看到任何有效内容。
    
*   而解决白屏问题的关键是：快速定位并修复错误，确保资源正确加载和渲染。
    

❝

白屏问题本质上是浏览器渲染流水线的断裂，从 DNS 解析 -> 资源加载 -> JS 执行 -> DOM 构建 -> 渲染树生成 -> 页面绘制的完整链路中，任一环节的异常都可能导致最终呈现的空白。

二、再来系统性梳理一下排查思路
---------------

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/U0WXqkJLdLQDmfFtaycq6fl3icZollxO5C1wEWQ7wscnkkthgpoemyo4MfAbh6NhMsn5jqe44xWhS4RPYsyWldA/640?wx_fmt=other&from=appmsg&watermark=1#imgIndex=0)

图为原创, 若需转载 可以备注出处✨

❝

看完这么复杂的排查流程, 来思考下一个页面白屏 真的值得如此认真对待吗? (问问那些大厂 c 端的大佬们就知道了)

用户体量越大, 页面白屏时间能带来的负面影响就越能呈现指数级增长, 比如说:

*   **业务层面**
    
    ：电商场景下每增加 1 秒白屏时间转化率下降 7%
    
*   **技术层面**
    
    ：可能引发雪崩效应（如 CDN 故障导致全站不可用）
    
*   **体验层面**
    
    ：用户留存率下降 40%+
    

### 1. 第一阶段：快速定位问题层级

#### 浏览器控制台四步诊断法

```
// Step 1 - 检测文档加载阶段
console.log('DOMContentLoaded:', performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart);
console.log('Load Event:', performance.timing.loadEventEnd - performance.timing.navigationStart);

// Step 2 - 检查关键错误
window.addEventListener('error', e => {
console.error('Global Error:', e.message, e.filename, e.lineno);
}, true);

// Step 3 - 验证 DOM 挂载点（React/Vue 重点）
const rootNode = document.getElementById('root');
if (!rootNode || rootNode.childNodes.length === 0) {
console.error('挂载节点异常:', rootNode);
}

// Step 4 - 网络状态检测
fetch('/health-check').catch(e => {
console.error('网络连通性异常:', e);
});

// Step 1 - 检测文档加载阶段
console.log('DOMContentLoaded:', performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart);
console.log('Load Event:', performance.timing.loadEventEnd - performance.timing.navigationStart);

// Step 2 - 检查关键错误
window.addEventListener('error', e => {
console.error('Global Error:', e.message, e.filename, e.lineno);
}, true);

// Step 3 - 验证 DOM 挂载点（React/Vue 重点）
const rootNode = document.getElementById('root');
if (!rootNode || rootNode.childNodes.length === 0) {
console.error('挂载节点异常:', rootNode);
}

// Step 4 - 网络状态检测
fetch('/health-check').catch(e => {
console.error('网络连通性异常:', e);
});


```

**典型问题场景**：

*   Vue/React 未捕获的初始化错误导致 root 节点为空
    
*   浏览器插件注入的脚本引发全局错误
    

### 2. 第二阶段：网络层深度检测

#### （1）关键资源瀑布流分析

使用 Chrome DevTools 的 **Network 面板**：

1.  过滤 `JS|CSS|IMG` 类型资源
    
2.  检查关键资源的：
    

*   **HTTP 状态码**
    
    （重点 404/403/500）
    
*   **Timing 明细**
    
    （TTFB 是否异常）
    

4.  右键资源 → `Copy as cURL` 验证 CDN 可用性
    

#### （2）CDN 故障专项排查

```
# 多节点探测（需安装 httpie）
http https://cdn.example.com/main.js --verify=no \
  --headers \ 
  --proxy=http:http://1.1.1.1:8080 \  # 切换不同代理节点
  --download > /dev/null

# DNS 污染检测
nslookup cdn.example.com 8.8.8.8   # 对比不同 DNS 结果
nslookup cdn.example.com 114.114.114.114

# 多节点探测（需安装 httpie）
http https://cdn.example.com/main.js --verify=no \
  --headers \ 
  --proxy=http:http://1.1.1.1:8080 \  # 切换不同代理节点
  --download > /dev/null

# DNS 污染检测
nslookup cdn.example.com 8.8.8.8   # 对比不同 DNS 结果
nslookup cdn.example.com 114.114.114.114


```

**经典案例**：  
某站点因 CDN 节点未同步最新证书，导致部分用户浏览器拦截 HTTPS 请求引发白屏

#### （3）资源完整性校验（SRI 实战）

```
<!-- 带 SRI 校验的资源加载 -->
<scriptsrc="https://cdn.example.com/react.production.min.js"
integrity="sha384-xxxx"
crossorigin="anonymous"></script>

<!-- 带 SRI 校验的资源加载 -->
<scriptsrc="https://cdn.example.com/react.production.min.js"
integrity="sha384-xxxx"
crossorigin="anonymous"></script>


```

**排查要点**：

*   控制台出现 `Integrity checksum failed` 错误
    
*   比对服务器资源 hash 值：
    

```
openssl dgst -sha384 -binary react.production.min.js | openssl base64 -A

openssl dgst -sha384 -binary react.production.min.js | openssl base64 -A


```

### 3. 第三阶段：渲染层故障定位

#### （1）SPA 框架特有陷阱

**Vue 场景**：

```
newVue({
render: h =>h(App)
}).$mount('#app')  // 若 #app 节点不存在，静默失败！

newVue({
render: h =>h(App)
}).$mount('#app')  // 若 #app 节点不存在，静默失败！


```

**解决方案**：

```
const root = document.getElementById('app');
if (!root) {
document.write('容器丢失，降级显示基础内容'); 
} else {
newVue({ render: h =>h(App) }).$mount(root);
}

const root = document.getElementById('app');
if (!root) {
document.write('容器丢失，降级显示基础内容'); 
} else {
newVue({ render: h =>h(App) }).$mount(root);
}


```

**React 场景**：

```
// 错误边界组件（捕获渲染层错误）
classErrorBoundaryextendsReact.Component {
componentDidCatch(error) {
Sentry.captureException(error);
window.location.reload();  // 降级策略
  }
render() { returnthis.props.children; }
}

// 使用方式
<ErrorBoundary>
<App />
</ErrorBoundary>

// 错误边界组件（捕获渲染层错误）
classErrorBoundaryextendsReact.Component {
componentDidCatch(error) {
Sentry.captureException(error);
window.location.reload();  // 降级策略
  }
render() { returnthis.props.children; }
}

// 使用方式
<ErrorBoundary>
<App />
</ErrorBoundary>


```

#### （2）CSS 渲染阻塞

**检测方法**：

1.  浏览器地址栏输入 `about:blank` 清空页面
    
2.  逐步加载 CSS 文件，观察布局变化
    
3.  检查 `z-index` 异常导致元素不可见
    

**典型案例**：  
某页面因 `body { display: none !important; }` 内联样式导致白屏

### 4. 第四阶段：性能维度深度分析

#### （1）主线程阻塞检测

**Long Tasks API**：

```
const observer = newPerformanceObserver(list => {
  list.getEntries().forEach(entry => {
if (entry.duration > 50) {
console.warn('主线程阻塞:', entry);
    }
  });
});
observer.observe({ entryTypes: ['longtask'] });

const observer = newPerformanceObserver(list => {
  list.getEntries().forEach(entry => {
if (entry.duration > 50) {
console.warn('主线程阻塞:', entry);
    }
  });
});
observer.observe({ entryTypes: ['longtask'] });


```

#### （2）内存泄漏追踪

**Chrome Memory 面板操作**：

1.  生成堆快照（Heap Snapshot）
    
2.  筛选 `Detached DOM tree` 检查未释放节点
    
3.  对比多次快照，查找持续增长的对象
    

**典型案例**：  
未销毁的 WebSocket 监听器持续累积导致内存溢出

#### （3）关键指标阈值

<table><thead><tr><th><section>指标</section></th><th><section>警告阈值</section></th><th><section>严重阈值</section></th><th><section>测量工具</section></th></tr></thead><tbody><tr><td><section>FCP</section></td><td><section>&gt;2s</section></td><td><section>&gt;4s</section></td><td><section>Lighthouse</section></td></tr><tr><td><section>JS 总执行时间</section></td><td><section>&gt;3s</section></td><td><section>&gt;5s</section></td><td><section>Chrome Performance 面板</section></td></tr><tr><td><section>未压缩资源占比</section></td><td><section>&gt;30%</section></td><td><section>&gt;50%</section></td><td><section>Webpack Bundle Analyzer</section></td></tr></tbody></table>

### 5. 第五阶段：环境特异性问题

#### （1）浏览器兼容性

```
// 使用 Feature Detection 代替 UA 检测
if (!('IntersectionObserver'inwindow)) {
loadPolyfill('intersection-observer').then(initApp);
}

// 使用 Feature Detection 代替 UA 检测
if (!('IntersectionObserver'inwindow)) {
loadPolyfill('intersection-observer').then(initApp);
}


```

#### （2）运营商劫持检测

```
// 检查页面是否被注入第三方脚本
const thirdPartyScripts = Array.from(document.scripts).filter(
s => !s.src.includes(window.location.hostname)
);
if (thirdPartyScripts.length > 0) {
reportException('运营商劫持', thirdPartyScripts);
}

// 检查页面是否被注入第三方脚本
const thirdPartyScripts = Array.from(document.scripts).filter(
s => !s.src.includes(window.location.hostname)
);
if (thirdPartyScripts.length > 0) {
reportException('运营商劫持', thirdPartyScripts);
}


```

#### （3）本地环境干扰

*   禁用所有浏览器插件（尤其是广告拦截器）
    
*   清除 `Service Worker` 缓存：
    

```
navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => reg.unregister())
})

navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => reg.unregister())
})


```

#### （4）兜底策略

*   用户操作视频录制（接入 rrweb 等工具, 大公司监控体系下一般都有用到, 没有用上的建议也可以加上）
    
*   特定设备远程调试（使用 Chrome Remote Debugging）
    

三、白屏检测 SDK  要怎么写?
-----------------

❝

这里就给大家放部分最近写的代码, 主要用的是`动态检测根节点`+`黄金比例采样算法`+`采样点检测`三种方法来检测白屏情况, 感兴趣的也可以去我的代码仓库看下完整的代码 - ByteTop - 轻量级 Web 端埋点监控平台

### 核心代码

#### 1. 智能根节点检测

```
const rootSelectors = ["#root", "#app", "#main", "#container"];
const rootNode = rootSelectors.find(selector =>
document.querySelector(selector)
) || "body";
const wrapperSet = newSet(["html", "body", rootNode.toLowerCase()]);

const rootSelectors = ["#root", "#app", "#main", "#container"];
const rootNode = rootSelectors.find(selector =>
document.querySelector(selector)
) || "body";
const wrapperSet = newSet(["html", "body", rootNode.toLowerCase()]);


```

*   **策略**
    
    ：优先级遍历常见框架挂载点选择器（[#root](javascript:;) → [#app](javascript:;) → [#main](javascript:;) → ...）
    
*   **降级**
    
    ：未匹配时自动降级到 body 元素
    
*   **优化**
    
    ：使用 Set 数据结构实现 O(1) 复杂度查询
    

#### 2. 黄金比例采样算法

```
const goldenRatio = 0.618;
const points = Array.from({ length: config.sampleCount }, (_, i) => ({
x: i % 2 === 0
    ? window.innerWidth * goldenRatio * Math.random()
    : window.innerWidth - window.innerWidth * goldenRatio * Math.random(),
y: window.innerHeight * goldenRatio * Math.random()
}));

const goldenRatio = 0.618;
const points = Array.from({ length: config.sampleCount }, (_, i) => ({
x: i % 2 === 0
    ? window.innerWidth * goldenRatio * Math.random()
    : window.innerWidth - window.innerWidth * goldenRatio * Math.random(),
y: window.innerHeight * goldenRatio * Math.random()
}));


```

*   **视觉聚焦**
    
    ：61.8% 区域密集采样，符合人类视觉焦点分布规律
    
*   **抗对称干扰**
    
    ：通过奇偶索引实现左右镜像分布，破解居中布局误判
    
*   **随机扰动**
    
    ：在黄金比例区域内引入随机坐标，避免固定路径采样
    

#### 3. 复合特征检测

```
const identifiers = [
  element.tagName.toLowerCase(),          // 标签特征
  element.id ? `#${element.id}` : "",    // ID 特征
  ...Array.from(element.classList).map(c =>`.${c}`) // 类名特征
];

if (identifiers.some(id => wrapperSet.has(id))) {
  emptyCount++;
}

const identifiers = [
  element.tagName.toLowerCase(),          // 标签特征
  element.id ? `#${element.id}` : "",    // ID 特征
  ...Array.from(element.classList).map(c =>`.${c}`) // 类名特征
];

if (identifiers.some(id => wrapperSet.has(id))) {
  emptyCount++;
}


```

*   **三级特征提取**
    
    ：标签名、ID、类名全方位标识元素
    
*   **动态类名支持**
    
    ：兼容 CSS Modules 等哈希类名场景
    
*   **高效匹配**
    
    ：Set 数据结构实现快速特征比对
    

#### 4. 动态阈值策略

```
return emptyCount / config.sampleCount >= config.threshold;

return emptyCount / config.sampleCount >= config.threshold;


```

*   **比例控制**
    
    ：通过阈值参数控制误报率与漏报率的平衡
    
*   **场景适配**
    
    ：移动端推荐 0.7-0.8，PC 端推荐 0.8-0.9
    
*   **动态感知**
    
    ：根据设备类型自动调节阈值（需扩展实现）
    

### 完整代码

```
interfaceCheckWhiteScreenOptions {
  /** 采样点数量 (默认: 20) */
  sampleCount?: number;
  /** 空白点判定阈值 (0-1, 默认 0.8) */
  threshold?: number;
  /** 排除的骨架屏类名 (默认: 'skeleton') */
  skeletonClass?: string;
}
const checkWhiteScreen = (options?: CheckWhiteScreenOptions): boolean => {
  const config = {
    sampleCount: 20,
    threshold: 0.8,
    skeletonClass: "skeleton",
    ...options,
  };
  try {
    // 1. 排除骨架屏场景
    if (document.getElementsByClassName(config.skeletonClass).length > 0) {
      returnfalse;
    }  

    // 2. 动态检测根节点
    const rootSelectors = ["#root", "#app", "#main", "#container"];
    const rootNode =
      rootSelectors.find((selector) =>document.querySelector(selector)) ||
      "body";
    const wrapperSet = newSet(["html", "body", rootNode.toLowerCase()]);

    // 3. 黄金比例采样算法
    const goldenRatio = 0.618;
    const points = Array.from({ length: config.sampleCount }, (_, i) => ({
      x:
        i % 2 === 0
          ? window.innerWidth * goldenRatio * Math.random()
          : window.innerWidth - window.innerWidth * goldenRatio * Math.random(),
      y: window.innerHeight * goldenRatio * Math.random(),
    }));  

    // 4. 采样点检测
    let emptyCount = 0;
    points.forEach((point) => {
      const element = document.elementFromPoint(point.x, point.y);
      if (!element) {
        emptyCount++;
        return;
      }
      const identifiers = [
        element.tagName.toLowerCase(),
        element.id ? `#${element.id}` : "",
        ...Array.from(element.classList).map((c) =>`.${c}`),
      ];
      if (identifiers.some((id) => wrapperSet.has(id))) {
        emptyCount++;
      }
    });
    console.log("emptyCount", emptyCount, " config:", config);

    // 5. 阈值判断
    return emptyCount / config.sampleCount >= config.threshold;
  } catch (e) {
    console.error("[白屏检测异常]", e);
    returnfalse;
  }
};

exportdefault checkWhiteScreen;
// // 自定义配置
// const isWhite = checkWhiteScreen({
//   sampleCount: 30,
//   threshold: 0.75,
//   skeletonClass: 'loading-skeleton'
// });

// // 移动端适配配置

// checkWhiteScreen({
//   sampleCount: 15,  // 减少采样点
//   threshold: 0.7    // 降低阈值
// });

// // 后台管理系统
// checkWhiteScreen({
//   skeletonClass: 'ant-skeleton' // 匹配UI框架
// });

// // 高精度检测
// checkWhiteScreen({
//   sampleCount: 50,  // 增加采样密度
//   threshold: 0.9    // 严格判定
// });

interfaceCheckWhiteScreenOptions {
  /** 采样点数量 (默认: 20) */
  sampleCount?: number;
  /** 空白点判定阈值 (0-1, 默认 0.8) */
  threshold?: number;
  /** 排除的骨架屏类名 (默认: 'skeleton') */
  skeletonClass?: string;
}
const checkWhiteScreen = (options?: CheckWhiteScreenOptions): boolean => {
  const config = {
    sampleCount: 20,
    threshold: 0.8,
    skeletonClass: "skeleton",
    ...options,
  };
  try {
    // 1. 排除骨架屏场景
    if (document.getElementsByClassName(config.skeletonClass).length > 0) {
      returnfalse;
    }  

    // 2. 动态检测根节点
    const rootSelectors = ["#root", "#app", "#main", "#container"];
    const rootNode =
      rootSelectors.find((selector) =>document.querySelector(selector)) ||
      "body";
    const wrapperSet = newSet(["html", "body", rootNode.toLowerCase()]);

    // 3. 黄金比例采样算法
    const goldenRatio = 0.618;
    const points = Array.from({ length: config.sampleCount }, (_, i) => ({
      x:
        i % 2 === 0
          ? window.innerWidth * goldenRatio * Math.random()
          : window.innerWidth - window.innerWidth * goldenRatio * Math.random(),
      y: window.innerHeight * goldenRatio * Math.random(),
    }));  

    // 4. 采样点检测
    let emptyCount = 0;
    points.forEach((point) => {
      const element = document.elementFromPoint(point.x, point.y);
      if (!element) {
        emptyCount++;
        return;
      }
      const identifiers = [
        element.tagName.toLowerCase(),
        element.id ? `#${element.id}` : "",
        ...Array.from(element.classList).map((c) =>`.${c}`),
      ];
      if (identifiers.some((id) => wrapperSet.has(id))) {
        emptyCount++;
      }
    });
    console.log("emptyCount", emptyCount, " config:", config);

    // 5. 阈值判断
    return emptyCount / config.sampleCount >= config.threshold;
  } catch (e) {
    console.error("[白屏检测异常]", e);
    returnfalse;
  }
};

exportdefault checkWhiteScreen;
// // 自定义配置
// const isWhite = checkWhiteScreen({
//   sampleCount: 30,
//   threshold: 0.75,
//   skeletonClass: 'loading-skeleton'
// });

// // 移动端适配配置

// checkWhiteScreen({
//   sampleCount: 15,  // 减少采样点
//   threshold: 0.7    // 降低阈值
// });

// // 后台管理系统
// checkWhiteScreen({
//   skeletonClass: 'ant-skeleton' // 匹配UI框架
// });

// // 高精度检测
// checkWhiteScreen({
//   sampleCount: 50,  // 增加采样密度
//   threshold: 0.9    // 严格判定
// });


```

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/U0WXqkJLdLQDmfFtaycq6fl3icZollxO55BmTAjiaWYBYiakpUgrefkDBjsmINjshgbicHrIn52rg0AU0Oia25TClQQ/640?wx_fmt=other&from=appmsg&watermark=1#imgIndex=1)

> 原文链接：
> 
> https://juejin.cn/post/7494167764916256803

Node 社群

```
我组建了一个氛围特别好的 Node.js 社群，里面有很多 Node.js小伙伴，如果你对Node.js学习感兴趣的话（后续有计划也可以），我们可以一起进行Node.js相关的交流、学习、共建。下方加 考拉 好友回复「Node」即可。

   “分享、点赞、在看” 支持一波👍

```