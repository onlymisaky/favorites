> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/11PMoorLTfaKXGgYftpScA)

```
大厂技术  高级前端  Node进阶

点击上方 程序员成长指北，关注公众号

回复1，加入高级Node交流群

```

作者：前端了了 liaoliao

链接：https://juejin.cn/post/7137192060045492231

### 实战目的

根据不同的产品配合接口展示相应的描述。根据选择的场景及其物品实现可视化的产品展示效果。效果展示

> 支持不同位置展示不同描述：配合数据配置渲染不同桢的效果

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/9Z5K66tFPiax49af9tF6YQg4iaFwUckibQYVHaeGpbjcvEzpL0QAIHjMTmG9oF6KnyzmMSP7Qia6SO5yzUV9swPxew/640?wx_fmt=gif&from=appmsg)

> 根据选中的产品，切换相应产品效果

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/9Z5K66tFPiax49af9tF6YQg4iaFwUckibQYXn99Wn7TRicI0XRoIWzKosoqO32eHWtAk9jMgO1zDELgElvlxzMPHyA/640?wx_fmt=gif&from=appmsg)

> 根据选中场景，切换相应的场景

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/9Z5K66tFPiax49af9tF6YQg4iaFwUckibQYeukIoKfRfPsrffSnsicWjKSJwkbc7pqKpWT489ibH3Tx2d2icQ6JGGKRg/640?wx_fmt=gif&from=appmsg)

### 实现思路

> 封装一个 Three 的函数，支持设置相机、场景、渲染函数，添加模型解析器，添加物品，整合渲染效果，添加事件监听，完善模型动画展示

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/9Z5K66tFPiax49af9tF6YQg4iaFwUckibQYLFGtO55EFZNFRZVJX9T4NkaErq2llkT9amfYJUkxHkFflwB4DTvvBA/640?wx_fmt=other&from=appmsg)

### 具体实现

> 使用 vite 搭建一个项目，后安装 Three 支持，进行具体实现

#### 准备 vue 项目

*   使用 Vite + Vue[1] 搭建
    

```
# npm 6.x
npm init vite@latest my-vue-app --template vue

# npm 7+, 需要额外的双横线：
npm init vite@latest my-vue-app -- --template vue

# yarn
yarn create vite my-vue-app --template vue

# pnpm
pnpm create vite my-vue-app -- --template vue


```

*   根据自己的环境选择自己的搭建代码
    

```
npm init vite@latest my-vue-app -- --template vue


```

