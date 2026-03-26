> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/thyzF3xk0u-utA7mpH5rZQ)

> 本文作者为 360 奇舞团前端开发工程师

`JavaScript`设计模式是编程世界的智慧结晶，提供了解决常见问题的优秀方案。无论你是初学者还是经验丰富的开发者，掌握这些模式都能让你的代码更清晰、更灵活。本文将为你介绍一些常见的设计模式，帮助你提高代码质量，构建更可维护的应用。让我们一起深入了解这些设计模式的精妙之处吧！

什么是设计模式
=======

设计模式是在软件设计中反复出现的问题的解决方案。它们是经过验证的、可重用的代码设计经验，能够解决特定类型的问题。这些模式帮助开发者更有效地组织和设计代码，提高可维护性和可扩展性。

JavaScript 中有哪些设计模式
===================

设计模式可以分为以下几种：

*   创建型：侧重于对象创建机制，提供以灵活和可控的方式实例化对象的方法。常用的有单例模式、工厂模式、构造函数模式、原型模式...
    
*   结构型：结构模式侧重于组织和组合对象以形成更大的结构。它们促进了对象的组合，定义了它们之间的关系，并提供了灵活的方法来操纵它们的结构。常用的有适配器模式、装饰者模式、组合模式...
    
*   行为型：行为模式侧重于对象之间的交互和责任的分配。它们为对象之间的通信、协调和协作提供解决方案。常用的有观察者模式、迭代器模式、策略模式...
    

一、创建型
-----

创建模式侧重于对象创建机制，提供以灵活和可控的方式实例化对象的方法。JavaScript 中一些常用的创建型模式如下：

*   单例模式
    
*   工厂模式
    
*   构造函数模式
    
*   原型模式
    
*   模块模式
    
*   建造者模式
    

### 单例模式（Singleton Pattern）

单例模式是一种常见的设计模式，其目的是**确保一个类只有一个实例，并提供一个全局访问点**。单例模式的目的是限制某个类的实例化次数，**确保在整个应用中只存在一个实例**（如 vuex 和 redux 中的 store）。

*   实现示例 1：使用闭包创建
    

```
var Singleton = (function () {  var instance; // 存储单例实例  function init() {    // 私有变量和方法    var privateVariable = 'I am private';    function privateMethod() {      console.log('This is a private method');    }    return {      // 公共变量和方法      publicVariable: 'I am public',      publicMethod: function () {        console.log('This is a public method');      },      getPrivateVariable: function () {        return privateVariable;      },    };  }  return {    // 获取单例实例的方法    getInstance: function () {      if (!instance) {        instance = init();      }      return instance;    },  };})();// 获取单例实例var mySingleton = Singleton.getInstance();
```

*   实现示例 2：使用 class 创建
    

```
class Singleton {  static instance; // 静态属性，存储单例实例  constructor() {}  // 静态方法，获取单例实例的方法  static getInstance() {    if (!Singleton.instance) {      Singleton.instance = new Singleton();    }    return Singleton.instance;  }}// 获取单例实例var mySingleton1 = Singleton.getInstance();var mySingleton2 = Singleton.getInstance();console.info(mySingleton1 === mySingleton2); // true
```

### 工厂模式（Factory Pattern）

工厂模式是一种创建对象的设计模式，它提供了一种**封装对象创建过程**的方式，使得代码无需关心具体的实例化过程。工厂模式有助于封装对象的创建过程，提高代码的灵活性和可维护性。在实际应用中，工厂模式经常用于处理对象的创建和组装逻辑。

*   实现示例：
    

```
class Car {  constructor(type, model) {    this.type = type;    this.model = model;  }}class CarFactory {  createCar(type, model) {    return new Car(type, model);  }}const factory = new CarFactory();const myCar = factory.createCar('SUV', 'Model 1');
```

### 构造函数模式（Constructor Pattern）

