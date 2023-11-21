> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/qeN1lJz1pahUt7KVg83NAw)

最近遇到一个 git 的问题：

我在某个文件里写了一段不应该提交上去的内容，没注意，提交上去了。

后来又提交了很多个 commit。

之后我发现了这个，又把它去掉了，提交了一个新的 commit。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjhr7nNmtXNDfkiaiaKSqFumNIDQq6H4TKjqFiaudwjQuLty4oumMA0uEXUmPKAaiaCShY40y6yhnNibLQ/640?wx_fmt=png)

这样虽然新的 commit 没有这段内容了，但老的 commit 里依然有这个内容。

可我不想保留这段内容的记录，也就是想修改历史 commit。

这种问题大家会怎么解决呢？

我能想到的有三种方案，分别来试一下。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjhr7nNmtXNDfkiaiaKSqFumNjcprZmSL6ibSDuibggsBO5va4IZyEgOEicnyibCl1qZr9b2FJ0CkibWf7Ww/640?wx_fmt=png)

我们先创建了个 git 项目。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjhr7nNmtXNDfkiaiaKSqFumNb1y6vavZJBxyjK6zCdY0VERAK6ogBCOp03cKnSRJeB3FSLcbfY3Zyw/640?wx_fmt=png)

写了个 index.md，每行内容提交一个 commit。

git log 可以看到，一共 5 个 commit：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjhr7nNmtXNDfkiaiaKSqFumN03ZTnTIe0ibJR2oxibRTz9bYlZuYVkuCupUECTEcc1ib0BRYKSfJTan1w/640?wx_fmt=png)

git show 看下 222 和 333 那个 commit：

```
git show f5482b
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjhr7nNmtXNDfkiaiaKSqFumNliapicbaTAkrSsJpUJHAwlcqJJxicYrp9REEa3Z6eKialpiavOn1S5hBwnQ/640?wx_fmt=png)![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjhr7nNmtXNDfkiaiaKSqFumNyUWGLKek4AXXx5FFTOCwPBIG6jpvDRhY6F8ia3tD1P0L0KpKib7ufFPQ/640?wx_fmt=png)

可以看到，这个 333 的 commit 就是我们想改掉的。

但是现在后面提交了 444、555 这俩 commit 了，怎么改掉它呢？

很容易想到的是 reset 到 333 那个 commit，重新提交，然后把后面的 commit 再一个个 cherry-pick 回去。

我们试一下：

首先把 444、555 这俩 commit 记下来，待会还要用

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjhr7nNmtXNDfkiaiaKSqFumNyI0hzlqqdHquVibXv437MHXArzXYzZN81iceKzflUdXqiaTrPadT0wfyA/640?wx_fmt=png)

然后 git reset 到 333 那个 commit：

```
git reset --hard 65dfee
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjhr7nNmtXNDfkiaiaKSqFumNE3hVSdEfwVHGgHOibbYGSPr3Gqhibnpuy09OQjLVaxcbTEuVEdSsjCKQ/640?wx_fmt=png)

把私密信息去掉，重新提交：

```
git add .
git commit --amend
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjhr7nNmtXNDfkiaiaKSqFumN34wOaHBgib676zxGkhTwfRwDwMhuHhYeVxLtgTrN4NzPqiabicnql0hVA/640?wx_fmt=png)

这样，这个 commit 就干净了。

然后把后面的 444 和 555 再 cherry-pick 回来。

cherry-pick 就是单独取一个 commit 过来。

```
git cherry-pick 0b700f
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjhr7nNmtXNDfkiaiaKSqFumNYrEMCBF0Xoe2pKdWBtQkendQgRrT3XEs1148ITHModrIT9HsRib1Q0A/640?wx_fmt=png)

会有冲突，解决之后 continue 就好：

```
git add .git cherry-pick --continue
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjhr7nNmtXNDfkiaiaKSqFumNice8MmENKeXwDzW6s92WDNkJHwPUI3nXVZsAzpqVQkQOuKQOIt8QibYw/640?wx_fmt=png)

再 cherry-pick 555 的 commit 的时候依然有冲突，因为历史 commit 改了：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjhr7nNmtXNDfkiaiaKSqFumNL4jlYMSK0nvNPiaOYFT9bdMXXoulVEGgNdb9Oqgic3FMZthwIDYQFJug/640?wx_fmt=png)

同样是解决之后重新 add 和 cherry-pick --continue

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjhr7nNmtXNDfkiaiaKSqFumNJaLfFAVLvAb0vfgicgQhcicn0cPjxYm2s7WzfCkGQL1WPBOOxTzuRJpA/640?wx_fmt=png)

这样再看下 333 那个 commit，就干净了：

```
git show 9aded3
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjhr7nNmtXNDfkiaiaKSqFumNGMHibOic9NcFlHIWUMafuaU3oYOGsXWNOZHicictNGAjN0NLJibAusKJjIA/640?wx_fmt=png)

