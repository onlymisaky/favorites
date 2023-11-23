> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/AWnHNrmEx29fEX5kmKdNXQ)

点击上方 “魔术师卡颂”，选择 “设为星标”  

专注 React，学不会你顺着网线来找我！

在拿到一个项目之后，如何看入口文件，如何运行项目，我们都会找到 package.json 中的 script 。甚至在做项目做久之后，我们会自己写一些脚本来给开发提效，但你知道 NPM 脚本能做什么吗？你知道如何传递一个参数给脚本？你知道如何执行某个脚本文件么？在这篇文章中，我将分享我如何充分利用 NPM 脚本。  

介绍
--

NPM 脚本是 package.json 中定义的一组内置脚本和自定义脚本。他们的目标是提供一种简单的方法来执行重复的任务，比如：

*   启动项目
    
*   打包项目
    
*   执行单元测试，生成测试报告之类
    
*   ……
    

那如何定义一个 NPM 脚本？需要做的就是设置它的名称，并在 package.json 文件的 script 属性中编写该脚本, 如下：

```
"scripts": {    "test": "echo \"Error: no test specified\" && exit 1"}
```

**值得注意的是，NPM 中所有依赖的 node_modules bin 都可以在脚本中直接访问，就像在路径中被引用的一样**。比如：

```
{    "scripts": {        "lint": "./node_modules/.bin/eslint .",    }}// 此写法与上面效果相同{    "scripts": {        "lint": "eslint ."    }}
```

命令
--

现在我们可以在终端中执行 npm run test 执行对应的 script 脚本, 如下：

```
➜  xxx npm run test> xx@1.0.0 test /Users/beidan/Desktop/xxx> echo "Error: no test specified" && exit 1Error: no test specifiednpm ERR! code ELIFECYCLEnpm ERR! errno 1npm ERR! xx@1.0.0 test: `echo "Error: no test specified" && exit 1`npm ERR! Exit status 1npm ERR!npm ERR! Failed at the xx@1.0.0 test script.npm ERR! This is probably not a problem with npm. There is likely additional logging output above.npm WARN Local package.json exists, but node_modules missing, did you mean to install?npm ERR! A complete log of this run can be found in:npm ERR!     /Users/beidan/.npm/_logs/2021-02-19T06_40_42_472Z-debug.log
```

如果直接在终端中执行 npm test， 也是可以得到一样的结果

```
➜  xxx npm test> xx@1.0.0 test /Users/beidan/Desktop/xxx> echo "Error: no test specified" && exit 1Error: no test specifiednpm ERR! code ELIFECYCLEnpm ERR! errno 1npm ERR! xx@1.0.0 test: `echo "Error: no test specified" && exit 1`npm ERR! Exit status 1npm ERR!npm ERR! Failed at the xx@1.0.0 test script.npm ERR! This is probably not a problem with npm. There is likely additional logging output above.npm WARN Local package.json exists, but node_modules missing, did you mean to install?npm ERR! A complete log of this run can be found in:npm ERR!     /Users/beidan/.npm/_logs/2021-02-19T06_40_42_472Z-debug.log
```

这是因为，有些脚本是内置可以使用更短的命令来执行，更容易记住。例如，下面所有的命令的效果都是一样的：

```
npm run-script test
npm run test
npm test
npm t
```

同理， npm start 也是一样

```
npm run-script start
npm run start
npm start
```

执行多个脚本
------

我们可能想结合一些脚本并一起运行它们。为此，我们可以使用 && 或 ＆

*   要**依次**运行多个脚本，可以使用 && ，例如：
    

```
npm run lint && npm test
```

*   要**并行**运行多个脚本，可以使用＆ 例如：
    

```
npm run lint＆npm test
```

> 注意：这仅适用于 Unix 环境。在 Windows 中，它将按顺序运行。

因此，我们在实际项目中可以创建一个结合了两个脚本的脚本, 以此来简化我们的操作，如下所示：

```
{    "scripts": {        "lint": "eslint .",        "test": "echo \"Error: no test specified\" && exit 1",        "ci": "npm run lint && npm test"  // 此时 npm run ci 即会依次执行 npm run lint ， npm run test    }}
```

pre & post
----------

我们可以为任何脚本创建 “pre” 和 “post” 脚本，NPM 会自动按顺序运行它们。唯一的要求是脚本的名称 (后跟“pre” 或“post”前缀)与主脚本匹配。例如：

```
{    "scripts": {        "prehello": "echo \"--Pre \"",        "hello": "echo \"Hello World\"",        "posthello": "echo \"--post\""    }}
```

如果我们执行 npm run hello, npm 会按以下顺序执行脚本: prehello, hello, posthello。输出如下：

```
➜  xxx npm run hello> xx@1.0.0 prehello /Users/beidan/Desktop/xxx> echo "--Pre "--Pre> xx@1.0.0 hello /Users/beidan/Desktop/xxx> echo "Hello World"Hello World> xx@1.0.0 posthello /Users/beidan/Desktop/xxx> echo "--post"--post
```

