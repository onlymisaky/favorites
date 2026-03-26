> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/GtGQqDvDzU6A-qtwNPKWqQ)

![](https://mmbiz.qpic.cn/mmbiz_gif/AAQtmjCc74DZeqm2Rc4qc7ocVLZVd8FOASKicbMfKsaziasqIDXGPt8yR8anxPO3NCF4a4DkYCACam4oNAOBmSbA/640?wx_fmt=gif)

**目录**

一、引言

二、鼠标交互的基本特性及利用

    1. 鼠标交互的特性

    2. 根据鼠标交互特性计算常用交互时间

    3. 根据常用交互时间设计优化策略

三、键盘交互的基本特性及利用

    1. 快捷键操作时间测算

    2. 将鼠标操作转换为快捷键交互

    3. 快捷键切换的局限性

    4. 小结

四、总结

五、附录

**一**

**引言**

B 端前端交互领域是处于视觉设计师、产品和前端之间的交叉地带，而交互领域有以下特点：

*   **业务影响低**：对业务功能影响不大，即业务功能完整性不会因为交互的好坏受影响
    
*   **量化难**：难以被量化，因此无法准确体现其好坏的价值所在
    
*   **方向散**：比较细碎和散落，比较难以被统一和规范，没有具体优化方向
    
*   **ROI 低**：B 端的使用量一般也不大，如果投入较大精力在交互上，其产出也比较有限
    

而在客服作业场景上，存在**每人使用频次高、持续时间久、总量大**等显著特性。以得物客服工单工作台为例，长期 UV 和 PV 在高位使用，任何一个简单的交互的使用量都非常大，仅切换到工单工作台这个页面的交互使用量就达到百万级别。

因此，交互量化、实践及优化指引就有被探究的前提，以助力 B 端体验、操作作业效率的提升。

**二**

**鼠标交互的基本特性及利用**

在 B 端系统中，交互操作主要依赖两种设备进行，即鼠标和键盘，接下来我们进行分类讨论：

**鼠标交互的特性**

目前鼠标交互主要是三种：**移动、点击**及**滚轮**，这三者又组合成了鼠标操作最基本的两项操作：

*   **移动 + 点击**，即所有鼠标点击的操作前提必须由鼠标移动到具体位置来完成
    
*   **移动 + 滚轮**，即鼠标移动到对应滚动区域进行滚动；后续，其操作效率可以参考移动 + 点击，因为基本结构都是移动加动作。
    

**鼠标移动点击效率的影响要素**

而移动 + 点击又是这两者中最主要的操作方式，那么，现在有个疑问: 一次移动加点击的交互时间与什么因素相关？

我们再次分析这个组合操作中的变量：**移动距离、鼠标移动速度、点击时间、点击目标区域大小。**

*   **确定性因素**
    

*   移动速度：其中鼠标移动速度受操作人员手速及鼠标移动速度设置影响较大，但对于具体的人员而言又是相对固定的；
    
*   点击时间：点击时间也是相对固定的，即鼠标 mouseDown 到 onClick 触发的时间，我们简单做了 100 次点击试验，得出这个时间约为 **110ms。**
    

*   **非确定因素**
    

因此，受界面影响较大的变量只有**移动距离**和**目标区域**大小。因此，我们对这两项变量进行试验，以期得出变量与时间的关联关系，进而推算与操作效率的关系。

**移动距离与时间的关系**

进行如下试验设置：

*   设置两个按钮——起始按钮和结束按钮，两个按钮间距离为测试变量
    
*   起始按钮以 mouseUp 事件为计算时间起点
    
*   结束按钮以 onClick 事件为计算时间结束点
    
*   设置每轮十次操作，并计算十次的平均时间，进行三轮
    

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74A7G0etRRIbOOPDJiac4zKx2JJX4FU960RMgxUJ4GsqbzichCyEDiacwocg4FzpWB8UhwqcsicCn3lTJw/640?wx_fmt=png&from=appmsg)

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74A7G0etRRIbOOPDJiac4zKx2828uHpgw9lic4mCgQC4qM5v6ibEDk1u9u5KOxCMK5zM5mM17ibMhSusCg/640?wx_fmt=png&from=appmsg)

