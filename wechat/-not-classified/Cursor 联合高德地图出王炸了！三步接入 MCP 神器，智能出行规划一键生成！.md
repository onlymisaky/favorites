> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/dRJ1h0LyroPqDPEmwjm6Uw)

通过 Node.js 接入
-------------

#### 安装 node.js

下载适用于操作系统的 node 应用程序

**提示**

1.  1. 请确保已安装 Node.js，并检查本地 Node.js 版本是否为 v23 或更高版本。建议下载使用 v23 及以上版本以获得最佳兼容性和性能。
    
2.  2. 检查 npm 镜像源是否为默认镜像源（https://registry.npmjs.org/）
    

**查看命令：**

```
npm config get registry
```

#### 在 Cursor 中配置

建议使用最新版本的 Cursor 客户端，安装 Cursor。

**注意**

请登录您的 Cursor 个人账户，以使用大模型功能

1、**进入 Cursor 设置界面配置 MCP Server**

![](https://mmbiz.qpic.cn/sz_mmbiz_png/pqcWLvSo2kgUL66YXCl4uItgcyemeibYXjwibGeDA1GDHBbtnjC06uhnibL4RtJm3TTQykupHXDp0Co12qqL4B5sA/640?wx_fmt=png&from=appmsg)

2、**配置脚本**

获取 key

```
{    "mcpServers": {        "amap-maps": {            "command": "npx",            "args": [                "-y",                "@amap/amap-maps-mcp-server"            ],            "env": {                "AMAP_MAPS_API_KEY": "您在高德官网上申请的key"            }        }    }}
```

配置如下：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/pqcWLvSo2kgUL66YXCl4uItgcyemeibYXuFFUHgC3kY1yVa9usNN6lc5z6W5O2oyN7chIM6QmMGct2D2FyWANTA/640?wx_fmt=png&from=appmsg)

3、**返回 Cursor 设置界面查看 MCP 服务工具状态**

如上图 MCP Server — amap-maps Tools 工具状态正常可用

**提示**

当出现 Client closed 异常时，可以点击 Enabled（启用） 按钮以解决问题，如下图所示：

4、**选择配置 Cursor 大模型让你拥有更好的服务体验，建议选择 claude-3.7-sonnet**

![](https://mmbiz.qpic.cn/sz_mmbiz_png/pqcWLvSo2kgUL66YXCl4uItgcyemeibYXv13KQrJDmhbwE158gv8OS283nicE0POdxQTdK4LMaONnBxRnTIg5wyQ/640?wx_fmt=png&from=appmsg)

5、**模型交互模式 ：选择 Agent 方式**

按下 CTRL/CMD + L 快捷键，即可在编辑器右侧打开对话框

![](https://mmbiz.qpic.cn/sz_mmbiz_png/pqcWLvSo2kgUL66YXCl4uItgcyemeibYXCQPzYBjdKLJh5P0IzKZdcf0mefNRPLt1lPZGhZxO7LWD3yco1UDqsQ/640?wx_fmt=png&from=appmsg)

使用
--

#### 出游规划

![](https://mmbiz.qpic.cn/sz_mmbiz_png/pqcWLvSo2kgUL66YXCl4uItgcyemeibYXbiaQx53WYYQS06vj3UbxHzHiazia4hOg9BhlkrcibicicvwMqRAXgdibYNMaw/640?wx_fmt=png&from=appmsg)

#### 公交规划

![](https://mmbiz.qpic.cn/sz_mmbiz_png/pqcWLvSo2kgUL66YXCl4uItgcyemeibYXHq1ARGO4OSgkFy4vibAEr6hwiaLVgqL4sMp3hNVOBfIltomqzdO4TUkA/640?wx_fmt=png&from=appmsg)

**扫描以下二维码加小编微信，备注 “ai”，一起交流 AI 技术！**

![](https://mmbiz.qpic.cn/mmbiz_jpg/pqcWLvSo2kiakiaIvAlvIdMfAg9eow4D56YAXicUzMD1xGlGibLVC5Lfic1LJT2HhpENoIHeibOJfCwqrx2J0MpcydrQ/640?wx_fmt=jpeg)

![](https://mmbiz.qpic.cn/sz_mmbiz_png/2wV7LicL762ZUCR5WEela9H9fDfYic8BAp8ib4cmuicFgACoRwORYGwkBtgUVaILLOjXtlGBnicuM5246MgketktMCg/640?wx_fmt=png)

点个在看支持我吧，转发就更好了