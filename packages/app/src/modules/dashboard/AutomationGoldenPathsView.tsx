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
import PlayCircleOutlineIcon from '@material-ui/icons/PlayCircleOutline';
import AssignmentIcon from '@material-ui/icons/Assignment';
import CloudQueueIcon from '@material-ui/icons/CloudQueue';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import GitHubIcon from '@material-ui/icons/GitHub';
import { useNavigate } from 'react-router-dom';

const useStyles = makeStyles(theme => ({
  heroBanner: {
    background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)',
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
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: theme.shadows[3],
    },
  },
  statNumber: {
    fontWeight: 800,
    fontSize: '2rem',
  },
  actionCard: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[1],
  },
  tableRow: {
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
}));

export const AutomationGoldenPathsView: React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();

  const templates = [
    {
      title: 'Deploy App to Azure Web App',
      category: 'Cloud Deployment',
      description: 'One-click automated deployment of any selected GitHub repository to a live Azure Web App with automated pre-purge.',
      route: '/create/templates/default/deploy-app-to-azure-webapp',
      status: 'Ready',
      icon: <CloudQueueIcon style={{ color: '#0078d4' }} />,
    },
    {
      title: 'Azure DevOps Work Item Creation',
      category: 'Agile Workflow',
      description: 'Create user stories, bugs, and tasks directly in Azure DevOps Boards with live project/type selection and token fallback.',
      route: '/create/templates/default/ado-work-item',
      status: 'Ready',
      icon: <AssignmentIcon style={{ color: '#0078d4' }} />,
    },
    {
      title: 'Automated Azure Cloud Governance',
      category: 'Infrastructure as Code',
      description: 'One-click self-service provisioning of compliant Azure Web Apps with Terraform modules, isolated VNets, and GitHub Actions.',
      route: '/create/templates/default/deploy-app-to-azure-webapp',
      status: 'Ready',
      icon: <PlayCircleOutlineIcon style={{ color: '#10b981' }} />,
    },
  ];

  return (
    <Box p={3}>
      {/* Automation Banner */}
      <Box className={classes.heroBanner}>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h5" style={{ fontWeight: 800, marginBottom: 6 }}>
              Automation & Golden Paths Command
            </Typography>
            <Typography variant="body2" style={{ color: 'rgba(255, 255, 255, 0.85)', maxWidth: 850 }}>
              Eliminate tickets with self-service developer templates, automated repository bootstrapping, compliant Azure Web App provisioning, and CI/CD pipeline automation.
            </Typography>
          </Box>
          <Box display="flex" gap={1}>
            <Button
              variant="contained"
              style={{ backgroundColor: '#ffffff', color: '#065f46', fontWeight: 700, textTransform: 'none' }}
              onClick={() => navigate('/create')}
            >
              <PlayCircleOutlineIcon style={{ marginRight: 6, fontSize: 18 }} />
              Open Scaffolder Wizard
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Metrics */}
      <Grid container spacing={3} style={{ marginBottom: 24 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.card}>
            <CardContent>
              <Typography variant="overline" color="textSecondary" style={{ fontWeight: 700 }}>
                Average Provisioning Time
              </Typography>
              <Typography className={classes.statNumber} style={{ color: '#10b981' }}>
                90 sec
              </Typography>
              <Typography variant="caption" style={{ color: '#10b981', fontWeight: 600 }}>
                Down from 3-5 business days
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.card}>
            <CardContent>
              <Typography variant="overline" color="textSecondary" style={{ fontWeight: 700 }}>
                Self-Service Golden Paths
              </Typography>
              <Typography className={classes.statNumber} style={{ color: '#0284c7' }}>
                3 Live
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Standardized enterprise blueprints
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.card}>
            <CardContent>
              <Typography variant="overline" color="textSecondary" style={{ fontWeight: 700 }}>
                Automated Deployments
              </Typography>
              <Typography className={classes.statNumber} style={{ color: '#7c3aed' }}>
                187 Runs
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Executed via GitHub Actions
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.card}>
            <CardContent>
              <Typography variant="overline" color="textSecondary" style={{ fontWeight: 700 }}>
                Manual Ticket Reduction
              </Typography>
              <Typography className={classes.statNumber} style={{ color: '#10b981' }}>
                85%
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Zero infrastructure tickets needed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Golden Path Cards */}
      <Typography variant="h6" style={{ fontWeight: 700, marginBottom: 16 }}>
        Active Golden Path Blueprints (Scaffolder Templates)
      </Typography>
      <Grid container spacing={3}>
        {templates.map(t => (
          <Grid item xs={12} md={4} key={t.title}>
            <Card className={classes.actionCard}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
                  <Box display="flex" alignItems="center" gap={1}>
                    {t.icon}
                    <Typography variant="h6" style={{ fontWeight: 700, fontSize: '1.05rem' }}>
                      {t.title}
                    </Typography>
                  </Box>
                  <Chip label={t.status} size="small" style={{ backgroundColor: '#ecfdf5', color: '#059669', fontWeight: 700 }} />
                </Box>
                <Chip label={t.category} size="small" style={{ marginBottom: 12, fontSize: '0.72rem', height: 22 }} />
                <Typography variant="body2" color="textSecondary" style={{ minHeight: 60, lineHeight: 1.5 }}>
                  {t.description}
                </Typography>
                <Box mt={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={() => navigate(t.route)}
                    style={{ textTransform: 'none', fontWeight: 700 }}
                  >
                    Launch Blueprint →
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
