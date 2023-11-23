> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/gWpNtnk6KKGrfALcxL26wQ)

本文约 **6700** 字，预计阅读需要 **20** 分钟。  

当使用 Git 进行项目代码管理时，难免会出现一些错误操作或需求变更，需要对代码进行撤销或修改。Git 提供了多种方式来撤消已有的更改。本文将介绍 Git 中常用的 6 种撤消更改的方法，帮助你更好地处理这些问题！

在开始示例之前，先来创建一个简单的 Git 仓库，其中包含于一些提交：

```
git init && \<br style="visibility: visible;">echo {} > package.json && git add . && git commit -m "Add package.json" && \<br style="visibility: visible;">echo FOO=bar > .env && git add . && git commit -m "Add .env" && \<br style="visibility: visible;">touch README.md && git add . && git commit -m "Add README" && \<br style="visibility: visible;">touch .gitignore && git add . && git commit -m "Add .gitignore"<br style="visibility: visible;">
```

对于这些命令，实际上包含以下历史操作：

```
* 4753e23 - (HEAD -> master) Add .gitignore (4 seconds ago) <AleksandrHovhannisyan><br style="visibility: visible;">* 893d18d - Add README (4 seconds ago) <AleksandrHovhannisyan><br style="visibility: visible;">* 2beb7c7 - Add .env (4 seconds ago) <AleksandrHovhannisyan><br style="visibility: visible;">* 0beebfb - Add package.json (5 seconds ago) <AleksandrHovhannisyan><br style="visibility: visible;">
```

1. 修改最近的提交
----------

在创建并提交了 `.gitignore` 文件后不久，决定修改这个文件：

```
echo node_modules > .gitignore<br style="visibility: visible;">
```

但不想在 git 日志历史记录中添加一个对于如此微小更改的提交记录。或者需要在最近的提交消息中纠正一个拼写错误。

这两种情况都是使用 `git amend` 命令的经典用例：

```
git commit -a --amend
```

简单来说，git amend 命令用于在 git 中编辑 commit 和提交消息。这是 git 中撤销更改的最基本方式之一。

当运行上述代码时，git 会打开选择的编辑器并显示最近的提交，在其中加入更改以进入暂存环境：

```
Add .gitignore# Please enter the commit message for your changes. Lines starting# with '#' will be ignored, and an empty message aborts the commit.## Date:      Sun Oct 11 08:25:58 2022 -0400## On branch master# Changes to be committed:#       new file:   .gitignore#
```

保存并关闭文件，git 将修改最近的提交以包括新更改。也可以在保存文件之前编辑提交消息。

如果要做的只是更新提交消息本身，例如修正一个拼写错误，那实际上并不需要进入暂存环境。只需要运行这个命令：

```
git commit --amend
```

在编辑器中更改提交消息并保存文件，关闭即可。

在修改了最近的提交后，日志将会看起来像这样：

```
* 7598875 - (HEAD -> master) Add .gitignore (31 seconds ago) <AleksandrHovhannisyan>
* 893d18d - Add README (79 seconds ago) <AleksandrHovhannisyan>
* 2beb7c7 - Add .env (79 seconds ago) <AleksandrHovhannisyan>
* 0beebfb - Add package.json (80 seconds ago) <AleksandrHovhannisyan>
```

现在，假设修改之前已经将旧提交推送到了远程分支。如果运行 `git status`，就会被告知本地分支和远程分支有一个提交不同：

```
On branch master
Your branch and 'origin/master' have diverged,
and have 1 and 1 different commits each, respectively.
  (use "git pull" to merge the remote branch into yours)
```

这也是正常的，因为远程分支有旧的提交，而本地分支有修改过的提交。它们的哈希值不同，因为修改提交会更改其时间戳，这会强制 git 计算新的哈希值。要想用新的提交更新远程分支，就需要强制推送它：`git push -f`。这将用本地分支覆盖远程分支的历史记录。

需要注意，这里我们是在自己分支上进行的强制推送，在实际工作中，我们不应该强制推送到公共分支；如果这样做，每个人的本地 master 副本都将与远程副本不同，并且任何基于旧 master 的新功能现在都将具有不兼容的提交历史记录。

2. 将分支重置为较旧的提交
--------------

目前为止，我们有如下提交历史：

