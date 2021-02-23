import React, { useContext, useMemo } from 'react';

import { DetailLayout, CrudItem } from '@ballware/meta-interface';
import ScrollView from 'devextreme-react/scroll-view';
import { EditModes } from '@ballware/react-contexts';
import { ProviderFactoryContext } from '@ballware/react-contexts';
import {
  RenderFactoryContext,
  EditItemsProvider,
} from '@ballware/react-renderer';
import { Container } from '../../layout/container';

export interface GridDetailProps {
  item: CrudItem;
  detailLayout?: DetailLayout;
}

export const GridDetail = ({ item, detailLayout }: GridDetailProps) => {
  const { EditProvider } = useContext(ProviderFactoryContext);
  const { EditLayoutItem } = useContext(RenderFactoryContext);

  const items = useMemo(() => {
    let key = 1;

    if (EditLayoutItem) {
      return detailLayout?.items?.map((item) => (
        <EditLayoutItem key={key++} layoutItem={item} />
      ));
    }

    return undefined;
  }, [detailLayout, EditLayoutItem]);

  return (
    <ScrollView>
      {item && detailLayout && EditProvider && EditLayoutItem && (
        <Container height={detailLayout.height}>
          <EditProvider
            mode={EditModes.EDIT}
            editLayout={undefined}
            item={item}
          >
            <EditItemsProvider>{items}</EditItemsProvider>
          </EditProvider>
        </Container>
      )}
    </ScrollView>
  );
};
