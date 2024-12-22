> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/RJhpudGX0pUbLvCrnitGxw)

提到 proxy，貌似很多人的印象是这东西是实现 vue3 的核心，但好像除此以外就没有什么关于 proxy 实际应用的场景了。今天就重新在了解一下 proxy，并在文章最后会给出几个 proxy 的实际应用案例，扩展下对 proxy 使用的场景。让大家写出逼格更高，更有深度的代码。

首先我们要先复习下 proxy 的基本知识。

Proxy 基础
========

proxy 是个啥？
----------

在 JavaScript 中，`Proxy` 对象是 ES6 引入的一种机制，它允许你创建一个代理对象，用于拦截和定义基本操作的自定义行为。`Proxy` 出现的主要原因包括：

1.  拦截和修改操作：`Proxy` 允许你拦截并重定义对象上的基本操作，比如读取属性、设置属性、函数调用等。这使得你可以在这些操作发生前后插入自定义逻辑。
    
2.  数据绑定和观察：你可以使用 `Proxy` 监听对象属性的变化。当被代理对象的属性发生变化时，可以触发相关操作，这对于实现数据绑定和观察模式非常有用。
    
3.  安全性：`Proxy` 可以用于创建安全的对象，限制对对象的访问和操作。你可以通过拦截器来验证用户的操作，以确保对象的安全性。
    
4.  元编程：`Proxy` 提供了元编程的能力，即在运行时改变语言的行为。通过拦截器，你可以动态地修改对象的行为，这为实现更高级的编程模式提供了可能性。
    
5.  函数式编程：在函数式编程中，`Proxy` 可以用于创建不可变（immutable）的数据结构，确保数据不被修改，从而避免副作用。
    

总的来说，`Proxy` 出现的主要原因是为了提供更灵活、可控制、可定制的对象操作和行为，使得开发者能够更好地掌握和管理代码的执行过程。

为啥要有 proxy
----------

在 JavaScript 中引入 `Proxy` 的历史原因主要是为了提供更灵活和可扩展的对象操作机制。在 ES6 之前，JavaScript 语言中并没有原生的方式来实现对象的拦截和定制操作行为。开发者通常需要依赖对象的 getter 和 setter 方法，或者使用一些特定的命名约定来模拟拦截操作，但这些方法都有限制和局限性。

随着应用程序变得越来越复杂，需要更多灵活性和可控性来处理对象的操作。因此，在 ECMAScript 6（ES6）标准中引入了 `Proxy`，以提供一种通用的、标准化的机制，使开发者可以在对象上定义自定义的操作行为。这种机制的引入使得 JavaScript 的对象系统更加强大和灵活，为开发者提供了更多处理对象的方式，也为实现各种高级编程模式和设计模式提供了基础。

因此，`Proxy` 的引入主要是为了满足 JavaScript 编程语言在处理对象时的需求，提供了一种更现代、更强大的对象操作机制。

Proxy 的好兄弟 Reflect
==================

`Proxy` 和 `Reflect` 是 ES6 中引入的两个相关的特性。这两者常常一起使用，因为 `Reflect` 提供了一套默认行为，这些行为与函数调用对应，与 `Proxy` 的 handler 对象能处理的各种相对应。

Proxy 和 Reflect 的交互
-------------------

1.  对称性：`Reflect` API 的设计目标之一是与 `Proxy` handlers 的方法保持一致性。例如，`Reflect.get(target, property, receiver)` 与 `get` 方法具有相同的参数。这使得我们在编写 `Proxy` 时，可以很方便地调用对应的 `Reflect` 方法来保留默认行为。
    
2.  默认行为：`Proxy` 的方法可以让我们自定义基本操作，但有时我们想要修改某些行为的同时保留默认行为。这时，我们可以在 `Proxy` 内调用对应的 `Reflect` 方法。这样做不仅代码更简洁，而且 `Reflect` 的方法会处理原型链相关的细节。
    

没有 Reflect 呢？
-------------

如果没有 `Reflect`，我们通常需要手动复制原有的行为，这可能导致代码冗长且容易出错。例如，如果你想在 `get` 操作前添加日志记录，没有 `Reflect` 你可能需要这样做：

