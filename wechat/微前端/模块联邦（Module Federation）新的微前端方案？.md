> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/hozUB7pFPEVzQqYycSRtEw)

```
点击上方 程序员成长指北，关注公众号

回复1，加入高级Node交流群

```

前言
--

多个独立的构建可以组成一个应用程序，这些独立的构建之间不应该存在依赖关系，因此可以单独开发和部署它们。 这通常被称作微前端，但并不仅限于此。

模块联邦的概念
-------

模块联邦（Module Federation）是 Webpack 5 引入的一项强大功能，旨在解决微前端架构中的模块共享问题。它允许多个独立构建的应用程序**在运行时动态加载远程模块**和共享代码，而**无需重新构建或部署整个应用**。这种技术可以提高代码复用性和团队协作效率，增强应用程序的可扩展性。

MF (模块联邦 Module Federation，下文将使用 MF 缩写) 的核心在于它**允许在运行时，动态从远程加载模块，在运行时加载模块**，这部分听起来有点像路由懒加载，但它们不太一样。

路由懒加载是对模块代码进行了拆分，编译后的代码还是在同一个包里，在运行时根据路由去动态加载。

而 MF 则更进一步，允许你从远程加载代码，假设你有`A B`两个应用，分别部署在`A.com` 和 `B.com`，MF 允许你在 `A.com` 运行时，动态加载 `B.com` 暴露出来的模块，是不是有点熟悉了，这不是微前端吗？是的，MF 可以作为微前端的另一种实现思路。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/IlE1Y2rl1uaaJjiclZk3H7ED9eXZJscseMicH9U4N0HojBMhRcibkgOPwEQTFibDPACghe7mdTBiaujQmodBeGUHvdg/640?wx_fmt=other&from=appmsg&watermark=1#imgIndex=0)  

除此之外，MF 还有一个特性就是 **共享依赖**， 它允许多个应用程序共享相同的依赖库，从而避免重复加载和版本冲突。

在 MF 里有类似于生产者和消费者的概念，在上面的例子中， A 就是消费者，B 是生产者, B 暴露模块供 A 使用。

但同时 A 可以既是消费者，又是生产者， A 也可以暴露模块，供 B 和 C 调用，支持循环依赖。

模块联邦实践
------

文章中涉及源码的 github 链接 [1]

### 以 `Angular` 为例

推荐使用 `monorepo` 管理项目，在本示例中我们使用 `lerna` + `pnpm`。

将 pnpm 与 lerna 一起使用 [2]

#### Step1： 创建项目

```
lerna init


```

1.  在 `lerna.json` 中添加 `"npmClient": "pnpm"`配置，使用 `pnpm` 进行依赖和工作区管理。
    
2.  在项目根目录下创建 `pnpm-workspace.yaml` 文件，指定工作区位置
    

```
packages:
  - "packages/*"


```

1.  在 `packages` 文件夹下使用 `angular cli` 创建项目
    

```
ng new ng-main

ng new ng-component-lib


```

1.  执行 `pnpm install` 安装依赖
    
2.  消费者（`Main App`）和生产者（`Component Lib`） 都需要添加 @angular-architects/module-federation[3] 依赖。
    
    `@angular-architects/module-federation` 在安装后会自动帮你改造项目，比如帮你生成 `webpack.config.js`以及修改一下配置代码等等， 另外这一步有两种不同的安装方式，它们生成的代码也有些细微的差别，感兴趣可以自己试一下。
    
    本文的示例代码，采用了第一种方式。`ng-main` 项目的端口为 4200， `ng-component-lib` 的端口为 4201.
    

*   直接使用 `angular-cli` ，执行 `ng add @angular-architects/module-federation`，由于`angular` 默认使用 `npm` 管理依赖，所以在执行 `ng add` 之前还要先配置一下，执行 `ng config cli.packageManager pnpm` 改成默认使用 `pnpm`。`ng add ...` 命令执行后会自动安装依赖包和改造项目，所以在执行完命令后你还需要删除子应用的 `node_modules` 和 `pnpm lock` 文件, 然后在根目录重新执行 `pnpm install`。
    
