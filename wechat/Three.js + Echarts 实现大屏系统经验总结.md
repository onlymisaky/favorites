> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/PBmuxKoZXpBJr71N6CmFcw)

```
大厂技术  高级前端  Node进阶

点击上方 程序员成长指北，关注公众号

回复1，加入高级Node交流群

```

时间过的好快，参加公司的新项目研发快一年了，五一机器人项目首秀，我们遇到了高并发集中下单情景，然后海量数据处理场景来了，给我在后端领域的高并发实践业务上画上了漂亮的一笔经验。人都是在磨练中成长，我很感谢这次给我的机会，虽然有点累，但也有点小成就。正好现在有空，我先聊聊首秀后给领导们做的大屏数据展示吧，领导等着看漂亮数据呢！

### 大屏重点是贼啦炫酷的动态特效加持

业务核心运营场景：各大地上地下停车场

这里我用的是`three.js`去实现的实际业务场景的场站模拟三维图，废话不多说，直接上图吧！先说一下，这里截图是看起来像 2 维，但实际是 3 维的，可以滑动翻转地图的。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/YBFV3Da0NwsBR01xtZERicU5rlibrBvibGGuecDtPbgJnoG0x5XkxnAn9k3Zwz3Vm8ia5OL6PACjXWRMGQYyQp68UA/640?wx_fmt=other&from=appmsg)截屏 2024-05-07 18.35.07.png

如图所示，这是 p4 停车场的全景图，整个停车场的鸟瞰图一览无余，可以滚动鼠标放大看 ====》

这是我用 three.js 渲染的每个停车位的车位标记，这里记录了这个车场的每个车位的坐标点，方便后期，观察我们投放的 100 台机器人智能驾驶实时模拟。听起来是不是很牛逼 plus？我告诉你，事情没那么简单！由于数据太多，既要有 3D-map，也要有实时动态数据滚动展示和各种 echarts 图表，比如：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/YBFV3Da0NwsBR01xtZERicU5rlibrBvibGG5PGtric92FXmsWt81xLIVZ6HX3WIKxTVojaQ6qa4YOnPUJskQ683Usw/640?wx_fmt=other&from=appmsg)ps：不好意思，本人还要严格遵守劳动合同执行公司数据保密，相关数据已经打码。

然后一堆实时数据数据和图上来后，不出意外的意外来了，性能出现了问题，我遇到了内存泄漏的情况。这还怎么继续二期的机器人动态运行场景研发呢？别慌，一步一步排查代码。

### 1. 先介绍下大屏顶部的总数统计动态数字翻牌器

这里我用了第三方插件：动态数字翻牌器`vue-count-to`, 只要有数据变化，就会实时看到动态增长的效果

首先要在框架中安装`npm install vue-count-to`，并在项目入口文件中引入

```
import CountTo from 'vue-count-to';
Vue.use(CountTo)
new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})


```

实际业务开发模块中代码：

```
                <count-to
                    class="count-to"
                    :startVal="0" //开始数值
                    :endVal="687573.74" //结束数值
                    :duration="500000" //动态变化的时间设定
                    :decimals="1"  //每次动态增长的数量
                ></count-to>


```

### 2. 然后在大屏的左侧，我写了一个实时从下到上无限滚动的动态订单列表，可以让领导看到最新的订单情况。

```
<template>
    <div class="scrolling-list" :style="{ transform: `translate(0px,-${scrollTop}px)` }">
      <ul ref="scrollItemBox">
        <li v-for="(item, index) in items" :key="index" class="item-li">
            <div><span class="name">订单编号：</span><span class="content"><i class="el-icon-receiving">  {{ item.order_id }}</i></span></div>
            <div><span class="name">订单金额：</span><span class="content"><i class="el-icon-s-finance" style="color:#1989fa" >  {{ item.pre_total_amount }}</i></span><span class="name">手机号：</span><span class="content"><i class="el-icon-mobile-phone" style="color:#1989fa">  {{ item.phone }}</i></span></div>
            <div><span class="name">车牌号：</span><span class="content"> <i class="el-icon-truck" style="color:#1989fa">  {{ item.vehicle_no }}</i></span><span class="name">车位号：</span><span class="content"><i class="el-icon-map-location" style="color:#1989fa">  {{ item.target_slot_no }}</i></span></div>
            <div><span class="name">订单来源：</span><span class="content">{{ item.order_from == 1 ? '小程序' : 'APP' }}</span><span class="name">下单时间：</span><span class="content"><i class="el-icon-time">  {{ item.created_at }}</i></span></div>
        </li>
      </ul>
      <div v-html="copyHtml"></div>
    </div>
</template>
<script>
  
  export default {
    
  data() {
      return {
        name: "InfiniteScroll",
        scrollTop: 0, //列表滚动高度
        speed: 15, //滚动的速度
        copyHtml: '',
        items:[],
        intervalId: null
      };
    },
  mounted() {
    this.initScroll()
  },
  beforeDestroy() {
    // 清除定时任务
      clearInterval(this.intervalId);
    },
  methods: {
     initScroll() {
            this.$nextTick(() => {
                this.copyHtml = this.$refs.scrollItemBox.innerHTML
                this.startScroll()
            })
      },
      // 开始滚动
      startScroll() {
          setInterval(this.scroll, this.speed);
      },
      // 滚动处理方法
      scroll() {
            this.scrollTop++
            // 获取需要滚动的盒子的高度
            let scrollItemBox = this.$refs.scrollItemBox?.offsetHeight || 1000
            // 当判断滚动的高度大于等于盒子高度时，从头开始滚动
            if (this.scrollTop >= scrollItemBox) {
                this.scrollTop = 0
            }
      }
    }
  };
  </script>


```

