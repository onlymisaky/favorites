> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/19SSOKDJb474M0k03FWsWQ)

```
大厂技术  高级前端  Node进阶


```


--------------------------------

```
点击上方 程序员成长指北，关注公众号

回复1，加入高级Node交流群

```

### 从 Vue 和 React 看问题

#### Vue 的优势

1.  内置的 vite 构建工具，减少构建时间，提高开发效率，在大工程上特别明显
    
2.  结构、样式、功能分开的设计，再通过 setup 做 crud 的分隔，整个页面维度的逻辑会特别清晰
    
3.  在路由和数据管理上有官方的解决方案，可以完全没有选择的压力🍐
    
4.  框架本身做了很多的性能优化，如下👇
    

1.  静态提升，包括静态节点，静态属性
    
2.  预字符串化，20 个静态节点以上
    
3.  缓存事件处理函数
    
4.  block tree
    
5.  patch flag
    

#### React 的优势

1.  整体采用函数式编程思想以及数据不可变的渲染方式，减少魔法，没有 vue 指令的花里胡哨，相对更加好理解
    
2.  用 jsx 的语法，减少了 html 本身来带的一些困扰，更加灵活性，可操控性强，更容易出更个性化的项目
    

#### 弱水三千，只取一瓢

其实写到这里，相信大家已经明白我的价值倾向了。在没有企业包袱的角度来看，大厂都是 react 为先😯， 我更加推荐使用 vue，原因如下👇

1.  大神没那么多，就大部分场景 95%，vue 都可以很好的覆盖
    
2.  天生的结构、样式、逻辑相分离，各自的职责界限已经很明显了
    
3.  因为魔法，所以开发更简单。vue 将很多业务常见的场景（嵌套路由、受保护的页面、导航守卫、路由切换动画、滚动条复位）都在 vuex 和 router 中实现了，开箱即用
    

Why
---

主要是为了避免出现以下这些问题👇

1.  一个文件千八百行，太长了，需要不断的上下滑动，还看不懂🤔
    
2.  界限不明确，就会导致混乱，dom 里面写逻辑，逻辑里透出 dom
    
3.  都是页面的维度，没有领域的概念，缺少一个整体的认知
    

最佳实践：每个页面不超过 7 个属性和方法，不强求

How
---

### 领域设计

用面向对象的思维来思考整个项目。可以从一个产品中找到它所涵盖的一些抽象概念，并对每个概念进行赋能。例子🌰：类似协议、商品、计划、达人等维度，然后再对计划进行细分为通用计划、招募计划（类型维度）等，达人模块有添加、履约详情和搜索（功能维度）等模块，落在目录结构上如下👇

```
└── page
    ├── protocol 
    ├── product
    ├── plan 
        ├── general 
        └── recruit 
    └── talent 
        ├── add 
        ├── fulfillment 
        └── search



```

**计划**为栗子🌰

**类型维度**

```
└── plan
    ├── general // 通用
        ├── create // 创建
        ├── modify // 修改
        ├── detail // 详情
        └── info // 信息
    ├── recruit // 招募
        └── create // 创建
            ├── components // 业务组件
            └── views // 视图
                ├── Main // 业务组件
                ├── Video // 短视频
                ├── Live // 直播
                ├── index.module.scss // 页面样式
                └── index.tsx // 引入 main，提供上下文
    ├── oriented // 定向
    ├── free_visit // 自由
        └── detail // 详情
             ├── components // 业务组件
             └── views // 视图
                ├── Loading // 加载态
                ├── Error // 错误态
                ├── Retry // 重试
                ├── Normal // 正常
                ├── index.module.scss // 页面样式
                └── index.tsx // 引入 main，提供上下文
    └── coop_visit // 合作



```

在划分类型后，再对每个计划做能力层级的划分，可以是 create、modify、detail、info 等模块，适用于每个计划有较大的差异性，可复用的模块不太多的情况

