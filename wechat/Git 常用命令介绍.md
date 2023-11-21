> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/Tbx-E0GwQgl8FXeP1auRwg)

> 本文作者为 360 奇舞团前端开发工程师

  

当多人同时开发项目时，Git 是一个必备的工具，它是一个优秀的版本控制系统，提供了许多命令，来协助开发者更好地管理项目，平时我们只会用到其中一部分命令，例如`git add`,`git commit`和`git push`等，相信大家对这几个命令都很熟悉。但是，如果不了解 Git 的工作原理，仅仅只是学习自己用到的命令，往往在出现意外时，没有解决思路。因此，本着 “知其所以然” 的想法，我决定对 Git 相关知识进行系统性的整理，对于一些较难理解的命令，我会以图片的方式进行解释。

要想使用 Git 来管理项目，首先要做的就是将项目变成一个 Git 仓库，我们需要使用`git init project`，project 是我们的项目名称。当运行完该命令后，在项目中就会多出一个`.git`文件夹，其中存储着该项目的 Git 配置信息，下面我将结合`.git`文件夹对 Git 进行简单的介绍。

#### 一、Git 基本结构

Git 的结构包括工作区，暂存区，本地仓库及远程仓库 4 个区域，如下：

1.  工作区（Working Directory）：指的是本地项目，当我们在工作区中修改、删除或增加代码后，Git 并不会自动追踪这些变化。
    
2.  暂存区（Staging Area）：在本地修改代码后，使用`git add`命令，就可以把更改的信息添加到暂存区，此时 Git 就会开始追踪修改的文件。暂存区对应的就是`.git`文件夹下的`index`文件。
    
3.  本地仓库（Local Repository）：用于存储项目各个提交版本的相关信息，当运行`git commit`命令时，Git 会把暂存区中的更改保存为一个新的提交，添加到本地仓库中。每个提交都有一个 ID，Git 根据 ID 来区分不同提交。
    
4.  远程仓库（Remote Repository）：Github 就是一个远程仓库，可以用来存储项目代码。当我们需要将项目拷贝到本地时，可以使用`git clone <仓库名>`，就可以将远程仓库复制到本地。
    

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEAjJ8Mt4ecVsZmX2nfNibyOiaSGGNJOib0SNLNYaleSNG3MHr6refj29mNia7AYoW4ib1uZxsk4ibU0Fb4w/640?wx_fmt=png)Git 基本结构图

图 1.Git 基本结构图

#### 二、常用 Git 命令

1.  `git clone`与`git init`
    

当我们要新建一个用 Git 管理的项目时，有 2 种方法可以使用：

（1）在远程仓库新建一个项目，再使用 git clone 将其复制到本地；

（2）在本地新建一个项目，用 git init 将其转化为 git 仓库，再推送到远程仓库。

2.  `git status`
    

通过该命令，我们可以及时了解到仓库的状态，例如：是否有更改待提交、暂存区的更改有哪些、已提交的更改。

3.  `git log`与`git show`
    

如果想要在本地查看之前提交的信息，可以使用以下 2 个命令：

（1）git log 命令可以用来查询版本库的提交历史，列出所有提交的相关信息，包括：提交人、提交日期及描述信息等。当我们想查看之前提交的某个版本时，可以先用`git log`查询版本库的提交历史，找到具体版本的提交哈希值，再使用`git reset`回退到该版本。

（2）git show 命令可以用来查看指定提交的相关信息，包括：提交人、日期、描述信息以及与上次提交之间的差异。

二者的区别在于查询范围不同：git log 的查找范围大，包含所有提交，但是只能看到提交的基本信息，无法查看每次提交具体的改动，当我们想查找某个分支的提交历史时，可以使用 git log <分支名>；git show 通常用来查看某个具体的提交，从中我们可以看到这次提交的修改内容。

4.  `git fetch`与`git pull`
    

如果想获取远程仓库的代码，可以使用以下 2 个命令：

