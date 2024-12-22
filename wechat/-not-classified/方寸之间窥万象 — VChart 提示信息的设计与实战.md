> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/a5LBvy90wjKnwnXOtjabPA)

序言
--

提示信息（tooltip）是一种常见的 GUI 元素。在可视化领域，tooltip 通常指用户将鼠标悬停在图元上或者图表区域时弹出的明细数据信息框。如果是桌面环境，通常会在用户将指针悬停在元素上而不单击它时显示 tooltip；如果是移动环境，通常会在长按（即点击并按住）元素时显示 tooltip。

这样一个小小的组件，却可以十分有效地丰富图表的数据展现能力和图表交互效果，同时在实际业务领域的用途也非常广泛。

近些年来，业界主要图表库（如 ECharts、G2 等）都提供了 tooltip 的配置能力和默认渲染能力，以达到开箱即用的效果。VChart 更不例外，提供了更加灵活的 tooltip 展示与配置方案。

通过使用 VChart，你既可以显示图表中任何系列的图元所携带的数据信息（mark tooltip）：

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z9Yz66K88Erwspywca5bP8PzQndXxUqhdVsT5mzVLN8XyfsJCgGOgE91BpybOYzoL8RbmOMiboIibSw/640?wx_fmt=png&from=appmsg)

也可以显示某个特定维度项下的所有图元的数据信息（dimension tooltip）：

