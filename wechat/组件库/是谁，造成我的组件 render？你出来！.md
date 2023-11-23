> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/9Ie4D5JtNuJDTuZeif5gTQ)

_作者：old_bin_

_原文链接：https://segmentfault.com/a/1190000023031115_

Why Did You Render 简介  

------------------------

当我在开发 React 项目时，经常会想，要是有一个工具能实时告知我组件是否有性能问题就好了，这样就能在开发的时候就尽量避免组件过大时的性能问题，以及降低潜在的页面崩溃概率。  
然后我就在网上找到了这个工具：`@welldone-software/why-did-you-render`，它能在我开发 react 组件的时候及时提醒我当前写的组件是否有不必要的重复渲染问题，在开发的时候就避免掉部分性能问题。

why did you render 应当在`开发环境`里使用。  
为避免麻烦，以下 why did you render 都简称 `why render`。

> 官网地址：https://github.com/welldone-s...  
> 文档说明：https://medium.com/welldone-s...

安装使用
----

*   安装 npm 包：
    
    ```
    npm install @welldone-software/why-did-you-render --save
    ```
    
*   开发环境里启用 (全局启用，部分组件启用请看官方文档)：
    
    ```
    import React from 'react';if (process.env.WHY_RENDER) {  const whyDidYouRender = require('@welldone-software/why-did-you-render');  whyDidYouRender(React, {    trackAllPureComponents: true,  });}
    ```
    
    官网里是判断 `process.env.NODE_ENV === 'development'`，不过我觉得应该和原有的开发，环境区分开发，新建一个 `script`, 不然容易给同一个项目里其他开发同学造成困扰：
    
*   `package.json`新建一个 `scripts`
    
    ```
    "scripts": {    "wr": "npm run dev --WHY_RENDER"}
    ```
    
    然后我们就可以使用 `npm run wr` 开发了。
    

why render 使用
-------------

### why render 提示信息

当我们启用了 why render 插件开发的时候，如果组件里有不必要的 re-render 问题时，控制台里会有相关的信息提示（不管是页面加载的时候还是交互的时候都可能会有提示）：

