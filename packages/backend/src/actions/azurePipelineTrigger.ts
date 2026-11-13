import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { Config } from '@backstage/config';

export const createAzurePipelineTriggerAction = (options?: { config?: Config }) => {
  return createTemplateAction<{
    organization: string;
    project: string;
    repository: string;
    pipelineName?: string;
    pipelineId?: number;
    branch?: string;
    waitForCompletion?: boolean;
    timeoutMinutes?: number;
  }, {
    runId?: number;
    runUrl?: string;
    status?: string;
    result?: string;
  }>({
    id: 'azure:pipeline:trigger',
    description: 'Triggers an existing Azure DevOps build/release pipeline for a repository and tracks its execution status',
    schema: {
      input: {
        type: 'object',
        required: ['organization', 'project', 'repository'],
        properties: {
          organization: {
            title: 'Azure DevOps Organization',
            type: 'string',
            description: 'Organization name (e.g. ValueMomentum)',
          },
          project: {
            title: 'Azure DevOps Project',
            type: 'string',
            description: 'Project name',
          },
          repository: {
            title: 'Azure DevOps Git Repository',
            type: 'string',
            description: 'Git repository name',
          },
          pipelineName: {
            title: 'Pipeline Name',
            type: 'string',
            description: 'Name of the pipeline to trigger (optional if pipelineId is provided)',
          },
          pipelineId: {
            title: 'Pipeline ID',
            type: 'number',
            description: 'Direct pipeline ID (numeric)',
          },
          branch: {
            title: 'Target Branch',
            type: 'string',
            description: 'Branch to run the pipeline against (defaults to main)',
            default: 'main',
          },
          waitForCompletion: {
            title: 'Wait for Pipeline Completion',
            type: 'boolean',
            description: 'Whether Backstage should poll until the pipeline succeeds or fails',
            default: true,
          },
          timeoutMinutes: {
            title: 'Timeout (Minutes)',
            type: 'number',
            description: 'Maximum minutes to wait for pipeline completion',
            default: 10,
          },
        },
      },
      output: {
        type: 'object',
        properties: {
          runId: { title: 'Pipeline Run ID', type: 'number' },
          runUrl: { title: 'Pipeline Run URL', type: 'string' },
          status: { title: 'Execution Status', type: 'string' },
          result: { title: 'Execution Result', type: 'string' },
        },
      },
    },
    async handler(ctx) {
      const {
        organization,
        project,
        repository,
        pipelineName,
        branch = 'main',
        waitForCompletion = true,
        timeoutMinutes = 10,
      } = ctx.input;
      let targetPipelineId = ctx.input.pipelineId;

      ctx.logger.info(`🚀 Preparing to trigger Azure DevOps pipeline for [${organization}/${project}/${repository}] (branch: ${branch})...`);

      let adoToken = process.env.AZURE_DEVOPS_TOKEN || process.env.AZURE_TOKEN;
      if (!adoToken && options?.config) {
        const azureIntegrations = options.config.getOptionalConfigArray('integrations.azure') || [];
        const devAzureIntegration = azureIntegrations.find(c => c.getString('host') === 'dev.azure.com');
        adoToken = devAzureIntegration?.getOptionalString('token');
        if (!adoToken) {
          const credentials = devAzureIntegration?.getOptionalConfigArray('credentials') || [];
          adoToken = credentials[0]?.getOptionalString('personalAccessToken');
        }
      }

      if (!adoToken) {
        throw new Error('Azure DevOps Personal Access Token (AZURE_DEVOPS_TOKEN / AZURE_TOKEN) is not configured.');
      }

      const authHeader = `Basic ${Buffer.from(`:${adoToken}`).toString('base64')}`;
      const baseApiUrl = `https://dev.azure.com/${encodeURIComponent(organization)}/${encodeURIComponent(project)}/_apis`;

      // 1. Resolve pipeline ID if not directly provided
      if (!targetPipelineId) {
        ctx.logger.info(`Resolving pipeline ID for repository [${repository}]...`);
        const defsRes = await fetch(`${baseApiUrl}/build/definitions?api-version=7.1`, {
          headers: { Authorization: authHeader },
        });

        if (!defsRes.ok) {
          throw new Error(`Failed to list build definitions from Azure DevOps: ${defsRes.status} ${defsRes.statusText}`);
        }

        const defsData = await defsRes.json();
        const definitions = defsData.value || [];

        // Match by pipelineName or repo
        let matched = null;
        if (pipelineName) {
          matched = definitions.find((d: any) => d.name.toLowerCase() === pipelineName.toLowerCase());
        }
        if (!matched) {
          matched = definitions.find((d: any) => (d.repository?.name || '').toLowerCase() === repository.toLowerCase());
        }
        if (!matched && definitions.length > 0) {
          // If only one pipeline exists in project, use it
          matched = definitions[0];
        }

        if (!matched) {
          throw new Error(`Could not find an Azure DevOps pipeline for repository [${repository}]. Please verify the pipeline exists in project [${project}].`);
        }

        targetPipelineId = matched.id;
        ctx.logger.info(`Resolved pipeline [${matched.name}] (ID: ${targetPipelineId})`);
      }

      // 2. Trigger Pipeline Run
      ctx.logger.info(`Triggering Pipeline ID [${targetPipelineId}] on branch [${branch}]...`);
      const refName = branch.startsWith('refs/') ? branch : `refs/heads/${branch}`;
      const runPayload = {
        resources: {
          repositories: {
            self: {
              refName,
            },
          },
        },
      };

      const runRes = await fetch(`${baseApiUrl}/pipelines/${targetPipelineId}/runs?api-version=7.1`, {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(runPayload),
      });

      if (!runRes.ok) {
        const errDetail = await runRes.text().catch(() => '');
        throw new Error(`Failed to trigger Azure DevOps pipeline run: ${runRes.status} ${runRes.statusText}. Details: ${errDetail.substring(0, 300)}`);
      }

      const runData = await runRes.json();
      const runId = runData.id;
      const runUrl = runData._links?.web?.href || `https://dev.azure.com/${organization}/${project}/_build/results?buildId=${runId}`;

      ctx.logger.info(`✅ Successfully triggered Pipeline Run #${runId}!`);
      ctx.logger.info(`Pipeline Run Live URL: ${runUrl}`);

      ctx.output('runId', runId);
      ctx.output('runUrl', runUrl);
      ctx.output('status', runData.state || 'inProgress');

      // 3. Optional polling for completion to surface real-time Success / Failure inside Backstage IDP
      if (waitForCompletion) {
        ctx.logger.info(`Streaming pipeline execution status to IDP (polling every 10 seconds)...`);
        const startTime = Date.now();
        const maxMs = timeoutMinutes * 60 * 1000;

        while (Date.now() - startTime < maxMs) {
          await new Promise(r => setTimeout(r, 10000));

          const statusRes = await fetch(`${baseApiUrl}/pipelines/${targetPipelineId}/runs/${runId}?api-version=7.1`, {
            headers: { Authorization: authHeader },
          });

          if (statusRes.ok) {
            const current = await statusRes.json();
            const state = current.state; // inProgress, completed, etc.
            const result = current.result; // succeeded, failed, canceled

            ctx.logger.info(`Pipeline Run #${runId} Status: [${state}] ${result ? `Result: [${result}]` : ''}`);

            if (state === 'completed') {
              ctx.output('status', state);
              ctx.output('result', result || 'unknown');

              if (result === 'succeeded') {
                ctx.logger.info(`🎉 Azure DevOps Pipeline #${runId} completed SUCCEEDED!`);
                return;
              } else {
                throw new Error(`❌ Azure DevOps Pipeline #${runId} finished with result: ${result?.toUpperCase() || 'FAILED'}. Inspect build logs at: ${runUrl}`);
              }
            }
          }
        }
        ctx.logger.warn(`Pipeline run #${runId} is still in progress after timeout limit. Tracking continues in Azure DevOps.`);
      }
    },
  });
};
