import React, { PropsWithChildren, useEffect } from 'react';

import 'bootstrap/dist/css/bootstrap-grid.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import 'devextreme/dist/css/dx.common.css';
import 'devextreme/dist/css/dx.material.blue.light.css';

import moment from 'moment';
import deMessages from 'devextreme/localization/messages/de.json';
import { locale, loadMessages } from 'devextreme/localization';

export interface ContextProps {}

export const Context = ({ children }: PropsWithChildren<ContextProps>) => {
  useEffect(() => {
    loadMessages(deMessages);
    locale(navigator.language);

    moment.locale(
      navigator.languages ? navigator.languages[0] : navigator.language
    );
  }, []);

  return <React.Fragment>{children}</React.Fragment>;
};
