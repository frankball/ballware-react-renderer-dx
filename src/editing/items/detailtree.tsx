import React, { useRef, useState, useEffect, useContext } from 'react';

import { EditItemProps } from './common';
import { FieldSet } from './fieldset';
import {
  DetailTree as DetailTreeContainer,
  DetailTreeRef,
} from '../../datacontainers/tree/detailtree';
import { EditItemsContext, EditorRef } from '@ballware/react-renderer';

export interface DetailTreeProps extends EditItemProps {}

export const DetailTree = ({ layoutItem }: DetailTreeProps) => {
  const {
    readOnly,
    getValue,
    editorPreparing,
    editorInitialized,
    editorValueChanged,
  } = useContext(EditItemsContext);

  const [readonly, setReadonly] = useState(
    !readOnly || readOnly() || layoutItem.readonly
  );
  const [prepared, setPrepared] = useState<boolean>();

  const valueNotificationRef = useRef(true);
  const editorRef = useRef<DetailTreeRef>(null);

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
    readOnly &&
    getValue &&
    editorInitialized &&
    editorValueChanged
  ) {
    const editor = {
      getOption: (option) => {
        switch (option) {
          case 'value':
            return editorRef.current?.getValue();
          case 'readonly':
            return readonly;
        }

        return undefined;
      },
      setOption: (option, newValue) => {
        switch (option) {
          case 'value':
            valueNotificationRef.current = false;
            editorRef.current?.setValue(newValue as Record<string, unknown>[]);
            valueNotificationRef.current = true;
            break;
          case 'readonly':
            setReadonly(readOnly() || (newValue as boolean));
            break;
        }
      },
    } as EditorRef;

    editorInitialized(layoutItem.dataMember, editor);

    return (
      <FieldSet layoutItem={layoutItem}>
        <DetailTreeContainer
          ref={editorRef}
          readonly={readonly ?? false}
          defaultValue={getValue(layoutItem.dataMember)}
          setValue={(value) => {
            layoutItem.dataMember &&
              editorValueChanged(
                layoutItem.dataMember,
                value,
                valueNotificationRef.current
              );
          }}
          layoutItem={layoutItem}
        />
      </FieldSet>
    );
  } else {
    return <FieldSet layoutItem={layoutItem}></FieldSet>;
  }
};
