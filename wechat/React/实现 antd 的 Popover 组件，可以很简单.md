> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/5dXxrY9jiLDgoODsQGWXdQ)

组件库一般都有 Popover 和 Tooltip 这两个组件，它们非常相似。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjqBI6zvy5YbSFhsC1qT1kUwdpOSyAGroTmmz25EZhCdUx2d6KW2se4mz7f5cTax1jffZh4yKFe1w/640?wx_fmt=png&from=appmsg)![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjqBI6zvy5YbSFhsC1qT1kU3hfok8NrONyrzqAibGNgHFJPdyK6T01iazH8Libqekp3sPpWLxqOPicKxg/640?wx_fmt=png&from=appmsg)

不过应用场景是有区别的：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjqBI6zvy5YbSFhsC1qT1kUuibk5V0h5Az7ssEvmXA1YUj9xjY5phN7lkqus9JfqQE0Z2m22IfJO3Q/640?wx_fmt=png&from=appmsg)

Tooltip（文字提示） 是用来代替 title 的，做一个文案解释。

而 Popover（气泡卡片）可以放更多的内容，可以交互：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjqBI6zvy5YbSFhsC1qT1kUu3xR8B7ibkDx9G58ckdjslcDwWxbdian32fJA6ibPn9BQMW6iawBve9uRA/640?wx_fmt=png&from=appmsg)

所以说，这俩虽然长得差不多，但确实要分为两个组件来写。

这个组件看起来比较简单，但实现起来很麻烦。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjqBI6zvy5YbSFhsC1qT1kUnGibUHKrX7cENsyUvBcAKQ7o8SE82lPibNl8denNAAXlJoJic7HmP8UiaQ/640?wx_fmt=png&from=appmsg)

你可能会说，不就是写好样式，然后绝对定位到元素上面么？

不只是这样。

首先，placement 参数可以指定 12 个方向，top、topleft、topright、bottom 等：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjqBI6zvy5YbSFhsC1qT1kUDVflCZxSxCyeASicTmnbvAVaBw2pFRklrPeJNt5OX3EJrtIRWX0ZuUA/640?wx_fmt=png&from=appmsg)

这些不同方向的位置计算都要实现。

而且，就算你指定了 left，当左边空间不够的时候，也得做下处理，展示在右边：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjqBI6zvy5YbSFhsC1qT1kUCEKTdps3yjE74w88BFe1b2AwfCjo0DQjJuLIfGntgCBib9jJxD0waJQ/640?wx_fmt=png&from=appmsg)

而且当方向不同时，箭头的显示位置也不一样：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjqBI6zvy5YbSFhsC1qT1kUZhUNib8icjhrqnED22ZHypzalASZ2nP7RYuCia3s1tQ1Lic7NJp5KJ0XYA/640?wx_fmt=png&from=appmsg)![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjqBI6zvy5YbSFhsC1qT1kUA4wHlL408DzHlFPYw6uFIkDUQwviaWZ1NNn9L05ZTRdRKG98U4ZtICQ/640?wx_fmt=png&from=appmsg)

所以要实现这样一个 Popover 组件，光计算浮层的显示位置就是不小的工作量。

不过好在这种场景有专门的库做了封装，完全没必要自己写。

它就是 floating-ui。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjqBI6zvy5YbSFhsC1qT1kUztFawShEfCLeeDMJ485vV5EEX8MrTicibs738QR2cjsyuJRLz6qYcwhg/640?wx_fmt=png&from=appmsg)

看介绍就可以知道，它是专门用来创建 tooltip、popover、dropdown 这类浮动的元素的。

它的 logo 也很形象：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjqBI6zvy5YbSFhsC1qT1kU7N0YpVaJV7YtBuXibg322icL34mAg9BRZooCemiaKXc2Szcdn92S6PVyg/640?wx_fmt=png&from=appmsg)

那它怎么用呢？

我们新建个项目试试看：

```
npx create-vite
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjqBI6zvy5YbSFhsC1qT1kUniceC9ibWs78RexN7ITBa7iaJw9w0HicTPLG4Rk42uPiaz8UFUGhqs1VobA/640?wx_fmt=png&from=appmsg)

用 create-vite 创建个 react 项目。

进入项目，安装依赖，然后把服务跑起来：

```
npm install
npm run dev
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjqBI6zvy5YbSFhsC1qT1kUQHZRlwtnUWCcWkzDfhhhibENZJ9FP7IjDSHZC60JmOwYgteK5IrWRYA/640?wx_fmt=png&from=appmsg)![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjqBI6zvy5YbSFhsC1qT1kUeK5xLA8ibUz7Nia779BO8QkLiarblEfpN7wosoDwIbnnbVV2F623ySGiaA/640?wx_fmt=png&from=appmsg)

