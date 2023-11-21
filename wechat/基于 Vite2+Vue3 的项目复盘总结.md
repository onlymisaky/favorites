> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/9sn_L6XrMFcNqq10FxgdiQ)

点击上方 高级前端进阶，回复 “加群”  

加入我们一起学习，天天进步

1. 项目背景与技术选型
------------

### 1.1 项目背景

我们要做一个基于边缘计算的物联网管理平台雏形，流程大概是这样：数据（传感器收集通过串口传入边缘节点服务器）经过边缘节点计算处理后上传到云端，然后再经过一些处理后得到一个数据仓库。用户可以基于这个数据仓库可以对设备状态、健康度进行可视化管理。总的来说就是要做三套系统：

*   边缘节点设备管理系统
    
*   云端管理系统
    
*   大屏可视化系统
    

业务听起来高大上，但是对于我来说实际上还是增删改查😂，大屏可视化稍微有些难点。

那问题来了：简单的增删改查项目如何搞出花来呢，那么就涉及到接下来的技术选型了。

### 1.2 技术选型

我觉得技术选型一定得从需求和业务出发，这是最重要的，不能为了使用新技术而使用。虽然说这么说，但我还是选择了比较新的技术，原因是我们这套业务系统算是一个产品雏形，也**不需要兼容任何版本 IE 浏览器**，产品的周期与稳定性都还不确定，而且我们要在很短的时间内做出一个雏形，另外我确实想把刚学的技术实践一下，不然确实会忘了噢😂。

基于这样的考虑，我选择了当时发布不久（刚发布一周不到）的`Vite2.0`作为我们项目的脚手架，选择`Vue3.0`进行开发，UI 框架是还处于 Beta 版本的`Element-Plus`，甚是刺激！我简单画了一张图：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHp90D6RnMU4HRqCwSEHZvcJZQeqQs5Lcegb4XrueNdCgztL7RcbT62pEtGCRL5OIHW0uvMkq0mkQQ/640?wx_fmt=png)image.png

接下来对项目涉及到的知识进行梳理与总结，我希望从这个 “增删改查” 项目学到一些不一样的知识，如果对您也有用，那就更好啦😀。

2. 基础设施搭建
---------

在讲述前，先把我画的线框图呈上，方便对整个项目的基础设施有个大概的了解：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHp90D6RnMU4HRqCwSEHZvcJTcyXzia6e3YvCqVicuicW1yBd3yViatWiaJVYkV1tpxJBafiblZt5Vqbuvhw/640?wx_fmt=png)image.png

Vite 创建 Vue3.0 项目很简单，一行命令可以搞定：

```
yarn create @vitejs/app my-vue-app --template vue# 如果需要交互式命令创建yarn create @vitejs/app复制代码
```

具体细节可以参考文档。

创建出来的目录很简单，但是这远远不够啊，接下来我们需要把一些重要的基础设施搭起来。

### 2.1 缺陷管理

当时也是刚学完，不知道如何搭建一个项目，但是有一个是必须要去做的：团队开发规范。我采用的是业内比较成熟的方案：

*   语法风格检测：`ESLint+Prettier`
    
*   Git Message 提交规范：Angular 提交规范
    

#### 2.1.1 代码风格约束

我们先来看看在 Vue3.0 的项目中如何使用`ESLint`和`Prettier`对代码风格进行约束。

首先安装这几个包：

*   `eslint`：代码质量检测（用`var`还是`let`，用`==`还是`===`...）
    
*   `prettier`：代码风格检测（加不加尾逗号，单引号还是双引号...）
    
*   `eslint-config-prettier`：解决 ESLint 与 Prettier 的风格冲突
    
*   `eslint-plugin-prettier`：ESLint 的插件，集成 Prettier 的功能
    
*   `eslint-plugin-vue`：ESLint 的插件，增加 Vue 的检测能力
    

```
yarn add eslint prettier eslint-config-prettier eslint-plugin-prettier eslint-plugin-vue -D
复制代码
```

接下来在项目根目录下创建两个文件`.eslintrc.js`和`prettier.config.js`（拓展名可以自由选择），我们把下面内容加进去：

**.eslintrc.js**

```
module.exports = {  parser: 'vue-eslint-parser',  env: {    browser: true,    node: true,    es2021: true  },  extends: ['plugin:vue/vue3-recommended', 'plugin:prettier/recommended'],  parserOptions: {    ecmaVersion: 12,    sourceType: 'module'  },  rules: {    'prettier/prettier': 'error'  }}复制代码
```