*   第二种是先安装依赖包，然后调用它提供的自动配置项目的脚本。在项目根目录下执行 `pnpm add @angular-architects/module-federation -D`同时为两个应用安装依赖，然后在对应应用里执行 `ng g @angular-architects/module-federation:init`，它支持下列配置 `--project xxx --port xxx --type(remote || main)`。
    

**补充知识点**

还记得上面提到过的 `@angular-architects/module-federation` 会自动生成一些文件，并修改配置吗？

它除了会生成 `webpack.config.js`， 还会生成 `bootstrap.ts` ，自动把原来的 `main.ts` 文件里的内容抽离到 `bootstrap.ts`中，改为在 `main.ts` 中 使用`import('./bootstrap')` 来异步加载。这并不是针对 Angular 框架的特殊处理， React 和 Vue 也是一样的，这么操作有什么目的呢？

当你尝试恢复原来的写法，会发现页面无法正常加载，控制台报错

`Uncaught Error: Shared module is not available for eager consumption`

这是因为共享的依赖还没有加载完，就尝试去访问。

所以必须把原来的入口代码放到 `bootstrap.ts` 里面，在 `main.ts` 中使用 `import` 来异步加载 `bootstrap.ts` ，这样可以实现先加载 `main`，然后在异步加载 `bootstrap` 的时候, 先加载好远程应用的资源并初始化好共享的依赖，最后再执行 `bootstrap` 模块。

#### Step2： 配置生产者

`ng-component-lib` 项目

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/IlE1Y2rl1uaaJjiclZk3H7ED9eXZJscse5mnRicsM1xse3qH0cHTNSHjxibnrCJZ62iatxB7ciadM5ZW85Yn9EsGNgQ/640?wx_fmt=other&from=appmsg&watermark=1#imgIndex=1)image.png

`MfeComponent` 跟 `MfeStandaloneComponent` 的唯一区别是 `MfeStandaloneComponent` 配置了 `standalone`仅此而已。

`src/app/mfe/index.ts`

```
export * from './mfe-standalone/mfe-standalone.component';
export * from './my-button/my-button.component';


```

配置 `webpack.config.js`，暴露对应的模块

```
...
  
module.exports = {
  ...此处省略部分代码
plugins: [
    new ModuleFederationPlugin({
      library: { type: "module" },
      name: "mfe1",
      filename: "remoteEntry.js",
      exposes: {
        './MFEModule': './src/app/mfe/mfe.module.ts',
        './Components': './src/app/mfe/index.ts'
      },
      shared: share({
        "@angular/core": { singleton: true, strictVersion: true, requiredVersion: 'auto' },
        "@angular/common": { singleton: true, strictVersion: true, requiredVersion: 'auto' },
        "@angular/common/http": { singleton: true, strictVersion: true, requiredVersion: 'auto' },
        "@angular/router": { singleton: true, strictVersion: true, requiredVersion: 'auto' },
        ...
      })

    }),
    ...
  ],
};


```

简单解释下这些配置的作用：

*   `name` 表示当前应用的名字，仅仅是个名字而已，未发现其他作用，在其他的博客中看到有说当消费者引用当前应用暴露的模块时，需要在路径前加上这个名字，但我在实际测试中发现，当`name`设为`mfe1`，然后 `remote url` 设为 `mfe1@http://xxxxx`的时候，控制台就直接报错了，不确定是不是依赖包的版本区别还是 `angular` 特殊一些。
    
    其他博客里提到的消费者配置：
    

```
remotes: { 'mfe1': 'mfe1@http://localhost:3001/remoteEntry.js', },


```

*   `exposes` 表示有哪些模块需要暴露出去给消费者使用，它是一个对象，其中 `key` 表示在被消费者使用时的相对路径，`value` 则是当前应用暴露模块的相对路径。
    

