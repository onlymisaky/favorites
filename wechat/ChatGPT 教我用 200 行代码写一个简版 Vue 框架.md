> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/_WNTUSFUIwW8bD3t9leEog)

最近，我正在准备一份关于 Vue 基础的学习材料。期间我突发奇想：能否利用现在热门的 ChatGPT 帮我创建学习内容？其实 Vue 本身不难学，特别是基础用法，但是，如果你想深入掌握 Vue，就要通过阅读 Vue 的源码来了解其原理。然而，不是每个人都有足够的时间和耐心阅读 Vue 的源码。于是我花了一个多小时与 ChatGPT 对话，引导它生成一些展示 Vue 原理的示例代码。在这个过程中，我只是充当一个提问者的角色，让 ChatGPT 根据我的问题生成我想要的代码。结果让我有些惊喜，但也不完全出乎意料。鉴于目前 AI 快速发展的趋势，我相信到了 2024 年，将会有很多职业被 AI 所替代，尽管那时 AI 还不能完全取代老师，但是它有潜力成为一个私人辅教工具。我相信，未来并不是 AI 取代人类，而是懂得用 AI 的人取代不懂用 AI 的人。接下来，就让我们一起见识这位 AI 助教的水平吧。

本篇文章主要讲以下内容：

*   让 AI 列出 Vue 从入门到高级的学习大纲
    
*   尝试让 AI 给出能解释 Vue 原理的代码示例
    
*   开始学习 Vue 生命周期的原理
    
*   学习 Vue 模板语法和指令的原理
    
*   学习 Vue 数据监听和计算属性的原理
    
*   学习 Vue 事件处理和方法的原理
    
*   学习 Vue 插槽（slot）的原理
    
*   用 200 行代码实现一个简版 Vue 框架
    

  

**让 AI 列出学习 Vue 的大纲**

  

  

  

为了系统地学习 Vue，需要先制定一个学习大纲。结合我对 ChatGPT 的了解，给它提的第一个问题，就得到比较满意的回复，以下就是我提的问题原文：

**请列出一个 Vue.js 从入门到高级的学习大纲**

ChatGPT 的回答如下：

**当涉及 Vue.js 的学习大纲时，下面是一个从入门到高级的学习路线，涵盖了 Vue.js 的核心概念和高级主题：**

1.  HTML、CSS 和 JavaScript 基础
    

*   HTML 元素和标签
    
*   CSS 选择器和样式
    
*   JavaScript 基本语法和概念
    

3.  Vue.js 入门
    

*   Vue.js 的介绍和特点
    
*   Vue.js 的安装和设置
    
*   Vue 实例和生命周期钩子
    
*   Vue 模板语法和指令
    
*   数据绑定和计算属性
    
*   事件处理和方法
    

5.  Vue 组件
    

*   组件的基本概念和组成
    
*   组件的注册和使用
    
*   组件的通信方式（props、事件和 vuex）
    
*   动态组件和异步组件
    
*   插槽（slot）和作用域插槽
    

7.  Vue 路由
    

*   Vue Router 的安装和配置
    
*   路由的基本用法（导航、参数传递）
    
*   嵌套路由和命名路由
    
*   路由守卫和导航解析
    

9.  Vue 状态管理（Vuex）
    

*   Vuex 的核心概念和使用场景
    
*   Vuex 的安装和配置
    
*   State、Mutation、Action 和 Getter
    
*   模块化和命名空间
    

11.  Vue 进阶
    

*   自定义指令
    
*   过滤器（Filter）
    
*   混入（Mixin）
    
*   插件（Plugin）
    
*   自定义过渡和动画
    
*   服务器端渲染（SSR）
    

13.  Vue 与外部库的集成
    

*   使用 Axios 进行 HTTP 请求
    
*   使用 Vue 与第三方库（如 Chart.js、Google Maps 等）进行集成
    
*   使用 Vue 和 Webpack 进行项目构建
    

15.  Vue 最佳实践和性能优化
    

*   组件的拆分和复用
    
*   合理使用计算属性和侦听器
    
*   避免不必要的渲染
    
*   异步组件和代码拆分
    
*   优化网络请求和数据加载
    

17.  Vue 测试
    

*   单元测试和端到端测试的概念
    
*   使用 Vue Test Utils 进行单元测试
    
*   使用 Cypress 进行端到端测试
    

19.  Vue 项目实战
    

*   基于 Vue.js 构建一个完整的应用程序
    
*   使用 Vue Router 和 Vuex 进行状态管理
    
*   集成其他库和工具
    
*   测试和优化应用程序
    

**请注意，这个学习大纲只是一个指导，你可以根据自己的学习进度和需求进行调整和扩展。此外，学习 Vue.js 最好通过实践项目和阅读官方文档来加深理解和掌握。**

以上内容是 ChatGPT 生成的，它具备一定的普适性，但我并不准备按照这个大纲来讲，我希望大家通过阅读 Vue 的源码，来学习和掌握 Vue 的用法。比如，很多人都觉得 Vue 数据双向绑定的用法很简单，但要让自己来模拟实现数据双向绑定却不简单。学习 Vue 的用法需要掌握其原理主要有以下四个原因（这些原因也是由 ChatGPT 生成的）：

*   **深入理解框架**：通过学习 Vue 的原理，你将更好地理解 Vue 框架的设计和工作原理。这包括 Vue 的响应式数据绑定、虚拟 DOM、组件化架构等核心概念。理解这些原理可以帮助你更好地使用 Vue，更高效地开发和调试应用程序。
    
*   **自定义扩展和优化**：掌握 Vue 的原理使你能够进行自定义扩展和优化。你可以根据项目需求自定义 Vue 的指令、插件、过滤器等，以及优化性能、减少资源消耗等方面。理解原理可以让你更灵活地应对各种开发场景。
    
*   **故障排查和调试**：在开发过程中，难免会遇到一些问题和错误。如果你了解 Vue 的原理，你可以更快地定位和解决问题。理解原理可以帮助你深入了解 Vue 的内部机制，识别潜在的错误来源，并采取正确的解决方法。
    
*   **跨框架学习和迁移**：掌握 Vue 的原理可以为你日后学习其他前端框架奠定基础。许多前端框架在概念和原理上有相似之处，因此，一旦你掌握了 Vue 的原理，你将更容易理解和学习其他框架，如 React、Angular 等。此外，如果你需要迁移项目到其他框架，理解原理可以帮助你更好地理解新框架的工作方式。
    

  

  

