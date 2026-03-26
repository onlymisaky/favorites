> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/hXP6I0wr5DgnGHYtV9aItg)

2025 年，TypeScript 已然成为前端开发领域不可或缺的一部分，特别是在 React 项目中，其强类型特性为开发带来了安全性。本文将深入总结在 React 中使用 TypeScript 的常见场景，旨在帮助你快速掌握 React + TypeScript 的开发精髓，提升开发效率与项目质量！

React 组件声明
----------

在 React 中，组件的声明方式有两种：**函数组件**和**类组件。**

### 函数组件

函数组件是现代 React 开发中最常用的组件形式。使用 TypeScript 声明函数组件时，通常需要定义 props 的类型。在 React 中，有两种方法可以给函数组件定义类型：**React.FC** 和 **直接定义 props 类型。**

#### **React.FC**

`React.FC`（Functional Component 的缩写，因此也可以写成`React.FunctionComponent`）是 React 中用于定义函数组件的一个类型别名。它在 TypeScript 环境下特别有用，因为它不仅可以定义组件的属性（props）类型，还隐式地处理一些常见的 React 组件特性，如：

*   • **Props 类型推断**：当使用 `React.FC` 定义一个组件时，可以直接为该组件指定一个接口来描述它的 `props` 结构，从而获得更好的类型检查和自动补全支持。
    
*   • **Children Prop 自动包含**：默认情况下，`React.FC` 会自动将 `children` 作为可选 `props` 包含进来。这意味着如果没有显式声明 `children` 在 `props` 接口中，仍然可以在 JSX 中使用它。
    
*   • **返回值类型**：`React.FC` 显式指定了返回值类型为 `JSX.Element` 或者 `null`，这有助于避免某些类型的错误。
    

在使用`React.FC`时，只需要将定义好的 `props` 类型传递给它即可，举个例子：

```
import Reactfrom'react';interfaceGreetingProps {name: string;}constGreeting: React.FC<GreetingProps> = ({ name }) => {return (    <div>      Hello, {name}!    </div>  );};exportdefaultGreeting;
```

#### 直接定义 props 类型

函数组件还可以直接给 `props` 定义类型而不使用 `React.FC`，这样更加灵活和直观。

举个例子：

```
import Reactfrom'react';// 定义组件属性接口interfaceGreetingProps {name: string;age?: number;children?: React.ReactNode; // 明确声明 children 类型（可选）}// 函数组件，直接为 props 指定类型constGreeting = ({ name, age, children }: GreetingProps): JSX.Element => {return (    <div>      Hello, {name}! {age && `你 ${age} 岁！`}      {children}    </div>  );};exportdefaultGreeting;
```

与使用 `React.FC` 相比，直接定义 `props` 类型的主要区别在于：

*   • `children`**处理**：`React.FC` 默认将 `children` 作为一个可选属性包含进来。如果不希望自动包含 `children`，或者需要对其类型进行更详细的定义，直接定义 `props` 类型会更加合适。
    
*   • **返回类型**：`React.FC` 显式地指定了返回值类型为 `JSX.Element` 或 `null`，而直接定义 `props` 类型则没有这种限制。如果确实想要明确函数组件的返回值，可以显式添加返回值类型 `JSX.Element`，它用来表示由 JSX 语法生成的 React 元素。虽然在大多数情况下 TypeScript 可以自动推断出返回类型，但显式标注可以帮助提高代码的可读性和类型安全性。
    

### 类组件

类组件的类型定义与函数组件有所不同。类组件使用 `React.Component` 类来定义，并且需要明确指定其 `props` 和 `state` 的类型。

#### React.Component

举个例子：

```
import Reactfrom'react';// 定义类组件的 props 和 state 类型interfaceIProps {name: string;}interfaceIState {count: number;}classMyComponentextendsReact.Component<IProps, IState> {constructor(props: IProps) {    super(props);    // 初始化状态    this.state = { count: 0 };  }render() {    return (      <div>        <p>Hello, {this.props.name}!</p>        <p>Count: {this.state.count}</p>        <button onClick={() => this.setState({ count: this.state.count + 1 })}>          增加        </button>      </div>    );  }}exportdefaultMyComponent;
```

类组件的类型继承自 `React.Component`，并传递两个泛型参数：第一个是 `props` 类型，第二个是 `state` 类型。

*   • `IProps`：定义了组件的 `props` 类型，这里包含一个 `name` 属性。
    
*   • `IState`：定义了组件的 `state` 类型，这里包含一个 `count` 属性。
    

#### React.PureComponent

另外，React 提供的一个基类：`React.PureComponent`，它于优化性能。与 `React.Component` 类似，使用 `React.PureComponent` 时也需要指定 `props` 和 `state` 的类型。

