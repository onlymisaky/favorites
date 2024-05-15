> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/UCoRtFI0IhS1QQbKO29Dog)

有的需求需要在网页上写代码。

比如在线执行代码的 playground：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhSkoelH0Sk9QiaIibMFBYwjJb2E9ibdBMZYHgt6dJ8C5l2EZNKgF5AhvQhG1goLFfCa43MWOP8lZ5Hw/640?wx_fmt=png&from=appmsg)

或者在线面试：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhSkoelH0Sk9QiaIibMFBYwjJ4DkTlzhU5qxTnul4jOI4fh2ay0b7ODm1HMw3P8zU1nOze6vOyHzSWg/640?wx_fmt=png&from=appmsg)

如果让你实现网页版 TypeScript 编辑器，你会如何做呢？

有的同学说，直接用微软的 monaco editor 呀：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhSkoelH0Sk9QiaIibMFBYwjJuhCcOicpomZxJFX9XLkvXlkg4uvPEjueBj6HslY8iaMxQSCz6rM3VicicQ/640?wx_fmt=png&from=appmsg)

确实，直接用它就可以，但是有挺多地方需要处理的。

我们来试试看。

```
npx create-vite
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhSkoelH0Sk9QiaIibMFBYwjJLF1kqVmDJN6egx1mguLk5vrYvM4LT7oic33olrDILPsZgsJObAEiaNmg/640?wx_fmt=png&from=appmsg)

创建个 vite + react 的项目。

安装依赖：

```
npm install

