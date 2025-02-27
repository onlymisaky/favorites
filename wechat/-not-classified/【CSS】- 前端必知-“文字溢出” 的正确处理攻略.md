> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/7eiBd-nuaLD90ArWzael6Q)

**前言：** 最近在项目中需要做到类似于 **Mac** 下这种，当屏幕宽度足以容下当前文件名称的时候，文件名称全部展示，不做省略。

![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQQD0RqvbwqHCP7q0C1MhicRyB85kcXgJzcIK0tuiaz7icTQr9qdic3XWqVCfxNyUnZkAaG2V0C1gCt5pg/640?wx_fmt=jpeg&wxfrom=13&tp=wxpic)  
然而当用户缩放浏览器显示的尺寸时，我们需要做到省略中间的文字，选择保留后缀这种方案。如下图所示：  
![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQQD0RqvbwqHCP7q0C1MhicRyUREw7h6YhXMHeyrVQw8GK3wPpZhiarNpLA0VTz3hsL7AqTpcgdQygsQ/640?wx_fmt=jpeg&wxfrom=13&tp=wxpic)

我个人也是感觉这个方案是最好的，因为大部分情况下，用户更关心的是这个文件的类型，而后缀名的保留往往是最佳的选择。我个人也查阅了很多相关文章，并且借鉴了一些已有轮子的代码思路，实现了一个符合我们项目中需求的一个组件。

* * *

一. 组件效果预览
---------

1.  单行文字溢出时自动省略，并且**不保留**后缀。  
    ![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQQD0RqvbwqHCP7q0C1MhicRyaF3wx1RdB4icI6MlIibNzUib3dkszc2kbmsc9ys7VFCz93NWs6hzTv4zw/640?wx_fmt=jpeg&tp=wxpic&wxfrom=5&wx_lazy=1&wx_co=1)
    
2.  单行文字溢出时自动省略，并且**保留**后缀。  
    ![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQQD0RqvbwqHCP7q0C1MhicRyWHMUOwhcFxEXSEzyA9FHglnbwsAUTPbo3JHwvVvgWzp1MJX88FOP9Q/640?wx_fmt=jpeg&tp=wxpic&wxfrom=5&wx_lazy=1&wx_co=1)
    
3.  多行文字溢出时，然后再开始省略。这个情况是我们项目中比较特殊的场景。简单来说就是假设我现在想让文字显示**两行**，如果**两行**的时候没有溢出，那么正常显示。如果两行情况下还是溢出了，那么我再去处理溢出的文字。假设这是没有做任何操作的的效果:  
    ![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQQD0RqvbwqHCP7q0C1MhicRyRSib8lWZHhb8eOvx0nYp5Ely8x3SQwGE1B8fYA1XiciatAsx0abUiaGJkg/640?wx_fmt=jpeg&tp=wxpic&wxfrom=5&wx_lazy=1&wx_co=1)  
    使用我们的组件以后的效果：  
    ![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQQD0RqvbwqHCP7q0C1MhicRycvdUEajCfwGrs46qN2Kt4ArsfzjBUsf5Ykia7kh72nmO6kcO9HWXFcQ/640?wx_fmt=jpeg&tp=wxpic&wxfrom=5&wx_lazy=1&wx_co=1)  
    **（tips：不一定必须是两行，三行，四行都是可以的。我们接下来实现的组件会让你高度自定义去处理文字溢出的场景。）**
    
4.  如果你想自己先尝试一下效果，那么你可以快速使用 **npm** 安装一下。
    
    原仓库地址：🫱AutoEllipsisTxt 自动省略文字 [2]
    

*   `npm i auto-ellipsis-text`
    
*   `pnpm i auto-ellipsis-text`
    
*   `yarn add auto-ellipsis-text`
    

6.  使用起来也非常简单，你只需要包裹住你的文字即可![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQQD0RqvbwqHCP7q0C1MhicRyXIWonia7FYet5sUdSdY6N6icZTreHDfia2YhC0c5diaV0kHXaGibBSwIH6Q/640?wx_fmt=jpeg&tp=wxpic&wxfrom=5&wx_lazy=1&wx_co=1)![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQQD0RqvbwqHCP7q0C1MhicRyyd2mDJwT6icbFib8Cb2HR4WOAbygRRMfM8PeLwx43gFSicXnkeUlOlUjQ/640?wx_fmt=jpeg&tp=wxpic&wxfrom=5&wx_lazy=1&wx_co=1)
    
