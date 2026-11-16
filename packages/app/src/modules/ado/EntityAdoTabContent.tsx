import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
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
import useAsync from 'react-use/lib/useAsync';
import { useEntity } from '@backstage/plugin-catalog-react';
import { useApi, discoveryApiRef } from '@backstage/core-plugin-api';

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3),
  },
  banner: {
    background: 'linear-gradient(90deg, #0078d4 0%, #005a9e 100%)',
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
    letterSpacing: '-0.5px',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
  },
  statCard: {
    borderRadius: theme.shape.borderRadius,
    border: '1px solid rgba(0, 0, 0, 0.08)',
    boxShadow: 'none',
    transition: 'transform 0.2s, box-shadow 0.2s',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: theme.shadows[3],
    },
  },
  filterSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(2.5),
    flexWrap: 'wrap',
    gap: theme.spacing(2),
  },
  table: {
    minWidth: 650,
  },
  tableHead: {
    backgroundColor: '#f8fafc',
    '& th': {
      fontWeight: 600,
      color: '#475569',
    },
  },
  tableRow: {
    '&:hover': {
      backgroundColor: '#f1f5f9',
    },
  },
}));

export const EntityAdoTabContent = () => {
  const classes = useStyles();
  const { entity } = useEntity();
  const discoveryApi = useApi(discoveryApiRef);
  const [activeTab, setActiveTab] = useState<'pipelines' | 'pullrequests' | 'workitems'>('pipelines');
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshIndex, setRefreshIndex] = useState(0);

  // Parse annotations: dev.azure.com/project-repo format is "Org/Project/Repo" or separate annotations
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

  const successfulRuns = runs.filter(r => r.result === 'succeeded').length;
  const activePRs = prs.filter(p => p.status === 'active').length;

  const filteredRuns = runs.filter(r =>
    (r.buildNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.definition?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.sourceBranch || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPRs = prs.filter(p =>
    (p.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.sourceBranch || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.createdBy?.displayName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderStatusChip = (status: string, result?: string) => {
    if (result === 'succeeded') {
      return <Chip icon={<CheckCircleIcon style={{ color: '#16a34a' }} />} label="Succeeded" size="small" style={{ backgroundColor: '#dcfce7', color: '#166534', fontWeight: 600 }} />;
    }
    if (result === 'failed') {
      return <Chip icon={<CancelIcon style={{ color: '#dc2626' }} />} label="Failed" size="small" style={{ backgroundColor: '#fee2e2', color: '#991b1b', fontWeight: 600 }} />;
    }
    if (status === 'inProgress') {
      return <Chip icon={<HourglassEmptyIcon style={{ color: '#2563eb' }} />} label="Running" size="small" style={{ backgroundColor: '#dbeafe', color: '#1e40af', fontWeight: 600 }} />;
    }
    return <Chip label={result || status || 'Queued'} size="small" />;
  };

  return (
    <div className={classes.root}>
      {/* Banner */}
      <div className={classes.banner}>
        <div>
          <Typography variant="h4" className={classes.bannerTitle}>
            <CloudQueueIcon fontSize="large" /> Azure DevOps Portal
          </Typography>
          <Typography variant="body1" style={{ opacity: 0.9, marginTop: 4 }}>
            Connected to <strong>{org}</strong> / <strong>{project}</strong> / <strong>{repo}</strong>
          </Typography>
        </div>
        <Box display="flex" gap={1}>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<PlayCircleOutlineIcon />}
            href={`/create/templates/default/trigger-ado-pipeline`}
            style={{ fontWeight: 600, backgroundColor: '#ffffff', color: '#0078d4' }}
          >
            Trigger Pipeline
          </Button>
          <IconButton
            style={{ color: '#ffffff', backgroundColor: 'rgba(255,255,255,0.1)' }}
            onClick={() => setRefreshIndex(c => c + 1)}
          >
            <RefreshIcon />
          </IconButton>
        </Box>
      </div>

      {/* KPI Stats */}
      <Grid container spacing={2} style={{ marginBottom: 24 }}>
        <Grid item xs={12} sm={3}>
          <Card className={classes.statCard}>
            <CardContent>
              <Typography color="textSecondary" variant="subtitle2" gutterBottom>
                Total Pipeline Runs
              </Typography>
              <Typography variant="h4" style={{ fontWeight: 700, color: '#0078d4' }}>
                {runs.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card className={classes.statCard}>
            <CardContent>
              <Typography color="textSecondary" variant="subtitle2" gutterBottom>
                Successful Builds
              </Typography>
              <Typography variant="h4" style={{ fontWeight: 700, color: '#16a34a' }}>
                {successfulRuns}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card className={classes.statCard}>
            <CardContent>
              <Typography color="textSecondary" variant="subtitle2" gutterBottom>
                Active Pull Requests
              </Typography>
              <Typography variant="h4" style={{ fontWeight: 700, color: '#d97706' }}>
                {activePRs}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card className={classes.statCard}>
            <CardContent>
              <Typography color="textSecondary" variant="subtitle2" gutterBottom>
                Linked Work Items
              </Typography>
              <Typography variant="h4" style={{ fontWeight: 700, color: '#475569' }}>
                {workItems.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Navigation Tabs */}
      <Paper square style={{ marginBottom: 20 }}>
        <Tabs
          value={activeTab}
          indicatorColor="primary"
          textColor="primary"
          onChange={(_, newVal) => setActiveTab(newVal)}
        >
          <Tab icon={<PlayCircleOutlineIcon />} label={`Pipelines (${runs.length})`} value="pipelines" />
          <Tab icon={<CallSplitIcon />} label={`Pull Requests (${prs.length})`} value="pullrequests" />
          <Tab icon={<AssignmentIcon />} label={`Boards / Work Items (${workItems.length})`} value="workitems" />
        </Tabs>
      </Paper>

      {/* Filter and Search */}
      <div className={classes.filterSection}>
        <TextField
          placeholder={`Search ${activeTab}...`}
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
          style={{ width: 320 }}
        />
        <Button
          variant="outlined"
          color="primary"
          startIcon={<OpenInNewIcon />}
          href={`https://dev.azure.com/${org}/${project}/_git/${repo}`}
          target="_blank"
        >
          Open Repository in Azure DevOps
        </Button>
      </div>

      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box p={3} bgcolor="#fee2e2" color="#991b1b" borderRadius={4}>
          <Typography variant="body1">Error fetching Azure DevOps data: {error.message}</Typography>
        </Box>
      ) : activeTab === 'pipelines' ? (
        <TableContainer component={Paper} elevation={1}>
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
                  <TableCell colSpan={7} align="center" style={{ padding: 32 }}>
                    No pipeline runs found matching criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRuns.map((r: any) => (
                  <TableRow key={r.id} className={classes.tableRow}>
                    <TableCell>
                      <Typography variant="body2" style={{ fontWeight: 600 }}>
                        #{r.buildNumber || r.id}
                      </Typography>
                    </TableCell>
                    <TableCell>{r.definition?.name || 'Default Pipeline'}</TableCell>
                    <TableCell>
                      <Chip label={r.sourceBranch || 'main'} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>{renderStatusChip(r.status, r.result)}</TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        {r.requestedFor?.imageUrl && (
                          <Avatar src={r.requestedFor.imageUrl} style={{ width: 24, height: 24 }} />
                        )}
                        <Typography variant="body2">{r.requestedFor?.displayName || 'Automated'}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{r.startTime ? new Date(r.startTime).toLocaleString() : '-'}</TableCell>
                    <TableCell align="right">
                      <Button size="small" color="primary" href={r.webUrl} target="_blank" endIcon={<OpenInNewIcon />}>
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
        <TableContainer component={Paper} elevation={1}>
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
                  <TableCell colSpan={7} align="center" style={{ padding: 32 }}>
                    No pull requests found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredPRs.map((pr: any) => (
                  <TableRow key={pr.pullRequestId} className={classes.tableRow}>
                    <TableCell>
                      <Typography variant="body2" style={{ fontWeight: 600 }}>
                        #{pr.pullRequestId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" style={{ fontWeight: 600 }}>
                        {pr.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <code>{pr.sourceBranch}</code> → <code>{pr.targetBranch}</code>
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
                      <Button size="small" color="primary" href={pr.webUrl} target="_blank" endIcon={<OpenInNewIcon />}>
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
        <TableContainer component={Paper} elevation={1}>
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
              {workItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" style={{ padding: 32 }}>
                    No work items found.
                  </TableCell>
                </TableRow>
              ) : (
                workItems.map((wi: any) => (
                  <TableRow key={wi.id} className={classes.tableRow}>
                    <TableCell>#{wi.id}</TableCell>
                    <TableCell style={{ fontWeight: 600 }}>{wi.title}</TableCell>
                    <TableCell>
                      <Chip label={wi.type || 'Task'} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Chip label={wi.state || 'Active'} size="small" color="primary" />
                    </TableCell>
                    <TableCell align="right">
                      <Button size="small" color="primary" href={wi.url} target="_blank" endIcon={<OpenInNewIcon />}>
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
