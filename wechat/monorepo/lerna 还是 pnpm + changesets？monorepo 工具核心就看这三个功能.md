> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/AKoCqtUTDpkrrDwor3Kxlw)

monorepo 是多个包在同一个项目中管理的方式，是很流行的项目组织形式。

主流的开源包基本都是用 monorepo 的形式管理的。

为什么用 monorepo 也很容易理解：

比如 babel 分为了 @babel/core、@babel/cli、@babel/parser、@babel/traverse、@babel/generator 等一系列包。

如果每个包单独一个仓库，那就有十多个 git 仓库，这些 git 仓库每个都要单独来一套编译、lint、发包等工程化的工具和配置，重复十多次。

工程化部分重复还不是最大的问题，最大的问题还是这三个：

1.  一个项目依赖了一个本地还在开发的包，我们会通过 npm link 的方式把这个包 link 到全局，然后再 link 到那个项目的 node_modules 下。
    

npm link 的文档是这么写的：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGhwLoOQVlPgYI3CEZ1iaQ6557aDbIbhJVN4KDsibEWOELomBicprbyIhIjDJTQRpPticxyPjDRJLJDLTg/640?wx_fmt=png)

就是把代码 link 到全局再 link 到另一个项目，这样只要这个包的代码改了，那个项目就可以直接使用最新的代码。

如果只是一个包的话，npm link 还是方便的。但现在有十几个包了，这样来十多次就很麻烦了。

2.  需要在每个包里执行命令，现在也是要分别进入到不同的目录下来执行十多次。最关键的是有一些包需要根据依赖关系来确定执行命令的先后顺序。
    
3.  版本更新的时候，要手动更新所有包的版本，如果这个包更新了，那么依赖它的包也要发个新版本才行。
    

这也是件麻烦的事情。

因为这三个问题：npm link 比较麻烦、执行命令比较麻烦、版本更新比较麻烦，所以就有了对 monorepo 的项目组织形式和工具的需求。

比如主流的 monorepo 工具 lerna，它描述自己解决的三个大问题也是这个：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGhwLoOQVlPgYI3CEZ1iaQ655FMDgDZLFmzMs7gN51HVxoqJTLboszywOGA3fQpUrzHthtibKwtY4IdQ/640?wx_fmt=png)

也就是说，把理清了这三个点，就算是掌握了 monorepo 工具的关键了。

我们分别来看一下：

npm link 的流程实际上是这样的：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGhwLoOQVlPgYI3CEZ1iaQ655S9y1LcvVBjN6CBRAPZaNdG6K17ibjZXGXSnpUZSicTvnia8lb9Je97apw/640?wx_fmt=png)

npm 包先 link 到全局，再 link 到另一个项目的 node_modules。

而 monorepo 工具都是这样做的：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGhwLoOQVlPgYI3CEZ1iaQ655icHKcEMxyJygS1LaQusia7uthPG8EqByX1J2ZLsB2iaCTj7pufcOwRkaw/640?wx_fmt=png)

比如一个 monorepo 项目下有 a、b、c 三个包，那么 monorepo 工具会把它们 link 到父级目录的 node_modules。

node 查找模块的时候，一层层往上查找，就都能找到彼此了，就完成了 a、b、c 的相互依赖。

比如用 lerna 的 demo 项目试试：

```
git clone https://github.com/lerna/getting-started-example.git
```

下载下来是这样的结构：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGhwLoOQVlPgYI3CEZ1iaQ655788GBIheg33nAZIYzibYiczGo6a3dMaR9OfllC7oHZNgecNLHdTxC7MQ/640?wx_fmt=png)

执行 npm install，在根目录的 node_modules 下就会安装很多依赖。

