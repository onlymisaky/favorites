> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/o1lEljPCnrxqeX-I20E6pQ)

前言
--

对于各位前端开发者，SEO 是一个老生常谈的话题，尤其对于运营着自己的博客、网店、个人网站的开发者来说，SEO 是获取自然流量始终绕不开的话题。各大搜索引擎每天都会接收用户上亿次的搜索，是不可忽略的大流量入口，如何从这庞大的搜索流量中分一杯羹，是每一个站长都需要思考的问题。

本文将会具体结合西瓜热点详情页从 0 到 1 的 SEO 建设过程，为大家介绍作为 FE 业务方如何去学习了解、建设 SEO；本文不会就 SEO 的一些基础理论和搜索引擎算法进行深入探讨，而是希望从热点推广的视角介绍一些 SEO 方法。

基础概念
----

`SEO（Search Engine Optimization）` 中文译为「搜索引擎优化」。

简单地说，SEO 是指网站从自然搜索结果获得流量的技术和过程，复杂且较为严谨的定义如下：

SEO 是指在了解搜索引擎自然排名机制的基础上，对网站进行内部及外部的调整优化，改进网站在搜索结果页面上的关键词自然排名，以获得更多流量，从而达成网站销售及品牌建设的目标。

搜索引擎如何工作
--------

搜索引擎的工作过程大体可以分成三个阶段：

1.  **爬行和抓取**
    

搜索引擎蜘蛛通过跟踪链接发现和访问网页，读取页面 HTML 代码，存入数据库。

2.  **预处理**
    

索引程序对抓取来的页面数据进行文字提取、中文分词、索引、倒排索引等处理，以备排名程序调用。

3.  **排名**
    

用户输入查询词后，排名程序调用索引库数据，计算相关性，然后按一定格式生成搜索结果页面。

