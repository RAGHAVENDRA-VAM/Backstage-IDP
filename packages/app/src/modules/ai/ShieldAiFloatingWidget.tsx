import React, { useState, useRef, useEffect } from 'react';
import {
  makeStyles,
  Fab,
  Paper,
  Typography,
  IconButton,
  TextField,
  Chip,
  CircularProgress,
  Tooltip,
} from '@material-ui/core';
import BubbleChartIcon from '@material-ui/icons/BubbleChart';
import CloseIcon from '@material-ui/icons/Close';
import SendIcon from '@material-ui/icons/Send';
import LaunchIcon from '@material-ui/icons/Launch';
import RefreshIcon from '@material-ui/icons/Refresh';
import { useNavigate, useLocation } from 'react-router-dom';

const useStyles = makeStyles(theme => ({
  fabContainer: {
    position: 'fixed',
    bottom: 24,
    right: 28,
    zIndex: 99999,
    transition: 'all 0.3s ease',
  },
  fabContainerScaffolder: {
    position: 'fixed',
    bottom: 84,
    right: 28,
    zIndex: 99999,
    transition: 'all 0.3s ease',
  },
  fab: {
    background: 'linear-gradient(135deg, #0078D4 0%, #7B1FA2 100%)',
    color: '#ffffff',
    boxShadow: '0 6px 20px rgba(0, 120, 212, 0.45)',
    fontWeight: 600,
    textTransform: 'none',
    padding: '0 16px',
    height: 48,
    borderRadius: 24,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    '&:hover': {
      background: 'linear-gradient(135deg, #106EBE 0%, #6A1B9A 100%)',
      boxShadow: '0 8px 25px rgba(0, 120, 212, 0.6)',
    },
  },
  chatWindow: {
    position: 'fixed',
    bottom: 84,
    right: 28,
    width: 390,
    height: 540,
    maxHeight: 'calc(100vh - 110px)',
    zIndex: 99999,
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 16,
    boxShadow: '0 16px 40px rgba(0,0,0,0.28)',
    overflow: 'hidden',
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
  },
  header: {
    background: 'linear-gradient(135deg, #0078D4 0%, #7B1FA2 100%)',
    color: '#ffffff',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
  },
  messageList: {
    flex: 1,
    overflowY: 'auto',
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    backgroundColor: theme.palette.type === 'dark' ? '#18181b' : '#f9fafb',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#0078D4',
    color: '#ffffff',
    padding: '10px 14px',
    borderRadius: '16px 16px 2px 16px',
    maxWidth: '82%',
    fontSize: '0.875rem',
    wordBreak: 'break-word',
    boxShadow: '0 2px 6px rgba(0,120,212,0.25)',
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: theme.palette.type === 'dark' ? '#27272a' : '#ffffff',
    color: theme.palette.text.primary,
    padding: '12px 14px',
    borderRadius: '16px 16px 16px 2px',
    maxWidth: '88%',
    fontSize: '0.875rem',
    wordBreak: 'break-word',
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
    '& h3': {
      fontSize: '0.95rem',
      margin: '0 0 6px 0',
      fontWeight: 600,
    },
    '& ul': {
      paddingLeft: 18,
      margin: '4px 0',
    },
    '& p': {
      margin: '4px 0',
    },
    '& code': {
      backgroundColor: theme.palette.type === 'dark' ? '#3f3f46' : '#e5e7eb',
      padding: '2px 4px',
      borderRadius: 4,
      fontSize: '0.8rem',
      fontFamily: 'monospace',
    },
  },
  chipContainer: {
    padding: '8px 12px',
    backgroundColor: theme.palette.background.paper,
    borderTop: `1px solid ${theme.palette.divider}`,
    display: 'flex',
    flexWrap: 'nowrap',
    overflowX: 'auto',
    gap: 6,
    '&::-webkit-scrollbar': {
      display: 'none',
    },
  },
  quickChip: {
    fontSize: '0.72rem',
    height: 24,
    cursor: 'pointer',
  },
  inputArea: {
    padding: '10px 12px',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.palette.background.paper,
    borderTop: `1px solid ${theme.palette.divider}`,
  },
  inputField: {
    flex: 1,
    '& .MuiOutlinedInput-root': {
      borderRadius: 20,
      padding: '4px 12px',
      fontSize: '0.875rem',
    },
  },
}));

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const ShieldAiFloatingWidget: React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if current page is within template execution / scaffolder wizard to avoid obscuring Next/Back buttons
  const isScaffolderForm = location.pathname.startsWith('/create') || location.pathname.includes('/templates/');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hello! I am your AI Developer Assistant. How can I assist you with your projects, deployments, or troubleshooting today?`,
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (open) {
      scrollToBottom();
    }
  }, [messages, open]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai-assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply || 'No answer generated.' }]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: `Failed to reach AI backend (HTTP ${response.status}). Please check network or backend configuration.`,
          },
        ]);
      }
    } catch (e: any) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `Error communicating with Shield AI: ${e.message}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickPrompts = [
    'Who owns claims-portal?',
    'Azure West US 3 specs',
    'How to scaffold new API?',
    'GenAI cost breakdown',
  ];

  return (
    <>
      <div className={isScaffolderForm ? classes.fabContainerScaffolder : classes.fabContainer}>
        {!open && (
          <Fab
            variant="extended"
            className={classes.fab}
            onClick={() => setOpen(true)}
          >
            <BubbleChartIcon />
            <span>Shield AI</span>
          </Fab>
        )}
      </div>

      {open && (
        <Paper elevation={8} className={classes.chatWindow}>
          {/* Header */}
          <div className={classes.header}>
            <div className={classes.headerTitle}>
              <BubbleChartIcon />
              <div>
                <Typography variant="subtitle2" style={{ fontWeight: 700, lineHeight: 1.2 }}>
                  Shield AI Copilot
                </Typography>
                <Typography variant="caption" style={{ opacity: 0.85, fontSize: '0.72rem' }}>
                  Platform Engineering Assistant
                </Typography>
              </div>
            </div>
            <div className={classes.headerActions}>
              <Tooltip title="Open Full Screen AI Hub">
                <IconButton
                  size="small"
                  style={{ color: '#ffffff', marginRight: 4 }}
                  onClick={() => {
                    setOpen(false);
                    navigate('/shield-ai');
                  }}
                >
                  <LaunchIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Clear Chat">
                <IconButton
                  size="small"
                  style={{ color: '#ffffff', marginRight: 4 }}
                  onClick={() =>
                    setMessages([
                      {
                        role: 'assistant',
                        content: `Chat history cleared. How can I help you today?`,
                      },
                    ])
                  }
                >
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <IconButton
                size="small"
                style={{ color: '#ffffff' }}
                onClick={() => setOpen(false)}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </div>
          </div>

          {/* Messages */}
          <div className={classes.messageList}>
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={m.role === 'user' ? classes.userBubble : classes.assistantBubble}
              >
                <div
                  dangerouslySetInnerHTML={{
                    __html: m.content
                      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #0078D4; font-weight: 700; text-decoration: underline;">$1</a>')
                      .replace(/### (.*?)\n/g, '<h3 style="margin: 6px 0;">$1</h3>')
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\*(.*?)\*/g, '<em>$1</em>')
                      .replace(/`([^`]+)`/g, '<code style="background: rgba(0,0,0,0.06); padding: 2px 4px; border-radius: 4px;">$1</code>')
                      .replace(/\n- (.*?)(?=\n|$)/g, '<li>$1</li>')
                      .replace(/\n\n/g, '<br/>'),
                  }}
                />
              </div>
            ))}
            {loading && (
              <div className={classes.assistantBubble} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CircularProgress size={16} />
                <Typography variant="caption" color="textSecondary">
                  Shield AI is thinking...
                </Typography>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className={classes.chipContainer}>
            {quickPrompts.map(prompt => (
              <Chip
                key={prompt}
                label={prompt}
                size="small"
                variant="outlined"
                className={classes.quickChip}
                onClick={() => handleSend(prompt)}
              />
            ))}
          </div>

          {/* Input Area */}
          <div className={classes.inputArea}>
            <TextField
              variant="outlined"
              size="small"
              placeholder="Ask Shield AI..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              className={classes.inputField}
            />
            <IconButton
              color="primary"
              size="small"
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
            >
              <SendIcon fontSize="small" />
            </IconButton>
          </div>
        </Paper>
      )}
    </>
  );
};
