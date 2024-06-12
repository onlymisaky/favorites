const fs = require('fs');
const path = require('path');

const paths = fs.readdirSync(path.resolve(__dirname));
const demos = paths.filter((dir) => {
  if (fs.existsSync(path.resolve(__dirname, dir, 'index.html'))) {
    return true;
  }
  return false;
});

const link = 'https://onlymisaky.github.io/favorites/demo/';
const indexHtml = `
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Demos</title>
</head>

<body>
  <ul>${demos.map((demo) => `<li><a href="${link}${demo}" target="_blank">${demo}</a></li>`)}</ul>
</body>

</html>
`;
fs.writeFileSync(path.resolve(__dirname, 'index.html'), indexHtml, { encoding: 'utf-8' });
