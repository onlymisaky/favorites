> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/a4tCBP1VPTZSaUAz7VPddA)

前言
--

2016 年起，低代码概念开始在国内兴起，当年该行业总共有 10 起融资事件，之后低代码行业融资笔数**整体呈上升趋势**，并在 2020 年增长至 14 起，其中**亿元以上融资有 13 起**。

![](https://mmbiz.qpic.cn/mmbiz_png/e4YNLngAJ84ibSVmeQBO6KvJLlGx8evyTOIneKbdODQWr12DN5Mlm3WTHFX7y2KEDzd3UZKQJHG8JZyibG2qumZg/640?wx_fmt=png)image.png![](https://mmbiz.qpic.cn/mmbiz_png/e4YNLngAJ84ibSVmeQBO6KvJLlGx8evyTjiaph4wfFVqzE9AFJVQuaqDibD598biam60P3Znvh5ibdlxCEeh1QffL2w/640?wx_fmt=png)image.png

从融资轮次分布上看，2016 年天使轮、种子轮、A 轮和 B 轮融资占比为 50%，而到 2020 年，其占比则达到 78.6%，相比 2016 年上升了 28.6%。这可以说明**低代码市场整体仍处于发展初期** 。

2021 年很多公司，不管大小，都开始开发低代码平台。低代码即无需代码或只需要通过少量代码，通过 “拖拽” 的方式即可快速生成应用程序。那么对于开发者而言，我们应该如何入手开发呢？

“拖拽” 实现
-------

关键词就是 “拖拽”，其实“拖拽” 的交互方式早在 Jquery 时代就有，关于拖拽在前端实现主要分为 2 种

1.  是以 jquery-ui[1] 为代表的 draggable 和  Droppable，其原理是通过鼠标事件 mousedown、mousemove、mouseup 或者 触摸事件 touchstart、touchmove、touchend，记录开始位置和结束位置、以达到拖拽传递数据的效果。
    
2.  是通过  HTML5 Drag and Drop API[2]
    

下面是简单实现代码

```
<script>function dragstart_handler(ev) { // A将目标元素的 id 添加到数据传输对象 ev.dataTransfer.setData("application/my-app", ev.target.id); ev.dataTransfer.effectAllowed = "move";}function dragover_handler(ev) { ev.preventDefault(); ev.dataTransfer.dropEffect = "move"}function drop_handler(ev) { ev.preventDefault(); // 获取目标的 id 并将已移动的元素添加到目标的 DOM 中 const data = ev.dataTransfer.getData("application/my-app"); ev.target.appendChild(document.getElementById(data));}</script><p id="p1" draggable="true" ondragstart="dragstart_handler(event)">This element is draggable.</p><div id="target" ondrop="drop_handler(event)" ondragover="dragover_handler(event)">Drop Zone</div>
```

更高级的功能是：Drop API 还支持直接从系统桌面直接拖拽文件到浏览器中，使用 DataTransfer.files [3] 实现拖拽上传。

React-dnd
---------

React DnD[4] 是 React 和 Redux 核心作者 Dan Abramov 创造的一组 React 工具库，可以帮助您构建复杂的拖放接口，同时保持组件的解耦性。例如，React DnD 没有提供一个排序组件，相反，它为您提供了所需的工具。

### 官方 demo

一起来看下简单实现

![](https://mmbiz.qpic.cn/mmbiz_gif/e4YNLngAJ84ibSVmeQBO6KvJLlGx8evyTgHV2uiauxbkwCojcP6c66cibeDwqO3oCkTKnSo06JEch8WAXmX0WP3GA/640?wx_fmt=gif)react-dnd-demo.gif

首先需要在项目根节点设置拖拽实现方式

```
import { render } from 'react-dom'import Example from './example'import { DndProvider } from 'react-dnd'import { HTML5Backend } from 'react-dnd-html5-backend'function App() {    return (      <div class>        <DndProvider backend={HTML5Backend}>          <Example />        </DndProvider>      </div>    )}
```

如果是手机端就要使用 `react-dnd-touch-backend`，因为 `react-dnd-html5-backend`不支持触摸。

### DragBox 的实现

```
import { useDrag } from 'react-dnd';import { ItemTypes } from './ItemTypes';const style = {    cursor: 'move'};export const Box = function Box({ name }) {    const [{ isDragging }, drag] = useDrag(() => ({        type: ItemTypes.BOX,        item: { name },        end: (item, monitor) => {            const dropResult = monitor.getDropResult();            if (item && dropResult) {                alert(`You dropped ${item.name} into ${dropResult.name}!`);            }        },        collect: (monitor) => ({            isDragging: monitor.isDragging(),            handlerId: monitor.getHandlerId(),        }),    }));    const opacity = isDragging ? 0.4 : 1;    return (<div ref={drag} style={{ ...style, opacity }}>{name}</div>);};
```

*   这里的 `type` 就是一个字符串，用于约束 “拖” 和“放”组件的关系，如果字符串不一致就无法回调事件，主要是为了避免页面中多个拖放的实例
    
*   `item` 就是拖动时候传递的数据
    
*   `end` 是拖放结束后的回调
    
*   `collect` 用于获得拖动的状态，可以设置样式
    

### DropContainer 实现

```
import { useDrop } from 'react-dnd';import { ItemTypes } from './ItemTypes';const style = {    ...};export const DropContainer = () => {    const [{ canDrop, isOver }, drop] = useDrop(() => ({        accept: ItemTypes.BOX,        drop: () => ({ name: 'Dustbin' }),        collect: (monitor) => ({            isOver: monitor.isOver(),            canDrop: monitor.canDrop(),        }),    }));    const isActive = canDrop && isOver;    let backgroundColor = '#222';    if (isActive) {        backgroundColor = 'darkgreen';    }    else if (canDrop) {        backgroundColor = 'darkkhaki';    }    return (<div ref={drop} role={'Dustbin'} style={{ ...style, backgroundColor }}>   {isActive ? 'Release to drop' : 'Drag a box here'}        </div>);};
```

*   `type` 与拖动的 type 相同
    
*   `drop` 函数返回放置节点的数据，返回数据给 drag end
    
*   `collect` 用于获得拖动状态的状态，可以设置样式
    

低代码实现
-----

回到我们的低代码主题，我们来一起看下**钉钉宜搭**的页面设计

![](https://mmbiz.qpic.cn/mmbiz_png/e4YNLngAJ84ibSVmeQBO6KvJLlGx8evyTXLNcewpOPShKQu9CUnseI3yxOo8XmrK6buaN01uLiby5PVh8QRTaLYA/640?wx_fmt=png)宜搭. png

主要分为 3 个区域：左侧组件区、中间设计区、右侧编辑区。如果只看左侧组件区和中间的设计区是否跟 react-dnd 官方的 demo 很相似呢？

### 定义 JSON

接下来我们要：

*   定义可拖动的组件类型
    
*   每个组件类型对应的渲染组件
    
*   每个组件的属性设置
    

先来定义几个可拖动的字段吧，比如最基本的数据类型，div、h1、 p 标签都是一个组件，那就我先定义出以下字段类型，

```
const fields= [  {    type: 'div',    props: {      className: '',    },  },  {    type: 'h1',    props: {      className: 'text-3xl',      children: 'H1',    },  },  {    type: 'p',    props: {      className: '',      children: '段落111',    },  }  ...]
```

针对这些拖动字段，需要有渲染的组件，而针对 div、h1、 p 这些就是标签本身，但是我们需要用 react 封装成组件

```
const previewFields = {  div: (props: any) => <div {...props} />,  h1: (props: any) => <h1 {...props} />,  p: (props: any) => <p {...props} />,  ...}
```

右侧边界区域的可配置字段

```
const editAreaFields = {    div: [      {        key: 'className',        name: '样式',        type: 'Text',      },    ],    h1: [      {        key: 'children',        name: '内容',        type: 'Text',      },    ],    p: [      {        key: 'children',        name: '内容',        type: 'Text',      },      {        key: 'className',        name: '样式',        type: 'Text',      },    ],    ...}
```

上述字段代表 div 只能设置 className、h1 只能设置内容、p 标签既能设置内容，也可以设置 className。右侧区域的也可以配置不同的组件，比如 Text 就渲染成最简单的 Input。

### 嵌套拖动

基本组件一般可以嵌套的，比如我现在想要拖动出下图的页面效果

![](https://mmbiz.qpic.cn/mmbiz_png/e4YNLngAJ84ibSVmeQBO6KvJLlGx8evyTP8oL7qynC67CMB0Tia4Moia8hjVmLib9cFO83XyBu6YyHsOlhD2kZDDLA/640?wx_fmt=png)image.png

实际上我需要生成 JSON 树，然后根据 JSON 树渲染出页面。

![](https://mmbiz.qpic.cn/mmbiz_png/e4YNLngAJ84ibSVmeQBO6KvJLlGx8evyTlxTctP8B0DQBVZUc8HbnnLkjZjd1zKwPsW3JXntEvS8ZE8Wib9dAhhg/640?wx_fmt=png)image.png

当每次拖动的时候，可以生成一个 `uuid`，然后使用**深度优先遍历树数据**从根节点到叶子节点的由上至下的深度优先遍历树数据。在放置的组件，然后操作数据

```
export const traverse = <T extends { children?: T[] }>(  data: T,  fn: (param: T) => boolean) => {  if (fn(data) === false) {    return false  }  if (data && data.children) {    for (let i = data.children.length - 1; i >= 0; i--) {      if (!traverse(data.children[i], fn)) return false    }  }  return true}
```

### 丰富组件

还可以使用开源组件，集成到低代码中，我们只需要定义右侧编辑区域和左侧字段数据，比如现在集成 @ant-design/charts[5]

以柱状图为例，我们定义下拖动的字段数据

```
{type: 'Column',module: '@ant-design/charts',h: 102,displayName: '柱状图组件',props: {  xField: 'name',  yField: 'value',  data: [    {      name: 'A',      value: 20,    },    {      name: 'B',      value: 60,    },    {      name: 'C',      value: 20,    },  ],},
```

渲染 直接可以使用`import { Column } from '@ant-design/charts';`

props 增加默认数据就可以直接渲染出漂亮的柱状图了。

![](https://mmbiz.qpic.cn/mmbiz_png/e4YNLngAJ84ibSVmeQBO6KvJLlGx8evyTjmia5nW0pr1zVbia81Um0ZcxEG1kNaL0mMSWtMnLJEcacdibaicZk0ic3gw/640?wx_fmt=png)image.png

然后增加一个数据编辑的组件，最后的效果如下图

![](https://mmbiz.qpic.cn/mmbiz_png/e4YNLngAJ84ibSVmeQBO6KvJLlGx8evyTuhArpDuTNlVtRfP8wozo3ialic12CPwOrsFOtrAA4ORuHgLt3E1jztCQ/640?wx_fmt=png)image.png

### 生成代码

有了 JSON 树，就可以生成想要的视图代码。组件`类型 + props + 子组件`的数据， 每个节点的代码就是这段字符串拼接而成。

`<${sub.type}${props}>${children}</${sub.type}>`

而 props 也可以拼接成 `key=value` 的形式。遍历数据要 从叶子节点到根节点的由下而上的深度优先遍历树数据。

### 代码格式化

我们可以使用 prettier 来格式化代码，下面代码是将格式化代码的逻辑放到一个 `webWork` 中。

```
importScripts('https://unpkg.com/prettier@2.2.1/standalone.js');importScripts('https://unpkg.com/prettier@2.2.1/parser-babel.js');self.addEventListener(  'message',  function (e) {    self.postMessage(      prettier.format(e.data, {        parser: 'babel',        plugins: prettierPlugins,      })    );  },  false);
```

预览
--

代码有了，接下来就可以渲染页面进行预览了，对于预览，显然是使用`iframe`，`iframe`除了`src`属性外，`HTML5`还新增了一个属性`srcdoc`，用来渲染一段`HTML`代码到`iframe`里

```
iframeRef.value.contentWindow.document.write(htmlStr)
```

效果
--

拖拽一个表格 和一个柱状图

![](https://mmbiz.qpic.cn/mmbiz_png/e4YNLngAJ84ibSVmeQBO6KvJLlGx8evyTxwM0NY2ia9jm2Cr8jCD8UxMNW37brtjVmibrDzHHU30wbPQQ6M7via3WA/640?wx_fmt=png)image.png

查看代码

![](https://mmbiz.qpic.cn/mmbiz_png/e4YNLngAJ84ibSVmeQBO6KvJLlGx8evyTkegylPOdQ5hJmficI1jUUvibIYB8XfRYicUgezvPv7rDkU4oZfqvzqTzQ/640?wx_fmt=png)image.png

最后附上 github 和预览地址

*   📕 仓库地址: github.com[6]
    
*   📗 预览地址: low-code.runjs.cool[7]
    

小结
--

本地记录一个简易低代码的实现方式，简单概括为 `拖拽` -> `JSON Tree`——> `页面`

但想要真正生产可用还有很长的路要走，比如

*   组件数据绑定和联动
    
*   随着组件数量的增加需要将组件服务化，动态部署
    
*   组件开发者的成本与维护者的上手成本权衡
    
*   组件模板化
    
*   页面部署投产等
    

以上任意一点都可能投入较高的成本，个人认为目前低代码，成本比较低且可以投产的方式有

1、类似 mall-cook[8] H5 搭建

![](https://mmbiz.qpic.cn/mmbiz_png/e4YNLngAJ84ibSVmeQBO6KvJLlGx8evyTmGtAtAwOIY3B3TPDIo08ftNHpUe9FNtxfISbqyViccFp859j2XyodDQ/640?wx_fmt=png)image.png

2、类似 json-editor[9] 表单搭建

![](https://mmbiz.qpic.cn/mmbiz_png/e4YNLngAJ84ibSVmeQBO6KvJLlGx8evyTZM1L5gnRdbP6Z2FzCVSnmhDxyYbC1mowHY0eNibPKw9NicpzIoE8JUZQ/640?wx_fmt=png)image.png

 本文对低代码搭建的思考和讨论可能还不够完整, 欢迎讨论和补充。 希望这篇文章对大家有所帮助，也可以参考我往期的文章或者在评论区交流你的想法和心得，欢迎一起探索前端。

The End

*   点个 **「在看」**，让更多的人也能看到这篇文章；
    
*   关注公众号 **「前端巅峰」** ，我们持续分享 Javascript 热门框架和前端工程师进阶内容；