> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/_MhYVCoJwgd0VsFVxPpxuw)

### 一. 概述

作为前端技术人员，如果要部署一个项目大体要经过：`代码开发`、`代码推送`、`打包dist文件`、`scp到服务器`、`服务器nginx配置`、`完成部署`这几个流程，现实中我们希望项目部署尽可能自动且简单，因此诞生了各种`CI/CD`工具，比如：`Jenkins`、`gitlab ci`、`gitlab runner`等，其实我们最熟悉的 `GitHub` 也提供了`CI/CD` 的能力：`GitHub Actions`, 它于 2019 年 11 月正式发布，现已经支持多种的语言和框架：**Node.js, Python, Java, PHP, Ruby, Go, Rust, C/C++, .NET, Android, iOS**. 当然在利用`GitHub Actions`自动部署项目之前，先要利用`GitHub Pages`来发布我们的前端项目。

### 二. GitHub Pages

![](https://mmbiz.qpic.cn/mmbiz_png/0knnia8k7kVfUn4n3OvZ52LE5YdFkribD5aZQMSqUznj33AYvfEC0GxGw2uI0ORckwibMlFTjRaSSTerth3ZiblI2w/640?wx_fmt=png)

什么是 `GitHub Pages`？官网的介绍：**Websites for you and your projects.Hosted directly from your GitHub repository. Just edit, push, and your changes are live.** 说的很明确了，可以利用它, 将我们托管在 `GitHub` 仓库的项目部署为一个可以对外访问的网站，免去了我们自己购买与配置服务器的麻烦。

*   **首先创建一个项目**，以 Vue 项目为例，利用 Vue 脚手架创建一个项目
    

```
npm init vue@latest
```

这里假设你已经熟悉了 Vue 项目创建，如果不熟悉 Vue 可以去查看执行如下命令：

```
> cd <your-project-name>> npm install> npm run dev
```

运行后在浏览器中打开本地地址，得到如下页面：![](https://mmbiz.qpic.cn/mmbiz_png/0knnia8k7kVfUn4n3OvZ52LE5YdFkribD5DBMY1iaTAvIj0vAX58TtoGICDSk5YvqSQFtUs4VYIE8IHK41wvE5bdQ/640?wx_fmt=png)

*   **在`GitHub`上创建一个新的`Repository`, 将项目上传到`GitHub`仓库**
    

```
git initgit add .git commit -m "备注信息"git remote add origin 你的远程仓库地址git push -u origin master
```

*   **配置 `GitHub Actions`**回到`GitHub`, 点击`Setting`->`Pages`，看到如下界面![](https://mmbiz.qpic.cn/mmbiz_png/0knnia8k7kVfUn4n3OvZ52LE5YdFkribD5QKbQuZV41FYWEicApOc0xibF2zDxIoOrmvqy9YQCKZtxOwZgutMUFebg/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/0knnia8k7kVfUn4n3OvZ52LE5YdFkribD5yRQKIWbhFCQeQnMnxlAJNLPLUxic3mHKTMnlGz2ppI6KkzicTiaUJzq5Q/640?wx_fmt=png)并没有展示网址，别急！此时还需要我们去新建一个名为 **gh-pages** 的分支，创建完成后再次打开`Pages`，可以看到页面发生了变化![](https://mmbiz.qpic.cn/mmbiz_png/0knnia8k7kVfUn4n3OvZ52LE5YdFkribD5y2m8I0681e0CCqhDo9CSYBt7A7ziaYsHV0AicZSup9CJNfjFW6vials6w/640?wx_fmt=png)
    

> **Source**: 选择`Deploy from a branch`, **Branch**：`github pages` 默认只能识别项目根目录的 `index` 文件，我们这里选择新建的`gh-pages`的`root`根目录，意思是去这个分支的根目录加载`index.html`文件.

*   **打包应用，并发布到 `gh-pages` 分支**打包应用，执行`npm run build` ，在项目根目录下得到打包后的产物`dist`文件夹,
    
    ![](https://mmbiz.qpic.cn/mmbiz_png/0knnia8k7kVfUn4n3OvZ52LE5YdFkribD5rVqe5povesfeicIzMdzVjZnNDt8X5WibZKKiazibOfW0mFW13psGfR6fzg/640?wx_fmt=png)
    
    切换当前分支到`gh-pages`, 并且将原有内容全部删除, 最后将`dist`文件夹下的内容全部拷贝到`gh-pages`上，push 到远端.![](https://mmbiz.qpic.cn/mmbiz_png/0knnia8k7kVfUn4n3OvZ52LE5YdFkribD5qHVMNznaib3UVnB5tlXFqtg4bibm1ERAosczDFPOaHic8JGwgHFfosIRQ/640?wx_fmt=png) 再次点击`Setting`->`Pages` , 稍等一会儿，下面出现了一个网址, 这就是项目线上地址![](https://mmbiz.qpic.cn/mmbiz_png/0knnia8k7kVfUn4n3OvZ52LE5YdFkribD5w1jyW84ibV1GibYolv6ds0ibU2MIZppXgGhpyUx9ZF5wicEVCECn51Qu9g/640?wx_fmt=png)
    
*   **遇到问题**点击查看网址，并没有像我们预期的那样展示页面，而是一片空白。打开调试版查看错误信息：![](https://mmbiz.qpic.cn/mmbiz_png/0knnia8k7kVfUn4n3OvZ52LE5YdFkribD5PdWicKGBukU2MnXZY8SMUIq1VAMRvI5mJ6GjeNjGR3icYQkibiavrNbkCg/640?wx_fmt=png)如果有项目部署经验的一看就知道是怎么回事了，这是打包编译后的文件路径配置有问题，资源文件`css`、`js`，加载的路径地址不对，加载的是根路径`https://<用户名>.github.io/assets/index.bf782a5b.js`, 而我们的资源文件在`/vue-pages/`目录下，所以当然报错`404`，修复也很简单，如果你的 Vue 项目是基于 Vite 的构建的，需要修改`vite.config.js`，添加`base:'./'`
    

```
export default defineConfig({  plugins: [vue(), vueJsx()],  base:'./',// 将根路径换成相对路径  resolve: {    alias: {      "@": fileURLToPath(new URL("./src", import.meta.url)),    },  },})
```

如果是基于`webpack`构建，修改`vue.config.js`添加`publicPath: './'`.

```
module.exports = {  /**   * publicPath 默认是 / 是根路径，这个是指服务的根路径：https://xxx.github.io/，发布后会从这个路径下找 js.css 等资源，而生成的网站路径是这个 https://xxx.github.io/Vue-Element/，显然是找不到的   * 我们需要修改为 相对路径'./' 或是‘.’ 或是 直接设置的项目子路径 :/项目名称/ 就可找到资源了   */  publicPath: './',  outputDir: 'dist', // dist  assetsDir: 'static',  lintOnSave: process.env.NODE_ENV === 'development',  productionSourceMap: false,...
```

重新打包，将`dist`文件夹下内容拷贝到`gh-pages`分支下，并重新打开`pages`链接：`https://<用户名>.github.io/vue-pages/`成功部署！

> 每一次修改后都要重新打包，切换分支拷贝 dist 文件夹，实属麻烦，能不能让`GitHub`自动检测`push`动作, 自动进行打包部署吗？那就是`GitHub Actions`的工作了.

### 三. GitHub Actions

#### 什么是`GitHub Actions`?

`GitHub Actions`是`GitHub`推出的一款持续集成 **（CI/CD）** 服务，它给我们提供了虚拟的服务器资源，让我们可以基于它完成自动化测试、集成、部署等操作。这里简单介绍一下它的几个基本概念，更多内容可以去官网查看

#### 基本概念

*   `Workflows（工作流程）`持续集成的运行过程称为一次工作流程，也就是我们项目开始自动化部署到部署结束的这一段过程可以称为工作流程.
    
*   `job （任务）`一个工作流程中包含多个任务，简单来说就是一次自动部署的过程需要完成一个或多个任务.
    
*   `step（步骤）`部署项目需要按照一个一个的步骤来进行，每个`job`由多个`step`构成.
    
*   `action（动作）`每个步骤`step`可以包含一个或多个动作，比如我们在一个步骤中执行打包命令这个 Action.
    

#### 语法简介

*   **name**`name`字段是`workflow`的名称。如果省略该字段，默认为当前`workflow`的文件名.
    

```
name: GitHub CI
```

*   **on**`on`字段指定触发`workflow`的条件，通常是某些事件, 比如代码推送`push`, 拉取`pull_request`, 可以是事件的数组.
    

```
on: pushoron: [push, pull_request]
```

指定触发事件时，可以限定分支或标签:

```
on:  push:    branches:          - master
```

上面代码表示：只有`master`分支发生`push`事件时，才会触发`workflow`.

*   **jobs**`workflow`的核心就是`jobs`，任务`job`放在`jobs`这个集合下，每一个`job`都有`job_id`，用`job_id`标识一个具体任务
    
*   `jobs.<job_id>.name`任务说明
    

```
jobs:  my_first_job: // job_id    name: My first job   my_second_job:// job_id    name: My second job
```

上面的`jobs`字段包含两项任务，`job_id`分别是`my_first_job`和`my_second_job`。

*   `jobs.<job_id>.runs-on``runs-on`字段指定运行所需要的虚拟机环境, 它是必填字段。
    

```
runs-on: ubuntu-18.04
```

`GitHub Actions`给我们提提供的运行环境主要有以下几种：**ubuntu-latest**，**ubuntu-18.04 或 ubuntu-16.04****windows-latest，windows-2019 或 windows-2016****macOS-latest 或 macOS-10.14**

*   `jobs.<job_id>.steps`任务步骤，一个`job`可以包含多个步骤，我们需要分为多个步骤来完成这个任务，每个步骤包含下面三个字段：
    

```
jobs.<job_id>.steps.name：步骤名称。
jobs.<job_id>.steps.run：该步骤运行的命令或者 action。
jobs.<job_id>.steps.env：该步骤所需的环境变量。
```

#### 使用介绍

*   新建. yml 文件 点击主页`Actions` -> `New workflow` -> `set up a workflow yourself`，当然你也可以选择一个模板，点击`start commit`则会自动在我们项目目录下新建`.github/workflows/main.yml`文件.![](https://mmbiz.qpic.cn/mmbiz_png/0knnia8k7kVfUn4n3OvZ52LE5YdFkribD5yia5CnfM8KTvq8LuicHiaicoyLiav6LEOj1t0VsECp4jFbzd4Pq6Oa55PsQ/640?wx_fmt=png)
    

整个`workflow`的核心就是`yml`脚本的书写。如果你需要某个`action`，不必自己写复杂的脚本，直接引用他人写好的 `action`即可，整个持续集成过程，就变成了一个`actions`的组合，你可以在`GitHub`的官方市场，可以搜索到他人提交的`actions`. 下面是我们要自动发布`GitHub pages`所写的脚本：

```
name: CI Github Pageson:  #监听push操作  push:    branches:      - main # 这里只配置了main分支，所以只有推送main分支才会触发以下任务jobs:  # 任务ID  build-and-deploy:    # 运行环境    runs-on: ubuntu-latest    # 步骤    steps:      # 官方action，将代码拉取到虚拟机      - name: Checkout           uses: actions/checkout@v3      - name: Install and Build   # 安装依赖、打包，如果提前已打包好无需这一步        run: |          npm install          npm run build      - name: Deploy   # 部署        uses: JamesIves/github-pages-deploy-action@v4.3.3        with:          branch: gh-pages # 部署后提交到那个分支          folder: dist # 这里填打包好的目录名称
```

上面整个`workflow`的说明：

*   只有当`main`分支有新的`push`推送时候才会执行整个`workflow`.
    
*   整个`workflow`只有一个`job`,`job_id`是`build-and-deploy`,`name`被省略.
    
*   `job` 有三个`step`：第一步是`Checkout`, 获取源码，使用的`action`是`GitHub`官方的`actions/checkout`.
    
*   第二步：`Install and Build`, 执行了两条命令：`npm install`,`npm run build`, 分别安装依赖与打包应用.
    
*   第三步：`Deploy` 部署，使用的第三方`action`：`JamesIves/github-pages-deploy-action@v4.3.3`, 它有两个参数：分别是`branch`、`folder`，更多关于这个`action`的详情可以去查看.
    

> 当点击 **`Start commit`**，`GitHub Actions` 会自动运行`workflow`. 修改工程文字欢迎文字：

```
<HelloWorld msg="You did it!" />
```

改为:

```
<HelloWorld msg="GitHub Actions CI Succeed!" />
```

`push`可以点击`Actions`查看工作流的运行情况![](https://mmbiz.qpic.cn/mmbiz_png/0knnia8k7kVfUn4n3OvZ52LE5YdFkribD54RIpbGLQujzKSm3icmPbFiadicV1yyibudPMXdodIOO2IgiaFOibeTE55ib6w/640?wx_fmt=png)当这个黄色加载动画变成绿色后表示`workflow`运行完成，看下最终效果：![](https://mmbiz.qpic.cn/mmbiz_png/0knnia8k7kVfUn4n3OvZ52LE5YdFkribD5ics7ic4hibkzptR5NG0uITSfKY665364KLLG19LlxaoJ3svv3LNkFRHfQ/640?wx_fmt=png)达到了自动部署的目的.

### 四. 设置`Custom domain`

其实经过上面的三步已经可以实现自动部署的目的了，但是还是有点瑕疵。我们部署后的项目地址是：`https://<用户名>.github.io/vue-pages/`, 域名还是`GitHub`的, 能不能改成我们自己的专属域名呢？比如改成`http://<用户名>.com/`, 那就需要设置`Custom domain`了。

#### 1. 购买域名

如果想将项目地址改成自己的专属域名，首先需要你去购买一个域名，目前阿里云, 腾讯云都支持域名的购买，搜索自己喜欢的域名直接付款就好了。![](https://mmbiz.qpic.cn/mmbiz_png/0knnia8k7kVfUn4n3OvZ52LE5YdFkribD5tL4xlxgaZHd2kBl1utHfXbCCpictoqPHOCJH0ibn3YtUoNTx7jlAOygQ/640?wx_fmt=png)

#### 2. 购买域名后，还需要我们进行实名认证以及备案，按照平台的提示进行操作就好了，这里不再涉及.

#### 3. 进行 DNS 解析配置

这里以阿里云为例，打开域名解析控制台，点击解析按钮![](https://mmbiz.qpic.cn/mmbiz_png/0knnia8k7kVfUn4n3OvZ52LE5YdFkribD570wfyRP6xQ0y2RlTQkXk3aPiadoLFoRMAib9F3LkYIot4wH6GD5UNavw/640?wx_fmt=png)点击添加记录按钮，将下面两种类型的记录值添加上，记录类型是：`CNAME`，记录值就是你`GitHub`的主域名.![](https://mmbiz.qpic.cn/mmbiz_png/0knnia8k7kVfUn4n3OvZ52LE5YdFkribD5kLQvoFEYbXBWwgkGIO2DYgEjpLjGWMsrXYJOO7qKWZkGWkicbib5zKTw/640?wx_fmt=png)

#### 4. 设置`Custom domain`

返回到项目的`GitHub pages`设置页面，将我们购买的域名添加在`Custom domain`中，点击`save`，可以看到`pages`的地址变成了我们自己的域名，访问它就会看到你的网站了.![](https://mmbiz.qpic.cn/mmbiz_png/0knnia8k7kVfUn4n3OvZ52LE5YdFkribD5qXfPGIAOiaoRxedB8wfm0g0M1ZYeOouuZRia4C5l1pRqjUpibgRNicBAUA/640?wx_fmt=png)

### 五. 小结

`GitHub Actions`给我们提供了一站式的自动化部署体验，加上`Custom domain`的设置，完全可以用于搭建我们的个人博客，最重要的是这完全免费. 你也可以用它来部署其他框架的项目，当然这里的重点是的`yml`脚本的书写.

一些参考：

https://pages.github.com

https://github.com/features/actions

https://blog.csdn.net/formula10000/article/details/98946098