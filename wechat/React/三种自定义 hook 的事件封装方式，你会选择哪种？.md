> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/5CnUfFoG5SpmtOJJ0tR88g)

我们经常通过自定义 hook 的方式抽离组件的逻辑，而这种自定义 hook 里很多都是给元素绑定事件的。

绑定事件的写法一共有三种，我们一起来过一遍。

首先是 useHover 的 hook：

```
import useHover from './useHover';const App = () => {  const element = (hovered: boolean) =>    <div>      Hover me! {hovered && 'Thanks'}    </div>;  const [hoverable, hovered] = useHover(element);  return (    <div>      {hoverable}      <div>{hovered ? 'HOVERED' : ''}</div>    </div>  );};export default App;
```

浏览器只有 mouseover、mouseleave 事件，封装成 hover 的 hook 还是挺有意义的。

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/YprkEU0TtGgWXiaeoUTQBVic9wwDlvbgM5TefFhgXWiabic6pdV5Dt9cbSWwmvKKAxWQKDlJ0Y6vHMbglMRB9MzxQg/640?wx_fmt=gif&from=appmsg)

这个 hook 接收 React Element 作为参数，绑定事件后返回。

这样实现的：

```
import { cloneElement, useState } from "react";export type Element = ((state: boolean) => React.ReactElement) | React.ReactElement;const useHover = (element: Element): [React.ReactElement, boolean] => {  const [state, setState] = useState(false);  const onMouseEnter = (originalOnMouseEnter?: any) => (event: any) => {    originalOnMouseEnter?.(event);    setState(true);  };  const onMouseLeave = (originalOnMouseLeave?: any) => (event: any) => {    originalOnMouseLeave?.(event);    setState(false);  };  if (typeof element === 'function') {    element = element(state);  }  const el = cloneElement(element, {    onMouseEnter: onMouseEnter(element.props.onMouseEnter),    onMouseLeave: onMouseLeave(element.props.onMouseLeave),  });  return [el, state];};export default useHover;
```

传入的可以是 ReactElement 也可以是返回 ReactElement 的函数，内部对函数做下处理：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGgWXiaeoUTQBVic9wwDlvbgM5Fk9eiazG3agtGdIzHDkX9pZxLXKMRiaxfg8D9WsocE5lu1j1NdchhdYw/640?wx_fmt=png&from=appmsg)

用 cloneElement 复制 ReactElement，给它添加 onMouseEnter、onMouseLeave 事件。

并用 useState 保存 hover 状态：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGgWXiaeoUTQBVic9wwDlvbgM501ACicolpvibKmibJeRk64JQtu457wJkhEsiaicGgNQnyBoRyOFAX5SjOgw/640?wx_fmt=png&from=appmsg)

这里注意如果传入的 React Element 本身有 onMouseEnter、onMouseLeave 的事件处理函数，要先调用下：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGgWXiaeoUTQBVic9wwDlvbgM5RWBGGx3CDFFRDUSybTh0QcUzPqBBibja6GSYOOYWxLrichmDDOQwrpYA/640?wx_fmt=png&from=appmsg)

然后来封装 useScrolling 的 hook，它可以拿到元素是否在滚动的状态：

```
import { useRef } from "react";import useScrolling from "./useScrolling";const App = () => {  const scrollRef = useRef(null);  const scrolling = useScrolling(scrollRef);  return (    <>    {<div>{scrolling ? "滚动中.." : "没有滚动"}</div>}    <div ref={scrollRef} style={{height: '200px', overflow: 'auto'}}>      <div>guang</div>      <div>guang</div>      <div>guang</div>      <div>guang</div>      <div>guang</div>      <div>guang</div>      <div>guang</div>      <div>guang</div>      <div>guang</div>      <div>guang</div>      <div>guang</div>      <div>guang</div>      <div>guang</div>      <div>guang</div>      <div>guang</div>      <div>guang</div>      <div>guang</div>      <div>guang</div>      <div>guang</div>      <div>guang</div>      <div>guang</div>      <div>guang</div>    </div>    </>  );};export default App;
```

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/YprkEU0TtGgWXiaeoUTQBVic9wwDlvbgM5ialMiaIEK9zduH8FjDWZm579mbdAB5ZH2cJPPHDrjnsYlI9rLakOAGjw/640?wx_fmt=gif&from=appmsg)

和刚才的 useHover 差不多，但是传入的是 ref。

我们实现下：

```
import { RefObject, useEffect, useState } from 'react';const useScrolling = (ref: RefObject<HTMLElement>): boolean => {  const [scrolling, setScrolling] = useState<boolean>(false);  useEffect(() => {    if (ref.current) {      let scollingTimer: number;      const handleScrollEnd = () => {        setScrolling(false);      };      const handleScroll = () => {        setScrolling(true);        clearTimeout(scollingTimer);        scollingTimer = setTimeout(() => handleScrollEnd(), 150);      };      ref.current?.addEventListener('scroll', handleScroll);      return () => {        if (ref.current) {          ref.current?.removeEventListener('scroll', handleScroll);        }      };    }    return () => {};  }, [ref]);  return scrolling;};export default useScrolling;
```

