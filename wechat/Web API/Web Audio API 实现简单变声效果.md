> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/MuBqhyDUWbqU9p8e9LhdlQ)

前言
==

想在网页中实现实时音频变声效果该如何实现呢，之前遇到这种处理音视频的需求，可能会想到需要借助 C 代码实现。但是现在随着浏览器性能的提升、web API 的丰富，通过浏览器原生的 API 也可以操作音频数据实现很多复杂的效果，为 web 音频开发提供了更多的选择。下面介绍几种采用原生 **Web Audio API** 实现变声效果的过程中尝试的几种方案，感兴趣的同学一起来了解下吧。

> 说明：本文讨论范围为变声场景中的变速变调方案，有其它两种场景：变速不变调、变调不变速需求的同学请移步参考链接或其它方案

Web Audio API 介绍
================

开始之前先简单了解下 **Web Audio API**，**Web Audio API** 提供了一组在 web 上操作音频的 API，可以使开发者自选音频数据来源，为音频添加效果，使声音可视化，为声音添加空间效果等功能。音频的输入流可以理解为一组 buffer，来源可以是读取音频文件产生到内存中的`AudioBufferSourceNode`，也可以是来自 HTML 中 audio 标签的`MediaElementAudioSourceNode`，也可以是来自音频流（例如麦克风）的`MediaStreamAudioSourceNode`。例如，采集自己设备上的麦克风声音连接到扬声器：

```
// 创建音频上下文const audioContext = new AudioContext();// 获取设备麦克风流stream = await navigator.mediaDevices  .getUserMedia({ audio: true})  .catch(function (error) {    console.log(error);  });// 创建来自麦克风的流的声音源const sourceNode = audioContext.createMediaStreamSource(stream);// 将声音连接的扬声器sourceNode.connect(audioContext.destination);
```

就可以对着麦克风说话听到自己的声音了。对上述来源数据流的处理被设计成一个个的节点（Node），具有模块化路由的特点，需要添加什么样的效果添加什么样的 node，例如一个最常见的操作是通过把输入的采样数据放大来达到扩音器的作用（`GainNode`），示例代码：

```
// 创建音频上下文const audioContext = new AudioContext();// 创建一个增益Nodeconst gainNode = audioCtx.createGain();// 获取设备麦克风流stream = await navigator.mediaDevices  .getUserMedia({ audio: true})  .catch(function (error) {    console.log(error);  });// 创建来自麦克风的流的声音源const sourceNode = audioContext.createMediaStreamSource(stream);// 将声音经过gainNode处理sourceNode.connect(gainNode);// 将声音连接的扬声器gainNode.connect(audioContext.destination);// 设置声音增益，放大声音gainNode.gain.value = 2.0;
```

以上只是连接了声音放大的 node，如果想要增加其它效果，可以继续往上添加 node 连接 connect，例如滤波器（`BiquadFilterNode`）、立体声控制（`StereoPannerNode`）、对信号进行扭曲（`WaveShaperNode`）等等。这种模块化设计提供了灵活的创建动态效果和复合音频的方法，是不是有种变魔法的感觉，哪里修改点哪里（添加 Node）非常方便。例如，以下展示了一个利用 `AudioContext` 创建四项滤波器节点（`Biquad filter node`）的例子：

```
var audioCtx = new (window.AudioContext || window.webkitAudioContext)();// 创建多个不同作用功能的node节点var analyser = audioCtx.createAnalyser();var distortion = audioCtx.createWaveShaper();var gainNode = audioCtx.createGain();var biquadFilter = audioCtx.createBiquadFilter();var convolver = audioCtx.createConvolver();// 将所有节点连接在一起source = audioCtx.createMediaStreamSource(stream);source.connect(analyser);analyser.connect(distortion);distortion.connect(biquadFilter);biquadFilter.connect(convolver);convolver.connect(gainNode);gainNode.connect(audioCtx.destination);// 控制双二阶滤波器biquadFilter.type = "lowshelf";biquadFilter.frequency.value = 1000;biquadFilter.gain.value = 25;
```

