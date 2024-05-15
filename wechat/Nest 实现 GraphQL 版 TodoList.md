> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/BT4_Sg9FOQknv-lUcTT0Og)

我们经常用 restful 的接口来开发业务。

比如 GET 请求 /students 查询所有学生，/students/1 查询 id 为 1 的学生

发送 POST、PUT、DETETE 请求分别代表增删改。

其实也可以用 GraphQL 的方式来写接口：

查询：![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjjRia5eSicv9Iw2scnRv5Pd7akjEurTk9cpaiaOvk2M7Err3DIOrukkxyB2XV3CTQwddvMRjjgyKXXQ/640?wx_fmt=png&from=appmsg)

新增：![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjjRia5eSicv9Iw2scnRv5Pd7fOM7fQ1uk8lzYAK2hicTT5klfa2gLolFAqzWfDOaBBanruQWaw79ic6A/640?wx_fmt=png&from=appmsg)

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjjRia5eSicv9Iw2scnRv5Pd7L1U33PpGpsye9Lk7g52zhhOcKVGgkrYRmJDNufOGU07UbmaFwbTNtg/640?wx_fmt=png&from=appmsg)

增删改查都在一个接口里搞定，并且想要什么数据由前端自己取。

今天我们就用 Nest + GrahQL 做一个 TodoList 的增删改查。

数据存在 mysql 里，用 Prisma 作为 ORM 框架。

```
npm install -g @nestjs/cli

nest new graphql-todolist
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjjRia5eSicv9Iw2scnRv5Pd7spNfORL9ArgZOBcoCDwicl2yAhn9dr8ibicT8tISAHZgebdvFOyiaPqRjA/640?wx_fmt=png&from=appmsg)

创建个项目，然后我们首先来实现 restful 接口的增删改查。

用 docker 把 mysql 跑起来：

从 docker 官网下载 docker desktop，这个是 docker 的桌面端：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjjRia5eSicv9Iw2scnRv5Pd79HDrgpSZQnIJkFMyhlSJLYTQjdGsOwcnCFgHZyia9zhL0Aib69ZT2Z2A/640?wx_fmt=png&from=appmsg)

跑起来后，搜索 mysql 镜像（这步需要科学上网），点击 run：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjjRia5eSicv9Iw2scnRv5Pd7xzjppcHicicdulULWuQVQGXAzcbxJtcLPksvGex3FVEE4tbgK2Lcugicg/640?wx_fmt=png&from=appmsg)

输入容器名、端口映射、以及挂载的数据卷，还要指定一个环境变量：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjjRia5eSicv9Iw2scnRv5Pd7HFqibt66f0BkK1Ns4BakGcHLR1tTuR4uK7RaerIgBjLcSmQEFY9DvYw/640?wx_fmt=png&from=appmsg)

端口映射就是把宿主机的 3306 端口映射到容器里的 3306 端口，这样就可以在宿主机访问了。

数据卷挂载就是把宿主机的某个目录映射到容器里的 /var/lib/mysql 目录，这样数据是保存在本地的，不会丢失。

而 MYSQL_ROOT_PASSWORD 的密码则是 mysql 连接时候的密码。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjjRia5eSicv9Iw2scnRv5Pd7vWYNib1ia25zsQWicQZrS5XhwlD3TcdF6ckiarNNsQLibicuD0icxpPpMyAZw/640?wx_fmt=png&from=appmsg)

跑起来后，我们用 GUI 客户端连上，这里我们用的是 mysql workbench，这是 mysql 官方提供的免费客户端：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjjRia5eSicv9Iw2scnRv5Pd7bmC2rqy486qc1R7W1uPZqrRHec1ia2B6PicLC1ADJgkWhxNkTgRXC3mg/640?wx_fmt=png&from=appmsg)

连接上之后，点击创建 database：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjjRia5eSicv9Iw2scnRv5Pd7U3vYicAWVnic6VONCTprUqibgDZxqVMMzLcfstCeVYbvBKnZmY37gCBUg/640?wx_fmt=png&from=appmsg)

指定名字、字符集为 utf8mb4，然后点击右下角的 apply。

创建成功之后在左侧就可以看到这个 database 了：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjjRia5eSicv9Iw2scnRv5Pd7az5VicuUDfYLunNwJ60Bicozibn68fpmrWJGMLBD4ksPAzNcapqhYKviaA/640?wx_fmt=png&from=appmsg)

现在还没有表。

我们在 Nest 里用 Prisma 连接 mysql。

进入项目，安装 prisma

```
npm install prisma --save-dev
```

执行 prisma init 创建 schema 文件：

```
npx prisma init
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjjRia5eSicv9Iw2scnRv5Pd7IcNynj9h5eeOmTNnWvAc3Ol0UfCibFTiafydIE8t5LfmhFV7fRsdpkPA/640?wx_fmt=png&from=appmsg)