```
import Reactfrom'react';// 定义类组件的 props 和 state 类型interfaceIProps {name: string;}interfaceIState {count: number;}classMyComponentextendsReact.PureComponent<IProps, IState> {constructor(props: IProps) {    super(props);    this.state = { count: 0 };  }  incrementCount = () => {    this.setState((prevState) => ({ count: prevState.count + 1 }));  };render() {    return (      <div>        <p>Hello, {this.props.name}!</p>        <p>Count: {this.state.count}</p>        <button onClick={this.incrementCount}>          Increment        </button>      </div>    );  }}exportdefaultMyComponent;
```

> **注意**：`React.PureComponent` 通过实现 `shouldComponentUpdate` 生命周期方法来执行浅比较`props` 和 `state`，从而决定是否重新渲染组件。如果 `props` 和 `state` 没有发生变化，组件将不会重新渲染，这可以避免不必要的渲染操作，提升性能。

### 特殊情况（了解）

#### props 类型在调用时才知道

在 React 类组件中，有时可能遇到的情况是 `props` 的类型直到运行时才能确定。这种情况通常出现在动态生成的组件或需要根据上下文传递不同类型的 `props` 时。为了解决这个问题，可以使用 TypeScript 的泛型来定义组件。

通过使用泛型，可以在定义函数组件时指定一个类型参数，这样就可以在调用组件时传递具体的类型。

*   • **函数组件：**
    

```
import Reactfrom'react';// 直接在函数签名中使用泛型参数constDisplayValue = <T,>(props: { name: T }): JSX.Element => {return (    <div>      {String(props.name)}    </div>  );};exportdefaultDisplayValue;// 在调用时指定具体的 props 类型<DisplayValue<string>  /><DisplayValue<number> name={42} /><DisplayValue<boolean> name={true} />
```

> **注意：**`<T,>`中添加了一个逗号。在 TypeScript 中，当定义一个泛型函数时，如果只有一个泛型参数，理论上可以省略泛型参数后的逗号。然而，在某些情况下，TypeScript 的类型推断机制可能会要求你保留这个逗号，尤其是在 JSX 语法中使用泛型时。因此，这里保留了逗号，以避免 TypeScript 解析错误。

*   • **类组件：**
    

```
import Reactfrom'react';// 定义一个泛型类组件classGenericComponent<T> extendsReact.PureComponent<T> {render() {    const { data } = this.propsas { data: string };    return (      <div>        Data: {data}      </div>    );  }}// 在调用时指定具体的 props 类型constMyComponent = GenericComponent<{ data: string; extra: number }>;// 使用组件constApp: React.FC = () => {return<MyComponent data="Hello, World!" extra={42} />;};exportdefaultApp;
```

#### 高阶组件

在 React 中，高阶组件用于增强组件的功能，它通常接收一个组件并返回一个新的组件。使用 TypeScript 定义高阶组件的类型时，可以通过泛型和类型别名来确保类型安全性和灵活性。

举个例子：

```
import Reactfrom'react';function withLogger<P extends {}>(WrappedComponent: React.ComponentType<P>): React.FC<P> {constEnhancedComponent: React.FC<P> = (props: P) => {    console.log('Props:', props);    return<WrappedComponent {...props} />;  };returnEnhancedComponent;}
```

在这个高阶组件中：

*   • `P extends {}` 表示 `P` 是一个对象类型，代表原始组件的 `props`。
    
*   • `React.ComponentType<P>` 表示 `WrappedComponent` 可以是任何接受 `P` 类型 `props` 的 React 组件（无论是函数组件还是类组件）。
    
*   • 返回的组件是一个 `React.FC`，其 `props` 类型与原始组件相同。
    

React Hooks
-----------

#### useState

`useState` 用于在函数组件中添加状态，它的泛型参数用于指定状态变量的类型。在这里，`useState<number>` 明确指定了状态变量 `count` 的类型为 `number`。

```
import React, { useState } from'react';constMyComponent = () => {// 定义状态变量count的类型为numberconst [count, setCount] = useState<number>(0);return (    <div>      Count: {count}      <button onClick={() => setCount(count + 1)}>Increase</button>    </div>  );}
```

如果初始状态是`null`或`undefined`，需要使用联合类型来表示。

```
import React, { useState } from'react';constMyComponent = () => {// 类型为 string | nullconst [name, setName] = useState<string | null>(null);return (    <div>      Name: {name || 'No name'}    </div>  );}
```

如果状态是一个对象，并且希望初始值为一个空对象，可以通过类型断言 (`{} as State`) 来避免报错：

```
import React, { useState } from'react';interfaceState {name: string;age: number;}constMyComponent = () => {const [state, setState] = useState<State>({} asState);return (    <div>      Name: {state.name}, Age: {state.age}    </div>  );}
```

不建议这么写，这样会绕过编译时的类型检查，最好还是提供一个具体的初始值。

