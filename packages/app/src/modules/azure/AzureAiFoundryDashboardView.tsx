import React, { useState } from 'react';
import useAsync from 'react-use/lib/useAsync';
import Alert from '@material-ui/lab/Alert';
import {
  Box,
  Card,
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
  Tabs,
  Tab,
  LinearProgress,
  CircularProgress,
} from '@material-ui/core';
import MemoryIcon from '@material-ui/icons/Memory';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import EcoIcon from '@material-ui/icons/Eco';
import HubIcon from '@material-ui/icons/DeviceHub';
import ViewListIcon from '@material-ui/icons/ViewList';
import LaunchIcon from '@material-ui/icons/Launch';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import SpeedIcon from '@material-ui/icons/Speed';
import RefreshIcon from '@material-ui/icons/Refresh';

const useStyles = makeStyles(theme => ({
  heroBanner: {
    background: 'linear-gradient(135deg, #1e1b4b 0%, #31104b 50%, #0f172a 100%)',
    color: '#ffffff',
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(3.5, 4),
    marginBottom: theme.spacing(3),
    border: '1px solid rgba(255, 255, 255, 0.12)',
  },
  statCard: {
    padding: theme.spacing(2.5),
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[1],
  },
  statNumber: {
    fontWeight: 800,
    fontSize: '2rem',
    margin: theme.spacing(0.5, 0),
  },
  subTabContainer: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    marginBottom: theme.spacing(3),
  },
}));

