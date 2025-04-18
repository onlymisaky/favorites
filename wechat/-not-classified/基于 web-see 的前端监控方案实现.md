> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/urMHF_Lm-SYNx1mSs_v8sQ)

```
1、需求背景

```

最近在研究前端项目的监控，找到了 web-see 这个工具，jake/web-see[1]，还有使用 demo，github.com/xy-sea/web-…[2] 。这个工具提供了上报错误、定位错误源码、记录用户行为等功能。

2、实现方案
------

参考 web-see-demo，运行 node 服务，提供接口：错误上报、错误列表查询、获取源码等该接口。为了实现获取源码的功能，需要将前端项目 sourcemap=true 的打包文件放到 node 服务的静态目录中。基于原来 web-see-demo 的功能，我又增加了注册前端项目、筛选错误列表、持久化存储等功能。实现思路如图所示。

  
![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHriaNJA1sbjsMYefibibWXPIicNP7PYGsVc25Wyk2hJzgltF1d5xeJIP5nmiboRPpEMXThicKYkusZ1vnfA/640?wx_fmt=other&from=appmsg)

3、实现步骤
------

### 3.1 监控 node 服务

将 node 服务运行起来，执行命令 node server.js。

目录结构如图所示。server.js 为 node 服务；dist 文件夹中存放前端项目的打包文件，便于查找源代码；apps-data.json 存放监控的前端项目的基本信息；data.json 存放监控数据。

  
![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHriaNJA1sbjsMYefibibWXPIicNo4cEnRHfRI7AGEtiaftWRHRiaDGj04RkE5nlKic16Nr7KicV760qygHOFA/640?wx_fmt=jpeg)

node 服务提供的接口列表如下表

<table><thead><tr><th valign="top"><section><br></section></th><th valign="top"><section><br></section></th><th valign="top"><section><br></section></th></tr></thead><tbody><tr><td valign="top"><section>接口</section></td><td valign="top"><section>作用</section></td><td valign="top"><section>备注</section></td></tr><tr><td valign="top"><section>/getapps</section></td><td valign="top"><section>读取监控的前端项目数据</section></td><td valign="top"><section><br></section></td></tr><tr><td valign="top"><section>/addApp</section></td><td valign="top"><section>新增要监控的前端项目</section></td><td valign="top"><section><br></section></td></tr><tr><td valign="top"><section>/getmap</section></td><td valign="top"><section>获取 js.map 源码文件</section></td><td valign="top"><section>注意需要根据不同的 app 的 key 来指定到不同的文件夹</section></td></tr><tr><td valign="top"><section>/getErrorList</section></td><td valign="top"><section>获取报错列表</section></td><td valign="top"><section><br></section></td></tr><tr><td valign="top"><section>/getRecordScreenId</section></td><td valign="top"><section>获取录屏 ID</section></td><td valign="top"><section><br></section></td></tr><tr><td valign="top"><section>/reportData</section></td><td valign="top"><section>上报数据接口</section></td><td valign="top"><section><br></section></td></tr></tbody></table>

server.js 的源代码：

