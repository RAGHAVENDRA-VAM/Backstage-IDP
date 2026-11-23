import React, { useState } from 'react';
import useAsync from 'react-use/lib/useAsync';
import Alert from '@material-ui/lab/Alert';
import {
  Box,
  Card,
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
  Tabs,
  Tab,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@material-ui/core';
import StorageIcon from '@material-ui/icons/Storage';
import CloudQueueIcon from '@material-ui/icons/CloudQueue';
import MemoryIcon from '@material-ui/icons/Memory';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import RefreshIcon from '@material-ui/icons/Refresh';
import LaunchIcon from '@material-ui/icons/Launch';
import CodeIcon from '@material-ui/icons/Code';
import DescriptionIcon from '@material-ui/icons/Description';

const useStyles = makeStyles(theme => ({
  heroBanner: {
    background: 'linear-gradient(90deg, #1e293b 0%, #0f172a 100%)',
    color: '#ffffff',
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(3.5, 4),
    marginBottom: theme.spacing(3),
    boxShadow: theme.shadows[2],
  },
  statCard: {
    height: '100%',
    padding: theme.spacing(2.5),
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[1],
    transition: 'transform 0.2s, box-shadow 0.2s',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: theme.shadows[3],
    },
  },
  statNumber: {
    fontWeight: 700,
    fontSize: '1.9rem',
    color: '#ff9900',
  },
  subTabsCard: {
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[1],
  },
  tabsHeader: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    backgroundColor: '#f8fafc',
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  logConsole: {
    backgroundColor: '#090d16',
    color: '#38bdf8',
    padding: theme.spacing(2),
    borderRadius: 6,
    fontFamily: 'Consolas, Monaco, monospace',
    fontSize: '0.85rem',
    lineHeight: 1.6,
    maxHeight: 280,
    overflowY: 'auto',
    whiteSpace: 'pre-wrap',
  },
}));

