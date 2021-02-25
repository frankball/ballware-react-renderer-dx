import {
  EditLayoutItem,
  EditLayoutItemOptions,
  EntityGridOptions,
  EntityMapOptions,
  PageLayoutItem,
  PageToolbarItem,
  QueryParams,
  StatisticOptions,
} from '@ballware/meta-interface';
import React, { useState, useEffect, PropsWithChildren } from 'react';
import {
  RenderFactoryContext,
  RenderFactoryContextState,
} from '@ballware/react-renderer';
import { Page } from './layout/page';
import { Notification } from './layout/notification';

import { Tabs } from './editing/items/tabs';

import { AttachmentGrid } from './editing/items/attachmentgrid';
import { CodeEditor } from './editing/items/codeeditor';
import { CheckBox } from './editing/items/checkbox';
import { DateBox } from './editing/items/datebox';
import { DetailGrid } from './editing/items/detailgrid';
import { DetailTable } from './editing/items/detailtable';
import { EditableEntityGrid } from './editing/items/editableentitygrid';
import { DetailTree } from './editing/items/detailtree';
import { LookupBox } from './editing/items/lookupbox';
import { Map } from './editing/items/map';
import { Button } from './editing/items/button';
import { TextBox } from './editing/items/textbox';
import { Container } from './layout/container';
import { NumberBox } from './editing/items/numberbox';
import { TextArea } from './editing/items/textarea';
import { RichTextBox } from './editing/items/richtextbox';
import { StaticLookupBox } from './editing/items/staticlookupbox';
import { MultiLookupBox } from './editing/items/multilookupbox';
import { StaticMultiLookupBox } from './editing/items/staticmultilookupbox';
import { MultiValueBox } from './editing/items/multivaluebox';
import { SummaryList } from './editing/items/summarylist';
import { Item } from './layout/item';
import { Context } from './components/context';
import { ApplicationBar } from './layout/applicationbar';
import { Navigation } from './layout/navigation';
import { Routes } from './layout/routes';
import { PrivateRoute } from './layout/privateroute';
import { Application } from './layout/application';
import { LayoutTabs } from './layout/items/tabs';
import { CrudContainer } from '@ballware/react-renderer';
import { Statistic } from './layout/items/statistic';
import { EntityGrid } from './datacontainers/grid/entitygrid';
import { EntityMap } from './datacontainers/map/entitymap';
import { EditPopup } from './editing/editpopup';
import { DeletePopup } from './editing/deletepopup';
import { DetailEditPopup } from './editing/detaileditpopup';
import { ForeignEditPopup } from './editing/foreigneditpopup';
import { ButtonToolbarItem } from './layout/toolbaritems/button';
import { DropDownButtonToolbarItem } from './layout/toolbaritems/dropdownbutton';
import { StaticLookupToolbarItem } from './layout/toolbaritems/staticlookup';
import { DatetimeToolbarItem } from './layout/toolbaritems/datetime';
import { MultiLookupToolbarItem } from './layout/toolbaritems/multilookup';
import { LookupToolbarItem } from './layout/toolbaritems/lookup';
import { FilterBar } from './layout/filterbar';
import { ExternalLinkEditPopup } from './editing/externallinkeditpopup';

export interface DevExtremeRenderFactoryProps {}