```
* 7598875 - (HEAD -> master) Add .gitignore (31 seconds ago) <AleksandrHovhannisyan>
* 893d18d - Add README (79 seconds ago) <AleksandrHovhannisyan>
* 2beb7c7 - Add .env (79 seconds ago) <AleksandrHovhannisyan>
* 0beebfb - Add package.json (80 seconds ago) <AleksandrHovhannisyan>
```

我们再来向 master 添加一个提交：

```
touch file && git add . && git commit -m "Add a file"
```

现在提交历史变成了这样：

```
* b494f6f - (HEAD -> master) Add a file (5 seconds ago) <AleksandrHovhannisyan>
* 7598875 - Add .gitignore (3 minutes ago) <AleksandrHovhannisyan>
* 893d18d - Add README (4 minutes ago) <AleksandrHovhannisyan>
* 2beb7c7 - Add .env (4 minutes ago) <AleksandrHovhannisyan>
* 0beebfb - Add package.json (4 minutes ago) <AleksandrHovhannisyan>
```

几分钟后，出于某种原因，我们决定不再保留最近的提交。要想删除它，只需在 HEAD 指针之前硬重置一次提交，该指针始终指向当前分支上的最新提交：

```
git reset --hard HEAD~1
```

波浪号 (~) 后跟一个数字告诉 git 它应该从给定的提交（在本例中为 HEAD 指针）回溯多少次提交。由于 HEAD 总是指向当前分支上的最新提交，这告诉 git 对最近提交之前的提交进行硬重置。

输出结果如下：

```
HEAD is now at 7598875 Add .gitignore
```

硬重置是撤消 git 更改的一个便捷方法，但这是一个破坏性过程——该提交中的所有更改都将丢失，找回它们的唯一方法是通过 `git reflog`命令（后面会详细介绍）。

我们还可以重置为 HEAD~nth 提交，在这种情况下，该提交期间和之后的所有工作都将丢失：

```
git reset --hard HEAD~4
```

或者甚至是特定的提交，如果有它的哈希：

```
git reset --hard <hash-id>
```

当然也不限于仅针对当前分支中的提交进行重置，还可以重置本地分支以指向另一个本地分支：

```
git reset --hard <someOtherBranch>
```

甚至到远程分支：

```
git reset --hard origin/master
```

这个就很有用，例如，如果不小心将内容提交到本地 master 分支。假设应该在一个 feat/X 分支上进行提交，但忘记了创建它，而且一直在向本地 master 提交代码。

当然，我们也可以使用 `git cherry-pick` 来解决这个问题，但是如果有很多次提交怎么办？这有点痛苦，而 reset 可以轻松搞定。

要解决此问题，现在需要创建功能分支：

```
git checkout -b feat/X
```

并强行将本地 master 分支重置为远程 master 分支：

```
git checkout master && git reset --hard origin/master
```

并且不要忘记回到功能分支，这样就不会重复同样的错误：

```
git checkout feat/X
```

### 软重置分支

正如上面提到的，如果进行硬重置，将丢失在该提交时或之后所做的所有工作。当然，可以从那个状态中恢复过来，但需要额外的操作。相反，如果想在 git 的暂存环境中保留更改，可以进行软重置：

```
git reset --soft HEAD~1
```

同样，可以只使用提交哈希而不是从 HEAD 指针回溯：

```
git reset --soft a80951b
```

该提交引入的所有更改以及它之后的任何提交都将出现在 git 的暂存环境中。在这里，可以使用 `git reset HEAD file(s)` 取消暂存文件，对已经暂存的文件进行所需的任何更改。然后，可以根据需要进行任何新的提交。

**用例：**在一个提交中提交了文件 A 和文件 B，但后来意识到它们实际上应该是两个独立的提交。可以执行软重置并选择性地提交一个文件，然后单独进行另一个提交，所有这些操作都不会丢失任何工作内容。

### 创建备份分支

我们可以将分支用作备份机制，以防你知道即将运行的某个命令（例如 `git reset --hard`）可能会损坏分支的提交历史记录。在运行这些命令之前，可以简单地创建一个临时备份分支（例如 `git branch backup`）。如果出现任何问题，就可以针对备份分支执行硬重置操作：

```
git reset --hard backup
```

3. 交互式变基
--------

Git 的交互式变基是其最强大、最灵活的命令之一，允许倒回历史并进行任何所需的更改。如果想要删除旧的提交、更改旧的提交消息或者将旧的提交压缩成其他的提交，那么这就是你需要使用的命令。所有交互式变基都始于 `git rebase -i` 命令，并且必须指定一个提交来重新设置当前分支。

