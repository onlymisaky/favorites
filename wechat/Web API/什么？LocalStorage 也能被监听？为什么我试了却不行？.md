> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/OMn7VgHNxcfITPgyxDkpag)

> ❝
> 
> 引言：最近，团队的伙伴需要实现监听 localStorage 数据变化，但开发中却发现无法直接监听。
> 
> ❞

在团队的一个繁重项目中，我们发现一个新功能的实现成本很大，因此开始思考：**「能否通过实时监听 LocalStorage 的变化并自动触发相关操作」**。我们尝试使用 `addEventListener` 来监听 `localStorage` 的变化，但令人意外的是，这种方法仅在**「不同浏览器标签页之间」**有效，而在**「同一标签页内」**却无法实现监听。这是怎么回事？

经过调研了解到，浏览器确实提供了 `storage` 事件机制，但它仅适用于同源的不同标签页之间。对于**「同一标签页内的 LocalStorage 变化」**，却没有直接的方法来实现实时监听。最初，我们考虑使用 `setInterval` 进行定时轮询来获取变化，但这种方式要么导致性能开销过大，要么无法第一时间捕捉到变化。

今天，我们探讨下几种**「高效且实用」**的解决方案，是否可以帮助轻松应对`LocalStorage`这种监听需求？希望对你有所帮助，有所借鉴！

### 传统方案的痛点🎯🎯

先来看看浏览器是如何帮助我们处理**「不同页签」**的 LocalStorage 变化：

```
window.addEventListener("storage", (event) => {        if (event.key === "myKey") {    // 执行相应操作  }});
```

通过监听 `storage` 事件，当在其他页签修改 LocalStorage 时，你可以在当前页签捕获到这个变化。但问题是：**「这种方法只适用于跨页签的 LocalStorage 修改，在同一页签下无法触发该事件」**。于是，很多开发者开始寻求替代方案，比如：

#### 1、**「轮询（Polling）」**

轮询是一种最直观的方式，它定期检查 `localStorage` 的值是否发生变化。然而，这种方法性能较差，尤其在高频轮询时会对浏览器性能产生较大的影响，因此不适合作为长期方案。

```
let lastValue = localStorage.getItem('myKey');setInterval(() => {  const newValue = localStorage.getItem('myKey');  if (newValue !== lastValue) {    lastValue = newValue;    console.log('Detected localStorage change:', newValue);  }}, 1000); // 每秒检查一次
```

这种方式实现简单，不依赖复杂机制。但是性能较差，频繁轮询会影响浏览器性能。

#### 2、**「监听代理（Proxy）或发布 - 订阅模式」**

这种方式通过创建一个代理来拦截 `localStorage.setItem` 的调用。每次数据变更时，我们手动发布一个事件，通知其他监听者。

```
(function() {  const originalSetItem = localStorage.setItem;  const subscribers = [];  localStorage.setItem = function(key, value) {    originalSetItem.apply(this, arguments);    subscribers.forEach(callback => callback(key, value));  };  function subscribe(callback) {    subscribers.push(callback);  }  subscribe((key, value) => {    if (key === 'myKey') {      console.log('Detected localStorage change:', value);    }  });  localStorage.setItem('myKey', 'newValue');})();
```

这种比较灵活，可以用于复杂场景。但是需要手动拦截 `setItem`，维护成本高（但也是值得推荐的）。

