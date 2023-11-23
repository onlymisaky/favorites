> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/6VaV70zbnfzWBRxHGbmTcw)

我们经常会用 git clone 来下载项目，但遇到大项目的时候，clone 就很慢，比如 react：

![](https://mmbiz.qpic.cn/mmbiz_gif/YprkEU0TtGhibU1AnR2FibYBJ6GjFN1icgpQVe4W8x7aEYuqA1ZWuE8iaD2kOEDicG2icZ4GtF6GAY7PfWYQcrjW7cEg/640?wx_fmt=gif)

要等很久。

当然，还有更慢的项目。

这类项目可以通过 --depth 1 来加速：

```
git clone --depth 1 https://github.com/facebook/react
```

![](https://mmbiz.qpic.cn/mmbiz_gif/YprkEU0TtGhibU1AnR2FibYBJ6GjFN1icgpVzengH874iaibnDqGcXNvn4vNLPaVyicCnOQKI3hb0NYPpD7vWyHVX1YA/640?wx_fmt=gif)

这速度快了有几十倍吧！越大的项目加速效果越明显。

原因就是下载的内容更少了。

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGhibU1AnR2FibYBJ6GjFN1icgpVAQDYQIWibA9uv9peMib15WODAglg4jPScObobjvJ3ZIBiak6zmNicHaVg/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGhibU1AnR2FibYBJ6GjFN1icgpMcFtZcjhwQQmcDTGG835Cz9YLgNxe4I99xrNx2lHic4aphyVicgPrIaQ/640?wx_fmt=png)

那这样代码还是全的么？

当然，代码是最新的完整代码。

那为啥下载的内容少了呢？少了哪一部分呢？

很容易想到，就是历史 commit。

这里要涉及一点 git 的实现原理了：

git 中文件是通过 object 存储不同数据的：

*   glob 对象存储文件内容
    
*   tree 对象存储文件路径
    
*   commit 对象存储 commit 信息，关联多个 tree
    

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGhibU1AnR2FibYBJ6GjFN1icgpMOiaErMkgEymviaXtXNIECxJSQuiciajrfATg5f5BZesjSmSLZHWaoDgcA/640?wx_fmt=png)

然后 HEAD、branch、tag 等是指向具体 commit 的指针，可以在 .git/refs 下看到

所以说，每个版本的代码都是从 commit 对象作为入口关联起来的。

指定了 depth 1 的时候，就是只保留了最新的入口，历史入口就没下载了。

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGhibU1AnR2FibYBJ6GjFN1icgpHv1g5RFnoFrLqcFsgcM6sTfYpwiatlRrlPPx0NsLLUyNuicp1LvUfy5Q/640?wx_fmt=png)

这样自然快很多，代码也是完整的。

但这么好的事情也是有代价的，它有一些后遗症。

最容易想到的就是切不到历史 commit。

正常下载的项目的 git log 是这样的：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGhibU1AnR2FibYBJ6GjFN1icgpqsnbZbqoZFcaibaLsC0iaQ4oOxyOXhJZUAbrxlteWZiaAtlxELNh4YBpQ/640?wx_fmt=png)

你可以 git reset 切到任意 commit：

比如：

```
git reset --hard 4dda96a40
```

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGhibU1AnR2FibYBJ6GjFN1icgpibXxCq4t0Q3Uomp8yFxVqJtKx1qUtSuW9jFxCdetFia72E11CvtWDEkQ/640?wx_fmt=png)

但是 depth 1 下载的项目就不可以，因为本地没有这个 commit 可以切：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGhibU1AnR2FibYBJ6GjFN1icgpd7SeR9Nl5UGgRNXzvWzaRIHbXUa9hsK2UcWt9sucNsF3rMdvqFkibMA/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGhibU1AnR2FibYBJ6GjFN1icgpTqUm2UUDBOqtmrSayza4PianWvzuCvABV922rnf6HiaCaFe5krYzIBicw/640?wx_fmt=png)image.png

你再 git pull 的时候，也下载不了历史 commit 的代码：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGhibU1AnR2FibYBJ6GjFN1icgpHFUfseibvavAs8lxOYzH9iajNR9qPdianx7Qe7aIIPm649ZBknOXUuYYA/640?wx_fmt=png)

就很尴尬。

git 团队自然也想到了这点，于是提供了一个 unshallow 的选项：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGhibU1AnR2FibYBJ6GjFN1icgpBCPVFSj5MhIH6qB9tu33P4o5wOL7uzXAdCObzfpwwDP8ItQWf7j7rA/640?wx_fmt=png)

加上 --unshallow 再 pull 的时候也会同时拉取历史 commit。（默认没开这个是为了性能）

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGhibU1AnR2FibYBJ6GjFN1icgppC3799gyxNgelsJKUfYf4EpXQD5waxrmxQdOApw9194FNLlibbN83oQ/640?wx_fmt=png)

你完全可以用 depth 1 下载的项目来开发，正常的 pull、push 都没问题，因为都是基于最新 commit 创建的更新的 commit。

当你有一天需要历史 commit 的时候再 pull --unshallow 也不迟。

这样下载项目快，后面也能恢复成完整版代码库，何乐而不为呢？

