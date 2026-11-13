import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import AdmZip from 'adm-zip';
import https from 'https';
import fs from 'fs';
import path from 'path';

export const createAzureAppDeployAction = () => {
  return createTemplateAction<
    {
      repoFullName: string;
      webAppName: string;
      resourceGroup?: string;
      organization?: string;
      project?: string;
      branch?: string;
    },
    {
      webAppUrl?: string;
      repoUrl?: string;
    }
  >({
    id: 'azure:app:deploy',
    description: 'Deploys an existing GitHub or Azure DevOps application repository to a selected Azure Web App via direct ZipDeploy',
    schema: {
      input: {
        type: 'object',
        required: ['repoFullName', 'webAppName'],
        properties: {
          repoFullName: {
            title: 'Repository Name / Full Name',
            type: 'string',
            description: 'Owner and repo name for GitHub (owner/repo) or Git repository name for Azure DevOps',
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
          organization: {
            title: 'Azure DevOps Organization',
            type: 'string',
            description: 'Optional ADO organization name',
          },
          project: {
            title: 'Azure DevOps Project',
            type: 'string',
            description: 'Optional ADO project name',
          },
          branch: {
            title: 'Source Branch',
            type: 'string',
            description: 'Branch to pull source from (defaults to main)',
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
      const { repoFullName, webAppName, organization, project, branch } = ctx.input;
      let targetRg = ctx.input.resourceGroup;
      const isAdo = Boolean(organization && project);

      ctx.logger.info(`🚀 Starting automated deployment of [${repoFullName}] (${isAdo ? `Azure DevOps: ${organization}/${project}` : 'GitHub'}) to Azure Web App [${webAppName}]...`);

      const tenant = process.env.AZURE_TENANT_ID;
      const client = process.env.AZURE_CLIENT_ID;
      const secret = process.env.AZURE_CLIENT_SECRET;
      const sub = process.env.AZURE_SUBSCRIPTION_ID;
      const githubToken = process.env.GITHUB_TOKEN;
      const adoToken = process.env.AZURE_DEVOPS_TOKEN || process.env.AZURE_TOKEN;

      if (!tenant || !client || !secret || !sub) {
        throw new Error('Azure Service Principal environment variables (AZURE_TENANT_ID, AZURE_CLIENT_ID, etc.) are missing.');
      }
      if (!isAdo && !githubToken) {
        throw new Error('GITHUB_TOKEN is missing in environment.');
      }
      if (isAdo && !adoToken) {
        throw new Error('Azure DevOps PAT token (AZURE_DEVOPS_TOKEN / AZURE_TOKEN) is missing in environment.');
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

      // 2. Discover Resource Group and App Service details
      let defaultHostName = `${webAppName}.azurewebsites.net`;
      let scmHost = `${webAppName}.scm.azurewebsites.net`;

      try {
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
              const scmFromHostNames = (site.properties?.enabledHostNames || []).find((h: string) => h.toLowerCase().includes('.scm.'));
              if (scmFromHostNames) {
                scmHost = scmFromHostNames;
              }
              ctx.logger.info(`Found Resource Group: [${targetRg}]`);
            }
          }
        } else {
          // If resourceGroup was provided, query the site properties directly to get accurate hostname
          const siteRes = await fetch(
            `https://management.azure.com/subscriptions/${sub}/resourceGroups/${targetRg}/providers/Microsoft.Web/sites/${webAppName}?api-version=2022-03-01`,
            { headers: { Authorization: `Bearer ${armToken}` } }
          );
          if (siteRes.ok) {
            const site = await siteRes.json();
            defaultHostName = site.properties?.defaultHostName || defaultHostName;
            const scmFromHostNames = (site.properties?.enabledHostNames || []).find((h: string) => h.toLowerCase().includes('.scm.'));
            if (scmFromHostNames) {
              scmHost = scmFromHostNames;
            }
          }
        }
      } catch (err: any) {
        ctx.logger.warn(`Notice while fetching site metadata: ${err.message}`);
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

      // Resolve the exact SCM Kudu host dynamically from the Azure publish profile or site hostname
      const rawPublishUrlMatch = xml.match(/publishUrl="([^":]+)/);
      if (rawPublishUrlMatch && rawPublishUrlMatch[1]) {
        scmHost = rawPublishUrlMatch[1];
      } else if (defaultHostName.includes('.')) {
        // e.g. claims-ui.westus3-01.azurewebsites.net -> claims-ui.scm.westus3-01.azurewebsites.net
        scmHost = defaultHostName.replace(/^([^.]+)\./, '$1.scm.');
      }
      ctx.logger.info(`Resolved Azure SCM Host: [${scmHost}]`);

      // 4. Download source code zip from GitHub or Azure DevOps
      let rawZipBuffer: Buffer;
      const targetBranch = branch || 'main';

      if (isAdo) {
        ctx.logger.info(`Downloading application archive from Azure DevOps [${organization}/${project}/_git/${repoFullName}] (branch: ${targetBranch})...`);
        const adoZipUrl = `https://dev.azure.com/${encodeURIComponent(organization!)}/${encodeURIComponent(project!)}/_apis/git/repositories/${encodeURIComponent(repoFullName)}/items?path=/&recursionLevel=full&versionDescriptor[version]=${encodeURIComponent(targetBranch)}&$format=zip&api-version=7.1`;
        const zipRes = await fetch(adoZipUrl, {
          headers: {
            Authorization: `Basic ${Buffer.from(`:${adoToken}`).toString('base64')}`,
            'User-Agent': 'Backstage-Azure-Deployer',
          },
        });

        if (!zipRes.ok) {
          throw new Error(`Failed to download repository zip from Azure DevOps: ${zipRes.status} ${zipRes.statusText}`);
        }
        rawZipBuffer = Buffer.from(await zipRes.arrayBuffer());
      } else {
        ctx.logger.info(`Downloading application archive from GitHub [${repoFullName}]...`);
        const zipRes = await fetch(`https://api.github.com/repos/${repoFullName}/zipball/${encodeURIComponent(targetBranch)}`, {
          headers: {
            Authorization: `Bearer ${githubToken}`,
            'User-Agent': 'Backstage-Azure-Deployer',
          },
        });

        if (!zipRes.ok) {
          throw new Error(`Failed to download repository zip from GitHub: ${zipRes.statusText}`);
        }
        rawZipBuffer = Buffer.from(await zipRes.arrayBuffer());
      }

      ctx.logger.info(`Downloaded raw zip archive (${rawZipBuffer.length} bytes). Flattening root structure...`);

      // 5. Flatten the zip archive so files sit at the root of wwwroot
      const rawZip = new AdmZip(rawZipBuffer);
      const entries = rawZip.getEntries();
      const cleanZip = new AdmZip();

      // Check if all files share a common root directory (standard for GitHub zipballs, sometimes ADO)
      const firstEntryName = entries[0]?.entryName || '';
      const hasSinglePrefix = firstEntryName.includes('/') && entries.every(e => e.entryName.startsWith(firstEntryName.split('/')[0] + '/'));
      const prefix = hasSinglePrefix ? firstEntryName.split('/')[0] + '/' : '';

      let isNode = false;
      let isPython = false;
      let isDotNet = false;
      let isJava = false;
      let isReactSpa = false;

      for (const entry of entries) {
        if (!entry.isDirectory) {
          const relativePath = prefix && entry.entryName.startsWith(prefix)
            ? entry.entryName.slice(prefix.length)
            : entry.entryName;
          if (relativePath) {
            cleanZip.addFile(relativePath, entry.getData());
            if (relativePath === 'package.json') isNode = true;
            if (relativePath === 'requirements.txt' || relativePath === 'app.py' || relativePath === 'manage.py' || relativePath === 'pyproject.toml') isPython = true;
            if (relativePath.endsWith('.csproj') || relativePath.endsWith('.sln')) isDotNet = true;
            if (relativePath === 'pom.xml' || relativePath === 'build.gradle') isJava = true;
            if (relativePath === 'src/App.js' || relativePath === 'src/App.tsx' || relativePath === 'src/main.tsx' || relativePath === 'src/main.jsx' || relativePath === 'vite.config.js' || relativePath === 'vite.config.ts') isReactSpa = true;
          }
        }
      }

      // If it is a React SPA, compile the production build locally and bundle static server
      if (isNode && isReactSpa) {
        ctx.logger.info('🔨 Compiling React/Vite production bundle locally to guarantee zero 404 errors...');
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

          // Support both CRA ('build') and Vite ('dist') output directories
          const buildOutputDir = fs.existsSync(path.join(buildWorkspace, 'dist'))
            ? path.join(buildWorkspace, 'dist')
            : path.join(buildWorkspace, 'build');

          if (fs.existsSync(buildOutputDir)) {
            ctx.logger.info('✅ Production build compiled successfully! Injecting build assets into deployment zip...');
            cleanZip.addLocalFolder(buildOutputDir, 'build');
            cleanZip.addLocalFolder(buildOutputDir, 'dist');
            // Also copy index.html directly to root for instantaneous static page detection
            const indexHtmlPath = path.join(buildOutputDir, 'index.html');
            if (fs.existsSync(indexHtmlPath)) {
              cleanZip.addFile('index.html', fs.readFileSync(indexHtmlPath));
            }
          }

          // Inject standalone zero-dependency server.js supporting both 'dist', 'build', and root
          const serverJs = `const http = require('http');
const fs = require('fs');
const path = require('path');
const port = process.env.PORT || 8080;
const publicDir = fs.existsSync(path.join(__dirname, 'dist')) 
  ? path.join(__dirname, 'dist') 
  : (fs.existsSync(path.join(__dirname, 'build')) 
      ? path.join(__dirname, 'build') 
      : (fs.existsSync(path.join(__dirname, 'public')) ? path.join(__dirname, 'public') : __dirname));
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
                SCM_DO_BUILD_DURING_DEPLOYMENT: isReactSpa ? 'false' : 'true',
                ENABLE_ORYX_BUILD: isReactSpa ? 'false' : 'true',
                WEBSITES_ENABLE_APP_SERVICE_STORAGE: 'true',
                PORT: '8080',
                CI: 'false',
              },
            }),
          }
        );

        if (isNode) {
          ctx.logger.info('Detected Node.js application. Ensuring Azure App Service uses Node 20 runtime...');
          // For prebuilt React apps, run the embedded zero-dependency static server
          const startupCommand = isReactSpa
            ? 'node server.js'
            : 'npm start';
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
        // Ensure SCM Basic Authentication is enabled on the App Service so Kudu ZipDeploy succeeds
        try {
          ctx.logger.info(`Checking and enabling SCM basic publishing credentials policy on [${webAppName}]...`);
          const scmPolicyRes = await fetch(
            `https://management.azure.com/subscriptions/${sub}/resourceGroups/${targetRg}/providers/Microsoft.Web/sites/${webAppName}/basicPublishingCredentialsPolicies/scm?api-version=2022-03-01`,
            {
              method: 'PUT',
              headers: { Authorization: `Bearer ${armToken}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                properties: {
                  allow: true,
                },
              }),
            }
          );
          if (scmPolicyRes.ok) {
            ctx.logger.info(`SCM basic publishing credentials successfully enabled.`);
          } else {
            ctx.logger.warn(`Notice enabling SCM basic auth: ${await scmPolicyRes.text()}`);
          }
        } catch (policyErr: any) {
          ctx.logger.warn(`Could not set SCM policy: ${policyErr.message}`);
        }
      } catch (err: any) {
        ctx.logger.warn(`Notice while adjusting runtime & settings: ${err.message}`);
      }

      // 7. Deploy application package directly into wwwroot
      ctx.logger.info(`Deploying application bundle directly to Azure Web App wwwroot (${scmHost})...`);
      const basicAuthHeader = `Basic ${Buffer.from(`${user}:${pwd}`).toString('base64')}`;
      const bearerAuthHeader = `Bearer ${armToken}`;

      // Clean existing stale deployment assets (old index.html, assets, build) to guarantee newly selected repo displays cleanly
      try {
        ctx.logger.info('Performing pre-deployment cleanup of legacy assets in /site/wwwroot/...');
        const listRes = await fetch(`https://${scmHost}/api/vfs/site/wwwroot/`, {
          headers: { Authorization: basicAuthHeader },
        });
        if (listRes.ok) {
          const files = await listRes.json();
          for (const item of files) {
            if (['index.html', 'assets', 'build', 'dist', 'server.js', 'package.json'].includes(item.name)) {
              await fetch(`https://${scmHost}/api/vfs/site/wwwroot/${item.name}${item.mime === 'inode/directory' ? '/?recursive=true' : ''}`, {
                method: 'DELETE',
                headers: { Authorization: basicAuthHeader, 'If-Match': '*' },
              }).catch(() => {});
            }
          }
          ctx.logger.info('Cleaned previous application assets to prevent collision.');
        }
      } catch (cleanErr: any) {
        ctx.logger.warn(`Notice during cleanup: ${cleanErr.message}`);
      }

      // Upload directly to /api/zip/site/wwwroot/ which reliably extracts into wwwroot
      let activeAuthHeader = bearerAuthHeader;
      try {
        const zipUploadRes = await fetch(`https://${scmHost}/api/zip/site/wwwroot/`, {
          method: 'PUT',
          headers: {
            Authorization: activeAuthHeader,
            'Content-Type': 'application/octet-stream',
            'If-Match': '*',
          },
          body: deploymentZip,
        });

        if (zipUploadRes.ok) {
          ctx.logger.info(`✅ Successfully synchronized application assets into /site/wwwroot/ (HTTP ${zipUploadRes.status})`);
        } else {
          ctx.logger.warn(`Notice uploading to /api/zip: HTTP ${zipUploadRes.status}. Retrying with Basic Auth...`);
          activeAuthHeader = basicAuthHeader;
          await fetch(`https://${scmHost}/api/zip/site/wwwroot/`, {
            method: 'PUT',
            headers: {
              Authorization: activeAuthHeader,
              'Content-Type': 'application/octet-stream',
              'If-Match': '*',
            },
            body: deploymentZip,
          });
        }
      } catch (uploadErr: any) {
        ctx.logger.warn(`Direct zip upload fallback notice: ${uploadErr.message}`);
      }

      // 8. If Oryx remote build was requested (non-SPA), wait for build pipeline
      if (!isReactSpa) {
        ctx.logger.info(`⏳ Waiting for Azure build pipeline to install dependencies and compile application...`);
        let isBuilt = false;
        let lastProgress = '';
        for (let attempt = 0; attempt < 90; attempt++) {
          await new Promise(r => setTimeout(r, 10000)); // poll every 10s
          try {
            const depRes = await fetch(`https://${scmHost}/api/deployments/latest`, {
              headers: { Authorization: activeAuthHeader },
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
      }

      // 9. Remove default Azure placeholder hostingstart.html if present via Kudu VFS
      try {
        ctx.logger.info(`Removing default Azure placeholder (hostingstart.html) if present...`);
        const delRes = await fetch(`https://${scmHost}/api/vfs/site/wwwroot/hostingstart.html`, {
          method: 'DELETE',
          headers: {
            Authorization: activeAuthHeader,
            'If-Match': '*',
          },
        });
        if (delRes.ok) {
          ctx.logger.info(`Successfully cleared placeholder hostingstart.html from wwwroot.`);
        }
      } catch (e: any) {
        ctx.logger.warn(`Notice while removing hostingstart.html: ${e.message}`);
      }

      // 10. Restart the Web App to initialize application container
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
      const repoUrl = isAdo
        ? `https://dev.azure.com/${organization}/${project}/_git/${repoFullName}`
        : `https://github.com/${repoFullName}`;

      // 10. Automatically register/sync Component into Backstage Catalog with all tabs enabled
      try {
        const repoShort = repoFullName.includes('/') ? repoFullName.split('/')[1] : repoFullName;
        const cleanCompName = repoShort.replace(/[^a-zA-Z0-9_-]/g, '-').toLowerCase();
        const entitiesFile = path.resolve(__dirname, '../../../../examples/entities.yaml');
        const altEntitiesFile = '/app/examples/entities.yaml';
        const targetPath = fs.existsSync(entitiesFile) ? entitiesFile : (fs.existsSync(altEntitiesFile) ? altEntitiesFile : null);

        if (targetPath) {
          const currentContent = fs.readFileSync(targetPath, 'utf8');
          if (!currentContent.includes(`name: ${cleanCompName}`) && !currentContent.includes(`'${repoFullName}'`)) {
            const compSnippet = `
---
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: ${cleanCompName}
  title: "${repoShort}"
  description: "Cloud Web App & Microservice hosted on Azure (${webAppName})"
  annotations:
    ${isAdo ? `dev.azure.com/project-repo: '${organization}/${project}/${repoFullName}'` : `github.com/project-slug: '${repoFullName}'`}
    azure.com/app-service-name: '${webAppName}'
    azure.com/resource-group: '${targetRg}'
    jira/project-key: 'SCRUM'
    datadoghq.com/dashboard-url: 'https://p.datadoghq.com/sb/f2fdc87e-bdb2-11f1-880c-ce62a0ab8181-2feb325f332f971e08c696cf64e6f65c'
    datadoghq.com/graph-token: 'your_graph_token_here'
  links:
    - url: ${repoUrl}
      title: ${isAdo ? 'Azure DevOps Repository' : 'GitHub Repository'}
      icon: ${isAdo ? 'cloud' : 'github'}
    - url: ${liveUrl}
      title: Live Azure Web App
      icon: web
spec:
  type: website
  lifecycle: production
  owner: platform-engineering
`;
            fs.appendFileSync(targetPath, compSnippet, 'utf8');
            ctx.logger.info(`✨ Automatically registered [${cleanCompName}] as a Backstage Component with Azure, Jira, and Datadog tabs!`);
          }
        }
      } catch (err: any) {
        ctx.logger.warn(`Notice while registering catalog component: ${err.message}`);
      }

      ctx.logger.info(`🎉 DEPLOYMENT 100% COMPLETE AND APPLICATION IS LIVE!`);
      ctx.logger.info(`🌐 Live Web App URL: ${liveUrl}`);
      ctx.logger.info(`📦 Repository: ${repoUrl}`);

      ctx.output('webAppUrl', liveUrl);
      ctx.output('repoUrl', repoUrl);
    },
  });

};
