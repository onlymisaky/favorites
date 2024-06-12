> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/crIqANQ4ThC_lIy-Pnt6kA)

```
大厂技术  高级前端  Node进阶

点击上方 程序员成长指北，关注公众号

回复1，加入高级Node交流群

```

前言
--

大家好，我是考拉🐨

背景

背景是这样的，我们使用`vue2`开发一个在线客服使用的 IM 应用，基本布局是左边是访客列表，右边是访客对话，为了让对话加载更友好，我们将对话的路由使用`<keep-alive>`缓存起来。但是如果将所有对话都缓存，未必会造成缓存过多卡顿的问题。自然，就使用上了`<keep-alive>`提供的`max`属性，设置一个缓存对话内容组件上限，按照`LRU`算法，会销毁最旧访问的组件，保留最近使用的组件。本以为美好如期而至，直到上线后翻大车了，真实对话量大了，内存飙升卡顿。后来具体分析内存增长点，通过`vue`的`devtool`查看组件树，发现对话内容组件一直是递增，并非维持在`max`设置的数量上限！各位看官稍安勿躁，下面就具体分析造成这个「大坑」的原理，以及解决它的方案。

情景模拟
----

为了方便模拟背景案例，这里就用`vue2`简单的写一个 demo。对话列表组件 `APP.vue`，点击列表中的某个访客，加载与访客对话内容。

```
<template>
  <div id="app">
    <section class="container">
      <aside class="aside">
        <ul>
          <li :class="{ active: active === index }" v-for="(user, index) in userList" :key="index"
            @click="selectUser(index, user)">
            {{ user.name }}
          </li>
        </ul>
      </aside>
      <section class="main">
        <keep-alive :max="3">
          <chat-content :key="currentUser.id" :user-info="currentUser"></chat-content>
        </keep-alive>
      </section>
    </section>
  </div>
</template>

<script>
import ChatContent from './views/ChatContent.vue';
export default {
  components: {
    ChatContent
  },
  data() {
    return {
      active: -1,
      currentUser: {},
      userList: [{ id: 1, name: "张三" },
      { id: 2, name: "李四" },
      { id: 3, name: "王五" },
      { id: 4, name: "老六" },
      { id: 5, name: "老八" },
      { id: 6, name: "老九" },
    ]
    }
  },
  methods: {
    selectUser(index) {
      this.active = index
      this.currentUser = this.userList[index];
    }
  },
}
</script>


```

这里使用`keep-alive`组件包裹的对话内容组件，需要加上`key`唯一标志，这样才会缓存相同名称（不同`key`）的组件，否则不会缓存。对话内容组件`ChatContent.vue`，简单加一个计数器验证组件缓存了。

```
<template>
  <div>
    <h2>{{ userInfo.name }}</h2>
    <h3>{{ num }}</h3>
    <button @click="increament">+1</button>
  </div>
</template>

<script>
export default {
  props: {
    userInfo: Object,
  },

  data() {
    return {
      num: 0,
    };
  },

  methods: {
    increament() {
      this.num += 1;
    },
  },
};
</script>


```

### 情景模拟结果