**prettier.config.js**

```
module.exports = {  printWidth: 100,  tabWidth: 2,  useTabs: false,  semi: false, // 未尾逗号  vueIndentScriptAndStyle: true,  singleQuote: true, // 单引号  quoteProps: 'as-needed',  bracketSpacing: true,  trailingComma: 'none', // 未尾逗号  arrowParens: 'always',  insertPragma: false,  requirePragma: false,  proseWrap: 'never',  htmlWhitespaceSensitivity: 'strict',  endOfLine: 'lf'}复制代码
```

然后使用`ctrl+shift+P`调出控制台输入`Reload Window`配置即可生效，以后想拓展代码的风格都在`prettier.config.js`进行配置，而代码语法相关规则在`.eslintrc`中的 rules 配置即可。相关规则文档：

*   ESLint Rules
    
*   Prettier 中文网
    

#### 2.1.2 Git 提交约束

接下来我们需要对我们的提交进行约定，先安装一下这几个包：

*   `husky`：触发 Git Hooks, 执行脚本
    
*   `lint-staged`：检测文件，只对暂存区中**有改动的文件**进行检测，可以在提交前进行 Lint 操作
    
*   `commitizen`：使用规范化的`message`提交
    
*   `commitlint`: 检查`message`是否符合规范
    
*   `cz-conventional-changelog`：适配器。提供`conventional-changelog`标准（约定式提交标准）。基于不同需求，也可以使用不同适配器（比如: `cz-customizable`）。
    

```
yarn add husky lint-staged commitizen @commitlint/config-conventional @commitlint/cli  -D
复制代码
```

先配置适配器：

```
# yarnnpx commitizen init cz-conventional-changelog --yarn --dev --exact# npmnpx commitizen init cz-conventional-changelog --save-dev --save-exact复制代码
```

它会在本地项目中配置适配器，然后去安装`cz-conventional-changelog`这个包，最后在`package.json`文件中生成下面代码：

```
"config": {    "commitizen": {      "path": "cz-conventional-changelog"    }  }复制代码
```

现在我们可以添加一个脚本就可以编写规范化的提交：

```
"scripts": {    "cz": "git cz"  }复制代码
```

接下来你可以执行`yarn cz`命令来编写一些约定好的提交规范：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHp90D6RnMU4HRqCwSEHZvcJ3HicGCKdPXNLCpkNygMg5NOQFOLnLXESgAsvvfAUqWVRa3CJbNx4h6g/640?wx_fmt=png)image.png

此时我们已经根据约定规范提交了消息，但是我们怎么知道提交的消息是不是正确的呢，那么接下来就需要配置刚刚介绍到的`commitlint`，只需要一句命令即可完成配置, 它会在项目根目录下面创建一个`commitlint.config.js`配置文件:

```
echo "module.exports = {extends: ['@commitlint/config-conventional']};" > commitlint.config.js复制代码
```

它会使用`@commitlint/config-conventional`这个包里面提供的校验规则进行校验，你可以理解为 ESLint 的规则。

有了这个校验工具，怎么才可以触发校验呢，我们希望在提交代码的时候就进行校验，这时候`husky`就可以出场了，他可以触发`Git Hook`来执行相应的脚本，而我们只需要把刚刚的校验工具加入脚本就可以了，我们使用的是 6.0 的新版本，下面是具体使用方法：

我们需要定义触发 hook 时要执行的 Npm 脚本：

*   提交前对暂存区的文件进行代码风格语法校验
    
*   对提交的信息进行规范化校验
    

```
"scripts": {    "lint-staged": "lint-staged",    "commitlint": "commitlint --config commitlint.config.js -e -V"  },  "lint-staged": {    "src/**/*.{js,vue,md,json}": [      "eslint --fix",      "prettier --write"    ]  }复制代码
```

接下来就是配置 husky 通过触发 Git Hook 执行脚本：

```
# 设置脚本`prepare`并且立马执行来安装，此时在根目录下会创建一个`.husky`目录npm set-script prepare "husky install" && npm run prepare# 设置`pre-commit`钩子，提交前执行校验npx husky add .husky/pre-commit "yarn lint-staged"# 设置`pre-commit`钩子，提交message执行校验npx husky add .husky/commit-msg "yarn commitlint"复制代码
```

此时已经完成配置了，现在团队里面任何成员的提交必须按照严格的规范进行了。

#### 2.1.3 IDE 环境约束

