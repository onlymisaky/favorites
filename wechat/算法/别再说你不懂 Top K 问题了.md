> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/0_Rr6Pjshvd7Om2zTYMriQ)

### 引言

今天这篇文章讲解一道活跃于各个大厂（腾讯、字节、阿里等）面试中的题目：Top K 问题，将按照以下脉络介绍：

*   什么是 Top K 问题
    
*   Top K 问题的五种经典解法
    
*   快速回顾与总结
    
*   练习题 Top K 三剑客：最小 K 个数、前 K 个高频元素、第 K 个最小元素（含解答）
    

下面直接开始吧👇

### 一、什么是 Top K 问题

> 什么是 Top K 问题？简单来说就是在一组数据里面找到频率出现最高的前 K 个数，或前 K 大（当然也可以是前 K 小）的数。

经典的 Top K 问题有：最大（小） K 个数、前 K 个高频元素、第 K 个最大（小）元素

下面以求数组中的第 K 个最大元素为例，介绍 Top K 问题的解法

**题目：**

在未排序的数组中找到第 **k** 个最大的元素。请注意，你需要找的是数组排序后的第 k 个最大的元素。

**示例:**

```
输入: [4,5,1,6,2,7,3,8] 和 k = 4输出: 5
```

### 二、解法：全局排序，取第 k 个数

我们能想到的最简单的就是将数组进行排序（可以是最简单的快排），取前 K 个数就可以了，so easy

**代码实现：**

```
let findKthLargest = function(nums, k) {    nums.sort((a, b) => b - a);    return nums[k-1]};
```

**复杂度分析：**

*   时间复杂度：O(nlogn)
    
*   空间复杂度：O(logn)
    

**注意：**

在 V8 引擎 7.0 版本之前，数组长度小于 10 时， `Array.prototype.sort()` 使用的是插入排序，否则用快速排序。

在 V8 引擎 7.0 版本之后就舍弃了快速排序，因为它不是稳定的排序算法，在最坏情况下，时间复杂度会降级到 O(n2)。

而是采用了一种混合排序的算法：**TimSort** 。

这种功能算法最初用于 Python 语言中，严格地说它不属于以上 10 种排序算法中的任何一种，属于一种混合排序算法：

在数据量小的子数组中使用**插入排序**，然后再使用**归并排序**将有序的子数组进行合并排序，时间复杂度为 `O(nlogn)` 。

### 三、解法：局部排序，冒泡

题目仅仅需要求出数组中的第 K 个最大元素，没必要对数组整体进行排序

可以使用冒泡排序，每次将最大的数在最右边冒泡出来，只冒泡 k 次即可

**动图演示**

![](https://mmbiz.qpic.cn/mmbiz_gif/pfCCZhlbMQQ44GpBjJcbwngXRVfH93hIXGl0EcaiaLdB5wIPBUkFAP1JHtIHiblsdSATicNyiaqsF7e3k10oZFy1uA/640?wx_fmt=gif)

**代码实现**

```
let findKthLargest = function(nums, k) {    // 进行k轮冒泡排序    bubbleSort(nums, k)    return nums[nums.length-k]}let bubbleSort = function(arr, k) {    for (let i = 0; i < k; i++) {        // 提前退出冒泡循环的标识位        let flag = false;        for (let j = 0; j < arr.length - i - 1; j++) {            if (arr[j] > arr[j + 1]) {                const temp = arr[j];                arr[j] = arr[j + 1];                arr[j + 1] = temp;                flag = true;                // 表示发生了数据交换            }        }        // 没有数据交换        if(!flag) break    }}
```

**复杂度分析：**

*   时间复杂度：最好时间复杂度 O(n)，平均时间复杂度 O(n*k)
    
*   空间复杂度：O(1)
    

### 四、解法：构造前 `k` 个最大元素小顶堆，取堆顶

我们也可以通过构造一个前 `k` 个最大元素小顶堆来解决，小顶堆上的任意节点值都必须小于等于其左右子节点值，即堆顶是最小值。

所以我们可以从数组中取出 `k` 个元素构造一个小顶堆，然后将其余元素与小顶堆对比，如果大于堆顶则替换堆顶，然后堆化，所有元素遍历完成后，堆中的堆顶即为第 `k` 个最大值

具体步骤如下：

*   从数组中取前 `k` 个数（ `0` 到 `k-1` 位），构造一个小顶堆
    
*   从 `k` 位开始遍历数组，每一个数据都和小顶堆的堆顶元素进行比较，如果小于堆顶元素，则不做任何处理，继续遍历下一元素；如果大于堆顶元素，则将这个元素替换掉堆顶元素，然后再堆化成一个小顶堆。
    
*   遍历完成后，堆顶的数据就是第 K 大的数据
    

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQQ44GpBjJcbwngXRVfH93hISXjjSUCy7Svc9xIMMRlZxtLVt9vbVaonmib7tTamht1tkWJ8c8H3zCA/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQQ44GpBjJcbwngXRVfH93hIOkRNuZDmYAW1aeQicL5cqylK5Z281glicEdUiadGusFJuIgDZzN4mv3vA/640?wx_fmt=png)

