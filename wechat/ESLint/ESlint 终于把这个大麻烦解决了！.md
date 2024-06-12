> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/zzLp3bzZrQQxGjOFXiSP7g)

ESLint 将在 11 月 3 日发布的 v8.53.0 版本中**弃用代码风格规则**，也就是那些强制执行关于空格、分号、字符串格式等的代码约定的规则。这样，同时使用 ESlint 和 Prettier 时就不会出现冲突问题了！  

ESlint 是一个代码检测工具，其可以进行代码质量和代码风格的静态分析，捕获潜在错误和不一致的编码习惯。而 Prettier 是一个代码格式化工具，其可以对代码进行格式化，确保整个项目中的代码风格保持一致。对于代码中的一些问题，ESlint 可能无法正确格式化，这时候 Prettier 就可以很好地完成格式化的任务。因此，我们通常会组合使用 ESlint 和 Prettier，来保证代码质量和风格统一（ ESlint 负责检测代码质量，Prettier 负责格式化代码）。

但是两者都有格式化代码风格的规则，ESlint 将代码进行格式化后，会重新被 Prettier 再次格式化。因此最终的格式化效果是 Prettier 提供的。而代码校验使用的是 ESLint，因此可能会出现冲突。**ESlint 弃用代码风格规则后就可以专注于监测代码质量，而 Prettier 专注于监测代码风格。**

**背景**
------

ESLint 于 2013 年发布，当时关于是否应该将源代码格式化作为代码规范工具的一部分是存在争议的。JSLint 是最早出现的 JavaScript 代码规范工具，将其作者的代码格式化偏好编码到了该工具中，这些偏好在 JSLint 的继任者 JSHint 中有所保留。2013 年，JSHint 宣布他们将废除与代码风格相关的选项，并计划在下一个主要版本中删除它们。尽管这些选项从未被实际删除，但 JSHint 仍然给出了此警告，提醒用户该选项已被弃用：

```
Warning This option has been deprecated and will be removed in the next major release of JSHint。// 警告：此选项已被弃用，并将在 JSHint 的下一个主要版本中删除。JSHint is limiting its scope to issues of code correctness. If you would like to enforce rules relating to code style, check out the JSCS project.// JSHint 将其范围限制在代码正确性问题上。如果你想强制执行与代码风格相关的规则，请查看 JSCS 项目。
```

JSCS 项目的诞生就是为了满足 JavaScript 开发人员对**代码格式设置**的日益具体化的需求。与 ESLint 同时出现的 JSCS 在早期曾经历了一段试验期，人们尝试着使用不同组合的 JSHint、JSCS 和 ESLint 来满足他们的格式化需求。

起初，ESLint 要想与 JSHint 合理竞争，就必须确保 ESLint 具备所有 JSHint 规则的等效功能。尽管 ESLint 的优势在于自定义规则，但如果每个人都需要重新创建 JSHint 规则，ESLint 就可能无法得到广泛采用。因此，最初的计划是提供几十个核心规则，将其余规则作为插件实现。

随着时间的推移，ESLint 收到越来越多的请求，希望将格式和风格规则纳入核心功能。许多请求都提到，他们不想使用两个工具（ESLint 和 JSCS）来处理代码，如果 ESLint 能够实现 JSCS 的所有功能，他们可以放弃 JSCS，只使用 ESLint。因此，ESLint 团队专注于实现功能的平衡，以满足这种需求。最终，取得了巨大成功，JSCS 的使用量下降，并将其合并到了 ESLint 中。

当时，ESlint 团队并没有意识到 JSHint 的想法（弃用代码风格规则）是正确的，尽管 ESLint 已经成为 JavaScript 的主导代码规范工具。

**JavaScript 的爆炸式增长和维护负担**
--------------------------

在接下来的几年里，尤其是在 ECMAScript 6 和 React 发展的推动下，编写 JavaScript 的方式发生了巨大的变化。Airbnb 和 Standard 等越来越流行的风格指南鼓励 JavaScript 开发人员更具体地了解他们的代码是如何编写的。因此，ESLint 收到了大量关于格式化规则的例外和选项的请求。在过去的十年中，出现了各种奇怪的代码风格，并伴随着对将它们强制应用于 ESLint 核心规则的请求。每当引入新的语法时，ESlint 团队都会收到一系列请求，要求更新现有规则并实施新规则。

当 ESlint 的核心规则接近 300 条时，ESlint 团队试图通过冻结风格规则来减轻维护负担，这样就不再追踪极端情况来支持每个人的个人偏好。这在一定程度上有所帮助，但还不够：