```
import React, { useState } from'react';interfaceState {name: string;age: number;}constMyComponent = () => {const [state, setState] = useState<State>({    name: '',    age: 0,  });return (    <div>      Name: {state.name}, Age: {state.age}    </div>  );}
```

#### useRef

在使用 `useRef` 时，需要根据不同的使用场景进行恰当的类型定义。

*   • **用于 DOM 引用**：当 `useRef` 用于引用 DOM 元素时，需要通过泛型参数指定其类型为对应的 DOM 元素类型（如 `HTMLInputElement`）。
    

```
import React, { useRef } from'react';constInputFocusExample: React.FC = () => {    // 定义一个 ref，其类型为 HTMLInputElement    const inputRef = useRef<HTMLInputElement>(null);    constfocusInput = () => {        if (inputRef.current) {            inputRef.current.focus();        }    };    return (        <div>            <input ref={inputRef} type="text" placeholder="Type something" />            <button onClick={focusInput}>Focus Input</button>        </div>    );};exportdefaultInputFocusExample;
```

> 在这个例子中，`useRef<HTMLInputElement>(null)` 明确指定了 `inputRef` 引用的是一个 `HTMLInputElement` 类型的 DOM 元素。因为在初始时 `ref` 还未关联到实际的 DOM 元素，所以初始值设为 `null`。在调用 `focus` 方法前，需要先检查 `inputRef.current` 是否存在，避免出现 `null` 引用错误。

*   • **用于保存可变值**：当 `useRef` 用于保存可变值（非 DOM 元素）时，需要通过泛型参数指定其存储值的类型。
    

```
import React, { useRef, useEffect } from'react';constCounterWithRef: React.FC = () => {    // 定义一个 ref 来保存计数器的值，类型为 number    const counterRef = useRef<number>(0);    useEffect(() => {        const intervalId = setInterval(() => {            counterRef.current += 1;            console.log('Counter:', counterRef.current);        }, 1000);        return() => {            clearInterval(intervalId);        };    }, []);    return (        <div>            <p>Check console for counter updates</p>        </div>    );};exportdefaultCounterWithRef;
```

> 这里 `useRef<number>(0)` 表示 `counterRef` 用于存储一个 `number` 类型的值，初始值为 `0`。在 `setInterval` 回调函数中，可以直接修改 `counterRef.current` 的值，且不会触发组件重新渲染。

*   • **通用类型**：如果 `useRef` 可能存储多种类型的值或者不确定具体类型，可以使用更通用的类型，如 `any` 或 `unknown`。不过要谨慎使用 `any`，因为它会绕过 TypeScript 的类型检查。
    

```
import React, { useRef } from'react';constGenericRefExample: React.FC = () => {    // 使用 unknown 类型    const genericRef = useRef<unknown>(null);    constsetValue = () => {        genericRef.current = '前端充电宝';        console.log(genericRef.current);    };    return (        <div>            <button onClick={setValue}>Set Value</button>        </div>    );};exportdefaultGenericRefExample;
```

> 在这个例子中，`useRef<unknown>(null)` 表明 `genericRef` 可以存储任意类型的值，但在使用 `genericRef.current` 时需要进行类型检查或类型断言。

#### useMemo

`useMemo` 用于性能优化，它会记住一个计算结果，只有当依赖项发生变化时才会重新计算。

```
import React, { useMemo, useState } from'react';constMemoExample: React.FC = () => {    const [a, setA] = useState(1);    const [b, setB] = useState(2);    // 定义计算结果的类型为 number    const sum = useMemo<number>(() => {        return a + b;    }, [a, b]);    return (        <div>            <p>a: {a}</p>            <p>b: {b}</p>            <p>Sum: {sum}</p>            <button onClick={() => setA(a + 1)}>Increment a</button>            <button onClick={() => setB(b + 1)}>Increment b</button>        </div>    );};exportdefaultMemoExample;
```

`useMemo` 是泛型函数，这里通过 `<number>` 明确指定了返回值的类型为 `number`。

#### useCallback

`useCallback` 和 `useMemo` 类似，但它用于记忆一个函数，只有当依赖项改变时才会重新创建函数。

```
import React, { useCallback, useState } from'react';constParamCallbackExample: React.FC = () => {    const [data, setData] = useState<number[]>([]);    // 指定 useCallback 返回函数的类型为 (num: number) => number[]    const addNumber = useCallback<(num: number) =>number[]>((num) => {        const newData = [...data, num];        setData(newData);        return newData;    }, [data]);    return (        <div>            <p>Data: {data.join(', ')}</p>            <button onClick={() => addNumber(1)}>Add 1</button>        </div>    );};exportdefaultParamCallbackExample;
```

`useCallback` 是泛型函数，通过 `<(num: number) => number[]>` 明确指定了返回的回调函数的类型。这个类型表示回调函数接收一个 `number` 类型的参数 `num`，并返回一个 `number` 类型的数组。

