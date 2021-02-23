import { PageToolbarItem } from '@ballware/meta-interface';
import { ToolbarItemRef } from '@ballware/react-renderer';
import { makeStyles } from '@material-ui/core';
import Component from 'devextreme/core/component';

export interface ToolbarItemProps {
  toolbarItem: PageToolbarItem;
}

export const useDefaultToolbarItemStyles = makeStyles((theme) => ({
  toolbaritem: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
}));

export const componentToToolbarItemRef = (component: Component) => {
  return {
    getOption: (option) => component.option(option),
    setOption: (option, value) => component.option(option, value),
  } as ToolbarItemRef;
};
