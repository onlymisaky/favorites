> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/8eTBarBEOF3TjcaiczBHcg)

用 React 技术栈的小伙伴基本每天都在写 React 组件，但是大多是是业务组件，并不是很复杂。

基本就是传入 props，render 出最终的视图，用 hooks 组织下逻辑，最多再用下 context 跨层传递数据。

那相对复杂的组件是什么样子的呢？

其实 antd 组件库里就有很多。

今天我们就来实现一个 antd 组件库里的组件 -- Space 组件吧。

首先看下它是怎么用的：

这是一个布局组件：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia0XOtYJf4I0mfN5OyDWUn3iaWcruvsK9qfGS0iciaU49ty1bLLCfGcPJtia7ibFgkpz02x2QiaDqggnibCQ/640?wx_fmt=png)

文档里介绍它是设置组件的间距的，还可以设置多个组件怎么对齐。

比如这样 3 个盒子：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia0XOtYJf4I0mfN5OyDWUn3nc2aW1P25WYtYefnh5OO5hWFqYiaCiau9plA9icvPTdauC3FFYn9NrcdA/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia0XOtYJf4I0mfN5OyDWUn3hUuZ7C0da13KvG6CMgVibhJTATTUjT8NvyX0bZId8kaexJcmPibDwOibw/640?wx_fmt=png)

渲染出来是这样的：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia0XOtYJf4I0mfN5OyDWUn3tVfYq5Lrj9us0uRWj2cejYmuPhyWu6yWERfQZ6h4ACqzoYQWicLSJRw/640?wx_fmt=png)

我们用 Space 组件包一下，设置方向为水平，就变成这样了（漏了一张代码截图，看后面的吧）：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia0XOtYJf4I0mfN5OyDWUn3ZTx4qoKpdTZ4ic9AsQ9hpSN1f8libvJh52JUjRBytF1mAiaKSku6CH83Q/640?wx_fmt=png)

当然，也可以竖直：

![](https://mmbiz.qpic.cn/mmbiz_gif/YprkEU0TtGia0XOtYJf4I0mfN5OyDWUn3EhIPVleHbpdXMvr44Mk1vS2lYFoW3TVqPU73ssAia4t97xlQ4s4S4icw/640?wx_fmt=gif)

水平和竖直的间距都可以通过 size 来设置：

![](https://mmbiz.qpic.cn/mmbiz_gif/YprkEU0TtGia0XOtYJf4I0mfN5OyDWUn3bO7T6mib8NDTgickkBXico5Mz2t0DJZo3lsFbOzDg0z4NAKcVt9h52oaw/640?wx_fmt=gif)

  

可以设置 large、middle、small 或者任意数值。

多个子节点可以设置对齐方式，比如 start、end、center 或者 baseline：

![](https://mmbiz.qpic.cn/mmbiz_gif/YprkEU0TtGia0XOtYJf4I0mfN5OyDWUn3VISQB98Lh6IpdmKJQiaHQUXhVD7fuo6uCHqQxSRB6hMtuqNtvKSLDTQ/640?wx_fmt=gif)

  

此外子节点过多可以设置换行：

![](https://mmbiz.qpic.cn/mmbiz_gif/YprkEU0TtGia0XOtYJf4I0mfN5OyDWUn3fac3HFwBkIq7EUUW6bVhB7cyb4uqia2uK0wOB84teaiaiaEs8gQ145Pdw/640?wx_fmt=gif)

space 也可以单独设置行列的：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia0XOtYJf4I0mfN5OyDWUn3DykibIChTPQBxic59wAdAa4xicpVNCO6zIVb8nCbZbnaOoiaY9stV7XeSA/640?wx_fmt=png)

最后，它还可以设置 split 分割线部分：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia0XOtYJf4I0mfN5OyDWUn3ibYk5WTon0TQeezxcW9443CJ1RfTrMFug55rIsPOicGFznXPaOS5o0vw/640?wx_fmt=png)

此外，你也可以不直接设置 size，而是通过 ConfigProvider 修改 context 中的默认值：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia0XOtYJf4I0mfN5OyDWUn397weOdkvKKpF3EeHzqIQOzeFBSsCMraxzwXm19EcUKZa8NksHSTgOg/640?wx_fmt=png)

很明显，Space 内部会读取 context 中的 size 值。

这样如果有多个 Space 组件就不用每个都设置了，统一加个 ConfigProvider 就行了：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia0XOtYJf4I0mfN5OyDWUn3MHsICMBX8IvH2BMq2o0sX5BDMaFfszV3MmdxFr0dibuKVbqptEfJdUA/640?wx_fmt=png)

