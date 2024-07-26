> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/HzXGJSrWpRVueQP_CqB1rw)

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcEXgibMnAPS1p0Dof6aSTxtwSFvlIQKeeTlv3icXBJiaFSMiaYbXEaZmk225ZFOzklSbKLskMvR5Uz2aA/640?wx_fmt=png&from=appmsg)

时间是过得真快，从刚开始决定 all in tailwindcss，到现在非常熟练的使用，已经过去了一个多月的时间了。在这个期间，我写了几篇文章给大家分享我的使用感受。但是呢，还是有很多人不理解我为什么如此推崇它，因此，我决定再写一篇文章，来跟大家分享一下，在真实项目中，我是如何使用 tailwindcss 的。

* * *

### 区分基础能力与高度封装

随着几个版本的迭代，为了增强自己的适用范围，tailwindcss 发展方向逐渐开始**演变成提供基础能力**，而非一个高度封装之后的产物。

例如对于个别团队来说，我们会在设计规范的约束下，只需要几种有限的尺寸和颜色，例如，`primary、danger、warning`。这样的结果就是针对特定的团队会非常有用和便利，但是有的团队无法达成这样的设计规范约束。

我们可以很明显的发现这种变化规律，因为 tailwindcss 最开始并不支持这样的写法，但是现在支持了。

```
// 表示宽度 200pxw-[200px]
```

在有的道友的认知里，认为 `tailwindcss` 是一种高度封装的结果，他就应该拿来即用，快速提高我的开发效率，又能保持良好的可读性和可维护性。这肯定是很难做到的。它提供的只是基础能力，任何样式内容一旦变多，就必然会导致可读性的下降。**这样的想法让许多道友无法 get 到 tailwindcss 的优点。**

当然，在 tailwindcss 的设计里，它也试图在封装能力与基础能力之间取得一个合理的平衡，既能够提供他们团队认为最合适的设计规范语言，又能够满足自定义的需求，所以它的使用需要配合自定义配置才能达到更理想的效果，这样做的坏处就是提高了使用门槛。

> ✓
> 
> 好消息是下一个大版本 tailwindcss 4 简化了自定义 class 的配置，它更接近于直接在 css 文件中写样式，而不是在一个工程化的配置文件中写插件

因此，我们需要把 tailwindcss 提供的方式当成一种基于 css，但是又区别于 css 的一种新的基础能力去看待。我们要从另外一个角度去思考，在这样的基础能力之下，我们应该如何在项目中使用它。

> !
> 
> > 有的道友比较欠缺这样的思维方式，因此它写的 css 代码其实也不具备可读性和可维护性。

* * *

### 如何封装

这里有两个层面的考虑。

第一个层面是我们可以把以前对 css 的处理方式拿过来直接使用。例如，你发现在你的项目中，你大量使用了 flex 来实现子元素的居中，那么你就可以将这部分逻辑封装成一个 class，然后直接使用

```
.center {  display: flex;  justify-content: center;  align-items: center;}
```

在 scss 或者 less 中，我们可以使用继承的方式来复用它

```
.box {  @extend .center;  border: 1px solid red;}
```

那么在 tailwindcss 中，你可以将其处理成一个插件，这样做的好处是在使用时可以被 tailwindcss 提供的智能提示插件捕获，减少记忆负担

```
plugin(({addComponents, theme}) => {  addComponents({    '.center': {      display: 'flex',      justifyContent: 'center',      alignItems: 'center',    }  })}),
```

例如我封装的一个 `.card`

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcEXgibMnAPS1p0Dof6aSTxtwza2hYPy245CSHRHiad5q64MtX4vahojTo0rCLtNBgwziaRSrZaqp5l3w/640?wx_fmt=png&from=appmsg)

当然，由于我使用了 webstorm，也不知道这是哪个插件的能力，只写在 class 中，也有智能提示，所以你也可以这样写

