import React, {
  useMemo,
  useRef,
  useImperativeHandle,
  forwardRef,
  useContext,
  useState,
  useCallback,
} from 'react';

import { useTranslation } from 'react-i18next';

import {
  EditLayoutItemOptions,
  GridLayoutColumn,
} from '@ballware/meta-interface';
import DataGrid, { Editing } from 'devextreme-react/data-grid';
import {
  createColumnConfiguration,
  renderCellTemplates,
} from '../columns/columntemplates';
import { LookupContext, EditContext } from '@ballware/react-contexts';
import { dxDataGridColumn, dxDataGridRowObject } from 'devextreme/ui/data_grid';
import { EditItemsContext } from '@ballware/react-renderer';
import { componentToEditorRef } from '../../editing/items/common';

export interface DetailGridRef {
  getValue: () => Array<Record<string, unknown>>;
  setValue: (value: Array<Record<string, unknown>>) => void;
}

export interface DetailGridItemOptions {
  add?: boolean;
  update?: boolean;
  delete?: boolean;
  columns: Array<GridLayoutColumn>;
}

export interface DetailGridProps {
  readonly: boolean;
  //mode: EditModes;
  defaultValue: Array<Record<string, unknown>>;
  setValue: (value: Array<Record<string, unknown>>) => void;
  layoutItem: EditLayoutItemOptions;
  onInitialized: () => void;
}

export const DetailGrid = forwardRef<DetailGridRef, DetailGridProps>(
  (
    { readonly, defaultValue, setValue, onInitialized, layoutItem },
    ref
  ): JSX.Element => {
    const [allowAdd] = useState<boolean>(
      (!readonly && (layoutItem.itemoptions as DetailGridItemOptions).add) ??
        false
    );
    const [allowUpdate] = useState<boolean>(
      (!readonly && (layoutItem.itemoptions as DetailGridItemOptions).update) ??
        false
    );
    const [allowDelete] = useState<boolean>(
      (!readonly && (layoutItem.itemoptions as DetailGridItemOptions).delete) ??
        false
    );

    const {
      getValue,
      detailGridRowValidating,
      initNewDetailItem,
      detailEditorPreparing,
      detailEditorInitialized,
      detailEditorValueChanged,
      detailEditorEntered,
    } = useContext(EditItemsContext);
    const { lookups } = useContext(LookupContext);
    const { item } = useContext(EditContext);
    const gridRef = useRef<DataGrid>(null);

    const { t } = useTranslation();

    useImperativeHandle(ref, () => ({
      getValue: () => {
        return gridRef.current?.instance.option('dataSource');
      },
      setValue: (newValue) => {
        gridRef.current?.instance.option('dataSource', newValue);
        setValue(newValue);
      },
    }));

    const dataMember = layoutItem.dataMember;

    const onGridEditorPreparing = useCallback(
      (e: {
        editorName?: string;
        editorOptions?: any;
        dataField?: string;
        parentType?: string;
        row?: dxDataGridRowObject;
      }) => {
        if (e.parentType === 'dataRow' && e.row && e.dataField) {
          if (dataMember && detailEditorPreparing) {
            detailEditorPreparing(
              dataMember,
              e.row.data,
              e.dataField,
              e.editorOptions
            );
          }

          const defaultValueChanged = e.editorOptions.onValueChanged;
          const defaultFocusIn = e.editorOptions.onFocusIn;

          e.editorOptions.onValueChanged = (args: {
            component: any;
            value: any;
          }) => {
            if (defaultValueChanged) defaultValueChanged(args);

            if (
              dataMember &&
              detailEditorValueChanged &&
              e.row &&
              e.dataField
            ) {
              detailEditorValueChanged(
                dataMember,
                e.row.data,
                e.dataField,
                args.value,
                true
              );
            }
          };

          e.editorOptions.onFocusIn = (args: any) => {
            if (defaultFocusIn) defaultFocusIn(args);

            if (dataMember && detailEditorEntered && e.row && e.dataField) {
              detailEditorEntered(dataMember, e.row.data, e.dataField);
            }
          };

          e.editorOptions.onInitialized = (args: any) => {
            if (dataMember && detailEditorInitialized && e.row && e.dataField) {
              detailEditorInitialized(
                dataMember,
                e.row.data,
                e.dataField,
                componentToEditorRef(args.component)
              );
            }
          };

          e.editorOptions.valueChangeEvent = 'focusout';
        }
      },
      [
        dataMember,
        detailEditorEntered,
        detailEditorInitialized,
        detailEditorPreparing,
        detailEditorValueChanged,
      ]
    );

    const onGridRowValidating = useCallback(
      (e: {
        oldData?: object;
        newData?: object;
        isValid?: boolean;
        errorText?: string;
      }) => {
        const validatingData = { ...e.oldData, ...e.newData };

        if (dataMember && detailGridRowValidating) {
          const newErrorText = detailGridRowValidating(
            dataMember,
            validatingData
          );

          if (newErrorText) {
            e.errorText = newErrorText;
            e.isValid = false;
          }
        }
      },
      [dataMember, detailGridRowValidating]
    );

    const onInitNewDetailItem = useCallback(
      (dataMember: string, detailItem: any) => {
        if (initNewDetailItem) {
          initNewDetailItem(dataMember, detailItem);
        }
      },
      [initNewDetailItem]
    );

    const columnConfiguration = useMemo(() => {
      const options = layoutItem.itemoptions as DetailGridItemOptions;

      return createColumnConfiguration<dxDataGridColumn>(
        t,
        options.columns,
        lookups,
        item as Record<string, unknown>,
        'detail',
        undefined,
        undefined
      );
    }, [t, layoutItem, lookups, item]);

    return (
      <React.Fragment>
        {dataMember &&
          getValue &&
          detailGridRowValidating &&
          initNewDetailItem &&
          detailEditorPreparing &&
          detailEditorValueChanged &&
          detailEditorEntered && (
            <DataGrid
              ref={gridRef}
              width={layoutItem.width}
              repaintChangesOnly
              columnAutoWidth
              allowColumnResizing
              dataSource={defaultValue}
              onEditorPreparing={onGridEditorPreparing}
              onInitNewRow={(e) => onInitNewDetailItem(dataMember, e.data)}
              onRowValidating={onGridRowValidating}
              onInitialized={onInitialized}
              columns={columnConfiguration}
            >
              <Editing
                mode={'cell'}
                useIcons
                allowAdding={allowAdd}
                allowUpdating={allowUpdate}
                allowDeleting={allowDelete}
              />
              {renderCellTemplates({
                lookupParams: getValue(),
              })}
            </DataGrid>
          )}
      </React.Fragment>
    );
  }
);