7.  话回正题，接下来我会一步一步讲解我实现这个组件的思路，我写的这个组件不一定是最优的，你需要做到**知其然并知其所以然**，然后完善我写的组件的不足之处，你可以实现自己的**自动省略文本方案**，才是本文的目的。
    

二. 单行溢出的处理
----------

1.  我们先只考虑**单行**的情况。通常我们在自己的应用中展示很多文件信息的时候，往往选择的布局方式就是高度是一定的，说白了就是高度其实我们是定死的，宽度我们不确定，因为用户有可能会在某些情况下拖动浏览器，造成宽度发生变化，但是总会给宽度一个**最小值**和一个**最大值**来保障排版的统一性。  
    ![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQQD0RqvbwqHCP7q0C1MhicRyDAo3StP8eZ6PXPGZSlFTtCjRROBeAszu7gicl1svvz6sGjxJkdeka0w/640?wx_fmt=jpeg&tp=wxpic&wxfrom=5&wx_lazy=1&wx_co=1)
    
2.  样式方面，在这里我使用的是 `UnoCSS` ，将样式內联在了标签里，如果你还不了解这种写法，你可以点击下方的文章学习。不过即使你之前从未了解过 `UnoCSS` ，也不会影响你下面的阅读，因为样式不是本文的重点，并不影响整体阅读。  
    🫱手把手教你如何创建一个代码仓库 [3]
    
3.  让我们先创造一个简单的溢出场景，代码很简单，容器是一个 **width** 最大值为 **200px**，**height** 为固定 **30px** 的 **div**。  
    ![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQQD0RqvbwqHCP7q0C1MhicRy7schw7ogNR7h3wMSQSusHicH4P32q9sy44jWibk4Oxvp10x1vUyh5Ypg/640?wx_fmt=jpeg&tp=wxpic&wxfrom=5&wx_lazy=1&wx_co=1)  
    现在页面上的效果如下图：  
    ![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQQD0RqvbwqHCP7q0C1MhicRywibXIqxKmeDQXaWZb1rSrjeqh8a8DIyPiaLDfibVwgmVmhOpK6HMLubQw/640?wx_fmt=jpeg&tp=wxpic&wxfrom=5&wx_lazy=1&wx_co=1)
    
4.  可以很清晰的看出，由于我们文字在容器内放不下，但是我们又没对**溢出**这一特殊场景做出处理，所以就造成了当前页面的效果。先别急，我们一步一步来。
    
5.  最开始我去查阅 **MDN** 的时候，查阅到了一个 **“确认过眼神，你就是我要找到人”** 的属性。  
    ![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQQD0RqvbwqHCP7q0C1MhicRydtqVCUJuPe7PZeWeJIbbRzLQ02DI86KQx4MVeXQjHTsvqKibR1nf3MA/640?wx_fmt=jpeg&tp=wxpic&wxfrom=5&wx_lazy=1&wx_co=1)
    
6.  什么？**text-overflow**，我们要找到不就是文字溢出时候的处理吗？我兴奋的赶快添加到了我的组件上。  
    ![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQQD0RqvbwqHCP7q0C1MhicRy3wWKmjTYcOibJ5A4MTzMo0QIncTcyhmBvY4ibseLBeuXqib1XIyHOrQvw/640?wx_fmt=jpeg&tp=wxpic&wxfrom=5&wx_lazy=1&wx_co=1)  
    效果如下：  
    ![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQQD0RqvbwqHCP7q0C1MhicRyV5VE6grrOpAicEMrictOJJmTSH1JMBWOdicyDn8MdpVZXWic4X9wsY8kaA/640?wx_fmt=jpeg&tp=wxpic&wxfrom=5&wx_lazy=1&wx_co=1)  
    然后看着毫无变化的页面，开始怀疑我自己是不是单词拼错了，然后一个字母字母的比对，排除了单词打错字的情况，但页面还是没有变化。🤔
    