```
// 生产者配置
exposes: {
    './MFEModule': './src/app/mfe/mfe.module.ts',
},

// 消费者配置
exportconst routes: Routes = [
  {
    path: 'mfe',
    loadChildren: () =>
      loadRemoteModule({
        type: 'module',
        remoteEntry: 'http://localhost:4201/remoteEntry.js',
        exposedModule: './MFEModule',
      }).then((m) => m.MfeModule),
  },
];


```

*   `share` 主要用来配置共享依赖项，当共享生效时该库只会加载一次，可以优化应用性能，生产者和消费者都需要进行配置。
    

```
plugins: [
    new ModuleFederationPlugin({
    ...
          shared: share({
            "@angular/core": { singleton: true, strictVersion: true, requiredVersion: 'auto' },
            "@angular/common": { singleton: true, strictVersion: true, requiredVersion: 'auto' },
            "@angular/common/http": { singleton: true, strictVersion: true, requiredVersion: 'auto' },
            "@angular/router": { singleton: true, strictVersion: true, requiredVersion: 'auto' },

            ...sharedMappings.getDescriptors()
          })
     }),
 ]     


```

共享库的配置参数解释：

当 singleton 为 true 时，`main` 的 @angular/core 版本为 16.14.0，`component` 的 @angular/core 版本为 16.13.0，那么 `main` 和 `component` 将会共同使用 16.14.0 的 react 版本，也就是 `main` 提供的 react。

如果这时 `component` 的配置中将 @angular/core 的 requiredVersion 设置为 16.13.0，那么 `component` 将会使用 16.13.0，`main` 将会使用 16.14.0，相当于它们都没有共享依赖，各自下载自己的 react 版本。

#### Step3： 配置消费者

消费者有两种配置方式

##### **1.** 配置 `webpack.config.js` 的 `remotes` 属性

`ng-main` 项目： `webpack.config.js`

```
... 此处省略部分代码

module.exports = {
plugins: [
    new ModuleFederationPlugin({
      library: { type: "module" },

      // For hosts (please adjust)
      remotes: {
        "componentLib": "http://localhost:4201/remoteEntry.js",
      },

      shared: share({
        "@angular/core": { singleton: true, strictVersion: true, requiredVersion: 'auto' },
        "@angular/common": { singleton: true, strictVersion: true, requiredVersion: 'auto' },
        "@angular/common/http": { singleton: true, strictVersion: true, requiredVersion: 'auto' },
        "@angular/router": { singleton: true, strictVersion: true, requiredVersion: 'auto' },
        ...
      })

    }),
    ...
  ],
};


```

`remotes` 字段是配置远程模块 `url` 的地方，`key` 相当于给远程模块起个别名，`value` 是 url 地址，`remotes` 是一个对象数据格式，支持配置多个远程模块。

`decalre.d.ts`

```
declare module 'componentLib/MFEModule';

declare module 'componentLib/Components';


```

**作为路由模块加载：**

`app.route.ts`

```
export const routes: Routes = [
  {
    path: 'home',
    component: HomeComponent,
    pathMatch: 'full',
  },
  {
    path: 'mfe',
    loadChildren: () =>
      import('componentLib/MFEModule').then((m) => m.MfeModule),
  },
];


```

**作为组件加载：**

`app.component.html`

```
 <ng-container #components> </ng-container>


```

`app.component.ts`

```
 @ViewChild('components', { read: ViewContainerRef })
 componentsContainer!: ViewContainerRef;

 ngOnInit(): void {
    import('componentLib/Components').then((components) => {
      const { MfeStandaloneComponent, MyButtonComponent } = components;
      this.componentsContainer.createComponent(MfeStandaloneComponent);
      const { instance } =
        this.componentsContainer.createComponent(MyButtonComponent);
      (instance asany).text = 'Test Button';
      (instance asany).log();
      console.log(instance);
    });
  }


```

