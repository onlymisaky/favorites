> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/bU6NLIaZp1VDVpnmY1GVtg)

snippets 是片段的意思，VSCode 支持自定义 snippets，写代码的时候可以基于它快速完成一段代码的编写。

![](https://mmbiz.qpic.cn/mmbiz_gif/YprkEU0TtGiaY5ojURWMlzRHibn94E41KwFGKu8KWzTmmyibtEOsnZ6sjLvQD1C57pUBUeSr5PkGbzwc6geekIMuA/640?wx_fmt=gif)

不只是 VSCode，基本所有的主流编辑器都支持 snipeets。

一个功能被这么多编辑器都支持，那肯定是很有用的，但是这功能大多数人都没用起来。

我之前写过一篇 [snippets 的文章](http://mp.weixin.qq.com/s?__biz=Mzg3OTYzMDkzMg==&mid=2247485590&idx=1&sn=ea7cd553ffe0462c4639f4fa02d03d2a&chksm=cf00c7adf8774ebb6e1b8479927b3c80f9642708b035d86e32df9f143855e457caee503641ba&scene=21#wechat_redirect)，讲了 snippets 支持的各种语法和配置方式，但是并没有用这些来做一个真实的案例。

所以，这篇文章就来讲一个真实的 snippets，基本用到了所有的 snippets 语法。能独立把它写出来，就可以说 snippets 已经掌握了。

我们还是先回顾下 VSCode 的 snippets 语法

snippets 基础
-----------

snippets 是这样的 json 格式：

```
{    "alpha": {        "prefix": ["a", "z"],        "body": [            "abcdefghijklmnopqrstuvwxyz"        ],        "description": "字母",        "scope": "javascript"    }}
```

*   prefix 是触发的前缀，可以指定多个
    
*   body 是插入到编辑器中的内容，支持很多语法
    
*   description 是描述
    
*   scope 是生效的语言，不指定的话就是所有语言都生效
    

body 部分就是待插入的代码，支持很多语法，也是一种 DSL（领域特定语言）。

支持通过 、2 指定光标位置：

```
"$1  xxxx","yyyy $2"
```

![](https://mmbiz.qpic.cn/mmbiz_gif/YprkEU0TtGiaY5ojURWMlzRHibn94E41KwPkNqYXGFM7flAMiayzuwChG6yRFk3sumvJW0ibGD4gJWPjN9uicNJGic2Q/640?wx_fmt=gif)

可以多光标同时编辑：

```
"$1  xxxx $1"
```

![](https://mmbiz.qpic.cn/mmbiz_gif/YprkEU0TtGiaY5ojURWMlzRHibn94E41KwDI0AChJrfrsEiabzNF7MeicjLiafgmStFib9tSYpiaaaic4b3Jtz3yXTz8ng/640?wx_fmt=gif)

可以加上 placeholader，也可以做默认值：

```
"${1:aaa}  xxxx","yyyy ${2:bbb}"
```

![](https://mmbiz.qpic.cn/mmbiz_gif/YprkEU0TtGiaY5ojURWMlzRHibn94E41Kw7XkJyxKSGJXmFF2ZUrBf5eibLwDMsYaCnZSdKDHSF4IWIWnh7trVmicQ/640?wx_fmt=gif)

可以提供多个值来选择：

```
"${1|卡颂,神光,yck|}最帅"
```

![](https://mmbiz.qpic.cn/mmbiz_gif/YprkEU0TtGiaY5ojURWMlzRHibn94E41KwUAyUnDLlNU2bNZj7fqfsAoF052XzQVyS4m6lgjib698DR5gj3THJ4ibA/640?wx_fmt=gif)

还提供了一些变量可以取：

```
"当前文件： $TM_FILENAME","当前日期： $CURRENT_YEAR/$CURRENT_MONTH/$CURRENT_DATE"
```

![](https://mmbiz.qpic.cn/mmbiz_gif/YprkEU0TtGiaY5ojURWMlzRHibn94E41KweA8X9zqT2Htsu9wF66s1k1L3ib0nv806kk14xpDabeC8qvqb9AtfYDg/640?wx_fmt=gif)

而且还能对变量做正则替换：

```
"${TM_FILENAME/(.*)\\.[a-z]+/${1:/upcase}/i}"
```

![](https://mmbiz.qpic.cn/mmbiz_gif/YprkEU0TtGiaY5ojURWMlzRHibn94E41KwKiasMJzHGIeexvkTDFYzLJCIrJQlE1PqicDtsV2XJCYSvxiaRNtdz2r2Q/640?wx_fmt=gif)

基本语法过了一遍，大家知道支持啥就行，后面我们来做个真实的案例，把这些用一遍就会了。

通过 command + shift + p，输入 snippets 然后选择一种范围：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGiaY5ojURWMlzRHibn94E41KwrAm6xibDBbLoeflCY6UXYlnp6H3a2bx8olWTkaG2zBq6eKsiaYNMj0iaA/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGiaY5ojURWMlzRHibn94E41Kwn8vQIvzvUfajWwgmtA02RfRQibmF7R2S8Y3K2MHn397iaPeic8nclVjLg/640?wx_fmt=png)

snippets 有 project、global、language 3 种生效范围。我个人写 global 级别的比较多，项目和语言级别的也可以。

基础过完了，接下来我们就来写一个 snippets 吧。

实战案例
----

我最近在做 vue 的项目，写 router-link 比较多，所以封装了个 router-link 代码的 snippets。

我们先写个最简单的版本：

```
{    "routerLink": {        "prefix": "link",        "body": [            "<router-link to={ name:'xxx', params: {id: 1} } target='_blank'>link</router-link>"        ],        "description": "router-link 跳转"    }}
```

这个没啥好说的，就是根据前缀补全内容：

![](https://mmbiz.qpic.cn/mmbiz_gif/YprkEU0TtGiaY5ojURWMlzRHibn94E41KwOwEd8YmqR7yqmAzWN5nURptUniakI91pXUaP9LOszWIpLxDclDcibWqA/640?wx_fmt=gif)

然后在 name、id、链接文字处加三个光标，也就是 $、$2、$3：

```
{    "routerLink": {        "prefix": "link",        "body": [            "<router-link to={ name: $1, params: {id: $2} } target='_blank'>$3</router-link>"        ],        "description": "router-link 跳转"    }}
```

可以按 tab 键快速编辑其中变化的部分：

![](https://mmbiz.qpic.cn/mmbiz_gif/YprkEU0TtGiaY5ojURWMlzRHibn94E41KwjOqEEtYOicrWKgEPawibSugVzDmhhUjdJLpJP1NBRLM17jdz0TXCsTqg/640?wx_fmt=gif)

然后加上 placeholder：

```
{    "routerLink": {        "prefix": "link",        "body": [            "<router-link to={ name: '${1:RouteName}', params: {id: ${2:id}} } target='_blank'>${3:link}</router-link>"        ],        "description": "router-link 跳转"    }}
```

![](https://mmbiz.qpic.cn/mmbiz_gif/YprkEU0TtGiaY5ojURWMlzRHibn94E41KwAXIXZkHAVbe7PpulojF99UOjnYCbYG64G2svF77sxQ4d0CMTS5d3pQ/640?wx_fmt=gif)

其实 target 部分也是可选的，这里我们用多选来做：

选项有两个，就是 target="_blank" 或者空格。

```
${3| ,target=\"_blank\"|}
```

所以 snippets 就变成了这样：

```
{    "routerLink": {        "prefix": "link",        "body": [            "<router-link to={ name: '${1:RouteName}', params: {id: ${2:id}} } ${3| ,target=\"_blank\"|}>${4:link}</router-link>"        ],        "description": "router-link 跳转"    }}
```

![](https://mmbiz.qpic.cn/mmbiz_gif/YprkEU0TtGiaY5ojURWMlzRHibn94E41KwbndW45F7hs0jibOJrXn3EcvUrjVXBriahG81wN2UvPJiaVD2JFuTGGg2Q/640?wx_fmt=gif)

跳转地址大多数是和当前文件名有关，比如 XxxYyyZzzList 跳转 XxxYyyZzzDetail 的比较多。

所以我们默认值取当前文件名，用 TM_FILENAME 变量（所有可用变量可以在 vscode 官网查）：

```
${1:$TM_FILENAME}
```

现在的 snippets：

```
{    "routerLink": {        "prefix": "link",        "body": [            "<router-link to={ name: '${1:$TM_FILENAME}', params: {id: ${2:id}} } ${3| ,target=\"_blank\"|}>${4:link}</router-link>"        ],        "description": "router-link 跳转"    }}
```

效果是这样：

![](https://mmbiz.qpic.cn/mmbiz_gif/YprkEU0TtGiaY5ojURWMlzRHibn94E41KwlgEsegwibuQoYRptyTaP2dQXT6hLjQJicIcDs2EvObNbXxoBmiaM5OuhQ/640?wx_fmt=gif)

确实把文件名填上去了，但是还要手动改，能不能填上去的就是改了之后的呢？

可以，变量支持做 transform，也就是正则替换：

XxxList.vue 要取出 Xxx 来，然后拼上 Detail，这样的正则不难写：

用 js 写是这样的：

```
'XxxList.vue'.replace(/(.*)List\.vue/,'$1Detail')
```

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGiaY5ojURWMlzRHibn94E41KwURY5LGwjKNQBmdlvf0p9Vh8wm2JvDjPibdXW0BibGvV6NJzrpic2S9gCA/640?wx_fmt=png)

在 snippets 里也差不多，只不过用 / 分开：

```
${TM_FILENAME/(.*)List\\.vue/$1Detail/i
```

所以 snippets 就变成了这样：

```
{    "routerLink": {        "prefix": "link",        "body": [            "<router-link to={ name: '${1:${TM_FILENAME/(.*)List\\.vue/$1Detail/i}}', params: {id: ${2:id}} } ${3| ,target=\"_blank\"|}>${4:link}</router-link>"        ],        "description": "router-link 跳转"    }}
```

填入的代码都是替换好了的：

![](https://mmbiz.qpic.cn/mmbiz_gif/YprkEU0TtGiaY5ojURWMlzRHibn94E41Kwcq8XvJbQz6sdnugwTeNdfLTFcvOIzs2ELRjZDBPwkNuYex8eicbw4kg/640?wx_fmt=gif)

链接的内容我们希望用选中的内容，这个也有变量，就是 TM_SELECTED_TEXT。

![](https://mmbiz.qpic.cn/mmbiz_gif/YprkEU0TtGiaY5ojURWMlzRHibn94E41KwKVdEvdyvYd3dS83lZrCgDs0ichVGXicNY6goyvbntZyjUQzuvkY0TbnQ/640?wx_fmt=gif)

最后，我们希望 router-link 这个标签也可以变，而且改的时候开闭标签可以一起改。

这个要用多光标编辑，指定多个 $x 为同一个数字就行。

```
<${5:router-link}></${5:router-link}>
```

效果就是这样的：

![](https://mmbiz.qpic.cn/mmbiz_gif/YprkEU0TtGiaY5ojURWMlzRHibn94E41KwBpcbxtquMbPfryEDVichTPCniaiaWfLIrAbibaTQqwV70q8Jxdeib9N2ucQ/640?wx_fmt=gif)

这就是最终的 snippets，所有 snippets 语法都用了一遍。

完整 snippets 如下，大家可以在 VSCode 里用用看，用起来体验还是很爽的：

```
{    "routerLink": {        "prefix": "link",        "body": [            "<${5:router-link} to={ name: '${1:${TM_FILENAME/(.*)List\\.vue/$1Detail/i}}', params: {id: ${2:id}} } ${3| ,target=\"_blank\"|}>${4:$TM_SELECTED_TEXT}</${5:router-link}>"        ],        "description": "router-link 跳转"    }}
```

总结
--

基本所有主流编辑器都支持 snippets，也就是配置代码片段来提高开发效率，VSCode 也不例外，这是一个很有用的功能。

VSCode snippets 支持 global、project、language 3 种生效范围。我个人用全局的比较多。

它也算是一种 DSL 了，支持很多语法，比如指定光标位置、多光标编辑、placeholder、多选值、变量、对变量做转换等语法。

*   指定光标位置：$x
    
*   多光标编辑：$x $x
    
*   指定 placeholder 文本：${x:placeholder}
    
*   指定多选值：${x|aaa,bbb,ccc|}
    
*   取变量：$VariableName
    
*   对变量做转换：${VariableName / 正则 / 替换的文本 / i}
    

我们写了一个 router-link 的 snippets，综合运用了这些语法，过一遍就会了。

能自己定义适合自己的 snippets，对于提高开发效率是很有帮助的。如果没写过，不妨从今天开始试一下吧。

![](https://mmbiz.qpic.cn/mmbiz_gif/5Q3ZxrD2qNAwfITg4YV29uSdjzeu5TianfNF4GxRloxGjYnDmsXeLeaiaxc3JplwWTTlaDU8tr50srgXqHe3Gr4Q/640?wx_fmt=gif)

**彦祖，点个****「在看」**吧