import React from 'react';
import { createFrontendPlugin, PageBlueprint, createRouteRef } from '@backstage/frontend-plugin-api';
import { IntegrationsDashboardPage } from './IntegrationsDashboardPage';

import DashboardIcon from '@material-ui/icons/Dashboard';

export const dashboardRouteRef = createRouteRef({ id: 'dashboard' });

export const dashboardPage = PageBlueprint.make({
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
  pluginId: 'dashboard',
  title: 'Dashboard',
  icon: <DashboardIcon fontSize="inherit" />,
  routes: {
    root: dashboardRouteRef,
  },
  extensions: [dashboardPage],
});

