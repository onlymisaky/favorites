> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/SAJoGUhSNYcuWl0Xf0ah-Q)

**开放式系统互联模型**（英语：**O**pen **S**ystems **I**nterconnection Model，缩写：OSI；简称为 **OSI 模型**）是一种概念模型，由国际标准化组织提出，一个试图使各种计算机在世界范围内互连为网络的标准框架。

> 你有没有好奇过，当你在微信发一句 “在吗？”，这条消息是如何穿过千山万水到达对方手机的？ 其实，它就像一份快递，被层层打包、贴标签、转运…… 而 OSI 七层模型，就是这份“网络快递” 的标准操作手册！

在物流系统中，快递包裹流转的主要节点包括用户下单、上门取件、运输中转、在途运输、派送、签收以及售后，最终将包裹从寄件地点发送到收货地点。网络 “快递”，则是经历了从应用层到物理层对数据的拆装、转运实现了网络信息的通讯。

一、快递包裹的漫游
---------

**从 “在吗？” 到 0101**

#### 1. 应用层（Application Layer）

当我们要邮寄一件快递时，首先我们要打开快递公司的官网或者 APP 进入到快递下单页面，按照规则填写快递单信息，包含收寄地址、邮寄物品、物品属性等信息。这一面向用户的服务，就是物流链的 “应用层”。  
同样，我们在网络上发送数据，也需要遵循一定的规则来生成网络请求 “单”，如 HTTP 请求，需要提供请求行、请求头、请求体等必要信息。应用层职责就是为应用程序提供网络服务 “接口”，接口既是规则（如 HTTP 必须含 host 头），也是工具（如 Socket 函数库），更是产品功能（如 APP 的登录按钮）。

> **数据形态：**用户在微信输入 “在吗？” ，微信 APP 通过 HTTP 协议封装成请求，此时数据形态还是 “**在吗？**”

