import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useContext,
  useCallback,
} from 'react';

import cloneDeep from 'lodash/cloneDeep';

import { ActionSheet } from 'devextreme-react/action-sheet';

import {
  EntityCustomFunction,
  GridLayout,
  CrudItem,
} from '@ballware/meta-interface';
import moment from 'moment';
import Media from 'react-media';
import {
  createColumnConfiguration,
  OptionButtons,
} from '../columns/columntemplates';
import { createSummaryConfiguration } from './gridsummary';
import { createEditableGridDatasource } from '../../util/datasource';
import {
  MetaContext,
  CrudContext,
  LookupContext,
} from '@ballware/react-contexts';
import { dxElement } from 'devextreme/core/element';
import { dxEvent } from 'devextreme/events';
import { DataGrid } from './datagrid';
import { dxDataGridColumn } from 'devextreme/ui/data_grid';
import { useTranslation } from 'react-i18next';

export interface GridProps {
  layout: string;
  height?: string;
}

export const EntityGrid = ({ layout, height }: GridProps) => {
  const { t } = useTranslation();

  const [preparedGridLayout, setPreparedGridLayout] = useState<GridLayout>();
  const [editLayout, setEditLayout] = useState<string>();
  const [renderGrid, setRenderGrid] = useState(false);
  const [addMenuItems, setAddMenuItems] = useState<
    Array<{ id: string; text: string; customFunction?: EntityCustomFunction }>
  >();

  const { lookups } = useContext(LookupContext);
  const {
    getGridLayout,
    displayName,
    customFunctions,
    headParams,
    customParam,
    print,
    documents,
    addAllowed,
    viewAllowed,
    editAllowed,
    dropAllowed,
    printAllowed,
    customFunctionAllowed,
    prepareGridLayout,
  } = useContext(MetaContext);
  const {
    load,
    fetchParams,
    add,
    view,
    edit,
    remove,
    customEdit,
    save,
    fetchedItems,
  } = useContext(CrudContext);

  const actionRows = useRef<Array<CrudItem>>();

  const actionMenu = useRef<ActionSheet>(null);
  const printMenu = useRef<ActionSheet>(null);
  const addMenu = useRef<ActionSheet>(null);

  const viewExecute = useCallback(
    (row: CrudItem, _target: Element) => {
      if (view && editLayout) {
        view(row.Id, editLayout);
      }
    },
    [editLayout, view]
  );

  const editExecute = useCallback(
    (row: CrudItem, _target: Element) => {
      if (edit && editLayout) {
        edit(row.Id, editLayout);
      }
    },
    [editLayout, edit]
  );

  const deleteExecute = useCallback(
    (row: CrudItem, _target: Element) => {
      if (remove) {
        remove(row.Id);
      }
    },
    [remove]
  );

  const printExecute = useCallback(
    (row: CrudItem, target: Element) => {
      actionRows.current = [row];

      if (printMenu.current) {
        printMenu.current.instance.option('target', target);
        printMenu.current.instance.option('visible', true);
      }
    },
    [actionRows, printMenu]
  );

  const printMenuItemClicked = useCallback(
    (e: { itemData?: { id: string; text: string } }) => {
      if (
        e.itemData &&
        print &&
        actionRows.current &&
        actionRows.current?.length > 0
      ) {
        const item = e.itemData;

        print(
          item.id,
          actionRows.current.map((item) => item.Id)
        );
      }
    },
    [actionRows, print]
  );

  const actionMenuExecute = useCallback(
    (row: CrudItem, target: Element) => {
      const actions = [];

      if (t) {
        if (viewAllowed && viewAllowed(row)) {
          actions.push({
            id: 'view',
            text: t('datacontainer.actions.show'),
            icon: 'bi bi-eye-fill',
            row: row,
            originalTarget: target,
            execute: viewExecute,
          });
        }

        if (editAllowed && editAllowed(row)) {
          actions.push({
            id: 'edit',
            text: t('datacontainer.actions.edit'),
            icon: 'bi bi-pencil-fill',
            row: row,
            originalTarget: target,
            execute: editExecute,
          });
        }

        if (dropAllowed && dropAllowed(row)) {
          actions.push({
            id: 'delete',
            text: t('datacontainer.actions.remove'),
            icon: 'bi bi-trash-fill',
            row: row,
            originalTarget: target,
            execute: deleteExecute,
          });
        }

        if (printAllowed && printAllowed(row)) {
          actions.push({
            id: 'print',
            text: t('datacontainer.actions.print'),
            icon: 'bi bi-printer-fill',
            row: row,
            originalTarget: target,
            execute: printExecute,
          });
        }

        if (customFunctions && customFunctionAllowed) {
          const additionalFunctions = customFunctions
            ?.filter((f) => f.type === 'edit' && customFunctionAllowed(f, row))
            .map((f) =>
              Object.assign({}, f, { row: row, originalTarget: target })
            );

          additionalFunctions?.forEach((f) => actions.push(f));
        }

        if (actionMenu.current) {
          actionMenu.current.instance.option('dataSource', actions);
          actionMenu.current.instance.option('target', target);
          actionMenu.current.instance.option('visible', true);
        }
      }
    },
    [
      t,
      viewAllowed,
      editAllowed,
      dropAllowed,
      printAllowed,
      customFunctionAllowed,
      viewExecute,
      editExecute,
      deleteExecute,
      printExecute,
      customFunctions,
      actionMenu,
    ]
  );

  const additionalActionMenuExecute = useCallback(
    (row: CrudItem, target: Element) => {
      const actions: Array<any> = [];

      if (customFunctions && customFunctionAllowed) {
        const additionalFunctions = customFunctions
          ?.filter((f) => f.type === 'edit' && customFunctionAllowed(f, row))
          .map((f) =>
            Object.assign({}, f, { row: row, originalTarget: target })
          );

        additionalFunctions?.forEach((f) => actions.push(f));
      }

      if (actionMenu.current) {
        actionMenu.current.instance.option('dataSource', actions);
        actionMenu.current.instance.option('target', target);
        actionMenu.current.instance.option('visible', true);
      }
    },
    [customFunctionAllowed, customFunctions, actionMenu]
  );

  const actionItemClicked = useCallback(
    (e: {
      itemData?: EntityCustomFunction & {
        row: CrudItem;
        originalTarget: Element;
      };
    }) => {
      if (e.itemData) {
        switch (e.itemData.id) {
          case 'view':
            viewExecute(e.itemData.row, e.itemData.originalTarget);
            break;
          case 'edit':
            editExecute(e.itemData.row, e.itemData.originalTarget);
            break;
          case 'delete':
            deleteExecute(e.itemData.row, e.itemData.originalTarget);
            break;
          case 'print':
            printExecute(e.itemData.row, e.itemData.originalTarget);
            break;
          default: {
            switch (e.itemData.type) {
              case 'edit':
                if (customEdit) {
                  customEdit(e.itemData, [e.itemData.row]);
                }
                break;
            }
          }
        }
      }
    },
    [customEdit, printExecute, deleteExecute, editExecute, viewExecute]
  );

  const onRowDblClick = useCallback(
    (e: { event: dxEvent; data: CrudItem; element: dxElement }) => {
      e.event.stopPropagation();

      actionRows.current = [e.data];
      actionMenuExecute(e.data, e.element);
    },
    [actionRows, actionMenuExecute]
  );

  const addMenuItemClicked = useCallback(
    (e: {
      itemData?: {
        id: string;
        text: string;
        customFunction?: EntityCustomFunction;
      };
    }) => {
      if (e.itemData) {
        const item = e.itemData;

        if (item.id === 'none') {
          if (add && editLayout) {
            add(editLayout);
          }
        } else {
          if (item.customFunction && customEdit) {
            customEdit(item.customFunction);
          }
        }
      }
    },
    [add, customEdit, editLayout]
  );

  const addButtonClicked = useCallback(
    (e: { target: Element }) => {
      if (addMenu.current && addMenuItems && addMenuItems.length > 1) {
        addMenu.current.instance.option('dataSource', addMenuItems);
        addMenu.current.instance.option('target', e.target);
        addMenu.current.instance.option('visible', true);
      } else if (addMenuItems) {
        addMenuItemClicked({ itemData: addMenuItems[0] });
      }
    },
    [addMenuItemClicked, addMenuItems]
  );

  const printButtonClicked = useCallback(
    (e: { target: Element; items: Array<CrudItem> }) => {
      actionRows.current = e.items;

      if (printMenu.current) {
        printMenu.current.instance.option('target', e.target);
        printMenu.current.instance.option('visible', true);
      }
    },
    [printMenu]
  );

  const customFunctionButtonClicked = useCallback(
    (e: { id: string; target: Element; items: Array<CrudItem> }) => {
      if (customFunctions && customEdit) {
        const customFunction = customFunctions.find((f) => f.id === e.id);

        if (customFunction) {
          customEdit(customFunction, e.items);
        }
      }
    },
    [customEdit, customFunctions]
  );

  const optionButtonClicked = useCallback(
    (button: OptionButtons, data: CrudItem, target: Element) => {
      switch (button) {
        case 'add':
          break;
        case 'view':
          viewExecute(data, target);
          break;
        case 'edit':
          editExecute(data, target);
          break;
        case 'delete':
          deleteExecute(data, target);
          break;
        case 'print':
          printExecute(data, target);
          break;
        case 'options':
          actionRows.current = [data];
          actionMenuExecute(data, target);
          break;
        case 'customoptions':
          actionRows.current = [data];
          additionalActionMenuExecute(data, target);
          break;
      }
    },
    [
      viewExecute,
      editExecute,
      deleteExecute,
      printExecute,
      actionMenuExecute,
      additionalActionMenuExecute,
    ]
  );

  const optionButtonAllowed = useCallback(
    (button: OptionButtons, data?: CrudItem): boolean => {
      switch (button) {
        case 'add':
          return (addAllowed && addAllowed()) ?? false;
        case 'view':
          return (data && viewAllowed && viewAllowed(data)) ?? false;
        case 'edit':
          return (data && editAllowed && editAllowed(data)) ?? false;
        case 'delete':
          return (data && dropAllowed && dropAllowed(data)) ?? false;
        case 'print':
          return (data && printAllowed && printAllowed(data)) ?? false;
        case 'options':
          return true;
        case 'customoptions': {
          if (data && customFunctions && customFunctionAllowed) {
            const allowedAdditionalFunctions = customFunctions?.filter((f) =>
              customFunctionAllowed(f, data)
            );

            return allowedAdditionalFunctions?.length > 0;
          }

          return false;
        }
        default:
          return false;
      }
    },
    [
      addAllowed,
      viewAllowed,
      editAllowed,
      dropAllowed,
      printAllowed,
      customFunctionAllowed,
      customFunctions,
    ]
  );

  useEffect(() => {
    if (preparedGridLayout) {
      const nextEditLayout =
        preparedGridLayout.editLayout ??
        preparedGridLayout.identifier ??
        'primary';

      setEditLayout(nextEditLayout);
    }
  }, [preparedGridLayout]);

  useEffect(() => {
    if (
      getGridLayout &&
      lookups &&
      customParam &&
      layout &&
      prepareGridLayout
    ) {
      const gridLayout = getGridLayout(layout);

      if (gridLayout) {
        const unpreparedGridLayout = cloneDeep(gridLayout);

        prepareGridLayout(unpreparedGridLayout);

        setPreparedGridLayout(unpreparedGridLayout);
      }
    }
  }, [getGridLayout, lookups, customParam, layout, prepareGridLayout]);

  useEffect(() => {
    if (
      t &&
      displayName &&
      addAllowed &&
      viewAllowed &&
      editAllowed &&
      printAllowed &&
      dropAllowed &&
      customFunctionAllowed &&
      add &&
      view &&
      edit &&
      customEdit &&
      print &&
      remove
    ) {
      setRenderGrid(true);
    }
  }, [
    t,
    displayName,
    addAllowed,
    viewAllowed,
    editAllowed,
    printAllowed,
    dropAllowed,
    customFunctionAllowed,
    add,
    view,
    edit,
    customEdit,
    print,
    remove,
  ]);

  useEffect(() => {
    if (
      t &&
      displayName &&
      customFunctions &&
      addAllowed &&
      customFunctionAllowed
    ) {
      const items = [];

      if (addAllowed()) {
        items.push({
          id: 'none',
          text: t('datacontainer.actions.add', { entity: displayName }),
        });
      }

      items.push(
        ...customFunctions
          ?.filter((f) => f.type === 'add' && customFunctionAllowed(f))
          .map((f) => {
            return { id: f.id, text: f.text, customFunction: f };
          })
      );

      setAddMenuItems(items);
    }
  }, [t, displayName, customFunctions, addAllowed, customFunctionAllowed]);

  const smallColumnConfiguration = useMemo(
    () =>
      optionButtonAllowed && renderGrid && headParams && preparedGridLayout
        ? createColumnConfiguration<dxDataGridColumn>(
            t,
            preparedGridLayout.columns,
            lookups,
            headParams,
            'small',
            optionButtonClicked,
            optionButtonAllowed
          )
        : [],
    [
      renderGrid,
      t,
      preparedGridLayout,
      lookups,
      headParams,
      optionButtonAllowed,
      optionButtonClicked,
    ]
  );
  const mediumColumnConfiguration = useMemo(
    () =>
      optionButtonAllowed && renderGrid && headParams && preparedGridLayout
        ? createColumnConfiguration<dxDataGridColumn>(
            t,
            preparedGridLayout.columns,
            lookups,
            headParams,
            'medium',
            optionButtonClicked,
            optionButtonAllowed
          )
        : [],
    [
      renderGrid,
      t,
      preparedGridLayout,
      lookups,
      headParams,
      optionButtonAllowed,
      optionButtonClicked,
    ]
  );
  const largeColumnConfiguration = useMemo(
    () =>
      optionButtonAllowed && renderGrid && headParams && preparedGridLayout
        ? createColumnConfiguration<dxDataGridColumn>(
            t,
            preparedGridLayout.columns,
            lookups,
            headParams,
            'large',
            optionButtonClicked,
            optionButtonAllowed
          )
        : [],
    [
      renderGrid,
      t,
      preparedGridLayout,
      lookups,
      headParams,
      optionButtonAllowed,
      optionButtonClicked,
    ]
  );
  const summaryConfiguration = useMemo(
    () =>
      renderGrid && preparedGridLayout
        ? createSummaryConfiguration(preparedGridLayout)
        : null,
    [renderGrid, preparedGridLayout]
  );

  const headCustomFunctions = useMemo(
    () =>
      renderGrid && customFunctionAllowed
        ? customFunctions?.filter((f) => f.multi && customFunctionAllowed(f))
        : null,
    [renderGrid, customFunctions, customFunctionAllowed]
  );

  const dataSource = useMemo(
    () =>
      fetchedItems && save
        ? createEditableGridDatasource(fetchedItems, save)
        : undefined,
    [fetchedItems, save]
  );

  return (
    <Media
      queries={{
        small: { maxWidth: 599 },
        medium: { maxWidth: 1000 },
        large: { minWidth: 1001 },
      }}
    >
      {(matches) => (
        <React.Fragment>
          {renderGrid &&
          load &&
          preparedGridLayout &&
          summaryConfiguration &&
          dataSource /* && !matches.small*/ && (
              <DataGrid
                customFunctions={headCustomFunctions ?? []}
                showReload={true}
                showAdd={(addMenuItems && addMenuItems?.length > 0) ?? false}
                showPrint={true}
                onReloadClick={() => load(fetchParams)}
                onCustomFunctionClick={customFunctionButtonClicked}
                onAddClick={addButtonClicked}
                onPrintClick={printButtonClicked}
                onRowDblClick={onRowDblClick}
                exportFileName={`${displayName}_${moment().format('YYYYMMDD')}`}
                layout={preparedGridLayout}
                summary={summaryConfiguration}
                mode={
                  matches.small ? 'small' : matches.medium ? 'medium' : 'large'
                }
                height={height ?? 'calc(100vh - 140px)'}
                dataSource={dataSource}
                columns={
                  matches.small
                    ? smallColumnConfiguration
                    : matches.medium
                    ? mediumColumnConfiguration
                    : largeColumnConfiguration
                }
              />
            )}
          {/*(renderGrid && matches.small) && <DataList
        height={height ?? 'calc(100vh - 140px)'}
        layout={preparedGridLayout}
        dataSource={dataSource}
        showReload={true}
        showAdd={addAllowed()}
        showPrint={true}
        customFunctions={customFunctions}
        onReloadClick={() => load()}
        onCustomFunctionClick={customFunctionButtonClicked}
        onAddClick={addButtonClicked}
        onPrintClick={printButtonClicked}
        onRowDblClick={onRowDblClick}
        />*/}
          <ActionSheet
            ref={actionMenu}
            width={'auto'}
            title={t('datacontainer.actionsheet.title')}
            usePopover={!matches.small}
            showCancelButton
            onItemClick={actionItemClicked}
          />
          {documents && (
            <ActionSheet
              width={'auto'}
              title={t('datacontainer.actions.print')}
              usePopover={!matches.small}
              ref={printMenu}
              dataSource={documents}
              onItemClick={printMenuItemClicked}
            />
          )}
          {displayName && (
            <ActionSheet
              ref={addMenu}
              width={'auto'}
              title={t('datacontainer.actions.add', { entity: displayName })}
              showCancelButton
              usePopover={!matches.small}
              onItemClick={addMenuItemClicked}
            />
          )}
        </React.Fragment>
      )}
    </Media>
  );
};
