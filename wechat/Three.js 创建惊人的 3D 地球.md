> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/cjlE0c7SXE--a0jkJCwuOg)

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/9Z5K66tFPiayEjib2we2g8axyqWdicO2abhRRl9tWhDyHANROJtr5NW6cwZiaZfATKMSepq0GdNfeoEoBiajRibfmXeg/640?wx_fmt=gif&from=appmsg)

  

本项目使用 Webpack5 + Typescript4 + Threejs + Shader 基础模板搭建...

▼ https://github.com/GhostCatcg/three-ts-webpack

![](https://mmbiz.qpic.cn/sz_mmbiz_png/9Z5K66tFPiayEjib2we2g8axyqWdicO2abhJibgwDc6uPQicyczCVo8I76iasLSxjaxYpQ6j63l5uYAhphtMvzHsc9tQ/640?wx_fmt=png&from=appmsg)

![](https://mmbiz.qpic.cn/mmbiz_png/lDt9micWnclTHgFVpBE3QSKZ9ISPCQt84bzZxby5Qr7wvoQicXQeZLjnE820VpVGgElPGY2xba5hAibUjVsgvZsow/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1&tp=wxpic)  

**# Threejs 基础概念简单介绍**

  

**Threejs 和 Webgl 的关系**

  

Three.js 经常会和 WebGL 混淆， 但也并不总是，Three.js 其实是使用 WebGL 来绘制三维效果的。WebGL 是一个只能画点、线和三角形的非常底层的系统。想要用 WebGL 来做一些实用的东西通常需要大量的代码， 这就是 Three.js 的用武之地。它封装了诸如场景、灯光、阴影、材质、贴图、空间运算等一系列功能，让你不必要再从底层 WebGL 开始写起。

  

  

### **基础 Threejs 场景**

  

一个最基础的 Three.js 程序包括渲染器（Renderer）、场景（Scene）、相机（Camera）、灯光（灯光），以及我们在场景中创建的物体（Earth）。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/9Z5K66tFPiayEjib2we2g8axyqWdicO2abhrEjm5jgFmHkjJN7TheT8icmYd0vHXN4XKxmdkBC1rcHjUFJEu59XO4g/640?wx_fmt=png&from=appmsg)

![](https://mmbiz.qpic.cn/sz_mmbiz_png/9Z5K66tFPiayEjib2we2g8axyqWdicO2abhnXR6Hx5VwTTic0TWKKyHp4AoX8cTJElkJHHfTWvllHCtHXxo7r4LtNQ/640?wx_fmt=png&from=appmsg)

  

此次主要是项目实战，其他理论基础知识请前往官方文档

![](https://mmbiz.qpic.cn/mmbiz_png/lDt9micWnclTHgFVpBE3QSKZ9ISPCQt84bzZxby5Qr7wvoQicXQeZLjnE820VpVGgElPGY2xba5hAibUjVsgvZsow/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1&tp=wxpic)  

**#入口文件**

  

使用 webpack 打包，src/index.html 是入口文件，关于 webpack 的知识不多赘述

  

**文件列表**

![](https://mmbiz.qpic.cn/sz_mmbiz_png/9Z5K66tFPiayEjib2we2g8axyqWdicO2abhgG7Ft77bKZ69iazMiabG3YyqLIwg5iasRxApOXiaLuzzmVCREYmV6jm7Jw/640?wx_fmt=png&from=appmsg)

  

#### **index.html**

```
<div id="loading">
  <div class="sk-chase">
    <div class="sk-chase-dot"></div>
    <div class="sk-chase-dot"></div>
    <div class="sk-chase-dot"></div>
    <div class="sk-chase-dot"></div>
    <div class="sk-chase-dot"></div>
    <div class="sk-chase-dot"></div>
  </div>
  <div>加载资源中...</div>
</div>
<div id="html2canvas" class="css3d-wapper">
  <div class="fire-div"></div>
</div>
<div id="earth-canvas"></div>
```

*   #loading: 加载中的 loading 效果  
    
*   #earth-canvas：将 canvas 绘制到此 dom 下面
    
*   #html2canvas：将 html 转换成图片，显示地球标点
    

####   

#### **index.ts**

webpack 会将此文件打包成 js，放进 index.html 中  

```
import World from './world/Word'
// earth-canvas 
const dom: HTMLElement = document.querySelector('#earth-canvas') 
// 将dom传进去
new World({ dom, })
```

  

####   

#### **World.ts 创建 3D 世界**

```
// 传入dom，创建出threejs场景、渲染器、相机和控制器。
this.basic = new Basic(option.dom)
this.scene = this.basic.scene
this.renderer = this.basic.renderer
this.controls = this.basic.controls
this.camera = this.basic.camera
```

```
// 传入dom，主要进行dom尺寸计算和管理resize事件。
this.sizes = new Sizes({ dom: option.dom })

this.sizes.$on('resize', () => {
  this.renderer.setSize(Number(this.sizes.viewport.width), Number(this.sizes.viewport.height))
  this.camera.aspect = Number(this.sizes.viewport.width) / Number(this.sizes.viewport.height)
  this.camera.updateProjectionMatrix()
})
```

```
// 传一个function，资源加载完成后会执行此function。
this.resources = new Resources(async () => {
  await this.createEarth()
  // 开始渲染
  this.render()
})
```

```
// 地球相关配置
type options = {
  data: {
    startArray: {
      name: string,
      E: number, // 经度
      N: number, // 维度
    },
    endArray: {
      name: string,
      E: number, // 经度
      N: number, // 维度
    }[]
  }[]
  dom: HTMLElement,
  textures: Record<string, Texture>, // 贴图
  earth: {
    radius: number, // 地球半径
    rotateSpeed: number, // 地球旋转速度
    isRotation: boolean // 地球组是否自转
  }
  satellite: {
    show: boolean, // 是否显示卫星
    rotateSpeed: number, // 旋转速度
    size: number, // 卫星大小
    number: number, // 一个圆环几个球
  },
  punctuation: punctuation,
  flyLine: {
    color: number, // 飞线的颜色
    speed: number, // 飞机拖尾线速度
    flyLineColor: number // 飞行线的颜色
  },
}
```

```
// 1.将earth中的group添加到场景中
this.scene.add(this.earth.group)

// 2.通过await init创建地球及其相关内容，因为创建一些东西需要时间，所以返回一个Promise
await this.earth.init()

// 3.地球创建完之后隐藏dom，添加一个事先定义好的类名，使用animation渐渐隐藏掉dom
const loading = document.querySelector('#loading')
loading.classList.add('out')
```

![](https://mmbiz.qpic.cn/mmbiz_png/lDt9micWnclTHgFVpBE3QSKZ9ISPCQt84bzZxby5Qr7wvoQicXQeZLjnE820VpVGgElPGY2xba5hAibUjVsgvZsow/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1&tp=wxpic)  

**#加载资源**

  

地球中需要若干个贴图，在创建地球前，先把贴图加载进来。

  

**Assets.ts 整理资源文件**

  

```
/**
 * 资源文件
 * 把模型和图片分开进行加载
 */

interface ITextures {
  name: string
  url: string
}

export interface IResources {
  textures?: ITextures[],
}

const filePath = './images/earth/'
const fileSuffix = [
  'gradient',
  'redCircle',
  "label",
  "aperture",
  'earth_aperture',
  'light_column',
  'aircraft'
]

const textures = fileSuffix.map(item => {
  return {
    name: item,
    url: filePath + item + '.png'
  }
})

textures.push({
  name: 'earth',
  url: filePath + 'earth.jpg'
})

const resources: IResources = {
  textures
}

export {
  resources
}
```

```
/**
 * 资源管理和加载
 */
import { LoadingManager, Texture, TextureLoader } from 'three';
import { resources } from './Assets'
export class Resources {
  private manager: LoadingManager
  private callback: () => void;
  private textureLoader!: InstanceType<typeof TextureLoader>;
  public textures: Record<string, Texture>;
  constructor(callback: () => void) {
    this.callback = callback // 资源加载完成的回调

    this.textures = {} // 贴图对象

    this.setLoadingManager()
    this.loadResources()
  }

  /**
   * 管理加载状态
   */
  private setLoadingManager() {

    this.manager = new LoadingManager()
    // 开始加载
    this.manager.onStart = () => {
      console.log('开始加载资源文件')
    }
    // 加载完成
    this.manager.onLoad = () => {
      this.callback()
    }
    // 正在进行中
    this.manager.onProgress = (url) => {
      console.log(`正在加载：${url}`)
    }

    this.manager.onError = url => {
      console.log('加载失败：' + url)
    }

  }

  /**
   * 加载资源
   */
  private loadResources(): void {
    this.textureLoader = new TextureLoader(this.manager)
    resources.textures?.forEach((item) => {
      this.textureLoader.load(item.url, (t) => {
        this.textures[item.name] = t
      })
    })
  }
}
```

```
const earth_geometry = new SphereBufferGeometry(
  this.options.earth.radius,
  50,
);


const earth_border = new SphereBufferGeometry(
  this.options.earth.radius + 10,
  60,
);


const pointMaterial = new PointsMaterial({
  color: 0x81ffff, //设置颜色，默认 0xFFFFFF
  transparent: true,
  sizeAttenuation: true,
  opacity: 0.1,
  vertexColors: false, //定义材料是否使用顶点颜色，默认false ---如果该选项设置为true，则color属性失效
  size: 0.01, //定义粒子的大小。默认为1.0
})
const points = new Points(earth_border, pointMaterial); //将模型添加到场景


this.earthGroup.add(points);


this.options.textures.earth.wrapS = this.options.textures.earth.wrapT =
  RepeatWrapping;
this.uniforms.map.value = this.options.textures.earth;


const earth_material = new ShaderMaterial({
  // wireframe:true, // 显示模型线条
  uniforms: this.uniforms,
  vertexShader: earthVertex,
  fragmentShader: earthFragment,
});


earth_material.needsUpdate = true;
this.earth = new Mesh(earth_geometry, earth_material);
this.earth.name = "earth";
this.earthGroup.add(this.earth);
```

```
for (let i = 0; i < 500; i++) {
    const vertex = new Vector3();
    vertex.x = 800 * Math.random() - 300;
    vertex.y = 800 * Math.random() - 300;
    vertex.z = 800 * Math.random() - 300;
    vertices.push(vertex.x, vertex.y, vertex.z);
    colors.push(new Color(1, 1, 1));
  }
```

```
const aroundMaterial = new PointsMaterial({
    size: 2,
    sizeAttenuation: true, // 尺寸衰减
    color: 0x4d76cf,
    transparent: true,
    opacity: 1,
    map: this.options.textures.gradient,
  });
```

#### **Resources.ts 加载资源文件**

```
/**
 * 经纬度坐标转球面坐标  
 * @param {地球半径} R  
 * @param {经度(角度值)} longitude 
 * @param {维度(角度值)} latitude
 */
export const lon2xyz = (R:number, longitude:number, latitude:number): Vector3 => {
  let lon = longitude * Math.PI / 180; // 转弧度值
  const lat = latitude * Math.PI / 180; // 转弧度值
  lon = -lon; // js坐标系z坐标轴对应经度-90度，而不是90度


  // 经纬度坐标转球面坐标计算公式
  const x = R * Math.cos(lat) * Math.cos(lon);
  const y = R * Math.sin(lat);
  const z = R * Math.cos(lat) * Math.sin(lon);
  // 返回球面坐标
  return new Vector3(x, y, z);
}
```

```
// render
if (this.waveMeshArr.length) {
  this.waveMeshArr.forEach((mesh: Mesh) => {
    mesh.userData['scale'] += 0.007;
    mesh.scale.set(
      mesh.userData['size'] * mesh.userData['scale'],
      mesh.userData['size'] * mesh.userData['scale'],
      mesh.userData['size'] * mesh.userData['scale']
    );
    if (mesh.userData['scale'] <= 1.5) {
      (mesh.material as Material).opacity = (mesh.userData['scale'] - 1) * 2; //2等于1/(1.5-1.0)，保证透明度在0~1之间变化
    } else if (mesh.userData['scale'] > 1.5 && mesh.userData['scale'] <= 2) {
      (mesh.material as Material).opacity = 1 - (mesh.userData['scale'] - 1.5) * 2; //2等于1/(2.0-1.5) mesh缩放2倍对应0 缩放1.5被对应1
    } else {
      mesh.userData['scale'] = 1;
    }
  });
}
```

```
<div id="html2canvas" class="css3d-wapper">
  <div class="fire-div"></div>
</div>
```

```
const opts = {
  backgroundColor: null, // 背景透明
  scale: 6,
  dpi: window.devicePixelRatio,
};
const canvas = await html2canvas(document.getElementById("html2canvas"), opts)
const dataURL = canvas.toDataURL("image/png");
const map = new TextureLoader().load(dataURL);
const material = new SpriteMaterial({
  map: map,
  transparent: true,
});
const sprite = new Sprite(material);
const len = 5 + (e.name.length - 2) * 2;
sprite.scale.set(len, 3, 1);
sprite.position.set(p.x * 1.1, p.y * 1.1, p.z * 1.1);
this.earth.add(sprite);
```

```
// render()
this.circleLineList.forEach((e) => {
  e.rotateY(this.options.satellite.rotateSpeed);
});
```

```
士大夫发
```

```
sdaf
```

```
是否是大算法的说法
```

```
通过使用threejs提供的LoadingManager方法，
```

```
管理资源的加载进度，以及保存一个textures对象，
```

```
key为name，value为Texture对象。
```

```
十分大
```

```
sdfasdfa
```

```
士大夫
```

![](https://mmbiz.qpic.cn/mmbiz_png/lDt9micWnclTHgFVpBE3QSKZ9ISPCQt84bzZxby5Qr7wvoQicXQeZLjnE820VpVGgElPGY2xba5hAibUjVsgvZsow/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1&tp=wxpic)  

**#添加地球**

  

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/9Z5K66tFPiayEjib2we2g8axyqWdicO2abhdpRmwZAVHT47Ot3Fe18ZeQhZEiaLuicaRK79dCRcCHdXEVUiaEXWvCy0A/640?wx_fmt=jpeg&from=appmsg)

  

  

  

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/9Z5K66tFPiayEjib2we2g8axyqWdicO2abho02ylxpJft12iaY9MUuXbzN6kocT7iaX3Vlwk2EV4kboSokppaxf5GUw/640?wx_fmt=jpeg&from=appmsg)

earth: 创建一个地球 mesh，并赋予 ShaderMaterial 材质和贴上地球贴图，之后可以通过着色器动画实现地球扫光效果。

points: 创建一个由 points 组成的包围球，放在外围。

```
earth:创建一个地球mesh，

并赋予ShaderMaterial材质和贴上地球贴图，

之后可以通过着色器动画实现地球扫光效果。


points:创建一个由points组成的包围球，

放在外围。
```

```
const earth_geometry = new SphereBufferGeometry(
  this.options.earth.radius,
  50,
);
const earth_border = new SphereBufferGeometry(
  this.options.earth.radius + 10,
  60,
);
const pointMaterial = new PointsMaterial({
  color: 0x81ffff, //设置颜色，默认 0xFFFFFF
  transparent: true,
  sizeAttenuation: true,
  opacity: 0.1,
  vertexColors: false, //定义材料是否使用顶点颜色，默认false ---如果该选项设置为true，则color属性失效
  size: 0.01, //定义粒子的大小。默认为1.0
})
const points = new Points(earth_border, pointMaterial); //将模型添加到场景
this.earthGroup.add(points);
this.options.textures.earth.wrapS = this.options.textures.earth.wrapT =
  RepeatWrapping;
this.uniforms.map.value = this.options.textures.earth;
const earth_material = new ShaderMaterial({
  // wireframe:true, // 显示模型线条
  uniforms: this.uniforms,
  vertexShader: earthVertex,
  fragmentShader: earthFragment,
});
earth_material.needsUpdate = true;
this.earth = new Mesh(earth_geometry, earth_material);
this.earth.name = "earth";
this.earthGroup.add(this.earth);
```

![](https://mmbiz.qpic.cn/mmbiz_png/lDt9micWnclTHgFVpBE3QSKZ9ISPCQt84bzZxby5Qr7wvoQicXQeZLjnE820VpVGgElPGY2xba5hAibUjVsgvZsow/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1&tp=wxpic)  

**#添加星星**

![](https://mmbiz.qpic.cn/sz_mmbiz_png/9Z5K66tFPiayEjib2we2g8axyqWdicO2abhrALcia4KaBwicK1xbzCHS3VvkCwG4OodrwqgwSQsdAbUffVYX62qZiaXw/640?wx_fmt=png&from=appmsg)

星空背景其核心主要是创建了 500 个随机分布的点位

```
for (let i = 0; i < 500; i++) {
    const vertex = new Vector3();
    vertex.x = 800 * Math.random() - 300;
    vertex.y = 800 * Math.random() - 300;
    vertex.z = 800 * Math.random() - 300;
    vertices.push(vertex.x, vertex.y, vertex.z);
    colors.push(new Color(1, 1, 1));
  }
```

### 使用点材质，贴上图片

```
const aroundMaterial = new PointsMaterial({
    size: 2,
    sizeAttenuation: true, // 尺寸衰减
    color: 0x4d76cf,
    transparent: true,
    opacity: 1,
    map: this.options.textures.gradient,
  });
```

![](https://mmbiz.qpic.cn/mmbiz_png/lDt9micWnclTHgFVpBE3QSKZ9ISPCQt84bzZxby5Qr7wvoQicXQeZLjnE820VpVGgElPGY2xba5hAibUjVsgvZsow/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1&tp=wxpic)  

**#添加地球辉光**

![](https://mmbiz.qpic.cn/sz_mmbiz_png/9Z5K66tFPiayEjib2we2g8axyqWdicO2abhwxCyTkNiaTw5f8doewibWqibuqEsONduxliaPdFhvN50icTULyyVI5ZpABA/640?wx_fmt=png&from=appmsg)

地球边缘发光的效果，创建一个比地球大一点点的精灵片，贴上下图，而且精灵片是一直朝向摄像机的。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/9Z5K66tFPiayEjib2we2g8axyqWdicO2abhF01K0rs2YBzwJE7mntqLfDID4Le6GqWDtU6iacUvfOxfBll6lXeWkhA/640?wx_fmt=png&from=appmsg)

![](https://mmbiz.qpic.cn/mmbiz_png/lDt9micWnclTHgFVpBE3QSKZ9ISPCQt84bzZxby5Qr7wvoQicXQeZLjnE820VpVGgElPGY2xba5hAibUjVsgvZsow/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1&tp=wxpic)  

**#添加地球辉光大气层**

![](https://mmbiz.qpic.cn/sz_mmbiz_png/9Z5K66tFPiayEjib2we2g8axyqWdicO2abhC0aAPdxpvict5YKUzP5GUITQTACwL3b7B9lib7yxh0NHNOu0OMJsuUBQ/640?wx_fmt=png&from=appmsg)

```
const earth_geometry = new SphereBufferGeometry(
  this.options.earth.radius,
  50,
);

const earth_border = new SphereBufferGeometry(
  this.options.earth.radius + 10,
  60,
);

const pointMaterial = new PointsMaterial({
  color: 0x81ffff, //设置颜色，默认 0xFFFFFF
  transparent: true,
  sizeAttenuation: true,
  opacity: 0.1,
  vertexColors: false, //定义材料是否使用顶点颜色，默认false ---如果该选项设置为true，则color属性失效
  size: 0.01, //定义粒子的大小。默认为1.0
})
const points = new Points(earth_border, pointMaterial); //将模型添加到场景

this.earthGroup.add(points);

this.options.textures.earth.wrapS = this.options.textures.earth.wrapT =
  RepeatWrapping;
this.uniforms.map.value = this.options.textures.earth;

const earth_material = new ShaderMaterial({
  // wireframe:true, // 显示模型线条
  uniforms: this.uniforms,
  vertexShader: earthVertex,
  fragmentShader: earthFragment,
});

earth_material.needsUpdate = true;
this.earth = new Mesh(earth_geometry, earth_material);
this.earth.name = "earth";
this.earthGroup.add(this.earth);
```

**#地球上的标点**

### **添加柱状点位 createMarkupPoint()**

高德地图取坐标点：

https://lbs.amap.com/tools/picker

我们需要将 threejs 的物体放置在地球上，就需要将经纬度转球面坐标，这是有详细转换文档

https://blog.csdn.net/weixin_43787178/article/details/114434211

lon2xyz() 我们直接用这个方法会把经纬度转成为球面坐标，拿到坐标我们就可以在对应的位置上创建物体

```
/**
 * 经纬度坐标转球面坐标  
 * @param {地球半径} R  
 * @param {经度(角度值)} longitude 
 * @param {维度(角度值)} latitude
 */
export const lon2xyz = (R:number, longitude:number, latitude:number): Vector3 => {
  let lon = longitude * Math.PI / 180; // 转弧度值
  const lat = latitude * Math.PI / 180; // 转弧度值
  lon = -lon; // js坐标系z坐标轴对应经度-90度，而不是90度
  // 经纬度坐标转球面坐标计算公式
  const x = R * Math.cos(lat) * Math.cos(lon);
  const y = R * Math.sin(lat);
  const z = R * Math.cos(lat) * Math.sin(lon);
  // 返回球面坐标
  return new Vector3(x, y, z);
}
```

这个白色和红色的柱子其实是两个 mesh 相交，并贴上贴图，通过转换过来的坐标放置在地球上。

  

还有一个底座的效果

![](https://mmbiz.qpic.cn/sz_mmbiz_png/9Z5K66tFPiayEjib2we2g8axyqWdicO2abhthTTxGuCOXzhuuaibtWliaC6Tv0csgKKjtVY00ZVYDvdNiaknTcOPBm9Q/640?wx_fmt=png&from=appmsg)

#### **底座动画**

```
// render
if (this.waveMeshArr.length) {
  this.waveMeshArr.forEach((mesh: Mesh) => {
    mesh.userData['scale'] += 0.007;
    mesh.scale.set(
      mesh.userData['size'] * mesh.userData['scale'],
      mesh.userData['size'] * mesh.userData['scale'],
      mesh.userData['size'] * mesh.userData['scale']
    );
    if (mesh.userData['scale'] <= 1.5) {
      (mesh.material as Material).opacity = (mesh.userData['scale'] - 1) * 2; //2等于1/(1.5-1.0)，保证透明度在0~1之间变化
    } else if (mesh.userData['scale'] > 1.5 && mesh.userData['scale'] <= 2) {
      (mesh.material as Material).opacity = 1 - (mesh.userData['scale'] - 1.5) * 2; //2等于1/(2.0-1.5) mesh缩放2倍对应0 缩放1.5被对应1
    } else {
      mesh.userData['scale'] = 1;
    }
  });
}
```

循环 waveMeshArr 组，让里面的 mesh 变大并且渐渐消失，之后一直重复。

```
添加城市标签 createSpriteLabel()
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/9Z5K66tFPiayEjib2we2g8axyqWdicO2abhULmt1HKDBlgiaicsicTpxfIgPqFeHxGdQuYjKWySkibqoCb42nuz37B39A/640?wx_fmt=png&from=appmsg)

```
使用 html2canvas 创建精灵片标签
```

```
<div>
  <div></div>
</div>
```

```
const opts = {
  backgroundColor: null, // 背景透明
  scale: 6,
  dpi: window.devicePixelRatio,
};
const canvas = await html2canvas(document.getElementById("html2canvas"), opts)
const dataURL = canvas.toDataURL("image/png");
const map = new TextureLoader().load(dataURL);
const material = new SpriteMaterial({
  map: map,
  transparent: true,
});
const sprite = new Sprite(material);
const len = 5 + (e.name.length - 2) * 2;
sprite.scale.set(len, 3, 1);
sprite.position.set(p.x * 1.1, p.y * 1.1, p.z * 1.1);
this.earth.add(sprite);
```

地球上的标签是通过 html2canvas 插件将 html 转换成贴图，贴到精灵片上。

**#创建环绕卫星**

![](https://mmbiz.qpic.cn/sz_mmbiz_png/9Z5K66tFPiayEjib2we2g8axyqWdicO2abh6DYpklDKKMYicBWW10WbGfsI4ibrT6fJkrcC6GnX8DxA8BAkhU87uWnA/640?wx_fmt=png&from=appmsg)

*   `getCirclePoints`获取一个圆环坐标点列表
    
*   `createAnimateLine`通过圆环点位创建一个圆环线，并 clone 出 3 条，加上若干个小卫星
    

通过每帧循环让线条转圈，并带动小卫星转

```
// render()
this.circleLineList.forEach((e) => {
  e.rotateY(this.options.satellite.rotateSpeed);
});
```

**End**
-------

在线预览：

https://gcat.cc/demo/earth

源码：

https://github.com/GhostCatcg/3d-earth

  

作者：GhostCat  
原文：https://gcat.cc/blog/threejs/3d-earth

  

**感谢您的阅读** 

**在看点赞 好文不断** ![](https://mmbiz.qpic.cn/sz_mmbiz_gif/9Z5K66tFPiazs3Z89Vu31cicxIlNVosLUvhm5NeWUmR81LicIsMwfpJ4RbgB7JHXiaapIw5Yu29m9Io2oC67zGGBqA/640?wx_fmt=gif)