（1）`git fetch`命令可以从远程仓库获取最新的代码以及提交历史，但是不会将最新代码的更改合并到本地。我们可以在检查更改后，决定是否合并。

（2）`git pull`该命令与 git fetch 的作用类似，也可以从远程仓库获取最新代码，此外，还会将最新代码与本地分支进行合并，相当于

```
git fetch + git merge/rebase
```

在多人开发的项目中，使用`git fetch`命令可以获取远程仓库的更新，再根据需要决定是否将更新合并到当前分支；在个人开始项目时，使用`git pull`更方便，无需后续再使用`git merge`进行合并操作。此外，我们还可以根据需要设置`git pull`的合并方式，默认的方式是`git merge`，通过使用`git config pull.rebase true`可以将合并方式改为`git rebase`。

5.  `git push`
    

git push 命令的作用与 git pull 正好相反，它可以将本地代码推送到远程仓库。一般在将本地分支推送到远程仓库之前，首先要进行`git pull`操作，这样做的好处是可以让本地仓库与远程仓库保持同步，此时，如果有冲突，就可以在本地先解决，避免推送时产生冲突。

6.  `git reset`与`git restore`
    

（1）`git reset`命令是用来完成重置操作的，可以重置本地仓库、暂存区和工作区 3 个区域的内容，你可以根据需要灵活选择。常见的用法是`git reset HEAD^`，用于回到上一个版本，也可以指定为某个具体的版本。该命令有 3 个参数。针对每个命令的不同作用，我将以可视化的方式进行展示，绿色模块表示该区域存放的是当前修改内容，紫色模块表示该区域已经被重置为分支 A 的内容。

(a)`git reset --soft <A>` ，可以将本地仓库的内容更改为 A 版本，但是改动的代码仍然存在于暂存区和工作区中。当你需要修改提交信息时，或者想在提交前检查下更改内容时，都可以使用该命令。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEAjJ8Mt4ecVsZmX2nfNibyOiaDcoibpQTwv922UGezdzI9XJvmhEGKU5n7039Y6fc6ycYj6oE6Z8c1Jw/640?wx_fmt=png)git reset --soft

图 2.git reset --soft 示意图

(b)`git reset --mixed <A>`，`mixed`为默认参数，可以将本地仓库的内容更改为 A 版本，同时清空暂存区，此时改动的代码只存在于工作区。当你想要重新修改代码，就可以使用该命令。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEAjJ8Mt4ecVsZmX2nfNibyOiaLmcuyK4loUrFkYNJnAaMWibNn6PvXIdhvouoGRmY2y9ibZaGfDsoEodA/640?wx_fmt=png)git reset --mixed

图 3.git reset --mixed 示意图

(c)`git reset --hard <A>`，可以将本地仓库的内容更改为 A 版本，清空暂存区及工作区的修改，此时工作目录的内容将回到未修改状态。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEAjJ8Mt4ecVsZmX2nfNibyOiamsp5knVcrYbsStgmcoaQCrhX5PlI5PPAVWWwq0BTkxqxVQiaOpE2pGA/640?wx_fmt=png)git reset --hard

图 4.git reset --hard 示意图

（2）`git restore`命令可以将未暂存或已暂存的更改还原，例如：用`git restore --staged <文件>`可以将暂存的文件取消，用`git restore <文件>`可以将本地的更改取消。

二者最大的区别为：是否修改提交历史，git restore 可以撤销工作区文件的更改，不会修改提交历史，而 git reset 则会修改提交历史。如果我们想回退到之前的提交，或者删除最新的提交，可以使用 git reset；如果想放弃工作区修改的信息，则可以使用 git restore。

7.  分支管理
    

在平时的开发中，常常是一个需求对应着一个分支，这就要涉及对多个分支进行管理。在介绍常见的分支管理命令之前，我们首先应明确创建分支的原理。使用 git commit 提交修改信息会产生一个提交对象，当后续再提交内容时，产生的提交对象会有一个指针指向前一个提交对象，类似图 5：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEAjJ8Mt4ecVsZmX2nfNibyOiaSulvDZc3kFgexoQSJ5YQ6hibz7yibuMWPkepxFc4zahiaZ5ib4reGomkww/640?wx_fmt=png)提交对象关系图