#### useContext

`useContext` 用于在组件树中共享数据。在使用之前，需要先创建上下文并指定其类型。

```
import React, { createContext, useContext } from'react';// 定义上下文的类型typeThemeContextType = {    theme: string;    setTheme: (theme: string) =>void;};// 创建上下文constThemeContext = createContext<ThemeContextType | null>(null);// 定义 Provider 组件constThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {    const [theme, setTheme] = useState<string>('light');    constvalue: ThemeContextType = {        theme,        setTheme    };    return (        <ThemeContext.Provider value={value}>            {children}        </ThemeContext.Provider>    );};// 定义使用上下文的组件constThemeConsumer: React.FC = () => {    const themeContext = useContext(ThemeContext);    if (!themeContext) {        return<p>Context not provided</p>;    }    return (        <div>            <p>Current theme: {themeContext.theme}</p>            <button onClick={() => themeContext.setTheme('dark')}>Set Dark Theme</button>        </div>    );};export { ThemeProvider, ThemeConsumer };
```

其中，`createContext` 是泛型函数，这里通过 `<ThemeContextType | null>` 指定了上下文的值的类型。使用 `| null` 是因为在某些情况下，上下文可能没有被提供值，此时会返回 `null`。

#### useReducer

`useReducer`用于管理复杂的状态逻辑，我们需要为 `action` 和 `state` 定义类型。

```
import React, { useReducer } from'react';// 定义 action 的类型typeCounterAction = { type: 'increment' } | { type: 'decrement' };// 定义 state 的类型typeCounterState = { count: number };// 定义 reducer 函数const counterReducer = (state: CounterState, action: CounterAction): CounterState => {    switch (action.type) {        case'increment':            return { count: state.count + 1 };        case'decrement':            return { count: state.count - 1 };        default:            return state;    }};constCounterWithReducer: React.FC = () => {    const [state, dispatch] = useReducer(counterReducer, { count: 0 });    return (        <div>            <p>Count: {state.count}</p>            <button onClick={() => dispatch({ type: 'increment' })}>Increment</button>            <button onClick={() => dispatch({ type: 'decrement' })}>Decrement</button>        </div>    );};exportdefaultCounterWithReducer;
```

#### 自定义 Hooks

自定义 Hooks 同样需要根据其功能和返回值进行类型定义。

```
import React, { useState, useEffect } from'react';// 自定义 Hook 用于监听窗口大小变化constuseWindowSize = () => {    const [windowSize, setWindowSize] = useState<{ width: number; height: number }>({        width: window.innerWidth,        height: window.innerHeight    });    useEffect(() => {        consthandleResize = () => {            setWindowSize({                width: window.innerWidth,                height: window.innerHeight            });        };        window.addEventListener('resize', handleResize);        return() => {            window.removeEventListener('resize', handleResize);        };    }, []);    return windowSize;};constWindowSizeDisplay: React.FC = () => {    const size = useWindowSize();    return (        <div>            <p>Window width: {size.width}</p>            <p>Window height: {size.height}</p>        </div>    );};exportdefaultWindowSizeDisplay;
```

#### useDeferredValue

`useDeferredValue` 是 React 18 引入的一个 Hook，其目的是用于创建一个值的延迟版本，以便在渲染时可以将高优先级的更新与低优先级的更新分离，提升应用的响应性能。

`useDeferredValue` 接受一个泛型参数 `T`，表示传入的值的类型，返回值的类型与传入值的类型相同。

```
function useDeferredValue<T>(value: T): T;
```

举个例子：

```
import React, { useState, useDeferredValue } from'react';constExampleComponent: React.FC = () => {    // 定义一个字符串类型的状态    const [inputText, setInputText] = useState<string>('');    // 使用 useDeferredValue 创建 inputText 的延迟版本    const deferredText = useDeferredValue<string>(inputText);    return (        <div>            <input                type="text"                value={inputText}                onChange={(e) => setInputText(e.target.value)}                placeholder="Type something"            />            <p>Immediate value: {inputText}</p>            <p>Deferred value: {deferredText}</p>        </div>    );};exportdefaultExampleComponent;
```

React 事件处理
----------

在处理事件时需要对事件对象进行类型定义，以此确保代码的类型安全性。

例如，当处理按钮的点击事件时，需要使用 `React.MouseEvent` 类型来定义事件对象。

```
import Reactfrom'react';constButtonComponent: React.FC = () => {    consthandleClick = (event: React.MouseEvent<HTMLButtonElement>) => {        // event 是 MouseEvent 类型，可以访问相关属性和方法        console.log('按钮被点击了', event.clientX, event.clientY);    };    return (        <button onClick={handleClick}>点击我</button>    );};exportdefaultButtonComponent;
```