### 删除旧提交

目前为止，我们有如下提交历史：

```
* 7598875 - (HEAD -> master) Add .gitignore (20 minutes ago) <AleksandrHovhannisyan>
* 893d18d - Add README (21 minutes ago) <AleksandrHovhannisyan>
* 2beb7c7 - Add .env (21 minutes ago) <AleksandrHovhannisyan>
* 0beebfb - Add package.json (21 minutes ago) <AleksandrHovhannisyan>
```

第二次提交看起来有点可疑，为什么要将本地环境变量 (.env) 检查到 git 中？ 显然，我们需要删除此提交，同时保留所有其他提交。为此，我们将针对该提交运行交互式变基：

```
git rebase -ir 2beb7c7^
```

这将调出这个编辑器：

```
pick 2beb7c7 Add .env
pick 893d18d Add README
pick 7598875 Add .gitignore
```

要删除 2beb7c7，需要将 pick 命令更改为 drop（或 d）并保持其他不变：

```
drop 2beb7c7 Add .env
pick 893d18d Add README
pick 7598875 Add .gitignore
```

现在关闭并保存文件，会得到如下确认：

```
Successfully rebased and updated refs/heads/master.
```

现在，如果执行 `git log`，将不再看到该提交：

```
* 11221d4 - (HEAD -> master) Add .gitignore (6 seconds ago) <AleksandrHovhannisyan>
* 9ed001a - Add README (6 seconds ago) <AleksandrHovhannisyan>
* 0beebfb - Add package.json (50 minutes ago) <AleksandrHovhannisyan>
```

注意，在已删除提交之后的所有提交哈希都将被重新计算。因此，虽然根提交仍保持为 `0beebfb`，但在它之后的所有哈希值都已更改。正如现在已经看到几次，如果之前将此分支推送到了远程仓库中，那么本地分支和远程分支现在将不同步。因此，只需要进行一次强制推送即可更新远程分支：

```
git push -f
```

### 改写提交消息

我们再来添加两个提交，提交消息是随便写的：

```
* 094f8cb - (HEAD -> master) Do more stuff (1 second ago) <AleksandrHovhannisyan>
* 74dab36 - Do something idk (59 seconds ago) <AleksandrHovhannisyan>
* 11221d4 - Add .gitignore (3 minutes ago) <AleksandrHovhannisyan>
* 9ed001a - Add README (3 minutes ago) <AleksandrHovhannisyan>
* 0beebfb - Add package.json (53 minutes ago) <AleksandrHovhannisyan>
```

现在想修改这两个提交消息。我们将从交互式变基开始。在这里，我们将针对最后两个提交：

```
git rebase -i HEAD~2
```

这将打开编辑器：

```
pick 74dab36 Do something idk
pick 094f8cb Do more stuff
```

现在，只需将任何要更改其消息的提交的 pick 替换为 r（或 reword）：

```
reword 74dab36 Do something idk
reword 094f8cb Do more stuff
```

关闭并保存文件，对于想要改写的每个提交，git 将打开编辑器，就像正在修改该提交一样，允许编辑消息。

也许在第一次提交时这样做：

```
Update README with getting started instructions# Please enter the commit message for your changes. Lines starting# with '#' will be ignored, and an empty message aborts the commit.## Date:      Sun Oct 11 09:17:41 2022 -0400## interactive rebase in progress; onto 11221d4# Last command done (1 command done):#    reword 74dab36 Do something idk# Next command to do (1 remaining command):#    reword 094f8cb Do more stuff# You are currently editing a commit while rebasing branch 'master' on '11221d4'.## Changes to be committed:#       modified:   README.md#
```

第二次这样做：

```
Add name and author to package.json# Please enter the commit message for your changes. Lines starting# with '#' will be ignored, and an empty message aborts the commit.## interactive rebase in progress; onto 11221d4# Last commands done (2 commands done):#    reword 74dab36 Do something idk#    reword 094f8cb Do more stuff# No commands remaining.# You are currently rebasing branch 'master' on '11221d4'.## Changes to be committed:#       modified:   package.json#
```

我们会得到以下输出确认：

