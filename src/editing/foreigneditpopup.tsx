import React, { useState, useEffect, useContext, useCallback } from 'react';
import { EntityCustomFunction } from '@ballware/meta-interface';
import { MetaContext, CrudContext, EditModes } from '@ballware/react-contexts';
import {
  ProviderFactoryContext,
  LookupContext,
} from '@ballware/react-contexts';
import {
  ForeignEditPopupProps,
  RenderFactoryContext,
} from '@ballware/react-renderer';

export const ForeignEditPopup = ({
  functionIdentifier,
  selection,
  editingFinished,
}: ForeignEditPopupProps) => {
  const [customEditFunction, setCustomEditFunction] = useState<
    EntityCustomFunction
  >();
  const [isEditing, setIsEditing] = useState(false);

  const { EditPopup } = useContext(RenderFactoryContext);

  const { EditProvider } = useContext(ProviderFactoryContext);
  const { lookupsComplete } = useContext(LookupContext);
  const { getEditLayout, customFunctions } = useContext(MetaContext);
  const { customEdit, customEditing, customEditParam } = useContext(
    CrudContext
  );

  const getEditLayoutForIdentifier = useCallback(
    (layoutIdentifier: string) => {
      if (getEditLayout) {
        return getEditLayout(layoutIdentifier ?? 'primary');
      }

      return undefined;
    },
    [getEditLayout]
  );

  useEffect(() => {
    if (customFunctions && functionIdentifier) {
      const customFunction = customFunctions?.find(
        (f) => f.id === functionIdentifier
      );

      setCustomEditFunction(customFunction);
    }
  }, [functionIdentifier, customFunctions]);

  useEffect(() => {
    if (customEdit && customEditFunction && selection && lookupsComplete) {
      customEdit(customEditFunction, selection);
    }
  }, [customEdit, customEditFunction, selection, lookupsComplete]);

  useEffect(() => {
    if (customEditing) {
      setIsEditing(true);
    } else {
      if (isEditing) {
        editingFinished(true);
      }
    }
  }, [customEditing, editingFinished, isEditing]);

  return (
    <React.Fragment>
      {EditProvider &&
        EditPopup &&
        getEditLayout &&
        customEditFunction &&
        customEditing && (
          <EditProvider
            item={customEditParam as Record<string, unknown>}
            mode={EditModes.EDIT}
            editLayout={getEditLayoutForIdentifier(
              customEditFunction?.editLayout
            )}
            functionIdentifier={customEditFunction?.id}
          >
            <EditPopup title={`${customEditFunction?.text}`} />
          </EditProvider>
        )}
    </React.Fragment>
  );
};
