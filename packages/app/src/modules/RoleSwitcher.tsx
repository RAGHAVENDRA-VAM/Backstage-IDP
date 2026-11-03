import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Select,
  MenuItem,
  FormControl,
  makeStyles,
  Tooltip,
} from '@material-ui/core';
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount';
import CodeIcon from '@material-ui/icons/Code';
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';
import { useUserRole, UserRole, ROLES } from './RoleContext';

const useStyles = makeStyles(theme => ({
  switcherContainer: {
    padding: '8px 12px',
    margin: '6px 12px',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
    border: '1px solid rgba(255, 255, 255, 0.14)',
  },
  roleHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  roleLabel: {
    fontSize: '0.72rem',
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: 700,
  },
  selectRoot: {
    color: '#ffffff',
    fontSize: '0.82rem',
    fontWeight: 600,
    '& .MuiSelect-select': {
      padding: '4px 8px',
      display: 'flex',
      alignItems: 'center',
      gap: 6,
    },
    '& .MuiSelect-icon': {
      color: 'rgba(255, 255, 255, 0.7)',
    },
  },
}));

export const RoleSwitcher: React.FC = () => {
  const classes = useStyles();
  const { role, setRole, roleInfo } = useUserRole();

  const getRoleIcon = (r: UserRole) => {
    switch (r) {
      case 'platform-engineer':
        return <SupervisorAccountIcon style={{ fontSize: 16, color: '#10b981' }} />;
      case 'developer':
        return <CodeIcon style={{ fontSize: 16, color: '#60a5fa' }} />;
      case 'finops':
        return <AttachMoneyIcon style={{ fontSize: 16, color: '#c084fc' }} />;
    }
  };

  return (
    <div className={classes.switcherContainer}>
      <div className={classes.roleHeader}>
        <span className={classes.roleLabel}>Active Persona / Role</span>
      </div>
      <FormControl fullWidth size="small">
        <Select
          value={role}
          onChange={e => setRole(e.target.value as UserRole)}
          className={classes.selectRoot}
          disableUnderline
        >
          <MenuItem value="platform-engineer">
            <Box display="flex" alignItems="center" gap={1}>
              <SupervisorAccountIcon style={{ fontSize: 18, color: '#059669' }} />
              <Typography variant="body2" style={{ fontWeight: 600 }}>
                Platform Engineer
              </Typography>
            </Box>
          </MenuItem>
          <MenuItem value="developer">
            <Box display="flex" alignItems="center" gap={1}>
              <CodeIcon style={{ fontSize: 18, color: '#2563eb' }} />
              <Typography variant="body2" style={{ fontWeight: 600 }}>
                Developer
              </Typography>
            </Box>
          </MenuItem>
          <MenuItem value="finops">
            <Box display="flex" alignItems="center" gap={1}>
              <AttachMoneyIcon style={{ fontSize: 18, color: '#9333ea' }} />
              <Typography variant="body2" style={{ fontWeight: 600 }}>
                FinOps
              </Typography>
            </Box>
          </MenuItem>
        </Select>
      </FormControl>
      <Box mt={0.5}>
        <Chip
          label={roleInfo.badge}
          size="small"
          style={{
            height: 18,
            fontSize: '0.68rem',
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            color: '#ffffff',
            fontWeight: 700,
          }}
        />
      </Box>
    </div>
  );
};
