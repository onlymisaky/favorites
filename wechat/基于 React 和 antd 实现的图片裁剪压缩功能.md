> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/AOM2CEBzE30VeI1TLC3pIw)

![图片](https://mmbiz.qpic.cn/mmbiz_jpg/b77xA98980HC8X81RYX3CB8lwQkkGsQjhL4OiaohwfcYxAGTzWlyCLIn1NTZgpxOYTIQyPicJheia23ug4zYq92UA/640?wx_fmt=jpeg)

我们有很多上传图片的场景，这里都要用到裁剪和压缩的功能。

我们在日常开发过程中，有很多需要上传图片的场景。那用户在上传时，通常会遇到两个问题：

1.  不知道前端显示的尺寸比例是多少，导致最终上传图片会变形；
    
2.  图片质量或尺寸过大，比如可能就是个小 icon 图或者小封面图之类的，用户上传了一个好几兆的图片，尺寸可能对，但质量太大了，着实没有必要；
    

针对这种图片资源上传的类型，我们有必要在前端控制他的上传尺寸和上传质量。我这里讲下我们在业务中使用到的图片裁剪和压缩功能。

![](https://mmbiz.qpic.cn/mmbiz_jpg/b77xA98980EEr60KRMqgChGfOOiaIrTJZBgk68xNicwLNmjcrooShOiaWfiaxIWe0wLVBvRA33pWnGs9vEVdTJ57iaw/640?wx_fmt=jpeg)

我们主要实现的功能：

1.  读取 form 表单的内容，能回显图片；
    
2.  能够按照裁剪比例进行裁剪；
    
3.  可以指定最终生成图片的尺寸；
    

下面开始一一讲解下整个过程。

1. 上传图片
-------

这里我们封装一个名叫`ReactImageCropper`的裁剪组件，同时接收从`<Form.Item />`传进来的参数：value, onChange 和 id（可选），主要是方便在 form 表单中使用。

选择上传图片的的功能，我直接使用了 antd 中的`<Upload />`组件：

```
import { Button, Upload } from "antd";const ReactImageCropper = ({ value, onChange, id }: any) => {  const [originalUrl, setOriginalUrl] = useState(""); // 刚上传得到的原始图片地址  const handleUpload = (event: any) => {    const { file } = event;    const reader = new FileReader();    reader.readAsDataURL(file);    reader.onload = () => {      // 将读取的图片资源转为base64，接下来进行裁剪的过程      setOriginalUrl(reader.result as string);    };    reader.onerror = () => {      message.error('读取文件失败');    };  };  return (    <div id={id}>      <Upload        accept="image/*"        listType="picture-card"        showUploadList={false}        customRequest={handleUpload}      >        {value ? (          <img src={value} alt={id} style={{ maxWidth: "140px" }} />        ) : (          <Button>上传</Button>        )}      </Upload>    </div>  );};
```

得到上传文件后，通过 `FileReader` 得到该文件的 base64 地址，方便我们后续的裁剪和压缩处理。

2. 裁剪
-----

裁剪过程，我们是使用到了 `react-cropper` 的组件，将其放到 `<Modal />`组件中，裁剪完毕后，关闭弹窗。

这里我们主要是关注 2 个问题：

1.  裁剪的比例是多少？
    
2.  最终生成图片的尺寸是多少？
    
3.  对质量大小有没有要求？
    

关于裁剪比例（即宽高比），一种是直接通过 aspectRatio 属性来设置比例。再有一种是通过设置的最终压缩尺寸，算出设置比例；比如我们最终需要的图片尺寸是 `750*440`，那比例就是 1.7 左右（750/440）。

若两者都存在，我们以最终输出的图片的尺寸算出来的比例优先，毕竟若两者不一致时，裁剪出来的图片和最终生成的图片，可能不一致。

我们上第 1 节获取到了上传图片的本地链接`originalUrl`，这里将其传入到 `<Cropper />` 中。

```
import Cropper from "react-cropper";const ReactImageCropper = ({ width, height, aspectRatio }) => {  const tempUrlRef = useRef("");  /**   * 获取裁剪图片的宽高比   */  const aspect = useMemo(() => {    if (width && height) {      return width / height;    }    if (aspectRatio) {      return aspectRatio;    }    return 1;  }, [aspectRatio, width, height]);  // 拖动结束时，获取裁剪后的图片，将其存储到临时变量等待进一步压缩处理  const onCrop = () => {    const cropper: any = cropperRef?.current?.cropper;    if (!cropper) {      return;    }    const src = cropper.getCroppedCanvas().toDataURL();    tempUrlRef.current = src;  };  // 点击ok的时候，表示已裁剪好，开始按照约定的尺寸压缩图片  // getImageFinalSize 和 compressImage ，在第3节会讲到  const handleComporess = async () => {    const { width, height } = await getImageFinalSize(); // 获取最终图片的尺寸    console.log(width, height);    // 对base64的图片进行压缩，然后得到压缩后的图片    const file = await compressImage({      info: { base64: tempUrlRef.current },      width,      height,    });    // 该上传该文件了    console.log("file", file);  };  return (    <Modal      open={Boolean(originalUrl)}      onCancel={() => setOriginalUrl("")}      destroyOnClose      maskClosable={false}      width={600}      onOk={handleComporess}    >      <Cropper        cropend={onCrop}        ref={cropperRef}        src={originalUrl}        viewMode={1}        aspectRatio={aspect}        style={{ height: 400, width: "100%" }}        guides={false}      />    </Modal>  );};
```

这个回调`onCrop()`在每次裁剪结束时都会触发，得到一个新的裁剪后的图片地址，但只有点击弹窗中的确定按钮后，才会指定压缩的操作。

3. 压缩
-----

压缩的过程稍微长点，主要经过以下的几个步骤：

1.  获取最终要生成的图片的尺寸，若没有指定，则使用裁剪时得到的图片尺寸；
    
2.  使用 canvas，将图片压缩至指定的尺寸；
    
3.  把 base64 图片转成 File 对象，等待接口的上传；
    

下面来一一讲解。

### 3.1 获取要生成的图片的尺寸

若开发者指定了宽度和高度，最终的图片就是这个尺寸，我们就使用已指定好的；若不在乎最终尺寸，则依照裁剪图片时得到的尺寸。

```
/** * 获取图片最终的宽高 * 若传入了宽高的数值，则直接使用；否则就使用裁剪出来的尺寸 */const getImageFinalSize = () => {  if (width && height) {    return Promise.resolve({ width, height });  }  const img = new Image();  return new Promise((resolve) => {    img.onload = () => {      resolve({ width: img.naturalWidth, height: img.naturalHeight });    };    // 读取刚才裁剪后的图片地址    img.src = tempUrlRef.current;  });};
```

获取到尺寸后，就会进入到下一步。

### 3.2 将图片压缩至指定尺寸

裁剪后的图片一般地只是比例符合要求，但宽高尺寸实际上可能还是很大。这里我们使用 canvas 对其进行压缩。

```
/** * 将base64图片压缩到指定尺寸 */const compressCurSize = ({  url,  width,  height,}: {  url: string, // base64图片的地址  width: number,  height: number,}): Promise<{ url: string, ext: string }> => {  const [match, imageType] = url.match(/data:image\/(.*?);/) ?? [];  if (!match || !imageType) {    return Promise.reject(      new TypeError(`imgurl should be base64, your enter: ${url}`)    );  }  const newImage = new Image();  newImage.src = url;  return new Promise((resolve, reject) => {    newImage.onload = function () {      const canvas = document.createElement("canvas");      const ctx: any = canvas.getContext("2d");      canvas.width = width;      canvas.height = height;      // 注意这里的 fillStyle      ctx.fillStyle = "#fff";      ctx.fillRect(0, 0, canvas.width, canvas.height);      ctx.drawImage(this, 0, 0, canvas.width, canvas.height);      canvas.toBlob(        (blob) => {          const file = new File(            [blob as BlobPart],            fileName || `${Date.now().toString(32)}.${imageType}`          );          resolve({ file, ext: imageType });        },        `image/${imageType}`,        0.96      );    };    newImage.onerror = reject;  });};
```

属性 fillStyle 是用来填充背景颜色，若允许上传 png 格式的图片，请一定要注意这里。如果可以的话，就将其设置为白底（#fff），若想要保留透明，需要将其设置成透明色（rgba(255, 255, 255, 0)）。若不设置 fillStyle，图片的透明底会被转为黑底。

渲染完毕后，可以通过 cavans 的 `toBlob()`方法，直接将 blob 转为 File 对象。

到这里，裁剪压缩的过程基本是已经完成了。接下来就是通过接口上传的步骤了，各自按照接口的要求上传即可。

4. 我不想使用 Upload 组件
------------------

有的同学可能不想使用 antd 中的`<Upload />`组件，主要也是考虑到这个组件的很多功能都用不上。那可以用 `<input type="file">` 标签来实现。

```
const ReactImageCropper = () => {  const inputRef = useRef<HTMLInputElement | null>(null);  const [originalUrl, setOriginalUrl] = useState(''); // 刚上传得到的原始图片地址  const handleChange = (event: any) => {    const file = event.target.files[0];    inputRef.current.value = '';    const reader = new FileReader();    reader.readAsDataURL(file);    reader.onload = () => {      // 将读取的图片资源转为base64，接下来进行裁剪的过程      setOriginalUrl(reader.result as string);    };    reader.onerror = () => {      message.error('读取文件失败');    };  };  return (    <div>      <input type="file" ref={inputRef} onChange={handleChange} />    </div>  );};
```

回调函数 handleChange() 中，有一个将 value 清空的步骤。这主要是为了避免上传同一份图片时，该 change 方法不会触发。因为该回调函数触发的条件得是 value 发生了变动。

接下来的裁剪、压缩等步骤跟上面的一样。

5. 总结
-----

到这里，图片整个的裁剪压缩过程已完成了。我们来模拟下业务里的场景，比如用户上传的头像图片，最终尺寸为 `120*120` 差不多就够用了。看下实现的效果：

![](https://mmbiz.qpic.cn/mmbiz_png/b77xA98980EEr60KRMqgChGfOOiaIrTJZZ6OPTJLVMspMwdYuJBwo8Wbic5G66Kq9GSzhIibTU0YGJaPP5Wb8nTbA/640?wx_fmt=png)裁剪压缩后的图片

有的同学可能也想把它封装成组件，然后把`<Upload />`或者其他组件以子组件的方式穿进去。后续我们会讲解如何封装该组件。

![](https://mmbiz.qpic.cn/mmbiz_png/YBFV3Da0Nwt7qqUywpNb0He4PpaGj3yfOA9oevy0kdQdJCFd1WibyibnZAdiaOgsycXHrAGUPoEZYU8OueicPkn2KQ/640?wx_fmt=png)

[大厂中秋礼盒大比拼，看看哪家最 “豪”？](http://mp.weixin.qq.com/s?__biz=MzA5ODM5NTYyMA==&mid=2653285501&idx=1&sn=fe98084ed67bdc6ff524b97d5e837f19&chksm=8b4378f6bc34f1e0f5023ea295e46369c27e6e625f2c2d31e6126fc5fafa1342306f3463bb18&scene=21#wechat_redirect)  

[敏捷开发的双周迭代模式](http://mp.weixin.qq.com/s?__biz=MzA5ODM5NTYyMA==&mid=2653285093&idx=1&sn=b30e99348b2fb7bc3c3c427b11639ab5&chksm=8b437e6ebc34f778bd6d4bf69b1edef9f92394d157b3fc5737ba98b00b9c67fee5b55d3b0a07&scene=21#wechat_redirect)  

[2023 年最新最全的 http 网络面试题](http://mp.weixin.qq.com/s?__biz=MzA5ODM5NTYyMA==&mid=2653284995&idx=1&sn=07a7b106ece926d7b1d43e629617d3b0&chksm=8b437e08bc34f71ec5916c284a1e60b59b2c12cd8e10ed87d90b5609944a7cb3b9e1c8e9e22d&scene=21#wechat_redirect)  

![](https://mmbiz.qpic.cn/mmbiz_jpg/YBFV3Da0Nwt7qqUywpNb0He4PpaGj3yf529Acb1YkfG4Qd7ibPI86cFsibe9xbaVPMsrFOicZniabLMocx5EOC1LRQ/640?wx_fmt=jpeg)

▼我是来一名小小的前端开发工程师，

长按识别二维码关注，与大家共同学习▼  

![](https://mmbiz.qpic.cn/mmbiz_png/b77xA98980FhicYXcqe4JKmNQX3IibTo2grYBrUjFDr754PDwjYc8MrhqYibqXiap2GQKIsaoSE4rJjawIa5GFiaW2Q/640?wx_fmt=png)