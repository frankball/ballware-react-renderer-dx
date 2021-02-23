import React from 'react';

import { Grid } from '@material-ui/core';

export interface ItemProps {
  colCount?: number;
  colSpan?: number;
  children: JSX.Element | Array<JSX.Element>;
}

export const Item = ({ colSpan, colCount, children }: ItemProps) => {
  const xsWidth = 12;
  const lgWidth = (((colSpan ?? 1) / (colCount ?? 1)) * 12) as
    | boolean
    | 'auto'
    | 1
    | 2
    | 3
    | 4
    | 5
    | 6
    | 7
    | 8
    | 9
    | 10
    | 11
    | 12;

  return (
    <Grid item xs={xsWidth} lg={lgWidth}>
      {children}
    </Grid>
  );
};
