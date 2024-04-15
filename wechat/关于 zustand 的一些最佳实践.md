> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/h3pjeOjY1Tnzifv1FmhAGQ)

前言
==

看过我文章的人，应该知道`React`状态管理库中我比较喜欢使用 Zustand 的，因为使用起来非常简单，没有啥心智负担。这篇文章给大家分享一下，我这段时间使用 zustand 的一些心得和个人认为的最佳实践。

优化
==

在 React 项目里，最重要优化可能就是解决重复渲染的问题了。使用 zustand 的时候，如果不小心，也会导致一些没用的渲染。

举个例子：

创建一个存放主题和语言类型的 store

```
import { create } from 'zustand';interface State {  theme: string;  lang: string;}interface Action {  setTheme: (theme: string) => void;  setLang: (lang: string) => void;}const useConfigStore = create<State & Action>((set) => ({  theme: 'light',  lang: 'zh-CN',  setLang: (lang: string) => set({lang}),  setTheme: (theme: string) => set({theme}),}));export default useConfigStore;
```

分别创建两个组件，主题组件和语言类型组件

```
import useConfigStore from './store';

const Theme = () => {

  const { theme, setTheme } = useConfigStore();
  console.log('theme render');
  
  return (
    <div>
      <div>{theme}</div>
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>切换</button>
    </div>
  )
}

export default Theme;
```

```
import useConfigStore from './store';

const Lang = () => {

  const { lang, setLang } = useConfigStore();

  console.log('lang render...');

  return (
    <div>
      <div>{lang}</div>
      <button onClick={() => setLang(lang === 'zh-CN' ? 'en-US' : 'zh-CN')}>切换</button>
    </div>
  )
}

export default Lang;
```

按照上面写法，改变 theme 会导致 Lang 组件渲染，改变 lang 会导致 Theme 重新渲染，但是实际上这两个都没有关系，怎么优化这个呢，有以下几种方法。

方案一
---

```
import useConfigStore from './store';

const Theme = () => {

  const theme = useConfigStore((state) => state.theme);
  const setTheme = useConfigStore((state) => state.setTheme);

  console.log('theme render');

  return (
    <div>
      <div>{theme}</div>
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>切换</button>
    </div>
  )
}

export default Theme;
```

把值单个 return 出来，zustand 内部会判断两次返回的值是否一样，如果一样就不重新渲染。

这里因为只改变了 lang，theme 和 setTheme 都没变，所以不会重新渲染。

方案二
---

上面写法如果变量很多的情况下，要写很多遍`useConfigStore`，有点麻烦。可以把上面方案改写成这样，变量多的时候简单一些。

```
import useConfigStore from './store';

const Theme = () => {

  const { theme, setTheme } = useConfigStore(state => ({
    theme: state.theme,
    setTheme: state.setTheme,
  }));

  console.log('theme render');

  return (
    <div>
      <div>{theme}</div>
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>切换</button>
    </div>
  )
}

export default Theme;
```

上面这种写法是不行的，因为每次都返回了新的对象，即使 theme 和 setTheme 不变的情况下，也会返回新对象，zustand 内部拿到返回值和上次比较，发现每次都是新的对象，然后重新渲染。

上面情况，zustand 提供了解决方案，对外暴露了一个`useShallow`方法，可以浅比较两个对象是否一样。

```
import { useShallow } from 'zustand/react/shallow';
import useConfigStore from './store';

const Theme = () => {

  const { theme, setTheme } = useConfigStore(
    useShallow(state => ({
      theme: state.theme,
      setTheme: state.setTheme,
    }))
  );

  console.log('theme render');

  return (
    <div>
      <div>{theme}</div>
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>切换</button>
    </div>
  )
}

export default Theme;
```

方案三
---

上面两种写法是官方推荐的写法，但是我觉得还是很麻烦，我自己封装了一个`useSelector`方法，使用起来更简单一点。