7.  于是我又返回 **MDN** 去查看自己是否遗漏了哪些东西，发现了这样一段文字。  
    ![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQQD0RqvbwqHCP7q0C1MhicRyfZ7wLx1OGfcZPpgp1VI62ClZfL8T6M2q39tqpdEzavJKs9XAyNlwmw/640?wx_fmt=jpeg&tp=wxpic&wxfrom=5&wx_lazy=1&wx_co=1)  
    这里直接说结论，其实 **text-overflow** 这个属性不会为了让文字省略而去创造省略的场景。它其实是在你处理过**溢出**场景之后，帮你做对于**文字溢出**的的二次特殊处理。当你对于页面溢出做没有任何操作时，这个属性其实是无效的。**（注意：它仅仅只处理文字溢出的场景。）**
    
8.  既然你说了，让我们添加额外的属性：`overflow-hidden` 和 `white-space`，那么我们就自己添加。我们先只添加一个 `overflow-hidden` 来看看会发生什么。  
    ![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQQD0RqvbwqHCP7q0C1MhicRyvDD7iaBSj2O4y16iawfLMD0QJG4d16icUowiaNibJ5iaXkdDvicVjhxn5TjkA/640?wx_fmt=jpeg&tp=wxpic&wxfrom=5&wx_lazy=1&wx_co=1)  
    我们发现，下面多出去的文字倒是被省略了，但是我们的省略号呢？？我就不卖官子了，其实造成这个的原因的答案就是下面这句话:  
    ![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQQD0RqvbwqHCP7q0C1MhicRy888ja2hqFwdAtqN8U7zZytMv4rrXqNMAxM8M8OXVtodFLcQFRMUMfQ/640?wx_fmt=jpeg&tp=wxpic&wxfrom=5&wx_lazy=1&wx_co=1)
    
9.  我们仔细看上面我们溢出的场景。  
    ![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQQD0RqvbwqHCP7q0C1MhicRywriatu0NWGlW2CLIeexQVQfZbd07fZWf2SIfRFW8CayVqcCSbDONVdw/640?wx_fmt=jpeg&tp=wxpic&wxfrom=5&wx_lazy=1&wx_co=1)  
    我们下面两行文字其实是**溢出**在了**盒子下方**，正好对应了上面 `text-overflow` 的介绍，**“无法在盒子下面溢出”** 这句话。
    
10.  在这里我们就需要制造一个让**文字强制不换行**的场景。那么就需要用到我们另外一个十分重要的属性，`white-space`。  
    ![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQQD0RqvbwqHCP7q0C1MhicRy7mQPyyKwMuHdSZsiaCGKIBIVKsd2gAPurVzCcSejxGtvo20qww9JtBg/640?wx_fmt=jpeg&tp=wxpic&wxfrom=5&wx_lazy=1&wx_co=1)  
    我们本节只需要关系 `nowrap` 这一个值即可。剩下的值如果读者有兴趣可以自行了解，我们不过多解释。
    
11.  首先你要知道，其实我们 **web** 页面的换行，并不是毫无意义的自己就换行了，而是都有一个隐藏的换行符，你可以把这个隐藏的换行符浅浅的理解为 `white-space(空格)`。  
    ![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQQD0RqvbwqHCP7q0C1MhicRybzW913MCfmM8oibQcsXHgrrjz9bHlSh7mLkbeEUU4GZWr88ASey9bGQ/640?wx_fmt=jpeg&tp=wxpic&wxfrom=5&wx_lazy=1&wx_co=1)
    
12.  理解了上面那段话，那我们的属性 `white-space:nowrap` 的中文含义就十分明显了。`white-space`对应**空格**，`no-wrap` 代表不换行。连起来的意思就是，遇到**空格不换行**。而我们的换行其实有一个隐藏的 `white-space` ，那么我们添加这个属性以后，就会造成一个不会换行的场景。
    
