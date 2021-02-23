import React, { useState, useEffect, useContext } from 'react';

import { EditItemProps } from './common';
import { FieldSet } from './fieldset';
import { EditItemsContext, EditorRef } from '@ballware/react-renderer';

import { Button as DxButton } from 'devextreme-react/button';

export interface ButtonProps extends EditItemProps {}

export const Button = ({ layoutItem }: ButtonProps) => {
  const {
    readOnly,
    editorPreparing,
    editorInitialized,
    editorEvent,
  } = useContext(EditItemsContext);
  const [readonly, setReadonly] = useState(
    !readOnly || readOnly() || layoutItem.readonly
  );
  const [prepared, setPrepared] = useState<boolean>();

  useEffect(() => {
    if (layoutItem && layoutItem.dataMember && editorPreparing && readOnly) {
      editorPreparing(layoutItem.dataMember, layoutItem);
      setReadonly(!readOnly || readOnly() || layoutItem.readonly);
      setPrepared(true);
    }
  }, [layoutItem, editorPreparing, readOnly]);

  if (
    prepared &&
    layoutItem &&
    layoutItem.dataMember &&
    editorInitialized &&
    editorEvent &&
    readOnly
  ) {
    const editor = {
      getOption: (option) => {
        switch (option) {
          case 'readonly':
            return readonly;
        }

        return undefined;
      },
      setOption: (option, newValue) => {
        switch (option) {
          case 'readonly':
            setReadonly(readOnly() || (newValue as boolean));
            break;
        }
      },
    } as EditorRef;

    return (
      <FieldSet layoutItem={layoutItem}>
        <DxButton
          disabled={readonly}
          height={layoutItem.height}
          width={layoutItem.width}
          onInitialized={() =>
            layoutItem.dataMember &&
            editorInitialized(layoutItem.dataMember, editor)
          }
          onClick={() =>
            layoutItem.dataMember && editorEvent(layoutItem.dataMember, 'click')
          }
        >
          {layoutItem.hint}
        </DxButton>
      </FieldSet>
    );
  } else {
    return <FieldSet layoutItem={layoutItem}></FieldSet>;
  }
};