可以看到为声音流添加处理效果就像穿项链一样，一个接一个，最后得到最终效果，实现效果可以参考官方样例 voice-change-o-matic。一个简单而典型的 web audio 流程如下：

1.  创建音频上下文
    
2.  在音频上下文里创建源 — 例如, 振荡器，流
    
3.  创建效果节点，例如混响、双二阶滤波器、平移、压缩
    
4.  为音频选择一个目的地，例如你的系统扬声器
    
5.  连接源到效果器，对目的地进行效果输出
    

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEBCO7XZEKV38gjSb4rQ0WLdmMsibQ46Wt1HwShq2pTzicghMvV2qyhP7jHbib9duovBazUuqnXTGpxgA/640?wx_fmt=png)

变声效果实现
======

首先回顾一下声音的基础知识，声音是由物体振动产生的机械波，常接触到的有以下三个特性：

*   **频率**：频率越大，音调越高；频率越小，音调越低。
    
*   **振幅**：振幅越大，音量（响度）越大；振幅越小，音量越小。
    
*   **音色**：即波形，听声辨人的主要依据
    

这里说的变声效果是改变声音的音调，变声效果根据不同的场景可以分为变速不变调、变调不变速以及变调又变速 3 种。变速是指把一个语音在时域上拉长或缩短，而声音的采样率、基频以及共振峰都没有发生变化。变调是指把语音的基因频率降低或升高，共振峰做出相应的改变，采样频率不变。各种方案应用场景如下：

1.  **变速不变调：**各种各样的视频播放器中的 2 倍速，0.5 倍速播放就是应用的语音变速不变调原理；当然变速不变调还应用于网络电话 VOIP 中的应对网络抖动，简单的说，就是当网络不好的时候，播放端从网络中拉取到的数据少，缓存区的数据不够用，这个时候就使用缓存的数据播放的慢一点。反之，缓存区数据过多，就播放的快一点。这部分的实现可以参照 webrtc 的 netEQ 模块。平时在使用微信语音的时候应该能感受到网络特别卡时，为了保持语音连续，会故意慢放语音。
    
2.  **变调不变速：**变调不变速主要应用在声效上，声音提高音调将男声变成女生，或则将女生变成男声；另外，变调不变速配合其他一些音效算法，如 EQ，混响，tremolo 和 vibrato 可以实现变声效果，比如 QQ 上的萝莉音，大叔音等。
    
3.  **变速变调：**改变声音播放速率情况下，音调音色也会随着改变，例如玩过磁带的都知道，按快进功能会使声音变尖提高音调，慢放功能使声音变粗，降低音调。
    

前两种实现都要求对声音知识领域有更深的了解，声音时域、频域，信号的傅里叶变换变化都要去重新去复习一下，学习成本比较高，这里使用第 3 种方式，比较好接入。要改变声音的播放速率，**Web Audio API** 中提供了`AudioBufferSourceNode`有`playbackRate`属性，可以设置音频的播放速率，使用音频上下文`AudioContext.createBufferSource`获得实例，示例代码如下：

```
const play = ()=> {  const audioSrc = ref("src/assets/sample_orig.mp3")  const url = audioSrc.value  const request = new XMLHttpRequest()  request.open('GET', url, true)  request.responseType = 'arraybuffer'  request.onload = function() {    const audioData = request.response    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();      audioCtx.decodeAudioData(audioData, (audioBuffer) => {      let source = audioCtx.createBufferSource();      source.buffer = audioBuffer;      // 改变声音播放速率，2倍播放      source.playbackRate.value = 2;      source.connect(audioCtx.destination);      source.start(0);    });  }  request.send()}
```

可以调整`source.playbackRate.value`的值来改变音调，大于 1 提高音调，小于 1 降低音调。

