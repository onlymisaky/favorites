> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/DAF1V80bJaV4glM0xOPPog)

前言
==

前端同学大概都熟悉 husky 这个工具，他可以直接在项目中添加 git hooks，主要解决了 git hooks 不会同步到 git 仓库的问题，保证了每个开发人员的本地仓库都能执行相同的 git hooks。

但是 husky 毕竟是一个 JS 生态的工具，依赖于 npm 安装和 npm 的 script hook 才能达到最佳效果，放到后端项目中，初始化一堆 npm 配置文件，还需要开发人员手动安装，多多少少会显得不太合适。

恰巧我们项目一直被一个提交问题所困扰，所以我前段时间给项目写过一个命令行工具，用于初始化 git hook, 将编写 Git Hook 这个过程整理一下。

Git Hook
========

本文不对 git hook 类型做过多介绍，主要是针对编写 `commit-msg` hook 作为演示展开，`commit-msg` 接收一个**「存有当前提交信息的临时文件的路径」**的参数，我们可以读取这个文件获取用户提交信息， 如果该 hook 脚本以非零值退出时 Git 将放弃提交，因此，我们可以用来在提交通过前验证项目状态和提交信息。

Git Hook 示例
-----------

通常情况下，在当前项目的 `<project root>/.git` 目录下会有一个 `hooks` 目录，里面会有官方提供的各个 hook 的示例，如果没有的话也不用担心，新建一个 `hooks` 目录即可。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/qHBdbZiaNS2UKibzDnw99Cr69Act72W9PugowguV1BLH5UKibJfq4gjtTdhnw2mRj7TLKyHmXbewcwTu5Sp123MfA/640?wx_fmt=png)

示例代码会有一个 `.sample` 后缀，去掉后缀后，hook 文件就生效了，提供的示例大部分都是 `shell` 编写的，我们在这里看一下示例中的 `commit-msg`

