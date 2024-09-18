> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/oJas0DfSXhAqJ-u63HZD0g)

```
作者：邵小白

https://juejin.cn/post/7137961562794852383

```

前言
--

不知道今年大家有没有感受到来自互联网的 “寒气”，至少我是感受到了，面试的时候手写代码时很常见很常见的事情了。有时候没遇到过还真一时半会写不出来，企业招聘的要求也是越来越高，尤其是一些大厂会对 JS 的功底有着更加苛刻的要求，所以学会手写常见的 JS 模块好像已经快变为一个基本技能了，也慢慢变为我们手写 webpack 手写 mini-vue 的一个 `coding` 基础 了。当然我们也不完全是为了去准备面试而去学习这些常见模块。死磕这些难啃的骨头之后，你会从中学到很多优秀的思想，对你的职业生涯也是很有帮助的。而且阅读代码本身就是一个很好的习惯，读懂并且理解写代码人的思维逻辑更加重要。

> 本文中涉及到的手写模块，大多数都是从网上的博客、面筋、牛客网以及自己的面试经验借鉴而来的。希望能对你有个帮助。

基础手写
----

### 全排列（力扣原题）

要求以数组的形式返回字符串参数的所有排列组合。

注意：

1.  ```
    字符串参数中的字符无重复且仅包含小写字母
    
    
    ```
    
2.  ```
    返回的排列组合数组不区分顺序
    
    
    ```
    

```
const _permute = string => {
  const result = []
  const map = new Map()
  const dfs = (path) => {
    if (path.length === string.length) {
      result.push(path)
      return
    }
    for (let i = 0; i < string.length; i++) {
      if (map.get(string[i])) continue
      map.set(string[i], true)
      path += string[i]
      dfs(path)
      path = path.substring(0, path.length - 1)
      map.set(string[i], false)
    }
  }
  dfs('')
  return result
}
console.log(_permute('abc')) // [ 'abc', 'acb', 'bac', 'bca', 'cab', 'cba' ]
复制代码


```

### instanceof

*   如果 target 为基本数据类型直接返回 false
    
*   判断 Fn.prototype 是否在 target 的隐式原型链上
    

```
const _instanceof = (target, Fn) => {
  if ((typeof target !== 'object' && typeof target !== 'function') || target === null)
  return false
  
  let proto = target.__proto__
  while (true) {
    if (proto === null) return false
    if (proto === Fn.prototype) return true
    proto = proto.__proto__
  }
}
function A() {}
const a = new A()
console.log(_instanceof(a, A)) // true
console.log(_instanceof(1, A)) // false
复制代码


```

### Array.prototype.map

*   map 中的 exc 接受三个参数，分别是: 元素值、元素下标和原数组
    
*   map 返回的是一个新的数组，地址不一样
    

```
// 这里不能直接使用箭头函数，否则无法访问到 this
Array.prototype._map = function (exc) {
  const result = []
  this.forEach((item, index, arr) => {
    result[index] = exc(item, index, arr)
  })
  return result
}
const a = new Array(2).fill(2)
console.log(a.map((item, index, arr) => item * index + 1)) // [1,3]
console.log(a._map((item, index, arr) => item * index + 1))// [1,3]
复制代码


```

### Array.prototype.filter

*   filter 中的 exc 接受三个参数，与 map 一致，主要实现的是数组的过滤功能，会根据 exc 函数的返回值来判断是否 “留下” 该值。
    
*   filter 返回的是一个新的数组，地址不一致。
    

```
Array.prototype._filter = function (exc) {
  const result = []
  this.forEach((item, index, arr) => {
    if (exc(item, index, arr)) {
      result.push(item)
    }
  })
  return result
}
const b = [1, 3, 4, 5, 6, 2, 5, 1, 8, 20]

console.log(b._filter(item => item % 2 === 0)) // [ 4, 6, 2, 8, 20 ]
复制代码


```

### Array.prototype.reduce

*   reduce 接受两个参数，第一个为 exc 函数，第二个为初始值，如果不传默认为 0
    
