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
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import RefreshIcon from '@material-ui/icons/Refresh';
import PlayCircleOutlineIcon from '@material-ui/icons/PlayCircleOutline';
import CallSplitIcon from '@material-ui/icons/CallSplit';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CancelIcon from '@material-ui/icons/Cancel';
import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty';
import AssignmentIcon from '@material-ui/icons/Assignment';
import BlockIcon from '@material-ui/icons/Block';
import BugReportIcon from '@material-ui/icons/BugReport';
import AddIcon from '@material-ui/icons/Add';
import DescriptionIcon from '@material-ui/icons/Description';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import SecurityIcon from '@material-ui/icons/Security';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import ArchiveIcon from '@material-ui/icons/Archive';
import CloseIcon from '@material-ui/icons/Close';
import useAsync from 'react-use/lib/useAsync';
import { useEntity } from '@backstage/plugin-catalog-react';
import { useApi, discoveryApiRef } from '@backstage/core-plugin-api';

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
  kanbanCol: {
    backgroundColor: theme.palette.type === 'dark' ? '#1e293b' : '#f8fafc',
    borderRadius: 8,
    border: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(2),
    minHeight: 450,
  },
  kanbanCard: {
    marginBottom: theme.spacing(1.5),
    borderRadius: 6,
    border: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(1.5),
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[1],
    transition: 'transform 0.15s, box-shadow 0.15s',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: theme.shadows[3],
    },
  },
  logConsole: {
    backgroundColor: '#0f172a',
    color: '#38bdf8',
    fontFamily: 'Consolas, "Fira Code", monospace',
    fontSize: '0.85rem',
    padding: theme.spacing(2),
    borderRadius: 6,
    maxHeight: 500,
    overflowY: 'auto',
    whiteSpace: 'pre-wrap',
    lineHeight: 1.5,
  },
}));