用 useState 创建个状态，给 ref 绑定 scroll 事件，scroll 的时候设置 scrolling 为 true：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGgWXiaeoUTQBVic9wwDlvbgM5FgRYiajk24oZAq5cFMDmTj4E9l3MXkiaZZicJygfIZlM8nhkiab9iaicCGSA/640?wx_fmt=png&from=appmsg)

并且定时器 150ms 以后修改为 false。

这样只要不断滚动，就会一直重置定时器，结束滚动后才会设置为 false。

这里用的 ref 的方式绑定事件，是第二种方式。

还有，写 message 组件的时候，item 是 2s 后自动删除，但是如果 hover 上去就不会，等鼠标离开才会重新定时：

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/YprkEU0TtGgWXiaeoUTQBVic9wwDlvbgM51xiauSIPDQHdos3HsAVz2bz9etFIMibzOdQOc0h9ppPzzDxny7z2zrsg/640?wx_fmt=gif&from=appmsg)

所以我写了这个 hook：

```
import { useEffect, useRef } from 'react';export interface UseTimerProps {    id: number;    duration?: number;    remove: (id: number) => void;}export function useTimer(props: UseTimerProps) {  const { remove, id, duration = 2000 } = props;  const timer = useRef<number | null>(null);  const startTimer = () => {    timer.current = window.setTimeout(() => {        remove(id);        removeTimer();    }, duration);  };  const removeTimer = () => {    if (timer.current) {        clearTimeout(timer.current);        timer.current = null;    }  };  useEffect(() => {    startTimer();    return () => removeTimer();  }, []);  const onMouseEnter = () => {    removeTimer();  };  const onMouseLeave = () => {    startTimer();  };  return {    onMouseEnter,    onMouseLeave,  };}
```

它提供了 onMouseEnter、onMouseLeave 事件处理函数，mouseEnter 的时候移除定时器，mouseLeave 的时候重新定时，然后到时间删除：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGgWXiaeoUTQBVic9wwDlvbgM5QjzxtfbOFdibF0t6sXuhN9mS4CN9zBHMGtADTbJaa6BqqO54hwOd82w/640?wx_fmt=png&from=appmsg)

用的时候自己绑定到元素上：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGgWXiaeoUTQBVic9wwDlvbgM5PZA3vrhEkovn0rFxOvtCab7ItPXj39LmxN32Z7PWpCaOJEfpOZ1kOQ/640?wx_fmt=png&from=appmsg)![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGgWXiaeoUTQBVic9wwDlvbgM5XCIliczRNVwXaHc4msp7y0m80nAEtZM1SZ7XVJJicM0WT7DtqCRjmrhQ/640?wx_fmt=png&from=appmsg)

这就是封装事件类自定义 hook 的第三种方式。

其实这三种方式用的都很多。

第一种传入 React Element 通过 cloneElement 给它添加事件处理函数。

这个是 react-use 的 hook：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGgWXiaeoUTQBVic9wwDlvbgM5903ia4lqgUl0SiaIS4jEVKvhJRgjHfUx42hwuIul5HFIkdCrFpLqpjlw/640?wx_fmt=png&from=appmsg)

react-use 是非常流行的通用 hook 库，下载量是 ahooks 的十倍：

ahooks：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGgWXiaeoUTQBVic9wwDlvbgM5t2yyROPcFCeicmK9IghR7pFedIb22eBvXcDvYnlEgJzscTgdsDZLl2w/640?wx_fmt=png&from=appmsg)

react-use：![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGgWXiaeoUTQBVic9wwDlvbgM5aibXyv0pt3II4lDbuVibB5N5IQfbbz5JwNEK3jObYUibELANicXyQW0iaVA/640?wx_fmt=png&from=appmsg)

第二种传入 ref 然后 addEventListener 绑定事件。

这个也是 react-use 的 hook：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGgWXiaeoUTQBVic9wwDlvbgM5Re5SS0hn3rKbhBYqXuZRo9rqdph7HKwJgJlOCZZvkYQY7VdIQAQFYQ/640?wx_fmt=png&from=appmsg)

第三种方式返回事件处理函数，让调用者自己绑定。

比如 @floating-ui/react 包的 useInteractions，就是返回 props 对象，类似 {onClick: xxx} 这种，让调用者自己绑定：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGgWXiaeoUTQBVic9wwDlvbgM5WlVL7wmcMDY75KCPH69JpicFReqmOKlJIeKg46pmUjGcp6I3RjmaW5Q/640?wx_fmt=png&from=appmsg)

这三种自定义 hook 的绑定事件写法，你会选择哪一种？