除此之外，我们还统一了 VSCode 编码环境，通过`Setting Sync`插件使用 Public Gist 进行同步。

> 有人会说小团队做这个有必要吗？我实践了几个月后，我个人还是觉得很有必要的，虽然刚开始配置起来很麻烦，也踩了不少坑，但实际去执行这套流程其实不需要花太多时间，至少可以在开发阶段避免除了代码逻辑以外的错误。

### 2.2 持续集成（CI）

`持续集成`是自动化流程中一个十分重要的部分，我们的前端应用在传统部署模式下需要自己打包然后上传服务器，这样很麻烦也很浪费时间。而持续集成就帮我们解决了这个问题，我们只要开发一个功能，它就能上传到线上的`制品库`，再配合持续部署（CD）就能够提高我们的效率，让我们专注开发。这一套流程需要有以下技术或平台支撑：

*   Docker（容器化技术）
    
*   Linux
    
*   Nginx：高性能 Web 服务器
    
*   Jenkins：持续构建平台
    
*   GitLab（本地部署的仓库）
    
*   Nexus3：用来部署 Npm、Docker 私有仓库，提供镜像制品库
    

由于篇幅原因，上述平台的搭建我不会给大家演示了。主要是给大家说一下这个 CI 流程：

*   开发功能
    
*   Git 提交到本地 GitLab
    
*   GitLab 触发 Webhook
    
*   Jenkins 开发执行脚本构建成 Docker 镜像
    
*   上传 Nexus 私有仓库
    

![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHp90D6RnMU4HRqCwSEHZvcJE1YrSRKvIHK5CX1Zx1kUCsg6V3RCNZ7b74qY8dzcVRtHvUTLL6eS5w/640?wx_fmt=png) image.png

现在有了制品仓库就需要`持续部署（CI）`，但是我技术能力不够，只能借助 Jenkins 执行脚本来实现，但是原则上来说在 Docker 容器里面部署 Docker 容器这样的做法并不好，很容易出现一些问题，我想学习完`Kubernetes`后再来对这个流程进行优化。

搭建完流程后，我们只需要在项目中写好`Dockerfile`和`Nginx`的配置文件就可以了，下面是我项目中的一个案例：

**Dockerfile**

```
# build stageFROM node:lts-alpine as build-stageWORKDIR /appCOPY . .RUN yarn && yarn build# production stageFROM nginx:stable-alpine as production-stageCOPY --from=build-stage /app/dist/ /usr/share/nginx/html/COPY --from=build-stage /app/nginx.conf /etc/nginx/conf.d/default.confEXPOSE 80CMD ["nginx", "-g", "daemon off;"]复制代码
```

**nginx.conf**

```
server {  listen 80;  server_name localhost;  #charset koi8-r;  access_log /var/log/nginx/host.access.log main;  error_log  /var/log/nginx/error.log  error;  location / {    root /usr/share/nginx/html;    try_files $uri $uri/ @router;    index index.html;    expires -1;  }  location @router {    rewrite ^.*$ /index.html last;  }  # SPA应用的history模式路由需要在前端配置500、400错误}复制代码
```

这里涉及到很多知识，篇幅有限，就不详细说了。

### 2.3 CSS 样式管理

> 由于 Vite 的目标仅为现代浏览器，因此建议使用原生 CSS 变量和实现 CSSWG 草案的 PostCSS 插件（例如 postcss-nesting）来编写简单的、符合未来标准的 CSS。

官方其实是建议使用 CSS 变量来编写 CSS，但是考虑到现阶段大家用得不是很熟练，所以还是采用了 Sass，而且脚手架已经内置了对 Sass 的支持，我们只需要安装即可, 不用像`Webpack`那样需要先安装`Loader`。

```
yarn add sass -D
复制代码
```

这样我们在模板里面的只要给`<style>`标签加上`lang`就可以了：

```
<style lang="scss" scoped>// ...</style>复制代码
```

我是按照下面的文件组织来对 CSS 进行统一管理的：

**src/assets/styles:**

*   variables.scss（存放全局 Sass 变量）
    
*   mixins.scss（mixin）
    
*   common.scss（公共样式）
    
*   transition.scss（过渡动画样式）
    
*   index.scss（导出上面三个样式）
    

**index.scss**：

```
@import './variables.scss';@import './mixins.scss';@import './common.scss';@import './transition.scss';复制代码
```

然后在`main.js`导入`index.scss`就可以使用了：

