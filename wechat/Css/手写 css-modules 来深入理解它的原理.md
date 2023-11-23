> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/CX-LC014iZ4vpTko59Sf7A)

我们知道，浏览器里的 JS 之前没有模块的概念，都是通过不同的全局变量（命名空间）来隔离，后来出现了 AMD、CMD、CommonJS、ESM 等规范。

通过这些模块规范组织的 JS 代码经过编译打包之后，运行时依然会有模块级别的作用域隔离（通过函数作用域来实现的）。

组件就可以放在不同的模块中，来实现不同组件的 JS 的作用域隔离。

但是组件除了 JS 还有 CSS 呀，CSS 却一直没有模块隔离的规范。

**如何给 css 加上模块的功能呢？**

有的同学会说 CSS 不是有 @import 吗？

那个只是把不同的 CSS 文件合并到一起，并不会做不同 CSS 的隔离。

**CSS 的隔离主要有两类方案，一类是运行时的通过命名区分，一类是编译时的自动转换 CSS，添加上模块唯一标识。**

运行时的方案最典型的就是 BEM，它是通过 .block__element--modifier 这种命名规范来实现的样式隔离，不同的组件有不同的 blockName，只要按照这个规范来写 CSS，是能保证样式不冲突的。

但是这种方案毕竟不是强制的，还是有样式冲突的隐患。

编译时的方案有两种，一种是 scoped，一种是 css modules。

**scoped 是 vue-loader 支持的方案，它是通过编译的方式在元素上添加了 data-xxx 的属性，然后给 css 选择器加上 [data-xxx] 的属性选择器的方式实现 css 的样式隔离。**

比如：

```
<style scoped> .guang {     color: red; } </style>  <template>      <div class="guang">hi</div>  </template>
```

会被编译成：

```
<style> .guang[data-v-f3f3eg9] {     color: red; } </style> <template>     <div class="guang" data-v-f3f3eg9>hi</div> </template>
```

通过给 css 添加一个全局唯一的属性选择器来限制 css 只能在这个范围生效，也就是 scoped 的意思。

**css-modules 是 css-loader 支持的方案，在 vue、react 中都可以用，它是通过编译的方式修改选择器名字为全局唯一的方式来实现 css 的样式隔离。**

比如：

```
<style module> .guang {    color: red; } </style>  <template>    <p :class="$style.guang">hi</p>  </template>
```

会被编译成：

```
<style module>._1yZGjg0pYkMbaHPr4wT6P__1 {     color: red; } </style> <template>     <p class="_1yZGjg0pYkMbaHPr4wT6P__1">hi</p> </template>
```

和 scoped 方案的区别是 css-modules 修改的是选择器名字，而且因为名字是编译生成的，所以组件里是通过 style.xx 的方式来写选择器名。

两种方案都是通过编译实现的，但是开发者的使用感受还是不太一样的：

scoped 的方案是添加的 data-xxx 属性选择器，因为 data-xx 是编译时自动生成和添加的，开发者感受不到。

css-modules 的方案是修改 class、id 等选择器的名字，那组件里就要通过 styles.xx 的方式引用这些编译后的名字，开发者是能感受到的。但是也有好处，配合编辑器可以做到智能提示。

此外，除了 css 本身的运行时、编译时方案，还可以通过 JS 来组织 css，利用 JS 的作用域来实现 css 隔离，这种是 css-in-js 的方案。

比如这样：

```
import styled from 'styled-components';const Wrapper = styled.div`    font-size: 50px;    color: red;`;function Guang {    return (        <div>            <Wrapper>内部文件写法</Wrapper>        </div>    );}
```

这些方案中，css-modules 的编译时方案是用的最多的，vue、react 都可以用。

那它是怎么实现的呢？

打开 css-loader 的 package.json，你会发现依赖了 postcss（css 的编译工具，类似编译 js 的 babel）：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGjaUdzFbpy0wY9c2sAEu6HE6Dm9Pf0DqmeuMkXiaajMkMbrA1YicK6qg8sNDnCuIchxfeouiaJT0nYmw/640?wx_fmt=png)

其中这四个 postcss-modules 开头的插件就是实现 css-modules 的核心代码。

这四个插件里，实现作用域隔离的是 postcss-modules-scope，其他的插件不是最重要的，比如 postcss-modules-values 只是实现变量功能的。

所以说，我们只要能实现 postcss-modules-scope 插件，就能搞懂 css-modules 的实现原理了。

