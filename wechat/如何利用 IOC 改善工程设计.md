> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/AvoFeACu4wCjQhYeLkP2bw)

**控制反转** **(Inversion of Control)** 及其背后的 SOLID 设计原则已经非常成熟，并且在传统软件开发领域得到了验证。

本文从 JavaScript 生态出发，结合领域内流行的基础设施和成功的项目样例，对这套这套方法论进行重新审视。

绪论
--

### 什么是 IOC 控制反转

一个来自 React 的例子：Context – React[1]

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zic34kPdFhH6iba23nQQ54tzD9MswIfmic2h8k9UKudqr0nVoTXomSqxw6Qq2A0ATUloqwmmSicXJOQvA/640?wx_fmt=png)

Avatar 虽然被诸多底层组件依赖，但是它却不是被底层组件引入并初始化的，这样就实现了底层组件与 Avatar 的解耦。

*   底层组件不再关注 Avatar 的具体实现
    

*   仅关注一个抽象的承诺：上层组件会传入一个可渲染的片段
    

*   Avatar 的初始化由多个地点集中到了一起
    

完成了复杂度的收束，并且没有影响代码的能力。

这个例子仅说明了 IOC 的核心，完整的 IOC 实践与 **SOLID 设计原则** 紧密相关

维基百科: SOLID (面向对象设计)

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zic34kPdFhH6iba23nQQ54tzDNtjzv9YUUXYne9B5uamoCStHqCic7o4V3Ztvfg2iaxMAAJ7O4FSicjsXg/640?wx_fmt=png)

实际上这也是 IOC 难以被讲透的主要原因：IOC 不是一种单独的技术，而是一整套方法论。

这套方法论试图解决从项目架构设计，开发协作流程，再到后期项目迭代直到代码老化等多个环节中的多个问题。

很难说某些优势是不是 IOC 直接带来的，但是 IOC 确实和这套方法论配合良好，后面可以看到例子。

两个关键点：

*   **单一功能原则** 确保了功能单元的可复用性，同时带来了一些好处。
    

*   边界清晰，关注点集中；
    
*   代码即文档，降低命名难度，有助于提升可读性。
    

*   单元间的调用基于 interface 的共识。也被称为 **Interface Driven**。
    

*   在设计之初，自顶向下地拆分功能模块，并明确各单元间的接口（在依赖单元被实现之前，不阻塞当前单元被开发，有利于团队协作与并行）；
    
*   对其他模块的认知仅限于 interface，而不应依赖其特定的实现方式（可替换性：便于 Mock 和 重构）。
    

### 模块与 IOC

在社区中，也有一些声音认为借助模块系统的能力，JavaScript 可以获取与 IOC 类似的优势。

举个例子：

```
// my-class.tsClass MyClass {}// 单例export const myClass = new MyClass();// 工厂函数export const makeMyClass() { return new Myclass();}// foo.tsimport { myClass } from 'my-class.ts';// bar.tsimport { makeMyClass } from 'my-class.ts';
```

这里的 myClass 可以是单例的，并且在它自己的模块中被初始化，其它模块不需要知道细节。

在小型项目中，这样处理是足够好的，简单且符合直觉，但是：

*   实际上发生了耦合，对 my-class.ts 的引用就是这种耦合的体现。
    

*   在一个非常大的项目 Repo 中，需要关注 my-class.ts 的文件位置，它甚至可能位于另一个 Package。
    

*   依赖了一个具体的实现而非接口。
    

*   因此在你编写这段代码的时候，MyClass 需要存在，并且实现了你需要的接口。
    
*   这种依赖缺乏某种预先设计，非常不利于协作。
    

*   潜在的循环依赖问题。
    

*   Modules: CommonJS modules | Node.js v19.4.0 Documentation[2]
    
*   ES6 Modules and Circular Dependency[3]
    

*   myClass 单例的生命周期是不可控的，被实例化的时机是不明确的。
    
*   工厂函数需要专门编写。
    

InversifyJS：JavaScript 生态内最流行的 IOC 框架
-------------------------------------

InversifyJS 是一个轻量的 (4KB) IOC 容器 ，可用于编写 TypeScript 和 JavaScript 应用。

主要目标:

*   允许 JavaScript 开发人员编写遵循 SOLID 原则的代码。
    
*   促进并鼓励遵守最佳的面向对象编程和依赖注入实践。
    
