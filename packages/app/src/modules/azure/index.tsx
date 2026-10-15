import React from 'react';
import { createFrontendModule } from '@backstage/frontend-plugin-api';
import { EntityContentBlueprint } from '@backstage/plugin-catalog-react/alpha';
import { AzureTabContent } from './AzureTabContent';

const azureEntityContentExtension = EntityContentBlueprint.make({
  name: 'azure',
  params: {
    path: '/azure',
    title: 'Azure',
    filter: (entity) => Boolean(
      entity.metadata.annotations?.['azure.com/subscription-id'] ||
      entity.metadata.annotations?.['github.com/project-slug'] ||
      entity.spec?.type === 'website' ||
      entity.kind === 'Component'
    ),
    loader: async () => <AzureTabContent />,
  },
});

export const azureCatalogModule = createFrontendModule({
  pluginId: 'catalog',
  extensions: [azureEntityContentExtension],
});
