> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/XLReJB_xSh41Dbzjnb75lQ)

一、Object 的变化侦测
==============

1.1 API 的引入
-----------

### 1.1.1 Object.defineProperty()

   在 vue2.x 中，我们经常遇到当数据的值改变之后，该值在页面上被引用的部分也会更新这种情况。那么今天我们就来解开这神奇的面纱。

   Object.defineProperty() 可以用于监听某一对象对应的属性，监听类型主要分为值特性和访问器特性。它就是 vue2.x 响应式数据实现的基本原理。

### 1.1.2 值特性的配置

目标属性是否允许被删除、遍历访问、覆盖和该属性的值的配置。

```
<br style="visibility: visible;">let data = { }<br style="visibility: visible;">Object.defineProperty(data, 'age', {<br style="visibility: visible;">  configurable: false, // 被删除时,静默失败<br style="visibility: visible;">  writable: false,  // 被重写时,静默失败<br style="visibility: visible;">  enumerable: false, // 不可以枚通过for/in进行枚举<br style="visibility: visible;">  value: 23,// 该属性的值<br style="visibility: visible;">})
console.log(data.age); //23 
delete data.age        // 静默失败
console.log(data.age); //23 
data.age=30           // 静默失败
console.log(data.age); //23 
for (const key in data) {
  console.log(key,'key');   // 静默失败 age属性不能被访问!
}
```

### 1.1.3 访问器特性的配置

目标属性在被访问和赋值等操作完成之前进行劫持。

```
let person = {
    _name:'Jone' 
}
Object.defineProperty(person, 'name', { 
    get: () => { 
        console.log('GET');
        return person._name
    },
    set: (value) => {
        console.log('SET');
        person._name=value
    } 
})
console.log(person.name);  // 'GET'  'Jone'
person.name='Mike' // 'SET'
```

     通过上面的代码，我们疑惑为什么不配置一个 value 值属性而是要借助一个第三者属性_name 完成呢? 这个问题官方给出了解释:

**访问器属性不能和值属性中的 (writable 和 value) 同时配置。**

    **_我们深思一下: 如果说我为一个属性即配置了 value 属性又为他配置了 get 访问器属性。那么当我们访问该属性的时候，是以 get 访问器为准还是以 value 为准呢？_**

1.2 如何实现数据的劫持
-------------

如果要对 data 中数据进行深层次的劫持，我们可以使用 **深度优先搜索算法** 实现：

*   如果当前的键指向值的类型为**基本数据类型**，则使用 Object.defineProperty() 这一个 API 实现数据的劫持。
    
*   如果当前的键指向值的类型为**复杂数据类型中的 Object 类型**，则需要将这个 Object 中的键值对进行劫持。
    

1.3 实现数据的劫持
-----------

```
class Vue {
  constructor(rest) {
    let { data, watch } = rest
    this.$data = typeof data === 'function' ? data() : data
    this.initData(this.$data)
    // 开始递归
    this.observe(this.$data)
  } 
}

function observe(data) { 
  new Observer(data)
}

class Observer {
  constructor(data) {
    this.walk(data)
  }
  walk(data) {
    for (const key in data) {
      reactive(data, key, data[key])
    }
  }
}

function reactive(object, key, val) {
  let isArray = val instanceof Array
  let isObject = val instanceof Object
  // 如果键指向的对象为数组类型，本小节暂不处理。
  if(isArray) return
  // 如果键指向的对象为对象类型，则再对该对象进行递归。
  if (isObject) {
    return observe(val)
  }

  // 数据的劫持操作
  Object.defineProperty(object, key, {
    configurable: true,
    enumerable: true,
    get() {
      return val
    },
    set(value) {
      if (val !== value) {
        val = value
      }
    }
  })
}
```

过上述代码，我们不难发现：递归逻辑在实现的过程中，并不是函数自身的调用，而是将三个函数首位相接完成了递归的逻辑。下图是对三个函数实现递归逻辑的展示：

