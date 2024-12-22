> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/txSuL_gVKjSbwMO55PEhvw)

```
点击上方 程序员成长指北，关注公众号

回复1，加入高级Node交流群

```

> 原文链接: https://juejin.cn/post/7436218509947469876
> 
> 作者：moment

最近一直在用 NestJs 开发一个企业级的商业化项目，对于要上线的项目，那必然就少不了性能监控了。了解这些指标对我们开发调优的时候至关重要。

服务器的性能瓶颈通常为以下几个：

1.  CPU 使用率
    
2.  CPU 负载 (load)
    
3.  内存
    
4.  磁盘
    
5.  I/O
    
6.  吞吐量 （Throughput）
    
7.  每秒查询率 QPS（Query Per Second）
    
8.  日志监控 / 真实 QPS
    
9.  响应时间
    
10.  进程监控
    

CPU 使用率
-------

CPU 使用率是一个衡量计算机中央处理单元（CPU）在给定时间内有多忙碌的指标。它表示在 CPU 能够使用的时间里，CPU 实际上被使用的时间百分比。简单来说，CPU 使用率反映了计算机的处理能力被消耗的程度。

1.  100% CPU 使用率意味着 CPU 在该时刻完全处于工作状态，没有闲置。
    
2.  0% CPU 使用率意味着 CPU 完全空闲，没有任何任务在运行。
    

CPU 使用率通常是通过以下方式计算的：

1.  用户态（User Time）：CPU 执行用户级程序的时间。
    
2.  系统态（System Time）：CPU 执行内核操作的时间。
    
3.  空闲态（Idle Time）：CPU 没有执行任何任务的时间。
    
4.  中断时间（IRQ Time）：处理硬件中断的时间。
    

CPU 使用率的计算公式一般是：

```
CPU 使用率 = (总时间 - 空闲时间) / 总时间 * 100%


```

其中, 总时间是从上次采样以来的 CPU 总时间，空闲时间是从上次采样以来的 CPU 空闲时间。

Node.js 提供了 os 模块来获取操作系统的相关信息，包括 CPU 使用情况。虽然 os 模块本身没有直接提供获取 CPU 使用率的 API，但我们可以通过 os.cpus() 获取每个 CPU 核心的详细信息，并通过计算差值来获取 CPU 使用率。

os.cpus() 返回一个包含 CPU 核心信息的数组，每个元素代表一个 CPU 核心的信息，包含以下字段：

*   model: CPU 型号
    
*   speed: CPU 频率
    
*   times: 各个时间段的时间信息，包括：
    

*   user: 用户态时间
    
*   nice: 用户态下的优先级调整时间
    
*   sys: 系统态时间
    
*   idle: 空闲时间
    
*   irq: 中断时间
    

通过采样 CPU 的 times 数据，首先记录当前的 CPU 状态信息，然后等待一段时间后再次记录。在这两个时间点之间，计算每个核心的 idle 和 total 时间差，再根据差值推算出每个核心的 CPU 使用率。

如下代码所示：

```
const os = require("os");

// 获取 CPU 使用率的函数
function getCpuUsage() {
  return new Promise((resolve, reject) => {
    const startCpuInfo = os.cpus(); // 获取初始的 CPU 信息

    setTimeout(() => {
      const endCpuInfo = os.cpus(); // 获取采样后的 CPU 信息

      // 计算各个核心的使用率
      const cpuUsage = endCpuInfo.map((endCore, index) => {
        const startCore = startCpuInfo[index];

        // 计算起始和结束的时间差
        const startTotal = Object.values(startCore.times).reduce(
          (a, b) => a + b,
          0
        );
        const endTotal = Object.values(endCore.times).reduce(
          (a, b) => a + b,
          0
        );

        const idleDiff = endCore.times.idle - startCore.times.idle;
        const totalDiff = endTotal - startTotal;

        const usage = (1 - idleDiff / totalDiff) * 100;
        return {
          core: index,
          usage: usage.toFixed(2), // 保留两位小数
        };
      });

      resolve(cpuUsage);
    }, 100); // 延迟 100ms
  });
}

// 调用获取 CPU 使用率的函数
getCpuUsage()
  .then((cpuUsage) => {
    console.log("CPU 使用率:");
    cpuUsage.forEach((core) => {
      console.log(`核心 ${core.core} 使用率: ${core.usage}%`);
    });
  })
  .catch((err) => {
    console.error("获取 CPU 使用率失败:", err);
  });


```

