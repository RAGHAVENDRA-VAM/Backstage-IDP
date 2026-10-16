import React from 'react';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  Typography,
  makeStyles,
} from '@material-ui/core';
import { useNavigate } from 'react-router-dom';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import LibraryBooksIcon from '@material-ui/icons/LibraryBooks';
import CodeIcon from '@material-ui/icons/Code';
import StorageIcon from '@material-ui/icons/Storage';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import SecurityIcon from '@material-ui/icons/Security';
import SpeedIcon from '@material-ui/icons/Speed';
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser';
import AccountBalanceIcon from '@material-ui/icons/AccountBalance';
import AssessmentIcon from '@material-ui/icons/Assessment';
import CloudQueueIcon from '@material-ui/icons/CloudQueue';

const useStyles = makeStyles(theme => ({
  hero: {
    background: 'linear-gradient(135deg, #091b33 0%, #112d53 45%, #184379 100%)',
    color: '#ffffff',
    padding: theme.spacing(5, 5),
    borderRadius: theme.shape.borderRadius * 2,
    marginBottom: theme.spacing(4),
    boxShadow: '0 12px 35px rgba(9, 27, 51, 0.35)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  heroBadgeRow: {
    display: 'flex',
    gap: theme.spacing(1),
    flexWrap: 'wrap',
    marginBottom: theme.spacing(2),
  },
  heroBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    color: '#7df3e1',
    fontWeight: 700,
    fontSize: '0.78rem',
    border: '1px solid rgba(125, 243, 225, 0.35)',
  },
  heroTitle: {
    fontWeight: 800,
    fontSize: '2.5rem',
    letterSpacing: '-0.5px',
    marginBottom: theme.spacing(1.5),
  },
  heroSubtitle: {
    color: 'rgba(255, 255, 255, 0.88)',
    maxWidth: 780,
    fontSize: '1.08rem',
    lineHeight: 1.65,
    marginBottom: theme.spacing(3),
  },
  heroButtonPrimary: {
    backgroundColor: '#00c389',
    color: '#ffffff',
    fontWeight: 700,
    padding: theme.spacing(1.2, 3),
    marginRight: theme.spacing(2),
    borderRadius: 6,
    '&:hover': {
      backgroundColor: '#00a372',
    },
  },
  heroButtonSecondary: {
    borderColor: 'rgba(255, 255, 255, 0.6)',
    color: '#ffffff',
    fontWeight: 600,
    padding: theme.spacing(1.2, 3),
    borderRadius: 6,
    '&:hover': {
      borderColor: '#ffffff',
      backgroundColor: 'rgba(255, 255, 255, 0.12)',
    },
  },
  statCard: {
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius * 1.5,
    padding: theme.spacing(2.5),
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    boxShadow: theme.shadows[1],
  },
  statIconBox: {
    width: 48,
    height: 48,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing(2),
    flexShrink: 0,
  },
  sectionTitle: {
    fontWeight: 700,
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(0.5),
  },
  sectionSubtitle: {
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(3),
    fontSize: '0.95rem',
  },
  pillarCard: {
    height: '100%',
    borderRadius: theme.shape.borderRadius * 1.5,
    border: `1px solid ${theme.palette.divider}`,
    transition: 'all 0.25s ease',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: theme.shadows[8],
      borderColor: '#184379',
    },
  },
  templateCard: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: theme.shape.borderRadius * 1.5,
    border: `1px solid ${theme.palette.divider}`,
    transition: 'all 0.2s ease',
    '&:hover': {
      borderColor: '#184379',
      boxShadow: theme.shadows[4],
    },
  },
  templateTag: {
    fontSize: '0.72rem',
    fontWeight: 600,
    marginRight: theme.spacing(0.5),
    marginBottom: theme.spacing(0.5),
  },
  complianceBanner: {
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius * 1.5,
    padding: theme.spacing(3, 4),
    marginTop: theme.spacing(4),
  },
}));