![](https://mmbiz.qpic.cn/mmbiz_jpg/lCQLg02gtibvpicVH87sEzRhiaXBOx2VnDBhgNuEZFvfxmNpKjBnicAavd6ric5QiaIykUyXXiaiamZNekdDdWibRlrP64g/640?wx_fmt=other&from=appmsg)

然而，这些方案往往存在性能问题或者开发的复杂度，在高频数据更新的情况下，有一定的性能问题，而且存在一定的风险性。那么有没有可以简单快速，风险性还小的方案呢？

### 高效的解决方案 🚀🚀

既然浏览器不支持同一页签的 `storage` 事件，我们可以**「手动触发事件」**，以此来实现同一页签下的 LocalStorage 变化监听。

#### 1、自定义 Storage 事件

通过手动触发 `StorageEvent`，你可以在 LocalStorage 更新时同步分发事件，从而实现同一页签下的监听。

```
localStorage.setItem('myKey', 'value');// 手动创建并分发 StorageEventconst storageEvent = new StorageEvent('storage', {  key: 'myKey',  url: window.location.href});window.dispatchEvent(storageEvent);
```

你可以使用相同的监听逻辑来处理数据变化，无论是同一页签还是不同页签：

```
window.addEventListener("storage", (event) => {  if (event.key === "myKey") {    // 处理 LocalStorage 更新  }});
```

这种实现简单、轻量、快捷。但是需要手动触发事件。

#### 2、基于 `CustomEvent` 的自定义事件

与 `StorageEvent` 类似，你可以使用 `CustomEvent` 手动创建并分发事件，实现 `localStorage` 的同步监听。

```
localStorage.setItem('myKey', 'newValue');const customEvent = new CustomEvent('localStorageChange', {  detail: { key: 'myKey', value: 'newValue' }});window.dispatchEvent(customEvent);
```

这种方式适合更加灵活的事件触发场景。`CustomEvent`不局限于 `localStorage` 事件，可以扩展到其他功能。

```
window.addEventListener('localStorageChange', (event) => {  const { key, value } = event.detail;  if (key === 'myKey') {    console.log('Detected localStorage change:', value);  }});
```

#### 3、MessageChannel（消息通道）

`MessageChannel` API 可以在同一个浏览器上下文中发送和接收消息。我们可以通过 `MessageChannel` 将 `localStorage` 的变化信息同步到其他部分，起到类似事件监听的效果。

```
const channel = new MessageChannel();channel.port1.onmessage = (event) => {  console.log('Detected localStorage change:', event.data);};localStorage.setItem('myKey', 'newValue');channel.port2.postMessage(localStorage.getItem('myKey'));
```

适合组件通信和复杂应用场景，消息机制较为灵活。相对复杂的实现，可能不适合简单场景。

#### 4、BroadcastChannel

`BroadcastChannel` 提供了一种更高级的浏览器通信机制，允许多个窗口或页面之间广播消息。你可以通过这个机制将 `localStorage` 变更同步到多个页面或同一页面的不同部分。

```
const channel = new BroadcastChannel('storage_channel');channel.onmessage = (event) => {  console.log('Detected localStorage change:', event.data);};localStorage.setItem('myKey', 'newValue');channel.postMessage({ key: 'myKey', value: 'newValue' });
```

支持跨页面通信，方便在不同页面间同步数据，易于实现。适用场景较为具体，通常用于复杂的页面通信需求。

这 4 个方法，主打的就是一个见缝插针，简单快速，风险性低。但是客观角度来讲，每种方案都是有各自优势的。

### 优势对比

<table data-tool="markdown.com.cn编辑器"><thead><tr><th>方案</th><th>优点</th><th>缺点</th><th>适用场景</th></tr></thead><tbody><tr><td>轮询</td><td>实现简单，适合低频监控需求</td><td>性能差，频繁轮询影响浏览器性能</td><td>简单场景或临时方案</td></tr><tr><td>监听代理 / 发布 - 订阅模式</td><td>灵活扩展，适合复杂项目</td><td>需要手动拦截 <code>setItem</code>，维护成本高</td><td>需要手动事件发布的场景</td></tr><tr><td>自定义 <code>StorageEvent</code></td><td>实现简单，原生支持 <code>storage</code> 事件监听</td><td>需要手动触发事件</td><td>同页签下 <code>localStorage</code> 监听</td></tr><tr><td>自定义事件</td><td>灵活的事件管理，适合不同场景</td><td>需要手动触发事件</td><td>需要自定义触发条件的场景</td></tr><tr><td><code>MessageChannel</code></td><td>适合组件通信和复杂应用场景</td><td>实现复杂，不适合简单场景</td><td>高级组件通信需求</td></tr><tr><td><code>BroadcastChannel</code></td><td>跨页面通信，适合复杂通信需求</td><td>使用场景较具体</td><td>复杂的多窗口通信</td></tr></tbody></table>

### 如何在 React / Vue 使用

在主流前端框架（如 React 和 Vue）中，监听 LocalStorage 变化并不困难。无论是 React 还是 Vue，你都可以使用自定义的 `StorageEvent` 或其他方法来实现监听。在此，我们以**「自定义 `StorageEvent`」** 为例，展示如何在 React 和 Vue 中实现 LocalStorage 的监听。

![](https://mmbiz.qpic.cn/mmbiz_jpg/lCQLg02gtibvpicVH87sEzRhiaXBOx2VnDBbk2wib4ib5UiaaEgJtkgUtL0A6rplOlczPP1ZmH6K0Mb5adRcNJTT5v1g/640?wx_fmt=other&from=appmsg)

#### 1. 在 React 中使用自定义 `StorageEvent`

React 是一个基于组件的框架，我们可以使用 React 的生命周期函数（如 `useEffect`）来监听和处理 LocalStorage 的变化。

```
import React, { useEffect } from 'react';const LocalStorageListener = () => {  useEffect(() => {    // 定义 storage 事件监听器    const handleStorageChange = (event) => {      if (event.key === 'myKey') {        console.log('Detected localStorage change:', event.newValue);      }    };    // 添加监听器    window.addEventListener('storage', handleStorageChange);    // 模拟触发自定义的 StorageEvent    const triggerCustomStorageEvent = () => {      const storageEvent = new StorageEvent('storage', {        key: 'myKey',        newValue: 'newValue',        url: window.location.href,      });      window.dispatchEvent(storageEvent);    };    // 组件卸载时移除监听器    return () => {      window.removeEventListener('storage', handleStorageChange);    };  }, []); // 空依赖数组表示该 effect 只会在组件挂载时运行  return (    <div>      <button onClick={() => localStorage.setItem('myKey', 'newValue')}>        修改 localStorage      </button>      <button onClick={() => window.dispatchEvent(new StorageEvent('storage', {        key: 'myKey',        newValue: localStorage.getItem('myKey'),        url: window.location.href,      }))}>        手动触发 StorageEvent      </button>    </div>  );};export default LocalStorageListener;
```

*   `useEffect` 是 React 的一个 Hook，用来处理副作用，在这里我们用它来注册和清除事件监听器。
    
*   我们手动触发了 `StorageEvent`，以便在同一页面中监听 LocalStorage 的变化。
    

#### 2. 在 Vue 中使用自定义 `StorageEvent`

在 Vue 3 中，我们可以使用 `onMounted` 和 `onUnmounted` 这两个生命周期钩子来管理事件监听器。（Vue 3 Composition API）：

```
<template>
  <div>
    <button @click="updateLocalStorage">修改 localStorage</button>
    <button @click="triggerCustomStorageEvent">手动触发 StorageEvent</button>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted } from 'vue';

const handleStorageChange = (event: StorageEvent) => {
  if (event.key === 'myKey') {
    console.log('Detected localStorage change:', event.newValue);
  }
};

const updateLocalStorage = () => {
  localStorage.setItem('myKey', 'newValue');
};

const triggerCustomStorageEvent = () => {
  const storageEvent = new StorageEvent('storage', {
    key: 'myKey',
    newValue: 'newValue',
    url: window.location.href,
  });
  window.dispatchEvent(storageEvent);
};

onMounted(() => {
  window.addEventListener('storage', handleStorageChange);
});

onUnmounted(() => {
  window.removeEventListener('storage', handleStorageChange);
});
</script>
```

*   使用了 Vue 的 Composition API，其中 `onMounted` 和 `onUnmounted` 类似于 React 的 `useEffect`，用于在组件挂载和卸载时管理副作用。
    
*   同样手动触发了 `StorageEvent` 来监听同一页面中的 LocalStorage 变化。
    

### 提炼封装一下 🚀🚀

无论是 React 还是 Vue，将自定义 `StorageEvent` 实现为一个组件或工具函数是常见的做法。你可以将上面的逻辑提取到一个独立的 hook 或工具函数中，方便在项目中多次使用。

#### 在 React 中提取为 Hook

```
import { useEffect } from 'react';const useLocalStorageListener = (key, callback) => {  useEffect(() => {    const handleStorageChange = (event) => {      if (event.key === key) {        callback(event.newValue);      }    };    window.addEventListener('storage', handleStorageChange);    return () => {      window.removeEventListener('storage', handleStorageChange);    };  }, [key, callback]);};export default useLocalStorageListener;
```

#### 在 Vue 中提取为工具函数

```
import { onMounted, onUnmounted } from 'vue';export const useLocalStorageListener = (key: string, callback: (value: string | null) => void) => {  const handleStorageChange = (event: StorageEvent) => {    if (event.key === key) {      callback(event.newValue);    }  };  onMounted(() => {    window.addEventListener('storage', handleStorageChange);  });  onUnmounted(() => {    window.removeEventListener('storage', handleStorageChange);  });};
```

*   在 React 中，我们创建了一个自定义 Hook `useLocalStorageListener`，通过传入监听的 key 和回调函数来捕获 LocalStorage 的变化。
    
*   在 Vue 中，我们创建了一个工具函数 `useLocalStorageListener`，同样通过传入 key 和回调函数来监听变化。
    

### 总结

在同一个浏览器页签中监听 `localStorage` 的变化并非难事，但不同场景下需要不同的方案。从简单的轮询到高级的 `BroadcastChannel`，本文介绍的几种方案各有优缺点。根据你的实际需求，选择合适的方案可以帮助你更高效地解决问题。

*   **「简单需求」**：可以考虑使用自定义 `StorageEvent` 或 `CustomEvent` 实现监听。
    
*   **「复杂需求」**：对于更高级的场景，如跨页面通信，`MessageChannel` 或 `BroadcastChannel` 是更好的选择。
    

如果你有其他的优化技巧或问题，欢迎在评论区分享，让我们一起交流更多的解决方案！