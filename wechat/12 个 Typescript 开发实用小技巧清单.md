> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/bhTpuanN8DPnTzDR69Ao6g)

大厂技术 高级前端 Node 进阶
=================

点击上方 程序员成长指北，关注公众号

回复 1，加入高级 Node 交流群

英文 | https://devsmitra.medium.com/13-typescript-utility-a-cheat-sheet-for-developer-9dfd23cb1bbc

翻译 | 杨小爱

Typescript 在类型检查方面非常强大，但有时某些类型是其他类型的子集并且需要为它们定义类型检查时，它会变得乏味。

举个例子，有两种响应类型：

**用户配置文件响应**

```
interface UserProfileResponse {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar: string;
}
```

**登录响应**

```
interface LoginResponse {
  id: number;
  name: string;
}
```

我们可以为 UserProfileResponse 定义类型并为 LoginResponse 选择一些属性，而不是定义相同上下文 LoginResponse 和 UserProfileResponse 的类型。

```
type LoginResponse = Pick<UserProfileResponse, "id" | "name">;
```

让我们了解一些可以帮助您编写更好代码的实用函数。

**01、Uppercase**

构造一个 Type 的所有属性都设置为大写的类型。

```
type Role = "admin" | "user" | "guest";
// Bad practice 
type UppercaseRole = "ADMIN" | "USER" | "GUEST";
// Good practice 
type UppercaseRole = Uppercase<Role>; // "ADMIN" | "USER" | "GUEST"
```

**02、Lowercase**

构造一个 Type 的所有属性都设置为小写的类型，与大写相反。

```
type Role = "ADMIN" | "USER" | "GUEST";
// Bad practice 
type LowercaseRole = "admin" | "user" | "guest";
// Good practice 
type LowercaseRole = Lowercase<Role>; // "admin" | "user" | "guest"
```

**03、Capitalize**

构造一个将 Type 的所有属性设置为大写的类型。

```
type Role = "admin" | "user" | "guest";
// Bad practice 
type CapitalizeRole = "Admin" | "User" | "Guest";
// Good practice 
type CapitalizeRole = Capitalize<Role>; // "Admin" | "User" | "Guest"
```

**04、Uncapitalize**

构造一个将 Type 的所有属性设置为 uncapitalize 的类型，与首字母大写相反。

```
type Role = "Admin" | "User" | "Guest";
// Bad practice 
type UncapitalizeRole = "admin" | "user" | "guest";
// Good practice 
type UncapitalizeRole = Uncapitalize<Role>; // "admin" | "user" | "guest"
```

**05、Partial**

构造一个类型，其中 Type 的所有属性都设置为可选。

```
interface User {
  name: string;
  age: number;
  password: string;
}
// Bad practice 
interface PartialUser {
  name?: string;
  age?: number;
  password?: string;
}
// Good practice 
type PartialUser = Partial<User>;
```

Required 构造一个类型，该类型由设置为 required 的 Type 的所有属性组成，Opposite 的对面。

```
interface User {
  name?: string;
  age?: number;
  password?: string;
}
// Bad practice 
interface RequiredUser {
  name: string;
  age: number;
  password: string;
}
// Good practice 
type RequiredUser = Required<User>;
```

**06、Readonly**

构造一个类型，该类型由设置为只读的 Type 的所有属性组成。

```
interface User {
  role: string;
}
// Bad practice 
const user: User = { role: "ADMIN" };
user.role = "USER";
// Good practice 
type ReadonlyUser = Readonly<User>;
const user: ReadonlyUser = { role: "ADMIN" };
user.role = "USER"; 
// Error: Cannot assign to 'role' because it is a read-only property.
```

**07、Record**

构造一个具有一组类型 T 的属性 K 的类型，每个属性 K 都映射到类型 T。

```
interface Address {
  street: string;
  pin: number;
}
interface Addresses {
  home: Address;
  office: Address;
}
// Alternative ✅
type AddressesRecord = Record<"home" | "office", Address>;
```

**08、Pick**  

只选择键在联合类型键中的 Type 的属性。

```
interface User {
  name: string;
  age: number;
  password: string;
}
// Bad practice 
interface UserPartial {
  name: string;
  age: number;
}
// Good practice 
type UserPartial = Pick<User, "name" | "age">;
```

**09、Omit**

Omit 其键在联合类型键中的 Type 属性。

```
interface User {
  name: string;
  age: number;
  password: string;
}
// Bad practice 
interface UserPartial {
  name: string;
  age: number;
}
// Good practice 
type UserPartial = Omit<User, "password">;
```

**10、Exclude**

构造一个具有 Type 的所有属性的类型，除了键在联合类型 Excluded 中的那些。

```
type Role = "ADMIN" | "USER" | "GUEST";
// Bad practice 
type NonAdminRole = "USER" | "GUEST";
// Good practice 
type NonAdmin = Exclude<Role, "ADMIN">; // "USER" | "GUEST"
```

**11、Extract**

构造一个具有 Type 的所有属性的类型，其键在联合类型 Extract 中。

```
type Role = "ADMIN" | "USER" | "GUEST";
// Bad practice 
type AdminRole = "ADMIN";
// Good practice 
type Admin = Extract<Role, "ADMIN">; // "ADMIN"
```

**12、NonNullable**

构造一个类型，其中 Type 的所有属性都设置为不可为空。

```
type Role = "ADMIN" | "USER" | null;
// Bad practice 
type NonNullableRole = "ADMIN" | "USER";
// Good practice 
type NonNullableRole = NonNullable<Role>; // "ADMIN" | "USER"
```

**总结**  

到这里，我今天要跟你分享的内容就全部结束了，希望你能从这篇文章中学到新的知识。  

最后，感谢你的阅读，编程愉快！

```
Node 社群







我组建了一个氛围特别好的 Node.js 社群，里面有很多 Node.js小伙伴，如果你对Node.js学习感兴趣的话（后续有计划也可以），我们可以一起进行Node.js相关的交流、学习、共建。下方加 考拉 好友回复「Node」即可。







如果你觉得这篇内容对你有帮助，我想请你帮我2个小忙：

1. 点个「在看」，让更多人也能看到这篇文章
2. 订阅官方博客 www.inode.club 让我们一起成长



点赞和在看就是最大的支持❤️
```