基本可以看出如下关系：

*   操作时间与距离呈现正相关关系，基本呈现线性关系，随着操作距离的增加而增加
    
*   操作距离越短，时间上升越快；当操作距离已经较长时，操作时间增加越慢
    

*   可以看到，即使是最短的 30px，起始操作时间为 427ms；而单次点击的时间为 110ms，即只要鼠标发生移动，约 317ms 为移动所需时间的最低时间；
    
*   前 500px 内，每多移动 100px，操作时间时间增加约 50ms；
    
*   而在 500~2000px 范围内，每多移动 100px，操作时间时间增加约 23ms，只有前者一半不到。
    

另外，操作人眼睛在屏幕上关注点的移动其实是跟随操作同步进行的，但关注点移动很难进行测量，因此上述曲线形态可以近似替代。

**结论 1：总体平均而言，每多移动 100px，操作时间时间增加约 30ms。**

**点击目标区域大小与时间的关系**

进行如下试验设置：

*   设置 100px、300px、800px 三档距离
    
*   起始按钮以 mouseUp 事件为计算时间起点
    
*   结束按钮以 onClick 事件为计算时间结束点
    
*   设置每档十次，观察交互时间随结束按钮区域（正方形）面积大小变化
    

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74A7G0etRRIbOOPDJiac4zKx22LIFGhR3qld1VUsvAhP7CSdDwaqSAecLR7rqicQ1Oqk2CDDYszFh27w/640?wx_fmt=png&from=appmsg)

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74A7G0etRRIbOOPDJiac4zKx25jNYvelaFiaacmm8DK1vrGONPaibwIib2QroQF05E9yr4J0vys4lSuBpg/640?wx_fmt=png&from=appmsg)

可以看出如下关系：

*   操作交互时间与面积成负相关关系，即目标区域越大，耗时越少
    
*   面积较大时（>30000）时，耗时基本稳定
    
*   并且随着目标区域的减小，交互操作耗时呈指数上升
    

由于边长小于 100px 是我们常用的点击区域大小，我们以边长为单位，将 100px 以内的曲线再次放大：

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74A7G0etRRIbOOPDJiac4zKx2yfkCtjM3WtzcqgbPgHlJscu3nJZfQibVlEQJQtMXHByjnQO8lSPExBA/640?wx_fmt=png&from=appmsg)

可以看到将横坐标转换为边长后，为了计算方便，曲线可以近似拟合成线性关系。

*   边长从 100px 到 16px，不同距离的关系：
    

*   100px 距离：增加 341ms，平均 100px 增加了 405ms
    
*   300px 距离：增加 328ms，平均 100px 增加了 390ms
    
*   800px 距离：增加 426ms，平均 100px 增加了 507ms
    

不同距离的耗时增速区别不大，我们认为近似相等，取近似值，即每增加 10px 边长就能减少约 45ms。

**结论 2：目标区域越大，交互所耗费时间越少。**

*   目标区域较小时（边长 < 100px）增加面积所带来的收效非常大，平均每增加 10px 边长就能减少约 45ms 的交互时间。
    

**平面上鼠标平均移动距离的计算**

由上面两项测算可知，移动距离和目标区域面积是交互时间的重要影响要素。为了方便下一步具体交互的时间对比，我们需要计算鼠标在屏幕上移动的平均距离，即用户每次鼠标操作时，平均移动多少距离。

*   **鼠标平均移动距离测算**
    

要求得鼠标的平均移动距离，我们已知如下要素：

*   按钮会出现在页面任意位置
    
*   鼠标光标也会出现在页面任意位置
    
*   移动曲线认为是直线
    
*   假设屏幕尺寸为 1920*1080，因为这是一个非常常见的尺寸，例如在客服职场中就是配置了该尺寸的显示器
    

那么这就是计算出**页面上任意一点到页面所有点的平均距离**:

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74A7G0etRRIbOOPDJiac4zKx2qoPOVXAkVlmZMAOHKTYvz2ew5uZzQ7Qox4L0qiahgZSNPFl4ZzaoQOA/640?wx_fmt=png&from=appmsg)