const PageLayoutComponent = ({
  layoutItem,
  colCount,
  params,
}: {
  layoutItem: PageLayoutItem;
  colCount?: number;
  params?: QueryParams;
}) => {
  let key = 1;

  switch (layoutItem.type) {
    case 'tabs':
      return (
        <Item key={key++} colCount={colCount} colSpan={layoutItem.colSpan}>
          <LayoutTabs layoutItem={layoutItem} params={params} />
        </Item>
      );
    case 'crudcontainer':
      return (
        <Item key={key++} colCount={colCount} colSpan={layoutItem.colSpan}>
          <CrudContainer layoutItem={layoutItem} params={params} />
        </Item>
      );
    case 'statistic':
      return (
        <Item key={key++} colCount={colCount} colSpan={layoutItem.colSpan}>
          <Statistic
            identifier={
              (layoutItem.options?.itemoptions as StatisticOptions)?.statistic
            }
            params={params as Record<string, unknown>}
          />
        </Item>
      );
    case 'grid':
      return (
        <Item key={key++} colCount={colCount} colSpan={layoutItem.colSpan}>
          <EntityGrid
            height={
              (layoutItem.options?.itemoptions as EntityGridOptions)?.height
            }
            layout={
              (layoutItem.options?.itemoptions as EntityGridOptions)?.layout ??
              'primary'
            }
          />
        </Item>
      );
    case 'map':
      return (
        <Item key={key++} colCount={colCount} colSpan={layoutItem.colSpan}>
          <EntityMap
            height={
              (layoutItem.options?.itemoptions as EntityMapOptions)?.height
            }
            editLayout={
              (layoutItem.options?.itemoptions as EntityMapOptions)
                ?.editLayout ?? 'primary'
            }
            locationMember={
              (layoutItem.options?.itemoptions as EntityMapOptions)
                ?.locationMember
            }
            displayMember={
              (layoutItem.options?.itemoptions as EntityMapOptions)
                ?.displayMember
            }
          />
        </Item>
      );
    case 'entitygrid':
      console.warn(
        `Usage of deprecated layout item type 'entitygrid'. Instead use 'crudcontainer' with nested 'grid'`
      );
      return (
        <Item key={key++} colCount={colCount} colSpan={layoutItem.colSpan}>
          <CrudContainer layoutItem={layoutItem} params={params}>
            <EntityGrid
              height={
                (layoutItem.options?.itemoptions as EntityGridOptions)?.height
              }
              layout={
                (layoutItem.options?.itemoptions as EntityGridOptions)
                  ?.layout ?? 'primary'
              }
            />
          </CrudContainer>
        </Item>
      );
    default:
      console.error(`Unknown PageLayoutItem type ${layoutItem.type}`);
      return <React.Fragment></React.Fragment>;
  }
};

const PageToolbarComponent = ({ item }: { item: PageToolbarItem }) => {
  switch (item.type) {
    case 'lookup':
      return <LookupToolbarItem toolbarItem={item} />;
    case 'multilookup':
      return <MultiLookupToolbarItem toolbarItem={item} />;
    case 'datetime':
      return <DatetimeToolbarItem toolbarItem={item} />;
    case 'staticlookup':
      return <StaticLookupToolbarItem toolbarItem={item} />;
    case 'dropdownbutton':
      return <DropDownButtonToolbarItem toolbarItem={item} />;
    case 'button':
      return <ButtonToolbarItem toolbarItem={item} />;
    default:
      console.error(`Unknown PageToolbarItem type ${item.type}`);
      return <React.Fragment></React.Fragment>;
  }
};

const EditLayoutComponent = ({
  layoutItem,
  colCount,
}: {
  layoutItem: EditLayoutItem;
  colCount?: number;
}) => {
  let key = 1;

  switch (layoutItem.type) {
    case 'group':
      return (
        <Item key={key++} colCount={colCount} colSpan={layoutItem.colSpan}>
          <div className="dx-fieldset">
            <div className="dx-fieldset-header">
              {layoutItem.options?.caption}
            </div>
            <Container>
              {layoutItem.items &&
                layoutItem.items.map((item) => (
                  <Item
                    key={key++}
                    colCount={layoutItem.colCount}
                    colSpan={item.colSpan}
                  >
                    <EditLayoutComponent layoutItem={item} />
                  </Item>
                ))}
            </Container>
          </div>
        </Item>
      );
    case 'tabs':
      return (
        <Item key={key++} colCount={colCount} colSpan={layoutItem.colSpan}>
          <Tabs layoutItem={layoutItem} />
        </Item>
      );
    case 'summary':
      return (
        <Item key={key++} colCount={colCount} colSpan={layoutItem.colSpan}>
          <SummaryList layoutItem={layoutItem} />
        </Item>
      );
    default:
      return (
        <Item key={key++} colCount={colCount} colSpan={layoutItem.colSpan}>
          <EditorComponent
            type={layoutItem.type}
            options={layoutItem.options ?? {}}
          />
        </Item>
      );
  }
};

