import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { Config } from '@backstage/config';

export function createAzureWorkItemAction(options: { config: Config }) {
  return createTemplateAction({
    id: 'azure:workitem:create',
    schema: {
      input: (zImpl) => zImpl.object({
        organization: zImpl.string().describe('The Azure DevOps organization name'),
        project: zImpl.string().describe('The Azure DevOps project name'),
        type: zImpl.string().describe('The type of work item'),
        title: zImpl.string().describe('The title of the work item'),
        description: zImpl.string().optional().describe('The description of the work item'),
        parentId: zImpl.number().optional().describe('The ID of the parent work item'),
      }),
      output: (zImpl) => zImpl.object({
        workItemId: zImpl.string(),
        workItemUrl: zImpl.string().optional(),
      }),
    },
    async handler(ctx) {
      const { organization, project, type, title, description, parentId } = ctx.input;
      
      const config = options.config;
      const azureIntegrations = config.getOptionalConfigArray('integrations.azure') || [];
      const devAzureIntegration = azureIntegrations.find(c => c.getString('host') === 'dev.azure.com');
      
      let token = devAzureIntegration?.getOptionalString('token'); // Fallback for old configs
      if (!token) {
        const credentials = devAzureIntegration?.getOptionalConfigArray('credentials') || [];
        token = credentials[0]?.getOptionalString('personalAccessToken');
      }

      if (!token) {
        throw new Error('No Azure DevOps token configured in app-config.yaml for dev.azure.com');
      }

      ctx.logger.info(`Creating ${type} in Azure DevOps project ${project}...`);

      const patchData: any[] = [
        {
          op: 'add',
          path: '/fields/System.Title',
          value: title
        }
      ];

      if (description) {
        patchData.push({
          op: 'add',
          path: '/fields/System.Description',
          value: description
        });
      }

      if (parentId) {
        patchData.push({
          op: 'add',
          path: '/relations/-',
          value: {
            rel: 'System.LinkTypes.Hierarchy-Reverse',
            url: `https://dev.azure.com/${organization}/${project}/_apis/wit/workItems/${parentId}`,
            attributes: {
              comment: 'Linked from Backstage template'
            }
          }
        });
      }

      const url = `https://dev.azure.com/${encodeURIComponent(organization)}/${encodeURIComponent(project)}/_apis/wit/workitems/$${encodeURIComponent(type)}?api-version=7.1`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json-patch+json',
          'Authorization': `Basic ${Buffer.from(`:${token}`).toString('base64')}`
        },
        body: JSON.stringify(patchData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create Azure DevOps work item. Status: ${response.status} ${response.statusText}. ${errorText}`);
      }

      const responseData = await response.json() as { id: number, _links?: { html?: { href: string } } };
      
      ctx.logger.info(`Successfully created work item ID ${responseData.id}`);

      ctx.output('workItemId', responseData.id.toString());
      if (responseData._links?.html?.href) {
        ctx.output('workItemUrl', responseData._links.html.href);
      }
    }
  });
}
