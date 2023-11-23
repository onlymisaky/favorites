> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/BEglZX32DgLj2TS1sRzbgg) ![](https://mmbiz.qpic.cn/mmbiz_png/WYoaOn5t0APnyHfrwfJE8b673ibPCppKIIzA5GuXIHJ4oqPP66WYlV0oSDpPAhDPQr4DFMwcZ3qhlWRTibZtiaeng/640?wx_fmt=png)

原文：https://codeburst.io/deploying-a-react-app-using-github-pages-and-github-actions-7fc14d380796

作者：Clyde D'Souza  

介绍  

-----

我最近用 Create React App starter 模板创建了一个网站来演示我开发的一个 npm 包。我认为使用 GitHub 页面部署这个站点是非常简单的，然而，我错了。经过反复试验，我设法解决了这个问题。本文的目的是重新创建该场景，并带领您完成解决我们一路上遇到的每个问题的过程。

1. 起点
-----

让我们从一个共同的基础开始。我们先用 Create React App 工具创建一个 React 应用，同时将代码添加到 GitHub 仓库。我使用了以下命令来生成这个示例 React 应用。

```
npx create-react-app <project directory> --template typescript
```

此时，你的项目目录应该看起来像下面的截图。我没有添加或修改任何东西 -- 这些是当我们运行上述 npx 命令时，开箱即生成的文件和文件夹。我只是通过运行 `npm run start` 命令来确保它在本地工作，仅此而已。

![](https://mmbiz.qpic.cn/mmbiz_png/WYoaOn5t0APnyHfrwfJE8b673ibPCppKIOU1XSjiaJNJ7GZXRhoh0icYRmsHKZXE7AD0OpBBhP11qPicKg9ROywibyg/640?wx_fmt=png)

我已经把这些改动推送到了我的 GitHub 仓库，如果你也在关注，你也可以这样做。如果你想比较一下，这是我的版本库现阶段的样子。

2. 部署到 GitHub Pages
-------------------

当我们运行 `npm run build` 命令时，Create React App 会将生产文件放入 `build` 目录中。然而，如果你看一下 `.gitignore` 文件，你会发现构建目录被添加到这个列表中，因此，你无法将这个文件夹的内容提交到 GitHub。那么，我们该如何发布我们的应用呢？

### GitHub Actions

让 GitHub Actions 来拯救我们吧！我们需要在每次代码提交时构建我们的应用程序，这就是 GitHub Actions 的作用。在你的应用程序的 `.github/workflows` 目录下创建一个名为 `build-deploy.yml` 的文件。将以下内容粘贴到这个 YAML 文件中。这是我的 GitHub 仓库在这个阶段的样子。

```
name: Build & deployon:  push:    branches:      - main  pull_request:    branches:      - mainjobs:  build:    name: Build    runs-on: ubuntu-latest        steps:    - name: Checkout code      uses: actions/checkout@v2        - name: Install Node.js      uses: actions/setup-node@v1      with:        node-version: 13.x        - name: Install NPM packages      run: npm ci        - name: Build project      run: npm run build        - name: Run tests      run: npm run test    - name: Upload production-ready build files      uses: actions/upload-artifact@v2      with:        name: production-files        path: ./build    deploy:    name: Deploy    needs: build    runs-on: ubuntu-latest    if: github.ref == 'refs/heads/main'        steps:    - name: Download artifact      uses: actions/download-artifact@v2      with:        name: production-files        path: ./build    - name: Deploy to gh-pages      uses: peaceiris/actions-gh-pages@v3      with:        github_token: ${{ secrets.GITHUB_TOKEN }}        publish_dir: ./build
```

最近我写了这篇文章，解释了 GitHub Actions 的基本原理，这里就不多说了。总结一下，这个 YAML 文件定义了 GitHub Actions 中的工作流程。这个工作流会在每次推送变更到主分支或创建拉请求合并变更到主分支时被触发，它将构建 React 应用，并将 `build` 目录的内容部署到 `gh-pages` 分支。

关于 `${{ secrets.GITHUB_TOKEN }}` 的快速注释——GitHub 自动创建一个 `GITHUB_TOKEN` 密钥以在您的工作流程中使用。因此，它具有对存储库的写访问权，因此，您可以更新 `gh-pages` 分支。

如果您继续学习，请将此文件提交到存储库。马上，您就会注意到 GitHub Pages 现在将基于您在工作流文件中的内容进行构建。如果您转到 GitHub 中的 Actions 选项卡，您将看到您的工作流正在执行，并且在一段时间后有望被标记为成功。请随意单击 UI 并探索 GitHub 存储库的这个区域。

![](https://mmbiz.qpic.cn/mmbiz_png/WYoaOn5t0APnyHfrwfJE8b673ibPCppKIvjScib5jv7DX90icBjku2NCOl9GvQ6TYs4wzNPHzRJqgTqR591yhvZBQ/640?wx_fmt=png)

假定状态显示为成功，此操作还将创建一个名为 `gh-pages` 的新分支，并将在其中部署生产就绪代码。

![](https://mmbiz.qpic.cn/mmbiz_png/WYoaOn5t0APnyHfrwfJE8b673ibPCppKIU6HDByx4Uiavb3nS8nfStrhPxDB8tzydsqluj9znutIziaibqKv5p9fpw/640?wx_fmt=png)

很简单，不是吗？

### GitHub Pages

现在我们已经将构建文件放到了不同的分支中，让我们继续启用 GitHub Pages。点击菜单中的 **Settings**，然后向下滚动到 **GitHub Pages** 部分。

在这里，我们将配置网站内容的位置。由于我们的构建文件已推送到 `gh-pages` 分支，因此请从下拉列表中进行选择。点击 **Save** 按钮，页面会刷新，当你向下滚动到这部分时，你会看到一个网址。点击该网址，即可看到网站。

![](https://mmbiz.qpic.cn/mmbiz_png/WYoaOn5t0APnyHfrwfJE8b673ibPCppKItLQRIg9fegbksFGJZtlIqKLz1OHRIoTKzp5RDZGWBemFk7w6oPiaUpA/640?wx_fmt=png)

等等，怎么了？我看不到 React 应用的输出，你能看到吗？

![](https://mmbiz.qpic.cn/mmbiz_png/WYoaOn5t0APnyHfrwfJE8b673ibPCppKIv0ibRMiaHcBItxvRRVMnTCFWcuZMwxXHxbEBr2AzhZK30TOJU0jibVKog/640?wx_fmt=png)

您可能会看到一个空白的屏幕，并且如果打开控制台，则会看到很多错误。

> 提示：如果你没有看到空屏，而是看到 GitHub 的 404 信息，请等待几分钟，换个浏览器试试，最后，尝试清除缓存。由于这将是你第一次访问网站，它可能还没有在后台更新东西。

请注意它试图获取 JavaScript 和 CSS 文件的 URL——它使用的是基础 URL，但没有使用路径 `create-react-app-ghpages-demo`。显然，由于基础 URL 中不存在 JavaScript 或 CSS 文件，我们得到了一个 404 错误。

只有当你的项目站点使用的是 GitHub Pages，即格式为 `https://<username>.github.io/<project>/` 时，才会出现这个错误。如果你的版本库使用 `<username>.github.io` 的格式命名，那么启用 GitHub Pages 后可能不会出现上述错误。这是因为你的网站不再部署在根目录下，而是部署在更深一层的 `https://<username>.github.io/<project>/`。

那么，我们如何解决这个问题呢？让我们来看看。

3. 设置首页值
--------

打开这个应用的源代码，在 `package.json` 文件中，添加这个键值对，适当替换下面 URL 中的部分。

```
"homepage": "https://<username>.github.io/<project>/",
```

在我的实例中，这是我必须添加的内容：

```
"homepage": "https://clydedz.github.io/create-react-app-ghpages-demo/",
```

做完这个改动后，把它推送到 GitHub 上。这将触发一次构建和部署。

给它一两分钟，然后再次访问网站。现在你应该看到你的 React 应用已经启动并运行了。万岁！

![](https://mmbiz.qpic.cn/mmbiz_png/WYoaOn5t0APnyHfrwfJE8b673ibPCppKIEyjM6jHxRqKiaQYibRm85bj7JUUXRDoRe8HvVgYxzdYPVndjsuVUibrvA/640?wx_fmt=png)

4. 添加 React Router
------------------

接下来，我们就来看看在 React 应用中添加 Router 的常见场景。会不会无缝运行？还是会再次遇到错误？让我们一探究竟吧。

我将使用 React Router 来完成这个任务，我将输入以下命令来安装这个 npm 包。

```
npm install --save react-router-dom
```

我按照基本的例子添加了三个路由。这三条路由分别指向三个独立的 React 组件。这是我的 GitHub 仓库在添加 React Router 后的样子。

如果你运行 `npm run start` 命令，你将能够观察到一个非常奇怪的行为。

*   它的开头是 http://localhost:3000/create-react-app-ghpages-demo，但页面只包含导航链接，没有其他内容。
    
*   点击 “关于” 链接将 URL 更新为 http://localhost:3000/about，现在会显示一些内容。然而，由于 URL 中完全删除了 `create-react-app-ghpages-demo` 的值，我们已经不在正确的网站上了（硬刷新该 URL 会出现错误）。
    

无论如何将这些更改提交到 GitHub 上（你可能还需要更新你的单元测试）。在成功部署后，你应该也能在线复制这种行为。这显然不是很理想。

![](https://mmbiz.qpic.cn/mmbiz_gif/WYoaOn5t0APnyHfrwfJE8b673ibPCppKIJaX8D6Tv47zoicxqB5zibcHX5pY9sjvROMs9NDahKcIzUGI5SFLfib8Cg/640?wx_fmt=gif)

5. 解决路由错误
---------

造成这种奇怪行为的原因是现在路由器认为网站是从根目录服务的。这是不正确的 -- 演示应用程序是由一个子目录提供服务的 -- 因此出现了不匹配。

要解决此问题，请更新以下代码行：

```
<Router>
```

到

```
<Router basename={process.env.PUBLIC_URL}>
```

`process.env.PUBLIC_URL` 的值将是 `/<project>`。basename 属性允许我们指定路由的实际基础 URL，在本例中，它将是子目录。

现在剩下的就是让我们测试该演示网站，并确认它可以像魅力一样工作。

就是这样！谢谢阅读。

粉丝福利

极客时间专栏《Electron 开发实战》7 天有效，需要的速取！获取资源请在公众号对话框中回复关键字：JK05，关键字全部大写哦！更多福利资料请查看公众号菜单

### 

最近文章

*   [22 个有用的 JavaScript 单行程序](http://mp.weixin.qq.com/s?__biz=MzI0MDIwNTQ1Mg==&mid=2676497147&idx=1&sn=0d10339ae60e001d702e0d521d966084&chksm=f362d118c415580e056a1230e3c90b6d969c725ee54cbb23bd9880fdd5fe16c08e6df93f07ff&scene=21#wechat_redirect)
    
*   [在 Javascript 应用程序中执行语音识别](http://mp.weixin.qq.com/s?__biz=MzI0MDIwNTQ1Mg==&mid=2676497179&idx=1&sn=73f3af05517d00e18d8219e97aee8f4f&chksm=f362d0f8c41559ee933c16b45c3dbd27228ce154ae5ebf544574c26f7dcc6d323f5ff8b10c86&scene=21#wechat_redirect)  
    
*   [CSS 的: placeholder-shown 伪类有什么用？](http://mp.weixin.qq.com/s?__biz=MzI0MDIwNTQ1Mg==&mid=2676497167&idx=1&sn=e74941bc07ae0d245185a9002fec4ed8&chksm=f362d0ecc41559fa914a4267574cf8c7e4d3f83c826934007468483fc028223119f06b16d21c&scene=21#wechat_redirect)  
    
*   [Grid vs Flexbox：哪个更好？(粉丝福利更新)](http://mp.weixin.qq.com/s?__biz=MzI0MDIwNTQ1Mg==&mid=2676497104&idx=1&sn=8e90160b301f2301b39e3f1380a06491&chksm=f362d133c415582548331a557bf12c073509ad6c48bafce89e9ece824f45fb71350ffcaba815&scene=21#wechat_redirect)
    
*   [你应该经常使用的 7 种 Vue 模式](http://mp.weixin.qq.com/s?__biz=MzI0MDIwNTQ1Mg==&mid=2676497077&idx=1&sn=c0ca4d35e51fda1de47c8133da0d08b6&chksm=f362d156c4155840aa51845cb42af67eb79b9dc8a05cf504546d419e4cd824bb201dc41ce25d&scene=21#wechat_redirect)  
    
*   [改善程序性能和代码质量：通过代理模式组合 HTTP 请求](http://mp.weixin.qq.com/s?__biz=MzI0MDIwNTQ1Mg==&mid=2676496881&idx=1&sn=a970de1be05da0fa2e8502c8d1d80d1b&chksm=f362d212c4155b046a9b51da24f8204e3a074533688bf887f6b454cf4c0625e8cef39c377a0a&scene=21#wechat_redirect)
    
*   [编程日历小程序，对小程序云开发和生成海报的实践](http://mp.weixin.qq.com/s?__biz=MzI0MDIwNTQ1Mg==&mid=2676496528&idx=1&sn=c2d24fcf1bfb292f1f31d75896c5e5bc&chksm=f362d373c4155a65b2f03c3a103f5e2ce90f12de5ce02aba0bb5884052c754524e8a9bdd4d10&scene=21#wechat_redirect)  
    
*   [一个付费 chrome 插件的一生](http://mp.weixin.qq.com/s?__biz=MzI0MDIwNTQ1Mg==&mid=2676496480&idx=1&sn=1df0c248fc0c0a48df1a76a00bad4a1a&chksm=f362d383c4155a958ca85bc169480753c240eeec5f56d973a6dfc4df30cdd599b68d8c604bf2&scene=21#wechat_redirect)