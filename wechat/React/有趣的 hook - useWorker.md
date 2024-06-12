> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/7aVRlCdxjo8jMkutq44Q2g)

本文针对的代码版本为 1ceb211

前几天看到个有趣的 `hook`: `useWorker`。可以直接将函数转换为 `worker`，然后调用执行，这样便可以将一些耗时、阻塞的计算放到 `worker` 中执行，避免主线程阻塞。

由于很好奇这个 `hook` 如果在不支持 `worker` 的浏览器上有没有做兼容，就把源码看了一下，这里记录一下。📝

源码解析
----

由于库很小，文件就不看了，直接看下导出：

### 导出

```
export { useWorker } from './useWorker';export { WORKER_STATUS } from './lib/status';
```

导出一共就两个，一个 `useWorker hook` 主体，一个是 `WORKER_STATUS` 常量，里面包含几种状态：

```
export enum WORKER_STATUS {    PENDING = 'PENDING',    SUCCESS = 'SUCCESS',    RUNNING = 'RUNNING',    ERROR = 'ERROR',    TIMEOUT_EXPIRED = 'TIMEOUT_EXPIRED'}
```

### useWorker 定义和实现

先看下 `useWorker` 定义：

```
type Options = {    timeout?: number;    remoteDependencies?: string[];    autoTerminate?: boolean;    transferable?: TRANSFERABLE_TYPE;};export const useWorker = <T extends (...fnArgs: any[]) => any>(fn: T, options: Options = DEFAULT_OPTIONS) => [    typeof workerHook,    WorkerController];
```

再看下实现，`useWorker` 包含一个 `state workerStatus`，默认为 `PENDING`。

包含四个 `ref`：

*   `worker：` 创建的 `worker` 实例
    
*   `isRunning`：`worker` 执行状态
    
*   `promise`：保存 `worker` 执行的 `promise` 的 `resolve` 和 `reject`，方便调用
    
*   `timeoutId`：记录 `timeout` 定时器的 `id`，设置 `timeout` 时使用
    

还包含了几个方法：

*   `setWorkerStatus`：用于设置 `worker` 状态和 `isRunning`
    
*   `killWorker`：用于终止和清理 `worker`
    
*   `onWorkerEnd`：在 `worker` 执行完成时调用，会按照 `option` 判定是否需要清理 `worker`，并更新状态
    
*   `generateWorker`：创建 `worker` 实例，并与其建立通信。
    
*   `callWorker`：调用 `worker` 执行
    
*   `workerHook`：`useWorker` 返回值之一，用于调用 `callWorker`
    

还有一个 `effect`，就是组件卸载时调用 `killWorker` 清理 `worker`。

而另一个返回值 `workerController` 则是包含 `status` 和 `killWorker`

```
const workerController = {    status: workerStatus,    kill: killWorker};
```

### 执行流程

我们先看下使用方法，然后配合看下代码如何运行：

```
import React from 'react';import { useWorker } from '@koale/useworker';const numbers = [...Array(5000000)].map(e => ~~(Math.random() * 1000000));const sortNumbers = nums => nums.sort();const Example = () => {    const [sortWorker] = useWorker(sortNumbers);    const runSort = async () => {        const result = await sortWorker(numbers);        console.log(result);    };    return (        <button type='button' onClick={runSort}>            Run Sort        </button>    );};
```

使用时首先调用 `useWorker`，会返回 `workerHook` 和 `workerController`，例子中 `workerHook` 命名为 `sortWorker`，`workerController` 没用到。

然后在点击按钮时，会调用 `runSort`，`runSort` 会调用 `workerHook` 并传入 `numbers`。看下 `workerHook` 的源码。

```
const workerHook = React.useCallback(    (...fnArgs: Parameters<T>) => {        const terminate = options.autoTerminate != null ? options.autoTerminate : DEFAULT_OPTIONS.autoTerminate;        if (isRunning.current) {            /* eslint-disable-next-line no-console */            console.error(                '[useWorker] You can only run one instance of the worker at a time, if you want to run more than one in parallel, create another instance with the hook useWorker(). Read more: https://github.com/alewin/useWorker'            );            return Promise.reject();        }        if (terminate || !worker.current) {            worker.current = generateWorker();        }        return callWorker(...fnArgs);    },    [options.autoTerminate, generateWorker, callWorker]);
```