图 5. 提交对象关系图

而分支本质上就是一个指向提交对象的指针，以下是一些常用的分支管理命令：

（1）`git branch`

通过运行该命令，就可以查看本地所有的分支，若在 git branch 后面加上具体的名称，就可以创建一个分支，例如：

```
git branch <test>
```

该命令可以创建一个名为 test 的分支。

（2）`git checkout <分支名>`

我们经常需要在不同分支进行操作，该命令可以帮助我们切换到不同的分支。

（3）`git checkout -b <分支名>`

该命令是`git branch`和`git checkout`的简写，相当于创建一个新分支，并直接切换过去。

（4）`git branch -d <分支名>`

该命令可以用来删除某个无用的分支。

8.  `git merge与git rebase`
    

（1）`git merge`

如果你想将 A 分支上的代码合并到 B 分支上，可以使用该命令，但是当两个分支对相同的内容进行了修改，合并时就会产生冲突，此时需要手动解决冲突，才能完成合并。

```
git merge A
```

（2）`git rebase`

该命令也可以用于合并分支，但是与 git merge 有一定的区别。假如我们想把 A 分支上的代码合并到 B 分支上，可以运行如下命令：

```
git checkout B
git rebase A
```

Git 会把取消 B 分支里的所有提交，保存到`.git`文件夹的`rebase`目录中，然后将 B 分支更新到最新的 A 分支，最后将之前保存在`rebase`中的提交添加到 B 分支上。当出现冲突时，git rebase 会暂停，此时需要用户手动解决冲突，解决后用`git add`将修改提交到暂存区；随后运行`git rebase --continue`，完成 rebase 过程。如图 6 所示：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEAjJ8Mt4ecVsZmX2nfNibyOiaYxzClH8HiaoYR0ibAiaRXso73YxHKlbricdD1BkBPGeere8b2ZcGHYevMQ/640?wx_fmt=png)git rebase 命令

图 6.git rebase 命令原理图

`git merge`适合在主分支上进行合并，使用该命令会创建一个新的合并提交，可以保留分支的全部提交历史；`git rebase`适合在某个特定分支上进行合并，因为它不会生成合并提交。

9.  `git stash`命令
    

（1）`git stash save '描述信息'`

使用该命令，可以把未提交的更改保存到一个 stash 区域，存储区类似于一个栈结构，最新的保存信息会处于顶端，其索引为`stash@{0}`，最早的保存信息位于栈的最底端。图 7 中分支 A 中的 “修改信息”，也就是粉色区域，会被加入到 stash 存储区中。

（2）`git stash list`

使用该命令，可以查看所有已保存到 stash 存储区的信息，你可以根据需要对所有信息进行管理，例如删除无用的信息。

（3）`git stash apply`

该命令可以恢复 stash 中存储的最新更改，当然你也可以指定具体的更改，例如：`git stash apply stash@{2}`，如图 7 所示，Git 会把黄色区域放到分支 A 中。

（4）`git stash drop`

该命令可以删除 stash 存储区中的信息。

（5）`git stash pop`

该命令可以恢复并删除指定的更改，相当于`git stash apply`与`git stash drop`的结合。

（6）`git stash clear`

该命令可以清空 stash 存储区的所有内容。

当我们在 A 分支上修改了一些内容后，需要切换到 B 分支上完成任务时，往往需要先提交修改的信息，才能切换过去，等再回到当前分支上时，又需要撤销之前的提交，这很麻烦。git stash 的出现解决了这个问题，当我们运行该命令时，Git 会把当前分支的更改保存到 "stash" 区域。图 7 囊括了 git stash 相关的命令，由图可以清晰的看出每个命令实现的功能。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEAjJ8Mt4ecVsZmX2nfNibyOiaxFnqtgiaF65BrYQBqql9ibxzle6IFwnxEIAankYomvs6yx7Hia5PwGDLQ/640?wx_fmt=png)git stash 命令