*   根据提示创建项目
    

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/9Z5K66tFPiax49af9tF6YQg4iaFwUckibQYkYRw2WISToupdeJdBZZjMjDM8cZDsBYNtMkibs8iaAgp2icsePlj1Yiczg/640?wx_fmt=other&from=appmsg)![](https://mmbiz.qpic.cn/sz_mmbiz_png/9Z5K66tFPiax49af9tF6YQg4iaFwUckibQYdyhVwXRVuVoL4DRLgqEKyicCnRjeSTLKaIyZmvPWicxwhj76cOCib1XoQ/640?wx_fmt=png&from=appmsg)

*   确认项目正常访问
    

![](https://mmbiz.qpic.cn/sz_mmbiz_png/9Z5K66tFPiax49af9tF6YQg4iaFwUckibQYFZDibz0yiamo9pXVnA5PWN2W2v4ff6QlRc1dz7uDRHOfJIpnXWPgBdzw/640?wx_fmt=png&from=appmsg)

#### 安装 Three

```
npm install --save three


```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/9Z5K66tFPiax49af9tF6YQg4iaFwUckibQYbcRJAak9t0aR19Jz0Fuv1tDBUGMBKwuE9zWlh5mHEub8Us1ib8eveQA/640?wx_fmt=png&from=appmsg)

#### 删除无用代码，添加渲染节点

> 增加一个场景展示的 div，用于渲染 3D 信息

![](https://mmbiz.qpic.cn/sz_mmbiz_png/9Z5K66tFPiax49af9tF6YQg4iaFwUckibQY9cOxNQ1phNNblyLQUnGnANmUlnrHVphf5rBfEjs3YPnyjrPYmCtpicw/640?wx_fmt=png&from=appmsg)

### Three 实战

#### 加载场景及控制器

##### 初始化场景 HDR 图片

```
// 初始化场景
  initScene() {
    this.scene = new THREE.Scene();
    this.setEnvMap("001");
  }
 // 场景设置
  setEnvMap(hdr) {
    new RGBELoader().setPath("./hdr/").load(`${hdr}.hdr`, (texture) => {
      texture.mapping = THREE.EquirectangularRefractionMapping;
      this.scene.background = texture;
      this.scene.environment = texture;
    });
  }


```

##### 确定相机位置

```
 initCamera() {
    this.camera = new THREE.PerspectiveCamera(
      45, // 角度
      window.innerWidth / window.innerHeight, // 比例
      0.25, // 近
      200 // 远
    );
    // 相机位置
    this.camera.position.set(-1.8, 0.6, 2.7);
  }


```

##### 渲染：根据相机位置和场景图渲染初始画面

```
render() {
    this.renderer.render(this.scene, this.camera);
}


```

##### 动画：渲染初始画面

```
animate() {
    this.renderer.setAnimationLoop(this.render.bind(this));
}


```

> 此时，这个页面只能展示出部分的静态画面，要想通过鼠标控制相机的位置，则需要增加控制器

![](https://mmbiz.qpic.cn/sz_mmbiz_png/9Z5K66tFPiax49af9tF6YQg4iaFwUckibQYVmOYqY0tVCVkWwZIqQ2kDlhseIe7HExKCb0UdtvJNOAe7w9JIpicdRQ/640?wx_fmt=png&from=appmsg)

##### 引入控制器

```
// 控制器
  initControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
  }


```

> 加入控制器后，则可以通过鼠标的滑动控制相机的角度

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/9Z5K66tFPiax49af9tF6YQg4iaFwUckibQY471eXGqGuY58zvsssQbSjupWU3EGEy1PkPU6PsPyWZKgNTBv4A18gg/640?wx_fmt=gif&from=appmsg)

#### 增加产品模型

##### 引入模型解析器

```
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";


```

##### 添加模型到场景里

```
setModel(modelName) {
    const loader = new GLTFLoader().setPath("/gltf/");
    loader.load(modelName, (gltf) => {
      this.model = gltf.scene.children[0];
      this.scene.add(gltf.scene);
    });
  }
  // 添加模型
  async addMesh() {
    let res = await this.setModel("bag2.glb");
  }


```

> 模型已经加入到场景里，但是模型不在场景中间🤔️，模型比较亮，真实物品看不清楚

![](https://mmbiz.qpic.cn/sz_mmbiz_png/9Z5K66tFPiax49af9tF6YQg4iaFwUckibQYp9fAp8vIvNQueCzQeYKKUYVonAF5hlGGpHArcDFKpem3ZqGO6oY03g/640?wx_fmt=png&from=appmsg)

> 打印一下模型解析后的数据，我们可以看到模型有自己的相机场景动画等信息，我们可以把当前相应的设置调整成模型的设置

![](https://mmbiz.qpic.cn/sz_mmbiz_png/9Z5K66tFPiax49af9tF6YQg4iaFwUckibQYISodWt6fibBlia5PC0bLFBowDM9FcKagDOkVumNxc3CCE2L4fugyYcKg/640?wx_fmt=png&from=appmsg)

##### 模型调整

*   调整相机为模型相机
    

```
setModel(modelName) {
...
// 修改相机为模型相机
this.camera = gltf.cameras[0];
...
}


```

> 调整后模型位置在画面中间

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/9Z5K66tFPiax49af9tF6YQg4iaFwUckibQYcIatKhHY2DDI0RmyX5wT2KY8CQoZ2CIoCvEGAuEAjX9icqcWffGn8Ow/640?wx_fmt=other&from=appmsg)

*   调整场景其他配置
    

```
// 设置模型
  setModel(modelName) {
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader().setPath("./gltf/");
      loader.load(modelName, (gltf) => {
        console.log(gltf);
        this.model && this.model.removeFromParent();
        this.model = gltf.scene.children[0];
        if (modelName === "bag2.glb" && !this.dish) {
          this.dish = gltf.scene.children[5];
          // 修改相机为模型相机
          this.camera = gltf.cameras[0];
          // 调用动画
          this.mixer = new THREE.AnimationMixer(gltf.scene.children[1]);
          this.animateAction = this.mixer.clipAction(gltf.animations[0]);
          // 设置动画播放时长
          this.animateAction.setDuration(20).setLoop(THREE.LoopOnce);
          // 设置播放后停止
          this.animateAction.clampWhenFinished = true;
          //   设置灯光
          this.spotlight1 = gltf.scene.children[2].children[0];
          this.spotlight1.intensity = 1;
          this.spotlight2 = gltf.scene.children[3].children[0];
          this.spotlight2.intensity = 1;
          this.spotlight3 = gltf.scene.children[4].children[0];
          this.spotlight3.intensity = 1;

          // this.scene.add(this.dish);
        }
        this.scene.add(gltf.scene);
        resolve(`${this.modelName}模型添加成功`);
      });
    });
  }


```

> 调整参数后的产品展示效果

![](https://mmbiz.qpic.cn/sz_mmbiz_png/9Z5K66tFPiax49af9tF6YQg4iaFwUckibQYaadYtkDBWotFPFL1ru5LxffvIsr6c2xW9D2TiaR83h8C76WCeMaBLcg/640?wx_fmt=png&from=appmsg)

*   定时器和滚轮监听动画
    

```
// 添加定时器
render() {
    var delta = this.clock.getDelta();
    this.mixer && this.mixer.update(delta);
    this.renderer.render(this.scene, this.camera);
 }
  
// 监听滚轮事件
    window.addEventListener("mousewheel", this.onMouseWheel.bind(this));
    
// 监听滚轮事件
  onMouseWheel(e) {
    let timeScale = e.deltaY > 0 ? 1 : -1;
    this.animateAction.setEffectiveTimeScale(timeScale);
    this.animateAction.paused = false;
    this.animateAction.play();
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.timeoutId = setTimeout(() => {
      this.animateAction.halt(0.3);
    }, 300);
  }


```

> 场景和产品模型都添加成功，结合动画，可以进行产品的预览

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/9Z5K66tFPiax49af9tF6YQg4iaFwUckibQYPFPKvyUjgNxAkHtj7jgvEkMnrOgnRibSbyXUWjQnKEjibQeVRn4MedvA/640?wx_fmt=gif&from=appmsg)

#### 添加窗口监听事件

> 调整页面窗口时，保证场景的全屏展示

```
// 监听场景大小改变，调整渲染尺寸
  window.addEventListener("resize", this.onWindowResize.bind(this));
// 监听尺寸
  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }


```

#### 优化加载

> 模型加载成功后在展示

```
 constructor(selector, onFinish) {
    this.onFinish = onFinish;
  }
// 添加物品增加回调函数
async addMesh() {
    let res = await this.setModel("bag2.glb");
    this.onFinish(res);
}


```

#### 增加商品的介绍

> 根据 duration 和 time 计算当前处于哪部门节点

![](https://mmbiz.qpic.cn/sz_mmbiz_png/9Z5K66tFPiax49af9tF6YQg4iaFwUckibQYOdpXBcJicEd89p4jzR2ib2rM2qmrwHGQRAP1Cgtk5czWW2uL2aNKHuaw/640?wx_fmt=png&from=appmsg)![](https://mmbiz.qpic.cn/sz_mmbiz_png/9Z5K66tFPiax49af9tF6YQg4iaFwUckibQYkwcdGMBYV9xIZpUoonvnjC7E7mB6RgGtFPMUooJLMtwwYSnZxPvEfQ/640?wx_fmt=png&from=appmsg)

```
window.addEventListener("mousewheel", (e) => {
  let duration = data.base3d.animateAction._clip.duration;
  let time = data.base3d.animateAction.time;
  let index = Math.floor((time / duration) * 4);
  data.descIndex = index;
});


```

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/9Z5K66tFPiax49af9tF6YQg4iaFwUckibQY8D1MX9fy6eq0oK8jX5dVMa7avicoMWrknTlY8hkmRLYp6foHxoqrAWg/640?wx_fmt=gif&from=appmsg)

#### 增加选择场景和产品

##### 创建数据增加操作的 dom

```
<template>
  <div class="loading" v-show="data.isLoading">
    <Loading :progress="data.progress"></Loading>
  </div>
  <div class="product" id="product" v-show="!data.isLoading">
    <div
      class="desc"
      :class="{ active: data.descIndex == i }"
      v-if="data.products[data.pIndex]"
      v-for="(desc, i) in data.products[data.pIndex].desc"
    >
      <h1 class="title">{{ desc.title }}</h1>
      <p class="content">{{ desc.content }}</p>
    </div>
  </div>
  <div class="prod-list">
    <h1><SketchOutlined></SketchOutlined>产品推荐</h1>
    <div class="products">
      <div
        class="prod-item"
        :class="{ active: pI == data.pIndex }"
        v-for="(prod, pI) in data.products"
        @click="changeModel(prod, pI)"
      >
        <div class="prod-title">
          {{ prod.title }}
        </div>
        <div class="img">
          <img :src="prod.imgsrc" :alt="prod.title" />
        </div>
      </div>
    </div>
  </div>
  <div class="scene" id="scene" v-show="!data.isLoading"></div>
  <div class="scene-list">
    <h3><RadarChartOutlined></RadarChartOutlined> 切换使用场景</h3>

    <div class="scenes">
      <div
        class="scene-item"
        v-for="(scene, index) in data.scenes"
        @click="changeHdr(scene, index)"
      >
        <img
          :class="{ active: index == data.sceneIndex }"
          :src="`./hdr/${scene}.jpg`"
          :alt="scene"
        />
      </div>
    </div>
  </div>
</template>
<script setup>
import Base3D from "../utils/base3d";
import { reactive, onMounted } from "vue";
const infoList = [
  {
    id: 7589,
    title: "GUCCI 古驰新款女包",
    imgsrc: "./imgs/bag.png",
    price: 17899,
    modelPath: "./gltf/",
    modelName: "bag2.glb",
    desc: [
      {
        title: "与一款全新的邮差包设计。",
        content: "该系列手袋同时推出摩登廓形的水桶包款式",
      },
      {
        title: "向60年前古驰的经典手袋致敬。",
        content: "Gucci 1955马衔扣系列手袋延续经典手袋线条与造型",
      },
      {
        title: "手袋结构设计精巧",
        content: "搭配可调节长度的肩带，肩背或斜挎皆宜。",
      },
      {
        title: "GUCCI 1955马衔扣系列手袋",
        content:
          "标志性的马衔扣设计源于马术运动，由金属双环和一条衔链组合而成。",
      },
    ],
  },
  {
    id: 7590,
    title: "Macbook Pro",
    imgsrc: "./imgs/macpro.jpg",
    price: 25899,
    modelPath: "./gltf/",
    modelName: "Macbookpro2.glb",
    desc: [
      {
        title: "超高速M1 Pro和M1 Max芯片",
        content: "带来颠覆性表现和惊人续航",
      },
      {
        title: "炫目的Liquid视网膜XDR显示屏",
        content: "Macbookpro各类强大端口也都整装就位",
      },
      {
        title: "战力更猛，耐力也更强！",
        content: "无论是剪辑8K视频、编译代码都能随时随地轻松搞定",
      },
      {
        title: "Pro到MAX，霸气不封顶",
        content: "图形处理器速度最高提升至4倍，机器学习性能提升至5倍",
      },
    ],
  },
  {
    id: 7591,
    title: "水晶凉鞋女细跟",
    imgsrc: "./imgs/womenshoes.jpg",
    price: 17899,
    modelPath: "./gltf/",
    modelName: "shoes.glb",
    desc: [
      { title: "白变女神季", content: "性感潮品、优雅轻淑范！" },
      { title: "舒适、焕新", content: "手感光滑、富有弹性、舒适一整天" },
      { title: "个性、魅力", content: "水晶搭配金属，凸显柔美气质" },
      { title: "全透、高端水晶", content: "每一处的细节，都很到位!" },
    ],
  },
];
const hdr = ["000", "001", "002", "003", "004", "005"];
const data = reactive({
  products: [],
  isLoading: true,
  scenes: [],
  pIndex: 0,
  sceneIndex: 0,
  base3d: {},
  descIndex: 0,
  progress: 0,
});
function LoadingFinish() {
  data.isLoading = false;
}
onMounted(() => {
  data.products = infoList;
  data.scenes = hdr;
  data.base3d = new Base3D("#scene", LoadingFinish);
  data.base3d.onProgress((e) => {
    let progressNum = e.loaded / e.total;
    progressNum = progressNum.toFixed(2) * 100;
    data.progress = progressNum;
    // console.log(progressNum);
  });
});

window.addEventListener("mousewheel", (e) => {
  console.log("🚀.animateAction", data.base3d.animateAction);
  let duration = data.base3d.animateAction._clip.duration;
  let time = data.base3d.animateAction.time;
  let index = Math.floor((time / duration) * 4);
  data.descIndex = index;
});

</script>

<style scoped>
.desc {
  position: fixed;
  z-index: 100000;
  background-color: rgba(255, 255, 255, 0.5);
  width: 600px;
  top: 100px;
  left: 50%;
  margin-left: -300px;
  transition: all 0.5s;
  transform: translate(-100vw, 0);
  padding: 15px;
}
.desc.active {
  transform: translate(0, 0);
}
.prod-list,
.scene-list {
  display: block;
  position: fixed;
  top: 0;
  z-index: 999;
  width: auto;
}
h1 {
  font-size: 20px;
  font-weight: 900;
  padding: 10px 25px 0;
}
.prod-list {
  left: 0;
}
.scene-list {
  right: 0;
}
.products {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.prod-item {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 250px;
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 20px;
  overflow: hidden;
  margin: 10px 0;
  box-shadow: 2px 2px 5px #666;
  transition: all 0.3s;
}
.prod-item img {
  width: 190px;
}
.prod-title {
  padding: 0 20px;
}
.scene-item {
  padding: 6px 0;
}
.scene-item img {
  width: 250px;
  border-radius: 10px;
  box-shadow: 2px 2px 10px #666;
  transition: all 0.3s;
}
img.active {
  box-shadow: 2px 2px 5px #666, 0px 0px 10px red;
}
img:hover {
  transform: translate(0px, -5px);
  box-shadow: 2px 2px 5px #666, 0px 0px 10px orangered;
}
</style>


```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/9Z5K66tFPiax49af9tF6YQg4iaFwUckibQYjH2HLQtypmEMSWvBesgSrPrelBpkIlqggbx4cDTH2BapczBv5f4YGw/640?wx_fmt=png&from=appmsg)

##### 增加操作事件

```
function changeModel(prod, pI) {
  data.pIndex = pI;
  data.base3d.setModel(prod.modelName);
}
function changeHdr(scene, index) {
  data.sceneIndex = index;
  data.base3d.setEnvMap(scene);
}


```

#### 大功告成

> 支持不同位置展示不同描述：配合数据配置渲染不同桢的效果

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/9Z5K66tFPiax49af9tF6YQg4iaFwUckibQYhLYHamR0TNf2nHzmaDXcaRESOTMJLrUXWmHXKxMhHTLiavjxaCkOtaA/640?wx_fmt=gif&from=appmsg)

> 根据选中的产品，切换相应产品效果

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/9Z5K66tFPiax49af9tF6YQg4iaFwUckibQYjnz4pOX4W8NFsePcBP8cnsecTFic5uibAN4eawmmDJyS0dB6Po8K3gyg/640?wx_fmt=gif&from=appmsg)

