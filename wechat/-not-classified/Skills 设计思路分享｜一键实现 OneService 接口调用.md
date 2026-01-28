> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/b7YCwnYuTeiFy1CUd1qC6A)

![](https://mmbiz.qpic.cn/mmbiz_gif/oQ0houcyEicgL2wKHSia2yZvPibgX5CKmXE5El7uwOqyBaMy0R1gvGlJWEQwAibKFqkibnbT2VkaFibyWiavAh7oenXgA/640?wx_fmt=gif&from=appmsg#imgIndex=0)

本文作者：落秋枫，TRAE 开发者用户

![](https://mmbiz.qpic.cn/mmbiz_png/oQ0houcyEicgL2wKHSia2yZvPibgX5CKmXEqftDNicJZECQ4icGLcfngj44f2LIMtYG2Hy3E09esEVr6nGSx0zY8ykw/640?wx_fmt=png&from=appmsg#imgIndex=1)

**概述**

**名词解释**

*   **SKILL：**最初是 Claude AI 的一项功能，允许用户将复杂的、多步骤的流程（例如数据清洗、内容格式化、特定分析等）保存为可重复使用的自定义 “技能”，用来提升在某些特定任务上的表现。更多理解欢迎阅读 [一文读懂 Skills｜从概念到实操的完整指南](https://mp.weixin.qq.com/s?__biz=MzkxMTY4NTAyNQ==&mid=2247504906&idx=1&sn=3ded275d061cec5592bad151a30b6206&scene=21#wechat_redirect)
    

*   **OneService（后写作 OS）：**由字节团队开发的数据服务化平台。帮助用户将各种主流数据源的 SQL 查询快速服务化，提供 API 创建、管理、运维和共享的全生命周期管理能力
    
*   **PSM：**面向字节内部使用的公司服务唯一标识
    

**项目背景**

**日常服务端开发的同学，「在列表页里新增数据指标」**是一类很常见的需求，但在复杂的项目当中，这些指标的数据来源往往很分散，来自不同数据库。在过去，我们要拿到这些数据，通常会用两种比较 “笨重” 的方式：

*   一种是去调用已经封装好的各个 RPC 接口，接口所在的服务连接了各个数据库
    
*   另一种是直接在当前服务里连接到具体的数据库，去查原始的底层表
    

后来我们用上了 OS 这个工具，它可以把各种数据库查询快速包装成 API 服务，让我们跨数据源取数据的工作变得轻量化了不少

**但新的问题又出现了：**

如果新增的指标数量较多，且来自不同数据源，意味着需要新增多个 OS API，这些 API 的调用逻辑高度相似，只是 API ID、入参和出参略有不同

这种机械重复的开发，恰好暴露了我们团队在 OS API 调用上长期存在的痛点。

![](https://mmbiz.qpic.cn/mmbiz_png/oQ0houcyEicgL2wKHSia2yZvPibgX5CKmXEmavRJHD7ocDln1CbrNDluAfvsNIbPlRVzGJSI6HeicB29RlMEQ4Dib7A/640?wx_fmt=png&from=appmsg#imgIndex=2)

**所面临的痛点**

团队的多数 PSM 当中，针对 OS API 的调用，存在以下诸多痛点问题

1.  **新增效率低下：**新增需要重复编写高度相似的 API 调用代码，**开发效率低且易出错**
    
2.  **调用方式不统一：**不同的开发者，调用 OS 的 SDK，使用方法 / 参数命名 / 传参方式定义各不相同，**后续维护困难**
    
3.  **重复开发 / 接入 ：**同一个 API ID 被不同人写了多份方法，**逻辑分散、难以收敛**
    
4.  **难以查找与复用 ：**针对项目里已有的 API 调用，没有接口描述和出入参备注，**重度依赖开发者的个人注释习惯**
    
5.  **命名与文件组织混乱 ：**调用方法命名随意、文件散落，导致**同类能力难聚合、难形成约定俗成的目录结构**
    

![](https://mmbiz.qpic.cn/mmbiz_png/oQ0houcyEicgL2wKHSia2yZvPibgX5CKmXEBlUmJQibapa9GPW6PgcrQZmN8lxr0oJHicSMERkZD9jibgqIbLY6gGCpQ/640?wx_fmt=png&from=appmsg#imgIndex=3)

**为什么选择 SKILL 功能？**

**一句话定义 SKILL：**

**是一种结构化的、可复用的能力单元，它告诉 Agent 在特定场景下，应该遵循怎样的流程（SOP）来完成一个具体任务**

**1. 提高增量开发效率：新增 OS API 调用，只需输入 Prompt，TRAE 一键搞定**

*   针对已经导入 OS 的 PSM，SKILL 提供完整的 OS API 调用方法的生成能力
    

**2. 降低接入成本：把 “接入 OS API” 从流程化**

*   针对一个新的 PSM，对于 OS 的 SDK 引入、Client 初始化、封装 QueryWithParams/SqlQuery 等基础设施操作，SKILL 可以一键完成，并符合统一初始化规范
    

**3. 避免重复与冲突：用 API ID 做统一索引**

*   OS 的唯一标识是 API ID，同一个 API 在代码里被多处各写一份非常常见，SKILL 强制先在 api_description.md 里按 API ID 查重，再决定复用还是新增，减少重复代码和逻辑漂移
    

**4. 统一产出标准：方法命名、入参出参、SQL、日志、错误处理、注释风格一致 SKILL**

业务里常见的混乱是：

*   有人用原生 SDK，有人用封装方法；有人返回 list，有人聚合成 map
    
*   命名随意、注释不规范导致后续使用 / 维护困难
    

SKILL 通过 examples.md 固化两种范式，让生成代码符合 OS 官方 SDK 调用规范

**5. 提升可维护性与可追溯性：让 “这个 API 干嘛的、在哪用、参数是什么” 一眼可查**

过去的业务场景中，想要了解某个 API 的相关信息：

*   强依赖注释是否规范
    
*   若注释较少，只能寻找 Owner 或通过 API ID 去 OS 平台查询
    

SKILL 可以通过 api_description.md 把 API 的相关信息沉淀下来，相当于轻量内部文档，后续排查和复用成本大幅降低

![](https://mmbiz.qpic.cn/mmbiz_png/oQ0houcyEicgL2wKHSia2yZvPibgX5CKmXECVAkHrlrHVtPlnd4ibyasd16kIZuqOQWUrZEeyGSUkPfZBX6icWlITFQ/640?wx_fmt=png&from=appmsg#imgIndex=4)

**使用规范**

**为提高 AI 生成代码的准确性，SKILL 当中严格规定了生成代码的规范**

**使用当前 SKILL，我们需要对以下规范进行约定**

**1. OS 的依赖库：**_**xxx/xxx/sqlclient**_

**2. 初始化和生成文件形式：**TRAE 使用 SKILL 生成代码会严格按照以下结构生成

```
Project Name
└── infra
    └── one_service/
        ├── client.go
        └── get_xxx_xxx.go
```

*   **_infra/one_service/client.go：_**存放初始化方法
    
    **_InitOneService：_**初始化 OS 的 Client，提供 SDK 调用
    
    **_SqlQuery：_**封装原生 SDK 提供的 **_SqlQuery_** 方法，添加日志记录
    
    **_QueryWithParam：_**封装原生 SDK 提供的 **_QueryWithParam_** 方法，添加日志记录
    
*   **_infra/one_service/get_xxx_xxx.go：_**TRAE 使用 SKILL 生成的 OS API 调用文件都会存放在 **_infra/one_service_** 目录下，文件名会根据 API 名称 AI 自行拟定
    

![](https://mmbiz.qpic.cn/mmbiz_png/oQ0houcyEicgL2wKHSia2yZvPibgX5CKmXEZcgtTMr4icKCPCNW5Zl7fngWQnQ20G80UMHs9k5p5eswMA8SAJM8IQw/640?wx_fmt=png&from=appmsg#imgIndex=5)

**开始实践**

1. 更新 TRAE 到版本 3.3.21 以上

2. 设置 -- 规则和技能 -- 创建技能

![](https://mmbiz.qpic.cn/mmbiz_png/oQ0houcyEicgL2wKHSia2yZvPibgX5CKmXEwYXX5po4JEHtmOTy06micJcJ3U7jTBna1jUh3efPS1EaBdt2hosD7AQ/640?wx_fmt=png&from=appmsg#imgIndex=6)

3. 上传 SKILL.md 文件或者包含 SKILL.md 和其他相关配置文件的压缩包

TRAE 目前针对 SKILL 功能支持两种一键上传的方式

*   直接上传 SKILL.md 文件
    
*   上传根目录下带有 SKILL.md 文件的压缩包，这个压缩包当中除了包含 SKILL.md 文件，还可能包含其他目录和配置文件
    

最终这个文件 / 压缩包都会被统一放在. trae/skills 目录下

![](https://mmbiz.qpic.cn/mmbiz_png/oQ0houcyEicgL2wKHSia2yZvPibgX5CKmXEjRCzHiciaKibwMxWanSvjcaaicmCSBKVaGZjv2hculBCict6pjKCKLEFmyw/640?wx_fmt=png&from=appmsg#imgIndex=7)

4. 新建任务，输入 Prompt ，使用 SKILL

```
// 方式一：输入请求参数和返回参数，调用QueryWithParam

我需要生成一个OneService API调用方法
API ID：xxxxxxxxx
名称：查询离线广告消耗指标
请求参数
...
返回参数
...

-----------------------------------------------------------

// 方式二：输入SQL，调用SqlQuery

我需要生成一个OneService API调用方法
API ID：xxxxxxxxx
名称：查询离线广告消耗指标
SQL：...
```

![](https://mmbiz.qpic.cn/mmbiz_png/oQ0houcyEicgL2wKHSia2yZvPibgX5CKmXEA2hDqyFKNFg0skQuVSeic3eEHb3rBAWq9BJXwmlV0h0ZKf11DRrkwrw/640?wx_fmt=png&from=appmsg#imgIndex=8)

**成果展示**

**未初始化 OS**

使用未初始化 OS 的 psm 进行测试

![](https://mmbiz.qpic.cn/mmbiz_png/oQ0houcyEicgL2wKHSia2yZvPibgX5CKmXElwYjGUyrzPWpM3VMd2NQfuBk5uAnHQhb3bADtFhNDOibMEXibBjb8I5w/640?wx_fmt=png&from=appmsg#imgIndex=9)

**生成结果：初始化 + 接口描述 + 新 API 调用**

*   infra 目录下，新增 _**one_service**_ 目录
    
*   导入 OS 依赖库，新增 **_client.go_** 初始化文件，**_infra/init.go_** 当中调用 OS 初始化方法
    
*   **_infra/one_service_** 目录下新增文件，其中包含所需 API 的调用方法
    
*   **_api.description.md_** 当中新增接口描述
    

![](https://mmbiz.qpic.cn/mmbiz_png/oQ0houcyEicgL2wKHSia2yZvPibgX5CKmXEPSXIeFh2QwJM1LPahgIeu4ImbveFvwIoZttVuPI1pw9aPWMoeRd4eg/640?wx_fmt=png&from=appmsg#imgIndex=10)

**已初始化 OS**

使用已初始化 OS 的 psm 进行测试

![](https://mmbiz.qpic.cn/mmbiz_png/oQ0houcyEicgL2wKHSia2yZvPibgX5CKmXE1d09ARRgVY4cx1CKSmByWiayxsdPOiawvuyricLQ1rWPiaHzZoO3VhSELA/640?wx_fmt=png&from=appmsg#imgIndex=11)

**生成结果：跳过初始化，只生成接口描述 + 新 API 调用**

*   **_infra/one_service_** 目录下新增文件，其中包含所需 API 的调用方法
    
*   **_api.description.md_** 当中新增接口描述
    

![](https://mmbiz.qpic.cn/mmbiz_png/oQ0houcyEicgL2wKHSia2yZvPibgX5CKmXEd7n9NLgqM5FOKzlEeiaf1YVywfXVa0xyJbnyiaMeS3Zjw4mU80SxYcKA/640?wx_fmt=png&from=appmsg#imgIndex=12)

![](https://mmbiz.qpic.cn/mmbiz_png/oQ0houcyEicgL2wKHSia2yZvPibgX5CKmXEn03JfsdgMknXQecsvPwMB3J2IDHhuzDltkfW899hAKvC2NBG4G7Kkg/640?wx_fmt=png&from=appmsg#imgIndex=13)

**SKILL 设计思路**

了解了具体的使用步骤之后，更关键的地方是

*   为什么这个 SKILL 要这么设计？
    
*   它的思路和组成结构是什么？
    

下面我们从设计思路、分层架构和具体 SKILL 文件编写几个方面，阐述这套 SKILL 的核心设计逻辑

**设计思路**

**树状结构体**

```
.TRAE/
└── SKILLs/
    └── generateosmethod/
        ├── api_description.md
        ├── examples.md
        └── SKILL.md
```

**核心思路**

把 “生成 OS API 调用代码” 这件事拆成三层：

*   规范 / 流程
    
*   可检索资产
    
*   可复制模板
    

从而保证生成结果一致、可复用、可治理

**1. 用 SKILL.md 做 “流程编排器”（强约束，防跑偏）**

*   SKILL.md 定义了**前置条件**（工程里必须已引入 SDK、初始化 Client、提供 Query/SqlQuery 封装）
    
*   **核心目的：**避免重复造轮子、避免生成与仓库现状不一致的调用方式（如果当前 PSM 已有 infra/oneservice/client.go 的封装形式，就应沿用）
    

**2. 用 api_description.md 做 “注册表 / 索引”（让生成具备记忆与可检索性）**

api_description.md 不是给编译器看的，而是**给 “人 + 工具” 看**的：记录每个 API ID 对应的用途、SQL、入参 / 出参表格、以及生成到哪个 go 文件

它承担两个关键职责：

*   **去重与复用入口 ：**生成前先在这里按 API ID 搜索，避免仓库里已经存在同 ID 的方法还重复生成。
    
*   **知识沉淀 ：**后续任何人要查 “某个 OS API 干什么、在哪个文件、参数是什么”，不用去 os 平台或者看源代码，直接看描述文件即可
    

**3. 用 examples.md 做 “代码模板库”（统一代码风格与调用姿势）**

examples.md 给出两种标准范式：

*   方式一：用户提供的是 “参数化查询”，用 QueryWithParams
    
*   方式二：用户提供的是 “SQL 字符串”，用 SqlQuery
    

生成代码时对齐示例的导包、日志、返回聚合方式等，保证整个 repo 的 OS 调用 “长得一样”，降低维护成本

**4. 与业务仓库结构解耦：SKILL 只管 “怎么生成”，代码落在 infra/oneservice**

*   SKILL 目录里不放业务 go 代码，只放 “规则与模板”；真正生成的调用方法落到仓库既有的 OS 基建目录（统一是 infra 目录下的 OS 相关目录 ）
    
*   **核心目的：让 SKILL 可以跨项目复用，**不同 PSM 只要 infra 侧初始化方式略有不同，按前置条件对齐即可复用同一套生成流程
    

**SKILL.md**

**内容简介：SKILL 的流程以及规则设定**

*   **前置条件：**检查当前服务是否引入 OS 的 SDK 并初始化，若未引入，负责生成
    
*   **规定：**设置当前 SKILL 的使用时机，以及生成规范
    
*   **流程：**设置当前 SKILL 的执行链路，是渐进式披露的核心
    

**上下滑动查看完整内容**

```
---
name: GenerateOSMethod
description: 生成OnsService API调用方法
---
## 前置条件
#### 1.检查当前项目的infra目录中是否存在OneService的相关目录，并引入OneService的SDK并初始化好Client
#### 2.若当前项目未引入OneService的SDK或未初始化Client，请先引入并初始化好Client，按照以下步骤：
- 导入OneService的工具库，终端输入`go get xxx/xxx/sqlclient`
- 在infra目录下创建one_service目录，用于存放OneService的相关代码，包括Client的初始化代码
- 在one_service目录下创建client.go文件，用于初始化OneService的Client，代码示例如下：
```go
package one_service
import(
"xxx/xxx/sqlclient"
"xxx/xxx/logs"
"xxx/xxx/utils"
"context"
"sync"
)
var Client *sqlclient.SQLClient
var once sync.Once
func InitOneService(){
if Client != nil {
return
    }
    once.Do(func() {
// init client
       var err error
       Client, err = sqlclient.NewSqlClient()
if err != nil {
          panic(err)
       }
    })
}
func SqlQuery(ctx context.Context, id string, sql string, res interface{}) error {
    err := Client.SqlQuery(ctx, id, sql, res)
if err != nil {
       logs.CtxError(ctx, "[SqlQuery] query sql failed.id:%s,sql:%s,err:%s", id, sql, err.Error())
return err
    }
return nil
}
func QueryWithParam(ctx context.Context, id string, param map[string]interface{}, res interface{}) error {
    err := Client.QueryWithParams(ctx, id, param, res)
if err != nil {
       logs.CtxError(ctx, "[QueryWithParam] query sql failed.id:%s,param:%s,err:%s", id, utils.JsonMarshal(ctx, param), err.Error())
return err
    }
return nil
}
```
- 将InitOneService方法添加到infra目录下的init.go文件中，确保Client在项目启动时就被初始化好
- 如果当前项目的infra目录下已经存在OneService的相关目录，并有了初始化好的Client，检查是否有SqlQuery或QueryWithParam方法，没有则新增
## 规定
#### 1.你只有在以下情况下才需要使用GenerateOSMethod SKILL，使用前先检查前置条件
- 用户提到需要使用/新增OnsService接口
- 用户提供的代码生成链路文档、技术方案文档当中提到需要使用/新增OnsService接口
#### 2.你必须严格按照SKILL.md文件中规定的【流程】进行操作，不能偏离流程，只能在流程规定的阶段生成代码
#### 3.生成的API描述，参考api_description.md文件中的示例，保存到api_description.md文件中
#### 4.新增一个go文件，存放到infra/one_service目录（或者已有的infra下的其他OneService相关目录）下，新增的代码（API ID，调用方法，SQL语句，请求参数，响应参数）都存放到新增的go文件中，参考examples.md文件中的示例
---
## 流程
### 1. 检查用户是否输入了需要调用的OnsService的API ID
检查用户输入内容和文档当中是否明确指出了需要调用的OnsService的API ID
如果没有明确列出，请让用户输入确认需要调用的OnsService的API ID
### 2. 遍历当前已有OnsService API调用方法
在api_description.md文件中遍历所有定义好的OnsService的API ID
通过API ID进行匹配，检查是否已存在调用当前OneService API的方法
如果用户输入多个API ID，遍历每个ID进行匹配，然后列出每个API ID的调用方法的存在情况
### 3. 检查用户是否确认调用/新增OnsService接口
上一步列出所有输入的API ID的调用方法的存在情况的列表，发送给用户，让用户确认
- 匹配到已有的OneService API调用方法，提示用户是否直接使用
- 如果没有匹配到已有的OneService API调用方法，提示用户确认是否新增
### 4. 收集OnsService API信息
- 如果用户确认直接使用，直接使用已有的调用方法
- 如果用户确认新增，提示用户输入新增的OneService API的相关信息，包括API ID、SQL语句、请求参数、响应参数等
### 5. 生成OnsService API相关代码
根据用户输入的接口信息，需要生成以下内容
- api_description.md文件中新增对应API ID的描述，参考api_description.md文件中的示例
- 根据用户的输入，结合examples.md文件里的示例，生成新的go文件，存放到infra/one_service目录下
- 最终的效果，应该是只在infra/one_service目录（或者已有的infra下的其他OneService相关目录）下新增一个go文件，在api_description.md文件中新增对应API
  ID的描述
```

**examples.md**

**内容简介：SKILL 生成内容的模板**

*   **方式一：**调用 QueryWithParams 方法的生成示例模板
    
*   **方式二：**调用 SqlQuery 方法的生成示例模板
    

**上下滑动查看完整内容**

```
---

name：examples
description：OnsService的API调用方法代码示例
---
方式一：用户输入的是请求参数，调用QueryWithParams方法查询示例数据
```go
package one_service
import(
"context"
"xxx/xxx/jsonx"
"xxx/xxx/logs"
)
const(
// 示例API ID
    OneServiceAppId_Example = xxxxxxxx
)
type ExampleData struct {
    ExampleID int64 `gorm:"column:example_id"` // 示例ID
}
// 查询示例数据
func GetExampleData(ctx context.Context, exampleIds []int64)(map[int64]*ExampleData, error){
iflen(exampleIds)== 0 {
return nil, nil
    }
// OneService入参
    params := map[string]interface{}{}
// 示例ID列表
    params["example_ids"] = exampleIds
// OneService出参
    var rpcResp []*ExampleData
// 调用 OneService SQL 查询数据
    err := QueryWithParams(ctx, OneServiceAppId_Example, params, &rpcResp)
if err != nil {
       logs.CtxError(ctx, "GetExampleData QueryWithParams err:%v", err)
return nil, err
    }
    logs.CtxInfo(ctx, "GetExampleData appID %v, req is %v, resp is %v", OneServiceAppId_Example, jsonx.ToString(params), jsonx.ToString(rpcResp))
    result := make(map[int64]*ExampleData, len(rpcResp))
for _, item := range rpcResp {
if item == nil {
continue
       }
// 以 example_id 为 key 聚合
       result[item.ExampleID] = item
    }
return result, nil
}
```
方式二：用户输入的是SQL语句，调用SqlQuery方法查询示例数据
```go
package one_service
import (
"context"
"fmt"
"strings"
"xxx/xxx/jsonx"
"xxx/xxx/logs"
"xxx/xxx/utils/conv"
)
const (
// 示例API ID
    OneServiceAppId_Example = xxxxxxxx
)
type ExampleData struct {
    ExampleID int64 `gorm:"column:example_id"` // 示例ID
}
const (
// 示例SQL
    ExampleSql = "select example_id from example_table where example_id in (:example_ids)"
)
// 查询示例数据
func GetExampleData(ctx context.Context, exampleIds []int64) (map[int64]*ExampleData, error) {
if len(exampleIds) == 0 {
return nil, nil
    }
// OneService出参
    var rpcResp []*ExampleData
// 调用 OneService SQL 查询数据
    err := SqlQuery(ctx, OneServiceAppId_Example, ExampleSql, &rpcResp)
if err != nil {
       logs.CtxError(ctx, "GetExampleData SqlQuery err:%v", err)
return nil, err
    }
    logs.CtxInfo(ctx, "GetExampleData appID %v, req is %v, resp is %v",
       OneServiceAppId_Example,
       fmt.Sprintf(ExampleSql, strings.Join(conv.Int64sToStrs(exampleIds), ",")),
       jsonx.ToString(rpcResp))
    result := make(map[int64]*ExampleData, len(rpcResp))
for _, item := range rpcResp {
if item == nil {
continue
       }
// 以 example_id 为 key 聚合
       result[item.ExampleID] = item
    }
return result, nil
}

```
```

**api_description.md**

**内容简介：记录 OS API 的相关内容描述**

*   **方式一：**名称 + ID + 生成代码文件 + 请求 / 返回参数
    
*   **方式二：**名称 + ID + 生成代码文件 + 请求 SQL + 请求 / 返回参数
    

**上下滑动查看完整内容**

```
---

name：api_description
description：OnsService的API描述
---
## 接口列表
### API 名称（方式一示例，生成代码参考examples.md）
API ID：用户输入
生成代码文件：根据API名称生成对应的go文件
请求参数
| 参数名称    | 参数类型       | 是否必须 | 参数描述   |
|:--------|:-----------|:-----|:-------|
| xxx_ids | array[int] | 否    | xxid列表 |
|         |            |      |        |
返回参数
| 参数名称   | 参数类型 | 是否必须 | 参数描述 |
|:-------|:-----|:-----|:-----|
| xxx_id | int  | 否    | xxid |
|        |      |      |      |
---
### API 名称（方式二示例，生成代码参考examples.md）
API ID：用户输入
生成代码文件：根据API名称生成对应的go文件
请求SQL：select ...
请求参数
| 参数名称    | 参数类型       | 是否必须 | 参数描述   |
|:--------|:-----------|:-----|:-------|
| xxx_ids | array[int] | 否    | xxid列表 |
|         |            |      |        |
返回参数
| 参数名称   | 参数类型 | 是否必须 | 参数描述 |
|:-------|:-----|:-----|:-----|
| xxx_id | int  | 否    | xxid |
|        |      |      |      |

---
```

![](https://mmbiz.qpic.cn/mmbiz_png/oQ0houcyEicgL2wKHSia2yZvPibgX5CKmXEgedfznavR5aop4ZjhBGzH35Mj6yuhLic33iciauXRUsibWN5sQMba4da2A/640?wx_fmt=png&from=appmsg#imgIndex=14)

**总结**

**SKILL 的适用于****【稳定地】****执行****【多步骤】****的有****【固定流程】****的任务。**

**核心设计亮点：****渐进式披露**，即通过**分层加载 + 按需激活 + 零上下文执行**实现 Token 效率与功能深度的平衡，大幅降低上下文压力并提升任务执行准确性

*   **稳定性：**不掺杂过多**特殊因素和特殊业务场景**，90% 情况都是较为统一的
    
*   **多步骤：**相较于一步一步多轮对话，直接使用 SKILL 可以**一步到位**
    
*   **固定性：**Agent 会跟着 SKILL.md 当中定义的 steps 一步一步执行，相对于普通的多轮对话，AI 不会去扫盘和联想，一方面可以避免有庞大的上下文消耗，导致资源浪费，另一放面，减少大模型出现幻觉的概率，从而**避免乱回复、乱生成代码**的情况。
    

需要强调的是，文章当中的示例结合了公司内部的工具，相关配置大家肯定无法直接复用，本篇文章的核心如标题所示，是对 SKILL 设计思路的一次分享，希望大家可以从中获取灵感

凡是【稳定地】执行、包含【多步骤】、且具备【固定流程】的任务，都可以被抽象成清晰的 SOP，并通过 SKILL 固化下来，交给智能体去稳定、高效地执行

只要抓住 “先梳理流程，再结构化抽象，再让工具去执行” 这条主线，就能够在各类场景中持续沉淀出属于个人、部门、企业的自动化能力，而不仅仅局限于文中示例

AI 编程的未来会是什么样子，没有人能确切知道。但有一点是确定的：那些现在就开始认真学习、积极实践、深入理解的人，将最有能力塑造和适应这个未来

去实验，去失败，去学习。**这个过程本身，就是价值所在**

![](https://mmbiz.qpic.cn/mmbiz_png/oQ0houcyEicgL2wKHSia2yZvPibgX5CKmXEgWznCLbGPSelsGXUSRczRiadfqIwhClR63PZ0tnfDTe2EoyhPwYyl3w/640?wx_fmt=png&from=appmsg#imgIndex=15)