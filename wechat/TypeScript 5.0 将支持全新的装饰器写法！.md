> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/QnWez2sEWuL8j8GVDmBNTA)

大家好，我是 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf&scene=21#wechat_redirect)。  

就在前段时间，`TypeScript` 发布了 `5.0 beta` 版本，带来了诸多新功能，其中比较重要的一项改动就是装饰器写法的重构。

今天我们就主要来看看新旧装饰器使用上的区别，其他新特性我会在后续文章中帮大家解读。

装饰器模式是一种经典的设计模式，它可以在不修改被装饰者（如某个函数、某个类等）源码的前提下，为被装饰者增加 / 移除某些功能（收集用户定义的类 / 函数的信息，例如用于生成路由表，实现依赖注入等等、也可以对用户定义的类 / 函数进行增强，增加额外功能）。一些现代编程语言在语法层面都提供了对装饰器模式的支持，并且各语言中的现代框架都大量应用了装饰器。

```
// 一个类装饰器的示例：给类增加静态属性、原型方法const addField = target => {  target.age = 17;  target.prototype.speak = function () {    console.log('xxx');  };};@addFieldclass People {  }
```

在之前，我们想要在 `TypeScript` 中使用装饰器，需要在 `tsconfig` 中添加 `--experimentalDecorators` 标志，这其实就是 `TypeScript` 对最原始的处于 `stage1` 阶段的装饰器提案的支持，在 `TypeScript 5.0` 中，将对全新的处于 `stage3` 阶段的装饰器提案提供支持。

装饰器提案从提出到进入 `stage3` 阶段，中间经历了大约 `9` 年的时间，在这期间又经历了多项重大改动。为啥这样一个提案要经历这么长的时间？中间都经历了些什么？下面我们先来回顾一下它的历史。

装饰器的历史
------

*   `2014-04-10`：`Yehuda Katz` 和 `Ron Buckton` 合作向 `TC39` 提出装饰器提案。该提案进入 `stage0` 阶段。
    

*   https://2ality.com/2022/10/javascript-decorators.html#the-history-of-decorators
    

*   `2014-10-22`：`Angular` 团队宣布 `Angular 2.0` 正在用 `AtScript` 编写并编译为 `JavaScript` 和 `Dart`，同时支持了运行时类型检查以及三种类型的的装饰器。
    
*   `2015-01-28`：`Yehuda Katz` 表示正在和 `TypeScript` 团队交换想法。
    

*   https://github.com/tc39/notes/blob/main/meetings/2015-01/jan-28.md
    

*   `2015-03-05`：`Angular` 团队和 `TypeScript` 团队宣布 `Angular` 将从 `AtScript` 切换到 `TypeScript`，并且 `TypeScript` 将采用 `AtScript` 的一些功能（特别是装饰器的能力）。
    
*   `2015-03-24`：`decorator` 提案进入 `stage1` 阶段。
    

*   https://github.com/wycats/javascript-decorators
    

*   `2015-03-31`：`Babel 5.0.0` 支持 `stage1` 阶段的装饰器。
    
*   `2015-07-20`：`TypeScript 1.5` 发布并支持 `stage1` 阶段的 `decorators` 写法，也就是我们目前最常用的 `--experimentalDecorators`。同时还有其他几个 `JavaScript` 项目（例如 `Angular` 和 `MobX`）使用了这个 `TypeScript` 特性，所以大家看起来 `JavaScript` 已经有了装饰器的能力。
    

*   https://devblogs.microsoft.com/typescript/announcing-typescript-1-5/
    

*   `2016-07-28`：`decorators` 提案进入了 `stage2` 阶段。（然而这个阶段的提案后续并没有被广泛使用）
    

*   https://github.com/tc39/notes/blob/main/meetings/2016-07/jul-28.md
    

*   `2018-08-27` `Babel 7.0.0` 官方支持了 `stage2` 装饰器 `@babel/plugin-proposal-decorators`。
    
*   `2022-03-28`：`Chris Garrett` 加入提案后帮助它进入了 `stage3` 阶段，并将装饰器 `metadata` 的能力单独抽离到另一个 `stage2` 阶段的提案。
    

*   https://github.com/tc39/notes/blob/main/meetings/2022-03/mar-28.md
    

*   `2023-01-26`：TypeScript 5.0 beta 版本发布，支持 `stage3` 阶段的装饰器写法。
    

可以发现，到达 `stage3` 阶段花了很长的时间，主要是因为各种利益权衡的问题，很难让各方达成一致，包括其他功能（例如类成员和私有状态）的交互以及性能等方面。

有啥不一样？
------

