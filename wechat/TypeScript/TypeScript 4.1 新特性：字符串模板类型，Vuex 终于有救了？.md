> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/syTFLiIWU1KRnph3TIGIOw)

TypeScript 4.1 快要发布了，老爷子 Anders Hejlsberg[1] 加入了一项重大更新，**「字符串模板类型」** 的支持。昨天看到这个更新的我特别兴奋，曾几何时，只要一遇到字符串拼接相关的类型，TypeScript 就束手无策了，比如：

*   `Vuex` 中加了 `namespace` 以后，`dispatch` 一个 `mutation type` 会带上前缀 `dispatch('cart/add')`。
    
*   `lodash` 的 `get` 方法，可以对一个对象进行 `get(obj, 'a.b.c')` 这样的读取。
    

现在 4.1 加入的这个新功能让这一切都拥有了可能。

基础语法
----

它的语法和 es 里的字符串模板很相似，所以上手成本也很低，先看几个例子：

```
type EventName<T extends string> = `${T}Changed`;type T0 = EventName<'foo'>;  // 'fooChanged'type T1 = EventName<'foo' | 'bar' | 'baz'>;  // 'fooChanged' | 'barChanged' | 'bazChanged'
```

```
type Concat<S1 extends string, S2 extends string> = `${S1}${S2}`;type T2 = Concat<'Hello', 'World'>;  // 'HelloWorld'
```

字符串模板中的联合类型会被展开后排列组合：

```
type T3 = `${'top' | 'bottom'}-${'left' | 'right'}`;// 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
```

新增关键字
-----

为了这个功能，老爷子在 TS 中新增了 `uppercase`, `lowercase`, `capitalize`, `uncapitalize` 这些关键字，用于对模板粒度字符串变量进行处理。

```
type Cases<T extends string> = `${uppercase T} ${lowercase T} ${capitalize T} ${uncapitalize T}`;type T11 = Cases<'bar'>;  // 'BAR bar Bar bar'
```

其实很简单，就是提供了几个处理方法：大写、小写，首字母大写，首字母小写。

配合 infer
--------

特别强大的一点是，模板字符串可以通过 `infer` 关键字，实现类似于正则匹配提取的功能：

```
type MatchPair<S extends string> = S extends `[${infer A},${infer B}]` ? [A, B] : unknown;type T20 = MatchPair<'[1,2]'>;  // ['1', '2']type T21 = MatchPair<'[foo,bar]'>;  // ['foo', 'bar']
```

通过 `,` 分割左右两边，再在左右两边分别用一个 `infer` 泛型接受推断值 `[${infer A},${infer B}]`，就可以轻松的重新组合 `,` 两边的字符串。

配合 `...` 拓展运算符和 `infer`递归，甚至可以实现 `Join` 功能：

```
type Join<T extends (string | number | boolean | bigint)[], D extends string> =    T extends [] ? '' :    T extends [unknown] ? `${T[0]}` :    T extends [unknown, ...infer U] ? `${T[0]}${D}${Join<U, D>}` :    string;type T30 = Join<[1, 2, 3, 4], '.'>;  // '1.2.3.4'type T31 = Join<['foo', 'bar', 'baz'], '-'>;  // 'foo-bar-baz'
```

实战运用
----

### 实现 Vuex namespace 推断：

```
type VuexOptions<M, N> = {   namespace?: N,   mutations: M,}type Action<M, N> = N extends string ? `${N}/${keyof M & string}` : keyof Mtype Store<M, N> = {   dispatch(action: Action<M, N>): void}declare function Vuex<M, N>(options: VuexOptions<M, N>): Store<M, N>const store = Vuex({   namespace: "cart" as const,   mutations: {      add() { },      remove() { }   }})store.dispatch("cart/add")store.dispatch("cart/remove")
```

前往 Playground[2] 尝试一下~

### 实现 lodash get 函数：

```
type PropType<T, Path extends string> =    string extends Path ? unknown :    Path extends keyof T ? T[Path] :    Path extends `${infer K}.${infer R}` ? K extends keyof T ? PropType<T[K], R> : unknown :    unknown;declare function get<T, P extends string>(obj: T, path: P): PropType<T, P>;const obj = { a: { b: {c: 42, d: 'hello' }}};const value = get(obj, "a.b.c")
```

前往 Playground[3] 尝试一下~

总结
--

TypeScript 4.1 带来的这个新功能让 TS 支持更多字符串相关的拼接场景，其实是特别实用的，希望各位看了以后都能有所收获~

### 参考资料

[1]

Anders Hejlsberg: _https://github.com/ahejlsberg_

[2]

Playground: _https://www.typescriptlang.org/play?ts=4.1.0-pr-40336-8#code/C4TwDgpgBAagrhAHgeTMAlgewHYGcA8AsgDRQByAfFALxQDeAUFM9gIYC2EuYrAxhAH4AXOWJNm7OMFYYcuESQYBfBg1CQoAQV6zsRUpRrkoSYBGwATXFFzAATumwBzKAKgADACR0ySgPTeANYQIJgAZlCEUABkNvaOTkruUCLBoRGEqurQAMrAmHYQ+uRUtIzMUBbo3DK8ABYAFHy6Itq6xZQAlCIAbpjoFsqqFhC8ADashVBhcNg6WNiwCIgdFA2YaAvyS0iougQkJd1QeQVFh5SqvHLAcWdG8EgN5SwcXDz8IgBEvJPAX1BWNZrnhgGIKpJpPsRC8KoCLBYGp16FAlOC4VBCuxMD0IEiUSoKiolJ1VLYzgA6Ko1YD1Bo-P5+VgIr6k8mFKnVHi0xoMuzAPxYnEQVlAA_

[3]

Playground: _https://www.typescriptlang.org/play?ts=4.1.0-pr-40336-8#code/C4TwDgpgBACgTgezAFXBAPMgNLAhsACyggA9gIA7AEwGcobg4BLCgcwD4oBeAKCn-qMWrYmUq08hKAH4oAVwoBrCggDuFKAC4+AmPiKly1OooggEAMyjIZ1gNp7CAXS07+jg2ONQABgBIAbxYLCDgoAGkAXwA6QODQqAAlSJ9bcNEjCVNzKxtZeCRUSEw7cKccRM5NeSUVdVcBGuU1CgBuHh4qCABjABtcOGgLBW7gJgQNVghgTBwYDPE6BmY2dgAKBAAjACtq7CgwfWqYAEpjxBQ0Wdh2dp5uiYYoLe3uKACoXGqPze-u6oALAAmHBUaoAcgIEF6vQQ4KgkURdweFCeADdcL05NAuFApsANjscAAiXDRTbRbrEk5AA_

关于奇舞团
-----

奇舞团是 360 集团最大的大前端团队，代表集团参与 W3C 和 ECMA 会员（TC39）工作。奇舞团非常重视人才培养，有工程师、讲师、翻译官、业务接口人、团队 Leader 等多种发展方向供员工选择，并辅以提供相应的技术力、专业力、通用力、领导力等培训课程。奇舞团以开放和求贤的心态欢迎各种优秀人才关注和加入奇舞团。

![](https://mmbiz.qpic.cn/mmbiz_jpg/MpGQUHiaib4ib4fjyialh63Vwd0hbjzCz6eLQ84QVLX8patZwMvNtiaCnHYTWrfvnibfibZlousoLqp88aSJlQuKTsjiaQ/640?wx_fmt=jpeg)