![](https://mmbiz.qpic.cn/mmbiz_png/QibeeJCUD7SRA6cEjY2zYj5AJafd9gibmI7kG2Tvy8ch229nNF5rSLwdQgO1r9Pks95TY5kxfR6AjgKrks9Iwv9g/640?wx_fmt=png)

上图里有两种可改进的地方，一个是 props 的 onchange 事件这块导致 RedioGroup 和 Checkbox re-render 了；另一个是 state 的值并未改变也导致 re-render。  
根据这些提示我们可以针对性优化，一个一个的解决，直至所有的提示都清除。

下面我对各类提示及相应的解决办法归类了一下：

### 表达式 props

父组件给子组件传的是表达式、函数、组件时触发 re-render 提示问题。

```
<ClassDemo  regEx={/something/}fn={function something(){}} date={new Date('6/29/2011 4:52:48 PM UTC')}reactElement={<div>hi!</div>}/>
```

上面是官方文档 (?) 里的一个例子，当通过表达式等方式而不是变量的方式把 props 传递给子组件的时候，控制台里会有 re-render 提示：  
  

![](https://mmbiz.qpic.cn/mmbiz_png/QibeeJCUD7SRA6cEjY2zYj5AJafd9gibmI6uAykYAnKcpfCdPvSWwXVtDfiaSiaScsia5ickJodWjrKJ8lXB16kTIFvA/640?wx_fmt=png)

解决办法，只需要把表达式等赋给变量再使用变量传递 props 就行：

```
const reg = /something/;const something = function f(){};const date = new Date('6/29/2011 4:52:48 PM UTC');const elem = () => {  return {    <div>hi!</div>  }}<ClassDemo  regEx={reg}fn={something} date={date}reactElement={elem}/>
```

不过我从来都是通过创建变量来传递 props 的，直接把表达式传过去也太 low 了。

### 被重赋给相同值的对象 props

这个最常见的例子是在接口请求里，比如查询数据，当参数未改变，再次查询返回的数据未变时，可能会导致数据的渲染组件的 re-render，这在 ant-design 的 table 组件里很常见。  
解决办法：  
1、更改 state 前先判断，有变化才更改 state；  
2、使用 React.memo 或者 shouldComponentUpdate；

### 变化的事件处理器

hooks 组件里，如果事件处理器 F props 里依赖 state, 在 state 变化时 F props 会传入新的事件方法。  
在下图的真实场景里，所有的 ant-design 表单元素 value 是用的一个 state 对象，事件方法也是同一个，如果不处理，随便一个表单元素的值更改都会导致所有的表单元素 re-render，然后就有了很多个 re-render 提示。  
  

![](https://mmbiz.qpic.cn/mmbiz_png/QibeeJCUD7SRA6cEjY2zYj5AJafd9gibmIzI73wicahKicxOibDHI7eP1Alricnh7YtWMnUHG7ViaGw8vWuVyagrKMAeg/640?wx_fmt=png)

要让事件处理器不变，有两个解决方式，不过也是大同小异：

```
// 通用事件处理函数export function useEventCallback(fn, dependencies) {  const ref = useRef(() => {    throw new Error('Cannot call an event handler while rendering.');  });  useEffect(() => {    ref.current = fn;  }, [fn, ...dependencies]);  return useCallback((...args) => {    const fn = ref.current;    return fn(...args);  }, [ref]);}// 使用const [state, setState] = useState({   name: '',   type: '',});// 事件处理器 onChangeconst onChange = useEventCallback((value) => {    // setState or do otherthing}, [state]);
```

```
// 一个简单的ref 自定义 hooksexport function useRefProps(props) {  const ref = useRef(props);  // 每次渲染更新props  useEffect(() => {    ref.current = props;  });  return ref;}// 使用const [state, setState] = useState({   name: '',   type: '',});const stateRef = useRefProps({    state,    [...others]  });// 事件处理器 onChangeconst onChange = useCallback((value) => {   const { state, ...others } = stateRef.current;    // setState or do otherthing}, []);
```

两种方式的原理类似，都是把变化数据 / 函数使用 Ref 作为中转，使用 useCallback 缓存结果。不过明显第一种易用性更高。  
使用这两个方法得到的处理事件处理器即便作为 props 传给子组件也不会变化的。

### ant-design 相关

有些 ant-design 的表单组件会触发 re-render 提示。比如表单里支持 Option 子组件的组件，例如 Select 组件，使用 Option 组件就会有 re-render 提示。

解决办法：Option 组件使用 options props 替代，这块 ant-design 应该是有优化的。  
其他的组件有 re-render 提示都可先在 ant-design 上查找是否有最新的使用方式。

```
// 会导致 re-render 的使用方式<Select onChange={handleChange}>  <Option value="jack">Jack</Option>  <Option value="lucy">Lucy</Option>  <Option value="disabled" disabled></Option></Select>// 不会导致 re-render 的使用方式const options = [  {    label: 'Jack',    value: 'jack',  },  {    label: 'Lucy',    value: 'lucy',  }]<Select onChange={handleChange} options={options}></Select>
```

引入的第三方库的问题
----------

如果我们的项目没有引入第三方库，那我们是可以优化掉所有的 re-render 提示的。但实际开发中这种情况基本上不会出现的，所以这就导致了一个问题：当第三方组件导致了 re-render 提示时，我们很可能因为无法更改第三方库而导致 re-render 提供无法消除掉。  
所以不必执着于消除所有的 re-render 提示，控制 re-render 数量在一个可接受的范围内，比如加载完或交互完后提示在三个内，也不失为一个合理的优化结果。

结语
--

why render 最适合的地方是应用于大型项目，在小型项目、简单页面中的价值并不是很大，毕竟一个页面如果本身就一点简单的内容展示一般也不需要多少内存。而大型项目就不一样的，一个页面可能有几十个组件，这时候每个组件的性能问题都应该重视起来，等到页面崩溃的时候再去找问题那就真是费时又费力，还不一定短时间内能解决。

![](https://mmbiz.qpic.cn/mmbiz_png/QibeeJCUD7SQOLJZCYZJAtJsQ3h4ibaWoUSfNTXJslLhA9DN2VMibrqr258fUicpscvpTYTBpNG0HGfpbAgfZ10FZQ/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/QibeeJCUD7SQOLJZCYZJAtJsQ3h4ibaWoUSfNTXJslLhA9DN2VMibrqr258fUicpscvpTYTBpNG0HGfpbAgfZ10FZQ/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/QibeeJCUD7SQOLJZCYZJAtJsQ3h4ibaWoUSfNTXJslLhA9DN2VMibrqr258fUicpscvpTYTBpNG0HGfpbAgfZ10FZQ/640?wx_fmt=png)

关注我，送你一本源码学习手册

加入全网最大 React 源码学习社群

![](https://mmbiz.qpic.cn/mmbiz_png/QibeeJCUD7SQOLJZCYZJAtJsQ3h4ibaWoUdloGauE20nU5Rgb0M4OOXTj7Ed7ArecKJW8DcoOtUpr3vDPPOZUU9A/640?wx_fmt=png)

![](https://mmbiz.qpic.cn/mmbiz_png/QibeeJCUD7SQxNrPh7FwNylBx0k9PpYzVnHpMZgPlkxsVJrOianRy5uniacAlceHn24IY8NibOYkqPiaE6oJBQtfHVA/640?wx_fmt=png)