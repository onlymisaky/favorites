> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/TGq2d5KEZqoJ3Sg2-_AvQw)

ESLint 社区在 4 月 5 日迎来了一个里程碑式的更新，正式发布了 v9.0.0 版本。这一版本包含了许多重要的变化和改进，为 JavaScript 代码的静态分析带来了新的功能和更强的灵活性。以下是此次更新的主要内容：  

安装升级
----

现有的 ESLint 用户可以通过以下命令将 ESLint 升级到最新版本：

```
npm i eslint@9.0.0 --save-dev<br style="visibility: visible;">
```

迁移指南
----

由于此次更新涉及大量更改，ESLint 团队提供了一份详细的迁移指南 [1]，以帮助用户平滑过渡到新版本。

Node.js 版本支持
------------

随着 Node.js v20.x 成为新的长期支持（LTS）版本，ESLint v9.0.0 决定不再支持 v18.18.0 以及 v19.x 之前的 Node.js 版本。

默认配置格式变更
--------

ESLint 的默认配置格式已从 `.eslintrc` 变更为扁平化的配置文件（Flat config），`.eslintrc` 配置文件已正式弃用。

格式化程序的移除
--------

一些格式化程序，包括 `checkstyle`、`compact`、`jslint-xml`、`junit`、`tap`、`unix`、`visualstudio` 等，已被移除。用户需要通过独立安装相应的包来继续使用这些格式化程序。

规则的更新与新增
--------

*   移除了 `valid-jsdoc` 和 `require-jsdoc` 规则，推荐使用 `eslint-plugin-jsdoc` 插件替代。
    
*   `eslint:recommended` 配置已更新，引入了新的重要规则，并移除了一些已弃用或不太重要的规则。
    
*   新增了 `no-useless-assignment` 规则，用于检测无用的变量赋值操作。
    

全新 API
------

在主入口点新增了 `loadESLint()` 函数，它允许用户获取 ESLint 类（即以前的 FlatESLint 类）或 LegacyESLint 类（即以前的 ESLint 类），以在扁平配置和 eslintrc API 之间进行切换。

作用域分析的改进
--------

更新了 `eslint-scope` 的行为，修复了一些长期存在的问题，提供了更好的作用域分析。

现有规则的更新
-------

*   `complexity` 规则现在包括了可选链、解构模式以及参数中的默认值，以提供更全面的代码复杂度评估。
    
*   `no-fallthrough` 规则新增了 `reportUnusedFallthroughComment` 选项。
    
*   `no-inner-declarations` 规则的默认行为已更新，现在默认不再对块内函数声明发出警告。
    
*   `no-misleading-character-class` 规则改进了问题标识，现在将仅高亮显示正则表达式中有问题的字符。
    
*   `no-restricted-imports` 规则在路径处理上进行了调整，现在允许为不同的导入名称指定不同的错误消息，并新增了 `allowImportNames` 和 `allowImportNamePattern` 选项。
    
*   `no-unused-vars` 规则对 `varsIgnorePattern` 选项的使用范围进行了调整，新增了 `ignoreClassWithStaticInitBlock` 选项，以忽略具有静态初始化块的类中的未使用变量。
    
*   `no-useless-computed-key` 规则将 `enforceForClassMembers` 选项的默认值从 `false` 更改为 `true`，以减少重构过程中可能产生的误导性注释。
    

引入配置检查器
-------

ESLint 引入了一个可视化工具——配置检查器，帮助用户理解和检查 ESLint 配置文件。

更新详情
----

欲了解更多关于 ESLint v9.0.0 的更新详情，可以访问官方博客文章：ESLint v9.0.0 Released[2]。

参考资料

[1]

迁移指南: _https://eslint.org/docs/latest/use/migrate-to-9.0.0_

[2]

ESLint v9.0.0 Released: _https://eslint.org/blog/2024/04/eslint-v9.0.0-released/_