```
let proxy = new Proxy(target, {  get(target, property, receiver) {    console.log(`Property ${property} has been read.`);    return target[property]; // 如果属性在原型链上，这里就不够用了  }});
```

如果 `property` 属性存在于原型链上，这种方法就会失败。而使用 `Reflect.get()`，它会自动处理这些细节：

```
let proxy = new Proxy(target, {  get(target, property, receiver) {    console.log(`Property ${property} has been read.`);    return Reflect.get(target, property, receiver);  }});
```

使用 `Reflect` 还可以确保返回值和异常的正确传递，因为 `Reflect` 的方法返回的是操作的状态（成功或者失败），这正好与 `Proxy` 的要求相符合。

举几个使用案例
=======

模拟对象关系数据库
---------

```
// 模拟数据库const database = {  users: [    { id: 1, name: 'Alice', age: 25 },    { id: 2, name: 'Bob', age: 30 },    // ...more users  ],  posts: [    { id: 1, title: 'Post 1', content: 'Content 1', userId: 1 },    { id: 2, title: 'Post 2', content: 'Content 2', userId: 2 },    // ...more posts  ],};// 模拟ORM生成器const createORM = (tableName, primaryKey) => {  return new Proxy(database[tableName], {    get(target, property) {      if (property === 'findAll') {        // 返回所有记录        return () => target;      }      if (property === 'findById') {        // 根据主键查找记录        return (id) => target.find(item => item[primaryKey] === id);      }      if (property === 'findBy') {        // 根据条件查找记录        return (condition) => target.filter(item => {          for (const key in condition) {            if (item[key] !== condition[key]) {              return false;            }          }          return true;        });      }      // 其他属性返回原始值      return target[property];    }  });};// 使用ORM生成器创建User和Post对象const User = createORM('users', 'id');const Post = createORM('posts', 'id');// 使用ORM查询数据console.log(User.findAll()); // 返回所有用户console.log(User.findById(1)); // 返回id为1的用户console.log(User.findBy({ age: 30 })); // 返回年龄为30的用户console.log(Post.findAll()); // 返回所有帖子console.log(Post.findBy({ userId: 1 })); // 返回userId为1的帖子
```

首先，我们有一个名为 `database` 的模拟数据库，其中包含两个表：`users` 和 `posts`。每个表都有一些示例记录，包括用户信息和帖子信息。

然后，我们有一个 `createORM` 函数，它是一个 ORM 生成器。这个函数接受两个参数：`tableName` 表示表的名称，`primaryKey` 表示主键的名称。它返回了一个代理对象，这个代理对象通过 Proxy 对象对数据库中的表进行了包装。

这个代理对象中的 `get` 方法用于捕获对对象属性的访问。在这个方法中，我们检查了被访问的属性是否是 `findAll`、`findById` 或 `findBy`。如果是其中之一，它们分别返回了对应的函数：

*   `findAll` 返回指定表中的所有记录。
    
*   `findById` 根据指定的主键值返回对应的记录。
    
*   `findBy` 根据指定的条件返回符合条件的记录。
    

除了以上三个特殊属性外，对于其他属性，代理对象会直接返回数据库中对应表的属性值。

接着，我们使用 `createORM` 函数创建了 `User` 和 `Post` 对象，分别对应于 `users` 表和 `posts` 表。

最后，我们使用这些生成的对象执行了一些查询操作。例如，我们调用 `User.findAll()` 返回了所有用户的信息，调用 `Post.findBy({ userId: 1 })` 返回了所有 `userId` 为 1 的帖子的信息。

表单验证器
-----

```
const Validator = (rules) => {  return new Proxy({}, {    set(target, property, value) {      const rule = rules[property];      if (rule) {        // 验证规则存在        for (const validation of rule) {          const { type, message, condition } = validation;          // 使用Reflect进行验证          const isValid = Reflect[type](value, condition);                    if (!isValid) {            console.error(`Validation failed for ${property}: ${message}`);            return false;          }        }      }      // 符合规则，设置值      target[property] = value;      return true;    }  });};// 定义表单验证规则const formRules = {  username: [    { type: 'isString', message: 'Username must be a string', condition: {} },    { type: 'isLength', message: 'Username must be between 5 and 15 characters', condition: { min: 5, max: 15 } },  ],  password: [    { type: 'isString', message: 'Password must be a string', condition: {} },    { type: 'isLength', message: 'Password must be at least 8 characters', condition: { min: 8 } },    { type: 'matches', message: 'Password must contain at least one uppercase letter', condition: /[A-Z]/ },  ],  email: [    { type: 'isString', message: 'Email must be a string', condition: {} },    { type: 'isEmail', message: 'Invalid email format', condition: {} },  ],};// 使用表单验证器const formValidator = Validator(formRules);// 模拟表单数据const formData = {  username: 'john_doe',  password: 'SecurePass123',  email: 'john.doe@example.com',};// 验证表单数据for (const field in formData) {  formValidator[field] = formData[field];}// 表单验证结果console.log(formValidator);
```

