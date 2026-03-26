> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/Ofzmok4bStGdsqmLv-lThg)

```
大厂技术  高级前端  Node进阶

点击上方 程序员成长指北，关注公众号

回复1，加入高级Node交流群

```

本文你能学到
------

1.  优雅的 `Storage` 工具类如何封装(支持前缀key、加密存储、过期时间，ts封装等)
    
2.  `localStorage` 真实存储大小/存储统计
    
3.  `localStorage` 如何监听
    
4.  `localStorage` 同源问题与同源窗口通信
    

前言
--

`localStorage` 使用是一个老生常谈的话题，本文不讲解基础 `api`，主要教你如何封装一个优雅的`localStorage` 工具，以及一些 `localStorage`中一些你不知道的知识点。

优雅的 Storage 工具如何封装(前缀、加密、过期时间等)
-------------------------------

该工具函数设计

1.  采用工厂方法+闭包设计模式，不直接实例化类，而是根据传入的参数来配置和返回一个 `SmartStorage` 的实例。
    
2.  支持带前缀的键：通过 `prefixKey` 参数可以为存储的键名添加一个前缀，默认为空字符串。这个功能可以帮助避免键名冲突，特别是当在同一个域下的不同应用或组件中使用同一种存储方式时。
    
3.  支持过期时间：在存储数据时，可以为每项数据设置一个过期时间（单位为秒），存储的数据结构中会包括实际的值、存储时间戳以及过期时间戳。在读取数据时，会检查数据是否过期，如果已经过期，则自动删除
    
4.  支持加密存储：存储数据时根据参数配置可先进行加密，读取数据时再解密，加密使用的 `crypto` 模块
    
5.  错误处理：在读取数据时，如果解密过程出错或数据格式不正确，会捕获异常并返回默认值，这提高了程序的健壮性。
    
6.  支持常用的 `api`（`set get remove clear`）
    
7.  `TypeScript` 实现
    

接下来是代码实现：在未进行代码实现前可以基于上面的设计自己实现一下，然后对照下我的代码实现