但 depth 1 还有一个问题，就是切换不了其他 branch。

正常项目是这样的：

git branch -r 可以查看远程分支：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGhibU1AnR2FibYBJ6GjFN1icgpgMDZVpCMCnP5UicbrrbtbjCPSWfYsX9CBKUJD5fw2zIhLNib6EYeUl5A/640?wx_fmt=png)

git branch -a 可以查看本地和远程的分支：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGhibU1AnR2FibYBJ6GjFN1icgpv9xeRWnhRWjl0wibpNxQBbHKgBXItlhmUqtufy7U31ZhaTQXJKUKyyQ/640?wx_fmt=png)

但你 depth 1 下载的项目是没有的：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGhibU1AnR2FibYBJ6GjFN1icgp7rIia7uJZjhdhMDsVLjgMyX066LreSaF77w2GDOX5SCALV1RXOYhjOQ/640?wx_fmt=png)

只有一个 main。

有的同学说，fetch 一下就好了呀。

太天真了。

git fetch 的作用是把远程分支的新 commit 下载到本地。

默认下载所有远程分支的新 commit。

也可以单独指定某个分支：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGhibU1AnR2FibYBJ6GjFN1icgpCqpFOyBkJnxywuqibSVeD1BnG67dds2zKrn4enS5GMmiapmcJYp0ddbQ/640?wx_fmt=png)

但你会发现 git fetch 了这个分支的代码，也不能看到和切换到它：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGhibU1AnR2FibYBJ6GjFN1icgpOFXsP9k8lsic0s3ATsr59sfpBeogBTDIG9038rK6sQC8fic0rUjic6Prg/640?wx_fmt=png)

这是因为有个 remote.origin.fetch 的配置。

正常下载的项目的 fetch 配置是这样的：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGhibU1AnR2FibYBJ6GjFN1icgpibc7McYHxwH0Noubrehp5AWT37bZJBZllFGWQEbqPcXMyAd6tmPusicQ/640?wx_fmt=png)

把 remote 的所有分支下载到本地的所有分支。

而 depth 1 下载的项目的 fetch 配置是这样的：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGhibU1AnR2FibYBJ6GjFN1icgpJL75ovzkH3JPoZgrghYtMR4eseACxCbgkjqaNXAkr7uTBqqP7f61YA/640?wx_fmt=png)

fetch 只会下载 main 分支。

就算你手动 fetch 了其他分支的代码也不会处理。

所以我们可以改下这个配置，我们先指定一个 0.3-stable 分支看看：

```
git config remote.origin.fetch "+refs/heads/0.3-stable:refs/remotes/origin/0.3-stable"
```

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGhibU1AnR2FibYBJ6GjFN1icgpIkFK19rH2slbgkv6BqZke0wEC0wCUicENJUKobCyjWP4lyZQFLJs6nw/640?wx_fmt=png)

可以看到 pull 的时候就拉取到新分支了，而且 branch -r 可以看到这个分支了。

这里 pull 或者 fetch 都行。pull 就相当于 git fetch + git merge，把代码下载下来，然后 merge 到本地。fetch 是 pull 的第一步：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGhibU1AnR2FibYBJ6GjFN1icgp6iamibSpIhGpwjoAiaQ3G8UxSrUMCiceRwicLjn8dCvKRXASVW3OdJH8SxQ/640?wx_fmt=png)

接下来再改为 * 试试：

```
git config remote.origin.fetch "+refs/heads/*:refs/remotes/origin/*"
```

再执行 git fetch 或者 git pull，就会拉取全部分支的 commit：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGhibU1AnR2FibYBJ6GjFN1icgp51IAu8HzIXMfiaFIQIgDNrnhkTJoPY3icsUFicHSC48GJ9wC8ph5pOicxg/640?wx_fmt=png)

这时候就可以切换到这些分支了：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGhibU1AnR2FibYBJ6GjFN1icgpXCXJBbM6g8AKicJvicd3lWTC2Yg19icOWTqoDFGtk806SfXQRUbpMabbA/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGhibU1AnR2FibYBJ6GjFN1icgpLaiaKAxkX3qXic7QoiabYDuic2yzejXc7QgibKxB71d14nkHYWyzr00ZbUg/640?wx_fmt=png)

这样就解决了 --depth 1 的第二个问题。

总结
--

当 git clone 下载大项目的时候，加个 --depth 1 可以提速几十倍。

下载下来的项目也可以正常的 pull 和 push。

这是因为 git 是通过 commit、tree、blob 的对象存储的，每个 commit 是关联这些对象的入口。

depth 1 只会下载最后一个 commit 关联的 object，下载内容更少，所以速度快很多。

但这种方式有两个问题：

*   切换不到历史 commit
    
*   切换不到别的分支
    

没有历史 commit 可以通过 git pull --unshallow 解决。

切不到别的分支是因为 fetch 配置导致的，配置成 +refs/heads/*_:refs/remotes/origin/*_ 也就可以了，也就是拉取远程所有分支代码到本地。

这样再 fetch 和 pull 就会拉取所有分支的新 commit，也可以正常的切分支。

--depth 1 在下载大项目的时候，或者 build 时下载代码的时候，都很有意义。它提高下载速度导致的俩后遗症也都可以解决。