这就是 Space 组件的全部用法，简单回顾下这几个参数和用法：

*   direction: 设置子组件方向，水平还是竖直排列
    
*   size：设置水平、竖直的间距
    
*   align：子组件的对齐方式
    
*   wrap：超过一屏是否换行，只在水平时有用
    
*   split：分割线的组件
    
*   多个 Space 组件的 size 可以通过 ConfigProvider 统一设置默认值。
    

是不是过一遍就会用了？

用起来还是挺简单的，但它的功能挺强大。

那这样的布局组件是怎么实现的呢？

我们先看下它最终的 dom：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia0XOtYJf4I0mfN5OyDWUn3sLJQeWarw1OzibqWJztR0RQRCQjwyEz8mQylRhY19qGPvvOtIpIxeeA/640?wx_fmt=png)

对每个 box 包了一层 div，设置了 ant-space-item 的 class。

对 split 部分包了一层 span，设置了 ant-space-item-split 的 class。

最外层包了一层 div，设置了 ant-space 等 class。

这些还是很容易想到的，毕竟设置布局嘛，不包一层怎么布局？

但虽然看起来挺简单，实现的话还是有不少东西的。

下面我们来写一下：

首先声明组件 props 的类型：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia0XOtYJf4I0mfN5OyDWUn3xfJnnoibGuMXohicfjcd9TJF6MufQzKHkwgKEmeryT0ryuO1Ku2Cxtvg/640?wx_fmt=png)

需要注意的是 style 是 React.CSSProperties 类型，也就是各种 css 都可以写。

split 是 React.ReactNode 类型，也就是可以传入 jsx。

其余的参数的类型就是根据取值来，我们上面都测试过。

Space 组件会对所有子组件包一层 div，所以需要遍历传入的 children，做下修改：

props 传入的 children 要转成数组可以用 React.Children.toArray 方法。

有的同学说，children 不是已经是数组了么？为什么还要用 React.Children.toArray 转一下？

因为 toArray 可以对 children 做扁平化：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia0XOtYJf4I0mfN5OyDWUn3fwMibdFs7iaLicMXFvibM5BibBNxeTmA8Y9J5ub6VatxacGXosibiafNuFVew/640?wx_fmt=png)

更重要的是直接调用 children.sort() 会报错：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia0XOtYJf4I0mfN5OyDWUn3r62FdABH9PPSicgUhQ8dvdKTufLAr3Al3eaFKdagCJhjKJ9QLFMS8uQ/640?wx_fmt=png)

而 toArray 之后就不会了：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia0XOtYJf4I0mfN5OyDWUn3bqDvgRJlmWqbfAdNyuJb5aD4V7EmtqiaRKUnhxNsZMGUztcictXfg9XQ/640?wx_fmt=png)

同理，**我们会用 React.Children.forEach，React.Children.map 之类的方法操作 children，而不是直接操作。**

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia0XOtYJf4I0mfN5OyDWUn3eQGLsClWyaajVkVibmTGYbspA41TqjPs9QaiaVPCv2BP2dIk9wRpP28Q/640?wx_fmt=png)

但这里我们有一些特殊的需求，比如空节点不过滤掉，依然保留。

所以用 React.Children.forEach 自己实现一下 toArray：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia0XOtYJf4I0mfN5OyDWUn3icdF1xl4QxDVrPTW8SWV9aSSZQhGs6XpsMib4wqjTA4iagOr4wzicgv0aA/640?wx_fmt=png)

这部分比较容易看懂，就是用 React.Children.forEach 遍历 jsx 节点，对每个节点做下判断，如果是数组或 fragment 就递归处理，否则 push 到数组里。

保不保留空节点可以根据 keepEmpty 的 option 来控制。

这样用：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia0XOtYJf4I0mfN5OyDWUn32X5Awia3pTGWjYewpt9oAno3G39xGdURZ9oJhjQHJAnC4PDAuMR9gMA/640?wx_fmt=png)

