> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/TS7O0fRLiseSoZMAYpsMag)

背景
==

我们知道，在 ts 中提供了`keyof`关键字让我们能够获取一个 interface 的全部的 key

```
interface Stu {    name: string;    age: number;}type keys = keyof Stu; // type keys = 'name' | 'age'
```

但并没有提供下面这样的递归地获取一个 interface 的 key 的能力

```
interface Stu {    name: string;    age: number;    nest: {        a: {            b: number;        }    }}// expectedtype deepKeys = deepkeyof Stu; // type deepKeys = 'name' | 'age' | 'nest' | 'nest.a' | 'nest.a.b'
```

可实际上这种能力非常有用，比如在类似于 lodash.get 的这种场景下，如果能够有类似于`deepkeyof`这样的能力，我们就可以直接将 path 的可能参数都提前限定下来，而不只是简单的设置为 string。

```
let obj = {    a: {        b: {            c: '2333'        }    }}_.get(obj, 'a.b.c'); // '2333'
```

实现思路  

=======

### 1. 什么是类型体操

类型体操 (type gymnastics) 一词最早出现于 Haskell 的文档 [1] 中，我认为可以简单理解为`类型编程`，和我们平时使用 JavaScript、C++ 等语言处理各种值的编程其实没有本质区别，只不过在类型编程中，处理的值是类型。

在 JS 中，我们在处理的值就是 JS 这门语言为我们提供的值（包括各种基础数据类型及复杂类型），JS 同时给我们提供了一系列的`操作符`，例如下面的 `+` 、`*` ，以及像 `split` 这样的内置的 API。

```
let a = 1;let b = a + 2;let c = b * 5;let s = 'typescript';let t = s.split('s');
```

在 TypeScript 的类型编程中，我们所处理的值变成了类型这一事物，查看以下代码

```
type Temp = {    name: string;    age: number;}type keys = keyof Temp; // type keys = 'name' | 'age'
```

这里出现的值有 `Temp` ，`操作符` 有 `keyof` 。这里使用了 `keyof` 来提取 Temp 中的 key。

可能看到这里，你对类型编程还是没有一个具体的概念，我们做以下对比来感受一下类型编程和我们平时通常意义认为的编程的区别。

*   **定义变量**
    

在类型编程中，我们定义的 “变量” 是不可变的，我们只能去生成新的变量，而不能去修改已有的变量，这一点和函数式编程语言类似。

```
// in JavaScriptlet a = 1;const b = 10;
```

```
// in type gymnasticstype a = 1;a = 2;type b = 2;
```

*   **条件**
    

类型编程中只有表达式，没有 “语句” 这一概念，也就没有所谓的条件语句，不过有`extends ? :`表达式可以帮助我们达到类似的目的。

```
// in JavaScriptlet max;let a = 10, b = 20;if (a > b) {    max = a;} else {    max = b;}
```

```
// in type gymnasticstype temp = 10;type isNumber<T> = T extends number ? true : false;type res = isNumber<temp>; // type res = true;
```

*   **循环**
    

类型编程中没有循环，不过可以用递归来模拟。

```
// in JavaScriptlet index = 1;let n = 10;while(n--) {    index *= 10;}
```

```
// in type gymnasticstype path = 'a.b.c';type Split<T extends string> = T extends `${infer A}.${infer B}` ? A | Split<B> : T;type test = Split<path>; // type test =  a  |  b  |  c
```

*   **函数**
    

ts 的类型编程中，泛型相当于是函数，只不过泛型本身没法当做参数被传递给泛型

```
function temp(arg: string) {    return arg + '123';}
```

```
type Temp<T extends string> = `${T}123`;
```

### 2. TS 提供的部分类型操作

*   `keyof`
    

*   索引类型 [2] 获取一个 interface 某个字段对应的类型
    

```
interface Stu {    name: string;    age: number;    nest: {        a: {            b: number;        }    }}type temp = Stu['nest'];  // type temp = { a: { b: number; }; }type temp1 = Stu['next' | 'name'] // type temp1 = string | { a: { b: number; }; }
```

*   模板字符串 [3] 构造各种各样的字符串
    

```
type key1 = 'nest';type key2 = 'a';type key3 = `${key1}.${key2}`; // type key3 =  nest.a type key4 = 'name' | 'nest'; // union用于模板字符串也会得到一个uniontype key5 = `get${key4}`; // type key5 = 'getname' | 'getnest'// 如果模板字符串的输入中出现了never，会导致整个字符串变成nevertype key6 = `get${never}`; // type key6 = never
```

*   `extends + infer` 从某个 type 中解构出其组成部分
    