![](https://mmbiz.qpic.cn/mmbiz_gif/lP9iauFI73z9Yz66K88Erwspywca5bP8PbAMKuT58by4pHJxYJIHQZQ9ZA9Pzsm9xIAqerI5oicjVfxF1JGjK4uA/640?wx_fmt=gif&from=appmsg)

乃至可以灵活地自定义 tooltip，甚至在其中插入子图表，拓展交互的边界：

![](https://mmbiz.qpic.cn/mmbiz_gif/lP9iauFI73z9Yz66K88Erwspywca5bP8Pw6br3JdPwics1xVibh0kekdaGTUJIPicK2NN7GLQI3N6o2GMHZlQYiboJQ/640?wx_fmt=gif&from=appmsg)

本文将通过一些实战案例，详细讲述 VChart 提示信息的重点用法、自定义方式以及设计细节。

示例一：可触及的 tooltip，与 Amazon 的安全三角形
--------------------------------

为了不对用户的鼠标交互进行干扰，VChart 的 tooltip 默认不会响应鼠标事件。但是在某些情况，用户却希望鼠标可以移到 tooltip 中进行一些额外的交互行为，比如点击 tooltip 中的按钮和链接，或者选取并复制一些数据。

为了满足这类需求，tooltip 支持在 spec 中配置 `enterable` 属性。如果不配置或者配置 `enterable: false`，默认效果是这样的，鼠标无法移到 tooltip 元素内：

![](https://mmbiz.qpic.cn/mmbiz_gif/lP9iauFI73z9Yz66K88Erwspywca5bP8PzPcUFE2xUviaqt9k7Xc1ypTL5mhKFeVokDljVc085eYhF6gyzFMpItA/640?wx_fmt=gif&from=appmsg)

而如果配置 `enterable: true`，效果如以下截图所示：

![](https://mmbiz.qpic.cn/mmbiz_gif/lP9iauFI73z9Yz66K88Erwspywca5bP8P63uGRnkFAAhSqzVKrFedWZsFVCcul5Iv1vNUtnIKrjavhpKichO3EkA/640?wx_fmt=gif&from=appmsg)

图表简化版 spec 为：

```
const spec = {  type: 'waterfall',  data: [], // 数据略  legends: { visible: true, orient: 'bottom' },  xField: 'x',  yField: 'y',  seriesField: 'type',  total: {    type: 'field',    tagField: 'total'  },  title: {    visible: true,    text: 'Chinese quarterly GDP in 2022'  },  tooltip: {    enterable: true // TOOLTIP SPEC  }};const vchart = new VChart(spec, { dom: CONTAINER_ID });vchart.renderSync();
```

简单对比两个 tooltip 的效果，可以发现后者在鼠标靠近 tooltip 时，tooltip 便适时地停住了。

这个小小的交互细节里却有些文章，灵感来源直接来自 Amazon 的官网实现。

这个例子也许已经为人熟知，我们简单回顾一下。这首先要从普通网站的下拉菜单开始讲起：

![](https://mmbiz.qpic.cn/mmbiz_gif/lP9iauFI73z9Yz66K88Erwspywca5bP8PdPlhYZibJGmicTOdRBbQlOOvSAds48iaQJgBuZvvgP44GJ29Ys2RgnyMw/640?wx_fmt=gif&from=appmsg)

在一个设计欠佳的菜单组件里（如 bootstrap），鼠标从一级菜单移入二级菜单往往是很困难的，很容易触发二级菜单的隐藏策略，从而变成一场无聊的打地鼠游戏。

但是 Amazon 早期官网的菜单，由于用户使用频率高，根本无法接受这样的体验。于是他们完美地解决了这个问题，并成为一个交互优化的经典案例。

其思路的核心，便是检测鼠标移动的方向。如果鼠标移动到下图的蓝色三角形中，当前显示的子菜单将继续打开一小会儿：

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z9Yz66K88Erwspywca5bP8PjnMbOfdTeAn7X4iaVM5FzbiaTCibEwUpWo4UokibcJRyc9Gf2mAGsibOGEw/640?wx_fmt=png&from=appmsg)

在鼠标的每个位置，你可以想象鼠标当前位置与下拉菜单的右上角和右下角之间形成一个三角形。如果下一个鼠标位置在该三角形中，说明用户可能正在将鼠标移向当前显示的子菜单。Amazon 利用这一点实现了很好的效果。只要鼠标停留在该蓝色三角形中，当前子菜单就会保持打开。如果鼠标移出该三角形，他们会立即切换子菜单，使其感觉非常敏捷。

整体效果类似于下图所示：

![](https://mmbiz.qpic.cn/mmbiz_gif/lP9iauFI73z9Yz66K88Erwspywca5bP8PEAYlibdicY1E1sd247UAn8Q3ibSUEvwZbHXh0wXJiaK4mpjQ2rZ8rNRroQ/640?wx_fmt=gif&from=appmsg)

正所谓，上帝在细节中（God is in the details）。从这个交互优化里，我们看到的不仅是一个精妙的算法，而是一个科技巨头对于产品和用户体验的态度。Amazon 的数百亿市值有多少是从这些很小很小，但是明显很用心的产品细节中积累起来的呢？

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z9Yz66K88Erwspywca5bP8PDialicMia2TUNsFJL77xErZL1eHrhtibsolRf4d8CvHdKfMXC7DJ7gaHpA/640?wx_fmt=png&from=appmsg)

VChart 的 tooltip 也一样，着重参考了 Amazon 的交互优化。如果配置 `enterable: true`，在每个时刻，都会存在一个这样的 “安全三角形”，三个顶点分别是鼠标光标以及 tooltip 的两个端点，取面积最大的三角形：

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z9Yz66K88Erwspywca5bP8PQPUFvLjrLDrEAG5PA9ia8XrVatXgqjwB67Um331KdSq3QNWQ1N2l1mw/640?wx_fmt=png&from=appmsg)

如果鼠标在下一刻滑到这个三角形区域中， tooltip 便为鼠标 “停留一会儿”，直到鼠标移到 tooltip 区域内。

![](https://mmbiz.qpic.cn/mmbiz_gif/lP9iauFI73z9Yz66K88Erwspywca5bP8P63uGRnkFAAhSqzVKrFedWZsFVCcul5Iv1vNUtnIKrjavhpKichO3EkA/640?wx_fmt=gif&from=appmsg)

但是在鼠标移到 tooltip 区域之前，tooltip 并不会永远停下来等待鼠标。如果鼠标过于缓慢地靠近 tooltip，tooltip 还是会离开的（变成一场失败、却又在意料之中的奔赴）。这样便可以同时保证用户鼠标有足够的行动自由度。以下示例特地将鼠标移动速度放慢，便可以实现既进入三角形区域，又不会被 tooltip “挡路”：

![](https://mmbiz.qpic.cn/mmbiz_gif/lP9iauFI73z9Yz66K88Erwspywca5bP8PcYJ7XXDskRc0JPekicsVnnQ9qygg0nu7bJCAeZELcpymEGBTgoiasiclQ/640?wx_fmt=gif&from=appmsg)

作为对比，ECharts 的 tooltip 虽然同样支持 `enterable` 属性，但是 ECharts 主要通过简单的 tooltip 缓动来支持鼠标移入，鼠标仍需要不停地 “追逐” tooltip 才能移至其中，灵活性便打了折扣。以下为 ECharts 的效果：

![](https://mmbiz.qpic.cn/mmbiz_gif/lP9iauFI73z9Yz66K88Erwspywca5bP8Piclocibo2m3XU3ZqFtWr6jdNBPrce8OOA96qzffGcMTYSI48MlsvrCRA/640?wx_fmt=gif&from=appmsg)

示例二：灵活的 pattern，内容与样式的自由配置
--------------------------

为了尽最大可能满足更多业务方的需求，VChart 的 tooltip 支持比较灵活的内容和样式配置。下文将以官网 demo（https://www.visactor.io/vchart/demo/tooltip/custom-tooltip）为例进行详细介绍。

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z9Yz66K88Erwspywca5bP8PnfdFnXyunr5S43XC7cnaqKue4nmhkUEtpu9OkdDULPK46hpDGLxTjQ/640?wx_fmt=png&from=appmsg)

在这个图表中，用户配置了一条 `y=10000` 的标注线。同时要求在 dimension tooltip 中实现：

*   数据项从大到小排序；
    
*   比标注线高的数据项标红（条件格式）；
    
*   在 tooltip 内容的最后一行加上标注线所代表的数据。
    

同时，这个 tooltip 的位置还拥有以下特征：

*   dimension tooltip 的位置固定在光标上方；
    
*   mark tooltip 的位置固定在数据项下方。
    

如以下动图所示：

![](https://mmbiz.qpic.cn/mmbiz_gif/lP9iauFI73z9Yz66K88Erwspywca5bP8PMF3m0TjJGhTqiaLUrKXPmX6kYdvMSjg8pFicrx83ficLqxEX6LDbHEb0w/640?wx_fmt=gif&from=appmsg)

这个示例实际上代表了很多不同类型的业务需求。下面拆解来看一下：

### 基本 tooltip 内容配置

首先，剥去自定义内容和样式的部分，这个图表的最简 spec 和基本 tooltip 配置如下：

```
const markLineValue = 10000;const spec = {  type: 'line',  data: {    values: [      { type: 'Nail polish', country: 'Africa', value: 4229 },      // 其他数据略    ]  },  stack: false,  xField: 'type',  yField: 'value',  seriesField: 'country',  legends: [{ visible: true, position: 'middle', orient: 'bottom' }],  markLine: [    {      y: markLineValue,      endSymbol: { visible: false },      line: { style: { /* 样式配置略 */ }}    }  ],  tooltip: { // TOOLTIP SPEC    mark: {      title: {        value: datum => datum.type      },      content: [        {          key: datum => datum.country,          value: datum => datum.value        }      ]    },    dimension: {      title: {        value: datum => datum.type      },      content: [        {          key: datum => datum.country,          value: datum => datum.value        }      ]    }  }};const vchart = new VChart(spec, { dom: CONTAINER_ID });vchart.renderSync();
```

显示效果如下：

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z9Yz66K88Erwspywca5bP8P9q63yeqicEcKcdlIEuCoMJq4h4SsKiaKgUncOMVNIQgwmKiciaaic0ZXZow/640?wx_fmt=png&from=appmsg)

观察 spec 不难发现，mark tooltip 和 dimension tooltip 分别用回调方式配置了 tooltip 的显示内容。其中：

*   title.value 显示的是数据项中对应于 `xField` 的内容；
    
*   content.key 显示的是数据项中对应于 `seriesField`（也是区分出图例项的 field）的内容；
    
*   content.value 显示的是数据项中对应于 `yField` 的内容。
    

回调是 tooltip 内容的基本配置方式，用户可以在 title 和 content 中自由配置回调函数来实现数据绑定和字符串的格式化。

### Tooltip 内容的排序、增删、条件格式

我们再来看一下 dimension tooltip 的 spec：

```
{
  tooltip: { // TOOLTIP SPEC
    mark: { /* ...略 */ },
    dimension: {
      title: {
        value: datum => datum.type
      },
      content: [
        {
          key: datum => datum.country,
          value: datum => datum.value
        }
      ]
    }
  }
}
```

不难发现，content 配置的数组只包含 1 个对象，但是上图显示出来却有 4 行内容。为什么呢？

其实在 dimension tooltip 中发生了和折线图元类似的 data join 过程：由于在数据中，`seriesField` 划分出了 4 个数据组（图例项有 4 个），因此在经过笛卡尔积后，真实 tooltip 内容行数为 content 数组成员数量乘以 4。在数据组装过程中，每个数据组都要依次走一遍 content 数组成员里的回调。

我们把 spec 中的 tooltip 内容配置称为 TooltipPattern，tooltip 所需数据称为 TooltipData，最终的 tooltip 结构称为 TooltipActual。数据组装过程可以表示为：

在本例中，经过这个过程，TooltipPattern 中的回调在 TooltipActual 中消失（回调已被执行 4 次），且由 1 行变成了 4 行。

这个过程完整的执行流程如下：

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z9Yz66K88Erwspywca5bP8PbQk3Y9PaVogc5SxZO9kexvA94al2cibSu8wx0N7iaE3eiba17dyribohGA/640?wx_fmt=png&from=appmsg)

那么回到示例中的用户需求，用户希望将 tooltip 内容行由大到小排序。那么这个步骤自然要在 TooltipActual 生成之后执行，也就是上图中的 “updateTooltipContent” 过程。

Tooltip spec 中支持配置 `updateContent` 回调来对 TooltipActual 的 content 部分进行操作。排序可以这样写：

```
{
  tooltip: { // TOOLTIP SPEC
    mark: { /* ...略 */ },
    dimension: {
      title: {
        value: datum => datum.type
      },
      content: [
        {
          key: datum => datum.country,
          value: datum => datum.value
        }
      ],
      updateContent: prev => {
        // 排序
        prev.sort((a, b) => b.value - a.value);
      }
    }
  }
}
```

`updateContent` 回调的第一个参数为已经计算好的 TooltipActual。加上回调以后，排序生效：

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z9Yz66K88Erwspywca5bP8Pk9NvQj6TDLkffveUe4tA2iadLvZlsMicfF69Y8twsiatHVo21CPYRBYIQ/640?wx_fmt=png&from=appmsg)

在 tooltip 中实现条件格式以及新增一行也是一样的方法，可以直接在 `updateContent` 回调中处理：

```
{  updateContent: prev => {    // 排序    prev.sort((a, b) => b.value - a.value);    // 条件格式：比标注线高的数据项标红    prev.forEach(item => {      if (item.value >= markLineValue) {        item.valueStyle = {          fill: 'red'        };      }    });    // 新增一行    prev.push({      key: 'Mark Line',      value: markLineValue,      keyStyle: { fill: 'orange' },      valueStyle: { fill: 'orange' },      // 自定义 shape 的 svg path      shapeType: 'M44.3,22.1H25.6V3.3h18.8V22.1z M76.8,3.3H58v18.8h18.8V3.3z M99.8,3.3h-9.4v18.8h9.4V3.3z M12.9,3.3H3.5v18.8h9.4V3.3z',      shapeColor: 'orange',      hasShape: true    });  }}
```

调试 spec，回调生效，最后效果如下：

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z9Yz66K88Erwspywca5bP8P4sErNN9ibyADRLXgVcvMTia2uX9ab23hJKExMZQR8c0mCQE4OLmKTMmQ/640?wx_fmt=png&from=appmsg)

### Tooltip 样式和位置

VChart tooltip 支持将 tooltip 固定于某图元附近或者鼠标光标附近。在本例中，mark tooltip 固定于图元的下方，而 dimension tooltip 固定于鼠标光标的上方，可以这样配置：

```
{  tooltip: { // TOOLTIP SPEC    mark: {      // 其他配置略      position: 'bottom' // 显示在下方      positionAt: 'mark' // 固定在图元附近，由于这是默认值，这行可以删掉    },    dimension: {      // 其他配置略      position: 'top', // 显示在上方      positionAt: 'pointer' // 固定在鼠标光标附近    }  }}
```

而样式配置可以在 tooltip spec 上的 `style` 配置项下进行自定义。`style` 支持配置 tooltip 组件各个组成部分的统一样式，详细配置项可参考官网文档（https://www.visactor.io/vchart/option/barChart#tooltip.style）。

最后效果如下，完整 spec 可见官网 demo（https://www.visactor.io/vchart/demo/tooltip/custom-tooltip）：

![](https://mmbiz.qpic.cn/mmbiz_gif/lP9iauFI73z9Yz66K88Erwspywca5bP8PMF3m0TjJGhTqiaLUrKXPmX6kYdvMSjg8pFicrx83ficLqxEX6LDbHEb0w/640?wx_fmt=gif&from=appmsg)

示例三：锦上添花，可按需修改的 tooltip dom 树
-----------------------------

VChart 的 tooltip 共支持两种渲染模式：

*   Dom 渲染，适用于桌面或移动端浏览器环境；
    
*   Canvas 渲染，适用于移动端小程序、node 环境等非浏览器环境。
    

对于 dom 版本的 tooltip，为了更好的支持业务方的自定义需求，VChart 开放了对 tooltip dom 树的修改接口。下文将以官网 demo（https://www.visactor.io/vchart/demo/tooltip/custom-tooltip）为例进行详细介绍。

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z9Yz66K88Erwspywca5bP8PqbYzQvo6vuUvRDIAjK3eU4ydDySjgkFZbglGVFm7Dx6ToQtImJlbcw/640?wx_fmt=png&from=appmsg)

在这个示例中，用户要求在 tooltip 的底部增加一个超链接，用户点击链接后，便可以自动跳转到 Google，对 tooltip 标题进行进一步搜索。这个示例要求两个能力：

*   示例一介绍的 enterable 能力，开启后鼠标会被允许滑入 tooltip 区域，这是在 tooltip 中实现交互的前提；
    
*   在默认 tooltip 上绘制自定义的 dom 元素。
    

为了实现第二个能力，tooltip 支持了回调 `updateElement`，这个回调配在 tooltip spec 顶层。这个示例的 tooltip 配置如下：

```
{  tooltip: { // TOOLTIP SPEC    enterable: true,    updateElement: (el, actualTooltip, params) => {      // 自定义元素只加在 dimension tooltip 上      if (actualTooltip.activeType === 'dimension') {        const { changePositionOnly, dimensionInfo } = params;        // 判断本次 tooltip 显示是否仅改变了位置，如果是的话退出        if (changePositionOnly) { return; }        // 改变默认 tooltip dom 的宽高策略        el.style.width = 'auto';        el.style.height = 'auto';        el.style.minHeight = 'auto';        el.getElementsByClassName('value-box')[0].style.flex = '1';        for (const valueLabel of el.getElementsByClassName('value')) {          valueLabel.style.maxWidth = 'none';        }        // 删除上次执行回调添加的自定义元素        if (el.lastElementChild?.id === 'button-container') {          el.lastElementChild.remove();        }        // 添加新的自定义元素        const div = document.createElement('div');        div.id = 'button-container';        div.style.margin = '10px -10px 0px';        div.style.padding = '10px 0px 0px';        div.style.borderTop = '1px solid #cccccc';        div.style.textAlign = 'center';        div.innerHTML = `<a          href="https://www.google.com/search?q=${dimensionInfo[0]?.value}"          style="text-decoration: none"          target="_blank"        >Search with <b>Google</b></a>`;        el.appendChild(div);      } else {        // 对于 mark tooltip，删除上次执行回调添加的自定义元素        if (el.lastElementChild?.id === 'button-container') {          el.lastElementChild.remove();        }      }    }  }}
```

`updateElement`在每次 tooltip 被激活或者更新时触发，在触发时，TooltipActual 已经计算完毕，且 dom 节点也已经准备好。回调的第一个参数便是本次将要显示的 tooltip dom 根节点。目前不支持替换该节点，只支持对该节点以及其孩子进行修改。

这个配置的设计最大限度地复用了 VChart tooltip 的内置逻辑，同时提供了足够自由的自定义功能。你可以随心所欲地定制 tooltip 显示内容，并且复用任何你没有覆盖的逻辑。

比如，你可以对 tooltip 的大小进行重新定义，而不用关心窗口边界的躲避策略是否会出问题。事实上 VChart 会自动把 tooltip 定位逻辑复用在修改过的 dom 上：

![](https://mmbiz.qpic.cn/mmbiz_gif/lP9iauFI73z9Yz66K88Erwspywca5bP8PDf4MvEHsppib5icNxjFxg8lNGqs7T4Bq9ajdXGGGjjJyvhWJfhFnXulw/640?wx_fmt=gif&from=appmsg)

这个回调还可以进一步封装，比如在 react-vchart 中将用户侧的 react 组件插入 tooltip。目前这个封装主要由业务侧自主进行，后续 VChart 也有计划提供官方支持。

示例四：完全自定义，由业务托管 tooltip 渲染
--------------------------

若要更进一步，VChart tooltip 最高级别的自定义，便是让 VChart 完全将 tooltip 渲染交给用户。有以下两种方式可以选择：

*   用户自定义 tooltip handler
    
*   用户使默认 tooltip 失效，监听 tooltip 事件
    

再结合示例二、示例三的铺垫，便可以带出整个 tooltip 模块的设计架构。熟悉了架构便更容易了解每条渲染路径以及各个层级的关系。

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z9Yz66K88Erwspywca5bP8PW0qu09bNVteGh8dlIYKsLSzcCz7NxlpRmflU6EA7I95Pwmy7BNspIg/640?wx_fmt=png&from=appmsg)

由上图可见，示例三对应的是 “Custom DOM Render” 的自定义，示例二对应了 “Custom TooltipActual” 部分的自定义。而示例四，便是对应整个 “Tooltip Events” 以及 “Custom TooltipHandler” 的自定义。

由于上图中，“Tooltip Events” 和 “Custom TooltipHandler” 纵跨了多个层级，因此它覆盖的默认逻辑是最多的，体现在：

*   当给图表设置了自定义 tooltip handler 后，内置的 tooltip 将不再起作用。
    
*   VChart 不感知、不托管自定义 tooltip 的渲染，需要自行实现 tooltip 渲染，包括处理原始数据、tooltip 内容设计，以及根据项目环境创建组件并设置样式。
    
*   当图表删除时会调用当前 tooltip handler 的`release`函数，需要自行实现删除。
    

目前，火山引擎 DataWind 正是使用自定义 tooltip handler 的方式实现了自己的图表 tooltip。DataWind 支持用户对 tooltip 进行富文本渲染，甚至支持了 tooltip 内渲染图表的能力。

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z9Yz66K88Erwspywca5bP8PzwaibJ8WcT5Z4U2WRBVdGR9BAzWwiaWunFGcTdqsILA87kYajylaHYKA/640?wx_fmt=png&from=appmsg)

另外，也可以参考官网示例（https://www.visactor.io/vchart/demo/tooltip/custom-tooltip-handler）：

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z9Yz66K88Erwspywca5bP8PzkriaoqkKt9sKfJbJkpldecoIOhtPYfzCFuPoFnWXhzV3oGHZlRdMiag/640?wx_fmt=png&from=appmsg)

