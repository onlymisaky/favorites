> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/lPkxmRV8CFB9gGRCkqOZ0w)

事情是这样的, 我每创建一个项目都要配置一遍 `eslint` 配置, 而且还要去安装那些一大堆的依赖包, 看见我每天都在做重复的事情, 于是把我踢出群了。除了我之前, 还有一个经常重复配置 `babel` 的, 也被踢出群了。(妈的我编不下去了)

实际上是这样的, 因为最近在开发一个脚手架, 并且有很多个模板, 分别有 `react`、`vue` 的, 它们两个就有好几个 `eslint` 基本相同的配置, 难道我要每一个模板配置一遍吗。于是我就将这些常用配置封装成了一个包, 直接在使用的项目的 `eslint` 文件中 `extends` 继承一下就可以了。

项目初始化
=====

到这里我们先新建一个文件, 然后使用 `npm init` 创建一个文件, 如下代码所示:

```
{  "name": "eslint-config-liang-zai",  "version": "777.777.777",  "description": "超级无敌的eslint配置,学会即实业,你值得拥有",  "main": "index.js",  "scripts": {    "test": "echo \"Error: no test specified\" && exit 1"  },  "keywords": [],  "author": "moment",  "license": "MIT"}
```

在上面的代码中, 最重要的还是 `name` 字段和 `version` 字段,`name` 字段为你的 `npm` 包的名称。  

通常情况下，用于 `esLint` 的配置包的命名是以 `eslint-config-` 开头的。这是一种常见的命名约定, 用于指示该包是用于 `eslint` 配置的。

`version` 字段那里这样设计这么大的设计, 这样就会显得逼格很高, 一般人我不会告诉他, 但是我这次说了之后你们别说是我教的, 我怕被打。

在初始化完成之后, 你可以创建一个 `README.md` 文件用来介绍你的依赖包是怎么用的或者有什么规则, 你写的内容会显示在 `npm` 官网上, 如下图所示:![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHodJpNnRCdBGXD7LvOXT3W7UIu9afucVGibAMz2KHvGGjE5nfA9ibu3kuwwMnRdmcJ6r3UPh1vVQvEw/640?wx_fmt=other)

在初始化完成之后, 我们开始写代码了。

编写 eslint
=========

首先我们应该安装 `eslint` 作为依赖项:

`npm install eslint`

并创建一个 `index.js` 文件作为 `eslint` 的配置文件, 并在其中配置你的规则和选项, 关于用什么配置这里我就不讲了, 来一个简单的吧, 待会测试一下是否成功:

```
module.exports = {  parserOptions: {    ecmaVersion: "latest",    sourceType: "module",    ecmaFeatures: {      jsx: true,      experimentalObjectRestSpread: true,    },  },  env: {    browser: true,    node: true,  },  rules: {    "no-var": "error",  },};
```

因为这里不详细讲 `eslint` 的配置, 这里就写这么一点的配置, 如果你更懂 `eslint` 的配置, 那么欢迎你来给我的脚手架里贡献代码, 目前这个脚手架提供的功能已经很多了, 有 `react` 和 `vue` 的 `web` 应用开发已经 `react` 组件库和普通库的开发, 一行命令即可创建项目, 零配置开箱即用:  

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHodJpNnRCdBGXD7LvOXT3W7Zbyo39ibWFvibibQeTLtb8CY6Cya1v4bZQPibziaibsOHmJLmzeLojwAAGtw/640?wx_fmt=other)

这里还做了一个 `babel` 的 `npm` 包, 因为写出来之后我还没有用过, 这里就不讲了, 还不知道能不能运行。

发布
==

既然 `eslint` 的配置写好了, 接下来就可以使用 `publish` 发布你的包了:

`npm publish`

发布成功之后大概有如下图信息所示:![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHodJpNnRCdBGXD7LvOXT3W7GRHW5icZjK12XHhgpluuwhAexPjQLRmWF4ibaoNjbVzicbG1o3aLdicy3w/640?wx_fmt=other)

因为我使用的是 `pnpm` 使用 `npm` 应该也是差不多的提示信息。

这时我们的包就发布成功了, 我们来看看 `npm` 官网查看是否存在这个包:![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHodJpNnRCdBGXD7LvOXT3W7PmQ0ak7YyOASUZY4eBLb4hGhqE3IVnicV8IHaYP2MFOjUpj11icLWbgg/640?wx_fmt=other)

发布成功......

测试
==

包是发布成功了, 接下里我们来测试一下这个包是否能正常运行, 创建一个新项目来试试水, 在项目中安装该依赖包:

`npm i eslint-config-liang-zai`

并在项目的根目录中创建一个 `.eslint.json` 文件或者 `eslint` 配置运行的文件, 在这个文件中配置如下:

`{ "extends": "liang-zai" }`

包前面的 `eslint-config-` 可以省略, 具体信息请看下图:![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHodJpNnRCdBGXD7LvOXT3W7mQJEyF6kPibia0YoFXe903czicmmfaofnDvqavAfZJgge7lc3ka221pDw/640?wx_fmt=other)

你会发现, 在我们前面的配置规则中添加了禁止使用 `var` 声明的变量, 当我们在项目中使用, 它就报错了。

好了项目到了这里, 说明整个流程也就结束了, 如果你也想有一个自己的 `npm` 包, 不妨你可以先从 `eslint` 的配置入手, 你还可以向朋友推荐的 `npm` 包来使用呢。

最后推荐一下我自己一直在维护的包, 是一个 脚手架, 欢迎 star

关于本文  

作者：Moment
=========

https://juejin.cn/post/7243393609491120186

The End

如果你觉得这篇内容对你挺有启发，我想请你帮我三个小忙：

1、点个 「在看」，让更多的人也能看到这篇内容

2、关注官网 https://muyiy.cn，让我们成为长期关系

3、关注公众号「高级前端进阶」，公众号后台回复 「加群」 ，加入我们一起学习并送你精心整理的高级前端面试题。

》》面试官都在用的题库，快来看看《《  

```
最后不要忘了点赞呦！

```