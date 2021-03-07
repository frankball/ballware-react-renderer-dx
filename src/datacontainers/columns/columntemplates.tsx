import React, { useContext, useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { GridLayoutColumn, CrudItem } from '@ballware/meta-interface';
import {
  LookupDescriptor,
  LookupCreator,
  AutocompleteCreator,
  LookupStoreDescriptor,
  LookupContext,
} from '@ballware/react-contexts';
import { EditItemsProvider } from '@ballware/react-renderer';
import { createLookupDataSource } from '../../util/datasource';
import { dxTreeListColumn } from 'devextreme/ui/tree_list';
import { dxDataGridColumn } from 'devextreme/ui/data_grid';
import { dxEvent } from 'devextreme/events';
import TagBox from 'devextreme-react/tag-box';
import { Template } from 'devextreme-react/core/template';
import TextBox from 'devextreme-react/text-box';
import { DetailEditPopup } from '../../editing/detaileditpopup';
import CheckBox from 'devextreme-react/check-box';
import NumberBox from 'devextreme-react/number-box';
import DateBox from 'devextreme-react/date-box';
import {
  EditItemsContext,
  getByPath,
  setByPath,
} from '@ballware/react-renderer';

export type OptionButtons =
  | 'add'
  | 'edit'
  | 'view'
  | 'delete'
  | 'print'
  | 'options'
  | 'customoptions';

function createColumn<ColumnType extends dxTreeListColumn | dxDataGridColumn>(
  t: (id: string, param?: Record<string, unknown>) => string,
  c: GridLayoutColumn,
  lookups:
    | Record<
        string,
        LookupDescriptor | LookupCreator | AutocompleteCreator | Array<unknown>
      >
    | undefined,
  lookupParams: Record<string, unknown>
) {
  switch (c.type) {
    case 'text':
      return {
        dataField: c.dataMember,
        caption: c.caption,
        width: c.width,
        fixed: c.fixedPosition ? true : false,
        fixedPosition: c.fixedPosition,
        allowEditing: c.editable ?? false,
        visible: c.visible ?? true,
        sortOrder: c.sorting,
      } as ColumnType;
    case 'bool':
      return {
        dataField: c.dataMember,
        caption: c.caption,
        width: c.width,
        fixed: c.fixedPosition ? true : false,
        fixedPosition: c.fixedPosition,
        allowEditing: c.editable ?? false,
        visible: c.visible ?? true,
        sortOrder: c.sorting,
        dataType: 'boolean',
      } as ColumnType;
    case 'number':
      return {
        dataField: c.dataMember,
        caption: c.caption,
        width: c.width,
        fixed: c.fixedPosition ? true : false,
        fixedPosition: c.fixedPosition,
        allowEditing: c.editable ?? false,
        visible: c.visible ?? true,
        sortOrder: c.sorting,
        format: c.precision
          ? { type: 'fixedPoint', precision: c.precision }
          : null,
        editorOptions: { showSpinButtons: true },
      } as ColumnType;
    case 'date':
      return {
        dataField: c.dataMember,
        caption: c.caption,
        width: c.width,
        fixed: c.fixedPosition ? true : false,
        fixedPosition: c.fixedPosition,
        allowEditing: c.editable ?? false,
        visible: c.visible ?? true,
        sortOrder: c.sorting,
        dataType: 'date',
        format: t('format.date'),
      } as ColumnType;
    case 'datetime':
      return {
        dataField: c.dataMember,
        caption: c.caption,
        width: c.width,
        fixed: c.fixedPosition ? true : false,
        fixedPosition: c.fixedPosition,
        allowEditing: c.editable ?? false,
        visible: c.visible ?? true,
        sortOrder: c.sorting,
        dataType: 'datetime',
        format: t('format.datetime'),
      } as ColumnType;
    case 'lookup':
    case 'pickvalue': {
      const lookup = (lookups && c.lookup && c.lookupParam
        ? (lookups[c.lookup] as LookupCreator)(
            getByPath(lookupParams, c.lookupParam) as string
          )
        : lookups && c.lookup
        ? lookups[c.lookup]
        : undefined) as LookupDescriptor;

      const dataSource = lookup
        ? createLookupDataSource(
            (lookup.store as LookupStoreDescriptor).listFunc,
            (lookup.store as LookupStoreDescriptor).byIdFunc
          )
        : undefined;

      return {
        dataField: c.dataMember,
        caption: c.caption,
        width: c.width,
        fixed: c.fixedPosition ? true : false,
        fixedPosition: c.fixedPosition,
        allowEditing: c.editable ?? false,
        visible: c.visible ?? true,
        sortOrder: c.sorting,
        lookup: {
          dataSource: dataSource?.store(),
          displayExpr: lookup?.displayMember,
          valueExpr: lookup?.valueMember,
        },
      } as ColumnType;
    }
    case 'staticlookup': {
      const items = c.items;

      return {
        dataField: c.dataMember,
        caption: c.caption,
        width: c.width,
        fixed: c.fixedPosition ? true : false,
        fixedPosition: c.fixedPosition,
        allowEditing: c.editable ?? false,
        visible: c.visible ?? true,
        sortOrder: c.sorting,
        lookup: {
          dataSource: items,
          displayExpr: c.displayExpr ?? 'Text',
          valueExpr: c.valueExpr ?? 'Value',
        },
      } as ColumnType;
    }
    case 'staticmultilookup': {
      return {
        dataField: c.dataMember,
        caption: c.caption,
        width: c.width,
        fixed: c.fixedPosition ? true : false,
        fixedPosition: c.fixedPosition,
        allowEditing: c.editable ?? false,
        visible: c.visible ?? true,
        sortOrder: c.sorting,
        editorOptions: c,
        cellTemplate: 'static',
        editCellTemplate: 'staticedit',
      } as ColumnType;
    }
    case 'dynamic': {
      return {
        dataField: c.dataMember,
        caption: c.caption,
        width: c.width,
        fixed: c.fixedPosition ? true : false,
        fixedPosition: c.fixedPosition,
        allowEditing: c.editable ?? false,
        visible: c.visible ?? true,
        sortOrder: c.sorting,
        editorOptions: c,
        cellTemplate: 'dynamic',
        editCellTemplate: 'dynamicedit',
      } as ColumnType;
    }
    case 'popup': {
      return {
        dataField: c.dataMember,
        caption: c.caption,
        width: c.width,
        fixed: c.fixedPosition ? true : false,
        fixedPosition: c.fixedPosition,
        allowEditing: false,
        visible: c.visible ?? true,
        sortOrder: c.sorting,
        editorOptions: c,
        cellTemplate: 'dynamic',
      } as ColumnType;
    }
    default: {
      return {
        dataField: c.dataMember,
        caption: c.caption,
        width: c.width,
        fixed: c.fixedPosition ? true : false,
        fixedPosition: c.fixedPosition,
        allowEditing: c.editable ?? false,
        visible: c.visible ?? true,
        sortOrder: c.sorting,
      } as ColumnType;
    }
  }
}

export interface RenderCellTemplatesProps {
  lookupParams?: Record<string, unknown>;
}

interface TemplateColumnProps {
  column: GridLayoutColumn;
  item: Record<string, unknown>;
  dataMember: string;
  editing: boolean;
  lookupParams: Record<string, unknown>;
  setValue: (value: any) => void;
}

const TemplateColumn = ({
  column,
  editing,
  item,
  dataMember,
  lookupParams,
  setValue,
}: TemplateColumnProps) => {
  const { t } = useTranslation();

  const { detailGridCellPreparing, EditProvider } = useContext(
    EditItemsContext
  );
  const { lookups, getGenericLookupByIdentifier } = useContext(LookupContext);

  const [prepared, setPrepared] = useState<boolean>();

  const columnOptions = useMemo(() => {
    return { ...column } as GridLayoutColumn;
  }, [column]);

  useEffect(() => {
    if (
      detailGridCellPreparing &&
      getGenericLookupByIdentifier &&
      item &&
      dataMember &&
      columnOptions
    ) {
      detailGridCellPreparing(dataMember, item, columnOptions);

      setPrepared(true);
    }
  }, [
    getGenericLookupByIdentifier,
    detailGridCellPreparing,
    item,
    dataMember,
    columnOptions,
  ]);

  if (prepared && item && EditProvider && t) {
    const onValueChanged = (args: { value?: any }) => {
      if (setValue) {
        setValue(args.value);
      }
    };

    switch (columnOptions.type) {
      case 'bool':
        return (
          <CheckBox
            readOnly={!editing}
            defaultValue={getByPath(item, dataMember)}
            onValueChanged={onValueChanged}
            onInitialized={(e) => {
              if (editing) e.component?.focus();
            }}
          />
        );
      case 'number':
        return (
          <NumberBox
            readOnly={!editing}
            defaultValue={getByPath(item, dataMember)}
            onValueChanged={onValueChanged}
            onInitialized={(e) => {
              if (editing) e.component?.focus();
            }}
          />
        );
      case 'date':
        return (
          <DateBox
            type={'date'}
            displayFormat={t('format.date')}
            readOnly={!editing}
            defaultValue={getByPath(item, dataMember)}
            onValueChanged={onValueChanged}
            onInitialized={(e) => {
              if (editing) e.component?.focus();
            }}
          />
        );
      case 'datetime':
        return (
          <DateBox
            type={'datetime'}
            displayFormat={t('format.datetime')}
            readOnly={!editing}
            defaultValue={getByPath(item, dataMember)}
            onValueChanged={onValueChanged}
            onInitialized={(e) => {
              if (editing) e.component?.focus();
            }}
          />
        );
      case 'staticmultilookup':
        return (
          <TagBox
            readOnly={!editing}
            defaultValue={getByPath(item, dataMember)}
            dataSource={
              columnOptions.items ??
              (columnOptions.itemsMember
                ? (item[columnOptions.itemsMember] as Array<object>)
                : [])
            }
            displayExpr={columnOptions.displayExpr ?? 'Text'}
            valueExpr={columnOptions.valueExpr ?? 'Value'}
            onValueChanged={onValueChanged}
            onInitialized={(e) => {
              if (editing) e.component?.focus();
            }}
          />
        );
      case 'multilookup': {
        let lookup: LookupDescriptor | undefined = (columnOptions.lookup &&
        columnOptions.lookupParam &&
        lookups
          ? (lookups[columnOptions.lookup] as LookupCreator)(
              getByPath(lookupParams, columnOptions.lookupParam) as string
            )
          : lookups && columnOptions.lookup
          ? lookups[columnOptions.lookup]
          : undefined) as LookupDescriptor;

        if (!lookup && getGenericLookupByIdentifier && columnOptions.lookup) {
          lookup = getGenericLookupByIdentifier(
            columnOptions.lookup,
            columnOptions.valueExpr ?? 'Id',
            columnOptions.displayExpr ?? 'Name'
          );
        }

        const dataSource = lookup
          ? createLookupDataSource(
              (lookup.store as LookupStoreDescriptor).listFunc,
              (lookup.store as LookupStoreDescriptor).byIdFunc
            )
          : undefined;

        return (
          <TagBox
            readOnly={!editing}
            defaultValue={getByPath(item, dataMember)}
            dataSource={dataSource}
            displayExpr={columnOptions.displayExpr ?? lookup?.displayMember}
            valueExpr={columnOptions.valueExpr ?? lookup?.valueMember}
            onValueChanged={onValueChanged}
            onInitialized={(e) => {
              if (editing) e.component?.focus();
            }}
          />
        );
      }
      case 'popup': {
        return (
          <EditProvider
            item={getByPath(item, dataMember) as string}
            editLayout={undefined}
          >
            <EditItemsProvider>
              <DetailEditPopup
                readonly={!editing}
                column={columnOptions}
                applyChanges={onValueChanged}
              />
            </EditItemsProvider>
          </EditProvider>
        );
      }
    }

    return (
      <TextBox
        readOnly={!editing}
        value={getByPath(item, dataMember) as string}
        onValueChanged={onValueChanged}
        onInitialized={(e) => {
          if (editing) e.component?.focus();
        }}
      />
    );
  } else {
    return <React.Fragment></React.Fragment>;
  }
};

export const renderCellTemplates = ({
  lookupParams,
}: RenderCellTemplatesProps): Array<JSX.Element> => {
  const renderStatic = (cell: any) => {
    return (
      <TemplateColumn
        lookupParams={lookupParams ?? {}}
        column={cell.column.editorOptions}
        item={cell.data}
        dataMember={cell.column.dataField}
        editing={false}
        setValue={(value) => setByPath(cell.data, cell.column.dataField, value)}
      />
    );
  };

  const renderEditableStatic = (cell: any) => {
    return (
      <TemplateColumn
        lookupParams={lookupParams ?? {}}
        column={cell.column.editorOptions}
        item={cell.data}
        dataMember={cell.column.dataField}
        editing={true}
        setValue={(value) => setByPath(cell.data, cell.column.dataField, value)}
      />
    );
  };

  let cellTemplateKey = 1;

  return [
    <Template key={cellTemplateKey++} name={'static'} render={renderStatic} />,
    <Template
      key={cellTemplateKey++}
      name={'staticedit'}
      render={renderEditableStatic}
    />,
    <Template key={cellTemplateKey++} name={'dynamic'} render={renderStatic} />,
    <Template
      key={cellTemplateKey++}
      name={'dynamicedit'}
      render={renderEditableStatic}
    />,
  ];
};

export function createColumnConfiguration<
  ColumnType extends dxTreeListColumn | dxDataGridColumn
>(
  t: (id: string, param?: Record<string, unknown>) => string,
  columns: Array<GridLayoutColumn>,
  lookups:
    | Record<
        string,
        LookupDescriptor | LookupCreator | AutocompleteCreator | Array<unknown>
      >
    | undefined,
  lookupParams: Record<string, unknown>,
  mode: 'small' | 'medium' | 'large' | 'detail',
  onButtonClick?: (
    button: OptionButtons,
    data: CrudItem,
    target: Element
  ) => void,
  onButtonAllowed?: (button: OptionButtons, data: CrudItem) => boolean
): Array<ColumnType> {
  const gridColumns =
    columns
      ?.sort((a, b) => ((a.position ?? 0) <= (b.position ?? 0) ? -1 : 1))
      .map((c) => createColumn<ColumnType>(t, c, lookups, lookupParams)) ?? [];

  switch (mode) {
    case 'small':
    case 'medium':
      if (onButtonClick && onButtonAllowed) {
        gridColumns.push({
          type: 'buttons',
          width: '40px',
          buttons: [
            {
              hint: t('datacontainer.actions.options'),
              icon: 'bi bi-three-dots-vertical',
              onClick: (e: any) =>
                onButtonClick(
                  'options',
                  e.row.data ?? e.row.node.data,
                  (e.event as dxEvent).currentTarget
                ),
              visible: (options: any) =>
                onButtonAllowed(
                  'options',
                  options.row.data ?? options.row.node.data
                ),
            },
          ],
        } as ColumnType);
      }
      break;
    case 'large':
      if (onButtonClick && onButtonAllowed) {
        gridColumns.push({
          type: 'buttons',
          buttons: [
            {
              hint: t('datacontainer.actions.show'),
              icon: 'bi bi-eye-fill',
              onClick: (e: any) =>
                onButtonClick(
                  'view',
                  e.row.data ?? e.row.node.data,
                  (e.event as dxEvent).currentTarget
                ),
              visible: (options: any) =>
                onButtonAllowed(
                  'view',
                  options.row.data ?? options.row.node.data
                ),
            },
            {
              hint: t('datacontainer.actions.edit'),
              icon: 'bi bi-pencil-fill',
              onClick: (e: any) =>
                onButtonClick(
                  'edit',
                  e.row.data ?? e.row.node.data,
                  (e.event as dxEvent).currentTarget
                ),
              visible: (options: any) =>
                onButtonAllowed(
                  'edit',
                  options.row.data ?? options.row.node.data
                ),
            },
            {
              hint: t('datacontainer.actions.remove'),
              icon: 'bi bi-trash-fill',
              onClick: (e: any) =>
                onButtonClick(
                  'delete',
                  e.row.data ?? e.row.node.data,
                  (e.event as dxEvent).currentTarget
                ),
              visible: (options: any) =>
                onButtonAllowed(
                  'delete',
                  options.row.data ?? options.row.node.data
                ),
            },
            {
              hint: t('datacontainer.actions.print'),
              icon: 'bi bi-printer-fill',
              onClick: (e: any) =>
                onButtonClick(
                  'print',
                  e.row.data ?? e.row.node.data,
                  (e.event as dxEvent).currentTarget
                ),
              visible: (options: any) =>
                onButtonAllowed(
                  'print',
                  options.row.data ?? options.row.node.data
                ),
            },
            {
              hint: t('datacontainer.actions.options'),
              icon: 'bi bi-three-dots-vertical',
              onClick: (e: any) =>
                onButtonClick(
                  'customoptions',
                  e.row.data ?? e.row.node.data,
                  (e.event as dxEvent).currentTarget
                ),
              visible: (options: any) =>
                onButtonAllowed(
                  'customoptions',
                  options.row.data ?? options.row.node.data
                ),
            },
          ],
        } as ColumnType);
      }
      break;
  }

  return gridColumns;
}
