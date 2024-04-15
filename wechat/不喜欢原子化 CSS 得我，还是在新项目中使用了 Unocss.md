> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/gOuEjmCBBBzotLbQqp32Hg)

_**点击**__**关注**__**公众号，“技术干货**__**” 及时达！**_
===========================================

前言
==

**「本篇文章主要讲述 Unocss 的使用和个人使用之后的感想」**

在此之前还写过一篇关于反对在 Vue 里使用`tailwind CSS`的一篇文章（主写`Vue`的，`React`等框架中没有抵抗）。当然，当时写那篇文章的时候脑子也有是有点迷糊的，后来被怼的的很惨，不敢吭声。

近一段时间，公司里给安排了一个新项目，这次我选择安排上了`Unocss+sass`来写样式。但为什么本身就比较反对在`Vue`中使用原子化`CSS`的我，却在新的项目中使用了 Unocss 呢？

理由很简单：主要还是原子化`CSS`最近被炒的非常热，前端技术本来更新的就快，并不是说讨厌某一个技术就要极力去抵抗的 (当然也不是说讨厌，只是觉得`Vue`的`css`处理已经非常棒了，在`Vue`中可能不会那么需要一个额外的`css`框架来支持)，还是有就是当时说`tailwind CSS`不适合用在`Vue`中使用的时候，有部分人说我没写过`tailwind CSS`。哎，我就不写`tailwind CSS`我写`Unocss` (。・ω・。)

Unocss 的下载使用
------------

下载安装 Unocss

```
npm i unocss
或
yarn add unocss
```

安装之后为了更好的 IDE 使用体验，官方是比较建议创建一个单独的文件来配置 Unocss

在项目的根目录下创建`uno.confin.{js,ts,mjs,mts}`文件

```
//uno.config.tsimport { defineConfig } from "unocss";export default defineConfig({  //...Unocss的配置项 看下面配置介绍});
```

还需要在`vite.config.ts`中引入一下

```
//vite.config.tsimport { defineConfig } from "vite";import vue from "@vitejs/plugin-vue";import UnoCss from "unocss/vite";export default defineConfig(({ command }) => ({ plugins: [    vue(),    //插件中也可以选择指定uno文件地址 参数{configFile: './uno.config.ts'}    //当然默认不传参数也是可以正常运行的  这里就不选择传入参数了    UnoCss()    ],    //....  })      //另外webpack5中 webpack.config.js const UnoCSS = require('@unocss/webpack').default  module.exports = {      plugins: [UnoCSS()],     optimization: { realContentHash: true }  }
```

这样在`uno.config.ts`文件中配置好后，就可以写现在火热的原子化样式了

```
<div class="h-full text-center flex select-none all:transition-400">     <p text-16 px-10 shadow="[0_0_10px_4px_#dedede]">iceCode</p>  </div>
```

Unocss 配置
---------

Unocss 的配置还是挺多的，但是一般情况下很少全部用到，仅有几个配置就可以覆盖大多数的场景

### 常用配置

#### rules 规则配置

这个配置主要制定自己样式的规则，这个个人觉得可能会有一部分

```
rules: [    //静态规则  生成 .m-1 { margin: 0.25rem; }的样式    ['m-1', { margin: '0.25rem' }]，    //动态规则 使用正则表达式进行匹配  可以动态的进行匹配    //m-3 转化成css .m-3 { margin: 0.75rem; } m-100 转化成css .m-100 { margin: 25rem; }    [/^m-(\d+)$/, ([, d]) => ({ margin: `${d / 4}rem` })],            //如果有需要 还可以更高级 当然大多数情况下用不到    [      /^custom-(.+)$/,      ([, name], { rawSelector, currentSelector, variantHandlers, theme }) => {        // 丢弃不匹配的规则        if (name.includes('something')) return        // 如果你想的话，可以禁用这个规则的变体        if (variantHandlers.length) return        const selector = e(rawSelector)        // 返回一个字符串而不是对象        return `${selector} {  font-size: ${theme.fontSize.sm};}/* 你可以有多条规则 */${selector}::after {  content: 'after';}.foo > ${selector} {  color: red;}/* 或媒体查询 */@media (min-width: ${theme.breakpoints.sm}) {  ${selector} {    font-size: ${theme.fontSize.sm};  }}`      }    ]     ]
```

