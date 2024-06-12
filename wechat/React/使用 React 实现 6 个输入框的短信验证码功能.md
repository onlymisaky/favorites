> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/utl_izmuiWh0nEJ6c4Wv-g)

![图片](https://mmbiz.qpic.cn/mmbiz_jpg/b77xA98980HC8X81RYX3CB8lwQkkGsQjhL4OiaohwfcYxAGTzWlyCLIn1NTZgpxOYTIQyPicJheia23ug4zYq92UA/640?wx_fmt=jpeg)

如何使用 React 实现 6 个输入框的短信验证码功能

在移动端中，经常会有下图中的交互方式，供用户输入短信验证码。

![](https://mmbiz.qpic.cn/mmbiz_png/b77xA98980EvPfos6aLXCUSoA4tV3GsbdQ858AfiaXOmZBRiaACzaO1US8sia07HicIoJmXOJltA7jk4XRs7ibwiceMg/640?wx_fmt=png&from=appmsg)短信验证码输入

目前比较主流的两种实现方案：

1.  每个单独的验证码，占据一个输入框；
    
2.  灰色框框仅仅是展示，外层再盖上透明的输入框；
    

我们分别来说他们的优缺点和实现方式。

1. 每个数字单独占用一个输入框
----------------

按照真实个数的输入框来实现，输入框的最大长度设置为 1，然后监听所有的输入框，当输入框中有值时，若当前输入框是最后一个，则触发验证码的校验；若不是最后一个，则把光标移动到下一个输入框。

但这里存在着一个严重的问题：有的操作系统（如 iOS 等），可以帮助自动填充验证码，即便我们限制了输入框的长度，也会把所有验证码都填充到第一个输入框中。

我代码的实现：

```
const App = () => {  const list = new Array(6).fill(0); // 初始数组，用来循环生成输入框  const inputRef = useRef<InputRef[]>([]); // 获取所有的输入框的dom实例  /**   * 每个输入框中的数据变化时   * @param {string} value 当前输入框中的数据   * @param {number} curIndex 当前是第几个输入框   */  const handleChange = (value: string, curIndex: number) => {    if (value) {      if (curIndex < list.length - 1) {        // 若当前输入框不是最后一个，则让下一个输入框获取到焦点        inputRef.current[curIndex + 1].focus();      } else {        // 若当前输入框是最后一个，则拼接输入框中所有的验证码，然后进行验证        let captcha = "";        inputRef.current.forEach((item) => {          captcha += item.nativeElement?.value || "";        });        onSuccess({ ...data, captcha });      }    }  };  /**   * 监听键盘按下的事件，若是删除键，则删除验证码，同时光标回退   */  const handleKeyDown = (event: any, curIndex: number) => {    const BACK_SPACE_CODE = 8; // 回退删除键    if (event.keyCode !== BACK_SPACE_CODE) {      // 这里只处理删除操作，若按键不是删除键，则不处理，直接返回      return;    }    const hasValue = inputRef.current[curIndex].nativeElement?.value;    if (!hasValue && curIndex) {      // 若有数据，则删除数据，若没有数据，则回退光标      inputRef.current[curIndex - 1].focus();    }  };  return (    <div class>      {list.map((item) => (        <Input          key={item}          type="tel"          ref={(input) => {            if (input && inputRef.current.length < list.length) {              inputRef.current.push(input);            }          }}          disabled={loading}          maxLength={1}          onChange={(value) => handleChange(value, item)}          onKeyDown={(event) => handleKeyDown(event, item)}        />      ))}    </div>  );};
```

在实际使用中，体验极度不友好，因此就放弃了这种方式。

2. 透明输入框
--------

6 个灰色的框框仅用来展示使用，然后在这上面放一个透明的输入框用来进行输入。

但这里依然有一个体验上的问题，就是不能随意地切换光标。比如我中间有个验证码输错了，想只修改该数字，目前是不可以的，只能先删除后面的，然后再重新输入。

相比第一个方案的实现，目前光标无法随意切换的体验，相对来说还能接受这种方案。

具体光标在哪个灰框框中闪烁，则依据已输入验证码的长度。

```
const App = () => {  const CAPTCHA_DEFAULT_LENGTH = 6; // 验证码的个数  const list = new Array(CAPTCHA_DEFAULT_LENGTH).fill(1);  const inputRef = (useRef < InputRef) | (null > null);  const [inputActive, setInputActive] = useState(false); // 透明的验证码输入框是否获得焦点  // 每个输入框中的数据变化时  const handleChange = (value: string) => {    setCaptcha(value);    if (value.length >= CAPTCHA_DEFAULT_LENGTH) {      // 验证码达到约定长度时，校验验证码      onSuccess({ ...data, captcha: value });    }  };  return (    <div class>        {list.map((_, index) => (          <p            key={index}            className={classNames("input", {              // 当光标在输入框中，让当前正在输入的输入框的光标闪烁              active: index === Math.min(captcha.length, CAPTCHA_DEFAULT_LENGTH - 1) && inputActive,            })}          >            {captcha[index] || ""}          </p>        ))}      </div>      <Input        type="tel"        ref={inputRef}        maxLength={CAPTCHA_DEFAULT_LENGTH}        onChange={handleChange}        onFocus={() => setInputActive(true)}        onBlur={() => setInputActive(false)}      />    </div>  );};
```

3. 总结
-----

没有完美的方案，只能在某些方面做一些取舍。

![](https://mmbiz.qpic.cn/mmbiz_png/YBFV3Da0Nwt7qqUywpNb0He4PpaGj3yfOA9oevy0kdQdJCFd1WibyibnZAdiaOgsycXHrAGUPoEZYU8OueicPkn2KQ/640?wx_fmt=png)

[盘点那些让前端抓狂的后端行为](http://mp.weixin.qq.com/s?__biz=MzA5ODM5NTYyMA==&mid=2653285641&idx=1&sn=145c9b14ca8f6b6d28a203d40485e464&chksm=8b437982bc34f0945e0c3eb11c968c0b24ddf7b99224065a63db4c24b304accb82a91f67d1ce&scene=21#wechat_redirect)  

[反驳那些要实时刷新页面的前端部署方案](http://mp.weixin.qq.com/s?__biz=MzA5ODM5NTYyMA==&mid=2653285629&idx=1&sn=baebf1a399f6e6e802b4d19fbe871c43&chksm=8b437876bc34f16070d6701b429258f63a0f256dc2a83f2b4b166d502d6d0c2bb816a4c00448&scene=21#wechat_redirect)  

[JSON stringify 的一些不常见使用](http://mp.weixin.qq.com/s?__biz=MzA5ODM5NTYyMA==&mid=2653285616&idx=1&sn=13ff09f7e266677925e66c4c49c9bf47&chksm=8b43787bbc34f16d00160af68a53a3d78e5cd5f633c242848cbb061060543ef0feb136c49af9&scene=21#wechat_redirect)  

![](https://mmbiz.qpic.cn/mmbiz_jpg/YBFV3Da0Nwt7qqUywpNb0He4PpaGj3yf529Acb1YkfG4Qd7ibPI86cFsibe9xbaVPMsrFOicZniabLMocx5EOC1LRQ/640?wx_fmt=jpeg)

▼我是来一名小小的前端开发工程师，

长按识别二维码关注，与大家共同学习▼  

![](https://mmbiz.qpic.cn/mmbiz_png/b77xA98980FhicYXcqe4JKmNQX3IibTo2grYBrUjFDr754PDwjYc8MrhqYibqXiap2GQKIsaoSE4rJjawIa5GFiaW2Q/640?wx_fmt=png)