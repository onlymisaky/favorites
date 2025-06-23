> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/oN7ShIN9ENwmIQ6daUKv4g)

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/ICSDUMm2cYIoD2m9wgYaib5MUNykUxeoCgCaGsLibGSRQnT2DKOibvNFlibBibkBOtlwj5BThQOBuxAdicJaLI6nD86w/640?wx_fmt=jpeg&from=appmsg)

新版本发布，提供更多组件满足使用场景
==================

TDesign AI Chat 是 TDesign 为 AIGC 场景开发的 UI 系列组件中的一部分，主要服务于日益流行的 ChatBot 对话交互场景。为了满足更丰富的使用场景，在 0.1 版本的基础上，TDesign Chat 在 0.2 的版本中还新增了思考过程、增强版的可扩展输入框和配套加载动画等相关组件，同时配套内置支持了多语言能力，希望服务不同业务的开发者快速落地 AI ChatBot 相关应用。

Chat 系列组件一览
-----------

Chat 系列组件包括了 Chat 组件和多个组成 Chat 组件的子组件。如果 Chat 组件不足以满足使用场景，也可以使用 Chat 组件的相关子组件进行更加自由的组合。

<table><thead><tr><th data-colwidth="135"><section>组件名</section></th><th><section>描述</section></th></tr></thead><tbody><tr><td data-colwidth="135"><section>Chat</section></td><td><section>整体对话容器组件，通过 data 配置，快速实现 ChatBot 的界面效果</section></td></tr><tr><td data-colwidth="135"><section>ChatAction</section></td><td><section>对话单元操作组合（点赞 / 点踩 / 重新生成 / 复制）</section></td></tr><tr><td data-colwidth="135"><section>ChatContent</section></td><td><section>对话内容组件</section></td></tr><tr><td data-colwidth="135"><section>ChatInput</section></td><td><section>对话输入框</section></td></tr><tr><td data-colwidth="135"><section>ChatItem</section></td><td><section>对话单元组件</section></td></tr><tr><td data-colwidth="135"><strong>ChatLoading</strong></td><td><strong>加载动画组件 ，新版本新增。为&nbsp;Chat 相关加载场景设计的加载效果</strong></td></tr><tr><td data-colwidth="135"><strong>ChatReasoning</strong></td><td><strong>思考过程组件，新版本新增。模拟推理过程，支持折叠交互与自定义内容</strong></td></tr><tr><td data-colwidth="135"><strong>ChatSender</strong></td><td><strong>可扩展的对话输入框，新版本新增。在 ChatInput 的基础上，支持多模态扩展，模型切换的能力展示</strong></td></tr></tbody></table>

系列组件的具体介绍
---------

### Chat 对话组件

Chat 对话组件是开箱即用的容器组件，支持快速配置后搭建对话场景。

**🔧**

**组件功能特性**

1. 标准化的 data API ：data 字段与目前大部分模型接口字段一致，可以灵活方便地快速与相关模型接口对接，搭建 ChatBot 应用  
2. 多种布局形式：提供多种布局形式、渲染顺序、加载动效的配置能力，方便根据业务需求处理包括自动跟踪最新消息位置或左右布局调整等需求  
3. 灵活的对话单元配置：在 0.2 版本中，Chat 新增提供灵活的插槽，可以快速地进行对话单元的自定义

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/ICSDUMm2cYLpT9Eovg27QBic70laBWhWJXMIWcI01L4IZt9iawAZMEqjpeFOzOhkeQvurJYaYGkVxKsEerhJXBSA/640?wx_fmt=gif&from=appmsg)

在 0.2 版本中，Chat 组件**新增支持了自定义样式** ，如果需要对每个对话单元进行自定义配置，可以通过插槽或者 props 回调配置的方式，快速定义每个聊天单元中的 `头像`、 `日期`、`对话内容` 、`操作栏`和 `底部`的相关内容。

