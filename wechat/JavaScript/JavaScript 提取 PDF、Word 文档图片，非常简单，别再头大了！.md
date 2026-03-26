> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/o_J14qEMkqN06V5UsUkq0Q)

```
点击上方 程序员成长指北，关注公众号

回复1，加入高级Node交流群

```

最近接了个需求，要求就是基于文档的 AI 问答，文档里面最常见的就是 PDF 和 Word 文档了，里面的内容无非就是文本和图片了，目前是没有直接接收这种文档的模型的，那么我们需要经过一些处理来进行。

首先我们要先把图片和文本来进行处理，我这边的处理方式就是图片调用图片的模型来识别图片信息，将返回的信息和文档的文本作为后面的问答的前置 prompt，至于这些 prompt 就可以根据不同的需求来做不同处理了，这里不多解释。

在接下来，我们将使用 NextJs 项目作为例子进行讲解，后面的内容跟框架依性不是很大，vue，astro 等项目都可以直接拿来使用。

提取 PDF 中的图片
-----------

`PDF.js` 是一个开源的 JavaScript 库，用于在网页上直接显示和渲染 PDF 文件。它将 PDF 文件解析为 HTML5 元素，使得浏览器可以无插件地加载和查看 PDF 文档。PDF.js 支持多种功能，如文本选择、搜索、页面导航等，提供了良好的浏览体验。通过它，开发者可以轻松集成 PDF 查看功能到网站或应用中。

为了避免 PDF 解析过程阻塞主线程，PDF.js 使用 Web Worker ，因为 PDF 解析是一个 CPU 密集型的操作，涉及大量计算和内存处理。

首先我们需要在项目中安装相关依赖包：

```
pnpm add pdfjs-dist


```

安装完成之后，我们需要设置 WebWorker 的路径，我们不使用 cdn 的文件，我们聪明人用聪明的方法：

  

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YBFV3Da0NwugUv5IEnDfibROQVbEfjhzfEBmnUHPS89RA1uAibWBiboictKD2HxVP8SRjMW2vUojLTic0b7VdQobBJg/640?wx_fmt=png&from=appmsg)

  

我们可以将 node_modules 中 pdfjs-dist 目录下的 build 目录下 `pdf.worker.mjs` 文件放到 `public/js` 目录下，但是要把 mjs 后缀改成 js。

最后在项目中引入即可：

```
import * as pdfjsLib from"pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/js/pdf.worker.js";


```

  
  

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YBFV3Da0NwugUv5IEnDfibROQVbEfjhzfUpqDo1DuPTCItk0J1GPTHibMZYdFHyuKc1RrXOfHFMicib7dLSm24zPvg/640?wx_fmt=png&from=appmsg)

  

### 处理文件上传

```
const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
const file = e.target.files?.[0];
if (!file) return;

try {
    const arrayBuffer = await file.arrayBuffer(); // 读取文件为 ArrayBuffer
    const typedarray = newUint8Array(arrayBuffer); // 转换为 Uint8Array
    const loadingTask = pdfjsLib.getDocument(typedarray); // 使用 pdf.js 加载文档
    await loadPDFFile(loadingTask); // 加载 PDF 文件
  } catch (err) {
    setError(err instanceofError ? err.message : "Failed to read file");
    console.error("File reading error:", err);
  }
};


```

当用户选择文件时，将文件转化为 `ArrayBuffer`，然后再转为 `Uint8Array`，最终使用 `pdfjsLib.getDocument` 加载 PDF 文件并调用 `loadPDFFile`。

### 加载 PDF 文件并提取图像和文本

```
const loadPDFFile = async (loadingTask: pdfjsLib.PDFDocumentLoadingTask) => {
try {
    setIsLoading(true);
    setError(null);
    const pdf = await loadingTask.promise; // 获取 PDF 实例
    const numPages = pdf.numPages; // 获取 PDF 总页数
    const allImages: PDFImage[] = [];
    const allTexts: PDFText[] = [];

    // 循环加载每一页
    for (let pageNumber = 1; pageNumber <= numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber); // 获取单个页面

      // 提取图像
      const pageImages = await extractImagesFromPage(page, pageNumber);
      allImages.push(...pageImages);

      // 提取文本
      const pageTexts = await extractTextFromPage(page, pageNumber);
      allTexts.push(...pageTexts);
    }

    setImages(allImages); // 更新图像数据
    setTexts(allTexts); // 更新文本数据
  } catch (err) {
    setError(err instanceofError ? err.message : "Failed to process PDF");
    console.error("PDF processing error:", err);
  } finally {
    setIsLoading(false);
  }
};


```

