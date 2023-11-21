> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/tzQtLiYDoFWbHQiGJVLwhQ)

![](https://mmbiz.qpic.cn/mmbiz_jpg/wnIMIiaEIIrjFEKHV3czk8glhkdoNZtUhNxdUQOfCPibrsxVZ9Xut2v4gFCIQGuo20hHqYctHMFd0AUegMtAVh4g/640?wx_fmt=jpeg)

在一些优秀的开源框架，如 Angular、Nest.js、Midway 中会看到一种常见的写法 `@符号 + 方法名`，做为一个只有 JavaScript 经验的开发者第一次看到这种写法还是感觉挺新奇的。

**一个 @符号开头 + 方法名，这种写法正是 JavaScript 中的装饰器 Decorators，它附加在我们定义的类、类方法、类字段、类访问器、类自动访问器上，在不改变原对象基础上，为我们的程序增强一些功能，例如逻辑复用、代码解耦**。

如下所示 `@executionTime` 是我们实现的装饰器函数，它会记录被修饰方法的执行耗时，下文中我们会进行详细的介绍。

```
class Person {  @executionTime  run() {}}
```

**  
通过本文你将学到如下内容**：  

![](https://mmbiz.qpic.cn/mmbiz_png/wnIMIiaEIIrjFEKHV3czk8glhkdoNZtUhwF4nOibr8b3U5jUHbIQQx8kXic0VtLibaGOBcSSEqjXwbM2Ilff5OkgCA/640?wx_fmt=png)

装饰器动态
-----

关于 JavaScript 装饰器，已经提案很多年了，尽管提案还未进入最后阶段，得益于 TypeScript 和 babel，我们可以在一些框架中提前使用到该技术。 先了解下装饰器的最新动态，及在 TypeScript、babel 中的支持程度。

一个好消息是 **2022-03 JavaScript 装饰器提案终于进入到 stage 3 了**，这已经是到了候选阶段了，该阶段会接收使用者的反馈并对提案完善，离最终的 stage 4 最近的一个阶段了。查看进入到 TC39 提案的一些语法，参考这里阅读更多 ECMAScript proposals。

一个提案进入到 stage 3 之后，TypeScript 就会去实现它。装饰器是一个特殊的存在，目前 TypeScript 中的装饰器实现还是基于第一版装饰器的提案（这在早期对 TypeScript 也是一个卖点了），和现在 stage 3 中的提案存在很大的差别。

做为用户可能会担心，会不会出现不兼容的情况？兼容肯定是要的，旧版也不会立马废弃，现在是通过 `--experimentalDecorators`、`--emitDecoratorMetadata` 两个配置开启装饰器，stage 3 的提案离最终已经很近了，要么默认开启，要么在增加一个新的配置开启，对使用者来说也许不会有太大的差异，对于库的开发者 目前 TS 装饰器和 JS 最新的装饰器提案实现已经不是一回事了，有很多问题需要考虑。

**在可预见的未来，TypeScript 下个版本 5.0 大概率会实现新版装饰器，参考 TypeScript 接下来的 5.0 版本迭代计划，里面提到了 “实现更新后的 JavaScript 装饰器提案”**。

*   TypeScript 5.0 Iteration Plan #51362
    
*   Implement the updated JS decorators proposal #48885
    

**babel 也一直在跟进 JavaScript 装饰器提案，最新的 stage 3 版本也已实现**，算是支持的比较好的了，通过 @babel/plugin-proposal-decorators 插件提供支持，装饰器不同阶段的提案 babel 都有实现，如下所示：

*   `2022-03`：在 2022 年 3 月的 TC39 会议上就 Stage 3 达成共识的提案版本。阅读更多相关信息 tc39/proposal-decorators@8ca65c046d。
    
*   `2021-12`：2021 年 12 月提交给 TC39 的提案版本。阅读更多相关信息 tc39/proposal-decorators@d6c056fa06。
    
*   `2018-09`：最初提升到第 2 阶段的提案版本，于 2018 年 9 月提交给 TC39。阅读更多相关信息 tc39/proposal-decorators@7fa580b40f。
    
*   `legacy`：最初的第 1 阶段提案，阅读更多相关信息 wycats/javascript-decorators@e1bf8d41bf。
    

**下文用到的所有的代码会用 babel 编译**，接下来让我们先搭建一个支持装饰器的运行环境。

搭建装饰器运行环境
---------

babel 7.19.0 版本已支持 stage 3 装饰器，安装的 babel 大于此即可。

创建一个项目 `decorators-demo`

```
$ mkdir decorators-demo$ cd decorators-demo$ npm init
```

安装 babel 依赖

```
npm i @babel/core @babel/cli @babel/preset-env @babel/plugin-proposal-decorators -D
```

创建一个名为 .babelrc 的新文件配置 babel

```
{  "presets": [    [      "@babel/preset-env",      {        "targets": {          "node": "current"        }      }    ]  ],  "plugins": [    ["@babel/plugin-proposal-decorators", { "version": "2022-03" }] // 这个地方要配置，因为当前默认的版本不是最新的  ]}
```

编辑 package.json scripts 命令

```
"scripts": {  "build": "babel index.js -d dist",  "start": "npm run build && node dist/index.js"}
```

类装饰器
----

**类装饰器修饰的是定义的类本身，我们可以为它添加属性、方法**。类装饰器类型签名如下所示，第一个参数 value 就是被修饰的类。

类型签名如下所示：

```
type ClassDecorator = (value: Function, context: {  kind: "class";  name: string | undefined;  addInitializer(initializer: () => void): void;}) => Function | void;
```

### 为类扩展一个新方法

例如，再不改变原始代码的情况下，借助外部组件使用类装饰器为 Person 类扩展一个方法 run。

```
function addRunMethod(value, { kind, name }) {  if (kind === "class") {    return class extends value {      constructor(...args) {        super(...args);      }      run() {        console.log(`Add a run method for ${this.name}`);      }    }  }}@addRunMethodclass Person {  constructor(name) {    this.name = name  }}const p1 = new Person('Tom')p1.run()const p2 = new Person('Jack')p2.run()
```

以上我们是通过继承被修饰的类并返回一个新的子类方式来扩展一个新方法。我们定义的类装饰器函数 addRunMethod 第一个参数既然是被修饰的类本身，因此我们还可以通过原型方式来扩展一个新的方法或属性。

```
function addRunMethod(value, { kind }) {  if (kind === "class") {    value.prototype.run = function () {      console.log(`Add a run method for ${this.name}`);    }  }}
```

类方法装饰器
------

**类方法装饰器接收一个被修饰的方法做为第一个参数，并可以选择返回一个新方法替换原始的方法**。类型签名如下所示：

```
type ClassMethodDecorator = (value: Function, context: {  kind: "method";  name: string | symbol;  access: { get(): unknown };  static: boolean;  private: boolean;  addInitializer(initializer: () => void): void;}) => Function | void;
```

下面从一个记录方法执行耗时的例子，做个不用装饰器与用装饰器的前后效果对比。日常开发工作中我们可能会有类似的需求：“记录一个方法的执行时间，便于后续做些性能优化”。

### 示例：方法的计算耗时实现

下面定义了一个 Person 类，有一个 run（跑步） 方法，如果已经吃过饭了，他就有更多的力气，跑的就会快些，否则就会跑的慢些。sleep 方法是为了辅助做些延迟测试。

```
const sleep = ms => new Promise(resolve => setTimeout(() => resolve(1), ms));class Person {  async run(isEat) {    const start = Date.now();    if (isEat) {      await sleep(1000 * 1);      console.log(`execution time: ${Date.now() - start}`);      return `I can run fast.`;    }    await sleep(1000 * 5);    console.log(`execution time: ${Date.now() - start}`);    return `I can't run any faster.`;  }}const p = new Person();console.log(await p.run(true))
```

上面代码暴露出两个问题：

*   **代码耦合**：计算方法执行耗时逻辑与业务代码耦合，如果测试没问题之后，想要移除这部分计算执行耗时的代码逻辑，是不是就很难？
    
*   **重复性代码**：一个方法内，代码 7 行、12 行，计算最后耗时部分是完全重复的逻辑，如果还有一个别的方法是不是也要在写一遍？
    

### 示例：使用装饰器计算耗时

接下来使用类方法装饰器改写以上示例，**类方法装饰器第一个参数为被装饰的函数，可以返回一个新函数来代替被装饰的方法**， 类型签名如下所示：

```
type ClassMethodDecorator = (value: Function, context: {  kind: "method";  name: string | symbol;  access: { get(): unknown };  static: boolean;  private: boolean;  addInitializer(initializer: () => void): void;}) => Function | void;
```

**以下声明一个 **`@executionTime`** 装饰器函数，该函数包装原始函数，并在调用前后记录函数执行耗时**。

现在的代码逻辑看起来是不是清晰了很多？通过装饰器函数扩展了原有的功能，但并没有修改原始函数内容，如果哪天想去掉计算函数执行耗时这段逻辑，也容易的多了。

```
const sleep = ms => new Promise(resolve => setTimeout(() => resolve(1), ms));function executionTime(value, context) {  const { kind, name } = context;  if (kind === 'method') {    return async function (...args) { // 返回一个新方法，代替被装饰的方法      const start = Date.now();      const result = await value.apply(this, args);      console.log(`CALL method(${name}) execution time: ${Date.now() - start}`);      return result;    };  }}class Person {  @executionTime  async run(isEat) {    if (isEat) {      await sleep(1000 * 1); // 1 minute      return `I can run fast.`;    }    await sleep(1000 * 5); // 5 minute    return `I can't run any faster.`;  }}const p = new Person();console.log(await p.run(true))
```

注意，**类的构造函数不支持装饰器**，尽管构造函数看起来像方法，但实际上不是方法。

### 示例：实现 @bind 解决 this 问题

下面代码直接执行 `p.run()` 是没问题的，但是将 `p.run` 提取为一个方法再执行，此时函数内的 `this` 执行就发生变化了，会被指向为 `undefined`，单独运行 run() 方法后就会出现 `TypeError: Cannot read properties of undefined (reading '#name')` 错误。

```
class Person {  #name  constructor(name) {    this.#name = name;  }  async run() {    console.log(`My name is ${this.#name}`);  }}const p = new Person('Tom');const run = p.run;run()
```

装饰器上下文对象上提供了一个 `[添加初始化逻辑 addInitializer()](https://github.com/tc39/proposal-decorators#adding-initialization-logic-with-addinitializer)` 方法，可以调用此方法将初始化函数与类或类元素相关联，**该方法在类实例化时会触发，允许用户在初始化时添加一些额外的逻辑**。

例如，在这里我们可以声明一个 `@bind` 装饰器在 `addInitializer()` 方法触发时将类方法绑定到类实例，解决 this 绑定问题。

```
function bind(value, context) {  const { kind, name, addInitializer } = context;  if (kind === 'method') {    addInitializer(function () {      this[name] = value.bind(this);    });  }}class Person {  ...   @bind  async run() {    console.log(`My name is ${this.#name}`);  }}
```

### 示例：实现 @deprecated 提醒废弃 API

对于某些在今后版本会被移除的 API，可以通过定义一个 @deprecated 的装饰器，用于 API 将要废弃的消息提醒。

```
const DEFAULT_MSG = 'This function will be removed in future versions.';function deprecated(value, context) {  const { kind, name } = context;  if (kind === 'method') {    return function (...args) {      console.warn(`DEPRECATION ${name}: ${DEFAULT_MSG}`);      const result = value.apply(this, args);      return result;    };  }}class Person {  @deprecated  hello() {    console.log(`Hello world!`);  }}const p = new Person()p.hello()
```

类访问器装饰器
-------

**类访问器装饰器**与类方法装饰器相似，区别地方在于上下文 context 对象的 kind 属性为 `getter`、`setter`。

类型签名如下所示：

```
type ClassGetterDecorator = (value: Function, context: {  kind: "getter" | "setter";  name: string | symbol;  access: { get(): unknown } | { set(value: unknown): void };  static: boolean;  private: boolean;  addInitializer(initializer: () => void): void;}) => Function | void;
```

### 示例：实现 @logged 装饰器

下例，实现一个 `@logged` 装饰器 追踪函数被调用的前后记录，细看是不是同上面我们自定义的类方法装饰器 `@executionTime` 很相似。

```
function logged(value, context) {  const { kind, name } = context;  if (kind === 'method' || kind === 'getter' || kind === 'setter') {    return function (...args) { // 返回一个新方法，代替被装饰的方法      console.log(`starting ${name} with arguments ${args.join(", ")}`);      const result = value.apply(this, args);      console.log(`ending ${name}`);      return result;    };  }}class Person {  #name  constructor(name) {    this.#name = name;  }  @logged  get name() {    return this.#name;  }  @logged  set name(name) {    this.#name = name;  }}const p = new Person('Tom')p.name = 'Jack'p.name
```

类自动访问装饰器
--------

让我们先抛开装饰器的概念，了解下 `accessor` 是什么？

### 类新成员：自动访问器

类自动访问器（Auto-Accessors）是 ECMAScript 将要推出的一个新功能，目前 TC39 提案为 stage 1。通过 `accessor` 关键词在类属性前定义。

```
class Person {  accessor name = 'Tom';}
```

类自动访问器相当于在类原型上定义了 `getter`、`setter`，大致等价于以下行为：

```
class Person {  #name = 'Tom';  get name() {    return this.#name;  }  set name(name) {    this.#name = name;  }}
```

### 自动访问器装饰器

自动访问器装饰器接收的第一个参数 value 包含了在类原型上定义的访问器对象 `get`、`set`，第二参数 context 对象上的 kind 属性为 `accessor`。

**自动访问器装饰器允许拦截对属性的访问，在进行一些包装之后，返回一个新的 **`**get**`**、**`**set**`** 方法，还支持返回一个 **`**init**`** 函数，用于更改初始值**

类型签名如下所示：

```
type ClassAutoAccessorDecorator = (  value: {    get: () => unknown;    set(value: unknown) => void;  },  context: {    kind: "accessor";    name: string | symbol;    access: { get(): unknown, set(value: unknown): void };    static: boolean;    private: boolean;    addInitializer(initializer: () => void): void;  }) => {  get?: () => unknown;  set?: (value: unknown) => void;  init?: (initialValue: unknown) => unknown;} | void;
```

### 示例：实现 @readOnly

实现一个 `@readOnly` 装饰器，确保被装饰的属性在第一次初始化后可以变为只读的，如果未被初始化不允许访问该属性，给一个错误提示。

```
const UNINITIALIZED = Symbol('UNINITIALIZED');function readOnly(value, context) {  const { get, set } = value;  const { name, kind } = context;  if (kind === 'accessor') {    return {      init(initialValue) {        return initialValue || UNINITIALIZED;      },      get() {        const value = get.call(this);        if (value === UNINITIALIZED) {          throw new TypeError(            `Accessor ${name} hasn’t been initialized yet`          );        }        return value;      },      set(newValue) {        const oldValue = get.call(this);        if (oldValue !== UNINITIALIZED) {          throw new TypeError(            `Accessor ${name} can only be set once`          );        }        set.call(this, newValue);      },    };  }}class Person {  @readOnly  accessor name = 'Tom';}const p = new Person()console.log(p.name);// p.name = 'Jack' // TypeError: Accessor name can only be set once
```

类字段装饰器
------

类字段装饰器接收到的第一个参数 value 为 undefined，我们不能更改字段的名称。通过返回函数，我们可以接收字段的初始值并返回一个新的初始值。

类型签名如下：

```
type ClassFieldDecorator = (value: undefined, context: {  kind: "field";  name: string | symbol;  access: { get(): unknown, set(value: unknown): void };  static: boolean;  private: boolean;}) => (initialValue: unknown) => unknown | void;
```

### 示例：将字段初始值翻倍

声明一个 @multiples() 装饰器，接收一个倍数，将字段初始值翻倍处理并返回。

```
function multiples(mutiple) {  return (value, { kind, name }) => {    if (kind === 'field') {      return initialValue => initialValue * mutiple;    }  }}class Person {  @multiples(3)  count = 2;}const p = new Person();console.log(p.count); // 6
```

### 示例：依赖注入示例

Logger 是我们的基础类，Person 类似于我们的业务类。以下代码耦合的一点是 Person 与 Logger 产生了直接依赖，对于 Person 类只需要使用 Logger 实例，不需要把 Logger 实例化也放到 Person 类中。接下来我们要解决的是如何将两个依赖模块之间的初始化信息解耦。

```
class Logger {  info(...args) {    console.log(...args);  }}class Person {  logger = new Logger();  run() {    this.logger.info('Hi!', 'I am running.')  }}const p = new Person();p.run();
```

依赖注入是将 “依赖” 注入给调用方，而不是让调用方直接获得依赖，在程序运行过程中由专门的组件负责 “依赖” 的实例化。

接下来，使用装饰器和依赖注册表实现依赖注入。

```
const assert = require('assert');const { registry, inject } = createRegistry();@registry.register('logger')class Logger {  info(...args) {    console.log(new Date().toLocaleString(), ...args);  }}class Person {  @inject logger;  run() {    this.logger.info('Hi!', 'I am running.')  }}const p = new Person();p.run();assert.equal(p.logger, registry.getInstance('logger'));
```

下面是核心方法 createRegistry() 的实现，参考了 JavaScript metaprogramming with the 2022-03 decorators API 的一个示例，下面主要用到了类装饰器、类字段装饰器。

```
function createRegistry() {  const classMap = new Map();  const instancesMap = new Map();  const registry = {    register(registerName) {      return (value, { kind }) => {        if (kind === 'class') {          classMap.set(registerName, value)        }      }    },    getInstance(name) {      if (instancesMap.has(name)) {        return instancesMap.get(name);      }      const TargetClass = classMap.get(name);      if (!TargetClass) {        throw new Error(`Unregistered dependencies with register name: ${name}`);      }      const instance = new TargetClass();      instancesMap.set(name, instance);      return instance;    },  }  return {    registry,    inject: (_value, {kind, name}) => {      if (kind === 'field') {        return () => registry.getInstance(name);      }    }  };}
```

总结
--

装饰器在未了解之前，给人一种神秘的感觉，了解之后会发现它的语法并没有那么复杂。它的一个优点是在不改变原有代码的基础之上允许我们来扩展一些新功能。

**装饰器只适用于类，不支持函数**。函数相对类来说，更容易做一些修饰，例如我们可以使用高阶函数做一些包装。

装饰器可以应用于，类、类字段、类方法、类访问器、类自动访问器（这是类的一个新成员）。掌握了装饰器的使用之后，再去看像 Nest.js、Angular 等这些框架时对于 @expression 这种语法，不会再陌生了。

在了解了装饰器后，下一步让我们在详细了解下什么是 IoC（控制反转）、DI（依赖注入）。

- 这是底线 -

**点击下方卡片关注**「编程界」解锁更多优质内容**。**