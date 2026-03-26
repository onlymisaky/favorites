> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [zhuanlan.zhihu.com](https://zhuanlan.zhihu.com/p/1959996207221940398)

大家好，`React` 技术栈发展到现在，已经出现了非常多且优秀的状态库，比如从早期的 `Redux` 和 `Mobx`，到现在拥抱 Hooks 版本的 Zustand 和 Jotai。

在当前 React 18、19 的项目中，来自同一作者开源的 `Zustand 和 Jotai` 状态库我们应该如何衡量和使用呢？

本篇，笔者将和大家一起，从 `设计理念`、`学习成本`、`原理分析`、`项目适配度` 几个维度展开研究。

如果读者对此有更好的见解和经验，欢迎在评论区讨论和指导👏🏻👏🏻。

一、设计理念
------

**Zustand**：**自上而下的中心化思想**。

类似 Redux，Zustand 有 `Store` 集中控制的设计思想，可以按模块划分，将一组有关的状态聚合在一个 `store` 中，通过 `selector` 从中取出需要的部分。

**Jotai**：**自下而上的原子化设计**。

类似于 CSS Tailwind CSS 原子类的设计思想，将状态拆分为独立单元（原子），你可以将它们组合在一起使用。

二、学习成本
------

在我们选择一个库到项目中时，需要考虑对团队成员的学习成本。比如使用起来是否简单，是否有复杂的概念和 API 用法。

不论是 Zustand 还是 Jotai 都是**基于 React Hooks 函数式编程思想实现的状态管理**。

用法上只需两步即可完成：**1）全局定义 state；2）组件内消费和更新全局 state**。

**Zustand 使用示例**

1.  定义 store（状态）：

```
// src/store/useConfigStore.js
import { create } from "zustand";

const useConfigStore = create((set) => ({
  theme: "light",
  lang: "zh-CN",
  setLang: (lang) => set({ lang }),
  setTheme: (theme) => set({ theme }),
}));

export default useConfigStore;
```

2. 在组件中消费和更新状态：

```
// src/components/ZustandComponent.jsx
import { Fragment } from "react";
import useConfigStore from "../store/useConfigStore";

export default function ZustandComponent() {
  const { theme, lang, setLang, setTheme } = useConfigStore((state) => state);
  return (
    <Fragment>
      <div>theme: {theme}</div>
      <div>lang: {lang}</div>

      <button onClick={() => setLang(lang === "zh-CN" ? "en" : "zh-CN")}>
        setLang
      </button>
      <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
        setTheme
      </button>
    </Fragment>
  );
}
```

**Jotai 使用示例**

1.  定义 atom（状态）

```
// src/store/useConfigAtom.js
import { atom } from "jotai";

const themeAtom = atom("light");
const langAtom = atom("zh-CN");

export { themeAtom, langAtom };
```

2. 在组件中消费和更新状态：

```
// src/components/JotaiComponent.jsx
import { useAtom } from "jotai";
import { themeAtom, langAtom } from "../store/useConfigAtom";

export default function JotaiComponent() {
  const [theme, setTheme] = useAtom(themeAtom);
  const [lang, setLang] = useAtom(langAtom);
  return (
    <div>
      <div>theme: {theme}</div>
      <div>lang: {lang}</div>
      <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
        setTheme
      </button>
      <button onClick={() => setLang(lang === "zh-CN" ? "en" : "zh-CN")}>
        setLang
      </button>
    </div>
  );
}
```

从上面代码可以看出这两个库的用法都非常简单，不会对开发者有太多心智压力。

除了基础用法外，官方还提供了一些场景用法（比如 set 的异步操作）、工具 / 中间件。

三、原理分析
------

二者的「数据驱动组件重渲染」实现原理比较相似：**都采用「观察者模式」** **`subscribe`** **订阅更新的方式实现**。

**Zustand**

它采用了 React18 新增的 hook `useSyncExternalStore`。

**通过 `useSyncExternalStore` 将外部的 store（普通对象）接入到组件内，并且订阅 store set 更新方法，产生更新后驱动组件重新渲染**。

简易版实现思路如下，用法与原版完全一致：

```
// src/store/useConfigStore.js
import { useSyncExternalStore } from "react";

function create(createState) {
  // 1、创建 store
  const store = {
    state: undefined, // store state
    listeners: new Set(), // 订阅集合
    // 订阅函数
    subscribe: (listener) => {
      store.listeners.add(listener);
      return () => {
        store.listeners.delete(listener);
      };
    },
  };

  // 自定义更新 state 的方法，用于实现 listeners 通知更新
  const setState = (partial, replace) => {
    const { state, listeners } = store;
    const nextState = typeof partial === "function" ? partial(state) : partial;
    // 使用 Object.is 比较两个对象是否是同一个引用地址，等同于使用全等 ===
    if (!Object.is(nextState, state)) {
      const previousState = state;
      // 更新 state，如果 replace 为 true，则直接替换，否则浅合并到 state 上
      store.state = replace ? nextState : Object.assign({}, state, nextState);
      // notify 通知
      listeners.forEach((listener) => listener(store.state, previousState));
    }
  };

  store.state = createState(setState);

  // 2、返回的 useStore 用于在组件中消费 store state
  return function useStore(selector) {
    return useSyncExternalStore(store.subscribe, () => selector(store.state));
  };
}
```

**在这里，核心是自定义了** **`setState`** **方法，在更新** **`store state`** **后，发布通知从而触发** **`useSyncExternalStore`** **的重渲染机制。**

**Jotai**

Jotai 和 Zustand 的实现基本相似，都是自定义了 `setState` 方法，数据更新后通知订阅回调。

不过在组件处理更新上稍有差异：**Jotai 并未使用 `useSyncExternalStore` hook，而是采用 `useReducer` hook 来触发组件更新**。

不管用哪种方式，它们的**目的都是为了在数据更新后触发组件重新渲染**。

简易版实现思路如下，用法与原版完全一致：

```
// src/store/useConfigAtom.js
import { useReducer, useEffect } from "react";

// 1、创建 atom config 对象
function atom(initialState) {
  const config = {
    state: initialState, // 原子值
    listeners: new Set(), // 订阅集合
    // 订阅函数
    subscribe: (listener) => {
      config.listeners.add(listener);
      return () => {
        config.listeners.delete(listener);
      };
    },
    // 自定义更新 state 的方法，用于实现 listeners 通知更新
    setState: (partial) => {
      const { state, listeners } = config;
      const nextState =
        typeof partial === "function" ? partial(state) : partial;
      if (!Object.is(nextState, state)) {
        const previousState = state;
        // 更新 state
        config.state = nextState;
        // notify 通知
        listeners.forEach((listener) => listener(config.state, previousState));
      }
    },
  };

  return config;
}

// 2、实现 useAtom，用于在组件中消费和更新 atom config 对象
export function useAtom(atom) {
  return [useAtomValue(atom), useSetAtom(atom)];
}

// get，简单理解：
// 1）从 atom config 对象中获取 state value 值
// 2）订阅更新
// 3）收到更新后执行 useReducer dispatch 更新组件
export function useAtomValue(atom) {
  const [[value], dispatch] = useReducer(
    (prev) => {
      const nextValue = atom.state; // 从 store 获取最新的 atom 值
      // 如果都没有变化，返回之前的状态（避免不必要的重新渲染）
      if (Object.is(prev[0], nextValue)) return prev;
      return [nextValue]; // 有变化时返回新状态
    },
    undefined,
    () => [atom.state] // 初始化函数
  );

  // useReducer 更新策略与订阅机制配合使用
  useEffect(() => {
    const unsubscribe = atom.subscribe(dispatch); // 订阅更新，执行 useReducer dispatch 更新组件
    return unsubscribe;
  }, [atom]);

  return value;
}

// set，简单理解：
// 1）更新 atom config 对象的 state value 值；
// 2）触发 listeners 监听回调完成消费此 atom state 的组件更新；
export function useSetAtom(atom) {
  return atom.setState;
}
```

现在我们从二者的原理实现来看，它们最主要的区别还是`设计思想`：**是采用 store 中心化集中管理思想 还是说 atom 原子化独立的思想**。

四、项目适配度
-------

最后我们讨论一下 Zustand 和 Jotai 分别适合在什么样的项目中使用？

从原理上来说，它们在 React 框架上的接入基本一致；

从用法简易度来说，它们其实都很简单（Jotai 原子化思想，可能比 Zustand 在用法上还要更简单一些）；

笔者认为应该考量的是**设计思想**。

比如团队成员习惯了 Redux 编程思维倾向这种 Store 集中管理思想，或做一些大型项目，可以选择 `Zustand` 作为状态库使用；

反之编程思维倾向原子化独立、组合的思想，或做一些小型项目，那可以选择 `Jotai`，更灵活一些。

具体选择可**因团队、项目业务方向**而定。