```
[detached HEAD 665034d] Update README with getting started instructions
 Date: Sun Oct 11 09:17:41 2020 -0400
 1 file changed, 5 insertions(+)
[detached HEAD ba88fb0] Add name and author to package.json
 1 file changed, 4 insertions(+), 1 deletion(-)
Successfully rebased and updated refs/heads/master.
```

现在提交历史看起来像这样：

```
* ba88fb0 - (HEAD -> master) Add name and author to package.json (31 seconds ago) <AleksandrHovhannisyan>
* 665034d - Update README with getting started instructions (53 seconds ago) <AleksandrHovhannisyan>
* 11221d4 - Add .gitignore (6 minutes ago) <AleksandrHovhannisyan>
* 9ed001a - Add README (6 minutes ago) <AleksandrHovhannisyan>
* 0beebfb - Add package.json (56 minutes ago) <AleksandrHovhannisyan>
```

### 编辑旧提交

编辑提交就意味着在提交之后立即转到历史记录中的那个点。这允许修改提交并包含（或删除）想要的任何更改。

目前为止，我们有如下提交历史：

```
* ba88fb0 - (HEAD -> master) Add name and author to package.json (31 seconds ago) <AleksandrHovhannisyan>
* 665034d - Update README with getting started instructions (53 seconds ago) <AleksandrHovhannisyan>
* 11221d4 - Add .gitignore (6 minutes ago) <AleksandrHovhannisyan>
* 9ed001a - Add README (6 minutes ago) <AleksandrHovhannisyan>
* 0beebfb - Add package.json (56 minutes ago) <AleksandrHovhannisyan>
```

假设要编辑根提交（0beebfb）并添加第二个文件：

```
touch .yarnrc
```

我们将针对该提交使用交互式变基，在这种编辑根提交的特殊情况下，需要使用 `--root` 选项：

```
git rebase -i --root
```

这将打开编辑器，按时间顺序显示提交：

```
pick 0beebfb Add package.json
pick 9ed001a Add README
pick 11221d4 Add .gitignore
pick 665034d Update README with getting started instructions
pick ba88fb0 Add name and author to package.json
```

我们需要做的就是为该列表中的第一个提交将 pick 替换为 edit ：

```
edit 0beebfb Add package.json
pick 9ed001a Add README
pick 11221d4 Add .gitignore
pick 665034d Update README with getting started instructions
pick ba88fb0 Add name and author to package.json
```

关闭并保存文件，应该从 git 中看到这条消息：

```
Stopped at 0beebfb... Add package.json
You can amend the commit now, with

        git commit --amend

Once you are satisfied with your changes, run

        git rebase --continue
```

下面来运行这两个命令：

```
git add .yarnrc && git commit --amend
```

现在只需要修改提交，编辑器应如下所示：

```
Add package.json# Please enter the commit message for your changes. Lines starting# with '#' will be ignored, and an empty message aborts the commit.## Date:      Sun Oct 11 08:25:57 2020 -0400## interactive rebase in progress; onto 666364d# Last command done (1 command done):#    edit 0beebfb Add package.json# Next commands to do (4 remaining commands):#    pick 9ed001a Add README#    pick 11221d4 Add .gitignore# You are currently editing a commit while rebasing branch 'master' on '666364d'.### Initial commit## Changes to be committed:#       new file:   .yarnrc#       new file:   package.json#
```

现在将该消息更改为 `Initialize npm package` 保存并退出。现在，根据 git 的建议，需要继续 rebase：

```
git rebase --continue
```

现在，提交历史现在看起来像这样：

```
* 436e421 - (HEAD -> master) Add name and author to package.json (6 seconds ago) <AleksandrHovhannisyan>
* beb7c13 - Update README with getting started instructions (6 seconds ago) <AleksandrHovhannisyan>
* 1c75f66 - Add .gitignore (6 seconds ago) <AleksandrHovhannisyan>
* 69c997b - Add README (6 seconds ago) <AleksandrHovhannisyan>
* 36210ec - Initialize npm package (56 seconds ago) <AleksandrHovhannisyan>
```

### 压缩

压缩可以将 n 个提交合并为一个，使提交历史更加紧凑。如果一个功能分支引入大量提交，并且只希望该功能在历史记录中表示为单个提交（称为 squash-and-rebase 工作流），这有时很有用。但是，如果将来需要，将无法恢复或修改旧的提交，这在某些情况下可能是不可取的。

同样，作为参考，我们有如下提交历史：