*   尽可能少的运行时开销。
    
*   提供艺术编程体验和生态。
    

### 一分钟认识 InversifyJS

*   提供一个容器的基础设施，各模块都被注册到 Container 容器中。
    

*   容器可以简单理解为一个 Map：`container = new Container()`
    
*   容器中的每个单元拥有自己的 **标识符（Service Identifier）** 和预先定义的 **interface**。  
    1、标识符是集中声明的常量，其值一般是一个 Symbol 对象，例如下文中的 `TYPES.FOO`  
    2、interface 使用 TS 声明，例如下文中的`Foo`  
    3、标识符 和 interface 共同构成了在设计阶段的 **模块抽象**
    
*   模块注册到容器是集中完成的  
    1、FooImpl 实现了 Foo 接口，以下代码将其**实现与抽象绑定**  
    2、`container.bind<Foo>(TYPES.FOO).to(FooImpl)`
    

*   当其它模块需要与模块 Foo 交互，通过 @inject(标识符) 声明对 Foo 的依赖，Foo 的实例会被自动注入。
    

*   `@inject(TYPES.FOO)`
    

**标识符 (Service Identifier)** 也可以使用 string 或者其它类型，只要意义清晰即可。其 TS 声明如下：

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zic34kPdFhH6iba23nQQ54tzDlC4FIMzkQrJED4t1LfvGYu8bnytCBlwEMrshSvMNGhL099Hv9BicwCg/640?wx_fmt=png)

### InversifyJS 实战

> 本小节基于官方文档改编

#### 步骤 1: 声明接口和类型

目标是编写遵循依赖倒置原则的代码，这意味着我们应该 “依赖于抽象而不依赖于具体实现”。先声明一些 interface：

```
// file interfaces.tsinterface Warrior {    fight(): string;    sneak(): string;}interface Weapon {    hit(): string;}interface ThrowableWeapon {    throw(): string;}
```

Inversifyjs 需要在运行时使用类型标记作为标识符。接下来将使用 `Symbol` 作为标识符：

```
// file types.tsconst TYPES = {    Warrior: Symbol.for("Warrior"),    Weapon: Symbol.for("Weapon"),    ThrowableWeapon: Symbol.for("ThrowableWeapon")};export { TYPES };
```

这一步完成了整个应用的 **模块抽象** 设计。

#### 步骤 2: 使用 `@injectable` 和 `@inject` 装饰器声明依赖

编写一些类，来实现上一步声明的 interface。

希望使用依赖注入的类需要添加 `@injectable` 装饰器来激活这个特性，然后就可以使用`@inject` 声明依赖。

```
// file entities.tsimport { injectable, inject } from "inversify";import "reflect-metadata";import { Weapon, ThrowableWeapon, Warrior } from "./interfaces"import { TYPES } from "./types";@injectable()class Katana implements Weapon {    public hit() {        return "cut!";    }}@injectable()class Shuriken implements ThrowableWeapon {    public throw() {        return "hit!";    }}@injectable()class Ninja implements Warrior {    private _katana: Weapon;    private _shuriken: ThrowableWeapon;    public constructor(        @inject(TYPES.Weapon) katana: Weapon,        @inject(TYPES.ThrowableWeapon) shuriken: ThrowableWeapon    ) {        this._katana = katana;        this._shuriken = shuriken;    }    public fight() { return this._katana.hit(); }    public sneak() { return this._shuriken.throw(); }}export { Ninja, Katana, Shuriken };
```

可选地，也支持使用属性注入来代替构造函数注入，更加简洁：

```
@injectable()class Ninja implements Warrior {    @inject(TYPES.Weapon) private _katana: Weapon;    @inject(TYPES.ThrowableWeapon) private _shuriken: ThrowableWeapon;    public fight() { return this._katana.hit(); }    public sneak() { return this._shuriken.throw(); }}
```

#### 步骤 3: 创建和配置容器

这一步骤我们真正将 **实现** 绑定到各自的 **抽象** 上。

推荐在命名为 `inversify.config.ts` 的文件中创建和配置容器。

> 这是唯一有耦合的地方，项目的其它地方，不应该包含对其他类的引用。

