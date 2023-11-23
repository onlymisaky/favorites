> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/69_X3PzPRQRfy0qLBGaGUQ)

前言
==

相信很多`web`前端开发的小伙伴和我一样，在想到要开发桌面端应用的时候会第一时间想到用`Electron`来开发。它可以让我们使用熟悉的`HTML`+`JS`+`CSS`来开发桌面应用。只需要一套代码，你的应用就可以轻松的运行在`Windows`，`macOS`，`Linux`三大操作系统上。

![](https://mmbiz.qpic.cn/mmbiz_png/t1ynS50Irh1vbgnqwlRbdeiawGFjk5vkTRnPNekicXyHYqMpDNqrx1xJkQUD3unQNaplnGkDu7LkyPNticdqXBYOg/640?wx_fmt=png)

但是过去开发`Electron`应用的时候想要编译出三大系统的应用程序安装包就有点麻烦了，你需要分别在三个操作系统上执行编译命令才能编译出对应系统的安装包。

> 注：macOS 旧版的系统可以利用`Wine`这个虚拟`windows`环境直接编译出`windows`系统的安装包，在 M1 芯片的 Mac 上暂时还不支持运行`Wine`。

在不知道本文的方法之前，开发的过程是很开心的，但编译的过程

1.  提前运行你的`Windows`系统虚拟机或使用`Windows`系统电脑
    
2.  使用虚拟机通过共享目录访问项目目录或重新`clone`项目
    
3.  运行`npm install`安装项目开发环境必备的依赖包
    
4.  运行编译命令
    
5.  编译时会下载对应操作系统的依赖
    
6.  复制你的编译结果去发布应用程序吧
    

让人痛苦...

_当然，1-3 只需要在对应的操作系统上设置好一次就行。不过，当你的操作系统升级导致不兼容时，麻烦就又来了。_

而上面所说的一切，都会在`Github Actions`的加持下，`几乎`完美的解决。

Github Actions
==============

`Github Actions`是`Github`推出的持续`集成`/`交付`服务。免费，最近我在很多项目中一直在`持续白嫖`它。：）

比如以下两篇文章的用法

*   《[利用 GithubAction 实现定时自动生成 B 站头图](http://mp.weixin.qq.com/s?__biz=Mzg3MTUyNzQzNg==&mid=2247485252&idx=1&sn=62423aae3c9464ff7ab54585ce33d15f&chksm=cefc6227f98beb310b6825ed628c4d59a6fa1af21347454b6c5c92c458f3e3033c887e33fb84&scene=21#wechat_redirect)》
    
*   《[利用 GithubAction 爬取 Github](http://mp.weixin.qq.com/s?__biz=Mzg3MTUyNzQzNg==&mid=2247484560&idx=1&sn=6a71b14b6283d16458115bd8f600075c&chksm=cefc61f3f98be8e5b9897372e8027ecd079aea58c619f28e1809a95c6d7ee49f4c8024f491a3&scene=21#wechat_redirect) [中国区排名](http://mp.weixin.qq.com/s?__biz=Mzg3MTUyNzQzNg==&mid=2247484560&idx=1&sn=6a71b14b6283d16458115bd8f600075c&chksm=cefc61f3f98be8e5b9897372e8027ecd079aea58c619f28e1809a95c6d7ee49f4c8024f491a3&scene=21#wechat_redirect)》
    

![](https://mmbiz.qpic.cn/mmbiz_png/t1ynS50Irh1vbgnqwlRbdeiawGFjk5vkTNCDZwMt3xD0lnfrxyTI4NRiaXpytUxx3LlcHSgsiaAAgQc9cWqacFZVg/640?wx_fmt=png)

利用`Github Actions`，我们可以建立一套工作流（`workflow`），而一套工作流可以由数个`Action`来组合。这里我做个比喻，把发布一个应用程序类比为做一道菜。  

`配菜` > `洗锅` > `开火` > `加盐` > `加酱油` > `翻炒` > `目测火候` > `出锅上菜`

> 配菜就像是写代码，他决定了我们最后上菜的内容。你甚至可以只提供`配菜`，让客人自己去炒。很多`Electron`的开源项目，提供了源码和使用说明，需要开发者自行编译出应用程序。

现在我们把`配菜`后的步骤都编辑到一个工作流当中。当我们写完代码，提交项目后，就可以运行这套工作流来自动化的完成后续的工作。

可选的操作系统环境
---------

我们可以给这套工作流指定其运行的操作系统，目前可以选择操作系统如下：

<table><thead><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); min-width: 85px;"><strong>Virtual environment</strong></th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); min-width: 85px;"><strong>YAML workflow label</strong></th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); min-width: 85px;"><strong>Notes</strong></th></tr></thead><tbody><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">Windows Server 2022</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;"><code>windows-2022</code></td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">The <code>windows-latest</code> label currently uses the Windows Server 2019 runner image.</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">Windows Server 2019</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;"><code>windows-latest</code> or <code>windows-2019</code></td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;"><br></td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">Windows Server 2016[deprecated]</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;"><code>windows-2016</code></td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">Migrate to Windows 2019 or Windows 2022. For more information, see the blog post.</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">Ubuntu 20.04</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;"><code>ubuntu-latest</code> or <code>ubuntu-20.04</code></td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;"><br></td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">Ubuntu 18.04</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;"><code>ubuntu-18.04</code></td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;"><br></td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">macOS Big Sur 11</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;"><code>macos-latest</code> or <code>macos-11</code></td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">The <code>macos-latest</code> label currently uses the macOS 11 runner image.</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">macOS Catalina 10.15</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;"><code>macos-10.15</code></td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;"><br></td></tr></tbody></table>

实战演练
====

当我们需要使用`Github Actions`的时候，我们需要在自己的 git 仓库中新建如下路径

> .github/workflows / 工作流名称. yml

下面，我们来解读（`请看注释`）一个帮我们完成 Electron 项目编译的工作流来看看它是如何工作的

```
# 此工作流的名字name: Build # 工作流的执行时机，可以设定为定时执行，每次push后执行，手动执行等on:  # workflow_dispatch为在Github仓库的Actions面板中手动执行  workflow_dispatch:# 工作/任务，这里的工作是可以并行的。jobs:  # 工作的名称“编译windows版”  buildwin:    # 运行的操作系统 windows server 2022    runs-on: windows-2022    # 步骤    steps:    # 使用预制action：拉取最新的代码    - uses: actions/checkout@v2    # 步骤一的名称：    - name: Install and Build      # 该步骤运行的终端命令，进入仓库的src目录，安装依赖，运行编译命令      run:        cd src && npm install && npm run buildwin    # 步骤二的名称：将编译后的结果上传    - name: Upload File      # 使用预制action：上传文件，可以将执行路径打包成zip上传      uses: actions/upload-artifact@v2      with:        # 上传后文件的名称        name: windows        # 打包的路径以及文件过滤，此为仅打包dist目录下的exe文件        path: dist/*exe  # 工作的名称“编译macOS版”  buildmac:    # 运行的操作系统 macOS BigSur    runs-on: macos-11    # 步骤    steps:    # 使用预制action：拉取最新的代码    - uses: actions/checkout@v2    # 步骤一的名称：    - name: Install and Build      # 该步骤运行的终端命令，进入仓库的src目录，安装依赖，运行编译命令      run:        cd src && npm install && npm run buildmac    # 步骤二的名称：将编译后的结果上传    - name: Upload File      # 使用预制action：上传文件，可以将执行路径打包成zip上传      uses: actions/upload-artifact@v2      with:        # 上传后文件的名称        name: mac        # 打包的路径以及文件过滤，此为仅打包dist目录下的dmg文件        path: dist/*dmg
```

> 关于使用`Github Actions`来执行定时任务工作流的玩法可以看这一篇

注释都仔细看了吗？OK，当`github`仓库中具备`.github/workflows/工作流名称.yml`的时候，打开`Github`仓库的`Actions`面板就可以看到可执行的工作流了。

![](https://mmbiz.qpic.cn/mmbiz_png/t1ynS50Irh1vbgnqwlRbdeiawGFjk5vkTVe7vYgYCH4PeibJ7XTfK46DTrbAkiafYxtguHsUFmatgWrPGlTbmrAAA/640?wx_fmt=png)

点击`Build`，再点击`Run workflow`就可以运行这个工作流了

![](https://mmbiz.qpic.cn/mmbiz_png/t1ynS50Irh1vbgnqwlRbdeiawGFjk5vkT3csmkArK4amBqyba7TsyfpsK3kB7UGp2EQU8ib69aXwpT7p2B7LsMWQ/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/t1ynS50Irh1vbgnqwlRbdeiawGFjk5vkTgQvRJ1luccnVTWLMGBibafD5HIsYlcZzhxGGksPv8uBKgmkLUNXia2icQ/640?wx_fmt=png)

看看，我们多个`Job`在同时进行！

另外这个列表可以查看工作流的执行时间，以及是否执行成功。点击列表项还可以查看详细的执行日志

![](https://mmbiz.qpic.cn/mmbiz_png/t1ynS50Irh1vbgnqwlRbdeiawGFjk5vkTFQibppZTCrjh0I0Ad0Licp7SMrUPlKu97UGFDdoIUkUMdFsUqrXAibT3w/640?wx_fmt=png)

比如我们来看看最后这个失败的`Build`，到底在哪一步报错了呢？

![](https://mmbiz.qpic.cn/mmbiz_png/t1ynS50Irh1vbgnqwlRbdeiawGFjk5vkTff7jgwQgRzqGgHBQYvHcBRAT40VnLhKRiaHDEMAKiaplqKJmjJVWicFfw/640?wx_fmt=png)

> 这是由于我在开发过程中命令设置有误导致的错误，并不会出现时而正确时而错误的情况。

一目了然对不对！我们再来看看成功的日志

![](https://mmbiz.qpic.cn/mmbiz_png/t1ynS50Irh1vbgnqwlRbdeiawGFjk5vkT6sXaqW2IatWpEMPKdSjknmYcqXicLbqo7ibleAb50YB2E9dnpapSAlzg/640?wx_fmt=png)

成功后，我们已经自动将编译后的结果上传，点击即可下载。

结语
==

`Github Actions`真的太方便了，一键编译三个操作系统的安装包，这是我打包`electron`应用程序从未有过的舒服和惬意。

* * *

情人节马上到了，我用 Electron 开发了一个名为心有灵犀的小软件，已开源。

它的基本功能是这样的，当双方都安装了这个软件，那么在各自的桌面上都会显示一颗红心。当你点击它的时候，双方的小红心都会跳动一下。代表你此刻正在想念对方。而对方在收到心跳的同时，也回应你一个点击，就会产生一次心有灵犀的瞬间。代表你们同时在想对方！

项目地址：https://github.com/ezshine/tinytoy-heartconnect