没啥问题。

改下 main.tsx，去掉 index.css，并且把 StrictMode 去掉，它会导致重复渲染：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjqBI6zvy5YbSFhsC1qT1kUsicFRAjGRKgIKFrJQEL5o34389fwTECLib9jpT1W7MibwR5GwRO1pUapA/640?wx_fmt=png&from=appmsg)

然后安装下 floating-ui 的包：

```
npm install --save @floating-ui/react
```

改下 App.tsx

```
import {  useInteractions,  useFloating,  useHover,} from '@floating-ui/react';import { useState } from 'react'; export default function App() {  const [isOpen, setIsOpen] = useState(false);   const {refs, floatingStyles, context} = useFloating({    open: isOpen,    onOpenChange: setIsOpen  });   const hover = useHover(context);  const { getReferenceProps, getFloatingProps } = useInteractions([    hover  ]);  return (    <>      <button ref={refs.setReference} {...getReferenceProps()}>        hello      </button>      {        isOpen && <div            ref={refs.setFloating}            style={floatingStyles}            {...getFloatingProps()}          >            光光光光光          </div>      }    </>  );}
```

先看看效果：

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/YprkEU0TtGjqBI6zvy5YbSFhsC1qT1kUO2NwQdGPlY9YZKvmBqsYEGic8mY6pcib9QXjpRSVlYzicxOfR8x4gHnJw/640?wx_fmt=gif&from=appmsg)

可以看到，hover 的时候浮层会在下面出现。

看下代码：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjqBI6zvy5YbSFhsC1qT1kUVkD6u2abtiaBAOJlLSnuHu3BficR11ia6GnJDmsoEdxdY7Aud9tIyvvIw/640?wx_fmt=png&from=appmsg)

首先，用到了 useFloating 这个 hook，它的作用就是计算浮层位置的。

给它相对的元素、浮层元素的 ref，它就会计算出浮层的 style 来。

它可以指定浮层出现的方向：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjqBI6zvy5YbSFhsC1qT1kUuicUjc4PSsuVKVVhaibenedpltAhesiaEBxt37IjlhXDr1vLqSXrSIO1w/640?wx_fmt=png&from=appmsg)

比如当 placement 指定为 right 时，效果就是这样的：

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/YprkEU0TtGjqBI6zvy5YbSFhsC1qT1kUBKgTHkmlu2LmcWrX9FaqzULx25Hp8JtxFQghZHj8CJ0WpSPadwSQRQ/640?wx_fmt=gif&from=appmsg)

再就是 useInteractions 这个 hook：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjqBI6zvy5YbSFhsC1qT1kUl3qOEZvdyJtmFmsnKibn8eSbpxQf2eR6CJctVVGznWAaicgpHkuqntbg/640?wx_fmt=png&from=appmsg)

你可以传入 click、hover 等交互方式，然后把它返回的 props 设置到元素上，就可以绑定对应的交互事件。

比如把交互事件换成 click：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjqBI6zvy5YbSFhsC1qT1kUSjRyQQ6gITia6EtjeHruMUJEWWlo7Hb5RrEkslkaxX0ZGHluRm2dKdA/640?wx_fmt=png&from=appmsg)

现在就是点击的时候浮层出现和消失了：

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/YprkEU0TtGjqBI6zvy5YbSFhsC1qT1kUDbeBbSjibhWl5sGN1nMJtIH9ncPZBJRnnxW7PicJdyah5sxiar9Keyg6g/640?wx_fmt=gif&from=appmsg)

不过现在有个问题：

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/YprkEU0TtGjqBI6zvy5YbSFhsC1qT1kUhmo3RUkGQh9v6tjkNC3sMzZrG2kDIia1MIYUvYdlicu8HeY6BxiaSgziaQ/640?wx_fmt=gif&from=appmsg)

只有点击按钮，浮层才会消失，点击其他位置不会。