*   reduce 最终会返回一个值，当然不一定是 Number 类型的，取决于你是怎么计算的，每次的计算结果都会作为下次 exc 中的第一个参数
    

```
Array.prototype._reduce = function (exc, initial = 0) {
  let result = initial
  this.forEach((item) => {
    result = exc(result, item)
  })
  return result
}
console.log(b.reduce((pre, cur) => pre + cur, 0)) // 55
console.log(b._reduce((pre, cur) => pre + cur, 0)) // 55
复制代码


```

### Object.create

MDN[1] Object.create() 方法用于创建一个新对象，使用现有的对象来作为新创建对象的原型（prototype）。

```
Object.prototype._create = function (proto) {
  const Fn = function () { }
  Fn.prototype = proto
  return new Fn()
}
function A() { }
const obj = Object.create(A)
const obj2 = Object._create(A)
console.log(obj.__proto__ === A) // true
console.log(obj.__proto__ === A) // true
复制代码


```

### Function.prototype.call

call() 方法使用一个指定的 this 值和单独给出的一个或多个参数来调用一个函数。

```
Function.prototype._call = function (ctx, ...args) {
  // 如果不为空，则需要进行对象包装
  const o = ctx == undefined ? window : Object(ctx)
  // 给 ctx 添加独一无二的属性
  const key = Symbol()
  o[key] = this
  // 执行函数，得到返回结果
  const result = o[key](...args)
  // 删除该属性
  delete o[key]
  return result
}

const obj = {
  name: '11',
  fun() {
    console.log(this.name)
  }
}

const obj2 = { name: '22' }
obj.fun() // 11
obj.fun.call(obj2) // 22
obj.fun._call(obj2) // 22
复制代码


```

### Function.prototype.bind

bind() 方法创建一个新的函数，在 bind() 被调用时，这个新函数的 this 被指定为 bind() 的第一个参数，而其余参数将作为新函数的参数，供调用时使用。

```
const obj = {
  name: '11',
  fun() {
    console.log(this.name)
  }
}
Function.prototype._bind = function (ctx, ...args) {
  // 获取函数体
  const _self = this
  // 用一个新函数包裹，避免立即执行
  const bindFn = (...reset) => {
    return _self.call(ctx, ...args, ...reset)
  }
  return bindFn
}
const obj2 = { name: '22' }
obj.fun() // 11
const fn = obj.fun.bind(obj2)
const fn2 = obj.fun._bind(obj2)
fn() // 22
fn2() // 22
复制代码


```

### New 关键字

new 运算符创建一个用户定义的对象类型的实例或具有构造函数的内置对象的实例。

```
const _new = function(constructor) {
  // 创建一个空对象
  const obj = {}
  // 原型链挂载
  obj.__proto__ = constructor.prototype;
  // 将obj 复制给构造体中的 this，并且返回结果
  const result = constructor.call(obj)
  // 如果返回对象不为一个对象则直接返回刚才创建的对象
  return typeof result === 'object' && result !== null ? : result : obj
}
复制代码


```

### 浅拷贝

```
const _shallowClone = target => {
  // 基本数据类型直接返回
  if (typeof target === 'object' && target !== null) {
    // 获取target 的构造体
    const constructor = target.constructor
    // 如果构造体为以下几种类型直接返回
    if (/^(Function|RegExp|Date|Map|Set)$/i.test(constructor.name)) return target
    // 判断是否是一个数组
    const cloneTarget = Array.isArray(target) ? [] : {}
    for (prop in target) {
      // 只拷贝其自身的属性
      if (target.hasOwnProperty(prop)) {
        cloneTarget[prop] = target[prop]
      }
    }
    return cloneTarget
  } else {
    return target
  }
}
复制代码


```

### 深拷贝

实现思路和浅拷贝一致，只不过需要注意几点

1.  ```
    函数 正则 日期 ES6新对象 等不是直接返回其地址，而是重新创建
    
    
    ```
    
2.  ```
    需要避免出现循环引用的情况
    
    
    ```
    