const EditorComponent = ({
  type,
  options,
}: {
  type: string;
  options: EditLayoutItemOptions;
}) => {
  switch (type) {
    case 'text':
      return <TextBox layoutItem={options} type={'text'} />;
    case 'textarea':
      return <TextArea layoutItem={options} />;
    case 'mail':
      return <TextBox layoutItem={options} type={'mail'} />;
    case 'number':
      return <NumberBox layoutItem={options} />;
    case 'date':
      return <DateBox layoutItem={options} type={'date'} />;
    case 'datetime':
      return <DateBox layoutItem={options} type={'datetime'} />;
    case 'bool':
      return <CheckBox layoutItem={options} />;
    case 'lookup':
    case 'pickvalue':
      return <LookupBox layoutItem={options} />;
    case 'staticlookup':
      return <StaticLookupBox layoutItem={options} />;
    case 'multilookup':
      return <MultiLookupBox layoutItem={options} />;
    case 'staticmultilookup':
      return <StaticMultiLookupBox layoutItem={options} />;
    case 'multivalue':
      return <MultiValueBox layoutItem={options} />;
    case 'map':
      return <Map layoutItem={options} />;
    case 'json':
      return <CodeEditor layoutItem={options} dialect={'json'} />;
    case 'javascript':
      return <CodeEditor layoutItem={options} dialect={'javascript'} />;
    case 'sql':
      return <CodeEditor layoutItem={options} dialect={'sql'} />;
    case 'richtext':
      return <RichTextBox layoutItem={options} />;
    case 'detailgrid':
      return <DetailGrid layoutItem={options} />;
    case 'detailtable':
      return <DetailTable layoutItem={options} />;
    case 'detailtree':
      return <DetailTree layoutItem={options} />;
    case 'entitygrid':
      return <EditableEntityGrid layoutItem={options} />;
    case 'attachements':
      return <AttachmentGrid layoutItem={options} />;
    case 'button':
      return <Button layoutItem={options} />;
    case 'empty':
      return <React.Fragment></React.Fragment>;
    default:
      console.error(`Unknown EditLayoutItem type ${type}`);
      return <React.Fragment></React.Fragment>;
  }
};

export const DxRenderFactoryProvider = ({
  children,
}: PropsWithChildren<DevExtremeRenderFactoryProps>) => {
  const [value, setValue] = useState<RenderFactoryContextState>({});

  useEffect(() => {
    setValue((previousValue) => {
      return {
        ...previousValue,
        Context: ({ children }) => <Context>{children}</Context>,
        Application: (props) => <Application {...props} />,
        ApplicationBar: (props) => <ApplicationBar {...props} />,
        Navigation: (props) => <Navigation {...props} />,
        PrivateRoute: (props) => <PrivateRoute {...props} />,
        Routes: (props) => <Routes {...props} />,
        Notification: () => <Notification />,
        Page: () => <Page />,
        PageToolbar: (props) => <FilterBar {...props} />,
        PageLayoutItem: (props) => <PageLayoutComponent {...props} />,
        EditLayoutItem: (props) => <EditLayoutComponent {...props} />,
        PageToolbarItem: (props) => <PageToolbarComponent {...props} />,
        Editor: (props) => <EditorComponent {...props} />,
        EditPopup: (props) => <EditPopup {...props} />,
        DeletePopup: (props) => <DeletePopup {...props} />,
        ForeignEditPopup: (props) => <ForeignEditPopup {...props} />,
        DetailEditPopup: (props) => <DetailEditPopup {...props} />,
        IframePopup: (props) => <ExternalLinkEditPopup {...props} />,
      };
    });
  }, []);

  return (
    <RenderFactoryContext.Provider value={value}>
      {children}
    </RenderFactoryContext.Provider>
  );
};
