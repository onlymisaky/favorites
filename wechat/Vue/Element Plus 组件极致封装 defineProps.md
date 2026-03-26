> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/2dFeXQsnmRJdHPBJJclEkg)

一、前言
----

`Element Plus` 组件库中有非常多组件且组件之间复用性也比较高。**在**`**Vue**`**组件开发过程中**`**props**`**是数据传输的核心，而**`**props**`**在组件库中有需要定义类型或者校验默认值等信息。**但是如果给每个组件都手动定义类型工作量巨大且不易维护，还容易编写出错，存在隐形问题，`Element Plus` 封装 `props` 的类型，**开发者只需要传入参数，不需要考虑其他的因素封装好的 props 函数会自动处理。**接下来我将详细的向你介绍 `Element Plus` 的 `buildProps` 函数的设计思路。

二、buildProp 函数的设计思路
-------------------

### 一)、buildProp 实现的功能

了解这个函数的设计思路之前我需要向你介绍一般在 `vue3`中定义一个组件我们一般是如何定义的。

```
import { defineComponent, PropType } from'vue'exportdefault defineComponent({  props: {    theme: {      type: Stringas PropType<'light' | 'dark'>,      required: true,      default: 'light',      validator: (val: unknown): boolean => {        return val === 'light' || val === 'dark'      },    },  },})
```

以上定义 props 方式在庞大的组件库中会存在很大的问题，**这段代码中**`**type**`**定义了可允许的类型，但是它还需要再**`**validator**`**中再次进行验证才能实现限定值范围的逻辑，**`**type**`**和**`**validator**`**校验逻辑分离，可能会存在人为的错误。**如果多个 `props` 有相同逻辑（默认值，或者限制值范围）需要重复编写。而且开发者需要给每个 `props` 定义类型，这个会极大降低组件的复用性，因为组件之间的类型很容易匹配不上，导致定位不到类型问题，极难维护。

所有根据上面不封装 props 存在的问题，Elememt Plus 对此进行了封装来解决以上的问题，且 `buildProp` 函数实现了一下功能。

*   **支持多种类型的**`**prop**`**定义方式**：支持原生类型（如 `StringConstructor`）、复杂类型（如自定义 `EpPropInput` 定义）以及预处理过的 `EpProp`。
    
*   **标准化输出**：通过调用 `buildProp`，将输入的 `prop` 定义转换为标准化的 `EpProp` 格式。
    
*   **优化验证逻辑**：根据 `default`默认值、`values` 限定值和`validator` 自定义校验函数来对校验验证逻辑进行优化，并在开发环境中输出详细的警告信息（如无效值等）。
    
*   **增强类型推断能力**：通过 TypeScript 类型推导，确保 `prop` 的类型定义与运行时行为一致。
    

### 二)、buildProp 函数功能的具体实现

Element Plus 组件库中使用了 `TypeScript`来为每个组件声明严格的类型，所以在实现这个函数也需要支持类型推导。**在设计这个**`**buildProps**`**我们需要实现传入的函数参数**`**prop**`**类型统一和输出处理好的**`**prop**`**类型统一。**在处理校验时，我们需要将 `default`、`validator`和 `values` 属性校验逻辑一起处理，**而**`**values**`**是用来辅助限制**`**prop**`**可传值的范围的，在**`**Vue**`**中没有这个字段，它的作用是简化了**`**type**`**和**`**validator**`**一起使用才能实现限制值范围。**

#### 1. buildProps 函数的类型实现

##### 1). 输入类型 EpPropInput 的设计

输入类型 `EpPropInput`**需要对默认值的类型做额外的处理**，如过输入类型中的 `required`是 true, 则不需要再有默认值，如果 `prop` 非必填，判断 `default` 传的值是否是对象或者数组，如果是则用函数的方式放回，防止出现引用共享问题，如果不是则保持原本数据返回和函数返回。