```
const _completeDeepClone = (target, map = new WeakMap()) => {
  // 基本数据类型，直接返回
  if (typeof target !== 'object' || target === null) return target
  // 函数 正则 日期 ES6新对象,执行构造题，返回新的对象
  const constructor = target.constructor
  if (/^(Function|RegExp|Date|Map|Set)$/i.test(constructor.name)) return new constructor(target)
  // map标记每一个出现过的属性，避免循环引用
  if (map.get(target)) return map.get(target)
  map.set(target, true)
  const cloneTarget = Array.isArray(target) ? [] : {}
  for (prop in target) {
    if (target.hasOwnProperty(prop)) {
      cloneTarget[prop] = _completeDeepClone(target[prop], map)
    }
  }
  return cloneTarget
}
复制代码


```

### **寄生组合式继承**

一图胜千言

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKntlVGVJwYjMwuP4ss6icD5ia5Fp3CiaRSV2rf79bMkoISz8sL76jAEopxbdfdicjKaWXrwTIGuFdhk5A/640?wx_fmt=jpeg&wxfrom=5&wx_lazy=1&wx_co=1)

```
function Parent(name) {
  this.name = name
}
Parent.prototype.getName = function () {
  return this.name
}

function Son(name, age) {
  // 这里其实就等于 this.name = name
  Parent.call(this, name)
  this.age = age
}

Son.prototype.getAge = function () {
  return this.age
}
Son.prototype.__proto__ = Object.create(Parent.prototype)

const son1 = new Son('shao', 20)

console.log(son1.getName()) // shao
console.log(son1.getAge()) // 20
复制代码


```

### 发布订阅者模式

```
class EventEmitter {
  constructor() {
    // key: 事件名
    // value: callback [] 回调数组
    this.events = {}
  }
  on(name, callback) {
    if (this.events[name]) {
      this.events[name].push(callback)
    } else {
      this.events[name] = [callback]
    }
  }
  off(name, callback) {
    if (!this.message[name]) return;
    if (!callback) {
      // 如果没有callback,就删掉整个事件
      this.message[name] = undefined;
    }
    this.message[name] = this.message[name].filter((item) => item !== callback);

  }
  emit(name, ...args) {
    if (!this.events[name]) return
    this.events[name].forEach(cb => cb(...args))
  }
}
复制代码


```

### 观察者模式

```
class Observerd {
  constructor() {
    // 我要看看到底有多少人在观察俺
    this.observerList = []
  }
  addObserver(observer) {
    // 添加一个观察俺的人
    this.observerList.push(observer)
  }
  notify() {
    // 我要闹点动静，所有观察者都会知道这个信息，具体怎么做就是他们自己的事情了
    this.observerList.forEach(observer => observer.update())
  }
}


class Observer {
  constructor(doSome) {
    // 观察到小白鼠有动静之后，观察者做的事情
    this.doSome = doSome
  }
  update() {
    console.log(this.doSome)
  }
}

const ob1 = new Observer('我是ob1，我观察到小白鼠有反应了，太饿了，我得去吃个饭了')
const ob2 = new Observer('我是ob2，我观察到小白鼠有反应了，我要继续工作！')
const xiaoBaiShu = new Observerd()
xiaoBaiShu.addObserver(ob1)
xiaoBaiShu.addObserver(ob2)
xiaoBaiShu.notify() // .... .... 
复制代码


```

多说一句：怎么理解发布订阅者和观察者的区别呢 ？

其实发布订阅者模式只有一个中间者，好像啥事情都需要它亲自来做。而且仔细观察的话，发布订阅者模式会存在一个事件名和事件的对应关系，今天可以发布天气预报，只有订阅了天气预报的才会被通知，订阅了 KFC 疯狂星期四闹钟事件 的不会被提醒。

**而观察者模式，等被观察者发出了一点动静（执行 notify），所有观察者都会被通知。**

### 节流

节流函数（throttle）就是让事件处理函数（handler）在大于等于执行周期时才能执行，周期之内不执行，即事件一直被触发，那么事件将会按每小段固定时间一次的频率执行。

