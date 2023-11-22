> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/bOlc6TH2ZChYVQLUq-vSiw)

日历组件想必大家都用过，在各个组件库里都有。

比如 antd 的 Calendar 组件（或者 DatePicker 组件）：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaaq10QBwGSPhlKx9B64icSlhaRqtalB4icqUe8KzVGBeMm4rzjXhENQ3MUtjP20AproPuROiciacN54g/640?wx_fmt=png)

那这种日历组件是怎么实现的呢？

其实原理很简单，今天我们就来自己实现一个。

首先，要过一下 Date 的 api：

创建 Date 对象时可以传入年月日时分秒。

比如 2023 年 7 月 30，就是这么创建：

```
new Date(2023, 6, 30);
```

可以调用 toLocaleString 来转成当地日期格式的字符串显示：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaaq10QBwGSPhlKx9B64icSlgNZI5GWyzPvEoGGOz1AQNcfTEYiaZmOzGO1hrYF7iaxwM7tCyrUJOic0g/640?wx_fmt=png)

有人说 7 月为啥第二个参数传 6 呢？

因为 Date 的 month 是从 0 开始计数的，取值是 0 到 11：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaaq10QBwGSPhlKx9B64icSlyDl8YlakmN9lUy4a8Ysiaf4ricjg2JvS7ytlVtx7AjleeEAzv3HRh8TA/640?wx_fmt=png)

而日期 date 是从 1 到 31。

而且有个小技巧，当你 date 传 0 的时候，取到的是上个月的最后一天：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaaq10QBwGSPhlKx9B64icSlboVa4AEOleIiaLpo0PYO06oxo7QiaVbPc9CJB81gFSeC9rAv250v5VeQ/640?wx_fmt=png)

-1 就是上个月的倒数第二天，-2 就是倒数第三天这样。

这个小技巧有很大的用处，可以用这个来拿到每个月有多少天：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaaq10QBwGSPhlKx9B64icSlCXtchC1l7CEiab6gPdWB3XjJNKgBKITPJ7libicPniasibu7kTvfeIxia3sQ/640?wx_fmt=png)

今年一月 31 天、二月 28 天、三月 31 天。。。

除了日期外，也能通过 getFullYear、getMonth 拿到年份和月份：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaaq10QBwGSPhlKx9B64icSlXW5QzibmPORc4k2FqaZF9diabeT4d7MZDa0icGibW0b4ZuAibYJ6PRdibH0A/640?wx_fmt=png)

还可以通过 getDay 拿到星期几。

比如今天（2023-7-19）是星期三：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaaq10QBwGSPhlKx9B64icSlORT8bKORxwSVmCQUJS0zV7VkkkMlUJnZHlXBdO4XKFWiaNHtkNqNia4A/640?wx_fmt=png)

就这么几个 api 就已经可以实现日历组件了。

不信？我们来试试看：

用 cra 创建 typescript 的 react 项目：

```
npx create-react-app --template=typescript calendar-test
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaaq10QBwGSPhlKx9B64icSlAjib6iaOFNQuIDpgSWHuwLaicj7aliaRGKPlOQLd2PX7U8QjormtnyOqtA/640?wx_fmt=png)

我们先来写下静态的布局：

大概一个 header，下面是从星期日到星期六，再下面是从 1 到 31：

改下 App.tsx:

```
import React from 'react';import './index.css';function Calendar() {  return (    <div class>31</div>      </div>    </div>  );}export default Calendar;
```

直接跑起来看下渲染结果再讲布局：

```
npm run start
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaaq10QBwGSPhlKx9B64icSlibvA2sa3VJGLG0dAddG2zKP7ibYzf0NRy6yYJUIhQm3cibuqvsw855zMw/640?wx_fmt=png)

这种布局还是挺简单的：

header 就是一个 space-between 的 flex 容器：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaaq10QBwGSPhlKx9B64icSlCkpc5L2IZxIeFOKtaUMptoVV9t53vgqbib6buSFjlWHGjwtpFqgV5NA/640?wx_fmt=png)

