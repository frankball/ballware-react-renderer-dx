import React, { useContext } from 'react';

import { ToolbarItemsContext } from '@ballware/react-renderer';
import {
  componentToToolbarItemRef,
  ToolbarItemProps,
  useDefaultToolbarItemStyles,
} from './common';
import { DropDownButton } from 'devextreme-react';

export const DropDownButtonToolbarItem = ({
  toolbarItem,
}: ToolbarItemProps) => {
  const classes = useDefaultToolbarItemStyles();

  const { name, width, options, caption } = toolbarItem;

  const { paramEditorInitialized, paramEditorEvent } = useContext(
    ToolbarItemsContext
  );

  return (
    <React.Fragment>
      {paramEditorInitialized && paramEditorEvent && (
        <DropDownButton
          className={classes.toolbaritem}
          width={width ?? '180px'}
          text={caption}
          dataSource={options.items as any[]}
          keyExpr={'id'}
          displayExpr={'text'}
          splitButton
          onButtonClick={() => {
            paramEditorEvent(name, 'click', undefined);
          }}
          onItemClick={(e) => {
            paramEditorEvent(name, 'click', e.itemData.id);
          }}
          onInitialized={(e: any) => {
            paramEditorInitialized(
              name,
              componentToToolbarItemRef(e.component)
            );
          }}
        />
      )}
    </React.Fragment>
  );
};
