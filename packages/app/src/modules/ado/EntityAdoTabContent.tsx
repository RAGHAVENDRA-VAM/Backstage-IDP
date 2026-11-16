import { useState } from 'react';
import {
  Box,
  Card,
  Chip,
  Grid,
  Typography,
  TextField,
  InputAdornment,
  Button,
  makeStyles,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Tabs,
  Tab,
  Avatar,
  Tooltip,
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import RefreshIcon from '@material-ui/icons/Refresh';
import PlayCircleOutlineIcon from '@material-ui/icons/PlayCircleOutline';
import CallSplitIcon from '@material-ui/icons/CallSplit';
import CloudQueueIcon from '@material-ui/icons/CloudQueue';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CancelIcon from '@material-ui/icons/Cancel';
import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty';
import AssignmentIcon from '@material-ui/icons/Assignment';
import BlockIcon from '@material-ui/icons/Block';
import useAsync from 'react-use/lib/useAsync';
import { useEntity } from '@backstage/plugin-catalog-react';
import { useApi, discoveryApiRef } from '@backstage/core-plugin-api';

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3),
  },
  banner: {
    background: 'linear-gradient(90deg, #1e293b 0%, #0f172a 100%)',
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
  bannerTitle: {
    fontWeight: 700,
    fontSize: '1.75rem',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
  },
  bannerSubtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    maxWidth: 820,
    fontSize: '0.95rem',
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
  statCard: {
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
    fontSize: '1.8rem',
    color: theme.palette.primary.main,
  },
  tabsPaper: {
    marginBottom: theme.spacing(2.5),
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
  },
  filterSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(2.5),
    flexWrap: 'wrap',
    gap: theme.spacing(2),
  },
  tablePaper: {
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
    overflow: 'hidden',
    boxShadow: theme.shadows[1],
  },
  table: {
    minWidth: 700,
  },
  tableHead: {
    backgroundColor: theme.palette.type === 'dark' ? '#1e293b' : '#f8fafc',
    '& th': {
      fontWeight: 700,
      fontSize: '0.8rem',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      color: theme.palette.type === 'dark' ? '#94a3b8' : '#475569',
      borderBottom: `1px solid ${theme.palette.divider}`,
    },
  },
  tableRow: {
    '&:hover': {
      backgroundColor: theme.palette.type === 'dark' ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc',
    },
    '& td': {
      borderBottom: `1px solid ${theme.palette.divider}`,
      fontSize: '0.875rem',
    },
  },
  codeChip: {
    fontFamily: 'Consolas, Monaco, monospace',
    fontSize: '0.8rem',
    borderRadius: 4,
  },
  statusSuccess: {
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    color: '#16a34a',
    border: '1px solid rgba(34, 197, 94, 0.35)',
    fontWeight: 700,
    fontSize: '0.75rem',
  },
  statusFailed: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    color: '#dc2626',
    border: '1px solid rgba(239, 68, 68, 0.35)',
    fontWeight: 700,
    fontSize: '0.75rem',
  },
  statusProgress: {
    backgroundColor: 'rgba(14, 165, 233, 0.12)',
    color: '#0284c7',
    border: '1px solid rgba(14, 165, 233, 0.35)',
    fontWeight: 700,
    fontSize: '0.75rem',
  },
  statusCanceled: {
    backgroundColor: 'rgba(100, 116, 139, 0.12)',
    color: '#64748b',
    border: '1px solid rgba(100, 116, 139, 0.35)',
    fontWeight: 700,
    fontSize: '0.75rem',
  },
}));