虽然实现了变声效果，但是这种方式只适合播放音频文件，或者能获取到完整音频流的情况，对于获取麦克风这种持续输入的声音流并不适用，类似的还有 SoundTouchJS，它是某大佬实现的`SoundTouch`的 JS 版本，使用也是要获取完整音频的数据流，作者也做了相应的解释，参考链接![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEBCO7XZEKV38gjSb4rQ0WLdTegf4j1Ao1mCP3JasJbVJkZMibIZsrlmZhiaQyrTIYLPk7Aj6F9oGYrg/640?wx_fmt=png)如何处理麦克风获取的实时音频流呢，这里可以借助 **Web Audio API** 中的`ScriptProcessorNode`，它允许使用 JavaScript 生成、处理、分析音频。处理流程图如下：![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEBCO7XZEKV38gjSb4rQ0WLdg6Meic7Kz6Euy6xyYcsnR5ibRicBc4J2FWFWKicyKUJ0MXDmq5GibmF1WnA/640?wx_fmt=png)利用它将实时音频流数据处理一下，得到慢放或加速的声音流数据。示例代码如下：

```
const audioprocess = async () => {  const audioContext = new AudioContext();  // 采集麦克风输入声音流  let stream = await navigator.mediaDevices    .getUserMedia({ audio: true})    .catch(function (error) {      console.log(error);    });  const sourceNode = audioContext.createMediaStreamSource(stream);  const processor = audioContext.createScriptProcessor(4096, 1, 1);  processor.onaudioprocess = async event => {    // 处理回调中拿到输入声音数据    const inputBuffer = event.inputBuffer;    // 创建新的输出源    const outputSource = audioContext.createMediaStreamDestination();    const audioBuffer = audioContext.createBufferSource();    audioBuffer.buffer = inputBuffer;    // 设置声音加粗，慢放0.7倍    audioBuffer.playbackRate.value = 0.7    audioBuffer.connect(outputSource);    audioBuffer.start();    // 返回新的 MediaStream    const newStream = outputSource.stream;    const node = audioContext.createMediaStreamSource(newStream)    // 连接到扬声器播放    node.connect(audioContext.destination)  };  // 添加处理节点  sourceNode.connect(processor);  processor.connect(audioContext.destination)}
```

另外，还有一个利用 Google 开源 jungle 实现的改变音调的库，并且还有各种混响效果，音频可视化等炫酷功能，也是使用的 **Web Audio API** 实现，github 链接地址放在这里了，有兴趣也可以体验下，画面长这样![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEBCO7XZEKV38gjSb4rQ0WLdhXax3KM7MoFCOAlOWrHNuYwjW6w3cRGp8icD6y2wfnYKLogmSlFbmfA/640?wx_fmt=png)

总结
==

以上就是对 **Web Audio API** 的简单介绍和使用的分析，以及采用 **Web Audio API** 实现声音简单变声效果的几种实现，大家有哪些更好的实现方案欢迎评论区一起交流！

参考
==

https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API

https://github.com/cwilso/Audio-Input-Effects

https://mdn.github.io/voice-change-o-matic/

https://github.com/cutterbl/SoundTouchJS

https://cloud.tencent.com/developer/news/818606

https://zhuanlan.zhihu.com/p/110278983

https://www.nxrte.com/jishu/3146.html

- END -

关于奇舞团
-----

奇舞团是 360 集团最大的大前端团队，代表集团参与 W3C 和 ECMA 会员（TC39）工作。奇舞团非常重视人才培养，有工程师、讲师、翻译官、业务接口人、团队 Leader 等多种发展方向供员工选择，并辅以提供相应的技术力、专业力、通用力、领导力等培训课程。奇舞团以开放和求贤的心态欢迎各种优秀人才关注和加入奇舞团。

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEBLicibtcprJISN18FgTtg2N1ichPnMqRhicrP20VfwnC4vday7gtEoiaSynIH1bas4N5kgicliakrLdtT2Q/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)