生成了 schema 文件（用来定义 model 的），和 .env 文件：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjjRia5eSicv9Iw2scnRv5Pd79s67owX5HicAP7AGqzs0NxXMes9gNWUBEzpgicl3A6aia6tTRrtxYQBlA/640?wx_fmt=png&from=appmsg)

改下 .env 的配置：

```
DATABASE_URL="mysql://root:你的密码@localhost:3306/todolist"
```

并且修改下 schema 里的 datasource 部分：

```
datasource db {  provider = "mysql"  url      = env("DATABASE_URL")}
```

然后创建 model：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjjRia5eSicv9Iw2scnRv5Pd7Y8Eu0JGUERicDrTMBZTWydMl8105d0BAcriaAmqiaqQsHYqibibdHUWLJWA/640?wx_fmt=png&from=appmsg)

```
generator client {  provider = "prisma-client-js"}datasource db {  provider = "mysql"  url      = env("DATABASE_URL")}model TodoItem {  id        Int    @id @default(autoincrement())  content    String  @db.VarChar(50)  createTime DateTime @default(now())  updateTime DateTime @updatedAt}
```

id 自增，content 是长度为 50 的字符串，还有创建时间 createTime、更新时间 updateTime。

执行 prisma migrate dev，它会根据定义的 model 去创建表：

```
npx prisma migrate dev --name init
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjjRia5eSicv9Iw2scnRv5Pd7tMBYKykPy5ibicKbj1ytibXjiaUbweIj6Les0HCTjpYVPLm1S7j9lE4k2Q/640?wx_fmt=png&from=appmsg)

它会生成 sql 文件，里面是这次执行的 sql。

然后还会生成 client 代码，用来连接数据库操作这个表。

可以看到，这次执行的 sql 就是 create table 建表语句：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjjRia5eSicv9Iw2scnRv5Pd7CNNmQJ0p0FeDd34H2lOFN5YqWVGe8L6p8Q7AMTOnTV0y4hEic8iapG0A/640?wx_fmt=png&from=appmsg)

这时候数据库就就有这个表了：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjjRia5eSicv9Iw2scnRv5Pd7ZSVvjkyR5uYMPrARuwLRfcR4YKrmibu2Z5JxaUyw4oHthjIXIIR54rA/640?wx_fmt=png&from=appmsg)

接下来我们就可以在代码里做 CRUD 了。

生成一个 service：

```
nest g service prisma --flat --no-spec
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjjRia5eSicv9Iw2scnRv5Pd7b2vgIH9epmSnDI9iax0rJicia8mpgebPGt0EYLoTBlcZww0nNn8LRibtVg/640?wx_fmt=png&from=appmsg)

改下生成的 PrismaService，继承 PrismaClient，这样它就有 crud 的 api 了：

```
import { Injectable, OnModuleInit } from '@nestjs/common';import { PrismaClient } from '@prisma/client';@Injectable()export class PrismaService extends PrismaClient implements OnModuleInit {    constructor() {        super({            log: [                {                    emit: 'stdout',                    level: 'query'                }            ]        })    }    async onModuleInit() {        await this.$connect();    }}
```

在 constructor 里设置 PrismaClient 的 log 参数，也就是打印 sql 到控制台。

在 onModuleInit 的生命周期方法里调用 $connect 来连接数据库。

然后在 AppService 里注入 PrismaService，实现 CRUD：