```
// file inversify.config.tsimport { Container } from "inversify";import { TYPES } from "./types";import { Warrior, Weapon, ThrowableWeapon } from "./interfaces";import { Ninja, Katana, Shuriken } from "./entities";const myContainer = new Container();myContainer.bind<Warrior>(TYPES.Warrior).to(Ninja);myContainer.bind<Weapon>(TYPES.Weapon).to(Katana);myContainer.bind<ThrowableWeapon>(TYPES.ThrowableWeapon).to(Shuriken);export { myContainer };
```

#### 步骤 4: 解析依赖

您可以使用方法 `get<T>`从 Container 中获得依赖。

> 应该在根结构 (尽可能靠近应用程序的入口点的位置) 去解析依赖（指引入 inversify.config），避免反模式的服务定位器问题。
> 
> 译文：服务定位器 Service Locator 是一种反模式的设计 [4]

```
import { myContainer } from "./inversify.config";import { TYPES } from "./types";import { Warrior } from "./interfaces";const ninja = myContainer.get<Warrior>(TYPES.Warrior);expect(ninja.fight()).eql("cut!"); // trueexpect(ninja.sneak()).eql("hit!"); // true
```

### InversifyJS 的优势

> 本小节基于官方文档改编

#### 解耦与依赖抽象

InversifyJS 赋予你真正解耦的能力。

在上一小节的实战中，`Ninja` 类永远不会直接持有 `Katana` 或者 `Shuriken` 类。但是，它会指向接口（在设计时）或者符号（在运行时）。

由于这是抽象的所以这是可接受的。毕竟 **依赖抽象** 正是依赖反转所要做的。InversifyJS 容器是应用中唯一清楚生命周期和依赖关系的元素。

应用中所有的耦合关系发生在唯一一处：`inversify.config.ts` 文件中。这非常重要，想象我们正在更改一个游戏的难度级别，只需要去 `inversify.config.ts` 文件中并且修改 Katana 的绑定即可：

```
import { Katana } from "./entitites/SharpKatana";if(difficulty === "hard") {    container.bind<Katana>(TYPES.KATANA).to(SharpKatana);} else {    container.bind<Katana>(TYPES.KATANA).to(Katana);}
```

你根本不需要修改 Ninja 文件！

想象一下，如果你在 `inversify.config` 当中实现一些小机制，理论上可以在运行时对应用的所有功能单元进行动态替换，然后你得到了**一个所有内部单元都可以做 AB 测试 / 灰度发布应用**！

在下一小节 **Theia 的架构中**，可以看到此机制是如何提供了魔法般的高度的可定制性与灵活性。

需要付出的代价是符号或者字符串字面量的使用，但是只要你在一个文件中定义所有的字符串字面量，那么这个代价将有所缓和 (Redux 中的 actions 就是这么做的)。

好消息是未来这些符号或者字符串字面量能够由 TS 编译器自动生成，但是目前这还在 TC39 委员会的手中。

#### 解决对象组合的痛点

一个常见的模式：

```
var svc = new ShippingService(    new Productlocator(),    new PricingService(),    new InventoryService(),    new TrackingRepository(new ConfigProvider()),    new Logger(new EmailLogger(new ConfigProvider())) );
```

单元之间层层嵌套的依赖关系是 OOP 的一个痛点，并且这种嵌套关系会很快增长到无法有效维护。即使使用工厂函数，你所编写的额外代码仍然是不划算的。

#### 类型安全

支持 TypeScript ，被注入的模块有完整的类型声明

#### 高级特性

*   解决复杂依赖关系
    

*   可选依赖：`@optional()` 装饰器声明一个可选依赖
    
*   层次化的容器  
    1、可以将多个 Container 使用类似原型链的方式嵌套连接，其寻址方式也类似原型链  
    2、`childContainer.parent = parentContainer`
    
*   多重注入  
    1、当有两个或者多个具体实现被绑定到同一个标识符，可以使用多重注入  
    2、`@multiInject` 装饰器会将多个实现以数组方式注入
    
*   解决循环依赖  
    1、`@lazyInject` 装饰器将对依赖项的注入延迟到了真正要使用它们的那一刻，这发生在类实例被创建之后  
    2、有能力识别循环依赖，并且会给出提示信息
    

*   中间件与拦截器：Logger
    
*   容器内容的生命周期管理：单元被绑定时可以声明其生命周期
    

*   TransientScope 默认值，每次从容器中获取时都初始化新实例
    
*   SingletonScope 单例，每次获取返回同一实例
    
*   RequestScope 前两者的混合，在同一个依赖树上总是返回同一实例
    

