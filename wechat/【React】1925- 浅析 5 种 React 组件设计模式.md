> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/eEEQkv4ULOUK8-zBSafiFw) ![](https://mmbiz.qpic.cn/sz_mmbiz_png/sticlevzdTIBsUBeoL1JI75YVukUpicGeloLIACqKjLiciaQmP8o6rFDibezJyFmGbnO6zO8cSagKaVUCNR8kDG4KWA/640?wx_fmt=png&from=appmsg)

作为一名 React 开发者，你可能会面临下面几个问题：

*   如何构建一个高复用度性的组件，使其适应不同的业务场景？
    
*   如何构建一个具有简单 `API`的组件，使其易于使用？
    
*   如何构建一个在 UI 和功能方面具有可扩展性的组件？
    

为解决上述问题，下面介绍五种 React 组件设计模式，并对比它们的优缺点。

1. 复合组件模式
---------

复合组件模式是一种通过将多个简单组件组合在一起创建更复杂组件的方法。这种模式使得组件的逻辑分离，每个简单组件负责特定的功能。通过复合组件，可以轻松构建可复用的、功能完备的组件。

如果想要设计一个定制化程度高，`API`方便理解的组件，可以考虑这个模式，这种模式不会出现多层`Props`传递的情况。

```
import React, { useState } from 'react';

// 基础按纽组件
const Button = ({ label, onClick }) => (
  <button onClick={onClick}>{label}</button>
);

// 基础文本组件
const TextBox = ({ value, onChange }) => (
  <input type="text" value={value} onChange={onChange} />
);

// 复合组件
const LoginPanel = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // 实现登录逻辑
    console.log(`Logging in with ${username} and ${password}`);
  };

  return (
    <div class>
      <TextBox value={username} onChange={(e) => setUsername(e.target.value)} />
      <TextBox value={password} onChange={(e) => setPassword(e.target.value)} />
      <Button label="Login" onClick={handleLogin} />
    </div>
  );
};

// 使用示例
const App = () => {
  return (
    <LoginPanel />
  );
};

export default App;
```

在这个例子中，LoginPanel 是一个复合组件，它包含了两个基本组件 TextBox 和一个带有登录逻辑的 Button。

**优点：**

*   **API 复杂度降低：** 避免将`Props`全部塞入一个容器组件中，而是直接将`Props`传递给相对应的子组件。
    
*   **高度可复用性：** 基础组件可以在多个场景中重复使用。
    
*   **逻辑分离：** 每个基础组件专注于一项任务。
    
*   **组件数量增多：** 随着组件层级的增加，将会增加`JSX`的行数，并且代码可能变得复杂。
    
*   **不适用于所有场景：** 对于简单的场景，引入复合组件模式可能会显得繁琐和不必要。
    

**适用场景：**

*   **表单和表单域：** 当设计表单时，可以使用复合式组件将整个表单拆分成多个表单域组件，每个表单域负责处理特定的输入或验证逻辑。这样可以更好地组织表单逻辑，提高可维护性。
    
*   **对话框和模态框：** 对话框或模态框通常包含标题、内容和操作按钮。可以使用复合式组件将这些部分拆分成独立的组件，以便在应用中以不同方式重复使用。
    

2. 受控组件模式
---------

受控组件模式就是将组件转换为受控组件，通过直接修改 `Props` 影响组件内部的状态，一般在表单组件中比较常用。

```
import React, { useState } from 'react';

const Button = ({ label, onClick }) => (
  <button onClick={onClick}>{label}</button>
);

const TextBox = ({ value, onChange }) => (
  <input type="text" value={value} onChange={onChange} />
);

// 受控组件模式的复合组件
const ControlledLoginPanel = () => {
  const [loginData, setLoginData] = useState({ username: '', password: '' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleLogin = () => {
    // 实现登录逻辑
    console.log(`Logging in with ${loginData.username} and ${loginData.password}`);
  };

  return (
    <div class>
      <TextBox
        value={loginData.username}
        onChange={handleInputChange}
      />
      <TextBox
        value={loginData.password}
        placeholder="Password"
      />
      <Button label="Login" onClick={handleLogin} />
    </div>
  );
};

// 使用示例
const App = () => {
  return (
    <ControlledLoginPanel />
  );
};

export default App;
```

在这个例子中，`ControlledLoginPanel` 组件就是一个受控组件的例子，其中的输入框的值由 React 状态管理。

**优点：**

*   **提供更多的控制：** 将内部的状态暴露在组件之外，允许用户通过控制它，而直接影响组件。
    
*   **一致性和可预测性：** React 组件的状态是单一数据源，使得应用的状态变得更加可预测和一致。状态的变化完全由 React 控制，减少了意外的行为。 **缺点：**
    
*   **繁琐的代码：** 受控组件相对于非受控组件来说，需要更多的代码。每个输入框都需要设置对应的状态和事件处理函数，这可能导致代码量的增加。
    
*   **性能开销：** 受控组件每次输入变化都会触发状态更新，可能导致频繁的重新渲染。对于大型或性能敏感的应用，这可能带来一些性能开销。
    
*   **不适用于所有场景**：受控组件更适用于表单交互比较复杂，需要实时验证或涉及多个输入字段之间关系的场景。对于简单的表单，可能显得有些繁重。
    

**适用场景：**

*   **动态表单元素：** 在需要动态添加或删除表单元素的情况下，受控组件模式可以很容易地实现。通过使用数组来保存表单元素的状态，可以动态渲染和更新表单。
    
*   **模态框控制：** 当需要通过 props 控制模态框的显示或隐藏状态时，可以使用受控组件模式。
    

3. 自定义 Hooks 模式
---------------

自定义`Hooks`模式是一种将组件逻辑提取为可重用的函数的方法。将主要的逻辑转移到一个`Hooks`中。用户可以访问这个`Hooks`，并公开了几个内部逻辑 (状态、处理程序) ，使用户能够更好地控制组件。

```
import React, { useState } from 'react';

const Button = ({ label, onClick }) => (
  <button onClick={onClick}>{label}</button>
);

const TextBox = ({ value, onChange, placeholder }) => (
  <input type="text" value={value} onChange={onChange} placeholder={placeholder} />
);

// 自定义 Hook，处理登录表单逻辑
const useLoginForm = () => {
  const [loginData, setLoginData] = useState({ username: '', password: '' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleLogin = () => {
    // 在这里实现登录逻辑
    console.log(`使用用户名 ${loginData.username} 和密码 ${loginData.password} 登录`);
  };

  return {
    loginData,
    handleInputChange,
    handleLogin,
  };
};

// 在组件中使用自定义 Hook
const ControlledLoginPanel = () => {
  const { loginData, handleInputChange, handleLogin } = useLoginForm();

  return (
    <div class>
      <TextBox
        value={loginData.username}
        onChange={handleInputChange}
        placeholder="用户名"
      />
      <TextBox
        value={loginData.password}
        onChange={handleInputChange}
        placeholder="密码"
      />
      <Button label="登录" onClick={handleLogin} />
    </div>
  );
};

// 使用示例
const App = () => {
  return (
    <ControlledLoginPanel />
  );
};

export default App;
```

在这个例子中，我们将与登录表单相关的状态和逻辑抽离到一个自定义 useLoginForm Hook 中。使得 `ControlledLoginPanel` 组件更专注于渲染 UI，减少了状态和事件处理逻辑的混杂。

**优点：**

*   **逻辑重用：** 将逻辑提取为 `Hooks`，可以在多个组件中重用。
    
*   **组件更简洁：** 组件代码更加清晰，只关注与 UI 相关的逻辑。 **缺点：**
    
*   **实现复杂度变高：** 逻辑部分与渲染部分分开，需要将两者结合起来才能很好的理解组件工作原理。 **适用场景：**
    
*   **数据获取和处理逻辑：** 将数据获取和处理逻辑提取到自定义 Hook 中，可以在多个组件之间共享相同的数据逻辑。
    
*   **副作用的封装：** 当有需要在组件中处理副作用的情况，可以将副作用逻辑封装到自定义 Hook 中，以提高可维护性。
    

4. Props Getters 模式
-------------------

模式 3 中的自定义`Hooks`提供了很好的控制方式；但是比较难以集成，使用者需要按照组件提供的`Hooks`与`State`相结合进行编写逻辑，提高了集成的复杂度。`Props Getters`模式则是通过简化这一过程来实现。`Getter`是一个返回多个属性的函数，它具有有意义的名称，使得开发者能够清楚地知道哪个`Getter`对应于哪个`JSX`元素。

```
import React, { useState } from 'react';

const Button = ({ getLabel, handleClick }) => (
  <button onClick={handleClick}>{getLabel()}</button>
);

const TextBox = ({ getValue, onChange, placeholder }) => (
  <input type="text" value={getValue()} onChange={onChange} placeholder={placeholder} />
);

const ControlledLoginPanel = ({ getUsernameProps, getPasswordProps, handleLogin }) => {
  return (
    <div class>
      <TextBox {...getUsernameProps()} placeholder="Username" />
      <TextBox {...getPasswordProps()} placeholder="Password" />
      <Button getLabel={() => 'Login'} handleClick={handleLogin} />
    </div>
  );
};

// 使用 Props Getters 模式的 Hooks
const useLoginForm = () => {
  const [loginData, setLoginData] = useState({ username: '', password: '' });

  const handleInputChange = (name) => (e) => {
    const { value } = e.target;
    setLoginData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleLogin = () => {
    // 实现登录逻辑
    console.log(`Logging in with ${loginData.username} and ${loginData.password}`);
  };

  const getUsernameProps = () => ({
    getValue: () => loginData.username,
    onChange: handleInputChange('username'),
  });

  const getPasswordProps = () => ({
    getValue: () => loginData.password,
    onChange: handleInputChange('password'),
  });

  return {
    getUsernameProps,
    getPasswordProps,
    handleLogin,
  };
};

// 使用示例
const App = () => {
  const { getUsernameProps, getPasswordProps, handleLogin } = useLoginForm();

  return (
    <ControlledLoginPanel
      getUsernameProps={getUsernameProps}
      getPasswordProps={getPasswordProps}
      handleLogin={handleLogin}
    />
  );
};

export default App;
```

在这个例子中，我们基于模式 3 进行了改造，把 ControlledLoginPanel 组件需要的 Props 通过函数的方式进行获取，以实现更灵活、更简便的组件复用。

**优点：**

*   **易用性：** 开发人员只需要将 `Getter`传入到正确的 `JSX`元素即可。
    
*   **组件关注点分离：** 组件通过 props 获取所需的属性，使组件关注点更为分离，组件本身不处理状态和逻辑，提高了组件的可维护性。
    
*   **减少嵌套层级：** 相较于 Hooks 模式，Props Getters 模式可能减少了一些嵌套，使得组件结构更加扁平。
    

**缺点：**

*   **缺乏可见性：** `Getter` 带来了抽象，使组件更容易集成，但也更为黑盒。
    
*   **引入更多回调函数：** 使用 Props Getters 模式可能引入更多的回调函数，一些开发者可能认为这会使代码显得更加复杂。
    
*   **依赖外部 API：** Props Getters 模式依赖外部传递的回调函数，可能导致一些依赖关系，不够自包含。
    

**适用场景：**

*   **数据过滤：** 在一个数据展示组件中，通过 Props Getters 模式可以将数据过滤逻辑提取出来，允许外部根据特定条件获取过滤后的数据。
    
*   **表单验证：** 在一个表单组件中，通过 Props Getters 模式可以将表单验证的逻辑从组件中抽离，允许外部调用表单组件的验证函数，并获取验证结果。
    

5. State Reducer 模式
-------------------

State Reducer 模式是一种通过将组件的状态更新逻辑委托给一个函数，实现更灵活的状态管理方式。这种模式通常在处理复杂的状态逻辑时非常有用。

```
import React, { useState } from 'react';

const TextInput = ({ getInputProps }) => {
  const inputProps = getInputProps();

  return <input {...inputProps} />;
};

const StateReducerExample = () => {
  // 初始状态为一个空字符串
  const [inputValue, setInputValue] = useState('');

  // stateReducer 函数用于处理状态的变化
  const stateReducer = (state, changes) => {
    // 使用 switch case 处理不同的状态变化情况
    switch (Object.keys(changes)[0]) {
      // 如果变化的是 value 属性
      case 'value':
        // 如果输入的字符数量超过 10 个，则不允许变化
        if (changes.value.length > 10) {
          return state;
        }
        break;
      // 可以添加其他 case 处理不同的状态变化
      default:
        break;
    }
    // 返回新的状态
    return { ...state, ...changes };
  };

  // 获取传递给子组件的 props
  const getInputProps = () => {
    return {
      value: inputValue,
      // 在输入框变化时调用 stateReducer 处理状态变化
      onChange: (e) => setInputValue(stateReducer({ value: e.target.value })),
    };
  };

  return (
    <div>
      <h3>State Reducer Example</h3>
      {/* 将获取的 props 传递给 TextInput 组件 */}
      <TextInput getInputProps={getInputProps} />
    </div>
  );
};

export default StateReducerExample;
```

在这个例子中，`StateReducerExample` 组件包含一个输入框，通过 `getInputProps` 函数将输入框的值和变化处理逻辑传递给 `TextInput` 组件。`stateReducer` 函数处理状态的变化，确保输入的字符数量不超过 10 个。

**优点：**

*   **状态管理灵活：** 可以通过自定义的状态更新函数实现更复杂的状态管理逻辑。
    
*   **更好的组织代码：** 将状态的处理逻辑集中在一个 `stateReducer` 函数中，可以使代码更有组织性，减少了在组件中处理状态的复杂性。
    
*   **清晰的状态更新逻辑：** 通过 `stateReducer` 可以清晰地看到每个状态变化是如何被处理的，使得状态更新逻辑更易于理解。
    

**缺点：**

*   **增加复杂度：** 引入 `stateReducer` 可能会使代码结构变得更加复杂，尤其是在处理多个状态变化情况时。这可能导致一些开发者对代码的理解产生困难。
    
*   **可能造成冗余代码：** 在某些情况下，可能会因为需要为每个状态变化情况编写处理逻辑而导致一些冗余的代码，特别是在处理简单状态时。
    
*   **不适用于简单场景：** 在简单场景下使用状态约减可能显得繁琐不必要。
    

**适用场景：**

*   **复杂状态管理：** 当组件的状态比较复杂，有多个相关联的状态需要进行更新时，State Reducer 模式可以帮助将状态管理逻辑进行更细粒度的控制。
    
*   **异步状态更新：** 当需要进行异步状态更新时，State Reducer 模式可以帮助处理异步回调，以确保状态正确更新。
    
*   **控制状态更新流程：** 在某些场景下，需要更灵活地控制状态更新的流程，例如在某个条件下阻止状态更新或根据条件进行额外的处理。
    

结论
--

通过这 5 种 React 组件设计模式，我们对 “控制度” 和“复杂度”有了更清晰的认识，下图是复杂度和控制度的一个趋势图。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/sticlevzdTIBsUBeoL1JI75YVukUpicGelLOvspOic8gwicDRFB57ywJIGMHLVRKoicfAZiaGUDQn1tianKADicadoBGgQ/640?wx_fmt=png&from=appmsg)

总体来说，设计的组件越灵活，功能也就越强大，复杂度也会更高。作为开发人员，建议大家根据自己的业务逻辑以及使用人群，灵活使用以上的设计模式。

参考文章
----

React 组件设计模式