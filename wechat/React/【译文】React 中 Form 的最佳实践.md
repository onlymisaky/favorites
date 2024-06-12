> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/JikF87PYtxnb9uxEtTtGNA)

> 作者：郜克帅

原文：https://dev.to/ajones_codes/a-better-guide-to-forms-in-react-47f0?utm_source=newsletter.reactdigest.net&utm_medium=newsletter&utm_campaign=a-better-guide-to-forms-in-react

`React` 生态拥有丰富的库、文章、视频和几乎你能想到的所有 `Web` 领域的资料。然而，随着时间的推移，这些资料许多都已经过时，无法满足现代最佳实践的要求了。

最近，我在开发一个 `AI` 项目，里面有许多复杂的动态表单。在研究了许多优秀的 `React` 表单指南之后，我意识到，大多数构建表单的资源都已经过时了，而且往往已经过时很多年。

本文将介绍 `React` 中构建表单的现代最佳实践、如何去构建动态表单、 `RSC（React Server Components）`的表单等等。最后，在理解了这些之后，我将解释我在其他指南中发现的不足，并根据我使用 React 的经验提出建议。

受控与非受控
------

理解 `React` 中表单的关键点在于 “受控” 与 “非受控” 的概念，这是 `React` 中构建表单的两种不同的方法。

受控表单使用 `state` 存储每个 `input` 的值，然后在每次渲染时通过 `value` 属性设置对应 `input`的值。如果其他函数更新了这些 `state`，同样的，对应 `input` 的值也会立刻改变。

如果你的代码没有渲染 `Form`，但相关的 `state` 并不会消失，仍然存在于我们的运行时上下文中。

受控表单往往给予了我们更大的选择，例如比较复杂的、非 `HTML` 标准的表单校验，如检查密码强度和对用户手机号进行格式化。

它们看起来往往是这个样子的：

```
import React, { useState } from 'react'function ControlledForm() {  const [value, setValue] = useState('');  const handleChange = (event) => {    setValue(event.target.value);  };  const handleSubmit = () => {    sendInputValueToApi(value).then(() => /** 业务逻辑... */);  };  return (    <>      <input type="text" value={value} onChange={handleChange} />      <button onClick={handleSubmit}>send</button>    </>  )}
```

注意，用 `<form>` 将 `input` 包裹起来并且给 `input` 一个命名从语义上来讲更加准确，但是这不是必需的。

因为数据已经保存在 `state` 中，所以我们并不需要真正的 `onSubmit`事件，而且在按钮点击时，我们也并不需要直接访问 `input` 的值。

这种方式有一些不足之处：

1.  你可能不想要每次用户输入时都去重新渲染组件。
    
2.  你需要写许多代码去管理复杂的表单，因为随着表单规模的增长，会导致出现大量的 `state` 和 `setSate`，从而使代码变的非常臃肿。
    
3.  构建动态表单将变的非常困难，因为你无法在条件判断中使用像 `useState` 的 `hooks`。为了修复这个问题，你可能需要：
    

4.  整个表单的值将存储在一个巨大的对象中，然而这会导致所有的子组件将在任一其他组件变化时全部重新渲染，因为我们更新的方式是 `setState({ ...preState, field: newValue })`。要解决上述的问题，唯一的办法就是缓存，但这又会增加大量的代码。
    

5.  在大型表单例如表格和 Excel 中，这会导致性能问题。
    

```
import React, { useState } from "react";function CumbersomeForm() {  const [formData, setFormData] = useState({    firstName: "",    lastName: "",    email: "",    address: "",    // ... 可能会有更多的值  });  const handleChange = (e) => {    const { name, value } = e.target;    setFormData((prevState) => ({ ...prevState, [name]: value }));  };  return (    <>      <label>First Name:</label>      <input        type="text"                value={formData.firstName}        onChange={handleChange}      />      <label>Last Name:</label>      <input        type="text"                value={formData.lastName}        onChange={handleChange}      />      <label>Email:</label>      <input        type="email"                value={formData.email}        onChange={handleChange}      />      <label>Address:</label>      <input        type="text"                value={formData.address}        onChange={handleChange}      />      {/* ... 可能会有更多的字段 */}    </>  );}
```