```
import '/src/assets/styles/index.scss'复制代码
```

但是这里会有一个坑，那就是我在`variables.scss`中定义的变量、在`mixins.scss`定义的 mixin 全部失效了，而且控制台也报错：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHp90D6RnMU4HRqCwSEHZvcJG9icPQwdvYfpLSWxxlFkGNPv6BjwkGSPHVOuy00icVBBYHp6pfFJLeHw/640?wx_fmt=png)image.png

如果不使用这个变量，我在 Chrome 是可以看到其他样式已经被编译好的，所以我采取了第二种方式导入`index.scss`。我们需要在 vite 的配置文件给 css 的预处理器进行配置，它的使用方式和`Vue CLI`中的配置差不多：

**vite.config.js**

```
export default defineConfig({  plugins: [vue()],  css: {    preprocessorOptions: {      scss: {        additionalData: `@import "src/assets/styles/index.scss";`      }    }  }})复制代码
```

这样就完成了 CSS 的管理啦，当然我这种比较简单，现在还有一种比较新的用法就是使用 CSS Module，希望将来能用上吧。

> `Sass`的编写指南，大家可以参考一下：Sass Guidelines

### 2.4 接口管理

#### 2.4.1 基于 Axios 二次封装

基于 Axios 二次封装已经是一种常规操作了，下面来看看项目中我是如何对 API 进行管理的：

*   抽象一个 HttpRequest 类，主要有请求拦截 / 取消、REST 请求（GET、POST、PUT、Delete）、统一错误处理等功能
    
*   实例化这个类，然后分模块编写 API 请求函数，URL 这种常量单独放一个文件，接口请求参数和请求体由使用者决定，最后导出一个对象出口
    
*   在组件引入对应的模块即可使用
    

Vue3.0 中最推荐的使用方式是`Composition API`，组件中`this`不推荐使用，所以如果想全局引入，需要这么做：

```
import { createApp } from 'vue'import App from './App.vue'import http from '@/api'const app = createApp(App)app.config.globalProperties.http = httpapp.mount('#app')复制代码
```

在组件中使用：

```
import { getCurrentInstance } from 'vue'const {    proxy: { http }  } = getCurrentInstance()// demo...async fetchData() { await http.getData(...)}复制代码
```

而之前在 Vue2 中我们只需要在`Vue.prototype`上定义属性，然后在组件中使用`this`引入就可以了。但是全局引入会导致 Vue 原型很臃肿，每个组件的实例都会有这个属性，会造成一定的性能开销。

Vue3 这种全局引入的做法我觉得也很麻烦，所以我的做法是在使用的组件中导入对应的 API 模块。

> 打个小广告：详细的 Axios 封装可以参考我的另外一篇文章在 Vue 项目中对 Axios 进行二次封装。

#### 2.4.2 载入不同模式下全局变量

此外，我们也可以通过使用`.env`文件来载入不同环境下的全局变量，Vite 中也使用了 dotenv 来加载额外的环境变量，设置的全局变量必须以`VITE_`为前缀才可以正常被加载，使用方式如下：

**.env.development**

```
# 以下变量在`development`被载入VITE_APP_BASE_API = '/api/v1'复制代码
```

**.env.production**

```
# 以下变量在`production`被载入VITE_APP_BASE_API = 'http://192.168.12.116:8888/api/v1'复制代码
```

全局变量使用方式：

```
import.meta.env.VITE_APP_BASE_API复制代码
```

#### 2.4.3 跨域问题

Vite 是基于 Node 服务器开发的，所以它也提供了一些配置来实现本地代理，使用方式大家应该很熟悉，这里直接上一个例子：

**vite.config.js**

```
server: {    open: true,    proxy: {      '/api/v1/chart': {        target: 'http://192.168.12.116:8887',        changeOrigin: true      },      '/api/v1': {        target: 'http://192.168.12.116:8888',        changeOrigin: true,        rewrite: (path) => path.replace(/^\/api/v1, '')      }    }  }复制代码
```

如果线上的服务器后端服务器不是同源部署也会有跨域问题，那么需要在`Ngnix`中配置反向代理，好在后端实现了 CORS 规范，那我们不需要操心线上的跨域问题了。当然解决跨域的方式有很多，下面要介绍的`WebSocket`就没有这个问题。

到这里接口管理相关问题也差不多说完了，项目接口数量并不是特别多，就 20 多个吧，所以并没有把全部接口全部交给`Vuex`接管，只有一少部分组件依赖的全局状态才放到`Vuex`中。

