> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/36x-zQ2e0ZcVam0YdpR7_A)

索引类型是 TypeScript 中的常见类型，它是聚合多个元素的类型，对象、类、元组等都是索引类型。

比如这样：

```
type Person = {    name: string;    age: number;    hobbies: string[]}
```

对索引类型做变换会用到映射类型的语法，它可以对索引类型的索引和值做一些变换，然后产生新的索引类型。

比如给每个索引加上 readonly 的修饰：

```
type ToReadonly<Obj> = {    readonly [Key in keyof Obj]: Obj[Key]}
```

返回的就是修改后的索引类型：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGjs2PicaibXeL3xKUPmiaKXvuqK1HP64yZYsiaHGaWMibloWw9Bz4zuarPQicqnSVpME1BafXx5FRLzyGvw/640?wx_fmt=png)

TypeScript 也内置了很多基于映射类型实现的工具类型，比如 Partial、Required 等。

总之，会了映射类型就能够对索引类型做各种变换了。

但是，这些都是对索引类型整体做的变换，变换的结果依然是一个索引类型。

有的时候是想把它们分开的。比如这种需求：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGjs2PicaibXeL3xKUPmiaKXvuqrpccXibfXxrfuUIZFia3ibL1wrVdibc8QGIVte8690m3pvLr38UaDvRybA/640?wx_fmt=png)

希望能把每个索引给分开。

这种怎么处理呢？

我是这样写的：

```
type SplitObj<Obj> = {    [Key in keyof Obj]: {        [Key2 in Key]: Obj[Key2]    }}[keyof Obj];
```

先看结果：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGjs2PicaibXeL3xKUPmiaKXvuqA19w54vJelqTUu5IZ0BjmMfb2X2wabB2B8bzibBnCIPZQOuyPx0Eb0Q/640?wx_fmt=png)

确实把每个索引给分开了。

再来讲为什么：

keyof Obj 我们知道是 key 构成的联合类型'name' | 'age' | 'height'。

外层映射类型 [Key in keyof Obj] 就是对每个 Key 做处理，它值也是一个映射类型，而 Key2 来自于刚才的 Key，那么这样映射完之后的类型就是这样的：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGjs2PicaibXeL3xKUPmiaKXvuq1XHcr1TXxmaahuR0iaRxCEtI5gEGAwyODexk8yhsjuntFAxNX0UuSsg/640?wx_fmt=png)

这时你取 name 的值就是这样的：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGjs2PicaibXeL3xKUPmiaKXvuqyASDxTvSSicRtueFazmSNlwaYUgNXiclbSvYoQLVbA9BBhX4EsSuDyng/640?wx_fmt=png)

而传入联合类型的时候，会分别传入每个类型做处理，也就是这样的：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGjs2PicaibXeL3xKUPmiaKXvuqehI7iaiapCqeYf6PqeTf42ibhFhAqBwCHUmOMEUnmmZGydJFJkxmuPMKw/640?wx_fmt=png)

所以直接在这里取 keyof Obj 的所有索引值：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGjs2PicaibXeL3xKUPmiaKXvuqTA4Iicibq4NaD84aibWkrIvXHE5Bv9adyTJWibian2Odr9a9d7fbyfjfStw/640?wx_fmt=png)

总结一下：**当我们需要把索引分开的时候，可以加一层映射类型，在值的位置对每个索引做处理，然后再传入 keyof Xxx 来取处理过后的值的联合类型。**

这种套路还是很有用的，比如下面这个更复杂一点的案例：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGjs2PicaibXeL3xKUPmiaKXvuqcAPwl4W6UN8NIB9uF1etW4aOdN2Onqz40jP6QN8aicxoS5slphJsO6Q/640?wx_fmt=png)

给你一个索引类型，让你拿到所有索引的路径。

怎么做呢？

这里明显要对每个索引都做路径的处理，然后把所有的路径合并。

根据刚才学过的写法，可以这样写：

```
type DFS<Obj> = {  [Key in keyof Obj]: Key}[keyof Obj];
```

这样就能把每个索引分开处理：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGjs2PicaibXeL3xKUPmiaKXvuqZ4EbtIFlGO6U7MoULUoYCRLahLTVo8WZ9m9ekHA7R9fktlJHQ5OweA/640?wx_fmt=png)

然后具体的处理是需要递归的，如果值是索引类型就继续递归，否则就结束。递归过程中记录下路径。

```
type DFS<Obj> = {  [Key in keyof Obj]:     Key extends string      ? Obj[Key] extends Record<string, any>        ? Key | `${Key}.${DFS<Obj[Key]>}`        : Key      : never}[keyof Obj];
```

这里因为 Key 默认推导出来的不是 string，所以加一层 Key extends string 的判断之后，再用 Key 的时候就是 string 了。

判断 Obj[Key] 是不是索引类型，也就是是不是 Record<string, any>，如果是就递归调用 DFS，并且记录当前路径到结果里，如果不是就返回当前 Key。

这样的结果就是对每个索引做了递归的处理，并且把所有索引的处理结果合并到了一起：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGjs2PicaibXeL3xKUPmiaKXvuqropYJIh0N5VQyuQRuiaGgoxcURbejib9J7dKEiaEjNHlWAAiaX8rclC6pw/640?wx_fmt=png)

回顾下这个案例，它也是要把每个索引的处理结果分开，通过联合类型合并在一起。具体每个索引是做递归的处理，记录路径。

总结
--

索引类型是 TypeScript 中的常见类型，可以通过映射类型的语法来对它做一些修改，生成新的索引类型。

但如果你想对每个索引分别做处理，并且把结果合并为一个联合类型的时候，可以加一层映射类型来分别处理每个索引，再取 keyof Xxx，也就是每个索引类型的处理结果构成的联合类型。

这种套路在需要把索引分开处理，再把结果合并的场景下是很有用的。