### 3. 然后在大屏的右侧，用`echarts`写了两个饼图和折线图表，可以直观的的看到数据统计

```
export const timeStaticsOption = (xData,tipsArr) => {
  return {
    title: {
      text: '',
      subtext:'当天时间段充电订单数',
      subtextStyle:{
        color:'#fff',
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    xAxis: {
      type: 'category',
      data: xData,
      boundaryGap: false,
      axisLine: {
        show: false,
        lineStyle: {
          color: '#73B131',
          type: 'dashed'
        }
      },
    },
    yAxis: {
      type: 'value',
      axisPointer: {
        snap: true
      }
    },
    series: [
      {
        name: '时间段充电订单数',
        type: 'line',
        smooth: true,
        data: tipsArr,
      }
    ]
  }
}
export const botDataPieEcharts = (total,a,b)=>{
  console.log(total,a,b)
  return {
    title: {
      text: '',
      subtext: "Bot总数:"+ total+ '台',
      left: 'center',
      subtextStyle:{
        color:'#fff',
      }
    },
    tooltip: {
      trigger: 'item'
    },
    // legend: {
    //   orient: 'vertical',
    //   left: 'left'
    // },
    series: [
      {
        name: 'Bot数量',
        type: 'pie',
        radius: '50%',
        data: [
          { value: a, name: '在线:'+ a +'台' },
          { value: b, name: '空闲:'+ b +'台'},
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
}


```

### 4. 最后也是最耗性能的部分，用`three.js`写的停车场模拟实景鸟瞰图，3d-map

这里我直接把相关的方法和类，全部封装好，单独引入文件，用到以下文件，

```
import '../public/threejs/controls/OrbitControls.js'; 
import '../public/threejs/lines/LineSegmentsGeometry.js';
import '../public/threejs/lines/LineGeometry.js';
import '../public/threejs/lines/LineMaterial.js';
import '../public/threejs/lines/LineSegments2.js';
import '../public/threejs/lines/Line2.js';


```

在业务中相关代码写好工具方法，

