> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [blog.51cto.com](https://blog.51cto.com/u_15506823/6238805)

> git submodule 和 git subtree，你会选择哪个来管理子项目？，如果想在一个项目中用另一个项目的代码，你会怎么做呢？有同学说，可以发一个 npm 包呀，然后在另一个

如果想在一个项目中用另一个项目的代码，你会怎么做呢？

有同学说，可以发一个 npm 包呀，然后在另一个项目里引入。

这样是可以，但是如果经常需要改动它的源码呢？这样频繁发包就很麻烦。

那可以用 monorepo 的形式来组织呀，也就是一个项目下包含多个包，它们之间可以相互依赖。

这样确实可以频繁改动源码，然后另一个包里就直接可用了。

但如果这个包是一个独立的 git 仓库，我希望它虽然在另一个项目里用了，但要保留 git 仓库的独立性呢？

这种就可以用 git submodule 或者 git subtree 了。这俩都实现了一个 git 项目里引入了另一个 git 项目的功能。

那 submodule 和 subtree 都能做这个，它俩有什么区别呢？我该用哪个好呢？

这篇文章我们就来详细对比下 git submodule 还有 git subtree。

首先我们准备这样一个 git 项目：

![](https://s2.51cto.com/images/blog/202303/18000726_6414903eb2b1412814.webp?x-oss-process=image/watermark,size_16,text_QDUxQ1RP5Y2a5a6i,color_FFFFFF,t_30,g_se,x_10,y_10,shadow_20,type_ZmFuZ3poZW5naGVpdGk=/format,webp/resize,m_fixed,w_1184)

3 个 commit，每个文件一个 commit。

然后在另一个项目里引入：

![](https://s2.51cto.com/images/blog/202303/18000726_6414903ede36c74241.webp?x-oss-process=image/watermark,size_16,text_QDUxQ1RP5Y2a5a6i,color_FFFFFF,t_30,g_se,x_10,y_10,shadow_20,type_ZmFuZ3poZW5naGVpdGk=/format,webp/resize,m_fixed,w_1184)

该怎么做呢？

我们先用 git submodule 的方式：

执行

```
git submodule add git@:QuarkGluonPlasma/git-research-child.git child
```

这个命令就是添加这个 git 项目到 child 目录下：

![](https://s2.51cto.com/images/blog/202303/18000726_6414903eede1675764.webp?x-oss-process=image/watermark,size_16,text_QDUxQ1RP5Y2a5a6i,color_FFFFFF,t_30,g_se,x_10,y_10,shadow_20,type_ZmFuZ3poZW5naGVpdGk=/format,webp/resize,m_fixed,w_1184)

然后我们再在 child 目录下再添加一个 git submodule：

```
cd child
git submodule add git@:QuarkGluonPlasma/git-research-child.git child2
```

现在就是两级 git submodule 了：

![](https://s2.51cto.com/images/blog/202303/18000727_6414903f13d6771.webp?x-oss-process=image/watermark,size_16,text_QDUxQ1RP5Y2a5a6i,color_FFFFFF,t_30,g_se,x_10,y_10,shadow_20,type_ZmFuZ3poZW5naGVpdGk=/format,webp/resize,m_fixed,w_1184)

在 .gitmodules 里记录着它的 url 和保存的 path：

![](https://s2.51cto.com/images/blog/202303/18000727_6414903f27ae692474.webp?x-oss-process=image/watermark,size_16,text_QDUxQ1RP5Y2a5a6i,color_FFFFFF,t_30,g_se,x_10,y_10,shadow_20,type_ZmFuZ3poZW5naGVpdGk=/format,webp/resize,m_fixed,w_1184)

前面说 submodule 能保留独立性，怎么看出来的呢？

首先，它有独立的 .git 目录，代表是单独 git 项目。

![](https://s2.51cto.com/images/blog/202303/18000727_6414903f37da624037.webp?x-oss-process=image/watermark,size_16,text_QDUxQ1RP5Y2a5a6i,color_FFFFFF,t_30,g_se,x_10,y_10,shadow_20,type_ZmFuZ3poZW5naGVpdGk=/format,webp/resize,m_fixed,w_1184)

虽然这个 .git 目录是放在根 git 项目的 .git 下的：

![](https://s2.51cto.com/images/blog/202303/18000727_6414903f424d246827.webp?x-oss-process=image/watermark,size_16,text_QDUxQ1RP5Y2a5a6i,color_FFFFFF,t_30,g_se,x_10,y_10,shadow_20,type_ZmFuZ3poZW5naGVpdGk=/format,webp/resize,m_fixed,w_1184)

这样就保证了它们依然可以独立的 pull 和 push。

比如我在 child 里加了一个 444.md 的文件：

![](https://s2.51cto.com/images/blog/202303/18000727_6414903f4f29041772.webp?x-oss-process=image/watermark,size_16,text_QDUxQ1RP5Y2a5a6i,color_FFFFFF,t_30,g_se,x_10,y_10,shadow_20,type_ZmFuZ3poZW5naGVpdGk=/format,webp/resize,m_fixed,w_1184)

你 git status 只能看到它提示了 submodule 有内容变动，但是根本不会管有什么变动。

你需要进入这个目录执行 git add、git commit、git push 才行。

也就是它依然是独立的项目，父项目只是记录了它关联的 commit id 是啥。

![](https://s2.51cto.com/images/blog/202303/18000727_6414903f6f27980950.webp?x-oss-process=image/watermark,size_16,text_QDUxQ1RP5Y2a5a6i,color_FFFFFF,t_30,g_se,x_10,y_10,shadow_20,type_ZmFuZ3poZW5naGVpdGk=/format,webp/resize,m_fixed,w_1184)

可以看到，子项目可以正常 push 成功。

这时候在 child 目录下执行 git status 就可以看到没有变动了：

![](https://s2.51cto.com/images/blog/202303/18000727_6414903f832ff28610.webp?x-oss-process=image/watermark,size_16,text_QDUxQ1RP5Y2a5a6i,color_FFFFFF,t_30,g_se,x_10,y_10,shadow_20,type_ZmFuZ3poZW5naGVpdGk=/format,webp/resize,m_fixed,w_1184)

但这时候你回到父级目录可以看到提示 submodule 有新的 commit：

![](https://s2.51cto.com/images/blog/202303/18000727_6414903f97fd245441.webp?x-oss-process=image/watermark,size_16,text_QDUxQ1RP5Y2a5a6i,color_FFFFFF,t_30,g_se,x_10,y_10,shadow_20,type_ZmFuZ3poZW5naGVpdGk=/format,webp/resize,m_fixed,w_1184)

我们新生成一个 commit 来保存这次变更：

![](https://s2.51cto.com/images/blog/202303/18000727_6414903fa646b50309.webp?x-oss-process=image/watermark,size_16,text_QDUxQ1RP5Y2a5a6i,color_FFFFFF,t_30,g_se,x_10,y_10,shadow_20,type_ZmFuZ3poZW5naGVpdGk=/format,webp/resize,m_fixed,w_1184)

这就是 submodule 的独立性，你可以在这个目录下单独执行 pull、push，单独管理变更，父项目只是记录关联的 commit 的变化。

那如果别人 clone 下这个项目来，还有这个 submodule 么？

我们 clone 下试试：

```
git clone git@:QuarkGluonPlasma/git-research.git git-research-2
```

我把这个项目 clone 下来：

![](https://s2.51cto.com/images/blog/202303/18000727_6414903fbaa4726481.webp?x-oss-process=image/watermark,size_16,text_QDUxQ1RP5Y2a5a6i,color_FFFFFF,t_30,g_se,x_10,y_10,shadow_20,type_ZmFuZ3poZW5naGVpdGk=/format,webp/resize,m_fixed,w_1184)

可以看到确实有 child 这个目录，但是没内容。

这是因为它需要单独初始化一下并更新下代码：

执行

```
git submodule init
git submodule update
```

或者执行

```
git submodule update --init
```

就可以看到代码被拉下来了：

![](https://s2.51cto.com/images/blog/202303/18000727_6414903fd1a8366685.webp?x-oss-process=image/watermark,size_16,text_QDUxQ1RP5Y2a5a6i,color_FFFFFF,t_30,g_se,x_10,y_10,shadow_20,type_ZmFuZ3poZW5naGVpdGk=/format,webp/resize,m_fixed,w_1184)

但只有一层，如果想递归的 init 和 update，可以这样：

```
git submodule update --init --recursive
```

这样它就会把每一层 submodule 都拉下来：

![](https://s2.51cto.com/images/blog/202303/18000727_6414903fe496e72255.webp?x-oss-process=image/watermark,size_16,text_QDUxQ1RP5Y2a5a6i,color_FFFFFF,t_30,g_se,x_10,y_10,shadow_20,type_ZmFuZ3poZW5naGVpdGk=/format,webp/resize,m_fixed,w_1184)

这样就完整下载了整个项目的代码。

当然，这一步可以提前到 git clone，也就是执行：

```
git clone --recursive-submodules xxx
```

这样就不用单独 git submodule init 和 git submodule update 了。

![](https://s2.51cto.com/images/blog/202303/18000727_6414903ff09ca64906.webp?x-oss-process=image/watermark,size_16,text_QDUxQ1RP5Y2a5a6i,color_FFFFFF,t_30,g_se,x_10,y_10,shadow_20,type_ZmFuZ3poZW5naGVpdGk=/format,webp/resize,m_fixed,w_1184)

小结下 git submodule 的用法：

*   **通过 git submodule add 在一个项目目录下添加另一个 git 项目作为 submodule**
*   **submodule 下可以单独 pull、push、add、commit 等**
*   **父项目只是记录了 gitmodules 的 url 和它最新的 commit，并不管具体内容是什么**
*   **submodule 可以多层嵌套**
*   **git clone 的时候可以 --recursive-submodules 来递归初始化 submodules，或者单独执行 git submodule init 和 git submodule update**

可以体会到啥叫复用子项目代码的同时保留项目的独立性了么？

然后我们再来试试 git subtree：

还是这样一个项目：

![](https://s2.51cto.com/images/blog/202303/18000728_641490400fb1524185.webp?x-oss-process=image/watermark,size_16,text_QDUxQ1RP5Y2a5a6i,color_FFFFFF,t_30,g_se,x_10,y_10,shadow_20,type_ZmFuZ3poZW5naGVpdGk=/format,webp/resize,m_fixed,w_1184)

我们用 subtree 的命令添加子项目：

```
git subtree add --prefix=child git@:QuarkGluonPlasma/git-research-child.git main
```

![](https://s2.51cto.com/images/blog/202303/18000728_641490401ac2344364.webp?x-oss-process=image/watermark,size_16,text_QDUxQ1RP5Y2a5a6i,color_FFFFFF,t_30,g_se,x_10,y_10,shadow_20,type_ZmFuZ3poZW5naGVpdGk=/format,webp/resize,m_fixed,w_1184)

这样和 submodule 有什么区别呢？

不知道你有没有发现，child 目录下是没有 .git 的，这代码它不是一个单独的 git 项目，只是一个普通目录：

![](https://s2.51cto.com/images/blog/202303/18000728_641490402ae6794297.webp?x-oss-process=image/watermark,size_16,text_QDUxQ1RP5Y2a5a6i,color_FFFFFF,t_30,g_se,x_10,y_10,shadow_20,type_ZmFuZ3poZW5naGVpdGk=/format,webp/resize,m_fixed,w_1184)

所以你在这个目录下的任何改动都可以被检测到：

![](https://s2.51cto.com/images/blog/202303/18000728_641490403a29d56707.webp?x-oss-process=image/watermark,size_16,text_QDUxQ1RP5Y2a5a6i,color_FFFFFF,t_30,g_se,x_10,y_10,shadow_20,type_ZmFuZ3poZW5naGVpdGk=/format,webp/resize,m_fixed,w_1184)

可以和整个项目一起 git add、commit、push 等。

![](https://s2.51cto.com/images/blog/202303/18000728_641490404538621501.webp?x-oss-process=image/watermark,size_16,text_QDUxQ1RP5Y2a5a6i,color_FFFFFF,t_30,g_se,x_10,y_10,shadow_20,type_ZmFuZ3poZW5naGVpdGk=/format,webp/resize,m_fixed,w_1184)

不过 subtree 的方式在创建目录的时候会生成一个 commit：

![](https://s2.51cto.com/images/blog/202303/18000728_641490405422330442.webp?x-oss-process=image/watermark,size_16,text_QDUxQ1RP5Y2a5a6i,color_FFFFFF,t_30,g_se,x_10,y_10,shadow_20,type_ZmFuZ3poZW5naGVpdGk=/format,webp/resize,m_fixed,w_1184)

那这样都作为一个普通目录了，这个子项目还独立么？还能单独 pull 和 push 么？

可以的！

虽然没有单独的 .git 目录，但它依然有独立性。你可以通过 subtree 的命令来 pull 和 push 它的代码：

比如我们先试试 pull。

我在 git-search-child 这个项目下加两个 commit：

![](https://s2.51cto.com/images/blog/202303/18000728_6414904066e7b15491.webp?x-oss-process=image/watermark,size_16,text_QDUxQ1RP5Y2a5a6i,color_FFFFFF,t_30,g_se,x_10,y_10,shadow_20,type_ZmFuZ3poZW5naGVpdGk=/format,webp/resize,m_fixed,w_1184)

加了 555、666 这俩 commit。

然后我在项目下执行 git subtree pull：

```
git subtree pull --prefix=child git@:QuarkGluonPlasma/git-research-child.git main
```

这样子项目的最新改动就拉下来了：

![](https://s2.51cto.com/images/blog/202303/18000728_641490407df826753.webp?x-oss-process=image/watermark,size_16,text_QDUxQ1RP5Y2a5a6i,color_FFFFFF,t_30,g_se,x_10,y_10,shadow_20,type_ZmFuZ3poZW5naGVpdGk=/format,webp/resize,m_fixed,w_1184)

所以说 subtree 虽然把它作为普通目录来管理了，但它依然保留着独立 pull 和 push 到单独项目的能力！

上面的 url 如果你觉得敲起来麻烦，可以放到 git remote 里来管理：

```
git remote add child git@:QuarkGluonPlasma/git-research-child.git
```

这样就可以只写它的名字了：

![](https://s2.51cto.com/images/blog/202303/18000728_641490408f01c50003.webp?x-oss-process=image/watermark,size_16,text_QDUxQ1RP5Y2a5a6i,color_FFFFFF,t_30,g_se,x_10,y_10,shadow_20,type_ZmFuZ3poZW5naGVpdGk=/format,webp/resize,m_fixed,w_1184)

这样 pull，会生成 3 个 commit：

![](https://s2.51cto.com/images/blog/202303/18000728_641490409a62987053.webp?x-oss-process=image/watermark,size_16,text_QDUxQ1RP5Y2a5a6i,color_FFFFFF,t_30,g_se,x_10,y_10,shadow_20,type_ZmFuZ3poZW5naGVpdGk=/format,webp/resize,m_fixed,w_1184)

刚拉下来的 555、666 的 commit，还有一个 merge commit。

你也可以加个 --squash 来合并：

```
git subtree pull --prefix=child child main --squash
```

（这个 child 是我们前面添加的 git remote）

![](https://s2.51cto.com/images/blog/202303/18000728_64149040b47f848206.webp?x-oss-process=image/watermark,size_16,text_QDUxQ1RP5Y2a5a6i,color_FFFFFF,t_30,g_se,x_10,y_10,shadow_20,type_ZmFuZ3poZW5naGVpdGk=/format,webp/resize,m_fixed,w_1184)

这样就只有一个合并后的 commit，一个 merge commit 了。这就是 --squash 的作用：

![](https://s2.51cto.com/images/blog/202303/18000728_64149040c83fc55933.webp?x-oss-process=image/watermark,size_16,text_QDUxQ1RP5Y2a5a6i,color_FFFFFF,t_30,g_se,x_10,y_10,shadow_20,type_ZmFuZ3poZW5naGVpdGk=/format,webp/resize,m_fixed,w_1184)

再来试下独立的 push。

![](https://s2.51cto.com/images/blog/202303/18000728_64149040e065953444.webp?x-oss-process=image/watermark,size_16,text_QDUxQ1RP5Y2a5a6i,color_FFFFFF,t_30,g_se,x_10,y_10,shadow_20,type_ZmFuZ3poZW5naGVpdGk=/format,webp/resize,m_fixed,w_1184)

这样就把它 push 上去了。

注意，这里可不是整个项目的 push，而是把那个子项目目录的改动 push 到了子项目里去。

另一个项目里就可以把它拉下来：

![](https://s2.51cto.com/images/blog/202303/18000728_64149040f267873460.webp?x-oss-process=image/watermark,size_16,text_QDUxQ1RP5Y2a5a6i,color_FFFFFF,t_30,g_se,x_10,y_10,shadow_20,type_ZmFuZ3poZW5naGVpdGk=/format,webp/resize,m_fixed,w_1184)

那问题来了，不是都没有 .git 目录了么？

那 subtree 是怎么知道哪些 commit 是新的，是属于这个子项目的呢？

还记得 subtree add 的时候单独生成了一个 commit 么？

![](https://s2.51cto.com/images/blog/202303/18000729_641490411281929487.webp?x-oss-process=image/watermark,size_16,text_QDUxQ1RP5Y2a5a6i,color_FFFFFF,t_30,g_se,x_10,y_10,shadow_20,type_ZmFuZ3poZW5naGVpdGk=/format,webp/resize,m_fixed,w_1184)

git 会遍历 git log，直到找到这个 commit，然后把之间的 commit 里涉及到那个目录的改动摘出来，单独 push 到子项目。

因为有个遍历 commit 的过程，所以这一步可能会比较慢。

当然也有优化的方式，当 commit 多的时候，你可以执行：

```
git subtree split --prefix=child --rejoin
```

![](https://s2.51cto.com/images/blog/202303/18000729_641490411e49644316.webp?x-oss-process=image/watermark,size_16,text_QDUxQ1RP5Y2a5a6i,color_FFFFFF,t_30,g_se,x_10,y_10,shadow_20,type_ZmFuZ3poZW5naGVpdGk=/format,webp/resize,m_fixed,w_1184)

这样会单独生成一个这样的 commit：

![](https://s2.51cto.com/images/blog/202303/18000729_641490412d7e346360.webp?x-oss-process=image/watermark,size_16,text_QDUxQ1RP5Y2a5a6i,color_FFFFFF,t_30,g_se,x_10,y_10,shadow_20,type_ZmFuZ3poZW5naGVpdGk=/format,webp/resize,m_fixed,w_1184)

因为 subtree push 的时候会从上往下找 commit，直到找到这样的 commit 结束。

所以 split 命令就可以指定找到哪个 commit，之前的就不找了，从而优化性能。

最后，git submodule 在 clone 的时候需要单独拉一下子项目代码，那 git subtree 呢？

我们试试：

```
git clone git@:QuarkGluonPlasma/git-research.git git-research-3
```

可以看到，拉下来的就是全部的代码：

![](https://s2.51cto.com/images/blog/202303/18000729_641490413a16f59856.webp?x-oss-process=image/watermark,size_16,text_QDUxQ1RP5Y2a5a6i,color_FFFFFF,t_30,g_se,x_10,y_10,shadow_20,type_ZmFuZ3poZW5naGVpdGk=/format,webp/resize,m_fixed,w_1184)

也就是说它真的就是个普通目录，只不过可以单独的作为子项目 pull 和 push 而已。

这就 git subtree 的使用方式。

小结一下：

*   **git subtree add 可以在一个目录下添加另一个子项目**
*   **子项目目录和别的目录没有区别，目录下改动会被 git 检测到**
*   **可以用 git subtree pull 和 git subtree push 单独提交和拉取子项目代码**
*   **git subtree pull 加一个 --squash 可以合并拉下来的 commit**
*   **add 的时候会创建一个 commit，这是 push 的时候搜索 commit 的终点，你也可以用 git subtree split --rejoin 来单独生成一个这样的 commit**

还有一点要注意，我用的 url 都是 git@:QuarkGluonPlasma/git-research-child.git 这种，而不是 /QuarkGluonP…

因为 github 现在 https 的方式需要输入用户名密码，而且已经被 github 禁掉了，这会导致子项目 pull 和 push 失败，所以统一用 ssh 的方式。

总结
--

当你想一个项目加入到另一个项目里来复用，并且还有保持这个项目可以作为独立 git 仓库管理的时候，就可以用 git submodule 或者 git subtree 了。

git submodule 会把子项目作为独立 git 仓库，你可以在这个目录下 pull、push、add、commit，父项目只记录着关联的 commit 是啥，并不关心子项目的具体变动。

git subtree 则是把子项目作为普通目录来管理，和别的文件没啥区别，都可以 add、commit 等。只不过依然保留了这个目录下的改动单独 pull、push 到子项目 git 仓库的能力。

这两种方式都可以复用项目代码的同时，保留子项目独立性。

不过 submodule 的方式耦合比较低，你能感觉出来它就是一个独立的 git 项目，你需要单独操作。

subtree 的方式，你根本感觉不到子项目的存在，它彻底融入了父项目。只是你依然可以单独的对它 pull、push 到子项目仓库。

我个人更喜欢 subtree 的方式，它更无感一点。

你呢？管理 git 项目里的 git 项目，你会选择 git submodule 还是 git subtree 呢？