> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/RFRGOKzkQz3phIrwfH_SCQ)

```
点击下方“前端开发爱好者”，选择“设为星标”

第一时间关注技术干货！



```

前言
--

什么是模块联盟 (Module Federation)？`让 JavaScript 应用间共享代码更加简单，团队协作更加高效。`

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/kzFgl6ibibNKqZGVSCbUVZU5PxU9mnCfERHas5tficP0wHHfjKLsvm00ct3Q46BvT1gNeJ3115xZRRjYXa0icJkKcg/640?wx_fmt=jpeg)

类似于服务端的微服务，`Module Federation`是一种支持前端应用分治的架构模式，它允许你在多个应用或微前端应用之间共享功能级代码，这种方案的好处是：

*   减少代码重复；
    
*   提升代码可维护性；
    
*   降低应用程序的整体大小；
    
*   提高应用程序的性能；
    

**什么是 Module Federation 2.0?**  
除了老版本已支持的模块导出、模块加载、依赖共享之外，额外支持了：

*   📝 **Manifest**：定义`Module Federation`元数据信息；
    
*   🚀 **动态类型提示**：使用远端模块时，和引入 npm 包一样的体验，支持类型提示，并且还支持热更新；
    
*   🎨 **Module Federation 运行时**：支持通过运行时 API 注册共享依赖、动态注册和加载远程模块；
    
*   🧩 **运行时插件系统**：提供了一套轻量的运行时插件系统，提供各种生命周期钩子，并可修改 MF 配置；
    
*   🛠️ **Chrome Devtool**：开发调试利器；
    

目前有哪些构建框架支持 Module Federation?

*   rspack: 需安装插件`@module-federation/enhanced`;
    
*   webpack: 需安装插件`@module-federation/enhanced`;
    
*   rsbuild: 需安装插件`@module-federation/rsbuild-plugin`;
    
*   Vite: 需安装插件`@module-federation/vite`, 不支持`dts`、`dev`配置选项;
    

案例
--

以实现一个共享的计数器为例，在远端`remote`项目中实现一个计数器组件，其他`host`项目可通过`MF`方式引入并使用。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/kzFgl6ibibNKqZGVSCbUVZU5PxU9mnCfERjhhwXnIy15ZxoLlEsbbb5ibPdsttxCSenhWicOEDBHFOp6iagVSu9HW4w/640?wx_fmt=jpeg)image.png

### 基础框架准备

在 host、remote 目录下分别按顺序执行以下步骤：

1.  在项目新建目录：
    

*   packages
    

*   host
    
*   remote
    

2.  host、remote 都使用`npm create rsbuild@latest`创建以 Rsbuild、Vue3 为基础框架的项目，框架选择使用`Vue`、`TypeScript`。
    

通过以上步骤我们建立了 host、remote 两个可运行的 APP，接下来进入正题，开始搭建支持`Module Federation`的应用。

### 安装 MF 环境

在`remote`、`host`项目安装`Module Federation`的 rsbuild 插件：

```
npm add @module-federation/enhanced
npm add @module-federation/rsbuild-plugin --save-dev


```

使用 Vue 的`tsx`实现组件，因此需要对 rsbuild 安装支持`jsx`的相应插件:

```
npm add @rsbuild/plugin-vue-jsx @rsbuild/plugin-babel -D


```

在`rsbuild.config.ts`中添加配置:

```
plugins: [
    pluginBabel({
      include: /.(?:jsx|tsx)$/,
    }),
    pluginVue(),
    pluginVueJsx(),
],


```

### remote 实现共享组件

在`components/counter/index.tsx`添加计时器组件代码，和写常规的 Vue 组件无任何区别。

```
import { defineComponent } from "vue";
import './index.css';

export default defineComponent({
  props: {
    count: {
      type: Number,
      required: true,
    },
  },
  emits: ['increase'],
  setup(props: { count: number }, { emit }) {
    console.log(props);
    return () => ( <button
      class="counter-button"
      onClick={ () => emit('increase', props.count) }>
      Remote counter: { props.count }
    </button>)
  },
});


```