```
* 436e421 - (HEAD -> master) Add name and author to package.json (6 seconds ago) <AleksandrHovhannisyan>
* beb7c13 - Update README with getting started instructions (6 seconds ago) <AleksandrHovhannisyan>
* 1c75f66 - Add .gitignore (6 seconds ago) <AleksandrHovhannisyan>
* 69c997b - Add README (6 seconds ago) <AleksandrHovhannisyan>
* 36210ec - Initialize npm package (56 seconds ago) <AleksandrHovhannisyan>
```

下面来创建一个功能分支并添加一些提交：

```
git checkout -b feature && \
touch file1 && git add . && git commit -m "Add file1" && \
touch file2 && git add . && git commit -m "Add file2" && \
touch file3 && git add . && git commit -m "Add file3"
```

现在提交历史如下：

```
* 6afa3ac - (HEAD -> feature) Add file3 (4 seconds ago) <AleksandrHovhannisyan>
* c16cbc6 - Add file2 (4 seconds ago) <AleksandrHovhannisyan>
* 0832e96 - Add file1 (4 seconds ago) <AleksandrHovhannisyan>
* 436e421 - (master) Add name and author to package.json (12 minutes ago) <AleksandrHovhannisyan>
* beb7c13 - Update README with getting started instructions (12 minutes ago) <AleksandrHovhannisyan>
* 1c75f66 - Add .gitignore (12 minutes ago) <AleksandrHovhannisyan>
* 69c997b - Add README (12 minutes ago) <AleksandrHovhannisyan>
* 36210ec - Initialize npm package (12 minutes ago) <AleksandrHovhannisyan>
```

我们可以使用以下命令将所有这些压缩为一个：

```
git rebase -i master
```

这会将功能分支重新设置为 master 分支。请注意， master 是对特定提交的引用，就像其他任何提交一样：

```
* 436e421 - (HEAD -> master) Add name and author to package.json (6 seconds ago) <AleksandrHovhannisyan>
```

这样做也是一样的：

```
git rebase -i 436e421
```

无论如何，一旦运行了这些命令中的任何一个，git 就会打开编辑器：

```
pick 0832e96 Add file1
pick c16cbc6 Add file2
pick 6afa3ac Add file3
```

我们会将最后两个提交压缩到第一个提交中，所以将它们的 `pick` 命令更改为 `squash`：

```
pick 0832e96 Add file1
squash c16cbc6 Add file2
squash 6afa3ac Add file3
```

保存并退出，git 将打开编辑器，通知我们将要合并三个提交：

```
# This is a combination of 3 commits.# This is the 1st commit message:Add file1# This is the commit message #2:Add file2# This is the commit message #3:Add file3# Please enter the commit message for your changes. Lines starting# with '#' will be ignored, and an empty message aborts the commit.## Date:      Sun Oct 11 09:37:05 2020 -0400## interactive rebase in progress; onto 436e421# Last commands done (3 commands done):#    squash c16cbc6 Add file2#    squash 6afa3ac Add file3# No commands remaining.# You are currently rebasing branch 'feature' on '436e421'.## Changes to be committed:#       new file:   file1#       new file:   file2#       new file:   file3#
```

现在可以将 Add file1 更改为 Add files 1、2 和 3，或者想要的任何其他提交消息。保存并关闭文件，现在提交历史已经很紧凑了：

```
* b646cf6 - (HEAD -> feature) Add files 1, 2, and 3 (70 seconds ago) <AleksandrHovhannisyan>
* 436e421 - (master) Add name and author to package.json (14 minutes ago) <AleksandrHovhannisyan>
* beb7c13 - Update README with getting started instructions (14 minutes ago) <AleksandrHovhannisyan>
* 1c75f66 - Add .gitignore (14 minutes ago) <AleksandrHovhannisyan>
* 69c997b - Add README (14 minutes ago) <AleksandrHovhannisyan>
* 36210ec - Initialize npm package (15 minutes ago) <AleksandrHovhannisyan>
```

4. 还原提交
-------

上面学习了两种从 git 历史记录中删除提交的方法：

*   在要删除的提交范围之前，将 HEAD 指针软或硬重置为提交。
    
*   对不想保留的任何提交执行交互式变基并更改 `pick` 为 `drop`。
    

