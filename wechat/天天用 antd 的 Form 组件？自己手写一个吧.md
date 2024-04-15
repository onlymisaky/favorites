> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/2AjvjGIChglrR_Oo8JdgTA)

大家写中后台系统的时候，应该都用过 Ant Design 的 Form 组件：

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/YprkEU0TtGiakRh8BDLeckDBH1mKwchShoHwzyhhtqLRpkNicPPduNsIGrrF500UynvN9uEcpX2zqSbFU7hqOn2A/640?wx_fmt=gif&from=appmsg)![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiakRh8BDLeckDBH1mKwchSh64MTrceBrKYKmhRtHkhSeXA5qeCNr7goOyPB5PzIoA5baFAeQWULGQ/640?wx_fmt=png&from=appmsg)

用 Form.Item 包裹 Input、Checkbox 等表单项，可以定义 rules，也就是每个表单项的校验规则。

外层 Form 定义 initialValues 初始值，onFinish 当提交时的回调，onFinishFailed 当提交有错误时的回调。

Form 组件每天都在用，那它是怎么实现的呢？

其实原理不复杂。

每个表单项都有 value 和 onChange 参数，我们只要在 Item 组件里给 children 传入这俩参数，把值收集到全局的 Store 里。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiakRh8BDLeckDBH1mKwchShhCYwz9L4Oq7EhcEC8RUo1K61cumv7qxbD51Ad9seQRwC0icmtiaiamj6w/640?wx_fmt=png&from=appmsg)

这样在 Store 里就存储了所有表单项的值，在 submit 时就可以取出来传入 onFinish 回调。

并且，还可以用 async-validator 对表单项做校验，如果有错误，就把错误收集起来传入 onFinishFailed 回调。

那这些 Item 是怎么拿到 Store 来同步表单值的呢？

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiakRh8BDLeckDBH1mKwchShUgeXgEl0kqdZfCXkBdk0z9BSty5VKsWHnlOaMnpF5m1jFK9d5N2LmA/640?wx_fmt=png&from=appmsg)

用 Context。

在 Form 里保存 Store 到 Context，然后在 Item 里取出 Context 的 Store 来，同步表单值到 Store。

我们来写下试试：