```
import myWorker from './map.worker';
import FONT_JSON_DATA from './helvetiker_bold.typeface.json';
class basicThree {
    constructor(props) {
        this.from = props.from
        this.callbackSlotNo = props.callback
        console.log(props, 'props')
        this.LineGeometry
        // three 3要素
        this.renderer; //渲染器
        this.camera; //摄像头
        this.scene; //场景
        //光源
        this.ambientLight; //环境光
        this.pointLight; //平行光
        this.DirectionalLight
        //触屏开始时间
        this.touchTime = 0
        //摄像头控制
        this.controls;
        this.init()
        this.onmousedbclick = this.onMouseDblclick.bind(this);
        this.selectObject
        this.rawOption
        this.materialLine = Object()
        this.box = document.createElement("div")

        this.donX
        this.donY
        this.dataNumber
        this.originX; // 偏移量x坐标
        this.originZ; // 偏移量z坐标
        this.thinLine;
        this.wideLine;

        // 定义模型组
        this.initModalGroup();

        this.mapParams;

        this.drawModalFunc = {
            '0': {
                'func': this.RoadLineSigns.bind(this),
                'group': 'RoadLineSigns_group',
                'z': 0
            },
            '1': {
                'func': this.RoadLineSigns.bind(this),
                'group': 'RoadLineSigns_group',
                'z': 0
            },
            '2': {
                'func': this.RoadLineSigns.bind(this),
                'group': 'RoadLineSigns_group',
                'z': 2
            },
            '3': {
                'func': this.initNoAndArea.bind(this),
                'group': null,
                'z': 3
            },
            '4': {
                'func': this.basicWall.bind(this),
                'group': 'barrier_group',
                'z': 3
            },
            '5': {
                'func': this.initSlotLine.bind(this),
                'group': 'initSlotLine_group',
                'z': 3
            },
            '6': {
                'func': this.RoadLineSigns.bind(this),
                'group': 'RoadLineSigns_group',
                'z': 3
            },
            '7': {
                'func': this.RoadLineSigns.bind(this),
                'group': 'RoadLineSigns_group',
                'z': 3
            },
            '8': {
                'func': this.RoadLineSigns.bind(this),
                'group': 'RoadLineSigns_group',
                'z': 3
            },
            '9': {
                'func': this.initSlotLine.bind(this),
                'group': 'initSlotLine_group',
                'z': 3
            },
            '10': {
                'func': this.initSlotLine.bind(this),
                'group': 'initSlotLine_group',
                'z': 3
            },
            '11': {
                'func': this.RoadLineSigns.bind(this),
                'group': 'RoadLineSigns_group',
                'z': 3
            },
            '13': {
                'func': this.initSlotLine.bind(this),
                'group': 'initSlotLine_group',
                'z': 3
            },
            '14': {
                'func': this.RoadLineSigns.bind(this),
                'group': 'RoadLineSigns_group',
                'z': 3
            },
            '16': {
                'func': this.RoadLineSigns.bind(this),
                'group': 'RoadLineSigns_group',
                'z': 3
            },
            '1001': {
                'func': this.initSlotLine.bind(this),
                'group': 'initSlotLine_group',
                'z': 4
            }
        }
        //字体loader
        this.FontLoader;
        this.getFontLoaderInit()
    }

    init() {
        this.initScene()
        this.initCamera()
        this.initRender()
        this.orbitHelper() //摄像头辅助
        this.animate()
        window.onresize = this.onWindowResize.bind(this);
    }
    initScene() { //场景
        this.scene = new THREE.Scene();
    }
    // // 三维坐标系辅助
    axesHelper() {
        this.scene.add(new THREE.AxesHelper(200))
    }
    initCamera() { //摄像头
        var width = window.innerWidth; //窗口宽度
        var height = window.innerHeight; //窗口高度
        var k = width / height; //窗口宽高比
        var s = 30; //三维场景显示范围控制系数，系数越大，显示的范围越大
        var camera = new THREE.OrthographicCamera(-s * k, s * k, s, -s, 1, 1000);
        camera.position.set(0, 200, 0); //设置相机位置
        camera.lookAt(this.scene.position); //设置相机方向(指向的场景对象)
        this.camera = camera;
    }
    initRender() { //渲染器
        let renderer = new THREE.WebGLRenderer({
            antialias: true
        });
        let container = document.getElementById('room');
        renderer.setSize(container.offsetWidth, container.offsetHeight);
        container.appendChild(renderer.domElement);
        //告诉渲染器需要阴影效果
        // renderer.shadowMap.enabled = true;
        // renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.setClearColor(new THREE.Color('#212129'));
        this.renderer = renderer;
    }
    initModalGroup() {
        this.slot_no_group = null; // 车位号组
        this.slot_area_group = null; // 车位方框组
        this.barrier_group = null; // barrier组
        this.initSlotLine_group = null;
        this.RoadLineSigns_group = null;
    }
    initData(option, index, mapParams, callback, originX, originZ) {//初始化渲染
        this.slot_no_group = new THREE.Group(); // 车位号组
        this.slot_area_group = new THREE.Group(); // 车位方框组
        this.barrier_group = new THREE.Group(); // barrier组
        this.initSlotLine_group = new THREE.Group();
        this.RoadLineSigns_group = new THREE.Group();

        this.originX = originX;
        this.originZ = originZ;
        var data = option['entities_groups'];
        this.rawOption = option;
        this.mapParams = mapParams;
        console.log(data);
        // initSlotLine-画线，RoadLineSigns-画区域，initSlotNumber-车位号，slotAreaRegion-画车位区域(专用)，initSlotArea-画块，basicWall-画块(墙体)
        let dataType = null
        for (let i = 0; i < data.length; i++) {
            if (data[i]['entities']) {
                dataType = data[i]['entities'][0]['type'] + '';
                if (this.drawModalFunc[dataType]) {
                    this.drawModalFunc[dataType]['func'](data[i]['entities'], this[this.drawModalFunc[dataType]['group']], this.drawModalFunc[dataType]['z'], true, mapParams['bg'][data[i]['name']])
                }
            }
        }
        if (callback) callback()
    }
    // 清空模型
    clearModal() {
        if (this.scene && this.scene.children) {
            this.initModalGroup();
            if (this.wideLine && this.wideLine.geometry) {
                this.wideLine.geometry.dispose();
                this.wideLine.material.dispose();
                this.scene.remove(this.wideLine);
            }
            if (this.thinLine && this.thinLine.geometry) {
                this.thinLine.geometry.dispose();
                this.thinLine.material.dispose();
                this.scene.remove(this.thinLine);
            }
            let xlType = this.scene.children.filter(function (obj) {
                return obj.type == 'Group'
            })
            for (let i = 0; i < xlType.length; i++) {
                for (let j = 0; j < xlType[i]['children'].length; j++) {
                    if (xlType[i]['children'][j]['type'] == 'Mesh') {
                        xlType[i]['children'][j].geometry.dispose();
                        xlType[i]['children'][j].material.dispose();
                    }
                }
                this.scene.remove(xlType[i]);
            }
        }
    }
    // 清除 type 类型的 obj
    clearSlot(type) {
        if (this.scene && this.scene.children) {
            this.scene.children.forEach(obj => {
                if (obj.userData && obj.userData.slot == type) {
                    this.scene.remove(obj);
                }
                if (obj.children.length > 0) {
                    obj.children.forEach(item => {
                        if (item.userData && item.userData.slot == type) {
                            this.scene.remove(obj);
                        }
                    })
                }
            })
        }
    }
    /**
     * 清除模型，模型中有 group 和 scene,需要进行判断
     * @param scene
     * @returns
     */
    clearScene() {
        // 从scene中删除模型并释放内存
        if (this.scene.length > 0) {
            for (var i = 0; i < this.scene.length; i++) {
                var currObj = this.scene[i];

                // 判断类型
                if (currObj instanceof THREE.Scene) {
                    var children = currObj.children;
                    for (var i = 0; i < children.length; i++) {
                        deleteGroup(children[i]);
                    }
                } else {
                    deleteGroup(currObj);
                }
                this.scene.remove(currObj);
            }
        }
        console.log(this.scene, '清空后的 scene')
    }

    // 删除group，释放内存
    deleteGroup(group) {
        //console.log(group);
        if (!group) return;
        // 删除掉所有的模型组内的mesh
        group.traverse(function (item) {
            if (item instanceof THREE.Mesh) {
                item.geometry.dispose(); // 删除几何体
                item.material.dispose(); // 删除材质
            }
        });
    }
    initMap(option, index, mapParams, callback, originX, originZ) {
        this.clearScene()
        this.initData(option, index, mapParams, callback, originX, originZ)
    }
    initLight() {
        var light = new THREE.DirectionalLight("#ffffff", 0.28, 100);
        light.position.set(0, 1, 1200); //default; light shining from top
        light.castShadow = true; // default false
        this.scene.add(light);
        //环境光
        // var ambient = new THREE.AmbientLight("#ffffff");
        // this.scene.add(ambient);

        // 点光源
        var point = new THREE.PointLight(0xffffff);
        point.position.set(0, 200, 0); //点光源位置
        this.scene.add(point); //点光源添加到场景中
        //环境光
        var ambient = new THREE.AmbientLight(0x888888);
        this.scene.add(ambient);
    }
    initModel() {
        this.initLight()
        // this.axisHelper()
        // 确认页面需要点选车位
        const _self  = this
        if (_self.from === 'confirm') {
            document.getElementById('room').addEventListener('touchstart', function(){
                _self.touchTime = Date.now()
            }, false);
            document.getElementById('room').addEventListener('touchend', _self.onmousedbclick, false);
        }
    }
    orbitHelper() { //创建摄像头辅助
        let controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        controls.target = new THREE.Vector3(0, 0, 0);//控制焦点
        controls.autoRotate = false;//将自动旋转关闭
        // controls.enableRotate = false;
        // controls.minPolarAngle = -Math.PI/2;
        // controls.maxPolarAngle = Math.PI/2;
        // controls.minAzimuthAngle = 0;
        // controls.maxAzimuthAngle = 0;
        // controls.maxZoom = 20;
        // controls.minZoom = 1;
        new THREE.Clock();
        this.controls = controls;
    }
    gridHelper() { // 创建网格辅助
        var gridHelper = new THREE.GridHelper(20, 20, 0x404040, 0x404040);
        this.scene.add(gridHelper);
    }
    statsHelper() { //性能插件
        this.stats = new Stats();
        document.body.appendChild(this.stats.dom);
    }
    axisHelper() { //坐标轴辅助
        var helper = new THREE.AxisHelper(3000);
        this.scene.add(helper);
    }
    onWindowResize() { //自适应
        var parent = document.getElementById("room");
        this.camera.aspect = parent.clientWidth / parent.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(parent.clientWidth, parent.clientHeight);
    }
    render() { //渲染
        if (this.stats) this.stats.update();
        this.renderer.render(this.scene, this.camera);
    }
    animate() {
        this.render()
        requestAnimationFrame(this.animate.bind(this));
        // if (this.selectObject != undefined && this.selectObject != null) {
        //     this.renderDiv(this.selectObject);
        // }
    }
    basicWall(dataList, floor, y, ground_show, color) { //渲染墙体
        console.log(dataList, floor, y, ground_show, color);
        var str
        for (var i = 0; i < dataList.length; i++) {
            var arryShape = [];
            str = dataList[i].path;
            for (var j = 0; j < str.length; j++) {
                arryShape.push(new THREE.Vector3(str[j].x, str[j].y, str[j].z));
            }
            var californiaShape = new THREE.Shape(arryShape);
            var extrudeSettings = {
                steps: 1,
                amount: 2,
                bevelEnabled: false,
            };
            var geometry = new THREE.ExtrudeBufferGeometry(californiaShape, extrudeSettings);
            var material = new THREE.MeshPhongMaterial({
                color: color,
                depthTest: true
            }); //材质对象
            var mesh = new THREE.Mesh(geometry, material); //网格模型对象
            mesh.position.y = 5;
            mesh.position.x = this.originX;
            mesh.position.z = this.originZ;
            mesh.rotateX(-Math.PI / 2);
            // mesh.rotateZ(Math.PI / 4);
            floor.add(mesh);
        }
        floor.visible = ground_show;
        this.scene.add(floor);
    }
    initNoAndArea(dataList, floor, y, ground_show, color) {
        const self = this
        self.slotAreaRegion(dataList, self.slot_area_group, y, ground_show, color);
        self.initSlotNumber(dataList, self.slot_no_group, y, ground_show, self.mapParams['bg'].slot_number);
    }
    initSlotArea(data, floor, y, ground_show, color) { //渲染车位方块
        if (!data) return
        let dataList = data.filter((item) => {
            return item.slot_name;
        })
        let mesh;
        for (let i = 0; i < dataList.length; i++) {
            let arryShape = []
            let str = dataList[i].path;
            for (let j = 0; j < str.length; j++) {
                arryShape.push(new THREE.Vector3(str[j].x, str[j].y, 0))
            }
            let californiaShape = new THREE.Shape(arryShape);
            let extrudeSettings = {
                steps: 1,
                depth: 0.1,
                amount: 0.1,
                bevelEnabled: false,
            };
            let geometry = new THREE.ExtrudeBufferGeometry(californiaShape, extrudeSettings)
            let material = new THREE.MeshPhongMaterial({
                color: color,
                depthTest: true
            }); //材质对象
            mesh = new THREE.Mesh(geometry, material); //网格模型对象
            mesh.name = dataList[i].slot_name;
            const path = []
            dataList[i].path.filter(item => { path.push(item.x); path.push(item.y); path.push(8); })
            mesh.userData = {
                "slot": 'slot',
                "path": path
            }
            floor.add(mesh);
        }

        floor.rotateX(-Math.PI / 2);
        floor.position.x = this.originX;
        floor.position.z = this.originZ;
        floor.position.y = y;
        floor.visible = ground_show;
        floor.name = 'chewei';
        this.scene.add(floor);
    }
    initSlotLine(dataList, floor, y, ground_show, color) { //渲染车位线
        if (!dataList) return
        for (var i = 0; i < dataList.length; i++) {
            var str = dataList[i].path;
            var geometry = new THREE.Geometry();
            for (var j = 0; j < str.length; j++) {
                geometry.vertices.push(new THREE.Vector3(str[j].x, str[j].y, str[j].z));
            }
            var material = new THREE.LineBasicMaterial({
                color: color
            });
            var line = new THREE.Line(geometry, material);
            line.position.y = y;
            line.position.x = this.originX;
            line.position.z = this.originZ;
            line.rotateX(-Math.PI / 2);
            floor.add(line);
        }
        floor.visible = ground_show;
        this.scene.add(floor)
    }
    getFontLoaderInit (){
        this.FontLoader = new THREE.Font(FONT_JSON_DATA);
    }
    initSlotNumber(dataList, floor, y, ground_show, color) { //渲染车位号
        if (!dataList) return
        let _this = this;
        console.log('dataList.length,floor', dataList.length,floor) 
        for (let i = 0; i < dataList.length; i++) {
            const get_centroid = _this.get_centroid(dataList[i].path)
            // 生成二维字体模型
            var shapes = _this.FontLoader.generateShapes(dataList[i].name, 0.8, 1);
            var fontGeometry = new THREE.ShapeGeometry(shapes);
            // // 材质
            var fontMaterial = new THREE.MeshLambertMaterial({
                color: color,
                side: THREE.DoubleSide
            });

            // // 绑定盒子模型
            fontGeometry.computeBoundingBox();
            fontGeometry.center()
            let FONT = new THREE.Mesh(fontGeometry, fontMaterial);
            // // x = 0,位置
            FONT.position.x = get_centroid[0] + _this.originX;
            FONT.position.y = get_centroid[1] - _this.originZ;
            FONT.position.z = 4;
            FONT.rotateZ(_this.angle(dataList[i].path));
            floor.add(FONT)
        }        
        floor.visible = ground_show;
        floor.rotateX(-Math.PI / 2);
        _this.scene.add(floor);
    }
    get_centroid(cluster) {
        let x = 0;
        let y = 0;
        // let coord_num = cluster.length;
        let coord_num = 4;
        let lat = 0;
        let lon = 0;
        // for (let i = 0; i < cluster.length; i++) {
        for (let i = 0; i < 4; i++) {
            lat = cluster[i]['x'];
            lon = cluster[i]['y'];
            x += lat;
            y += lon;
        }
        x /= coord_num
        y /= coord_num
        let m = [x, y]
        return m
    }
    RoadLineSigns(dataList, floor, y, ground_show, color) {
        if (!dataList) return
        var str;
        for (var i = 0; i < dataList.length; i++) {
            var arryShape = []
            str = dataList[i].path;
            for (var j = 0; j < str.length; j++) {
                arryShape.push(new THREE.Vector3(str[j].x, str[j].y, str[j].z))
            }
            var californiaShape = new THREE.Shape(arryShape);
            var geometry = new THREE.ShapeBufferGeometry(californiaShape)
            var material = new THREE.MeshBasicMaterial({
                color: color
            }); //材质对象
            var mesh = new THREE.Mesh(geometry, material); //网格模型对象
            mesh.rotateX(-Math.PI / 2);
            mesh.position.y = y;
            mesh.position.x = this.originX;
            mesh.position.z = this.originZ;
            floor.add(mesh)
        }
        floor.visible = ground_show
        this.scene.add(floor);
    }
    slotAreaRegion(dataList, floor, y, ground_show, color) {
        if (!dataList) return;
        var str;
        var mesh;
        var material = new THREE.MeshBasicMaterial({
            color: color
        }); //材质对象
        for (var i = 0; i < dataList.length; i++) {
            var arryShape = []
            str = dataList[i].path;
            for (var j = 0; j < str.length; j++) {
                arryShape.push(new THREE.Vector3(str[j].x, str[j].y, str[j].z))
            }
            var californiaShape = new THREE.Shape(arryShape);
            var geometry = new THREE.ShapeBufferGeometry(californiaShape)
            mesh = new THREE.Mesh(geometry, material); //网格模型对象
            mesh.name = dataList[i].name;
            const path = []
            dataList[i].path.filter(item => { path.push(item.x); path.push(item.y); path.push(8); })
            mesh.userData = {
                "slot": 'slot',
                "path": path
            }
            floor.visible = ground_show
            floor.add(mesh);
        }
        floor.rotateX(-Math.PI / 2);
        floor.position.y = y;
        floor.position.x = this.originX;
        floor.position.z = this.originZ;
        this.scene.add(floor);
    }
    // 计算多个坐标点的中心点(地理坐标系--平面直角坐标系)（用于车位号在车位方块内居中显示）
    get_centroid(cluster) {
        let x = 0;
        let y = 0;
        // let coord_num = cluster.length;
        let coord_num = 4;
        let lat = 0;
        let lon = 0;
        // for (let i = 0; i < cluster.length; i++) {
        for (let i = 0; i < 4; i++) {
            lat = cluster[i]['x'];
            lon = cluster[i]['y'];
            x += lat;
            y += lon;
        }
        x /= coord_num
        y /= coord_num
        let m = [x, y]
        return m
    }
    // 计算两点距离
    distance(p1, p2) {
        let dx = Math.abs(p2.x - p1.x);
        let dy = Math.abs(p2.y - p1.y);
        let dis = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
        return dis;
    }
    // 确定两点与x轴夹角（选取下标为0、1和1、2两点作比较，选出车位方块长边，根据长边与x轴夹角计算出车位方块相对于x轴的旋转角度，用于设置车位号的旋转，使车位号与车位方块长边保持平行）
    angle(point) {
        if (this.distance(point[0], point[1]) > this.distance(point[1], point[2])) {
            let a = point[0];
            let b = point[1];
            if (a.x > b.x) {
                var radian = Math.atan2(a.y - b.y, a.x - b.x); // 返回来的是弧度
            } else {
                var radian = Math.atan2(b.y - a.y, b.x - a.x); // 返回来的是弧度
            }
            // var angle = 180 / Math.PI * radian; // 根据弧度计算角度
            return radian;
        } else {
            let a = point[1];
            let b = point[2];
            if (a.x > b.x) {
                var radian = Math.atan2(a.y - b.y, a.x - b.x); // 返回来的是弧度
            } else {
                var radian = Math.atan2(b.y - a.y, b.x - a.x); // 返回来的是弧度
            }
            // var angle = 180 / Math.PI * radian; // 根据弧度计算角度
            return radian;
        }
    }
    // 画细线
    drawThinLine(positions) {
        if (this.thinLine && this.thinLine.geometry) {
            this.thinLine.geometry.dispose();
            this.thinLine.material.dispose();
            this.scene.remove(this.thinLine);
        }
        if (!positions) return
        console.log(positions)
        var geometry = new THREE.LineGeometry();
        geometry.setPositions(positions);
        const material = new THREE.LineMaterial({
            color: '#14f408',
            linewidth: 1, // in pixels
            dashed: false
        });
        material.resolution.set(window.innerWidth, window.innerHeight)
        // line
        this.thinLine = new THREE.Line2(geometry, material);
        this.thinLine.rotateX(-Math.PI / 2);
        // this.thinLine.position.x = 300;

        this.thinLine.position.y = 5;
        this.thinLine.position.x = this.originX;
        this.thinLine.position.z = this.originZ;
        this.scene.add(this.thinLine);
    }
    // 画粗线
    drawWideLine(positions) {
        if (this.wideLine && this.wideLine.geometry) {
            this.wideLine.geometry.dispose();
            this.wideLine.material.dispose();
            this.scene.remove(this.wideLine);
        }
        var geometry = new THREE.LineGeometry();
        geometry.setPositions(positions);
        const material = new THREE.LineMaterial({
            color: '#14f408',
            linewidth: 2, // in pixels
            dashed: false
        });
        material.resolution.set(window.innerWidth, window.innerHeight)
        // line
        this.wideLine = new THREE.Line2(geometry, material);
        this.wideLine.rotateX(-Math.PI / 2);
        // this.wideLine.position.x = 300;

        this.wideLine.position.x = this.originX;
        this.wideLine.position.z = this.originZ;
        this.scene.add(this.wideLine);
    }
    renderDiv(dataNumber, object) { //浮动窗口
        console.log('renderDiv',dataNumber, object)
        this.box.id = 'label'
        if (dataNumber === 0) {
            this.box.remove()
            this.callbackSlotNo({ slot_no: '', floor_id: '' })
            return false
        } else {
            document.getElementById('room').appendChild(this.box)
        }
        // 获取窗口的一半高度和宽度
        var halfWidth = window.innerWidth / 2;
        var halfHeight = window.innerHeight / 2;

        // 逆转相机求出二维坐标
        // var vector = object.position.clone().project(this.camera);

        // 修改 div 的位置
        // this.box.style.display = 'block'
        // box.style.left = (vector.x * halfWidth + halfWidth) + 'px'
        // box.style.top = (-vector.y * halfHeight + halfHeight) + 'px'
        this.box.style.left = (this.donX + 15) + 'px'
        this.box.style.top = (this.donY + 15) + 'px'
        // this.box.innerHTML = "车位号:" + object.name
        if (object && object.name) {
            this.box.innerHTML = "车位号:" + object.name
            this.callbackSlotNo({ slot_no: object.name, floor_id: this.rawOption.floor_id })
        } else {
            this.box.innerHTML = '请勾选车位号'
            this.callbackSlotNo({ slot_no: '', floor_id: ''})
        }
    }
    renderPOI(slot_position) { //浮动窗口
        console.log('renderPOI',slot_position)
        this.box.id = 'label'
        document.getElementById('room').appendChild(this.box)
        this.box.style.left = (this.donX + 15) + 'px'
        this.box.style.top = (this.donY + 15) + 'px'
       
        this.box.innerHTML = '已选择'
        this.callbackSlotNo({ slot_no: '', floor_id: this.rawOption.floor_id,slot_position: slot_position})
    }
    //车位点击事件 大头针标记出所选的车位
    onMouseDblclick(event) {
        console.log(event);
        if((Date.now() - this.touchTime) > 300){
            return
        }
        // 获取 raycaster 和所有模型相交的数组，其中的元素按照距离排序，越近的越靠前
        var intersects = this.getIntersects(event);
        console.log('intersects',intersects);
        // 先清除大头针lock(原需求是点击车位号加大头针，所以点击时需先清除大头针再重绘)
        this.clearSlot('lock')
        // 清除细线 车位边框
        this.drawThinLine()
        // 获取选中最近的 Mesh 对象
        if (intersects.length != 0 && intersects[0].object instanceof THREE.Mesh) {
            // 判断和上一次点击的车位相同，则清除selectObject，取消背景颜色等状态
            if (this.selectObject == intersects[0].object) {
                this.dataNumber = 0
                this.selectObject = intersects[0].object;
            } else {
                this.selectObject = intersects[0].object;
                this.dataNumber = 1
                // 根据位置标记大头针
                // const point = intersects[0].point
                // this.initLock({x:point.x - this.originX, y:-point.z+this.originZ, z:point.y}, 'lock')
            }
            console.log('this.dataNumber, this.selectObject',this.dataNumber, this.selectObject,)
            this.renderDiv(this.dataNumber, this.selectObject)
            this.changeMaterial(this.selectObject);
            this.render()
        } else {
            this.selectObject=''
            const slot_p = this.getIntersectsPlane(event) 
            // const slot_position = {
            //     x: slot_p.x,
            //     y: slot_p.z,
            //     z: slot_p.y,
            // }
            const slot_position = {
                x: slot_p.x - this.originX,
                y: slot_p.z + this.originZ,
                z: 0,
            }
            console.log("未选中 Mesh!",slot_position);
            //先清除大头针后添加大头针标记位置
            this.initLock({x:slot_p.x - this.originX, y:-slot_p.z+this.originZ, z:slot_p.y}, 'lock')
            this.render()
            this.renderPOI(slot_position)
        }
    }
    /* 获取射线与平面相交的交点 */
    getIntersectsPlane(event) {
        var raycaster = new THREE.Raycaster();
        var mouse = new THREE.Vector2();
        mouse.x = (event.changedTouches[0].clientX / document.getElementById('room').clientWidth) * 2 - 1;
        mouse.y = -(event.changedTouches[0].clientY / document.getElementById('room').clientHeight) * 2 + 1;
        var normal = new THREE.Vector3(0, 1, 0);
        /* 创建平面 */
        var planeGround = new THREE.Plane(normal, 0);
        /* 从相机发出一条射线经过鼠标点击的位置 */
        raycaster.setFromCamera(mouse, this.camera);
        /* 获取射线 */
        var ray = raycaster.ray;
        /* 计算相机到射线的对象，可能有多个对象，返回一个数组，按照距离相机远近排列 */
        var intersects = ray.intersectPlane(planeGround);
        /* 返回向量 */
        return intersects;
    }
    changeMaterial(object) { //更换材质
        console.log(object, 888888)
        if (this.dataNumber == 0) {
            var material = new THREE.MeshBasicMaterial({
                color: "#212129",
            });
            this.selectObject = ''
        } else {
            var material = new THREE.MeshBasicMaterial({
                color: "#161621",// "#14f408",
            });
            if (object.userData && object.userData.path) {
                this.drawThinLine(object.userData.path)
            }
        }
        object.material = material;
    }
    locateSlot(slot_no) {
        console.log('即将高亮车位号：' + slot_no);
        this.drawThinLine();
        this.scene.traverse(obj => {
            if (obj.type == "Mesh" && obj.name) {
                if (slot_no && obj.name == slot_no) {
                    obj.material = new THREE.MeshBasicMaterial({
                        color: '#161621',
                        side: THREE.DoubleSide
                    });
                    this.drawThinLine(obj.userData.path)
                } else {
                    obj.material = new THREE.MeshBasicMaterial({
                        color: '#212129',
                        side: THREE.DoubleSide
                    });
                    
                }
            }
        })
    }
    initLock(dataList, imgName) { //显示车位大头针
        this.createLockTextureMesh(dataList, new THREE.Group(), imgName)
    }
    initCar(dataList, imgName, offset_x, offset_y) { //显示车辆
        this.clearSlot(imgName)
        this.createTextureMesh(dataList, new THREE.Group(), imgName)
    }
    createLockTextureMesh(dataList, floor, imgName) {
        // var zoom = parseFloat(loaclInfo.map_info.zoom)
        var geometry = new THREE.PlaneGeometry(2, 2, 1, 1);
        //几何体创建纹理坐标 
        console.log(dataList, 'local_map_id一致')
        geometry.vertices[0].uv = new THREE.Vector2(0, 0);
        geometry.vertices[1].uv = new THREE.Vector2(1, 0);
        geometry.vertices[2].uv = new THREE.Vector2(1, 1);
        geometry.vertices[3].uv = new THREE.Vector2(0, 1);
        var texture = THREE.ImageUtils.loadTexture(
             "../images/" + imgName + ".png",
            
            null, function (t) { }
        );
        var material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            side: THREE.DoubleSide
        });
        var mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(dataList.x + this.originX, 15, -dataList.y + this.originZ)
        // mesh.position.z = 2
        mesh.rotateX(-Math.PI / 2)
        mesh.userData = {
            "slot": imgName,
        }
        console.log(mesh, 'lock')
        floor.add(mesh)
        this.scene.add(floor);
    }
    createTextureMesh(dataList, floor, imgName, offset_x, offset_y) {
        // var zoom = parseFloat(loaclInfo.map_info.zoom)
        var geometry = new THREE.PlaneGeometry(2, 2, 1, 1);
        if ((dataList.local_map_id && this.rawOption.floor_id == dataList.local_map_id) || !dataList.local_map_id) {
            //几何体创建纹理坐标 
            geometry.vertices[0].uv = new THREE.Vector2(0, 0);
            geometry.vertices[1].uv = new THREE.Vector2(1, 0);
            geometry.vertices[2].uv = new THREE.Vector2(1, 1);
            geometry.vertices[3].uv = new THREE.Vector2(0, 1);
            var texture = THREE.ImageUtils.loadTexture(
                "../../images/" + imgName + ".png",
                null, function (t) { }
            );
            var material = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
                side: THREE.DoubleSide
            });
            var mesh = new THREE.Mesh(geometry, material);
            console.log(dataList, 1111)
            mesh.position.set(dataList.x + this.originX, 15, -dataList.y + this.originZ)
            mesh.rotateX(-Math.PI / 2)
            if (dataList.angle) {
                let piVal = (dataList.angle - 90) * (Math.PI / 180);
                mesh.rotateZ(piVal);
            }
            mesh.userData = {
                "slot": imgName
            }
            console.log(mesh)
            floor.add(mesh)
            this.scene.add(floor);

            // } else {
            //     return false
        }
    }
    getIntersects(event) { // 获取鼠标点击的物体,如果要获取鼠标点击的平面(非物体)的坐标,见mapLink.js的getIntersects方法
        // 声明 raycaster 和 mouse 变量
        var raycaster = new THREE.Raycaster();
        var mouse = new THREE.Vector2();
        // 通过鼠标点击位置,计算出 raycaster 所需点的位置,以屏幕为中心点,范围 -1 到 1
        mouse.x = (event.changedTouches[0].clientX / document.getElementById('room').clientWidth) * 2 - 1;
        mouse.y = -(event.changedTouches[0].clientY / document.getElementById('room').clientHeight) * 2 + 1;
        //通过鼠标点击的位置(二维坐标)和当前相机的矩阵计算出射线位置
        raycaster.setFromCamera(mouse, this.camera);
        // 获取与射线相交的对象数组，其中的元素按照距离排序，越近的越靠前
        var children_ = []
        this.scene.traverse(obj => {
            if (obj.type == "Mesh" && obj.userData.slot == 'slot') {
                obj.material = new THREE.MeshBasicMaterial({
                    color: '#212129',
                });
                children_.push(obj)

            }
        })
        var intersects = raycaster.intersectObjects(children_);
        //返回选中的对象
        return intersects;

    }
    lineNotClosed(dataList, floor, z, ground_show, color) { //渲染线 不闭合类
        if (!dataList) return
        // 5车道分道线 6减速带 7路标
        for (var i = 0; i < dataList.length; i++) {
            var str
            if (dataList[i].data_type == 1001) {
                str = JSON.parse(dataList[i].points)
                var geometry = new THREE.Geometry();
                for (var j = 0; j < str.length; j++) {
                    geometry.vertices.push(new THREE.Vector3(str[j].x, str[j].y, z));
                }
                var material = new THREE.LineBasicMaterial({
                    color: color,
                    linewidth: 35
                });
                var line = new THREE.Line(geometry, material);
                line.position.z = z
                floor.visible = ground_show
                floor.add(line)
                this.scene.add(floor)
            }
        }
    }
    start_car(dataList, loaclInfo, index, floor, z, ground_show) { // 创建导航轨迹 
        if (!dataList) return
        var vector = []
        var zoom = parseFloat(loaclInfo.map_info.zoom)
        var offset_x = parseFloat(loaclInfo.map_info.offset_x)
        var offset_y = parseFloat(loaclInfo.map_info.offset_y)
        for (var i = 0; i < dataList.length; i++) {
            if (loaclInfo.local_map_id[index] === dataList[i].mapId) {
                vector.push(new THREE.Vector3((parseFloat(dataList[i].xPos) + offset_x) * zoom, (parseFloat(dataList[i].yPos) + offset_y) * zoom, z))
            }

        }

        if (vector.length == '') {
            return false
        }
        // var curve = new THREE.CatmullRomCurve3([
        //     new THREE.Vector3(0, 0, 0),
        //     new THREE.Vector3(100, 500, 0),
        //     new THREE.Vector3(500, 500, 0),
        //     new THREE.Vector3(500, 800, 0)
        // ], false /*是否闭合*/ )
        var curve = new THREE.CatmullRomCurve3(vector, false)
        var progress = 0;
        var tubeGeometry = new THREE.TubeGeometry(curve, 64, 15, 100, false);
        var textureLoader = new THREE.TextureLoader();
        // var texture = textureLoader.load('../../../assets/libs/map/track.png');
        // 设置阵列模式为 RepeatWrapping
        texture.wrapS = THREE.RepeatWrapping
        texture.wrapT = THREE.RepeatWrapping
        // 设置x方向的偏移(沿着管道路径方向)，y方向默认1
        //等价texture.repeat= new THREE.Vector2(20,1)
        texture.repeat.x = 20;
        var tubeMaterial = new THREE.MeshPhongMaterial({
            map: texture,
            transparent: true,
        });
        var tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
        tube.position.z = z
        //scene.add(tube)
        floor.add(tube)
        floor.visible = ground_show
        this.scene.add(floor)

        nitcar()

        function nitcar() {
            requestAnimationFrame(nitcar);
            texture.offset.x -= 0.02
            if (progress > 1.0) {
                return;
            }
            progress += 0.0005;

            if (curve) {
                let point = curve.getPoint(progress);
                let point_car = curve.getPoint(progress + 0.0003);
                if (point && point.x) {
                    // cubeBox.position.set(point.x, point.y);
                    // cubeBox.lookAt(point_car.x, point_car.y,z);
                    // cubeBox.rotateY(Math.PI /2);
                }
            }
        }

    }
    lambertBox() {
        var cubeGeometry = new THREE.BoxGeometry(10, 10, 10);
        var cubeMaterial = new THREE.MeshLambertMaterial({
            color: 0x00ffff
        });
        let cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        cube.position.x = 5;
        cube.position.y = 5;
        cube.position.z = -5;
        //告诉立方体需要投射阴影
        cube.castShadow = true;
        this.scene.add(cube);
    }

}

export default basicThree


```