```
exporttype EpPropInputDefault<  Required extendsboolean,  Default  > = Required extendstrue  ? never  : Default extends Record<string, unknown> | Array<any>  ? () => Default  : (() => Default) | Default
```

`Required` 泛型希望继承 `boolean`, 下面的推断才有意义。

在定义 `prop`时我们可能会同时定义 `type`、`validator`、限定值范围 `values`和 `default`的情况，但是如果不给传入的 `default` 添加一个类型限制，那么开发者可以随意的添加一个不符合 `type`和 `value`中声明的类型，这种情况下在编译时就会报错。所以我们需要将默认值同时符合 `type`、`values`和 `validator`的类型。

```
buildProp({  type: String,  values: ['a', 'b'], // 限定值为 'a' 或 'b'  default: 'c',       // 默认值为 'c'});
```

`default` 的值 `'c'` 并不在 `'a' | 'b'` 范围内。如果没有类型约束，这种错误无法在编译时捕获。

在设计合并 `type`、`values`和 `validator`类型时，**我们还需要对**`**type**`**进行一定的处理 ，如果**`**type**`**声明的类型是 String，则它会被推断成**`**StringConstructor**`**但是我们想要获得**`**string**`**，我们可以利用**`**vue**`**的**`**ExtractPropType**`**来实现，**我们还需要将 `type` 的类型处理成必填和如果 `type`如果是一个数组类型将它转成可写类型。下面我们来实现这些需求吧。

在`packages\utils\vue\props\util.ts` 目录下声明封装类型需要用到的判断类型工具类型

```
//将对象类型数组类型转成可写类型exporttype Writable<T> = { -readonly [P in keyof T]: T[P] }// 如果类型是数组将其每一项转换为可写类型，如果不是则返回原来的类型。exporttype WritableArray<T> = T extendsany[] ? Writable<T> : T// 推断类型是否为 never 如果为never 则为 Y 泛型定义类型，否则为Nexporttype IfNever<T, Y = true, N = false> = [T] extends [never] ? Y : N// 推断是否为 unknown 类型，如果是 unknow  则为 Y 泛型定义类型，否则为Nexporttype IfUnknown<T, Y, N> = [unknown] extends [T] ? Y : N// 将 unknown 转成 never 类型，否则原类型返回exporttype UnknownToNever<T> = IfUnknown<T, never, T>exportdefault {}
```

在 `packages\utils\vue\props\types.ts` 文件下封装 `buildProp` 函数所需所有类型。

```
/** * Extract all value types from object type T * * 提取对象类型 T 的所有值类型 * @example * Value<{a: string; b: number; c: boolean}> => string | number | boolean * Value< x: { y: number; z: string }; w: boolean> => { y: number; z: string } | boolean */exporttype Value<T> = T[keyof T]/** * Extract the type of a single prop * * 提取单个 prop 的参数类型 * @example * ExtractPropType<{ type: StringConstructor; required:true }> => { key: string } => string * ExtractPropType<{ type: StringConstructor }> => { key: string | undefined } => string | undefined * ExtractPropType<{ name: StringConstructor; age: { type: NumberConstructor; required: true }> =>{ key: { name?: string , age: number }} => { name?: string, age：number} */exporttype ExtractPropType<T extends object> = Value<  ExtractPropTypes<{ key: T }>>/** *  Handle the type of prop by converting the type T into a writable and required type. * * 处理 prop 的类型，将 T 类型转换成可写和必填类型 * @example * ResolvePropType<StringConstructor> => string * ResolvePropType<BooleanConstructor> => boolean * ResolvePropType<PropType<T>> => T */exporttype ResolvePropType<T> = IfNever<  T,  never,  ExtractPropType<{ type: WritableArray<T>; required: true }>>/** * The final type of prop after merging the type, required, default value, and validator. * * 合并类型、是否必填、默认值和验证器后的最终 prop 类型 * 优先使用 values 的类型（Value）。如果没有 values，则使用 type 推断类型。如果 Value 是有效类型，则直接使用 Value 的类型，如果Validator 有类型则使用 validator 推断类型 * @example * EpPropMergeType<StringConstructor, 'a' | 'b', number> => "a" | "b" | number */exporttype EpPropMergeType<Type, Value, Validator> =  | IfNever<UnknownToNever<Value>, ResolvePropType<Type>, never>  | UnknownToNever<Value>  | UnknownToNever<Validator>
```

