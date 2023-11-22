> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/iwdIU4Zi-lGGbilBcILK4A)

![](https://mmbiz.qpic.cn/mmbiz_png/l2m9MEy8oKc4Z1YhOjs5XuA6icEdkRwvogJib78bRSvXozCH6qBr9jAmv2wIaQeE8TrU9PGoT0lhGU11kchRYrcg/640?wx_fmt=png)

设计模式的重要性
--------

为什么要学习和使用设计模式，我觉得原因主要有两点

1.  **解除耦合**：设计模式的目的就是把 “不变的” 和 “可变的” 分离开，将 “不变的” 封装为统一对象，“可变的” 在具体实例中实现
    
2.  **定义统一标准**：定义一套优秀代码的标准，相当于一份实现优秀代码的说明书
    

在前端开发过程中面对复杂场景能能够更清晰的处理代码逻辑，其中策略模式在我的前端工作中的应用非常多，下面就展开讲讲策略模式在前端开发的具体应用

策略模式基础
------

策略模式的含义是：定义了一系列的算法，并将每个算法封装起来，使它们可以互相替换

我个人对于策略模式的理解，就是将原来写在一个函数中一整套功能，拆分为一个个独立的部分，从而达到解耦的目的。所以策略模式最好的应用场景，就是拆解 if-else，把每个 if 模块封装为独立算法

在面向对象的语言中，策略模式通常有三个部分

*   策略（Strategy）：实现不同算法的接口
    
*   具体策略（Concrete Strategy）：实现了策略定义的接口，提供具体的算法实现
    
*   上下文（Context）：持有一个策略对象的引用，用一个 ConcreteStrategy 对象来配置，维护一个对 Strategy 对象的引用
    

这么看定义可能不太直观，这里我用 TS 面向对象的方式实现的一个计算器的策略模式例子说明一下

```
// 第一步: 定义策略（Strategy）
interface CalculatorStrategy {
  calculate(a: number, b: number): number;
}

// 第二步：定义具体策略（Concrete Strategy）
class AddStrategy implements CalculatorStrategy {
  calculate(a: number, b: number): number {
    return a + b;
  }
}

class SubtractStrategy implements CalculatorStrategy {
  calculate(a: number, b: number): number {
    return a - b;
  }
}

class MultiplyStrategy implements CalculatorStrategy {
  calculate(a: number, b: number): number {
    return a * b;
  }
}

// 第三步: 创建上下文（Context），用于调用不同的策略
class CalculatorContext {
  private strategy: CalculatorStrategy;

  constructor(strategy: CalculatorStrategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy: CalculatorStrategy) {
    this.strategy = strategy;
  }

  calculate(a: number, b: number): number {
    return this.strategy.calculate(a, b);
  }
}

// 使用策略模式进行计算
const addStrategy = new AddStrategy();
const subtractStrategy = new SubtractStrategy();
const multiplyStrategy = new MultiplyStrategy();

const calculator = new CalculatorContext(addStrategy);
console.log(calculator.calculate(5, 3)); // 输出 8

calculator.setStrategy(subtractStrategy);
console.log(calculator.calculate(5, 3)); // 输出 2

calculator.setStrategy(multiplyStrategy);
console.log(calculator.calculate(5, 3)); // 输出 15
```

前端策略模式应用
--------

实际上在前端开发中，通常不会使用到面向对象的模式，在前端中应用策略模式，完全可以简化为两个部分

1.  对象：存储策略算法，并通过 key 匹配对应算法
    
2.  策略方法：实现 key 对应的具体策略算法
    

这里举一个在最近开发过程应用策略模式重构的例子，实现的功能是对于不同的操作，处理相关字段的联动，在原始代码中，对于操作类型 opType 使用大量 if-else 判断，代码大概是这样的，虽然看起来比较少，但是每个 if 里面都有很多处理逻辑的话，整体的可读性的就会非常差了

```
export function transferAction() {
  actions.forEach((action) => {
    const { opType } = action

    // 展示 / 隐藏字段
    if (opType === OP_TYPE_KV.SHOW) { }
    else if (opType === OP_TYPE_KV.HIDE) {}
    // 启用 / 禁用字段
    else if (opType === OP_TYPE_KV.ENABLE) { }
    else if (opType === OP_TYPE_KV.DISABLE) {}
    // 必填 / 非必填字段
    else if (opType === OP_TYPE_KV.REQUIRED) { }
    else if ((opType === OP_TYPE_KV.UN_REQUIRED) { }
    //  清空字段值
    else if (opType === OP_TYPE_KV.CLEAR && isSatify) { }
  })
}
```

在使用策略模式重构之后，将每个 action 封装进单独的方法，再把所用的算法放入一个对象，通过触发条件匹配。这样经过重构后的代码，相比于原来的 if-else 结构更清晰，每次只要找到对应的策略方法实现即可。并且如果后续有扩展，只要继续新的增加策略方法就好，不会影响到老的代码

```
export function transferAction( /* 参数 */ ) {
  /**
   * @description 处理字段显示和隐藏
   */
  const handleShowAndHide = ({ opType, relativeGroupCode, relativeCode }) => {}

  /**
   * @description // 启用、禁用字段（支持表格行字段的联动）
   */
  const handleEnableAndDisable = ({ opType, relativeGroupCode, relativeCode }) => {}

  /**
   * @description 必填 / 非必填字段（支持表格行字段的联动）
   */
  const handleRequiredAndUnrequired = ({ opType, relativeGroupCode, relativeCode }) => {}

  /**
   * @description 清空字段值
   */
  const handleClear = ({ opType, relativeGroupCode, relativeCode }) => {}

  // 联动策略
  const strategyMap = {
    // 显示、隐藏
    [OP_TYPE_KV.SHOW]: handleShowAndHide,
    [OP_TYPE_KV.HIDE]: handleShowAndHide,
    // 禁用、启用
    [OP_TYPE_KV.ENABLE]: handleEnableAndDisable,
    [OP_TYPE_KV.DISABLE]: handleEnableAndDisable,
    // 必填、非必填
    [OP_TYPE_KV.REQUIRED]: handleRequiredAndUnrequired,
    [OP_TYPE_KV.UN_REQUIRED]: handleRequiredAndUnrequired,
    // 清空字段值
    [OP_TYPE_KV.CLEAR]: handleClear,
  }

  // 遍历执行联动策略
  actions.forEach((action) => {
    const { opType, relativeGroupCode, relativeCode, value } = action

    if (strategyMap[opType]) {
      strategyMap[opType]({ /* 入参 */ })
    }
  })
}
```

总结
--

策略模式的优点在于：代码逻辑更清晰，每个策略对对应一个实现方法；同时遵循**开闭原则**，新的策略方法无需改变已有代码，所以非常适合处理或重构复杂逻辑的  if-else

在前端开发过程中，不需要遵循面向对象的应用方式，只需要通过对象存储策略算法，通过 key 匹配具体策略实现，就可以实现一个基础的策略模式