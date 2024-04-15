> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/-aHMCzlI_lP6Ctxg0cU6BQ)

大家好，我是 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf&scene=21#wechat_redirect)。  

相信 `Iterator`（迭代器）这个概念大家并不陌生了，它和数组的概念类似，在 `JavaScript` 中都是用于存储和管理数据集合的机制。

但实际开发中，我们使用数组的场景要远远多于 `Iterator` ，主要原因还是因为 `Iterator` 太难用了，它不像数组一样给我们提供了很多便捷的高阶函数（如 map、filter 等） 。

`Iterator helpers` 提案正式出来解决这个问题的，它已经有几年时间了，目前处于 `Stage3` 阶段。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdRZoENogesibbqS0ibvj9V4owguUTTbbF2psU9oalicIRgmYTMJun6ZgcMk6EheXLia600oIlVKjnXticQ/640?wx_fmt=png&from=appmsg)

`Iterator helpers` 提供了一整套方法，使得迭代器的操作变得像数组一样简单。它允许你可以以链式调用的方式来组合方法，比如可以先用 `.map()` 处理数据，紧接着用 `.filter()` 筛选出需要的部分，最后用 `.toArray()` 将其转换成数组。

最近在 `V8 12.2/Chrome 122` 中，`Iterator helpers` 已经正式获得了支持。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdRZoENogesibbqS0ibvj9V4owCibjZ5BTNwX8aiaicGspKsVt6EltS8BMTQ0MkkBrBf6HJfIGkJFickAK7Q/640?wx_fmt=png&from=appmsg)

在开始介绍之前，我们先看看 `Iterator` 和数组的区别，再实际开发中，我们在什么场景下更适合使用 `Iterator` 。

`Iterator` 和数组的对比
-----------------

1.  **计算模式：**
    

*   **数组是静态的：** 数组在创建时就包含了一个固定大小的数据集合。你可以立即访问数组的任何元素，因为它们都是预先存储在内存中的。
    
*   **迭代器是惰性的（Lazy）：** `Iterator` 不必一开始就拥有所有的数据。它每次调用 `next()` 方法时才计算出下一个值。这意味着它可以表示无限的数据序列，并且可以按需产生数据，而不需要一开始就将所有数据加载到内存中。
    

3.  **性能和内存占用：**
    

*   **数组可能占用更多内存：** 因为需要预先存储所有元素。
    
*   **迭代器更高效：** 它们可以在不占用大量内存的情况下，遍历巨大的甚至是无限的数据集。
    

5.  **使用场景的不同：**
    

*   **数组用于存储元素集：** 当你需要随机访问、多次遍历或者需要大量的数据操作时，使用数组是比较好的选择。
    
*   **迭代器用于遍历元素：** 当数据集不需要一次性全部存储在内存中，或者希望按需计算每个值时，迭代器更为合适。
    

那么为啥有了使有了数组，我们还要还要用到 `Iterator` 呢？

*   **对于巨大或不确定大小的数据集，** 迭代器可以有效地按需处理数据。例如，在处理文件流或网络请求等情况时，使用迭代器可以在数据到达时逐步处理，而不必等待所有数据都准备好。
    
*   **基于顺序的操作和管道（Pipelines）：** 当数据需要一系列的操作来转换时，迭代器使得这些转换可以按顺序进行，这类似于函数式编程中的管道机制。
    

实际开发中，下面这些可能会是使用到 `Iterator` 的例子：

*   **处理大型数据集：** 当你需要处理大量数据时，比如从数据库读取数百万条记录，使用迭代器可以避免一次性将所有数据加载到内存中。
    
*   **与生成器配合进行复杂计算：** 生成器提供了一种方便编写迭代逻辑的方法，当计算每个值代价昂贵或需要保持状态时，它们非常有用。
    
*   **异步操作：** 在处理异步数据流，如读取网络资源时，异步迭代器使得按顺序处理异步事件成为可能。
    
*   **前端框架和库：** 许多现代前端框架和库利用迭代器来处理或渲染列表和组件，提供更高效的数据更新和渲染策略。
    

聊完了 `Iterator` 和数组的区别，我们下面来看看 `Iterator helpers` 都提供了哪些方法？

.map(mapperFn)
--------------

类似数组的 `map` 方法，`map` 方法接受一个映射函数作为参数，在函数中我们可以对原本的参数进行处理，最中返回一个新的迭代器：

```
// 从博客存档页面中选择博客文章列表const posts = document.querySelectorAll('li:not(header li)');// 获取文章列表，返回他们的文本内容（标题）列表并且输出。for (const post of posts.values().map((x) => x.textContent)) {  console.log(post);}
```

.filter(filtererFn)
-------------------

类似数组的 `filter` 方法，`filter` 方法接受一个过滤器函数作为参数，根据我们自定义的逻辑过滤掉一些不需要的元素，然后返回一个新的迭代器。

```
// 从博客存档页面中选择博客文章列表const posts = document.querySelectorAll('li:not(header li)');// 过滤出包含 `ConardLi` 的博客文章的文本内容（标题），并在控制台输出它们。for (const post of posts.values().filter((x) => x.textContent.includes('ConardLi'))) {  console.log(post);}
```

.take(limit)
------------

`take` 方法接受一个整数作为参数，返回一个迭代器中前几个参数组成的新的迭代器。

```
// 从博客存档页面中选择博客文章列表const posts = document.querySelectorAll('li:not(header li)');// 选择最近的 17 篇博客文章，并在控制台输出它们。for (const post of posts.values().take(17)) {  console.log(post);}
```

.drop(limit)
------------

`drop` 方法接受一个整数作为参数，返回从原始迭代器中排除前 n 个元素后的新的的迭代器。