**让 AI 给出解释 Vue 原理的代码示例**

  

  

  

该怎样向 ChatGPT 提问，才能让它生成模拟实现 Vue 某个特性的示例代码？按照以往经验，起初我是这么提问的：

**请给一个简单的 JS 代码实现的例子，说明 Vue 的生命周期及生命周期钩子的实现原理**

ChatGPT 的回答如下：

**以下是一个简单的 JavaScript 代码示例，展示了 Vue 的生命周期及生命周期钩子的实现原理：**

```
<!DOCTYPE html>
<html>
<head>
  <title>Vue Lifecycle Example</title>
  <script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script>
</head>
<body>
  <div id="app">
    <p>{{ message }}</p>
    <button @click="updateMessage">Update Message</button>
  </div>

  <script>
    var app = new Vue({
      el: '#app',
      data: {
        message: 'Hello, Vue!'
      },
      beforeCreate: function() {
        console.log('beforeCreate hook');
      },
      created: function() {
        console.log('created hook');
      },
      beforeMount: function() {
        console.log('beforeMount hook');
      },
      mounted: function() {
        console.log('mounted hook');
      },
      beforeUpdate: function() {
        console.log('beforeUpdate hook');
      },
      updated: function() {
        console.log('updated hook');
      },
      beforeDestroy: function() {
        console.log('beforeDestroy hook');
      },
      destroyed: function() {
        console.log('destroyed hook');
      },
      methods: {
        updateMessage: function() {
          this.message = 'Updated message';
        }
      }
    });
</script>
</body>
</html>
```

显然，这只是 Vue 生命周期的用法示例，并不是我们想要的模拟 Vue 生命周期原理的示例。所以，掌握 AI 的提示技巧很重要。未来，AI 提示师可能会成为一种职业，学好 AI 提示技巧就像当下使用智能手机一样，将成为一种生存技能。

  

**用 AI 学习 Vue 生命周期的原理**

  

  

  

前面的代码已经让我们了解如何使用 Vue 的生命周期。为了便于模拟，我们使用 Vue 的选项式 API，并且对生命周期的用法做一点调整，假设模拟用法的示例代码如下所示：

```
var app = new Vue({
  el: '#app',
  data: {
    message: 'Hello, Vue!'
  },
  beforeCreate: function() {
    console.log('beforeCreate hook');
  },
  created: function() {
    console.log('created hook');
  },
  beforeMount: function() {
    console.log('beforeMount hook');
  },
  mounted: function() {
    console.log('mounted hook');
  },
  beforeUpdate: function() {
    console.log('beforeUpdate hook');
  },
  updated: function() {
    console.log('updated hook');
  },
  render: function() {
    return '<p>' + this.message + '</p>';
  }
});
```

我们调整的地方，就是用 render 方法代替 methods，目的是将 render 方法返回的内容渲染到 ID 为 app 的 DOM 元素上。在 render 方法里会获取 this.message 的内容，该内容为在 data 对象里定义的 message 属性的值。

大家先思考一下如何实现上述功能，重点在于实现 Vue 配置对象的 el、data、beforeCreate、created、beforeMount、mounted、beforeUpdate、updated、render 属性。

接下来我们看 ChatGPT 怎样实现上述属性，以下是我给 ChatGPT 的提示语：

**请给出一段代码，模拟实现 Vue.js 类似生命周期效果的示例代码**

ChatGPT 的回答如下：

**以下是一个简单的 JavaScript 代码示例，模拟实现类似 Vue.js 生命周期的效果：**

```
function Vue(options) {
  this.$options = options;

  if (typeof options.beforeCreate === 'function') {
    options.beforeCreate.call(this);
  }

  this._data = typeof options.data === 'function' ? options.data() : options.data;

  this._proxyData();

  if (typeof options.created === 'function') {
    options.created.call(this);
  }

  this.$mount(options.el);
}

Vue.prototype.$mount = function(el) {
  this.$el = document.querySelector(el);

  if (typeof this.$options.beforeMount === 'function') {
    this.$options.beforeMount.call(this);
  }

  this.render();

  if (typeof this.$options.mounted === 'function') {
    this.$options.mounted.call(this);
  }
};

Vue.prototype._proxyData = function() {
  var self = this;
  Object.keys(this._data).forEach(function(key) {
    Object.defineProperty(self, key, {
      get: function() {
        return self._data[key];
      },
      set: function(newValue) {
        self._data[key] = newValue;
        if (typeof self.$options.beforeUpdate === 'function') {
          self.$options.beforeUpdate.call(self);
        }
        self.render();
        if (typeof self.$options.updated === 'function') {
          self.$options.updated.call(self);
        }
      }
    });
  });
};

Vue.prototype.render = function() {
  if (typeof this.$options.render === 'function') {
    this.$el.innerHTML = this.$options.render.call(this);
  }
};

// 使用示例
var app = new Vue({
  el: '#app',
  data: {
    message: 'Hello, Vue!'
  },
  beforeCreate: function() {
    console.log('beforeCreate hook');
  },
  created: function() {
    console.log('created hook');
  },
  beforeMount: function() {
    console.log('beforeMount hook');
  },
  mounted: function() {
    console.log('mounted hook');
  },
  beforeUpdate: function() {
    console.log('beforeUpdate hook');
  },
  updated: function() {
    console.log('updated hook');
  },
  render: function() {
    return '<p>' + this.message + '</p>';
  }
});
```

在这个示例中，我们通过定义一个 Vue 构造函数来模拟 Vue.js 的生命周期。构造函数接收一个配置对象作为参数，并在实例化过程中触发各个生命周期钩子函数。

在构造函数中，我们首先判断配置对象中是否定义了 beforeCreate 和 created 钩子函数，并在相应的时机调用。然后，我们处理数据对象，读取配置对象里的 data 属性，如果 data 是函数则执行获取其返回值，如果是对象则直接赋值，然后通过 _proxyData 方法将数据对象中的属性代理到 Vue 实例上，以便实现数据的双向绑定。

接下来，在 $mount 方法中，我们判断配置对象中是否定义了 beforeMount 和 mounted 钩子函数，并在相应的时机调用。在 $mount 方法中，我们调用 render 方法将模板渲染到指定的 DOM 元素上。

在 _proxyData 方法中，我们使用 Object.defineProperty 将数据对象的属性代理到 Vue 实例上，并在属性的 set 方法中触发 beforeUpdate 、 render 和 updated 钩子，意味着只要数据对象的属性发生变化，就会触发视图更新。