> 根据选中场景，切换相应的场景

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/9Z5K66tFPiax49af9tF6YQg4iaFwUckibQYUjKT1Vu3r56XUvFMvJNI6awlKuNEwnl1az0gCRrjx8DMq2JmiaYmalw/640?wx_fmt=gif&from=appmsg)

### 总结

*   通过类的方式创建的方法，能够很好的保存了创建过程中 3D 模型的所具备的属性和功能，在实例化后，可以很便捷的获取到相应的属性
    
*   在创建场景 / 模型时，可以根据要突出的效果调整相应的参数，我们可以认真观察创建出来的实例对象中包含的属性和方法，方便我们渲染使用
    

![](https://mmbiz.qpic.cn/sz_mmbiz_png/9Z5K66tFPiax49af9tF6YQg4iaFwUckibQYZcx6Ujuw5fdQXsG74HmuWy6fiaP6q47exL2kMwbia15E6UnE7z72F2dg/640?wx_fmt=png&from=appmsg)

### 参考包 / 支持

*   Three.js[2]
    
*   本项目参考视频 [3]
    
*   源码 [4]
    

参考资料

[1]

vite 中文网: _https://vitejs.cn/guide/#scaffolding-your-first-vite-project_

[2]

Three.js: _http://www.webgl3d.cn/Three.js/_

[3]

threejs 打造沉浸式商城 2022 全新 Vue3 企业项目实战: _https://www.bilibili.com/video/BV15T4y1175F/?p=21&vd_source=797532e4fa3575d6c48e18321f8de472_

[4]

源码: _https://gitee.com/yueliangliaoliao/vue-three_

### 最后  

Node 社群

```
我组建了一个氛围特别好的 Node.js 社群，里面有很多 Node.js小伙伴，如果你对Node.js学习感兴趣的话（后续有计划也可以），我们可以一起进行Node.js相关的交流、学习、共建。下方加 考拉 好友回复「Node」即可。

   “分享、点赞、在看” 支持一下

```