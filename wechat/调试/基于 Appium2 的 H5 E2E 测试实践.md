> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/DFdJynuiN5sJliJTlj7HPA)

_本文作者：来自 MoonWebTeam 的 averyhuang _腾讯高级前端工程师__

_本文编辑：kanedongliu_

> E2E 测试领域，App 端内 H5 的 E2E 测试一直是老大难问题。这类 H5 大都依赖宿主 App 的能力，无法在普通浏览器中运行，传统的 Web E2E 测试工具，如 Selenium、Puppeteer 等无法满足这类 H5 的测试需求。在这种情况下，Appium 成为了解决端内 H5 E2E 测试的理想工具，Appium 支持原生应用、移动 Web 应用和混合应用的自动化测试，适用于 Android 和 iOS 平台。那么 Appium 究竟是如何做到跨平台的？使用过程中又有什么坑？请听笔者慢慢道来。

1. Appium 简介
============

1.1 Appium 是什么？
---------------

Appium 是一个基于 NodeJS 编写的开源自动化测试框架，旨在促进多个平台的 UI 自动化测试，包括移动设备（iOS、安卓、Tizen）、浏览器（Chrome、Firefox、Safari）、桌面（macOS、Windows）、TV（Roku、tvOS、三星）等。

1.2 Appium 为什么这么火？
------------------

Appium 自推出以来就受到了广泛关注和好评，已经成为移动应用自动化测试领域的主流框架，这主要得益于以下三点：

*   **跨平台**：Appium 不仅可以用于移动设备的测试，还支持浏览器、桌面程序、TV 的自动化测试。特别是 Appium 2.0，通过插件化的驱动（Driver）架构来支持不同平台的接入，使得 Appium 更加灵活和可扩展，可以轻松地为不同的平台提供自动化测试支持。
    
*   **跨语言**：测试脚本与 Appium 之间采用的是 C/S 架构，脚本中的所有测试指令都是通过 HTTP 接口发送到 Appium 服务，再由 Appium 下发到测试设备，因此 Appium 支持使用不同语言编写测试脚本。
    
*   **统一 API**：Appium 采用基于 HTTP 的 W3C 标准协议 WebDriver 为开发者提供了一套统一的 API，通过一套 API 就可以编写不同平台的测试脚本，大大降低了开发者的学习、使用成本。
    

2. Appium 原理解析
==============

2.1 Appium 架构
-------------

我们以安卓和 iOS 设备为例，看看 Appium 是怎么进行跨平台测试的：

