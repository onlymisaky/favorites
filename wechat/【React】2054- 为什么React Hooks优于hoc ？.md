> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/x67Wg6IRXNedbNiXOx09yg)

在现代的 `React`世界中，每个人都在使用带有 `React Hooks`的函数组件。然而，高阶组件（`HOC`）的概念在现代的 `React`世界中仍然适用，因为它们可以用于类组件和函数组件。因此，它们是在历史和现代 React 组件之间使用可重用抽象的完美桥梁。  

高阶组件可以增强组件的可组合性质。然而，高阶组件存在问题，而且这些问题完全被 `React Hooks` 解决了。这就是为什么我想指出这些问题，以便开发人员可以做出明智的决定，无论是在某些场景下使用 `HOC`还是`Hooks`，还是他们最终是否想要全面采用 `React Hooks`。

HOC 与 Hooks：属性混乱
----------------

让我们来看下面这个用于条件渲染的高阶组件（`HOC`）。如果出现错误，它会渲染一个错误消息。如果没有错误，它会渲染给定的组件：

```
import * as React from 'react';

const withError = (Component) => (props) => {
  if (props.error) {
    return <div>Something went wrong ...</div>;
  }

  return <Component {...props} />;
};

export default withError;


```

请注意，如果没有错误，`HOC`会将所有属性传递给给定的组件。这种方式应该可以正常工作，然而，可能会有太多的属性传递给下一个组件，而下一个组件并不一定关心所有这些属性。

例如，下一个组件可能根本不关心错误，因此最好的做法是在将属性传递给下一个组件之前，使用剩余运算符从属性中删除错误：

```
import * as React from 'react';

const withError = (Component) => ({ error, ...rest }) => {
  if (error) {
    return <div>Something went wrong ...</div>;
  }

  return <Component {...rest} />;
};

export default withError;


```

这个版本也应该可以工作，至少如果给定的组件不需要错误属性的话。然而，这两个版本的`HOC`都显示了在使用`HOC`时出现属性混乱的问题。通常情况下，属性只是通过使用展开运算符传递给 `HOC`，而且仅在 `HOC` 本身中部分使用。通常情况下，从一开始就不清楚给定的组件是否需要 `HOC`提供的所有属性（第一个版本）或者是否只需要部分属性（第二个版本）。

这是使用`HOC` 的第一个警告；当使用多个组合在一起的 `HOC` 时，情况会很快变得不可预测，因为这样就不仅要考虑给定组件需要哪些属性，还要考虑组合中其他`HOC` 需要哪些属性。例如，假设我们有另一个用于渲染条件加载指示器的 `HOC`：

```
import * as React from 'react';

const withLoading = (Component) => ({ isLoading, ...rest }) => {
  if (isLoading) {
    return <div>Loading ...</div>;
  }

  return <Component {...rest} />;
};

export default withLoading;


```

现在，两个`HOC`，`withError`和 `withLoading`，都组合在一个组件上。一旦使用了这个组件，它可能会像下面这样：

```
const DataTableWithFeedback = compose(
  withError,
  withLoading,
)(DataTable);

const App = () => {
  ...

  return (
    <DataTableWithFeedback
      columns={columns}
      data={data}
      error={error}
      isLoading={isLoading}
    />
  );
};


```

在不了解 `HOC`实现细节的情况下，你能知道哪些属性被 `HOC` 使用，哪些属性被用于底层组件吗？不清楚哪些属性实际传递给了实际的 `DataTable` 组件，哪些属性被`HOC` 在传递过程中使用。

让我们进一步看一个示例，引入另一个用于数据获取的`HOC`，我们不展示其实现细节：

```
const DataTableWithFeedback = compose(
  withFetch,
  withError,
  withLoading,
)(DataTable);

const App = () => {
  ...

  const url = 'https://api.mydomain/mydata';

  return (
    <DataTableWithFeedback
      url={url}
      columns={columns}
    />
  );
};


```

突然间，我们不再需要 `data`、`isLoading`和 `error`，因为所有这些信息都是在新的 `withFetch HOC` 中通过使用 `url` 生成的。有趣的是，虽然 `isLoading` 和 `error`是在 w`ithFetch HOC`中生成的，但它们会在传递过程中被 `withLoading`和 `withError` 消费。另一方面，从 `withFetch`生成的（这里是获取的）数据将作为属性传递给底层`DataTable` 组件。