```
import { Inject, Injectable } from '@nestjs/common';import { PrismaService } from './prisma.service';import { CreateTodoList } from './todolist-create.dto';import { UpdateTodoList } from './todolist-update.dto';@Injectable()export class AppService {  getHello(): string {    return 'Hello World!';  }  @Inject(PrismaService)  private prismaService: PrismaService;  async query() {    return this.prismaService.todoItem.findMany({      select: {        id: true,        content: true,        createTime: true      }    });  }  async create(todoItem: CreateTodoList) {    return this.prismaService.todoItem.create({      data: todoItem,      select: {        id: true,        content: true,        createTime: true      }    });  }  async update(todoItem: UpdateTodoList) {    return this.prismaService.todoItem.update({      where: {        id: todoItem.id      },      data: todoItem,      select: {        id: true,        content: true,        createTime: true      }    });  }  async remove(id: number) {    return this.prismaService.todoItem.delete({      where: {        id      }    })  }}
```

@Inject 注入 PrismaService，用它来做 CRUD，where 是条件、data 是数据，select 是回显的字段：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjjRia5eSicv9Iw2scnRv5Pd75E8ia7Quoxw1gonKjdATQMUXYKtmF2EbXtLKKa9h14nfwBbeRtiapcibQ/640?wx_fmt=png&from=appmsg)

然后创建用到的两个 dto 的 class

todolist-create.dto.ts

```
export class CreateTodoList {    content: string;}
```

todolist-update.dto.ts

```
export class UpdateTodoList {    id: number;    content: string;}
```

在 AppController 里引入下，添加几个路由：

```
import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';import { AppService } from './app.service';import { CreateTodoList } from './todolist-create.dto';import { UpdateTodoList } from './todolist-update.dto';@Controller()export class AppController {  constructor(private readonly appService: AppService) {}  @Get()  getHello(): string {    return this.appService.getHello();  }  @Post('create')  async create(@Body() todoItem: CreateTodoList) {    return this.appService.create(todoItem);  }  @Post('update')  async update(@Body() todoItem: UpdateTodoList) {    return this.appService.update(todoItem);  }  @Get('delete')  async delete(@Query('id') id: number) {    return this.appService.remove(+id);  }  @Get('list')  async list() {    return this.appService.query();  }}
```

添加增删改查 4 个路由，post 请求用 @Body() 注入请求体，@Query 拿路径中的参数：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjjRia5eSicv9Iw2scnRv5Pd7pyy9llvdcsRiaVjJdYg859o4epXC0tic35hmnibaRTftOdAzRQUYE2lZw/640?wx_fmt=png&from=appmsg)

把服务跑起来试一下：

