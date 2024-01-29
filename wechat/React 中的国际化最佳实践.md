> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/FJYk8FdHYgJQIcHCcNOv0Q)

> React 知命境第 46 篇，原创第 160 篇

这篇是年前最后一篇分享 `React 知命境` 的文章。

到目前为止，知命境这个合集里已经包含了大量的内容，足够我们在 React 上成为成为一名高手，也有许多付费群里的朋友陆陆续续靠合集里的内容找到了更好的工作，也算是把之前对群友承诺的坑补齐了，延后了很久实在是抱歉。后续 React 知命境的内容会根据大家在群里的疑问补充一些东西。

之后公众号的更新计划是会紧急出一个**鸿蒙应用开发高质量学习速成**的付费专栏合集。预计会在一个月左右的时间完成，有兴趣的可以期待一下。

* * *

有的人不知道国际化如何实现，因此专门写一篇文章分享一下在 React 中如何实现国际化。

> 国际化项目指的是支持多国语言切换的项目

在实现国际化之前，我们要考虑一个比较严肃的问题，就是商用项目是否应该利用翻译软件自动翻译结果？

答案是：**不应该。**

这里的核心问题不是说翻译不准确，最严重的问题是自动翻译会可能出现不符合当地人语言习惯、不符合当地法律条文等情况，从而导致项目推广受到不可控的阻碍。

因此国际化项目的核心内容，都应该有专业的翻译团队来处理语言翻译问题。

从技术角度上来说，自动翻译还会出现的情况是翻译结果单词过长，会导致布局出现混乱。因此翻译结果就会有一些限制。

明确了这个前提，我们再来思考具体的功能应该如何实现。不然很多团队在自动翻译上踩坑之后才明白过来，就很得不偿失了。

0
-

**数据驱动 UI**

在数据驱动 UI 的考虑之下，我们很容易能够想到实现方案，因为文字内容成为了变化量，所以文字内容就应该抽象成具体的数据。

结合语言切换，会导致文字内容发生变化，那么很容易能够想到，我们应该设计一个状态，来表示当前选中的语言是什么

```
const [local, setLocal] = useState<I18nType>('zh_cn')
```

这个状态会影响到整个项目，因此在 React 中，我们可以把该状态设计成为全局状态。

我们只需要选择一种全局状态管理方案来做即可。我这里选择我自己设计的状态管理工具 `mozz`

首先设计一个自定义 hook 用于存储状态 local

```
import { useState } from "react";export type I18nType = 'zh_cn' | 'zh_en'export function useI18n() {  const [local, setLocal] = useState<I18nType>('zh_cn')  return {local, setLocal}}
```

然后引入 `mozz`，把该自定义 hook 转化为全局 store

```
import { useState } from "react";+ import {createStore} from 'mozz'export type I18nType = 'zh_cn' | 'zh_en'export function useI18n() {  const [local, setLocal] = useState<I18nType>('zh_cn')  return {local, setLocal}}+ export const {Provider, useStore} = createStore(useI18n)
```

然后在项目入口文件中，使用 `Provider` 包裹项目顶层父组件

```
import {Provider} from './useI18n'import App from './App'export default function I18nApp() {  return (    <Provider>      <App />    </Provider>  )}
```

这样，在任意子组件，我们就可以通过 `useStore` 拿到刚才自定义 hook 中的状态

```
import {useStore} from "./useI18n";const hw = {  'zh_cn': '你好，世界！',  'zh_en': 'hello world!'}export default function App() {  const {local} = useStore()  return (    <div>      <div>{hw[local]}</div>    </div>  )}
```

简单吧。

我们可以引入一个切换语言的功能，实现也非常简单，就是利用 `useStore` 拿到 `setLocal` 去改变值即可

