> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/YAJNlp4koymBTFd9w9X1rw)

### Challenge

在本次挑战中，您需要为 `Currying` 函数声明相应的类型，以帮助 TypeScript 编译器推断出正确的类型。

```
declare function Currying(fn: any): anyconst curried1 = Currying((a: string, b: number, c: boolean) => true)const curried2 = Currying((a: string, b: number, c: boolean, d: boolean, e: boolean, f: string, g: boolean) => true)const curried3 = Currying(() => true)type cases = [  Expect<Equal<    typeof curried1,     (a: string) => (b: number) => (c: boolean) => true>>,  Expect<Equal<    typeof curried2,     (a: string) => (b: number) => (c: boolean) => (d: boolean) => (e: boolean) => (f: string) => (g: boolean) => true  >>,  Expect<Equal<typeof curried3, () => true>>,]
```

在上面的代码中，我们使用了两个工具类型 `Expect` 和 `Equal`，它们的实现代码如下：

```
type Expect<T extends true> = Ttype Equal<X, Y> =  (<T>() => T extends X ? 1 : 2) extends  (<T>() => T extends Y ? 1 : 2) ? true : false
```

### Solution

首先，我们来分析一下第一个测试用例：

![](https://mmbiz.qpic.cn/mmbiz_jpg/jQmwTIFl1V0icianhDIH6zFpSqFzfu3Xk3j2u2ibAC9sF3T2RYe1xxEiaxW00zo0nfQwD5JBE5dtZvBsBC5wp7o1eg/640?wx_fmt=jpeg&from=appmsg)

由上图可知，我们需要获取参数列表的类型和函数的返回值类型。参数列表类型要包含参数的名称和参数的类型。那么如何获取函数类型的参数列表类型和返回值类型呢？这时我们可以使用 TypeScript 内置的 `Parameters` 和 `ReturnType` 工具类型。

```
type T0 = Parameters<() => true> // []type T1 = Parameters<(a: string, b: number, c: boolean) => true>// [a: string, b: number, c: boolean]type T2 = ReturnType<() => void> // voidtype T3 = ReturnType<(a: string, b: number, c: boolean) => true> // true
```

![](https://mmbiz.qpic.cn/mmbiz_jpg/jQmwTIFl1V0icianhDIH6zFpSqFzfu3Xk3ttIyRve8ZTnnAbtzGne1bvqjSofrhLSrh340LonCYDHrjxjEiac5rqA/640?wx_fmt=jpeg&from=appmsg)

在以上代码中，`Parameters` 工具类型用于获取函数类型的参数列表类型，它返回的是元组类型。而 `ReturnType` 工具类型则用于获取函数类型的返回值类型。它们的实现代码如下所示：

```
type Parameters<T extends (...args: any) => any> =   T extends (...args: infer P) => any ? P : never;  type ReturnType<T extends (...args: any) => any> =   T extends (...args: any) => infer R ? R : any;
```

在以上代码中，使用了 [TypeScript 条件类型](http://mp.weixin.qq.com/s?__biz=MzI2MjcxNTQ0Nw==&mid=2247499995&idx=1&sn=da2d91a35cfd2e8de26fece7aea7b8cf&chksm=ea446183dd33e89531e0b34e6f174691672ccfe70dfa5bcbfedc6a7e38fa108785f1288bd69b&scene=21#wechat_redirect)和 [infer 类型推断](http://mp.weixin.qq.com/s?__biz=MzI2MjcxNTQ0Nw==&mid=2247500019&idx=1&sn=8d7827d2ec38b57ca2be74995e3545fd&chksm=ea4461abdd33e8bd368b44e3d88bee5848b46f40993d0d5d535fb45a494db60dd8e3534e5aa3&scene=21#wechat_redirect)。了解完以上代码，我们就知道如何获取函数类型的参数列表类型和返回值类型了。

接下来，我们要实现的功能就是使用函数的参数类型和返回值类型生成新的函数类型。下面我们来定义一个新的 `ToCurrying` 工具类型，它包含两个类型变量 `Args` 和 `Return`，分别表示参数的类型和返回值类型：

```
type ToCurrying<Args extends unknown[], Return> = unknown
```

然后，我们来继续分析第一个测试用例：

```
const curried1 = Currying((a: string, b: number, c: boolean) => true)type cases = [  Expect<Equal< typeof curried1,    (a: string) => (b: number) => (c: boolean) => true>>]
```

![](https://mmbiz.qpic.cn/mmbiz_jpg/jQmwTIFl1V0icianhDIH6zFpSqFzfu3Xk3ZoGGy5Ym3mDibIZsZ84XicykmW6uqSBNynWSOhVaMNmskX4CSUXjFOFw/640?wx_fmt=jpeg&from=appmsg)

参考以上的图片，我们可以总结出 `ToCurrying` 工具类型的处理流程：

![](https://mmbiz.qpic.cn/mmbiz_jpg/jQmwTIFl1V0icianhDIH6zFpSqFzfu3Xk3AZNBmPWF9jj49X9tz28HQuvVr0icKloR6aXSQMibwGiaibCKC3bcLdiaa0A/640?wx_fmt=jpeg&from=appmsg)

根据上述的处理流程，我们可以利用 [TypeScript 条件类型](http://mp.weixin.qq.com/s?__biz=MzI2MjcxNTQ0Nw==&mid=2247499995&idx=1&sn=da2d91a35cfd2e8de26fece7aea7b8cf&chksm=ea446183dd33e89531e0b34e6f174691672ccfe70dfa5bcbfedc6a7e38fa108785f1288bd69b&scene=21#wechat_redirect)、[infer 类型推断](http://mp.weixin.qq.com/s?__biz=MzI2MjcxNTQ0Nw==&mid=2247500019&idx=1&sn=8d7827d2ec38b57ca2be74995e3545fd&chksm=ea4461abdd33e8bd368b44e3d88bee5848b46f40993d0d5d535fb45a494db60dd8e3534e5aa3&scene=21#wechat_redirect)和递归类型来实现对应的功能：

```
type ToCurrying<Args extends unknown[], Return> =   Args extends [...infer Head, infer Tail]    ? ToCurrying<Head, (arg: Tail) => Return>    : Return   type C0 = ToCurrying<[a: string, b: number, c: boolean], true>// (arg: string) => (arg: number) => (arg: boolean) => truetype C1 = ToCurrying<[a: string, b: number, c: boolean, d: boolean, e: boolean,   f: string, g: boolean], true>// (arg: string) => (arg: number) => (arg: boolean) => (arg: boolean) //   => (arg: boolean) => (arg: string) => (arg: boolean) => true
```

有了 `ToCurrying` 工具类型之后，我们来更新前面声明的 `Currying` 函数：

```
declare function Currying<T extends Function>(fn: T):    T extends (...args: infer Args) => infer Return ?    ToCurrying<Args, Return>    : never    const curried1 = Currying((a: string, b: number, c: boolean) => true)const curried2 = Currying((a: string, b: number, c: boolean, d: boolean, e: boolean, f: string, g: boolean) => true)const curried3 = Currying(() => true)type cases = [  Expect<Equal<    typeof curried1,     (a: string) => (b: number) => (c: boolean) => true>>,  Expect<Equal<    typeof curried2,     (a: string) => (b: number) => (c: boolean) => (d: boolean) => (e: boolean)        => (f: string) => (g: boolean) => true  >>,  Expect<Equal<typeof curried3, () => true>>,]
```

更新后的 `Currying` 函数，已经可以满足前两个测试用例。但还不能满足最后一个测试用例：

![](https://mmbiz.qpic.cn/mmbiz_png/jQmwTIFl1V0icianhDIH6zFpSqFzfu3Xk3xKzJ5Ht1txgpVYOxQ0tFwVBXNvcqq111mibaafOiaNftNuPEDc3vmOhA/640?wx_fmt=png&from=appmsg)

这是因为获取 `() => true` 函数类型的参数列表类型时，返回的是空元组类型，针对这种情形，我们需要进行对应的处理：

```
declare function Currying<T extends Function>(fn: T):    T extends (...args: infer Args) => infer Return ?    Args extends []     ? () => Return    : ToCurrying<Args, Return>    : never
```

在以上代码中，当发现 `Args` 类型变量对应的类型是空元组类型的话，我们直接返回 `() => Return` 函数类型。之后，我们就通过了所有的测试用例。最后，我们来看一下完整的代码：

```
declare function Currying<T extends Function>(fn: T):    T extends (...args: infer Args) => infer Return ?    Args extends []    ? () => Return    : ToCurrying<Args, Return>    : nevertype ToCurrying<Args extends unknown[], Return> =    Args extends [...infer Head, infer Tail]    ? ToCurrying<Head, (arg: Tail) => Return>    : Return
```