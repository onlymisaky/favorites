> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/8LxNZ0Hrne_EMZ352jmIXQ)

大家好，我是 CUGGZ。

在面向对象编程（OOP）中，SOLID 原则是设计模式的基础，它的每个字母代表一种设计原则：

*   单一职责原则（SRP）
    
*   开放封闭原则（OCP）
    
*   里氏替换原则（LSP）
    
*   接口隔离原则（ISP）
    
*   依赖倒置原则（DIP）
    

下面就来看看每个原则的含义以及如何在 React 中应用 SOLID 原则！

1. 单一职责原则（SRP）
--------------

单一职责原则的定义是**每个类应该只有一个职责，** 也就是只做一件事。这个原则是最容易解释的，因为我们可以简单地将其理解为 “每个**功能 / 模块 / 组件**都应该只做一件事”。

在所有这些原则中，单一职责原则是最容易遵循的，也是最有影响力的一项，因为它极大提高了代码的质量。为了确保组件只做一件事，可以这样：

*   将功能较多的大型组件拆分为较小的组件；
    
*   将与组件功能无关的代码提取到单独的函数中；
    
*   将有联系的功能提取到自定义 Hooks 中。
    

下面来看一个显示活跃用户列表的组件：

```
const ActiveUsersList = () => {  const [users, setUsers] = useState([])    useEffect(() => {    const loadUsers = async () => {        const response = await fetch('/some-api')      const data = await response.json()      setUsers(data)    }        loadUsers()  }, [])    const weekAgo = new Date();  weekAgo.setDate(weekAgo.getDate() - 7);    return (    <ul>      {users.filter(user => !user.isBanned && user.lastActivityAt >= weekAgo).map(user =>          <li key={user.id}>           <img src={user.avatarUrl} />           <p>{user.fullName}</p>           <small>{user.role}</small>         </li>      )}    </ul>      )}
```

这个组件虽然代码不多，但是做了很多事情：获取数据、过滤数据、渲染数据。来看看如何分解它。

首先，只要同时使用了 `useState` 和 `useEffect`，就可以将它们提取到自定义 Hook 中：

```
const useUsers = () => {  const [users, setUsers] = useState([])    useEffect(() => {    const loadUsers = async () => {        const response = await fetch('/some-api')      const data = await response.json()      setUsers(data)    }    loadUsers()  }, [])    return { users }}const ActiveUsersList = () => {  const { users } = useUsers()    const weekAgo = new Date()  weekAgo.setDate(weekAgo.getDate() - 7)  return (    <ul>      {users.filter(user => !user.isBanned && user.lastActivityAt >= weekAgo).map(user =>         <li key={user.id}>          <img src={user.avatarUrl} />          <p>{user.fullName}</p>          <small>{user.role}</small>        </li>      )}    </ul>      )}
```

现在，`useUsers` Hook 只关心一件事——从 API 获取用户。它使我们的组件代码更具可读性。

接下来看一下组件渲染的 JSX。每当我们对对象数组进行遍历时，都应该注意它为每个数组项生成的 JSX 的复杂性。如果它是一个没有附加任何事件处理函数的单行代码，将其保持内联是完全没有问题的。但对于更复杂的 JSX，将其提取到单独的组件中可能是一个更好的主意：

```
const UserItem = ({ user }) => {  return (    <li>      <img src={user.avatarUrl} />      <p>{user.fullName}</p>      <small>{user.role}</small>    </li>  )}const ActiveUsersList = () => {  const { users } = useUsers()    const weekAgo = new Date()  weekAgo.setDate(weekAgo.getDate() - 7)  return (    <ul>      {users.filter(user => !user.isBanned && user.lastActivityAt >= weekAgo).map(user =>         <UserItem key={user.id} user={user} />      )}    </ul>      )}
```

这里将用于呈现用户信息的逻辑提取到了一个单独的组件中，从而使我们的组件更小、更可读。

最后，从 API 获取到的用户列表中过滤出所有非活跃用户的逻辑是相对独立的，可以在其他部分重用，所以可以将其提取到一个公共函数中：

```
const getOnlyActive = (users) => {  const weekAgo = new Date()  weekAgo.setDate(weekAgo.getDate() - 7)    return users.filter(user => !user.isBanned && user.lastActivityAt >= weekAgo)}const ActiveUsersList = () => {  const { users } = useUsers()  return (    <ul>      {getOnlyActive(users).map(user =>         <UserItem key={user.id} user={user} />      )}    </ul>      )}
```