最后在模块文件中，开始获取数据动态渲染吧

```
  import basicThree from '@/utils/stationMap/map_type';
  let threeJs = null ;
  let dataList = [];
  threeJs = new basicThree({callback: this.callbackSlotNo });
  threeJs.initModel();
  ...
  //获取数据后创建楼层
  threeJs.initMap(dataList[this.theFloor], 2, mapParams, this.init, this.offset_x, this.offset_y);


```

由于需要渲染的数据太多，在以前的老 vue2 项目上继续开发就会遇到问题，升级到 vue3 吧又会出现兼容性问题，我现在进退两难，最后我决定求稳，不升级框架了，因为我也没时间去测试和把老业务全搞过来，太需要时间了，所以，求稳吧，逐步优化性能。这就用到了，我之前写的另一篇文章，如何进行前端项目优化的一步一步操作。除了及时销毁变量和定时器，少用闭包之外，来看看我的另一篇文章

关于性能优化，我做了哪些？(juejin.cn/post/731189…[1])
----------------------------------------

  

[1]

https://juejin.cn/post/7311894381393100851: https://juejin.cn/post/7311894381393100851

> 原文链接: https://juejin.cn/post/7366084203954487322
> 
> 作者：为了 WLB 努力

参考资料

[1]

https://juejin.cn/post/7311894381393100851: _https://juejin.cn/post/7311894381393100851_

Node 社群

```
我组建了一个氛围特别好的 Node.js 社群，里面有很多 Node.js小伙伴，如果你对Node.js学习感兴趣的话（后续有计划也可以），我们可以一起进行Node.js相关的交流、学习、共建。下方加 考拉 好友回复「Node」即可。

   “分享、点赞、在看” 支持一下

```