这时候可以加上 dismiss 的处理：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjqBI6zvy5YbSFhsC1qT1kUwT4Zhd7Bfaia5via1mQM4L6OFxDrJjicOKNGhLKfNuBBvbfwz0ylvQccA/640?wx_fmt=png&from=appmsg)

现在点击其它位置，浮层就会消失，并且按 ESC 键也会消失：

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/YprkEU0TtGjqBI6zvy5YbSFhsC1qT1kUUQA3xmGhd9iayzxwEJficE0OLlzs00QYwibkp31brKc0yiaiavJmIcenVRg/640?wx_fmt=gif&from=appmsg)

也就是说 **useFloating 是用来给浮层确定位置的，useInteractions 是用来绑定交互事件的**。

有的同学会说，这也不好看啊。

我们加一下样式就好了：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjqBI6zvy5YbSFhsC1qT1kUia2uRibz3aSksoK3sLkNTLcqMpeVzUibjrabvQtMBoLJWapgDfWJ3yR6w/640?wx_fmt=png&from=appmsg)

加上 className，然后在 App.css 里写下样式：

```
.popover-floating {  padding: 4px 8px;  border: 1px solid #000;  border-radius: 4px;}
```

引入看下：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjqBI6zvy5YbSFhsC1qT1kUEcXtZDnkpkuUvJK515fGzumYtYq3p0pkyHicBBRwEkYfZn0EaHpbUwA/640?wx_fmt=png&from=appmsg)![](https://mmbiz.qpic.cn/sz_mmbiz_gif/YprkEU0TtGjqBI6zvy5YbSFhsC1qT1kU7pRPJJ8VOhYO6iaiaibsfsxGicqIupAOeXLE1Pblvbic56EpSict2f1UGJrA/640?wx_fmt=gif&from=appmsg)

但是现在的定位有点问题，离着太近了，能不能修改下定位呢？

可以。

加一个 offset 的 middleware 就好了：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjqBI6zvy5YbSFhsC1qT1kU18lUH4uNk2cvhKCCEiakHzq3QHcEGa6J7Q3uq1RsqwgDlqO8tm6jmcA/640?wx_fmt=png&from=appmsg)

它的效果就是修改两者距离的：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjqBI6zvy5YbSFhsC1qT1kUo1XobAQ1vjicZhnjfIGSD3kewSshp90ibsZwCmibxzXJ1JLwEGzUEvoBA/640?wx_fmt=png&from=appmsg)![](https://mmbiz.qpic.cn/sz_mmbiz_gif/YprkEU0TtGjqBI6zvy5YbSFhsC1qT1kUxbsLhMZHnt7JoYKsZowUQK8kibV5pBlIq9etQltmEPTxicGBuBvXvzLg/640?wx_fmt=gif&from=appmsg)

箭头也不用自己写，有对应的中间件：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjqBI6zvy5YbSFhsC1qT1kUdAZRrEWz6HuMQlKy04FiaJ2J9Zfia5gfVC5FIjfP73PWNG3CpuoDRIEQ/640?wx_fmt=png&from=appmsg)

```
import {  useInteractions,  useFloating,  useHover,  useClick,  useDismiss,  offset,  arrow,  FloatingArrow,} from '@floating-ui/react';import { useRef, useState } from 'react';import './App.css'; export default function App() {  const arrowRef = useRef(null);  const [isOpen, setIsOpen] = useState(false);   const {refs, floatingStyles, context} = useFloating({    open: isOpen,    onOpenChange: setIsOpen,    placement: 'right',    middleware: [      offset(10),      arrow({        element: arrowRef,      }),    ]  });   const click = useClick(context);  const dismiss = useDismiss(context);  const { getReferenceProps, getFloatingProps } = useInteractions([    click,    dismiss  ]);  return (    <>      <button ref={refs.setReference} {...getReferenceProps()}>        hello      </button>      {        isOpen && <div            className='popover-floating'            ref={refs.setFloating}            style={floatingStyles}            {...getFloatingProps()}          >            光光光            <FloatingArrow ref={arrowRef} context={context}/>          </div>      }    </>  );}
```

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/YprkEU0TtGjqBI6zvy5YbSFhsC1qT1kUMQf13hzibstHJnCspNQH6ribcn92rN7c037pqAWhIhSjTM96RicS1ngCQ/640?wx_fmt=gif&from=appmsg)

这样箭头就有了。

只不过样式不大对，我们修改下：

