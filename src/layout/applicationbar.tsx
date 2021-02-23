import React, { PropsWithChildren } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import Typography from '@material-ui/core/Typography';

const useStyles = (drawerWidth: string | number) =>
  makeStyles((theme) => ({
    appBar: {
      [theme.breakpoints.up('md')]: {
        marginLeft: drawerWidth,
      },
      zIndex: theme.zIndex.drawer + 1,
    },
    menuButton: {
      marginRight: theme.spacing(2),
      [theme.breakpoints.up('md')]: {
        display: 'none',
      },
    },
    toolbar: theme.mixins.toolbar,
    title: {
      flexGrow: 1,
    },
  }));

export interface ApplicationBarProps {
  title?: string;
  drawerWidth: string | number;
  onMenuToggle?: () => void;
}

export const ApplicationBar = ({
  title,
  drawerWidth,
  onMenuToggle,
  children,
}: PropsWithChildren<ApplicationBarProps>) => {
  const classes = useStyles(drawerWidth)();

  return (
    <AppBar position="fixed" className={classes.appBar}>
      <Toolbar className={classes.toolbar}>
        {onMenuToggle && (
          <IconButton
            color="inherit"
            edge="start"
            onClick={onMenuToggle}
            className={classes.menuButton}
          >
            <MenuIcon />
          </IconButton>
        )}
        {title && (
          <Typography variant="h6" className={classes.title}>
            {title}
          </Typography>
        )}
        {children}
      </Toolbar>
    </AppBar>
  );
};
