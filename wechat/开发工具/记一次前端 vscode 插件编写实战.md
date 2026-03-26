> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [segmentfault.com](https://segmentfault.com/a/1190000038553748)

> vscode 本身都是用浏览器实现的, 使用的技术为 Electron, 可以说 vscode 本身对我们前端工程师很友好, 在 vscode 上有很多优秀的插件供开发者使用, 那你有没有想过...

记一次前端 "vscode 插件编写实战" 超详细的分享会 (上)
---------------------------------

###### 记录了我在组内的技术分享, 有同样需求的同学可以参考一下

###### 分享全程下来时间大约 77 分钟

![](https://segmentfault.com/img/bVcLSgZ)

### 一. vscode 我们的战友

vscode 本身都是用浏览器实现的, 使用的技术为 Electron, 可以说 vscode 本身对我们前端工程师很友好, 在 vscode 上有很多优秀的插件供开发者使用, 那你有没有想过开发一款适合自己团队使用的插件?  
写文章之前我在网上找了很多资料, 但视频方面的资料太少了, 官方网站也并没有被很好很完整的汉化, 文章还是有一些的但大多举的例子不好运行, 需要读者自己配置一堆东西, 官网到是提供了再 github 上的一套例子, 但都是用 ts 编写并且部分运行都有问题, 里面的思维逻辑与书写方式也不适合入门学习, 所以我才在此写一篇更加易懂的分享教程, 希望可以让刚入门的同学更好的学习起来, 话不多说我们一步步深入探索.

### 二. 环境的准备.

1.  node 这个不用说了吧, 前端必备
2.  git
3.  npm install -g yo generator-code 安装开发工具, 这个 yo 是帮助我们创建项目的, 你可以理解为 cli

##### 初始化项目

`yo code` 虽然很短小, 但没错就是这样的  
![](https://segmentfault.com/img/bVcLs9c)  
这里需要我们选择初始化的工程, 这里我们主要聊插件部分, 并且 ts 并不是讨论的重点所以我们选择第二个`JavaScript`, 如果选第一个就会是使用 ts 开发插件.  
![](https://segmentfault.com/img/bVcLs93)  
输入一个插件名字, package.json 中的 displayName 也会变成这个  
![](https://segmentfault.com/img/bVcLs96)  
是否也采用 () 内的名字, 项目名也是文件夹名, package.json 中的 name 属性也会变成这个  
![](https://segmentfault.com/img/bVcLs97)  
输入对这个插件的描述, 项目名也是文件夹名, package.json 中的 description 属性也会变成这个  
![](https://segmentfault.com/img/bVcLs98)  
在 js 文件中启动语义检测 (可能用不到), jsconfig.json 中 compilerOptions.checkJs 会变为 true  
![](https://segmentfault.com/img/bVcLs99)  
是否初始化 git 仓库  
![](https://segmentfault.com/img/bVcLtaa)  
选择钟爱的包管理方式

##### 做完上述的步骤我们就得到了一个简易的工程

为了部分第一次做插件的同学入门, 这里暂时就不改动目录结构了, 下面介绍完配置我们在一起优化这个项目的结构.

### 三. 官网的第一个例子, 也许并不太适合入门时理解

`extension.js` 这个文件是初始项目时的入口文件, 我们的故事就是在这里展开的, 我们先把里面的注释都清理掉, 我来逐一解读一下这个基础结构.  
初始化的里面有点乱, 大家可以把我下面这份代码粘贴进去, 看着舒爽多了.

```
const vscode = require('vscode');

function activate(context) {
    // 1: 这里执行插件被激活时的操作
    console.log('我被激活了!! 桀桀桀桀...')
    // 1: 定义了一个命令(vscode.commands)
    // 2: lulu.helloWorld 可以把它当做id
    let disposable = vscode.commands.registerCommand('lulu.helloWorld', function () {
        // 3: 触发了一个弹出框
        vscode.window.showInformationMessage('第一个demo弹出信息!');
    });
  // 4: 把这个对象放入上下文中, 使其生效
    context.subscriptions.push(disposable);
}

// 5: 插件被销毁时调用的方法, 比如可以清除一些缓存, 释放一些内存
function deactivate() {}

// 6: 忙活一大堆当然要导出
module.exports = {
    activate,
    deactivate
}
```

###### 上面已经详细的标注了每一句代码, 接下来我们 按 `F5` 进入调试模式如图.

![](https://segmentfault.com/img/bVcLtcx)

1.  上方会出现一个操作栏, 我们接下来会经常与最后两个打交道
2.  系统为我们新开了一个窗口, 这个窗口默认集成了我们当前开发的这个插件工程

![](https://segmentfault.com/img/bVcLtcR)

下方也会出现调试台, 我们插件里面 console.log 打印的信息都会出现在这里.

###### 官网这个例子需要我们 `ctrl + shirt + p` 调出输入框, 然后在里面输入`hello w` 就可以如图所示

![](https://segmentfault.com/img/bVcLtdL)

###### 用力狠狠敲击回车, 大喊`神之一手`, 响起 bgm

![](https://segmentfault.com/img/bVcLtdS)  
在左下角就会出现这样一个弹出款, 这个例子也就完成了  
![](https://segmentfault.com/img/bVcLtd9)  
组件显示被激活

###### 那么我们一起来看一下, 这一套流程到底是怎么配置出来的!!

###### 他的配置方式我比较不赞同, 都是在 package.json 里面进行的

`package.json`  
![](https://segmentfault.com/img/bVcLteD)

`activationEvents`: 当什么情况下, 去激活这个插件, 也就是上面打印出桀桀怪笑.  
`activationEvents.onCommand`: 在某个命令下激活 (`之后会专门列出很多其他条件`)

###### 定义命令

`contributes.commands`: 你可以理解为'命令'的列表  
`command`: 命令的 id (上面就是依靠这个 id 找到这个命令)  
`title`: 命令语句 (可以看下图)  
![](https://segmentfault.com/img/bVcLtgA)  
![](https://segmentfault.com/img/bVcLtgH)

###### 所以`extension.js`里面的`registerCommand('lulu.helloWorld'` 就是指定了, 这个命令 Id 被执行的时候, 该执行的操作!

```
let disposable = vscode.commands.registerCommand('lulu.helloWorld', function () {
        // 3: 触发了一个弹出框
        vscode.window.showInformationMessage('第一个demo弹出信息!');
    });
```

###### 之所以标题里说这个例子不是太好, 就是因为我们平时较少用 vscode 的命令去做某个操作, 并不会很生动的把我们带入进去

### 四. 项目结构微改 + 提示的类型

一个`extension.js`文件已经满足不了我们的'xie.nian'了, 所以我们要把它稍微改造一下.  
老朋友`src`出场了, 毕竟我们以后要封装很多命令与操作， 工程化一点是必要的.

1.  最外层新建 src 文件夹
2.  `extension.js` 改名 `index.js`, 放入 src 文件夹内.
3.  `package.json`中设置路径 "main": "./src/index.js"(重点入口文件)
4.  新建 “目录. md” 文件， 把插件的简介完善一下， 保证任何时候最快速度理解项目。
5.  新建`message.js`文件, 放置弹出信息代码.

###### index 文件: 只负责导出引入各种功能, 不做具体的操作

```
const message = require('./message.js');

 function activate(context) {
    context.subscriptions.push(message);
}

module.exports = {
    activate
}
```

###### `message.js` 触发各种提示框

```
const vscode = require('vscode');

module.exports = vscode.commands.registerCommand('lulu.helloWorld', function () {
  vscode.window.showInformationMessage('第一个demo弹出信息!');
  vscode.window.showWarningMessage('第一个警告信息')
  vscode.window.showErrorMessage('第一个错误信息!');
});
```

###### 目录. md(这个要随时更新不要偷懒)

```
# 目录

1. index 入口文件

2. message   提示信息插件

3.
```

效果如下:

![](https://segmentfault.com/img/bVcLShi)

### 五. 激活的时机

出于性能的考虑, 我们的组件并不是任何时候都有效的, 也就是说不到对应的时机我们的组件处于未被激活的状态, 只有当比如说遇到`js`文件才会生效, 遇到`scss`文件才会生效, 只能某个命令才能生效等等情况.  
在`package.json`的`activationEvents数组`属性里面进行修改.  
这里只是常用的类型, 具体的可以去官网文档查看.

```
"activationEvents": [
        "onCommand:hello.cc",  // 执行hello命令时激活组件
        "onLanguage:javascript",  // 只有是js文件的时候激活组件(你可以做js的代码检测插件)
        "onLanguage:python", // 当时py文件的时候
        "onLanguage:json",
        "onLanguage:markdown",
        "onLanguage:typescript",
        "onDebug", // 这种生命周期的也有
        "*",
        "onStartupFinished"
    ],
```

1.  "*" 就是进来就激活, 因为他是任何时机 (不建议使用这个).
2.  `onStartupFinished`他就友好多了, 相当于_但是他是延迟执行, 不会影响启动速度, 因为他是浏览器启动结束后调用 (非要用 "_" 可以用这个代替).

###### 这里有个坑点, 比如你有 a,b 两个命令, 把 a 命令设为触发时机, 那么如果先执行 b 命令会报错, 因为你的插件还未激活.

### 六. 生命周期

与其他库一样, 生命周期是必不可少的 (**_摘自官网_**).

*   [`onLanguage`](https://link.segmentfault.com/?enc=tCSraLYyke6zcdeaAki4lA%3D%3D.p0OWQbJDgS9pJiOKBDvNblo4SCI8FAmdpHQUHJyRTJlfErx2a6NOaBQ6YozYT9%2BjSHIwOl%2FizuN2x3VHCyqPUa7z5xK5qPiozclekju0zpA%3D)
*   [`onCommand`](https://link.segmentfault.com/?enc=BFEgrI0jht1vDcOVFizsnw%3D%3D.Qb0BSu36P7b8If2oyoIt9uw2UlEb0O8bZfTUx%2FGCbbgwPA0FsRKHFBHqaBq%2FGPiX%2BODFF9cv%2BBR9W19jI8%2BiqSfrz3cswJH383CLzI6MAT0%3D)
*   [`onDebug`](https://link.segmentfault.com/?enc=EMSEWXwbdWg0zflNOZYShQ%3D%3D.xhzX6kSjjal9k6BbXkRZ9MF6ZcnwiVjdz3Hb7Li%2BmU0jKeFi9sPtKdaFmzk5p4fGDVJEAV%2BT2BB0NC%2BCMC9noEPXQC2%2F9pJ4mmcsdoq1lns%3D)
    
    *   [`onDebugInitialConfigurations`](https://link.segmentfault.com/?enc=xkv43hoA2yMImKWiFx9nEQ%3D%3D.xokb7PjE5aFwB9dkCEmdjjjWQS598pCd0xeKyLnSokAb%2BGON%2BEV%2FHBuPiCM9vOco%2FfRthMno3%2BRh37dgJkUpWvFIKWNf%2BM4xq%2BFjRMAtyLmeNu8wJpsu0QObCw2TXlgN)
    *   [`onDebugResolve`](https://link.segmentfault.com/?enc=%2BcwxN4Qv0%2B7iXO%2BWY6kHCg%3D%3D.BZdLN8s7LtWTKLLNootRYdZWAfVbRfp8sTLUr2zT6UWet3wqxbVnvVFjCavJuHJLdA8B1evhvgXzcujMqqqhJa3%2B%2Fwx3fX0a1Kjyx0XhCJE%3D)
*   [`workspaceContains`](https://link.segmentfault.com/?enc=cnk8iq9zHqZp%2Fi0ysQsQ4Q%3D%3D.KkxRSdbkSDe6mC7dqoSxF3SrnXI8Z62Du4I5w%2Fg8OMDojeNTsQTCMAXssFnhzUQ53HapkCEiNPnzTrTAMM6qESd7lrdAdI9nHR4VeQyuDOaAtgmDLFvNSsEL7Nh%2BnVOj)
*   [`onFileSystem`](https://link.segmentfault.com/?enc=CLTLOKcwZoP7fM0AYkJf6Q%3D%3D.FJuDmN5hQkkLBjyoz5QtpN7Cokr2O%2BX1C%2FImPMgruMO42vSlEIWiXhZqA8kSAxr5Xm4ID%2F4UJH0myNUiOl3sYylCd%2FTJNJ7w2%2F4b4bYn1jU%3D)
*   [`onView`](https://link.segmentfault.com/?enc=D7ho7%2B7zUSJNEoCVV0gVFw%3D%3D.8Krj%2F4WWtKggniEjN89Orgot3DLBQmiyY0qrrgm0Zh7BXXQOIOq7tvOVFMedfawscf7DqSR7GiWJ7%2BQh33D%2BVZuZgr10xhmfGxgFBI6eVFA%3D)
*   [`onUri`](https://link.segmentfault.com/?enc=LwC84HWrcIktGre3%2BIKX%2Bg%3D%3D.wxpb0Sgtan1qmY%2BRbbiT705Bj9xGM3tp4ExIPlYXdDm3lOtJeoA10lGoRj2RanPTL6g%2Fq4PmNeQkgX6SmpGQy8Anj%2FuFyaOEY0f5uQyKTj0%3D)
*   [`onWebviewPanel`](https://link.segmentfault.com/?enc=kING2KeW2ygPuSP9wp3lyw%3D%3D.LjBKDa1leIYWEPwLBrs50FTZnUla4zAXxR67tpOvp4NEr59FoA%2BWrDQMs%2BxZHIINvOKDhVcHKWRG93wNn7eQvvbCh5zM9j0KwYRVzuQSG9g%3D)
*   [`onCustomEditor`](https://link.segmentfault.com/?enc=xRkVBHp%2BggBxEP6pxCFKUQ%3D%3D.HgEk%2FYe877CyUH%2FMXx81c%2FNuvEGbREoQ%2BLKHVa7pkL%2FiehG8ygL7B%2FaPdMLrn3bBaq102lK3X917Szqwbn36UjA2%2BpqVu5dnV%2B%2Bhq2jrWfU%3D)
*   [`*`](https://link.segmentfault.com/?enc=VGd8WKYtdzcvWTvid1QhfA%3D%3D.uMFT4bPh7Xv%2BrtXoMpXfHMU5Frm2l%2FwxkZj7ctHtM%2F9g2zRfiWL6wSbcGqZNWcyBslV1JgdkwO8FoqDyJpLHYuNfpqqIHe1M7jWCVprHWUU%3D)
*   [`onStartupFinished`](https://link.segmentfault.com/?enc=XgG2HAuNBYtZeuq0G4Lp%2Bw%3D%3D.5siknlNva2ZZqRvZftsqGAV8b3FpbVoHEk6mx7BOE7qJg5VwpoWrk57vihcqafrGvZIXb1HzAtUyaFewQVQLDMnRLoTcjwhRdy9VGxlN4YDs3ETf6GJb4Otc8HAtjEC6)

### 七. window 与 mac 的区别

我们知道, window 与 mac 的案件是不大一样的, mac 更多是使用`command`键, 这里我介绍一下分别设置快捷键.  
在`` `里面``contributes` 属性

```
"keybindings": [
 {
    "command": "hello.cc",
    "key": "ctrl+f10",
    "mac": "cmd+f10",
    "when": "editorTextFocus"
  }
],
```

### 八. when 属性常用方式

接下来还有其他地方用到这个`when属性`那么这里就专门提一下吧  
下面是比较常用的, 具体的要查官网, 毕竟太多了!

```
1. 编辑器获得焦点时
"when": "editorFocus"
2. 编辑器文本获得焦点
"when": "editorTextFocus"
3. 编辑器获取焦点并且四js文件的时候
"when": "editorFocus && resourceLangId == javascript"
4. 后缀不为.js
"when":"resourceExtname != .js"
5. 只在Linux,Windows环境下生效
"when": "isLinux || isWindows"
```

###### 1. 要正确的理解`when`, 他不是字符串, 他是 true 或 false 的布尔, 写成字符串 vscode 会去解析的, 所以`when`可以直接传 true, false, 这里要注意, 是`when: "true" when:"false"`

###### 2. 由第一条可知`editorLangId`其实就是运行时上下文的一个变量, 也就是文件类型名常量.

参考资料: [https://code.visualstudio.com...](https://link.segmentfault.com/?enc=KStCwdQI9PKJUZAFgGeptQ%3D%3D.h4K6l6tyrQ6ZbfLd5Ur5SrB8qFEdLzG0W7itIXxYwJfidqzNNghTTk5%2FIWByAPUv5F3IBeSo6q1jmzLGSK1LGg%3D%3D)

### 九. 所在的位置 左侧, 右上, 菜单的上与下

这里也只介绍最常用与好用的, 很多偏门知识学了我的这篇文章你也一定可以很轻易的自学了.  
①. 鼠标右键  
新建`navigation.js`文件用来展示我们的功能是否生效.  
在`index.js`里面引入

```
const vscode = require('vscode');
const message = require('./message.js');
const navigation = require('./navigation.js');

 function activate(context) {
    vscode.window.showInformationMessage('插件成功激活!');
    context.subscriptions.push(message);
    context.subscriptions.push(navigation);
}

module.exports = {
    activate
}
```

```
const vscode = require('vscode');

module.exports = vscode.commands.registerCommand('lulu.nav', function () {
  let day = new Date();
  day.setTime(day.getTime() + 24 * 60 * 60 * 1000);
  let date = day.getFullYear() + "-" + (day.getMonth() + 1) + "-" + day.getDate();
  vscode.window.showInformationMessage(`明天是: ${date}`);
});
```

上面是一个报告明天日期的功能, 当然我们可以在这里请求后端接口, 调取今天的人员安排列表之类的接口.

`package.json`里面的`contributes`属性中添加导航的配置.

1: 定义一个命令, 然后下面定义快捷触发这个命令

```
"commands": [
 {
  "command": "lulu.nav",
  "title": "点击我进行导航操作"
 }
],
```

2: 定义导航内容, 并且绑定点击事件

```
"menus": {
     // 在编辑器的内容区域
        "editor/context": [
            {
                "when": "editorFocus", // 你懂得
                "command": "lulu.nav", // 引用命令
                "group": "navigation" // 放在导航最上方
            }
        ]
    }
```

![](https://segmentfault.com/img/bVcLSF0)  
![](https://segmentfault.com/img/bVcLSF8)

②. 右上按钮  
其实挺少有插件用这里的, 反而这里的市场没被占用, 想开发插件的同学可以抢先占领一下.

```
"menus": {
        "editor/title": [
            {
                "when": "editorFocus", // 你懂得
                "command": "lulu.nav", // 引用命令
                "group": "navigation" // 放在导航最上方
            }
        ]
    }
```

![](https://segmentfault.com/img/bVcLSGT)

③. 左侧导航栏, (这个我决定下面与 tree 一起讲, 因为那里是重点)

### 十. 加载的进度条 (官网例子模糊)

加载是很常用的功能, 但是官网的例子也确实不够友好, 本着`我踩过的坑就不希望别人踩`的原则这里讲下进度条的实际用法.

老套路定义好命令

```
{
                "command": "lulu.progress",
                "title": "显示进度条"
            }
```

为了方便 我们把它也定义在右键菜单里面

```
{
                "when": "editorFocus",
                "command": "lulu.progress",
                "group": "navigation"
            }
```

新建`progress.js`文件

```
const vscode = require('vscode');

module.exports = vscode.commands.registerCommand('lulu.progress', function () {
  vscode.window.withProgress({
    location: vscode.ProgressLocation.Notification,
    title: "载入xxxx的进度...",
    cancellable: true
  }, (progress) => {
    // 初始化进度
    progress.report({ increment: 0 });

    setTimeout(() => {
      progress.report({ increment: 10, message: "在努力。。。." });
    }, 1000);

    setTimeout(() => {
      progress.report({ increment: 40, message: "马上了..." });
    }, 2000);

    setTimeout(() => {
      progress.report({ increment: 50, message: "这就结束..." });
    }, 3000);

    const p = new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, 5000);
    });

    return p;
  })
});
```

1.  `vscode.window.withProgress` 第一个参数是配置, 第二个参数是操作
2.  `vscode.ProgressLocation.Notification` 来源信息, 让用户知道是哪个插件的进度条
3.  `title` 加载框标题
4.  `cancellable` 是否可取消
5.  `progress.report` 初始化进度
6.  `message` 拼在 title 后面的字符
7.  因为返回的是 promise, 所以规定调用 `resolve`则结束进度

![](https://segmentfault.com/img/bVcLSQD)

进度条也算常用的基本功能, 好好用让自己的插件更友好.

###### 可能是字数和图片有点多现在越写越卡, 只能跳到下篇去继续写啦.