`loadPDFFile` 函数加载 PDF 文件并提取所有页面的图像和文本。通过 `getPage` 获取每一页，调用 `extractImagesFromPage` 和 `extractTextFromPage` 提取数据。

### 提取图像

```
const extractImagesFromPage = async (
  page: pdfjsLib.PDFPageProxy,
pageNumber: number
): Promise<PDFImage[]> => {
const extractedImages: PDFImage[] = [];
const ops = await page.getOperatorList(); // 获取页面的操作列表
const imageNames = ops.fnArray.reduce<string[]>((acc, curr, i) => {
    if ([pdfjsLib.OPS.paintImageXObject, pdfjsLib.OPS.paintXObject].includes(curr)) {
      acc.push(ops.argsArray[i][0]); // 过滤出图像对象名称
    }
    return acc;
  }, []);

// 提取图像
for (const imageName of imageNames) {
    try {
      const image = awaitnewPromise<PDFImageObject>((resolve) =>
        page.objs.get(imageName, resolve) // 获取图像对象
      );
      if (!image || !image.bitmap) continue;

      const bmp = image.bitmap;
      const resizeScale = 1 / 4; // 缩放比例
      const width = Math.floor(bmp.width * resizeScale); // 计算缩放后的宽度
      const height = Math.floor(bmp.height * resizeScale); // 计算缩放后的高度

      const canvas = new OffscreenCanvas(width, height); // 创建离屏 canvas
      const ctx = canvas.getContext("bitmaprenderer");
      if (!ctx) continue;

      ctx.transferFromImageBitmap(bmp); // 将图片渲染到 canvas 上
      const blob = await canvas.convertToBlob(); // 转换为 Blob 对象
      const imgURL = URL.createObjectURL(blob); // 生成图像 URL

      extractedImages.push({
        url: imgURL,
        pageNumber,
      });
    } catch (err) {
      console.error(`Error processing image ${imageName}:`, err);
    }
  }

return extractedImages;
};


```

`extractImagesFromPage` 从页面的操作列表中提取图像对象，并将图像渲染到离屏 `OffscreenCanvas` 上，最后转换为 Blob 并生成 URL。返回一个包含所有图像的数组。

### 提取文本

```
const extractTextFromPage = async (
  page: pdfjsLib.PDFPageProxy,
pageNumber: number
): Promise<PDFText[]> => {
const extractedTexts: PDFText[] = [];
try {
    const textContent = (await page.getTextContent()) as TextContent; // 获取文本内容
    const text = textContent.items.map((item) => item.str).join(" "); // 拼接所有文本
    extractedTexts.push({
      text,
      pageNumber,
    });
  } catch (err) {
    console.error(`Error processing text on page ${pageNumber}:`, err);
  }
return extractedTexts;
};


```

`extractTextFromPage` 使用 `getTextContent` 方法提取页面的文本内容，并将所有文本拼接成一个字符串，返回提取的文本。

### 完整代码

完整代码如下所示：

