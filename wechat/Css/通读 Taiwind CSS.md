> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/C9-611RHvUOhsAJi9J0bYw)

> 来自团队同学「黄健」的技术分享。

我是范文杰，一个专注于工程化领域的前端工程师，**近期有不少 HC，感兴趣的同学可联系我内推！**欢迎关注：

Tailwind CSS 简介
---------------

Tailwind CSS 是一个强大且灵活的框架，其核心设计是提供了一种全新的方式来构建用户界面，核心思想是通过使用预设类和定制功能，能够让开发者更专注在实现设计效果上，不再处理重复冗长的 CSS 文件，用最少 CSS 快速地创建出美观且响应迅速的网页，以下是摘自 Tailwind CSS 官网的介绍：

> **Rapidly build modern websites without ever leaving your HTML.**
> 
> A utility-first CSS framework packed with classes like flex, pt-4, text-center and rotate-90 that can be composed to build any design, directly in your markup.
> 
> ![](https://mmbiz.qpic.cn/sz_mmbiz_png/3xDuJ3eiciblkvb2hAyzKOteGazcqdbOibvicB3ne97LbWLbXyD7TMBN7HpyD1fGCXlKmv15VT4TpBg6DqSBSpZzLg/640?wx_fmt=png&from=appmsg)

### 实用主义

Tailwind CSS 的核心设计理念是 “工具类优先”（Utility-First），一种通过工具类而非自定义 CSS 来实现快速样式设计，它开箱即提供颜色、填充、边距、显示等数百种 CSS 属性的工具，这种方法的好处是可以快速地创建原型，并且可以更直观地理解每个元素的样式，由于所有的样式都直接写在了元素上，实现了真正的所见即所得，不用离开 HTML 即可快速写出各种样式。

```
<button class="bg-blue-500 text-white w-64 h-64">Button</button>
```

与经典编写自定义 CSS 不同，Tailwind 为每个 CSS 属性提供了预定义的工具类供组合使用。例如，不是使用 `.btn` 类定义属性，而是使用类似 `bg-blue-500 text-white p-2 rounded`  的工具类来构建按钮 。在上面这个例子中，`bg-blue-500` 设置了 `div` 的背景色，`w-64` 设置了宽度，`h-64` 设置了高度。这种方法允许你直接在 HTML 中看到每个元素的样式，而不需要在 CSS 文件中查找对应的类名，甚至不需要写 CSS 类。

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/3xDuJ3eiciblkvb2hAyzKOteGazcqdbOibvhYqPcox47uDMEib1PJGfVyXfMic1PHf9P7SZKlGm2FHKHSXyMR5oicoBQ/640?wx_fmt=gif&from=appmsg)

### 原子化 CSS

原子化 CSS（https://antfu.me/posts/reimagine-atomic-css）使得每个工具类对应一个单一的 CSS 属性值对，这种原子化的方法允许开发者通过组合少量的类来创建复杂的样式，同时也能有效减少 CSS 产物的体积大小。

### 高度可定制

作为一个基础 CSS 库，容易受人诟病的问题通常有两点，即：**样式一致性和冗余代码**，作为开箱即用的 UI 库往往都会有一套预设样式，这会导致构建出来的网站总有一种 “似曾相识” 的感觉，这些会极大地限制设计的自由度和独特性。此外，由于需要满足各类复杂应用的开发场景，需要基础库包含了大量的组件样式，但在实际的项目中可能只会用到其中的一部分，这会导致生成的 CSS 文件包含大量的冗余代码。

Tailwind CSS 提供了一种高度可定制的方式来构建用户界面，你可以在配置文件中定制几乎所有的东西，从颜色和字体大小到响应断点和过渡动画均可预设，可真正实现像素级定制，并且自带提供了 JIT（Just-In-Time）能力，可以在开发过程中实时生成所需的 CSS，并且支持动态类名、数值计算等高级特性。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/3xDuJ3eiciblkvb2hAyzKOteGazcqdbOibvicB6efxNlbyzayknwnfb7bxic1sH39wBOqlLHjG30pakQDdib5B92eEqw/640?wx_fmt=png&from=appmsg)

### 灵活可扩展