children 就可以遍历渲染 item 了，这部分是这样的：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia0XOtYJf4I0mfN5OyDWUn3zRd5BYpmB33xJXfseGaHPd5xLQJBNiby4F3GJkFxIH3M674gmV6oIGw/640?wx_fmt=png)

我们单独封装个 Item 组件。

然后 childNodes 遍历渲染这个 Item 就可以了：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia0XOtYJf4I0mfN5OyDWUn3RmHic5qicDH1V5uEEWJKxb0oNdqyrjEdQfIEeuuufMuyQ6en9Eialkz5A/640?wx_fmt=png)

然后把这所有的 Item 组件再放到最外层 div 里：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia0XOtYJf4I0mfN5OyDWUn3PmQYq7CIJasNVoiaf6CeWDicTgDbdHFlVak1erK9I2yrcjIPIia5Fb1MQ/640?wx_fmt=png)

就可以分别控制整体的布局和 Item 的布局了。

具体的布局还是通过 className 和样式来的：

className 通过 props 计算而来：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia0XOtYJf4I0mfN5OyDWUn3aRwV5KtUKzIeqSKWZYRB28mibWicHxJIM88MRVCNXe1VicODav8ozrtrw/640?wx_fmt=png)

用到了 classnames 这个包，这个算是 react 生态很常用的包了，根据 props 动态生成 className 基本都用这个。

这个前缀是动态获取的，最终就是 ant-space 的前缀：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia0XOtYJf4I0mfN5OyDWUn3YpibvSsLUUL1uhiaeGScROvwChKKJcMwuodHa2ESHpVCxIJTRXZmLt9g/640?wx_fmt=png)

这些 class 的样式也都定义好：

```
$ant-prefix: 'ant';$space-prefix-cls: #{$ant-prefix}-space;$space-item-prefix-cls: #{$ant-prefix}-space-item; .#{$space-prefix-cls} {  display: inline-flex;  &-vertical {    flex-direction: column;  }  &-align {    &-center {      align-items: center;    }    &-start {      align-items: flex-start;    }    &-end {      align-items: flex-end;    }    &-baseline {      align-items: baseline;    }  }}.#{$space-prefix-cls} {  &-rtl {    direction: rtl;  }}
```

整个容器 inline-flex，然后根据不同的参数设置 align-items 和 flex-direction 的值。

最后一个 direction 的 css 可能大家没用过，是设置文本方向的：

![](https://mmbiz.qpic.cn/mmbiz_gif/YprkEU0TtGia0XOtYJf4I0mfN5OyDWUn3C8xywCibibXxuaTiatYeOa0DUQOUvLrWv8ibiaao1uBBj8Q5b6qCpvbkLLg/640?wx_fmt=gif)

这样，就通过 props 动态给最外层 div 加上了相应的 className，设置了对应的样式。

但还有一部分样式没设置，也就是间距：

其实这部分可以用 gap 设置：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia0XOtYJf4I0mfN5OyDWUn3dfIjqaLxHT57oJqncCYPKtXhNhw9WCbKLaibk7WfRwlOKFD10v8VOJQ/640?wx_fmt=png)

当然，用 margin 也可以，只不过那个要单独处理下最后一个元素，比较麻烦。

不过 antd 这种组件自然要做的兼容性好点，所以两种都支持，支持 gap 就用 gap，否则用 margin。

问题来了，antd 是怎么检测浏览器是否支持 gap 样式的呢？

它是这么做的：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia0XOtYJf4I0mfN5OyDWUn3OJibgejVib3gNZ7Bca8kmQtnTjaInwHhUoGJLRyGLFv3AoNgiapibAVNMA/640?wx_fmt=png)

创建一个 div，设置样式，加到 body 下，看看 scrollHeight 是多少，最后把这个元素删掉。

这样就能判断是是否支持 gap、column 等样式，因为不支持的话高度会是 0。

然后它又提供了这样一个 hook：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia0XOtYJf4I0mfN5OyDWUn3fhp9VXICFV8dxGdSk8tsR7nHWtZOkVTtpP8R7SdO44Owm47iciawukPQ/640?wx_fmt=png)

