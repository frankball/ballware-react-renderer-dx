import React, { useContext } from 'react';
import { GridLayoutColumn } from '@ballware/meta-interface';
import { getByPath, EditItemsContext } from '@ballware/react-renderer';

import { RenderFactoryContext } from '@ballware/react-renderer';

export type OptionButtons =
  | 'add'
  | 'edit'
  | 'view'
  | 'delete'
  | 'print'
  | 'options'
  | 'customoptions';

export interface TableColumnProps {
  readonly: boolean;
  setValue: (value: any) => void;
  column: GridLayoutColumn;
  data: Record<string, unknown>;
}

export const TableColumn = ({
  readonly,
  setValue,
  column,
  data,
}: TableColumnProps) => {
  const { readOnly, detailGridCellPreparing, EditProvider } = useContext(
    EditItemsContext
  );
  const { Editor, DetailEditPopup } = useContext(RenderFactoryContext);

  const onValueChanged = (args: { value: any }) => {
    if (setValue) {
      setValue(args.value);
    }
  };

  if (
    detailGridCellPreparing &&
    readOnly &&
    EditProvider &&
    Editor &&
    DetailEditPopup &&
    column.dataMember
  ) {
    detailGridCellPreparing(column.dataMember, data, column);

    const dataMember = column.dataMember;

    column.readonly =
      readonly || readOnly() || !(column.editable ?? false) || column.readonly;

    switch (column.type) {
      case 'popup':
        return (
          <EditProvider
            item={getByPath(data, dataMember) as Record<string, unknown>}
            editLayout={undefined}
          >
            <DetailEditPopup
              readonly={column.readonly ?? false}
              column={column}
              applyChanges={onValueChanged}
            />
          </EditProvider>
        );
      default:
        return <Editor type={column.type} options={column} />;
    }
  } else {
    return <React.Fragment></React.Fragment>;
  }
};