#### presets 预设配置

可以自己设置一些自己的特定场景来指定自己的预设，当然也可以使用 Unocss 社区提供的预设来进行配置

创建要给自己的预设

```
// my-preset.tsimport { Preset } from 'unocss'export default function myPreset(options: MyPresetOptions): Preset {  return {    name: 'my-preset',    rules: [      // ...    ],    variants: [      // ...    ]    // 它支持您在根配置中拥有的大多数配置  }}
```

在使用的的时候引入到 presets 中去即可

```
// unocss.config.tsimport { defineConfig } from 'unocss'import myPreset from './my-preset'export default defineConfig({  presets: [    myPreset({      /* 预设选项 */    })  ]})
```

主要还是看个人需求，预设这个东西还是用别人制定好的最香。

##### preset-uno 默认预设

该预设继承`preset-wind`和`preset-mini`两个预设

该预设尝试提供流行的功能优先框架（包括 `Tailwind CSS、Windi CSS、Bootstrap、Tachyons` 等）的共同超集。所以怎么写规则怎么使用可以完全按照这些官网上的写

```
// uno.config.tsimport { defineConfig,presetUno } from 'unocss'export default defineConfig({  presets: [presetUno()]})
```

例如，`ml-3`（Tailwind）、`ms-2`（Bootstrap）、`ma4`（Tachyons）和 `mt-10px`（Windi CSS）都是有效的。

```
.ma4 {  margin: 1rem;}.ml-3 {  margin-left: 0.75rem;}.ms-2 {  margin-inline-start: 0.5rem;}.mt-10px {  margin-top: 10px;}
```

##### preset-attributify 属性化预设

使用属性化预设可以更好的简化模板中 css 样的代码

```
// uno.config.tsimport { defineConfig,presetUno,presetAttributify } from 'unocss'export default defineConfig({  presets: [      presetUno(),      presetAttributify()    // ...  ]})
```

当使用 tailwind CSS 写一个工具类的按钮时，过长的样式就会使项目难以维护

```
<button  class="bg-blue-400 hover:bg-blue-500 text-sm text-white   font-mono font-light py-2 px-4 rounded border-2  border-blue-200 dark:bg-blue-500 dark:hover:bg-blue-600">  Button</button>
```

可以这时属性化预设就可以很大程度上的简化这些写作的样式

```
//这样写 是否清晰很多<button  bg="blue-400 hover:blue-500 dark:blue-500 dark:hover:blue-600"  text="sm white"  font="mono light"  p="y-2 x-4"  border="2 rounded blue-200">  Button</button>
```

当然也有一般情况下并不会写这么多样式在模板上

```
<button class="border border-red">Button</button>//还可以这样使用<button border="~ red">Button</button>//也可以抛弃class<div m-2 rounded text-teal-400 />
```

##### preset-icons 图标预设

可以使用纯`css`图标, 首先还需要下载`icon`

```
npm install -D @iconify/json 也可以只下载 某一个你要使用的图标 npm install -D @iconify-json/[the-collection-you-want]//或者yarn add @iconify/json 也可以只下载 某一个你要使用的图标 yarn add @iconify-json/[the-collection-you-want]
```

```
// uno.config.tsimport { defineConfig,presetIcons } from 'unocss'export default defineConfig({  presets: [    presetIcons({      /* options */    })    // ...other presets  ]})
```

使用时只需要写 class 即可

```
<!-- Phosphor 图标中的基本锚点图标 --><div class="i-ph-anchor-simple-thin" /><!-- 来自 Material Design 图标的橙色闹钟 --><div class="i-mdi-alarm text-orange-400" />
```