在 render 方法中，我们判断配置对象中是否定义 render 函数，通过该函数获取渲染的内容，再赋值给 $el 元素的 innerHTML 属性，其中 $el 元素在 $mount 方法中使用 document.querySelector 初始化。

最后，我们使用示例中的配置对象来实例化 Vue ，通过模拟渲染触发生命周期钩子函数，实现类似 Vue.js 的各个生命周期的效果。

上述针对代码的解释也是由 ChatGPT 生成的，我只是补充了一些说明。可见 ChatGPT 这方面能力已经不亚于专业私教，它不仅节省我很多备课时间，甚至某些部分比我讲得还好。

以上 JavaScript 代码还不能直接运行，我们将该段代码保存为 lifecycle.js 文件，然后创建一个 index.html 网页并引用该文件，网页代码如下：

```
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta  />
    <title>Vue</title>
  </head>
  <body>
    <div id="app"></div>
    <script src="./lifecycle.js"></script>
  </body>
</html>
```

这样，我们直接打开 index.html 就能运行 lifecycle.js，然后在浏览器查看渲染结果，并在控制台查看日志输出。另外，我们可以在控制输入 app.message = 'ChatGPT' 来验证数据绑定以及页面更新机制。

  

****用 AI 学习 Vue 模板语法和指令的原理****

  

  

  

按照上面的学习路径，我们在学习模板语法和指令之前，同样先给出便于模拟的用法示例代码：

```
var app = new Vue({
  el: '#app',
  data: {
    message: 'Hello, Vue!',
    inputValue: 'ChatGPT'
  },
  template: `
    <div>
      <p>{{ message }}</p>
      <input v-model="inputValue" type="text">
      <p v-text="inputValue"></p>
    </div>
  `
});
```

我们重点关注以下涉及模板和指令的 HTML 片段：

```
<div>
  <p>{{ message }}</p>
  <input v-model="inputValue" type="text">
  <p v-text="inputValue"></p>
</div>
```

这个 HTML 片段本身就是模板的内容，里面使用了一个模板语法和两个指令，模板语法是 `{{ message }}`，指令分别是 `v-model` 和 `v-text`。

同样的，大家先思考一下自己如何实现，然后再看 ChatGPT 怎样实现模板语法和指令，以下是我给的提示语：

**请给出一段代码，模拟实现 Vue.js 类似模板语法和指令的示例代码**

ChatGPT 的回答如下：

**以下是一个简单的 JavaScript 代码示例，模拟实现类似 Vue.js 的模板语法和指令：**

```
function Vue(options) {
  this.$options = options;
  this._data = typeof options.data === 'function' ? options.data() : options.data;
  this._compileTemplate();
}

Vue.prototype._compileTemplate = function() {
  var self = this;
  var template = this.$options.template || '';

  var evalExpression = function(expression) {
    with (self._data) return eval(expression);
  }

  var compiledTemplate = template.replace(/\{\{(.*?)\}\}/g, function(match, expression) {
    var value = evalExpression(expression);
    return value !== undefined ? value : '';
  });

  var element = document.querySelector(this.$options.el);
  element.innerHTML = compiledTemplate.trim();

  element.querySelectorAll('[v-model]').forEach(function(element) {
    var value = element.getAttribute('v-model');
    element.value = self._data[value];
    element.addEventListener('input', function(event) {
      self._data[value] = event.target.value;
    });
  });

  element.querySelectorAll('[v-text]').forEach(function(element) {
    var value = element.getAttribute('v-text');
    element.textContent = self._data[value];
  });
};

// 使用示例
var app = new Vue({
  el: '#app',
  data: {
    message: 'Hello, Vue!',
    inputValue: 'ChatGPT'
  },
  template: `
    <div>
      <p>{{ message }}</p>
      <input v-model="inputValue" type="text">
      <p v-text="inputValue"></p>
    </div>
  `
});
```

在这个示例中，我们通过定义一个 Vue 构造函数来模拟 Vue.js 的模板语法和指令。构造函数接收一个配置对象作为参数，并在实例化过程中编译模板。

在 _compileTemplate 方法中，我们首先获取配置对象中的模板字符串，并使用正则表达式匹配 {{expression}} 的部分。然后，我们使用 eval 函数根据表达式动态求值，将值替换回模板字符串中。接下来，我们根据配置对象中的 el 属性获取对应的 DOM 元素，并将编译后的模板字符串赋值给该元素的 innerHTML 属性。

然后，我们通过 querySelectorAll 方法获取所有具有 v-model 属性的元素，并遍历每个元素。在遍历过程中，我们解析 model 指令，将元素的值设置为对应的数据属性值，并添加 input 事件监听器，以实现 inputValue 简单的双向绑定。

接着，我们通过 querySelectorAll 方法获取所有具有 v-text 属性的元素，并遍历每个元素。在遍历过程中，我们解析 text 指令，将元素的文本内容设置为对应的数据属性值。注意：该指令我们没有实现 inputValue 的双向绑定。

最后，我们使用示例中的配置对象来实例化 Vue，并传入模板字符串。通过模拟解析模板和执行指令，我们实现了类似 Vue.js 的模板语法和指令的效果，要查看效果请在浏览器中打开 index.html 页面。

以上代码并不完全是 ChatGPT 生成的，因为在调试过程中，发现两个问题需要修正才能正常运行：

*   第一个问题是 ChatGPT 想直接使用 `eval` 函数根据表达式动态求值，ChatGPT 生成的代码为 `eval(expression)`，其中 `expression` 为字符串 `" message "`，请注意 `message` 两边有空格。直接调用 `eval` 函数获取 `message` 的值会报错，因为全局对象里并没有定义 `message` 属性，而表达式 `{{ message }}` 的本意是获取 `this._data` 对象的 `message` 属性值。为此我添加了一个 `evalExpression` 函数，通过 `with` 语句将 `this._data` 设置为全局对象，这样才能正确获取 `this._data.message` 的值。但 `with` 语句在严格模式下不建议使用，因此并不是最优解，有兴趣的同学可以研究一下最优解。
    
*   第二个问题是 ChatGPT 想使用 `querySelectorAll('[v-]')` 同时获取 `v-model` 和 `v-text` 指令的内容，但实际调试过程中并不能获取。于是我拆解成两个语句：`querySelectorAll('[v-model]')` 和 `querySelectorAll('[v-text]')` 分别获取指令内容。
    