在 JavaScript 中，构造函数模式是一种**创建对象的方式**，它使用构造函数来实例化对象，并通过 **new** 关键字来调用构造函数。构造函数模式允许创建具有相似属性和方法的多个对象。

*   实现示例：
    

```
// 构造函数function Animal(name, species) {  this.name = name;  this.species = species;  this.eat = function () {    console.info('eating');  };}const cat = new Animal('Tom', 'Cat');const dog = new Animal('Pluto', 'Dog');
```

### 原型模式（Prototype Pattern）

原型模式是一种创建对象的设计模式，它通过**使用原型对象作为对象的模板，允许通过原型链共享属性和方法。**在 JavaScript 中，每个对象都有一个指向其原型的链接，通过这个链接，对象可以继承原型的属性和方法。原型模式的优势在于可以实现属性和方法的共享，节省内存，并且可以在运行时动态地添加或修改原型上的属性和方法。这使得原型模式成为 JavaScript 中实现继承的基础。

*   实现示例：
    

```
function Animal(name, species) {  this.name = name;  this.species = species;}Animal.prototype.eat = function () {  console.info('eating');};const cat = new Animal('Tom', 'Cat');const dog = new Animal('Pluto', 'Dog');
```

### 模块模式（Module Pattern）

模块模式是一种用于封装和组织 JavaScript 代码的设计模式，它通过使用闭包来创建私有作用域，从而实现信息隐藏和模块化。模块模式有助于将代码组织成可维护和可重用的单元。模块模式的优势在于提供了一种将代码组织成模块的方式，避免了全局命名空间的污染，并且允许实现信息隐藏。这种模式在现代 JavaScript 开发中常用于构建可维护和模块化的代码。

*   实现示例：
    

```
var MyModule = (function () {  // 私有变量  var privateVariable = 'I am private';  // 私有方法  function privateMethod() {    console.log('This is a private method');  }  // 公共变量和方法  return {    publicVariable: 'I am public',    publicMethod: function () {      console.log('This is a public method');    },    getPrivateVariable: function () {      return privateVariable;    },  };})();
```

### 建造者模式（Builder Pattern）

Builder 模式是一种创建型设计模式，它用于构建复杂对象，将**构建过程与表示分离**，以便相同的构建过程可以创建不同的表示。在 JavaScript 中，Builder 模式通常通过**对象字面量和链式调用**来实现。通过使用 Builder 模式，我们可以更灵活地构建对象，支持可选的构建步骤，并避免构造函数参数过于庞大和难以维护的问题。Builder 模式通常在需要创建复杂对象时非常有用。

*   实现示例：
    

```
class ComputerBuilder {  constructor() {    this.computer = {};  }  addCPU(cpu) {    this.computer.cpu = cpu;    return this; // 返回构建器实例，以支持链式调用  }  addRAM(ram) {    this.computer.ram = ram;    return this;  }  addStorage(storage) {    this.computer.storage = storage;    return this;  }  build() {    return this.computer;  }}// 使用构建器创建电脑对象const myComputer = new ComputerBuilder()  .addCPU('Intel i7')  .addRAM('16GB')  .addStorage('512GB SSD')  .build();
```

二、结构型
-----

结构模式侧重于组织和组合对象以形成更大的结构。它们促进了对象的组合，定义了它们之间的关系，并提供了灵活的方法来操纵它们的结构。JavaScript 中一些常用的结构型模式如下：

*   装饰器模式
    
*   外观模式
    
*   适配器模式
    
*   桥接模式
    
*   组合模式
    

### 装饰者模式（Decorator Pattern）

装饰器模式是一种结构型设计模式，它允许通过将对象包装在装饰器类的实例中来动态地扩展对象的行为。在 JavaScript 中，装饰器模式通常通过使用函数或类来实现。装饰器模式的优势在于它支持在运行时动态地添加或修改对象的行为，而且可以组合多个装饰器来实现不同的组合效果。这使得代码更具灵活性和可维护性。