```
 <t-chat :data="data" >      
    <template #content="{ item, index }">                            
      <t-chat-reasoning expand-icon-placement="right">  
            <template #header>
                <t-chat-loading v-if="isStreamLoad" text="思考中..." indicator />
                <div v-else>
                    <CheckCircleIcon />
                    <span>已深度思考</span>
                </div>
             </template>
             <t-chat-content :content="item.reasoning" />
       </t-chat-reasoning>
       <t-chat-content v-if="item.content.length > 0" :content="item.content" />      
    </template>      
    <template #footer><t-chat-input /></template>    
</t-chat>
```

如上方的示例代码，`content` 插槽可自定义思考过程和正文的渲染，支持 Markdown 原文返回，可以根据实际需求进行包括数学表达式、或者自定义组件的渲染。

### ChatContent 对话内容组件

ChatContent 对话内容组件是用于对对话内容进行特殊渲染的组件，内置了一定程度的轻量化 Markdown 渲染效果， 可以满足一定程度的对话内容渲染需求。

**🔧**

**组件功能特性**

1. 代码高亮：内置 highlight.js，支持代码块的语法高亮。

2. 轻量配置：内置 Marked.js 体积轻巧，保留 Markdown 基础渲染能力，更高阶的能力需要额外的插件支持。

3. XSS 安全：对 HTML 内容进行过滤，防止 XSS 攻击。

Chat 组件内置了对话内容属性的判断，用户侧的文本不做转义，按用户输入的默认格式显示，不会对代码做高亮； Bot 侧的文本消息，则默认开启 Markdown 的相关渲染逻辑。 

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/ICSDUMm2cYIoD2m9wgYaib5MUNykUxeoCBxmicBmdJngicua10MxTPfqZlNPbicmv1aibIxdtp9quZvJs38HKKTAia7Q/640?wx_fmt=webp&from=appmsg)

### ChatLoading 加载组件

ChatLoading 是为 ChatBot 场景提供的加载动画相关的组件，提供两种动画加载效果，更贴合 ChatBot 展示思考过程、数据加载的场景。

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/ICSDUMm2cYLpT9Eovg27QBic70laBWhWJ2z82Yv7eCMTLic29foGzB4602dQA3ESPjDicTrUK0WylThLbOsZXdx7Q/640?wx_fmt=gif&from=appmsg)

### ChatReasoning 思考过程组件

ChatReasoning 主要用于将模型思考过程进行渲染展示的场景。ChatReasoning 支持非常灵活的扩展，通过 `header` 调整折叠面板头内容；通过`headerRightContent`面板头的右侧区域； 也可以通过 `collapsePanelProps` 整体传入参数自定义思考过程的内容。

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/ICSDUMm2cYLpT9Eovg27QBic70laBWhWJotVerVvpas28fvD1pJUTgqljqlu69Cxc0RZpd3g0hbicN6TXPmacbmA/640?wx_fmt=gif&from=appmsg)

### ChatSender 对话输入框

Chat 组件提供了 ChatInput 和 ChatSender 两种不同的输入框组件。 ChatInput 组件是 0.1 版本提供的输入框组件；而 ChatSender 是 ChatInput 组件的增强版本，可以满足模型切换配置、多模态扩展的等能力的展示场景。支持提供 `prefix` 和`suffix` 等配置扩展组件功能。

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/ICSDUMm2cYLpT9Eovg27QBic70laBWhWJMyegtFEvhUVRC687ZLtDRkrKT9CMzck1nU8BCUqDnFbwLfnvaUtM7w/640?wx_fmt=gif&from=appmsg)

自定义主题和深色模式的支持
-------------

TDesign Chat 组件同样使用 TDesign 统一的 CSS Variables 进行组件相关色彩、尺寸、圆角等组件样式的开发，如果有需要进行个性化的样式定制，同样可以通过站点的主题配置能力进行个性化的调整配置。

[视频详情](javascript:;)

多语言能力的支持
--------

