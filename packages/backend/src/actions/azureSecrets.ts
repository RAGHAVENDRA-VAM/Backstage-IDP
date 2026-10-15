import { createTemplateAction } from '@backstage/plugin-scaffolder-node';

export const createAzureSecretsAction = () => {
  return createTemplateAction({
    id: 'azure:secrets:read',
    description: 'Reads Azure secrets securely from the backend environment variables',
    schema: {
      output: {
        type: 'object',
        properties: {
          clientId: { type: 'string' },
          clientSecret: { type: 'string' },
          tenantId: { type: 'string' },
          subscriptionId: { type: 'string' },
        },
      },
    },
    async handler(ctx) {
      ctx.logger.info('Securely reading Azure credentials from the server environment...');
      
      ctx.output('clientId', process.env.AZURE_CLIENT_ID || '');
      ctx.output('clientSecret', process.env.AZURE_CLIENT_SECRET || '');
      ctx.output('tenantId', process.env.AZURE_TENANT_ID || '');
      ctx.output('subscriptionId', process.env.AZURE_SUBSCRIPTION_ID || '');
    },
  });
};
