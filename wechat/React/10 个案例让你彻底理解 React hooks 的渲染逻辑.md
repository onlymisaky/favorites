> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/tiaYn-ZdcE2rgXvgLhekHA)

**正式开始，今天要写什么呢，原本我对 react 原理非常清楚，自己写过简单的 react，带 diff 算法和异步更新队列的，但是对 hooks 源码一知半解，于是就要深究他的性能相关问题了   - 重复渲染的逻辑**  

由于项目环境比较复杂，如果是纯 class 组件，那么就是 **component、pureComponent、shouldComponentUpdate** 之类的控制一下是否重新渲染，但是 hooks 似乎更多场景，接下来一一攻破。  

*   **场景一 ，父组件使用 hooks, 子组件使用 class Component**
    

 父组件  

```
export default function Test() {
    const [state, setState] = useState({ a: 1, b: 1, c: 1 });
    const [value, setValue] = useState(11);
    return (
        <div>
            <div>
                state{state.a},{state.b}
            </div>
            <Button
                type="default"
                onClick={() => {
                    //@ts-ignore
                    setState({ a: 2, b: 1 });
                    //@ts-ignore
                    setState({ a: 2, b: 2 });
                    console.log(state, 'state');
                }}
            >
                测试
            </Button>
            <hr />
            <div>value{value}</div>
            <Button
                type="default"
                onClick={() => {
                    setValue(value + 1);
                }}
            >
                测试
            </Button>
            <Demo value={state} />
        </div>
    );
}
```

子组件  

```
export default class App extends React.Component<Props> {
    render() {
        const { props } = this;
        console.log('demo render');
        return (
            <div>
                {props.value.a},{props.value.b}
            </div>
        );
    }
}
```

结果每次点击图中的测试按钮，子组件 Demo 都会重新 render：

