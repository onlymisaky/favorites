> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/GX1tHLKVljcLbq8a3HyQtw)

点击上方 前端瓶子君，关注公众号  

回复算法，加入前端编程面试算法每日一题群

![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQTfNQuBJ6hczD0R1UzTA7Sw8AZxe9mxIRMEAev3lVrlApsiczSQz6BMUAZkRqKe9GhC3tibbhEqxu6g/640?wx_fmt=jpeg)

来源：阳呀呀

https://segmentfault.com/a/1190000039834284

接口和类型别名非常相似，在大多情况下二者可以互换。在写 TS 的时候，想必大家都问过自己这个问题，我到底应该用哪个呢？希望看完本文会给你一个答案。知道什么时候应该用哪个，首先应该了解二者之间的相同点和不同点，再做出选择。

### 接口 vs 类型别名 相同点

#### 1. 都可以用来描述对象或函数

```
interface Point {  x: number  y: number}interface SetPoint {  (x: number, y: number): void;}
```

```
type Point = {  x: number;  y: number;};type SetPoint = (x: number, y: number) => void;
```

#### 2. 都可以扩展

两者的扩展方式不同，但并不互斥。接口可以扩展类型别名，同理，类型别名也可以扩展接口。

接口的扩展就是继承，通过 `extends` 来实现。类型别名的扩展就是交叉类型，通过 `&` 来实现。

```
// 接口扩展接口interface PointX {    x: number}interface Point extends PointX {    y: number}
```

```
// 类型别名扩展类型别名type PointX = {    x: number}type Point = PointX & {    y: number}
```

```
// 接口扩展类型别名type PointX = {    x: number}interface Point extends PointX {    y: number}
```

```
// 类型别名扩展接口interface PointX {    x: number}type Point = PointX & {    y: number}
```

### 接口 vs 类型别名不同点

#### 1. 类型别名更通用（接口只能声明对象，不能重命名基本类型）

类型别名的右边可以是任何类型，包括基本类型、元祖、类型表达式（`&`或`|`等类型运算符）；而在接口声明中，右边必须为结构。例如，下面的类型别名就不能转换成接口：

```
type A = numbertype B = A | string
```

#### 2. 扩展时表现不同

扩展接口时，TS 将检查扩展的接口是否可以赋值给被扩展的接口。举例如下：

```
interface A {    good(x: number): string,    bad(x: number): string}interface B extends A {    good(x: string | number) : string,    bad(x: number): number // Interface 'B' incorrectly extends interface 'A'.                           // Types of property 'bad' are incompatible.                           // Type '(x: number) => number' is not assignable to type '(x: number) => string'.                           // Type 'number' is not assignable to type 'string'.}
```

但使用交集类型时则不会出现这种情况。我们将上述代码中的接口改写成类型别名，把 `extends` 换成交集运算符 `&`，TS 将尽其所能把扩展和被扩展的类型组合在一起，而不会抛出编译时错误。

```
type A = {    good(x: number): string,    bad(x: number): string}type B = A & {     good(x: string | number) : string,     bad(x: number): number }
```

#### 3. 多次定义时表现不同

接口可以定义多次，多次的声明会合并。但是类型别名如果定义多次，会报错。

```
interface Point {    x: number}interface Point {    y: number}const point: Point = {x:1} // Property 'y' is missing in type '{ x: number; }' but required in type 'Point'.const point: Point = {x:1, y:1} // 正确
```

```
type Point = {    x: number // Duplicate identifier 'A'.}type Point = {    y: number // Duplicate identifier 'A'.}
```

### 到底应该用哪个

如果接口和类型别名都能满足的情况下，到底应该用哪个是我们关心的问题。感觉哪个都可以，但是强烈建议大家只要能用接口实现的就优先使用接口，接口满足不了的再用类型别名。

为什么会这么建议呢？其实在 TS 的 wiki 中有说明。具体的文章地址在这里。

以下是`Preferring Interfaces Over Intersections`的译文：

> 大多数时候，对于声明一个对象，类型别名和接口表现的很相似。
> 
> ```
> interface Foo { prop: string }type Bar = { prop: string };
> ```
> 
> 然而，当你需要通过组合两个或者两个以上的类型实现其他类型时，可以选择使用接口来扩展类型，也可以通过交叉类型（使用 `&` 创造出来的类型）来完成，这就是二者开始有区别的时候了。
> 
> *   接口会创建一个单一扁平对象类型来检测属性冲突，当有属性冲突时会提示，而交叉类型只是递归的进行属性合并，在某种情况下可能产生 `never` 类型
>     
> *   接口通常表现的更好，而交叉类型做为其他交叉类型的一部分时，直观上表现不出来，还是会认为是不同基本类型的组合
>     
> *   接口之间的继承关系会缓存，而交叉类型会被看成组合起来的一个整体
>     
> *   在检查一个目标交叉类型时，在检查到目标类型之前会先检查每一个组分
>     

上述的几个区别从字面上理解还是有些绕，下面通过具体的列子来说明。

```
interface Point1 {    x: number}interface Point extends Point1 {    x: string // Interface 'Point' incorrectly extends interface 'Point1'.              // Types of property 'x' are incompatible.              // Type 'string' is not assignable to type 'number'.}
```

```
type Point1 = {    x: number}type Point2 = {    x: string}type Point = Point1 & Point2 // 这时的Point是一个'number & string'类型，也就是never
```

从上述代码可以看出，接口继承同名属性不满足定义会报错，而相交类型就是简单的合并，最后产生了 `number & string` 类型，可以解释译文中的第一点不同，其实也就是我们在不同点模块中介绍的扩展时表现不同。

再来看下面例子：

```
interface PointX {    x: number}interface PointY {    y: number}interface PointZ {    z: number}interface PointXY extends PointX, PointY {}interface Point extends PointXY, PointZ {   }const point: Point = {x: 1, y: 1} // Property 'z' is missing in type '{ x: number; y: number; }' but required in type 'Point'
```

```
type PointX = {    x: number}type PointY = {    y: number}type PointZ = {    z: number}type PointXY = PointX & PointYtype Point = PointXY & PointZconst point: Point = {x: 1, y: 1} // Type '{ x: number; y: number; }' is not assignable to type 'Point'.                                  // Property 'z' is missing in type '{ x: number; y: number; }' but required in type 'Point3'.
```

从报错中可以看出，当使用接口时，报错会准确定位到 Point。但是使用交叉类型时，虽然我们的 `Point` 交叉类型是 `PointXY & PointZ`， 但是在报错的时候定位并不在 `Point` 中，而是在 `Point3` 中，即使我们的 `Point` 类型并没有直接引用 `Point3` 类型。

如果我们把鼠标放在交叉类型 `Point` 类型上，提示的也是 `type Point = PointX & PointY & PointZ`，而不是 `PointXY & PointZ`。

这个例子可以同时解释译文中第二个和最后一个不同点。

### 结论

有的同学可能会问，如果我不需要组合只是单纯的定义类型的时候，是不是就可以随便用了。但是为了代码的可扩展性，建议还是优先使用接口。现在不需要，谁能知道后续需不需要呢？所以，让我们大胆的使用接口吧~

最后
--

欢迎关注【前端瓶子君】✿✿ヽ (°▽°) ノ✿  

回复「算法」，加入前端编程源码算法群，每日一道面试题（工作日），第二天瓶子君都会很认真的解答哟！  

回复「交流」，吹吹水、聊聊技术、吐吐槽！

回复「阅读」，每日刷刷高质量好文！

如果这篇文章对你有帮助，「在看」是最大的支持  

》》面试官也在看的算法资料《《  

“在看和转发” 就是最大的支持