> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/-dxw9yGJPXJi58Z-tzu_3A)

> 作者：tager
> 
> 原文：https://juejin.cn/post/7362576319928008755

你踩过吗？浏览器节能机制导致Websocket断连的坑~~~

近期，在使用`WebSocket（WS）`连接时遇到了频繁断连的问题，这种情况在单个用户上每天发生数百次。尽管利用了`socket.io`的自动重连机制能够在断连后迅速恢复连接，但这并不保证每一次重连都能成功接收`WS`消息。因此，我们进行了一些的排查和测试工作。

最终发现问题的根本原因：正是浏览器的节能机制，不经意间成为了这一问题的**幕后黑手**。

![图片](https://mmbiz.qpic.cn/sz_mmbiz_jpg/XP4dRIhZqqWDNA6ibSIsA6hsxEugxMftJvzbudiaJ7nzMJFSX7hgAhQ7I8icfrChWmETBckF8U5z1591KUluQgSfQ/640?wx_fmt=other&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)ws1.png

浏览器节能机制简介
---------

浏览器的节能机制逐渐成为前端开发者需要关注的问题。特别是这些节能机制可能会对定时器的精度产生影响，这直接关系到前端应用的用户体验，在某些场景下甚至影响到用户的使用。

为了减少电能消耗，提高电池续航能力，现代浏览器都引入了节能机制。这些机制包括但不限于降低空闲标签页的`CPU`使用率、减少后台`JavaScript`的执行频率、**限制定时器的精确度**等。虽然这些措施显著提高了设备的能效，但也给前端开发带来了一些挑战。

WS频繁断连原因分析
----------

查阅socket.io官网[1]服务端配置的`pingTimeout`和`pingInterval`两个参数发现WS心跳异常时会导致重连，具体说明：  
![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

WS连接中服务端和客户端两端必须一直保持心跳。如果有一端停止，则满足如下条件之一就会自动断连：

*   服务器发送 ping，如果客户端在毫秒内 pingTimeout 没有用 pong 应答，则服务器认为连接已关闭。
    
*   同样，如果客户端在毫秒内 pingInterval + pingTimeout 未收到来自服务器的 ping，则客户端也会认为连接已关闭。
    

看文档发现其实高版本的socket.io是由服务端定时发起ping。而在socket.io 2.X的版本中内置的心跳机制是由客户端定时发起。而浏览器在后台运行时，**即使你设置了一个每秒触发的定时器，它也只能每分钟触发一次**，超过了`pingInterval + pingTimeout`设置的时间，最后看到的日志是很有规律的每分钟重连一次。在之前写的这篇文章中也有相关的介绍《掌握Web Workers：彻底解锁前端多线程编程的潜力》[2]

WS频繁断连解决方法
----------

### 升级socket.io到最新版本

上面的截图其实就是最新版本（4.x）的，升级后由服务器定时发起心跳。在服务端定时运行，避开了浏览器节能机制对定时器的影响

### 自定义WS心跳事件

为了减小直接升级对已有业务的影响，目前使用的也是这种方案：在服务端自定义心跳事件，定时发送心跳custom-ping

```
// 客户端的CODE
io.on('custom-ping', function () {
  io.emit('custom-pong', Date.now())
})

// 服务端CODE
io.on('connection', (socket) => {
  console.log('New client connected');

  // 发送自定义ping消息
  const pingInterval = setInterval(() => {
    socket.emit('custom-ping', Date.now());
  }, 10000); // 每10秒发送一次

  // 监听自定义pong消息
  socket.on('custom-pong', (data) => {
    console.log('Pong received:', data);
  });

  socket.on('disconnect', () => {
    clearInterval(pingInterval);
    console.log('Client disconnected');
  });
});


```

注意：**断连时一定要销毁定时器**

其实，socket.io是有内置心跳的（2.x版本客户端定时发起，4.x由服务端定时发起），**自定义心跳的意义主要在于保持数据交换**，在这个时间间隔内保持数据交换，socket就不会自动中断重连。

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

### @使用setTimeout

这里要注意使用setTimeout的姿势，如果是直接这样使用、依然会有精度问题。

> setTimeout丢失精度的情况：

```
// 以下setTimeout仍然会丢失精度
let _cacheTs = Date.now()
const _setTimeoutFn = () => {
  console.log('setTimeout :>> ', Date.now() - _cacheTs);
  _cacheTs = Date.now()
  setTimeout(() => {
    _setTimeoutFn()
  }, 5000)
}
_setTimeoutFn()


```

在setTimeout里面去执行一个函数栈会被浏览器监控到，会认为和setInterval一样，其在后台运行时会降低其定时精度。但如果这样可以避开节能机制的限制：

> setTimeout不丢失精度的情况：

```
// 客户端CODE
// 监听服务端发送的custom-pong事件
socket.on('custom-pong', onHeart)

const onHeart = () => {
  if (timer) {
    clearTimeout(pingTime.current)
  }
  timer = window.setTimeout(() => {
    socket.emit('custom-ping', Date.now())
  }, 5000)
}

// 服务端CODE
socket.on('custom-ping', ()=>{
  socket.emit('custom-pong', Date.now())
})


```

### 使用Web-Workers

在Web-Workers线程内发起定时不受浏览器节能机制的限制，相关示例在这篇文章里也有介绍《掌握Web Workers：彻底解锁前端多线程编程的潜力》

### 页面保活（实测无效）

在后台运行时也保持浏览器的活跃，用得最多的方式是在页面隐藏一个循环播放的音频 或者 使用`nosleep.js`

```
javascript
复制代码
const noSleepInstance = new NoSleep();
document.addEventListener('click', function enableNoSleep() {
  document.removeEventListener('click', enableNoSleep, false);
  noSleepInstance.enable();
}, false);


```

实测，使用这种方式时，**浏览器在后台运行仍然存在定时器精度降低的问题**。

小结
--

WS频繁断连的原因：

1.  使用了**低版本**（2.x）的socket.io
    
2.  在**客户端**每5秒定时发送 心跳
    
3.  浏览器后台运行时触发节能机制**限制**了定时器的精度，由每5秒变成了实际的每分钟执行一次
    
4.  每分钟执行一次远大于socket.io设置的pingTimeout时间
    
5.  WS断开连接
    
6.  socket.io内置的重连机制，立即重连成功
    
7.  查看日志发现每分钟重连一次。  
    在实际排查中，是从第七步倒退排查发现是浏览器节能机制所引起的问题。。。
    

总结
--

随着浏览器技术的发展，节能机制无疑会越来越完善，但与此同时也给前端开发带来了新的挑战。了解和适应这些变化，采用正确的策略来解决由此引起的问题，对于开发高质量的前端应用至关重要。通过上述方法，我们可以有效地缓解或解决浏览器节能机制对定时器精度降低带来的影响，从而提升用户体验。

参考资料

[1]

https://socket.io/zh-CN/docs/v4/server-options/#pinginterval: _https://link.juejin.cn?target=https%3A%2F%2Fsocket.io%2Fzh-CN%2Fdocs%2Fv4%2Fserver-options%2F%23pinginterval_

[2]

https://juejin.cn/post/7360890308845404200: _https://juejin.cn/post/7360890308845404200_

### 最后

  

  

如果你觉得这篇内容对你挺有启发，我想邀请你帮我个小忙：  

1.  点个「**喜欢**」或「**在看**」，让更多的人也能看到这篇内容
    
2.  我组建了个氛围非常好的前端群，里面有很多前端小伙伴，欢迎加我微信「**sherlocked_93**」拉你加群，一起交流和学习
    
3.  关注公众号「**前端下午茶**」，持续为你推送精选好文，也可以加我为好友，随时聊骚。
    

  

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

  

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

点个喜欢支持我吧，在看就更好了