其中：

*   x 是平面宽度，y 是平面高度
    
*   i 是鼠标起始采样点位置
    
*   j 是目标采样点位置
    

我们将具体尺寸带入计算可得近似值为：**800 像素**

**结论 3：页面上任意一点到页面所有点的平均距离为 800 像素。**

该值可作为在（1920×1080）屏幕鼠标平均移动距离使用， 后续会被使用到。

*   **鼠标移动到页面顶部的平均距离计算**
    

后续需要使用到此项数据，因为常用的关闭页面等操作往往在顶部，我们先进行计算作备用。

在这里就是**求页面中顶部任意一点到页面所有点的平均距离，**直接将尺寸带入：

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74A7G0etRRIbOOPDJiac4zKx245KWNggaoqZNV8YGqnicjhnwlibWE95EJDGqkibN17HiaTlsqSKnKXRBqA/640?wx_fmt=png&from=appmsg)

其中：

*   （1920）是顶部一行上点的数量
    
*   （1080）是平面上的高度
    
*   （1920×1080）是平面上所有点的数量
    
*   i 代表顶部一行具体点位置，j 代表所有点的位置
    
*   x 和 y 是对应点的横坐标和纵坐标
    

```
function calculateAverageDistance(width, height) {
  let sum = 0;
  for (let i = 0; i < width; i++) {
    for (let j = 0; j < width * height; j++) {
      // 计算点 (i, 0) 到点 (j % width, Math.floor(j / width)) 的欧几里得距离
      let x1 = i;
      let y1 = 0;
      let x2 = j % width;
      let y2 = Math.floor(j / width);
      let distance = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
      sum += distance;
    }
  }
  return sum / (width * height * width);
}

// 调用函数并输出结果
let averageDistance = calculateAverageDistance(1920, 1080);
```

**结论 4：计算可得移动到页面顶部的平均距离为 915 像素。**

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74A7G0etRRIbOOPDJiac4zKx2icmgPzgSrP1dFeU97XxiclQsKDDOP0ncXLOOyBID2rhwMc9D6v0LHTkw/640?wx_fmt=png&from=appmsg)

**根据鼠标交互特性计算常用交互时间**

上述试验得出的两个指导性意见，即**减少交互的移动距离****和增加目标区域的面积有助于减少交互操作时间。**那如何利用这两个特性，进行交互优化呢？

首先，通过点击按钮来查询信息是一个非常基本的交互动作，点击按钮后，具体查询界面形态有这么几种情况：

*   **跳出当前页面**，新开页面查询，查询完成后需要关闭页面返回
    
*   **当前页面弹窗**，通过 Modal（弹窗）或 Drawer（抽屉）展示信息，完成后需要关闭
    
*   **气泡或展开更多信息**，信息一般直接在点击处展开，再次点击关闭
    

接下来我们进行具体交互和时间分析。

**跳出当前页面新开页面查询及其交互时间测算**

点击按钮后，新开浏览器标签或内置页面来查看关联信息，其交互步骤如下

*   点击页面中的按钮或链接
    
*   页面自动跳转到对应的新页面，使用人员继续在新的页面上浏览或操作
    
*   新的页面浏览完毕，使用人员需要**移动鼠标点击关闭按钮**，页面回到刚才操作的页面
    
*   使用人员将**鼠标移回**到所需要继续操作的位置
    

鼠标移动线图如下：

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74A7G0etRRIbOOPDJiac4zKx2jiceW1eWC0yUIgbXce2pPC4r2O7vJzEk3aBmB6icmVIXApDbNHHlVIBQ/640?wx_fmt=png&from=appmsg)

因此，一次跳出当前页面的查询的交互时间（排除新页面浏览操作时间）由两个部分组成：

*   移动鼠标，点击查询按钮的时间
    
*   查询完毕后，移动鼠标点击关闭按钮的时间
    

*   **移动并点击按钮的交互时间**：
    

*   由于我们上面已经算得了页面上任意一点到页面所有点的平均距离为 800px，点击页面上的一个按钮完全符合这一场景，可以直接使用该数据；
    