```
const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const coBody = require('co-body');
// 创建静态服务
const serveStatic = require('serve-static');
const rootPath = path.join(__dirname, 'dist');
app.use(serveStatic(rootPath));

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }));

app.all('*', function (res, req, next) {
  req.header('Access-Control-Allow-Origin', '*');
  req.header('Access-Control-Allow-Headers', 'Content-Type');
  req.header('Access-Control-Allow-Methods', '*');
  req.header('Content-Type', 'application/json;charset=utf-8');
  next();
});
// 先获取app的数据
const appDataPath = path.join(__dirname, 'apps-data.json');
// 读取app数据
functionloadAppData() {
try {
    const data = fs.readFileSync(appDataPath, 'utf8');
    returnJSON.parse(data);
  } catch (error) {
    return { apps: [] }
  }
}
let { apps } = loadAppData()
// 获取app数据
app.get('/getapps', (req, res) => {
let { apps } = loadAppData()
  res.send({
    code: 200,
    data: apps
  });
});
// 新增app
app.post('/addApp', async (req, res) => {
try {
    apps.push(req.body)
    saveData({ apps }, appDataPath)
    res.send({
      code: 200,
      meaage: '添加成功！'
    });
  }
catch (err) {
    res.send({
      code: 203,
      meaage: '添加失败！',
      err
    });
  }
});
// 定义数据存储路径
const dataPath = path.join(__dirname, 'data.json');
// 读取数据
functionloadData() {
try {
    const data = fs.readFileSync(dataPath, 'utf8');
    returnJSON.parse(data);
  } catch (error) {
    return {
      performanceList: [],
      errorList: [],
      recordScreenList: [],
      whiteScreenList: []
    };
  }
}

// 保存数据
functionsaveData(data, dataPath) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
}
let { performanceList, errorList, recordScreenList, whiteScreenList } = loadData()
// // 存储性能数据
// let performanceList = [];
// // 存储错误数据
// let errorList = [];
// // 存储录屏数据
// let recordScreenList = [];
// // 存储白屏检测数据
// let whiteScreenList = [];

// 获取js.map源码文件
app.get('/getmap', (req, res) => {
// req.query 获取接口参数
let folderName = req.query.folderName;
let fileName = req.query.fileName;
let mapFile = path.join(__filename, '..', '/dist/'+folderName+'/dist/assets');
// 拿到dist目录下对应map文件的路径
let mapPath = path.join(mapFile, `${fileName}.map`);
  fs.readFile(mapPath, function (err, data) {
    if (err) {
      console.error(err);
      return;
    }
    res.send(data);
  });
});

app.get('/getErrorList', (req, res) => {
  res.send({
    code: 200,
    data: errorList
  });
});

app.get('/getRecordScreenId', (req, res) => {
let id = req.query.id;
let data = recordScreenList.filter((item) => item.recordScreenId == id);
  res.send({
    code: 200,
    data
  });
});

app.post('/reportData', async (req, res) => {
console.log('req', req);
console.log('res', res);
try {
    // req.body 不为空时为正常请求，如录屏信息
    let length = Object.keys(req.body).length;
    if (length) {
      recordScreenList.push(req.body);
    } else {
      // 使用 web beacon 上报数据
      let data = await coBody.json(req);
      if (!data) return;
      if (data.type == 'performance') {
        performanceList.push(data);
      } elseif (data.type == 'recordScreen') {
        recordScreenList.push(data);
      } elseif (data.type == 'whiteScreen') {
        whiteScreenList.push(data);
      } else {
        errorList.push(data);
      }
    }
    saveData({
      performanceList,
      errorList,
      recordScreenList,
      whiteScreenList
    }, dataPath); // 保存数据到文件
    res.send({
      code: 200,
      meaage: '上报成功！'
    });
  } catch (err) {
    res.send({
      code: 203,
      meaage: '上报失败！',
      err
    });
  }
});

app.listen(3003, () => {
console.log('Server is running at http://localhost:3003');
});


```

  

### 3.2 需要监控的前端项目

打开前端项目，安装 web-see

npm i -S web-see

在 main.js 中写入监控配置相关代码。

```
import webSee from'@websee/core';
import performance from'@websee/performance';
import recordscreen from'@websee/recordscreen';

const app = createApp(App)

app.use(webSee, {
    dsn: 'http://localhost:3003/reportData', // node服务提供的上报书接口地址
    apikey: 'oms', // 项目标识
    userId: '89757',
    overTime: 20, // 接口超时时长
    maxBreadcrumbs: 50, // 用户行为存放最大容量，超过该值，会删除最旧的用户行为
    silentWhiteScreen: true,// 默认不会开启白屏检测，为 true 时，开启检测
    skeletonProject:false,// 有骨架屏的项目建议设为 true，提高白屏检测准确性
    beforeDataReport: null, // (自定义 hook) 数据上报前的 hook，有值时，所有的上报数据都要经过该 hook 处理，若返回 false，该条数据不会上报
  });

  webSee.use(performance);
  webSee.use(recordscreen);


```

  

打包发布到服务器中，正常运行起来，如果有报错，就会上报到 node 服务中，进而存入 data.json 文件。

打包配置中加入再次打包，将打包后的文件放到监控服务的 dist 文件夹中，注意父文件夹的名称要命名为 apikey 对应的值，当前示例为 “oms”。

```
 build: {
    sourcemap: true
  },


```

  

### 3.3 展示错误监控的前端项目

根据项目标识可以筛选报错信息。如果有多个项目添加了监控，在新增功能中注册前端项目，appKey 将作为项目标识和前端资源的文件夹名。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHriaNJA1sbjsMYefibibWXPIicNokljwTk3TMOstpAZ9LghUibBNhBBlXj2GlNYV32qjibicWXaY4lvV0cBg/640?wx_fmt=jpeg)

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHriaNJA1sbjsMYefibibWXPIicNicGGa03QK6V6N2VvmazJiczg3BFxCPIKYXuns0AaLGoWicdeJKWhMNwTQ/640?wx_fmt=jpeg)  

