const d = require('dotenv').config();
const tenant = d.parsed['AZURE_TENANT_ID'];
const client = d.parsed['AZURE_CLIENT_ID'];
const secret = d.parsed['AZURE_CLIENT_SECRET'];
const sub = d.parsed['AZURE_SUBSCRIPTION_ID'];

async function check() {
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

  const sitesRes = await fetch(`https://management.azure.com/subscriptions/${sub}/providers/Microsoft.Web/sites?api-version=2022-03-01`, {
    headers: { Authorization: `Bearer ${armToken}` }
  });
  const sites = await sitesRes.json();
  const site = sites.value.find(s => s.name.toLowerCase().includes('claimswebapp'));
  console.log('Site found:', site ? { name: site.name, rg: site.properties.resourceGroup } : 'None');

  if (site) {
    const xmlRes = await fetch(
      `https://management.azure.com/subscriptions/${sub}/resourceGroups/${site.properties.resourceGroup}/providers/Microsoft.Web/sites/${site.name}/publishxml?api-version=2022-03-01`,
      { method: 'POST', headers: { Authorization: `Bearer ${armToken}` } }
    );
    const xml = await xmlRes.text();
    const user = xml.split('userName="')[1]?.split('"')[0];
    const pwd = xml.split('userPWD="')[1]?.split('"')[0];
    const auth = 'Basic ' + Buffer.from(`${user}:${pwd}`).toString('base64');

    const depsRes = await fetch(`https://${site.name}.scm.azurewebsites.net/api/deployments`, {
      headers: { Authorization: auth }
    });
    const deps = await depsRes.json();
    console.log('Deployments:', deps.map(d => ({ id: d.id, status: d.status, status_text: d.status_text, progress: d.progress, complete: d.complete })));

    console.log('Ensuring startup command and restarting...');
    await fetch(
      `https://management.azure.com/subscriptions/${sub}/resourceGroups/${site.properties.resourceGroup}/providers/Microsoft.Web/sites/${site.name}/config/web?api-version=2022-03-01`,
      {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${armToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          properties: {
            linuxFxVersion: 'NODE|20-lts',
            appCommandLine: 'npx serve -s build -l 8080',
          },
        }),
      }
    );

    await fetch(
      `https://management.azure.com/subscriptions/${sub}/resourceGroups/${site.properties.resourceGroup}/providers/Microsoft.Web/sites/${site.name}/restart?api-version=2022-03-01`,
      { method: 'POST', headers: { Authorization: `Bearer ${armToken}` } }
    );
    console.log('Restarted.');
  }
}
check().catch(console.error);