##### preset-web-fonts 字体预设

可以通过配置的`provider`属性来使用字体

目前仅支持：

*   `none` - 仅将字体视为系统字体
    
*   `google` - Google Fonts
    
*   `bunny` - Privacy-Friendly Google Fonts
    
*   `fontshare` - Quality Font Service by ITF
    

```
// uno.config.tsimport { defineConfig,presetWebFonts,presetUno } from 'unocss'export default defineConfig({  presets: [    presetUno(),    presetWebFonts({        provider:'none',      /* options */    })  ]})
```

##### preset-wind 预设

UnoCSS 的 `TailWind/Windi CSS` 预设。继承于`preset-mini`。

##### preset-mini 预设

UnoCSS 的基本预设，仅包含最基本的实用工具。

##### preset-tagify 标签预设

可以将 css 样式作为 HTML 的标签使用，当使用单个样式的时候会比较好用。

```
// uno.config.tsimport { defineConfig，presetTagify } from 'unocss'export default defineConfig({  presets: [    presetTagify({      /* options */    })    // ...other presets  ]})
```

配置标签预设之后，单个样式可以作为标签使用了

```
<text-red>red text</text-red><flex>flexbox</flex><!--可以理解为--><span class="text-red">red text</span> <div class="flex">flexbox</div>
```

##### preset-rem-to-px 转换预设

众所周知，这个 css 框架使用的都是 rem 作为单位，如果想要在 Unocss 中使用 px 需要写上固定的 px 单位, 这样显得不够简洁，这里就可以使用这个预设自动转将 rem 转化为 px

这个预设不包含在 unocss 包中，需要单独的额外下载

```
npm install -D @unocss/preset-rem-to-px//或yarn add -D @unocss/preset-rem-to-px
```

```
// uno.config.tsimport { defineConfig } from 'unocss'import presetRemToPx from '@unocss/preset-rem-to-px'export default defineConfig({  presets: [    presetRemToPx({     baseFontSize: 4, //基准字体大小  官方的默认预设16（1单位 = 0.25rem）所以这里为4 为1：1    })    // ...other presets  ]})
```

这里在使用样式的时候，直接写数字就是 px 为单位的样式

```
<div class="m-2"></div>//css.m-2 {  margin: 2px;}
```

#### transformers 转换器属性

Transformers 用于转换源代码以支持约定。

它提供了一个统一的接口来转换源代码以支持约定。

```
// my-transformer.tsimport { createFilter } from '@rollup/pluginutils'import { SourceCodeTransformer } from 'unocss'export default function myTransformers(  options: MyOptions = {}): SourceCodeTransformer {  return {    name: 'my-transformer',    enforce: 'pre', // 在其他transformer之前执行    idFilter() {      // 只转换 .tsx 和 .jsx 文件      return id.match(/\.[tj]sx$/)    },    async transform(code, id, { uno }) {      // code 是一个 MagicString 实例      code.appendRight(0, '/* my transformer */')    }  }}
```

当然，他也有着自己的几个转换器

##### transformer-variant-group 转换组转换器

为 UnoCSS 启用 Windi CSS 的 变体组特性。

```
// uno.config.tsimport { defineConfig,transformerVariantGroup } from 'unocss'export default defineConfig({  // ...  transformers: [    transformerVariantGroup(),  ],})
```

启用这个预设的时候，就可以将一些前缀相同的属性以组的形式来写

```
<div class="hover:(bg-gray-400 font-medium) font-(light mono)"/>//转化为<div class="hover:bg-gray-400 hover:font-medium font-light font-mono"/>//个人感觉这种不如上面的 属性化预设  使用属性化预设可以写成 看个人喜好<div hover='bg-gray-400 font-medium' font='light mono'/>
```

##### transformer-variant-group 指令转换器

启用指令转换器将支持 `@apply`、`@screen` 和 `theme()` 指令。

