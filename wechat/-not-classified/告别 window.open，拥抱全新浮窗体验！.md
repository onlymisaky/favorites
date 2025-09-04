> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/j9JRXnQQK9eo5-WDGhc9VQ)

  

> 深入了解 Document Picture-in-Picture API，并对比 Modal 的最佳使用场景

在前端开发中，我们经常会遇到这样的需求：**弹出一个浮动窗口**来显示一些实时信息、工具栏或视频内容。过去我们会用 `window.open()`，后来越来越多的开发者倾向于使用 Modal。但现在，一个更现代的 API 出现了——**Document Picture-in-Picture API**，它能带来一种完全不同的浮窗体验。

为什么我们需要新的解决方案？
--------------

传统的 `window.open()` 虽然简单易用，但限制非常多：

*   ❌ **容易被浏览器拦截**（尤其是在移动端）
    
*   ❌ **用户体验差**（新窗口可能被挡住）
    
*   ❌ **样式控制受限**（几乎无法用 CSS 美化）
    
*   ❌ **无法保证窗口始终置顶**
    

**Modal（模态框）**虽然解决了很多问题，但它**始终依附于当前页面 DOM**，一旦用户切换了标签页、最小化了窗口，就无法再查看。

Document Picture-in-Picture API 是什么？
------------------------------------

这是浏览器提供的**原生 API**，它允许你创建一个**独立的、始终置顶的小窗口**，并加载自定义 HTML 内容。它和视频画中画（Video PiP）类似，但不是只能放视频，而是可以放**任何 HTML 页面内容**！

> ✅ 从技术上说，它本质上是一个轻量、独立的浏览器子窗口，但有专门的样式控制权。

🆚 Modal 和 Document PiP 的对比分析
-----------------------------

<table><thead><tr><th><section>对比维度</section></th><th><section>Modal（模态框）</section></th><th><section>Document PiP（文档浮窗）</section></th></tr></thead><tbody><tr><td><section>是否属于当前页面</section></td><td><section>✅ 是</section></td><td><section>❌ 否，独立页面</section></td></tr><tr><td><section>是否总在顶层显示</section></td><td><section>❌ 需控制 z-index</section></td><td><section>✅ 浏览器层面置顶</section></td></tr><tr><td><section>是否能脱离标签页</section></td><td><section>❌ 否</section></td><td><section>✅ 是，切标签页依然保留显示</section></td></tr><tr><td><section>样式与内容控制</section></td><td><section>✅ 可通过 React/Vue 完整控制</section></td><td><section>✅ 需通过 HTML 字符串或 JS 注入</section></td></tr><tr><td><section>是否能被拦截</section></td><td><section>✅ 不会</section></td><td><section>✅ 不会</section></td></tr><tr><td><section>用户体验</section></td><td><section>✅ 优秀</section></td><td><section>✅ 更适合小工具类浮窗</section></td></tr><tr><td><section>使用场景</section></td><td><section>表单、对话框、确认弹窗等</section></td><td><section>数据面板、悬浮工具栏、直播小窗等</section></td></tr></tbody></table>

🛠 快速上手指南
---------

### 检查浏览器是否支持

由于这个现代 API 的兼容性并没有那么完美