不幸的是，这两种方法都会重写提交历史。以使用交互式变基从 `master` 分支中删除 `.env` 文件为例。如果在现实中这样做，在像 `master` 这样的共享分支上删除提交会导致一些麻烦，团队中的每个人都必须硬重置本地的 `master` 分支以匹配 `origin/master`。

问题出现在人们正在进行功能分支上的工作时，特别是如果他们是从旧的 `master` 分支切出来的——删除的文件仍然存在。变基就是行不通的，因为它可能会重新引入在 `master` 分支上删除的文件；同样地，将 `master` 分支合并到功能分支中也不起作用，因为 git 没有公共历史可供解决：

```
fatal: refusing to merge unrelated histories
```

这就是 `git revert` 出现的原因。与通过变基或硬 / 软重置删除提交不同，revert 命令创建一个新提交以撤消目标提交引入的任何更改：

```
git revert <hash-id>
```

假设在 `master` 分支上，想要用 `beb7c13` 的哈希恢复提交：

```
* 436e421 - (HEAD -> master) Add name and author to package.json (8 hours ago) <AleksandrHovhannisyan>
* beb7c13 - Update README with getting started instructions (8 hours ago) <AleksandrHovhannisyan>
* 1c75f66 - Add .gitignore (8 hours ago) <AleksandrHovhannisyan>
* 69c997b - Add README (8 hours ago) <AleksandrHovhannisyan>
* 36210ec - Initialize npm package (8 hours ago) <AleksandrHovhannisyan>
```

为此，执行以下命令：

```
git revert beb7c13
```

Git 将打开编辑器：

```
Revert "Update README with getting started instructions"This reverts commit beb7c132882ff1e3214dbd380514559fed0ef38f.# Please enter the commit message for your changes. Lines starting# with '#' will be ignored, and an empty message aborts the commit.## On branch master# Changes to be committed:#       modified:   README.md#
```

保存并关闭文件，然后运行 `git log` 以查看历史记录：

```
* e1e6e06 - (HEAD -> master) Revert "Update README with getting started instructions" (58 seconds ago) <AleksandrHovhannisyan>
* 436e421 - Add name and author to package.json (8 hours ago) <AleksandrHovhannisyan>
* beb7c13 - Update README with getting started instructions (8 hours ago) <AleksandrHovhannisyan>
* 1c75f66 - Add .gitignore (8 hours ago) <AleksandrHovhannisyan>
* 69c997b - Add README (8 hours ago) <AleksandrHovhannisyan>
* 36210ec - Initialize npm package (8 hours ago) <AleksandrHovhannisyan>
```

注意，原始提交仍然存在于历史记录中，并且其哈希值得以保留。唯一改变的是在分支的顶部添加了一个新的提交，以还原此前提交所引入的更改，就好像手动删除了最初引入的更改。显然，使用 git revert 比手工操作更合理。

因此，与交互式变基或重置相比，撤销提交会引入额外的一个提交，因此会更加混乱。但这并不是非常重要的问题。而且，好处在于，它不会破坏公共分支。

5. 签出文件
-------

`git checkout` 命令是另一种撤消 git 更改的基本方法。它有三个目的：

*   创建新分支：`git checkout -b <newBranch>`。
    
*   切换到分支或提交：`git checkout <existingBranch>`。
    
*   恢复不同版本的文件。
    

这里我们将重点关注第三个目的。如果对本地文件进行了未暂存的更改，则可以使用 `checkout` 命令轻松撤消这些更改：

```
git checkout <pathspec>
```

这里，`<pathspec>` 可以是任何有效的路径说明符，例如：`.` 对于当前目录、`path/to/file`、`file.extension`，甚至是正则表达式。

这将清除对指定文件的所有未暂存更改并恢复当前分支的文件的未修改版本。此命令不会影响暂存文件——只会清除未暂存的更改。

例如，如果想清除当前目录中所有未暂存的更改并从头开始，最简单的方法是使用 `git checkout` 命令和 `.` 作为路径规范：

```
git checkout .
```

我们也可以使用 `git checkout` 来恢复文件的本地或远程版本。例如，可以签出远程 `master`分支上的某个文件：

```
git checkout origin/master -- <pathspec>
```

这个命令的作用是将远程分支 `origin/master` 上指定的文件 `<pathspec>` 签出到本地分支上。该命令会用远程分支上的文件覆盖本地分支上的同名文件，即用远程分支的版本替换本地分支的版本，从而确保本地分支与远程分支保持同步。

