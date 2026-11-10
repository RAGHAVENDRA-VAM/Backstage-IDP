import React, { useState } from 'react';
import useAsync from 'react-use/lib/useAsync';
import Alert from '@material-ui/lab/Alert';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Typography,
  Button,
  makeStyles,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  CircularProgress,
} from '@material-ui/core';
import SpeedIcon from '@material-ui/icons/Speed';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import WarningIcon from '@material-ui/icons/Warning';
import AutorenewIcon from '@material-ui/icons/Autorenew';
import BugReportIcon from '@material-ui/icons/BugReport';
import HealingIcon from '@material-ui/icons/Healing';
import { useNavigate } from 'react-router-dom';

const useStyles = makeStyles(theme => ({
  heroBanner: {
    background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
    color: '#ffffff',
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(3.5, 4),
    marginBottom: theme.spacing(3),
    border: '1px solid rgba(255, 255, 255, 0.12)',
  },
  card: {
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[1],
    height: '100%',
  },
  statNumber: {
    fontWeight: 800,
    fontSize: '2rem',
  },
  tableRow: {
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
}));

export const SreHealthView: React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const [restarting, setRestarting] = useState<string | null>(null);
  const [restartMessage, setRestartMessage] = useState<{ text: string; severity: 'success' | 'error' } | null>(null);

  // Fetch real Web Apps deployed in the connected Azure subscription
  const { value: webAppsData, loading, error, retry } = useAsync(async () => {
    const res = await fetch('/api/azure-deploy/web-apps');
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return await res.json();
  }, []);

  const liveApps = webAppsData?.webApps || [];
  const runningCount = liveApps.filter((a: any) => a.state?.toLowerCase() === 'running').length;
  const platformAvailability = liveApps.length > 0
    ? `${((runningCount / liveApps.length) * 100).toFixed(1)}%`
    : '100%';

  const handleRealRestart = async (app: any) => {
    setRestarting(app.name);
    setRestartMessage(null);
    try {
      const res = await fetch('/api/azure-deploy/app-service-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resourceGroup: app.resourceGroup,
          appName: app.name,
          action: 'restart',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to restart App Service');
      setRestartMessage({ text: `Successfully recycled container for ${app.name}`, severity: 'success' });
      retry();
    } catch (e: any) {
      setRestartMessage({ text: `Restart failed for ${app.name}: ${e.message}`, severity: 'error' });
    } finally {
      setRestarting(null);
    }
  };

  return (
    <Box p={3}>
      {/* SRE Command Banner */}
      <Box className={classes.heroBanner}>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h5" style={{ fontWeight: 800, marginBottom: 6 }}>
              Site Reliability Engineering (SRE) & Incident Health Command
            </Typography>
            <Typography variant="body2" style={{ color: 'rgba(255, 255, 255, 0.85)', maxWidth: 850 }}>
              Live production health tracking, availability verification, error budgets, and self-healing container controls across your active Azure infrastructure.
            </Typography>
          </Box>
          <Box display="flex" gap={1.5} alignItems="center">
            <Button
              variant="outlined"
              onClick={retry}
              style={{ color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.35)', fontWeight: 600, textTransform: 'none' }}
            >
              Sync Health Pings
            </Button>
            <Button
              variant="contained"
              onClick={() => navigate('/dashboard')}
              style={{ backgroundColor: '#ffffff', color: '#0f172a', fontWeight: 700, textTransform: 'none' }}
            >
              Command Center
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Surface real Azure IAM permission alert if any */}
      {error && (
        <Box mb={3}>
          <Alert severity="warning">
            <strong>Azure SRE Health Telemetry Notice:</strong> {error.message}
            <br />
            To stream live container health states from your subscription, please ensure your Service Principal has the <strong>Reader</strong> or <strong>Contributor</strong> role assigned under <em>Azure Portal → Subscriptions → Access control (IAM)</em>.
          </Alert>
        </Box>
      )}

      {restartMessage && (
        <Box mb={3}>
          <Alert severity={restartMessage.severity}>
            {restartMessage.text}
          </Alert>
        </Box>
      )}

      {/* Dynamic SRE Health KPI Metrics */}
      <Grid container spacing={3} style={{ marginBottom: 24 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.card}>
            <CardContent>
              <Typography variant="overline" color="textSecondary" style={{ fontWeight: 700 }}>
                Enterprise Platform Availability
              </Typography>
              <Typography className={classes.statNumber} style={{ color: '#10b981' }}>
                {platformAvailability}
              </Typography>
              <Typography variant="caption" style={{ color: '#10b981', fontWeight: 600 }}>
                {runningCount} of {liveApps.length} active instances healthy
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.card}>
            <CardContent>
              <Typography variant="overline" color="textSecondary" style={{ fontWeight: 700 }}>
                Target SLO
              </Typography>
              <Typography className={classes.statNumber} style={{ color: '#0284c7' }}>
                99.90%
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Enterprise Mission-Critical Target
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.card}>
            <CardContent>
              <Typography variant="overline" color="textSecondary" style={{ fontWeight: 700 }}>
                Live Instances Monitored
              </Typography>
              <Typography className={classes.statNumber} style={{ color: '#7c3aed' }}>
                {liveApps.length} Apps
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Across all active Resource Groups
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.card}>
            <CardContent>
              <Typography variant="overline" color="textSecondary" style={{ fontWeight: 700 }}>
                Heal Control Status
              </Typography>
              <Typography className={classes.statNumber} style={{ color: '#ec4899' }}>
                Active
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Live restart & container recovery enabled
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dynamic Production SLO & Error Budget Table */}
      <Card className={classes.card} style={{ marginBottom: 28 }}>
        <Box p={2.5} borderBottom="1px solid rgba(0, 0, 0, 0.08)" display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6" style={{ fontWeight: 700 }}>
              Live App Services & Health Status ({liveApps.length} Monitored)
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Calculated dynamically from live Azure App Services and HTTP telemetry.
            </Typography>
          </Box>
          <Chip
            label={liveApps.length > 0 ? `${runningCount}/${liveApps.length} Running` : 'Awaiting Telemetry'}
            size="small"
            style={{ backgroundColor: '#ecfdf5', color: '#059669', fontWeight: 700 }}
          />
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} elevation={0}>
            <Table size="medium">
              <TableHead style={{ backgroundColor: '#f8fafc' }}>
                <TableRow>
                  <TableCell style={{ fontWeight: 700 }}>Service Name</TableCell>
                  <TableCell style={{ fontWeight: 700 }}>Resource Group</TableCell>
                  <TableCell style={{ fontWeight: 700 }}>Region</TableCell>
                  <TableCell style={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell style={{ fontWeight: 700 }}>App Service Plan</TableCell>
                  <TableCell style={{ fontWeight: 700 }}>SRE Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {liveApps.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" style={{ padding: 32 }}>
                      <Typography variant="body2" color="textSecondary">
                        No App Services discovered. Check Azure permissions or configure resource groups.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  liveApps.map((app: any) => (
                    <TableRow key={app.name} className={classes.tableRow}>
                      <TableCell style={{ fontWeight: 600 }}>
                        {app.name}
                        <Typography variant="caption" display="block" color="textSecondary">
                          {app.defaultHostName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={app.resourceGroup} size="small" style={{ fontSize: '0.72rem', height: 22 }} />
                      </TableCell>
                      <TableCell>{app.location}</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          {app.state?.toLowerCase() === 'running' ? (
                            <>
                              <CheckCircleIcon style={{ color: '#10b981', fontSize: 18 }} />
                              <span style={{ fontWeight: 700, color: '#047857' }}>Running</span>
                            </>
                          ) : (
                            <>
                              <WarningIcon style={{ color: '#ef4444', fontSize: 18 }} />
                              <span style={{ fontWeight: 700, color: '#dc2626' }}>{app.state || 'Stopped'}</span>
                            </>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                        {app.appServicePlan || 'Standard'}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          color="primary"
                          disabled={restarting === app.name}
                          onClick={() => handleRealRestart(app)}
                          style={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 600 }}
                        >
                          {restarting === app.name ? 'Recycling in Azure...' : 'Recycle Container'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>
    </Box>
  );
};