自定义 tooltip handler 的核心是调用 VChart 实例方法 `setTooltipHandler`，部分示例代码如下：

```
vchart.setTooltipHandler({  showTooltip: (activeType, tooltipData, params) => {    const tooltip = document.getElementById('tooltip');    tooltip.style.left = params.event.x + 'px';    tooltip.style.top = params.event.y + 'px';    let data = [];    if (activeType === 'dimension') {      data = tooltipData[0]?.data[0]?.datum ?? [];    } else if (activeType === 'mark') {      data = tooltipData[0]?.datum ?? [];    }    tooltipChart.updateData(      'tooltipData',      data.map(({ type, value, month }) => ({ type, value, month }))    );    tooltip.style.visibility = 'visible';  },  hideTooltip: () => {    const tooltip = document.getElementById('tooltip');    tooltip.style.visibility = 'hidden';  },  release: () => {    tooltipChart.release();    const tooltip = document.getElementById('tooltip');    tooltip.remove();  }});
```

其他特性一览
------

VChart tooltip 包含一些其他的高级特性，下文将简要介绍。

### 在任意轴上触发 dimension tooltip

Dimension tooltip 一般最适合用于离散轴，ECharts 同时支持连续轴上的 dimension tooltip（axis tooltip）。而 VChart 支持了在连续轴、时间轴乃至在一个图表中的任意一个轴上触发 dimension tooltip。