*   实现示例：
    

```
class Car {  drive() { console.log('Driving the car'); }}// 装饰器类 - 加速装置class TurboDecorator {  constructor(car) {    this.car = car;  }  drive() {    this.car.drive();    console.log('Turbo boost activated!');  }}// 装饰器类 - 音响系统class StereoDecorator {  constructor(car) {    this.car = car;  }  drive() {    this.car.drive();    console.log('Enjoying music with the stereo system');  }}// 创建基础汽车对象const basicCar = new Car();// 使用装饰器扩展功能const turboCar = new TurboDecorator(basicCar);const luxuryCar = new StereoDecorator(turboCar);// 调用装饰后的汽车对象的方法luxuryCar.drive();
```

### 外观模式（Facade Pattern）

Facade 模式是一种结构型设计模式，它提供了一个简化接口，用于访问一个或多个复杂子系统。Facade 模式通过隐藏系统的复杂性，提供了一个更简单和一致的接口，使客户端更容易使用。Facade 模式的目标是简化接口，隐藏复杂性，并提供一个更方便的入口点。这有助于降低系统之间的耦合度，并提高代码的可维护性。

*   实现示例：
    

```
// 子系统 - 播放器class Player {  play() { console.log('Playing music'); }  stop() { console.log('Stopping music') ; }}// 子系统 - 音响class Stereo {  turnOn() { console.log('Turning on the stereo'); }  turnOff() { console.log('Turning off the stereo'); }}// Facade 类 - 音响系统外观class AudioSystemFacade {  constructor() {    this.player = new Player();    this.stereo = new Stereo();  }  playMusic() {    this.stereo.turnOn();    this.player.play();  }  stopMusic() {    this.player.stop();    this.stereo.turnOff();  }}// 使用 Facade 模式简化接口const audioFacade = new AudioSystemFacade();audioFacade.playMusic(); // Turning on the stereo, Playing musicaudioFacade.stopMusic(); // Stopping music, Turning off the stereo˝
```

### 适配器模式（Adapter Pattern）

适配器模式（Adapter Pattern）是一种结构型设计模式，它允许**接口不兼容的对象之间进行合作**。适配器模式通过**创建一个包装对象（适配器），使原本不兼容的接口变得兼容**。通过适配器模式，我们可以在不修改旧的计算器对象的情况下，使其适用于新系统。适配器模式有助于解决接口不兼容的问题，并促使不同系统之间更容易协同工作。

*   实现示例：
    

```
// 旧的计算器对象class OldCalculator {  getTotal() {    return 100;  }}// 新的系统期望的接口class NewCalculator {  calculate() {    return 200;  }}// 适配器类class CalculatorAdapter {  constructor(oldCalculator) {    this.oldCalculator = oldCalculator;  }  // 适配方法  calculate() {    return this.oldCalculator.getTotal();  }}// 使用适配器连接新旧系统const oldCalculator = new OldCalculator();const adapter = new CalculatorAdapter(oldCalculator);console.log('Total using adapter:', adapter.calculate()); // Total using adapter: 100
```

### 桥接模式（**Bridge Pattern**）

桥接模式（Bridge Pattern）是一种结构型设计模式，它**将一个抽象部分与其具体实现部分分离，使它们可以独立变化**。这种模式通过使用组合而不是继承，来将抽象和实现解耦。通过桥接模式，我们可以独立地变化形状和颜色，而不必修改彼此之间的继承关系。这有助于更好地适应变化和提高系统的灵活性。

*   实现示例：
    

