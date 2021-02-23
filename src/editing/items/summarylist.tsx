import React, { useState, useEffect, useContext } from 'react';

import { FieldSet } from './fieldset';
import {
  getByPath,
  EditorRef,
  EditItemsContext,
} from '@ballware/react-renderer';

import {
  makeStyles,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
} from '@material-ui/core';
import ErrorIcon from '@material-ui/icons/Error';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import HelpIcon from '@material-ui/icons/Help';
import { EditLayoutItem } from '@ballware/meta-interface';

const useSummaryStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    backgroundColor: theme.palette.background.paper,
  },
}));

export interface SummaryElementOptions {
  icon?: string;
  hintExpr?: string;
}

export interface SummaryListProps {
  layoutItem: EditLayoutItem;
}

export const SummaryList = ({ layoutItem }: SummaryListProps) => {
  const {
    getValue,
    editorPreparing,
    editorInitialized,
    editorValueChanged,
  } = useContext(EditItemsContext);
  const [value, setValue] = useState<Record<string, unknown>>();
  const [prepared, setPrepared] = useState(false);

  const classes = useSummaryStyles();

  useEffect(() => {
    if (
      getValue &&
      editorPreparing &&
      layoutItem &&
      layoutItem.options?.dataMember
    ) {
      editorPreparing(layoutItem.options.dataMember, layoutItem.options);
      setValue(getValue(layoutItem.options.dataMember));
      setPrepared(true);
    }
  }, [getValue, editorPreparing, layoutItem]);

  if (
    prepared &&
    layoutItem &&
    layoutItem.options?.dataMember &&
    editorValueChanged &&
    editorInitialized
  ) {
    const editor = {
      getOption: (option) => {
        switch (option) {
          case 'value':
            return value;
        }

        return undefined;
      },
      setOption: (option, newValue) => {
        switch (option) {
          case 'value':
            if (value !== newValue) {
              setValue(newValue as Record<string, unknown>);
              layoutItem.options?.dataMember &&
                editorValueChanged(
                  layoutItem.options.dataMember,
                  newValue as Record<string, unknown>,
                  false
                );
            }
            break;
        }
      },
    } as EditorRef;

    editorInitialized(layoutItem.options.dataMember, editor);
  }

  const statusIconFunc = (state: number) => {
    switch (state) {
      case 1:
        return <ErrorIcon />;
      case 2:
        return <HelpIcon />;
      case 3:
        return <CheckCircleIcon />;
    }

    return <React.Fragment></React.Fragment>;
  };

  if (prepared && value && layoutItem.options) {
    let itemCount = 1;

    const entries = layoutItem.items?.map((it) => {
      const options = it.options?.itemoptions as SummaryElementOptions;

      return (
        <ListItem key={itemCount++}>
          {it.options?.valueExpr && (
            <ListItemIcon>
              {statusIconFunc(
                getByPath(value, it.options?.valueExpr) as number
              )}
            </ListItemIcon>
          )}
          {it.options?.displayExpr && (
            <ListItemText
              primary={getByPath(value, it.options.displayExpr) as string}
              secondary={
                (options.hintExpr
                  ? getByPath(value, options.hintExpr)
                  : '') as string
              }
            />
          )}
        </ListItem>
      );
    });

    return (
      <FieldSet layoutItem={layoutItem.options}>
        <List className={classes.root}>{entries}</List>
      </FieldSet>
    );
  }

  return <CircularProgress />;
};