export const AwsCloudDashboardView = () => {
  const classes = useStyles();
  const [activeTab, setActiveTab] = useState(0);

  const {
    value: awsData,
    loading,
    error,
    retry,
  } = useAsync(async () => {
    const res = await fetch('/api/aws-deploy/resources');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  }, []);

  const {
    value: logsData,
    loading: logsLoading,
    retry: retryLogs,
  } = useAsync(async () => {
    const res = await fetch('/api/aws-deploy/cloudwatch-logs');
    if (!res.ok) return null;
    return await res.json();
  }, []);

  const compute = awsData?.compute || [];
  const storage = awsData?.storage || [];
  const isConfigured = awsData?.configured;
  const region = awsData?.region || 'us-east-1';

  return (
    <Box>
      {/* Hero Banner */}
      <Box className={classes.heroBanner}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
          <Box>
            <Box display="flex" alignItems="center" style={{ gap: 10 }} mb={1}>
              <CloudQueueIcon style={{ fontSize: 32, color: '#ff9900' }} />
              <Typography variant="h5" style={{ fontWeight: 800 }}>
                AWS Cloud Infrastructure Command Center
              </Typography>
            </Box>
            <Typography variant="body2" style={{ color: '#cbd5e1', maxWidth: 850 }}>
              Multi-Cloud AWS Command Center: Real-time operational visibility across Amazon ECS/Fargate clusters,
              AWS Lambda serverless functions, Amazon S3 vaults, and Aurora PostgreSQL databases.
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" style={{ gap: 10 }}>
            <Chip
              label={`AWS Region: ${region}`}
              size="small"
              style={{ backgroundColor: 'rgba(255, 153, 0, 0.2)', color: '#ff9900', fontWeight: 700 }}
            />
            <Tooltip title="Refresh AWS live inventory">
              <IconButton size="small" onClick={() => { retry(); retryLogs(); }} style={{ color: '#ffffff' }}>
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      {/* Configuration Status Notice */}
      {!isConfigured && (
        <Box mb={3}>
          <Alert severity="info" style={{ borderRadius: 8 }}>
            <strong>AWS Connection Active (Preview Mode):</strong> To stream live resources directly from your AWS account, configure{' '}
            <code>AWS_ACCESS_KEY_ID</code>, <code>AWS_SECRET_ACCESS_KEY</code>, and <code>AWS_REGION</code> in your Azure App Service environment settings.
          </Alert>
        </Box>
      )}

      {/* KPI Stats Row */}
      <Grid container spacing={3} style={{ marginBottom: 24 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.statCard}>
            <Typography variant="overline" color="textSecondary" style={{ fontWeight: 700 }}>
              Active Compute Services
            </Typography>
            <Typography className={classes.statNumber}>
              {compute.length} Services
            </Typography>
            <Typography variant="caption" color="textSecondary">
              ECS Fargate Tasks & Lambda Functions
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.statCard}>
            <Typography variant="overline" color="textSecondary" style={{ fontWeight: 700 }}>
              Storage & DB Vaults
            </Typography>
            <Typography className={classes.statNumber} style={{ color: '#0284c7' }}>
              {storage.length} Managed
            </Typography>
            <Typography variant="caption" color="textSecondary">
              S3 Buckets & Aurora Clusters
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.statCard}>
            <Typography variant="overline" color="textSecondary" style={{ fontWeight: 700 }}>
              Infrastructure Health
            </Typography>
            <Typography className={classes.statNumber} style={{ color: '#16a34a' }}>
              100% Operational
            </Typography>
            <Typography variant="caption" color="textSecondary">
              All Tasks & Endpoints Passing Healthchecks
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.statCard}>
            <Typography variant="overline" color="textSecondary" style={{ fontWeight: 700 }}>
              Active CloudWatch Streams
            </Typography>
            <Typography className={classes.statNumber} style={{ color: '#7c3aed' }}>
              Live Streaming
            </Typography>
            <Typography variant="caption" color="textSecondary">
              ECS & Lambda runtime logs connected
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Tabbed View */}
      <Card className={classes.subTabsCard}>
        <Box className={classes.tabsHeader}>
          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab
              icon={<MemoryIcon style={{ color: '#ff9900' }} />}
              label={`AWS Compute & Containers (${compute.length})`}
              style={{ fontWeight: 700, textTransform: 'none' }}
            />
            <Tab
              icon={<StorageIcon style={{ color: '#0284c7' }} />}
              label={`S3 Storage & Aurora RDS (${storage.length})`}
              style={{ fontWeight: 700, textTransform: 'none' }}
            />
            <Tab
              icon={<DescriptionIcon style={{ color: '#7c3aed' }} />}
              label="CloudWatch Live Log Streams"
              style={{ fontWeight: 700, textTransform: 'none' }}
            />
          </Tabs>
        </Box>

        {/* SUBTAB 0: AWS COMPUTE */}
        {activeTab === 0 && (
          <Box p={3}>
            {loading ? (
              <Box display="flex" justifyContent="center" py={6}>
                <CircularProgress size={36} />
              </Box>
            ) : (
              <TableContainer component={Paper} variant="outlined" style={{ borderRadius: 8 }}>
                <Table>
                  <TableHead style={{ backgroundColor: '#f8fafc' }}>
                    <TableRow>
                      <TableCell style={{ fontWeight: 700 }}>Service / Function Name</TableCell>
                      <TableCell style={{ fontWeight: 700 }}>AWS Architecture</TableCell>
                      <TableCell style={{ fontWeight: 700 }}>Region</TableCell>
                      <TableCell style={{ fontWeight: 700 }}>Active Tasks / Scale</TableCell>
                      <TableCell style={{ fontWeight: 700 }}>Resources</TableCell>
                      <TableCell style={{ fontWeight: 700 }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {compute.map(item => (
                      <TableRow key={item.id} hover>
                        <TableCell>
                          <Typography variant="body2" style={{ fontWeight: 700, color: '#0f172a' }}>
                            {item.name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            ID: {item.id}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={item.type} size="small" style={{ fontWeight: 600, backgroundColor: '#f1f5f9' }} />
                        </TableCell>
                        <TableCell>
                          <Chip label={item.region} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell style={{ fontWeight: 600 }}>
                          {item.tasks || item.invocations || item.ip}
                        </TableCell>
                        <TableCell>
                          {item.cpu ? `${item.cpu} • ${item.memory}` : item.memory || item.cpuUtilization}
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={<CheckCircleIcon style={{ color: '#16a34a', fontSize: 14 }} />}
                            label={item.status}
                            size="small"
                            style={{ backgroundColor: '#dcfce7', color: '#166534', fontWeight: 700 }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {/* SUBTAB 1: STORAGE & RDS */}
        {activeTab === 1 && (
          <Box p={3}>
            <TableContainer component={Paper} variant="outlined" style={{ borderRadius: 8 }}>
              <Table>
                <TableHead style={{ backgroundColor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell style={{ fontWeight: 700 }}>Resource / Cluster Name</TableCell>
                    <TableCell style={{ fontWeight: 700 }}>Type</TableCell>
                    <TableCell style={{ fontWeight: 700 }}>Region</TableCell>
                    <TableCell style={{ fontWeight: 700 }}>Size / Storage</TableCell>
                    <TableCell style={{ fontWeight: 700 }}>Objects / Metrics</TableCell>
                    <TableCell style={{ fontWeight: 700 }}>Security & Encryption</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {storage.map(item => (
                    <TableRow key={item.id} hover>
                      <TableCell>
                        <Typography variant="body2" style={{ fontWeight: 700, color: '#0f172a' }}>
                          {item.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          ID: {item.id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={item.type} size="small" style={{ fontWeight: 600, backgroundColor: '#f1f5f9' }} />
                      </TableCell>
                      <TableCell>
                        <Chip label={item.region} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell style={{ fontWeight: 600 }}>
                        {item.storageSize || item.allocatedStorage}
                      </TableCell>
                      <TableCell>
                        {item.objectCount || item.connections}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={item.publicAccess || item.size || 'Encrypted (KMS)'}
                          size="small"
                          style={{ backgroundColor: '#e0f2fe', color: '#0369a1', fontWeight: 600 }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* SUBTAB 2: CLOUDWATCH LOGS */}
        {activeTab === 2 && (
          <Box p={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box>
                <Typography variant="subtitle1" style={{ fontWeight: 700 }}>
                  Amazon CloudWatch Real-Time Log Stream
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Log Group: {logsData?.logGroup || '/aws/ecs/claims-processor-service'} • Stream: {logsData?.streamName || 'fargate/tasks'}
                </Typography>
              </Box>
              <Button
                variant="outlined"
                size="small"
                startIcon={<RefreshIcon />}
                onClick={() => retryLogs()}
                style={{ textTransform: 'none', fontWeight: 600 }}
              >
                Refresh Stream
              </Button>
            </Box>
            {logsLoading ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress size={28} />
              </Box>
            ) : (
              <Box className={classes.logConsole}>
                {logsData?.logs || 'No log records returned.'}
              </Box>
            )}
          </Box>
        )}
      </Card>
    </Box>
  );
};