在上面的这些代码中，首先，使用 os.cpus() 获取当前系统每个 CPU 核心的状态信息，记录下每个核心的 idle 和 total 时间。然后，等待 100 毫秒后，再次调用 os.cpus() 获取第二次的 CPU 状态数据。接下来，通过对比两次数据，计算每个核心的 idle 和 total 时间差。使用时间差来推算每个核心的使用率，公式是 `(total 时间差 - idle 时间差) / total 时间差 * 100`。最终，返回一个数组，包含每个 CPU 核心的使用率信息。

最终输出结果如下图所示：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/YBFV3Da0NwuR0EAZcdfo1NFEbyia5sfXRONjGMzkOSJZ48Gt7ymXzdQn948JccIkcDMD1n7pcLU0PJj2wxnXWZQ/640?wx_fmt=other&from=appmsg)20241112112843

### user

user 表示 CPU 在用户态下运行的时间比例。这部分时间用于执行用户应用程序的代码，通常指不需要直接访问硬件或操作系统内核的任务。在用户态运行的程序包括所有的常见应用程序，例如网页浏览器、文字处理器、数据库、Web 服务器等。这些应用程序在运行过程中可能会执行大量的逻辑和数据处理，但它们不直接与系统内核交互，而是通过系统调用间接访问资源。当 user 时间占比高时，表示系统主要在忙于处理应用程序的任务。如果 CPU 的 user 时间一直很高，说明系统正在执行大量的用户级任务，可能在处理密集计算、数据分析等操作。

### nice

nice 表示 CPU 在低优先级用户态下运行的时间比例。低优先级用户态指的是那些被标记为低优先级的任务的运行时间。系统可以通过调整进程的 nice 值（“友好度”）来改变其优先级。nice 值越高的进程，优先级越低，这意味着这些任务会在系统空闲时才会执行，以不影响高优先级的任务。这通常用于后台运行的任务，例如系统维护、批量处理等，可以在不打扰前台任务的情况下进行。如果 nice 时间较高，说明系统在后台处理了大量低优先级任务，而这些任务并未影响高优先级任务的执行。

### system

system 表示 CPU 在内核态下运行的时间比例，即执行系统核心任务和系统调用的时间。内核态是一种特殊的运行模式，它允许 CPU 直接访问操作系统核心数据结构和硬件资源。例如，当应用程序需要读写文件、进行网络通信、分配内存等操作时，就需要调用系统资源，这时 CPU 会切换到内核态来完成这些操作。system 时间占比高说明系统在处理大量的系统调用，这可能与频繁的 I/O 操作、硬件访问或底层网络连接有关。如果 system 时间一直很高，可能意味着操作系统正在频繁处理系统请求或硬件访问请求，可能需要优化系统的资源管理。

### idle

idle 表示 CPU 处于空闲状态的时间比例。当系统中没有任务可以运行时，CPU 就会进入空闲状态，这种状态下 CPU 不会执行任何用户或系统任务，而是等待新的任务调度。空闲时间高意味着系统资源充足，当前没有较高的任务负载；反之，空闲时间低说明系统繁忙，CPU 几乎没有休息时间，可能在处理大量任务。对于服务器和后台程序来说，适当的空闲时间表明系统负载健康，能够应对新的请求。如果 idle 时间接近于 0%，系统可能已经处于满负载状态，可能需要优化性能或扩展资源。

### irq

irq 表示 CPU 处理硬件中断（Interrupt Request, IRQ）请求的时间比例。硬件中断是由硬件设备（如硬盘、网卡等）发出的请求信号，用于告知 CPU 有事件需要立即处理。例如，当网卡收到数据包时，会触发一个中断，要求 CPU 中断当前任务去处理网络数据。irq 时间较高可能表明系统中硬件设备频繁请求 CPU 资源。这种情况可能在高网络流量或高 I/O 负载时出现。较高的 irq 时间可能会影响系统性能，尤其是当 CPU 需要频繁响应硬件中断时，其他任务的执行可能会被打断，从而影响整体的系统响应性。

CPU 负载
------