```
// uno.config.tsimport { defineConfig,transformerDirectives } from 'unocss'export default defineConfig({  // ...  transformers: [    transformerDirectives(),  ],})
```

*   `@apply`指令，就是在 css 使用原子化样式，个人感觉不需要，都在 css 中写样式另起 class 名了，为什么不直接写 css 样式，当然这个也是不被推荐使用的
    

```
.custom-div {  @apply text-center my-0 font-medium;}//转化为.custom-div {  margin-top: 0rem;  margin-bottom: 0rem;  text-align: center;  font-weight: 500;}
```

*   `@screen`指令，创建媒体查询，通过名称引用断点。这个指令还是有些必要的，比自己写媒体查询要简单一些
    

```
.grid {  --uno: grid grid-cols-2;}@screen xs {  .grid {    --uno: grid-cols-1;  }}@screen sm {  .grid {    --uno: grid-cols-3;  }}//转换为.grid {  display: grid;  grid-template-columns: repeat(2, minmax(0, 1fr));}@media (min-width: 320px) {  .grid {    grid-template-columns: repeat(1, minmax(0, 1fr));  }}@media (min-width: 640px) {  .grid {    grid-template-columns: repeat(3, minmax(0, 1fr));  }}
```

*   `theme()` 主题指令，可以直接访问到主题配置值。
    

```
.btn-blue {  background-color: theme('colors.blue.500');}//转化为.btn-blue {  background-color: #3b82f6;}
```

##### transformer-compile-class 编译类转换器

这个转换器可以将写在一个元素上的样式编译成一个类名

```
// uno.config.tsimport { defineConfig,transformerCompileClass } from 'unocss'export default defineConfig({  // ...  transformers: [    transformerCompileClass(),  ],})
```

在类字符串的开头加上`:uno:`即可将后面所写的样式编译成一个类名，不支持属性化预设

```
<div class=":uno: text-center sm:text-left">  <div class=":uno: text-sm font-bold hover:text-red"/></div><!--将编译成 --><div class="uno-qlmcrp">  <div class="uno-0qw2gr"/></div>//css.uno-qlmcrp {  text-align: center;}.uno-0qw2gr {  font-size: 0.875rem;  line-height: 1.25rem;  font-weight: 700;}.uno-0qw2gr:hover {  --un-text-opacity: 1;  color: rgba(248, 113, 113, var(--un-text-opacity));}@media (min-width: 640px) {  .uno-qlmcrp {    text-align: left;  }}
```

##### transformer-attributify-jsx JSX 转换器

这个转换器主要作用于 在 jsx 文件内写 属性化预设的样式

```
// uno.config.tsimport { defineConfig, presetAttributify,transformerAttributifyJsx } from 'unocss'export default defineConfig({  // ...  presets: [    // ...    presetAttributify()//属性化预设  ],  transformers: [    transformerAttributifyJsx(), // <--  ],})
```

如果没有这个转换器，在 jsx 中使用属性化预设将会将无值的样式识别成布尔值

```
export function Component() { return (<div text-red text-center text-5xl animate-bounce>  unocss          </div>)}//这里将会转换为export function Component() {  return (    <div text-red="" text-center="" text-5xl="" animate-bounce="">      unocss    </div>  )}
```

### 非常用配置

个人感觉剩下的配置一般情况下都不太能使用的到，也看项目环境吧。

#### shortcuts 快捷方式

可以在属性内配置一些原子化样式的快捷方式，并且可以类似于 Rules 一样配置动态快捷方式。

```
shortcuts: {  // 使用原子化样式定义快捷类  'btn': 'py-2 px-4 font-semibold rounded-lg shadow-md',  'btn-green': 'text-white bg-green-500 hover:bg-green-700',  //使用动态创建快捷方式  [/^btn-(.*)$/, ([, c]) => `bg-${c}-400 text-${c}-100 py-2 px-4 rounded-lg`]}
```

#### theme 主题属性

`UnoCSS` 也支持像 `Tailwind / Windi` 中的主题系统。在用户级别上，您可以在配置中指定 `theme` 属性，它将与默认主题进行深度合并。