到现在为止，通过上面三步拆解，组件已经变得比较简单。但是，仔细观察会发现，这个组件还有优化的空间。目前，组件首先获取数据，然后需要对数据进行过滤。理想情况下，我们只想获取数据并渲染它，而不需要任何额外的操作。所以，可以将这个逻辑封装到一个新的自定义 Hook 中，最终的代码如下：

```
// 获取数据const useUsers = () => {  const [users, setUsers] = useState([])    useEffect(() => {    const loadUsers = async () => {        const response = await fetch('/some-api')      const data = await response.json()      setUsers(data)    }    loadUsers()  }, [])    return { users }}// 列表渲染const UserItem = ({ user }) => {  return (    <li>      <img src={user.avatarUrl} />      <p>{user.fullName}</p>      <small>{user.role}</small>    </li>  )}// 列表过滤const getOnlyActive = (users) => {  const weekAgo = new Date()  weekAgo.setDate(weekAgo.getDate() - 7)    return users.filter(user => !user.isBanned && user.lastActivityAt >= weekAgo)}const useActiveUsers = () => {  const { users } = useUsers()  const activeUsers = useMemo(() => {    return getOnlyActive(users)  }, [users])  return { activeUsers }}const ActiveUsersList = () => {  const { activeUsers } = useActiveUsers()  return (    <ul>      {activeUsers.map(user =>         <UserItem key={user.id} user={user} />      )}    </ul>      )}
```

在这里，我们创建了`useActiveUsers` Hook 来处理获取和过滤数据的逻辑，而组件只做了最少的事情——渲染它从 Hook 中获取的数据。

现在，这个组件只剩下两个职责：**获取数据**和**渲染数据**，当然我们也可以在组件的父级获取数据，并通过 props 传入该组件，这样只需要渲染组件就可以了。当然，还是要视情况而定。我们可以简单地将获取并渲染数据看作是 “一件事”。

总而言之，遵循单一职责原则，我们有效地采用了大量独立的代码并使其更加模块化，模块化的代码更容易测试和维护。

2. 开放封闭原则（OCP）
--------------

开放封闭原则指出 “**一个软件实体（类、模块、函数）应该对扩展开放，对修改关闭**”。开放封闭原则主张以一种允许在不更改源代码的情况下扩展组件的方式来构造组件。

下面来看一个场景，有一个可以在不同页面上使用的 `Header` 组件，根据所在页面的不同，`Header` 组件的 UI 应该有略微的不同：

```
const Header = () => {  const { pathname } = useRouter()    return (    <header>      <Logo />      <Actions>        {pathname === '/dashboard' && <Link to="/events/new">Create event</Link>}        {pathname === '/' && <Link to="/dashboard">Go to dashboard</Link>}      </Actions>    </header>  )}const HomePage = () => (  <>    <Header />    <OtherHomeStuff />  </>)const DashboardPage = () => (  <>    <Header />    <OtherDashboardStuff />  </>)
```

这里，根据所在页面的不同，呈现指向不同页面组件的链接。那现在考虑一下，如果需要将这个`Header`组件添加到更多的页面中会发生什么呢？每次创建新页面时，都需要引用 `Header` 组件，并修改其内部实现。这种方式使得 `Header` 组件与使用它的上下文紧密耦合，并且违背了开放封闭原则。

为了解决这个问题，我们可以使用**组件组合**。`Header` 组件不需要关心它将在内部渲染什么，相反，它可以将此责任委托给将使用 `children` 属性的组件：

```
const Header = ({ children }) => (  <header>    <Logo />    <Actions>      {children}    </Actions>  </header>)const HomePage = () => (  <>    <Header>      <Link to="/dashboard">Go to dashboard</Link>    </Header>    <OtherHomeStuff />  </>)const DashboardPage = () => (  <>    <Header>      <Link to="/events/new">Create event</Link>    </Header>    <OtherDashboardStuff />  </>)
```

使用这种方法，我们完全删除了 `Header` 组件内部的变量逻辑。现在可以使用组合将想要的任何内容放在`Header`中，而无需修改组件本身。

遵循开放封闭原则，可以减少组件之间的耦合，使它们更具可扩展性和可重用性。

3. 里氏替换原则（LSP）
--------------

