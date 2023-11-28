> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [blog.csdn.net](https://blog.csdn.net/sd19871122/article/details/131604559)

前言
--

随着业务的不断成熟、完善，大多数情况下我们会发现页面中的功能大同小异，翻来覆去可能就是那几套界面交互与逻辑，反复开发就很浪费成本。

虽然目前市面上包括公司内已经有很多功能强大且完善的组件库供我们使用，但是对于我们目前复杂的产品的形态结构、各个页面设计时也可能会有一个功能在不同迭代出了多套设计的情况，PM 画的原型也风格各异，同时也需要对多平台、多业务的支持。导致很多场景下样式也不能统一，沟通成本增大，效率低下，影响产品的可用性效果，因此搭建符合自身 B 端产品平台的组件库的诉求迫在眉睫。

回顾组件库搭建的整个项目过程，存在很多值得记录、反思的内容，文章接下来会分享和阐述项目中一些核心思路作为对整个[项目流程](https://so.csdn.net/so/search?q=%E9%A1%B9%E7%9B%AE%E6%B5%81%E7%A8%8B&spm=1001.2101.3001.7020)的复盘，同时也旨在帮助大家学习组件库的构建思路。

ps：但是开发组件库还是需要投入时间和成本的，毕竟不是所有的业务都适合搞一套组件库，一定要体现价值（提效！提效！提效！）。说了这么多，接下来我们就来分析和实现一个团队内部的组件库吧。

#### 通过本文档可以得到什么

*   从 0 到 1 搭建前端组件库
    
*   前端组件库的系统设计
    
*   同时兼容 [vue2](https://so.csdn.net/so/search?q=vue2&spm=1001.2101.3001.7020) vue3 的解决方案
    
*   文档站部署：如何接入 kfx 与流水线部署文档站
    
*   组件部署：组件发布到 npm 上
    
*   一个基于 vite 的轻量版组件库脚手架（附仓库地址）
    

一、组件系统设计
--------

#### 1、层级设计

上图是简单描述了组件在页面的作用方式及层级，我们可以看到一个页面可以由基础组件 + 业务组件 + 区块构成。对于一个复杂的前端系统，想要组件能够被频繁使用，且能满足大部分业务场景，就需要设计一个好的架构，对页面中的内容进行合理拆分。

#### 2、组件拆分思路

成熟的大项目中有很多复杂的业务功能，但是不同模块或者子系统之间很多业务往往是相通的或者相似的，一个功能往往需要写很多次，其实完全没必要重复劳动，重复写多次不仅浪费人力成本对于可维护性来说也是一种灾难，所以基于这种场景我们的 业务组件 就很有必要出场了。

我们可以把系统中常用的功能和需求进行梳理，把功能或者需求类似的有机体封装成一个业务组件，并对外暴露接口来实现灵活的可定制性，这样的话我们就可以再不同页面不同子系统中复用同样的逻辑和功能了。

同理，不同页面中往往有可能出现视觉或者交互完全相同或者类似的区块（可以理解为大而全的业务组件），为了提高可复用性和提高开发效率，我们往往会基于基础组件和业务组件再进行一次封装，让其成为一个独立的区块以便直接复用。

在需求收集上我们遵循两个原则：

1、自上而下，首先需要根据对所有业务进行系统梳理，提取出高优组件；

2、由内而外，这个过程可以卷起产品同学征集需求，避免闭门造车。

将组件划分好后，就需要有足够细的粒度对组件进行拆分，这样才能最大程度复用组件。

通过这样一层层封装，我们就逐渐搭建了一套完整的组件化系统。但要注意一点就是高层次的组件会依赖低层次的组件，但是低层次的组件不可以包含高层次的组件。他们的关系就类似下图：

image

二、组件库搭建
-------

#### 先抛几个问题：

*   老项目都是 vue2 写的，上了 [vue3](https://so.csdn.net/so/search?q=vue3&spm=1001.2101.3001.7020)，之前 vue2 的代码还能兼容吗？
    
*   老项目 vue2 太大了，暂时没法全部升级，怎么平滑过渡？
    
*   新开工程用的 vue3 新技术研发出来的，老项目也想引用这个模块，代码是不是要降级？
    

#### 1、怎么兼容 vue2 vue3

常规思路：

开发一套 vue2 的组件库，项目升级 vue3 时再同步升级一套 vue3 的组件库。

优点：前期开发快，项目中要么是 vue2 要么是 vue3，所见即所得，没有兼容的心智负担

缺点：重构成本高，且需要维护两套代码，维护成本高。（一个需求搞两次，一个 bug 修两遍，工作量加倍，属实顶不住）

懒癌思路：就想开发一套代码，构建好可以同时支持 vue2 和 vue3。

可行吗？可行！使用 vue-demi，打穿 vue2-vue3 的壁垒，上面的问题就不复存在了。

根据创建者 Anthony Fu 的说法，Vue Demi 是一个开发实用程序，它允许用户为 Vue 2 和 Vue 3 编写通用的 Vue 库，而无需担心用户安装的版本。

既然如此，我们先看下 vue-demi 的原理：主要是利用 compositionAPI 在写法上和 vue3 的一致性进行兼容的过渡。

核心：通过 postinstall 这个钩子，对版本判断从而去更改 lib 文件下的文件，动态改变用户引用的版本。

image

v2 引入了 compositionAPI 支持 vue3 写法

image

v3 什么都不用做，我们写的就是 vue3 写法，只不过没有 script setup，具体原因后面会讲。

image

总结一句，就是 vue-demi 会根据用户使用 vue 的版本号来判断，vue2 时加入 @vue/composition-api。

那好了，我们的写法搞定了，现在组件库可以一套代码兼容 vue2 和 vue3 了吗？

还是不行，我们的核心功能是用 sfc 的 vue 文件打包的，写的是 template，并不是 render 函数，关于 template 的解析，v2 和 v3 解析出来的不能通用的，因为 v3 之所以快，是因为对 temlate 的比对优化了，具体咋优化的大家可以查看 vue3 的源码。这种场景肯定不能只打包一次就同时支持 vue2 和 vue3 调用。

那我们可以参考 vue-demi，从 postinstall 着手，也编译两个版本，在宿主系统中通过宿主系统的版本判断要加载哪套组件代码，不就 ok 了吗？

没错，目前就是这么干的。

image

此时就可以一套代码，使用 vue2 和 vue3 编译两次，达到支持 vue2 和 vue3 的目的。

我们来看下优缺点：

优点：一套代码，易于维护，开发成本低，同时支持 vue2、vue3

缺点：写代码的时候，仍然有些写法是 vue2 和 vue3 有差异的，并不能完全抹平，但是情况很少。需要编译两次，

例如：组件上绑定 v-model，vue3 子组件的属性为 `modelValue`， vue2 为'value';

```
import { isVue2, isVue3 } from 'vue-demi' 
if (isVue2) { 
  // Vue 2 only 
} else { 
  // Vue 3 only 
}
```

问题：如果不用 SFC，改用 render 的写法，能只 build 一次吗 ？

答：可以。

我们的组件 render-demo.ts 如下

```
import { defineComponent, h, ref } from 'vue-demi'
 
export default defineComponent({
  name: 'RenderDemo',
  props: {},
  setup() {
    const count = ref(0)
    return () => h('div', {
        on:{  // vue2 h函数底层为 createElement
            click(){
                console.log('update')
                count.value++
            }
 
        },
        onClick() {  // vue3  h函数
            console.log('update')
            count.value++
            }
        }, [
            h('div', `count: ${count.value}`),
            h('div', 'RenderDemo')
        ])
  }
})
```

通过编译后产物是一样的：即可认为不论在 vue2 还是 vue3 环境打包只 build 一次即可同时支持。但是有 vue2 和 vue3 写法上的区别（参照官方文档：[v3](https://links.jianshu.com/go?to=https%3A%2F%2Fcn.vuejs.org%2Fguide%2Fextras%2Frender-function.html%23creating-vnodes "v3")、[v2](https://links.jianshu.com/go?to=https%3A%2F%2Fv2.cn.vuejs.org%2Fv2%2Fguide%2Frender-function.html "v2")），需要手动处理。PS: 这样享受不到 vue3 模板编译静态提升的优化了。

image

问题：vue3 支持 optionApi 吗？

答：支持。

问题：那能不能都用 optionApi 写，只 build 一次？

答：不能，因为 vue2 和 vue3 编译 SFC 的依赖插件不同，底层代码有差异。

image

image

好吧... 还是 build 两次吧...

#### 2、怎么测试组件是否能在 vue2 和 vue3 环境下正常使用

分别发布 vue2 和 vue3 的包，然后在两个环境引用进行测试验证。

但是由于目前，潜在的问题就是组件库依赖了其他的基础组件库，例如 KwaiUi，这个在宿主系统中的版本是不确定的，所以这个地方可能有兼容性问题，暂时没有想到好的解决办法。

#### 3、搭建流程

三、文档站搭建
-------

#### 1、文档站是拿什么写的

基于 vitepress 构建

官网文档：[vitepress](https://links.jianshu.com/go?to=https%3A%2F%2Fvitepress.vuejs.org%2Fguide%2Fgetting-started.html "vitepress")

2、vue 的组件为什么能写到 markdown 里？

VitePress 使用 markdown-it 作为 Markdown 渲染器。上面的很多扩展都是通过自定义插件实现的。您可以使用以下选项进一步自定义 markdown-it 实例：markdown.vitepress/config.js

#### 2、为什么用 vitepress

##### 横向对比

<colgroup><col width="0.2_"><col width="0.2_"><col width="0.2_"><col width="0.2_"><col width="0.2*"></colgroup>  
|

框架

|

官网

|

优点

|

缺点

|

匹配度

|  
|

vuePress

|

[https://www.vuepress.cn/](https://links.jianshu.com/go?to=https%3A%2F%2Fwww.vuepress.cn%2F "https://www.vuepress.cn/")

|

相比于 vitePress 插件更多一点，快速

|

需要对 vite 进行进一步支持

|

⭐️⭐️⭐️

|  
|

vitePress

|

[https://vitepress.vuejs.org/](https://links.jianshu.com/go?to=https%3A%2F%2Fvitepress.vuejs.org%2F "https://vitepress.vuejs.org/")

|

原生支持 vite 以及 vue3，提供了比较简洁的文档编辑能力，快速

|

因为是新出的，所以插件不如 vuePress 丰富

|

⭐️⭐️⭐️⭐️⭐️ 开箱即用

|  
|

MDocs

|

[https://main--mdocs-template.jinx.corp.kuaishou.com/](https://links.jianshu.com/go?to=https%3A%2F%2Fmain--mdocs-template.jinx.corp.kuaishou.com%2F "https://main--mdocs-template.jinx.corp.kuaishou.com/")

|

公司内部，可以嵌入可在线演示的代码编辑器

|

react 框架，不匹配

|

⭐️

|  
|

通过 markDown 渲染器进行开发

|

市面上各种 markDown 解析器，webpack 也有些 loader 插件。

例如：

```
import Markdown from 'vite-plugin-md'
 
export default defineConfig({
  // 默认的配置
  plugins: [
    vue({ include: [/\.vue$/, /\.md$/] }),
    Markdown(),
  ],
})
```

这样就可以把 md 当 vue 用了

|

自由度高

|

成本高，基础能力（例如路由，代码高亮，导航等）需要自己开发各种插件

|

⭐️

|

根据我们的需求情况，需要快速搭建，核心内容也是将组件大范围应用于业务，故而选择 vitepress。后续如果需要自由度更高的情况，再换技术栈也是不迟的。

#### 3、vue 的组件为什么能写到 markdown 里？

image

底层大都是对 markdown 编译为相应的 html 再套一层 <template></template > 进行预览。具体如何做词法解析的这里暂不做解释。

VitePress 使用 markdown-it 作为 Markdown 渲染器。上面的很多扩展都是通过自定义插件实现的。vitepress 也支持使用以下选项进一步自定义 markdown-it 实例：markdown.vitepress/config.js

```
const anchor = require('markdown-it-anchor')
module.exports = {
  markdown: {
    // options for markdown-it-anchor
    // https://github.com/valeriangalliat/markdown-it-anchor#permalinks
    anchor: {
      permalink: anchor.permalink.headerLink()
    },
    // options for markdown-it-toc-done-right
    toc: { level: [1, 2] },
    config: (md) => {
      // use more markdown-it plugins!
      md.use(require('markdown-it-xxx'))
    }
  }
}
```

#### 4、搭建流程

##### 目录架构如下（tips：使用 mddir 可以生成）

```
|-- docs
    |-- index.md // 首页 yml语法描述填空即可
    |-- package.json
    |-- vite.config.ts 
    |-- yarn.lock
    |-- .vitepress  // vitepress 配置
    |   |-- config.js  // 主配置
    |   |-- routes // 文档路径配置
    |   |   |-- guide.js
    |   |-- theme  // 主题配置
    |       |-- index.js
    |-- guide    // 文档在这个文件夹下
        |-- configuration.md
        |-- getting-started.md
        |-- what-is-commercial-ui.md
        |-- my-components  // 新建组件文档目录
        |   |-- my-components.md   // 组件文档
        |   |-- demo  // 示例
        |       |-- demo-1.vue  // 按序号写多个demo
```

##### 安装 vitepress

```
npm i vitepress -D 
全局安装 npm i vitepress -g
```

packages.json

```
{
  ...
  "scripts": {
    "docs:dev": "vitepress dev docs",
    "docs:build": "vitepress build docs",
    "docs:serve": "vitepress serve docs"
  },
  ...
}
```

docs 目录下执行

```
import DefaultTheme from 'vitepress/theme';
import KwaiUI from '@ks/kwai-ui';
 
/** 库导入 */
import AuditUI from '@ks-cqc/audit-ad-components';
 
/** 本地导入 */
// import AuditUI from '../../../src/index';
 
/** 依赖库样式导入 */
import '@ks/kwai-ui/lib/theme-new-era/index.css';
import '@ks-cqc/audit-ad-components/lib/v3/style.css';
 
export default {
    ...DefaultTheme,
    enhanceApp({ app }) {
        app.use(KwaiUI); // 依赖的基础组件库
        app.use(AuditUI); // 我们的业务组件库
    },
};
```

浏览器输入：[http://localhost:3000/getting-started](https://links.jianshu.com/go?to=http%3A%2F%2Flocalhost%3A3000%2Fgetting-started "http://localhost:3000/getting-started")

具体的配置可以参考官网文档：[vitepress](https://links.jianshu.com/go?to=https%3A%2F%2Fvitepress.vuejs.org%2Fguide%2Fgetting-started.html "vitepress")

##### 引入组件库与依赖组件

cd docs/.vitepress/theme/index.js

```
|-- component-template
  |-- comp   // 组件文件
  |   |-- component-template.vue // 组件代码
  |   |-- index.ts  // 暴露组件
  |-- doc   // 文档文件
    |-- component-template.md   // 组件文档
    |-- demo // 文档中的示例文件
    |-- demo-1.vue
```

现在我们就可以愉快地开发组件库了，但是并不愉快，因为需要一直手动创建好多个文件，要是能一键创建就好了。

四、cli 能力快速开发组件
--------------

到目前为止，我们的整个 “实时可交互式文档” 已经搭建完了，是不是意味着可以交付给其他同学进行真正的组件开发了呢？假设你是另一个开发同学，我跟你说：“你只要在这里，这里和这里新建这些文件，然后在这里和这里修改一下配置就可以新建一个组件了！”你会不会很想打人？我们先看看需要哪些步骤...

#### 1、快速开发一个基础组件需要哪些文件？

首先需要的是组件文件，有了组件文件还需要文档文件，至少需要四个。

*   创建四个文件如下：

image

image

创建了文件还不够，还需要对一些文件进行修改。

*   为文档创建路由

image

*   组件库引入组件，注册组件，暴露组件

image

好麻烦，组件还没开发，竟然先要改这么多地方，每次都这样搞一遍人都麻了，这种枯燥乏味的事情还是交给程序干吧。。。

#### 2、如何通过命令行快速创建模板文件？

*   首先就是需要解决文件创建

这个简单，我们创建一套模板文件，对应上述四个必须的基础文件

```
// 替换文件内容
function replaceInfo(filePath, componentName, componentDesc) {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            return err;
        }
        let str = data.toString();
        str = str.replace(/{{component-name}}/g, componentName).replace(/{{component-desc}}/g, componentDesc);
        fs.writeFile(filePath, str, function (err) {
            if (err) {return err;}
        });
    });
}
// 替换文件名
async function modifyInfo({ filesPath, componentName, componentDesc}) {
    filesPath.forEach(async ({ target }) => {
        walk(target, function (path, fileName) {
            const oldPath = path + '/' + fileName;
            const newPath = path + '/' + fileName.replace('component-template', componentName);
            renameFile(oldPath, newPath);
            replaceInfo(newPath, componentName, componentDesc);
        });
    });
}
```

名称怎么改呢？不能都叫 demoComponent 吧

文件名在 copy 时替换即可，文件中的内容通过 mastache 语法进行模板替换即可。

代码如下：

```
// 引入公共样式
import './styles/base.less';
 
// 引入组件
import * as components from './entry';
import { installArgument } from './utils/install';
// 全局注册组件
const install = function (_vue: installArgument) {
    Object.values(components).forEach(comp => {
        if (!comp || !comp.name) {
            return;
        }
        comp.install(_vue);
    });
};
 
const plugin = {
    install,
};
 
// 单个导出
export * from './entry';
 
// 整体导出
export default plugin;
```

*   自动修改上述的路由和组件引入以及暴露的文件

这里我们虽然也可以直接修改文件，注入代码，但是试想一下，如果日后组件越来越多，这个时候路由和入口文件很可能这样，密密麻麻，还很乱，看着就头疼。

image

image

所以我们不能用这么蠢的方式。。。

需要简单修改一下

*   对于组件引入和暴露可以这样

收拢到 entry.ts 中进行引入暴露

image

index.ts 只需要对 entry 暴露出去的模块对象遍历注册即可，单个导出也更简洁了

```
import components from '../../../components';
 
.....
 
compRouteConfig = [
        {
            text: '业务组件',
            collapsible: true,
            items: [
                ...Object.keys(components).map(comName => {
                    return { text: components[comName].zhName, link: `/guide/${components[comName].name}/${components[comName].name}` };
                }),
                // { text: 'demo', link: `/guide/demo/demo.md` }
            ],
        },
    ];
```

*   文档路由同理，也收拢到一个入口文件，进行遍历

```
{
    "demo-component": {
        "name": "demo-component",
        "zhName": "示例组件",
        "desc": "默认：这是一个新组件",
        "url": "./src/components/demo-component/index.ts"
    }
}
```

components.json 中

```
inquirer.prompt([
        {
            type: 'input',
            name: 'componentName',
            message: 'Component name (kebab-case):',
            default: 'demo-component',
        },
        {
            type: 'input',
            name: 'componentZhName',
            message: '请输入你要新建的组件名（中文）:',
            default: '示例组件',
        },
        {
            type: 'input',
            message: '请输入组件的功能描述：',
            name: 'componentDesc',
            default: '默认：这是一个新组件'
        }
    ]);
```

##### 总结一下:

1、创建四个文件，替换其中关键信息

2、修改 entry，components.json，添加新建的组件信息

需要的关键信息只有三个，组件名，组件描述，组件中文名，所以我们创建时要输入如下即可：

image

想实现命令行提问并收集输入的答案需要用到一个库 inquirer

代码很简单

```
inquirer.prompt([
        {
            type: 'input',
            name: 'componentName',
            message: 'Component name (kebab-case):',
            default: 'demo-component',
        },
        {
            type: 'input',
            name: 'componentZhName',
            message: '请输入你要新建的组件名（中文）:',
            default: '示例组件',
        },
        {
            type: 'input',
            message: '请输入组件的功能描述：',
            name: 'componentDesc',
            default: '默认：这是一个新组件'
        }
    ]);
```

通过 node 运行后，会提出三个我们设计好的问题，保存在一个对象中我们导出使用即可。然后拿着这些信息按照上面的流程替换模板内容，拷贝文件到对应目录就可以快速开发了。

五、部署
----

自己丢到服务器上即可，也可以托管到 github。

附：
--

组件库基础能力脚手架

*   文档站
    
*   Vite
    
*   vue2+vue3
    
*   快速开发组件
    

© 著作权归作者所有, 转载或内容合作请联系作者

0 人点赞

[前端常用知识合集](/nb/49660992)

  
作者：工程师小青蛙  
链接：https://www.jianshu.com/p/1c46600b3e44  
来源：简书  
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。