**最终效果：**

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/IlE1Y2rl1uaaJjiclZk3H7ED9eXZJscseHic8GGmC7gp4HH9yxT6DNDmypSGjFBAaUIzJyYMJ2fM4QlGkeY36ouw/640?wx_fmt=other&from=appmsg&watermark=1#imgIndex=2)  

`Angular` 这里把远程模块作为组件加载时挺奇怪的，不能直接在模板里写，只能通过 `ViewContainerRef` 去渲染，我找了很久也没找到其他的办法，你无法把远程模块动态注入到 `module` 中，就很难受。

传递参数和调用组件 public 的方法等，都需要通过组件的 `instance` 实例操作。

`Vue` 和 `React` 都可以直接 `import`，然后在模板里面使用，就像平时使用其他组件一样。

##### **2.** 通过插件提供的 `loadRemoteModule`方法

除了修改 `webpack.config.js` 之外，还有一种使用方式就是通过插件提供的 `loadRemoteModule` 方法去加载，这也是最新版本文档推荐的写法。

**作为路由模块加载：**`app.route.ts`

```
import { loadRemoteModule } from'@angular-architects/module-federation';

exportconst routes: Routes = [
  {
    path: 'home',
    component: HomeComponent,
    pathMatch: 'full',
  },
  {
    path: 'mfe',
    loadChildren: () =>
      loadRemoteModule({
        type: 'module',
        remoteEntry: 'http://localhost:4201/remoteEntry.js',
        exposedModule: './MFEModule',
      }).then((m) => m.MfeModule),
  }
];


```

**作为组件加载：**`app.component.ts`

```
 @ViewChild('components', { read: ViewContainerRef })
  componentsContainer!: ViewContainerRef;

  ngOnInit(): void {
    loadRemoteModule({
      type: 'module',
      remoteEntry: 'http://localhost:4201/remoteEntry.js',
      exposedModule: './Components',
    }).then((components) => {
      const { MfeStandaloneComponent, MyButtonComponent } = components;
      this.componentsContainer.createComponent(MfeStandaloneComponent);
      const { instance } =
        this.componentsContainer.createComponent(MyButtonComponent);
      (instance asany).text = 'Test Button';
      (instance asany).log();
      console.log(instance);
    });
  }


```

本文中的源码已上传到 github[4]

### 怎么跨技术栈使用

#### 介绍下思路

上面介绍了 `MF` 的简单使用，但都是基于同一框架下的，本章节我们会介绍怎么让 `MF` 跨技术栈使用，实现`Angular` 组件在 `Vue` 中渲染。

怎么让 `MF` 跨技术栈使用呢？答案就是 Web Components[5]。

Web Components 是一种强大的前端技术，它允许开发者创建封装好的、可重用的自定义元素，这些元素可以在任何 HTML 文档中使用，就像标准的 HTML 元素一样。Web Components 的这些特性使得它成为构建可复用 UI 组件的理想选择，因为它们可以轻松地在不同的项目和框架之间共享。

简单来说，使用`Web Components`规范封装组件，可以直接在普通 `Html` 中像使用 `Input` 标签一样使用，并且兼容现在大多数主流浏览器。我们在这里不做太多解释，不熟悉的同学可以自己去搜一下。

所以我们的思路就是：

**把 `Angular、Vue、React`的组件转换为 `Web Components`，然后通过 `MF` 共享，从而实现跨技术栈使用。**

那要怎么把组件转换为 Web Component 呢，其实三大框架都有对应的库。

Angular Custom Elements • Angular[6]

```
import { DoBootstrap, Injector, NgModule } from'@angular/core';
import { createCustomElement } from'@angular/elements';
import { MyButtonComponent } from'./my-button/my-button.component';
import { BrowserModule } from'@angular/platform-browser';

@NgModule({
  imports: [BrowserModule, MyButtonComponent],
})
exportclass RegisterWidgetModule implements DoBootstrap {
constructor(private injector: Injector) {}

  ngDoBootstrap() {
    const el = createCustomElement(MyButtonComponent, {
      injector: this.injector,
    });
    customElements.define('ng-button-widget', el);
  }
}


```