CPU 负载描述的是系统中等待 CPU 执行的任务数量。一般来说，它可以理解为系统队列中任务的数量，包括正在运行和等待运行的任务。CPU 负载的数值越高，说明系统任务越多，CPU 负载越重；数值越低，说明系统任务较少，CPU 有更多的闲暇时间。

CPU 负载通常以平均值的形式显示，分为 1 分钟平均负载、5 分钟平均负载和 15 分钟平均负载。这些数值分别表示系统在过去 1 分钟、5 分钟和 15 分钟内的平均负载。这个平均值可以帮助我们判断系统的负载趋势和波动情况。

CPU 负载的计算方式取决于系统中正在执行和等待执行的任务数量。其基本原理是队列长度，即在某个时间点，正在等待 CPU 处理的任务数量。

在多核 CPU 系统中，负载的计算方式会稍有不同：

*   单核 CPU 系统：理想情况下，负载值为 1 表示 CPU 满负荷运作（系统有一个任务在执行，没有任务在等待）。如果负载值超过 1，则意味着有任务在等待 CPU 资源（负载过高）。
    
*   多核 CPU 系统：例如，4 核 CPU 的理想负载值为 4（即每个核心有一个任务在运行，没有任务在等待）。如果负载值超过 4，说明系统中有任务在排队等待 CPU，可能会出现性能瓶颈。
    

负载值和 CPU 核心数的关系通常可以作为判断系统是否健康的依据。例如，8 核 CPU 的负载值低于 8 通常是正常的，而超过 8 则说明任务过多，CPU 可能不堪重负。

### CPU 负载和 CPU 使用率的区别

CPU 使用率和 CPU 负载是两个不同的概念，尽管它们都涉及 CPU 的忙碌程度：

*   CPU 使用率是指 CPU 在某段时间内被使用的比例，比如 50% 使用率表示 CPU 有一半的时间在执行任务。
    
*   CPU 负载则描述的是系统中的任务队列长度，也就是等待 CPU 执行的任务数量。它不仅包括当前正在执行的任务，还包括等待执行的任务。
    

举个例子，如果 CPU 使用率很高（比如 90% 以上），但 CPU 负载低（小于或等于 CPU 核心数），说明系统在繁忙但没有太多任务积压。相反，如果 CPU 使用率低但 CPU 负载很高，说明 CPU 可能被阻塞了（例如等待 I/O 操作完成），导致有很多任务在等待处理。

### 如何在 nodejs 中获取 CPU 负载

在支持的系统（如 Linux、macOS）上，Node.js 提供了一个简单的方法来获取系统平均负载信息，使用 os.loadavg() 即可直接获得系统的平均负载。

```
const os = require("os");

// 获取 CPU 负载信息
const load = os.loadavg();
console.log(`CPU 负载（1分钟平均值）：${load[0]}`);
console.log(`CPU 负载（5分钟平均值）：${load[1]}`);
console.log(`CPU 负载（15分钟平均值）：${load[2]}`);


```

平均负载是 Unix 特有的概念。在 Windows 上，返回值始终为 `[0, 0, 0]`

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/YBFV3Da0NwuR0EAZcdfo1NFEbyia5sfXRkxVGRFxnKPtzQYO5XkfPkW9cI4XcLKIertxTzWL85IWHz5OsEHuxqQ/640?wx_fmt=other&from=appmsg)20241112114406

内存指标
----

在 Node.js 中，内存使用情况是一个非常重要的指标，尤其是对于需要处理大量数据或长时间运行的应用程序。内存管理不当会导致应用程序的内存泄漏，最终可能导致应用崩溃。因此，理解 Node.js 的内存指标和监控内存使用情况至关重要。

Node.js 中内存指标主要涉及 V8 引擎的内存使用情况。Node.js 使用 V8 引擎来执行 JavaScript 代码，而 V8 使用的是垃圾回收机制来管理内存。在 V8 中，内存分为以下几个部分：

1.  堆内存（Heap Memory）：
    

*   堆内存是用于存储对象、字符串等复杂数据结构的主要区域。V8 在堆上为 JavaScript 对象分配内存。
    
*   堆内存分为 “新生代” 和“老生代”两个区域。新生代存放生命周期较短的对象（如临时变量），而老生代存放生命周期较长的对象（如全局变量）。
    