```
type UnpackPromise<T extends Promise<any>> = T extends Promise<infer A> ? A : never;type test = UnpackPromise<Promise<number>> // type test = number
```

*   `泛型 + 递归` ts 类型编程的基础
    

```
type path = 'a.b.c';type Split<T extends string> = T extends `${infer A}.${infer B}` ? A | Split<B> : T;type test = Split<path>; // type test =  a  |  b  |  c
```

*   `mapped type` 基于一个已有的 interface 构造一个新的 interface
    

```
interface Temp {    name: string;    age: number;}type ToFunc = {    [k in keyof Temp]: (arg: Temp[k]) => void;}// type ToFunc = {//     name: (arg: string) => void;//     age: (arg: number) => void;// }// 甚至能把原interface中的key也改了type ToGetFunc = {    [k in keyof Temp as `get${k}`]: (arg: Temp[k]) => void;}// type ToGetFunc = {//     getname: (arg: string) => void;//     getage: (arg: number) => void;// }
```

### 3. 顺序执行方案

回到我们最初的问题，实现`DeepKeyOf`，我们可以先尝试使用顺序执行的方式实现

1.  使用 keyof 拿到第一层的 key
    

```
interface Stu {    name: string;    age: number;    nest: {        a: {            b: number;        }    }}type keys1 = keyof Stu; // type keys1 = 'name' | 'age' | 'nest';
```

2.  拿到第一层的 key 以后，用来获取第二层的类型
    

```
type types2 = Stu[keys1]; // type types2 = string | number | { a: { b: number; } }
```

3.  将第二层中仍然有多层结构的 type 过滤出来
    

```
type OnlyObject<T extends any> = T extends Record<string, any> ? T : never;type types2_needed = OnlyObject<types2>; // type types2_needed = { a: { b: number; } }
```

4.  把第二层的 key 拿出来
    

```
type keys2 = keyof types2_needed; // type keys2 =  a
```

5.  使用步骤 4 拿到的 key 重复步骤 2
    

6.  最终，我们可以拿到每一层的 key
    

```
type keys1 = 'name' | 'age' | 'nest';type keys2 = 'a';type keys3 = 'b';
```

7.  尝试一番后发现使用这样顺序执行的方式似乎是没法做到把不同层之间的 key 正确连接起来的，比如 keys2 中的'a'并不知道自己是由 keys1 中哪个 key 对应的 type 中获取的。
    

### 4. 递归方案

![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIo2lia38sYSJD1WF0LggjRuhYlEQcolI74MqRbWRKCJTmIrrBtGB1TSXSicTDTJBfe1gcorWexepVLQ/640?wx_fmt=png)

1.  虽然顺序执行的方式不能解决问题，但是可以为我们的递归的解决方案提供思路。我们的输入是一个任意的 interface，输出是它的各级的 key 连接以后的一个 union。
    

```
// inputinterface Stu {  name: string;  nest: {    a: {      b: number;    };    tt: {      c: boolean;    };  };  info: {    score: number;    grade: string;  };}// output'name' | 'nest' | 'nest.a' | 'nest.a.b' | 'nest.tt' | 'nest.tt.c' | 'info' |'info.score' | 'info.grade'
```

在顺序执行步骤的第五步中，我们需要重复第二步，可以猜测我们现在需要解决的这个问题是可以分解为同类的子问题的。

仔细观察，可以发现我们的问题可以这样来表示

1.  假设我们有一个泛型 DeepKeyOf 可以获取我们需要的 key
    

```
type DeepKeyOf<T> = xxx;type test = DeepKeyOf<Stu> // type test = 'name' | 'nest' | 'nest.a' | 'nest.a.b' | 'nest.tt' | 'nest.tt.c' | 'info' |'info.score' | 'info.grade'
```

2.  其内部实现大概会是下面这样
    

```
type DeepKeyOf<T> = {    [k in keyof T]: k;}[keyof T];type DeepKeyOf<T> = {    [k in keyof T]: k |  `  ${k}  .  ${DeepKeyOf<T[k]>}  `  ; }[keyof T]
```

这一步可能比较跳，我们简单解释一下。

*   粉色部分用到的是前面有讲到过的`mapped type`，它基于传入`DeepKeyOf`的`T`来构造一个新的 interface，它的 key 和 T 一致，value 变成了`k`和 **`` `${k}.${DeepKeyOf<T[k]>}` ``** 的 union
    

*   黄色部分用到的是上文提到过的`index access type`，它取出粉色部分对应的 interface 的全部字段对应的类型
    

3.  我们再将 `Stu` 类型传入，手动把这个泛型展开
    

