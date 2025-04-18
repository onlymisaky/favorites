> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/ZkCA-FLwDCHuI_zUpWhdDg)

```
点击上方 程序员成长指北，关注公众号

回复1，加入高级Node交流群

```

> 静态注册 (register) vs 异步注册 (registerAsync)

1.1 主要区别
--------

静态注册 (`register`) 和异步注册 (`registerAsync`) 的主要区别在于配置的获取方式和时机：

*   **静态注册 (register)**
    

*   适用于静态配置
    
*   配置必须在模块注册时提供
    
*   不依赖其他服务
    
*   配置立即可用
    

*   **异步注册 (registerAsync)**
    

*   适用于动态配置
    
*   可以注入其他服务来获取配置
    
*   支持异步操作
    
*   配置可以来自环境变量、远程配置等
    

1.2 使用场景
--------

#### 静态注册示例

```
@Module({
  imports: [
    RedisModule.register({
      redis: {
        name: 'myRedis',
        host: 'localhost',
        port: 6379
      }
    })
  ]
})


```

### 异步注册示例

```
@Module({
  imports: [
    ConfigModule.forRoot(),
    RedisModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const config = await loadRemoteConfig();
        return {
          redis: {
            name: configService.get('REDIS_NAME'),
            host: configService.get('REDIS_HOST'),
            port: configService.get('REDIS_PORT')
          }
        };
      }
    })
  ]
})


```

1.3 执行时机
--------

#### 静态注册的执行时机

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YBFV3Da0NwubRZRfhJ3ib2icPW9UwKtlWD3cqiaDyTVwqiaTMcs7MtCgQcib7kqbtOk9mFCAo03qsmtEf5Ax4ISfkGw/640?wx_fmt=png&from=appmsg)

1.  创建模块实例
    
2.  执行 `register` 方法
    
3.  立即创建 `providers`（RedisManager, RedisService 等）
    
4.  模块初始化完成
    

### 异步注册的执行时机

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YBFV3Da0NwubRZRfhJ3ib2icPW9UwKtlWDcNuU2bUp8abMriaY09OXia9dhw7JtfygThJ1h7vpcKKeOPMH2AbhZx9A/640?wx_fmt=png&from=appmsg)

1.  创建模块实例
    
2.  等待注入的依赖初始化完成（如 ConfigService）
    
3.  执行 `useFactory` 函数
    
4.  等待异步配置获取完成
    
5.  创建 `providers`
    
6.  模块初始化完成
    

1.4 关键区别
--------

1.  **配置获取方式**
    

*   静态注册：配置立即可用
    
*   异步注册：等待异步操作完成
    

3.  **依赖处理**
    

*   静态注册：不依赖其他服务
    
*   异步注册：可以依赖其他模块和服务
    

5.  **初始化顺序**
    

*   静态注册：同步执行
    
*   异步注册：等待依赖准备就绪
    

7.  **应用启动**
    

*   静态注册：立即完成
    
*   异步注册：等待异步配置加载完成
    

### 1.5 选择建议

*   使用静态注册的情况：
    

*   配置是静态的，不需要从外部获取
    
*   不依赖其他服务
    
*   配置立即可用
    

*   使用异步注册的情况：
    

*   需要从环境变量获取配置
    
*   需要从远程配置中心获取配置
    
*   依赖其他服务来获取配置
    
*   配置需要异步加载
    

### 1.6 注意事项

1.  `NestJS` 会确保模块的初始化顺序是正确的，不会出现依赖未准备好的情况
    
2.  异步注册会等待所有异步操作完成才会完成模块的初始化
    
3.  在异步注册中，整个应用的启动会等待异步配置加载完成
    
4.  建议根据实际需求选择合适的注册方式，避免不必要的复杂性
    
      
    

Node 社群

```
我组建了一个氛围特别好的 Node.js 社群，里面有很多 Node.js小伙伴，如果你对Node.js学习感兴趣的话（后续有计划也可以），我们可以一起进行Node.js相关的交流、学习、共建。下方加 考拉 好友回复「Node」即可。

   “分享、点赞、在看” 支持一波👍

```