> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/kT2F9ZPs6qt_9RCfkVY78Q)

面试官也在看的前端面试资料

### 一、LRU 缓存淘汰策略

**缓存**在计算机网络上随处可见，例如：当我们首次访问一个网页时，打开很慢，但当我们再次打开这个网页时，打开就很快。

这就涉及缓存在浏览器上的应用：**浏览器缓存**。当我们打开一个网页时，例如 `https://github.com/sisterAn/JavaScript-Algorithms` ，它会在发起真正的网络请求前，查询浏览器缓存，看是否有要请求的文件，如果有，浏览器将会拦截请求，返回缓存文件，并直接结束请求，不会再去服务器上下载。如果不存在，才会去服务器请求。

其实，浏览器中的缓存是一种在本地保存资源副本，它的大小是有限的，当我们请求数过多时，缓存空间会被用满，此时，继续进行网络请求就需要确定缓存中哪些数据被保留，哪些数据被移除，这就是**浏览器缓存淘汰策略**，最常见的淘汰策略有 FIFO（先进先出）、LFU（最少使用）、LRU（最近最少使用）。

LRU （ `Least Recently Used` ：最近最少使用 ）缓存淘汰策略，故名思义，就是根据数据的历史访问记录来进行淘汰数据，其核心思想是 **如果数据最近被访问过，那么将来被访问的几率也更高** ，优先淘汰最近没有被访问到的数据。

画个图帮助我们理解：