![](https://mmbiz.qpic.cn/mmbiz_png/v1qoyIrBu1mhX2eVTdpVWujn3e3SBGHWWsSSAbPcp1boezN5BKSYqucAhAGj8QWQT0uicpibxqbz0e6UIR7DNYNQ/640?wx_fmt=png)image.png

如何优化建设 SEO
----------

搜索引擎的工作流程主要涉及了 **2 个角色**——网站和搜索引擎，我们将第 3 个角色用户也加入其中后，就可以形成包含 3 个主要角色和 6 个核心环节的搜索生态模型。

主要围绕着这 6 个环节，我们将对网站逐步进行 SEO 的优化和建设：

![](https://mmbiz.qpic.cn/mmbiz_png/v1qoyIrBu1mhX2eVTdpVWujn3e3SBGHWQGG6QWutZJ1454wqTCC2KibqWdjVjTvYSibr7jGiceI6odjFaX6HicIkBw/640?wx_fmt=png)

### 抓取、收录

> 这里我不会按照上图的顺序先讲投放，因为投放在优化过程中其实属于后置位；在没有对网站本身结构进行优化，没有进行竞争分析（关键词选择）之前，你肯定不会轻易把网站大量投放出去吧？

网站的优化大致可以分为两部分：一是网站结构调整，二是页面优化。

我们的网站如果要顺利地被蜘蛛抓取和收录，很大程度上依赖于良好的网站结构。

#### 网站结构优化

##### 避免蜘蛛陷阱

*   Flash
    
*   各种跳转
    
*   JS 链接
    
*   要求登录
    

##### 设置 robots 文件

![](https://mmbiz.qpic.cn/mmbiz_png/v1qoyIrBu1mhX2eVTdpVWujn3e3SBGHWFDJxV74eNPzGcguJibLHyia0wytszqLWFsqjAZ4wJDibTJF4tDUd5rHKg/640?wx_fmt=png)

> **西瓜 M 站的 robots 文件**

robots 文件属于网站禁止抓取、索引机制的一部分，搜索引擎蜘蛛访问网站时，会先查看网站根目录下是否有一个 robots.txt 文本文件，它用于指定蜘蛛禁止抓取网站某些内容，或者允许抓取某些内容。

一些网站不存在 robots 文件时会返回 200 状态码和一些错误信息，而不是 404 状态码，这可能使搜索引擎蜘蛛错误解读 robots 文件信息，所以建议就算允许抓取所有内容，也要建一个空的 robots 文件，放在根目录下。

##### URL 设计

在设计网站页面的 URL 时尽量遵循下面几个原则：

*   越短越好
    
*   避免太多参数
    
*   目录层次尽量少
    
*   包含关键词（英文）
    
*   字母小写
    
*   连词符使用「-」分隔
    
*   使用 https
    

```
西瓜热点H5详情页之前的URL：
https://h5.ixigua.com/xigua_hot_spot/detail/?hotspotId=7095918215196318727

现在的URL：
https://m.ixigua.com/xigua_hot_spot/detail/7095918215196318727
更换域名 & URL静态化
```

我们针对之前西瓜热点 H5 详情页的 URL 进行了域名更换和 URL 静态化。

**域名更换**：M 站的域名拥有较高的权重（较长的域名年龄、收录页面总数多、特征关键词排名高等），将热点的域名更换至 M 站域名有利于我们的页面能够被搜索引擎收录，且在搜索排名上具有一定优势。

**URL 静态化** ：一般来说 URL 中有两三个参数，对于收录来说不会造成任何影响，但还是建议将 URL 静态化，既能提高用户体验，又能降低收录难度。

##### 网址规范化

网址规范化指的是搜索引擎挑选最合适的 URL 作为真正网址的过程。

那什么是不规范的网址呢？

举个例子，一般来说一个网站的首页 URL 应该是固定的，但在一些网站链接回首页时所使用的 URL 并不是唯一的，有时连到 https://www.xxx.com， 有时连到 http://www.xxx.com/index.html 。这样不规范化的网址会给搜索引擎造成困扰，可能造成权重分散、浪费爬取份额等问题。

解决方案：

*   百度站长平台中设置首选域名
    
*   使用 301 转向，将不规范化 URL 全部转向到规范化 URL
    
*   使用`canonical`标签
    

```
在HTML文件的head中加上这样一段代码：<link rel="canonical" href="https://m.ixigua.com/xigua_hot_spot/detail/7101281806032313356">表示这个网页的规范会网址应该是:https://m.ixigua.com/xigua_hot_spot/detail/7101281806032313356
```

#### 网站页面优化

##### 良好的 TDK

TDK 标签包括标题标签 title（T）、网站的描述标签 description（D），关键词标签 keywords（K），一般在搜索结果中，页面的 title 和 description 是最有可能被展示出来的。

在设置网站的 TDK 之前，还有一个重要的事情便是竞争分析和关键词研究，我们需要简单了解下为什么需要有这个步骤。

*   确保目标关键词有人搜索
    
*   降低优化难度
    
*   寻找有效流量
    
*   搜索多样性
    
*   发现新机会
    

**TDK** **通用标准：**

*   **Title 标题**
    

**标准格式** : 关键词 - 副关键词 | 品牌名

**长度建议** : 50 ~ 60 个字符

*   **Description 描述**
    

**长度建议**: 网页描述的长度任意，最佳实践长度在 155 ~ 160 个字符间之间，描述文本尽量使用**关键词**和**吸引用户的话术**，提升点击率（CTR）。

*   **Keyword 关键词**
    

这里的 keyword 不仅仅指的是 meta keywords，而是站点 / 文章 title / 视频描述中可以增加关键词

**长度建议**

*   主页关键词布局一般是核心词，以 5~10 个为宜。关键词之间用英文状态下的逗号或者下划线隔开，**搜索量大的在前，搜索量小的在后**，同个关键词不可以反复出现，以免堆积。
    
*   不同栏目设置不同的关键词。栏目页属于内页，所以关键词最好选择**长尾关键词**，并结合网站当前栏目名称选词，一般布局 3~5 个长尾关键词。
    
*   视频页主要布局的关键词是长尾关键词，1~2 个为宜，一定要和视频主题高度吻合。
    

举个🌰

![](https://mmbiz.qpic.cn/mmbiz_png/v1qoyIrBu1mhX2eVTdpVWujn3e3SBGHWsq6MoUo9GCINLI1I7Wjo1eD4Xwvz4icE5v98OBrEb0oNpWaDblj3bicw/640?wx_fmt=png)image.png

西瓜热点详情页是一个静态的 CSR 站点，这样的页面渲染方式是无法对页面的 TDK 进行定制化处理的。

![](https://mmbiz.qpic.cn/mmbiz_png/v1qoyIrBu1mhX2eVTdpVWujn3e3SBGHWHMW8Qx03TAU89MO75EiaQdQBXq1RiaEMB4zdpza6uibKV7ibZw99GScdAQ/640?wx_fmt=png)image.png

因此我选择采用模板引擎进行 TDK 定制化处理。

![](https://mmbiz.qpic.cn/mmbiz_png/v1qoyIrBu1mhX2eVTdpVWujn3e3SBGHWtFPp0yZE6OBAdkDjDBUM4P3gOMXwV0r3ibH4lXvyqdiafniahcr2V3F6A/640?wx_fmt=png)image.png

1.  **注入表达式：** 由于在编译运行时代码时会利用到 html 模板，并将编译得到的 js、css 文件从 html 模板中引入，所以我们可以预先在 html 模板中注入模板语言表达式来占位 TDK，{{title}}，{{description}}，{{keywords}}。
    

![](https://mmbiz.qpic.cn/mmbiz_png/v1qoyIrBu1mhX2eVTdpVWujn3e3SBGHWTVib5hLawf0pccfOJ2v2GTr3HtVc7iap5kIsZSNibzoXdscfpG76T2olQ/640?wx_fmt=png)

2.  **更改后缀：** 在运行时代码编译完成得到最终产物后，其中 html 文件中便会包含之前注入的模板表达式，此时将 html 文件后缀更改为模板语言后缀 (index.handlebars)。
    

3.  **Node 服务：** 在 router 拦截到对应路由请求时 (/xigua_hot_spot/detail/:hotspotId)，在 controller 中请求对应热点 id 的具体内容（标题、介绍）, 利用 ctx.render 将对应的变量传递给模板文件(index.handlebars) 并返回文件。
    

##### 正确使用 `HTML` 标签

*   `<a>`标签需要有 href 属性，减少使用 JS 跳转
    

![](https://mmbiz.qpic.cn/mmbiz_png/v1qoyIrBu1mhX2eVTdpVWujn3e3SBGHW6kRDmoibwGOJ1bVBhic0bQqCpaavAXunAaZzib1xoMpvIZfiaYGO8F0bMQ/640?wx_fmt=png)

*   `<img>`标签需要补全 `alt` 属性值
    

![](https://mmbiz.qpic.cn/mmbiz_png/v1qoyIrBu1mhX2eVTdpVWujn3e3SBGHWKvMzxTDNL2sTjlicbpwc5L8E3CNcf01x1f4vhIbWNpgH7Ok5iaKQgFCA/640?wx_fmt=png)

*   `<h1>`全局只能存在一个不要滥用，合理使用 `<h2><h3><h4>`此类标签
    

![](https://mmbiz.qpic.cn/mmbiz_png/v1qoyIrBu1mhX2eVTdpVWujn3e3SBGHWomAVJFicbhic0Z4Z8CvkguR6HHBT2lsHRLjJJqV8ibCc4CGicITKxDUBvQ/640?wx_fmt=png)

##### 性能优化

> 页面速度是重要的排名因素，也影响到爬虫的爬取效率。无论百度还是 Google 都已经有数次以页面打开速度为目标的算法更新

*   **优化页面耗时**
    

网站在搜索结果中的排名会受到页面打开速度的影响，例如百度在 2017 年 10 月推出闪电算法，针对页面的打开速度给予政策支持，页面的首屏加载速度越快往往会获得更高的排名以及更多的流量倾斜。谷歌也在 2021 年 6 月发布公告称，网页核心性能指标 (CLS、FID、LCP) 将被视为排名因素之一。

良好的首屏加载耗时不仅会受到搜索引擎的青睐，同时也能为浏览网站的用户提供更好的体验和服务。

*   **优化页面体积 (< 125** **kb** **)**
    

搜索引擎受限于自身的技术能力和计算资源，对于页面源码尺寸有限制（百度限制 128kb，Bing 限制 125kb），超过的部分会进行截断处理。

### 网页投放

#### 网站地图

通过网站地图，不仅用户可以对网站的结构和所有内容一目了然，搜索引擎也可以跟踪网站地图链接爬行到网站的所有主要部分；网站地图有两种形式，第一种被称为 HTML 版本网站地图，英文是 sitemap，另一种是 XML 版本网站地图，英文 Sitemap。

*   HTML 网站地图
    

![](https://mmbiz.qpic.cn/mmbiz_png/v1qoyIrBu1mhX2eVTdpVWujn3e3SBGHWxmcaxrrk1ib2iacrWlH3lic5fhb3y12ZEdOnicjwbu4DJ8DbuQvjeXIhEQ/640?wx_fmt=png) image.png

*   XML 网站地图
    

![](https://mmbiz.qpic.cn/mmbiz_png/v1qoyIrBu1mhX2eVTdpVWujn3e3SBGHW2DyMGpockIHkibGjGafgQCxfRBFpeOctyTz2VWVeEoLbDBtTvjFiacSQ/640?wx_fmt=png) image.png

#### API 推送

##### 概述

通过开放 API 接口将网页链接直接推送给搜索引擎，目前只有`百度`、`Google`、`Bing`三个搜索引擎支持该能力。

![](https://mmbiz.qpic.cn/mmbiz_png/v1qoyIrBu1mhX2eVTdpVWujn3e3SBGHWhHunx93VkR0WV2yABejzV8npluTPqSfyKlUsgRU46TPrTcyGAx3Y2A/640?wx_fmt=png)image.png

特点：速度快、权重高

相比于网站地图，API 推送网页链接可以使得搜索引擎更加快速地爬取和收录网页，并且搜索引擎会认为站长主动推送的链接可能会有更高的质量，适合于更新速率快、时效性高的网页。

##### 定时推送

热点事件的发生时机较为随机，且具有较强的时效性，为了能够让搜索引擎更加快速地爬取和收录西瓜热点页面，利用 Timer 触发器，定时将热点页面通过 API 推送给搜索引擎。

![](https://mmbiz.qpic.cn/mmbiz_png/v1qoyIrBu1mhX2eVTdpVWujn3e3SBGHWk2rgOczeErdVlIKA5EiaXfNXojciblCXylQWWgWng5CicCv5Qt0luTr3g/640?wx_fmt=png)image.png

##### 主动推送机器人

西瓜热点具有**重运营**的属性特点，热点的产生和推广与运营密切相关；从这点出发我思考能不能开发一个西瓜热点 SEO 相关的运营工具，当热点新鲜产生的时候，运营可以借助我的工具将该热点及时推送给搜索引擎，加快该热点被搜索引擎爬取收录的速度，获取更多的自然流量。

因此我开发了**西瓜热点** **SEO** **机器人**，利用飞书提供的企业机器人功能进行定制化开发，通过与机器人对话的形式，能够方便运营同学将新产生的热点快捷地进行推送。

![](https://mmbiz.qpic.cn/mmbiz_png/v1qoyIrBu1mhX2eVTdpVWujn3e3SBGHWPRlsNlRSJDHlLu8FEdwYXe10OXRBOQx40hGy4RBR9d1nG0GsvNHUdA/640?wx_fmt=png)image.png

#### 内链 / 友链投放

**内链**，就是在同一个网站中，内容页面之间相互链接，也就是网站内部的链接。好的内链布局合理，结构清晰，能提高搜索引擎对我们网站的收录和权重，是很重要的。内链还可以控制成本，提高索引效率，提升网站的排名，传递权重，最终提升流量。

![](https://mmbiz.qpic.cn/mmbiz_png/v1qoyIrBu1mhX2eVTdpVWujn3e3SBGHWE5xMju05uQDCzfdX1yltvpXnLPRVxCrIIMuqQvw7ANqScVsS93lWvQ/640?wx_fmt=png)image.png

**外链**，就是别的网站导入自己网站的链接，即可以通过其他地方进我们网站，外链的作用有很多，不单单只是提高网站的权重，也可以提高某个关键词的排名，一个高质量的外链可以为我们的网站带来更多流量。

![](https://mmbiz.qpic.cn/mmbiz_png/v1qoyIrBu1mhX2eVTdpVWujn3e3SBGHWHiajgdWOZ9KAaTFCWsDcPibxibx8iawFPKANuxghCDVGYum6JRdBP0FibfQ/640?wx_fmt=png)image.png

### 排名 / 点击

#### 结构化数据

结构化数据，是一种提供网页相关信息并对网页内容进行分类的标准化格式，换句话说，就是搜索引擎使用的语义词汇代码语言。

这种代码可以帮助谷歌理解页面内容。同时，Google 搜索也会利用这种代码语言（结构化数据）启用特殊的搜索结果功能和增强功能，丰富搜索结果展示。

![](https://mmbiz.qpic.cn/mmbiz_png/v1qoyIrBu1mhX2eVTdpVWujn3e3SBGHW7iatd7ibspZNFApsibjYdlamhXS4JwibSh6wsIaiaPJWdWDkg3Miakdz6t8Q/640?wx_fmt=png)

```
<script type="application/ld+json" id="scriptTag" nonce="-_vD_w5o44pwi2zXVWL8EA" class="style-scope ytd-player-microformat-renderer">{ "@context": "https://schema.org","@type": "VideoObject","description": "《三体》完整合集浓缩版，真.完结撒花！增加了一些内容，修正了一些内容，删除了一些内容。片尾有彩蛋嘿嘿~\n希望你们喜欢。\n\n#三体 #名侦探拳头 #科幻","duration": "PT4560S","embedUrl": "https://www.youtube.com/embed/QO25QnboJG0","interactionCount": "7714441","name": "【三体解说】76分钟看完《三体》全集。宇宙很大，生活更大。【名侦探拳头】","thumbnailUrl": [ "https://i.ytimg.com/vi/QO25QnboJG0/maxresdefault.jpg"] ,"uploadDate": "2019-06-02","genre": "People & Blogs","author": "名侦探拳头"}</script>
```

除了谷歌的结构化数据外，我们在百度也会看到一些图文展现格式，在说明文字的左侧放上一张图片。

![](https://mmbiz.qpic.cn/mmbiz_png/v1qoyIrBu1mhX2eVTdpVWujn3e3SBGHWsDUSHZVjWGribTH5enaJLRfCRNbg3xmicVrZVIOXPpdqGnicq5yR4bOgw/640?wx_fmt=png)

列表左侧的图片来源有两个，大部分情况下是从页面本身选取的，从百度官方介绍和经验来看，被选取的图片需要满足这些条件：

*   图片与页面内容相关
    
*   足够清晰
    
*   足够尺寸，像素 121 x 75 以上
    
*   横跨比例适当，大致为 121:75 左右
    
*   正常 IMG 标签图片，不是背景层
    

需要注意的是，就算满足了以上这些条件，页面在搜索结果中可能还是展现不出图片 (百度辣鸡)，这跟百度自身的策略和算法相关，它也会更倾向于把资源分配给自家的产品 (好看视频、百家号等)。

图文展现这种形式非常直观，可以提高用户体验，使用户更容易快速判断页面内容，对页面吸引视线、提高点击率有明显作用。

#### 关联百度热搜词

我们在使用百度搜索引擎的时候，经常会在首页或者搜索结果也的左侧看到一个「百度热搜」。

![](https://mmbiz.qpic.cn/mmbiz_png/v1qoyIrBu1mhX2eVTdpVWujn3e3SBGHWXmWmuLVEFpHwpuibmOuIDdETjgiaLPrCX3hDAJENGoNBFhmnicuOjGuPA/640?wx_fmt=png)image.png

我们点击其中一个热点后，会进入该热点的搜索结果页，并且在搜索结果的最上方聚合展示有关该热点的相关资讯网页，可以发现网页标题中包含热搜词的页面的搜索结果往往会获得较高的排名，例如下图「韩国主帅赛后怒斥裁判被红牌驱逐」这个热搜词，我们能看到排名较前的几个搜索结果中都包含了该热搜词。

![](https://mmbiz.qpic.cn/mmbiz_png/v1qoyIrBu1mhX2eVTdpVWujn3e3SBGHWh7ZUD9dxQ4Z4nIXCX4aA32YITR60ZKhBibLVGJgKLzq0XYutFRVAicMA/640?wx_fmt=png)

基于这样的推断，我思考能否通过将西瓜热点中与百度热搜词中相关联的内容进行联动，当百度爬虫爬取西瓜热点页面时，判断百度热搜词中是否有与该西瓜热点相近的内容，通过替换西瓜热点的标题来达到在百度搜索中提升排名的目的。

![](https://mmbiz.qpic.cn/mmbiz_png/v1qoyIrBu1mhX2eVTdpVWujn3e3SBGHWQSR35lDax1eqibzUicheJl9bhLKtcaOjS0iaRjUXIcdqtJ2b8ZH9HibJuQ/640?wx_fmt=png)image.png

### 数据监控

#### 爬虫行为监控

收集爬虫日志，了解爬虫的行为变化可以在流量变化前更加灵敏得反应页面 SEO 的状态

新上 SEO 功能后，可以通过爬虫日志来灵敏得判断功能的影响

#### 索引量监控

1.  通过各个平台自带的站长平台，可以看到索引量的变化（有些平台更新可能不是很及时）
    

2.  通过`site: m.ixigua.com` 语句，可以查询索引的数据
    
    ![](https://mmbiz.qpic.cn/mmbiz_png/v1qoyIrBu1mhX2eVTdpVWujn3e3SBGHWxbCic5kg5Ow8w9RH3YEVh8JmNx8XyKNqyA6SRpGmicl4g2dllGqwXBPA/640?wx_fmt=png)
    
    分页面的索引，使用`inurl:/xigua_hot_spot site:m.ixigua.com`语句
    
    ![](https://mmbiz.qpic.cn/mmbiz_png/v1qoyIrBu1mhX2eVTdpVWujn3e3SBGHWsyicg2Rh1hs9QqACeLia1zbYIMTcibia0jMpQjT2w9mibwX6tHniamYUXtHg/640?wx_fmt=png)
    

3.  SEMrush
    

一个 SEO 工具，可以在谷歌插件市场中下载安装，功能是展示当前站点的 SEO 相关数据，同时包含了索引量、外链量、内链量等相关数据。

#### 排名监控

1.  搜素引擎自带的监控
    

*   百度站长：https://ziyuan.baidu.com/keywords/index
    
*   谷歌：https://search.google.com/search-console
    

2.  通过脚本收集相关页面在指定搜索关键词下的排名情况
    

结语
--

SEO 真的是一个非常神奇的东西，它既有迹可循，又异常复杂（玄学），更多情况下需要的是一种经验的积累（AB 实验一定程度上可以缓解）。

本文主要涵盖了我这段时间以来的 SEO 优化经验，但依然只是 SEO 的冰山一角，再加上 SEO 不再局限于 Web 端，在 APP 端内也在不断兴起，要彻底探明掌握它的奥秘还是任重道远。

要做好 SEO 最根本的还是需要网站内容是丰富的、有价值的，没有好的内容作为基础，SEO 的价值也会被减损。

希望我的经验和积累能够给大家带来一些启发。

关于我们
----

我们来自字节跳动，是旗下西瓜视频前端部门，负责西瓜视频的产品研发工作。

我们致力于分享产品内的业务实践，为业界提供经验价值。包括但不限于营销搭建、互动玩法、工程能力、稳定性、Nodejs、中后台等方向。

欢迎关注我们的公众号：xiguafe，阅读更多精品文章。

![](https://mmbiz.qpic.cn/mmbiz_jpg/v1qoyIrBu1mhX2eVTdpVWujn3e3SBGHWHaJxgicVicjCLSn8OkdIyymuzZftlwPEXOeOU9ogqQaBDdMffCOwIWNg/640?wx_fmt=jpeg)

我们在招的岗位：https://job.toutiao.com/s/h2hRpAo。招聘的城市：北京 / 上海 / 厦门。

**欢迎大家加入我们，一起做有挑战的事情！**

谢谢你的阅读，希望能对你有所帮助，欢迎关注、点赞~

- END -