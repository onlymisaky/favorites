> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/1fYO__dfUy2MIjHi3IJrmg)

由于 React 的特点，组件改变所在父级后会产生 Remount，而在可视化搭建场景存在两个特点：

1.  自由、磁贴、流式布局都可以通过拖拽轻松改变组件父元素。
    
2.  大数据量下组件 Remount 的消耗不容忽视。
    

结合上面两个特点，拖拽过程中或者松手时不可避免会产生卡顿，这就是我们这篇文章要解决的问题。

利用 createPortal 解决 Remount 问题
-----------------------------

createPortal 可以将 React 实例渲染到任意指定 DOM 上，所以我们利用这个 API，将组件树的组件打平，但通过 createPortal 生成到嵌套的 DOM 树上，就同时实现了以下两点：

*   在 dom 结构上依然符合组件树的嵌套描述。
    
*   在 React 实例角度，没有嵌套关系。
    

实现分为三步：

1.  遍历组件树，根据组件树嵌套结构生成 createPortal 的目标 dom，我们姑且称为 keepElement，对需要挂载 keepElement 的容器位置生成 dom，称为 keepContainer。对于没有渲染的容器，可以先不挂载 keepElement，而是等到父容器 mount 后再将 keepElement 移过去，后面再展开说明。
    
2.  遍历组件树，一次性打平渲染所有树中 React 组件实例，并利用 createPortal 挂载到对应的 keepElement 上。
    
3.  当数据流产生变化导致父级变化，或者布局插件拖动改变父级时，我们仅利用 dom api 将 keepElement 在不同的 keepContainer 之间移动，而在 React 实例视角没有发生任何变化。
    

![](https://mmbiz.qpic.cn/mmbiz_png/x0iannhWUodkmBwl2zOk4apllmuDXvpicv2Y7NIgyicGtETkZDMke2YGnPGYicrnAjFqkUac3WEszIahDUK2xBgAxA/640?wx_fmt=png)

协议做到用户无感知
---------

因为实现了 dom 结构与 React 实例结构分离，因此开启 keepAlive 模式不需要改变 `componentTree` 描述，也不会影响任何逻辑功能，我们只需要标记一下 `keepAlive` 参数即可开启：

```
import { createDesigner } from 'designer'const { Designer, Canvas, useDesigner } = createDesigner()const App = () => {  <Designer keepAlive={true} />}
```

渲染增加了额外 dom 嵌套
--------------

keepAlive 模式唯一对功能产生的影响是增加了额外 dom 嵌套，分别是 keepContainer 与 keepElement，产生这两层 dom 的原因分别是：

*   keepElement: 因为 React 实例 Remount 的作用范围是该组件自身 return 的所有虚拟 dom 最终映射的真实 dom，为了保证 React 映射 dom 与 React 树结构的对应，为了不产生 Remount 就必须要用额外的游离态 dom 作为 createPortal 的挂载节点。
    
*   keepContainer: 由于不仅要知道组件产生移动时，应该将 keepElement 移动到哪个 keepContainer 下，还需要在比如容器代码 `return children` 位置突然 `return null` 并恢复时，重新构建 keepElement，所以我们需要监听每一个 keepContainer 生命周期，所以需要额外生成一个 dom。
    

因此 keepAlive 模式势必会打乱原有应用的 dom 结构，新增的 dom 结构在比如流式布局时可能产生意外的定位错误，所以 keepAlive 模式尽量与绝对定位的布局方式结合。

总结
--

keepAlive 模式可以在不改变任何协议、应用代码的情况下，解决跨父级移动导致的 Remount 问题，但这种设计也会引入新增 dom 结构的问题，只要尽量采用绝对定位的布局策略，就可以避免负面影响。

> 讨论地址是：精读《可视化搭建 - keepAlive 模式》· Issue #475 · dt-fe/weekly

**如果你想参与讨论，请 点击这里，每周都有新的主题，周末或周一发布。前端精读 - 帮你筛选靠谱的内容。**

> 关注 **前端精读微信公众号**

![](https://mmbiz.qpic.cn/mmbiz_jpg/x0iannhWUodkmBwl2zOk4apllmuDXvpicvia38gaT1dQfPOqO0OSHY4lCXCMfVibreWHGcoicrfdL0ibPtKVj8zLZmnQ/640?wx_fmt=jpeg)

> 版权声明：自由转载 - 非商用 - 非衍生 - 保持署名（创意共享 3.0 许可证）