*   开发者工具
    

Dive Into Theia
---------------

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zic34kPdFhH6iba23nQQ54tzD1HVfMyvsavxgQox3wRtlfboldFH95WI0dy1KZ8ZBGZgv4UbUgEK0Fw/640?wx_fmt=png)

Eclipse Theia [5] 是一个使用现代 Web 技术构建自定义云和桌面 IDE 和工具的平台。

Theia 本身并不是一个工具，Theia 是一个开发 IDE 的框架，可以基于 Theia 创建自己的 IDE。Theia 使用 Typescript 编写，整体技术体系和 Visual Studio Code 类似。

### Theia 为什么是一个好例子

*   出身名门
    
*   高完成度
    
*   足够复杂
    

*   挑战大
    
*   代码量多
    
*   以开源项目方式维护
    

*   足够新
    

*   使用现代技术栈
    
*   基于 TypeScript 的 IOC & SOLID 实践
    

### Theia 的目标与挑战

*   多平台：整个应用可运行于 B/S 模式，也可运行于 Electron 中
    
*   对标 VS Code 的现代 IDE 架构，兼容 VS Code 插件
    
*   高可维护性的模块化架构
    

*   尽可能复用基础功能
    
*   使用标准组件，不重复造轮子
    

*   高扩展性与灵活性
    

*   本质上是个框架，设计出来就是为了二次开发
    
*   用户可以轻松改变、扩展内置模块的行为
    
*   用户可以按照规约添加新的模块和功能
    

这几个目标对于应用架构设计提出了极高的要求。

### Theia 的架构设计

Theia 整体上分为前端和后端两个子应用，中间使用 JSON-RPC 通信。

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zic34kPdFhH6iba23nQQ54tzDSUu1vBSxfUz1Uia2KoZx2ZOFylic6Vpzl5484FFrXia17AicNsp2ORp90w/640?wx_fmt=png)

**前端**

负责显示 UI，处理交互，运行在浏览器 (或 Electron 窗口) 中。前端进程启动时，将首先加载所有 Extension 贡献的 DI 模块，然后获取 FrontendApplication 的实例并在其上调用 start()。

**后端**

运行在 Node.js 中，是一个基于 Express.js 的服务。后端应用程序的启动会首先加载所有所有 Extension 贡献的 DI 模块，然后它会获取一个 BackendApplication 实例并在其上调用 start(portNumber)。

**依赖注入**

前后端都使用 DI(具体来说就是 Inversify.js) 来组合逻辑，稍后我们会详细讨论。

**Extension**

Extension 是 Theia 中的功能模块（npm package），Theia 就是由无数个 Extension 组成的。

编写一个 Extension 是用户定制 Theia 的主要方式。用户提供的 Extension 会和 Theia 内置的 Extension 一起经历编译过程，并产出一个可运行的应用。

用户 Extension 和内置 Extension 地位相同，其权限和能力几乎不受限制。

> 注意这与 VS Code 定义的插件 (VS Code Extension) 是不同的。
> 
> 插件是运行时可动态加载的，在 Theia 中被称为 **Plugin**。

因为 Theia 由前后端两个子应用组成，所以 Extension 一般也由前后端两部分组成，其典型目录结构为：

*   common 目录
    

*   包含不依赖于任何运行时的代码
    
*   一般包含前后端 RPC 接口的定义，常量，通用的工具函数等
    

*   browser 目录
    

*   包含需要现代浏览器作为平台 (DOM API) 的代码。
    

*   electron-browser 目录
    

*   包含需要 DOM API 以及 Electron renderer-process 特定 API 的前端代码。
    

*   node 目录
    

*   包含需要 Node.js 作为平台的（后端）代码。
    

*   node-electron 目录
    

*   包含专用于 Electron 的（后端）代码。
    

可以通过 Theia 的内置模块 [6]，来一窥其是怎么进行模块划分的。

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zic34kPdFhH6iba23nQQ54tzDc3XPdNnTmyecRNcg7MuX7Ijz7CKkO0EWibFH7AqAicCkD8BkYzr1k9ibw/640?wx_fmt=png)

扁平且清晰。

**构建 Theia 应用**

Theia 可以基于 Package.json 声明构建：

