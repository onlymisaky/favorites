> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/BZT4ZmCErlb0F2gAuuXqoA)

文章转载于稀土掘金技术社区——林可 like

开头
==

这两天刚开始写自己构思的练习项目，登录逻辑写了以后开始写验证的逻辑，然后我就在想项目用哪种方式，最后是选择了双`Token`无感刷新的方案。

为什么选择无感刷新`Token`的方案呢？我觉得主要原因是：单`Token`如果过期时间短，**用户体验差**，过期时间长或者频繁获取的话，包含用户信息的单`Token`会有一定的**安全隐患**。（我写完了发现其实用`SessionId`挺好的，因为我的项目不存在服务器分布式的情况）

**双`Token`基本过程：**

1.  用户登录，服务端返回长、短`Token`，短`Token`的负载中携带服务端需要的用户信息，长`Token`仅携带一个用户名，一般短`Token`的过期时间是 30min, 长`Token`在 7 天左右；
    
2.  随后前端把两个`Token`都保存下来，实现本地化存储，我是选择保存在`localstorage`里面的；
    
3.  前端每次请求将短`Token`携带在请求头的`Authorization`字段中，服务端验证短`Token`有效并执行逻辑；
    
4.  短`Token`30min 后过期，此时前端发送请求到服务端，服务端验证时会发现短`Token`失效，此时返回状态码 **401**，前端判断状态码随后将长`Token`作为参数去请求服务端获取新的长、短`Token`，再将失效的请求重发完成请求。
    

代码
==

后端：
---

服务端使用`Node.js`的`express`框架搭建。

创建路由与服务相关的逻辑就不写在这里了，只陈述和 Token 相关的逻辑。

**token.js:**

首先这里使用 jsonWebtoken 库，需要运行`npm i jsonwebtoken`安装并导入；随后定义两个密钥，定义使用`jwt.sign`创建两个 Token 并设置过期时间的方法。

短 Token：`accessToken` 长 Token：`refreshToken`

```
const jwt = require('jsonwebtoken')const secretKey = 'a'const secretKeyx = 'b'const createAccessToken = user => {    return jwt.sign(        { username: user.username, uid: user.uid, nickname: user.nickname },        secretKey,        { expiresIn: 60 * 30 }    )}const createRefreshToken = user => {    return jwt.sign({ username: user.username }, secretKeyx, { expiresIn: '7d' })}
```

我们还需要一个验证`Token`的中间件函数，如下：

这里使用`jwt.verify`来验证`Token`的有效性，无效就返回，有效就获取解码负载给到后续中间件。

```
//token校验const verifyToken = async function (req, res, next) {    const token = req.headers.authorization.split(' ')[1]    jwt.verify(token, secretKey, function (err, decoded) {        if (err) {            res.status(401)            return res.send({ code: 4004, msg: 'token无效' })        }        req.data = decoded        next()    })}module.exports = { secretKey, secretKeyx, verifyToken, createAccessToken, createRefreshToken }
```

其中`req.headers.authorization.split(' ')[1]`用来获取前端请求头中的`Token`, 为什么需要这样获取呢？因为请求头中配置的 authorization 字段是由`'Breaer'`加`Token`组成的，这里是为了符合相应规范所以这样设置。

**tokenApi.js:**

接下来需要定义一个验证长`Token`并刷新短`Token`给到前端的 api：

```
const express = require('express')const jwt = require('jsonwebtoken')const { createRefreshToken, createAccessToken, secretKeyx } = require('../utils/token')const User = require('../models/User') //数据库const router = express.Router()router.use(express.json()) //解析post请求体router.post('/api/tokens/getAccessToken', async (req, res) => {    const { refreshToken } = req.body    jwt.verify(refreshToken, secretKeyx, async function (err, decoded) {        if (err) {            // console.log('verify error', err)            console.log('验证失败')            return res.status(200).send({ code: 4005, msg: 'token过期,请重新登录' })        }        const user = await User.findOne({ username: decoded.username })        if (!user) {            return res.status(200).send({ code: 4005, msg: 'token验证失败,请重新登录' })        }        const accessToken = createAccessToken({            username: user.username,            uid: user.uid,            nickname: user.nickname,        })        const refreshToken = createRefreshToken({            username: user.username,        })        console.log('刷新token')        res.status(200).send({            msg: 'token已刷新',            code: 2000,            data: { accessToken: accessToken, refreshToken: refreshToken },        })    })})module.exports = router
```

