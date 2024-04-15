> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/dRzJZELulsH7ckehDn_kYg)

群友在一次字节的面试中，被要求实现 `useToggle`。

> useToggle 表示两个状态的来回切换

群友一想，这还不简单，于是就咔咔一顿写，两三笔就把该功能实现了。

```
function useToggle(value: boolean) {  const [state, setState] = useState(value)  const toggle = () => {    setState(!state)  }  return {state, toggle}}
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcGhwm356JaqptOViaT41RWWvcMXbuaqLCj4VZfcyUQ5QOFBSHIVgT8qJU7PRQIu8L8b7QM4NaGJ6ibQ/640?wx_fmt=png&from=appmsg)

搞完之后，面试官看到代码却说

> 不太对，组件重新渲染，导致这个 hook 重新执行了，状态就变了

这下直接给群友整不会了，咋回事？为什么字节面试官说的东西跟他理解的不一样。百思不得其解之下，在面试之后又去研究了很多方案，最后实在没想通，又跑到群里来讨论。

那么问题来了，截图中，群友口中所说的字节面试官的这种说法是否靠谱呢？

0
-

**很显然不靠谱**

从功能实现的角度上来说，上面那一段代码，其实是没有任何的问题的。

当组件重新渲染时，hook 会不会重新执行？当然会。

但是 hook 重新执行，状态会不会发生变化？**不会**。

> 这里我们讨论的是由其他状态的变化导致组件 re-render，从而导致 toggle 的状态被重置或者变化

在 React 中，hook 是基于闭包来实现，因此几乎每个 hook 理论上都具有缓存能力。我们常用的这些 hook：`useState`、`useRef` `useReducer` `useEffect` `useMemo` `useCallback` 他们都有一些共性，那就是缓存能力。然后在语义上有一些差异。

面试官这样的说法，很明显是在学习的时候，跟许多人犯了同样一个错误，只关注了他们差异的部分，而没有关注他们共性的部分。

因此，在群友的这段实现中，如果由其他状态引发的 hook 重新执行，useToggle 的状态会被 `useState` 缓存，状态本身的值不会发生变化。否则，React 的根基都要被动摇了。

那么面试官为什么要这样说呢？

一种可能就是面试官本身在工作实践中没有正确理解 React 的 hook，并且过于依赖了 useMemo useCallback，忽视了其他 hook 的缓存能力导致了错误的解读。

另外一种情况就是在没有得到自己想要的答案时，自动切入了压力测试环节，试图通过**否定候选人**逼问出满意的答案。或者通过压力测试观察候选人的知识面中更多的维度。

1
-

**有其他实现吗**

有的。该群友找到了 `ahook` 的实现，代码如下

```
function useTgoggle2(value: boolean, reverseValue?: boolean) {  const [state, setState] = useState(value)  const actions = useMemo(() => {    const reverseValueOrigin = reverseValue === undefined ? !value : reverseValue;    const toggle = () => {      setState(prev => {        return prev === value ? reverseValueOrigin : value      })    }    return toggle  }, [])  return {state, actions}}
```

和他写的版本相比，代码看上去丰满了许多。一看就很高端。

但是另他想不通的地方在于，使用了 useMemo 之后，和他写的那个版本，有什么区别吗？或者说，有什么好处吗？

他的第一个解读是，`useMemo` 因为缓存了函数，所以减少了函数的重复声明。

这种理解对不对呢？错。

许多人都会有这样的误解。事实却是，`useMemo` `useCallback` 不会减少函数的声明。

我们把匿名函数，换成一个有名字的函数，就能快速理解了

```
function xxx() {  const reverseValueOrigin = reverseValue === undefined ? !value : reverseValue;  const toggle = () => {    setState(prev => {      return prev === value ? reverseValueOrigin : value    })  }  return toggle}const actions = useMemo(xxx, [])
```

实际上在 useMemo 执行之前，函数 xxx 都会重新声明。包括 `useMemo` 传入的第二个参数的空数组，它也是被重新声明的。

useMemo 控制的是赋值次数，而不是声明次数。

既然这样，又不能减少函数声明次数，那 useMemo 的作用在哪里呢？

在这个案例中，他的作用就是：保持 `actions` 的引用稳定。当组件重新渲染时，`actions` 的引用不会因为 `re-render` 而发生变化。

这样，当使用者将 `actions` 作为参数传递给其他组件时，可以保证 actions 的引用是没有发生变化的。

```
const {state, actions} = useToggle(true)...<OtherComponent action={actions} />
```

那么这个时候，如果我们在声明 `OtherComponent` 时使用了 `memo`，OtherComponent 就不会因为父组件的 `re-render` 而重新渲染。

这里需要明确的是，单独使用 `memo` 是没有用的。关于更具体的细节，在我们之前的性能优化章节中有详细聊到。

当然实际上这里就涉及到另外一个问题的探讨，我们是否应该在工具库底层使用 `useCallback` 或者 `useMemo` 来缓存函数的引用呢？

实际上在付费群里我们曾经对这个问题也有过争议。

我个人的观点是：**没有必要。**因为对于使用者而言，我们想要保证性能优化的目标达成，那么就必须同时使用 `useMemo/useCallback` + `memo`。他们两的共同作用下，能减少函数的 `re-render`，从而达到性能优化的目的。

一种情况是，需要这样做的场景很少。

另外一种情况是，这可能对使用者造成误解。认为只需要 `memo` 就可以完成性能优化了。

这种优化方式不是**完全无感**的，他需要使用者配合另外一半。因此这就要求使用者必须完全了解工具库的底层实现才可以完美的配合你。或者更聪明的使用者也不会关注你底层是怎么实现，他自己又单独包裹一层 `useMemo/useCllback`

2
-

**面试时答案被否定**

咋说呢，这个现象其实非常普遍。

很多人在面试的时候，特别是在面一些好团队时，遇到这种情况都会很懵逼。被人否定之后就习惯性地怀疑自己的答案有问题。从而导致后面的回答因为紧张和自我怀疑陷入一种恶性循环，给人一种整场表现都很差的感觉。

有几种不同的情况会出现这种局面。

1、**有的面试官比较善于抓住候选人的缺点不停拷打**，进而证明候选人能力不足。这其实违背了面试的本质。好的面试官反而更应该懂得如何挖掘候选人的优势，而不是在候选人不擅长的点上反复纠缠。

当然，这也可以理解，现在**越来越多的面试官会陷入这种困境**，很大一部分原因是因为太多的求职者在简历、面试中夸大自己的能力，把本来不属于自己的项目经历包装成自己的，面试官与求职者信任关系的破裂，是主要是的因素之一。

当然，还有一部分原因是因为需要**挖掘别人的优势对面试官本身的个人能力有非常高的要求**，并不是每个面试官都具备这样的能力。因此，在这种情况下，一个比较好的技巧和方式就是主动自己先明确好自己的优势在哪里，并且在聊天过程中主动展示。

除此之外，也包括部分求职者，属于是找了半天，浑身下上就没可挖掘的优势。

2、**压力测试**。或者说，故意在面试过程中给求职者施加压力。让求职者认为自己在这场面试里表现得不好。哪怕有的面试官对求职者非常欣赏，也不会表现出来。

所以很多时候，有的人虽然自己拿到了 offer，但是自己都感觉非常意外，因为自我感觉确实面试表现不是很好，在这种情况下还能拿到 offer，实属是万万没想到。

当然，为什么要这样做，不同的团队有不同的原因，可能是为了看看别人在压力环节下的表现，可能是为了更好的打压薪资，或者是为了让求职者更加珍惜这个工作机会等等。

但是压力测试也不是每个面试官都能轻松拿捏的，经常容易玩崩，让别人对你这里的面试体验感觉非常差。

3、**确实是求职者思路不对，回答错了**。这种情况下最好是能在面试官的引导下快速思考错误原因，并给出正确的解法。当然，如果实在不行，就直接承认自己确实这方面比较薄弱比较好。但是不少人为了补救，会多说很多不沾边的内容，反而会错得更离谱。

3
-

**总结**

许多人虽然掌握了某些知识，但是没有构建完整的知识体系，因此在面对别人反问或者质问时会表现得非常慌乱。

完善自己的知识体系，对自己所表达的观念和结论有笃定的判断，可以避免在这种情况之下让沟通往更坏的情况发展。

> **「React 知命境」** 是一本从知识体系顶层出发，理论结合实践，通俗易懂，覆盖面广的精品小册，点击下方标签可阅读其他文章。

> [购买 React 哲学](http://mp.weixin.qq.com/s?__biz=MzI4NjE3MzQzNg==&mid=2649867007&idx=1&sn=6443ff970cd077bbb50de74ce84afa06&chksm=f3e5936cc4921a7aba3fbf748b2f5a40369d8be7b6b2acf618f0701f477abea48b00e953165e&scene=21#wechat_redirect)，或者赞赏本文 30 元，可进入 **React 付费讨论群**，学习氛围良好，学习进度加倍。