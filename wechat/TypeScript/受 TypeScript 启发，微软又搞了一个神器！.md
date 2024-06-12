> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/-QxcmmSRuHw6Q4lbpO9zjA)

### TypeSpec 是什么

![](https://mmbiz.qpic.cn/mmbiz_jpg/jQmwTIFl1V2eqOU4FhQiaMOb5uHOPq1XC9arGDnaLDudmcwCR90hybQoMRFEY7tVNQgPKMszawhYM42ogg12C8A/640?wx_fmt=jpeg&from=appmsg)

TypeSpec[1] 是一种高度可扩展的语言，可轻松描述 `REST`、`OpenAPI`、`gRPC` 和其他协议中常见的 API 结构。TypeSpec 在生成多种不同的 API 描述格式、客户端和服务端代码、文档等方面表现出色。有了 TypeSpec，你就可以摆脱那些拖慢你速度的手写文件，并在几秒钟内生成符合标准的 API Schemas。

### TypeSpec 的特点

*   简洁轻量：受 **TypeScript** 的启发，TypeSpec 是一种极简语言，可帮助开发人员以熟悉的方式描述 API。
    
*   易集成：编写 TypeSpec，发布为各种格式，快速与其它生态系统集成。
    
*   支持多种协议：TypeSpec 标准库支持主流的 **OpenAPI 3.0，JSON Schema 2020-12，Protobuf，和 JSON RPC** 等协议。
    
*   功能强大：受益于庞大的 OpenAPI 工具生态系统，可用于配置 API 网关、生成代码和验证数据。
    
*   保证数据一致性：定义要在 API 中使用的通用模型，使用 JSON Schema 发射器获取类型的 JSON Schema，并使用它们验证数据。
    
*   友好的开发体验：在 VSCode 和 Visual Studio 编辑器中为了 TypeSpec 提供了全面的语言支持。比如，语法高亮、代码补全等功能。
    

### TypeSpec 使用示例

#### 生成 OpenAPI 描述文件

![](https://mmbiz.qpic.cn/mmbiz_jpg/jQmwTIFl1V2eqOU4FhQiaMOb5uHOPq1XCzNmuUKFZibOELWX5PO4u3U4YHqJDnwI3iauKsRM4m24s323rxJC24kDQ/640?wx_fmt=jpeg&from=appmsg)

#### 生成 JSON Schema

![](https://mmbiz.qpic.cn/mmbiz_jpg/jQmwTIFl1V2eqOU4FhQiaMOb5uHOPq1XCZNiaHrgPkh0ah0FPIiazkzpicnXzLOtfyQiarUxib76OMjDSL62rhwfQvqg/640?wx_fmt=jpeg&from=appmsg)

#### 生成 Protobuf

![](https://mmbiz.qpic.cn/mmbiz_jpg/jQmwTIFl1V2eqOU4FhQiaMOb5uHOPq1XCYAwzhPERtiaLKs2QdZP9BNbg225yxsV0CytoiafCypmqWMYibgdiaaxicibg/640?wx_fmt=jpeg&from=appmsg)

### TypeSpec Playground

要快速体验 TypeSpec 的功能，推荐你使用 TypeSpec 官方提供的 playground[2]。该 playground 预设了 `API versioning`、`Discriminated unions`、`HTTP service`、`REST framework`、`Protobuf Kiosk` 和 `Json Schema` 6 个不同的使用示例，并支持 **File** 和 **Swagger UI** 两种视图。

#### File 视图

![](https://mmbiz.qpic.cn/mmbiz_png/jQmwTIFl1V2eqOU4FhQiaMOb5uHOPq1XCMepRViaUswkm633pzEKGgdZSvy5kuU4Q8mQQc8CrjK78R08FcgK73gg/640?wx_fmt=png&from=appmsg)

#### Swagger UI 视图

![](https://mmbiz.qpic.cn/mmbiz_png/jQmwTIFl1V2eqOU4FhQiaMOb5uHOPq1XCgibeNMxSleWpXhzcd0vh0sqhRp5CAxqF4FiaKOSYvler8nF0NOnSXoRg/640?wx_fmt=png&from=appmsg)

### TypeSpec 快速上手

#### 1. 安装 `@typespec/compiler` 编译器

```
npm install -g @typespec/compiler
```

#### 2. 安装 VSCode 扩展

在 VSCode 中搜索 `TypeSpec` 安装 **TypeSpec for VS Code** 扩展，或在浏览器中打开 TypeSpec for VS Code[3] 网址后点击 **Install** 按钮。

#### 3. 创建 TypeSpec 项目

首先新建一个新的目录，然后在项目的根目录下执行以下命令：

```
tsp init
```

![](https://mmbiz.qpic.cn/mmbiz_jpg/jQmwTIFl1V2eqOU4FhQiaMOb5uHOPq1XCgmN0Qr2H5HuMGa45qE0eicEUJicETyaXNlXaesBEWbq2KnegXOkzC2Tw/640?wx_fmt=jpeg&from=appmsg)![](https://mmbiz.qpic.cn/mmbiz_jpg/jQmwTIFl1V2eqOU4FhQiaMOb5uHOPq1XC2EzKa7I4RPUUbhBuWqanvfEu0SCAQK905icLJYhh7zEiadibiatIIHic83A/640?wx_fmt=jpeg&from=appmsg)

#### 4. 安装项目依赖

```
tsp install
```

成功执行上述命令后，在当前目录下会生成以下目录结构：

```
.
├── main.tsp
├── node_modules
├── package-lock.json
├── package.json
└── tspconfig.yaml
```

之后，打开 `main.tsp` 文件，输入以下代码：

```
import "@typespec/http";using TypeSpec.Http;@service({  title: "Widget Service",})namespace DemoService;model Widget {  @visibility("read", "update")  @path  id: string;  weight: int32;  color: "red" | "blue";}@errormodel Error {  code: int32;  message: string;}@route("/widgets")@tag("Widgets")interface Widgets {  @get list(): Widget[] | Error;  @get read(@path id: string): Widget | Error;  @post create(...Widget): Widget | Error;  @patch update(...Widget): Widget | Error;  @delete delete(@path id: string): void | Error;  @route("{id}/analyze") @post analyze(@path id: string): string | Error;}
```

完成输入后，运行 `tsp compile .` 命令执行编译操作。成功编译后，在 `tsp-output/@typespec/openapi3` 目录下就会生成 `openapi.yaml` 文件：

![](https://mmbiz.qpic.cn/mmbiz_jpg/jQmwTIFl1V2eqOU4FhQiaMOb5uHOPq1XCbHdHre07pNrR7FLws0vR05BIApBCtGL78ianiaiaDQyCpZibcfHYfibic2Xw/640?wx_fmt=jpeg&from=appmsg)

有关 TypeSpec 的相关内容就介绍到这里，如果你想进一步了解 TypeSpec 的基础使用和高级用法，推荐你阅读官方的使用文档 [4]。

参考资料

[1]

TypeSpec: https://typespec.io/

[2]

playground: https://typespec.io/playground

[3]

TypeSpec for VS Code: https://marketplace.visualstudio.com/items?itemName=typespec.typespec-vscode

[4]

使用文档: https://typespec.io/docs