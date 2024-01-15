> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/1YB37K_pI0pJ2OPWMfKcTQ)

Tailwind CSS 作为一款原子化的 CSS 框架，提供了一组高度可定制化的 CSS 程序和组件；帮助前端开发人员快捷、方便地构建美观的用户界面；相比于传统的 CSS 框架，Tailwind CSS 更注重简洁性和灵活性，可以和现有的前端框架如 React、Vue、Angular 等无缝集成，同时也避免了传统 CSS 开发中需要编写大量重复的样式代码。  

CSS 框架发展到现在，主要经历了四个阶段，第一个阶段是以 CSS2.0 和 CSS3.0 为主的，原生 CSS 阶段，需要用到什么样式就写什么样式，也会有一些简单的复用；第二个阶段是将 CSS 组件化，将具有相同视觉效果的元素封装成同一个组件类，比如 07 年 Twitter 推出的 Bootstrap 框架，后面以及 React 和 Vue 等框架涌现出来的 Element UI、Antd 等各种各样的组件库，都对自身的组件进行了封装，提供相当丰富的预设组件。

第三个阶段是出现以 Sass、Less 和 Stylus 为代表的的 CSS 预处理器，弥补了常规 CSS 语法不够强大，没有标量和样式复用的机制；使得我们在开发样式时可以使用样式嵌套、循环、变量、条件控制等更高级的语法，更加灵活方便的开发样式。

但是丰富的组件库在面对高度定制化的 UI 设计界面时，有时候也无可避免的需要自己写一些样式，不同组件中也会有重复封装的样式；同时高度封装的组件，还需要一定的学习成本，知道组件样式如何来控制；因此第四个阶段以 Tailwind CSS 为主的 CSS 原子化，直接将 CSS 样式打散，就像一个个原子一样，将每个 CSS 的样式应用到对应的类名。

比如我们最常用的 flex 布局，如果封装到组件中，我们会在很多组件中不断重复的写 flex 样式，比如下面的组件，我们对下面每个层级的 flex 布局都需要来写对应的样式：

```
<template>
<div class="container">
  <div class="left"> ... </div>
  <div class="right"> ... </div>
</div>
</template>
<style  lang="scss" scoped>
.container {
  display: flex;
  justify-content: space-around;
  .left {
    display: flex;
    justify-content: space-between;
  }
  .right {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
  }
}
</style>
```

但是，如果使用了 Tailwind CSS，你只需要写下面几行代码即可：

```
<template>
  <div class="flex justify-around">
    <div class="flex justify-between"></div>
    <div class="flex flex-wrap items-center"></div>
  </div>
</template>
```

怎么样？是不是比上面的代码简洁多了；有些小伙伴可能会问，这些 CSS 类名都是什么意思？还是有一定的学习成本啊；别着急，Tailwind CSS 的语义化 CSS，再结合 VS Code 强大的插件功能，可以让我们很轻松的记住这些类名；因此，笔者在做一些管理后台类的项目时，由于对页面样式要求不高，在实际项目中大多数页面都不用写样式，直接用类名即可，极大的提高了工作效率。下面，我们继续来看 Tailwind CSS 还有哪些强大的功能吧。

安装集成
====

首先我们在项目中安装 Tailwind CSS，将其作为 PostCSS 的一个插件，这样我们就能和 webpack、rollup、vite 以及 parcel 等打包工具集成了；因此通过 npm 安装相关的依赖：

```
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init
```

`tailwindcss init`在项目中自动创建了一个配置文件`tailwind.config.js`，一些主题、插件等就可以在这里配置，我们将项目中的模板文件路径添加进来：

```
/** @type {import('tailwindcss').Config} */module.exports = {  content: [    // 这里手动添加项目中需要的模板文件    "./index.html", "./src/**/*.{vue,ts,tsx}"  ],  theme: {    extend: {},  },  plugins: [],};
```

别忘记把 tailwindcss 配置到 postcss.config.js 中：

```
module.exports = {  plugins: {    tailwindcss: {},    autoprefixer: {},  },};
```

创建一个`/src/tailwind.css`文件，通过`@tailwind`指令来添加每一个用到的功能模块：