```
npx create-vite
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiakRh8BDLeckDBH1mKwchShvopLf8p51Xkm8SNxUvXyMP60J1ArA82IlDShsUx5ziahBbMWn2sIhbg/640?wx_fmt=png&from=appmsg)

安装依赖，改下 main.tsx

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiakRh8BDLeckDBH1mKwchShjh0Tjbpa3wfBeW7icn60qIBNiby1AeRotEuRiaicJoKNCOryfN6h3ibgKrw/640?wx_fmt=png&from=appmsg)

然后创建 Form/FormContext.ts

```
import { createContext } from 'react';export interface FormContextProps {  values?: Record<string, any>;  setValues?: (values: Record<string, any>) => void;  onValueChange?: (key: string, value: any) => void;  validateRegister?: (name:string, cb: Function) => void;}export default createContext<FormContextProps>({})
```

在 context 里保存 values 也就是 Store 的值。

然后添加 setValues 来修改 values

onValueChange 监听 value 变化

validateRegister 用来注册表单项的校验规则，也就是 rules 指定的那些。

然后写下 Form 组件 Form/Form.tsx

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiakRh8BDLeckDBH1mKwchShSjdOFL51DgUsQWWlw41rX9ak5ibkhBhaibBmpDGxwkCe1qbLPanyAr2g/640?wx_fmt=png&from=appmsg)

参数传入初始值 initialValues、点击提交的回调 onFinish、点击提交有错误时的回调 onFinishFailed。

这里的 Record<string,any> 是 ts 的类型，任意的对象的意思。

用 useState 保存 values，用 useRef 保存 errors 和 validator

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiakRh8BDLeckDBH1mKwchShZeK6PMfv7sgpaIvVm37iaOGHLib4ToXpU4V2mtfRAklo0lMJg3N9rt7Q/640?wx_fmt=png&from=appmsg)

为什么不都用 useState 呢？

因为修改 state 调用 setState 的时候会触发重新渲染。

而 ref 的值保存在 current 属性上，修改它不会触发重新渲染。

errors、validator 这种就是不需要触发重新渲染的数据。

然后 onValueChange 的时候就是修改 values 的值。

submit 的时候调用 onFinish，传入 values，再调用所有 validator 对值做校验，如果有错误，调用 onFinishFailed 回调：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiakRh8BDLeckDBH1mKwchShB89r7KfFlCNJfOoYJJia91T0PH8flg7KrQgohiaasYYd1hfhuNdBTe4w/640?wx_fmt=png&from=appmsg)

然后把这些方法保存到 context 中，并且给原生 form 元素添加 onSubmit 的处理：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiakRh8BDLeckDBH1mKwchSh5Ge8laz7R4jNrcteo8Ba9NribCmqhNTCRrDJKYYr0d4ks8nfC3rzGEA/640?wx_fmt=png&from=appmsg)

```
import React, { CSSProperties, useState, useRef, FormEvent, ReactNode } from 'react';import classNames from 'classnames';import FormContext from './FormContext';export interface FormProps extends React.HTMLAttributes<HTMLFormElement> {    className?: string;    style?: CSSProperties;    onFinish?: (values: Record<string, any>) => void;    onFinishFailed?: (errors: Record<string, any>) => void;    initialValues?: Record<string, any>;    children?: ReactNode}const Form = (props: FormProps) => {    const {         className,         style,        children,         onFinish,        onFinishFailed,        initialValues,        ...others     } = props;    const [values, setValues] = useState<Record<string, any>>(initialValues || {});    const validatorMap = useRef(new Map<string, Function>());    const errors = useRef<Record<string, any>>({});    const onValueChange = (key: string, value: any) => {        values[key] = value;    }    const handleSubmit = (e: FormEvent) => {        e.preventDefault();        for (let [key, callbackFunc] of validatorMap.current) {            if (typeof callbackFunc === 'function') {                errors.current[key] = callbackFunc();            }        }        const errorList = Object.keys(errors.current).map(key => {                return errors.current[key]        }).filter(Boolean);        if (errorList.length) {            onFinishFailed?.(errors.current);        } else {            onFinish?.(values);        }    }    const handleValidateRegister = (name: string, cb: Function) => {        validatorMap.current.set(name, cb);    }    const cls = classNames('ant-form', className);    return (        <FormContext.Provider            value={{                onValueChange,                values,                setValues: (v) => setValues(v),                validateRegister: handleValidateRegister            }}        >            <form {...others} className={cls} style={style} onSubmit={handleSubmit}>{children}</form>        </FormContext.Provider>    );}export default Form;
```

这里用到了 classnames 包要安装下：

```
npm install --save classnames
```

接下来添加 Form/Item.tsx，也就是包装表单项用的组件：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiakRh8BDLeckDBH1mKwchSh7odzJrFticeibicvYs8KIjOxzGwJI0Xiat1gDgiaOWMZ6I96YAIs1RF9ygA/640?wx_fmt=png&from=appmsg)

首先是参数，可以传入 label、name、valuePropName、rules 等：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiakRh8BDLeckDBH1mKwchShkdfYmNQ3czSsJ4N0kmuQzteHpcliaSj6IbFoLDUzxO0gyV8jMYt8edA/640?wx_fmt=png&from=appmsg)

valuePropName 默认是 value，当 checkbox 等表单项就要取 checked 属性了：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiakRh8BDLeckDBH1mKwchSheibxC0koOgNkO8TDiaORYKZ830Fj7PMdnQfJbetmXoYFXITwHOIROcHg/640?wx_fmt=png&from=appmsg)

这里 children 类型为 ReactElement 而不是 ReactNode。

因为 ReactNode 除了包含 ReactElement 外，还有 string、number 等：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiakRh8BDLeckDBH1mKwchShMiasgVtchhWXj2vnnjCSRh28OuhWhkc8DCjLzDchsuLQFwptrx7icquw/640?wx_fmt=png&from=appmsg)

而作为 Form.Item 组件的 children，只能是 ReactElement。

然后实现下 Item 组件：

如果没有传入 name 参数，那就直接返回 children。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiakRh8BDLeckDBH1mKwchSh9icJtnb30hr2hkibnAREVO9T4G30Ehyia9SpjafXR3ciaIlzEibm1XTgAwA/640?wx_fmt=png&from=appmsg)

比如这种就不需要包装：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiakRh8BDLeckDBH1mKwchShticQ9KNe8crPdvsK5LHmaHKPltSV0cnqp6sjtLumsqbQAEEjcFibEVKw/640?wx_fmt=png&from=appmsg)

创建两个 state，分别存储表单值 value 和 error。

从 context 中读取对应 name 的 values 的值，同步设置 value：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiakRh8BDLeckDBH1mKwchShsdgLVUd0NSdvZEJMIslyx9AaJz6M7iaesLEcYowgSDhVrQHtbgsdRRw/640?wx_fmt=png&from=appmsg)

然后 React.cloneElement 复制 chilren，额外传入 value、onChange 等参数：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiakRh8BDLeckDBH1mKwchShOSjpYnSX4KxY2WLn6xm2ATIFmvwGrmz20AITLzTicgfHPVibR571HhJQ/640?wx_fmt=png&from=appmsg)

onChange 回调里设置 value，并且修改 context 里的 values 的值：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiakRh8BDLeckDBH1mKwchShdwzVAyfOMckufcUB0hxmcK0OgkNJlRECZGEXCyB2DOrqUdtgvEwzmQ/640?wx_fmt=png&from=appmsg)

这里的 getValueFromEvent 是根据表单项类型来获取 value：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiakRh8BDLeckDBH1mKwchShhIhXfqvIzmSt7WdKHql22SK8U1ZvqwGYhUiapsttiayRaOtZbFYQKasQ/640?wx_fmt=png&from=appmsg)

然后是校验 rules，这个是用 async-validator 这个包：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiakRh8BDLeckDBH1mKwchSh4TaYlbTKTic03UglxpOa8q6PCXv0xpwPE5HljgOicFqwdK9lzLRcl0EA/640?wx_fmt=png&from=appmsg)

在 context 注册 name 对应的 validator 函数：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiakRh8BDLeckDBH1mKwchShJ74Aibia6tVGHrcK1CibkePTPuJLia2hPJMscjib3IRmvznjicehIhhSibWrQ/640?wx_fmt=png&from=appmsg)

然后 Item 组件渲染 label、children、error

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiakRh8BDLeckDBH1mKwchShEWhXP3ArsMuKodYpSzHhIsvAzJKUo5j2tIP9CsDqVLcSfibIV6H2hEg/640?wx_fmt=png&from=appmsg)

```
import React, { ReactNode, CSSProperties, useState, useContext, ReactElement, useEffect, PropsWithChildren, ChangeEvent } from 'react';import classNames from 'classnames';import Schema, { Rules } from 'async-validator';import FormContext from './FormContext';export interface ItemProps{    className?: string;    style?: CSSProperties;    label?: ReactNode;    name?: string;    valuePropName?: string;    rules?: Array<Record<string, any>>;    children?: ReactElement}const getValueFromEvent = (e: ChangeEvent<HTMLInputElement>) => {    const { target } = e;    if (target.type === 'checkbox') {        return target.checked;    } else if (target.type === 'radio') {        return target.value;    }    return target.value;}const Item = (props: ItemProps) => {    const {         className,        label,        children,        style,        name,        valuePropName,        rules,    } = props;    if(!name) {        return children;    }    const [value, setValue] = useState<string | number | boolean>();    const [error, setError] = useState('');    const { onValueChange, values, validateRegister } = useContext(FormContext);    useEffect(() => {        if (value !== values?.[name]) {            setValue(values?.[name]);        }    }, [values, values?.[name]])    const handleValidate = (value: any) => {        let errorMsg = null;        if (Array.isArray(rules) && rules.length) {            const validator = new Schema({                [name]: rules.map(rule => {                    return {                        type: 'string',                        ...rule                    }                })            });            validator.validate({ [name]:value }, (errors) => {                if (errors) {                    if (errors?.length) {                        setError(errors[0].message!);                        errorMsg = errors[0].message;                    }                } else {                    setError('');                    errorMsg = null;                }            });        }        return errorMsg;    }    useEffect(() => {        validateRegister?.(name, () => handleValidate(value));    }, [value]);    const propsName: Record<string, any> = {};    if (valuePropName) {        propsName[valuePropName] = value;    } else {        propsName.value = value;    }    const childEle = React.Children.toArray(children).length > 1 ? children: React.cloneElement(children!, {        ...propsName,        onChange: (e: ChangeEvent<HTMLInputElement>) => {            const value = getValueFromEvent(e);            setValue(value);            onValueChange?.(name, value);            handleValidate(value);        }    });    const cls = classNames('ant-form-item', className);    return (        <div className={cls} style={style}>            <div>                {                    label && <label>{label}</label>                }            </div>            <div>                {childEle}                {error && <div style={{color: 'red'}}>{error}</div>}            </div>        </div>    )}export default Item;
```

安装用到的 async-validator：

```
npm install --save async-validator
```

然后在 Form/index.tsx 导出下：

```
import InternalForm from './Form';import Item from './Item';type InternalFormType = typeof InternalForm;interface FormInterface extends InternalFormType {  Item: typeof Item;} const Form = InternalForm as FormInterface;Form.Item = Item;export default Form;
```

主要是把 Item 挂在 Form 下。

在 App.tsx 测试下：

```
import { Button, Checkbox, Input } from "antd";import Form from "./Form/index";const Basic: React.FC = () => {  const onFinish = (values: any) => {    console.log('Success:', values);  };  const onFinishFailed = (errorInfo: any) => {    console.log('Failed:', errorInfo);  };  return (    <Form      initialValues={{ remember: true, username: '神说要有光' }}      onFinish={onFinish}      onFinishFailed={onFinishFailed}    >      <Form.Item        label="Username"                rules={[          { required: true, message: '请输入用户名!' },          { max: 6, message: '长度不能大于 6' }        ]}      >        <Input />      </Form.Item>      <Form.Item        label="Password"                rules={[{ required: true, message: '请输入密码!' }]}      >        <Input.TextArea />      </Form.Item>      <Form.Item  >            登录          </Button>        </div>      </Form.Item>    </Form>  );};export default Basic;
```

除了 Form 外，具体表单项用的 antd 的组件。

试一下：

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/YprkEU0TtGiakRh8BDLeckDBH1mKwchSh3cyibeI0vMZSIZzGTozugYgZBAvyciadepMHBLvvFdbict4GZNdjb6dbg/640?wx_fmt=gif&from=appmsg)

form 的 initialValues 的设置、表单的值的保存，规则的校验和错误显示，都没问题。

这样，Form 组件的核心功能就完成了。

核心就是一个 Store 来保存表单的值，然后用 Item 组件包裹具体表单，设置 value 和 onChange 来同步表单的值。

当值变化以及 submit 的时候用 async-validator 来校验。

那 antd 的 Form 也是这样实现的么？

基本是一样的。

我们来看下源码：

antd 的 Form 有个叫 FormStore 的类：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiakRh8BDLeckDBH1mKwchSh4SIDoK0VD4roCGHCYDPjX7BGMlZCP4YXEweTPzPVofIOsS09Jr1Bfw/640?wx_fmt=png&from=appmsg)

它的 store 属性保存表单值，然后暴露 getFieldValue、setFieldValue 等方法来读写 store。

然后它提供了一个 useForm 的 hook 来创建 store：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiakRh8BDLeckDBH1mKwchShOqJr6QaPgZ6SKiasX69XqRuAzia6a5UMDjdmVuITxEdXx2JxCzUCzbFw/640?wx_fmt=png&from=appmsg)

用的时候这样用：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiakRh8BDLeckDBH1mKwchShx255VlRtypeJ6rDzPibtonPiaojcIpCjkZFWmufToiaWBYkOhl58V9IZQ/640?wx_fmt=png&from=appmsg)

这样，Form 组件里就可以通过传进来的 store 的 api 来读写 store 了：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiakRh8BDLeckDBH1mKwchShAg7M0FiagKn6jIvuPN0dQchyibN3JxeXiamrice3xQmOy3oJVnVoZcGEjQ/640?wx_fmt=png&from=appmsg)

当然，它会通过 context 把 store 传递下去：![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiakRh8BDLeckDBH1mKwchShs7viblicKicexvt1LTtgGdMZDpA5oj8YnyJwEeQibhUG95YZGK13DiaqEYw/640?wx_fmt=png&from=appmsg)

在 Field 也就是 Item 组件里就通过 context 取出 store 的 api 来读写 store：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiakRh8BDLeckDBH1mKwchShibZG92Bh3A3HxPIaaxicCQibUHC7PXNz4gAAEft1YRUEhMG4Wl6BZTThA/640?wx_fmt=png&from=appmsg)

和我们的实现有区别么？

有点区别，antd 的 FormStore 是可以独立出来的，通过 useForm 创建好传入 Form 组件。

而我们的 Store 没有分离出来，直接内置在 Form 组件里了。

但是实现的思路都是一样的。

提供个 useForm 的 api 的好处是，外界可以拿到 store 的 api 来自己修改 store。

当然，我们也可以通过 ref 来做这个：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiakRh8BDLeckDBH1mKwchSh3yDT4l4lIanJe0VbuiaQdXEtHrgdsibkLx5dFgZRt5auHaPTPZLVoQug/640?wx_fmt=png&from=appmsg)

```
import React, { CSSProperties, useState, useRef, FormEvent, ReactNode, ForwardRefRenderFunction, useImperativeHandle, forwardRef } from 'react';import classNames from 'classnames';import FormContext from './FormContext';export interface FormProps extends React.HTMLAttributes<HTMLFormElement> {    className?: string;    style?: CSSProperties;    onFinish?: (values: Record<string, any>) => void;    onFinishFailed?: (errors: Record<string, any>) => void;    initialValues?: Record<string, any>;    children?: ReactNode}export interface FormRefApi {    getFieldsValue: () => Record<string, any>,    setFieldsValue: (values: Record<string, any>) => void,}const Form= forwardRef<FormRefApi, FormProps>((props: FormProps, ref) => {    const {         className,         style,        children,         onFinish,        onFinishFailed,        initialValues,        ...others     } = props;    const [values, setValues] = useState<Record<string, any>>(initialValues || {});    useImperativeHandle(ref, () => {        return {            getFieldsValue() {                return values;            },            setFieldsValue(values) {                for(let [key, value] of Object.entries(values)) {                    values[key] = value                }                setValues(values);            }        }    }, []);    const validatorMap = useRef(new Map<string, Function>());    const errors = useRef<Record<string, any>>({});    const onValueChange = (key: string, value: any) => {        values[key] = value;    }    const handleSubmit = (e: FormEvent) => {        e.preventDefault();        for (let [key, callbackFunc] of validatorMap.current) {            if (typeof callbackFunc === 'function') {                errors.current[key] = callbackFunc();            }        }        const errorList = Object.keys(errors.current).map(key => {                return errors.current[key]        }).filter(Boolean);        if (errorList.length) {            onFinishFailed?.(errors.current);        } else {            onFinish?.(values);        }    }    const handleValidateRegister = (name: string, cb: Function) => {        validatorMap.current.set(name, cb);    }    const cls = classNames('ant-form', className);    return (        <FormContext.Provider            value={{                onValueChange,                values,                setValues: (v) => setValues(v),                validateRegister: handleValidateRegister            }}        >            <form {...others} className={cls} style={style} onSubmit={handleSubmit}>{children}</form>        </FormContext.Provider>    );})export default Form;
```

然后在 App.tsx 试试：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiakRh8BDLeckDBH1mKwchShOEQC0pX3FSgPJdZrllxGiaoEMFcnD9E5PousmYAb8ncDibPWAricicODxQ/640?wx_fmt=png&from=appmsg)

```
import { Button, Checkbox, Input } from "antd";import Form from "./Form/index";import { useEffect, useRef } from "react";import { FormRefApi } from "./Form/Form";const Basic: React.FC = () => {  const onFinish = (values: any) => {    console.log('Success:', values);  };  const onFinishFailed = (errorInfo: any) => {    console.log('Failed:', errorInfo);  };  const form = useRef<FormRefApi>(null);  return (    <>      <Button type="primary" onClick={() => {        console.log(form.current?.getFieldsValue())      }}>打印表单值</Button>      <Button type="primary" onClick={() => {        form.current?.setFieldsValue({          username: '东东东'        })      }}>设置表单值</Button>      <Form        ref={form}        initialValues={{ remember: true, username: '神说要有光' }}        onFinish={onFinish}        onFinishFailed={onFinishFailed}      >        <Form.Item          label="Username"                    rules={[            { required: true, message: '请输入用户名!' },            { max: 6, message: '长度不能大于 6' }          ]}        >          <Input />        </Form.Item>        <Form.Item          label="Password"                    rules={[{ required: true, message: '请输入密码!' }]}        >          <Input.TextArea />        </Form.Item>        <Form.Item  >              登录            </Button>          </div>        </Form.Item>      </Form>    </>  );};export default Basic;
```

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/YprkEU0TtGiakRh8BDLeckDBH1mKwchShSuZVZZ7E4o24yp2m86kqbs90r6TfYQYNTv1gIKgLiaexnqdLicaYVticg/640?wx_fmt=gif&from=appmsg)![](https://mmbiz.qpic.cn/sz_mmbiz_gif/YprkEU0TtGiakRh8BDLeckDBH1mKwchShVSG0KLibpQIliceXgJdHZDJJ7yNh95Tzs5ibJdM2Q6Wc0srerdibzfgQQg/640?wx_fmt=gif&from=appmsg)

当然，你也可以把 store 的 api 处理出来，然后封装个 useForm 的 hook 来传入 Form 组件。

这样，用法比 ref 的方式简单点。

至此，我们就实现了 antd 的 Form 的功能。

案例代码上传了 react 小册仓库：https://github.com/QuarkGluonPlasma/react-course-code/tree/main/form-component

总结
--

我们每天都在用 antd 的 Form 组件，今天自己实现了下。

其实原理不复杂，就是把 Form 的表单项的值存储到 Store 中。

在 Form 组件里把 Store 放到 Context，在 Item 组件里取出来。

用 Item 组件包裹表单项，传入 value、onChange 参数用来同步表单值到 Store。

这样，表单项的值变化或者 submit 的时候，就可以根据 rules 用 async-validator 来校验。

此外，我们还通过 ref 暴露出了 setFieldsValue、getFieldsValue 等 store 的 api。

当然，在 antd 的 Form 里是通过 useForm 这个 hook 来创建 store，然后把它传入 Form 组件来用的。

两种实现方式都可以。

每天都用 antd 的 Form 组件，不如自己手写一个吧！

> 更多内容可以看我的小册《React 通关秘籍》