第一次会检测并设置 state 的值，之后直接返回这个检测结果。

这样组件里就可以就可以用这个 hook 来判断是否支持 gap，从而设置不同的样式了：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia0XOtYJf4I0mfN5OyDWUn3Kg5LpCjXO6Tz3JfqjcbAwjG305HeViaWWd9OsibAtmB5tsibiaQgxnUQug/640?wx_fmt=png)

是不是很巧妙？

最后，这个组件还会从 ConfigProvider 中取值，这个我们见到过：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia0XOtYJf4I0mfN5OyDWUn3MHsICMBX8IvH2BMq2o0sX5BDMaFfszV3MmdxFr0dibuKVbqptEfJdUA/640?wx_fmt=png)

所以，再处理下这部分：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia0XOtYJf4I0mfN5OyDWUn3k8bgwG11xSJuhBiancSEyPOCf7NMmEZBmKXu6rlrRQk5wxCSDFGbuNA/640?wx_fmt=png)

用 useContext 读取 context 中的值，设置为 props 的解构默认值，这样如果传入了 props.size 就用传入的值，否则就用 context 里的值。

这里给 Item 子组件传递数据也是通过 context，因为 Item 组件不一定会在哪一层。

用 createContext 创建 context 对象：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia0XOtYJf4I0mfN5OyDWUn3icfazblIFXicfVnpEYjInLe21mxsAsQCVNbek9YupQqyZKZTTxTFkmTw/640?wx_fmt=png)

把计算出的 size：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia0XOtYJf4I0mfN5OyDWUn3UDFG9o8QoiaL3IEd5SQFmTSkEOOnen5LqtzecytqMKAoZJTKSmrjgLQ/640?wx_fmt=png)

还有其他的一些值：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia0XOtYJf4I0mfN5OyDWUn3BJr3vdJY1smu6Cguheu8hvukyWZt3BMkjGoQWGZwGlXhrGYD46U4rQ/640?wx_fmt=png)

都通过 Provider 设置到 spaceContext 中：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia0XOtYJf4I0mfN5OyDWUn3oeCQROTBS5eylgB8ia8UjUeqLB8PKlXfWaOwvDxMhWaTxUmBIiaC3TKQ/640?wx_fmt=png)

这样子组件就能拿到 spaceContext 中的值了。

这里 useMemo 很多同学不会用，其实很容易理解：

props 变了会触发组件重新渲染，但有的时候 props 并不需要变化却每次都变，这样就可以通过 useMemo 来避免它没必要的变化了。

useCallback 也是同样的道理。

计算 size 的时候封装了一个 getNumberSize 方法，对于字符串枚举值设置了一些固定的数值：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia0XOtYJf4I0mfN5OyDWUn3OQDJALznEeQj2og24NVNqYWX5ibA4WsiaibIWWNwrGunyt8136FNLtlGA/640?wx_fmt=png)

至此，这个组件我们就完成了，当然，Item 组件还没展开讲。

先来欣赏下这个 Space 组件的全部源码：

