import React, { useState } from 'react';
import useAsync from 'react-use/lib/useAsync';
import {
  Box,
  Card,
  Chip,
  Grid,
  Typography,
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
import CloudQueueIcon from '@material-ui/icons/CloudQueue';
import MemoryIcon from '@material-ui/icons/Memory';
import StorageIcon from '@material-ui/icons/Storage';
import BubbleChartIcon from '@material-ui/icons/BubbleChart';
import RefreshIcon from '@material-ui/icons/Refresh';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3),
  },
  statCard: {
    padding: theme.spacing(2.5),
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[1],
  },
  statNumber: {
    fontWeight: 700,
    fontSize: '1.8rem',
    color: '#ff9900',
  },
  tabsPaper: {
    marginBottom: theme.spacing(2.5),
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[1],
  },
}));

export const EntityAwsTabContent = () => {
  const classes = useStyles();
  const [activeTab, setActiveTab] = useState(0);

  const { value: resData, loading, retry } = useAsync(async () => {
    const res = await fetch('/api/aws-deploy/resources');
    if (!res.ok) return { compute: [], storage: [] };
    return await res.json();
  }, []);

  const { value: bedrockData } = useAsync(async () => {
    const res = await fetch('/api/aws-deploy/bedrock-models');
    if (!res.ok) return { models: [] };
    return await res.json();
  }, []);

  const compute = resData?.compute || [];
  const storage = resData?.storage || [];
  const models = bedrockData?.models || [];

  return (
    <div className={classes.root}>
      {/* Header Bar */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" style={{ gap: 16 }}>
        <Box display="flex" alignItems="center" style={{ gap: 12 }}>
          <Chip label="AWS Cloud" style={{ backgroundColor: '#ff9900', color: '#ffffff', fontWeight: 700 }} size="small" />
          <Chip label="Region: us-east-1" size="small" variant="outlined" />
          <Chip label="Amazon Bedrock: Active" size="small" style={{ backgroundColor: 'rgba(99, 102, 241, 0.12)', color: '#6366f1', fontWeight: 600 }} />
        </Box>
        <Tooltip title="Refresh AWS Component Telemetry">
          <IconButton size="small" onClick={() => retry()} style={{ border: '1px solid rgba(0, 0, 0, 0.12)' }}>
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* KPI Row */}
      <Grid container spacing={3} style={{ marginBottom: 24 }}>
        <Grid item xs={12} sm={4}>
          <Card className={classes.statCard}>
            <Typography variant="body2" color="textSecondary" style={{ fontWeight: 600 }}>
              Active ECS & Lambda Services
            </Typography>
            <Typography className={classes.statNumber}>
              {compute.length}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card className={classes.statCard}>
            <Typography variant="body2" color="textSecondary" style={{ fontWeight: 600 }}>
              S3 Vaults & Aurora Databases
            </Typography>
            <Typography className={classes.statNumber} style={{ color: '#0284c7' }}>
              {storage.length}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card className={classes.statCard}>
            <Typography variant="body2" color="textSecondary" style={{ fontWeight: 600 }}>
              Bedrock GenAI Models
            </Typography>
            <Typography className={classes.statNumber} style={{ color: '#6366f1' }}>
              {models.length} Deployed
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Sub Tabs */}
      <Paper square className={classes.tabsPaper}>
        <Tabs
          value={activeTab}
          indicatorColor="primary"
          textColor="primary"
          onChange={(_, val) => setActiveTab(val)}
        >
          <Tab icon={<MemoryIcon style={{ color: '#ff9900' }} />} label={`Compute & Containers (${compute.length})`} value={0} style={{ textTransform: 'none', fontWeight: 600 }} />
          <Tab icon={<StorageIcon style={{ color: '#0284c7' }} />} label={`Storage & Databases (${storage.length})`} value={1} style={{ textTransform: 'none', fontWeight: 600 }} />
          <Tab icon={<BubbleChartIcon style={{ color: '#6366f1' }} />} label={`Amazon Bedrock GenAI (${models.length})`} value={2} style={{ textTransform: 'none', fontWeight: 600 }} />
        </Tabs>
      </Paper>

      {/* SUBTAB 0: Compute */}
      {activeTab === 0 && (
        <TableContainer component={Paper} variant="outlined" style={{ borderRadius: 8 }}>
          <Table>
            <TableHead style={{ backgroundColor: '#f8fafc' }}>
              <TableRow>
                <TableCell style={{ fontWeight: 700 }}>Service</TableCell>
                <TableCell style={{ fontWeight: 700 }}>Type</TableCell>
                <TableCell style={{ fontWeight: 700 }}>Scale / Tasks</TableCell>
                <TableCell style={{ fontWeight: 700 }}>Resources</TableCell>
                <TableCell style={{ fontWeight: 700 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {compute.map(c => (
                <TableRow key={c.id} hover>
                  <TableCell style={{ fontWeight: 700 }}>{c.name}</TableCell>
                  <TableCell><Chip label={c.type} size="small" /></TableCell>
                  <TableCell>{c.tasks || c.invocations || c.ip}</TableCell>
                  <TableCell>{c.cpu ? `${c.cpu} • ${c.memory}` : c.memory || c.cpuUtilization}</TableCell>
                  <TableCell>
                    <Chip
                      icon={<CheckCircleIcon style={{ color: '#16a34a', fontSize: 14 }} />}
                      label={c.status}
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

      {/* SUBTAB 1: Storage */}
      {activeTab === 1 && (
        <TableContainer component={Paper} variant="outlined" style={{ borderRadius: 8 }}>
          <Table>
            <TableHead style={{ backgroundColor: '#f8fafc' }}>
              <TableRow>
                <TableCell style={{ fontWeight: 700 }}>Resource Name</TableCell>
                <TableCell style={{ fontWeight: 700 }}>Type</TableCell>
                <TableCell style={{ fontWeight: 700 }}>Capacity / Connections</TableCell>
                <TableCell style={{ fontWeight: 700 }}>Security</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {storage.map(s => (
                <TableRow key={s.id} hover>
                  <TableCell style={{ fontWeight: 700 }}>{s.name}</TableCell>
                  <TableCell><Chip label={s.type} size="small" /></TableCell>
                  <TableCell>{s.storageSize || s.allocatedStorage}</TableCell>
                  <TableCell>
                    <Chip label={s.publicAccess || 'Encrypted (KMS)'} size="small" style={{ backgroundColor: '#e0f2fe', color: '#0369a1' }} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* SUBTAB 2: Bedrock */}
      {activeTab === 2 && (
        <TableContainer component={Paper} variant="outlined" style={{ borderRadius: 8 }}>
          <Table>
            <TableHead style={{ backgroundColor: '#f8fafc' }}>
              <TableRow>
                <TableCell style={{ fontWeight: 700 }}>Model Name</TableCell>
                <TableCell style={{ fontWeight: 700 }}>Provider</TableCell>
                <TableCell style={{ fontWeight: 700 }}>Tokens Runrate</TableCell>
                <TableCell style={{ fontWeight: 700 }}>Unit Price (In / Out)</TableCell>
                <TableCell style={{ fontWeight: 700 }}>Use Case</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {models.map(m => (
                <TableRow key={m.modelId} hover>
                  <TableCell style={{ fontWeight: 700 }}>{m.name}</TableCell>
                  <TableCell><Chip label={m.provider} size="small" /></TableCell>
                  <TableCell>{m.inputTokens} in / {m.outputTokens} out</TableCell>
                  <TableCell>{m.costPer1MTokensIn} / {m.costPer1MTokensOut}</TableCell>
                  <TableCell style={{ fontSize: '0.85rem' }}>{m.useCase}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
};
