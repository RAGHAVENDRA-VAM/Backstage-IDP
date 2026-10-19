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

import { EntityGithubActionsTabContent } from './github/EntityGithubActionsTabContent';
import { EntityGithubPullRequestsTabContent } from './github/EntityGithubPullRequestsTabContent';

const githubActionsEntityContentExtension = EntityContentBlueprint.make({
  name: 'github-actions',
  params: {
    path: '/github-actions',
    title: 'GitHub Actions',
    filter: (entity) => Boolean(
      entity.metadata.annotations?.['github.com/project-slug']
    ),
    loader: async () => <EntityGithubActionsTabContent />,
  },
});

const githubPullRequestsEntityContentExtension = EntityContentBlueprint.make({
  name: 'pull-requests',
  params: {
    path: '/pull-requests',
    title: 'Pull Requests',
    filter: (entity) => Boolean(
      entity.metadata.annotations?.['github.com/project-slug']
    ),
    loader: async () => <EntityGithubPullRequestsTabContent />,
  },
});

export const customCatalogTabsModule = createFrontendModule({
  pluginId: 'catalog',
  extensions: [
    jiraEntityContentExtension,
    githubActionsEntityContentExtension,
    githubPullRequestsEntityContentExtension,
  ],
});

export const jiraConvertedPlugin = customCatalogTabsModule;
export const githubActionsModule = customCatalogTabsModule;
export const githubPullRequestsModule = customCatalogTabsModule;
export const prsConvertedPlugin = customCatalogTabsModule;

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

