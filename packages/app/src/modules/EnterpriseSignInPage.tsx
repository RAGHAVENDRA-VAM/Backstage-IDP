import React from 'react';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Chip,
  makeStyles,
  Container,
} from '@material-ui/core';
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount';
import CodeIcon from '@material-ui/icons/Code';
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';
import SecurityIcon from '@material-ui/icons/Security';
import GitHubIcon from '@material-ui/icons/GitHub';
import { SignInPageProps, IdentityApi, useApi, githubAuthApiRef } from '@backstage/core-plugin-api';
import { UserRole, ROLES } from './RoleContext';

const useStyles = makeStyles(theme => ({
  root: {
    minHeight: '100vh',
    background: 'radial-gradient(ellipse at top, #1e1b4b 0%, #0f172a 45%, #020617 100%)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing(3),
    color: '#ffffff',
  },
  header: {
    textAlign: 'center',
    marginBottom: theme.spacing(4),
  },
  title: {
    fontSize: '2.1rem',
    fontWeight: 800,
    letterSpacing: '-0.5px',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '1rem',
    marginTop: theme.spacing(1),
    maxWidth: 620,
    margin: '0 auto',
  },
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: theme.spacing(2.5),
    width: '100%',
    maxWidth: 960,
  },
  roleCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: 14,
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    color: '#ffffff',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 16px 32px rgba(0, 0, 0, 0.45)',
      borderColor: 'rgba(99, 102, 241, 0.6)',
      backgroundColor: 'rgba(30, 41, 59, 0.95)',
    },
  },
  cardInner: {
    padding: theme.spacing(3),
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing(2),
  },
  roleName: {
    fontSize: '1.25rem',
    fontWeight: 700,
    marginBottom: theme.spacing(0.5),
  },
  roleBadge: {
    alignSelf: 'flex-start',
    marginBottom: theme.spacing(1.5),
    fontWeight: 700,
    fontSize: '0.72rem',
    height: 22,
  },
  roleDesc: {
    fontSize: '0.85rem',
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 1.5,
    marginBottom: theme.spacing(2),
    flexGrow: 1,
  },
  actionHint: {
    fontSize: '0.78rem',
    fontWeight: 600,
    color: '#818cf8',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  githubDivider: {
    marginTop: theme.spacing(4),
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    width: '100%',
    maxWidth: 960,
    '&::before, &::after': {
      content: '""',
      flex: 1,
      borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
    },
  },
  githubBtn: {
    marginTop: theme.spacing(2),
    padding: '10px 24px',
    borderRadius: 8,
    backgroundColor: '#24292e',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.9rem',
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: '#1b1f23',
      borderColor: 'rgba(255, 255, 255, 0.4)',
    },
  },
}));

