import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Container,
  Typography,
  Chip,
  Button,
  Grid,
  makeStyles,
  IconButton,
  Tooltip,
} from '@material-ui/core';
import TimelineIcon from '@material-ui/icons/Timeline';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import RefreshIcon from '@material-ui/icons/Refresh';
import FullscreenIcon from '@material-ui/icons/Fullscreen';
import { DatadogLogsCard } from '../../components/DatadogLogsCard';

const useStyles = makeStyles(theme => ({
  root: {
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(6),
  },
  headerBanner: {
    background: 'linear-gradient(135deg, #005B4B 0%, #006D8F 65%, #0B4F6C 100%)',
    color: '#ffffff',
    borderRadius: theme.shape.borderRadius * 2,
    padding: theme.spacing(3.5, 4.5),
    marginBottom: theme.spacing(3),
    boxShadow: '0 8px 24px rgba(0, 91, 75, 0.25)',
    border: `1px solid ${theme.palette.divider}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing(2),
  },
  headerTitle: {
    fontWeight: 800,
    fontSize: '2.1rem',
    letterSpacing: '-0.5px',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    maxWidth: 750,
    fontSize: '1rem',
    marginTop: theme.spacing(0.5),
  },
  headerBadges: {
    display: 'flex',
    gap: theme.spacing(1),
    marginTop: theme.spacing(1.5),
    flexWrap: 'wrap',
  },
  badgePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    color: '#ffffff',
    fontWeight: 700,
    fontSize: '0.78rem',
    border: '1px solid rgba(255, 255, 255, 0.3)',
  },
  iframeCard: {
    borderRadius: theme.shape.borderRadius * 1.5,
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
    overflow: 'hidden',
    backgroundColor: theme.palette.background.paper,
    marginBottom: theme.spacing(3),
  },
  iframeToolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(1.5, 2.5),
    borderBottom: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.default,
  },
  iframeContainer: {
    width: '100%',
    height: '750px',
    border: 'none',
  },
}));

export const DatadogStandalonePage = () => {
  const classes = useStyles();
  const [iframeKey, setIframeKey] = useState(0);

  const dashboardUrl =
    'https://p.datadoghq.com/sb/f2fdc87e-bdb2-11f1-880c-ce62a0ab8181-48dea1b41397130e734b520377261606';

  const handleRefresh = () => {
    setIframeKey(prev => prev + 1);
  };

  return (
    <Container maxWidth="xl" className={classes.root}>
      {/* Header Banner */}
      <Box className={classes.headerBanner}>
        <Box>
          <Typography className={classes.headerTitle}>
            <TimelineIcon style={{ fontSize: 36, color: '#4BB8A5' }} />
            Datadog Unified Observability
          </Typography>
          <Typography className={classes.headerSubtitle}>
            Live organization-wide monitoring dashboard, APM latency metrics, error tracking, and real-time
            infrastructure telemetry across Shield Insurance services.
          </Typography>

          <Box className={classes.headerBadges}>
            <Chip label="Live Telemetry Stream" size="small" className={classes.badgePill} />
            <Chip label="US1 Datadog Cloud" size="small" className={classes.badgePill} />
            <Chip label="Realtime Claims Monitoring" size="small" className={classes.badgePill} />
          </Box>
        </Box>

        <Box display="flex" gap={1.5} alignItems="center">
          <Button
            variant="contained"
            startIcon={<OpenInNewIcon />}
            href={dashboardUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              backgroundColor: '#ffffff',
              color: '#005B4B',
              fontWeight: 700,
              textTransform: 'none',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            }}
          >
            Open in Datadog
          </Button>
        </Box>
      </Box>

      {/* Main Interactive Live Dashboard Frame */}
      <Card className={classes.iframeCard}>
        <Box className={classes.iframeToolbar}>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="subtitle2" style={{ fontWeight: 700 }}>
              Live Embedded Telemetry Canvas
            </Typography>
            <Chip
              label="Live Sync"
              size="small"
              style={{
                backgroundColor: '#ecfdf5',
                color: '#059669',
                fontWeight: 700,
                fontSize: '0.72rem',
                height: 20,
              }}
            />
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            <Tooltip title="Reload Dashboard View">
              <IconButton size="small" onClick={handleRefresh}>
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Open Fullscreen in New Window">
              <IconButton
                size="small"
                href={dashboardUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FullscreenIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <iframe
          key={iframeKey}
          title="Organization Datadog Dashboard"
          src={dashboardUrl}
          className={classes.iframeContainer}
        />
      </Card>

      {/* Real-time Logs Stream */}
      <Box style={{ marginTop: 24 }}>
        <DatadogLogsCard />
      </Box>
    </Container>
  );
};