```
import { pick } from 'lodash-es';import { useRef } from 'react';import { shallow } from 'zustand/shallow';type Pick<T, K extends keyof T> = {  [P in K]: T[P];};type Many<T> = T | readonly T[];export function useSelector<S extends object, P extends keyof S>(  paths: Many<P>): (state: S) => Pick<S, P> {  const prev = useRef<Pick<S, P>>({} as Pick<S, P>);  return (state: S) => {    if (state) {      const next = pick(state, paths);      return shallow(prev.current, next) ? prev.current : (prev.current = next);    }    return prev.current;  };}
```

useSelector 主要使用了 lodash 里的 pick 方法，然后使用了 zustand 对外暴露的`shallow`方法，进行对象浅比较。

```
import useConfigStore from './store';
import { useSelector } from './use-selector';

const Theme = () => {

  const { theme, setTheme } = useConfigStore(
    useSelector(['theme', 'setTheme'])
  );

  console.log('theme render');

  return (
    <div>
      <div>{theme}</div>
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>切换</button>
    </div>
  )
}

export default Theme;
```

封装的`useSelector`只需要传入对外暴露的字符串数组就行了，不用再写方法了，省了很多代码，同时还保留了 ts 的类型推断。

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvSjDicsRhG9XO4I8kQYQXvKAGM4zz4ucjfUgtvsKmWE2UXsXpofnYUgdgdMEvjrqiaT8uLHV4qF9MQ/640?wx_fmt=png&from=appmsg)image.png![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvSjDicsRhG9XO4I8kQYQXvK8N57SwLcPK7hkv1H0fsoUbpKLCd7icHbHpfMFc1sJaRribWWSaDv3icpQ/640?wx_fmt=png&from=appmsg)image.png

终极方案
----

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvSjDicsRhG9XO4I8kQYQXvKtrExSFQDs9Tvia6kymUkCgXHg26mZLicFphuyD3I9LoibawXHcYuiceafQ/640?wx_fmt=png&from=appmsg)image.png

看一下这个代码，分析一下，前面 theme 和 setTheme 和后面 useSelector 的参数是一样的，那我们能不能写一个插件，自动把`const { theme, setTheme } = useStore();`转换为`const { theme, setTheme } = useStore(useSelector(['theme', 'setTheme']));`，肯定是可以的。

因为项目是 vite 项目，所以这里写的是 vite 插件，webpack 插件实现和这个差不多。

因为要用到 babel 代码转换，所以需要安装 babel 几个依赖

```
pnpm i @babel/generator @babel/parser @babel/traverse @babel/types -D
```

@babel/parser 可以把代码转换为抽象语法树

@babel/traverse 可以转换代码

@babel/generator 把抽象语法树生成代码

@babel/types 快速创建节点

插件完整代码，具体可以看一下代码注释

```
import generate from '@babel/generator';import parse from '@babel/parser';import traverse from "@babel/traverse";import * as t from '@babel/types';export default function zustand() {  return {    name: 'zustand',    transform(src, id) {      // 过滤非 .tsx 文件      if (!/\.tsx?$/.test(id)) {        return {          code: src,          map: null, // 如果可行将提供 source map        };      }      // 把代码转换为ast      const ast = parse.parse(src, { sourceType: 'module' });      let flag = false;      traverse.default(ast, {        VariableDeclarator: function (path) {          // 找到变量为useStore          if (path.node?.init?.callee?.name === 'useStore') {            // 获取变量名            const keys = path.node.id.properties.map(o => o.value.name);            // 给useStore方法注入useSelector参数            path.node.init.arguments = [              t.callExpression(                t.identifier('useSelector'),                [t.arrayExpression(                  keys.map(o => t.stringLiteral(o)                ))]              )            ];            flag = true;          }        },      });      if (flag) {        // 如果没有找到useSelector，则自动导入useSelector方法        if (!src.includes('useSelector')) {          ast.program.body.unshift(            t.importDeclaration([              t.importSpecifier(                t.identifier('useSelector'),                 t.identifier('useSelector')              )],              t.stringLiteral('useSelector')            )          )        }        // 通过ast生成代码        const { code } = generate.default(ast);        return {          code,          map: null,        }      }      return {        code: src,        map: null,       };    },  };}
```