```
App     withFetch   withError   withLoading   DataTable

        data->      data->      data->        data
url->   error->     error
        isLoading-> isLoading-> isLoading


```

除了所有这些隐藏的魔法之外，还要看到顺序也很重要：`withFetch` 需要是外部`HOC`，而 `withLoading` 和 `withError` 则没有特定的顺序，这给错误留下了很多空间。

总之，所有这些从 `HOC` 进出的属性都以某种方式通过黑盒子传递，我们需要仔细观察才能真正理解在途中生成了哪些属性，哪些属性在途中被消费，哪些属性被传递。不查看 `HOC`，我们不知道在这些层之间发生了什么。

最后，让我们比较一下，看看 `React Hooks`如何用一个简单易懂的代码片段解决了这个问题：

```
const App =

 () => {
  const url = 'https://api.mydomain/mydata';
  const { data, isLoading, error } = useFetch(url);

  if (error) {
    return <div>Something went wrong ...</div>;
  }

  if (isLoading) {
    return <div>Loading ...</div>;
  }

  return (
    <DataTable
      columns={columns}
      data={data}
    />
  );
};


```

使用 `React Hooks`时，一切都为我们展现出来：我们看到了所有传入我们“黑盒子”（这里是 `useFetch`）的属性（这里是 `url`），以及所有从中出来的属性（这里是 `data`、`isLoading`、`error`）。即使我们不知道 `useFetch` 的实现细节，我们清楚地看到了哪些输入进去，哪些输出出来。即使 `useFetch` 可以像`withFetch`和其他 `HOC`一样被视为黑盒子，但我们仅仅通过一行代码就看到了这个 `React Hook` 的整个 API 约束。

在以前，这在 `HOC` 中并不明显，因为我们不清楚哪些属性是需要的（输入），哪些属性是生成的（输出）。另外，在这之间没有其他的`HTML`层，因为我们只是在父组件（或子组件）中使用了条件渲染。  
在现代的 `React`世界中，每个人都在使用带有 `React Hooks` 的函数组件。然而，高阶组件（`HOC`）的概念在现代的 `React`世界中仍然适用，因为它们可以用于类组件和函数组件。因此，它们是在历史和现代 React 组件之间使用可重用抽象的完美桥梁。

HOCS VS HOOKS: 命名冲突
-------------------

如果给一个组件赋予相同名称的 prop 两次，后者将会覆盖前者：

```
<Headline text="Hello World" text="Hello React" />


```

在上一个示例中使用普通组件时，这个问题变得很明显，我们不太可能意外覆盖 `props`（除非我们需要）。然而，当使用 `HOCs`时，当两个 HOCs 传递具有相同名称的 `props`时，问题又变得混乱了。

这个问题的最简单例证是将两个相同的 `HOCs`组合到一个组件之上：

```
const UserWithData = compose(
  withFetch,
  withFetch,
  withError,
  withLoading,
)(User);

const App = () => {
  ...

  const userId = '1';

  return (
    <UserWithData
      url={`https://api.mydomain/user/${userId}`}
      url={`https://api.mydomain/user/${userId}/profile`}
    />
  );
};


```

这是一个非常常见的情景；通常组件需要从多个 `API`端点获取数据。

正如我们之前学到的，`withFetch HOC`期望一个 `url prop` 用于数据获取。现在我们想要两次使用这个 `HOC`，因此我们不再能够满足两个 `HOCs`的约定。相反，两个 `HOCs` 将会作用于后一个 `URL`，这将导致问题。解决这个问题的一个解决方案（是的，有不止一种解决方案）是将我们的 `withFetch HOC`更改为更强大的东西，以执行不止一个而是多个请求：

```
const UserWithData = compose(
  withFetch,
  withError,
  withLoading,
)(User);

const App = () => {
  ...

  const userId = '1';

  return (
    <UserWithData
      urls={[
        `https://api.mydomain/user/${userId}`,
        `https://api.mydomain/user/${userId}/profile`,
      ]}
    />
  );
};