```
import classNames from 'classnames';import * as React from 'react';import { ConfigContext, SizeType } from './config-provider';import Item from './Item';import toArray from './toArray';import './index.scss'import useFlexGapSupport from './useFlexGapSupport';export interface Option {  keepEmpty?: boolean;}export const SpaceContext = React.createContext({  latestIndex: 0,  horizontalSize: 0,  verticalSize: 0,  supportFlexGap: false,});export type SpaceSize = SizeType | number;export interface SpaceProps extends React.HTMLAttributes<HTMLDivElement> {  className?: string;  style?: React.CSSProperties;  size?: SpaceSize | [SpaceSize, SpaceSize];  direction?: 'horizontal' | 'vertical';  align?: 'start' | 'end' | 'center' | 'baseline';  split?: React.ReactNode;  wrap?: boolean;}const spaceSize = {  small: 8,  middle: 16,  large: 24,};function getNumberSize(size: SpaceSize) {  return typeof size === 'string' ? spaceSize[size] : size || 0;}const Space: React.FC<SpaceProps> = props => {  const { getPrefixCls, space, direction: directionConfig } = React.useContext(ConfigContext);  const {    size = space?.size || 'small',    align,    className,    children,    direction = 'horizontal',    split,    style,    wrap = false,    ...otherProps  } = props;  const supportFlexGap = useFlexGapSupport();  const [horizontalSize, verticalSize] = React.useMemo(    () =>      ((Array.isArray(size) ? size : [size, size]) as [SpaceSize, SpaceSize]).map(item =>        getNumberSize(item),      ),    [size],  );  const childNodes = toArray(children, {keepEmpty: true});  const mergedAlign = align === undefined && direction === 'horizontal' ? 'center' : align;  const prefixCls = getPrefixCls('space');  const cn = classNames(    prefixCls,    `${prefixCls}-${direction}`,    {      [`${prefixCls}-rtl`]: directionConfig === 'rtl',      [`${prefixCls}-align-${mergedAlign}`]: mergedAlign,    },    className,  );  const itemClassName = `${prefixCls}-item`;  const marginDirection = directionConfig === 'rtl' ? 'marginLeft' : 'marginRight';  // Calculate latest one  let latestIndex = 0;  const nodes = childNodes.map((child: any, i) => {    if (child !== null && child !== undefined) {      latestIndex = i;    }    const key = (child && child.key) || `${itemClassName}-${i}`;    return (      <Item        className={itemClassName}        key={key}        direction={direction}        index={i}        marginDirection={marginDirection}        split={split}        wrap={wrap}      >        {child}      </Item>    );  });  const spaceContext = React.useMemo(    () => ({ horizontalSize, verticalSize, latestIndex, supportFlexGap }),    [horizontalSize, verticalSize, latestIndex, supportFlexGap],  );  if (childNodes.length === 0) {    return null;  }  const gapStyle: React.CSSProperties = {};  if (wrap) {    gapStyle.flexWrap = 'wrap';    if (!supportFlexGap) {      gapStyle.marginBottom = -verticalSize;    }  }  if (supportFlexGap) {    gapStyle.columnGap = horizontalSize;    gapStyle.rowGap = verticalSize;  }  return (    <div      className={cn}      style={{        ...gapStyle,        ...style,      }}      {...otherProps}    >      <SpaceContext.Provider value={spaceContext}>{nodes}</SpaceContext.Provider>    </div>  );};export default Space;
```

回顾下要点：

*   基于 React.Children.forEach 自己封装了 toArray 方法，做了一些特殊处理
    
*   对 childNodes 遍历之后，包裹了一层 Item 组件
    
*   封装了 useFlexGapSupport 的 hook，里面通过创建 div 检查 scrollHeight 的方式来确定是否支持 gap 样式
    
*   通过 useContext 读取 ConfigContext 的值，作为 props 的解构默认值
    
*   通过 createContext 创建 spaceContext，并通过 Provider 设置其中的值
    
*   通过 useMemo 缓存作为参数的对象，避免不必要的渲染
    
*   通过 classnames 包来根据 props 动态生成 className
    

思路理的差不多了，再来看下 Item 的实现：

这部分比较简单，直接上全部代码了：

```
import * as React from 'react';import { SpaceContext } from '.';export interface ItemProps {  className: string;  children: React.ReactNode;  index: number;  direction?: 'horizontal' | 'vertical';  marginDirection: 'marginLeft' | 'marginRight';  split?: string | React.ReactNode;  wrap?: boolean;}export default function Item({  className,  direction,  index,  marginDirection,  children,  split,  wrap,}: ItemProps) {  const { horizontalSize, verticalSize, latestIndex, supportFlexGap } =    React.useContext(SpaceContext);  let style: React.CSSProperties = {};  if (!supportFlexGap) {    if (direction === 'vertical') {      if (index < latestIndex) {        style = { marginBottom: horizontalSize / (split ? 2 : 1) };      }    } else {      style = {        ...(index < latestIndex && { [marginDirection]: horizontalSize / (split ? 2 : 1) }),        ...(wrap && { paddingBottom: verticalSize }),      };    }  }  if (children === null || children === undefined) {    return null;  }  return (    <>      <div className={className} style={style}>        {children}      </div>      {index < latestIndex && split && (        <span className={`${className}-split`} style={style}>          {split}        </span>      )}    </>  );}
```

通过 useContext 从 SpaceContext 中取出 Space 组件里设置的值。