```
"use client";

import { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/js/pdf.worker.js";

interface PDFImage {
  url: string;
  pageNumber: number;
}

interface PDFText {
  text: string;
  pageNumber: number;
}

interface PDFImageObject {
  bitmap: ImageBitmap;
}

interface TextItem {
  str: string;
  dir: string;
  width: number;
  height: number;
  transform: number[];
  fontName: string;
}

interface TextStyle {
  fontFamily: string;
  ascent: number;
  descent: number;
  vertical: boolean;
}

interface TextContent {
  items: TextItem[];
  styles: Record<string, TextStyle>;
}

export default function Home() {
  const [images, setImages] = useState<PDFImage[]>([]);
  const [texts, setTexts] = useState<PDFText[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 提取图像
  const extractImagesFromPage = async (
    page: pdfjsLib.PDFPageProxy,
    pageNumber: number
  ): Promise<PDFImage[]> => {
    const extractedImages: PDFImage[] = [];
    const ops = await page.getOperatorList();
    const imageNames = ops.fnArray.reduce<string[]>((acc, curr, i) => {
      if (
        [pdfjsLib.OPS.paintImageXObject, pdfjsLib.OPS.paintXObject].includes(
          curr
        )
      ) {
        acc.push(ops.argsArray[i][0]);
      }
      return acc;
    }, []);

    for (const imageName of imageNames) {
      try {
        const image = await new Promise<PDFImageObject>((resolve) =>
          page.objs.get(imageName, resolve)
        );
        if (!image || !image.bitmap) continue;

        const bmp = image.bitmap;
        const resizeScale = 1 / 4;
        const width = Math.floor(bmp.width * resizeScale);
        const height = Math.floor(bmp.height * resizeScale);

        const canvas = new OffscreenCanvas(width, height);
        const ctx = canvas.getContext("bitmaprenderer");

        if (!ctx) continue;

        ctx.transferFromImageBitmap(bmp);
        const blob = await canvas.convertToBlob();
        const imgURL = URL.createObjectURL(blob);

        extractedImages.push({
          url: imgURL,
          pageNumber,
        });
      } catch (err) {
        console.error(`Error processing image ${imageName}:`, err);
      }
    }

    return extractedImages;
  };

  // 提取文本
  const extractTextFromPage = async (
    page: pdfjsLib.PDFPageProxy,
    pageNumber: number
  ): Promise<PDFText[]> => {
    const extractedTexts: PDFText[] = [];
    try {
      const textContent = (await page.getTextContent()) as TextContent;
      const text = textContent.items.map((item) => item.str).join(" ");
      extractedTexts.push({
        text,
        pageNumber,
      });
    } catch (err) {
      console.error(`Error processing text on page ${pageNumber}:`, err);
    }
    return extractedTexts;
  };

  // 加载 PDF 文件
  const loadPDFFile = async (loadingTask: pdfjsLib.PDFDocumentLoadingTask) => {
    try {
      setIsLoading(true);
      setError(null);
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;
      const allImages: PDFImage[] = [];
      const allTexts: PDFText[] = [];

      for (let pageNumber = 1; pageNumber <= numPages; pageNumber++) {
        const page = await pdf.getPage(pageNumber);

        // 提取图像
        const pageImages = await extractImagesFromPage(page, pageNumber);
        allImages.push(...pageImages);

        // 提取文本
        const pageTexts = await extractTextFromPage(page, pageNumber);
        allTexts.push(...pageTexts);
      }

      setImages(allImages);
      setTexts(allTexts); // 设置提取的文本
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process PDF");
      console.error("PDF processing error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理文件上传
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const typedarray = new Uint8Array(arrayBuffer);
      const loadingTask = pdfjsLib.getDocument(typedarray);
      await loadPDFFile(loadingTask);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to read file");
      console.error("File reading error:", err);
    }
  };

  const handleImageLoad = (imgURL: string) => {
    // Clean up object URL when image is loaded
    URL.revokeObjectURL(imgURL);
  };

  return (
    <div class>
      <h1 class>PDF 图像提取器</h1>

      <div class>
        <label class>
          选择 PDF 文件
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
        </label>
      </div>

      {isLoading && (
        <div class>
          <p class>正在处理 PDF 文件，请稍候...</p>
        </div>
      )}

      {error && (
        <div class>
          <p class>{error}</p>
        </div>
      )}

      {!isLoading && images.length > 0 && (
        <div>
          <h2 class>提取的图像：</h2>
          <div class>
            {images.map((image, index) => (
              <div key={index} class>
                <img
                  src={image.url}
                  alt={`Extracted Image ${index + 1} from page ${
                    image.pageNumber
                  }`}
                  class
                  onLoad={() => handleImageLoad(image.url)}
                />
                <p class>
                  来自第 {image.pageNumber} 页
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isLoading && !error && images.length === 0 && (
        <p class>
          上传 PDF 文件以提取其中的图像
        </p>
      )}

      {/* 显示提取的文本 */}
      {!isLoading && texts.length > 0 && (
        <div>
          <h2 class>提取的文本：</h2>
          <div class>
            {texts.map((text, index) => (
              <div key={index} class>
                <p class>{text.text}</p>
                <p class>
                  来自第 {text.pageNumber} 页
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isLoading && !error && texts.length === 0 && (
        <p class>
          上传 PDF 文件以提取其中的文本
        </p>
      )}
    </div>
  );
}


```

最终输出结果如下图所示：

  

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YBFV3Da0NwugUv5IEnDfibROQVbEfjhzfVBwaMDrmRULSnsNSMKIIuNEbn6JsdPnIeKKpn3uCmvWbd6oyt6OXTg/640?wx_fmt=png&from=appmsg)

  

这个原文档是这样的：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YBFV3Da0NwugUv5IEnDfibROQVbEfjhzfqkccTRCBhHAXVWr3RibLVSiaeYnT25uNGsVNNAURr0DhAhRXkIicK4vjw/640?wx_fmt=png&from=appmsg)

  

完美输出 🎉🎉🎉

提取 Word 文档
----------

Mammoth 是一个 JavaScript 库，专门用于将 `.docx` 格式的文件转换为 HTML 或其他格式。它的目标是提供一个高质量的 Word 文档转换工具，特别适用于将 Word 文档内容转化为干净、结构化的 HTML，而不包含多余的样式和复杂的 HTML 标签。与其他文档转换工具不同，Mammoth 强调简洁和可读性，帮助开发者轻松将 Word 文档的内容嵌入到网页中。它特别适合处理简单的文本内容和基本的格式化。

