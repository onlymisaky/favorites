> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/53ooD7bPK9JKG55t42ji0Q)

点击上方 程序员成长指北，关注公众号
------------------

回复 1，加入高级 Node 交流群

`<img>` 直接加载对比 `new Image()` 预加载
--------------------------------

### 1. **加载时机和页面渲染的差异**

*   **直接渲染到 `<img>` 标签**： 当你直接在 HTML 中通过 `<img>` 标签加载图片时，浏览器在遇到 `<img>` 标签时会立即开始加载图片。这意味着浏览器在渲染页面的过程中，会同步进行图片请求。当页面需要渲染图片时，可能会导致图片显示之前页面的其它部分无法完全显示，或者图片加载的过程中页面会出现闪烁或布局跳动。
    
    这种加载方式是 **同步** 的，即浏览器渲染页面时，图片的加载和显示是直接相关的。如果图片较大或者网络慢，用户可能会看到空白的占位符，直到图片加载完成。
    
*   ** 使用 `new Image()` 和 `img.src = src`**： 这种方式会在后台加载图片，不直接影响页面的渲染。也就是说，图片资源在浏览器缓存中已经加载好了，页面显示图片时，浏览器能快速地从缓存读取图片，而不必等待网络请求。浏览器不会因为加载图片而延迟页面的渲染。
    
    **关键点是**：通过 `new Image()` 加载图片会提前发起请求，将图片缓存到浏览器中，这意味着你可以在用户滚动或需要展示图片时，直接从缓存加载，而不需要重新请求网络资源。这个过程是 **异步** 的。
    

### 2. **浏览器的资源管理和缓存**

*   **图片预加载的缓存**： 当你通过 `new Image()` 加载图片时，图片会被缓存在浏览器的内存中（通常是浏览器的资源缓存），因此如果图片已经被加载过，后续使用该图片时会直接从缓存读取，而不需要重新请求网络资源。
    
    而如果你直接用 `<img>` 标签来加载图片，浏览器同样会请求并缓存图片，但如果图片在初次加载时不可见（比如在页面下方），用户滚动到该位置时，可能会再次触发网络请求，尤其是在使用懒加载（lazy load）等技术时。如果图片已经预加载过，浏览器就可以从缓存中直接加载，避免了再次请求。
    

### 3. **避免页面阻塞**

*   **直接使用 `<img>`** ：当浏览器在解析页面时遇到 `<img>` 标签，会立即发起网络请求来加载图片。如果图片资源很大或者服务器响应很慢，浏览器可能需要等待这些资源加载完成，才能继续渲染其他部分。这会导致页面的 **渲染阻塞**，即页面内容渲染较慢，特别是在图片多的情况下。
    
*   **使用 `new Image()` 预加载**：通过 `new Image()` 预加载图片，可以避免渲染时对页面的阻塞。浏览器在后台加载图片，直到需要展示图片时，图片已经准备好了，这样页面展示可以更快，用户体验也更好。
    

### 4. **适用场景**

*   **直接 `<img>` 标签加载**：适用于图片较少且页面上几乎所有图片都需要立即展示的场景。例如，单一图片展示的页面。
    
*   **`new Image()` 预加载**：适用于图片较多或需要延迟加载的场景，例如动态加载的图片、长页面或者需要懒加载的图片库。它允许你提前将图片加载到浏览器缓存中，减少后续显示时的加载时间。
    

### 5. **加载速度和时间**

如果从加载速度和时间上来看，**两者的差别可能不大**，因为它们最终都会发起一次网络请求去加载图片。但是，`new Image()` 的优势在于：

*   它允许你在图片真正需要显示之前就开始加载，这样当用户需要看到图片时，图片已经在浏览器缓存中，可以即时显示。
    
*   使用 `new Image()` 可以提前加载图片，而不会影响页面的渲染顺序和内容显示，不会造成页面的阻塞。
    

### 6. **网络请求优化**

`new Image()` 还可以和 **并发请求** 进行优化。如果你有多个图片需要预加载，可以通过多个 `new Image()` 实例来并行加载这些图片，而不影响页面的渲染。并且，如果你知道某些图片很可能会被需要（例如图片懒加载场景中的下拉加载图片），你可以提前加载这些图片，确保用户滚动时能立刻看到图片。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/yRIqhMamWtSOkRuSic9hmnYLQ7ztficvAzNIMNrxXTCib4pqxciczw0dAjHjYib7Es8icqWw4eicerTpj8ce88ib6DPapQ/640?wx_fmt=other&from=appmsg)image.png

### 7. **总结对比**

<table><thead><tr><th valign="top"><section>特性</section></th><th valign="top"><code>&lt;img&gt;</code><section>&nbsp;标签加载</section></th><th valign="top"><code>new Image()</code><section>&nbsp;预加载</section></th></tr></thead><tbody><tr><td valign="top"><strong>渲染影响</strong></td><td valign="top"><section>直接渲染图片，可能导致页面闪烁或布局跳动</section></td><td valign="top"><section>异步加载图片，不影响页面渲染</section></td></tr><tr><td valign="top"><strong>缓存</strong></td><td valign="top"><section>图片加载后会缓存，但可能会重复请求</section></td><td valign="top"><section>图片预先加载到缓存中，避免重复请求</section></td></tr><tr><td valign="top"><strong>适用场景</strong></td><td valign="top"><section>单一图片，少量图片，图片快速加载</section></td><td valign="top"><section>图片较多，懒加载，预加载</section></td></tr><tr><td valign="top"><strong>加载时机</strong></td><td valign="top"><section>页面渲染时加载，可能导致渲染延迟</section></td><td valign="top"><section>提前加载，确保图片准备好时显示</section></td></tr></tbody></table>

### 结论

虽然从技术上讲，直接在 `<img>` 标签中加载图片和使用 `new Image()` 设置 `src` 都会触发相同的图片加载过程，但是 **使用 `new Image()` 进行预加载** 提供了更灵活的控制，使得你可以在页面渲染时避免图片加载阻塞，提升页面的加载速度和用户体验。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/yRIqhMamWtSOkRuSic9hmnYLQ7ztficvAzOL7OGSjeFWr6jTe2cJJACn5onXlJAMjYyFVBW8gRIiahApHed9Yn1aA/640?wx_fmt=other&from=appmsg)1 再见. png

> 作者：不爱说话郭德纲
> 
> 链接: https://juejin.cn/post/7441246880666107931

  

Node 社群

```
我组建了一个氛围特别好的 Node.js 社群，里面有很多 Node.js小伙伴，如果你对Node.js学习感兴趣的话（后续有计划也可以），我们可以一起进行Node.js相关的交流、学习、共建。下方加 考拉 好友回复「Node」即可。

   “分享、点赞、在看” 支持一波👍
```