在 vite 配置中，引入刚才写的插件

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvSjDicsRhG9XO4I8kQYQXvKqjicyict3xuqdFhFIibvfbOU23nJJSsk0XMs4g7SLicGyXEry9xA7JedIQ/640?wx_fmt=png&from=appmsg)image.png

把 Theme 里 useSelector 删除

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvSjDicsRhG9XO4I8kQYQXvK1GjjebSKroYa84GMZ267vnhMnt4tOvOaoJBDngNpFTuOhVkDoskmxg/640?wx_fmt=png&from=appmsg)image.png

看一下转换后的文件，把 useSelector 自动注入进去了

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvSjDicsRhG9XO4I8kQYQXvKz04qqfeicO4aHfJM2g9Qz5DErUaTs8tvN5icGYnfjOb9wX9BqH7mdNRQ/640?wx_fmt=png&from=appmsg)image.png

持久化
===

把 zustand 里的数据持久化到 localstorage 或 sessionStorage 中，官方提供了中间件，用起来很简单，我想和大家分享的是，只持久化某个字段，而不是整个对象。

持久化整个对象

```
import { create } from 'zustand';import { createJSONStorage, persist } from 'zustand/middleware';interface State {  theme: string;  lang: string;}interface Action {  setTheme: (theme: string) => void;  setLang: (lang: string) => void;}const useConfigStore = create(  persist<State & Action>(    (set) => ({      theme: 'light',      lang: 'zh-CN',      setLang: (lang: string) => set({lang}),      setTheme: (theme: string) => set({theme}),    }),    {      name: 'config',      storage: createJSONStorage(() => localStorage),    }  ));export default useConfigStore;
```

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvSjDicsRhG9XO4I8kQYQXvK3gxcq31X0oE0goI2PZwh5o0DRgBVaA3LTaIhicjHkXWw5WmC12lF2ww/640?wx_fmt=png&from=appmsg)image.png

如果想只持久化某个字段，可以使用`partialize`方法

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvSjDicsRhG9XO4I8kQYQXvKiaOlKYRkXTm5FMMya64LpLfNiaqUHXE5vt2rVhXicXicvt0na8oj2CzQuA/640?wx_fmt=png&from=appmsg)image.png![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvSjDicsRhG9XO4I8kQYQXvKL06ebicyyZtialicwibLos9Ge5GkrB3X5gBAspCSeM3f6EGByxDQMhBlww/640?wx_fmt=png&from=appmsg)image.png

调试
==

当 store 里数据变得复杂的时候，可以使用`redux-dev-tools`浏览器插件来查看 store 里的数据，不过需要使用`devtools`中间件。

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvSjDicsRhG9XO4I8kQYQXvKQIrmkng7LNoxVd47plPD4ibxuRIDGtoq2NlMSGBSDMESwOiaca22Tqyw/640?wx_fmt=png&from=appmsg)image.png

可以看到每一次值的变化

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvSjDicsRhG9XO4I8kQYQXvKtbT5puU6icgwdXdmib6a5OrJglyIAQ9HLGZggPjpwILq2D0AJr4PtPcw/640?wx_fmt=png&from=appmsg)image.png

默认操作名称都是 anonymous 这个名字，如果我们想知道调用了哪个函数，可以给 set 方法传第三个参数，这个表示方法名。

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvSjDicsRhG9XO4I8kQYQXvKFzkLFnGwt7v7wTmfVibicoKXJtQz8G3icsbTqTAnMnUABD3IGhMZgdfQA/640?wx_fmt=png&from=appmsg)image.png![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvSjDicsRhG9XO4I8kQYQXvKCZwPmjDpmKxd2h7wPpeJxsEPpIpicictU05SFA5hcQcXSNyCVM8QaUOQ/640?wx_fmt=png&from=appmsg)image.png

还可以回放动作

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvSjDicsRhG9XO4I8kQYQXvKTfwgrlXH2ywqicdW5Q9hIuNaXcAuFgXM5sZDribRiarjA2ibBc2uVc4Cvw/640?wx_fmt=png&from=appmsg)image.png

多实例
===