#### 2.4.4 WebSocket+Vuex 状态管理方案

大屏项目有将近 20 多个图表都是实时数据，包括设备健康度状态、设备运行指标等等，必须使用`WebSocket`。但是我们项目是 SPA 应用，每个组件都需要发消息，并且需要共享一个`WebSocket`实例，跨组件通信很麻烦，所以需要对这一块进行封装。

网上找了很多方案都没有解决我的问题，但是偶然却翻到了一个大佬的文章（websocket 长连接和公共状态管理方案），他的文章里提到了基于`WebSocket+Vuex`实现 “发布 - 订阅” 模式对全局组件状态进行统一管理。我看完后受益匪浅，我这才知道如果把设计模式用于开发中能有如此“功效”。

我基于大佬的封装又优化了一些：

*   对一些代码细节进行了修改和优化
    
*   使用`Class`语法糖增强代码可读性
    
*   增加了数据分发的功能
    

下面是一个简单的图：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHp90D6RnMU4HRqCwSEHZvcJoURv8rHN4FIZPicpNQIjvp46hItpsvWxMe3JMO7hvkZVjPH4xOjZpiaQ/640?wx_fmt=png)image.png

组件通过`emit`方法来发送消息，消息里面标识了任务名，后端返回的数据里面也会返回这个任务名，这就形成了一个 “管道”。Vuex 通过订阅所有消息，然后根据任务名`commit`对应的`mutation`来完成状态变更，最后组件通过 Vuex 的`store`或者`getter`就能拿到数据了。

下面是一个完整的例子：

首先封装一个`VueSocket`类，它有发布、订阅、断线重连、心跳检测、错误调度等功能。组件只需要通过`emit`方法来发布消息，通过`subscribe`方法订阅服务端消息，然后通过 Vuex 的`mutation`来分发消息。

我们目前只需要关注`emit`和`subscribe`两个方法，当然`handleData`这个函数也很重要，主要是对来自不同任务的数据进行分发。

**src/utils/VueSocket.js**

