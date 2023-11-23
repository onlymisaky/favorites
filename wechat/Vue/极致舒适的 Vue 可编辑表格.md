> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/BsjD9VgyhOK_YvZ6_4KAyw)

使用 ElementPlus 的 Table 啥都好，就是没有可编辑表格！！！😭

既然 UI 库不支持，那我们实现一个可编辑表格是很难的事么？😒难么？😢不难么？...

个人觉得如果是业务固定的可编辑表格，使用 ElementPlus 实现都不难。但是如果需要的是一个通用的可编辑表格，这好像还真说不好。

对于通用的可编辑表格，网上的实现方案也是五花八门，但是看下来多少都有些问题。个人认为一个通用的可编辑表格需要给使用方提供以下能力：

*   支持新增、删除、编辑、保存
    
*   定义可编辑列
    
*   定义表单组件，既可以是原生标签，也可以是自定义组件
    
*   定义表单校验规则
    
*   定义数据展示部分
    
*   定义操作区域
    
*   几乎无学习成本
    

> 实现了以上需求的可编表格，就可以满足基本的生产需求了。

在`<el-table>`组件的基础上实现可编辑表格，保留`<el-table>`的使用方式不变，还能提供可编辑功能。同时可编辑功能的配置与`<el-table>`的使用风格一致，降低学习成本。

**放心食用：演示地址 [1]**

准备数据
----

```
const tableData = [ {   date: '2016-05-03',   name: 'Tom',   address: 'No. 189, Grove St, Los Angeles', }, {   date: '2016-05-02',   name: 'Tom',   address: 'No. 189, Grove St, Los Angeles', }, {   date: '2016-05-04',   name: 'Tom',   address: 'No. 189, Grove St, Los Angeles', }, {   date: '2016-05-01',   name: 'Tom',   address: 'No. 189, Grove St, Los Angeles', },]
```

基础表格
----

基础表格的用法与`<el-table>`几乎没有区别，唯一的不同就是`<el-table>`中的`data`，在`<EditTable>`中被`data-source`替换。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/pfCCZhlbMQTTicSWywPuNbficIAuFcdD5BZae4HwHE2e29s8L0ia6wzCr6iafZPK4TH1uwrLnT7oIw1r35oyHPxBlw/640?wx_fmt=other)image.png

```
<section> <h1>无编辑效果</h1> <EditTable class="edit-table" :data-source="tableData"> <EditTableColumn prop="date" label="时间"> </EditTableColumn> <EditTableColumn prop="name" label="姓名"> </EditTableColumn> <EditTableColumn prop="address" label="地址"> </EditTableColumn> </EditTable></section>
```

可修改表格
-----

`<EditTableColumn>`存在一个`#default`默认插槽和一个`#edit`具名插槽，默认插槽和具名插槽都提供了`row`、`actions`、`$index`等值。

可修改表格是在基础表格上给`<EditTableColumn>`添加名为`edit`的具名插槽`<template #edit>`。

*   通过`row`可以获取到当前行的数据。插槽中的表单组件可通过`v-model="row.*"`对编辑值进行双向绑定。
    
*   通过`actions`可以获取编辑表格的能力，通过`action.startEditable($index)`开启编辑，`action.cancelEditable($index)`取消编辑，`action.saveEditable`保存编辑。
    

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/pfCCZhlbMQTTicSWywPuNbficIAuFcdD5B69bEB8bic6iaYh5icdpS8pDrdPKox1V32Hlv2icdcdtmuf1FnlhOp5MUwg/640?wx_fmt=other)可编辑效果. gif

```
<section> <h1>可编辑效果</h1> <EditTable class="edit-table" :data-source="tableData">   <EditTableColumn prop="date" label="时间">     <template #edit="{ row }">       <input v-model="row.date" />     </template>   </EditTableColumn>     <EditTableColumn prop="name" label="姓名">       <template #edit="{ row }">         <input v-model="row.name" />       </template>     </EditTableColumn>     <EditTableColumn prop="address" label="地址">       <template #edit="{ row }">         <input v-model="row.address" />       </template>     </EditTableColumn>     <EditTableColumn label="操作">       <template #default="{ actions, $index }">         <button @click="actions.startEditable($index)">操作</button>       </template>       <template #edit="{ actions, $index }">         <button @click="actions.saveEditable($index)">保存</button>         <button @click="actions.cancelEditable($index)">取消</button>     </template>   </EditTableColumn> </EditTable></section>
```

