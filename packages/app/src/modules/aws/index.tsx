import React from 'react';
import { createFrontendModule } from '@backstage/frontend-plugin-api';
import { EntityContentBlueprint } from '@backstage/plugin-catalog-react/alpha';
import { EntityAwsTabContent } from './EntityAwsTabContent';

const awsEntityContentExtension = EntityContentBlueprint.make({
  name: 'aws',
  params: {
    path: '/aws',
    title: 'AWS',
    filter: (entity) => Boolean(
      entity.metadata.annotations?.['aws.amazon.com/arn'] ||
      entity.metadata.annotations?.['amazon.com/arn'] ||
      entity.metadata.annotations?.['github.com/project-slug'] ||
      entity.spec?.type === 'service' ||
      entity.spec?.type === 'website' ||
      entity.kind === 'Component'
    ),
    loader: async () => <EntityAwsTabContent />,
  },
});

export const awsCatalogModule = createFrontendModule({
  pluginId: 'catalog',
  extensions: [awsEntityContentExtension],
});