```
import {useStore} from './useI18n'const switchLanguage = {  'zh_cn': '中文',  'zh_en': 'english'}export default function ChangeLanguage() {  const {local, setLocal} = useStore()  function onclick() {    if (local === 'zh_cn') {      setLocal('zh_en')    }    if (local === 'zh_en') {      setLocal('zh_cn')    }  }  return (    <div>      <button onClick={onclick}>        {switchLanguage[local]}      </button>    </div>  )}
```

将该组件引入到 App 中

```
+ import ChangeLanguage from "./ChangeLanguage";import {useStore} from "./useI18n";const hw = {  'zh_cn': '你好，世界！',  'zh_en': 'hello world!'}export default function App() {  const {local} = useStore()  return (    <div>+     <ChangeLanguage />      <div>{hw[local]}</div>    </div>  )}
```

一个简易的国际化应用就实现了。

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/Kn1wMOibzLcGlxliao4Cxjnl7UejVQkj6XockicNoQGk5OM3HSp2thHuPexXyyrlV5D0P9uXWOKb8oRZteBichwzbg/640?wx_fmt=gif&from=appmsg)

组件的扩展也非常简单，你要创建新的组件支持国际化，只需要使用 useStore 拿到我们刚才设计的状态 `local` 即可。文章里就不继续扩展了。

1
-

**语言包如何维护**

我们通过切换状态 `local`，从一个语言的配置项中获取到对应的文案内容。这里还有一个关键的问题就是，语言的配置文件应该如何维护。

这里有两种思考。

一种就是如果你的项目可以支持自定义语言包。那么就需要把整个项目所有的语言配置都写在同一个文件里，例如中文语言包

```
// zh_cn.tsconst language = {  global: '请选择',  // 表示唯一基础组件  Table: {    filterTtitle: '筛选',    ...  },  // 表示唯一页面组件  personal: {    info: '个人信息',  }}
```

然后每支持一种语言，我们就会维护一个语言包文件。根据 `local` 去选择使用具体的语言包

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcGlxliao4Cxjnl7UejVQkj6XYc0o7Mg3bs2dNCPxEcZRbo1g4kwXAlfPYUibsnwGr3ia6cZkp0gvib51A/640?wx_fmt=png&from=appmsg)

这样，当你需要新增其他的外置语言包的时候，只需要给项目提供一个这样的格式统一的文件即可。

另外一种思路就是拆分维护。每个组件只维护自己的语言配置项。这样做的好处就是开发时会轻松很多，不需要去全局的语言包里修改或者新增内容。

例如在 antd 中，在每个稍微复杂的组件都单独维护了自己的多语言配置。

这种方式不需要考虑外部插件支持，只需要考虑自己内部维护，因此实现方式上就会灵活很多。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcGlxliao4Cxjnl7UejVQkj6Xyd61dxGbv8ibho3eZX5bSTyW9PnCJaUHUm65szKibydQPHtn8XCG1wUQ/640?wx_fmt=png&from=appmsg)

2
-

**总结**

国际化的实现在 React 中并不难，属于看完就学会的一个知识点。只是在商用项目中，完善起来比较繁琐。更多的工作量体现在语言包的维护上。稍有差错就是 bug。

> **「React 知命境」** 是一本从知识体系顶层出发，理论结合实践，通俗易懂，覆盖面广的精品小册，点击下方标签可阅读其他文章。欢迎关注我的公众号，我会持续更新。[购买 React 哲学](http://mp.weixin.qq.com/s?__biz=MzI4NjE3MzQzNg==&mid=2649867007&idx=1&sn=6443ff970cd077bbb50de74ce84afa06&chksm=f3e5936cc4921a7aba3fbf748b2f5a40369d8be7b6b2acf618f0701f477abea48b00e953165e&scene=21#wechat_redirect)，或者赞赏本文 30 元，可进入 **React 付费讨论群**，学习氛围良好，学习进度加倍。赞赏之后也能看到 React 哲学的全部内容

顺手一赞，年薪百万 !^_^!