import React from 'react';
import { makeStyles, Box, Typography } from '@material-ui/core';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    textDecoration: 'none',
  },
  logoImg: {
    height: 36,
    width: 36,
    borderRadius: 6,
    objectFit: 'contain',
    backgroundColor: '#ffffff',
    padding: 2,
    boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
  },
  brandText: {
    fontFamily: '"Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontWeight: 800,
    fontSize: '0.98rem',
    color: '#ffffff',
    letterSpacing: '0.4px',
    lineHeight: 1.15,
    whiteSpace: 'nowrap',
    textTransform: 'uppercase',
  },
  subText: {
    fontSize: '0.62rem',
    fontWeight: 700,
    color: '#7df3e1',
    letterSpacing: '1.2px',
    textTransform: 'uppercase',
  },
});

export const LogoFull = () => {
  const classes = useStyles();

  return (
    <Box className={classes.container}>
      <img
        src="/shield-logo.png"
        alt="Shield Insurance Logo"
        className={classes.logoImg}
      />
      <Box display="flex" flexDirection="column">
        <Typography className={classes.brandText}>
          Shield Insurance
        </Typography>
        <Typography className={classes.subText}>
          Developer Portal
        </Typography>
      </Box>
    </Box>
  );
};
