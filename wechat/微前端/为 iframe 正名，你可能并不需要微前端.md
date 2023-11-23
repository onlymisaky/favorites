> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/Sp2hlxUcY45-v9nlIhEOow)

![](https://mmbiz.qpic.cn/mmbiz_gif/QRibyjewM1ICYYia2SLwuMNiar6aVaCbibwOd04ozAmkHqia4Th9QMRcT51vflz5MoJic1Trw6SGVbgeDbtMZbEfnBHg/640?wx_fmt=gif)

> > 任何新技术、新产品都是有一定适用场景的，它可能在当下很流行，但它不一定在任何时候都是最优解。

前言
==

最近几年微前端很火，火到有时候项目里面用到了 iframe 还要偷偷摸摸地藏起来生怕被别人知道了，因为担心被人质疑：你为什么不用微前端方案？直到最近笔者接手一个项目，需要将现有的一个系统整体嵌入到另外一个系统（一共 20 多个页面），在被微前端坑了几次之后，回过头发现，iframe 真香！

qiankun 的作者有一篇《Why Not Iframe》[1] 介绍了 iframe 的优缺点（不过作者还有一篇《你可能并不需要微前端》[2] 给微前端降降火），诚然 iframe 确实存在很多缺点，但是在选择一个方案的时候还是要具体场景具体分析，它可能在当下很流行，但它不一定在任何时候都是最优解：iframe 的这些缺点对我来说是否能够接受？它的缺点是否有其它方法可以弥补？使用它到底是利大于弊还是弊大于利？我们需要在优缺点之间找到一个平衡。

优缺点分析
=====

![](https://mmbiz.qpic.cn/mmbiz_png/QRibyjewM1IAgsjNrUUPOnvu2BLEEDJVhHJZ5z5tZUuq12HYK0KZtUgU8Eicvibibbu9VLkw3XvCySMQqOfqe9p4Aw/640?wx_fmt=png)

iframe 适合的场景
------------

由于 iframe 的一些限制，部分场景并不适合用 iframe，比如像下面这种 iframe 只占据页面中间部分区域，由于父页面已经有一个滚动条了，为了避免出现双滚动条，只能动态计算 iframe 的内容高度赋值给 iframe，使得 iframe 高度完全撑满，但这样带来的问题是弹窗很难处理，如果居中的话一般弹窗都相对的是 iframe 内容高度而不是屏幕高度，从而导致弹窗可能看不见，如果固定弹窗 top 又会导致弹窗跟随页面滚动，而且稍有不慎 iframe 内容高度计算有一点点偏差就会出现双滚动条。

![](https://mmbiz.qpic.cn/mmbiz_png/QRibyjewM1IAgsjNrUUPOnvu2BLEEDJVhSTPDoRKic05cibwKafjdWo6jnDSLEHkPibHNbaQrNialjN1AhtJodoNN3g/640?wx_fmt=png)

所以：

*   如果页面本身比较简单，是一个没有弹窗、浮层、高度也是固定的纯信息展示页的话，用 iframe 一般没什么问题；
    
*   如果页面是包含弹窗、信息提示、或者高度不是固定的话，需要看 **iframe 是否占据了全部的内容区域**，如果是像下图这种经典的导航 + 菜单 + 内容结构、并且整个内容区域都是 iframe，那么可以放心大胆地尝试 iframe，否则，需要慎重考虑方案选型。
    

![](https://mmbiz.qpic.cn/mmbiz_png/QRibyjewM1IAgsjNrUUPOnvu2BLEEDJVhw4R0YyHvDJniaKFlCONHIFicQI0L4hzXPoaJzRUev2GK0ucxyLMjyRJg/640?wx_fmt=png)

为什么一定要满足 “iframe 占据全部内容区域” 这个条件呢？可以想象一下下面这种场景，滚动条出现在页面中间应该大部分人都无法接受：

![](https://mmbiz.qpic.cn/mmbiz_png/QRibyjewM1IAgsjNrUUPOnvu2BLEEDJVhfzv48qtsOiaKulBhIjEibd6qJ1uan5TzGxn7nHsfAkWJbs4ib7M37MxZQ/640?wx_fmt=png)

实战：A 系统接入 B 系统
==============

满足 “iframe 占据全部内容区域” 条件的场景，iframe 的几个缺点都比较好解决。下面通过一个实际案例来详细介绍将一个线上在运行的系统接入到另外一个系统的全过程。以笔者前段时间刚完成的 ACP（全称 Alibaba.com Pay，阿里巴巴国际站旗下一站式全球收款平台，下称 A 系统）接入生意贷（下称 B 系统）为例，已知：

*   ACP 和生意贷都是 MPA 页面；
    
*   ACP 系统在此之前没有接入其他系统的先例，生意贷是第一个；
    
*   生意贷作为被接入系统，本次需要接入的一共有 20 多个页面，且服务端包含大量业务逻辑以及跳转控制，有些页面想看看长什么样子都非常困难，需要在 Node 层 mock 大量接口；
    
*   接入时需要做功能删减，部分接口入参需要调整；
    
*   生意贷除了接入到 ACP 系统中，之前还接入过 AMES 系统，本次接入需要兼容这部分历史逻辑；
    

我们希望的效果：

![](https://mmbiz.qpic.cn/mmbiz_png/QRibyjewM1IAgsjNrUUPOnvu2BLEEDJVhNicYpBmPCWxNhGNBbeqOAExR6AqyYKIUfQIexXbAaV0hicXz0aBRiaIicA/640?wx_fmt=png)

假设我们新增一个页面 `/fin/base.html?entry=xxx` 作为我们 A 系统承接 B 系统的地址，A 系统有类似如下代码：

```
class App extends React.Component {    state = {        currentEntry: decodeURIComponent(iutil.getParam('entry') || '') || '',    };    render() {        return <div>            <iframe id="microFrontIframe" src={this.state.currentEntry}/>        </div>;    }}
```

隐藏原系统导航菜单
---------

因为是接入到另外一个系统，所以需要将原系统的菜单和导航等都通过一个类似 “hideLayout” 的参数去隐藏。

前进后退处理
------

需要特别注意的是，iframe 页面内部的跳转虽然不会让浏览器地址栏发生变化，但是却会产生一个看不见的 “history 记录”，也就是点击前进或后退按钮（`history.forward()`或`history.back()`）可以让 iframe 页面也前进后退，但是地址栏无任何变化。

所以准确来说前进后退无需我们做任何处理，我们要做的就是让浏览器地址栏同步更新即可。

> 如果要禁用浏览器的上述默认行为，一般只能在 iframe 跳转时通知父页面更新整个`<iframe />DOM`节点。

URL 的同步更新
---------

让 URL 同步更新需要处理 2 个问题，一个是什么时候去触发更新的动作，一个是 URL 更新的规律，即父页面的 URL 地址（A 系统）与 iframe 的 URL 地址（B 系统）映射关系的维护。

保证 URL 同步更新功能正常需要满足这 3 种情况：

*   case1: 页面刷新，iframe 能够加载正确页面；
    
*   case2: 页面跳转，浏览器地址栏能够正确更新；
    
*   case3: 点击浏览器的前进或后退，地址栏和 iframe 都能够同步变化；
    

### 什么时候更新 URL 地址

首先想到的肯定是在 iframe 加载完发送一个通知给父页面，父页面通过`history.replaceState`去更新 URL。

> 为什么不是`history.pushState`呢？因为前面提到过，浏览器默认会产生一条历史记录，我们只需要更新地址即可，如果用 pushState 会产生 2 条记录。

B 系统：

```
<script>var postMessage = function(type, data) {    if (window.parent !== window) {        window.parent.postMessage({            type: type,            data: data,        }, '*');    }}// 为了让URL地址尽早地更新，这段代码需要尽可能前置，例如可以直接放在document.head中postMessage('afterHistoryChange', { url: location.href });</script>
```

A 系统：

```
window.addEventListener('message', e => {    const { data, type } = e.data || {};    if (type === 'afterHistoryChange' && data?.url) {        // 这里先采用一个兜底的URL承接任意地址        const entry = `/fin/base.html?entry=${encodeURIComponent(data.url)}`;        // 地址不一样才需要更新        if (location.pathname + location.search !== entry) {            window.history.replaceState(null, '', entry);        }    }});
```

### 优化 URL 的更新速度

按照上面的方法实现后可以发现，URL 虽然可以更新但是速度有点慢，点击跳转后一般需要等待 7-800 毫秒地址栏才会更新，有点美中不足。可以把地址栏的更新在 “跳转后” 基础之上再加一个“跳转前”。为此我们必须有一个全局的 beforeRedirect 钩子，先不考虑它的具体实现：

B 系统：

```
function beforeRedirect(href) {    postMessage('beforeHistoryChange', { url: href });}
```

A 系统：

```
window.addEventListener('message', e => {    const { data, type } = e.data || {};    if ((type === 'beforeHistoryChange' || type === 'afterHistoryChange') && data?.url) {        // 这里先采用一个兜底的URL承接任意地址        const entry = `/fin/base.html?entry=${encodeURIComponent(data.url)}`;        // 地址不一样才需要更新        if (location.pathname + location.search !== entry) {            window.history.replaceState(null, '', entry);        }    }});
```

加上上述代码之后，点击 iframe 中的跳转链接，URL 会实时更新，浏览器的前进后退功能也正常。

> 为什么需要同时保留跳转前和跳转后呢？因为如果只保留跳转前，只能满足前面的 case1 和 case2，case3 无法满足，也就是点击后退按钮只有 iframe 会后退，URL 地址不会更新。

### 美化 URL 地址

简单的使用`/fin/base.html?entry=xxx`这样的通用地址虽然能用，但是不太美观，而且很容易被人看出来是 iframe 实现的，比较没有诚意，所以如果被接入系统的页面数量在可枚举范围内，建议给每个地址维护一个新的短地址。

首先，新增一个 SPA 页面`/fin/*.html`，和前面的`/fin/base.html`指向同一个页面，然后维护一个 URL 地址的映射，类似这样：

```
// A系统地址到B系统地址映射const entryMap = {    '/fin/home.html': 'https://fs.alibaba.com/xxx/home.htm?hideLayout=1',    '/fin/apply.html': 'https://fs.alibaba.com/xxx/apply?hideLayout=1',    '/fin/failed.html': 'https://fs.aibaba.com/xxx/failed?hideLayout=1',    // 省略};const iframeMap = {}; // 同时再维护一个子页面 -> 父页面URL映射for (const entry in entryMap) {    iframeMap[entryMap[entry].split('?')[0]] = entry;}class App extends React.Component {    state = {        currentEntry: decodeURIComponent(iutil.getParam('entry') || '') || entryMap[location.pathname] || '',    };    render() {        return <div>            <iframe id="microFrontIframe" src={this.state.currentEntry}/>        </div>;    }}
```

同时完善一下更新 URL 地址部分：

```
// base.html继续用作兜底let entry = `/fin/base.html?entry=${encodeURIComponent(data.url)}`;const [path, search] = data.url.split('?');if (iframeMap[path]) {    entry = `${iframeMap[path]}?${search || ''}`;}// 地址不一样才需要更新if (location.pathname + location.search !== entry) {    window.history.replaceState(null, '', entry);}
```

> 省略参数透传部分代码。

全局跳转拦截
------

为什么一定要做全局跳转拦截呢？一个因为我们需要把 hideLayout 参数一直透传下去，否则就会点着点着突然出现下面这种双菜单的情况：

![](https://mmbiz.qpic.cn/mmbiz_png/QRibyjewM1IAgsjNrUUPOnvu2BLEEDJVhNqxEd1IVEEzBzEaDIbbDVKJia5mNqI3TcNEuObZt46YyBS7Sp6B7bXw/640?wx_fmt=png)

另一个是有些页面在被嵌入前是当前页面打开的，但是被嵌入后不能继续在当前 iframe 打开，比如支付宝付款这种第三方页面，想象一下下面这种情况会不会觉得很怪？所以这类页面一定要做特殊处理让它跳出去而不是当前页面打开。

![](https://mmbiz.qpic.cn/mmbiz_png/QRibyjewM1IAgsjNrUUPOnvu2BLEEDJVhYK8XYOtaSDROAbKTbngxPyoldg9bSzibfnlQm2iblMwyibZQcdwoPvUqw/640?wx_fmt=png)

URL 跳转可以分为服务端跳转和浏览器跳转，浏览器跳转又包括 A 标签跳转、location.href 跳转、window.open 跳转、historyAPI 跳转等；

而根据是否新标签打开又可以分为以下 4 种场景：

1.  继续当前 iframe 打开，需要隐藏原系统的所有 layout；
    
2.  当前父页面打开第三方页面，不需要任何 layout；
    
3.  新开标签打开第三方页面（如支付宝页面），不需要做特殊处理；
    
4.  新开标签打开宿主页面，需要把原系统 layout 替换成新 layout；
    

为此，先定义好一个`beforeRedirect`方法，由于新标签打开有`target="_blank"`和`window.open`等方式，父页面打开有`target="_parent"`和`window.parent.location.href`等方式，为了更好的统一封装，我们把特殊情况的跳转统一在`beforeRedirect`处理好，并约定只有有返回值的情况才需要后续继续处理跳转：

```
// 维护一个需要做特殊处理的第三方页面列表const thirdPageList = [    'https://service.alibaba.com/',    'https://sale.alibaba.com/xxx/',    'https://alipay.com/xxx/',    // ...];/** * 封装统一的跳转拦截钩子，处理参数透传和一些特殊情况 * @param {*} href 要跳转的地址，允许传入相对路径 * @param {*} isNewTab 是否要新标签打开 * @param {*} isParentOpen 是否要在父页面打开 * @returns 返回处理好的跳转地址，如果没有返回值则表示不需要继续处理跳转 */function beforeRedirect(href, isNewTab) {    if (!href) {        return;    }    // 传过来的href可能是相对路径，为了做统一判断需要转成绝对路径    if (href.indexOf('http') !== 0) {        var a = document.createElement('a');        a.href = href;        href = a.href;    }    // 如果命中白名单    if (thirdPageList.some(item => href.indexOf(item) === 0)) {        if (isNewTab) {            // _rawOpen参见后面 window.open 拦截            window._rawOpen(href);        } else {            // 第三方页面如果不是新标签打开就一定是父页面打开            window.parent.location.href = href;        }        return;    }    // 需要从当前URL继续往下透传的参数    var params = ['hideLayout', 'tracelog'];    for (var i = 0; i < params.length; i++) {        var value = getParam(params[i], location.href);        if (value) {            href = setParam(params[i], value, href);        }    }    if (isNewTab) {        let entry = `/fin/base.html?entry=${encodeURIComponent(href)}`;        const [path, search] = href.split('?');        if (iframeMap[path]) {            entry = `${iframeMap[path]}?${search || ''}`;        }        href = `https://payment.alibaba.com${entry}`;        window._rawOpen(href);        return;    }    // 如果是以iframe方式嵌入，向父页面发送通知    postMessage('beforeHistoryChange', { url: href });    return href;}
```

### 服务端跳转拦截

服务端主要是对 301 或 302 重定向跳转进行拦截，以 Egg 为例，只要重写 `ctx.redirect` 方法即可。

### A 标签跳转拦截

```
document.addEventListener('click', function (e) {    var target = e.target || {};    // A标签可能包含子元素，点击目标可能不是A标签本身，这里只简单判断2层    if (target.tagName === 'A' || (target.parentNode && target.parentNode.tagName === 'A')) {        target = target.tagName === 'A' ? target : target.parentNode;        var href = target.href;        // 不处理没有配置href或者指向JS代码的A标签        if (!href || href.indexOf('javascript') === 0) {            return;        }        var newHref = beforeRedirect(href, target.target === '_blank');        // 没有返回值一般是已经处理了跳转，需要禁用当前A标签的跳转        if (!newHref) {            target.target = '_self';            target.href = 'javascript:;';        } else if (newHref !== href) {            target.href = newHref;        }    }}, true);
```

### location.href 拦截

location.href 拦截至今是一个困扰前端界的难题，这里只能采用一个折中的方法：

```
// 由于 location.href 无法重写，只能实现一个 location2.href = ''if (Object.defineProperty) {    window.location2 = {};    Object.defineProperty(window.location2, 'href', {        get: function() {            return location.href;        },        set: function(href) {            var newHref = beforeRedirect(href);            if (newHref) {                location.href = newHref;            }        },    });}
```

因为我们**不仅实现了 location.href 的写，location.href 的读也一起实现了**，所以可以放心大胆的进行全局替换。找到对应前端工程，首先全局搜索`window.location.href`，批量替换成`(window.location2 || window.location).href`，然后再全局搜索`location.href`，批量替换成`(window.location2 || window.location).href`（思考一下为什么一定是这个顺序呢）。

![](https://mmbiz.qpic.cn/mmbiz_png/QRibyjewM1IAgsjNrUUPOnvu2BLEEDJVhAaicruIvrheIXicE3tFXgEeWt3qe4AF3Yph6JZzThPibibWBgEPCO9KhwQ/640?wx_fmt=png)

> 另外需要注意，有些跳转可能是写在 npm 包里面的，这种情况只能 npm 也跟着替换一下了，并没有其它更好办法。

### window.open 拦截

```
var tempOpenName = '_rawOpen';if (!window[tempOpenName]) {    window[tempOpenName] = window.open;    window.open = function(url, name, features) {        url = beforeRedirect(url, true);        if (url) {            window[tempOpenName](url, name, features);        }    }}
```

### history.pushState 拦截

```
var tempName = '_rawPushState';if (!window.history[tempName]) {    window.history[tempName] = window.history.pushState;    window.history.pushState = function(state, title, url) {        url = beforeRedirect(url);        if (url) {            window.history[tempName](state, title, url);        }    }}
```

### history.replaceState 拦截

```
var tempName = '_rawReplaceState';if (!window.history[tempName]) {    window.history[tempName] = window.history.replaceState;    window.history.replaceState = function(state, title, url) {        url = beforeRedirect(url);        if (url) {            window.history[tempName](state, title, url);        }    }}
```

全局 loading 处理
-------------

完成上述步骤后，基本上已经看不出来是 iframe 了，但是跳转的时候中间有短暂的白屏会有一点顿挫感，体验不算很流畅，这时候可以给 iframe 加一个全局的 loading，开始跳转前显示，页面加载完再隐藏：

B 系统：

```
document.addEventListener('DOMContentLoaded', function (e) {    postMessage('iframeDOMContentLoaded', { url: location.href });});
```

A 系统：

```
window.addEventListener('message', (e) => {    const { data, type } = e.data || {};    // iframe 加载完毕    if (type === 'iframeDOMContentLoaded') {        this.setState({loading: false});    }    if (type === 'beforeHistoryChange') {        // 此时页面并没有立即跳转，需要再稍微等待一下再显示loading        setTimeout(() => this.setState({loading: true}), 100);    }});
```

除此之外还需要利用 iframe 自带的 onload 加一个兜底，防止 iframe 页面没有上报 `iframeDOMContentLoaded` 事件导致 loading 不消失：

```
// iframe自带的onload做兜底iframeOnLoad = () => {    this.setState({loading: false});}render() {    return <div>        <Loading visible={this.state.loading} tip="正在加载..." inline={false}>            <iframe id="microFrontIframe" src={this.state.currentEntry} onLoad={this.iframeOnLoad}/>        </Loading>    </div>;}
```

还需要注意，当新标签页打开页面时并不需要显示 loading，需要注意区分。

弹窗居中问题
------

![](https://mmbiz.qpic.cn/mmbiz_png/QRibyjewM1IAgsjNrUUPOnvu2BLEEDJVhff82L9Ml8zMl3YicLSsaUvS7dcaZV0Szs8NFKibsv3Imc6b67OHtNPjA/640?wx_fmt=png)

当前场景下弹窗个人觉得并不需要处理，因为菜单的宽度有限，不仔细看的话甚至都没注意到弹窗没有居中：

![](https://mmbiz.qpic.cn/mmbiz_png/QRibyjewM1IAgsjNrUUPOnvu2BLEEDJVhicH21lkAfw7MZ4OrhtojbEA1xKp6YGOll6iaFyxRbuQM2uWMPfPLXOXQ/640?wx_fmt=png)

如果非要处理的话也不麻烦，覆盖一下原来页面弹窗的样式，当包含`hideLayout`参数时，让弹窗的位置分别向左移动`menuWidth/2`、向上移动`navbarHeight/2`即可（遮罩位置不能动、也动不了）。

添加了`marginLeft=-120px`、`marginTop=-30px` 后的弹窗效果：

![](https://mmbiz.qpic.cn/mmbiz_png/QRibyjewM1IAgsjNrUUPOnvu2BLEEDJVhDKJwl4hYEZ1hWonIweChTfufWwbiaz4IFe3hEYV8CJjIdMKbbiaBbsHg/640?wx_fmt=png)

最终效果
----

其实不难看出，最终效果和 SPA 几乎无异，而且菜单和导航本来就是无刷新的，页面跳转没有割裂感：

![](https://mmbiz.qpic.cn/mmbiz_gif/QRibyjewM1IAgsjNrUUPOnvu2BLEEDJVhJcdGYsQP8qQDbv0lbVx2SY6IPg64C2HBG4ias7MSRGIxgNCa1F9AULg/640?wx_fmt=gif)

结语
==

上述方案有几个没有提到的点：

*   方案成立的前提是建立在 2 个系统共用一套用户体系，否则需要对 2 个系统的登录体系进行打通，一般包括账号绑定、A 系统默认免登 B 系统，等等，这需要一定额外的工作量；
    
*   参数的透传与删除，例如我希望除了 hideLayout 参数之外其它 URL 参数全部在父子页面之间透传；
    
*   埋点，数据上报的时候需要增加一个额外参数来标识流量来自另外一个系统；
    

在第一次摸索方案时可能需要花费一些时间，但是在熟悉之后，如果后续还有类似把 B 系统接入 A 系统的需求，在没有特殊情况且顺利的前提下可能花费 1-2 天时间即可完成，最重要的是大部分工作都是全局生效的，不会随着页面的增多而导致工作量增加，测试回归的成本也非常低，只需要验证所有页面跳转、展示等是否正常，功能本身一般不会有太大问题，而如果是微前端方案的话需要从头到尾全部仔仔细细测试一遍，开发和测试的成本都不可估量。

### 参考资料

[1]

《Why Not Iframe》: _https://www.yuque.com/kuitos/gky7yw/gesexv?spm=ata.21736010.0.0.25c06df01VID5V_

[2]

《你可能并不需要微前端》: _https://zhuanlan.zhihu.com/p/391248835_

![](https://mmbiz.qpic.cn/mmbiz_png/QRibyjewM1IDBm4B6OB8j6tlVYWmMOnt5aQhtrbM4MpRUpUdicelh6B3JJtjCD3yRhffTM8cGGzn2PfLodhx4x6g/640?wx_fmt=png)

![](https://mmbiz.qpic.cn/mmbiz_png/QRibyjewM1IDBm4B6OB8j6tlVYWmMOnt5HAj7UAwHh5ibSN0yOMn7tpMbu7XydA98uWMA086MvqxuFmPibJgU2Pdg/640?wx_fmt=png)