不过这样还是挺麻烦的，git reset 到那个 commit，修改之后重新提交。

之后 cherry-pick 每个 commit 的时候都需要解决一次冲突，因为历史 commit 变了。

当 commit 多的时候就不合适了。

这时候可以用第二种方案： git rebase。

很多同学只会 git merge 不会 git rebase，其实这个很简单。

merge 就是只合并最新 commit，所以只要解决一次冲突，然后生成一个新的 commit 节点。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjhr7nNmtXNDfkiaiaKSqFumNblTrD9F6Y3XhgLt5sv26iarpFL8fMOiar197sslrkib1ibkcqRsOflGT0Q/640?wx_fmt=png)

而 rebase 则是把所有 commit 按顺序一个个的合并，所以可能要解决多次冲突，但不用生成新 commit 节点。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjhr7nNmtXNDfkiaiaKSqFumNnyWA2Hvqtiah8b09SsJYibPGMQrpY14yHUp6Tus3QaoW1L3g0sUx9zbA/640?wx_fmt=png)

merge 是合并最新的，所以只要处理一次就行。

rebase 是要一个个 commit 合并，所以要处理多次。

rebase 除了用来合并两个分支外，还可以在某个分支回到某个 commit，把后面 commit 重新一个个合并回去。

很适合用来解决我们这个问题。

首先回到初始状态：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjhr7nNmtXNDfkiaiaKSqFumNGaibibwJ6Blicwk4cUBojIkyVtjcsjFUM58jfQw48Db7o1633ysaL3Vpg/640?wx_fmt=png)

然后找到 222 的 commit：

```
git rebase -i f5482ba
```

这样就是重新处理从 333 到 HEAD 的 commit，一个个合并回去。

-i 是交互式的合并。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjhr7nNmtXNDfkiaiaKSqFumNgn0qhOYmF7eBLiaiaha57U41Kta5EYED3X777ba1QZeGeSjLTtm3uW9A/640?wx_fmt=png)

可以看到，三个 commit 都列了出来，前面的 pick 就是指定怎么处理这个 commit。

下面有很多命令：

pick 是原封不动使用这个 commit

reword 是使用这个 commit，但是修改 commit message

edit 是使用这个 commit，但是修改这个 commit 的内容，然后重新 amend。

squash 是合并这个 commit 到之前的 commit

后面的命令就不看了，很明显，这里我们要用的是 edit 命令。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjhr7nNmtXNDfkiaiaKSqFumNFeLWQodKLqG0UnaJqzbwucshkMQLwXibDLicY3I7yhOSZs88TcZQTjOQ/640?wx_fmt=png)

改成 edit，然后输入 :wq 退出

提示现在停在了 333 这个 commit，你可以修改之后重新 commit --amend：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjhr7nNmtXNDfkiaiaKSqFumNScDbicXt6zAhy3oBEEPVTCUJw9tdlhlH9iap3oibJKDdSaOLK2ExSrg5w/640?wx_fmt=png)

之后再 rebase --continue 继续处理下个 commit。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjhr7nNmtXNDfkiaiaKSqFumNZ2MmZp2hia3yZLdkA88XyuNjXHleBqsXqNiahiclRPa1iacnibv65aNhTsw/640?wx_fmt=png)

这时候会提示冲突，因为历史 commit 变了。

解决之后，重新 add、commit。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjhr7nNmtXNDfkiaiaKSqFumNiaNTKB4zUWNcic1klToyS3btakLaVCTcxzH4hWB1Nfsjab2hsib6XOibVw/640?wx_fmt=png)

然后 git rebase --continue 继续处理下个 commit：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjhr7nNmtXNDfkiaiaKSqFumNvsWgK4LuCQkOicMIXmDwLhDL2IicEcTficPevhyeYHqzXY9HtjuFTBxyg/640?wx_fmt=png)

历史 commit 变了，依然会冲突。

合并之后重新 add、commit.

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjhr7nNmtXNDfkiaiaKSqFumNCS3HwWLlyqf9t29rm9beRe2laOxnTb1tAUKt00J2zgvKA6pGgQJTUQ/640?wx_fmt=png)

然后再次 git rebase --continue

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjhr7nNmtXNDfkiaiaKSqFumNtpeLvMBhdQdycibwkDCOBmyribJ9X6HibibJS32Y8x6wOpHZxvWWFCMiakg/640?wx_fmt=png)

因为所有 commit 都处理完了，这时候会提示 rebase 成功。

这时候 git show 看下 333 那个 commit，就已经修改了：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjhr7nNmtXNDfkiaiaKSqFumNOuNZhK3CYISbVlfWUvR8da4GXTDBM2V3onqhpDTvlgdHUAicZ4hKblw/640?wx_fmt=png)

