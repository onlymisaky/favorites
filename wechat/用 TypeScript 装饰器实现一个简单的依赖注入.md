> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/-dImCVraPlkx1-pBFnwipw)

  

  

  

  

  

导语：在我们的代码中，依赖就是两个模块间的一种关联（如两个类）——往往是其中一个模块使用另外一个模块去做些事情。使用依赖注入降低模块之间的耦合度，使代码更简洁

  

  

  

  

1

  

开始之前

什么是依赖（Dependency）
-----------------

        有两个元素 A、B，如果元素 A 的变化会引起元素 B 的变化，则称元素 B 依赖（Dependency）于元素 A。在类中，依赖关系有多种表现形式，如：一个类向另一个类发消息；一个类是另一个类的成员；一个类是另一个类的某个操作参数，等等。

为什么要依赖注入（DI） 
-------------

        我们先定义四个 Class，车，车身，底盘，轮胎。然后初始化这辆车，最后跑这辆车。

  
![](https://mmbiz.qpic.cn/mmbiz_jpg/xsw6Lt5pDCswU2I91apibKa3HfrcYXRhKdHibUpVh2XXV6ice7ORssKOrkyG7RNSZxiaDNkkV7AbicuPwRjWAxgxqEg/640)　　假设我们需要改动一下轮胎（Tire）类，把它的尺寸变成动态的，而不是一直都是 30。

  
![](https://mmbiz.qpic.cn/mmbiz_png/xsw6Lt5pDCswU2I91apibKa3HfrcYXRhKr0lP0icUEb4mKOgsibWdqWne18ic1ufI201595YnBAnLQk2jz9toUxqtQ/640)  
　　由于我们修改了轮胎的定义，为了让整个程序正常运行，我们需要做以下改动：  
![](https://mmbiz.qpic.cn/mmbiz_jpg/xsw6Lt5pDCswU2I91apibKa3HfrcYXRhKzsCJjGibhEZyrtRNL6EQ1C7lOu3QPehJx0qicicic60Oy7eDRItibgqgodA/640)　　由此我们可以看到，仅仅是为了修改轮胎的构造函数，这种设计却需要修改整个上层所有类的构造函数！在软件工程中，这样的设计几乎是不可维护的。  
　　所以我们需要进行 **控制反转（IoC）**，即上层控制下层，而不是下层控制着上层。我们用 **依赖注入（Dependency Injection）** 这种方式来实现控制反转。**所谓依赖注入，就是把底层类作为参数传入上层类，实现上层类对下层类的 “控制”。**  
　　这里我们用构造方法传递的依赖注入方式重新写车类的定义：

![](https://mmbiz.qpic.cn/mmbiz_jpg/xsw6Lt5pDCswU2I91apibKa3HfrcYXRhKmTz04QXwJGvHcZcx5K3AkFds6iacrAVbT1Qicq9F68re8UZTVGsPEVbw/640)    这里我只需要修改轮胎类就行了，不用修改其他任何上层类。这显然是更容易维护的代码。不仅如此，在实际的工程中，这种设计模式还有利于不同组的协同合作和单元测试。

2

  

环境配置

1. 安装 `typescript` 环境以及重要的 polyfill `reflect-metadata`。

2. 在 `tsconfig.json` 中配置 `compilerOptions`

```
{    "experimentalDecorators": true, // 开启装饰器    "emitDecoratorMetadata": true, // 开启元编程}
```

同时在入口文件引入 `reflect-metadata`。

3

  

预备知识

### Reflect

#### 简介

`Proxy` 与 `Reflect` 是 `ES6` 为了操作对象引入的 `API`，`Reflect` 的 `API` 和 `Proxy` 的 `API` 一一对应，并且可以函数式的实现一些对象操作。另外，使用 `reflect-metadata` 可以让 `Reflect` 支持**元编程**。

#### 参考资料

Reflect - JavaScript | MDN  
Metadata Proposal - ECMAScript

#### 类型获取

*   类型元数据：design:type
    

*   参数类型元数据：design:paramtypes
    

*   返回类型元数据：design:returntype
    

**使用方法**

```
/**  * target: Object * propertyKey?: string | symbol */Reflect.getMetadata('design:type', target, propertyKey); // 获取被装饰属性的类型Reflect.getMetadata("design:paramtypes", target, propertyKey); // 获取被装饰的参数类型Reflect.getMetadata("design:returntype", target, propertyKey); // 获取被装饰函数的返回值类型
```

4

  

正式开始

编写模块
----

首先写一个服务提供者，作为被依赖模块:

```
// @services/log.tsclass LogService {  public debug(...args: any[]): void {    console.debug('[DEB]', new Date(), ...args);  }  public info(...args: any[]): void {    console.info('[INF]', new Date(), ...args);  }  public error(...args: any[]): void {    console.error('[ERR]', new Date(), ...args);  }}
```

然后我们再写一个消费者：

```
// @controllers/custom.tsimport LogService from '@services/log';class CustomerController {  private log!: LogService;  private token = "29993b9f-de22-44b5-87c3-e209f4174e39";  constructor() {    this.log = new LogService();  }  public main(): void {    this.log.info('Its running.');  }}
```

现在我们看到，消费者在 `constructor` 构造函数内对 `LogService` 进行了实例化，并在 `main` 函数内进行了调用，这是**传统的调用方式**。

当 `LogService` 变更，修改了构造函数，而这个模块被依赖数很多，我们就得挨个找到引用此模块的部分，并一一修改实例化代码。

架构设计
----

1.  我们需要用一个 `Map` 来存储注册的依赖，并且它的 `key` 必须唯一。所以我们首先设计一个容器。
    
2.  注册依赖的时候尽可能简单，甚至不需要用户自己定义 `key`，所以这里使用 `Symbol` 和唯一字符串来确定一个依赖。
    
3.  我们注册的依赖不一定是类，也可能是一个函数、字符串、单例，所以要考虑不能使用装饰器的情况。
    

### Container

先来设计一个 `Container` 类，它包括 `ContainerMap`、`set`、`get`、`has` 属性或方法。`ContainerMap` 用来存储注册的模块，`set` 和 `get` 用来注册和读取模块，`has` 用来判断模块是否已经注册。

*   `set` 形参 `id` 表示模块 `id`， `value` 表示模块。
    

*   `get` 用于返回指定模块 `id` 对应的模块。
    

*   `has` 用于判断模块是否注册。
    

```
// @libs/di/Container.tsclass Container {  private ContainerMap = new Map<string | symbol, any>();  public set = (id: string | symbol, value: any): void => {    this.ContainerMap.set(id, value);  }    public get = <T extends any>(id: string | symbol): T => {    return this.ContainerMap.get(id) as T;  }  public has = (id: string | symbol): Boolean => {    return this.ContainerMap.has(id);  }}const ContainerInstance = new Container();export default ContainerInstance;
```

### Service

现在实现 `Service` 装饰器来注册类依赖。

```
// @libs/di/Service.tsimport Container from './Container';interface ConstructableFunction extends Function {  new (): any;}// 自定义 id 初始化export function Service (id: string): Function;// 作为单例初始化export function Service (singleton: boolean): Function;// 自定义 id 并作为单例初始化export function Service (id: string, singleton: boolean): Function;export function Service (idOrSingleton?: string | boolean, singleton?: boolean): Function {  return (target: ConstructableFunction) => {    let _id;    let _singleton;    let _singleInstance;    if (typeof idOrSingleton === 'boolean') {      _singleton = true;      _id = Symbol(target.name);    } else {      // 判断如果设置 id，id 是否唯一      if (idOrSingleton && Container.has(idOrSingleton)) {        throw new Error(`Service：此标识符（${idOrSingleton}）已被注册.`);      }      _id = idOrSingleton || Symbol(target.name);      _singleton = singleton;    }    Reflect.defineMetadata('cus:id', _id, target);    if (_singleton) {      _singleInstance = new target();    }    Container.set(_id, _singleInstance || target);  };};
```

`Service` 作为一个类装饰器，`id` 是可选的一个标记模块的变量，`singleton` 是一个可选的标记是否单例的变量，`target` 表示当前要注册的类，拿到这个类之后，给它添加 `metadata`，方便日后使用。

### Inject

接下来实现 `Inject` 装饰器用来注入依赖。

```
// @libs/di/Inject.tsimport Container from './Container';// 使用 id 定义模块后，需要使用 id 来注入模块export function Inject(id?: string): PropertyDecorator {  return (target: Object, propertyKey: string | symbol) => {    const Dependency = Reflect.getMetadata("design:type", target, propertyKey);    const _id = id || Reflect.getMetadata("cus:id", Dependency);    const _dependency = Container.get(_id);    // 给属性注入依赖    Reflect.defineProperty(target, propertyKey, {      value: _dependency,    });  };}
```

5

  

开始使用

### 服务提供者

log 模块：

```
// @services/log.tsimport { Service } from '@libs/di';@Service(true)class LogService {  ...}
```

config 模块：

```
// @services/config.tsimport { Container } from '@libs/di';export const token = '29993b9f-de22-44b5-87c3-e209f4174e39';// 可在入口文件处调用以载入export default () => {  Container.set('token', token);};
```

### 消费者

```
// @controllers/custom.tsimport LogService from '@services/log';class CustomerController {  // 使用 Inject 注入  @Inject()  private log!: LogService;  // 使用 Container.get 注入  private token = Container.get('token');  public main(): void {    this.log.info(this.token);  }}
```

### 运行结果

```
[INF] 2020-08-07T11:56:48.775Z 29993b9f-de22-44b5-87c3-e209f4174e39
```

### 注意事项

`decorator` 有可能会在正式调用之前初始化，因此 `Inject` 步骤可能会在使用 `Container.set` 注册之前执行（如上文的 `config` 模块注册和 `token` 的注入），此时可以使用 `Container.get` 替代。

我们甚至可以让参数注入在 `constructor` 形参里面，使用 `Inject` 直接在构造函数里注入依赖。当然这就需要自己下去思考了：

```
constructor(@Inject() log: LogService) {  this.log = log;}
```

- END -

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/udZl15qqib0N1EHQBKUyQ1fxfKoHxvOj1aicVtvNnp98EXusqdIFclX6O2rM53p0d3RDIOcz9KIhhibNvnVw2LTyw/640?wx_fmt=gif)  

---------------------------------------------------------------------------------------------------------------------------------------------------

```
分享前端好文，点亮 在看

```