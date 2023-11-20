> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/Sn2XEER9Ie9Gt8pFzenw3g)

### Javascript 是一门很厉害的语言，我可能学了假的 JavaScript，哈哈，大家还有什么推荐的，欢迎补充。  

#### 1、单行写一个评级组件

"★★★★★☆☆☆☆☆".slice(5 - rate, 10 - rate);

定义一个变量 rate 是 1 到 5 的值，然后执行上面代码，看图

![](https://mmbiz.qpic.cn/mmbiz_jpg/aVp1YC8UV0ftCHLbFxOBHXibIdC23gicG2TqPR0gtkT7qKdZC5sCS6GbuBrN7aEJBXDP7rtE1jj8SB7NMRJJWFpw/640?wx_fmt=jpeg)

才发现插件什么的都弱爆了

![](https://mmbiz.qpic.cn/mmbiz_jpg/aVp1YC8UV0ftCHLbFxOBHXibIdC23gicG2plQiaqygUibU279XpMwic4UmQQsgqwoyhWBCTaLfdb4NbRsaoTrea2HiaA/640?wx_fmt=jpeg)

#### 2、如何装逼用代码骂别人 SB

```
(!(~+[])+{})[--[~+""][+[]]*[~+[]] + ~~!+[]]+({}+[])[[~!+[]]*~+[]]
```

![](https://mmbiz.qpic.cn/mmbiz_jpg/aVp1YC8UV0ftCHLbFxOBHXibIdC23gicG2icUsHDCibqoHiaiajSP6jko6IT3VvS01ib3rP6Ug0dnVTgljOetbqBU4RYg/640?wx_fmt=jpeg)![](https://mmbiz.qpic.cn/mmbiz_jpg/aVp1YC8UV0ftCHLbFxOBHXibIdC23gicG2VicSYWFZGeTLx4rJghicV29sNA7WibCxPrib3K2ZyIicfhhEMQPfUNorddw/640?wx_fmt=jpeg)

#### 3、如何用代码优雅的证明自己 NB

这个牛逼了

```
   console.log(([][[]]+[])[+!![]]+([]+{})[!+[]+!![]])
```

![](https://mmbiz.qpic.cn/mmbiz_jpg/aVp1YC8UV0ftCHLbFxOBHXibIdC23gicG2yicYzxHLDV9n2PFoxESytD6XuxAbwYQqYdlHTtB0ib51mdAzFo8op2OQ/640?wx_fmt=jpeg)

![](https://mmbiz.qpic.cn/mmbiz_jpg/aVp1YC8UV0ftCHLbFxOBHXibIdC23gicG2XOfKIZcaCiaWK7iaFjR5aaY1pkJ4JMMqwRqtAjTBl9nicOo4zd1hRQlTQ/640?wx_fmt=jpeg)

#### 4、JavaScript 错误处理的方式的正确姿势

😂😂😂，舅服你

```
try {
    something
} catch (e) {
    window.location.href =
        "http://stackoverflow.com/search?q=[js]+" +
        e.message;
}
```

![](https://mmbiz.qpic.cn/mmbiz_jpg/aVp1YC8UV0ftCHLbFxOBHXibIdC23gicG2T8NmzUORodGmib1ibdMJWxVWbiaiah7IxHYlWakIfzbMHuLkGobA1VxQaA/640?wx_fmt=jpeg)

![](https://mmbiz.qpic.cn/mmbiz_jpg/aVp1YC8UV0ftCHLbFxOBHXibIdC23gicG2SZPKhqjiaocZiajTrvywyOibHqW7Z91Bm3YDReVGJbvwD2zIazUdapFOA/640?wx_fmt=jpeg)

#### 5、从一行代码里面学点 JavaScript

```
[].forEach.call($$("*"),function(a){
    a.style.outline="1px solid #"+(~~(Math.random()*(1<<24))).toString(16)
})
```

翻译成正常语言就是这样的

```
Array.prototype.forEach.call(document.querySelectorAll('*'), 
dom => dom.style.outline = `1px solid #${parseInt(Math.random() *
Math.pow(2,24)).toString(16)}`)
```

接下来在浏览器控制看看：something magic happens

![](https://mmbiz.qpic.cn/mmbiz_jpg/aVp1YC8UV0ftCHLbFxOBHXibIdC23gicG2XicshR3omAn4LoyJSEK6589GviadVMfMRkbw6xdHN4DsDs1M5BSPiblFQ/640?wx_fmt=jpeg)![](https://mmbiz.qpic.cn/mmbiz_jpg/aVp1YC8UV0ftCHLbFxOBHXibIdC23gicG2pypU6cnZia5ywASBBRyYdpov5ULhM2NFpqYTQpGEdr1Uku467cl2icUw/640?wx_fmt=jpeg)

#### 6、论如何优雅的取随机字符串

```
Math.random().toString(16).substring(2) // 13位
Math.random().toString(36).substring(2) // 11位
```

![](https://mmbiz.qpic.cn/mmbiz_jpg/aVp1YC8UV0ftCHLbFxOBHXibIdC23gicG2d2nyuJpiaEQ9G6iabJF8rhp7k81HlgSiaAfJKV1zsSxgMjVSiagVVbQEyQ/640?wx_fmt=jpeg)

#### 7、(10)"toString" === "10"

![](https://mmbiz.qpic.cn/mmbiz_jpg/aVp1YC8UV0ftCHLbFxOBHXibIdC23gicG2SgxIiblC8JuA0LvPy3nWAP4pF7tcQdzy4DPia6lldSA9Lia8Fm4yibM0nQ/640?wx_fmt=jpeg)

#### 8、匿名函数自执行

这么多写法你选择哪一种？我选择死亡。

```
( function() {}() );
( function() {} )();
[ function() {}() ];

~ function() {}();
! function() {}();
+ function() {}();
- function() {}();

delete function() {}();
typeof function() {}();
void function() {}();
new function() {}();
new function() {};

var f = function() {}();

1, function() {}();
1 ^ function() {}();
1 > function() {}();
// ...
```

![](https://mmbiz.qpic.cn/mmbiz_jpg/aVp1YC8UV0ftCHLbFxOBHXibIdC23gicG2TMxwafKduQ0IlPZYicnI7TFiaxhhLxicSqWGicwZXQtAeHzyIxUbZMpPqA/640?wx_fmt=jpeg)

#### 9、另外一种 undefined

从来不需要声明一个变量的值是 undefined，因为 JavaScript 会自动把一个未赋值的变量置为 undefined。所有如果你在代码里这么写，会被鄙视的

```
var data = undefined;
```

但是如果你就是强迫症发作，一定要再声明一个暂时没有值的变量的时候赋上一个 undefined。那你可以考虑这么做：

```
var data = void 0; // undefined
```

void 在 JavaScript 中是一个操作符，对传入的操作不执行并且返回 undefined。void 后面可以跟 () 来用，例如 void(0)，看起来是不是很熟悉？没错，在 HTML 里阻止带 href 的默认点击操作时，都喜欢把 href 写成 javascript:void(0)，实际上也是依靠 void 操作不执行的意思。

当然，除了出于装逼的原因外，实际用途上不太赞成使用 void，因为 void 的出现是为了兼容早起 ECMAScript 标准中没有 undefined 属性。void 0 的写法让代码晦涩难懂。![](https://mmbiz.qpic.cn/mmbiz_jpg/aVp1YC8UV0ftCHLbFxOBHXibIdC23gicG21ZcGqAUUDtbLL2EW4u28GoXbicm4X1ycz8StwxGjNMvc9QkAvc0jd6Q/640?wx_fmt=jpeg)

#### 10、论如何优雅的取整

```
var a = ~~2.33

var b= 2.33 | 0

var c= 2.33 >> 0
```

![](https://mmbiz.qpic.cn/mmbiz_jpg/aVp1YC8UV0ftCHLbFxOBHXibIdC23gicG2uqiaJxiclNPSUfibZRAL8aAD57WF6fuPsrqLT12Ynp0jgIgzr4ESa22Jg/640?wx_fmt=jpeg)

#### 11、如何优雅的实现金钱格式化：1234567890 --> 1,234,567,890

用正则魔法实现：

```
var test1 = '1234567890'
var format = test1.replace(/\B(?=(\d{3})+(?!\d))/g, ',')

console.log(format) // 1,234,567,890
```

非正则的优雅实现：

```
function formatCash(str) {
       return str.split('').reverse().reduce((prev, next, index) => {
            return ((index % 3) ? next : (next + ',')) + prev
       })
}
console.log(formatCash('1234567890')) // 1,234,567,890
```

![](https://mmbiz.qpic.cn/mmbiz_jpg/aVp1YC8UV0ftCHLbFxOBHXibIdC23gicG269OJZq99mPAL4YIE3YajjWnQibnOA4ESDHxXQ4HFx1BmiaQSC3oIquyQ/640?wx_fmt=jpeg)

#### 12、这个我服，还有这个你很机智

我服

```
while (1) {
    alert('牛逼你把我关了啊')
}
```

你很机智，好一个障眼法

```
清除缓存：<a href="javascript:alert('清除成功');">清除缓存</a>
```

![](https://mmbiz.qpic.cn/mmbiz_jpg/aVp1YC8UV0ftCHLbFxOBHXibIdC23gicG2h99XExg8nIic3hgewBfaOUgycvtYxCCmONfcgwsEa2o2sQGDSc0CxSg/640?wx_fmt=jpeg)

#### 13、逗号运算符

```
var a = 0; 
var b = ( a++, 99 ); 
console.log(a);  // 1
console.log(b);  // 99
```

![](https://mmbiz.qpic.cn/mmbiz_jpg/aVp1YC8UV0ftCHLbFxOBHXibIdC23gicG2DbpQYwAwOJJwgsazQQ6byY5CDT82pBXcwpn9pY7Tq20HxQgYhu4cuQ/640?wx_fmt=jpeg)

#### 14、论如何最佳的让两个整数交换数值

常规办法：

```
var a=1,b=2;
a += b;
b = a - b;
a -= b;
```

缺点也很明显，整型数据溢出，对于 32 位字符最大表示数字是 2147483647，如果是 2147483645 和 2147483646 交换就失败了。黑科技办法：

```
a ^= b;
b ^= a;
a ^= b;
```

![](https://mmbiz.qpic.cn/mmbiz_jpg/aVp1YC8UV0ftCHLbFxOBHXibIdC23gicG2tPwibAN4VahXgsU70dC8iboLxvTYbA7VAsj1yGSoqcUVTXs5T1lAib2vw/640?wx_fmt=jpeg)

哈哈😄，看不懂的童鞋建议去补习一下 C 语言的位操作，我就不去复习了，以前学嵌入式时候学的位操作都忘了

#### 15、实现标准 JSON 的深拷贝

```
var a = {
    a: 1,
    b: { c: 1, d: 2 }
}
var b=JSON.parse(JSON.stringify(a))
```

![](https://mmbiz.qpic.cn/mmbiz_jpg/aVp1YC8UV0ftCHLbFxOBHXibIdC23gicG2HOo46ZxU50mXibLdUf1Al1ohVQqYIqEIlkaHJEpCicyAOQib6ibiaicSAzGw/640?wx_fmt=jpeg)

不考虑 IE 的情况下，标准 JSON 格式的对象蛮实用，不过对于 undefined 和 function 的会忽略掉。

#### 16、不用 Number、parseInt 和 parseFloat 和方法把 "1" 字符串转换成数字

哈哈，不准用强制类型转换，那么就想到了强大了隐式转换

```
var a =1 
+a
```

![](https://mmbiz.qpic.cn/mmbiz_jpg/aVp1YC8UV0ftCHLbFxOBHXibIdC23gicG2OBA9l5hDv8mP4EZSpxeicJVWB1EUa2GfpOebPxOh9KPicM1icRiaQKTGhA/640?wx_fmt=jpeg)

#### 17、如何装逼的写出 "hello world!"

滚动条很长哦😯

```
([]+[][(![]+[])[!+[]+!![]+!![]]+([]+{})[+!![]]+(!![]+[])[+!![]]+(!![]+[])[+[]]][([]+{})[!+[]+!![]+!![]+!![]+!![]]+([]+{})[+!![]]+([][[]]+[])[+!![]]+(![]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+[]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(!![]+[])[+[]]+([]+{})[+!![]]+(!![]+[])[+!![]]]((!![]+[])[+!![]]+([][[]]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+([][[]]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]+!![]+!![]]+(![]+[])[!+[]+!![]]+([]+{})[+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(+{}+[])[+!![]]+(!![]+[])[+[]]+([][[]]+[])[!+[]+!![]+!![]+!![]+!![]]+([]+{})[+!![]]+([][[]]+[])[+!![]])())[+[]]+([][[]]+[])[!+[]+!![]+!![]]+(![]+[])[!+[]+!![]]+(![]+[])[!+[]+!![]]+([]+{})[+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]+!![]+!![]]+[][(![]+[])[!+[]+!![]+!![]]+([]+{})[+!![]]+(!![]+[])[+!![]]+(!![]+[])[+[]]][([]+{})[!+[]+!![]+!![]+!![]+!![]]+([]+{})[+!![]]+([][[]]+[])[+!![]]+(![]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+[]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(!![]+[])[+[]]+([]+{})[+!![]]+(!![]+[])[+!![]]]((!![]+[])[+!![]]+([][[]]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+([][[]]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]+!![]+!![]]+([][[]]+[])[+[]]+([][[]]+[])[+!![]]+([][[]]+[])[!+[]+!![]+!![]]+(![]+[])[!+[]+!![]+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(+{}+[])[+!![]]+([]+[][(![]+[])[!+[]+!![]+!![]]+([]+{})[+!![]]+(!![]+[])[+!![]]+(!![]+[])[+[]]][([]+{})[!+[]+!![]+!![]+!![]+!![]]+([]+{})[+!![]]+([][[]]+[])[+!![]]+(![]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+[]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(!![]+[])[+[]]+([]+{})[+!![]]+(!![]+[])[+!![]]]((!![]+[])[+!![]]+([][[]]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+([][[]]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]+!![]+!![]]+(![]+[])[!+[]+!![]]+([]+{})[+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(+{}+[])[+!![]]+(!![]+[])[+[]]+([][[]]+[])[!+[]+!![]+!![]+!![]+!![]]+([]+{})[+!![]]+([][[]]+[])[+!![]])())[!+[]+!![]+!![]]+([][[]]+[])[!+[]+!![]+!![]])()([][(![]+[])[!+[]+!![]+!![]]+([]+{})[+!![]]+(!![]+[])[+!![]]+(!![]+[])[+[]]][([]+{})[!+[]+!![]+!![]+!![]+!![]]+([]+{})[+!![]]+([][[]]+[])[+!![]]+(![]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+[]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(!![]+[])[+[]]+([]+{})[+!![]]+(!![]+[])[+!![]]]((!![]+[])[+!![]]+([][[]]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+([][[]]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]+!![]+!![]]+([][[]]+[])[!+[]+!![]+!![]]+(![]+[])[!+[]+!![]+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(+{}+[])[+!![]]+([]+[][(![]+[])[!+[]+!![]+!![]]+([]+{})[+!![]]+(!![]+[])[+!![]]+(!![]+[])[+[]]][([]+{})[!+[]+!![]+!![]+!![]+!![]]+([]+{})[+!![]]+([][[]]+[])[+!![]]+(![]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+[]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(!![]+[])[+[]]+([]+{})[+!![]]+(!![]+[])[+!![]]]((!![]+[])[+!![]]+([][[]]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+([][[]]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]+!![]+!![]]+(![]+[])[!+[]+!![]]+([]+{})[+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(+{}+[])[+!![]]+(!![]+[])[+[]]+([][[]]+[])[!+[]+!![]+!![]+!![]+!![]]+([]+{})[+!![]]+([][[]]+[])[+!![]])())[!+[]+!![]+!![]]+([][[]]+[])[!+[]+!![]+!![]])()(([]+{})[+[]])[+[]]+(!+[]+!![]+!![]+!![]+!![]+!![]+!![]+[])+(!+[]+!![]+!![]+!![]+!![]+!![]+!![]+[]))+([]+{})[+!![]]+(!![]+[])[+!![]]+(![]+[])[!+[]+!![]]+([][[]]+[])[!+[]+!![]]+[][(![]+[])[!+[]+!![]+!![]]+([]+{})[+!![]]+(!![]+[])[+!![]]+(!![]+[])[+[]]][([]+{})[!+[]+!![]+!![]+!![]+!![]]+([]+{})[+!![]]+([][[]]+[])[+!![]]+(![]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+[]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(!![]+[])[+[]]+([]+{})[+!![]]+(!![]+[])[+!![]]]((!![]+[])[+!![]]+([][[]]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+([][[]]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]+!![]+!![]]+([][[]]+[])[+[]]+([][[]]+[])[+!![]]+([][[]]+[])[!+[]+!![]+!![]]+(![]+[])[!+[]+!![]+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(+{}+[])[+!![]]+([]+[][(![]+[])[!+[]+!![]+!![]]+([]+{})[+!![]]+(!![]+[])[+!![]]+(!![]+[])[+[]]][([]+{})[!+[]+!![]+!![]+!![]+!![]]+([]+{})[+!![]]+([][[]]+[])[+!![]]+(![]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+[]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(!![]+[])[+[]]+([]+{})[+!![]]+(!![]+[])[+!![]]]((!![]+[])[+!![]]+([][[]]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+([][[]]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]+!![]+!![]]+(![]+[])[!+[]+!![]]+([]+{})[+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(+{}+[])[+!![]]+(!![]+[])[+[]]+([][[]]+[])[!+[]+!![]+!![]+!![]+!![]]+([]+{})[+!![]]+([][[]]+[])[+!![]])())[!+[]+!![]+!![]]+([][[]]+[])[!+[]+!![]+!![]])()([][(![]+[])[!+[]+!![]+!![]]+([]+{})[+!![]]+(!![]+[])[+!![]]+(!![]+[])[+[]]][([]+{})[!+[]+!![]+!![]+!![]+!![]]+([]+{})[+!![]]+([][[]]+[])[+!![]]+(![]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+[]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(!![]+[])[+[]]+([]+{})[+!![]]+(!![]+[])[+!![]]]((!![]+[])[+!![]]+([][[]]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+([][[]]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]+!![]+!![]]+([][[]]+[])[!+[]+!![]+!![]]+(![]+[])[!+[]+!![]+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(+{}+[])[+!![]]+([]+[][(![]+[])[!+[]+!![]+!![]]+([]+{})[+!![]]+(!![]+[])[+!![]]+(!![]+[])[+[]]][([]+{})[!+[]+!![]+!![]+!![]+!![]]+([]+{})[+!![]]+([][[]]+[])[+!![]]+(![]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+[]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(!![]+[])[+[]]+([]+{})[+!![]]+(!![]+[])[+!![]]]((!![]+[])[+!![]]+([][[]]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+([][[]]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]+!![]+!![]]+(![]+[])[!+[]+!![]]+([]+{})[+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(+{}+[])[+!![]]+(!![]+[])[+[]]+([][[]]+[])[!+[]+!![]+!![]+!![]+!![]]+([]+{})[+!![]]+([][[]]+[])[+!![]])())[!+[]+!![]+!![]]+([][[]]+[])[!+[]+!![]+!![]])()(([]+{})[+[]])[+[]]+(!+[]+!![]+[])+(+!![]+[]))
```

居然能运行，牛逼的隐式转换![](https://mmbiz.qpic.cn/mmbiz_jpg/aVp1YC8UV0ftCHLbFxOBHXibIdC23gicG2potow5IT5JZqoalbUDUtewpyMVrtvNna5p3WicbFVDpjwQ7sw2kxg4A/640?wx_fmt=jpeg)![](https://mmbiz.qpic.cn/mmbiz_jpg/aVp1YC8UV0ftCHLbFxOBHXibIdC23gicG2zfUDYnmLIrBicqXib2XdSa8tI7Z2gHHqk68JZJcz9snqTc7nIt3Ibv0Q/640?wx_fmt=jpeg)

#### 18、parseInt(0.0000008) === 8

![](https://mmbiz.qpic.cn/mmbiz_jpg/aVp1YC8UV0ftCHLbFxOBHXibIdC23gicG2rq8SQQ3gKgkiaBOFHZjY0a56iaaZq5omibpGcYyHzaB8kEbCRQEUopWpw/640?wx_fmt=jpeg)

![](https://mmbiz.qpic.cn/mmbiz_jpg/aVp1YC8UV0ftCHLbFxOBHXibIdC23gicG2UlibYzO7gNpic4rgLscsvrj2CfzP8LxwDXbVU5VjrB0DWTPByP5icibZeg/640?wx_fmt=jpeg)

#### 19、++[[]][+[]]+[+[]] == 10

![](https://mmbiz.qpic.cn/mmbiz_jpg/aVp1YC8UV0ftCHLbFxOBHXibIdC23gicG2g2wWWibX2ibT7qgpG53eSqGxOmCXcTia235sT3gic9icRhYxYr7fiawXWjicw/640?wx_fmt=jpeg)

强大的隐式转换，23333

![](https://mmbiz.qpic.cn/mmbiz_jpg/aVp1YC8UV0ftCHLbFxOBHXibIdC23gicG2QOiaDgr8U9K7FCDSc7glMSt8gBJj2ZyUxbgpcdNShMxs1KWIOBvKjEw/640?wx_fmt=jpeg)

#### 20、0.1 + 0.2 == 0.3

![](https://mmbiz.qpic.cn/mmbiz_jpg/aVp1YC8UV0ftCHLbFxOBHXibIdC23gicG2vNaPzzHcibY7qepggBc7Rf5aCAZpohicIOrkicYe622ohlEYTcufg6qtw/640?wx_fmt=jpeg)

`0.1+0.2==0.3` 竟然是不成立的。。。。所以这就是为什么数据库存储对于货币的最小单位都是分。

简单说， `0.1`和 `0.2`的二进制浮点表示都不是精确的，所以相加后不是 `0.3`，接近（不等于） `0.30000000000000004`。

所以，比较数字时，应该有个宽容值。ES6 中这个宽容值被预定义了：`Number.EPSILON`。

![](https://mmbiz.qpic.cn/mmbiz_jpg/aVp1YC8UV0ftCHLbFxOBHXibIdC23gicG2AdolkBM35YqtpywfA05QDLXmkPibR6wjxKrh30sMFHrT5Caa64pTpdQ/640?wx_fmt=jpeg)

#### 21、最短的代码实现数组去重

```
[...new Set([1, "1", 2, 1, 1, 3])]
```

前不久面试阿里就问了这道题，哈哈，所以也写上一下

![](https://mmbiz.qpic.cn/mmbiz_jpg/aVp1YC8UV0ftCHLbFxOBHXibIdC23gicG2xxEKSUTEX69ADzjibS6Et51E7g8R9ib3zGicXDiacHCHV1EhOcKeYmE4zQ/640?wx_fmt=jpeg)

#### 22、用最短的代码实现一个长度为 m(6) 且值都 n(8) 的数组

```
Array(6).fill(8)
```

这个够短了吧，好像是当初哪里看到的一个面试题，就自己想到了 ES6 的一些 API

![](https://mmbiz.qpic.cn/mmbiz_jpg/aVp1YC8UV0ftCHLbFxOBHXibIdC23gicG2BxpeJwiav8O0hPxTUJDrXAdNaAiaqEj7FyR0UISsVUYSwc3ZiagXlVruQ/640?wx_fmt=jpeg)

#### 23、短路表达式

条件判断

```
var a = b && 1
    // 相当于
if (b) {
    a = 1
} else {
    a = b
}

var a = b || 1
    // 相当于
if (b) {
    a = b
} else {
    a = 1
}
```

#### 24、JavaScript 版迷宫

![](https://mmbiz.qpic.cn/mmbiz_jpg/aVp1YC8UV0ftCHLbFxOBHXibIdC23gicG2kr85hL5cLEZ3VKcCdbEHqE9PqfSEjZZZI1GsfFV0NN2icBFumoSJVoA/640?wx_fmt=jpeg)逃出迷宫，2333![](https://mmbiz.qpic.cn/mmbiz_png/aVp1YC8UV0ftCHLbFxOBHXibIdC23gicG2vRHuGkd1kkKlpzmiauAPqSRNiasQ9smVNTGJpICEGd2P8dkMIeger5vQ/640?wx_fmt=gif)

#### 25、取出一个数组中的最大值和最小值

```
var numbers = [5, 458 , 120 , -215 , 228 , 400 , 122205, -85411]; 
var maxInNumbers = Math.max.apply(Math, numbers); 
var minInNumbers = Math.min.apply(Math, numbers);
```

![](https://mmbiz.qpic.cn/mmbiz_jpg/aVp1YC8UV0ftCHLbFxOBHXibIdC23gicG2RBzLWzQxzS3HrViaFgBCGqG9iaPiakicCQQnm27x3n3t6hyjiaDo72XKeWA/640?wx_fmt=jpeg)

#### 26、将 argruments 对象转换成数组

```
var argArray = Array.prototype.slice.call(arguments);

或者ES6：

var argArray = Array.from(arguments)
```

#### 27、javascript 高逼格之 Function 构造函数

很多 JavaScript 教程都告诉我们，不要直接用内置对象的构造函数来创建基本变量，例如 var arr = new Array(2); 的写法就应该用 var arr = [1, 2]; 的写法来取代。

但是，Function 构造函数（注意是大写的 Function）有点特别。Function 构造函数接受的参数中，第一个是要传入的参数名，第二个是函数内的代码（用字符串来表示）。

```
var f = new Function('a', 'alert(a)');
f('jawil'); // 将会弹出窗口显示jawil
```

这种方式可以根据传入字符串内容来创建一个函数 是不是高大上？！![](https://mmbiz.qpic.cn/mmbiz_jpg/aVp1YC8UV0ftCHLbFxOBHXibIdC23gicG2PwMeJTPCyBnfqKejXsFRmcrfX4bLwTKicUFJNfwjb5jqicm8XIB5h2Hg/640?wx_fmt=jpeg)

#### 28、从一个数组中找到一个数，O(n) 的算法，找不到就返回 null。

正常的版本:

```
function find (x, y) {
  for ( let i = 0; i < x.length; i++ ) {
    if ( x[i] == y ) return i;
  }
  return null;
}

let arr = [0,1,2,3,4,5]
console.log(find(arr, 2))
console.log(find(arr, 8))
```

结果到了函数式成了下面这个样子（好像上面的那些代码在下面若影若现，不过又有点不太一样，为了消掉 if 语言，让其看上去更像一个表达式，动用了 ? 号表达式）：

```
//函数式的版本
const find = ( f => f(f) ) ( f =>
  (next => (x, y, i = 0) =>
    ( i >= x.length) ?  null :
      ( x[i] == y ) ? i :
        next(x, y, i+1))((...args) =>
          (f(f))(...args)))

let arr = [0,1,2,3,4,5]
console.log(find(arr, 2))
console.log(find(arr, 8))
```

**最后奉劝大家一句：莫装逼、白了少年头，2333。。。**

源自：https://segmentfault.com/a/1190000010752361

声明：文章著作权归作者所有，如有侵权，请联系小编删除。