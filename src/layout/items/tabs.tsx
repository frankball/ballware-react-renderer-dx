import React, { useContext, useMemo } from 'react';
import {
  PageLayoutItem,
  QueryParams,
  TabItemOptions,
} from '@ballware/meta-interface';
import { Container } from '../container';
import { TabPanel, Item as TabItem } from 'devextreme-react/tab-panel';
import { RenderFactoryContext } from '@ballware/react-renderer';

export interface LayoutTabProps {
  layoutItem: PageLayoutItem;
  params?: QueryParams;
}

export const LayoutTabs = ({ layoutItem, params }: LayoutTabProps) => {
  const { PageLayoutItem } = useContext(RenderFactoryContext);

  let tabscount = 1;
  let key = 1;

  const tabItems = useMemo(
    () =>
      layoutItem.items?.map((tab) => (
        <TabItem
          key={`tab-${tabscount++}`}
          title={(tab.options?.itemoptions as TabItemOptions)?.caption}
        >
          <Container height={layoutItem.options?.height}>
            {PageLayoutItem &&
              tab.items &&
              tab.items.map((item) => (
                <PageLayoutItem
                  key={key++}
                  colCount={tab.colCount}
                  layoutItem={item}
                  params={params}
                />
              ))}
          </Container>
        </TabItem>
      )),
    [PageLayoutItem, layoutItem, key, params, tabscount]
  );

  return (
    <TabPanel
      height={layoutItem.options?.height}
      deferRendering={false}
      showNavButtons
      swipeEnabled={false}
    >
      {tabItems}
    </TabPanel>
  );
};
