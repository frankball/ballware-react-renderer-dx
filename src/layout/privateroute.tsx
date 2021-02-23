import React, { useContext, useState, useEffect } from 'react';
import { Redirect, Route, RouteProps, useHistory } from 'react-router-dom';
import { NotificationContext } from '@ballware/react-contexts';
import { useTranslation } from 'react-i18next';

export interface PrivateRouteProps extends RouteProps {
  allowed: () => boolean;
}

export const PrivateRoute = ({ allowed, ...rest }: PrivateRouteProps) => {
  const { t } = useTranslation();
  const { location } = useHistory();
  const { showInfo } = useContext(NotificationContext);
  const [renderAllowed] = useState(allowed());

  useEffect(() => {
    if (t && showInfo) {
      if (!renderAllowed) {
        showInfo(t('rights.notifications.routenotallowed'));
      }
    }
  }, [t, showInfo, renderAllowed]);

  if (renderAllowed) {
    return <Route {...rest} />;
  } else {
    return <Redirect to={{ pathname: '/login', state: { from: location } }} />;
  }
};
