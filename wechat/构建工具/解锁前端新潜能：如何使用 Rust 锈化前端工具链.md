> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/Q3V01ZFT0Seb5Ys2-CY5mQ)

  

点击下方 “前端图形”，选择 “设为星标”  

第一时间关注技术干货！

  

前言

近年来，Rust 的受欢迎程度不断上升。首先，在操作系统领域，Rust 已成为 Linux 内核官方认可的开发语言之一，Windows 也宣布将使用 Rust 来重写内核，并重写部分驱动程序。此外，国内手机厂商 Vivo 也宣布使用 Rust 开发了名为 “蓝河” 的操作系统。除此之外，Rust 在图形渲染、游戏开发、中间件开发、边缘计算、计算安全等领域也是遍地开花，可以说，Rust 正在以惊人的速度重塑着各个领域的发展，让人不禁感叹 Rust 已经在重写万物了。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/ibCxwRqNMjQ0enia73iaicpmo90s7WpgJHvkyhoMGtlqy3EB08gf5cA8zUQicjOssIf3eib0PxXEmuOQLKsn8maiagO9Q/640?wx_fmt=png&from=appmsg)

那回到前端领域，正在进行一场构建工具的革命，除了老牌的 Babel 竞争对手 swc，一些新兴的前端构建工具也都在使用 Rust 进行开发，例如  Turbopack、Parcel，对标 Webpack  的 Rspack，对标 Vite 的 Farm 等等。所以，对于广大前端同胞来说，C/C++ 太难，学习和掌握 Rust 是一个不错的选择，虽然 Rust 也不见得容易许多，它有着陡峭的学习曲线，但它或许是我们突破闭塞的前端区间的一把钥匙，帮助我们打开通往新世界的大门。

锈化开发工具的方式
=========

虽说 Rust 的学习曲线可能相对陡峭，但笔者认为这是对于要全面掌握 Rust 这门语言而言的，而我们学习语言的目的最重要的是掌握一项可以帮我们解决问题的技能，因此，对于 Rust 不需要抱有太多的恐惧和敬畏之心，只需要摒除杂念立马开始学习 + 撸码，剩下的就交给时间来慢慢积累经验。此外，对于不是那么复杂应用来说，熟悉 Rust 基本语法和数据结构，翻过「所有权机制」和「生命周期」两座大山，基本也足以应付了。

本文建立在读者已经有一定的 Rust 知识基础上，对于 Rust 基本语法就不做赘述了。当前，大部分前端研发都是在 Node 环境下进行的，所以我们通过 Rust 来改造开发工具，主要有两种形式：

*   使用 WASM 的方式，基于 wasm-pack ，将 Rust 代码编译成 WASM，以供 Node 调用
    
*   将 Rust 应用编译成 Node addons，通过 Node API 的方式供 Node 调用，可以基于 napi-rs  和 neon 来实现
    

在这两种方式的选择上，主要取决于你是否需要完整地访问 Node API，WASM 出于安全性的考虑，对于 Node 能力的调用存在限制，那么此时就应该选择 Node addons 的方式了。而 napi-rs  和 neon 的选择的话， napi-rs 相对而言比较简单和轻量，而且针对不同版本的 Node 不需要重新编译，所以我们考虑选择 napi-rs 作为锈化开发工具的方式。

初识 NAPI-RS
==========

我们可以通过 napi-rs 的开发工具 ****`@napi-rs/cli`** 以及项目模板来初始化一个应用，这里推荐使用项目模板，因为经过笔者的测试，开发工具创建的项目内容上相较于模板比较落后，对于后续深入使用上会造成一定的困惑。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/ibCxwRqNMjQ0enia73iaicpmo90s7WpgJHvkNIg72W3dic0StILPlMZykdHpso7AwFF8frYsH4a9VOh5L3CDHleUYXw/640?wx_fmt=png&from=appmsg)

从 napi-rs 项目模板内容上看，可以发现项目结构完善，工程化相关能力非常齐全，提供了构建工具、测试用例编写、Github CI 工作流等等必须的能力，我们只需要关注编码就可以了。