同样，也可以签出另一个本地分支上的某个文件：

```
git checkout localBranchName -- <pathspec>
```

6. 使用 Git Reflog
----------------

可以将 reflog 视为 git 的 git — 就像一个内部记录保存系统，可以跟踪大部分操作。

reflog 代表 “参考日志”：HEAD 指针随时间的不同状态的一系列快照。这意味着任何时候引入、删除或修改提交，或者签出新分支，或者重写旧提交的哈希，这些更改都将记录在 reflog 中。我们将能够回到过去撤消可能不需要的更改，即使它们看似不可逆转。

查看 Git 仓库的 `reflog` 的方式如下：

```
git reflog
```

例如，在功能分支上可以签出一个新分支，git 将记录该活动：

```
git checkout -b feature2
```

Reflog:

```
b646cf6 (HEAD -> feature2, origin/feature, feature) HEAD@{0}: checkout: moving from feature to feature2
```

这是因为 HEAD 指针从功能分支的首端重定向到新分支 feature2 的首端。

如果深入挖掘 `reflog`，还可以查看本文中的所有更改：

```
b646cf6 (HEAD -> feature2, origin/feature, feature) HEAD@{0}: checkout: moving from feature to feature2
b646cf6 (HEAD -> feature2, origin/feature, feature) HEAD@{1}: rebase -i (finish): returning to refs/heads/feature
b646cf6 (HEAD -> feature2, origin/feature, feature) HEAD@{2}: rebase -i (squash): Add files 1, 2, and 3
f3def0a HEAD@{3}: rebase -i (squash): # This is a combination of 2 commits.
0832e96 HEAD@{4}: rebase -i (start): checkout 436e421
6afa3ac HEAD@{5}: commit: Add file3
c16cbc6 HEAD@{6}: commit: Add file2
0832e96 HEAD@{7}: commit: Add file1
436e421 (master) HEAD@{8}: checkout: moving from master to feature
436e421 (master) HEAD@{9}: rebase -i (finish): returning to refs/heads/master
436e421 (master) HEAD@{10}: rebase -i (pick): Add name and author to package.json
beb7c13 HEAD@{11}: rebase -i (pick): Update README with getting started instructions
1c75f66 HEAD@{12}: rebase -i (pick): Add .gitignore
69c997b HEAD@{13}: rebase -i (pick): Add README
36210ec HEAD@{14}: commit (amend): Initialize npm package
04ba759 HEAD@{15}: rebase -i (edit): Add package.json
2bef9d4 HEAD@{16}: rebase -i (edit): Add package.json
666364d HEAD@{17}: rebase -i (start): checkout 666364da6703fc41e23515b1777de5ac84c8ad5e
ba88fb0 HEAD@{18}: rebase -i (finish): returning to refs/heads/master
ba88fb0 HEAD@{19}: rebase -i (reword): Add name and author to package.json
665034d HEAD@{20}: rebase -i (reword): Update README with getting started instructions
74dab36 HEAD@{21}: rebase -i: fast-forward
11221d4 HEAD@{22}: rebase -i (start): checkout HEAD~2
094f8cb HEAD@{23}: commit: Do more stuff
74dab36 HEAD@{24}: commit: Do something idk
11221d4 HEAD@{25}: rebase -i (finish): returning to refs/heads/master
11221d4 HEAD@{26}: rebase -i (pick): Add .gitignore
9ed001a HEAD@{27}: rebase -i (pick): Add README
0beebfb HEAD@{28}: rebase -i (start): checkout 2beb7c7^
7598875 HEAD@{29}: reset: moving to HEAD~1
b494f6f HEAD@{30}: commit: Add a file
7598875 HEAD@{31}: commit (amend): Add .gitignore
4753e23 HEAD@{32}: commit: Add .gitignore
893d18d HEAD@{33}: commit: Add README
2beb7c7 HEAD@{34}: commit: Add .env
0beebfb HEAD@{35}: commit (initial): Add package.json
```

可以通过检查这些提交哈希来快速查看这些状态中的任何一个：

```
git checkout <hash-id>
```

或者，可以将分支重置为历史记录中的某个点：

```
git reset --soft 7598875
```

这将当前的 `feature2` 分支软重置为以下历史：