接下来我们就用这个包来出来这个类型的文档：

```
pnpm add mammoth


```

这里就不做前面讲解得那么详细了：

```
"use client";

import React, { useState } from"react";
import mammoth from"mammoth";

const FileUpload = () => {
const [images, setImages] = useState<string[]>([]); // 存储图片
const [text, setText] = useState<string>(""); // 存储提取的文本
const [error, setError] = useState<string | null>(null); // 存储错误信息
const [isLoading, setIsLoading] = useState(false); // 加载状态

// 处理文件上传
const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setImages([]);
    setText("");

    try {
      const arrayBuffer = await file.arrayBuffer();
      await processDocxFile(arrayBuffer);
    } catch (err) {
      setError(err instanceofError ? err.message : "Failed to read file");
    } finally {
      setIsLoading(false);
    }
  };

// 使用 mammoth 提取文本和图片
const processDocxFile = async (arrayBuffer: ArrayBuffer) => {
    try {
      const extractedImages: string[] = [];

      const options = {
        convertImage: mammoth.images.imgElement((image) => {
          return image.read("base64").then((imageBuffer) => {
            const imageType = image.contentType || "image/png";
            const base64Image = `data:${imageType};base64,${imageBuffer}`;
            extractedImages.push(base64Image);
            return {
              src: base64Image,
              alt: "Extracted image",
            };
          });
        }),
      };

      const result = await mammoth.convertToHtml({ arrayBuffer }, options);

      // 去除重复的文本
      const uniqueText = removeDuplicateText(result.value);
      setText(uniqueText);
      setImages(extractedImages);

      if (result.messages.length > 0) {
        console.log("Conversion messages:", result.messages);
      }
    } catch (err) {
      setError(err instanceofError ? err.message : "Failed to process file");
      console.error("Error processing DOCX:", err);
    }
  };

// 去除文本中的重复内容
const removeDuplicateText = (htmlText: string): string => {
    const cleanText = htmlText.replace(/<img[^>]*>/g, ""); // 移除 img 标签
    const paragraphs = cleanText.split("<p>").filter((p) => p.trim());
    const uniqueParagraphs = Array.from(new Set(paragraphs));
    return uniqueParagraphs.map((p) =>`<p>${p}`).join("\n");
  };

return (
    <div class>
      <h1 class>Upload DOCX File</h1>
      <input
        type="file"
        accept=".docx"
        onChange={handleFileChange}
        class
      />

      {isLoading && <p class>Processing...</p>}
      {error && <p class>{error}</p>}

      {/* 显示提取的文本 */}
      {text && (
        <div class>
          <h3 class>Extracted Text:</h3>
          <div
            dangerouslySetInnerHTML={{ __html: text }}
            class
          />
        </div>
      )}

      {/* 显示提取的图片 */}
      {images.length > 0 && (
        <div class>
          <h3 class>Extracted Images:</h3>
          <div class>
            {images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Extracted Image ${index + 1}`}
                class
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;


```

这段代码实现了一个 DOCX 文件上传并提取文本和图片的功能。用户通过文件上传控件选择一个 `.docx` 文件，触发 `handleFileChange` 方法来读取文件并将其转换为 `arrayBuffer`。然后，`processDocxFile` 函数使用 `mammoth` 库对文件进行处理，提取其中的文本和图片。

在提取过程中，`mammoth` 通过 `convertToHtml` 方法将 DOCX 文件转换为 HTML，同时通过 `convertImage` 选项将图片提取为 Base64 编码的格式。提取的文本会经过去除重复内容的处理，最终显示在页面上。图片以 Base64 格式显示，用户可以查看提取的图像。

`isLoading` 状态用于显示文件正在处理中，`error` 状态用来捕获并显示错误信息。提取的文本和图片被存储在 `text` 和 `images` 状态变量中，并在界面上相应地展示。

最终输出结果如下图所示；

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YBFV3Da0NwugUv5IEnDfibROQVbEfjhzfPDjicHgTPtpwtdPicocUg3MjAukTfuHW6boOBIepbichXia6LtXWVKOkiaw/640?wx_fmt=png&from=appmsg)

  

  

  

Node 社群

```
我组建了一个氛围特别好的 Node.js 社群，里面有很多 Node.js小伙伴，如果你对Node.js学习感兴趣的话（后续有计划也可以），我们可以一起进行Node.js相关的交流、学习、共建。下方加 考拉 好友回复「Node」即可。

   “分享、点赞、在看” 支持一波👍

```