组件提供了 count 属性以及事件`increase`。**接下来需要在`rs.build.ts`中通过`module federation`插件将`counter`组件以 remote 方式提供给其他项目。在`plugins`下添加`pluginModuleFederation`插件配置**：

```
pluginModuleFederation({
  name: 'remote',
  exposes: {
    './counter': './src/components/counter/index.tsx',
  },
}),


```

以 dev 方式启动`remote`项目，然后访问`http://localhost:3001/mf-manifest.json`，查看返回结果。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/kzFgl6ibibNKqZGVSCbUVZU5PxU9mnCfERd20DXFhbLAGyFNBl5E8iccgZPUJyExN0RxviaF6lgRC07UBmBIicibAIdw/640?wx_fmt=jpeg)image.png

**`module federation 2.0`其中的一个特性就是引入`minifest`元数据信息**，这里返回的正是使用`pluginModuleFederation`定义的 remote 信息。先着重看`exposes`列表，每一项即为我们在配置中定义的导出模块，例如 **`./counter`对应的就是返回信息中`id`为`remote:counter`一项** ，其中 assets 下包含`css`、`js`属性。

*   css: 还记得在`components/counter/index.tsx`中的代码有通过`import 'index.css'`引入 css 文件吗？而`static/css/async/__federation_expose_counter.css`正是`index.css` bundle 后的 css 文件。
    
*   js: manifest.json 包含两个 js 文件，一个是组件代码，另一个是`Federation`运行时代码；
    

*   `static/js/async/__federation_expose_counter.js`: counter 组件 bundle 后的 js 文件；
    
*   `static/js/vendors-node_modules_rspack_core_dist_cssExtractHmr_js-node_modules_vue_dist_vue_runtime_esm--6bd317.js`：还记得`Module Federation V2.0`提出的 **`Module Federation 运行时`** 特性吗？正是该文件所包含的运行时代码；
    

### host 使用共享组件

在`host`项目的`rsbuild.config.ts`中，为 plugins 部分添加`pluginModuleFederation`插件配置：

```
 pluginModuleFederation({
  name: 'host',
  remotes: {
    remote: 'remote@http://localhost:3001/mf-manifest.json'
  }
})


```

相比于 v1.0，v2.0 配置非常简单，仅需指定远端的`manifest.json`地址即可，而`manifest.json`文件就包含了远端模块或组件的元信息。

在`App.vue`文件中引入`remote`提供的 counter 组件并实现交互:

```
// script
const Counter = defineAsyncComponent(() => import('remote/counter'))

const onInrement = (val: number) => {
  count.value = val + 1;
}
// template
 <Counter :count="count" @increase="onInrement"></Counter>


```

**代码中使用`defineAsyncComponent`异步加载远端组件，这样的好处是安需动态加载，能减少应用包的大小。**

**虽然现在可以使用远端的`remote/counter`组件，但使用过程没有智能提示也是让人头痛。这不`Module Federation 2.0`就为我们带来了`类型提示`特性。**

远端默认开启`类型提示`，所以仅需要在`Host`侧的`tsconfig.json`添加配置，将`类型提示`引入到项目。

```
{
  "compilerOptions": {
    ...
    "paths": {
      "*": ["./@mf-types/*"]
    }
  },
}


```

`Host`的`Module Federation`插件会将远端的`@mf-types`下载下来并放到根目录下的`@mf-types`文件夹中。目录结构如下所示：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/kzFgl6ibibNKqZGVSCbUVZU5PxU9mnCfERsSkKUydFH5D216LI4nDibZGOBrULNvvTiag70QZ5AelKEFZNo8uvq2mA/640?wx_fmt=jpeg)image.png

目录中包含了 3 种类型定义：

*   运行时 API：`V2.0`支持动态加载远端模块，根目录下的`index.d.ts`文件就包含了动态加载相关的 API 定义，具体有`@module-federation/runtime`、`@module-federation/enhanced/runtime`、`@module-federation/runtime-tools`模块的类型定义；
    
