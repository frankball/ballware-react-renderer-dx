import React, { useRef, useState, useEffect, useContext } from 'react';

import { EditItemProps } from './common';

import { FieldSet } from './fieldset';

import {
  DetailGrid as DetailGridContainer,
  DetailGridRef,
} from '../../datacontainers/grid/detailgrid';
import { EditItemsContext, EditorRef } from '@ballware/react-renderer';

export interface DetailGridProps extends EditItemProps {}

export const DetailGrid = ({ layoutItem }: DetailGridProps) => {
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
  const editorRef = useRef<DetailGridRef>(null);

  useEffect(() => {
    if (layoutItem && layoutItem.dataMember && editorPreparing && readOnly) {
      editorPreparing(layoutItem.dataMember, layoutItem);
      setReadonly(!readOnly || readOnly() || layoutItem.readonly);
      setPrepared(true);
    }
  }, [layoutItem, editorPreparing, readOnly]);

  if (
    prepared &&
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

    return (
      <FieldSet layoutItem={layoutItem}>
        <DetailGridContainer
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
          onInitialized={() =>
            layoutItem.dataMember &&
            editorInitialized(layoutItem.dataMember, editor)
          }
          layoutItem={layoutItem}
        />
      </FieldSet>
    );
  } else {
    return <FieldSet layoutItem={layoutItem}></FieldSet>;
  }
};