他会先判定 `terminate` 参数，用于判定是否需要自动回收。然后判定 `isRunning`，避免重复执行。然后判定是否存在 `worker` 实例，不存在则调用 `generateWorker` 创建。随后便将传入的参数传递给 `callWorker`。

再看下 `generateWorker` 的源码。

```
const generateWorker = useDeepCallback(() => {    const {        remoteDependencies = DEFAULT_OPTIONS.remoteDependencies,        timeout = DEFAULT_OPTIONS.timeout,        transferable = DEFAULT_OPTIONS.transferable    } = options;    const blobUrl = createWorkerBlobUrl(fn, remoteDependencies!, transferable!);    const newWorker: Worker & { _url?: string } = new Worker(blobUrl);    newWorker._url = blobUrl;    newWorker.onmessage = (e: MessageEvent) => {        const [status, result] = e.data as [WORKER_STATUS, ReturnType<T>];        switch (status) {            case WORKER_STATUS.SUCCESS:                promise.current[PROMISE_RESOLVE]?.(result);                onWorkerEnd(WORKER_STATUS.SUCCESS);                break;            default:                promise.current[PROMISE_REJECT]?.(result);                onWorkerEnd(WORKER_STATUS.ERROR);                break;        }    };    newWorker.onerror = (e: ErrorEvent) => {        promise.current[PROMISE_REJECT]?.(e);        onWorkerEnd(WORKER_STATUS.ERROR);    };    if (timeout) {        timeoutId.current = window.setTimeout(() => {            killWorker();            setWorkerStatus(WORKER_STATUS.TIMEOUT_EXPIRED);        }, timeout);    }    return newWorker;}, [fn, options, killWorker]);
```

此处使用的是自定义 `hook` `useDeepCallback`，他会深比对 `dependences` 来触发 `callback` 的更新。

可以看到主要是调用了 `createWorkerBlobUrl` 创建了一个 `worker url`，然后创建 `worker` 实例，并绑定 `onmessage` 和 `onerror`，并在随后开启超时定时器。

`createWorkerBlobUrl` 代码就三句：

```
const blobCode = `    ${remoteDepsParser(deps)};    onmessage=(${jobRunner})({      fn: (${fn}),      transferable: '${transferable}'    })  `;const blob = new Blob([blobCode], { type: 'text/javascript' });const url = URL.createObjectURL(blob);
```

先是将 `jobRunner、fn、transferable` 拼接成一段方法字符串，然后创建 `blob` 并将其转换为 `url`。

`jobRunner` 会调用 `fn`，然后将 `fn` 返回的结果和状态通过 `postMessage` 发送给主线程，主线程会触发 `onmessage`，调用 `promiseRef` 返回结果 和调用 `onWorkerEnd`。`onWorkerEnd` 会按照 `autoTerminate` 参数决定是否需要在完成任务后自动销毁 `worker`。

其中还有一些报错处理、超时处理的代码，就不细说了。

### 兼容处理

然而没发现兼容相关的代码。`useWorker` 使用到了 `createObjectURL` 和 `Worker`，当然这俩兼容性还可以，兼容到 `IE 10`。如果不放心可以主动做个降级：

```
const runSort = async () => {    try {        const result = await sortWorker(numbers);        console.log(result);    } catch (e) {        sortNumbers(numbers);    }};
```

虽然 `hook` 外无法包裹条件判断，但由于调用 `sortWorker` 才会去执行 `createObjectURL` 和 `Worker` 实例化，我们在调用时做个判断即可，或者通过前置判断：

```
const runSort = async () => {    const result = typeof Worker === 'undefined' ? sortNumbers(numbers) : await sortWorker(numbers);};
```

总结
--

`useWorker` 可以在进行耗能计算时通过 `worker` 来避免主线程的阻塞，如果在业务中有使用如前端大批量数据搜索、复杂计算时可以考虑使用，可以有效提高代码性能。

其它相似库
-----

如果要在非 `react` 环境下转换 `worker`，也可以尝试以下库，或者照着思路自己实现：

*   greenlet
    
*   workerize
    
*   react-hooks-worker