```
* 7598875 - (HEAD -> feature2) Add .gitignore (84 minutes ago) <AleksandrHovhannisyan>
* 893d18d - Add README (85 minutes ago) <AleksandrHovhannisyan>
* 2beb7c7 - Add .env (85 minutes ago) <AleksandrHovhannisyan>
* 0beebfb - Add package.json (85 minutes ago) <AleksandrHovhannisyan>
```

甚至可以运行另一个 `reflog` 来查看更改：

```
7598875 (HEAD -> feature2) HEAD@{0}: reset: moving to 7598875
```

如果不希望本地分支被覆盖，可以再次运行 `reflog` 命令并将分支重置到在执行该操作之前的 `HEAD`：

```
git reset --hard b646cf6
```

这就回到了之前的状态：

```
* b646cf6 - (HEAD -> feature2, origin/feature, feature) Add files 1, 2, and 3 (13 minutes ago) <AleksandrHovhannisyan>
* 436e421 - (master) Add name and author to package.json (26 minutes ago) <AleksandrHovhannisyan>
* beb7c13 - Update README with getting started instructions (26 minutes ago) <AleksandrHovhannisyan>
* 1c75f66 - Add .gitignore (26 minutes ago) <AleksandrHovhannisyan>
* 69c997b - Add README (26 minutes ago) <AleksandrHovhannisyan>
* 36210ec - Initialize npm package (27 minutes ago) <AleksandrHovhannisyan>
```

Git 的 `reflog` 命令很有用，以防进行硬重置并丢失所有工作，只需查看 reflog 并重置到进行硬重置之前的点，就轻松搞定！

最后，如果出于某种原因想清理 reflog，可以使用以下方法从中删除行：

```
git reflog delete HEAD@{n}
```

将 `n` 替换为要从 `reflog` 中删除的任何行。`HEAD@{0}` 指的是 reflog 中的最新行，`HEAD@{1}` 指的是之前的一行，依此类推。

> 参考：https://www.aleksandrhovhannisyan.com/blog/undoing-changes-in-git/

### 往期推荐

[学习 Git，看这一篇就够了！](http://mp.weixin.qq.com/s?__biz=MzU2MTIyNDUwMA==&mid=2247501590&idx=1&sn=4c1b800cd839450e84894aee6bf6f825&chksm=fc7e894dcb09005b45e81c89d5953c4ac50aefcee7f677eac53f627d8ee4a314317de37968fd&scene=21#wechat_redirect)

[Vue.js 推出框架能力官方认证](http://mp.weixin.qq.com/s?__biz=MzU2MTIyNDUwMA==&mid=2247513920&idx=1&sn=6bd0346fcb159999275b925c64ad1ddb&chksm=fc7ef91bcb09700dea11654821b0f7ee16f36cb49b84b4e93ff540c6bae1b551f348611b605b&scene=21#wechat_redirect)

[Vite 4.3 正式发布，速度全面提升！](http://mp.weixin.qq.com/s?__biz=MzU2MTIyNDUwMA==&mid=2247513898&idx=1&sn=62339b8dbe1399f04388cfb18cfe36eb&chksm=fc7ef971cb09706762059bba256d685af972b34992ef1915fe6b157d662c963c43e3d9deeb93&scene=21#wechat_redirect)

[如何检查前端项目中未使用的依赖包？](http://mp.weixin.qq.com/s?__biz=MzU2MTIyNDUwMA==&mid=2247513890&idx=1&sn=d60e82b1f2509a569616e8f4d2c73a8a&chksm=fc7ef979cb09706fe82c9788f129140723673f3d496e6086ff9763e77fce526124835c0c6ae7&scene=21#wechat_redirect)

[Node.js 20 正式发布！](http://mp.weixin.qq.com/s?__biz=MzU2MTIyNDUwMA==&mid=2247513871&idx=1&sn=12362fa209f2eb16dcfabab5940779a3&chksm=fc7ef954cb0970426ad3952766ce2d03d43f8c4281d6d6709576a15c1189c97dccc12acc070f&scene=21#wechat_redirect)

[前端常用的富文本编辑器](http://mp.weixin.qq.com/s?__biz=MzU2MTIyNDUwMA==&mid=2247513859&idx=2&sn=cb0d4d6247cd32f4c7679db3ab85478e&chksm=fc7ef958cb09704ec107abf468eb0a82becd1b1a0ed4421a8fac21bf3b6f8394bd81c47055e1&scene=21#wechat_redirect)