> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/KIjUoGaUfAIu1awnLUNmrQ)

```
点击下方“前端开发爱好者”，选择“设为星标”

第一时间关注技术干货！



```

> 哈喽，大家好 我是 `xy`👨🏻‍💻。今天给大家分享 `Tailwind CSS` 的一个新功能——`Signals 信号机制`！

前言
--

大家好！今天，我要向大家介绍 `Tailwind CSS` 的一个激动人心的新功能——**Signals 信号机制**。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/kzFgl6ibibNKr6MiaibRIC1AEqD4uaNCvf8SAKcVZicD5YXH69r9IGBdazq1wn81ia2Ff8a95ePY5YkmCQTAHATgTZiaQ/640?wx_fmt=jpeg&from=appmsg)

这个功能为我们的样式表带来了前所未有的`灵活性`，让我们能够以更`声明式`和`直接的`方式根据`祖先的状态`应用样式。

如果你是一个前端开发者，或者对构建现代网站和应用的 `CSS` 工具库感兴趣，那么这个新特性你绝对`不能错过`。

Signals 信号机制简介
--------------

在传统的 `CSS` 开发中，我们常常需要通过复杂的`选择器链`和`伪类`来实现样式的动态变化。

现在，`Tailwind CSS` 通过引入 **Signals** 插件，让我们可以更加简洁和直观地控制样式。

**Signals** 允许我们通过`样式查询`（container queries）来响应式地启用自定义状态，这些状态可以被 `DOM` 中的任何后代元素使用。

Signals 信号机制的优势
---------------

*   **简化样式应用**：使用 **Signals**，我们可以摆脱传统的 CSS 选择器和伪类，以更简单的方式实现样式效果，减少了代码的复杂性。
    

*   **提高代码可读性**：**Signals** 提供了一个更清晰的 API，使得代码更加易读和易于维护，让开发工作更加流畅。
    

*   **声明式风格**：与现有的组变体 / 工具类相比，**Signals** 允许使用单一的、简单的、不连续的变体来设置和使用状态，进一步简化了开发过程。
    

如何使用 Signals 信号机制？
------------------

使用 **Signals** 非常简单。首先，你需要通过 `npm` 安装 `tailwindcss-signals` 插件：

```
npm install tailwindcss-signals


```

然后，在 `tailwind.config.js` 文件中引入它：

```
module.exports = {
  plugins: [
    require('tailwindcss-signals'),
  ],
}


```

现在，你可以使用 `signal` 变体来根据祖先的状态应用样式了。例如：

```
<div>
  <button
    class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded peer"
  >
    鼠标悬停到此处
  </button>
  <div class="peer-hover:signal">
    <div class="signal:bg-green-800 bg-red-800 p-1 text-white">
      鼠标悬停到按钮我会变色
    </div>
  </div>
</div>


```

在这个例子中，当`鼠标悬停到按钮上`时，下部的 `div` 将显示`绿色`背景。

*   效果展示：
    

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/kzFgl6ibibNKr6MiaibRIC1AEqD4uaNCvf8SQpoGwwGSiaLBzvYA1LVvcwwVBMVZeNRDIeEm7MqS1dftCYjbRADBCaQ/640?wx_fmt=gif&from=appmsg)

后代条件激活信号
--------

**Signals** 还允许我们根据`后代`的状态激活信号：

```
<div class="has-[:is(input:checked,div:hover)]:signal">
  <input type="checkbox" />
  <div class="bg-red-800 p-1 text-white signal:bg-green-800">鼠标悬停或勾选</div>
</div>


```

在这个例子中，当复选框被`选中`或`悬停`在 `div` 上时，整个块将显示`绿色`背景。

*   效果展示：
    

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/kzFgl6ibibNKr6MiaibRIC1AEqD4uaNCvf8StCKplWgvY2u52ZPO4Q77XlicQYN7r8QC3R1YTmcNoaNnZSzAMFfJtug/640?wx_fmt=gif&from=appmsg)

注意事项
----

*   **浏览器兼容性**：样式查询尚未在所有浏览器中得到广泛支持。Safari 和 Firefox 已在其开发版本中开始实现样式查询，因此广泛支持只是时间问题。
    
*   **循环依赖**：如果信号的状态基于后代的状态，而后代的状态又基于信号，可能会出现问题。
    
*   **命名信号**：可以通过在信号变体后添加名称来命名信号，以避免与其他信号冲突。
    

与其他 CSS 框架的对比
-------------

Tailwind CSS 的 **Signals** 信号机制在处理父子元素状态交互方面提供了一个简洁且强大的解决方案。

与其他 CSS 框架和工具相比，它减少了代码的复杂性，提高了开发效率，并且保持了样式的纯粹性。

**Signals** 信号机制为 Tailwind CSS 带来了更多的灵活性和强大功能。

它使得我们可以用更简单的方式实现复杂的样式效果，提高了代码的可读性和可维护性。虽然目前浏览器支持有限，但随着浏览器的发展，**Signals** 信号机制将成为我们样式表中的重要工具。

如果你觉得这个功能对你的项目有帮助，不妨尝试一下！

如果你有任何问题或建议，欢迎在评论区留言。别忘了关注我们的公众号，获取更多前端最新动态和实用技巧！

写在最后
----

> `公众号`：`前端开发爱好者` 专注分享 `web` 前端相关`技术文章`、`视频教程`资源、热点资讯等，如果喜欢我的分享，给 🐟🐟 点一个`赞` 👍 或者 ➕`关注` 都是对我最大的支持。

欢迎`长按图片加好友`，我会第一时间和你分享`前端行业趋势`，`面试资源`，`学习途径`等等。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/kzFgl6ibibNKr6MiaibRIC1AEqD4uaNCvf8SMNWYJ7wy2TPNSAoUa4gicM6cicVkAu7x5gp72rliah9zgXDdo94qCO5AQ/640?wx_fmt=jpeg&from=appmsg)

添加好友备注【**进阶学习**】拉你进技术交流群

关注公众号后，在首页：

*   回复 **面试题**，获取最新大厂面试资料。
    
*   回复 **简历**，获取 3200 套 简历模板。
    
*   回复 **React 实战**，获取 React 最新实战教程。
    
*   回复 **Vue 实战**，获取 Vue 最新实战教程。
    
*   回复 **ts**，获取 TypeScript 精讲课程。
    
*   回复 **vite**，获取 Vite 精讲课程。
    
*   回复 **uniapp**，获取 uniapp 精讲课程。
    
*   回复 **js 书籍**，获取 js 进阶 必看书籍。
    
*   回复 **Node**，获取 Nodejs+koa2 实战教程。
    
*   回复 **数据结构算法**，获取数据结构算法教程。
    
*   回复 **架构师**，获取 架构师学习资源教程。
    
*   更多教程资源应有尽有，欢迎 **关注获取。**