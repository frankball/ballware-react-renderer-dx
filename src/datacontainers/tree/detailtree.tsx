import React, {
  useMemo,
  useRef,
  useImperativeHandle,
  forwardRef,
  useContext,
} from 'react';

import {
  EditLayoutItemOptions,
  GridLayoutColumn,
} from '@ballware/meta-interface';
import TreeList, { Editing } from 'devextreme-react/tree-list';
import {
  createColumnConfiguration,
  renderCellTemplates,
  RenderCellTemplatesProps,
} from '../columns/columntemplates';
import { LookupContext } from '@ballware/react-contexts';
import { dxTreeListColumn, dxTreeListRowObject } from 'devextreme/ui/tree_list';
import { EditItemsContext } from '@ballware/react-renderer';
import { useTranslation } from 'react-i18next';

export interface DetailTreeRef {
  getValue: () => Array<Record<string, unknown>>;
  setValue: (value: Array<Record<string, unknown>>) => void;
}

export interface DetailTreeItemOptions {
  add?: boolean;
  update?: boolean;
  delete?: boolean;
  columns: Array<GridLayoutColumn>;
}

export interface DetailTreeProps {
  readonly: boolean;
  defaultValue: Array<Record<string, unknown>>;
  setValue: (value: Array<Record<string, unknown>>) => void;
  layoutItem: EditLayoutItemOptions;
}

export const DetailTree = forwardRef<DetailTreeRef, DetailTreeProps>(
  ({ readonly, defaultValue, setValue, layoutItem }, ref): JSX.Element => {
    const { t } = useTranslation();

    const {
      getValue,
      detailGridRowValidating,
      initNewDetailItem,
      detailEditorPreparing,
      detailEditorValueChanged,
      detailEditorEntered,
    } = useContext(EditItemsContext);
    const { lookups } = useContext(LookupContext);

    const treeRef = useRef<TreeList>(null);

    useImperativeHandle(ref, () => ({
      getValue: () => {
        return treeRef.current?.instance.option('dataSource');
      },
      setValue: (newValue) => {
        treeRef.current?.instance.option('dataSource', newValue);
        setValue(newValue);
      },
    }));

    const dataMember = layoutItem.dataMember;
    const options = layoutItem.itemoptions as DetailTreeItemOptions;

    const treeEditorPreparing = (e: {
      editorName?: string;
      editorOptions?: any;
      dataField?: string;
      parentType?: string;
      row?: dxTreeListRowObject;
    }) => {
      if (
        e.parentType === 'dataRow' &&
        detailEditorPreparing &&
        dataMember &&
        e.row?.node &&
        e.dataField
      ) {
        detailEditorPreparing(
          dataMember,
          e.row.node.data,
          e.dataField,
          e.editorOptions
        );

        const defaultValueChanged = e.editorOptions.onValueChanged;
        const defaultFocusIn = e.editorOptions.onFocusIn;

        e.editorOptions.onValueChanged = (args: {
          component: any;
          value: any;
        }) => {
          if (defaultValueChanged) defaultValueChanged(args);

          if (detailEditorValueChanged && e.row?.node && e.dataField)
            detailEditorValueChanged(
              dataMember,
              e.row.node.data,
              e.dataField,
              args.value,
              true
            );
        };

        e.editorOptions.onFocusIn = (args: any) => {
          if (defaultFocusIn) defaultFocusIn(args);

          if (detailEditorEntered && e.row?.node && e.dataField) {
            detailEditorEntered(dataMember, e.row.node.data, e.dataField);
          }
        };

        e.editorOptions.valueChangeEvent = 'focusout';
      }
    };

    const treeRowValidating = (e: {
      oldData?: object;
      newData?: object;
      isValid?: boolean;
      errorText?: string;
    }) => {
      if (detailGridRowValidating && dataMember) {
        const validatingData = { ...e.oldData, ...e.newData };

        const newErrorText = detailGridRowValidating(
          dataMember,
          validatingData
        );

        if (newErrorText) {
          e.errorText = newErrorText;
          e.isValid = false;
        }
      }
    };

    const onInitNewDetailItem = (dataMember: string, detailItem: any) => {
      if (initNewDetailItem) {
        initNewDetailItem(dataMember, detailItem);
      }
    };

    const columnConfiguration = useMemo(
      () =>
        getValue &&
        createColumnConfiguration<dxTreeListColumn>(
          t,
          options.columns,
          lookups,
          getValue(),
          'detail',
          undefined,
          undefined
        ),
      [t, options, lookups, getValue]
    );

    return (
      <TreeList
        ref={treeRef}
        width={layoutItem.width}
        repaintChangesOnly
        columnAutoWidth
        allowColumnResizing
        dataSource={defaultValue}
        onEditorPreparing={treeEditorPreparing}
        onInitNewRow={(e) =>
          dataMember && onInitNewDetailItem(dataMember, e.data)
        }
        onRowValidating={treeRowValidating}
        columns={columnConfiguration}
        dataStructure={'tree'}
        itemsExpr={'items'}
      >
        <Editing
          mode={'cell'}
          useIcons
          allowAdding={!readonly && options.add}
          allowUpdating={!readonly && options.update}
          allowDeleting={!readonly && options.delete}
        />
        {getValue &&
          renderCellTemplates({
            lookupParams: getValue(),
          } as RenderCellTemplatesProps)}
      </TreeList>
    );
  }
);
