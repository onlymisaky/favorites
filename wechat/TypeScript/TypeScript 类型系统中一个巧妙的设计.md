> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/emxmW9Sn48g6J2BiAn8iGw)

大家好，我是 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf&scene=21#wechat_redirect)。

不知道大家平时使用 `TypeScript` 有没有遇到过这种情况：

```
interface Options {  hostName: string;  port: number;}function validateOptions (options: Options) {  Object.keys(options).forEach(key => {    if (options[key] == null) {        // ❌ Expression of type 'string' can't be used to index type 'Options'.      throw new Error(`${key} 不存在！`);    }  });}
```

这个错误看起来毫无意义，我们使用 `options` 的 `key` 来访问 `options`，这样还报错？

为啥 `TypeScript` 不解决这种问题？

一般我们可以通过将 `Object.keys(options)` 强制转换为 `(keyof typeof options)[]` 来规避这种问题。

```
const keys = Object.keys(options) as (keyof typeof options)[];keys.forEach(key => {  if (options[key] == null) {    throw new Error(`${key} 不存在！`);  }});
```

但为什么  `TypeScript`  会认为这是一个问题呢？

如果我们尝试查看 `Object.keys` 的类型定义，我们会看到以下内容：

```
// typescript/lib/lib.es5.d.tsinterface Object {  keys(o: object): string[];}
```

这个类型定义非常简单，接受一个 `object` 并返回 `string[]`。

我们可以稍微做一下变更，让它接收一个泛型参数 `T` ，并且返回 `(keyof T)[]`：

```
class Object {  keys<T extends object>(o: T): (keyof T)[];}
```

如果 `Object.keys` 是这样定义的，我们就不会遇到上面的类型错误。

或许大家看来，像这样定义 `Object.keys` 似乎是理所当然的事情，但 `TypeScript` 不这样做其实是有自己的考虑的，这就跟 `TypeScript` 的结构类型系统有关。

TypeScript 中的结构类型
-----------------

当一个对象的属性丢失或类型错误时，`TypeScript` 会抛出错误。

```
function saveUser(user: { name: string, age: number }) {}const user1 = { name: "ConardLi", age: 17 };saveUser(user1); // ✅ OK!const user2 = { name: "Sarah" };saveUser(user2);         // ❌ Property 'age' is missing in type { name: string }.const user3 = { name: "John", age: '17' };saveUser(user3);         // ❌ Types of property 'age' are incompatible.         // ❌ Type 'string' is not assignable to type 'number'.
```

但是，如果我们多提供了一个额外的属性，`TypeScript` 就不会报错。

```
function saveUser(user: { name: string, age: number }) {}const user = { name: "ConardLi", age: 17, city: "BeiJing" };saveUser(user); // ✅ Not a type error
```

这就是是结构类型系统中的预期表现：如果 `A` 的类型是 `B` 的超集（即 `A` 包含 `B` 中的所有属性），则类型 `A` 可分配给 `B`；反之，类型 `B` 不可分配给 `A`。

听起来挺抽象的，我们来看一个具体的例子：

```
type A = { foo: number, bar: number };type B = { foo: number };const a1: A = { foo: 1, bar: 2 };const b1: B = { foo: 3 };const b2: B = a1;const a2: A = b1;      //  ❌ Property 'bar' is missing in type 'B' but required in type 'A'.
```

这里面的关键点就是：当我们拥有一个 `T` 类型的对象时，我们所知道的关于这个对象的一切就是它至少包含 `T` 中的所有属性。

但是我们并不知道这个对象是不是和 `T` 类型完全相同，这就是为什么 `Object.keys` 的类型定义是这样的。

下面我们再来看一个例子：

Object.keys 的不安全使用
------------------

假设我们现在要做一个登陆界面，现在我们定义了一个 User 类型：

```
interface User {  name: string;  password: string;}
```

在将用户信息提交到服务端之前，我们要确保用户对象有效，所以我们会在前端做个简单的验证：

*   名称必须非空。
    
*   密码必须至少 6 个字符。
    

所以我们再创建一个 `validators` 对象，其中包含 `User` 中每个属性的验证函数：

```
const validators = {  name: (name: string) => name.length < 1    ? "Name 不能为空！"    : "",  password: (password: string) => password.length < 6    ? "Password 至少 6 位！"    : "",};
```

然后，我们创建一个 `validateUser` 函数，来使用 `validators` 对用户信息进行验证：

```
function validateUser(user: User) {  // Pass user object through the validators}
```

因为我们要验证 `user` 中的每个属性，所以可以使用 `Object.keys` 遍历 `user` 中的属性：

