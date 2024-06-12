> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/1rb2h9j2cPRcnS4-Q0xNGQ)

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcHShnxTCWIsfPibiad3ytMClDxd59X8eG63vGpjBVO2Hzmcvltibrx0r8ic6R9ibibFgdho8ZM4yYrVB5oA/640?wx_fmt=png&from=appmsg)

端午三天，你们在放假，而我，一个人躲在家里，苦练 tailwindcss。

我在准备这样一个学习项目，它与传统的文章 / 视频类学习不同，我会在教程中内置大量的**可交互**案例，**提供沉浸式的学习体验**，并且还可以支持实时修改代码观察案例更改结果。大家可以期待一下。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcHShnxTCWIsfPibiad3ytMClDbMtJJC7U07ZvvoGPDmt5jibkzfYhVmLhvHrMpQElBywpcic1t2QxtjeQ/640?wx_fmt=png&from=appmsg)

经过这个项目的历练，现在，我已熟练度拉满，彻底拿捏了 tailwindcss。

魔功大成！

这篇文章，就跟大家分享一下我在 tailwindcss 中已经使用到的高级用法。

*   一、彻底读懂配置文件 tailwind.config.js
    
*   二、定义自己喜欢的语法
    
*   二、定义自己喜欢的功能块
    
*   三、定义自己想要的插件
    
*   三、高级用法：简单实现皮肤切换
    

_0_
---

**高端，从读懂配置文件开始**

在使用 tailwindcss 时，我们可以在项目根目录创建一个配置文件 `tailwind.confing.js`，用于控制 tailwindcss 的语法，理论上来说，你可以把 tw 调整成任何你需要的形状。

使用如下指令，可以在根目录创建一个最简单的配置文件模板

```
npx tailwindcss init
```

```
/** @type {import('tailwindcss').Config} */module.exports = {  content: [],  theme: {    extend: {},  },  plugins: [],}
```

**content**

content 选项是一个数组，用于指定 tailwindcss 语法生效的文件集合。

```
content: [  './pages/**/*.{js,jsx}',  './components/**/*.{js,jsx}',  './app/**/*.{js,jsx}',  './src/**/*.{js,jsx}',]
```

tailwind 使用 `fast-glob` 库来匹配文件。其中，`*` 匹配任意字符，`**` 匹配 0 个或者多个目录，`{js, jsx}` 匹配多个值。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcHShnxTCWIsfPibiad3ytMClD0uLN9cXia3ZURz8Gnd8RyIhLIJporpVt78R7SdET3dBNkuhDBtGYoUQ/640?wx_fmt=png&from=appmsg)

配置完之后的文件数量越多，编译时的压力就越大，因此我们应该尽可能缩小 tailwindcss 的配置范围，只在需要它的地方使用。例如 `utils` 目录可能会包含大量的文件，但是不会使用 tailwindcss，那么我们就应该把他剔除掉。

当然我们还可以做其他的一些配置增强，但是大多都没什么用，对我来说，这里一个比较有用的配置项是 `transform`。我写的文章内容，源文件是 `.md` 格式，此时如果我想要在 `.md` 中使用 tailwindcss，那么就需要将其转换为 `html` 之后再适配 tailwindcss，我们就可以这样配置

```
const remark = require('remark')module.exports = {  content: {    files: ['./src/**/*.{html,md}'],    transform: {      md: (content) => {        return remark().process(content)      }    }  },  // ...}
```

**theme**

theme 字段的配置是我们拿捏 tailwindcss 的核心关键。我们可以通过这个字段自定义任意语法。但是这个语法新人玩家容易看不懂，一长串不知道如何使用。我给大家讲解一下很快就很搞懂了

首先，`theme` 中包含了大量的字段，这些字段有 `colors`，`textColor`，这个是啥意思呢？就很迷惑。

> ✓
> 
> 我们可以在这个地址中，查看默认的完整配置项 https://github.com/tailwindlabs/tailwindcss/blob/master/stubs/config.full.js#L5

其实，我们只需要利用好官方文档，就能很轻松的搞懂这些配置。theme 中的字段主要分为两类，一类表示 css 属性。一类表示配置。

例如在配置文件中，有一个 `borderWidth`的配置如下

```
borderWidth: {  DEFAULT: '1px',  0: '0px',  2: '2px',  4: '4px',  8: '8px',},
```