```
theme: {  // ...  colors: {    'veryCool': '#0000ff', // class="text-very-cool"    'brand': {      'primary': 'hsla(var(--hue, 217), 78%, 51%)', //class="bg-brand-primary"    }  },}//在rules中使用rules: [  [    /^text-(.*)$/,    ([, c], { theme }) => {      if (theme.colors[c]) return { color: theme.colors[c] }    }  ]]
```

#### variants 变体属性

允许对现有规则应用一些变化，例如`hover:`变体

```
variants: [  // hover:  (matcher) => {    if (!matcher.startsWith('hover:'))      return matcher    return {      // 去掉前缀并将其传递给下一个变体和规则      matcher: matcher.slice(6),      selector: s => `${s}:hover`,    }  }],rules: [  [/^m-(\d)$/, ([, d]) => ({ margin: `${d / 4}rem` })],]
```

*   `matcher` 控制变体何时启用。如果返回值是字符串，则将其用作匹配规则的选择器。
    
*   `selector` 提供了自定义生成的 CSS 选择器的可用性。
    

**「内部实现」**

*   用户使用中提取了 `hover:m-2`
    
*   `hover:m-2` 发送给所有变体进行匹配
    
*   `hover:m-2` 被我们的变体匹配并返回 `m-2`
    
*   结果 `m-2` 将用于下一轮变体匹配
    
*   如果没有其他变体匹配，`m-2` 将继续匹配规则
    
*   第一条规则匹配并生成 `.m-2 { margin: 0.5rem; }`
    
*   最后，我们将我们的变体转换应用于生成的 CSS。在这种情况下，我们将 `:hover` 前缀添加到 `selector` 钩子中。
    

#### extractors 提取器属性

提取器用于从源代码中提取工具的使用情况。

默认情况下，会使用 extractorSplit 进行拆分。该提取器会将源代码拆分为标记，然后直接提供给引擎。

#### preflights 预检查器属性

从配置中注入原始 css 作为预处理。解析的 `theme` 可用于自定义 css。

```
preflights: [  {    getCSS: ({ theme }) => `      * {        color: ${theme.colors.gray?.[700] ?? '#333'};        padding: 0;        margin: 0;      }    `  }]
```

#### layer 图层属性

主要用于 css 的顺序的优先级问题，css 的顺序影响他们的优先级，这了可以在自定义样式时，添加图层来固定 css 顺序

```
rules: [  [/^m-(\d)$/, ([, d]) => ({ margin: `${d / 4}rem` }), { layer: 'utilities' }],//添加图层  // 当您省略图层时，它将是 `default`  ['btn', { padding: '4px' }]]//也可以在与检查中调用预设样式，进行图层设置preflights: [  {    layer: 'my-layer',    getCSS: async () => (await fetch('my-style.css')).text()  }]
```

图层自定义

```
layers: {  components: -1,  default: 1,  utilities: 2,  'my-layer': 3,//这里自定义自己的图层 使用和预设的一致}
```

#### autocomplete 自动完成属性

在智能建议在演示平台和 VS Code 扩展中可以进行定制。针对于智能提示的属性

```
autocomplete: {  templates: [    // 主题推断    'bg-$color/<opacity>',    // 简写    'text-<font-size>',    // 逻辑或组合    '(b|border)-(solid|dashed|dotted|double|hidden|none)',    // 常量    'w-half',  ],  shorthands: {    // 等同于 `opacity: "(0|10|20|30|40|50|60|70|90|100)"`    'opacity': Array.from({ length: 11 }, (_, i) => i * 10),    'font-size': '(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)',    // 覆盖内置的简写    'num': '(0|1|2|3|4|5|6|7|8|9)'  },  extractors: [      // ...extractors  ]}
```

### 整体配置如下

