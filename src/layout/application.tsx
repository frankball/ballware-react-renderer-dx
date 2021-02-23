import React, {
  useState,
  useContext,
  useCallback,
  useMemo,
  PropsWithChildren,
} from 'react';

import { makeStyles, useTheme } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Drawer from '@material-ui/core/Drawer';
import Hidden from '@material-ui/core/Hidden';
import Box from '@material-ui/core/Box';

import { RenderFactoryContext } from '@ballware/react-renderer';
import { SessionButton } from './sessionbutton';
import { TenantContext } from '@ballware/react-contexts';

const useStyles = (drawerWidth: string | number) =>
  makeStyles((theme) => ({
    root: {
      display: 'flex',
      height: '100vh',
    },
    drawer: {
      [theme.breakpoints.up('md')]: {
        width: drawerWidth,
        flexShrink: 0,
      },
    },
    toolbar: theme.mixins.toolbar,
    drawerPaper: {
      width: drawerWidth,
    },
    content: {
      padding: theme.spacing(1),
      [theme.breakpoints.up('md')]: {
        width: `calc(100% - ${drawerWidth}px)`,
      },
      [theme.breakpoints.down('sm')]: {
        width: '100%',
      },
    },
    client: {
      height: `calc(100% - ${64}px)`,
    },
  }));

export interface ApplicationProps {
  drawerWidth?: string | number;
}

export const Application = ({
  drawerWidth,
  children,
}: PropsWithChildren<ApplicationProps>) => {
  const classes = useStyles(drawerWidth ?? 240)();
  const theme = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { ApplicationBar, Navigation } = useContext(RenderFactoryContext);
  const { navigation } = useContext(TenantContext);

  const onToggleMenu = useCallback(() => {
    setMobileOpen(!mobileOpen);
  }, [setMobileOpen, mobileOpen]);

  const MemorizedApplicationBar = useMemo(
    () => () => (
      <React.Fragment>
        {ApplicationBar && (
          <ApplicationBar
            title={navigation?.title}
            drawerWidth={drawerWidth ?? 240}
            onMenuToggle={onToggleMenu}
          >
            <SessionButton />
          </ApplicationBar>
        )}
      </React.Fragment>
    ),
    [drawerWidth, ApplicationBar, onToggleMenu, navigation]
  );
  const MemorizedNavigation = useMemo(
    () => () => (
      <React.Fragment>
        {Navigation && <Navigation onMenuToggle={onToggleMenu} />}
      </React.Fragment>
    ),
    [Navigation, onToggleMenu]
  );

  return (
    <div className={classes.root}>
      <CssBaseline />
      <MemorizedApplicationBar />
      <nav className={classes.drawer}>
        {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
        <Hidden mdUp implementation="css">
          <Drawer
            className={classes.drawer}
            variant="temporary"
            anchor={theme.direction === 'rtl' ? 'right' : 'left'}
            open={mobileOpen}
            onClose={onToggleMenu}
            classes={{
              paper: classes.drawerPaper,
            }}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
          >
            <MemorizedNavigation />
          </Drawer>
        </Hidden>
        <Hidden smDown implementation="css">
          <Drawer
            className={classes.drawer}
            classes={{
              paper: classes.drawerPaper,
            }}
            variant="permanent"
            open
          >
            <MemorizedNavigation />
          </Drawer>
        </Hidden>
      </nav>
      <Box className={classes.content}>
        <div className={classes.toolbar} />
        <div className={classes.client}>{children}</div>
      </Box>
    </div>
  );
};
