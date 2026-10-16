import React, { useState } from 'react';
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

const useStyles = makeStyles(theme => ({
  root: {
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(6),
  },
  heroBanner: {
    background: 'linear-gradient(90deg, #005B4B 0%, #006D8F 100%)',
    color: '#ffffff',
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(4, 5),
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
    backgroundColor: theme.palette.background.default,
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
  const [domainFilter, setDomainFilter] = useState<'all' | 'claims' | 'risk'>('all');

  const { value, loading, error, retry } = useAsync(async () => {
    const res = await fetch('/api/integrations-proxy/jira/issues');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  }, []);

  const issues = value?.issues || [];

  const domainIssues = domainFilter === 'risk'
    ? issues.filter((i: any) => /risk|liability|damage|evaluation|severity|escalation|assessment/i.test(i.summary))
    : domainFilter === 'claims'
    ? issues.filter((i: any) => /claim|fnol|intake|adjuster|representative|coverage|payment|reserve|document|workspace/i.test(i.summary))
    : issues;

  const filtered = domainIssues.filter((i: any) =>
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
            Jira Software Cloud — Project: SCRUM (M&M Insurance)
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
            label="Component Scope"
            value={domainFilter}
            onChange={e => setDomainFilter(e.target.value as any)}
            style={{ minWidth: 200 }}
            SelectProps={{ native: true }}
          >
            <option value="all">All Components ({issues.length})</option>
            <option value="claims">Claims UI Tickets</option>
            <option value="risk">Risk Analysis Tickets</option>
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
              Total Active Issues
            </Typography>
            <Typography className={classes.statNumber} style={{ color: '#2563eb' }}>
              {issues.length}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              In Review & Sprints
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card className={classes.statCard}>
            <Typography variant="overline" color="textSecondary" style={{ fontWeight: 700 }}>
              Primary Domain
            </Typography>
            <Typography className={classes.statNumber} style={{ fontSize: '1.6rem', color: '#0d9488' }}>
              FNOL & Intake
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Claim registration & assignment
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
// GITHUB LIVE DASHBOARD VIEW (Commits, Pull Requests, Actions)
// -------------------------------------------------------------
const GitHubLiveDashboardView = () => {
  const classes = useStyles();
  const [activeSubTab, setActiveSubTab] = useState(0);
  const [selectedRepo, setSelectedRepo] = useState('RAGHAVENDRA-VAM/Claims_UI');
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

  // 2. Fetch specific selected repo details
  const {
    value: detailValue,
    loading: loadingDetail,
    retry: retryDetail,
  } = useAsync(async () => {
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

  const filteredRepos = allRepos.filter((r: any) =>
    r.fullName.toLowerCase().includes(repoSearch.toLowerCase()) ||
    (r.description && r.description.toLowerCase().includes(repoSearch.toLowerCase())) ||
    (r.language && r.language.toLowerCase().includes(repoSearch.toLowerCase())),
  );

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h6" style={{ fontWeight: 800, color: '#0f3156' }}>
            GitHub Enterprise Portfolio & Workspace
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Live exploration across all {allRepos.length > 0 ? allRepos.length : 'account'} repositories, CI/CD pipelines, pull requests, and catalog onboarding.
          </Typography>
        </Box>
        <Box display="flex" gap={1.5} alignItems="center" flexWrap="wrap">
          {allRepos.length > 0 && (
            <TextField
              select
              size="small"
              variant="outlined"
              label="Active Repository"
              value={selectedRepo}
              onChange={e => setSelectedRepo(e.target.value)}
              style={{ minWidth: 260 }}
              SelectProps={{ native: true }}
            >
              {allRepos.map((r: any) => (
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

      {/* Sub Tabs */}
      <Tabs
        value={activeSubTab}
        onChange={(_, val) => setActiveSubTab(val)}
        indicatorColor="primary"
        textColor="primary"
        style={{ marginBottom: 18, borderBottom: '1px solid #e2e8f0' }}
      >
        <Tab
          label={`All Repositories Explorer (${allRepos.length})`}
          style={{ fontWeight: 700, textTransform: 'none' }}
        />
        <Tab
          label={`CI/CD Workflow Runs (${runs.length})`}
          style={{ fontWeight: 700, textTransform: 'none' }}
        />
        <Tab
          label={`Pull Requests (${pulls.length})`}
          style={{ fontWeight: 700, textTransform: 'none' }}
        />
        <Tab
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
              placeholder="Search across all 50 repositories (e.g. Agent, UI, Backend, Python, TypeScript)..."
              value={repoSearch}
              onChange={e => setRepoSearch(e.target.value)}
              style={{ minWidth: 380, flex: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon style={{ color: '#64748b' }} />
                  </InputAdornment>
                ),
              }}
            />
            <Typography variant="body2" color="textSecondary" style={{ fontWeight: 600 }}>
              Showing {filteredRepos.length} of {allRepos.length} Repositories
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
          <Box mb={2}>
            <Typography variant="subtitle1" style={{ fontWeight: 700, color: '#0f3156' }}>
              CI/CD Pipeline Workflow Executions for {selectedRepoShortName}
            </Typography>
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
          <Box mb={2}>
            <Typography variant="subtitle1" style={{ fontWeight: 700, color: '#0f3156' }}>
              Pull Requests for {selectedRepoShortName}
            </Typography>
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
                    <TableCell style={{ fontWeight: 700, width: 120 }}>Link</TableCell>
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

      {/* TAB 3: COMMITS */}
      {activeSubTab === 3 && (
        <Box>
          <Box mb={2}>
            <Typography variant="subtitle1" style={{ fontWeight: 700, color: '#0f3156' }}>
              Recent Commits History for {selectedRepoShortName}
            </Typography>
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
                    <TableCell style={{ fontWeight: 700 }}>Message</TableCell>
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
              {monitors.length > 0 ? monitors.length : 7} Alerts
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

      {/* TAB 0: INTERACTIVE CANVAS FOR SELECTED DASHBOARD */}
      {activeSubTab === 0 && (
        <Box>
          <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle1" style={{ fontWeight: 700, color: '#0f3156' }}>
              {activeDashboard?.title}
            </Typography>
            <Chip label="Live Sync Active" size="small" className={classes.statusSuccess} />
          </Box>
          <Card variant="outlined" style={{ borderRadius: 8, overflow: 'hidden', marginBottom: 24 }}>
            <iframe
              key={`${activeDashboard?.id}-${iframeKey}`}
              title={activeDashboard?.title}
              src={activeDashboard?.publicUrl || activeDashboard?.url}
              className={classes.iframeCanvas}
            />
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
  const [selectedMainTab, setSelectedMainTab] = useState(0);

  return (
    <Container maxWidth="xl" className={classes.root}>
      {/* Enterprise Hero Banner */}
      <Box className={classes.heroBanner}>
        <Typography className={classes.heroTitle}>
          Enterprise Integrations & Extensions Dashboard
        </Typography>
        <Typography className={classes.heroSubtitle}>
          Central operational command center for Shield Insurance. Switch between live tool dashboards 
          for Jira tickets, GitHub projects & workflows, Datadog observability, and ecosystem services.
        </Typography>

        <Box className={classes.heroBadges}>
          <Chip label="Jira Cloud: Connected" size="small" className={classes.badgePill} />
          <Chip label="GitHub Actions: Synced" size="small" className={classes.badgePill} />
          <Chip label="Datadog APM: Online" size="small" className={classes.badgePill} />
          <Chip label="SOC2 & ISO-27001 Certified" size="small" className={classes.badgePill} />
        </Box>
      </Box>

      {/* Main Tabbed Navigation Inside Dashboard */}
      <Card className={classes.mainTabsCard}>
        <Box className={classes.tabHeader}>
          <Tabs
            value={selectedMainTab}
            onChange={(_, val) => setSelectedMainTab(val)}
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab
              icon={<LayersIcon />}
              label="All Integrations Overview"
              className={classes.tabLabel}
            />
            <Tab
              icon={<CheckCircleIcon style={{ color: '#2563eb' }} />}
              label="Jira Dashboard & Tickets"
              className={classes.tabLabel}
            />
            <Tab
              icon={<GitHubIcon />}
              label="GitHub Repos & Workflows"
              className={classes.tabLabel}
            />
            <Tab
              icon={<CloudQueueIcon style={{ color: '#0078d4' }} />}
              label="Microsoft Azure Architecture"
              className={classes.tabLabel}
            />
            <Tab
              icon={<TimelineIcon style={{ color: '#7c3aed' }} />}
              label="Datadog Observability"
              className={classes.tabLabel}
            />
          </Tabs>
        </Box>

        {/* TAB 0: ALL INTEGRATIONS OVERVIEW */}
        {selectedMainTab === 0 && (
          <Box p={3}>
            {/* Quick action shortcuts to deep dive */}
            <Grid container spacing={3} style={{ marginBottom: 28 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card className={classes.statCard}>
                  <Typography variant="overline" color="textSecondary" style={{ fontWeight: 700 }}>
                    Jira Software
                  </Typography>
                  <Typography className={classes.statNumber} style={{ color: '#2563eb' }}>
                    10 Issues
                  </Typography>
                  <Button
                    size="small"
                    color="primary"
                    onClick={() => setSelectedMainTab(1)}
                    style={{ textTransform: 'none', fontWeight: 700, paddingLeft: 0, justifyContent: 'flex-start' }}
                  >
                    View Tickets Tab →
                  </Button>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card className={classes.statCard}>
                  <Typography variant="overline" color="textSecondary" style={{ fontWeight: 700 }}>
                    GitHub CI/CD
                  </Typography>
                  <Typography className={classes.statNumber} style={{ color: '#059669' }}>
                    187 Runs
                  </Typography>
                  <Button
                    size="small"
                    color="primary"
                    onClick={() => setSelectedMainTab(2)}
                    style={{ textTransform: 'none', fontWeight: 700, paddingLeft: 0, justifyContent: 'flex-start' }}
                  >
                    View GitHub Tab →
                  </Button>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card className={classes.statCard}>
                  <Typography variant="overline" color="textSecondary" style={{ fontWeight: 700 }}>
                    Datadog Telemetry
                  </Typography>
                  <Typography className={classes.statNumber} style={{ color: '#7c3aed' }}>
                    Live APM
                  </Typography>
                  <Button
                    size="small"
                    color="primary"
                    onClick={() => setSelectedMainTab(3)}
                    style={{ textTransform: 'none', fontWeight: 700, paddingLeft: 0, justifyContent: 'flex-start' }}
                  >
                    View Datadog Tab →
                  </Button>
                </Card>
              </Grid>
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
                        onClick={() => setSelectedMainTab(2)}
                        style={{ textTransform: 'none', fontWeight: 700 }}
                      >
                        Open GitHub Dashboard
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
                      <Box className={classes.iconBox} style={{ backgroundColor: '#f3e8ff', color: '#7c3aed' }}>
                        <TimelineIcon />
                      </Box>
                      <Box flex={1}>
                        <Typography className={classes.cardTitle}>Datadog Observability</Typography>
                        <Chip label="Live & Active" size="small" className={classes.statusBadgeActive} />
                      </Box>
                    </Box>
                    <Typography className={classes.cardDesc}>
                      Embedded interactive monitors, APM traces, and live operational logs streaming.
                    </Typography>
                    <Box className={classes.cardFooter}>
                      <Typography variant="caption" style={{ fontWeight: 600 }}>v4.1.2</Typography>
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={() => setSelectedMainTab(3)}
                        style={{ textTransform: 'none', fontWeight: 700 }}
                      >
                        Open Datadog Canvas
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* TAB 1: JIRA DASHBOARD */}
        {selectedMainTab === 1 && <JiraLiveDashboardView />}

        {/* TAB 2: GITHUB DASHBOARD */}
        {selectedMainTab === 2 && <GitHubLiveDashboardView />}

        {/* TAB 3: AZURE DASHBOARD */}
        {selectedMainTab === 3 && <AzureTabContent isStandalone={true} />}

        {/* TAB 4: DATADOG DASHBOARD */}
        {selectedMainTab === 4 && <DatadogLiveDashboardView />}
      </Card>
    </Container>
  );
};
