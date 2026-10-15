import { convertLegacyPlugin } from '@backstage/core-compat-api';
import { convertLegacyEntityContentExtension } from '@backstage/plugin-catalog-react/alpha';

// Jira
import { jiraPlugin, EntityJiraOverviewCard, isJiraAvailable } from '@roadiehq/backstage-plugin-jira';
// Pull Requests
import { githubPullRequestsPlugin, EntityGithubPullRequestsContent, isGithubPullRequestsAvailable } from '@roadiehq/backstage-plugin-github-pull-requests';
// Terraform
import { terraformPlugin, EntityTerraformContent, isTerraformAvailable } from '@globallogicuki/backstage-plugin-terraform';
// Dependencies
import { EntityCatalogGraphCard } from '@backstage/plugin-catalog-graph';
import { createFrontendModule } from '@backstage/frontend-plugin-api';

export const dependenciesTabModule = createFrontendModule({
  pluginId: 'catalog',
  extensions: [
    convertLegacyEntityContentExtension(EntityCatalogGraphCard, {
      name: 'dependencies',
      title: 'Dependencies',
      path: '/dependencies',
    }),
  ],
});

import { EntityJiraTabContent } from './jira/EntityJiraTabContent';
import { EntityContentBlueprint } from '@backstage/plugin-catalog-react/alpha';

const jiraEntityContentExtension = EntityContentBlueprint.make({
  name: 'jira',
  params: {
    path: '/jira',
    title: 'Jira',
    filter: (entity) => Boolean(
      entity.metadata.annotations?.['jira/project-key'] ||
      entity.metadata.annotations?.['github.com/project-slug']
    ),
    loader: async () => <EntityJiraTabContent />,
  },
});

export const jiraCustomModule = createFrontendModule({
  pluginId: 'catalog',
  extensions: [jiraEntityContentExtension],
});

export const jiraConvertedPlugin = jiraCustomModule;

export const prsConvertedPlugin = convertLegacyPlugin(githubPullRequestsPlugin, {
  extensions: [
    convertLegacyEntityContentExtension(EntityGithubPullRequestsContent, {
      name: 'pull-requests',
      title: 'Pull Requests',
      path: '/pull-requests',
      filter: isGithubPullRequestsAvailable,
    }),
  ]
});

export const terraformConvertedPlugin = convertLegacyPlugin(terraformPlugin, {
  extensions: [
    convertLegacyEntityContentExtension(EntityTerraformContent, {
      name: 'terraform',
      title: 'Terraform',
      path: '/terraform',
      filter: isTerraformAvailable,
    }),
  ]
});