无论一套组件样式制作得多么完美，一旦在生产环境中投入使用，定制设计和场景化扩展的需求都是无法避免的，这就导致了近几年来对组件库关注焦点的显著转变。现在的重点不仅仅在于视觉美观和遵循设计系统，还在于产品能否 “开箱即用” 以及是否能进行源代码级别的定制。在过去只要组件功能足够，就可以做出一些妥协，但现在所有的要素都被认为是不可或缺的，包括但不限于如下内容：**视觉美观（beautifully）、设计语言（design system）、开箱即用（ready to production）、源码级修改（copy & customize）、可访问性（accessibility）**，所以配置驱动（Configuration-Driven）也是 Tailwind CSS 的亮点之一，开发者可以配置颜色、字体、间距等设计维度，以及自定义工具类和插件，使得 Tailwind CSS 可以轻松适应不同的设计系统。

### 响应式设计

Tailwind CSS 通过引入了断点（breakpoints）的思想，使得在 Web 应用在不同的设备下的样式响应变得非常简单，开发者可以通过在工具类名前添加断点前缀来实现响应式设计。例如，`sm:text-center` 表示在小屏幕设备上文本居中，而 `lg:bg-red-500` 表示在大屏幕设备上背景变为红色，Tailwind CSS 预定义了多个断点，如 sm、md、lg、xl 和 2xl，分别对应不同的屏幕尺寸 ，开发者也可以根据自己的继续扩展，如下表示：中等尺寸的屏幕和更大尺寸的屏幕上，文本是居中的，而在小于中等尺寸的屏幕上，文本是左对齐的。

```
<div class="text-left md:text-center">  Hello, world!</div>
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/3xDuJ3eiciblkvb2hAyzKOteGazcqdbOibvm8NZsBhf6p8HibCicK3AfXWF2Gf3zoCPbE0hRYSqXzLTzLWsZvW85MPA/640?wx_fmt=png&from=appmsg)

### 暗黑模式

暗黑模式作为现代 web 开发的一项重要元素被持续追捧，Tailwind CSS 提供了一个特殊的 `dark` 类名前缀，可以使用这个前缀来定义在暗黑模式下应用的样式，只需要在 Tailwind CSS 的配置文件中启用暗黑模式即可使用，例如，`dark:bg-black` 这个类名会使背景在暗黑模式下变为黑色，在非暗黑模式下有白色背景。

```
<div class="bg-white dark:bg-black text-left">  Hello, world!</div>
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/3xDuJ3eiciblkvb2hAyzKOteGazcqdbOibvMosa6ut1dMGM4QcIFnHsGibMRKicP9vdHIQc3puJJk7ptMbjq6Bx4yIg/640?wx_fmt=png&from=appmsg)

> 更多资料可参考：https://tailwindcss.com/docs/utility-first

基础使用
----

### CSS 处理器

Tailwind CSS 的工作原理是扫描所有 HTML 文件、JavaScript 组件以及任何模板中的 CSS 类（class）名，然后生成相应的样式代码并写入到一个静态 CSS 文件中。因此在开始启用 TailwindCSS 前，需要了解一些和 CSS 处理相关的概念：**CSS 预处理器（pre-processor）和 CSS 后处理器（post-processor）**。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/3xDuJ3eiciblkvb2hAyzKOteGazcqdbOibv7X6WsAsl7MNsT7jFN13LD51ohvo2KoNtVbgiazIibKd92fo6Dv6MMk5g/640?wx_fmt=png&from=appmsg)

*   **CSS 预处理器**：允许开发者使用一种扩展的 CSS 语法编写样式，然后将这种扩展语法编译成标准的 CSS。预处理器提供了许多 CSS 本身不支持的功能，如变量、混合、函数、嵌套规则等。这些功能可以使 CSS 代码更加模块化、可维护和可重用，常见的 CSS 预处理器包括 Sass、Less 和 Stylus，可以简单类比 JS 中的 Babel。
    
*   **CSS 后处理器**：接收标准 CSS 代码作为输入，然后通过添加浏览器前缀、优化 CSS 规则、压缩代码等方式来优化这些 CSS。后处理器的主要目标是确保 CSS 兼容各种浏览器，并优化 CSS 的性能和效率。通常作为构建流程的一部分，与任务运行器（如 Webpack、Vite 等）一起使用，常见的 CSS 后处理器包括 PostCSS 和 Autoprefixer。
    

### PostCSS

Tailwind CSS 依赖于 PostCSS 作为其处理 CSS 的基础，而 PostCSS 提供了必要的架构来集成 Tailwind CSS 和其他插件，共同工作以优化前端开发流程，二者协作关系如下：

*   **工具集成**：Tailwind CSS 通常作为 PostCSS 的一个插件来使用。在项目的构建过程中，PostCSS 处理 CSS 文件，而 Tailwind CSS 插件则生成所有配置的工具类
    