我们去看下 postcss-modules-scope 的 README，发现它实现了这样的转换：

```
:local(.continueButton) {  color: green;}
```

编译成

```
:export {  continueButton: __buttons_continueButton_djd347adcxz9;}.__buttons_continueButton_djd347adcxz9 {  color: green;}
```

用 :local 这样的伪元素选择器包裹的 css 会做选择器名字的编译，并且把编译前后的名字的映射关系放到 :export 这个选择器下。

再来个复杂点的案例：

```
.guang {    color: blue;}:local(.dong){    color: green;}:local(.dongdong){    color: green;}:local(.dongdongdong){    composes-with: dong;    composes: dongdong;    color: red;}@keyframes :local(guangguang) {    from {        width: 0;    }    to {        width: 100px;    }}
```

会被编译成：

```
.guang {    color: blue;}._input_css_amSA5i__dong{    color: green;}._input_css_amSA5i__dongdong{    color: green;}._input_css_amSA5i__dongdongdong{    color: red;}@keyframes _input_css_amSA5i__guangguang {    from {        width: 0;    }    to {        width: 100px;    }}:export {  dong: _input_css_amSA5i__dong;  dongdong: _input_css_amSA5i__dongdong;  dongdongdong: _input_css_amSA5i__dongdongdong _input_css_amSA5i__dong _input_css_amSA5i__dongdong;  guangguang: _input_css_amSA5i__guangguang;}
```

可以看到以 :local 包裹的才会被编译，不是 :local 包裹的会作为全局样式。

composes-with 和 composes 的作用相同，都是做样式的组合，可以看到编译之后会把 compose 的多个选择器合并到一起。也就是一对多的映射关系。

实现了 :local 的选择器名字的转换，实现了 compose 的样式组合，最后会把映射关系都放到 :export 这个样式下。

这样 css-loader 调用 postcss-modules-scope 完成了作用域的编译之后，不就能从 :export 拿到映射关系了么？

然后就可以用这个映射关系生成 js 模块，组件里就可以用 styles.xxx 的方式引入对应的 css 了。

这就是 css-modules 的实现原理。

那 css-modules 具体是怎么实现呢？

我们先来分析下思路：

实现思路分析
------

我们要做的事情就是两方面，一个是转换 :local 包裹的选择器名字，变成全局唯一的，二是把这个映射关系收集起来，放到 :export 样式里。

postcss 完成了从 css 到 AST 的 parse，和 AST 到目标代码和 soucemap 的 generate。我们在插件里只需要完成 AST 的转换就可以了。

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGjaUdzFbpy0wY9c2sAEu6HEATjbendJMlcascRdsvjQJKWjuSDFqw9UfB2DWIU5G7WwSkvZzvQD3g/640?wx_fmt=png)

转换选择器的名字就是遍历 AST，找到 :local 包裹的选择器，转换并且收集到一个对象里。并且要处理下   composes-with，也就是一对多的映射关系。

转换完成之后，映射关系也就有了，然后生成 :export 样式添加到 AST 上就可以了。

思路理清了，我们来写下代码吧：

代码实现
----

首先搭一个 postcss 插件的基本结构：

```
const plugin = (options = {}) => {    return {        postcssPlugin: "my-postcss-modules-scope",        Once(root, helpers) {        }    }}plugin.postcss = true;module.exports = plugin;
```

postcss 插件的形式是一个函数返回一个对象，函数接收插件的 options，返回的的对象里包含了 AST 的处理逻辑，可以指定对什么 AST 做什么处理。

这里的 Once 代表对 AST 根节点做处理，第一个参数是 AST，第二个参数是一些辅助方法，比如可以创建 AST。

postcss 的 AST 主要有三种：

*   **atrule**：以 @ 开头的规则，比如：
    

```
@media screen and (min-width: 480px) {    body {        background-color: lightgreen;    }}
```

*   **rule**：选择器开头的规则，比如：
    

```
ul li { padding: 5px;}
```

*   **decl**：具体的样式，比如：
    

```
padding: 5px;
```

这些可以通过 **astexplorer.net** 来可视化的查看

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGjaUdzFbpy0wY9c2sAEu6HEwBjyCXXEEOialwrgObEFLMLJPYwNS5Q5sQVBUxwmDQSuZGYamhdZWQw/640?wx_fmt=png)

转换选择器名字的实现大概这样的：

