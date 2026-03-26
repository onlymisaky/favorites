> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/d2Ig_SvjLvPmNK-6BFrdsA)

> 本文作者系 360 奇舞团前端开发工程师

**简介**
------

`SOLID` 原则是由 `Robert C. Martin` 在 2000 年提出的一套软件开发准则，最初用于面向对象编程（OOP），旨在解决软件开发中的复杂性和维护问题。随着时间推移，它不仅在传统 OOP 语言中广泛应用，也被引入到 JavaScript 和 TypeScript 等现代编程语言和框架中，如 `React` 和 `Angular`。

SOLID 原则包括以下五个方面：

1.  单一职责原则（`Single Responsibility Principle - SRP`）
    
2.  开闭原则（`Open/Closed Principle - OCP`）
    
3.  里氏替换原则（`Liskov Substitution Principle - LSP`）
    
4.  接口隔离原则（`Interface Segregation Principle - ISP`）
    
5.  依赖倒置原则（`Dependency Inversion Principle - DIP`）
    

在 `JavaScript` 和 `TypeScript` 中，尽管它们是动态语言且不以类为核心，但这些原则可融入组件化和模块化架构，开发者能借此确保代码简洁、可扩展、易维护和测试

一、 单一职责原则 (SRP)
---------------

### 原则

一个类或模块应只有一个发生变化的原因，仅负责一项特定功能。在前端开发中，尤其是在 `React` 等组件化框架中，我们经常会看到组件承担了太多职责——不仅负责 `UI` 渲染，还处理业务逻辑和数据请求。这种情况很容易导致代码难以维护和测试，违反了 `SRP` 原则。

### 反例 (js-react)

```
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  async function fetchUserData() {
    const response = await fetch(`/api/users/${userId}`);
    const data = await response.json();
    setUser(data);
  }

  return <div>{user?.name}</div>;
}
```

此例中，`UserProfile` 组件既负责 `UI` 渲染又负责数据获取，违反 `SRP` 原则，当修改数据获取或界面渲染逻辑时，可能影响组件其他部分，增加维护复杂性。

### 重构后代码

为了遵循 `SRP` 原则，我们可以将数据获取逻辑提取到一个自定义的 `Hook` 中，让组件 `UserProfile` 只关注 `UI` 渲染。

```
// 自定义 Hook 用于获取用户数据
function useUserData(userId) {
  const [user, setUser] = useState(null);
  useEffect(() => {
    async function fetchUserData() {
      const response = await fetch(`/api/users/${userId}`);
      const data = await response.json();
      setUser(data);
    }
    fetchUserData();
  }, [userId]);

  return user;
}
// UI 组件
function UserProfile({ userId }) {
  const user = useUserData(userId); // 将数据获取逻辑移到了 Hook 中
  return <div>{user?.name}</div>;
}
```

通过自定义 `Hook`（`useUserData`）将数据获取逻辑与 `UI` 逻辑分离，符合 `SRP` 原则，提升了代码的可维护性和复用性。

### 反例 (ts-angular)

**反例:**

```
@Injectable()export class UserService {  constructor(private http: HttpClient) {}  getUser(userId: string) {    return this.http.get(`/api/users/${userId}`);  }  updateUserProfile(userId: string, data: any) {    // 更新用户信息并处理通知    return this.http.put(`/api/users/${userId}`, data).subscribe(() => {      console.log('User updated');      alert('Profile updated successfully');    });  }}
```

`UserService` 类承担多个职责，包括获取和更新用户信息以及处理通知，违背 `SRP` 原则，导致维护困难。

### 重构后代码

```
@Injectable()export class UserService {  constructor(private http: HttpClient) {}  getUser(userId: string) {    return this.http.get(`/api/users/${userId}`);  }  updateUserProfile(userId: string, data: any) {    return this.http.put(`/api/users/${userId}`, data);  }}// 独立的通知服务@Injectable()export class NotificationService {  notify(message: string) {    alert(message);  }}
```

通过将通知逻辑分离到一个独立的 `NotificationService` 中，我们遵循了 `单一职责原则（SRP）`，将通知逻辑分离到 `NotificationService` 中，遵循 `SRP` 原则，每个类职责明确，带来诸多好处：