export const AzureAiFoundryDashboardView = () => {
  const classes = useStyles();
  const [activeSubTab, setActiveSubTab] = useState(0);

  const { value: aiData, loading, error, retry } = useAsync(async () => {
    const res = await fetch('/api/azure-deploy/ai-foundry-costs');
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return await res.json();
  }, []);

  const models = aiData?.models || [];
  const modelCount = models.length;

  return (
    <Box p={3}>
      {/* Top Banner */}
      <Box className={classes.heroBanner}>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Box>
            <Box display="flex" alignItems="center" gap={1.5} mb={1}>
              <Chip
                label="LIVE AZURE TELEMETRY"
                size="small"
                style={{ backgroundColor: '#7c3aed', color: '#ffffff', fontWeight: 800, fontSize: '0.7rem' }}
              />
              <Chip
                label="PRODUCTION CLOUD"
                size="small"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', color: '#ffffff', fontWeight: 700, fontSize: '0.7rem' }}
              />
            </Box>
            <Typography variant="h5" style={{ fontWeight: 800, marginBottom: 6 }}>
              Azure AI Foundry & GenAI FinOps Telemetry
            </Typography>
            <Typography variant="body2" style={{ color: 'rgba(255, 255, 255, 0.85)', maxWidth: 850 }}>
              Live model inference spend, metered token rates, and LLM budget guardrails across Azure OpenAI and Azure AI Studio hubs.
            </Typography>
          </Box>
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              onClick={() => retry()}
              style={{ color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.4)', textTransform: 'none' }}
            >
              <RefreshIcon style={{ marginRight: 6, fontSize: 18 }} />
              Refresh
            </Button>
            <Button
              variant="contained"
              href="https://ai.azure.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ backgroundColor: '#ffffff', color: '#1e1b4b', fontWeight: 700, textTransform: 'none' }}
            >
              <LaunchIcon style={{ marginRight: 6, fontSize: 18, color: '#7c3aed' }} />
              Launch Azure AI Studio
            </Button>
          </Box>
        </Box>
      </Box>

      {error && (
        <Box mb={3}>
          <Alert severity="error">
            <strong>Error loading Azure AI Foundry data:</strong> {error.message}
          </Alert>
        </Box>
      )}

      {aiData?.apiError && (
        <Box mb={3}>
          <Alert severity="warning">
            <strong>Azure AI Foundry Telemetry Notice:</strong> {aiData.apiError}
            <br />
            To stream live deployments and token usage from Subscription <code>{aiData.subscriptionId}</code>, ensure your Service Principal has the <strong>Reader</strong> or <strong>Cognitive Services Contributor</strong> role assigned under <em>Azure Portal → Subscriptions → Access control (IAM)</em>.
          </Alert>
        </Box>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Top KPI Cards */}
          <Grid container spacing={3} style={{ marginBottom: 24 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card className={classes.statCard}>
                <Typography variant="overline" color="textSecondary" style={{ fontWeight: 700 }}>
                  GenAI Month-to-Date Spend
                </Typography>
                <Typography className={classes.statNumber} style={{ color: '#0f3156' }}>
                  {aiData?.totalAiSpendFormatted || '$0.00'}
                </Typography>
                <Box mt={1}>
                  <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography variant="caption" color="textSecondary">
                      Budget: {aiData?.currency === 'INR' ? '₹25,000' : '$300.00'}
                    </Typography>
                    <Typography variant="caption" style={{ fontWeight: 700, color: '#059669' }}>
                      {aiData?.percentOfBudget || 0}% Used
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={aiData?.percentOfBudget || 0}
                    style={{ height: 6, borderRadius: 3, backgroundColor: '#e2e8f0' }}
                  />
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card className={classes.statCard}>
                <Typography variant="overline" color="textSecondary" style={{ fontWeight: 700 }}>
                  Total Tokens Processed
                </Typography>
                <Typography className={classes.statNumber} style={{ color: '#7c3aed' }}>
                  {aiData?.totalTokensProcessed || '0'}
                </Typography>
                <Typography variant="caption" style={{ color: '#059669', fontWeight: 600 }}>
                  {modelCount > 0 ? `Across ${modelCount} Deployed Foundry Models` : 'No Deployed Models in Subscription'}
                </Typography>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card className={classes.statCard}>
                <Typography variant="overline" color="textSecondary" style={{ fontWeight: 700 }}>
                  Deployed Models Count
                </Typography>
                <Typography className={classes.statNumber} style={{ color: '#0284c7' }}>
                  {modelCount}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {modelCount > 0 ? 'Active Cognitive Services Deployments' : 'Zero Active AI Endpoints'}
                </Typography>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card className={classes.statCard}>
                <Typography variant="overline" color="textSecondary" style={{ fontWeight: 700 }}>
                  Potential Monthly Savings
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography className={classes.statNumber} style={{ color: '#059669' }}>
                    {aiData?.potentialSavings || '$0.00'}
                  </Typography>
                  <EcoIcon style={{ color: '#059669', fontSize: 24 }} />
                </Box>
                <Typography variant="caption" style={{ color: '#059669', fontWeight: 700 }}>
                  {(aiData?.optimizations || []).length} Optimization Opportunities
                </Typography>
              </Card>
            </Grid>
          </Grid>

          {/* Sub Tab Navigation */}
          <Tabs
            value={activeSubTab}
            onChange={(_, val) => setActiveSubTab(val)}
            indicatorColor="primary"
            textColor="primary"
            className={classes.subTabContainer}
          >
            <Tab icon={<ViewListIcon style={{ fontSize: 18 }} />} label="Deployed Models & Unit Economics" style={{ fontWeight: 700, textTransform: 'none' }} />
            <Tab icon={<TrendingUpIcon style={{ fontSize: 18 }} />} label="Token Consumption & Spend Velocity" style={{ fontWeight: 700, textTransform: 'none' }} />
            <Tab icon={<HubIcon style={{ fontSize: 18 }} />} label="Cost by Application & Project" style={{ fontWeight: 700, textTransform: 'none' }} />
            <Tab icon={<EcoIcon style={{ fontSize: 18 }} />} label="GenAI FinOps Optimization" style={{ fontWeight: 700, textTransform: 'none' }} />
          </Tabs>

          {/* TAB 0: DEPLOYED MODELS TABLE */}
          {activeSubTab === 0 && (
            <Box>
              <Box mb={2}>
                <Typography variant="subtitle1" style={{ fontWeight: 700, color: '#0f3156' }}>
                  Azure AI Foundry Active Model Deployments & Inference Rates
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Real-time per-model pricing, total processed token counts, and target business workloads.
                </Typography>
              </Box>

              <TableContainer component={Paper} variant="outlined" style={{ borderRadius: 8 }}>
                <Table size="medium">
                  <TableHead style={{ backgroundColor: '#f8fafc' }}>
                    <TableRow>
                      <TableCell style={{ fontWeight: 700 }}>Model Deployment</TableCell>
                      <TableCell style={{ fontWeight: 700 }}>Provider & Catalog</TableCell>
                      <TableCell style={{ fontWeight: 700 }}>TPM Quota</TableCell>
                      <TableCell style={{ fontWeight: 700 }}>Input Rate / 1k</TableCell>
                      <TableCell style={{ fontWeight: 700 }}>Output Rate / 1k</TableCell>
                      <TableCell style={{ fontWeight: 700 }}>Tokens MTD</TableCell>
                      <TableCell style={{ fontWeight: 700 }}>Actual Spend</TableCell>
                      <TableCell style={{ fontWeight: 700 }}>Health</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {models.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center" style={{ padding: 36 }}>
                          <Typography variant="body2" color="textSecondary">
                            {aiData?.apiError
                              ? 'Live model query blocked by Azure authorization. See the permission notice above.'
                              : 'No Azure AI or Cognitive Services models currently deployed in this subscription.'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      models.map((m: any) => (
                        <TableRow key={m.id} hover>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <MemoryIcon style={{ color: '#7c3aed', fontSize: 20 }} />
                              <Box>
                                <Typography variant="subtitle2" style={{ fontWeight: 700, color: '#0f3156' }}>
                                  {m.name}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  Version: {m.version} | {m.deploymentType}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" style={{ fontWeight: 500 }}>
                              {m.provider}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip label={m.tpmQuota} size="small" variant="outlined" style={{ fontWeight: 600 }} />
                          </TableCell>
                          <TableCell style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                            ${m.promptCostPer1k.toFixed(5)}
                          </TableCell>
                          <TableCell style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                            ${m.completionCostPer1k.toFixed(5)}
                          </TableCell>
                          <TableCell style={{ fontWeight: 700, color: '#7c3aed' }}>
                            {m.totalTokens}
                          </TableCell>
                          <TableCell>
                            <Typography variant="subtitle2" style={{ fontWeight: 800, color: '#0f3156' }}>
                              {m.spendCurrency}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {m.costPercentage}% of AI budget
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={<CheckCircleIcon style={{ fontSize: 14, color: '#059669' }} />}
                              label={m.status}
                              size="small"
                              style={{ backgroundColor: '#d1fae5', color: '#065f46', fontWeight: 700 }}
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* TAB 1: CONSUMPTION & TOKEN TREND */}
          {activeSubTab === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={7}>
                <Card variant="outlined" style={{ borderRadius: 8, padding: 24, height: '100%' }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="subtitle1" style={{ fontWeight: 700, color: '#0f3156' }}>
                      Daily Token Velocity
                    </Typography>
                    <Chip label="Live Inference" size="small" style={{ backgroundColor: '#ede9fe', color: '#6d28d9', fontWeight: 700 }} />
                  </Box>
                  <Typography variant="body2" color="textSecondary" style={{ marginBottom: 16 }}>
                    30-day inference volume curve across Azure OpenAI endpoints.
                  </Typography>

                  {modelCount === 0 ? (
                    <Box py={6} textAlign="center">
                      <Typography variant="body2" color="textSecondary">
                        No active token velocity. Deploy a model in Azure AI Studio to stream live telemetry.
                      </Typography>
                    </Box>
                  ) : (
                    <Paper variant="outlined" style={{ padding: '12px 16px', backgroundColor: '#f8fafc', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
                      <Typography variant="caption" color="textSecondary">
                        Active Model Deployments: <strong>{modelCount}</strong>
                      </Typography>
                      <Chip label="Telemetry Active" size="small" style={{ backgroundColor: '#d1fae5', color: '#065f46', fontWeight: 700 }} />
                    </Paper>
                  )}
                </Card>
              </Grid>

              <Grid item xs={12} md={5}>
                <Card variant="outlined" style={{ borderRadius: 8, padding: 24, height: '100%' }}>
                  <Typography variant="subtitle1" style={{ fontWeight: 700, color: '#0f3156', marginBottom: 8 }}>
                    Token Composition Analysis
                  </Typography>
                  <Typography variant="body2" color="textSecondary" style={{ marginBottom: 20 }}>
                    Distribution between Prompt tokens (Input) and Completion tokens (Generated Output).
                  </Typography>

                  {modelCount === 0 ? (
                    <Box py={4} textAlign="center">
                      <Typography variant="body2" color="textSecondary">
                        No token consumption recorded for subscription {aiData?.subscriptionId}.
                      </Typography>
                    </Box>
                  ) : (
                    <Box mb={3}>
                      <Box display="flex" justifyContent="space-between" mb={0.5}>
                        <Typography variant="body2" style={{ fontWeight: 600 }}>
                          Prompt & Completion Metering
                        </Typography>
                        <Typography variant="body2" style={{ fontWeight: 700, color: '#7c3aed' }}>
                          Streaming Live
                        </Typography>
                      </Box>
                      <LinearProgress variant="indeterminate" style={{ height: 8, borderRadius: 4, backgroundColor: '#ede9fe' }} />
                    </Box>
                  )}

                  <Paper variant="outlined" style={{ padding: 16, backgroundColor: '#fdf4ff', borderRadius: 6, border: '1px solid #f0abfc', marginTop: 16 }}>
                    <Typography variant="caption" style={{ fontWeight: 700, color: '#86198f' }}>
                      Economic Takeaway:
                    </Typography>
                    <Typography variant="caption" display="block" style={{ color: '#4a044e', marginTop: 4 }}>
                      {modelCount > 0
                        ? 'Token consumption is metered in real-time. Utilizing prompt caching and lighter deployment SKUs optimizes overall AI invoice.'
                        : 'Deploy models in Azure AI Foundry to monitor prompt vs completion unit economics.'}
                    </Typography>
                  </Paper>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* TAB 2: COST BY APPLICATION & PROJECT */}
          {activeSubTab === 2 && (
            <Box>
              <Box mb={2}>
                <Typography variant="subtitle1" style={{ fontWeight: 700, color: '#0f3156' }}>
                  GenAI Model Cost Allocation by Application Service
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Shows which registered Backstage catalog service accounts for your Azure AI inference bill.
                </Typography>
              </Box>

              {(aiData?.projectAllocations || []).length === 0 ? (
                <Card variant="outlined" style={{ padding: 36, textAlign: 'center' }}>
                  <Typography variant="body2" color="textSecondary">
                    No service cost allocations found. As catalog workloads invoke Azure AI endpoints, costs will display here dynamically.
                  </Typography>
                </Card>
              ) : (
                <Grid container spacing={3}>
                  {(aiData?.projectAllocations || []).map((p: any, idx: number) => (
                    <Grid item xs={12} sm={6} md={3} key={idx}>
                      <Card variant="outlined" style={{ borderRadius: 8, padding: 20 }}>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <SpeedIcon style={{ color: '#0284c7' }} />
                          <Typography variant="subtitle2" style={{ fontWeight: 700 }}>
                            {p.project}
                          </Typography>
                        </Box>
                        <Typography variant="h5" style={{ fontWeight: 800, color: '#0f3156', margin: '8px 0' }}>
                          {p.cost}
                        </Typography>
                        <Typography variant="caption" color="textSecondary" display="block" style={{ marginBottom: 8 }}>
                          Primary Model: <strong>{p.model}</strong>
                        </Typography>
                        <Box display="flex" justifyContent="space-between" mb={0.5}>
                          <Typography variant="caption" color="textSecondary">Share of AI Spend</Typography>
                          <Typography variant="caption" style={{ fontWeight: 700 }}>{p.share}%</Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={p.share} style={{ height: 6, borderRadius: 3 }} />
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}

          {/* TAB 3: GENAI FINOPS OPTIMIZATION */}
          {activeSubTab === 3 && (
            <Box>
              <Box mb={2}>
                <Typography variant="subtitle1" style={{ fontWeight: 700, color: '#0f3156' }}>
                  AI Foundry Cost Optimization Recommendations & Guardrails
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Automated architectural recommendations to achieve higher accuracy at lower token spend.
                </Typography>
              </Box>

              {(aiData?.optimizations || []).length === 0 ? (
                <Card variant="outlined" style={{ padding: 36, textAlign: 'center' }}>
                  <Typography variant="body2" color="textSecondary">
                    No active FinOps optimization recommendations for the current AI deployments.
                  </Typography>
                </Card>
              ) : (
                <TableContainer component={Paper} variant="outlined" style={{ borderRadius: 8 }}>
                  <Table size="medium">
                    <TableHead style={{ backgroundColor: '#f8fafc' }}>
                      <TableRow>
                        <TableCell style={{ fontWeight: 700, width: 120 }}>Rule ID</TableCell>
                        <TableCell style={{ fontWeight: 700 }}>Recommendation Details</TableCell>
                        <TableCell style={{ fontWeight: 700, width: 180 }}>Category</TableCell>
                        <TableCell style={{ fontWeight: 700, width: 140 }}>Impact</TableCell>
                        <TableCell style={{ fontWeight: 700, width: 180 }}>Projected Savings</TableCell>
                        <TableCell style={{ fontWeight: 700, width: 120 }}>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(aiData?.optimizations || []).map((opt: any) => (
                        <TableRow key={opt.id} hover>
                          <TableCell style={{ fontFamily: 'monospace', fontWeight: 700, color: '#7c3aed' }}>
                            {opt.id}
                          </TableCell>
                          <TableCell>
                            <Typography variant="subtitle2" style={{ fontWeight: 700, color: '#0f3156' }}>
                              {opt.title}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {opt.description}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip label={opt.category} size="small" variant="outlined" />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={opt.impact}
                              size="small"
                              style={{
                                backgroundColor: opt.impact.includes('High') ? '#dcfce7' : '#fef3c7',
                                color: opt.impact.includes('High') ? '#166534' : '#92400e',
                                fontWeight: 700,
                              }}
                            />
                          </TableCell>
                          <TableCell style={{ fontWeight: 800, color: '#059669', fontSize: '0.95rem' }}>
                            {opt.savings}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="small"
                              variant="outlined"
                              color="primary"
                              href="https://ai.azure.com"
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ textTransform: 'none', fontWeight: 700 }}
                            >
                              Apply in Studio
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
        </>
      )}
    </Box>
  );
};
