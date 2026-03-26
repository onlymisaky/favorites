> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/6cl-GGUw3dIGDis5KPb9AA)

最近在鱼皮的编程导航星球做嘉宾，需要输出一些内容。

而很多内容我之前写过，所以想复制过来。

这时候我就遇到了一个令人头疼的问题：

知识星球的编辑器也太难用了！

比如我在掘金编辑器里这样的 markdown 内容：

![](https://mmbiz.qpic.cn/mmbiz_gif/YprkEU0TtGjbnGKxRNzRO6alwSNEuQ7CUJNg1jWAwbBkzaevyfZhuc8PNXo5BOeCLckQmtxicXibkTjoCXFic664g/640?wx_fmt=gif)

复制到星球编辑器是这样的：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGjbnGKxRNzRO6alwSNEuQ7Cp92cTahicGS7ibI30nbeMyxItXiaNx5icIK83xND35evT7TlHx7BuoDb2Q/640?wx_fmt=png)

markdown 语法是识别了，但图片没有自动上传。

如果用富文本格式，格式又不对：

![](https://mmbiz.qpic.cn/mmbiz_gif/YprkEU0TtGjbnGKxRNzRO6alwSNEuQ7CKJnkAdAwVQW83ONgDWia6H1bjMwj62ictc9wpIeuIiaaVQLQJmqTIoib9Q/640?wx_fmt=gif)

而且 gif 没有识别出来，还是需要手动传一次。

这意味着如果文中有几十张图片，那我需要单独把这几十张图片保存到本地，然后光标定位到对应位置，点击上传图片，把图片插进去。

也就是这样：

![](https://mmbiz.qpic.cn/mmbiz_gif/YprkEU0TtGjbnGKxRNzRO6alwSNEuQ7Cu945YMe9mvfp7AITicT9lofnt1dhicapMabZD1CvnSib88l1BBxyKjmqw/640?wx_fmt=gif)![](https://mmbiz.qpic.cn/mmbiz_gif/YprkEU0TtGjbnGKxRNzRO6alwSNEuQ7CzM2Hy6IJwz2icZd7GIMegbnCOkM9tdjaSSK4Vhbibib9z3U7ub6LBpovA/640?wx_fmt=gif)

把每个图片下载下来，保存为不同的后缀名（png、jpg、gif），然后再定位到对应位置，删除原来的链接，插入图片。

然后这样重复十几次，每篇文章都这样来一遍。

是不是想想都觉得很痛苦。。。

那有什么好的办法解决这个问题呢？

于是我想到了 puppeteer。

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGjbnGKxRNzRO6alwSNEuQ7CvIdbHV5lP0mB9cUic4RKtY0Lb5H3g8F1PEicuUkAe5lBwoceJ05ibUxkQ/640?wx_fmt=png)

它是一个网页自动化的 Node.js 工具，基本所有你手动在浏览器里做的事情，都可以用它来自动化完成。

比如点击、移动光标、输入等等。

那前面那个繁琐的问题自然也可以用 puppeteer 自动化来做，解放我们的生产力。

我们来分析下整个流程：

首先打开星球编辑器页面，如果没登录会跳到登录页：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGjbnGKxRNzRO6alwSNEuQ7COeggTpC3DJWkAvicQVv2njrIjffVqmz6zDVB3oIicU32GdOUJicKIv7DA/640?wx_fmt=png)

这一步要扫码，没法自动化。

登录之后进入编辑器页面，输入内容：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGjbnGKxRNzRO6alwSNEuQ7CYHh78cB2b0kfsEnlVGobf85M2pcYXZZVuOOiaet8p50KKCpnjynphqA/640?wx_fmt=png)

这时候我们要把其中的图片链接分析出来，自动下载到本地的目录中。

然后记录每个链接所在的行数，把光标移动到对应的行数，点击上传按钮：