*   新生代对象通过短时间后清除，而 老生代对象会长期存储，直到不再使用才会被清除。
    

3.  栈内存（Stack Memory）：
    

*   栈内存主要用于存储函数调用的上下文，包括局部变量和基本数据类型（如数字、布尔值）。
    
*   栈内存相对较小，但存取速度较快。当函数调用结束后，栈上的数据会自动被回收。
    

5.  本机内存（Native Memory）：本机内存用于存储非 JavaScript 数据，比如 C++ 库的缓冲区、文件描述符等。这部分内存不受 V8 的垃圾回收管理，因此如果程序大量使用本机资源，需要特别小心内存泄漏。
    

Node.js 提供了 process.memoryUsage() 方法，可以用来获取当前应用程序的内存使用情况。process.memoryUsage() 返回一个对象，包含了多个内存使用指标：

1.  rss（Resident Set Size）：表示进程的常驻内存大小，包括堆内存、栈内存和本机内存。
    
2.  heapTotal：表示 V8 引擎分配的堆内存的总量。
    
3.  heapUsed：表示 V8 引擎实际使用的堆内存大小。
    
4.  external：表示 V8 管理的外部对象的内存使用情况，例如通过 Buffer 使用的内存。
    

以下是一个示例，展示如何在 Node.js 中获取和打印内存使用情况：

```
const os = require("os");

// 打印内存使用情况的函数
function printMemoryUsage() {
  const memoryUsage = process.memoryUsage();

  console.log("内存使用情况:");
  console.log(
    `RSS（常驻内存大小）：${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`
  );
  console.log(
    `堆内存总量（heapTotal）：${(memoryUsage.heapTotal / 1024 / 1024).toFixed(
      2
    )} MB`
  );
  console.log(
    `已用堆内存（heapUsed）：${(memoryUsage.heapUsed / 1024 / 1024).toFixed(
      2
    )} MB`
  );
  console.log(
    `外部内存（external）：${(memoryUsage.external / 1024 / 1024).toFixed(
      2
    )} MB`
  );
  console.log(`系统可用内存：${(os.freemem() / 1024 / 1024).toFixed(2)} MB`);
  console.log(`系统总内存：${(os.totalmem() / 1024 / 1024).toFixed(2)} MB`);
}

// 模拟内存消耗的函数
function createLargeArray() {
  const largeArray = new Array(1e6).fill("Hello");
  console.log("创建了一个大型数组");
  printMemoryUsage();
}

printMemoryUsage(); // 初始内存使用情况
createLargeArray(); // 模拟内存使用


```

最终输出结果如下图所示：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/YBFV3Da0NwuR0EAZcdfo1NFEbyia5sfXRerRhu46FZkeouDVBTwnHlMgQShekiaeUls21ezcNgiaHXRezxd1QyWVQ/640?wx_fmt=other&from=appmsg)20241112115042

Node.js 提供的内存指标可以帮助开发者了解应用程序的内存使用情况，并进行必要的优化。通过定期监控 rss、heapTotal、heapUsed 等指标，可以及时发现内存泄漏并优化内存使用，提高应用程序的稳定性和性能

磁盘空间指标
------

磁盘监控主要是监控磁盘的用量。由于日志频繁写的缘故，磁盘空间被渐渐用光。一旦磁盘不够用，将会引发系统的各种问题。给磁盘的使用量设置一个上限，一旦磁盘用量超过警戒值，服务器的管理者就应该整理日志或者清理磁盘。

磁盘空间指标主要有以下几项：

1.  总空间（Total Space）：
    

*   磁盘的总容量，即磁盘上可以存储的总数据量。
    
*   这是一个固定值，通常在安装或配置硬件时决定。
    

3.  已用空间（Used Space）：
    

*   已经被使用的磁盘空间。包括文件、日志、数据库等占用的所有空间。
    
*   已用空间占比高的磁盘可能需要定期清理或扩容。
    

5.  可用空间（Available Space）：
    

*   剩余的可用磁盘空间。可以被新的数据写入，但随着已用空间的增加，可用空间会逐渐减少。
    
*   可用空间太低可能会导致应用程序无法创建新文件、存储新数据，甚至导致系统崩溃。
    

7.  使用率（Usage Percentage）：
    

