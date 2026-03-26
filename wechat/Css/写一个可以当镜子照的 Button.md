> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/1k3xpLpvcW45nt1wc3rK9g)

最近写了一个好玩的 Button，它除了是一个 Button 外，还可以当镜子照。

![](https://mmbiz.qpic.cn/mmbiz_gif/YprkEU0TtGiaplqp7dadedp5ibloZXtXwSUs6nuB8mj09uxGfEeLVXFn3VWV1RiaRgTLCufYvuyiathXCWzdsSqAcA/640?wx_fmt=gif)

那这个好玩的 Button 是怎么实现的呢？

很容易想到是用到了摄像头。

没错，这里要使用浏览器的获取媒体设备的 api 来拿到摄像头的视频流，设置到 video 上，然后对 video 做下镜像反转，加点模糊就好了。

button 的部分倒是很容易，主要是阴影稍微麻烦点。

把 video 作为 button 的子元素，加个 overflow:hidden 就完成了上面的效果。

思路很容易，那我们就来实现下吧。

获取摄像头用的是 navigator.mediaDevices.getUserMedia 的 api。

在 MDN 中可以看到 mediaDevices 的介绍：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGiaplqp7dadedp5ibloZXtXwSoouiaa7Kf5wwXOF4HU8aUESykmlicVbU1icntibOnKlrFlyAgFxSPiaric1A/640?wx_fmt=png)

可以用来获取摄像头、麦克风、屏幕等。

它有这些 api：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGiaplqp7dadedp5ibloZXtXwSQHmgEoKXicTu1E34hXxcPFrFCpU5ib7ZqNibrt6ggtxtJKnNib94LjeEhQ/640?wx_fmt=png)

getDisplayMedia 可以用来录制屏幕，截图。

getUserMedia 可以获取摄像头、麦克风的输入。

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGiaplqp7dadedp5ibloZXtXwSZSP8EYFh8t6zUfCNotPicZImZibk1Sbe716CfXpqKZqC9OkEODSndK7g/640?wx_fmt=png)

我们这里用到的是 getUserMedia 的 api。

它要指定音频和视频的参数，开启、关闭、分辨率、前后摄像头啥的：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGiaplqp7dadedp5ibloZXtXwSwzAqiblyCxnJjficx6lzianINOPj2ay2nbR1Otia4vlq39icISKWibUhMeUg/640?wx_fmt=png)

这里我们把 video 开启，把 audio 关闭。

也就是这样：

```
navigator.mediaDevices.getUserMedia({    video: true,    audio: false,}).then((stream) => {    //...}).catch(e => {    console.log(e)})
```

然后把获取到的 stream 用一个 video 来展示：

```
navigator.mediaDevices.getUserMedia({    video: true,    audio: false,}).then((stream) => {  const video = document.getElementById('video');  video.srcObject = stream;  video.onloadedmetadata = () => {    video.play();  };}).catch((e) => console.log(e));
```

就是这样的：

