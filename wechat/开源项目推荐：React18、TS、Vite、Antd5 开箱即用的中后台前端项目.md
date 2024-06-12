> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/ep7Dj_2PqXfo-_-wpDNirQ)

```
大厂技术  高级前端  Node进阶

点击上方 程序员成长指北，关注公众号

回复1，加入高级Node交流群

```

近期发现很多小伙伴的简历难以区别于其他人，项目比较单一。

*   比如有小伙伴没接触过小程序开发、脚手架开发、图片编辑器、数据大屏等开发。
    
*   我一般都是建议多找找一些开源项目，学习掌握透彻后，也可以参与贡献代码，可以写到简历上（如果公司想招有类似项目经验的就会加分）。
    
*   github 上有很多开源项目，平时多积累学习，真正需要时，不至于束手无措。
    
*   后续也会多推荐一些实用的开源项目，拓宽大家的视野。
    

* * *

github: https://github.com/southliu/react-admin  
技术栈：react18 + ts + antd5 + vite 等等 在线体验：https://southliu.github.io  
我大致看了一下源码，相对简单些，有很多值得学习的。  
以下是该项目的 README 介绍。

* * *

  

South Admin
===========

![](https://mmbiz.qpic.cn/mmbiz_svg/USH8Nb3Hz5TUVa7UrnhmArEZOoopy0KAatzMjOvKk4hCP0COnbzO4VwQMw7TPiaViaO879joHELiaEX9wnx6v9hvxxJfZMPrdTz/640?wx_fmt=svg&from=appmsg) ![](https://mmbiz.qpic.cn/mmbiz_svg/USH8Nb3Hz5TUVa7UrnhmArEZOoopy0KAB35ic6SQLXh5vUW50T3utMDGEwzmWuz6U577sK6ey7GZfdsxeDK5ZxbjDXfjV5xLc/640?wx_fmt=svg&from=appmsg)

✨ 简介
----

使用`React18`,`Typescript`,`Vite`,`Antd5.0`等主流技术开发的开箱即用的中后台前端项目，`Vite`实现自动生成路由，支持`KeepAlive`功能，`react-redux`状态管理，支持虚拟滚动表格，`UnoCss`开发样式。

🚀 项目演示
-------

演示地址 [1]

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Mpt86EGjlpskdA5BF4YmI0FzKFHHFBxRfNGXItR2nqqib0vvj1MeY7kjSxpLGxbh5bGKiaJK6Udjf75jahUks72A/640?wx_fmt=png&from=appmsg)

💻 安装使用
-------

*   获取项目代码
    

```
git clone https://github.com/southliu/react-admin.git


```

*   选择目录
    

```
cd react-admin


```

*   安装全局依赖依赖，存在则不用安装
    

```
npm i -g pnpm


```

*   安装依赖
    

```
pnpm install


```

##### 如果使用 pnpm 安装依赖出现安装失败问题，请使用梯子或 yarn 安装。

*   运行
    

```
pnpm dev


```

*   打包
    

```
pnpm build


```

🧩 图标 (iconify)
---------------

*   参考 iconify 官方地址 [2]
    
*   VS Code 安装 Iconify IntelliSense - 图标内联显示和自动补全
    

🎗️ Git 提交示例
------------

### Git 提交不规范会导致无法提交，`feat`关键字可以按照下面`Git 贡献提交规范`来替换。

```
git add .
git commit -m "feat: 新增功能"
git push


```

### 按照以上规范依旧无法提交代码，请在终端执行`npx husky install`之后重新提交。

🎯 Git 贡献提交规范
-------------

*   参考 vue[3] 规范
    

*   `feat` 增加新功能
    
*   `fix` 修复问题 / BUG
    
*   `style` 代码风格相关无影响运行结果的
    
*   `perf` 优化 / 性能提升
    
*   `refactor` 重构
    
*   `revert` 撤销修改
    
*   `test` 测试相关
    
*   `docs` 文档 / 注释
    
*   `chore` 依赖更新 / 脚手架配置修改等
    
*   `workflow` 工作流改进
    
*   `ci` 持续集成
    
*   `types` 类型定义文件更改
    
*   `wip` 开发中
    

🎈 路由
-----

路由根据文件夹路径自动生成，路径包含以下文件名或文件夹名称则不生成：

*   components
    
*   utils
    
*   lib
    
*   hooks
    
*   model.tsx
    
*   404.tsx
    

可自行在 src/router/utils/config.ts 修改路由生成规则。

🐵 关于封装
-------

1.  功能扩展，在原有的 api 上拓展。
    
2.  功能整合，合并两个或两个以上组件的 api。
    
3.  样式统一，避免后期样式变动，导致牵一发而动全身。
    
4.  公共组件二次封装或常用组件使用 **Basic** 开头，便于区分。  
    

参考资料

[1]

演示地址: _https://southliu.github.io/_

[2]

iconify 官方地址: _https://icon-sets.iconify.design/_

[3]

vue: _https://github.com/vuejs/vue/blob/dev/.github/COMMIT_CONVENTION.md  
_

  

Node 社群

```
我组建了一个氛围特别好的 Node.js 社群，里面有很多 Node.js小伙伴，如果你对Node.js学习感兴趣的话（后续有计划也可以），我们可以一起进行Node.js相关的交流、学习、共建。下方加 考拉 好友回复「Node」即可。

   “分享、点赞、在看” 支持一下

```