这里基本参照了 demo 中的内容，页面代码和 utils 中的代码如下。

页面代码：

```
<template>
    <divclass="table-box">
        <divclass="search-bar">
            <divclass="search-item">
                <span>项目标识：</span>
                <el-selectv-model="apikey"placeholder="项目标识"  clearable @change="filterData">
                    <el-optionv-for="item in options":key="item.apikey":label="item.appName":value="item.apikey" />
                </el-select>

            </div>
            <divclass="search-item">
                <el-buttontype="primary" @click="addApp">新增</el-button>
            </div>
        </div>
        <el-table:data="tableData"style="width: 100%">
            <el-table-columntype="index"width="50"></el-table-column>
            <el-table-columnprop="message"label="报错信息"width="300"></el-table-column>
            <el-table-columnprop="pageUrl"label="报错页面"></el-table-column>
            <el-table-columnprop="time"label="报错时间"width="150">
                <template #default="scope">
                    <span>{{ scope.row.time ? dateFormat(scope.row.time, 'YYYY-MM-DD HH:mm:ss') : scope.row.date
                        }}</span>
                </template>
            </el-table-column>
            <el-table-columnprop="apikey"label="项目编号"></el-table-column>
            <el-table-columnprop="userId"label="用户id"></el-table-column>
            <el-table-columnprop="sdkVersion"label="SDK版本"></el-table-column>
            <el-table-columnprop="deviceInfo"label="浏览器信息">
                <template #default="scope">
                    <span>{{ scope.row.deviceInfo.browser }}</span>
                </template>
            </el-table-column>
            <el-table-columnprop="deviceInfo"label="操作系统">
                <template #default="scope">
                    <span>{{ scope.row.deviceInfo.os }}</span>
                </template>
            </el-table-column>
            <el-table-columnfixed="right"prop="recordScreenId"label="还原错误代码"width="100">
                <template #default="scope">
                    <el-buttonv-if="scope.row.type == 'error' || scope.row.type == 'unhandledrejection'"type="primary"
                        @click="revertCode(scope.row)">查看源码</el-button>
                    <spanv-else></span>
                </template>
            </el-table-column>
            <el-table-columnfixed="right"prop="recordScreenId"label="播放录屏"width="100">
                <template #default="scope">
                    <el-buttonv-if="scope.row.recordScreenId"type="primary"
                        @click="playRecord(scope.row.recordScreenId)">播放录屏</el-button>
                </template>
            </el-table-column>
            <el-table-columnfixed="right"prop="breadcrumb"label="用户行为记录"width="125">
                <template #default="scope">
                    <el-buttonv-if="scope.row.breadcrumb"type="primary"
                        @click="revertBehavior(scope.row)">查看用户行为</el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-dialogv-model="adddialogVisible":title="'注册前端项目'"top="10vh">
            <el-form:model="form"label-width="auto">
                <el-form-itemlabel="appKey">
                    <el-inputv-model="form.apikey" />
                </el-form-item>
                <el-form-itemlabel="项目名称">
                    <el-inputv-model="form.appName" />
                </el-form-item>
                <el-form-itemlabel="项目资源路径">
                    <el-inputv-model="form.assetFolder" />
                </el-form-item>
                <el-form-itemlabel="项目描述">
                    <el-inputv-model="form.description" />
                </el-form-item>
                <el-form-item>
                    <el-buttontype="primary" @click="onSubmit">保存</el-button>
                    <el-button @click="adddialogVisible = false">取消</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>
        <el-dialogv-model="dialogVisible":title="dialogTitle":class="{ 'revert-disalog': fullscreen }"top="10vh"
            :fullscreen="fullscreen"width="900":destroy-on-close="true">
            <divid="revert"ref="revertRef"v-if="dialogTitle != '查看用户行为'"></div>
            <el-timelinev-else>
                <el-timeline-itemv-for="(activity, index) in activities":key="index":icon="activity.icon"
                    :color="activity.color":timestamp="dateFormat(activity.time, 'YYYY-MM-DD HH:mm:ss')">
                    {{ activity.content }}
                </el-timeline-item>
            </el-timeline>
        </el-dialog>
    </div>
</template>
<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import axios from 'axios'
import { dateFormat, downloadFile, clearSearchParams } from '@/utils'
import { findCodeBySourceMap } from '@/utils/sourcemap';
import { unzip } from '@/utils/recordScreen.js';
import { success, error, warning } from '@/utils/message'
import rrwebPlayer from 'rrweb-player';
import 'rrweb-player/dist/style.css';
const apikey = ref('')

const tableData = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const fullscreen = ref(false)
const revertdialog = ref(false)
const revertRef = ref(null)
const activities = ref([])
const options = ref([])

const adddialogVisible = ref(false)
const form = ref({
    apikey: '',
    appName: '',
    assetFolder: '',
    description: ''
})
const fulldataList = ref([])
const getData = async () => {
    // axios调用接口http://localhost:3003/getErrorList，打印返回值
    const res = await axios.get('http://localhost:3003/getErrorList')
    // console.log('res', res)
    fulldataList.value = res.data.data
    tableData.value = res.data.data;
}
const getOptions = async () => {
    const res = await axios.get('http://localhost:3003/getapps')
    options.value = res.data.data
}

onMounted(() => {
    getData()
    getOptions()
})
const filterData = ()=>{
    console.log('apikey',apikey)
    if (!apikey.value) {
        tableData.value = fulldataList.value
    } else {
        tableData.value = fulldataList.value.filter(e=>e.apikey === apikey.value) 
    }
}
const addApp = () => {
    adddialogVisible.value = true
}
const onSubmit = async() => {
    const res = await axios.post('http://localhost:3003/addApp', form.value)
    adddialogVisible.value = false
    if (res.data.code == 200) {
        success('添加成功')
    } else {
        error('添加失败')
    }
}
const revertCode = (row) => {
    dialogVisible.value = true
    findCodeBySourceMap(row, (res) => {
        dialogTitle.value = '查看源码'
        fullscreen.value = false
        revertdialog.value = true
        nextTick(() => {
            revertRef.value.innerHTML = res
        })
    })
}
const playRecord = (id) => {
    fetch(`http://localhost:3003/getRecordScreenId?id=${id}`)
        .then((response) => response.json())
        .then((res) => {
            let { code, data } = res;
            if (code == 200 && Array.isArray(data) && data[0] && data[0].events) {
                let events = unzip(data[0].events);
                dialogVisible.value = true
                fullscreen.value = true;
                dialogTitle.value = '播放录屏';
                revertdialog.value = true;
                nextTick(() => {
                    new rrwebPlayer({
                        target: document.getElementById('revert'),
                        props: {
                            events,
                            UNSAFE_replayCanvas: true
                        }
                    });
                });
            } else {
                warning('暂无数据')
            }
        });
}
const revertBehavior = ({ breadcrumb }) => {
    dialogTitle.value = '查看用户行为';
    fullscreen.value = false;
    revertdialog.value = true;
    dialogVisible.value = true
    breadcrumb.forEach((item) => {
        item.color = item.status == 'ok' ? '#5FF713' : '#F70B0B';
        item.icon = item.status == 'ok' ? 'el-icon-check' : 'el-icon-close';
        if (item.category == 'Click') {
            item.content = `用户点击dom: ${item.data}`;
        } elseif (item.category == 'Http') {
            item.content = `调用接口: ${item.data.url}, ${item.status == 'ok' ? '请求成功' : '请求失败'}`;
        } elseif (item.category == 'Code_Error') {
            item.content = `代码报错：${item.data.message}`;
        } elseif (item.category == 'Resource_Error') {
            item.content = `加载资源报错：${item.message}`;
        } elseif (item.category == 'Route') {
            item.content = `路由变化：从 ${item.data.from}页面 切换到 ${item.data.to}页面`;
        }
    });
    activities.value = breadcrumb;
}

