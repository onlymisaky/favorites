> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/uKDWyg1inPCk0xMczY20qQ)

![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQQlbJqQeYrOFvS1dzEU0soAVDUIfiaQ62NKX3ffe4uwiczYyUaXNOqcBldsJice9yxWepxBJxRBUwRPQ/640?wx_fmt=jpeg)

面试季到，算法是所有面试官都会问到的问题，旨在考察候选人的逻辑思维能力，其中最最基础的就是两数之和问题

两数之和的解法很简单，但仅仅会这个就完了吗？大部分的面试官都会扩展到三数之和、四数之和直至 N 数之和，我们又该如何回答喃，延用相同的套路吗？**其实不然**

下面我们一一探讨

基础：两数之和
-------

什么是两数之和，给定一个整数数组 `nums` 和一个目标值 `target` ，请你在该数组中找出和为目标值的那 **两个** 整数，并返回他们的数组下标。

**例如:**

```
给定 nums = [2, 7, 11, 15], target = 9因为 nums[0] + nums[1] = 2 + 7 = 9所以返回 [0, 1]
```

傻瓜式的解法就是双层遍历，但时间复杂度太高，期望能够能够一次遍历就能解决，此时我们使用一个 `map` 来记录遍历过的元素

**解题思路：**

*   初始化一个 `map = new Map()`
    
*   从第一个元素开始遍历 `nums`
    
*   获取目标值与 `nums[i]` 的差值，即 `k = target - nums[i]` ，判断差值在 `map` 中是否存在
    

*   不存在（ `map.has(k)` 为 `false` ） ，则将 `nums[i]` 加入到 `map` 中（key 为`nums[i]`, value 为 `i` ，方便查找 map 中是否存在某值，并可以通过 `get` 方法直接拿到下标）
    
*   存在（ `map.has(k)` ），返回 `[map.get(k), i]` ，求解结束
    

*   遍历结束，则 `nums` 中没有符合条件的两个数，返回 `[]`
    

**时间复杂度：O(n)**

**代码实现：**

```
const twoSum = function(nums, target) {    let map = new Map()    for(let i = 0; i< nums.length; i++) {        let k = target-nums[i]        if(map.has(k)) {            return [map.get(k), i]        }        map.set(nums[i], i)    }    return [];};
```

完美！

两数之和已经解决了？那三数之和喃？也适用 `map` 吗？

进阶：三数之和
-------

给你一个包含 `n` 个整数的数组 `nums`，判断 `nums` 中是否存在三个元素 `a` ，`b` ，`c`  ，使得 `a + b + c = 0` ？请你找出所有满足条件且不重复的三元组。

**注意：** 答案中不可以包含重复的三元组。

**例如：**

```
给定数组 nums = [-1, 0, 1, 2, -1, -4]，满足要求的三元组集合为：[  [-1, 0, 1],  [-1, -1, 2]]
```

我们可以继续按照两数之和的思路解题，遍历数组，选定一个数（ `nums[i]` ）作为三数之和的第一个数，然后题目就换成了在 `i+1` 到 `nums.length-1` 中两数之和问题。

但会出现一个问题：结果中可能会出现重复的三元组

```
const threeSum = function(nums) {    let map = new Map()    let result = []    for(let i = 0; i < nums.length - 2; i++) {        // 第一个数        let first = nums[i]        for(let j = i+1; j < nums.length; j++) {            // 第三个数            let second = 0 - nums[j] - first            if(map.has(second)) {                result.push([first, second, nums[j]])            }            map.set(nums[j], j)        }        map.clear()    }    return result};// 测试var nums = [-1, 0, 1, 2, -1, -4]threeSum(nums)// [[-1,0,1],[-1,2,-1],[0,1,-1]]// 存在重复元组
```

你可以尝试着去除重复元组，但花费的时间、空间复杂度就高了

感谢 **@thxiami** 的补充，我们可以使用排序去重：

```
const threeSum = function (nums) {  let set = new Set() // 使用 Set() 即可满足需求, 相对节省内存  let result = []  nums.sort((a, b) => (a - b))  for(let i =0; i < nums.length - 2; i++) {    while (nums[i] === nums[i - 1]) {i++} // 去重    // 第一个数    let first = nums[i]    let j = i + 1    while (j < nums.length) {      // 第三个数      let second = 0 - nums[j] - first      let third = nums[j]      if(set.has(second)) {        result.push([first, second, third])        set.add(third)        j++        while (nums[j] === nums[j-1]) {j++} // 去重      } else {        set.add(third)        j++      }    }    set = new Set()  }  return result};
```

这里介绍另一种思路解法：**排序 + 双指针**

为了防止结果数组中加入重复的元素，我们可以将 `nums` 进行排序，例如第一个数 `nums[i] === nums[i-1]` 时，`nums[i]` 作为第一个数与 `nums[i-1]` 作为第一个数得到的满足条件的三元组是一致的，所以此时 `nums[i]` 我们将不再进行判断，避免重复三元组，当然这只是第一个数，第二个数与第三个数的判断也是类似的。

**解题思路：** 先数组排序，排序完后遍历数组，以 `nums[i]` 作为第一个数 `first` ，以 `nums[i+1]` 作为第二个数 `second` ，将 `nums[nums.length - 1]` 作为第三个数 `last` ，判断三数之和是否为 `0` ，

*   `<0` ，则 `second` 往后移动一位（`nums` 是增序排列），继续判断
    
*   `>0` ，则 `last` 往前移动一位（`nums` 是增序排列），继续判断
    
*   `===0` ，则进入结果数组中，并且 `second` 往后移动一位， `last` 往前移动一位，继续判断下一个元组
    