在这段代码中，`React.MouseEvent<HTMLButtonElement>` 明确了事件对象的类型。泛型参数 `HTMLButtonElement` 表示事件触发的元素类型为 `<button>` 元素。

### 事件类型

事件类型包括事件对象类型和事件处理函数类型：

*   • **事件对象类型**：指在事件处理函数中接收到的事件参数的类型。React 提供了多种事件类型，如 `MouseEvent`, `ChangeEvent`, `KeyboardEvent` 等，可以通过这些类型来明确事件对象的结构。
    
*   • **事件处理函数类型**：指事件处理函数本身的类型签名。它包括函数的参数类型（如事件对象类型）和返回值类型。当定义一个事件处理函数的类型时，实际上也隐含地定义了事件对象的类型。
    

**何时定义：**

*   • **简单场景**：如果只需要处理简单的事件，并且不需要复杂的类型推断或额外的功能，通常可以直接使用**事件对象类型**定义，而不需要显式定义事件处理函数的类型。
    
*   • **复杂场景**：如果事件处理函数逻辑较为复杂，或者需要传递额外的参数、处理异步操作等，显式定义事件处理函数的类型可以帮助你更好地管理代码并提高可读性。例如：
    

*   • **多个相似的事件处理函数**：如果有多个类似的事件处理函数，显式定义类型可以避免重复代码并提高一致性。
    
*   • **复杂的事件处理逻辑**：如果事件处理函数包含复杂的逻辑（如异步操作、状态更新、副作用等），显式定义类型有助于清晰地表达意图。
    
*   • **类型检查和推断**：在某些情况下，TypeScript 可能无法正确推断出事件处理函数的类型，显式定义类型可以帮助解决这些问题。
    

常见的事件对象类型、事件处理函数包括：

<table><thead><tr><td><strong>事件类型</strong></td><td><strong>类型</strong></td><td><section>****</section></td><td><strong>描述</strong></td><td><strong>典型元素</strong></td></tr></thead><tbody><tr><td><section>鼠标事件</section></td><td><code>MouseEvent&lt;T = Element&gt;</code></td><td><code>MouseEventHandler&lt;T = Element&gt;</code></td><td><section>用于处理与鼠标相关的事件，如点击、双击等。</section></td><td><code>button</code><section>,&nbsp;<code>div</code></section></td></tr><tr><td><section>键盘事件</section></td><td><code>KeyboardEvent&lt;T = Element&gt;</code></td><td><code>KeyboardEventHandler&lt;T = Element&gt;</code></td><td><section>用于处理键盘输入相关的事件，如按键按下、释放等。</section></td><td><code>input</code></td></tr><tr><td><section>表单事件</section></td><td><code>ChangeEvent&lt;T = Element&gt;</code></td><td><code>ChangeEventHandler&lt;T = Element&gt;</code></td><td><section>用于处理表单元素值变化的事件，如输入框内容的变化。</section></td><td><code>input</code><section>,&nbsp;<code>textarea</code>,&nbsp;<code>select</code></section></td></tr><tr><td><section>提交事件</section></td><td><code>FormEvent&lt;T = Element&gt;</code></td><td><code>FormEventHandler&lt;T = Element&gt;</code></td><td><section>用于处理表单提交的事件。</section></td><td><code>form</code></td></tr><tr><td><section>焦点事件</section></td><td><code>FocusEvent&lt;T&gt;</code></td><td><code>FocusEventHandler&lt;T = Element&gt;</code></td><td><section>用于处理获得或失去焦点的事件，如当一个输入框获得或失去焦点时。</section></td><td><code>input</code></td></tr><tr><td><section>触摸事件</section></td><td><code>TouchEvent&lt;T = Element&gt;</code></td><td><code>TouchEventHandler&lt;T = Element&gt;</code></td><td><section>用于处理触摸屏上的触摸操作，如触摸开始、移动、结束等。</section></td><td><section>可触摸元素</section></td></tr><tr><td><section>滚轮事件</section></td><td><code>WheelEvent&lt;T&gt;</code></td><td><code>WheelEventHandler&lt;T = Element&gt;</code></td><td><section>用于处理与鼠标滚轮相关的事件，比如用户使用鼠标滚轮进行滚动操作时触发的事件。</section></td><td><section>可滚动元素</section></td></tr><tr><td><section>拖放事件</section></td><td><code>DragEvent&lt;T&gt;</code></td><td><code>DragEventHandler&lt;T = Element&gt;</code></td><td><section>用于处理拖放操作相关的事件，如开始拖动、拖动进入目标区域等。</section></td><td><section>可拖放元素</section></td></tr><tr><td><section>合成事件</section></td><td><code>SyntheticEvent&lt;T&gt;</code></td><td><code>SyntheticEventHandler&lt;T = Element&gt;</code></td><td><section>所有上述事件类型都是基于&nbsp;<code>SyntheticEvent</code>，它是 React 对原生浏览器事件进行封装后的通用事件类型。它提供了一组跨浏览器一致的属性和方法。</section></td><td><section><br></section></td></tr></tbody></table>