```
import { defineConfig,presetUno, presetAttributify, presetTypography, presetIcons,transformerVariantGroup， transformerAttributifyJsx,transformerCompileClass,transformerDirectives,} from "unocss";import presetRemToPx from "@unocss/preset-rem-to-px";export default defineConfig({  //自定义规则  rules: [[/^bg-?([0123456789abcdef]+)$/i, ([_, rgb]) => ({ background: `#${rgb}` })]],  //预设规则 有前两个预设可以满足95%以上的需求  presets: [    //此预设规则可以看Tailwind CSS、Windi CSS、Bootstrap、Tachyons官网了解相关规则    presetUno(), //m-10 理解为 margin:10rem 或者 m-10px 理解为 margin:10px    presetAttributify(), //归因模式 bg="blue-400 hover:blue-500 dark:blue-500 dark:hover:blue-600" 背景颜色的简写  也可以再元素上不加class 直接写属样式 例如 <div m-2 p-10 bg-000></div>   // presetTypography(), //排版预设 详细排版看https://unocss.dev/presets/typography#colors 使用这个前两个必须   // presetIcons(), //css图标 支持图标看 https://icones.js.org/ 需要下载   // 这里看个人需求是否要使用px    presetRemToPx({      baseFontSize: 4, //基准字体大小  官方的默认预设（1单位 = 0.25rem） html的字体是16  所以这里为4    }), //默认unocss默认是rem 转换成 px单位  ],  //看个人需求添加转换器  transformers: [   transformerVariantGroup()，   transformerAttributifyJsx(),    transformerCompileClass(),    transformerDirectives()  ],  //以下可以按个人需求添加  shortcuts：{}，  layers: {},  theme: {},  variants: [],  extractors: [],  preflights:[]});
```

错误和插件
-----

问题主要针对 属性化预设的问题，由于 属性化预设的简洁、书写方便，大多数场景下可使用属性化来写样式，但是属性化存在着一些问题

```
<div w100% shadow-[0_0_10px_#dedede] bg-#333></div>
```

以上这些写法都是会报错的，属性中不允许包含`%\[]\#`等一些特殊符号的，所以包含颜色或者自定义等含有特殊符号无使用属性化来写样式

属性化支持有值多属性写法，可以使用这种形式来写属性化样式，当然中写的还不如直接一个 class 的好

```
<div w="100%" shadow="[0_0_10px_#dedede]" bg="#333"></div>
```

不过当一些有着多属性时，这种写法较为舒服

```
<div border="1px solid #dedede" h="[calc(100vh-500px)]" text="16 #000 center"></div><!--对比tailwind CSS --><div class="border-1 border-solid border-[#dedede] h-[calc(100vh-500px)] text-16 text-[#000] text-center"></div>
```

另外 class 和属性化的负数值写法是不同

```
<!--这里mb--20  可以理解为 margin-bootom:-20px--><p text="24 center #222 hover:color-red-400" fw-800 mb--20>        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Explicabo veniam aut esse iure mollitia. Earum omnis aliquid minus porro nulla commodi dignissimos, voluptatem        accusamus cumque reprehenderit, ea nisi perferendis quis.      </p> <!--如果使用 class 来写负值--> <!--这里写负值写在前面即可 -mb-20  理解为 margin-bootom:-20px--> <p class="text-24 text-center text-#222 fw-800 hover:text-red-400 -mb-20">        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Explicabo veniam aut esse iure mollitia. Earum omnis aliquid minus porro nulla commodi dignissimos, voluptatem        accusamus cumque reprehenderit, ea nisi perferendis quis.      </p>
```

创建单独的`uno.config.ts`文件就是为了在 IDE 中配合插件使用，在一个页面中如果这样写可能会看着很乱，当配合插件之后，会比较清晰明了一些

在应用商店直接搜 Unocss

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibsOtOYPsiaRfyh2x8AgKlw2jHLLY9y9LMvG8MInxgUxNxJibibg59qO3OYhSve2TI5kCgpnxoKRdlK4Q/640?wx_fmt=png&from=appmsg)image.png

