import React, { useCallback, useContext } from 'react';

import ScrollView from 'devextreme-react/scroll-view';

import {
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@material-ui/core';

import { EditForm, EditFormRef } from './editform';
import { EditModes, CrudContext, EditContext } from '@ballware/react-contexts';
import { useTranslation } from 'react-i18next';

export interface EditPopupProps {
  title: string;
}

export const EditPopup = (props: EditPopupProps) => {
  const { title } = props;

  const { t } = useTranslation();

  const { close } = useContext(CrudContext);
  const { mode, editLayout, functionIdentifier } = useContext(EditContext);

  const formRef = React.useRef<EditFormRef>(null);

  const saveClicked = useCallback(() => {
    if (formRef.current && formRef.current.validate()) {
      formRef.current.submit();
    }
  }, [formRef]);

  const cancelClicked = useCallback(() => {
    if (close) {
      close();
    }
  }, [close]);

  const theme = useTheme();
  const fullScreen =
    useMediaQuery(theme.breakpoints.down('sm')) || editLayout?.fullscreen;

  return (
    <React.Fragment>
      {editLayout && (
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
            <ScrollView>
              <EditForm
                ref={formRef}
                functionIdentifier={functionIdentifier}
                editLayout={editLayout}
              />
            </ScrollView>
          </DialogContent>
          <DialogActions>
            {t && mode !== EditModes.VIEW && (
              <Button onClick={saveClicked} color="primary">
                {t('editing.actions.apply')}
              </Button>
            )}
            {t && mode !== EditModes.VIEW && (
              <Button onClick={cancelClicked} color="default">
                {t('editing.actions.cancel')}
              </Button>
            )}
            {t && mode === EditModes.VIEW && (
              <Button onClick={cancelClicked} color="default">
                {t('editing.actions.close')}
              </Button>
            )}
          </DialogActions>
        </Dialog>
      )}
    </React.Fragment>
  );
};
