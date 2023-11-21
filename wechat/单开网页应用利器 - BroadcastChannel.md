> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/OChbJt7pfvxh54Vp5H-IUQ)

前言
--

> 前段时间在做一个基于 `psd` 模板生成图片的应用，其中重要的功能就是打开编辑器页面来设计出图。但是有个问题，每当我点击一个模板，就会新开一个浏览器页签。现代浏览器是以空间换时间的运行思路来提高效率，这就导致了内存开销会越来越大，也曾想过 postmessage 来解决这个问题，但是呢 `postmessage` 是跨域广播，说白了，我 `post` 的消息任意页签都能 `listen` 到，不友好。最近刷抖音时，看到了一个前端教学视频，其中就讲到了网页音乐单开的实现方式，核心原理：**`BroadcastChannel`**。

技术原理
----

**`BroadcastChannel`** 接口代理了一个命名频道，可以让指定 origin 下的任意 browsing context 来订阅它。它允许同源的不同浏览器窗口，Tab 页，frame 或者 iframe 下的不同文档之间相互通信。通过触发一个 `message` 事件，消息可以广播到所有监听了该频道的 `BroadcastChannel` 对象。

### 创建或者加入频道

客户端通过构造函数，传入频道名称即可创建或加入频道。如果当前不存在此命名的频道，就会初始化并创建。

```
// 创建或加入频道const channel = new BroadcastChannel('editor_channel');
```

### 发送消息

基于刚才创建或加入的频道实例，调用 `postMessage` 方法发送消息。可以使用 **`BroadcastChannel.postMessage()`**  发送一条任意 `Object` 类型的消息，给所有同源下监听了该频道的所有浏览器上下文。消息以 `message` 事件的形式发送给每一个绑定到该频道的广播频道。

```
channel.postMessage(message: any);
```

### 接受消息

通过监听 `message` 事件即可接收到同频道发送的任意消息。

```
channel.addEventListener('message', ({data: any}) => {    console.log(data);})// 或者channel.onmessage = ({data: any}) => {    console.log(data);}
```

### 异常处理

通过监听 `messageerror`  事件即可捕获异常。

```
qh_channel.addEventListener('messageerror', e) => {    console.error(e);})// 或者qh_channel.onmessagerror = (e) => {    console.error(e);}
```

#### 断开连接

调用 `close()` 方法即可断开对象和基础通道之间的链接。

```
qh_channel.close()
```

实现
--

**原理搞清楚了，那么接下来就是实战了。** 先上效果图：

