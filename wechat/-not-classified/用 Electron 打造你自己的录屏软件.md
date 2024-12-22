> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/-NIGtPPkc4jOrC69d6GstA)

‍
-

```
大厂技术  高级前端  Node进阶

点击上方 程序员成长指北，关注公众号

回复1，加入高级Node交流群
```

前言
--

录屏软件对于我们来说都不陌生了，今天我们要做的事情是实现自己的录屏软件。载体使用`Electron`，因为它更适合录制桌面的场景。我们今天实现的录屏软件会包括下面的功能

*   分辨率调节
    
*   帧率调节
    
*   支持保存为`webm`、`mp4`、`gif`格式
    

本文用到的技术包括：

*   `electron`
    
*   `ffmpeg`
    
*   `vite`
    
*   `antd`
    

下面话不多说，我们马上进入实战环节

环境搭建
----

我个人习惯的技术栈是`React+Vite`，所以这次搭建这个`Electron`脚手架的时候我也往这方面去搭建。搭建过程中发现了一个很好的脚手架工具——electron-vite。需要搭建`Electron`项目的兄弟们也可以考虑用这个。功能还是十分强大的，用起来十分舒服，很多东西都预设好了

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibsjrOnDzjB8YeWFaj8NiaJXfUPcsicLm6z910peCG4tH8tibnZLXz5VtcKTErW9E3GFVfUk8fGnrgeOw/640?wx_fmt=png&from=appmsg&wxfrom=5&wx_lazy=1&wx_co=1)

  

直接下面的一条命令就可以搭建一个基础框架：

```
npm create @quick-start/electron
```

搭建完框架之后，下面现在写一下简单的配置页面，因为我们是配置录制的各种参数的。配置页面如下：

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibsjrOnDzjB8YeWFaj8NiaJXfjWH6CHWAcPaXMxLcdGeWgUOwicT9DhpNk3iaATQNv7FjucWPUsjEjJOQ/640?wx_fmt=png&from=appmsg&wxfrom=5&wx_lazy=1&wx_co=1)

  

就是使用了`antd`下了几个下拉框，还是比较简单的。

这里写的是渲染进程的代码，所以我们写在了`renderer/src/App.jsx`里。做`Electron`开发心里需要清楚，这种页面相关的，就写在渲染进程里，跟我们平时写`web`页面无异。

另外，我们的配置肯定是要持久化存储的，所以我会把这些配置存储在 l`ocalStorage`里。

```
  useEffect(() => {
  //清晰度
    setLocal(DEFINITION, definition)
  }, [definition])
  useEffect(() => {
  // 帧率
    setLocal(FRAME_RATE, frameRate)
  }, [frameRate])
  useEffect(() => {
  // 产物拓展名
    setLocal(EXT, ext)
  }, [ext])
```

以下是三个下拉框的选项配置，可以稍微看一下，后续会作为参数使用到录屏功能中

```
const DEFINITION_LIST = [
  { label: '超清', value: '3840x2160' },
  { label: '高清', value: '1280x720' },
  { label: '标清', value: '720x480' }
]

const FRAME_RATE_LIST = [
  { label: '高', value: '60' },
  { label: '中', value: '30' },
  { label: '低', value: '15' }
]

const EXT_LIST = [
  { label: 'webm', value: 'webm' },
  { label: 'mp4', value: 'mp4' },
  { label: 'gif', value: 'gif' }
]
```

IPC 通信
------

在`Electron`中，包括渲染进程跟主进程。渲染进程就是我们写的页面，主进程就是跟`Electron`窗体相关的，或者是需要调用一些`node`模块的逻辑。在主进程跟渲染进程是需要相互通信的，这里的通信方式就是`IPC`。

下面介绍两个例子，帮助理解这两个进程如何通信

#### 渲染进程发，主进程收

下面需要在主进程中实现录屏的功能，所以我们页面的配置需要发送到主进程。那么就可以通过这种方式发送到主进程中。

```
//渲染进程发送
  useEffect(() => {
    const options = {
      definition,
      frameRate,
      ext
    }
    window.electron.ipcRenderer.send(RECORD_EVNET.SET_CONFIG, options)
  }, [definition, frameRate, ext])
```

而主进程则可以通过下面的方式来接收

```
import {
  ipcMain
} from 'electron'
let config = {}
ipcMain.on(RECORD_EVNET.SET_CONFIG, (e, data) => {
    config = data
})
```

#### 主进程发，渲染进程收

下面介绍另外一种，主进程发送给渲染进程

```
//主进程发送
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    // frame: false,
    // autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })
mainWindow.webContents.send('event-name', { name:'jayliang' })
```

渲染进程接收

```
window.electron.ipcRenderer.on('event-name', callback)
```

系统托盘
----

下面要实现的是系统托盘的功能，方便我们在各个窗口的时候也能快速唤起录屏以及停止录屏。

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibsjrOnDzjB8YeWFaj8NiaJXfgiamic3Go2P3lmibZdTBpwicr6HnhWNvWNXpxzN1kdibLMLFRM7gPUv3woQ/640?wx_fmt=png&from=appmsg&wxfrom=5&wx_lazy=1&wx_co=1)

具体代码实现如下