目前各大框架主要还是支持了 stage1 阶段的装饰器，例如 因为 `TypeScript` 中的 `--experimentalDecorators`，`stage2` 阶段的装饰器并没有被广泛使用，所以我们今天主要看 `stage1` 到 `stage3` 提案的变化。

从官方发布的更新日志来看，在 `TypeScript 5.0` 中支持的新的装饰器写法并不与老的装饰器写法兼容。主要体现在下面两个方面：

*   支持装饰的实体不同：
    

*   `stage1` 只支持装饰类、类属性、类方法
    
*   `stage3` 额外支持装饰类的 `getter`、`setter`、`accessor`
    

*   装饰器可以取到的参数不同：
    

*   `stage1` 主要是可以取到 `descriptor` 参数，它可以传递给 `Object.defineProperty`
    
*   `stage3` 可以取到一个自定义的 `context`，其中包括值本身的一些附加信息，以及具有元编程能力的小型 `API` (`access`、`addInitializer`)。
    

*   返回值不同
    

*   `stage1` 返回的是传递给 `Object.defineProperty` 的 `descriptor`
    
*   `stage3` 返回的是被装饰的实体本身
    

下面我们具体分类来看一下：

类装饰器
----

### stage1 版本

`stage1` 版本的类装饰器比较简单，只能获取到一个 `taget` 即类自身的参数。我们可以直接获取类本身的信息，或者对它进行修改：

```
const addField = target => {  target.age = 17;  target.prototype.speak = function () {    console.log('xxx');  };};@addFieldclass People {  }console.log(People.age);const a = new People();a.speak();
```

### stage3 版本

新的类装饰器具有下面的类型签名：

```
type ClassDecorator = (  value: Function,  context: {    kind: 'class';    name: string | undefined;    addInitializer(initializer: () => void): void;  }) => Function | void;
```

我们可以额外从 `context` 中取到一些信息：

*   `kind`：被修饰的结构类型，包括'class'、'method'、'getter'、'setter'、'accessor'、'field'
    
*   `name`：被修饰的实体名称
    
*   `addInitializer`：一个初始化完成后的回调函数，运行的时机会取决于装饰器的种类：
    

*   类装饰器：在类被完全定义并且所有静态字段都被初始化之后运行。
    
*   非静态类元素装饰器：在实例化期间运行（实例字段被初始化之前）。
    
*   静态类元素装饰器：在类定义期间运行（在定义静态字段之前但在定义其他所有其他类元素之后）。
    

### 类装饰器示例

以下是一个类装饰器的使用示例（通过 `install` 装饰器收集所有类的实例）：

```
class InstanceCollector {  instances = new Set();  install = (value, { kind }) => {    if (kind === 'class') {      const _this = this;      return function (...args) {        const inst = new value(...args); // (B)        _this.instances.add(inst);        return inst;      };    }  };}const collector = new InstanceCollector();@collector.installclass MyClass {}const inst1 = new MyClass();const inst2 = new MyClass();const inst3 = new MyClass();assert.deepEqual(  collector.instances, new Set([inst1, inst2, inst3]));
```

类方法饰器
-----

### stage1 版本

在 `stage1` 版本的类方法装饰器中，我们可以获取到三个参数：

*     
    

1.  `target`：被修饰的类
    

*     
    

2.  `name`：类成员的名字
    

*     
    

3.  `descriptor`：属性描述符，对象会将这个参数传给 `Object.definePropert`
    

想要装饰一个函数，我们必须修改 `descriptor.value` ，然后再把 `descriptor` 返回回去，下面是一个在函数前后追加日志的装饰器：

```
function trace(_target: any, _name: string, descriptor: PropertyDescriptor) {  const value = descriptor.value;  descriptor.value = async function () {    console.log('Hi，ConardLi！');    console.log('start');    value.call(this);    console.log('end');  };  return descriptor;}class People {  @trace  test() {    console.log(this);  }}const p = new People();p.test();
```

### stage3 版本

新的类方法装饰器具有下面的类型签名：

```
type ClassMethodDecorator = (  value: Function,  context: {    kind: 'method';    name: string | symbol;    static: boolean;    private: boolean;    access: { get: () => unknown };    addInitializer(initializer: () => void): void;  }) => Function | void;
```

可以发现相比类装饰器，`context` 中主要多了三个参数：

*   `static`：是否威静态方法
    
*   `private`：是否为私有方法
    
*   `access`：可以获取到方法的 `getter` 方法（通过它我们就可以公开访问私有方法的字段）
    

### 类方法装饰器示例 1

下面是一个新的 `trace` 装饰器的写法，我们可以直接返回新的函数，写法更简洁了。

