> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/w0kpCe3GIn_EQ9DQCIkntw)

> 🙋🏻‍♀️ 编者按：本文作者是蚂蚁集团体验设计师闻冰（社区称呼：空谷） ，本篇中，闻冰首先介绍了那些复杂应用的状态管理天坑，认为 zustand 是当下复杂状态管理的最佳选择，并从状态共享、状态变更、状态派生、性能优化等 6 个方面诠释了选择它的理由。本篇为上篇，下篇将介绍 Zustand 的渐进式状态管理实践，敬请期待～

作为一名主业做设计，业余搞前端的小菜鸡，到 2020 年底为止都是用云谦大佬的 dva 一把梭。当时整体的使用体验还是挺好的，对于我这样的前端菜鸡上手门槛低，而且学一次哪都可用，当时从来没愁过状态管理。

![](https://mmbiz.qpic.cn/mmbiz_jpg/M7OtEw9eDKHHIlCdf8ubMWwPDdHGdhvWW8SUOKDIE9uDDOCnNKARVEqgaZbF9SWl4jlLoTB3yB4NWgMxRmhVcg/640?wx_fmt=jpeg)

至今 Kitchen3 里仍然躺着用 dva 做状态管理的功能模块，写于 2020 年

直到 hooks 横空出世， TypeScript 逐步流行。一方面，从 react hooks 出来以后，大量的文章开始鼓吹「你不需要 Redux」、「useState + Context」完全可用、「next-unstated」YYDS 等等。另一方面，由于 Dva 不再维护，其在 ts 下的都没有任何提示的问题也逐步暴露。

在尝试一些小项目中使用 hooks 后感觉还行之后，作为小萌新的我也全面转向了 hooks 的怀抱。中间其实一直没怎么遇到问题，因为大部分前端应用的复杂度也就那样，hooks 问题不大。然后呢？然后从去年开始就在复杂应用里踩坑了。

![](https://mmbiz.qpic.cn/mmbiz_jpg/M7OtEw9eDKHHIlCdf8ubMWwPDdHGdhvWkBddmKBAkVxbiaN8ickbrD6ZADm6ePuSlV8aOCIxW3wSvWdRIwGjFXcw/640?wx_fmt=jpeg)

  复杂应用的状态管理天坑
=============

> ProEditor 是内部组件库 TechUI Studio 的编辑器组件。

业务组件 ProEditor 就是一个很典型的例子。由于 ProEditor 是个编辑器，对用户来说编辑体验非常重要，是一个重交互操作的应用，这就会牵扯到大量的状态管理需求。

![](https://mmbiz.qpic.cn/mmbiz_jpg/M7OtEw9eDKHHIlCdf8ubMWwPDdHGdhvWRMREiavicZjyN7uwDOicHOyOls7Gr1eMdEWiaia7cpKhWewB5gKEG2D7Ukg/640?wx_fmt=jpeg)

先简单来列下 ProEditor 的状态管理需求有哪些：

**❶ Editor 容器状态管理与组件（Table）状态管理拆分，但可联动消费；**

容器状态负责了一些偏全局配置的状态维护，比如画布、代码页的切换，是否激活画布交互等等，而组件的状态则是保存了组件本身的所有配置和状态。

这么做的好处在于不同组件可能会有不同的状态，而 Editor 的容器状态可以复用，比如做 ProForm 的时候，Editor 的容器仍然可以是同一个，组件状态只需额外实现 ProForm 的 Store 即可。

![](https://mmbiz.qpic.cn/mmbiz_jpg/M7OtEw9eDKHHIlCdf8ubMWwPDdHGdhvW8AoFEINyVmxZ5NrhyNJLavry7GLKge1RxE209s0lX5CQbR7mdDrqDA/640?wx_fmt=jpeg)

从上图可以看到，Table 的状态就是 Editor 的 config 字段，当 Table 改时，会触发 Editor 的 config 字段同步更新。当 Editor 更新时，也会触发该数据更新。

最初的版本，我使用了 Provider + Context 的方式来做全局状态管理。大概的写法是这样的：

```
// 定义export const useStudioStore = (props?: ProEditorProps) => {  // ...  const tableStore = useTableStore(props?.value);  const [tabKey, switchTab] = useState(TabKey.canvas);  const [activeConfigTab, switchConfigTab] = useState<TableConfigGroup>(TableConfigGroup.Table);  // ...}export const StudioStore = createContextStore(useStudioStore, {});// 消费 const NavBar: FC<NavBarProps> = ({ logo }) => {  const { tabKey } = useContext(StudioStore);  return ...}
```

由于这一版是 Context 一杆推到底，这造成了一些很离谱的交互反馈，就是每一次点击其他任何地方（例如画布代码、组件的配置项），都会造成面板的 Tabs 重新渲染（左下图）。右下图是相应的重渲染分析图，可以看到任何动作都造成了重新所有页面元素的重渲染。而这还是最早期的 demo 版本，功能和数据量的才实现到 20% 左右。所以可以预见到如果不做任何优化，使用体验会差到什么程度。

![](https://mmbiz.qpic.cn/mmbiz_gif/M7OtEw9eDKHHIlCdf8ubMWwPDdHGdhvWmJNtPzczLBq5vosRiaLKR6QLl2wcP4gotr7QibSvgF12gC0EME0oUPBQ/640?wx_fmt=gif)![](https://mmbiz.qpic.cn/mmbiz_gif/M7OtEw9eDKHHIlCdf8ubMWwPDdHGdhvWKOMbobWPZ30567OXLDEyD2MAl083PeoicQEvbPeLaekMI3ZbKKzG4Rg/640?wx_fmt=gif)

**❷ 需要进行复杂的数据处理**

ProEditor 针对表格编辑，做了大量的数据变换操作。比如 ProTable 中针对 `columns` 这个字段的更新就有 14 种操作。比如其中一个比较容易被感知的`updateColumnByOneAPI` 就是基于 oneAPI 的字段信息更新，细颗粒度地调整 columns 里的字段信息。而这样的字段修改类型的 store，在 ProEditor 中除了 `columns` 还有一个 `data`。

当时，为了保证数据变更方法的可维护性与 action 的不变性，我采用了 userReducer 做变更方法的管理。

![](https://mmbiz.qpic.cn/mmbiz_jpg/M7OtEw9eDKHHIlCdf8ubMWwPDdHGdhvWReXq2gjM9ewOjzN0c04pKLa8ibKrNdePIzLeibpdrrk6K2icJY2BmZEKw/640?wx_fmt=jpeg)

因为一旦采用自定义 hooks ，就得写成下面这样才能保证不会重复渲染，会造成极大的心智负担，一旦出现数据不对的情况，很难排查到底是哪个方法或者依赖有问题。

```
// 自定 hook 的写法const useDataColumns = () => {  const createOrUpdateColumnsByMockData = useCallback(()=>{    // ...  },[a,b]);  const createColumnsByOneAPI = useCallback(()=>{    // ...  },[c,d]);  const updateColumnsByOneAPI = useCallback(()=>{    // ...  },[a,b,c,d]);  // ...}
```

但 useReducer 也有很大的局限性，例如不支持异步函数、不支持内部的 reducer 互相调用，不支持和其他 state 联动（比如要当参数穿进去才可用），所以也不是最优解。

**❸ 是个可被外部消费的组件**

一旦提到组件，势必要提非受控模式和受控模式。为了支持好我们自己的场景，且希望把 ProEditor 变成一个好用的业务组件，所以我们做了受控模式，毕竟一个好用的组件一定是要能同时支持好这两种模式的。

在实际场景下，我们既需要配置项（`config`）受控，同时也需要画布交互状态（`interaction`）受控，例如下面的场景：在激活某个单元格状态时点击生成，我们需要将这个选中状态进行重置，才能生成符合预期的设计稿。

![](https://mmbiz.qpic.cn/mmbiz_gif/M7OtEw9eDKHHIlCdf8ubMWwPDdHGdhvW2VVCkaXTs15fmuCYXfNh3ic50W56chZAnVxaDUzJxshHvrjuiaEBKrUg/640?wx_fmt=gif)

所以为了支持细颗粒度的受控能力，我们提供了多个受控值，供外部受控模式。

```
// ProEditor 外部消费的 Demo 示意export default () => {  const [status, setStatus] = useState();  const { config, getState } = useState();  return  (    <ProEditor      // config 和 onConfigChange 是一对      config={config}      onConfigChange={({ config }) => {        setConfig(config);      }}      // interaction 和 onInteractionChange 是另一对受控      interaction={status}      onInteractionChange={(s) => {        setStatus(s);      }}      />  );}
```

但当我们一开始写好这个受控 api，得到结果是这样的：

![](https://mmbiz.qpic.cn/mmbiz_gif/M7OtEw9eDKHHIlCdf8ubMWwPDdHGdhvWG0vkSfFrhKzwDwsCbunfyONcUevvK1aqVjmPxdaxwlA3P2X4xxaK2Q/640?wx_fmt=gif)

对，你没看错，**死循环了**。遇到这个问题时让人头极度秃，因为原本以为是个很简单的功能，但是在 React 生命周期里的表现让人费解，尤其是使用 useEffect 做状态管理的时候。

```
// 导致死循环的写法const useTableStore = (state: Partial<Omit<ProTableConfigStore, 'columns' | 'data'>>) => {  const { defaultConfig, config: outsourceValue, mode } = props;  const { columns, isEmptyColumns, dispatchColumns } = useColumnStore(defaultConfig?.columns, mode);  // 受控模式 内部值与外部双向通信  useEffect(() => {    // 没有外部值和变更时不更改    if (!outsourceValue) return;    // 相等值的时候不做更新    if (isEqual(dataStore, outsourceValue)) return;    if (outsourceValue.columns) {      dispatchColumns({ type: 'setAll', columns: outsourceValue.columns });    }  }, [dataStore, outsourceValue]);  const dataStore = useMemo(() => {    const v = { ...store, data, columns } as ProTableConfigStore;    // dataStore 变更时需要对外变更一次    if (props.onChange && !isEqual(v, outsourceValue)) {      props.onChange?.({        config: v,        props: tableAsset.generateProps(v),        isEmptyColumns,      });    }    return v;  }, [data, store, columns, outsourceValue]);  // ...}
```

造成上述问题的原因大部分都是因为组件内 onChange 的时机设置。一旦代码里用 useEffect 的方式去监听变更触发 onChange，有很大的概率会造成死循环。

**❹ 未来还希望能支持撤销重做、快捷键等能力**

毕竟，现代的编辑器都是支持快捷键、历史记录、多人协同等增强型的功能的。这些能力怎么在编辑器的状态管理中以低成本、易维护的方式进行实施，也非常重要。

![](https://mmbiz.qpic.cn/mmbiz_jpg/M7OtEw9eDKHHIlCdf8ubMWwPDdHGdhvWc8mo87e7Ec7ib2xrKibWEsLA5yk0cibibvUFqe8HuqFib8597Hn85S91dMg/640?wx_fmt=jpeg)

总之，开发 ProEditor 的经历，一句话的血泪教训就是：

**复杂应用的状态管理真的不能裸写 hooks！**

**复杂应用的状态管理真的不能裸写 hooks！**

**复杂应用的状态管理真的不能裸写 hooks！**

那些鼓吹裸写 hooks 的人大概率是没遇到过复杂 case，性能优化、受控、action 互调、数据切片、状态调试等坑，每一项都不是好惹的主，够人喝上一壶。

![](https://mmbiz.qpic.cn/mmbiz_jpg/M7OtEw9eDKHHIlCdf8ubMWwPDdHGdhvWAJF9sk618xRaHKevTz2tmMLUiaSiaMe22mZCwh7RJkxtiaFnDvQywk9wg/640?wx_fmt=jpeg)

  为什么是 Zustand ？
================

其实，复杂应用只是开发者状态管理需求的集中体现。如果我们把状态管理当成一款产品来设计，我们不妨看看开发者在状态管理下的核心需求是什么。

我相信通过以下这一串分析，你会发现 zustand 是真真正正满足「几乎所有」状态管理需求的工具，并且在很多细节上做到了体验更优。

![](https://mmbiz.qpic.cn/mmbiz_jpg/M7OtEw9eDKHHIlCdf8ubMWwPDdHGdhvW3TVhBqlia1Gm6EurhibEYH2sxkl9KwqhKe35e2P1nqbQ5hlvnmXnQW3Q/640?wx_fmt=jpeg)

官网：https://zustand-demo.pmnd.rs/

### ❶ 状态共享

**状态管理最必要的一点就是状态共享**。这也是 context 出来以后，大部分文章说不需要 redux 的根本原因。因为 context 可以实现最最基础的状态共享。但这种方法（包括 redux 在内），都需要在最外层包一个 Provider。Context 中的值都在 Provider 的作用域下有效。

```
// Context 状态共享// store.tsexport const StoreContext = createStoreContext(() => { ... });// index.tsximport { appState, StoreContext } from './store';root.render(    <StoreContext.Provider value={appState}>      <App />    </StoreContext.Provider>);// icon.tsximport { StoreContext } from './store';const ReplaceGuide: FC = () => {  const { i18n, hideGuide, settings } = useContext(StoreContext);  // ...  return ...}
```

而 zustand 做到的第一点创新就是：**默认不需要 Provider**。直接声明一个 hooks 式的 useStore 后就可以在不同组件中进行调用。它们的状态会直接共享，简单而美好。

```
// Zustand 状态共享// store.tsimport create from 'zustand'export const useStore = create(set => ({  count: 1,  inc: () => set(state => ({ count: state.count + 1 })),}))// Control.tsximport { useStore } from './store';function Control() {  return <button onClick={()=>{    useStore.setState((s)=>({...s,count: s.count - 5 }))    }}>－5</button>}// AnotherControl.tsximport { useStore } from './store';function AnotherControl() {  const inc = useStore(state => state.inc)  return <button onClick={inc}> +1 </button>}// Counter.tsximport { useStore } from './store';function Counter() {  const { count } = useStore()  return <h1>{count}</h1>  }
```

由于没有 Provider 的存在，所以声明的 useStore 默认都是单实例，如果需要多实例的话，zustand 也提供了对应的 Provider 的书写方式，这种方式在组件库中比较常用。ProEditor 也是用的这种方式做到了多实例。

此外，zustand 的 store 状态既可以在 react 世界中消费，也可以在 react 世界外消费。

### ❷ 状态变更

状态管理除了状态共享外，另外第二个极其必要的能力就是状态变更。在复杂的场景下，我们往往需要自行组织相应的状态变更方法，不然不好维护。这也是考验一个状态管理库好不好用的一个必要指标。

hooks 的 `setState` 是原子级的变更状态，hold 不住复杂逻辑；而 `useReducer` 的 hooks 借鉴了 redux 的思想，提供了 dispatch 变更的方式，但和 redux 的 reducer 一样，这种方式没法处理异步，且没法互相调用，一旦遇上就容易捉襟见肘。

至于 redux ，哪怕是最新的 `redux-toolkit` 中优化大量 redux 的模板代码，针对同步异步方法的书写仍然让人心生畏惧。

```
// redux-toolkit 的用法import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'import { userAPI } from './userAPI'// 1. 创建异步函数const fetchUserById = createAsyncThunk(  'users/fetchByIdStatus',  async (userId, thunkAPI) => {    const response = await userAPI.fetchById(userId)    return response.data  })const usersSlice = createSlice({  name: 'users',  initialState: { entities: [], loading: 'idle' },  // 同步的 reducer 方法  reducers: {  },  // 异步的 AsyncThunk 方法  extraReducers: (builder) => {    // 2. 将异步函数添加到 Slice 中    builder.addCase(fetchUserById.fulfilled, (state, action) => {      state.entities.push(action.payload)    })  },})// 3. 调用异步方法dispatch(fetchUserById(123))
```

而在 zustand 中，函数可以直接写，完全不用区分同步或者异步，一下子把区分同步异步的心智负担降到了 0。

```
// zustand store 写法// store.tsimport create from 'zustand';const initialState = { // ...};export const useStore = create((set, get) => ({  ...initialState,  createNewDesignSystem: async () => {    const { params, toggleLoading } = get();    toggleLoading();    const res = await dispatch('/hitu/remote/create-new-ds', params);    toggleLoading();    if (!res) return;    set({ created: true, designId: res.id });  },  toggleLoading: () => {    set({ loading: !get().loading });  }}));// CreateForm.tsximport { useStore } from './store';const CreateForm: FC = () => {  const { createNewDesignSystem } = useStore();  // ...}
```

另外一个让人非常舒心的点在于，**zustand 会默认将所有的函数保持同一引用**。所以用 zustand 写的方法，默认都不会造成额外的重复渲染。（PS：这里再顺带吹一下 WebStorm 对于函数和变量的识别能力，非常好用）

![](https://mmbiz.qpic.cn/mmbiz_jpg/M7OtEw9eDKHHIlCdf8ubMWwPDdHGdhvWP2CPskmtMRPztMjQzaTHoKFOkhpIyDOuABJ5mfs5S6Oic5teqw6tu1A/640?wx_fmt=jpeg)

在下图可以看到，所有 zustand 的 useStore 出来的值或者方法，都是橙色的变量，具有稳定引用，不会造成不必要的重复渲染。

![](https://mmbiz.qpic.cn/mmbiz_jpg/M7OtEw9eDKHHIlCdf8ubMWwPDdHGdhvWVPTdf6jOXWbDInE9yQXKmP05wm8ef9ogruUPq3nCpJYWfzOkm1VNlA/640?wx_fmt=jpeg)

而状态变更函数的最后一个很重要，但往往又会被忽略的一点，就是**方法需要调用当前快照下的值或方法**。

在常规的开发心智中，我们往往会在异步方法中直接调用当前快照的值来发起请求，或使用同步方法进行状态变更，这会有极好的状态内聚性。

比如说，我们有一个方法叫「废弃草稿」，需要获取当前的一个 id ，向服务器发起请求做数据变更，同时为了保证当前界面的数据显示有效性，变更完毕后，我们需要重新获取数据。

我们来看看 hooks 版本和 zustand 的写法对比，如下所示：

```
// hooks 版本export const useStore = () => {  const [designId, setDesignId] = useState();  const [loading, setLoading] = useState(false);  const refetch = useCallback(() => {    if (designId) {      mutateKitchenSWR('/hitu/remote/ds/versions', designId);    }  }, [designId]);  const deprecateDraft = useCallback(async () => {    setLoading(true);    const res = await dispatch('/hitu/remote/ds/deprecate-draft', designId);    setLoading(false);    if (res) {      message.success('草稿删除成功');    }    // 重新获取一遍数据    refetch();  }, [designId, refetch]);  return {    designId,    setDesignId,    loading,    deprecateDraft,    refetch,  }};
```

```
// zustand 写法const initialState = { designId: undefined, loading: false };export const useStore = create((set, get) => ({  ...initialState,  deprecateDraft: async () => {    set({ loading: true });    const res = await dispatch('/hitu/remote/ds/deprecate-draft', get().designId);    set({ loading: false });    if (res) {      message.success('草稿删除成功');    }    // 重新获取一遍数据    get().refetch();  },  refetch: () => {    if (get().designId) {      mutateKitchenSWR('/hitu/remote/ds/versions', get().designId);    }  },})
```

可以明显看到，光是从代码量上 zustand 的 store 比 hooks 减少了 30% 。不过另外容易被大家忽略，但其实更重要的是， **hooks 版本中互调带来了引用变更的问题**。

由于 `deprecateDraft` 和 `refetch` 都调用了 `designId`，这就会使得当 `designId` 发生变更时，`deprecateDraft` 和 `refetch` 的引用会发生变更，致使 react 触发刷新。而这在有性能优化需求的场景下非常阴间，会让不该渲染的组件重新渲染。那这也是为什么 react 要搞一个 `useEvent` 的原因（RFC）。

而 zustand 则把这个问题解掉了。由于 zustand 在 create 方法中提供了 `get` 对象，使得我们可以用 get 方法直接拿到当前 store 中最新的 state 快照。这样一来，变更函数的引用始终不变，而函数本身却一直可以拿到最新的值。

在这一趴，最后一点要夸 zustand 的是，它可以直接集成 useReducer 的模式，而且直接在官网提供了示例。这样就意味着之前在 ProEditor 中的那么多 action 可以极低成本完成迁移。

```
// columns 的 reducer 迁移import { columnsConfigReducer } from './columns';const createStore = create((set,get)=>({  /**   * 控制 Columns 的复杂数据变更方法   */  dispatchColumns: (payload) => {    const { columns, internalUpdateTableConfig, updateDataByColumns } = get();    // 旧的 useReducer 直接复用过来    const nextColumns = columnsConfigReducer(columns, payload);    internalUpdateTableConfig({ columns: nextColumns }, 'Columns 配置');    updateDataByColumns(nextColumns);  },})
```

### ❸ 状态派生

状态派生是状态管理中一个不被那么多人提起，但是在实际场景中被大量使用的东西，只是大家没有意识到，这理应也是状态管理的一环。

状态派生可以很简单，也可以非常复杂。简单的例子，比如基于一个`name` 字段，拼接出对应的 url 。

![](https://mmbiz.qpic.cn/mmbiz_jpg/M7OtEw9eDKHHIlCdf8ubMWwPDdHGdhvWaIQsibib6Re4aJ19mJISJTSsBGKcjwMDiakIIKfYKXF91XpsOdem4IFYw/640?wx_fmt=jpeg)

复杂的例子，比如基于 rgb 、hsl 值和色彩模式，得到一个包含色彩空间的对象。

![](https://mmbiz.qpic.cn/mmbiz_jpg/M7OtEw9eDKHHIlCdf8ubMWwPDdHGdhvWRvxjIE9LL8vsjGTxlojD3eIiba2ibfqfUG7gjDKVbosJrfaGfDdtPic1Q/640?wx_fmt=jpeg)

如果不考虑优化，其实都可以写一个中间的函数作为派生方法，但作为状态管理的一环，我们必须要考虑相应的优化。

在 hooks 场景下，状态派生的方法可以使用 `useMemo`，例如：

```
// hooks 写法const App = () => {  const [name,setName]=useState('')  const url = useMemo(() => URL_HITU_DS_BASE(name || ''),[name])  // ...}
```

而 zustand 用了类似 redux selector 的方法，实现相应的状态派生，这个方式使得 useStore 的用法变得极其灵活和实用。而这种 selector 的方式使得 zustand 下细颗粒度的性能优化变为可能，且优化成本很低。

```
// zustand 的 selector 用法// 写法1const App = () => {  const url = useStore( s => URL_HITU_DS_BASE(s.name || ''));  // ...}// 写法2 将 selector 单独抽为函数export const dsUrlSelector = (s) => URL_HITU_DS_BASE(s.name || '');const App = () => {  const url = useStore(dsUrlSelector);  // ...}
```

由于写法 2 可以将 selector 抽为独立函数，那么我们就可以将其拆分到独立文件来管理派生状态。由于这些 selector 都是纯函数，所以能轻松实现测试覆盖。

![](https://mmbiz.qpic.cn/mmbiz_jpg/M7OtEw9eDKHHIlCdf8ubMWwPDdHGdhvWBQdjdMKKT7fhFsLa3XIyLCME5Eiam1j6lmyg1cJmsibEPj8dEUDGfRaw/640?wx_fmt=jpeg)

### ❹ 性能优化

讲完状态派生后把 zustand 的 selector 能力后，直接很顺地就能来讲讲 zustand 的性能优化了。

在裸 hooks 的状态管理下，要做性能优化得专门起一个专项来分析与实施。但基于 zustand 的 useStore 和 selector 用法，我们可以实现低成本、渐进式的性能优化。

比如 ProEditor 中一个叫 `TableConfig` 的面板组件，对应的左下图中圈起来的部分。而右下图则是相应的代码，可以看到这个组件从 `useStore` 中 解构了 `tabKey` 和 `internalSetState` 的方法。

![](https://mmbiz.qpic.cn/mmbiz_jpg/M7OtEw9eDKHHIlCdf8ubMWwPDdHGdhvWSWFI3fica0u8AjSDvj9Y4Nr3XcXUUASziaLOd2nfbIERuCvoiclTXy2RQ/640?wx_fmt=jpeg)

然后我们用 `useWhyDidYouUpdate` 来检查下，如果直接用解构引入，会造成什么样的情况：

![](https://mmbiz.qpic.cn/mmbiz_gif/M7OtEw9eDKHHIlCdf8ubMWwPDdHGdhvWvdaXcv74WrEHCjsm1DqwcdpYC6sNldoLtpBNDIacGmLXDU8zuhUP8w/640?wx_fmt=gif)

在上图中可以看到，虽然 `tabs`、`internalSetState` 没有变化，但是其中的 config 数据项（data、columns 等）发生了变化，进而使得 `TableConfig` 组件触发重渲染。

而我们的性能优化方法也很简单，只要利用 zustand 的 selector，将得到的对象聚焦到我们需要的对象，只监听这几个对象的变化即可。

```
// 性能优化方法import shallow from 'zustand/shallow'; // zustand 提供的内置浅比较方法import { useStore, ProTableStore } from './store'const selector = (s: ProTableStore) => ({  tabKey: s.tabKey,  internalSetState: s.internalSetState,});const TableConfig: FC = () => {  const { tabKey, internalSetState } = useStore(selector, shallow);}
```

这样一来，TableConfig 的性能优化就做好了~

![](https://mmbiz.qpic.cn/mmbiz_gif/M7OtEw9eDKHHIlCdf8ubMWwPDdHGdhvWzrnFVfyu1YZenBKtIAOsuWTvHnUN5ibOxZPTJC2gBR9ias1Jjib9wz7dg/640?wx_fmt=gif)

基于这种模式，性能优化就会变成极其简单无脑的操作，而且对于前期的功能实现的侵入性极小，代码的后续可维护性极高。

![](https://mmbiz.qpic.cn/mmbiz_jpg/M7OtEw9eDKHHIlCdf8ubMWwPDdHGdhvWRI29uUIwicvHr20Z5P3iaZIJ9QGonHcNdoB7VWOmTgIXGj0nLD3pKdbQ/640?wx_fmt=jpeg)

剩下的时间就可以和小伙伴去吹咱优雅的性能优化技巧了~（￣︶￣）↗

![](https://mmbiz.qpic.cn/mmbiz_jpg/M7OtEw9eDKHHIlCdf8ubMWwPDdHGdhvW8L8xDqZX6D3qIXZFKUw5oQqHFZ4ejRQjYeqC3R8U7xo3T6FpKSNeEg/640?wx_fmt=jpeg)

就我个人的感受上， zustand 使用 selector 来作为性能优化的思路真的很精巧，就像是给函数式的数据流加上了一点点主观意愿上的响应式能力，堪称优雅。

![](https://mmbiz.qpic.cn/mmbiz_jpg/M7OtEw9eDKHHIlCdf8ubMWwPDdHGdhvWFq04Mhb8Mo0V3miaSnzO14r7b4xpUJVM9FocoBlSCAckiaz7UfU1V7Tg/640?wx_fmt=jpeg)

### ❺ 数据分形与状态组合

如果子组件能够以同样的结构，作为一个应用使用，这样的结构就是分形架构。

数据分形在状态管理里我觉得是个比较高级的概念。但从应用上来说很简单，就是更容易拆分并组织代码，而且具有更加灵活的使用方式，如下所示是拆分代码的方式。但这种方式其实我还没大使用，所以不多展开了。

```
// 来自官方文档的示例// https://github.com/pmndrs/zustand/blob/main/docs/typescript.md#slices-patternimport create, { StateCreator } from 'zustand'interface BearSlice {  bears: number  addBear: () => void  eatFish: () => void}const createBearSlice: StateCreator<  BearSlice & FishSlice,  [],  [],  BearSlice> = (set) => ({  bears: 0,  addBear: () => set((state) => ({ bears: state.bears + 1 })),  eatFish: () => set((state) => ({ fishes: state.fishes - 1 })),})interface FishSlice {  fishes: number  addFish: () => void}const createFishSlice: StateCreator<  BearSlice & FishSlice,  [],  [],  FishSlice> = (set) => ({  fishes: 0,  addFish: () => set((state) => ({ fishes: state.fishes + 1 })),})const useBoundStore = create<BearSlice & FishSlice>()((...a) => ({  ...createBearSlice(...a),  ...createFishSlice(...a),}))
```

**我用的更多的是基于这种分形架构下的各种中间件**。由于这种分形架构，状态就具有了很灵活的组合性，例如将当前状态直接缓存到 localStorage。在 zustand 的架构下， 不用额外改造，直接加个 `persist` 中间件就好。

```
// 使用自带的 Persist Middlewareimport create from 'zustand'import {  persist } from 'zustand/middleware'interface BearState {  bears: number  increase: (by: number) => void}const useBearStore = create<BearState>(  persist((set) => ({    bears: 0,    increase: (by) => set((state) => ({ bears: state.bears + by })),  })))
```

在 ProEditor 中，我使用最多的就是 `devtools` 这个中间件。这个中间件具有的功能就是：将这个 Store 和 Redux Devtools 绑定。

```
// devtools 中间件// store 逻辑const vanillaStore = (set,get)=> ({   syncOutSource: (nextState) => {    set({ ...get(), ...nextState }, false, `受控更新：${Object.keys(nextState).join(' ')}`);  },  syncOutSourceConfig: ({ config }) => {    // ...    set({ ...get(), ...config }, false, `受控更新：🛠 组件配置`);    // ...  },}); const createStore = create(  devtools(vanillaStore, { name: 'ProTableStore' }));
```

然后我们就可以在 redux-devtools 中愉快地查看数据变更了：

![](https://mmbiz.qpic.cn/mmbiz_gif/M7OtEw9eDKHHIlCdf8ubMWwPDdHGdhvWTQktglWxlicvianvKSf060d0Hia94thhicSLF37u14gDuicLBEUEibYc7ZzQ/640?wx_fmt=gif)

可能有小伙伴会注意到，为什么我这边的状态变更还有中文名，那是因为 `devtools` 中间件为 zustand 的 set 方法，提供了一个额外参数。只要设置好相应的 set 值的最后一个变量，就可以直接在 devtools 中看到相应的变更事件名称。

正是这样强大的分形能力，我们基于社区里做的一个 zundo 中间件，在 ProEditor 中提供了一个简易的撤销重做 的 Demo 示例。

![](https://mmbiz.qpic.cn/mmbiz_jpg/M7OtEw9eDKHHIlCdf8ubMWwPDdHGdhvWI7tZW6icH33QlBcfyJUejwWWkfNkm07vXWF5Eib4VYLLwAtM3uictKGUg/640?wx_fmt=jpeg)

而实现核心功能的代码就只有一行~ 😆

![](https://mmbiz.qpic.cn/mmbiz_jpg/M7OtEw9eDKHHIlCdf8ubMWwPDdHGdhvWohVgnOcmakPoqrqrBsacW6Gkviayb9FKu6X4JdmHlJFcs5ZSdCibXqZA/640?wx_fmt=jpeg)

PS：至于一开始提到的协同能力，我在社区中也有发现中间件 zustand-middleware-yjs （不过还没尝试）。

### ❻ 多环境集成（ react 内外环境联动 ）

实际的复杂应用中，一定会存在某些不在 react 环境内的状态数据，以图表、画布、3D 场景最多。一旦要涉及到多环境下的状态管理，可以让人掉无数头发。

而 zustand 说了，不慌，我已经考虑到了，`useStore` 上直接可以拿值，是不是很贴心~

```
// 官方示例// 1. 创建Storeconst useDogStore = create(() => ({ paw: true, snout: true, fur: true }))// 2. react 环境外直接拿值const paw = useDogStore.getState().paw// 3. 提供外部事件订阅const unsub1 = useDogStore.subscribe(console.log)// 4. react 世界外更新值useDogStore.setState({ paw: false })const Component = () => {  // 5. 在 react 环境内使用  const paw = useDogStore((state) => state.paw)  ...
```

虽然这个场景我还没遇到，但是一想到 zustand 在这种场景下也能支持，真的是让人十分心安。

![](https://mmbiz.qpic.cn/mmbiz_jpg/M7OtEw9eDKHHIlCdf8ubMWwPDdHGdhvWiakcicCnBBhQWWzacTy8RoFrpCBDibuBIzIgUYicVmmIpxibI9KQ7yPJcGA/640?wx_fmt=jpeg)

其实还有其他不太值得单独提的点，比如 zustand 在测试上也相对比较容易做，直接用 test-library/react-hooks 即可。类型定义方面做的非常齐全…… 但到现在洋洋洒洒已经写了 6k 多字了，就不再展开了。

  总结：zustand 是当下复杂状态管理的最佳选择
===========================

大概从去年 12 月份开始，我就一直在提炼符合我理想的状态管理库的需求，到看到 zustand 让我眼前一亮。而通过在 `pro-editor` 中大半年的实践验证，我很笃定地认为，**zustand 就是我当下状态管理的最佳选择，甚至是大部分复杂应用的状态管理的最佳选择**。

本来最后还想讲讲，我是怎么样基于 Zustand 来做渐进式的状态管理的（从小应用到复杂应用的渐进式生长方案）。然后还想拿 ProEditor 为例讲讲 ProEditor 具体的状态管理是如何逐步生长的，包括如何组织的受控模式、如何集成 RxJS 处理复杂交互等等，算是几个比较有意思的点。不过限于篇幅原因，这些内容估计就得留到下次了。

有点意思，那就点个关注呗 💁🏼‍♀️

👇🏾 点击「阅读原文」，在评论区与我们互动