我们先来关注一下生成的 napi-rs 项目文件。从 `package.json` 和 `npm` 分析可以看出，一个 napi-rs 项目主要是由主包和 npm 下的针对不同平台的编译构建结果子包组成，napi-rs 会根据用户的配置，将用户的 Rust 代码构建为不同平台下的 Node 扩展 binding 文件，这些文件会放到 npm 下对应的平台目录中，再由 package.json 中 main 字段指定导出，用户在安装主包的时候，会根据用户电脑情况加载对应构建结果子包。

```
{  "name": "@tarojs/parse-css-to-stylesheet-darwin-x64",  "version": "0.0.25",  "os": [    "darwin"  ],  "cpu": [    "x64"  ],  "main": "parse-css-to-stylesheet.darwin-x64.node",  "files": [    "parse-css-to-stylesheet.darwin-x64.node"  ],  "license": "MIT",  "engines": {    "node": ">= 10"  },  "repository": "https://github.com/NervJS/parse-css-to-stylesheet"}
```

而在主包入口 `index.js` 中将根据用户宿主平台，加载对应的扩展文件。

```
...switch (platform) {  case 'win32':    switch (arch) {      case 'x64':        localFileExisted = existsSync(          join(__dirname, 'parse-css-to-stylesheet.win32-x64-msvc.node')        )        try {          if (localFileExisted) {            nativeBinding = require('./parse-css-to-stylesheet.win32-x64-msvc.node')          } else {            nativeBinding = require('@tarojs/parse-css-to-stylesheet-win32-x64-msvc')          }        } catch (e) {          loadError = e        }        break      ...    }    break  ...}...
```

从 `@napi-rs/triples` 这个包中可以看到所有支持的平台列表，而对于常规性的 Node 应用来说，我们不需要构建这么多平台，一般来说构建 `x86_64-apple-darwin` 、`aarch64-apple-darwin` 、`x86_64-pc-windows-msvc`、`x86_64-unknown-linux-gnu` 这四个平台也足够了，这样也能减少 CI 的构建时间。

napi-rs 默认构建的平台是`x86_64-apple-darwin` 、`x86_64-pc-windows-msvc`、`x86_64-unknown-linux-gnu` ，在这里可以看到，所以为了增加 MAC Book M 系列电脑的支持，我们需要增加 `aarch64-apple-darwin` 的配置，可以在 package.json 中 `napi` 字段中添加，配置如下：

```
"napi": {  "binaryName": "taro",  "triples": {    "default": true,    "additional": [      "aarch64-apple-darwin"    ]  }},
```

接下来就可以开始我们的编码之旅咯！

基于 NAPI-RS 开发 Node 扩展
=====================

基于 napi-rs 开发 Node 扩展，除了 Rust 编码本身外，无非需要关注两种情况，即 JavaScript 调用 Rust 和 Rust 调用 JavaScript。

JavaScript 调用 Rust
------------------

### 调用 Rust 函数

这是最常见的用法，因为我们一般使用 Rust 开发 Node 扩展，也是为了将一些 CPU 密集型任务的任务使用 Rust 来实现，再暴露给 JS 来调用，从而达到提升应用性能的目的，最为常见的是 Rust 暴露方法给到 JS 调用，通过项目模板生成的 napi-rs 示例也可以看到。

```
// src/lib.rs use napi_derive::napi;#[napi]pub fn plus_100(input: u32) -> u32 {  input + 100}
```

如上代码，通过给 `plus_100` 函数添加 `#[napi]` 属性宏，这样可以标记该函数，表示该函数可以通过 N-API 在 Node.js 中调用，在项目编译后的 typing 文件中，我们能看到对应生成了 JS 函数.

```
export function plus100(input: number): number
```

可以看到这里生成 JS 函数名是 napi-rs 自己的规则，我们也可以自定义暴露的函数名，通过 `js_name` 属性可以指定。

```
#[napi(js_name = "plus_100")]pub fn plus_100(input: u32) -> u32 {  input + 100}
```

当然，除了暴露函数这一基本操作之外，我们还可以暴露常量、对象、类、enum 等等给到 JS 侧去调用，这些可以通过 napi-rs 的官方文档可以查阅到。