其中，泛型参数 `T`表示触发事件的 DOM 元素类型，默认是 `Element`。

### 元素类型

元素类型指的是 React 中不同 HTML 元素或者自定义组件对应的类型，借助这些类型，我们能够精确处理元素的事件、属性以及其他特性。React 为各种 HTML 元素都提供了对应的类型，这些类型一般以 `HTML` 开头，后面接上元素名称，例如 `HTMLButtonElement`、`HTMLInputElement` 等。

```
import Reactfrom'react';// 处理按钮点击事件，指定元素类型为 HTMLButtonElementconsthandleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {    console.log('按钮被点击了');};// 处理输入框值变化事件，指定元素类型为 HTMLInputElementconsthandleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {    console.log('输入框的值发生了变化');};constMyComponent: React.FC = () => {    return (        <div>            <button onClick={handleButtonClick}>点击我</button>            <input type="text" onChange={handleInputChange} />        </div>    );};exportdefaultMyComponent;
```

常见的元素类型包括：

*   • `HTMLDivElement`：表示 `<div>` 元素。
    
*   • `HTMLSpanElement`：表示 `<span>` 元素
    
*   • `HTMLButtonElement`：表示 `<button>` 元素。
    
*   • `HTMLInputElement`：表示 `<input>` 元素。
    
*   • `HTMLTextAreaElement`：表示 `<textarea>` 元素。
    
*   • `HTMLSelectElement`：表示 `<select>` 元素。
    
*   • `HTMLAnchorElement`：表示 `<a>`（超链接）元素。
    
*   • `HTMLImageElement`：表示 `<img>` 元素。
    
*   • `HTMLFormElement`: 表示 `<form>` 元素。
    
*   • `HTMLUListElement` : 表示 `<ul>`（无序列表）元素。
    
*   • `HTMLOListElement` : 表示 `<ol>`（有序列表）元素。
    

### 元素属性类型

元素属性类型用于定义元素可以接收的属性的类型，这样能保证传递给元素的属性符合预期。每个 HTML 元素都有其预定义的属性类型。例如，`<input>` 元素的 `value` 属性类型通常是 `string`，`disabled` 属性类型是 `boolean`。

常见的元素属性类型如下：

*   • `HTMLAttributes<T>`：表示 HTML 属性类型。
    
*   • `ButtonHTMLAttributes<T>`：表示按钮属性类型。
    
*   • `FormHTMLAttributes<T>`：表示表单属性类型。
    
*   • `ImgHTMLAttributes<T>`：表示图片属性类型。
    
*   • `InputHTMLAttributes<T>`：表示输入框属性类型。
    
*   • `LinkHTMLAttributes<T>`：表示链接属性类型。
    
*   • `MetaHTMLAttributes<T>`：表示 meta 属性类型。
    
*   • `SelectHTMLAttributes<T>`：表示选择框属性类型。
    
*   • `TableHTMLAttributes<T>`：表示表格属性类型。
    
*   • `TextareaHTMLAttributes<T>`：表示输入区（文本区域）属性类型。
    
*   • `VideoHTMLAttributes<T>`：表示视频属性类型。
    
*   • `SVGAttributes<T>`：表示 SVG 属性类型。
    
*   • `WebViewHTMLAttributes<T>`：表示 WebView 属性类型。
    

如果需要扩展原生 HTML 的属性，比如自定义按钮组件，这时就需要用到元素属性类型：

```
import Reactfrom'react';// 使用 ButtonHTMLAttributes 定义自定义按钮组件的属性类型interfaceCustomButtonPropsextendsReact.ButtonHTMLAttributes<HTMLButtonElement> {    customText?: string; // 自定义属性}// 自定义按钮组件constCustomButton: React.FC<CustomButtonProps> = ({ customText, ...rest }) => {    return (        <button {...rest}>            {customText || '默认文本'}        </button>    );};constApp: React.FC = () => {    return (        <div>            <CustomButton                customText="自定义按钮文本"                type="submit"                disabled={false}                onClick={() => console.log('CustomButton 被点击了')}            />        </div>    );};exportdefaultApp;
```

其中，`CustomButtonProps` 接口继承自 `React.ButtonHTMLAttributes<HTMLButtonElement>`，这使得 `CustomButton` 组件可以接收 `<button>` 元素的所有属性。

### 注意事项

*   • **事件类型导入**：始终从 `react` 导入详细的事件类型，不要使用原生 `Event` 类型：
    

```
import { ChangeEvent, MouseEvent } from 'react'; ✅// 不要使用const handle = (e: Event) => {} ❌
```

*   • **明确泛型参数**：为事件类型指定具体的元素类型，不要使用默认的 `Element` 类型：
    

