> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/NIVwXeUE15k7e_PlqP0syg)

![](https://mmbiz.qpic.cn/mmbiz_png/eXCSRjyNYcaPbXCQvR3w8BacQb3iaicUkunTE9RXyTjKtcKOun5EvMTR58iba5g1Cx5WvicrMJiaFtZdppoWTOMhABA/640?wx_fmt=png)

英文 | https://blog.bitsrc.io/10-javascript-design-patterns-3087d1dda5b4

介绍

设计模式是针对常见软件问题的高级面向对象解决方案。模式是关于对象的可重用设计和交互。在讨论复杂的设计解决方案时，每个模式都有一个名称并成为词汇表的一部分。

在本教程中，我为每个 GoF 模式提供了 JavaScript 示例。大多数情况下，它们遵循原始图案设计的结构和意图。这些示例演示了每种模式背后的原则，但并未针对 JavaScript 进行优化。

**01.Abstract Factory** 

Abstract Factory 创建由共同主题相关的对象。在面向对象编程中，工厂是创建其他对象的对象。抽象工厂抽象出新创建的对象共享的主题。

![](https://mmbiz.qpic.cn/mmbiz_png/eXCSRjyNYcaAC7sCWT5OBKteZaq4sUN9SbialWrCbBO4scLbGB4TNaqlVJgicLrNzztpJo1GaIU5ORZqoLaZBSUQ/640?wx_fmt=png)

```
function Employee(name) {
    this.name = name;

    this.say = function () {
        console.log("I am employee " + name);
    };
}

function EmployeeFactory() {

    this.create = function (name) {
        return new Employee(name);
    };
}

function Vendor(name) {
    this.name = name;

    this.say = function () {
        console.log("I am vendor " + name);
    };
}

function VendorFactory() {

    this.create = function (name) {
        return new Vendor(name);
    };
}

function run() {
    var persons = [];
    var employeeFactory = new EmployeeFactory();
    var vendorFactory = new VendorFactory();

    persons.push(employeeFactory.create("Joan DiSilva"));
    persons.push(employeeFactory.create("Tim O'Neill"));
    persons.push(vendorFactory.create("Gerald Watson"));
    persons.push(vendorFactory.create("Nicole McNight"));

    for (var i = 0, len = persons.length; i < len; i++) {
        persons[i].say();
    }
}
```

**02.Builder** 

Builder 模式允许客户端仅通过指定类型和内容来构建复杂对象，细节完全对客户隐藏。

![](https://mmbiz.qpic.cn/mmbiz_png/eXCSRjyNYcaAC7sCWT5OBKteZaq4sUN9SlJ3dElgRsibTsURSaQC7QjibibWr50Cjj9KMzHO7VOkQuTlQgHe7ia6iaw/640?wx_fmt=png)

```
function Shop() {
    this.construct = function (builder) {
        builder.step1();
        builder.step2();
        return builder.get();
    }
}

function CarBuilder() {
    this.car = null;

    this.step1 = function () {
        this.car = new Car();
    };

    this.step2 = function () {
        this.car.addParts();
    };

    this.get = function () {
        return this.car;
    };
}

function TruckBuilder() {
    this.truck = null;

    this.step1 = function () {
        this.truck = new Truck();
    };

    this.step2 = function () {
        this.truck.addParts();
    };

    this.get = function () {
        return this.truck;
    };
}

function Car() {
    this.doors = 0;

    this.addParts = function () {
        this.doors = 4;
    };

    this.say = function () {
        console.log("I am a " + this.doors + "-door car");
    };
}

function Truck() {
    this.doors = 0;

    this.addParts = function () {
        this.doors = 2;
    };

    this.say = function () {
        console.log("I am a " + this.doors + "-door truck");
    };
}

function run() {
    var shop = new Shop();
    var carBuilder = new CarBuilder();
    var truckBuilder = new TruckBuilder();
    var car = shop.construct(carBuilder);
    var truck = shop.construct(truckBuilder);

    car.say();
    truck.say();
}
```

**03、Factory Method** 

Factory Method 按照客户的指示创建新对象。在 JavaScript 中创建对象的一种方法是使用 new 运算符调用构造函数。 

然而，在某些情况下，客户端不知道或不应知道要实例化多个候选对象中的哪一个。 

Factory Method 允许客户端委托对象创建，同时仍然保留对要实例化的类型的控制。

![](https://mmbiz.qpic.cn/mmbiz_png/eXCSRjyNYcaAC7sCWT5OBKteZaq4sUN9ZCkaXQaPEfib03AYwocbqMiblAfmQJ0iaIIHiaIlQpTxiaiaRzyqcBNQic3kQ/640?wx_fmt=png)

```
var Factory = function () {
    this.createEmployee = function (type) {
        var employee;

        if (type === "fulltime") {
            employee = new FullTime();
        } else if (type === "parttime") {
            employee = new PartTime();
        } else if (type === "temporary") {
            employee = new Temporary();
        } else if (type === "contractor") {
            employee = new Contractor();
        }

        employee.type = type;

        employee.say = function () {
            console.log(this.type + ": rate " + this.hourly + "/hour");
        }

        return employee;
    }
}

var FullTime = function () {
    this.hourly = "$12";
};

var PartTime = function () {
    this.hourly = "$11";
};

var Temporary = function () {
    this.hourly = "$10";
};

var Contractor = function () {
    this.hourly = "$15";
};

function run() {

    var employees = [];
    var factory = new Factory();

    employees.push(factory.createEmployee("fulltime"));
    employees.push(factory.createEmployee("parttime"));
    employees.push(factory.createEmployee("temporary"));
    employees.push(factory.createEmployee("contractor"));

    for (var i = 0, len = employees.length; i < len; i++) {
        employees[i].say();
    }
}
```

**04、Adapter**

Adapter 模式将一个接口（对象的属性和方法）转换为另一个接口。Adapter 允许编程组件协同工作，否则由于接口不匹配而无法协同工作。适配器（Adapter）模式也称为包装器模式。

![](https://mmbiz.qpic.cn/mmbiz_png/eXCSRjyNYcaAC7sCWT5OBKteZaq4sUN9Fsn34aT2aI6kThIh9gT8IPEKDib9PicmaUwTJql7ehfNEVH5iaF0lJf3g/640?wx_fmt=png)

```
// old interface

function Shipping() {
    this.request = function (zipStart, zipEnd, weight) {
        // ...
        return "$49.75";
    }
}

// new interface

function AdvancedShipping() {
    this.login = function (credentials) { /* ... */ };
    this.setStart = function (start) { /* ... */ };
    this.setDestination = function (destination) { /* ... */ };
    this.calculate = function (weight) { return "$39.50"; };
}

// adapter interface

function ShippingAdapter(credentials) {
    var shipping = new AdvancedShipping();

    shipping.login(credentials);

    return {
        request: function (zipStart, zipEnd, weight) {
            shipping.setStart(zipStart);
            shipping.setDestination(zipEnd);
            return shipping.calculate(weight);
        }
    };
}

function run() {

    var shipping = new Shipping();
    var credentials = { token: "30a8-6ee1" };
    var adapter = new ShippingAdapter(credentials);

    // original shipping object and interface

    var cost = shipping.request("78701", "10010", "2 lbs");
    console.log("Old cost: " + cost);

    // new shipping object with adapted interface

    cost = adapter.request("78701", "10010", "2 lbs");

    console.log("New cost: " + cost);
}
```

**05、Decorator**

Decorator 模式动态地扩展（装饰）对象的行为。在运行时添加新行为的能力是由 Decorator 对象实现的，它 “将自身包装” 在原始对象周围。多个装饰器可以向原始对象添加或覆盖功能。

![](https://mmbiz.qpic.cn/mmbiz_png/eXCSRjyNYcaAC7sCWT5OBKteZaq4sUN9cV8hSK0ECQrAupURiakHyMWNTSggjzvfZ2icqcTh1zf0wibqj6RlXGGaQ/640?wx_fmt=png)

```
var User = function (name) {
    this.name = name;

    this.say = function () {
        console.log("User: " + this.name);
    };
}

var DecoratedUser = function (user, street, city) {
    this.user = user;
    this.name = user.name;  // ensures interface stays the same
    this.street = street;
    this.city = city;

    this.say = function () {
        console.log("Decorated User: " + this.name + ", " +
            this.street + ", " + this.city);
    };
}

function run() {

    var user = new User("Kelly");
    user.say();

    var decorated = new DecoratedUser(user, "Broadway", "New York");
    decorated.say();
}
```

**06、Facade**

Facade 模式提供了一个接口，使客户免受一个或多个子系统中复杂功能的影响。这是一个看似微不足道但功能强大且极其有用的简单模式。它通常出现在围绕多层架构构建的系统中。

![](https://mmbiz.qpic.cn/mmbiz_png/eXCSRjyNYcaAC7sCWT5OBKteZaq4sUN9tX7jQzX2GtgekluOOmT9ia1yBuG5UYReFUaUV5wyGiaURRpsKiaVB6MXA/640?wx_fmt=png)

```
var Mortgage = function (name) {
    this.name = name;
}

Mortgage.prototype = {

    applyFor: function (amount) {
        // access multiple subsystems...
        var result = "approved";
        if (!new Bank().verify(this.name, amount)) {
            result = "denied";
        } else if (!new Credit().get(this.name)) {
            result = "denied";
        } else if (!new Background().check(this.name)) {
            result = "denied";
        }
        return this.name + " has been " + result +
            " for a " + amount + " mortgage";
    }
}

var Bank = function () {
    this.verify = function (name, amount) {
        // complex logic ...
        return true;
    }
}

var Credit = function () {
    this.get = function (name) {
        // complex logic ...
        return true;
    }
}

var Background = function () {
    this.check = function (name) {
        // complex logic ...
        return true;
    }
}

function run() {
    var mortgage = new Mortgage("Joan Templeton");
    var result = mortgage.applyFor("$100,000");

    console.log(result);
}
```

**07、Proxy**

代理模式为另一个对象提供代理或占位符对象，并控制对另一个对象的访问。

![](https://mmbiz.qpic.cn/mmbiz_png/eXCSRjyNYcaAC7sCWT5OBKteZaq4sUN9cEjhEp4sRiapf5agKU7dPS4yuQphULoHz8picTjj1QWWBAGKyLotaiaMg/640?wx_fmt=png)

```
function GeoCoder() {

    this.getLatLng = function (address) {

        if (address === "Amsterdam") {
            return "52.3700° N, 4.8900° E";
        } else if (address === "London") {
            return "51.5171° N, 0.1062° W";
        } else if (address === "Paris") {
            return "48.8742° N, 2.3470° E";
        } else if (address === "Berlin") {
            return "52.5233° N, 13.4127° E";
        } else {
            return "";
        }
    };
}

function GeoProxy() {
    var geocoder = new GeoCoder();
    var geocache = {};

    return {
        getLatLng: function (address) {
            if (!geocache[address]) {
                geocache[address] = geocoder.getLatLng(address);
            }
            console.log(address + ": " + geocache[address]);
            return geocache[address];
        },
        getCount: function () {
            var count = 0;
            for (var code in geocache) { count++; }
            return count;
        }
    };
};

function run() {

    var geo = new GeoProxy();

    // geolocation requests

    geo.getLatLng("Paris");
    geo.getLatLng("London");
    geo.getLatLng("London");
    geo.getLatLng("London");
    geo.getLatLng("London");
    geo.getLatLng("Amsterdam");
    geo.getLatLng("Amsterdam");
    geo.getLatLng("Amsterdam");
    geo.getLatLng("Amsterdam");
    geo.getLatLng("London");
    geo.getLatLng("London");

    console.log("\nCache size: " + geo.getCount());

}
```

**08、Mediator**

Mediator 模式通过封装这些对象的交互方式来提供对一组对象的集中管理权。此模型对于需要管理复杂条件的场景很有用，在这种情况下，每个对象都知道组中任何其他对象的任何状态更改。

![](https://mmbiz.qpic.cn/mmbiz_png/eXCSRjyNYcaAC7sCWT5OBKteZaq4sUN9bS779Sl4du7eW1ruEVfSNoWZ3U0NANBvNBISNm0TJQO3lRjgKJqkZw/640?wx_fmt=png)

```
var Participant = function (name) {
    this.name = name;
    this.chatroom = null;
};

Participant.prototype = {
    send: function (message, to) {
        this.chatroom.send(message, this, to);
    },
    receive: function (message, from) {
        console.log(from.name + " to " + this.name + ": " + message);
    }
};

var Chatroom = function () {
    var participants = {};

    return {

        register: function (participant) {
            participants[participant.name] = participant;
            participant.chatroom = this;
        },

        send: function (message, from, to) {
            if (to) {                      // single message
                to.receive(message, from);
            } else {                       // broadcast message
                for (key in participants) {
                    if (participants[key] !== from) {
                        participants[key].receive(message, from);
                    }
                }
            }
        }
    };
};

function run() {

    var yoko = new Participant("Yoko");
    var john = new Participant("John");
    var paul = new Participant("Paul");
    var ringo = new Participant("Ringo");

    var chatroom = new Chatroom();
    chatroom.register(yoko);
    chatroom.register(john);
    chatroom.register(paul);
    chatroom.register(ringo);

    yoko.send("All you need is love.");
    yoko.send("I love you John.");
    john.send("Hey, no need to broadcast", yoko);
    paul.send("Ha, I heard that!");
    ringo.send("Paul, what do you think?", paul);
}
```

**09、Observer**

Observer 模式提供了一种订阅模型，其中对象订阅一个事件并在事件发生时得到通知。这种模式是事件驱动编程的基石，包括 JavaScript。Observer 模式促进了良好的面向对象设计并促进了松散耦合。

![](https://mmbiz.qpic.cn/mmbiz_png/eXCSRjyNYcaAC7sCWT5OBKteZaq4sUN9RWArOApDbJFvdVFibExtvDW7Frk3cMUZJAibutGjr3VPiaz1jqJchnZBg/640?wx_fmt=png)

```
function Click() {
    this.handlers = [];  // observers
}

Click.prototype = {

    subscribe: function (fn) {
        this.handlers.push(fn);
    },

    unsubscribe: function (fn) {
        this.handlers = this.handlers.filter(
            function (item) {
                if (item !== fn) {
                    return item;
                }
            }
        );
    },

    fire: function (o, thisObj) {
        var scope = thisObj || window;
        this.handlers.forEach(function (item) {
            item.call(scope, o);
        });
    }
}

function run() {

    var clickHandler = function (item) {
        console.log("fired: " + item);
    };

    var click = new Click();

    click.subscribe(clickHandler);
    click.fire('event #1');
    click.unsubscribe(clickHandler);
    click.fire('event #2');
    click.subscribe(clickHandler);
    click.fire('event #3');
}
```

**10、Visitor**

Visitor 模式定义了对对象集合的新操作，而不更改对象本身。新逻辑驻留在一个名为 Visitor 的单独对象中。

![](https://mmbiz.qpic.cn/mmbiz_png/eXCSRjyNYcaAC7sCWT5OBKteZaq4sUN9SsGcdP6cXXBYtHZvbfbDQl1FsSymhHfz7sw39dQeuib1TuJfm0LjdoA/640?wx_fmt=png)

```
var Employee = function (name, salary, vacation) {
    var self = this;

    this.accept = function (visitor) {
        visitor.visit(self);
    };

    this.getName = function () {
        return name;
    };

    this.getSalary = function () {
        return salary;
    };

    this.setSalary = function (sal) {
        salary = sal;
    };

    this.getVacation = function () {
        return vacation;
    };

    this.setVacation = function (vac) {
        vacation = vac;
    };
};

var ExtraSalary = function () {
    this.visit = function (emp) {
        emp.setSalary(emp.getSalary() * 1.1);
    };
};

var ExtraVacation = function () {
    this.visit = function (emp) {
        emp.setVacation(emp.getVacation() + 2);
    };
};

function run() {

    var employees = [
        new Employee("John", 10000, 10),
        new Employee("Mary", 20000, 21),
        new Employee("Boss", 250000, 51)
    ];

    var visitorSalary = new ExtraSalary();
    var visitorVacation = new ExtraVacation();

    for (var i = 0, len = employees.length; i < len; i++) {
        var emp = employees[i];

        emp.accept(visitorSalary);
        emp.accept(visitorVacation);
        console.log(emp.getName() + ": $" + emp.getSalary() +
            " and " + emp.getVacation() + " vacation days");
    }
}
```

**结论**

当我们结束我们的 JavaScript 设计模式之旅时，很明显这些强大的工具在制作可维护、可扩展和高效的代码方面发挥着至关重要的作用。

通过理解和实施这些模式，您不仅会提升您的编程技能，还会为您自己和您的团队成员创造更愉快的开发体验。

请记住，设计模式不是一种放之四海而皆准的解决方案。分析项目的独特需求和约束以确定哪些模式将带来最大价值至关重要。

不断学习和试验不同的设计模式将使您能够做出明智的决策并为您的项目选择最佳方法。

将设计模式整合到您的工作流中可能需要投入时间和精力，但从长远来看，这是值得的。

当您掌握编写优雅、模块化和高效的 JavaScript 代码的艺术时，您会发现您的应用程序变得更加健壮，您的调试过程更易于管理，并且您的整体开发体验更加愉快。

因此，继续探索 JavaScript 设计模式的世界，并希望您的代码更易于维护、可扩展和高效。

感谢您的阅读，祝编程愉快！

**学习更多技能  
**

**请点击下方公众号**

![](https://mmbiz.qpic.cn/mmbiz/wyice8kFQhf7WrYjynsDMjRbgCwiack4E9nqoERbCmDibsRhEpUq58oKwIEyc4VuxVGROQSQL7lXIrSo2yr3no1IA/640?wx_fmt=gif)


==========================================================================================================================================================================

![](https://mmbiz.qpic.cn/mmbiz_jpg/eXCSRjyNYcYj5XSyXqgfEDuia5T2CqhMJWxvGzoOLp5LsXoEjvGxic7EVLZ92hlibksPdxHr9YtBCr0vcuE9NaU6A/640?wx_fmt=jpeg)

![](https://mmbiz.qpic.cn/mmbiz_jpg/eXCSRjyNYcbp4N70FeobmqyxAwNXPWTibkQBvtX5BM5MVUv5SgJBjibEhsQVHrcic6s8Nz2U9pBn6y5x5xce2sS6A/640?wx_fmt=jpeg)