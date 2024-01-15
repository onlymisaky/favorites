> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/N9Myz7iCM90Eah-4p3ksgg)

> **模拟面试、简历指导、入职指导、项目指导、答疑解惑**可私信找我~ 已帮助 100 + 名同学完成改造！

前言
--

大家好，我是林三心，用最通俗易懂的话讲最难的知识点是我的座右铭，基础是进阶的前提是我的初心~

普通的场景
-----

最近在做 Vue3 项目的时候，在思考一个小问题，其实是每个人都做过的一个场景，很简单，看下方代码

![](https://mmbiz.qpic.cn/mmbiz_png/TZL4BdZpLdg39ibRibbA1iavtrfyO6DiaAy4WialCruHibA4IQWIibNNO5EY3vZAEUfkNrE2Xb3DKqpeS6GRodvXlhXyw/640?wx_fmt=png&from=appmsg)

其实就是一个普通的不能再普通的循环遍历渲染的案例，咱们往下接着看，如果这样的遍历在同一个组件里出现了很多次，比如下方代码

![](https://mmbiz.qpic.cn/mmbiz_png/TZL4BdZpLdg39ibRibbA1iavtrfyO6DiaAy4JLqDKv0ZfsYLSwE7UOXmjvibLomrkydjClgice6LCR7DCswam3R0Mz6A/640?wx_fmt=png&from=appmsg)

这个时候我们应该咋办呢？诶！很多人很快就能想出来了，那就是把循环的项抽取出来成一个组件，这样就能减少很多代码量了，比如我抽取成 Item.vue 这个组件

![](https://mmbiz.qpic.cn/mmbiz_png/TZL4BdZpLdg39ibRibbA1iavtrfyO6DiaAy4lhibaWwhIx5Ew9VDlfWbBibicdiaicgIicI2ibibQoTOXUbEXmwAVcjNWDGFXA/640?wx_fmt=png&from=appmsg)

然后直接可以引用并使用它，这样大大减少了代码量，并且统一管理，提高代码可维护性！！！

![](https://mmbiz.qpic.cn/mmbiz_png/TZL4BdZpLdg39ibRibbA1iavtrfyO6DiaAy40fAPDCvrMeDGe8iblWKePbMtBUSqIhcUg0EicYcxzAGQqIDFgZ4re4Kg/640?wx_fmt=png&from=appmsg)

不难受吗？
-----

但是我事后越想越难受，就一个这么丁点代码量的我都得抽取成组件，那我不敢想象以后我的项目组件数会多到什么地步，而且组件粒度太细，确实也增加了后面开发者的负担~

那么有没有办法，可以不抽取成组件呢？我可以在当前组件里去提取吗，而不需要去重新定义一个组件呢？例如下面的效果

![](https://mmbiz.qpic.cn/mmbiz_png/TZL4BdZpLdg39ibRibbA1iavtrfyO6DiaAy4nCNn2ecpy50uzxC3rWNfEYeb9I7yTV0ZWa5kocHC5Z0PhZic66DNUEQ/640?wx_fmt=png&from=appmsg)

useTemplate 代码实现
----------------

想到这，马上行动起来，需要封装一个 `useTemplate`来实现这个功能

![](https://mmbiz.qpic.cn/mmbiz_png/TZL4BdZpLdg39ibRibbA1iavtrfyO6DiaAy4uYX8eLibia6URE6FjOVobvDlazCKljDULYfhgN2vq0E4FPAMeyGRr71g/640?wx_fmt=png&from=appmsg)

用的不爽
----

尽管做到这个地步，我还是觉得用的不爽，因为没有类型提示

![](https://mmbiz.qpic.cn/mmbiz_png/TZL4BdZpLdg39ibRibbA1iavtrfyO6DiaAy4sUJ5X0nqNSria3NrlZgqa8JTE3ySagmFjK0Pg92NPKlAHo4XQS33v3g/640?wx_fmt=png&from=appmsg)![](https://mmbiz.qpic.cn/mmbiz_png/TZL4BdZpLdg39ibRibbA1iavtrfyO6DiaAy44SEVqA3ODw5qzVq1qSjBIicEzbOZFibTWdgEyPqW5ibGzJpu9N124J3XQ/640?wx_fmt=png&from=appmsg)

我们想要的是比较爽的使用，那肯定得把类型的提示给支持上啊！！！于是给 useTemplate 加上泛型！！加上之后就有类型提示啦~~~~

![](https://mmbiz.qpic.cn/mmbiz_png/TZL4BdZpLdg39ibRibbA1iavtrfyO6DiaAy4oX6vOWj1VuRao51FAsa4xF0ibSmcMK5qeZ90tHiaqAhHfCWWQH3hIvnA/640?wx_fmt=png&from=appmsg)![](https://mmbiz.qpic.cn/mmbiz_png/TZL4BdZpLdg39ibRibbA1iavtrfyO6DiaAy4KGmzrOG1rSwFBicZ7Oy35ia2gcicodV88icG8NoTWsAUDicHyFSiaMnFw9WQ/640?wx_fmt=png&from=appmsg)

加上泛型后的 useTemplate 代码如下

![](https://mmbiz.qpic.cn/mmbiz_png/TZL4BdZpLdg39ibRibbA1iavtrfyO6DiaAy4h45fCBSg06stXlticicOSialqxgvtsib420e27jxtpyyDc9WbLmHfANjqA/640?wx_fmt=png&from=appmsg)

完整代码
----

```
import { defineComponent, shallowRef } from 'vue';import { camelCase } from 'lodash';import type { DefineComponent, Slot } from 'vue';// 将横线命名转大小驼峰function keysToCamelKebabCase(obj: Record<string, any>) {  const newObj: typeof obj = {};  for (const key in obj) newObj[camelCase(key)] = obj[key];  return newObj;}export type DefineTemplateComponent<  Bindings extends object,  Slots extends Record<string, Slot | undefined>,> = DefineComponent<object> & {  new (): { $slots: { default(_: Bindings & { $slots: Slots }): any } };};export type ReuseTemplateComponent<  Bindings extends object,  Slots extends Record<string, Slot | undefined>,> = DefineComponent<Bindings> & {  new (): { $slots: Slots };};export type ReusableTemplatePair<  Bindings extends object,  Slots extends Record<string, Slot | undefined>,> = [DefineTemplateComponent<Bindings, Slots>, ReuseTemplateComponent<Bindings, Slots>];export const useTemplate = <  Bindings extends object,  Slots extends Record<string, Slot | undefined> = Record<string, Slot | undefined>,>(): ReusableTemplatePair<Bindings, Slots> => {  const render = shallowRef<Slot | undefined>();  const define = defineComponent({    setup(_, { slots }) {      return () => {        // 将复用模板的渲染函数内容保存起来        render.value = slots.default;      };    },  }) as DefineTemplateComponent<Bindings, Slots>;  const reuse = defineComponent({    setup(_, { attrs, slots }) {      return () => {        // 还没定义复用模板，则抛出错误        if (!render.value) {          throw new Error('你还没定义复用模板呢！');        }        // 执行渲染函数，传入 attrs、slots        const vnode = render.value({ ...keysToCamelKebabCase(attrs), $slots: slots });        return vnode.length === 1 ? vnode[0] : vnode;      };    },  }) as ReuseTemplateComponent<Bindings, Slots>;  return [define, reuse];};
```

结语
--

我是林三心

*   一个待过**小型 toG 型外包公司、大型外包公司、小公司、潜力型创业公司、大公司**的作死型前端选手；
    
*   一个偏前端的全干工程师；
    
*   一个不正经的掘金作者；
    
*   逗比的 B 站 up 主；
    
*   不帅的小红书博主；
    
*   喜欢打铁的篮球菜鸟；
    
*   喜欢历史的乏味少年；
    
*   喜欢 rap 的五音不全弱鸡如果你想一起学习前端，一起摸鱼，一起研究简历优化，一起研究面试进步，一起交流历史音乐篮球 rap，可以来俺的摸鱼学习群哈哈，点这个，有 7000 多名前端小伙伴在等着一起学习哦 --> 
    

> 广州的兄弟可以约饭哦，或者约球~ 我负责打铁，你负责进球，谢谢~