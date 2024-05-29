> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/XLMqOMkeUr0RVOu3Zeq5ZQ)

大家好，我是梦兽。2024 年相信大家已经对 React 不在陌生，今天梦兽想给大家从软件工程角度 S.O.L.I.D 原则出发，希望大家以后写组件编码是有一些思路。

S: 单一职责原则（SRP）
--------------

一个组件应该只有一个改变的理由，这意味着它应该只有一项工作。 示例：用户配置文件组件

*   将职责分解为更小的功能组件。
    

```
// UserProfile.jsconst UserProfile = ({ user }) => {  return (    <div>      <UserAvatar user={user} />      <UserInfo user={user} />    </div>  );};// UserAvatar.jsconst UserAvatar = ({ user }) => {  return <img src={user.avatarUrl} alt={`${user.name}'s avatar`} />;};// UserInfo.jsconst UserInfo = ({ user }) => {  return (    <div>      <h1>{user.name}</h1>      <p>{user.bio}</p>    </div>  );};
```

这个是有时间的前提下建议遵循的原则，但是一般开发中。我们都会写出下列这样的代码：将显示、数据获取和业务逻辑组合在一个组件中。

```
// IncorrectUserProfile.jsconst IncorrectUserProfile = ({ user }) => {  // Fetching data, handling business logic and displaying all in one  const handleEdit = () => {    console.log("Edit user");  };  return (    <div>      <img src={user.avatarUrl} alt={`${user.name}'s avatar`} />      <h1>{user.name}</h1>      <p>{user.bio}</p>      <button onClick={handleEdit}>Edit User</button>    </div>  );};
```

O: 开闭原则（OCP）
------------

软件实体应该对扩展开放，但对修改关闭。示例：主题按钮，使用 props 来扩展组件功能，而无需修改原始组件。

```
// Button.jsconst Button = ({ onClick, children, style }) => {  return (    <button onClick={onClick} style={style}>      {children}    </button>  );};// Usageconst PrimaryButton = (props) => {  const primaryStyle = { backgroundColor: 'blue', color: 'white' };  return <Button {...props} style={primaryStyle} />;};
```

不推荐的做法：

```
// IncorrectButton.js// Modifying the original Button component directly for a specific styleconst Button = ({ onClick, children, primary }) => {  const style = primary ? { backgroundColor: 'blue', color: 'white' } : null;  return (    <button onClick={onClick} style={style}>      {children}    </button>  );};
```

L: 里氏替换原理
---------

超类的对象可以用其子类的对象替换，而不会破坏应用程序。示例：基本按钮和图标按钮, 确保子类组件可以无缝替换超类组件。

```
// BasicButton.jsconst BasicButton = ({ onClick, children }) => {  return <button onClick={onClick}>{children}</button>;};// IconButton.jsconst IconButton = ({ onClick, icon, children }) => {  return (    <button onClick={onClick}>      <img src={icon} alt="icon" />      {children}    </button>  );};
```

在上面的单一原则遵循的前提下，并不提倡下面这种写法。但也要看你的时间是否足够多。不推荐写法

```
// IncorrectIconButton.js
// This button expects an icon and does not handle the absence of one, breaking when used as a BasicButton
const IncorrectIconButton = ({ onClick, icon }) => {
  if (!icon) {
    throw new Error("Icon is required");
  }
  return (
    <button onClick={onClick}>
      <img src={icon} alt="icon" />
    </button>
  );
};
```

接口隔离原则（ISP）
-----------

任何客户端都不应该被迫依赖它不使用的方法。示例：文本组件, 针对不同的用途提供特定的接口。

```
// Text.jsconst Text = ({ type, children }) => {  switch (type) {    case 'header':      return <h1>{children}</h1>;    case 'title':      return <h2>{children}</h2>;    default:      return <p>{children}</p>;  }};
```

不推荐：用不必要的属性使组件变得混乱。

```
// IncorrectText.js// This component expects multiple unrelated props, cluttering the interfaceconst IncorrectText = ({ type, children, onClick, isLoggedIn }) => {  if (isLoggedIn && onClick) {    return <a href="#" onClick={onClick}>{children}</a>;  }  return type === 'header' ? <h1>{children}</h1> : <p>{children}</p>;};
```

依赖倒置原理（DIP）
-----------

高层模块不应该依赖于低层模块。两者都应该依赖于抽象。示例：获取数据, 使用钩子或类似的模式来抽象数据获取。

```
// useUserData.js (Abstraction)const useUserData = (userId) => {  const [user, setUser] = useState(null);  useEffect(() => {    fetchData(userId).then(setUser);  }, [userId]);  return user;};// UserProfile.jsconst UserProfile = ({ userId }) => {  const user = useUserData(userId);  if (!user) return <p>Loading...</p>;  return <div><h1>{user.name}</h1></div>;};
```

不推荐：在组件内部硬编码数据获取。

```
// IncorrectUserProfile.jsconst IncorrectUserProfile = ({ userId }) => {  const [user, setUser] = useState(null);  useEffect(() => {    // Fetching data directly inside the component    fetch(`https://api.example.com/users/${userId}`)      .then(response => response.json())      .then(setUser);  }, [userId]);  if (!user) return <p>Loading...</p>;  return <div><h1>{user.name}</h1></div>;};
```

类似这种功能，ahooks 已经帮我实现了很多，可以按需寻找一下 hooks 给自己的应用解耦。

如果对你有帮助，能否给我一个小心心或者关注呢？如果想加入梦兽编程交流群可以关注梦兽编程公众号获取二维码。