### 以 Object 作为参数

而在 JS 调用 Rust 编码中，最需要关注的是调用函数时，JS 侧给 Rust 传对象作为参数，这里为了提升性能，建议提前在 Rust 中定义好传递对象的数据结构，在 JS 中以引入该数据结构定义，规范数据传递即可。

```
// 定义好数据结构// napi(object) 表示紧随其后的 struct （结构体）将通过 N-API 以 JavaScript 对象的形式暴露出去#[napi(object)]pub struct Project {  pub project_root: String,  pub project_name: String,  pub npm: NpmType,  pub description: Option<String>,  pub typescript: Option<bool>,  pub template: String,  pub css: CSSType,  pub auto_install: Option<bool>,  pub framework: FrameworkType,  pub template_root: String,  pub version: String,  pub date: Option<String>,  pub compiler: Option<CompilerType>,  pub period: PeriodType,}
```

JS 中调用

```
// 函数定义，其中 Project 由 Rust binding 中暴露export function createProject(conf: Project)// 函数调用createProject({  projectRoot: projectDir,  projectName,  template,  npm,  framework,  css: this.conf.css || CSSType.None,  autoInstall: autoInstall,  templateRoot: getRootPath(),  version: getPkgVersion(),  typescript: this.conf.typescript,  date: this.conf.date,  description: this.conf.description,  compiler: this.conf.compiler,  period: PeriodType.CreateAPP,})
```

Rust 调用 JavaScript
------------------

而 Rust 中也可以调用 JS 提供的方法，这在做 Node 开发工具的时候非常有用，因为有时候我们需要读取开发人员的配置代码给到 Rust 调用，其中就可能会遇到 Rust 调用 JavaScript 中函数的情况。

### 一个调用 JS 函数的简单例子

在 napi-rs 中调用 JS 函数主要通过 `ThreadsafeFunction` 来实现，请看例子：

```
#[napi]pub fn call_threadsafe_function(callback: ThreadsafeFunction<u32>) -> Result<()> {  for n in 0..100 {    let tsfn = callback.clone();    thread::spawn(move || {      tsfn.call(Ok(n), ThreadsafeFunctionCallMode::Blocking);    });  }  Ok(())}
```

在上述例子中，`call_threadsafe_function` 函数接受了一个类型为 `ThreadsafeFunction<u32>` 的参数，这表明 `call_threadsafe_function` 被编译为 JS 函数后将接受一个回调函数作为参数，而该回调函数的有效参数为 `u32` 即 `number` 类型，而在`call_threadsafe_function` 函数体中，通过 `thread::spawn` 开辟子线程，以阻塞的方式调用这个传入的回调函数。

通过 `ThreadsafeFunction` 的 `call` 方法可以调用到传入的 JS 回调函数，但是我们会发现它拿不到返回值，如果我们需要获取到 JS 回调函数的返回值时，我们需要使用 `call_with_return_value` 和 `call_async` 两个方法。

### 获取 JS 函数的返回值

对比 `call` 与 `call_with_return_value` 的实现可以看出，`call_with_return_value` 比 `call` 多一个回调函数参数，并且可以指定 JS 回调函数返回值的类型，并且该类型需要满足 `FromNapiValue` 这个 trait，因为`call_with_return_value` 在处理 JS 回调函数时会调用它的 `from_napi_value` 方法将 JS 数据转为 Rust 的数据类型。

