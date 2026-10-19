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
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import GitHubIcon from '@material-ui/icons/GitHub';
import PlayCircleOutlineIcon from '@material-ui/icons/PlayCircleOutline';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import RefreshIcon from '@material-ui/icons/Refresh';
import DoneAllIcon from '@material-ui/icons/DoneAll';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import useAsync from 'react-use/lib/useAsync';
import { useEntity } from '@backstage/plugin-catalog-react';

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
  },
  statNumber: {
    fontWeight: 700,
    fontSize: '1.8rem',
    color: theme.palette.primary.main,
  },
  statusSuccess: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    color: '#16a34a',
    border: '1px solid rgba(34, 197, 94, 0.35)',
    fontWeight: 700,
    fontSize: '0.72rem',
  },
  statusFailed: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    color: '#dc2626',
    border: '1px solid rgba(239, 68, 68, 0.35)',
    fontWeight: 700,
    fontSize: '0.72rem',
  },
  statusProgress: {
    backgroundColor: 'rgba(14, 165, 233, 0.15)',
    color: '#0284c7',
    border: '1px solid rgba(14, 165, 233, 0.35)',
    fontWeight: 700,
    fontSize: '0.72rem',
  },
}));

export const EntityGithubActionsTabContent = () => {
  const classes = useStyles();
  const { entity } = useEntity();
  const [filterQuery, setFilterQuery] = useState('');

  const slug = entity?.metadata?.annotations?.['github.com/project-slug'] || 'RAGHAVENDRA-VAM/Claims_UI';
  const cleanRepoName = slug.includes('/') ? slug.split('/')[1] : slug;

  const { value, loading, retry } = useAsync(async () => {
    const res = await fetch(`/api/integrations-proxy/github/overview?repo=${encodeURIComponent(slug)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  }, [slug]);

  const runs = value?.runs || [];
  const repo = value?.repo;

  const filteredRuns = runs.filter((r: any) =>
    (r.name && r.name.toLowerCase().includes(filterQuery.toLowerCase())) ||
    (r.branch && r.branch.toLowerCase().includes(filterQuery.toLowerCase())) ||
    (r.status && r.status.toLowerCase().includes(filterQuery.toLowerCase())) ||
    (r.conclusion && r.conclusion.toLowerCase().includes(filterQuery.toLowerCase()))
  );

  const successfulRuns = runs.filter((r: any) => r.conclusion === 'success').length;
  const failedRuns = runs.filter((r: any) => r.conclusion === 'failure').length;

  return (
    <Box className={classes.root}>
      {/* Banner */}
      <Box className={classes.banner}>
        <Box>
          <Typography className={classes.bannerTitle}>
            <PlayCircleOutlineIcon style={{ fontSize: 32 }} />
            {cleanRepoName} — CI/CD Workflow Runs
          </Typography>
          <Typography className={classes.bannerSubtitle}>
            Continuous Integration, automated test suites, build pipelines, and SAST security scans running via GitHub Actions.
          </Typography>
          <Box className={classes.badgeRow}>
            <Chip label={`Repository: ${cleanRepoName}`} size="small" className={classes.badgePill} />
            <Chip label={`Default Branch: ${repo?.defaultBranch || 'main'}`} size="small" className={classes.badgePill} />
            <Chip label="Backend Token Proxy: Connected" size="small" className={classes.badgePill} />
          </Box>
        </Box>
        <Box display="flex" gap={1}>
          <IconButton onClick={() => retry()} style={{ color: '#fff', border: '1px solid rgba(255,255,255,0.25)' }}>
            <RefreshIcon />
          </IconButton>
          <Button
            variant="contained"
            color="primary"
            startIcon={<GitHubIcon />}
            endIcon={<OpenInNewIcon fontSize="small" />}
            href={`https://github.com/${slug}/actions`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textTransform: 'none', fontWeight: 700 }}
          >
            View on GitHub
          </Button>
        </Box>
      </Box>

      {/* Metrics Row */}
      <Grid container spacing={3} style={{ marginBottom: 24 }}>
        <Grid item xs={12} sm={4}>
          <Card className={classes.statCard}>
            <Typography variant="body2" color="textSecondary" style={{ fontWeight: 600 }}>Total Executions</Typography>
            <Typography className={classes.statNumber}>{runs.length}</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card className={classes.statCard}>
            <Typography variant="body2" color="textSecondary" style={{ fontWeight: 600 }}>Passed Workflows</Typography>
            <Typography className={classes.statNumber} style={{ color: '#16a34a' }}>{successfulRuns}</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card className={classes.statCard}>
            <Typography variant="body2" color="textSecondary" style={{ fontWeight: 600 }}>Failed Executions</Typography>
            <Typography className={classes.statNumber} style={{ color: failedRuns > 0 ? '#dc2626' : '#64748b' }}>{failedRuns}</Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Filter Toolbar */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <TextField
          size="small"
          variant="outlined"
          placeholder="Filter workflows by name, branch, or status..."
          value={filterQuery}
          onChange={e => setFilterQuery(e.target.value)}
          style={{ minWidth: 320 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon style={{ color: '#64748b' }} />
              </InputAdornment>
            ),
          }}
        />
        <Typography variant="body2" color="textSecondary">
          Showing {filteredRuns.length} of {runs.length} Runs
        </Typography>
      </Box>

      {/* Table */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} variant="outlined" style={{ borderRadius: 8 }}>
          <Table size="medium">
            <TableHead style={{ backgroundColor: '#f8fafc' }}>
              <TableRow>
                <TableCell style={{ fontWeight: 700 }}>Workflow / Pipeline</TableCell>
                <TableCell style={{ fontWeight: 700 }}>Branch</TableCell>
                <TableCell style={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell style={{ fontWeight: 700 }}>Triggered By</TableCell>
                <TableCell style={{ fontWeight: 700 }}>Created</TableCell>
                <TableCell style={{ fontWeight: 700, textAlign: 'center' }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRuns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" style={{ padding: 32, color: '#64748b' }}>
                    No workflow runs found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRuns.map((r: any) => {
                  const isSuccess = r.conclusion === 'success';
                  const isFailed = r.conclusion === 'failure';
                  const isRunning = r.status === 'in_progress' || r.status === 'queued';

                  return (
                    <TableRow key={r.id} hover>
                      <TableCell style={{ fontWeight: 600 }}>{r.name || 'CI/CD Pipeline'}</TableCell>
                      <TableCell>
                        <Chip label={r.branch} size="small" variant="outlined" style={{ fontFamily: 'monospace' }} />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={isRunning ? r.status : (r.conclusion || 'completed')}
                          size="small"
                          className={isSuccess ? classes.statusSuccess : isFailed ? classes.statusFailed : classes.statusProgress}
                        />
                      </TableCell>
                      <TableCell>{r.actor || 'automation'}</TableCell>
                      <TableCell>{r.created ? new Date(r.created).toLocaleDateString() : 'recently'}</TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          variant="outlined"
                          color="primary"
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          endIcon={<OpenInNewIcon fontSize="small" />}
                          style={{ textTransform: 'none' }}
                        >
                          View Logs
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};
