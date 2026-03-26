> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/2ekcArAUAv0MBfNcXFFHNA)

  

转自：

https://b-sirius.github.io/posts/learn-nestjs-with-diagram

笔者入门 Nest 的时候属实是迷糊了一阵，本文将从初学者的视角出发，试图为大家解释 Nestjs 到底是如何运作的。如有错误欢迎指出，谢谢～

![](https://mmbiz.qpic.cn/sz_mmbiz_png/mshqAkialV7EibGnmnQNiak9BfTtGnZUV6bTMeibAMHhntvBYwicnN9eDicnzjBAwpk6jqqiaP6bHUtfOz1JhIdbQ7EEg/640?wx_fmt=png&from=appmsg#imgIndex=0)

  

* * *

假设我们来做这样一个服务：宝可梦大全

提供四个接口：

1.  获取完整的宝可梦列表
    
2.  根据宝可梦编号获取某一只宝可梦的信息
    
3.  获取完整的技能列表
    
4.  根据某个技能获取可以学会该技能的宝可梦列表
    

Module = 模块
-----------

Module，中文译作模块，我们将从它来入手，搞清楚 Nestjs 大概是如何工作的。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/mshqAkialV7EibGnmnQNiak9BfTtGnZUV6bZEYqicCC9wMicibWYD96FFrlOuoOzKxiaOPWD5doHGlEAhicqljJGQGjTEQ/640?wx_fmt=png&from=appmsg#imgIndex=1)

  

官网这张图表达的很清楚，Nest 的大致理念就是一颗 “模块树”，从根模块出发，连接到许多的子功能模块。

我们的宝可梦查询的结构可能是这样的：

（本文中我们使用 Prisma 来操作数据库）

![](https://mmbiz.qpic.cn/sz_mmbiz_png/mshqAkialV7EibGnmnQNiak9BfTtGnZUV6b1ia4iaWokxADXdGqMrAYEFlRE5Ug8DwXBNEWuK2k6EWgcuQhEyFib1yMg/640?wx_fmt=png&from=appmsg#imgIndex=2)

现在让我们聚焦到其中一个功能模块：Pokemon Module

细说 Pokemon Module
-----------------

这个模块的领域是宝可梦，显然这是一个非常核心的模块。那么 “模块”，又是怎么运作的呢？

从外部看，“模块” 是一个黑盒，有自己的输入和输出：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/mshqAkialV7EibGnmnQNiak9BfTtGnZUV6b3bnD7REHeNkWTvZjG269a4nWI8vEF2Be8VUdUBYjmYHDiaqAHOccQYA/640?wx_fmt=png&from=appmsg#imgIndex=3)

而黑盒的内部，则主要是两部分：

1.  Services
    
2.  Controllers
    

Controllers 是接收请求的入口，Services 则是方法实现，这个应该不难理解

![](https://mmbiz.qpic.cn/sz_mmbiz_png/mshqAkialV7EibGnmnQNiak9BfTtGnZUV6bI9srTqyJMVAdQBRYulSd3XSmtymJ4NZTzMFcxckY9JdADm31kPuY4g/640?wx_fmt=png&from=appmsg#imgIndex=4)

那么我们仔细看看所谓的输入输出是什么。

### Module 的输入是什么？

由于宝可梦的信息是存在数据库中的，因此宝可梦模块需要 Prisma 模块来与数据库交互。所以 Prisma Module 是 Pokemon Module 的输入。

### Module 的输出是什么？

既然我们说 Prisma Module 是 Pokemon Module 的输入，那，Prisma Module 一定是输出了什么，对吧？

没错，Prisma Module 的输出就是 Prisma Service。Pokemon Module 可以使用 Prisma Service 中的各种方法来交互数据库。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/mshqAkialV7EibGnmnQNiak9BfTtGnZUV6bIicU7qDccMcLgYVJDdNSLm39Z0BDV2Uib4TH0RCeib4VpXhmjL9GicApng/640?wx_fmt=png&from=appmsg#imgIndex=5)

Provider?
---------

在刚刚的叙述中，我们还没有提及在 Nest 中非常有存在感的`Provider`。

我们说过，“Controllers 是接收请求的入口，Services 则是方法实现”，那么，Controllers 是如何调用 Services 的呢？答案就是，**当 Services 成为 Provider 时**。

这就像是同一样东西的两种名字。它既是 Pokemon Service，也是 Pokemon Module 的 Provider，取决于从什么视角去看他。因此，在代码中它往往表现为这样：

```
// nestjs project directory|-pokemon| |_pokemon.module.ts| |_pokemon.controller.ts| |_pokemon.service.ts|-......
```

```
// pokemon.module.ts@Module({  controllers: [PokemonController],  providers: [PokemonService],  imports: [PrismaModule],  exports: [PokemonService],})
```

```
// pokemon.controller.tsexportclass PokemonController {// 正是因为Module的providers中传入了PokemonService// Controller的constructor才能接收到pokemonService参数constructor(private readonly pokemonService: PokemonService) {}@Get('/find/all')async findAll() {    const allPokemons = awaitthis.pokemonService.findAll();// ......  }@Get('/find/:id')async findOne(    @Param('id', ParseIntPipe) id: number,  ) {    const pokemon = awaitthis.pokemonService.findOne(id);// ......  }}
```

```
// pokemon.service.ts// 此行Injectable装饰器也是必要的// 关于Dependency Injection的更多信息，建议参考Angular官方文档：https://angular.dev/guide/di@Injectable()exportclass PokemonService {constructor(private prisma: PrismaService) {}  parsePokemon(pokemon) {    // ...  }async findAll() {    const pokemons = awaitthis.prisma.pokemon.findMany({      include: {        likes: true,      },    });    return pokemons.map((item) =>this.parsePokemon(item));  }async findOne(id: number) {    const pokemon = awaitthis.prisma.pokemon.findUnique({      where: { id }    });    if (!pokemon) {      thrownew NotFoundException(`pokemon ${id} not found`);    }    returnthis.parsePokemon(pokemon);  }}
```

### Provider vs Import

在上面的例子我们可以看到，由于 Injectable 的 PokemonService 被放入了 module 定义的`providers`中，PokemonController 便可以使用它，那么它的功能岂不是和`imports`重叠了？

事实上，如果我们去掉`imports`，将`Prisma Service`也放到`providers`中，我们的代码依然可以运行：

```
// pokemon.module.ts@Module({  controllers: [PokemonController],  providers: [PokemonService, PrismaService],  imports: [],  exports: [PokemonService],})
```

直接先说结论：**用 Import**。

具体来说，只要是用外部服务（也就是除去 PokemonModule 将 PokemonService 作为 Provider 这种情况），使用 import 更为合适。

区别在于：**import module 会复用已经创建的实例，而每个 provider 都会创建新的实例。**

前者占用更少的内存，且一个可复用的实例在多处被使用在需求中也更加常见。

```
// pokemon.module.ts// 推荐@Module({  controllers: [PokemonController],  providers: [PokemonService],  imports: [PrismaModule],  exports: [PokemonService],})// 不推荐@Module({  controllers: [PokemonController],  providers: [PokemonService, PrismaService],  imports: [],  exports: [PokemonService],})
```

总结
--

看一个 Nestjs 应用是怎么跑的，首先就是看明白 Module 之间是如何互相作用的。

那么在实现我们自己的 Module 时，只需要记住：

*   定义自己的 controllers
    
*   定义自己的 service
    
*   把自己的 service 放在 providers 中，这样 controllers 才能用 service
    
*   如果需要用外部的 service，将外部 module 放在 imports 里
    
*   如果自己的 service 也需要被其他 module 使用，将自己的 service 放到 exports 里
    

比如这样：

```
// pokemon.module.ts@Module({  controllers: [PokemonController],  providers: [PokemonService],  imports: [PrismaModule],  exports: [PokemonService],})// skill.module.ts@Module({  controllers: [SkillController],  providers: [SkillService],  imports: [PrismaModule, PokemonModule],})
```

好了，恭喜你，你已经完全掌握 Nestjs 了！

![](https://mmbiz.qpic.cn/sz_mmbiz_png/mshqAkialV7EibGnmnQNiak9BfTtGnZUV6b3W5n049MlicyfUZnr260c2NMkh0r52MgBSKxDMpia1Ed1aJQibXp0eryw/640?wx_fmt=png&from=appmsg#imgIndex=6)