```
class VueSocket {  /**   * VueSocket构造器   * @param {string} url socket服务器URL   * @param {function} commit Vuex中的commit函数，提交mutation触发全局状态变更   * @param {function} handleData 数据分发处理函数，根据订阅将数据分发给不同的任务处理   */  constructor(url, commit, handleData = null) {    this.url = url // socket连接地址    this.commit = commit    this.distributeData = handleData    this.ws = null // 原生WebSocket对象    this.heartbeatTimer = null    this.errorResetTimer = null // 错误重连轮询器    this.disconnectSource = '' // 断开来源: 'close' 由close事件触发断开, 'error'由error事件触发断开    this.reconnectNumber = 0 // 重连次数    this.errorDispatchOpen = true // 开启错误调度    this.closeSocket = false // 是否关闭socket    this.init()  }  /**   * 错误调度   * @param {string} type 断开来源=> 'close' | 'error'   * @returns {function}   */  static errorDispatch(type) {    return () => {      if (this.disconnectSource === '' && this.errorDispatchOpen) {        this.disconnectSource = type      }      console.log(`[Disconnected] WebSocket disconnected from ${type} event`)      // socket断开处理(排除手动断开的可能)      if (this.disconnectSource === type && !this.closeSocket) {        this.errorResetTimer && clearTimeout(this.errorResetTimer)        VueSocket.handleDisconnect()      }    }  }  /**   * 断开处理   * @returns {undefined}   */  static handleDisconnect() {    // 重连超过4次宣布失败    if (this.reconnectNumber >= 4) {      this.reconnectNumber = 0      this.disconnectSource = ''      this.errorResetTimer = null      this.errorDispatchOpen = false      this.ws = null      console.log('[failed] WebSocket connect failed')      return    }    // 重连尝试    this.errorResetTimer = setTimeout(() => {      this.init()      this.reconnectNumber++      console.log(`[socket reconnecting ${this.reconnectNumber} times...]`)    }, this.reconnectNumber * 1000)  }  /**   * 事件轮询器   * @param {function} event 事件   * @param {number|string} outerConditon 停止条件   * @param {number} time   * @param {function} callback   */  static eventPoll(event, outerConditon, time, callback) {    let timer    let currentCondition    timer = clearInterval(() => {      if (currentCondition === outerConditon) {        clearInterval(timer)        callback && callback()      }      currentCondition = event()    }, time)  }  /**   * 初始化连接，开始订阅消息   * @param {function} callback   */  init(callback) {    // 如果已经手动关闭socket，则不允许初始化    if (this.closeSocket) {      throw new Error('[Error] WebSocket has been closed.')    }    // 清除心跳检测计时器    this.heartbeatTimer && clearTimeout(this.heartbeatTimer)    this.ws = new WebSocket(this.url)    this.ws.onopen = () => {      callback && callback()      this.reconnectNumber = 0      this.disconnectSource = ''      this.errorResetTimer = null      this.errorDispatchOpen = true      // 订阅消息      this.subscribe()      // 开启心跳侦测      this.heartbeatDetect()      console.log('[Open] Connected')    }    this.ws.onclose = VueSocket.errorDispatch('close')    this.ws.onerror = VueSocket.errorDispatch('error')  }  /**   * 订阅器   */  subscribe() {    this.ws.onmessage = (res) => {      if (res.data) {        const data = JSON.parse(res.data)        // 根据任务类型，分发数据        try {          this.distributeData && this.distributeData(data, this.commit)        } catch (e) {          console.log(e)        }      }      // 收到消息关闭上一个心跳定时器并启动新的定时器      this.heartbeatDetect()    }  }  /**   * 发布器（组件发消息的）   * @param {String} data   * @param {Function} callback   */  emit(data, callback) {    const state = this.getSocketState()    if (state === this.ws.OPEN) {      this.ws.send(JSON.stringify(data))      callback && callback()      this.heartbeatDetect()    } else if (state === this.ws.CONNECTING) {      // 连接中轮询      VueSocket.eventPoll(state, this.ws.OPEN, 500, () => {        this.ws.send(JSON.stringify(data))        callback && callback()        this.heartbeatDetect()      })    } else {      this.init(() => {        this.emit(data, callback)      })    }  }  /**   * 心跳侦测   */  heartbeatDetect() {    this.heartbeatTimer && clearTimeout(this.heartbeatTimer)    this.heartbeatTimer = setTimeout(() => {      const state = this.getSocketState()      if (state === WebSocket.OPEN || state === WebSocket.CONNECTING) {        // 发送心跳        this.ws.send('ping')      } else {        this.init()      }    }, 50000)  }  /**   * 手动关闭连接   */  close() {    this.heartbeatTimer && clearTimeout(this.heartbeatTimer)    this.errorResetTimer && clearTimeout(this.errorResetTimer)    this.closeSocket = true    this.ws.close()  }  /**   * 手动连接   */  open() {    if (!this.closeSocket) {      throw new Error('[Error] WebSocket is connected')    }    this.heartbeatTimer = null    this.reconnectNumber = 0    this.disconnectSource = 0    this.errorResetTimer = null    this.errorDispatchOpen = true    this.closeSocket = false    this.init()  }  /**   * 获取当前socket状态   */  getSocketState() {    return this.ws.readyState  }}export default VueSocket复制代码
```

在 Vuex 中定义初始化`WebSocket`连接的`action`和`mutation`：

```
import { createStore, createLogger } from 'vuex'import VueSocket from '@/utils/VueSocket'import { round } from '@/use/useToolFunction'import {  handleData} from '@/utils/handleSocketData' // 分发任务的关键函数import { WEBSOCKET } from '@/config' // 导出一个常量const debug = import.meta.env.MODE.startsWith('dev')const store = createStore({  state: {    ws: null // websorket实例  },  mutations: {    // 初始化socket连接    createSocket(state, { commit }) {      const baseURL = `${import.meta.env.VITE_APP_SOCKET}?portName=${        WEBSOCKET.TARGET      }`      state.ws = new VueSocket(baseURL, commit, handleData)    },  },  actions: {    // 创建实例    socketInit({ commit }) {      commit('createSocket', { commit })    }  }  // debug console  // plugins: debug ? [createLogger()] : [],})export default store复制代码
```

重点说一下这个`handleData`方法吧，`VueSocket`实例调用`subscribe`方法后就会订阅服务器所有的消息，而这个方法就是根据消息里面的任务名把消息送达各个组件。

比如现在有一个场景：有很多设备的子设备健康度需要实时展示：

