> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/EZc4U-pqBlDWomSdVn0prQ)

前言
--

Window 和 macOS 系统的差异还是很大的，我从 Thinkpad 转用 M1 的 Macbook pro 已经一年了，几乎没有任何不适应，整体感受那是真的牛👃，速度和续航惊艳到我了，同时开启 6 个 vscode 加几十个浏览器标签、postman、mysql、以及各种办公软件的情况下还是非常流畅，这还是 16g 内存版本，若是 32g 内存估计会更强；

不过也有一些小问题如电池耗损有点快，刚满一年电池健康掉到 82 了，还好买了 appleCare+, 3 年内掉到 80 可以去换电池和键盘，倒也不算啥问题了；

还有就是 硬盘 swap 写入过多的问题，我的这篇文章有详细提到，昨晚，我体会了没有 pnpm 的痛。

![](https://mmbiz.qpic.cn/mmbiz_png/ykPlG9lRR7yiaPvuVwdWaI9dLrEkMQT5s08l2ibiarkRKzy2woZzNqIt4IAeLybNQzePPjrX06tTrKEsiayWibFOfNQ/640?wx_fmt=png)

正文
--

这一年的使用期间我记录了遇到的困惑和最后的解决方案，顺便整理分享给大家，若你是一名刚切换到 macOS 阵营的程序员，那么这篇文章肯定会对你有帮助。

### 关于 /usr/local 目录

macOS 和 Linux 系统比较接近，其软件安装目录是也是有讲究的，理解这一点，对系统管理是很有帮助的：

1.  /usr：系统级的目录，可以理解为 C:/Windows/，/usr/lib 理解为 C:/Windows/System32。
    
2.  /usr/local：用户级的程序目录，可以理解为 C:/Progrem Files/。用户自己编译的软件默认会安装到这个目录下。
    
3.  /opt：用户级的程序目录，可以理解为 D:/Software，opt 有可选的意思，这里可以用于放置第三方大型软件（或游戏），当你不需要时，直接 rm -rf 掉即可。在硬盘容量不够时，也可将 / opt 单独挂载到其他磁盘上使用。
    

### 打开 /usr/local 所在目录的方法

1.  macOS 系统的 /usr/local 目录默认在 Finder 下是隐藏的，如果需要到 /usr/local，可以打开 Finder，然后使用 command + shift + G，在弹出的目录中填写 /usr/local 就可以了，也可以在 Finder 上右键点击前往文件夹（相当于 command + shift + G）。
    

![](https://mmbiz.qpic.cn/mmbiz_png/ykPlG9lRR7yiaPvuVwdWaI9dLrEkMQT5skzMatjQ5ickZOdmMkEkruUo7lvz0QXtB5d6s7kWiasicy1KPiaMWm8m5bQ/640?wx_fmt=png)

2.  还有一种查看方式就是在命令行（终端）中：`cd /usr/local` 然后再使用 ls 就可以查看下面安装的东西了。
    

![](https://mmbiz.qpic.cn/mmbiz_png/ykPlG9lRR7yiaPvuVwdWaI9dLrEkMQT5sgQEXTickzYNZDt8kgWv6yk95ys4U3uQXZum0d988Dk0Knf06micI8raQ/640?wx_fmt=png)

通过手动安装的软件一般默认都会放在 /usr/local 里面，可以通过全局访问。

![](https://mmbiz.qpic.cn/mmbiz_png/ykPlG9lRR7yiaPvuVwdWaI9dLrEkMQT5skJdMibTicv22JR4YeiaZclicKxYkqrFQBOWQfNyGh3Aicxj55WNS7ibfYqbg/640?wx_fmt=png)

![](https://mmbiz.qpic.cn/mmbiz_png/ykPlG9lRR7yiaPvuVwdWaI9dLrEkMQT5sgjPJQlEiaRibZqiceSQic8BO81wze3qaD00tb2NrvXMnPBy0ibibjLJwOZlA/640?wx_fmt=png)

### macOS 下配置环境变量

macOS 的环境变量一般配置在 .bash_profile 或者 .zshrc 文件里，所以只要将下载的安装包路径写入 .bash_profile 或者 .zshrc 并完成保存就好了。

### macOS 下 .bash_profile 和 .zshrc 两者之间的区别

.bash_profile 中修改环境变量只对当前窗口有效，当关闭窗口后再使用可能会报 `zsh: command not found: XXX`; 而且需要 `source ~/.bash_profile` 才能使用;

.zshrc 则相当于 windows 的开机启动的环境变量, 永久有效。

所以建议尽量只使用 .zshrc，然后加一行 `source .bash_profile` 以兼容不小心加入 .bash_profile 文件的变量。

### 编辑 .bash_profile 文件

1.  打开终端
    
2.  vi ~/.bash_profile 或者 open ~/.bash_profile 打开文件
    
3.  修改后 通过 :wq 保存
    
4.  source ~/.bash_profile 生效
    

![](https://mmbiz.qpic.cn/mmbiz_png/ykPlG9lRR7yiaPvuVwdWaI9dLrEkMQT5sB9nnRDPLZppqiaB8Tcicxpa7kh0ZZh0ickZ3oQGiaHrGG7LdaQm0V8IKjQ/640?wx_fmt=png)

### 编辑 .zshrc 文件

只有当在 Mac OS 上使用 zsh shell 时，才会获得 ~/.zshrc 文件，如果你不确定自己使用的是哪个 shell，请打开终端并发出以下命令：

```
echo $SHELL
```

若结果显示为 /bin/zsh， 说明你在 macOS 上使用的是 zsh shell

1.  open ~/.zshrc 或者 vim ~/.zshrc
    
2.  在打开的 .zshrc 文件窗口中进行更改
    
3.  通过 :wq 保存
    
4.  source ~/.zshrc
    

### Homebrew 环境的安装

Homebrew 是一个包管理器，用来在 macOS 安装 Linux 工具包，终端里执行下面指令，按照提示一步步安装就好了

```
安装指令：/bin/zsh -c "$(curl -fsSL https://gitee.com/cunkai/HomebrewCN/raw/master/Homebrew.sh)"卸载指令（如果需要）：/bin/zsh -c "$(curl -fsSL https://gitee.com/cunkai/HomebrewCN/raw/master/HomebrewUninstall.sh)"brew update // 升级版本brew -v //查看版本
```

![](https://mmbiz.qpic.cn/mmbiz_png/ykPlG9lRR7yiaPvuVwdWaI9dLrEkMQT5sGT49pZWwXUTwHNXAqbLpHpscc23bvU1GMyZwRO3a143HdsPdP4DSibA/640?wx_fmt=png)

![](https://mmbiz.qpic.cn/mmbiz_png/ykPlG9lRR7yiaPvuVwdWaI9dLrEkMQT5sCEqCiagLqZdM72DvWZJ6qTFw9wNQpAw6IhSibIic2dpSwJJMHIPBhoVAw/640?wx_fmt=png)

### homebrew 和 npm 的区别？

1.  homebrew，可以理解成 macOS 的软件管理工具，粗俗点说就是 mac 界的 qq 软件助手之类的东西。所以通过 brew，安装什么 chrome 浏览器啊、atom 编辑器之类的可视化工具也是可以的。
    
2.  npm，是 node.js 界的程序 / 模块管理工具，也就是说 npm 只管理那些服务于 JavaScript 社区的程序。而且跨平台，windows 和 macOS，以及其他类 unix 操作系统都可以用。
    
3.  npm 是用于 NodeJS 语言的包管理器，NodeJS 是跨平台的；而 homebrew 是用于 OS X 系统的包管理器，类似 Windows 的各种软件管理工具（所谓 XX 软件市场之类）和 Linux 的 apt-get/yum/pacman 等。
    
4.  npm 是 node.js 的包管理工具，只要有 node 环境，不管是 windows, macOS, 还是 linux 都可以使用 npm 下载模块，brew 是 mac 的包管理工具，只有 macOS 上才有。
    

引用链接：https://www.jianshu.com/p/131dda5e51fe

npm 部分命令如下:

```
npm -l    用于查看各个命令的简单用法（所以下面的可以用这个命令来查看）npm init    用来初始化生成一个新的 package.json文件。它会向用户提问一系列问题，如果你觉得不用修改默认配置，一路回车就可以了。npm -h 或 npm help    查看npm命令的帮助信息npm ls 或 npm list    查看npm已安装的包信息npm -v 或 npm --version    查看npm版本信息npm install npm -g   npm更新自身npm info <pkg> version    查看某个模块最新发布版本信息，如npm info underscore versionnpm search <keyword>    查找与keyword匹配的模块信息npm view <pkg> version    查看一个包的最新发布版本npm i 或 npm install    npm安装当前目录package.json里面的所有包，下面的i同样可以用install代替，当卸载时，i用uninstall代替npm update <pkg> [-g]  更新指定模块，有-g表示全局npm i <pkg> [-g]    安装指定模块，有-g表示全局npm i <pkg>@version [-g]   安装指定版本的模块，有-g表示全局npm i <pkg> --save    安装包的同时自动更新package.json的依赖npm i <pkg> --save-dev    安装包的同时自动更新package.json的开发依赖npm i <pkg> --save-optional    安装包的同时自动更新package.json的可选版本依赖npm i <pkg> --save-exact   安装包并写入确切版本依赖，而不是一个可选的版本范围.
```

homebrew 部分命令如下:

```
brew install <pkg>    安装软件包brew uninstall <pkg>    卸载软件包brew search <keyword>    查询软件包brew list 或brew ls    列出已安装的软件包brew update    更新brewbrew home    用浏览器打开brew的官方网站brew info    显示软件信息brew deps    显示包依赖
```

### Node 多版本环境的安装

建议通过 n 来控制安装多个 node 环境以应对可能不同的项目使用场景

先安装 n：

```
brew install nn -V // 若看到具体打版本号，则说明安装成功
```

基本使用：在终端直接输入 n, 就可以管理各个版本的 node 了

```
n
```

1.  使用上下箭头选择对应的版本
    
2.  选择好版本之后，按回车键切换当前 node 版本
    
3.  选择好版本之后，敲 [d] 键删除对应版本的 node
    
4.  输入 [q] 退出管理界面
    

### Git 环境的安装

写代码肯定是需要 Git 环境的，mac 下安装 Git 用 brew 就好了, 不过有可能你的 mac 在安装 xcode 等工具的时候就已经安装好了 Git，所以先验证下

```
git -v // 若显示版本号则已经安装过了 Gitbrew install git // 安装 gitbrew upgrade git // 更新 gitbrew uninstall git // 卸载 git
```

安装完成后给 Git 配置全局环境变量，以方便使用, 如果是通过鼠标点击安装包 / UI 界面方式 安装，则它会自动配置环境变量。

```
whereis git // 可用来查看安装位置
```

git 的详细操作指南可查看这篇一份工作 6 年前端的 Git 备忘录

### nrm 的安装与使用

nrm 是一个用来管理和快速切换私人 npm 配置的工具，可用来随意的切换 npm 镜像源，比如公司内网镜像，淘宝镜像等，建议全局安装;

nrm 是 node 模块，所以通过 npm 来安装，它是一个命令行模块，需要使用 --global 参数进行全局安装，命令如下：

```
npm install nrm -g --save 全局安装nrm ls 查看默认配置，这里会列出所有的镜像nrm current 查看当前使用的是哪个源nrm use <源名> 切换到其它源，如 nrm use cnpmnrm add 命令可添加公司私有 npm 源，如 http://baozun.com(随便写的)，起个别名叫 baobao，nrm add baobao http://baozun.com此时再执行 nrm ls，发现 baobao 已添加成功nrm test npm 测速nrm del baobao 删除源配置
```

### 同步 vscode 环境的配置

以前在多个设备上同步自己的 vscode 环境如插件什么的是比较麻烦的，需要用到 settings sync 这样的插件，不过随着 vscode 官方的更新，现在 vscode 已经直接支持了，仅仅需要简单到配置。

1.  点击 VSCode 左下方的齿轮，开启 Settings Sync 功能
    
2.  会有弹窗让你选择下面 5 个你想同步的内容，Settings（配置）、Keyboard Shortcuts（快捷键）、Extensions（插件）、User Snippets（用户代码片段）、UI State（界面状态），建议全部钩上就好。
    
3.  点击 Sign in & Turn on 按钮，选择微软或者 github 账号进行登录，登陆成功之后，Settings Sync 就是开启状态了，VSCode 会在后台自动同步你刚才所选的内容。
    

### 推荐几个 vscode 常用的插件

1.  Webstorm IntelliJ Darcula Theme （主题插件，提供和 Webstorm 一样的字体和主题）
    
2.  小霸王（通过类似 webview 形式嵌套提供各种小游戏，如魂斗罗、坦克大战等）
    
3.  韭菜盒子（VSCode 里也可以看股票 & 基金 & 期货实时数据，做最好用的投资插件。）
    
4.  Live Host （快速编辑 host 文件、每日获取最佳 github ip 解决 DNS 污染问题。）
    
5.  Live Server（快速启动一个端口服务）
    
6.  git blame（可以快速的查看某一行最近的一次修改是谁、什么时候、哪次提交修改的）
    
7.  git graph（可以进行版本管理，比如 pull、push、修改比较、log、merge）
    
8.  gitlens （在 vscode 中使用 git 必备插件，功能非常强大）
    
9.  filesize（在底部显示当前文件到大小）
    

### mac 修改 host 文件的方法

第一种方案：

修改 host 文件一般用于开发调试跨域问题，或者因为域名污染导致网站无法访问；finder 中 command + shift + G 打开跳转弹窗，输入 /etc/hosts 就会跳转到 hosts 文件的位置了；

不过建议还是在终端中操作；

```
vim /etc/hosts
```

编辑后 :wq 保存生效。

![](https://mmbiz.qpic.cn/mmbiz_png/ykPlG9lRR7yiaPvuVwdWaI9dLrEkMQT5s6mTv9ETS9P1xBjmfcbbiaWBWSh11UHSAPuJLW5eGOsjibawiaviazwicHYA/640?wx_fmt=png)

![](https://mmbiz.qpic.cn/mmbiz_png/ykPlG9lRR7yiaPvuVwdWaI9dLrEkMQT5s662IcD6HBTPXhQCrk5YNfMHXIfWicvtjtdbXfKpS5DBPibXqRADcEaqA/640?wx_fmt=png)

第二种方案：

使用我写的 vscode 插件， LiveHost 可快速的编辑 hosts 文件，并且可更方便到维护和管理。

### macOS 必备的几个软件

1.  postman （开发者必备的接口调试工具）
    
2.  charles mac （平台必备️的抓包工具）
    
3.  gif brewery3 （gif 动图制作）
    
4.  clashX （科学上网必备）
    
5.  iStat Menus (监控设备运行状况)
    

### Mac 免费应用下载站点

1.  https://macwk.com 我认为最好用的免费应用下载站点（可惜最近关站了）
    
2.  https://xclient.info 跟 macwk 类似
    
3.  https://appstorrent.ru 毛子的
    

总结
--

也许是天意，刚换 Mac 没俩月，我的 Thinkpad T450s 就开不了机了，键盘灯亮 3 秒就关闭了，屏幕一直黑屏，有相关经验的朋友请不吝赐教, 这回想偶尔玩个红警也做不到了，也罢，那就把时间用来学习吧;

以上就是一个使用 Macbook Pro 不久的新用户这一年的使用经验，愿对你有所帮助。