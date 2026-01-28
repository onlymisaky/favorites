> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/-QXA-4B4qRW0gvXRv6RFWg)

> 本文作者系 360 奇舞团前端开发工程师

最近 Sora2 推出后迅速流行，其对于音画生成结合的能力，让画面常常有以假乱真的效果，但有时大概也会有这种感觉：  
画面已经够清晰了、动作也顺畅了，可有时它依然 “假”——  
像是一个完美的模拟，却没有那种 “被镜头记录下来” 的感觉。

其中原因是：AI 生成的是**内容**，而真实视频包含的是**物理规律 + 摄影语言 + 人的意图**。  
所以在生成视频时，需要使用一些细节补充技巧，来让如 Sora2 等 AI 视频工具稳定产出真实度更高的视频。

### 1. 光影：统一 “时间、天气与材质逻辑”

在所有 “假感” 来源里，**光影错误是最致命的**。  AI 可能让太阳在右边，却把阴影打到左边；或者街面是湿的，但反射却死板。  真实画面的底层逻辑是 “光线的因果链”——太阳在哪、地面湿不湿、空气有没有雾气、材质怎么反光，这些都必须呼应。

#### 建议

*   明确写出时间段（清晨、黄金时刻、夜晚）
    
*   指定光线方向和色温
    
*   天气决定反射与色彩饱和度
    
*   提到 “湿地面”“金属”“玻璃” 等反射体
    

**Prompt 示例：**

```
一个黄金时刻的城市街头，太阳从画面右后方照射，地面因刚下过雨略湿，反光柔和。空气中有轻雾，远处建筑对比度降低，玻璃橱窗反射着夕阳光线。人物在暖色光中行走，阴影方向与光源一致，整体色调自然温暖。
```

```
A city street at golden hour, sunlight coming from the back-right, wet asphalt softly reflecting the light.A slight mist in the air reduces contrast in distant buildings; glass windows catch warm sunlight reflections.A person walks through the scene, shadows align with the light source, overall tone warm and cinematic.
```

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/cAd6ObKOzEChdayQzqNHTpVCczicuUibYjCkdZzoFCFv26vjf596ZTpbMq4245JejoOQdsbpux0Xps1dJ4jFxichw/640?wx_fmt=gif&from=appmsg#imgIndex=0)

### 2. 手持镜头：加入 “人类操作者” 的痕迹

真实的视频几乎从不会完全稳定。  即便是用云台拍摄，也会有微小的呼吸摆动、轻微的起稳停稳。  
AI 生成的 “完美稳定” 反而让人一眼就能看出是假。  所以我们要刻意制造一点点“人类的不完美”。

#### 建议

*   加入轻微抖动（幅度 0.8%~1.2%）
    
*   镜头移动时保留 “起稳 - 停稳” 的惯性（约 0.3 秒）
    
*   焦点偶尔轻微游移再回到主体（focus hunting）
    

** Prompt 示例：**

```
使用手持摄影机拍摄的采访现场，画面有轻微上下晃动。摄像师呼吸造成画面节奏变化，焦点在人物讲话时偶尔偏离后再自动拉回。整体稳定但非机械化，保留真实人类手持质感。
```

```
A handheld interview scene, slight vertical micro-shake as the operator breathes.The focus drifts briefly away during speech, then smoothly returns.Overall stable yet organic, conveying a human-held camera feel.
```

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/cAd6ObKOzEChdayQzqNHTpVCczicuUibYjWOl97v0Gkic6rM1Zqw2LSjoT3XsHqLPe18QWv9xTwY4ZDVeW9W7Kibcw/640?wx_fmt=gif&from=appmsg#imgIndex=1)

### 3 景深与对焦：让画面有 “视线逻辑”

我们的眼睛并不是全清晰的，注意力总在切换。  AI 镜头若每一帧都清晰无比，就会显得 “像动画”。  
景深变化（Depth of Field）与拉焦（Rack Focus）是最有效的 “真实信号”。

#### 建议

*   模拟 “焦点从前景→背景” 的平滑过渡
    
*   指定焦距（35mm 或 50mm）与光圈（f/2.0~2.8）
    
*   控制拉焦时间约 2 秒，使用自然曲线（ease in-out）
    

** Prompt 示例：**

```
摄像机使用50mm镜头，光圈f/2.0。镜头起始时对焦在前景人物眼睛，2秒后缓慢将焦点拉到远处的公交站牌。背景清晰后前景变得柔和，散景高光呈猫眼形。
```

```
Camera with 50mm lens, aperture f/2.0.Begin focused on the subject’s eyes in the foreground; over 2 seconds, rack focus smoothly to the distant bus sign.The background becomes clear as the foreground softly blurs, bokeh highlights take a cat-eye shape.
```

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/cAd6ObKOzEChdayQzqNHTpVCczicuUibYjgFmgSPosPGOCpSMiaBDUb0OURHFKEEmlLOSnIhdIBzwbEiaI9wUq0q5A/640?wx_fmt=gif&from=appmsg#imgIndex=2)