![](https://mmbiz.qpic.cn/mmbiz_png/bwG40XYiaOKlChrb2EzJHk2yupHLwjEI5cLf2aicwgqTvBDnyBG4vxa6CAibicj2IlANBNvJ1o7SWdgRf6wicT3yQJQ/640?wx_fmt=png)

### 二、华为面试题

运用你所掌握的数据结构，设计和实现一个 LRU (最近最少使用) 缓存机制。它应该支持以下操作：获取数据 `get` 和写入数据 `put` 。

*   获取数据 `get(key)` ：如果密钥 ( `key` ) 存在于缓存中，则获取密钥的值（总是正数），否则返回 `-1` 。
    
*   写入数据 `put(key, value)` ：如果密钥不存在，则写入数据。当缓存容量达到上限时，它应该在写入新数据之前删除最久未使用的数据，从而为新数据留出空间。
    

**示例:**

```
LRUCache cache = new LRUCache( 2 /* 缓存容量 */ );cache.put(1, 1);cache.put(2, 2);cache.get(1);       // 返回  1cache.put(3, 3);    // 该操作会使得密钥 2 作废cache.get(2);       // 返回 -1 (未找到)cache.put(4, 4);    // 该操作会使得密钥 1 作废cache.get(1);       // 返回 -1 (未找到)cache.get(3);       // 返回  3cache.get(4);       // 返回  4
```

**进阶:**

你是否可以在 **O(1)** 时间复杂度内完成这两种操作？

#### 1、解答：类 vue keep-alive 实现

keep-alive 在 vue 中用于实现组件的缓存，当组件切换时不会对当前组件进行卸载。

```
<!-- 基本 -->
<keep-alive>
  <component :is="view"></component>
</keep-alive>
```

最常用的两个属性：`include` 、 `exculde` ，用于组件进行有条件的缓存，可以用逗号分隔字符串、正则表达式或一个数组来表示。

在 2.5.0 版本中，`keep-alive` 新增了 `max` 属性，用于最多可以缓存多少组件实例，一旦这个数字达到了，在新实例被创建之前，已缓存组件中最久没有被访问的实例会被销毁掉，**看，这里就应用了 LRU 算法**。即在 `keep-alive` 中缓存达到 `max`，新增缓存实例会优先淘汰最近没有被访问到的实例🎉🎉🎉

下面我们透过 vue 源码看一下具体的实现👇

##### 从 vue 源码看 keep-alive 的实现

```
export default {  name: "keep-alive",  // 抽象组件属性 ,它在组件实例建立父子关系的时候会被忽略,发生在 initLifecycle 的过程中  abstract: true,   props: {    // 被缓存组件    include: patternTypes,     // 不被缓存组件    exclude: patternTypes,    // 指定缓存大小    max: [String, Number]   },  created() {    // 初始化用于存储缓存的 cache 对象    this.cache = Object.create(null);    // 初始化用于存储VNode key值的 keys 数组    this.keys = [];   },  destroyed() {    for (const key in this.cache) {      // 删除所有缓存      pruneCacheEntry(this.cache, key, this.keys);    }  },  mounted() {    // 监听缓存（include）/不缓存（exclude）组件的变化    // 在变化时，重新调整 cache    // pruneCache：遍历 cache，如果缓存的节点名称与传入的规则没有匹配上的话，就把这个节点从缓存中移除    this.$watch("include", val => {      pruneCache(this, name => matches(val, name));    });    this.$watch("exclude", val => {      pruneCache(this, name => !matches(val, name));    });  },  render() {    // 获取第一个子元素的 vnode    const slot = this.$slots.default;    const vnode: VNode = getFirstComponentChild(slot);    const componentOptions: ?VNodeComponentOptions =      vnode && vnode.componentOptions;    if (componentOptions) {      // name 不在 inlcude 中或者在 exlude 中则直接返回 vnode，否则继续进行下一步      // check pattern      const name: ?string = getComponentName(componentOptions);      const { include, exclude } = this;      if (        // not included        (include && (!name || !matches(include, name))) ||        // excluded        (exclude && name && matches(exclude, name))      ) {        return vnode;      }            const { cache, keys } = this;      // 获取键，优先获取组件的 name 字段，否则是组件的 tag      const key: ?string =        vnode.key == null          ? // same constructor may get registered as different local components            // so cid alone is not enough (#3269)            componentOptions.Ctor.cid +            (componentOptions.tag ? `::${componentOptions.tag}` : "")          : vnode.key;              // --------------------------------------------------      // 下面就是 LRU 算法了，      // 如果在缓存里有则调整，      // 没有则放入（长度超过 max，则淘汰最近没有访问的）      // --------------------------------------------------      // 如果命中缓存，则从缓存中获取 vnode 的组件实例，并且调整 key 的顺序放入 keys 数组的末尾      if (cache[key]) {        vnode.componentInstance = cache[key].componentInstance;        // make current key freshest        remove(keys, key);        keys.push(key);      }      // 如果没有命中缓存,就把 vnode 放进缓存      else {        cache[key] = vnode;        keys.push(key);        // prune oldest entry        // 如果配置了 max 并且缓存的长度超过了 this.max，还要从缓存中删除第一个        if (this.max && keys.length > parseInt(this.max)) {          pruneCacheEntry(cache, keys[0], keys, this._vnode);        }      }            // keepAlive标记位      vnode.data.keepAlive = true;    }    return vnode || (slot && slot[0]);  }};// 移除 key 缓存function pruneCacheEntry (  cache: VNodeCache,  key: string,  keys: Array<string>,  current?: VNode) {  const cached = cache[key]  if (cached && (!current || cached.tag !== current.tag)) {    cached.componentInstance.$destroy()  }  cache[key] = null  remove(keys, key)}// remove 方法（shared/util.js）/** * Remove an item from an array. */export function remove (arr: Array<any>, item: any): Array<any> | void {  if (arr.length) {    const index = arr.indexOf(item)    if (index > -1) {      return arr.splice(index, 1)    }  }}
```

keep-alive 源码路径

在 `keep-alive` 缓存超过 `max` 时，使用的缓存淘汰算法就是 LRU 算法，它在实现的过程中用到了 `cache` 对象用于保存缓存的组件实例及 `key` 值，`keys` 数组用于保存缓存组件的 `key` ，当 `keep-alive` 中渲染一个需要缓存的实例时：

*   判断缓存中是否已缓存了该实例，缓存了则直接获取，并调整 `key` 在 `keys` 中的位置（移除 `keys` 中 `key` ，并放入 `keys` 数组的最后一位）
    
*   如果没有缓存，则缓存该实例，若 `keys` 的长度大于 `max` （缓存长度超过上限），则移除 `keys[0]` 缓存
    

下面我们来自己实现一个 LRU 算法吧⛽️⛽️⛽️

##### 基础解法：类 vue keep-alive 实现（数组 + 对象实现）

```
var LRUCache = function(capacity) {    this.keys = []    this.cache = Object.create(null)    this.capacity = capacity};LRUCache.prototype.get = function(key) {    if(this.cache[key]) {        // 调整位置        remove(this.keys, key)        this.keys.push(key)        return this.cache[key]    }    return -1};LRUCache.prototype.put = function(key, value) {    if(this.cache[key]) {        // 存在即更新        this.cache[key] = value        remove(this.keys, key)        this.keys.push(key)    } else {        // 不存在即加入        this.keys.push(key)        this.cache[key] = value        // 判断缓存是否已超过最大值        if(this.keys.length > this.capacity) {            removeCache(this.cache, this.keys, this.keys[0])        }    }};// 移除 keyfunction remove(arr, key) {    if (arr.length) {        const index = arr.indexOf(key)        if (index > -1) {            return arr.splice(index, 1)        }    }}// 移除缓存中 keyfunction removeCache(cache, keys, key) {    cache[key] = null    remove(keys, key)}
```

#### 2. 进阶：Map

利用 Map 既能保存键值对，并且能够记住键的原始插入顺序

```
var LRUCache = function(capacity) {    this.cache = new Map()    this.capacity = capacity}LRUCache.prototype.get = function(key) {    if (this.cache.has(key)) {        // 存在即更新        let temp = this.cache.get(key)        this.cache.delete(key)        this.cache.set(key, temp)        return temp    }    return -1}LRUCache.prototype.put = function(key, value) {    if (this.cache.has(key)) {        // 存在即更新（删除后加入）        this.cache.delete(key)    } else if (this.cache.size >= this.capacity) {        // 不存在即加入        // 缓存超过最大值，则移除最近没有使用的        this.cache.delete(this.cache.keys().next().value)    }    this.cache.set(key, value)}
```

来自：https://github.com/sisterAn/JavaScript-Algorithms

最后
--

欢迎关注「三分钟学前端」，回复「交流」自动加入前端三分钟进阶群，每日一道编程算法面试题（含解答），助力你成为更优秀的前端开发！

![](https://mmbiz.qpic.cn/mmbiz_gif/bwG40XYiaOKmibEL4rxRMd1XEbhsGicGUHAkkLAic8NcbuXRibfqgHian9Ckl9dbRPzP72SoHTe9qDqzhWYRSJT2DQUg/640?wx_fmt=gif)

》》面试官也在看的前端面试资料《《

“在看和转发” 就是最大的支持