> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/0-cUZ_DBaMZawBXAVCz0wQ)

> 本文作者为 360 奇舞团前端开发工程师

Hookstate
---------

### 前言

作为 React 开发人员，管理中型应用程序的状态可能很困难。在开发小型应用程序时，将状态从一个组件传递到另一个组件相对简单。当应用程序的规模发生变化时，就会变得不方便，因为你需要无层级关系组件状态的互相访问支持。

Hookstate 是一个完全基于 React 状态 hook 的状态管理库。它实施简单、快速、直接且可扩展。不需要模版，它也可以在 Next.js 应用程序中使用。

在本文中，我们将了解如何使用这个库，它是最用户友好的 React 状态管理库之一。

### 开始使用 Hookstate

在本节中，我们将使用下面的代码块创建一个 React 应用程序：

```
npx create-react-app react-hookstatecd react-hookstate
```

要安装所需的库，请使用以下代码块之一：

```
npm install --save @hookstate/core @chakra-ui/react @emotion/react @emotion/styled framer-motion axios
```

或者

```
yarn add  @hookstate/core @chakra-ui/react @emotion/react @emotion/styled framer-motion axios
```

### Local state

一般来说，当父组件、子组件或仅父组件使用状态时，建议在 React 应用程序中使用本地状态。当多个组件共享一个状态并且应用程序中的每个组件都可以通过这种方式访问该状态时，建议使用全局状态。

为了展示 Hookstate 如何在本地处理状态，我们将利用 useHookstate.

```
import React from "react";import { useHookstate } from "@hookstate/core";import { Box, Button, Flex, Text } from "@chakra-ui/react";const App = () => {  const state = useHookstate(0);  return (    <Box      display="flex"      flexDirection="column"      justifyContent="center"      alignItems="center"      maxW="1440px"      minH="100vh"      m="auto"    >      <Text textAlign="center" fontWeight="700" fontSize={{base: "32px", md: "64px"}}>        Counter value: {state.get()}{" "}      </Text>      <Flex gap={4}>        <Button onClick={() => state.set((p) => p + 1)} bg="green" color="#fff">Increment</Button>        <Button onClick={() => state.set((p) => p - 1)} bg="red" color="#fff">Decrement</Button>      </Flex>    </Box>  );};export default App;
```

