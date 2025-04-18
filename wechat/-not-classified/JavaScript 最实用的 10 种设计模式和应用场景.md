> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/sLQsJVe8IbFqeVTYFnlotQ)

前言
--

在 JavaScript 中，设计模式可以帮助开发者编写更高效、可维护和可扩展的代码

1. 单例模式（Singleton Pattern）
--------------------------

单例模式确保一个类只有一个实例，并提供一个全局访问点，一般应用场景表现在：

*   全局状态管理（如 Redux 中的 Store）。
    
*   数据库连接池。
    
*   日志记录器。
    

![](https://mmbiz.qpic.cn/mmbiz_png/TZL4BdZpLdg1WiaACTFduylNCfqWZM2Z8UGwC77qAQsxwoXBR31bticuX9X9iaXUNdWvVw2OVLUhm98dllXfvxiakQ/640?wx_fmt=png&from=appmsg)

2. 工厂模式（Factory Pattern）
------------------------

工厂模式提供了一种创建对象的方式，而无需指定具体的类，一般应用场景表现在：

*   创建复杂的对象。
    
*   根据条件动态创建对象。
    
*   解耦对象的创建和使用。
    

![](https://mmbiz.qpic.cn/mmbiz_png/TZL4BdZpLdg1WiaACTFduylNCfqWZM2Z8xgtdhtjBm7LA766iaTUH2F4VyDEuvyjIcGlQ29tTicpdnPhdtXL6F1XQ/640?wx_fmt=png&from=appmsg)

3. 观察者模式（Observer Pattern）
--------------------------

观察者模式定义了对象之间的一对多依赖关系，当一个对象状态改变时，所有依赖它的对象都会收到通知，一般应用场景表现在：

*   事件处理系统。
    
*   数据绑定（如 Vue.js 的响应式系统）。
    
*   发布 - 订阅系统。
    

![](https://mmbiz.qpic.cn/mmbiz_png/TZL4BdZpLdg1WiaACTFduylNCfqWZM2Z8taRU29sEnFbku8GdWqZqWedqa5nFlZtOJstL9x2HP8Ghom7ibf8FMbw/640?wx_fmt=png&from=appmsg)

4. 策略模式（Strategy Pattern）
-------------------------

策略模式定义了一系列算法，并将它们封装起来，使它们可以互相替换，一般应用场景表现在：

*   动态选择算法（如排序算法）。
    
*   表单验证规则。
    
*   支付方式选择。
    

![](https://mmbiz.qpic.cn/mmbiz_png/TZL4BdZpLdg1WiaACTFduylNCfqWZM2Z8MRO9Wneruhqib5k4nS1mBnicOwlrBDCGd4Tp4Zsjz8Fm3siaLfj53CLlw/640?wx_fmt=png&from=appmsg)

5. 装饰器模式（Decorator Pattern）
---------------------------

装饰器模式动态地为对象添加额外的行为，而不改变其结构，一般应用场景表现在：

*   扩展对象功能（如添加日志、缓存）。
    
*   动态添加属性或方法。
    

![](https://mmbiz.qpic.cn/mmbiz_png/TZL4BdZpLdg1WiaACTFduylNCfqWZM2Z8KTEibP0R2d4Jibl7ztkD7ocZFoAzAM4h5U2l4lKMRxXCI03whwuWUAww/640?wx_fmt=png&from=appmsg)

6. 代理模式（Proxy Pattern）
----------------------

代理模式为另一个对象提供一个代理或占位符，以控制对它的访问，一般应用场景表现在：

*   延迟加载（如图片懒加载）。
    
*   访问控制（如权限验证）。
    
*   缓存代理。
    

![](https://mmbiz.qpic.cn/mmbiz_png/TZL4BdZpLdg1WiaACTFduylNCfqWZM2Z8icFiaW3liaWMNKQnR5xXuWHbJ7icLZOsKeqAKtnGnUh5MJ66jV98KoV7DQ/640?wx_fmt=png&from=appmsg)

7. 适配器模式（Adapter Pattern）
-------------------------

适配器模式将一个类的接口转换成客户端期望的另一个接口，一般应用场景表现在：

*   兼容旧代码。
    
*   集成第三方库。
    

![](https://mmbiz.qpic.cn/mmbiz_png/TZL4BdZpLdg1WiaACTFduylNCfqWZM2Z878Oic6JcrsfEMPNITrYva80ckPkT42LUMMFdvIAGibgaHoPH3RPcKSzw/640?wx_fmt=png&from=appmsg)

8. 命令模式（Command Pattern）
------------------------

命令模式将请求封装为对象，从而支持参数化、队列化和日志化操作，一般应用场景表现在：

*   撤销 / 重做功能。
    
*   任务队列。
    
*   宏命令。
    

![](https://mmbiz.qpic.cn/mmbiz_png/TZL4BdZpLdg1WiaACTFduylNCfqWZM2Z8ZKHXCXLkSkdm6qwZyZGNIYuZJSkowDb3xlmEsJticuEoAR1lDRwWYJg/640?wx_fmt=png&from=appmsg)

9. 模板方法模式（Template Method Pattern）
----------------------------------

模板方法模式定义了一个算法的骨架，允许子类在不改变结构的情况下重写某些步骤，一般应用场景表现在：

*   框架设计。
    
*   算法复用。
    

![](https://mmbiz.qpic.cn/mmbiz_png/TZL4BdZpLdg1WiaACTFduylNCfqWZM2Z8VdRg9pLYUHH8ibGgic9B6JAoVHOVPkNZ8XQCmmE6NPZbohIpnaNG10aQ/640?wx_fmt=png&from=appmsg)

10. 状态模式（State Pattern）
-----------------------

状态模式允许对象在其内部状态改变时改变其行为，一般应用场景表现在：

*   状态机（如订单状态）。
    
*   游戏角色状态。
    

![](https://mmbiz.qpic.cn/mmbiz_png/TZL4BdZpLdg1WiaACTFduylNCfqWZM2Z8WolsbAGFDeUosvnWYHekL05hiaMkIauKKExtBm4tBicxHQ1ADjWpQOcA/640?wx_fmt=png&from=appmsg)

*   我是 ssh，工作 6 年 +，阿里云、字节跳动 Web infra 一线拼杀出来的资深前端工程师 + 面试官，非常熟悉大厂的面试套路，Vue、React 以及前端工程化领域深入浅出的文章帮助无数人进入了大厂。
    
*   欢迎`长按图片加 ssh 为好友`，我会第一时间和你分享前端行业趋势，学习途径等等。2025 陪你一起度过！
    

*   ![](https://mmbiz.qpic.cn/mmbiz_png/iagNW4Zy9CyYB7lXXMibCMPY61fjkytpQrer2wkVcwzAZicenwnLibkfPZfxuWmn0bNTbicadZFXzcOvOFom7h9zeJQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)
    
*     
    

关注公众号，发送消息：

指南，获取高级前端、算法**学习路线**，是我自己一路走来的实践。

简历，获取大厂**简历编写指南**，是我看了上百份简历后总结的心血。

面经，获取大厂**面试题**，集结社区优质面经，助你攀登高峰

因为微信公众号修改规则，如果不标星或点在看，你可能会收不到我公众号文章的推送，请大家将本**公众号星标**，看完文章后记得**点下赞**或者**在看**，谢谢各位！