删除效果
----

在上述表格的操作区域增加删除按钮，删除按钮点击时调用`actions.delete($index)`用来删除当前行。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/pfCCZhlbMQTTicSWywPuNbficIAuFcdD5BkLBr1ouxBXibvF6PzvTqyiaibAkVLicrdica0XfyF3WcFaA3ClZJW2eSsqA/640?wx_fmt=other)删除效果. gif

```
<section> <h1>删除效果</h1> <EditTable class="edit-table" :data-source="tableData">   <EditTableColumn prop="date" label="时间">     <template #edit="{ row }">       <input v-model="row.date" />     </template>   </EditTableColumn>   <EditTableColumn prop="name" label="姓名">     <template #edit="{ row }">       <input v-model="row.name" />     </template>   </EditTableColumn>   <EditTableColumn prop="address" label="地址">     <template #edit="{ row }">       <input v-model="row.address" />     </template>   </EditTableColumn>   <EditTableColumn label="操作">     <template #default="{ actions, $index }">       <button @click="actions.startEditable($index)">操作</button>       <button @click="actions.deleteRow($index)">删除</button>     </template>     <template #edit="{ actions, $index }">       <button @click="actions.saveEditable($index)">保存</button>       <button @click="actions.cancelEditable($index)">取消</button>       <button @click="actions.deleteRow($index)">删除</button>     </template>   </EditTableColumn> </EditTable></section>
```

新增效果
----

组件`<EditTable>`并不需要提供新增按钮，如果直接将新增按钮封装在组件内，那么这个组件就太呆了。因此`<EditTable>`只提供了`actions.addRow`方法，调用方可以根据自己的需求完成新增功能。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/pfCCZhlbMQTTicSWywPuNbficIAuFcdD5Blvuc57kp1BsuxaRXe1FnhTpL6G46FSJdnDWfzwSLqQicicQoIiagJKPkw/640?wx_fmt=other)新增效果. gif

```
<script lang="ts" setup>import { ref } from 'vue';import EditTable from '@/components/EditTable.vue';import EditTableColumn from '@/components/EditTableColumn.vue';const tableData = [...];const addEditTableRef = ref<InstanceType<typeof EditTable>>();</script><template> <div class="wrapper"> <section>   <h1>新增效果</h1>   <EditTable ref="addEditTableRef" class="edit-table" :data-source="tableData">     <EditTableColumn prop="date" label="时间">       <template #edit="{ row }">         <input v-model="row.date" />       </template>     </EditTableColumn>     <EditTableColumn prop="name" label="姓名">       <template #edit="{ row }">         <input v-model="row.name" />       </template>     </EditTableColumn>     <EditTableColumn prop="address" label="地址">       <template #edit="{ row }">         <input v-model="row.address" />       </template>     </EditTableColumn>     <EditTableColumn label="操作">       <template #default="{ actions, $index }">         <button @click="actions.startEditable($index)">操作</button>         <button @click="actions.deleteRow($index)">删除</button>       </template>       <template #edit="{ actions, $index }">         <button @click="actions.saveEditable($index)">保存</button>         <button @click="actions.cancelEditable($index)">取消</button>         <button @click="actions.deleteRow($index)">删除</button>       </template>     </EditTableColumn> </EditTable> <button @click="addEditTableRef?.editActions.addRow()">新增</button> </section> </div></template>
```

表单校验
----

组件`<EditTableColumn>`允许验证用户的输入是否符合规范，来找到和纠正错误。只需要为`<EditTableColumn :rules="rules">`的`rules`属性传入约定的验证规则，高级用法可参考`async-validator`。

> 总之校验规则和表单的校验规则一致。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/pfCCZhlbMQTTicSWywPuNbficIAuFcdD5BKnPoUret9xeRVwO1SkoHnFBnoByCOibiaWcQtEUZbHGeDtlsYibdVXpdg/640?wx_fmt=other)表单校验效果. gif

