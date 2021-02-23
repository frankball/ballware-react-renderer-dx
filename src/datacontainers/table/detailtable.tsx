import React, {
  useImperativeHandle,
  forwardRef,
  useContext,
  useState,
} from 'react';

import {
  EditLayoutItemOptions,
  GridLayoutColumn,
} from '@ballware/meta-interface';
import {
  TableContainer,
  Paper,
  makeStyles,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@material-ui/core';
import {
  setByPath,
  EditItemsContext,
  EditItemsProvider,
} from '@ballware/react-renderer';
import { TableColumn } from './tablecolumns';

export interface DetailTableRef {
  getValue: () => Array<Record<string, unknown>>;
  setValue: (value: Array<Record<string, unknown>>) => void;
}

export interface DetailTableItemOptions {
  add?: boolean;
  update?: boolean;
  delete?: boolean;
  columns: Array<GridLayoutColumn>;
}

export interface DetailTableProps {
  readonly: boolean;
  defaultValue: Array<Record<string, unknown>>;
  setValue: (value: Array<Record<string, unknown>>) => void;
  layoutItem: EditLayoutItemOptions;
}

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
});

export const DetailTable = forwardRef<DetailTableRef, DetailTableProps>(
  ({ readonly, defaultValue, setValue, layoutItem }, ref): JSX.Element => {
    const classes = useStyles();

    const { EditProvider } = useContext(EditItemsContext);

    const [rows, setRows] = useState(defaultValue ?? []);

    useImperativeHandle(ref, () => ({
      getValue: () => {
        return rows;
      },
      setValue: (newValue) => {
        setRows(newValue ?? []);
        setValue(newValue);
      },
    }));

    const options = layoutItem.itemoptions as DetailTableItemOptions;

    let rowKey = 1;

    return (
      <TableContainer component={Paper}>
        <Table className={classes.table} size={'small'}>
          <TableHead>
            <TableRow>
              {options?.columns?.map((column) => (
                <TableCell key={column.dataMember}>{column.caption}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <React.Fragment>
                {EditProvider && (
                  <EditProvider item={row} editLayout={undefined}>
                    <EditItemsProvider>
                      <TableRow key={rowKey++}>
                        {options?.columns?.map((column) => (
                          <TableCell key={column.dataMember}>
                            <TableColumn
                              readonly={readonly}
                              data={row}
                              column={column}
                              setValue={(value) =>
                                column.dataMember &&
                                setByPath(row, column.dataMember, value)
                              }
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    </EditItemsProvider>
                  </EditProvider>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }
);
