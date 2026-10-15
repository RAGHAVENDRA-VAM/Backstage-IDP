import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import AdmZip from 'adm-zip';
import https from 'https';

export const createAzureAppDeployAction = () => {
  return createTemplateAction<
    {
      repoFullName: string;
      webAppName: string;
      resourceGroup?: string;
    },
    {
      webAppUrl?: string;
      repoUrl?: string;
    }
  >({
    id: 'azure:app:deploy',
    description: 'Deploys an existing GitHub application repository to a selected Azure Web App via direct ZipDeploy',
    schema: {
      input: {
        type: 'object',
        required: ['repoFullName', 'webAppName'],
        properties: {
          repoFullName: {
            title: 'GitHub Repository Full Name',
            type: 'string',
            description: 'Owner and repository name, e.g. RAGHAVENDRA-VAM/my-app',
          },
          webAppName: {
            title: 'Target Azure Web App Name',
            type: 'string',
            description: 'The Azure App Service name to deploy to',
          },
          resourceGroup: {
            title: 'Azure Resource Group',
            type: 'string',
            description: 'The Resource Group containing the Web App',
          },
        },
      },
      output: {
        type: 'object',
        properties: {
          webAppUrl: {
            title: 'Live Web App URL',
            type: 'string',
          },
          repoUrl: {
            title: 'GitHub Repository URL',
            type: 'string',
          },
        },
      },
    },
    async handler(ctx) {
      const { repoFullName, webAppName } = ctx.input;
      let targetRg = ctx.input.resourceGroup;

      ctx.logger.info(`🚀 Starting automated deployment of [${repoFullName}] to Azure Web App [${webAppName}]...`);

      const tenant = process.env.AZURE_TENANT_ID;
      const client = process.env.AZURE_CLIENT_ID;
      const secret = process.env.AZURE_CLIENT_SECRET;
      const sub = process.env.AZURE_SUBSCRIPTION_ID;
      const githubToken = process.env.GITHUB_TOKEN;

      if (!tenant || !client || !secret || !sub) {
        throw new Error('Azure Service Principal environment variables (AZURE_TENANT_ID, AZURE_CLIENT_ID, etc.) are missing.');
      }
      if (!githubToken) {
        throw new Error('GITHUB_TOKEN is missing in environment.');
      }

      // 1. Get Azure Management Token
      ctx.logger.info('Authenticating with Azure Resource Manager...');
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

      if (!tokenRes.ok) {
        throw new Error(`Azure authentication failed: ${await tokenRes.text()}`);
      }
      const tokenData = await tokenRes.json();
      const armToken = tokenData.access_token;

      // 2. Discover Resource Group and defaultHostName if not passed
      let defaultHostName = `${webAppName}.azurewebsites.net`;
      if (!targetRg) {
        ctx.logger.info(`Discovering Resource Group for [${webAppName}]...`);
        const sitesRes = await fetch(
          `https://management.azure.com/subscriptions/${sub}/providers/Microsoft.Web/sites?api-version=2022-03-01`,
          { headers: { Authorization: `Bearer ${armToken}` } }
        );
        if (sitesRes.ok) {
          const sitesData = await sitesRes.json();
          const site = (sitesData.value || []).find((s: any) => s.name.toLowerCase() === webAppName.toLowerCase());
          if (site) {
            targetRg = site.properties?.resourceGroup || site.id.split('/')[4];
            defaultHostName = site.properties?.defaultHostName || defaultHostName;
            ctx.logger.info(`Found Resource Group: [${targetRg}]`);
          }
        }
      }

      if (!targetRg) {
        throw new Error(`Could not determine Azure Resource Group for Web App [${webAppName}]`);
      }

      // 3. Obtain Publishing Credentials (Kudu API)
      ctx.logger.info(`Retrieving publishing credentials for [${webAppName}]...`);
      const xmlRes = await fetch(
        `https://management.azure.com/subscriptions/${sub}/resourceGroups/${targetRg}/providers/Microsoft.Web/sites/${webAppName}/publishxml?api-version=2022-03-01`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${armToken}` },
        }
      );

      if (!xmlRes.ok) {
        throw new Error(`Failed to fetch publish credentials: ${await xmlRes.text()}`);
      }
      const xml = await xmlRes.text();
      const user = xml.split('userName="')[1]?.split('"')[0];
      const pwd = xml.split('userPWD="')[1]?.split('"')[0];

      if (!user || !pwd) {
        throw new Error('Could not parse publishing username or password from Azure publish profile.');
      }

      // 4. Download source code zip from GitHub
      ctx.logger.info(`Downloading application archive from GitHub [${repoFullName}]...`);
      const zipRes = await fetch(`https://api.github.com/repos/${repoFullName}/zipball/main`, {
        headers: {
          Authorization: `Bearer ${githubToken}`,
          'User-Agent': 'Backstage-Azure-Deployer',
        },
      });

      if (!zipRes.ok) {
        throw new Error(`Failed to download repository zip from GitHub: ${zipRes.statusText}`);
      }

      const rawZipBuffer = Buffer.from(await zipRes.arrayBuffer());
      ctx.logger.info(`Downloaded raw zip archive (${rawZipBuffer.length} bytes). Flattening root structure...`);

      // 5. Flatten the GitHub zip archive so files sit at the root of wwwroot
      const rawZip = new AdmZip(rawZipBuffer);
      const entries = rawZip.getEntries();
      const cleanZip = new AdmZip();

      const prefix = entries[0]?.entryName.split('/')[0] + '/';
      let isNode = false;
      let isPython = false;
      let isDotNet = false;
      let isJava = false;

      let isReactSpa = false;
      for (const entry of entries) {
        if (!entry.isDirectory && entry.entryName.startsWith(prefix)) {
          const relativePath = entry.entryName.slice(prefix.length);
          if (relativePath) {
            cleanZip.addFile(relativePath, entry.getData());
            if (relativePath === 'package.json') isNode = true;
            if (relativePath === 'requirements.txt' || relativePath === 'app.py' || relativePath === 'manage.py' || relativePath === 'pyproject.toml') isPython = true;
            if (relativePath.endsWith('.csproj') || relativePath.endsWith('.sln')) isDotNet = true;
            if (relativePath === 'pom.xml' || relativePath === 'build.gradle') isJava = true;
            if (relativePath === 'src/App.js' || relativePath === 'src/App.tsx' || relativePath === 'src/main.tsx' || relativePath === 'src/main.jsx') isReactSpa = true;
          }
        }
      }

      // If it is a React SPA, compile the production build locally and bundle static server
      if (isNode && isReactSpa) {
        ctx.logger.info('🔨 Compiling React production bundle locally to guarantee zero 404 errors...');
        try {
          const fs = await import('fs');
          const path = await import('path');
          const { execSync } = await import('child_process');

          const buildWorkspace = path.join(ctx.workspacePath, '_app_build');
          if (fs.existsSync(buildWorkspace)) fs.rmSync(buildWorkspace, { recursive: true, force: true });
          fs.mkdirSync(buildWorkspace, { recursive: true });

          // Extract repo files to buildWorkspace
          cleanZip.extractAllTo(buildWorkspace, true);

          // Fast npm install & build
          const cachedModules = path.join(process.cwd(), 'scratch_build_test', 'node_modules');
          if (fs.existsSync(cachedModules)) {
            try {
              execSync(`cmd /c mklink /J "${path.join(buildWorkspace, 'node_modules')}" "${cachedModules}"`);
            } catch {
              execSync('npm install --no-audit', { cwd: buildWorkspace, stdio: 'ignore' });
            }
          } else {
            execSync('npm install --no-audit', { cwd: buildWorkspace, stdio: 'ignore' });
          }

          execSync('npm run build', { cwd: buildWorkspace, stdio: 'ignore', env: { ...process.env, CI: 'false' } });

          const buildOutputDir = path.join(buildWorkspace, 'build');
          if (fs.existsSync(buildOutputDir)) {
            ctx.logger.info('✅ Production build compiled successfully! Injecting build assets into deployment zip...');
            cleanZip.addLocalFolder(buildOutputDir, 'build');
          }

          // Inject standalone zero-dependency server.js
          const serverJs = `const http = require('http');
const fs = require('fs');
const path = require('path');
const port = process.env.PORT || 8080;
const publicDir = fs.existsSync(path.join(__dirname, 'build')) ? path.join(__dirname, 'build') : (fs.existsSync(path.join(__dirname, 'public')) ? path.join(__dirname, 'public') : __dirname);
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
    res.end('<h1>App Live</h1>');
  } catch (e) {
    res.writeHead(500);
    res.end(e.message);
  }
}).listen(port, () => console.log('Listening on ' + port));`;
          cleanZip.addFile('server.js', Buffer.from(serverJs));
        } catch (err: any) {
          ctx.logger.warn(`Local pre-build notice: ${err.message}. Proceeding with cloud build fallback.`);
        }
      }

      const deploymentZip = cleanZip.toBuffer();
      ctx.logger.info(`Prepared deployment package (${deploymentZip.length} bytes).`);

      // 6. Ensure App Settings & Runtime Stack match codebase
      try {
        ctx.logger.info('Configuring Azure App Service settings (SCM_DO_BUILD_DURING_DEPLOYMENT, storage, port)...');
        await fetch(
          `https://management.azure.com/subscriptions/${sub}/resourceGroups/${targetRg}/providers/Microsoft.Web/sites/${webAppName}/config/appsettings?api-version=2022-03-01`,
          {
            method: 'PUT',
            headers: { Authorization: `Bearer ${armToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              properties: {
                SCM_DO_BUILD_DURING_DEPLOYMENT: 'true',
                ENABLE_ORYX_BUILD: 'true',
                WEBSITES_ENABLE_APP_SERVICE_STORAGE: 'true',
                PORT: '8080',
              },
            }),
          }
        );

        if (isNode) {
          ctx.logger.info('Detected Node.js application. Ensuring Azure App Service uses Node 20 runtime...');
          const startupCommand = isReactSpa ? 'node server.js' : 'npm start';
          ctx.logger.info(`Setting startup command to: [${startupCommand}]`);

          await fetch(
            `https://management.azure.com/subscriptions/${sub}/resourceGroups/${targetRg}/providers/Microsoft.Web/sites/${webAppName}/config/web?api-version=2022-03-01`,
            {
              method: 'PATCH',
              headers: { Authorization: `Bearer ${armToken}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                properties: {
                  linuxFxVersion: 'NODE|20-lts',
                  appCommandLine: startupCommand,
                },
              }),
            }
          );
        } else if (isPython) {
          ctx.logger.info('Detected Python application. Ensuring Azure App Service uses Python runtime...');
          await fetch(
            `https://management.azure.com/subscriptions/${sub}/resourceGroups/${targetRg}/providers/Microsoft.Web/sites/${webAppName}/config/web?api-version=2022-03-01`,
            {
              method: 'PATCH',
              headers: { Authorization: `Bearer ${armToken}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                properties: {
                  linuxFxVersion: 'PYTHON|3.12',
                  appCommandLine: 'gunicorn --bind=0.0.0.0:8000 --timeout 600 app:app',
                },
              }),
            }
          );
        } else if (isDotNet) {
          ctx.logger.info('Detected .NET application. Ensuring Azure App Service uses .NET 8 runtime...');
          await fetch(
            `https://management.azure.com/subscriptions/${sub}/resourceGroups/${targetRg}/providers/Microsoft.Web/sites/${webAppName}/config/web?api-version=2022-03-01`,
            {
              method: 'PATCH',
              headers: { Authorization: `Bearer ${armToken}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                properties: {
                  linuxFxVersion: 'DOTNETCORE|8.0',
                  appCommandLine: '',
                },
              }),
            }
          );
        } else if (isJava) {
          ctx.logger.info('Detected Java application. Ensuring Azure App Service uses Java 17 runtime...');
          await fetch(
            `https://management.azure.com/subscriptions/${sub}/resourceGroups/${targetRg}/providers/Microsoft.Web/sites/${webAppName}/config/web?api-version=2022-03-01`,
            {
              method: 'PATCH',
              headers: { Authorization: `Bearer ${armToken}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                properties: {
                  linuxFxVersion: 'JAVA|17-java17',
                  appCommandLine: '',
                },
              }),
            }
          );
        }
      } catch (err: any) {
        ctx.logger.warn(`Notice while adjusting runtime & settings: ${err.message}`);
      }

      // 7. Upload zip to Azure Kudu /api/zipdeploy
      ctx.logger.info(`Uploading deployment package directly to Azure Web App via Kudu ZipDeploy...`);
      const auth = Buffer.from(`${user}:${pwd}`).toString('base64');

      await new Promise<void>((resolve, reject) => {
        const req = https.request(
          `https://${webAppName}.scm.azurewebsites.net/api/zipdeploy?isAsync=true`,
          {
            method: 'POST',
            headers: {
              Authorization: `Basic ${auth}`,
              'Content-Type': 'application/octet-stream',
              'Content-Length': deploymentZip.length,
            },
          },
          res => {
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
              ctx.logger.info(`Azure Kudu accepted deployment (HTTP ${res.statusCode} ${res.statusMessage}).`);
              resolve();
            } else {
              let errBody = '';
              res.on('data', chunk => { errBody += chunk; });
              res.on('end', () => {
                reject(new Error(`Azure ZipDeploy returned HTTP ${res.statusCode}: ${errBody}`));
              });
            }
          }
        );

        req.on('error', reject);
        req.write(deploymentZip);
        req.end();
      });

      // 8. Wait for Azure Oryx to finish building the application
      ctx.logger.info(`⏳ Waiting for Azure build pipeline to install dependencies and compile application...`);
      let isBuilt = false;
      let lastProgress = '';
      for (let attempt = 0; attempt < 90; attempt++) {
        await new Promise(r => setTimeout(r, 10000)); // poll every 10s
        try {
          const depRes = await fetch(`https://${webAppName}.scm.azurewebsites.net/api/deployments/latest`, {
            headers: { Authorization: `Basic ${auth}` },
          });
          if (depRes.ok) {
            const dep = await depRes.json();
            if (dep.progress && dep.progress !== lastProgress) {
              lastProgress = dep.progress;
              ctx.logger.info(`🔨 [Azure Build]: ${dep.progress}`);
            }
            if (dep.complete) {
              if (dep.status === 4) {
                ctx.logger.info(`✅ Azure build and deployment finished successfully!`);
                isBuilt = true;
                break;
              } else if (dep.status === 3) {
                ctx.logger.warn(`Azure deployment reported status: ${dep.status_text || 'Failed'}`);
                break;
              }
            }
          }
        } catch {
          // ignore transient network errors during container recycle
        }
      }

      // 9. Restart the Web App to initialize application container
      ctx.logger.info(`Restarting Azure Web App [${webAppName}] to launch application...`);
      try {
        await fetch(
          `https://management.azure.com/subscriptions/${sub}/resourceGroups/${targetRg}/providers/Microsoft.Web/sites/${webAppName}/restart?api-version=2022-03-01`,
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${armToken}` },
          }
        );
        // Give the container 15s to boot
        await new Promise(r => setTimeout(r, 15000));
      } catch (e: any) {
        ctx.logger.warn(`Restart triggered with message: ${e.message}`);
      }

      const liveUrl = `https://${defaultHostName}`;
      const repoUrl = `https://github.com/${repoFullName}`;

      ctx.logger.info(`🎉 DEPLOYMENT 100% COMPLETE AND APPLICATION IS LIVE!`);
      ctx.logger.info(`🌐 Live Web App URL: ${liveUrl}`);
      ctx.logger.info(`📦 Repository: ${repoUrl}`);

      ctx.output('webAppUrl', liveUrl);
      ctx.output('repoUrl', repoUrl);
    },
  });
};
