> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/ddmfrm1XVsxt1DOHaE4gxQ)

![](https://mmbiz.qpic.cn/mmbiz_gif/Tmczbd3NL02Vx1SialbIibFoTCNCf9BqR08hwxdk7L6uuMZDhtvicRf9IvPy2e4aqD8Ah7FYBInNVUxGzKGPfXmQg/640?wx_fmt=gif)

> 王志远，微医前端技术部。爱好吉他、健身、桌游，最最关键，资深大厂员工（kfc 外卖小哥），trust me，好奇心使生命有趣起来！

背景
--

公司有日报，每天需要在公司的周报系统中填写并提交，日报内容很简单，业务层面把自己的提交记录整理下，然后加点其他如架构、团队等方面的产出就好；但每次都要【打开周报系统 - 登陆 - 复制粘贴 - 提交】，觉得很麻烦，之前了解过前端爬虫神器 puppetter，遂决定深入学习一番。

![](https://mmbiz.qpic.cn/mmbiz_jpg/Tmczbd3NL02Vx1SialbIibFoTCNCf9BqR0q9KwZeh3PkPf0ia1FmTtZSxtiaLjQQLNkIYNTVxxwv1icZRhBdDPSicpog/640?wx_fmt=jpeg)1

但涉及到公司内部的周报系统，咱爱微医，可不能干这事儿。发现掘金是前端渲染项目，所以本文的案例采用掘金作为实战对象（小白鼠？？），啥也不说了，就看小编能不能过了，如果各位看官看到本文，请给掘金的大度点个大大的赞！

![](https://mmbiz.qpic.cn/mmbiz_jpg/Tmczbd3NL02Vx1SialbIibFoTCNCf9BqR0HXpNkibsjt40YGZ8reQ4WBzcuT0ZQXKsfJdSa6lMPe5TicIqlEC7gibpA/640?wx_fmt=jpeg)

本文目标
----

### 知识点

0.  前端爬虫知识入门：后端爬虫依赖接口，如果是前端渲染页面就无法爬取数据了，所以需要无头浏览器实现前端爬虫
    
1.  提效工具的前置基础知识：模拟人为操作的提效工具，扩展思考范围
    

### 实战产出

爬取掘金首页信息搭建了一个博客网站

*   登陆鉴权
    
*   数据入库：爬取的数据会存入 mysql 数据库，采用 navicat 远程连接数据库控制
    
*   订阅更新：订阅的标签有更新文章时会推送至邮箱
    

### 相关资料

*   仓库地址：https://gitee.com/zzmwzy/my-study-repos/tree/master/puppeteer-sty/crawl（求 star）
    
*   博客线上地址：http://82.157.62.28:8082/
    

### 当前实现效果

![](https://mmbiz.qpic.cn/mmbiz_jpg/Tmczbd3NL02Vx1SialbIibFoTCNCf9BqR00f9h3hcSERoeHOjvXkYdJcwVhOkiaF6eXVfYsWAsiciaxZa3Tka6eficWQ/640?wx_fmt=jpeg)

项目开始前置动作
--------

### 依赖版本锁定

```
{  "name": "crawl",  "version": "1.0.0",  "description": "",  "main": "index.js",  "scripts": {    "test": "echo "Error: no test specified" && exit 1"  },  "keywords": [],  "author": "",  "license": "ISC",  "dependencies": {    "axios": "^0.27.2",    "bluebird": "^3.7.2",    "body-parser": "^1.20.0",    "chalk": "^5.0.1",    "cheerio": "^1.0.0-rc.11",    "child_process": "^1.0.2",    "cron": "^2.0.0",    "ejs": "^3.1.8",    "express": "^4.18.1",    "express-session": "^1.17.3",    "iconv-lite": "^0.6.3",    "mysql": "^2.18.1",    "nodemailer": "^6.7.5",    "puppeteer": "^14.1.1",    "request": "^2.88.2",    "request-promise": "^4.2.6",    "urijs": "^1.19.11"  }}
```

### 目录结构

这个目录结构可以在实战时用作参考（别有压力呀！）

```
.├── 1. puppertee│   ├── 1.js│   ├── 2.js│   ├── 3.js│   ├── 4.js│   ├── 5. 爬取京东.js│   ├── baidu.png│   └── items-0.png├── 2. request│   ├── 1.request-json.js│   ├── 2.request-form.js│   ├── 3.request-file.js│   └── avatar.jpeg├── 3. cheerio│   ├── 1.cheerio.js│   ├── 2.cheerio-selector.js│   ├── 3.cheerio-attr.js│   ├── 4.cheerio-props.js│   └── 5.cheerio-find.js├── 4. dependens│   ├── 1. cron.js│   ├── 2. error.js│   ├── 3.debug.js│   ├── 4. pm2.js│   ├── 5. iconv-lite.js│   ├── 6.mail.js│   ├── 7.read.js│   └── my-debug.js├── bdyp.js├── crawl-server│   ├── app.js│   ├── bin│   │   └── www│   ├── package-lock.json│   ├── package.json│   ├── public│   │   ├── images│   │   ├── javascripts│   │   └── stylesheets│   ├── routes│   │   ├── index.js│   │   └── users.js│   └── uploads│       ├── 50d33a30f74fd55ffc0f3c0aaea989b6│       └── f24715d08bab6243f62bbe9f16a52d05├── crawl.sql├── db.js├── mail.js├── main.js├── package-lock.json├── package.json├── read│   ├── article-detail.js│   ├── articles.js│   ├── index.js│   ├── tags.js│   └── text.html├── readme.md├── utils│   ├── domain-util.js│   └── puppeteer-utils.js├── web│   ├── middleware│   │   └── auth.js│   ├── public│   │   └── css│   ├── router│   │   └── bdyp.js│   ├── server.js│   ├── update│   └── views│       ├── detail.html│       ├── footer.html│       ├── header.html│       ├── index.html│       ├── login.html│       └── subscribe.html└── write    ├── articles.js    ├── index.js    └── tags.js
```

前面的脏活累活都整完啦，开搞开搞

![](https://mmbiz.qpic.cn/mmbiz_gif/Tmczbd3NL02Vx1SialbIibFoTCNCf9BqR07Rp7MxsrSMVTdYcAqXPsIpqEbFt7IQwCE5RJ7tay82xFpVNjddLApQ/640?wx_fmt=gif)

第一步：熟悉爬虫基础概念
------------

### 期待产出

*   传统爬虫怎么工作的：利用 request 包实现传统后端爬虫爬取掘金标签
    
*   前端爬虫面向的问题：前端渲染导致传统爬虫无法抓取到数据
    
*   前端爬虫怎么工作的：
    

*   利用 puppetter 对百度官网进行截图
    
*   利用 puppetter 爬取京东，模拟搜索实现爬取京东手机列表
    

这里注意一定要先完成【开营计划】中的项目前置，包括了依赖安装，避免依赖版本导致的报错

![](https://mmbiz.qpic.cn/mmbiz_jpg/Tmczbd3NL02Vx1SialbIibFoTCNCf9BqR0ibUuKozHkYibmfPVLe1F4IWqLwDrkEwlOicWcoxCbXvGEBm8uwTsmyZXw/640?wx_fmt=jpeg)

### 传统爬虫怎么工作的：利用 request 包爬取掘金前端标签下的首页所有文章标题

##### 目标

掘金前端标签下的首页所有文章标题并保存至【titles.txt】中

##### 思路

*   获取 html：使用 request 包请求页面对应 url 从而获取
    
*   获取标题：对 html 字符串根据正则进行截取
    

##### 实战

我们先在仓库根目录下新建一个第一天实战的目录及文件`1.puppertee/1.js`（在 git bash 中可以直接执行如下命令）

```
mkdir 1.puppertee && cd 1.puppertee && touch 1.js
```

然后实现如下内容即可

```
let request = require("request");let url = "https://juejin.cn/tag/%E5%89%8D%E7%AB%AF";let fs = require("fs");let regexp = /class="title" data-v-\w+>(.+?)</a>/g;request(url, (err, response, body) => {  let titles = [];  body.replace(regexp, (matched, title) => {    titles.push(title);  });  console.log(titles);  fs.writeFileSync("titles.txt", titles);});
```

执行如下命令查看效果

```
node 1.js
```

##### 实现效果如下

![](https://mmbiz.qpic.cn/mmbiz_jpg/Tmczbd3NL02Vx1SialbIibFoTCNCf9BqR01KZsptPPABqFI7iaZphMibeoekhuUUahX45Vjx46E3yMZQ0wx0bL9bibQ/640?wx_fmt=jpeg)2022-06-01 21.42.28

### 前端爬虫面向的问题：前端渲染导致传统爬虫无法抓取到数据

这是我们提出一个需求，我们希望抓取掘金文章，你们会发现抓取不到东西，因为掘金文章是前端渲染的页面，后端接口请求时只能获取到挂载点和未执行的 js 文件（这就不过多解释了），那我们该怎么办？

前端爬虫！我们使用 puppeteer 实现前端爬虫

##### puppeteer

*   puppeteer 是 Chrome 团队开发的一个 node 库
    
*   可以通过 api 来控制浏览器的行为，比如点击，跳转，刷新，在控制台执行 js 脚本等等
    
*   通过这个工具可以用来写爬虫，自动签到，网页截图，生成 pdf，自动化测试等
    

闲话不多说，实战下就知道了

### 前端爬虫怎么工作的：利用 puppetter 对百度官网进行截图

##### 目标

利用 puppetter 打开百度官网，并对页面进行截图，存储在项目根路径

##### 思路

*   页面对象：puppeteer.launch 可以获取一个浏览器实例，而此实例的 newPage 方法可以获取一个页面对象
    
*   打开百度：页面对象存在 goto 方法，支持跳转指定 url
    
*   页面截图：页面对象存在 screenshot 方法，支持页面截图
    

##### 实战

我们先在仓库根目录下新建一个第一天实战的目录及文件`1.puppertee/2.js`（在 git bash 中可以直接执行如下命令）

```
touch 2.js
```

然后实现如下内容即可

```
let puppeteer = require("puppeteer");(async () => {  // 打开一个无界面的浏览器  const browser = await puppeteer.launch();  // 打开一个空白页  let page = await browser.newPage();  // 在地址栏中输入百度的地址  await page.goto("http://baidu.com");  // 把当前页面进行截图 保存在 baidu.png 文件中  await page.screenshot({    path: "baidu.png",  });  await browser.close(); //关闭浏览器})();
```

执行如下命令查看效果

```
node 2.js
```

##### 实现效果如下

![](https://mmbiz.qpic.cn/mmbiz_jpg/Tmczbd3NL02Vx1SialbIibFoTCNCf9BqR0GhepVtd8qK1aZWeQVZEichFXh400WvXcJgO6erfov43slSMd6HBqAsw/640?wx_fmt=jpeg)2022-06-02 03.20.24

### 前端爬虫怎么工作的：利用 puppetter 爬取京东，模拟搜索实现爬取京东手机列表

##### 目标

利用 puppetter 爬取京东，模拟搜索实现爬取京东手机列表

##### 思路

*   页面对象：puppeteer.launch 可以获取一个浏览器实例，而此实例的 newPage 方法可以获取一个页面对象
    
*   打开京东：页面对象存在 goto 方法，支持跳转指定 url
    
*   搜索手机关键词：页面对象存在 keyboard.type 方法，支持键盘事件
    
*   获取手机标题列表：页面对象存在 $$eval 方法，传入选择器，回传对应的 DOM
    

##### 实战

我们先在仓库根目录下新建一个第一天实战的目录及文件`1.puppertee/3.js`（在 git bash 中可以直接执行如下命令）

```
touch 3.js
```

然后实现如下内容即可

```
const puppeteer = require("puppeteer");(async function () {  const browser = await puppeteer.launch({ headless: false }); //启动浏览器  let page = await browser.newPage(); //创建一个 Page 实例  await page.setJavaScriptEnabled(true); //启用 javascript  await page.goto("https://www.jd.com/");  const searchInput = await page.$("#key"); //获取元素  await searchInput.focus(); //定位到搜索框  await page.keyboard.type("手机"); //输入手机  const searchBtn = await page.$(".button");  await searchBtn.click();  await page.waitForSelector(".gl-item"); //等待元素加载之后，否则获取不了异步加载的元素  const links = await page.$$eval(    ".gl-item > .gl-i-wrap > .p-img > a",    (links) => {      return links.map((a) => {        return {          href: a.href.trim(),          title: a.title,        };      });    }  );  console.log(links);})();
```

执行如下命令查看效果

```
node 3.js
```

##### 实现效果如下

![](https://mmbiz.qpic.cn/mmbiz_jpg/Tmczbd3NL02Vx1SialbIibFoTCNCf9BqR0WpLa046rFmyoC9QzrLicgAyx2OsSuUcDEicgD7myAm1gXqD7GeWy65UQ/640?wx_fmt=jpeg)2022-06-02 03.32.53

### 个人思考

我们已经可以利用 puppeteer 实现模拟用户动作（写入手机并触发搜索），那如果我们要拿返回信息跳转详情并爬取详情信息呢？请试试

![](https://mmbiz.qpic.cn/mmbiz_jpg/Tmczbd3NL02Vx1SialbIibFoTCNCf9BqR0ibricQnwicsyZXWF03z815vq0AKyohibSQ7ovMSbjXX3M8VicowEdU1g7LA/640?wx_fmt=jpeg)1651cbfd336d45bb12a38491cc85061d

第二步：抓去掘金数据
----------

编写网络爬虫抓取掘金数据（掘金标签、文章、文章详情），并存储到 MySQL 数据库中

0.  mysql 数据库服务
    

*   数据入库：mysql + bluebird
    
*   navicat 远程连接数据库
    
*   建表（如果是用笔者的服务器则可跳过）
    

2.  node 服务搭建（基于 express），提供触发爬取接口
    

*   发起前端模拟浏览器请求获取网页内容：puppeteer
    
*   使用类似 jQuery 的语法来操作网页提取需要的数据：cheerio
    
*   把数据保存到数据库中以供查询：mysql
    

### 实现效果

爬取 tag 信息

![](https://mmbiz.qpic.cn/mmbiz_jpg/Tmczbd3NL02Vx1SialbIibFoTCNCf9BqR083AU24ibPqoVyBfe7B0IHPfB6uuadpibIydGxdI095icOpsK9LvaPVbUQ/640?wx_fmt=jpeg)2022-06-02 10.39.41

入库数据

![](https://mmbiz.qpic.cn/mmbiz_jpg/Tmczbd3NL02Vx1SialbIibFoTCNCf9BqR0a1XNbwyD5nicHso9LjDnTHje2y0xhMzwFNjxEYfvZsEunibv3HYoo1Nw/640?wx_fmt=jpeg)image-20220603074616904

### mysql 数据库服务

要建表，需搭建 mysql 服务，可参考个人文章（保姆级指南：centos 安装 mysql ）：https://juejin.cn/post/7104346481787666446/

### navicat 远程连接数据库

我们找个可视化工具来控制 mysql，这里选用了 navicat，破解版分享网盘如下

*   mac 版本
    

```
链接: https://pan.baidu.com/s/1RyTNoApa7MxkIDTtbQ2jkQ  密码: jfjl
--来自百度网盘超级会员 V4 的分享
```

*   win 版本
    

```
链接: https://pan.baidu.com/s/1WSxWm1eCqRnao9j8AGLQFQ  密码: gdv1
--来自百度网盘超级会员 V4 的分享
```

一路 next 即可，安装好后，连接刚刚搭建好的远程 mysql，新建数据库`crawl-db`。

### 建表

使用 Navicat 导入数据库

##### sql 数据

先下载对应的数据库结构 sql 文件

```
链接: https://pan.baidu.com/s/12XVYjur54zz6eN9x-Ez9LA  密码: mhjj
--来自百度网盘超级会员 V4 的分享
```

##### Navicat Premium 连接

打开 Navicat Premium，然后点击右键选择新建数据库，名字跟我们要导入的数据库的名字一样

![](https://mmbiz.qpic.cn/mmbiz_jpg/Tmczbd3NL02Vx1SialbIibFoTCNCf9BqR02JMDvyoqpf25TCiaL8mygRN1BRvoaFGcIXuKwHUkMomdnsWBKHUnD5g/640?wx_fmt=jpeg)img

点击确定后，我们就可以见到左边出现刚刚我们建立好的数据库了，然后右击选择 “运行 SQL 文件” 会弹出一个框，点击 “...” 选择文件所在的路径，

![](https://mmbiz.qpic.cn/mmbiz_jpg/Tmczbd3NL02Vx1SialbIibFoTCNCf9BqR0MQHRRicJxGbTFwYBROO5tMpKjsDb4BQpRrgFtdicsOrwaRszLgfZwqRw/640?wx_fmt=jpeg)img

点击开始，文件就会导入成功！

![](https://mmbiz.qpic.cn/mmbiz_jpg/Tmczbd3NL02Vx1SialbIibFoTCNCf9BqR0uiaiarXxllJR5tKmkU0t2XBpcWXwhViaVJROFBIoJ9qYsMxSQeW9iaiaUFA/640?wx_fmt=jpeg)img

### node 服务搭建

*   提供 tag 接口：请求时爬取掘金标签页，获取所有标签信息并入库 tags 表中
    

*   read：利用 puppetter 爬取标签信息
    
*   write：写入数据库 tag 表中
    

*   提供 article 接口：请求时爬取指定标签对应的掘金文章列表，获取所有文章即对应详情信息，并入库 article、article-detail 和 article_tag 表中
    

*   查询：根据标签名查处理标签对应页面地址
    
*   read：利用 puppetter 爬取标签页信息
    
*   write：写入数据库 articles 表中，并将标签和文章对应关系写入中间表`article_tag`中
    

##### 入口文件 server.js

我们先在仓库根目录下新建一个第二天实战的目录及文件`web/server.js`（在 git bash 中可以直接执行如下命令）

```
mkdir web && cd web && touch server.js
```

然后实现如下内容即可

```
let express = require("express");const { query } = require("../db");let app = express();let read = require("./utils/read");let write = require("./utils/write");app.listen(8082);app.post("/tag", async function (req, res) {  // 获取所有标签  let tagUrl = "https://juejin.im/subscribe/all";  //读取掘金的标签列表  let tags = await read.tags(tagUrl);  // 把标签写到数据库中  await write.tags(tags);});app.post("/article", async function (req, res) {  let { tagName } = req.query;  let tags = await query(`SELECT * FROM tags`);  tags = tags.filter((tag) => tag.name === tagName);  // 根据标签获取所有的文章  let allAricles = {};  // 标签有很多，不同的标签下面的文章可能会重复  for (tag of tags) {    let articles = await read.articles(tag.href, 1);    articles.forEach((article) => (allAricles[article.id] = article));  }  // {id:article}  await write.articles(Object.values(allAricles));});
```

其中爬取数据和写入数据至数据库的实现放在`utils`中，目录结构如下

```
├── domain-util.js├── puppeteer-utils.js├── read│   ├── article-detail.js│   ├── articles.js│   ├── index.js│   ├── tags.js└── write    ├── articles.js    ├── index.js    └── tags.js
```

创建好后依次实现即可；

##### domain-util.js

```
const URI = require("urijs");/** * @param {Mixin} url 地址或 uri */const getHostName = function (uri) {  uri = new URI(uri);  return uri.hostname();};module.exports = {  getHostName,};
```

##### puppeteer-utils.js

```
let puppeteer = require("puppeteer");const cheerio = require("cheerio");const domainUtil = require("./domain-util");let browser;async function getHTML(uri, isAutoScrollToBottom = true) {  let page = await openPage(uri);  /** 自动滚动至页面底部，用于处理页面触底加载的情况   * @param {*} page page 对象   * @param {*} interval 间隔请求时间，尽可能趋近【被爬页面触底加载请求接口】的返回时间，但一定不要小于，不然就会出现爬取不完整的情况   */  async function autoScrollToBottom(page, interval = 3000) {    // Expose a function 这个用于客户端代码 debugger 避免源码映射失效的情况 //# sourceURL=__puppeteer_evaluation_script_    // 解决方案来源：https://stackoverflow.com/questions/65584989/debug-in-chromium-puppeteer-doesnt-populate-evaluate-script    // 这个 api 原意是侦听页面中触发的自定义事件，可见文档 https://www.qikegu.com/docs/4564    page.exposeFunction("nothing", () => null);    //   放在这里的函数会在客户端环境下执行 并且里面的内容和外层是隔绝的，这意味着外面的依赖、方法都不能使用    await page.evaluate(async (...args) => {      await new Promise((resolve, reject) => {        let totalHeight = 0;        function exec() {          totalHeight = document.body.scrollHeight;          // 1. 滚动到底部          window.scrollBy(0, totalHeight);          // 2. 等待 10s 判断页面高度有无变化          setTimeout(() => {            // 1. 变化了，则重复行为            if (document.body.scrollHeight > totalHeight) {              exec();            } else {              //   2. 没变化，则结束行为              resolve();            }          }, 3000);        }        exec();      });    });  }  if (isAutoScrollToBottom) {    await autoScrollToBottom(page);  }  // 获取页面完整 dom  let sum = await page.content();  const $ = cheerio.load(sum);  return $;}/** 打开一个无头浏览器 * * @param {*} opts * @returns */async function getPage(  opts = {    headless: false,    devtools: true,  }) {  if (!browser) {    browser = await puppeteer.launch(opts);  }  // 打开一个空白页  let page = await browser.newPage();  return page;}/** 打开一个无头浏览器 并跳转至指定地址 * @param {*} uri * @returns page 对象 */async function openPage(  uri,  opts = {    headless: false,    devtools: true,  }) {  let page = await getPage(opts);  //设置页面打开时的页面宽度高度  //   await page.setViewport({  //     width: 1920,  //     height: 1080,  //   });  // 在地址栏中输入百度的地址  await page.goto(uri, {    waitUntil: "networkidle2",  });  return page;}/** 为页面对象添加 cookies * @param {*} cookies * @param {*} page * @param {*} domain */const addCookies = async (page, cookies, domain) => {  if (typeof cookies === "string") {    cookies = cookies.split(";").map((pair) => {      let name = pair.trim().slice(0, pair.trim().indexOf("="));      let value = pair.trim().slice(pair.trim().indexOf("=") + 1);      return { name, value, domain };    });  }  await Promise.all(    cookies.map((pair) => {      return page.setCookie(pair);    })  );};/** * * @param {*} url * @param {*} cookies 自己的 cookies 支持数组和字符串形式 */async function login(url, cookies) {  let page = await getPage({    ignoreHTTPSErrors: true,    headless: false,    args: ["--no-sandbox", "--disable-setuid-sandbox"],  });  // const ps = await browser.pages();  // await ps[0].close();  await addCookies(page, cookies, domainUtil.getHostName(url)); //云盘域名  await page.setViewport({    //修改浏览器视窗大小    width: 1920,    height: 1080,  });  await page.goto(url, {    timeout: 600000,    waitUntil: "networkidle2",  });  return page;}async function click(page, select) {  await page.waitForSelector(select);  let node = await page.$(select);  node.click();}module.exports = {  getHTML,  openPage,  login,  click,};
```

##### reead/index.js

```
let { tags } = require("./tags");let { articles } = require("./articles");module.exports = {  tags,  articles,};
```

##### read/tags.js

```
const debug = require("debug")("juejin:task:read");const puppeteerUtils = require("../puppeteer-utils");function get(owner, props) {  if (owner) {    return owner[props];  } else {    return "";  }}exports.tags = async function (uri) {  debug("读取文章标签列表");  let $ = await puppeteerUtils.getHTML(uri);  let tags = [];  let domTags = $("li.item");  domTags.each((i, item) => {    let tag = $(item);    let image = tag.find("img.thumb").first();    let title = tag.find(".title").first();    let subscribe = tag.find(".subscribe").first();    let article = tag.find(".article").first();    let name = title.text().trim();    tags.push({      image: image.data("src") ? image.data("src").trim() : image.data("src"),      name,      url: `https://juejin.im/tag/${encodeURIComponent(title.text().trim())}`,      subscribe: get(Number(subscribe.text().match(/(\d+)/), [1])),      article: get(Number(article.text().match(/(\d+)/), [1])),    });    debug(`读取文章标签:${name}`);  });  return tags.filter((item) => item.name);};
```

##### read/article-detail.js

```
const debug = require("debug")("juejin:task:read-detail");const puppeteerUtils = require("../puppeteer-utils");async function readArticle(id, uri) {  debug("读取博文");  let $ = await puppeteerUtils.getHTML(uri, false);  let article = $(".main-container");  let title = article.find("h1").text().trim();  let content = article.find(".article-content").html();  // let tags = article.find(".tag-list-box>div.tag-list .tag-title");  // tags = tags.map((index, item) => {  //   let href = $(item).attr("href");  //   return href ? href.slice(4) : href;  // });  let tags;  // 获取 yuan  let metas = article.find("meta");  for (let index = 0; index < metas.length; index++) {    const meta = metas[index];    if (meta.attribs && meta.attribs.itemprop === "keywords") {      tags = meta.attribs.content;    }  }  tags = tags.split(",");  debug(`读取文章详情:${title}`);  return {    id,    title,    content,    tags,  };}module.exports = {  readArticle,};
```

##### read/article.js

```
const debug = require("debug")("juejin:task:read");const puppeteerUtils = require("../puppeteer-utils");const { readArticle } = require("./article-detail");function removeEmoji(content) {  return (content || "").replace(    /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g,    ""  );}exports.articles = async function (uri, maxNum = 0) {  let $ = await puppeteerUtils.getHTML(uri, false);  let articleList = [];  let items = $(".item .title");  let articleNum = maxNum || items.length;  for (let i = 0; i < articleNum; i++) {    let article = $(items[i]);    let href = article.attr("href").trim();    let title = article.text().trim();    let id = href.match(//(\w+)$/)[1];    href = "https://juejin.im" + href;    let articleDetail = await readArticle(id, href);    articleList.push({      href,      title: removeEmoji(title),      id,      content: removeEmoji(articleDetail.content),      tags: articleDetail.tags,    });    debug(`读取文章列表:${title}`);  }  return articleList;};
```

##### write/index.js

```
let { tags } = require("./tags");let { articles } = require("./articles");module.exports = {  tags,  articles,};
```

##### write/tags.js

```
const { query, end } = require("../../../db");const debug = require("debug")("juejin:task:write");exports.tags = async function (tagList) {  debug("保存文章标签列表");  // 这里在表设计中新增了一个索引，用于确定 tag 名称唯一  for (tag of tagList) {    let oldTags = await query(`SELECT * FROM tags WHERE name=? LIMIT 1 `, [      tag.name,    ]);    // oldTags = JSON.parse(JSON.stringify(oldTags));    if (Array.isArray(oldTags) && oldTags.length > 0) {      let oldTag = oldTags[0];      await query(`UPDATE tags SET name=?,image=?,url=? WHERE id=?`, [        tag.name,        tag.image,        tag.url,        oldTag.id,      ]);    } else {      await query(`INSERT INTO tags(name,image,url) VALUES(?,?,?)`, [        tag.name,        tag.image,        tag.url,      ]);    }  }};
```

##### write/articles.js

```
const { query, end } = require("../../../db");const debug = require("debug")("juejin:task:write");const sendMail = require("../../../mail");exports.articles = async function (articleList) {  debug("写入博文列表");  for (article of articleList) {    let oldArticles = await query(      `SELECT * FROM articles WHERE id=? LIMIT 1 `,      article.id    );    if (Array.isArray(oldArticles) && oldArticles.length > 0) {      let oldArticle = oldArticles[0];      await query(`UPDATE articles SET title=?,content=?,href=? WHERE id=?`, [        article.title,        article.content,        article.href,        oldArticle.id,      ]);    } else {      await query(        `INSERT INTO articles(id,title,href,content) VALUES(?,?,?,?)`,        [article.id, article.title, article.href, article.content]      );    }    //   先全部删除    await query(`DELETE FROM article_tag WHERE article_id=? `, [article.id]);    const where = "('" + article.tags.join("','") + "')";    const sql = `SELECT id FROM tags WHERE name IN ${where}`;    let tagIds = await query(sql);    // 再全部插入    for (row of tagIds) {      await query(`INSERT INTO article_tag(article_id,tag_id) VALUES(?,?)`, [        article.id,        row.id,      ]);    }    let tagIDsString = tagIds.map((item) => item.id).join(",");    // 在此，向所有订阅了此标签的用户发送邮件    let emailSQL = `      SELECT DISTINCT users.email from user_tag INNER JOIN users ON user_tag.user_id = user_id WHERE tag_id IN (${tagIDsString})    `;    let emails = await query(emailSQL);    for (let index = 0; index < emails.length; index++) {      const emailInfo = emails[index];      sendMail(        emailInfo.email,        `        您订阅的文章更新了      `,        `<a href="http:localhost:8080/detail/${article.id}">${article.title}</a>`      );    }  }};
```

第三步：将爬取到的数据在一个 web 应用中展示
------------------------

将爬取到的数据在一个 web 应用中展示；包含

node 服务功能扩展（基于 express）

*   支持静态资源请求：express.static
    
*   支持 post 文件上传请求：body-parser
    
*   支持登陆态：express-session
    
*   渲染引擎：ejs
    

![](https://mmbiz.qpic.cn/mmbiz_jpg/Tmczbd3NL02Vx1SialbIibFoTCNCf9BqR0F3LcS7CX4MgzduK8vmUUhdOUm9g7ibGicXWZKnNKaJkvQXce2ggBuHwA/640?wx_fmt=jpeg)img

### node 服务搭建

*   路由搭建
    

*   页面接口：首页（/）、登陆（/login）、文章详情页（/detail/:id）、订阅页（/subscribe）
    
*   数据接口：提交登陆（/login）、提交订阅（/subscribe）
    

*   页面实现
    
*   鉴权中间件实现
    

##### 路由搭建：入口文件 server.js

实现如下内容即可

```
let express = require("express");let bodyParser = require("body-parser");let session = require("express-session");let { checkLogin } = require("./middleware/auth");const path = require("path");const { query } = require("../db");const CronJob = require("cron").CronJob;const debug = require("debug")("crawl:server");const { spawn } = require("child_process");let app = express();app.use(express.static("web/public"));app.use(  bodyParser.urlencoded({    extends: true,  }));app.use(bodyParser.json());app.use(  session({    resave: true, // 每次都要重新保存 session    saveUninitialized: true, // 保存未初始化的 session    secret: "wzyan", // 指定密钥  }));app.use(function (req, res, next) {  res.locals.user = req.session.user;  next();});app.set("view engine", "html");app.set("views", path.resolve("web/views"));app.engine("html", require("ejs").__express);app.get("/", async function (req, res) {  let { tagId } = req.query;  let tags = await query(`SELECT * FROM tags`);  tagId = tagId || tags[0].id;  let articles = await query(    `SELECT a.* from articles a inner join article_tag  t on a.id = t.article_id WHERE t.tag_id =? `,    [tagId]  );  res.render("index", {    tags,    articles,  });});app.get("/login", async function (req, res) {  res.render("login", { title: "登录" });});app.post("/login", async function (req, res) {  let { email, password } = req.body;  let oldUsers = await query(`SELECT * FROM users WHERE email=?`, [email]);  let user;  if (Array.isArray(oldUsers) && oldUsers.length > 0) {    user = oldUsers[0];  } else {    let result = await query(`INSERT INTO users(email,password) VALUES(?,?)`, [      email,      password,    ]);    user = {      id: result.insertId,      email,      password,    };  }  // 如果登陆成功，就把当前的用户信息放在会话中，并重定向到首页  req.session.user = user;  res.redirect("/");});app.get("/subscribe", checkLogin, async function (req, res) {  let tags = await query(`SELECT * FROM tags`);  let user = req.session.user; //{id,name}  let selectedTags = await query(    `SELECT tag_id from user_tag WHERE user_id = ?`,    [user.id]  );  let selectTagIds = selectedTags.map((item) => item["tag_id"]);  tags.forEach((item) => {    item.subscribe = selectTagIds.indexOf(item.id) != -1 ? true : false;  });  res.render("subscribe", { title: "请订阅你感兴趣的标签", tags });});app.post("/subscribe", checkLogin, async function (req, res) {  console.log(req.body);  let { tags } = req.body; //[ '1', '2', '9' ] }  if (!tags) {    tags = [];  }  if (typeof tags === "string") {    tags = [tags];  }  function getNum(string) {    return string.replace(/[^0-9]/gi, "");  }  tags = tags.map((tag) => getNum(tag));  console.log(tags);  let user = req.session.user; //{id,name}  await query(`DELETE FROM user_tag WHERE user_id=?`, [user.id]);  for (let i = 0; i < tags.length; i++) {    await query(`INSERT INTO user_tag(user_id,tag_id) VALUES(?,?)`, [      user.id,      parseInt(tags[i]),    ]);  }  res.redirect("/");});app.get("/detail/:id", async function (req, res) {  let id = req.params.id;  let articles = await query(`SELECT * FROM articles WHERE id=? `, [id]);  res.render("detail", { article: articles[0] });});app.listen(8082);process.on("uncaughtException", function (err) {  console.error("uncaughtException: %s", err.stack);});
```

服务已经搭建完成了，就差一步啦，实现前端页面，冲！

![](https://mmbiz.qpic.cn/mmbiz_jpg/Tmczbd3NL02Vx1SialbIibFoTCNCf9BqR0EC9O63VqfxZp3DcDrfk9RQASKw54csiaz4rZic4zGFcUpunGVKdpdS5A/640?wx_fmt=jpeg)e1f7a1a7-82cc-4f47-a0d5-e7ebe5d32dc9.jpg

##### 页面实现：页面模板文件夹 views

页面都放在 views 中，目录结构如下

```
├── detail.html
├── header.html
├── index.html
├── login.html
└── subscribe.html
```

这里我们需要如下页面

*   index：首页
    
*   login：登陆页
    
*   header：顶部通用模块
    
*   detail：文章详情页
    
*   subscribe：订阅标签页
    

我们分别实现下，先实现首页

```
mkdir views && cd views && touch index.html && touch login.html touch header.html touch detail.html touch subscribe.html
```

然后实现如下内容

```
<%- include ('header.html')%><div class="container">  <div class="row">    <div class="col-md-2">      <ul class="list-group">        <%tags.forEach(tag=>{%>        <li class="list-group-item text-center">          <a href="/?tagId=<%=tag.id%>">            <img style="width: 25px; height: 25px" src="<%=tag.image%>" />            <%=tag.name%>          </a>        </li>        <%})%>      </ul>    </div>    <div class="col-md-10">      <ul class="list-group">        <%articles.forEach(article=>{%>        <li class="list-group-item">          <a href="/detail/<%=article.id%>"> <%=article.title%> </a>        </li>        <%})%>      </ul>    </div>  </div></div>
```

login 登陆页，实现如下内容

```
<%- include ('header.html')%><div class="row">  <div class="col-md-4 col-md-offset-4">    <form method="POST">      <input        type="email"        >提交</button>    </form>  </div></div>
```

header 登陆页，实现如下内容

```
<head>  <meta charset="UTF-8" />  <meta >      <!-- Brand and toggle get grouped for better mobile display -->      <div class="navbar-header">        <button          type="button"          class="navbar-toggle collapsed"          data-toggle="collapse"          data-target="#bs-example-navbar-collapse-1"          aria-expanded="false"        >          <span class="sr-only">Toggle navigation</span>          <span class="icon-bar"></span>          <span class="icon-bar"></span>          <span class="icon-bar"></span>        </button>        <a class="navbar-brand" href="#">博客列表</a>      </div>      <!-- Collect the nav links, forms, and other content for toggling -->      <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">        <ul class="nav navbar-nav">          <li><a href="/">首页</a></li>          <% if(user){ %>          <li><a href="/subscribe">订阅</a></li>          <%} else {%>          <li><a href="/login">登陆</a></li>          <%}%>        </ul>      </div>      <!-- /.navbar-collapse -->    </div>    <!-- /.container-fluid -->  </nav></body>
```

detail 登陆页，实现如下内容

```
<%- include ('header.html')%><div class="container">  <div class="row">    <div class="col-md-12">      <div class="panel">        <div class="panel-heading">          <h1 class="text-center"><%- article.title%></h1>        </div>        <div class="panel-body"><%- article.content%></div>        <div></div>      </div>    </div>  </div></div>
```

subscribe 登陆页，实现如下内容

```
<%- include ('header.html')%><style>    .tag {        display: flex;        flex-direction: column;        justify-content: center;        align-items: center;    }    .tag img {        width: 50px;        margin-bottom: 20px;    }</style><div class="row">    <form method="POST">        <input type="submit" class="btn btn-primary" />        <%            for(let i=0;i<tags.length;i++){                let tag = tags[i];                %>            <div class="col-md-3 tag">                <img src="<%=tag.image%>" />                <p>                    <%=tag.name%>                </p>                <p>                    <%=tag.subscribe%> 关注                         <%=tag.article%> 文章                </p>                <div class="checkbox">                    <label>                        <input <%=tag.subscribe? "checked": ""%> type="checkbox" > 关注                    </label>                </div>            </div>            <%}        %>    </form></div>
```

login 登陆页，实现如下内容

```
<%- include ('header.html')%><div class="row">  <div class="col-md-4 col-md-offset-4">    <form method="POST">      <input        type="email"        >提交</button>    </form>  </div></div>
```

##### 鉴权中间件实现：鉴权中间件

auth 鉴权中间件，在 web 目录下执行如下命令

```
mkdir middleware && touch auth.html
```

然后实现如下内容

```
function checkLogin(req, res, next) {  if (req.session && req.session.user) {    next();  } else {    res.redirect("/login");  }}module.exports = {  checkLogin,};
```

至此，我们就完成了用于数据展示的 node 服务搭建啦！

尾声
--

少年们，心法已定，拿走不谢，尝试动手自己实现下吧！希望可以帮到大家，爬虫虽好，不要过度哦。

![](https://mmbiz.qpic.cn/mmbiz_gif/Tmczbd3NL02Vx1SialbIibFoTCNCf9BqR09Y9D0l2lXzBZ660Ct9CYHzicQPFTKVia6P0lYLxhXr5NJdgZ377HQo8A/640?wx_fmt=gif)

送上参考资料，助君一臂之力

### 参考资料

##### 文档

*   w3cschool - Puppeteer 手册：https://www.w3cschool.cn/puppeteer/
    
*   Puppeteer 中文文档：https://www.mofazhuan.com/puppeteer-doc-zh
    
*   奇客谷教程：https://www.qikegu.com/docs/4525
    
*   阿里云社区 - Puppeteer APIv1.11 中文版：https://developer.aliyun.com/article/607102
    
*   F2E 中文文档：https://learnku.com/docs/puppeteer/3.1.0/class-elementhandle/8558
    
*   追风个人博客 missyou：http://blogs.lovemiss.cn/blogs/node/puppeteer/page.html#page-setcontent
    

##### 文章

*   记录一下 Node 结合 Puppeteer 爬虫经历：https://www.jianshu.com/p/0808b8117fd7
    
*   结合项目来谈谈 Puppeteer：https://zhuanlan.zhihu.com/p/76237595
    
*   Puppeteer 性能优化与执行速度提升：https://blog.it2048.cn/article-puppeteer-speed-up/
    

前往微医互联网医院在线诊疗平台，快速问诊，3 分钟为你找到三甲医生。(https://wy.guahao.com/?channel=influence)

![](https://mmbiz.qpic.cn/mmbiz_png/Tmczbd3NL02Vx1SialbIibFoTCNCf9BqR06x0LzFS48fuylU3cYs0RrHrrKDHDUBZuaStehOXFctCs8QMyLMZHOg/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_gif/Tmczbd3NL02Vx1SialbIibFoTCNCf9BqR0lsvq2UYOOiblwaHibRonMd5ibaFs92auiavgtUgSy5bfWhuyib02ic3CfaSQ/640?wx_fmt=gif)![](https://mmbiz.qpic.cn/mmbiz_png/Tmczbd3NL02Vx1SialbIibFoTCNCf9BqR0ac5ZM0Ok555JN6UZFTWP4eOIfltib4Ayz5icBA6tHvQiceJfFpStCjA7A/640?wx_fmt=png)