与受控表单不同的是，非受控表单不在 `state` 中存储表单的值。相反，非受控表单使用原生 `HTML` 内置的 `<form>` 的功能和 `JavaScript` 去管理数据。

举例来说，浏览器会帮我们管理状态，我们无需在每次 `input` 改变时使用 `setState` 更新 `state` 并把 `state` 设置到 `input` 的 `value` 属性上，我们的组件不再需要或使用这些 `state`

当组件渲染时，`React` 会将 `onSubmit` 监听器添加到表单上。当提交按钮被点击时，我们的 `handleSubmit` 函数会被执行。与使用 `state`相比，它更接近于不使用任何 `JavaScript` 的普通 `HTML` 表单的工作方式。

```
function UncontrolledForm() {  const handleSubmit = (event) => {    event.preventDefault();    const formData = new FormData(event.target);    const inputValue = formData.get('inputName');    sendInputValueToApi(inputValue).then(() => /* 业务逻辑... */)    };  return (    <form onSubmit={handleSubmit}>      <input type="text" >Send</button>    </form>  );}
```

使用非受控表单的一个好处就是会减少大量的冗余代码：

```
// 受控const [value, setValue] = useState('')const handleChange = (event) => {  setValue(event.target.value);}...<input type="text" value={value} onChange={handleChange} />// 非受控<input type="text"  />
```

即便只有 1 个 `input`，区别也是非常显著的，当有许多 `input` 时，效果会更加明显：

```
function UncontrolledForm() {  const handleSubmit = (event) => {    event.preventDefault();    const formData = new FormData(event.target);    const { name, email, address } = Object.fromEntries(formData);  };  return (    <form onSubmit={handleSubmit}>      <label>First Name:</label>      <input type="text"  />      {/* ... 可能会有更多的字段 */}      <button type="submit">Submit</button>    </form>  );}
```

非受控表单与受控表单相比，没有许多冗余的代码，并且我们不需要手动管理许许多多的 `state` 或一个巨大的对象。事实上，这里根本没有 `state`。这个表单可以有成百上千个子组件但它们不会导致彼此重新渲染。使用这种方式，会让表单性能变的更好、减少大量的冗余代码并且使我们代码的可读性更强。

非受控表单的不足之处是你无法直接访问每个 `input` 的值。这会使自定义校验变的棘手。例如你需要在用户输入手机号的时候格式化手机号。

注意事项
----

### 不要使用 `useRef`

许多文章推荐在非受控表单的每个 `input` 上使用一个 `ref` 而不是使用 `new FormData()`，我认为原因是 FormData API 很少人知道。然而，它在大约十年前已经成为了一个标准并且已经被所有主流浏览器支持。

我强烈建议你不要为表单使用 `useRef`，因为它会像 `useState` 一样引入许多相同的问题和冗余的代码。

然而，确实有一些场景，`ref` 可以帮助我们。

1.  聚焦字段时
    

```
function MyForm() {  const inputRef = useRef(null);  const focusInput = () => {    inputRef.current.focus();  };  return (    <form>      <input ref={inputRef} type="text" />      <button type="button" onClick={focusInput}>        Focus Input      </button>    </form>  );}
```

2.  调用子组件的方法时
    

```
const ChildComponent = React.forwardRef((props, ref) => (  <input ref={ref} type="text" />));function MyForm() {  const inputRef = useRef(null);  const focusInput = () => {    inputRef.current.focus();  };  return (    <form>      <ChildComponent ref={inputRef} />      <button type="button" onClick={focusInput}>        Focus Input      </button>    </form>  );}
```

3.  其他的例如保存 `useEffect` 的前一个值或测量一个元素大小时
    

混合受控与非受控
--------

在许多场景中，你可能需要控制一个或更多的 `input`，当用户在输入手机号码时对其进行格式化是一个非常棒的例子。在这些场景中，即便你正在使用非受控表单，你也可以使用一个受控的 `input`。在这种情况下，也不要使用 `state` 去访问 `input` 的值，继续使用 `new FormData(...)`，仅仅使用 `state` 去管理相关输入的展示。

