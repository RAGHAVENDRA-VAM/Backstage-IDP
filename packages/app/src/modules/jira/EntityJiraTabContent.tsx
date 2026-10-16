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
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import RefreshIcon from '@material-ui/icons/Refresh';
import LaunchIcon from '@material-ui/icons/Launch';
import useAsync from 'react-use/lib/useAsync';
import { useEntity } from '@backstage/plugin-catalog-react';

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3),
  },
  banner: {
    background: 'linear-gradient(90deg, #005B4B 0%, #006D8F 100%)',
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
    fontSize: '1.85rem',
    letterSpacing: '-0.3px',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
  },
  bannerSubtitle: {
    color: 'rgba(255, 255, 255, 0.90)',
    maxWidth: 820,
    fontSize: '0.98rem',
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
  statusChip: {
    fontWeight: 700,
    fontSize: '0.72rem',
  },
  statusDone: {
    backgroundColor: 'rgba(75, 184, 165, 0.15)',
    color: '#187656',
    border: '1px solid rgba(75, 184, 165, 0.35)',
  },
  statusInProgress: {
    backgroundColor: 'rgba(14, 165, 233, 0.15)',
    color: '#0369a1',
    border: '1px solid rgba(14, 165, 233, 0.35)',
  },
  statusTodo: {
    backgroundColor: 'rgba(148, 163, 184, 0.15)',
    color: '#475569',
    border: '1px solid rgba(148, 163, 184, 0.35)',
  },
}));

