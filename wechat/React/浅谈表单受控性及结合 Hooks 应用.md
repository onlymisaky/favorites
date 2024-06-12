> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/9EiG58QlrAYYeL7Y0sN-mg)

  

  

![](https://mmbiz.qpic.cn/sz_mmbiz_png/sticlevzdTICEAUISXK9cLQ2veJxyaDZVNgSyA1LRVdhoCg7pwZ6VdYst6jetibBfe3rTiauBIvibibru1aeicWiczB6A/640?wx_fmt=png&from=appmsg)

1 前言
----

`form` 几乎是 web 开发中最常用的元素之一，而作为前端接口仔和表单的关系可以说紧密而不可分割。在本文中将介绍在 `React` 中受控和非受控表单是如何使用的，以及现代化使用 `hooks` 来管理 `form` 状态。

2 受控和非受控表单差异
------------

### 2.1 受控表单的特点和使用场景

>  
> 
> 受控表单是指表单元素的值受 React 组件的 state 或 props 控制。特点:

表单元素的值保存在组件的 state 中，以便在需要时进行访问、验证或提交。每当用户输入发生变化时，需要手动更新 state 来反映新的值。可以通过 state 的值来进行表单元素的验证，并提供实时的错误提示。

使用场景：

*   需要对用户输入进行验证和处理的表单
    
*   需要实时反映用户输入的值的表单
    
*   需要根据表单元素的值动态地改变其他组件的状态或行为等情况时会使用到受控表单 示例代码：
    

```
import React, { useState } from 'react';

function ControlledForm() {
  const [phone, setPhone] = useState('');
  const handlePhoneChange = (e) => {
    setName(e.target.value);
  }
  const handleSubmit = (e) => {
    e.preventDefault();
    // 处理表单提交逻辑
  }
  return (
    <form onSubmit={handleSubmit}>
      <label>
        Phone:
        <input type="text" value={phone} onChange={handlePhoneChange} />
      </label>
      <button type="submit">Submit</button>
    </form>
  );
}

export default ControlledForm;
```

### 2.2 非受控表单的特点和使用场景

>  
> 
> 非受控表单是指表单元素的值不受 React 组件的 state 或 props 控制，而是将表单数据交给 DOM 节点来处理，可以使用 Ref 来获取数据。特点：

表单元素的值不会保存在组件的 state 中，而是通过 DOM 来获取。

可以通过 ref 来获取表单元素的值，而不需要手动更新 state。

不需要处理 state 的变化，可以减少代码量。

使用场景：

*   对于简单的表单，不需要对用户输入进行验证和处理。
    
*   需要获取表单元素的值进行一些简单的操作，如发送请求或更改 URL 等。
    

```
import React, { useRef } from 'react';

 function UncontrolledForm() {
   const nameInputRef = useRef(null);

   const handleSubmit = (e) => {
     e.preventDefault();
     const name = nameInputRef.current.value;
   }

   return (
     <form onSubmit={handleSubmit}>
       <label>
         Name:
         <input type="text" ref={nameInputRef} />
       </label>
       <button type="submit">Submit</button>
     </form>
   );
 }

 export default UncontrolledForm;
```

### 2.3 对比受控和非受控表单的差异

<table><thead><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204);"><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); min-width: 85px;"><strong>特点</strong></th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); min-width: 85px;"><strong>受控表单</strong></th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); min-width: 85px;"><strong>非受控表单</strong></th></tr></thead><tbody><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204);"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">value 管理</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">🙆受控表单元素的值保存在组件的 state 中，方便访问和操作</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">🙅非受控组件需要依赖 ref 来获取元素值，并且会受到组件生命周期变更而影响值</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">验证和实时性</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">🙆可以实时验证和处理用户输入</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">🙅不利于实时反映用户输入的值，不方便对用户输入进行验证和处理</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204);"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">表单的整体控制</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">🙆对表单数据有更好的控制</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">🙅对表单数据的控制有限</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">数据流</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">🙆可以根据表单元素的值动态地改变其他组件的状态或行为</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">🙅需要通过 ref 来获取表单元素的值，不符合 React 的数据流思想。</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204);"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">代码复杂性</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">🙅需要更多的代码来处理表单元素的变化和验证。对于复杂的表单，可能会引入大量的 state 和事件处理函数，导致代码冗长。</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">🙆代码量较少，不需要处理 state 的变化。对于简单的表单，可以更快地实现功能。</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">dom 更新性能</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">🙅 频繁的 setState 触发视图的重新渲染可能会导致性能问题。</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">🙆通过 defaultValue 来设置组件的默认值, 它仅会被渲染一次, 在后续的渲染时并不起作用</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204);"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">使用场景</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">基本为最佳实践</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">一般作为简易实现</td></tr></tbody></table>

