import React from 'react';
import { createFrontendPlugin, PageBlueprint, createRouteRef } from '@backstage/frontend-plugin-api';
import { IntegrationsDashboardPage } from './IntegrationsDashboardPage';

import DashboardIcon from '@material-ui/icons/Dashboard';

const dashboardRouteRef = createRouteRef({ id: 'dashboard' });

const dashboardPage = PageBlueprint.make({
  name: 'dashboard',
  params: {
    path: '/dashboard',
    title: 'Dashboard',
    icon: <DashboardIcon fontSize="inherit" />,
    routeRef: dashboardRouteRef,
    noHeader: true,
    loader: async () => <IntegrationsDashboardPage />,
  },
});

export const dashboardModule = createFrontendPlugin({
  id: 'dashboard',
  extensions: [dashboardPage],
});