```
npm run start:dev
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjjRia5eSicv9Iw2scnRv5Pd74G9zNOa9jZJNW7McDYERYjW5MWhT8mmicH4iaooczbb91zpvnnPAPo4A/640?wx_fmt=png&from=appmsg)

首先是 list，现在没有数据：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjjRia5eSicv9Iw2scnRv5Pd70qwy4Ef9z0bRy1GgUPEw69Xm5oicfd15kXDTVyfiatqnpLx8CateE2cg/640?wx_fmt=png&from=appmsg)

然后添加一个：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjjRia5eSicv9Iw2scnRv5Pd7krMia62VurP5bxOiawpgg66K2TsicwNUysWwZFtRAossxHficHBpvlKVAw/640?wx_fmt=png&from=appmsg)

服务端打印了 insert into 的 sql：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjjRia5eSicv9Iw2scnRv5Pd7Fvbk6gqAQFxdmDtaticnEpD3MvibcI1vcnicYibAysaxiaXMqpejl7aL7JA/640?wx_fmt=png&from=appmsg)

数据库也有了这条记录：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjjRia5eSicv9Iw2scnRv5Pd7MKJlh3kxL3xGjJ1bVj4cqibTuTJpjdyrkNvTJUmpx6IWjoIxmibmhiagg/640?wx_fmt=png&from=appmsg)

再加一个：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjjRia5eSicv9Iw2scnRv5Pd7m09am1wyHvsOvhkOeF9VzA8MwvwGG0lPibwmM5fnvWdOFo0t6eSV55Q/640?wx_fmt=png&from=appmsg)

然后查一下：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjjRia5eSicv9Iw2scnRv5Pd7qztn6KosVmeoFCQaeEibjoCcX2YibKE4Mjicfq83Jync8l0dBRY28HX2Q/640?wx_fmt=png&from=appmsg)

接下来试下修改、删除：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjjRia5eSicv9Iw2scnRv5Pd7b80fT9JSO5HB386Ac6sJlZ1VtgW1jZNNCFFq9CXMicH9SM4XUeq3YHA/640?wx_fmt=png&from=appmsg)![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjjRia5eSicv9Iw2scnRv5Pd7nfbu8tIkpBiaO2guydS1icpQJxYvibmweuV7S3sUK92Ja47e65LhZZuKg/640?wx_fmt=png&from=appmsg)

再查一下：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjjRia5eSicv9Iw2scnRv5Pd7NLt4DgG8b0LZrC1QNOr1uV18IiaXE1SdWb7ajNKVkDicFE3KwAEApd7g/640?wx_fmt=png&from=appmsg)

没啥问题。

这样，todolist 的 restful 版接口就完成了。

接下来实现 graphql 版本：

安装用到的包：

```
npm i @nestjs/graphql @nestjs/apollo @apollo/server graphql
```

然后在 AppModule 里引入下：

```
import { Module } from '@nestjs/common';import { AppController } from './app.controller';import { AppService } from './app.service';import { PrismaService } from './prisma.service';import { GraphQLModule } from '@nestjs/graphql';import { ApolloDriver } from '@nestjs/apollo';@Module({  imports: [    GraphQLModule.forRoot({      driver: ApolloDriver,      typePaths: ['./**/*.graphql'],    })  ],  controllers: [AppController],  providers: [AppService, PrismaService],})export class AppModule {}
```

typePaths 就是 schema 文件的路径：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjjRia5eSicv9Iw2scnRv5Pd7f1cgSnKiaVricr2dxBZykGz4e2gibj4zWuc1DzrcLJMQ2d7zYicJY2nExg/640?wx_fmt=png&from=appmsg)

添加一个 todolist.graphql

```
type TodoItem {
    id: Int
    content: String
}

input CreateTodoItemInput {
  content: String
}

input UpdateTodoItemInput {
  id: Int!
  content: String
}

type Query {
  todolist: [TodoItem]!
  queryById(id: Int!): TodoItem
}


type Mutation {
  createTodoItem(todoItem: CreateTodoItemInput!): TodoItem!
  updateTodoItem(todoItem: UpdateTodoItemInput!): TodoItem!
  removeTodoItem(id: Int!): Int
}
```

语法比较容易看懂，就是定义数据的结构。

在 Query 下定义查询的接口，在 Mutation 下定义增删改的接口。

然后实现 resolver，也就是这些接口的实现：

```
nest g resolver todolist --no-spec --flat
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjjRia5eSicv9Iw2scnRv5Pd7kpu7Vwxpg3sqTckrB1QrzMfV8EDicemiaZ5X9OFcZ0ia1hCZLIV0lVGCQ/640?wx_fmt=png&from=appmsg)

```
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';import { PrismaService } from './prisma.service';import { Inject } from '@nestjs/common';import { CreateTodoList } from './todolist-create.dto';import { UpdateTodoList } from './todolist-update.dto';@Resolver()export class TodolistResolver {    @Inject(PrismaService)    private prismaService: PrismaService;    @Query("todolist")    async todolist() {        return this.prismaService.todoItem.findMany();    }    @Query("queryById")    async queryById(@Args('id') id) {        return this.prismaService.todoItem.findUnique({            where: {                id            }        })    }    @Mutation("createTodoItem")    async createTodoItem(@Args("todoItem") todoItem: CreateTodoList) {        return this.prismaService.todoItem.create({            data: todoItem,            select: {              id: true,              content: true,              createTime: true            }          });    }    @Mutation("updateTodoItem")    async updateTodoItem(@Args('todoItem') todoItem: UpdateTodoList) {        return this.prismaService.todoItem.update({            where: {              id: todoItem.id            },            data: todoItem,            select: {              id: true,              content: true,              createTime: true            }          });    }    @Mutation("removeTodoItem")    async removeTodoItem(@Args('id') id: number) {        await this.prismaService.todoItem.delete({            where: {              id            }        })        return id;    }}
```

用 @Resolver 声明 resolver，用 @Query 声明查询接口，@Mutation 声明增删改接口，@Args 取传入的参数。

