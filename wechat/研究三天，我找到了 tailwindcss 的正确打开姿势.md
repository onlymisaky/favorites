> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/glr73rMrwqbVmjm6GNLAzA)

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcGHupb3zicvCZcWEGd692WG2NloaGLYYRgpbpKlwh1VgyScQqA4Cibp2Sm62bFHaXZR9WLRibJegV2dg/640?wx_fmt=png&from=appmsg)

因为决定深度使用 tailwindcss，所以在几个群里都有跟群友们请教使用经验。结果不讨论还好，一讨论大家的兴致都特别高，有吹爆 tailwindcss 的，也有对它不屑一顾的，还有觉得 unocss 更好用的...

我结合群友的使用经验，又整合了一些以前封装组件的使用思路，并且借鉴了 unocss 的语法，摸索出了一套使用简洁的最佳实践分享给大家

*   一、最显眼的那个痛点可能并不存在
    
*   二、无 CSS 是准确方向
    
*   三、封装思维的小转变，带来极致使用体验
    
*   四、便利小工具：cva、twMerge、clsx
    
*   五、额外配置插件，让智能提示更智能
    

_0_
---

**重新审视那个痛点**

tailwindcss 的初印象给人的感受并不是很好，冗长的 class 名一看就感觉代码会很糟心。这也是我很长一段时间都没有使用 tailwindcss 的重要原因。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcGHupb3zicvCZcWEGd692WG2IMOwKYXom24g8dm6k6evsRMqHEIk8bqS6QotB55wBQ4Nxe3N77Dn7A/640?wx_fmt=png&from=appmsg)

一条属性一句代码，必然会导致某些元素 class 名会非常长冗长。但是当我深度使用 tailwindcss 之后，我觉得有必要重新审视这个痛点，**它可能并不存在**，因为有非常多的方式可以避免复杂的样式

举个例子，下面有一段代码，我们写了一大堆 className，并且他在多个元素中反复出现

```
<div className='flex items-center text-gray-700 bg-white px-8 py-5 transition hover:bg-amber-100'></div><div className='flex items-center text-gray-700 bg-white px-8 py-5 transition hover:bg-amber-100'></div><div className='flex items-center text-gray-700 bg-white px-8 py-5 transition hover:bg-amber-100'></div>
```

那么，我们可以在函数组件中，就近将这些 class 名提取到一个字符串变量中。

```
var clx = 'flex items-center text-gray-700 bg-white px-8 py-5 transition hover:bg-amber-100'
```

然后使用一下子就变简单了

```
<div className={clx}></div><div className={clx}></div><div className={clx}></div>
```

> ✓
> 
> 有的时候，我们使用 tailwindcss 的目的其实是为了少创建一个 css 文件，因此，就近声明变量是我认为最好的方式，只有一些全局的、共用的可以单独提炼出来放到一个单独的文件中去

基于这个思路，按照我以前使用 css 的经验，我们可能会提取一些常用的，共性的属性与变量在全局中使用

```
export const center = 'flex items-center justify-center'export const card = 'border rounded-md p-4'... ...
```

实际上这里可以引申出来一个非常有意思的单元素组件样式封装思维。例如 `card`，有许多不考虑交互逻辑只考虑样式的组件都可以用这种方式来处理，使用时

```
<div className={card}></div>
```

当然，我们也可以直接封装逻辑更复杂的组件，具体的方式我们会在后面说。总的来说，我们确实有许多方案可以大幅度弱化冗长 className 堆在代码里，所以如果运用合理，我们完全可以避免长字符串，但是你也可以在偷懒的时候，直接随缘写，这完全取决于个人喜好

_1_
---

**无 css 是准确方向**

在技术手段上，我们可以继续在 css 中运用 tailwindcss。通过这种方式将许多 css 样式聚合成一个 class 名。tailwind 支持一种 `@apply` 语法来干这个事情，代码如下

```
.btn {  @apply rounded-md border border-solid border-transparent py-2 px-4 text-sm font-medium bg-gray-100    cursor-pointer transition}
```

我们自然可以使用这种方式将冗余的 class 名浓缩成一个 class 名，但是这种方式和直接使用 css 就没啥特别的区别了。因此意义并不是特别大

并且这种方式的大量运用会造成 tailwindcss 打包体积变小的优势变得荡然无存。