```
.center {  @apply flex items-center justify-center;}
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcEXgibMnAPS1p0Dof6aSTxtwKIb4dyU2DmMD0SQxuVPZE6CicgEDswGulvwicrqeHvL1yUKDbcAiaEdgQ/640?wx_fmt=png&from=appmsg)

tailwindcss 本身也提供了非常一些常用的封装，例如 `line-clamp-1` 表示一行超出的内容显示省略号。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcEXgibMnAPS1p0Dof6aSTxtwNWjHBmAu9OeVfErID3S0FNa4oialvKDHOiaMpcqLZrIDVcA4FnMmMJnw/640?wx_fmt=png&from=appmsg)

这样的处理非常适合一些单元素样式的封装。也是我们在实践中非常常用的方式之一。不过对于部分开发者而言，这里唯一比较头疼的就是，它要结合公司给提供的设计规范来使用才能发挥最大的威力，**许多团队并没有设计规范**

* * *

### 容器组件的封装思考

第二个层面，我结合了组件化的思路，来在这个基础能力之上做二次封装。**得益于鸿蒙开发在布局上的启发**，我基于 tailwindcss 封装了一套比较完整的容器组件。

> ✓
> 
> 关于这个观点，你可以通过[这篇文章了解我的想法和感受](http://mp.weixin.qq.com/s?__biz=MzI4NjE3MzQzNg==&mid=2649868058&idx=1&sn=ebf4b3d126415f763777e0d3a3e6e3ca&chksm=f3e59689c4921f9f1e11144068b2d7acd4b4b99ff35a578bcc074ccebee310ea8419551006e8&scene=21#wechat_redirect)

tailwindcss 在基础能力上，比较欠缺的是语义化的表现能力。当然，这个问题，也存在于 html/css 中，因此，一套完整的容器组件有利于补全语义化的缺失。对于可读性而言，这个思考非常重要。

这里我以 **Flex** 组件为例，跟大家分享一下我的思考和想法。

首先，我们要把最常用的布局样式作为默认属性

```
const base = 'flex items-center flex-row'
```

由于默认是横向的，但是我希望能够简单的传入属性支持纵向布局，那么我就可以约定一个参数传入 `col=true` 使用如下。

```
<Flex col></Flex>
```

我在思考这个命名的时候，有考虑过到底是封装成这种有明确语义的单词来表达横向和纵向。

```
<Col></Col><Row></Row>
```

还是这种约定的方式来表达。纠结的原因是因为对 Col 和 Row 这两个单词不是很喜欢，所以最后决定使用这种约定式的方式。Flex 默认为横向，项目中 70% 的地方都是这么用的，少数情况下会使用到纵向，所以通过参数的传入来解决。

```
<Flex></Flex><Flex col></Flex>
```

这里还有一个重要的考虑。受到 unocss 的启发，我现在传参比较喜欢第二种简洁的表达方式

```
<Flex direction='col'></Flex><Flex col></Flex>
```

这里的一个技巧是把入参处理成布尔类型，然后在组件内部做判断

除此之外，还有对齐方式我们需要处理。在交叉轴的对齐方式上，我们 90% 的场景都可以处理成居中，因此在参数的考虑上，我就不在特别为了交叉轴而设计参数。但是在主轴上的使用变化就比较多，因此针对于每一个值，我都设计了参数

```
const {  children,   start,   end,   around,   between,   className,   center,   col,   ...other} = props
```

这里的 `start, end, around, between, center` 都是主轴的布局对应的值。

到目前为止，组件封装的代码如下

```
import clsx from 'clsx'// 默认方向为 Rowexport default function Flex(props) {  const {children, start, end, around, between, className, center, col, ...other} = props  const base = 'flex items-center flex-row'  const cls = clsx(base, {    ['flex-col']: col,    ['justify-start']: start,    ['justify-end']: end,    ['justify-around']: around,    ['justify-between']: between,    ['justify-center']: center,  }, className)  return (    <div className={cls}>{children}</div>  )}
```

这里还有一个非常重要的设计。那就是我还默认把  `className` 传入进来了。他之所以重要是因为在 tailwindcss 的机制之下，有了这个传入，我可以**渐进式补全**我的组件封装。

例如，在这种情况之下，我并没有额外再单独处理主轴的属性值。但是我可以在 className 中传入进来补全我的这个逻辑缺失。当然由于这是小概率事件，因此我最终也决定不再额外补充逻辑去处理这种情况

```
<!-- 使用时的写法也会非常简洁 --><Flex between class></Flex>
```

此时，比如我还想支持以 `bg` 开头的背景颜色，但是在 tailwindcss 中，支持的背景颜色太多了，我如果想要用同样的方式来处理肯定是不行的，那么怎么办呢？

```
<Flex bg-green-200></Flex>
```

要支持上面这种写法，这里有一个非常巧妙的技巧，那就是我们可以遍历传入的参数，然后识别 key 值将其转化为正常的 className 即可。

例如这里，我定义一个字符串用于接收背景相关的属性，然后遍历 props 并识别出以 `bg-` 开头的属性。

```
let bgclass = ''Object.keys(other).forEach(key => {  if (key.indexOf('bg-') === 0) {    bgclass += `${key} `  }})
```

这种方式可以发挥的想象空间非常大，例如，我这里处理了背景、边框、圆角相关的属性，完整的代码如下

```
import clsx from 'clsx'import {twMerge} from 'tailwind-merge'// 默认方向为 Rowexport default function Flex(props) {  const {children, start, end, around, between, className, center, col, ...other} = props  const base = 'flex items-center flex-row'  let bgclass = ''  let borderclass = ''  let roundclass = ''  Object.keys(other).forEach(key => {    if (key.indexOf('bg-') === 0) {      bgclass += `${key} `    }    if (key.indexOf('border') === 0) {      borderclass += `${key} `    }    if (key.indexOf('rounded') === 0) {      roundclass += `${key} `    }  })    const cls = clsx(base, {    ['flex-col']: col,    ['justify-start']: start,    ['justify-end']: end,    ['justify-around']: around,    ['justify-between']: between,    ['justify-center']: center,  }, bgclass, borderclass, roundclass, className)  return (    <div className={twMerge(cls)} {...other}>{children}</div>  )}
```

然后使用结果就变得非常简洁

```
<Flex between col bg-green-200 border border-green-600 rounded>  <div>1</div>  <div>1</div>  <div>1</div>  <div>1</div></Flex>
```

演示效果如图

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcEXgibMnAPS1p0Dof6aSTxtwhmvqLiagwJqzJLsXuqULricwib5sfTic6v3qibKSBeiaHnA7Qs27Njuib1Ksw/640?wx_fmt=png&from=appmsg)

当然，我们**还可以结合自己团队的设计规范进一步简化使用**，例如，在设计规范中，我默认所有的容器都是自带圆角的。这样我们传入的属性就会少一个，或者，当我们传入 border 相关属性时，就默认表示已经有一个边框存在了，这样，`border` 也不用传入了。这里每个团队的设计规范不一样，我就不再做演示。

> ✓
> 
> 当然，如果你的团队里没有这种设计规范，可能就很难感受到为啥能进一步简化了，因为你仍然还是会本能的当成了基础属性去思考

这样子封装之后，你就会发现，在使用上已经非常接近 unocss 的写法了。当然最关键的是，我们可以通过这种方式轻松把组件和语法处理成自己想要的样子。例如，有的同学不喜欢如下这种写法，觉得他比较不优雅

```
w-[200px]
```

我们就可以通过这种思路的转化，变成如下的方式传入

```
<Flex w-200></Flex>
```

* * *

### 进一步优化

有了这个思路之后，我们就可以按照这个思路封装一套语法简洁的容器组件。不过我们在封装思路上，还可以做的更好。由于对于 `bg-` `border-` `p-` 等属性的处理是一个通用逻辑。因此，我们应该把这些通用逻辑抽离出来单独处理

因此在底层，我还基于 tailwindcss 封装了一个基础元素组件，专门用来处理这些通用转化逻辑。

> ✓
> 
> 更多的属性大家在使用时需要自行扩展

```
function TailwindDiv(props) {  const {className, children, ...other} = props  let bgclass = ''  let borderclass = 'border'  let roundclass = 'rounded'  Object.keys(other).forEach(key => {    if (key.indexOf('bg-') === 0) {      bgclass += `${key} `    }    if (key.indexOf('border-') === 0) {      borderclass += ` ${key} `    }    if (key.indexOf('rounded-') === 0) {      roundclass += ` ${key} `    }  })  const cls = clsx(bgclass, borderclass, roundclass, className)  return (    <div className={twMerge(cls)} {...other}>{children}</div>  )}
```

那么 Flex 的封装就可以简化一下，只关注自身语义相关的逻辑即可。

```
import clsx from 'clsx'import {twMerge} from 'tailwind-merge'// 默认方向为 Rowexport default function Flex(props) {  const {children, start, end, around, between, className, center, col, ...other} = props  const base = 'flex items-center flex-row'  const cls = clsx(base, {    ['flex-col']: col,    ['justify-start']: start,    ['justify-end']: end,    ['justify-around']: around,    ['justify-between']: between,    ['justify-center']: center,  }, className)  return (    <TailwindDiv className={twMerge(cls)} {...other}>{children}</TailwindDiv>  )}
```

最终的使用结果如下

```
<Flex col between bg-green-200 border-green-600>  <div>1</div>  <div>1</div>  <div>1</div>  <div>1</div></Flex>
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcEXgibMnAPS1p0Dof6aSTxtwW65xGvrHIVO4DoDWA1uRTXxIIvLmsp1LmlEa8OhGPTJkvsxFM3mkdQ/640?wx_fmt=png&from=appmsg)