在更复杂化的场景中，例如 recruit_plan 的 create 有 live 和 video 2 种模式，差异化不大，可以在同一个页面中组装。可以用 main 承担 controller 层的功能，做模式的划分。同样例如页面的加载，错误，重试，正常等各个状态也同样可以在 main 做统一的处理

**功能维度**

```
└── plan
    ├── create // 创建
        ├── components // 业务组件
        ├── models // 数据处理，逻辑层
        ├── utils // 工具函数
        ├── hooks // 自定义钩子🪝
        ├── constants // 常量、enum
        ├── typings // 类型 interface、type
        └── views // 对 components 做组装 
            ├── Main // controller，做模式的适配和分发
            ├── CreateGeneral // 具体的业务页面
            ├── CreateRecruit // 具体的业务页面
            ├── CreateOriented // 具体的业务页面
            ├── CreateFreeVisit // 具体的业务页面
            ├── CreateCoopVisit // 具体的业务页面
            ├── index.module.scss // 页面样式
            └── index.tsx // 引入 main，提供上下文
    ├── modify // 修改
    ├── detail // 详情
    ├── info // 信息
    └── list // 列表



```

在功能划分后，再对每个计划进行赋能，可以是通用计划、招募计划、定向计划、自由探店、合作探店等模块，适用于功能大体类似的应用，可复用的组件、工具函数比较多的场景

当然，也可以每种计划类型都是单独的一个文件夹，只是全部聚合在 detail 这个域中而已

整体的一个原则是，跟着**页面维度**来走，页面文件夹📁映射路由，每个页面有自己的数据、权限等等其他的业务逻辑

/plan/general/create ---> 找到的就是 plan 域下， general 类型的 create 能力

顺便提一嘴，命名规范相关的

<table><thead><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); min-width: 85px;">命名</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); min-width: 85px;">文件名</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); min-width: 85px;">变量名</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); min-width: 85px;">常量名</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); min-width: 85px;">css 名</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); min-width: 85px;">组件名 / 文件夹</th></tr></thead><tbody><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;"><strong>camelCase</strong></td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;"><br></td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">✅</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;"><br></td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;"><br></td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;"><br></td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;"><strong>PascaCase</strong></td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;"><br></td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;"><br></td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">✅</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;"><br></td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">✅</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;"><strong>snake_case</strong></td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">✅</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;"><br></td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">✅</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;"><br></td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;"><br></td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;"><strong>kebab-case</strong></td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;"><br></td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;"><br></td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;"><br></td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">✅</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;"><br></td></tr></tbody></table>

整体系统的框架体系

```
├── src 
    ├── assets 
    ├── biz_components 
    ├── components 
    ├── core 
        ├── apis 
        ├── constants 
        ├── hooks 
        ├── typings 
        └── styles
    ├── layout 
    ├── pages
    ├── app.module.scss 
    ├── app.tsx 
    ├── index.html 
    ├── index.tsx 
    └──router.ts
├── .gitignore 
├── build.sh 
├── jest.config.js 
├── pack.json 
├── README.md 
└── tsconfig.json



```

所有域的划分都是基于页面维度 pages 进行的，领域分层的方式也正如上面👆所谈到的那 2 种方式。在这种结构中，对几种 components 做下解读

和 pages 同级的 components，这 2 种类型，都是领域的**原子能力**，他们的数据来源绝对的纯粹，就是从 props 中取

1.  biz_components: 复用比较多的业务组件
    
2.  components: 纯粹的组件，不含一丝一毫的业务逻辑
    

每个页面下的 components，到了这个类别下，已经是圈定了指定的页面，所以除了 props，还可以有 model，甚至是页面级的 model 数据，至于数据的处理方案，请向下细读

### 数据管理

整体使用的是 context 的一个方案，包裹在最外层，在里层去消费数据

用到了一个三方库 unstated-next[1]

用法很简单，demo