```
/**  
 * 封装一个local  
 */  
import { decrypt as aesDecrypt, encrypt as aesEncrypt } from 'crypto-js/aes';  
import UTF8, { parse } from 'crypto-js/enc-utf8';  
import pkcs7 from 'crypto-js/pad-pkcs7';  
import CTR from 'crypto-js/mode-ctr';  
import {isNil} from 'lodash';  
  
  
interface EncryptionParams {  
    key: string;  
    iv: string;  
}  
  
export interface Encryption {  
    encrypt(plainText: string): string;  
    decrypt(cipherText: string): string;  
}  
  
/**  
 * 加密类简单实现  
 */  
class AesEncryption implements Encryption {  
    private readonly key;  
    private readonly iv;  
  
    constructor({ key, iv }: EncryptionParams) {  
        this.key = parse(key);  
        this.iv = parse(iv);  
    }  
  
    get getOptions() {  
        return {  
            mode: CTR, // 加密部分不赘余，自行搜索参数学习  
            padding: pkcs7, // 加密部分不赘余，自行搜索参数学习  
            iv: this.iv,  
        };  
    }  
  
    encrypt(plainText: string) {  
        return aesEncrypt(plainText, this.key, this.getOptions).toString();  
    }  
  
    decrypt(cipherText: string) {  
        return aesDecrypt(cipherText, this.key, this.getOptions).toString(UTF8);  
    }  
}  
  
  
export interface CreateSmartStorageParams extends EncryptionParams {  
    prefixKey: string;  
    storage: Storage;  
    hasEncrypt: boolean;  
    timeout?: number;  
}  
/**  
 * localStorage工厂方法实现  
 * @param param0   
 * @returns   
 */  
export const createSmartStorage = ({  
    prefixKey = '',  
    storage = localStorage, // 这里其实也可以支持sessionStorage，自行配置  
    key = cacheConfig.key, // 修改为自己项目cacheConfig中的key  
    iv = cacheConfig.iv, // 修改为自己项目cacheConfig中的iv  
    timeout = null,  
    hasEncrypt = true,  
}: Partial<CreateSmartStorageParams> = {}) => {  
    if (hasEncrypt && [key.length, iv.length].some((item) => item !== 16)) {  
        throw new Error('When hasEncrypt is true, the key or iv must be 16 bits!');  
    }  
    //   
    const persistEncryption: Encryption = new AesEncryption({  
        key: cacheConfig.key,// 修改为自己项目cacheConfig中的key  
        iv: cacheConfig.iv,// 修改为自己项目cacheConfig中的iv  
    })  
    /**  
     * Cache class  
     * Construction parameters can be passed intolocalStorage,  
     * @class Cache  
     * @example  
     */  
    const SmartStorage = class SmartStorage {  
        private storage: Storage;  
        private prefixKey?: string;  
        private encryption: Encryption;  
        private hasEncrypt: boolean;  
        /**  
         *  
         * @param {*} storage  
         */  
        constructor() {  
            this.storage = storage;  
            this.prefixKey = prefixKey;  
            this.encryption = persistEncryption;  
            this.hasEncrypt = hasEncrypt;  
        }  
  
        private getKey(key: string) {  
            return `${this.prefixKey}${key}`.toUpperCase();  
        }  
  
        /**  
         * Set cache  
         * @param {string} key  
         * @param {*} value  
         * @param {*} expire Expiration time in seconds  
         * @memberof Cache  
         */  
        set(key: string, value: any, expire: number | null = timeout) {  
            const stringData = JSON.stringify({  
                value,  
                time: Date.now(),  
                expire: !isNil(expire) ? new Date().getTime() + expire * 1000 : null,  
            });  
            const stringifyValue = this.hasEncrypt ? this.encryption.encrypt(stringData) : stringData;  
            this.storage.setItem(this.getKey(key), stringifyValue);  
        }  
  
        /**  
         * Read cache  
         * @param {string} key  
         * @param {*} def  
         * @memberof Cache  
         */  
        get(key: string, def: any = null): any {  
            const val = this.storage.getItem(this.getKey(key));  
            if (!val) return def;  
  
            try {  
                const decVal = this.hasEncrypt ? this.encryption.decrypt(val) : val;  
                const data = JSON.parse(decVal);  
                const { value, expire } = data;  
                if (isNil(expire) || expire >= new Date().getTime()) {  
                    return value;  
                }  
                this.remove(key);  
            } catch (e) {  
                return def;  
            }  
        }  
  
        /**  
         * Delete cache based on key  
         * @param {string} key  
         * @memberof Cache  
         */  
        remove(key: string) {  
            this.storage.removeItem(this.getKey(key));  
        }  
  
        /**  
         * Delete all caches of this instance  
         */  
        clear(): void {  
            this.storage.clear();  
        }  
    };  
    return new SmartStorage();  
}; 
```

再补充几个 `localStorage` 相关可能你不知道的知识点。

localStorage 存储大小
-----------------

1.  `localStorage` 的存储空间是 `5M`，但是单位是字符串的长度值, 或者 `utf-16` 的编码单元，也可以说是 `10M` 字节空间。
    
2.  `localStorage` 的 `key` 键也是占存储空间的。
    
3.  `localStorage` 如何统计已使用空间
    

```
function sieOfLS() {  
    return Object.entries(localStorage).map(v => v.join('')).join('').length;  
}  

```

> 这个函数也可以加到storage工具函数中

```
localStorage.clear();  
localStorage.setItem("🌞", 1);  
localStorage.setItem("🌞🌞🌞🌞", 1111);  
console.log("size:", sieOfLS())   // 15  
// 🌞*5 + 1 *5 = 2*5 + 1*5 = 15  

```

localStorage 如何监听
-----------------

1.  原生 `api` 监听
    

```
window.addEventListener('storage', () => {  
  // callback  
})  

```

