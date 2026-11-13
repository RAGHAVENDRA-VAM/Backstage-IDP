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

        // Get Branches for a given ADO repository
        router.get('/branches', async (req, res) => {
          const { organization, project, repository } = req.query;

          if (!organization || !project || !repository) {
            res.status(400).json({ error: 'organization, project, and repository are required' });
            return;
          }

          try {
            const token = getAdoToken();
            if (!token) {
              res.status(500).json({ error: 'No ADO token configured' });
              return;
            }

            const authHeader = `Basic ${Buffer.from(`:${token}`).toString('base64')}`;
            const url = `https://dev.azure.com/${organization}/${project}/_apis/git/repositories/${encodeURIComponent(String(repository))}/refs?filter=heads/&api-version=7.1`;

            const response = await fetch(url, {
              headers: { Authorization: authHeader },
            });

            if (!response.ok) {
              const err = await response.text();
              console.error('ADO Branches API error:', err);
              res.status(response.status).json({ error: 'Failed to fetch ADO branches' });
              return;
            }

            const data = await response.json();
            const branches = (data.value || []).map((b: any) => {
              const shortName = b.name.replace(/^refs\/heads\//, '');
              return {
                name: shortName,
                refName: b.name,
                objectId: b.objectId,
              };
            });

            res.json({ branches });
          } catch (e: any) {
            console.error('ADO branches error:', e);
            res.status(500).json({ error: e.message });
          }
        });

        // Get Pipelines for a given ADO project, optionally filtered by repository
        router.get('/pipelines', async (req, res) => {
          const { organization, project, repositoryId, repositoryName, branch } = req.query;

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
            const targetBranch = branch ? String(branch).replace(/^refs\/heads\//, '') : 'main';

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

            let definitions: any[] = [];
            if (response.ok) {
              const data = await response.json();
              definitions = data.value || [];
            }

            // Strategy 2: If repositoryName or repositoryId is provided, inspect YAML files in the repository branch
            // to discover all pipeline files in the branch code (e.g. azure-pipelines.yml, pipelines/*.yml, .azure/pipeline.yml)
            const discoveredYamlPipelines: Array<{ id: number; name: string; path: string; file: string }> = [];
            if (repositoryName || repositoryId) {
              const repoIdentifier = repositoryName || repositoryId;
              try {
                const itemsUrl = `https://dev.azure.com/${encodeURIComponent(String(organization))}/${encodeURIComponent(String(project))}/_apis/git/repositories/${encodeURIComponent(String(repoIdentifier))}/items?path=/&recursionLevel=full&versionDescriptor.version=${encodeURIComponent(targetBranch)}&versionDescriptor.versionType=branch&api-version=7.1`;
                const itemsRes = await fetch(itemsUrl, {
                  headers: { Authorization: authHeader },
                });

                if (itemsRes.ok) {
                  const itemsData = await itemsRes.json();
                  const yamlFiles = (itemsData.value || []).filter((item: any) => {
                    if (item.isFolder) return false;
                    const p = (item.path || '').toLowerCase();
                    return p.endsWith('.yml') || p.endsWith('.yaml');
                  });

                  for (const yf of yamlFiles) {
                    const fileName = yf.path.split('/').pop();
                    // Check if it's a pipeline file or azure-pipelines
                    discoveredYamlPipelines.push({
                      id: 0,
                      name: `${fileName} (${yf.path})`,
                      path: yf.path,
                      file: yf.path,
                    });
                  }
                }
              } catch (e: any) {
                console.warn('Notice while inspecting branch yaml files:', e.message);
              }
            }

            // Filter definitions matching repository name if found
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

            // Merge discovered branch yaml pipelines if definitions don't cover them
            for (const dp of discoveredYamlPipelines) {
              if (!pipelines.some(p => p.name === dp.name)) {
                pipelines.push({
                  id: dp.id,
                  name: dp.name,
                  path: dp.path,
                  url: `https://dev.azure.com/${organization}/${project}/_git/${repositoryName}?path=${encodeURIComponent(dp.path)}&version=GB${encodeURIComponent(targetBranch)}`,
                  repository: { id: String(repositoryId || ''), name: String(repositoryName || '') },
                });
              }
            }

            res.json({ pipelines });
          } catch (e: any) {
            console.error('ADO Pipelines proxy error:', e);
            res.status(500).json({ error: e.message });
          }
        });

        // Debug endpoint: Inspect pipeline definition and file content
        router.get('/debug-pipeline', async (req, res) => {
          const { organization, project, pipelineId, repository, branch, path: filePath } = req.query;
          try {
            const token = getAdoToken();
            if (!token) return res.status(500).json({ error: 'No token' });
            const authHeader = `Basic ${Buffer.from(`:${token}`).toString('base64')}`;

            let definition = null;
            if (pipelineId) {
              const dRes = await fetch(`https://dev.azure.com/${organization}/${project}/_apis/build/definitions/${pipelineId}?api-version=7.1`, {
                headers: { Authorization: authHeader }
              });
              if (dRes.ok) definition = await dRes.json();
            }

            let fileContent = null;
            if (repository && filePath) {
              const targetBranch = branch ? String(branch).replace(/^refs\/heads\//, '') : 'main';
              const fRes = await fetch(`https://dev.azure.com/${organization}/${project}/_apis/git/repositories/${encodeURIComponent(String(repository))}/items?path=${encodeURIComponent(String(filePath))}&includeContent=true&versionDescriptor.version=${encodeURIComponent(targetBranch)}&versionDescriptor.versionType=branch&api-version=7.1`, {
                headers: { Authorization: authHeader }
              });
              if (fRes.ok) {
                const fData = await fRes.json();
                fileContent = fData.content;
              }
            }

            // Variable groups in project
            const vgRes = await fetch(`https://dev.azure.com/${organization}/${project}/_apis/distributedtask/variablegroups?api-version=7.1-preview.2`, {
              headers: { Authorization: authHeader }
            });
            let variableGroups = null;
            if (vgRes.ok) {
              const vgData = await vgRes.json();
              variableGroups = (vgData.value || []).map((v: any) => ({ id: v.id, name: v.name }));
            }

            res.json({ definition, fileContent, variableGroups });
          } catch (e: any) {
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