*   一般链接或按钮的高度从 16px 到 40px 不等，宽度基本在三倍左右，因此我们直接取 “面积点击目标区域大小与时间的关系表” 中距离为 800px，区域面积为 256~6400 的平均数；
    
*   计算结果为 **812ms**。
    

*   **点击关闭按钮的交互时间**：
    

*   **关闭按钮移动距离**：前面我们已经算得了屏幕任意一点到顶部（关闭页面按钮一般在顶部）的平均距离是 **915px。**
    
*   **关闭按钮大小**：我们还需要知道目前区域大小，在这里我们其实就是求 Chrome 浏览器关闭按钮或内置标签页关闭按钮的大小，其尺寸均为 **16×16。**
    

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74B5NIrOEjJOuwevT5lUlqEX3PetSPy4Zpz1axeEHeXUM3XIjh9sVdj3gn7fMdByjOqmtcpTtqtuRg/640?wx_fmt=png&from=appmsg)

我们再通过鼠标交互特性中得到的数据可大致推算出，平均一次鼠标移动关闭操作的时间为 **1095ms**：

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74A7G0etRRIbOOPDJiac4zKx2SoKhr8SBcUoEYShYa2oFV8V4SoUfKz9xicaZEj4Fux9IWK6A0Dkq4hw/640?wx_fmt=png&from=appmsg)

其中：

*   1060 是目标区域大小与时间的关系表中 800px 移动距离，16 边长目标区域的时间测算值
    
*   915 是页面中任意一点到页面顶部任意一点的平均距离
    
*   30 是根据移动距离与时间的关系测算的每增加 100px 增加的时间
    
*   该时间未计算关闭弹窗后返回移动的时间
    

**结论 5：最终一次新开页面的额外交互时间如下：**

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74A7G0etRRIbOOPDJiac4zKx2eZ11OiavmTRW6XyhmbpoyVJUYQuFCxR9iaicicFcqF7lVIGe64vibOMWKCQ/640?wx_fmt=png&from=appmsg)

**通过 Modal 查询信息及交互时间测算**

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74B5NIrOEjJOuwevT5lUlqEXfgFxnvn4CyiaqnLM1IicEqEEtbG0q8GSDldqkK9tSkdKic9oSFvicKR7OQ/640?wx_fmt=png&from=appmsg)

*   Modal 的宽度一般有 800px 和 1200px，我们算 Modal 平均宽度为 1000px，又由于左右两侧都是其可关闭区域，那么其最大移动距离为 500px；
    
*   由于 Modal 关闭不仅限于右上角关闭按钮，任何遮罩区域都属于可关闭区域，根据 “点击目标区域大小与时间的关系” 可知当目标区域足够大时，交互时间趋近于稳定；
    
*   从而可大致推算得 Modal 弹窗的额外交互时间是 812ms+338ms。
    

**通过 Popover 查询信息及其交互时间测算**

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74B5NIrOEjJOuwevT5lUlqEXDKRTOcU2N4zdLcVyLiahzPUnib8hSE2SYicP7UedeqcEglkKp74qZdp3g/640?wx_fmt=png&from=appmsg)

*   Popover 点击后，在原处周围会弹出对应信息气泡展示对应信息；
    
*   即原点击处肯定处于气泡范围之外，在气泡范围之外的点击都可以关闭气泡；
    
*   所以操作人员无需额外的移动即可关闭弹窗，那么其操作时间就是基准的点击关闭时间，为 812ms+110ms。
    

**根据常用交互时间设计优化策略**

**通过优化查询交互形态梯次降低交互时间**

上述三种查询方式，交互时间依次减少：

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74A7G0etRRIbOOPDJiac4zKx26HCGcegQb9UZhrDhPKC3D6LicxTuqz9aib3yvR370N5MeONztqg2kGyA/640?wx_fmt=png&from=appmsg)

其中跳出页面交互时间最长，达到了 1.9s，在大量查询的过程中如果跳出查询占比很高，那么其交互时间总量是很可观的，例如：在得物客服工单工作台的工单详情中，近 90 天其访问量为日均 69 万次，如果每次访问都有一次页面跳出（即跳出率达到 100%），那么光跳出的交互时间就为:

69 万 ×（812ms+1095ms）=1315830s≈365h，一个非常巨大的数字，那么相反，每优化 1% 的跳出，根据优化后的效果不同能节约 1.45 小时至 3.65 小时的时间，这就是我们要做的事——将费力度较高、耗时较长的交互转换成更高效的交互方式！

接下来，我们看下客服前端优化这些交互的例子和实践：

**减少跳出交互，降低跳出率**

将系统内原本要跳出的，整合到当前页面中，提高当前页面集成度：

*   工单详情创建赔付：**跳出转化为 Modal**
    

*   **优化前**：在工单详情二级 tab 栏新开创建赔付页面
    
*   **优化后**：通过 Modal 直接在当前页面打开，无需到新页面操作
    
*   **减少的交互时间**：**757ms**
    

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74B5NIrOEjJOuwevT5lUlqEXrgB2QArTnMXryf7uOibamvztGOaf5JlibmiaOecib1DjUW79NarXKkthicQ/640?wx_fmt=png&from=appmsg)

这是个简单的示例，理论上所有跳出页面交互都可以优化成这种方式；客服工单工作台就做了大量这样的优化，将工单详情的**跳出率从 30.81% 降低到 10% 左右。**

**优化 Modal 为 Popover 交互，进一步降低交互时间**

在信息查询中，存在大量简单的信息，这些信息有如下特点：

*   **非必要**：必要时再查询，如是某个重要信息的补充信息或详情信息
    
*   **纯展示**：只是单纯的展示信息，不需要额外的交互
    
*   **内容不多**：信息一般比较简要，内容不超过半屏（超过半屏时使用 Popover 就可能引发页面滚动）
    

这些信息如果是新开页面或者是 Modal 展示的，那么十分适合转换成 Popover 展示：

*   **减少的交互时间**：**757ms**
    

![](https://mmbiz.qpic.cn/mmbiz_jpg/AAQtmjCc74B5NIrOEjJOuwevT5lUlqEXFSe4GX7ibYRfCk7UgOMoZjt8vBks8jgODS1tz7Aa1QwjdppYp8td5ow/640?wx_fmt=jpeg)

**避免额外交互查询**

上述的交互优化，通过将费力度大的交互方式替换成费力度较小的方式，提升了操作效率，那么是不是可以将不必要的交互直接移除呢？达到免交互也能查询信息呢？结论表明这是可行的。

*   **信息块嵌入：将跳出页面交互转化为无交互**
    

我们可以把需要查询的额外信息直接嵌入到当前页面，但这些信息需要具备如下要素：

*   重要且查询十分频繁的关联信息，跳出率占比较高
    
*   该信息的嵌入不会引发其他更加重要信息交互优先级下降
    

如工单详情查看订单信息：

*   **优化前**：移动点击按钮，跳转到新页面
    

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74B5NIrOEjJOuwevT5lUlqEXeC1Eictiau4RKZz2NuU5fOtXqxKWGrV3GjtMdpSAyw1xycVmE4ApNe9A/640?wx_fmt=png&from=appmsg)

*   **优化后**：直接集成在右侧
    

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74B5NIrOEjJOuwevT5lUlqEXHR1w9VngkSvpicOp0V9ficteicFUUicEqFYOXxYXL6coWoibIxOVFJHaNwg/640?wx_fmt=png&from=appmsg)

*   **减少交互的时间：1907ms**  
    

*   **通过预查询，展示无信息结果**
    

在 B 端查询中，经常会遇到查询结果为空的情况，即目标页面其实是没有内容的，导致操作人员往往要点击查询按钮后才知道，这样的交互意义不大。

在客服工单工作台的订单详情中，存在着如优惠券详情、保价期详情等按钮：

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74B5NIrOEjJOuwevT5lUlqEXqnuyPEHu6gRV0vF9wia7WyjXvbKhiaP6N4qE7ywibNSOibgGE1LKHMJL7A/640?wx_fmt=png&from=appmsg)