和不封装相比，无疑是在简洁性和可读性上都有了较大的提高。并且在易用性上也也没有任何损失。还提高了可读性。

```
<!--直接使用--><div className='flex items-center justify-between flex-col border border-green-600 bg-green-200 rounded'>  <div>1</div>  <div>1</div>  <div>1</div>  <div>1</div></div>
```

* * *

### 总结

tailwindcss 目前的版本，更加偏向于提供基础能力，因此如果要用得很完美的话，需要在这个基础能力之上，结合团队的设计规范、或者你自己约定一些自己习惯的设计规范，做额外的处理和封装。当然，在一些小项目中，我们可以不考虑封装这个事情。在这个理念的支撑之下，我们可以进一步通过几种思路进行定制，把他处理成你偏好的样子。

文中所提到的我封装了一套容器组件，是按照我目前的个人偏好来设计的封装规则，一方面是通过组件命名来增强语义化表现，另外一方面通过传入布尔型参数的方式来简化使用，并且调整不喜欢的语法。封装之后更加偏向于 unocss 的语法习惯。

> ✓
> 
> 因此，如果你更喜欢 unocss，但是又比较眼馋 tailwindcss 更完整的生态，你可以按照我的思路自己处理一下就二者兼得了。

使用 tailwind 之后，很明显的一个感受就是，我的代码变得更加简洁了。他可能会有如下好处