首先，我们有一个名为 `Validator` 的函数，它接受一个规则对象作为参数，并返回了一个代理对象。这个代理对象用于捕获对属性的赋值操作，即在设置属性值时进行验证。

在代理对象的 `set` 方法中，我们首先检查给定属性的验证规则是否存在。如果存在规则，我们就遍历这些规则，并对属性值进行验证。验证规则包括 `type`（验证函数名称）、`message`（验证失败时的错误消息）和 `condition`（验证条件）。

接着，我们使用 `Reflect[type]` 来调用相应的内置验证函数，比如 `isString`、`isLength`、`matches`、`isEmail` 等。如果验证失败，我们会输出相应的错误消息，并阻止属性值的设置。

如果所有的验证规则都通过了，我们就将属性值设置到目标对象中，并返回 `true`，表示设置成功。

接下来，我们定义了一个 `formRules` 对象，其中包含了对表单字段的验证规则。每个字段都有一个对应的验证规则数组。

然后，我们使用 `Validator` 函数并传入 `formRules` 来创建了一个表单验证器 `formValidator`。

接着，我们定义了一个模拟的表单数据对象 `formData`，其中包含了要验证的字段和对应的值。

然后，我们遍历 `formData` 中的每个字段，并将其值赋给 `formValidator` 对象中的相应属性。这会触发代理对象的 `set` 方法进行验证。

最后，我们输出了经过验证后的 `formValidator` 对象，其中包含了验证通过的表单数据。

日志
--

```
// 创建一个目标对象const targetObject = { value: 42 };// 创建一个日志对象const logger = new Logger();// 创建一个 Proxy，用于记录日志const logProxy = new Proxy(targetObject, {  get(target, prop) {    logger.log(`Getting property ${prop}`);    return target[prop];  },  set(target, prop, value) {    logger.log(`Setting property ${prop} to ${value}`);    target[prop] = value;    return true;  },  deleteProperty(target, prop) {    logger.warn(`Deleting property ${prop}`);    delete target[prop];    return true;  },  apply(target, thisArg, args) {    logger.log(`Applying function ${target.name || 'anonymous'}`);    return target.apply(thisArg, args);  },  construct(target, args) {    logger.log(`Constructing object with ${target.name || 'anonymous'} constructor`);    return new target(...args);  },});// 使用 Proxy 访问目标对象logProxy.value; // 获取属性，触发日志logProxy.value = 100; // 设置属性，触发日志delete logProxy.value; // 删除属性，触发日志
```

首先，我们有一个名为 `targetObject` 的目标对象，其中包含一个属性 `value`，其初始值为 `42`。

然后，我们创建了一个 `Logger` 类的实例，用于记录日志。该 `Logger` 类在代码中没有完全显示，但我们可以假设它包含了一些日志记录的方法，如 `log`、`warn`。

接着，我们使用 `Proxy` 构造函数创建了一个名为 `logProxy` 的代理对象。这个代理对象包含了一系列处理器（handler），用于捕获对目标对象的不同操作，比如 `get`、`set`、`deleteProperty`、`apply`、`construct`。

在 `get` 处理器中，每当获取目标对象的属性时，会触发日志记录，指示正在获取哪个属性。

在 `set` 处理器中，每当设置目标对象的属性时，会触发日志记录，指示正在设置哪个属性以及设置的值。

在 `deleteProperty` 处理器中，每当删除目标对象的属性时，会触发日志记录，指示正在删除哪个属性。