![](https://mmbiz.qpic.cn/mmbiz_gif/YprkEU0TtGjbnGKxRNzRO6alwSNEuQ7CcI1xb13oY8eiaN5verGdiaVagnPql9dB3oYQnoiay7UW0HV5beBtQ7kPA/640?wx_fmt=gif)

上传这一步也要手动来做，选择之前自动下载的图片就行。

然后光标会自动移动到下一个位置，再点击上传按钮，直到所有图片上传完。

文件浏览器这一步是操作系统的功能，没法自动化。

我们把下载图片、在对应位置插入图片的过程给自动化了。只有登录、选择文件这两步还要还要手动做。

但这样已经方便太多了。

流程理清了，我们就来写下代码吧：

```
import puppeteer from 'puppeteer';const browser = await puppeteer.launch({    headless: false,    defaultViewport: {        width: 0,        height: 0    }});const page = await browser.newPage();await page.goto('http://www.baidu.com');await page.focus('#kw');await page.keyboard.type('hello', {    delay: 200});await page.click('#su');
```

引入 puppeteer，跑一个 chrome 浏览器，创建一个页面，导航到 baidu，输入 hello，点击搜索。

puppeteer 的 api 还是很容易懂的。

其中 defaultViewport 设置宽高为 0 是让网页充满整个窗口。

然后我们把它跑起来，因为用到了 es module、顶层 await，需要在 package.json 声明 type 为 module：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGjbnGKxRNzRO6alwSNEuQ7C5v2uKicRcFyjVGWKYFIQZAdvlRMNZUSH8K0ERGf5LtCkL8yk413nr3w/640?wx_fmt=png)

声明 type 为 module 就是所有的模块都是 es module 的意思。

然后把它跑起来：