*   应用层数据传输  
    AH：应用层协议头部。![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNN9z1scCKMzsicKcficvaGbMEiaSN2TYMUE2LU3sLcFeHiaMEJwkdYBLV7iaDPu551nNanIIURSicZJ95lAw/640?wx_fmt=png&from=appmsg#imgIndex=0)
    

#### 2. 表示层（Presentation Layer）

假如我们邮寄的是一部手机，我们会通过添加防震材料，对包裹进行加固，防止物品途中损坏；假如我们邮寄的是一床被子，我们会通过真空压缩的方式减少物品体积；假如我们邮寄的是半导体一类的敏感物品，则需要通过改变外包装形状、修改物品信息标注等手段隐藏包裹真实内容。这些做法相当于是物流链” 表示层 “的功能。  
我们在网络中传递数据，为了保障数据跨平台兼容、端到端安全、高效传输以及跨协议互通，表示层对数据进行处理，其核心操作包括数据转换、加密 / 解密、压缩 / 解压、协议转换等工作内容。

> **数据形态：**加密 / 编码后的消息数据。假设使用 UTF-8 编码和 AES 加密，**Encrypted(UTF-8(**"在吗？"**))** ，数据变为：类似 **“x7f3e9a2b...”** 的密文。

*   表示层数据传输  
    PH：表示层数据格式控制头部。![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNN9z1scCKMzsicKcficvaGbMEiapJQap19e34AWA4MpEYWScoibmvXBy3yJHcVN8OuPFobGqHuOGPmHY2Q/640?wx_fmt=png&from=appmsg#imgIndex=1)
    

#### 3. 会话层（Session Layer）

在确认下单后，我们往往会关心，我们的订单在某一时刻是什么状态，包裹到了哪里。快递应用会为我们提供基础运输信息、订单是否发生异常、物流可视化地图、包裹签收通知等服务，让我们实时了解订单状态。除了订单信息同步，快递公司还要处理一些订单异常状态，例如如果包裹因为天气原因暂停运输，当运力恢复时继续运输包裹。订单生命周期的管理与会话层的功能在流程控制与状态维护上具有相似性。  
为了确保网络数据传输的有序性、完整性和可恢复性，需要一个 “会话层”，管理应用程序之间的对话逻辑。这个管理者主要职责包括会话的建立、维护和终止；提供数据同步与可靠性保障，例如在视频会议中，同步音频 / 视频流，防止唇音不同步；身份校验与权限控制。会话层通过身份管理、同步控制、校验点与令牌三大机制，解决了端到端通信的逻辑连贯性问题，是应用层与传输层间的关键桥梁。

> **数据形态：**带有会话信息的数据包。为了便于数据追踪，会为数据包添加会话头信息，包括会话 ID 等。此时数据状态为：**SessionHeader(SessionID:123456)** + Encrypted(UTF-8("在吗？"))。

*   会话层数据传输  
    SH：会话控制头部。![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNN9z1scCKMzsicKcficvaGbMEiaVdmicEdYx8Utv4ibQnFyzdAaPDwyYOFDMAZzKQrHicibpUic09Y1VSiaf2Jg/640?wx_fmt=png&from=appmsg#imgIndex=2)
    

#### 4. 传输层（Transport Layer）

当我们购买商品下单的时候，电商平台会为我们提示预计到达时间，也就是在商家和买家之间达成了一个 “承诺送达时间” 的协议。如果我们下单的物品特别多，商家会为我们分开打包邮寄。如果在商品送达时，发现丢了一个包裹，我们会要求商家重新发一个。如果我们购买了不靠谱商家商品，商家又选择了不靠谱的快递公司，最终包裹丢失了，很有可能要我们自己承担损失。网络中的传输层也要面对和解决这些问题。

传输层是 “应用进程间通信” 与“网络层通信能力”的桥梁，正如物流系统中的“智能分拣中心”，传输层确保数据从主机 A 的进程 X，精准抵达主机 B 的进程 Y，并为上层应用屏蔽底层网络的复杂性。它需要保障“精准投递”，通过端口号区分不同应用程序，比如电脑同时打开微信和网页，传输层确保微信消息不会跑到浏览器里；还需要管理传输质量，TCP 协议会像会计一样严谨，给每个数据字节编号，收方必须签字确认，发现丢包就重传。也会像急性子的快递小哥一样（UDP），东西一扔就走，不管对方收没收到；对于大文件，也会将其分割成小包裹（分段），到目的地再组装还原。

> **数据形态：**分段的数据段 (TCP segment)，该层会为数据添加 TCP 头部，包括源 / 目的端口、序列号、确认号等。假设消息较小，不需要分割，则此时的数据状态为：**TCPHeader(SrcPort:53987, DstPort:443, Seq:12345)** + SessionHeader + Encrypted(UTF-8("在吗？"))。

*   传输层数据传输  
    TH：传输控制头部。![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNN9z1scCKMzsicKcficvaGbMEia2sibXBD1GVPqeqtJC9EfAaApLhibmBxYgiabicTo8NukU8NPvvMJmTxQ1w/640?wx_fmt=png&from=appmsg#imgIndex=3)
    

#### 5. 网络层（Network Layer）

在包裹装车后，就需要对车辆的运输路线进行规划。根据实时交通信息，动态规划 “时间最短 + 最低绕行” 的最优路线。当遇到道路拥堵，则动态调整路线，绕过拥堵路段。  
就像现实中的司机依靠导航或经验选择路线一样，网络中的数据包也有自己的 “智能导航”：路由器根据内置的路线图（路由表），结合快递收货地址（IP 地址）和收货人手机号（MAC 地址）的对应关系（映射），来决定最佳路径。如果数据包太大，还会被拆分成小块运输（分片）并在目的地重新组装（重组）。万一路上遇到问题（比如路不通），还会有专门的 “路况报告员”（ICMP 协议） 及时通知发送方。这套机制共同确保了数据高效、准确地送达目的地。

> **数据形态：**带有 IP 地址信息的数据包。该层为数据添加 IP 头，包含源 IP 和目标 IP，此时数据状态为：**IPHeader(SrcIP:192.168.1.100, DstIP:123.456.789.101)** + TCPHeader + SessionHeader + Encrypted(UTF-8("在吗？"))。

*   网络层数据传输  
    NH：路由寻址头部。![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNN9z1scCKMzsicKcficvaGbMEiaoq5zTrCkN0nlP7ouqObWSMu8ZDYIXqpQdrfofSBcISzBnbGmqcCrsQ/640?wx_fmt=png&from=appmsg#imgIndex=4)
    

#### 6. 数据链路层（Data Link Layer）

当包裹到达目标区域的分拣中心，就需要根据地址分区配送。如果遇到双十一活动，包裹太多就需要将部分包裹暂存，分批配送。有签收包裹经验的小伙伴，会注意到包裹面单上，会被快递员醒目地标记具体门牌号，这也是帮助小哥高效配送的一种方式。包裹有时候会直接被放在门口或当面签收，也可能会被放到快递柜，或者电话通知需要自己亲自去拿。在签收环节，如果物品损坏可以选择拒收。这些都是快递进入到同城配送阶段遇到的问题和普遍的处理方式。  
数据链路层如同网络的 “本地快递系统”，核心功能是确保同一物理网络内相邻节点间的可靠数据传输。它先将网络层的 IP 数据包封装成带 MAC 地址的 “帧”，通过交换机根据 MAC 表精准寻址投递；遇到信道拥堵时，启动流量控制避免数据积压，用 CRC 校验检测传输错误，并通过冲突避免机制，解决多设备争用信道问题。最终让数据包高效、准确地抵达下一跳设备的 MAC 地址。

> **数据形态：**数据帧。该层为数据添加帧头和帧尾，帧头包含源 MAC 地址和目标 MAC 地址（下一跳设备），并进行错误检测（CRC 校验）。此时数据状态为：**FrameHeader(SrcMAC:00:1A:2B:3C:4D:5E, DstMAC:00:1F:2B:3C:4D:5E)** + IPHeader + TCPHeader + SessionHeader + Encrypted(UTF-8("在吗？")) + **FrameTrailer(CRC)** 。

*   数据链路层数据传输  
    DH：帧头部。  
    HT：帧尾部。![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNN9z1scCKMzsicKcficvaGbMEiaqBKUamribH34C3bjZticRNDY5rjklV9QFEP8fzGViceBbFhaXgYqqFfibA/640?wx_fmt=png&from=appmsg#imgIndex=5)
    

#### 7. 物理层（Physical Layer）

物流系统的物理基础由运输工具（货车、飞机、高铁）和基础设施（公路、铁路、分拣中心、仓库）构成，快递包裹依赖这些载体实现从始发地到目的地的空间转移。同理，在网络世界中，数据包化身为电磁信号（电流、光脉冲或无线电波），依托电缆、光纤、空气等物理介质的传导，穿越路由节点与交换设备，完成端到端的传输。物理层就像物流的 “道路与运力”，为数据提供最底层的传输通道，是信息世界的物理载体。

> **数据形态：**比特流（电信号 / 光信号 / 无线电波）。该层将数据帧转换为比特流，通过物理介质传输，此时的数据状态为：**0101010001101001011011...**(二进制比特流)。

*   物理层数据传输![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNN9z1scCKMzsicKcficvaGbMEiahRuW4uGxpvE02Yianichx0oN5GEeJDg7TUJxKtZCuEVVfZghmazNk0cQ/640?wx_fmt=png&from=appmsg#imgIndex=6)
    

**全流程总结：**

*   应用层：你在微信输入 “在吗？” → 生成 HTTP 请求
    
*   表示层：加密 “在吗？” → “x7f3e9a2b...”
    
*   会话层：添加会话 ID → “SID:123456+x7f3e9a2b...”
    
*   传输层：添加 TCP 头 → “TCP 头 + SID:123456+x7f3e9a2b...”
    
*   网络层：添加 IP 头 → “IP 头 + TCP 头 + SID:123456+x7f3e9a2b...”
    
*   数据链路层：添加帧头尾 → “帧头 + IP 头 + TCP 头 + SID:123456+x7f3e9a2b...+ 帧尾”
    
*   物理层：转换为比特流 → “010101000110100101101110011...”
    

**从 “0101” 到微信消息**  
数据的发送流程是层层打包，而接收流程则是层层拆包。  
**逆向全流程**

*   物理层：接收比特流并转换为数据帧
    
*   数据链路层：检查 MAC 地址和 CRC，移除帧头尾
    
*   网络层：检查 IP 地址，移除 IP 头
    
*   传输层：TCP 重组数据，检查序列号，移除 TCP 头
    
*   会话层：验证会话 ID，维护会话状态，移除会话头
    
*   表示层：解密数据 “x7f3e9a2b...” → “在吗”
    
*   应用层：微信渲染 “在吗？”，显示在屏幕
    

二、模型详解
------

#### 2.1 层级解析

<table><thead><tr><th><section>层级</section></th><th><section>主要功能</section></th><th><section>常见设备</section></th><th><section>协议</section></th></tr></thead><tbody><tr><td><section>物理层 (比特 Bit)</section></td><td><section>设备间接收或发送比特流</section></td><td><section>中继器、网线、集线器、HUB 等</section></td><td><section>RJ45、CLOCK、IEEE802.3 等</section></td></tr><tr><td><section>数据链路层 (帧 Frame)</section></td><td><section>将比特组合成字节，进而组合成帧；用 MAC 地址访问介质；错误可以被发现但不能被纠正。</section></td><td><section>网卡、网桥、二层交换机等</section></td><td><section>802.3(以太网)、802.5(令牌环) 等</section></td></tr><tr><td><section>网络层 (数据包 Packet)</section></td><td><section>负责数据包从源到宿的传递和网际互连</section></td><td><section>路由器、多层交换机、防火墙等</section></td><td><section>IP、ICMP、ARP、RIP 等</section></td></tr><tr><td><section>传输层</section></td><td><section>可靠或不可靠数据传输；数据重传前的错误纠正。</section></td><td><section>--</section></td><td><section>TCP、UDP 等</section></td></tr><tr><td><section>会话层</section></td><td><section>保证不同应用程序的数据独立；建立、管理和终止会话。</section></td><td><section>--</section></td><td><section>NFS、SQL、NetBIOS、RPC</section></td></tr><tr><td><section>表示层</section></td><td><section>数据表示；加密与解密、数据的压缩与解压缩、图像编码与解码等特殊处理过程</section></td><td><section>--</section></td><td><section>压缩协议、加密协议</section></td></tr><tr><td><section>应用层</section></td><td><section>用户接口</section></td><td><section>网关 (Gateway)</section></td><td><section>FTP、DNS、Telnet、SNMP、SMTP、HTTP、WWW、NFS</section></td></tr></tbody></table>

#### 2.2 数据流转

**数据在各层流转示意图**![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNN9z1scCKMzsicKcficvaGbMEiaIpiaXfGlxMOH0wlqhm3KucuatoCuXarxJEv8E4RIib9zUiaZrfiaWBUxWA/640?wx_fmt=png&from=appmsg#imgIndex=7)

三、总结
----

OSI 的分层理念仍深刻影响着网络协议设计、故障排查和教育实践，其 “高内聚、低耦合” 的思想已成为复杂系统设计的黄金准则。对于日常开发，OSI 七层模型的分层思想同样具有借鉴意义，它可以帮我门提升项目的可维护性、扩展性并提升跨团队协作效率。

**参考资料**  
1.OSI 模型每层对应的功能及协议详解：【https://download.csdn.net/blog/column/12586693/141336860#3.%20OSI%E6%A8%A1%E5%9E%8B%E6[]%AF%8F%E5%B1%82%E5%AF%B9%E5%BA%94%E7%9A%84%E5%8A%9F%E8%83%BD%E5%8F%8A%E5%8D%8F%E8%AE%AE%E8%AF%A6%E8%A7%A3】  
2.5 分钟看懂 OSI 七层模型：【https://baijiahao.baidu.com/s?id=1826978610692714900&wfr=spider&for=pc】