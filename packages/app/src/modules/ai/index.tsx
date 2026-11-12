import React from 'react';
import { createFrontendPlugin, PageBlueprint, createRouteRef } from '@backstage/frontend-plugin-api';
import { AcmeAiHubPage } from './ShieldAiHubPage';
import BubbleChartIcon from '@material-ui/icons/BubbleChart';

export const shieldAiRouteRef = createRouteRef({ id: 'shield-ai' });

export const shieldAiPage = PageBlueprint.make({
  name: 'shield-ai',
  params: {
    path: '/shield-ai',
    title: 'Acme AI Hub',
    icon: <BubbleChartIcon fontSize="inherit" />,
    routeRef: shieldAiRouteRef,
    noHeader: true,
    loader: async () => <AcmeAiHubPage />,
  },
});

export const aiModule = createFrontendPlugin({
  pluginId: 'shield-ai',
  title: 'Acme AI Hub',
  icon: <BubbleChartIcon fontSize="inherit" />,
  routes: {
    root: shieldAiRouteRef,
  },
  extensions: [shieldAiPage],
});

export { AcmeAiFloatingWidget } from './ShieldAiFloatingWidget';
export { AcmeAiHubPage } from './ShieldAiHubPage';
export { AcmeAiFloatingWidget as ShieldAiFloatingWidget } from './ShieldAiFloatingWidget';
export { AcmeAiHubPage as ShieldAiHubPage } from './ShieldAiHubPage';

