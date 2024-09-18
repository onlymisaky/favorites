> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/gY1mh6Vs9EKoyjHWHXQ6gg)

![图片](https://mmbiz.qpic.cn/mmbiz_jpg/b77xA98980HC8X81RYX3CB8lwQkkGsQjhL4OiaohwfcYxAGTzWlyCLIn1NTZgpxOYTIQyPicJheia23ug4zYq92UA/640?wx_fmt=jpeg)

在 React 模板中，若表达式结果为 false 时，为什么

不渲染数据呢？

我们在开发 React 项目时，经常会用到逻辑与`&&`的运算符。

```
const App = () => {  const [isShow, setShow] = useState(false);  // 当 isShow 为 true 时，才会渲染 <div>show me</div>  return <div>{isShow && <div>show me</div>}</div>;};
```

逻辑与运算符`&&`，在 JavaScript 中，它的作用是，如果前面的表达式为真，则返回后面的表达式，否则返回前面的表达式。

可是这里有个问题：对于完整的逻辑与表达式，若`isShow`为 false 时，则返回 false，为什么当前区域展示内容是空的，而不是展示`false`呢？

这其实跟 React 的渲染机制有关。我们在之前的文章 React18 源码解析之 reconcileChildren 生成 fiber 的过程提到过。这里再稍微介绍下。

```
/** * 将returnFiber节点（即当前的workInProgress对应的节点）里的element结构转为fiber结构 * @param returnFiber 当前的workInProgress对应的fiber节点 * @param currentFirstChild current 树上对应的当前 Fiber 节点的第一个子 Fiber 节点，可能为null * @param newChild returnFiber中的element结构，用来构建returnFiber的子节点 * @param lanes * @returns {Fiber|*} */function reconcileChildFibers(  returnFiber: Fiber, // 当前 Fiber 节点，即 workInProgress  currentFirstChild: Fiber | null,  newChild: any,  lanes: Lanes // 优先级相关): Fiber | null {  // 是否是顶层的没有key的fragment组件  const isUnkeyedTopLevelFragment =    typeof newChild === "object" &&    newChild !== null &&    newChild.type === REACT_FRAGMENT_TYPE &&    newChild.key === null;  // 若是顶层的fragment组件，则直接使用其children  if (isUnkeyedTopLevelFragment) {    newChild = newChild.props.children;  }  // Handle object types  // 判断该节点的类型  if (typeof newChild === "object" && newChild !== null) {    /**     * newChild是Object，再具体判断 newChild 的具体类型。     * 1. 是普通React的函数组件、类组件、html标签等     * 2. portal类型；     * 3. lazy类型；     * 4. newChild 是一个数组，即 workInProgress 节点下有并排多个结构，这时 newChild 就是一个数组     * 5. 其他迭代类型，我暂时也不确定这哪种？     */    switch (newChild.$$typeof) {      case REACT_ELEMENT_TYPE:        // 一般的React组件，如<App />或<p></p>等        return placeSingleChild(          // 调度单体element结构的元素          reconcileSingleElement(returnFiber, currentFirstChild, newChild, lanes)        );      case REACT_PORTAL_TYPE:        return placeSingleChild(          reconcileSinglePortal(returnFiber, currentFirstChild, newChild, lanes)        );      case REACT_LAZY_TYPE:        const payload = newChild._payload;        const init = newChild._init;        // TODO: This function is supposed to be non-recursive.        return reconcileChildFibers(returnFiber, currentFirstChild, init(payload), lanes);    }    if (isArray(newChild)) {      // 若 newChild 是个数组      return reconcileChildrenArray(returnFiber, currentFirstChild, newChild, lanes);    }    if (getIteratorFn(newChild)) {      return reconcileChildrenIterator(returnFiber, currentFirstChild, newChild, lanes);    }    throwOnInvalidObjectType(returnFiber, newChild);  }  if ((typeof newChild === "string" && newChild !== "") || typeof newChild === "number") {    // 文本节点    return placeSingleChild(      reconcileSingleTextNode(returnFiber, currentFirstChild, "" + newChild, lanes)    );  }  // Remaining cases are all treated as empty.  // 若没有匹配到任何类型，说明当前newChild无法转为fiber节点，如boolean类型，null等是无法转为fiber节点的  // deleteRemainingChildren()的作用是删除 returnFiber 节点下，第2个参数传入的fiber节点，及后续所有的兄弟节点  // 如 a->b->c->d-e，假如我们第2个参数传入的是c，则删除c及后续的d、e等兄弟节点，  // 而这里，第2个参数传入的是 currentFirstChild，则意味着删除returnFiber节点下所有的子节点  // 为什么要删除呢？这是因为，为了保证前后两棵树是一致的，若jsx在workInProgress所在树中，无法转为fiber节点，  // 说明 returnFiber 下所有的fiber节点均无法复用  return deleteRemainingChildren(returnFiber, currentFirstChild);}
```

从上面的部分源码中可以看到，在 React 解析 jsx 时，它只会解析一些固定类型的节点，如：

*   函数组件类型的；
    
*   类组件类型；
    
*   html 标签类型的；
    
*   纯文本类型的，如字符串或数字格式；
    
*   portal 类型的；
    
*   lazy 类型的；
    
*   数组类型（这个会递归解析每一项）；
    

而诸如 null, undefined, boolean 等类型的节点，则会直接跳过。因此，在一些比较复杂的判断中，有些不希望展示在页面中的，则可以返回这些类型的值。

针对开头样例中的逻辑与运算符，当`isShow`为 false 时，React 会跳过该数据的渲染，因此这里就会展示为空。

因此，若一个表达式的结果 boolean 类型时，不论是 true 还是 false，都不会转为 html，而是直接跳过。

![](https://mmbiz.qpic.cn/mmbiz_png/YBFV3Da0Nwt7qqUywpNb0He4PpaGj3yfOA9oevy0kdQdJCFd1WibyibnZAdiaOgsycXHrAGUPoEZYU8OueicPkn2KQ/640?wx_fmt=png)

[React 组件多次调用时如何区分不同的 div 容器](http://mp.weixin.qq.com/s?__biz=MzA5ODM5NTYyMA==&mid=2653285792&idx=1&sn=340727749a90f58b500ff236bf1d49ec&chksm=8b43792bbc34f03df54726edaba3d98a0d0c4a357c28f586912e42ab401b4b560c3ddb95f935&scene=21#wechat_redirect)  

[使用 nextjs 重构了我的个人博客系统](http://mp.weixin.qq.com/s?__biz=MzA5ODM5NTYyMA==&mid=2653285757&idx=1&sn=b0c49e78e3364a50b8a988537c84f2f7&chksm=8b4379f6bc34f0e0cb27bfb442f89552648edd9792372742e0af9bd77161fcceaddd86a5e802&scene=21#wechat_redirect)  

[React 中 useState 和 useRef 与全局变量的区别](http://mp.weixin.qq.com/s?__biz=MzA5ODM5NTYyMA==&mid=2653285685&idx=1&sn=4c594a1094f6a22677c99152e66efe2f&chksm=8b4379bebc34f0a8dae2f2e53237369771960bc1e55774c0d68115e4cceeaf6bfdd09ff1d91c&scene=21#wechat_redirect)  

![](https://mmbiz.qpic.cn/mmbiz_jpg/YBFV3Da0Nwt7qqUywpNb0He4PpaGj3yf529Acb1YkfG4Qd7ibPI86cFsibe9xbaVPMsrFOicZniabLMocx5EOC1LRQ/640?wx_fmt=jpeg)

▼我是来一名小小的前端开发工程师，

  

  

  

  

  

  

  

  

长按识别二维码关注，与大家共同学习▼  

  

  

  

  

  

  

  

  

  

  

  

  

![](https://mmbiz.qpic.cn/mmbiz_png/b77xA98980FhicYXcqe4JKmNQX3IibTo2grYBrUjFDr754PDwjYc8MrhqYibqXiap2GQKIsaoSE4rJjawIa5GFiaW2Q/640?wx_fmt=png)