![](https://mmbiz.qpic.cn/mmbiz_png/AgAZPffVMkm5rgwUfRiaCzzNyQbMHARaXsruTY2T0a2AalM5GoIfVEgvVahh6928PT1CnX2h6ksGJ79FfA1zoqQ/640?wx_fmt=png)

1.4 为何需要进行依赖收集
--------------

在上文中我们对数据实现了劫持操作，**如果只是劫持数据其实并没有什么作用，因为我们需要的功能是当数据变化后对引用该数据的部分进行更新操作，所以我们还需要知道以下两个内容：**

*   **响应式数据在何处被引用（模板还是计算属性还是其他地方）。**
    
*   **当响应式数据发生变化后，通知引用该数据的部分进行更新。**
    

1.5 在何处收集、在何时通知更新
-----------------

### 1.5.1 何处收集

举个例子：

```
<template>
    <p>{{ name }}</p>
</template>
```

该模板中引用了响应式数据 name 的值。换句话说：**该模板中首先访问响应式数据 name 属性的值，再将对应的值放在模板对应的位置。所以，当 name 属性被访问的时候，在被访问的位置打上标注。换言之：该位置依赖了 name 属性的值，需要将这部分逻辑收集起来。**

恰巧， API 中 get（）访问器的用处不就是当数据被访问时，进行拦截操作吗？**所以我们应该在 get（）函数中进行依赖收集这个动作。**

### 1.5.2 何时通知更新

**当响应式数据的值发生变化之后，引用该数据的逻辑部分应当更新。**当响应式数据发生变化时，我们在哪里得知呢？**是不是可以在 set（）访问器进行通知更新呢？**

1.6 收集依赖的介绍
-----------

经过分析，我们知道需要在 get（） 函数中进行依赖的收集。那么收集到的依赖存放到哪里呢？我们是不是考虑将依赖存放到一个数组中或者一个对象中呢？

```
function reactive(object, key, val) {
  let dep = []
  Object.defineProperty(object, key, {
    configurable: true,
    enumerable: true,
    get() {
      // 依赖收集处，Dep.target 将他看做依赖。
      dep.push(Dep.target)
      return val
    },
    set(value) {
      if (val !== value) {
        // 依赖的触发
        dep.forEach(cb=>cb())
        val = value
      }
    }
  })
}
```

通过上述代码，我们新增一个数组 dep，用于存放被收集的依赖。值得注意的是，**由于 get() 和 set() 函数中均引用了其父级作用域中声明的变量 dep，形成了闭包。**

但是这样写耦合度较低，我们可以封装一个单独的 Dep 类让它专门负责依赖收集。

```
class Dep {
  constructor() {
    // 依赖收集的中心
    this.subs = []
  }
  // 依赖的收集
  add() {
    if (Dep.target) {
      this.subs.push(Dep.target)
    }
  }
  // 触发依赖对应的回调函数
  update() {
    let subs = this.subs.slice()
    subs.forEach(watch => {
      // 触发依赖的回调函数   
      watch.run()
    })
  }
}
```

然后我们改造一下依赖收集的动作对应的函数。

```
function reactive(object, key, val) {
    let dep = new Dep() 
    Object.defineProperty(object, key, {
        configurable: true,
        enumerable: true,
        get() {
            // 依赖收集处 
            dep.append() 
            return val
        },
        set(value) {
            if (val !== value) {
                // 依赖的触发
                dep.update(value)
                val = value
            }
        }
    })
}
```

1.7 依赖的介绍
---------

### 1.7.1 依赖是什么

当响应式数据被访问的时，收集 `谁`。当响应式数据发生变化时，通知 `谁`进行更新；这个`谁`就是依赖。由于响应式数据既有可能在模板中被引用，也有可能被引用在 computed 中，所以我们不妨封装一个类实例，**当需要收集的时候，直接收集该实例。当响应式数据发生变化时候，也只通知他一个，再有他通知其他地方进行更新。我们为这个实例起个名字吧，叫** `**Watcher**` **。**

### 1.7.2 依赖函数封装

1.  `当响应式数据被访问时，我们需要实例化一个对象，这个对象被收集的目标。`
    
2.  `当响应式数据发生变化时，该实例对象需要通知引用部分进行更新。`
    

```
// 依赖构造函数
class Watcher  {
  constructor(vm, key, cb) {
    this.vm = vm
    this.key = key
    this.cb = cb
    this.get()
  }
  get() {
    // 依赖收集的对象
    Dep.target = this
    //  Object.defineProperty 中的 get 函数会被调用。调用之后，依赖进行收集。
    this.vm[this.key]  
    Dep.target = undefined
  }
  run() {
    // 通知更新的能力
    // 为了防止this指针出现错误，我们重新绑定this指向。
    this.cb.apply(this.vm)
  }
}
```

1.8 模拟实现 vue 中的  watch 选项
-------------------------

在 vue 中，提供了一个 watch 侦听器选项，`它的功能是当响应式数据发生变化时，执行对应的回调函数`。结合之前的逻辑，我们封装一个属于我们的 watch 选项。

```
import { arrayProto } from './array.js'

class Vue {
  constructor(rest) {
    let { data, watch } = rest
    this.$data = typeof data === 'function' ? data() : data
    // 初始化响应式数据
    this.initData(this.$data)
    for (const key in this.$data) {
      Object.defineProperty(this, key, {
        configurable: true,
        enumerable: true,
        get() {
          return this.$data[key]
        },
        set(value) {
          this.$data[key] = value
        }
      })
    }
    // 初始化所有的侦听器
    this.initWatch(watch)

  }
  initData = () => {
    observe(this.$data)
  }

  initWatch(watch) {
    for (const key in watch) {
      this.$watch(key, watch[key])
    }
  }
  // 响应式数据在在侦听器中被引用
  $watch(key, cb) {
    new Watcher(this, key, cb)
  }
}
// 依赖的收集容器
class Dep {
  constructor() {
    this.deps = []
  }
  // 收集
  append() {
    if (Dep.target) {
      this.deps.push(Dep.target)
    }
  }
  // 触发
  update(newValue) {
    let subs = this.deps.slice()
    subs.forEach(watch => {
      watch.run(newValue)
    })

  }
}

// 依赖
class Watcher {
  constructor(vm, key, cb) {
    this.vm = vm
    this.cb = cb
    this.key = key
    this.get()
  }
  get() {
    Dep.target = this
    this.vm[this.key]
    Dep.target = undefined
  }
  run(newValue) {
    // 将变化前和变化后的值传给对应的回调函数。
    this.cb.call(this.vm, this.vm[this.key], newValue)
  }
}
// 递归实现
export function observe(data) {
  if (typeof data !== 'object') { return }
  new Observer(data)
}

class Observer {
  constructor(data) {
    if (Array.isArray(data)) { 
      // 数组需要单独处理
    } else {
      this.walk(data)
    }
  }
  walk(data) {
    for (const key in data) {
      if (typeof data[key] === 'object') {
        observe(data[key])
      }
      reactive(data, key, data[key])
    }
  }
}

function reactive(object, key, val) {
  let dep = new Dep()
  Object.defineProperty(object, key, {
    configurable: true,
    enumerable: true,
    get() {
      // 依赖收集处 
      dep.append()
      return val
    },
    set(value) {
      if (val !== value) {
        // 依赖的触发
        dep.update(value)
        val = value
      }
    }
  })
}

// 测试数据
let vm = new Vue({
  data() {
    return {
      name: 'zs',
      age: 23,
      sex: 'nan',
      hobby: [1, [2], 3, 4]
    }
  },
  watch: {
    age() {
      console.log('age变化了,哈哈哈');
    },
    hobby() {
      console.log('hobby变化了,hobby', this.hobby);
    },
  }
})
vm.name = 'll'  // name变化了,hhh
console.log(vm, 'vv');
vm.$data.hobby.push()
```

二、Array 的变化侦测
=============

2.1 如何实现数据的劫持
-------------

如果要对数组中的每一个元素实现数据的劫持，我们依然可以通过 Object.defineProperty() 这个内置的 API 递归实现。**但是，如果用户声明了一个拥有 100 个元素的数组，那在对该数组进行递归劫持时，是不是会占用大量的内存呢？所以，vue 在对数组进行劫持操作时，并没有采用这种方法。**

所谓数组的劫持，通俗的来说就是当数组中的元素被访问（或者被修改）时，外界可以感知到。

**当数组中的元素被访问时，指向数组的变量名一定会收到通知，所以我们依旧在 get 中实现劫持数组被访问的操作。那如何实现当数组中的元素被修改时也能被外界感知这一功能呢？**`**我们是不是可以通过劫持能够改变数组中元素的实例方法完成呢?**`

2.2 数组的劫持
---------

经过上文得知，我们需要对原型对象中能够改变数组中数据的`7`个实例方法进行劫持操作。**既要实现数组的劫持，又要完成其对应的功能。**

```
const ArrayProto = Array.prototype
export const array = Object.create(ArrayProto)
// 被劫持的 7 个方法
let methods = [ 'push', 'pop','shift', 'unshift','splice','sort', 'reverse']
// 对7个方法进行劫持操作
methods.forEach(method => {
  array[method] = function (...arg) {
    // 原实例对象中的7个实例方法的功能也需要进行实现。
    let result = ArrayProto[method].apply(this, arg)
    
    // 对于新增加入的数据，需要进行响应式处理
    let data
    switch (method) {
      case 'push':
      case 'unshift':
        data = arg
        break
      case 'splice':
        data = arg[2]
    } 
    data && data.forEach(v => {
      observe(v)
    })
    return result
  }
})
```

下图是对代码逻辑的详细展示：

![](https://mmbiz.qpic.cn/mmbiz_png/AgAZPffVMkm5rgwUfRiaCzzNyQbMHARaXTU5iaOYkOI25lglVtE0iaa3uDbnhIGBjR31xjMtD0o729euLcbAXmHFw/640?wx_fmt=png)

2.3 在何处收集、在何时通知更新
-----------------

对于 Object 类型而言，当 Object 的键被访问时，将依赖进行收集；当 Object 的键对应的值发生变化时，通知更新。**所以我们在 get() 和 set() 函数中分别进行依赖的收集和通知更新。**

那数组也是如此，在 get() 中进行依赖的收集，当数组中的元素发生变化时通知更新。在元素发生变化通知更新非常容易理解，为什么依赖收集还是在 get() 中呢？我们举个例子：

```
{
    list: [1, 2, 3, 4, 5, 6]
}
```

**对于上面的数组 list ，如果我们想要得到数组中的任意一个值，一定是需要经过 list 这个 key 的。对不对？所以，我们在获取数组 list 中的元素时，对应的 get() 一定会被触发。若数组使用我们改写的那七个实例方法，那么需要在那七个实例方法中进行通知更新。**

```
function reactive(object, key, val) {
  let dep = new Dep() 
  Object.defineProperty(object, key, {
    configurable: true,
    enumerable: true,
    get() {
      dep.append()
      // 数组的依赖收集处 
      return val
    },
    set(value) {
      if (val !== value) {
        dep.update(value)
        val = value
      }
    }
  })
}
```

```
methods.forEach(method => {
  arrayProto[method] = function (...arg) {
    // 数组原来的方法也必须映射过来
    let result = ArrayProto[method].apply(this, arg)
    let data
    switch (method) {
      case 'push':
      case 'unshift':
        data = arg
        break
      case 'splice':
        data = arg[2]
    }
    data && data.forEach(v => {
      observe(v)
    })
    // 数组元素发生变化，通知对应的依赖进行更新
    
  }
})
```

2.4 依赖的收集和触发
------------

### 2.4.1 收集的依赖存在何处

在 Object 而言，依赖收集中心是放在一个 dep 中，那数组收集的依赖能不能也放到 dep 中呢？

```
function reactive(object, key, val) {
  // 我们维护的的依赖收集中心，对于 Object 而言。
  let dep = new Dep() 
  Object.defineProperty(object, key, {
    configurable: true,
    enumerable: true,
    get() {
      // 收集
      dep.append() 
      return val
    },
    set(value) {
      if (val !== value) {
        // 通知更新
        dep.update(value)
        val = value
      }
    }
  })
}
```

由于 Object 的依赖收集和通知更新处于同一个作用域中，利用函数`闭包`中的数据在函数运行完毕之后不会被垃圾回收的特性，我们在 get() 函数和 set() 函数`**父级作用域**`维护了一个依赖中心（dep）。这样 dep 就能常驻内存。

经过上节分析，数组的依赖的收集是在 get() 函数中，然而数组的通知更新是在拦截器中进行的。**所以我们是不是可以仿照 Object 依赖收集和通知更新的方式，在其父作用域维护一个依赖中心呢？这个位置恰恰在 Observer 类。**

```
import { arrayProto } from './array.js'
class Observer {
  constructor(data) {
    // 数组的依赖中心放在这里是不是更合适呢？
    this.dep = new Dep()
    if (Array.isArray(data)) {
      // 理由1
      // 如果为数组，则将我们写好的原型对象覆盖数组原来的原型对象。
      // 我们写好的原型对象中需要访问到依赖中心。
      data.__proto__ = arrayProto
    } else {
      this.walk(data)
    }
  }
  walk(data) { 
    // 省略......
    // 理由2
    // 为 Object 的键进行劫持，在这个函数中需要访问到依赖中心。
    reactive(data, key, data[key])
    // 省略.....
  }
}
```

### 2.4.2 收集依赖

经过上文分析可以得知，对于数组而言，依赖的收集应该在 **get()** 函数中进行。触发依赖的更新是在 **拦截器** 方法中进行。

在这里我们需要先思考几个问题：

1.  如果该数据已经被劫持了，需要被二次劫持吗？这个功能写在哪里比较合适呢？
    
2.  如何知道该数据已经被劫持了？
    

回答：

1.  肯定不需要。**我们可以将判断目标数据是否已经被劫持这部分逻辑写在 observe() 函数中。请思考为什么？****因为 observe() 函数是递归实现数据劫持的第一个被调用的函数。换言之：如果要将某个数据实现被劫持，一定需要调用 observe() 函数。比如以下代码。**
    

```
methods.forEach(method => {
  arrayProto[method] = function (...arg) {
    // 。。。。。。省略部分代码
    data && data.forEach(v => {
      // 将新加入数组的元素递归实现劫持。
      observe(v)
    })
  }
})
```

2.  我们可以在被劫持的数据中，新增一个唯一的标识。**请思考应该在哪里为数据添加这个唯一标识呢？应该是 Observer 类。****因为如果 Observer 类能够被执行，那么 data 一定是复杂数据类型。我们可以先为 data 打上唯一标识，然后再对 data 这个复杂数据类型进行遍历。遍历过程中如果值是复杂数据类型，则值部分的数据进行递归劫持，如果为简单数据类型，则进入 reactive() 函数，进行劫持操作！**
    

```
// 为每一个响应式数据添加__ob__属性
function def(obj, key, value, enumerable) {
  Object.defineProperty(obj, key, {
    value: value,
    enumerable: enumerable || false,
    writable: true,
    configurable: true
  })
}
// 递归开始函数
export function observe(data) {
  // 如果不是复杂数据类型，直接返回
  if (typeof data !== 'object') { return }

  // 目标数据属性中，是否存在我们规定的唯一标识 __ob__。
  if (Object.hasOwn(data, '__ob__') && data['__ob__'] instanceof Observer) {
    // 如果存在则不进行二次监听
    return 
  } else {
    // 如果不存在。说明该数据暂未劫持。
    new Observer(data)
  }
}
class Observer {
  constructor(data) {
    this.dep=new Dep()
    // 唯一标识
    def(data, '__ob__', this)
    if (Array.isArray(data)) {
      data.__proto__ = arrayProto
    } 
  }
  walk(data) {
    for (const key in data) {
      // 如果值为复杂类型，则需要将值部分进行递归劫持。
      if (typeof data[key] === 'object') {
        observe(data[key])
      }else{
        reactive(data, key, data[key])
      }
    }
  }
}
function reactive(object, key, val) { 
  // 。。。。。。省略
  // 进行劫持操作
}
```

### 2.4.3 在拦截器中访问到依赖中心

经过上文的分析，我们不难发现：在 **Observer** 类中，我们为当前的复杂数据类型全部新增加一个`__ob__`的属性，并且其值为当前 **Observer** 当前实例对象。但是，**Observer 实例对象中是不是存在一个依赖收集中心呢？这个依赖收集中心是不是为了收集数组的依赖而设置的呢？**

因为我们为每一个复杂数据类型中新注入了一个能访问到数组依赖中心的属性，所以在拦截器中只要获取到数组实例对象的`__ob__`属性，就能拿到数组的依赖中心。

那问题又来了：我们是不是有需要写个方法去获取数组中的`__ob__`属性啊？能不能复用已有的函数呢？

答案是：肯定可以。纵观我们封装过得所有函数，不难发现，引用`__ob__`属性较多的有 observe() 函数和

Observer 类。我们是在 Observer 类中对复杂数据类型添加`__ob__`属性的，所以我们考虑二次改变 observe()

函数。在拦截器中，获取该数组`__ob__`属性指向的对象。

```
// 改造
export function observe(data) {
  if (typeof data !== 'object') {
    return
  }

  let ob
  if (Object.hasOwn(data, "__ob__") && data instanceof Observer) {
    // 如果存在属性__ob__,则返回其值。
    ob = data['__ob__']
  } else {
    // 当然我们也需要考虑到兼容之前的逻辑。如果该复杂类型没有属性__ob__,
    // 那就证明该复杂类型的数据还没有进行响应式劫持操作，需要进入进入下一个
    // 环节，对复杂数据类型进行劫持。
    ob = new Observer(data)
  }
  return ob
}

class Observer {
  constructor(data) {
    // data 一定是复杂数据类型 
    // 依赖中心
    this.dep = new Dep()
    // 为复杂数据类型手动添加 __ob__ 属性。
    // 数组的实例对象中已经拥有了依赖中心
    def(data, '__ob__', this)

    if (Array.isArray(data)) {
      // 将被改写的原型对象覆盖数组自带的原型对象
      data.__proto__ = arrayProto 
    } 
    //  省略 ......
  }
}
// 省略......
}

// 我们给每一个响应式数据添加__ob__属性，
export function def(obj, key, value, enumerable) {
  Object.defineProperty(obj, key, {
    value: value,
    enumerable: enumerable || false,
    writable: true,
    configurable: true
  })
}
```

我们通过 def() 函数对`**每一个复杂数据类型**`的数据手动添加了一个__ob__属性，__ob__的值为当前 Observer 实例对象，这个实例对象中拥有一个依赖中心 —— dep。**从此数组的实例属性中增加了一个__ob__。**

**在被改写的 7 个实例方法中，我们可以通过 this 获取数组中的 __ob__属性得到数组的依赖中心，从而进行通知！**

```
methods.forEach(method => {
  arrayProto[method] = function (...arg) {
    // 数组原来的方法也必须映射过来
    let result = ArrayProto[method].apply(this, arg)
    let data
    switch (method) {
      case 'push':
      case 'unshift':
        data = arg
        break
      case 'splice':
        data = arg[2]
    }
    data && data.forEach(v => {
      observe(v)
    })
    // 我们把数组的依赖中心挂在到了数组实例属性中，通过 this 可以获取依赖中心。
    this.__ob__.dep.update(...arg)
    return result
  }
})
```

2.5 侦测数组中元素的变化
--------------

如果当前的元素属于数组类型，除了改变其原型对象之外，我们可以通过遍历该数组中的元素进行深层次的侦测。

```
class Observer {
  constructor(data) {
    this.dep = new Dep()
    def(data, '__ob__', this)
    if (Array.isArray(data)) {
      // 改变数组的原型对象
      data.__proto__ = arrayProto
      // 如果是数组，则遍历它。
      this.addressArray(data)
    } else {
      this.walk(data)
    }
  }

  addressArray(data) {
    for (const v of data) {
      // 对数组中的值进行深层度的递归
      observe(v)
    }
  }
  // 省略......
}
```

2.6 侦测新增元素的变化
-------------

对于新加入数组的元素，我们非常有必要对他们进行监听。

```
methods.forEach(method => {
  arrayProto[method] = function (...arg) {
    // 数组原来的方法也必须映射过来
    let result = ArrayProto[method].apply(this, arg)
    let data
    
    switch (method) {
      case 'push':
      case 'unshift':
        data = arg
        break
      case 'splice':
        data = arg[2]
    }
    // data && data.forEach(v => {
    //     observe(v)
    // })
    // 修改检测方式
    this.__ob__.addressArray(arg)
    // 触发依赖更新   
    this.__ob__.dep.update(...arg)
    return result
  }
})
```