实验发现，虽然缓存组件个数上限`max`为 3，实际是逐个缓存了全部内容组件，看来设置`max`属性失效了。![](https://mmbiz.qpic.cn/mmbiz_jpg/TZL4BdZpLdgSvJy6ia7vBxtPuqib2dOuic4Kc1YLdiaFD1tEzMYZWRk4WJmTdldLhEv3aicria4kfcoxbYDHhREMJqpw/640?wx_fmt=other&from=appmsg)

Vue2 中组件实现原理
------------

为什么缓存相同名称的组件，`max`属性会失效呢？这里就要从`Vue2`中`<keep-alive>`组件实现原理来看。

### LRU 算法

*   `vue`会将`VNode`及组件实例（`componentInstance`）存到缓存（`cache`），`cache`是一个`Object`，同时还会维护一个`keys`队列；
    
*   根据`LRU`算法对`cache`和`keys`的管理：当前激活组件已存在缓存中，将组件对应`key`先删除，再插入的方式往前移动；
    
*   当前激活组件没有再缓存中，直接存入缓存，此时判断是否超过了缓存个数上限，如果超过了，使用`pruneCacheEntry`清理`keys`第一个位置（最旧）的组件对应的缓存。
    

```
if (cache[key]) {
  vnode.componentInstance = cache[key].componentInstance;
  // make current key freshest
  remove(keys, key);
  keys.push(key);
} else {
  cache[key] = vnode;
  keys.push(key);
  // prune oldest entry
  if (this.max && keys.length > parseInt(this.max)) {
    
    pruneCacheEntry(cache, keys[0], keys, this._vnode);
    console.log('cache: ', cache)
    console.log('keys: ', keys)
  }
}


```

### 清理缓存函数实现

下面再来看清理缓存函数`pruneCacheEntry`的实现：比对当前传入组件和在缓存中的组件`tag`是否相同，如果不同，就去销毁组件实例，否则不销毁。

```
function pruneCacheEntry (
  cache,
  key,
  keys,
  current
) {
  var cached$$1 = cache[key];
  if (cached$$1 && (!current || cached$$1.tag !== current.tag)) {
    cached$$1.componentInstance.$destroy();
  }
  cache[key] = null;
  remove(keys, key);
}


```

看到这里似乎也没有毛病，究竟是哪里出问题了呢？

### 源码调试发现问题

不妨我们打印一下`cache`（`VNode`缓存）和`keys`![](https://mmbiz.qpic.cn/mmbiz_jpg/TZL4BdZpLdgSvJy6ia7vBxtPuqib2dOuic4Wp84cJNjnSQrIiatR2vgmgmOCl0RZib5iaFJQJGs7zebpJr5kjVUiaElAA/640?wx_fmt=other&from=appmsg)发现也没什么问题，按照`URL`算法得到正确结果。再看看清理缓存函数里`cached$$1.tag`和`current.tag`的打印![](https://mmbiz.qpic.cn/mmbiz_jpg/TZL4BdZpLdgSvJy6ia7vBxtPuqib2dOuic4d5ajHjym4AkxOwCD2Z2Egd3R3H9yg8JicXw1zJTYvHLC75c4YxQV9Uw/640?wx_fmt=other&from=appmsg)真相了！他两由于组件名称相同，导致相等，没有进入销毁组件实例的判断里，这就是问题来源！为什么针对相同组件名称不去销毁实例呢？可能是为了某些情景下组件复用吧。

解决方案
----

既然问题症结我们已经找到，从源头上去解决问题当然最佳，但是现实是`vue2`源码层面是没有去解决的（`vue3`有解决，这个后面再说），只能从我们应用侧再去想想办法。这里我想到的有两种方案。

### 方案一：剪枝法

维护一个全局状态（比如`vuex`）对话`ids`队列，最大长度为`max`，类似`vue`中`LRU`算法中的`keys`，在组件`activated`钩子函数触发时更新`ids`队列。对话内容组件的子组件判断当前对话`id`是否在`ids`队列中，不在那么就会`v-if`剔除，否则缓存起来，这样很大程度程度上释放缓存。类似剪去树的枝丫，减轻重量，这里叫做「剪枝法」好了。

### 方案二：自定义清理缓存函数

我们不再使用`keep-alive`提供的`max`属性来清理缓存，让其将组件实例全部缓存下来，当前激活组件，`activated`钩子函数触发，此时通过`this.$vnode.parent.componentInstance`获取组件实例，进而可以获取挂载在上面的`cache`和`keys`。这样我们就可以通过`LRU`算法，根据`key`自定义精准清理缓存了。

```
activated() {
  const { cache, keys } = this.$vnode.parent.componentInstance;
  console.log('activated cache: ', cache)
  console.log('activated keys: ', keys)

  let cacheLen = 0
  const max = 3
  Object.keys(cache).forEach(key => {
    if (cache[key]) {
      cacheLen += 1
      if (cacheLen > max) {
        const key = keys.shift()
        cache[key].componentInstance.$destroy()
        cache[key] = null
      }
    }
  })
},

```

vue3 中组件实现原理
------------

### vue3 中 LRU 算法

`vue3`中`LRU`算法实现思路一样，只不过`cache`和`keys`分别使用`Map`和`Set`数据结构实现，数据更干净简洁。

```
const cache = new Map();
const keys = new Set();
// ...
if (cachedVNode) {
    // copy over mounted state
    vnode.el = cachedVNode.el;
    
    // ...
    // make this key the freshest
    keys.delete(key);
    keys.add(key);
}
else {
    keys.add(key);
    // prune oldest entry
    if (max && keys.size > parseInt(max, 10)) {
        pruneCacheEntry(keys.values().next().value);
    }
}


```

![](https://mmbiz.qpic.cn/mmbiz_jpg/TZL4BdZpLdgSvJy6ia7vBxtPuqib2dOuic4F0pKaG1BQUMMIp98TgRZ3YicbBhxQ9nZHVVaTm7v4HvxvmglGtp093w/640?wx_fmt=other&from=appmsg)image.png

### vue3 中清理缓存函数实现

`vue3`中清理组件实例缓存函数也是`pruneCacheEntry`，不同的是，比对当前传入组件和在缓存中的组件`type`是否相同，决定是否销毁组件实例。

```
function pruneCacheEntry(key) {
  const cached = cache.get(key);
  if (!current || cached.type !== current.type) {
      unmount(cached);
  }
  else if (current) {
      // current active instance should no longer be kept-alive.
      // we can't unmount it now but it might be later, so reset its flag now.
      resetShapeFlag(current);
  }
  cache.delete(key);
  keys.delete(key);
}


```

再来看看`cache.type`和`current.type`到底是什么![](https://mmbiz.qpic.cn/mmbiz_jpg/TZL4BdZpLdgSvJy6ia7vBxtPuqib2dOuic44fJuotsPNkv2tiayMQuqf3e6VaNibIAXBA2fjZzL5bJOUvK2OXaasia8A/640?wx_fmt=other&from=appmsg)对比我们会发现，不再是简单的组件名称字符标志，而是一个对象描述，包含了很多属性，因为在初始化组件实例时，会给每个实例加上属性：`props`、`render`、`setup`、`__hmrId`等。

```
function initProps(instance, rawProps, isStateful, isSSR = false) {
  const props = {};
  const attrs = {};
  def(attrs, InternalObjectKey, 1);
  instance.propsDefaults = /* @__PURE__ */ Object.create(null);
  setFullProps(instance, rawProps, props, attrs);
  // ...  
  instance.attrs = attrs;
}
function isInHmrContext(instance) {
  while (instance) {
    if (instance.type.__hmrId)
      return true;
    instance = instance.parent;
  }
}


```

即使是对象中所有属性相同，但是对象不是同一个引用地址，造成`cache.type`和`current.type`不相等，因此会销毁实例对象`unmount(cached)`。以上就是`vue3`对这个问题解决方案。

总结
--

最后，在`vue2`中会出现`<keep-alive>`缓存相同名称组件，`max`失效的问题，推荐使用自定义清理缓存函数，在获取组件实例基础上，对缓存实例销毁。下图是我在真实项目中优化的成果。完~![](https://mmbiz.qpic.cn/mmbiz_jpg/TZL4BdZpLdgSvJy6ia7vBxtPuqib2dOuic4WpCQAmQdLL0OicmXR80tVYrs7VDMtatpqicK7UYurC3Gic9YrTs60CyHw/640?wx_fmt=other&from=appmsg)

> 作者：wuwhs  
> 链接：https://juejin.cn/post/7170878262061563941  
> 来源：稀土掘金

结语
--

### 

Node 社群  

```
我组建了一个氛围特别好的 Node.js 社群，里面有很多 Node.js小伙伴，如果你对Node.js学习感兴趣的话（后续有计划也可以），我们可以一起进行Node.js相关的交流、学习、共建。下方加 考拉 好友回复「Node」即可。

   “分享、点赞、在看” 支持一下

```