![](https://mmbiz.qpic.cn/mmbiz_png/MDPRplBm9ZVbjfKQBLM0E8OWalMHR8c7CYfBCNukFnaicQnUxa0FicX6AaLbfwfMHPqsbVdSalNYfmqib3T7eQXHg/640?wx_fmt=png&from=appmsg#imgIndex=0)

在代码中需要检查浏览器是否支持

```
const isSupported = "documentPictureInPicture" in window;
```

### 创建一个浮窗

```
async function openPipWindow() {  if (!("documentPictureInPicture" in window)) return;  const pipWindow = await documentPictureInPicture.requestWindow({    width: 400,    height: 300  });  // 设置窗口内容（你可以用框架进一步封装）  pipWindow.document.body.innerHTML = \`    <div style="padding: 20px; background: #f0f0f0;">      <h2>🎉 自定义浮窗</h2>      <p>这是对 window.open 的完美替代</p>    </div>  \`;}
```

📌 **注意：** 当前只能通过字符串方式注入内容，暂不支持直接挂载 Vue/React 组件，但可以用 `iframe` 或构建工具封装。

视频弹窗？请用 Video PiP！
------------------

```
<video id="myVideo" controls>  <source src="video.mp4" type="video/mp4"></video><button onclick="togglePiP()">📺 画中画</button><script>async function togglePiP() {  const video = document.getElementById('myVideo');  if (!document.pictureInPictureElement) {    await video.requestPictureInPicture(); // 开启画中画  } else {    await document.exitPictureInPicture(); // 退出  }}</script>
```

📊 典型场景推荐
---------

### 实时仪表盘

显示用户活跃、订单数量、监控指标等 —— 适合后台管理端、BI 系统等。

```
const pipWindow = await documentPictureInPicture.requestWindow();pipWindow.document.body.innerHTML = `   <div style="background: #1a1a1a; color: white; padding: 20px;">    <h3>📈 实时指标</h3>    <div>当前在线：245</div>    <div>异常警告：2</div>  </div>`;
```

### 套电落地页聊天窗

用于落地页收集线索、在线客服、AI 助手浮窗，让用户切换页面时仍能继续对话。

```
const chatWindow = await documentPictureInPicture.requestWindow();chatWindow.document.body.innerHTML = `  <div style="padding: 10px; font-family: sans-serif;">    <h4>🧑‍💼 在线客服</h4>    <div style="height: 200px; overflow-y: auto; border: 1px solid #ccc;">欢迎咨询，我们在线！</div>    <input type="text" placeholder="输入您的问题..." style="width: 100%; margin-top: 10px;">  </div>`;
```

实用技巧 & 最佳实践
-----------

### 🚨 错误处理

```
try {  const pipWindow = await documentPictureInPicture.requestWindow();} catch (error) {  if (error.name === 'NotAllowedError') {    console.log('用户拒绝了浮窗权限');  }}
```

### 📐 响应式尺寸建议

```
const pipWindow = await documentPictureInPicture.requestWindow({  width: Math.min(400, window.innerWidth * 0.8),  height: Math.min(300, window.innerHeight * 0.8)});
```

不知道你是否有这样的疑问：

> ❓为什么不直接用 Modal？还能用 JSX 或组件，性能也更好？

这是一个非常好的问题。确实，在页面内部使用 Modal 组件（例如 antd、Element Plus 等）更适合处理输入、表单、提示等页面交互内容，代码复用度也高。但：

*   Modal **只能在当前页面中显示**，标签页切换或窗口最小化后就不可见；
    
*   Document PiP 则是 **浏览器级别的浮窗**，可以**独立存在、随时可见**，特别适合那些希望 “常驻桌面” 的场景。
    

### 所以，选择哪个更好？

*   👨‍💻 **推荐使用 Modal：** 表单交互、流程控制、确认提示等。
    
*   🖥️ **推荐使用 Document PiP：** 实时数据窗口、悬浮工具、小地图、直播窗等。
    

总结
--

为不同场景选择最合适的浮窗方案

<table><thead><tr><th><section>场景</section></th><th><section>推荐方案</section></th></tr></thead><tbody><tr><td><section>表单输入</section></td><td><section>✅ Modal</section></td></tr><tr><td><section>实时监控窗口</section></td><td><section>✅ Document PiP</section></td></tr><tr><td><section>简单的确认提示</section></td><td><section>✅ Modal</section></td></tr><tr><td><section>常驻小工具栏</section></td><td><section>✅ Document PiP</section></td></tr><tr><td><section>视频画中画</section></td><td><section>✅ Video PiP API</section></td></tr></tbody></table>

  

📢建议
----

如果你想实现：

*   不被弹窗拦截器阻止的浮窗功能；
    
*   永远置顶、跨标签页的小窗口；
    
*   快速集成、无需第三方组件的解决方案；
    

👉 那就大胆尝试 **Document Picture-in-Picture API** 吧！它或许会成为你项目中意想不到的提升利器！

**喜欢这类 Web API 深度解读？欢迎点赞 + 关注，我们下期再见！** 🧑‍💻🎉