包括我们刚说的 link 到根 node_modules 里的包：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGhwLoOQVlPgYI3CEZ1iaQ6550Df3xm2rdozrg5RGjCGpC81IKngOxl5zmgQfialRSkYMeRqKq8NicobA/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGhwLoOQVlPgYI3CEZ1iaQ655VSsLaI7V9NR8OPdxXENh4GiaNxaROOD6ERWLpey4lOt8yQlnHd86icWQ/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGhwLoOQVlPgYI3CEZ1iaQ655y7vbkDX9c4FWUU9EWIIjQt3ehu7r0Kl2JrI7WEZwgnicK3pw3MPrpNQ/640?wx_fmt=png)

这个箭头就是软链接文件的意思。

底层都是系统提供的 ln -s 的命令。

比如我执行

```
ln -s package.json package2.json
```

那就是创建一个 package2.json 的软连接文件，内容和 package.json 一样。

这俩其实是一个文件，一个改了另一个也就改了：

![](https://mmbiz.qpic.cn/mmbiz_gif/YprkEU0TtGhwLoOQVlPgYI3CEZ1iaQ655nypg1ZCsCwQzkpibAdmicsg3PgZ84xTiad0p9fvrBvje6yl9DuLF7r3NQ/640?wx_fmt=gif)

原理都是软连接，只不过 npm link 的那个和 monorepo 这个封装的有点区别。

这种功能本来是 lerna 先实现的，它提供了 lerna bootstrap 来完成这种 link：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGhwLoOQVlPgYI3CEZ1iaQ655rd3mbj7uUEfibibM76bzbMWA0QvFNpNMQo9lEDAhLmiaDlpicxkW70qjJA/640?wx_fmt=png)

只不过后来 npm、yarn、pnpm 都内置了这个功能，叫做 workspace。就不再需要 lerna 这个 bootstrap 的命令了。

直接在 package.json 里配置 workspace 的目录：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGhwLoOQVlPgYI3CEZ1iaQ655Qg8wLXhPfWKW9JgWSyrzia0Vwd0tXzxJfSA0l8C3QcZn0xCJiaQFqFJw/640?wx_fmt=png)

然后 npm install，就会完成这些 package 的 link。

而包与包之间的依赖，workspace 会处理，本地开发的时候只需要写 * 就好，发布这个包的时候才会替换成具体的版本。

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGhwLoOQVlPgYI3CEZ1iaQ655YO8ovIAbicQm8vhUxMoDCC2fQLwW2RaVjzwNAbvOTJALjrMQlPOY7mQ/640?wx_fmt=png)

这里用的是 npm workspace：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGhwLoOQVlPgYI3CEZ1iaQ655wgdHrCGXhEU7KRoU9gaS644OO5Hyn2YDtS0nTjUiciaZUpJNo4I2vkOQ/640?wx_fmt=png)

它所解决的问题正如我们分析的：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGhwLoOQVlPgYI3CEZ1iaQ655ZHFK0xCvpnASOT2icfnFEDHcvxqe0JjeXz3atBfYkOf3EX7LaRsjo1g/640?wx_fmt=png)

在 npm install 的时候自动 link。

yarn workspace 也是一样的方式：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGhwLoOQVlPgYI3CEZ1iaQ655Pf6pRxhqmvYOEtSpFv9uDg3I7TaEAwK08yI11ePvEn4BYtVLrbWIhA/640?wx_fmt=png)

pnpm 有所不同，是放在一个 yaml 文件里的：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGhwLoOQVlPgYI3CEZ1iaQ6551XB1IEicFOL1e0s8o7yZ1dII7cVQZRHt8At1cJTuoHT4AxW4IAWibXqg/640?wx_fmt=png)

此外，yarn 和 pnpm 支持 workspace 协议，需要把依赖改为这样的形式：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGhwLoOQVlPgYI3CEZ1iaQ655R8GyRgB61UjgNTv4w71dicw40ORbRIXKQia4icjLshDpIhrtbwd1m9ANg/640?wx_fmt=png)