```
Once(root, helpers) {   const exports = {};   root.walkRules((rule) => {          rule.selector = 转换选择器名字();       rule.walkDecls(/composes|compose-with/i, (decl) => {           // 处理 compose       }   });      root.walkAtRules(/keyframes$/i, (atRule) => {       // 转换选择器名字   });   }
```

先遍历所有的 rule，转换选择器的名字，并把转换前后选择器名字的映射关系放到 exports 里。还要处理下 compose。

然后遍历 atrule，做同样的处理。

具体实现选择器的转换需要对 selector 也做一次 parse，用 postcss-selector-parser，然后遍历选择器的 AST 实现转换：

```
const selectorParser = require("postcss-selector-parser");root.walkRules((rule) => {    // parse 选择器为 AST    const parsedSelector = selectorParser().astSync(rule);    // 遍历选择器 AST 并实现转换    rule.selector = traverseNode(parsedSelector.clone()).toString();});
```

比如 .guang 选择器的 AST 是这样的：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGjaUdzFbpy0wY9c2sAEu6HEDcpQyD1Cz8eHjcF3c8MQ8R43Og6ib7Nwudr9SdMrJslqzeiaCHzjkzvA/640?wx_fmt=png)

选择器 AST 的根是 Root，它的 first 属性是 Selector 节点，然后再 first 属性就是 ClassName 了。

根据这样的结构，就需要分别对不同 AST 做不同处理：

```
function traverseNode(node) {    switch (node.type) {        case "root":        case "selector": {            node.each(traverseNode);            break;        }        case "id":        case "class":            exports[node.value] = [node.value];            break;        case "pseudo":            if (node.value === ":local") {                const selector = localizeNode(node.first, node.spaces);                node.replaceWith(selector);                return;            }    }    return node;}
```

如果是 root 或者 selector，那就继续递归处理，如果是 id、class，说明是全局样式，那就收集到 exports 里。

如果是伪元素选择器（pseudo），并且是 :local 包裹的，那就要做转换了，调用 localizeNode 实现选择器名字的转换，然后替换原来的选择器。

localizeNode 也要根据不同的类型做不同处理：

*   selector 节点就继续遍历子节点。
    
*   id、class 节点就做对名字做转换，然后生成新的选择器.
    

```
function localizeNode(node) {    switch (node.type) {        case "class":            return selectorParser.className({                value: exportScopedName(                    node.value,                    node.raws && node.raws.value ? node.raws.value : null                ),            });        case "id": {            return selectorParser.id({                value: exportScopedName(                    node.value,                    node.raws && node.raws.value ? node.raws.value : null                ),            });        }        case "selector":            node.nodes = node.map(localizeNode);            return node;    }}
```

这里调用了 exportScopedName 来修改选择器名字，然后分别生成了新的 className 和 id 节点。

exportScopedName 除了修改选择器名字之外，还要把修改前后选择器名字的映射关系收集到 exports 里：

```
function exportScopedName(name) {    const scopedName = generateScopedName(name);    exports[name] = exports[name] || [];    if (exports[name].indexOf(scopedName) < 0) {        exports[name].push(scopedName);    }    return scopedName;}
```

具体的名字生成逻辑我写的比较简单，就是加了一个随机字符串：

```
function generateScopedName(name) {    const randomStr = Math.random().toString(16).slice(2);    return `_${randomStr}__${name}`;};
```

这样，我们就完成了选择器名字的转换和收集。

然后再处理 compose：

compose 的逻辑也比较简单，本来 exports 是一对一的关系，比如：

```
{    aaa: 'xxxx_aaa',    bbb: 'yyyy_bbb',    ccc: 'zzzz_ccc'}
```

compose 就是把它变成了一对多：

```
{    aaa: ['xxx_aaa', 'yyy_bbb'],    bbbb: 'yyyy_bbb',    ccc: 'zzzz_ccc'}
```

也就是这样的：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGjaUdzFbpy0wY9c2sAEu6HE4MyykAfxtaLQRsXycrIc1fe6s0cHKGUF5jZIZZyCDGDSmIicFpXbPoA/640?wx_fmt=png)

所以 compose 的处理就是如果遇到同名的映射就放到一个数组里：

