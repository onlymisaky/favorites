> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/llR4J_JFHI4xlOfSqTP-og)

> 本文作者为 360 奇舞团前端开发工程师

**引言**

在使用 css 样式进行样式的缩放、旋转等设置时，思考了一下它的较浅层的原理，恩，这个阶段都 是一些初高的数学计算，从新看这里的时候顺便捡了捡初高中的数学，比如三角函数之类。

**通用公式**

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzECYm7Vq0hcd6Zt1Lgx9TSic0tpaubKpEbykIPOsCicEKYRFYlAnerG3kN6mqkyianuoXjibiadgSoJxTiaw/640?wx_fmt=png)image.png

假设 A * B = Y。其中，A 为 m * n 的 m 行 n 列矩阵，B 为 1 * n 列的矩阵。B 拆分为列向量，并且列向量的维数就是矩阵的行数。

**方法**

transform(a, b, c, d, e, f) 与 Matrix 的转换。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzECYm7Vq0hcd6Zt1Lgx9TSic0XYnnx3EiaFtbedVRqv7ua56Ibvo42yZUVZiaoHZ6a45RamWJBLIpLVtw/640?wx_fmt=png)image.png

推导出来

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzECYm7Vq0hcd6Zt1Lgx9TSic0SU6LX1Xld1S92zlFZZJpqbHDRlsvvWWgfyRLicpFw7u7ROOzBqVh5XA/640?wx_fmt=png)image.png

简化后

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzECYm7Vq0hcd6Zt1Lgx9TSic0jAQqW5k8kaSEAyia6BMPed2jA5PPnDjsb9WoIibEArmqdUBJS9pwZnbQ/640?wx_fmt=png)image.png

**缩放**

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzECYm7Vq0hcd6Zt1Lgx9TSic0zA6Q9oQVYN4OwrRv4soribK58CIk7PM74aib2TTqfJYs3dNzVEicO1kEQ/640?wx_fmt=png)image.png

推导出来

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzECYm7Vq0hcd6Zt1Lgx9TSic0Bbyldbwp8DNCMhgoTUgiaHIdz8EtEiadmzmmzeELsYReLaUj5XibBfDcA/640?wx_fmt=png)image.png

```
.box {
  transform: scale(0.3, 0.6);
}
```

通过计算

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzECYm7Vq0hcd6Zt1Lgx9TSic0EvNnEr2uTYXfJYTjKrO4bib2BmNGdxw1EG60QT9DWrFMTvb8vm50uBw/640?wx_fmt=png)image.png

等价于

