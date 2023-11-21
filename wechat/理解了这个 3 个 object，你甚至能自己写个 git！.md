> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/FNrFXgp1uqobMcuPjo5mvA)

git 我们每天都在用，但你知道它是怎么实现的么？

git add、git commit 整天都敲，但你知道它底层做了什么么？

commit、branch、暂存区这些都是怎么实现的，怎么做到的版本切换呢？

所有这些疑问，只要搞懂 3 个 object 就全部能解答了。

不信我们来看一下：

首先，执行 git init 初始化 git 仓库。

git 的所有内容都是存储在 .git 这个隐藏目录的，我们先把它给搞出来：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGiajU3XDJnx2Ngqw92F0vCwXx4SSSiceTMGuNsqDSjzTz27lvXGXvakC6C01BTvEscVxTo1pTPMAFPA/640?wx_fmt=png)

默认隐藏，但只要你把这个 exclude 配置删掉，就显示出来了：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGiajU3XDJnx2Ngqw92F0vCwXHcQJzjUATpzqVAI0gcGf72lfiab7CCticAgRH3XE4DkLaDybm6Djeia4Q/640?wx_fmt=png)

展开以后可以看到这些东西：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGiajU3XDJnx2Ngqw92F0vCwXWlNEK7eAw3MTNVsPdX33pOswL8qgxHicYP8TjN9CDu0hjcp9C7uYicxA/640?wx_fmt=png)

重点就是这里的 objects。

它是什么呢？

我们添加一个 object 就知道了：

有这样一个 text.txt 的文件：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGiajU3XDJnx2Ngqw92F0vCwXIKEQgD13zIs9IFy3vVLiadW2G9tbVnH8G7ghZa10hfgOPaWN3Wxcfag/640?wx_fmt=png)

执行这个 hash-object 的命令：

```
git hash-object -w text.txt
```

它会返回一个 hash：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGiajU3XDJnx2Ngqw92F0vCwXUc1PHShrCjwDuTvlLJTmjWIaIhutsJZ29fpNYUlaqSzsCEs3elM4vQ/640?wx_fmt=png)

然后你会在 objects 目录下发现多了一个目录，目录名是 hash 前两位，剩下的是文件名：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGiajU3XDJnx2Ngqw92F0vCwXdajx9CjdJ1UibY8TDdA8qwv2J8mDpZLGnXZHADyt9icLgVjQKiaOKiaA8A/640?wx_fmt=png)

它存了什么内容呢？

可以通过 cat-file 来看：

```
git cat-file -p 7c4a013e52c76442ab80ee5572399a30373600a2
```

-p 是 print 的意思。

可以看到文件内容就是 text.txt 的内容：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGiajU3XDJnx2Ngqw92F0vCwXiasklibqxm5jrqSW9UmxTqKbKhUC3GU8gvn2D5XKhapezvgr0HglJzKw/640?wx_fmt=png)

哦，原来 git 存储的文件内容就是放在这里的。

改一下文件内容，再存一下：

```
git hash-object -w text.txt
```

你会看到多了一个新的目录，同样是 hash 做目录名和文件名：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGiajU3XDJnx2Ngqw92F0vCwXuf9SICqc70LYUicicbkia0XlseMZmHfjKMkIONmysOKyU50bUQdTtyI7w/640?wx_fmt=png)

就这么一点东西，我们就能实现版本管理了！

怎么做呢？

读取不同 hash 的内容写入文件不就行了？

比如现在内容是 bbb，我想恢复上一个版本的内容是不是只要 cat-file 上个 hash 再写入文件就行了？

```
git cat-file -p 7c4a013e52c76442ab80ee5572399a303 > text.txt
```

