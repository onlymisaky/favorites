> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/nq2Rci3q0RSQ_w9T3kh43w)

前言
--

对于前端来讲，我们在操作`cookie`时往往都是基于`document.cookie`，但它有一个缺点就是操作复杂，它并没有像`localStorage`那样提供一些`get`或`set`等方法供我们使用。对与 cookie 的操作一切都是基于字符串来进行的。为了让`cookie`的操作更简便， Chrome87 率先引入了`cookieStore`方法。

**如果这篇文章有帮助到你，❤️关注 + 点赞❤️鼓励一下作者，文章公众号首发，关注 `前端南玖` 第一时间获取最新文章～**

document.cookie
---------------

`document.cookie`可以获取并设置当前文档关联的`cookie`

### 获取 cookie

```
const cookie = document.cookie
```

在上面的代码中，`cookie` 被赋值为一个字符串，该字符串包含所有的 Cookie，每条 cookie 以 "分号和空格 (;)" 分隔 (即， `key=value` 键值对)。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/aw5KtMic7pia58JYFPLBdJpPCibpibvfgbqkTF0qiaMD79XrHWQDlAsaWxBs0ickwXoOtPMbZDv6xCtEVSlEibFmsfNAg/640?wx_fmt=png&from=appmsg)

但这拿到的是一整个字符串，如果你想获取 cookie 中的某一个字段，还需要自己处理

```
const converter = {  read: function (value) {    if (value[0] === '"') {      value = value.slice(1, -1);    }    return value.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent)  },  write: function (value) {    return encodeURIComponent(value).replace(      /%(2[346BF]|3[AC-F]|40|5[BDE]|60|7[BCD])/g,      decodeURIComponent    )  }}function getCookie (key) {              const cookies = document.cookie ? document.cookie.split('; ') : [];  const jar = {};  for (let i = 0; i < cookies.length; i++) {    const parts = cookies[i].split('=');    const value = parts.slice(1).join('=');    try {      const foundKey = decodeURIComponent(parts[0]);      jar[foundKey] = converter.read(value, foundKey);      if (key === foundKey) {        break      }    } catch (e) {}  }  return key ? jar[key] : jar}console.log(getCookie('name'))  // 前端南玖
```

比如上面这段代码就是用来获取单个`cookie`值的

### 设置 cookie

```
document.cookie = `name=前端南玖;`
```

它的值是一个键值对形式的字符串。需要注意的是，**用这个方法一次只能对一个 cookie 进行设置或更新**。

比如：

```
document.cookie = `age=18; city=shanghai;`
```

这样只有`age`能够设置成功

*   以下可选的 cookie 属性值可以跟在键值对后，用来具体化对 cookie 的设定 / 更新，使用分号以作分隔：
    

*   这个值的格式参见 Date.toUTCString() (en-US)
    
*   `;path=path` (例如 '/', '/mydir') 如果没有定义，默认为当前文档位置的路径。
    
*   `;domain=domain` (例如'example.com'， 'subdomain.example.com') 如果没有定义，默认为当前文档位置的路径的域名部分。与早期规范相反的是，在域名前面加 . 符将会被忽视，因为浏览器也许会拒绝设置这样的 cookie。如果指定了一个域，那么子域也包含在内。
    
*   `;max-age=max-age-in-seconds` (例如一年为 60_60_24*365)
    
*   ```
    ;expires=date-in-GMTString-format
    ```
    
    如果没有定义，cookie 会在对话结束时过期
    
*   `;secure` (cookie 只通过 https 协议传输)
    

*   cookie 的值字符串可以用 encodeURIComponent() (en-US) 来保证它不包含任何逗号、分号或空格 (cookie 值中禁止使用这些值).
    