1.  职责明确，增强可维护性。修改通知方式只需更改 `NotificationService`，不影响用户服务其他功能。
    
2.  提高复用性。`NotificationService` 可在其他服务或组件中复用。
    
3.  测试更加方便。可单独为 `UserService` 和 `NotificationService` 编写测试。
    
4.  代码扩展更加灵活。如需更改通知方式，只需修改或扩展 `NotificationService`。
    

```
// **职责明确，增强可维护性：**修改通知为弹出窗口通知@Injectable()export class NotificationService {  notify(message: string) {    showModal(message);  // 假设我们有一个 showModal 函数用于展示弹窗  }}
```

```
// 提高复用性。NotificationService 可在其他服务或组件中复用@Injectable()export class OrderService {  constructor(private notificationService: NotificationService) {}  placeOrder(orderData: any) {    // 订单处理逻辑    this.notificationService.notify('Order placed successfully');  }}
```

```
// 测试更加方便。可单独为 UserService 和 NotificationService 编写测试。it('should fetch user data', () => {  const userService = new UserService(httpClientMock);  userService.getUser('1').subscribe(data => {    expect(data).toEqual(mockUserData);  });});// NotificationService 测试it('should notify the user', () => {  const notificationService = new NotificationService();  spyOn(window, 'alert');  notificationService.notify('Test message');  expect(window.alert).toHaveBeenCalledWith('Test message');});
```

```
//代码扩展更加灵活。如需更改通知方式，只需修改或扩展 NotificationService@Injectable()export class EmailNotificationService extends NotificationService {  notify(message: string) {    sendEmail(message);  // 假设我们有一个 sendEmail 函数发送邮件  }}
```

二、开闭原则（OCP）
-----------

### 原则

软件实体应能在不修改模块源代码的情况下扩展其行为，即对扩展开放，对修改封闭。

### 反例 (js-react)

假设我们有一个表单验证函数，它目前工作正常，但未来可能需要添加更多的验证逻辑。

```
function validateForm(values) {
  let errors = {};
  if (!values.name) {
    errors.name = "Name is required";
  }
  if (!values.email) {
    errors.email = "Email is required";
  } else if (!/\S+@\S+\.\S+/.test(values.email)) {
    errors.email = "Email is invalid";
  }
  return errors;
}
```

`validateForm` 函数包含所有验证逻辑，添加新验证规则需修改现有代码，违背 `OCP` 原则，增加维护难度和出错风险。

### 重构后代码

```
// 基础验证器接口
class Validator {
  validate(value) {
    throw new Error("validate method must be implemented");
  }
}
// 具体的验证器
class RequiredValidator extends Validator {
  validate(value) {
    return value ? null : "This field is required";
  }
}
class EmailValidator extends Validator {
  validate(value) {
    return /\S+@\S+\.\S+/.test(value) ? null : "Email is invalid";
  }
}
// 验证表单函数
function validateForm(values, validators) {
  let errors = {};

  for (let field in validators) {
    const error = validators[field].validate(values[field]);
    if (error) {
      errors[field] = error;
    }
  }

  return errors;
}
// 使用示例
const validators = {
  name: new RequiredValidator(),
  email: new EmailValidator(),
};
const errors = validateForm({ name: "", email: "invalid email" }, validators);
console.log(errors);
```

通过将验证逻辑封装到独立的类（如 `RequiredValidator` 和 `EmailValidator`）中，我们使得验证器符合 **开放 / 封闭原则（OCP）**。现在，如果需要添加新的验证规则（例如电话号码验证），只需创建一个新的验证器类，而无需修改现有的验证逻辑；换句话说，应该允许在不修改现有核心代码的情况下添加新功能。

### 反例 (ts-angular)

在 `Angular` 中，服务和组件的设计应允许添加新功能，而无需修改核心逻辑。

```
export class NotificationService {  send(type: 'email' | 'sms', message: string) {    if (type === 'email') {      // 发送电子邮件    } else if (type === 'sms') {      // 发送短信    }  }}
```