```
function MixedForm() {  const [phoneNumber, setPhoneNumber] = useState("");  const handlePhoneNumberChange = (event) => {    // 格式化手机号    const formattedNumber = formatPhoneNumber(event.target.value);    setPhoneNumber(formattedNumber);  };  const handleSubmit = (event) => {    event.preventDefault();    const formData = new FormData(event.target);    for (let [key, value] of formData.entries()) {      console.log(`${key}: ${value}`);    }  };  return (    <form onSubmit={handleSubmit}>      <label>Name:</label>      <input type="text"         value={phoneNumber}        onChange={handlePhoneNumberChange}      />      <label>Address:</label>      <input type="text" >Submit</button>    </form>  );}function formatPhoneNumber(number) {  return number.replace(/\D/g, "").slice(0, 10);}
```

注意：尽量减少 `state`，在这个例子中，你不会既想要一个保存原始电话号码的 `useState`，又想要一个用于格式化电话号码的 `useState`，并且因为同步它们还会带来多余的重新渲染的效果。

谈到重新渲染优化，我们可以将受控 `input` 抽离出来以此来减少重新渲染对表单其余部分的影响。

```
const PhoneInput = () => {  const [phoneNumber, setPhoneNumber] = useState("");  const handlePhoneNumberChange = (event) => {    const formattedNumber = formatPhoneNumber(event.target.value);    setPhoneNumber(formattedNumber);  };  return (    <input      type="tel"            value={phoneNumber}      onChange={handlePhoneNumberChange}    />  );};function MixedForm() {  const handleSubmit = (event) => {    event.preventDefault();    const formData = new FormData(event.target);    for (let [key, value] of formData.entries()) {      console.log(`${key}: ${value}`);    }  };  return (    <form onSubmit={handleSubmit}>      <label>Name:</label>      <input type="text" >Submit</button>    </form>  );}function formatPhoneNumber(number) {  return number.replace(/\D/g, "").slice(0, 10);}
```

如果你用过受控 `input`，那么看完上面代码之后，你可能会想：“没有传递任何 `setState` 或 `ref`， 父组件是如何知道子组件的值”。为了理解这个问题，请记住，当 `React` 代码被渲染成 `HTML` 时，浏览器只会看到 `Form` 和它里面的 `inputs`，包括 `<PhoneInput />` 渲染的 `input`。

我们的组件组合方式对我们渲染的 `HTML` 没有功能上的影响。因此，那个 `input` 的值会像其他字段一样被包含在 `FormData` 中。这就是组件组合和封装的力量。我们可以将重新渲染控制在最小影响范围内，与此同时，`DOM` 依然像原生 `HTML` 一样呈现。

等等... 我如何在非受控 input 中做校验？
-------------------------

考虑到这个问题的并非只有你一个！当在提交前需要校验时，`React` 开发者往往会倾向于去使用受控组件。

许多开发者并没有意识到，你并不需要 `React` 或自定义的 `JavaScript` 做这些校验。事实上，有一些原生的属性已经支持了这些事情。请参阅 MDN 查看更多的细节：https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation

在不使用任何 `JavaScript` 的前提下，你可以设置 `input` 必填、设置长度限制和用正则表达式设置格式要求。

错误处理
----

在相关的讨论中，在我们需要在客户端展示错误信息的时候，开发者通常会选择受控表单来解决这个问题。然而，我会优先选择使用非受控组件并在我的 `onSubmit` 函数里面做校验和错误管理，而不是使用受控组件并在每次 `input` 改变时更新对应的 `state`。这种方式可以尽量减少 `state` 和 `setState` 的数量。

```
function UncontrolledForm() {  const [errors, setErrors] = useState({});  const handleSubmit = (event) => {    event.preventDefault();    const formData = new FormData(event.target);    let validationErrors = {};    // 自定义校验：确保邮箱的域名是："example.com"    const email = formData.get("email");    if (email && !email.endsWith("@example.com")) {      validationErrors.email = "Email must be from the domain example.com.";    }    if (formData.get("phoneNumber").length !== 10) {      validationErrors.phoneNumber = "Phone number must be 10 digits.";    }    if (Object.keys(validationErrors).length > 0) {      setErrors(validationErrors);    } else {      console.log(Array.from(formData.entries()));       // 清空之前的值      setErrors({});    }  };  return (    <form onSubmit={handleSubmit}>      <label>Name:</label>      <input type="text"  required />      {errors.name && <div class>{errors.name}</div>}      <label>Email (must be @example.com):</label>      <input type="email"  required />      {errors.email && <div class>{errors.email}</div>}      <label>Phone Number (10 digits):</label>      <input type="tel" \d{10}" />      {errors.phoneNumber && <div class>{errors.phoneNumber}</div>}      <button type="submit">Submit</button>    </form>  );}export default UncontrolledForm;
```