*   **规则冲突**：用户期望核心规则能够很好地配合，这意味着任何两个规则都不应标记相同的问题，任何两个核心规则也不应该给出相互冲突的建议。虽然当核心规则少于 30 条时，这很容易实现，但当规则超过 300 条时，实现这一点就变得很困难，甚至不可能。
    
*   **不切实际的期望**：有了大量的核心格式规则，用户希望可以仅通过核心规则而不涉及插件就能实现所有可能的代码风格指南。这给团队增加了更多压力，要求不断添加选项，这也增加了核心的大小。
    
*   **努力与价值不匹配**：持续添加新选项和例外以支持所有人的代码风格指南的维护负担落在了 ESLint 团队身上，而价值只被少数用户获得。
    
*   **缺乏兴趣**：虽然 ESLint 受益于外部贡献，但这些贡献者对一些边缘情况并不感兴趣。ESLint 团队将这些规则的优先级设得比其他工作低得多，这经常导致问题长期未被解决。
    
*   **一致性问题**：由于 ESLint 的规则被设计为原子性规则，没有访问其他规则的能力，因此会遇到无法正确修复错误的问题，因为所需信息在另一个规则中。例如，如果自动修复需要添加一行新代码，它需要知道文件的缩进方式才能应用正确的修复方法。然而，缩进规则控制 ESLint 的缩进，这意味着其他规则需要在没有缩进的情况下应用修复，然后相信缩进规则会在后续的处理中修复缩进问题。
    

所有这些问题随着 ESLint 的发展而不断增加，现在 ESlint 终究是到了一个无法跟上这些问题的地步。

**解决方案**
--------

推荐使用源代码格式化工具而不是 ESLint 来对代码进行格式化。源代码格式化程序旨在理解整个文件并在整个文件中应用一致的格式。推荐以下两个格式化工具：

*   Prettier：基于 JavaScript 的格式化程序，支持格式化多种语言；
    
*   dprint：基于 Rust 的格式化程序，支持较少的语言。
    

如果不想用专门的格式化工具，可以使用 @stylistic/eslint-plugin-js（针对 JavaScript）或 @stylistic/eslint-plugin-ts（针对 TypeScript）。这些包分别包含 ESLint 核心和 typescript-eslint 中的被弃用的格式化规则，这些规则会继续维护。

**已弃用的规则**
----------

以下列表包含 v8.53.0 中将弃用的所有规则：

*   array-bracket-newline
    
*   array-bracket-spacing
    
*   array-element-newline
    
*   arrow-parens
    
*   arrow-spacing
    
*   block-spacing
    
*   brace-style
    
*   comma-dangle
    
*   comma-spacing
    
*   comma-style
    
*   computed-property-spacing
    
*   dot-location
    
*   eol-last
    
*   func-call-spacing
    
*   function-call-argument-newline
    
*   function-paren-newline
    
*   generator-star-spacing
    
*   implicit-arrow-linebreak
    
*   indent
    
*   jsx-quotes
    
*   key-spacing
    
*   keyword-spacing
    
*   linebreak-style
    
*   lines-between-class-members
    
*   lines-around-comment
    
*   max-len
    
*   max-statements-per-line
    
*   multiline-ternary
    
*   new-parens
    
*   newline-per-chained-call
    
*   no-confusing-arrow
    
*   no-extra-parens
    
*   no-extra-semi
    
*   no-floating-decimal
    
*   no-mixed-operators
    
*   no-mixed-spaces-and-tabs
    
*   no-multi-spaces
    
*   no-multiple-empty-lines
    
*   no-tabs
    
*   no-trailing-spaces
    
*   no-whitespace-before-property
    
*   nonblock-statement-body-position
    
*   object-curly-newline
    
*   object-curly-spacing
    
*   object-property-newline
    
*   one-var-declaration-per-line
    
*   operator-linebreak
    
*   padded-blocks
    
*   padding-line-between-statements
    
*   quote-props
    
*   quotes
    
*   rest-spread-spacing
    
*   semi
    
*   semi-spacing
    
*   semi-style
    
*   space-before-blocks
    
*   space-before-function-paren
    
*   space-in-parens
    
*   space-infix-ops
    
*   space-unary-ops
    
*   spaced-comment
    
*   switch-colon-spacing
    
*   template-curly-spacing
    
*   template-tag-spacing
    
*   wrap-iife
    
*   wrap-regex
    
*   yield-star-spacing
    

这些规则将在下一个版本中被弃用，但在至少 ESLint v10.0.0 之前不会被移除。仍然可以使用它们，但在 ESLint CLI 中可能会看到看用警告。

> 参考：https://eslint.org/blog/2023/10/deprecating-formatting-rules/