以上我们就已经封装好合并处理 `Type` 、`Value` 、`Validator` 类型 `EpPropMergeType`。这个类型很完美了处理了各种输入类型，默认值类型`default`也应该符合这个合并类型。处理好这个类型我们就可以继续配置 `prop` 的输入类型了。

```
exporttype EpPropInput<  Type,  Value,  Validator,  Default extends EpPropMergeType<Type, Value, Validator>,  Required extendsboolean> = {  type?: Type  required?: Required  values?: readonly Value[]  validator?: ((val: any) => val is Validator) | ((val: any) => boolean)  default?: EpPropInputDefault<Required, Default>}
```

##### 2). 输出类型 EpPropFinalized 的设计

根据 `Vue` 中的 props 传值字段，我们输出类型也需要符合这个，但是我们给输出类型加上一个标识 `epPropKey` 来用于后面判断传入的 `prop`是否符合输出类型从而做出其他的逻辑处理。

```
/** * output prop `buildProp` or `buildProps`. * * prop 输出参数。 * * @example * EpProp<'a', 'b', true> * ⬇️ * {    readonly type: PropType<"a">;    readonly required: true;    readonly validator: ((val: unknown) => boolean) | undefined;    readonly default: "b";    __epPropKey: true;  } */exporttype EpProp<Type, Default, Required> = {  readonly type: PropType<Type>  readonly required: [Required] extends [true] ? true : false  readonly validator: ((val: unknown) => boolean) | undefined  [epPropKey]: true} & IfNever<Default, unknown, { readonlydefault: Default }>
```

但是这个输出类型中的 `Type` 泛型也需要做出一定的优化，我们希望输出后的 `Type` 应该是 `Value`、`Type`和 `Validator` 合并好的类型得出的最后的结果类型。

```
/** * Finalized conversion output * * 最终转换 EpProp */exporttype EpPropFinalized<Type, Value, Validator, Default, Required> = EpProp<  EpPropMergeType<Type, Value, Validator>,  UnknownToNever<Default>,  Required>
```

这个 `unknownToNever`主要是为了解决，如果 `Default` 传入的泛型是 `unknown` 但是 `default` 又有具体的值，这时就会和这个泛型设定的值引发歧义。所以我们需要将 `unknown` 类型转换成 `never` 再交给 `EpProp` 来对 `Default`类型再做处理。

#### 2. buildProp 函数功能实现

这个函数最大的作用就是合并处理了 `values` 、`default` 和 `validator` 的校验，让整个组件库都能更好的为组件声明 `props`, 也能清晰的推断出 `props` 的类型。

```
exportconst isEpProp = (val: unknown): val is EpProp<any, any, any> =>  isObject(val) && !!(val asany)[epPropKey]exportconst buildProp = <  Type = never,  Value = never,  Validator = never,  Default extends EpPropMergeType<Type, Value, Validator> = never,  Required extendsboolean = false>(  prop: EpPropInput<Type, Value, Validator, Default, Required>,  key?: string): EpPropFinalized<Type, Value, Validator, Default, Required> => {// filter native prop type and nested prop, e.g `null`, `undefined` (from `buildProps`)if (!isObject(prop) || isEpProp(prop)) return prop asanyconst { values, required, default: defaultValue, type, validator } = propconst _validator =    values || validator      ? (val: unknown) => {          let valid = false          let allowedValues: unknown[] = []          if (values) {            allowedValues = Array.from(values)            if (hasOwn(prop, 'default')) {              allowedValues.push(defaultValue)            }            valid ||= allowedValues.includes(val)          }          if (validator) valid ||= validator(val)          if (!valid && allowedValues.length > 0) {            const allowValuesText = [...new Set(allowedValues)]              .map((value) =>JSON.stringify(value))              .join(', ')            warn(              `Invalid prop: validation failed${                key ? ` for prop "${key}"` : ''              }. Expected one of [${allowValuesText}], got value ${JSON.stringify(                val              )}.`            )          }          return valid        }      : undefinedconst epProp: any = {    type,    required: !!required,    validator: _validator,    [epPropKey]: true,  }if (hasOwn(prop, 'default')) epProp.default = defaultValuereturn epProp}
```