```
function trace(value, {kind, name}) {  if (kind === 'method') {    return function (...args) {      console.log('Hi，ConardLi！');      console.log(`CALL ${name}: ${JSON.stringify(args)}`);      const result = value.apply(this, args);      console.log('=> ' + JSON.stringify(result));      return result;    };  }}class People {  @trace  test() {    console.log(this);  }}const p = new People();p.test();
```

### 类方法装饰器示例 2

类装饰器以及类方法装饰器的参数中都可以取到一个 `addInitializer` 方法，当装饰非静态类方法时，它会在实例化期间运行（实例字段被初始化之前），我们在来看一下它有什么使用场景：

```
class People {  name;  constructor(name) {    this.name = name;  }  toString() {    return `My name is (${this.name})`;  }}const people = new People('ConardLi');const toString1 = people.toString; toString1();  // ❌ TypeError: Cannot read properties of undefined
```

上面是一个我们经常会遇到的方法执行上下文的问题，当我们将实例中的方法单独提取出来进行调用时，就会丢失 `this`，下面我们通过一个 `bind` 装饰器来解决这个问题：

```
function bind(value, {kind, name, addInitializer}) {  if (kind === 'method') {    addInitializer(function () {      this[name] = value.bind(this);    });  }}class People {  name;  constructor(name) {    this.name = name;  }  @bind  toString() {    return `My name is (${this.name})`;  }}const people = new People('ConardLi');const toString1 = people.toString; toString1();  // ✅ ConardLi
```

`addInitializer` 方法会在每次有新的实例被创建，字段被初始化之前被调用，我们可以在这个实际为它绑定 `this` ，然后就可以将方法单独进行调用了～

类属性装饰器
------

### stage1 版本

`stage1` 版本的类属性装饰器和方法装饰器的参数差不多，主要还是利用 `descriptor`，下面是一个将属性变为只读的一个装饰器示例：

```
function readOnly(target, name, descriptor) {  descriptor.writable = false;  return descriptor;}class Person {    @readOnly name = 'ConardLi'}const person = new Person();person.name = 'tom'; // ❌
```

### stage3 版本

新的类属性装饰器具有下面的类型签名：

```
type ClassFieldDecorator = (  value: undefined,  context: {    kind: 'field';    name: string | symbol;    static: boolean;    private: boolean;    access: { get: () => unknown, set: (value: unknown) => void };    addInitializer(initializer: () => void): void;  }) => (initialValue: unknown) => unknown | void;
```

相比类方法装饰器，主要有下面两个地方不同：

*   `access` 中可以同时拿到 `setter` 和 `getter` 方法，但是类方法装饰器只能拿到 `getter` 方法。
    
*   返回值类型不同，在类属性装饰器中，可以通过返回一个方法来改变属性的初始值 `initialValue`
    

### 类属性装饰器示例 1

新的类属性装饰器中明确规定了不能对字段本身进行更改或替换，只能通过返回的方法来变更字段的初始值：

```
function addPrefix() {  return initialValue => `Hi，I am ${initialValue}`;}class People {  @addPrefix  name = 'ConardLi';}const people = new People();people.name // Hi，I am ConardLi
```

> 想要对字段进行变更或替换怎么办呢？我们必须借助 `auto-accessor` 的能力，后面我们会提到。

### 类属性装饰器示例 2

下面我们再实现一个新的 `readOnly` 装饰器，这时你会发现，参数里没有 `descriptor` 对象了，也就是没有办法直接设置 `writable` 属性了，实现起来就要麻烦的多了：

```
const readOnlyFieldKeys = Symbol('readOnlyFieldKeys');function readOnly(value, {kind, name}) {  // 通过类属性装饰器收集只读的字段  if (kind === 'field') {    return function () {      if (!this[readOnlyFieldKeys]) {        this[readOnlyFieldKeys] = [];      }      this[readOnlyFieldKeys].push(name);    };  }  // 在类实例化时对已收集的字段通过 `Object.defineProperty` 设置 `writable` 属性  if (kind === 'class') {    return function (...args) {      const inst = new value(...args);      for (const key of inst[readOnlyFieldKeys]) {        Object.defineProperty(inst, key, {writable: false});      }      return inst;    }  }}@readOnlyclass People {  @readOnly  name;  constructor(name) {    this.name = name;  }}const people = new People('ConardLi');people.name = 'Bob', // ❌ TypeError: Cannot assign to read only property 'name
```

相比旧版的写法，我们需要更多的步骤，首先要通过类属性装饰器收集只读的字段，然后再通过类装饰器在类实例化时对已收集的字段通过 `Object.defineProperty` 设置 `writable` 属性，还是比较麻烦的，如果只想通过装饰字段，不装饰类来实现 `readOnly` 我们必须要借助 `accessor` 装饰器，下面我们就会讲到。

auto accessor（自动访问器）
--------------------