**代码实现：**

```
let findKthLargest = function(nums, k) {    // 从 nums 中取出前 k 个数，构建一个小顶堆    let heap = [,], i = 0    while(i < k) {       heap.push(nums[i++])     }    buildHeap(heap, k)        // 从 k 位开始遍历数组    for(let i = k; i < nums.length; i++) {        if(heap[1] < nums[i]) {            // 替换并堆化            heap[1] = nums[i]            heapify(heap, k, 1)        }    }        // 返回堆顶元素    return heap[1]};// 原地建堆，从后往前，自上而下式建小顶堆let buildHeap = (arr, k) => {    if(k === 1) return    // 从最后一个非叶子节点开始，自上而下式堆化    for(let i = Math.floor(k/2); i>=1 ; i--) {        heapify(arr, k, i)    }}// 堆化let heapify = (arr, k, i) => {    // 自上而下式堆化    while(true) {        let minIndex = i        if(2*i <= k && arr[2*i] < arr[i]) {            minIndex = 2*i        }        if(2*i+1 <= k && arr[2*i+1] < arr[minIndex]) {            minIndex = 2*i+1        }        if(minIndex !== i) {            swap(arr, i, minIndex)            i = minIndex        } else {            break        }    }}// 交换let swap = (arr, i , j) => {    let temp = arr[i]    arr[i] = arr[j]    arr[j] = temp}
```

**复杂度分析：**

*   时间复杂度：遍历数组需要 O(n) 的时间复杂度，一次堆化需要 O(logk) 时间复杂度，所以利用堆求 Top k 问题的时间复杂度为 O(nlogk)
    
*   空间复杂度：O(k)
    

#### 利用堆求 Top k 问题的优势

这种求 Top k 问题是可以使用排序来处理，但当我们需要在一个动态数组中求 Top k 元素怎么办喃？

动态数组可能会插入或删除元素，难道我们每次求 Top k 问题的时候都需要对数组进行重新排序吗？那每次的时间复杂度都为 O(nlogn)

这里就可以使用堆，我们可以维护一个 K 大小的小顶堆，当有数据被添加到数组中时，就将它与堆顶元素比较，如果比堆顶元素大，则将这个元素替换掉堆顶元素，然后再堆化成一个小顶堆；如果比堆顶元素小，则不做处理。这样，每次求 Top k 问题的时间复杂度仅为 O(logk)