在 `apply` 处理器中，每当对目标对象进行函数调用时，会触发日志记录，指示正在调用哪个函数。

在 `construct` 处理器中，每当使用 `new` 操作符创建对象时，会触发日志记录，指示正在构造哪个对象。

最后，我们使用 `logProxy` 对象进行了一系列操作，包括获取属性、设置属性、删除属性。每次操作都触发了相应的日志记录，以便跟踪对象的行为。

缓存
--

```
const { promisify } = require('util');const redis = require('redis');const client = redis.createClient();// 模拟数据库查询async function queryDatabase(query) {  // 在实际应用中，这里会是真实的数据库查询操作  console.log(`Executing database query: ${query}`);  return `Result for query: ${query}`;}// 使用 Proxy 创建一个带缓存的数据库查询代理const cachedDatabaseQuery = new Proxy(queryDatabase, {  async apply(target, thisArg, argumentsList) {    const query = argumentsList[0];    const cacheKey = `cache:${query}`;    // 尝试从缓存中获取结果    const cachedResult = await promisify(client.get).bind(client)(cacheKey);    if (cachedResult) {      console.log(`Cache hit! Returning cached result for query: ${query}`);      return cachedResult;    }    // 缓存中没有结果，执行数据库查询    const result = await target(...argumentsList);    // 将查询结果存入缓存    await promisify(client.set).bind(client)(cacheKey, result);    console.log(`Database query result stored in cache for query: ${query}`);    return result;  },});// 测试代理async function testProxy() {  const result1 = await cachedDatabaseQuery('SELECT * FROM users WHERE id = 1');  const result2 = await cachedDatabaseQuery('SELECT * FROM users WHERE id = 2');  const result3 = await cachedDatabaseQuery('SELECT * FROM users WHERE id = 1');  console.log(result1);  console.log(result2);  console.log(result3);}testProxy();
```

首先，我们引入了 `util` 模块中的 `promisify` 函数和 `redis` 模块，然后创建了一个 Redis 客户端 `client`。

接着，我们定义了一个模拟数据库查询的异步函数 `queryDatabase`，在实际应用中，这里会是真实的数据库查询操作。这个函数接受一个查询字符串作为参数，打印出执行的查询，并返回一个包含查询结果的字符串。

然后，我们使用 Proxy 创建了一个名为 `cachedDatabaseQuery` 的代理对象。这个代理对象用于包装 `queryDatabase` 函数，实现了带缓存的数据库查询功能。

在代理对象的 `apply` 处理器中，我们首先从 Redis 缓存中尝试获取查询结果。如果缓存中有结果，则直接返回缓存的结果，并打印相应的日志。

如果缓存中没有结果，则调用原始的 `queryDatabase` 函数执行数据库查询，并将结果存入缓存中，并打印相应的日志。

最后，我们定义了一个名为 `testProxy` 的异步函数，用于测试代理对象。在这个函数中，我们多次调用 `cachedDatabaseQuery` 函数执行数据库查询，并输出查询结果。

看看平常可以用的
--------

上面的讲的都是比较高大上的东西，其实很多小功能点也可以利用 proxy 来优化代码。

如果你需要一个对照的 MapObject，用来映射 server 传递来的一些特殊值，但 server 有可能传过来一个 null 或者空怎么办呢？

```
const MAP = {  a: '342412',  b: 'qwerasd'}if(!serverKey) {  console.log('xxxx')} else {  console.log(MAP[serverKey])}
```

可以写个 if 但是如果判断逻辑哪的代码又多又杂，或者是需求让你写出越来越多的特殊情况，那 if 就显得不那么优雅了， 我们这个时候就可以用 proxy 来解耦

```
const createObjMapProxy = (obj) => {  return new Proxy(obj, {    get: (target, propKey: string, receiver) => {      const keys = **Object**.keys(target)      if (keys.includes(propKey)) {        return Reflect.get(target, propKey, receiver)      } else {      // 将判断逻辑或其他逻辑放到这里        if(xxx) {          return x        } else {          return xx        }      }    }  })}const orderTypeProxy = createObjMapProxy({  a: '342412',  b: 'qwerasd'})
```

创建一个 createObjMapProxy 方法传入一个对象，这个方法返回一个 Proxy 对象，用入参的对象初始化一个 proxy 对象并监听对象的 get 行为，并在 get 行为中构建逻辑。