由此可见，我们还不能完成信任 ChatGPT 生成的代码。如果发现代码有问题，你可以向它提出质疑，它会说抱歉然后重新生成新的代码，更新后的代码是否正确，依然需要你再次验证。

  

****用 AI 学习 Vue 数据监听和计算属性的原理****

  

  

  

  

接下来要学习的仍是比较基础的数据监听和计算属性，其实前面在生命周期的例子里已经包含了数据双向绑定，数据监听和计算属性的原理跟数据双向绑定很类似。

同样的，我们先给出便于模拟的用法示例代码：

```
var app = new Vue({
  data: {
    message: 'Hello, Vue!',
    firstName: 'John',
    lastName: 'Doe'
  },
  computed: {
    fullName: function() {
      return this.firstName + ' ' + this.lastName;
    }
  },
  watch: {
    message: function(newValue) {
      console.log('Message changed:', newValue);
    }
  }
});

console.log(app.message);       // Output: Hello, Vue!
app.message = 'Hello, Vue.js!'; // Output: Message changed: Hello, Vue.js!
console.log(app.message);       // Output: Hello, Vue.js!
console.log(app.fullName);      // Output: John Doe
app.message = 'New message';    // Output: Message changed: New message
```

从示例代码可以看出，配置对象新增了 `computed` 和 `watch` 属性，分别定义了计算属性 `fullName`，以及监听 `message` 属性变化的函数。

大家先思考一下自己如何实现，然后再看 ChatGPT 怎样实现数据监听和计算属性，以下是我给的提示语：

**请给出一段代码，模拟实现 Vue.js 类似数据监听和计算属性的示例代码**

ChatGPT 的回答如下：

**要模拟实现 Vue.js 类似数据监听和计算属性的功能，可以使用 Object.defineProperty 来定义属性的 get 和 set 方法，并使用 watch 函数来监听属性的变化。以下是一个示例代码：**

```
function Vue(options) {
  this._data = options.data;
  this._computed = options.computed;
  this._watch = options.watch;

  this._proxyData();
  this._createComputed();
  this._createWatchers();
}

Vue.prototype._proxyData = function() {
  var self = this;
  Object.keys(this._data).forEach(function(key) {
    Object.defineProperty(self, key, {
      get: function() {
        return self._data[key];
      },
      set: function(newValue) {
        self._data[key] = newValue;
      }
    });
  });
};

Vue.prototype._createComputed = function() {
  var self = this;
  var computed = this._computed || {};

  Object.keys(computed).forEach(function(key) {
    Object.defineProperty(self, key, {
      get: function() {
        return computed[key].call(self);
      }
    });
  });
};

Vue.prototype._createWatchers = function() {
  var self = this;
  var watch = this._watch || {};

  Object.keys(watch).forEach(function(key) {
    var callback = watch[key]
    var value = self._data[key];

    Object.defineProperty(self._data, key, {
      get: function() {
        return value;
      },
      set: function(newValue) {
        value = newValue;
        callback.call(self, newValue);
      }
    });
  });
};

// 使用示例
var app = new Vue({
  data: {
    message: 'Hello, Vue!',
    firstName: 'John',
    lastName: 'Doe'
  },
  computed: {
    fullName: function() {
      return this.firstName + ' ' + this.lastName;
    }
  },
  watch: {
    message: function(newValue) {
      console.log('Message changed:', newValue);
    }
  }
});

console.log(app.message);       // Output: Hello, Vue!
app.message = 'Hello, Vue.js!'; // Output: Message changed: Hello, Vue.js!
console.log(app.message);       // Output: Hello, Vue.js!
console.log(app.fullName);      // Output: John Doe
app.message = 'New message';    // Output: Message changed: New message
```

在这个示例中，我们定义了一个 `Vue` 构造函数，它接收一个包含 `data`、`computed` 和 `watch` 的选项对象。

在 `_proxyData` 方法中，我们使用 `Object.defineProperty` 为 `Vue` 实例上的属性定义了 `get` 和 `set` 方法，将其代理到 `_data` 对象上。

在 `_createComputed` 方法中，我们通过遍历 `computed` 对象，为每个计算属性定义了 `get`方法，使其能够被当做普通属性使用。

在 `_createWatchers` 方法中，我们通过遍历 `watch` 对象，为每个属性使用`Object.defineProperty` 监听 `_data` 对象中该属性的变化，并在变化时触发回调函数。

最后，我们使用示例中的配置对象来实例化 `Vue`，并传入计算属性和监听属性的函数，通过执行一段脚本读取和更改配置属性的值，实现了类似 Vue.js 的数据监听和计算属性的效果。

与之前一样，以上代码并不完全是 ChatGPT 生成的。在原始生成的代码中，监听属性需要执行 `app.$watch('message', ...)` 这样的语句，即调用 `app` 的 `$watch` 方法来添加监听函数。修正后的监听方式更符合 `Vue` 的官方用法。

  

****用 AI 学习 Vue 事件处理和方法的原理****

  

  

  

事件处理在组件开发过程中是很重要的一环，接下来我们模拟实现 Vue 的事件处理和方法的机制，以下是便于模拟的用法示例代码：

```
var app = new Vue({
  data: {
    message: 'Hello, Vue!'
  },
  methods: {
    greet: function() {
      this.$emit('greet', this.message);
    },
    updateMessage: function(newMessage) {
      this.message = newMessage;
    }
  },
});

app.$on('greet', function(message) {
  console.log('Greet:', message);
});

app.greet(); // Output: Greet: Hello, Vue!
app.updateMessage('Hello, World!');
app.greet(); // Output: Greet: Hello, World!
```

从示例代码可以看出，配置对象新增了 `methods` 属性，用于定义实例的方法，同时新增内置的 `$emit` 和 `$on` 方法，用于抛出事件和监听事件。

大家先思考一下自己如何实现，然后再看 ChatGPT 怎样实现事件处理和方法，以下是我给的提示语：

**请给出一段代码，模拟实现 Vue.js 类似事件处理和方法的示例代码**

ChatGPT 的回答如下：

**以下是一个简单的 JavaScript 代码示例，模拟实现类似 Vue.js 的事件处理和方法：**