这看上去像是一个 css 属性，又像是一个配置项，那么我们可以去官方文档的如下地址中，直接查这个单词. 点开之后发现，这里确实是一个属性值。并且具体的缩写与写法，配置参数都一目了然，比只看官方文档更加具体。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcHShnxTCWIsfPibiad3ytMClDGbQWtnWsRNVdzicdPibWxgib4pibGJksFoJYs5gRGfciaHprgscclymP0XQ/640?wx_fmt=png&from=appmsg)

又例如，我们在配置项中发现了一个属性 `spacing`

```
spacing: {  px: '1px',  0: '0px',  0.5: '0.125rem',  1: '0.25rem',  1.5: '0.375rem',  2: '0.5rem',  2.5: '0.625rem',  3: '0.75rem',  3.5: '0.875rem',  4: '1rem',  5: '1.25rem',  6: '1.5rem',  7: '1.75rem',  8: '2rem',  9: '2.25rem',  10: '2.5rem',  11: '2.75rem',  12: '3rem',  14: '3.5rem',  16: '4rem',  20: '5rem',  24: '6rem',  28: '7rem',  32: '8rem',  36: '9rem',  40: '10rem',  44: '11rem',  48: '12rem',  52: '13rem',  56: '14rem',  60: '15rem',  64: '16rem',  72: '18rem',  80: '20rem',  96: '24rem',},
```

然后对应去官方文档查一下，发现这是一个配置项。那么我们就可以知道，这可能会作为入参运用到其他属性的设置中去。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcHShnxTCWIsfPibiad3ytMClD1ZQ00USDX6zzR7c4A3j7RhEugicuT3iamrclgLuFkzbV8ZheJx3eSbiaQ/640?wx_fmt=png&from=appmsg)

> ✓
> 
> 我们也可以自己定义非 rem 的属性单位，使用数组遍历的方式生成 1px -> 500px 中比较常用的一些数值，具体要结合实际情况和设计规范来约定它的配置

有了这个配置项之后，我们就可以使用它作为入参去配置其他 css 属性，例如 margin 值。这里的 `theme` 表示一个 get 方法，可以获取到 `theme` 配置项中对应属性的具体值。例如这里的 `theme('spacing')` 就是获取到我们刚才的配置项

```
margin: ({ theme }) => ({  auto: 'auto',  ...theme('spacing'),}),
```

这样，margin 写法后面跟的数字，就是我们约定的 `spacing` 中具体的值了。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcHShnxTCWIsfPibiad3ytMClDvTxoVMHHXmQ5W7Ap3JqcdCqbJwDEDaYiamNWnejU6JjHIEVIiaibkTibuw/640?wx_fmt=png&from=appmsg)

`m-0.5` ，对应的值，就是 `spacing` 中的 `0.5:0.125rem`

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcHShnxTCWIsfPibiad3ytMClDaXzqlLOdj50SICrOaMHtLyVgeD37vTNGicQ9ZC4uacC57SdUITBkyAg/640?wx_fmt=png&from=appmsg)

theme 中的大多数属性值，都是 css 属性值，只有少数几个值是表示配置项，具体内容不用刻意去记忆，只需要在用到的时候查阅文档即可。如果你只是需要做简单粗暴的自定义修改，直接在默认配置的基础之上修改样式就可以

_1_
---

**定义自己喜欢的语法**

自定义语法更好的方式是使用 `extend` 配置去覆盖原有配置项。例如，我想要重新针对 `background-color` 定义一个语法写法如下，使用黑色的拼音缩写来表达颜色，使用数字来表示不同程度的黑色

```
bg-heise-0bg-heise-1bg-heise-2bg-heise-3bg-heise-4
```

首先我们要做的第一件事情，是在官方文档中，找到 `background color` 对应的缩写是什么

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcHShnxTCWIsfPibiad3ytMClDKcQs3N50FWgvl2dWj0bIGCcsSicYQpztBIUTFMIcnic6BzafIibIdccRg/640?wx_fmt=png&from=appmsg)

然后在 extend 字段中，对应的字段里，配置自定义的语法，`heise`.

```
theme: {  extend: {    backgroundColor: {      heise: {        0: 'rgba(0, 0, 0, 0)',        1: 'rgba(0, 0, 0, 0.1)',        2: 'rgba(0, 0, 0, 0.2)',        3: 'rgba(0, 0, 0, 0.3)',        4: 'rgba(0, 0, 0, 0.4)',      },
```