*   表示已用空间占总空间的百分比。
    
*   如果使用率超过 80%，一般建议进行清理或扩容。过高的使用率可能导致磁盘读写性能下降。
    

在 Linux 和 macOS 上，df -h 命令可以显示磁盘空间的使用情况。以下是 Node.js 中的实现：

```
const { exec } = require("child_process");

function getDiskSpaceLinux() {
  exec("df -h /", (error, stdout, stderr) => {
    if (error) {
      console.error(`执行出错: ${error.message}`);
      return;
    }

    if (stderr) {
      console.error(`标准错误输出: ${stderr}`);
      return;
    }

    // 解析 df 命令输出
    const lines = stdout.trim().split("\n");
    const diskInfo = lines[1].split(/\s+/);

    console.log("磁盘空间使用情况:");
    console.log(`总空间: ${diskInfo[1]}`);
    console.log(`已用空间: ${diskInfo[2]}`);
    console.log(`可用空间: ${diskInfo[3]}`);
    console.log(`使用率: ${diskInfo[4]}`);
  });
}

getDiskSpaceLinux();


```

`exec('df -h /')` 表示使用 df 命令获取根目录 / 的磁盘空间信息。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/YBFV3Da0NwuR0EAZcdfo1NFEbyia5sfXREHSCax2h1XZOriaCLEWETZjwPU4r1YNefSug1nzFJItCmENwANrp3zQ/640?wx_fmt=other&from=appmsg)20241112135819

在 Windows 系统上，可以使用 wmic logicaldisk 命令来获取磁盘空间信息。以下是 Node.js 中的实现：

```
const { exec } = require("child_process");

function getDiskSpaceWindows() {
  exec(
    "wmic logicaldisk get size,freespace,caption",
    (error, stdout, stderr) => {
      if (error) {
        console.error(`执行出错: ${error.message}`);
        return;
      }

      if (stderr) {
        console.error(`标准错误输出: ${stderr}`);
        return;
      }

      // 解析 wmic 命令输出
      const lines = stdout.trim().split("\n");
      lines.slice(1).forEach((line) => {
        const [drive, free, total] = line.trim().split(/\s+/);
        if (drive) {
          const used = total - free;
          const usage = ((used / total) * 100).toFixed(2);

          console.log(`磁盘分区: ${drive}`);
          console.log(`总空间: ${(total / 1024 / 1024 / 1024).toFixed(2)} GB`);
          console.log(`已用空间: ${(used / 1024 / 1024 / 1024).toFixed(2)} GB`);
          console.log(`可用空间: ${(free / 1024 / 1024 / 1024).toFixed(2)} GB`);
          console.log(`使用率: ${usage}%`);
          console.log("---");
        }
      });
    }
  );
}

getDiskSpaceWindows();


```

`wmic logicaldisk get size,freespace,caption` 表示获取每个磁盘分区的总空间和可用空间。

输出结果如下图所示：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/YBFV3Da0NwuR0EAZcdfo1NFEbyia5sfXR8ibCB7icJmibicHs4VvnzuEC2brE3GnWkRK52vBV7v3mfkc4TiciaZciaRkyQ/640?wx_fmt=other&from=appmsg)20241112135938

I/O 指标
------

I/O（输入 / 输出）指标在计算机系统中非常重要，它衡量了系统如何处理数据的读取和写入操作。I/O 操作包括磁盘读写和网络传输，这些操作直接影响系统的响应速度和处理性能。在服务器应用中，I/O 性能往往是系统性能的关键瓶颈之一。

I/O 指标主要包括以下几个关键指标：

1.  吞吐量（Throughput）：
    

*   吞吐量是指在一定时间内完成的 I/O 操作总量。对于磁盘 I/O，吞吐量通常以 MB/s（每秒兆字节） 为单位，表示每秒读取或写入的数据量。
    
*   吞吐量越高，表示系统能够更快速地完成数据的传输。
    
*   适用于需要高数据传输的场景，例如数据库操作、文件读写和视频流处理。
    

3.  I/O 请求数（I/O Operations per Second，IOPS）：
    

*   IOPS 表示每秒执行的 I/O 操作数，通常用来衡量磁盘的性能，特别是对于小文件的读写操作。
    
