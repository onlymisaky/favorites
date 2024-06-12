> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [juejin.cn](https://juejin.cn/post/7221802192600154167)

前言
==

双非大三，已经在广州实习一坤月🐤，差不多有两坤月没写💧文了。  
这篇是为了记录一下最近使用`Antd5`时遇到问题的简单记录吧。  
有一天，导师凑过来说，来来来，给你点事情做，你看看这个项目哈。你开个分支，看看能不能尝试把里面的组件去替换成最新的`Antd5`组件库。  
替换组件的过程...... 很平淡但是没有遇到什么大问题。  
但......

静态方法不消费 Context
===============

Antd5 中提供了`modal message notification`等函数的静态方法支持我们建议的唤起这些提示组件，但是，当我高高兴兴的在代码中调用`message.info`时，确实弹了出来，但我敏锐的察觉到，这按钮的主题色怎么不对啊？

![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/964d4dcc220c460eb617f48c022a690e~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp?)

出现问题第一件要做的事是什么？  
肯定是~大喊：导师！！！（nope）~ 查文档啦！ 翻找了一下，看到了这样的一段话出现。

![](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0ae6ce37e4724fb5834ac04159549a74~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp?)

我得使用`useModal`才能够消费最外层的`ConfigContext`，哦喔喔，那我懂了。那我就换咯，诶没问题，能用嘿嘿嘿。换着换着，我来到了一个类组件？？？诶？我尝试在`render`函数中调用`hook`，企图他能够生效，咳咳。  
_**`hook can not use in class component`**_

！！？寄，那怎么办，我不能放弃这些类组件啊，此时我疯狂转动我的小脑瓜，怎么办，怎么感觉要长脑子了！  
🆙 虽然使用库，也要脱离库（`React`官网写的是库），不要忘记我们只是在写 js。 既然`useModal`返回的`modal`只是一个已经消费了`Context`的函数。那在根组件调用一次`useModal`然后想办法让别的组件能够间接调用到这个返回的`modal`，那这问题不是~有手~就行。

代码时刻：

```
let modal
let meaasge
let notification
function Root({chilren}){
    const [modal1,holder1] = useModal()
    const [meaasge2,holder2] = useMeaasge()
    const [notification3,holder3] = useNotification()
    modal = modal1
    meaasge = meaasge2
    notification = notification3
    return <>
     {holder1}{holder2}{holder3}{chilren}
    </>
}
export { modal,meaasge,notification }
```

然后我在别的地方一用，哈哈哈，果然没问题 🫵  至于后续，我又在官网看到了，`useApp`这个`hook`，而且往下翻... 咳咳，思考的过程最重要哈

![](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/cc36f8c6a3cf4d039059708f208b3512~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp?)

useModal 不能全局配置
===============

可以容易的看出`Antd`弹窗的关闭图标并不是一个规则的 X 号 (视觉很难受啊😭)。。

![](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f4d00438053249ed96a6a31474d4b67f~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp?)

组件调用时我可以通过封装一个`MyModal`组件进行`props`的预设。  
现在换成了`modal`的函数式调用呢？我需要怎么做？  
其实我真正要做的：拿到一个函数，`transform`这个函数，给他预设一些参数，再返回一个函数，让函数正常执行？等等，又要长脑子了！\

代码时刻：

```
//给modal弹窗注入属性
function injectCloseIconIntoModal(initModal: ModalInstance) {
  for (const method in initModal) {
    if (Object.prototype.hasOwnProperty.call(initModal, method)) {
      const methodFn = initModal[method];
      if (typeof methodFn === 'function') {
        initModal[method] = function(args) {
          const _args = {
            closeIcon: <Svg svg={Close} />,
            ...args,
          };
          methodFn.bind(this)(_args);
        };
      }
    }
  }
  return initModal;
}
```

不出意料，这样是 ok 的，嘿嘿。

怎么清除 dom 的 title(标题) 属性
=======================

![](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9f41b2b558cc44f4af37924565914b3f~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp?)

要做这个原因是在触控大屏上，因为奇奇怪怪的`hover`会导致原生自带的`title`提醒会卡在页面不消失，所以我需要去将所有的`title`进行`remove`，并且`dom`会动态添加。  
就这个问题我问了`chatgpt`，一问就过... 太厉害了

![](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/83c63e1c0a234a2c96a8bcaef90eb4d9~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp?)

```
function removeTitleAttributes() {
  // 获取页面中所有带有title属性的元素
  const elements = document.querySelectorAll('[title]');

  // 遍历所有元素，移除它们的title属性
  elements.forEach(element => {
    element.removeAttribute('title');
  });
}

// 页面加载后执行一次
removeTitleAttributes();

// 监听DOM变化，动态移除新添加元素的title属性
const observer = new MutationObserver(mutationsList => {
  mutationsList.forEach(mutation => {
    mutation.addedNodes.forEach(node => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const elements = node.querySelectorAll('[title]');
        elements.forEach(element => {
          element.removeAttribute('title');
        });
      }
    });
  });
});

observer.observe(document.body, {
  attributes: true,
  childList: true,
  subtree: true,
  attributeFilter: ['title'],
});
```

优化
--

又让`chatgpt`写了个判断是否是触屏设备的函数来看是否去除`title`。咳咳

```
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
export default isTouchDevice;
```

终
=

大三仔还有很长的路要走。  
最后晒一下中午公司自助食堂的烤羊排 🥢

![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b51ffd4024014dba8834db9311a7c545~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp?)