此时，我们的语法就是属性缩写开头的方式， `bg-heise-0`，我们可以看到，在文件中使用改语法时，智能提示已经有了我们自己定义的语法，完美！

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcHShnxTCWIsfPibiad3ytMClDIFB5HOHokdFibl6DSqUqGiaEI37XSDibsJoJWZduhOsol4MmjhPAZzH7Q/640?wx_fmt=png&from=appmsg)

_2_
---

**定义自己想要的功能块**

tailwindcss 有三个模块。

```
@tailwind base;@tailwind components;@tailwind utilities;
```

base 表示样式重置模块。components 表示组件模块，utilities 表示功能模块，我们可以通过插件的形式，往这几个功能模块中新增我们想要的功能块。

例如，我希望自定义默认的 button 元素的样式，那么我们就可以往 base 模块中注入样式，首先引入插件方法

```
const plugin = require('tailwindcss/plugin')
```

然后在 `plugins` 字段中新增配置样式

```
module.exports = {  plugins: [    plugin(function({ addBase, theme }) {      addBase({        'button': { color: theme('colors.orange.700') }      })    })  ]}
```

然后，我在项目中写上如下代码，对应的结果如图所示，文字颜色变成了 `orange.700`

```
<button>自定义button默认样式</button>
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcHShnxTCWIsfPibiad3ytMClD6NqC9pUc51vo5Dtasulkp8fwA21Wf2eCpaZpkTSy1tIgXP06hRShIg/640?wx_fmt=png&from=appmsg)

我们可以通过这中方式约定所有的基础样式，`button, input` 等都非常需要这样的约定。

当然，我们也可以通过类似的方式往 `components` 中新增样式。例如我希望新增一个 `card` 组件，用于表示一个区域的容器，那么我就可以这样写

```
plugin(({addComponents, theme}) => {  addComponents({    '.card': {      display: 'inline-block',      padding: '1rem',      border: '1px solid',      borderRadius: '4px',      borderColor: theme('colors.red.400'),      margin: '1rem'    }  })}),
```

然后我在项目中编写如下代码

```
<div className='card'>  <button>自定义button默认样式</button></div>
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcHShnxTCWIsfPibiad3ytMClDMp5fDibiaEkrkNL0osSgtfpHTuyNvRabA20ibufrr8bWVpHjRBxSekEVg/640?wx_fmt=png&from=appmsg)

给力！

_3_
---

**定义自己想要的插件**

如下图所示，此时我们想要实现的一个功能是自定义字体大小的递增序列。具体的编号和对应的值都由我们自己来定 `fsize-12`，而不是通过默认的 `text-xxx` 来约定。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcHShnxTCWIsfPibiad3ytMClD2MTyjK3eMACtWE7T9LoY70IBSoLZcfKW6GIdRmr7qvGAawXb5cas3Q/640?wx_fmt=png&from=appmsg)

首先，我们先在 theme 中约定配置项，数量太多的时候，你也可以通过数组遍历来快速创建

```
theme: {  fsizes: {    12: '12px',    14: '14px',    16: '16px',    18: '18px',    24: '24px',    32: '32px',  },  ...
```

然后，plugins 字段中，使用 `matchUtilities` 方法动态匹配后缀自增的 class

```
plugin(({matchUtilities, theme}) => {  matchUtilities({    fsize: (value) => ({      fontSize: value    })  }, {    values: theme('fsizes')  })})
```

搞定，最后的演示结果如图所示

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/Kn1wMOibzLcHShnxTCWIsfPibiad3ytMClD1z3qqbAORE50iaBSFn2QsicKoiajQWVfXGdZYN05PvmMj62uYkJKNBia9g/640?wx_fmt=gif&from=appmsg)

_4_
---

**高级用法：简单实现皮肤切换**

最后，我们再来一个具体的，实用功能的实现：皮肤切换。具体的实现方式仍然是利用 css 自定义变量来做到。

实现效果如图所示

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/Kn1wMOibzLcHShnxTCWIsfPibiad3ytMClDU9DAF2fqgUtKp8w0rwKlMohB0kZ6QKdExHsQasMxr14Hvic4tQY2PzQ/640?wx_fmt=gif&from=appmsg)

> ✓
> 
> 主题来源于 tailwindcss 官方教学视频

我们来看一下实现步骤。

首先，我们要在入口 css 中文件中，约定不同主题的 css 变量。