Vue Vue 与 Web Componets | Vue.js (vuejs.org)[7]

```
import { defineCustomElement } from'vue'

const MyVueElement = defineCustomElement({
// 这里是同平常一样的 Vue 组件选项
props: {},
emits: {},
template: `...`,

// defineCustomElement 特有的：注入进 shadow root 的 CSS
styles: [`/* inlined css */`]
})

// 注册自定义元素
// 注册之后，所有此页面中的 `<my-vue-element>` 标签
// 都会被升级
customElements.define('my-vue-element', MyVueElement)

// 你也可以编程式地实例化元素：
// （必须在注册之后）
document.body.appendChild(
new MyVueElement({
    // 初始化 props（可选）
  })
)


```

React react-to-web-component[8]

```
import r2wc from "@r2wc/react-to-web-component"

const WebGreeting = r2wc(Greeting)
customElements.define("web-greeting", WebGreeting)


```

#### 实战

#### Step1： 转换 Angular 组件

**以 Angular 为例**

`MyButtonComponent` 是一个很简单的按钮组件，它有一个 `key` 为 `text` 的输入属性。

值得注意的是，`Angular` 组件要开启 `Shadowdom` 需要在组件里配置 `encapsulation: ViewEncapsulation.ShadowDom`，无法在使用插件转换时配置。

```
import {
  AfterViewInit,
  Component,
  Input,
  OnInit,
  ViewEncapsulation,
} from'@angular/core';

@Component({
  selector: 'app-my-button',
  standalone: true,
  imports: [],
  template: `<button (click)="handleButtonClick()">
    {{ text }}
  </button>`,
  styleUrl: './my-button.component.scss',
// open shadow dom
  encapsulation: ViewEncapsulation.ShadowDom,
})
exportclass MyButtonComponent implements OnInit {
@Input() text: string = 'Test';

  ngOnInit(): void {
    console.log('Life cycle: OnInit');
  }

  log(): void {
    console.log('Function has been called');
  }

  handleButtonClick(): void {
    console.log('The button was clicked');
  }
}


```

新建 `register-widget.module.ts`

```
import { DoBootstrap, Injector, NgModule } from'@angular/core';
import { createCustomElement } from'@angular/elements';
import { MyButtonComponent } from'./my-button/my-button.component';
import { BrowserModule } from'@angular/platform-browser';

@NgModule({
// 注意这里直接 import MyButtonComponent 是因为它配置了 standalone
  imports: [BrowserModule, MyButtonComponent],
})
exportclass RegisterWidgetModule implements DoBootstrap {
constructor(private injector: Injector) {}

  ngDoBootstrap() {
    const el = createCustomElement(MyButtonComponent, {
      injector: this.injector,
    });
    customElements.define('ng-button-widget', el);
  }
}


```

新建 `remote-bootstrap.ts`

```
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import 'zone.js';

import { RegisterWidgetModule } from './register-widget.module';

platformBrowserDynamic()
  .bootstrapModule(RegisterWidgetModule)
  .catch((error: Error) => console.error(error));

export { RegisterWidgetModule };


```

#### Step2： 修改生产者配置

`webpack.config.js`

```
  plugins: [
    new ModuleFederationPlugin({
      library: { type: "module" },
      name: "mfe1",
      filename: "remoteEntry.js",
      exposes: {
        './MFEModule': './src/app/mfe/mfe.module.ts',
        './Components': './src/app/mfe/index.ts',
        // 对比之前的配置，只修改了这一行，暴露 WebWidgets 
        './WebWidgets': './src/app/mfe/remote-bootstrap.ts'
      },
      shared: share({
        "@angular/core": { singleton: true, strictVersion: true, requiredVersion: 'auto' },
        "@angular/common": { singleton: true, strictVersion: true, requiredVersion: 'auto' },
        "@angular/common/http": { singleton: true, strictVersion: true, requiredVersion: 'auto' },
        "@angular/router": { singleton: true, strictVersion: true, requiredVersion: 'auto' },

        ...sharedMappings.getDescriptors()
      })

    }),
    sharedMappings.getPlugin()
  ],


```