```
/*! @import */@tailwind base;@tailwind components;@tailwind utilities;
```

最后在我们的项目入口文件中引入`tailwind.css`:

```
// main.jsimport './styles/tailwind.css';
```

这样我们就能启动查看项目了；项目启动后，我们在写 class 类名时，肯定记不住那么多繁杂的类名，就需要用到编辑器插件了；打开 VS Code 的扩展面板，搜索`Tailwind CSS IntelliSense`：

![](https://mmbiz.qpic.cn/mmbiz_png/VsDWOHv25bdaHjUtWPG4EWC9tuJH8kPNwG5mX0fMaJWxSgvic5t9Deb5cLokkt66fX6wHmicibFd2wWdPleIm7ibIA/640?wx_fmt=png)VSCode 插件

这里可以看到很多扩展，选择第一个官方扩展进行安装，就可以增强 Tailwind 的开发体验；我们在写类名时，模糊写一个 flex，就会带出 flex 相关的类名，并且每个旁边都会有对应的类名的详细属性；甚至鼠标放在现有类名上也会呈现具体样式细节，这样就不用担心用错类名了。

![](https://mmbiz.qpic.cn/mmbiz_png/VsDWOHv25bdaHjUtWPG4EWC9tuJH8kPNTjv80kEB8r2NWKoHAuwdOaicVf1TcHVpogunJQsic2v6LTq2A7EUDhzA/640?wx_fmt=png)扩展增强开发体验

特性
==

我们来看下 Tailwind CSS 有哪些特性。

实用主义
----

Tailwind CSS 设计思路是优先考虑如何来满足实际需求（Utility-First Fundamentals），因此提供了大量使用的 CSS 类名，可以款速构建常见的界面元素，我们以官网的一个案例来理解它的实用主义优先的原则：

```
<div  class="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-lg flex items-center space-x-4">  <div class="shrink-0">    <img class="h-12 w-12" src="/img/logo.svg" alt="ChitChat Logo" />  </div>  <div>    <div class="text-xl font-medium text-black">ChitChat</div>    <p class="text-slate-500">You have a new message!</p>  </div></div>
```

我们看下呈现的效果，也比较简单。

![](https://mmbiz.qpic.cn/mmbiz_png/VsDWOHv25bdaHjUtWPG4EWC9tuJH8kPN21OVsF8fAbS6hmBYbBI54bEA5lq6vB4QORnhQTMmDOFRaB6RgjySKg/640?wx_fmt=png)第一个案例

在这个案例中，我们使用了下面几种样式：

*   宽高：最外层的元素使用 max-w-sm 限制最大宽度，图片使用 w-12 和 h12 来限制图片具体的宽度高度。
    
*   边距：mx-auto 来设置 margin 实现左右居中，p-6 控制内边距 padding。
    
*   flex 布局：flex 开启 flex 布局、items-center 设置 items-center 实现上下居中，shrink-0 不收缩。
    
*   背景样式：bg-white 背景白色，rounded-xl 圆角，shadow-lg 阴影。
    
*   文字样式：text-xl 字体大小，font-medium 字体加粗，text-black 和 text-slate-500 字体颜色。
    

这里 margin 和 padding 比较特殊，有多种方式来设置；我们知道 margin: 24px 是设置上下左右四个方向的边距，在 Tailwind CSS 就可以简写成`m-6`；如果是 margin: 24px 12px，Tailwind CSS 就可以设置成 X 轴方向和 Y 轴方向，对应的类名就是：`mx-3 my-6`，因此上面的 mx-auto 就非常好理解了；而上下左右对应四个字母 t、b、l、r，加上 margin（m）和 padding（p），就可以分别对应不同方向的设置了，比如`pb-4`。

更多的样式缩写，如果小伙伴不知道怎么写的话，可以查看官网的文档，查一两次语法基本就能记住了，还是比较语义化的。

我们发现这样的写法，会让页面显得比较臃肿，喜欢这种写法的人会非常喜欢，不喜欢它的人会觉得页面很混乱，难以接受；但是笔者用下来发现确实有以下优势：

*   不用费时费力的去想各种类名，尤其是对于英文不好的小伙伴，思考类名也会占用我们小一部分的时间和精力。
    
*   样式文件占用项目空间急剧下降，很多页面写少量甚至不用写样式，简直不要太爽了。
    
*   不用担心样式覆盖问题，有些样式文件可能会被不同的页面引用，改动的时候非常小心翼翼；现在样式都在页面上，再也不用担心覆盖了。
    

悬停聚焦
----

相较于常规的类名，我们页面上更多的是鼠标悬浮、聚焦等状态，还有很多的伪元素和伪类修饰符，我们看下他们是如何通过类名的方式来实现的。

### 状态更改修饰符

我们可以给按钮元素设置悬浮、聚焦状态的改变，在 CSS 中是通过`:hover`，`:focus`等实现的，Tailwind CSS 添加`hover:`前缀来实现，比如下面

```
<button   class="bg-sky-500 hover:bg-sky-700 ..">  点我</button>
```

这样鼠标悬浮后，背景颜色就会加深；还可以使用`active:`激活和`focus:`聚焦：

```
<button  class="bg-violet-500 hover:bg-violet-600 active:bg-violet-700 focus:bg-violet-800">  点我</button>
```

对于 a 链接，`visited:`修饰符表示链接已经访问过。

```
<a   href="https://xieyufei.com"   class="text-red-500 visited:text-red-500"></a>
```

还有一些`first-of-type:`、`last-of-type:`、`empty:`、`disabled:`、`checked:`修饰符，这里就不再赘述。

### 元素修饰符

对于第一个和最后一个元素，使用`first:`和`last:`来选择元素：

```
<li  class="bg-blue-200 first:mt-10 last:bg-blue-300"  v-for="item in 10"  :key="item">  {{ item }}</li>
```

对于奇偶元素，可以使用`odd:`和`even:`修饰符来选择元素：

```
<li  class="bg-blue-200 odd:bg-blue-300 even:text-yellow-600"  v-for="item in 10"  :key="item">  {{ item }}</li>
```

![](https://mmbiz.qpic.cn/mmbiz_png/VsDWOHv25bdaHjUtWPG4EWC9tuJH8kPN5yTcdf9eZU8ich4f36SJuaMmOxGdPDALuo7hzbKvZhQicicYlk3u9ic56Q/640?wx_fmt=png)奇偶元素

对于一些特殊的子元素，比如选择第几个元素: nth-child，我们通过`[&:nth-child(n)]`前缀：

```
<li  class="bg-blue-200 [&:nth-child(3)]:bg-blue-500"  v-for="item in 10"  :key="item">  {{ item }}</li>
```

### 父级修饰符

还有一些子元素的样式依赖于父级元素，我们通过给父级元素标记`group`类名，并且使用`group-*`的修饰符来标记目标元素，比如下面的例子：

```
<div  class="group hover:bg-blue-300">  <div    class="text-black group-hover:text-white group-active:text-red-500"  >    ChitChat  </div>  <p class="text-slate-500 group-hover:text-white">    You have a new message!  </p></div>
```

![](https://mmbiz.qpic.cn/mmbiz_gif/VsDWOHv25bdaHjUtWPG4EWC9tuJH8kPNuNYchbhvvCicftH7PiaxpIgXExEeialCTicMFLF1jcnZjBUEJRibicOVI9KA/640?wx_fmt=gif)group 修饰符

除了`group-hover`，还支持`group-active`、`group-focus`或者`group-odd`等修饰符；如果有多个组嵌套的情况，我们可以使用`group/{name}`来标记该父级元素，其中的子元素使用`group-hover/{name}`修饰符来设置样式：

```
<li  class="group/item"  v-for="item in 10"  :key="item">  {{ item }}  <div class="invisible group-hover/item:visible text-red-400 group/opt">    <div class="group-hover/opt:text-red-700">hover me</div>  </div></li>
```

比如上面的案例中，最外层的元素使用了`group/item`，而下面的按钮使用了`group/opt`单独变成一个组，用来控制该组下面的元素样式。

### 同级修饰符

当我们需要根据同级元素的状态对目标元素进行样式设置时，使用`peer`标记同级的元素，使用`peer-*`修饰符对目标元素进行样式设计，比如下面的案例：

```
<div>  <span>Email</span>  <input type="email" class="peer ..." />  <p class="mt-2 invisible peer-invalid:visible text-pink-600">    请输入正确的邮箱地址  </p></div>
```

我们给同级的输入框标记为 peer，而 p 标签就是我们需要设计样式的目标元素，使用`peer-invalid:visible`让 p 标签当输入框输入内容无效时进行内容的显示，效果如下：

![](https://mmbiz.qpic.cn/mmbiz_png/VsDWOHv25bdaHjUtWPG4EWC9tuJH8kPNeiaqutDU37NibRPswuc1QMNxkNI7WOaOaA9SRACSaplOV2BdnTx8rhTw/640?wx_fmt=png)同级修饰符

和`group`的使用一样，peer 也可以使用`peer/{name}`来标记某个具体的元素，然后使用`peer-*/{name}`来设计目标元素的样式。

todo

### 伪元素修饰符

对于::after 和::before 等伪元素，我们也可以使用`before:`和`after:`修饰符：

```
<span  class="after:content-['*'] after:ml-0.5 after:text-red-500 block text-sm font-medium text-slate-700">  Email</span>
```

当使用`before:`和`after:`修饰符这类修饰符时，Tailwind CSS 会默认添加`content: ''`样式，除非我们需要在 content 中添加其他内容，否则不需要额外的声明。

对于输入框 input 的 placeholder，我们可以使用`placeholder:`修饰符很方便的更改占位符样式：

```
<input   class="placeholder:italic placeholder:text-slate-400 ..."/>
```

夜间模式
----

我们在浏览有些网站或者 App 时都会看到有夜间模式的功能，启用夜间模式可以让网站展示不同的风格样式，Tailwind CSS 可以通过类名很容易的控制；要开启夜间模式，我们先在`tailwind.config.js`配置 darkMode：

```
// tailwind.config.jsmodule.exports = {  darkMode: "class",  // ...}
```

这样我们就可以通过全局根节点上控制类名来控制整体的页面风格是否呈现夜间模式了，比如在 html 节点或者 App.vue 上添加 / 移除`dark`类名；下面就来对页面进行改造，对于夜间模式下的背景颜色或者文字颜色，使用`dark:`修饰符，

```
<div id="app" :class="isDark ? 'dark' : ''">  <div    class="bg-white dark:bg-black"  >    <h3      class="text-slate-900 dark:text-white"    >      谢小飞的博客地址：    </h3>    <p class="text-slate-500 dark:text-slate-400">        https://xieyufei.com    </p>  </div></div>
```

在上面代码中，我们使用了`bg-white`在默认模式下的背景颜色为白色，以及`dark:bg-black`夜间模式下背景颜色为黑色，通过 isDark 变量来实现控制根节点开启 / 关闭夜间模式；效果如下：

![](https://mmbiz.qpic.cn/mmbiz_gif/VsDWOHv25bdaHjUtWPG4EWC9tuJH8kPNMHpxHUmicBgu5ac75tMjHeOwyl0DSWbzNibOJ9X1kt6H5ibC0cjmH0FRQ/640?wx_fmt=gif)夜间模式

自定义样式
-----

对于一些全局的样式，比如颜色模式、自适应缩放模式、间距等等，我们可以添加到`tailwind.config.js`配置文件中：

```
module.exports = {  theme: {    screens: {      sm: '480px',      md: '768px',      lg: '976px',      xl: '1440px',    },    colors: {      red: '#ff0000',      "main-color": "#ff7849",    },    extend: {      spacing: {        '128': '32rem',        '144': '36rem',      },      borderRadius: {        '4xl': '2rem',      }    }  }}
```

比如觉得全局的 red 红色，红的不够鲜艳，我们可以在 colors 中重新设置一个色值；或者设置一个全局的主要色值`main-color`，在页面中使用`bg-main-color`或者`text-main-color`就可以设置一个全局的颜色。

在使用边距值时，我们发现只有`mt-6`这种模糊的数据，使用的单位也是 rem；如果设计稿需要比较精确的还原，我们可以使用大括号来将精确的数值进行呈现：

```
<div class="mt-[123px]"></div>
```

对于色值、字体大小等，这种使用方式也是有效的：

```
<div   class="bg-[#f0f0f0] text-[22px] before:content-['11']"></div>
```

甚至对于 CSS 变量，也可以直接使用大括号，都不需要`var()`，只需要提供变量名称：

```
<div class="bg-[--my-color]"></div>
```

函数指令
----

### tailwind 指令

在 Tailwind CSS 中，`tailwind指令`是用于快速生成基于配置的样式代码的工具。``tailw 数生成相应的样式代码，这些参数可以是任何有效的 CSS 属性和值。它可以根据 Tailwind CSS 的配置文件中的设置来生成相应的样式代码。

```
@tailwind base;@tailwind components;@tailwind utilities;@tailwind variants;
```

这里对应参数的作用如下：

*   base：可以生成基础样式代码，包括重置样式、字体样式、间距样式等。
    
*   components：可以生成各种 UI 组件的样式代码，例如按钮、卡片、表单等
    
*   utilities：可以生成高度定制化的、短小精悍的样式代码，用于实现特定的设计效果。
    
*   variants：可以用于创建自定义的样式变体，在需要时灵活地应用它们
    

### layer 指令

`@layer`指令是 Tailwind CSS 中一个重要的指令，它用于将 CSS 类分层，从而更好地组织和控制样式。我们可以使用`@layer指令`来创建不同的层（layers）。层是 CSS 类的分组，这些组可以用于将 CSS 规则封装为独立的、可重用的模块。通过将样式规则组织到不同的层中，这样就可以更好地控制样式的作用范围和优先级。

```
@layer base {  h1 {    @apply text-2xl;  }  h2 {    @apply text-xl;  }}@layer components {  .btn-blue {    @apply bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded;  }}@layer utilities {  .filter-none {    filter: none;  }  .filter-grayscale {    filter: grayscale(100%);  }}
```

这里的`@layer base`指令用于创建基础层 base。基础层包含了通用的、基础的样式规则，例如颜色、字体、间距等。这些基础样式是整个网站中普遍适用的，通常不需要进行修改或定制。通过将基础样式规则分离到基础层中，可以确保它们在整个网站中保持一致，并且不会受到其他样式规则的影响。

而`@layer components`指令用于创建组件层 components。组件层包含了与具体组件相关的样式规则。组件可以是任何自定义的 HTML 元素或页面组件，例如按钮、卡片、表单等。组件层中的样式规则通常与具体的 UI 组件有关，并且可能需要进行频繁的修改和定制。

`@layer utilities`指令用于创建实用层。实用层包含了高度定制化的、短小精悍的样式规则。这些规则通常是用来实现某些特定的设计效果。实用层中的样式规则通常是单一用途的，并且可以根据需要进行精确地控制和定制。

### apply 指令

在 Tailwind CSS 中，我们可以使用`@apply指令`将现有的 CSS 类应用于已经定义的样式规则，以实现更灵活的样式控制：

```
.my-custom-class {    @apply text-center;    @apply bg-blue;    @apply border-2;  }
```

比如在上面的案例中，我们定义了我们自己的类名`my-custom-class`，然后使用`@apply指令`将 text-center、bg-blue 和 border-2 应用于我们自定义的样式，这样就可以根据具体的需求，封装一系列我们需要的样式规则。

总结
==

本文整理了 Tailwind CSS 的不同特性和用法，它的核心思想是实用性，使用方式也非常简单，提供了一系列预设的 CSS 类名，同时可以根据不同的需求，自定义样式组合，应用于不同的场景中；通过 Tailwind CSS，我们可以很方便的构建一致性和可维护性的页面，而且也无需编写大量的 CSS 样式。

总之，Tailwind CSS 是一个非常实用的 CSS 框架，已经被应用于大量的网站和框架中，如果你现在还在为写样式而发愁，那么它是一个非常值得尝试的选择。