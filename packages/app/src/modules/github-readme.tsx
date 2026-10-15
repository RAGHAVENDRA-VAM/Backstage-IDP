import React from 'react';
import { createFrontendModule } from '@backstage/frontend-plugin-api';
import { EntityCardBlueprint } from '@backstage/plugin-catalog-react/alpha';

const ReadmeCard = React.lazy(() => 
  import('@roadiehq/backstage-plugin-github-insights').then(m => ({ default: m.EntityGithubInsightsReadmeCard }))
);

const readmeCardExtension = EntityCardBlueprint.make({
  name: 'github-readme',
  params: {
    filter: (entity) => Boolean(entity.metadata.annotations?.['github.com/project-slug']),
    loader: async () => <ReadmeCard maxHeight={350} />,
  }
});

export const githubReadmeModule = createFrontendModule({
  pluginId: 'catalog',
  extensions: [readmeCardExtension],
});