需要点击按钮查询优惠券详情，但很多时候没有优惠券详情，详情列表为空。这时候我们可以让后端返回是否有优惠券详情的字段，如果没有，就**直接不展示此按钮**；那么操作人员看到没有按钮，就知道没有详情内容了。

*   **减少的交互时间：922ms**
    

*   **通过记录查询条件减少额外交互**
    

在用户操作时，会存在往复的情况，即之前已经打开过某个信息了，那么由于其他事项中断后继续时，需要继续查看之前的信息；在没有特殊处理时，可能就需要重新点击了。这些页面也存在如下特点：

*   页面二次、**多次查询比例很高**，如客服的工单详情的多次查询比例达到了 1：5，即一个工单会被往复打开 5 次。
    

这时我们对主要的查询做一些记录，避免额外点击：

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74B5NIrOEjJOuwevT5lUlqEXY6gPw9icu1h0bQDk3Kp69xB2vwOo8rE0g1bJqMB2OibiacNuDNGfSwH8Q/640?wx_fmt=png&from=appmsg)

即将当前查询的各项 tab 页做记录，返回时自动还原，就可以看到上次的查询结果。

该记录不仅限于操作的点位，还可以包含用户填写的表达。

*   **减少的交互时间：****812ms**
    

因此，通过将耗时较长的交互转换为耗时较少的交互，是一个非常有效的优化策略，不同级别间减少的交互时间关系如下：

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74A7G0etRRIbOOPDJiac4zKx2AibvaS0xuG3CpOBKwYXicCg4wFAntSEcphnCEz4bpky1HibPRoGicLmpJQ/640?wx_fmt=png&from=appmsg)

**加大主要按钮的区域**

在点击目标区域大小和时间关系的测算中，我们知道目标区域越大，点击得越快。当然，我们也不能无限制的扩大所有按钮的的区域，这样会挤压其他信息的空间，那什么样的情况需要加大按钮区域大小呢？

*   主要且高频按钮
    
*   在展示区域内有充足空间，不会影响其他信息展示
    

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74B5NIrOEjJOuwevT5lUlqEXUw7pXSgEzVAicfMT5LW8uDOcv62yvicueDCia2zBLtIbAHyDYG4eXfKZA/640?wx_fmt=png&from=appmsg)

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74B5NIrOEjJOuwevT5lUlqEX18B3icQjHd2b0s7F8XXwXuuhMIquxnY2GYCllAn4icStHiauXckHXLWhw/640?wx_fmt=png&from=appmsg)

根据区域与交互时间的关系表，每增加 10px，就能减少 45ms 的交互时间。因此，在工单详情中，主要按钮都是 ant-design 所提供的最大尺寸按钮。

**三**

**键盘交互的基本特性及利用**

键盘是除了鼠标之外，B 端系统主要使用的交互设备，其除了输入文本外，还可以通过快捷键的方式，影响界面交互；如系统常见的 ctrl+c、ctrl+v、ctrl+tab、ctrl+w 等，一般而言，快捷键操作是快于鼠标操作的，为此，我进行了相关测算。

**快捷键操作时间测算**

以切换应用的快捷键 ctrl+tab 为标准，测算切换应用的时间：

*   每轮进行十次切换，计算每轮总时间，从而得出单次计算时间
    
*   为减少误差，进行三轮测算
    

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74A7G0etRRIbOOPDJiac4zKx2Q1Isl86VUdgFDicicwPuX3W7MWCiclKZEpmeo5qgtoP9HZuwyr1OYwRqA/640?wx_fmt=png&from=appmsg)

即键盘平均交互时间为 **420ms，**而根据页面平均鼠标点击交互测算时间为 812ms，可知快捷键交互是完全优于鼠标交互的，快了将近 50%；此外，快捷键不受移动距离影响，表现更为精确和稳定。

**将鼠标操作转换为快捷键交互**

因此，我们可以把很多鼠标操作转换成快捷键操作，可以做如下优化：

**将高频操作绑定快捷键操作**

在得物客服工单工作台中，就将关闭工单，下一单，回到工单中心等绑定相应快捷键：

*   关闭当前工单：alt+w
    
*   回到工单中心：alt+e
    
*   下一个工单：alt+d
    