```
// 从博客存档页面中选择博客文章列表const posts = document.querySelectorAll('li:not(header li)');// 排除最近的 17 篇博客文章，打印新的迭代器for (const post of posts.values().drop(17)) {  console.log(post);}
```

.flatMap(mapperFn)
------------------

`flatMap()` 方法可以看作是 `map()` 和 `flat()` 的结合体。

首先，`map()` 方法会遍历迭代器的每个元素，并将元素通过一个函数进行处理，最后返回一个新的迭代器。然后，`flat()` 方法可以用来展平迭代器，也就迭代器迭代器的维度。将二维迭代器变为一维迭代器迭代器。

```
// 从博客存档页面中选择博客文章列表const posts = document.querySelectorAll('li:not(header li)');// 获取每篇博客文章的标签列表，并且拍平后返回for (const tag of posts.values().flatMap((x) => x.querySelectorAll('.tag').values())) {    console.log(tag.textContent);}
```

.reduce(reducer [, initialValue])
---------------------------------

`reduce` 方法接受一个 `reducer` 函数以及一个可选的初始值作为参数。

`"reducer"` 函数有两个参数：累积器和当前值。在每次迭代中，累积器的值是上一次调用 "reducer" 函数的结果，当前值则是数组中正在处理的元素。

```
// 从博客存档页面中选择博客文章列表const posts = document.querySelectorAll('li:not(header li)');// 获取所有文章的标签列表。const tagLists = posts.values().flatMap((x) => x.querySelectorAll('.tag').values());// 获取列表中每个标签的文本内容。const tags = tagLists.map((x) => x.textContent);// 统计带有 ConardLi 标签的文章数。const count = tags.reduce((sum , value) => sum + (value === 'ConardLi' ? 1 : 0), 0);console.log(count);
```

.toArray()
----------

`toArray()` 方法可以将迭代器的值转换为一个数组。

```
// 从博客存档页面中选择博客文章列表const posts = document.querySelectorAll('li:not(header li)');// 从最近的10篇博客文章列表中创建一个数组。const arr = posts.values().take(10).toArray();
```

.forEach(fn)
------------

类似数组的 `forEach()`  方法，`forEach()` 方法接受一个函数作为参数，然后在迭代器的每一个元素上调用这个函数。这个函数执行的是带有副作用的操作，会改变原本的迭代器，它不返回任何值。

```
// 从博客存档页面中选择博客文章列表const posts = document.querySelectorAll('li:not(header li)');// 获取发布了至少一篇博客文章的日期并记录下来。const dates = new Set();const forEach = posts.values().forEach((x) => dates.add(x.querySelector('time')));console.log(dates);
```

.some(fn)
---------

类似数组的 `some()` 方法，`some()` 方法接受一个断言函数作为参数。如果在应用该函数后，有任何一个迭代器的元素返回 `true`，那么这个方法就会返回 `true`。

```
// 从博客存档页面中选择博客文章列表const posts = document.querySelectorAll('li:not(header li)');// 查找任何博客文章的文本内容（标题）是否包含 `ConardLi` 关键字。posts.values().some((x) => x.textContent.includes('ConardLi'));
```

.every(fn)
----------

类似数组的 `every()` 方法，`every()` 方法接受一个断言函数作为参数。如果在应用该函数后，迭代器的每个元素都返回 `true`，那么这个方法就会返回 `true`。

```
// 从博客存档页面中选择博客文章列表const posts = document.querySelectorAll('li:not(header li)');// 检查所有博客文章的文本内容（标题）是否全部包含 `ConardLi` 关键词。posts.values().every((x) => x.textContent.includes('ConardLi'));
```

.find(fn)
---------

类似数组的 `find()` 方法，`find()` 方法接受一个断言函数作为参数。然后其会返回迭代器中第一个使函数返回 `true` 的元素，如果没有任何一个元素满足条件，那么返回 `undefined`。

```
// 从博客存档页面中选择博客文章列表const posts = document.querySelectorAll('li:not(header li)');// 打印最新的博客文章中包含 `ConardLi` 关键词的文本内容（标题）。console.log(posts.values().find((x) => x.textContent.includes('ConardLi')).textContent);
```

Iterator.from(object)
---------------------

`from()` 是一个静态方法，接受一个对象作为参数。如果该对象已经是迭代器的实例，那么这个方法会直接返回它。如果该对象具有 `Symbol.iterator` 属性，意味着它是可迭代的，那么就会调用它的 `Symbol.iterator` 方法来获取迭代器，并由此方法返回。否则，会创建一个新的迭代器对象（该对象从 `Iterator.prototype` 继承并具有 `next()` 和 `return()` 方法），该对象包装了这个对象并由此方法返回。

```
// 从博客存档页面中选择博客文章列表const posts = document.querySelectorAll('li:not(header li)');// 首先从帖子中创建一个迭代器。然后，记录包含 `ConardLi` 关键词的最新博客文章的文本内容（标题）。console.log(Iterator.from(posts).find((x) => x.textContent.includes('ConardLi')).textContent);
```

最后
--

抖音前端架构团队目前放出不少新的 HC ，又看起会的小伙伴可以看看这篇文章：[抖音前端架构团队正在寻找人才！FE/Client/Server/QA](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247499434&idx=1&sn=8c7497876efc458dca19b6f6a27cadd4&chksm=c2e10b81f5968297533fcfced9ebad6eba072f6436bf040eaa8920256577258ef1077d1f122a&token=1091255868&lang=zh_CN&scene=21#wechat_redirect)

> 如果你想加入高质量前端交流群，或者你有任何其他事情想和我交流也可以添加我的个人微信 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf&scene=21#wechat_redirect) 。

`点赞`和`在看`是最大的支持⬇️❤️⬇️