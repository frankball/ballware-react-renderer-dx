import React, { useRef, useState, useEffect, useMemo, useContext } from 'react';
import {
  AutocompleteStoreDescriptor,
  LookupCreator,
  LookupDescriptor,
  LookupStoreDescriptor,
} from '@ballware/react-contexts';

import { EditItemProps } from './common';
import { FieldSet } from './fieldset';

import { SelectBox } from 'devextreme-react/select-box';
import Validator, {
  CustomRule,
  RequiredRule,
} from 'devextreme-react/validator';
import {
  createAutocompleteDataSource,
  createLookupDataSource,
} from '../../util/datasource';
import { EditItemsContext, EditorRef } from '@ballware/react-renderer';
import { useTranslation } from 'react-i18next';

export interface LookupBoxProps extends EditItemProps {}

export const LookupBox = ({ layoutItem }: LookupBoxProps) => {
  const { t } = useTranslation();

  const {
    readOnly,
    getValue,
    getLookup,
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
  const [acceptCustomValue, setAcceptCustomValue] = useState(
    layoutItem.acceptCustomValue ?? false
  );
  const [items, setItems] = useState<Array<{ Value: string; Text: string }>>(
    layoutItem.items ?? []
  );
  const [lookup, setLookup] = useState<LookupDescriptor>();
  const [prepared, setPrepared] = useState<boolean>();

  const valueNotificationRef = useRef(true);
  const editorRef = useRef<SelectBox>(null);

  const dataSource = useMemo(() => {
    if (lookup) {
      if (lookup?.type === 'lookup') {
        return createLookupDataSource(
          (lookup.store as LookupStoreDescriptor).listFunc,
          (lookup.store as LookupStoreDescriptor).byIdFunc
        );
      } else if (lookup?.type === 'autocomplete') {
        return createAutocompleteDataSource(
          (lookup.store as AutocompleteStoreDescriptor).listFunc
        );
      }
    }

    return undefined;
  }, [lookup]);

  useEffect(() => {
    if (
      t &&
      layoutItem &&
      layoutItem.dataMember &&
      editorPreparing &&
      readOnly &&
      getLookup &&
      getValue
    ) {
      editorPreparing(layoutItem.dataMember, layoutItem);
      setReadonly(!readOnly || readOnly() || layoutItem.readonly);
      setRequired(layoutItem.required ?? false);
      setAcceptCustomValue(layoutItem.acceptCustomValue ?? false);
      setItems(layoutItem.items ?? []);

      if (layoutItem.lookup) {
        setLookup(
          layoutItem.lookupParam
            ? (getLookup(layoutItem.lookup) as LookupCreator)(
                getValue(layoutItem.lookupParam)
              )
            : (getLookup(layoutItem.lookup) as LookupDescriptor)
        );
      }

      setPrepared(true);
    }
  }, [t, layoutItem, editorPreparing, readOnly, getLookup, getValue]);

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
          case 'items':
            return items;
          case 'acceptCustomValue':
            return acceptCustomValue;
          default:
            console.error(`MuiLookupBox unkown option ${option} requested`);
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
          case 'items':
            layoutItem.items = newValue as { Value: string; Text: string }[];
            setItems(layoutItem.items);
            break;
          case 'acceptCustomValue':
            setAcceptCustomValue(newValue as boolean);
            break;
          default:
            console.error(`DxLookupBox unkown option ${option} set`);
        }
      },
    } as EditorRef;

    return (
      <FieldSet layoutItem={layoutItem}>
        <SelectBox
          ref={editorRef}
          name={layoutItem.dataMember}
          defaultValue={getValue(layoutItem.dataMember)}
          readOnly={readonly}
          dataSource={dataSource}
          items={items}
          displayExpr={layoutItem.displayExpr ?? lookup?.displayMember}
          valueExpr={layoutItem.valueExpr ?? lookup?.valueMember}
          showClearButton
          searchEnabled
          acceptCustomValue={acceptCustomValue}
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
          onFocusIn={() =>
            layoutItem.dataMember && editorEntered(layoutItem.dataMember)
          }
        >
          <Validator>
            {required && <RequiredRule />}
            {required && (
              <CustomRule
                message={t('validation.messages.required')}
                validationCallback={(options: { value: string | number }) => {
                  return (
                    options.value !== '00000000-0000-0000-0000-000000000000'
                  );
                }}
              />
            )}
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
        </SelectBox>
      </FieldSet>
    );
  } else {
    return <FieldSet layoutItem={layoutItem}></FieldSet>;
  }
};
