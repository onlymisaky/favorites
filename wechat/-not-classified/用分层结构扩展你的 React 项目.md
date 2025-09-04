> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/dEkeyE55hMjrb9AA5rMAHA)

前言

Layered React Structure（LRS）是一种旨在清晰分层、高效开发和维护大型 React 项目的方法论，强调组件和逻辑的分层组织，以及如何在 React 项目中更好地测试和样式管理。今日由 @Corbin Crutchley 分享，前端早读课文章 @飘飘翻译。

译文从这开始～～

我刚开始做 Web 开发的时候，是在一个 Angular 2 项目里工作的。Angular 提供了一个明确、有主见且合理布局的风格指南，指导你如何组织项目结构。再加上一系列基于核心构建的官方工具，编写良好的 Angular 应用程序在不同应用之间会显得非常一致。

所以当我接下来参与的项目转向使用 React 时，我感到非常惊讶，因为 React 几乎没有针对大多数开发者的官方库，也没有一个成文的风格指南可供参考。即使我后来做了好几个 React 项目，这种 “不统一” 的感觉一直挥之不去。所以当我开始开发自己的一个（现在已经废弃的）多年的应用项目时，我下定决心要解决这个问题。

这篇文章介绍了我经过多年尝试后总结出来的解决方案，并且也在多个实际生产环境中不断打磨优化。

本文提出了一种组织 React 项目的方法，叫做 “分层 React 结构”（Layered React Structure，简称 LRS）。

LRS 的核心思想是：项目中的每一层都应该能够独立存在，并且可以组合起来更整洁地构建整个应用。采用这种结构，你可以实现以下几个目标：

*   无论项目多大，都能快速找到任何一段代码的位置
    
*   用更贴近用户体验、且一致的方式测试代码
    
*   通过集中逻辑处理，减少系统中的 bug
    
*   降低理解代码逻辑流程的难度
    
*   让开发人员和产品方更快速地迭代 UI
    
*   一旦采用这种结构，不再纠结 “代码该放哪儿” 这种问题
    

#### 前置概念

在深入介绍 LRS 之前，有几个重要的概念我希望先讲清楚。我们先来了解一下我构建 React 应用时的思维方式。

如果你已经了解下面这些概念，可以直接跳到 “文件系统结构示例” 那部分快速了解。

##### 定义 “聪明” 组件和 “傻瓜” 组件

即使是在 React 的早期，你可能就听说过 “智能组件（Smart）” 和 “傻瓜组件（Dumb）” 的说法。它们之所以能在 React 社区流行起来，很大一部分原因是 Dan Abramov 在 2015 年写的一篇文章将这个概念带火了。

其他叫法：这个概念还有不少别称，比如：

*   “胖组件” 和 “瘦组件”
    
*   “容器组件” 和 “展示组件”
    
*   “有状态组件” 和 “纯组件”
    
*   “页面（Screens）” 和 “组件（Components）”
    
*   以及更多其他说法
    

虽然 Dan 之后对这个概念有了不同的看法，但我自己在实践中逐渐接受并欣赏 “智能” 与 “傻瓜” 组件的区别。

在此不赘述他的整篇文章，下面是这个概念的核心：

**“智能” 组件负责处理应用的业务逻辑：**

```
 // This is an example of a "smart" component
functionUserTable(){
     const{data, error, isLoading}=useQuery(/* ... */)
     useEffect(()=>{
         if(!error)return;
         logError(error);
     },[error])
     if(isLoading){
         return<LoadingIndicator/>
     }
     if(error){
         return<ErrorScreen error={error}/>;
     }
     return(
         /* ... */
     )
 }

```

**“傻瓜” 组件则负责应用的展示和样式处理：**

```
 // 这是一个“傻瓜”组件的示例
 function LoadingIndicator() {
     return <>
         <p>加载中...</p>
         <svg class="spinner">
             {/* ...*/}
         </svg>
     </>
 }

```

##### “智能” 组件 vs “傻瓜” 组件的经验法则

关于 “智能” 组件和 “傻瓜” 组件的争论有很多不同的说法，但以下是我在实际开发中总结的一些通用经验法则。我建议你在使用 LRS（分层结构）时遵循这些规则。