*   返回：alt+a
    

并进行相应关联提示：

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74B5NIrOEjJOuwevT5lUlqEX1icg05FXbaS0I6cC4pczRYTic3QQatVjMjf7MP1X5TK7fWSTsVib3ic9EQ/640?wx_fmt=png&from=appmsg)

**使用独立窗口转换为快捷键操作**

B 端系统的使用中，切换不同的系统是一个高频操作。

*   根据统计，得物客服工单工作台每天系统切换次数约为 **130 万**次。
    

而不同的系统又在同一个浏览器中，因此需要鼠标移动来切换不同的系统。

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74B5NIrOEjJOuwevT5lUlqEXW0QYlUp3RrMZOdjeBdiaBMU8ZcFBqufQk4MxZcaZyQZ5CX71yPjgw8A/640?wx_fmt=png&from=appmsg)

这样的交互时间是较高的，在关闭页面操作的测算中我们算得：关闭顶部标签页的时间是 1095ms，而切换标签页按钮也在顶部，可以近似计算，另外我也实际进行了三轮通过页签切换操作，测得平均值为 **943ms**，由于切换 tab 按钮比关闭按钮区域大，因此时间稍小也是合理的。

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74A7G0etRRIbOOPDJiac4zKx2hLvLDUbeHS2t28nInPH0Rlm6uFDiaZj7qibjul5CuwPichfx0yPXr08Tw/640?wx_fmt=png&from=appmsg)

那如果将系统作为一个应用维度，使操作人员可以通过 ctrl+tab 来切换系统，那么交互时间也会大大减少。

*   **通过 PWA 技术将页面转换为应用**
    

我们通过 PWA 可以将页面作为一个应用使用，那么也可以直接使用到系统的快捷键。

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74B5NIrOEjJOuwevT5lUlqEXjb2gHqHXOJibliagnnE7Bn4Av90wPBfvHib89LFC3JmFyMHmL14F4nCSQ/640?wx_fmt=png&from=appmsg)

*   单次交互节约时间：**523ms**
    
*   目前每日平均使用独立窗口切换数约 **1.8 万次**
    

  

**快捷键切换的局限性**

其最大的局限性是——快捷键是**非必须且隐性**的。

**非****必须**

所有的快捷键都可以通过鼠标来完成，鼠标操作才是必须的，**快捷键只能作为一种并行辅助工具存在**。对使用者而言其实就是一句话：我可以选择不用！

**隐性**

要使用快捷键，使用者需要去了解具体功能对应的快捷键组合，而这些说明基本都隐藏在比较深的位置，而且需要使用者记忆以及习惯这些组合。

换言之，快捷键前期使用成本其实是很高的，因此其使用量：

*   工单详情各快捷键在 1000 次左右，与 60 万的 PV 相比占比太低
    
*   独立窗口切换数 1.8 万次，占总切换占比 1.5% 左右
    

**小结**

虽然快捷键在交互优化中有其局限性，但其可以作为一种锦上添花的交互操作基础设施存在。因为在客服职场调研中我们发现，一些高效人士非常善于利用快捷键，使其作业效率大大增加。

这也可以用一句俗话表示：我可以不用，但你不可以没有。

**四**

**总结**

综上所述，本文的主要内容可归纳为以下图示：

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74A7G0etRRIbOOPDJiac4zKx2ampTfac9bbvA1GVrExb815kU8Dzv6MO9DYfoziatqPlkhRPZKRPE7GQ/640?wx_fmt=png&from=appmsg)

  

**五**

**附录**

*   **每增加 100px 移动距离与时间的关系**
    

*   其基本呈现近似线性关系
    

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74A7G0etRRIbOOPDJiac4zKx2JnMhNAk4wIgER0BZNlz3a3Pj6tckmZVY3QOPbm4f3mdupbSLnWDavg/640?wx_fmt=png&from=appmsg)

*   **目标区域面积与交互时间的关系**
    

*   时间随面积缩小呈现**指数关系增长**
    

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74A7G0etRRIbOOPDJiac4zKx2BSbJz6KRQP817GickSsWgiczGdaSjbyV0KSh1ak15xX9O3USjJIJSTDg/640?wx_fmt=png&from=appmsg)

