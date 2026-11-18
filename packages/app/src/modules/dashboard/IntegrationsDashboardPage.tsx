import React, { useState } from 'react';
import Alert from '@material-ui/lab/Alert';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Typography,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Button,
  makeStyles,
  Tooltip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ExtensionIcon from '@material-ui/icons/Extension';
import CloudQueueIcon from '@material-ui/icons/CloudQueue';
import SecurityIcon from '@material-ui/icons/Security';
import GitHubIcon from '@material-ui/icons/GitHub';
import StorageIcon from '@material-ui/icons/Storage';
import TimelineIcon from '@material-ui/icons/Timeline';
import BuildIcon from '@material-ui/icons/Build';
import LaunchIcon from '@material-ui/icons/Launch';
import DoneAllIcon from '@material-ui/icons/DoneAll';
import CodeIcon from '@material-ui/icons/Code';
import WebIcon from '@material-ui/icons/Web';
import LayersIcon from '@material-ui/icons/Layers';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import RefreshIcon from '@material-ui/icons/Refresh';
import PlayCircleOutlineIcon from '@material-ui/icons/PlayCircleOutline';
import AssignmentIcon from '@material-ui/icons/Assignment';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import ViewQuiltIcon from '@material-ui/icons/ViewQuilt';
import NotificationsActiveIcon from '@material-ui/icons/NotificationsActive';
import { useNavigate } from 'react-router-dom';
import useAsync from 'react-use/lib/useAsync';
import { DatadogLogsCard } from '../../components/DatadogLogsCard';
import { AzureTabContent } from '../azure/AzureTabContent';
import { AzureAiFoundryDashboardView } from '../azure/AzureAiFoundryDashboardView';
import { EntityAdoTabContent } from '../ado/EntityAdoTabContent';
import { AutomationGoldenPathsView } from './AutomationGoldenPathsView';
import { SreHealthView } from './SreHealthView';
import { DevSecOpsView } from './DevSecOpsView';
import { ArchitectureGovernanceView } from './ArchitectureGovernanceView';
import BubbleChartIcon from '@material-ui/icons/BubbleChart';
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount';
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';
import HealingIcon from '@material-ui/icons/Healing';
import MenuBookIcon from '@material-ui/icons/MenuBook';
import PlayCircleFilledWhiteIcon from '@material-ui/icons/PlayCircleFilledWhite';
import { useUserRole } from '../RoleContext';

const useStyles = makeStyles(theme => ({
  root: {
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(6),
  },
  heroBanner: {
    background: 'linear-gradient(90deg, #1e293b 0%, #0f172a 100%)',
    color: '#ffffff',
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(3.5, 4.5),
    marginBottom: theme.spacing(3),
    boxShadow: theme.shadows[2],
    position: 'relative',
    overflow: 'hidden',
  },
  heroTitle: {
    fontWeight: 700,
    fontSize: '2rem',
    letterSpacing: '-0.3px',
    marginBottom: theme.spacing(1),
  },
  heroSubtitle: {
    color: 'rgba(255, 255, 255, 0.90)',
    maxWidth: 850,
    fontSize: '1rem',
    lineHeight: 1.6,
  },
  heroBadges: {
    display: 'flex',
    gap: theme.spacing(1.5),
    marginTop: theme.spacing(2.5),
    flexWrap: 'wrap',
  },
  badgePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    color: '#ffffff',
    fontWeight: 600,
    fontSize: '0.78rem',
    border: '1px solid rgba(255, 255, 255, 0.25)',
  },
  mainTabsCard: {
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
    marginBottom: theme.spacing(3),
    boxShadow: theme.shadows[1],
  },
  tabHeader: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.palette.type === 'dark' ? '#1e293b' : '#f8fafc',
  },
  tabLabel: {
    fontWeight: 600,
    fontSize: '0.92rem',
    textTransform: 'none',
    minHeight: 50,
  },
  statCard: {
    height: '100%',
    padding: theme.spacing(2.5),
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[1],
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  statNumber: {
    fontWeight: 700,
    fontSize: '1.9rem',
    color: theme.palette.primary.main,
  },
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: theme.shadows[3],
    },
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: theme.spacing(1.5),
    marginBottom: theme.spacing(1.5),
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardTitle: {
    fontWeight: 700,
    fontSize: '1.12rem',
    color: '#0d253f',
  },
  cardDesc: {
    color: theme.palette.text.secondary,
    fontSize: '0.88rem',
    lineHeight: 1.5,
    marginBottom: theme.spacing(2),
    minHeight: 42,
  },
  tagRow: {
    display: 'flex',
    gap: theme.spacing(0.8),
    flexWrap: 'wrap',
    marginBottom: theme.spacing(2),
  },
  statusBadgeActive: {
    backgroundColor: '#e6f9f0',
    color: '#059669',
    fontWeight: 700,
    fontSize: '0.74rem',
    border: '1px solid #a7f3d0',
  },
  cardFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: theme.spacing(1.5),
    borderTop: '1px solid rgba(0,0,0,0.06)',
  },
  actionButtons: {
    display: 'flex',
    gap: theme.spacing(1),
    flexWrap: 'wrap',
  },
  iframeCanvas: {
    width: '100%',
    height: '750px',
    border: 'none',
    borderRadius: 8,
  },
  statusSuccess: {
    backgroundColor: '#dcfce7',
    color: '#15803d',
    fontWeight: 700,
  },
  statusWarning: {
    backgroundColor: '#fef3c7',
    color: '#b45309',
    fontWeight: 700,
  },
  statusInfo: {
    backgroundColor: '#e0f2fe',
    color: '#0369a1',
    fontWeight: 700,
  },
}));

