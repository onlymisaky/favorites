> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/nv7iVRjyMKS8CzIJ-Aim3A)

大厂技术  高级前端  Node 进阶

点击上方 程序员成长指北，关注公众号

回复 1，加入高级 Node 交流群

作者：晚安啦  
https://juejin.cn/post/7223325932357795895

React.js 目前是前端开发人员十分流行的 JavaScript 库。它由 Facebook 发明，但作为开源项目提供给世界各地的开发人员和企业使用。

React 真正改变了我们构建单页面应用程序的方式，其中最大的特点之一是函数组件的应用。Hooks 是 19 年推出的，使我们能够在处理状态时使用函数组件而不是基于类的组件。除了内置的 hooks 外，React 还提供了实现自定义 hooks 的方法。

这里是一些我最喜欢的自定义 hooks 实现，您也可以在自己的应用程序和项目中使用。

1. useTimeout
-------------

使用这个 hooks，我们可以使用声明式方法来实现 setTimeout。首先，我们创建一个自定义 hooks 子，其中包含回调函数和延迟参数。然后，我们使用 useRef hooks 为回调函数创建一个引用。最后，我们两次使用 useEffect，一次用于记住上次的回调函数，一次用于设置超时并清理。

以下是一个计时器的实现示例：

```
import {useEffect} from 'react'const useTimeout = (callback,delay)=>{  const savedCallback=React.useRef();  useEffect(()=>{      savedCallback.current=callback  },[callback]);    useEffect(()=>{      const tick=()=>{          savedCallback.current();      }      if(delay!==null){          let id=setTimeout(tick,delay);          return ()=>clearTimeout(id);      }  },[delay])}
```

2. useInterval
--------------

如果你想以声明性的方式实现 setInterval，你可以使用名为 useInterval 的 hooks。

首先，我们需要创建一个自定义 hooks，接受一个回调函数和一个延迟时间作为参数。然后，我们使用 useRef 为回调函数创建一个 ref。最后，我们使用 useEffect 来记住最新的回调函数，并设置和清除间隔。

该示例展示了自定义 ResourceCounter 的实现。

```
import {useRef,useEffect} from 'react';const useInterval = (callback,delay)=>{  const savedCallback=React.useRef();  useEffect(()=>{      savedCallback.current=callback  },[callback]);    useEffect(()=>{      const tick=()=>{          savedCallback.current();      }      if(delay!==null){          let id=setInterval(tick,delay);          return ()=>clearInterval(id);      }  },[delay])}
```

3. usePrevious
--------------

这是另一个可以在我们的应用程序中使用的很棒的自定义钩子。通过它，我们可以存储 props 或先前的状态。首先，我们创建一个接受值的自定义钩子。然后，我们使用 useRef 钩子为该值创建一个 ref。最后，我们使用 useEffect 来记住最新的值。这个示例展示了一个计数器的实现。

```
import {useRef,useEffect} from 'react';const usePrevious=value=>{    const ref=useRef();    useEffect(()=>{        ref.current=value    }, [])    return ref.current;}
```

4. useClickInside
-----------------

如果你需要处理包装组件内部的点击事件处理，那么 useClickInside hooks 就是适合你的选择。首先，我们创建一个自定义 hooks，它接受一个 ref 和一个回调函数来处理点击事件。然后，我们使用 useEffect 来附加和清除点击事件。最后，我们使用 useRef 为需要被点击的组件创建一个 ref，并将其传递给 useClickInside hooks。

```
import {useEffect} from 'react';const useClickInside = (ref,callback)=>{    const handleClick=e=>{        if(ref.current&&ref.current.contains(e.target)){            callback();        }    };    useEffect(()=>{        document.addEventListener('click',handleClick);        return ()=>{            document.removeEventListener('click',handleClick);        }    }, [])}
```

5. useClickOutside
------------------

useClickOutside hooks 与 useClickInside hooks 非常相似，但它处理的是在包装组件外部的点击，而不是内部的点击。因此，我们再次创建一个自定义 hooks，它接受一个 ref 和一个回调函数来处理点击事件。然后，我们使用 useEffect 来附加和清除点击事件。最后，我们使用 useRef 为组件创建一个 ref，并将其传递给 useClickOutside hooks。

```
import {useEffect}from 'react';const useClickOutside = (ref,callback)=>{    const handleClick=e=>{        if(ref.current&&!ref.current.contains(e.target)){            callback();        }    };    useEffect(()=>{        document.addEventListener('click', handleClick);        return ()=>{          document.removeEventListener('click', handleClick);        }    }, [])}
```

6. 参考
-----

> 8 Awesome React Hooks -- Simon Holdorf    
> https://link.juejin.cn/?target=https%3A%2F%2Fmedium.com%2Fbetter-programming%2F8-awesome-react-hooks-2cb31aed4f3d

**—— The  End ——**

### 

Node 社群  

```
我组建了一个氛围特别好的 Node.js 社群，里面有很多 Node.js小伙伴，如果你对Node.js学习感兴趣的话（后续有计划也可以），我们可以一起进行Node.js相关的交流、学习、共建。下方加 考拉 好友回复「Node」即可。

   “分享、点赞、在看” 支持一下

```