图 7.git stash 命令原理图

#### 三、Git 解决项目中的冲突

在实际工作中，通常会根据不同需求，将代码发布到对应的环境中，这些环境包括：日常环境、测试环境、回归环境和生产环境。回归环境用于在发布前进行测试，生产环境是用户访问的版本。当完成一个需求的开发后，会先将其部署到回归环境，确认没有问题后，才可以部署到生产环境。

1.  当接到需求后，首先要根据生产环境上的代码，创建一个新的分支，可以使用如下命令：
    

```
git checkout -b A master
```

这样就可以得到一个新分支`A`，并切换到该分支下。其中，`master`为生产环境的分支。这样做是为了保证我们的修改是基于生产环境的。

2.  完成开发后，需要提交本地的修改：
    

```
git add .git commit -m "提交信息"git push
```

##### 回归环境冲突解决方案

1.  提交本地修改后，就要将`A`分支合并到回归环境的分支`test`上，以验证修改是否生效，为发布到生产环境做准备。由于`A`分支的代码与`master`相同，而`test`可能存在一些暂未发布到生产环境的代码，因此可能会因为冲突而导致合并失败。要解决冲突，有 2 种思路：
    

（1）在 test 分支上解决冲突。我参与的项目将回归环境和生产环境上的分支都设为了保护分支，因此不能在 test 上解决冲突。

（2）在 A 分支上解决冲突。若将 test 分支直接合并到 A 分支上，则会污染该分支。由于后续还要将 A 分支发布到生产环境，因此该方法也不能使用。

2.  为了避免上述问题，需要采用其他方案。具体如下：
    

（1）创建一个中间分支 config

```
git checkout -b config
```

（2）用回归环境的分支替换 config

```
git reset --hard origin/test
```

（3）将 A 分支合并到 config，解决出现的冲突

```
git merge A
```

（4）此时，可以将 config 分支推送到远程仓库，合并到 test 分支上，从而将完成的需求部署到回归环境上。

```
git merge config
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEAjJ8Mt4ecVsZmX2nfNibyOiazqrnB4N3QqRH9xNfrsbYUxad11MWDlE6jibEsib55cc7BY0JlHsrGqQA/640?wx_fmt=png)利用中间分支解决冲突

图 8. 中间分支解决冲突示意图

该方案的好处是，将 A 分支部署到回归环境的同时，也避免了该分支被 test 分支污染。

##### 生产环境冲突解决方案

由于分支 A 是基于生产环境上的分支创建的，假设生产环境的分支为`produce`，当出现冲突时，可以直接将`produce`分支上的代码合并到本地分支，具体操作如下：

1.  从远程仓库拉取`produce`分支
    

```
git pull origin/produce
```

2.  将其合并到`A`分支上，并解决冲突
    

```
git merge produce
```

3.  将 A 分支推送到远程仓库，合并到 produce 分支上，从而将完成的需求部署到生产环境上。
    

#### 四、总结

本文主要讲解了 Git 版本控制系统，列出了使用频率较高的命令，同时针对一些容易混淆的命令，进行了对比，指出其分别适合在何种情况下使用。此外，还对个人在项目中使用 Git 解决冲突的方案进行了记录，在多人开发项目时，经常会在合并时出现冲突，我们需要先分析冲突出现的原因，再根据不同的情况采取对应的方案，从而避免操作出错，影响线上代码。如需使用其他本文没有涵盖到的命令，可以查看官方文档。  

- END -

关于奇舞团
-----

奇舞团是 360 集团最大的大前端团队，代表集团参与 W3C 和 ECMA 会员（TC39）工作。奇舞团非常重视人才培养，有工程师、讲师、翻译官、业务接口人、团队 Leader 等多种发展方向供员工选择，并辅以提供相应的技术力、专业力、通用力、领导力等培训课程。奇舞团以开放和求贤的心态欢迎各种优秀人才关注和加入奇舞团。