```
function EventBus() {
  this._events = {};
}

EventBus.prototype.on = function(eventName, callback) {
  if (!this._events[eventName]) {
    this._events[eventName] = [];
  }
  this._events[eventName].push(callback);
};

EventBus.prototype.emit = function(eventName, payload) {
  if (this._events[eventName]) {
    this._events[eventName].forEach(function(callback) {
      callback(payload);
    });
  }
};

function Vue(options) {
  this._data = typeof options.data === 'function' ? options.data() : options.data;
  this._methods = options.methods;
  this._eventBus = new EventBus();

  this._proxyData();
  this._proxyMethods();
}

Vue.prototype._proxyData = function() {
  var self = this;
  Object.keys(this._data).forEach(function(key) {
    Object.defineProperty(self, key, {
      get: function() {
        return self._data[key];
      },
      set: function(newValue) {
        self._data[key] = newValue;
      }
    });
  });
};

Vue.prototype._proxyMethods = function() {
  var self = this;
  var methods = this._methods;
  if (methods) {
    Object.keys(methods).forEach(function(key) {
      self[key] = methods[key].bind(self);
    });
  }
};

Vue.prototype.$emit = function(eventName, payload) {
  this._eventBus.emit(eventName, payload);
};

Vue.prototype.$on = function(eventName, callback) {
  this._eventBus.on(eventName, callback);
};

// 使用示例
var app = new Vue({
  data: {
    message: 'Hello, Vue!'
  },
  methods: {
    greet: function() {
      this.$emit('greet', this.message);
    },
    updateMessage: function(newMessage) {
      this.message = newMessage;
    }
  },
});

app.$on('greet', function(message) {
  console.log('Greet:', message);
});

app.greet(); // Output: Greet: Hello, Vue!
app.updateMessage('Hello, World!');
app.greet(); // Output: Greet: Hello, World!
```

在这个示例中，我们首先使用 `EventBus` 对象来模拟事件总线。 `EventBus` 对象具有 `on` 方法用于监听事件和 `emit` 方法用于触发事件。

在 `Vue` 构造函数中，我们创建了一个 `EventBus` 实例并将其赋值给 `_eventBus` 属性。

在 `_proxyData` 方法中，我们使用 `Object.defineProperty` 将数据对象的属性代理到 Vue 实例上，以便实现数据的双向绑定。

在 `_proxyMethods` 方法中，我们将配置对象中的方法绑定到 Vue 实例上，以便在实例中可以直接访问和调用这些方法。

在 `Vue` 原型中，我们定义了 `$emit` 和 `$on` 方法。 `$emit` 方法用于抛出事件，接收两个参数：事件名和可选的数据载荷。 `$on` 方法用于监听事件，接收两个参数：事件名和回调函数。

最后，我们创建了一个 `Vue` 实例，先在 `Vue` 的配置对象的 `greet` 方法使用 `$emit` 方法触发 `greet` 事件，以便触发回调函数并输出消息。然后，在实例中使用 `$on` 方法监听 `greet` 事件，并且定义回调函数来输出消息。通过这种方式，我们模拟实现了类似 Vue.js 中抛出事件和接收事件的功能。

与之前一样，以上代码并不完全是 ChatGPT 生成的。在原始生成的代码中，并没有模拟实现抛出事件和接收事件。我重新给出新的提示语，ChatGPT 才生成 `EventBus` 的代码，然后我再将两段代码融合在一起，才得到上面的示例代码。

  

****用 AI 学习 Vue 插槽（slot）的原理****

  

  

最后，我们来学习 Vue 的插槽。为了模拟插槽的用法，我们还得先模拟 Vue 的组件声明，在组件里定义插槽，然后通过模板引入组件，并设置组件插槽的内容，以下是便于模拟的用法示例代码：

```
var HelloComponent = {
  data: function() {
    return {
      name: 'John'
    };
  },
  template: `
    <div>
      <h1>{{ name }}</h1>
      <slot></slot>
    </div>
  `
};

var app = new Vue({
  el: '#app',
  data: {
    message: 'Hello, Vue!'
  },
  components: {
    HelloComponent
  },
  template: `
    <HelloComponent>
      <p>{{ message }}</p>
    </HelloComponent>
  `
});
```

上述示例代码中，我们声明了一个 `HelloComponent` 的组件，在该组件的模板中，我们添加了一个 `slot` 插槽，然后在应用的模板里引入 `HelloComponent` 组件，并在该组件里面添加 `<p>{{ message }}</p>` 作为插槽的内容。

代码运行的结果将生成如下 HTML 代码：

```
<div id="app">
  <hellocomponent>
    <div>
      <h1>John</h1>
      <slot>
        <p>Hello, Vue!</p>
      </slot>
    </div>
  </hellocomponent>
</div>
```

为了实现的代码简化起见，`HelloComponent` 和 `slot` 两个节点依然保留。大家先思考一下自己如何实现，然后再看 ChatGPT 怎样实现插槽，以下是我给的提示语：

**请给出一段代码，模拟实现 Vue.js 类似插槽（slot）的示例代码**

ChatGPT 的回答如下：

**要模拟实现 Vue.js 类似插槽（slot）的功能，可以在组件定义中使用特殊的标记来表示插槽，并在组件实例中通过相应的属性将内容传递到插槽中。以下是一个示例代码：**

```
function Vue(options) {
  this.$options = options;
  this._data = typeof options.data === 'function' ? options.data() : options.data;
  this._components = options.components || {};

  this._proxyData();
  this._compileTemplate();
  this._proxyComponents();
}

Vue.prototype._proxyData = function() {
  var self = this;
  Object.keys(this._data).forEach(function(key) {
    Object.defineProperty(self, key, {
      get: function() {
        return self._data[key];
      },
      set: function(newValue) {
        self._data[key] = newValue;
      }
    });
  });
};

Vue.prototype._compileTemplate = function() {
  var self = this;
  var el = this.$options.el
  var template = this.$options.template || '';

  var evalExpression = function(expression) {
    with (self) return eval(expression);
  }

  var compiledTemplate = template.replace(/\{\{(.*?)\}\}/g, function(match, expression) {
    var value = evalExpression(expression);
    return value !== undefined ? value : '';
  });

  var element = el ? document.querySelector(el) : document.createElement('div');
  element.innerHTML = compiledTemplate.trim();
  this.$el = el ? element : element.childNodes[0];
};

Vue.prototype._proxyComponents = function() {
  var self = this;
  var components = this._components;

  Object.keys(components).forEach(function(componentName) {
    var component = new Vue(components[componentName]);
    self.$el.querySelectorAll(componentName).forEach(function(element) {
      component.$el.querySelectorAll('slot').forEach(function(slot) {
        slot.innerHTML = element.innerHTML;
      });
      element.innerHTML = component.$el.outerHTML;
    });
  });
};

// 使用示例
var HelloComponent = {
  data: function() {
    return {
      name: 'John'
    };
  },
  template: `
    <div>
      <h1>{{ name }}</h1>
      <slot></slot>
    </div>
  `
};

var app = new Vue({
  el: '#app',
  data: {
    message: 'Hello, Vue!'
  },
  components: {
    HelloComponent
  },
  template: `
    <HelloComponent>
      <p>{{ message }}</p>
    </HelloComponent>
  `
});
```

