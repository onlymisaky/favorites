> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/8JYa0_vIMxVj9gpdm4DnnA)

大家好，我是 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf&scene=21#wechat_redirect)。

在 ECMAScript 2021（ES12）中，JavaScript 引入了新的逻辑赋值操作符 `&&=` 和 `??=`。这些操作符将逻辑运算符与赋值运算符相结合，提供了更加简洁、直观的赋值方式。

虽然已经进入标准比较久了，但是我在实际开发中见到的还比较少，今天我们一起来学习下。

逻辑与赋值操作符 `&&=`
--------------

### `&&=` 的工作原理

`&&=` 操作符是逻辑与运算符（`&&`）和赋值运算符（`=`）的结合。它的作用是：**仅当左侧变量为真值（truthy）时，才将右侧的值赋给左侧变量**。传统的写法需要使用 `if` 语句或逻辑运算符，`&&=` 则提供了更为简洁的方式。

**传统写法对比：**

```
// 使用 if 语句if (x) {  x = y;}// 使用逻辑与运算符x = x && y;// 使用 `&&=` 操作符（ES2021）x &&= y;
```

### 真值和假值的概念

在 JavaScript 中，以下值被认为是**假值（falsy）**：

*   `false`
    
*   `0`
    
*   `''` (空字符串)
    
*   `null`
    
*   `undefined`
    
*   `NaN`
    

其他所有值都被视为**真值（truthy）**。

### 示例解析

**示例 1：用户登录状态**

```
let isLoggedIn = true;isLoggedIn &&= getUserData(); // 如果已经登录，获取用户数据function getUserData() {  return { name: 'ConardLi', age: 17 };}// 结果：isLoggedIn 变为 { name: 'ConardLi', age: 17 }
```

**示例 2：库存更新**

```
let stock = 17;function sell(quantity) {  stock >= quantity &&= stock - quantity;}sell(5); // stock 为 5sell(17); // stock 保持为 5，因为 5 >= 17 为 false
```

在上述示例中，`sell` 函数仅在库存足够时才减少库存，防止出现负库存的情况。

### 应用场景

**（1）条件更新属性**

```
let config = {  debugMode: true,  logLevel: null};// 仅当 debugMode 为真时，设置 logLevelconfig.debugMode &&= (config.logLevel = 'verbose');// 结果：config.logLevel 为 'verbose'
```

**（2）链式判断**

```
let user = {  isActive: true,  hasMembership: true};// 仅当用户活跃且有会员资格时，给予折扣user.isActive &&= user.hasMembership &&= applyDiscount();function applyDiscount() {  return '已应用折扣';}// 结果：user.hasMembership 变为 '已应用折扣'
```

* * *

空值合并赋值操作符 `??=`
---------------

### `??=` 的工作原理

`??=` 操作符结合了空值合并运算符（`??`）和赋值运算符（`=`）。它的作用是：**仅当左侧变量为 `null` 或 `undefined` 时，才将右侧的值赋给左侧变量**。这有助于在变量未被初始化时提供默认值。

**传统写法对比：**

```
// 使用 if 语句if (options.timeout === null || options.timeout === undefined) {  options.timeout = 3000;}// 使用空值合并运算符options.timeout = options.timeout ?? 3000;// 使用 `??=` 操作符（ES2021）options.timeout ??= 3000;
```

### 与其他赋值方式的比较

**问题：**

*   **逻辑或 `||`：** 会将 `0`、`''`、`false` 等合法值视为需要赋默认值的情况，可能导致意外的结果。
    

```
let delay = 0;delay = delay || 1000; // delay 被误赋值为 1000
```

**解决方案：**

*   **`??=`：** 仅在变量为 `null` 或 `undefined` 时才赋值，避免了上述问题。
    

```
let delay = 0;delay ??= 1000; // delay 保持为 0
```

**使用三元运算符：**

```
user.name = (user.name !== null && user.name !== undefined) ? user.name : 'Anonymous';
```

**问题：** 代码较为冗长，可读性不高。

**使用 `??=`：**

```
user.name ??= 'Anonymous';
```

**优势：** 简洁明了，仅在变量为 `null` 或 `undefined` 时才赋值，不影响其他假值。

### 应用场景

`??=` 操作符非常适合为可能未定义的变量设置默认值，且不会干扰有效的假值。

**示例：**

```
let score = 0;score ??= 100;    // 保持为 0let tag = '';tag ??= 'default'; // 保持为 ''let active = false;active ??= true;   // 保持为 false
```

**配置默认参数：**

```
function initializeSettings(settings) {  settings.theme ??= 'light';  settings.notificationsEnabled ??= true;  settings.autoSaveInterval ??= 300;  return settings;}
```

最后
--

JavaScript 的 `&&=` 和 `??=` 操作符为我们提供了更为简洁和精确的赋值方式：

*   **`&&=` 操作符：** 仅在左侧变量为真值时才进行赋值，适合用于需要在保持假值的同时，根据真值条件更新变量的场景。
    
*   **`??=` 操作符：** 仅在左侧变量为 `null` 或 `undefined` 时才进行赋值，适合用于为未定义或空值变量设置默认值的场景。
    

大家在开发的时候用上了么？

抖音前端架构团队目前放出不少新的 HC ，有看起会的小伙伴可以看看这篇文章：[抖音前端架构团队正在寻找人才！FE/Client/Server/QA](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247499434&idx=1&sn=8c7497876efc458dca19b6f6a27cadd4&chksm=c2e10b81f5968297533fcfced9ebad6eba072f6436bf040eaa8920256577258ef1077d1f122a&token=1091255868&lang=zh_CN&scene=21#wechat_redirect)，25 届校招同学可以直接用内推码：`DRZUM5Z`，或者加我微信联系。

**参考资料：**

> 如果你想加入高质量前端交流群，或者你有任何其他事情想和我交流也可以添加我的个人微信 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf&scene=21#wechat_redirect) 。

`点赞`和`在看`是最大的支持⬇️❤️⬇️