这里同样是使用`jwt.verify`方法验证长`Token`的有效性，有效就调用方法创建两个`Token`并返回给前端，若是长`Token`也无效，就告诉前端 Token 过期，请重新登陆。

哦不要忘了在用户登陆成功后要创建两个`Token`给到用户：

```
if (user.password !== password) {            res.send({ msg: '密码错误', code: 4003 })        } else {            const accessToken = createAccessToken(user)            const refreshToken = createRefreshToken(user)            res.send({                msg: '登陆成功',                code: 2000,                data: {                    accessToken: accessToken,                    refreshToken: refreshToken,                },            })        }
```

前端：
---

前端首先是登录嘛，登陆以后拿到后端返回的`Token`，首先就是要存到本地：

```
const login = async e => {        e.preventDefault()        const res = await userLogin(params)        localStorage.setItem('refreshToken', res.refreshToken)        localStorage.setItem('accessToken', res.accessToken)}
```

(暂时是直接存`localstorage`，后面还是准备用 redux 来管理)

然后是 axios 请求拦截器：

```
request.interceptors.request.use(    config => {        const token = localStorage.getItem('accessToken')        config.headers.Authorization = `Bearer ${token}`        return config    },    error => {        return Promise.reject(error)    })
```

拿到本地的`accessToken`并设置到请求头的 Authorization 字段中去，后面的 Bearer 之前也讲了，是因为相关规范。

最后就是和刷新`accessToken`相关的部分了，这一块是我研究下来最麻烦的一部分，可能讲的会不太清楚：

```
error => {        //响应拦截器错误处理        const res = error.response.data        return new Promise((resolve, reject) => {            // token过期            if (res.code === 4004) {                const { config } = error                getAccessToken({ resolve, config })            } else {                reject(error)            }        })    }
```

首先：在响应拦截器中判断状态码，我这里是自定义的`4004`为 token 失效，随后获取到`error`对象中的`config`对象，这里面是本次失败请求的相关配置，等会刷新完成后就是使用它进行重新请求，随后调用一个方法`getAccessToken`并传入对象参数`{resolve,config}`；

```
const requestList = []let flag = trueexport const getAccessToken = async ({ resolve, config }) => {    requestList.push({ resolve, config })    if (flag) {        flag = false        await refreshToken()        retryRequest()        flag = true    }}
```

这个方法将对象保存到一个请求数组`requestList`里, 然后进入一个`if`逻辑，里面两个方法分别是调用接口刷新`accessToken`和重新发送失败的请求。

这里的`flag`主要是用来判断当前是否正在刷新`Token`：一开始第一个请求失败了，进入了刷新`Token`的过程，如果不把`flag`改为 false，在刷新`Token`的过程中若又有失败的请求进入这个方法，那么会再次刷新`Token`，造成`Token`的多次刷新，实际场景就是几个请求并发，都被告知`Token`失效，都会进入这个方法；

```
const refreshToken = async () => {    const refreshToken = localStorage.getItem('refreshToken')    try {        const res = await request.post('/tokens/getAccessToken', { refreshToken: refreshToken })        localStorage.setItem('accessToken', res.accessToken)        localStorage.setItem('refreshToken', res.refreshToken)        console.log('token刷新成功')    } catch (err) {        if (err.code === 4005) {            console.log('err:', err)            router.navigate('./login')            requestList.length = 0        }    }}const retryRequest = async () => {    requestList.forEach(({ resolve, config }) => {        resolve(request(config))    })    requestList.length = 0}
```

随后就是那两个方法，用来刷新`Token`和重新请求，如果`refreshToken`也过期了就会导致刷新失败，直接跳转到登录页，注意不管刷新成功还是失败最后都需要将请求列表清零。

最后
==

Token 的无感刷新基本就实现完了，但我还发现了一个问题，暂时不知道怎么解决：

在我测试的时候，如果有 `10`个 并发的请求，后端处理后全都返回`401`，然后肯定会有第一个回到前端的请求触发`token`刷新，随后若是`token`刷新完成，`flag`已经置为`true`，还有后续请求没有来得及回到前端被添加到队列中，他又会重新进入刷新`token`的逻辑，会导致`token`的多次刷新。