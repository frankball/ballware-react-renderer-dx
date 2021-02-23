import React, { useRef, useState, useEffect, useContext } from 'react';

import { EditItemProps } from './common';
import { FieldSet } from './fieldset';
import { LocationMap, LocationMapRef } from '../../components/map';
import { EditItemsContext, EditorRef } from '@ballware/react-renderer';
import { SettingsContext } from '@ballware/react-contexts';

export interface MapProps extends EditItemProps {}

export const Map = ({ layoutItem }: MapProps) => {
  const { googlekey } = useContext(SettingsContext);
  const {
    readOnly,
    getValue,
    editorPreparing,
    editorInitialized,
    editorValidating,
    editorValueChanged,
    editorEntered,
  } = useContext(EditItemsContext);

  const [readonly, setReadonly] = useState(
    !readOnly || readOnly() || layoutItem.readonly
  );
  const [prepared, setPrepared] = useState<boolean>();

  const valueNotificationRef = useRef(true);
  const editorRef = useRef<LocationMapRef>(null);

  useEffect(() => {
    if (layoutItem && layoutItem.dataMember && editorPreparing && readOnly) {
      editorPreparing(layoutItem.dataMember, layoutItem);
      setReadonly(!readOnly || readOnly() || layoutItem.readonly);
      setPrepared(true);
    }
  }, [layoutItem, editorPreparing, readOnly]);

  if (
    prepared &&
    googlekey &&
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
            editorRef.current?.setValue(
              newValue as { lat: number; lng: number }
            );
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
        <LocationMap
          ref={editorRef}
          googlekey={googlekey}
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
          height={layoutItem.height ?? '300px'}
        />
      </FieldSet>
    );
  } else {
    return <FieldSet layoutItem={layoutItem}></FieldSet>;
  }
};