13.  让我们先把 `text-ellipsis` 和 `overflow-hidden` 属性删除，只添加 `white-space:nowrap` 看看页面效果会是怎么样。  
    ![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQQD0RqvbwqHCP7q0C1MhicRysxibjnaHIDQIU9wjYQSWnBXw8Pvtm8LQqpKOhCBb1iahelVETa9tYHmA/640?wx_fmt=jpeg&tp=wxpic&wxfrom=5&wx_lazy=1&wx_co=1)  
    效果如下：  
    ![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQQD0RqvbwqHCP7q0C1MhicRynYbgoGPk082xRJwGkpDtIsR5gfMAtuLIxBoDb4Agbndic4XEJwc5fAQ/640?wx_fmt=jpeg&tp=wxpic&wxfrom=5&wx_lazy=1&wx_co=1)  
    可以看到，我们省略了那个隐藏的**换行符**，所以文字不会自动换行了，那么整段文字都显示到了一行上。此时我们再加上我们的两个属性，`overflow-hidden` 和 `text-ellipsis`，神奇的一幕就发生了。  
    ![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQQD0RqvbwqHCP7q0C1MhicRyHlxiaXWIhD0AgFtTnWsBKvYic31ootPc1JbLj7MxFKontV9kw3HDqEyQ/640?wx_fmt=jpeg&tp=wxpic&wxfrom=5&wx_lazy=1&wx_co=1)  
    我们仅仅只使用了几个 **CSS** 属性就完成了单行情况下**不保留后缀**的文字溢出处理。
    

三. 前期准备
-------

首先你需要准备一个 `autoEllipsis.vue` 文件，首先写出下面的代码，来和我一起完成这个组件。

```
<template>
  <div id="autoEllipsisWrapper" ref="container" v-bind="$attrs">
<span ref="text">
  <slot />
</span>
  </div>
</template>

```

1.  请注意这个 **id** 叫做 `container` 的 **div** 元素将在接下来的内容中起到至关重要的作用。
    
2.  接下来使用 `ref` 分别去拿到这两个 **dom** 元素。  
    ![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQQD0RqvbwqHCP7q0C1MhicRydc7YdjPzyQuBsHg5Pyw5rK0CNqDlxjdjictZic4DFKgEzOA3Ckb9FjOA/640?wx_fmt=jpeg&tp=wxpic&wxfrom=5&wx_lazy=1&wx_co=1)
    
3.  最后我们需要设计一个函数，在组件挂载以后，让它去正确处理我们文字溢出的场景。  
    ![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQQD0RqvbwqHCP7q0C1MhicRyoHoBXd2MZZnZpflNXPWptFysiaddv3b8UMyL223wWQHibSAwIcPPoFsA/640?wx_fmt=jpeg&tp=wxpic&wxfrom=5&wx_lazy=1&wx_co=1)
    
4.  接下来的需求就是，这个 `autoEllipsis` 函数如何去实现。别着急写代码，我知道你现在有可能还是一头雾水无从下手，让我先带你理清思路然后再开始写代码。
    

四. 理清思路
-------

1.  首先我们因为要做到通用性所以， `container` 的宽度是不能确定的，它的宽度需要根据它外层的父元素来决定，也就是上文中我们提到的有一个最大值最小值宽度的元素。  
    ![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQQD0RqvbwqHCP7q0C1MhicRyDkKMyEXdRPON5ZNCws5qocpXOvT7rSc3ZYJRBla3pe5ibRDmdoVtG0w/640?wx_fmt=jpeg&tp=wxpic&wxfrom=5&wx_lazy=1&wx_co=1)  
    换句话说，我们这个 **container** 要去动态的拿到外层父元素的宽度。
    
2.  我们先不讲代码如何实现，我们假设现在我们已经拿到了，就叫做 `fatherWidth`。然后我们再通过刚刚的 `ref` 获取到的 `text` **dom** 元素去拿到外面传进来的文字内容。通过拿到这个 `span` 元素的 **offsetWidth** ，就可以拿到文字的长度。通过判断文字的 **offsetWidth** 是否大于 **fatherWidth** 。然后我们通过两个**宽度**相减，可以得出我们到底溢出的文字宽度为多少。  
    ![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQQD0RqvbwqHCP7q0C1MhicRyEsDjPMTZAgdj0FooRibOyPXcstcGJechj47yN3s9usu8cbZl4OCJajA/640?wx_fmt=jpeg&tp=wxpic&wxfrom=5&wx_lazy=1&wx_co=1)
    