里氏替换原则可以理解为**对象之间的一种关系，子类型对象应该可以替换为超类型对象**。这个原则严重依赖类继承来定义超类型和子类型关系，但它在 React 中可能不太适用，因为我们几乎不会处理类，更不用说类继承了。虽然远离类继承会不可避免地将这一原则转变为完全不同的东西，但使用继承编写 React 代码会使代码变得糟糕（React 团队不推荐使用继承）。因此，对于这一原则不再过多解释。

4. 接口隔离原则（ISP）
--------------

根据接口隔离原则的说法，**客户端不应该依赖它不需要的接口**。为了更好的说明 ISP 所针对的问题，来看一个呈现视频列表的组件：

```
type Video = {  title: string  duration: number  coverUrl: string}type Props = {  items: Array<Video>}const VideoList = ({ items }) => {  return (    <ul>      {items.map(item =>         <Thumbnail           key={item.title}           video={item}         />      )}    </ul>  )}
```

`Thumbnail` 组件的实现如下：

```
type Props = {  video: Video}const Thumbnail = ({ video }: Props) => {  return <img src={video.coverUrl} />}
```

`Thumbnail` 组件非常小并且很简单，但它有一个问题：它希望将完整的视频对象作为 `props` 传入，但是仅有效地使用其属性之一（`coverUrl`）。

除了视频，我们还需要渲染直播的缩略图，这两种媒体资源会混合在同一个列表中。

下面来定义直播的类型 `LiveStream` ：

```
type LiveStream = {  name: string  previewUrl: string}
```

这是更新后的 VideoList 组件：

```
type Props = {  items: Array<Video | LiveStream>}const VideoList = ({ items }) => {  return (    <ul>      {items.map(item => {        if ('coverUrl' in item) {          return <Thumbnail video={item} />        } else {          // 直播组件，该怎么写？        }      })}    </ul>  )}
```

这时就发现一个问题，我们可以轻松的区分视频和直播对象，但是不能将后者传递给`Thumbnail`组件，因为`Video`和`LiveStream`类型不兼容。它们包含了不同的属性来保存缩略图：视频对象调用`coverUrl`，直播对象调用`previewUrl`。这就是使组件依赖了比实际更多的`props`的原因所在。

下面来重构 `Thumbnail` 组件以确保它仅依赖于它需要的`props`：

```
type Props = {  coverUrl: string}const Thumbnail = ({ coverUrl }: Props) => {  return <img src={coverUrl} />}
```

通过这样修改，现在我们可以使用它来渲染视频和直播的对略图：

```
type Props = {  items: Array<Video | LiveStream>}const VideoList = ({ items }) => {  return (    <ul>      {items.map(item => {        if ('coverUrl' in item) {          return <Thumbnail coverUrl={item.coverUrl} />        } else {          return <Thumbnail coverUrl={item.previewUrl} />        }      })}    </ul>  )}
```

当然，这段代码还可以简化一下：

```
type Props = {  items: Array<Video | LiveStream>}const VideoList = ({ items }) => {  return (    <ul>      {items.map(item => (         <Thumbnail coverUrl={'coverUrl' in item ? item.coverUrl : item.previewUrl} />      ))}    </ul>  )}
```

接口隔离原则主张最小化系统组件之间的依赖关系，使它们的耦合度降低，从而提高可重用性。

5. 依赖倒置原则（DIP）
--------------

依赖倒置原则指出 “**要依赖于抽象，不要依赖于具体**”。换句话说，一个组件不应该直接依赖于另一个组件，而是它们都应该依赖于一些共同的抽象。这里，“组件” 是指应用程序的任何部分，可以是 React 组件、函数、模块或第三方库。这个原则可能很难理解，下面来看一个具体的例子。

有一个 `LoginForm` 组件，它在提交表单时将用户凭据发送到某些 API：

```
import api from '~/common/api'const LoginForm = () => {  const [email, setEmail] = useState('')  const [password, setPassword] = useState('')  const handleSubmit = async (evt) => {    evt.preventDefault()    await api.login(email, password)  }  return (    <form onSubmit={handleSubmit}>      <input type="email" value={email} onChange={e => setEmail(e.target.value)} />      <input type="password" value={password} onChange={e => setPassword(e.target.value)} />      <button type="submit">Log in</button>    </form>  )}
```

在这段代码中，`LoginForm` 组件直接引用了 `api` 模块，因此它们之间存在紧密耦合。这种依赖关系就会导致一个组件的更改会影响其他组件。依赖倒置原则就提倡打破这种耦合，下面来看看如何实现这一点。