装饰器提案引入了一个新的语言特性：`auto accessor` （自动访问器），我们可以通过将 `accessor` 关键字放在类字段之前来创建自动访问器，当没有装饰器的时候，它和其他普通的使用起来是一样的。

```
class People {  accessor name = 'ConardLi';}
```

其实就等同于下面的代码：

```
class People {  name = 'ConardLi';  get name() {    return this.name;  }  set name(value) {    this.name = value;  }}
```

看起来没有什么区别，但是当我们使用装饰器来修饰一个 `accessor` 字段时，它的用处就大了，它的类型签名是这样的：

```
type ClassAutoAccessorDecorator = (  value: {    get: () => unknown;    set: (value: unknown) => void;  },  context: {    kind: 'accessor';    name: string | symbol;    static: boolean;    private: boolean;    access: { get: () => unknown, set: (value: unknown) => void };    addInitializer(initializer: () => void): void;  }) => {  get?: () => unknown;  set?: (value: unknown) => void;  init?: (initialValue: unknown) => unknown;} | void;
```

首先 `context` 和普通字段是一样的，在 `value` 中我们可以拿到字段的 `getter` 和 `setter` 方法，并且在返回值中可以通过 `init` 方法改变字段的初始值，并且可以对字段的 `getter` 和 `setter` 字段进行重新定义。

```
const UNINITIALIZED = Symbol('UNINITIALIZED');function readOnly({get,set}, {name, kind}) {  if (kind === 'accessor') {    return {      init() {        return UNINITIALIZED;      },      get() {        const value = get.call(this);        if (value === UNINITIALIZED) {          throw new TypeError(            `Accessor ${name} hasn’t been initialized yet`          );        }        return value;      },      set(newValue) {        const oldValue = get.call(this);        if (oldValue !== UNINITIALIZED) {          throw new TypeError(            `Accessor ${name} can only be set once`          );        }        set.call(this, newValue);      },    };  }}class People {  @readOnly  accessor name;  constructor(name) {    this.name = name;  }}const people = new People('ConardLi');people.name = 'Bob' // ❌ TypeError: Accessor name can only be set once
```

这样，我们只修饰一个字段就可以实现 `readOnly` 装饰器了。

getter、setter 装饰器
-----------------

`accessor` 还是比较强大的，但有的时候我们只想在 `getter` 或者 `setter` 的时机去做一些事情，新的装饰器还具有直接修饰 `getter` 和 `setter` 的能力，它的类型签名如下：

```
type ClassGetterDecorator = (  value: Function,  context: {    kind: 'getter';    name: string | symbol;    static: boolean;    private: boolean;    access: { get: () => unknown };    addInitializer(initializer: () => void): void;  }) => Function | void;type ClassSetterDecorator = (  value: Function,  context: {    kind: 'setter';    name: string | symbol;    static: boolean;    private: boolean;    access: { set: (value: unknown) => void };    addInitializer(initializer: () => void): void;  }) => Function | void;
```

我们通过 `getter` 装饰器来实现一个延迟计算的能力：

```
function lazy(value, {kind, name, addInitializer}) {  if (kind === 'getter') {    return function () {      const result = value.call(this);      Object.defineProperty(         this, name,        {          value: result,          writable: false,        }      );      return result;    };  }}class People {  @lazy  get value() {    console.log('一些计算。。。');    return '计算后的结果';  }}console.log('1 new People()');const inst = new People();console.log('2 inst.value');assert.equal(inst.value, '计算后的结果');console.log('3 inst.value');assert.equal(inst.value, '计算后的结果');console.log('4 end');// 1 new People()// 2 inst.value// 一些计算。。。// 3 inst.value// 4 end
```

我们通过 `getter` 来定义这个字段，这样计算只会在读取这个字段的时候执行，然后我们通过 `lazy` 装饰器包装原始的 `getter`：当第一次读取该字段时，它会调用 `getter` 方法并进行计算，然后装饰器将计算后的结果缓存下来，后续再读取这个字段就会直接读取已经计算好的值。

最后
--

大家觉得新版的装饰器好用吗？对旧的装饰器写法迁移成本大不大？欢迎在留言区进行讨论。

参考链接

*   https://devblogs.microsoft.com/typescript/announcing-typescript-5-0-beta/
    
*   https://babeljs.io/docs/en/babel-plugin-proposal-decorators
    
*   https://2ality.com/2022/10/javascript-decorators.html
    
*   https://github.com/wycats/javascript-decorators
    

如果这篇文章帮助到了你，欢迎点赞和关注。

> 如果你想加入高质量前端交流群，或者你有任何其他事情想和我交流也可以添加我的个人微信 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf&scene=21#wechat_redirect) 。

`点赞`和`在看`是最大的支持⬇️❤️⬇️