3 使用 Hooks 管理 form 的优势
----------------------

>  
> 
> 以 ant3 到 ant4 的差异为例

### antd3 中`form` 组件设计思想：

使用`HOC`（高阶组件）包裹 `form` 表单，`HOC` 组件中的 `state` 存储所有的控件 `value` 值，定义设置值和获取值的方法

存在缺陷：

由于 HOC 的设计 ,`state` 存于顶级组件，即便只有一个表单控件 `value` 值改变，所有的子组件也会因父组件 `rerender` 而 `render`, 浪费了性能

总结：

`ant3` 时代的 `form` 可以说 “完美” 继承了受控表单的缺点，`getFieldDecorator` 的 `HOC` 包裹表单控件的形式，并没有对 `Field` 自身管理状态。一个表单控件 `value` 值改变，便会影响整个表单查询渲染

### antd4 中 `form` 组件设计思想：

使用 `Context` 包裹 `form` 表单，并在 `useForm()` 时创建一个 `FormStore` 实例，并通过 `useRef` 缓存所有的表单 value 值，定义设置值和获取值得方法。

利用 `useRef` 的特性，在调用 `useForm` 的组件中，从创建到销毁等各种生命周期，无论组件渲染多少次，`FormStore` 只会实例化一次，在每个 `Field` 中定义 `forceUpdate()` 强制更新组件。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/sticlevzdTICEAUISXK9cLQ2veJxyaDZVENQjGAARIe63zFDXbHAMVwAIuJhX0FAkU0bUu0F0Ub18k3Gaq9nXCw/640?wx_fmt=png&from=appmsg)

```
// rc-form-field
// Field.tsx
public reRender() {
  if (!this.mounted) return;
  this.forceUpdate();
}
.....
public onStoreChange: FieldEntity['onStoreChange'] = (prevStore, namePathList, info) => {
...
case 'remove': {
  if (shouldUpdate) {
    this.reRender();
    return;
  }
  break;
}
case 'setField': {
   if (namePathMatch) {
     const { data } = info;
     // FieldData 处理,touched/warning/error/validate
     ...
     this.dirty = true;  
     this.triggerMetaEvent();
     // setField 时 field 绑定 name 匹配时强制更新 
     this.reRender();
     return;
   }
  // setField 携带 shouldUpdate 的控件时更新
  if (
    shouldUpdate &&
    !namePath.length &&
    requireUpdate(shouldUpdate, prevStore, store, prevValue, curValue, info)
  ) {
    this.reRender();
    return;
  }
  break;
case 'dependenciesUpdate': {
  /**
  * 当标记了的`dependencies`更新时触发. 相关联的`Field`会更新
  */
  const dependencyList = dependencies.map(getNamePath);
  // No need for `namePathMath` check and `shouldUpdate` check, since `valueUpdate` will be
  // emitted earlier and they will work there
  // dependencies 不应和 shouldUpdate 一起使用，可能会导致没必要的 rerender
  if (dependencyList.some(dependency => containsNamePath(info.relatedFields, dependency))) {
    this.reRender();
    return;
  }
  break;
}
default:
  if (
    namePathMatch ||
    ((!dependencies.length || namePath.length || shouldUpdate) &&
     requireUpdate(shouldUpdate, prevStore, store, prevValue, curValue, info))
  ) {
    this.reRender();
    return;
  }
  break;
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/sticlevzdTICEAUISXK9cLQ2veJxyaDZVns2WAdeIbKDP6uUeb7ou8Apte0WEQyGEI5cWyvcmSiaR9Ln0Y6jGJ9Q/640?wx_fmt=png&from=appmsg)

总结：

`rc-form-field` 中用 `useRef` 缓存表单状态，使得表单状态不会直接受控件影响，而是在 `setField`/`shouldUpdate`/`dependenciesUpdate` 等逻辑触发时强制更新相依赖的控件，不会造成整个表单重新渲染的过多损耗。另外区别于 `ant3` 中 `HOC` 形式包裹的控件，`rc-form-field` 中提供的独立的 `Field` 组件概念和对应的 `hooks`，提供对控件本身直接操作的可能

4 不走寻常路的 react-hook-form
------------------------

>  
> 
> 不同于 rc-field-form 中使用的受控表单来做表单状态管理，`react-hook-form` 使用了 React 的 `useRef` 和 `useReducer` 来处理表单数据的状态，而不是使用 React 的 `useState` 来追踪表单数据的变化。具备非受控表单的优点以提高性能，并使代码更简洁。 `react-hook-form` 的最简 `demo` 如下

```
import React from "react";
import { useForm } from "react-hook-form";

