> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/nM0OS_LOtJKYwUG8f22piQ)

前言：你点的不是按钮，是 React 的套路
----------------------

在写 React 项目的时候，我们经常写下这样的代码：

```
<button onClick={(e) => console.log(e)}>点我一下</button>
```

看起来很普通对吧？但你有没有想过：

*   `e` 是什么鬼？
    
*   它是原生事件？虚拟 DOM？还是什么合成怪物？
    
*   为什么异步访问 `e` 会报错？
    
*   React 的事件性能为什么这么高？
    

今天，我们就来揭开 React 事件机制的神秘面纱，手撕它的事件池，搞懂它的合成事件，让你真正掌握 React 的 “事件套路”。

* * *

第一步：分清三个重要角色
------------

我们先来理清楚几个概念，不然你会像我一样，一开始直接懵逼：

<table><thead><tr><th><section>角色</section></th><th><section>是什么？</section></th><th><section>跟事件有啥关系？</section></th></tr></thead><tbody><tr><td><section>虚拟 DOM</section></td><td><section>React 内部描述 UI 的 JS 对象</section></td><td><section>❌ 跟事件没关系！</section></td></tr><tr><td><section>原生 DOM</section></td><td><section>浏览器中的真实标签元素</section></td><td><section>✅ 事件最终触发的地方</section></td></tr><tr><td><section>合成事件（SyntheticEvent）</section></td><td><section>React 封装的 “代理事件对象”</section></td><td><section>✅ 真正传给你的&nbsp;<code>e</code></section></td></tr></tbody></table>

* * *

第二步：什么是合成事件？
------------

合成事件（`SyntheticEvent`）是 React 自己封装的一套事件系统，它不是原生的 `MouseEvent` 或 `KeyboardEvent`，而是：

一个统一封装的、兼容所有浏览器的事件对象，**用于屏蔽浏览器差异**、提高性能！

### 举个例子：

```
function App() {  return (    <button      onClick={(e) => {        console.log('e:', e); // 合成事件        console.log('e.nativeEvent:', e.nativeEvent); // 原生事件        console.log('e.target:', e.target); // DOM 节点      }}    >      点我！    </button>  );}
```

### ✅ 合成事件有啥用？

1.  跨浏览器兼容性好（比如 `.stopPropagation()` 会统一处理）
    
2.  API 和原生事件几乎一样，你用起来毫无负担
    
3.  最重要：**可以被 React 优化和 “回收”！**
    

* * *

第三步：React 为啥要搞个 “事件池”？
----------------------

想象一下，如果你的页面有很多交互，用户疯狂点击、滑动、输入…… 每次都要新建一个事件对象，是不是会非常浪费内存？

所以 React 灵机一动：

咱们搞一个事件池（`event pool`）！  
用一个对象，重复用，处理完就清空，循环利用，环保节能！

这就像外卖平台的饭盒回收系统： **“事件盒子” 用完别扔，下一单还能用！**

* * *

第四步：事件池机制到底怎么搞？
---------------

流程如下：

1.  事件触发（比如点击按钮）；
    
2.  React 从**事件池**中拿一个 `SyntheticEvent` 对象；
    
3.  把原生事件的数据 “拷贝” 进去，作为 `.nativeEvent`；
    
4.  执行你的事件处理函数；
    
5.  **事件处理函数一执行完，就立即清空这个对象（属性被置空）** ；
    
6.  下次事件触发，再次复用这个对象。
    

* * *

### 所以坑就来了！

```
<button  onClick={(e) => {    setTimeout(() => {      console.log(e.target); // ❌ 报错或 undefined    }, 1000);  }}>  异步点击</button>
```

输出结果可能是：

```
null{}Cannot read properties of null
```

因为你这个 `e`，早就被 React 还给事件池啦！

* * *

如何解决异步访问事件的问题？
--------------

有两个简单方法：

### ✅ 方法 1：同步解构赋值

```
onClick={(e) => {  const target = e.target;  setTimeout(() => {    console.log(target); // 安全！  }, 1000);}}
```

### ✅ 方法 2：调用 `e.persist()`

```
onClick={(e) => {  e.persist(); // 阻止事件回收  setTimeout(() => {    console.log(e.target); // OK  }, 1000);}}
```

`e.persist()` 就是告诉 React： **“哥别收回这个事件对象，我要留着用！”**

* * *

总结：面试官怎么问，你怎么答？
---------------

**Q1：React 的事件机制和原生事件有啥不同？**

A：React 使用了 `SyntheticEvent` 合成事件系统，它封装了原生事件，提供统一 API，还通过事件池优化性能，避免频繁创建对象。

* * *

**Q2：为什么异步访问事件对象会报错？怎么解决？**

A：因为事件对象是从事件池复用的，事件回调执行完后会被清空。解决方式：

*   同步解构属性；
    
*   或者调用 `e.persist()` 持久化事件对象。
    

* * *

**Q3：React 的事件是绑定在哪的？**

A：不是绑定在每个 DOM 元素上，而是采用**事件委托机制**，统一绑定到 `document` 上，提高性能。

* * *

最后，三句话记住事件机制
------------

1.  你拿到的是「合成事件」，不是原生的；
    
2.  它内部封装了「原生事件」，提供统一 API；
    
3.  React 会「事件池」回收它，异步访问需 persist！
    

  

作者：多啦 C 梦 a

https://juejin.cn/post/7529960877317013540