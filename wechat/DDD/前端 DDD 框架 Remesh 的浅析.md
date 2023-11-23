> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/ovxw0NoN3NRIraWym3Ik6g)

👆  这是第 173 篇不掺水的原创，想要了解更多，请戳下方卡片关注我们吧～

> 前端 DDD 框架 Remesh 的浅析
> 
> http://zoo.zhengcaiyun.cn/blog/article/domaindrivendesign

![](https://mmbiz.qpic.cn/mmbiz_png/sticlevzdTIAwgOxKWZgOibYpcYWCG9FGRMlt1UBzibZX98CQ3HZO8SnNzibr18xUiaGmaib3m1aWhSkmy814DiafVxnQ/640?wx_fmt=png)

  

1. 什么是 DDD

DDD（Domain-Driven Design）：领域驱动设计。首先需要了解，所谓的「领域」，其实不仅仅在于程序表现形式，更适合说是对特定业务的描述，通常由该业务的垂直协作方共同确定，比如产品需求、系统架构、程序代码，由一群 “专业的” 人承接，这意味着其中的每一个人，可能都是该「领域」内的专家，而「领域模型」成了他们之间的「通用语言」，或者说，「领域知识」让彼此能够坐在一起讨论问题，再换句话说，产品也可以使用此通用语言来“组织代码”。这也是 DDD 的战略意义。

![](https://mmbiz.qpic.cn/mmbiz_png/sticlevzdTIAwgOxKWZgOibYpcYWCG9FGRoSCbAUAHtEIodsENcClkQtbibSia75G5A4ZsYgBiba0U8T2UUHoPR0ibnA/640?wx_fmt=png)

### MVC 与 DDD

这里有必要谈及一下后端传统的 MVC 架构，通常会采用一种「贫血模型」，即将「行为」和「状态」拆分至不同的对象中，也就是我们常说的 POJO 和 Service，这样做的好处是，在开发业务代码时，心智负担较小，对于简单业务效率很高。往往开发人员会形成一种惯性思维，接到需求时，先三下五除二，把实体和服务先定义好。可是我们仔细想想，这种方式其实违背了面向对象的本质，将一个对象的状态和行为强行拆分，变成了面向过程开发，Service 中的逻辑随着业务复杂度提升，变得失控。当业务复杂度膨胀至一定程度，甚至会产生牵一发而动全身的风险。

而 DDD 带来的「充血模型」，完全规避了这个问题，POJO 和 Service 变成 Domain，可以理解为高内聚（对于 Domian 的设计不是本文导论的重点），Domain 的 State 仅由其 Action 完成，禁止任何外部的直接修改，将业务风险收敛至领域内部，一切将变得井然有序。

### DDD 优势

*   业务层面：基于领域知识的通用语言，快速交付，极低的协作成本
    
*   架构层面：利于结构布局，利于资源聚焦
    
*   代码层面：复杂度治理
    

### DDD 弊端

主要在于战术层面

*   心智负担大，对现有业务拆解成本大，对团队要求较高
    
*   缺少战术意义上的最佳实践，从头造轮子难度较大
    
*   简单业务下，效率很低（缺少开箱即用的框架）
    

### 对前端的思考

DDD 近几年在后端的落地颇有成效，社区也产出了较多的相关文章，如微软的《Tackle Business Complexity in a Microservice with DDD and CQRS Patterns》(https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/) 。DDD 带来的战略意义，前端往往也能深受启发。DDD 概念早在 2003 年就已提出，也是近几年随着技术和架构的演进重新回到人们视野，并且发光发热。那么，我该什么时候使用 DDD 呢？

*   存在复杂的业务及领域概念（如：商品、订单、履约等），代码复杂度与业务复杂度成正比，好的领域模型可以极大地降低代码复杂度，避免牵一发而动全身。
    
*   想复用业务逻辑（如：多端实现），将逻辑抽离至领域层，可以帮助业务快速实现。
    

2. DDD 示例
---------

通常一个商品有以下几种场景：创建、编辑、上架、审核、撤回，其对应的状态有，草稿、审核中、已上架，如果我们用传统的逻辑去写，往往是以下代码：

```
class Goods {  private isDraft: boolean; // 是否草稿  private isAuditing: boolean; // 是否审核状态  private isPublished: boolean; // 是否已上架  private info: any; // 商品信息  // 状态初始化  constructor(info: any) {    this.isDraft = true;    this.isAuditing = false;    this.isPublished = false;    this.info = info;  }  // 编辑操作  edit(info: any) {    if (!this.isDraft) {      throw new Error('仅草稿状态下可编辑');    }    this.info = info;  }  // 上架操作  publish() {    if (!this.isDraft) {      throw new Error('仅草稿状态下可上架');    }    this.isAuditing = true;    this.isDraft = false;  }  // 审核操作  audit(result: boolean) {    if (!this.isAuditing) {      throw new Error('仅在途状态下可审核');    }    if (!result) {      this.isDraft = true;    }    this.isPublished = result;    this.isAuditing = false;  }  // 撤回操作  revert() {    this.isAuditing = false;    this.isDraft = true;  }}
```

这种写法只能说，无功无过，现实场景中，一个商品的状态可能非常复杂，那这个类的逻辑代码也将会变得十分庞大且复杂，那我们该如何使用 DDD 来对其进行逻辑抽离呢？且看以下写法：

```
// 草稿商品class DraftGoods {  private info: any;  constructor(info: any) {    this.info = info;  }  // 可以编辑  edit(info: any) {    this.info = info;  }  // 可以上架  publish() {    return new AuditingGoods(this.info);  }}
```

```
// 审核中商品class AuditingGoods {  private info: any;  constructor(info: any) {    this.info = info;  }  // 审核成功或失败  audit(result: boolean) {    if (result) {      return new PublishedGoods(this.info);    } else {      return new DraftGoods(this.info);    }  }  // 可以撤回  revert() {    return new DraftGoods(this.info);  }}
```

```
// 已上架的商品class PublishedGoods {  private info: any;  constructor(info: any) {    this.info = info;  }  // 获取商品信息  getInfo() {    return this.info;  }}
```

经过上述转化，我们将「有多个状态的实体」，变成「多个有状态的实体」，这样做的好处是，我们仅需要关心不同状态下，实体的业务逻辑操作，将代码聚焦于业务实现，真正做到了领域知识的表达，便于横向扩展。 前文说到，DDD 的战略价值目前是大于战术价值的，根本原因是目前社区缺少成熟的框架或轮子，开发者若能只专注领域模型的构建，其他的交给框架来处理，才能充分发挥 DDD 的战术优势。Remesh 便是前端 DDD 实践的产物，且看改造示例：

```
// 草稿商品type DraftGoods = {  type: 'DraftGoods';  content: any;};// 审核中商品type AuditingGoods = {  type: 'AuditingGoods';  content: any;};// 已发布商品type PublishedGoods = {  type: 'PublishedGoods';  content: any;};// 商品领域模型export const GoodsDomain = Remesh.domain({  name: 'GoodsDomain',  impl: (domain) => {    // 商品状态，初始化草稿状态    const GoodsState = domain.state({      name: 'GoodsDomain',      default: {        type: 'DraftGoods',        content: null      }    });    // 商品查询    const GoodsQuery = domain.query({      name: 'GoodsQuery',      impl: ({ get }) => {        // 返回商品信息        return get(GoodsState());      }    });    // 编辑命令    const EditCommand = domain.command({      name: 'EditCommand',      impl: ({}, info: DraftGoods) => {        // 返回更新后的商品        return GoodsState().new(info);      }    });    // 上架命令    const PublishCommand = domain.command({      name: 'PublishCommand',      impl: ({ get }) => {        const info = get(GoodsState());        // 上架后，返回审核中的商品        return GoodsState().new({          ...info,          type: 'AuditingGoods'        }) as AuditingGoods;      }    });    // 审核命令    const AuditCommand = domain.command({      name: 'AuditCommand',      impl: ({ get }, result: boolean) => {        const info = get(GoodsState());        if (result) {          // 审核成功，返回已发布的商品          return GoodsState().new({            ...info,            type: 'PublishedGoods'          }) as PublishedGoods;        } else {          // 审核失败，返回草稿的商品          return GoodsState().new({            ...info,            type: 'DraftGoods'          }) as DraftGoods;        }      }    });    // 撤回命令    const RevertCommand = domain.command({      name: 'RevertCommand',      impl: ({ get }) => {        const info = get(GoodsState());        // 撤回后，返回草稿的商品        return GoodsState().new({          ...info,          type: 'DraftGoods'        }) as DraftGoods;      }    });    return {      query: {        GoodsQuery      },      command: {        EditCommand,        PublishCommand,        AuditCommand,        RevertCommand      }    };  }});
```

3. Remesh
---------

基于 CQRS 模式的 DDD 在前端的落地框架，仅关心业务逻辑，若是想在前端尝试领域划分，Remesh 不失为一种选择。

### CQRS

CQRS（Command Query Responsibility Segregation）：命令查询职责分离，也就是读写分离。命令是指会对实体数据发生变化的操作，如新增、删除、修改；查询即字面理解，不会对实体数据造成改变。

通常而言，采用 CQRS 模式带来的性能收益是巨大的，而收益也往往带来挑战，比如要保证数据同步高可用，读写模型设计的双倍工作量等。CQRS 是对 DDD 的一种补充，并且有几种子模式来实现：单服务 / 多服务、共享模型 / 不同模型、共享数据源 / 不同数据源，根据使用场景决定。

### 核心概念

Domain（领域），可以简单理解为关于业务逻辑的 Component

*   State：Domain 的状态
    
*   Query：查询 States
    
*   Command：更新 States
    
*   Event：Domian 中可能发生的事件
    
*   Effect：副作用，用于发送 Query 或 Command 乍一看这结构，你会不会觉得与 Redux 等框架有点像？待我们查看其源码来做判断。
    

### 源码实现分析

我们以官网提供的 React 示例来看 Define your domain（https://github.com/remesh-js/remesh#define-your-domain）

```
npm install --save remesh rxjs
```

可以明确了解到，remesh 采用 RxJS 进行事件分发与数据流转，这也意味着，remesh 的本质在于对数据操作的高度抽象，利用 RxJS 的能力达到数据更新的效果。 我们来看 Remesh.domian 的定义：

*   `Remesh.domain => RemeshDomain`
    
*   `RemeshDomain => RemeshDomainAction`
    

```
let domainUid = 0export const RemeshDomain = <T extends RemeshDomainDefinition, U extends Args<Serializable>>(  options: RemeshDomainOptions<T, U>,): RemeshDomain<T, U> => {  // 优化策略：缓存无参数时的 RemeshDomainAction 实例  let cacheForNullary: RemeshDomainAction<T, U> | null = null  const Domain: RemeshDomain<T, U> = ((arg: U[0]) => {    if (arg === undefined && cacheForNullary) {      return cacheForNullary    }    const result: RemeshDomainAction<T, U> = {      type: 'RemeshDomainAction',      Domain,      arg,    }    if (arg === undefined) {      cacheForNullary = result    }    return result  }) as unknown as RemeshDomain<T, U>  // 定义 RemeshDomain 相关信息，可选参数 name, impl 等  Domain.type = 'RemeshDomain'  Domain.domainId = domainUid++  Domain.domainName = options.name // 领域名称  Domain.impl = options.impl as (context: RemeshDomainContext, arg: U[0]) => T // 具体业务实现  Domain.inspectable = options.inspectable ?? true  return Domain}
```

接着是在前端框架中通过 hook 的方式引入 `useRemeshDomain(CountDomain())`

```
export const useRemeshDomain = function <T extends RemeshDomainDefinition, U extends Args<Serializable>>(  domainAction: RemeshDomainAction<T, U>,) {  // 获取注入的 store  const store = useRemeshStore()  // 若 domainAction 不在暂存的集合中，会调用 createDomainStorage 进行创建，且看下文  const domain = store.getDomain(domainAction)  // React  useEffect(() => {    // 当 domain 被激活后，事件订阅开始生效，会通过 RxJS 进行事件分发    store.igniteDomain(domainAction)  }, [store, domainAction])  // Vue  onMounted(() => {    store.igniteDomain(domainAction)  })  return domain}
```

为了更好的解释，上述代码在 Remesh 的源码基础上稍加改动，可以看出，其主要针对不同框架的实现做了适配

```
// remesh-react.tsxexport const useRemeshReactContext = () => {  const context = useContext(RemeshReactContext)  if (context === null) {    throw new Error(`You may forget to add <RemeshRoot />`)  }  return context}export const useRemeshStore = (): RemeshStore => {  const context = useRemeshReactContext()  return context.remeshStore}// remesh-vue.tsexport const useRemeshStore = () => {  const store = inject(RemeshVueInjectKey)  if (!store) {    throw new Error('RemeshVue plugin not installed')  }  return store}
```

可以清晰的看到，React 采用了 Context 的方式注入 store，而 Vue 采用 Provide Inject 的方式注入 store，现在我们对 React 实现进行分析，来看以下 `<RemeshRoot>` 的实现

```
export const RemeshRoot = (props: RemeshRootProps) => {  // 可自定义 store  const storeRef = useRef<RemeshStore | undefined>(props.store)  if (!storeRef.current) {    // 通常情况下会创建一个无 options 的 store    storeRef.current = RemeshStore('options' in props ? props.options : {})  }  const store = storeRef.current  const contextValue: RemeshReactContext = useMemo(() => {    return {      remeshStore: store,    }  }, [store])  return <RemeshReactContext.Provider value={contextValue}>{props.children}</RemeshReactContext.Provider>}
```

可以看一下 `RemeshStore`  的结构，俨然是一个 store 管理工具，实时也确实如此，remesh 后续的状态查询以及更新都是基于 store 库执行。

```
export const RemeshStore = (options?: RemeshStoreOptions) => {  // ...  return {    name: options.name,    getDomain, // 接上文，在 useRemeshDomain 中会调用此方法    igniteDomain,    query: getCurrentQueryValue,    send,    // ...  }}
```

调用 `getDomain` 时会优先判断 `domainAction` 是否存在于缓存中，若不存在则创建，关键的来了，我们定义在 Domian 中的 `impl` 方法，此时会被调用。

```
const createDomainStorage = <T extends RemeshDomainDefinition, U extends Args<Serializable>>(    domainAction: RemeshDomainAction<T, U>,  ): RemeshDomainStorage<T, U> => {    // ...    // domain 上下文对象，标准化创建过程，也是可以链式操作的原因（代码已简化）    const domainContext: RemeshDomainContext = {      state: (options) => {        return RemeshState(options)      },      query: (options) => {        return RemeshQuery(options)      },      event: (options: Omit<RemeshEventOptions<any, any>, 'impl'> | RemeshEventOptions<any, any>) => {        return RemeshEvent(options)      },      command: (options) => {        return RemeshCommand(options)      },      effect: (effect) => {        if (!currentDomainStorage.ignited) {          currentDomainStorage.effectList.push(effect)        }      },      // ...    }       // domain 中 query, command, event 的具体实现    const domain = toValidRemeshDomainDefinition(domainAction.Domain.impl(domainContext, domainAction.arg))    // domain 的存贮对象    const currentDomainStorage: RemeshDomainStorage<T, U> = {      id: uid++,      type: 'RemeshDomainStorage',      Domain: domainAction.Domain,      get domain() {        return domain      },      arg: domainAction.arg,      domainContext,      domainAction,      effectList: [],      ignited: false,    }    // ...    return currentDomainStorage  }
```

关于 store 中 send、query 实现的基本状态更新以及事件机制，由于篇幅有限，不再展开描述，相信以上内容已经达到抛砖引玉的效果。

4. 总结
-----

Remesh 采用了一种独特的方式，使 DDD 能够在前端得以应用，为了达到这一效果，开发者可能会需要适应不同的代码风格，需要熟悉领域模型的设计。

由于项目处于起步阶段，目前仍在迭代中，不建议在生产环境使用，或者说 DDD 在前端的战术设计仍未有最佳实践，但 Remesh 带来的意义是非凡的，实现方式可能多样，解决的问题永远只会是同一个，我们始终在代码优化的路上艰难前行，DDD 将来未必是一条歧路。

参考链接
----

用 DDD(领域驱动设计) 和 ADT(代数数据类型) 提升代码质量 (https://zhuanlan.zhihu.com/p/475789952)

remesh(https://github.com/remesh-js/remesh)

从 MVC 到 DDD 的架构演进 (https://zhuanlan.zhihu.com/p/456915280)

看完两件事
-----

如果你觉得这篇内容对你挺有启发，我想邀请你帮我两件小事

1. 点个「**在看**」，让更多人也能看到这篇内容（点了「**在看**」，bug -1 😊）

2. 关注公众号「**政采云前端**」，持续为你推送精选好文

招贤纳士
----

政采云前端团队（ZooTeam），一个年轻富有激情和创造力的前端团队，隶属于政采云研发部，Base 在风景如画的杭州。团队现有 80 余个前端小伙伴，平均年龄 27 岁，近 3 成是全栈工程师，妥妥的青年风暴团。成员构成既有来自于阿里、网易的 “老” 兵，也有浙大、中科大、杭电等校的应届新人。团队在日常的业务对接之外，还在物料体系、工程平台、搭建平台、性能体验、云端应用、数据分析及可视化等方向进行技术探索和实战，推动并落地了一系列的内部技术产品，持续探索前端技术体系的新边界。

如果你想改变一直被事折腾，希望开始能折腾事；如果你想改变一直被告诫需要多些想法，却无从破局；如果你想改变你有能力去做成那个结果，却不需要你；如果你想改变你想做成的事需要一个团队去支撑，但没你带人的位置；如果你想改变既定的节奏，将会是 “5 年工作时间 3 年工作经验”；如果你想改变本来悟性不错，但总是有那一层窗户纸的模糊… 如果你相信相信的力量，相信平凡人能成就非凡事，相信能遇到更好的自己。如果你希望参与到随着业务腾飞的过程，亲手推动一个有着深入的业务理解、完善的技术体系、技术创造价值、影响力外溢的前端团队的成长历程，我觉得我们该聊聊。任何时间，等着你写点什么，发给 `ZooTeam@cai-inc.com`

![](https://mmbiz.qpic.cn/mmbiz_jpg/vzEib9IRhZD7b2jpsibTsaZxWjfhyfqIpeMmOsdx6heH7KYxYXS1c6eQ30TrnyLyRa0SSs74NUM7BNTK8cu5XoibQ/640?wx_fmt=jpeg)