function MyForm() {
    const onSubmit = (data) => {
      console.log(data);
    };
    const { register, handleSubmit, formState: { errors } } = useForm();
    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        <input {...register("firstName", { required: true })} />
        {errors.firstName && <p>First name is required.</p>}
        <input {...register("lastName", { required: true })} />
        {errors.lastName && <p>Last name is required.</p>}
        <button type="submit">Submit</button>
      </form>
    );
}
```

为什么会说 `react-hook-form` 提供的是一个非受控表单，其实就需要细究一下这个 `...register` 到底返回了什么

```
// react-hook-form createFormControl
const register: UseFormRegister<TFieldValues>
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/sticlevzdTICEAUISXK9cLQ2veJxyaDZV8Vl8iaYGWWw4gUg8vGVqFNnmTJSsucg3HwbdaSEWIPyzkFjxBlsCeiaQ/640?wx_fmt=png&from=appmsg)

可以看到 `register` 返回里并没有 `value` 字段，那么这个表单控件的值并不受控，`state` 只存于控件内部，对控件的更新也只会影响自身的更新。

以非受控表单形式实现的 `react-hook-form` 采用订阅模式来实现不同场景：

看完两件事
-----

如果你觉得这篇内容对你挺有启发，我想邀请你帮我两件小事

1. 点个「**在看**」，让更多人也能看到这篇内容（点了「**在看**」，bug -1 😊）

2. 关注公众号「**政采云技术**」，持续为你推送精选好文

招贤纳士
----

政采云技术团队（Zero），Base 杭州，一个富有激情和技术匠心精神的成长型团队。政采云前端团队（ZooTeam），一个年轻富有激情和创造力的前端团队。团队现有 80 余个前端小伙伴，平均年龄 27 岁，近 4 成是全栈工程师，妥妥的青年风暴团。成员构成既有来自于阿里、网易的 “老” 兵，也有浙大、中科大、杭电等校的应届新人。团队在日常的业务对接之外，还在物料体系、工程平台、搭建平台、智能化平台、性能体验、云端应用、数据分析、错误监控及可视化等方向进行技术探索和实战，推动并落地了一系列的内部技术产品，持续探索前端技术体系的新边界。

如果你想改变一直被事折腾，希望开始能折腾事；如果你想改变一直被告诫需要多些想法，却无从破局；如果你想改变你有能力去做成那个结果，却不需要你；如果你想改变你想做成的事需要一个团队去支撑，但没你带人的位置；如果你想改变本来悟性不错，但总是有那一层窗户纸的模糊… 如果你相信相信的力量，相信平凡人能成就非凡事，相信能遇到更好的自己。如果你希望参与到随着业务腾飞的过程，亲手推动一个有着深入的业务理解、完善的技术体系、技术创造价值、影响力外溢的前端团队的成长历程，我觉得我们该聊聊。任何时间，等着你写点什么，发给 `ZooTeam@cai-inc.com`