```
rule.walkDecls(/composes|compose-with/i, (decl) => {    // 因为选择器的 AST 是 Root-Selector-Xx 的结构，所以要做下转换    const localNames = parsedSelector.nodes.map((node) => {        return node.nodes[0].first.first.value;    })    const classes = decl.value.split(/\s+/);    classes.forEach((className) => {        const global = /^global\(([^)]+)\)$/.exec(className);        if (global) {            localNames.forEach((exportedName) => {                exports[exportedName].push(global[1]);            });        } else if (Object.prototype.hasOwnProperty.call(exports, className)) {            localNames.forEach((exportedName) => {                exports[className].forEach((item) => {                    exports[exportedName].push(item);                });            });        } else {            throw decl.error(                `referenced class name "${className}" in ${decl.prop} not found`            );        }    });    decl.remove();});
```

用 wakDecls 来遍历所有 composes 和 composes-with 的样式，对它的值做 exports 的合并。

首先，parsedSelector.nodes 是我们之前 parse 出的选择器的 AST，因为它是 Root、Selector、ClassName（或 Id 等）的三层结构，所以要先映射一下。这就是选择器原本的名字。

然后对 compose 的值做下 split，对每一个样式做下判断：

*   如果 compose 的是 global 样式，那就给每一个 exports[选择器原来的名字] 添加上当前 composes 的 global 选择器的映射
    
*   如果 compose 的是 local 的样式，那就从 exports 中找出它编译之后的名字，添加到当前的映射数组里。
    
*   如果 compose 的选择器没找到，就报错
    

最后还要用 decl.remove 把 composes 的样式删除，生成后的代码不需要这个样式。

这样，我们就完成了选择器的转换和 compose，以及收集。

用上面的案例测试一下这段逻辑：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGjaUdzFbpy0wY9c2sAEu6HEyibsRguc3LIwog36kXXrdnnIGfvzAD5qdHCFDgicvHYibplXLkepxbWdw/640?wx_fmt=png)

可以看到 选择器的转换和 compose 的映射都正常收集到了。

接下来继续处理 keyframes 的部分，这个和上面差不多，如果是 :local 包裹的选择器，就调用上面的方法做转换即可：

```
root.walkAtRules(/keyframes$/i, (atRule) => {    const localMatch = /^:local\((.*)\)$/.exec(atRule.params);    if (localMatch) {        atRule.params = exportScopedName(localMatch[1]);    }});
```

转换完成之后，接下来做第二步，把收集到的 exports 生成 AST 并添加到 css 原本的 AST 上。

这部分就是调用 helpers.rule 创建 rule 节点，遍历 exports，调用 append 方法添加样式即可。

```
const exportedNames = Object.keys(exports);if (exportedNames.length > 0) {    const exportRule = helpers.rule({ selector: ":export" });    exportedNames.forEach((exportedName) =>        exportRule.append({            prop: exportedName,            value: exports[exportedName].join(" "),            raws: { before: "\n  " },        })    );    root.append(exportRule);}
```

最后用 root.append 把这个 rule 的 AST 添加到根节点上。

这样就完成了 css-modules 的选择器转换和 compose 还有 export 的收集和生成的全部功能。

我们来测试一下：

测试
--

上面的代码实现细节还是比较多的，但是大概的思路应该能理清。

我们测试一下看看它的功能是否正常：

```
const postcss = require('postcss');const modulesScope = require("./src/index");const input = `.guang {    color: blue;}:local(.dong){    color: green;}:local(.dongdong){    color: green;}:local(.dongdongdong){    composes-with: dong;    composes: dongdong;    color: red;}@keyframes :local(guangguang) {    from {        width: 0;    }    to {        width: 100px;    }}@media (max-width: 520px) {    :local(.dong) {        color: blue;    }}`const pipeline = postcss([modulesScope]);const res = pipeline.process(input);console.log(res.css);
```

调用 postcss，传入插件组织好编译 pipeline，然后调用 process 方法，传入处理的 css，打印生成的 css：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGjaUdzFbpy0wY9c2sAEu6HE48fr2qJ2M0TH8GI0LMsicyliaB0KBIeC8EPgcQxjmsMEuQzSrUibG3FrQ/640?wx_fmt=png)

经测试，global 样式没有做转换，:local 样式做了选择器的转换，转换的映射关系放到了 :export 样式里，并且 compose 也确实实现了一对多的映射。

这样，我们就实现了 css-modules 的核心功能。

插件完整代码上传到了 github: https://github.com/QuarkGluonPlasma/postcss-plugin-exercize，也在这里贴一份：