### 4. 光学瑕疵：让镜头稍微不完美

完美的画面往往不可信。真实镜头会出现微弱的暗角、色差、光晕，甚至传感器噪点。  
这些小瑕疵，就像 “真实世界的指纹”。

#### 建议

*   暗角控制在 5%~8%
    
*   高亮处允许轻微耀斑（lens flare）
    
*   保留暗部轻度噪声，不可模糊纹理
    

** Prompt 示例：**

```
画面四角带有约5%的轻微暗角，左上角的光源形成淡淡的镜头光晕。高反差边缘有细微色差，暗部存在轻微颗粒噪声，但细节依然清晰。整体光学质感真实自然。
```

```
Slight 5% vignette around corners, a soft lens flare from the top-left light source.Minor chromatic aberration on high-contrast edges, faint sensor noise in shadows but details preserved.Overall image feels optically authentic.
```

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/cAd6ObKOzEChdayQzqNHTpVCczicuUibYjaC30CBcNCs88ibzXQxTxtf5BZu0uBE3O0DibNfx57ewOjFszthdVHxHA/640?wx_fmt=gif&from=appmsg#imgIndex=3)

#### 5. 微动作：打破 AI 的 “完美姿态”

AI 人物常常动作太流畅、太精准，没有那种 “下意识的小失误”。  但正是这些不完美的微动作，让人物显得更真实、有生命。

#### 建议

*   在动作中加入 “轻微纠偏”
    
*   模拟 “反应链”：扰动 → 补偿 → 恢复
    
*   让表情与身体动作有延迟匹配
    

**Prompt 示例：**

```
一名男子端着咖啡走过人群，被轻轻撞到后杯子微晃。他下意识用另一只手扶稳杯身，轻笑示意无碍。液面出现细微涟漪，1秒后恢复平静。
```

```
A man carrying coffee gets lightly bumped in a crowd; the cup shakes slightly.He instinctively steadies it with his other hand and smiles politely.Tiny ripples form on the coffee’s surface, settling after about a second.
```

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/cAd6ObKOzEChdayQzqNHTpVCczicuUibYjA9wvjCy9pjR8ibmCGZUZjSBWn5GyJKNr4z10RQhqbYIqvuEJ2BuZpXg/640?wx_fmt=gif&from=appmsg#imgIndex=4)

### 6. 材质的真实感

AI 生成画面最常见的问题是：所有材质都太干净。  皮肤像塑料、衣服像贴图。  而真实世界的材质充满细节：纹理、磨损、反光、灰尘。

#### 建议

*   明确写出材质类别与质地（毛衣、金属、玻璃）
    
*   给出表面状态（旧、磨砂、有划痕）
    
*   确保光线能 “验证” 这些质感
    

** Prompt 示例：**

```
在下午四点的街头，一位年轻女性站在阳光下等待朋友。阳光从画面右上方照射，角度约35度，形成自然暖光。她穿着浅米色针织上衣，布料柔软、有清晰纤维纹理和细微褶皱；牛仔裤质地厚实，膝盖处有轻微磨损痕迹；肩上背着深棕皮质包，表面略旧、有细微折痕与反光高光；她的皮肤有自然毛孔与淡淡油光，阳光透过发丝在脸颊形成细微散射；背景玻璃橱窗映出她模糊的倒影，玻璃边缘有轻微高光滚动；画面色温偏暖（约4800K），整体曝光自然，光线与材质互动真实细腻。
```

```
A young woman stands on a city street at 4 p.m., sunlight coming from the upper right at a 35° angle.She wears a light beige knitted sweater with visible fiber texture and soft wrinkles,paired with slightly worn denim jeans with subtle fading around the knees.A dark brown leather bag hangs on her shoulder, showing natural creases and specular highlights along the strap edges.Her skin reveals fine pores and a gentle oil sheen; sunlight diffuses softly through her hair, scattering warm light across her cheek.Behind her, a glass shop window reflects a faint blurred silhouette, with specular glints sliding as the camera moves.Color temperature is around 4800K, overall tone warm and natural, with convincing material-light interaction that feels truly photographed.
```

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/cAd6ObKOzEChdayQzqNHTpVCczicuUibYj7aia5FzfaIV8y1ibvtvBrySLxfcDM3PY4fQduMAJ1m0uV2ia113QV0MLQ/640?wx_fmt=gif&from=appmsg#imgIndex=5)

### 7.  环境动力：风、空气、粒子要有共鸣

当风吹过时，应该不仅是头发动，衣服、灰尘、旗帜、甚至阳光束里的尘粒，都应随之反应。  
真实世界的物理统一性，AI 往往忽略。

#### 建议

*   指定风速与方向
    
*   描述衣物、头发的延迟反应
    
*   让尘粒随风漂浮，并在逆光下可见
    

**Prompt 示例：**