```
// 颜色实现类class RedColor {  applyColor() {    console.log('Applying red color');  }}class BlueColor {  applyColor() {    console.log('Applying blue color');  }}// 形状抽象类class Shape {  constructor(color) {    this.color = color;  }  applyColor() {    // 委托给颜色实现类    this.color.applyColor();  }  draw() {    // 具体形状的绘制逻辑  }}// 具体形状类class Circle extends Shape {  draw() {    console.log('Drawing circle');  }}class Square extends Shape {  draw() {    console.log('Drawing square');  }}// 使用桥接模式连接形状和颜色const redCircle = new Circle(new RedColor());const blueSquare = new Square(new BlueColor());// 调用具体形状的方法，委托给颜色实现类redCircle.draw(); // Drawing circleredCircle.applyColor(); // Applying red colorblueSquare.draw(); // Drawing squareblueSquare.applyColor(); // Applying blue color
```

### 组合模式（**Composite Pattern**）

组合模式（Composite Pattern）是一种结构型设计模式，它允许将对象组合成**树形结构以表示 "部分 - 整体" 的层次结构**。组合模式使得客户端可以统一对待单个对象和组合对象，从而简化了客户端代码。通过组合模式，我们可以统一对待单个图形和复合图形，使得客户端代码更简单和灵活。这种模式特别适用于处理树状结构的情况。

*   实现示例：
    

```
// 抽象图形类class Graphic {  draw() {    // 抽象方法，由具体子类实现  }}// 具体图形类 - 圆形class Circle extends Graphic {  constructor(name) {    super();    this.name = name;  }  draw() {    console.log(`Drawing Circle: ${this.name}`);  }}// 具体图形类 - 矩形class Rectangle extends Graphic {  constructor(name) {    super();    this.name = name;  }  draw() {    console.log(`Drawing Rectangle: ${this.name}`);  }}// 复合图形类class CompositeGraphic extends Graphic {  constructor(name) {    super();    this.name = name;    this.graphics = [];  }  add(graphic) {    this.graphics.push(graphic);  }  draw() {    console.log(`Drawing Composite: ${this.name}`);    this.graphics.forEach((graphic) => {      graphic.draw();    });  }}// 使用组合模式创建图形结构const circle1 = new Circle('Circle 1');const circle2 = new Circle('Circle 2');const rectangle1 = new Rectangle('Rectangle 1');const composite = new CompositeGraphic('Composite 1');composite.add(circle1);composite.add(rectangle1);const rootComposite = new CompositeGraphic('Root Composite');rootComposite.add(composite);rootComposite.add(circle2);// 绘制整个图形结构rootComposite.draw();
```

三、行为型
-----

行为模式侧重于对象之间的交互和责任的分配。它们为对象之间的通信、协调和协作提供解决方案。JavaScript 中一些常用的行为型模式如下：

*   观察者模式
    
*   策略模式
    
*   命令模式
    
*   迭代器模式
    
*   调解器模式
    

### 观察者模式（Observer Pattern）

观察者模式（Observer Pattern）是一种行为型设计模式，它定义了一种一对多的依赖关系，当一个对象的状态发生改变时，所有依赖于它的对象都得到通知并自动更新。在 JavaScript 中，观察者模式通常使用回调函数（callbacks）或事件机制来实现。通过观察者模式，我们可以实现对象之间的松耦合，主题和观察者之间的关系更为灵活。当主题的状态发生改变时，所有注册的观察者都会得到通知，可以进行相应的更新操作。这在实现事件处理、数据绑定等场景中非常常见。

*   实现示例：
    

```
// 主题类，负责维护观察者列表，并提供添加、移除和通知观察者的方法class Subject {  constructor() {    this.observers = [];  }  // 添加观察者  addObserver(observer) {    this.observers.push(observer);  }  // 移除观察者  removeObserver(observer) {    this.observers = this.observers.filter((o) => o !== observer);  }  // 通知所有观察者  notify() {    this.observers.forEach((observer) => {      observer.update();    });  }}// 观察者类，具有一个 update 方法，用于在收到通知时执行相应的操作。class Observer {  constructor(name) {    this.name = name;  }  // 更新方法  update() {    console.log(`${this.name} has been notified and updated.`);  }}// 创建主题和观察者const subject = new Subject();const observer1 = new Observer('Observer 1');const observer2 = new Observer('Observer 2');// 添加观察者到主题subject.addObserver(observer1);subject.addObserver(observer2);// 通知所有观察者subject.notify();
```