```
<FloatingArrow ref={arrowRef} context={context} fill="#fff" stroke="#000" strokeWidth={1}/>
```

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/YprkEU0TtGjqBI6zvy5YbSFhsC1qT1kUtBjjr58TTgH6ZicT3bHOeSrPft6y7tL5kTCvxtibL9Z1lDa8dhoJbnUg/640?wx_fmt=gif&from=appmsg)

这样，箭头位置就有了。

给 button 加一些 margin，我们试试其它位置的 popover 对不对：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjqBI6zvy5YbSFhsC1qT1kUmnibzUKOicSk0OWrmibPfUz0jKB0kW4z36Ky7qfDh6n96PACeRXmIXnCg/640?wx_fmt=png&from=appmsg)

分别设置不同 placement：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjqBI6zvy5YbSFhsC1qT1kUgNia67F70YnfaA9XoK1ZXNO2KbwXUdPa6FjXyEOCAOjOz8LfJnC1GvA/640?wx_fmt=png&from=appmsg)

top-end

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjqBI6zvy5YbSFhsC1qT1kUALyAVnsrhHW2oGpWVJgNdGRJrKhNVWu47wick0dX7lK7Oib1f5Kf3ZXQ/640?wx_fmt=png&from=appmsg)

left-start

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjqBI6zvy5YbSFhsC1qT1kUjEbJTXauzcCS7ndUNQxLoiavDgaqsM4fP6V2FSHxZG5owjxV31t7ang/640?wx_fmt=png&from=appmsg)

left

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjqBI6zvy5YbSFhsC1qT1kUDj3tsTVx9Bt5ehGYWyCdME7x770Oib9GkHN0icaZjxgZQ1By2QW9wLAQ/640?wx_fmt=png&from=appmsg)

都没问题。

不过现在并没有做边界的处理：

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/YprkEU0TtGjqBI6zvy5YbSFhsC1qT1kUlbfcJKYzPJSYKQcZx6kHtAJr3AictNfZh4HqVolQ5GQtFfibOibhKTCRA/640?wx_fmt=gif&from=appmsg)

设置 top 的时候，浮层超出可视区域，这时候应该显示在下面。

加上 flip 中间件就好了：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjqBI6zvy5YbSFhsC1qT1kU9r1hnxqaWP3uEUELEN4lAb50DGtY27TaytxOYicGU5LDFSLLicibYCTMg/640?wx_fmt=png&from=appmsg)![](https://mmbiz.qpic.cn/sz_mmbiz_gif/YprkEU0TtGjqBI6zvy5YbSFhsC1qT1kU34fLHhIjRm3TTBPJ814iaOQoS8xC6zY0SXHf5qzn4aNwSeHZI9IiavrQ/640?wx_fmt=gif&from=appmsg)

这样，popover 的功能就完成了。

我们封装下 Popover 组件。

新建 Popover/index.tsx

```
import { CSSProperties, PropsWithChildren, ReactNode } from "react";import {    useInteractions,    useFloating,    useClick,    useDismiss,    offset,    arrow,    FloatingArrow,    flip,    useHover,} from '@floating-ui/react';import { useRef, useState } from 'react';import './index.css';  type Alignment = 'start' | 'end';type Side = 'top' | 'right' | 'bottom' | 'left';type AlignedPlacement = `${Side}-${Alignment}`;interface PopoverProps extends PropsWithChildren {    content: ReactNode,    trigger?: 'hover' | 'click'    placement?: Side | AlignedPlacement,    open?: boolean,    onOpenChange?: (open: boolean) => void,    className?: string;    style?: CSSProperties}export default function Popover(props: PopoverProps) {    const {        open,        onOpenChange,        content,        children,        trigger = 'hover',        placement = 'bottom',        className,        style    } = props;    const arrowRef = useRef(null);    const [isOpen, setIsOpen] = useState(open);         const {refs, floatingStyles, context} = useFloating({      open: isOpen,      onOpenChange: (open) => {        setIsOpen(open);        onOpenChange?.(open);      },      placement,      middleware: [        offset(10),        arrow({          element: arrowRef,        }),        flip()      ]    });       const interaction = trigger === 'hover' ? useHover(context) : useClick(context);    const dismiss = useDismiss(context);      const { getReferenceProps, getFloatingProps } = useInteractions([        interaction,        dismiss    ]);      return (      <>        <span ref={refs.setReference} {...getReferenceProps()} className={className} style={style}>          {children}        </span>        {          isOpen && <div              className='popover-floating'              ref={refs.setFloating}              style={floatingStyles}              {...getFloatingProps()}            >              {content}              <FloatingArrow ref={arrowRef} context={context} fill="#fff" stroke="#000" strokeWidth={1}/>            </div>        }      </>    );}
```

Popover/index.css

```
.popover-floating {    padding: 4px 8px;    border: 1px solid #000;    border-radius: 4px;}
```

整体代码和之前差不多，有几处不同：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjqBI6zvy5YbSFhsC1qT1kUR16OdfKwxZ7L4fSyAibDwfdzo6ElxcPW3PNBrTERCpDCkj7FmxC2Haw/640?wx_fmt=png&from=appmsg)

