> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/UN34KwOziCKhapZkwqufDQ)

这里是终于还有两个页面就要写完项目的丹星，这篇也是讲述掘金网页项目中用到的比较重要的一个技术——markdown 的前端渲染。

提起 markdown 很多人会想到 Typora，这也是我常用的 markdown 编辑器，下面是 Typora 的界面。

![](https://mmbiz.qpic.cn/mmbiz_png/ttrqcK0cICPI7L8w9kOJkS9sjaEPXrR4ogMCSvVW0MdKrrOMKe4ib3tNOCibc8KaYaOULjDUcGnDGLINodCk9X9w/640?wx_fmt=png)        其实 Typora 是将 markdown 语法编译成为了 HTML，然后展现了出来，比如单个 #号编译为了 H1 标签。

        掘金和 CSDN 这类网页也提供了 markdown 写作的功能。那么前端如何做一个 markdown 的富文本编辑器并且呈现实时预览呢？

        一套简单的技术栈是：marked.js 实现 markdown 文本转 HTML，highlight.js 对代码进行高亮。

但是如果你是一名 React 选手，那么你可以使用：

*   **富文本编辑以及预览**：md-editor-rt
    
*   **markdown 文本解析**：react-markdown
    
*   **使 markdown 支持 HTML 语法**：rehype-raw
    
*   **划线、表、任务列表和直接 url 等的语法扩展**：remark-gfm
    
*   **代码高亮**：react-syntax-highlighter
    
*   **目录提取与跳转**：markdown-navbar
    

没错，我就是组件小子

![](https://mmbiz.qpic.cn/mmbiz_png/ttrqcK0cICPI7L8w9kOJkS9sjaEPXrR4A7pfqCiauEgU7QxsneNZOjIY575Qd0rWp5dGyCNAOWvnuVsACs2AulQ/640?wx_fmt=png)

下面来体验一下 React 的强大生态。

md-editor-rt 富文本编辑器
===================

下载

```
yarn add md-editor-rt
```

在 React Hooks 中，只需要非常简单的引入，使用`useState`配合`Editor`的两个 API，就可以实现输入 markdown 并且实时渲染。

```
import React, { useState } from 'react';// 导入组件import Editor from 'md-editor-rt';// 引入样式import 'md-editor-rt/lib/style.css';  export default function Md() {  const [text, setText] = useState('hello md-editor-rt！');  return <Editor modelValue={text} onChange={setText} />;}
```

并且 md-editor-rt 自带了 Toolbar，也就是编辑框上方的辅助栏，可以帮助用户更好的编辑。![](https://mmbiz.qpic.cn/mmbiz_png/ttrqcK0cICPI7L8w9kOJkS9sjaEPXrR4LEoyT5CYx22Gj46QQvq4SkIHyicAyVoaf8CsSWBYgylmP7NpkYMbI2A/640?wx_fmt=png)

React-markdown 的渲染
==================

        上面说的是 markdown 编辑器以及渲染，如果后端传来了一个 markdown 文本，我们需要把它渲染到网页上，就像我们点进 CSDN 和掘金看文章，这时候需要对 markdown 做一个渲染，就可以用到 react-markdown。下载

```
yarn add react-markdown
```

        只需要把 markdown 的文本放到 ReactMarkdown 双标签的组件就可以啦

```
import ReactMarkdown from "react-markdown";<ReactMarkdown># Hello, *World*!</ReactMarkdown>
```

![](https://mmbiz.qpic.cn/mmbiz_png/ttrqcK0cICPI7L8w9kOJkS9sjaEPXrR4UDt9oyZyjA20SY1o2gzMDJmvjo6nUCZb3WVz1slWpdvnXuR9YhvTyQ/640?wx_fmt=png)        上方的 Hello World! 被解析为了一个 h1 标签。如果是单标签的话，我们可以把 markdown 的文本传入`children`参数中。

```
import ReactMarkdown from "react-markdown";<ReactMarkdown children={markdownText} />
```

引入插件支持
------

        react-markdown 并不支持所有的 Markdown 语法，但是我们可以使用插件来添加对这些语法的支持。

*   remake-plugin 增加了对脚注、划线、表、任务列表、自动链接文字或直接 url 的支持
    
*   rehype-raw 增加了对 HTML 原生语法的支持
    

```
import gfm from "remark-gfm";import rehypeRaw from 'rehype-raw'; import gfm from 'remark-gfm';<ReactMarkdown  children={text}  rehypePlugins={[rehypeRaw]}  remarkPlugins={[gfm]}/>
```

react-syntax-highlighter
========================

        markdown 中代码会转为 code 标签，但是 HTML 中对 code 其实没有很好的样式支持，所以我们需要额外的组件进行代码高亮。

        我们可以定义一个组件（component），加入到 react-markdown 中。

```
import gfm from "remark-gfm";import rehypeRaw from 'rehype-raw'; import gfm from 'remark-gfm';<ReactMarkdown  children={text}  rehypePlugins={[rehypeRaw]}  remarkPlugins={[gfm]}  components={CodeBlock}/>
```

        其中`CodeBlock`是我们定义的插件。

        首先，我们导入 react-syntax-highlighter 和一个代码主题，这里是`atomDark`, 你也可以选择别的主题。

```
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';const CodeBlock = {  code({ node, inline, className, children, ...props }) {    const match = /language-(\w+)/.exec(className || '');    return !inline && match ? (      <SyntaxHighlighter        children={String(children).replace(/\n$/, '')}        style={atomDark} // theme        language={match[1].toLowerCase()}        PreTag="section" // parent tag        {...props}      />    ) : (      <code className={className} {...props}>        {children}      </code>    );  },};
```

        下面的这一串`code({ node, inline, className, children, ...props })` 可以看成是模板（因为我也不太能看得懂），但是后面的代码其实比较容易理解。

        这里的 match 其实是抽取了代码块的代码语言，match[1] 的位置其实就是指定的语言，这里一个踩坑的点：**最好把字符串小写化**。因为用户可能输入的是`Java`，但是`SyntaxHighlighter`其实只能识别`java`，所以会出现代码没有高亮的情况。

        返回三元字符串的意思是如果语言支持，则使用`SyntaxHighlighter`高亮，如果不支持则直接返回`code`标签包裹。

markdown-navbar 目录提取
====================

        仍然是一个无脑的组件，你只需要将 markdown 文本传入 source 参数，就可以自动提取标题，并且点击标题可以实现跳转和目录高亮。

```
import MarkNav from 'markdown-navbar';<MarkNav source={text} />
```

网页案例
====

        好了，你现在以及会 markdown 的渲染操作了，去写一个博客网页的案例吧，只需要再加一点点细节。![](https://mmbiz.qpic.cn/mmbiz_png/ttrqcK0cICPI7L8w9kOJkS9sjaEPXrR4pl8hVLI5p5UIcMIBWSfFvKb5lHGdgAJtjLF3vpgJOaWWaGSSxicHtpQ/640?wx_fmt=png)

  
  
![](https://mmbiz.qpic.cn/mmbiz_png/ttrqcK0cICPI7L8w9kOJkS9sjaEPXrR4nAA5IlFfyn6cMVF9YLdLBsugSiag1qlYDFvBgVcOwnELFknkUWZuQiag/640?wx_fmt=png)  

![](https://mmbiz.qpic.cn/mmbiz_png/ttrqcK0cICPI7L8w9kOJkS9sjaEPXrR4HEP7bMUhGJuNzh2T3uqaib5TnwkCNY4icoibtt059GUB6B0CVR03DFbdw/640?wx_fmt=png)

> > 欢迎关注这个摸鱼更新的公众号![](https://mmbiz.qpic.cn/mmbiz_jpg/ttrqcK0cICPI7L8w9kOJkS9sjaEPXrR460FWbJG9awyfTa1Me7qyuO5zbmK01X9HxQKc1qw8ENmryEULshsfiag/640?wx_fmt=jpeg)