import { createBackendPlugin, coreServices } from '@backstage/backend-plugin-api';
import express from 'express';

export const integrationsProxyPlugin = createBackendPlugin({
  pluginId: 'integrations-proxy',
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

        // 1. JIRA ENDPOINT - Uses v3 JQL API with query & project support
        router.get('/jira/issues', async (req, res) => {
          try {
            const baseUrl = process.env.JIRA_BASE_URL || 'https://valuemomentum-tsc.atlassian.net';
            const auth = process.env.JIRA_BASIC_AUTH_TOKEN;

            if (!auth) {
              res.status(500).json({ error: 'Jira token not configured' });
              return;
            }

            const projectParam = req.query.project as string;
            let jqlParam = req.query.jql as string;

            if (!jqlParam) {
              if (projectParam) {
                jqlParam = `project = "${projectParam}" ORDER BY created DESC`;
              } else {
                jqlParam = 'project in (SCRUM, RISK) ORDER BY created DESC';
              }
            }

            const response = await fetch(`${baseUrl}/rest/api/3/search/jql`, {
              method: 'POST',
              headers: {
                Authorization: `Basic ${auth}`,
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                jql: jqlParam,
                fields: ['summary', 'status', 'priority', 'assignee', 'created', 'issuetype', 'reporter', 'project'],
                maxResults: 50,
              }),
            });

            if (!response.ok) {
              const err = await response.text();
              console.error('Jira API error:', err);
              res.status(response.status).json({ error: 'Failed to fetch Jira issues' });
              return;
            }

            const data = await response.json();
            const issues = (data.issues || []).map((i: any) => ({
              id: i.id,
              key: i.key,
              summary: i.fields?.summary || 'Untitled Issue',
              status: i.fields?.status?.name || 'Open',
              priority: i.fields?.priority?.name || 'Medium',
              issueType: i.fields?.issuetype?.name || 'Task',
              assignee: i.fields?.assignee?.displayName || 'Unassigned',
              created: i.fields?.created,
              url: `${baseUrl}/browse/${i.key}`,
            }));

            res.json({ issues, total: data.total || issues.length });
          } catch (e: any) {
            console.error('Jira proxy error:', e);
            res.status(500).json({ error: e.message });
          }
        });

        // 2. GITHUB ENDPOINT - Live Repos, Commits, PRs, Workflow Runs
        router.get('/github/overview', async (req, res) => {
          try {
            const token = process.env.GITHUB_TOKEN;
            const ownerRepo = (req.query.repo as string) || 'RAGHAVENDRA-VAM/Claims_UI';

            if (!token) {
              res.status(500).json({ error: 'GitHub token not configured' });
              return;
            }

            const headers = {
              Authorization: `Bearer ${token}`,
              'User-Agent': 'backstage-dashboard',
              Accept: 'application/vnd.github.v3+json',
            };

            const [repoRes, commitsRes, pullsRes, runsRes, readmeRes] = await Promise.all([
              fetch(`https://api.github.com/repos/${ownerRepo}`, { headers }),
              fetch(`https://api.github.com/repos/${ownerRepo}/commits?per_page=10`, { headers }),
              fetch(`https://api.github.com/repos/${ownerRepo}/pulls?state=all&per_page=50`, { headers }),
              fetch(`https://api.github.com/repos/${ownerRepo}/actions/runs?per_page=50`, { headers }),
              fetch(`https://api.github.com/repos/${ownerRepo}/readme`, { headers: { ...headers, Accept: 'application/vnd.github.v3.raw' } }),
            ]);

            const repoData = repoRes.ok ? await repoRes.json() : {};
            const commitsData = commitsRes.ok ? await commitsRes.json() : [];
            const pullsData = pullsRes.ok ? await pullsRes.json() : [];
            const runsData = runsRes.ok ? await runsRes.json() : {};
            const readmeContent = readmeRes.ok ? await readmeRes.text() : '';

            const commits = (commitsData || []).map((c: any) => ({
              sha: c.sha?.slice(0, 7),
              fullSha: c.sha,
              message: c.commit?.message?.split('\n')[0] || 'Commit',
              author: c.commit?.author?.name || c.author?.login || 'Developer',
              date: c.commit?.author?.date,
              url: c.html_url,
            }));

            const pulls = (pullsData || []).map((p: any) => ({
              number: p.number,
              title: p.title,
              state: p.state,
              author: p.user?.login || 'Author',
              created: p.created_at,
              url: p.html_url,
              draft: p.draft,
            }));

            const runs = (runsData.workflow_runs || []).map((r: any) => ({
              id: r.id,
              name: r.name,
              status: r.status,
              conclusion: r.conclusion || 'in_progress',
              branch: r.head_branch,
              actor: r.actor?.login,
              created: r.created_at,
              url: r.html_url,
            }));

            res.json({
              readme: readmeContent,
              repo: {
                name: repoData.name,
                fullName: repoData.full_name,
                description: repoData.description,
                defaultBranch: repoData.default_branch,
                stars: repoData.stargazers_count,
                forks: repoData.forks_count,
                openIssues: repoData.open_issues_count,
                htmlUrl: repoData.html_url,
              },
              commits,
              pulls,
              runs,
            });
          } catch (e: any) {
            console.error('GitHub proxy error:', e);
            res.status(500).json({ error: e.message });
          }
        });

        // 3. GITHUB REPOSITORIES LIST ENDPOINT
        router.get('/github/repos', async (_req, res) => {
          try {
            const token = process.env.GITHUB_TOKEN;
            if (!token) {
              res.status(500).json({ error: 'GitHub token not configured' });
              return;
            }

            const response = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
              headers: {
                Authorization: `Bearer ${token}`,
                'User-Agent': 'backstage-dashboard',
                Accept: 'application/vnd.github.v3+json',
              },
            });

            if (!response.ok) {
              res.status(response.status).json({ error: 'Failed to fetch repositories' });
              return;
            }

            const rawRepos = await response.json();
            const repos = (Array.isArray(rawRepos) ? rawRepos : []).map((r: any) => ({
              id: r.id,
              name: r.name,
              fullName: r.full_name,
              description: r.description || 'No description provided',
              private: r.private,
              language: r.language || 'Code',
              defaultBranch: r.default_branch,
              stars: r.stargazers_count,
              forks: r.forks_count,
              openIssues: r.open_issues_count,
              updatedAt: r.updated_at,
              htmlUrl: r.html_url,
              cloneUrl: r.clone_url,
            }));

            res.json({ repos, total: repos.length });
          } catch (e: any) {
            console.error('GitHub repos error:', e);
            res.status(500).json({ error: e.message });
          }
        });

        // 4. REGISTER GITHUB REPO DIRECTLY INTO CATALOG (examples/entities.yaml)
        router.post('/github/register-component', async (req, res) => {
          try {
            const fs = await import('fs');
            const path = await import('path');
            const { fullName, name, description, language } = req.body;

            if (!fullName || !name) {
              res.status(400).json({ error: 'Repository name and full name are required' });
              return;
            }

            const entitiesPath = path.resolve(__dirname, '../../../../examples/entities.yaml');
            let content = '';
            if (fs.existsSync(entitiesPath)) {
              content = fs.readFileSync(entitiesPath, 'utf8');
            }

            const cleanName = name.replace(/[^a-zA-Z0-9_-]/g, '-').toLowerCase();

            if (content.includes(`name: ${cleanName}`) || content.includes(`'${fullName}'`)) {
              res.json({ message: `Component for repository ${fullName} is already registered in the Catalog!`, alreadyRegistered: true });
              return;
            }

            const newEntitySnippet = `
---
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: ${cleanName}
  title: "${name}"
  description: "${(description || `${name} GitHub repository`).replace(/"/g, "'")}"
  annotations:
    github.com/project-slug: '${fullName}'
    jira/project-key: 'SCRUM'
    datadoghq.com/dashboard-url: 'https://p.datadoghq.com/sb/f2fdc87e-bdb2-11f1-880c-ce62a0ab8181-e774dbc4966715ea92fe2176656fcc8e'
    datadoghq.com/graph-token: 'your_graph_token_here'
  links:
    - url: https://github.com/${fullName}
      title: GitHub Repository
      icon: github
spec:
  type: ${language?.toLowerCase() === 'python' ? 'service' : 'website'}
  lifecycle: production
  owner: platform-engineering
`;

            fs.appendFileSync(entitiesPath, newEntitySnippet, 'utf8');
            res.json({
              success: true,
              message: `Repository ${fullName} successfully registered as a Backstage Component!`,
              componentName: cleanName,
            });
          } catch (e: any) {
            console.error('Register component error:', e);
            res.status(500).json({ error: e.message });
          }
        });

        // 5. DATADOG DASHBOARDS DIRECT ENDPOINT
        router.get('/datadog/dashboards', async (_req, res) => {
          try {
            const apiKey = process.env.DATADOG_API_KEY;
            const appKey = process.env.DATADOG_APP_KEY;

            if (!apiKey || !appKey) {
              res.status(500).json({ error: 'Datadog credentials not configured' });
              return;
            }

            const ddHeaders = {
              'DD-API-KEY': apiKey,
              'DD-APPLICATION-KEY': appKey,
              Accept: 'application/json',
            };

            const response = await fetch('https://api.datadoghq.com/api/v1/dashboard', {
              headers: ddHeaders,
            });

            if (!response.ok) {
              res.status(response.status).json({ error: 'Failed to fetch Datadog dashboards' });
              return;
            }

            const data = await response.json();
            const rawDashboards = data.dashboards || [];

            // Public share token mapping for active dashboards
            const publicTokens: Record<string, string> = {
              '245-sk9-qnx': 'https://p.datadoghq.com/sb/f2fdc87e-bdb2-11f1-880c-ce62a0ab8181-2feb325f332f971e08c696cf64e6f65c',
              'byv-h6b-san': 'https://p.datadoghq.com/sb/f2fdc87e-bdb2-11f1-880c-ce62a0ab8181-b815955c39a96638ee135ce3d3bc9cb6',
              'zjm-i7u-vdq': 'https://p.datadoghq.com/sb/f2fdc87e-bdb2-11f1-880c-ce62a0ab8181-9eea62381fe13892b39d4248d2a398a4',
            };

            const dashboards = rawDashboards.map((d: any) => ({
              id: d.id,
              title: d.title,
              description: d.description || 'Enterprise Datadog Telemetry Canvas',
              author: d.author_handle,
              modified: d.modified_at,
              url: `https://app.datadoghq.com${d.url}`,
              publicUrl: publicTokens[d.id] || `https://app.datadoghq.com${d.url}`,
            }));

            res.json({ dashboards, total: dashboards.length });
          } catch (e: any) {
            console.error('Datadog dashboards error:', e);
            res.status(500).json({ error: e.message });
          }
        });

        // 6. DATADOG MONITORS & ALERTS ENDPOINT
        router.get('/datadog/monitors', async (_req, res) => {
          try {
            const apiKey = process.env.DATADOG_API_KEY;
            const appKey = process.env.DATADOG_APP_KEY;

            if (!apiKey || !appKey) {
              res.status(500).json({ error: 'Datadog credentials not configured' });
              return;
            }

            const response = await fetch('https://api.datadoghq.com/api/v1/monitor', {
              headers: {
                'DD-API-KEY': apiKey,
                'DD-APPLICATION-KEY': appKey,
                Accept: 'application/json',
              },
            });

            if (!response.ok) {
              res.status(response.status).json({ error: 'Failed to fetch monitors' });
              return;
            }

            const rawMonitors = await response.json();
            const monitors = (Array.isArray(rawMonitors) ? rawMonitors : []).map((m: any) => ({
              id: m.id,
              name: m.name,
              type: m.type,
              status: m.overall_state || 'OK',
              query: m.query,
              message: m.message || 'Automated health and threshold monitor',
              tags: m.tags || [],
              modified: m.modified,
            }));

            res.json({ monitors, total: monitors.length });
          } catch (e: any) {
            console.error('Datadog monitors error:', e);
            res.status(500).json({ error: e.message });
          }
        });

        httpRouter.use(router);
      },
    });
  },
});
