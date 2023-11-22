> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/g6qehJGMz8PQYscbSmMNzA)

大厂技术  高级前端  精选文章

点击上方 全站前端精选，关注公众号

回复 1，加入高级前段交流

![](https://mmbiz.qpic.cn/mmbiz_png/KpF7T3OPIQQJic4JXeQB9iasO4WLHoDd1XlsaibIrcfG6n6R39RxB8OOicBkplzq4LTmqA7xrciaVbMkCoqufEdgzLA/640?wx_fmt=png)

如今，开发人员经常使用自动化工具来有效地管理任务，并简化他们的日常活动。GitHub Actions 就是这些流行的工具之一。

你可能会同意我的观点：软件（包括开源软件）对效率的要求很高。在这种自动化工具的帮助下，维护者可以将重复性的工作自动化，并专注于更重要的任务，如编写高质量的代码、审核贡献，以及围绕项目创建一个活跃的社区。

我曾经不得不手动完成一些本可以自动化的任务，所以我觉得我有资格分享如何使用 GitHub Actions 来节省时间。

我花了大半天的时间去研究我的一个已经吸引了贡献者的迷你 Python 项目。我给新的贡献者写热情洋溢的欢迎词，检查最近 pull requests，以确保他们遵守项目的规则比如 README 文件和说明、如果需要的话提供截图，等等。

但我不知道的是，我可以自动执行其中一些任务以及更多任务，以减少自己的工作量。我可以在 GitHub Actions 的帮助下做到这一点。

在本指南中，我将分享更多关于 GitHub Actions 的信息，以及我如何使用它。我将向你展示如何利用它来自动化项目的各个方面，从欢迎新贡献者到分配任务、检查代码质量等等。我们一起来让你的项目更加高效、更具有交互性。

GitHub Actions 是什么
------------------

GitHub Actions 是一种工具，可让你在 GitHub 仓库中执行不同的自动化操作。它允许你创建自定义工作流，你可以使用这些工作流来自动化开发过程，例如构建、测试和部署代码。

将此工具与其他 GitHub 功能集成后，你可以转变你的项目管理程序，让每个参与其中的人都更加愉快，更加有参与感。

如何在你的仓库中设置 GitHub Actions
-------------------------

一切都从根文件夹开始。默认情况下，GitHub Actions 通常集成在你的 GitHub 仓库中，因此你无需在安装时注册单独的账户。但是你需要执行几个步骤才能访问它的功能。

*   在你的 GitHub 仓库中，在顶部导航选项卡上，你将看到 Actions 选项卡。单击它，你可以访问推荐的工作流列表以及创建自己的工作流的选项。
    
*   现在，根据项目的性质，你可以选择从可用列表中选择一个已经创建的工作流，也可以选择自己创建一个。由于你了解项目的全部内容以及可能需要自动化的内容，因此我建议你自己设置一个新的工作流程。这将使你更好地了解正在发生的事情。
    
*   要设置新的工作流程，请单击 Set up a workflow yourself（自行设置工作流程）。这将带你进入一个工作流创建界面，其中包含一个名为 `main.yml` 的新 YAML 文件。既然你选择编写自己的工作流程，在这里，我应该提到了解 YAML 非常重要。
    

![](https://mmbiz.qpic.cn/mmbiz_png/KpF7T3OPIQQJic4JXeQB9iasO4WLHoDd1X9aDuBlBiakmRAGaOh4OJZz6qN4TmZaWxVw3Jr2fxh6k3dsUbKzv7VicA/640?wx_fmt=png)

在幕后发生的事情是，一旦你单击此选项，就会在 main.yml 文件旁边创建两个文件夹。如果你之后访问你的仓库或查看文件名之前的路径，你将看到：`.github/workflows/<filename>`。

*   在 `main.yml` 文件中是你定义工作流程的地方，在编写完所有内容后，你可以提交更改（commit the changes），就像对仓库进行更改时所做的那样。这样，你就设置了工作流，它将根据 YAML 文件中定义的触发器运行。
    

或者，你仍然可以在你最喜欢的代码编辑器中完成这一切。你需要做的就是将仓库克隆到你的计算机上，在项目的根文件夹中创建一个 `.github` 文件夹，在其中创建另一个名为 `workflows` 的文件夹，最后添加一个扩展名为 `.yml` 的文件并将你的脚本写入这个文件。

在下面的示例中，我将引用我在项目中实现的代码来帮助你理解。

GitHub Actions 组件
-----------------

GitHub Actions 主要由三个主要组件组成，包括：

*   工作流（Workflows） - 这些是定义自动化过程的规则集。它们在 YAML 文件中定义，该文件存储在 .github/workflows 目录中。
    
*   事件（Events） - 它们启动工作流。例如，你可以将事件设置为在创建 PR 或新开 issue 时运行工作流。要在工作流中定义事件，请使用关键字 on 后跟事件名称。
    

例如：

```
on:    issues:        types: [opened]    pull_request_target:        types: [opened]
```

*   任务（Jobs） - 这些构成了工作流程。默认情况下，任务是同时运行的。要在给定的工作流中定义你的任务，请使用关键字 jobs，后跟每个任务及其配置的唯一标识符。
    

例如：

```
jobs:  build:    runs-on: ubuntu-latest    steps:      - name: Check out repository        uses: actions/checkout@v2      - name: Set up Python        uses: actions/setup-python@v2        with:          python-version: 3.10      - name: Install dependencies        run: |          pip install -r requirements.txt
```

所有这些组件确保一组特定的规则被成功执行。现在看看我们的项目。

如何自动化管理 issue 和 pull request
----------------------------

管理 issue 和 pull request 可能是一项非常耗时的工作，尤其是对于大型开源项目。但有了 GitHub Actions，维护者就可以把这些流程自动化，把更多的时间花在编码和与社区互动上。

### 如何创建 issue 和 pull request 模板

如果你是一个活跃的开源贡献者，你有可能遇到过一个指南，告诉你在创建 issue 或提交 PR 时应该包括什么。这种模板的主要目的是提供指导，确保贡献者提供所有必要的信息。

现在，让我们看看你如何在你的项目中创建这个模板：

*   第一步是确保在仓库的 root 中有一个 `.github` 目录，如果你还没有的话。
    
*   在 `.github` 文件夹内，创建两个文件夹 `ISSUE_TEMPLATE` 和 `PULL_REQUEST_TEMPLATE`。
    
*   在这两个文件夹中，添加代表你想自动化内容的 markdown 文件：例如，你可以将 `feature_request.md` 和 `issue_report.md` 作为 issue 模板，将 `pull_request_template.md` 作为 PR 模板。
    

下面是我在 `pull_request_template.md` 文件中写的内容，作为参考。这是一个简单的指南，告诉贡献者在提交 pull request 之前应该包括什么。

```
**Related Issue(s):**Please provide a title for this pull request.**Description:**Please provide a brief description of the changes you are proposing.**Checklist:**-   [ ] I have read and followed the [contributing guidelines](/CONTRIBUTING.md).-   [ ] I have included a README file for my project.-   [ ] I have updated the main README file where necessary.-   [ ] I have included a requirements.txt file.-   [ ] I have added tests that prove my changes are effective or that my feature works.-   [ ] All new and existing tests pass.**Screenshots**If applicable, add screenshots to help explain behavior of your code.**Additional Notes:**Please provide any additional information about the changes you are proposing.
```

如需更详细的解释，请在这里查看 GitHub Action 关于 issue 和 pull request 模板的文档。

### 欢迎新的贡献者并表彰社区的努力

作为一个维护者，与社区打交道是很重要的，因为你有机会与你的朋辈直接互动并获得反馈。但如果你正在运行一个吸引众多贡献者的大型项目，你可能不会经常有机会直接与社区互动。

在 GitHub Actions 的帮助下，你可以完成其中的一些任务，比如欢迎新的贡献者，认可他们的努力，并为现有的社区成员创造一个积极的氛围。

如果你正在管理一个小项目，你可能可以直接与社区互动，但仍然利用自动化来完成一些工作。

例如，这里有一些示例代码，当新的贡献者创建 pull request 或在仓库上创建一个新的 issue 时，我通过这些代码来欢迎他们。在其中，你可以看到我有一条信息，感谢他们的努力，也向他们保证我将尽快审核他们提交的修改。尽管如此，如果需要额外的东西或提出新的想法，我还是会通过对话去跟进。

```
name: Welcome New Contributorson:    issues:        types: [opened]    pull_request_target:        types: [opened]jobs:    welcome:        runs-on: ubuntu-latest        steps:            - name: Welcome Issue              if: github.event_name == 'issues'              uses: actions/github-script@v5              with:                  script: |                      const issue = context.issue;                      const repo = context.repo;                      const issueAuthor = context.payload.sender.login;                      const welcomeMessage = `                        Hi @${issueAuthor}! :wave:                        Thank you for creating an issue in our repository! We appreciate your contribution and will get back to you as soon as possible.                      `;                      github.rest.issues.createComment({                        ...repo,                        issue_number: issue.number,                        body: welcomeMessage                      });            - name: Welcome Pull Request              if: github.event_name == 'pull_request_target'              uses: actions/github-script@v5              with:                  script: |                      const pr = context.issue;                      const repo = context.repo;                      const prAuthor = context.payload.sender.login;                      const welcomeMessage = `                        Hi @${prAuthor}! :wave:                        Thank you for submitting a pull request! We appreciate your contribution and will review your changes as soon as possible.                      `;                      github.rest.issues.createComment({                        ...repo,                        issue_number: pr.number,                        body: welcomeMessage                      });
```

除了这个简单的工作流程外，如果你正在领导一个更复杂的项目，你可以考虑编写一个更详细的工作流程，能够自动为贡献者分配徽章、标签或自定义标题。

同样，你也可以选择添加一个工作流，在贡献者的 pull request 被合并或 issue 被关闭时对其表示感谢。你可以查看 GitHub Action 文档，了解详细的指南。

如何实现代码 QA 的自动化
--------------

对于大多数开发人员来说，编写高质量的代码是非常重要的，特别是如果他们正在创建与消费者有关的应用。虽然一个项目的成功取决于精心编写和测试的代码，但有时审核修改可能会花些时间，甚至会使用户正需要的功能延迟上线。

在代码自动化工具的帮助下，你可以保持一致的编码风格，并快速和容易地识别潜在的错误，保持你的项目整洁。

那么，如何用 GitHub Actions 设置持续集成（CI），整合代码 formatting 和 linting 工具，并在项目中使用自动化代码审核服务？

持续集成（CI）帮助你实现流程自动化，如构建、测试和验证代码更改。就像其他自动化代码一样，CI 代码写在一个 `.yml` 文件中，存储在 `.github/workflows` 文件夹中。

下面是一个 Python 项目 CI 工作流程的例子，它在向仓库的 `main` 分支 pull request 时运行。它测试 Python 多个版本的代码，安装必要的依赖，并使用 `unittest` 模块运行测试。

```
name: Python CIon:  push:    branches:      - main  pull_request:    branches:      - mainjobs:  build:    runs-on: ubuntu-latest    strategy:      matrix:        python-version: [3.7, 3.8, 3.9, 3.10]    steps:    - uses: actions/checkout@v2    - name: Set up Python ${{ matrix.python-version }}      uses: actions/setup-python@v2      with:        python-version: ${{ matrix.python-version }}    - name: Install dependencies      run: |        python -m pip install --upgrade pip        pip install -r requirements.txt    - name: Run tests      run: |        python -m unittest discover
```

除了上面的代码，如果你想保持代码风格的一致性，你可以整合代码 formatting 和 linting 工具，如 `black`、`isort` 或 `flake8`。为此，你只需要在 `requirements.txt` 文件中加入这些工具，该文件已经包含在上述代码中。下面的代码块运行这些工具。

```
#...    # ...    - name: Run black for code formatting      run: |        black --check .    - name: Run isort for import sorting      run: |        isort --check --diff .    - name: Run flake8 for linting      run: |        flake8 .
```

如果它发现任何代码格式问题，CI 构建将失败。要解决这个问题，你必须手动检查日志。请查看这个关于构建和测试 Python 的指南，了解更多的例子。

上面的想法只是你可以在项目中使用的一些自动程序。对于一个更复杂的应用，你可以考虑增加工作流程，用 Sphinx 或 MkDocs 等工具生成文档，自动化依赖性更新，自动化发布管理和项目跟踪，等等。

关于构建自定义 GitHub Actions 的提示
--------------------------

在 GitHub Actions 市场上已经有很多预制的 action。但有时你可能想要或需要定制工作流程以满足你的需求。

为此，你可以选择 JavaScript 或 Docker 容器，并与社区分享。

这里有一些可以遵循的最佳做法：

*   了解问题 - 就像其他项目一样，在开始构建之前，确保你了解要解决的问题以及你将如何解决它。
    
*   选择正确的技术栈 - 如上所述，可以使用 JavaScript 或 Docker 编写 GitHub Actions。请确保选择最适合你的需求和理解的方式。
    
*   确保你遵守最佳的编码实践，以便别人能够轻松地理解和阅读你的代码。
    
*   利用已有的软件包，如 `@actions/core` 和 `@actions/github`，它们提供了与 GitHub Actions 环境和 GitHub API 的简单互动。
    
*   在成功创建自己的工作流程后，你有可能想要发布它。无论你是否发布，请确保测试你的 action 是否有潜在的问题或错误。
    

通过这些简单的技巧，你可以创建一个自定义的 GitHub Action 来自动完成项目中的一些主要 / 基本任务。除了上面的提示，你可以在官方文档中找到更多关于创建自定义 action 的详细信息。

总结
--

在本指南中，我们看到了 GitHub Actions 能给我们的项目带来的好处。它不仅简化了生产流程，而且还允许我们自定义 action 以适应项目需要。

这仅仅是我们能实现的东西的一小部分。我鼓励你更好地理解和探索不同的方法，以进一步用 GitHub Actions 改进你的开源项目。让我们拥抱自动化，利用它来完成更多工作。

* * *

原文链接：https://www.freecodecamp.org/news/automate-open-source-projects-with-github-actions/

作者：Hillary Nyakundi

译者：Chengjun.L

### 

前端 社群  

  

  

下方加 Nealyang 好友回复「 加群」即可。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/udZl15qqib0N4k0zoSSTiaUeicvTRStJYYmGWa6YpNqicxibYmM4oSD8oWs9X8b9DfK3CpUmGMWzIriaiaOf1L59t9nGA/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

如果你觉得这篇内容对你有帮助，我想请你帮我 2 个小忙：  

1. 点个「在看」，让更多人也能看到这篇文章