![](https://mmbiz.qpic.cn/mmbiz_gif/YprkEU0TtGjbnGKxRNzRO6alwSNEuQ7C48h2RP57ABmhjiaZu7T3edLFlXhK3LWQicOibDbLPuPNlnGicUn2opdm8A/640?wx_fmt=gif)

可以看到脚本正确执行了。

然后我们让它打开星球编辑器的网址：

```
import puppeteer from 'puppeteer';const browser = await puppeteer.launch({    headless: false,    defaultViewport: {        width: 0,        height: 0    }});const page = await browser.newPage();await page.goto('https://wx.zsxq.com/dweb2/article?groupId=51122858222824');
```

确实跳到登录了：

![](https://mmbiz.qpic.cn/mmbiz_gif/YprkEU0TtGjbnGKxRNzRO6alwSNEuQ7CIw57QjVfAAcXLIsFEPHHK83Bu1qecXj8X1XdH4JyAYke6flwWK1mjg/640?wx_fmt=gif)

扫码登录之后进入星球页面，就可以写文章了。

![](https://mmbiz.qpic.cn/mmbiz_gif/YprkEU0TtGjbnGKxRNzRO6alwSNEuQ7Cxibd8kSU8fiawCE2cU9QRLOwyGVKM70RiaibG8lhSQYZZ8WyLKPCDD7TJQ/640?wx_fmt=gif)

但是，下次跑脚本还是要再登录。

我们不是登录过了么？为啥还需要登录？

因为 chrome 默认的数据保存在一个目录中，叫 userDataDir，而这个目录默认是临时生成的，所以每次保存数据的目录都不一样。

这就导致了每次都需要登陆。

所以我们指定一个固定的 userDataDir 就好了。

```
import puppeteer from 'puppeteer';import os from 'os';import path from 'path';const browser = await puppeteer.launch({    headless: false,    defaultViewport: {        width: 0,        height: 0    },    userDataDir: path.join(os.homedir(), '.puppeteer-data')});const page = await browser.newPage();await page.goto('https://wx.zsxq.com/dweb2/article?groupId=51122858222824');
```

通过 os.homedir() 拿到 home 目录，再下面新建一个 .puppeteer-data 的目录来保存用户数据。

这样登录一次之后，下次就不再需要登录了：

![](https://mmbiz.qpic.cn/mmbiz_gif/YprkEU0TtGjbnGKxRNzRO6alwSNEuQ7Cl6p2AYQibicOEo56jBn2kMD300jg7wQnMsJFibohjWxAdkXGAC0nKWiauw/640?wx_fmt=gif)

这时候可以看到 userDataDir 下是保存了用户数据的：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGjbnGKxRNzRO6alwSNEuQ7C6icibibFQ2LQvgWGU4CwiayebKeLXj4YCJQEGMlLgyvGvMwDr8iagmhYrEA/640?wx_fmt=png)

接下来就是编辑部分的自动化了。

我们要做的事情有这么两件：

*   提取文本中的所有链接，自动下载。
    
*   光标定位到每个链接的位置，自动点击上传按钮。
    

执行这俩自动化脚本的过程最好让用户控制，比如输入 download-img 就自动下载图片，输入 upload-next 光标就自动定位到下个位置，点击上传。

所以我们引入 readline 这个内置模块接收用户输入。

```
import readline from 'readline';const rl = readline.createInterface({    input: process.stdin,    output: process.stdout});rl.on('line', async (command) => {    switch(command) {        case 'upload-next':             await uploadNext();            break;        case 'download-img':            await downloadImg();            break;        default:            break;    }});async function uploadNext() {    console.log('------');}async function downloadImg() {    console.log('+++++++');}
```

调用 creatInterface api，指定 input、output 为标准输入输出。

然后当收到一行的输入的时候，根据内容决定执行什么方法：

![](https://mmbiz.qpic.cn/mmbiz_gif/YprkEU0TtGjbnGKxRNzRO6alwSNEuQ7CpNKd5Hkyf170jeGDec4V7jhyXdp5WWjtgWBNZ9oJob7tCIkA3xwrGg/640?wx_fmt=gif)

我们先实现 download-img 的部分：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGjbnGKxRNzRO6alwSNEuQ7CfbJMrsomN3RtKDuNdnjZkTQ9eUqXQOyNmR8LAx7bNHSPNNDMPvQTicw/640?wx_fmt=png)

可以看到，编辑器部分的内容就是 .ql-editor 下的一个个 p 标签。

那我们只要取出所有的 p 标签，选出 ![]() 格式的内容就好了。

这需要一个正则，我们先把这个正则写出来：

整体格式是这样的：

```
![]()
```

但 [] 和 () 需要转义:

```
!\[\]\(\)
```

中间部分是除了 [] 和 () 的任意字符出现任意次，也就是这样：

```
[^\[\]\(\)]*
```

并且 () 里的内容需要提取，需要用小括号包裹。

完整正则就是这样的：

```
!\[[^\[\]\(\)]*\]\(([^\[\]\(\)]*)\)
```

我们测试下：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGjbnGKxRNzRO6alwSNEuQ7CNHib6CsVrBry1niaZFlibeFKVjjD7z8WfDia5NvQIfpSwczCGTaO5oC1jw/640?wx_fmt=png)

可以看到 () 中的内容被正确提取出来了。

然后在网页里取出所有的 p 标签，根据内容过滤，把链接和行数记录下来：

```
const links = await page.evaluate(() => {    let links = [];    const lines = document.querySelectorAll('.ql-editor p');    for(let i = 0; i < lines.length; i ++) {        const matchRes =lines[i].textContent.trim().match(/!\[[^\[\]\(\)]*\]\(([^\[\]\(\)]*)\)/)        if (matchRes) {            links.push({                index: i,                link: matchRes && matchRes[1],            });        }    }    return links;})
```

用 page.evaluate 方法在网页里远程执行一段 js，拿到它的返回结果。

这里拿到的就是所有的图片链接：

![](https://mmbiz.qpic.cn/mmbiz_gif/YprkEU0TtGjbnGKxRNzRO6alwSNEuQ7CWRkiaQnBLSLS9QWOBicFGKPDHoIlnuSDMJGXCLyJ58yVktt2LBADwbeA/640?wx_fmt=gif)

其实严格来说这不叫行数，而是第几个 p 标签，想要定位到对应的 p 标签，只要点击它就好了。

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGjbnGKxRNzRO6alwSNEuQ7CeB6HJCSDNEsiahQRicRyHIbENZwvqz4XHtIK5m5NZrMUPibgmOHJIAsGw/640?wx_fmt=png)

我们记录的下标是从 0 开始，而 nth-child 从 1 开始，所以要加 1。

可以看到，光标定位到了正确的位置：

![](https://mmbiz.qpic.cn/mmbiz_gif/YprkEU0TtGjbnGKxRNzRO6alwSNEuQ7CzIVoHKMdPWKF8sqLlVSst59jvIOJAIFhibpfCc6hhgwCibleDVBf4IuA/640?wx_fmt=gif)

不过先不着急定位光标，我们先把图片下载给搞定。

下载部分的代码如下：

```
import https from 'https';import fs from 'fs';function downloadFile(url, destinationPath, progressCallback) {    let resolve , reject;    const promise = new Promise((x, y) => { resolve = x; reject = y; });    const request = https.get(url, response => {        if (response.statusCode !== 200) {            const error = new Error(`Download failed: server returned code ${response.statusCode}. URL: ${url}`);            response.resume();            reject(error);            return;        }        const file = fs.createWriteStream(destinationPath);        file.on('finish', () => resolve ());        file.on('error', error => reject(error));        response.pipe(file);        const totalBytes = parseInt(response.headers['content-length'], 10);        if (progressCallback)            response.on('data', onData.bind(null, totalBytes));    });    request.on('error', error => reject(error));    return promise;    function onData(totalBytes, chunk) {        progressCallback(totalBytes, chunk.length);    }}
```

用 https 模块的 get 方法请求 url，然后把 response 用流的方式写入文件，并且通过 content-length 的响应头拿到总长度。

这样，在每次 data 方法里就能根据总长度，当前 chunk 的长度，算出下载进度。

我们测试下：

```
const url = 'https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/66399947ea6b45289c8d77b6d4568cc5~tplv-k3u1fbpfcp-watermark.image'let currentTotal = 0;downloadFile(url, './1.gif', (totalBytes, chunkBytes) => {    const percent = (currentTotal/totalBytes * 100).toFixed(1);    console.log('总长度：' + totalBytes + 'B', '当前已下载：' + currentTotal + 'B','进度' + percent + '%');            currentTotal += chunkBytes;})
```

![](https://mmbiz.qpic.cn/mmbiz_gif/YprkEU0TtGjbnGKxRNzRO6alwSNEuQ7CALGp98zOibcSxgv9v5pEYUDtQCGTDmURp5XvYBAlAEv95BWKd6Iqwgw/640?wx_fmt=gif)

可以看到，图片下载成功了！

但是，我们现在是知道这是个 gif 才给它加上 .gif 后缀，要是任意一个链接，怎么知道它的格式呢？

这个可以用 image-size 这个包：

```
import sizeOf from 'image-size';import fs from 'fs'; const buffer = fs.readFileSync('./1.image');const dimensions = sizeOf(buffer);console.log(dimensions);
```

它能拿到图片的类型和宽高信息：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGjbnGKxRNzRO6alwSNEuQ7CoaFFoyFyA4JPEVRCSqkfH3ibp5fCpShSC9RibwGtLEgI8wyj7ZOZG9Yw/640?wx_fmt=png)

这样我们在下载完改下名就可以了。

```
const url = 'https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/66399947ea6b45289c8d77b6d4568cc5~tplv-k3u1fbpfcp-watermark.image'let currentTotal = 0;let filePath = './1.image';downloadFile(url, filePath, (totalBytes, chunkBytes) => {    const percent = (currentTotal/totalBytes * 100).toFixed(1);    console.log('总长度：' + totalBytes + 'B', '当前已下载：' + currentTotal + 'B','进度' + percent + '%');            currentTotal += chunkBytes;        if(currentTotal >= totalBytes) {        const {type} = sizeOf(fs.readFileSync(filePath));        fs.renameSync(filePath, filePath +  '.' + type)    }})
```

当下载完之后，拿到图片信息，重命名一下，把后缀名改成新的。

注意下图中文件名字的变化：

![](https://mmbiz.qpic.cn/mmbiz_gif/YprkEU0TtGjbnGKxRNzRO6alwSNEuQ7CrfZiaDqShwicUM8mQOZialoUXGZVXUlJmeXY9eVSAxBINboFNHgCklaAA/640?wx_fmt=gif)

  

这样，下载图片就搞定了。

我们把它集成到自动化流程中。

先指定下文件保存位置和文件名：

我们在 home 目录下创建一个 .img 目录吧，然后文件名是 1.image、2.image 的形式。

```
const imgPath = path.join(os.homedir(), '.img');fs.rmSync(imgPath, {    recursive: true});fs.mkdirSync(imgPath);for(let i = 0; i< links.length; i++) {    const filePath = path.join(imgPath, (i+1) + '.image');    fs.writeFileSync(filePath, 'aaaa')}
```

![](https://mmbiz.qpic.cn/mmbiz_gif/YprkEU0TtGjbnGKxRNzRO6alwSNEuQ7CENxdvbS6XOwibWHuS2edm6G4mzgH10hsH4UjGiau8PicqnAMibBibLxHoFQ/640?wx_fmt=gif)

每次先清空 .img 目录，再创建。

执行之后，确实在 .img 目录下创建了对应的图片文件：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGjbnGKxRNzRO6alwSNEuQ7CeOBvdxZ6CibOria7N2T62mQSCCpbMS2Zeia02wSY6icblWV6Qudoeup1IQ/640?wx_fmt=png)

然后把下载图片和重命名的逻辑集成进来：

```
fs.rmSync(imgPath, {    recursive: true});fs.mkdirSync(imgPath);for(let i = 0; i< links.length; i++) {    const filePath = path.join(imgPath, (i+1) + '.image');    let currentTotal = 0;    downloadFile(links[i].link, filePath, (totalBytes, chunkBytes) => {        currentTotal += chunkBytes;        if(currentTotal >= totalBytes) {            setTimeout(() => {                const {type} = sizeOf(fs.readFileSync(filePath));                fs.renameSync(filePath, filePath +  '.' + type)                console.log(`${filePath} 下载完成，重命名为 ${filePath +  '.' + type}`);            }, 1000);        }    })}
```

这里加了一个 setTimeout，1s 之后执行重命名的逻辑，保证在文件下载完之后再重命名。

效果是这样的：

![](https://mmbiz.qpic.cn/mmbiz_gif/YprkEU0TtGjbnGKxRNzRO6alwSNEuQ7CLxkTXpLd3H00bS4sdMiaAp356vEuEaK52n0XbIxiatYKXXLK8qjydmMg/640?wx_fmt=gif)

在 .img 下可以看到所有的图片都下载并重命名成功了：

![](https://mmbiz.qpic.cn/mmbiz_gif/YprkEU0TtGjbnGKxRNzRO6alwSNEuQ7CrZT5Y1cU91YrnWV5zXDVBpic3orgTxPJALibFibicx6kmQ9ha05DIasVHw/640?wx_fmt=gif)

有 png 也有 gif

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGjbnGKxRNzRO6alwSNEuQ7CjOPiaLyhwm9T4orUzibvRKCZUjjIl1en3eXt5TmDD39iaSicKTDfB5lQiaQ/640?wx_fmt=png)

下一步只要在不同的位置插入就好了。

我们再来做光标定位的部分。

这部分前面演示过，就是触发对应 p 标签的 click 就好了。

```
let cursor = 0;async function uploadNext() {    if(cursor >= links.length) {        return;    }    await page.click(`.ql-editor p:nth-child(${links[cursor].index + 1})`);    await page.evaluate((index) => {        const p = document.querySelector(`.ql-editor p:nth-child(${index + 1})`);        p.textContent = '';    }, links[cursor].index);    await page.click('.ql-image');    cursor ++;    }
```

我们定义一个游标，从 0 开始，先点击第一个 link 的 p 标签，把它的内容清空，插入下载的图片。

然后再次执行就是插入下一个。

这样依次插入。

我们来试试：

首先，打开编辑器页面，自己登录和输入 markdown 内容：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGjbnGKxRNzRO6alwSNEuQ7C6Kg79icbuwmJY5FBwOAwfHDibZz9mf6d424mNNNxnCzuSOciazxqOD76Q/640?wx_fmt=png)

然后输入 download-img 来下载图片：

![](https://mmbiz.qpic.cn/mmbiz_gif/YprkEU0TtGjbnGKxRNzRO6alwSNEuQ7Cn2PX5dzwBsRKfP3ygSQOPQibOggqib2mwG1mHBsm85F0fwZxyNmB6LEw/640?wx_fmt=gif)

之后执行 upload-next 插入第一张图片：

![](https://mmbiz.qpic.cn/mmbiz_gif/YprkEU0TtGjbnGKxRNzRO6alwSNEuQ7Cj6Zo1EBL305p33sjGEEszcTZraTQtP3QicbgvXREoZY51BzylygORYA/640?wx_fmt=gif)

再执行 upload-next 插入第二张图片：

![](https://mmbiz.qpic.cn/mmbiz_gif/YprkEU0TtGjbnGKxRNzRO6alwSNEuQ7Cj6Zo1EBL305p33sjGEEszcTZraTQtP3QicbgvXREoZY51BzylygORYA/640?wx_fmt=gif)

插入的位置非常正确！

![](https://mmbiz.qpic.cn/mmbiz_gif/YprkEU0TtGjbnGKxRNzRO6alwSNEuQ7CMp48FEhM8iawdhqaJ3PNFvp4v01H1iaZcoJUVK5x4Ekg9Ry80I4xTwLQ/640?wx_fmt=gif)

依次 upload-next 就能把所有图片插入完成。

对比下之前的体验：

一张张下载图片，根据不同的格式来重命名，然后一张张找到对应的位置，删除原来的链接，插入图片。

现在的体验：

输入 download-img 自动下载图片，不断执行 upload-next 选择图片，自动插入到正确的位置。

这体验差距很明显吧！

这就是用 puppeteer 自动化以后的工作流。

演示视频：

[视频详情](javascript:;)

全部代码如下：

```
import puppeteer from 'puppeteer';import os from 'os';import path from 'path';import fs from 'fs';import readline from 'readline';import sizeOf from 'image-size';import downloadFile from './download.js';const browser = await puppeteer.launch({    headless: false,    defaultViewport: {        width: 0,        height: 0    },    userDataDir: path.join(os.homedir(), '.puppeteer-data')});const page = await browser.newPage();await page.goto('https://wx.zsxq.com/dweb2/article?groupId=51122858222824');const rl = readline.createInterface({    input: process.stdin,    output: process.stdout  });rl.on('line', async (command) => {    switch(command) {        case 'upload-next':             await uploadNext();            break;        case 'download-img':            await downloadImg();            break;        default:            break;    }});let links = [];async function downloadImg() {    links = await page.evaluate(() => {        let links = [];        const lines = document.querySelectorAll('.ql-editor p');        for(let i = 0; i < lines.length; i ++) {            const matchRes =lines[i].textContent.trim().match(/!\[[^\[\]\(\)]*\]\(([^\[\]\(\)]*)\)/)            if (matchRes) {                links.push({                    index: i,                    link: matchRes && matchRes[1],                });            }        }        return links;    })    const imgPath = path.join(os.homedir(), '.img');    fs.rmSync(imgPath, {        recursive: true    });    fs.mkdirSync(imgPath);    for(let i = 0; i< links.length; i++) {        const filePath = path.join(imgPath, (i+1) + '.image');        let currentTotal = 0;        downloadFile(links[i].link, filePath, (totalBytes, chunkBytes) => {            currentTotal += chunkBytes;            if(currentTotal >= totalBytes) {                setTimeout(() => {                    const {type} = sizeOf(fs.readFileSync(filePath));                    fs.renameSync(filePath, filePath +  '.' + type)                    console.log(`${filePath} 下载完成，重命名为 ${filePath +  '.' + type}`);                }, 1000);            }        })    }    console.log(links);}let cursor = 0;async function uploadNext() {    if(cursor >= links.length) {        return;    }    await page.click(`.ql-editor p:nth-child(${links[cursor].index + 1})`);    await page.evaluate((index) => {        const p = document.querySelector(`.ql-editor p:nth-child(${index + 1})`);        p.textContent = '';    }, links[cursor].index);    await page.click('.ql-image');    cursor ++;    }
```

```
import https from 'https';import fs from 'fs';export default function downloadFile(url, destinationPath, progressCallback) {    let resolve , reject;    const promise = new Promise((x, y) => { resolve = x; reject = y; });    const request = https.get(url, response => {        if (response.statusCode !== 200) {            const error = new Error(`Download failed: server returned code ${response.statusCode}. URL: ${url}`);            response.resume();            reject(error);            return;        }        const file = fs.createWriteStream(destinationPath);        file.on('finish', () => resolve ());        file.on('error', error => reject(error));        response.pipe(file);        const totalBytes = parseInt(response.headers['content-length'], 10);        if (progressCallback)            response.on('data', onData.bind(null, totalBytes));    });    request.on('error', error => reject(error));    return promise;    function onData(totalBytes, chunk) {        progressCallback(totalBytes, chunk.length);    }}
```

总结
--

星球编辑器不好用，每次都要把图片手动下载下来然后插入对应位置，我们通过 puppeteer 把这个流程自动化了。

puppeteer 是一个自动化测试工具，基本所有浏览器手动的操作都能自动化。

我们用 readline 模块读取用户输入，当输入 download-img 的时候，拿到所有的 p 标签，过滤出链接的内容，把信息记录下来。

自动下载图片并用 image-size 读取图片类型来重命名。

然后输入 upload-next，会通过点击对应 p 标签实现光标定位，然后点击上传按钮来选择图片。

自动化以后的工作流程简单太多了，繁琐的工作都给自动化了，体验爽翻了！