更多堆内容可查看 [前端进阶算法：看完这篇，再也不怕堆排序、Top K、中位数问题面试了](http://mp.weixin.qq.com/s?__biz=MzUzNjk5MTE1OQ==&mid=2247484898&idx=1&sn=17901b4eb404398e13afddaa9f5f7c08&chksm=faec813acd9b082c8e598b0511d813fffb41230563858bb13ca2a65421079915ba23e1b2e92c&scene=21#wechat_redirect)，最新文章：https://github.com/sisterAn/JavaScript-Algorithms/issues/60

### 五、解法：优化，快速选择（quickselect）算法

无论是排序算法还是构造堆求解 Top k 问题，我们都经过的一定量的不必要操作：

*   如果使用排序算法，我们仅仅想要的是第 k 个最大值，但是我们却对数组进行了整体或局部的排序
    
*   如果使用堆排序，需要维护一个大小为 `k` 的堆 (大顶堆，小顶堆)，同时花费时间也很昂贵，时间复杂度为 `O(nlogk)`
    

那么有没有一种算法，不需要进行排序，也不需要花费额外的空间，就能获取第 K 个最大元素喃？

这就要说到快速选择算法了😊

快速选择（quickselect）算法与快排思路上相似，下面普及一下快排，已经了解的朋友可以跳过这一段

#### 快排

快排使用了分治策略的思想，所谓分治，顾名思义，就是分而治之，将一个复杂的问题，分成两个或多个相似的子问题，在把子问题分成更小的子问题，直到更小的子问题可以简单求解，求解子问题，则原问题的解则为子问题解的合并。

快排的过程简单的说只有三步：

*   首先从序列中选取一个数作为基准数
    
*   将比这个数大的数全部放到它的右边，把小于或者等于它的数全部放到它的左边 （一次快排 `partition`）
    
*   然后分别对基准的左右两边重复以上的操作，直到数组完全排序
    

具体按以下步骤实现：

*   1，创建两个指针分别指向数组的最左端以及最右端
    
*   2，在数组中任意取出一个元素作为基准
    
*   3，左指针开始向右移动，遇到比基准大的停止
    
*   4，右指针开始向左移动，遇到比基准小的元素停止，交换左右指针所指向的元素
    
*   5，重复 3，4，直到左指针超过右指针，此时，比基准小的值就都会放在基准的左边，比基准大的值会出现在基准的右边
    
*   6，然后分别对基准的左右两边重复以上的操作，直到数组完全排序
    

注意这里的基准该如何选择喃？最简单的一种做法是每次都是选择最左边的元素作为基准：

![](https://mmbiz.qpic.cn/mmbiz_gif/pfCCZhlbMQQ44GpBjJcbwngXRVfH93hIJIzPmZ4xuysadl8X5uAmNSBwpI0vNpIN8giaPe5hnOhBticyCWD898Vg/640?wx_fmt=gif)

但这对几乎已经有序的序列来说，并不是最好的选择，它将会导致算法的最坏表现。还有一种做法，就是选择中间的数或通过 `Math.random()` 来随机选取一个数作为基准，下面的代码实现就是以随机数作为基准。

**代码实现**

```
let quickSort = (arr) => {  quick(arr, 0 , arr.length - 1)}let quick = (arr, left, right) => {  let index  if(left < right) {    // 划分数组    index = partition(arr, left, right)    if(left < index - 1) {      quick(arr, left, index - 1)    }    if(index < right) {      quick(arr, index, right)    }  }}// 一次快排let partition = (arr, left, right) => {  // 取中间项为基准  var datum = arr[Math.floor(Math.random() * (right - left + 1)) + left],      i = left,      j = right  // 开始调整  while(i <= j) {        // 左指针右移    while(arr[i] < datum) {      i++    }        // 右指针左移    while(arr[j] > datum) {      j--    }        // 交换    if(i <= j) {      swap(arr, i, j)      i += 1      j -= 1    }  }  return i}// 交换let swap = (arr, i , j) => {    let temp = arr[i]    arr[i] = arr[j]    arr[j] = temp}// 测试let arr = [1, 3, 2, 5, 4]quickSort(arr)console.log(arr) // [1, 2, 3, 4, 5]// 第 2 个最大值console.log(arr[arr.length - 2])  // 4
```

快排是从小到大排序，所以第 `k` 个最大值在 `n-k` 位置上

**复杂度分析**

*   时间复杂度：O(nlog2n)
    
*   空间复杂度：O(nlog2n)
    

#### 快速选择（quickselect）算法

上面我们实现了快速排序来取第 k 个最大值，其实没必要那么麻烦，

我们仅仅需要在每执行一次快排的时候，比较基准值位置是否在 `n-k` 位置上，

*   如果小于 `n-k` ，则第 k 个最大值在基准值的右边，我们只需递归快排基准值右边的子序列即可；
    
*   如果大于 `n-k` ，则第 k 个最大值在基准值的做边，我们只需递归快排基准值左边的子序列即可；
    
*   如果等于  `n-k` ，则第 k 个最大值就是基准值
    

**代码实现：**

```
let findKthLargest = function(nums, k) {    return quickSelect(nums, nums.length - k)};let quickSelect = (arr, k) => {  return quick(arr, 0 , arr.length - 1, k)}let quick = (arr, left, right, k) => {  let index  if(left < right) {    // 划分数组    index = partition(arr, left, right)    // Top k    if(k === index) {        return arr[index]    } else if(k < index) {        // Top k 在左边        return quick(arr, left, index-1, k)    } else {        // Top k 在右边        return quick(arr, index+1, right, k)    }  }  return arr[left]}let partition = (arr, left, right) => {  // 取中间项为基准  var datum = arr[Math.floor(Math.random() * (right - left + 1)) + left],      i = left,      j = right  // 开始调整  while(i < j) {        // 左指针右移    while(arr[i] < datum) {      i++    }        // 右指针左移    while(arr[j] > datum) {      j--    }        // 交换    if(i < j) swap(arr, i, j)    // 当数组中存在重复数据时，即都为datum，但位置不同    // 继续递增i，防止死循环    if(arr[i] === arr[j] && i !== j) {        i++    }  }  return i}// 交换let swap = (arr, i , j) => {    let temp = arr[i]    arr[i] = arr[j]    arr[j] = temp}
```

**复杂度分析：**

*   时间复杂度：平均时间复杂度 O(n)，最坏情况时间复杂度为 O(n2)
    
*   空间复杂度：O(1)
    

### 六、解法：继续优化，中位数的中位数（BFPRT）算法

又称为**中位数的中位数算法**，它的最坏时间复杂度为 O(n) ，它是由 **Blum、Floyd、Pratt、Rivest、Tarjan** 提出。该算法的思想是修改快速选择算法的主元选取方法，提高算法在最坏情况下的时间复杂度。

在 BFPTR 算法中，仅仅是改变了快速选择（quickselect）算法中 `Partion` 中的基准值的选取，在快速选择（quickselect）算法中，我们可以选择第一个元素或者最后一个元素作为基准元，优化的可以选择随机一个元素作为基准元，而在 BFPTR 算法中，每次选择五分中位数的中位数作为基准元（也称为主元 **pivot**），这样做的目的就是使得划分比较合理，从而避免了最坏情况的发生。

BFPRT 算法步骤如下：

*   选取主元
    

*   将 n 个元素按顺序分为 `n/5` 个组，每组 5 个元素，若有剩余，舍去
    
*   对于这 `n/5` 个组中的每一组使用插入排序找到它们各自的中位数
    
*   对于上一步中找到的所有中位数，调用 BFPRT 算法求出它们的中位数，作为主元；
    

*   以主元为分界点，把小于主元的放在左边，大于主元的放在右边；
    
*   判断主元的位置与 k 的大小，有选择的对左边或右边递归
    

**代码实现：**

```
let findKthLargest = function(nums, k) {    return nums[bfprt(nums, 0, nums.length - 1, nums.length - k)]}let bfprt = (arr, left , right, k) => {  let index  if(left < right) {    // 划分数组    index = partition(arr, left, right)    // Top k    if(k === index) {        return index    } else if(k < index) {        // Top k 在左边        return bfprt(arr, left, index-1, k)    } else {        // Top k 在右边        return bfprt(arr, index+1, right, k)    }  }  return left}let partition = (arr, left, right) => {  // 基准  var datum = arr[findMid(arr, left, right)],      i = left,      j = right  // 开始调整  while(i < j) {    // 左指针右移    while(arr[i] < datum) {      i++    }        // 右指针左移    while(arr[j] > datum) {      j--    }        // 交换    if(i < j) swap(arr, i, j)    // 当数组中存在重复数据时，即都为datum，但位置不同    // 继续递增i，防止死循环    if(arr[i] === arr[j] && i !== j) {        i++    }  }  return i}/** * 数组 arr[left, right] 每五个元素作为一组，并计算每组的中位数， * 最后返回这些中位数的中位数下标（即主元下标）。 * * @attention 末尾返回语句最后一个参数多加一个 1 的作用其实就是向上取整的意思， * 这样可以始终保持 k 大于 0。 */let findMid = (arr, left, right) => {    if (right - left < 5)        return insertSort(arr, left, right);    let n = left - 1;    // 每五个作为一组，求出中位数，并把这些中位数全部依次移动到数组左边    for (let i = left; i + 4 <= right; i += 5)    {        let index = insertSort(arr, i, i + 4);        swap(arr[++n], arr[index]);    }    // 利用 bfprt 得到这些中位数的中位数下标（即主元下标）    return findMid(arr, left, n);}/** * 对数组 arr[left, right] 进行插入排序，并返回 [left, right] * 的中位数。 */let insertSort = (arr, left, right) => {    let temp, j    for (let i = left + 1; i <= right; i++) {        temp = arr[i];        j = i - 1;        while (j >= left && arr[j] > temp)        {            arr[j + 1] = arr[j];            j--;        }        arr[j + 1] = temp;    }    return ((right - left) >> 1) + left;}// 交换let swap = (arr, i , j) => {    let temp = arr[i]    arr[i] = arr[j]    arr[j] = temp}
```

**复杂度分析：**

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQQ44GpBjJcbwngXRVfH93hI40UJSqp0QMMCXzibafheA5nT6ccpBUaMY0YCbYtEkkSebS0wAsj7p4A/640?wx_fmt=png)

**为什么是 5？**

在 BFPRT 算法中，为什么是选 5 个作为分组？

首先，偶数排除，因为对于奇数来说，中位数更容易计算。

如果选用 3，有 ![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQQ44GpBjJcbwngXRVfH93hIaZeq7NlfbCne4fLtgXkDZc6AibJA1brurpiamGY4ubbuDBgrklIRbNQA/640?wx_fmt=png)，其操作元素个数还是 `n` 。

如果选取 7，9 或者更大，在插入排序时耗时增加，常数 `c` 会很大，有些得不偿失。

### 七、回顾与总结

最后，我们总结一下，求 topk 问题其实并不难，主要有以下几个思路：

*   **整体排序**：O(nlogn)
    
*   **局部排序**：只冒泡排序前 k 个最大值，O(n*k)
    
*   **利用堆**：O(nlogk)
    
*   **计数或桶排序**：计数排序用于前 k 个最值，时间复杂度为 O(n + m)，其中 m 表示数据范围；桶排序用于最高频 k 个，时间复杂度为 O(n)；**但这两者都要求输入数据必须是有确定范围的整数** ，本文没有做过多介绍，可前往 https://github.com/sisterAn/JavaScript-Algorithms 获取更多信息
    
*   **优化：快速选择（quickselect）算法**：平均 O(n)，最坏 O(n2)
    
*   **继续优化：中位数的中位数（bfprt）算法**：最坏 O(n)
    

这里简单说一下后两种方案：

*   首先，需要知道什么是快排，快排的过程简单的说只有三步：首先从序列中选取一个数作为基准数；将比这个数大的数全部放到它的右边，把小于或者等于它的数全部放到它的左边 （一次快排 `partition`）；然后分别对基准的左右两边重复以上的操作，直到数组完全排序
    
*   快速选择（quickselect）算法：快排会把所有的数据进行排序，而我们仅仅想要的是第 k 个最大值，所以 `quickselect` 对快排进行来优化：在每执行一次快排（`partition`）的时候，比较基准值位置是否在 `n-k` （第 k 大 = 第 n-k 小，n 为数组长度）位置上，如果小于 `n-k` ，则第 k 个最大值在基准值的右边，我们只需递归快排基准值右边的子序列即可；如果大于 `n-k` ，则第 k 个最大值在基准值的做边，我们只需递归快排基准值左边的子序列即可；如果等于  `n-k` ，则第 k 个最大值就是基准值，平均时间复杂度 O(n)，最坏情况时间复杂度为 O(n2)，在最坏情况下，时间复杂度还是很高的
    
*   中位数的中位数（bfprt）算法：该算法的思想是修改快速选择（`quickselect`）算法的主元选取方法，提高算法在最坏情况下的时间复杂度
    

最后，附上 Top K 问题经典练习题，解题内容太多，前往 git 仓库查看解答

*   腾讯 & 字节等：最小的 k 个数：
    
    https://github.com/sisterAn/JavaScript-Algorithms/issues/59
    
*   leetcode347：前 K 个高频元素：
    
    https://github.com/sisterAn/JavaScript-Algorithms/issues/61
    
*   字节 & leetcode215：数组中的第 K 个最大元素：
    
    https://github.com/sisterAn/JavaScript-Algorithms/issues/62
    

最后
--

欢迎关注「三分钟学前端」，回复「交流」自动加入前端三分钟进阶群，每日一道编程算法面试题（含解答），助力你成为更优秀的前端开发！

号内回复：

「**网络**」，自动获取三分钟学前端网络篇小书（90 + 页）

「**JS**」，自动获取三分钟学前端 JS 篇小书（120 + 页）

「**算法**」，自动获取 github 2.9k+ 的前端算法小书

「**面试**」，自动获取 github 23.2k+ 的前端面试小书

「**简历**」，自动获取程序员系列的 `120` 套模版

》》面试官也在看的前端面试资料《《  

“在看和转发” 就是最大的