![](https://mmbiz.qpic.cn/sz_mmbiz_png/qHBdbZiaNS2UKibzDnw99Cr69Act72W9Pu4qAQatl739QWyGY0W2nibcibZUjmvpFD3UicO6A8e2VL285UzmgSfDNCg/640?wx_fmt=png)

这个示例脚本的功能是检查文件中是否存在重复的 `Signed-off-by` 行，下面对出现的命令做逐一解释：

1.  `grep '^Signed-off-by: ' "$1"`: 使用 grep 命令在文件中查找以`Signed-off-by:` 开头的行。
    
2.  `sort`: 使用 sort 命令对查找结果进行排序。
    
3.  `uniq -c`: 使用 uniq 命令计算排序后的行的数量，并将结果按数量进行排序。
    
4.  `sed -e '/^[ ]*1[ ]/d'`: 使用 sed 命令删除数量为 1 的行，即只保留数量大于 1 的行。
    
5.  `"$(...)"`: 将命令的执行结果赋值给变量 test。
    
6.  `|| { echo >&2Duplicate Signed-off-by lines.; exit 1; }`: 如果 test 变量为空（表示没有重复的 Signed-off-by 行），则执行后面的代码块；否则，输出错误信息并退出脚本。
    

编写 Git Hook
-----------

提供的示例脚本比较复杂，理解起来多少有些困难，我们先使用 shell 脚本编写一个简单的示例。这个脚本的功能是检查 commit-msg 中是否在开头添加 issue id。

```
#!/usr/bin/env shissueId=$(cat $1 | sed -n 's/^\(#[0-9]*\) .*/\1/p')if [ ! $issueId ]then    echo "commit msg 必须开头添加 issue id"    exit 1fi
```

在上面这块代码中，参数 `$1` 是存有当前提交信息的临时文件的路径，我们通过 `cat $1` 读取到文件中的提交信息，然后通过 `sed` 去正则匹配信息中是否存在 issue id, 当没有 issueId 时，通过 `exit 1` 退出脚本。

*   下图是一个校验未通过的拦截示例![](https://mmbiz.qpic.cn/sz_mmbiz_png/qHBdbZiaNS2UKibzDnw99Cr69Act72W9Pu0bqg8OHchz6NvFu8r9NrCEFw1rt9hVyVVTEghlgKtA8AGsNcJ8vmqg/640?wx_fmt=png)
    
*   下图是一个成功提交的示例。![](https://mmbiz.qpic.cn/sz_mmbiz_png/qHBdbZiaNS2UKibzDnw99Cr69Act72W9Puyq1kgYJlnIdRzia9jcwGUibhoMMIiaZ6GYKZw3wyNtKvU67OhsMMByQLw/640?wx_fmt=png)
    

我们用了几行代码就实现了一个小功能，所以说编写 git hook 并不是一件复杂的事，但是对于大多数开发者而言，对于 shell 可能仅仅停留在了编写简单命令的阶段，开发起来肯定不如自己擅长的语言随心所欲，再加上一些命令可能还受限于宿主机的环境问题等等，所以我们接下来直接使用自己擅长的语言编写 git hook。

使用 NodeJS 编写 GitHook
--------------------

git hook 允许你使用任何你熟悉的脚本语言，比如 perl、python、node 等等, 我们只需要在文件头部加入声明即可。

```
#!/usr/bin/env node
```

如上所示，这是一个 node 脚本的文件头，我们现在重新将使用 shell 编写的 检查 commit-msg 中是否在开头添加 issue id 的功能，使用 node 脚本实现一遍。

```
#! /usr/bin/env nodeconst fs = require('fs')const [_, __, msgFilePath] = process.argvconst msg = fs.readFileSync(msgFilePath, { encoding: 'utf8' })const checkIssueId = /^#\d+\s+.*/.test(msg)if(!checkIssueId) {    console.log("commit msg 必须在开头添加 issue id")    process.exit(1)}
```

我们通过 `process.argv` 获取到调用脚本时传入的参数，在通过 nodeJS 的 `fs.readFileSync` 方法读取到文件中的提交信息，这时就可以按照自己的需求去完善功能了，当不符合规则时，我们通过调用 `process.exit(1)` 结束调用进程，注意参数 `1` 可以是除 `0` 以外的任何**「数值」**，因为 git 会判断是否以非零值结束。

还能做些什么？
-------

文中提供的示例仅仅是简单校验了一下提交信息，但实际上还可以做更多的事情，比如说直接在脚本中调用 github、gitee、gitlab... 平台的 API 获取项目的 issue ID 列表，从而达到校验 issue id 是否存在的问题，再或者我们可以在 hook 中统一在提交信息尾部添加 某些信息（用户、提交文件数） 等等。

编译型语言示例
=======

脚本语言可以直接在文件头声明即可，编译型语言是没办法这么做的，这里提供一个通用的处理方法，适用于任何语言。

基本所有语言都是支持命令调用的，比如 `node xxx.js`, `python xxx.py`, `java xxxxx.class`， 既然这样，我们可以直接在 shell 中调用相应的命令即可。

shell
-----

下面以调用 java 作为示例， 我们先调用 `javac` 将源代码编译为 class 文件，在通过 `$()` 获取 java 调用的结果，因为通过 shell 获取文件内容更方便，所以我们可以直接在 shell 中调用 `cat` 命令获取提交信息，最终，我们只要根据调用的代码有没有返回异常信息作为判断依据即可。

```
#! /usr/bin/env shmsg="$(cat $1)"cd $(pwd)/.git/hooksjavac HookExample.javacheckMsg="$(java HookExample "$msg")"err="$(echo $checkMsg | grep "fail: ")"if [ "$err" != "" ]then echo $err exit 1fi
```

这里为了简单，我直接在脚本中临时编译 java 文件为 `.class` 文件，再调用 `.class`，这样其实很不合适，实际运用时，我们可以直接调用打包后的 jar 包，可以免去很多麻烦。

java
----

下面这段代码，我们写了一个 `main` 方法，直接拿到了提交信息进行检测，当不符合标准时控制台输出错误信息，我们可以统一一个错误信息的标识开头，比如当前示例的 `fail:` ，这样我们在 shell 中检查日志输出时可以过滤掉非异常的输出。

```
import java.util.regex.Pattern;    class HookExample {      public static void main(String[] args) {          String commitMsg = args[0];          boolean checkIssueId = Pattern.matches("^#\\d+\\s+.*", commitMsg);          if(!checkIssueId) {              System.out.println("fail: commit msg 必须在开头添加 issue id");          }      }  }
```

结语
==

虽然这是一篇编写自定义 Git Hook 的教程，但实际讲的仍然是编写脚本的问题，除了用于编写 git hook, 我们平日里还可以通过编写脚本的方式来代替无意义、重复的工作，例如创建模板代码、数据处理、文件管理、生成 mock 数据、定时执行任务等等，再或者我们可以在脚本中发起请求，直接通过命令方式获取某些数据进一步处理等等。

通过编写脚本解决日常重复性工作可以提高效率和减少人为错误，当遇到一些重复性高、繁琐的工作任务时，编写脚本来处理这些任务可以节省时间和精力。

此外，脚本还可以提高工作的准确性和一致性，由于脚本是按照预先定义的规则和流程执行的，因此可以避免人为操作带来的错误和不一致性。这对于需要高度精确和一致性的工作任务尤为重要。

当然了，通过编写脚本实现工具代替某些工作有时也会适得其反，比如某些工作明明人工操作可能仅需要一两个小时，但编写脚本可能要花半天时间，再加上可能存在 bug, 这时工具的作用未必理想，所以谨记编写脚本的目的是为了提高效率而不是为了制造麻烦。