```
const selectorParser = require("postcss-selector-parser");function generateScopedName(name) {    const randomStr = Math.random().toString(16).slice(2);    return `_${randomStr}__${name}`;};const plugin = (options = {}) => {    return {        postcssPlugin: "my-postcss-modules-scope",        Once(root, helpers) {            const exports = {};            function exportScopedName(name) {                const scopedName = generateScopedName(name);                exports[name] = exports[name] || [];                if (exports[name].indexOf(scopedName) < 0) {                    exports[name].push(scopedName);                }                return scopedName;            }            function localizeNode(node) {                switch (node.type) {                    case "selector":                        node.nodes = node.map(localizeNode);                        return node;                    case "class":                        return selectorParser.className({                            value: exportScopedName(                                node.value,                                node.raws && node.raws.value ? node.raws.value : null                            ),                        });                    case "id": {                        return selectorParser.id({                            value: exportScopedName(                                node.value,                                node.raws && node.raws.value ? node.raws.value : null                            ),                        });                    }                }            }            function traverseNode(node) {                switch (node.type) {                    case "root":                    case "selector": {                        node.each(traverseNode);                        break;                    }                    case "id":                    case "class":                        exports[node.value] = [node.value];                        break;                    case "pseudo":                        if (node.value === ":local") {                            const selector = localizeNode(node.first, node.spaces);                            node.replaceWith(selector);                            return;                        }                }                return node;            }            // 处理 :local 选择器            root.walkRules((rule) => {                const parsedSelector = selectorParser().astSync(rule);                rule.selector = traverseNode(parsedSelector.clone()).toString();                rule.walkDecls(/composes|compose-with/i, (decl) => {                    const localNames = parsedSelector.nodes.map((node) => {                        return node.nodes[0].first.first.value;                    })                    const classes = decl.value.split(/\s+/);                    classes.forEach((className) => {                        const global = /^global\(([^)]+)\)$/.exec(className);                        if (global) {                            localNames.forEach((exportedName) => {                                exports[exportedName].push(global[1]);                            });                        } else if (Object.prototype.hasOwnProperty.call(exports, className)) {                            localNames.forEach((exportedName) => {                                exports[className].forEach((item) => {                                    exports[exportedName].push(item);                                });                            });                        } else {                            throw decl.error(                                `referenced class name "${className}" in ${decl.prop} not found`                            );                        }                    });                    decl.remove();                });            });            // 处理 :local keyframes            root.walkAtRules(/keyframes$/i, (atRule) => {                const localMatch = /^:local\((.*)\)$/.exec(atRule.params);                if (localMatch) {                    atRule.params = exportScopedName(localMatch[1]);                }            });            // 生成 :export rule            const exportedNames = Object.keys(exports);            if (exportedNames.length > 0) {                const exportRule = helpers.rule({ selector: ":export" });                exportedNames.forEach((exportedName) =>                    exportRule.append({                        prop: exportedName,                        value: exports[exportedName].join(" "),                        raws: { before: "\n  " },                    })                );                root.append(exportRule);            }        },    };};plugin.postcss = true;module.exports = plugin;
```

总结
--

CSS 实现模块隔离主要有运行时和编译时两类方案：

*   运行时通过命名空间来区分，比如 BEM 规范。
    
*   编译时自动转换选择器名字，添加上唯一标识，比如 scoped 和 css-modules
    

scoped 是通过给元素添加 data-xxx 属性，然后在 css 中添加 [data-xx] 的属性选择器来实现的，对开发者来说是透明的。是 vue-loader 实现的，主要用在 vue 里。

css-modules 则是通过编译修改选择器名字为全局唯一的方式实现的，开发者需要用 styles.xx 的方式来引用编译后的名字，对开发者来说不透明，但是也有能配合编辑器实现智能提示的好处。是 css-loader 实现的，vue、react 都可用。

当然，其实还有第三类方案，就是通过 JS 来管理 css，也就是 css-in-js。

css-modules 的方案是用的最多的，我们看了它的实现原理：

css-loader 是通过 postcss 插件来实现 css-modules 的，其中最核心的是 postcss-modules-scope 插件。

我们自己写了一个 postcss-modules-scope 插件：

*   遍历所有选择器，对 :local 伪元素包裹的选择器做转化，并且收集到 exports 中。
    
*   对 composes 的选择器做一对多的映射，也收集到 exports 中。
    
*   根据 exports 收集到的映射关系生成 :exports 样式
    

这就是 css-modules 的作用域隔离的实现原理。

文中代码部分细节比较多，可以把代码下载下来跑一下，相信如果你能自己实现 css-modules 的核心编译功能，那一定是彻底理解了 css-modules 了。