export const EntityAdoTabContent = () => {
  const classes = useStyles();
  const { entity } = useEntity();
  const discoveryApi = useApi(discoveryApiRef);
  const [activeTab, setActiveTab] = useState<'pipelines' | 'pullrequests' | 'workitems'>('pipelines');
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshIndex, setRefreshIndex] = useState(0);

  // Parse annotations: dev.azure.com/project-repo format is "Org/Project/Repo"
  const projectRepo = entity.metadata.annotations?.['dev.azure.com/project-repo'] || '';
  const parts = projectRepo.split('/');
  const org = parts[0] || entity.metadata.annotations?.['dev.azure.com/organization'] || 'ValueMomentum-DCS';
  const project = parts[1] || entity.metadata.annotations?.['dev.azure.com/project'] || 'DOJO - POC';
  const repo = parts[2] || entity.metadata.annotations?.['dev.azure.com/repository'] || entity.metadata.name;

  const { value, loading, error } = useAsync(async () => {
    const baseUrl = await discoveryApi.getBaseUrl('ado-proxy');

    const [runsRes, prsRes, workItemsRes] = await Promise.all([
      fetch(`${baseUrl}/pipeline-runs?organization=${encodeURIComponent(org)}&project=${encodeURIComponent(project)}&repository=${encodeURIComponent(repo)}`),
      fetch(`${baseUrl}/pull-requests?organization=${encodeURIComponent(org)}&project=${encodeURIComponent(project)}&repository=${encodeURIComponent(repo)}`),
      fetch(`${baseUrl}/work-items?organization=${encodeURIComponent(org)}&project=${encodeURIComponent(project)}&type=Task`),
    ]);

    const runsData = runsRes.ok ? await runsRes.json() : { runs: [] };
    const prsData = prsRes.ok ? await prsRes.json() : { pullRequests: [] };
    const workItemsData = workItemsRes.ok ? await workItemsRes.json() : { workItems: [] };

    return {
      runs: runsData.runs || [],
      prs: prsData.pullRequests || [],
      workItems: workItemsData.workItems || [],
    };
  }, [discoveryApi, org, project, repo, refreshIndex]);

  const runs = value?.runs || [];
  const prs = value?.prs || [];
  const workItems = value?.workItems || [];

  const successfulRuns = runs.filter((r: any) => r.result === 'succeeded').length;
  const failedRuns = runs.filter((r: any) => r.result === 'failed').length;
  const activePRs = prs.filter((p: any) => p.status === 'active').length;

  const filteredRuns = runs.filter((r: any) =>
    (r.buildNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.definition?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.sourceBranch || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.requestedFor?.displayName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPRs = prs.filter((p: any) =>
    (p.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.sourceBranch || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.targetBranch || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.createdBy?.displayName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredWorkItems = workItems.filter((wi: any) =>
    String(wi.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (wi.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (wi.type || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (wi.state || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderStatusChip = (status: string, result?: string) => {
    if (result === 'succeeded') {
      return (
        <Chip
          icon={<CheckCircleIcon style={{ color: '#16a34a', fontSize: 16 }} />}
          label="Succeeded"
          size="small"
          className={classes.statusSuccess}
        />
      );
    }
    if (result === 'failed') {
      return (
        <Chip
          icon={<CancelIcon style={{ color: '#dc2626', fontSize: 16 }} />}
          label="Failed"
          size="small"
          className={classes.statusFailed}
        />
      );
    }
    if (result === 'canceled') {
      return (
        <Chip
          icon={<BlockIcon style={{ color: '#64748b', fontSize: 16 }} />}
          label="Canceled"
          size="small"
          className={classes.statusCanceled}
        />
      );
    }
    if (status === 'inProgress') {
      return (
        <Chip
          icon={<HourglassEmptyIcon style={{ color: '#0284c7', fontSize: 16 }} />}
          label="Running"
          size="small"
          className={classes.statusProgress}
        />
      );
    }
    return <Chip label={result || status || 'Queued'} size="small" variant="outlined" />;
  };

  return (
    <div className={classes.root}>
      {/* Enterprise IDP Header Toolbar */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" style={{ gap: 16 }}>
        <Box display="flex" alignItems="center" style={{ gap: 12 }}>
          <Chip label="Azure DevOps" color="primary" size="small" style={{ fontWeight: 700 }} />
          <Chip label={`Org: ${org}`} size="small" variant="outlined" />
          <Chip label={`Project: ${project}`} size="small" variant="outlined" />
          <Chip label="Service Connection: Active" size="small" style={{ backgroundColor: 'rgba(34, 197, 94, 0.12)', color: '#16a34a', fontWeight: 600 }} />
        </Box>
        <Box display="flex" alignItems="center" style={{ gap: 12 }}>
          <Tooltip title="Refresh live telemetry">
            <IconButton
              size="small"
              onClick={() => setRefreshIndex(c => c + 1)}
              style={{ border: '1px solid rgba(0, 0, 0, 0.12)' }}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<PlayCircleOutlineIcon />}
            href="/create/templates/default/trigger-ado-pipeline"
            style={{ fontWeight: 700, textTransform: 'none', boxShadow: 'none' }}
          >
            Trigger Pipeline
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<OpenInNewIcon />}
            href={`https://dev.azure.com/${org}/${project}/_git/${repo}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textTransform: 'none', fontWeight: 600 }}
          >
            Open in ADO
          </Button>
        </Box>
      </Box>

      {/* Enterprise KPI Metrics Row */}
      <Grid container spacing={3} style={{ marginBottom: 24 }}>
        <Grid item xs={12} sm={3}>
          <Card className={classes.statCard}>
            <Typography variant="body2" color="textSecondary" style={{ fontWeight: 600 }}>
              Total Executions
            </Typography>
            <Typography className={classes.statNumber}>
              {runs.length}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card className={classes.statCard}>
            <Typography variant="body2" color="textSecondary" style={{ fontWeight: 600 }}>
              Successful Builds
            </Typography>
            <Typography className={classes.statNumber} style={{ color: '#16a34a' }}>
              {successfulRuns}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card className={classes.statCard}>
            <Typography variant="body2" color="textSecondary" style={{ fontWeight: 600 }}>
              Failed Executions
            </Typography>
            <Typography className={classes.statNumber} style={{ color: failedRuns > 0 ? '#dc2626' : '#64748b' }}>
              {failedRuns}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card className={classes.statCard}>
            <Typography variant="body2" color="textSecondary" style={{ fontWeight: 600 }}>
              Active Pull Requests
            </Typography>
            <Typography className={classes.statNumber} style={{ color: activePRs > 0 ? '#0284c7' : '#64748b' }}>
              {activePRs}
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Sub-Navigation Tabs */}
      <Paper square className={classes.tabsPaper}>
        <Tabs
          value={activeTab}
          indicatorColor="primary"
          textColor="primary"
          onChange={(_, newVal) => setActiveTab(newVal)}
        >
          <Tab icon={<PlayCircleOutlineIcon />} label={`Pipelines (${runs.length})`} value="pipelines" style={{ textTransform: 'none', fontWeight: 600 }} />
          <Tab icon={<CallSplitIcon />} label={`Pull Requests (${prs.length})`} value="pullrequests" style={{ textTransform: 'none', fontWeight: 600 }} />
          <Tab icon={<AssignmentIcon />} label={`Work Items (${workItems.length})`} value="workitems" style={{ textTransform: 'none', fontWeight: 600 }} />
        </Tabs>
      </Paper>

      {/* Filter and Search Section */}
      <div className={classes.filterSection}>
        <TextField
          placeholder={`Filter ${activeTab} by name, branch, or author...`}
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          style={{ width: 360 }}
        />
        <Typography variant="body2" color="textSecondary">
          Showing {activeTab === 'pipelines' ? filteredRuns.length : activeTab === 'pullrequests' ? filteredPRs.length : filteredWorkItems.length} records
        </Typography>
      </div>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" p={6}>
          <CircularProgress size={36} />
        </Box>
      ) : error ? (
        <Box p={3} bgcolor="#fee2e2" color="#991b1b" borderRadius={4}>
          <Typography variant="body1">Error fetching Azure DevOps data: {error.message}</Typography>
        </Box>
      ) : activeTab === 'pipelines' ? (
        <TableContainer component={Paper} className={classes.tablePaper}>
          <Table className={classes.table}>
            <TableHead className={classes.tableHead}>
              <TableRow>
                <TableCell>Run / Build #</TableCell>
                <TableCell>Pipeline</TableCell>
                <TableCell>Branch</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Triggered By</TableCell>
                <TableCell>Start Time</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRuns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" style={{ padding: 40 }}>
                    <Typography variant="body2" color="textSecondary">
                      No pipeline runs found matching criteria.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredRuns.map((r: any) => (
                  <TableRow key={r.id} className={classes.tableRow}>
                    <TableCell>
                      <Typography variant="body2" style={{ fontWeight: 600, fontFamily: 'Consolas, monospace' }}>
                        #{r.buildNumber || r.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" style={{ fontWeight: 600 }}>
                        {r.definition?.name || 'Default Pipeline'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={r.sourceBranch || 'main'}
                        size="small"
                        variant="outlined"
                        className={classes.codeChip}
                      />
                    </TableCell>
                    <TableCell>{renderStatusChip(r.status, r.result)}</TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" style={{ gap: 8 }}>
                        {r.requestedFor?.imageUrl && (
                          <Avatar src={r.requestedFor.imageUrl} style={{ width: 24, height: 24 }} />
                        )}
                        <Typography variant="body2">{r.requestedFor?.displayName || 'Automated'}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{r.startTime ? new Date(r.startTime).toLocaleString() : '-'}</TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        color="primary"
                        href={r.webUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        endIcon={<OpenInNewIcon fontSize="small" />}
                        style={{ textTransform: 'none', fontWeight: 600 }}
                      >
                        View Run
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      ) : activeTab === 'pullrequests' ? (
        <TableContainer component={Paper} className={classes.tablePaper}>
          <Table className={classes.table}>
            <TableHead className={classes.tableHead}>
              <TableRow>
                <TableCell>PR #</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Source → Target</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created By</TableCell>
                <TableCell>Created Date</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPRs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" style={{ padding: 40 }}>
                    <Typography variant="body2" color="textSecondary">
                      No pull requests found.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPRs.map((pr: any) => (
                  <TableRow key={pr.pullRequestId} className={classes.tableRow}>
                    <TableCell>
                      <Typography variant="body2" style={{ fontWeight: 600, fontFamily: 'Consolas, monospace' }}>
                        #{pr.pullRequestId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" style={{ fontWeight: 600 }}>
                        {pr.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" style={{ fontFamily: 'Consolas, monospace', fontSize: '0.8rem' }}>
                        {pr.sourceBranch} → {pr.targetBranch}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={pr.status}
                        size="small"
                        color={pr.status === 'active' ? 'primary' : 'default'}
                      />
                    </TableCell>
                    <TableCell>{pr.createdBy?.displayName || 'Developer'}</TableCell>
                    <TableCell>{new Date(pr.creationDate).toLocaleDateString()}</TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        color="primary"
                        href={pr.webUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        endIcon={<OpenInNewIcon fontSize="small" />}
                        style={{ textTransform: 'none', fontWeight: 600 }}
                      >
                        Review PR
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <TableContainer component={Paper} className={classes.tablePaper}>
          <Table className={classes.table}>
            <TableHead className={classes.tableHead}>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>State</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredWorkItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" style={{ padding: 40 }}>
                    <Typography variant="body2" color="textSecondary">
                      No work items found.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredWorkItems.map((wi: any) => (
                  <TableRow key={wi.id} className={classes.tableRow}>
                    <TableCell>
                      <Typography variant="body2" style={{ fontWeight: 600, fontFamily: 'Consolas, monospace' }}>
                        #{wi.id}
                      </Typography>
                    </TableCell>
                    <TableCell style={{ fontWeight: 600 }}>{wi.title}</TableCell>
                    <TableCell>
                      <Chip label={wi.type || 'Task'} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Chip label={wi.state || 'Active'} size="small" color="primary" />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        color="primary"
                        href={wi.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        endIcon={<OpenInNewIcon fontSize="small" />}
                        style={{ textTransform: 'none', fontWeight: 600 }}
                      >
                        Open Work Item
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
};
