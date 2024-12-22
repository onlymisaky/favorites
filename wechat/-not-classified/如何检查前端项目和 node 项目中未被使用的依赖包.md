> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/y1f4TjRQ74Kax0aCae6lpA)

```
大厂技术  高级前端  Node进阶

点击上方 程序员成长指北，关注公众号

回复1，加入高级Node交流群

```

> 作者：Moment
> 
> 原文：https://juejin.cn/post/7355779183148318747

随着前端项目中使用的依赖包越来越多，而其中一部分依赖包可能并未被项目所使用，手动查找这些依赖包既耗时又繁琐。未使用的依赖包会增加项目的大小，这可能会导致下载和安装你的应用所需的时间更长。并且在构建项目时，构建工具需要处理所有的依赖包。未使用的依赖包可能会不必要地增加构建时间，特别是在大型项目中。

编写脚本来识别未使用的依赖包
--------------

Depcheck 是一款用于分析项目中依赖关系的工具，它可以帮助我们找出以下问题：在 package.json 中，每个依赖包如何被使用、哪些依赖包没有用处、哪些依赖包缺失。它是解决前端项目中依赖包清理问题的一个常用工具。

接下来的内容中，我们不是使用这个库，而是自己编写一个脚本来实现我们想要的功能。它主要的步骤被划分为

1.  读取根目录下的 package.json 文件。
    
2.  递归遍历目录获取所有文件路径，并且跳过 excludeDirs 中指定的目录。
    
3.  检查依赖是否在文件中被引用，并找到未使用的依赖。
    
4.  执行检查并报告结果。
    

最终代码如下所示：

```
const fs = require("fs");
const path = require("path");

const projectDir = path.resolve("."); // 当前项目目录
const excludeDirs = ["node_modules", ".git"]; // 应该排除的目录

// 读取并解析package.json
function readPackageJson() {
  const packageJsonPath = path.join(projectDir, "package.json");
  if (!fs.existsSync(packageJsonPath)) {
    console.error("package.json not found.");
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
}

// 递归遍历目录获取所有文件路径
function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function (file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      if (!excludeDirs.includes(file)) {
        arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
      }
    } else {
      arrayOfFiles.push(path.join(dirPath, "/", file));
    }
  });

  return arrayOfFiles;
}

// 检查依赖是否在文件中被引用，包括动态引用
function isDependencyUsed(files, dependency) {
  const regexStaticImport = new RegExp(
    `require\\(['"\`]${dependency}['"\`]|from ['"\`]${dependency}['"\`]`,
    "i"
  );
  const regexDynamicImport = new RegExp(
    `import\\(['"\`]${dependency}['"\`]\\)`,
    "i"
  );
  return files.some((file) => {
    const fileContent = fs.readFileSync(file, "utf8");
    return (
      regexStaticImport.test(fileContent) ||
      regexDynamicImport.test(fileContent)
    );
  });
}

function findUnusedDependencies() {
  const { dependencies } = readPackageJson();
  const allFiles = getAllFiles(projectDir);
  const unusedDependencies = [];

  Object.keys(dependencies).forEach((dependency) => {
    if (!isDependencyUsed(allFiles, dependency)) {
      unusedDependencies.push(dependency);
    }
  });

  return unusedDependencies;
}

const unusedDependencies = findUnusedDependencies();
if (unusedDependencies.length > 0) {
  console.log("未使用的依赖:", unusedDependencies.join(", "));
} else {
  console.log("所有依赖都已使用。");
}


```

运行上面的代码我们可以获取到哪些依赖包是没有被使用到的。

在上面的两个正则中，它的作用如下：

1.  require 语句的使用，例如：require('dependency')。
    
2.  ES6 模块导入语句中 from 后面的部分，例如：import something from 'dependency'。
    
3.  匹配动态 import() 语法的使用，例如：import('dependency')。
    

这两个正则表达式的目的是为了在文件中找到对指定依赖的引用，无论这些引用是静态的还是动态的。

接下来我们执行一下代码，最终输出结果如下图所示：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/YBFV3Da0NwtYS6Ioao98Oq1Mla7pUwN3ialJhZrMEYG6M0xnpib553quGEvrmz0TmCwT7ThnrtYOia80kjGV5a4zA/640?wx_fmt=other&from=appmsg)20240406182028

这里我们可以查看到哪些内容是没有被使用到的，紧接着，我们可以再添加一行代码进行测试：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/YBFV3Da0NwtYS6Ioao98Oq1Mla7pUwN3pBqUwTWdJUNGOUukvibkEWiajrlQ8HQWLhgT7OgQY6RG3odf64J7EM0g/640?wx_fmt=other&from=appmsg)20240406182240

你可以看到，当我们添加了一个动态包导入之后，`@fastify/static` 被从未使用的依赖中移除掉了。

总结
--

我们可以对我们的项目来进行检测，然后删除一些并没有使用过的包，可以增加项目依赖包的安装速度。

最后分享两个我的两个开源项目, 它们分别是:

*   前端脚手架 create-neat[1]
    
*   在线代码协同编辑器 [2]
    

这两个项目都会一直维护的，如果你想参与或者交流学习，可以加我微信 yunmz777 如果你也喜欢, 欢迎 star 🚗🚗🚗

参考资料

[1]

https://github.com/xun082/create-neat: _https://github.com/xun082/create-neat_

[2]

https://github.com/xun082/online-edit: _https://github.com/xun082/online-edit_

```
Node 社群




我组建了一个氛围特别好的 Node.js 社群，里面有很多 Node.js小伙伴，如果你对Node.js学习感兴趣的话（后续有计划也可以），我们可以一起进行Node.js相关的交流、学习、共建。下方加 考拉 好友回复「Node」即可。

   “分享、点赞、在看” 支持一波👍

```