![](https://mmbiz.qpic.cn/mmbiz_png/iawKicic66ubH5bq5uW2u0YGLficnNuPodDvHoY7htmJg3SIicaKfHiaBUcKxPpExAeaiaQoEMZLicG9MIRHRQ3lR9tj3Q/640?wx_fmt=png)

总结：父组件 (hook) 每次更新，都会导出一个新的 state 和 value 对象, 子组件肯定会更新（如果不做特殊处理）

*   场景二，父组件使用 hooks, 子组件使用 class PureComponent 
    

父组件代码跟上面一样，子组件使用 PureComponent:

```
export default function Test() {
    const [state, setState] = useState({ a: 1, b: 1, c: 1 });
    const [value, setValue] = useState(11);
    return (
        <div>
            <div>
                state{state.a},{state.b}
            </div>
            <Button
                type="default"
                onClick={() => {
                    //@ts-ignore
                    setState({ a: 2, b: 1 });
                    //@ts-ignore
                    setState({ a: 2, b: 2 });
                    console.log(state, 'state');
                }}
            >
                测试
            </Button>
            <hr />
            <div>value{value}</div>
            <Button
                type="default"
                onClick={() => {
                    setValue(value + 1);
                }}
            >
                测试
            </Button>
            <Demo value={state} />
        </div>
    );
}
```

子组件使用 PureComponent:

```
export default class App extends React.PureComponent<Props> {
    render() {
        const { props } = this;
        console.log('demo render');
        return (
            <div>
                {props.value.a},{props.value.b}
            </div>
        );
    }
}
```

结果子组件依旧会每次都重新 render：

![](https://mmbiz.qpic.cn/mmbiz_png/iawKicic66ubH5bq5uW2u0YGLficnNuPodDv9Tiads1hvJUlzYPn43vOeSQFZ7q0n0dDjsoFlL46kfkVtYjT4DmKZ2Q/640?wx_fmt=png)

总结：结论同上，确实是依赖的 props 改变了，因为父组件是 hook 模式，每次更新都是直接导出新的 value 和 state.

*   场景三，搞懂 hook 的 setState 跟 class 组件 setState 有什么不一样
    

**理论：class 的 setState，如果你传入的是对象，那么就会被异步合并，如果传入的是函数，那么就会立马执行替换，****而 hook 的 setState 是直接替换，那么 setState 在 hook 中是异步还是同步呢？**  

**实践：  
**

**组件 A：**

```
export default function Test() {
    const [state, setState] = useState({ a: 1, b: 1, c: 1 });
    const [value, setValue] = useState(11);
    return (
        <div>
            <div>
                state{state.a},{state.b},{state.c}
            </div>
            <Button
                type="default"
                onClick={() => {
                    //@ts-ignore
                    setState({ a: 2 });
                    //@ts-ignore
                    setState({ b: 2 });
                    console.log(state, 'state');
                }}
            >
                测试
            </Button>
            <hr />
            <div>value{value}</div>
            <Button
                type="default"
                onClick={() => {
                    setValue(value + 1);
                }}
            >
                测试
            </Button>
            <Demo value={state} />
        </div>
    );
}
```

**我将 setState 里两次分别设置了 state 的值为 {a:2},{b:2}，那么是合并，那么我最终得到 state 应该是 {a:2,b:2,c:1}, 如果是替换，那么最后得到的 state 是 {b:2}  
**

**结果：  
**

![](https://mmbiz.qpic.cn/mmbiz_png/iawKicic66ubH5bq5uW2u0YGLficnNuPodDv8KicDj4rFEzaxEAMluYao0CpbWiciar9rY1xVLw1ky9sdXJ1j8sNicicuUQ/640?wx_fmt=png)

**点击测试按钮后，state 变成了 {b:2}, 整个 value 被替换成了 {b:2}**  

**结论：hook 的 setState 是直接替换，而不是合并**

*   场景四 , 父组件使用 class, 子组件使用 hook
    

    父组件:

```
export default class App extends React.PureComponent {
    state = {
        count: 1,
    };
    onClick = () => {
        const { count } = this.state;
        this.setState({
            count: count + 1,
        });
    };
    render() {
        const { count } = this.state;
        console.log('father render');
        return (
            <div>
                <Demo count={count} />
                <Button onClick={this.onClick}>测试</Button>
            </div>
        );
    }
}
```

  
子组件:  

```
interface Props {
    count: number;
}

export default function App(props: Props) {
    console.log(props, 'props');
    return <div>{props.count}</div>;
}
```

逻辑：父组件 (class 组件) 调用 setState, 刷新自身，然后传递给 hooks 子组件，然后自组件重新调用，更新  

![](https://mmbiz.qpic.cn/mmbiz_png/iawKicic66ubH5bq5uW2u0YGLficnNuPodDv05R6XewoqCmEcCU9q8UuQjgkaoVO8hlYnLkQg0e3Kjo46LZR1SQsJQ/640?wx_fmt=png)

*   场景五
    

但是我此时需要想实现一个 class 组件的 PureComponent 一样的效果，需要用到 React.memo

修改父组件代码为：  

```
export default class App extends React.PureComponent {
    state = {
        count: 1,
        value: 1,
    };
    onClick = () => {
        const { value } = this.state;
        this.setState({
            count: value + 1,
        });
    };
    render() {
        const { count, value } = this.state;
        console.log('father render');
        return (
            <div>
                <Demo count={count} />
                {value}
                <Button onClick={this.onClick}>测试</Button>
            </div>
        );
    }
}
```

子组件加入 memo, 代码修改为:

```
import React, { useState, memo } from 'react';
interface Props {
    count: number;
}

function App(props: Props) {
    console.log(props, 'props');
    return <div>{props.count}</div>;
}

export default memo(App);
```

此时逻辑: class 组件改变了自身的 state, 自己刷新自己，由上而下，传递了一个没有变化的 props 给 hooks 组件，hooks 组件使用了 memo 包裹自己。

结果：  

![](https://mmbiz.qpic.cn/mmbiz_png/iawKicic66ubH5bq5uW2u0YGLficnNuPodDvBrFmeUwZ64vfBgU2aHlTHW2bANGB862rGoE0e0YVUvBJN12vgZFWUg/640?wx_fmt=png)

我们使用了 memo 实现了 PureComponent 的效果，浅比较了一次

*   场景六, hook,setState 每次都是相同的值
    

```
export default class App extends React.PureComponent {
    state = {
        count: 1,
        value: 1,
    };
    onClick = () => {
        const { value } = this.state;
        this.setState({
            value:   1,
        });
    };
    render() {
        const { count, value } = this.state;
        console.log('father render');
        return (
            <div>
                <Demo count={count} />
                {value}
                <Button onClick={this.onClick}>测试</Button>
            </div>
        );
    }
}
```

结果：由于每次设置的值都是一样的（都是 1），hooks 不会更新，同 class

*   场景七，父组件和子组件都使用 hook
    

父组件传入 count 给子组件

```
export default function Father() {
    const [count, setCount] = useState(1);
    const [value, setValue] = useState(1);
    console.log('father render')
    return (
        <div>
            <Demo count={count} />
            <div>value{value}</div>
            <Button
                onClick={() => {
                    setValue(value + 1);
                }}
            >
                测试
            </Button>
        </div>
    );
}
```

子组件使用 count

```
export default function App(props: Props) {
    console.log(props, 'props');
    return <div>{props.count}</div>;
}
```

**结果：每次点击测试，都会导致子组件重新 render**

![](https://mmbiz.qpic.cn/mmbiz_png/iawKicic66ubH5bq5uW2u0YGLficnNuPodDvrpibOsbsM7oUwerwVPiaTO7ej6oEKtghZXyYTROY0aB84GquOdibiaWV1g/640?wx_fmt=png)

子组件加入 memo

```
function App(props: Props) {
    console.log(props, 'props');
    return <div>{props.count}</div>;
}

export default memo(App);
```

结果：

![](https://mmbiz.qpic.cn/mmbiz_png/iawKicic66ubH5bq5uW2u0YGLficnNuPodDvgxzawlXwS6iaRGuHEgd5sGX3P9uPDOHWj5KbAOrKGDpdOVQUFKYUWKw/640?wx_fmt=png)

子组件并没有触发更新

⚠️：这里跟第一个案例 class 的 PureComponent 不一样，第一个案例 class 的 PureComponent 子组件此时会重新 render, 是因为父组件 hooks 确实每次更新都会导出新的 value 和 state。这里是调用了一次，设置的都是相同的 state. 所以此时不更新

*   场景八，父组件 hook, 子组件 hook, 使用 **useCallback 缓存函数**
    

父组件:

```
export default function App() {
  const [count1, setCount1] = useState(0);
  const [count2, setCount2] = useState(0);

  const handleClickButton1 = () => {
    setCount1(count1 + 1);
  };

  const handleClickButton2 = useCallback(() => {
    setCount2(count2 + 1);
  }, [count2]);

  return (
    <div>
      <div>
        <Button onClickButton={handleClickButton1}>Button1</Button>
      </div>
      <div>
        <Button onClickButton={handleClickButton2}>Button2</Button>
      </div>
    </div>
  );
}
```

子组件：  

```
import React from 'react';
const Button = (props: any) => {
    const { onClickButton, children } = props;
    return (
        <>
            <button onClick={onClickButton}>{children}</button>
            <span>{Math.random()}</span>
        </>
    );
};
export default React.memo(Button);
```

**结果：虽然我们使用了 memo. 但是点击 demo1，只有 demo1 后面的数字改变了，demo2 没有改变，点击 demo2，两个数字都改变了。**

**那么我们不使用** **useCallback 看看**

**父组件修改代码，去掉** **useCallback**

```
export default function App() {
    const [count1, setCount1] = useState(0);
    const [count2, setCount2] = useState(0);
    const handleClickButton1 = () => {
        setCount1(count1 + 1);
    };
    const handleClickButton2 = () => {
        setCount2(count2+ 1);
    };

    return (
        <div>
            <div>
                <Demo onClickButton={handleClickButton1}>Demo1</Demo>
            </div>
            <div>
                <Demo onClickButton={handleClickButton2}>Demo</Demo>
            </div>
        </div>
    );
}
```

**子组件代码不变，结果此时每次都会两个数字都会跟着变。  
**

![](https://mmbiz.qpic.cn/mmbiz_png/iawKicic66ubH5bq5uW2u0YGLficnNuPodDvAblCrtARP8DbDctwsQP8FdP8AK72x5q3joNZY57WjFldwrQuDt1UOw/640?wx_fmt=png)

官方对 **useCallback** 的解释：

就是返回一个函数，只有在依赖项发生变化的时候才会更新（返回一个新的函数）

结论：

我们声明的 **handleClickButton1** 是直接定义了一个方法，这也就导致只要是父组件重新渲染（状态或者 props 更新）就会导致这里声明出一个新的方法，新的方法和旧的方法尽管长的一样，但是依旧是两个不同的对象，React.memo 对比后发现对象 props 改变，就重新渲染了。

```
const a =()=>{}
const b =()=>{}
a===b //false
```

**这个道理大家都懂，不解释了  
**

*   场景九，去掉依赖数组中的 **count2** 字段
    

```
import React, { useState, useCallback } from 'react';
import Demo from './Demo';

export default function App() {
  const [count2, setCount2] = useState(0);

  const handleClickButton2 = useCallback(() => {
    setCount2(count2 + 1);
  }, []);

  return (
    <Demo 
      count={count2}
      onClickButton={handleClickButton2}
    >测试</Demo>
  );
}
```

这样 count2 的值永远都是 0, 那么这个组件就不会重导出 setCount2 这个方法，handleClickButton2 这个函数永远不会变化，Button 只会更新一次，就是 Demo 组件接受到的 props 从 0 到 1 到的时候. 继续点击，count2 也是 0, 但是 props 有一次从 0-1 的过程导致 Demo 子组件被更新，**不过 count2 始终是 0，这非常关键**

*   场景十，使用 **useMemo**，缓存对象，达到 useCallback 的效果
    

使用前

```
export default function App() {
    const [count, setCount] = useState(0);
    const [value, setValue] = useState(0);
    const userInfo = {
        age: count,
        name: 'Jace',
    };

    return (
        <div>
            <div>
                <Demo userInfo={userInfo} />
            </div>
            <div>
                {value}
                <Button
                    onClick={() => {
                        setValue(value + 1);
                    }}
                ></Button>
            </div>
        </div>
    );
}
```

**子组件使用了 memo, 没有依赖 value，只是依赖了 count.**

**但是结果每次父组件修改了 value 的值后，虽然子组件没有依赖 value，而且使用了 memo 包裹，还是每次都重新渲染了**

![](https://mmbiz.qpic.cn/mmbiz_png/iawKicic66ubH5bq5uW2u0YGLficnNuPodDvhTykGJvgibHw06NUpS8vCxryAJjOMV99d3cvY06xLqviaEv67xfKMkHg/640?wx_fmt=png)

```
import React from 'react';
const Button = (props: any) => {
    const { userInfo } = props;
    console.log('sub render');
    return (
        <>
            <span>{userInfo.count}</span>
        </>
    );
};
export default React.memo(Button);
```

使用后 **useMemo**

```
const [count, setCount] = useState(0);

const obj = useMemo(() => {
  return {
    name: "Peter",
    age: count
  };
}, [count]);

return <Demo obj={obj}>
```

**很明显，第一种方式，如果每次 hook 组件更新，那么 hook 就会导出一个新的 count,const 就会声明一个新的 obj 对象，即使用了 memo 包裹，也会被认为是一个新的对象。**

**看看第二种的结果:**

![](https://mmbiz.qpic.cn/mmbiz_png/iawKicic66ubH5bq5uW2u0YGLficnNuPodDvXntzrF1Jv2DvK1hAv8ibONgF03K5mUeoeic9yZDhk2eeXvnXovVJdRicQ/640?wx_fmt=png)

**父组件更新，没有再影响到子组件了。**

写在最后：

**为什么花了将近 4000 字来讲 React hooks 的渲染逻辑，React 的核心思想，就是拆分到极致的组件化。拆得越细致，性能越好，避免不必要的更新，就是性能优化的基础，希望此文能真正帮助到你了解 hook 的渲染逻辑**

关于奇舞周刊
------

《奇舞周刊》是 360 公司专业前端团队「奇舞团」运营的前端技术社区。关注公众号后，直接发送链接到后台即可给我们投稿。

![](https://mmbiz.qpic.cn/mmbiz_png/MpGQUHiaib4ib6j9X9s2kibfaicBLmIm6dUBqymVmiaKqGFEPn0G3VyVnqQjvognHq4cMibayW2400j4OyEtdz5fkMbmA/640?wx_fmt=jpeg)