*   高 IOPS 表示系统能够在短时间内完成更多的 I/O 请求，对于数据库、缓存系统等频繁访问小文件的场景尤为重要。
    
*   IOPS 值高意味着系统能够高效地处理大量的并发请求
    

5.  等待时间（Wait Time）：
    

*   等待时间是指 I/O 请求从发出到开始处理的延迟时间。等待时间越长，表示 I/O 操作被系统排队等待的时间越长，说明系统负载较高或资源竞争严重。
    
*   较短的等待时间意味着 I/O 请求能够快速获得处理，而较长的等待时间可能导致系统响应变慢。
    

7.  响应时间（Response Time）：
    

*   响应时间是指从发出 I/O 请求到完成整个操作所需的时间。它包括等待时间、处理时间和数据传输时间。
    
*   响应时间越短，说明系统的 I/O 性能越好。高响应时间会导致系统变慢，用户体验变差，尤其在 Web 应用和数据库中影响较大。
    

9.  I/O 使用率（I/O Utilization）：
    

*   I/O 使用率表示 I/O 子系统的繁忙程度，通常以百分比表示。它反映了 I/O 设备在总时间内实际工作时间的比例。
    
*   使用率较高（如超过 80%）时，系统可能接近瓶颈状态，可能会导致请求排队，进而影响系统性能。
    

获取 I/O 指标，我们要了解一个 linux 命令，叫 iostat，如果没有安装，需要安装一下，我们看一下这个命令为啥能反应 I/O 指标：

```
iostat -dx


```

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/YBFV3Da0NwuR0EAZcdfo1NFEbyia5sfXRiaKjgbPMMYhpiaanrjwklby4ONWicf7icM5fnAA8LUrWXNh4CXsLKQXong/640?wx_fmt=other&from=appmsg)20241112141533

这些是 Linux 系统下磁盘 I/O 的指标数据，它们是通过命令 `iostat` 获取的，反映了各个设备（如 `loop0`、`sr0`、`vda`）的 I/O 状况。下面是对每个指标的详细解释：

1.  Device：设备名称，比如 `loop0`、`sr0`、`vda` 等，代表不同的磁盘或分区。
    
2.  r/s（Read per Second）：每秒读取次数，表示每秒钟完成的读请求数量。
    
3.  rkB/s（Read KB per Second）：每秒读取的 KB 数，表示每秒从设备读取的数据量（以 KB 为单位）。
    
4.  rrqm/s（Read Requests Merged per Second）：每秒合并的读请求数。当多个读请求被合并成一个请求发送到设备时，该值会增大。请求合并是 I/O 调度程序进行优化的一部分。
    
5.  %rrqm（Read Request Merged Percentage）：表示被合并的读请求的百分比，即 `rrqm/s` 占所有读请求的百分比。较高的值表示较多的读请求被合并，可以提升 I/O 性能。
    
6.  r_await（Read Await）：平均每个读请求的等待时间，单位是毫秒。较低的 `r_await` 表示设备响应迅速，而较高的值可能意味着 I/O 瓶颈。
    
7.  rareq-sz（Read Average Request Size）：平均每次读请求的大小，以 KB 为单位。值越大，表示每次读请求传输的数据量越多。
    
8.  w/s（Write per Second）：每秒写入次数，表示每秒钟完成的写请求数量。
    
9.  wkB/s（Write KB per Second）：每秒写入的 KB 数，表示每秒向设备写入的数据量（以 KB 为单位）。
    
10.  wrqm/s（Write Requests Merged per Second）：每秒合并的写请求数。当多个写请求被合并成一个请求发送到设备时，该值会增大。
    
11.  %wrqm（Write Request Merged Percentage）：表示被合并的写请求的百分比，即 `wrqm/s` 占所有写请求的百分比。较高的值表示较多的写请求被合并，可以提升 I/O 性能。
    
12.  w_await（Write Await）：平均每个写请求的等待时间，单位是毫秒。较低的 `w_await` 表示设备响应迅速，而较高的值可能意味着 I/O 瓶颈。
    
13.  wareq-sz（Write Average Request Size）：平均每次写请求的大小，以 KB 为单位。值越大，表示每次写请求传输的数据量越多。
    
