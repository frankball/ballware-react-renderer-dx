import React, { useCallback, useContext } from 'react';

import {
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@material-ui/core';

import Iframe from 'react-iframe';
import { CrudContext } from '@ballware/react-contexts';
import { useTranslation } from 'react-i18next';

export interface ExternalLinkEditPopupProps {
  title: string;
  externalUrl: string;
  functionIdentifier?: string;
}

export const ExternalLinkEditPopup = (props: ExternalLinkEditPopupProps) => {
  const { title, externalUrl } = props;

  const { t } = useTranslation();
  const { close } = useContext(CrudContext);

  const fullscreen = true;

  const cancelClicked = useCallback(() => {
    if (close) {
      close();
    }
  }, [close]);

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm')) || fullscreen;

  return (
    <Dialog
      open
      onClose={cancelClicked}
      fullScreen={fullScreen}
      maxWidth={'lg'}
      fullWidth
      disableBackdropClick
    >
      <DialogTitle id="form-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <Iframe
          allowFullScreen
          scrolling={'no'}
          frameBorder={0}
          styles={{ border: 0 }}
          width={'100%'}
          height={'100%'}
          url={externalUrl}
        />
      </DialogContent>
      <DialogActions>
        {t && (
          <Button onClick={cancelClicked} color="default">
            {t('editing.actions.close')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};