```
// https://github.com/napi-rs/napi-rs/blob/main/crates/napi/src/threadsafe_function.rs#L428pub fn call(&self, value: Result<T>, mode: ThreadsafeFunctionCallMode) -> Status {  self.handle.with_read_aborted(|aborted| {    if aborted {      return Status::Closing;    }    unsafe {      sys::napi_call_threadsafe_function(        self.handle.get_raw(),        Box::into_raw(Box::new(value.map(|data| {          ThreadsafeFunctionCallJsBackData {            data,            call_variant: ThreadsafeFunctionCallVariant::Direct,            callback: Box::new(|_d: Result<JsUnknown>| Ok(())),          }        })))        .cast(),        mode.into(),      )    }    .into()  })}pub fn call_with_return_value<D: FromNapiValue, F: 'static + FnOnce(D) -> Result<()>>(  &self,  value: Result<T>,  mode: ThreadsafeFunctionCallMode,  cb: F,) -> Status {  self.handle.with_read_aborted(|aborted| {    if aborted {      return Status::Closing;    }    unsafe {      sys::napi_call_threadsafe_function(        self.handle.get_raw(),        Box::into_raw(Box::new(value.map(|data| {          ThreadsafeFunctionCallJsBackData {            data,            call_variant: ThreadsafeFunctionCallVariant::WithCallback,            callback: Box::new(move |d: Result<JsUnknown>| {              d.and_then(|d| D::from_napi_value(d.0.env, d.0.value).and_then(cb))            }),          }        })))        .cast(),        mode.into(),      )    }    .into()  })}
```

`call_with_return_value` 的使用方式如下：

```
#[napi]pub fn call_threadsafe_function(callback: ThreadsafeFunction<u32>) -> Result<()> {  callback.call_with_return_value(Ok(1), ThreadsafeFunctionCallMode::Blocking, move |result: u32| {    println!("callback: {result:?}");    Ok(())  });  Ok(())}
```

可以看出，JS 回调函数的返回值是在 `call_with_return_value` 的第三个回调函数参数中获取到的，这就导致如果我们需要依赖这个 JS 函数返回值的话，我们后续的逻辑代码只能写在 `call_with_return_value` 的第三个回调函数参数中，对我们的代码逻辑书写造成诸多不便，代码可读性降低，所以推荐使用 `call_async` 方法来执行 JS 函数，并获取参数。

### 使用 `call_async` 获取 JS 函数返回值

从 `call_async` 的实现可以看出，它首先使用了 `tokio` 创建了一个 one-shot 通道，让 JS 函数以不阻塞的方式异步运行，并在执行完成后通过 `sender` 发送操作结果，而使用 `receiver` 进行等待执行结果，并将结果返回，同时要使用 `call_async` 方法，需要在 `Cargo.toml` 中为 `napi` 依赖打开 `tokio_rt`  特性。

```
#[cfg(feature = "tokio_rt")]pub async fn call_async<D: 'static + FromNapiValue>(&self, value: Result<T>) -> Result<D> {  let (sender, receiver) = tokio::sync::oneshot::channel::<Result<D>>();  self.handle.with_read_aborted(|aborted| {    if aborted {      return Err(crate::Error::from_status(Status::Closing));    }    check_status!(      unsafe {        sys::napi_call_threadsafe_function(          self.handle.get_raw(),          Box::into_raw(Box::new(value.map(|data| {            ThreadsafeFunctionCallJsBackData {              data,              call_variant: ThreadsafeFunctionCallVariant::WithCallback,              callback: Box::new(move |d: Result<JsUnknown>| {                sender                  .send(d.and_then(|d| D::from_napi_value(d.0.env, d.0.value)))                  .map_err(|_| {                    crate::Error::from_reason("Failed to send return value to tokio sender")                  })              }),            }          })))          .cast(),          ThreadsafeFunctionCallMode::NonBlocking.into(),        )      },      "Threadsafe function call_async failed"    )  })?;  receiver    .await    .map_err(|_| {      crate::Error::new(        Status::GenericFailure,        "Receive value from threadsafe function sender failed",      )    })    .and_then(|ret| ret)}
```

可见 `call_async` 使用时将引入 Rust 的异步编程，我们可以使用 `async/await` 关键字来进行调用，使用方式如下：

```
#[napi]pub async fn call_threadsafe_function(callback: ThreadsafeFunction<u32>) -> Result<u32> {  let result = match callback.call_async::<u32>(Ok(1)).await {    Ok(res) => res,    Err(e) => {      println!("Error: {}", e);      0    }  };  println!("result: {result:?}");  Ok(result)}
```

此时生成的 JS 函数定义为如下，可以看出`callThreadsafeFunction` 变成了一个异步函数：

```
export function callThreadsafeFunction(callback: (err: Error | null, value: number) => any): Promise<number>
```