```
.box {
  transform: matrix(0.3, 0, 0, 0.6, 0, 0);
}
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzECYm7Vq0hcd6Zt1Lgx9TSic00oPeBEY2Ko2A3mUSibFXHjqPtlWACeSMvbDBR9IlQIxZtibmhkcTmw6Q/640?wx_fmt=png)image.png

**平移**

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzECYm7Vq0hcd6Zt1Lgx9TSic0VjPQYlRLP1vlP1VtibCGD1yP0w8yfoS3KbXs7I5wCAicQRlO2hUZ8ZVQ/640?wx_fmt=png)image.png

推导出来

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzECYm7Vq0hcd6Zt1Lgx9TSic0gb4YqvbIfuM5AicibZBu7GIDrmBicgiaskPUO4qF7xKZv584LTWStFu7ZQ/640?wx_fmt=png)image.png

**转旋**

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzECYm7Vq0hcd6Zt1Lgx9TSic06HznXRrPtR0iawZzTyqvEDbLzEY5n2XUvYUNdLvSgjufsfTMHPPYqFQ/640?wx_fmt=png)image.png

推导出来

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzECYm7Vq0hcd6Zt1Lgx9TSic0WKmYPJxJwP5IEn2OWrG3nyRK5OicNgvH0sS6PmWhmflvwrNe07kZwmg/640?wx_fmt=png)image.png

假设存在点 E 移动至点 F。设 E 坐标为 (x1, y1)，F 坐标为 (x2, y2)，D 坐标为 (a, b)。

简要图示:

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzECYm7Vq0hcd6Zt1Lgx9TSic080wnTDpV3yK0MGZCZaJicSuvIPLmias2w5KxncmeoXVX5VGljnKgFTrA/640?wx_fmt=png)image.png

初中数学：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzECYm7Vq0hcd6Zt1Lgx9TSic0YHlSRgb9SGex0d3Q7QWzn9T9YMk8MyshrqWMrd4UILqayiaibOEhaXlA/640?wx_fmt=png)image.png

演算：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzECYm7Vq0hcd6Zt1Lgx9TSic009N6aEYSuHlTfjx3H3k9IXSwPChVRGk6g5tGic9zrgJES40IAPyrlng/640?wx_fmt=png)image.png

推导：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzECYm7Vq0hcd6Zt1Lgx9TSic0L6QvRfY0WLuiaywARNiaIyb9Qky065whWowAXRgkdNEdu8lpbvAQvW7w/640?wx_fmt=png)image.png![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzECYm7Vq0hcd6Zt1Lgx9TSic040MaywepibSsfxrrGn2hQL1bHVCWNxGicYTHzPqm2t841DPMV8QV3DJg/640?wx_fmt=png)image.png

验证：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzECYm7Vq0hcd6Zt1Lgx9TSic0rQNCRkxBdiaZmwJXib3acIf6pPcgibfzAumJJAVUz8fhuzYwG3CFxTu9g/640?wx_fmt=png)image.png

转换为矩阵：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzECYm7Vq0hcd6Zt1Lgx9TSic0a9CFNnMQ21M6oG0tbZ5aCdLvdXddfPtdvQxLSpEZqjFb2RpeTFdFuA/640?wx_fmt=png)image.png

从 css 语法上开始转换

```
.box {
  transform: rotate(30deg);
}
```

这个旋转套用公式

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzECYm7Vq0hcd6Zt1Lgx9TSic04rlxpGMSLXlt9tulJDIvSaIbCOVU66tjia4g6uIuq4SrxkeJPR83grA/640?wx_fmt=png)image.png

等价于

```
.box {
  transform: matrix(0.86, 0.5, -0.5, 0.86, 0, 0);
}
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzECYm7Vq0hcd6Zt1Lgx9TSic0ibOgfLicmZ2Y8pz9ibtsY91tDe2Yu7Grk5dA5MAD0TN5fbjBibSvx1ib0icQ/640?wx_fmt=png)image.png

**复合**

```
.box {
  transform: rotate(30deg) scale(0.3, 0.6);
}
```

复合需要进行矩阵乘法计算

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzECYm7Vq0hcd6Zt1Lgx9TSic0lD1uyFSsEqu89WGatJWSyXjibC3wuafktSz9ib8dwkSGjm5NAOibsTNRw/640?wx_fmt=png)image.png

等价于

```
.box {
  transform: matrix(0.258, 0.15, -0.3, 0.516, 0, 0);
}
```

最后，后续本文修正和更新，请参阅：'https://kangkk.cn/index.php / 计算机原理 / 仿射变换'

- END -

关于奇舞团
-----

奇舞团是 360 集团最大的大前端团队，代表集团参与 W3C 和 ECMA 会员（TC39）工作。奇舞团非常重视人才培养，有工程师、讲师、翻译官、业务接口人、团队 Leader 等多种发展方向供员工选择，并辅以提供相应的技术力、专业力、通用力、领导力等培训课程。奇舞团以开放和求贤的心态欢迎各种优秀人才关注和加入奇舞团。

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEBLicibtcprJISN18FgTtg2N1ichPnMqRhicrP20VfwnC4vday7gtEoiaSynIH1bas4N5kgicliakrLdtT2Q/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)