*   **处理流程**：在安装并配置 Tailwind CSS 后，它会与 PostCSS 结合，PostCSS 负责解析 CSS 文件，而 Tailwind CSS 则负责将工具类注入到你的 CSS 中。
    
*   **定制性**：通过 PostCSS，可以使用其他插件来增强 Tailwind CSS 的功能，例如添加新的处理器或优化器来改进构建性能
    
*   **灵活性**：PostCSS 提供了灵活性，允许开发者根据项目需求定制构建流程，而 Tailwind CSS 则专注于提供 CSS 类。
    
*   **生态系统**：两者共同存在于一个丰富的生态系统中，与其他工具和插件兼容，如 Autoprefixer（自动添加浏览器前缀的 PostCSS 插件）等。
    
*   **配置文件**：Tailwind CSS 的配置文件（`tailwind.config.js`）允许开发者自定义主题、扩展插件等，而 PostCSS 的配置文件（`postcss.config.js`）则用于配置 PostCSS 本身及其插件。
    

总结一下，Tailwind CSS 使用 PostCSS 的 API 来解析 CSS，并添加自己的类和工具，你在项目中使用 Tailwind CSS 时，实际上是在使用 PostCSS 来处理你的 CSS。

### 安装配置

将 Tailwind CSS 安装为 PostCSS 插件，并将其与 webpack、Rollup、Vite 等构建工具集成是目前最主流的开发模式，具体操作如下：

*   Step1: 安装 `tailwindcss` 和 `postcss`，并执行 `tailwindcss` 命令创建 `tailwind.config.js` 配置文件。
    

```
npm install -D tailwindcss postcss autoprefixernpx 
npx tailwindcss init
```

*   Step2: 将 Tailwind CSS 添加到 PostCSS 配置中。
    

```
// postcss.config.jsmodule.exports = {      plugins: {            tailwindcss: {},            autoprefixer: {},       }}
```

*   Step3: 将需要扫描的文件路径添加到 `taiwind.config.js` 的配置项中：
    

```
// tailwind.config.jsmodule.exports = {  content: ["./src/**/*.{html,js}"],  theme: {    extend: {},  },  plugins: [],}
```

*   Step4: 将 Tailwind CSS 的指令添加到工程项目的入口 CSS 文件中：
    

```
/* global.css */@tailwind base;@tailwind components;@tailwind utilities;
```

*   Step5: 将入口 css 引入后即可开启使用，在线体验：https://play.tailwindcss.com/
    

```
import './global.css'export default function App() {  return (    <div class="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-md flex items-center space-x-4">      <div class="flex-shrink-0">        <img class="h-12 w-12" src="/img/logo.svg" alt=" Logo">      </div>      <div>        <div class="text-xl font-medium text-black"> Chat</div>        <p class="text-gray-500">You have a new message!</p>      </div>    </div>  );}
```