```
function throttle(fn, delay = 300) {
  // 这里始终记得字节二面的时候，建议我不写 flag 好家伙
  let isThrottling = false
  // 核心思路，函数多次执行只有当 isThrottling 为 false 时才会进入函数体
  return function (...args) {
    if (!isThrottling) {
      isThrottling = true
      setTimeout(() => {
        isThrottling = false
        fn.apply(this, args)
      }, delay)
    }
  }
}
复制代码


```

### 防抖

事件响应函数在一段时间后才执行，如果这段时间内再次调用，则重新计算执行时间

```
function debounce(fn, delay = 300) {
  let timer = null
  return function (...args) {
    // 每次进来都会清空定时器，所以在 delay 事件中重复执行之后执行最后一次
    clearInterval(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}
复制代码


```

### once 函数

函数返回结果会被缓存下来，只会计算一次。

```
const f = (x) => x;
const onceF = once(f);
//=> 3
onceF(3);
//=> 3
onceF(4);
复制代码


```

```
const once = (fn) => {
  let res, isFirst = true
  return function (...args) {
    if (!isFirst) return res
    res = fn.call(this, ...args)
    isFirst = false
    return res
  }
}
复制代码


```

### 累加函数应用

实现一个累加函数，下面的几种情况都能正确的调用。

```
console.log(sum(1, 2)(3)()) // 6
console.log(sum(1)(2)(3)()) // 6
console.log(sum(1, 2, 4)(4)()) // 11
复制代码


```

```
function sum(...args) {
  let params = args
  const _sum = (...newArgs) => {
    if (newArgs.length === 0) {
      return params.reduce((pre, cur) => pre + cur, 0)
    } else {
      params = [...params, ...newArgs]
      return _sum
    }
  }
  return _sum
}
复制代码


```

进阶
--

### 实现 repeat 方法

```
function repeat(fn, times, delay) {
  return async function (...args) {
    for (let i = 0; i < times; i++) {
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          fn.call(this, ...args)
          resolve()
        }, delay)
      })
    }
  }
}
const repeatFn = repeat(console.log, 4, 1000)
// 函数调用四次，每次间隔 1s 打印 hello
repeatFn('hello')
复制代码


```

### 实现 Promise.all/race/allSettled/any

*   Promise 身上的这些方法返回的都是一个 Promise
    

*   Promise.resolve 接受一个 Promise，若非 promise 则将其变成功状态的 Promise
    

```
// 有一个失败则返回失败的结果，全部成功返回全成功的数组
Promise.all = function (promiseList = []) {
  return new Promise((resolve, reject) => {
    const result = []
    let count = 0
    if (promiseList.length === 0) {
      resolve(result)
      return
    }
    for (let i = 0; i < promiseList.length; i++) {
      Promise.resolve(promiseList[i]).then(res => {
        result[i] = res
        count++
        // 不能直接通过 result.length 进行比较，因为 会存在下标大的先赋值
        // 例如 i = 3 第一个返回结果，此时数组变为[empty,empty,empty,res]
        if (count === promiseList.length) {
          resolve(result)
        }
      }).catch(e => {
        reject(e)
      })
    }
  })
}
// 返回第一个成功或失败的结果
Promise.race = function (promiseList = []) {
  return new Promise((resolve, reject) => {
    if (promiseList.length === 0) {
      return resolve([])
    }
    for (let i = 0; i < promiseList.length; i++) {
      Promise.resolve(promiseList[i]).then(res => {
        resolve(res)
      }).catch(e => {
        reject(e)
      })
    }
  })
}
// 无论成功约否都返回，但是会添加一个 status 字段用于标记成功/失败
Promise.allSettled = function (promiseList = []) {
  return new Promise((resolve, reject) => {
    const result = []
    let count = 0

    const addRes = (i, data) => {
      result[i] = data
      count++
      if (count === promiseList.length) {
        resolve(result)
      }
    }
    
    if (promiseList.length === 0) return resolve(result)
    for (let i = 0; i < promiseList.length; i++) {
      Promise.resolve(promiseList[i]).then(res => {
        addRes(i, { status: 'fulfilled', data: res })
      }).catch(e => {
        addRes(i, { status: 'rejected', data: e })
      })
    }
  })
}
// AggregateError，当多个错误需要包装在一个错误中时，该对象表示一个错误。
// 和 Promise.all 相反，全部失败返回失败的结果数组，有一个成功则返回成功结果
Promise.any = function (promiseList = []) {
  return new Promise((resolve, reject) => {
    if (promiseList.length === 0) return resolve([])
    let count = 0
    const result = []
    for (let i = 0; i < promiseList.length; i++) {
      Promise.resolve(promiseList[i]).then(res => {
        resolve(res)
      }).catch(e => {
        count++
        result[i] = e
        if (count === promiseList.length) {
          reject(new AggregateError(result))
        }
      })
    }
  })
}
复制代码


```