```
微风从左至右吹过，人物长发分层飘动，肩带略有延迟摆动。空气中漂浮的灰尘与阳光形成可见光束，运动方向一致。
```

```
A gentle breeze blows left to right, layered hair swaying, shoulder strap swinging with slight delay.Floating dust particles catch the sunlight beams, moving consistently with the wind direction.
```

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/cAd6ObKOzEChdayQzqNHTpVCczicuUibYj7IQOYf5q1o0Su4fsJFkWZ7FQVbpTq1xWWsObVBqHByEKibCV9h9sibeg/640?wx_fmt=gif&from=appmsg#imgIndex=6)

### 8. 摄影机逻辑

AI 生成的视频往往忽略 “摄影师的意图”。  但真实镜头的运动不是随意的，而是想让观众看哪里。

#### 建议

*   机位高度约 1.6 米（人眼视角）
    
*   使用 “推近—停稳—遮挡收尾” 结构
    
*   前景遮挡创造纵深感
    

**Prompt 示例：**

```
摄像机以人眼高度从右向左缓慢移动。前景路人偶尔遮挡画面，增加层次。5秒时定格于主角半身，再以路人遮挡自然结束。
```

```
Camera tracks right to left at eye level.Occasional passersby occlude the frame, adding depth.At 5 seconds, the shot settles on a medium close-up, ending with a natural occlusion.
```

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/cAd6ObKOzEChdayQzqNHTpVCczicuUibYj1Fbo4KLSWMwe3iatpblSvAqicmRUYUYJ6lNUyBiaAJ7VdoOp4FTXBtURg/640?wx_fmt=gif&from=appmsg#imgIndex=7)

### 9. 微剧情：给画面 “一个理由”

再美的画面，如果人物没有目的，就像 AI 在 “摆姿势”。  哪怕是最简单的动作——看表、避雨、抬头——只要有因果，它就可信。

** Prompt 示例：**

```
女孩在阴天的公交站等车，手机提醒还有两分钟。她看了看表，抬头张望，公交驶来溅起水花，她后退一步避开。车停下，她回头确认没落下雨伞，然后上车。
```

```
A girl waits at a bus stop on a cloudy day; her phone alerts, “bus in 2 minutes.”She checks her watch, looks up; as the bus splashes toward her, she steps back.After it stops, she glances behind to make sure she didn’t forget her umbrella, then boards.
```

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/cAd6ObKOzEChdayQzqNHTpVCczicuUibYjOpsdzCcVTgrwKC9aOauPdqREdDSL1KKlUicricOU2PDiab6qRWshuicqkw/640?wx_fmt=gif&from=appmsg#imgIndex=8)

### 10. 保留瑕疵

纪录片的真实感，往往来自那些肉眼察觉不到的小瑕疵。  轻微胶片颗粒、rolling shutter 倾斜、运动模糊，这些细节能打破 “AI 感”。

**Prompt 示例：**

```
在快速平移的镜头中，出现轻微rolling shutter倾斜；画面略带胶片颗粒，边缘有细微压缩痕迹但细节仍可读。整体色彩微微去饱和，保持纪录片质感。
```

```
During a fast pan, slight rolling-shutter skew appears.Fine film grain and minimal compression artifacts visible, but details remain legible.Colors are subtly desaturated for a documentary tone.
```

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/cAd6ObKOzEChdayQzqNHTpVCczicuUibYjWzPTiazeq8c4L03l4gYA2q3mghbkwDciaZhrhRfY3M5HBgPviagjIC82Q/640?wx_fmt=gif&from=appmsg#imgIndex=9)

结语
--

Sora2 等 AI 视频工具的强大在于它能模拟一切，但 “真实” 的关键在于**限制**—给它规则、物理、惯性、错误，它才会像人类拍的。别追求完美，而是**追求不完美的逻辑性**。  需要关注阴影，镜头呼吸，以及让风吹动等每一个细节。  当这些都合理恰当时，AI 生成的视频，就会开始 “有温度”。

-END -

**如果您关注前端 + AI 相关领域可以扫码进群交流**

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/cAd6ObKOzEArGqlLlZmLVB61keywZ2APgWHNwTdK8OicE1utUcAJj1m5ZMFTL8iac51bGglnIeCR5KHicCBh5lh3A/640?wx_fmt=jpeg#imgIndex=10)

添加小编微信进群😊  

关于奇舞团
-----

奇舞团是 360 集团最大的大前端团队，非常重视人才培养，有工程师、讲师、翻译官、业务接口人、团队 Leader 等多种发展方向供员工选择，并辅以提供相应的技术力、专业力、通用力、领导力等培训课程。奇舞团以开放和求贤的心态欢迎各种优秀人才关注和加入奇舞团。  

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEBLicibtcprJISN18FgTtg2N1ichPnMqRhicrP20VfwnC4vday7gtEoiaSynIH1bas4N5kgicliakrLdtT2Q/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1#imgIndex=11)