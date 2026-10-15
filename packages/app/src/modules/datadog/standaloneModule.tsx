import React from 'react';
import { createFrontendPlugin, PageBlueprint, createRouteRef } from '@backstage/frontend-plugin-api';
import { DatadogStandalonePage } from './DatadogStandalonePage';
import TimelineIcon from '@material-ui/icons/Timeline';

const datadogStandaloneRouteRef = createRouteRef({ id: 'datadog-dashboard' });

const datadogStandalonePage = PageBlueprint.make({
  name: 'datadog-dashboard',
  params: {
    path: '/datadog-dashboard',
    title: 'Datadog',
    icon: <TimelineIcon fontSize="inherit" />,
    routeRef: datadogStandaloneRouteRef,
    noHeader: true,
    loader: async () => <DatadogStandalonePage />,
  },
});

export const datadogStandalonePlugin = createFrontendPlugin({
  id: 'datadog-dashboard',
  extensions: [datadogStandalonePage],
});
