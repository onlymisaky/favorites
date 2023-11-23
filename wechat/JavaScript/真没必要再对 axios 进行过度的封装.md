> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/HGifnteZBRK3R1DfEK9Cjw)

![图片](https://mmbiz.qpic.cn/mmbiz_jpg/b77xA98980HC8X81RYX3CB8lwQkkGsQjhL4OiaohwfcYxAGTzWlyCLIn1NTZgpxOYTIQyPicJheia23ug4zYq92UA/640?wx_fmt=jpeg)

很多同学喜欢对 axios 再进行二次的封装，但真的有必要吗？

前几天在某网站上看到一篇文章，说是用 ts 对 axios 进行了下封装，从点赞量、评论量和访问量上来看，有很多人都看过这篇文章了。

![](https://mmbiz.qpic.cn/mmbiz_png/b77xA98980HKhOxmHxfibibDiaAM5lAEvOAq78VIqyv1IRUWwpSYgMdR6WGGxicwibegc9D13rvHaX87XOA897p0B8Q/640?wx_fmt=png)过度封装的 axios

我之前也看过 axios 的源码，也基于 axios 进行过扩展和二次封装。对 axios 的内部原理和使用方式不可谓不熟悉。

虽然很多人在评论里说，收益匪浅啊，写的真棒啊等等，但我通读完整篇文章，得到的结论是：`完全没必要`。

1. 完全没必要
--------

有的开发者喜欢基于 axios 再在外层封装一层，但这种方式实现的成本太高。

无论是实现跟 axios 一样的功能，还是外层进行简化，然后再按照 axios 的方式传给 axios，都增加了很多开发的成本。如：

```
const myAxios = async (config) => {  /**   * 中间各种封装，然后最后再使用axios发起请求1   * */  try {    const { status, data } = await axios(config);    if (status >= 200 && status <= 304) {      return data;    }  } catch (err) {    console.error(err);  }  return null;};
```

如有的开发者封装时，喜欢把 GET 请求方式的 params 字段和 POST 请求方式的 data 字段合并成一个，觉得可以减少使用者对字段记忆的成本。然后组件内部，再根据请求方式，决定传给 axios 的 params 字段还是 data 字段。或者有的屏蔽掉对请求的配置，有的屏蔽掉 axios 对外返回的字段。

就像上面的简要封装，连拦截器、取消请求等功能都给屏蔽掉了。但是，又想用，怎么办？那就靠着自己半吊子的知识，自己再封装一个，然后再跟 axios 进行对接，累不累啊。

有的人说他的要求更复杂，不二次额外封装一层，都没法用，比如：

1.  一个 url 同时只有发起一个请求；
    
2.  有重试的机制，当不满足要求时，最多可以重试 3 次；
    
3.  统一的 loading 机制；
    
4.  配置复杂，不同的 URL 有着不同的配置；
    

其实，上面的这几条需求，通过 axios 的拦截器就可以实现了，外面不用再封装一层。

axios 库本身就已经提供了多种的扩展方式，为什么不直接用呢？

![](https://mmbiz.qpic.cn/mmbiz_jpg/b77xA98980HKhOxmHxfibibDiaAM5lAEvOAPibLlZwjy2bRlpaHqNpeSCX5H0ViaicBDAXta3KshSedEjk8l6zjribLtw/640?wx_fmt=jpeg)方便扩展的适配器

### 1.1 方便扩展的适配器

axios 可以自定义请求适配器 adapter。

很多同学说 fetch 已经成为标准了，为什么 axios 内部还不支持。其实相比 XMLHttpRequest ，fetch 还是多少有点欠缺的，如取消请求的 AbortController 在 IE 浏览器中并没有实现，同时也不支持上传进度和下载进度。

因此，在 fetch 还没有对齐 XMLHttpRequest 里的这些功能时，内部还很难使用 fetch 来实现。

若您真的想用 fetch 来进行请求，完全可以按照文档来扩展您的适配器。如何实现自定义的适配器，您可以参考这篇文章 如何实现 axios 的自定义适配器 adapter。

直接在适配器上进行扩展，而不是基于 axios 再在外层封装一层，原因有几个：

1.  不改变 axios 的使用方式，无论传参的方式，还是数据返回的格式，都没有任何的变化；
    
2.  可以使用 axios 中提供的能力，如拦截器，转换请求数据和响应数据、支持防御 XSRF 等；
    

这种方式，对其他开发者也很友好，只要知道 axios 怎么用，就知道你封装的这个怎么用。不用增加学习的成本。

![](https://mmbiz.qpic.cn/mmbiz_jpg/b77xA98980HKhOxmHxfibibDiaAM5lAEvOAic1v7giaCcoJG4YHXKtLAbTWhDNvjHYMLCO0kneLIwvCYux22atsl0OQ/640?wx_fmt=jpeg)各种形式的配置

### 1.2 各种形式的配置

axios 在配置上，可以进行全局的配置和请求的单独配置，同时还有请求拦截器和响应拦截器，对某一类的请求进行处理。

若所有请求的 url 的 baseURL 是相同的，那么就可以在全局配置中进行配置；若某几个接口的 baseUrl 跟别的不一样，那么可以单独对其进行配置，或者在请求拦截器中，直接修改请求的 baseUrl。

```
axios.defaults.timeout = 6000; // 全局配置/** * 拦截器中配置，若url中有`aaa`，则过期时间设置为4000ms **/axios.interceptors.request.use(  function (config) {    if (/aaa/.test(config.url)) {      config.timeout = 4000;    }    return config;  },  function (error) {    return Promise.reject(error);  },);axios('https://www.xiabingbao.com', { timeout: 2000 }); // 单独对某个请求进行配置
```

这些不同的配置方式，我个人觉得已经可以满足绝大部分的需求了。

### 1.3 本身就支持 typescript

axios 源码虽不是用 typescript 编写的，但官方也是提供了 ts 定义的：index.d.ts。

那些上来就说用 typescript 封装 axios 的，你确定不是在搞笑吗？

而且，作为个人开发者，在开发和使用过程中，肯定会产生纰漏和 bug，比不过经过多人验证过的仓库。

![](https://mmbiz.qpic.cn/mmbiz_jpg/b77xA98980HKhOxmHxfibibDiaAM5lAEvOA6VP2ibpVfHd0KMt0I0ibzC3daUyvickIp3hniattXjA49qZPNvk2tf2j4Q/640?wx_fmt=jpeg)完全没必要

2. 不是不能封装
---------

其实也不是不能封装，毕竟 axios 作为一个通用的框架，它不可能适应所有的项目和架构。我不希望的是过度的封装，既没必要，又增加后来者的学习成本。

有的同学在 React/Vue 中封装 axios，倒是`可以`有封装的意义，比如在 React 中封装一个请求的简单 hook 等。

```
const useAxios = (config) => {  const [loading, setLoading] = useState(false);  const [error, setError] = useState(null);  const [result, setResult] = useState(null);  useEffect(() => {    setLoading(true);    axios(config)      .then(setResult)      .catch(setError)      .finally(() => {        setLoading(false);      });  }, []);  return { loading, error, result };};
```

更具体的如何在 React 封装一个请求的 hook，可以参考该链接：使用 react 的 hook 实现一个 useRequest。

有的封装，是为了减少项目整体的改造成本，和其他人学习新用法的成本。比如之前我也基于 axios，在外层封装过一个请求库。当时为了跟之前的请求方式保持一致，就在外层额外封了一层。后来就出现当需要扩展功能时，特别麻烦，还不如从一开始设计时，就仅仅扩展他的适配器，或者几个简单的配置就行。

在封装的时候，首先我们要明白 axios 可以完成什么工作，他实现这些功能都有什么意义，为什么可以传入这些字段，又为什么要返回了那么多字段（我明明只需要接口返回的 data）？

想明白这些问题，就知道我们要保留什么，如何进行扩展和封装了。

![](https://mmbiz.qpic.cn/mmbiz_jpg/b77xA98980HKhOxmHxfibibDiaAM5lAEvOAcEgoX8CUSq5az8fVqeYSVx5sOX29KibtibD29szCs9saM6pqf7iaV8s1g/640?wx_fmt=jpeg)不是不能封装

3. 总结
-----

自己实现出来的东西，大部分都比不上社区里经过千锤百炼验证过的。而且在使用的过程中，还要考虑减少其他人的学习成本。

比如你就不想用 Vue，觉得 Vue 这个框架优点大，然后选择了一个叫`mini-vue`的框架来开发项目。就社区完善程度来说，这个 mini 版肯定是比不上官方 Vue 的，后来者还得重新学习 mini 版的语法，当遇到问题时，都不知道去问谁，毕竟这个问题，只有 mini 版里才会有，其他人用的少，解答的人也少。

![](https://mmbiz.qpic.cn/mmbiz_png/YBFV3Da0Nwt7qqUywpNb0He4PpaGj3yfOA9oevy0kdQdJCFd1WibyibnZAdiaOgsycXHrAGUPoEZYU8OueicPkn2KQ/640?wx_fmt=png)

[如何将评论数据从扁平数组结构转为树形结构](http://mp.weixin.qq.com/s?__biz=MzA5ODM5NTYyMA==&mid=2653284781&idx=1&sn=a1a4755e74278ed9078ca6e79894a192&chksm=8b437d26bc34f430042bf63dd6d48ca7948a5983dcb3d231924b11f806766e766adde1603375&scene=21#wechat_redirect)  

[nodejs 中如何校验请求中的 referer](http://mp.weixin.qq.com/s?__biz=MzA5ODM5NTYyMA==&mid=2653284759&idx=1&sn=c9e631d781274c3dacd6850cc0b0ac28&chksm=8b437d1cbc34f40a7e64e0d3fdb248c2806a1d06ac6dd00006f83003fcb08013744f262f3aeb&scene=21#wechat_redirect)  

[encodeURIComponent, escape, encodeURI 使用场景](http://mp.weixin.qq.com/s?__biz=MzA5ODM5NTYyMA==&mid=2653284749&idx=1&sn=1146dbc966d689f308609ceec49dc45e&chksm=8b437d06bc34f410ce5dccae617179173ae4d4093d59712ae7eb7723ec7c929ad1f1d252a036&scene=21#wechat_redirect)​  

![](https://mmbiz.qpic.cn/mmbiz_jpg/YBFV3Da0Nwt7qqUywpNb0He4PpaGj3yf529Acb1YkfG4Qd7ibPI86cFsibe9xbaVPMsrFOicZniabLMocx5EOC1LRQ/640?wx_fmt=jpeg)

▼我是来自腾讯的前端开发工程师，

长按识别二维码关注，与大家共同学习▼  

![](https://mmbiz.qpic.cn/mmbiz_png/b77xA98980FhicYXcqe4JKmNQX3IibTo2grYBrUjFDr754PDwjYc8MrhqYibqXiap2GQKIsaoSE4rJjawIa5GFiaW2Q/640?wx_fmt=png)