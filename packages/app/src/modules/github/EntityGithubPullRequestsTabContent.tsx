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
import CallSplitIcon from '@material-ui/icons/CallSplit';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import RefreshIcon from '@material-ui/icons/Refresh';
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
  statusOpen: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    color: '#16a34a',
    border: '1px solid rgba(34, 197, 94, 0.35)',
    fontWeight: 700,
    fontSize: '0.72rem',
  },
  statusClosed: {
    backgroundColor: 'rgba(148, 163, 184, 0.15)',
    color: '#475569',
    border: '1px solid rgba(148, 163, 184, 0.35)',
    fontWeight: 700,
    fontSize: '0.72rem',
  },
}));

export const EntityGithubPullRequestsTabContent = () => {
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

  const pulls = value?.pulls || [];

  const filteredPulls = pulls.filter((p: any) =>
    (p.title && p.title.toLowerCase().includes(filterQuery.toLowerCase())) ||
    (p.author && p.author.toLowerCase().includes(filterQuery.toLowerCase())) ||
    (p.state && p.state.toLowerCase().includes(filterQuery.toLowerCase()))
  );

  const openPulls = pulls.filter((p: any) => p.state === 'open').length;
  const closedPulls = pulls.filter((p: any) => p.state === 'closed').length;

  return (
    <Box className={classes.root}>
      {/* Banner */}
      <Box className={classes.banner}>
        <Box>
          <Typography className={classes.bannerTitle}>
            <CallSplitIcon style={{ fontSize: 32 }} />
            {cleanRepoName} — Pull Requests & Code Reviews
          </Typography>
          <Typography className={classes.bannerSubtitle}>
            Active peer reviews, branch merge requests, and contributor activity tracked directly from GitHub.
          </Typography>
          <Box className={classes.badgeRow}>
            <Chip label={`Repository: ${cleanRepoName}`} size="small" className={classes.badgePill} />
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
            href={`https://github.com/${slug}/pulls`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textTransform: 'none', fontWeight: 700 }}
          >
            Create / View PR
          </Button>
        </Box>
      </Box>

      {/* Metrics Row */}
      <Grid container spacing={3} style={{ marginBottom: 24 }}>
        <Grid item xs={12} sm={4}>
          <Card className={classes.statCard}>
            <Typography variant="body2" color="textSecondary" style={{ fontWeight: 600 }}>Total Pull Requests</Typography>
            <Typography className={classes.statNumber}>{pulls.length}</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card className={classes.statCard}>
            <Typography variant="body2" color="textSecondary" style={{ fontWeight: 600 }}>Open Reviews</Typography>
            <Typography className={classes.statNumber} style={{ color: '#16a34a' }}>{openPulls}</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card className={classes.statCard}>
            <Typography variant="body2" color="textSecondary" style={{ fontWeight: 600 }}>Merged / Closed</Typography>
            <Typography className={classes.statNumber} style={{ color: '#64748b' }}>{closedPulls}</Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Filter Toolbar */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <TextField
          size="small"
          variant="outlined"
          placeholder="Filter pull requests by title, author, or state..."
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
          Showing {filteredPulls.length} of {pulls.length} PRs
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
                <TableCell style={{ fontWeight: 700, width: 80 }}>#</TableCell>
                <TableCell style={{ fontWeight: 700 }}>Pull Request Title</TableCell>
                <TableCell style={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell style={{ fontWeight: 700 }}>Author</TableCell>
                <TableCell style={{ fontWeight: 700 }}>Created</TableCell>
                <TableCell style={{ fontWeight: 700, textAlign: 'center' }}>Review Link</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPulls.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" style={{ padding: 32, color: '#64748b' }}>
                    No pull requests currently open for this component repository.
                  </TableCell>
                </TableRow>
              ) : (
                filteredPulls.map((p: any) => {
                  const isOpen = p.state === 'open';

                  return (
                    <TableRow key={p.number} hover>
                      <TableCell style={{ fontWeight: 600, color: '#64748b' }}>#{p.number}</TableCell>
                      <TableCell style={{ fontWeight: 600 }}>{p.title}</TableCell>
                      <TableCell>
                        <Chip
                          label={p.state}
                          size="small"
                          className={isOpen ? classes.statusOpen : classes.statusClosed}
                        />
                      </TableCell>
                      <TableCell>{p.author || 'contributor'}</TableCell>
                      <TableCell>{p.created ? new Date(p.created).toLocaleDateString() : 'recently'}</TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          variant="outlined"
                          color="primary"
                          href={p.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          endIcon={<OpenInNewIcon fontSize="small" />}
                          style={{ textTransform: 'none' }}
                        >
                          Review PR
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