```
// 明确指定按钮元素const handleClick = (e: MouseEvent<HTMLButtonElement>) => {} ✅// 避免通用类型const handleClick = (e: MouseEvent) => {} ❌
```

*   • **可选链操作符**：处理可能为空的属性：
    

```
console.log(e.target?.value); ✅
```

*   • **类型断言技巧**：当明确知道元素类型时：
    

```
const handleUpload = (e: ChangeEvent<HTMLInputElement>) => {  const files = (e.target as HTMLInputElement).files;};
```

其他
--

### **Error Boundary**

**Error Boundary（错误边界）** 是 React 中的一种组件，它能够捕获在其下级组件树中发生的 JavaScript 错误，并且可以显示一个备用 UI 而不是让应用崩溃。

在 React 中实现错误边界通常使用 `componentDidCatch` 和 `getDerivedStateFromError` 生命周期方法。前者用于记录错误信息，后者则用于在错误发生时更新组件的状态以展示备用 UI。

下面是一个 Error Boundary 封装的例子：

```
import React, { Component, ReactNode, ErrorInfo } from'react';// 定义 Error Boundary 的 Props 类型interfaceErrorBoundaryProps {children: ReactNode;// 可选的 fallback UI，可以接收 error 和 errorInfo 作为参数fallback?: (error: Error, errorInfo: ErrorInfo) =>ReactNode;}// 定义 Error Boundary 的 State 类型interfaceErrorBoundaryState {hasError: boolean;error?: Error | null;errorInfo?: ErrorInfo | null;}classErrorBoundaryextendsComponent<ErrorBoundaryProps, ErrorBoundaryState> {constructor(props: ErrorBoundaryProps) {    super(props);    this.state = {      hasError: false,      error: null,      errorInfo: null    };  }staticgetDerivedStateFromError(error: Error): ErrorBoundaryState {    // 更新 state 使下一次渲染能够显示降级后的 UI    return { hasError: true, error };  }componentDidCatch(error: Error, errorInfo: ErrorInfo): void {    // 可以在这里记录错误信息（如发送到日志服务）    console.error('ErrorBoundary caught an error:', error, errorInfo);    this.setState({ errorInfo });  }render(): ReactNode {    const { hasError, error, errorInfo } = this.state;    const { children, fallback } = this.props;    if (hasError) {      // 如果有提供 fallback UI 则使用，否则使用默认提示      return fallback         ? fallback(error!, errorInfo!)         : (          <div style={{ padding: 20 }}>            <h2>Something went wrong.</h2>        <details style={{ whiteSpace: 'pre-wrap' }}>          {error?.toString()}      <br />        {errorInfo?.componentStack}      </details>        </div>          );    }    return children;  }}exportdefaultErrorBoundary;
```

使用示例：

```
// 使用默认 fallback<ErrorBoundary>  <YourComponent /></ErrorBoundary>// 使用自定义 fallback<ErrorBoundary  fallback={(error, errorInfo) => (    <div class>      <h1>Custom Error Message</h1>      <p>{error.message}</p>      <pre>{errorInfo.componentStack}</pre>    </div>  )}>  <YourComponent /></ErrorBoundary>
```

这里面涉及到了一些 TypeScript 类型的定义，包括：

*   • `ErrorInfo`：是 React 提供的一个类型，用于描述组件渲染过程中发生错误时的错误信息，包含 `componentStack` 属性，用于显示错误发生的组件堆栈。
    
*   • `ReactNode`：表示可以作为 React 元素的任何值。它可以是 `ReactElement`、字符串、数字、数组、`null`、`undefined` 或 `boolean` 等。
    
*   • `Error`：`Error`是源自 JavaScript 的标准内置对象。TypeScript 作为 JavaScript 的超集，直接继承了这些内置对象及其类型定义，因此你可以在 TypeScript 中像在 JavaScript 中一样使用 `Error` 对象。虽然 `Error` 不是 TypeScript 特有的类型，但在 TypeScript 中，、可以将变量显式地声明为 `Error` 类型。TypeScript 的类型系统会理解并处理这种类型声明，提供类型检查和代码补全等特性。
    

### 异步请求

在进行异步请求时，需要对请求和响应的数据类型进行合理定义，以此保证代码的类型安全。

#### 使用 fetch 进行异步请求

`fetch` 是浏览器原生提供的用于发起网络请求的 API，在 TypeScript 中使用时，需要定义请求参数和响应数据的类型。

```
import React, { useEffect, useState } from'react';interfaceDataItem {    id: number;    name: string;}const fetchData = async (): Promise<DataItem[]> => {    const response = awaitfetch('/api/data');    if (!response.ok) {        thrownewError('Network response was not ok');    }    return response.json();};constApp = () => {    const [data, setData] = useState<DataItem[]>([]);    useEffect(() => {        fetchData().then(setData).catch(console.error);    }, []);    return (        <ul>            {data.map(item => (                <li key={item.id}>{item.name}</li>            ))}        </ul>    );};
```