export const EntityJiraTabContent = () => {
  const classes = useStyles();
  const { entity } = useEntity();
  const [filterQuery, setFilterQuery] = useState('');

  const entityName = entity?.metadata?.name || '';
  const entityTitle = entity?.metadata?.title || entityName;
  const projectKey = entity?.metadata?.annotations?.['jira/project-key'] ||
    (entityName.toLowerCase().includes('risk') ? 'RISK' : 'SCRUM');

  const isRisk = projectKey === 'RISK' || entityName.toLowerCase().includes('risk');

  // Query real Jira issues directly for this specific projectKey
  const { value, loading, error, retry } = useAsync(async () => {
    const res = await fetch(`/api/integrations-proxy/jira/issues?project=${encodeURIComponent(projectKey)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data;
  }, [projectKey]);

  const issues = value?.issues || [];

  const displayedIssues = issues.filter((i: any) =>
    i.key.toLowerCase().includes(filterQuery.toLowerCase()) ||
    i.summary.toLowerCase().includes(filterQuery.toLowerCase()) ||
    i.status.toLowerCase().includes(filterQuery.toLowerCase()) ||
    (i.assignee && i.assignee.toLowerCase().includes(filterQuery.toLowerCase()))
  );

  return (
    <Box className={classes.root}>
      {/* Header Banner */}
      <Box className={classes.banner}>
        <Box>
          <Typography className={classes.bannerTitle}>
            <CheckCircleIcon style={{ fontSize: 32 }} />
            {entityTitle} — Jira Agile Backlog & Delivery Tickets
          </Typography>
          <Typography className={classes.bannerSubtitle}>
            {isRisk
              ? 'Active user stories, risk evaluation workflows, liability assessments, and automated severity escalation tickets tracked in Jira Cloud.'
              : 'End-to-end claims intake, FNOL registration, duplicate detection, policy verification, and claims workspace tickets tracked in Jira Cloud.'}
          </Typography>
          <Box className={classes.badgeRow}>
            <Chip label="Jira Cloud: valuemomentum-tsc" size="small" className={classes.badgePill} />
            <Chip label={`Project: ${projectKey}`} size="small" className={classes.badgePill} />
            <Chip label={`Component Domain: ${isRisk ? 'Risk Analysis & Scoring' : 'Claims Intake & FNOL'}`} size="small" className={classes.badgePill} />
            <Chip label="Realtime Sync: Active" size="small" className={classes.badgePill} />
          </Box>
        </Box>

        <Box display="flex" gap={1.5} alignItems="center">
          <Button
            variant="contained"
            color="default"
            startIcon={<OpenInNewIcon />}
            href="https://valuemomentum-tsc.atlassian.net"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontWeight: 700, textTransform: 'none' }}
          >
            Open in Jira
          </Button>
        </Box>
      </Box>

      {/* KPI Stats for this Component */}
      <Grid container spacing={3} style={{ marginBottom: 24 }}>
        <Grid item xs={12} sm={4}>
          <Card className={classes.statCard}>
            <Typography variant="overline" color="textSecondary" style={{ fontWeight: 700 }}>
              Domain Specific Tickets
            </Typography>
            <Typography className={classes.statNumber}>
              {displayedIssues.length} Issues
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Filtered for {entityTitle}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card className={classes.statCard}>
            <Typography variant="overline" color="textSecondary" style={{ fontWeight: 700 }}>
              Primary Workflow Focus
            </Typography>
            <Typography className={classes.statNumber} style={{ fontSize: '1.4rem' }}>
              {isRisk ? 'Risk & Liability Engine' : 'FNOL & Claims Processing'}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Sprint Intake Alignment
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card className={classes.statCard}>
            <Typography variant="overline" color="textSecondary" style={{ fontWeight: 700 }}>
              Target Delivery Sprint
            </Typography>
            <Typography className={classes.statNumber} style={{ color: '#187656' }}>
              Sprint 2026.4
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Active in JIRA SCRUM board
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Issues Table */}
      <Card variant="outlined" style={{ borderRadius: 8 }}>
        <Box p={2.5} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="subtitle1" style={{ fontWeight: 700 }}>
              {entityTitle} Delivery Issues & User Stories ({displayedIssues.length})
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Directly synchronized from Atlassian Jira Cloud (Project: SCRUM)
            </Typography>
          </Box>
          <Box display="flex" gap={1.5} alignItems="center">
            <TextField
              variant="outlined"
              size="small"
              placeholder="Search component tickets..."
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
          </Box>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" p={6}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box p={4} textAlign="center" color="error.main">
            Failed to load Jira tickets: {error.message}
          </Box>
        ) : (
          <TableContainer component={Paper} elevation={0}>
            <Table size="medium">
              <TableHead style={{ backgroundColor: '#f8fafc' }}>
                <TableRow>
                  <TableCell style={{ fontWeight: 700, width: 120 }}>Issue Key</TableCell>
                  <TableCell style={{ fontWeight: 700 }}>User Story / Summary</TableCell>
                  <TableCell style={{ fontWeight: 700, width: 110 }}>Type</TableCell>
                  <TableCell style={{ fontWeight: 700, width: 130 }}>Status</TableCell>
                  <TableCell style={{ fontWeight: 700, width: 110 }}>Priority</TableCell>
                  <TableCell style={{ fontWeight: 700, width: 160 }}>Assignee</TableCell>
                  <TableCell style={{ fontWeight: 700, width: 90 }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayedIssues.map((issue: any) => (
                  <TableRow key={issue.key} hover>
                    <TableCell style={{ fontWeight: 700, color: '#005B4B' }}>
                      {issue.key}
                    </TableCell>
                    <TableCell style={{ fontWeight: 500 }}>
                      {issue.summary}
                    </TableCell>
                    <TableCell>
                      <Chip label={issue.issueType || 'Story'} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={issue.status}
                        size="small"
                        className={`${classes.statusChip} ${
                          issue.status.toLowerCase().includes('done') || issue.status.toLowerCase().includes('closed')
                            ? classes.statusDone
                            : issue.status.toLowerCase().includes('progress')
                            ? classes.statusInProgress
                            : classes.statusTodo
                        }`}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip label={issue.priority || 'Medium'} size="small" />
                    </TableCell>
                    <TableCell>{issue.assignee || 'Unassigned'}</TableCell>
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
      </Card>
    </Box>
  );
};
