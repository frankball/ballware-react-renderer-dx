import React, { useRef, useState, useEffect, useContext } from 'react';

import { EditItemProps } from './common';
import { FieldSet } from './fieldset';

import { DateBox as DxDateBox } from 'devextreme-react/date-box';
import Validator, {
  CustomRule,
  RequiredRule,
} from 'devextreme-react/validator';
import { EditItemsContext, EditorRef } from '@ballware/react-renderer';
import { useTranslation } from 'react-i18next';

export interface DateBoxProps extends EditItemProps {
  type: 'date' | 'datetime';
}

export const DateBox = ({ layoutItem, type }: DateBoxProps) => {
  const { t } = useTranslation();

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
  const editorRef = useRef<DxDateBox>(null);

  useEffect(() => {
    if (
      t &&
      layoutItem &&
      layoutItem.dataMember &&
      editorPreparing &&
      readOnly
    ) {
      editorPreparing(layoutItem.dataMember, layoutItem);
      setReadonly(!readOnly || readOnly() || layoutItem.readonly);
      setRequired(layoutItem.required ?? false);
      setPrepared(true);
    }
  }, [t, layoutItem, editorPreparing, readOnly]);

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
        <DxDateBox
          ref={editorRef}
          name={layoutItem.dataMember}
          defaultValue={getValue(layoutItem.dataMember)}
          readOnly={readonly}
          type={type}
          displayFormat={
            type === 'date' ? t('format.date') : t('format.datetime')
          }
          onInitialized={() =>
            layoutItem.dataMember &&
            editorInitialized(layoutItem.dataMember, editor)
          }
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
        </DxDateBox>
      </FieldSet>
    );
  } else {
    return <FieldSet layoutItem={layoutItem}></FieldSet>;
  }
};
