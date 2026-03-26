> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/zDbMoldMFKj5WoLgnHG4Pw)

> ❝
> 
> 双脚是大地上飞翔的翅膀
> 
> ❞

大家好，我是**「柒八九」**。一个**「专注于前端开发技术 /`Rust`及`AI`应用知识分享」**的`Coder`。

前言
==

在之前的文章我们讲了很多关于`Rust`的文章。

1.  [致所有渴望学习 Rust 的人的信](https://mp.weixin.qq.com/s?__biz=Mzg3NjU2OTE1Mw==&mid=2247489662&idx=1&sn=e4eba6d631e7aee9838aa974861f10ec&scene=21#wechat_redirect)
    
2.  [Rust 开发命令行工具](https://mp.weixin.qq.com/s?__biz=Mzg3NjU2OTE1Mw==&mid=2247489733&idx=1&sn=e90f57ad50bd7f90392d190333152127&scene=21#wechat_redirect)
    
3.  [用 Rust 搭建 React Server Components 的 Web 服务器](https://mp.weixin.qq.com/s?__biz=Mzg3NjU2OTE1Mw==&mid=2247489899&idx=1&sn=6fc040b1e3e66e5a2ae8083c0dc32a70&scene=21#wechat_redirect)
    
4.  [Rust 编译为 WebAssembly 在前端项目中使用](https://mp.weixin.qq.com/s?__biz=Mzg3NjU2OTE1Mw==&mid=2247490124&idx=1&sn=fc2197871abfee65d8b7d4915d4a2791&scene=21#wechat_redirect)
    
5.  [Game = Rust + WebAssembly + 浏览器](https://mp.weixin.qq.com/s?__biz=Mzg3NjU2OTE1Mw==&mid=2247490949&idx=1&sn=0543ebdd97004bd76e1fcf223a47f751&scene=21#wechat_redirect)
    

从`命令行工具`到`Web服务器`，再到`WebAssembly`。囊括了很多东西，然后呢，今天我们来聊聊**「用`Rust`写一个脚手架」**。

不知道，大家平时在开发中新启动一个项目是如何操作的。

*   `create-react-app`构建一个`react`应用
    
*   `vue-cli`构建一个`vue`应用
    
*   `vite create` 构建一个`react/vue`应用
    

上面的流程是可以的，但是大家是否注意到一点，就是无论哪种处理方式，它仅仅提供了一个`base`，然后你需要根据`自身`业务场景进行配置处理。

那配置一个功能完备的前端就涉及很多东西了

*   组件库
    
*   CSS 预处理器（`scss`/`less`）
    
*   `tailwind`/`css-in-js`
    
*   全局状态管理
    
*   `eslint`+ `oxlint`(最近很火)
    
*   `prettier`
    
*   `husky`
    
*   `axios`
    
*   `TypeScript`
    
*   自定义样式
    
*   路由
    
*   `ErrorBoundary`
    
*   `git`
    
*   处理`Webpack/Vite`的打包配置
    
*   `.gitlab-ci.yml`的配置
    
*   ....
    

等等一系列的东西。

所以，有一个一键创建项目，并且能够拥有上面所有特性的脚手架能够省去多少时间。

这也是，我们写这篇文章的初衷，通过学习这篇文章，我们能够快速构建一个功能完备的前端项目。

![](https://mmbiz.qpic.cn/mmbiz_png/rv5jxwmzMCVhXm5K52f69q8BuYuiaKHzjDLNHCiaude7ibeMKo6W5XytCIrMHkhOkPE2XiahCogmiaibNescEOmUI7aA/640?wx_fmt=png&from=appmsg)![](https://mmbiz.qpic.cn/mmbiz_png/rv5jxwmzMCVhXm5K52f69q8BuYuiaKHzjNBoNibdGa1mq2tX2FIZVebic1LjNvTIIGJYoa8IdKrdicaue5dTkaQofg/640?wx_fmt=png&from=appmsg)![](https://mmbiz.qpic.cn/mmbiz_png/rv5jxwmzMCVhXm5K52f69q8BuYuiaKHzjibD5IUNpq7VNGGeWjfVWsrp7V3WZJx5nODG1RxAYYTkws1fZ1vkk0rQ/640?wx_fmt=png&from=appmsg)![](https://mmbiz.qpic.cn/mmbiz_png/rv5jxwmzMCVhXm5K52f69q8BuYuiaKHzj2ZuBHWXXX6CpMsVcKsk8N28YyBWxCnyRkeD4kztc62819sV0wXlXHg/640?wx_fmt=png&from=appmsg)![](https://mmbiz.qpic.cn/mmbiz_png/rv5jxwmzMCVhXm5K52f69q8BuYuiaKHzjTmkuiahE0JTHGKAb3ueftqsY7JhpjWic4pmGrHuNm0n2T9OgyJoF8GZw/640?wx_fmt=png&from=appmsg)


然后，我们在项目初始化后，通过`npm/yarn`按照好对应的依赖，执行对应的命令就可以开始本地开发了。

> ❝
> 
> 还有几点需要说明，
> 
> 1.  这篇文章不会对每一个方法都详细做解释，并且也不会对最后生成的前端项目做分析。(我们会单写一篇文章，来描述一个功能完备的前端项目该有啥)。
>     
> 2.  由于精力有限，该脚手架只兼容了`React`项目的初始化，对`Vue`项目没做处理，其实处理逻辑也是照猫画虎
>     
> 3.  最后，现在这个版本只限通过 crates.io[1] 进行下载，后期我们会将其发布到`npm`。如果有等不及的小伙伴，可以私聊索要最新版的二进制文件，然后通过在`.bashrc`添加`export PATH="/Users/xx/xx:$PATH"`进行全局安装
>     
> 
> ❞

好了，天不早了，干点正事哇。

![](https://mmbiz.qpic.cn/mmbiz_gif/rv5jxwmzMCVhXm5K52f69q8BuYuiaKHzjPlDCDxgYQ1XuMuTjWZPDs0ISyYbibkSq6yTy778Oic6Ksw53221wRPQQ/640?wx_fmt=gif&from=appmsg)

### 我们能所学到的知识点

> ❝
> 
> 1.  前置知识点
>     
> 2.  项目目录简介
>     
> 3.  项目初始化
>     
> 4.  `main.rs`
>     
> 5.  `content/*`
>     
> 6.  核心函数`create`
>     
> 7.  `utils/logger.rs`
>     
> 8.  其他函数
>     
> 9.  cargo build
>     
> 10.  cargo publish
>     
> 11.  TODO
>     
> 
> ❞

* * *

1. 前置知识点
========

> ❝
> 
> **「前置知识点」**，只是做一个概念的介绍，不会做深度解释。因为，这些概念在下面文章中会有出现，为了让行文更加的顺畅，所以将本该在文内的概念解释放到前面来。**「如果大家对这些概念熟悉，可以直接忽略」**  
> 同时，由于阅读我文章的群体有很多，所以有些知识点可能**「我视之若珍宝，尔视只如草芥，弃之如敝履」**。以下知识点，请**「酌情使用」**。
> 
> ❞

何为脚手架
-----

关于脚手架，我们在[前端工程化之概念介绍](https://mp.weixin.qq.com/s?__biz=Mzg3NjU2OTE1Mw==&mid=2247484622&idx=1&sn=8641716e20fe854d2da33e8343ce46db&scene=21#wechat_redirect)中有过解释，我们就拿来主义了。

> ❝
> 
> 脚手架作为一种创建项目**「初始文件」**的工具被广泛地应用于**「新项目」**或者**「迭代初始阶段」**
> 
> ❞

使用工具替代人工操作能够避免人为失误引起的低级错误，同时结合整体前端工程化方案，快速生成功能**「模块配置」**、**「自动安装依赖」**等，降低了时间成本。

### 脚手架模板

在实际开发中，我们可以通过创建脚手架对应的模板对项目进行**「定制化处理」**。

定制化模板可以**「弥补」**官方提供基础工具集不满足特定需求的场景。

定制化有如下优点 (但有不仅限这些优点)

*   为项目引入**「新的」**通用特性
    
*   针对构建环节的 `webpack/vite` 配置优化，来提升开发环境的效率和生产环境的性能等
    
*   定制符合**「团队内部规范」**的代码检测规则配置
    
*   定制单元测试等**「辅助工具模块」**的配置项
    
*   定制符合团队内部规范的**「目录结构与通用业务模块」**
    

*   业务组件库
    
*   辅助工具类
    
*   页面模板
    

> ❝
> 
> 脚手架的**「功能和本质」**
> 
> 1.  功能是**「创建项目初始文件」**
>     
> 2.  本质是**「方案的封装」**
>     
> 
> ❞

之前，我们在[前端工程化之概念介绍](https://mp.weixin.qq.com/s?__biz=Mzg3NjU2OTE1Mw==&mid=2247484622&idx=1&sn=8641716e20fe854d2da33e8343ce46db&scene=21#wechat_redirect)中写过基于`create-react-app`的脚手架方案，如果有小伙伴的公司还是用`CRA`进行项目初始化，可以参考之前的文章。

* * *

rustup 工具命令
-----------

要查看通过 `rustup` 安装的工具，我们可以使用几个不同的命令来获取不同类型的信息。

### 1. 查看已安装的 Rust 版本

```
rustup show
```

这个命令会显示当前安装的 Rust 版本，包括默认版本、稳定版（stable）、开发版（nightly）和测试版（beta），以及为不同目标平台安装的工具链。

### 2. 列出已安装的目标平台

```
rustup target list --installed
```

这个命令会列出已经为你的 Rust 安装添加的所有目标平台。

### 3. 查看可用的工具链

```
rustup toolchain list
```

此命令将显示已安装的所有 Rust 工具链。

### 4. 查看已安装的组件

对于当前活动的工具链，可以查看已安装的组件（如 rustc、cargo 等）：

```
rustup component list --installed
```

### 5. 更新 Rust 和 rustup

为了确保你的工具是最新的，可以定期运行更新命令：

```
rustup update
```

这个命令会更新所有已安装的工具链。

* * *

2. 项目目录简介
=========

![](https://mmbiz.qpic.cn/mmbiz_png/rv5jxwmzMCVhXm5K52f69q8BuYuiaKHzjTw6r3icqSrJibVkKhM9Xibfob0IlAOocdZdCYsBScOvSQUlqKOQEnDsTg/640?wx_fmt=png&from=appmsg)

今天，我们主要的重点就是介绍`src`里面的内容，然后像`template-react/template-state-redux`我们后续会有专门的文章解释。

然后，`template-customize-hook`的话，可以直接参考我们之前写的[美丽的公主和它的 27 个 React 自定义 Hook](https://mp.weixin.qq.com/s?__biz=Mzg3NjU2OTE1Mw==&mid=2247490072&idx=1&sn=e2398b4567c624fa1b0317c8cd6d222b&scene=21#wechat_redirect)。里面都是一些方便用于我们平时开发的`hook`。

* * *

3. 项目初始化
========

俗话说，擒贼先擒王，那对于`Rust`项目来讲。我们首先要看`Cargo.toml`。

一般我们新建一个`Rust`项目，都是通过`cargo init xx`来初始化项目。

目录结构如下：

```
xxx
├─ src
│  └─ main.rs
└─ Cargo.toml
```

此时的`Cargo.toml`只是初始化一些最基础的配置信息。

```
[package]
name = "xxx" // 项目名称
version = "0.1.0"
edition = "2021"

[dependencies]
```

所以，我们第一步的操作就是处理`Cargo.toml`的配置信息。下面我们就直接贴出了，我们项目最后的配置内容。里面的`[dependencies]`我们在下面代码讲解中介绍。

![](https://mmbiz.qpic.cn/mmbiz_png/rv5jxwmzMCVhXm5K52f69q8BuYuiaKHzjj6Pj4EjPpJz9z4t7xX8fe5gB5XDGlF9KvJQ5V3aD1RwML8GTxoCaVA/640?wx_fmt=png&from=appmsg)

*   `[package]`我们就不需要多介绍了，它主要描述了该项目的一些基本信息。
    
*   `[dependencies]`的话，标注了我们项目中需要引入的第三方`crate`
    

上面有两个东西我们可能感到陌生。

*   `default-run`
    

*   `[package]` 部分中的 `default-run` 字段可用于指定 `cargo run` 选择的默认二进制文件。
    

*   `[[bin]]`
    

*   `二进制目标`是编译后可以运行的可执行程序。默认二进制文件名是 `src/main.rs`，默认为包的名称。其他二进制文件存储在目录中`src/bin/`。
    

想更过了解`Cargo.toml`的配置属性，可以参考 Manifest Format[2]

* * *

4. main.rs
==========

在`vscode`中我们使用`Ctrl+K+0`折叠所有的代码块，然后依据逻辑和功能划分。可以将`main.rs`划成 5 部分，如下图。

![](https://mmbiz.qpic.cn/mmbiz_png/rv5jxwmzMCVhXm5K52f69q8BuYuiaKHzj5vfwEdnOYlxq5f1NZ7O9OXGax7TTz7FUkbAFjA04IkKzPPNE0EDu2w/640?wx_fmt=png&from=appmsg)

下面就按照上面的划分进行代码的解析。

4.1 引入子模块和第三方库
--------------

### 引入子模块

```
mod content;mod utils;use content::project;use utils::logger;use crate::project::CreationOptions;
```

*   **「mod」**:
    

*   `mod`关键字在`Rust`中用于**「声明模块」**
    
*   `mod content;` 和 `mod utils;` 是声明两个模块`content`和`utils`。
    

*   **「use」**:
    

*   `use`关键字用于**「将模块或模块中的项引入当前作用域」**，这样我们就可以直接使用它们而不需要前缀。
    
*   上面代码引入了`content`模块中的`project`，`utils`模块中的`logger`，以及当前包中的`project::CreationOptions`。
    

### 引入第三方库

```
use anyhow::Result;use clap::{  Parser,   Subcommand,   ValueEnum,   builder::{EnumValueParser, ValueHint}};use std::path::PathBuf;use dialoguer::{console::Term, theme::ColorfulTheme, Select};
```

1.  anyhow[3] 用于**「简化错误处理」**的库，`Result`是一个枚举，代表操作可能的成功（`Ok`）或失败（`Err`）。
    
2.  clap[4] 用于**「解析命令行参数」**。`Parser`, `Subcommand`, `ValueEnum`, `EnumValueParser`, 和 `ValueHint` 是用来定义如何解析命令行参数和如何与它们交互的工具。
    
3.  `use std::path::PathBuf;`引入了标准库`std`中的`path::PathBuf`，它是路径的所有权变体，用于跨平台的路径操作。
    
4.  dialoguer[5] 是一个用于**「创建命令行交互」**的库。这里引入了`Term`用于表示终端，`ColorfulTheme`用于定义交互的主题风格，以及`Select`用于创建选择菜单。
    

* * *

4.2 定义行命令枚举参数
-------------

其实这部分很简单就是定义了几个公共类型的枚举。

我就拿其中一个作为例子来讲解。

```
#[derive(Clone, Copy, Debug, PartialEq, Eq, ValueEnum)]pub enum StateManagement {    Redux,    Zustand,    Recoil,    Jotai,    MobX,    Valtio,}
```

*   `pub enum StateManagement` 声明了一个公开的枚举类型`StateManagement`。
    
*   `Redux`/`Zustand`/`Recoil`/`Jotai`/`MobX`/`Valtio`是这个枚举的变体，分别代表了现在最流行的`React`状态管理方案。
    

> ❝
> 
> 针对状态管理器按照功能分类，其实，应该是 3 大类，
> 
> 1.  基于`Reducer`的`Redux`和`Zustand`
>     
> 2.  基于`Atom`的`Recoil`和`Jotai`
>     
> 3.  基于`Mutable`的`MobX`和`Valtio`
>     
> 
> ❞

这个我们后期会专门写一篇文章来解释的。

细心的你，会发现在每个枚举上都有`#[derive(Clone, Copy, Debug, PartialEq, Eq, ValueEnum)]`。

让我们简单介绍一下。

### #[derive]

> ❝
> 
> #[derive][6] 在 `Rust` 中是一个属性（`attribute`），用于自动为某些类型（如`结构体`或`枚举`）派生或实现一些特定的 `trait`。
> 
> ❞

这个特性允许开发者在编写结构体或枚举时避免手动实现一些通用的 `trait`，如 `Clone`, `Copy`, `Debug`, `PartialEq`, `Eq` 等，从而减少重复代码，并使得代码更加简洁。

当我们使用 `#[derive]` 属性时，编译器会为指定的类型自动实现这些 trait 的功能。例如，如果使用 `#[derive(Debug)]`，`Rust` 会为你的类型生成一个格式化输出的实现，这样我们就可以使用占位符 `{:?}` 来打印该类型的值。

像枚举上面的`#[derive(Clone, Copy, Debug, PartialEq, Eq, ValueEnum)]`语句。它自动为枚举实现了括号内指定的多个`trait`。

*   **「Clone」**: 允许这个枚举的实例被复制。
    
*   **「Copy」**: 允许这个枚举的实例在赋值时被复制（与 Clone 相似，但适用于更简单的值）。
    
*   **「Debug」**: 允许实例可以被格式化输出，主要用于调试。
    
*   **「PartialEq」**: 允许实例可以被比较是否相等。
    
*   **「Eq」**: 表示这个枚举的相等比较是反射性的，对称的和传递的。
    
*   **「ValueEnum」**: 这是来自第三方库`clap`的一个 trait，允许这个枚举可以被用作命令行参数的值。
    

* * *

4.3 命令行结构体
----------

```
#[derive(Parser)]#[command(    name = "f_cli",    author,    version,    about,    args_conflicts_with_subcommands = true )]struct Cli {    #[command(subcommand)]    command: Option<Commands>,    #[arg(help = "可选参数，用于指定新项目的名称", value_hint = ValueHint::DirPath)]    name: Option<String>,}
```

这段代码定义了一个`Cli`结构体，使用`clap`库来自动生成命令行解析的代码。通过`#[derive(Parser)]`，它自动实现了命令行参数的解析功能。`#[command]`属性则用来定义命令行界面的基本元信息和一些特定的行为规则。

让我们来逐一解释

*   `#[derive(Parser)]`:
    

*   这是一个属性，指示编译器自动为`Cli`结构体实现`clap::Parser` trait。而`Parser` trait 是`clap`库提供的，用于**「将结构体转换成命令行解析器」**。
    

*   `#[command(...)]`:
    

*   `#[command]`是`clap`库的一个属性，用于定义命令行工具的**「元信息」**以及一些行为。
    
*   `name = "f_cli"`: 设置命令行工具的名称为`f_cli`。
    
*   `author`: 自动使用`Cargo.toml`中定义的作者信息。
    
*   `version`: 自动使用`Cargo.toml`中定义的版本号。
    
*   `about`: 自动使用`Cargo.toml`中定义的说明信息。
    
*   `args_conflicts_with_subcommands = true`: 这是一个行为设置，指定当存在子命令时，主命令不允许使用与子命令同名的参数。
    

*   `struct Cli` 定义了一个名为`Cli`的结构体，用于表示命令行接口的配置。
    
*   结构体字段
    

*   `command: Option<Commands>,` 字段可能存储一个`Commands`枚举，这个枚举包含不同的子命令。使用`Option`是因为用户可能不提供任何子命令。
    
*   `name: Option<String>,` 字段可能存储一个字符串，这个字符串用于指定新项目的名称。同样使用`Option`是因为这是一个可选参数。
    

* * *

4.4 命令类型
--------

![](https://mmbiz.qpic.cn/mmbiz_png/rv5jxwmzMCVhXm5K52f69q8BuYuiaKHzj54L2YMticiaD7wNmQqhiaOjp57W1PGVgydWLnibxvO81PlnZgunOicj5iacQ/640?wx_fmt=png&from=appmsg)

> ❝
> 
> 这段代码使用`clap`库来定义一个**「命令行接口」**，其中包括一个`Create`子命令用于创建新项目。
> 
> ❞

每个参数和标志都使用`clap`的属性进行了详细的配置，以确保命令行接口的行为符合预期。

结果就是定义了一个名为`Commands`的枚举，用于表示命令行工具的不同命令。此枚举包含一个变体`Create`，代表创建新项目的命令。

最后的效果就是，我们在运行`f_cli`时，我们可以通过`f_cli --help`来获取操作细节。

![](https://mmbiz.qpic.cn/mmbiz_png/rv5jxwmzMCVhXm5K52f69q8BuYuiaKHzjicPGL4PNUhfbo8HSbuIT4GOvlC3y3UuPn4hR0dk73ibhXjeBtdiaMMs9w/640?wx_fmt=png&from=appmsg)![](https://mmbiz.qpic.cn/mmbiz_png/rv5jxwmzMCVhXm5K52f69q8BuYuiaKHzjToB32TAjficpCt9g8dp6m9NNy9ZQ0FnTGdozA7iajoOyPCica56K9hXFA/640?wx_fmt=png&from=appmsg)


*   `#[derive(Subcommand)]`:
    

*   这个属性指示编译器为枚举自动实现`Subcommand` trait，该 trait 是`clap`库中定义的，用于处理子命令。
    

*   `enum Commands`:
    

*   这定义了一个名为`Commands`的枚举，它将被用作主命令的子命令。当前代码中只定义了一个子命令`Create`。
    

### Create 枚举变体解释

`Create`变体用来表示创建项目的命令，并包含多个标记和参数：

1.  `cli_mode`:
    

*   通过`short`和`long`属性定义了短标记`-c`和长标记`--cli`。
    
*   `name`属性描述了参数的名称。
    
*   `help`属性提供了关于此标记的帮助信息。
    
*   `requires`指明了该标记需要与`xx`参数一起使用。
    
*   类型为`bool`，表示这个参数是一个布尔标志。
    

3.  **「name」**:
    

*   代表项目名称的参数。
    
*   `help`属性提供了对此参数的简要说明。
    
*   `value_hint`属性是`clap`提供的特性，这里用`ValueHint::DirPath`表示该参数应该是一个目录路径。
    

5.  **「ui_design」**:
    

*   用于配置 UI 库，允许用户选择预定义的`UIDesign`枚举。
    
*   使用`EnumValueParser`来解析枚举类型的参数。
    
*   `ignore_case`属性设置为`true`表示忽略大小写。
    

7.  `css_pre_processors/hook/state_management`和`ui_design`是类似的配置，这里不在说明
    

`cli_mode`我们需要额外介绍一下。

我们`cli`提供两种构建项目的模式

1.  交互式 - 在命令行中通过上 / 下选择预置的特性
    
2.  默认 - 你需要在创建项目的时候，就需要将需要的特性指定
    

我们可以通过`f_cli create xx -c`来开启`默认模式`![](https://mmbiz.qpic.cn/mmbiz_png/rv5jxwmzMCVhXm5K52f69q8BuYuiaKHzjM6EMneUia8nnxtoEd5Y2qXqqWZLoIPt9laFTTI6WJgxsJ4mWWn1z6pQ/640?wx_fmt=png&from=appmsg)

* * *

4.5 业务主逻辑
---------

这里有两个函数代码

1.  `fn main() -> Result<()>`
    
2.  `fn create_project(...) -> anyhow::Result<()>`
    

### fn main() -> Result<()>

![](https://mmbiz.qpic.cn/mmbiz_png/rv5jxwmzMCVhXm5K52f69q8BuYuiaKHzjmicqYPKaBhJYVtoKwQsQP4ncl5j5Z6un88OBlRicXW1ouiaEx5Rub8Zbw/640?wx_fmt=png&from=appmsg)

这段代码定义了一个使用`clap`库解析命令行参数并根据这些参数执行相应操作的 Rust 程序入口（`main`函数）。

上面代码中对核心步骤已经有了注释，然后我们再将我认为比较核心的点，再简单罗列一下。

*   **「解析命令行参数」**:
    
    ```
    let cli = Cli::parse();
    ```
    

*   这里调用`clap`自动生成的`parse`方法，将命令行参数解析为`Cli`结构体的实例。这个结构体包含了程序运行所需要的所有信息。
    

*   **「检查项目版本」**:
    
    ```
    project::check_cli_version()?;
    ```
    

*   在执行任何操作之前，程序首先调用`check_cli_version`函数来确保用户正在使用的是最新版本的 CLI 工具。
    

其中，最主要的就是基于`match cli.command`进行判断，然后调用`create_project()`

### fn create_project()

这段代码定义了一个名为`create_project`的函数，用于创建一个新的项目。它接受关于项目的多个配置参数，并基于这些参数执行项目的创建逻辑。![](https://mmbiz.qpic.cn/mmbiz_png/rv5jxwmzMCVhXm5K52f69q8BuYuiaKHzjhOoSmGrCTehsTXIZFTAianWXsf2wXhUW93XQ7icZ9doghHxuGZNwlFCg/640?wx_fmt=png&from=appmsg)

> ❝
> 
> 由于篇幅有限，我们将`ui/hook/state`的处理逻辑给折叠了，这块的处理逻辑和`css`是类似的。
> 
> ❞

从函数签名中我们可以看出，大多数参数都是`Option`类型，表示它们是可选的。并且返回值是`anyhow::Result<()>`，表示函数执行可能会有错误。

首先，我们通过**「判断目录是否存在」**, 如果项目名称对应的目录已经存在，则通过`logger::error`打印错误消息并返回。

然后就是通过`match`表达式来选择各种配置信息。(`UI库/CSS预处理器/hook解决方案/状态解决方案`) 等。

我们随便挑一个来简单解释一下。

![](https://mmbiz.qpic.cn/mmbiz_png/rv5jxwmzMCVhXm5K52f69q8BuYuiaKHzjEQGaFxgyAeXVH9MwTCTiaicUmbcdOPUseDYF4w7NKic0yXSwNuvhpSw7Q/640?wx_fmt=png&from=appmsg)

1.  **「Match 表达式」**:
    

*   代码使用`match`表达式来处理`css_pre_processors`。这是`Rust`中的模式匹配，类似于其他语言中的`switch-case`。
    

3.  **「Some 分支」**:
    

*   如果`css_pre_processors`是`Some(css_pre_processors)`（即已经有指定的 CSS 预处理器），那么直接使用该值。
    

5.  **「None 分支」**:
    

*   如果`css_pre_processors`是`None`（即没有指定的 CSS 预处理器），则进一步处理。
    

7.  **「非交互模式下的处理」**:
    

*   如果处于`cli_mode`（非交互模式），则程序不能继续进行，因为 CSS 预处理器是必须的。此时会触发`panic`，输出错误信息并终止程序。
    

9.  **「交互模式下的处理」**:
    

*   如果不是`cli_mode`（即是交互模式），程序会显示交互式菜单让用户选择 CSS 预处理器。
    
*   使用`logger::multiselect_msg`和`logger::message`打印提示信息。
    
*   定义了一个包含`"scss"`, `"less"`, `"stylus"`的向量`items`作为用户的选项。
    
*   使用`Select::with_theme(&ColorfulTheme::default()).items(&items).default(0).interact_on_opt(&Term::stderr())?;`创建一个基于`dialoguer`的交互式选择菜单。
    

11.  **「用户选择处理」**:
    

*   用户的选择被记录在`selection`变量中。
    
*   使用另一个`match`表达式来将用户的选择映射到具体的`CSSPreProcessors`枚举值。
    
*   根据用户选择的索引（0 对应`"scss"`, 1 对应`"less"`, 2 对应`"stylus"`），将其转换为对应的枚举值（`CSSPreProcessors::Sass`, `CSSPreProcessors::Less`, `CSSPreProcessors::Stylus`）。
    
*   如果用户选择了不在列表中的选项，则触发 panic，输出错误信息并终止程序。
    

上面代码是一个典型的交互式命令行选项处理逻辑。它首先检查是否有预先指定的选项，如果没有，则根据是交互模式还是非交互模式来决定如何进一步获取用户的输入。在交互模式下，它使用了`dialoguer`库来创建一个简洁的用户界面，允许用户从预定义的选项中选择。这种方法使得命令行工具既能以非交互方式运行，也能提供友好的交互方式。

针对其他特性的处理也是一样的，我们这里就不过多解释了。

最后，调用`project::create()`，将`project_name`和`CreationOptions`传人其中，在里面做了真正的项目迁移和操作。

针对里面到底发生了啥，我们在下节中详细说明。

* * *

5. content/*
============

用`erd -y inverted`来查看对应的目录信息如下：

![](https://mmbiz.qpic.cn/mmbiz_png/rv5jxwmzMCVhXm5K52f69q8BuYuiaKHzjRLficiacLrXvfS7mGKTThselyw1nWP7JTensGdtlicqZc8miarpRTqicbwQ/640?wx_fmt=png&from=appmsg)

mod.rs
------

`mod.rs`等同于我们前端开发中的每个文件夹下的`index.js`。用于引入子模块信息

```
pub mod project;pub mod update_package_json;pub mod add_customize_hook;pub mod update_state_management;pub mod add_redux_template;
```

project.rs
----------

> ❝
> 
> 可以这么说，`project.rs`算是这个`Rust`的核心方法，他通过调用很多工具方法和第三方库，实现了我们最后真正的前端项目。
> 
> ❞

还是熟悉的味道，使用`Ctrl+K+0`折叠所有的代码块，然后按照功能分为四部分

1.  本地方法和第三方库的引入
    
2.  使用了`RustEmbed`库来嵌入文件夹中的静态文件到二进制中
    
3.  定义数据结构
    
4.  核心函数`create()`
    

> ❝
> 
> 眼尖的同学，可能会说那不是还有一个`check_cli_version()`吗，这个函数在`main.rs`中就调用过，不在`project.create()`中，所以我们这里不做过多的解释。
> 
> ❞

![](https://mmbiz.qpic.cn/mmbiz_png/rv5jxwmzMCVhXm5K52f69q8BuYuiaKHzjHS1ZjEPb7OpywiaianX8mmBib01ZQSictldA3akcd1NP10p1BFHSZQZibOw/640?wx_fmt=png&from=appmsg)

### 库的引入

![](https://mmbiz.qpic.cn/mmbiz_png/rv5jxwmzMCVhXm5K52f69q8BuYuiaKHzjiaHE5M8g3yic3vwD6dricPCWg4wfYlVbBNlrAbYNfiaW5xu5IZBGiaDVOoA/640?wx_fmt=png&from=appmsg)简单的搂上一👀，里面不仅调用了`utils`中的各种工具方法，还有在`main.rs`定义的各种变量`UIDesign/Hook`等，还有和`project.rs`同目录的模块用于对特定的信息进行更新和插入 (`update_project_basic_info`/`update_state_management_by_choose`)。

### Struct Asset

```
#[derive(RustEmbed)]#[folder = "template-react"]struct Asset;
```

> ❝
> 
> 这段代码通过声明一个`Asset`结构体并应用 RustEmbed[7] 宏，指示 Rust 编译时将`template-react`目录下的文件嵌入应用程序内，使得这些文件随应用程序一起编译并可以在运行时访问。
> 
> ❞

虽然，只有 3 行，但是这差不多是比较核心的步骤。

1.  **「#[derive(RustEmbed)]」**:
    

*   这是一个属性宏，它指示编译器为`Asset`结构体自动实现`RustEmbed` trait。`RustEmbed` trait 使得我们可以访问在编译时嵌入到 Rust 程序中的文件。
    
*   使用`RustEmbed`通常是为了将文件（如 HTML, CSS, JavaScript, images 等）打包到编译好的可执行文件中，以便这些文件可以随程序一起分发，并且在运行时无需外部依赖。
    

3.  **「#[folder = "template-react"]」**:
    

*   这是`RustEmbed`特定的属性，用于指定要嵌入的文件夹路径。如上图中所示，它告诉`RustEmbed`将`template-react`文件夹（相对于项目根目录或 Cargo.toml 文件的位置）中的所有内容嵌入到可执行文件中。
    
*   这意味着`template-react`文件夹下的所有文件都会被包含到编译后的程序中，并且可以在程序运行时通过`Asset`结构体访问。
    

5.  **「struct Asset」**:
    

*   这定义了一个名为`Asset`的结构体。结构体本身没有定义任何字段，因为`RustEmbed` trait 为其提供了所需的所有功能。
    

> ❝
> 
> 通常，当我们想将某些静态资源（如配置文件、HTML 模板、JS 脚本、CSS 样式等）直接嵌入到 Rust 应用程序中，以便它们可以作为单个独立的二进制文件分发时，就可以使用`RustEmbed`。
> 
> ❞

### 定义数据结构

```
pub enum DependenciesMod {    Dev,    Prod}pub struct CreationOptions {    pub state:StateManagement,    pub _hook: Hook,    pub css: CSSPreProcessors,    pub ui:UIDesign,    pub cli_mode: bool,}
```

定义了一个`enum DependenciesMod`, 该枚举是用于在安装前端依赖时候，区分该包是属于`dependencies`还是`devDependencies`

而结构体`CreationOptions`用于收集在`create`项目时候，通过`cli`指定的参数。

也就是在`main.rs`调用`project.create()`传人的`CreationOptions`。这个我们在将`main.rs`时解释过。

```
project::create(
    project_name.as_ref(),
    CreationOptions {
        state,
        _hook,
        css,
        ui,
        cli_mode,
    }
)?;
```

### 核心函数`create()`

![](https://mmbiz.qpic.cn/mmbiz_png/rv5jxwmzMCVhXm5K52f69q8BuYuiaKHzjpxiaW5aaDL7pPqhBAvMvHgYkMmIah9oT13Qtxlp8gqejNE9PliawnrJg/640?wx_fmt=png&from=appmsg)

这个方法按功能划分一共分为 5 部分。

1.  初始化项目目录路径`project_dir`
    
2.  遍历`Asset`内部文件，并写入到`project_dir`中
    
3.  修改 package.json 的基础信息
    
4.  依据`cli`的参数，更新`react`项目
    
5.  初始化`git`
    

> ❝
> 
> 由于篇幅有限，所以我们打算详细介绍一下`create()`中的细节，并且会将`content/utils`中的方法，直接拎出来介绍，不会按照文档目录来处理了。
> 
> ❞

* * *

6. 核心函数`create`
===============

6.1 初始化项目目录路径`project_dir`
--------------------------

```
let project_dir: PathBuf = PathBuf::from(project_name);logger::command_tip("创建项目目录...");match std::fs::create_dir_all(&project_dir) {    Ok(_) => {}    Err(err) => logger::exit_error("std::fs::create_dir_all():", err),}
```

1.  初始化项目目录路径:
    

*   使用`PathBuf::from`来将项目名称转换为路径缓冲区（`PathBuf`），这将作为项目目录的路径。
    

3.  创建项目目录:
    

*   调用`std::fs::create_dir_all`尝试创建项目目录。这个函数会创建所有缺失的父目录，确保整个路径都被正确创建。
    
*   使用`match`表达式来处理可能的错误。如果成功，则继续；如果出现错误，则打印错误信息并退出。
    

6.2 遍历`Asset`内部文件，并写入到`project_dir`中
------------------------------------

![](https://mmbiz.qpic.cn/mmbiz_png/rv5jxwmzMCVhXm5K52f69q8BuYuiaKHzjUqfVRibws3ewBD3jhichqXlrVVvibfdrEE74KEjn5sYgwehiba3RpdwW9A/640?wx_fmt=png&from=appmsg)

1.  文件复制:
    

*   使用`Asset::iter()`来遍历`Asset`结构体（由`RustEmbed`生成）中所有的文件。这些文件是在编译时嵌入到二进制中的。
    
*   对于每个文件，使用`Asset::get`来获取其内容（以`Cow<'static, [u8]>`形式）。
    

3.  文件写入:
    

*   为每个文件创建一个文件路径`file_path`，它是项目目录路径和文件名的组合。
    
*   创建文件所在的目录（如果尚不存在）。这是通过取文件路径的`directory_path`并调用`pop`来移除文件名部分实现的。
    
*   使用`std::fs::write`将文件内容写入到目标路径。如果文件已经存在，它将被覆盖。
    

6.3 修改 package.json 的基础信息
-------------------------

```
update_project_basic_info(&project_dir,project_name.to_owned())?;
```

这个函数是用来基于`cli`中的信息来更新`React`项目中的`package.json`的信息的。

它位于和`project.rs`同级目录的`update_package_json.rs`文件中。

![](https://mmbiz.qpic.cn/mmbiz_png/rv5jxwmzMCVhXm5K52f69q8BuYuiaKHzj66odSYtiayGTXuKmjyANdK9UbHsj3WxW4icMROf0HBc2ag26WwH1fWVQ/640?wx_fmt=png&from=appmsg)

其实`update_project_basic_info`中也没啥魔法，基本的思路都是根据路径名称找到路径，并且然后修改文件信息。

但是呢，这里和其他的还有一点不一样的地方就是，这是要修改`json`文件，我们可以借助 serde_json[8] 将`json`文件解析成类似`Object/Map`的数据类型，然后通过`xx.get_mut/insert`等方式修改指定的属性信息。

我们这里只修改了两个地方

1.  基于`cli`参数中的项目名称 - 来修正`package.json`的`name`信息
    
2.  修改版本信息。
    

最后我们调用`serde_json::to_string_pretty(&parsed_json)`将刚才修改后的`json`转换成`String`类型，并调用`fs::wirte()`, 写入到项目中。

6.4 依据`cli`的参数，更新`react`项目
--------------------------

接下来就是处理我们在`cli`中选中的各种特性了（`css/ui/hook/state`）

![](https://mmbiz.qpic.cn/mmbiz_png/rv5jxwmzMCVhXm5K52f69q8BuYuiaKHzjBvSnXvdwW9gRsNRPicQUSSHmsy5wHvPol7Nh7StX7ibrxjibRicc4sfp0w/640?wx_fmt=png&from=appmsg)

看上面截图，其实分俩个操作

1.  根据`creation_options.xx`直接调用`add_dependency_to_package_json()`
    
2.  可能有些操作，还需要额外的模版文件，然后就是将起复制到项目中（`copy_hook_to_project`）
    

我们还是简单来看看相关的逻辑处理。

### add_dependency_to_package_json

这个函数和上面的`update_project_basic_info`位于同一个文件中。（`content/update_package_json.rs`）

![](https://mmbiz.qpic.cn/mmbiz_png/rv5jxwmzMCVhXm5K52f69q8BuYuiaKHzjMB1VhWQc74HuuCpS7zRJOdggcmFwJVSdLlUyjbbmvhpXnB3T6JJ3ibg/640?wx_fmt=png&from=appmsg)

看函数签名，这个函数接收四个变量

1.  project_dir:&std::path::PathBuf,
    
2.  dependency_name:&str,
    
3.  dependency_version:&str,
    
4.  mode:DependenciesMod
    

其实，它的处理逻辑和`update_project_basic_info`很类似，也是通过`project_dir`找到`package.json`, 然后利用`serde_json`处理。

可能唯一不同的就是，我们需要根据`mode`的类型，来决定修改`package.json`中的`devDependencies`还是`dependencies`。

这个时候，就用到我们之前说过的`DependenciesMod`枚举了。

毕竟，我们在开发时候，有些库只需要在开发模式上起作用，然后在生产环境时，它就不需要了。

### copy_xx_to_project

因为，这个版本只做了针对`hook`的文件复制，其实如果后期还有其他的操作的话，这里也可以新增一类，针对`xx`的复制操作。

`copy_xx_to_project()`函数位于`add_customize_hook.rs`中，见名知意，它就是为了将我们自定义的`hook`文件添加到项目中的。

而这个`hook`我们不会陌生，这就是我们之前介绍过的[美丽的公主和它的 27 个 React 自定义 Hook](https://mp.weixin.qq.com/s?__biz=Mzg3NjU2OTE1Mw==&mid=2247490072&idx=1&sn=e2398b4567c624fa1b0317c8cd6d222b&scene=21#wechat_redirect)。

![](https://mmbiz.qpic.cn/mmbiz_png/rv5jxwmzMCVhXm5K52f69q8BuYuiaKHzjCfJfg0viaoTNqPFRSdRZib6mgqAib863GiawJNGV5H0mG8ibgWcJiaUdvbfA/640?wx_fmt=png&from=appmsg)

其实它的内部逻辑也很简单，利用`RustEmbed`指向`template-customize-hook`, 然后遍历其中的文件，然后复制到项目中。

但是呢，和之前利用`RustEmbed`处理`template-react`还不一样，此次操作是，将`template-customize-hook`中的文件，复制到最终项目中的`src/hook`下面。

所以，我们只需要找到`src`, 并且新建一个`hook`文件夹，然后执行复制操作即可。

```
let hook_path = project_dir.join("src").join("hook");std::fs::create_dir_all(&hook_path)?;
```

6.5 初始化`git`
------------

和其他的`cli`一样，我们在新建完项目后，我们还会调用`git init`对项目进行`git`初始化操作，并且配置相关的属性。

![](https://mmbiz.qpic.cn/mmbiz_png/rv5jxwmzMCVhXm5K52f69q8BuYuiaKHzjiaLONLa4Z6j97mdVq3190LXcic9bGiaTUwQjOE0RWNgVJtj5KNQgjTCaw/640?wx_fmt=png&from=appmsg)

看起来有很多命令操作，但是它们的处理逻辑都大差不差。

我们就我们就挑其中一个做一个简单解释。

![](https://mmbiz.qpic.cn/mmbiz_png/rv5jxwmzMCVhXm5K52f69q8BuYuiaKHzj0KGg1Nk2NkAt2JQTibOalXJZvyNg3Zhy6ClPFQ2FV8eTrHODoic6udqw/640?wx_fmt=png&from=appmsg)

1.  **「构建命令」**:
    

*   使用`std::process::Command::new("git")`创建一个新的命令，指定执行的是`git`。
    
*   `.current_dir(&project_dir)`设置命令的当前工作目录为`project_dir`，这样命令就会在正确的项目目录内执行。
    
*   `.arg("add")`和`.arg("-A")`添加参数到命令中，这些参数让 git 将所有变更添加到暂存区。
    
*   `.stdout(std::process::Stdio::null())`将标准输出重定向到 null，即不在控制台显示命令的输出。
    

3.  **「执行命令」**:
    

*   使用`.status()`执行命令并获取其退出状态。这个函数会等待命令完成并返回一个包含状态信息的`Result`类型。
    
*   `.expect("failed to execute process")`处理`Result`，如果命令执行失败（例如因为`git`不在系统路径中），程序会输出错误信息并 panic。
    

5.  **「检查命令执行结果」**:
    

*   `if !git_add.success()`检查`git`命令是否成功执行。`success()`方法返回`true`如果命令的退出状态是 0，否则返回`false`。
    
*   如果命令未成功执行，则使用`logger::error("执行`git add -A`失败")`打印错误信息，并使用`std::process::exit(1)`退出程序。这里的 1 是退出码，通常表示程序异常终止。
    

* * *

最后，当我们执行到`Ok(())`时，说明我们已经顺利完成了上面功能。也就是我们构建完成了前端项目。

然后就会出现下图。

![](https://mmbiz.qpic.cn/mmbiz_png/rv5jxwmzMCVhXm5K52f69q8BuYuiaKHzjTmkuiahE0JTHGKAb3ueftqsY7JhpjWic4pmGrHuNm0n2T9OgyJoF8GZw/640?wx_fmt=png&from=appmsg)

> ❝
> 
> 这里有一点需要注意，本来呢，我们想通过`Rust`配置`husky/oxlint`相关的配置，但是在操作的时候，会有莫名的错误，所以我们把这步操作权限，放到操作者手里。
> 
> ❞

看到上面内容中，我们通过`cli`的提示，来告诉大家需要执行哪些步骤。而这一步的操作是在`main.rs`中`create_project()`中执行完`project.create()`后 执行`logger::project_created_msg(project_name);`输出的内容。

这些信息其实就是一个`logger`信息的展示。接下来，我们来看看`logger.rs`部分。

* * *

7. utils/logger.rs
==================

![](https://mmbiz.qpic.cn/mmbiz_png/rv5jxwmzMCVhXm5K52f69q8BuYuiaKHzjZ4D25ssk1JvpaY62dI4jwYsHnV1YK9JNVhJv7beusuFdUibvwo1rT3Q/640?wx_fmt=png&from=appmsg)

看上面我们定义了很多关于`logger`的方法，其实就是对 console[9] 的封装。

然后，我们就挑一个来简单讲讲。

```
pub fn message(msg: &str) {    println!("[{}] {}", style("f_cli").blue(), msg)}
```

*   **「函数定义」**:
    
    ```
    pub fn message(msg: &str) {    println!("[{}] {}", style("f_cli").blue(), msg)}
    ```
    

*   `message`函数接受一个字符串切片`msg`作为参数，代表要打印的消息。
    
*   函数体内，它使用`println!`宏来输出格式化的字符串。消息的格式为`[f_cli] msg`，其中`f_cli`是蓝色的，由`style("f_cli").blue()`设置。
    

之前，我们在最后输出一堆文案信息就是下面方法执行的。里面也没啥魔法就是调用了`message`输出我们想要展示的信息。

![](https://mmbiz.qpic.cn/mmbiz_png/rv5jxwmzMCVhXm5K52f69q8BuYuiaKHzjhBOE9e16ElWJFgG1o2VUbe4q4K6k5KWCKtwc6S1Aa2uQDe6YfDqZJw/640?wx_fmt=png&from=appmsg)

* * *

8. 其他函数
=======

上面讲了一堆方法，大部分都是文件的复制 (`project.rs`复制`template-react`) 或者对特殊文件进行修改 (修改`package.json`的信息)。

但是，我们还可以做到，在已经存在的文件中，追加或者修改内容。

下面，我们就来讲一下在我们选择`state`的时候，如果我们选择了特定的库，我们是不是不仅需要配置`package.json`, 我们还需要在组件的根文件中配置相关的信息。

![](https://mmbiz.qpic.cn/mmbiz_png/rv5jxwmzMCVhXm5K52f69q8BuYuiaKHzjFpJNfRyehYymWz4TzDbGcK4qV27HqFz5ibP2wycl7khP4m85Ia0Bz5w/640?wx_fmt=png&from=appmsg)

上面的文件目录是我们通过`vite create`构建的一个最基本的项目。然后，在`src/main.tsx`中就是我们的项目主入口文件。

> ❝
> 
> 忽略到警告和报错，因为我`vscode`配置了全局的`ts`，所以会提示错误。（相信我，这不是错误）
> 
> ❞

在通过`cli`创建项目时，我们会选择 3 大类 (6 种) 状态管理库。如下图。

![](https://mmbiz.qpic.cn/mmbiz_png/rv5jxwmzMCVhXm5K52f69q8BuYuiaKHzjlYiceu1pR5AodhjsfBSR0SEoJhJNbPRaEW40HVKfUFotibibWoxdPKRpw/640?wx_fmt=png&from=appmsg)

用过`Redux/Recoil`的同学都知道，我们不仅需要在`package.json`中配置依赖，我们还需要将`xxProvider`配置到页面中。

那么，我们就需要方法来处理这种情况。

下面中的`update_state_management_by_choose`的方法就是处理这种情况的。该方法位于`content/update_state_management.rs`中。![](https://mmbiz.qpic.cn/mmbiz_png/rv5jxwmzMCVhXm5K52f69q8BuYuiaKHzjpyprFndUic1J0e1Wr7JeMpialJJU9LnWGu9Us7iaT0LUjRVaNRHegDlag/640?wx_fmt=png&from=appmsg)

其实上面的方法也很简单就是，基于`state`的值做处理，从上面看到我们只处理了`redux/recoil`。 然后唤起对应的`insert_xx_root()`将指定的信息插入到已有的文件中。

通过上述操作，之前光秃秃的`src/main.tsx`就有了新的内容。

![](https://mmbiz.qpic.cn/mmbiz_png/rv5jxwmzMCVhXm5K52f69q8BuYuiaKHzjSXkAeKsfOvH51PE782ckZRHrajmBDsttv5ibZkibxLdyFFdtLeFD8C0Q/640?wx_fmt=png&from=appmsg)

看上面的内容，我们就有了一个拥有`redux`的功能了。

* * *

9. cargo build
==============

如果执行到这里，我们就可以通过`cargo build`将其编译成二进制文件。

我们可以使用`cargo build --release`进行处理。然后，在项目中的`target/release`找到`f_cli`。这样，就在命令行中执行刚才我们的命令，执行项目的构建。

如果是有二进制源文件的话，我们可以将`f_cli`放到安全的文件夹中。通过在`.bashrc`中配置`PATH`，这样我们就可以在全局范围内访问了。

因为二进制的受操作系统的缘故，我们还需要将其编译成满足各种内核的二进制文件。例如

1.  `Mac Arm`架构
    
2.  `Window`环境。
    
3.  `Linux`
    
4.  .....
    

我们可以通过`rustup target list`查看可以编译成的`target`。同时我们可以通过 platform-support[10] 来查看更详细的描述。

我们可以通过`rustup target add xxx`来新增我们需要的`target`。

10. cargo publish
=================

对于如何发布一个`rust`应用到`crates.io`。我们之前在 [Rust 开发命令行工具](https://mp.weixin.qq.com/s?__biz=Mzg3NjU2OTE1Mw==&mid=2247489804&idx=1&sn=1fe78ee8bcc9ccb2191d3b73c6a83e02&scene=21#wechat_redirect)中有过详细介绍。

![](https://mmbiz.qpic.cn/mmbiz_png/rv5jxwmzMCVhXm5K52f69q8BuYuiaKHzj6rgIlRvteo9xW52gZY3HTYfCABw4MywoCvLbrQpsbsQduft9xZ8fSg/640?wx_fmt=png&from=appmsg)

* * *

11. TODO
========

其实我们这个版本的`f_cli`还有很多事情需要做。如果大家谁有兴趣，可以私聊，然后我们一起来做一些有意义的事情。

1.  打包工具的选择 (`Webpack/Vite/RsPack`)
    
2.  前端框架的选择 (`Vue/React`)
    
3.  基于本地文件进行自定义配置
    
4.  针对现有项目的配置更新
    
5.  ....
    

* * *

后记
==

**「分享是一种态度」**。

**「全文完，既然看到这里了，如果觉得不错，随手点个赞和 “在看” 吧。」**

![](https://mmbiz.qpic.cn/mmbiz_gif/rv5jxwmzMCVhXm5K52f69q8BuYuiaKHzj7iarWibnK16yBKwjj0HI4JToWy8gFnEumoGfLQQia9EIeH8CgNPuao89Q/640?wx_fmt=gif&from=appmsg)

然后，我们可以通过`rustup target list --installed`来查看已经安装过的`target`。

### Reference

[1]

crates.io: https://crates.io/crates/f_cli

[2]

Manifest Format: https://doc.rust-lang.org/cargo/reference/manifest.html

[3]

anyhow: https://crates.io/crates/anyhow

[4]

clap: https://crates.io/crates/clap

[5]

dialoguer: https://crates.io/crates/dialoguer

[6]

#[derive]: https://doc.rust-lang.org/reference/attributes/derive.html

[7]

RustEmbed: https://crates.io/crates/rust-embed

[8]

serde_json: https://crates.io/crates/serde_json

[9]

console: https://crates.io/crates/console

[10]

platform-support: https://doc.rust-lang.org/rustc/platform-support.html