![](https://mmbiz.qpic.cn/mmbiz_gif/YprkEU0TtGiajU3XDJnx2Ngqw92F0vCwXEwE91fHaicnjnIO5GSFcdXxlpP7XKKpEOTpxeqrK2ZAvAcZI4EpnUjA/640?wx_fmt=gif)

这就是一个版本管理工具了！

当然，现在还没有存文件名的信息，还有目录信息，这些信息存在哪呢？

这就需要别的类型的 object 了。

刚才我们看的存储文件内容的 object 叫做 blob。

可以通过 cat-file 加个 -t 看出来：

-t 是 type 的意思。

```
git cat-file -t 7c4a013e52c76442ab80ee5572399a303
```

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGiajU3XDJnx2Ngqw92F0vCwXM3vtErictY4JVZZ5hgJAxgkywh2pwUOICCpM8IMkdr39Cb0NS5ciatPQ/640?wx_fmt=png)

还有存储目录和文件名的 object，叫做 tree。

tree 和 blob 是咋关联的呢？

找个真实的仓库看看就知道了：

比如我在 react 项目下执行了 cat-file，之前我们用它查看过 blob 对象内容，这次查看的是 main 分支的顶部的 tree 对象。

```
git cat-file -p main^{tree}
```

可以看到有很多 blob 对象和 tree 对象：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGiajU3XDJnx2Ngqw92F0vCwXyncqjL6ldTcsCjicnxrRvnesVaECAx3Jqy8k2OFEAIPoR3jWJCJAZCg/640?wx_fmt=png)

很容易看出来，目录是 tree 对象，文件内容是 blob 对象：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGiajU3XDJnx2Ngqw92F0vCwXibRCoFibXMb9rJ5DF4D7LeHaqNiaCYjMdXic6IfD1Dyq8iaft1UlfibZJJ5A/640?wx_fmt=png)

那文件名呢？

文件名不是已经在 tree 对象里包含了么？

我们继续用 cat-file 看下 packages 这个 tree 对象的内容：

```
git cat-file -p 2889ab8f0ef04484849c40d3eebe330ec25bbe1c
```

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGiajU3XDJnx2Ngqw92F0vCwXL36hoRRaFh2G1sHG5yIUjjn2D7JvA7bM7RPUQsOlQx3qiaia61VNKq5Q/640?wx_fmt=png)

很容易就可以看出来 git 是怎么存储一个目录的了：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGiajU3XDJnx2Ngqw92F0vCwX5bq9HTobPU2QL8Iah4QPu9NuAic6ZSSoFCaKhZzEBq6eEbwqawFstYw/640?wx_fmt=png)

在 tree 对象里存储每个子目录和文件的名字和 hash。

在 blob 对象里存储文件内容。

tree 对象里通过 hash 指向了对应的 blob 对象。

这样是不是就串起来了！

这就是 git 存储文件的方式。

那这个 hash 是怎么算出来的呢？

也很简单，是对 “对象类型 内容长度 \ 0 内容” 的字符串 sha1 之后的值转为 16 进制字符串。

比如 aaa 的 hash 就是这样算的：

```
const crypto = require('crypto');function hash(content) {    const sha1 = crypto.createHash('sha1');    sha1.update(content);    return sha1.digest('hex');}console.log(hash('blob 3\0aaa'))
```

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGiajU3XDJnx2Ngqw92F0vCwXEacHHuj2FU1MzwrmdIHA6AyTg3sGWHNabP2G7NklLh3wjsLaDlR30Q/640?wx_fmt=png)

是不是一毛一样！

所有的 object 都是这么算 hash 的。

继续来讲 tree 对象：

其实我们放到暂存区的内容就相当于一个新的目录，也是通过 tree 对象存储的。

更新暂存区用 update-index 这个命令：

```
git update-index --add --cacheinfo 100644 7c4a013e52c76442ab80ee5572399a30373600a2 text.txt
```

--add --cacheinfo 就是往暂存区添加内容。

指定文件名和 hash，这里我们把 aaa 那个文件放进去了。

前面的 100644 是文件模式：

100644 是普通文件，100755 是可执行文件，120000 是符号链接文件。

添加之后就可以看到 .git/index 这个文件了，暂存区的内容就是放在这：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGiajU3XDJnx2Ngqw92F0vCwX2LFHhknlnGkVN5US9HiaY2bBvumClFDkT7oQcNkeXuyRRGIVWZr7KnA/640?wx_fmt=png)

