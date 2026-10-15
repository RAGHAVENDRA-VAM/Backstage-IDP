import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { Octokit } from '@octokit/rest';
import _sodium from 'libsodium-wrappers';

export const createAzureSecretsPushAction = () => {
  return createTemplateAction({
    id: 'azure:secrets:push',
    description: 'Pushes Azure secrets directly to the GitHub repository API',
    schema: {
      input: {
        type: 'object',
        required: ['repoUrl', 'clientId', 'clientSecret', 'tenantId', 'subscriptionId'],
        properties: {
          repoUrl: { type: 'string' },
          clientId: { type: 'string' },
          clientSecret: { type: 'string' },
          tenantId: { type: 'string' },
          subscriptionId: { type: 'string' },
        },
      },
    },
    async handler(ctx) {
      const { repoUrl, clientId, clientSecret, tenantId, subscriptionId } = ctx.input;
      ctx.logger.info(`Pushing secrets to ${repoUrl}...`);

      const token = process.env.GITHUB_TOKEN;
      if (!token) throw new Error('GITHUB_TOKEN is missing!');

      const octokit = new Octokit({ auth: token });
      
      const ownerMatch = repoUrl.match(/owner=([^&]+)/);
      const repoMatch = repoUrl.match(/repo=([^&]+)/);
      if (!ownerMatch || !repoMatch) {
          throw new Error(`Failed to parse owner/repo from ${repoUrl}`);
      }
      const owner = ownerMatch[1];
      const repo = repoMatch[1];

      await _sodium.ready;
      const sodium = _sodium;

      ctx.logger.info('Fetching repository public key...');
      const keyRes = await octokit.rest.actions.getRepoPublicKey({ owner, repo });
      const publicKey = keyRes.data.key;
      const keyId = keyRes.data.key_id;

      const secrets = {
          AZURE_CLIENT_ID: clientId,
          AZURE_CLIENT_SECRET: clientSecret,
          AZURE_TENANT_ID: tenantId,
          AZURE_SUBSCRIPTION_ID: subscriptionId
      };

      for (const [secretName, secretValue] of Object.entries(secrets)) {
          ctx.logger.info(`Encrypting and pushing secret: ${secretName}...`);
          const binkey = sodium.from_base64(publicKey, sodium.base64_variants.ORIGINAL);
          const binsec = sodium.from_string(secretValue);
          const encBytes = sodium.crypto_box_seal(binsec, binkey);
          const encryptedValue = sodium.to_base64(encBytes, sodium.base64_variants.ORIGINAL);

          await octokit.rest.actions.createOrUpdateRepoSecret({
              owner,
              repo,
              secret_name: secretName,
              encrypted_value: encryptedValue,
              key_id: keyId
          });
      }

      ctx.logger.info('✅ All 4 Azure secrets pushed successfully to GitHub!');
    },
  });
};
