> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/UksN513OfsiQ5rPS644eDQ)

```
大厂技术  高级前端  Node进阶

点击上方 程序员成长指北，关注公众号

回复1，加入高级Node交流群

```

![](https://mmbiz.qpic.cn/mmbiz_jpg/lCQLg02gtibsYryj33Z65fTjAu5CKL54MR8ZWQiczzH3vpL5ia7iab49sW447k5rnXjlvbROAWiaT18ksXa5icfnk0tQ/640?wx_fmt=other&from=appmsg)

### 1. 背景

一开始接到任务需要打印 html，之前用到了 vue-print-nb-jeecg 来处理 Vue2 一个打印的问题，现在是遇到需求要在 Vue3 项目里面去打印十几页的打印和下载为 pdf，难点和坑就在于我用的库 vue3-print-nb 来做分页打印预览，下载 pdf 后面介绍

### 2. 预览打印实现

```
    <div id="printMe" style="background:red;">
        <p>葫芦娃，葫芦娃</p>
        <p>一根藤上七朵花 </p>
        <p>小小树藤是我家 啦啦啦啦 </p>
        <p>叮当当咚咚当当 浇不大</p>
        <p> 叮当当咚咚当当 是我家</p>
        <p> 啦啦啦啦</p>
        <p>...</p>
    </div>

    <button v-print="'#printMe'">Print local range</button>


```

因为官方提供的方案都是 DOM 加载完成后然后直接打印，但是我的需求是需要点击打印的时候根据 id 渲染不同的组件然后渲染 DOM，后面仔细看官方文档，有个 beforeOpenCallback 方法在打印预览之前有个钩子，但是这个钩子没办法确定我接口加载完毕，所以我的思路就是用户先点击我写的点击按钮事件，等异步渲染完毕之后，我再同步触发真正的打印预览按钮，这样就变相解决了我的需求。

坑

1.  没办法处理接口异步渲染数据展示 DOM 进行打印操作
    
2.  在布局相对定位的时候在谷歌浏览器会发现有布局整体变小的问题 (后续用 zoom 处理的)
    

### 3. 掉头发之下载 pdf

下载 pdf 这种需求才是我每次去理发店不敢让 tony 把我头发打薄的原因，我看了很多技术文章，结合个人业务情况，采取的方案是 html2canvas 把 html 转成 canvas 然后转成图片然后通过 jsPDF 截取图片分页最后下载到本地。本人秉承着不生产水，只做大自然的搬运工的匠人精神，迅速而又果断的从社区来到社区去，然后找到了适配当前业务的逻辑代码 (实践出真知)。

```
import html2canvas from 'html2canvas'
import jsPDF, { RGBAData } from 'jspdf'

/** a4纸的尺寸[595.28,841.89], 单位毫米 */
const [PAGE_WIDTH, PAGE_HEIGHT] = [595.28, 841.89]

const PAPER_CONFIG = {
  /** 竖向 */
  portrait: {
    height: PAGE_HEIGHT,
    width: PAGE_WIDTH,
    contentWidth: 560
  },
  /** 横向 */
  landscape: {
    height: PAGE_WIDTH,
    width: PAGE_HEIGHT,
    contentWidth: 800
  }
}

// 将元素转化为canvas元素
// 通过 放大 提高清晰度
// width为内容宽度
async function toCanvas(element: HTMLElement, width: number) {
  if (!element) return { width, height: 0 }

  // canvas元素
  const canvas = await html2canvas(element, {
    // allowTaint: true, // 允许渲染跨域图片
    scale: window.devicePixelRatio * 2, // 增加清晰度
    useCORS: true // 允许跨域
  })

  // 获取canvas转化后的宽高
  const { width: canvasWidth, height: canvasHeight } = canvas

  // html页面生成的canvas在pdf中的高度
  const height = (width / canvasWidth) * canvasHeight

  // 转化成图片Data
  const canvasData = canvas.toDataURL('image/jpeg', 1.0)

  return { width, height, data: canvasData }
}

/**
 * 生成pdf(A4多页pdf截断问题， 包括页眉、页脚 和 上下左右留空的护理)
 * @param param0
 * @returns
 */
export async function outputPDF({
  /** pdf内容的dom元素 */
  element,

  /** 页脚dom元素 */
  footer,

  /** 页眉dom元素 */
  header,

  /** pdf文件名 */
  filename,

  /** a4值的方向: portrait or landscape */
  orientation = 'portrait' as 'portrait' | 'landscape'
}) {
  if (!(element instanceof HTMLElement)) {
    return
  }

  if (!['portrait', 'landscape'].includes(orientation)) {
    return Promise.reject(
      new Error(`Invalid Parameters: the parameter {orientation} is assigned wrong value, you can only assign it with {portrait} or {landscape}`)
    )
  }
  const [A4_WIDTH, A4_HEIGHT] = [PAPER_CONFIG[orientation].width, PAPER_CONFIG[orientation].height]

  /** 一页pdf的内容宽度, 左右预设留白 */
  const { contentWidth } = PAPER_CONFIG[orientation]

  // eslint-disable-next-line new-cap
  const pdf = new jsPDF({
    unit: 'pt',
    format: 'a4',
    orientation
  })

  // 一页的高度， 转换宽度为一页元素的宽度
  const { width, height, data } = await toCanvas(element, contentWidth)

  // 添加
  function addImage(
    _x: number,
    _y: number,
    pdfInstance: jsPDF,
    base_data: string | HTMLImageElement | HTMLCanvasElement | Uint8Array | RGBAData,
    _width: number,
    _height: number
  ) {
    pdfInstance.addImage(base_data, 'JPEG', _x, _y, _width, _height)
  }

  // 增加空白遮挡
  function addBlank(x: number, y: number, _width: number, _height: number) {
    pdf.setFillColor(255, 255, 255)
    pdf.rect(x, y, Math.ceil(_width), Math.ceil(_height), 'F')
  }

  // 页脚元素 经过转换后在PDF页面的高度
  const { height: tFooterHeight, data: headerData } = footer ? await toCanvas(footer, contentWidth) : { height: 0, data: undefined }

  // 页眉元素 经过转换后在PDF的高度
  const { height: tHeaderHeight, data: footerData } = header ? await toCanvas(header, contentWidth) : { height: 0, data: undefined }

  // 添加页脚
  async function addHeader(headerElement: HTMLElement) {
    headerData && pdf.addImage(headerData, 'JPEG', 0, 0, contentWidth, tHeaderHeight)
  }

  // 添加页眉
  async function addFooter(pageNum: number, now: number, footerElement: HTMLElement) {
    if (footerData) {
      pdf.addImage(footerData, 'JPEG', 0, A4_HEIGHT - tFooterHeight, contentWidth, tFooterHeight)
    }
  }

  // 距离PDF左边的距离，/ 2 表示居中
  const baseX = (A4_WIDTH - contentWidth) / 2 // 预留空间给左边
  // 距离PDF 页眉和页脚的间距， 留白留空
  const baseY = 15

  // 除去页头、页眉、还有内容与两者之间的间距后 每页内容的实际高度
  const originalPageHeight = A4_HEIGHT - tFooterHeight - tHeaderHeight - 2 * baseY

  // 元素在网页页面的宽度
  const elementWidth = element.offsetWidth

  // PDF内容宽度 和 在HTML中宽度 的比， 用于将 元素在网页的高度 转化为 PDF内容内的高度， 将 元素距离网页顶部的高度  转化为 距离Canvas顶部的高度
  const rate = contentWidth / elementWidth

  // 每一页的分页坐标， PDF高度， 初始值为根元素距离顶部的距离
  const pages = [rate * getElementTop(element)]

  // 获取该元素到页面顶部的高度(注意滑动scroll会影响高度)
  function getElementTop(contentElement) {
    if (contentElement.getBoundingClientRect) {
      const rect = contentElement.getBoundingClientRect() || {}
      const topDistance = rect.top

      return topDistance
    }
  }

  // 遍历正常的元素节点
  function traversingNodes(nodes) {
    for (const element of nodes) {
      const one = element

      /** */
      /** 注意： 可以根据业务需求，判断其他场景的分页，本代码只判断表格的分页场景 */
      /** */

      // table的每一行元素也是深度终点
      const isTableRow = one.classList && one.classList.contains('ant4-table-row')

      // 对需要处理分页的元素，计算是否跨界，若跨界，则直接将顶部位置作为分页位置，进行分页，且子元素不需要再进行判断
      const { offsetHeight } = one
      // 计算出最终高度
      const offsetTop = getElementTop(one)

      // dom转换后距离顶部的高度
      // 转换成canvas高度
      const top = rate * offsetTop
      const rateOffsetHeight = rate * offsetHeight

      // 对于深度终点元素进行处理
      if (isTableRow) {
        // dom高度转换成生成pdf的实际高度
        // 代码不考虑dom定位、边距、边框等因素，需在dom里自行考虑，如将box-sizing设置为border-box
        updateTablePos(rateOffsetHeight, top)
      }
      // 对于普通元素，则判断是否高度超过分页值，并且深入
      else {
        // 执行位置更新操作
        updateNormalElPos(top)
        // 遍历子节点
        traversingNodes(one.childNodes)
      }
      updatePos()
    }
  }

  // 普通元素更新位置的方法
  // 普通元素只需要考虑到是否到达了分页点，即当前距离顶部高度 - 上一个分页点的高度 大于 正常一页的高度，则需要载入分页点
  function updateNormalElPos(top) {
    if (top - (pages.length > 0 ? pages[pages.length - 1] : 0) >= originalPageHeight) {
      pages.push((pages.length > 0 ? pages[pages.length - 1] : 0) + originalPageHeight)
    }
  }

  // 可能跨页元素位置更新的方法
  // 需要考虑分页元素，则需要考虑两种情况
  // 1. 普通达顶情况，如上
  // 2. 当前距离顶部高度加上元素自身高度 大于 整页高度，则需要载入一个分页点
  function updateTablePos(eHeight: number, top: number) {
    // 如果高度已经超过当前页，则证明可以分页了
    if (top - (pages.length > 0 ? pages[pages.length - 1] : 0) >= originalPageHeight) {
      pages.push((pages.length > 0 ? pages[pages.length - 1] : 0) + originalPageHeight)
    }
    // 若 距离当前页顶部的高度 加上元素自身的高度 大于 一页内容的高度, 则证明元素跨页，将当前高度作为分页位置
    else if (
      top + eHeight - (pages.length > 0 ? pages[pages.length - 1] : 0) > originalPageHeight &&
      top !== (pages.length > 0 ? pages[pages.length - 1] : 0)
    ) {
      pages.push(top)
    }
  }

  // 深度遍历节点的方法
  traversingNodes(element.childNodes)

  function updatePos() {
    while (pages[pages.length - 1] + originalPageHeight < height) {
      pages.push(pages[pages.length - 1] + originalPageHeight)
    }
  }

  // 对pages进行一个值的修正，因为pages生成是根据根元素来的，根元素并不是我们实际要打印的元素，而是element，
  // 所以要把它修正，让其值是以真实的打印元素顶部节点为准
  const newPages = pages.map(item => item - pages[0])

  // 根据分页位置 开始分页
  for (let i = 0; i < newPages.length; ++i) {
    // 根据分页位置新增图片
    addImage(baseX, baseY + tHeaderHeight - newPages[i], pdf, data!, width, height)
    // 将 内容 与 页眉之间留空留白的部分进行遮白处理
    addBlank(0, tHeaderHeight, A4_WIDTH, baseY)
    // 将 内容 与 页脚之间留空留白的部分进行遮白处理
    addBlank(0, A4_HEIGHT - baseY - tFooterHeight, A4_WIDTH, baseY)
    // 对于除最后一页外，对 内容 的多余部分进行遮白处理
    if (i < newPages.length - 1) {
      // 获取当前页面需要的内容部分高度
      const imageHeight = newPages[i + 1] - newPages[i]
      // 对多余的内容部分进行遮白
      addBlank(0, baseY + imageHeight + tHeaderHeight, A4_WIDTH, A4_HEIGHT - imageHeight)
    }

    // 添加页眉
    if (header) {
      await addHeader(header)
    }

    // 添加页脚
    if (footer) {
      await addFooter(newPages.length, i + 1, footer)
    }

    // 若不是最后一页，则分页
    if (i !== newPages.length - 1) {
      // 增加分页
      pdf.addPage()
    }
  }
  return pdf.save(filename)
}



```

### 4. 分页的小姿势

如果有需求把打印预览的时候的页眉页脚默认取消不展示，然后自定义页面的边距可以这么设置样式

```
@page {
  size: auto A4 landscape;
  margin: 3mm;
}

@media print {
  body,
  html {
    height: initial;
    padding: 0px;
    margin: 0px;
  }
}


```

### 5. 关于页眉页脚

由于业务是属于比较自定义化的展示，所以我封装成组件，然后根据返回的数据进行渲染到每个界面，然后利用绝对定位放在相同的位置，最后一点小优化就是，公共化提取界面的样式，然后整合为 pub.scss 然后引入到界面里面，这样即使产品有一定的样式调整，我也可以在公共样式里面去配置和修改，大大的减少本人的工作量。在日常的开发中也是这样，不要去抱怨需求的变动频繁，而是力争在写组件的过程中考虑到组件的健壮性和灵活度，给自己的工作减负，到点下班。

```
Node 社群




我组建了一个氛围特别好的 Node.js 社群，里面有很多 Node.js小伙伴，如果你对Node.js学习感兴趣的话（后续有计划也可以），我们可以一起进行Node.js相关的交流、学习、共建。下方加 考拉 好友回复「Node」即可。

   “分享、点赞、在看” 支持一波👍

```