![](https://mmbiz.qpic.cn/mmbiz_gif/cAd6ObKOzEDGIb0ESicAW2DEffrN6T9a434I7JLqOmrkmvBibo5t9MPJCUFT8v2jefGKqFXib35aQRJ0lXzjRJtHQ/640?wx_fmt=gif)

_图中使用了 2 个受控页面，目的是想验证多个页面能够被统一控制，而且咱也的确控制不了用户的某些操作。_

### 封装 `Channel` 类

```
const editorList = [];/** * @description: 页面通信类 * @param {String} channelName channel名称 * @param {String} page 实例化channel的页面名称 * @param {Boolean} isEditor 是否是编辑器 * @param {String} editorName 编辑器页面名称 * @param {Function} onmessage 接收到消息的回调 * @return {Channel} channel实例 */export default class Channel {  constructor({ channelName, page, isEditor = false, editorName, onmessage }) {    if (!page) throw new Error('page is required');    if (!isEditor && !editorName) throw new Error('editorName is required');    this.__uuid__ = Math.random().toString(36).substr(2);    this.isEditor = isEditor; // 是否是编辑器    this.editorName = editorName; // 编辑器页面名称    this.page = page; // 实例化channel的页面名称    this.name = channelName ?? 'qh_channel'; // channel名称    this.channel = new BroadcastChannel(this.name);    this.addEvent(onmessage);    this.load(); // 告诉其他页面，我初始化完了  }  addEvent(onmessage) {    this.channel.onmessage = ({ data: { type, page, data, uuid } }) => {      if (!this.isEditor) {        if (page === this.editorName) {          // 如果是编辑器页面发送的消息          this.updateEditor(type, uuid);        }      } else if (type === 'load' && page !== this.page) {        // 其他页面加载时，告诉知我已经存在了        this.load();      }      if (onmessage) {        onmessage({ type, page, data });      }    };  }  // 如果用户手动打开了多个编辑器，需要更新编辑器列表  updateEditor(type, uuid) {    const index = editorList.indexOf(uuid);    if (type === 'load') {      if (index === -1) {        editorList.push(uuid);      }    } else if (type === 'unload') {      if (index !== -1) {        editorList.splice(index, 1);      }    }  }  postMessage(data) {    if (!!editorList.length || this.isEditor) {      const newData = { page: this.page, uuid: this.__uuid__, ...JSON.parse(JSON.stringify(data)) };      this.channel.postMessage(newData);      return true;    }    return false;  }  load() {    this.channel.postMessage({ type: 'load', uuid: this.__uuid__, page: this.page });  }  unload() {    this.channel.postMessage({ type: 'unload', uuid: this.__uuid__, page: this.page });    this.channel.onmessage = null;    this.channel.close();  }  close() {}}
```

### 主控页面逻辑

在主控页面引入并实例化 `Channel` 类。其中 `page` 和 `editorName` 必须填写。

```
import Channel from '@/utils/channel';const editorChannel = new Channel({  page: 'template_index',  editorName: 'editor_index',  onmessage: ({ type, page, data }) => {    if (type === 'confirm' && page === 'editor_index') {      Modal.confirm({        title: '警告',        icon: createVNode(ExclamationCircleOutlined),        content: '模板还未保存，确认替换？',        onOk() {          editorChannel.postMessage({ type: 'force_data', data });        },      });    }  },});window.onunload = () => {  editorChannel.unload();};onUnmounted(() => {  editorChannel.unload();}); // 点击事件const itemClick = (node) => {  if (!editorChannel.postMessage({ type: 'data', data: node })) {    const rt = router.resolve(`/editor/${node.id}`);    safeOpen(rt.href);  }};
```

前边提到了 `safeOpen` ，实现方案也很简单，具体为什么要 `safeOpen` ，请自行 `google` 。

```
window.open(url, target, 'noreferrer,noopener');
```

### 受控页面逻辑

受控页面同样引入并实例化 `Channel` 类。`page` 必须填写并且要标记 `isEditor: true` ，明确告知这是编辑器页面，这样 `Channel` 类就知道在 `onmessage` 时知道如何处理逻辑了。

```
import Channel from '@/utils/channel';const editorChannel = new Channel({  page: 'editor_index',  isEditor: true,  onmessage: ({ type, data }) => {    if (type === 'data') {      if (dirty) {        // 有修改，在主控页面弹窗提醒        editorChannel.postMessage({ type: 'confirm', data });      } else {        // 无修改        window.location.href = `/editor/${data.id}`;      }    } else if (type === 'force_data') {      // 强制更新数据      window.location.href = `/editor/${data.id}`;    }  },});window.onunload = () => {  editorChannel.unload();};onUnmounted(() => {  editorChannel.unload();});
```

其实呢代码量也不多，核心就是 `Channel` 类，记录编辑器广播通信的 `__uuid__` （这里之所以使用数组记录是因为用户的确可以通过 `url` 地址强制多开，那咱也没办法，只能一并记录更新），当主控页面想要打开新的编辑器时，优先调用 `postMessage` 方法，根据其返回结果判断编辑器是否存在，如果存在就触发受控页面更新路由并加载，如果不存在就打开新页签。

总结
--

**`BroadcastChannel`** 是一个非常简单的 `API` ，内部包含了跨上下文同源通信的接口。它没有定义消息传输协议，故不同上下文中的不同文档需要自己实现。目前来看兼容性方面也基本没有问题。![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEDGIb0ESicAW2DEffrN6T9a4rIN4g4iaibSuhxpEsSmVQImy2oh4U5c97cR5iaWLrriaNzT2MeFyvhZYSw/640?wx_fmt=png)

- END -

关于奇舞团
-----

奇舞团是 360 集团最大的大前端团队，代表集团参与 W3C 和 ECMA 会员（TC39）工作。奇舞团非常重视人才培养，有工程师、讲师、翻译官、业务接口人、团队 Leader 等多种发展方向供员工选择，并辅以提供相应的技术力、专业力、通用力、领导力等培训课程。奇舞团以开放和求贤的心态欢迎各种优秀人才关注和加入奇舞团。

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEBLicibtcprJISN18FgTtg2N1ichPnMqRhicrP20VfwnC4vday7gtEoiaSynIH1bas4N5kgicliakrLdtT2Q/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)