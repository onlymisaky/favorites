> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/xriS7o7wuFu3FptJXq9CEA)

大厂技术  高级前端  精选文章

点击上方 全站前端精选，关注公众号

回复 1，加入高级前段交流群

![](https://mmbiz.qpic.cn/mmbiz_png/KV8By3euEQgaNLCicEBS7TRf2w0bxkVlUfTvQyFXcEicrZicC79oGrzznias4y4UGuU3N0s398FmXUJw6WXZXAQyFg/640?wx_fmt=png)题图

业务字典
----

在业务开发中，我们常常需要定义一些枚举值。假设我们正在开发一款音乐应用，我们需要定义音乐的类型，以便在业务代码中进行业务逻辑判断：

```
const MUSIC_TYPE = {  POP: 1,  ROCK: 2,  RAP: 3,  // ...};if (data.type === MUSIC_TYPE.POP) {  // 当音乐类型为流行音乐时，执行某些逻辑}
```

随着业务逻辑的扩展，简单的枚举值往往会衍生出许多关联的字典。比如，我们需要定义一个音乐的类型对应的名称

```
const MUSIC_TYPE_NAMES = {  [MUSIC_TYPE.POP]: '流行音乐',  [MUSIC_TYPE.ROCK]: '摇滚音乐',  [MUSIC_TYPE.RAP]: '说唱音乐',  // ...};// 展示音乐类型名称<div>{MUSIC_TYPE_NAMES[data.type]}</div>
```

或者需要定义一个音乐类型对应的图标：

```
const MUSIC_TYPE_ICONS = {  [MUSIC_TYPE.POP]: 'pop.svg',  [MUSIC_TYPE.ROCK]: 'rock.svg',  [MUSIC_TYPE.RAP]: 'rap.svg',  // ...};// 展示音乐类型图标<img src={MUSIC_TYPE_ICONS[data.type]} />
```

在列表场景下，我们可能需要定义一个数组形式的字典：

```
const MUSIC_TYPE_LIST = [  {    type: MUSIC_TYPE.POP,    name: '流行音乐',    icon: 'pop.svg',  },  {    type: MUSIC_TYPE.ROCK,    name: '摇滚音乐',    icon: 'rock.svg',  },  {    type: MUSIC_TYPE.RAP,    name: '说唱音乐',    icon: 'rap.svg',  },  // ...];<div>  {MUSIC_TYPE_LIST.map((item) => (    <div>      <img src={item.icon} />      <span>{item.name}</span>    </div>  ))}</div>;
```

又或者希望使用 key-object 形式避免从多个字典取值：

```
const MUSIC_TYPE_MAP_BY_VALUE = {  [MUSIC_TYPE.POP]: {    name: '流行音乐',    icon: 'pop.svg',  },  [MUSIC_TYPE.ROCK]: {    name: '摇滚音乐',    icon: 'rock.svg',  },  [MUSIC_TYPE.RAP]: {    name: '说唱音乐',    icon: 'rap.svg',  },  // ...};const musicTypeInfo = MUSIC_TYPE_MAP_BY_VALUE[data.type];<div>{musicTypeInfo.name}:{musicTypeInfo.icon}</div>;
```

这些形态各异的业务字典同时存在会给代码带来重复和混乱。

当我们需要变更或增删某个类型或者类型中的某个值时，需要同时修改多个字典，很容易出现遗漏和错误，尤其是当这些字典定义分布在不同的文件中。

对于使用者来说，散乱的字典定义也是一种负担。在业务中使用某个字典时，需要先查找已有的字典并理解其定义。如果已有字典不能完全满足需求，可能会有新的字典被定义，进一步增加业务字典的混乱程度。

字典工厂函数
------

我们可以实现一个工具函数，将一份定义转换成多种格式的字典。

首先考虑入参的格式。显然作为原始数据，入参必须能够包含完整的字典信息，包括键，值，所有扩展字段，甚至列表场景中的展示顺序。

我们可以使用对象数组作为入参：

```
/** * list 示例： * [ *   { *    key: 'POP', *    value: 1, *    name: '流行音乐', *   }, *   { *     key: 'ROCK', *     value: 2, *     name: '摇滚音乐', *   }, *   // ... * ] */function defineConstants(list) {  // ...}
```

接下来考虑出参的格式。出参应该是一个对象，包含多种格式的字典：

```
const { KV, VK, LIST, MAP_BY_KEY, MAP_BY_VALUE } = defineConstants([  {    key: 'POP',    value: 1,    name: '流行音乐',  },  {    key: 'ROCK',    value: 2,    name: '摇滚音乐',  },  // ...]);KV; // { POP: 1, ROCK: 2, ... }VK; // { 1: 'POP', 2: 'ROCK', ... }LIST; // [{ key: 'POP', value: 1, name: '流行音乐' }, { key: 'ROCK', value: 2, name: '摇滚音乐' }, ...]MAP_BY_KEY; // { POP: { key: 'POP', value: 1, name: '流行音乐' }, ROCK: { key: 'ROCK', value: 2, name: '摇滚音乐' }, ... }MAP_BY_VALUE; // { 1: { key: 'POP', value: 1, name: '流行音乐' }, 2: { key: 'ROCK', value: 2, name: '摇滚音乐' }, ... }
```

在实际业务中，我们会为不同的资源定义字典，因此我们需要为工具函数提供命名空间。使用第二个入参为出参中的 key 增加前缀：

```
const {  MUSIC_TYPE_KV,  MUSIC_TYPE_VK,  MUSIC_TYPE_LIST,  MUSIC_TYPE_MAP_BY_KEY,  MUSIC_TYPE_MAP_BY_VALUE,} = defineConstants(  [    {      key: 'POP',      value: 1,      name: '流行音乐',    },    {      key: 'ROCK',      value: 2,      name: '摇滚音乐',    },    // ...  ],  'MUSIC_TYPE',);
```

至此，我们完成了字典工厂函数的设计。这个函数的 JavaScript 实现并不复杂，你可能已经在一些项目中过见过类似的工具函数，但是实际使用时会发现一个问题。

使用 TypeScript 实现类型提示
--------------------

使用字典工厂定义业务字典可以让代码更简洁并且规范字典数据格式。然而，相比直接定义，字典工厂的缺点是无法提供类型提示。

![](https://mmbiz.qpic.cn/mmbiz_png/KV8By3euEQgaNLCicEBS7TRf2w0bxkVlUg5nOhgYQ6gGWnRp4ibn4dUmUWMmcWS1GGgMbu4v2rPztnfhibRiaDw0xA/640?wx_fmt=png)

这给开发者在两个层面带来了不便，一是在定义字典时需要对工具函数的使用和实现有一定了解，这样才能正确传入参数和解构返回值；二是在使用字典时无法获得类型提示，使用字典的开发者需要回来查看定义了哪些字段和值，同时还需要了解工具函数的使用方式。

为了解决这个问题，我们可以使用 TypeScript 来实现字典工厂函数。以下内容涉及 TypeScript 类型系统的一些特性和一些技巧。

### `LIST` 字典的实现

首先实现最简单的 `LIST` 字典，因为它和入参一模一样：

```
interface IBaseDef {  key: PropertyKey;  value: string | number;}function defineConstants<T extends IBaseDef[], N extends string>(  defs: T,  namespace?: N,) {  const prefix = namespace ? `${namespace}_` : '';  return {    [`${prefix}LIST`]: defs,  };}
```

我们用 `IBaseDef` 来规范入参中字典项的类型，它包含 `key` 和 `value` 两个字段。`key` 的类型是 `PropertyKey`，它是 `string | number | symbol` 的联合类型，即 key 的值可以是这三种类型中的任意一种。`value` 的类型是 `string | number`，之所以没有 `symbol` 是因为业务中 `value` 的值可能会从外部获取，而 `key` 的值可以是运行时产生的。这两个字段是定义字典必须的，其他字段可以根据业务需要任意添加。

在 `defineConstants` 函数中，我们使用范型来分别表示两个入参的类型并且使用 `extends` 关键字来约束范型的类型。`T` 的类型是 `IBaseDef[]`，保证入参 `defs` 的格式符合字典项数组。`N` 的类型是 `string`，保证入参 `namespace` 是一个字符串。

`namespace` 参数是可选的，如果定义字典时未传入，那么返回的字典 Key 也不会有前缀。因此我们需要创建一个 `prefix` 变量并根据 `namespace` 是否存在来决定它的值。

然后我们返回一个只有 `LIST` 字典的对象，它的 Key 由 `prefix` 和 `LIST` 拼接而成，值就是入参 `defs`。

这段代码的运行逻辑没有问题，但是它缺少了返回值的类型定义，通过 IDE 的代码提示并不能获取到正确的字典 key：

![](https://mmbiz.qpic.cn/mmbiz_png/KV8By3euEQgaNLCicEBS7TRf2w0bxkVlUr2M0qrOibpx1Ngh1eS4WfPQlvjS4RzBv5zFCia37gCpQicdgEC97xq9Vg/640?wx_fmt=png)

当你在 IDE 中查看 `dicts` 的类型时，IDE 并不会真的去执行 JavaScript 代码，而是通过 TypeScript 的类型系统来生成类型。

因此，我们需要使用类型系统定义 `defineConstants` 的返回类型。

```
type ToProperty<  Property extends string,  N extends string = '',> = N extends '' ? Property : `${N}_${Property}`;
```

这里我们定义了一个类型用于生成字典的 Key。它接收两个范型参数，`Property` 表示字典的属性，`N` 表示字典的命名空间。如果 `N` 为空字符串，那么返回的 Key 就是 `Property`，否则就是 `${N}_${Property}`。

这段代码中有一些 JavaScript 语法的影子，比如字符串，默认参数值，三元运算符，模板字符串等。但是这些都是在 TypeScript 类型系统中运行的，可以看作是一套独立的语言。例如它并没有 if...else 语句，这里的三元运算实际是条件类型（Conditional Types）[1] 的语法，当 `N` 的类型符合 `''` 时，返回 `Property`，否则返回 `${N}_${Property}`。

你可以把这样的类型定义看作类型系统中的「函数」。不同于 JavaScript 函数通过入参接收值并且返回新的值，它通过范型接收类型并且返回新的类型。

现在我们可以使用 `ToProperty` 来生成字典的 Key 的类型：

![](https://mmbiz.qpic.cn/mmbiz_png/KV8By3euEQgaNLCicEBS7TRf2w0bxkVlUnIjgcOKmeKXwaibtaqWYT23sQDcA4K5GrjibibicKRIvo6r7Vsibhyb0Lpw/640?wx_fmt=png)

接下来使用 `ToProperty` 结合映射类型 (Mapped Types）[2] 和类型断言（Type Assertions）[3] 指定 `defineConstants` 的返回类型：

```
function defineConstants<T extends IBaseDef[], N extends string>(  defs: T,  namespace?: N,) {  const prefix = namespace ? `${namespace}_` : '';  return {    [`${prefix}LIST`]: defs,  } as {    [Key in ToProperty<'LIST', N>]: T;  };}
```

`as` 关键字在类型系统中表示类型断言，是一种手动指定类型的方法。它允许你告诉编译器一个变量或值的类型是什么，而不是让编译器自动推断。

而类型映射是一种将已有类型转换为具有指定键值的新类型的方法。我们生成了一个新的对象类型，它的键是 `ToProperty<'LIST', N>`，值是 `T`。

将这些结合起来，`defineConstants` 函数终于可以返回一个支持类型提示的字典了：

![](https://mmbiz.qpic.cn/mmbiz_png/KV8By3euEQgaNLCicEBS7TRf2w0bxkVlUVEiciaZ92FHeldamXaBiaYEuKgEdR00DPkRsjiajBBCeupwThA9z63I7wQ/640?wx_fmt=png)

`KV` 字典的实现
----------

接下来增加 `KV` 字典，它是一个键值对，键和值分别来自入参字典项中的 `key` 和 `value` 属性。

```
function defineConstants<T extends readonly IBaseDef[], N extends string>(  defs: T,  namespace?: N,) {  const prefix = namespace ? `${namespace}_` : '';  return {    [`${prefix}LIST`]: defs,    [`${prefix}KV`]: defs.reduce(      (map, item) => ({        ...map,        [item.key]: item.value,      }),      {},    ),  } as MergeIntersection<    {      [Key in ToProperty<'LIST', N>]: T;    } & {      [Key in ToProperty<'KV', N>]: {        [Key in ToProperty<'KV', N>]: ToKeyValue<T>;      };    }  >;}
```

这段代码增加了`MergeIntersection`，`ToSingleKeyValue` 和 `ToKeyValue` 三个类型转换「函数」，并且将范型 T 进一步约束为 readonly。接下来将一一解释这些类型转换的作用和实现以及为什么 T 必须是 readonly。

`MergeIntersection` 用于合并交叉类型。

由于我们的实现中不同字典类型是通过映射类型生成的，我们需要使用交叉类型（Intersection Types）[4] 将它们合并，当合并多个类型后会变得难以阅读。

![](https://mmbiz.qpic.cn/mmbiz_png/KV8By3euEQgaNLCicEBS7TRf2w0bxkVlUxDUkr2fQeklOooZ54Mbxzw8q7X1c7Oh3rPZpfHKDHtrG8n9aOxX1cg/640?wx_fmt=png)

使用 `MergeIntersection` 可以将交叉类型合并为一个类型，在视觉上更加清晰，也便于后续处理：

![](https://mmbiz.qpic.cn/mmbiz_png/KV8By3euEQgaNLCicEBS7TRf2w0bxkVlUUKNpDVzqf3g97LEpZOo7SlhdO0SKTBPS2vG3yEP2Gwricy5KU89Jf9Q/640?wx_fmt=png)

`MergeIntersection` 的实现：

```
type MergeIntersection<A> = A extends infer T  ? { [Key in keyof T]: T[Key] }  : never;
```

这里我们再次使用了条件类型和映射类型。而 `infer` 关键字则是类型推断（Type Inference）[5] 的语法，它可以让我们在条件类型中获取类型变量的具体类型并用于后续的映射类型。

由于 `infer` 总能推断出一个类型，所以条件类型的第二个结果永远不会出现，因此我们可以使用 `never` 类型。

`ToSingleKeyValue` 用于将单个字典项转换为键值对：

![](https://mmbiz.qpic.cn/mmbiz_png/KV8By3euEQgaNLCicEBS7TRf2w0bxkVlUkepW41ekLepc6mdiacyBoPs3F1aia16d5TUyI1X5gkprlvHFYkI4fb4w/640?wx_fmt=png)

`ToSingleKeyValue` 的实现：

```
type ToSingleKeyValue<T> = T extends {  readonly key: infer K;  readonly value: infer V;}  ? K extends PropertyKey    ? {        [Key in K]: V;      }    : never  : never;
```

我们使用 `infer` 关键字获取 `key` 和 `value` 的具体类型并且在一个条件类型使用他们。然后在第二个条件类型中明确 `key` 的类型是 `PropertyKey`，因此可以用于映射类型。最后指定映射类型中的键和值。

`ToKeyValue` 用于将字典项数组转换为键值对：

![](https://mmbiz.qpic.cn/mmbiz_png/KV8By3euEQgaNLCicEBS7TRf2w0bxkVlU8LtZPtdialdBHQJTtf7bZjU2grkHTgkKukHXbiahC6D8beobMjFwum7w/640?wx_fmt=png)

`ToKeyValue` 的实现：

```
type ToKeyValue<T> = T extends readonly [infer A, ...infer B]  ? B['length'] extends 0    ? ToSingleKeyValue<A>    : MergeIntersection<ToSingleKeyValue<A> & ToKeyValue<B>>  : [];
```

这个实现的关键点是使用类型推断结合展开语法和递归特性实现数组类型的处理。

我们在第一个条件类型中获取数组的第一个元素和剩余元素，然后在第二个条件类型中判断剩余元素的长度是否为 0。如果为 0，说明数组只有一个元素，我们可以直接使用 `ToSingleKeyValue`进行类型转换。否则转换第一个元素并递归使用 `ToKeyValue` 转换剩余部分，最后使用 `MergeIntersection` 将结果合并。

在 `defineConstants` 和这些类型转换函数中使用了 `readonly` 关键字，这实际上源于 `defineConstants` 的一个使用限制：在使用 `defineConstants` 时，必须使用 `const` 断言（`const`assertions），即在字典项数组后面加上 `as const`。

```
defineConstants([  {    key: 'POP',    value: 1,    name: '流行音乐',  },  {    key: 'ROCK',    value: 2,    name: '摇滚音乐',  },] as const, 'MUSIC_TYPE');
```

对于代码中的常量定义，TypeScript 会自动推断变量类型而抹去具体的值。这在通常情况下是合理的，但是对于 `defineConstants` 类型提示的实现是很大的阻碍。如果入参字典项中的值信息丢失，我们也就无法通过类型系统进行类型转换生成字典的类型定义。

对比是否使用 as const 的区别：

![](https://mmbiz.qpic.cn/mmbiz_png/KV8By3euEQgaNLCicEBS7TRf2w0bxkVlUxoXxFjDibunibnd9MA5qajic6mPPxYaRfjGRohKvJZJQly3PdXicT1HEibA/640?wx_fmt=png)

而使用 const 断言同时也会将字典项的属性在类型系统中变成只读，这也是我们在函数中使用 `readonly` 关键字的原因。

以上内容基本上覆盖了剩余字典类型转换所需的全部语法和技巧，例如 `VK` 格式只是将键值对换，`MAP_BY_KEY` 只是将值替换为字典项的类型，因此不再赘述。完整的实现可以在 Github Gist[6] 获取，也可以直接在这个 CodeSandbox 示例 [7] 中尝试使用效果。

至此我们已经使用 TypeScript 实现了可以生成带有支持类型提示的业务字典工厂函数，通过这个函数定义和使用业务字典可以在各处获取类型提示。

定义字典时：

![](https://mmbiz.qpic.cn/mmbiz_png/KV8By3euEQgaNLCicEBS7TRf2w0bxkVlULxibWHI7L30g0eI2Qsdwqeb8qicYBu5CVkLia94LBcPuYU5fBicOwGSL6w/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/KV8By3euEQgaNLCicEBS7TRf2w0bxkVlU2BOsSRKTnbXicfOjKcxytOU6icHEqaR3YR3IxOp99WIicvFVUticOia8TfA/640?wx_fmt=png)

使用字典时：

![](https://mmbiz.qpic.cn/mmbiz_png/KV8By3euEQgaNLCicEBS7TRf2w0bxkVlUgDHlD5OTf7STwtKDdHIibxIp2eZt7fb4DvsaMG2A0FWNATRFVwhXPibA/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/KV8By3euEQgaNLCicEBS7TRf2w0bxkVlUDyXgkhOq5o4TQ9rvsV6fjiaChiaJ7NwW9OPzWLPtLN61SibPqPCrTXcNw/640?wx_fmt=png)

缺陷和不足
-----

这个工具给作者本人在项目中带来很大的帮助，但还是存在一些缺陷和不足：

1.  只能在 TypeScript 项目中使用，并且在定义字典时需要使用 `as const` 关键字。
    

通常来说一个工具函数以 TypeScript 实现，只要提供良好的类型定义就可以在 JavaScript 项目中方便地使用。

但是由于 JavaScript 无法支持 `const` 断言或类似功能，这个工具只能在 TypeScript 中使用。

2.  使用者无法在类型提示中获取注释
    

当我们定义一个枚举值时，可能会增加一些注释：

```
enum MusicTypes {  /**   * 流行   */  POP: 1,}
```

开发者在使用这个枚举值时，可以通过 IDE 获取注释内容。然而通过字典工厂函数生成的字典经过转换已经丢失了这些信息。

3.  无法同时导出类型定义
    

`defineConstants` 返回的是字典值，当下游需要引用字典类型时，还需要需要额外导出类型定义：

```
export const { MUSIC_TYPE_VALUES } = defineConstants([...], 'MUSIC_TYPE')// 导出字典类型export type MUSIC_TYPE = MUSIC_TYPE_VALUES[number]// 下游类型定义import { MUSIC_TYPE } from './constants'interface Music {  type: MUSIC_TYPE;  // ...}
```

总结
--

本文针对业务字典定义的场景，使用 TypeScript 实现了一个工具函数，用于生成各种形式且带有类型提示的业务字典。同时指出了这个工具函数的一些使用限制和不足之处。

> 本文发布自网易云音乐技术团队，文章未经授权禁止任何形式的转载。我们常年招收各类技术岗位，如果你准备换工作，又恰好喜欢云音乐，那就加入我们 grp.music-fe(at)corp.netease.com！

### 参考资料

[1]

条件类型（Conditional Types）: _https://www.typescriptlang.org/docs/handbook/2/conditional-types.html_

[2]

映射类型 (Mapped Types）: _https://www.typescriptlang.org/docs/handbook/2/mapped-types.html_

[3]

类型断言（Type Assertions）: _https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-assertions_

[4]

交叉类型（Intersection Types）: _https://www.typescriptlang.org/docs/handbook/unions-and-intersections.html#intersection-types_

[5]

类型推断（Type Inference）: _https://www.typescriptlang.org/docs/handbook/type-inference.html_

[6]

Github Gist: _https://gist.github.com/Yelmor/e28ddb1e31a49b2fc0a80bd7fe3bd3c8_

[7]

CodeSandbox 示例: _https://codesandbox.io/s/define-constants-r6dd0n?file=/src/index.ts_