这时候你执行 git status 就可以看到暂存区已经有这个文件了：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGiajU3XDJnx2Ngqw92F0vCwX5j7TouzX3nBxg4WgsEqv3dnficXAWhPibG8UqCYp9jibic3TsOxtT6D6CQ/640?wx_fmt=png)

所以说，git add 的底层就是执行了 git update-index。

然后暂存区的内容写入版本库的话只要执行下 write-tree 就好了：

```
git write-tree
```

然后你就会发现它返回了一个 hash，并且 objects 目录下多了一个 object：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGiajU3XDJnx2Ngqw92F0vCwXOMEUdwolrLhMV3HdWzJ27oskdVtdF0HKVxXye5xUsPIcIV3xQhsyibA/640?wx_fmt=png)

这个对象是啥类型呢？

通过 cat-file -t 看下就知道了：

```
git cat-file -t 9ef7e5a61a3b70ff7149805fc86a4c26e953bb3f
```

可以看到，是个 tree 对象：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGiajU3XDJnx2Ngqw92F0vCwXEmN7esmuib8seia6RZXSBicRp8OARwwGkNamMw6uJCq0k5WKibrBZ3GH7w/640?wx_fmt=png)

所以说，暂存区的内容是作为 tree 对象保存的。

再 cat-file -p 看下它的内容：

```
git cat-file -t 9ef7e5a61a3b70ff7149805fc86a4c26e953bb3f
```

可以看到是这样的：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGiajU3XDJnx2Ngqw92F0vCwXOZY8LInmCsLfk1Ip3zeV6agpLDDoO8l9B4DYPMSqN8qPFibjNf9CvoA/640?wx_fmt=png)

这就是 git commit 的原理了。

现在假设有个需求，让你找到某个版本的某个文件的内容，恢复回去。

是不是就很简单了？

只要找到对应版本的那个 tree 的 hash，然后再一层层找到对应的 blob 对象，读取内容再写入文件就好了！

这就是 git revert 的原理了。

当然，要是每个版本都要自己记住顶层 tree 的 hash 也太麻烦了。

所以 git 又设计了 commit 对象。

可以通过 commit-tree 命令把某个 tree 对象创建一个 commit 对象。

```
echo 'guang 111' | git commit-tree 9ef7e5
```

这里的参数就是上面的 tree 对象的 hash：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGiajU3XDJnx2Ngqw92F0vCwXibLCP9gLRmgZyrtOjAiaM9j424MRe1uTLicHfDn5xRKaJFqsN082SqWOQ/640?wx_fmt=png)

再用 cat-file -t 看看返回的对象的类型：

```
git cat-file -t b5f92e68912595dbb3b6cbda9123838546b18f7d
```

确实，这是一个 commit 对象：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGiajU3XDJnx2Ngqw92F0vCwXoQWoX7iaPOVCPMtnNKes85tSHDw9Eq0WKZQpiceGJgKy6CjYMIvTQGkQ/640?wx_fmt=png)

那 commit 对象都存了啥呢？

还是用 cat-file -p 看看：

```
git cat-file -p b5f92e68912595dbb3b6cbda9123838546b18f7d
```

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGiajU3XDJnx2Ngqw92F0vCwX10BNdrOSmXic9gjHiclVibzrvPsGC8iaA3slb22ibpLMC7icH3krMVoE5lsQ/640?wx_fmt=png)

下面的内容很熟悉，但是多了一个 tree 节点的指向，这个很正常，commit 的内容就是某个 tree 所对应的版本嘛。

commit、tree、blob 三个对象就是这样的关系：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGiajU3XDJnx2Ngqw92F0vCwXb1JnAHCUBIt44GeqdR9V8jYg44xhQpbJAoGfHXnTq84QGHIqOnBFQQ/640?wx_fmt=png)

commit 之间还能关联，也就是有先后顺序。

这个用 commit-tree -p 来指定：

比如我们再创建两个 commit：