```
{  "private": true,  "dependencies": {    "@theia/callhierarchy": "latest",    "@theia/console": "latest",    "@theia/core": "latest",    "@theia/debug": "latest",    "@theia/editor": "latest",    "@theia/editor-preview": "latest",    "@theia/file-search": "latest",    "@theia/filesystem": "latest",    "@theia/getting-started": "latest",    // 以下省略  },    "devDependencies": {        "@theia/cli": "latest"    },    "scripts": {        "preinstall": "node-gyp install"    }}
```

通过编辑 dependencies， 可以挑选本次构建包含哪些功能模块。

### 拆解一个 Theia Extension

此处以内置 Package `file-search` 为例，探索一下其内部实现，这个模块实现了弹出式文件选择弹窗：

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zic34kPdFhH6iba23nQQ54tzDm6DMriaiaolK4v74ISh4JaksNqXIAqkQ5gxWtE26ibHrcIpyfoI4RiaMiag/640?wx_fmt=png)

其目录结构如下：

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zic34kPdFhH6iba23nQQ54tzDRd6Os39rXL0jaVFIZ5Pib49Z2jKF4h3sdRBK0DYz7G5AgUsUSSQAAsg/640?wx_fmt=png)

#### Common

**common/file-search-service.ts**

*   前后端 JSON-RPC 接口定义
    
*   标识符 Symbol 定义
    
*   本模块的 inerface
    
*   其它常量定义
    

```
import { CancellationToken } from '@theia/core';export const fileSearchServicePath = '/services/search';/** * The JSON-RPC file search service interface. */export interface FileSearchService {    /**     * finds files by a given search pattern.     * @return the matching file uris     */    find(searchPattern: string, options: FileSearchService.Options, cancellationToken?: CancellationToken): Promise<string[]>;}export const FileSearchService = Symbol('FileSearchService');export namespace FileSearchService {    export interface BaseOptions {        useGitIgnore?: boolean        includePatterns?: string[]        excludePatterns?: string[]    }    export interface RootOptions {        [rootUri: string]: BaseOptions    }    export interface Options extends BaseOptions {        rootUris?: string[]        rootOptions?: RootOptions        fuzzyMatch?: boolean        limit?: number    }}export const WHITESPACE_QUERY_SEPARATOR = /\s+/;
```

#### 后端

**node/file-search-service-impl.ts**

这里实现了功能的后端服务，依赖的模块使用 @inject 注入：

```
import * as cp from 'child_process';import * as readline from 'readline';import { injectable, inject } from '@theia/core/shared/inversify';import URI from '@theia/core/lib/common/uri';import { FileUri } from '@theia/core/lib/node/file-uri';import { RawProcessFactory } from '@theia/process/lib/node';import { FileSearchService, WHITESPACE_QUERY_SEPARATOR } from '../common/file-search-service';import * as path from 'path';@injectable()export class FileSearchServiceImpl implements FileSearchService {    constructor(        @inject(ILogger) protected readonly logger: ILogger,        /** @deprecated since 1.7.0 */        @inject(RawProcessFactory) protected readonly rawProcessFactory: RawProcessFactory,    ) { }    async find(searchPattern: string, options: FileSearchService.Options, clientToken?: CancellationToken): Promise<string[]> {        // 略去具体实现    }    private doFind(rootUri: URI, options: FileSearchService.BaseOptions, accept: (fileUri: string) => void, token: CancellationToken): Promise<void> {        // 略去具体实现    }    private getSearchArgs(options: FileSearchService.BaseOptions): string[] {        // 略去具体实现    }}
```

**node/file-search-backend-module.ts**

类似 `inversify.config.ts` 的作用，将 `FileSearchServiceImpl` 和 `ConnectionHandler` 绑定到其抽象：

```
import { ContainerModule } from '@theia/core/shared/inversify';import { ConnectionHandler, JsonRpcConnectionHandler } from '@theia/core/lib/common';import { FileSearchServiceImpl } from './file-search-service-impl';import { fileSearchServicePath, FileSearchService } from '../common/file-search-service';export default new ContainerModule(bind => {    bind(FileSearchService).to(FileSearchServiceImpl).inSingletonScope();    bind(ConnectionHandler).toDynamicValue(ctx =>        new JsonRpcConnectionHandler(fileSearchServicePath, () =>            ctx.container.get(FileSearchService)        )    ).inSingletonScope();});
```

#### 前端

**browser/quick-file-open.ts**

包含 UI 相关的主要业务逻辑：