三、buildProps 函数的具体实现
--------------------

### 一)、buildProps 实现的功能

它接收一个定义好的 `props` 对象（包括类型、默认值、验证规则等），如果这个对象包含多个 `prop`对象， 那我们需要将每个属性通过 `buildProp` 进行处理，最终返回一个完整的、符合 Vue `props` 要求的对象。 而且这个 `props` 需要支持多种属性类型，包括原生类型（`String`、`Number` 等）、`EpPropInput` 类型，以及已经是 `EpProp` 的属性对象。

### 二)、buildProps 功能的具体实现

这个函数是为了处理多个 `prop` 的对象的函数，这个多个 `prop`我们可以将它放到一个对象中来处理，我们希望这个单个的 `prop` 能够支持原生类型（类、函数、null、undefined) 类型，也能够支持 `EpPropInput`类型。所以我们还需要去封装原生类型。

```
/** * Native prop types, e.g: `BooleanConstructor`, `StringConstructor`, `null`, `undefined`, etc. * * 原生 prop `类型，BooleanConstructor`、`StringConstructor`、`null`、`undefined` 等 */exporttype NativePropType =  | ((...args: any) => any)  | { new (...args: any): any }  | undefined  | nullexporttypeIfNativePropType<T, Y, N> = [T] extends [NativePropType] ? Y : N
```

我们对输入类型做了限制，我们这个函数的输出类型也需要有一定的范围，这个函数单个 `prop`返回值类型要不就是 `EpProp`类型，要不就是 `NativePropType` ，如果这个类型不是这个原生类型也不是 `EpProp`类型，那么我们需要将它转换成我们想要的类型。所以我们也需要重新动态声明转换类型。

```
exporttype EpPropConvert<Input> = Input extends EpPropInput<  infer Type,  infer Value,  infer Validator,  any,  infer Required>  ? EpPropFinalized<Type, Value, Validator, Input['default'], Required>  : never
```

如果 `Input` 类型符合 `EpPropInput` 类型的话则它会通过 `infer` 提取这些 `Type`、`Value`... 类型并以 `EpPropFinalized` 类型输出，否则直接为 `never`。这样做的目的是可以严格规范这个函数输入的类型符合 `buildProp`输出的类型。

```
exportconst buildProps = <  Props extends Record<    string,    | { [epPropKey]: true }    | NativePropType    | EpPropInput<any, any, any, any, any>  >>(  props: Props): {  [K in keyof Props]: IfEpProp<    Props[K],    Props[K],    IfNativePropType<Props[K], Props[K], EpPropConvert<Props[K]>>  >} =>  fromPairs(    Object.entries(props).map(([key, option]) => [      key,      buildProp(option asany, key),    ])  ) asany
```

使用 `Object.entries` 将 `props` 转换为 `[key, value]` 的数组。 将 `option`传入 `buildProp`函数处理，传入 `key`，用于输出更详细的警告信息。 使用 `fromPairs` 将处理后的 `[key, processedProp]` 数组重新转换为对象，将数组对象转换成对象的形式输出。

四、结论
----

这篇文章详细的介绍了 `buildProps` 函数的设计思路，包括他的类型设计和功能设计。  
愿诸君越来越好，一起进步。

作者：supperEditor

https://juejin.cn/post/7458244788375552015