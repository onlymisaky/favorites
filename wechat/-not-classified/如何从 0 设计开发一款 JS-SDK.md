> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/cQDzhlY_GRzHv9PhSzeBPQ)

一、前言
----

最近在开发一款一键登录的号码认证`js-sdk`，所以就做了一些调研，记录下开发过程。

前端 SDK 是什么？前端 SDK 是为了帮助前端实现特定需求，而向开发者暴露的一些 JS-API 的集合，规范的 SDK 包括若干 API 实现、说明文档等

前端 SDK 其实很常见了，比如：

*   UI 组件库：通过封装一系列组件，通过配置帮助开发者调用
    

*   Antd
    
*   ElementUI
    

*   JS 类库：通过实现一类常用的方法，便于开发处理数据，也不用再考虑兼容性
    

*   lodash
    
*   moment
    

*   监控统计工具：通过 API，来监听前端系统的报错、统计数据
    

*   Sentry
    
*   百度统计等
    

二、开发前的设计
--------

SDK 开发其实很简单，简单到写一个函数导出就行，但在实际应用的过程中，我们要考虑很多实际情况。

### 1、设计原则

#### 满足一类功能的需要

SDK 一般都是为了满足一类业务的需要，所以设计之初要明确业务范围

#### 最小可用性原则

即能用确定的方法实现，就不要再去搞复杂的内容。我理解，比如获取 DOM，如果`GetElementById`可以实现，就不要再设计一下`GetElementsByTagName`、 `document.querySelector`等方法封装，除非有其他的开发需要无法满足。

#### 最少依赖原则

SDK 减少依赖，要避免 Lodash、JQuery、Moment、Dayjs 等库，尽可能自行实现必要的方法，或者引入尽量小的库。否则会导致 SDK 打包后过大，或者更新版本带来的兼容问题

**当然一切都要根据实际情况，有些 SDK 是时间的各种处理，自己处理时间的成本太高，不妨引入小型的 Dayjs 时间库**

#### 足够稳定、向后兼容

减少 BreakChange，绝不能导致载体应用崩溃，同时做好文档说明

#### 易扩展

模块化实现方法，尽量小的封装函数，保持函数功能的单一性原则，这样就可以更好的增加 SDK 的能力。

根据这些原则，下面是我们做的对应操作：

### 2、要实现的功能

首先要明确我们写的 SDK 是用来做什么的？

比如我本次实现的是用户 H5 页面的一键登录和号码检测。

那么我们需要暴露两个实例，供其他开发者使用，为了满足易扩展的原则，我们将声明两个类，来实现（如果每个实例都很多能力，可以拆分成两个 SDK 也是可以的）

### 3、构建工具和技术选择

提供的 SDK 一般都要提供压缩和未压缩版本，未压缩可以用来帮助开发调用，查找问题。压缩版本可以使用在生产环境，减少 http 损耗。所以我们要借助构建工具来集成这部分的能力。

可供选择的压缩工具有很多：webpack、Rollup、Gulp

如果是纯类库的压缩，当然是 Rollup 更好，压缩更彻底

如果是有 DOM 和样式，那么使用 webpack 功能更强大

这里由于我们可能涉及到页面 SDK，而且对 Webpack 更熟悉，所以选择 Webpack

### 4、单元测试

SDK 的设计原则有一条：足够稳定、向后兼容，最少依赖原则。

这就意味着我们要少写 Bug，所以一定要引入单元测试，这里我们选择 Jest，使用起来也很简单。

```
describe('common test', () => {
    test('osIsPc', () => {
        expect(osIsPc()).toBeBoolean(true, false);
    })
    test("isWifi", () => {
        expect(isWifi()).toBeBoolean(true, false);
    })
})


```

### 5、SDK 支持的引入方式

浏览器 js 模块化常见的几种方式包括：amd\cmd\es6 modules\umd

*   1、静态资源引入
    

```
<scriptsrc="/sdk/v1/phoneserver"></script>


```

*   2、支持 amd 引入
    

```
define([jquery.js, lodash.js], function($, _){
    console.log("jquery and lodash", $, _)
})


```

*   3、支持 cmd 引入
    

```
    define(function(require){
        const lodash = require('./a.js')
        console.log("lodash", lodash)
    })


```

*   4、支持 es6 引入
    

```
    import { PhoneServer } from'phone-server-sdk'


```

我们直接在 webpack 中配置 umd 方式打包，然后就可以支持上面的多种引入方式

```
    output: {
        path: path.resolve(__dirname, '../dist'),
        filename: '[name].js',
        library: 'Phone-JS-SDK',
        libraryTarget: 'umd'
    }


```

打包的库命名：`Phone-JS-SDK`

### 6、版本维护和更新

*   管理好版本号
    
*   记录好更新日志
    

SDK 版本更新，每个版本都会存在差异，而用户使用的版本肯定也太一样，所以记录好版本更新日志可以减少非技术问题。

通过静态文件导出的 SDK 要同时部署多个版本，不能随时下线老版本。

### 7、其他的注意点

*   代码混淆
    
*   开发环境配置和代码格式
    
*   上传 NPM
    
*   CDN 部署
    
*   依赖的三方库如何打包进 SDK
    

*   仅支持静态引入的库如何处理
    
*   如何全局共享库方法
    

*   针对有后端 API 交互的 SDK，需要考虑
    

*   API 要限流、限制次数、防止盗刷
    
*   日志监控和数据上报
    

三、项目实践
------

针对提交代码的检测和格式化，这里直接配置好了，如果需要了解，可以查看我之前的一篇文章前端工程化：Prettier+ESLint+lint-staged+commitlint+Hooks+CI 自动化配置处理 [1]

### 1、项目需要实现的能力