在一些个人 / 练手 / demo 项目中，我们可以轻量的这样使用，用于设置一些单一元素的组件一样，例如 button、input 等，这非常的方便。

```
button {  @apply rounded-md border border-solid border-transparent py-2 px-4 text-sm font-medium bg-gray-100    cursor-pointer transition}
```

但是在一些正规的项目中，我们都会针对这些组件做更多逻辑封装，就不再适用这样的使用方式了。因此，总的来说，我个人的观点非常明确，无 css 才是使用 tailwindcss 的正确方向

_2_
---

**封装思维的小转变，带来极致使用体验**

这个转变思维让我觉得我的组件变得非常简单。这个思路从 unocss 的传参方式中获得了灵感。例如我们要封装一个 Button 组件。假设该 Button 组件需要支持的情况如下：

*   语义类型：normal primary success danger
    
*   组件大小：small medium large
    

> i
> 
> > > 实际情况会更多，我们这里只做演示

那么，我们在参数设计上，会很自然的想到这样传参，如下，这是一种比较传统的传参思维

```
<Button type="primary" size="lg">he</Button>
```

从 unocss 的使用方式上，我获得了一个更简洁的传参思路。那就是把所有的参数类型都设计成布尔型，那么我就可以这样做

```
<Button danger>Danger</Button><Button primary sm>Primary SM</Button>
```

在组件的内部封装也很简单，这些属性都被设计成为了布尔型，那么在内部我们是否需要将一段属性加入到元素中，只需要简单判断就可以了

```
// type: normal 为默认值const normal = 'bg-gray-100 hover:bg-gray-200'const _p = primary ? 'bg-blue-500 text-white hover:bg-blue-600' : ''const _d = danger ? 'bg-red-500 text-white hover:bg-red-600' : ''
```

内部封装，主要是根据不同的参数拼接 className 的字符串，完整实现如下

```
export default function Button(props) {  const {className, primary, danger, sm, lg, success, ...other} = props  const base = 'rounded-xl border border-transparent font-medium cursor-pointer transition'  // type  const normal = 'bg-gray-100 hover:bg-gray-200'  const _p = primary ? 'bg-blue-500 text-white hover:bg-blue-600' : ''  const _d = danger ? 'bg-red-500 text-white hover:bg-red-600' : ''  const _s = success ? 'bg-green-500 text-white hover:bg-green-600' : ''  // size  const md = 'text-sm py-2 px-4'  const _sm = sm ? 'text-xs py-1.5 px-3' : ''  const _lg = lg ? 'text-lg py-2 px-6' : ''    const cls = classnames(base, normal, md, _p, _d, _s, _sm, _lg)  return (    <button className={cls} {...other}>{props.children}</button>  )}
```

封装好之后，直接使用，可以感受一下极简的传参。我现在大爱这种使用方式。并且未来组件封装也准备都往这个方向发展。

```
<Button>Normal</Button><Button danger>Danger</Button><Button primary>Primary</Button><Button success>Success</Button>
```

演示效果如下

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcGHupb3zicvCZcWEGd692WG2JChcnEjctRIYH0AQ0FoFIVAOWic5WaHyTRCGBP2H2kBnu0yK4eBAE1Q/640?wx_fmt=png&from=appmsg)

_3_
---

**必备小工具 twMerge, clsx, cva**

```
npm i clsx
```

首先，clsx 是一个打包体积比 `classnames` 更小的替代工具。他的功能与 classnames 类似，我们可以用它来组合字符串。

> ✓
> 
> 你可以根据喜好随便选择一个，clsx 体积更小，classnames 逻辑考虑得更全一点。

我们可以通过 clsx 合并字符串，但是这里我们需要注意一个非常容易被忽视的细节。那就是 css 样式优先级的问题。

我们在 css 中定义如下的两个样式用于设置背景色

```
.red {  background-color: #f44336;}.orange {  background-color: orange;}
```

然后我们创建两个元素，这两个元素只有 `red` 与 `orange` 的位置不同。预览之后我们发现，不管我们如何调整这两个名字的位置，最终的结果都是，显示为 orange