```
<section>  <h1>表单校验效果</h1>  <EditTable ref="formEditTableRef" class="edit-table" :data-source="tableData">    <EditTableColumn      prop="date"      label="时间"      :rules="[{ required: true, message: '时间是必填项', trigger: 'blur' }]"    >      <template #edit="{ row }">        <input v-model="row.date" />      </template>    </EditTableColumn>    <EditTableColumn      prop="name"      label="姓名"      :rules="[{ required: true, message: '姓名是必填项', trigger: 'blur' }]"    >      <template #edit="{ row }">        <input v-model="row.name" />      </template>    </EditTableColumn>    <EditTableColumn      prop="address"      label="地址"      :rules="[{ required: true, message: '地址是必填项', trigger: 'blur' }]"    >      <template #edit="{ row }">        <input v-model="row.address" />      </template>    </EditTableColumn>    <EditTableColumn label="操作">      <template #default="{ actions, $index }">        <button @click="actions.startEditable($index)">操作</button>        <button @click="actions.deleteRow($index)">删除</button>      </template>      <template #edit="{ actions, $index }">        <button @click="actions.saveEditable($index)">保存</button>        <button @click="actions.cancelEditable($index)">取消</button>        <button @click="actions.deleteRow($index)">删除</button>      </template>    </EditTableColumn>  </EditTable>  <button @click="formEditTableRef?.editActions.addRow()">新增</button></section>
```

获取编辑后的表单数据
----------

组件`<EditTable>`对外暴露了`resultData`响应式对象，可以用来获取表格的最新数据。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/pfCCZhlbMQTTicSWywPuNbficIAuFcdD5BEW1hJ3DxV7cbek0qu5xBUYocD9siciaOqVekZB7QrBEKgwE5B51hemmA/640?wx_fmt=png)

获取编辑效果. gif

```
<section>  <h1>获取编辑结果</h1>  <EditTable ref="formEditTableRef" class="edit-table" :data-source="tableData">    <EditTableColumn      prop="date"      label="时间"      :rules="[{ required: true, message: '时间是必填项', trigger: 'blur' }]"    >      <template #edit="{ row }">        <input v-model="row.date" />      </template>    </EditTableColumn>    <EditTableColumn      prop="name"      label="姓名"      :rules="[{ required: true, message: '姓名是必填项', trigger: 'blur' }]"    >      <template #edit="{ row }">        <input v-model="row.name" />      </template>    </EditTableColumn>    <EditTableColumn      prop="address"      label="地址"      :rules="[{ required: true, message: '地址是必填项', trigger: 'blur' }]"    >      <template #edit="{ row }">        <input v-model="row.address" />      </template>    </EditTableColumn>    <EditTableColumn label="操作">      <template #default="{ actions, $index }">        <button @click="actions.startEditable($index)">操作</button>        <button @click="actions.deleteRow($index)">删除</button>      </template>      <template #edit="{ actions, $index }">        <button @click="actions.saveEditable($index)">保存</button>        <button @click="actions.cancelEditable($index)">取消</button>        <button @click="actions.deleteRow($index)">删除</button>      </template>    </EditTableColumn>  </EditTable>  <button @click="formEditTableRef?.editActions.addRow()">新增</button>  <p>获取数据:{{ formEditTableRef?.resultData }}</p></section>
```

另一种数据配置
-------

组件`<EditTable>`除了支持`data-source`的方式配置数据外，还支持`request`属性传入返回数据的函数。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/pfCCZhlbMQTTicSWywPuNbficIAuFcdD5BwSEm20tKqQL3udnicy21fDN4YoUdsCkobIV6Y4uPQaeWQgvGCER25icA/640?wx_fmt=other)image.png

