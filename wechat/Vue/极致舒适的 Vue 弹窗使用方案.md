> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/mksSYrJvw_gQK6OCNThCGg)

一个`Hook`让你体验极致舒适的`Dialog`使用方式！

![](https://mmbiz.qpic.cn/mmbiz_jpg/bwG40XYiaOKn7JgYdd4W47qN3nJlpJG24YjsaTMj75e0NDnZJttlr9YTD0tYeA3CJsV71ibZZGCGGMje9vIB6N1A/640?wx_fmt=other)image.png

Dialog 地狱
---------

为啥是地狱？

因为凡是有`Dialog`出现的页面，其代码绝对优雅不起来！因为一旦你在也个组件中引入`Dialog`，就最少需要额外维护一个`visible`变量。如果只是额外维护一个变量这也不是不能接受，可是当同样的`Dialog`组件，即需要在父组件控制它的展示与隐藏，又需要在子组件中控制。

为了演示我们先实现一个`MyDialog`组件，代码来自 ElementPlus 的 Dialog 示例

```
<script setup lang="ts">import { computed } from 'vue';import { ElDialog } from 'element-plus';const props = defineProps<{  visible: boolean;  title?: string;}>();const emits = defineEmits<{  (event: 'update:visible', visible: boolean): void;  (event: 'close'): void;}>();const dialogVisible = computed<boolean>({  get() {    return props.visible;  },  set(visible) {    emits('update:visible', visible);    if (!visible) {      emits('close');    }  },});</script><template>  <ElDialog v-model="dialogVisible" :title="title" width="30%">    <span>This is a message</span>    <template #footer>      <span>        <el-button @click="dialogVisible = false">Cancel</el-button>        <el-button type="primary" @click="dialogVisible = false"> Confirm </el-button>      </span>    </template>  </ElDialog></template>
```

### 演示场景

就像下面这样：

![](https://mmbiz.qpic.cn/mmbiz_jpg/bwG40XYiaOKn7JgYdd4W47qN3nJlpJG24L1TvU5zMBKRYCwrn2oyFg5MNjIy3nwdMgY5vT4c4qwS58k8SseIqrg/640?wx_fmt=other)Kapture 2023-07-07 at 22.44.55.gif

示例代码如下：

```
<script setup lang="ts">import { ref } from 'vue';import { ElButton } from 'element-plus';import Comp from './components/Comp.vue';import MyDialog from './components/MyDialog.vue';const dialogVisible = ref<boolean>(false);const dialogTitle = ref<string>('');const handleOpenDialog = () => {  dialogVisible.value = true;  dialogTitle.value = '父组件弹窗';};const handleComp1Dialog = () => {  dialogVisible.value = true;  dialogTitle.value = '子组件1弹窗';};const handleComp2Dialog = () => {  dialogVisible.value = true;  dialogTitle.value = '子组件2弹窗';};</script><template>  <div>    <ElButton @click="handleOpenDialog"> 打开弹窗 </ElButton>    <Comp text="子组件1" @submit="handleComp1Dialog"></Comp>    <Comp text="子组件2" @submit="handleComp2Dialog"></Comp>    <MyDialog v-model:visible="dialogVisible" :title="dialogTitle"></MyDialog>  </div></template>
```

这里的`MyDialog`会被父组件和两个`Comp`组件都会触发，如果父组件并不关心子组件的`onSubmit`事件，那么这里的`submit`在父组件里唯一的作用就是处理`Dialog`的展示！！！🧐这样真的好吗？不好！

来分析一下，到底哪里不好！

**`MyDialog`本来是`submit`动作的后续动作，所以理论上应该将`MyDialog`写在`Comp`组件中。但是这里为了管理方便，将`MyDialog`挂在父组件上，子组件通过事件来控制`MyDialog`。**

**再者，这里的`handleComp1Dialog`和`handleComp2Dialog`函数除了处理`MyDialog`外，对于父组件完全没有意义却写在父组件里。**

如果这里的`Dialog`多的情况下，简直就是`Dialog`地狱啊！🤯

理想的父组件代码应该是这样：

```
<script setup lang="ts">import { ElButton } from 'element-plus';import Comp from './components/Comp.vue';import MyDialog from './components/MyDialog.vue';const handleOpenDialog = () => {  // 处理 MyDialog};</script><template>  <div>    <ElButton @click="handleOpenDialog"> 打开弹窗 </ElButton>    <Comp text="子组件1"></Comp>    <Comp text="子组件2"></Comp>  </div></template>
```

在函数中处理弹窗的相关逻辑才更合理。

解决之道
----

🤔朕观之，是书之文或不雅，致使人之心有所厌，何得无妙方可解决？

依史记之辞曰：“天下苦`Dialog`久矣，苦楚深深，望有解脱之道。” 于是，诸位贤哲纷纷举起讨伐`Dialog`之旌旗，终 “`命令式Dialog`” 逐渐突破困境之境地。

![](https://mmbiz.qpic.cn/mmbiz_jpg/bwG40XYiaOKn7JgYdd4W47qN3nJlpJG24Cu3vGk7760XPMPDIRLwYZPscnMhc5SBcoX2yib1kJWWuUicBsicWUswow/640?wx_fmt=other)image.png

没错现在网上对于`Dialog`的困境，给出的解决方案基本上就 “`命令式Dialog`” 看起来比较优雅！这里给出几个网上现有的`命令式Dialog`实现。

### 命令式一

![](https://mmbiz.qpic.cn/mmbiz_jpg/bwG40XYiaOKn7JgYdd4W47qN3nJlpJG243SW7nSiaYSLzibnX3AqOibASJ5qtZwWPMPibU2IX3MpWicljoMzDFicC7GBA/640?wx_fmt=other)codeimg-facebook-shared-image (5).png

吐槽一下～，这种是能在函数中处理弹窗逻辑，但是缺点是`MyDialog`组件与`showMyDialog`是两个文件，增加了维护的成本。

### 命令式二

基于第一种实现的问题，不就是想让`MyDialog.vue`和`.js`文件合体吗？于是诸位贤者想到了`JSX`。于是进一步的实现是这样：

![](https://mmbiz.qpic.cn/mmbiz_jpg/bwG40XYiaOKn7JgYdd4W47qN3nJlpJG24WUAGgTDib8SQh2cWS0eUib5MsGYVn94pVtWXUrW59T9LUO8SBFxJmewg/640?wx_fmt=other)codeimg-facebook-shared-image (7).png

嗯，这下完美了！🌝

![](https://mmbiz.qpic.cn/mmbiz_jpg/bwG40XYiaOKn7JgYdd4W47qN3nJlpJG24s5FGdHc7NfXxMibgec2uLcQtbx8ek9DShlu2QMwZ4vIdicUVVqrqiaXXw/640?wx_fmt=other)doutub_img.png

完美？还是要吐槽一下～

*   如果我的系统中有很多弹窗，难道要给每个弹窗都写成这样吗？
    
*   这种兼容`JSX`的方式，需要引入支持`JSX`的依赖！
    
*   如果工程中不想即用`template`又用`JSX`呢？
    
*   如果已经存在使用`template`的弹窗了，难道推翻重写吗？
    
*   ...
    

思考
--

首先承认一点命令式的封装的确可以解决问题，但是现在的封装都存一定的槽点。

如果有一种方式，**即保持原来对话框的编写方式不变，又不需要关心`JSX`和`template`的问题，还保存了命令式封装的特点**。这样是不是就完美了？

那真的可以同时做到这些吗？

![](https://mmbiz.qpic.cn/mmbiz_jpg/bwG40XYiaOKn7JgYdd4W47qN3nJlpJG249yAHlgqJh28ibT0lElEibUInibibP8s3uK2Bicu8eicVECnPibeeBfnib1VhGQ/640?wx_fmt=other)doutub_img (2).png

如果存在一个这样的 Hook 可以将状态驱动的 Dialog，转换为命令式的 Dialog 吗，那不就行了？

它来了：useCommandComponent
-----------------------

![](https://mmbiz.qpic.cn/mmbiz_jpg/bwG40XYiaOKn7JgYdd4W47qN3nJlpJG246ZibpeHn5pRTXzlEo0EaicDhWz0kXSBO9Yky7CWVCIvWxKS6oYicAfuBg/640?wx_fmt=other)image.png

父组件这样写：

```
<script setup lang="ts">import { ElButton } from 'element-plus';import { useCommandComponent } from '../../hooks/useCommandComponent';import Comp from './components/Comp.vue';import MyDialog from './components/MyDialog.vue';const myDialog = useCommandComponent(MyDialog);</script><template>  <div>    <ElButton @click="myDialog({ title: '父组件弹窗' })"> 打开弹窗 </ElButton>    <Comp text="子组件1"></Comp>    <Comp text="子组件2"></Comp>  </div></template>
```

`Comp`组件这样写：

```
<script setup lang="ts">import { ElButton } from 'element-plus';import { useCommandComponent } from '../../../hooks/useCommandComponent';import MyDialog from './MyDialog.vue';const myDialog = useCommandComponent(MyDialog);const props = defineProps<{  text: string;}>();</script><template>  <div>    <span>{{ props.text }}</span>    <ElButton @click="myDialog({ title: props.text })">提交（需确认）</ElButton>  </div></template>
```

对于`MyDialog`无需任何改变，保持原来的样子就可以了！

`useCommandComponent`真的做到了，**即保持原来组件的编写方式，又可以实现命令式调用**！

使用效果：

![](https://mmbiz.qpic.cn/mmbiz_jpg/bwG40XYiaOKn7JgYdd4W47qN3nJlpJG24V8TtfasLAmSkuWC8azR9fmbLicejVqTj9QEqnKoVzM3Nl4YSHhUJthQ/640?wx_fmt=other)Kapture 2023-07-07 at 23.44.25.gif

是不是感受到了莫名的舒适？🤨

不过别急😊，要想体验这种极致的舒适，你的`Dialog`还需要遵循两个约定！

两个约定
----

如果想要极致舒适的使用`useCommandComponent`，那么弹窗组件的编写就需要遵循一些约定（_**其实这些约定应该是弹窗组件的最佳实践**_）。

约定如下：

*   **弹窗组件的`props`需要有一个名为`visible`的属性**，用于驱动弹窗的打开和关闭。
    
*   **弹窗组件需要`emit`一个`close`事件**，用于弹窗关闭时处理命令式弹窗。
    

如果你的弹窗组件满足上面两个约定，那么就可以通过`useCommandComponent`极致舒适的使用了！！

> 这两项约定虽然不是强制的，但是这确实是最佳实践！不信你去翻所有的 UI 框看看他们的实现。我一直认为学习和生产中多学习优秀框架的实现思路很重要！

如果不遵循约定
-------

这时候有的同学可能会说：**哎嘿，我就不遵循这两项约定呢？我的弹窗就是要标新立异的不用`visible`属性来控制打开和关闭，我起名为`dialogVisible`呢？我的弹窗就是没有`close`事件呢？我的事件是具有业务意义的`submit`、`cancel`呢？**...

![](https://mmbiz.qpic.cn/mmbiz_jpg/bwG40XYiaOKn7JgYdd4W47qN3nJlpJG24NRWFBEqsQes4OOfCB82ibcGloFsjdOaGqOLMskCKL30Y6QcRPf0t6icA/640?wx_fmt=other)doutub_img.png

得得得，如果真的没有遵循上面的两个约定，依然可以舒适的使用`useCommandComponent`，只不过在我看来没那么极致舒适！虽然不是极致舒适，但也要比其他方案舒适的多！

如果你的弹窗真的没有遵循 “**两个约定**”，那么你可以试试这样做：

```
<script setup lang="ts">// ...const myDialog = useCommandComponent(MyDialog);const handleDialog = () => {  myDialog({     title: '父组件弹窗',     dialogVisible: true,     onSubmit: () => myDialog.close(),    onCancel: () => myDialog.close(),  });};</script><template>  <div>    <ElButton @click="handleDialog"> 打开弹窗 </ElButton>    <!--...-->  </div></template>
```

如上，只需要在调用`myDialog`函数时在`props`中将驱动弹窗的状态设置为`true`，在需要关闭弹窗的事件中调用`myDialog.close()`即可！

这样是不是看着虽然没有上面的极致舒适，但是也还是挺舒适的？

源码与实现
-----

### 实现思路

对于`useCommandComponent`的实现思路，依然是**命令式封装**。相比于上面的那两个实现方式，`useCommandComponent`是将组件作为参数传入，这样**保持组件的编写习惯不变**。并且`useCommandComponent`**遵循单一职责原则**，只做好组件的挂载和卸载工作，提供**足够的兼容性**。

> 其实`useCommandComponent`有点像`React`中的高阶组件的概念

### 源码

源码不长，也很好理解！在实现`useCommandComponent`的时候参考了 ElementPlus 的 MessageBox。

源码如下：

```
import { AppContext, Component, ComponentPublicInstance, createVNode, getCurrentInstance, render, VNode } from 'vue';export interface Options {  visible?: boolean;  onClose?: () => void;  appendTo?: HTMLElement | string;  [key: string]: unknown;}export interface CommandComponent {  (options: Options): VNode;  close: () => void;}const getAppendToElement = (props: Options): HTMLElement => {  let appendTo: HTMLElement | null = document.body;  if (props.appendTo) {    if (typeof props.appendTo === 'string') {      appendTo = document.querySelector<HTMLElement>(props.appendTo);    }    if (props.appendTo instanceof HTMLElement) {      appendTo = props.appendTo;    }    if (!(appendTo instanceof HTMLElement)) {      appendTo = document.body;    }  }  return appendTo;};const initInstance = <T extends Component>(  Component: T,  props: Options,  container: HTMLElement,  appContext: AppContext | null = null) => {  const vNode = createVNode(Component, props);  vNode.appContext = appContext;  render(vNode, container);  getAppendToElement(props).appendChild(container);  return vNode;};export const useCommandComponent = <T extends Component>(Component: T): CommandComponent => {  const appContext = getCurrentInstance()?.appContext;  // 补丁：Component中获取当前组件树的provides  if (appContext) {    const currentProvides = (getCurrentInstance() as any)?.provides;    Reflect.set(appContext, 'provides', {...appContext.provides, ...currentProvides});  }  const container = document.createElement('div');  const close = () => {    render(null, container);    container.parentNode?.removeChild(container);  };  const CommandComponent = (options: Options): VNode => {    if (!Reflect.has(options, 'visible')) {      options.visible = true;    }    if (typeof options.onClose !== 'function') {      options.onClose = close;    } else {      const originOnClose = options.onClose;      options.onClose = () => {        originOnClose();        close();      };    }    const vNode = initInstance<T>(Component, options, container, appContext);    const vm = vNode.component?.proxy as ComponentPublicInstance<Options>;    for (const prop in options) {      if (Reflect.has(options, prop) && !Reflect.has(vm.$props, prop)) {        vm[prop as keyof ComponentPublicInstance] = options[prop];      }    }    return vNode;  };  CommandComponent.close = close;  return CommandComponent;};export default useCommandComponent;
```

除了命令式的封装外，我加入了`const appContext = getCurrentInstance()?.appContext;`。这样做的目的是，传入的组件在这里其实已经独立于应用的 Vue 上下文了。为了让组件依然保持和调用方相同的 Vue 上下文，我这里加入了获取上下文的操作！

基于这个情况，在使用`useCommandComponent`时需要保证它在`setup`中被调用，而不是在某个点击事件的处理函数中哦~

源码补丁
----

非常感谢 @bluryar 关于命令式组件无法获取当前组件树的 injection 的指出！！🫰👍

![](https://mmbiz.qpic.cn/mmbiz_jpg/bwG40XYiaOKn7JgYdd4W47qN3nJlpJG24kxKDkbAl3EB38picqrKnc5rdwwuxzvcaIIdVlOOa2UUiauqp5qoVxqlw/640?wx_fmt=other)image.png

趁着热乎，我想到一个解决获取当前 injection 的解决办法。那就是将当前组件树的`provides`与`appContext.provides`合并，这样传入的弹窗组件就可以顺利的获取到`app`和当前组件树的`provides`了！

![](https://mmbiz.qpic.cn/mmbiz_jpg/bwG40XYiaOKn7JgYdd4W47qN3nJlpJG24oRDe6ibLicHLDtppmku7o6fJo2pk2oeKJIpfXRKRc8FKyT3j7SpZLZMQ/640?wx_fmt=other)image.png

最后
--

如果你觉得`useCommandComponent`对你在开发中有所帮助，麻烦多点赞评论收藏😊

如果`useCommandComponent`对你实现某些业务有所启发，麻烦多点赞评论收藏😊

如果...，麻烦多点赞评论收藏😊

_如果大家有其他弹窗方案，欢迎留言交流哦！_

关于本文  

作者：youth 君

https://juejin.cn/post/7253062314306322491

最后
--

欢迎关注「三分钟学前端」

号内回复：  

「网络」，自动获取三分钟学前端网络篇小书（90 + 页）

「JS」，自动获取三分钟学前端 JS 篇小书（120 + 页）

「算法」，自动获取 github 2.9k+ 的前端算法小书

「面试」，自动获取 github 23.2k+ 的前端面试小书

「简历」，自动获取程序员系列的 `120` 套模版

》》面试官也在看的前端面试资料《《  

“在看和转发” 就是最大的支持