```
echo 'guang 111' | git commit-tree 9ef7e5 -p b5f92e6echo 'guang 222' | git commit-tree 9ef7e5 -p c3f9f5
```

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGiajU3XDJnx2Ngqw92F0vCwXKM5SVKAwpWiac7gWVcFdoYurhNmgnLTLumB1WrBrEwpgm84ERj5dLDQ/640?wx_fmt=png)

这时你用 git log 看看：

```
git log 1d1234
```

你会看到平时经常看到的 commit 历史：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGiajU3XDJnx2Ngqw92F0vCwX90Ttiamsuwhjg0NskLtgvBpY1TibcojMbsCORAsSicE7zx7Fay52Bx1ww/640?wx_fmt=png)

这就是 commit 的实现原理！

当然，这里要记 commit 的 hash 同样也很麻烦。

平时我们怎么用呢？

用 branch 或者 tag 呀！

branch 和 tag 其实就是记录了这个 commit 的 hash。

这部分就不是 object 了，叫做 ref：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGiajU3XDJnx2Ngqw92F0vCwXicRQAW4oXdJEaRRXiatZoY5te5A4JOVwF1FQV5Tv1rRbFHGfxOor89ibA/640?wx_fmt=png)

创建 ref 使用 update-ref 的命令：

```
git update-ref refs/heads/guang 1d1234e77de6de0bb8edcf90cbd1a9546d7b1d9a
```

比如我创建了一个叫做 guang 的指向一个 commmit 对象的 ref。

这里就会多一个文件，内容存着指向的 commit 是啥：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGiajU3XDJnx2Ngqw92F0vCwXyNib2iaJpVsshebNsshaBTa5czHEtF6AJgV5rQ88icDU78hzRej6IFWxg/640?wx_fmt=png)

然后你 git branch 看看：

![](https://mmbiz.qpic.cn/mmbiz_gif/YprkEU0TtGiajU3XDJnx2Ngqw92F0vCwXFNAAnKwzsxgh344Bx3wlU8WfKodGSFDBob9guiaYGIEMj2tfzwj7X5w/640?wx_fmt=gif)

  

其实这就是创建了一个新的分支。

这就是 branch 的原理。

tag 也是一样，只不过它是放在 refs/tags 目录下的：

```
git update-ref refs/tags/v1.0 1d1234e77de6de0bb8edcf90cbd1a9546d7b1d9a
```

![](https://mmbiz.qpic.cn/mmbiz_gif/YprkEU0TtGiajU3XDJnx2Ngqw92F0vCwXVFpKUjSRicOJ660OLRtUZOSIKL4wMBmvSicnicHjetGNQscUcP4RmC3IA/640?wx_fmt=gif)

blob、tree、commit  和 ref 的关系就是这样的：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGiajU3XDJnx2Ngqw92F0vCwXofz3RBrJRRzr8JthGPuDUwdcZbCia72EsibqbFHUeDkXCg0PohN4pmPA/640?wx_fmt=png)

总结
--

今天我们探究了 git 的实现原理，主要是 3 个 object 以及两个 ref。

3 个对象是：

*   blob：存储文件内容
    
*   tree：存储目录结构和文件名，指向 blob 和 tree
    
*   commit：存储版本信息，指向不同版本的入口 tree
    

2 个 ref 是：

branch：指向某个 commit      tag：指向某个 commit

此外，暂存区放在 .git/index 文件里，内容其实也是个 tree 对象的内容。

还有，hash 的计算方式是类似 blob 3\0aaa 这样 “对象类型 内容长度 \ 0 内容” 的格式，对它做 sha1 然后转为十六进制。

基本看懂这张图就好了：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGiajU3XDJnx2Ngqw92F0vCwXVBics16DvDYZINlV8BykNWBtG5R370U3CcDicOVQVQ4vo1fb6NmoOelA/640?wx_fmt=png)

理解了这些，你就能理解 git add、git commit、git log、git revert、git branch、git tag 等等绝大多数 git 命令的实现原理了。

甚至按照这个思路来，自己写一个 git 是不是也不难呢？