每次 `localStorage` 中有任何变动都会触发一个 `storage` 事件，即使是同域下的不同页面A、B都会监听这个事件，一旦有窗口更新 `localStorage`，其他窗口都会收到通知。

2.  基于我们前面封装的 `localStorage` 工具类 在封装后每一个函数内部可以进行监听，同时如果想要统计监听一些内容，可以给一些函数增加 `aop` 装饰器来完成。
    

```
@aop  
set(key: string, value: any, expire: number | null = timeout) {  
            const stringData = JSON.stringify({  
                value,  
                time: Date.now(),  
                expire: !isNil(expire) ? new Date().getTime() + expire * 1000 : null,  
            });  
            const stringifyValue = this.hasEncrypt ? this.encryption.encrypt(stringData) : stringData;  
            this.storage.setItem(this.getKey(key), stringifyValue);  
        }  

```

具体 `aop` 装饰器相关内容可以看我另一篇文章，本文只讲解 `localStorage`

localStorage 同源
---------------

只有来自同一个源的网页才能访问相同的 `localStorage` 对应 `key` 的数据，这也是前面工具类封装，这个参数 `prefixKey` 的作用，同源项目可以加一个唯一 `key`，保证同源下的 `localStorage` 不冲突。

这是一个需要避免的问题，有时候也会基于这些实现一些功能，比如下面的同源窗口通信

### 同源窗口通信

我们就可以只有一个窗口与后台建立连接，收到更新后，广播给其他窗口就可以。想象这样一个场景：当`localStorage` 中的数据发生变化时，浏览器会触发一个 `storage` 事件，这个事件能够被同一源下所有的窗口监听到。这意味着，如果一个窗口更新了 `localStorage` ，其他窗口可以实时接收到这一变动的通知。虽然这个机制的原理相对简单——基于事件的广播，但是要搭建一个功能完备的跨窗口通信机制，则需要考虑更多的细节和挑战。

1.  每个窗口都需要有一个独一无二的标识符`（ID）`，以便在众多窗口中准确识别和管理它们。
    
2.  为了避免同一个消息被重复处理，必须有机制确保消息的唯一性。
    
3.  还需要确保只有那些真正需要接收特定消息的窗口才会收到通知，这就要求消息分发机制能够有效地过滤掉不相关的窗口。
    
4.  考虑到窗口可能会因为各种原因关闭或变得不响应，引入窗口的“心跳”机制来监控它们的活跃状态变得尤为重要。
    
5.  当涉及到需要从多个窗口中选举出一个主窗口来协调操作时，主窗口的选举机制也是不可或缺的一环。
    

尽管这些要求听起来可能令人望而却步，不过开源社区已经提供了一些优秀的解决方案来简化这个过程。例如，`diy/intercom`.js和`tejacques/crosstab` 这两个库就是专门为了解决跨窗口通信而设计的。感兴趣的学习下

### 扩展知识 同源策略

*   协议相同：网页地址的协议必须相同。例如，`http://example.com` 和 `https://example.com` 被视为不同的源，因此如果一个页面是通过 `HTTP` 加载的，它不能访问通过HTTPS加载的页面的 `LocalStorage` 数据，反之亦然。
    
*   域名相同：网页的域名必须完全相同。子域与主域也被视为不同的源（例如，`sub.example.com`与 `example.com` ），默认情况下，它们无法共享 `LocalStorage` 数据。
    
*     
    
*   端口相同：即使协议和域名相同，端口号的不同也会使它们成为不同的源。例如，`http://example.com:80` 和 `http://example.com:8080` 是不同的源。
    

总结
--

相信学习完本文你对 `LocalStorage`有一个彻底的掌握，创作不易欢迎三连支持。

### 最后  

Node 社群

```


  

  

我组建了一个氛围特别好的 Node.js 社群，里面有很多 Node.js小伙伴，如果你对Node.js学习感兴趣的话（后续有计划也可以），我们可以一起进行Node.js相关的交流、学习、共建。下方加 考拉 好友回复「Node」即可。

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

```


   “分享、点赞、在看” 支持一下


```


```