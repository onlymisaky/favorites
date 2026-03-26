> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/abGyznJE0cX3SeEJS2yrsA)

从 Midscene v0.15 开始，开始支持 Android 自动化。AI 驱动的 Android 自动化时代已经到来！

案例展示
----

### 地图导航到景点

打开地图 App，搜索目的地，然后发起导航。

[视频详情](javascript:;)

### 使用 YAML 文件编写自动化脚本

![](https://mmbiz.qpic.cn/mmbiz_png/FuxFc4JogFx1LfcVRZ63ho96eDoO3JqylhXQcRVHYDLicYjAnqibScAXdTvUMX7NVsoJaSQibJFibPl7Jo7r7JLHWg/640?wx_fmt=png&from=appmsg)

### 使用 JavaScript SDK 来编写自动化脚本

```
import { AndroidAgent, AndroidDevice, getConnectedDevices } from '@midscene/android';import "dotenv/config"; // read environment variables from .env fileconst sleep = (ms) => new Promise((r) => setTimeout(r, ms));Promise.resolve(  (async () => {    const devices = await getConnectedDevices();    const page = new AndroidDevice(devices[0].udid);    // 👀 init Midscene agent    const agent = new AndroidAgent(page,{      aiActionContext:        'If any location, permission, user agreement, etc. popup, click agree. If login page pops up, close it.',    });    await page.connect();    await page.launch('https://www.ebay.com');    await sleep(5000);    // 👀 type keywords, perform a search    await agent.aiAction('type "Headphones" in search box, hit Enter');    // 👀 wait for the loading    await agent.aiWaitFor("there is at least one headphone item on page");    // or you may use a plain sleep:    // await sleep(5000);    // 👀 understand the page content, find the items    const items = await agent.aiQuery(      "{itemTitle: string, price: Number}[], find item in list and corresponding price"    );    console.log("headphones in stock", items);    // 👀 assert by AI    await agent.aiAssert("There is a category filter on the left");  })());
```

### 使用两种风格的 API 来执行交互

自动规划（Auto-planning）风格：

```
await agent.ai('input "Headphones" in search box, hit Enter');
```

即时操作（Instant Actions）风格：

```
await agent.aiInput('Headphones', 'search box');await agent.aiKeyboardPress('Enter');
```

### 示例项目

我们为 JavaScript SDK 准备了一个示例项目：

JavaScript 示例项目 [3]

如果你想要使用自动化进行测试，你可以使用 JavaScript 和 vitest。我们为你准备了一个示例项目，来看看它是如何工作的：

Vitest demo project[4]

此外，你也可以使用 yaml 文件来编写自动化脚本：

YAML 示例项目 [5]

限制
--

1.  无法使用元素定位的缓存功能。由于没有收集视图树，我们无法缓存元素标识符并重用它。
    
2.  目前只支持一些已知的 VL 模型。如果你想要引入其他 VL 模型，请让我们知道。
    
3.  运行性能还不够好。我们还在努力改进它。
    
4.  VL 模型在 `.aiQuery` 和 `.aiAssert` 中表现不佳。我们将在未来提供一种方法来切换模型以适应不同的任务。
    
5.  由于某些安全限制，你可能会在密码输入时得到一个空白截图，Midscene 此时将无法工作。
    

致谢
--

我们想要感谢以下项目：

*   scrcpy[6] 和 yume-chan[7] 允许我们使用浏览器控制 Android 设备。
    
*   appium-adb[8] 为 adb 提供了 javascript 桥接。
    
*   YADB[9] 为文本输入提供了性能提升。
    

参考资料

[1] 

@midscene_ai: _https://x.com/midscene_ai_

[2] 

Lynx: _https://github.com/lynx-family/lynx_

[3] 

JavaScript 示例项目: _https://github.com/web-infra-dev/midscene-example/blob/main/android/javascript-sdk-demo_

[4] 

Vitest demo project: _https://github.com/web-infra-dev/midscene-example/blob/main/android/vitest-demo_

[5] 

YAML 示例项目: _https://github.com/web-infra-dev/midscene-example/blob/main/android/yaml-scripts-demo_

[6] 

scrcpy: _https://github.com/Genymobile/scrcpy_

[7] 

yume-chan: _https://github.com/yume-chan_

[8] 

appium-adb: _https://github.com/appium/appium-adb_

[9] 

YADB: _https://github.com/ysbing/YADB_