```
import { inject, injectable, optional, postConstruct } from '@theia/core/shared/inversify';import { OpenerService, KeybindingRegistry, QuickAccessRegistry, QuickAccessProvider, CommonCommands } from '@theia/core/lib/browser';import { WorkspaceService } from '@theia/workspace/lib/browser/workspace-service';import URI from '@theia/core/lib/common/uri';import { FileSearchService, WHITESPACE_QUERY_SEPARATOR } from '../common/file-search-service';import { CancellationToken, Command, nls } from '@theia/core/lib/common';import { LabelProvider } from '@theia/core/lib/browser/label-provider';import { NavigationLocationService } from '@theia/editor/lib/browser/navigation/navigation-location-service';import * as fuzzy from '@theia/core/shared/fuzzy';import { MessageService } from '@theia/core/lib/common/message-service';import { FileSystemPreferences } from '@theia/filesystem/lib/browser';import { EditorOpenerOptions, EditorWidget, Position, Range } from '@theia/editor/lib/browser';import { findMatches, QuickInputService, QuickPickItem, QuickPicks } from '@theia/core/lib/browser/quick-input/quick-input-service';export const quickFileOpen = Command.toDefaultLocalizedCommand({    id: 'file-search.openFile',    category: CommonCommands.FILE_CATEGORY,    label: 'Open File...'});export interface FilterAndRange {    filter: string;    range?: Range;}// Supports patterns of <path><#|:><line><#|:|,><col?>const LINE_COLON_PATTERN = /\s?[#:(](?:line "#:(")?(\d*)(?:[#:,](\d* "#:,"))?)?\s*$/;export type FileQuickPickItem = QuickPickItem & { uri: URI };@injectable()export class QuickFileOpenService implements QuickAccessProvider {    static readonly PREFIX = '';    @inject(KeybindingRegistry)    protected readonly keybindingRegistry: KeybindingRegistry;    @inject(WorkspaceService)    protected readonly workspaceService: WorkspaceService;    @inject(OpenerService)    protected readonly openerService: OpenerService;    @inject(QuickInputService) @optional()    protected readonly quickInputService: QuickInputService;    @inject(QuickAccessRegistry)    protected readonly quickAccessRegistry: QuickAccessRegistry;    @inject(FileSearchService)    protected readonly fileSearchService: FileSearchService;    @inject(LabelProvider)    protected readonly labelProvider: LabelProvider;    @inject(NavigationLocationService)    protected readonly navigationLocationService: NavigationLocationService;    @inject(MessageService)    protected readonly messageService: MessageService;    @inject(FileSystemPreferences)    protected readonly fsPreferences: FileSystemPreferences;    registerQuickAccessProvider(): void {        this.quickAccessRegistry.registerQuickAccessProvider({            getInstance: () => this,            prefix: QuickFileOpenService.PREFIX,            placeholder: this.getPlaceHolder(),            helpEntries: [{ description: 'Open File', needsEditor: false }]        });    }    /**     * Whether to hide .gitignored (and other ignored) files.     */    protected hideIgnoredFiles = true;    /**     * Whether the dialog is currently open.     */    protected isOpen = false;    private updateIsOpen = true;    protected filterAndRangeDefault = { filter: '', range: undefined };    /**     * Tracks the user file search filter and location range e.g. fileFilter:line:column or fileFilter:line,column     */    protected filterAndRange: FilterAndRange = this.filterAndRangeDefault;    /**     * The score constants when comparing file search results.     */    private static readonly Scores = {        max: 1000,  // represents the maximum score from fuzzy matching (Infinity).        exact: 500, // represents the score assigned to exact matching.        partial: 250 // represents the score assigned to partial matching.    };    @postConstruct()    protected init(): void {        // 省略    }    isEnabled(): boolean {        return this.workspaceService.opened;    }    open(): void {        // 省略    }}
```

**browser/quick-file-open-contribution.ts**

注册菜单，快捷键和 Command，实现触发时的回调：