安装完成之后，你页面中所写的样式都会给标明出来

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibsOtOYPsiaRfyh2x8AgKlw2j8Z1TdVozFa6jibNGzlMJEdfq9ZUfhPWxibP99GibntFlwqibqrDs2EfLVQ/640?wx_fmt=png&from=appmsg)image.png

另外在安装最新的插件之后，有可能会产生没有样式标识和样式提示的问题，这里需要在`settings.json`（这里是针对 vscode 的问题） 文件中添加一个属性

```
//settings.json{//其他配置//...//假如你的项目在D:/git-item/my-item/你所保存的所有项目，那么这里的属性值就可以是D:/git-item/my-item（或者加上你的详细项目）"unocss.root": "你当前项目的绝对路径",}
```

个人感受
----

1.  `Unocss`对比`tailwind CSS`某些方面写法上更快，再熟悉之后开发速度还会再有提升。
    
2.  整体配置还算简单，差不多就是即插即用的感觉。
    
3.  有一定的学习曲线，如果在不考虑同事或以后维护人员的死活（希望我的同事不玩掘金），可以潇洒的使用。主要还是因为不一定是所有人都要学会使用这个 css 框架，当你在模板中使用这些语法，同事还没安装插件的同时，他们很难看懂这是什么意思
    
4.  语法过于灵活，因为各种预设和转换器的存在，可以使用很多种语法来写样式，导致没有`tailwind CSS`“死板”，语法无法统一。例如：`m2`、`m-2`、`m='2'`完全是一样，又比如：`font500`、`font-500`、`fw-500`等也是完全相同的。如果在不是很熟悉的情况下，会导致很混乱的感觉。
    
5.  个人觉在`Vue`里，模板中超过 5 个样式就不应该写在模板中了，本来`Vue`为了让模板简洁就下了很大的功夫，例如在`Vue3.4`中，`Vue`允许相同的变量名和属性名相同时，可以进行简写了，例如`<img :src/>`就全等于`<img :src='src'>` 。然而为了写样式，又再次让模板臃肿起来，个人觉得这个是不符合`Vue`的设计理念的。
    
6.  模板中需要使用两三个简单的样式使用原子化写真的很方便，这个是毋庸置疑的，无需再额外添构思应该怎么起`class`名。
    
7.  样式权重问题，现在写项目基本都是组件库，很多时候需要在组件库的组件上添加我们需要的样式，有些情况下想要使用原子化样式来改变样式是无法改变的，因为权重不够，必须在组件上添加`style`属性来进行更改
    
8.  有些使用原子化不仅是为了使用方便，还有`tailwind CSS` 官方所说的，他们在打包之后会很小。但是，在项目开发时，自己写`css`样式的大小真的可以忽略不计。我现在开发的项目打包之后`6.37MB`,`css`占用`222KB`, 其中`Unocss`打包大小`11.3KB`剩下的都是组件库的样式。所以不要觉得自己写点`css`样式就可以影响整个包的大小。
    
9.  我也是这么认为的，原子化样式不是终点，本身也许只是个过渡。
    

最后
==

原子化样式目前来说是一种`CSS`的发展趋势，可以使用。也可以选择不用，毕竟现在的`CSS`已经发展很成熟了，包括`Sass、Less`等一些预编译器也发展的很成熟，他们都有自己变量函数等一些操作，如果想要写一个主题，使用变量来实现是一个很好选择。

当然，最后个人觉得原子化样式在`Vue、Servlet`等这种对`CSS`的处理很好的框架中不是很好的选择。如果是`React`等这种对`CSS`处理没有那么好的框架中，除了`CSS-in-JS`还是很不错的选择。

这个如果不是全公司都在使用原子化样式的话，个人使用还有一定的风险，毕竟原子化样式是有一定的学习成本，有些未使用过原子化样式的同事或者维护者肯定会 ****。（我这也算是是顶着被骂的风险来使用的并写了这篇文章的 (;´༎ຶД༎ຶ`)）