</script>

<style lang="scss">
.table-box {
    height: calc(100% - 160px);
}

.revert-disalog {
    .el-dialog__body {
        height: 720px;
    }
}

.heightlight {
    background: yellow;
}

.rr-player {
    margin: 0 auto;
}

#revert {
    width: 100%;
    display: flex;
}
</style>


```

  

recordScreen.js 代码如下

```
import { Base64 } from'js-base64';
import pako from'pako';

// 解压
exportfunctionunzip(b64Data) {
let strData = Base64.atob(b64Data);
let charData = strData.split('').map(function (x) {
    return x.charCodeAt(0);
  });
let binData = newUint8Array(charData);
let data = pako.ungzip(binData);
// ↓切片处理数据，防止内存溢出报错↓
let str = '';
const chunk = 8 * 1024;
let i;
for (i = 0; i < data.length / chunk; i++) {
    str += String.fromCharCode.apply(null, data.slice(i * chunk, (i + 1) * chunk));
  }
  str += String.fromCharCode.apply(null, data.slice(i * chunk));
// ↑切片处理数据，防止内存溢出报错↑
const unzipStr = Base64.decode(str);
let result = '';
// 对象或数组进行JSON转换
try {
    result = JSON.parse(unzipStr);
  } catch (error) {
    if (/Unexpected token o in JSON at position 0/.test(error)) {
      // 如果没有转换成功，代表值为基本数据，直接赋值
      result = unzipStr;
    }
  }
return result;
}