直至 `second >= last` 结束循环，此时， `nums[i]` 作为第一个数的所有满足条件的元组都已写入结果数组中了，继续遍历数组，直至 `i === nums.length - 2` (后面需要有 `second` 、 `last` )

**代码实现：**

```
const threeSum = function(nums) {    if(!nums || nums.length < 3) return []    let result = [], second, last    // 排序    nums.sort((a, b) => a - b)     for (let i = 0; i < nums.length ; i++) {        if(nums[i] > 0) break        // 去重        if(i > 0 && nums[i] === nums[i-1]) continue        second = i + 1        last = nums.length - 1        while(second < last){            const sum = nums[i] + nums[second] + nums[last]            if(!sum){                // sum 为 0                result.push([nums[i], nums[second], nums[last]])                // 去重                while (second<last && nums[second] === nums[second+1]) second++                 while (second<last && nums[last] === nums[last-1]) last--                second ++                last --            }            else if (sum < 0) second ++            else if (sum > 0) last --        }    }            return result};
```

那 N 树之和喃？

结局：N 数之和
--------

请用算法实现，从给定的无需、不重复的数组 A 中，取出 N 个数，使其相加和为 M。并给出算法的时间、空间复杂度，如：

```
var arr = [1, 4, 7, 11, 9, 8, 10, 6];var N = 3;var M = 27;Result:[7, 11, 9], [11, 10, 6], [9, 8, 10]
```

**解题思路：利用二进制**

根据数组长度构建二进制数据，再选择其中满足条件的数据。

我们用 `1` 和 `0` 来表示数组中某位元素是否被选中。因此，可以用 `0110` 来表示数组中第 `1` 位和第 `2` 位被选中了。

所以，本题可以解读为：

*   数组中被选中的个数是 `N` 。
    
*   被选中的和是 `M` 。
    

我们的算法思路逐渐清晰起来：遍历所有二进制，判断选中个数是否为 `N` ，然后再求对应的元素之和，看其是否为 `M` 。

#### 1. 从数组中取出 N 个数

例如：

```
var arr = [1, 2, 3, 4];var N = 3;var M = 6;
```

如何判断 `N=3` 是，对应的选取二进制中有几个 `1` 喃？

最简单的方式就是：

```
const n = num => num.toString(2).replace(/0/g, '').length
```

这里我们尝试使用一下位运算来解决本题，因为位运算是不需要编译的（位运算直接用二进制进行表示，省去了中间过程的各种复杂转换，提高了速度），肯定速度最快。

我们知道 `1&0=0` 、 `1&1=1` ，`1111&1110=1110` ，即 `15&14=14` ，所以我们每次 `&` 比自身小 `1` 的数都会消除一个 `1` ，所以这里建立一个迭代，通过统计消除的次数，就能确定最终有几个 1 了：

```
const n = num => {  let count = 0  while(num) {    num &= (num - 1)    count++  }  return count}
```

#### 2. 和为 M

现在最后一层判断就是选取的这些数字和必须等于 `M` ，即根据 `N` 生成的对应二进制所在元素上的和 是否为 `M`

比如 `1110` ，我们应该判断 `arr[0] + arr[1] + arr[2]` 是否为 `M`。

那么问题也就转化成了如何判断数组下标是否在 `1110` 中呢？如何在则求和

其实也很简单，比如下标 `1` 在，而下标 `3` 不在。我们把 `1` 转化成 `0100` ， `1110 & 0100`  为 `1100`, 大于 `0` ，因此下标 `1` 在。而 `1110 & 0001` 为 `0` ，因此 下标 `3` 不在。

所以求和我们可以如下实现：

```
let arr = [1,2,3,4]// i 为满足条件的二进制let i = 0b1110let s = 0, temp = []let len = arr.lengthfor (let j = 0; j < len; j++) {  if ( i & 1 << (len - 1 - j)) { s += arr[j] temp.push(arr[j])  }}console.log(temp)// => [1, 2, 3]
```

#### 最终实现

```
// 参数依次为目标数组、选取元素数目、目标和const search = (arr, count, sum) => {  // 计算某选择情况下有几个 1，也就是选择元素的个数  const getCount = num => {    let count = 0    while(num) {      num &= (num - 1)      count++    }    return count  }  let len = arr.length, bit = 1 << len, res = []    // 遍历所有的选择情况  for(let i = 1; i < bit; i++){    // 满足选择的元素个数 === count    if(getCount(i) === count){      let s = 0, temp = []      // 每一种满足个数为 N 的选择情况下，继续判断是否满足 和为 M      for(let j = 0; j < len; j++){        // 建立映射，找出选择位上的元素        if(i & 1 << (len - 1 -j)) {          s += arr[j]          temp.push(arr[j])        }      }      // 如果这种选择情况满足和为 M      if(s === sum) {        res.push(temp)      }    }  }  return res}
```

总结
--

虽然是相似的问题，但解答却不一致：

*   两数之和：map
    
*   三数之和：双指针
    
*   N 数之和：二进制
    

遇到的时候千万别忘了

最后
--

欢迎关注「三分钟学前端」，回复「交流」自动加入前端三分钟进阶群，每日一道编程算法面试题（含解答），助力你成为更优秀的前端开发！

![](https://mmbiz.qpic.cn/mmbiz_gif/bwG40XYiaOKmibEL4rxRMd1XEbhsGicGUHAkkLAic8NcbuXRibfqgHian9Ckl9dbRPzP72SoHTe9qDqzhWYRSJT2DQUg/640?wx_fmt=gif)

》》面试官也在看的前端面试资料《《

“在看和转发” 就是最大的支持