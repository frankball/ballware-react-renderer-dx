import React, { useRef, useState, useEffect, useMemo, useContext } from 'react';
import {
  AutocompleteStoreDescriptor,
  LookupCreator,
  LookupDescriptor,
  LookupStoreDescriptor,
} from '@ballware/react-contexts';
import { EditItemProps } from './common';

import { FieldSet } from './fieldset';
import {
  createAutocompleteDataSource,
  createLookupDataSource,
} from '../../util/datasource';
import { EditItemsContext, EditorRef } from '@ballware/react-renderer';

import { TagBox } from 'devextreme-react/tag-box';
import Validator, {
  CustomRule,
  RequiredRule,
} from 'devextreme-react/validator';

export interface MultiLookupBoxProps extends EditItemProps {}

export const MultiLookupBox = ({ layoutItem }: MultiLookupBoxProps) => {
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
  const [lookup, setLookup] = useState<LookupDescriptor>();
  const [prepared, setPrepared] = useState<boolean>();

  const valueNotificationRef = useRef(true);
  const editorRef = useRef<TagBox>(null);

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
  }, [layoutItem, editorPreparing, readOnly, getLookup, getValue]);

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
        <TagBox
          ref={editorRef}
          name={layoutItem.dataMember}
          defaultValue={getValue(layoutItem.dataMember)}
          readOnly={readonly}
          dataSource={dataSource}
          displayExpr={layoutItem.displayExpr ?? lookup?.displayMember}
          valueExpr={layoutItem.valueExpr ?? lookup?.valueMember}
          showClearButton
          searchEnabled
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
        </TagBox>
      </FieldSet>
    );
  } else {
    return <FieldSet layoutItem={layoutItem}></FieldSet>;
  }
};
