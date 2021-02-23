import React, { useRef, useState, useEffect, useContext } from 'react';

import { EditItemProps } from './common';
import { FieldSet } from './fieldset';
import { EditItemsContext, EditorRef } from '@ballware/react-renderer';

import { TextBox as DxTextBox } from 'devextreme-react/text-box';
import Validator, {
  CustomRule,
  RequiredRule,
  EmailRule,
} from 'devextreme-react/validator';

export interface TextBoxProps extends EditItemProps {
  type: 'text' | 'mail';
}

export const TextBox = ({ layoutItem, type }: TextBoxProps) => {
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
  const editorRef = useRef<DxTextBox>(null);

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
            return editorRef.current?.instance.option('value');
          case 'required':
            return required;
          case 'readonly':
            return readonly;
        }
      },
      setOption: (option, newValue) => {
        switch (option) {
          case 'value':
            valueNotificationRef.current = false;
            editorRef.current?.instance.option('value', newValue);
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

    return (
      <FieldSet layoutItem={layoutItem}>
        <DxTextBox
          ref={editorRef}
          name={layoutItem.dataMember}
          defaultValue={getValue(layoutItem.dataMember)}
          readOnly={readonly}
          onInitialized={() => {
            layoutItem.dataMember &&
              editorInitialized(layoutItem.dataMember, editor);
          }}
          onValueChanged={(e) => {
            layoutItem.dataMember &&
              editorValueChanged(
                layoutItem.dataMember,
                e.value,
                valueNotificationRef.current
              );
          }}
          onFocusIn={() => {
            layoutItem.dataMember && editorEntered(layoutItem.dataMember);
          }}
        >
          <Validator>
            {required && <RequiredRule />}
            {type === 'mail' && <EmailRule />}
            {layoutItem.validations?.map((v) => (
              <CustomRule
                key={v.identifier}
                validationCallback={(e: { value: any }) =>
                  layoutItem.dataMember &&
                  editorValidating(layoutItem.dataMember, v.identifier, e.value)
                }
                message={v.message}
              />
            ))}
          </Validator>
        </DxTextBox>
      </FieldSet>
    );
  } else {
    return <FieldSet layoutItem={layoutItem}></FieldSet>;
  }
};