具体增删改查的实现和之前一样。

浏览器访问 http://localhost:3000/graphql 就是 playground，可以在这里查询：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjjRia5eSicv9Iw2scnRv5Pd75qFm8BMpib3WicGHR0HevRPmADyLE38Orw1feMRazBNBylVDuAvUnZkw/640?wx_fmt=png&from=appmsg)

左边输入查询语法，右边是执行后返回的结果。

当然，对新手来说这个 playground 不够友好，没有提示。

我们换一个：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjjRia5eSicv9Iw2scnRv5Pd7yKjV7AUdfTEkM41gUx1LaVcSqzFSmh45iaia4rm0AsOvAEic6J2PXxr4w/640?wx_fmt=png&from=appmsg)

```
import { Module } from '@nestjs/common';import { AppController } from './app.controller';import { AppService } from './app.service';import { PrismaService } from './prisma.service';import { GraphQLModule } from '@nestjs/graphql';import { ApolloDriver } from '@nestjs/apollo';import { TodolistResolver } from './todolist.resolver';import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';@Module({  imports: [    GraphQLModule.forRoot({      driver: ApolloDriver,      typePaths: ['./**/*.graphql'],      playground: false,      plugins: [ApolloServerPluginLandingPageLocalDefault()],    })  ],  controllers: [AppController],  providers: [AppService, PrismaService, TodolistResolver],})export class AppModule {}
```

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/YprkEU0TtGjjRia5eSicv9Iw2scnRv5Pd7vxAJdLNDE2XSm7OAiaTGqicB1iaFXFXO5awibvRTRtrUB0aM5z03e04ib5A/640?wx_fmt=gif&from=appmsg)

试一下新增：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjjRia5eSicv9Iw2scnRv5Pd7icJgNwFLjcAicEa5nX93egKC8xuxfiboIUqAfoMsts1HEIWDUEiaHAfB8Q/640?wx_fmt=png&from=appmsg)

查询：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjjRia5eSicv9Iw2scnRv5Pd7kwQf8Y0NZ3UP2Su2eIbFJvCIFCylVnZJnC6TYXdvHs99IqM5fmwIxA/640?wx_fmt=png&from=appmsg)

修改：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjjRia5eSicv9Iw2scnRv5Pd7NV2LyYaSNs6ga3TVfDI78WXB9AWgecY9Lb3fRHEDOHCgHJ29GA0UvA/640?wx_fmt=png&from=appmsg)

单个查询：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjjRia5eSicv9Iw2scnRv5Pd7ZQ8gyL6ib57cQyTmIZicdaDNXcnia598oQprx7nEuZ8FU3erzgyEl3mAg/640?wx_fmt=png&from=appmsg)

删除：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjjRia5eSicv9Iw2scnRv5Pd7nDq8UyaQLqHR41OTwoBlFnysp7xNsBiaCve2VYZrAYR1Tf9jQicZu1hQ/640?wx_fmt=png&from=appmsg)

查询：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjjRia5eSicv9Iw2scnRv5Pd7rpb8icbMNTburCYnWWBc7GoOsRBgcuk6PfZZHK4mpxZkJ4RH7UTQ2Mw/640?wx_fmt=png&from=appmsg)

基于 GraphQL 的增删改查都成功了！

然后在 react 项目里调用下。

```
npx create-vite
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjjRia5eSicv9Iw2scnRv5Pd7icZwMgU96lo5EX93yAUfZgHf4RfdecFOfIPTItCRcsFsCkkQ8eFibRCA/640?wx_fmt=png&from=appmsg)

进入项目，安装 @apollo/client

```
npm install