**“傻瓜” 组件可以包含状态和逻辑，但只能与 UI 相关，不能处理业务逻辑。**

```
 // 这是一个带有状态的“傻瓜”组件示例
functionErrorScreen({ error }){
     // 可以有状态，但仅限于 UI 层面
     const[isExpanded, setIsExpanded]=useState(false);
     consthandleToggle=(event)=>setIsExpanded(event.currentTarget.open);

     return<>
         <p>出现了一个错误</p>
         <details onToggle={handleToggle} open={open}>
             <summary>{isExpanded ?'隐藏错误详情':'显示错误详情'}</summary>
             <pre style="white-space: pre-wrap">
                 <code>{error.stack}</code>
             </pre>
         </details>
     </>
 }

```

**“傻瓜” 组件只能包含其他 “傻瓜” 组件**

```
 // 千万不要这样做
functionUserListItem({ user }){
     const[isEditDialogOpen, setIsEditDialogOpen]=useState(false);
     return<>
         {/* ... */}
         <button onClick={()=>setIsEditDialogOpen(true)}>编辑</button>
         {/* 这个弹窗包含了编辑用户的业务逻辑 */}
         {isEditDialogOpen &&<EditUserDialog user={user}/>}
     </>
 }

```

应该这样做，把状态提升到父组件：

```
 function UserListItem({ user, openUserDialog }) {
     return <>
         {/* ... */}
         <button onClick={openUserDialog}>编辑</button>
     </>
 }

```

**“傻瓜” 组件不能依赖任何上下文（context）、服务（service）或其他应用依赖项**

```
 // 千万不要这样做
 function ProfileInformation() {
     const user = use(UserData); // 依赖上下文
     return <>
         <p>用户名：{user.name}</p>
         {/* ... */}
     </>
 }

```

正确做法是把数据从外部传进来：

```
 function ProfileInformation({ user }) {
     return <>
         <p>用户名：{user.name}</p>
         {/* ... */}
     </>
 }

```

当然，我也有打破这个规则的时候，但仅限于以下几类与展示相关的上下文信息：

*   国际化 / 多语言翻译上下文
    
*   UI 主题上下文
    
*   仅影响界面展示的功能开关（feature flags）
    

**“傻瓜” 组件不应该关心数据是如何加载、改变或访问的**

```
 // 不推荐这样写
functionToggleDisplay({ displayInfo }){
   const[open, setOpen]= displayInfo;
   // ...
}

// App 中这样传数据不够灵活
functionApp(){
   const displayInfo =useState(false);
   return<ToggleDisplay displayInfo={displayInfo}/>
 }

```

应该使用更模块化的方式，拆解数据结构：

```
 function ToggleDisplay({ open, toggle }){
   // ...
}

functionApp(){
   const[open, setOpen]=useState(false);
   return<ToggleDisplay open={open} toggle={()=>setOpen(!open)}/>
 }

```

**“聪明” 组件不应该包含任何 HTML 标记，也不应该带有样式**

```
 // 千万不要这样做
 function App() {
     return <div style={{ minHeight: '100vh' }}>
       {/* ... */}
   </div>
 }

```

正确做法是将样式抽离到独立的组件或文件中：

```
 function App() {
   return <Layout>
       {/* ... */}
   </Layout>
 }

```

#### 区分工具函数（Utilities）和服务（Services）

2015 年，JavaScript 引入了 Promises，作为解决 “回调地狱”（也被戏称为 “圣诞树结构”）的一种方式。但在 2017 年左右，直到 async 和 await 在生态系统中得以实现，它们才变得易于使用。

```
 // 使用 Promise
functionmain(){
   returnsleep(1)
       .then(()=>{
       console.log("已过去 1 秒");
       returnsleep(1);
       })
       .then(()=>{
         console.log("已过去 2 秒");
       })
}

// 使用 async/await
asyncfunctionmain(){
   awaitsleep(1);
   console.log("已过去 1 秒");
   awaitsleep(1);
   console.log("已过去 2 秒");
 }

```

在 JavaScript 中引入 async 和 await API 的一个挑战在于，你现在需要有意识地区分 “同步代码” 和 “异步代码”，就像是给代码 “上色” 一样。