在这个例子中，`NotificationService` 类违反了 **开放 / 封闭原则（OCP）**，因为每次需要支持新类型的通知（例如推送通知）时，必须修改 `send` 方法。这不仅会增加维护成本，还容易引发错误，尤其是当代码变得越来越复杂时。

### 重构后代码

```
interface Notification {  send(message: string): void;}@Injectable()export class EmailNotification implements Notification {  send(message: string) {    // 发送电子邮件的逻辑  }}@Injectable()export class SMSNotification implements Notification {  send(message: string) {    // 发送短信的逻辑  }}@Injectable()export class NotificationService {  constructor(private notifications: Notification[]) {}  notify(message: string) {    this.notifications.forEach(n => n.send(message));  }}
```

通过将通知发送逻辑封装到各自独立的类（`EmailNotification` 和 `SMSNotification`）中，我们实现了符合 **开放 / 封闭原则（OCP）** 的设计。这个设计的核心思想是，所有新功能（例如新的通知类型）都可以通过创建新的类来扩展，而不需要修改现有的 `NotificationService` 类。好处：对扩展开放，对修改封闭、提高复用性、测试更加简单、增强代码的灵活性与维护性。

* * *

三、 里氏替换原则 (LSP)
---------------

### 原则

子类型必须可以替换其基类型。派生类或组件应该能够替换基类，而不会影响程序的正确性。

### 反例 (js-react)

当使用高阶组件 (`HOC`) 或有条件地渲染不同组件时，`LSP` 有助于确保所有组件的行为都可预测。

**反向例子:**

```
function Button({ onClick }) {
  return <button onClick={onClick}>Click me</button>;
}
function LinkButton({ href }) {
  return <a href={href}>Click me</a>;
}
<Button onClick={() => {}} />;
<LinkButton href="/home" />;
```

这里`Button`和`LinkButton`不一致，一个用`onClick`，一个用`href`，替换起来比较困难。

### 重构后代码

```
function Clickable({ children, onClick }) {
  return <div onClick={onClick}>{children}</div>;
}

function Button({ onClick }) {
  return <Clickable onClick={onClick}>
    <button>Click me</button>
  </Clickable>;
}

function LinkButton({ href }) {
  return <Clickable onClick={() => window.location.href = href}>
    <a href={href}>Click me</a>
  </Clickable>;
}
```

现在，`Button` 和 `LinkButton` 的行为类似，均遵循 `LSP`。

### 反例 (ts-angular)

```
class Rectangle {  constructor(protected width: number, protected height: number) {}  area() {    return this.width * this.height;  }}class Square extends Rectangle {  constructor(size: number) {    super(size, size);  }  setWidth(width: number) {    this.width = width;    this.height = width; // Breaks LSP  }}
```

修改 `Square` 中的 `setWidth` 违反了 `LSP`，因为 `Square` 的行为与 `Rectangle` 不同。

### 重构后代码

```
class Shape {  area(): number {    throw new Error('Method not implemented');  }}class Rectangle extends Shape {  constructor(private width: number, private height: number) {    super();  }  area() {    return this.width * this.height;  }}class Square extends Shape {  constructor(private size: number) {    super();  }  area() {    return this.size * this.size;  }}
```

现在，`Square`和`Rectangle`可以相互替代而不违反 LSP。

* * *

四、**接口隔离原则 (ISP)**
------------------

### 原则

客户端不应被迫依赖他们不使用的接口

### 反例 (js-react)

`React` 组件有时会收到不必要的 `props`，导致代码紧密耦合且庞大。

```
function MultiPurposeComponent({ user, posts, comments }) {
  return (
    <div>
      <UserProfile user={user} />
      <UserPosts posts={posts} />
      <UserComments comments={comments} />
    </div>
  );
}
```

这里，组件依赖于多个 `props`，即使它可能并不总是使用它们。

### 重构后代码

```
function UserProfileComponent({ user }) {
  return <UserProfile user={user} />;
}

function UserPostsComponent({ posts }) {
  return <UserPosts posts={posts} />;
}

function UserCommentsComponent({ comments }) {
  return <UserComments comments={comments} />;
}
```

通过将组件拆分成更小的组件，每个组件仅依赖于它实际使用的数据。

### 反例 (ts-angular)