下面是一个 flex-wrap 为 wrap，每个格子宽度为 100% / 7 的容器：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaaq10QBwGSPhlKx9B64icSlrcI24bEZZ1LAD10xPmIiaVYb6ib6e3lHo0Gosqr7RhFCx8l7uSzVhuxg/640?wx_fmt=png)![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaaq10QBwGSPhlKx9B64icSlibBdbG3hy30P0iaLsf2Hj9ZXCv2pbnv0icduYYqPeMWbnIhLC3icEEwLsA/640?wx_fmt=png)

全部样式如下：

```
.calendar {  border: 1px solid #aaa;  padding: 10px;  width: 300px;  height: 250px;}.header {  display: flex;  justify-content: space-between;  align-items: center;  height: 40px;}.days {  display: flex;  flex-wrap: wrap;}.empty, .day {  width: calc(100% / 7);  text-align: center;  line-height: 30px;}.day:hover {  background-color: #ccc;  cursor: pointer;}
```

然后我们再来写逻辑：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaaq10QBwGSPhlKx9B64icSlQMZ2NwV6XCTmmzm11fMOyD5OC1pNvic7aCXVNfBE38lafc0RcwdEJ8g/640?wx_fmt=png)

首先，我们肯定要有一个 state 来保存当前的日期，默认值是今天。

然后点击左右按钮，会切换到上个月、下个月的第一天。

```
const [date, setDate] = useState(new Date());const handlePrevMonth = () => {    setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1));};const handleNextMonth = () => {    setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1));};
```

然后渲染的年月要改为当前 date 对应的年月：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaaq10QBwGSPhlKx9B64icSl4LMiaHtfTeiay31qE5AiaKyyRiarFne8orD8ibN5ZuvTticIGQbMTQbYg9Hw/640?wx_fmt=png)

我们试试看：

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/YprkEU0TtGiaaq10QBwGSPhlKx9B64icSlDXrQHSZK1FsFUrnFiaoT6t4MVPcoQXibfcYFl7lPUFoQsZHP98NvKX3w/640?wx_fmt=gif)

年月部分没问题了。

再来改下日期部分：

我们定义一个 renderDates 方法：

```
const daysOfMonth = (year: number, month: number) => {    return new Date(year, month + 1, 0).getDate();};const firstDayOfMonth = (year: number, month: number) => {    return new Date(year, month, 1).getDay();};const renderDates = () => {    const days = [];    const daysCount = daysOfMonth(date.getFullYear(), date.getMonth());    const firstDay = firstDayOfMonth(date.getFullYear(), date.getMonth());    for (let i = 0; i < firstDay; i++) {      days.push(<div key={`empty-${i}`} class></div>);    }    for (let i = 1; i <= daysCount; i++) {      days.push(<div key={i} class>{i}</div>);    }    return days;};
```

首先定义个数组，来存储渲染的内容。

然后计算当前月有多少天，这里用到了前面那个 new Date 时传入 date 为 0 的技巧。

再计算当前月的第一天是星期几，也就是 new Date(year, month, 1).getDay()

这样就知道从哪里开始渲染，渲染多少天了。

然后先一个循环，渲染 day - 1 个 empty 的块。

再渲染 daysCount 个 day 的块。

这样就完成了日期渲染：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaaq10QBwGSPhlKx9B64icSljA1AIOoaSwsMVyibTU7pauYIrVfjNdmE4ib4T5MFkABYKBLu8eWBibbdA/640?wx_fmt=png)

我们来试试看：

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/YprkEU0TtGiaaq10QBwGSPhlKx9B64icSliaib8Y5fgQf2258b1Eq3woBE23X7mlQJgSPYNIlZ9HY6SUYuKgfYn1fw/640?wx_fmt=gif)

没啥问题。

这样，我们就完成了一个 Calendar 组件！

是不是还挺简单的？

确实，Calendar 组件的原理比较简单。

接下来，我们增加两个参数，value 和 onChange。

这俩参数和 antd 的 Calendar 组件一样。

value 参数设置为 date 的初始值：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaaq10QBwGSPhlKx9B64icSlH2ibJEA2AriaFdmOlP3Zm8MribU3xwNv6QFEAbIUfo7lCJFl2Aj5WU97g/640?wx_fmt=png)

