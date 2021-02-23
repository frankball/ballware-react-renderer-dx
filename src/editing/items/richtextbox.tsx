import React, { useRef, useState, useEffect, useContext } from 'react';

import { EditItemProps } from './common';
import { FieldSet } from './fieldset';
import { EditItemsContext, EditorRef } from '@ballware/react-renderer';

import {
  RichTextEditor,
  RichTextEditorRef,
} from '../../components/richtexteditor';

export interface RichTextBoxProps extends EditItemProps {}

export const RichTextBox = ({ layoutItem }: RichTextBoxProps) => {
  const {
    readOnly,
    getValue,
    editorPreparing,
    editorInitialized,
    editorValidating,
    editorValueChanged,
    editorEntered,
  } = useContext(EditItemsContext);

  const [required, setRequired] = useState(layoutItem.required ?? false);
  const [readonly, setReadonly] = useState(
    !readOnly || readOnly() || layoutItem.readonly
  );
  const [prepared, setPrepared] = useState<boolean>();

  const valueNotificationRef = useRef(true);
  const editorRef = useRef<RichTextEditorRef>(null);

  useEffect(() => {
    if (layoutItem && layoutItem.dataMember && editorPreparing && readOnly) {
      editorPreparing(layoutItem.dataMember, layoutItem);
      setReadonly(!readOnly || readOnly() || layoutItem.readonly);
      setRequired(layoutItem.required ?? false);
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
    editorValueChanged &&
    editorValidating &&
    editorEntered
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
            editorRef.current?.setValue(newValue as string);
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
        <RichTextEditor
          ref={editorRef}
          defaultValue={getValue(layoutItem.dataMember)}
          readonly={readonly ?? false}
          required={required}
          height={layoutItem.height ?? '300px'}
          valueChanged={(value) => {
            layoutItem.dataMember &&
              editorValueChanged(
                layoutItem.dataMember,
                value,
                valueNotificationRef.current
              );
          }}
        />
      </FieldSet>
    );
  } else {
    return <FieldSet layoutItem={layoutItem}></FieldSet>;
  }
};