```
function assign (target) {  for (var i = 1; i < arguments.length; i++) {    var source = arguments[i];    for (var key in source) {      target[key] = source[key];    }  }  return target}function setCookie (key, value, attributes) {  if (typeof document === 'undefined') {    return  }  attributes = assign({}, { path: '/' }, attributes);  if (typeof attributes.expires === 'number') {    attributes.expires = new Date(Date.now() + attributes.expires * 864e5);  }  if (attributes.expires) {    attributes.expires = attributes.expires.toUTCString();  }  key = encodeURIComponent(key)    .replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent)    .replace(/[()]/g, escape);  var stringifiedAttributes = '';  for (var attributeName in attributes) {    if (!attributes[attributeName]) {      continue    }    stringifiedAttributes += '; ' + attributeName;    if (attributes[attributeName] === true) {      continue    }    stringifiedAttributes += '=' + attributes[attributeName].split(';')[0];  }  return (document.cookie =          key + '=' + converter.write(value, key) + stringifiedAttributes)}setCookie('course', 'fe', { expires: 365 })
```

这里是`js-cookie`库对`setCookie`方法的封装

### 删除 cookie

```
function removeCookie (key, attributes) {  setCookie(    key,    '',    assign({}, attributes, {      expires: -1    })  );}removeCookie('course')
```

新方法 cookieStore
---------------

以上就是通过`document.cookie`来操作`cookie`的方法，未封装方法之前操作起来都非常的不方便。现在我们再来了解一下新方法`cookieStore`，它是一个类似`localStorage`的全局对象。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/aw5KtMic7pia58JYFPLBdJpPCibpibvfgbqkToS2sKMTyEIibY1zZb2SiaOfDIibpOQRica1JnibBBO3xLicicKpFQuFp0FxA/640?wx_fmt=png&from=appmsg)

它提供了一些方法可以让我们更加方便的操作`cookie`

### 获取单个 cookie

```
cookieStore.get(name)
```

该方法可以获取对应`key`的单个 cookie，并且以`promise`形式返回对应的值

```
async function getCookie (key) {  const name = await cookieStore.get(key)  console.log('【name】', name)}getCookie('name')
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/aw5KtMic7pia58JYFPLBdJpPCibpibvfgbqkVCpGpTV06iaZj9ic753gD1ML8q2yCL7dbKpkOpWnMicOYu5z7jtCy0w6A/640?wx_fmt=png&from=appmsg)

当获取的`cookie`不存在时，则会返回`null`

### 获取所有 cookie

```
cookieStore.getAll()
```

该方法可以获取所有匹配的`cookie`，并且以`promise`形式返回一个列表

```
async function getAllCookies () {  const cookies = await cookieStore.getAll()  console.log('【cookies】', cookies)}getAllCookies()
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/aw5KtMic7pia58JYFPLBdJpPCibpibvfgbqkAIh6zuSTibIUTx3hvlNgiajLx9MhTQEWOhLxQia1AOvOWaYOgfSPgBoGw/640?wx_fmt=png&from=appmsg)

当`cookie`不存在时，则会返回一个空数组

### 设置 cookie

```
cookieStore.set()
```

该方法可以设置 cookie，并且会返回一个 promise 状态，表示是否设置成功

```
function setCookie (key, value) {  cookieStore.set(key, value).then(res => {    console.log('设置成功')  }).catch(err => {    console.log('设置失败')  })}setCookie('site', 'https://bettersong.github.io/nanjiu/')
```

如果想要设置更多的属性，比如：过期时间、路径、域名等，可以传入一个对象

```
function setCookie (key, value) {  cookieStore.set({    name: key,    value: value,    path: '/',    expires: new Date(2024, 2, 1)  }).then(res => {    console.log('设置成功')  }).catch(err => {    console.log('设置失败')  })}setCookie('site', 'https://bettersong.github.io/nanjiu/')
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/aw5KtMic7pia58JYFPLBdJpPCibpibvfgbqkic6eul2rTjmWQE3TnwQbnZVw0VJUOGhibtxbIW0sRprqMT1xiaBImZc3g/640?wx_fmt=png&from=appmsg)

### 删除 cookie

```
cookieStore.delete(name)
```

该方法可以用来删除指定的 cookie，同样会返回一个 promise 状态，来表示是否删除成功

```
function removeCookie (key) {  cookieStore.delete(key).then(res => {    console.log('删除成功')  }).catch(err => {    console.log('删除失败')  })}removeCookie('site')
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/aw5KtMic7pia58JYFPLBdJpPCibpibvfgbqkIfMOOopup4iagqvV3CjKRkJico3iczzCO6xAEck4dTPlQcZTKjDhmprDg/640?wx_fmt=png&from=appmsg)