```
interface Stu {  name: string;  nest: {    a: {      b: number;    };    tt: {      c: boolean;    };  };  info: {    score: number;    grade: string;  };}type res = DeepKeyOf<Stu>;type res = {    name: 'name' | `${'name'}.${DeepKeyOf<string>}`;    nest: 'nest' | `${'nest'}.${DeppKeyOf<{a: {b: number;} tt: {c: boolean;}}>}`;    info: 'info' | `${'info'}.${DeepKeyOf<{score: number; grade: string;}>}`;}['name' | 'nest' | 'info'];type res = 'name' | `${'name'}.${DeepKeyOf<string>}` | 'nest' | `${'nest'}.${DeppKeyOf<{a: {b: number;} tt: {c: boolean;}}>}` | 'info' | `${'info'}.${DeepKeyOf<{score: number; grade: string;}>}`;
```

如果我们的`DeepKeyOf`实现正确的话，`DeepKeyOf<string>` 应当返回`never`，`DeppKeyOf<{a: {b: number;} tt: {c: boolean;}}>`应当返回 `'a' | 'a.b'` ，`DeepKeyOf<{score: number; grade: string;}>` 应当返回 `'score' | 'grade'`

> never 是 union “|” 这一运算中的幺元 [4]，任何 type 与 never 做 union 运算均为其本身

> 如：'name' | 'nest' | never === 'name' | 'nest'

4.  补充细节
    

*   对于非原始类型，我们应该直接返回 never，如`DeepKeyOf<string>` 应当返回`never`，我们修改`DeepKeyOf`实现如下
    

```
type DeepKeyOf<T> = T extends Record<string, any> ? {    [k in keyof T]: k | ` ${k} . ${DeepKeyOf<T[k]>} ` ;}[keyof T] : never;
```

*   上面的代码实际上放到 IDE 里，会提示我们这样一个错误
    

![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIo2lia38sYSJD1WF0LggjRuhia4zpXPGd29psqPlHFp27rictibU50DBrwZ6HZ1xIiacmxSdXEXFficibfxg/640?wx_fmt=png)

这是因为`keyof T`在没有对 T 做类型限制的情况下拿到的类型会是`string | number | symbol`，而模板字符串可以接收的类型是 `string | number | bigint | boolean | null | undefined`，这两个 type 之间是不兼容的，我们需要对 k 的类型做进一步的限制

```
type DeepKeyOf<T> = T extends Record<string, any> ? {    [k in keyof T]: k extends string ? k | ` ${k} . ${DeepKeyOf<T[k]>} `  : never ;}[keyof T] : never;
```

5. 最终我们就得到了我们需要的 DeepKeyOf 泛型

```
type DeepKeyOf<T> = T extends Record<string, any> ? {    [k in keyof T]: k extends string ? k | `${k}.${DeepKeyOf<T[k]>}` : never;}[keyof T] : never;interface Stu {  name: string;  nest: {    a: {      b: number;    };    tt: {      c: boolean;    };  };  info: {    score: number;    grade: string;  };}type res = DeepKeyOf<Stu>; // "name" | "nest" | "info" | "nest.a" | "nest.tt" | "nest.a.b" | "nest.tt.c" | "info.score" | "info.grade"
```

总结
==

以上，我们通过实现一个简单的`DeepKeyOf`了解了类型编程这一概念，它和我们通常意义认为的编程其实没有本质区别，只是编程中操作的值不同，使用的运算符不同。在实际业务开发过程中，利用类型编程的知识，可以把一些类型收窄到我们实际需要的范围，比如需要一个整数形式的字符串，我们完全可以使用`` `${bigint}` ``，而不是简单的使用一个 string。收窄到实际需要的范围不仅可以提高开发体验（类型收窄后，IDE 可以相应地提供智能提示，也可以避免大量类型模板代码），也能提高代码的可读性（比如一个函数的输入输出可以更加明确）。

ps：如果你对类型编程感兴趣，可以尝试一下这个体操库 [5]，这个 repo 里有比较多有用的体操题，并且提供了难度分级，同时可以查看其他人的 solution，帮助我们快速上手类型体操。

### 参考资料

[1]

Haskell 的文档: _https://wiki.haskell.org/index.php?title=OOP_vs_type_classes&oldid=5437#Type_classes_is_a_sort_of_templates.2C_not_classes_

[2]

索引类型: _https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html_

[3]

模板字符串: _https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html_

[4]

幺元: _https://zh.wikipedia.org/zh-cn/%E5%96%AE%E4%BD%8D%E5%85%83_

[5]

这个体操库: _https://github.com/type-challenges/type-challenges/blob/master/README.md_