```

这个解决方案似乎是可行的，但让我们停下来思考一下：以前只关心一个数据获取的 `withFetch HOC`-- 基于这一个数据获取设置`isLoading`和 `error`状态 -- 突然变成了一个复杂的怪物。这里有很多问题需要回答：

*   即使其中一个请求提前完成，加载指示器是否仍会显示？
    
*   如果只有一个请求失败，整个组件会作为错误渲染吗？
    
*   如果一个请求依赖于另一个请求会发生什么？  
    ……
    

尽管这使得 `HOC`变得非常复杂（但功能强大），我们在内部引入了另一个问题。我们不仅有传递重复的 `prop`（这里是`url`，我们用 `urls`解决了）给 `HOC` 的问题，而且`HOC`将输出重复的 `prop`（这里是 data）并将其传递给底层组件。

因此，在这种情况下，`User`组件必须接收一个合并的数据 `props`-- 来自两个数据获取的信息 -- 或者接收一个数据数组 -- 其中第一个条目根据第一个`URL`设置，第二个条目根据第二个 `URL`设置。此外，当两个请求不同时完成时，一个数据条目可能为空，而另一个可能已经存在……

好了。我不想在这里进一步解决这个问题。这是有解决方案的，但正如我之前提到的，这将使得 `withFetch` `HOC` 比它应该的更复杂，以及如何在底层组件中使用合并的数据或数据数组的情况并不比开发人员的经验来得更好。

让我们再次看看 `React Hooks`如何通过一个 -- 从使用的角度来说易于理解 -- 代码片段为我们解决这个问题：

```
const App = () => {
  const userId = '1';

  const {
    data: userData,
    isLoading: userIsLoading,
    error: userError
  } = useFetch(`https://api.mydomain/user/${userId}`);

  const {
    data: userProfileData,
    isLoading: userProfileIsLoading,
    error: userProfileError
  } = useFetch(`https://api.mydomain/user/${userId}/profile`);

  if (userError || userProfileError) {
    return <div>Something went wrong ...</div>;
  }

  if (userIsLoading) {
    return <div>User is loading ...</div>;
  }

  const userProfile = userProfileIsLoading
    ? <div>User profile is loading ...</div>
    : <UserProfile userProfile={userProfileData} />;

  return (
    <User
      user={userData}>
      userProfile={userProfile}
    />
  );
};


```

你看到我们在这里获得了多大的灵活性吗？只有在用户仍在加载时才提前返回一个加载指示器，然而，如果用户已经存在，只有用户配置文件是挂起的，我们只会部分地渲染一个加载指示器，其中数据丢失了（这里也是由于组件组合的强大）。我们可以对错误做同样的处理，但是因为我们已经掌握了如何处理请求结果的所有权力，我们可以在这个组件中渲染相同的错误消息。如果以后我们决定以不同的方式处理这两个错误，我们可以在这一个组件中做到这一点，而不是在我们的抽象中（无论是 `HOC` 还是`Hook`）。

最终，这就是我们最初得出这个结论的原因，通过重命名从`React Hooks` 中输出的变量，我们避免了名称冲突。当使用 `HOCs`时，我们需要注意 `HOCs`可能在内部使用相同名称的`props`。当使用相同的`HOC`两次时，这往往是明显的，但如果您使用两个不同的`HOCs`-- 只是偶然间 -- 使用相同的`prop`名称会发生什么呢？它们将互相覆盖彼此的数据，让您困惑为什么您接收的组件没有收到正确的`props`。

HOCS VS HOOKS: 依赖关系
-------------------

`HOC`（高阶组件）非常强大，也许太强大了？`HOC` 可以通过两种方式接收参数：一种是从父组件接收 `props`（正如我们之前所见），另一种是增强组件。让我们通过示例来详细说明后者。

以前我们的`withLoading`和 `withError HOCs`为例，但这次更强大：

```
const withLoading = ({ loadingText }) => (Component) => ({ isLoading, ...rest }) => {
  if (isLoading) {
    return <div>{loadingText ? loadingText : 'Loading ...'}</div>;
  }

  return <Component {...rest} />;
};

const withError = ({ errorText }) => (Component) => ({ error, ...rest }) => {
  if (error) {
    return <div>{errorText ? errorText : 'Something went wrong ...'}</div>;
  }

  return <Component {...rest} />;
};