`tsconfig.app.json`

```
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./out-tsc/app",
    "types": []
  },
  "files": ["src/main.ts", "src/app/mfe/remote-bootstrap.ts"],
  "include": ["src/**/*.d.ts"]
}


```

#### Step3： 修改消费者配置

消费者以 Vue 为例，先安装 Vite 的 vite-plugin-federation[9] 插件。

默认情况下，Vue 会将任何非原生的 HTML 标签优先当作 Vue 组件处理，而将 “渲染一个自定义元素” 作为后备选项。这会在开发时导致 Vue 抛出一个 “解析组件失败” 的警告。要让 Vue 知晓特定元素应该被视为自定义元素并跳过组件解析，我们可以指定 `compilerOptions.isCustomElement` 这个选项 [10]。

`vite.config.ts`

```
import { defineConfig } from"vite";
import vue from"@vitejs/plugin-vue";
import federation from"@originjs/vite-plugin-federation";

// https://vitejs.dev/config/
exportdefault defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.endsWith("widget"),
        },
      },
    }),
    federation({
      remotes: {
        ngMfe: "http://localhost:4201/remoteEntry.js",
      },
    }),
  ],
});


```

`main.ts` 在 mount 前加载组件

```
import { createApp } from"vue";
import"./style.css";
import App from"./App.vue";
import"../decl.d.ts";

awaitimport("ngMfe/WebWidgets")
  .then((res) => {
    console.log("res", res);
  })
  .catch((error) => {
    console.error("error", error);
  });

createApp(App).mount("#app");


```

`App.vue` 使用 Web Component 组件

```
<template>
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
</div>
<button id="button">Main Button</button>
  // 直接当作 web 元素使用
<ng-button-widget text="Test Button"></ng-button-widget>
<HelloWorld msg="Vite + Vue" />
</template>


```

最终结果：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/IlE1Y2rl1uaaJjiclZk3H7ED9eXZJscselR4IIket0uTLTheBICiaYEgdeumqzsfXoibD0cLDmTicuCFvYKvp8zHNA/640?wx_fmt=other&from=appmsg&watermark=1#imgIndex=3)image.png

本文中的源码已上传到 github[11]

总结
--

至此，我们实现了在 `Angular` 中实现 `MF`，以及跨技术栈实现 `MF`，在对巨型项目进行拆解时，除了使用 `QianKun`, `Micro-App`, `Wujie`等这些库外，我们又多了一种 `MF` 作为可选方案。 要注意的是 `MF` 在使用 `Web Component`方案的时候，虽然可以解决样式隔离，但**它无法解决元素隔离，沙箱等痛点**。

总的来说，**微前端关注的是应用的拆分和团队的独立工作能力，而模块联邦则更关注于模块的共享和复用**。在实际应用中，这两者可以结合使用，利用模块联邦在微前端架构中实现跨应用的模块共享，比如组件库的共享，相比使用 `npm` 包，每次组件库发布新版本，依赖组件库的项目都要重新编译发布，使用 `MF` 则更方便。

本文转载于稀土掘金技术社区，作者：阿彪最稳健了

https://juejin.cn/post/7386243179279663144

Node 社群

```
我组建了一个氛围特别好的 Node.js 社群，里面有很多 Node.js小伙伴，如果你对Node.js学习感兴趣的话（后续有计划也可以），我们可以一起进行Node.js相关的交流、学习、共建。下方加 考拉 好友回复「Node」即可。

   “分享、点赞、在看” 支持一波👍

```