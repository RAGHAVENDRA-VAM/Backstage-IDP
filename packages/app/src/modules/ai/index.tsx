import React from 'react';
import { createFrontendPlugin, PageBlueprint, createRouteRef } from '@backstage/frontend-plugin-api';
import { ShieldAiHubPage } from './ShieldAiHubPage';
import BubbleChartIcon from '@material-ui/icons/BubbleChart';

export const shieldAiRouteRef = createRouteRef({ id: 'shield-ai' });

export const shieldAiPage = PageBlueprint.make({
  name: 'shield-ai',
  params: {
    path: '/shield-ai',
    title: 'Shield AI Hub',
    icon: <BubbleChartIcon fontSize="inherit" />,
    routeRef: shieldAiRouteRef,
    noHeader: true,
    loader: async () => <ShieldAiHubPage />,
  },
});

export const aiModule = createFrontendPlugin({
  id: 'shield-ai',
  extensions: [shieldAiPage],
});

export { ShieldAiFloatingWidget } from './ShieldAiFloatingWidget';
export { ShieldAiHubPage } from './ShieldAiHubPage';