根据是否支持 gap 来分别使用 gap 或者 margin、padding 的样式来设置间距。

每个元素都用 div 包裹下，设置 className。

如果不是最后一个元素并且有 split 部分，就渲染 split 部分，用 span 包裹下。

这块还是比较清晰的。

最后，还有 ConfigProvider 的部分没有看：

这部分就是创建一个 context，并初始化一些值：

```
import React from "react";export type DirectionType = 'ltr' | 'rtl' | undefined;export type SizeType = 'small' | 'middle' | 'large' | undefined;export interface ConfigConsumerProps {  getPrefixCls: (suffixCls?: string) => string;  direction?: DirectionType;  space?: {    size?: SizeType | number;  }}export const defaultGetPrefixCls = (suffixCls?: string) => {  return suffixCls ? `ant-${suffixCls}` : 'ant';};export const ConfigContext = React.createContext<ConfigConsumerProps>({    getPrefixCls: defaultGetPrefixCls});
```

有没有感觉 antd 里用 context 简直太多了！

确实。

为什么呢？

因为你不能保证组件和子组件隔着几层。

比如 Form 和 Form.Item：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia0XOtYJf4I0mfN5OyDWUn3ic8kpvraTpTqN9YdsuzYiafauEmk0Qc6BM59RKSgcmmldic5dYqU5BxWQ/640?wx_fmt=png)image.png

比如 ConfigProvider 和各种组件（这里是 Space）：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia0XOtYJf4I0mfN5OyDWUn3MHsICMBX8IvH2BMq2o0sX5BDMaFfszV3MmdxFr0dibuKVbqptEfJdUA/640?wx_fmt=png)

还有刚讲过的 Space 和 Item。

它们能用 props 传数据么？

不能，因为不知道隔几层。

所以 antd 里基本都是用 cotnext 传数据的。

你会你在 antd 里会见到大量的用 createCotnext 创建 context，通过 Provider 修改 context 值，通过 Consumer 或者 useContext 读取 context 值的这类逻辑。

最后，我们来测试下自己实现的这个 Space 组件吧：

测试代码如下：

```
import Space from './space';import './SpaceTest.css';import { ConfigContext, defaultGetPrefixCls,  } from './space/config-provider';import React from 'react';const SpaceTest = () => (  <ConfigContext.Provider value={    {      getPrefixCls: defaultGetPrefixCls,      space: { size: 'large'}    }  }>    <Space       direction="horizontal"      align="end"       style={{height:'200px'}}      split={<div class style={{background: 'red'}}></div>}       wrap={true}    >      <div class       style={{height:'200px'}}      split={<div class style={{background: 'red'}}></div>}       wrap={true}    >      <div class></div>    </Space>  </ConfigContext.Provider>);export default SpaceTest;
```

这部分不咋用解释了。就是 ConfigProvider 包裹了俩 Space 组件，这俩 Space 组件没设置 size 值。

设置了 direction、align、split、wrap 等参数。

渲染结果是对的：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia0XOtYJf4I0mfN5OyDWUn3ibchXbbicMJH9qc4zVBVUKFkWzXHUYAdmqmWNe7aUYToS3w9YZz0vSSA/640?wx_fmt=png)

就这样，我们自己实现了 antd 的 Space 组件！

完整代码在 github：https://github.com/QuarkGluonPlasma/my-antd-test

总结
--

一直写业务代码，可能很少写一些复杂的组件，而 antd 里就有很多复杂组件，我们挑 Space 组件来写了下。

这是一个布局组件，可以通过参数设置水平、竖直间距、对齐方式、分割线部分等。

实现这个组件的时候，我们用到了很多东西：

*   用 React.Children.forEach 的 api 来修改每个 childNode。
    
*   用 useContext 读取 ConfigContext、SpaceContext 的值
    
*   用 createContext 创建 SpaceContext，并用 Provider 修改其中的值
    
*   用 useMemo 来避免没必要的渲染
    
*   用 classnames 包来根据 props 动态生成 className
    
*   自己封装了一个检测样式是否支持的自定义 hook
    

很多同学不会封装布局组件，其实就是对整体和每个 item 都包裹一层，分别设置不同的 class，实现不同的间距等的设置。

想一下，这些东西以后写业务组件是不是也可以用上呢？