这样查找依赖就是从 workspace 里查找，而不是从 npm 仓库了。

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGhwLoOQVlPgYI3CEZ1iaQ6551A64LpHR7ye5MDvfapg2BZCzZulI7ce9gIQlz7mZIZia3cbgFnLdtWQ/640?wx_fmt=png)

总之，不管是 npm workspace、yarn workspace 还是 pnpm workspace，都能达到在 npm install 的时候自动 link 的目的。

回过头来再来看 monorepo 工具的第二大功能：执行命令

在刚才的 demo 项目下执行

```
lerna run build
```

输出是这样的：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGhwLoOQVlPgYI3CEZ1iaQ655ibyDcavQKF5TmPtR3jERoeNZhdGAmczZBBbYianRS2x9dM2sb3Um7ibeg/640?wx_fmt=png)

lerna 会按照依赖的拓扑顺序来执行命令，并且合并输出执行结果。

比如 remixapp 依赖了 header 和 footer 包，所以先在 footer 和 header 下执行，再在 remixapp 下执行。

当然，npm workspace、yarn workspace、pnpm workspace 也是提供了多包执行命令的支持的。

npm workspace 执行刚才的命令是这样的：

```
npm exec --workspaces -- npm run build
```

可以简写为：

```
npm exec -ws -- npm run build
```

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGhwLoOQVlPgYI3CEZ1iaQ655QyAcNicia5ib7HC7dJhR2EJake2ibfqWC7faeZvQxVoQxBKUg41AxOtTgw/640?wx_fmt=png)

也可以单独执行某个包下执行：

```
npm exec --workspace header --workspace footer -- npm run build
```

可以简写为：

```
npm exec -w header -w footer  -- npm run build
```

只不过不支持拓扑顺序。

yarn workspace 可以执行：

```
yarn workspaces run build
```

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGhwLoOQVlPgYI3CEZ1iaQ655oKo37aZpIzj4e3mFibq750scr87GYoMLqYjQ0QHnLicYQk4STOZ2HnKQ/640?wx_fmt=png)

但也同样不支持拓扑顺序。

我们再来试试 pnpm workspace。

npm workspace 和 yarn workspace 只要在 package.json 里声明 workspaces 就可以。

但 pnpm workspace 要声明在 pnpm-workspaces.yaml 里：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGhwLoOQVlPgYI3CEZ1iaQ6553VBLPQ5KRxtXTB6NrCvnWpA5BDyySg7QqswiaIvCDpglDvaHicN0e7HQ/640?wx_fmt=png)

pnpm 在 workspace 执行命令是这样的：

```
pnpm exec -r pnpm run build
```

-r 是递归的意思：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGhwLoOQVlPgYI3CEZ1iaQ65574Pqz7tUsn7d84Szic6oscsGutic9FIdDzXT19mCFjJiarpJwXKGF3Anw/640?wx_fmt=png)

关键是 pnpm 是支持选择拓扑排序，然后再执行命令的：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGhwLoOQVlPgYI3CEZ1iaQ655jIMQNKQGMDziaSblVH0mMMnvcia2zBePFIbA7UibMb0hqRH0r5mR05xaA/640?wx_fmt=png)

有时候命令有执行先后顺序的要求的时候就很有用了。

总之，npm、yarn、pnpm 都和 lerna 一样支持 workspace 下命令的执行，而且 pnpm 和 lerna 都是支持拓扑排序的。

再来看最后一个 monorepo 工具的功能：版本管理和发布。

有个工具叫做 changesets 是专门做这个的，我们看下它能做啥就好了。

执行 changeset init：

```
npx changeset init
```

执行之后会多这样一个目录：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGhwLoOQVlPgYI3CEZ1iaQ655VTG7xPn95ibibibyvZ3tJPTtdkwR1rMic8DfibLFicXSfNjgrP6TYrXGSq2Q/640?wx_fmt=png)

然后添加一个 changeset。

什么叫 changeset 呢？