npm install @apollo/client
```

改下 main.tsx

```
import * as ReactDOM from 'react-dom/client';import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';import App from './App';const client = new ApolloClient({  uri: 'http://localhost:3000/graphql',  cache: new InMemoryCache(),});const root = ReactDOM.createRoot(document.getElementById('root')!);root.render(  <ApolloProvider client={client}>    <App />  </ApolloProvider>,);
```

创建 ApolloClient 并设置到 ApolloProvider。

然后在 App.tsx 里用 useQuery 发请求：

```
import { gql, useQuery } from '@apollo/client';const getTodoList = gql`  query Query {    todolist {      content      id    }  }`;type TodoItem = {  id: number;  content: string;}type TodoList = {  todolist: Array<TodoItem>;}export default function App() {  const { loading, error, data } = useQuery<TodoList>(getTodoList);  if (loading) return 'Loading...';  if (error) return `Error! ${error.message}`;  return (    <ul>      {        data?.todolist?.map(item => {          return <li key={item.id}>{item.content}</li>        })      }    </ul>  );}
```

把服务跑起来：

```
npm run dev
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjjRia5eSicv9Iw2scnRv5Pd7pSqfSgLPhr4PBl87DSvOVHhR8CkiblmvqXBP8ibq2biaYJSeov1Q9zZ9w/640?wx_fmt=png&from=appmsg)

这里涉及到的跨域，现在后端服务里开启下跨域支持：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjjRia5eSicv9Iw2scnRv5Pd7fuvWWia362ibEMpzD6zbINicpib4iaIadJBr3SZb49sCmxvjXibQcfQNrGAg/640?wx_fmt=png&from=appmsg)

可以看到，返回了查询结果：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjjRia5eSicv9Iw2scnRv5Pd7LudyDNJ17zObbVsZHDsNFaFR3I1iaRnSCibsyhhXuiaby3755C3end8NA/640?wx_fmt=png&from=appmsg)

然后加一下新增：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjjRia5eSicv9Iw2scnRv5Pd7QdQnjYicZ2zZZmWLbMJbacSu1kOxkQuX72WARyPbvYG66hnQdmmR3DQ/640?wx_fmt=png&from=appmsg)

用 useMutation 的 hook，指定 refetchQueries 也就是修改完之后重新获取数据。

调用的时候传入 content 数据。

```
import { gql, useMutation, useQuery } from '@apollo/client';const getTodoList = gql`  query Query {    todolist {      content      id    }  }`;const createTodoItem = gql`  mutation Mutation($todoItem: CreateTodoItemInput!) {    createTodoItem(todoItem: $todoItem) {      id      content    }  }`;type TodoItem = {  id: number;  content: string;}type TodoList = {  todolist: Array<TodoItem>;}export default function App() {  const { loading, error, data } = useQuery<TodoList>(getTodoList);  const [createTodo] = useMutation(createTodoItem, {    refetchQueries: [getTodoList]  });  async function onClick() {    await createTodo({      variables: {        todoItem: {          content: Math.random().toString().slice(2, 10)        }      }    })  }  if (loading) return 'Loading...';  if (error) return `Error! ${error.message}`;  return (    <div>      <button onClick={onClick}>新增</button>      <ul>        {          data?.todolist?.map(item => {            return <li key={item.id}>{item.content}</li>          })        }      </ul>    </div>  );}
```

测试下：

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/YprkEU0TtGjjRia5eSicv9Iw2scnRv5Pd7DtXyoQ1rTU5kk2nrU3m5OwoPsN79a2hNAQ69SQXqZumQkfexaxtV3Q/640?wx_fmt=gif&from=appmsg)

数据库里也可能看到新增的数据：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjjRia5eSicv9Iw2scnRv5Pd730iavlk0vxDWthJuFgicw6xSDLteYky1WtnC7Z5jia39t8R6NiaStKplFg/640?wx_fmt=png&from=appmsg)

这样，我们就能在 react 项目里用 graphql 做 CRUD 了。

案例代码上传了 github。

后端代码： https://github.com/QuarkGluonPlasma/nestjs-course-code/tree/main/graphql-todolist

前端代码：https://github.com/QuarkGluonPlasma/nestjs-course-code/tree/main/graphql-todolist-client

总结
--

我们实现了 Restful 和 GraphQL 版的 CRUD。

前端用 React + @apollo/client。

后端用 Nest + GraphQL + Prisma + MySQL。

GraphQL 主要是定义 schema 和 resolver 两部分，schema 是 Query、Mutation 的结构，resolver 是它的实现。

可以在 playground 里调用接口，也可以在 react 里用 @appolo/client 调用。

相比 restful 的版本，graphql 只需要一个接口，然后用查询语言来查，需要什么数据取什么数据，更加灵活。

业务开发中，你会选择用 GraphQL 开发接口么？