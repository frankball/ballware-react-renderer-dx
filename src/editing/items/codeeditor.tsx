import React, { useRef, useState, useEffect, useContext } from 'react';

import { EditItemProps } from './common';
import { FieldSet } from './fieldset';

import {
  JsonEditor,
  JavascriptEditor,
  SqlEditor,
  CodeEditorRef,
} from '../../components/codeeditors';
import { EditItemsContext, EditorRef } from '@ballware/react-renderer';

export interface CodeEditorProps extends EditItemProps {
  dialect: 'json' | 'javascript' | 'sql';
}

export const CodeEditor = ({ layoutItem, dialect }: CodeEditorProps) => {
  const {
    readOnly,
    getValue,
    editorPreparing,
    editorInitialized,
    editorValueChanged,
  } = useContext(EditItemsContext);

  const [required, setRequired] = useState(layoutItem.required ?? false);
  const [readonly, setReadonly] = useState(
    !readOnly || readOnly() || layoutItem.readonly
  );
  const [prepared, setPrepared] = useState<boolean>();

  const valueNotificationRef = useRef(true);
  const editorRef = useRef<CodeEditorRef>(null);

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
    editorValueChanged
  ) {
    const editor = {
      getOption: (option) => {
        switch (option) {
          case 'value':
            return editorRef.current?.getValue();
          case 'required':
            return required;
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
          case 'required':
            setRequired(newValue as boolean);
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
        <React.Fragment>
          {dialect === 'json' && (
            <JsonEditor
              ref={editorRef}
              readOnly={readonly}
              defaultValue={getValue(layoutItem.dataMember) ?? ''}
              setValue={(value) => {
                layoutItem.dataMember &&
                  editorValueChanged(
                    layoutItem.dataMember,
                    value,
                    valueNotificationRef.current
                  );
              }}
              height={layoutItem.height ?? '300px'}
            />
          )}
          {dialect === 'javascript' && (
            <JavascriptEditor
              ref={editorRef}
              readOnly={readonly}
              defaultValue={getValue(layoutItem.dataMember)}
              setValue={(value) => {
                layoutItem.dataMember &&
                  editorValueChanged(
                    layoutItem.dataMember,
                    value,
                    valueNotificationRef.current
                  );
              }}
              height={layoutItem.height ?? '300px'}
            />
          )}
          {dialect === 'sql' && (
            <SqlEditor
              ref={editorRef}
              readOnly={readonly}
              defaultValue={getValue(layoutItem.dataMember)}
              setValue={(value) => {
                layoutItem.dataMember &&
                  editorValueChanged(
                    layoutItem.dataMember,
                    value,
                    valueNotificationRef.current
                  );
              }}
              height={layoutItem.height ?? '300px'}
            />
          )}
        </React.Fragment>
      </FieldSet>
    );
  } else {
    return <FieldSet layoutItem={layoutItem}></FieldSet>;
  }
};
