> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/vtBHEPDEoqgBxsIJ1Cn9Aw)

> 防抖是前端业务常用的工具，也是前端面试的高频问题。平时面试候选人，手写防抖人人都会，但是稍做修改就有小伙伴进坑送命。本文介绍了如何在 react hooks 中实现防抖。

背景  

—

防抖（debounce）是前端经常用到的工具函数，也是我在面试中必问的一个问题。团队内部推广 React Hooks 以后，我在面试中也加入了相关的题目。如何实现`useDebounce。`这个看起来很基础的问题，实际操作起来却让很多小伙伴漏出马脚。

面试的设计往往是这样的：

1.  什么是防抖、节流，分别解释一下？
    
2.  在白纸上手写一个防抖 or 节流函数，自己任选（限时 4 分钟）
    
3.  react hooks 有了解吗？上机实现一个 useDebounce、useThrottle，自己任选
    
4.  typescript 有了解吗？用 ts 再来写一遍
    
5.  聊一聊用到防抖、节流的业务场景
    

围绕一个主题不断切换考察点，这样一轮下来，轻松又流畅，同时可以试探出很多信息。

实际情况是，很多候选人在第 3 题就卡住了，不得不说很可惜。

场景还原  

—

#### 写一个防抖函数  

一个经典的防抖函数可能是这样的：

```
function debounce(fn, ms) {
  let timer;
  return function(...args) {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      fn(...args)
      timer = null;
    }, ms);
  }
}
```

改成 react hooks  

先提供测试用例：

```
export default function() {
  const [counter, setCounter] = useState(0);

  const handleClick = useDebounce(function() {
    setCounter(counter + 1)
  }, 1000)

  return <div style={{ padding: 30 }}>
    <Button
      onClick={handleClick}
    >click</Button>
    <div>{counter}</div>
  </div>
}
```

很多小伙伴会想当然的就改成这样：

```
function useDebounce(fn, time) {
  return debounce(fn, time);
}
```

简单、优雅，还复用了刚才的代码，测试一下，看起来并没有什么问题：

![](https://mmbiz.qpic.cn/mmbiz_gif/cNzGQic94CAGQCbDPcG0GlhPPjqWJgHqw2O9rRwwuXMbvkNE8AquiazNAriagmmYrA8kqxiaEdMk22vWibSowCiazzbA/640?wx_fmt=gif)

但是这个代码如果放上生产环境，你会被用户锤死。

真的吗？

#### 换个用例来试一下：

```
export default function() {
  const [counter1, setCounter1] = useState(0);
  const [counter2, setCounter2] = useState(0);

  const handleClick = useDebounce(function() {
    console.count('click1')
    setCounter1(counter1 + 1)
  }, 500)

  useEffect(function() {
    const t = setInterval(() => {
      setCounter2(x => x + 1)
    }, 500);
    return clearInterval.bind(undefined, t)
  }, [])


  return <div style={{ padding: 30 }}>
    <Button
      onClick={function() {
        handleClick()
      }}
    >click</Button>
    <div>{counter1}</div>
    <div>{counter2}</div>
  </div>
}
```

![](https://mmbiz.qpic.cn/mmbiz_gif/cNzGQic94CAGQCbDPcG0GlhPPjqWJgHqw29nMTMpapPpqbV70Y7PCbNfH9u1aeeUQuqwvVygnrJ2oKFCJsW5drA/640?wx_fmt=gif)

当引入一个自动累加 counter2 就开始出问题了。这时很多候选人就开始懵了，有的候选人会尝试分析原因。只有深刻理解 react hooks 在重渲染时的工作原理才能快速定位到问题（事实上出错不要紧，能够快速定位问题的小伙伴才是我们苦苦寻找的）。

有的候选人开启_**胡乱**_调试大法，慌忙修改 setCounter1：

```
const handleClick = useDebounce(function() {
    console.count('click1')
    setCounter1(x => x + 1)
  }, 500)
```

当然结果依然错误，而且暴漏了自己对 react hooks 特性不够熟悉的问题……

有的候选人猜到是重渲染缓存的问题，于是写成这样：

```
function useDebounce(fn, delay) {
  return useCallback(debounce(fn, delay), [])
}
```

在配合`setCounter1(x => x + 1)`修改的情况下，可以得到看似正确的结果。但并没有正确解决问题（再说你也不能通过 “**改用例**” 的方式来修 bug 呀😂）。依然是错误的。有兴趣的读者可以复现一下这个现象，思考一下为什么，**欢迎留言讨论**。

#### 问题出在哪里？

我们在 useDebounce 里面加个 log

```
function useDebounce(fn, time) {
  console.log('usedebounce')
  return debounce(fn, time);
}
```

![](https://mmbiz.qpic.cn/mmbiz_gif/cNzGQic94CAGQCbDPcG0GlhPPjqWJgHqwn9JcnxbFtQA94QAH90uAgyfS4NibXBgicAibcVQs2H9PRsWnURXXz3Acw/640?wx_fmt=gif)

控制台开始疯狂的输出 log。看到这里，很多读者就明白了。如果是前面表现稍好的候选人，可以提示到这一步。

每次组件重新渲染，都会执行一遍所有的 hooks，这样 debounce 高阶函数里面的 timer 就不能起到缓存的作用（每次重渲染都被置空）。timer 不可靠，debounce 的核心就被破坏了。

#### 如何调整？

修复这个问题可以有很多办法。比如利用 React 组件的缓存机制：

```
function useDebounce(fn, delay) {
  const { current } = useRef({});
  function f(...args) {
    if (current.timer) {
      clearTimeout(current.timer);
    }
    current.timer = setTimeout(fn.bind(undefined, ...args), delay);
  }
  return f;
}
```

就可以实现一个可靠的 useDebounce。

同理我们直接给出 useThrottle 的代码：

```
export function useThrottle(fn, delay) {
  const { current } = useRef({});
  function f(...args) {
    if (!current.timer) {
      current.timer = setTimeout(() => {
        delete current.timer;
      }, delay);
      fn(...args);
    }
  }
  return f;
}
```

最后  

—

使用 react hooks 可以帮助我们把一些常用的状态逻辑沉淀下来。同时，react hooks 引入生产项目的初期要格外留意_写法和原理的差异_所带来的隐患。不然就像上面的候选人一样大意失荆州……

分析一下这道题的易错原因：

*   马虎大意。debounce 很简单，react hooks 也不难，万万没想到结合起来就有坑
    
*   心态崩坏。面试场景下，遇到没有见过的问题，无法冷静分析。
    
*   对 react hooks 理解不够深刻，踩坑不多
    
*   对 debounce 也不够熟悉，有背代码的嫌疑
    

由于太多人挂在这个问题上，我决定不再用作面试题，并把它分享出来，希望可以帮到大家。关于防抖还有哪些坑呢？**欢迎留言讨论**。