上面的代码显示了一个计数器应用程序以及我们如何使用 useHookstate，给变量赋值后 state，我们将默认值设置为 0 并使用 set 和 get 方法 useHookstate。set 方法用于改变状态，而 get 方法获取状态的值。![](https://mmbiz.qpic.cn/sz_mmbiz_gif/cAd6ObKOzEA2TKoTJQicNL9N81ZbPicpM9cu4txBuJCjzbxdeRSuuRxSVIDuiazHz2eY8o7SKJa4SKibfe3icOwZE0A/640?wx_fmt=gif&from=appmsg)

### Global state

在本节中，我们将了解如何在全局级别管理应用程序中的状态。与上一节一样，这次状态将是全局的，并且可以从应用程序中的任何位置访问。

创建一个新目录 src/store/index.js 并将以下代码块粘贴到其中：

```
import { hookstate, useHookstate } from "@hookstate/core";const initialState = hookstate({  count: 0,});export const useGlobalState = () => {  const state = useHookstate(initialState);  return {    getCount: () => state.count.value,    increment: () => {      state.count.set((count) => count + 1);    },    decrement: () => {      state.count.set((count) => count - 1);    },  };};
```

在前面的代码块中，我们声明了应用程序的 initialState，它有一个包含 的对象 count，其值设置为 0。

接下来，我们创建了一个名为 useGlobalState 的自定义 hook，并将参数传递 initialState 给 useHookstate。我们在返回块中有三个函数来读取和修改状态。

要全局访问状态，我们必须首先修改 App.js 组件。

```
import React from "react";import { Box, Button, Flex, Text } from "@chakra-ui/react";import { useGlobalState } from "./store";const App = () => {  const state = useGlobalState();  const increment =()=> {    state.increment()  }  const decrement =()=> {    state.decrement()  }  return (    <Box      display="flex"      flexDirection="column"      justifyContent="center"      alignItems="center"      maxW="1440px"      minH="100vh"      m="auto"    >      <Text textAlign="center" fontWeight="700" fontSize={{base: "32px", md: "64px"}}>        Counter value: {state.getCount()}{" "}      </Text>      <Flex gap={4}>        <Button onClick={() => increment()} bg="green" color="#fff">Increment</Button>        <Button onClick={() => decrement()} bg="red" color="#fff">Decrement</Button>      </Flex>    </Box>  );};export default App;
```

我们现在可以通过访问全局状态 useGlobalState，这是从 导入的自定义 hook，我们将其设置为在更新的组件中 src/store/index.js 调用的变量。我们现在可以全局访问读取和改变状态。stateApp.js![](https://mmbiz.qpic.cn/sz_mmbiz_gif/cAd6ObKOzEA2TKoTJQicNL9N81ZbPicpM9cu4txBuJCjzbxdeRSuuRxSVIDuiazHz2eY8o7SKJa4SKibfe3icOwZE0A/640?wx_fmt=gif&from=appmsg)

### 具有 CRUD 功能的全局状态

在本节中，我们将创建一个 CRUD 应用程序。这将展示如何管理应用程序状态的真实示例。

我们将创建一个简单的博客应用程序，第一种方法是创建应用程序的状态和改变它的函数。

将以下代码块添加到 src/store/index 文件中。

```
import { hookstate, useHookstate } from "@hookstate/core";const initialState = hookstate({  blog: [],});export const useGlobalState = () => {  const state = useHookstate(initialState);  return {    getCountBlog: () => state.blog.length,    addBlog: (blog) => {      state.blog.merge([blog]);    },    updateBlog: (id, blog) => {      state.blog.set((b) =>        b.map((blogs) => {          if (blogs.id === id) {            blogs.content = blog.content;          }          return blogs;        })      );    },    deleteBlog: (id) => {      state.blog.set((blogs) => blogs.filter((blog) => blog.id !== id));    },    fetchBlogs: () => state.blog,  };};
```

我们在上面的代码块中为应用程序创建了五个不同的函数，这些函数可以读取和修改状态。例如 addBlog，该函数使用 merge，它会部分更新应用程序的现有状态。

我们将在 App.js 中创建与 src/store/index.

```
import React, { useEffect, useState } from "react";import {  Box,  Button,  Card,  CardBody,  CardFooter,  Flex,  Image,  Input,  Stack,  Text,} from "@chakra-ui/react";import { useGlobalState } from "./store";const App = () => {  const state = useGlobalState();  const [data, setData] = useState([]);  const [content, setContent] = useState("");  const [edit, setEdit] = useState(false);  const [updateId, setUpdateId] = useState(0);  const fetchBlog = () => {    setData(state.fetchBlogs());  };  useEffect(() => {    fetchBlog();    // eslint-disable-next-line react-hooks/exhaustive-deps  }, []);  const addBlog = () => {    const blog = {      id: state.getCountBlog() + 1,      content: content,    };    state.addBlog(blog);    setContent("");  };  const updateBlog = (id) => {    const blog = {      id,      content,    };    state.updateBlog(id, blog);    setContent("");    setUpdateId(0);    setEdit(false);  };  const deleteBlog = (id) => {    state.deleteBlog(id);  };  return (    <Box      display="flex"      flexDirection="column"      justifyContent="flex-start"      alignItems="center"      maxW="1440px"      minH="100vh"      m="auto"    >       <Box        width={{ base: "auto", md: "700px" }}        minH="100vh"        mt="0rem"        bg={{ base: "transparent", md: "blackAlpha.400" }}        p={8}      >        <Text fontSize="28px" fontWeight="600" mb={4}>          Blog posts: {state.getCountBlog()}        </Text>        <Flex>          <Input                        value={content}            onChange={(e) => setContent(e.target.value)}            errorBorderColor="crimson"            placeholder="Enter Quote"            borderInlineEndRadius={0}          />          {edit ? (            <Button              onClick={() => updateBlog(updateId)}              borderInlineStartRadius={0}              bg="green"              color="#fff"            >              Update            </Button>          ) : (            <Button onClick={addBlog} borderInlineStartRadius={0} bg="green" color="#fff">              Add            </Button>          )}        </Flex>        <Box my={8}>          {data.length < 1 && (            <Text py={4} textAlign="center">              No blog post found            </Text>          )}          {data &&            data.map((item, index) => (              <Card                key={index}                direction={{ base: "column", sm: "row" }}                overflow="hidden"                variant="outline"                my={4}              >                <Image                  objectFit="cover"                  maxW={{ base: "100%", sm: "200px" }}                  src="https://images.unsplash.com/photo-1667489022797-ab608913feeb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHw5fHx8ZW58MHx8fHw%3D&auto=format&fit=crop&w=800&q=60"                  alt="Caffe Latte"                />                <Stack w="full">                  <CardBody>                    <Text fontSize="24px" fontWeight="600" py="2">                      {item.get(item).content}                    </Text>                  </CardBody>                  <CardFooter display="flex" justifyContent="flex-end" gap={4}>                    <Button                      onClick={() => {                        setContent(item.get(item).content);                        setEdit(true);                        setUpdateId(item.get(item).id);                      }}                      bg="blue"                      color="#fff"                    >                      Edit                    </Button>                    <Button                      onClick={() => deleteBlog(item.get(item).id)}                      bg="red"                      color="#fff"                    >                      Delete                    </Button>                  </CardFooter>                </Stack>              </Card>            ))}        </Box>      </Box>    </Box>  );};export default App;
```

我们在前面的代码块中创建了命名函数，并将函数从全局状态传递到每个函数中。只需使用 item.get(item).content 或 item.value.content 在 Hookstate 中显示一个值。

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/cAd6ObKOzEA2TKoTJQicNL9N81ZbPicpM9DdZvGpz09xZZIbaQ2ESer7u1rcnkAXIdxOa03phWJBM5Thyuj7gamg/640?wx_fmt=gif&from=appmsg)image text

### 异步状态

Hookstate 可以轻松处理异步数据，执行 API 调用直至解析。异步数据可以全局存储，并可以从应用程序中的任何位置从存储中访问。

我们将使用下面的代码块创建一个异步状态，该状态将从 API 获取用户列表并在 App.js 组件中显示结果。

```
import { hookstate, useHookstate } from "@hookstate/core";import axios from "axios";const initialState = hookstate(  {    loading: false,    users: [],  });export const useGlobalState = () => {  const state = useHookstate(initialState);  const resourcePath = "https://jsonplaceholder.typicode.com/users";  return {    loading: () => state.loading,    getUsers: async () => {    await axios.get(resourcePath).then((r) => state.users.set(r.data));    state.loading.set(true)    },    fetchUsers: () => state.users,  };};
```

我们将用户添加到应用程序的初始状态，并使用上面的代码块将值设置为空数组。该数组将包含从 API 检索的所有用户的列表。我们还添加了 state loading，其默认值为 false。

接下来，创建了三个可以读取和修改状态的函数。加载函数读取加载状态；getUsers 必须作为访问状态的承诺来处理。fetchUsers 只是返回用户的当前状态。

```
import React, { useEffect, useState } from "react";import {  Box,  Card,  CardBody,  CardFooter,  Image,  Stack,  Text,} from "@chakra-ui/react";import { useGlobalState } from "./store";const App = () => {  const state = useGlobalState();  const [user, setUser] = useState([]);  useEffect(() => {    state.getUsers();    // eslint-disable-next-line react-hooks/exhaustive-deps  }, []);  useEffect(() => {    if (state.loading().value === true) {      setUser(state.fetchUsers());    }  }, [state]);  return (    <Box      display="flex"      flexDirection="column"      justifyContent="flex-start"      alignItems="center"      maxW="1440px"      minH="100vh"      m="auto"    >       <Box        width={{ base: "auto", md: "700px" }}        minH="100vh"        mt="0rem"        bg={{ base: "transparent", md: "blackAlpha.400" }}        p={8}      >         <Text fontSize="28px" fontWeight="600" mb={4}>          User Count: {user.length}        </Text>        <Box my={8}>          {user.length < 1 && (            <Text py={4} textAlign="center">              No user post found            </Text>          )}          {user &&            user.map((item, index) => (              <Card                key={index}                direction={{ base: "column", sm: "row" }}                overflow="hidden"                variant="outline"                my={4}              >                <Image                  objectFit="cover"                  maxW={{ base: "100%", sm: "200px" }}                  src="https://images.unsplash.com/photo-1667489022797-ab608913feeb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHw5fHx8ZW58MHx8fHw%3D&auto=format&fit=crop&w=800&q=60"                  alt="Caffe Latte"                />                <Stack w="full">                  <CardBody>                    <Text fontSize="24px" fontWeight="600" py="2">                      {item.value.name}                    </Text>                  </CardBody>                  <CardFooter                    display="flex"                    justifyContent="flex-start"                    gap={4}                  >                    <Text>{item.value.email}</Text>                  </CardFooter>                </Stack>              </Card>            ))}        </Box>      </Box>    </Box>  );};export default App;
```

和前面一样， getUsers 从全局状态初始化函数并将数据加载到用户中，然后 fetchUsers 仅当 loading 设置为 true 时才能成功检索用户列表。接下来，我们映射来自状态的数据 user 并使用 item.value.name 和 item.value.email 来获取每个项目的值。

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/cAd6ObKOzEA2TKoTJQicNL9N81ZbPicpM9CmFpTAYDRDBwNibxh5Gz60oHnKQRSLQtXTxpMCaMXARNtYicK6VkeiaTA/640?wx_fmt=gif&from=appmsg)image text

