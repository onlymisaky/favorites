> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/Ebv9Pihpv7MXY1AGtuYPNQ)

```
点击上方 程序员成长指北，关注公众号

回复1，加入高级Node交流群

```

在使用 NestJs 结合 Redis 实现签到功能时，可以利用 Redis 的不同数据结构和特性来满足不同的业务需求。

  
bitmap  

============

在 NestJs 中结合 Redis 使用 bitmap 实现签到功能有许多优势，特别是在处理大规模数据和高频访问时。以下是使用 bitmap 进行签到系统实现的一些主要好处：

1.  空间效率：Bitmap 是一种极其空间效率高的数据结构，因为它只用一个位（bit）来表示每个数据点的存在与否（即 0 或 1）。对于签到系统，如果采用传统的数据结构（如列表或集合）存储用户的签到记录，每个记录可能需要使用多个字节。而使用 bitmap，每个用户的每天签到只占用一个位，大大节省了存储空间。
    
2.  易于实现连续签到和统计：使用 bitmap，实现如连续签到天数的统计变得简单高效。通过直接分析位的连续模式，可以快速计算出用户连续签到的天数。此外，BITCOUNT 命令可以方便地统计在特定时间段内用户签到的天数，这些操作都是在服务器端完成，减少了网络传输和应用层计算的负担。
    

```
import { Injectable, Inject, OnModuleDestroy } from"@nestjs/common";
import Redis, { ClientContext, Result } from"ioredis";

@Injectable()
exportclass RedisService implements OnModuleDestroy {
constructor(@Inject("REDIS_CLIENT") private readonly redisClient: Redis) {}

  onModuleDestroy(): void {
    this.redisClient.disconnect();
  }

async signIn(userId: string): Promise<string> {
    const today = newDate();
    const year = today.getFullYear();
    const startOfYear = newDate(year, 0, 0);
    const dayOfYear = Math.floor(
      (today.getTime() - startOfYear.getTime()) / 86400000
    );

    const key = `user:signin:${year}:${userId}`;

    try {
      // 先检查是否已签到
      const wasSignedIn = awaitthis.redisClient.getbit(key, dayOfYear);
      if (wasSignedIn === 1) {
        return"今天已经签到过了";
      } else {
        // 进行签到操作
        awaitthis.redisClient.setbit(key, dayOfYear, 1);
        return"签到成功";
      }
    } catch (error) {
      console.error("签到过程中出现错误:", error);
      thrownewError("签到功能出现异常");
    }
  }
}


```

通过使用 bitmap，我们可以非常高效地管理每个用户的签到记录。每个用户的签到数据都压缩在一个很小的空间内，而且我们可以非常快速地查询和更新这些数据。

这种方法尤其适合有大量用户和高频操作的系统，比如每天都需要处理成千上万用户签到的应用。这种方法也便于扩展，因为 Redis 的高性能和低资源需求使得即使是在负载非常高的情况下，它仍然能够提供良好的响应速度。

但是 Bitmaps 本质上是一个非结构化的数据存储格式。每个位只能表示是或否（0 或 1），它不提供更多关于数据的上下文或其他属性信息，比如具体的时间戳或附加的用户数据。

在实际应用中，特别是涉及时区和跨年数据时，处理时间和日期计算可能会相对复杂。确保每个用户的签到信息正确对应到正确的日期上，需要仔细设计日期到位索引的映射逻辑。

  
hashes  

============

如果我们需要记录用户的具体打卡时间，而不仅仅是签到状态，您可以考虑结合使用 Redis 的其他数据结构，如哈希表（hashes）或有序集合（sorted sets）。这些结构可以帮助您存储额外的信息，比如打卡的具体时间点。

使用 hash 表我们可以为每个用户使用一个哈希表来存储每天的签到时间。哈希表的键可以是日期，值可以是打卡时间。

```
import { Injectable, Inject, OnModuleDestroy } from"@nestjs/common";
import Redis, { ClientContext, Result } from"ioredis";

@Injectable()
exportclass RedisService implements OnModuleDestroy {
constructor(@Inject("REDIS_CLIENT") private readonly redisClient: Redis) {}

  onModuleDestroy(): void {
    this.redisClient.disconnect();
  }

async signIn(userId: string): Promise<string> {
    const today = newDate();
    const dateKey = today.toISOString().slice(0, 10); // 格式为 YYYY-MM-DD

    const key = `user:signin:${userId}`;
    const currentTime = today.toISOString();

    // 尝试获取今天的签到记录
    const alreadySignedIn = awaitthis.redisClient.hget(key, dateKey);
    if (alreadySignedIn) {
      return`今天已经签到过了，签到时间为 ${alreadySignedIn}`;
    } else {
      // 记录签到时间
      awaitthis.redisClient.hset(key, dateKey, currentTime);
      return`签到成功，签到时间为 ${currentTime}`;
    }
  }
}


```

哈希表允许你以键值对的形式存储结构化数据。在签到系统中，这意味着每个用户可以有一个哈希表，其键可以是日期，值可以是签到的详细信息（如签到时间、积分获得等）。

与 bitmap 相比，哈希表提供了更高的灵活性。你可以轻松添加额外的数据，比如签到的确切时间或附加的用户备注。如果需要更新用户的签到记录或添加新的数据字段，哈希表可以轻松处理。

  
sorted sets  

=================

