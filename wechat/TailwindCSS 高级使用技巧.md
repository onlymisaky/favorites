> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/mvnLzsLWhKY-YlL9hzrAlA)

大厂技术  高级前端  精选文章

点击上方 全站前端精选，关注公众号

回复 1，加入高级前段交流群

> 作者：晓平
> 
> https://zhengxiaoping.xyz/css/TailwindCSS%E9%AB%98%E7%BA%A7%E6%8A%80%E5%B7%A7.html

前言
--

如果你刚刚熟悉 TailwindCSS，不妨先看看这篇文章：[TailwindCSS 的使用，看这一篇就够了！](http://mp.weixin.qq.com/s?__biz=MzA4MjA1MDM3Ng==&mid=2450828429&idx=1&sn=dca953a751d6faf0bddbed3e9a886a54&chksm=886ba0aabf1c29bc15b9b12cd0ccad6552df12d33ecfec7c28ad61a31a0f4c433a78b50ef1e4&scene=21#wechat_redirect)

以下内容，将会假设你已经使用过 TailwindCSS 一段时间了，比较熟悉其使用手感。本篇内容将会着重于讲解比较不常用的功能点，如果你是深度使用者，可能需要此篇文章。

提取配置
----

我们想到的第一个问题就是： **复用**。你总会碰到需要抽象的情况，例如需要在多个项目中共享一份配置。尽管可以通过`Ctrl C, Ctrr V`一分钟搞定，这种方案速度最快，后患却也最大（散落在各处的副本，最后都不知道该以哪个为基准）。

幸好 TailwindCSS 为我们提供了`preset`的特性，你只需要几个简单的步骤就可以将配置抽离出去：

**1. 新建 `tailwind.preset.js`**

```
/** @type {import('tailwindcss').Config} */    module.exports = {      theme: {        extend: {          colors: {            primary: 'orange'          }        },      },    }
```

`preset`文件的配置方法与`tailwind.config.js`一样，TailwindCSS 会根据自己的合并规则去合并`preset`和`tailwind.config.js`中的配置。

> 合并规则可参考：https://tailwindcss.com/docs/presets#merging-logic-in-depth

**2. 配置 `tailwind.config.js`**

```
/** @type {import('tailwindcss').Config} */    module.exports = {      content: [        './src/**/*.{vue,js,ts,jsx,tsx}'      ],      theme: {        extend: {},      },      presets: [         require('./tailwind.preset.js')      ],    }
```

当然，你也可以考虑将`tailwind.preset.js`发布为一个 npm 库：

```
/** @type {import('tailwindcss').Config} */    module.exports = {      content: [        './src/**/*.{vue,js,ts,jsx,tsx}'      ],      theme: {        extend: {},      },      presets: [         require('tailwind-preset') // 库名为tailwind-preset，配置package.json中main字段为配置文件位置作为库的默认导出      ],    }
```

你可能已经注意到，`presets`配置是一个数组，是的，TailwindCSS 允许配置多个预设，然后从上至下进行合并，如果多个 preset 存在同样的配置，则后者会覆盖前者。

TIP

`presets` 可配置多个提供了更细粒度化拆分配置的可能性，你可以将一个 Tailwind 配置，按照不同的模块进行拆分，使用时，根据需要组合使用。

这种拆分形式相当于在配置层面进行原子化，看来 TailwindCSS 无处不散发着 **原子化** 的风味，Respect！

使用插件提高开发效率
----------

CSS 的能力相比 JS 要弱得多，所以，针对 CSS 的插件其实主要是对一些常用样式进行封装，形成所谓 **CSS 组件**，比如下方的代码：

```
.button {      display: inline-block;      padding: 5px 12px;      text-align: center;      background-color: orange;      color: #fff;    }
```

上述代码实现了一个按钮的 CSS 组件，在 TailwindCSS 中，你可以认为它是一个名为`button`的插件。当开发人员安装此插件，就可以通过简单添加一个 class 的方式实现快速编码。

以下简单介绍两款比较常用的官方插件的安装及使用方法：

**安装插件**

```
pnpm i -D @tailwindcss/line-clamp @tailwindcss/aspect-ratio    # yarn add -D @tailwindcss/line-clamp @tailwindcss/aspect-ratio    # npm i -D @tailwindcss/line-clamp @tailwindcss/aspect-ratio
```

**注册插件**

```
/** @type {import('tailwindcss').Config} */    module.exports = {      content: [        './src/**/*.{vue,js,ts,jsx,tsx}'      ],      plugins: [         require('@tailwindcss/line-clamp'),        require('@tailwindcss/aspect-ratio'),      ],    }
```

**line-clamp 插件使用方法**

```
<template>
      <div class="line-clamp-3 text-secondary">
        <span v-for="x in 100" :key="x">我是一段文本</span>
      </div>
    </template>
```

我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本我是一段文本

**aspect-ratio 插件使用方法**

生成一个常用视频（16:9）的比例盒子：

```
<div class="w-[400px] aspect-video bg-blue-300">      <video        src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm"        class="w-full h-full"        controls />    </div>
```

[视频详情](javascript:;)

又爱又恨的 Preflight 特性
------------------

**preflight** 是 TailwindCSS 内置的一套全局样式，其作用类似于 normalize.css / modern-normalize （TailwindCSS 建立在 modern-normalize 之上）。

preflight 主要修改的全局样式情况：

*   为所有元素设置 box-sizing 为 `border-box`
    
*   为所有元素设置了一个宽度为 0，风格为 `solid` 的边框（这里有坑，后面会提到）
    
*   去掉 body/h1/h2/h3/h4/h5/h6/p 等标签的 `margin`
    
*   设置 h1/h2/h3/h4/h5/h6 的字体大小为网页默认字体
    
*   去掉 a 标签的颜色和下划线
    
*   去掉按钮的背景色
    
*   去掉 ol/ul 的列表风格
    
*   设置 textarea 只能纵向伸缩
    
*   重设 input/textarea 的 placholder 颜色
    
*   **img/video/audio/svg/canvas/iframe 等标签被设置为块级盒子**
    
*   设置图片、视频的最大宽度为 100%，以防溢出父级视区内
    

#### 禁用此特性

preflight 默认是跟随 `@tailwind base` 被注入到你的应用中的，如果不想使用这个特性，可以在配置中新增一行：

```
/** @type {import('tailwindcss').Config} */    module.exports = {      corePlugins: {        preflight: false      },      // ...    }
```

个人看法

我个人不喜欢使用这个特性，一般会关掉，理由有三：

1.  一般我会在项目中引用 `normalize.css` 或 `modern-normalize` 库，如果使用 preflight，其实有部分工作是重复的；
    
2.  preflight 主要是对 html 的一些原生标签进行样式重置，而像 h1/h2/h3/h4/h5/h6/ol/ul/p 等标签，我喜欢使用 div 标签代替，虽然会降低语义化，但是效率提升了；
    
3.  我不喜欢 img 标签被设置为块级盒子这个特性，因为这很反直觉，给开发人员带来了额外的学习成本。
    

#### 边框默认样式的坑

如果你禁用了这个特性，在设置边框时需要注意一下写法的不同。TailwindCSS 官方推荐的边框写法：

```
<div class="border-t border-gray-200" />
```

结合 preflight 的全局样式：

```
* {      border-width: 0;      border-style: solid;    }
```

最终，合成的样式将会是：

```
div {      border-width: 0;      border-top-width: 1px;      border-style: solid;      border-color: #e5e7eb;    }
```

但是，如果禁用掉 preflight，则最终合成的样式将会是：

```
div {      border-top: 1px;      border-color: #e5e7eb;    }
```

此时，边框将会不存在，因为没有设置边框的风格。

因此，**你需要为每个设置边框的场景都设置边框样式**：

```
<div class="border-t border-solid border-gray-200" />
```

这种写法的问题就更大了，除了上边框是灰色外，其他边也会出现边框，因为 html 中所有元素的默认边框宽度为 1px。为了去掉其他边的边框，你还需要手动处理：

```
<div class="border-t border-solid border-gray-200 border-l-0 border-r-0 border-b-0" />
```

这？？？也太痛苦了，所以，个人推荐手动加入一些全局样式：

```
*, *:before, *:after {      border-width: 0;      border-style: solid;    }
```

这样，就跟开启了 preflight 特性的效果保持一致了。

TIP

反向操作，你可以在启用 preflight 的前提下，将 img 等标签设置为行内盒子。

*   ### 
    
    前端 社群  
    
      
    
      
    
    下方加 Nealyang 好友回复「 加群」即可。
    
    ![](https://mmbiz.qpic.cn/sz_mmbiz_png/udZl15qqib0N4k0zoSSTiaUeicvTRStJYYmGWa6YpNqicxibYmM4oSD8oWs9X8b9DfK3CpUmGMWzIriaiaOf1L59t9nGA/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)
    
    如果你觉得这篇内容对你有帮助，我想请你帮我 2 个小忙：  
    
    1. 点个「在看」，让更多人也能看到这篇文章