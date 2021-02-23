import React, { useContext } from 'react';

import { ToolbarItemsContext } from '@ballware/react-renderer';
import {
  componentToToolbarItemRef,
  ToolbarItemProps,
  useDefaultToolbarItemStyles,
} from './common';
import { DateBox } from 'devextreme-react';
import { useTranslation } from 'react-i18next';

export const DatetimeToolbarItem = ({ toolbarItem }: ToolbarItemProps) => {
  const classes = useDefaultToolbarItemStyles();

  const { name, caption, defaultValue, width } = toolbarItem;

  const { t } = useTranslation();

  const { paramEditorInitialized, paramEditorValueChanged } = useContext(
    ToolbarItemsContext
  );

  return (
    <React.Fragment>
      {t && paramEditorInitialized && paramEditorValueChanged && (
        <DateBox
          className={classes.toolbaritem}
          hint={caption}
          width={width ?? '220px'}
          type={'datetime'}
          displayFormat={`'${caption}': ${t('format.datetime')}`}
          defaultValue={defaultValue}
          onInitialized={(e) => {
            e.component &&
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