就是一次改动的集合，可能一次改动会涉及到多个 package，多个包的版本更新，这合起来叫做一个 changeset。

我们执行 add 命令添加一个 changeset：

```
npx changeset add
```

会让你选一个项目：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGhwLoOQVlPgYI3CEZ1iaQ6558NNBtVxb1pN9CmpVsPAMicakAwwVa2AgWuWk43cia7ibvbwPibh0gwouJQ/640?wx_fmt=png)

哪个是 major 版本更新，哪个是 minor 版本更新，剩下的就是 pacth 版本更新。

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGhwLoOQVlPgYI3CEZ1iaQ655og4eASJIiciaTYp3VxQQctjpAwGd5Kk1V6f7oOu14cXFB3Qicdu7Ueacw/640?wx_fmt=png)

1.2.3  这里面 1 就是 major 版本、2 是 minor 版本、3 是 patch 版本。

之后会让你输入这次变更的信息：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGhwLoOQVlPgYI3CEZ1iaQ6554qrXwbhLXRKNcQJSiacr1j9b0oGaicc0jyWpkc9koHhq4hdg7YCeKwEQ/640?wx_fmt=png)

然后你就会发现在 .changeset 下多了一个文件记录着这次变更的信息：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGhwLoOQVlPgYI3CEZ1iaQ655zDUteiazgdGOicXUTiaibEgmm5dSAP4EYibNV2IYhSOyJD5um4CfR4Ld69Q/640?wx_fmt=png)

然后你可以执行 version 命令来生成最终的 CHANGELOG.md 还有更新版本信息：

```
npx changeset version
```

之后那些临时的 changeset 文件就消失了：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGhwLoOQVlPgYI3CEZ1iaQ6557ZwSxBfIgJTbU3nRVaSjp4dKiaNHJia00w2TDxjFZmeFXC6GDd7ZKUvg/640?wx_fmt=png)

更改的包下都多了 CHANGELOG.md 文件：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGhwLoOQVlPgYI3CEZ1iaQ655dPKFfsEjCGQv2ia3aaF8e7C06Mu6C5cpbJ6otRWWfDMCZOjUcQ3vdug/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGhwLoOQVlPgYI3CEZ1iaQ655DB8Yd7ialWg7MS8SuTn3ZxPvaoIJcjrlemMf3gDDSUbO04UuP1ZXajw/640?wx_fmt=png)

并且都更新了版本号：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGhwLoOQVlPgYI3CEZ1iaQ655EdftoXdK2Zb8CAj7obkLpNicMlY2ywopNMFKwFqsAibYXvibdAvZn9YibA/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGhwLoOQVlPgYI3CEZ1iaQ655viaiccQCr1ekLmlG8YicayNEtZeK4kPS8EuBotKWof8vxWoUicTzeJic95g/640?wx_fmt=png)

而且 remixapp 这个包虽然没有更新，但是因为依赖的包更新了，所以也更新了一个 patch 版本：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGhwLoOQVlPgYI3CEZ1iaQ6552Py3siae5Dueo5vyGWjNiaH9BWoA7cfT1Xnib9dN19FCfTjL9DzkRMlaA/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGhwLoOQVlPgYI3CEZ1iaQ655fE5wjfXDzTWjx6HbPpiazrT7QTDupR19bpES7jfj6Fsic5dfEf6UxNtA/640?wx_fmt=png)

这就是 changeset 的作用。

如果没有这个工具呢？

你要自己一个个去更新版本号，而且你还得分析依赖关系，知道这个包被哪些包用到了，再去更改那些依赖这个包的包的版本。

就很麻烦。

这就是 monorepo 工具的版本更新功能。

更新完版本自然是要 publish 到 npm 仓库的。

执行 changeset publish 命令就可以，并且还会自动打 tag：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGhwLoOQVlPgYI3CEZ1iaQ655MP9A5A6yicDbVaCDXcnic7M0eibN8oZO0oytzer8icyia8vicMHObtW2x62A/640?wx_fmt=png)