在 0.2 版本中，TDesign Chat 相关组件同时内置支持了 多语言配置的能力，适用于大部分有多语言开发场景的业务使用，与其他 TDesign 组件一样，只需要通过 ConfigProvider 组件即可满足多语言的业务场景使用。

```
<template>
  <t-config-provider :global-config="enConfig">           
      <t-chat :data="data"/>  
  </t-config-provider>
</template>
<script setup>
import enConfig from 'tdesign-vue-next/es/locale/en_US';
</script>
```

组件源码和设计资源开源
===========

在 0.1 版本的使用过程中，内外部社区的许多使用者都希望组件的源码和设计资源可以公开，方便进行更底层的改造使用及对设计资源的复用。 在 0.2 版本发布的契机，TDesign 也将 Chat 组件的所有源码和设计资产发布到社区的 GitHub 仓库和 Figma 资源中，把更多的开发和设计资源给到开发和设计同学，也可以让更多的人参与到接下来的共建中来。

组件源码开源
------

由于目前 Chat 系列组件提供的是 Vue 3 版本，为了更好地承载组件开源的需求，复用已有 TDesign 开源仓库中的组件方法、站点预览和打包的能力的同时，又可以对基础组件和 Chat 及接下来一系列的组件资源进行灵活多变的包组织管理，TDesign 对现有的 Vue 仓库进行了改造升级，重新以 Monorepo 的形式组织代码，基本的仓库架构如下图所示。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/ICSDUMm2cYIoD2m9wgYaib5MUNykUxeoCWlmuv2vjVibjGNQm6Q8G6kN0ibJgxD7lExXnSbciaqdNIJAACicefCc7KQ/640?wx_fmt=png&from=appmsg)

在此仓库的基础上，TDesign 也会继续组织更多 TDesign Vue 系列的代码开源和建设，同时也进行 Vue 2、3 一套代码输出多个版本的适配层探索与建设。

具体可打开文末仓库进行进一步的了解，如果你对 TDesign Vue 大仓的建设有兴趣，也可以加入我们。

设计稿资源公开
-------

与此同时，为了方便不同业务直接复用 TDesign Chat 系列的资源并进行更个性化的设计，TDesign 也将现有的 Chat 系列设计资源发布到了 Figma 的公开社区，所有资源都和现有的开发资源一一对应。 具体可打开文末的设计资源链接进行进一步的了解。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/ICSDUMm2cYIoD2m9wgYaib5MUNykUxeoCGYicPy3eBDpXuk2sXA8rCyLmroWkRrlVVxF56uKMCDlrqpSnJ1eoVjQ/640?wx_fmt=webp&from=appmsg)

未来规划
====

今年，TDesign 还会在 AIGC 场景提供更丰富的组件开发和设计资源给到使用者。

其他技术栈的支持
--------

许多 React 业务方需要的对应技术栈的 Chat 系列组件，TDesign 也在持续进行着相关技术栈和底层能力的建设，希望以更便捷的接入方式，更低的维护成本，更好的扩展性提供给 React/Vue / 小程序等技术栈使用，共享一致的 Chat 系列组件能力，为业务 AI 应用场景赋能。

其他 AIGC 场景的组件提供
---------------

除了 ChatBot 场景的相关组件，其他 AIGC 应用场景的组件，如 AI 生图 / 适配场景系列，AI 图片 / 视频编辑场景系列及相关智能画布组件，也会在今年陆续推出。

**更多内容体验**

👇Chat 站点地址 👇

 https://tdesign.tencent.com/chat/getting-started

👇Chat 组件源码 👇

 https://github.com/Tencent/tdesign-vue-next/tree/develop/packages/tdesign-vue-next-chat

👇Chat 组件设计资源 👇  

https://www.figma.com/design/KInDIZzoxifaKVQ3n5KB8W/TDesign-for-web?node-id=113021-1582&p=f&t=SLc2UjnmqareLOZg-0