import { createBackendPlugin, coreServices } from '@backstage/backend-plugin-api';
import express from 'express';

export const adoProxyPlugin = createBackendPlugin({
  pluginId: 'ado-proxy',
  register(env) {
    env.registerInit({
      deps: {
        httpRouter: coreServices.httpRouter,
        config: coreServices.rootConfig,
      },
      async init({ httpRouter, config }) {
        const router = express.Router();
        router.use(express.json());

        router.get('/projects', async (req, res) => {
          const { organization } = req.query;

          if (!organization) {
            res.status(400).json({ error: 'organization is required' });
            return;
          }

          try {
            const azureIntegrations = config.getOptionalConfigArray('integrations.azure') || [];
            const devAzureIntegration = azureIntegrations.find(c => c.getString('host') === 'dev.azure.com');
            
            let token = devAzureIntegration?.getOptionalString('token');
            if (!token) {
              const credentials = devAzureIntegration?.getOptionalConfigArray('credentials') || [];
              token = credentials[0]?.getOptionalString('personalAccessToken');
            }

            if (!token) {
              res.status(500).json({ error: 'No ADO token configured' });
              return;
            }

            const url = `https://dev.azure.com/${organization}/_apis/projects?api-version=7.1`;
            
            const response = await fetch(url, {
              headers: {
                'Authorization': `Basic ${Buffer.from(`:${token}`).toString('base64')}`
              }
            });

            if (!response.ok) {
              const err = await response.text();
              console.error('ADO API error:', err);
              res.status(response.status).json({ error: 'Failed to fetch ADO projects' });
              return;
            }

            const data = await response.json();
            const projects = (data.value || []).map((p: any) => ({
              id: p.id,
              name: p.name,
              description: p.description
            }));

            res.json({ projects });
          } catch (e: any) {
            console.error('ADO proxy error:', e);
            res.status(500).json({ error: e.message });
          }
        });

        router.get('/work-items', async (req, res) => {
          const { organization, project, type } = req.query;

          if (!organization || !project || !type) {
            res.status(400).json({ error: 'organization, project, and type are required' });
            return;
          }

          try {
            const azureIntegrations = config.getOptionalConfigArray('integrations.azure') || [];
            const devAzureIntegration = azureIntegrations.find(c => c.getString('host') === 'dev.azure.com');
            
            let token = devAzureIntegration?.getOptionalString('token');
            if (!token) {
              const credentials = devAzureIntegration?.getOptionalConfigArray('credentials') || [];
              token = credentials[0]?.getOptionalString('personalAccessToken');
            }

            if (!token) {
              res.status(500).json({ error: 'No ADO token configured' });
              return;
            }

            // Wiql query to get work items of the specified type
            const wiql = `Select [System.Id], [System.Title] From WorkItems Where [System.WorkItemType] = '${type}' And [System.TeamProject] = '${project}' Order By [System.ChangedDate] Desc`;
            
            const wiqlUrl = `https://dev.azure.com/${organization}/${project}/_apis/wit/wiql?api-version=7.1`;
            
            const wiqlResponse = await fetch(wiqlUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${Buffer.from(`:${token}`).toString('base64')}`
              },
              body: JSON.stringify({ query: wiql })
            });

            if (!wiqlResponse.ok) {
              const err = await wiqlResponse.text();
              console.error('ADO WIQL error:', err);
              res.status(wiqlResponse.status).json({ error: 'Failed to query ADO' });
              return;
            }

            const wiqlData = await wiqlResponse.json();
            const workItemRefs = wiqlData.workItems || [];
            
            if (workItemRefs.length === 0) {
              res.json({ workItems: [] });
              return;
            }

            // Fetch details for the found IDs (up to 200)
            const ids = workItemRefs.slice(0, 200).map((w: any) => w.id).join(',');
            const detailsUrl = `https://dev.azure.com/${organization}/${project}/_apis/wit/workitems?ids=${ids}&fields=System.Id,System.Title&api-version=7.1`;
            
            const detailsResponse = await fetch(detailsUrl, {
              headers: {
                'Authorization': `Basic ${Buffer.from(`:${token}`).toString('base64')}`
              }
            });

            if (!detailsResponse.ok) {
              res.status(detailsResponse.status).json({ error: 'Failed to fetch ADO work item details' });
              return;
            }

            const detailsData = await detailsResponse.json();
            
            const items = (detailsData.value || []).map((item: any) => ({
              id: item.id,
              title: item.fields['System.Title']
            }));

            res.json({ workItems: items });
          } catch (e: any) {
            console.error('ADO proxy error:', e);
            res.status(500).json({ error: e.message });
          }
        });

        httpRouter.use(router);
      },
    });
  },
});
