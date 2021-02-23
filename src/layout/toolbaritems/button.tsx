import React, { useContext } from 'react';

import { ToolbarItemsContext } from '@ballware/react-renderer';
import { ToolbarItemProps, useDefaultToolbarItemStyles } from './common';
import { Button } from 'devextreme-react';

export const ButtonToolbarItem = ({ toolbarItem }: ToolbarItemProps) => {
  const classes = useDefaultToolbarItemStyles();

  const { name, width, caption } = toolbarItem;

  const { paramEditorInitialized, paramEditorEvent } = useContext(
    ToolbarItemsContext
  );

  return (
    <React.Fragment>
      {paramEditorInitialized && paramEditorEvent && (
        <Button
          className={classes.toolbaritem}
          width={width ?? 'auto'}
          text={caption}
          onClick={() => {
            paramEditorEvent(name, 'click', undefined);
          }}
        />
      )}
    </React.Fragment>
  );
};
