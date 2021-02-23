import React, { useState, useContext, useEffect } from 'react';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@material-ui/core';
import {
  GridLayoutColumn,
  CrudItem,
  ValueType,
  EditLayout,
} from '@ballware/meta-interface';
import { MetaContext, EditContext } from '@ballware/react-contexts';
import ValidationGroup from 'devextreme-react/validation-group';
import ValidationSummary from 'devextreme-react/validation-summary';
import { Container } from '../layout/container';
import { RenderFactoryContext } from '@ballware/react-renderer';
import { useTranslation } from 'react-i18next';

export interface DetailEditPopupProps {
  readonly: boolean;
  applyChanges: (e: { value: CrudItem | ValueType }) => void;
  column: GridLayoutColumn;
}

export const DetailEditPopup = ({
  readonly,
  column,
  applyChanges,
}: DetailEditPopupProps) => {
  const { t } = useTranslation();

  const [open, setOpen] = useState<boolean>(false);
  const [editLayout, setEditLayout] = useState<EditLayout>();

  const { getEditLayout } = useContext(MetaContext);
  const { item } = useContext(EditContext);
  const { EditLayoutItem } = useContext(RenderFactoryContext);
  const validationGroupRef = React.useRef<ValidationGroup>(null);

  useEffect(() => {
    if (getEditLayout && column) {
      setEditLayout(getEditLayout(column.popuplayout ?? 'primary'));
    }
  }, [getEditLayout, column]);

  const onApply = () => {
    setOpen(false);
    applyChanges({ value: item });
  };

  let key = 1;

  return (
    <React.Fragment>
      {t && editLayout && (
        <React.Fragment>
          <Button
            style={{ width: '100%', height: '100%' }}
            onClick={() => {
              setOpen(true);
            }}
          >
            {t('editing.actions.open')}
          </Button>
          <Dialog open={open} fullWidth maxWidth={'lg'}>
            <DialogTitle>{column.caption}</DialogTitle>
            <DialogContent>
              <ValidationGroup
                ref={validationGroupRef}
                onInitialized={(e) => e.component?.validate()}
              >
                {editLayout && EditLayoutItem && (
                  <Container>
                    {editLayout.items?.map((item) => (
                      <EditLayoutItem
                        key={key++}
                        colCount={editLayout.colCount}
                        layoutItem={item}
                      />
                    ))}
                  </Container>
                )}
                <div className="dx-fieldset">
                  <ValidationSummary />
                </div>
              </ValidationGroup>
            </DialogContent>
            <DialogActions>
              {t && !readonly && (
                <Button onClick={onApply} color="primary">
                  {t('editing.actions.apply')}
                </Button>
              )}
              {t && !readonly && (
                <Button onClick={() => setOpen(false)} color="default">
                  {t('editing.actions.cancel')}
                </Button>
              )}
              {t && readonly && (
                <Button onClick={() => setOpen(false)} color="primary">
                  {t('editing.actions.close')}
                </Button>
              )}
            </DialogActions>
          </Dialog>
        </React.Fragment>
      )}
    </React.Fragment>
  );
};
