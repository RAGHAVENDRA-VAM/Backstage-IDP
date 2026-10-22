import React from 'react';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
  logoImg: {
    height: 32,
    width: 32,
    borderRadius: 6,
    objectFit: 'contain',
    backgroundColor: '#ffffff',
    padding: 2,
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  },
});

export const LogoIcon = () => {
  const classes = useStyles();

  return (
    <img
      src="/shield-logo.png"
      alt="Shield Logo"
      className={classes.logoImg}
    />
  );
};