```
// page.ts

import { createContainer } from 'unstated-next';

const useContainer = () => {
    ...
    
    return {
        state: {
            ...
        }
        ...
    }
}

export const xxxModel = createContainer(useContainer);

// 在页面的 index.tsx 中

export default () => {
    <xxxModel.Provider>
        <Main />
    </xxModel.Provider>
}

// 在 views 或者 components 中消费

export default () => {
    const {} = xxxModel.useContainer();
    
}



```

这一套的思维逻辑和实现，是基于一定的业务场景，不一定全部适合哈。总的来说，通过这种代码的组织方式，让 ui 层和逻辑层出现了比较分明的界限，明确了各自的职责，让维护的成本更加低了。至于逻辑层的抽方法、抽 hook；ui 层的减少 dom 元素、语意化、seo 等其他的优化，需要在一定的场景下进行讨论，这里就不涉及了哈。

相比较 redux 来说，unstated-next 的 size 更小，使用起来更简单

相比较 context 来说，它本身就还是 hook，封装在自定义 hook，或者其他地方，都不是一种很好的实现 ui 和逻辑分离的方式

提供下 localStorage 的最佳用法，拒绝花里胡哨，只为解决问题

```
// 从 localStorage 中获取数据
export const getLocalStorage = (key: string) => JSON.parse(localStorage.getItem(key) || '{}')?.data;

// 把值存在 localStorage，格式 { data: any }
export const setLocalStorage = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify({ data }));
};

想想 data 的妙用，哈哈哈😄



```

推荐 2 个处理数据 filter 的库，无样式侵入只接管状态

1.  rc-field-form[2] // 推荐
    
2.  formily
    

rc 还可以用来做反馈组件，很好用的，antd 的表单也是基于此封装的哈

### 单元测试覆盖

单测的写法，使用 `jest + testing-library + mm` 来进行 mock 以及断言

最好可以在 CI/CD 上配置增量的代码覆盖率是要求在多少，每个 mr 都不能拉低单测覆盖率（待学习）

需要注意的一些点

1.  describe 的描述可以统一下
    
2.  it 和 test 也可以统一下😒
    
3.  通过 snapshot 来进行 ui 的校对
    
4.  在每个 test 中，用户的行为操作是基于人的视角，而不是机器的视角
    
    await userEvent.click(btn as Elment) ✅ // @testing-library/user-event
    
    screen.querySelector('.btn').click ❌
    

强迫症患者最后的挣扎😄，毕竟代码是给人看的，机器顺便运行运行

```
test('render', () => {
    const { asFragment } = render(<XXX />);
    expect(asFragment()).toMatchSnapshot();
})



```

推荐一些学习单测的网站

jest: zh-hans.reactjs.org/docs/testin…[3]

testing-library:

1.  rualc.com/frontend/te…[4]
    
2.  rualc.com/frontend/te…[5]
    
3.  testing-library.com/docs/[6]
    
4.  juejin.cn/post/690705…[7]
    
5.  blog.mimacom.com/react-testi…[8]
    
6.  github.com/testing-lib…[9]
    
7.  testing-library.com/docs/ecosys…[10]
    
8.  www.w3cschool.cn/doc\_jest/je…[11]
    
9.  juejin.cn/post/709218…[12]
    

mm: www.npmjs.com/package/mm[13]

如果在组件维度去写单测需要去 mock 和页面一样多的数据时，我们应该考虑单测的覆盖维度就是页面级别的

个人喜好：**test** 跟着 components 或者 views，这种方式比放在最外层会好很多！

浅谈其他
----

### 主题替换

设计产品总是会有很多其他的 idea，特别在视觉上，所以视觉改版是 FE 很痛苦的一件事。纯粹的手动替换，傻傻的。所以我们在开发时，如果可以有一个主题包如果可以的组件库相结合是最好的，类似 antd 和 elmentui 一样，在需要更换主题的时候，升级包版本就欧了

