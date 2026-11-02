import React, { useState, useEffect } from 'react';
import {
  makeStyles,
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Divider,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@material-ui/core';
import BubbleChartIcon from '@material-ui/icons/BubbleChart';
import BugReportIcon from '@material-ui/icons/BugReport';
import MenuBookIcon from '@material-ui/icons/MenuBook';
import CodeIcon from '@material-ui/icons/Code';
import SendIcon from '@material-ui/icons/Send';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import WarningIcon from '@material-ui/icons/Warning';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import CloudDoneIcon from '@material-ui/icons/CloudDone';
import RefreshIcon from '@material-ui/icons/Refresh';
import { Header, Page, Content } from '@backstage/core-components';

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(1),
  },
  headerBanner: {
    background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0284c7 100%)',
    color: '#ffffff',
    borderRadius: 12,
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
  },
  bannerTitle: {
    fontWeight: 800,
    fontSize: '1.75rem',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  bannerSubtitle: {
    opacity: 0.9,
    marginTop: 4,
    maxWidth: 720,
    fontSize: '0.95rem',
  },
  tabBar: {
    backgroundColor: theme.palette.background.paper,
    borderRadius: 10,
    marginBottom: theme.spacing(3),
    border: `1px solid ${theme.palette.divider}`,
  },
  card: {
    borderRadius: 12,
    border: `1px solid ${theme.palette.divider}`,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  chatContainer: {
    height: 520,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.palette.type === 'dark' ? '#18181b' : '#f8fafc',
    borderRadius: 8,
    border: `1px solid ${theme.palette.divider}`,
    overflow: 'hidden',
  },
  chatMessages: {
    flex: 1,
    overflowY: 'auto',
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#0078D4',
    color: '#ffffff',
    padding: '12px 18px',
    borderRadius: '16px 16px 2px 16px',
    maxWidth: '75%',
    fontSize: '0.9rem',
    boxShadow: '0 2px 6px rgba(0,120,212,0.25)',
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: theme.palette.type === 'dark' ? '#27272a' : '#ffffff',
    color: theme.palette.text.primary,
    padding: '16px 20px',
    borderRadius: '16px 16px 16px 2px',
    maxWidth: '82%',
    fontSize: '0.9rem',
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    '& h3': {
      fontSize: '1.05rem',
      marginTop: 0,
      marginBottom: 8,
      fontWeight: 700,
      color: theme.palette.type === 'dark' ? '#60a5fa' : '#0284c7',
    },
    '& ul': {
      paddingLeft: 20,
      margin: '6px 0',
    },
    '& li': {
      marginBottom: 4,
    },
    '& code': {
      backgroundColor: theme.palette.type === 'dark' ? '#3f3f46' : '#e2e8f0',
      padding: '2px 6px',
      borderRadius: 4,
      fontFamily: 'monospace',
      fontSize: '0.85rem',
    },
  },
  codeBlock: {
    backgroundColor: theme.palette.type === 'dark' ? '#09090b' : '#1e293b',
    color: '#f8fafc',
    padding: 14,
    borderRadius: 8,
    fontFamily: 'Consolas, Monaco, monospace',
    fontSize: '0.85rem',
    overflowX: 'auto',
    position: 'relative',
    margin: '8px 0',
  },
  copyBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    color: '#94a3b8',
    backgroundColor: 'rgba(255,255,255,0.1)',
    '&:hover': {
      backgroundColor: 'rgba(255,255,255,0.2)',
      color: '#ffffff',
    },
  },
  inputArea: {
    padding: 12,
    backgroundColor: theme.palette.background.paper,
    borderTop: `1px solid ${theme.palette.divider}`,
    display: 'flex',
    gap: 8,
  },
  severityBadge: {
    fontWeight: 700,
    textTransform: 'uppercase',
    fontSize: '0.75rem',
    marginRight: 8,
  },
  promptChip: {
    margin: 4,
    cursor: 'pointer',
  },
}));