*   构建工具构建，配置开发环境、ts 配置
    
*   实现类库的相关方法（版本记录、帮助命令等）
    
*   实现一键登录的方法（预期的功能方法）
    
*   实现号码检测的方法
    
*   单元测试
    
*   上传 npm，支持导入
    

### 2、搭建基础架构，配置 webpack。

我们选择了 ts，首先配置下 tsconfig.json，然后配置 webpack，引入 ts-lodader，通过 webpack-merge 自行配置生产环境和开发环境，比较简单就不重复了

```
    module.exports = {
        entry: {
            sdk: [path.resolve(__dirname, '../src/index.ts')]
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.js'],
        },
        output: {
            path: path.resolve(__dirname, '../dist'),
            filename: '[name].js',
            library: 'SDK',
            libraryTarget: 'umd'
        },
        module: {
          rules: [
            {
              test: /.ts?$/,
              exclude: /node_modules/,
              use: [
                  {
                    loader: 'babel-loader',
                    options: {
                      presets: ['@babel/preset-env'],
                    },
                  },
                  {
                    loader: 'ts-loader',
                    options: {
                      compilerOptions: {
                        noEmit: false,
                      },
                    },
                  },
                ],
            },
          ]
        }


```

### 3、实现类库的相关方法

下面是项目的主要目录结构

*   src 源代码
    
*   scripts 是 webpack 的相关配置
    
*   public 是用来调试和打包的目录
    
*   tests 单元测试
    

LibInfo.ts 用来实现库的一些方法，比如获取版本号，帮助文档，展示依赖版本等

PhoneNumberLogin.ts 一键登录类

PhoneNumberAuth.ts 号码认证类

ajax.ts 简单封装的 ajax 请求

index.ts 作为入口文件

```
js-sdk                   
├─ __tests__                                       
│  └─ utils                     
│     ├─ ajax.test.js           
│     └─ commont.test.js                      
├─ public                       
│  ├─ index.html                
│  └─ sdk.js                    
├─ scripts                                     
│  ├─ webpack.base.config.js    
│  ├─ webpack.dev.config.js     
│  └─ webpack.prod.config.js    
├─ src                          
│  ├─ lib                       
│  │  ├─ LibInfo.ts             
│  │  ├─ PhoneNumberAuth.ts     
│  │  ├─ PhoneNumberLogin.ts    
│  │  └─ Init.ts                
│  ├─ utils                             
│  │  ├─ ajax.ts                
│  │  ├─ common.ts                       
│  │  └─ interface.ts           
│  └─ index.ts                  
├─ Readme.md                    
├─ index.d.ts                   
├─ jest.config.js               
├─ package.json                 
├─ tsconfig.json                          
└─ yarn.lock                    


```

### 4、实现 SDK 的接口

1、在调用之前，我们需要引用第三方库，而且是 md5 加密的（如下），无法直接下载本地使用，所以考虑直接插入 head 中

  
![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHr8pEvHd1Htxd2CLkUUBRUias4fB2jMuIz219Z8dUWeLQiaia9h7YE7hGehfnbiahCwicXtic5UF3rU57yA/640?wx_fmt=other&from=appmsg)

```
    exportconst scriptInit = (src: string, callback?: Function) => {
        const script:any = document.createElement('script'),
            fn = callback || function(){};
        script.type = 'text/javascript';
        //IE
        if(script.readyState){
            script.onreadystatechange = function(){
                if( script.readyState == 'loaded' || script.readyState == 'complete' ){
                    script.onreadystatechange = null;
                    fn();
                }
            };
        }else{
            //其他浏览器
            script.onload = function(){
                fn();
            };
        }
        script.src = src;
        document.getElementsByTagName('head')[0].appendChild(script);
    }


```

2、我们以实现意见登录号码为例，新建 PhoneNumberLogin.ts

```
    const loginPhoneUrl = `http://test.com`
    exportclass PhoneNumberLogin {
        constructor(options:AppInfo){
            this.Init()
        }
        private Init(){
            // 引入第三方依赖的script
            scriptInit(loginPhoneUrl)
        } 
        // 处理一键登录的接口逻辑
        public LoginApp(options){
            return options
        }
    }


```

这样我们每一个小的功能点都放在一个类中，不对外的设置为私有方法，对外的可以设置为公共方法，其他的通过引用就可以让 SDK 保持良好的可扩展性。

3、在 index.ts 中抛出方法

```
    export * from'./lib/PhoneNumberLogin.ts'


```

4、在项目中使用

`script`导入，一般都需要申请域名，那么就需要考虑容灾，防止一台机器挂掉，服务不可用，一般考虑 CDN 部署

```
    const { PhoneNumberLogin } = Phone-JS-SDK
    const PhoneServer = new PhoneNumberLogin()


```

ES6 Modules 导入

```
    const { PhoneNumberLogin } from"Phone-JS-SDK"
    const PhoneServer = new PhoneNumberLogin()


```

### 5、上传 NPM

接着我们发布下 npm，一个 JS-SDK 就完成了。

登陆 npm 仓库，没有的话去注册一个, 地址 [2]

```
npm login


```

选择一个中意的 SDK 名字，查一下是否存在，这里我们起个名字`Phone-JS-SDK`

 执行`npm version patch && npm publish --registry=https://registry.npmjs.org`，然后就发布成功了。




------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHr8pEvHd1Htxd2CLkUUBRUiaZLlVicNXymNv0xcXwmJgg59kfbof9yz2KhleVk0FFbibQ7RnulIokcEg/640?wx_fmt=other&from=appmsg)  

-----------------------------------------------------------------------------------------------------------------------------------------------------------------

作者：UCloud 云通信技术团队

https://juejin.cn/post/7111880557914488846