这里面有一个`Promise<T>`类型，它用于表示一个异步操作的结果的泛型类型，其中 `T` 表示当 `Promise` 被解析时返回的数据类型。这意味着你可以指定 `Promise` 在成功解决时将返回的具体类型。

#### 使用 Axios 进行异步请求

`axios` 是一个基于 Promise 的 HTTP 客户端，常用于发送异步请求。在 TypeScript 中使用 `axios` 时，同样需要定义请求和响应的类型。

下面是对 Axios 的一个简单封装：

```
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from'axios';// 定义请求配置的默认类型interfaceRequestConfigextendsAxiosRequestConfig {    // 可以在这里添加自定义的配置字段，如果有的话}// 定义响应数据的通用结构interfaceResponseData<T> {    code: number;    message: string;    data: T;}// 创建 axios 实例constservice: AxiosInstance = axios.create({    baseURL: 'https://api.example.com', // 设置基础 URL    timeout: 5000// 设置超时时间});// 请求拦截器service.interceptors.request.use(    (config: RequestConfig) => {        // 在发送请求之前做些什么，例如添加请求头        config.headers = {            ...config.headers,            'Authorization': 'Bearer your_token'        };        return config;    },    (error: AxiosError) => {        // 对请求错误做些什么        console.error('请求拦截器出错:', error);        returnPromise.reject(error);    });// 响应拦截器service.interceptors.response.use(    (response: AxiosResponse<ResponseData<any>>) => {        // 对响应数据做点什么        const { code, message, data } = response.data;        if (code === 200) {            return data;        } else {            console.error('响应错误:', message);            returnPromise.reject(newError(message));        }    },    (error: AxiosError) => {        // 对响应错误做点什么        console.error('响应拦截器出错:', error);        returnPromise.reject(error);    });// 封装请求方法const request = <T>(config: RequestConfig): Promise<T> => {    return service.request<ResponseData<T>>(config).then((res) => res.data);};exportdefault request;
```

使用：

```
import request from'./http';// 定义请求参数的类型interfaceUserSearchParams {    name?: string;    age?: number;}// 定义响应数据中用户的类型interfaceUser {    id: number;    name: string;    age: number;}// 发起请求constsearchUsers = async (params: UserSearchParams) => {    try {        constusers: User[] = await request<User[]>({            method: 'GET',            url: '/users',            params        });        console.log('搜索到的用户:', users);    } catch (error) {        console.error('请求出错:', error);    }};// 使用constparams: UserSearchParams = {    name: 'John',    age: 30};searchUsers(params);
```

其中：

*   • `AxiosInstance`：表示一个 `axios` 实例，通过 `axios.create()` 方法创建，可对其进行自定义配置，如设置基础 URL、超时时间等。
    
*   • `AxiosRequestConfig`：用于配置请求的各种参数，包括请求方法（`method`）、请求 URL（`url`）、请求头（`headers`）、请求体（`data`）等。
    
*   • `AxiosResponse<ResponseData<any>>`：表示响应的结构，泛型参数 `ResponseData<any>` 表示响应数据的类型。这里使用 `any` 是因为在响应拦截器中我们会根据具体的业务逻辑处理不同类型的响应数据。
    
*   • `AxiosError`：表示 `axios` 请求过程中发生的错误，包含了详细的错误信息，如响应状态码、响应数据等。通过判断 `error.response` 和 `error.request` 是否存在，可以区分不同类型的错误。
    

*   我是 ssh，工作 6 年 +，阿里云、字节跳动 Web infra 一线拼杀出来的资深前端工程师 + 面试官，非常熟悉大厂的面试套路，Vue、React 以及前端工程化领域深入浅出的文章帮助无数人进入了大厂。
    
*   欢迎`长按图片加 ssh 为好友`，我会第一时间和你分享前端行业趋势，学习途径等等。2025 陪你一起度过！
    

*   ![](https://mmbiz.qpic.cn/mmbiz_png/iagNW4Zy9CyYB7lXXMibCMPY61fjkytpQrer2wkVcwzAZicenwnLibkfPZfxuWmn0bNTbicadZFXzcOvOFom7h9zeJQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)
    
*     
    
*   关注公众号，发送消息：
    
    指南，获取高级前端、算法**学习路线**，是我自己一路走来的实践。
    
    简历，获取大厂**简历编写指南**，是我看了上百份简历后总结的心血。
    
    面经，获取大厂**面试题**，集结社区优质面经，助你攀登高峰
    

因为微信公众号修改规则，如果不标星或点在看，你可能会收不到我公众号文章的推送，请大家将本**公众号星标**，看完文章后记得**点下赞**或者**在看**，谢谢各位！