```
@layer base {  :root {    --color-text-base: #FFF;    --color-text-muted: #c7d2f7;    --color-text-inverted: #4f46e5;    --color-fill: #4338ca;    --color-button-accent: #FFF;    --color-button-accent-hover: #eef2ff;    --color-button-muted: 99, 102, 241;  }  .theme-swiss {    --color-text-base: #FFF;    --color-text-muted: #fecaca;    --color-text-inverted: #dc2626;    --color-fill: #b91c1c;    --color-button-accent: #FFF;    --color-button-accent-hover: #fef2f2;    --color-button-muted: 239, 68, 68;  }    .theme-neon {    --color-text-base: #111802;    --color-text-muted: #2fc306;    --color-text-inverted: #ebfacc;    --color-fill: #b3ff17;    --color-button-accent: #243403;    --color-button-accent-hover: #374f05;    --color-button-muted: 212, 255, 122;  }}
```

`@layer base` 表示这些定义会运用到 base 模块中。

定义好了主题之后，我们就需要去 `extend` 字段中自定义语法。首先是针对于文字颜色字段，该字段在 css 中为  `color`，不过在 tailwind 中，被重新定义了语义，称之为 text color

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcHShnxTCWIsfPibiad3ytMClDlHqWzS3JyRibtQ3IqFMw5eGgN6aupZkCsIL9VtWE3WXDHCTzKneQCcw/640?wx_fmt=png&from=appmsg)

因此，我们要使用 `textColor` 来定义该语法，

```
extend: {  textColor: {    skin: {      base: 'var(--color-text-base)',      muted: 'var(--color-text-muted)',      inverted: 'var(--color-text-inverted)',    }  },
```

`textColor` 的对应缩写为 text，因此最终我们自定义的语法名如下所示

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcHShnxTCWIsfPibiad3ytMClDAlccKyn7UHjfHJvs76dJicTaZvAr02ZbaIvg6VnCeoINwJEJu07L8uw/640?wx_fmt=png&from=appmsg)

用同样的方式定义背景颜色

```
backgroundColor: {  skin: {    fill: 'var(--color-fill)',    'button-accent': 'var(--color-button-accent)',    'button-accent-hover': 'var(--color-button-accent-hover)',    'button-muted': ({opacityValue}) => {      console.log(opacityValue)      if (opacityValue !== undefined) {        return `rgba(var(--color-button-muted), ${opacityValue})`      }      return `rgb(var(--color-button-muted))`    },  }},
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcHShnxTCWIsfPibiad3ytMClDBoJzOcAZGEibhbaeFpYnpxCzgUrHInxibQTuHfUHOzfpDUyKqzaURiaQw/640?wx_fmt=png&from=appmsg)

在需要颜色的地方，我们使用自己定义好的语法来设置颜色。

他们的值，都由 `var` 来声明，对应到我们刚才定义的 css 变量。因此，这样做好之后，当我们改变 css 变量的生效结果，那么皮肤切换就能自定生成。

我们可以更改顶层父组件的 className 来做到变量名的整体切换。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcHShnxTCWIsfPibiad3ytMClDRNwSPJWwJm4cLOWtsichpZQpic209MxTT8wn5IqX6SjlCEn532lHPDSg/640?wx_fmt=png&from=appmsg)

实现完成之后，再来看一眼演示效果，没有问题，搞定！

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/Kn1wMOibzLcHShnxTCWIsfPibiad3ytMClDU9DAF2fqgUtKp8w0rwKlMohB0kZ6QKdExHsQasMxr14Hvic4tQY2PzQ/640?wx_fmt=gif&from=appmsg)

_5_
---

**总结**

实践中的需求非常复杂，每个团队对于 UI 的设计规范不同，那么默认样式就很难满足所有团队的需求，因此，掌握如何将 tailwindcss 配置为你的形状，是在团队中推广和运用它的必要条件。

但是官方文档对于配置文件的讲解有一些缺漏，导致我也花了很长时间，查了不少资料才最终读懂，因此这篇文章我把缺漏的部分补上，有助于道友们更加方便理解它，并结合官方文档彻底拿捏 tailwindcss 的自定义配置。

_-_
---

**友情链接**

*   成为 React 高手，推荐阅读 [React 哲学](http://mp.weixin.qq.com/s?__biz=MzI4NjE3MzQzNg==&mid=2649867007&idx=1&sn=6443ff970cd077bbb50de74ce84afa06&chksm=f3e5936cc4921a7aba3fbf748b2f5a40369d8be7b6b2acf618f0701f477abea48b00e953165e&scene=21#wechat_redirect)