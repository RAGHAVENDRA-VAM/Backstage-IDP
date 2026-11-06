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
import MenuBookIcon from '@material-ui/icons/MenuBook';
import AccountTreeIcon from '@material-ui/icons/AccountTree';
import LayersIcon from '@material-ui/icons/Layers';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import { useNavigate } from 'react-router-dom';

const useStyles = makeStyles(theme => ({
  heroBanner: {
    background: 'linear-gradient(135deg, #1e293b 0%, #0f766e 100%)',
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

export const ArchitectureGovernanceView: React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();

  const standards = [
    {
      domain: 'API Standards',
      standard: 'OpenAPI 3.1 & RESTful Semantic Versioning',
      compliance: '100%',
      adherence: 'Enforced',
      details: 'All microservices must publish OpenAPI definitions with contract tests.',
    },
    {
      domain: 'Documentation',
      standard: 'TechDocs Docs-like-Code (mkdocs.yml)',
      compliance: '94%',
      adherence: 'Enforced',
      details: 'Architecture Decision Records (ADRs) maintained in markdown within repository.',
    },
    {
      domain: 'Cloud Infrastructure',
      standard: 'Terraform Golden Modules & Azure App Service SKU Policy',
      compliance: '100%',
      adherence: 'Enforced',
      details: 'Mandatory isolated VNets, HTTPS enforcement, and managed identity access.',
    },
    {
      domain: 'Service Ownership',
      standard: 'Backstage Catalog Metadata & Platform Engineering Ownership',
      compliance: '100%',
      adherence: 'Enforced',
      details: 'Every cloud entity must map to a designated team owner and Jira project key.',
    },
    {
      domain: 'AI Governance',
      standard: 'Azure AI Foundry Prompt Token & Unit Cost Tracking',
      compliance: '98%',
      adherence: 'Enforced',
      details: 'Strict token velocity ceilings and prompt safety guardrails applied.',
    },
  ];

  return (
    <Box p={3}>
      {/* Governance Banner */}
      <Box className={classes.heroBanner}>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h5" style={{ fontWeight: 800, marginBottom: 6 }}>
              Design & Architecture Governance Command
            </Typography>
            <Typography variant="body2" style={{ color: 'rgba(255, 255, 255, 0.85)', maxWidth: 850 }}>
              Enterprise architectural standards, TechDocs docs-as-code, Architecture Decision Records (ADRs), API schema governance, and service ownership tracking.
            </Typography>
          </Box>
          <Box display="flex" gap={1}>
            <Button
              variant="contained"
              style={{ backgroundColor: '#ffffff', color: '#0f766e', fontWeight: 700, textTransform: 'none' }}
              onClick={() => navigate('/docs')}
            >
              <MenuBookIcon style={{ marginRight: 6, fontSize: 18 }} />
              Open TechDocs
            </Button>
            <Button
              variant="outlined"
              style={{ borderColor: 'rgba(255, 255, 255, 0.6)', color: '#ffffff', fontWeight: 700, textTransform: 'none' }}
              onClick={() => navigate('/catalog')}
            >
              <LayersIcon style={{ marginRight: 6, fontSize: 18 }} />
              Inspect Catalog Entities
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Governance Metrics */}
      <Grid container spacing={3} style={{ marginBottom: 24 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.card}>
            <CardContent>
              <Typography variant="overline" color="textSecondary" style={{ fontWeight: 700 }}>
                Architecture Compliance
              </Typography>
              <Typography className={classes.statNumber} style={{ color: '#059669' }}>
                98.6%
              </Typography>
              <Typography variant="caption" style={{ color: '#059669', fontWeight: 600 }}>
                Enterprise Standards Met
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.card}>
            <CardContent>
              <Typography variant="overline" color="textSecondary" style={{ fontWeight: 700 }}>
                Services Cataloged
              </Typography>
              <Typography className={classes.statNumber} style={{ color: '#0284c7' }}>
                6 Core
              </Typography>
              <Typography variant="caption" color="textSecondary">
                With 100% owner attribution
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.card}>
            <CardContent>
              <Typography variant="overline" color="textSecondary" style={{ fontWeight: 700 }}>
                TechDocs Coverage
              </Typography>
              <Typography className={classes.statNumber} style={{ color: '#7c3aed' }}>
                94%
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Living documentation in git
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.card}>
            <CardContent>
              <Typography variant="overline" color="textSecondary" style={{ fontWeight: 700 }}>
                Active ADRs
              </Typography>
              <Typography className={classes.statNumber} style={{ color: '#d97706' }}>
                24 Decisions
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Approved by Architecture Review
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Enterprise Standards Table */}
      <Card className={classes.card}>
        <Box p={2.5} borderBottom="1px solid rgba(0, 0, 0, 0.08)" display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6" style={{ fontWeight: 700 }}>
              Enterprise Architecture Framework & Guardrails
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Governing cloud patterns, API contracts, documentation, and compliance across all business domains.
            </Typography>
          </Box>
          <Chip label="Governance Engine Active" size="small" style={{ backgroundColor: '#ecfdf5', color: '#059669', fontWeight: 700 }} />
        </Box>
        <TableContainer component={Paper} elevation={0}>
          <Table size="medium">
            <TableHead style={{ backgroundColor: '#f8fafc' }}>
              <TableRow>
                <TableCell style={{ fontWeight: 700 }}>Domain</TableCell>
                <TableCell style={{ fontWeight: 700 }}>Standard Specification</TableCell>
                <TableCell style={{ fontWeight: 700 }}>Compliance Rate</TableCell>
                <TableCell style={{ fontWeight: 700 }}>Enforcement</TableCell>
                <TableCell style={{ fontWeight: 700 }}>Architecture Requirement</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {standards.map(s => (
                <TableRow key={s.domain} className={classes.tableRow}>
                  <TableCell style={{ fontWeight: 700, color: '#0f766e' }}>{s.domain}</TableCell>
                  <TableCell style={{ fontWeight: 600 }}>{s.standard}</TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <CheckCircleIcon style={{ color: '#10b981', fontSize: 18 }} />
                      <span style={{ fontWeight: 700, color: '#047857' }}>{s.compliance}</span>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={s.adherence} size="small" style={{ backgroundColor: '#e0f2fe', color: '#0369a1', fontWeight: 700 }} />
                  </TableCell>
                  <TableCell style={{ color: '#4b5563', fontSize: '0.85rem' }}>{s.details}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
};