> Tips： 推荐安装 Tailwind CSS IntelliSense(https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss) 智能提示插件和 prettier-plugin-tailwindcss(https://www.npmjs.com/package/prettier-plugin-tailwindcss) 格式化工具

### 指令介绍

在 Tailwind CSS 中，指令是一种特殊的标识，它们告诉 TailwindCSS 在处理 CSS 文件时应该做什么。这些指令以 `@tailwind` 开头，后面跟着一个关键字，例如 Tailwind 会将其样式分为三层：`base`、`components` 和 `utilities` 。这些关键字指定了 Tailwind 应该插入哪种类型的样式，此外，还可以搭配 @layer 指令可以让你指定需要扩展自定义样式应该添加到上面中的哪一层，开发者可以在 Tailwind CSS 中创建层叠的样式规则，这对于创建更复杂的样式结构非常有用。

```
/** * This injects Tailwind's base styles and any base styles registered by * plugins, like Normalize.css * disable Preflight, preflight: false, */@tailwind base;/** * This injects Tailwind's component classes and any component classes * registered by plugins. */@tailwind components;/** * This injects Tailwind's utility classes and any utility classes registered * by plugins. */@tailwind utilities;/** * Tailwind will automatically move the CSS within any @layer directive to the same place as the corresponding @tailwind rule,  * so you don’t have to worry about authoring your CSS in a specific order to avoid specificity issues. */@layer base {  h1 {    @apply text-2xl;  }  h2 {    @apply text-xl;  }}@layer components {  .btn-blue {  /**    * Use @apply to inline any existing utility classes into your own custom CSS.    * This is useful when you need to write custom CSS     */    @apply bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded;  }}@layer utilities {  .filter-none {    filter: none;  }  .filter-grayscale {    filter: grayscale(100%);  }}
```

除了在 css 文件中做配置使用外，我们同样也可以用 plugin 扩展的方式来用编程语言来实现相应的效果，可以直接调用与这些指令对应的函数，例如，`addBase`、`addComponents` 和 `addUtilities` 函数分别对应于 `@tailwind base`、`@tailwind components` 和 `@tailwind utilities` 指令，这些方法都接收一个对象，其中每个键值对代表一个新的 CSS 规则，这样写的另一个好处是配置即生效，无需额外引入 css 文件，非常适合在 monorepo 等工程用跨项目使用或者针对某些定制组件单独出包，

```
// tailwind.plugin.jsmodule.exports = {  plugins: [    function({ addBase, addComponents, addUtilities }) {      addBase({        'h1': { fontSize: '24px' },        'h2': { fontSize: '20px' },      })，      addUtilities({        'filter-none': {filter: 'none'},        'filter-grayscale': {filter: grayscale(100%);},      }),      addComponents({        '.btn': {          padding: '.5rem 1rem',          borderRadius: '.25rem',          fontWeight: '600',        },        '.btn-blue': {          '@apply btn bg-blue-500 text-white': {},        },        '.btn-red': {          '@apply btn bg-red-500 text-white': {},        },      })    },  ],}
```

```
// tailwind.config.jsmodule.exports = {  content: ["./src/**/*.{html,js}"],  theme: {    extend: {},  },  plugins: [require('./tailwind.plugin.js')],}
```

> 指令使用参考：https://tailwindcss.com/docs/functions-and-directives

高级特性
----

### 扩展和插件

Tailwind CSS 的扩展（extend）和插件（plugin）机制是非常强大的功能，它们允许开发者根据自己的特定需求来增强和定制框架，从而满足更多定制化的场景需求。

```
// tailwind.config.jsmodule.exports = {  theme: {    screens: {      sm: '480px',      md: '768px',      lg: '976px',      xl: '1440px',    },    colors: {      'blue': '#1fb6ff',      'purple': '#7e5bef',      'pink': '#ff49db',    },    extend: {      spacing: {        '128': '32rem',        '144': '36rem',      },      borderRadius: {        '4xl': '2rem',      }    }  },  plugin: [      require('./tailwind.plugin.js'),      require('@tailwindcss/forms'),      require('@tailwindcss/typography')  ]}
```

*   **主题机制（theme）**：鼓励开发者尽可能多地自定义各种配置来适应设计目标，所有的默认值都可以通过 theme 定制的方式进行修改。
    

```
/** @type {import('tailwindcss').Config} */module.exports = {  theme: {    // Replaces all of the default `opacity` values    opacity: {      '0': '0',      '20': '0.2',      '40': '0.4',      '60': '0.6',      '80': '0.8',      '100': '1',    }  }
```

*   **扩展机制**：允许开发者在不影响 Tailwind 的默认配置的情况下添加你自己的自定义样式。这是一个非常有用的特性，因为它让你可以添加自定义的样式，同时保留了所有的默认配置，包括：自定义主题、颜色、字体、间距等。
    

```
const defaultTheme = require('tailwindcss/defaultTheme')module.exports = {  theme: {    extend: {      fontFamily: {        sans: [          'Lato',          ...defaultTheme.fontFamily.sans,        ]      }    }  }}
```

*   **插件机制**：允许开发者通过函数拓展的方式添加自定义的实用程序、组件、颜色、字体等，通常可以搭配 theme 函数，它让你可以在你的 Tailwind CSS 插件和自定义函数中直接访问你的主题配置，其参数是一个字符串，表示你想要访问的主题值的路径。这个路径由点 (.) 分隔的部分组成，每一部分对应于配置对象的一个属性。此外 Tailwind CSS 拥有一个活跃的社区，这些插件可以提供额外的工具类，如额外的排版样式、CSS 动画、图标集等。
    

```
const plugin = require('tailwindcss/plugin')// theme('colors.custom-blue') 会返回 colors 对象中的 custom-blue 属性的值。module.exports = plugin(function({ addUtilities, theme }) {  const newUtilities = {    '.border-test': {      borderColor: theme('colors.custom-blue'),    },  }  addUtilities(newUtilities)})
```

### 暗模式支持

现在暗黑模式是许多操作系统的一流功能，设计网站的黑暗版本以配合默认设计变得越来越普遍。为了使其尽可能简单，TailWind CSS 默认支持暗黑模式，你可以通过在你的 Tailwind CSS 配置文件中设置 `darkMode` 选项来启用它。这个选项接受三个可能的值：`false`（默认），`media` 或 `class`。

如果你选择 `media`，Tailwind CSS 将会根据用户的系统设置自动切换暗黑模式和普通模式。这是通过使用 CSS 的 `prefers-color-scheme` 媒体查询来实现的。

如果你选择 `selector`，你需要在你的 HTML 根元素（通常是 html 或 body 标签）上添加 `dark` 类来启用暗黑模式。

```
/** @type {import('tailwindcss').Config} */module.exports = {  darkMode: 'selector', // or 'media'  ...}
```

启用暗黑模式后，你可以使用 `dark`: 变体来为暗黑模式定义特定的样式。例如：

```
<!-- Dark mode enabled --><html class="dark"><body>  <!-- Will be black -->  <div class="bg-white dark:bg-black text-black dark:text-white">  <!-- Content -->  </div></body></html>
```

> 配置参考：https://tailwindcss.com/docs/dark-mode

### JIT 特性

在 Tailwind CSS 3.0 中，**JIT (Just-In-Time)** 编译器是默认启用的，你不需要进行任何额外的配置。你只需要安装 Tailwind CSS 3.0，并在你的 CSS 文件中引入 Tailwind 的基础样式、组件和实用程序类，JIT 编译器是一个重要的特性，包括：

1.  **实时编译**：在大多数的 CSS 框架中会预先生成所有可能的类，这可能导致生成的 CSS 文件非常大，即使 `tree-shaking` 效果也不大理想，然而，JIT 编译器会在构建时动态生成你实际使用的 CSS，这大大减少了生成的 CSS 文件的大小，并且提高了构建速度。
    
2.  **更好的开发体验**：JIT 编译器支持热重载，这意味着当你修改你的 HTML 或 CSS 时，你的页面会立即更新，无需手动刷新。这大大提高了开发效率，并且使得开发过程更加顺畅，类比 webpack 中的 HMR 能力。
    
3.  **按需生成类**：JIT 编译器允许你在类名中直接使用任何值，而不仅仅是预定义的一组值。例如，你可以使用 `text-[#1d1d1f]` 来设置文本颜色，或者使用 `w-[300px]` 来设置宽度。这使得 Tailwind CSS 更加灵活，你可以在不修改配置文件的情况下使用任何你需要的值，你可以使用方括号 `[]` 在类名中直接使用任何值。
    

```
<!-- 假设你想要一个具有特定颜色和尺寸的文本，但这个颜色在 Tailwind 的预设颜色中不存在。 可以直接在类名中使用这个颜色和尺寸：--><div class="text-[#1d1d1f]">  Hello, world!</div><div class="w-[300px] h-[200px]">  Hello, world!</div>
```

```
.text-\[#1d1d1f\] {  color: #1d1d1f;}.w-\[300px\] {  width: 300px;}.h-\[200px\] {  height: 200px;}
```

```
//  配置选项是用来告诉 JIT 编译器在哪里查找类名的。// 这是因为 JIT 编译器是按需生成 CSS 的，它需要知道你在哪里使用了哪些类名，以便生成相应的 CSS。module.exports = {  content: [    './src/**/*.html',    './src/**/*.vue',    './src/**/*.jsx',    // etc.  ],  // ...}
```

在使用 JIT 编译器时，需要注意的一点是，由于它是在构建时生成 CSS，因此你需要确保你的构建工具（如 Webpack 或 Parcel）能够正确处理你的 CSS。此外，由于 JIT 编译器会生成你实际使用的 CSS，因此你需要确保你的 HTML 中使用的所有类都能在构建时被找到，这也是为什么要配置 content 属性的原因，这意味着你可能需要在你的构建配置中包含你的 HTML 文件，以确保所有的类都被正确地生成。

### 组件定制

《Refactoring UI: The Book》(https://www.refactoringui.com/) 是由 Steve Schoger 和 Adam Wathan 合著的一本关于用户界面设计的书，本书主要针对开发人员和设计师，提供了一系列实用的、基于实践的设计技巧和原则。在书中你可以找到大量的设计策略和技术，以及如何将这些策略应用到实际项目中，里面的很多设计思想对于如何定制一套组件库有较为详尽的描述

![](https://mmbiz.qpic.cn/sz_mmbiz_png/3xDuJ3eiciblkvb2hAyzKOteGazcqdbOibvia8loWDD74YswoE2rdiaNktcZsu0eMFZhwq2DDibGamaUMlibUkgcSQ1bw/640?wx_fmt=png&from=appmsg)

1.  **组件设计**：如何设计和重构 UI 组件，以使其更易于理解和使用。
    
2.  **色彩理论**：如何选择和组合颜色 token 以创建和谐而吸引人的用户界面。
    
3.  **布局和空间**：如何利用空间和布局来改善信息的层次结构和可读性。
    
4.  **排版**：如何选择和使用字体以提高可读性和用户体验。
    
5.  **界面复杂性管理**：如何处理复杂的用户界面，使其更易于理解和使用。
    
6.  **反模式**：介绍了一些常见的设计错误，并提供了如何避免它们的建议。
    
7.  **实践案例**：提供了一系列的实际示例，演示了如何应用这些设计原则和技巧
    

作为一套与时俱进的组件，TailwindCSS 除了在持续打磨基础能力外，也会将一些最佳设计理念和工程实践作为组合套件推出，包括：Catalyst(https://tailwindcss.com/blog/2024-05-24-catalyst-application-layouts)、headlessui(https://headlessui.com/) 等，这些也是深度了解 Tailwind CSS 的一些优秀学习资料。

*   **daisyUI** ：DaisyUI 是一个基于 Tailwind CSS 的插件，它为 Tailwind CSS 提供了一组预制的、可定制的 UI 组件，包含一系列常用的 UI 组件，这可以帮助你快速构建出复杂的用户界面，适合参考学习如何基于 React 和 TailwindCSS 快速定制一套可以投入业务使用的组件库。
    
*   **tailwindUI**: Tailwind UI 是一个由 Tailwind CSS 的创造者开发的组件库。它提供了一系列预先设计好的、响应式的、基于 Tailwind CSS 的 UI 组件，由专业的设计师设计的，它们的设计质量非常高。这些组件不仅外观美观，而且在交互设计和无障碍性方面也非常出色
    
*   **chakra-ui**: Chakra UI 是一个非常强大且易用的 React 组件库，它可以帮助开发者快速地构建出美观且无障碍的用户界面，API 设计得非常直观，使得开发者可以非常容易地理解和使用。它提供了大量的预制组件，这些组件都可以通过属性进行高度自定义，如果需要参考学习一些优秀组件的 API 设计可以参考。
    
*   **Ark UI**:Ark UI 同样也是 Chakra UI 团队的作品，属于前者的 headless 版本，用于构建可重用、可扩展的设计系统，适用于各种 JS 框架，同时适配 React，Vue，SolidJS，提供高度的 UI 定制能力和可访问性。
    
*   **hyperui**: HyperUI 是一个项 TailWind CSS 组件的集合，适合快速搭建快速使用，因为大都基于 Tailwind CSS 原子样式搭建并提供在线预览能力，对于一些快速组件的样式实现有一定的参考价值。
    
*   **nextui**: Next UI 是一个基于 React 的现代、美观且易于使用的 UI 组件库，也是 Next.js 团队的作品，和 Next.js 可以更好的整合协作。
    
*   **shadcnUI**: 与大多数 UI 组件库 (如 Ant desgin 和 Chakra UI) 不同，一般组件库都是通过 npm 的方式给项目使用，代码都是存在 `node_modules` 中，而 Shadcn UI 可以将单个 UI 组件的源代码下载到项目源代码中（src 目录下），开发者可以自由的修改和使用想要的 UI 组件，允许开发者可以在源码级进行修改。
    
*   **nodejs/nodejs.org**: 近期 Node.js 新官网已发布 Beta 预览版本，整体风格是基于暗黑主题做了重写，技术栈为 `tailwindcss` + `next.js`，采用的也是 `css modules** 搭配 tailwindcss 共用的方案，里面的代码设计和写法有一定的实践参考价值
    
*   **open-webui**:Open WebUI 是一个可扩展的、自托管的 AI 界面，可适应您的工作流程，同时完全离线运行，其技术栈基于 tailwindcss 和 svelte 实现，可作为生产级的项目参考
    
*   **Semi for Tailwind**: 更优雅地使用 TailwindCSS 与 Semi，提供 TailwindCSS 等原子类样式库与 Semi 共同使用时遇到的一些问题的最佳实践，基于 layer 实现。
    
*   **Antd for Tailwind**: Ant Design 从 5.17.0 起支持配置 layer 进行统一降权。经过降权后，antd 的样式将始终低于默认的 CSS 选择器优先级，以便于用户进行样式覆盖
    

性能优化
----

由于 TailWind CSS 从 3.0 开始已经默认开启了 JIT 模式，它会根据实际代码中的工具类使用情况动态生成 CSS，从而减少 CSS 文件的大小，并消除手动清理（purging）的需要，所以充分利用好 Tailwind CSS 的一些构建特性可以更好地提升 CSS 的生成性能和减少产物体积，如下是一些推荐实践：

### 1. 编写干净和可维护的代码

有效地利用工具类，遵循 Utility-First 的设计理念，Tailwind CSS 提供了大量工具类，可以直接在 HTML 中使用，而不需要为每个设计元素编写自定义 CSS，这里的主要挑战应该是克服惰性（直接拷贝样式）和改善固有开发习惯（所有的样式都从 css 类开始），尽量保持代码的简洁和一致性。

### 2. 创建模块化和可复用的组件

采用组件化架构，将 UI 元素分解为更小的、自包含的组件，以创建更有组织和可管理的代码库，将组件分解为原子元素，利用 Tailwind 的变体创建基于不同状态或断点（breakpoints）的组件变体（Varitant），推荐使用：`class-variance-authority` 、`tailwind-merge`、`clsx` 等配套样式工具，组合实现大于重复书写。

### 3. 避免重复引入基础指令。

每次使用 `@tailwind` 指令时，Tailwind CSS 都会将对应的样式集合插入到 CSS 文件中。如果你重复引入这些指令，相同的样式集合就会被多次插入，导致最终构建的 CSS 文件体积显著增加。这不仅会增加加载和解析样式的时间，而且对于 HRM 的性能有较大影响，应该确保在项目的 CSS 入口文件中只引入一次 `@tailwind base`、`@tailwind components` 和 `@tailwind utilities`。如果你的项目结构需要将样式分散到多个文件中，可以考虑使用 CSS 的 @import 指令将它们组织在一个入口文件中，而不是在多个文件中重复引入 Tailwind 的指令。

### 4. 避免大量使用 @apply

每次使用 @apply 时，都会在 CSS 文件中插入一份工具类的副本。如果在多个地方使用相同的工具类组合，那么这些样式会被复制多次，导致 CSS 文件体积不必要地增加。这与直接在 HTML 中使用工具类相反，后者不会增加任何额外的文件尺寸，当项目变大，或者有多人协作时，理解和维护这些样式可能会变得更加复杂，过度使用 @apply 会限制 JIT 模式的这些优势，由于 @apply 是在构建过程中解析的，JIT 模式可能无法总是准确预测哪些 @apply  生成的类会被实际使用。这可能导致生成的 CSS 包含一些未使用的样式，从而增加文件大小。

```
.button {  @apply inline-flex items-center font-medium justify-center  @apply duration-150 ease-in-out text-white px-4 h-10;  @apply enabled:cursor-pointer focus:outline-none transition;}&.green {  @apply inline-flex bg-green-500 focus:bg-green-600hover:bg-green-600 active:bg-green-600/90 disabled:bg}&.red {  @apply inline-flex bg-red-500 focus:bg-red-600 hover:bg-red-600 active:bg-red-600/90 disabled:bg-red-300}
```

```
/* output */

._button_1v0ee_1 {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, -webkit-backdrop-filter;
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter, -webkit-backdrop-filter;
  transition-timing-function: cubic-bezier(.4, 0, .2, 1);
  transition-duration: .15s
}

._button_1v0ee_1:focus {
  outline: 2px solid transparent;
  outline-offset: 2px
}

._button_1v0ee_1:enabled {
  cursor: pointer
}

._button_1v0ee_1 {
  height: 2.5rem;
  padding-left: 1rem;
  padding-right: 1rem;
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity));
  transition-duration: .15s;
  transition-timing-function: cubic-bezier(.4, 0, .2, 1)
}
```

> 推荐阅读：《tailwind-css-best-practices-and-performance-optimization》(https://tailgrids.com/blog/tailwind-css-best-practices-and-performance-optimization)

展望未来
----

### 全新的 4.0 版本

Tailwind CSS 目前已经发布了 4.0 版本的 Alpha 版本，基于一款新的 TailWind CSS 高性能引擎 - Oxide(https://www.youtube.com/watch?v=CLkxRnRQtDE&t=2146s) ，在基于对 TailwindCSS 的充分理解下，重新实现了新的构建引擎，没错，它也是基于 Rust 重写的，包括不限于如下功能：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/3xDuJ3eiciblkvb2hAyzKOteGazcqdbOibvdYhC4Xy1VqIaEuDibyg5WfmlA1gicyavdYGX3TLq7bRjbGkIJROaLgyw/640?wx_fmt=png&from=appmsg)

*   **速度提升 10 倍**！  现在构建 Tailwind CSS 官网只需要 105 毫秒，而之前需要 960 毫秒，Catalyst UI 套件也从 341 毫秒缩短到 55 毫秒。
    
*   **体积更小**:  加入了 Rust 重写的部分和 Lightning CSS 等重量级原生包，新引擎的安装体积也缩小了 35% 以上！
    
*   **Rust 赋能**： 框架中最消耗资源和可并行化的部分迁移到 Rust，而核心部分仍然使用 TypeScript，保证扩展性。
    
*   **仅需一个依赖**：  新引擎唯一依赖的是 Lightning CSS。
    
*   **零配置的内容检测**：自动为项目找到模板文件，无需配置 content 路径。
    
*   **自定义解析器**：  重新编写了 CSS 解析器，并设计了专门的数据结构，使解析速度比使用 PostCSS 快了两倍。
    
*   **完整的 CSS 处理工具**：Tailwind CSS v4 不再只是一个插件，而是一个完整的 CSS 处理工具。他们直接将 Lightning CSS 集成到框架中，所以不需要再单独配置 CSS 处理流程，内置了 @import 处理、厂商前缀添加、嵌套支持和语法转换功能。提供了官方的 Vite 插件，同时继续提供 PostCSS 插件。
    
*   **面向现代 Web 设计**：使用真实的 @layer 规则，定义内部自定义属性，使用 color-mix 实现透明度修饰符，支持容器查询，改进颜色调色板，引入对现代 CSS 特性的支持。
    

### 使用方式

*   Step 1: 安装 Tailwind CSS v4 alpha 和新的 Vite 插件
    

```
npm install tailwindcss@next @tailwindcss/vite@next
```

*   Step 2: 将插件配置添加到 `vite.config.ts` 文件中:
    

```
import tailwindcss from '@tailwindcss/vite'import { defineConfig } from 'vite'export default defineConfig({  plugins: [tailwindcss()],})
```

*   Step3: 在主 CSS 文件中导入 Tailwind CSS：
    

```
@import "tailwindcss";
```

官方团队鼓励开发者尝试 Tailwind CSS 4.0 Alpha 版本，并提供了反馈问题的途径，以帮助改进最终的稳定版本，并期待社区的反馈。

### UnoCSS

UnoCSS 是一个面向现代前端开发、注重性能的 CSS 工具，它与 Tailwind CSS 有相似之处，但 UnoCSS 通过其独特的特性和优化，为开发者提供了另一种选择，因为同样出自明星开发团队，所以发布后也得到了社区的高度关注。对比介绍：TailwindCSS vs. UnoCSS

![](https://mmbiz.qpic.cn/sz_mmbiz_png/3xDuJ3eiciblkvb2hAyzKOteGazcqdbOibvaAp26Y7c0bc6d1dRhbOK8IMmRnAIYo8ve88ibJw0SPOGy3ZY34Jlibhw/640?wx_fmt=png&from=appmsg)

总结一下
----

Tailwind CSS 是一个流行的实用工具优先的 CSS 框架，它为快速构建响应式、可定制的用户界面提供了强大的工具。尽管 Tailwind CSS 有其局限性，但其优势在快速开发和界面一致性方面非常明显。我们鼓励开发者可以尝试 Tailwind CSS，并利用其强大的工具类来构建项目，通过持续实践和参与社区讨论，开发者可以更深入地了解 Tailwind CSS，提高开发效率，并构建出高质量的用户界面。

**近期有不少 HC，感兴趣的同学可联系我内推！****近期有不少 HC，感兴趣的同学可联系我内推！****近期有不少 HC，感兴趣的同学可联系我内推！**

![](https://mmbiz.qpic.cn/sz_mmbiz_png/3xDuJ3eiciblkvb2hAyzKOteGazcqdbOibvZIiauyDicmLEKxhbnJUlhen9NPPdM9UfRcI5poQ5cmwtC4AHRDTETLOw/640?wx_fmt=png&from=appmsg)