虽然上面提到的那篇文章的作者认为这种区分是不好的，但我反而更接受这种思维方式，并理解同步代码和异步代码各自的优缺点。

毕竟，即使是同步代码，也可能引入副作用，比如这样：

![](https://mmbiz.qpic.cn/sz_mmbiz/meG6Vo0MevhYzvzEMANicBrbnZTnHI8amuC7Z9rgkOU0tibrPRXzuXtFs7L7hQVHAJkOAAIDayPPFWqicUnGEoE3Q/640?wx_fmt=other&from=appmsg#imgIndex=0)

值得注意的是，大多数同步函数其实是可以保持纯净（无副作用）的，这是可以通过设计规避副作用的。

而异步函数则不同，它们天生就带有副作用，因为它们通常用于与 I/O（输入输出）交互，比如读取文件、请求接口等。

正因如此，我认为将 “同步工具函数” 和 “异步函数” 区分开来是非常有价值的。

因此，我习惯将同步的工具函数称为 **utils**，而将类似的异步函数称为 **services**。

#### 理解文件名大小写敏感性

我们快速讲一下计算机是如何处理文件的：

当你写的程序需要读取一个文件时，它会调用操作系统的内核。内核是一段非常底层的代码，用来连接你电脑的硬件和软件系统。

![](https://mmbiz.qpic.cn/mmbiz_svg/Tjnia6K0WAwyKU1rKibcOM4E4Rcvg1BpD4kwWJ41rbBMgRmf0PCyrOgpWNRukLd9ejxDXK7ibDCxLzZiaMLkmWwmw5uibo7OwJvQ8/640?wx_fmt=svg&from=appmsg#imgIndex=1)

当你在写入文件时，内核会调用磁盘驱动程序，并与磁盘上的文件结构进行交互。

这些文件结构，通常被称为文件系统（filesystem），是由操作系统在格式化磁盘时（手动或系统安装时）创建的。不同操作系统有各自默认的文件系统：

<table><thead><tr><th><section>操作系统</section></th><th><section>默认文件系统</section></th></tr></thead><tbody><tr><td><section>Windows</section></td><td><section>NTFS（New Technology File System）</section></td></tr><tr><td><section>macOS</section></td><td><section>APFS（Apple File System）</section></td></tr><tr><td><section>Linux</section></td><td><section>EXT4（第四代扩展文件系统）</section></td></tr></tbody></table>

每种文件系统都有各自的优缺点，但其中对 Web 开发者来说最重要的区别是：文件名的大小写敏感性。

来看下面两个文件名：

*   `test.txt`
*   `tEsT.txt`

在 Windows 和 macOS 中，这两个文件通常会被当作同一个文件处理；但在 EXT4，也就是大多数 Linux 系统中，它们会被视为两个完全不同的文件。

换句话说，在 Linux 上，你真的可以同时在同一个文件夹中存在这两个文件。

值得一提的是，APFS 实际上可以配置为区分大小写，甚至现在的 Windows 也可以通过手动命令启用某些文件夹的大小写敏感性。

不过话虽如此，大多数机器在出厂或初始设置时并不会默认启用这些设置。

因此，我强烈建议你将所有文件名保持小写，并使用 kebab-case 命名风格，以避免在 Linux 和 macOS/Windows 之间因文件名差异引发难以调试的问题，尤其在 CI/CD 流程和本地环境之间切换时尤为重要。

#### 引入分层 React 项目结构（LRS）

现在我们已经了解了一些基础知识，终于可以正式介绍 LRS（Layered React Structure）是什么了。

以下是 LRS 实际应用中的一个目录结构示例：

```
 src/
 ├── assets/        // 非代码资源，比如图片、字体等
 ├── components/    // 所有“傻瓜”组件
 │   ├── button/
 │   │   ├── button.module.scss
 │   │   ├── button.stories.ts      // Storybook 文件
 │   │   ├── button.spec.tsx        // 可选的单元测试
 │   │   ├── button.tsx
 │   │   └── index.ts
 │   └── input/
 ├── constants/     // 所有非逻辑性的硬编码值
 ├── hooks/         // 所有与 UI 无关的 React 自定义 Hook
 ├── services/      // 所有 I/O 操作相关的代码
 ├── types/         // TypeScript 类型定义
 ├── utils/         // 所有与 React 无关的通用工具函数
 ├── views/         // 页面、路由或视图组件
 │   └── homescreen/
 │       ├── components/               // 此视图专属的展示组件
 │       ├── homescreen.spec.tsx      // 集成测试文件
 │       ├── homescreen.stories.tsx   // 可选的 Storybook 文件
 │       ├── homescreen.module.scss   // 样式文件
 │       ├── homescreen.ui.tsx        // 展示组件，负责布局
 │       ├── homescreen.view.tsx      // “聪明”组件，处理逻辑和数据
 │       └── index.ts
 ├── app.tsx         // 应用入口，可包含 Provider，但不应承担过多职责

```

在 LRS 中，所有非源码的配置文件（如 `.storybook`、`.eslintrc.json` 等）必须放在 `src` 目录之外。

还不知道什么是 Storybook？测试该用什么工具？UI 组件又该如何处理？

#### 别担心！

你可能已经有一些 React 的经验，甚至遇到过我上面提到的问题。如果还没有，接下来我们将深入剖析为什么这种结构好用，并介绍实现它所需的工具。

##### LRS 中的共享代码

在 LRS 中，我们在项目根目录下为不同用途创建了多个子目录。不过，这些目录（如 `utils`、`services`、`components` 等）也可以存在于具体的视图目录中：

```
 views/
 └── homescreen/
     ├── components/
     ├── utils/
     ├── services/
     ├── homescreen.ui.tsx
     └── homescreen.view.tsx

```

这种做法可以让你按功能划分（feature-scope）特定的工具和服务，同时又保留了跨多个视图共享代码的能力。

##### LRS 中的基于文件的路由

你可能会说，“我用的是 Next.js 或 TanStack Router，必须把路由放在特定的文件夹中，该怎么办？”

其实很简单：把你的 `pages` 或 `app` 目录当作 `views` 的壳就可以了。

```
 // app/page.tsx
import{ Homescreen }from"../views/homescreen/homescreen.view";

exportdefaultfunctionHomescreenPage(){
   return<Homescreen />;
 }

```

就这么简单！😄

##### LRS 推荐使用的工具

以下是我在实际项目中建议与 LRS 一起使用的一些工具。这些工具要么能节省开发时间，要么能提升开发效率。

⚠️ 注意：  
这一部分带有比较多的主观意见。虽然我推荐这些工具，但即使不使用它们，你依然可以构建出结构良好的 React 应用。

**逻辑测试**

你可能听说过 Kent C Dodds，他是 Testing JavaScript、Epic React、Epic Web 等课程的作者。他的一篇热门文章《Write tests. Not too many. Mostly integration.》强调应优先编写集成测试。

![](https://mmbiz.qpic.cn/sz_mmbiz/meG6Vo0MevhYzvzEMANicBrbnZTnHI8amhrkFdard2XTKrQbHFOOuQqEc4Alz5bDOXvOAqVcBSMF4dGEcGsw7ZQ/640?wx_fmt=other&from=appmsg#imgIndex=2)

他提出了 “测试奖杯” 模型，从上到下分别是：

*   端到端测试（End-to-End）
    
*   集成测试（Integration）
    
*   单元测试（Unit）
    
*   静态测试（Static）
    

Kent 是 “Testing Library” 的作者，目前这个测试库已经支持多种框架。我推荐以下测试相关工具：

*   **Vitest**
*   **DOM Testing Library**
*   **React Testing Library**
*   **User Event**
*   **Jest DOM**
    
    （也支持 Vitest）
    
*   **MSW**
    
    （Mock Service Worker）
    

⚠️ 我不建议使用 React Hooks Testing Library。这个库已经很久没有维护了，而且鼓励了一些不太好的测试实践。

你可以使用这些工具，编写模拟真实用户行为的测试，比如：

```
 import { describe, expect, it, afterEach, beforeAll }from"vitest";
import{ render, screen, waitFor }from"@testing-library/react";
import userEvent from'@testing-library/user-event';
import{ http }from"msw";
import{ setupWorker }from'msw/browser';
import{ PeopleView }from"./people.view";
import{ createPersonHobbiesUrl }from"../../services/people";

const user = userEvent.setup();
const worker =setupWorker();

beforeAll(()=> worker.start());
afterEach(()=> worker.resetHandlers());

describe("PeopleView",()=>{
     it("允许用户为人物添加爱好",async()=>{
         worker.use(http.post(createPersonHobbiesUrl,()=> HttpResponse.json({
             hobbies:[{id:"0",name:"去健身房"}]
         })));

         render(<PeopleView />);
         expect(screen.getByText("暂无爱好")).toBeInTheDocument();
         await user.type(screen.getByLabelText("新爱好名称"),"做点有趣的事");
         await user.click(screen.getByText("添加爱好"));
         awaitwaitFor(()=>expect(screen.getByText("去健身房")).toBeInTheDocument());
     });
});

```

**测试运行器（Test Runner）**

你可能会问，为什么我推荐 Vitest 而不是更常见的 Jest？

最主要的原因：Vitest 支持浏览器模式（browser mode）。

![](https://mmbiz.qpic.cn/sz_mmbiz/meG6Vo0MevhYzvzEMANicBrbnZTnHI8amerZdLqlicdDmGAC9UgnXwFYnedSnOfPA5HoUgib7cgwOlOia1l6fVsoMQ/640?wx_fmt=other&from=appmsg#imgIndex=3)

Jest 使用的是 JSDom，这虽然模拟了浏览器环境，但调试体验不佳。而 Vitest 可以在真实浏览器中运行测试，调试更轻松。

**UI 测试与组件库**

很多团队一开始不太愿意自建 UI 库，但事实上几乎所有进入生产阶段的应用最终都会形成自己的可复用组件库。

你可以选择像 MUI 或 Ant Design 这样的库作为基础，但迟早会有一套属于自己的组件体系。

![](https://mmbiz.qpic.cn/sz_mmbiz/meG6Vo0MevhYzvzEMANicBrbnZTnHI8am8cIe3ZPiaicRskck6rdicGZQhjnBKxJVm5U3Oiaoxh1bjibfrvmVibfV7Mmg/640?wx_fmt=other&from=appmsg#imgIndex=4)

建议你使用 Storybook 来管理所有共享组件，它可以：

*   集中预览和管理所有 UI 元素
    
*   自动生成文档
    
*   支持组件演示和测试
    

![](https://mmbiz.qpic.cn/sz_mmbiz/meG6Vo0MevhYzvzEMANicBrbnZTnHI8amEEcxH1nkTKzkHOJLWEuL1F2xq7VovEvYk1iaSl2rZ1ibLcJIbMeX2s3w/640?wx_fmt=other&from=appmsg#imgIndex=5)

例如一个简单的 Storybook 示例：

```
 import type { Meta, StoryObj }from'@storybook/react';
import{ Button }from'./Button';

constmeta: Meta<typeof Button>={
   component: Button,
};
exportdefault meta;

 type Story = StoryObj<typeof Button>;

exportconstPrimary: Story ={
   args:{
     primary:true,
     label:'按钮',
   },
};

```

**样式管理**

最后一个建议：将样式文件从组件中拆分出来。

这不是工具的强制要求，而是我从 Angular 开发经验中继承下来的好习惯。你可以使用：

*   CSS/SCSS Modules
    
*   Vanilla Extract
    
*   或者用 Tailwind，但请把类名抽到一个模板字符串中
    

这样做可以保持组件文件简洁、结构清晰，便于组合和维护。

#### 总结

我知道，有些人可能会觉得这种项目结构没什么特别的，甚至是 “理所当然” 的。但我想说，这并不是抄来的结构，而是我在快速原型开发中不断踩坑、不断试验总结出来的。

直到后来我发现像 Bulletproof React 这样的方案，也在用类似的方法时，才意识到 —— 我们其实走到了类似的地方。

正如 Steve Jobs 在 1998 年所说：

“专注与简洁一直是我的信条。简单比复杂更难：你必须努力理清思路才能做到简单。但一旦做到了，就能创造奇迹。”

希望这篇文章能对你和你的团队有所启发。

关于本文  
译者：@飘飘  
作者：@Corbin Crutchley  
原文：https://playfulprogramming.com/posts/layered-react-structure