> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/X1u2U-0hVOg0guruGr13-g)

> 我们将通过 three.js 技术打造 3d 隧道监测可视化项目，隧道监测项目将涵盖照明，风机的运行情况，控制车道指示灯关闭，情报板、火灾报警告警、消防安全、车行横洞、风向仪、隧道紧急逃生出口的控制以及事故模拟等！那先来看看我们的初步成果！因为作者也是在边学习边做的情况，效果有些丑陋，希望不要见笑！！！three.js 基础知识还是基本涵盖了，入门还是很有参考价值的！

![](https://mmbiz.qpic.cn/sz_mmbiz_png/9Z5K66tFPiayzSfJ7tI7URI0ZhJHlvK98FFKRszZ14AwTXeHicdL07YzQlhq1XxnbEAibHyZiawUgwuYeItApicaWdQ/640?wx_fmt=png&from=appmsg)

Three.js 基础元素
-------------

  
  
  
  
  

---------------

我们将通过一个基本的 three.js 模板代码更好的概况我们的基础元素

```
import React, { useEffect } from 'react';import * as THREE from 'three';// eslint-disable-next-line import/extensionsimport { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';export default function ThreeVisual() {    // 场景    let scene;    // 相机    let camera;    // 控制器    let controls;    // 网络模型    let mesh;    // 渲染器    let renderer;    // debugger属性    const debugObject = {        light: {            amlight: {                color: 0xffffff,            },            directionalLight: {                color: 0xffffff,                position: {                    x: 0,                    y: 400,                    z: 1800,                },            },            pointLight: {                color: 0xff0000,                position: {                    x: 0,                    y: 400,                    z: 1800,                },            },        },    };    const sizes = {        width: window.innerWidth,        height: window.innerHeight,    };    useEffect(() => {        // eslint-disable-next-line no-use-before-define        threeStart();    }, []);    const initThree = () => {        const width = document.getElementById('threeMain').clientWidth;        const height = document.getElementById('threeMain').clientHeight;        renderer = new THREE.WebGLRenderer({            antialias: true,            logarithmicDepthBuffer: true,        });        renderer.shadowMap.enabled = true;        renderer.setSize(width, height);        document.getElementById('threeMain').appendChild(renderer.domElement);    };    const initCamera = (width, height) => {        camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000);        camera.position.x = 0;        camera.position.y = 500;        camera.position.z = 1300;        camera.up.x = 0;        camera.up.y = 1;        camera.up.z = 0;        camera.lookAt({            x: 0,            y: 0,            z: 0,        });        // 创建相机视锥体辅助对象        // const cameraPerspectiveHelper = new THREE.CameraHelper(camera);        // scene.add(cameraPerspectiveHelper);    };    const initScene = () => {        scene = new THREE.Scene();        scene.background = new THREE.Color(0xbfd1e5);    };    const initLight = () => {        // 环境光        const amlight = new THREE.AmbientLight(debugObject.light.amlight.color);        amlight.position.set(1000, 1000, 1000);        scene.add(amlight);    };    const initObject = () => {        const geometry = new THREE.BoxGeometry(3000, 6, 2400);        const material = new THREE.MeshBasicMaterial({color: 0xcccccc});        geometry.position = new THREE.Vector3(0, 0, 0);        mesh = new THREE.Mesh(geometry, [material, material, material, material, material, material]);        mesh.receiveShadow = true; // cast投射，方块投射阴影        scene.add(mesh);    }    const initControl = () => {        // 将renderer关联到container，这个过程类似于获取canvas元素        const pcanvas = document.getElementById('threeMain');        controls = new OrbitControls(camera, pcanvas);        // 如果使用animate方法时，将此函数删除        // controls.addEventListener( 'change', render );        // 使动画循环使用时阻尼或自转 意思是否有惯性        controls.enableDamping = true;        // 动态阻尼系数 就是鼠标拖拽旋转灵敏度        // controls.dampingFactor = 0.25;        // 是否可以缩放        controls.enableZoom = true;        // 是否自动旋转        // controls.autoRotate = true;        controls.autoRotateSpeed = 0.5;        // 设置相机距离原点的最近距离        // controls.minDistance  = 10;        // 设置相机距离原点的最远距离        controls.maxDistance = 10000;        // 是否开启右键拖拽        controls.enablePan = true;    };    function animation() {        renderer.render(scene, camera);        // mesh.rotateY(0.01);        requestAnimationFrame(animation);    }    function initHelper() {        const axesHelper = new THREE.AxesHelper(3000);        scene.add(axesHelper);    }    function threeStart() {        initThree();        initScene();        initCamera(sizes.width, sizes.height);        initHelper();        initObject();        initLight();        initControl();        animation();    }    return <div id="threeMain" style={{ width: '100vw', height: '100vh' }} />;}
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/9Z5K66tFPiayzSfJ7tI7URI0ZhJHlvK98DhqG4jwx66FGOn43bf5PBBLv7STdWibOpYicp2MCJxsAJHj5jGFgiaMFg/640?wx_fmt=png&from=appmsg)

#### 场景 scene

是一个三维空间，相当于我们 html 中的 body, 所有节点的容器，相当于一个空房间，承载所有的物品！所以我们定义一个全局变量 scene。

初始化我们可以这样：

```
const initScene = () => {        scene = new THREE.Scene();        scene.background = new THREE.Color(0xbfd1e5);    };
```

#### 相机 carema

打个比方，就是你买了一个 1 万元的相机出门拍风景，你总是想要抓住最美的风景，那你便要调好相机最精确的位置、角度、焦距等，相机看到的内容就是我们最终在屏幕上看到的内容。在这个例子中我们用的是像我们眼睛的透视相机 PerspectiveCamera。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/9Z5K66tFPiayzSfJ7tI7URI0ZhJHlvK98KQyMD5hWMCAnTPFPvnz3JF5pGfwRxed4WC9efib0xJnRGH5SbXSUf7Q/640?wx_fmt=png&from=appmsg)

还有一个常用的相机是正交相机 OrthographicCamera，它看到的范围不会受距离影响！

![](https://mmbiz.qpic.cn/sz_mmbiz_png/9Z5K66tFPiayzSfJ7tI7URI0ZhJHlvK98rWvbkhHJECmzB0mYH8oe6oh0hlGp1kzeEBuZys5ZaSlBZvjGnicTslw/640?wx_fmt=png&from=appmsg)

我们也定义了一个全局变量 camera,

初始化我们可以这样：

```
const initCamera = (width, height) => {        camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000);        camera.position.x = 0;        camera.position.y = 500;        camera.position.z = 1300;        camera.up.x = 0;        camera.up.y = 1;        camera.up.z = 0;        camera.lookAt({            x: 0,            y: 0,            z: 0,        });        // 创建相机视锥体辅助对象        // const cameraPerspectiveHelper = new THREE.CameraHelper(camera);        // scene.add(cameraPerspectiveHelper);    };
```

#### 网络模型 Mesh

在介绍它之前我们需要先了解点模型 Points、线模型 Line。点线面，面就是 Mesh 模型。点模型 Points、线模型 Line、网格网格模型 Mesh 都是由几何体 Geometry 和材质 Material 构成。在这里就不过多研究点线面了，我们最重要的知道的是一个网络模型就是一个物体穿上了衣服，没有穿衣服的皇帝不会让别人揭穿和笑话，但是我们的老板才是皇帝，所以尽量给我们的模型套件衣服吧！如果你想换件漂亮的衣服你可以看看我以前写的这篇关于材质贴图 [1] 的文章。

同理定义一个全局变量 mesh,

初始化我们可以这样：

```
const geometry = new THREE.BoxGeometry(3000, 6, 2400);const material = new THREE.MeshBasicMaterial({color: 0xcccccc});geometry.position = new THREE.Vector3(0, 0, 0);mesh = new THREE.Mesh(geometry, [material, material, material, material, material, material]);mesh.receiveShadow = true; // cast投射，方块投射阴影scene.add(mesh);
```

#### 光源 light

没有光世界便是黑暗的！同理假如没有光，摄像机看不到任何东西。所以我们需要为我们的场景加上不同光照效果。我们先从最基础的环境光 AmbientLight 开始。环境光意思就是哪个角度、哪个位置的光照亮度强度都一样。因为光不需要重复使用，所以我们没必要定义全局变量，所以我们初始化可以这样：

```
const initLight = () => {    // 环境光    const amlight = new THREE.AmbientLight(debugObject.light.amlight.color);    amlight.position.set(1000, 1000, 1000);    scene.add(amlight);};
```

#### 渲染器 renderer

就相当于现实生活中你带着相机，现在去了一个美丽的地方，你需要一个相片承载下这个美丽的景色，对于 threejs 而言，如果你需要这张相片，就需要一个新的对象，也就是 WebGL 渲染器 WebGLRenderer，把这些承载。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/9Z5K66tFPiayzSfJ7tI7URI0ZhJHlvK98zYib646uGqKBeKsviaRSRmXRP8vCynPPjLM8SAsxeXVNcYdKXoLpHBVQ/640?wx_fmt=png&from=appmsg)

同理我们定义一个全局变量 renderer，初始化我们可以这样：

```
renderer = new THREE.WebGLRenderer({   ... //属性配置});
```

渲染器还需要补充几点，就是如何和我们的 dom 节点关联起来：

渲染器 WebGLRenderer 通过属性 domElement 可以获得渲染方法 render() 生成的 Canvas 画布，domElement 本质上就是一个 HTML 元素：Canvas 画布。我们也可以通过 setSize() 来设置尺寸。

定义一个 html 元素

```
return <div id="threeMain" style={{ width: '100vw', height: '100vh' }} />;
```

html 元素和渲染器关联，那就给 div 增加一个子节点 (canvas)

![](https://mmbiz.qpic.cn/sz_mmbiz_png/9Z5K66tFPiayzSfJ7tI7URI0ZhJHlvK98PT9drHTVmA2MOcShOyhia2FRCGpKEsnFZW1wCWmljKAUvhIz0FJbLKw/640?wx_fmt=png&from=appmsg)

```
const initThree = () => {    const width = document.getElementById('threeMain').clientWidth;    const height = document.getElementById('threeMain').clientHeight;    renderer = new THREE.WebGLRenderer({       ... //属性配置    });    renderer.setSize(width, height);  //设置画布宽高    document.getElementById('threeMain').appendChild(renderer.domElement);  // 把画布加入dom节点};
```

渲染器和我们的 threejs 元素关联， 那渲染器渲染方法. render(), 把我们的场景和相机记录进来了！

```
renderer.render(scene, camera);
```

#### 控制器 controls

就是相当于可以通过我们的键盘和鼠标来控制我们的场景，使其有了交互功能！控制器种类有很多，但这里我们只说轨道控制器 OrbitControls。它可以使得相机围绕目标进行轨道运动。打个比方（地球围绕太阳一样运动）。

同理我们定义一个全局变量 controls，初始化我们可以这样：

```
controls = new OrbitControls(camera, pcanvas);
```

关联操作和属性介绍：

```
const initControl = () => {    // 将renderer关联到container，这个过程类似于获取canvas元素    const pcanvas = document.getElementById('threeMain');    controls = new OrbitControls(camera, pcanvas);    // 如果使用animate方法时，将此函数删除    // controls.addEventListener( 'change', render );    // 使动画循环使用时阻尼或自转 意思是否有惯性    controls.enableDamping = true;    // 动态阻尼系数 就是鼠标拖拽旋转灵敏度    // controls.dampingFactor = 0.25;    // 是否可以缩放    controls.enableZoom = true;    // 是否自动旋转    // controls.autoRotate = true;    controls.autoRotateSpeed = 0.5;    // 设置相机距离原点的最近距离    // controls.minDistance  = 10;    // 设置相机距离原点的最远距离    controls.maxDistance = 10000;    // 是否开启右键拖拽    controls.enablePan = true;};
```

到此，我们已经把 threejs 基础元素介绍的差不多了，在这里还需要补充一些很容易遗漏的地方！

动画和及时更新

```
function animation() {    controls.update()    renderer.render(scene, camera);    // mesh.rotateY(0.01);    requestAnimationFrame(animation);}
```

补充一个知识点：

`requestAnimationFrame`

![](https://mmbiz.qpic.cn/sz_mmbiz_png/9Z5K66tFPiayzSfJ7tI7URI0ZhJHlvK98cicbn2YMpMVt5C4fp6KKJic5VpK3sSd3U7HmYf4s7wFr8ibkMX2mAtl1Q/640?wx_fmt=png&from=appmsg)

### 实现 3d 隧道监测基础

#### 实现道路

如图，我们首先实现发光这部分。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/9Z5K66tFPiayzSfJ7tI7URI0ZhJHlvK98NATy5icCTmvBoZolgjndnTJMefnDquYVLK24XxF03rKiaW5ZCmm4ibpDQ/640?wx_fmt=png&from=appmsg)![](https://mmbiz.qpic.cn/sz_mmbiz_png/9Z5K66tFPiayzSfJ7tI7URI0ZhJHlvK98JXbryscoI2QicZmyONcEsRP2TrNw3icB8jqg2I3zgVvP7x8h1nTXuTbQ/640?wx_fmt=png&from=appmsg)

这部分主要涉及的知识是给一个平面 (plane) 贴图，具体的知识我在代码块相应位置已经标注。

```
// 图加载器const loader = new THREE.TextureLoader();// 加载const texture = loader.load('/model/route.png', function(t) {  // eslint-disable-next-line no-param-reassign,no-multi-assign  t.wrapS = t.wrapT = THREE.RepeatWrapping; //是否重复渲染和css中的背景属性渲染方式很像  t.repeat.set(1, 1);});// 平面const geometryRoute = new THREE.PlaneGeometry(1024, 2400);const materialRoute = new THREE.MeshStandardMaterial({  map: texture, // 使用纹理贴图  side: THREE.BackSide, // 背面渲染});const plane = new THREE.Mesh(geometryRoute, materialRoute);plane.receiveShadow = true;plane.position.set(0, 8, 0);plane.rotateX(Math.PI / 2);scene.add(plane);
```

#### 实现隧道

现在我们实现发光这部分

![](https://mmbiz.qpic.cn/sz_mmbiz_png/9Z5K66tFPiayzSfJ7tI7URI0ZhJHlvK98e6OANCyibdTZn2Y16wMvx6sNHYRT8vFibw5VsvDySRvbbBMNaMFVHoBg/640?wx_fmt=png&from=appmsg)

这部分主要涉及的知识是引入一个 obj 模型，并给模型贴上贴图 (这里的材质是一个 mtl)

补充知识点：

*   OBJ 是一种 3D 模型文件，因此不包含动画、材质特性、贴图路径、动力学、粒子等信息 我们拿到一个隧道 obj 模型的文件打开看看，里面是什么
    

![](https://mmbiz.qpic.cn/sz_mmbiz_png/9Z5K66tFPiayzSfJ7tI7URI0ZhJHlvK98Wa41UG5H7Yuic6vVHvezeq2zv4vKpORlMhguicP80AYZOVXBryiaIIbkg/640?wx_fmt=png&from=appmsg)

mtl 文件（Material Library File）是材质库文件，描述的是物体的材质信息，ASCII 存储，任何文本编辑器可以将其打开和编辑。同理我们也可以打开看看，是个什么东西

![](https://mmbiz.qpic.cn/sz_mmbiz_png/9Z5K66tFPiayzSfJ7tI7URI0ZhJHlvK98dvvuz9q7grJ64fUZM0LxrWIvdDIVkRKFJLK2bTdd8X757YGZCwicurw/640?wx_fmt=png&from=appmsg)

从 obj 文件看出我们需要 tunnelWall.mtl 材质, 从 mtl 文件，看出我们需要 suidao.jpg 图片 (需要和模型放在同一级)，其实到这里我们还是回到了引入道路的那部分，模型 + 贴图环节。

但是还是有一些不同的地方的，首先使用的加载器不同

```
const mtlLoader = new MTLLoader();const loader = new OBJLoader(); // 在init函数中，创建loader变量，用于导入模型
```

其次我们的模型是属于建模自己构造的，可能你引入进来很大可能是加载不出来的！所以你需要打印对象，从中分析具体原因。

```
// 模型对象公共变量const modelsObj = {  tunnelWall: {    mtl: '/model/tunnelWall.mtl',    obj: '/model/tunnelWall.obj',    mesh: null,  },  camera: {    mtl: '/model/camera/摄像头方.mtl',    obj: '/model/camera/摄像头方.obj',    mesh: null,  },};mtlLoader.load(modelsObj.tunnelWall.mtl, material => {    material.preload();    // 设置材质的透明度    // mtl文件中的材质设置到obj加载器    loader.setMaterials(material);    loader.load(modelsObj.tunnelWall.obj, object => {        // 设置模型大小和中心点        object.children[0].geometry.computeBoundingBox();        object.children[0].geometry.center();        modelsObj.tunnelWall.mesh = object;        scene.add(object);    });});
```

#### 实现多个摄像头

现在我们实现摄像头部分

![](https://mmbiz.qpic.cn/sz_mmbiz_png/9Z5K66tFPiayzSfJ7tI7URI0ZhJHlvK981beicuvyvUrQKfqEx3dsFeRsPk5wiaic6Jia6NszRUbPEiagmp5cZKvw8ibQ/640?wx_fmt=png&from=appmsg)

这里其实和实现隧道大相径庭，只不过我们是多个，而隧道是单个。所以我们需要引入组 (group) 和克隆 (clone) 的概念。

知识点补充：

*   组对象 group：相当于一个身体有胳膊、头、腿，组成一个组。每个人组合可以再次分一个组。
    
*   克隆 clone: 字面意思就是克隆一个一模一样的你。但是需要和 copy 分开。
    

```
// 加载摄像头模型const loadCameraModel = () => {  const mtlLoader = new MTLLoader();  const loader = new OBJLoader(); // 在init函数中，创建loader变量，用于导入模型  mtlLoader.load(modelsObj.camera.mtl, material => {    material.preload();    // 设置材质的透明度    // mtl文件中的材质设置到obj加载器    loader.setMaterials(material);    loader.load(modelsObj.camera.obj, object => {      console.log(object);      // 设置模型大小      object.children[0].geometry.computeBoundingBox();      object.children[0].geometry.center();      modelsObj.camera.mesh = object;      cloneCameraModel(4, 60, 180);      cloneCameraModel(4, -200, 180);    });  });};// 克隆摄像头模型const cloneCameraModel = (cameraSize, lrInterval, baInterval) => {  const group = new THREE.Group();  for (let i = 0; i <= cameraSize; i += 1) {    modelsObj[`camera${i}`] = modelsObj.camera.mesh.clone();    modelsObj[`camera${i}`].position.set(lrInterval, 180, baInterval * (i % 2 === 0 ? -i : i));    modelsObj[`camera${i}`].scale.set(1, 1, 1);    group.add(modelsObj[`camera${i}`])  }  scene.add(group);};
```

#### 点击模型进行属性操作

这块我们需要涉及的知识点是点击操作 (Raycaster)、发光部分 (效果合成器，shader 渲染使用)、debugger 模式 (gui)

##### 首先我们实现对模型进行的点击，我们需要使用 raycaster 定义全局变量 mouse 初始化鼠标，光线追踪。可以这样定义：

```
// 获取鼠标坐标 处理点击某个模型的事件const mouse = new THREE.Vector2(); // 初始化一个2D坐标用于存储鼠标位置const raycaster = new THREE.Raycaster(); // 初始化光线追踪
```

知识点补充：

光线投射 raycaster：可以向特定方向投射光线，并测试哪些对象与其相交，由鼠标点击转为世界坐标的过程。就是把一个 2d 坐标转变成 3d 坐标的强大类！原理可以看这篇文章原理和推导过程 [2]

我们监听屏幕点击事件

```
const pcanvas = document.getElementById('threeMain');// 监听点击事件,pcanvaspcanvas.addEventListener('click', e => onmodelclick(e)); // 监听点击
```

计算点击坐标，屏幕坐标系转换成世界坐标系的过程。并赋值全局变量点击模型 clickModel。

```
const onmodelclick = event => {  console.log(event);  // 获取鼠标点击位置  mouse.x = (event.clientX / sizes.width) * 2 - 1;  mouse.y = -(event.clientY / sizes.height) * 2 + 1;  console.log(mouse);  raycaster.setFromCamera(mouse, camera);  const intersects = raycaster.intersectObjects(scene.children); // 获取点击到的模型的数组，从近到远排列  // const worldPosition = new THREE.Vector3(); // 初始化一个3D坐标，用来记录模型的世界坐标  if (intersects.length > 0) {    clickModel = intersects[0].object;     outlinePass.selectedObjects = [];    outlinePass.selectedObjects = [clickModel];  }};
```

#### 实现点击模型发光效果

threejs 提供了一个扩展库 EffectComposer.js, 通过这个我们可以实现一些后期处理效果。所谓后期处理，就像 ps 一样，对 threejs 的渲染结果进行后期处理，比如添加发光效果。我们结合高亮发光描边可以实现下图发光效果。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/9Z5K66tFPiayzSfJ7tI7URI0ZhJHlvK98ncicvQuxyBbcjzqIJwmabFUytg9Yq1ia9oxHPMtQjVVfR7SAnRDxOcnQ/640?wx_fmt=png&from=appmsg)

*   引入相关类
    

```
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass';import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader';import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass';
```

*   初始化三个全局变量
    

```
let composer;let effectFXAA;let outlinePass;
```

*   赋值选中发光模型
    

```
const onmodelclick = event => {...  if (intersects.length > 0) {    outlinePass.selectedObjects = [];    outlinePass.selectedObjects = [clickModel];  }};
```

*   初始化加载发光效果
    

```
// 效果合成器，shader渲染使用const initEffectComposer = () => {  // 处理模型闪烁问题【优化展示网格闪烁】  // const parameters = { format: THREE.RGBAFormat };  // const size = renderer.getDrawingBufferSize(new THREE.Vector2());  // const renderTarget = new THREE.WebGLMultipleRenderTargets(size.width, size.height, parameters);  composer = new EffectComposer(renderer);  const renderPass = new RenderPass(scene, camera);  composer.addPass(renderPass);  outlinePass = new OutlinePass(new THREE.Vector2(sizes.width, sizes.height), scene, camera);  outlinePass.visibleEdgeColor.set(255, 255, 0);  outlinePass.edgeStrength = 1.0; // 边框的亮度  outlinePass.edgeGlow = 1; // 光晕[0,1]  outlinePass.usePatternTexture = false; // 是否使用父级的材质  outlinePass.edgeThickness = 1.0; // 边框宽度  outlinePass.downSampleRatio = 1; // 边框弯曲度  composer.addPass(outlinePass);  const outputPass = new OutputPass();  composer.addPass(outputPass);  effectFXAA = new ShaderPass(FXAAShader);  effectFXAA.uniforms.resolution.value.set(1 / sizes.width, 1 / sizes.height);  composer.addPass(effectFXAA);};
```

*   渲染循环执行
    

```
function animation() {  stats.update();  renderer.render(scene, camera);  composer.render();  // mesh.rotateY(0.01);  requestAnimationFrame(animation);}
```

如果你对这部分有很多疑问的话，你可以参考这篇文章 [3]

#### debugger 模式 这节主要涉及 gui，并且补充一下阴影的知识。gui 是一个图形用户界面工具, 我们可以通过这个工具实现对属性进行动态的操作，很方便。下面标红的就是我们的界面工具

![](https://mmbiz.qpic.cn/sz_mmbiz_png/9Z5K66tFPiayzSfJ7tI7URI0ZhJHlvK98TPtC6BXkCp5NS7nWIRtXONd77QJk7eyNxCOfKfZMncTibXdzLO5hyew/640?wx_fmt=png&from=appmsg)

我们通过增加点光源来举个例子。

*   首先我们初始化全局变量 gui 并且赋值
    

```
// debuggerlet gui;function initDebugger() {  gui = new GUI();}
```

*   定义全局变量 debugObject 需要改变的属性。
    

```
// debugger属性const debugObject = {  light: {    pointLight: {      color: 0xff0000,      position: {        x: 0,        y: 400,        z: 1800,      },    },  },};
```

*   定义点光源，对点光源的位置和颜色属性动态切换
    

```
// 点光源const pointLight = new THREE.PointLight(debuggerPointLight.color, 1);pointLight.castShadow = true;pointLight.position.set(100, 100, 300);scene.add(pointLight);const pointLightFolder = lightFolder.addFolder('点光源');pointLightFolder.addColor(debuggerPointLight, 'color').onChange(function(value) {  pointLight.color.set(value);});// 点光源位置pointLightFolder.add(debuggerPointLight.position, 'x', -1000, 1000).onChange(function(value) {  pointLight.position.x = value;  pointLightHelper.update();});pointLightFolder.add(debuggerPointLight.position, 'y', -1000, 1000).onChange(function(value) {  pointLight.position.y = value;  pointLightHelper.update();});pointLightFolder.add(debuggerPointLight.position, 'z', -1000, 1000).onChange(function(value) {  pointLight.position.z = value;  pointLightHelper.update();});
```

实现效果如图

![](https://mmbiz.qpic.cn/sz_mmbiz_png/9Z5K66tFPiayzSfJ7tI7URI0ZhJHlvK98KbzavdGCQOTSNFglOMqeYiahZ1ria9GMqspDUkW09FS5mu5FTQhkEgmQ/640?wx_fmt=png&from=appmsg)![](https://mmbiz.qpic.cn/sz_mmbiz_png/9Z5K66tFPiayzSfJ7tI7URI0ZhJHlvK98DfrowcKbSkqcRmRkKJjAa09W4ia0ibjQPuSb51ic7HMRDZ3u1YOnNU6xw/640?wx_fmt=png&from=appmsg)![](https://mmbiz.qpic.cn/sz_mmbiz_png/9Z5K66tFPiayzSfJ7tI7URI0ZhJHlvK98WeykZHAetFZ29QINItrLDcUwdl1k8dCUv03z0RBsfs8vTptGsV71Hw/640?wx_fmt=png&from=appmsg)

*   开启阴影
    

###### 阴影渲染

```
renderer = new THREE.WebGLRenderer({  ...});renderer.shadowMap.enabled = true;
```

###### 点光源投射光影

```
const pointLight = new THREE.PointLight(debuggerPointLight.color, 1);pointLight.castShadow = true;
```

###### 模型和道路接受阴影和投射阴影

```
plane.receiveShadow = true;
```

```
loader.load(modelsObj.tunnelWall.obj, object => {  object.traverse(obj => {    if (obj.castShadow !== undefined) {      // 开启投射影响      // eslint-disable-next-line no-param-reassign      obj.castShadow = true;      // 开启被投射阴影      // eslint-disable-next-line no-param-reassign      obj.receiveShadow = true;    }  });
```

### 性能监视器 stats

一个计算渲染分辨率 FPS 的工具，在这里提一下。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/9Z5K66tFPiayzSfJ7tI7URI0ZhJHlvK98VNcicEkYBgJxUHCuxdGm2szuJtqCvKsB0suoSGZ2QtIVzk4dnNic9HJQ/640?wx_fmt=png&from=appmsg)

#### 引入

```
import Stats from 'three/examples/jsm/libs/stats.module';
```

#### 使用

```
// 性能监视器let stats;document.getElementById('threeMain').appendChild(stats.domElement);function initStats() {  stats = new Stats();  stats.showPanel(1); // 0: fps, 1: ms, 2: mb, 3+: custom}function animation() {  stats.update();  renderer.render(scene, camera);  composer.render();  // mesh.rotateY(0.01);  requestAnimationFrame(animation);}
```

### 总结

这是我们实现目标的一个小小起点，属于冰山一角，前路漫漫，还需要阅读很多知识文档和试错阶段，如果你对后续感兴趣的话，可以跟进一下呀！谢谢！

### 完整代码

```
import React, { useEffect } from 'react';import * as THREE from 'three';// eslint-disable-next-line import/extensionsimport { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';// eslint-disable-next-line import/extensionsimport { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';import Stats from 'three/examples/jsm/libs/stats.module';// eslint-disable-next-line import/extensionsimport { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass';import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader';import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass';export default function ThreeVisual() {  // 场景  let scene;  // 相机  let camera;  // 控制器  let controls;  // 网络模型  let mesh;  // 渲染器  let renderer;  // 性能监视器  let stats;  // debugger  let gui;  // 当前点击模型  let clickModel;  // 当前点击需要使用的  let composer;  let effectFXAA;  let outlinePass;  // debugger属性  const debugObject = {    light: {      amlight: {        color: 0xffffff,      },      directionalLight: {        color: 0xffffff,        position: {          x: 0,          y: 400,          z: 1800,        },      },      pointLight: {        color: 0xff0000,        position: {          x: 0,          y: 400,          z: 1800,        },      },    },    model: {      wall: {        position: {          x: 0,          y: 210,          z: 0,        },        scale: 0.12,        opacity: {          wallTopOpa: 0.4,          wallSideOpa: 1,        },      },      camera: {        position: {          x: 100,          y: 100,          z: 100,        },        scale: 1,      },    },  };  // 模型对象  const modelsObj = {    tunnelWall: {      mtl: '/model/tunnelWall.mtl',      obj: '/model/tunnelWall.obj',      mesh: null,    },    camera: {      mtl: '/model/camera/摄像头方.mtl',      obj: '/model/camera/摄像头方.obj',      mesh: null,    },  };  const sizes = {    width: window.innerWidth,    height: window.innerHeight,  };  // 获取鼠标坐标 处理点击某个模型的事件  const mouse = new THREE.Vector2(); // 初始化一个2D坐标用于存储鼠标位置  const raycaster = new THREE.Raycaster(); // 初始化光线追踪  useEffect(() => {    // eslint-disable-next-line no-use-before-define    threeStart();  }, []);  const initThree = () => {    const width = document.getElementById('threeMain').clientWidth;    const height = document.getElementById('threeMain').clientHeight;    renderer = new THREE.WebGLRenderer({      antialias: true,      logarithmicDepthBuffer: true,    });    renderer.shadowMap.enabled = true;    renderer.setSize(width, height);    document.getElementById('threeMain').appendChild(renderer.domElement);    // renderer.setClearColor(0xFFFFFF, 1.0);    document.getElementById('threeMain').appendChild(stats.domElement);  };  const initCamera = (width, height) => {    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000);    camera.position.x = 0;    camera.position.y = 500;    camera.position.z = 1300;    camera.up.x = 0;    camera.up.y = 1;    camera.up.z = 0;    camera.lookAt({      x: 0,      y: 0,      z: 0,    });    // 创建相机视锥体辅助对象    // const cameraPerspectiveHelper = new THREE.CameraHelper(camera);    // scene.add(cameraPerspectiveHelper);  };  const initScene = () => {    scene = new THREE.Scene();    scene.background = new THREE.Color(0xbfd1e5);  };  const initLight = () => {    const lightFolder = gui.addFolder('光');    const {      directionalLight: debuggerDirectionalLight,      pointLight: debuggerPointLight,    } = debugObject.light;    // 环境光    // const amlight = new THREE.AmbientLight(debugObject.light.amlight.color);    // amlight.position.set(1000, 1000, 1000);    // scene.add(amlight);    // // 环境光debugger    // const amlightFolder=lightFolder.addFolder("环境光")    // amlightFolder.addColor(debugObject.light.amlight, 'color').onChange(function(value){    //   amlight.color.set(value);    // });    // 平行光    // 创建平行光，颜色为白色，强度为 10    const directionalLight = new THREE.DirectionalLight(debuggerDirectionalLight.color, 1);    // 设置平行光的方向    directionalLight.position.set(0, 400, 1000);    directionalLight.castShadow = true;    const directonalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 20);    // scene.add(directonalLightHelper);    scene.add(directionalLight);    // 平行光debugger    const directionalLightFolder = lightFolder.addFolder('平行光');    directionalLightFolder.addColor(debuggerDirectionalLight, 'color').onChange(function(value) {      directionalLight.color.set(value);    });    // 平行光位置    directionalLightFolder      .add(debuggerDirectionalLight.position, 'x', -1000, 1000)      .onChange(function(value) {        directionalLight.position.x = value;        directonalLightHelper.update();      });    directionalLightFolder      .add(debuggerDirectionalLight.position, 'y', -1000, 1000)      .onChange(function(value) {        directionalLight.position.y = value;        directonalLightHelper.update();      });    directionalLightFolder      .add(debuggerDirectionalLight.position, 'z', -1000, 1000)      .onChange(function(value) {        directionalLight.position.z = value;        directonalLightHelper.update();      });    // 点光源    const pointLight = new THREE.PointLight(debuggerPointLight.color, 1);    pointLight.castShadow = true;    pointLight.position.set(100, 100, 300);    const sphereSize = 10;    const pointLightHelper = new THREE.PointLightHelper(pointLight, sphereSize);    scene.add(pointLight);    scene.add(pointLightHelper);    const pointLightFolder = lightFolder.addFolder('点光源');    pointLightFolder.addColor(debuggerPointLight, 'color').onChange(function(value) {      pointLight.color.set(value);    });    // 点光源位置    pointLightFolder.add(debuggerPointLight.position, 'x', -1000, 1000).onChange(function(value) {      pointLight.position.x = value;      pointLightHelper.update();    });    pointLightFolder.add(debuggerPointLight.position, 'y', -1000, 1000).onChange(function(value) {      pointLight.position.y = value;      pointLightHelper.update();    });    pointLightFolder.add(debuggerPointLight.position, 'z', -1000, 1000).onChange(function(value) {      pointLight.position.z = value;      pointLightHelper.update();    });  };  const initObject = () => {    const geometry = new THREE.BoxGeometry(3000, 6, 2400);    const loader = new THREE.TextureLoader();    const texture = loader.load('/model/route.png', function(t) {      // eslint-disable-next-line no-param-reassign,no-multi-assign      t.wrapS = t.wrapT = THREE.RepeatWrapping;      t.repeat.set(1, 1);    });    const material = new THREE.MeshBasicMaterial({ color: 0xcccccc });    geometry.position = new THREE.Vector3(0, 0, 0);    mesh = new THREE.Mesh(geometry, [material, material, material, material, material, material]);    mesh.receiveShadow = true; // cast投射，方块投射阴影    scene.add(mesh);    // 平面    const geometryRoute = new THREE.PlaneGeometry(1024, 2400);    const materialRoute = new THREE.MeshStandardMaterial({      map: texture, // 使用纹理贴图      side: THREE.BackSide, // 两面都渲染    });    const plane = new THREE.Mesh(geometryRoute, materialRoute);    plane.receiveShadow = true;    plane.position.set(0, 8, 0);    plane.rotateX(Math.PI / 2);    scene.add(plane);  };  const initControl = () => {    // 将renderer关联到container，这个过程类似于获取canvas元素    const pcanvas = document.getElementById('threeMain');    controls = new OrbitControls(camera, pcanvas);    // 如果使用animate方法时，将此函数删除    // controls.addEventListener( 'change', render );    // 使动画循环使用时阻尼或自转 意思是否有惯性    controls.enableDamping = true;    // 动态阻尼系数 就是鼠标拖拽旋转灵敏度    // controls.dampingFactor = 0.25;    // 是否可以缩放    controls.enableZoom = true;    // 是否自动旋转    // controls.autoRotate = true;    controls.autoRotateSpeed = 0.5;    // 设置相机距离原点的最近距离    // controls.minDistance  = 10;    // 设置相机距离原点的最远距离    controls.maxDistance = 10000;    // 是否开启右键拖拽    controls.enablePan = true;  };  const onmodelclick = event => {    console.log(event);    // 获取鼠标点击位置    mouse.x = (event.clientX / sizes.width) * 2 - 1;    mouse.y = -(event.clientY / sizes.height) * 2 + 1;    console.log(mouse);    raycaster.setFromCamera(mouse, camera);    const intersects = raycaster.intersectObjects(scene.children); // 获取点击到的模型的数组，从近到远排列    // const worldPosition = new THREE.Vector3(); // 初始化一个3D坐标，用来记录模型的世界坐标    if (intersects.length > 0) {      clickModel = intersects[0].object;      outlinePass.selectedObjects = [];      outlinePass.selectedObjects = [clickModel];      // intersects[0].object.getWorldPosition(worldPosition); // 将点中的3D模型坐标记录到worldPosition中      // const texture = new THREE.TextureLoader().load("/model/route.png");      // const spriteMaterial = new THREE.SpriteMaterial({      //   map: texture,// 设置精灵纹理贴图      // });      // const sprite = new THREE.Sprite(spriteMaterial); // 精灵模型，不管从哪个角度看都可以一直面对你      // scene.add(sprite);      // sprite.scale.set(40,40,40);      // sprite.position.set(worldPosition.x, worldPosition.y + 8, worldPosition.z); // 根据刚才获取的世界坐标设置精灵模型位置，高度加了3，是为了使精灵模型显示在点击模型的上方    }  };  const initEvent = () => {    window.addEventListener('resize', () => {      // Update sizes      sizes.width = window.innerWidth;      sizes.height = window.innerHeight;      // Update camera      camera.aspect = sizes.width / sizes.height;      camera.updateProjectionMatrix();      // Update renderer      renderer.setSize(sizes.width, sizes.height);      composer.setSize(sizes.width, sizes.height);      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));      effectFXAA.uniforms.resolution.value.set(1 / sizes.width, 1 / sizes.height);    });    const pcanvas = document.getElementById('threeMain');    // 监听点击事件    pcanvas.addEventListener('click', e => onmodelclick(e)); // 监听点击  };  const loadModel = () => {    const mtlLoader = new MTLLoader();    const loader = new OBJLoader(); // 在init函数中，创建loader变量，用于导入模型    mtlLoader.load(modelsObj.tunnelWall.mtl, material => {      material.preload();      // 设置材质的透明度      // mtl文件中的材质设置到obj加载器      loader.setMaterials(material);      loader.load(modelsObj.tunnelWall.obj, object => {        object.traverse(obj => {          if (obj.castShadow !== undefined) {            // 开启投射影响            // eslint-disable-next-line no-param-reassign            obj.castShadow = true;            // 开启被投射阴影            // eslint-disable-next-line no-param-reassign            obj.receiveShadow = true;          }        });        // 设置模型大小        object.children[0].geometry.computeBoundingBox();        object.children[0].geometry.center();        // debugger模型属性        const { scale, position, opacity } = debugObject.model.wall;        // 模型本有属性        const {          scale: changeScale,          position: changePositon,          material: changeMaterial,        } = object.children[0];        changeScale.set(scale, scale, scale);        changePositon.set(position.x, position.y, position.z);        changeMaterial[0].transparent = true;        changeMaterial[0].opacity = opacity.wallTopOpa;        changeMaterial[1].transparent = true;        changeMaterial[1].opacity = opacity.wallSideOpa;        modelsObj.tunnelWall.mesh = object;        scene.add(object);        // 模型debugger        const modelFolder = gui.addFolder('模型');        const wallFolder = modelFolder.addFolder('墙');        wallFolder          .add(position, 'x', -100, 300)          .step(0.5)          .onChange(function(value) {            changePositon.x = value;          });        wallFolder          .add(position, 'y', -100, 300)          .step(0.5)          .onChange(function(value) {            changePositon.y = value;          });        wallFolder          .add(position, 'z', -100, 300)          .step(0.5)          .onChange(function(value) {            changePositon.z = value;          });        wallFolder          .add(debugObject.model.wall, 'scale', 0.01, 0.3)          .step(0.001)          .onChange(function(value) {            changeScale.set(value, value, value);          });        wallFolder          .add(opacity, 'wallTopOpa', 0, 1)          .step(0.01)          .onChange(function(value) {            changeMaterial[0].opacity = value;          });        wallFolder          .add(opacity, 'wallSideOpa', 0, 1)          .step(0.01)          .onChange(function(value) {            changeMaterial[1].opacity = value;          });      });    });  };  // 克隆摄像头模型  const cloneCameraModel = (cameraSize, lrInterval, baInterval) => {    const group = new THREE.Group();    for (let i = 0; i <= cameraSize; i += 1) {      modelsObj[`camera${i}`] = modelsObj.camera.mesh.clone();      modelsObj[`camera${i}`].position.set(lrInterval, 180, baInterval * (i % 2 === 0 ? -i : i));      modelsObj[`camera${i}`].scale.set(1, 1, 1);      group.add(modelsObj[`camera${i}`])    }    scene.add(group);  };  // 加载摄像头模型  const loadCameraModel = () => {    const mtlLoader = new MTLLoader();    const loader = new OBJLoader(); // 在init函数中，创建loader变量，用于导入模型    mtlLoader.load(modelsObj.camera.mtl, material => {      material.preload();      // 设置材质的透明度      // mtl文件中的材质设置到obj加载器      loader.setMaterials(material);      loader.load(modelsObj.camera.obj, object => {        object.traverse(obj => {          if (obj.castShadow !== undefined) {            // 开启投射影响            // eslint-disable-next-line no-param-reassign            obj.castShadow = true;            // 开启被投射阴影            // eslint-disable-next-line no-param-reassign            obj.receiveShadow = true;          }        });        console.log(object);        // 设置模型大小        object.children[0].geometry.computeBoundingBox();        object.children[0].geometry.center();        // debugger模型属性        object.children[0].scale.set(1, 1, 1);        object.children[0].position.set(100, 100, 100);        modelsObj.camera.mesh = object;        cloneCameraModel(4, 60, 180);        cloneCameraModel(4, -200, 180);      });    });  };  // 效果合成器，shader渲染使用  const initEffectComposer = () => {    // 处理模型闪烁问题【优化展示网格闪烁】    // const parameters = { format: THREE.RGBAFormat };    // const size = renderer.getDrawingBufferSize(new THREE.Vector2());    // const renderTarget = new THREE.WebGLMultipleRenderTargets(size.width, size.height, parameters);    composer = new EffectComposer(renderer);    const renderPass = new RenderPass(scene, camera);    composer.addPass(renderPass);    outlinePass = new OutlinePass(new THREE.Vector2(sizes.width, sizes.height), scene, camera);    outlinePass.visibleEdgeColor.set(255, 255, 0);    outlinePass.edgeStrength = 1.0; // 边框的亮度    outlinePass.edgeGlow = 1; // 光晕[0,1]    outlinePass.usePatternTexture = false; // 是否使用父级的材质    outlinePass.edgeThickness = 1.0; // 边框宽度    outlinePass.downSampleRatio = 1; // 边框弯曲度    composer.addPass(outlinePass);    const outputPass = new OutputPass();    composer.addPass(outputPass);    effectFXAA = new ShaderPass(FXAAShader);    effectFXAA.uniforms.resolution.value.set(1 / sizes.width, 1 / sizes.height);    composer.addPass(effectFXAA);  };  function animation() {    stats.update();    renderer.render(scene, camera);    composer.render();    // mesh.rotateY(0.01);    requestAnimationFrame(animation);  }  function initHelper() {    // const axesHelper = new THREE.AxesHelper(3000);    // scene.add(axesHelper);  }  function initStats() {    stats = new Stats();    stats.showPanel(1); // 0: fps, 1: ms, 2: mb, 3+: custom  }  function initDebugger() {    gui = new GUI();  }  function threeStart() {    initEvent();    initStats();    initDebugger();    initThree();    initScene();    initCamera(sizes.width, sizes.height);    initHelper();    initLight();    initControl();    initObject();    loadModel();    loadCameraModel();    initEffectComposer();    animation();  }  return <div id="threeMain" style={{ width: '100vw', height: '100vh' }} />;}
```

参考资料

[1]

材质贴图: _https://juejin.cn/post/7129065605461884964_

[2]

原理和推导过程: _https://www.cnblogs.com/smedas/p/12445201.html_

[3]

后处理 (发光描边 OutlinePass): _http://www.webgl3d.cn/pages/e1e75d/_

作者：柳杉 

链接：https://juejin.cn/post/7273987266523136056

**感谢您的阅读** 

**在看点赞 好文不断** ![](https://mmbiz.qpic.cn/sz_mmbiz_gif/9Z5K66tFPiazs3Z89Vu31cicxIlNVosLUvhm5NeWUmR81LicIsMwfpJ4RbgB7JHXiaapIw5Yu29m9Io2oC67zGGBqA/640?wx_fmt=gif)