参数继承 PropsWithChildren，可以传入 children 参数。

可以传入 content，也就是浮层的内容。

trigger 参数是触发浮层的方式，可以是 click 或者 hover。

placement 就是 12 个方向。

而 open、onOpenChange 则是可以在组件外控制 popover 的显示隐藏。

className 和 style 设置到内层的 span 元素上：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjqBI6zvy5YbSFhsC1qT1kU92a9kfic2pzPiaETPBwPeKpoibNRlbHak1LZea2cXNOz2L5vV7MJNpP7g/640?wx_fmt=png&from=appmsg)

在 App.tsx 里引入下：

```
import Popover from './Popover';export default function App() {  const popoverContent = <div>    光光光    <button onClick={() => {alert(1)}}>111</button>  </div>;  return <Popover    content={popoverContent}    placement='bottom'    trigger='click'    style={{margin: '200px'}}  >    <button>点我点我</button>  </Popover>}
```

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/YprkEU0TtGjqBI6zvy5YbSFhsC1qT1kUMglfVu9DzHaDTGxx0U3u7pCC9vjSnzMeLEEUoicj6QK78n1XYPlYzyg/640?wx_fmt=gif&from=appmsg)

这样，Popover 组件的基本功能就完成了。

但现在 Popover 组件还有个问题：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjqBI6zvy5YbSFhsC1qT1kURPPLibNJUKVxvEdHGhbKFJp87icnomt3oIxPicBkiaiayuonicEHrM90A38g/640?wx_fmt=png&from=appmsg)

浮层使用 position：absolute 定位的，应该是相对于 body 定位，但如果中间有个元素也设置了 position: relative 或者 absolute，那样定位就是相对于那个元素了。

所以，要把浮层用 createPortal 渲染到 body 之下。

```
const el = useMemo(() => {    const el = document.createElement('div');    el.className = `wrapper`;    document.body.appendChild(el);    return el;}, []);const floating = isOpen && <div    className='popover-floating'    ref={refs.setFloating}    style={floatingStyles}    {...getFloatingProps()}>    {content}    <FloatingArrow ref={arrowRef} context={context} fill="#fff" stroke="#000" strokeWidth={1}/></div>return (  <>    <span ref={refs.setReference} {...getReferenceProps()} className={className} style={style}>      {children}    </span>    {      createPortal(floating, el)    }  </>);
```

这样，Popover 浮层就渲染到了 body 下：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjqBI6zvy5YbSFhsC1qT1kUHVJ6ic0wwUwD3WibWZ1vuLaibiaPV3nyPnbcQ7MkiaKXqWbiabfk1iaJkRDCg/640?wx_fmt=png&from=appmsg)

至此，Popover 组件就封装完了。

案例代码上传了 react 小册仓库：https://github.com/QuarkGluonPlasma/react-course-code/tree/main/popover-component

总结
--

今天我们封装了 Popover 组件。

如果完全自己实现，计算位置还是挺麻烦的，有 top、right、left 等不同位置，而且到达边界的时候也要做特殊处理。

所以我们直接基于 floating-ui 来做，它是专门用于 tooltip、popover、dropdown 等浮动组件的。

用 useFloating 的 hook 来计算位置，用 useIntersections 的 hook 来处理交互。

它支持很多中间件，比如 offset 来设置偏移、arrow 来处理箭头位置，可以完成各种复杂的定位功能。

我们封装了一层，加了一些参数，然后把浮层用 createPortal 渲染到了 body 下。

这样就是一个功能完整的 Popover 组件了。

如果完全自己实现 Popover 组件，还是挺麻烦的，但是基于 floating-ui 封装，就很简单。