export const EnterpriseSignInPage: React.FC<SignInPageProps> = ({ onSignInSuccess }) => {
  const classes = useStyles();
  const githubAuth = useApi(githubAuthApiRef);

  const handleRoleSignIn = (role: UserRole) => {
    try {
      localStorage.setItem('shield_idp_active_role', role);
    } catch {
      // ignore
    }

    const roleInfo = ROLES[role];

    const identity: IdentityApi = {
      getProfileInfo: async () => ({
        displayName: roleInfo.title,
        email: `${role}@shield-insurance.internal`,
        picture: undefined,
      }),
      getBackstageIdentity: async () => ({
        type: 'user',
        userEntityRef: `user:default/${role}`,
        ownershipEntityRefs: ['group:default/platform-engineering'],
      }),
      getCredentials: async () => ({}),
      signOut: async () => {},
    };

    onSignInSuccess(identity);
  };

  const handleGitHubSignIn = async () => {
    try {
      const token = await githubAuth.getAccessToken(['read:user', 'repo']);
      if (token) {
        // Default to Platform Engineer on GitHub login
        try {
          localStorage.setItem('shield_idp_active_role', 'platform-engineer');
        } catch {}

        const identity: IdentityApi = {
          getProfileInfo: async () => ({
            displayName: 'GitHub Engineer',
            email: 'engineer@github.com',
          }),
          getBackstageIdentity: async () => ({
            type: 'user',
            userEntityRef: 'user:default/guest',
            ownershipEntityRefs: ['group:default/platform-engineering'],
          }),
          getCredentials: async () => ({ token }),
          signOut: async () => {
            await githubAuth.signOut();
          },
        };
        onSignInSuccess(identity);
      }
    } catch (err) {
      console.error('GitHub sign in error:', err);
    }
  };

  return (
    <div className={classes.root}>
      <div className={classes.header}>
        <Typography className={classes.title}>
          <SecurityIcon style={{ fontSize: 36, color: '#3b82f6' }} />
          Shield Insurance IDP Portal
        </Typography>
        <Typography className={classes.subtitle}>
          Select your enterprise persona to enter the developer platform with tailored permissions, dashboards, and golden paths.
        </Typography>
      </div>

      <div className={classes.cardsGrid}>
        {/* PLATFORM ENGINEER */}
        <Card className={classes.roleCard} onClick={() => handleRoleSignIn('platform-engineer')}>
          <CardActionArea className={classes.cardInner}>
            <div className={classes.iconBox} style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
              <SupervisorAccountIcon fontSize="large" />
            </div>
            <Typography className={classes.roleName}>Platform Engineer</Typography>
            <Chip
              label="Admin Access"
              size="small"
              className={classes.roleBadge}
              style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.4)' }}
            />
            <Typography className={classes.roleDesc}>
              Full administrative visibility across Azure cloud infrastructure, Scaffolder templates, Datadog observability, and system diagnostics.
            </Typography>
            <div className={classes.actionHint} style={{ color: '#34d399' }}>
              Sign in as Platform Engineer →
            </div>
          </CardActionArea>
        </Card>

        {/* DEVELOPER */}
        <Card className={classes.roleCard} onClick={() => handleRoleSignIn('developer')}>
          <CardActionArea className={classes.cardInner}>
            <div className={classes.iconBox} style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
              <CodeIcon fontSize="large" />
            </div>
            <Typography className={classes.roleName}>Developer</Typography>
            <Chip
              label="Developer Access"
              size="small"
              className={classes.roleBadge}
              style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd', border: '1px solid rgba(59, 130, 246, 0.4)' }}
            />
            <Typography className={classes.roleDesc}>
              Focused developer self-service workspace: active microservices, PR reviews, CI/CD workflow status, Jira sprint issues, and quick code scaffolding.
            </Typography>
            <div className={classes.actionHint} style={{ color: '#60a5fa' }}>
              Sign in as Developer →
            </div>
          </CardActionArea>
        </Card>

        {/* FINOPS */}
        <Card className={classes.roleCard} onClick={() => handleRoleSignIn('finops')}>
          <CardActionArea className={classes.cardInner}>
            <div className={classes.iconBox} style={{ backgroundColor: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>
              <AttachMoneyIcon fontSize="large" />
            </div>
            <Typography className={classes.roleName}>FinOps</Typography>
            <Chip
              label="Cost Governance"
              size="small"
              className={classes.roleBadge}
              style={{ backgroundColor: 'rgba(168, 85, 247, 0.2)', color: '#d8b4fe', border: '1px solid rgba(168, 85, 247, 0.4)' }}
            />
            <Typography className={classes.roleDesc}>
              Dedicated financial operations hub: Azure AI Foundry GenAI unit economics, daily burn rate, resource rightsizing, and cloud FinOps recommendations.
            </Typography>
            <div className={classes.actionHint} style={{ color: '#c084fc' }}>
              Sign in as FinOps →
            </div>
          </CardActionArea>
        </Card>
      </div>

      <div className={classes.githubDivider}>
        <Typography variant="caption" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
          OR AUTHENTICATE VIA IDENTITY PROVIDER
        </Typography>
      </div>

      <button className={classes.githubBtn} onClick={handleGitHubSignIn}>
        <GitHubIcon fontSize="small" />
        Sign in with GitHub Organization
      </button>
    </div>
  );
};