```
const handleData = (data, commit) => {  // 当前任务  const [task] = Object.keys(data)  // 任务执行器  const taskRunner = {    healthRunner() {      const {        message: { dataContent }      } = data[task]      // 更新状态      dataContent &&        commit('updateHealthDegree', {          prop: task,          healthDegree: dataContent[0].health        })    },    defaultRunner(mutation) {      const {        message: { dataContent }      } = data[task]      // 更新状态      dataContent && commit(mutation, dataContent)    }  }  // 任务映射委托  const taskMap = {    // 健康度    completeMachineHealthDegree() {      taskRunner.healthRunner()    },    pressureHealthDegree() {      taskRunner.healthRunner()    },    axletreeHealthDegree() {      taskRunner.healthRunner()    },    gearboxHealthDegree() {      taskRunner.healthRunner()    }  }  // 执行任务  if (task in taskMap) {    taskMap[task]()  }}复制代码
```

这个方法十分关键，所有的任务其实只是一个对象中的属性，然后映射的值是一个函数，只要判断这个任务在这个对象里面就会执行对应的函数。而最后任务的执行器其实就是调用了传进来的`commit`函数，触发`mutation`变更状态。我最开始是使用`if/else`或者`switch/case`来处理这个逻辑，但是随着任务越来越多（20 多个），代码可读性也变得糟糕起来，所以想了这个办法处理。

下面是 Vuex 的定义，`store/getters`必须与任务名对应：

```
state: {    completeMachineHealthDegree: 1, // 整机健康度    pressureHealthDegree: 1,        // 液压系统健康度    axletreeHealthDegree: 1,        // 泵健康度    gearboxHealthDegree: 1          // 齿轮箱健康度},getters: {    pressureHealthDegree(state) {      return round(state.pressureHealthDegree, 2)    },    axletreeHealthDegree(state) {      return round(state.axletreeHealthDegree, 2)    },    gearboxHealthDegree(state) {      return round(state.gearboxHealthDegree, 2)    },    completeMachineHealthDegree(state) {      return round(state.completeMachineHealthDegree, 2)    }},mutation: {    // 健康度    updateHealthDegree(state, { healthDegree, prop }) {      state[prop] = healthDegree    }}复制代码
```

万事俱备只欠东风，有了初始化连接的方法后，现在`App.vue`这个组件触发一下`action`：

**App.vue**

```
import { useStore } from 'vuex'const store = useStore()store.dispatch('socketInit')复制代码
```

连接建立后，就可以搞事情咯。我们先根据后端的数据格式封装一个`Compostion Function`，因为有很多组件都需要使用这个实例发消息。

**src/use/useEmit.js**

```
import { useStore } from 'vuex'function useEmit(params) {  const store = useStore()  const ws = store.state.ws  const data = {    msgContent: `${JSON.stringify(params)}`,    postsId: 1  }  ws.emit(data)}export default useEmit复制代码
```

在组件里面使用：

**HealthChart.vue**

```
import useEmit from '@/use/useEmit'// params由父组件传进来，这里就不详细展开了const params = { ... }onMounted(() => {    useEmit(params)})复制代码
```

然后通过`watch`或`watchEffect`方法监听数据变化，每次变化都去调用`echarts`实例的`setOption`方法来重绘图表，这样就可以实现动态数据变更了，这里就不展开讲了。

#### 2.4.5 数据 Mock

我们是前后端同步开发，有时候会出现前端开发完接口没开发完的情况，我们可以先根据接口文档（没有接口文档可以问后端要数据库的表）来 Mock 数据。我们通常有下面的解决方法：

*   使用`mockjs`
    
*   使用 Node 部署一个`MockServer`
    
*   使用静态`JSON`文件
    

第一种我们比较常用，但是浏览器`NetWork`工具看不到发不出去的请求；第二种需要单独写一套 Node 服务，或者用第三方服务本地部署，很好用，但是有些麻烦；第三种比较原始就不考虑了。

最后使用了 vite-plugin-mock，这是一个基于 Vite 开发的插件。

> 提供本地和生产模拟服务。vite 的数据模拟插件，是基于 vite.js 开发的。并同时支持本地环境和生产环境。Connect 服务中间件在本地使用，mockjs 在生产环境中使用。

先安装：

```
yarn add mockjs
yarn add vite-plugin-mock -D
复制代码
```

配置：

```
// vite.config.jsimport { viteMockServe } from 'vite-plugin-mock'export default defineConfig({  plugins: [    vue(),    viteMockServe({      supportTs: false    })  ]})复制代码
```

它默认会在根目录下请求`mock`文件下的数据，不过可以进行配置。先这个文件下配置需要的数据，然后在组件发请求就可以了。

