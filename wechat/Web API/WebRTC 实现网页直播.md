> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/uA7BofPS-sT0yNMrhjWRfg)

```
<!DOCTYPE html>
<html>
  <head>
    <title>HLS 示例</title>
    <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
  </head>
  <body>
    <video id="video" controls autoplay style="width: 100%; max-width: 720px;"></video>
    <script>
      const video = document.getElementById('video');
      const hlsUrl = 'https://your-domain.com/live/stream.m3u8';

      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(hlsUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          video.play();
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = hlsUrl;
        video.addEventListener('loadedmetadata', function () {
          video.play();
        });
      } else {
        alert('浏览器不支持 HLS 播放');
      }
    </script>
  </body>
</html>
```

### WebRTC 概述

WebRTC 可以为应用添加基于开放标准运行的实时通信功能。它支持在对等设备之间发送视频、语音和通用数据，使开发者能够构建强大的语音和视频通信解决方案。

#### 应用场景

视频会议、在线教育、远程医疗、社交应用、互动直播、远程监控等。

### 网页端实时直播方案

举例：https://live.kuaishou.com/

![](https://mmbiz.qpic.cn/mmbiz_png/I7I6eaS2zGib6iarYs1HibnfK1T5GPPK4s3QKg9DGQl8NvXRYxde6Tn9W7jbT2O4B9iaxW1F00g9S3DAeWoUysaK7g/640?wx_fmt=png&from=appmsg#imgIndex=1)

<table><thead><tr><th data-colwidth="148"><strong>技术方案</strong></th><th data-colwidth="156"><strong>是否属于 (主播→服务端→观众)</strong></th><th data-colwidth="138"><strong>是否适合大规模观众</strong></th><th><strong>延迟</strong></th></tr></thead><tbody><tr><td data-colwidth="148">HLS + hls.js</td><td data-colwidth="156">✅ 是</td><td data-colwidth="138">✅ 是</td><td>3~5 秒</td></tr><tr><td data-colwidth="148">HTTP-FLV + flv.js</td><td data-colwidth="156">✅ 是</td><td data-colwidth="138">✅ 是</td><td>1~3 秒</td></tr><tr><td data-colwidth="148">WebRTC + SFU</td><td data-colwidth="156">✅ 是</td><td data-colwidth="138">✅ 是（需 SFU 架构）</td><td>&lt;1 秒</td></tr><tr><td data-colwidth="148">第三方云平台</td><td data-colwidth="156">✅ 是</td><td data-colwidth="138">✅ 是</td><td>取决于使用方式</td></tr><tr><td data-colwidth="148">WebRTC P2P</td><td data-colwidth="156">❌ 否</td><td data-colwidth="138">❌ 否（带宽瓶颈）</td><td>&lt;1 秒</td></tr><tr><td data-colwidth="148">WebSocket + 自定义</td><td data-colwidth="156">❌ 不标准</td><td data-colwidth="138">⚠️ 需自研</td><td>&lt;1 秒</td></tr></tbody></table>

**主播 → 服务端（推流）**

**服务器 → 观众（拉流）**

以 HLS + hls.js 举例，步骤如下：

1.  利用 OBS、FFmpeg 等工具，实现主播端推流（RTMP 协议）
    
2.  服务端（基于 RTMP 协议的直播服务器，有：SRS、nginx-rtmp 等）
    
3.  服务端对 RTMP 流进行转换，转为 HLS（.m3u8 + .ts）
    
4.  观众端用 <video>/hls.js 拉取 .m3u8 播放
    

注 1：RTMP 实时消息协议，一种将视频 / 音频数据从主播端推送到服务器的协议。

注 2：浏览器不能直接播放 RTMP 流，所以通常会转协议为浏览器友好的格式。

注 3：使用 HTTP 下载 .ts 片段、websocket、WebRTC 连接（SDP+ICE）。

```
v=0
o=mozilla...THIS_IS_SDPARTA-58.0.2 1392930692610468855 0 IN IP4 0.0.0.0
  s=-
  t=0 0
a=sendrecv
a=fingerprint:sha-256 97:73:D6:F9:B8:4C:4A:29:3B:E0:B4:3E:E6:37:F6:D0:B7:8A:88:D9:E5:D2:C4:F8:74:66:18:B7:84:18:BB:42
a=group:BUNDLE sdparta_0 sdparta_1
a=ice-options:trickle
a=msid-semantic:WMS *
  m=audio 51644 UDP/TLS/RTP/SAVPF 109 9 0 8 101
c=IN IP4 193.224.69.74
  a=candidate:0 1 UDP 2122252543 192.0.2.1 53693 typ host
a=candidate:4 1 TCP 2105524479 192.0.2.1 9 typ host tcptype active
a=candidate:0 2 UDP 2122252542 192.0.2.1 40157 typ host
a=candidate:4 2 TCP 2105524478 192.0.2.1 9 typ host tcptype active
a=candidate:3 1 UDP 92217087 193.224.69.74 51644 typ relay raddr 193.224.69.74 rport 51644
a=candidate:3 2 UDP 92217086 193.224.69.74 64126 typ relay raddr 193.224.69.74 rport 64126
a=sendrecv
a=end-of-candidates
a=extmap:1/sendonly urn:ietf:params:rtp-hdrext:ssrc-audio-level
a=extmap:2 urn:ietf:params:rtp-hdrext:sdes:mid
a=fmtp:109 maxplaybackrate=48000;stereo=1;useinbandfec=1
a=fmtp:101 0-15
a=ice-pwd:957d8d9d754992a1d5a7706d5cb2e1fe
a=ice-ufrag:732f8881
a=mid:sdparta_0
a=msid:{69779578-0a01-46d5-afb8-c1ce8eb8b4f7} {3b93eb2f-9bf4-4955-95d0-5379eeba3e11}
a=rtcp:64126 IN IP4 193.224.69.74
a=rtcp-mux
a=rtpmap:109 opus/48000/2
a=rtpmap:9 G722/8000/1
a=rtpmap:0 PCMU/8000
a=rtpmap:8 PCMA/8000
a=rtpmap:101 telephone-event/8000
a=setup:actpass
a=ssrc:2764815782 cname:{08b8c6e5-8963-4a02-825f-d55ddb7076ba}
m=video 51644 UDP/TLS/RTP/SAVPF 120 121 126 97
c=IN IP4 193.224.69.74
a=candidate:0 1 UDP 2122252543 192.0.2.1 55556 typ host
a=candidate:4 1 TCP 2105524479 192.0.2.1 9 typ host tcptype active
a=candidate:0 2 UDP 2122252542 192.0.2.1 42946 typ host
a=candidate:4 2 TCP 2105524478 192.0.2.1 9 typ host tcptype active
a=candidate:3 1 UDP 92217087 193.224.69.74 52200 typ relay raddr 193.224.69.74 rport 52200
a=candidate:3 2 UDP 92217086 193.224.69.74 65354 typ relay raddr 193.224.69.74 rport 65354
a=sendrecv
a=extmap:1 http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time
a=extmap:2 urn:ietf:params:rtp-hdrext:toffset
a=extmap:3 urn:ietf:params:rtp-hdrext:sdes:mid
a=fmtp:126 profile-level-id=42e01f;level-asymmetry-allowed=1;packetization-mode=1
a=fmtp:97 profile-level-id=42e01f;level-asymmetry-allowed=1
a=fmtp:120 max-fs=12288;max-fr=60
a=fmtp:121 max-fs=12288;max-fr=60
a=ice-pwd:957d8d9d754992a1d5a7706d5cb2e1fe
a=ice-ufrag:732f8881
a=mid:sdparta_1
a=msid:{69779578-0a01-46d5-afb8-c1ce8eb8b4f7} {c4e521ab-ac5c-468d-bda4-102fa8c63ad1}
a=rtcp:65354 IN IP4 193.224.69.74
a=rtcp-fb:120 nack
a=rtcp-fb:120 nack pli
a=rtcp-fb:120 ccm fir
a=rtcp-fb:120 goog-remb
a=rtcp-fb:121 nack
a=rtcp-fb:121 nack pli
a=rtcp-fb:121 ccm fir
a=rtcp-fb:121 goog-remb
a=rtcp-fb:126 nack
a=rtcp-fb:126 nack pli
a=rtcp-fb:126 ccm fir
a=rtcp-fb:126 goog-remb
a=rtcp-fb:97 nack
a=rtcp-fb:97 nack pli
a=rtcp-fb:97 ccm fir
a=rtcp-fb:97 goog-remb
a=rtcp-mux
a=rtpmap:120 VP8/90000
a=rtpmap:121 VP9/90000
a=rtpmap:126 H264/90000
a=rtpmap:97 H264/90000
a=setup:actpass
a=ssrc:1307424569 cname:{08b8c6e5-8963-4a02-825f-d55ddb7076ba}
```

#### WebRTC 特点

WebRTC 可以实现在浏览器里直接推流，而 RTMP 协议需要底层 TCP 套接字连接，浏览器不能直接访问裸 TCP Socket。 浏览器不能直接推 RTMP，只能通过 WebRTC / WebSocket 等中间层间接实现推流。

WebRTC（Web 实时通信）是一种使 Web 应用程序和站点能够捕获和选择性地流式传输音频或视频媒体，以及在浏览器之间交换任意数据的而无需中间件的技术。WebRTC 的一系列标准使得在不需要用户安装插件或任何其他第三方软件的情况下，可以实现点对点数据共享和电话会议。

### WebRTC P2P

A 端（主播）**→** B 端（观众），点到点直连。 主播和观众直接建立连接，无需中转服务器。 （不适合大规模直播，每个观众都和主播建立连接，带宽瓶颈 ）  

#### 信令服务器

![](https://mmbiz.qpic.cn/mmbiz_jpg/I7I6eaS2zGib6iarYs1HibnfK1T5GPPK4s3eLDgyd3GPiaWJa74HYjVJmrUqcZrEDyxjJtOQmRPJKKlqaRQBKzA1eA/640?wx_fmt=jpeg&from=appmsg#imgIndex=2)

WebRTC 的 “点对点” 只限于音视频流，而双方建立这个 “点对点” 通道需要先互相“介绍自己”，这个介绍过程就是 信令（Signaling），而 信令服务器 就是“介绍人”。

<table><thead><tr><th data-colwidth="192"><strong>信令阶段</strong></th><th><strong>作用说明</strong></th></tr></thead><tbody><tr><td data-colwidth="192">交换 SDP</td><td>告诉对方「我能接收什么格式的视频、音频、编码参数」（媒体协商）</td></tr><tr><td data-colwidth="192">交换 ICE Candidate</td><td>告诉对方「我在哪些 IP / 端口上可以通信」（网络协商）</td></tr><tr><td data-colwidth="192">协商完毕</td><td>浏览器尝试点对点打洞建立连接</td></tr></tbody></table>

一般信令服务器可以采用 websocket 来实现，这里我们可以采用 socket.io 库。

#### SDP 媒体协商

SDP 是一个描述多媒体连接内容的协议，例如分辨率，格式，编码，加密算法等。所以在数据传输时两端都能够理解彼此的数据。本质上，这些描述内容的元数据并不是媒体流本身。

![](https://mmbiz.qpic.cn/mmbiz_png/I7I6eaS2zGib6iarYs1HibnfK1T5GPPK4s3VGMcia0pL8LxeNTWJHtKkkesyOJoabaf8Qmkc21kZyHOLA70LGZgeLQ/640?wx_fmt=png&from=appmsg#imgIndex=3)

```
candidate:842163049 1 udp 1677729535 192.168.1.10 53821 typ host
candidate:1686052601 1 udp 2122260223 39.156.66.12 52043 typ srflx raddr 192.168.1.10 rport 53821
candidate:3189289473 1 udp 1686052863 203.0.113.1 3478 typ relay raddr 0.0.0.0 rport 0
```

#### ICE Candidate 网络协商

网络协商是用于在不同设备之间寻找可用的网络路径，并选择最佳路径进行通信。

```
candidate:842163049 1 udp 1677729535 192.168.1.10 53821 typ host
candidate:1686052601 1 udp 2122260223 39.156.66.12 52043 typ srflx raddr 192.168.1.10 rport 53821
candidate:3189289473 1 udp 1686052863 203.0.113.1 3478 typ relay raddr 0.0.0.0 rport 0
```

*   第一条是本地地址（`host`）
    
*   第二条是通过 STUN 得到的公网映射地址（`srflx`）
    
*   第三条是 TURN 中继地址（`relay`）
    

WebRTC 的 ICE 会做一件事：逐个尝试所有 candidate 的组合，看哪个能连通：

*   host A ↔ host B （同网段尝试）
    
*   host A ↔ srflx B
    
*   srflx A ↔ srflx B（公网 IP 尝试穿透）
    
*   relay A ↔ relay B（不行就 TURN）
    

![](https://mmbiz.qpic.cn/mmbiz_png/I7I6eaS2zGib6iarYs1HibnfK1T5GPPK4s3OGykca9D06B9pWnzcIsB8ffBfib6HALib3cyg0lTwEqgsIYgouH9iaeKg/640?wx_fmt=png&from=appmsg#imgIndex=4)

主播端发送信息：onicecandidate

观众端收到信息：addIceCandidate

观众端发送信息：onicecandidate

主播端收到信息：addIceCandidate

### 案例演示

实现步骤：

1.  前端页面布局
    
2.  socket.io 实现信令服务器，offer、answer、candidate
    
3.  startPiPBroadcast：开始画中画直播
    

1.  stopAllStreams：释放媒体流资源
    
2.  screenStream、cameraStream、micStream：数据采集
    
3.  主播端 **→**<video> 加载
    

5.  newViewer：监听新观众加入（主播端）
    

1.  viewerReady **→** 观众先准备就绪，主播再开播
    
2.  registerAsViewer **→** 主播先开播，观众后进入直播间
    
3.  new RTCPeerConnection **→** 为新观众创建独立的连接
    
4.  viewerConnection.addTrack **→** 点对点连接传输
    
5.  主播端 **→** createOffer() **→** setLocalDescription() **→** 发送 offer 到信令服务器
    

7.  socket.on('offer')：处理收到的 offer（观众端）
    

1.  setRemoteDescription()
    
2.  createAnswer() **→** setLocalDescription() **→** 发送 answer 到信令服务器
    

9.  socket.on('answer')：处理收到的 answer（主播端）
    

1.  setRemoteDescription()
    

11.  ICE Candidate：网络协商
    

1.  主播端 onicecandidate **→** 发送 candidate 到信令服务器  **→** 观众端收到信息 addIceCandidate
    
2.  观众端 onicecandidate **→** 发送 candidate 到信令服务器 **  → ** 主播端收到信息 addIceCandidate
    

13.  peerConnection.ontrack：处理接收到的媒体轨道
    

1.  观众端 **→**<video> 加载
    

简化 SDP、ICE Candidate 过程可使用第三方库：

peerjs（https://peerjs.com/）

Node 社群

```
我组建了一个氛围特别好的 Node.js 社群，里面有很多 Node.js小伙伴，如果你对Node.js学习感兴趣的话（后续有计划也可以），我们可以一起进行Node.js相关的交流、学习、共建。下方加 考拉 好友回复「Node」即可。

   “分享、点赞、在看” 支持一波👍
```