npm install @monaco-editor/react
```

这里用 @monaco-editor/react 这个包，它把 monaco editor 封装成了 react 组件。

去掉 main.tsx 里的 index.css

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhSkoelH0Sk9QiaIibMFBYwjJodjjqWoxiakq9bZ2Kw8icKq79sDeacd4ZDBH4kcALe2DzFL7v4JiaPgqA/640?wx_fmt=png&from=appmsg)

然后在 App.tsx 用一下：

```
import MonacoEditor from '@monaco-editor/react'export default function App() {  const code = `import lodash from 'lodash';function App() {  return <div>guang</div>  }    `;  return <MonacoEditor      height={'100vh'}      path={"guang.tsx"}      language={"typescript"}      value={code}  />}
```

跑下开发服务：

```
npm run dev
```

试下看：

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/YprkEU0TtGhSkoelH0Sk9QiaIibMFBYwjJesmPkNjdWPibiceIQBczqhkQqMILmicXsxuPc1HTgCziaviacS4Sw8hUWIA/640?wx_fmt=gif&from=appmsg)

现在就可以在网页写 ts 代码了。

但是有报错：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhSkoelH0Sk9QiaIibMFBYwjJyXSanykPoJHYD9pTaDn7doeB8udicK8B3Cv0icRn7JwbYpvttCKrcSog/640?wx_fmt=png&from=appmsg)

jsx 语法不知道怎么处理。

这里明显要改 typescript 的 tsconfig.json。

怎么改呢？

这样：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhSkoelH0Sk9QiaIibMFBYwjJYwr5oHYekEUbFJYLvVM5yFUa2pYM02OtuOLXKOe8y5NsbbfCfIB25w/640?wx_fmt=png&from=appmsg)

```
import MonacoEditor, { OnMount } from '@monaco-editor/react'export default function App() {  const code = `import lodash from 'lodash';function App() {  return <div>guang</div>  }    `;  const handleEditorMount: OnMount = (editor, monaco) => {    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({        jsx: monaco.languages.typescript.JsxEmit.Preserve,        esModuleInterop: true,    })}  return <MonacoEditor      height={'100vh'}      path={"guang.tsx"}      language={"typescript"}      onMount={handleEditorMount}      value={code}  />}
```

onMount 的时候，设置 ts 的 compilerOptions。

这里设置 jsx 为 preserve，也就是输入 <div> 输出 <div>，保留原样。

如果设置为 react 会输出 React.createElement("div")。

再就是 esModuleInterop，这个也是 ts 常用配置。

默认 fs 要这么引入，因为它是 commonjs 的包，没有 default 属性：

```
import * as fs from 'fs';
```

设置 esModuleInterop 会在编译的时候自动加上 default 属性。

就可以这样引入了：

```
import fs from 'fs';
```

可以看到，现在 jsx 就不报错了：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhSkoelH0Sk9QiaIibMFBYwjJGpHHjLUPJkDTsMTR8vsU1OHJEVvcBTib1XbRM8PEiaY9esKv0JRP5GLQ/640?wx_fmt=png&from=appmsg)

还有一个错误：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhSkoelH0Sk9QiaIibMFBYwjJrYXKYbcsFoVqUq4AddTS0xUxGVCqkAibpDEO9Owg8eJDsTh94tA3FKw/640?wx_fmt=png&from=appmsg)

没有 lodash 的类型定义。

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/YprkEU0TtGhSkoelH0Sk9QiaIibMFBYwjJU5B8iaHEafRJvBLUIvfYgTWwfoZ6WwaCUurDedHYAhmRqPuBbjmhdhA/640?wx_fmt=gif&from=appmsg)

写 ts 代码没提示怎么行呢？

我们也要支持下。

这里用到 @typescript/ata 这个包：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhSkoelH0Sk9QiaIibMFBYwjJVGhLmHfET1yaJQ0dcPvFibJ2XqghngWiaCBC6ZuoOxMyKbMcq0icNT2Og/640?wx_fmt=png&from=appmsg)

ata 是 automatic type acquisition 自动类型获取。

它可以传入源码，自动分析出需要的 ts 类型包，然后自动下载。

我们新建个 ./ata.ts，复制文档里的示例代码：

```
import { setupTypeAcquisition } from '@typescript/ata'import typescriprt from 'typescript';export function createATA(onDownloadFile: (code: string, path: string) => void) {  const ata = setupTypeAcquisition({    projectName: 'my-ata',    typescript: typescriprt,    logger: console,    delegate: {      receivedFile: (code, path) => {        console.log('自动下载的包', path);        onDownloadFile(code, path);      }    },  })  return ata;}
```

安装用到的包：

```
npm install --save @typescript/ata -f 
```

这里就是用 ts 包去分析代码，然后自动下载用到的类型包，有个 receivedFile 的回调函数里可以拿到下载的代码和路径。

然后在 mount 的时候调用下：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhSkoelH0Sk9QiaIibMFBYwjJNiaCjmmOJJsRYNanepLbs9GI28AIMW1aTRvqaNUu6XSrkdzA886qeDg/640?wx_fmt=png&from=appmsg)

```
const ata = createATA((code, path) => {    monaco.languages.typescript.typescriptDefaults.addExtraLib(code, `file://${path}`)})editor.onDidChangeModelContent(() => {    ata(editor.getValue());});ata(editor.getValue());
```

就是最开始获取一次类型，然后内容改变之后获取一次类型，获取类型之后用 addExtraLib 添加到 ts 里。

看下效果：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhSkoelH0Sk9QiaIibMFBYwjJm9OOQhEoI7MbGslyZQaDNH0KhOib9mgibggsk8pic5hquMJ8evqynEMqg/640?wx_fmt=png&from=appmsg)![](https://mmbiz.qpic.cn/sz_mmbiz_gif/YprkEU0TtGhSkoelH0Sk9QiaIibMFBYwjJofJ9L6fozBwUf2R4ckbsQoRcccppcgyaRvzdnN8DRHiaPYwnaibqB18Q/640?wx_fmt=gif&from=appmsg)

有类型了！

写代码的时候用到的包也会动态去下载它的类型：

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/YprkEU0TtGhSkoelH0Sk9QiaIibMFBYwjJX4jicbhTYfIjeJ4MmwCK7xtEY9zefVA86KtynwlT6liaRbkiaibgWfK7nw/640?wx_fmt=gif&from=appmsg)

  

比如我们用到了 ahooks，就会实时下载它的类型包然后应用。

这样，ts 的开发体验就有了。

再就是现在字体有点小，明明内容不多右边却有一个滚动条：

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/YprkEU0TtGhSkoelH0Sk9QiaIibMFBYwjJkJspesfyOQuYUmbcZtm2BjK5YEicnV3NUWn3nKYPEfI18ykopUhzCKg/640?wx_fmt=gif&from=appmsg)

这些改下 options 的配置就好了：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhSkoelH0Sk9QiaIibMFBYwjJujSS25xNsUd0390EP1noxyZyl48JibjdzRyzVzcxdVPe6ibCyHdVofMw/640?wx_fmt=png&from=appmsg)scrollBeyondLastLine 是到了最后一行之后依然可以滚动一屏，关闭后就不会了。

minimap 就是缩略图，关掉就没了。

scrollbar 是设置横向纵向滚动条宽度的。

theme 是修改主题。

```
return <MonacoEditor      height={'100vh'}      path={"guang.tsx"}      language={"typescript"}      onMount={handleEditorMount}      value={code}      options={        {          fontSize: 16,                    scrollBeyondLastLine: false,          minimap: {            enabled: false,          },          scrollbar: {            verticalScrollbarSize: 6,            horizontalScrollbarSize: 6,          }        }    }  />
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhSkoelH0Sk9QiaIibMFBYwjJl9UZkiamhticGapKj2YGuSU7GYuYG22icn6UZ2U9BlAKBoTFH4UiahjECg/640?wx_fmt=png&from=appmsg)

