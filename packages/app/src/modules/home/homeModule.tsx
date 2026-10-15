import React from 'react';
import { createFrontendPlugin, PageBlueprint, createRouteRef } from '@backstage/frontend-plugin-api';
import { HomePage } from './HomePage';

import HomeIcon from '@material-ui/icons/Home';

const rootRouteRef = createRouteRef({ id: 'home' });

const homePage = PageBlueprint.make({
  name: 'home',
  params: {
    path: '/home',
    title: 'Home',
    icon: <HomeIcon fontSize="inherit" />,
    routeRef: rootRouteRef,
    noHeader: true,
    loader: async () => <HomePage />,
  },
});

export const homeModule = createFrontendPlugin({
  id: 'home',
  extensions: [homePage],
});