```
<section>  <h1>获取编辑结果</h1>  <EditTable ref="formEditTableRef" class="edit-table" :data-source="tableData">    <EditTableColumn      prop="date"      label="时间"      :rules="[{ required: true, message: '时间是必填项', trigger: 'blur' }]"    >      <template #edit="{ row }">        <input v-model="row.date" />      </template>    </EditTableColumn>    <EditTableColumn      prop="name"      label="姓名"      :rules="[{ required: true, message: '姓名是必填项', trigger: 'blur' }]"    >      <template #edit="{ row }">        <input v-model="row.name" />      </template>    </EditTableColumn>    <EditTableColumn      prop="address"      label="地址"      :rules="[{ required: true, message: '地址是必填项', trigger: 'blur' }]"    >      <template #edit="{ row }">        <input v-model="row.address" />      </template>    </EditTableColumn>    <EditTableColumn label="操作">      <template #default="{ actions, $index }">        <button @click="actions.startEditable($index)">操作</button>        <button @click="actions.deleteRow($index)">删除</button>      </template>      <template #edit="{ actions, $index }">        <button @click="actions.saveEditable($index)">保存</button>        <button @click="actions.cancelEditable($index)">取消</button>        <button @click="actions.deleteRow($index)">删除</button>      </template>    </EditTableColumn>  </EditTable>  <button @click="formEditTableRef?.editActions.addRow()">新增</button>  <p>获取数据:{{ formEditTableRef?.resultData }}</p></section>
```

EditTable 属性
------------

<table><thead><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); text-align: center; min-width: 85px;">属性名</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); text-align: center; min-width: 85px;">说明</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); text-align: center; min-width: 85px;">类型</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); text-align: center; min-width: 85px;">可选值</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); text-align: center; min-width: 85px;">默认值</th></tr></thead><tbody><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;">data-source</td><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;">显示的数据</td><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;">array</td><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;">—</td><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;">—</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;">request</td><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;">动态数据，如果同时配置了 data-source 和 request，则最终渲染为两个数据的和</td><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;">function</td><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;">—</td><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;">—</td></tr></tbody></table>

其他属性参考：ElementPlusTable[2]

EditTable 方法
------------

<table><thead><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); text-align: center; min-width: 85px;">方法名</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); text-align: center; min-width: 85px;">说明</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); text-align: center; min-width: 85px;">参数</th></tr></thead><tbody><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;">editActions.addRow</td><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;">增加一行可编辑态的行</td><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;">row</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;">editActions.deleteRow</td><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;">删除指定行，不论该行是编辑态还是非编辑态都会被删除</td><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;">$index</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;">editActions.startEditable</td><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;">指定行变为编辑态</td><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;">$index</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;">editActions.saveEditable</td><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;">保存编辑态并触发表单校验，如果校验通过，编辑数据会被更新到表格中。</td><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;">$index</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;">editActions.cancelEditable</td><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;">指定行取消编辑态</td><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;">$index</td></tr></tbody></table>

其他方法参考: ElementPlusTable[3]

关于源码
----

由于就是一个简单的组件实现，所以也懒得去打包发布 npm。直接在下面给出 demo 地址和演示环境：

GitHub 地址 [4]

codesandbox[5]

最后
--

`<el-table>`的属性配置基本都可以在`<EditTable>`中使用，所以只要会使用 el-table[6] 对于`<EditTable>`就可以立即使用。

> 我尝试了【带斑马纹表格】、【带边框表格】、【带状态表格】、【固定表头】、【固定列】、【流体高度】等，其他的表格大家可以自行尝试哦！

这样的`<EditTable>`不知道各位觉得如何？

_如果大家觉得有点意思，欢迎在评论区留言交流！_

### 参考资料

[1]

https://jlc7rc-5173.csb.app/?

[2]

https://element-plus.gitee.io/zh-CN/component/table.html#table-%E5%B1%9E%E6%80%A7

[3]

https://element-plus.gitee.io/zh-CN/component/table.html#table-%E6%96%B9%E6%B3%95

[4]

https://github.com/JessYan0913/edit-table

[5]

https://codesandbox.io/p/sandbox/silly-joana-jlc7rc

[6]

https://element-plus.gitee.io/zh-CN/component/table.html

关于本文

作者：youth 君

https://juejin.cn/post/7242140832379584567

最后
--

欢迎关注【前端瓶子君】✿✿ヽ (°▽°) ノ✿

回复「交流」，吹吹水、聊聊技术、吐吐槽！

回复「阅读」，每日刷刷高质量好文！

如果这篇文章对你有帮助，「在看」是最大的支持！

```
最后不要忘了点赞呦！

```