import React from 'react';
import {
  Box,
  Card,
  CardContent,
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
} from '@material-ui/core';
import SecurityIcon from '@material-ui/icons/Security';
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser';
import WarningIcon from '@material-ui/icons/Warning';
import PolicyIcon from '@material-ui/icons/Policy';
import LockIcon from '@material-ui/icons/Lock';
import LaunchIcon from '@material-ui/icons/Launch';

const useStyles = makeStyles(theme => ({
  heroBanner: {
    background: 'linear-gradient(135deg, #1e1b4b 0%, #064e3b 100%)',
    color: '#ffffff',
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(3.5, 4),
    marginBottom: theme.spacing(3),
    border: '1px solid rgba(255, 255, 255, 0.12)',
  },
  card: {
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[1],
    height: '100%',
  },
  statNumber: {
    fontWeight: 800,
    fontSize: '2rem',
  },
  tableRow: {
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
}));

export const DevSecOpsView: React.FC = () => {
  const classes = useStyles();

  const securityPolicies = [
    {
      rule: 'SEC-001: Mandatory Dependabot & SCA Scanning',
      category: 'Software Supply Chain',
      status: 'Passed',
      coverage: '100% of Repositories',
      severity: 'Critical / High Blocked',
    },
    {
      rule: 'SEC-002: Static Application Security Testing (SAST)',
      category: 'Code Quality Gate',
      status: 'Passed',
      coverage: 'CloudTSC/QualityGates',
      severity: 'SonarQube Quality Gate A',
    },
    {
      rule: 'SEC-003: Azure Key Vault Secret Isolation',
      category: 'Cloud Credentials',
      status: 'Passed',
      coverage: 'Azure West US 3',
      severity: 'No Hardcoded Secrets',
    },
    {
      rule: 'SEC-004: Container Image Vulnerability Audit (Trivy)',
      category: 'Container Security',
      status: 'Passed',
      coverage: 'Azure Container Registry',
      severity: '0 Critical CVEs',
    },
    {
      rule: 'SEC-005: Branch Protection & Required Peer Approvals',
      category: 'Governance & Auditing',
      status: 'Passed',
      coverage: 'Main / Production Branches',
      severity: 'Minimum 1 Sr. Approval',
    },
  ];

  return (
    <Box p={3}>
      {/* DevSecOps Banner */}
      <Box className={classes.heroBanner}>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h5" style={{ fontWeight: 800, marginBottom: 6 }}>
              Security Management & DevSecOps Compliance
            </Typography>
            <Typography variant="body2" style={{ color: 'rgba(255, 255, 255, 0.85)', maxWidth: 850 }}>
              Automated policy gates, static analysis thresholds (SAST), dependency vulnerability management (SCA), and secret scanning enforced through CloudTSC Quality Gates.
            </Typography>
          </Box>
          <Box display="flex" gap={1}>
            <Button
              variant="contained"
              href="https://github.com/CloudTSC/QualityGates"
              target="_blank"
              style={{ backgroundColor: '#ffffff', color: '#1e1b4b', fontWeight: 700, textTransform: 'none' }}
            >
              <SecurityIcon style={{ marginRight: 6, fontSize: 18, color: '#059669' }} />
              Inspect QualityGates Repo
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Security Stat Cards */}
      <Grid container spacing={3} style={{ marginBottom: 24 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.card}>
            <CardContent>
              <Typography variant="overline" color="textSecondary" style={{ fontWeight: 700 }}>
                Security Compliance Score
              </Typography>
              <Typography className={classes.statNumber} style={{ color: '#10b981' }}>
                98.4%
              </Typography>
              <Typography variant="caption" style={{ color: '#10b981', fontWeight: 600 }}>
                ✓ SOC2 & ISO-27001 Ready
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.card}>
            <CardContent>
              <Typography variant="overline" color="textSecondary" style={{ fontWeight: 700 }}>
                Critical CVEs in Production
              </Typography>
              <Typography className={classes.statNumber} style={{ color: '#10b981' }}>
                0
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Zero open critical vulnerabilities
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.card}>
            <CardContent>
              <Typography variant="overline" color="textSecondary" style={{ fontWeight: 700 }}>
                Quality Gate Enforcement
              </Typography>
              <Typography className={classes.statNumber} style={{ color: '#3b82f6' }}>
                100%
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Active on all pull requests
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.card}>
            <CardContent>
              <Typography variant="overline" color="textSecondary" style={{ fontWeight: 700 }}>
                Secrets Leaked
              </Typography>
              <Typography className={classes.statNumber} style={{ color: '#10b981' }}>
                0
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Gitleaks pre-commit active
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Security Policies Table */}
      <Card className={classes.card}>
        <Box p={2.5} borderBottom="1px solid rgba(0, 0, 0, 0.08)" display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6" style={{ fontWeight: 700 }}>
              Enterprise DevSecOps Guardrails & Quality Policies
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Enforced automatically in GitHub Actions pipelines before any artifact can reach Azure Web Apps.
            </Typography>
          </Box>
          <Chip label="All Guardrails Active" size="small" style={{ backgroundColor: '#ecfdf5', color: '#059669', fontWeight: 700 }} />
        </Box>
        <TableContainer component={Paper} elevation={0}>
          <Table size="medium">
            <TableHead style={{ backgroundColor: '#f8fafc' }}>
              <TableRow>
                <TableCell style={{ fontWeight: 700 }}>Security Guardrail</TableCell>
                <TableCell style={{ fontWeight: 700 }}>Category</TableCell>
                <TableCell style={{ fontWeight: 700 }}>Scope / Target</TableCell>
                <TableCell style={{ fontWeight: 700 }}>Enforcement Criteria</TableCell>
                <TableCell style={{ fontWeight: 700 }}>Audit Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {securityPolicies.map(p => (
                <TableRow key={p.rule} className={classes.tableRow}>
                  <TableCell style={{ fontWeight: 600 }}>{p.rule}</TableCell>
                  <TableCell>
                    <Chip label={p.category} size="small" style={{ fontSize: '0.72rem', height: 22 }} />
                  </TableCell>
                  <TableCell style={{ color: '#4b5563', fontWeight: 500 }}>{p.coverage}</TableCell>
                  <TableCell style={{ fontWeight: 600 }}>{p.severity}</TableCell>
                  <TableCell>
                    <Chip
                      icon={<VerifiedUserIcon style={{ fontSize: 16, color: '#059669' }} />}
                      label="Enforced"
                      size="small"
                      style={{ backgroundColor: '#ecfdf5', color: '#059669', fontWeight: 700 }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
};
