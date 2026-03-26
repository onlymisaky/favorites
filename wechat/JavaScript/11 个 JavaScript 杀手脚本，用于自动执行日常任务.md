> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/GlLI6kUHc4a3tjAdX4i_jw)

今天这篇文章，我将分享我使用收藏的 11 个 JavaScript 脚本，它们可以帮助您自动化日常工作的各个方面。

**1. 自动文件备份**

担心丢失重要文件？此脚本将文件从一个目录复制到备份文件夹，确保您始终保存最新版本。

```
const fs = require('fs');
const path = require('path');

function backupFiles(sourceFolder, backupFolder) {
  fs.readdir(sourceFolder, (err, files) => {
    if (err) throw err;
    files.forEach((file) => {
      const sourcePath = path.join(sourceFolder, file);
      const backupPath = path.join(backupFolder, file);
      fs.copyFile(sourcePath, backupPath, (err) => {
        if (err) throw err;
        console.log(`Backed up ${file}`);
      });
    });
  });
}
const source = '/path/to/important/files';
const backup = '/path/to/backup/folder';
backupFiles(source, backup);
```

提示：将其作为 cron 作业运行

**2. 发送预定电子邮件**

需要稍后发送电子邮件但又担心忘记？此脚本允许您使用 Node.js 安排电子邮件。

```
const nodemailer = require('nodemailer');

function sendScheduledEmail(toEmail, subject, body, sendTime) {
  const delay = sendTime - Date.now();
  setTimeout(() => {
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'your_email@gmail.com',
        pass: 'your_password', // Consider using environment variables for security
      },
    });
    let mailOptions = {
      from: 'your_email@gmail.com',
      to: toEmail,
      subject: subject,
      text: body,
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  }, delay);
}
// Schedule email for 10 seconds from now
const futureTime = Date.now() + 10000;
sendScheduledEmail('recipient@example.com', 'Hello!', 'This is a scheduled email.', futureTime);
```

注意：传递您自己的凭据

**3. 监控目录的更改**

是否曾经想跟踪文件的历史记录。这可以帮助您实时跟踪它。

```
const fs = require('fs');

function monitorFolder(pathToWatch) {
  fs.watch(pathToWatch, (eventType, filename) => {
    if (filename) {
      console.log(`${eventType} on file: ${filename}`);
    } else {
      console.log('filename not provided');
    }
  });
}
monitorFolder('/path/to/watch');
```

用例：非常适合关注共享文件夹或监控开发目录中的变化。

**4. 将图像转换为 PDF**

需要将多幅图像编译成一个 PDF？此脚本使用 pdfkit 库即可完成此操作。

```
const fs = require('fs');
const PDFDocument = require('pdfkit');

function imagesToPDF(imageFolder, outputPDF) {
  const doc = new PDFDocument();
  const writeStream = fs.createWriteStream(outputPDF);
  doc.pipe(writeStream);
  fs.readdir(imageFolder, (err, files) => {
    if (err) throw err;
    files
      .filter((file) => /\.(jpg|jpeg|png)$/i.test(file))
      .forEach((file, index) => {
        const imagePath = `${imageFolder}/${file}`;
        if (index !== 0) doc.addPage();
        doc.image(imagePath, {
          fit: [500, 700],
          align: 'center',
          valign: 'center',
        });
      });
    doc.end();
    writeStream.on('finish', () => {
      console.log(`PDF created: ${outputPDF}`);
    });
  });
}
imagesToPDF('/path/to/images', 'output.pdf');
```

提示：非常适合编辑扫描文档或创建相册。

**5. 桌面通知提醒**

再也不会错过任何约会。此脚本会在指定时间向您发送桌面通知。

```
const notifier = require('node-notifier');

function desktopNotifier(title, message, notificationTime) {
  const delay = notificationTime - Date.now();
  setTimeout(() => {
    notifier.notify({
      title: title,
      message: message,
      sound: true, // Only Notification Center or Windows Toasters
    });
    console.log('Notification sent!');
  }, delay);
}
// Notify after 15 seconds
const futureTime = Date.now() + 15000;
desktopNotifier('Meeting Reminder', 'Team meeting at 3 PM.', futureTime);
```

