import React from 'react';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  useTheme,
  useMediaQuery,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { HtmlEditor } from '../components/htmleditor';

export interface DocumentationPopupProps {
  title: string;
  documentation: string;
  close: () => void;
}

export const DocumentationPopup = ({
  title,
  documentation,
  close,
}: DocumentationPopupProps) => {
  const { t } = useTranslation();

  const onClose = () => {
    close();
  };

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Dialog
      open
      onClose={onClose}
      fullScreen={fullScreen}
      fullWidth
      maxWidth={'lg'}
    >
      {t && (
        <DialogTitle id="form-dialog-title">
          {t('documentation.popuptitle', { entity: title })}
        </DialogTitle>
      )}
      <DialogContent>
        <HtmlEditor readOnly defaultValue={documentation} />
      </DialogContent>
      <DialogActions>
        {t && (
          <Button onClick={onClose} color="default">
            {t('documentation.actions.close')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