zustand 的数据默认是全局的，也就是说每个组件访问的数据都是同一个，那如果写了一个组件，这个组件在多个地方使用，如果用默认方式，后面的数据会覆盖掉前面的，这个不是我们想要的。

为了解决这个问题，官方推荐这样做：

```
import React, { createContext, useRef } from 'react';import { StoreApi, createStore } from 'zustand';interface State {  theme: string;  lang: string;}interface Action {  setTheme: (theme: string) => void;  setLang: (lang: string) => void /*  */;}export const StoreContext = createContext<StoreApi<State & Action>>(  {} as StoreApi<State & Action>);export const StoreProvider = ({children}: any) => {  const storeRef = useRef<StoreApi<State & Action>>();  if (!storeRef.current) {    storeRef.current = createStore<State & Action>((set) => ({      theme: 'light',      lang: 'zh-CN',      setLang: (lang: string) => set({lang}),      setTheme: (theme: string) => set({theme}),    }));  }  return React.createElement(    StoreContext.Provider,    {value: storeRef.current},    children  );};
```

使用了 React 的 context

使用 Theme 组件来模拟两个实例，使用 StoreProvider 包裹 Theme 组件

```
import './App.css'
import { StoreProvider } from './store'
import Theme from './theme'

function App() {

  return (
    <>
      <StoreProvider>
        <Theme />
      </StoreProvider>
      <StoreProvider>
        <Theme />
      </StoreProvider>
    </>
  )
}

export default App
```

Theme 组件

```
import { useContext } from 'react';
import { useStore } from 'zustand';
import { StoreContext } from './store';

const Theme = () => {

  const store = useContext(StoreContext);
  const { theme, setTheme } = useStore(store);

  return (
    <div>
      <div>{theme}</div>
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>切换</button>
    </div>
  )
}

export default Theme;
```

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvSjDicsRhG9XO4I8kQYQXvKKU7vnCwfq64Oar1ibknDolInBaPfic9s8e3rdTQS8mNyKePtyWw7bnMg/640?wx_fmt=png&from=appmsg)image.png

可以看到两个实例没有公用数据了

官网推荐的方法，虽然可以实现多实例，但是感觉有点麻烦，我自己给封装了一下，把`Context`、`Provider`、`useStore`使用工厂方法统一导出，使用起来更加简单。

```
import React, { useContext, useRef } from 'react';import {  StateCreator,  StoreApi,  createStore,  useStore as useExternalStore,} from 'zustand';type ExtractState<S> = S extends {getState: () => infer X} ? X : never;export const createContext = <T>(store: StateCreator<T, [], []>) => {  const Context = React.createContext<StoreApi<T>>({} as StoreApi<T>);  const Provider = ({children}: any) => {    const storeRef = useRef<StoreApi<T> | undefined>();    if (!storeRef.current) {      storeRef.current = createStore<T>(store);    }    return React.createElement(      Context.Provider,      {value: storeRef.current},      children    );  };  function useStore(): T;  function useStore<U>(selector: (state: ExtractState<StoreApi<T>>) => U): U;  function useStore<U>(selector?: (state: ExtractState<StoreApi<T>>) => U): U {    const store = useContext(Context);    // eslint-disable-next-line @typescript-eslint/ban-ts-comment    // @ts-ignore    return useExternalStore(store, selector);  }  return {Provider, Context, useStore};};
```

引入`Provider`

```
import './App.css'
import Theme from './theme'

import { Provider } from './store'

function App() {
  return (
    <>
      <Provider>
        <Theme />
      </Provider>
      <Provider>
        <Theme />
      </Provider>
    </>
  )
}

export default App
```

在 Theme 组件中使用`useStore`，并且可以和前面封装的`useSelector`配合使用。

```
import { useStore } from './store';
import { useSelector } from './use-selector';

const Theme = () => {

  const { theme, setTheme } = useStore(useSelector(['theme', 'setTheme']));

  return (
    <div>
      <div>{theme}</div>
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>切换</button>
    </div>
  )
}

export default Theme;
```

最后
==

以上就是我这段时间使用 zustand 的一些心得，欢迎大家指正。