*   远端组件、模块类型：如上文中定义的 Counter 组件，其类型定义包含在`@mf-types/remote/compiled-types/src/components/counter/index.d.ts`目录下；
    
*   依赖项类型：由于组件中引用了`Vue`，因此在`@mf-types/remote/node_modules`下能看到 Vue 的类型定义文件；
    

添加了`类型提示`配置后，我们写组件时就能方便的查看到远端组件定义的属性。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/kzFgl6ibibNKqZGVSCbUVZU5PxU9mnCfERnib8icvE2T8kibvWXGYt375xPTtibW2XMA4iaJotwhSHgMRssbtpbGw4lzQ/640?wx_fmt=jpeg)image.png

MF 使用问题
-------

### css 全局污染

和微前端框架类似，`Module Federation`也有 CSS 全局污染的问题。

在`remote`定义的 counter 组件有使用样式`counter-button`，假如`host`也同样定义了同名的 class `counter-button`，并设置`background-color: #F00`。运行结果是远端的样式将本地的样式覆盖，也就是说本地的样式被远端样式给污染了，这不是我们想要的结果。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/kzFgl6ibibNKqZGVSCbUVZU5PxU9mnCfERO27Dau7afPYqpY9Ag8U1icDgp7TyoFOm9iaCyt8OS96KRySCrWHM0NqA/640?wx_fmt=jpeg)image.png

`Module Federation`在后续计划有提到`sandbox`，如果能为共享模块提供沙箱模式，那`css`问题也会迎刃而解。

### 依赖复用

跨项目消费模块往往会碰到**重复依赖加载**、**依赖单例限制**等问题，这些问题可以通过设置 `shared` 来解决。

*   **重复依赖加载**
    
    例如`remote`、`host`都在使用 loadash，并且 lodash 包体积比较大。那么可以将其配置到`shared`选项，在两个项目的`rsbuild.config.ts`同时添加：
    
    ```
     shared: {
        lodash: {
          singleton: true,
          eager: true,
        }
      }
    
    
    ```
    
    重新请求`mf-manifest.json`文件，返回内容有增加`shared`相关信息。如果`host`已经加载过`lodash`模块，则不会再从远端请求 lodash 文件`static/js/async/vendors-node_modules_lodash_lodash_js.js`。
    
    ![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/kzFgl6ibibNKqZGVSCbUVZU5PxU9mnCfERz5LqsjLRqV84MGafibicg0hKBZDJGJBvgcrve7WoibVI1iaXyknSsMuicfQ/640?wx_fmt=jpeg)image.png
    
*   **依赖单例限制**
    

由于 react 项目只允许单例运行，不能多次加载，这时也需要将其配置到 shared 中。这种场景，需要在`host`、`remote`的`rsbuild.config.ts`同时配置:

```
shared: ['react, 'react-dom']


```

### State 状态

假如在`remote`项目中的组件有使用`pinia`创建 store，那么在`host`使用时会报如下错误：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/kzFgl6ibibNKqZGVSCbUVZU5PxU9mnCfERwaxaee6okPQbLuTuFyQRuMibkYKibZCSUSZT59AvYauwQAtmP5htiaAlg/640?wx_fmt=jpeg)image.png

原因是远端的`pinia`实体是在 main.ts 通过`app.use(createPinia())`创建，而直接使用组件时不会走`main.ts`流程。

要解决这个问题，需要动态的获取 app 实体，并在`useStore()`之前，保证`createPinia`已经执行。可通过以下方式动态获取 app 实体。

```
import { getCurrentInstance } from 'vue';
const { appContext } = getCurrentInstance()!;
appContext.app.use(createPinia());


```

### Vite 不支持类型提示

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/kzFgl6ibibNKqZGVSCbUVZU5PxU9mnCfERaOW2eproLfibYLm1XXqCbuH6YMibxbIzIXAC43JEA9ju2LbsVR0fWm8Q/640?wx_fmt=jpeg)image.png