我们试试看：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaaq10QBwGSPhlKx9B64icSlpkibH90o74Vs5Xic9F8PqszujyS6ZFWoKr82e7u78icmlee1sheQ3n1IA/640?wx_fmt=png)![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaaq10QBwGSPhlKx9B64icSl2QiaDLGiaKNHLff9CGzgzcqlucicLibm8Tic80Uq32DhHwOGnuj4xcctXHA/640?wx_fmt=png)

年月是对了，但是日期对不对我们也看不出来，所以还得加点选中样式：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaaq10QBwGSPhlKx9B64icSlBfVMC2sefGdWcf0EY6TSI1qIgM9ufZ0WUyE06EOHHAqalEfJcfcxYg/640?wx_fmt=png)![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaaq10QBwGSPhlKx9B64icSlicQSemTVXoBTRIElXqoV3hAUE6Gx5jwBfD0kjKYgp1yPHP0s3jkpibmQ/640?wx_fmt=png)

现在就可以看到选中的日期了：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaaq10QBwGSPhlKx9B64icSlS9EeialP6hoYsZsKYxo1pQ1XVsPWGUxnaKZ7Gq8168Yk1FicqKDkd7Dw/640?wx_fmt=png)

没啥问题。

然后我们再加上 onChange 的回调函数：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaaq10QBwGSPhlKx9B64icSl08ADSy0vhxiaaN15B3XRMDbMIlsRnFMNfExKJosWuw0oM4ySmq2ziaWg/640?wx_fmt=png)

就是在点击 day 的时候，调用 bind 了对应日期的 onChange 函数。

我们试试看：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaaq10QBwGSPhlKx9B64icSlvQksbcecK5WVV6WunFCxFnPekWuicnicMhhS6sZPLDHVDUxlPKbTTNpw/640?wx_fmt=png)![](https://mmbiz.qpic.cn/sz_mmbiz_gif/YprkEU0TtGiaaq10QBwGSPhlKx9B64icSlpicPpbyHwfvmGCl9Wa9W5NhT7ibOaibSjjmnUtsBRoPCQNM2OQaVgGpJQ/640?wx_fmt=gif)

也没啥问题。

现在这个 Calendar 组件就是可用的了，可以通过 value 来传入初始的 date 值，修改 date 之后可以在 onChange 里拿到最新的值。

大多数人到了这一步就完成 Calendar 组件的封装了。

这当然没啥问题。

但其实你还可以再做一步，提供 ref 来暴露一些 Canlendar 组件的 api。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaaq10QBwGSPhlKx9B64icSlw39GQUGkxd2k4g0ZRdI4XRNSqP7RB7PqSjB6WaMDpL5GUdFWBZyPFQ/640?wx_fmt=png)![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaaq10QBwGSPhlKx9B64icSlUnHHfF8kTSgkQwKibFfiaCrbyoicvzMe6241w6JmljW5iaDiaojCjzDdYYg/640?wx_fmt=png)

关于 forwardRef + useImperativeHandle 的详细介绍，可以看我之前的那篇： [让你 React 组件水平暴增的 5 个技巧](https://mp.weixin.qq.com/s?__biz=Mzg3OTYzMDkzMg==&mid=2247496859&idx=1&sn=6f822d3df9763654faf83f11d1a886c5&chksm=cf033ba0f874b2b61c7ac9973cf439edc0167f2ccf1c177aaf9cad10118b9ef743febb9bbe36&token=1172854687&lang=zh_CN&scene=21#wechat_redirect)

用的时候这样用：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaaq10QBwGSPhlKx9B64icSlibQEFuJyXtItFa5Rt8QlgCHJB5I83vLRkRQkJmdic9AmzClPamia9YFiaA/640?wx_fmt=png)

试试看：

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/YprkEU0TtGiaaq10QBwGSPhlKx9B64icSlHNwJmP6eiclZSAbes0zFunsWKdGJyiaYFcVwEcQ3H8t4ud9ndn5RY70w/640?wx_fmt=gif)

ref 的 api 也都生效了。

这就是除了 props 之外，另一种暴露组件 api 的方式。