大家有没有发现，其实 git rebase 和我们第一种方案 git reset 回去再一个个 cherry-pick 是一样的？

确实，其实 git rebase 就是对这个过程的封装，提供了一些命令。

你完全可以用 cherry-pick 处理一个个 commit 来代替 git rebase。

这两种方案都要解决冲突，还是挺麻烦的。

又没有什么不用解决冲突的方案呢？

有，就是 filter-branch。

它可以在一系列 commit 上自动执行脚本。

比如 --tree-filter 指定的脚本就是用来修改 commit 里的文件的。

我们再回到初始状态：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjhr7nNmtXNDfkiaiaKSqFumNGaibibwJ6Blicwk4cUBojIkyVtjcsjFUM58jfQw48Db7o1633ysaL3Vpg/640?wx_fmt=png)

创建了一个 script.js

```
const fs = require('fs');const content = fs.readFileSync('./index.md', {    encoding: 'utf-8'});console.log(content);
```

就是读取 index.md 的内容并打印。

然后执行 filter-branch 命令：

```
git filter-branch --tree-filter 'node 绝对路径/script.js' 9aded3..HEAD
```

这里指定用 --tree-filter，也就是处理每个 commit 的文件，执行 script 脚本。

也就是从 222 那个 commit 到当前 HEAD 的 commit，每个 commit 执行一次 script 脚本。

大家觉得执行结果一样么？

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjhr7nNmtXNDfkiaiaKSqFumN1hbqZA5Ns24NqGVQYOjlhUvsCiawlV1MlyL3fJsHIwhRxwbbeKX4eiaQ/640?wx_fmt=png)

答案是不一样，因为每个 commit 这个文件的内容不同。

那我们在这个 script 里改变了文件的内容不就行了？

```
const fs = require('fs');const content = fs.readFileSync('./index.md', {    encoding: 'utf-8'});const newContent = content.replace('私密信息', '');fs.writeFileSync('./index.md', newContent);
```

再跑下试试：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjhr7nNmtXNDfkiaiaKSqFumNcM1Q54m0Vbv6JRYl7wS53NEmiaalKG0rhWVavFU1USibCqb7uUYGHmyg/640?wx_fmt=png)

执行成功，提示 main 分支已经被重写了。

然后我们再 git show 看下 333 那个 commit

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjhr7nNmtXNDfkiaiaKSqFumNWvfKd0icFAmQGEscRib2X2SsV6DMPK035YUh8c2UZvp8Z9fsDcTv9woQ/640?wx_fmt=png)![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjhr7nNmtXNDfkiaiaKSqFumNTw9tiaEHwcsibPiah01GIQBnomdRxibmIzgY2CUCyco8t7d1XQdMWT2YicA/640?wx_fmt=png)

确实去掉了私密信息。

再看看 444 的 commit：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjhr7nNmtXNDfkiaiaKSqFumNjKYD5hiaqEgsox0McgciacXuldzmbHH7Iar0KNjXMHJa3X5H0mbztfPg/640?wx_fmt=png)

这就是 filter-branch 的方案。

相比 reset + cherry-pick 或者 rebase 的方案，这种不需要一个个合并 commit，解决冲突。

只需要写个修改内容的脚本，然后自动执行脚本来改 commit 就行，便捷很多。

但是，要注意的是，改历史 commit 肯定是需要 git push -f 才能推到远程仓库的。

而改了历史 commit 的结果我们也都看到了，需要把后面的 commit 一个个重新合并，解决冲突。

这对于多人合作的项目来说，是很不好的。

可以让所有组员先把代码 push，在修改完历史 commit 之后，再重新 clone 代码就好了。

总结
--

当你不小心把私密信息提交到了某个历史 commit，就需要修改这个 commit 去掉私密信息。

我们尝试了 3 种方案：

第一种是 git reset --hard 到那个分支，然后改完之后 git commit --amend，之后再把后面的 commit 一个个 cherry-pick 回来。

第二种是 git rebase -i 这些 commit，它提供了一些命令，比如 pick 是使用这个 commit，edit 是重新修改这个 commit。我们在要改的那个 commit 使用 edit 命令，之后 git rebase --continue，依次处理后面的 commit。

其实 reabse 就是对 cherry-pick 的封装，也就是自动处理一个个 commit。

但不管是 cherry-pick 还是 rebase ，合并后面的 commit 的时候都需要解决冲突，因为改了历史 commit 肯定会导致冲突。

第三种方案是用 filter-branch 的 --tree-filter，他可以在多个 commit 上自动执行脚本，你可以在脚本里修改文件内容，这样就不用手动解决冲突了，可以批量修改 commit。

但改了历史 commit 需要 git push -f，如果大项目需要这么做，要提前和组员共同好，先把代码都 push，然后集中修改，之后再重新 clone。

这就是修改历史 commit 的 3 种方案，你还有别的方案么？