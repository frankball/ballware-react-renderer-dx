import React from 'react';

import { Item } from './item';

import { Grid } from '@material-ui/core';

export interface ContainerProps {
  embedded?: boolean;
  colCount?: number;
  colSpan?: number;
  height?: string;
  children?: JSX.Element | Array<JSX.Element>;
}

export const Container = ({
  embedded,
  colSpan,
  colCount,
  height,
  children,
}: ContainerProps) => {
  const grid = (
    <Grid container spacing={1} style={height ? { height: height } : undefined}>
      {children}
    </Grid>
  );

  if (embedded) {
    return (
      <Item colCount={colCount} colSpan={colSpan}>
        {grid}
      </Item>
    );
  }

  return grid;
};