export const ShieldAiHubPage: React.FC = () => {
  const classes = useStyles();
  const [tabIndex, setTabIndex] = useState(0);

  // Tab 1: Chat Copilot State
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content: `### Welcome to Shield AI Copilot\n\nI am connected to your **Backstage Catalog**, **Azure West US 3 environment**, and **GitHub Actions CI/CD workflows**.\n\nAsk me about service owners, architecture standards, deployment steps, or cloud unit economics.`,
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Tab 2: Log Diagnostics State
  const sampleLogs: { [key: string]: string } = {
    npmError: `Module not found: Can't resolve '@material-ui/icons/Psychology' in '/app/packages/app/src/modules/dashboard/IntegrationsDashboardPage.tsx'
ERROR in ./src/modules/dashboard/IntegrationsDashboardPage.tsx 15:0-54
webpack 5.88.2 compiled with 1 error and 0 warnings in 4210 ms
error Command failed with exit code 1.`,
    oomError: `<--- Last few GCs --->
[31:0x55d1420]    84920 ms: Mark-sweep 2041.4 (2079.1) -> 2038.2 (2079.1) MB, 1420.2 / 0.0 ms  (average mu = 0.112, current mu = 0.004) allocation failure
FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory
1: 0xb09c10 node::Abort() [node]
2: 0xa1ca35  [node]
3: 0xcd2a03 v8::Utils::ReportOOMFailure(v8::internal::Isolate*, char const*, bool) [node]
Aborted (core dumped)
Process exited with code 137`,
    dbConnError: `2026-11-02T05:22:10.142Z [error] connect ECONNREFUSED 10.0.4.15:5432
at TCPConnectWrap.afterConnect [as oncomplete] (net.js:1146:16)
at Protocol.handshake (/app/node_modules/pg-protocol/dist/index.js:56:19)
Database connection failed: KnexTimeoutError: Knex: Timeout acquiring a connection. The pool is probably full.`,
    azureCrash: `2026-11-02T04:12:08.981Z ERROR - Container app-shield-claims-api_0_4e287a91 for site app-shield-claims-api did not respond to HTTP pings on port: 8080.
2026-11-02T04:12:09.102Z ERROR - Container app-shield-claims-api_0_4e287a91 didn't respond to HTTP pings on port: 8080, failing site start. See container logs for debugging.
2026-11-02T04:12:09.314Z INFO  - Stop container app-shield-claims-api_0_4e287a91`,
  };

  const [logInput, setLogInput] = useState(sampleLogs.npmError);
  const [logLoading, setLogLoading] = useState(false);
  const [logAnalysis, setLogAnalysis] = useState<any>(null);

  // Tab 3: TechDocs RAG State
  const [ragQuery, setRagQuery] = useState('What are the required security gates and SAST scans for pull requests?');
  const [ragLoading, setRagLoading] = useState(false);
  const [ragResult, setRagResult] = useState<any>(null);

  // Tab 4: AI Scaffolder State
  const [scaffoldPrompt, setScaffoldPrompt] = useState('Create a policyholder claim verification microservice with PostgreSQL connection pool and OAuth2 token verification');
  const [scaffoldService, setScaffoldService] = useState('claim-verification-service');
  const [scaffoldLang, setScaffoldLang] = useState('typescript');
  const [scaffoldLoading, setScaffoldLoading] = useState(false);
  const [scaffoldResult, setScaffoldResult] = useState<any>(null);
  const [activeFileTab, setActiveFileTab] = useState(0);

  // Handlers
  const handleSendChat = async (promptToSend?: string) => {
    const text = (promptToSend || chatInput).trim();
    if (!text || chatLoading) return;

    const newMsgs = [...chatMessages, { role: 'user' as const, content: text }];
    setChatMessages(newMsgs);
    setChatInput('');
    setChatLoading(true);

    try {
      const res = await fetch('/api/ai-assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMsgs }),
      });
      if (res.ok) {
        const data = await res.json();
        setChatMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        setChatMessages(prev => [...prev, { role: 'assistant', content: `Backend error HTTP ${res.status}` }]);
      }
    } catch (e: any) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: `Error: ${e.message}` }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleDiagnoseLog = async () => {
    if (!logInput.trim() || logLoading) return;
    setLogLoading(true);
    setLogAnalysis(null);

    try {
      const res = await fetch('/api/ai-assistant/diagnose-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logText: logInput, serviceName: 'shield-portal' }),
      });
      if (res.ok) {
        const data = await res.json();
        setLogAnalysis(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLogLoading(false);
    }
  };

  const handleSearchRag = async () => {
    if (!ragQuery.trim() || ragLoading) return;
    setRagLoading(true);

    try {
      const res = await fetch('/api/ai-assistant/techdocs-rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: ragQuery }),
      });
      if (res.ok) {
        const data = await res.json();
        setRagResult(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRagLoading(false);
    }
  };

  const handleScaffoldCode = async () => {
    if (!scaffoldPrompt.trim() || scaffoldLoading) return;
    setScaffoldLoading(true);

    try {
      const res = await fetch('/api/ai-assistant/scaffold-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: scaffoldPrompt,
          serviceName: scaffoldService,
          language: scaffoldLang,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setScaffoldResult(data);
        setActiveFileTab(0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setScaffoldLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const [aiStatus, setAiStatus] = useState<{ configured: boolean; model: string; endpointMasked: string | null } | null>(null);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);

  useEffect(() => {
    fetch('/api/ai-assistant/status')
      .then(res => res.json())
      .then(data => setAiStatus(data))
      .catch(() => {});
  }, []);

  return (
    <Page themeId="home">
      <Header
        title="Shield AI Hub"
        subtitle="Autonomous Platform Engineering, Incident Diagnostics, TechDocs RAG & Golden Path Scaffolding"
      />
      <Content>
        {/* Banner */}
        <div className={classes.headerBanner}>
          <div>
            <div className={classes.bannerTitle}>
              <BubbleChartIcon fontSize="large" style={{ color: '#38bdf8' }} />
              Shield AI & Intelligent IDP Suite
            </div>
            <Typography className={classes.bannerSubtitle}>
              Empowering engineers with 24/7 autonomous cloud guidance, real-time CI/CD root-cause log diagnostics, enterprise architecture RAG search, and generative golden path scaffolding.
            </Typography>
          </div>
          <Box display="flex" alignItems="center" gap={1}>
            <Tooltip title="Click to view Azure AI Foundry / OpenAI connection parameters">
              <Chip
                icon={<CloudDoneIcon style={{ color: aiStatus?.configured ? '#10b981' : '#f59e0b' }} />}
                label={
                  aiStatus?.configured
                    ? `Live: Azure AI Foundry (${aiStatus.model})`
                    : 'Embedded Engine (Click to Connect Live Foundry)'
                }
                onClick={() => setConfigDialogOpen(true)}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  color: '#ffffff',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              />
            </Tooltip>
          </Box>
        </div>

        {/* Real AI Connection Guide Dialog */}
        <Dialog open={configDialogOpen} onClose={() => setConfigDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle style={{ fontWeight: 700 }}>
            Connect Real Azure AI Foundry / OpenAI Model
          </DialogTitle>
          <DialogContent dividers>
            <Typography variant="body2" style={{ marginBottom: 12 }}>
              To replace default catalog responses with <strong>100% real live GPT-4o / Foundry responses</strong> across Chat, Log Diagnostics, TechDocs RAG, and Code Scaffolding, add these variables to your <code>.env</code> file (or Azure App Service Configuration):
            </Typography>

            <Paper variant="outlined" style={{ padding: 14, backgroundColor: '#0f172a', color: '#38bdf8', fontFamily: 'monospace', fontSize: '0.85rem' }}>
              <pre style={{ margin: 0 }}>{`# Azure AI Foundry / Azure OpenAI Model Credentials
AZURE_OPENAI_ENDPOINT=https://<your-resource-name>.openai.azure.com/
AZURE_OPENAI_KEY=<your-azure-foundry-or-openai-api-key>
AZURE_OPENAI_DEPLOYMENT=gpt-4o`}</pre>
            </Paper>

            <Typography variant="caption" color="textSecondary" style={{ display: 'block', marginTop: 12 }}>
              <strong>Where to find in Azure:</strong> Go to <strong>Azure AI Foundry Portal</strong> (ai.azure.com) → Project Overview → Deployments → Copy the Target Endpoint, Deployment Name (e.g. <code>gpt-4o</code>), and Key.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(
`# Azure AI Foundry / Azure OpenAI Model Credentials
AZURE_OPENAI_ENDPOINT=https://<your-resource-name>.openai.azure.com/
AZURE_OPENAI_KEY=<your-azure-foundry-or-openai-api-key>
AZURE_OPENAI_DEPLOYMENT=gpt-4o`
                );
              }}
              color="primary"
            >
              Copy Env Snippet
            </Button>
            <Button onClick={() => setConfigDialogOpen(false)} color="primary" variant="contained">
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Navigation Tabs */}
        <Paper className={classes.tabBar} elevation={0}>
          <Tabs
            value={tabIndex}
            onChange={(_, val) => setTabIndex(val)}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab icon={<BubbleChartIcon />} label="Shield AI Copilot" />
            <Tab icon={<BugReportIcon />} label="CI/CD & Azure Log Diagnostics" />
            <Tab icon={<MenuBookIcon />} label="TechDocs & Architecture RAG" />
            <Tab icon={<CodeIcon />} label="AI Golden Path Scaffolder" />
          </Tabs>
        </Paper>

        {/* TAB 0: SHIELD AI COPILOT */}
        {tabIndex === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card className={classes.card}>
                <CardContent style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 16 }}>
                  <div className={classes.chatContainer}>
                    <div className={classes.chatMessages}>
                      {chatMessages.map((m, idx) => (
                        <div
                          key={idx}
                          className={m.role === 'user' ? classes.userBubble : classes.assistantBubble}
                        >
                          <div
                            dangerouslySetInnerHTML={{
                              __html: m.content
                                .replace(/### (.*?)\n/g, '<h3>$1</h3>')
                                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                                .replace(/`([^`]+)`/g, '<code>$1</code>')
                                .replace(/\n- (.*?)(?=\n|$)/g, '<li>$1</li>')
                                .replace(/\n\n/g, '<br/>'),
                            }}
                          />
                        </div>
                      ))}
                      {chatLoading && (
                        <div className={classes.assistantBubble} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <CircularProgress size={18} />
                          <Typography variant="body2" color="textSecondary">
                            Shield AI Copilot is thinking...
                          </Typography>
                        </div>
                      )}
                    </div>
                    <div className={classes.inputArea}>
                      <TextField
                        fullWidth
                        variant="outlined"
                        size="small"
                        placeholder="Ask about microservices, owners, deployment runbooks, or architecture..."
                        value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendChat();
                          }
                        }}
                      />
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleSendChat()}
                        disabled={!chatInput.trim() || chatLoading}
                        endIcon={<SendIcon />}
                      >
                        Send
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card className={classes.card}>
                <CardContent>
                  <Typography variant="h6" style={{ fontWeight: 700, marginBottom: 12 }}>
                    Suggested Inquiries
                  </Typography>
                  <Typography variant="body2" color="textSecondary" style={{ marginBottom: 16 }}>
                    Click any quick prompt to query the embedded platform knowledge base:
                  </Typography>

                  <Box display="flex" flexDirection="column" gap={1}>
                    {[
                      'Which service is responsible for claims processing?',
                      'Who owns the risk-analysis service and what are its dependencies?',
                      'How do I deploy a new microservice to Azure West US 3?',
                      'What is our GenAI monthly spend and optimization strategy?',
                      'Explain the mandatory SAST and container security quality gates.',
                    ].map((prompt, i) => (
                      <Paper
                        key={i}
                        variant="outlined"
                        style={{
                          padding: '10px 14px',
                          cursor: 'pointer',
                          borderRadius: 8,
                          transition: 'all 0.2s',
                        }}
                        onClick={() => handleSendChat(prompt)}
                      >
                        <Typography variant="caption" style={{ fontWeight: 600, color: '#0284c7' }}>
                          PROMPT #{i + 1}
                        </Typography>
                        <Typography variant="body2" style={{ marginTop: 2 }}>
                          {prompt}
                        </Typography>
                      </Paper>
                    ))}
                  </Box>

                  <Divider style={{ margin: '20px 0' }} />

                  <Typography variant="subtitle2" style={{ fontWeight: 700 }}>
                    Active Context & Integrations
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={0.5} style={{ marginTop: 8 }}>
                    <Chip size="small" label="Catalog: 42 Entities" />
                    <Chip size="small" label="Azure: West US 3" />
                    <Chip size="small" label="Security: SonarQube & Trivy" />
                    <Chip size="small" label="FinOps: Azure OpenAI" />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* TAB 1: LOG DIAGNOSTICS & RCA */}
        {tabIndex === 1 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card className={classes.card}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom={1}>
                    <Typography variant="h6" style={{ fontWeight: 700 }}>
                      Incident & CI/CD Error Trace
                    </Typography>
                    <Box>
                      <Button
                        size="small"
                        variant="text"
                        onClick={() => setLogInput(sampleLogs.npmError)}
                      >
                        NPM Error
                      </Button>
                      <Button
                        size="small"
                        variant="text"
                        onClick={() => setLogInput(sampleLogs.oomError)}
                      >
                        OOM 137
                      </Button>
                      <Button
                        size="small"
                        variant="text"
                        onClick={() => setLogInput(sampleLogs.dbConnError)}
                      >
                        DB Timeout
                      </Button>
                      <Button
                        size="small"
                        variant="text"
                        onClick={() => setLogInput(sampleLogs.azureCrash)}
                      >
                        Azure Crash
                      </Button>
                    </Box>
                  </Box>

                  <TextField
                    fullWidth
                    multiline
                    minRows={12}
                    maxRows={16}
                    variant="outlined"
                    value={logInput}
                    onChange={e => setLogInput(e.target.value)}
                    placeholder="Paste broken CI/CD build log, Azure App Service trace, or container crash dump..."
                    style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
                  />

                  <Box display="flex" justifyContent="space-between" alignItems="center" marginTop={2}>
                    <Typography variant="caption" color="textSecondary">
                      AI analyzes error codes, stack traces, and environment anomalies.
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleDiagnoseLog}
                      disabled={logLoading || !logInput.trim()}
                      startIcon={logLoading ? <CircularProgress size={16} color="inherit" /> : <BugReportIcon />}
                    >
                      {logLoading ? 'Analyzing Trace...' : 'Diagnose with AI'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card className={classes.card}>
                <CardContent style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h6" style={{ fontWeight: 700, marginBottom: 12 }}>
                    AI Root Cause Analysis (RCA) & Suggested Fix
                  </Typography>

                  {!logAnalysis && !logLoading && (
                    <Box
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                      justifyContent="center"
                      height="100%"
                      minHeight={340}
                      color="text.secondary"
                    >
                      <BugReportIcon style={{ fontSize: 56, opacity: 0.3, marginBottom: 12 }} />
                      <Typography variant="body1">
                        Select a sample error log or paste your trace, then click <strong>Diagnose with AI</strong>.
                      </Typography>
                    </Box>
                  )}

                  {logLoading && (
                    <Box
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                      justifyContent="center"
                      height="100%"
                      minHeight={340}
                    >
                      <CircularProgress size={42} style={{ marginBottom: 16 }} />
                      <Typography variant="body1" style={{ fontWeight: 600 }}>
                        Triaging error logs with Shield AI diagnostic engine...
                      </Typography>
                    </Box>
                  )}

                  {logAnalysis && (
                    <Box display="flex" flexDirection="column" gap={2}>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box display="flex" alignItems="center">
                          <Chip
                            label={logAnalysis.severity}
                            style={{
                              backgroundColor:
                                logAnalysis.severity === 'critical'
                                  ? '#ef4444'
                                  : logAnalysis.severity === 'high'
                                  ? '#f97316'
                                  : '#eab308',
                              color: '#ffffff',
                              fontWeight: 700,
                              marginRight: 10,
                            }}
                          />
                          <Typography variant="subtitle1" style={{ fontWeight: 700 }}>
                            {logAnalysis.summary}
                          </Typography>
                        </Box>
                      </Box>

                      <Paper variant="outlined" style={{ padding: 12, backgroundColor: 'rgba(0,0,0,0.02)' }}>
                        <Typography variant="caption" style={{ fontWeight: 700, color: '#dc2626' }}>
                          ROOT CAUSE BREAKDOWN
                        </Typography>
                        <Typography variant="body2" style={{ marginTop: 4 }}>
                          {logAnalysis.rootCause}
                        </Typography>
                      </Paper>

                      <div>
                        <Typography variant="caption" style={{ fontWeight: 700 }}>
                          LOCATED OFFENDING TRACE
                        </Typography>
                        <div className={classes.codeBlock}>
                          <code>{logAnalysis.offendingLine}</code>
                        </div>
                      </div>

                      <Paper variant="outlined" style={{ padding: 12, borderLeft: '4px solid #10b981' }}>
                        <Typography variant="caption" style={{ fontWeight: 700, color: '#059669' }}>
                          RECOMMENDED RESOLUTION
                        </Typography>
                        <Typography variant="body2" style={{ marginTop: 4 }}>
                          {logAnalysis.suggestedFix}
                        </Typography>
                      </Paper>

                      <div>
                        <Typography variant="caption" style={{ fontWeight: 700 }}>
                          READY-TO-APPLY CODE / SCRIPT PATCH
                        </Typography>
                        <div className={classes.codeBlock}>
                          <Tooltip title="Copy Code Patch">
                            <IconButton
                              size="small"
                              className={classes.copyBtn}
                              onClick={() => copyToClipboard(logAnalysis.codePatch)}
                            >
                              <FileCopyIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <pre style={{ margin: 0 }}>{logAnalysis.codePatch}</pre>
                        </div>
                      </div>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* TAB 2: TECHDOCS & ARCHITECTURE RAG */}
        {tabIndex === 2 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card className={classes.card}>
                <CardContent>
                  <Typography variant="h6" style={{ fontWeight: 700, marginBottom: 8 }}>
                    Enterprise Architecture & TechDocs Semantic RAG
                  </Typography>
                  <Typography variant="body2" color="textSecondary" style={{ marginBottom: 16 }}>
                    Ask natural-language questions across Shield Insurance's Architecture Decision Records (ADRs), Security Policies, FinOps Directives, and API Contracts.
                  </Typography>

                  <Box display="flex" gap={1} marginBottom={2}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      size="small"
                      value={ragQuery}
                      onChange={e => setRagQuery(e.target.value)}
                      placeholder="e.g. What are the required security gates for pull requests? Or: How is West US 3 configured?"
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSearchRag();
                        }
                      }}
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleSearchRag}
                      disabled={ragLoading || !ragQuery.trim()}
                      startIcon={ragLoading ? <CircularProgress size={16} color="inherit" /> : <MenuBookIcon />}
                    >
                      {ragLoading ? 'Searching...' : 'Search Docs'}
                    </Button>
                  </Box>

                  <Box display="flex" flexWrap="wrap" gap={1} marginBottom={3}>
                    {[
                      'Security SAST gates and Trivy scan standards',
                      'Azure West US 3 App Service & Key Vault configuration',
                      'Azure OpenAI & Foundry cost governance guidelines',
                      'REST API versioning and RFC 7807 error schema',
                      'Zero-downtime blue/green deployment strategy',
                    ].map((q, i) => (
                      <Chip
                        key={i}
                        label={q}
                        size="small"
                        variant="outlined"
                        onClick={() => {
                          setRagQuery(q);
                        }}
                        style={{ cursor: 'pointer' }}
                      />
                    ))}
                  </Box>

                  {ragResult && (
                    <Box marginTop={2}>
                      <Paper
                        variant="outlined"
                        style={{
                          padding: 16,
                          borderRadius: 8,
                          backgroundColor: 'rgba(2, 132, 199, 0.05)',
                          borderLeft: '4px solid #0284c7',
                          marginBottom: 20,
                        }}
                      >
                        <Typography variant="subtitle2" style={{ fontWeight: 700, color: '#0284c7' }}>
                          Synthesized AI Answer (Confidence: {(ragResult.confidence * 100).toFixed(0)}%)
                        </Typography>
                        <Typography variant="body1" style={{ marginTop: 8, lineHeight: 1.6 }}>
                          {ragResult.answer}
                        </Typography>
                      </Paper>

                      <Typography variant="subtitle1" style={{ fontWeight: 700, marginBottom: 12 }}>
                        Verified Document Citations ({ragResult.citations.length})
                      </Typography>

                      <Grid container spacing={2}>
                        {ragResult.citations.map((doc: any) => (
                          <Grid item xs={12} md={6} key={doc.id}>
                            <Paper
                              variant="outlined"
                              style={{
                                padding: 14,
                                borderRadius: 8,
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                              }}
                            >
                              <div>
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                  <Typography variant="subtitle2" style={{ fontWeight: 700 }}>
                                    {doc.title}
                                  </Typography>
                                  <Chip size="small" label={doc.category} />
                                </Box>
                                <Typography
                                  variant="body2"
                                  color="textSecondary"
                                  style={{ marginTop: 8, lineHeight: 1.5 }}
                                >
                                  "{doc.snippet}"
                                </Typography>
                              </div>
                              <Box display="flex" justifyContent="space-between" alignItems="center" marginTop={2}>
                                <Box display="flex" gap={0.5}>
                                  {doc.tags.map((t: string) => (
                                    <Chip key={t} size="small" variant="outlined" label={t} style={{ fontSize: '0.7rem' }} />
                                  ))}
                                </Box>
                                <Button size="small" color="primary">
                                  View TechDoc →
                                </Button>
                              </Box>
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* TAB 3: AI GOLDEN PATH SCAFFOLDER */}
        {tabIndex === 3 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={5}>
              <Card className={classes.card}>
                <CardContent>
                  <Typography variant="h6" style={{ fontWeight: 700, marginBottom: 8 }}>
                    AI Golden Path Code Scaffolder
                  </Typography>
                  <Typography variant="body2" color="textSecondary" style={{ marginBottom: 16 }}>
                    Describe your intended microservice in natural language. Shield AI will synthesize compliant boilerplate, Dockerfiles, and GitHub Actions CI/CD workflows tailored to your spec.
                  </Typography>

                  <Box display="flex" flexDirection="column" gap={2}>
                    <TextField
                      fullWidth
                      label="Service Name"
                      variant="outlined"
                      size="small"
                      value={scaffoldService}
                      onChange={e => setScaffoldService(e.target.value)}
                    />

                    <FormControl fullWidth variant="outlined" size="small">
                      <InputLabel>Language & Framework</InputLabel>
                      <Select
                        value={scaffoldLang}
                        onChange={e => setScaffoldLang(e.target.value as string)}
                        label="Language & Framework"
                      >
                        <MenuItem value="typescript">TypeScript (Express.js / Node 20)</MenuItem>
                        <MenuItem value="java">Java 21 (Spring Boot 3.2)</MenuItem>
                        <MenuItem value="python">Python (FastAPI + Pydantic)</MenuItem>
                      </Select>
                    </FormControl>

                    <TextField
                      fullWidth
                      multiline
                      rows={5}
                      label="Service Prompt / Architecture Specifications"
                      variant="outlined"
                      value={scaffoldPrompt}
                      onChange={e => setScaffoldPrompt(e.target.value)}
                      placeholder="e.g. Create a policyholder claim verification microservice with PostgreSQL connection pool, OAuth2 token verification, and health check..."
                    />

                    <Box display="flex" flexWrap="wrap" gap={0.5}>
                      <Chip
                        size="small"
                        label="Claims API"
                        onClick={() =>
                          setScaffoldPrompt(
                            'Create a high-throughput claims payment settlement service with PostgreSQL audit logs and Azure Key Vault integration',
                          )
                        }
                      />
                      <Chip
                        size="small"
                        label="GenAI Model Wrapper"
                        onClick={() =>
                          setScaffoldPrompt(
                            'Create an Azure AI Foundry proxy API that routes prompts between GPT-4o and Phi-4 with token usage telemetry',
                          )
                        }
                      />
                    </Box>

                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleScaffoldCode}
                      disabled={scaffoldLoading || !scaffoldPrompt.trim()}
                      startIcon={scaffoldLoading ? <CircularProgress size={16} color="inherit" /> : <CodeIcon />}
                      style={{ marginTop: 8 }}
                    >
                      {scaffoldLoading ? 'Synthesizing Architecture...' : 'Generate Golden Path Service'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={7}>
              <Card className={classes.card}>
                <CardContent style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h6" style={{ fontWeight: 700, marginBottom: 12 }}>
                    Generated Production-Ready Artifacts
                  </Typography>

                  {!scaffoldResult && !scaffoldLoading && (
                    <Box
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                      justifyContent="center"
                      height="100%"
                      minHeight={340}
                      color="text.secondary"
                    >
                      <CodeIcon style={{ fontSize: 56, opacity: 0.3, marginBottom: 12 }} />
                      <Typography variant="body1">
                        Fill in your requirements and click <strong>Generate Golden Path Service</strong> to preview generated files.
                      </Typography>
                    </Box>
                  )}

                  {scaffoldLoading && (
                    <Box
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                      justifyContent="center"
                      height="100%"
                      minHeight={340}
                    >
                      <CircularProgress size={42} style={{ marginBottom: 16 }} />
                      <Typography variant="body1" style={{ fontWeight: 600 }}>
                        Generating production code, Dockerfile, and GitHub Actions CI/CD...
                      </Typography>
                    </Box>
                  )}

                  {scaffoldResult && (
                    <div>
                      <Paper variant="outlined" style={{ marginBottom: 12 }}>
                        <Tabs
                          value={activeFileTab}
                          onChange={(_, v) => setActiveFileTab(v)}
                          indicatorColor="primary"
                          textColor="primary"
                          variant="scrollable"
                          scrollButtons="auto"
                        >
                          {scaffoldResult.files.map((file: any, index: number) => (
                            <Tab key={index} label={file.path} />
                          ))}
                        </Tabs>
                      </Paper>

                      <div className={classes.codeBlock} style={{ minHeight: 380, maxHeight: 460 }}>
                        <Tooltip title="Copy File Content">
                          <IconButton
                            size="small"
                            className={classes.copyBtn}
                            onClick={() => copyToClipboard(scaffoldResult.files[activeFileTab].content)}
                          >
                            <FileCopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <pre style={{ margin: 0 }}>
                          {scaffoldResult.files[activeFileTab].content}
                        </pre>
                      </div>

                      <Box display="flex" justifyContent="space-between" alignItems="center" marginTop={2}>
                        <Chip
                          icon={<CheckCircleIcon style={{ color: '#10b981' }} />}
                          label="Adheres to SEC-008 & Azure West US 3 Standards"
                          variant="outlined"
                        />
                        <Button
                          variant="outlined"
                          color="primary"
                          startIcon={<FileCopyIcon />}
                          onClick={() => copyToClipboard(scaffoldResult.files[activeFileTab].content)}
                        >
                          Copy {scaffoldResult.files[activeFileTab].path}
                        </Button>
                      </Box>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Content>
    </Page>
  );
};