```
<div className='w-80 h-32 red orange mx-auto'></div><div className='w-80 h-32 orange red mx-auto'></div>
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcGHupb3zicvCZcWEGd692WG2RSVXSCc8ficnwOP3cfRfIMC2VVAYY3kJUuUTVYLiaR1s6UtYHAyu4How/640?wx_fmt=png&from=appmsg)

这是因为 className 的书写顺序并不能决定元素样式的优先级，它们的优先级跟 css 的声明顺序有关系，如果我们交换他们的位置，你就会发现上面两个元素又都变成了红色

```
.orange {  background-color: orange;}.red {  background-color: #f44336;}
```

这个现象的存在，对 tailwindcss 的封装影响非常大。因为很多时候，我们会约定默认样式，然后通过传入新的参数去覆盖默认样式。但是我们传入的只是 className，因此是否能覆盖样式我们无法控制。因此，tailwindcss 专门提供了一个方法来处理这个问题，这个方法就是 `twMerge`

```
import {twMerge} from 'tailwind-merge'
```

twMerge 会根据 className 字符串中的类型合理的删掉被覆盖的样式。例如下面的代码中，`px-2 py-1` 属于 padding 值，他就会被后传入的同类型 `p-3` 给覆盖掉。所以最终执行结果只保留 `p-3`

```
twMerge('px-2 py-1 bg-red hover:bg-dark-red', 'p-3 bg-[#B91C1C]');// 返回结果：'hover:bg-dark-red p-3 bg-[#B91C1C]'
```

因此，上面的那个 Button 组件封装的案例，我们可以结合 clsx 和 twMerge，修改如下

```
export default function Button(props) {  const {className, primary, danger, sm, lg, success, ...other} = props  const base = 'rounded-xl border border-transparent font-medium cursor-pointer transition'  // type  const normal = 'bg-gray-100 hover:bg-gra  // size  const md = 'text-sm py-2 px-4'    const cls = twMerge(clsx(base, normal, md, {    // type    ['bg-blue-500 text-white hover:bg-blue-600']: primary,    ['bg-red-500 text-white hover:bg-red-600']: danger,    ['bg-green-500 text-white hover:bg-green-600']: success,    // size    ['text-xs py-1.5 px-3']: sm,    ['text-lg py-2 px-6']: lg,  }))  return (    <button className={cls} {...other}>{props.children}</button>  )}
```

先用 `classnames/clsx` 拼接字符串逻辑，然后再用 `twMerge` 清理掉冗余的 classNames，最后得到的字符串就是最理想的结果

但是**并不是所有的 props 都能处理成布尔值传入**，或者有的时候你也并不喜欢这种方式，还是更喜欢使用传统的 `key=value` 的方式传参，那么这个时候，我们可以借助 `cva` 来实现目标

```
import {cva} from 'class-variance-authority'
```

`cva` 可以帮助我们轻松处理一个属性对应多个值，每个值又对应多个 className 的情况。他的具体使用方式如下：

```
const cvacss = cva(  'rounded-md border border-transparent font-medium cursor-pointer transition', {    variants: {      type: {        normal: 'bg-gray-100 hover:bg-gray-200',        primary: 'bg-blue-500 text-white hover:bg-blue-600',        danger: 'bg-red-500 text-white hover:bg-red-600'      },      danger: {        true: 'bg-red-500 text-white hover:bg-red-600',        false: 'bg-red-500 text-white hover:bg-red-600'      }    },    defaultVariants: {      type: 'normal',      danger: false    }  })
```

此时我们传入的参数为 `type、size`，因此我们可以通过如下方式拿到字符串，并结合 twMerge 得到最终值

```
const cls = twMerge(cvacss({type, size}))
```

我们可以组合这两种思维一起使用，能处理成布尔值传入的参数就处理成布尔值，不能处理的就使用这种方案，结合起来之后的组件封装使用体验会高很多

_5_
---

**额外配置插件，让智能提示更智能**

接下来就是重头戏了。这个配置对于使用体验的提升至关重要。我们都知道，使用一个插件 `IntelliSense` 可以在 html 中编写 css 的时候，会自动提示相关的 tailwindcss 属性值。因为值太多了记不住，所以这个插件是我使用 tailwindcss 的必要条件

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcGHupb3zicvCZcWEGd692WG2jMYP3Kds9ia7qOP78FZxKlDP1xy5tkOUzNRFXYKnXGFt7tfv68PLmWQ/640?wx_fmt=png&from=appmsg)

但是接下来问题就来了，因为我为了简化 className 的长度，经常需要把一些 class name 抽象到别的地方去，但是其他地方写 tailwindcss 的时候就不支持智能提示了，这个就很蛋疼

好在我们可以通过配置正则的方式，识别到其他的使用场景，从而让特定的场景中也支持这种智能提示。

在 webstorm 中，打开配置文件，搜索 `tailwindcss`，然后找到 experimental.classRegex 字段，在里面添加正则即可。

```
"experimental": {    "configFile": null,    "classRegex": [      ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],      ["classnames\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],      ["classNames\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],      ["clsx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"],      "(?:enter|leave)(?:From|To)?=\\s*(?:\"|')([^(?:\"|')]*)",      "(?:enter|leave)(?:From|To)?=\\s*(?:\"|'|{`)([^(?:\"|'|`})]*)",      ":\\s*?[\"'`]([^\"'`]*).*?,",      ["(?:twMerge|twJoin)\\(([^;]*)[\\);]", "[`'\"`]([^'\"`;]*)[`'\"`]"],      "tailwind\\('([^)]*)\\')", "(?:'|\"|`)([^\"'`]*)(?:'|\"|`)",      "(?:const|let|var)\\s+[\\w$_][_\\w\\d]*\\s*=\\s*['\\\"](.*?)['\\\"]"    ]  }
```

这里我列举几个我配置了的场景，方便大家拷贝使用

在 cva 函数中使用

```
["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcGHupb3zicvCZcWEGd692WG2O0OemW88jXDoePpKU7iaVTeWkcGAJAW54ka3zjfHibALeicBdYwib5fniag/640?wx_fmt=png&from=appmsg)

在 clsx 函数中使用

```
["clsx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"],
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcGHupb3zicvCZcWEGd692WG2uNcqDyiczzalrC0KjYITe4A8FvILskrySIib0XsRDw8RbtnNdpezTflQ/640?wx_fmt=png&from=appmsg)

在普通 js 变量中使用

```
"(?:const|let|var)\\s+[\\w$_][_\\w\\d]*\\s*=\\s*['\\\"](.*?)['\\\"]"
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcGHupb3zicvCZcWEGd692WG2hcicic5bYsiaxcPOoYGmiboYE6dWia6dcf27DuicxavVZGO6Vs86tLXjIUwg/640?wx_fmt=png&from=appmsg)

在特定的元素参数中使用

```
"(?:enter|leave)(?:From|To)?=\\s*(?:\"|'|{`)([^(?:\"|'|`})]*)",
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcGHupb3zicvCZcWEGd692WG21r3geyI7FmU3rAWItJCCibOs5YanxwGOiaicAVM2ldNf0aFp4UfCcR8FQ/640?wx_fmt=png&from=appmsg)

_6_
---

**总结**

几天的使用感受下来，tailwindcss 确实很爽，在使用过程中最开始的那个不太好的印象也消失殆尽了，他在提升开发效率上带来的帮助是非常明显的。除了可以不用考虑命名之外，对我来说，最大的惊喜**莫过于基于媒体查询编写响应式页面比以前简单多了**，我只用 10 多分钟就写了一个简单的响应式适配 Header，放到以前，我甚至都不想写这种功能，因为以前有一段时间写了一年多，真的写吐了，没想到用 tailwind 之后这么简单。

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/Kn1wMOibzLcGHupb3zicvCZcWEGd692WG2zE6euumQOibGugDD9Ykib0x2QibTOvhdAJ6JHXR5qCgZK5icZ1DRrVofQw/640?wx_fmt=gif&from=appmsg)

还有一些使用上的小技巧，我没有特别提出来，例如一些自定义配置，以及尺寸单位上的转换，这个要根据公司的设计规范来定。

也有许多朋友在群里问我为啥不使用 unocss，因为有的群友认为 unocss 用起来更简洁更爽，实际上我主要是看着 tailwindcss 提供的 UI 设计要漂亮很多才选择的它，并没有做太细节的权衡，unocss 我目前只停留在片面的了解程度，并且也暂时不打算深入学习使用它，未来考虑在下一个项目使用 unocss，等我有一点新心得之后再来详细比较他们的差异。

_-_
---

**友情链接**

*   [成为 React 高手，推荐阅读 React 哲学](http://mp.weixin.qq.com/s?__biz=MzI4NjE3MzQzNg==&mid=2649867007&idx=1&sn=6443ff970cd077bbb50de74ce84afa06&chksm=f3e5936cc4921a7aba3fbf748b2f5a40369d8be7b6b2acf618f0701f477abea48b00e953165e&scene=21#wechat_redirect)