好多了。

我们还可以添加快捷键的交互：

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/YprkEU0TtGhSkoelH0Sk9QiaIibMFBYwjJ9HvJ1CEpAiccZJicxvD0XT7yRDbqvXJrcbh3KOXdJFzjAZAC7sJoSxWg/640?wx_fmt=gif&from=appmsg)默认 cmd（windows 下是 ctrl） + j 没有处理。

我们可以 cmd + j 的时候格式化代码。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhSkoelH0Sk9QiaIibMFBYwjJmllqZH5ZyCZRIy65m6F0fm3gM3Y4M1DVmkB4s1JnzWqJp2mOYxYtvA/640?wx_fmt=png&from=appmsg)

```
editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyJ, () => {    editor.getAction('editor.action.formatDocument')?.run()});
```

试下效果：

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/YprkEU0TtGhSkoelH0Sk9QiaIibMFBYwjJOv8CcNCSJfmRicLNZrcLUuwgJSRLWRbK1xBlkwdGg9fABI7Ot9icw8CQ/640?wx_fmt=gif&from=appmsg)

有同学可能问，monaco editor 还有哪些 action 呢？

打印下就知道了：

```
editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyJ, () => {    // editor.getAction('editor.action.formatDocument')?.run()    let actions = editor.getSupportedActions().map((a) => a.id);    console.log(actions);});
```

有 131 个：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhSkoelH0Sk9QiaIibMFBYwjJUplC9Yl2aGLPicOIxeur7NXkbrJZfdMffrNUKIAxIYB35qObHPkWdGw/640?wx_fmt=png&from=appmsg)

用到再搜就行。

这样，我们的网页版 TypeScript 编辑器就完成了。

总结
--

有的需求需要实现网页版编辑器，我们一般都用 monaco editor 来做。

今天我们基于 @monaco-editor/react 实现了 TypeScript 编辑器。

可以在 options 里配置滚动条、字体大小、主题等。

然后 onMount 里可以设置 compilerOptions，用 addCommand 添加快捷键等。

并且我们基于 @typescript/ata 实现了自动下载用到的 ts 类型的功能，它会扫描代码里的 import，然后自动下载类型，之后 addExtraLib 添加到 ts 里。

这样在网页里就有和 vscode 一样的 ts 编写体验了。

为啥要研究这个呢？

因为我最近在开发 react playground，在左侧写代码，然后实时编译在右侧预览：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhSkoelH0Sk9QiaIibMFBYwjJmSgmXSeYM0icyx8sDKK5RCMFTIc5FoF6F8CDN6iakdfAhugdtaYRYCMQ/640?wx_fmt=png&from=appmsg)

这是我小册 《React 通关秘籍》的一个项目，感兴趣的话可以上车一起做。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhSkoelH0Sk9QiaIibMFBYwjJib1BDNYeNSjTmuOiaANSCPCFjDMweBMkYv9Rib89z6KjSl5Hft92qFQJw/640?wx_fmt=png&from=appmsg)