在这个示例中，我们定义了一个 `Vue` 构造函数，它接收一个包含 `data`、`template` 和 `components` 的选项对象。

在 `_proxyData` 方法中，我们使用 `Object.defineProperty` 将数据对象的属性代理到 Vue 实例上，以便实现数据的双向绑定。

在 `_compileTemplate` 方法中，我们首先获取配置对象中的模板字符串，并使用正则表达式匹配 `{{ expression }}` 的部分。然后，我们使用 `eval` 函数根据表达式动态求值，将值替换回模板字符串中。注意：这里 `eval` 前面的 `with` 语句跟的是 `self`，而不是之前的 `self._data`，这是因为本示例中添加了 `_proxyData` 方法。接下来，我们根据配置对象中的 `el` 属性获取对应的 DOM 元素，如果 DOM 元素不存在，我们就创建一个 `div` 元素代替，然后再将编译后的模板字符串赋值给该元素的 `innerHTML` 属性。接着给 Vue 实例设置 `$el` 属性，注意：前面如果用 `div` 元素代替，则需通过 `childNodes[0]` 排除该 `div` 元素。

在 `_proxyComponents` 方法中，我们首先获取配置对象中的组件声明，然后遍历所有的组件，根据组件名称获取组件对象，创建该对象的 `Vue` 实例，并通过该实例的 `$el` 属性，遍历所有 `slot` 插槽，将原始的 `innerHTML` 设置为插槽的内容，然后重新设置组件的 `innerHTML` 为实例 `$el` 元素的 `outerHTML` 内容。

最后，我们先定义了一个 `HelloComponent` 对象，在该组件的模板中，添加了一个 `slot` 插槽。接着再创建一个 `Vue` 的实例，在配置对象的模板里引入 `HelloComponent` 组件，并在该组件里面添加插槽的内容。通过这种方式，我们模拟实现了类似 Vue.js 中抛出事件和接收事件的功能。

同样的，以上代码并不完全是 ChatGPT 生成的。在原始生成的代码中，还创建了一个`VueComponent` 的构造函数，然而却没有实现插槽内容的替换，甚至除了使用示例之外，其他地方完全没有插槽的相关代码，就连使用示例代码中的 `components` 对象也是我补上的。

  

****用 200 行代码实现一个简版 Vue 框架****

  

  

  

前面我们已经模拟了 Vue 的生命周期、模板语法、指令、双向绑定、数据监听、计算属性、事件处理、方法、组件、插槽，现在是时候把这些模拟的特性融合在一起，构建一个 Vue 框架的简易版本。以下是便于模拟的用法示例代码：

```
var HelloComponent = {
  emits: ['greet'],
  data: function() {
    return {
      firstName: 'John',
      lastName: 'Doe'
    };
  },
  computed: {
    fullName: function() {
      return this.firstName + ' ' + this.lastName;
    }
  },
  updated: function() {
    this.$emit('greet', this.firstName);
  },
  template: `
    <div>
      <h1>{{ fullName }}</h1>
      <slot></slot>
    </div>
  `
};

var app = new Vue({
  el: '#app',
  data: {
    message: 'Hello, Vue!',
    inputValue: 'ChatGPT'
  },
  watch: {
    message: function(newValue, oldValue) {
      console.log('Message changed:', oldValue, ' -> ', newValue);
    },
    inputValue: function(newValue, oldValue) {
      console.log('InputValue changed:', oldValue, ' -> ', newValue);
    }
  },
  methods: {
    greetMessage: function(message) {
      this.$emit('greet', message);
    },
    updateMessage: function(newMessage) {
      this.message = newMessage;
    }
  },
  components: {
    HelloComponent
  },
  beforeCreate: function() {
    console.log('beforeCreate hook');
  },
  created: function() {
    console.log('created hook');
  },
  beforeMount: function() {
    console.log('beforeMount hook');
  },
  mounted: function() {
    console.log('mounted hook');
  },
  beforeUpdate: function() {
    console.log('beforeUpdate hook');
  },
  updated: function() {
    console.log('updated hook');
  },
  template: `
    <div>
      <HelloComponent v-on:greet="greetMessage">
        <p>{{ message }}</p>
      </HelloComponent>
      <input v-model="inputValue" type="text">
      <p v-text="inputValue"></p>
    </div>
  `
});

app.$on('greet', function(message) {
  console.log('Greet:', message);
});

app.inputValue = 'OpenAI'
app.HelloComponent.firstName = 'Tom';
app.updateMessage('Hello, World!');
```

这段代码在前面的基础上添加了新功能，比如`app.HelloComponent.firstName` 应用可以通过组件名获取子组件的实例、`v-on:greet` 监听子组件的事件等。特别是关于 `greet` 事件，发生的连环动作依次是：

1.  在 `HelloComponent` 组件的生命周期 `updated` 中抛出 `greet` 事件，事件的参数为 `firstName` 属性。
    
2.  在 app 应用的模板里通过 `<HelloComponent v-on:greet="greetMessage">` 来声明监听 `HelloComponent` 组件的 `greet` 事件，事件会触发 app 应用配置对象里的 `greetMessage` 方法。
    
3.  在 app 应用的 `greetMessage` 方法中再次往外抛 `greet` 事件，由应用的实例通过 `app.$on('greet', ...)` 监听 `greet` 事件，输出 `firstName` 的值。
    

以上代码运行的结果，输出的 HTML 页面代码如下：

```
<div id="app">
  <div>
    <hellocomponent v-on:greet="greetMessage">
      <div>
        <h1>Tom Doe</h1>
        <slot>
          <p>Hello, World!</p>
        </slot>
      </div>
    </hellocomponent>
    <input v-model="inputValue" type="text" />
    <p v-text="inputValue">OpenAI</p>
  </div>
</div>
```