### 策略模式（Strategy Pattern）

策略模式（Strategy Pattern）是一种行为型设计模式，它定义了一系列算法，将每个算法封装起来，并使它们可以互相替换。策略模式使得算法的变化独立于使用算法的客户端。通过策略模式，客户端可以在运行时选择不同的支付策略，而不必修改客户端代码。这种模式使得算法的变化独立于客户端，提高了代码的可维护性和灵活性。

*   实现示例：
    

```
// 支付策略接口class PaymentStrategy {  pay(amount) {    // 策略接口，具体策略类需要实现该方法  }}// 具体支付策略 - 支付宝class AlipayStrategy extends PaymentStrategy {  pay(amount) {    console.log(`Paid ${amount} using Alipay.`);  }}// 具体支付策略 - 微信支付class WeChatPayStrategy extends PaymentStrategy {  pay(amount) {    console.log(`Paid ${amount} using WeChat Pay.`);  }}// 具体支付策略 - 信用卡支付class CreditCardStrategy extends PaymentStrategy {  pay(amount) {    console.log(`Paid ${amount} using Credit Card.`);  }}// 上下文类，负责接收并执行具体的支付策略class PaymentContext {  constructor(strategy) {    this.strategy = strategy;  }  // 设置支付策略  setPaymentStrategy(strategy) {    this.strategy = strategy;  }  // 执行支付策略  executePayment(amount) {    this.strategy.pay(amount);  }}// 使用策略模式const paymentContext = new PaymentContext(new AlipayStrategy());paymentContext.executePayment(1000); // Paid 1000 using Alipay// 切换支付策略paymentContext.setPaymentStrategy(new WeChatPayStrategy());paymentContext.executePayment(800); // Paid 800 using WeChat Pay
```

### **命令模式（Command Pattern）**

命令模式（Command Pattern）是一种行为型设计模式，它将请求封装成一个对象，从而允许用不同的请求参数化客户端队列，请求可进行排队、请求可被取消、以及支持可撤销的操作。在 JavaScript 中，命令模式通常通过函数或对象来实现。通过命令模式，我们可以将请求封装成对象，使得可以动态地选择和执行不同的命令。这有助于将请求的发送者和接收者解耦，支持命令的撤销和重做，以及实现一些其他的命令相关的功能。

*   实现示例：
    

```
// 命令接口class Command {  execute() {    // 命令接口，具体命令类需要实现该方法  }}// 具体命令类 - 打开电视class TurnOnTVCommand extends Command {  constructor(tv) {    super();    this.tv = tv;  }  execute() {    this.tv.turnOn();  }}// 具体命令类 - 关闭电视class TurnOffTVCommand extends Command {  constructor(tv) {    super();    this.tv = tv;  }  execute() {    this.tv.turnOff();  }}// 接收者类 - 电视class TV {  turnOn() {    console.log('TV is turned on.');  }  turnOff() {    console.log('TV is turned off.');  }}// 调用者类 - 遥控器class RemoteControl {  constructor() {    this.command = null;  }  setCommand(command) {    this.command = command;  }  pressButton() {    this.command.execute();  }}// 使用命令模式const tv = new TV();const turnOnCommand = new TurnOnTVCommand(tv);const turnOffCommand = new TurnOffTVCommand(tv);const remoteControl = new RemoteControl();// 配置遥控器按钮remoteControl.setCommand(turnOnCommand);remoteControl.pressButton(); // TV is turned on.remoteControl.setCommand(turnOffCommand);remoteControl.pressButton(); // TV is turned off.
```

### 迭代器模式（**Iterator Pattern**）

