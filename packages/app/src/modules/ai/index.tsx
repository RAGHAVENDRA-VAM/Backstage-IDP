import React from 'react';
import { createFrontendPlugin, PageBlueprint, createRouteRef } from '@backstage/frontend-plugin-api';
import { ShieldAiHubPage as AcmeAiHubPage } from './ShieldAiHubPage';
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

export { ShieldAiFloatingWidget as AcmeAiFloatingWidget, ShieldAiFloatingWidget } from './ShieldAiFloatingWidget';
export { ShieldAiHubPage as AcmeAiHubPage, ShieldAiHubPage } from './ShieldAiHubPage';