控制台输出的结果如下。另外，可以在控制台输入 `app.inputValue = 123` 等方式观察数据双向绑定的效果。

```
beforeCreate hook
created hook
beforeMount hook
mounted hook
InputValue changed: ChatGPT  ->  OpenAI
beforeUpdate hook
updated hook
Greet: Tom
Message changed: Hello, Vue!  ->  Hello, World!
beforeUpdate hook
updated hook
```

以下就是本篇文章的精华，只需 200 行代码实现的简版 Vue 框架：

```
function EventBus() {
  this._events = {};
}

EventBus.prototype.on = function(eventName, callback) {
  if (!this._events[eventName]) {
    this._events[eventName] = [];
  }
  this._events[eventName].push(callback);
};

EventBus.prototype.emit = function(eventName, payload) {
  if (this._events[eventName]) {
    this._events[eventName].forEach(function(callback) {
      callback(payload);
    });
  }
};

function Vue(options) {
  this.$options = options;

  if (typeof options.beforeCreate === 'function') {
    options.beforeCreate.call(this);
  }

  this._data = typeof options.data === 'function' ? options.data() : options.data;
  this._eventBus = new EventBus();
  this._proxyData();
  this._proxyMethods();
  this._createComputed();
  this._createWatchers();

  if (typeof options.created === 'function') {
    options.created.call(this);
  }

  this.$mount();
}

Vue.prototype.$render = function() {
  if (typeof this.$options.render === 'function' && this.$options.el) {
    this.$el = document.querySelector(this.$options.el);
    this.$el.innerHTML = this.$options.render.call(this);
  } else {
    this._compileTemplate();
    this._proxyComponents();
  }
};

Vue.prototype.$mount = function() {
  if (typeof this.$options.beforeMount === 'function') {
    this.$options.beforeMount.call(this);
  }

  this.$render();

  if (typeof this.$options.mounted === 'function') {
    this.$options.mounted.call(this);
  }
};

Vue.prototype._proxyData = function() {
  var self = this;
  Object.keys(this._data).forEach(function(key) {
    Object.defineProperty(self, key, {
      get: function() {
        return self._data[key];
      },
      set: function(newValue) {
        self._data[key] = newValue;
        if (typeof self.$options.beforeUpdate === 'function') {
          self.$options.beforeUpdate.call(self);
        }

        self.$render();

        if (typeof self.$options.updated === 'function') {
          self.$options.updated.call(self);
        }
      }
    });
  });
};

Vue.prototype._createComputed = function() {
  var self = this;
  var computed = this.$options.computed || {};

  Object.keys(computed).forEach(function(key) {
    Object.defineProperty(self, key, {
      get: function() {
        return computed[key].call(self);
      }
    });
  });
};

Vue.prototype._createWatchers = function() {
  var self = this;
  var watch = this.$options.watch || {};

  Object.keys(watch).forEach(function(key) {
    var callback = watch[key]
    var value = self._data[key];

    Object.defineProperty(self._data, key, {
      get: function() {
        return value;
      },
      set: function(newValue) {
        var oldValue = value
        value = newValue;
        callback.call(self, newValue, oldValue);
      }
    });
  });
};

Vue.prototype._proxyMethods = function() {
  var self = this;
  var methods = this.$options.methods || {};
  Object.keys(methods).forEach(function(key) {
    self[key] = methods[key].bind(self);
  });
};

Vue.prototype.$emit = function(eventName, payload) {
  this._eventBus.emit(eventName, payload);
};

Vue.prototype.$on = function(eventName, callback) {
  this._eventBus.on(eventName, callback);
};

Vue.prototype._compileTemplate = function() {
  var self = this;
  var el = this.$options.el
  var template = this.$options.template || '';

  var evalExpression = function(expression) {
    with (self) return eval(expression);
  }

  var compiledTemplate = template.replace(/\{\{(.*?)\}\}/g, function(match, expression) {
    var value = evalExpression(expression);
    return value !== undefined ? value : '';
  });

  var element = el ? document.querySelector(el) : document.createElement('div');
  element.innerHTML = compiledTemplate.trim();
  this.$el = el ? element : element.childNodes[0];
  this._handleDirective()
};

Vue.prototype._handleDirective = function() {
  var self = this;

  this.$el.querySelectorAll('[v-model]').forEach(function(element) {
    var value = element.getAttribute('v-model');
    element.value = self._data[value];
    element.addEventListener('input', function(event) {
      self._data[value] = event.target.value;
      self.$emit(`update:${value}`, event.target.value);
    });
  });

  this.$el.querySelectorAll('[v-text]').forEach(function(element) {
    var value = element.getAttribute('v-text');
    element.textContent = self._data[value];
    self.$on(`update:${value}`, function(newValue) {
      element.textContent = newValue;
    });
  });
};

Vue.prototype._proxyComponents = function() {
  var self = this;
  var components = this.$options.components || {};

  Object.keys(components).forEach(function(componentName) {
    var component = self[componentName] || new Vue(components[componentName]);
    var isNewComponent = typeof self[componentName] === 'undefined';
    self[componentName] = component;

    self.$el.querySelectorAll(componentName).forEach(function(element) {
      component.$el.querySelectorAll('slot').forEach(function(slot) {
        slot.innerHTML = element.innerHTML;
      });
      element.innerHTML = component.$el.outerHTML;

      isNewComponent && component.$options?.emits.forEach(function(event) {
        var method = element.getAttribute('v-on:' + event);
        if (typeof self[method] === 'function') {
          component.$on(event, self[method]);
        }
      });
    });
  });
};
```

在 `Vue` 的构造函数里，我们做了几件事：处理生命周期钩子函数、创建 `EventBus` 实例、使用 `_proxyData` 、`_proxyMethods`、`_createComputed`、`_createWatchers` 方法将数据对象的属性、方法、计算属性、监听器代理或绑定到 Vue 实例上。

然后再调用 `$mount` 方法挂载组件，触发生命周期钩子函数并执行 `$render` 方法。在 `$render` 方法中，执行用户自定义的渲染函数，或者使用 `_compileTemplate` 、`_proxyComponents` 方法编译模板和解析子组件。

在 `_proxyData` 方法中，我们使用 `Object.defineProperty` 将数据对象的属性代理到 `Vue` 实例上，并在属性的 `set` 方法中触发 `beforeUpdate` 、 `$render` 和 `updated` 钩子，意味着只要数据对象的属性发生变化，就会触发视图更新。