### 整数千分位加逗号

```
1234567 -> 1,234,567
复制代码


```

```
function toThousands(num) {
  num = num.toString()
  let result = ''
  while (num.length > 3) {
    result = ',' + num.substring(num.length - 3) + result
    num = num.substring(0, num.length - 3)
  }
  result = num + result
  return result
}
console.log(toThousands(1234567)) // 1,234,567
console.log(toThousands(123456)) // 123,456
复制代码


```

### 洗牌函数

有几张牌张牌，用 js 来进行乱序排列，要保持公平性

```
const shuffle = (arr) => {
  // 不影响原来的数组
  const result = [...arr]
  for (let i = result.length; i > 0; i--) {
    // 随机从 [0,i - 1] 产生一个 index, 将 i - 1 于 index 对应数组的值进行交换
    const index = Math.floor(Math.random() * i);
    [result[index], result[i - 1]] = [result[i - 1], result[index]]
  }
  return result
}
const arr = [1, 2, 3, 4, 5]
console.log(shuffle(arr)) // [ 3, 1, 2, 5, 4 ]
console.log(shuffle(arr)) // [ 2, 3, 5, 1, 4 ]
console.log(shuffle(arr)) // [ 4, 2, 3, 1, 5 ]
console.log(shuffle(arr)) // [ 5, 4, 2, 3, 1 ]
复制代码


```

### 手写 LRU

LRU 是 Least Recently Used 的缩写，即最近最少使用，是一种常用的页面置换算法 [2]，选择最近最久未使用的页面予以淘汰。该算法赋予每个页面 [3] 一个访问字段，用来记录一个页面自上次被访问以来所经历的时间 t，当须淘汰一个页面时，选择现有页面中其 t 值最大的，即最近最少使用的页面予以淘汰。

力扣地址 [4]

```
/**
 * @param {number} capacity
 */
var LRUCache = function(capacity) {
    this.map = new Map()
    this.capacity = capacity
};

/** 
 * @param {number} key
 * @return {number}
 */
LRUCache.prototype.get = function(key) {
    if(this.map.has(key)){
        const value = this.map.get(key)
        // 更新存储位置
        this.map.delete(key)
        this.map.set(key,value)
        return value
    }
    return - 1
};

/** 
 * @param {number} key 
 * @param {number} value
 * @return {void}
 */
LRUCache.prototype.put = function(key, value) {
    if(this.map.has(key)){
        this.map.delete(key)
    }
    this.map.set(key,value)
    // 如果此时超过了最长可存储范围
    if(this.map.size > this.capacity){
        // 删除 map 中最久未使用的元素
        this.map.delete(this.map.keys().next().value)
    }
};
复制代码


```

更上一层楼
-----

### Generator

先看看下面输出的内容

```
async function getResult() {
    await new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(1);
            console.log(1);
        }, 1000);
    })
    await new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(2);
            console.log(2);
        }, 500);
    })
    await new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(3);
            console.log(3);
        }, 100);
    })

}
getResult()
// 1 2 3 
复制代码


```