```
// mock/index.jsexport default [  {    url: '/api/get',    method: 'get',    response: ({ query }) => {      return {        code: 0,        data: {          name: 'vben'        }      }    }  },  {    url: '/api/post',    method: 'post',    timeout: 2000,    response: {      code: 0,      data: {        name: 'vben'      }    }  }]复制代码
```

3. 项目遇到的坑
---------

`Vite`和`Vue3`都是较新的技术，而且使用 UI 框架也是`beta`版本，遇到的坑真是不少，大部分的坑都是靠着官方的`issue`来解决的，好在都能找到对应的`issue`，不然得自己提`issue`等待回复了。

### 3.1 启动项目就报错（esbuild error）

后面查看相关 issue，主要可以从下面几个方法尝试：

*   不要用中文名路径
    
*   不用`Git Bash`来启动
    
*   删除`node_modules`重新安装
    
*   将`npm`换成`yarn`
    

具体 issue 忘记记录了，大家如果也碰到相关问题可以按照上面的方式尝试。

### 3.2 `@vue/compiler-sfc` 3.0.7 版本后打包后，`style scoped`里面的样式失效

相关 issues：

*   Scoped CSS not generating correctly
    
*   Vue 3 scoped styles do not work on preview
    

解决方案：将`@vue/compiler-sfc`锁定为版本`3.0.7`

### 3.3 父组件使用`ref`访问子组件（子组件使用了 setup sugar）时，`ref`值为`{}`

相关 issue：

*   Setup sugar cannot pass the ref object to the ref function param.But I can get the ref object correctly with no sugar
    

官方目前还在讨论具体的解决方案，我们现在只需要在这种场景下让子组件不使用`setup sugar`。

4. 可优化的地方
---------

### 4.1 线上错误监控（sentry）

Vite 生产环境下是通过`rollup`进行打包的，即使本地开发进行了测试也没有复现的 BUG，但是我们是无法知道用户的使用场景的，线上的 BUG 总会有我们想不到的地方，这一块的基础设施后续有时间必须安排上。

### 4.2 Monorepo

我为了追求速度，搭建完一套系统后，就复制它给其他系统用。但其实里面有很多可以复用的模块，除了上传私有`Npm`，还有一个更好的方式就是`Monorepo`，它把所有子项目集中在一起管理，而且这几个子项目都跟业务强相关, 不用再切来切去了，最重要就的就是它只需要走一套`CI/CD`流程就行了。

### 4.3 Git 工作流

Git 工作流没有搭建是因为我们就 2-3 个人，走这套流程时间不允许。但是以后有新成员加入，团队人员变多后就需要这套工作流了。

### 4.4 定制脚手架

项目搭建完，可以把一些业务代码与配置抽离出去，然后搭建一个自己的脚手架，当然也可以基于业务定制化脚手架，这样以后有相关架构的项目可以直接基于这个脚手架开发，节省前期基础设施搭建的时间。

### 4.5 多个 Echarts 组件实时渲染数据掉帧，吃内存

这是我之前没有考虑到的性能优化问题，我以为我考虑很全面了，结果还是把最重要的性能优化给忘了，这是我的失职。所以以后开发任何业务功能，都需要考虑性能，在满足基本需求下，加大量级去考虑问题。

比如我这个 Echarts 图表渲染问题，20 多个图表，上万的数据实时渲染，目前还只是掉帧吃内存，如果把量级加大到几十万条数据呢？

5. 总结
-----

本文主要是对我前三个月所做项目的总结与反省，我从项目搭建角度出发，给大家讲述了如何让项目变得规范和严谨，最后得出一些自己的思考，我希望自己能从这次项目中成长起来，也希望给大家带来一次分享，从中受益，也欢迎大家批评指正。

最后还要提一嘴的是，我们的团队很小，也不是大公司，正因为这个原因我才有机会尝试这些新鲜技术，并用于实战，但是我们也需要承担自己的责任，出了任何问题都要站出来解决。

关于本文  

作者：不烧油的小火柴
==========

https://juejin.cn/post/6969758357288648718

The End

如果你觉得这篇内容对你挺有启发，我想请你帮我三个小忙：

1、点个 **「在看」**，让更多的人也能看到这篇内容

2、关注官网 **https://muyiy.cn**，让我们成为长期关系

3、关注公众号「高级前端进阶」，公众号后台回复 **「加群」** ，加入我们一起学习并送你精心整理的高级前端面试题。

》》面试官都在用的题库，快来看看《《

```
“在看”吗？在看就点一下吧

```