```

  

sourcemap.js 代码如下

```
import sourceMap from'source-map-js'
import { success, error, warning } from'./message'

// 找到以.js结尾的fileName
functionmatchStr(str) {
if (str.endsWith('.js')) return str.substring(str.lastIndexOf('/') + 1);
}

// 将所有的空格转化为实体字符
functionrepalceAll(str) {
return str.replace(newRegExp(' ', 'gm'), ' ');
}

functionloadSourceMap(fileName, folderName) {
let file = matchStr(fileName);
if (!file) return;
returnnewPromise((resolve) => {
    fetch(`http://localhost:3003/getmap?fileName=${file}&folderName=${folderName}`).then((response) => {
      resolve(response.json());
    });
  });
}

exportconst findCodeBySourceMap = async ({ fileName, apikey, line, column }, callback) => {
console.log('fileName', fileName);
let sourceData = await loadSourceMap(fileName, apikey);
if (!sourceData) return;
let { sourcesContent, sources } = sourceData;
let consumer = awaitnew sourceMap.SourceMapConsumer(sourceData);
let result = consumer.originalPositionFor({
    line: Number(line),
    column: Number(column)
  });
/**
   * result结果
   * {
   *   "source": "webpack://myapp/src/views/HomeView.vue",
   *   "line": 24,  // 具体的报错行数
   *   "column": 0, // 具体的报错列数
   *   "name": null
   * }
   * */
if (result.source && result.source.includes('node_modules')) {
    // 三方报错解析不了，因为缺少三方的map文件，
    // 比如echart报错 webpack://web-see/node_modules/.pnpm/echarts@5.4.1/node_modules/echarts/lib/util/model.js
    return error(
      `源码解析失败: 因为报错来自三方依赖，报错文件为 ${result.source}`
    );
    // Message({
    //   type: 'error',
    //   duration: 5000,
    //   message: `源码解析失败: 因为报错来自三方依赖，报错文件为 ${result.source}`
    // });
  }

let index = sources.indexOf(result.source);

// 未找到，将sources路径格式化后重新匹配 /./ 替换成 /
// 测试中发现会有路径中带/./的情况，如 webpack://web-see/./src/main.js
if (index === -1) {
    let copySources = JSON.parse(JSON.stringify(sources)).map((item) =>
      item.replace(//.//g, '/')
    );
    index = copySources.indexOf(result.source);
  }
console.log('index', index);
if (index === -1) {
    return error(
      `源码解析失败`
    );
    // Message({
    //   type: 'error',
    //   duration: 5000,
    //   message: `源码解析失败`
    // });
  }
let code = sourcesContent[index];
let codeList = code.split('\n');
var row = result.line,
    len = codeList.length - 1;
var start = row - 5 >= 0 ? row - 5 : 0, // 将报错代码显示在中间位置
    end = start + 9 >= len ? len : start + 9; // 最多展示10行
let newLines = [];
let j = 0;
for (var i = start; i <= end; i++) {
    j++;
    newLines.push(
      `<div class="code-line ${i + 1 == row ? 'heightlight' : ''}" title="${
        i + 1 == row ? result.source : ''
      }">${j}. ${repalceAll(codeList[i])}</div>`
    );
  }

let innerHTML = `<div><div>${result.source} at line ${
    result.column
  }:${row}</div><div>${newLines.join('')}</div></div>`;
  callback(innerHTML);
};


```

4、待优化
-----

（1）打包发布流程可以结合项目原本的发布流程进行优化。

（2）报错信息的持久化存储，可以按天存储，或者定期清理。

作者：IcecreamH2o

https://juejin.cn/post/7452406456366039050