你经常用的 Canlendar 或者 DatePicker 组件就是这么实现的，

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaaq10QBwGSPhlKx9B64icSlE35DuuguLu7KXhLO2hUG0ibzFmU69YibEy0tWkcXZs5dBfcu7m6XHxzA/640?wx_fmt=png)

当然，这些组件除了本月的日期外，其余的地方不是用空白填充的，而是上个月、下个月的日期。

这个也很简单，拿到上个月、下个月的天数就知道填什么日期了。

全部代码如下：

```
import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';import './index.css';interface CalendarProps {  value?: Date,  onChange?: (date: Date) => void}interface CalendarRef {  getDate: () => Date,  setDate: (date: Date) => void,}const InternalCalendar: React.ForwardRefRenderFunction<CalendarRef, CalendarProps> = (props, ref) => {  const {    value = new Date(),    onChange,  } = props;  const [date, setDate] = useState(value);  useImperativeHandle(ref, () => {    return {      getDate() {        return date;      },      setDate(date: Date) {        setDate(date)      }    }  });  const handlePrevMonth = () => {    setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1));  };  const handleNextMonth = () => {    setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1));  };  const monthNames = [    '一月',    '二月',    '三月',    '四月',    '五月',    '六月',    '七月',    '八月',    '九月',    '十月',    '十一月',    '十二月',  ];  const daysOfMonth = (year: number, month: number) => {    return new Date(year, month + 1, 0).getDate();  };  const firstDayOfMonth = (year: number, month: number) => {    return new Date(year, month, 1).getDay();  };  const renderDates = () => {    const days = [];    const daysCount = daysOfMonth(date.getFullYear(), date.getMonth());    const firstDay = firstDayOfMonth(date.getFullYear(), date.getMonth());    for (let i = 0; i < firstDay; i++) {      days.push(<div key={`empty-${i}`} class></div>);    }    for (let i = 1; i <= daysCount; i++) {      const clickHandler = onChange?.bind(null, new Date(date.getFullYear(), date.getMonth(), i));      if(i === date.getDate()) {        days.push(<div key={i} class onClick={clickHandler}>{i}</div>);        } else {        days.push(<div key={i} class onClick={clickHandler}>{i}</div>);      }    }    return days;  };  return (    <div class>        <button onClick={handlePrevMonth}><</button>        <div>{date.getFullYear()}年{monthNames[date.getMonth()]}</div>        <button onClick={handleNextMonth}>></button>      </div>      <div class>六</div>        {renderDates()}      </div>    </div>  );}const Calendar = React.forwardRef(InternalCalendar);function Test() {  const calendarRef = useRef<CalendarRef>(null);  useEffect(() => {    console.log(calendarRef.current?.getDate().toLocaleDateString());    setTimeout(() => {      calendarRef.current?.setDate(new Date(2024, 3, 1));    }, 3000);  }, []);  return <div>    {/* <Calendar value={new Date('2023-3-1')} onChange={(date: Date) => {        alert(date.toLocaleDateString());    }}></Calendar> */}    <Calendar ref={calendarRef} value={new Date('2024-8-15')}></Calendar>  </div>}export default Test;
```

```
.calendar {  border: 1px solid #aaa;  padding: 10px;  width: 300px;  height: 250px;}.header {  display: flex;  justify-content: space-between;  align-items: center;  height: 40px;}.days {  display: flex;  flex-wrap: wrap;}.empty, .day {  width: calc(100% / 7);  text-align: center;  line-height: 30px;}.day:hover, .selected {  background-color: #ccc;  cursor: pointer;}
```

总结
--

Calendar 或者 DatePicker 组件我们经常会用到，今天自己实现了一下。

其实原理也很简单，就是 Date 的 api。

new Date 的时候 date 传 0 就能拿到上个月最后一天的日期，然后 getDate 就可以知道那个月有多少天。

然后再通过 getDay 取到这个月第一天是星期几，就知道怎么渲染这个月的日期了。

我们用 react 实现了这个 Calendar 组件，支持传入 value 指定初始日期，传入 onChange 作为日期改变的回调。

除了 props 之外，还额外提供 ref 的 api，通过 forwarRef + useImperativeHandle 的方式。

整天用 DatePicker 组件，不如自己手写一个吧！