那如何使用 Es6 中的 generator 实现类似的效果呢 ？

```
function* getResult(params) {
    yield new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(1);
            console.log(1);
        }, 1000);
    })
    yield new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(2);
            console.log(2);
        }, 500);
    })
    yield new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(3);
            console.log(3);
        }, 100);
    })
}
const gen = getResult()
// gen.next().value 就是每一次 yield 之后返回的 Promise
// gen.next() = {value: yeild 返回的数据,done: 迭代器是否走完}
gen.next().value.then(() => {
    gen.next().value.then(() => {
        gen.next();
    });
});// 依次打印 1 2 3
复制代码


```

将 gen.next() 封装一层，让其自己能够实现递归调用

```
const gen = getResult()
function co(g) {
  const nextObj = g.next();
  // 递归停止条件：当迭代器迭代到最后一个 yeild 
  if (nextObj.done) {
    return;
  }
  nextObj.value.then(()=>{
    co(g)
  })
}
co(gen)
复制代码


```

### async-pool

JS 控制并发请求， 参考文章 mp.weixin.qq.com/s/yWOPoef9i…[5]

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKntlVGVJwYjMwuP4ss6icD5ia8fEuO4KawprmdxJ40dVib2OibM1aOez5b0pgykrYdHIpThwaPyNRXztw/640?wx_fmt=jpeg&wxfrom=5&wx_lazy=1&wx_co=1)

aysnc-pool 的基本使用

```
const timeout = i => new Promise(resolve => setTimeout(() => resolve(i), i));
await asyncPool(2, [1000, 5000, 3000, 2000], timeout);
复制代码


```

asyncPool 这个函数接受三个参数

*   poolLimit（数字类型）：表示限制的并发数；
    
*   array（数组类型）：表示任务数组；
    
*   iteratorFn（函数类型）：表示迭代函数，用于实现对每个任务项进行处理，该函数会返回一个 Promise 对象或异步函数。
    

这里提醒一下，promise.then 中的函数执行是一异步的，而赋值是同步的

```
const a = Promise.resolve().then(()=>console.log(a))
// 等价于 此时 a 等于一个 pending 状态的 promise
const a = Promise.resolve().then()
a.then(()=>{
  console.log(a)
})
复制代码


```

手写实现，这部分可能会多花点时间。可以拷贝代码多调试几次就知道了

```
async function asyncPool(poolLimit, array, iteratorFn) {
  const ret = []; // 存储所有的异步任务
  const executing = []; // 存储正在执行的异步任务
  for (const item of array) {
    // 调用iteratorFn函数创建异步任务
    const p = Promise.resolve().then(() => iteratorFn(item, array));
    ret.push(p); // 保存新的异步任务

    // 当poolLimit值小于或等于总任务个数时，进行并发控制
    if (poolLimit <= array.length) {
      // 当任务完成后，从正在执行的任务数组中移除已完成的任务
      const e = p.then(() => executing.splice(executing.indexOf(e), 1));
      executing.push(e); // 保存正在执行的异步任务
      if (executing.length >= poolLimit) {
        await Promise.race(executing); // 等待较快的任务执行完成
      }
    }
  }
  return Promise.all(ret);
}

const timeout = i => new Promise(resolve => setTimeout(() => { console.log(i); resolve(i) }, i));
// 当然,limit <= 0 的时候 我们可以理解为只允许一个请求存在 
asyncPool(2, [1000, 5000, 3000, 2000], timeout).then(res => {
  console.log(res)
})
复制代码


```

总共花费 6 s 时间，符合预期

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKntlVGVJwYjMwuP4ss6icD5iaA9Su0TAlFl34CLT5Yxn7GSMibNYk6pcPQk1ia9GahlNOBjBFmsbjeZgw/640?wx_fmt=jpeg&wxfrom=5&wx_lazy=1&wx_co=1)

总结
--

收集这些手写的时候, 自己也学到了很多东西，其实也是一个查漏补缺的过程。感谢你看到这里，点赞收藏 `offer ++`。