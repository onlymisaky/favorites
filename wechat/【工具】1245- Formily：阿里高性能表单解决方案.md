> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/AGSRTzfwK6UPvb6xXWewhA)

![](https://mmbiz.qpic.cn/mmbiz_jpg/dy9CXeZLlCVN0voG6I1fShIwJxcIOq0euXKS22NTDx3XMkRBCALibggJpJMQb5EhvIKUwhc03ZGgLr80M0FfSRQ/640?wx_fmt=jpeg)

  

加强自身学习，提高自身素质。积累工作经验，改进工作方法，向周围同志学习，注重别人优点，学习他们处理问题的方法，查找不足，提高自己。

  

  

  

  

  

  

hi, 大家好, 我是小智, 今天又到了我们的分享时间. 之前和大家分享了很多可视化的前端项目和工程化实践, 今天继续和大家分享一款非常有价值的开源项目 **Formily**, 它可以帮助我们更高效的开发任何复杂的表单, 并且支持可视化搭建表单, 如下:  

![](https://mmbiz.qpic.cn/mmbiz_png/dFTfMt0114ibH6KePQXVwich238X2cPmRZvjCqUOQ5kr9Iv39MqsH68icdskgbqTZ3HUrjRibgkiaqQlgmH0FicWZP2A/640?wx_fmt=png)

接下来我就来带大家一起了解一下这款开源项目.

背景介绍
----

众所周知，表单场景一直都是前端中后台领域最复杂的场景，主要表现在以下几个方面:

*   字段数量多，如何让性能不随字段数量增加而变差？
    
*   字段关联逻辑复杂，如何更简单的实现复杂的联动逻辑？字段与字段关联时，如何保证不影响表单性能？
    
*   表单数据管理复杂
    
*   表单值转换逻辑复杂 (前后端格式不一致)
    
*   同步默认值与异步默认值合并逻辑复杂
    
*   跨表单数据通信，如何让性能不随字段数量增加而变差？
    
*   表单状态管理复杂
    
*   表单的场景化复用困难
    

等等这么多问题，我们不仅需要想办法解决，还要优雅的解决，阿里数字供应链团队，在经历了大量的中后台实践和探索之后，沉淀出了 `Formily` 表单解决方案 ，以上提到的所有问题，在经历了 UForm 到 Formily1.x，直到 `Formily2.x` 总算做到了 优雅解决 的程度。那 `Formily2.x` 是如何解决这些问题的呢？

解决方案分析
------

为了解决以上问题，我们可以对问题做进一步提炼，得出可突破的方向。

### 精确渲染

在 `React` 场景下实现一个表单需求，因为要收集表单数据，实现一些联动需求，大多数都是通过 `setState` 来实现字段数据收集，这样实现非常简单，心智成本非常低，但是却又引入了性能问题，因为每次输入都会导致所有字段全量渲染，虽然在 `DOM` 更新层面是有 `diff`，但是 `diff` 也是有计算成本的，浪费了很多计算资源，如果用时间复杂度来看的话，初次渲染表单是 `O(n)`，字段输入时也是 `O(n)`，这样明显是不合理的。

历史的经验总是对人类有帮助的，几十年前，人类创造出了 `MVVM` 设计模式。这样的设计模式核心是将视图模型抽象出来，然后在 `DSL` 模板层消费，`DSL` 借助某种依赖收集机制，然后在视图模型中统一调度，保证每次输入都是精确渲染的，这就是工业级的 `GUI` 形态！

刚好，`github` 社区为这样的 `MVVM` 模型抽象出了一个叫 `Mobx` 的状态管理解决方案，Mobx 最核心的能力就是它的依赖追踪机制和响应式模型的抽象能力。

所以，借助 `Mobx`，完全可以解决表单字段输入过程中的 `O(n)` 问题，而且是可以很优雅的解决，但是 `Formily2.x` 在实现的过程中发现 `Mobx` 还是存在一些不兼容 `Formily` 核心思想的问题，最终，只能重新造了一个轮子，延续 `Mobx` 的核心思想的 `@formily/reactive`

这里提一下 `react-hook-form` ，非常流行，号称业界性能第一的表单方案，我们看看它最简单的案例：

```
import React from 'react'import ReactDOM from 'react-dom'import { useForm } from 'react-hook-form'function App() {  const { register, handleSubmit, errors } = useForm() // initialize the hook  const onSubmit = (data) => {    console.log(data)  }  return (    <form onSubmit={handleSubmit(onSubmit)}>      <input  ref={register} /> {/* register an input */}      <input  ref={register({ required: true })} />      {errors.lastname && 'Last name is required.'}      <input  ref={register({ pattern: /\d+/ })} />      {errors.age && 'Please enter number for age.'}      <input type="submit" />    </form>  )}ReactDOM.render(<App />, document.getElementById('root'))
```

虽然值管理做到了精确渲染，但是在触发校验的时候，还是会导致表单全量渲染，因为 `errors` 状态的更新，是必须要整体受控渲染才能实现同步，这仅仅只是校验会全量渲染，其实还有联动，`react-hook-form` 要实现联动，同样是需要整体受控渲染才能实现联动。所以，如果要真正实现精确渲染，非 `Reactive` 不可！

### 领域模型

前面问题中有提到表单的联动是非常复杂的，包含了字段间的各种关系，我们想象一下，大多数表单联动，基本上都是基于某些字段的值引发的联动，但是，实际业务需求可能会比较恶心，不仅要基于某些字段值引发联动，还会基于其他副作用值引发联动，比如应用状态，服务端数据状态，页面 `URL`，某个字段 `UI` 组件内部数据，当前字段自身的其他数据状态，某些特殊异步事件等等。用张图来描述：

![](https://mmbiz.qpic.cn/mmbiz_png/dFTfMt0114ibH6KePQXVwich238X2cPmRZAB6jePGzHMJyian9XoHcibv9Txd1dGqaKibhn8NqXr58bxRKU7icQUjoIA/640?wx_fmt=png)

从上图可以看到，想要达成一个联动关系，核心是将字段的某些状态属性与某些数据关联起来，这里的某些数据可以是外界数据，也可以是自身数据，比如字段的显示 / 隐藏与某些数据的关联，又比如字段的值与某些数据关联，还比如字段的禁用 / 编辑与某些数据关联，就举了 3 个例子，我们其实已经抽象出了一个最简单的 `Field` 模型：  

```
interface Field {  value: any  visible: boolean  disabled: boolean}
```

当然，`Field` 模型仅仅只有这 3 个属性吗？肯定不是，如果我们要表达一个字段，那么字段的路径一定要有，因为要描述整个表单树结构，同时，我们还要管理起字段对应 `UI` 组件的属性，比如 `Input` 和 `Select` 都有它的属性，举个例子，`Input` 的 `placeholder` 与某些数据关联，或者 `Select` 的下拉选项与某些数据关联，这样就能理解了吧。所以，我们的 `Field` 模型可以是这样：

```
interface Field {   path:string[],   value:any,   visible:boolean,   disabled:boolean,   component:[Component,ComponentProps]}
```

我们加了 `component` 属性，它代表了字段所对应的 `UI` 组件和 `UI` 组件属性，这样就实现了某些数据与字段组件属性关联，甚至是与字段组件关联的能力。还有吗？当然还有，比如字段的外包裹容器，通常我们都叫 `FormItem`，它主要负责字段的外围的交互样式，比如字段标题，错误提示的样式等等，如果我们想要囊括更多联动，比如某些数据与 `FormItem` 的联动，那就得把外包裹容器也加进去。还有很多很多属性，这里没法一一列举。

从上面的思路中我们可以看到，为了解决联动问题，不管我们怎么抽象，最终还是会抽象出字段模型，它包含了字段相关的所有状态，只要去操作这些状态就能引发联动。

关于精确渲染，我们已经确定可以选用类似 Mobx 的 Reactive 方案，虽然是重新造了一个轮子，但是，Reactive 这种模式始终还是很适合抽象响应式模型，所以基于 Reactive 的能力，Formily 经过不断试错与纠正，总算设计出了真正优雅的表单模型。这样的表单模型，解决的是表单领域问题，所以也称之为领域模型，有了这样的领域模型，我们就能让表单的联动变得可枚举可预测，这样也为后面要说的协议描述联动打下了坚实基础。

### 路径系统

前面提到了表单领域模型中的字段模型，如果设计的更完备的话，其实不止是字段模型，必须还要有一个表单模型作为顶层模型，顶层模型管理着所有字段模型，每个字段都有着自己的路径，那如何查找这些字段呢？前面说到的联动关系，更多的是被动依赖关系，但是有些场景，我们就是要基于某个异步事件动作，去修改某个字段的状态，这里就涉及到如何优雅的查找某个字段，同样也是经过了大量的试错与纠正，Formily 独创的路径系统 @formily/path 很好的解决了这个问题，不仅仅是让字段查找变得优雅，它还能通过解构表达式去处理前后端数据结构不一致的恶心问题。

### 生命周期

借助 `Mobx` 和路径系统，我们已经打造了一个较为完备的表单方案了，但是这样抽象了之后，我们的方案就像个黑盒，外界无法感知到方案内部状态流转过程，想要在某个过程阶段内实现一些逻辑则无法实现，所以，这里我们就需要另外一个概念了，生命周期，只要我们将整个表单生命周期作为事件钩子暴露给外界，这样就能做到了既有抽象，但又灵活的表单方案。

### 协议驱动

如果想要实现动态可配置表单，那必然是需要将表单结构变得可序列化，序列化的方式有很多种，可以是以 `UI` 为思路的 `UI` 描述协议，也可以是以数据为思路的数据描述协议，因为表单本身就是为了维护一份数据，那自然而然，对于表单场景而言，数据协议最适合不过，想要描述数据结构，现在业界最流行的就是 `JSON-Schema` 了，因为 `JSON Schema` 协议上本身就有很多校验相关的属性，这就天然和表单校验关联上了。那 UI 描述协议就真的不适合描述表单吗？`No`，`UI` 描述协议适合更通用的 `UI` 表达，描述表单当然不在话下，只是它会更偏前端协议，相反，`JSON-Schema`，在后端模型层，都是可表达的，在描述数据上更通用，所以两种协议，各有所长，只是在单纯表单领域，`JSON-Schema` 会更偏领域化一些。

那么，如果选用 `JSON-Schema`，我们怎么描述 `UI`，怎么描述逻辑呢？单纯的描述数据，想要输出实际业务可用的表单页面，不太现实。

`react-jsonschema-form`的解法是，数据是数据，`UI` 是 `UI`，这样的好处是，各个协议都是非常纯净的协议，但是却带来了较大的维护成本和理解成本，用户要开发一个表单，需要不断的在两种协议心智上做切换，所以，如果从技术视角来看这样的拆分，其实是非常合理的，但是从产品视角来看的话，拆分则是把成本抛给了用户，所以，`Formily` 的表单协议会更加倾向于在 `JSON-Schema` 上做扩展。

那么，如何扩展呢？为了不污染标准 `JSON-Schema` 属性，我们统一以 x-* 格式来表达扩展属性：

```
{  "type": "string",  "title": "字符串",  "description": "这是一个字符串",  "x-component": "Input",  "x-component-props": {    "placeholder": "请输入"  }}
```

这样看来，`UI` 协议与数据协议混合在一起，只要有一个统一的扩展约定，也还是能保证两种协议职责单一。

然后，如果想要在某些字段上包裹一个 `UI` 容器怎么办呢？这里，`Formily` 定义了一个新的 `schema type`，叫`void`。`void` 不陌生，`W3C` 规范里也有 `void element`，`js` 里也有 `void` 关键字，前者代表虚元素，后者代表虚指针，所以，在 `JSON Schema` 中，引入 `void`，代表一个虚数据节点，表示该节点并不占用实际数据结构。所以，我们可以这样：

```
{  "type": "void",  "title": "卡片",  "description": "这是一个卡片",  "x-component": "Card",  "properties": {    "string": {      "type": "string",      "title": "字符串",      "description": "这是一个字符串",      "x-component": "Input",      "x-component-props": {        "placeholder": "请输入"      }    }  }}
```

这样就可以描述了一个 `UI` 容器了，因为可以描述 `UI` 容器，我们就能轻易封装一个场景化的组件了，比如 `FormStep`，那么我们怎么描述字段间联动呢？比如一个字段要控制另一个字段的显示隐藏。我们可以这样：

```
{  "type": "object",  "properties": {    "source": {      "type": "string",      "title": "Source",      "x-component": "Input",      "x-component-props": {        "placeholder": "请输入"      }    },    "target": {      "type": "string",      "title": "Target",      "x-component": "Input",      "x-component-props": {        "placeholder": "请输入"      },      "x-reactions": [        {          "dependencies": ["source"],          "when": "{{$deps[0] == '123'}}",          "fulfill": {            "state": {              "visible": true            }          },          "otherwise": {            "state": {              "visible": false            }          }        }      ]    }  }}
```

借助`x-reactions`描述了 `target` 字段，依赖了 `source` 字段的值，如果值为`'123'`的时候则显示 `target` 字段，否则隐藏，这种联动方式是一种被动联动，那如果我们希望实现主动联动呢？可以这样：

```
{  "type": "object",  "properties": {    "source": {      "type": "string",      "title": "Source",      "x-component": "Input",      "x-component-props": {        "placeholder": "请输入"      },      "x-reactions": [        {          "when": "{{$self.value == '123'}}",          "target": "target",          "fulfill": {            "state": {              "visible": true            }          },          "otherwise": {            "state": {              "visible": false            }          }        }      ]    },    "target": {      "type": "string",      "title": "Target",      "x-component": "Input",      "x-component-props": {        "placeholder": "请输入"      }    }  }}
```

只需要将`x-reactions`换个位置，放到 `source` 字段上，然后再指定一个 `target` 即可。

可以看到，我们的联动，其实核心是基于：

*   条件
    
*   条件满足的动作
    
*   条件不满足的动作
    

来实现的，因为内部状态管理借助了 类似 `Mobx` 的`@formily/reactive`方案，所以，`Formily` 很轻松的就实现了被动和主动联动场景，覆盖了绝大多数业务需求。

所以，我们的表单完全可以使用协议来描述了，不管是再复杂的布局，还是很复杂的联动，都能做到可配置。

### 分层架构

前面讲了对于一开始的各种问题的解法，那么现在我们如何设计才能让 `Formily` 更加自洽且优雅呢？

![](https://mmbiz.qpic.cn/mmbiz_png/dFTfMt0114ibH6KePQXVwich238X2cPmRZxe3MNrLVibwhXUknE7Dt8vf0WWLVBkASd1gNxsAUyWzupwWmTqC5teg/640?wx_fmt=png)

这张图主要将 `Formily` 分为了内核层，`UI` 桥接层，扩展组件层，和配置应用层。  

内核层是 `UI` 无关的，它保证了用户管理的逻辑和状态是不耦合任何一个框架，这样有几个好处：

*   逻辑与 `UI` 框架解耦，未来做框架级别的迁移，业务代码无需大范围重构
    
*   学习成本统一，如果用户使用了`@formily/react`，以后业务迁移`@formily/vue`，用户不需要重新学习
    

`JSON Schema` 独立存在，给 `UI` 桥接层消费，保证了协议驱动在不同 `UI` 框架下的绝对一致性，不需要重复实现协议解析逻辑。

扩展组件层，提供一系列表单场景化组件，保证用户开箱即用。无需花大量时间做二次开发。

### 核心优势

*   高性能
    
*   开箱即用
    
*   联动逻辑实现高效
    
*   跨端能力，逻辑可跨框架，跨终端复用
    
*   动态渲染能力
    

### 核心劣势

学习成本较高，虽然 2.x 已经在大量收敛概念，但还是存在一定的学习成本。

### 最后

文章的最后, 希望这款开源解决方案能够帮助到大家, 同时也欢迎各位 `coder` 们支持点赞该开源库, 让它越来越好~

**github: https://github.com/alibaba/formily**

同时, 如果大家对前端可视化, 工程化感兴趣, 也可以关注以下几个项目, 目前正持续迭代中:

*   H5-Dooring
    
*   V6.dooring
    
*   DooringX❤️ 看完三件事
    

```
1. JavaScript 重温系列（22篇全）

2. ECMAScript 重温系列（10篇全）

3. JavaScript设计模式 重温系列（9篇全）
4. 正则 / 框架 / 算法等 重温系列（16篇全）
5. Webpack4 入门（上）|| Webpack4 入门（下）
6. MobX 入门（上） ||  MobX 入门（下）
7. 120+篇原创系列汇总

回复“加群”与大佬们一起交流学习~

点击“阅读原文”查看 130+ 篇原创文章

```