14.  d/s（Discard per Second）：每秒丢弃的请求数。丢弃请求指的是一些文件系统的操作不需要实际的 I/O（例如丢弃某些缓存）。
    
15.  dkB/s（Discard KB per Second）：每秒丢弃的 KB 数。
    
16.  drqm/s（Discard Requests Merged per Second）：每秒被合并的丢弃请求数。
    
17.  %drqm（Discard Request Merged Percentage）：丢弃请求被合并的百分比。
    
18.  d_await（Discard Await）：平均每个丢弃请求的等待时间，单位是毫秒。
    
19.  dareq-sz（Discard Average Request Size）：平均每次丢弃请求的大小，以 KB 为单位。
    
20.  f/s（Flush per Second）：每秒刷新请求数（主要与文件系统的刷新操作相关）。
    
21.  f_await（Flush Await）：平均每个刷新请求的等待时间，单位是毫秒。
    
22.  aqu-sz（Average Queue Size）：表示设备请求队列的平均长度。较高的队列长度可能意味着 I/O 瓶颈或设备忙碌。
    
23.  %util（Utilization Percentage）：设备的利用率百分比，表示该设备在一段时间内的繁忙程度。值越接近 100%，表示设备越忙碌。一般来说，当 `%util` 接近 100% 时，说明设备已接近 I/O 极限。
    

以 `vda` 设备为例：

*   `r/s = 0.68`：表示每秒钟完成 0.68 次读请求。
    
*   `rkB/s = 9.41`：表示每秒读取的数据量是 9.41 KB。
    
*   `rrqm/s = 0.49`：表示每秒合并了 0.49 个读请求。
    
*   `%rrqm = 41.98`：表示 41.98% 的读请求被合并。
    
*   `r_await = 1.14`：表示平均每个读请求的等待时间是 1.14 毫秒。
    
*   `w/s = 6.44`：表示每秒钟完成 6.44 次写请求。
    
*   `wkB/s = 76.62`：表示每秒写入的数据量是 76.62 KB。
    
*   `wrqm/s = 8.67`：表示每秒合并了 8.67 个写请求。
    
*   `%wrqm = 57.37`：表示 57.37% 的写请求被合并。
    
*   `w_await = 1.90`：表示平均每个写请求的等待时间是 1.90 毫秒。
    
*   `%util = 0.69`：表示 `vda` 设备的 I/O 利用率是 0.69%，说明设备并不繁忙。
    

这些指标可以帮助我们分析系统的 I/O 性能，判断是否存在 I/O 瓶颈。例如，如果 `r_await` 或 `w_await` 很高，说明请求在等待较长时间，可能是 I/O 瓶颈的表现。而 `%util` 接近 100% 则意味着磁盘或设备负载较高，需要进行优化或扩展。

参考资料
----

*   高级 Node 知识点！Node 性能监控指标获取方法 [1]
    

总结
--

Node.js 的性能监控对构建高效、稳定的企业级应用至关重要。它涵盖了 CPU 使用率、负载、内存使用、磁盘空间、I/O 性能、吞吐量、QPS、响应时间等核心指标，通过这些指标可以全面了解应用的资源使用和性能瓶颈。CPU 和内存指标可以帮助优化计算和存储资源分配，而磁盘空间、I/O 和网络吞吐量等指标则为 I/O 密集型应用提供了性能分析的基础。通过合理的指标监控和调优，开发者能够确保应用在高负载情况下仍具备快速响应和稳定性，为用户提供流畅的体验。

最后再来提一下这两个开源项目，它们都是我们目前正在维护的开源项目：

*   在线代码协同编辑器 [2]
    
*   前端脚手架 create-neat[3]
    

参考资料

[1]

https://juejin.cn/post/7087924763275821063#heading-27: https://juejin.cn/post/7087924763275821063#heading-27

[2]

https://github.com/xun082/online-edit-web: https://github.com/xun082/online-edit-web

[3]

https://github.com/xun082/create-neat: https://github.com/xun082/create-neat

Node 社群

```
我组建了一个氛围特别好的 Node.js 社群，里面有很多 Node.js小伙伴，如果你对Node.js学习感兴趣的话（后续有计划也可以），我们可以一起进行Node.js相关的交流、学习、共建。下方加 考拉 好友回复「Node」即可。

   “分享、点赞、在看” 支持一波👍

```