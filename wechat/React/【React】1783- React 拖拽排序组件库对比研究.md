> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/lLum2AQNv_e0DoXZGRwFhA)

![](https://mmbiz.qpic.cn/sz_mmbiz_png/dy9CXeZLlCUPLRe8KViagAIoPtpcNgAW4QIUEMemT9JCm3GySj9TIrmUz2TreLNuDk0yH0WAk7G2yve5PZkkVCA/640?wx_fmt=png)

> 作者：青火_
> 
> https://juejin.cn/post/7062625911312646175

一、用法简介
------

基于 react 的拖拽功能，有这么几个比较流行的库：

1.  react-dnd[1]
    
2.  react-beautiful-dnd[2]
    
3.  dnd-kit[3]
    
4.  react-sortable-hoc[4]
    

### React-dnd

**（一）基本概念**

*   **Backend**：后端主要用来抹平浏览器差异，处理 DOM 事件，同时把 DOM 事件转换为 React DnD 内部的 redux action，你可以使用 HTML5 拖拽后端，也可以自定义 touch、mouse 事件模拟的后端实现
    
*   **Item**：用一个数据对象来描述当前被拖拽的元素，例如 {cardId: 42}
    
*   **Type**：类似于 redux 里面的 actions types 枚举常量，定义了应用程序里支持的拖拽类型
    
*   **Monitor：** 拖放本质上是有状态的。要么正在进行拖动操作，要么不在。要么有当前类型和当前项目，要么没有，React DnD 通过 Monitor 来存储这些状态并且提供查询
    
*   **Connector**：连接组件和 Backend ，可以让 Backend 获取到 DOM
    
*   **DragSource**：这是一个高阶组件，使用它包裹住你的组件使它变为拖拽源
    
*   **DropTarget**：这是一个高阶组件，使用它包裹住你的组件使它变为放置源
    
*   **DragDropContext**：包裹根组件，提供拖拽的上下文环境
    

**（二）简单 demo**

![](https://mmbiz.qpic.cn/mmbiz_jpg/zPh0erYjkib13kuFXDVa8zXMwlcliaak9AQq1YqgIAqDHCJxDcQnoKVXyM6L2ndOeVPJQq02LKnxog9QbyLbroQg/640?wx_fmt=other)

codesandbox.io/s/github/re…[5]

### react-beautiful-dnd

**（一）基本概念**

![](https://mmbiz.qpic.cn/mmbiz_jpg/zPh0erYjkib13kuFXDVa8zXMwlcliaak9AAqoEXJaonibL0ZBxcgewXwcKj735MIg7vAeXOluz0IN3aiaqorCiayh1w/640?wx_fmt=other)![](https://mmbiz.qpic.cn/mmbiz_jpg/zPh0erYjkib13kuFXDVa8zXMwlcliaak9A0AlVHicMVcFpEgRQibaGhZBbgrrzqLaSWIQlcoX8PYEYER7j7uDQlfQg/640?wx_fmt=other)

主要包含三个组件.

1.  DragDropContext : 用于包装拖拽根组件，Draggable 和 Droppable 都需要包裹在 DragDropContext 内
    
2.  Draggable 用于包装你需要拖动的组件，使组件能够被拖拽（make it draggable）
    
3.  Droppable 用于包装接收拖拽元素的组件，使组件能够放置（dropped on it）
    

**（二）简单 demo**

![](https://mmbiz.qpic.cn/mmbiz_jpg/zPh0erYjkib13kuFXDVa8zXMwlcliaak9AYZh5Xw2cM9PHwP3sHF6oTS47fZ1icJC89BbZXDcYguxLWfa3JYguuCA/640?wx_fmt=other)![](https://mmbiz.qpic.cn/mmbiz_jpg/zPh0erYjkib13kuFXDVa8zXMwlcliaak9A0Anib39a6xFUxtsHYPueeia5g53AGuswy5KMPDJpt1cVPCGfmqdGib3mg/640?wx_fmt=other)

codesandbox.io/s/k260nyxq9…[6]

### dnd-kit

**（一）、基本概念**

![](https://mmbiz.qpic.cn/mmbiz_jpg/zPh0erYjkib13kuFXDVa8zXMwlcliaak9AzkPbZnic4dlMFmKfibP1fz5vXVboibMW4BIurqSCNEftEBHDmich6zTtqg/640?wx_fmt=other)![](https://mmbiz.qpic.cn/mmbiz_jpg/zPh0erYjkib13kuFXDVa8zXMwlcliaak9AWiaw7ee5ApADtXicRYsx4fZTryCEfMFfhMBXS0tSQcD9TCguDIA6QQ7w/640?wx_fmt=other)

1、DndContext 用于包装拖拽根组件，Draggable 和 Droppable 都需要包裹在 DndContext 内  
2、Droppable 用于包装接收拖拽元素的组件，使组件能够放置  
3、Draggable 用于包装你需要拖动的组件，使组件能够被拖拽  
4、Sensors 用于检测不同的输入方法，以启动拖动操作、响应移动以及结束或取消操作，内置传感器有：

*   指针
    
*   鼠标
    
*   触摸
    
*   键盘
    

5、Modifiers 可让您动态修改传感器检测到的运动坐标。它们可用于广泛的用例，例如：

*   将运动限制在单个轴上
    
*   限制可拖动节点容器的边界矩形的运动
    
*   限制可拖动节点的滚动容器边界矩形的运动
    
*   施加阻力或夹紧运动
    

**（二）、简单 demo**

![](https://mmbiz.qpic.cn/mmbiz_jpg/zPh0erYjkib13kuFXDVa8zXMwlcliaak9Ab3TyklMZSBa5IsxmgQky9DNaomPBCJa7WMyRryRpjiaKMf2e1B09BwQ/640?wx_fmt=other)

5fc05e08a4a65d0021ae0bf2-ffprtowwny.chromatic.com/iframe.html…[7]

### react-sortable-hoc

**（一）、基本概念**  
1、SortableContainer 拖拽排序的容器  
2、SortableElement 拖拽排序的元素

**（二）、简单 demo**

![](https://mmbiz.qpic.cn/mmbiz_jpg/zPh0erYjkib13kuFXDVa8zXMwlcliaak9ASca4rNe9Rq0MQ3adS9bO6WVx5oECdrWz96hG9z2QftZJF2LWvVBmWA/640?wx_fmt=other)

codesandbox.io/s/react-sor…[8]

三、兼容 antd 的 table
-----------------

如何配合 antd 的 table 组件进行使用？

![](https://mmbiz.qpic.cn/mmbiz_jpg/zPh0erYjkib13kuFXDVa8zXMwlcliaak9A11ywIUZSzXmJpK2m2libcH1RFnL0X3iaX05ATHcxRFpJtSbOzqNsDvjw/640?wx_fmt=other)

**react-dnd** 使用 antd-table :codesandbox.io/s/tuo-zhuai…[9]

![](https://mmbiz.qpic.cn/mmbiz_jpg/zPh0erYjkib13kuFXDVa8zXMwlcliaak9ALWYb77TICjcmwLKMyARgoQibsPt1rjucNtLXLIak1lYbI1qHqsXtfyQ/640?wx_fmt=other)

**react-sortable-hoc** 使用 antd-table:codesandbox.io/s/tuo-zhuai…[10]

![](https://mmbiz.qpic.cn/mmbiz_jpg/zPh0erYjkib13kuFXDVa8zXMwlcliaak9A19w8xnvIJibdy0uSXjsiaC1MYqiciauaZ8zXm9LqQoSYY6yR4oImEJXXJw/640?wx_fmt=other)

**react-beautiful-dnd-antd-table**：codesandbox.io/s/react-bea…[11]

**dnd-kit**：stackblitz.com/edit/react-…[12]（该 demo 无法运行，github.com/clauderic/d…[13] 根据这个 issue 说是 antd-design 自身的原因，

![](https://mmbiz.qpic.cn/mmbiz_jpg/zPh0erYjkib13kuFXDVa8zXMwlcliaak9AJ1hmr4prQHrrHWsfgdFzfjO9icd21ygu6UozU7JMahFcIO8yBrWvDBg/640?wx_fmt=other)

在底层增强了表格组件）

四、树兼容
-----

antd 自带的 tree 拖拽排序：  
codepen.io/huxinmin/em…[14]

**自带的 tree 拖拽缺点是**

1.  无法实现动态实时拖拽更换位置效果，必须拖拽结束后才发生位置变化
    
2.  需要修改大量的自带的样式
    

可以简单地把树看做是互相嵌套的列表。

![](https://mmbiz.qpic.cn/mmbiz_jpg/zPh0erYjkib13kuFXDVa8zXMwlcliaak9AHoib7wrarMRmZaGibWn0bYqZd00yT5ViaFzpea9ugF0d0dS5rz9FeWLfg/640?wx_fmt=other)

**react-dnd**：codesandbox.io/s/crazy-hoo…[15]

![](https://mmbiz.qpic.cn/mmbiz_jpg/zPh0erYjkib13kuFXDVa8zXMwlcliaak9AdbQOmFbLpYNths2yGGt3Lbkbpx94GDlVOXmOfsiaMnY3hNICtOgxuVQ/640?wx_fmt=other)

**react-sortable-hoc：**codesandbox.io/embed/react…[16]

![](https://mmbiz.qpic.cn/mmbiz_jpg/zPh0erYjkib13kuFXDVa8zXMwlcliaak9A5KCFdUzoPnEiaYBqPP1rJUskJXRKhhsQwQlfibaV99Lokw0yKfM4ZjGQ/640?wx_fmt=other)

**react-beautiful-dnd-antd-table:**codesandbox.io/embed/react…[17]

![](https://mmbiz.qpic.cn/mmbiz_jpg/zPh0erYjkib13kuFXDVa8zXMwlcliaak9AQQa6EgoWvsrOrzmCugNjPnp4Jq4LX7nYNuSnyBGn6lCKb7vqANOamQ/640?wx_fmt=other)

**dnd-kit：**codesandbox.io/embed/react…[18]

五、移动端兼容
-------

![](https://mmbiz.qpic.cn/mmbiz_jpg/zPh0erYjkib13kuFXDVa8zXMwlcliaak9AOSKB9fC91tlY04bKwoMJrkoXn3icQl1QXmbwPq2718iaicDIlNyRIV8Ig/640?wx_fmt=other)

**react-dnd**:codesandbox.io/embed/react…[19]

![](https://mmbiz.qpic.cn/mmbiz_jpg/zPh0erYjkib13kuFXDVa8zXMwlcliaak9A19w8xnvIJibdy0uSXjsiaC1MYqiciauaZ8zXm9LqQoSYY6yR4oImEJXXJw/640?wx_fmt=other)

**react-beautiful-dnd-antd-table**：codesandbox.io/s/react-bea…[20]

![](https://mmbiz.qpic.cn/mmbiz_jpg/zPh0erYjkib13kuFXDVa8zXMwlcliaak9ALWYb77TICjcmwLKMyARgoQibsPt1rjucNtLXLIak1lYbI1qHqsXtfyQ/640?wx_fmt=other)

**react-sortable-hoc** 使用 antd-table:codesandbox.io/s/tuo-zhuai…[21]

![](https://mmbiz.qpic.cn/mmbiz_jpg/zPh0erYjkib13kuFXDVa8zXMwlcliaak9AibibQVsJIXn4MOKOs8v9ppMHfzniaJEL8oW9bJFfIpxbiaIz2QKpPxOPvw/640?wx_fmt=other)

**dnd-kit:**5fc05e08a4a65d0021ae0bf2-hbqxtqukzi.chromatic.com/iframe.html…[22]

六、无限滚动
------

最佳的方法就是使用 virtual-list，不过这几个库的支持情况也不一样。

![](https://mmbiz.qpic.cn/mmbiz_jpg/zPh0erYjkib13kuFXDVa8zXMwlcliaak9AX5icicZOia7F3OFVaJ6AYl482Rbib3ibW7wWELtscIjRdsZQrItaEK9DHUg/640?wx_fmt=other)

**react-dnd:**codesandbox.io/embed/react…[23]

使用 requestAnimationFrame 进行性能优化，也可以配合其他的虚拟 list 库进行使用。

![](https://mmbiz.qpic.cn/mmbiz_jpg/zPh0erYjkib13kuFXDVa8zXMwlcliaak9AfEbJ0EKrDR3BRnZt61ZBf52qniaFNEAv5QX878lNC3vLK14PibEDJC2A/640?wx_fmt=other)

**dnd-kit:**5fc05e08a4a65d0021ae0bf2-hbqxtqukzi.chromatic.com/iframe.html…[24]

这个 demo 使用了 react-tiny-virtual-list[25] 库。

![](https://mmbiz.qpic.cn/mmbiz_jpg/zPh0erYjkib13kuFXDVa8zXMwlcliaak9AzycSE7uWoah0TCxwRatf9QBmdeW8cA7dWb8z47jDRibVpa7ibPpCibSOQ/640?wx_fmt=other)

**react-sortable-hoc:**clauderic.github.io/react-sorta…[26]

使用了 react-virtualized

![](https://mmbiz.qpic.cn/mmbiz_jpg/zPh0erYjkib13kuFXDVa8zXMwlcliaak9Are1CZAQuZ0h8RiceWKZiaeuDx3RxS7vVrL9kSDt6An3uqlpV7sLqmy9A/640?wx_fmt=other)

**react-beautifule-dnd:**react-beautiful-dnd.netlify.app/iframe.html…[27]

使用了 react-virtualized。

七、总结对比
------

*   react-dnd[28]
    
*   文档齐全
    
*   github star 星数 16.4k
    
*   维护更新良好，最近一月内有更新维护
    
*   学习成本较高
    
*   功能中等
    
*   移动端兼容情况，良好
    
*   示例数量中等
    
*   概念较多，使用复杂
    
*   组件间能解耦
    
*   react-beautiful-dnd[29]
    
*   文档齐全
    
*   github star 星数 24.8k
    
*   维护更新良好，最近三月内有更新维护
    
*   学习成本较高
    
*   使用易度中等
    
*   功能丰富
    
*   移动端兼容情况，优秀
    
*   示例数量丰富
    
*   是为垂直和水平列表专门构建的更高级别的抽象，没有提供 react-dnd 提供的广泛功能
    
*   外观漂亮，可访问性好，物理感知让人感觉更真实的在移动物体
    
*   开发理念上是拖拽，不支持 copy/clone
    
*   dnd-kit[30]
    
*   文档齐全
    
*   github star 星数 2.8k
    
*   维护更新良好，最近一月内有更新维护
    
*   学习成本中等
    
*   使用易度中等
    
*   功能中等
    
*   移动端兼容情况，中等
    
*   示例数量丰富
    
*   未看到 copy/clone
    
*   react-sortable-hoc[31]
    
*   文档较少
    
*   github star 星数 9.5k
    
*   维护更新良好，最近三月内有更新维护
    
*   学习成本较低
    
*   使用易度较低
    
*   功能简单
    
*   移动端兼容情况，中等
    
*   示例数量中等
    
*   不支持拖拽到另一个容器中
    
*   未看到 copy/clone
    
*   主要集中于排序功能，其余拖拽功能不丰富
    

如果是要结合 antd 的 table 使用，最简单的组件是 react-sortable-hoc，如果是无限滚动 react-sortable-hoc 示例虽然多，但是源码很少，可以考虑使用 react-beautiful-dnd。如果是树形拖拽，要求不高的情况可以使用 antd 自带的 tree，要求高点可以使用 react-beautiful-dnd。兼容移动端，可以考虑使用 react-sortable-hoc 或者 react-beautiful-dnd。

八、如何自己封装一个简单的拖拽组件
-----------------

### 一、HTML5 拖放 API

首先，为了使元素可以拖动，需要设置 draggable 属性：

```
<img draggable="true">
```

然后有这么几个拖拽处理的函数：

1.  ondrag 拖放进行中
    
2.  ondragend/ondragstart 开始拖放和结束拖放
    
3.  ondragover 当元素或选中的文本被拖到一个目标目标上（每 100 毫秒触发一次）。
    
4.  ondragenter/ondragleave 源对象开始进入 / 离开目标对象范围内
    
5.  ondrop 源对象被拖放到目标对象上
    

数据的传输，使用 event.dataTransfer，它有如下这些 api：

*   setData: 添加拖拽数据，这个方法接收两个参数，第一个参数是数据类型（可自定义），第二个参数是对应的数据
    
*   getData: 反向操作，获取数据，只接收一个参数，即数据类型
    
*   clearData: 清除数据
    
*   setDragImage: 可自定义拖放过程中鼠标旁边的图像
    
*   effectAllowed: 属性指定拖放操作所允许的一个效果。_copy_ 操作用于指示被拖动的数据将从当前位置复制到放置位置。_move 操作用于指定被拖动的数据将被移动。link_操作用于指示将在源和放置位置之间创建某种形式的关系或连接。
    

### 二、功能与架构设计

1.  使用 react-hooks
    
2.  拖拽对象 drag 组件，拖放对象 drop 组件，拖拽上下文 dndContext
    
3.  支持移动端
    
4.  支持排序
    

### 三、代码

Drag 组件使用：

```
<Drag index={1} id='1'>  <div>被包裹的可以拖拽的组件</div></Drag>
```

Drag 组件实现：

```
import { FC } from "react";interface DragProps {  index: number;  id: string | number;}const Drag: FC<DragProps> = (props) => {  const startDrag = (ev) => {    // 传输数据    ev.dataTransfer.setData("index", props.index);    ev.dataTransfer.setData("id", props.id);  };  return (    <div draggable onDragStart={startDrag}>      {props.children}    </div>  );};export default Drag;
```

Drop 组件使用：

```
<Drop> <Drag index={1} id='1'>   <div>被包裹的可以拖拽的组件</div> </Drag></Drop>
```

Drop 组件实现：

```
import { FC, useContext } from "react";
import { Context } from "./DndContext";

const Drop: FC = (props) => {
  const { onDragOver, onDragEnd } = useContext(Context);
  const dragOver = (ev) => {
    ev.preventDefault();
    if (onDragOver) onDragOver();
  };

  const drop = (ev) => {
    // 获取数据
    const oldIndex = ev.dataTransfer.getData("index");
    // 获取拖拽结束时的Y轴坐标
    const Y = ev.clientY;
    // 简便计算，设定高度为20
    // 我这里很偷懒，实际计算情况很复杂
		//一般有两种实现思路，一种就是根据位置计算，另外一种就是给拖拽源设置可放置，然后获取
    const height = 20;
    const newIndex = Math.floor(Y / height);

    if (oldIndex) {
      if (onDragEnd) onDragEnd(Number(oldIndex), newIndex);
    }
  };

  return (
    <div onDragOver={dragOver} onDrop={drop}>
      {props.children}
    </div>
  );
};

export default Drop;
```

DndContext 组件使用：

```
<DndContext        onDragEnd={(oldIndex, newIndex) => {          setData(arrayMove(data, oldIndex, newIndex));        }}        onDragOver={() => {}}      >        <Drop>          {data.map((i, index) => (            <Drag key={i.id} id={i.id} index={index}>              <div class>{i.text}</div>            </Drag>          ))}        </Drop>      </DndContext>
```

DndContext 组件实现：

```
import { createContext, FC } from "react";export interface TContext {  onDragOver: () => void;  onDragEnd: (oldIndex: number, newIndex: number) => void;}const Context = createContext<TContext>({} as TContext);const DndContext: FC<TContext> = (props) => {  return (    <Context.Provider      value={{        onDragEnd: (oldIndex, newIndex) => {          props.onDragEnd(oldIndex, newIndex);        },        onDragOver: () => {          props.onDragOver();        }      }}    >      {props.children}    </Context.Provider>  );};export { Context };export default DndContext;
```

如果需要处理移动端的兼容性，可以使用如下库：  
github.com/timruffles/…[32]

### 四、优化空间

1.  拖拽结束，所在位置计算
    
2.  拖拽过程中实时交换位置
    
3.  性能优化
    
4.  异常处理等
    
5.  拖拽过程样式
    
6.  拖拽方向，x 轴和 Y 轴
    
7.  等等
    

### 五、在线代码

具体在线代码示例：codesandbox.io/embed/react…[33]

![](https://mmbiz.qpic.cn/mmbiz_jpg/zPh0erYjkib13kuFXDVa8zXMwlcliaak9AG9FknqM8JdcibR9cUGlwdzA1CEicTGaibU0ThmeRDOFIaFFmibK9MAcBUg/640?wx_fmt=other)

### 参考资料

向下滑动查看

[1]

github.com/react-dnd/react-dnd: https://link.juejin.cn?target=github.com%2Freact-dnd%2Freact-dnd

[2]

github.com/atlassian/react-beautiful-dnd: https://link.juejin.cn?target=github.com%2Fatlassian%2Freact-beautiful-dnd

[3]

github.com/clauderic/dnd-kit: https://link.juejin.cn?target=github.com%2Fclauderic%2Fdnd-kit

[4]

github.com/clauderic/react-sortable-hoc: https://link.juejin.cn?target=github.com%2Fclauderic%2Freact-sortable-hoc

[5]

codesandbox.io/s/github/react-dnd/react-dnd/tree/gh-pages/examples_hooks_ts/04-sortable/simple%3Ffrom-embed%3D%26file%3D/src/Container.tsx: https://link.juejin.cn?target=codesandbox.io%2Fs%2Fgithub%2Freact-dnd%2Freact-dnd%2Ftree%2Fgh-pages%2Fexamples_hooks_ts%2F04-sortable%2Fsimple%253Ffrom-embed%253D%2526file%253D%2Fsrc%2FContainer.tsx

[6]

codesandbox.io/s/k260nyxq9v: https://link.juejin.cn?target=codesandbox.io%2Fs%2Fk260nyxq9v

[7]

5fc05e08a4a65d0021ae0bf2-ffprtowwny.chromatic.com/iframe.html%3Fid%3Dpresets-sortable-vertical--basic-setup%26viewMode%3Dstory: https://link.juejin.cn?target=5fc05e08a4a65d0021ae0bf2-ffprtowwny.chromatic.com%2Fiframe.html%253Fid%253Dpresets-sortable-vertical--basic-setup%2526viewMode%253Dstory

[8]

codesandbox.io/s/react-sortable-hoc-starter-o104x95y86: https://link.juejin.cn?target=codesandbox.io%2Fs%2Freact-sortable-hoc-starter-o104x95y86

[9]

codesandbox.io/s/tuo-zhuai-pai-xu-antd-4-17-0-alpha-0-forked-tnu3u%3Ffile%3D/row.js: https://link.juejin.cn?target=codesandbox.io%2Fs%2Ftuo-zhuai-pai-xu-antd-4-17-0-alpha-0-forked-tnu3u%253Ffile%253D%2Frow.js

[10]

codesandbox.io/s/tuo-zhuai-shou-bing-lie-antd-4-17-0-alpha-0-forked-c5l4x%3Ffile%3D/index.js: https://link.juejin.cn?target=codesandbox.io%2Fs%2Ftuo-zhuai-shou-bing-lie-antd-4-17-0-alpha-0-forked-c5l4x%253Ffile%253D%2Findex.js

[11]

codesandbox.io/s/react-beautiful-dnd-examples-multi-drag-table-with-antd-forked-rln36: https://link.juejin.cn?target=codesandbox.io%2Fs%2Freact-beautiful-dnd-examples-multi-drag-table-with-antd-forked-rln36

[12]

stackblitz.com/edit/react-waoqzs%3Ffile%3Dsrc%252FApp.js: https://link.juejin.cn?target=stackblitz.com%2Fedit%2Freact-waoqzs%253Ffile%253Dsrc%25252FApp.js

[13]

github.com/clauderic/dnd-kit/issues/310: https://link.juejin.cn?target=github.com%2Fclauderic%2Fdnd-kit%2Fissues%2F310

[14]

codepen.io/huxinmin/embed/bGRLmjP: https://link.juejin.cn?target=codepen.io%2Fhuxinmin%2Fembed%2FbGRLmjP

[15]

codesandbox.io/s/crazy-hoover-vwcy9%3Ffile%3D/src/Container.tsx: https://link.juejin.cn?target=codesandbox.io%2Fs%2Fcrazy-hoover-vwcy9%253Ffile%253D%2Fsrc%2FContainer.tsx

[16]

codesandbox.io/embed/react-sortable-hoc-tree-386oh%3Ffontsize%3D14%26hidenavigation%3D1%26theme%3Ddark: https://link.juejin.cn?target=codesandbox.io%2Fembed%2Freact-sortable-hoc-tree-386oh%253Ffontsize%253D14%2526hidenavigation%253D1%2526theme%253Ddark

[17]

codesandbox.io/embed/react-beautiful-dnd-tree-63f3j%3Ffontsize%3D14%26hidenavigation%3D1%26theme%3Ddark: https://link.juejin.cn?target=codesandbox.io%2Fembed%2Freact-beautiful-dnd-tree-63f3j%253Ffontsize%253D14%2526hidenavigation%253D1%2526theme%253Ddark

[18]

codesandbox.io/embed/react-dnd-kit-tree-uiujv%3Ffontsize%3D14%26hidenavigation%3D1%26theme%3Ddark: https://link.juejin.cn?target=codesandbox.io%2Fembed%2Freact-dnd-kit-tree-uiujv%253Ffontsize%253D14%2526hidenavigation%253D1%2526theme%253Ddark

[19]

codesandbox.io/embed/react-dnd-antd-table-mobile-j1b0l%3Ffontsize%3D14%26hidenavigation%3D1%26theme%3Ddark: https://link.juejin.cn?target=codesandbox.io%2Fembed%2Freact-dnd-antd-table-mobile-j1b0l%253Ffontsize%253D14%2526hidenavigation%253D1%2526theme%253Ddark

[20]

codesandbox.io/s/react-beautiful-dnd-examples-multi-drag-table-with-antd-forked-rln36: https://link.juejin.cn?target=codesandbox.io%2Fs%2Freact-beautiful-dnd-examples-multi-drag-table-with-antd-forked-rln36

[21]

codesandbox.io/s/tuo-zhuai-shou-bing-lie-antd-4-17-0-alpha-0-forked-c5l4x%3Ffile%3D/index.js: https://link.juejin.cn?target=codesandbox.io%2Fs%2Ftuo-zhuai-shou-bing-lie-antd-4-17-0-alpha-0-forked-c5l4x%253Ffile%253D%2Findex.js

[22]

5fc05e08a4a65d0021ae0bf2-hbqxtqukzi.chromatic.com/iframe.html%3Fid%3Dpresets-sortable-vertical--basic-setup%26viewMode%3Dstory: https://link.juejin.cn?target=5fc05e08a4a65d0021ae0bf2-hbqxtqukzi.chromatic.com%2Fiframe.html%253Fid%253Dpresets-sortable-vertical--basic-setup%2526viewMode%253Dstory

[23]

codesandbox.io/embed/react-dnd-stress-test-pbbjk%3Ffontsize%3D14%26hidenavigation%3D1%26theme%3Ddark: https://link.juejin.cn?target=codesandbox.io%2Fembed%2Freact-dnd-stress-test-pbbjk%253Ffontsize%253D14%2526hidenavigation%253D1%2526theme%253Ddark

[24]

5fc05e08a4a65d0021ae0bf2-hbqxtqukzi.chromatic.com/iframe.html%3Fid%3Dpresets-sortable-virtualized--basic-setup%26args%3D%26viewMode%3Dstory: https://link.juejin.cn?target=5fc05e08a4a65d0021ae0bf2-hbqxtqukzi.chromatic.com%2Fiframe.html%253Fid%253Dpresets-sortable-virtualized--basic-setup%2526args%253D%2526viewMode%253Dstory

[25]

github.com/clauderic/react-tiny-virtual-list: https://link.juejin.cn?target=github.com%2Fclauderic%2Freact-tiny-virtual-list

[26]

clauderic.github.io/react-sortable-hoc/%23/react-virtualized/basic-usage%3F_k%3Djgwno1: https://link.juejin.cn?target=clauderic.github.io%2Freact-sortable-hoc%2F%2523%2Freact-virtualized%2Fbasic-usage%253F_k%253Djgwno1

[27]

react-beautiful-dnd.netlify.app/iframe.html%3Fid%3Dvirtual-react-virtualized--list: https://link.juejin.cn?target=react-beautiful-dnd.netlify.app%2Fiframe.html%253Fid%253Dvirtual-react-virtualized--list

[28]

github.com/react-dnd/react-dnd: https://link.juejin.cn?target=github.com%2Freact-dnd%2Freact-dnd

[29]

github.com/atlassian/react-beautiful-dnd: https://link.juejin.cn?target=github.com%2Fatlassian%2Freact-beautiful-dnd

[30]

github.com/clauderic/dnd-kit: https://link.juejin.cn?target=github.com%2Fclauderic%2Fdnd-kit

[31]

github.com/clauderic/react-sortable-hoc: https://link.juejin.cn?target=github.com%2Fclauderic%2Freact-sortable-hoc

[32]

github.com/timruffles/mobile-drag-drop: https://link.juejin.cn?target=github.com%2Ftimruffles%2Fmobile-drag-drop

[33]

codesandbox.io/embed/react-drag-w03jd%3Ffontsize%3D14%26hidenavigation%3D1%26theme%3Ddark: https://link.juejin.cn?target=codesandbox.io%2Fembed%2Freact-drag-w03jd%253Ffontsize%253D14%2526hidenavigation%253D1%2526theme%253Ddark

  

往期回顾

  

#

[如何使用 TypeScript 开发 React 函数式组件？](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458468369&idx=1&sn=710836a0f836c1591b4953ecf09bb9bb&chksm=b1c2603886b5e92ec64f82419d9fd8142060ee99fd48b8c3a8905ee6840f31e33d423c34c60b&scene=21#wechat_redirect)

#

[11 个需要避免的 React 错误用法](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458468180&idx=1&sn=63da1eb9e4d8ba00510bf344eb408e49&chksm=b1c21f7d86b5966b160bf65b193b62c46bc47bf0b3965ff909a34d19d3dc9f16c86598792501&scene=21#wechat_redirect)

#

[6 个 Vue3 开发必备的 VSCode 插件](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458467984&idx=1&sn=f9f71530f15124fe44cd22eff3170981&chksm=b1c21eb986b597af806837a37b87b1e8bc06b26b16af578deddd8bb503a768f78f5a7acdb909&scene=21#wechat_redirect)

#

[3 款非常实用的 Node.js 版本管理工具](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458467880&idx=1&sn=ca7e12574d88a6b36ccfd47d9ddc7a4f&chksm=b1c21e0186b5971758792950721938b4a4efbc3024b0b01965c25a4ea73ec838767783ade6ea&scene=21#wechat_redirect)

#

[6 个你必须明白 Vue3 的 ref 和 reactive 问题](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458467756&idx=1&sn=902e85685a50ba7cdc75e410e10b9718&chksm=b1c21d8586b5949326c8836132b20dc4294af449473b6db4592cbfd00788345534a07d77fa6d&scene=21#wechat_redirect)

#

[6 个意想不到的 JavaScript 问题](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458467612&idx=1&sn=44ea5238a6500f44a47ea316c634bcf6&chksm=b1c21d3586b594237333a306f00353fba450514076e54ac32df7485ae358d0cefb25a6c1f329&scene=21#wechat_redirect)

#

[试着换个角度理解低代码平台设计的本质](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458467471&idx=2&sn=7990678e19544372ff43b5a84f491337&chksm=b1c21ca686b595b07b097c764f9304887282d737b4dd0a2634c47b25c8f223c785a6c8714382&scene=21#wechat_redirect)

![](https://mmbiz.qpic.cn/mmbiz_gif/dy9CXeZLlCXukR16d8fyyeJ4icloLCW0cvbCvibfaBxbY22lN51mYaLeKictjOeobKmxCVfb3AwIZ3t6eKicIicTtow/640?wx_fmt=gif)

回复 “**加群**”，一起学习进步