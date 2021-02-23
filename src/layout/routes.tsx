import React, { PropsWithChildren, useContext, useMemo } from 'react';
import { Switch, Redirect } from 'react-router-dom';

import {
  ProviderFactoryContext,
  ResourceOwnerRightsContext,
  TenantContext,
} from '@ballware/react-contexts';

import { PrivateRoute } from './privateroute';

import { RenderFactoryContext } from '@ballware/react-renderer';

export interface RoutesProps {}

export const Routes = ({ children }: PropsWithChildren<RoutesProps>) => {
  const { rights } = useContext(ResourceOwnerRightsContext);
  const { navigation, pages, pageAllowed } = useContext(TenantContext);
  const { Page } = useContext(RenderFactoryContext);
  const { LookupProvider, PageProvider } = useContext(ProviderFactoryContext);

  return useMemo(() => {
    let pageKey = 1;

    const renderedPages = [] as Array<JSX.Element>;

    if (navigation?.defaultUrl) {
      renderedPages.push(
        <Redirect
          key={pageKey++}
          exact
          path="/"
          to={`/${navigation?.defaultUrl}`}
        />
      );
    }

    if (
      LookupProvider &&
      PageProvider &&
      rights &&
      pages &&
      pageAllowed &&
      Page
    ) {
      renderedPages.push(
        ...pages.map((p) => (
          <PrivateRoute
            key={pageKey++}
            path={`/${
              p.options.url?.toLowerCase() ?? 'unknown'
            }/:action(view|edit)?/:id?`}
            allowed={() => pageAllowed(p.options.page ?? 'unknown')}
            render={() => (
              <LookupProvider>
                <PageProvider identifier={p.options.page ?? 'unknown'}>
                  <Page />
                </PageProvider>
              </LookupProvider>
            )}
          />
        ))
      );
    }

    return (
      <Switch>
        {renderedPages}
        {children}
      </Switch>
    );
  }, [
    navigation,
    pages,
    pageAllowed,
    rights,
    LookupProvider,
    PageProvider,
    Page,
    children,
  ]);
};
