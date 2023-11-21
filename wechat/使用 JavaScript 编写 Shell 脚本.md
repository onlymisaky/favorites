> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/e__82YNQD9NlUizTqTVuyw)

大家好，我是 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf&scene=21#wechat_redirect)。  

作为程序员，在平时的开发中肯定少不了一些命令行操作了。当然，简单的命令大家都是可以拿捏的，但是涉及到一些逻辑的时候还是比较头疼的。

Shell
-----

`Shell` 是一个用 `C` 语言编写的程序，它是用户使用 `Linux` 的桥梁。它既是一种命令语言，又是一种程序设计语言。

`Shell` 脚本（`shell script`），是一种为 `shell` 编写的脚本程序，一般文件后缀为 `.sh`。

`Shell` 编程跟 `java、php` 编程一样，只要有一个能编写代码的文本编辑器和一个能解释执行的脚本解释器就可以了。

`Shell` 的解释器种类众多，常见的有：

*   `sh` - 即 `Bourne Shell`。`sh` 是 `Unix` 标准默认的 `shell`。
    
*   `bash` - 即 `Bourne Again Shell`。`bash` 是 `Linux` 标准默认的 `shell`。
    
*   `fish` - 智能和用户友好的命令行 `shell`。
    
*   `xiki` - 使 `shell` 控制台更友好，更强大。
    
*   `zsh` - 功能强大的 shell 与脚本语言。
    

一般在 `shell` 脚本的开头，`#!` 告诉系统其后路径所指定的程序即是解释此脚本文件的 `Shell` 解释器。`#!` 被称作 `shebang`。

所以，你应该会在 `shell` 中，见到诸如以下的注释：

指定 `sh` 解释器

```
#!/bin/sh
```

指定 `bash` 解释器

```
#!/bin/bash
```

zx
--

当然，无论哪种解释器，对前端程序员都不算友好，有一定的学习成本。

毕竟我们只是 “切图仔”。

开个玩笑，因为我们前端程序员的口号是：能用 `JS` 实现的绝对不用其他语言实现。

当然，我们也可以用 `Node.js` 执行一些简单的 `Shell` 命令：

```
const { execSync } = require("child_process");exec('git diff orgin/master', (err, data) => {  if (err) {    console.log("失败", err);    process.exit(1);  } else {    console.log("成功", data);  }});
```

但是这个体验和直接写 `Shell` 脚本相比就比较差了，我们需要手动用 `child_process` 进行包装、每次引入一些额外的依赖库、异常处理也比较麻烦、另外还要考虑转译命令行参数。

所以 `Google` 的前端程序员开源了基于 `JavaScript` 实现的 `Shell` 解释器。`zx` 对 `child_process` 进行了默认包装，对参数进行了转译而且提供了合理的默认值。可以很方便的让我们使用前端熟悉的 `JavaScript` 语法来编写 `Shell` 脚本：

```
#!/usr/bin/env zxawait $`cat package.json | grep name`let branch = await $`git branch --show-current`await $`dep deploy --branch=${branch}`await Promise.all([  $`sleep 1; echo 1`,  $`sleep 2; echo 2`,  $`sleep 3; echo 3`,])let name = 'foo bar'await $`mkdir /tmp/${name}`
```

使用
--

安装（要求 `Node.js` 版本 >= `16.0.0`）：

```
npm i -g zx
```

建议将脚本写到 `.mjs` 的文件里，这样我们可以很方便的直接在顶层使用 `await`，然后在文件开头声明下面的 `shebang`：

```
#!/usr/bin/env zx
```

通过下面的方式运行脚本：

```
chmod +x ./script.mjs
./script.mjs
```

或者使用 zx 运行：

```
zx ./script.mjs
```

可以尝试一下：

```
const list = await $`ls -a`;console.log(list);const name = await question('你的名字是啥? ')console.log(`你的名字是：${name}`);
```

> 所有函数（`$、cd、fetch`等）都可以直接使用，无需任何导入。

它还内置了很多方便的处理函数：

*   $`command`：使用 `child_process` 的 `spawn` 来制定指定的命令，返回一个 `Promise`
    
*   `cd()`：进入其他目录。（`cd('/project')`）
    
*   `fetch()`：发起方洛请求
    
*   `question()`：读取用户输入，相当于 `readline` 的封装
    
*   `sleep()`：等待一段时间，相当于 `setTimeout` 的封装
    
*   `echo()`：大打印文本，也可以直接用 `console.log`
    

更多使用可以参考官方文档：`https://github.com/google/zx`

> 如果你想加入高质量前端交流群，或者你有任何其他事情想和我交流也可以添加我的个人微信 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf&scene=21#wechat_redirect) 。

如果你有任何想法，欢迎在留言区和我留言，如果这篇文章帮助到了你，欢迎点赞和关注。

`点赞`和`在看`是最大的支持⬇️❤️⬇️