export const HomePage: React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();

  const metrics = [
    {
      label: 'Core Insurance Domains',
      value: 'Policy, Claims, Rating',
      icon: <AccountBalanceIcon style={{ color: '#184379' }} />,
      bg: '#e8f0fe',
    },
    {
      label: 'Cloud Deployment Velocity',
      value: '99.98% Multi-Region SLA',
      icon: <SpeedIcon style={{ color: '#00c389' }} />,
      bg: '#e6f9f3',
    },
    {
      label: 'Security & Compliance',
      value: 'ACORD & SOC2 Ready',
      icon: <VerifiedUserIcon style={{ color: '#8e24aa' }} />,
      bg: '#f3e5f5',
    },
    {
      label: 'Managed APIs & Contracts',
      value: '12 Standard Endpoints',
      icon: <CodeIcon style={{ color: '#f57c00' }} />,
      bg: '#fff3e0',
    },
  ];

  const insurancePillars = [
    {
      domain: 'Claims Processing',
      subtitle: 'First Notice of Loss (FNOL) & Settlement',
      desc: 'Event-driven claim ingestion, automated loss verification, and payment processing microservices.',
      tech: 'Java Spring Boot • RabbitMQ • Azure App Service',
      route: '/create/templates/default/java-springboot-enterprise',
      color: '#00c389',
    },
    {
      domain: 'Underwriting & Rating',
      subtitle: 'High-Throughput Risk Calculation Engine',
      desc: 'Real-time policy premium calculation, actuarial algorithm execution, and risk assessment APIs.',
      tech: '.NET 8 C# • OpenAPI/Swagger • Azure Web App',
      route: '/create/templates/default/dotnet-webapi-enterprise',
      color: '#184379',
    },
    {
      domain: 'Insurance Cloud Infrastructure',
      subtitle: 'Automated Azure Cloud Governance',
      desc: 'One-click self-service provisioning of compliant Azure Web Apps with Terraform & GitHub Actions.',
      tech: 'Terraform • Azure App Service • GitHub Actions',
      route: '/create/templates/default/golden-path-webapp',
      color: '#8e24aa',
    },
    {
      domain: 'AI Underwriting Document Extraction',
      subtitle: 'GenAI Policy & Claim Assistant',
      desc: 'Retrieval-Augmented Generation (RAG) assistant for medical records, claim photos, and policy PDFs.',
      tech: 'Python FastAPI • LangChain • Vector Retrieval',
      route: '/create/templates/default/enterprise-rag-application',
      color: '#f57c00',
    },
  ];

  const quickLinks = [
    { title: 'Service Catalog', desc: 'Browse all 8 registered insurance applications & components.', route: '/catalog', icon: <StorageIcon /> },
    { title: 'Insurance API Explorer', desc: 'Inspect OpenAPI contracts for Policy, Quote & Claim APIs.', route: '/api-docs', icon: <CodeIcon /> },
    { title: 'Architecture TechDocs', desc: 'Read centralized architecture decision records (ADRs).', route: '/docs', icon: <LibraryBooksIcon /> },
    { title: 'Azure DevOps Boards', desc: 'Create tasks, user stories, and bug tickets in ADO.', route: '/create/templates/default/ado-work-item', icon: <AssessmentIcon /> },
  ];

  return (
    <Container maxWidth="xl" style={{ paddingTop: 28, paddingBottom: 56 }}>
      {/* Hero Section */}
      <Box className={classes.hero}>
        <Box className={classes.heroBadgeRow}>
          <Chip label="Insurance Enterprise Platform" size="small" className={classes.heroBadge} />
          <Chip label="ACORD Framework Compliant" size="small" className={classes.heroBadge} />
          <Chip label="Cloud-Native Golden Paths" size="small" className={classes.heroBadge} />
        </Box>
        <Typography variant="h3" className={classes.heroTitle}>
          Shield Insurance Developer Portal
        </Typography>
        <Typography variant="body1" className={classes.heroSubtitle}>
          The unified internal developer platform for insurance engineering. Accelerating policy issuance, underwriting automation, and claims processing with pre-approved cloud golden paths and continuous governance.
        </Typography>

        <Box display="flex" flexWrap="wrap">
          <Button
            variant="contained"
            className={classes.heroButtonPrimary}
            startIcon={<AddCircleOutlineIcon />}
            onClick={() => navigate('/create')}
          >
            Scaffold Service
          </Button>
          <Button
            variant="contained"
            style={{ backgroundColor: '#184379', color: '#ffffff', fontWeight: 700, marginRight: 16, border: '1px solid rgba(255, 255, 255, 0.4)' }}
            startIcon={<CloudQueueIcon />}
            onClick={() => navigate('/create/templates/default/deploy-app-to-azure-webapp')}
          >
            Deploy App to Azure
          </Button>
          <Button
            variant="outlined"
            className={classes.heroButtonSecondary}
            startIcon={<StorageIcon />}
            onClick={() => navigate('/catalog')}
          >
            View Active Components
          </Button>
        </Box>
      </Box>

      {/* KPI & Metric Strip */}
      <Box mb={5}>
        <Grid container spacing={3}>
          {metrics.map(metric => (
            <Grid item xs={12} sm={6} md={3} key={metric.label}>
              <Box className={classes.statCard}>
                <Box className={classes.statIconBox} style={{ backgroundColor: metric.bg }}>
                  {metric.icon}
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary" style={{ fontWeight: 600 }}>
                    {metric.label}
                  </Typography>
                  <Typography variant="h6" style={{ fontWeight: 800, lineHeight: 1.2 }}>
                    {metric.value}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Core Insurance Pillars & Golden Paths */}
      <Box mb={5}>
        <Typography variant="h5" className={classes.sectionTitle}>
          Insurance Domain Golden Paths
        </Typography>
        <Typography variant="body2" className={classes.sectionSubtitle}>
          Enterprise architectural blueprints standardized across all Lines of Business (LOB).
        </Typography>
        <Grid container spacing={3}>
          {insurancePillars.map(pillar => (
            <Grid item xs={12} sm={6} md={6} key={pillar.domain}>
              <Card className={classes.pillarCard}>
                <CardContent style={{ padding: 24 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                    <Typography variant="h6" style={{ fontWeight: 800 }}>
                      {pillar.domain}
                    </Typography>
                    <Chip
                      label="Production Ready"
                      size="small"
                      style={{ backgroundColor: '#e6f9f3', color: '#00a372', fontWeight: 700, fontSize: '0.72rem' }}
                    />
                  </Box>
                  <Typography variant="subtitle2" style={{ color: pillar.color, fontWeight: 700, marginBottom: 8 }}>
                    {pillar.subtitle}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" style={{ marginBottom: 16 }}>
                    {pillar.desc}
                  </Typography>
                  <Divider style={{ marginBottom: 16 }} />
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" color="textSecondary" style={{ fontWeight: 600 }}>
                      {pillar.tech}
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      color="primary"
                      endIcon={<ArrowForwardIcon />}
                      onClick={() => navigate(pillar.route)}
                    >
                      Scaffold
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Fast Navigation Grid */}
      <Box mb={5}>
        <Typography variant="h5" className={classes.sectionTitle}>
          Developer Tooling & Resources
        </Typography>
        <Typography variant="body2" className={classes.sectionSubtitle}>
          Direct shortcuts to enterprise documentation, API registries, and issue tracking.
        </Typography>
        <Grid container spacing={3}>
          {quickLinks.map(link => (
            <Grid item xs={12} sm={6} md={3} key={link.title}>
              <Card className={classes.pillarCard}>
                <CardActionArea style={{ height: '100%', padding: 20 }} onClick={() => navigate(link.route)}>
                  <Box color="primary.main" mb={1.5}>
                    {link.icon}
                  </Box>
                  <Typography variant="subtitle1" style={{ fontWeight: 700, marginBottom: 4 }}>
                    {link.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {link.desc}
                  </Typography>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Enterprise Security & Compliance Assurance */}
      <Box className={classes.complianceBanner}>
        <Grid container alignItems="center" spacing={3}>
          <Grid item xs={12} md={8}>
            <Box display="flex" alignItems="center" mb={1}>
              <SecurityIcon color="primary" style={{ marginRight: 10, fontSize: 32 }} />
              <Typography variant="h6" style={{ fontWeight: 800 }}>
                Enterprise Insurance Security & Compliance by Default
              </Typography>
            </Box>
            <Typography variant="body2" color="textSecondary">
              All scaffolded services adhere to insurance regulatory mandates: automated SAST security scanning, zero secret exposure, Terraform cloud governance, and multi-region failover configurations.
            </Typography>
          </Grid>
          <Grid item xs={12} md={4} style={{ textAlign: 'right' }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<SpeedIcon />}
              onClick={() => navigate('/create')}
            >
              Browse All 8 Templates
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};
