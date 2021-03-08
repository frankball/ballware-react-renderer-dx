import React, { useCallback, useContext, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import AccountCircle from '@material-ui/icons/AccountCircle';

import moment from 'moment';
import 'moment-duration-format';

import { useInterval } from '@ballware/react-renderer';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Badge from '@material-ui/core/Badge';
import { RightsContext } from '@ballware/react-contexts';

export const SessionButton = () => {
  const history = useHistory();
  const { t } = useTranslation();

  const {
    timeout_in,
    rights,
    logout,
    refresh,
    changePassword,
    manageAccount,
  } = useContext(RightsContext);
  const [timeoutIn, setTimeoutIn] = React.useState(
    timeout_in ? moment(timeout_in).diff(moment(), 'seconds') : 0
  );
  const [anchorEl, setAnchorEl] = React.useState<Element>();
  const menuOpen = Boolean(anchorEl);

  useInterval(() => {
    if (timeout_in) {
      let timeout_diff = Math.max(
        0,
        moment(timeout_in).diff(moment(), 'seconds')
      );

      if (timeout_diff === 0 && logout) {
        logout();
      } else {
        setTimeoutIn(timeout_diff);
      }
    } else {
      setTimeoutIn(0);
    }
  }, 1000);

  const onRefresh = useCallback(() => {
    if (refresh) {
      refresh();
      setAnchorEl(undefined);
    }
  }, [refresh]);

  const onLogout = useCallback(() => {
    if (logout) {
      logout();
      setAnchorEl(undefined);
    }
  }, [logout]);

  const onMenuClose = useCallback(() => {
    setAnchorEl(undefined);
  }, []);

  const onChangePassword = useCallback(() => {
    if (history) {
      history.push('/changepassword');
    }
  }, [history]);

  const onManageAccount = useCallback(() => {
    if (manageAccount) {
      manageAccount();
    }
  }, [manageAccount]);

  const badgeContent = useMemo(
    () => `${moment.duration(timeoutIn, 'seconds').format('m:ss')}`,
    [timeoutIn]
  );

  return (
    <React.Fragment>
      {timeoutIn > 0 && rights && (
        <IconButton
          color="inherit"
          onClick={(e) => setAnchorEl(e.currentTarget)}
        >
          <Badge color="error" badgeContent={badgeContent}>
            <AccountCircle />
          </Badge>
        </IconButton>
      )}
      {t && (
        <Menu
          id="menu-session"
          anchorEl={anchorEl}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          keepMounted
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          open={menuOpen}
          onClose={onMenuClose}
        >
          {timeoutIn > 0 && (
            <MenuItem onClick={onRefresh}>{t('session.refresh')}</MenuItem>
          )}
          {rights && changePassword && (
            <MenuItem onClick={onChangePassword}>
              {t('session.changepassword')}
            </MenuItem>
          )}
          {rights && manageAccount && (
            <MenuItem onClick={onManageAccount}>
              {t('session.manageaccount')}
            </MenuItem>
          )}
          {rights && (
            <MenuItem onClick={onLogout}>
              {t('session.logout', { user: rights.Email })}
            </MenuItem>
          )}
        </Menu>
      )}
    </React.Fragment>
  );
};
