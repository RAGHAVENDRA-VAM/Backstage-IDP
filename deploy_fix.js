const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');
const https = require('https');
const d = require('dotenv').config();

const serverJs = `const http = require('http');
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
`;

fs.writeFileSync(path.join(process.cwd(), 'scratch_build_test', 'server.js'), serverJs);

async function deploy() {
  const tenant = d.parsed['AZURE_TENANT_ID'];
  const client = d.parsed['AZURE_CLIENT_ID'];
  const secret = d.parsed['AZURE_CLIENT_SECRET'];
  const sub = d.parsed['AZURE_SUBSCRIPTION_ID'];

  const tokenRes = await fetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: client,
      client_secret: secret,
      scope: 'https://management.azure.com/.default',
    }),
  });
  const tokenData = await tokenRes.json();
  const armToken = tokenData.access_token;

  const xmlRes = await fetch(
    `https://management.azure.com/subscriptions/${sub}/resourceGroups/claimswebapp-rg/providers/Microsoft.Web/sites/claimswebapp-webapp/publishxml?api-version=2022-03-01`,
    { method: 'POST', headers: { Authorization: `Bearer ${armToken}` } }
  );
  const xml = await xmlRes.text();
  const user = xml.split('userName="')[1]?.split('"')[0];
  const pwd = xml.split('userPWD="')[1]?.split('"')[0];
  const auth = 'Basic ' + Buffer.from(`${user}:${pwd}`).toString('base64');

  console.log('Setting AppSettings (disabling slow Oryx build, setting PORT)...');
  await fetch(
    `https://management.azure.com/subscriptions/${sub}/resourceGroups/claimswebapp-rg/providers/Microsoft.Web/sites/claimswebapp-webapp/config/appsettings?api-version=2022-03-01`,
    {
      method: 'PUT',
      headers: { Authorization: `Bearer ${armToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        properties: {
          SCM_DO_BUILD_DURING_DEPLOYMENT: 'false',
          ENABLE_ORYX_BUILD: 'false',
          WEBSITES_ENABLE_APP_SERVICE_STORAGE: 'true',
          PORT: '8080',
        },
      }),
    }
  );

  console.log('Setting startup command to node server.js on claimswebapp-webapp...');
  await fetch(
    `https://management.azure.com/subscriptions/${sub}/resourceGroups/claimswebapp-rg/providers/Microsoft.Web/sites/claimswebapp-webapp/config/web?api-version=2022-03-01`,
    {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${armToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        properties: {
          linuxFxVersion: 'NODE|20-lts',
          appCommandLine: 'node server.js',
        },
      }),
    }
  );

  const zip = new AdmZip();
  const src = path.join(process.cwd(), 'scratch_build_test');
  zip.addLocalFolder(path.join(src, 'build'), 'build');
  zip.addLocalFile(path.join(src, 'server.js'));
  zip.addLocalFile(path.join(src, 'package.json'));

  const zipBuf = zip.toBuffer();
  console.log('Deploying zip package (' + zipBuf.length + ' bytes) directly to Kudu...');

  await new Promise((resolve, reject) => {
    const req = https.request('https://claimswebapp-webapp.scm.azurewebsites.net/api/zipdeploy', {
      method: 'POST',
      headers: {
        Authorization: auth,
        'Content-Type': 'application/octet-stream',
        'Content-Length': zipBuf.length,
      },
    }, res => {
      console.log('ZipDeploy response status:', res.statusCode);
      resolve();
    });
    req.on('error', reject);
    req.write(zipBuf);
    req.end();
  });

  console.log('Restarting claimswebapp-webapp...');
  await fetch(
    `https://management.azure.com/subscriptions/${sub}/resourceGroups/claimswebapp-rg/providers/Microsoft.Web/sites/claimswebapp-webapp/restart?api-version=2022-03-01`,
    { method: 'POST', headers: { Authorization: `Bearer ${armToken}` } }
  );
  console.log('Restart triggered.');
}

deploy().catch(console.error);