迭代器模式（Iterator Pattern）是一种行为型设计模式，它提供一种方法顺序访问一个聚合对象中的各个元素，而不暴露该对象的内部表示。在 JavaScript 中，迭代器模式通常通过迭代器对象或内置的迭代器接口来实现。

*   实现示例：
    

```
// 自定义迭代器对象class ArrayIterator {  constructor(array) {    this.array = array;    this.index = 0;  }  hasNext() {    return this.index < this.array.length;  }  next() {    return this.hasNext() ? this.array[this.index++] : null;  }}// 使用迭代器模式遍历数组const array = [1, 2, 3, 4, 5];const iterator = new ArrayIterator(array);while (iterator.hasNext()) {  console.log(iterator.next());}
```

### **调解器模式（Mediator Pattern）**

中介者模式（Mediator Pattern）是一种行为型设计模式，它定义了一个对象，该对象封装了一组对象之间的交互方式。中介者使对象之间不直接相互通信，而是通过中介者对象进行通信，从而降低了对象之间的耦合度。中介者模式适用于需要将多个对象解耦并通过一个中心点进行通信的场景。这可以减少对象之间的直接关联，提高系统的可维护性。

*   实现示例：
    

```
// 聊天室类class ChatMediator {  constructor() {    this.users = [];  }  addUser(user) {    this.users.push(user);  }  sendMessage(message, sender) {    this.users.forEach((user) => {      if (user !== sender) {        user.receiveMessage(message);      }    });  }}// 用户类class User {  constructor(name, mediator) {    this.name = name;    this.mediator = mediator;  }  sendMessage(message) {    console.log(`${this.name} sending message: ${message}`);    this.mediator.sendMessage(message, this);  }  receiveMessage(message) {    console.log(`${this.name} received message: ${message}`);  }}// 使用中介者模式const mediator = new ChatMediator();const user1 = new User('User 1', mediator);const user2 = new User('User 2', mediator);const user3 = new User('User 3', mediator);mediator.addUser(user1);mediator.addUser(user2);mediator.addUser(user3);user1.sendMessage('Hello, everyone!'); // User 1 sending message: Hello, everyone!// User 2 received message: Hello, everyone!// User 3 received message: Hello, everyone!user3.sendMessage('Hi there!'); // User 3 sending message: Hi there!// User 1 received message: Hi there!// User 2 received message: Hi there!
```

总结
==

在 JavaScript 开发中，设计模式是一种强大的工具，可以帮助我们更好地组织和结构化代码，提高代码的可维护性和可扩展性。本文介绍了一些常见的 JavaScript 设计模式，包括单例模式、工厂模式、观察者模式、策略模式等。设计模式并不是一成不变的规则，而是在特定情境下的最佳实践。在实际项目中，根据需求和情境选择合适的设计模式是至关重要的。理解和掌握设计模式的原理，有助于我们更好地设计和组织代码结构，提高代码的质量。总之，设计模式是 JavaScript 开发中的重要主题，通过学习和应用设计模式，我们能够写出更清晰、可维护且更具扩展性的代码。希望本文对你理解和应用 JavaScript 设计模式提供了一些有用的信息。在实践中不断积累经验，发现适合自己团队和项目的最佳实践。

参考
==

*   https://juejin.cn/post/6844904032826294286
    

- END -

关于奇舞团
-----

奇舞团是 360 集团最大的大前端团队，代表集团参与 W3C 和 ECMA 会员（TC39）工作。奇舞团非常重视人才培养，有工程师、讲师、翻译官、业务接口人、团队 Leader 等多种发展方向供员工选择，并辅以提供相应的技术力、专业力、通用力、领导力等培训课程。奇舞团以开放和求贤的心态欢迎各种优秀人才关注和加入奇舞团。

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEBLicibtcprJISN18FgTtg2N1ichPnMqRhicrP20VfwnC4vday7gtEoiaSynIH1bas4N5kgicliakrLdtT2Q/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)