```
function validateUser(user: User) {  let error = "";  for (const key of Object.keys(user)) {    const validate = validators[key];    error ||= validate(user[key]);  }  return error;}
```

> 注意：这个代码其实是有类型错误的，我们先忽略它。

这种方法的问题在于， `user` 对象中可能包含了 `validators` 中不存在的属性。

```
interface User {  name: string;  password: string;}function validateUser(user: User) {}const user = {  name: 'ConardLi',  password: '17171717',  email: "17171717@17.com",};validateUser(user); // OK!
```

即使 `User` 没有声明 `email` 属性，也不会抛出类型错误，因为结构类型是允许提供无关属性的。

但是 ，在运行时，`email` 属性将导致 `validator` 未定义，并在调用时抛出错误。

```
for (const key of Object.keys(user)) {  const validate = validators[key];  error ||= validate(user[key]);            // ❌ TypeError: 'validate' is not a function.}
```

但是，幸运的是，`TypeScript` 在这段代码运行之前就会抛出了类型错误。

```
for (const key of Object.keys(user)) {  const validate = validators[key];                   // ❌ @error {w=15} Expression of type 'string' can't be used to index type '{ name: ..., password: ... }'.  error ||= validate(user[key]);                     // ❌ @error {w=9} Expression of type 'string' can't be used to index type 'User'.}
```

现在，大家应该明白了 `Object.keys` 的类型是这样设计的原因。

它强迫让我们知道：对象中是可能包含类型系统不知道的属性的。

好，上面其实我们知道了结构类型，以及它的小坑点，下面让我们看看在开发中怎么去利用它呢？

利用结构类型
------

结构类型给我们提供了很大的灵活性，它允许接口准确地声明它们需要的属性。

下面我们再来举一个例子。

假如我们编写了一个函数，来解析键盘事件并返回要触发的快捷方式。

```
function getKeyboardShortcut(e: KeyboardEvent) {  if (e.key === "s" && e.metaKey) {    return "save";  }  if (e.key === "o" && e.metaKey) {    return "open";  }  return null;}
```

为了确保代码按预期运行，我们编写了一些单元测试：

```
expect(getKeyboardShortcut({ key: "s", metaKey: true }))  .toEqual("save");expect(getKeyboardShortcut({ key: "o", metaKey: true }))  .toEqual("open");expect(getKeyboardShortcut({ key: "s", metaKey: false }))  .toEqual(null);
```

看起来不错，但 `TypeScript` 又报错了：

```
getKeyboardShortcut({ key: "s", metaKey: true });                    // ❌ Type '{ key: string; metaKey: true; }' is missing the following properties from type 'KeyboardEvent': altKey, charCode, code, ctrlKey, and 37 more.
```

啊？我们就写个单元测试需要把 `KeyboardEvent` 的 37 个属性都补全吗？这不可能。

我们可以通过将参数转换为 `KeyboardEvent` 来解决这个问题：

```
getKeyboardShortcut({ key: "s", metaKey: true } as KeyboardEvent);
```

但是，这可能会把其他可能会发生的类型错误也掩盖掉。

相反，我们可以只更新一下函数入参的属性，只从事件中声明它所必需的属性。

```
interface KeyboardShortcutEvent {  key: string;  metaKey: boolean;}function getKeyboardShortcut(e: KeyboardShortcutEvent) {}
```

现在，测试代码只需满足这个更简单的接口了。

我们的函数与全局 `KeyboardEvent` 类型的耦合也比较少，并且可以在更多上下文中使用了，现在更加灵活了。

这就得益于结构类型，`KeyboardEvent` 可以分配给 `KeyboardShortcutEvent`，就是因为 `KeyboardEvent` 是 `KeyboardShortcutEvent` 的超集。

```
window.addEventListener("keydown", (e: KeyboardEvent) => {  const shortcut = getKeyboardShortcut(e); // This is OK!  if (shortcut) {    execShortcut(shortcut);  }});
```

这个结构类型系统的设计是不是挺好的呢？大家有什么想法？欢迎大家在评论区留言。

最后
--

参考：

*   https://en.wikipedia.org/wiki/Structural_type_system
    
*   https://alexharri.com/blog/typescript-structural-typing
    
*   https://neugierig.org/software/blog/2019/11/interface-pattern.html
    

> 如果你想加入高质量前端交流群，或者你有任何其他事情想和我交流也可以添加我的个人微信 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf&scene=21#wechat_redirect) 。

`点赞`和`在看`是最大的支持⬇️❤️⬇️