3.  拿到溢出的宽度以后，那么我们就可以用溢出宽度来除以文字大小，**(overWidth/fontSize)** ，就可以算出我们到底溢出了多少文字。
    
4.  假设现在我们现在**溢出**宽度为 **200px**。我们的文字大小为 `20px`，那么 **200/20** 就算出我们现在溢出了 **10** 个字。
    
5.  我们并且一开始就拿到了总的文字内容，假如我们之前的文字总数为 **30** 个。那么在这个情况下我们屏幕上只展示了 **20** 个文字，因为有 **10** 个字溢出被我们忽略了。
    
6.  到这里之后，我们要做的事情就非常简单了，我们只需要从原来 30 个字的中间开始做切割。一边去掉 5 个，那么此时容器恰好可以容下 20 个字。中间我们再手动加上 **“...”** 省略号不就完美达成了吗？
    
7.  上面想表达的意思用大白话来讲，其实也就是去掉中间的 **10** 个文字，然后随便再找一个字替换成字符串三个点 `...` 。
    

五. 完成 autoEllipsis 函数
---------------------

1.  第一步就是为了拿到我们放入的文字宽度。注释已经写的很清楚了，就不过多赘述。  
    ![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQQD0RqvbwqHCP7q0C1MhicRy5NbTHDA5FvdzZ6vdt1ibl16wYAeMSPAfyhiahtwagnAc18wNt86WEUIA/640?wx_fmt=jpeg&tp=wxpic&wxfrom=5&wx_lazy=1&wx_co=1)
    
2.  然后我们再去拿外面父元素的宽度。此时会出现第一个分支， `container` 的宽度**小于**父元素的宽度，很容易可以猜到现在我们的文字内容是完全可以容纳的，不需要做特殊处理。  
    ![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQQD0RqvbwqHCP7q0C1MhicRyn8sfJjibHN44Ha0jcyJ5ncRCh6X9XlquuR8ILSw6G6hf4oPHDyNd0Aw/640?wx_fmt=jpeg&tp=wxpic&wxfrom=5&wx_lazy=1&wx_co=1)
    
3.  第二个分支，当我们的 **container** 宽度大于了父亲元素的宽度，那么我们可以通过传递 props 来区分是否需要保留后缀，如果不需要保留后缀，我们直接给 `container`设置我们**第二个标题**讲解的知识就 OK 了。  
    ![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQQD0RqvbwqHCP7q0C1MhicRymDeqxS6kwsKCtbL0pRsib9HpAW3ckNaxZsHIlA22xIa98L3Lo6ZoX2Q/640?wx_fmt=jpeg&tp=wxpic&wxfrom=5&wx_lazy=1&wx_co=1)
    

六. 保留后缀的实现
----------

1.  如果看到这里，你还没有正确的保留后缀思路，我建议你重新去观看一下**标题四**，这里我们大致的思路就是为了拿到父元素可以容纳多少文字。  
    ![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQQD0RqvbwqHCP7q0C1MhicRybUGqyLIIxPF68JpGs8gfoXZFzPrhxXCIic7ibxgneCnBG2yLZ2dQlOzA/640?wx_fmt=jpeg&tp=wxpic&wxfrom=5&wx_lazy=1&wx_co=1)
    
2.  这里我们的思路其实就是计算出得出我们**需要删除多少个文字**。  
    ![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQQD0RqvbwqHCP7q0C1MhicRyaz3ZxPsqeQ8SA22xphh0CTqsC7nv9tIw78A3dxZibV3dDUUTOQVeoicw/640?wx_fmt=jpeg&tp=wxpic&wxfrom=5&wx_lazy=1&wx_co=1)
    
3.  很简单的思路，就是字符串使用 `slice` 切割我们上面计算得出的，两边需要删除多少文字。  
    ![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQQD0RqvbwqHCP7q0C1MhicRyuWpohTxSRrYRljlUhm8fnadljz72RKELRSzomVDqCxphL3lDjORvzw/640?wx_fmt=jpeg&tp=wxpic&wxfrom=5&wx_lazy=1&wx_co=1)
    