这时我们就将使用的功能和构建逻辑的功能彻底分开了，createObjMapProxy 方法随便丢到别的文件中去引用出来，也能有效降低单文件代码量。

重复包装 `Proxy`
------------

```
const targetObject = { value: 42 };// 第一个 Proxyconst firstProxy = new Proxy(targetObject, {  get(target, prop) {    console.log(`Getting property ${prop} via the first Proxy`);    return target[prop];  },  set(target, prop, value) {    console.log(`Setting property ${prop} via the first Proxy`);    target[prop] = value;    return true;  },});// 第二个 Proxyconst secondProxy = new Proxy(firstProxy, {  get(target, prop) {    console.log(`Getting property ${prop} via the second Proxy`);    return target[prop];  },  set(target, prop, value) {    console.log(`Setting property ${prop} via the second Proxy`);    target[prop] = value;    return true;  },});// 使用第二个 Proxyconsole.log(secondProxy.value); // 通过第二个 Proxy 获取属性secondProxy.value = 100; // 通过第二个 Proxy 设置属性console.log(secondProxy.value); // 通过第二个 Proxy 获取更新后的属性
```

每个 `Proxy` 可以只做一个独立的事情然后一层一层的包给属性，进一步解耦代码。

总结
==

proxy 的优点
---------

1.  灵活性和可扩展性：`Proxy` 提供了强大的拦截和定制能力，使开发者能够在对象的访问、修改和删除等操作上进行细粒度的控制，从而实现各种高级功能。
    
2.  代码可读性和维护性：使用 `Proxy` 可以将对象的行为和结构分离开，使代码更加清晰、可读，并且更容易维护。
    
3.  通用性：由于 `Proxy` 可以拦截多种操作，因此可以创建通用的功能，比如数据绑定、表单验证等。
    
4.  无侵入性：`Proxy` 可以在不修改原始对象的情况下实现功能，使得代码更加模块化和可复用。
    

proxy 的缺陷
---------

1.  性能：相对于直接访问对象的操作，`Proxy` 的性能会略逊一筹。如果性能是关键问题，而且不需要 `Proxy` 提供的特殊功能，可以选择传统的操作方式。
    
2.  兼容性：一些较老版本的浏览器可能不支持 `Proxy`，因此在考虑兼容性时需要注意。
    
3.  学习成本：对于新手来说，掌握 `Proxy` 的使用可能需要一些时间，因为它提供了丰富的特性和选项。
    
4.  不可逆性：一旦使用 `Proxy` 修改了对象的行为，有可能导致代码的不可逆转。这也意味着在使用 `Proxy` 时需要谨慎，确保了解其对对象的影响。
    

```
const user = {  name: 'John',  age: 30,};const loggedUser = new Proxy(user, {  get(target, key) {    console.log(`Getting ${key}`);    return target[key];  },});console.log(loggedUser.name); // 输出 "Getting name"console.log(loggedUser.age);  // 输出 "Getting age"
```

这种行为是可逆的，我们可以选择不使用这个 proxy

但如果是这样

```
const securedUser = new Proxy(user, {  set(target, key, value) {    if (key === 'age' && typeof value !== 'number') {      throw new Error('Age must be a number');    }    target[key] = value;    return true;  },});securedUser.age = 'thirty'; // 抛出错误：Age must be a number
```

如果已经设置成了这样 我们使用 securedUser.age 时 只要不是 number 类型他就会一直报错

如果是正在写代码没有问题，但如果别人已经写好了现在你要改代码，哪你就得小心了。

这样的修改是不可逆的，因为一旦我们使用了这个 `Proxy`，就无法回到没有这个检查的状态。如果后续发现这个检查有问题，需要去掉或者修改，就需要谨慎操作，以免影响到代码的其他部分。这就是 "不可逆性" 的一个例子。

文章到此其实大家也能从上述的例子中发现一些共性，proxy 的本质其实就是为对象提供了一层中间层，让我们在操作对象的时候同时触发一些事情，也就是说如果未来我们的场景需要着重对操作对象这件事做很多事情的时候，那么 proxy 就会成为一个很好的方案。

想了解更多转转公司的业务实践，点击关注下方的公众号吧！