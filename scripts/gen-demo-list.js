const fs = require('fs');
const path = require('path');

const demoPath = path.resolve(process.cwd(), 'demo');

const paths = fs.readdirSync(demoPath);
const demos = paths.filter((dir) => {
  if (fs.existsSync(path.resolve(demoPath, dir, 'index.html'))) {
    return true;
  }
  return false;
});

const link = 'https://onlymisaky.github.io/favorites/demo/';
const indexHtml = `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Demos</title>
</head>

<body>
  <ul>
    ${demos.map((demo) => `<li><a href="${link}${demo}" target="_blank">${demo}</a></li>`).join(`
    `)}
  </ul>
</body>

</html>
`;
fs.writeFileSync(path.resolve(demoPath, 'index.html'), indexHtml, {
  encoding: 'utf-8',
});