```
import { injectable, inject } from '@theia/core/shared/inversify';import URI from '@theia/core/lib/common/uri';import { QuickFileOpenService, quickFileOpen } from './quick-file-open';import { CommandRegistry, CommandContribution, MenuContribution, MenuModelRegistry } from '@theia/core/lib/common';import { KeybindingRegistry, KeybindingContribution, QuickAccessContribution } from '@theia/core/lib/browser';import { EditorMainMenu } from '@theia/editor/lib/browser';import { nls } from '@theia/core/lib/common/nls';@injectable()export class QuickFileOpenFrontendContribution implements QuickAccessContribution, CommandContribution, KeybindingContribution, MenuContribution {    @inject(QuickFileOpenService)    protected readonly quickFileOpenService: QuickFileOpenService;    registerCommands(commands: CommandRegistry): void {        commands.registerCommand(quickFileOpen, {            // eslint-disable-next-line @typescript-eslint/no-explicit-any            execute: (...args: any[]) => {                let fileURI: string | undefined;                if (args) {                    [fileURI] = args;                }                if (fileURI) {                    this.quickFileOpenService.openFile(new URI(fileURI));                } else {                    this.quickFileOpenService.open();                }            }        });    }    registerKeybindings(keybindings: KeybindingRegistry): void {        keybindings.registerKeybinding({            command: quickFileOpen.id,            keybinding: 'ctrlcmd+p'        });    }    registerMenus(menus: MenuModelRegistry): void {        menus.registerMenuAction(EditorMainMenu.WORKSPACE_GROUP, {            commandId: quickFileOpen.id,            label: nls.localizeByDefault('Go to File...'),            order: '1',        });    }    registerQuickAccessProvider(): void {        this.quickFileOpenService.registerQuickAccessProvider();    }}
```

**browser/file-search-frontend-module.ts**

与后端类似，完成实现到抽象的绑定。

*   通过 RPC 调用后端服务，实际上是一个透明的 Proxy；
    
*   上文中 `QuickFileOpenFrontendContribution` 分别实现了 `QuickAccessContribution`, `CommandContribution`等多个 interface，所以这里分别完成绑定。
    

```
import { ContainerModule, interfaces } from '@theia/core/shared/inversify';import { CommandContribution, MenuContribution } from '@theia/core/lib/common';import { WebSocketConnectionProvider, KeybindingContribution } from '@theia/core/lib/browser';import { QuickFileOpenFrontendContribution } from './quick-file-open-contribution';import { QuickFileOpenService } from './quick-file-open';import { fileSearchServicePath, FileSearchService } from '../common/file-search-service';import { QuickAccessContribution } from '@theia/core/lib/browser/quick-input/quick-access';export default new ContainerModule((bind: interfaces.Bind) => {    bind(FileSearchService).toDynamicValue(ctx => {        const provider = ctx.container.get(WebSocketConnectionProvider);        return provider.createProxy<FileSearchService>(fileSearchServicePath);    }).inSingletonScope();    bind(QuickFileOpenFrontendContribution).toSelf().inSingletonScope();    [CommandContribution, KeybindingContribution, MenuContribution, QuickAccessContribution].forEach(serviceIdentifier =>        bind(serviceIdentifier).toService(QuickFileOpenFrontendContribution)    );    bind(QuickFileOpenService).toSelf().inSingletonScope();});
```

注意：以下代码引入的是 Interface 而非具体实现。此外，Interface 同时也充当了标识符。

```
import { KeybindingRegistry, KeybindingContribution, QuickAccessContribution } from '@theia/core/lib/browser';
```

在这个例子中，InversifyJS 是链接代码模块的基础设施，即使处于同个 Package 中的不同模块， 也是通过 DI 访问的。

### 如何给正在行驶的汽车换轮子，并且不让司机知道

因为 IOC 的存在，只需要实现一个与原模块接口相同的模块，并且覆盖其绑定，就可以便捷地改变应用的行为。比如上文中的 `QuickFileOpenService`，如果对其行为不满意，可以创建一个 file-search-patched 的 Extension, 在其中实现一个新的 `MyQuickFileOpenService`，然后绑定到原抽象即可：

```
import { QuickFileOpenService } from '@theia/file-search/lib/browser/quick-file-open';import { MyQuickFileOpenService } from './my-quick-file-open';bind(QuickFileOpenService).to(MyQuickFileOpenService).inSingletonScope();
```

神奇的是，`QuickFileOpenFrontendContribution` 仍然可以正常工作，尽管它：

*   处于旧的 file-search 包中
    
*   依赖了`QuickFileOpenService`
    

`QuickFileOpenFrontendContribution` 通过 `@inject` 获取到我们提供的修改版 `MyQuickFileOpenService`，并且和旧实现接口兼容，所以 `QuickFileOpenFrontendContribution` 不需要做任何事情。