4.  最后的关键一步，我们需要把 `container` 的 `white-space` 属性设置为 `normal`，因为我们已经正确的处理了文字数量，现在的 `container` 已经不会溢出了。  
    ![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQQD0RqvbwqHCP7q0C1MhicRy3KKFOsp7XXm3A5EweC9KzOaNBtCcqTd8WeVwybpeiaCuPib7FjOwGXDQ/640?wx_fmt=jpeg&tp=wxpic&wxfrom=5&wx_lazy=1&wx_co=1)
    

七. 源码
-----

下面是本组件的核心代码 `autoEllipsis` 函数的源码

```
function autoEllipsis(container: HTMLElement, textNode: HTMLSpanElement) {
  const str = premitiveText; //1.拿到的所有文字信息
  textNode.textContent = str; //2.将所有文字放入到我们的 span 标签中
  container.style.whiteSpace = "nowrap"; //3.先将文字全部放入到《一行》中，为了计算整体宽度
  container.style.width = "fit-content"; //4. 给 container 设置 fit-content 属性，就可以拿到正确的内容宽度
  const containerWidth = container.clientWidth; //5. 拿到了 container 的宽度

  const parent = container.parentElement; // 拿到外部父元素的宽度
  const parentWidth = parent!.clientWidth || parent!.offsetWidth;
  if (containerWidth <= parentWidth) {
    //如果container 的宽度《小于》父元素的宽度，不做任何处理
    textNode.textContent = str;
    return;
  } else if (cssEntirely.value) {
    container.style.width = parentWidth + "px";
    container.style.whiteSpace = "nowrap";
    container.style.textOverflow = "ellipsis";
    container.style.overflow = "hidden";
    return;
  } else {
    const textWidth = textNode.offsetWidth; //1. 拿到文字节点的宽度
    const strNumer = str.length; //2. 拿到文字的数量
    const avgStrWidth = textWidth / strNumer; //3. 拿到平均每个文字多少宽度
    const canFitStrNumber = Math.floor(
      (parentWidth * props.startEllipsisLine) / avgStrWidth //4. 根据父元素的宽度来计算出可以容纳多少文字
    );

    const shouldDelNumber = strNumer - canFitStrNumber + 1.5; //1. 算出需要删除几个文字（1.5是为了省略号的宽度
    const delEachSide = shouldDelNumber / 2; //2. 因为要保留中间,所以我们不能只从开头删除，也需要从两头删除
    const endLeft = Math.floor(strNumer / 2 - delEachSide); //3. 因为下面要用到 slice 所以需要计算出 index
    const startRight = Math.ceil(strNumer / 2 + delEachSide); //4. 和上面同理

    switch (props.suffix) {
      case true: {
        textNode.textContent =
          str.slice(0, endLeft) + "..." + str.slice(startRight);
        break;
      }
      case false: {
        textNode.textContent = str.slice(0, -shouldDelNumber) + "...";

        break;
      }
    }
    container.style.wordBreak = "break-all";
    container.style.whiteSpace = "normal";
  }
}

复制代码


```

八. 优化点
------

这个组件目前在 `...` 省略号的文字占用上，并不能准确的根据文字大小调整所需的字数。也就是下面的 **1.5** 这个数字无法精确的算出，但是目前我们项目的文字大小是确定的，所以我也就没有再优化了，还希望各位可以提交 **Pr** 来一起完善这个组件。  
![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQQD0RqvbwqHCP7q0C1MhicRyjp5q5GpCfxAe0xiaicELgak3HFIG3RrHuaxDEQRzaKD5ydVJiaxKiaicHfg/640?wx_fmt=jpeg&tp=wxpic&wxfrom=5&wx_lazy=1&wx_co=1)

原仓库地址：🫱AutoEllipsisTxt 自动省略文字 [4] https://github.com/hanzhenfang/auto-ellipsis-text

关于本文  

作者：韩振方
======

https://juejin.cn/post/7218411904699924540