> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/6cWKNy1YWOtmMZ5P1760Kg)

前言
--

`husky`想必大家都不陌生。作为前端工程化中一个不可或缺的的工具，它可以向我们的项目中添加`git hooks`。同时配合`lint-staged`可以方便的在代码提交前进行`lint`。

最近要对一个老项目添加`commit-msg`校验，同时要在`commit`前进行`eslint`校验。之前我也写过一篇类似的文章[你可能已经忽略的 git commit 规范](https://mp.weixin.qq.com/s?__biz=Mzg3MTU4NTI3OA==&mid=2247488446&idx=1&sn=eb0d3207cfb8c17991d09be694bd7b5e&scene=21#wechat_redirect)，就直接上手了。

大致流程就是先安装依赖：

```
npm i husky -D<br style="visibility: visible;">
```

然后在`package.json`配置：

```
{  "husky": {    "hooks": {      "pre-commit": "npm run test", // 在commit之前先执行npm run test命令      "commit-msg": "commitlint -e $HUSKY_GIT_PARAMS" // 校验commit时添加的备注信息是否符合我们要求的规范    }  }}
```

然后测试了一下`commit`操作，好家伙，直接`commit`成功了。根本没有对`commit-msg`做校验。

我就纳闷了，之前不都是这样搞的吗 🤔

没办法，去查一下文档吧。

然后就看到了这个：![](https://mmbiz.qpic.cn/mmbiz_png/DByMFBAKmy7G8SCCc6dYDwnuxYeibXLGIoStwSfqp6TykOHJRCpFNOSfA5zibs84vzm82ictlaNT1kcQ2WBMa5VeQ/640?wx_fmt=png)原来在 husky(6.0.0) 版本做了`Breaking change`。再看下项目中安装的版本号：`"husky": "^7.0.1"`。难怪不生效了，，

之前写[你可能已经忽略的 git commit 规范](https://mp.weixin.qq.com/s?__biz=Mzg3MTU4NTI3OA==&mid=2247488446&idx=1&sn=eb0d3207cfb8c17991d09be694bd7b5e&scene=21#wechat_redirect)文章时，用的还是`1.0.1`的版本。😏

既然这样，我们先来看下作者为什么要做这样的改动吧：![](https://mmbiz.qpic.cn/mmbiz_png/DByMFBAKmy7G8SCCc6dYDwnuxYeibXLGIHbZpicvlru5ClaNgOl61lTDAnITr6PqQXfFHF0duic9H6q6nVcPW7H0A/640?wx_fmt=png)

这是作者写的一篇 Why husky has dropped conventional JS config[1]，也就是`为什么 husky 放弃了传统的 JS 配置`。下面简单概括一下。

为什么 husky 放弃了传统的 JS 配置
----------------------

在 `v4` 版本之前 `husky`的工作方式是这样的：为了能够让用户设置任何类型的`git hooks`，`husky`不得不创建所有类型的`git hooks`

这样做的好处就是无论用户设置什么类型的`git hook`，`husky`都能确保其正常运行。但是缺点也是显而易见的，即使用户没有设置任何`git hook`，`husky`也向`git`中添加了所有类型的`git hook`。

在当时 `husky` 有过这样的设想：有没有可能让`husky`只添加我们需要的`git hook`呢？作者尝试过解决这个问题，但是失败了。

因为`husky`需要在两个地方进行配置才能完成一个完整的`git hook`功能。一个是在`package.json`中配置`git hook`所要执行的真正命令，一个是在`.git/hooks/`中配置相对应的`git hook`。也就是说无论是添加还是删除`git hook`就要保证在这两个地方同步执行对应的操作。作者无法找到一个可靠的方法来同步这两个地方的配置，因此失败了。

新版 husky 的工作原理又是什么呢？
--------------------

直到 2016 年，`Git 2.9`引进了`core.hooksPath`，可以设置`Git hooks`脚本的目录，这个引进也就是新版`husky`改进的基础：

*   可以使用`husky install`将`git hooks`的目录指定为`.husky/`
    
*   使用`husky add`命令向`.husky/`中添加`hook`
    

通过这种方式我们就可以只添加我们需要的`git hook`，而且所有的脚本都保存在了一个地方（.husky / 目录下）因此也就不存在同步文件的问题了。

ok，了解了这么多，我想你也大概理解作者为什么要做这种破坏性更新的原因了吧。那么我们接着上面的按照新版`husky`的配置规则对我们的项目进行配置。

新版 husky 实践
-----------

我们可以直接按照官方文档的指引来进行。

### 安装

#### Install husky

```
npm install husky --save-dev
```

#### Enable Git hooks

```
npx husky install
```

如果想安装后自动启用`hooks`，可以执行：

```
npm set-script prepare "husky install"
```

这样就会在`package.json`里面添加一条脚本：

```
// package.json{  "scripts": {    "prepare": "husky install"  }}
```

> `prepare` 是 `NPM` 操作生命周期中的一环，在执行 `install` 的时候会按生命周期顺序执行相应钩子：NPM7：`preinstall -> install -> postinstall -> prepublish -> preprepare -> prepare -> postprepare`

这样就会在代码根目录生成如下所示的结构：![](https://mmbiz.qpic.cn/mmbiz_png/DByMFBAKmy7G8SCCc6dYDwnuxYeibXLGIJK0bcHTfVvvSBjysJUZH5UCicyJkGUUibth7jp2gdr4LSvw4NTjMSkCg/640?wx_fmt=png)

### 添加 hook

我们可以使用`husky add <file> [cmd]`指令来添加一条`hook`。

#### commit-msg

在项目中我们会使用`commit-msg`这个`git hook`来校验我们`commit`时添加的备注信息是否符合规范。在以前我们通常是这样配置的：

```
{  "husky": {    "hooks": {      "commit-msg": "commitlint -e $HUSKY_GIT_PARAMS" // 校验commit时添加的备注信息是否符合我们要求的规范    }  }}
```

在新版`husky`中`$HUSKY_GIT_PARAMS`这个变量不再使用了，取而代之的是`$1`。所以我们要做如下操作：

执行`npx husky add .husky/commit-msg 'npx --no-install commitlint --edit "$1"'`会在`.husky`下生成一个`commit-msg`的`shell`文件：

```
#!/bin/sh. "$(dirname "$0")/_/husky.sh"echo "========= 执行commit-msg校验 ======="npx --no-install commitlint --edit $1
```

此时如果执行`git commit`操作，会有如下报错：![](https://mmbiz.qpic.cn/mmbiz_png/DByMFBAKmy7G8SCCc6dYDwnuxYeibXLGIMAKDj8J4too7OGPo1XDz17fqBa5yjOIqutLoia7na7IQA4KHoh1NTag/640?wx_fmt=png)提示我们缺少`commitlint.config.js`文件，这里先安装依赖：

```
npm install --save-dev @commitlint/cli @commitlint/config-conventional
```

然后在根目录新建一个`commitlint.config.js`文件并加入如下内容：

```
module.exports = {  extends: ["@commitlint/config-conventional"]};
```

这时再执行`commit`就会发现已经生效了：![](https://mmbiz.qpic.cn/mmbiz_png/DByMFBAKmy7G8SCCc6dYDwnuxYeibXLGIvhgCsdnDpD21W9icwwlic5rmgV2noGUSjJ2vibgEkt7w8tibEmkgIweY7g/640?wx_fmt=png)

#### pre-commit

在`commit`前，我们可以执行测试用例、eslint 校验等，只有这些通过了，才允许提交。这也就是在`pre-commit`这个钩子里需要做的事情。

执行`npx husky add .husky/pre-commit "npm run test:unit"`就会在`.husky`下生成一个`pre-commit`的 shell 文件：

```
#!/bin/sh. "$(dirname "$0")/_/husky.sh"echo "========= 执行pre-commit操作（如执行测试用例、eslint校验等，可自行添加） ======="npm run test:unit
```

让我们再做一次`commit`操作：![](https://mmbiz.qpic.cn/mmbiz_png/DByMFBAKmy7G8SCCc6dYDwnuxYeibXLGIcgyPyeBiabE6kKUdhQ1surkU7aapEG0Wsp8OQ2TM4x0NAbYGicoI3aNA/640?wx_fmt=png)

至此，我们就基于新版`husky`，完成了项目中`commit-msg`、`pre-commit`两个钩子的添加。

### 参考资料

[1]

Why husky has dropped conventional JS config: _https://blog.typicode.com/husky-git-hooks-javascript-config/_