错误
--

当脚本以非 0 退出码结束时，这意味着在运行脚本的时候发生了错误，并终止了执行。比如：

```
"scripts": {    "test": "echo \"Error: no test specified\" && exit 1"}
```

那么在脚本抛出错误时，我们会得到一些其他的细节，比如错误号 error 和代码，具体的错误日志路径都可以在终端获取到，如下：

```
➜  xxx npm run test> xx@1.0.0 test /Users/beidan/Desktop/xxx> echo "Error: no test specified" && exit 1Error: no test specifiednpm ERR! code ELIFECYCLEnpm ERR! errno 1npm ERR! xx@1.0.0 test: `echo "Error: no test specified" && exit 1`npm ERR! Exit status 1npm ERR!npm ERR! Failed at the xx@1.0.0 test script.npm ERR! This is probably not a problem with npm. There is likely additional logging output above.npm WARN Local package.json exists, but node_modules missing, did you mean to install?npm ERR! A complete log of this run can be found in:npm ERR!     /Users/beidan/.npm/_logs/2021-02-19T06_48_18_141Z-debug.log
```

### 静默消息

如果想减少错误日志并非防止脚本抛出错误， 可以使用下面的命令来 “静默” 处理, （比如在 ci 中，即使测试命令失败，也希望整个管道继续运行，就可以使用这个命令）

```
npm run <script> --silent// 或者npm run <script> -s
```

> 如果脚本名不存在时不想报错，可以使用 --if-present ，比如：`npm run <script> --if-present`

### 日志等级

我们可以使用 --silent 减少日志，但是如何获得更详细的日志呢？还是介于两者之间？

有不同的日志级别：

```
"silent", "error", "warn", "notice", "http", "timing", "info", "verbose", "silly".
```

默认值为 “notice”。日志级别确定哪些日志将显示在输出中。将显示比当前定义更高级别的任何日志。

我们可以使用 --loglevel 明确定义要在运行命令时使用的日志级别。

现在，如果我们想获取更详细的日志，则需要使用比默认级别更高的级别（“notice”）。例如：

```
--loglevel <info>
```

我们还可以使用一些简短的版本来简化命令：

```
-s, --silent, --loglevel silent
-q, --quiet, --loglevel warn
-d, --loglevel info
-dd, --verbose, --loglevel verbose
-ddd, --loglevel silly
```

因此，要获得最高级别的详细信息，我们可以使用下面的命令

```
npm run <script> -ddd 
// 或
npm run <script> --loglevel silly 
```

从文件中引用路径
--------

如果脚本很复杂的话，在 package.json 中维护明显会越来越冗长，也越来越难维护，因此复杂的脚本我们一般会写在文件中，在 从文件中执行脚本。如下：

```
{    "scripts": {        "hello:js": "node scripts/helloworld.js",        "hello:bash": "bash scripts/helloworld.sh",        "hello:cmd": "cd scripts && helloworld.cmd"    }}
```

我们使用 node <path.js> 来执行 JS 文件，使用 bash <path.sh> 来执行 bash 文件

> 值得注意的是，如果是 cmd 或 bat 文件， 则需要先 cd 导航到对应的文件夹目录，不能像 sh， js 文件一样，直接执行，否则会报错。

访问环境变量
------

在执行 NPM 脚本时，NPM 提供了一组我们可以使用的环境变量。我们可以使用

```
npm_config_<val> 或者 npm_package_<val> 
```

例如：

```
{    "scripts": {        "config:loglevel": "echo \"Loglevel: $npm_config_loglevel\"",    }}
```

终端输出如下：

```
➜  xxx npm run config:loglevel> xx@1.0.0 config:loglevel /Users/beidan/Desktop/xxx> echo "Loglevel: $npm_config_loglevel"Loglevel: notice
```

配置参数使用 npm_config_前缀放入环境中。这里有一些例子：

我们可以使用下面的命令获取 config

```
npm config ls -l
```

### 传递参数

在某些情况下，您可能需要向脚本传递一些参数。您可以使用命令末尾的 -- 来实现这一点。添加到脚本中的任何 -- 都会被转换成一个带有 npm 配置前缀的环境变量。例如：

```
npm run <script>---<argument>="value"
```

例子：

```
{    "scripts": {        "ttt": "echo \"ttt $npm_config_firstname!\""    }}
```

```
➜  xxx npm run ttt --firstname=234 // 传入> xx@1.0.0 ttt /Users/beidan/Desktop/xxx> echo "ttt $npm_config_firstname!"ttt 234! //输出的值
```

命名规则
----

### 前缀

有些开源项目我们可以看到，他的 script 脚本是带有前缀的， 这也是一个好的命名规则， 通过：dev， ：prod 来区分环境， 如下：

```
{    "scripts": {        "build:dev": "...", // 开发环境        "build:prod": "..." // 生产环境    }}
```

```


送你一本源码学习指南

加入专业React进阶群




```