import React from 'react';
import { makeStyles, Box, Typography } from '@material-ui/core';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    textDecoration: 'none',
  },
  logoImg: {
    height: 34,
    width: 34,
    minWidth: 34,
    borderRadius: 8,
    objectFit: 'contain',
    backgroundColor: '#ffffff',
    padding: 3,
    boxShadow: '0 2px 6px rgba(0,0,0,0.22)',
  },
  textWrapper: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  brandText: {
    fontFamily: '"Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontWeight: 700,
    fontSize: '0.88rem',
    color: '#ffffff',
    letterSpacing: '0.2px',
    lineHeight: 1.2,
    whiteSpace: 'nowrap',
    textTransform: 'none',
  },
  subText: {
    fontFamily: '"Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '0.64rem',
    fontWeight: 600,
    color: '#7df3e1',
    letterSpacing: '0.8px',
    lineHeight: 1.2,
    marginTop: 2,
    textTransform: 'uppercase',
  },
});

export const LogoFull = () => {
  const classes = useStyles();

  return (
    <Box className={classes.container}>
      <img
        src="/shield-logo.png"
        alt="Shield Insurance"
        className={classes.logoImg}
      />
      <Box className={classes.textWrapper}>
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