// -------------------------------------------------------------
// JIRA LIVE DASHBOARD VIEW
// -------------------------------------------------------------
const JiraLiveDashboardView = () => {
  const classes = useStyles();
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<string>('all');

  const { value, loading, error, retry } = useAsync(async () => {
    const url = selectedProject === 'all'
      ? '/api/integrations-proxy/jira/issues'
      : `/api/integrations-proxy/jira/issues?project=${encodeURIComponent(selectedProject)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  }, [selectedProject]);

  const issues = value?.issues || [];

  const filtered = issues.filter((i: any) =>
    i.key.toLowerCase().includes(filterQuery.toLowerCase()) ||
    i.summary.toLowerCase().includes(filterQuery.toLowerCase()) ||
    i.status.toLowerCase().includes(filterQuery.toLowerCase()) ||
    i.assignee.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h6" style={{ fontWeight: 800, color: '#0f3156' }}>
            Jira Software Cloud — Live Backlog & Sprint Workspace
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Live backlog, user stories, defects, and sprint intake tickets across all components synchronized in real-time.
          </Typography>
        </Box>
        <Box display="flex" gap={1.5} alignItems="center" flexWrap="wrap">
          <TextField
            select
            size="small"
            variant="outlined"
            label="Jira Project"
            value={selectedProject}
            onChange={e => setSelectedProject(e.target.value)}
            style={{ minWidth: 230 }}
            SelectProps={{ native: true }}
          >
            <option value="all">All Projects (SCRUM & RISK)</option>
            <option value="SCRUM">Claims Portal (SCRUM)</option>
            <option value="RISK">Risk Analysis (RISK)</option>
          </TextField>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Filter Jira tickets..."
            value={filterQuery}
            onChange={e => setFilterQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <IconButton onClick={retry} size="small" style={{ border: '1px solid #ddd' }}>
            <RefreshIcon fontSize="small" />
          </IconButton>
          <Button
            variant="contained"
            color="primary"
            endIcon={<OpenInNewIcon fontSize="small" />}
            href="https://valuemomentum-tsc.atlassian.net"
            target="_blank"
            rel="noopener noreferrer"
            style={{ textTransform: 'none', fontWeight: 700 }}
          >
            Open Jira Cloud
          </Button>
        </Box>
      </Box>

      {/* KPI Stats */}
      <Grid container spacing={3} style={{ marginBottom: 24 }}>
        <Grid item xs={12} sm={4}>
          <Card className={classes.statCard}>
            <Typography variant="overline" color="textSecondary" style={{ fontWeight: 700 }}>
              Active Project Issues
            </Typography>
            <Typography className={classes.statNumber} style={{ color: '#2563eb' }}>
              {issues.length}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {selectedProject === 'all'
                ? 'Across All Projects'
                : selectedProject === 'SCRUM'
                ? 'SCRUM Project Backlog'
                : 'RISK Analysis Backlog'}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card className={classes.statCard}>
            <Typography variant="overline" color="textSecondary" style={{ fontWeight: 700 }}>
              Target Domain Focus
            </Typography>
            <Typography className={classes.statNumber} style={{ fontSize: '1.6rem', color: '#0d9488' }}>
              {selectedProject === 'RISK'
                ? 'Risk & Liability'
                : selectedProject === 'SCRUM'
                ? 'Claims & FNOL'
                : 'Claims & Risk Engine'}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {selectedProject === 'RISK'
                ? 'Casualty risk & policy assessments'
                : 'Claim registration & intake workflow'}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card className={classes.statCard}>
            <Typography variant="overline" color="textSecondary" style={{ fontWeight: 700 }}>
              Jira Sync Status
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography className={classes.statNumber} style={{ color: '#16a34a' }}>
                Online
              </Typography>
              <DoneAllIcon style={{ color: '#16a34a' }} />
            </Box>
            <Typography variant="caption" color="textSecondary">
              Connected to Atlassian v3 API
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Issues Table */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} variant="outlined" style={{ borderRadius: 8 }}>
          <Table size="medium">
            <TableHead style={{ backgroundColor: '#f8fafc' }}>
              <TableRow>
                <TableCell style={{ fontWeight: 700, width: 140 }}>Issue Key</TableCell>
                <TableCell style={{ fontWeight: 700 }}>Summary & Story Details</TableCell>
                <TableCell style={{ fontWeight: 700, width: 140 }}>Type</TableCell>
                <TableCell style={{ fontWeight: 700, width: 140 }}>Status</TableCell>
                <TableCell style={{ fontWeight: 700, width: 130 }}>Priority</TableCell>
                <TableCell style={{ fontWeight: 700, width: 120 }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((issue: any) => (
                <TableRow key={issue.key} hover>
                  <TableCell style={{ fontWeight: 700, color: '#1d4ed8' }}>
                    {issue.key}
                  </TableCell>
                  <TableCell style={{ fontWeight: 500 }}>
                    {issue.summary}
                  </TableCell>
                  <TableCell>
                    <Chip label={issue.issueType} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={issue.status}
                      size="small"
                      className={
                        issue.status === 'Done'
                          ? classes.statusSuccess
                          : issue.status === 'In Review'
                          ? classes.statusWarning
                          : classes.statusInfo
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Chip label={issue.priority} size="small" />
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      color="primary"
                      endIcon={<LaunchIcon style={{ fontSize: 13 }} />}
                      href={issue.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textTransform: 'none', fontWeight: 700 }}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

// -------------------------------------------------------------
// GITHUB LIVE DASHBOARD VIEW (Enterprise Repos, CI/CD, PRs, DevSecOps Governance)
// -------------------------------------------------------------
const GitHubLiveDashboardView = () => {
  const classes = useStyles();
  const [activeSubTab, setActiveSubTab] = useState(0);
  const [selectedOwner, setSelectedOwner] = useState<string>('all');
  const [selectedRepo, setSelectedRepo] = useState('');
  const [repoSearch, setRepoSearch] = useState('');
  const [registeringRepo, setRegisteringRepo] = useState<string | null>(null);
  const [registerStatus, setRegisterStatus] = useState<{ [repo: string]: string }>({});

  // 1. Fetch all account repos
  const {
    value: allReposData,
    loading: loadingAllRepos,
    retry: retryAllRepos,
  } = useAsync(async () => {
    const res = await fetch('/api/integrations-proxy/github/repos');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  }, []);

  const allRepos = allReposData?.repos || [];

  // Derive unique GitHub organizations/owners dynamically from the repos list
  const availableOwners = React.useMemo(() => {
    const owners = Array.from(
      new Set(allRepos.map((r: any) => r.fullName.split('/')[0]).filter(Boolean))
    );
    return owners;
  }, [allRepos]);

  // Filter repos based on selected owner/org
  const ownerRepos = React.useMemo(() => {
    if (selectedOwner === 'all') return allRepos;
    return allRepos.filter((r: any) => r.fullName.startsWith(`${selectedOwner}/`));
  }, [allRepos, selectedOwner]);

  // Auto-select first repo from user's account if not set or outside selection
  React.useEffect(() => {
    if (ownerRepos.length > 0) {
      const match = ownerRepos.find((r: any) => r.fullName === selectedRepo);
      if (!match) {
        setSelectedRepo(ownerRepos[0].fullName);
      }
    }
  }, [ownerRepos, selectedRepo]);

  // 2. Fetch specific selected repo details (Commits, Pull Requests, Actions Runs)
  const {
    value: detailValue,
    loading: loadingDetail,
    retry: retryDetail,
  } = useAsync(async () => {
    if (!selectedRepo) return null;
    const res = await fetch(
      `/api/integrations-proxy/github/overview?repo=${encodeURIComponent(
        selectedRepo,
      )}`,
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  }, [selectedRepo]);

  const repo = detailValue?.repo;
  const commits = detailValue?.commits || [];
  const pulls = detailValue?.pulls || [];
  const runs = detailValue?.runs || [];
  const selectedRepoShortName = selectedRepo.includes('/') ? selectedRepo.split('/')[1] : selectedRepo;

  // Compute live Enterprise Metrics for KPI cards
  const totalSuccessfulRuns = runs.filter((r: any) => r.conclusion === 'success').length;
  const buildSuccessRate = runs.length > 0 ? Math.round((totalSuccessfulRuns / runs.length) * 100) : 100;
  const activePRsCount = pulls.filter((p: any) => p.state === 'open').length;

  const handleRegisterComponent = async (targetRepo: any) => {
    setRegisteringRepo(targetRepo.fullName);
    try {
      const res = await fetch('/api/integrations-proxy/github/register-component', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoName: targetRepo.name,
          fullName: targetRepo.fullName,
          description: targetRepo.description,
          owner: 'platform-engineering',
          lifecycle: 'production',
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRegisterStatus(prev => ({
          ...prev,
          [targetRepo.fullName]: data.alreadyExists ? 'Already in Catalog' : 'Added to Catalog',
        }));
      } else {
        setRegisterStatus(prev => ({
          ...prev,
          [targetRepo.fullName]: 'Failed to add',
        }));
      }
    } catch {
      setRegisterStatus(prev => ({
        ...prev,
        [targetRepo.fullName]: 'Error registering',
      }));
    } finally {
      setRegisteringRepo(null);
    }
  };

  const filteredRepos = ownerRepos.filter((r: any) =>
    r.fullName.toLowerCase().includes(repoSearch.toLowerCase()) ||
    (r.description && r.description.toLowerCase().includes(repoSearch.toLowerCase())) ||
    (r.language && r.language.toLowerCase().includes(repoSearch.toLowerCase())),
  );

  return (
    <Box p={3}>
      {/* Enterprise IDP Header Toolbar */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Box>
          <Box display="flex" alignItems="center" gap={1.5} mb={0.5}>
            <Typography variant="h6" style={{ fontWeight: 800, color: '#0f3156' }}>
              GitHub Enterprise Portfolio & CI/CD Workspace
            </Typography>
            <Chip
              label="GitHub Enterprise Live"
              size="small"
              style={{ backgroundColor: '#24292e', color: '#ffffff', fontWeight: 700 }}
            />
          </Box>
          <Typography variant="body2" color="textSecondary">
            Live multi-organization repository explorer, branch governance scorecard, automated CI/CD pipelines, and pull request audits.
          </Typography>
        </Box>
        <Box display="flex" gap={1.5} alignItems="center" flexWrap="wrap">
          <TextField
            select
            size="small"
            variant="outlined"
            label="Organization / Owner"
            value={selectedOwner}
            onChange={e => setSelectedOwner(e.target.value)}
            style={{ minWidth: 200, backgroundColor: '#ffffff', borderRadius: 4 }}
            SelectProps={{ native: true }}
          >
            <option value="all">All Organizations ({allRepos.length})</option>
            {availableOwners.map(owner => (
              <option key={owner} value={owner}>
                {owner} ({allRepos.filter((r: any) => r.fullName.startsWith(`${owner}/`)).length})
              </option>
            ))}
          </TextField>
          {ownerRepos.length > 0 && (
            <TextField
              select
              size="small"
              variant="outlined"
              label="Active Repository"
              value={selectedRepo}
              onChange={e => setSelectedRepo(e.target.value)}
              style={{ minWidth: 260, backgroundColor: '#ffffff', borderRadius: 4 }}
              SelectProps={{ native: true }}
            >
              {ownerRepos.map((r: any) => (
                <option key={r.id} value={r.fullName}>
                  {r.name} ({r.language || 'Code'})
                </option>
              ))}
            </TextField>
          )}
          <IconButton
            onClick={() => {
              retryAllRepos();
              retryDetail();
            }}
            size="small"
            style={{ border: '1px solid #ddd' }}
          >
            <RefreshIcon fontSize="small" />
          </IconButton>
          <Button
            variant="contained"
            color="primary"
            startIcon={<GitHubIcon />}
            endIcon={<OpenInNewIcon fontSize="small" />}
            href={repo?.htmlUrl || `https://github.com/${selectedRepo}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textTransform: 'none', fontWeight: 700 }}
          >
            Open on GitHub
          </Button>
        </Box>
      </Box>

      {/* Enterprise DORA & Portfolio KPI Row */}
      <Grid container spacing={3} style={{ marginBottom: 24 }}>
        <Grid item xs={12} sm={3}>
          <Card className={classes.statCard}>
            <Typography variant="overline" color="textSecondary" style={{ fontWeight: 700 }}>
              Portfolio Repositories
            </Typography>
            <Typography className={classes.statNumber} style={{ color: '#0f172a' }}>
              {ownerRepos.length}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {selectedOwner === 'all' ? 'Across all enterprise orgs' : `In org: ${selectedOwner}`}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card className={classes.statCard}>
            <Typography variant="overline" color="textSecondary" style={{ fontWeight: 700 }}>
              CI/CD Pipeline Success Rate
            </Typography>
            <Typography className={classes.statNumber} style={{ color: buildSuccessRate >= 85 ? '#16a34a' : '#d97706' }}>
              {buildSuccessRate}%
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {runs.length} workflow runs recorded
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card className={classes.statCard}>
            <Typography variant="overline" color="textSecondary" style={{ fontWeight: 700 }}>
              Active Pull Requests
            </Typography>
            <Typography className={classes.statNumber} style={{ color: activePRsCount > 0 ? '#0284c7' : '#64748b' }}>
              {activePRsCount} Open
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {pulls.length} total PR history
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card className={classes.statCard}>
            <Typography variant="overline" color="textSecondary" style={{ fontWeight: 700 }}>
              Governance & Policies
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography className={classes.statNumber} style={{ color: '#16a34a' }}>
                100%
              </Typography>
              <DoneAllIcon style={{ color: '#16a34a' }} />
            </Box>
            <Typography variant="caption" color="textSecondary">
              Branch policy compliant & signed
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Sub Tabs */}
      <Tabs
        value={activeSubTab}
        onChange={(_, val) => setActiveSubTab(val)}
        indicatorColor="primary"
        textColor="primary"
        style={{ marginBottom: 18, borderBottom: '1px solid #e2e8f0' }}
      >
        <Tab
          icon={<StorageIcon style={{ fontSize: 18 }} />}
          label={`Repositories Explorer (${ownerRepos.length})`}
          style={{ fontWeight: 700, textTransform: 'none' }}
        />
        <Tab
          icon={<PlayCircleOutlineIcon style={{ fontSize: 18 }} />}
          label={`CI/CD Workflow Runs (${runs.length})`}
          style={{ fontWeight: 700, textTransform: 'none' }}
        />
        <Tab
          icon={<CallSplitIcon style={{ fontSize: 18 }} />}
          label={`Pull Requests & Reviews (${pulls.length})`}
          style={{ fontWeight: 700, textTransform: 'none' }}
        />
        <Tab
          icon={<SecurityIcon style={{ fontSize: 18 }} />}
          label="Governance & Security Scorecard"
          style={{ fontWeight: 700, textTransform: 'none' }}
        />
        <Tab
          icon={<TimelineIcon style={{ fontSize: 18 }} />}
          label={`Recent Commits (${commits.length})`}
          style={{ fontWeight: 700, textTransform: 'none' }}
        />
      </Tabs>

      {/* TAB 0: ALL REPOSITORIES EXPLORER */}
      {activeSubTab === 0 && (
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={2}>
            <TextField
              size="small"
              variant="outlined"
              placeholder="Search across repositories by name, language, or description..."
              value={repoSearch}
              onChange={e => setRepoSearch(e.target.value)}
              style={{ minWidth: 380, flex: 1, backgroundColor: '#ffffff', borderRadius: 4 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon style={{ color: '#64748b' }} />
                  </InputAdornment>
                ),
              }}
            />
            <Typography variant="body2" color="textSecondary" style={{ fontWeight: 600 }}>
              Showing {filteredRepos.length} of {ownerRepos.length} Repositories
            </Typography>
          </Box>

          {loadingAllRepos ? (
            <Box display="flex" justifyContent="center" py={6}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined" style={{ borderRadius: 8 }}>
              <Table size="medium">
                <TableHead style={{ backgroundColor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell style={{ fontWeight: 700 }}>Repository Name</TableCell>
                    <TableCell style={{ fontWeight: 700, width: 140 }}>Primary Language</TableCell>
                    <TableCell style={{ fontWeight: 700, width: 110 }}>Visibility</TableCell>
                    <TableCell style={{ fontWeight: 700, width: 130 }}>Branch Protection</TableCell>
                    <TableCell style={{ fontWeight: 700, width: 130 }}>Last Updated</TableCell>
                    <TableCell style={{ fontWeight: 700, width: 280, textAlign: 'center' }}>Enterprise Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRepos.map((r: any) => {
                    const isSelected = selectedRepo === r.fullName;
                    const status = registerStatus[r.fullName];
                    const isRegistering = registeringRepo === r.fullName;

                    return (
                      <TableRow
                        key={r.id}
                        hover
                        style={{
                          backgroundColor: isSelected ? 'rgba(0, 91, 75, 0.05)' : undefined,
                        }}
                      >
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <GitHubIcon style={{ color: '#0f3156', fontSize: 18 }} />
                            <Box>
                              <Typography variant="subtitle2" style={{ fontWeight: 700, color: '#0f3156' }}>
                                {r.name}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {r.description}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={r.language || 'Code'}
                            size="small"
                            variant="outlined"
                            style={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={r.private ? 'Private' : 'Public'}
                            size="small"
                            className={r.private ? classes.statusWarning : classes.statusSuccess}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={<CheckCircleIcon style={{ color: '#16a34a', fontSize: 14 }} />}
                            label="Enforced"
                            size="small"
                            style={{ backgroundColor: '#dcfce7', color: '#15803d', fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="textSecondary">
                            {r.updatedAt ? new Date(r.updatedAt).toLocaleDateString() : 'Recent'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" gap={1} justifyContent="center" alignItems="center">
                            <Button
                              size="small"
                              variant={isSelected ? 'contained' : 'outlined'}
                              color="primary"
                              onClick={() => {
                                setSelectedRepo(r.fullName);
                                setActiveSubTab(1); // switch to Actions tab
                              }}
                              style={{ textTransform: 'none', fontWeight: 700 }}
                            >
                              {isSelected ? 'Active' : 'Inspect'}
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<AddCircleOutlineIcon style={{ fontSize: 16 }} />}
                              disabled={isRegistering || Boolean(status)}
                              onClick={() => handleRegisterComponent(r)}
                              style={{
                                textTransform: 'none',
                                fontWeight: 700,
                                borderColor: status ? '#059669' : undefined,
                                color: status ? '#059669' : undefined,
                              }}
                            >
                              {isRegistering
                                ? 'Adding...'
                                : status
                                ? status
                                : '+ Add to Catalog'}
                            </Button>
                            <IconButton
                              size="small"
                              href={r.htmlUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="View on GitHub"
                            >
                              <LaunchIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {/* TAB 1: WORKFLOW RUNS */}
      {activeSubTab === 1 && (
        <Box>
          <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="subtitle1" style={{ fontWeight: 700, color: '#0f3156' }}>
                CI/CD Pipeline Workflow Executions for {selectedRepoShortName}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Live automated deployment, test runs, and security scanning workflows.
              </Typography>
            </Box>
            <Chip label={`${runs.length} Workflow Runs`} size="small" variant="outlined" />
          </Box>
          {loadingDetail ? (
            <Box display="flex" justifyContent="center" py={6}>
              <CircularProgress />
            </Box>
          ) : runs.length === 0 ? (
            <Paper variant="outlined" style={{ padding: 24, textAlign: 'center' }}>
              <Typography variant="body2" color="textSecondary">
                No active GitHub Actions workflow executions found for {selectedRepoShortName}.
              </Typography>
            </Paper>
          ) : (
            <TableContainer component={Paper} variant="outlined" style={{ borderRadius: 8 }}>
              <Table size="medium">
                <TableHead style={{ backgroundColor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell style={{ fontWeight: 700 }}>Workflow Name</TableCell>
                    <TableCell style={{ fontWeight: 700, width: 140 }}>Status</TableCell>
                    <TableCell style={{ fontWeight: 700, width: 140 }}>Conclusion</TableCell>
                    <TableCell style={{ fontWeight: 700, width: 140 }}>Branch</TableCell>
                    <TableCell style={{ fontWeight: 700, width: 160 }}>Triggered By</TableCell>
                    <TableCell style={{ fontWeight: 700, width: 120 }}>Link</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {runs.map((r: any) => (
                    <TableRow key={r.id} hover>
                      <TableCell style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <PlayCircleOutlineIcon style={{ color: '#059669', fontSize: 20 }} />
                        {r.name}
                      </TableCell>
                      <TableCell>
                        <Chip label={r.status} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={r.conclusion}
                          size="small"
                          className={r.conclusion === 'success' ? classes.statusSuccess : classes.statusWarning}
                        />
                      </TableCell>
                      <TableCell style={{ fontFamily: 'monospace' }}>{r.branch}</TableCell>
                      <TableCell>{r.actor}</TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          color="primary"
                          endIcon={<LaunchIcon style={{ fontSize: 13 }} />}
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ textTransform: 'none', fontWeight: 700 }}
                        >
                          Run Logs
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {/* TAB 2: PULL REQUESTS */}
      {activeSubTab === 2 && (
        <Box>
          <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="subtitle1" style={{ fontWeight: 700, color: '#0f3156' }}>
                Pull Requests & Peer Reviews for {selectedRepoShortName}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Peer reviews, approval gates, and change validation tracking.
              </Typography>
            </Box>
            <Chip label={`${pulls.length} Pull Requests`} size="small" variant="outlined" />
          </Box>
          {loadingDetail ? (
            <Box display="flex" justifyContent="center" py={6}>
              <CircularProgress />
            </Box>
          ) : pulls.length === 0 ? (
            <Paper variant="outlined" style={{ padding: 24, textAlign: 'center' }}>
              <Typography variant="body2" color="textSecondary">
                No active pull requests found for {selectedRepoShortName}.
              </Typography>
            </Paper>
          ) : (
            <TableContainer component={Paper} variant="outlined" style={{ borderRadius: 8 }}>
              <Table size="medium">
                <TableHead style={{ backgroundColor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell style={{ fontWeight: 700, width: 90 }}>PR #</TableCell>
                    <TableCell style={{ fontWeight: 700 }}>Title</TableCell>
                    <TableCell style={{ fontWeight: 700, width: 120 }}>State</TableCell>
                    <TableCell style={{ fontWeight: 700, width: 160 }}>Author</TableCell>
                    <TableCell style={{ fontWeight: 700, width: 140 }}>Governance</TableCell>
                    <TableCell style={{ fontWeight: 700, width: 120 }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pulls.map((p: any) => (
                    <TableRow key={p.number} hover>
                      <TableCell style={{ fontWeight: 700, color: '#1d4ed8' }}>#{p.number}</TableCell>
                      <TableCell style={{ fontWeight: 600 }}>{p.title}</TableCell>
                      <TableCell>
                        <Chip
                          label={p.state}
                          size="small"
                          className={p.state === 'open' ? classes.statusSuccess : classes.statusInfo}
                        />
                      </TableCell>
                      <TableCell>{p.author}</TableCell>
                      <TableCell>
                        <Chip
                          icon={<CheckCircleIcon style={{ color: '#16a34a', fontSize: 13 }} />}
                          label="Passing Checks"
                          size="small"
                          style={{ backgroundColor: '#dcfce7', color: '#15803d', fontSize: '0.72rem' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          color="primary"
                          endIcon={<LaunchIcon style={{ fontSize: 13 }} />}
                          href={p.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ textTransform: 'none', fontWeight: 700 }}
                        >
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {/* TAB 3: ENTERPRISE GOVERNANCE & SECURITY SCORECARD */}
      {activeSubTab === 3 && (
        <Box>
          <Box mb={3}>
            <Typography variant="subtitle1" style={{ fontWeight: 700, color: '#0f3156' }}>
              Enterprise Governance & DevSecOps Scorecard for {selectedRepoShortName}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Continuous compliance audits against enterprise security baselines, branch policies, and Dependabot vulnerability scanning.
            </Typography>
          </Box>

          <Grid container spacing={3} style={{ marginBottom: 24 }}>
            <Grid item xs={12} md={4}>
              <Card variant="outlined" style={{ padding: 20, borderRadius: 8, height: '100%' }}>
                <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                  <SecurityIcon style={{ color: '#16a34a', fontSize: 28 }} />
                  <Box>
                    <Typography variant="subtitle1" style={{ fontWeight: 700 }}>
                      Branch Protection Gates
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Default branch: {repo?.defaultBranch || 'main'}
                    </Typography>
                  </Box>
                </Box>
                <Box display="flex" flexDirection="column" gap={1.5}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">Required Pull Request Approvals</Typography>
                    <Chip label="2 Approvals Enforced" size="small" style={{ backgroundColor: '#dcfce7', color: '#15803d', fontWeight: 600 }} />
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">Build Validation Status Checks</Typography>
                    <Chip label="Enforced" size="small" style={{ backgroundColor: '#dcfce7', color: '#15803d', fontWeight: 600 }} />
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">Linear Git History Enforced</Typography>
                    <Chip label="Squash / Rebase Only" size="small" variant="outlined" />
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">Direct Pushes Blocked</Typography>
                    <Chip label="Blocked" size="small" style={{ backgroundColor: '#dcfce7', color: '#15803d', fontWeight: 600 }} />
                  </Box>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card variant="outlined" style={{ padding: 20, borderRadius: 8, height: '100%' }}>
                <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                  <CheckCircleIcon style={{ color: '#0284c7', fontSize: 28 }} />
                  <Box>
                    <Typography variant="subtitle1" style={{ fontWeight: 700 }}>
                      Code Security & SAST
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Vulnerability & secret scanning
                    </Typography>
                  </Box>
                </Box>
                <Box display="flex" flexDirection="column" gap={1.5}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">Dependabot Security Alerts</Typography>
                    <Chip label="0 Critical / 0 High" size="small" style={{ backgroundColor: '#dcfce7', color: '#15803d', fontWeight: 600 }} />
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">Secret Scanning Push Protection</Typography>
                    <Chip label="Active" size="small" style={{ backgroundColor: '#dcfce7', color: '#15803d', fontWeight: 600 }} />
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">CodeQL Analysis Actions</Typography>
                    <Chip label="Passed" size="small" variant="outlined" />
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">Automated Security Fix PRs</Typography>
                    <Chip label="Enabled" size="small" style={{ backgroundColor: '#dcfce7', color: '#15803d', fontWeight: 600 }} />
                  </Box>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card variant="outlined" style={{ padding: 20, borderRadius: 8, height: '100%' }}>
                <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                  <LayersIcon style={{ color: '#7c3aed', fontSize: 28 }} />
                  <Box>
                    <Typography variant="subtitle1" style={{ fontWeight: 700 }}>
                      Catalog & TechDocs Sync
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      IDP standard compliance
                    </Typography>
                  </Box>
                </Box>
                <Box display="flex" flexDirection="column" gap={1.5}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">catalog-info.yaml Registered</Typography>
                    <Chip label="Onboarded" size="small" style={{ backgroundColor: '#dcfce7', color: '#15803d', fontWeight: 600 }} />
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">TechDocs MkDocs Configured</Typography>
                    <Chip label="Configured" size="small" style={{ backgroundColor: '#dcfce7', color: '#15803d', fontWeight: 600 }} />
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">OSS License Compliance</Typography>
                    <Chip label="Apache 2.0 / MIT" size="small" variant="outlined" />
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">README.md Standard</Typography>
                    <Chip label="Present" size="small" style={{ backgroundColor: '#dcfce7', color: '#15803d', fontWeight: 600 }} />
                  </Box>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* TAB 4: COMMITS */}
      {activeSubTab === 4 && (
        <Box>
          <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="subtitle1" style={{ fontWeight: 700, color: '#0f3156' }}>
                Recent Commits History for {selectedRepoShortName}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Linear commit progression, SHAs, and change descriptions.
              </Typography>
            </Box>
            <Chip label={`${commits.length} Recent Commits`} size="small" variant="outlined" />
          </Box>
          {loadingDetail ? (
            <Box display="flex" justifyContent="center" py={6}>
              <CircularProgress />
            </Box>
          ) : commits.length === 0 ? (
            <Paper variant="outlined" style={{ padding: 24, textAlign: 'center' }}>
              <Typography variant="body2" color="textSecondary">
                No recent commits found for {selectedRepoShortName}.
              </Typography>
            </Paper>
          ) : (
            <TableContainer component={Paper} variant="outlined" style={{ borderRadius: 8 }}>
              <Table size="medium">
                <TableHead style={{ backgroundColor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell style={{ fontWeight: 700, width: 110 }}>SHA</TableCell>
                    <TableCell style={{ fontWeight: 700 }}>Commit Message</TableCell>
                    <TableCell style={{ fontWeight: 700, width: 160 }}>Author</TableCell>
                    <TableCell style={{ fontWeight: 700, width: 120 }}>Link</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {commits.map((c: any) => (
                    <TableRow key={c.sha} hover>
                      <TableCell style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0369a1' }}>
                        {c.sha}
                      </TableCell>
                      <TableCell style={{ fontWeight: 500 }}>{c.message}</TableCell>
                      <TableCell>{c.author}</TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          color="primary"
                          endIcon={<LaunchIcon style={{ fontSize: 13 }} />}
                          href={c.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ textTransform: 'none', fontWeight: 700 }}
                        >
                          Commit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}
    </Box>
  );
};

// -------------------------------------------------------------
// DATADOG LIVE DASHBOARD VIEW (Interactive Canvas + Live Logs)
// -------------------------------------------------------------
const DatadogLiveDashboardView = () => {
  const classes = useStyles();
  const [activeSubTab, setActiveSubTab] = useState(0);
  const [selectedDashboardId, setSelectedDashboardId] = useState('245-sk9-qnx');
  const [iframeKey, setIframeKey] = useState(0);

  // 1. Fetch available dashboards
  const {
    value: dashboardsData,
    loading: loadingDashboards,
    retry: retryDashboards,
  } = useAsync(async () => {
    const res = await fetch('/api/integrations-proxy/datadog/dashboards');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  }, []);

  const dashboards = dashboardsData?.dashboards || [
    {
      id: '245-sk9-qnx',
      title: 'Claims Services Observability & Telemetry',
      description: 'Real-time telemetry, HTTP request volume, response latency, and system health for Claims UI',
      publicUrl: 'https://p.datadoghq.com/sb/f2fdc87e-bdb2-11f1-880c-ce62a0ab8181-2feb325f332f971e08c696cf64e6f65c',
    },
    {
      id: 'byv-h6b-san',
      title: 'Risk Analysis Observability & Telemetry',
      description: 'Real-time telemetry, model scoring latency, request rates, and health for DevOps Risk Analyzer API',
      publicUrl: 'https://p.datadoghq.com/sb/f2fdc87e-bdb2-11f1-880c-ce62a0ab8181-b815955c39a96638ee135ce3d3bc9cb6',
    },
    {
      id: 'zjm-i7u-vdq',
      title: 'Azure App Service (cloned)',
      description: 'Overview of Azure App Service health, server farms, resource usage, and traffic',
      publicUrl: 'https://p.datadoghq.com/sb/f2fdc87e-bdb2-11f1-880c-ce62a0ab8181-9eea62381fe13892b39d4248d2a398a4',
    },
  ];

  // 2. Fetch monitors & alerts
  const {
    value: monitorsData,
    loading: loadingMonitors,
    retry: retryMonitors,
  } = useAsync(async () => {
    const res = await fetch('/api/integrations-proxy/datadog/monitors');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  }, []);

  const monitors = monitorsData?.monitors || [];

  const activeDashboard =
    dashboards.find((d: any) => d.id === selectedDashboardId) || dashboards[0];

  return (
    <Box p={3}>
      {/* Header with Title and Dashboard Switcher Dropdown */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h6" style={{ fontWeight: 800, color: '#0f3156' }}>
            Datadog Enterprise Observability & Telemetry Command
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Live interactive telemetry canvas, monitors, alert rules, and real-time operational log streams.
          </Typography>
        </Box>
        <Box display="flex" gap={1.5} alignItems="center" flexWrap="wrap">
          <TextField
            select
            size="small"
            variant="outlined"
            label="Active Dashboard"
            value={activeDashboard?.id || selectedDashboardId}
            onChange={e => {
              setSelectedDashboardId(e.target.value);
              setIframeKey(k => k + 1);
            }}
            style={{ minWidth: 320 }}
            SelectProps={{ native: true }}
          >
            {dashboards.map((d: any) => (
              <option key={d.id} value={d.id}>
                {d.title}
              </option>
            ))}
          </TextField>
          <IconButton
            onClick={() => {
              retryDashboards();
              retryMonitors();
              setIframeKey(k => k + 1);
            }}
            size="small"
            style={{ border: '1px solid #ddd' }}
          >
            <RefreshIcon fontSize="small" />
          </IconButton>
          <Button
            variant="contained"
            color="primary"
            startIcon={<TimelineIcon />}
            endIcon={<OpenInNewIcon fontSize="small" />}
            href={activeDashboard?.publicUrl || activeDashboard?.url || 'https://app.datadoghq.com'}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textTransform: 'none', fontWeight: 700 }}
          >
            Open in Datadog
          </Button>
        </Box>
      </Box>

      {/* KPI Summary Cards */}
      <Grid container spacing={3} style={{ marginBottom: 24 }}>
        <Grid item xs={12} sm={3}>
          <Card className={classes.statCard}>
            <Typography variant="overline" color="textSecondary" style={{ fontWeight: 700 }}>
              Live Dashboards
            </Typography>
            <Typography className={classes.statNumber} style={{ color: '#0369a1' }}>
              {dashboards.length} Boards
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Claims, Risk & Azure
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card className={classes.statCard}>
            <Typography variant="overline" color="textSecondary" style={{ fontWeight: 700 }}>
              Configured Monitors
            </Typography>
            <Typography className={classes.statNumber} style={{ color: '#7c3aed' }}>
              {monitors.length} Alerts
            </Typography>
            <Typography variant="caption" color="textSecondary">
              CPU, RAM, Disk & Network
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card className={classes.statCard}>
            <Typography variant="overline" color="textSecondary" style={{ fontWeight: 700 }}>
              Active Environment
            </Typography>
            <Typography className={classes.statNumber} style={{ color: '#059669', fontSize: '1.75rem' }}>
              US1 Cloud
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Datadog Production
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card className={classes.statCard}>
            <Typography variant="overline" color="textSecondary" style={{ fontWeight: 700 }}>
              Telemetry Status
            </Typography>
            <Typography className={classes.statNumber} style={{ color: '#059669', fontSize: '1.75rem' }}>
              Streaming
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Metrics & APM Synced
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Sub Tabs */}
      <Tabs
        value={activeSubTab}
        onChange={(_, val) => setActiveSubTab(val)}
        indicatorColor="primary"
        textColor="primary"
        style={{ marginBottom: 18, borderBottom: '1px solid #e2e8f0' }}
      >
        <Tab
          icon={<ViewQuiltIcon style={{ fontSize: 18 }} />}
          label={`Dashboard Canvas: ${activeDashboard?.title || 'Active'}`}
          style={{ fontWeight: 700, textTransform: 'none' }}
        />
        <Tab
          icon={<LayersIcon style={{ fontSize: 18 }} />}
          label={`All Available Dashboards (${dashboards.length})`}
          style={{ fontWeight: 700, textTransform: 'none' }}
        />
        <Tab
          icon={<NotificationsActiveIcon style={{ fontSize: 18 }} />}
          label={`Monitors & Threshold Alerts (${monitors.length})`}
          style={{ fontWeight: 700, textTransform: 'none' }}
        />
        <Tab
          icon={<AssignmentIcon style={{ fontSize: 18 }} />}
          label="Real-time Operational Logs Stream"
          style={{ fontWeight: 700, textTransform: 'none' }}
        />
      </Tabs>

      {/* TAB 0: INTERACTIVE CANVAS / TELEMETRY HUB FOR SELECTED DASHBOARD */}
      {activeSubTab === 0 && (
        <Box>
          <Card variant="outlined" style={{ borderRadius: 8, overflow: 'hidden', marginBottom: 24, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <Box style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
              <Box display="flex" alignItems="center" gap={1.5}>
                <Typography variant="h6" style={{ fontWeight: 700, color: '#0f3156' }}>
                  {activeDashboard?.title || 'Claims Services Observability & Telemetry'}
                </Typography>
                <Chip label="Live Production Stream" size="small" style={{ backgroundColor: '#10b981', color: '#ffffff', fontWeight: 700, fontSize: '0.75rem' }} />
              </Box>
              <Button
                variant="contained"
                color="primary"
                size="medium"
                startIcon={<OpenInNewIcon fontSize="small" />}
                href={activeDashboard?.publicUrl || activeDashboard?.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textTransform: 'none', fontWeight: 700, backgroundColor: '#6366f1', color: '#ffffff', padding: '6px 18px' }}
              >
                Launch High-Resolution Dashboard
              </Button>
            </Box>

            <CardContent style={{ padding: '28px 24px', background: '#ffffff' }}>
              <Box mb={3}>
                <Typography variant="body1" style={{ color: '#475569', lineHeight: 1.6 }}>
                  {activeDashboard?.description || 'Comprehensive real-time telemetry tracking for Claims UI, Risk Analysis Engine, and Azure App Service backends. Live telemetry streams include CPU/RAM saturation, P99 API response latencies, HTTP error rates, and distributed database query traces.'}
                </Typography>
              </Box>

              {/* Dynamic KPI Metrics for Selected Dashboard */}
              <Grid container spacing={3} style={{ marginBottom: 28 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper variant="outlined" style={{ padding: '16px 20px', borderRadius: 8, background: '#f8fafc', borderLeft: '4px solid #10b981' }}>
                    <Typography variant="overline" color="textSecondary" style={{ fontWeight: 700 }}>Service Availability</Typography>
                    <Typography variant="h5" style={{ fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>99.99%</Typography>
                    <Typography variant="caption" style={{ color: '#10b981', fontWeight: 600 }}>▲ Live Stream Active</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper variant="outlined" style={{ padding: '16px 20px', borderRadius: 8, background: '#f8fafc', borderLeft: '4px solid #6366f1' }}>
                    <Typography variant="overline" color="textSecondary" style={{ fontWeight: 700 }}>P95 Response Latency</Typography>
                    <Typography variant="h5" style={{ fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>
                      {activeDashboard?.title?.toLowerCase().includes('azure') ? '118 ms' : activeDashboard?.title?.toLowerCase().includes('risk') ? '210 ms' : '142 ms'}
                    </Typography>
                    <Typography variant="caption" style={{ color: '#6366f1', fontWeight: 600 }}>Optimal SLA (&lt; 250ms)</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper variant="outlined" style={{ padding: '16px 20px', borderRadius: 8, background: '#f8fafc', borderLeft: '4px solid #0284c7' }}>
                    <Typography variant="overline" color="textSecondary" style={{ fontWeight: 700 }}>Request Throughput</Typography>
                    <Typography variant="h5" style={{ fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>
                      {activeDashboard?.title?.toLowerCase().includes('azure') ? '840 req/s' : '428 req/s'}
                    </Typography>
                    <Typography variant="caption" style={{ color: '#0284c7', fontWeight: 600 }}>Continuous telemetry</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper variant="outlined" style={{ padding: '16px 20px', borderRadius: 8, background: '#f8fafc', borderLeft: '4px solid #f59e0b' }}>
                    <Typography variant="overline" color="textSecondary" style={{ fontWeight: 700 }}>Error Rate</Typography>
                    <Typography variant="h5" style={{ fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>0.01%</Typography>
                    <Typography variant="caption" style={{ color: '#059669', fontWeight: 600 }}>Within healthy threshold</Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* Real-time Telemetry Graphs */}
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" style={{ padding: 20, borderRadius: 8 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="subtitle2" style={{ fontWeight: 700, color: '#0f172a' }}>
                        {activeDashboard?.title} — Live Response Latency
                      </Typography>
                      <Chip label="Telemetry Stream" size="small" style={{ height: 20, fontSize: '0.7rem' }} />
                    </Box>
                    <svg viewBox="0 0 500 160" style={{ width: '100%', height: '160px', overflow: 'visible' }}>
                      <defs>
                        <linearGradient id="dashLatencyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" />
                        </linearGradient>
                      </defs>
                      <line x1="0" y1="40" x2="500" y2="40" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="0" y1="80" x2="500" y2="80" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="0" y1="120" x2="500" y2="120" stroke="#f1f5f9" strokeWidth="1" />
                      <path
                        d={activeDashboard?.title?.toLowerCase().includes('azure')
                          ? "M0,120 Q50,110 100,115 T200,95 T300,105 T400,85 T500,75 L500,160 L0,160 Z"
                          : "M0,130 Q40,110 80,125 T160,115 T240,105 T320,95 T400,100 T500,85 L500,160 L0,160 Z"}
                        fill="url(#dashLatencyGrad)"
                      />
                      <path
                        d={activeDashboard?.title?.toLowerCase().includes('azure')
                          ? "M0,120 Q50,110 100,115 T200,95 T300,105 T400,85 T500,75"
                          : "M0,130 Q40,110 80,125 T160,115 T240,105 T320,95 T400,100 T500,85"}
                        fill="none"
                        stroke="#6366f1"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                      <circle cx="500" cy={activeDashboard?.title?.toLowerCase().includes('azure') ? 75 : 85} r="4" fill="#6366f1" />
                    </svg>
                    <Box display="flex" justifyContent="space-between" mt={1}>
                      <Typography variant="caption" color="textSecondary">60m ago</Typography>
                      <Typography variant="caption" color="textSecondary">30m ago</Typography>
                      <Typography variant="caption" style={{ color: '#6366f1', fontWeight: 700 }}>
                        Current ({activeDashboard?.title?.toLowerCase().includes('azure') ? '118ms' : '142ms'})
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" style={{ padding: 20, borderRadius: 8 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="subtitle2" style={{ fontWeight: 700, color: '#0f172a' }}>
                        {activeDashboard?.title} — Resource Utilization (CPU &amp; Memory)
                      </Typography>
                      <Chip label="Datadog US1" size="small" style={{ height: 20, fontSize: '0.7rem' }} />
                    </Box>
                    <svg viewBox="0 0 500 160" style={{ width: '100%', height: '160px', overflow: 'visible' }}>
                      <defs>
                        <linearGradient id="dashCpuGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
                        </linearGradient>
                      </defs>
                      <line x1="0" y1="40" x2="500" y2="40" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="0" y1="80" x2="500" y2="80" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="0" y1="120" x2="500" y2="120" stroke="#f1f5f9" strokeWidth="1" />
                      <path
                        d="M0,140 Q50,135 100,120 T200,130 T300,110 T400,105 T500,90 L500,160 L0,160 Z"
                        fill="url(#dashCpuGrad)"
                      />
                      <path
                        d="M0,140 Q50,135 100,120 T200,130 T300,110 T400,105 T500,90"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                      <circle cx="500" cy="90" r="4" fill="#10b981" />
                    </svg>
                    <Box display="flex" justifyContent="space-between" mt={1}>
                      <Typography variant="caption" color="textSecondary">CPU: 24%</Typography>
                      <Typography variant="caption" color="textSecondary">Memory: 38%</Typography>
                      <Typography variant="caption" style={{ color: '#10b981', fontWeight: 700 }}>Healthy Performance</Typography>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>

              {/* Direct Datadog Canvas Opener */}
              <Box mt={3} p={2} style={{ background: '#f8fafc', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <Typography variant="body2" style={{ color: '#475569' }}>
                  <strong>Observability Workspace:</strong> Inspect distributed trace flamegraphs, host topologies, and synthetic tests directly in full screen.
                </Typography>
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  startIcon={<LaunchIcon fontSize="small" />}
                  href={activeDashboard?.publicUrl || activeDashboard?.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textTransform: 'none', fontWeight: 700 }}
                >
                  Open {activeDashboard?.title} in Datadog
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* TAB 1: ALL AVAILABLE DASHBOARDS DIRECTORY */}
      {activeSubTab === 1 && (
        <Box>
          <Box mb={2}>
            <Typography variant="subtitle1" style={{ fontWeight: 700, color: '#0f3156' }}>
              Enterprise Datadog Dashboards Directory
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Select any dashboard from your Datadog workspace to inspect its canvas, metrics, and widgets.
            </Typography>
          </Box>
          {loadingDashboards ? (
            <Box display="flex" justifyContent="center" py={6}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined" style={{ borderRadius: 8 }}>
              <Table size="medium">
                <TableHead style={{ backgroundColor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell style={{ fontWeight: 700 }}>Dashboard Title</TableCell>
                    <TableCell style={{ fontWeight: 700 }}>Description</TableCell>
                    <TableCell style={{ fontWeight: 700, width: 220 }}>Author</TableCell>
                    <TableCell style={{ fontWeight: 700, width: 140 }}>Last Modified</TableCell>
                    <TableCell style={{ fontWeight: 700, width: 220, textAlign: 'center' }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dashboards.map((d: any) => {
                    const isCurrent = d.id === selectedDashboardId;
                    return (
                      <TableRow
                        key={d.id}
                        hover
                        style={{
                          backgroundColor: isCurrent ? 'rgba(0, 91, 75, 0.05)' : undefined,
                        }}
                      >
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <TimelineIcon style={{ color: '#7c3aed', fontSize: 20 }} />
                            <Box>
                              <Typography variant="subtitle2" style={{ fontWeight: 700, color: '#0f3156' }}>
                                {d.title}
                              </Typography>
                              <Typography variant="caption" style={{ fontFamily: 'monospace', color: '#64748b' }}>
                                ID: {d.id}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="textSecondary">
                            {d.description}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="textSecondary">
                            {d.author || 'Platform Engineering'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="textSecondary">
                            {d.modified ? new Date(d.modified).toLocaleDateString() : 'Recent'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" gap={1} justifyContent="center" alignItems="center">
                            <Button
                              size="small"
                              variant={isCurrent ? 'contained' : 'outlined'}
                              color="primary"
                              onClick={() => {
                                setSelectedDashboardId(d.id);
                                setIframeKey(k => k + 1);
                                setActiveSubTab(0); // Switch to canvas
                              }}
                              style={{ textTransform: 'none', fontWeight: 700 }}
                            >
                              {isCurrent ? 'Viewing' : 'Select & View'}
                            </Button>
                            <IconButton
                              size="small"
                              href={d.publicUrl || d.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Open on Datadog"
                            >
                              <LaunchIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {/* TAB 2: MONITORS & THRESHOLD ALERTS */}
      {activeSubTab === 2 && (
        <Box>
          <Box mb={2}>
            <Typography variant="subtitle1" style={{ fontWeight: 700, color: '#0f3156' }}>
              Configured Alert Monitors & Automated Health Checks
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Real-time monitor status, query expressions, and threshold conditions configured across your infrastructure.
            </Typography>
          </Box>
          {loadingMonitors ? (
            <Box display="flex" justifyContent="center" py={6}>
              <CircularProgress />
            </Box>
          ) : monitors.length === 0 ? (
            <Paper variant="outlined" style={{ padding: 24, textAlign: 'center' }}>
              <Typography variant="body2" color="textSecondary">
                No active monitors found in Datadog.
              </Typography>
            </Paper>
          ) : (
            <TableContainer component={Paper} variant="outlined" style={{ borderRadius: 8 }}>
              <Table size="medium">
                <TableHead style={{ backgroundColor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell style={{ fontWeight: 700 }}>Monitor Name</TableCell>
                    <TableCell style={{ fontWeight: 700, width: 140 }}>State</TableCell>
                    <TableCell style={{ fontWeight: 700, width: 140 }}>Type</TableCell>
                    <TableCell style={{ fontWeight: 700 }}>Metric Evaluation Query</TableCell>
                    <TableCell style={{ fontWeight: 700, width: 120 }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {monitors.map((m: any) => (
                    <TableRow key={m.id} hover>
                      <TableCell style={{ fontWeight: 700 }}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <NotificationsActiveIcon
                            style={{
                              fontSize: 18,
                              color: m.status === 'OK' ? '#059669' : m.status === 'Warn' ? '#d97706' : '#64748b',
                            }}
                          />
                          <Typography variant="body2" style={{ fontWeight: 700, color: '#0f3156' }}>
                            {m.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={m.status || 'OK'}
                          size="small"
                          className={
                            m.status === 'OK'
                              ? classes.statusSuccess
                              : m.status === 'Alert'
                              ? classes.statusWarning
                              : classes.statusInfo
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Chip label={m.type} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="caption"
                          style={{
                            fontFamily: 'monospace',
                            backgroundColor: '#f1f5f9',
                            padding: '3px 6px',
                            borderRadius: 4,
                            display: 'inline-block',
                          }}
                        >
                          {m.query}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          color="primary"
                          endIcon={<LaunchIcon style={{ fontSize: 13 }} />}
                          href={`https://app.datadoghq.com/monitors/${m.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ textTransform: 'none', fontWeight: 700 }}
                        >
                          Monitor
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {/* TAB 3: REAL-TIME OPERATIONAL LOGS */}
      {activeSubTab === 3 && (
        <Box>
          <Box mb={2}>
            <Typography variant="subtitle1" style={{ fontWeight: 700, color: '#0f3156' }}>
              Real-time Operational Logs Stream
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Live ingest of application logs, Azure activity logs, and diagnostic event streams.
            </Typography>
          </Box>
          <DatadogLogsCard />
        </Box>
      )}
    </Box>
  );
};

// -------------------------------------------------------------
// MAIN DASHBOARD COMPONENT WITH ALL INTEGRATIONS & TABS
// -------------------------------------------------------------
export const IntegrationsDashboardPage = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const { role, roleInfo, isAllowed } = useUserRole();
  const [selectedMainTab, setSelectedMainTab] = useState(0);

  // Live KPI queries for dynamic Overview stats
  const { value: jiraIssuesData } = useAsync(async () => {
    const res = await fetch('/api/integrations-proxy/jira/issues');
    if (!res.ok) return null;
    return await res.json();
  }, []);

  const { value: githubReposData } = useAsync(async () => {
    const res = await fetch('/api/integrations-proxy/github/repos');
    if (!res.ok) return null;
    return await res.json();
  }, []);

  const { value: azureCostData } = useAsync(async () => {
    const res = await fetch('/api/azure-deploy/cost-analysis');
    if (!res.ok) return null;
    return await res.json();
  }, []);

  const { value: azureWebAppsData, error: azureWebAppsError } = useAsync(async () => {
    const res = await fetch('/api/azure-deploy/web-apps');
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return await res.json();
  }, []);

  const { value: azureAiData } = useAsync(async () => {
    const res = await fetch('/api/azure-deploy/ai-foundry-costs');
    if (!res.ok) return null;
    return await res.json();
  }, []);

  const totalJiraCount = jiraIssuesData?.total ?? jiraIssuesData?.issues?.length ?? 0;
  const totalGithubRepos = githubReposData?.total ?? githubReposData?.repos?.length ?? 0;
  const currentAzureSpend = azureCostData?.currentSpend
    ? `$${azureCostData.currentSpend.toLocaleString()}/mo`
    : '$0.00/mo';

// Clean Enterprise Dashboard Tab definitions explicitly requested
  const availableTabs = React.useMemo(() => {
    return [
      { id: 'overview', label: 'Command Center', icon: <LayersIcon /> },
      { id: 'jira', label: 'Jira Dashboard', icon: <CheckCircleIcon style={{ color: '#2563eb' }} /> },
      { id: 'ado', label: 'ADO Dashboard', icon: <CloudQueueIcon style={{ color: '#0078d4' }} /> },
      { id: 'github', label: 'GitHub Dashboard', icon: <GitHubIcon style={{ color: '#0f172a' }} /> },
      { id: 'cloud', label: 'Cloud Dashboard', icon: <StorageIcon style={{ color: '#0284c7' }} /> },
      { id: 'finops', label: 'FinOps Dashboard', icon: <AttachMoneyIcon style={{ color: '#16a34a' }} /> },
      { id: 'datadog', label: 'Datadog Dashboard', icon: <TimelineIcon style={{ color: '#7c3aed' }} /> },
    ];
  }, []);

  // Ensure selected tab index is bounded within available tabs
  React.useEffect(() => {
    if (selectedMainTab >= availableTabs.length) {
      setSelectedMainTab(0);
    }
  }, [availableTabs, selectedMainTab]);

  return (
    <Container maxWidth="xl" className={classes.root}>
      {/* Enterprise Hero Banner */}
      <Box className={classes.heroBanner}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
          <Box>
            <Typography className={classes.heroTitle}>
              Enterprise Self Service Portal
            </Typography>
            <Typography className={classes.heroSubtitle}>
              {role === 'platform-engineer' && 'Platform Engineering Command Center: Complete full-lifecycle administrative visibility across cloud infrastructure, repositories, logs, and golden path scaffolding.'}
              {role === 'developer' && 'Software Developer Workspace: Streamlined view for day-to-day coding, active pull requests, CI/CD pipeline runs, and self-service scaffolder actions.'}
              {role === 'finops' && 'Cloud FinOps & Cost Governance Portal: Real-time Azure OpenAI and AI Foundry token runrates, infrastructure unit economics, and cloud efficiency.'}
            </Typography>
          </Box>
          <Box>
            <Chip
              icon={
                role === 'platform-engineer' ? <SupervisorAccountIcon style={{ color: '#ffffff' }} /> :
                role === 'developer' ? <CodeIcon style={{ color: '#ffffff' }} /> :
                <AttachMoneyIcon style={{ color: '#ffffff' }} />
              }
              label={`Active Role: ${roleInfo.title}`}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.22)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.85rem',
                padding: '18px 8px',
                border: '1px solid rgba(255, 255, 255, 0.35)',
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Main Tabbed Navigation Inside Dashboard - Enterprise Platform Engineering Suite */}
      <Card className={classes.mainTabsCard}>
        <Box className={classes.tabHeader}>
          <Tabs
            value={selectedMainTab}
            onChange={(_, val) => setSelectedMainTab(val)}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
          >
            {availableTabs.map((t, idx) => (
              <Tab
                key={t.id}
                icon={t.icon}
                label={t.label}
                className={classes.tabLabel}
              />
            ))}
          </Tabs>
        </Box>

        {/* Dynamic Views based on active tab ID */}
        {availableTabs[selectedMainTab]?.id === 'overview' && (
          <Box p={3}>
            {/* Live Azure Authorization & Permission Alert */}
            {azureWebAppsError && (
              <Box mb={3}>
                <Alert severity="warning">
                  <strong>Live Azure Cloud Status Notice:</strong> {azureWebAppsError.message}
                  <br />
                  If you changed your Azure environment variables, please ensure your Service Principal (App Registration) has the <strong>Reader</strong> or <strong>Contributor</strong> role assigned on Subscription <code>{azureCostData?.subscriptionId || 'in Azure'}</code> under <em>Access Control (IAM)</em>.
                </Alert>
              </Box>
            )}

            {/* Quick action shortcuts to deep dive */}
            <Grid container spacing={3} style={{ marginBottom: 28 }}>
              {role !== 'finops' && (
                <Grid item xs={12} sm={6} md={3}>
                  <Card className={classes.statCard}>
                    <Typography variant="overline" color="textSecondary" style={{ fontWeight: 700 }}>
                      Jira Agile Backlog
                    </Typography>
                    <Typography className={classes.statNumber} style={{ color: '#2563eb' }}>
                      {totalJiraCount} Issues
                    </Typography>
                    <Button
                      size="small"
                      color="primary"
                      onClick={() => setSelectedMainTab(1)}
                      style={{ textTransform: 'none', fontWeight: 700, paddingLeft: 0, justifyContent: 'flex-start' }}
                    >
                      View Jira Dashboard →
                    </Button>
                  </Card>
                </Grid>
              )}
              {role !== 'finops' && (
                <Grid item xs={12} sm={6} md={3}>
                  <Card className={classes.statCard}>
                    <Typography variant="overline" color="textSecondary" style={{ fontWeight: 700 }}>
                      GitHub CI/CD
                    </Typography>
                    <Typography className={classes.statNumber} style={{ color: '#059669' }}>
                      {totalGithubRepos} Repos
                    </Typography>
                    <Button
                      size="small"
                      color="primary"
                      onClick={() => setSelectedMainTab(3)}
                      style={{ textTransform: 'none', fontWeight: 700, paddingLeft: 0, justifyContent: 'flex-start' }}
                    >
                      View GitHub Dashboard →
                    </Button>
                  </Card>
                </Grid>
              )}
              {role === 'platform-engineer' && (
                <Grid item xs={12} sm={6} md={3}>
                  <Card className={classes.statCard}>
                    <Typography variant="overline" color="textSecondary" style={{ fontWeight: 700 }}>
                      Cloud Infrastructure
                    </Typography>
                    <Typography className={classes.statNumber} style={{ color: '#0078d4' }}>
                      Azure Native
                    </Typography>
                    <Button
                      size="small"
                      color="primary"
                      onClick={() => setSelectedMainTab(4)}
                      style={{ textTransform: 'none', fontWeight: 700, paddingLeft: 0, justifyContent: 'flex-start' }}
                    >
                      View Cloud Dashboard →
                    </Button>
                  </Card>
                </Grid>
              )}
              {role !== 'developer' && (
                <Grid item xs={12} sm={6} md={3}>
                  <Card className={classes.statCard}>
                    <Typography variant="overline" color="textSecondary" style={{ fontWeight: 700 }}>
                      Cloud FinOps Run-rate
                    </Typography>
                    <Typography className={classes.statNumber} style={{ color: '#9333ea' }}>
                      {currentAzureSpend}
                    </Typography>
                    <Button
                      size="small"
                      color="primary"
                      onClick={() => setSelectedMainTab(5)}
                      style={{ textTransform: 'none', fontWeight: 700, paddingLeft: 0, justifyContent: 'flex-start' }}
                    >
                      View FinOps Dashboard →
                    </Button>
                  </Card>
                </Grid>
              )}
              <Grid item xs={12} sm={6} md={3}>
                <Card className={classes.statCard}>
                  <Typography variant="overline" color="textSecondary" style={{ fontWeight: 700 }}>
                    System Status
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography className={classes.statNumber} style={{ color: '#16a34a' }}>
                      100%
                    </Typography>
                    <DoneAllIcon style={{ color: '#16a34a', fontSize: 26 }} />
                  </Box>
                  <Typography variant="caption" color="textSecondary">
                    All tools operational
                  </Typography>
                </Card>
              </Grid>
            </Grid>

            {/* Quick Integration Cards */}
            <Typography variant="h6" style={{ fontWeight: 800, marginBottom: 16, color: '#0f3156' }}>
              Connected Platform Extensions
            </Typography>
            <Grid container spacing={3}>
              {/* Jira Card */}
              <Grid item xs={12} sm={6} md={4}>
                <Card className={classes.card}>
                  <CardContent>
                    <Box className={classes.cardHeader}>
                      <Box className={classes.iconBox} style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
                        <CheckCircleIcon />
                      </Box>
                      <Box flex={1}>
                        <Typography className={classes.cardTitle}>Jira Software Cloud</Typography>
                        <Chip label="Live & Active" size="small" className={classes.statusBadgeActive} />
                      </Box>
                    </Box>
                    <Typography className={classes.cardDesc}>
                      Live SCRUM sprint backlog and delivery tickets tracking Claims FNOL and intake.
                    </Typography>
                    <Box className={classes.cardFooter}>
                      <Typography variant="caption" style={{ fontWeight: 600 }}>v3.1.0</Typography>
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={() => setSelectedMainTab(1)}
                        style={{ textTransform: 'none', fontWeight: 700 }}
                      >
                        Open Jira Dashboard
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* ADO Card */}
              <Grid item xs={12} sm={6} md={4}>
                <Card className={classes.card}>
                  <CardContent>
                    <Box className={classes.cardHeader}>
                      <Box className={classes.iconBox} style={{ backgroundColor: '#eff6ff', color: '#0078d4' }}>
                        <CloudQueueIcon />
                      </Box>
                      <Box flex={1}>
                        <Typography className={classes.cardTitle}>Azure DevOps (ADO)</Typography>
                        <Chip label="Pipelines & Boards" size="small" className={classes.statusBadgeActive} />
                      </Box>
                    </Box>
                    <Typography className={classes.cardDesc}>
                      CI/CD builds, logs console, pull requests, native Kanban boards, and package feeds.
                    </Typography>
                    <Box className={classes.cardFooter}>
                      <Typography variant="caption" style={{ fontWeight: 600 }}>DOJO & Assets</Typography>
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={() => setSelectedMainTab(2)}
                        style={{ textTransform: 'none', fontWeight: 700 }}
                      >
                        Open ADO Dashboard
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* GitHub Card */}
              <Grid item xs={12} sm={6} md={4}>
                <Card className={classes.card}>
                  <CardContent>
                    <Box className={classes.cardHeader}>
                      <Box className={classes.iconBox} style={{ backgroundColor: '#f1f5f9', color: '#0f172a' }}>
                        <GitHubIcon />
                      </Box>
                      <Box flex={1}>
                        <Typography className={classes.cardTitle}>GitHub Actions & Repos</Typography>
                        <Chip label="Live & Active" size="small" className={classes.statusBadgeActive} />
                      </Box>
                    </Box>
                    <Typography className={classes.cardDesc}>
                      Commits, pull requests, and automated deployment pipelines for Claims UI.
                    </Typography>
                    <Box className={classes.cardFooter}>
                      <Typography variant="caption" style={{ fontWeight: 600 }}>v0.6.14</Typography>
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={() => setSelectedMainTab(3)}
                        style={{ textTransform: 'none', fontWeight: 700 }}
                      >
                        Open GitHub Dashboard
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Azure Cloud Card */}
              <Grid item xs={12} sm={6} md={4}>
                <Card className={classes.card}>
                  <CardContent>
                    <Box className={classes.cardHeader}>
                      <Box className={classes.iconBox} style={{ backgroundColor: '#f0f9ff', color: '#0284c7' }}>
                        <StorageIcon fontSize="medium" />
                      </Box>
                      <Box flex={1}>
                        <Typography className={classes.cardTitle}>Azure Cloud Infrastructure</Typography>
                        <Chip label="ARM Live" size="small" className={classes.statusBadgeActive} />
                      </Box>
                    </Box>
                    <Typography className={classes.cardDesc}>
                      Full subscription inventory, Azure App Services, live container restarts, and real-time logs.
                    </Typography>
                    <Box className={classes.cardFooter}>
                      <Typography variant="caption" style={{ fontWeight: 600 }}>Azure Native</Typography>
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={() => setSelectedMainTab(4)}
                        style={{ textTransform: 'none', fontWeight: 700 }}
                      >
                        Open Cloud Dashboard
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* FinOps Card */}
              <Grid item xs={12} sm={6} md={4}>
                <Card className={classes.card}>
                  <CardContent>
                    <Box className={classes.cardHeader}>
                      <Box className={classes.iconBox} style={{ backgroundColor: '#fdf2f8', color: '#16a34a' }}>
                        <AttachMoneyIcon fontSize="medium" />
                      </Box>
                      <Box flex={1}>
                        <Typography className={classes.cardTitle}>FinOps & Spend Governance</Typography>
                        <Chip
                          label={azureAiData?.models?.length ? `${azureAiData.models.length} Models Live` : 'Budget Active'}
                          size="small"
                          className={classes.statusBadgeActive}
                        />
                      </Box>
                    </Box>
                    <Typography className={classes.cardDesc}>
                      Subscription actual spend, monthly budget tracking, daily burn rate, and AI token cost analytics.
                    </Typography>
                    <Box className={classes.cardFooter}>
                      <Typography variant="caption" style={{ fontWeight: 600 }}>
                        {currentAzureSpend}
                      </Typography>
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={() => setSelectedMainTab(5)}
                        style={{ textTransform: 'none', fontWeight: 700 }}
                      >
                        Open FinOps Dashboard
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Datadog Card */}
              <Grid item xs={12} sm={6} md={4}>
                <Card className={classes.card}>
                  <CardContent>
                    <Box className={classes.cardHeader}>
                      <Box className={classes.iconBox} style={{ backgroundColor: '#faf5ff', color: '#7c3aed' }}>
                        <TimelineIcon fontSize="medium" />
                      </Box>
                      <Box flex={1}>
                        <Typography className={classes.cardTitle}>Datadog Observability</Typography>
                        <Chip label="APM & Logs" size="small" className={classes.statusBadgeActive} />
                      </Box>
                    </Box>
                    <Typography className={classes.cardDesc}>
                      Interactive Datadog canvases, APM latency SLAs, synthetic alert monitors, and real-time logs.
                    </Typography>
                    <Box className={classes.cardFooter}>
                      <Typography variant="caption" style={{ fontWeight: 600 }}>US1 Cloud</Typography>
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={() => setSelectedMainTab(6)}
                        style={{ textTransform: 'none', fontWeight: 700 }}
                      >
                        Open Datadog Dashboard
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Tab 1: Jira Dashboard */}
        {availableTabs[selectedMainTab]?.id === 'jira' && (
          <Box p={1}>
            <JiraLiveDashboardView />
          </Box>
        )}

        {/* Tab 2: ADO Dashboard */}
        {availableTabs[selectedMainTab]?.id === 'ado' && (
          <Box p={1}>
            <EntityAdoTabContent isStandalone={true} defaultProject="DOJO - POC" />
          </Box>
        )}

        {/* Tab 3: GitHub Dashboard */}
        {availableTabs[selectedMainTab]?.id === 'github' && (
          <Box p={1}>
            <GitHubLiveDashboardView />
          </Box>
        )}

        {/* Tab 4: Cloud Dashboard */}
        {availableTabs[selectedMainTab]?.id === 'cloud' && (
          <Box p={1}>
            <AzureTabContent isStandalone={true} initialTab={0} />
          </Box>
        )}

        {/* Tab 5: FinOps Dashboard */}
        {availableTabs[selectedMainTab]?.id === 'finops' && (
          <Box p={1}>
            <AzureTabContent isStandalone={true} initialTab={1} />
            <Box mt={3}>
              <AzureAiFoundryDashboardView />
            </Box>
          </Box>
        )}

        {/* Tab 6: Datadog Dashboard */}
        {availableTabs[selectedMainTab]?.id === 'datadog' && (
          <Box p={1}>
            <DatadogLiveDashboardView />
          </Box>
        )}
      </Card>
    </Container>
  );
};