在 `_createComputed` 方法中，我们通过遍历 `computed` 对象，为每个计算属性定义了 `get`方法，使其能够被当做普通属性使用。

在 `_createWatchers` 方法中，我们通过遍历 `watch` 对象，为每个属性使用 `Object.defineProperty` 监听 `_data` 对象中该属性的变化，并在变化时触发回调函数。注意：在 `set` 方法中，与之前相比我们新增了 `oldValue` 参数。

在 `_proxyMethods` 方法中，我们将配置对象中的方法绑定到 Vue 实例上，以便在实例中可以直接访问和调用这些方法。

在 `Vue` 原型中，我们定义了 `$emit` 和 `$on` 方法。 `$emit` 方法用于抛出事件，接收两个参数：事件名和可选的数据载荷。 `$on` 方法用于监听事件，接收两个参数：事件名和回调函数。

在 `_compileTemplate` 方法中，我们首先获取配置对象中的模板字符串，并使用正则表达式匹配 `{{ expression }}` 的部分。然后，我们使用 `eval` 函数根据表达式动态求值，将值替换回模板字符串中。接下来，我们根据配置对象中的 `el` 属性获取对应的 DOM 元素，如果 DOM 元素不存在，我们就创建一个 `div` 元素代替，然后再将编译后的模板字符串赋值给该元素的 `innerHTML` 属性。接着给 Vue 实例设置 `$el` 属性并且调用 `_handleDirective` 方法处理指令。注意：前面如果用 `div` 元素代替，则需通过 `childNodes[0]` 排除该 `div` 元素。

在 `_handleDirective` 方法，我们通过 `querySelectorAll` 方法获取所有具有 `v-model` 属性的元素，并遍历每个元素。在遍历过程中，我们解析 `model` 指令，将元素的值设置为对应的数据属性值，并添加 `input` 事件监听器。注意：在 `addEventListener` 方法中，与之前相比我们新增了 `$emit` 动作，用来触发 `update:inputValue` 事件，从而实现 `inputValue` 完整的数据双向绑定。

接着，我们通过 `querySelectorAll` 方法获取所有具有 `v-text` 属性的元素，并遍历每个元素。在遍历过程中，我们解析 `text` 指令，将元素的文本内容设置为对应的数据属性值。注意：与之前相比我们新增了 `$on` 动作，用来监听 `update:inputValue` 事件，让文本内容随着 `inputValue` 的值变化而变化。

在 `_proxyComponents` 方法中，我们首先获取配置对象中的组件声明，然后遍历所有的组件，根据组件名称获取组件对象，创建该对象的 `Vue` 实例。注意：与之前相比我们会保存该对象到实例上，并优先从实例中获取已经创建好的对象。接着通过该实例的 `$el` 属性，遍历所有 `slot` 插槽，将原始的 `innerHTML` 设置为插槽的内容，并重新设置组件的 `innerHTML` 为实例 `$el` 元素的 `outerHTML` 内容。

最后，我们还新增了 `v-on` 的组件监听事件功能。首先，我们从组件配置对象里的 `emits` 数组获取组件抛出的所有事件名称，然后遍历该数组，判断 app 应用是否监听了该事件，如果从 app 应用的 `self[method]` 找到对应的监听函数，则给组件通过 `$on` 方法绑定该监听函数。注意：由于组件更新会触发多次 `_proxyComponents`方法，因此必须判断 `isNewComponent` 是否为新创建的组件，防止重复用 `$on` 方法绑定相同的监听函数。

  

**总结**

  

  

以上模拟 Vue 原理的示例代码都是按 Vue 的 Option 选项式 API 方式编写的，与当前我们常用的 Composition 组合式 API 有所不同。这也许跟我使用的 ChatGPT 版本只能获取 2021 年以前的资料有关，但这并不妨碍我们利用它学习 Vue 的用法、理解 Vue 的原理。

本篇文章涉及的内容都比较基础，Vue 还有很多高级特性和用法，我们都可以借助 AI 辅导我们学习。当然，在学习的过程中，我们要时刻注意 AI 的回答并不完全正确，需要自己通过实践逐一甄别。在 Vue 的实战开发过程中，我们同样可以借助 AI 来定位分析问题，毕竟它不知疲倦，脾气又好，是不可多得的好老师。  

本篇文章所有源代码和示例工程都在 `OpenTiny` 站点，请访问 https://github.com/opentiny/ai-vue/

联系我们：  
官方公众号：OpenTiny  
OpenTiny 官网：https://opentiny.design/  
Vue 组件库：https://github.com/opentiny/tiny-vue（欢迎 Star 🌟）  
Angular 组件库：https://github.com/opentiny/ng（欢迎 Star 🌟）

  

  

  

**其他说明**

  

  

  

OpenTiny 是一套企业级组件库解决方案，适配 PC 端 / 移动端等多端，涵盖 Vue2 / Vue3 / Angular 多技术栈，拥有主题配置系统 / 中后台模板 / CLI 命令行等效率提升工具，可帮助开发者高效开发 Web 应用。  

**核心亮点：**

`跨端跨框架`：使用 Renderless 无渲染组件设计架构，实现了一套代码同时支持 Vue2 / Vue3，PC / Mobile 端，并支持函数级别的逻辑定制和全模板替换，灵活性好、二次开发能力强。

`组件丰富`：PC 端游 80 + 组件，移动端游 30 + 组件，包含高频组件 Table、Tree、Select 等，内置虚拟滚动，保证大数据场景下的流畅体验，除了业界常见组件之外，我们还提供了一些独有的特色组件，如：Split 面板分割器、IpAddress IP 地址输入框、Calendar 日历、Crop 图片裁切等

`配置式组件`：组件支持模板式和配置式两种使用方式，适合低代码平台，目前团队已经将 OpenTiny 集成到内部的低代码平台，针对低码平台做了大量优化

`周边生态齐全`：提供了基于 Angular + TypeScript 的 TinyNG 组件库，提供包含 10+ 实用功能、20+ 典型页面的 TinyPro 中后台模板，提供覆盖前端开发全流程的 TinyCLI 工程化工具，提供强大的在线主题配置平台 TinyTheme

欢迎加入 OpenTiny 开源社区。添加微信小助手：opentiny-official 一起参与共建~

**OpenTiny 官网：**

https://opentiny.design/

**OpenTiny 代码仓库：**

https://github.com/opentiny/

**欢迎进入 **OpenTiny 代码仓库** Star🌟 TinyVue TinyNG TinyCLI~**