### 开发工具

使用开发工具，你可以在 Hookstate 中检查应用程序的状态。它具有已知的最简单的配置；所需要做的就是将第二个参数传递给 hookstate，如下面的代码所示。这对生产应用程序没有不利影响。

```
...import { devtools } from "@hookstate/devtools";const initialState = hookstate(  {    loading: false,    users: [],  },  devtools({ key: "my-state-label" }));...
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEA2TKoTJQicNL9N81ZbPicpM9gCG5iaKWiaaSxwnDppiaGBEA138UMCiaQn5bvliaTGM29icGHOqvia3aZO9iaA/640?wx_fmt=png&from=appmsg)image text

### 结尾

篇幅有限，除以上内容之外 Hookstate 还支持多种自定义扩展，如状态快照、状态校验、数据持久化等。本人使用 Hookstate 开发的体感是优于 redux 系列的。要了解有关 Hookstate 的更多信息，请访问官方文档。

最后觉得文章还不错，帮忙赞一个，多谢。

### 参考文献

https://hookstate.js.org/ 

https://blog.openreplay.com/state-management-in-react-with-hookstate/

- END -

关于奇舞团
-----

奇舞团是 360 集团最大的大前端团队，代表集团参与 W3C 和 ECMA 会员（TC39）工作。奇舞团非常重视人才培养，有工程师、讲师、翻译官、业务接口人、团队 Leader 等多种发展方向供员工选择，并辅以提供相应的技术力、专业力、通用力、领导力等培训课程。奇舞团以开放和求贤的心态欢迎各种优秀人才关注和加入奇舞团。  

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEBLicibtcprJISN18FgTtg2N1ichPnMqRhicrP20VfwnC4vday7gtEoiaSynIH1bas4N5kgicliakrLdtT2Q/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)