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
        httpRouter.addAuthPolicy({
          path: '*',
          allow: 'unauthenticated',
        });

        const router = express.Router();
        router.use(express.json());

        // Helper function to resolve the Azure DevOps personal access token
        const getAdoToken = (): string | undefined => {
          let token = process.env.AZURE_DEVOPS_TOKEN || process.env.AZURE_TOKEN;
          if (token) return token;

          const azureIntegrations = config.getOptionalConfigArray('integrations.azure') || [];
          const devAzureIntegration = azureIntegrations.find(c => c.getString('host') === 'dev.azure.com');
          
          token = devAzureIntegration?.getOptionalString('token');
          if (!token) {
            const credentials = devAzureIntegration?.getOptionalConfigArray('credentials') || [];
            token = credentials[0]?.getOptionalString('personalAccessToken');
          }
          return token;
        };

        router.get('/projects', async (req, res) => {
          const { organization } = req.query;

          if (!organization) {
            res.status(400).json({ error: 'organization is required' });
            return;
          }

          try {
            const token = getAdoToken();

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

        // Get Git Repositories for a given ADO project
        router.get('/repositories', async (req, res) => {
          const { organization, project } = req.query;

          if (!organization || !project) {
            res.status(400).json({ error: 'organization and project are required' });
            return;
          }

          try {
            const token = getAdoToken();

            if (!token) {
              res.status(500).json({ error: 'No ADO token configured' });
              return;
            }

            const url = `https://dev.azure.com/${organization}/${project}/_apis/git/repositories?api-version=7.1`;
            
            const response = await fetch(url, {
              headers: {
                'Authorization': `Basic ${Buffer.from(`:${token}`).toString('base64')}`
              }
            });

            if (!response.ok) {
              const err = await response.text();
              console.error('ADO API error:', err);
              res.status(response.status).json({ error: 'Failed to fetch ADO repositories' });
              return;
            }

            const data = await response.json();
            const repositories = (data.value || []).map((r: any) => ({
              id: r.id,
              name: r.name,
              defaultBranch: r.defaultBranch,
              webUrl: r.webUrl,
              remoteUrl: r.remoteUrl,
            }));

            res.json({ repositories });
          } catch (e: any) {
            console.error('ADO proxy error:', e);
            res.status(500).json({ error: e.message });
          }
        });

        // Get Pipelines for a given ADO project, optionally filtered by repository
        router.get('/pipelines', async (req, res) => {
          const { organization, project, repositoryId, repositoryName } = req.query;

          if (!organization || !project) {
            res.status(400).json({ error: 'organization and project are required' });
            return;
          }

          try {
            const token = getAdoToken();

            if (!token) {
              res.status(500).json({ error: 'No ADO token configured' });
              return;
            }

            const authHeader = `Basic ${Buffer.from(`:${token}`).toString('base64')}`;

            // Strategy 1: Build Definitions API with repositoryId filter
            let pipelinesUrl = `https://dev.azure.com/${organization}/${project}/_apis/build/definitions?api-version=7.1`;
            if (repositoryId) {
              pipelinesUrl += `&repositoryId=${encodeURIComponent(String(repositoryId))}&repositoryType=TfsGit`;
            }

            let response = await fetch(pipelinesUrl, {
              headers: { Authorization: authHeader },
            });

            if (!response.ok) {
              // Fallback to generic definitions list
              response = await fetch(`https://dev.azure.com/${organization}/${project}/_apis/build/definitions?api-version=7.1`, {
                headers: { Authorization: authHeader },
              });
            }

            if (!response.ok) {
              const err = await response.text();
              console.error('ADO Pipelines API error:', err);
              res.status(response.status).json({ error: 'Failed to fetch ADO pipelines' });
              return;
            }

            const data = await response.json();
            let definitions = data.value || [];

            // If repositoryName was provided and multiple pipelines returned, prioritize matches
            if (repositoryName && definitions.length > 0) {
              const rName = String(repositoryName).toLowerCase();
              const filtered = definitions.filter((d: any) => {
                const defRepoName = (d.repository?.name || '').toLowerCase();
                const defName = (d.name || '').toLowerCase();
                return defRepoName === rName || defName.includes(rName);
              });
              if (filtered.length > 0) {
                definitions = filtered;
              }
            }

            const pipelines = definitions.map((d: any) => ({
              id: d.id,
              name: d.name,
              path: d.path,
              url: d._links?.web?.href || `https://dev.azure.com/${organization}/${project}/_build?definitionId=${d.id}`,
              repository: d.repository ? { id: d.repository.id, name: d.repository.name } : undefined,
            }));

            res.json({ pipelines });
          } catch (e: any) {
            console.error('ADO Pipelines proxy error:', e);
            res.status(500).json({ error: e.message });
          }
        });

        // Get status of a specific pipeline run
        router.get('/pipeline-run-status', async (req, res) => {
          const { organization, project, pipelineId, runId } = req.query;

          if (!organization || !project || !pipelineId || !runId) {
            res.status(400).json({ error: 'organization, project, pipelineId, and runId are required' });
            return;
          }

          try {
            const token = getAdoToken();
            if (!token) {
              res.status(500).json({ error: 'No ADO token configured' });
              return;
            }

            const authHeader = `Basic ${Buffer.from(`:${token}`).toString('base64')}`;
            const url = `https://dev.azure.com/${organization}/${project}/_apis/pipelines/${pipelineId}/runs/${runId}?api-version=7.1`;

            const response = await fetch(url, {
              headers: { Authorization: authHeader },
            });

            if (!response.ok) {
              res.status(response.status).json({ error: 'Failed to fetch pipeline run status' });
              return;
            }

            const data = await response.json();
            res.json({
              id: data.id,
              name: data.name,
              state: data.state, // inProgress, completed, cancelling, notStarted
              result: data.result, // succeeded, failed, canceled
              createdDate: data.createdDate,
              finishedDate: data.finishedDate,
              webUrl: data._links?.web?.href || `https://dev.azure.com/${organization}/${project}/_build/results?buildId=${data.id}`,
            });
          } catch (e: any) {
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
            const token = getAdoToken();

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