服务端组件中的 Form
------------

`React Server Components(RSC)` 使用服务端框架去渲染部分组件，通过这种办法可以减少浏览器访问你网站时下载的 `JavaScript` 的数量。这可以显著地提升你网站的性能。

`RSC` 对我们编写表单的方式有很大的影响。因为，对于首次渲染来说，如果我们没有使用 `state`，它们可以在服务端被渲染并不附带任何 `JavaScript` 文件给浏览器。这意味着，非受控表单即使在没 `JavaScript`的情况下也可以交互，意味着它们可以更早的工作而不用等待 `JavaScript` 去下载然后运行。这可以让你的网站体验更加丝滑。

使用 `Next.js`，你可以在你的表单中使用 `Server Actions`，因此你不需要去为了你的表单交互写一个 API。你需要准备的只是一个事件处理函数。你可以在 Next.js 的文档中找到关于这个主题的更多内容或者观看是 Lee 的视频。

如果你要在 `RSC` 中混合一些受控表单，请确保把它们抽离为单独的客户端组件，就像上面的 `<PhoneInput />` 一样。这可以尽可能的减少需要打包的 `JavaScript` 文件。

```
// page.jsximport { PhoneInput } from "./PhoneInput";export default function Page() {  async function create(formData: FormData) {    "use server";    // ... use the FormData  }  return (    <form action={create}>      <label>Name:</label>      <input type="text" >Submit</button>    </form>  );}// PhoneInput.jsx"use client";function formatPhoneNumber(number) {  return number.replace(/\D/g, "").slice(0, 10);}import { useState } from "react";export const PhoneInput = () => {  const handlePhoneNumberChange = (event) => {    const formattedNumber = formatPhoneNumber(event.target.value);    setPhoneNumber(formattedNumber);  };  const [phoneNumber, setPhoneNumber] = useState("");  return (    <input      type="tel"            value={phoneNumber}      onChange={handlePhoneNumberChange}    />  );};
```

Form 库
------

在 `React` 生态中有许多为受控表单设计的优秀的库。最近我一直在使用 `React Hook Form` 来处理这些应用，不过我更倾向于使用非受控表单，因为不需要额外的库来管理表单状态。（一些流行的库：`React Hook Form`、`Formik`和`Informed`）

总结、对比和推荐
--------

因为 Google 搜索 `react forms` 时排名靠前的文章令人感到困惑、过时或具有误导性，因此我写了本文。

*   其中一篇文章说：“`React` 中更通用的方式是受控表单”，我不认为受控或非受控谁更通用。实际上，正如上文所述，这两种类型都有其用武之地。事实上，许多旧文章都推荐使用受控表单，同时理由同样含糊不清或具有误导性。
    
*   没有一篇排名靠前的文章使用 `FormData`。对于非受控表单，至少两篇文章推荐使用 `useRef`，这同样会让你的代码变的不灵活且臃肿。
    
*   一些排名靠前的文章仍然在使用类组件，没有提到函数式组件😂。
    

一些总结性的看法：

1.  以我的经验来看，许多表单都是受控和不受控混合的。我们之所以有这两种选择，是因为我们有灵活性，不应该教条主义。我们可以使用同时使用它们，就像上面的 `RSC` 例子一样。
    
2.  时至今日，我更偏爱于使用非受控表单，我认为这会简化代码结构并优化性能。
    
3.  认真的说，在 `onSubmit` 函数中使用 `new FormData(...)`而不要使用 `useRef`。
    
4.  封装和组合受控表单去尽量减少 `state` 更新对其他组件的影响，并依靠组合后的 DOM 来处理提交事件。
    

我希望这篇文章可以帮助到你！