**需要注意的是：即使删除一个不存在的 cookie 也会返回删除成功状态**

### 监听 cookie

```
cookieStore.addEventListener('change', (event) => {  console.log(event)});
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/aw5KtMic7pia58JYFPLBdJpPCibpibvfgbqkj26rCAgVibibyzlxcv7icu6uBhrLo24gAHO2F8yRrUf5Bq6guQvJUm4FA/640?wx_fmt=png&from=appmsg)

可以通过`change`事件来监听 cookie 的变化，无论是通过`cookieStore`操作的，还是通过`document.cookie`来操作的都能够监听到。

该方法的返回值有两个字段比较重要，分别是：`change`盒`delete`，它们都是数组类型。用来存放改变和删除的 cookie 信息

#### 监听修改

调用`set`方法时，会触发`change`事件，修改或设置的 cookie 会存放在`change`数组中

```
cookieStore.addEventListener('change', (event) => {  const type = event.changed.length ? 'change' : 'delete';  const data = (event.changed.length ? event.changed : event.deleted).map((item) => item.name);  console.log(`【${type}】, cookie：${JSON.stringify(data)}`);});function setCookie (key, value) {  cookieStore.set(key, value).then(res => {    console.log('设置成功')  }).catch(err => {    console.log('设置失败')  })}setCookie('site', 'https://bettersong.github.io/nanjiu/')
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/aw5KtMic7pia58JYFPLBdJpPCibpibvfgbqkvB0eQpTibqSiaeqYLOffOUrWBLkFibLdyxZzNUc5JeLbbeXZD5LH01X7A/640?wx_fmt=png&from=appmsg)

⚠️需要注意的是：

*   通过`document.cookie`设置或删除 cookie 时，都是会触发`change`事件，不会触发`delete`事件
    
*   即使两次设置 cookie 的`name`和`value`都相同，也会触发`change`事件
    

#### 监听删除

调用`delete`方法时，会触发`change`事件，删除的 cookie 会存放在`delete`数组中

```
cookieStore.addEventListener('change', (event) => {  const type = event.changed.length ? 'change' : 'delete';  const data = (event.changed.length ? event.changed : event.deleted).map((item) => item.name);  console.log(`【${type}】, cookie：${JSON.stringify(data)}`);});function removeCookie (key) {  cookieStore.delete(key).then(res => {    console.log('删除成功')  }).catch(err => {    console.log('删除失败')  })}removeCookie('site')
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/aw5KtMic7pia58JYFPLBdJpPCibpibvfgbqkyFTEotWMOIFvVWUF9HbKrocG8R5OsGHiboAaBrEdcrWvLRIkVw4Fc2A/640?wx_fmt=png&from=appmsg)

⚠️需要注意的是：

*   如果删除一个不存在的 cookie，则不会触发`change`事件
    

### 兼容性

在使用该方法时需要注意浏览器的兼容性

![](https://mmbiz.qpic.cn/sz_mmbiz_png/aw5KtMic7pia58JYFPLBdJpPCibpibvfgbqkk8M6icI415Gyy1PL6icQuXIibn7n6px26cHZEDZqMhBYE5UiciaR7I9vOHA/640?wx_fmt=png&from=appmsg)

总结
--

`cookieStore`提供的方法比起直接操作`document.cookie`要简便许多，不仅支持增删改查，还支持通过 change 事件来监听 cookie 的变化，但是在使用过程需要注意兼容性问题。