首先，从 `LoginForm` 组件中删除对 `api` 模块的直接引用，而是允许通过 `props` 传入所需的回调函数：

```
type Props = {  onSubmit: (email: string, password: string) => Promise<void>}const LoginForm = ({ onSubmit }: Props) => {  const [email, setEmail] = useState('')  const [password, setPassword] = useState('')  const handleSubmit = async (evt) => {    evt.preventDefault()    await onSubmit(email, password)  }  return (    <form onSubmit={handleSubmit}>      <input type="email" value={email} onChange={e => setEmail(e.target.value)} />      <input type="password" value={password} onChange={e => setPassword(e.target.value)} />      <button type="submit">Log in</button>    </form>  )}
```

通过这样修改，`LoginForm` 组件不再依赖于 `api` 模块。向 API 提交凭证的逻辑是通过 `onSubmit` 回调函数抽象出来的，现在由父组件负责提供该逻辑的具体实现。

为此，创建了一个 `ConnectedLoginForm` 组件来将表单提交逻辑委托给 `api` 模块：

```
import api from '~/common/api'const ConnectedLoginForm = () => {  const handleSubmit = async (email, password) => {    await api.login(email, password)  }  return (    <LoginForm onSubmit={handleSubmit} />  )}
```

`ConnectedLoginForm` 组件充当 `api` 和 `LoginForm` 之间的粘合剂，而它们本身保持完全独立。这样就可以对这两个组件进行单独的修改和维护，而不必担心修改会影响其他组件。

依赖倒置原则旨在最小化应用程序不同组件之间的耦合。你可能已经注意到，最小化是所有 SOLID 原则中反复出现的关键词——从最小化单个组件的职责范围到最小化它们之间的依赖关系等等。

6. 小结
-----

通过上面的示例，相信你已经对如何在 React 中使用 SOLID 原则有了一定的了解。应用 SOLID 原则使我们的 React 代码更易于维护和健壮。

但是需要注意，虔诚地遵循这些原则可能会造成破坏并导致代码过度设计，因此我们应该学会识别对组件的进一步分解或解耦何时会导致其复杂度增加而几乎没有任何好处。

> 参考：https://konstantinlebedev.com/solid-in-react/

**往期推荐：**

[前端开发必备的文件处理库！](http://mp.weixin.qq.com/s?__biz=MzU2MTIyNDUwMA==&mid=2247503363&idx=1&sn=f6098cc217b43be4d01c77ad219e97b2&chksm=fc7e8058cb09094e453b3b3a84aba98bb4c5a941175e59c94997c142a06d662f31d3b96aa771&scene=21#wechat_redirect)

[2022 年 Vue 的发展如何？](http://mp.weixin.qq.com/s?__biz=MzU2MTIyNDUwMA==&mid=2247503284&idx=1&sn=96c5b387407735da81aa7071a6081450&chksm=fc7e83efcb090af90af5b6260f13e9d7642b2b8738c877e8a7fcfa6b88072884cdc59574706d&scene=21#wechat_redirect)

[你需要知道的 19 个 console 实用调试技巧](http://mp.weixin.qq.com/s?__biz=MzU2MTIyNDUwMA==&mid=2247502838&idx=1&sn=54ae743a8cae6d7e80ca4c707d1dcbbd&chksm=fc7e85adcb090cbb4f2c574e764ebef29586fe3c7ec84c8f5c5e48f5f47757f71be0af9bc559&scene=21#wechat_redirect)

[盘点 10 个 GitHub 上的前端高仿项目](http://mp.weixin.qq.com/s?__biz=MzU2MTIyNDUwMA==&mid=2247502590&idx=1&sn=cec32a37ee59d383209d2d7c7c799f8c&chksm=fc7e84a5cb090db38b17addcabf354f1eb98623b27f10913527175f182084dee24e37610a9b2&scene=21#wechat_redirect)

[JavaScript 条件语句优化小技巧](http://mp.weixin.qq.com/s?__biz=MzU2MTIyNDUwMA==&mid=2247502560&idx=1&sn=b2980065d79b050ec00041ebf3fac467&chksm=fc7e84bbcb090dadf754fdb7e85a465b3dd9f4c0baa192f4892101c46629b5e18a8992294cc5&scene=21#wechat_redirect)