**如何保证所有使用 QuickFileOpenService 的地方都能获取到的新版实现？**

> inject 发生于应用逻辑的运行时，而所有的 bind 都在应用入口就提前完成了。
> 
> 只要 bind 的顺序是确定的，那么可供 inject 的内容就是完全确定的。

在 InversifyJS 的推荐的标准实践中， bind 集中发生在 Inversify.config 中，顺序当然是确定的。

在 Theia 中，因为用户通过新增 Package 的方式扩展功能，所以 bind 自然分散在各模块中。但是 Theia 在构建时引入 Extension 的顺序是确定的，然后在应用逻辑启动前按顺序先完成所有模块的 bind，这样也就保证了 inject 的结果是确定的。

### 基于 Theia 进行开发的体验

直观来说，Theia 的这套体系解决了：

*   如何在一个复杂系统中可靠地修改藏于深处的行为
    

*   因为单一职责和 IOC，这些实现相对扁平且便捷清晰，并不难找
    
*   Interface Driven 和 TS 提供了很强的约束 / 辅助
    
*   通过新 Package 去覆盖内置模块的行为而非直接改动内置模块  
    1、内置模块和用户扩展的功能有明确边界，保障核心稳定  
    2、内置模块就是天然的文档  
    3、便于二次开发，用户无需为了修改核心行为而从源头 Fork 后修改
    

*   如何扩展一个复杂的系统
    

*   利用 IOC 实现的 Contribution 机制 [7]
    

对开发者来说，解决了**在哪写**和**怎么写**这两个核心问题后，出错的可能就不多了。

笔者之前写过几个 Theia 的 Extension，有一些还涉及了深度的定制。在缺乏文档的情况下，依靠 TS 和参照 Theia 官方 Package，就实现了功能。

虽然 Theia 在其它方面设计也很优秀，但是如果没有基于 IOC 的这一套方法论，很难想象一个新手开发者经过简单的学习后可以对这样一个庞然大物进行二次开发，并且保证架构合理和功能可靠。

没有银弹: IOC 的问题
-------------

*   JavaScript 构建的应用不总是 OOP 的。
    

*   IOC 或者整个 SOLID 理念脱胎于 Java 等传统技术生态，在开发习惯上存在差异。
    

*   高效使用 IOC 需要相当的学习成本。
    

*   在 Theia 中，也看到了不遵循 IOC 的实现。  
    如何决定哪些地方使用 IOC， 哪些地方又可以突破限制，是一个需要工程经验和直觉的难题。
    

*   IOC 推崇的 interface driven 需要良好的预先设计。
    

*   在迭代快，需求快速变化的互联网领域，这是一个很强的假设。
    

总结
--

涉及到设计模式的讨论，总会有很多似是而非的观点。

如何将设计模式落地到项目，真正地改善工程设计，是一个复杂的开放性问题，希望这篇文章可以给各位带来一些启发。

![](https://mmbiz.qpic.cn/mmbiz_gif/Ljib4So7yuWgdsiawsibl2cqTm0PmXstpmMxMicIDIxQ2FMWwdj8BPCO5nMyWYdZZANdGStH09PtSBPXmjTdibMCbgQ/640?wx_fmt=gif)

点击上方关注 · 我们下期再见 

![](https://mmbiz.qpic.cn/mmbiz_gif/Ljib4So7yuWgdsiawsibl2cqTm0PmXstpmMxMicIDIxQ2FMWwdj8BPCO5nMyWYdZZANdGStH09PtSBPXmjTdibMCbgQ/640?wx_fmt=gif)

### 参考资料

[1]

Context – React: _https://zh-hans.reactjs.org/docs/context.html#before-you-use-context_

[2]

Modules: CommonJS modules | Node.js v19.4.0 Documentation: _https://nodejs.org/api/modules.html#modules_cycles_

[3]

ES6 Modules and Circular Dependency: _https://stackoverflow.com/questions/46589957/es6-modules-and-circular-dependency_

[4]

译文：服务定位器 Service Locator 是一种反模式的设计: _https://juejin.cn/post/7195850600503083066?_

[5]

Eclipse Theia : _https://theia-ide.org/_

[6]

Theia 的内置模块: _https://github.com/eclipse-theia/theia/tree/master/packages_

[7]

Contribution 机制: _https://theia-ide.org/docs/frontend_application_contribution/_