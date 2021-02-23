import React, {
  useEffect,
  useMemo,
  useRef,
  useContext,
  useCallback,
} from 'react';

import { ActionSheet } from 'devextreme-react/action-sheet';

import { EntityCustomFunction, CrudItem } from '@ballware/meta-interface';

import Media from 'react-media';
import {
  MetaContext,
  CrudContext,
  SettingsContext,
} from '@ballware/react-contexts';
import { getByPath } from '@ballware/react-renderer';
import Map from 'devextreme-react/map';
import { SpeedDialAction } from 'devextreme-react/speed-dial-action';
import { dxElement } from 'devextreme/core/element';
import { useTranslation } from 'react-i18next';

export interface EntityMapProps {
  height?: string;
  editLayout: string;
  locationMember: string;
  displayMember: string;
}

export const EntityMap = ({
  locationMember,
  displayMember,
  editLayout,
  height,
}: EntityMapProps) => {
  const { t } = useTranslation();

  const selectedRowKeys = useRef<Array<string>>();
  const selectedRowData = useRef<Array<CrudItem>>();

  const mapRef = useRef<Map>(null);

  const { googlekey } = useContext(SettingsContext);
  const {
    displayName,
    customFunctions,
    print,
    documents,
    addAllowed,
    viewAllowed,
    editAllowed,
    dropAllowed,
    printAllowed,
    customFunctionAllowed,
  } = useContext(MetaContext);
  const { add, view, edit, remove, customEdit, fetchedItems } = useContext(
    CrudContext
  );

  const actionMenu = useRef<ActionSheet>(null);
  const printMenu = useRef<ActionSheet>(null);
  const addMenu = useRef<ActionSheet>(null);
  const addButton = useRef<SpeedDialAction>(null);
  const mouseTarget = useRef<Element | null>(null);

  const viewExecute = useCallback(
    (row: CrudItem, _target: Element) => {
      if (view && editLayout) {
        view(row.Id, editLayout);
      }
    },
    [view, editLayout]
  );

  const editExecute = useCallback(
    (row: CrudItem, _target: Element) => {
      if (edit && editLayout) {
        edit(row.Id, editLayout);
      }
    },
    [edit, editLayout]
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
      selectedRowKeys.current = [row.Id];
      selectedRowData.current = [row];
      printMenu.current?.instance.option('target', target);
      printMenu.current?.instance.option('visible', true);
    },
    [printMenu]
  );

  const printMenuItemClicked = useCallback(
    (e: { itemData?: { id: string; text: string } }) => {
      if (
        e.itemData &&
        print &&
        selectedRowKeys.current &&
        selectedRowKeys.current?.length > 0
      ) {
        const item = e.itemData;

        print(item.id, selectedRowKeys.current);
      }
    },
    [print, selectedRowKeys]
  );

  const actionMenuExecute = useCallback(
    (row: CrudItem, target: Element) => {
      const actions = [];

      if (t && actionMenu.current) {
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

        if (customFunctionAllowed) {
          const additionalFunctions = customFunctions
            ?.filter((f) => f.type === 'edit' && customFunctionAllowed(f, row))
            .map((f) =>
              Object.assign({}, f, { row: row, originalTarget: target })
            );

          additionalFunctions?.forEach((f) => actions.push(f));
        }

        actionMenu.current.instance.option(
          'title',
          getByPath(row, displayMember)
        );
        actionMenu.current.instance.option('dataSource', actions);
        actionMenu.current.instance.option('target', target);
        actionMenu.current.instance.option('visible', true);
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
      displayMember,
      customFunctions,
      actionMenu,
    ]
  );

  const actionItemClicked = useCallback(
    (e: {
      itemData?: EntityCustomFunction & {
        row: CrudItem;
        originalTarget: Element;
      };
    }) => {
      if (e.itemData) {
        switch (e.itemData?.id) {
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

  useEffect(() => {
    if (
      t &&
      displayName &&
      addMenu.current?.instance &&
      addAllowed &&
      customFunctionAllowed
    ) {
      const addMenuItems: Array<{
        id: string;
        text: string;
        customFunction?: EntityCustomFunction;
      }> = [];

      if (addAllowed()) {
        addMenuItems.push({
          id: 'none',
          text: t('datacontainer.actions.add', { entity: displayName }),
        });
      }

      if (customFunctions) {
        addMenuItems.push(
          ...customFunctions
            ?.filter((f) => f.type === 'add' && customFunctionAllowed(f))
            .map((f) => {
              return { id: f.id, text: f.text, customFunction: f };
            })
        );
      }

      addMenu.current.instance.option('dataSource', addMenuItems);
    }
  }, [
    t,
    displayName,
    customFunctions,
    addMenu,
    addAllowed,
    customFunctionAllowed,
  ]);

  useEffect(() => {
    if (addButton.current?.instance && addAllowed) {
      addButton.current.instance.option('visible', addAllowed());
    }
  }, [addButton, addAllowed]);

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
          if (add) {
            add(editLayout);
          }
        } else {
          if (customEdit && item.customFunction) {
            customEdit(item.customFunction, undefined);
          }
        }
      }
    },
    [add, customEdit, editLayout]
  );

  const addButtonClicked = useCallback(
    (target?: Element) => {
      const addMenuItems = addMenu.current?.instance?.option('dataSource');

      if (addMenu.current && addMenuItems?.length > 1) {
        addMenu.current.instance.option('target', target);
        addMenu.current.instance.option('visible', true);
      } else if (addMenuItems?.length > 0) {
        addMenuItemClicked({ itemData: addMenuItems[0] });
      }
    },
    [addMenu, addMenuItemClicked]
  );

  const onMarkerClicked = useCallback(
    (item: CrudItem) => {
      if (mouseTarget.current) {
        actionMenuExecute(item, mouseTarget.current);
      }
    },
    [actionMenuExecute, mouseTarget]
  );

  const onMouseMove = useCallback((e: MouseEvent) => {
    mouseTarget.current = document.elementFromPoint(e.clientX, e.clientY);
  }, []);

  useEffect(() => {
    if (mapRef.current?.instance && fetchedItems) {
      const cleanupMarker = async () => {
        mapRef.current?.instance.option('markers', []);
      };

      const addMarkers = async (markers: Array<CrudItem>) => {
        for (const marker of markers) {
          await mapRef.current?.instance.addMarker({
            location: getByPath(marker, locationMember),
            onClick: () => onMarkerClicked(marker),
          });
        }
      };

      mapRef.current.instance.beginUpdate();
      cleanupMarker().then(() =>
        addMarkers(
          fetchedItems?.filter((item) => item.Latitude && item.Longitude)
        )
      );
    }
  }, [locationMember, onMarkerClicked, mapRef, fetchedItems]);

  const onMapReady = useCallback(
    (e: { element?: dxElement }) => {
      e.element?.addEventListener('mousemove', onMouseMove);
    },
    [onMouseMove]
  );

  const WrappedMap = useMemo(() => {
    return (
      <React.Fragment>
        {add && view && edit && remove && customEdit && googlekey && (
          <Map
            ref={mapRef}
            onReady={onMapReady}
            height={height ?? '100%'}
            width={'100%'}
            autoAdjust
            provider={'google'}
            type={'hybrid'}
            apiKey={{ google: googlekey }}
            defaultZoom={30}
            controls
            onInitialized={(e) =>
              e.element?.addEventListener('mousemove', onMouseMove)
            }
          ></Map>
        )}
      </React.Fragment>
    );
  }, [
    onMapReady,
    onMouseMove,
    height,
    add,
    view,
    edit,
    remove,
    customEdit,
    googlekey,
  ]);

  return (
    <Media
      queries={{
        small: { maxWidth: 599 },
        medium: { maxWidth: 1000 },
        large: { minWidth: 1001 },
      }}
    >
      {(matches) => (
        <div style={{ height: height ?? '100%' }}>
          {WrappedMap}
          {t && displayName && false && (
            <SpeedDialAction
              icon="bi bi-plus"
              label={t('datacontainer.actions.add', { entity: displayName })}
              index={1}
              onClick={(e) => addButtonClicked(e.element)}
            />
          )}
          <ActionSheet
            ref={actionMenu}
            usePopover={!matches.small}
            showCancelButton
            onItemClick={actionItemClicked}
          />
          {t && documents && (
            <ActionSheet
              title={t('datacontainer.actions.print')}
              usePopover={!matches.small}
              ref={printMenu}
              dataSource={documents}
              onItemClick={printMenuItemClicked}
            />
          )}
          {t && displayName && (
            <ActionSheet
              ref={addMenu}
              width={'auto'}
              title={t('datacontainer.actions.add', { entity: displayName })}
              showCancelButton
              usePopover={!matches.small}
              onItemClick={addMenuItemClicked}
            />
          )}
        </div>
      )}
    </Media>
  );
};