*   1、不用思考命名
    
*   2、不用担心 css 作用域的问题，从而可以避免使用 scss、less、css modules、css in js 等额外的技术方案
    
*   3、不用频繁的额外单独创建一个 css 文件，可以直接在 html 中表达样式
    
*   4、打包体积变小
    
*   5、稍作修改，可以极大的提高项目的可维护性
    
*   6、极大的提高了开发效率
    
*   7、最重要的是**开发变得更加顺畅**，所见即所得，不用样式分离
    

**本文内容相关的推荐阅读**

[用过 tailwindcss 才知道，命名真的是顶级痛点](http://mp.weixin.qq.com/s?__biz=MzI4NjE3MzQzNg==&mid=2649869950&idx=1&sn=6a2e8ecc67d25297c89f2ef34001c48d&chksm=f3e59fedc49216fbe787c1d41617de2ede04c4b70c8b2759fa554afef37ea8a24dc8a2a08171&scene=21#wechat_redirect)

[研究三天，我找到了 tailwindcss 的正确打开姿势](http://mp.weixin.qq.com/s?__biz=MzI4NjE3MzQzNg==&mid=2649869991&idx=1&sn=4047d3c4886ccd41f845628df7b5aaac&chksm=f3e59f34c492162225335efdd7b5a26967a9990d054f321de0a07ccf3a11f7253248d60aa30c&scene=21#wechat_redirect)

[苦练七天，魔功大成，我已彻底拿捏 tailwindcss](http://mp.weixin.qq.com/s?__biz=MzI4NjE3MzQzNg==&mid=2649870058&idx=1&sn=d819345720df2c0b1639f0fe413d3b83&chksm=f3e59f79c492166f2fc951576ba68e7f596c43f495f34aa2e1dc2f066c4882b158c9145a26b3&scene=21#wechat_redirect)

[鸿蒙开发体验，比 React 更好](http://mp.weixin.qq.com/s?__biz=MzI4NjE3MzQzNg==&mid=2649868058&idx=1&sn=ebf4b3d126415f763777e0d3a3e6e3ca&chksm=f3e59689c4921f9f1e11144068b2d7acd4b4b99ff35a578bcc074ccebee310ea8419551006e8&scene=21#wechat_redirect)

* * *

### 友情链接

[React 哲学](http://mp.weixin.qq.com/s?__biz=MzI4NjE3MzQzNg==&mid=2649867007&idx=1&sn=6443ff970cd077bbb50de74ce84afa06&chksm=f3e5936cc4921a7aba3fbf748b2f5a40369d8be7b6b2acf618f0701f477abea48b00e953165e&scene=21#wechat_redirect)