```

通过这些额外的参数 -- 这里通过包围 `HOC` 的高阶函数传递 -- 我们获得了在创建增强组件时提供参数的额外能力：

```
const DataTableWithFeedback = compose(
  withError({ errorText: 'The data did not load' }),
  withLoading({ loadingText: 'The data is loading ...' }),
)(DataTable);

const App = () => {
  ...

  return (
    <DataTableWithFeedback
      columns={columns}
      data={data}
      error={error}
      isLoading={isLoading}
    />
  );
};


```

这为之前的 `Prop Confusion` 问题增加了一个（1）正面和（2）负面影响，因为现在我们有了（2）更多的地方，`HOC`接收`props`（这并不使事情变得更容易理解），但另一方面（1）我们可以避免来自父组件的隐式 `prop`传递（在这里我们不知道这个 `prop` 是由 `HOC` 还是底层组件消费的），并尝试在增强组件时从一开始就传递 `props`。

然而，最终，这些参数（这里是具有 `errorText` 和 `loadingText`的对象）在增强组件时传递的是静态的。我们不能在此处与父组件的任何 `props` 进行插值，因为我们是在任何组件外部创建组合组件。例如，在数据获取示例中，我们将无法引入灵活的用户 `ID`：

```
const UserWithData = compose(
  withFetch('https://api.mydomain/user/1'),
  withFetch('https://api.mydomain/user/1/profile'),
)(User);

const App = () => {
  ...

  return (
    <UserWithData
      columns={columns}
    />
  );
};


```

尽管有办法克服这个问题，但这并不会使整个传递 props 的过程更容易理解：

```
const UserWithData = compose(
  withFetch(props => `https://api.mydomain/user/${props.userId}`),
  withFetch(props => `https://api.mydomain/user/${props.userId}/profile`),
)(User);

const App = () => {
  ...

  const userId = '1';

  return (
    <UserWithData
      userId={userId}
      columns={columns}
    />
  );
};


```

通过增加另一个挑战使这种情况变得更加复杂：如果第二个请求依赖于第一个请求会发生什么？例如，第一个请求返回一个用户`ID`，第二个请求基于我们只能通过第一个请求获得的 `profileId` 返回一个用户的配置文件：

```
const UserProfileWithData = compose(
  withFetch(props => `https://api.mydomain/users/${props.userId}`),
  withFetch(props => `https://api.mydomain/profile/${props.profileId}`),
)(UserProfile);

const App = () => {
  ...

  const userId = '1';

  return (
    <UserProfileWithData
      columns={columns}
      userId={userId}
    />
  );
};


```

我们在这里引入了两个紧密耦合的`HOCs`。在另一个解决方案中，我们可能已经创建了一个强大的`HOC` 来解决这个问题。然而，这告诉我们，创建相互依赖的`HOCs` 是困难的。

相比之下，让我们再次看看这个混乱是如何由`React Hooks`解决的：

```
const App = () => {
  const userId = '1';

  const {
    data: userData,
    isLoading: userIsLoading,
    error: userError
  } = useFetch(`https://api.mydomain/user/${userId}`);

  const profileId = userData?.profileId;

  const {
    data: userProfileData,
    isLoading: userProfileIsLoading,
    error: userProfileError
  } = useFetch(`https://api.mydomain/user/${profileId}/profile`);

  if (userError || userProfileError) {
    return <div>Something went wrong ...</div>;
  }

  if (userIsLoading || userProfileIsLoading) {
    return <div>Is loading ...</div>;
  }

  return (
    <User
      user={userData}>
      userProfile={userProfileData}
    />
  );
};


```

因为 `React Hooks` 可以直接在函数组件中使用，它们可以相互依赖，如果它们彼此依赖，传递数据也是直截了当的。再次，这里也没有真正的黑盒，因为我们清楚地看到需要传递给这些自定义`hooks` 的信息以及它们输出的信息。使用相互依赖的 `React Hooks` 时，依赖关系比使用`HOCs`更加显式。

HOCs可以从组件中遮蔽复杂性（例如，条件渲染、受保护的路由）。但正如最后的情景所示，它们并不总是最佳解决方案。因此，我的建议是改用 `React Hooks`。