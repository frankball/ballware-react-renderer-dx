import React, { PropsWithChildren } from 'react';

import IconButton from '@material-ui/core/IconButton';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import Divider from '@material-ui/core/Divider';

import { makeStyles, useTheme } from '@material-ui/core/styles';
import { NavigationList } from './navigationlist';

const useStyles = makeStyles((theme) => ({
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
  },
}));

export interface NavigationProps {
  onMenuToggle?: () => void;
}

export const Navigation = ({
  onMenuToggle,
  children,
}: PropsWithChildren<NavigationProps>) => {
  const classes = useStyles();
  const theme = useTheme();

  return (
    <React.Fragment>
      <div className={classes.drawerHeader}>
        {onMenuToggle && (
          <IconButton onClick={onMenuToggle}>
            {theme.direction === 'ltr' ? (
              <ChevronLeftIcon />
            ) : (
              <ChevronRightIcon />
            )}
          </IconButton>
        )}
      </div>
      <Divider />
      <NavigationList />
      {children && (
        <React.Fragment>
          <Divider />
          {children}
        </React.Fragment>
      )}
    </React.Fragment>
  );
};
