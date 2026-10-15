const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 8080;
const buildDir = path.join(__dirname, 'build');
const publicDir = fs.existsSync(buildDir) ? buildDir : (fs.existsSync(path.join(__dirname, 'public')) ? path.join(__dirname, 'public') : __dirname);

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain',
};

http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  let filePath = path.join(publicDir, reqPath);

  try {
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream' });
      return fs.createReadStream(filePath).pipe(res);
    }

    const indexPath = path.join(publicDir, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return fs.createReadStream(indexPath).pipe(res);
    }

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<h1>App Running</h1>');
  } catch (e) {
    res.writeHead(500);
    res.end(e.message);
  }
}).listen(port, () => console.log('Listening on port ' + port));