```
interface Worker {  work(): void;  eat(): void;}class HumanWorker implements Worker {  work() {    console.log('Working');  }  eat() {    console.log('Eating');  }}class RobotWorker implements Worker {  work() {    console.log('Working');  }  eat() {    throw new Error('Robots do not eat'); // Violates ISP  }}
```

这里，`RobotWorker`被迫实现了不相关的`eat`方法。

### 重构后代码

```
interface Worker {  work(): void;}interface Eater {  eat(): void;}class HumanWorker implements Worker, Eater {  work() {    console.log('Working');  }  eat() {    console.log('Eating');  }}class RobotWorker implements Worker {  work() {    console.log('Working');  }}
```

通过分离 `Worker` 和 `Eater` 接口，我们确保客户端只依赖于它们所需要的。

* * *

五、依赖倒置原则 (DIP)
--------------

### 原则

高级模块不应依赖于低级模块。两者都应依赖于抽象（例如接口）。

### 反例 (js-react)

```
function fetchUser(userId) {
  return fetch(`/api/users/${userId}`).then(res => res.json());
}

function UserComponent({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUser(userId).then(setUser);
  }, [userId]);

  return <div>{user?.name}</div>;
}
```

这里，`UserComponent` 与 `fetchUser` 函数紧密耦合。

### 重构后代码

```
function UserComponent({ userId, fetchUserData }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUserData(userId).then(setUser);
  }, [userId, fetchUserData]);

  return <div>{user?.name}</div>;
}

// Usage
<UserComponent userId={1} fetchUserData={fetchUser} />;
```

通过将 `fetchUserData` 注入组件，我们可以轻松地交换实现以进行测试或用于不同的用例。

### 反例 (ts-angular)

```
@Injectable()export class UserService {  constructor(private http: HttpClient) {}  getUser(userId: string) {    return this.http.get(`/api/users/${userId}`);  }}@Injectable()export class UserComponent {  constructor(private userService: UserService) {}  loadUser(userId: string) {    this.userService.getUser(userId).subscribe(user => console.log(user));  }}
```

`UserComponent` 与 `UserService` 紧密耦合，因此很难替换掉 `UserService`。

### 重构后代码

```
interface UserService {  getUser(userId: string): Observable<User>;}@Injectable()export class ApiUserService implements UserService {  constructor(private http: HttpClient) {}  getUser(userId: string) {    return this.http.get<User>(`/api/users/${userId}`);  }}@Injectable()export class UserComponent {  constructor(private userService: UserService) {}  loadUser(userId: string) {    this.userService.getUser(userId).subscribe(user => console.log(user));  }}
```

通过依赖接口（`UserService`），`UserComponent` 现在与 `ApiUserService` 的具体实现分离。

* * *

结论
--

无论是前端的 `React`、`Angular` 等框架，还是后端的 `Node.js`，`SOLID` 原则都能作为指南，让软件架构更加稳固。`SOLID` 原则能非常有效地确保代码干净、可维护且可扩展，在 `JavaScript` 和 `TypeScript` 框架（如 `React` 和 `Angular`）中同样如此。应用这些原则，开发人员能编写灵活且可重复使用的代码，随着需求的发展，这些代码也能轻松扩展和重构。遵循 `SOLID` 原则，能让代码库变得强大，为未来的增长做好准备。

- END -

**如果您关注前端 + AI 相关领域可以扫码进群交流**

 ![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/cAd6ObKOzEArGqlLlZmLVB61keywZ2APgWHNwTdK8OicE1utUcAJj1m5ZMFTL8iac51bGglnIeCR5KHicCBh5lh3A/640?wx_fmt=jpeg)

添加小编微信进群😊  

关于奇舞团
-----

奇舞团是 360 集团最大的大前端团队，非常重视人才培养，有工程师、讲师、翻译官、业务接口人、团队 Leader 等多种发展方向供员工选择，并辅以提供相应的技术力、专业力、通用力、领导力等培训课程。奇舞团以开放和求贤的心态欢迎各种优秀人才关注和加入奇舞团。  

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEBLicibtcprJISN18FgTtg2N1ichPnMqRhicrP20VfwnC4vday7gtEoiaSynIH1bas4N5kgicliakrLdtT2Q/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)