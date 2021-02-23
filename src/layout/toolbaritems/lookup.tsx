import React, { useContext, useMemo } from 'react';

import {
  LookupContext,
  LookupDescriptor,
  LookupStoreDescriptor,
} from '@ballware/react-contexts';
import { ToolbarItemsContext } from '@ballware/react-renderer';
import {
  componentToToolbarItemRef,
  ToolbarItemProps,
  useDefaultToolbarItemStyles,
} from './common';
import { createLookupDataSource } from '../../util/datasource';
import { SelectBox } from 'devextreme-react';

export const LookupToolbarItem = ({ toolbarItem }: ToolbarItemProps) => {
  const classes = useDefaultToolbarItemStyles();

  const { name, caption, defaultValue, lookup, width } = toolbarItem;

  const { lookups } = useContext(LookupContext);
  const { paramEditorInitialized, paramEditorValueChanged } = useContext(
    ToolbarItemsContext
  );

  const mylookup =
    lookup && lookups ? (lookups[lookup] as LookupDescriptor) : undefined;

  const dataSource = useMemo(
    () =>
      mylookup
        ? createLookupDataSource(
            (mylookup.store as LookupStoreDescriptor).listFunc,
            (mylookup.store as LookupStoreDescriptor).byIdFunc
          )
        : undefined,
    [mylookup]
  );

  return (
    <React.Fragment>
      {paramEditorInitialized &&
        paramEditorValueChanged &&
        mylookup &&
        dataSource && (
          <SelectBox
            className={classes.toolbaritem}
            dataSource={dataSource}
            noDataText={caption}
            width={width ?? '400px'}
            searchEnabled
            showClearButton
            showDropDownButton
            displayExpr={mylookup.displayMember}
            valueExpr={mylookup.valueMember}
            defaultValue={defaultValue}
            onInitialized={(e) => {
              e.component &&
                paramEditorInitialized(
                  name,
                  componentToToolbarItemRef(e.component)
                );
            }}
            onValueChanged={(e) => {
              if (paramEditorValueChanged)
                paramEditorValueChanged(name, e.value);
            }}
          />
        )}
    </React.Fragment>
  );
};