![](https://mmbiz.qpic.cn/mmbiz_png/rje6y1OsrOJ86c4V4kfH6zTvn53Nia6ngGYLnbAQW6bJS7tP9vv2LQxnFhibiaPzP8AkJRc43OJDrcADu9TfFgTWQ/640?wx_fmt=png)

**第一步：测试脚本向 Appium 发送测试指令**

测试脚本和 Appium 是 C/S 架构，脚本通过 WebDriver 协议将测试指令发送到 Appium 。那么 WebDriver 协议究竟是什么呢？

WebDriver 是 W3C 制定的、基于 HTTP 的浏览器远程控制标准协议，它的前身是 Selenium 的 JSON Wire Protocol。相信前端同学应该对 Selenium 不陌生，Selenium 为了推动浏览器测试接口的标准化，制定了 JSON Wire Protocol 协议，各浏览器厂商也基于该协议实现了各自的驱动（Chrome Driver / Firefox Driver / Safari Driver 等）。Appium 诞生后，在该协议上扩展了移动设备测试的能力，称为 Mobile JSON Wire Protocol，后来这套协议被 W3C 采纳，成为了现在的 WebDriver 协议。

**第二步：Appium 通过对应平台的驱动，将测试指令转发到设备内置的测试框架上**

UIAutomator2、XCUITest 分别是谷歌、苹果公司官方出品的安卓、iOS 测试框架，内置在安卓、iOS 设备中。Appium 针对不同平台的测试框架开发了相应的驱动（Driver），驱动将测试指令简单处理，转发到测试设备的测试框架。Appium 2.0 还支持 Chromium、Safari、Flutter、Windows、Mac、Linux 等平台的测试驱动，逐渐形成生态。

**第三步：测试框架执行测试指令**

测试框架收到请求后执行相应指令，并将结果原路返回。

2.2 Appium 安卓测试原理
-----------------

我们以安卓设备为例，看看 Appium 与测试设备具体是怎么通信的。

![](https://mmbiz.qpic.cn/mmbiz_png/rje6y1OsrOJ86c4V4kfH6zTvn53Nia6ngRfZkqiaqRQkbn9ibFReJhVibPA0sIQ5wvpmzUvT03q95gsictqtHBrIKIw/640?wx_fmt=png)

**ADB**

ADB 全称为 Android Debug Bridge，是安卓自带的调试工具，支持安装、卸载、重启等简单操作，adbd 为常驻在安卓设备上的进程，用于接收、执行 ADB 命令。

**UIAutomator2 Server**

Appium 首次连接安卓设备时，会在设备上安装 UIAutomator2 Server，这个 Server 是一个 HTTP 服务，用于接收 UIAutomator2 Driver 的测试指令

通信过程如下：

(1) 对于安装、卸载、重启等简单操作，Appium 会通过 ADB 下发到设备的 adbd 进程执行；

(2) 对于点击、输入、滑动等 ADB 无法支持的复杂操作，Appium 会通过 HTTP 请求设备上的 UIAutomator2 Server，由 UIAutomator2 Server 调用 UIAutomator2 执行。

3. Mac 上 Appium 安卓测试环境搭建
========================

3.1 安装 Appium
-------------

Appium 是基于 NodeJS 开发、以 NPM 包的形式提供的，安装 Appium 的前提是安装 NodeJS 14 以上版本，读者可使用如 nvm 的 NodeJS 版本管理工具进行安装，过程简单不再赘述，本章节假设读者已经安装好 NodeJS。

### 3.1.1 安装 Java

(1) 下载 JDK

前往 https://jdk.java.net/  下载对应版本的 JDK。API 30 以下的 Android SDK 需要 Java 8，Android SDK 30 及以上需要 Java 9 或更高版本，Apple 芯片选择 AArch64 版本，Intel 芯片选择 x64 版本。

(2) 安装 JDK

将 JDK 源码包复制到安装路径进行解压

```
cp ~/Desktop/openjdk-20.0.2_macos-aarch64_bin.tar.gz /Users/huangnaiang/Library/Javacd /Users/huangnaiang/Library/Javatar -zxvf openjdk-20.0.2_macos-aarch64_bin.tar.gz
```

(3) 在 ~/.zshrc 文件中设置 JAVA_HOME 环境变量

请注意，这个路径下必须包含 bin、include 目录

```
export JAVA_HOME="/Users/huangnaiang/Library/Java/jdk-20.0.2.jdk/Contents/Home"
```

### 3.1.2 安装安卓 SDK

(1) 从 https://developer.android.com/studio  下载安装 Android Studio

(2) 打开 Setting... -> Appearance & Behavior -> System Settings -> Android SDK，勾选 Android API、Android SDK Platform-Tools 和 Android SDK Command-line Tools 进行安装，Android API 版本建议选择 6.0 以上，笔者使用了 34 版本。

![](https://mmbiz.qpic.cn/mmbiz_png/rje6y1OsrOJ86c4V4kfH6zTvn53Nia6ngibgvNqWSUjaDAU6Q0cAzMicGvggg0SvyIPMskLaatgQeNb9zRmov10hA/640?wx_fmt=png)

![](https://mmbiz.qpic.cn/mmbiz_png/rje6y1OsrOJ86c4V4kfH6zTvn53Nia6ngficjrXrPQHsiaYasxmOQHtdREmRqx6fA1YyMD7mUY9DwvHuWAeayQ0ibg/640?wx_fmt=png)

(3) 在 ~/.zshrc 文件中设置 ANDROID_HOME 环境变量

```
export ANDROID_HOME="/Users/huangnaiang/Library/Android/sdk"
```

### 3.1.3 安装 Appium 及 UIAutomator 2 驱动

```
npm i -g appium
appium driver install uiautomator2
```

### 3.1.4 验收环境

所有步骤做完后，Appium 安卓测试环境就已经搭建完成了。为确保万无一失，可使用 appium-doctor 工具进行环境验收，并启动 Appium 服务

(1) 安装 appium-doctor

```
npm install @appium/doctor -g
```

(2) 检测安卓环境是否搭建完成

```
# 检测安卓环境是否搭建完成appium-doctor --android
```

当所有 necessary 项都打上勾，说明基础的安卓测试环境已经搭建完成

![](https://mmbiz.qpic.cn/mmbiz_png/rje6y1OsrOJ86c4V4kfH6zTvn53Nia6ng2NialqKVXdrjXwSFlpZnhTEib747QOuH6XQFcDknF88ED5bN4wk3T6hw/640?wx_fmt=png)

(3) 启动 Appium 服务，Appium 默认使用 4723 端口

```
# 启动 Appium 服务appium
```

3.2 安装 Appium inspector
-----------------------

Appium inspector 是 Appium 提供的一个图形化工具，可以轻松地查看 App 的元素层次结构，并使用其来定位元素。从 https://github.com/appium/appium-inspector/releases/  下载对应版本安装，过程简单不在赘述。

![](https://mmbiz.qpic.cn/mmbiz_png/rje6y1OsrOJ86c4V4kfH6zTvn53Nia6ngsMKrC2nmm7drQDO8Cls9PYTYEoSWvCwCAfWCwkjIAnpoziaNibWGVR7Q/640?wx_fmt=png)

4. Appium 实战
============

4.1 一个例子：应用宝 App 反馈页的自动化测试
--------------------------

应用宝 App 反馈页，是一个 App 端内的 H5 页面。在没有输入反馈详情的情况下点击提交，应该出现错误提示，我们看看这个例子的自动化测试应该怎么写。

![](https://mmbiz.qpic.cn/mmbiz_png/rje6y1OsrOJ86c4V4kfH6zTvn53Nia6ngK4GWE4VY5xbcOibwpNEP96jvqJziamdffg8qkpKl5AkmHuxhCnria2NZQ/640?wx_fmt=png)

```
/* 第一步，导入 WebDriver 客户端 */import { remote } from 'webdriverio';import { expect } from 'expect-webdriverio'(async () => {  /* 第二步，指定测试目标，连接 Appium 服务器 */  const capabilities = {    'platformName': 'Android',    'appium:automationName': 'UiAutomator2',    'appium:appPackage': 'com.tencent.android.qqdownloader',    'appium:appActivity': 'com.tencent.assistantv2.activity.MainActivity',    'appium:autoGrantPermissions': true,    'appium:chromedriverExecutable': '/Users/huangnaiang/Projects/appium-demo/chromedriver/chromedriver',  };  const options = { port: 4723, capabilities };  const driver = await remote(options);    /* 第三步：启动应用宝，通过 tmast 协议拉起反馈页 */  const agreeBtn = await driver.$('//*[@text="同意"]');  try {    await agreeBtn.waitForExist({ timeout: 3000 });  } catch (e) {}  if (await agreeBtn.isExisting()) {    await agreeBtn.click();  }  await driver.closeApp();  const debugURL = 'https://m.yyb.qq.com/agreement/feedback/?packageName=com.tencent.tmgp.sgame';  await driver.navigateTo(`tmast://webview?url=${encodeURIComponent(debugURL)}`);    /* 第四步：切入 WebView 上下文，点击提交按钮，验证错误提示文案 */  await driver.switchContext('WEBVIEW_com.tencent.android.qqdownloader:daemon');  const submitBtn = await driver.$('.y-button-default');  await submitBtn.click();  const detailErrorMsg = await(await driver.$('.feedback-textarea-box').nextElement()).getText();  expect(detailErrorMsg).toBe('请填写您想反馈的问题');})();
```

**第一步：导入 WebDriver 客户端**

前面提到，测试脚本和 Appium 是通过 WebDriver 协议通信的，WebDriver 提供了常见语言的客户端，NodeJS 中可直接使用 webdriverio。

**第二步：指定测试目标，连接 Appium 服务器**

这一步中，我们通过 capabilities 对象描述测试平台、测试框架、测试 App 的包名、启动页 Activity 名等，并且指定了 chromedriver 的路径，为后续切入 WebView 测试准备，然后调用 remote 方法连接 Appium 服务，这时候会自动启动测试 App，也就是应用宝。

**第三步：同意用户协议，通过 tmast 协议拉起反馈页**

这一步中，首先判断同意按钮是否存在，存在则进行点击（首次启动应用宝，需要同意协议），然后调用 navigateTo 方法通过 tmast 协议进入 App 反馈页。

**第四步：切入 WebView 上下文，点击提交按钮，验证错误提示文案**

在 Appium 中，Context（上下文）是指应用程序中的一个执行环境，在测试 Hybird App 的时候切换到 WebView 的上下文，就能使用 CSS Selector 语法查找、操作 Dom 元素。这一步中，先切换到 WebView 上下文，然后点击提交按钮，再验证错误提示文案是否符合预期。

4.2 对于 Hybrid App 的 H5 测试，有没有更简单的办法？
------------------------------------

上面的代码看起来很简单，但实际要运行起来还需要一些前置工作：

(1) 让终端同学通过 setWebContentsDebuggingEnabled(true) 打开 WebView 调试功能，打一个测试包，否则无法切换到 WebView 上下文

(2) 提前下载好测试 WebView 对应版本的 Chrome Driver，否则切换到 WebView 上下文后无法进行操作

这些前置工作导致了例行化 E2E 测试变得艰难，我们的 H5 可能在多个 App 内投放，我们不大可能去要求每个测试 App 都提供测试包，也不可能预知每个设备的 WebView 版本提前准备对应的 ChromeDriver。那么如何解决这个问题呢？

笔者所在团队搭建了一个测试服务，并在测试页面上注入一个 JS Agent，测试服务通过 WebSocket 下发测试指令到 Agent ，由 Agent 通过 JS Dom 操作来完成，以此来绕过 Appium 的依赖限制。整个过程如下：

![](https://mmbiz.qpic.cn/mmbiz_png/rje6y1OsrOJ86c4V4kfH6zTvn53Nia6ngj1OGfF892SBEmySWaGk1f90uOjefuicyO3ibiatl6w50EMkdHGIcZpAdA/640?wx_fmt=png)

(1) 测试服务连接 Appium 服务，这时候 Appim 服务会启动测试 App

(2) 测试服务通过 Appium，操作测试 App 打开测试页面

(3) 测试页面加载 JS Agent，JS Agent 通过 WebSockt 与测试服务建联

(4) 测试服务绕过 Appium，直接通过 WebSocket 下发测试指令到测试页面，JS Agent 解析、执行指令，上报执行结果

4.3 在 E2E 中引入图像识别技术
-------------------

笔者所在团队负责应用宝一个非常重要的业务：H5 云游戏。H5 云游页面比较特殊，云游戏是以视频流的形式呈现的，整个页面结构上只有一个 video 标签，在这种情况下，就只能靠图像识别技术来定位、操作元素了。

Appium 自带了图像识别能力，但功能比较有限，笔者基于 OpenCV 实现了查找图像、点击图像等系列测试指令，基本思路是通过图像识别技术找到目标坐标，再对坐标点进行操作。查找目标图像坐标的示例代码如下：

```
/** 匹配图像的间隔时间，单位毫秒 */const interval = 500;/** 开始匹配时间 */const startTime = new Date().getTime();/** 最后匹配时间 */let lastTime: number;/** 目标图像的坐标点 */let location: Location;// 获取图像的矩阵数据const imgMatrix = await opencv.imreadAsync(imgPath);while (true) {  const nowTime = new Date().getTime();  // 如果已超时，则不在进行匹配  if (nowTime - startTime >= timeout) break;  // 未达到匹配间隔，则跳过本次循环  if (lastTime && nowTime - lastTime < interval) continue;  lastTime = nowTime;    // 截取设备当前屏幕，转换为矩阵数据  const screenshotMatrix = opencv.imdecode(Buffer.from(await driver.takeScreenshot(), 'base64'));  // 匹配目标图像在当前屏幕截图的问题  const minMaxLoc = await screenshotMatrix.matchTemplate(    imgMatrix,    MatchTemplateMethod.TM_CCORR_NORMED,  ).minMaxLocAsync();  const { maxVal, maxLoc: { x, y } } = minMaxLoc;  // 匹配得分找过 0.9 才认为匹配成功  if (maxVal < 0.9) continue;  // 为防止在屏幕画面不稳定的时候匹配到错误位置，加上二次确认确保画面稳定了，再取坐标  if (location && location.x === x && location.y === y) break;  location = { x, y };}
```

基本思路是：截图当前手机设备的屏幕，通过 OpenCV 的 API 与目标图像进行匹配，如果匹配分数超过 0.9 则认为找到目标，间隔 500 毫秒后再进行一次匹配，如果两次匹配到的坐标一致，才认为匹配成功，这主要是为了防止部分手机上一些动画特效导致匹配错误。

5. 总结
=====

本文详细讲解了 Appium 这一自动化测试框架的工作原理、环境搭建过程，然后通过一个示例演示了 Appium 的基本用法，最后分享了笔者所在业务在使用 Appium 过程中遇到的几个问题。Appium 作为一款功能强大的自动化测试框架，在移动应用自动化测试领域具有广泛的应用前景，希望本文能为读者在实际应用中使用 Appium 提供有益的指导和帮助。

最后，如果客官觉得文章还不错，👏👏👏欢迎点赞、转发、收藏、关注，这是对小编的最大支持和鼓励，鼓励我们持续产出优质内容。

​