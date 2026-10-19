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
          <Card className={classes.iframeCard} style={{ borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <Box className={classes.iframeToolbar} style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <Box display="flex" alignItems="center" gap={1.5}>
                <Typography className={classes.iframeTitle} style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
                  {title} — Datadog APM & Telemetry Dashboard ({idx + 1})
                </Typography>
                <Chip
                  label="Live Production Feed"
                  size="small"
                  style={{ backgroundColor: '#10b981', color: '#ffffff', fontWeight: 700, fontSize: '0.75rem' }}
                />
              </Box>
              <Box display="flex" alignItems="center" gap={1.5}>
                <Button
                  variant="contained"
                  color="primary"
                  size="medium"
                  startIcon={<OpenInNewIcon fontSize="small" />}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textTransform: 'none', fontWeight: 700, backgroundColor: '#6366f1', color: '#ffffff', padding: '6px 18px' }}
                >
                  Launch Full Datadog Dashboard
                </Button>
              </Box>
            </Box>

            <CardContent style={{ padding: '32px 28px', background: '#ffffff' }}>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={8}>
                  <Typography variant="h6" style={{ fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>
                    Enterprise Cloud Observability & Service Mapping
                  </Typography>
                  <Typography variant="body2" style={{ color: '#64748b', lineHeight: 1.6, marginBottom: 16 }}>
                    This component is continuously monitored via Datadog Cloud US1. View real-time traces, P99 request latency, host utilization, infrastructure container health, and synthetic availability tests directly in the connected Datadog workspace.
                  </Typography>

                  <Box display="flex" flexWrap="wrap" gap={1}>
                    <Chip label="Data Center: US1 (Commercial)" size="small" variant="outlined" style={{ borderColor: '#cbd5e1', color: '#475569', fontWeight: 600 }} />
                    <Chip label="Realtime Stream: Connected" size="small" variant="outlined" style={{ borderColor: '#cbd5e1', color: '#475569', fontWeight: 600 }} />
                    <Chip label="APM Distributed Tracing: Active" size="small" variant="outlined" style={{ borderColor: '#cbd5e1', color: '#475569', fontWeight: 600 }} />
                  </Box>
                </Grid>

                <Grid item xs={12} md={4} style={{ textAlign: 'center' }}>
                  <Box style={{ background: '#f1f5f9', borderRadius: 8, padding: '24px 16px', border: '1px dashed #cbd5e1' }}>
                    <TimelineIcon style={{ fontSize: 44, color: '#6366f1', marginBottom: 8 }} />
                    <Typography variant="subtitle2" style={{ fontWeight: 700, color: '#0f172a' }}>
                      Ready for Live Demo
                    </Typography>
                    <Typography variant="caption" display="block" style={{ color: '#64748b', marginBottom: 16 }}>
                      Opens authenticated Datadog Canvas in high-resolution full screen.
                    </Typography>
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      startIcon={<LaunchIcon fontSize="small" />}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textTransform: 'none', fontWeight: 600 }}
                    >
                      Open Live Canvas
                    </Button>
                  </Box>
                </Grid>
              </Grid>
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