‍![](https://mmbiz.qpic.cn/mmbiz_gif/YprkEU0TtGiaplqp7dadedp5ibloZXtXwSHGxtyToqIDib1VicBxgBYyvarzUCsV4bz9CiclzMOfYqF29rXQeibV3KHw/640?wx_fmt=gif)

通过 css 的 filter 来加点感觉：

比如加点 blur：

```
video {  filter: blur(10px);}
```

![](https://mmbiz.qpic.cn/mmbiz_gif/YprkEU0TtGiaplqp7dadedp5ibloZXtXwSrruGKYfPnKkaEH7D6SYGR8EUoWYv0xGok4BibOEPNLickibqGgMOnWzQQ/640?wx_fmt=gif)

加点饱和度：

```
video {  filter: saturate(5)}
```

![](https://mmbiz.qpic.cn/mmbiz_gif/YprkEU0TtGiaplqp7dadedp5ibloZXtXwSiclJ5flMRntesZcmT4EHDWibTlnMKnvSZFgHMy54lI0jyejeYU7ibmYVQ/640?wx_fmt=gif)

或者加点亮度：

```
video: {  filter: brightness(3);}
```

![](https://mmbiz.qpic.cn/mmbiz_gif/YprkEU0TtGiaplqp7dadedp5ibloZXtXwSdmTI11kl4WGLLw3WibWC9hCQQLnuWFLdroHghsVshnY80yTPm0JxeTg/640?wx_fmt=gif)

filter 可以组合，调整调整达到这样的效果就可以了：

```
video {  filter: blur(2px) saturate(0.6) brightness(1.1);}
```

![](https://mmbiz.qpic.cn/mmbiz_gif/YprkEU0TtGiaplqp7dadedp5ibloZXtXwSUwfxM4oXcdicOBUE7AweIsAeQ3VYjQhicF65HzibnXqbpcQI0k0gJV4Cw/640?wx_fmt=gif)

然后调整下大小：

```
video {  width: 300px;  height: 100px;  filter: blur(2px) saturate(0.6) brightness(1.1);}
```

  

![](https://mmbiz.qpic.cn/mmbiz_gif/YprkEU0TtGiaplqp7dadedp5ibloZXtXwSFViaXfgBeVlc7ft8MknLwlswg4ic13mnF3JnUoicD0WUVFwgEHgUQKgicg/640?wx_fmt=gif)

你会发现视频的画面没有达到设置的宽高。

这时候通过 object-fit 的样式来设置：

```
video {  width: 300px;  height: 100px;  object-fit: cover;  filter: blur(2px) saturate(0.6) brightness(1.1);}
```

cover 是充满容器，也就是这样：

![](https://mmbiz.qpic.cn/mmbiz_gif/YprkEU0TtGiaplqp7dadedp5ibloZXtXwSRz3IRymQ0I75lwmiazDjloKcxWLY4LMuJAaCwaiaLPqh30QonJ4mIEdw/640?wx_fmt=gif)

但画面显示的位置不大对，看不到脸。我想显示往下一点的画面怎么办呢？

可以通过 object-position 来设置：

```
video {  width: 300px;  height: 100px;  object-fit: cover;  filter: blur(2px) saturate(0.6) brightness(1.1);  object-position: 0 -100px;}
```

y 向下移动 100 px ，也就是这样的：

![](https://mmbiz.qpic.cn/mmbiz_gif/YprkEU0TtGiaplqp7dadedp5ibloZXtXwSQBD7aPbibAiaibwfnezkGcsUfCvUBeDmBk0xY5OH7FujVpkORLkzlnu4w/640?wx_fmt=gif)

现在画面显示的位置就对了。

其实现在还有一个特别隐蔽的问题，不知道大家发现没，就是方向是错的。照镜子的时候应该左右翻转才对。

所以加一个 scaleX(-1)，这样就可以绕 x 周反转了。

```
video {  width: 300px;  height: 100px;  object-fit: cover;  filter: blur(2px) saturate(0.6) brightness(1.1);  object-position: 0 -100px;  transform: scaleX(-1);}
```

![](https://mmbiz.qpic.cn/mmbiz_gif/YprkEU0TtGiaplqp7dadedp5ibloZXtXwSEfkhlywvsia7ILZsNRicgdQn3ZRTlXAxhHjVCYibMprS53GEhDIrAic8pg/640?wx_fmt=gif)

这样就是镜面反射的感觉了。

然后再就是 button 部分，这个我们倒是经常写：

```
function Button({ children }) {  const [buttonPressed, setButtonPressed] = useState(false);  return (    <div      className={`button-wrap ${buttonPressed ? "pressed" : null}`}    >      <div        className={`button ${buttonPressed ? "pressed" : null}`}        onPointerDown={() => setButtonPressed(true)}        onPointerUp={() => setButtonPressed(false)}      >         <video/>      </div>      <div class>{children}</div>    </div>  );}
```

这里我用 jsx 写的，点击的时候修改 pressed 状态，设置不同的 class。

样式部分是这样的：

```
:root {  --transition: 0.1s;  --border-radius: 56px;}.button-wrap {  width: 300px;  height: 100px;  position: relative;  transition: transform var(--transition), box-shadow var(--transition);}.button-wrap.pressed {  transform: translateZ(0) scale(0.95);}.button {  width: 100%;  height: 100%;  border: 1px solid #fff;  overflow: hidden;  border-radius: var(--border-radius);  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.25), 0px 8px 16px rgba(0, 0, 0, 0.15),    0px 16px 32px rgba(0, 0, 0, 0.125);  transform: translateZ(0);  cursor: pointer;}.button.pressed {  box-shadow: 0px -1px 1px rgba(0, 0, 0, 0.5), 0px 1px 1px rgba(0, 0, 0, 0.5);}.text {  position: absolute;  left: 50%;  top: 50%;  transform: translate(-50%, -50%);  pointer-events: none;  color: rgba(0, 0, 0, 0.7);  font-size: 48px;  font-weight: 500;  text-shadow:0px -1px 0px rgba(255, 255, 255, 0.5),0px 1px 0px rgba(255, 255, 255, 0.5);}
```

这种 button 大家写的很多了，也就不用过多解释。

要注意的是 text 和 video 都是绝对定位来做的居中。

再就是阴影的设置。

阴影的 4 个值是 x、y、扩散半径、颜色。

我设置了个多重阴影：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGiaplqp7dadedp5ibloZXtXwS13R73hzu2oYlvkicOqViavvSqoMMD86dFaBL5TL4sKPhwtF05UFrqOrQ/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGiaplqp7dadedp5ibloZXtXwSwtIJSzHZtznx10LkibRAlhicTIfFkl21OzKHicF3YiaDWTTwFSMLKXdXsQ/640?wx_fmt=png)

然后再改成不同透明度的黑就可以了：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGiaplqp7dadedp5ibloZXtXwS6vice5cIb7o6xsvwI2beA937HC9eAOXgdgKspRv9l6NKPftB4ZBNicGA/640?wx_fmt=png)

再就是按下时的阴影，设置了上下位置的 1px 黑色阴影：

```
.button.pressed {  box-shadow: 0px -1px 1px rgba(0, 0, 0, 0.5), 0px 1px 1px rgba(0, 0, 0, 0.5);}
```

同时，按下时还有个 scale 的设置：

![](https://mmbiz.qpic.cn/mmbiz_gif/YprkEU0TtGiaplqp7dadedp5ibloZXtXwStKmcMRv1WOpDBmc0Tmakial3icgRP0wD10pJUhpKhmwKUYIpSEqicGkMg/640?wx_fmt=gif)

再就是文字的阴影，也是上下都设置了 1px 阴影，达到环绕的效果：

```
text-shadow:0px -1px 0px rgba(255, 255, 255, 0.5),0px 1px 0px rgba(255, 255, 255, 0.5);
```

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGiaplqp7dadedp5ibloZXtXwSsWe6YOU3o5A9wvqTRMic9XkmIia4mXVEmchDIAP24azCleyI8DxNK0EA/640?wx_fmt=png)

最后，把这个 video 嵌进去就行了。

完整代码如下：

```
import React, { useState, useEffect, useRef } from "react";import "./button.css";function Button({ children }) {  const reflectionRef = useRef(null);  const [buttonPressed, setButtonPressed] = useState(false);  useEffect(() => {    if (!reflectionRef.current) return;    navigator.mediaDevices.getUserMedia({        video: true,        audio: false,    })    .then((stream) => {        const video = reflectionRef.current;        video.srcObject = stream;        video.onloadedmetadata = () => {        video.play();        };    })    .catch((e) => console.log(e));  }, [reflectionRef]);  return (    <div      className={`button-wrap ${buttonPressed ? "pressed" : null}`}    >      <div        className={`button ${buttonPressed ? "pressed" : null}`}        onPointerDown={() => setButtonPressed(true)}        onPointerUp={() => setButtonPressed(false)}      >        <video          class          ref={reflectionRef}        />      </div>      <div class>{children}</div>    </div>  );}export default Button;
```

```
body {  padding: 200px;}:root {  --transition: 0.1s;  --border-radius: 56px;}.button-wrap {  width: 300px;  height: 100px;  position: relative;  transition: transform var(--transition), box-shadow var(--transition);}.button-wrap.pressed {  transform: translateZ(0) scale(0.95);}.button {  width: 100%;  height: 100%;  border: 1px solid #fff;  overflow: hidden;  border-radius: var(--border-radius);  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.25), 0px 8px 16px rgba(0, 0, 0, 0.15),    0px 16px 32px rgba(0, 0, 0, 0.125);  transform: translateZ(0);  cursor: pointer;}.button.pressed {  box-shadow: 0px -1px 1px rgba(0, 0, 0, 0.5), 0px 1px 1px rgba(0, 0, 0, 0.5);}.text {  position: absolute;  left: 50%;  top: 50%;  transform: translate(-50%, -50%);  pointer-events: none;  color: rgba(0, 0, 0, 0.7);  font-size: 48px;  font-weight: 500;  text-shadow:0px -1px 0px rgba(255, 255, 255, 0.5),0px 1px 0px rgba(255, 255, 255, 0.5);}.text::selection {  background-color: transparent;}.button .button-reflection {  width: 100%;  height: 100%;  transform: scaleX(-1);  object-fit: cover;  opacity: 0.7;  filter: blur(2px) saturate(0.6) brightness(1.1);  object-position: 0 -100px;}
```

总结
--

浏览器提供了 media devices 的 api，可以获取摄像头、屏幕、麦克风等的输入。

除了常规的用途外，还可以用来做一些好玩的事情，比如今天这个的可以照镜子的 button。

当然，用在这里的话还需要设置下 filter 以及 object-fit、object-position 等样式。

这个 button 看起来就像我上厕所时看到的这个东西一样😂：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGiaplqp7dadedp5ibloZXtXwS7NGmWnOu0CQwoFMd381qoed5psKdiaGiaoickOJtq3SH3aexmAtmMliaZQ/640?wx_fmt=png)