所以在 JS 中调用方式及输出结果为：

```
const result = await callThreadsafeFunction((err, value) => {  return value + 1})console.log(result)// 输出结果// result: 2// 2
```

### 正确处理 JS 函数的返回值

从前面 `call_async` 的实现可以看出，`call_async` 返回的数据，也即 JS 函数返回值需要满足如下泛型约束 `D: 'static + FromNapiValue` ，而 napi-rs 默认会为数值、字符串、布尔等基本 JS 数据类型实现 `FromNpiValue`  trait，但是如果我们的 JS 回调想要返回一个对象时，则需要自己手动实现 `FromNpiValue` trait，这样可以让 `call_async` 获取到 JS 返回数据时自动调用 `FromNpiValue` trait 的 `from_napi_value` 方法将 JS 返回数据转换为 Rust 的数据格式，以下是一个简单的示例。

假如需要在 Rust 调用一个 JS 函数，JS 函数会返回一个对象，包含三个字段：

```
{
	setPageName?: string,
	changeExt?: boolean,
  setSubPkgName?: string
}
```

我们需要在 Rust 中获取到返回的对象，并转为 Rust 数据，那么首先我们可以定义一个类似的数据结构：

```
#[derive(Debug)]pub struct JSReturnObject {  pub set_page_name: Option<String>,  pub change_ext: Option<bool>,  pub set_sub_pkg_page_name: Option<String>,}
```

同时为它实现  `FromNpiValue` trait 就可以了：

```
impl FromNapiValue for JSReturnObject {  unsafe fn from_napi_value(env: napi_env, napi_val: napi_value) -> Result<Self> {    let obj = JsObject::from_napi_value(env, napi_val)?;    let mut js_return_object = JSReturnObject {      set_page_name: None,      change_ext: None,      set_sub_pkg_page_name: None,    };    let has_set_page_name = obj.has_named_property("setPageName")?;    let has_change_ext = obj.has_named_property("changeExt")?;    let has_set_sub_pkg_page_name = obj.has_named_property("setSubPkgName")?;    if has_set_page_name {      js_return_object.set_page_name = Some(obj.get_named_property::<String>("setPageName")?);    }    if has_set_sub_pkg_page_name {      js_return_object.set_sub_pkg_page_name = Some(obj.get_named_property::<String>("setSubPkgName")?);    }    if has_change_ext {      js_return_object.change_ext = Some(obj.get_named_property::<bool>("changeExt")?);    }    Ok(js_return_object)  }}
```

在上述代码中，先调用 `JsObject::from_napi_value` 方法将传入数据转为 `JsObject` ，然后调用

`JsObject` 的 `has_named_property` 方法获取到对应的属性值，经过处理后可以构建出 `JSReturnObject` 结构体数据，并进行返回。而使用的时候，为 `call_async` 指定泛型参数类型为 `JSReturnObject` ，接下来就可以获取到 JS 返回值进行处理了。

```
let result: JSReturnObject = js_handler  .call_async::<JSReturnObject>(Ok(options.clone()))  .await  .with_context(|| format!("模板自定义函数调用失败: {}", file_relative_path))?;
```

使用 VSCode 进行调试
==============

我们可以使用 VSCode 来调试我们的 napi-rs 应用，我们可以参考 Taro 项目，在项目的 .vscode 目录下新增 launch.json 配置如下：

```
{  // Use IntelliSense to learn about possible attributes.  // Hover to view descriptions of existing attributes.  // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387  "version": "0.2.0",  "configurations": [    {      "type": "lldb", // 调试器类型，这里指定为lldb，通常用于C/C++/Rust等语言      "request": "launch", // 请求类型，可以是'launch'或'attach'，'launch'表示启动一个新的调试会话      "name": "debug-init", // 配置名称，显示在VS Code的启动配置下拉菜单中      "sourceLanguages": ["rust"], // 指定源码语言，此处为Rust      "program": "node", // 要调试的程序，这里是指Node.js的可执行文件      "args": [    // 程序参数，这里指定了使用node运行taro-cli包的初始化命令，创建一个名为test_pro的新项目    "${workspaceFolder}/packages/taro-cli/bin/taro",    "init",    "test_pro"   ],      "cwd": "${workspaceFolder}", // 当前工作目录，这里指工作区根目录      "preLaunchTask": "build binding debug", // 调试前需要执行的任务的名称，这里指定了一个任务以在调试前构建项目      "postDebugTask": "remove test_pro" // 调试后需要执行的任务的名称，此处指定了一个任务以在调试后清理或删除test_pro项目    }, ]}
```