```
import {
  Menu,
  Tray,
  nativeImage,
} from 'electron'


let trayIcon = nativeImage.createFromPath(icon)
// 设置图标大小
trayIcon = trayIcon.resize({ width: 16, height: 16 })

const tray = new Tray(trayIcon)

const contextMenu = Menu.buildFromTemplate([
{
  label: '开始',
  type: 'normal',
  click: startRecording
},
{
  label: '停止',
  type: 'normal',
  click: stopRecording
},
{ type: 'separator' },
{ label: '退出', type: 'normal', role: 'quit' }
])

tray.setToolTip('你的应用名称')
tray.setContextMenu(contextMenu)
```

可拖拽窗体
-----

这个功能跟录屏软件无关，觉得这是一个很有意思的功能，就把它实现了哈哈哈。实现的方法也很简单，具体代码如下

```
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.executeJavaScript(`
      document.addEventListener('mousedown', (e) => {
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
          window.isDragging = true;
          offset = { x: e.screenX - window.screenX, y: e.screenY - window.screenY };
        }
      });

      document.addEventListener('mousemove', (e) => {
        if (window.isDragging) {
          const { screenX, screenY } = e;
          window.moveTo(screenX - offset.x, screenY - offset.y);
        }
      });

      document.addEventListener('mouseup', () => {
        window.isDragging = false;
      });
    `)
  })
```

上面是在主进程中监听渲染进程的加载完成事件，往渲染进程中注入了一段`javascript`代码。这段`js`代码主要做的事情也是监听鼠标事件，然后调用`moveTo`方法来移动整个窗体。

![](https://mmbiz.qpic.cn/mmbiz_gif/lCQLg02gtibsjrOnDzjB8YeWFaj8NiaJXfk1HBzxDjNobePmsWWJ3C6kdmQdUckWQFSLfUnotq0f2IcRJkhXibYHw/640?wx_fmt=gif&from=appmsg&wxfrom=5&wx_lazy=1)

实现录制
----

好的，前面啰嗦了那么多。终于到实现真正的录制功能的时候了。先安装一下`ffmpeg`，这里使用的是`ffmpeg-static`这个库，安装这个库的时候它会识别你的操作系统，然后去安装编译好的`ffmpeg`二进制文件，最后导出的是一个`ffmpeg`的路径。

它里面用的下载链接可能会超时，所以可以设置一个镜像地址：

```
export FFMPEG_BINARIES_URL=https://cdn.npmmirror.com/binaries/ffmpeg-static
```

打包的命令记得改一下，为的是安装不同操作系统的`ffmpeg`

```
"build:win": "rm -rf ./node_modules && npm run build && electron-builder --win --config",
"build:mac": "rm -rf ./node_modules && npm run build && electron-builder --mac --config",
"build:linux": "rm -rf ./node_modules && npm run build && electron-builder --linux --config"
```

安装完之后就可以实现开始录制以及停止录制功能了，实现的代码如下：

```
import ffmpegPath from 'ffmpeg-static'
  const startRecording = async () => {
    let ffmpegCommand
    const { ext, frameRate, definition } = config
    const fileName = `${app.getPath('downloads')}/${+new Date()}.${ext}`
    if (ext === 'webm') {
      ffmpegCommand = `${ffmpegPath} -f avfoundation -framerate ${frameRate} -video_size ${definition} -i "1" -c:v libvpx-vp9 -c:a libopus ${fileName}`
    } else if (ext === 'mp4') {
      ffmpegCommand = `${ffmpegPath} -f avfoundation -framerate ${frameRate} -video_size ${definition} -i "1" -vsync vfr -c:v libx264 -preset ultrafast -qp 0 -c:a aac ${fileName}`
    } else if (ext === 'gif') {
      ffmpegCommand = `${ffmpegPath} -f avfoundation -framerate ${frameRate} -video_size ${definition} -i "1" -vf "fps=15" -c:v gif ${fileName}`
    }
    ffmpegProcess = spawn(ffmpegCommand, { shell: true })
    ffmpegProcess.stderr.on('data', (data) => {
      console.error(`FFmpeg Error: ${data}`)
    })
    ffmpegProcess.on('exit', (code, signal) => {
      console.log(`Recording process exited with code ${code} and signal ${signal}`)
    })
  }

  const stopRecording = () => {
    if (ffmpegProcess) {
      ffmpegProcess.kill('SIGINT') // 发送中断信号停止录制
    }
  }
```

解释一下上面的代码，`ext`是拓展名、`frameRate`是帧率、`definition`是分辨率，这些都是从渲染进程中获取的。

不同的录制产物对应不同的`ffmpeg`命令，开始录制时使用`spawn`开启一个子进程去调用`ffmpeg`录制，并保存子进程的饮用，在点击托盘的停止按钮时，向子进程发送停止命令。

这样我们就可以愉快的录制屏幕，并保存为我们想要的样子啦

以上还是存在不足：`avfoundation`是用在`mac`的采集库，在`Windows`下应该是用不了的，所以希望后续有时间也把`windows`版本给兼容了～

最后
--

至此，我们就实现了一个录屏小工具。如果你有一些其他的想法，欢迎阅读原文评论区一起交流。

Node 社群

```
我组建了一个氛围特别好的 Node.js 社群，里面有很多 Node.js小伙伴，如果你对Node.js学习感兴趣的话（后续有计划也可以），我们可以一起进行Node.js相关的交流、学习、共建。下方加 考拉 好友回复「Node」即可。

   “分享、点赞、在看” 支持一下
```