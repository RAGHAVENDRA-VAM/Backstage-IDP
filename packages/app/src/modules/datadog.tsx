import React from 'react';
import { createFrontendModule } from '@backstage/frontend-plugin-api';
import { EntityContentBlueprint } from '@backstage/plugin-catalog-react/alpha';
import { useEntity } from '@backstage/plugin-catalog-react';
import { DatadogLogsCard } from '../components/DatadogLogsCard';
import {
  Grid,
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  Button,
  IconButton,
  Tooltip,
  makeStyles,
} from '@material-ui/core';
import TimelineIcon from '@material-ui/icons/Timeline';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import RefreshIcon from '@material-ui/icons/Refresh';

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3),
  },
  headerBanner: {
    background: 'linear-gradient(90deg, #005B4B 0%, #006D8F 100%)',
    color: '#ffffff',
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(3.5, 4.5),
    marginBottom: theme.spacing(3),
    boxShadow: theme.shadows[2],
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing(2),
  },
  headerTitle: {
    fontWeight: 700,
    fontSize: '1.85rem',
    letterSpacing: '-0.3px',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.90)',
    maxWidth: 820,
    fontSize: '0.98rem',
    marginTop: theme.spacing(0.5),
  },
  badgeRow: {
    display: 'flex',
    gap: theme.spacing(1),
    marginTop: theme.spacing(1.5),
    flexWrap: 'wrap',
  },
  badgePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    color: '#ffffff',
    fontWeight: 600,
    fontSize: '0.76rem',
    border: '1px solid rgba(255, 255, 255, 0.25)',
  },
  iframeCard: {
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
    overflow: 'hidden',
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[1],
  },
  iframeToolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(1.5, 2.5),
    borderBottom: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.default,
  },
  iframeTitle: {
    fontWeight: 700,
    color: theme.palette.text.primary,
    fontSize: '0.92rem',
  },
  liveSyncChip: {
    backgroundColor: 'rgba(75, 184, 165, 0.15)',
    color: '#187656',
    fontSize: '0.72rem',
    fontWeight: 700,
    border: '1px solid rgba(75, 184, 165, 0.35)',
    height: 22,
  },
  iframeContainer: {
    width: '100%',
    height: '750px',
    border: 'none',
    display: 'block',
  },
}));

export const DatadogDashboardIframe = () => {
  const classes = useStyles();
  const { entity } = useEntity();
  const [refreshKey, setRefreshKey] = React.useState(0);
  const dashboardUrl = entity?.metadata?.annotations?.['datadoghq.com/dashboard-url'];
  const title = entity?.metadata?.title || entity?.metadata?.name || 'Component';

  if (!dashboardUrl) {
    return null;
  }

  const urls = dashboardUrl.split(',').map((u: string) => u.trim());

  return (
    <Grid container spacing={3}>
      {urls.map((url: string, idx: number) => (
        <Grid item xs={12} key={url}>
          <Card className={classes.iframeCard}>
            <Box className={classes.iframeToolbar}>
              <Box display="flex" alignItems="center" gap={1.5}>
                <Typography className={classes.iframeTitle}>
                  {title} — Interactive Datadog Canvas ({idx + 1})
                </Typography>
                <Chip
                  label="Live Sync"
                  size="small"
                  className={classes.liveSyncChip}
                />
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Tooltip title="Reload Dashboard View">
                  <IconButton
                    size="small"
                    onClick={() => setRefreshKey(k => k + 1)}
                    style={{ border: '1px solid rgba(0,0,0,0.12)' }}
                  >
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  startIcon={<OpenInNewIcon fontSize="small" />}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textTransform: 'none', fontWeight: 700 }}
                >
                  Open in Datadog
                </Button>
              </Box>
            </Box>
            <CardContent style={{ padding: 0 }}>
              <Box style={{ background: '#f8fafc', padding: '12px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" style={{ color: '#475569', fontSize: '0.85rem' }}>
                  🔒 <strong>Datadog Security Policy:</strong> If your browser blocks this embedded canvas (X-Frame-Options), click the <strong>Open in Datadog</strong> button to view the dashboard directly in full screen.
                </Typography>
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  startIcon={<OpenInNewIcon fontSize="small" />}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textTransform: 'none', fontWeight: 600, flexShrink: 0, marginLeft: 16 }}
                >
                  Open Direct View
                </Button>
              </Box>
              <iframe
                key={refreshKey}
                title={`${title} Datadog Dashboard ${idx + 1}`}
                src={url}
                className={classes.iframeContainer}
                allow="fullscreen"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

const DatadogTabContent = () => {
  const classes = useStyles();
  const { entity } = useEntity();
  const title = entity?.metadata?.title || entity?.metadata?.name || 'Component';

  return (
    <Box className={classes.root}>
      {/* Enterprise Header Banner */}
      <Box className={classes.headerBanner}>
        <Box>
          <Typography className={classes.headerTitle}>
            <TimelineIcon style={{ fontSize: 32 }} />
            {title} — Datadog Telemetry & Observability
          </Typography>
          <Typography className={classes.headerSubtitle}>
            Live APM metrics, latency tracking, error monitoring, and operational logs for {title}.
          </Typography>
          <Box className={classes.badgeRow}>
            <Chip label="US1 Datadog Cloud" size="small" className={classes.badgePill} />
            <Chip label="Live Telemetry Stream" size="small" className={classes.badgePill} />
            <Chip label="Enterprise Observability" size="small" className={classes.badgePill} />
          </Box>
        </Box>
      </Box>

      {/* Operational Logs Card */}
      <DatadogLogsCard />

      {/* Interactive Datadog Canvas */}
      <Box style={{ marginTop: 24 }}>
        <DatadogDashboardIframe />
      </Box>
    </Box>
  );
};

const datadogContentExtension = EntityContentBlueprint.make({
  name: 'datadog',
  params: {
    path: '/datadog',
    title: 'Datadog',
    filter: (entity) => Boolean(
      entity.metadata.annotations?.['datadoghq.com/dashboard-url'] ||
      entity.metadata.annotations?.['datadoghq.com/site']
    ),
    loader: async () => <DatadogTabContent />,
  },
});

export const datadogConvertedPlugin = createFrontendModule({
  pluginId: 'catalog',
  extensions: [datadogContentExtension],
});