注意：您需要先安装此包：npm install node-notifier。

**6. 自动清理旧文件**

此脚本会删除超过 n 天的文件。

```
const fs = require('fs');
const path = require('path');

function cleanOldFiles(folder, days) {
  const now = Date.now();
  const cutoff = now - days * 24 * 60 * 60 * 1000;
  fs.readdir(folder, (err, files) => {
    if (err) throw err;
    files.forEach((file) => {
      const filePath = path.join(folder, file);
      fs.stat(filePath, (err, stat) => {
        if (err) throw err;
        if (stat.mtime.getTime() < cutoff) {
          fs.unlink(filePath, (err) => {
            if (err) throw err;
            console.log(`Deleted ${file}`);
          });
        }
      });
    });
  });
}
cleanOldFiles('/path/to/old/files', 30);
```

警告：请务必仔细检查文件夹路径，以避免删除重要文件。

**7. 在语言之间翻译文本文件**

需要快速翻译文本文件？此脚本使用 API 在语言之间翻译文件。

```
const fs = require('fs');
const axios = require('axios');

async function translateText(text, targetLanguage) {
  const response = await axios.post('https://libretranslate.de/translate', {
    q: text,
    source: 'en',
    target: targetLanguage,
    format: 'text',
  });
  return response.data.translatedText;
}
(async () => {
  const originalText = fs.readFileSync('original.txt', 'utf8');
  const translatedText = await translateText(originalText, 'es');
  fs.writeFileSync('translated.txt', translatedText);
  console.log('Translation completed.');
})();
```

注意：这使用了 LibreTranslate API，对于小型项目是免费的。

**8. 将多个 PDF 合并为一个**

轻松将多个 PDF 文档合并为一个文件。

```
const fs = require('fs');
const PDFMerger = require('pdf-merger-js');

async function mergePDFs(pdfFolder, outputPDF) {
  const merger = new PDFMerger();
  const files = fs.readdirSync(pdfFolder).filter((file) => file.endsWith('.pdf'));
  for (const file of files) {
    await merger.add(path.join(pdfFolder, file));
  }
  await merger.save(outputPDF);
  console.log(`Merged PDFs into ${outputPDF}`);
}
mergePDFs('/path/to/pdfs', 'merged_document.pdf');
```

应用程序：用于将报告、发票或任何您想要的 PDF 合并到一个地方。

**9. 批量重命名文件**

需要重命名一批文件吗？此脚本根据模式重命名文件。

```
const fs = require('fs');
const path = require('path');

function batchRename(folder, prefix) {
  fs.readdir(folder, (err, files) => {
    if (err) throw err;
    files.forEach((file, index) => {
      const ext = path.extname(file);
      const oldPath = path.join(folder, file);
      const newPath = path.join(folder, `${prefix}_${String(index).padStart(3, '0')}${ext}`);
      fs.rename(oldPath, newPath, (err) => {
        if (err) throw err;
        console.log(`Renamed ${file} to ${path.basename(newPath)}`);
      });
    });
  });
}
batchRename('/path/to/files', 'image');
```

提示：padStart(3, '0') 函数用零填充数字（例如，001,002），这有助于排序。

**10. 抓取天气数据**

通过从天气 API 抓取数据来了解最新天气情况。

```
const axios = require('axios');

async function getWeather(city) {
  const apiKey = 'your_openweathermap_api_key';
  const response = await axios.get(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
  );
  const data = response.data;
  console.log(`Current weather in ${city}: ${data.weather[0].description}, ${data.main.temp}°C`);
}
getWeather('New York');
```

注意：您需要在 OpenWeatherMap 注册一个免费的 API 密钥。

**11. 生成随机引语**

此脚本获取并显示随机引语。

```
const axios = require('axios');

async function getRandomQuote() {
  const response = await axios.get('https://api.quotable.io/random');
  const data = response.data;
  console.log(`"${data.content}" \n- ${data.author}`);
}
getRandomQuote();
```

最后，感谢您一直阅读到最后！希望今天内容能够帮助到你，如果你喜欢此内容的话，也请分享给你的小伙伴，也许能够帮助到他们。