`@module-federation/vite`目前还不支持`dts`配置，也就是不支持`Module Federation v2.0`的`类型提示`特性。如果想使用类型提示，只能绕道至`Webpack`或者`Rsbuild`。

### manifest.json 越来越大

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/kzFgl6ibibNKqZGVSCbUVZU5PxU9mnCfERzP4dYneUr9VYesOAFibM9zsWG5VKlibJVNZ8nf1KCvhPciaa6cia4iaPb9g/640?wx_fmt=jpeg)image.png

上图为远端打包后的结果，生产环境也包含`mf-manifest.json`。远端的模块信息通过`mf-manitest.json`提供给应用端，但随着远端提供的模块越来越多并且依赖项也越来越多，`manifest.json`会指数级增长，那会不会演变成`Modufle Federation`的卡点问题？

总结
--

`Module Federation`的主要应用场景是微前端，可以满足多个微前端之间的代码共享。相比于当前各种`微前端`框架，`Module Federation`的优势非常明显：

1.  不需要引入一个庞大的微前端架构，也不需要对现有代码做过多改造，微前端相关的逻辑交给构建层 (webpack、rsbuild、vite 等) 统一处理，因此不管是新、老项目，上手成本都比较低；
    
2.  开发效率高，像多仓库或者发布 npm 包的方式，一方面开发时代码体量比较大，另一方面发布过程也比耗时间。而`Module Federation`架构，通过网络来共享代码模块，因此模块提供方提供一个 url，应用方就可以开始使用，并且体验上和使用 npm 包完全一致。
    

🕰️ **Module Federation 未来**

Module Federation 希望能成为构建大型 Web 应用的一个架构方式，类似后端的微服务。后续计划包括的内容：

*   提供完善的 Devtool 工具
    
*   提供更多的上层框架能力 Router、Sandbox、SSR
    
*   提供大型 Web 应用基于 Module Federation 的最佳实践
    

`demo`代码：github.com/cnmapos/mod…[1]

参考
--

1.  rsbuild-plugin-vue-jsx[2]
    
2.  何时使用 shared[3]
    
3.  Module Federation 官网 [4]
    

原文: https://juejin.cn/post/7427173759713296393  
标注

[1]

https://github.com/cnmapos/module-federation-examples.git

[2]

https://github.com/rspack-contrib/rsbuild-plugin-vue-jsx

[3]

https://module-federation.io/zh/configure/shared#faq

[4]

https://module-federation.io/zh

写在最后

> `公众号`：`前端开发爱好者` 专注分享 `web` 前端相关`技术文章`、`视频教程`资源、热点资讯等，如果喜欢我的分享，给 🐟🐟 点一个`赞` 👍 或者 ➕`关注` 都是对我最大的支持。

欢迎`长按图片加好友`，我会第一时间和你分享`前端行业趋势`，`面试资源`，`学习途径`等等。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/kzFgl6ibibNKqZF1ExTzgI7fG8AGvAgiaG88GjeMKP1uHzBhHH7MibrmVKTcQBouQqkBy5Xia8JXk1GYBZnqKpzI56g/640?wx_fmt=other&from=appmsg&wxfrom=5&wx_lazy=1&wx_co=1&tp=webp)

添加好友备注【**进阶学习**】拉你进技术交流群

关注公众号后，在首页：

*   回复 面试题，获取最新大厂面试资料。
    
*   回复 简历，获取 3200 套 简历模板。
    
*   回复 React 实战，获取 React 最新实战教程。
    
*   回复 Vue 实战，获取 Vue 最新实战教程。
    
*   回复 ts，获取 TypeScript 精讲课程。
    
*   回复 vite，获取 Vite 精讲课程。
    
*   回复 uniapp，获取 uniapp 精讲课程。
    
*   回复 js 书籍，获取 js 进阶 必看书籍。
    
*   回复 Node，获取 Nodejs+koa2 实战教程。
    
*   回复 数据结构算法，获取数据结构算法教程。
    
*   回复 架构师，获取 架构师学习资源教程。
    
*   更多教程资源应有尽有，欢迎 关注获取。