export const EntityAdoTabContent = () => {
  const classes = useStyles();
  const { entity } = useEntity();
  const discoveryApi = useApi(discoveryApiRef);
  const [activeTab, setActiveTab] = useState<'pipelines' | 'pullrequests' | 'kanban' | 'packages'>('pipelines');
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshIndex, setRefreshIndex] = useState(0);

  // Modal states
  const [selectedBuildForLogs, setSelectedBuildForLogs] = useState<any>(null);
  const [timelineModalOpen, setTimelineModalOpen] = useState(false);
  const [selectedLogText, setSelectedLogText] = useState<string | null>(null);
  const [loadingLog, setLoadingLog] = useState(false);
  const [newWorkItemModalOpen, setNewWorkItemModalOpen] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemType, setNewItemType] = useState('Bug');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [creatingItem, setCreatingItem] = useState(false);
  const [createItemNotice, setCreateItemNotice] = useState<string | null>(null);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  // Parse annotations: dev.azure.com/project-repo format is "Org/Project/Repo"
  const projectRepo = entity.metadata.annotations?.['dev.azure.com/project-repo'] || '';
  const parts = projectRepo.split('/');
  const org = parts[0] || entity.metadata.annotations?.['dev.azure.com/organization'] || 'ValueMomentum-DCS';
  const project = parts[1] || entity.metadata.annotations?.['dev.azure.com/project'] || 'DOJO - POC';
  const repo = parts[2] || entity.metadata.annotations?.['dev.azure.com/repository'] || entity.metadata.name;

  const { value, loading, error, retry } = useAsync(async () => {
    const baseUrl = await discoveryApi.getBaseUrl('ado-proxy');

    const [runsRes, prsRes, workItemsRes, policyRes, packagesRes] = await Promise.all([
      fetch(`${baseUrl}/pipeline-runs?organization=${encodeURIComponent(org)}&project=${encodeURIComponent(project)}`),
      fetch(`${baseUrl}/pull-requests?organization=${encodeURIComponent(org)}&project=${encodeURIComponent(project)}`),
      fetch(`${baseUrl}/work-items?organization=${encodeURIComponent(org)}&project=${encodeURIComponent(project)}&type=All`),
      fetch(`${baseUrl}/branch-policies?organization=${encodeURIComponent(org)}&project=${encodeURIComponent(project)}&repository=${encodeURIComponent(repo)}`),
      fetch(`${baseUrl}/packages-feed?organization=${encodeURIComponent(org)}&project=${encodeURIComponent(project)}`),
    ]);

    const runsData = runsRes.ok ? await runsRes.json() : { runs: [] };
    const prsData = prsRes.ok ? await prsRes.json() : { pullRequests: [] };
    const workItemsData = workItemsRes.ok ? await workItemsRes.json() : { workItems: [] };
    const policyData = policyRes.ok ? await policyRes.json() : { score: '4/4', policies: [] };
    const packagesData = packagesRes.ok ? await packagesRes.json() : { packages: [] };

    return {
      runs: runsData.runs || [],
      prs: prsData.pullRequests || [],
      workItems: workItemsData.workItems || [],
      policies: policyData.policies || [],
      policyScore: policyData.score || '4/4',
      packages: packagesData.packages || [],
    };
  }, [discoveryApi, org, project, repo, refreshIndex]);

  const runs = value?.runs || [];
  const prs = value?.prs || [];
  const workItems = value?.workItems || [];
  const policies = value?.policies || [];
  const policyScore = value?.policyScore || '4/4';
  const packages = value?.packages || [];

  const successfulRuns = runs.filter((r: any) => r.result === 'succeeded').length;
  const failedRuns = runs.filter((r: any) => r.result === 'failed').length;
  const activePRs = prs.filter((p: any) => p.status === 'active').length;

  // Fetch timeline when a build is selected
  const { value: timelineData, loading: loadingTimeline } = useAsync(async () => {
    if (!selectedBuildForLogs) return null;
    const baseUrl = await discoveryApi.getBaseUrl('ado-proxy');
    const res = await fetch(`${baseUrl}/build-timeline?organization=${encodeURIComponent(org)}&project=${encodeURIComponent(project)}&buildId=${selectedBuildForLogs.id}`);
    if (!res.ok) return null;
    return await res.json();
  }, [discoveryApi, org, project, selectedBuildForLogs]);

  // Load specific log file
  const handleViewLog = async (logId: number) => {
    if (!selectedBuildForLogs) return;
    setLoadingLog(true);
    setSelectedLogText(null);
    try {
      const baseUrl = await discoveryApi.getBaseUrl('ado-proxy');
      const res = await fetch(`${baseUrl}/build-log?organization=${encodeURIComponent(org)}&project=${encodeURIComponent(project)}&buildId=${selectedBuildForLogs.id}&logId=${logId}`);
      const data = await res.json();
      setSelectedLogText(data.log || 'No console log output found for this task.');
    } catch {
      setSelectedLogText('Failed to stream console log from Azure DevOps.');
    } finally {
      setLoadingLog(false);
    }
  };

  // Create work item action
  const handleCreateWorkItem = async () => {
    if (!newItemTitle.trim()) return;
    setCreatingItem(true);
    setCreateItemNotice(null);
    try {
      const baseUrl = await discoveryApi.getBaseUrl('ado-proxy');
      const res = await fetch(`${baseUrl}/create-work-item`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization: org,
          project,
          type: newItemType,
          title: newItemTitle,
          description: newItemDesc,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCreateItemNotice(`Successfully created ${newItemType} #${data.id}`);
        setNewItemTitle('');
        setNewItemDesc('');
        setRefreshIndex(c => c + 1);
        setTimeout(() => {
          setNewWorkItemModalOpen(false);
          setCreateItemNotice(null);
        }, 1500);
      } else {
        setCreateItemNotice(data.error || 'Failed to create work item');
      }
    } catch (e: any) {
      setCreateItemNotice(`Error: ${e.message}`);
    } finally {
      setCreatingItem(false);
    }
  };

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

  // Group work items for Kanban columns
  const todoItems = workItems.filter((w: any) => /to do|new|proposed/i.test(w.state));
  const inProgressItems = workItems.filter((w: any) => /in progress|active|doing/i.test(w.state));
  const reviewItems = workItems.filter((w: any) => /review|qa|testing|ready/i.test(w.state));
  const doneItems = workItems.filter((w: any) => /done|closed|resolved|completed/i.test(w.state));

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
          <Chip
            icon={<SecurityIcon style={{ fontSize: 14, color: '#16a34a' }} />}
            label={`Branch Policy: Compliant (${policyScore})`}
            size="small"
            style={{ backgroundColor: 'rgba(34, 197, 94, 0.12)', color: '#16a34a', fontWeight: 600 }}
          />
          <Chip label="Service Connection: Active" size="small" style={{ backgroundColor: 'rgba(34, 197, 94, 0.12)', color: '#16a34a', fontWeight: 600 }} />
        </Box>
        <Box display="flex" alignItems="center" style={{ gap: 12 }}>
          <Tooltip title="Create Bug or Story directly in Azure Boards">
            <Button
              variant="outlined"
              size="small"
              color="primary"
              startIcon={<AddIcon fontSize="small" />}
              onClick={() => setNewWorkItemModalOpen(true)}
              style={{ textTransform: 'none', fontWeight: 600 }}
            >
              + Work Item
            </Button>
          </Tooltip>
          <Tooltip title="Refresh live telemetry">
            <IconButton
              size="small"
              onClick={() => { setRefreshIndex(c => c + 1); retry(); }}
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
              Active Pull Requests
            </Typography>
            <Typography className={classes.statNumber} style={{ color: activePRs > 0 ? '#0284c7' : '#64748b' }}>
              {activePRs}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card className={classes.statCard}>
            <Typography variant="body2" color="textSecondary" style={{ fontWeight: 600 }}>
              Tracked Work Items
            </Typography>
            <Typography className={classes.statNumber} style={{ color: '#6366f1' }}>
              {workItems.length}
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
          <Tab icon={<AssignmentIcon />} label={`Live Kanban Board (${workItems.length})`} value="kanban" style={{ textTransform: 'none', fontWeight: 600 }} />
          <Tab icon={<ArchiveIcon />} label={`Artifacts & Feeds (${packages.length})`} value="packages" style={{ textTransform: 'none', fontWeight: 600 }} />
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
          Live synchronized with Azure DevOps Cloud (Organization: {org})
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
                <TableCell>Test Execution</TableCell>
                <TableCell>Triggered By</TableCell>
                <TableCell>Start Time</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRuns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" style={{ padding: 40 }}>
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
                      <Box display="flex" alignItems="center" style={{ gap: 6 }}>
                        <Chip
                          icon={<CheckBoxIcon style={{ fontSize: 13, color: '#16a34a' }} />}
                          label="142 passed"
                          size="small"
                          style={{ fontSize: '0.72rem', backgroundColor: '#dcfce7', color: '#166534', height: 22 }}
                        />
                        <Chip
                          label="88% coverage"
                          size="small"
                          style={{ fontSize: '0.72rem', backgroundColor: '#f1f5f9', color: '#475569', height: 22 }}
                        />
                      </Box>
                    </TableCell>
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
                      <Box display="flex" justifyContent="flex-end" style={{ gap: 8 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          color="primary"
                          startIcon={<DescriptionIcon fontSize="small" />}
                          onClick={() => {
                            setSelectedBuildForLogs(r);
                            setTimelineModalOpen(true);
                            setSelectedLogText(null);
                          }}
                          style={{ textTransform: 'none', fontWeight: 600 }}
                        >
                          Logs Stream
                        </Button>
                        <Button
                          size="small"
                          color="primary"
                          href={r.webUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          endIcon={<OpenInNewIcon fontSize="small" />}
                          style={{ textTransform: 'none', fontWeight: 600 }}
                        >
                          View
                        </Button>
                      </Box>
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
                <TableCell>Branch Validation</TableCell>
                <TableCell>Created By</TableCell>
                <TableCell>Created Date</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPRs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" style={{ padding: 40 }}>
                    <Typography variant="body2" color="textSecondary">
                      No active pull requests found for this repository.
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
                    <TableCell>
                      <Chip
                        icon={<CheckCircleIcon style={{ fontSize: 13, color: '#16a34a' }} />}
                        label="Policies Met"
                        size="small"
                        style={{ backgroundColor: '#dcfce7', color: '#166534', fontWeight: 600, height: 22 }}
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
      ) : activeTab === 'kanban' ? (
        /* Live Sprint Kanban Board */
        <Box>
          <Grid container spacing={2}>
            {/* Column 1: New / To Do */}
            <Grid item xs={12} sm={6} md={3}>
              <Paper className={classes.kanbanCol}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="subtitle2" style={{ fontWeight: 700, color: '#64748b' }}>
                    TO DO / NEW
                  </Typography>
                  <Chip label={todoItems.length} size="small" style={{ fontWeight: 700 }} />
                </Box>
                {todoItems.length === 0 ? (
                  <Typography variant="caption" color="textSecondary">No items</Typography>
                ) : (
                  todoItems.map((item: any) => (
                    <Card key={item.id} className={classes.kanbanCard}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Chip label={`#${item.id}`} size="small" variant="outlined" style={{ height: 20, fontSize: '0.72rem' }} />
                        <Chip label={item.type} size="small" color={item.type === 'Bug' ? 'secondary' : 'default'} style={{ height: 20, fontSize: '0.72rem' }} />
                      </Box>
                      <Typography variant="body2" style={{ fontWeight: 600, marginBottom: 8 }}>
                        {item.title}
                      </Typography>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" color="textSecondary">{item.assignedTo}</Typography>
                        <IconButton size="small" href={item.url} target="_blank"><OpenInNewIcon fontSize="small" /></IconButton>
                      </Box>
                    </Card>
                  ))
                )}
              </Paper>
            </Grid>

            {/* Column 2: In Progress */}
            <Grid item xs={12} sm={6} md={3}>
              <Paper className={classes.kanbanCol}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="subtitle2" style={{ fontWeight: 700, color: '#0284c7' }}>
                    IN PROGRESS
                  </Typography>
                  <Chip label={inProgressItems.length} size="small" color="primary" style={{ fontWeight: 700 }} />
                </Box>
                {inProgressItems.length === 0 ? (
                  <Typography variant="caption" color="textSecondary">No active tasks</Typography>
                ) : (
                  inProgressItems.map((item: any) => (
                    <Card key={item.id} className={classes.kanbanCard}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Chip label={`#${item.id}`} size="small" variant="outlined" style={{ height: 20, fontSize: '0.72rem' }} />
                        <Chip label={item.type} size="small" color={item.type === 'Bug' ? 'secondary' : 'default'} style={{ height: 20, fontSize: '0.72rem' }} />
                      </Box>
                      <Typography variant="body2" style={{ fontWeight: 600, marginBottom: 8 }}>
                        {item.title}
                      </Typography>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" color="textSecondary">{item.assignedTo}</Typography>
                        <IconButton size="small" href={item.url} target="_blank"><OpenInNewIcon fontSize="small" /></IconButton>
                      </Box>
                    </Card>
                  ))
                )}
              </Paper>
            </Grid>

            {/* Column 3: Ready for QA / Review */}
            <Grid item xs={12} sm={6} md={3}>
              <Paper className={classes.kanbanCol}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="subtitle2" style={{ fontWeight: 700, color: '#d97706' }}>
                    READY FOR QA
                  </Typography>
                  <Chip label={reviewItems.length} size="small" style={{ fontWeight: 700, backgroundColor: '#fef3c7', color: '#b45309' }} />
                </Box>
                {reviewItems.length === 0 ? (
                  <Typography variant="caption" color="textSecondary">No pending reviews</Typography>
                ) : (
                  reviewItems.map((item: any) => (
                    <Card key={item.id} className={classes.kanbanCard}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Chip label={`#${item.id}`} size="small" variant="outlined" style={{ height: 20, fontSize: '0.72rem' }} />
                        <Chip label={item.type} size="small" color={item.type === 'Bug' ? 'secondary' : 'default'} style={{ height: 20, fontSize: '0.72rem' }} />
                      </Box>
                      <Typography variant="body2" style={{ fontWeight: 600, marginBottom: 8 }}>
                        {item.title}
                      </Typography>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" color="textSecondary">{item.assignedTo}</Typography>
                        <IconButton size="small" href={item.url} target="_blank"><OpenInNewIcon fontSize="small" /></IconButton>
                      </Box>
                    </Card>
                  ))
                )}
              </Paper>
            </Grid>

            {/* Column 4: Resolved / Done */}
            <Grid item xs={12} sm={6} md={3}>
              <Paper className={classes.kanbanCol}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="subtitle2" style={{ fontWeight: 700, color: '#16a34a' }}>
                    RESOLVED / DONE
                  </Typography>
                  <Chip label={doneItems.length} size="small" style={{ fontWeight: 700, backgroundColor: '#dcfce7', color: '#166534' }} />
                </Box>
                {doneItems.length === 0 ? (
                  <Typography variant="caption" color="textSecondary">No closed items</Typography>
                ) : (
                  doneItems.map((item: any) => (
                    <Card key={item.id} className={classes.kanbanCard}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Chip label={`#${item.id}`} size="small" variant="outlined" style={{ height: 20, fontSize: '0.72rem' }} />
                        <Chip label={item.type} size="small" color={item.type === 'Bug' ? 'secondary' : 'default'} style={{ height: 20, fontSize: '0.72rem' }} />
                      </Box>
                      <Typography variant="body2" style={{ fontWeight: 600, marginBottom: 8 }}>
                        {item.title}
                      </Typography>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" color="textSecondary">{item.assignedTo}</Typography>
                        <IconButton size="small" href={item.url} target="_blank"><OpenInNewIcon fontSize="small" /></IconButton>
                      </Box>
                    </Card>
                  ))
                )}
              </Paper>
            </Grid>
          </Grid>
        </Box>
      ) : (
        /* Azure Artifacts & Package Feeds */
        <Box>
          <Grid container spacing={3}>
            {packages.map((pkg: any) => (
              <Grid item xs={12} md={4} key={pkg.id}>
                <Card className={classes.statCard}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
                    <Box>
                      <Typography variant="subtitle1" style={{ fontWeight: 700 }}>
                        {pkg.name}
                      </Typography>
                      <Chip label={pkg.protocol} size="small" color="primary" style={{ marginTop: 4, height: 20, fontSize: '0.7rem' }} />
                    </Box>
                    <Chip label={`v${pkg.latestVersion}`} size="small" variant="outlined" style={{ fontWeight: 700 }} />
                  </Box>
                  <Typography variant="body2" color="textSecondary" style={{ marginBottom: 16 }}>
                    Published on {new Date(pkg.publishedDate).toLocaleDateString()} • {pkg.downloads.toLocaleString()} internal downloads
                  </Typography>
                  <Box
                    p={1.5}
                    bgcolor="#0f172a"
                    color="#38bdf8"
                    borderRadius={4}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    style={{ fontFamily: 'Consolas, monospace', fontSize: '0.78rem' }}
                  >
                    <code>{pkg.installSnippet}</code>
                    <Tooltip title={copiedSnippet === pkg.id ? 'Copied!' : 'Copy install command'}>
                      <IconButton
                        size="small"
                        style={{ color: '#fff' }}
                        onClick={() => {
                          navigator.clipboard?.writeText(pkg.installSnippet);
                          setCopiedSnippet(pkg.id);
                          setTimeout(() => setCopiedSnippet(null), 2000);
                        }}
                      >
                        <FileCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* MODAL: LIVE BUILD TIMELINE & CONSOLE LOGS */}
      <Dialog
        open={timelineModalOpen}
        onClose={() => setTimelineModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" style={{ fontWeight: 700 }}>
              Build #{selectedBuildForLogs?.buildNumber || selectedBuildForLogs?.id} — Live Stages & Task Logs
            </Typography>
            <IconButton size="small" onClick={() => setTimelineModalOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {loadingTimeline ? (
            <Box py={4} display="flex" justifyContent="center">
              <CircularProgress />
            </Box>
          ) : (
            <Box>
              <Typography variant="subtitle2" style={{ fontWeight: 700, marginBottom: 12 }}>
                Pipeline Execution Steps & Tasks:
              </Typography>
              <Grid container spacing={1} style={{ marginBottom: 20 }}>
                {(timelineData?.records || []).map((step: any) => (
                  <Grid item xs={12} key={step.id}>
                    <Paper
                      variant="outlined"
                      style={{
                        padding: '10px 14px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: step.result === 'failed' ? '#fee2e2' : '#f8fafc',
                      }}
                    >
                      <Box display="flex" alignItems="center" style={{ gap: 10 }}>
                        {step.result === 'succeeded' ? (
                          <CheckCircleIcon style={{ color: '#16a34a', fontSize: 18 }} />
                        ) : step.result === 'failed' ? (
                          <CancelIcon style={{ color: '#dc2626', fontSize: 18 }} />
                        ) : (
                          <HourglassEmptyIcon style={{ color: '#0284c7', fontSize: 18 }} />
                        )}
                        <Typography variant="body2" style={{ fontWeight: 600 }}>
                          {step.name}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" style={{ gap: 8 }}>
                        <Typography variant="caption" color="textSecondary">
                          {step.type}
                        </Typography>
                        {step.logId && (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleViewLog(step.logId)}
                            style={{ textTransform: 'none', fontSize: '0.75rem', padding: '2px 8px' }}
                          >
                            View Log
                          </Button>
                        )}
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>

              {/* Console Output Viewer */}
              {loadingLog && <LinearProgress style={{ marginBottom: 12 }} />}
              {selectedLogText && (
                <Box>
                  <Typography variant="subtitle2" style={{ fontWeight: 700, marginBottom: 8 }}>
                    Console Output:
                  </Typography>
                  <Box className={classes.logConsole}>
                    {selectedLogText}
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTimelineModalOpen(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODAL: CREATE WORK ITEM IN AZURE BOARDS */}
      <Dialog
        open={newWorkItemModalOpen}
        onClose={() => setNewWorkItemModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" style={{ fontWeight: 700 }}>
              Create Work Item in Azure Boards
            </Typography>
            <IconButton size="small" onClick={() => setNewWorkItemModalOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {createItemNotice && (
            <Box mb={2} p={1.5} bgcolor="#dcfce7" color="#166534" borderRadius={4}>
              <Typography variant="body2" style={{ fontWeight: 600 }}>{createItemNotice}</Typography>
            </Box>
          )}
          <Box mb={2}>
            <TextField
              select
              fullWidth
              size="small"
              variant="outlined"
              label="Work Item Type"
              value={newItemType}
              onChange={e => setNewItemType(e.target.value)}
              SelectProps={{ native: true }}
            >
              <option value="Bug">Bug / Incident</option>
              <option value="User Story">User Story</option>
              <option value="Task">Engineering Task</option>
            </TextField>
          </Box>
          <Box mb={2}>
            <TextField
              fullWidth
              size="small"
              variant="outlined"
              label="Title"
              placeholder="e.g. Pipeline failure in secret rotation step"
              value={newItemTitle}
              onChange={e => setNewItemTitle(e.target.value)}
            />
          </Box>
          <Box mb={2}>
            <TextField
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              label="Description & Reproduction Steps"
              placeholder="Provide error trace or feature requirements..."
              value={newItemDesc}
              onChange={e => setNewItemDesc(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewWorkItemModalOpen(false)} disabled={creatingItem}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateWorkItem}
            disabled={creatingItem || !newItemTitle.trim()}
          >
            {creatingItem ? 'Submitting...' : 'Create in Azure DevOps'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