以下示例展示了 dimension tooltip 在连续轴（时间轴）上汇总离散数据的能力（这个 case 和一般的 dimension tooltip 刚好相反）：

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z9Yz66K88Erwspywca5bP8PM1xRJNgtKIDHL96qibetFebqiasPNBwP5ZzIeNpp5mcibxAADGmXg7duA/640?wx_fmt=png&from=appmsg)

一般的 dimension tooltip 会在离散轴（纵轴）触发 tooltip，汇总连续数据（对应于时间轴）。而 VChart 同时支持这两种方式的 tooltip。

Demo 地址：https://www.visactor.io/vchart/demo/tooltip/time-axis-tooltip

### 长内容支持：换行和局部滚动

过长的内容在 tooltip 上一般是 bad case。但是为了使长内容的浏览体验更好，VChart tooltip 可以配置多行文本以及内容区域局部滚动。如以下示例：

![](https://mmbiz.qpic.cn/mmbiz_gif/lP9iauFI73z9Yz66K88Erwspywca5bP8P8XB67zGYgsFvD9lrsElxKey7dtSuxgFTv6wF2HgqILAibWsfJ5turhg/640?wx_fmt=gif&from=appmsg)

局部滚动 Demo 地址：https://www.visactor.io/vchart/demo/tooltip/format-method

多行文本配置项：https://www.visactor.io/vchart/option/barChart#tooltip.style.valueLabel.multiLine

结语
--

Tooltip 在提升用户浏览图表的体验中扮演着重要的角色。本文介绍了 VChart tooltip 的基本使用方法、技术设计以及多层面的自定义方案。然而为了保证行文清晰，VChart tooltip 还有一些其他的用法细节本文没有涉及，想了解更多可以查阅官网 demo 以及文档。

然而需要提醒的是，虽然 tooltip 能够有效传递数据与信息、以及增加图表的互动能力，但过分依赖它们可能会导致用户体验下降。合理地利用 tooltip，让它们在需要时出现而不干扰用户的主要任务，是设计和开发中应保持的平衡。

希望本文能为你在配置 VChart tooltip 时提供有用的指导。愿你在图表中创造更加直观、轻松且愉快的用户体验时，VChart 能成为你强大的伙伴。

欢迎交流
----

1）VisActor 微信订阅号留言（可以通过订阅号菜单加入微信群）：

2）VisActor 官网：https://www.visactor.io/

3）VisActor 飞书群：

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z9Yz66K88Erwspywca5bP8Pu7BzIpqL1lcgfh2GBnJbD9A8icuaMlEUtO1lNgKpKMibePjxqdWIibt5w/640?wx_fmt=png&from=appmsg)

今夜无月，期待你点亮星空，感谢 Star：

github：https://github.com/VisActor/VChart

相关参考：

1.  VisActor——面向叙事的智能可视化解决方案：https://juejin.cn/post/7259385807550513210
    
2.  探索 VChart 图表库: 简单、易用、强大、炫酷的可视化利器：https://juejin.cn/post/7291856254098636852
    
3.  魔力之帧 (上): 前端图表库动画实现原理：https://juejin.cn/post/7275270809777520651
    
4.  VisActor——面向叙事的智能可视化解决方案：https://juejin.cn/post/7259385807550513210