*   **屏幕上鼠标平均移动距离**  
    

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74A7G0etRRIbOOPDJiac4zKx2bUlfL6tlwXXqjiaKibTmhia0w8x79VsCeibunwc7QJhVDOJDfiaVCLSINSg/640?wx_fmt=png&from=appmsg)

*   **页面移动鼠标点击的交互时间**  
    

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74A7G0etRRIbOOPDJiac4zKx2VoVWcFsHVcfviczsRMvEcaH6WpV9xdXweRDj9otq66dqicxcn6rv5SNg/640?wx_fmt=png&from=appmsg)

*   **主要鼠标交互组件的交互时间**
    

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74A7G0etRRIbOOPDJiac4zKx2JFTxZT1KwzufjFJiavl5JvFs6Ab6RTvEeC9kah1kT0MVMnmFIJUw8SA/640?wx_fmt=png&from=appmsg)

*   **快捷键交互时间**
    

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74A7G0etRRIbOOPDJiac4zKx2nLtZxKFicxJxCgicyAtoukjRRmAxKwzwicH2g8xOMdK40RIbCOMqpVGpw/640?wx_fmt=png&from=appmsg)

  

  

**往期回顾**

1. [前端打包工具 Mako 架构解析｜得物技术](http://mp.weixin.qq.com/s?__biz=MzkxNTE3ODU0NA==&mid=2247527699&idx=1&sn=b9457248f09d54a154478f87682d7798&chksm=c161384cf616b15a56d1ac2b01d9dc06ebd476d4008414601ec36a1260f5bd570819615c6471&scene=21#wechat_redirect)  
2. [基于 Rspack 实现大仓应用构建提效实践｜得物技术](http://mp.weixin.qq.com/s?__biz=MzkxNTE3ODU0NA==&mid=2247527650&idx=1&sn=abb64fd1a1b3c72b5b8181ce8a4fd0d9&chksm=c16139bdf616b0abaccb01477d7f82bcdfe1f4df2707c6ccf755d94ad478f96be2a9b5580a4a&scene=21#wechat_redirect)  
3. [星愿森林的互动玩法揭秘｜得物技术](http://mp.weixin.qq.com/s?__biz=MzkxNTE3ODU0NA==&mid=2247527623&idx=1&sn=1eb79e88e2a2db776462507e430d7bd4&chksm=c1613998f616b08efd9bcd2cf1749369c938a1f614dad7511a9a7fe9cae51cd971a03e08dc59&scene=21#wechat_redirect)  
4. [StarRocks 跨集群迁移最佳实践｜得物技术](http://mp.weixin.qq.com/s?__biz=MzkxNTE3ODU0NA==&mid=2247527446&idx=1&sn=7454faec48e966fafaae2e26829e6a56&chksm=c1613949f616b05f1defbbd62dcbe9c33f03b4b43e9b28bb03b7fb3fafe5c5032e90298abf33&scene=21#wechat_redirect)  
5. [Apache Flink 类型及序列化研读 & 生产应用｜得物技术](http://mp.weixin.qq.com/s?__biz=MzkxNTE3ODU0NA==&mid=2247527101&idx=1&sn=bee193b981bb15d10f65446a8f25e2a7&chksm=c1613fe2f616b6f42e89d413fcbb2ff6ec37837abf0de0b8b201720f6dcb8900e8a42441566f&scene=21#wechat_redirect)

文 / 舟畅

关注得物技术，每周一、三、五更新技术干货

要是觉得文章对你有帮助的话，欢迎评论转发点赞～

未经得物技术许可严禁转载，否则依法追究法律责任。

“

**扫码添加小助手微信**

如有任何疑问，或想要了解更多技术资讯，请添加小助手微信：

![](https://mmbiz.qpic.cn/mmbiz_jpg/AAQtmjCc74A7G0etRRIbOOPDJiac4zKx2bI5jVmnfb7E2nFYlfpo50hbkibXHFTQlriaMEEMuicPfDL8PGF1lR4JGg/640?wx_fmt=jpeg&from=appmsg)