如果除了记录打卡时间，还需要按时间顺序访问签到记录，可以使用有序集合。在这种情况下，每个打卡时间点可以用时间戳作为分数（score），这样您就可以快速检索出某个时间段内的所有签到事件。

```
import { Injectable, Inject, OnModuleDestroy } from"@nestjs/common";
import Redis, { ClientContext, Result } from"ioredis";

@Injectable()
exportclass RedisService implements OnModuleDestroy {
constructor(@Inject("REDIS_CLIENT") private readonly redisClient: Redis) {}

  onModuleDestroy(): void {
    this.redisClient.disconnect();
  }

async signIn(userId: string): Promise<string> {
    const now = newDate();
    const today = now.toISOString().slice(0, 10); // YYYY-MM-DD 格式
    const timestamp = now.getTime();
    const key = `user:signin:${userId}`;

    // 防止同一天重复签到
    if (awaitthis.hasSignedIn(userId, today)) {
      return"今天您已经签到过了";
    }

    // 添加当前时间戳为分数的记录到有序集合，以日期为成员
    awaitthis.redisClient.zadd(key, timestamp, today);
    return`签到成功，时间为 ${now.toISOString()}`;
  }

// 检查是否已在特定日期签到
async hasSignedIn(userId: string, date: string): Promise<boolean> {
    const key = `user:signin:${userId}`;
    const startOfDay = newDate(date).getTime();
    const endOfDay = startOfDay + 86400000 - 1; // 一天的毫秒数

    // 获取特定日期范围内的分数，如果存在，则表示已签到
    const results = awaitthis.redisClient.zrangebyscore(
      key,
      startOfDay,
      endOfDay
    );
    return results.length > 0;
  }

// 获取用户的签到历史
async getSignInHistory(userId: string): Promise<string[]> {
    const key = `user:signin:${userId}`;
    returnawaitthis.redisClient.zrange(key, 0, -1);
  }
}


```

除了基本的签到之外，有序集合我们还可以对前几的用户进行不同的积分添加。

  
GEO  

=========

如果需要在签到系统中添加定位信息，以便记录用户的签到位置，您可以进一步扩展之前的数据结构来存储相关的地理位置数据。在 Redis 中，您可以使用地理空间索引（geo index），这是一种特别为存储地理位置信息和进行地理空间查询设计的数据结构。Redis 提供了 GEOADD, GEORADIUS, GEOPOS 等命令来处理地理位置数据。

我们将使用 Redis 的 GEOADD 命令来添加用户的签到位置。每次用户签到时，我们不仅记录时间，还记录其地理坐标。

```
import { Injectable, Inject, OnModuleDestroy } from"@nestjs/common";
import Redis, { ClientContext, Result } from"ioredis";

@Injectable()
exportclass RedisService implements OnModuleDestroy {
constructor(@Inject("REDIS_CLIENT") private readonly redisClient: Redis) {}

  onModuleDestroy(): void {
    this.redisClient.disconnect();
  }

async signIn(
    userId: string,
    latitude: number,
    longitude: number
  ): Promise<string> {
    const now = newDate();
    const isoDate = now.toISOString();
    const timestamp = now.getTime();
    const key = `user:signin:timestamps:${userId}`;
    const geoKey = `user:signin:geo:${userId}`;

    // 检查是否已经签到（可选）
    const lastSignInTime = awaitthis.redisClient.zscore(key, isoDate);
    if (
      lastSignInTime &&
      newDate(parseInt(lastSignInTime)).toISOString().slice(0, 10) ===
        isoDate.slice(0, 10)
    ) {
      return"今天您已经签到过了";
    }

    try {
      // 使用 MULTI 命令来保证原子性
      const transaction = this.redisClient.multi();
      transaction.zadd(key, timestamp.toString(), isoDate);
      transaction.geoadd(geoKey, longitude, latitude, isoDate);
      await transaction.exec();

      return`签到成功，时间为 ${isoDate}，位置为 (${latitude}, ${longitude})`;
    } catch (error) {
      console.error("签到失败:", error);
      return"签到失败，请稍后重试";
    }
  }
}


```

如果您想找出特定范围内的签到记录，可以使用 GEORADIUS 或 GEORADIUSBYMEMBER 命令。这些命令可以基于地理位置索引进行查询，返回距离某个点一定范围内的所有键。

```
async function findSignInsNearby(userId: string, radius: number): Promise<any> {
const geoKey = `user:signin:geo:${userId}`;
// 查询指定半径内的所有签到位置
returnawaitthis.redisClient.georadius(
    geoKey,
    longitude,
    latitude,
    radius,
    "km",
    { WITHCOORD: true, WITHDIST: true }
  );
}


```

通过使用 Redis 的地理空间支持，我们不仅可以存储用户的签到时间，还能记录他们的地理位置。这对于需要验证签到地点或实现基于位置的服务非常有用。此外，Redis 提供的地理空间查询功能使您能够轻松实现如查找附近的签到点等复杂的地理空间数据分析。

  
总结  

========

在基于 Redis 实现签到功能的时候，我们可以根据不同的需求来实现使用 Redis 中不同的方法来实现我们想要的功能。

Node 社群

```
我组建了一个氛围特别好的 Node.js 社群，里面有很多 Node.js小伙伴，如果你对Node.js学习感兴趣的话（后续有计划也可以），我们可以一起进行Node.js相关的交流、学习、共建。下方加 考拉 好友回复「Node」即可。

   “分享、点赞、在看” 支持一波👍

```