在上述配置中，指定调试器类型为 `lldb` ，启动一个新的调试会话来调试我们用 Rust 编写的程序，该程序主要通过 Node.js 来执行一个初始化新项目 test_pro 的命令，在调试开始前后会分别执行 Rust binding 的构建以及 test_pro 项目的删除。

然后在要调试的代码处添加断点，然后执行调试即可。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/ibCxwRqNMjQ0enia73iaicpmo90s7WpgJHvkffZuZibmVDUNpI2XhwtrFwz70bVbFljnn80glh0OA9piaSPE48oEoT6w/640?wx_fmt=png&from=appmsg)

构建发布
====

napi-rs 的项目模板默认基于 Github Action 来实现自动构建产物及发布，并且已经有相当完整的配置了，从 Github Action 配置文件中可以看到 CI 具体执行的任务，CI 任务首先会执行 package.json 中的构建命令，构建出各个端的 binding，并会 `actions/upload-artifact@v3` action 将构建产物上传，然后会对构建产物执行相关测试，测试通过后会将构建产物下载下来，并执行 `artifacts` 命令将构建产物移动到目的文件夹下，最后会进行发布，当 git 提交信息为 `semver` 规范版本号时，将会触发 CI 发布，将包发到 NPM 中去。

```
$ git commit -m '0.0.1'
```

前面提到我们一般只需要针对 `x86_64-apple-darwin` 、`aarch64-apple-darwin` 、`x86_64-pc-windows-msvc`、`x86_64-unknown-linux-gnu` 这四个平台进行构建，所以我们可以调整 Github Action 配置，去掉不需要构建的平台以提升 CI 速度。

此外，当我们有特殊需求的时候，例如不需要重新生成胶水 JS 代码、需要将构建产物移动到其他目录（默认是当前目录下的 npm 目录）下等等，可以查看 @napi-rs/cli 的文档进行相应调整。

不需要重新生成胶水 JS 代码，可以通过在 `napi build` 命令下添加 `--no-js` 实现：

```
"scripts": { ...  "build": "napi build --platform --release --no-js --dts binding.d.ts",  "build:debug": "napi build --platform --no-js --dts binding.d.ts" ...}
```

需要将构建产物移动到其他目录，可以通过在 `napi artifacts` 命令下添加 --cwd 和 --npm-dir 参数来实现，前者指定工作目录，后者指定要移动的目录的相对路径

```
"scripts": { ...  "artifacts": "napi artifacts --npm-dir ../../npm2 --cwd ./", ...}
```

总结
==

Rust 在前端领域的应用无疑将成为未来的重要发展趋势，随着越来越多的公司和团队开始投入到这一领域，我们看到了 Rust 在前端研发生态构建中的独特优势和潜力，Rust 的高效性和安全性使其成为优化 Node 工具的理想选择。本文简单介绍了如何使用 NAPI-RS 来开发、调试和发布 Node 扩展，可以有效地优化我们的开发工具，并提升其性能。

在未来，我们可以预见 Rust 与前端结合的可能性将会更加广泛。随着 WebAssembly（WASM）的发展，我们可以期待 Rust 将在前端应用的性能优化、复杂应用的开发以及多线程等领域发挥更大的作用。同时，Rust 的出色的内存管理和错误处理机制也将帮助前端开发者构建更加健壮、安全的应用。

当然，Rust 与前端的结合并不仅仅限于性能优化，Rust 的优秀特性，如模式匹配、类型推断和零成本抽象，也为前端开发带来了新的编程范式和思维方式，这将有助于提升前端代码的可读性和可维护性，为前端开发提供了新的思考角度和工具，并可能引领前端开发进入一个全新的阶段。