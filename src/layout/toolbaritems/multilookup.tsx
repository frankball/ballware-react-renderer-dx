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
import { TagBox } from 'devextreme-react';

export const MultiLookupToolbarItem = ({ toolbarItem }: ToolbarItemProps) => {
  const classes = useDefaultToolbarItemStyles();

  const { name, caption, defaultValue, lookup, width } = toolbarItem;

  const { lookups } = useContext(LookupContext);
  const { paramEditorInitialized, paramEditorValueChanged } = useContext(
    ToolbarItemsContext
  );

  const mylookup =
    lookups && lookup ? (lookups[lookup] as LookupDescriptor) : undefined;

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
      {paramEditorInitialized && paramEditorValueChanged && mylookup && (
        <TagBox
          className={classes.toolbaritem}
          dataSource={dataSource}
          noDataText={caption}
          width={width ?? '400px'}
          searchEnabled
          showClearButton
          showSelectionControls
          showDropDownButton
          multiline={false}
          maxDisplayedTags={3}
          displayExpr={mylookup.displayMember}
          valueExpr={mylookup.valueMember}
          defaultValue={defaultValue}
          onInitialized={(e: any) => {
            paramEditorInitialized(
              name,
              componentToToolbarItemRef(e.component)
            );
          }}
          onValueChanged={(e) => {
            if (paramEditorValueChanged) paramEditorValueChanged(name, e.value);
          }}
        />
      )}
    </React.Fragment>
  );
};
