import React from 'react';
import { createFrontendModule } from '@backstage/frontend-plugin-api';
import { EntityCardBlueprint } from '@backstage/plugin-catalog-react/alpha';

const DatadogLogsCard = React.lazy(() => import('../components/DatadogLogsCard').then(m => ({ default: m.DatadogLogsCard })));

const customDatadogLogsExtension = EntityCardBlueprint.make({
  name: 'datadog-logs',
  params: {
    filter: (entity) => Boolean(entity.metadata.annotations?.['datadoghq.com/dashboard-url']),
    loader: async () => <DatadogLogsCard />,
  }
});

export const customDatadogLogsModule = createFrontendModule({
  pluginId: 'catalog',
  extensions: [customDatadogLogsExtension],
});