如果你不想用 changeset publish 来发布，想用 pnpm publish，那也可以用 changeset 来打标签：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGhwLoOQVlPgYI3CEZ1iaQ655dfvGl68gK6RUryeR0u0ZKrfXe7N891lvVJlDetoBiaUicHUFiakkvsJAQ/640?wx_fmt=png)

```
npx changeset tag
```

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGhwLoOQVlPgYI3CEZ1iaQ655KtGVdjEZz6DxiaJfCjqtib6Ko0IicCibVq4azzmLDefnXrwaxQCf97gAjA/640?wx_fmt=png)

这就是 monorepo 工具的版本更新和发布的功能。

lerna 是自己实现的一套，但是用 pnpm workspace + changeset 也完全可以做到。

回过头来看下这三个功能：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGhwLoOQVlPgYI3CEZ1iaQ655vXKFVJmkA10zj9UVxevibIteicJ8B0Xx2SZaeCkWu4qjNsmibCxDNRwCA/640?wx_fmt=png)

不同包的自动 link，npm workspace、yarn workspace、pnpm workspace 都可以做到，而 lerna bootstrap 也废弃了，改成基于 workspace。

执行命令这个也是都可以，只不过 lerna 和 pnpm workspace 都支持拓扑顺序执行命令。

版本更新和发布这个用 changeset 也能实现，用 lerna 的也可以。

整体看下来，似乎没啥必要用 lerna 了，用 pnpm workspace + changesets 就完全能覆盖这些需求。

那用 lerna 的意义在哪呢？

虽然功能上没啥差别，但性能还是有差别的。

lerna 还支持命令执行缓存，再就是可以分布式执行任务。

执行 lerna add-caching 来添加缓存的支持:

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGhwLoOQVlPgYI3CEZ1iaQ655uYNfhBHF1mImJQfFibwZIiaOYM9qGlp74t1vm9pmg8YicTVS2lkiaKJllw/640?wx_fmt=png)

指定 build 和 test 命令是可以缓存的，输出目录是 dist。

那当再次执行的时候，如果没有变动，lerna 就会直接输出上次的结果，不会重新执行命令。

下面分别是第一次和第二次执行：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGhwLoOQVlPgYI3CEZ1iaQ655eUjYuZ2SArgPmBkO9sa7QFxR0TlaXlmQQOcqPtFKiaSwY7rmBKhTnIA/640?wx_fmt=png)

至于分布式执行任务这个，是 nx cloud 的功能，貌似是可以在多台机器上跑任务。

所以综合看下来，lerna 在功能上和 pnpm workspace + changesets 没啥打的区别，但是在性能上更好点。

如果项目比较大，用 lerna 还是不错的，否则用 pnpm workspace + changesets 也完全够用了。

总结
--

monorepo 是在一个项目中管理多个包的项目组织形式。

它能解决很多问题：工程化配置重复、link 麻烦、执行命令麻烦、版本更新麻烦等。

lerna 在文档中说它解决了 3 个 monorepo 最大的问题：

*   不同包的自动 link
    
*   命令的按顺序执行
    
*   版本更新、自动 tag、发布
    

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGhwLoOQVlPgYI3CEZ1iaQ65593icF03XqDqpBexRKGBdzuuv9DWKZPfic5sO9Ymt9hVj8QvlGborRkdw/640?wx_fmt=png)

这三个问题是 monorepo 的核心问题。

第一个问题用 pmpm workspace、npm workspace、yarn workspace 都可以解决。

第二个问题用 pnpm exec 也可以保证按照拓扑顺序执行，或者用 npm exec 或者 yarn exec 也可以。

第三个问题用 changesets 就可以做到。

lerna 在功能上和 pnpm workspace + changesets 并没有大的差别，主要是它做了命令缓存、分布式执行任务等性能的优化。

总之，monorepo 工具的核心就是解决这三个问题。