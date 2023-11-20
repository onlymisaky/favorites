> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/bNkRQ_z9TPQ7B7ck4BqUIg)

![](https://mmbiz.qpic.cn/mmbiz_jpg/1NOXMW586ut8JycZlbs2FiaibrngiceLZXHn8QsEEQBD7nuiavt07LSHUrNvMgaeicWc2nVHibg0MqJwtIvNOggBwic4Q/640?wx_fmt=jpeg)

作者：chinamasters

https://segmentfault.com/a/1190000025157159

最近在深入研究 vue 源码，把学习过程中，看到的一些好玩的的函数方法收集起来做分享，希望对大家对深入学习 js 有所帮助。如果大家都能一眼看懂这些函数，说明技术还是不错的哦。

1. 数据类型判断
---------

Object.prototype.toString.call() 返回的数据格式为 `[object Object]`类型，然后用 slice 截取第 8 位到倒一位，得到结果为 `Object`

```
var _toString = Object.prototype.toString;function toRawType (value) {  return _toString.call(value).slice(8, -1)}
```

运行结果测试

```
toRawType({}) //  Object toRawType([])  // Array    toRawType(true) // BooleantoRawType(undefined) // UndefinedtoRawType(null) // NulltoRawType(function(){}) // Function
```

2. 利用闭包构造 map 缓存数据
------------------

vue 中判断我们写的组件名是不是`html`内置标签的时候，如果用数组类遍历那么将要循环很多次获取结果，如果把数组转为对象，把标签名设置为对象的`key`，那么不用依次遍历查找，只需要查找一次就能获取结果，提高了查找效率。

```
function makeMap (str, expectsLowerCase) {    // 构建闭包集合map    var map = Object.create(null);    var list = str.split(',');    for (var i = 0; i < list.length; i++) {      map[list[i]] = true;    }    return expectsLowerCase      ? function (val) { return map[val.toLowerCase()]; }      : function (val) { return map[val]; }}// 利用闭包，每次判断是否是内置标签只需调用isHTMLTagvar isHTMLTag = makeMap('html,body,base,head,link,meta,style,title')console.log('res', isHTMLTag('body')) // true
```

3. 二维数组扁平化
----------

vue 中`_createElement`格式化传入的`children`的时候用到了`simpleNormalizeChildren`函数，原来是为了拍平数组，使二维数组扁平化，类似`lodash`中的`flatten`方法。

```
// 先看lodash中的flatten_.flatten([1, [2, [3, [4]], 5]])// 得到结果为  [1, 2, [3, [4]], 5]// vue中function simpleNormalizeChildren (children) {  for (var i = 0; i < children.length; i++) {    if (Array.isArray(children[i])) {      return Array.prototype.concat.apply([], children)    }  }  return children}// es6中 等价于function simpleNormalizeChildren (children) {   return [].concat(...children)}
```

4. 方法拦截
-------

vue 中利用`Object.defineProperty`收集依赖，从而触发更新视图，但是数组却无法监测到数据的变化，但是为什么数组在使用`push` `pop`等方法的时候可以触发页面更新呢，那是因为 vue 内部拦截了这些方法。

```
// 重写push等方法，然后再把原型指回原方法  var ARRAY_METHOD = [ 'push', 'pop', 'shift', 'unshift', 'reverse',  'sort', 'splice' ];  var array_methods = Object.create(Array.prototype);  ARRAY_METHOD.forEach(method => {    array_methods[method] = function () {      // 拦截方法      console.log('调用的是拦截的 ' + method + ' 方法，进行依赖收集');      return Array.prototype[method].apply(this, arguments);    }  });
```

运行结果测试

```
var arr = [1,2,3]
arr.__proto__ = array_methods // 改变arr的原型
arr.unshift(6) // 打印结果: 调用的是拦截的 unshift 方法，进行依赖收集
```

5. 继承的实现
--------

vue 中调用`Vue.extend`实例化组件，`Vue.extend`就是`VueComponent`构造函数，而`VueComponent`利用`Object.create`继承 Vue，所以在平常开发中`Vue` 和 `Vue.extend`区别不是很大。这边主要学习用 es5 原生方法实现继承的，当然了，es6 中 class 类直接用`extends`继承。

```
// 继承方法   function inheritPrototype(Son, Father) {    var prototype = Object.create(Father.prototype)    prototype.constructor = Son    // 把Father.prototype赋值给 Son.prototype    Son.prototype = prototype  }  function Father(name) {    this.name = name    this.arr = [1,2,3]  }  Father.prototype.getName = function() {    console.log(this.name)  }  function Son(name, age) {    Father.call(this, name)    this.age = age  }  inheritPrototype(Son, Father)  Son.prototype.getAge = function() {    console.log(this.age)  }
```

运行结果测试

```
var son1 = new Son("AAA", 23)son1.getName()            //AAAson1.getAge()             //23son1.arr.push(4)          console.log(son1.arr)     //1,2,3,4var son2 = new Son("BBB", 24)son2.getName()            //BBBson2.getAge()             //24console.log(son2.arr)     //1,2,3
```

6. 执行一次
-------

`once` 方法相对比较简单，直接利用闭包实现就好了

```
function once (fn) {  var called = false;  return function () {    if (!called) {      called = true;      fn.apply(this, arguments);    }  }}
```

7. 浅拷贝
------

简单的深拷贝我们可以用 `JSON.stringify()` 来实现，不过 vue 源码中的`looseEqual` 浅拷贝写的也很有意思，先类型判断再递归调用，总体也不难，学一下思路。

```
function looseEqual (a, b) {  if (a === b) { return true }  var isObjectA = isObject(a);  var isObjectB = isObject(b);  if (isObjectA && isObjectB) {    try {      var isArrayA = Array.isArray(a);      var isArrayB = Array.isArray(b);      if (isArrayA && isArrayB) {        return a.length === b.length && a.every(function (e, i) {          return looseEqual(e, b[i])        })      } else if (!isArrayA && !isArrayB) {        var keysA = Object.keys(a);        var keysB = Object.keys(b);        return keysA.length === keysB.length && keysA.every(function (key) {          return looseEqual(a[key], b[key])        })      } else {        /* istanbul ignore next */        return false      }    } catch (e) {      /* istanbul ignore next */      return false    }  } else if (!isObjectA && !isObjectB) {    return String(a) === String(b)  } else {    return false  }}function isObject (obj) {  return obj !== null && typeof obj === 'object'}
```

就先分享这些函数，其他函数，后面继续补充，如有不对欢迎指正，谢谢！

```
最后
欢迎关注「前端瓶子君」，回复「交流」加入前端交流群！
回复「算法」，你可以每天学习一道大厂算法编程题（阿里、腾讯、百度、字节等等）或 leetcode，瓶子君都会在第二天解答哟！
另外，每周还有手写源码题，瓶子君也会解答哟！
》》面试官也在看的算法资料《《
“在看和转发”就是最大的支持

```