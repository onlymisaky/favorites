> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/fKu9K6XHPbP_j9_nJr5OBw)

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e4YNLngAJ85KS8U5xnNVPFEHjeO8p76t9tojJViacFqkOuznHFVcnR708XpzbJw8csCGeHng2EIxvXj20KLZv4A/640?wx_fmt=png&from=appmsg)

前言
--

之前有期视频介绍过，在 Vercel 上可以免费部署很多应用，包括 Next.js、Nuxt、Remix。除了 Node.js 甚至还支持其他语言，包括 Go、 Python、Ruby，但在 Node.js 中有一个老牌的框架 Express.js，很多应用都是通过 Express.js 创建的，本文将记录下，如何将 Express.js 应用部署到 Vercel，以及它在 serverless 环境中应该考虑的因素。

在 Vercel 上部署 Express.js 应用程序只需要修改少量代码。让我们使用以下步骤创建一个新的 Express.js 项目并将其部署到 Vercel。

使用模板
----

Vercel 官网有一个 Express.js 项目示例 [1]，可以将其克隆并部署到 Vercel 作为项目的初始模板。

迁移现有项目
------

前置条件

*   安装 Node.js 环境
    
*   拥有 vercel 账号（可使用 Github 账号登录）
    

### 创建一个 Express.js 项目

```
mkdir new-express-projectcd new-express-projectnpm init -ynpm install express
```

并且我们创建一个`src/index.js` 作为入口文件

```
mkdir new-express-projectcd new-express-projectnpm init -ynpm install express
```

现在，我们运行 `node src/index.js` 便可以在本地启动 Express.js 服务。访问 http://localhost:3000/ 页面显示 Hello Express。

### 适配 vercel

我们知道 Vercel 是提供的是 serverless 服务，因此他有一个 api 目录作为每个函数的入口程序。

比如我们新建一个文件 `api/hello.js`

```
const express = require("express");const app = express();app.get("/", (req, res) => res.send("Hello Express"));app.listen(3000, () => console.log("Server ready on port 3000."));
```

部署到 Vercel 之后，访问 https://example.vercel.app/api/hello?name=Vercel

页面就会显示 Hello Vercel。

这就是 serverless，如要将传统 node 程序迁移到 serverless，需要改动大量代码。

幸运的是 vercel 已经实现了适配 express.js。

1.  新建一个 `api/index.js` 作为主程序的入口。
    

```
const express = require("express");const app = express();app.get("/", (req, res) => res.send("Hello Express"));app.listen(3000, () => console.log("Server ready on port 3000."));
```

并且导出 app。

2.  修改在 `src/index.js` 中导出 app
    

```
export default function handler(request, response) {  const { name = 'World' } = request.query;  return response.send(`Hello ${name}!`);}
```

3.  在根目录下新建一个文件 `vercel.json`
    

```
export default function handler(request, response) {  const { name = 'World' } = request.query;  return response.send(`Hello ${name}!`);}
```

通过使用 vercel.json 文件，我们可以控制 Vercel 配置应用程序的路由，将告诉 Vercel 将所有传入请求路由到我们的 `/api` 文件夹。

本地运行
----

我们可以使用 Vercel CLI 在本地模拟 Vercel 部署的环境。这样运行方式与 vercel 保持一致

首先，我们需要在终端中运行以下命令来安装 Vercel CLI。

```
const { app } = require("../src");module.exports = app;
```

接下来，登录 Vercel 授权，Vercel CLI 在您的 Vercel 账户上运行命令。

```
const { app } = require("../src");module.exports = app;
```

现在我们使用本地开发命令，该命令还将执行上面创建的`vercel.json`配置。

```
const express = require("express");const app = express();app.get("/", (req, res) => res.send("Hello Express"));app.listen(3000, () => console.log("Server ready on port 3000."));+ exports.app = app;
```

运行 `vercel dev` 会问你一些问题，随意回答即可。

回答完问题后，您现在应该在 http://localhost:3000 上有一个本地运行的服务器，我们可以在部署到 Vercel 之前测试该应用程序是否正常运行。

部署
--

我们可以将代码提交到 Github 中， 然后在 vercel 仪表盘中关联 git 项目，这样每次提交代码就会自动部署。也可以使用 vercel cli 来部署。

只需要执行

```
const express = require("express");const app = express();app.get("/", (req, res) => res.send("Hello Express"));app.listen(3000, () => console.log("Server ready on port 3000."));+ exports.app = app;
```

就可以打包部署，在控制台中会打印 2 个地址，第一个链接地址可以查看部署情况。第二个链接就是生成的预览地址。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e4YNLngAJ85KS8U5xnNVPFEHjeO8p76txfdKagmW90QYhHKVeTVCOe2iaNgbQc4ozdIicHrX4UFaEbD6WIGHmzDg/640?wx_fmt=png&from=appmsg)

使用 `vercel --prod` 可以将预览环境发布到生产环境。

适配 serverless 环境
----------------

如果从服务器环境迁移到 vercel serverless 环境，可能还需要考虑几个因素， 因为不再有服务器在后台运行

**Websockets**：serverless 函数具有最大执行时间限制，因此需要尽快响应。因此需要客户端定时请求数据，推荐使用使用 swr 方案代替，或者考虑使用 serverless 友好的实时数据提供程序。

**数据库连接**：serverless 函数的本质意味着它们可以打开多个数据库连接以响应不断增加的流量。为了有效地管理这一点，请使用 serverless 友好的数据库或实时连接池。这有助于确保最佳连接并维持应用程序的正常运行时间。

*   **模板和视图引擎**：在 serverless 环境中，优化响应计算至关重要。考虑 React、Pug 或 EJS 等视图引擎的效率。设置正确的标头以启用缓存也很重要，从而避免需要为每个请求计算相同的响应。这种方法最大限度地减少了按需计算，并利用缓存的内容来满足未来的请求。
    

例如在 vercel.json 配置缓存

```
{       "version": 2,     "rewrites": [        { "source": "/(.*)", "destination": "/api" }    ]}
```

参考：https://vercel.com/guides/using-express-with-vercel

[1]Express.js 项目示例： _https://github.com/vercel/examples/tree/main/solutions/express_