其他方式

1.  利用媒体查询，在 media_type 里去做 xxx
    
2.  利用 css next 的变量模式
    

总的来说，基于 css 变量，推荐一篇文章 关于前端主题切换的思考和现代前端样式的解决方案落地 [14]

### Icon 管理

常见的几种方式

1.  雪碧图 // 没条件的情况下
    
2.  iconfont
    
3.  png、svg // 最好只用一种，不强求
    
4.  生成一个 icon 包，所有的小图标做统一的管理 // 有条件的话，成本比较大，有管理的成本💰
    

### 生成二维码

推荐使用库 qrcode.react[15]

在 svg 图片格式下，当成组件来用。通过 backgroud 的 z-index:0 和 info 的 z-index:1 来处理背景图的问题，简单好用

> 作者：Lyndon
> 
> https://juejin.cn/post/7205882710332620857

### 

Node 社群  

```
我组建了一个氛围特别好的 Node.js 社群，里面有很多 Node.js小伙伴，如果你对Node.js学习感兴趣的话（后续有计划也可以），我们可以一起进行Node.js相关的交流、学习、共建。下方加 考拉 好友回复「Node」即可。

   “分享、点赞、在看” 支持一下

```

### 参考资料

[1]

https://www.npmjs.com/package/unstated-next: _https://link.juejin.cn/?target=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Funstated-next_

[2]

https://www.npmjs.com/package/rc-field-form: _https://link.juejin.cn/?target=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Frc-field-form_

[3]

https://zh-hans.reactjs.org/docs/testing-recipes.html: _https://link.juejin.cn/?target=https%3A%2F%2Fzh-hans.reactjs.org%2Fdocs%2Ftesting-recipes.html_

[4]

https://rualc.com/frontend/testing-library/#he-react-yi-qi: _https://link.juejin.cn/?target=https%3A%2F%2Frualc.com%2Ffrontend%2Ftesting-library%2F%23he-react-yi-qi_

[5]

https://rualc.com/frontend/testing-library/#package: _https://link.juejin.cn/?target=https%3A%2F%2Frualc.com%2Ffrontend%2Ftesting-library%2F%23package_

[6]

https://testing-library.com/docs/: _https://link.juejin.cn/?target=https%3A%2F%2Ftesting-library.com%2Fdocs%2F_

[7]

https://juejin.cn/post/6907052045262389255#heading-20: _https://juejin.cn/post/6907052045262389255#heading-20_

[8]

https://blog.mimacom.com/react-testing-library-fireevent-vs-userevent/: _https://link.juejin.cn/?target=https%3A%2F%2Fblog.mimacom.com%2Freact-testing-library-fireevent-vs-userevent%2F_

[9]

https://github.com/testing-library/user-event: _https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Ftesting-library%2Fuser-event_

[10]

https://testing-library.com/docs/ecosystem-user-event/: _https://link.juejin.cn/?target=https%3A%2F%2Ftesting-library.com%2Fdocs%2Fecosystem-user-event%2F_

[11]

https://www.w3cschool.cn/doc_jest/jest-expect.html#tomatchregexporstring: _https://link.juejin.cn/?target=https%3A%2F%2Fwww.w3cschool.cn%2Fdoc_jest%2Fjest-expect.html%23tomatchregexporstring_

[12]

https://juejin.cn/post/7092188990471667749: _https://juejin.cn/post/7092188990471667749_

[13]

https://www.npmjs.com/package/mm: _https://link.juejin.cn/?target=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Fmm_

[14]

https://mp.weixin.qq.com/s/0xTZcE3MPezRl3LILR8a_w: _https://link.juejin.cn/?target=https%3A%2F%2Fmp.weixin.qq.com%2Fs%2F0xTZcE3MPezRl3LILR8a_w_

[15]

https://www.npmjs.com/package/qrcode.react: _https://link.juejin.cn/?target=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Fqrcode.react_