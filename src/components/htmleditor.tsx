import React, { useMemo } from 'react';

import {
  HtmlEditor as DxHtmlEditor,
  Toolbar,
  Item,
} from 'devextreme-react/html-editor';
import Validator, { RequiredRule } from 'devextreme-react/validator';

export const HtmlEditor = ({
  readOnly,
  required,
  defaultValue,
  width,
  height,
  onChange,
}: {
  readOnly?: boolean;
  required?: boolean;
  defaultValue?: string;
  width?: string;
  height?: string;
  onChange?: (value: string) => void;
}) => {
  const MemorizedEditor = useMemo(
    () => (
      <DxHtmlEditor
        valueType={'html'}
        defaultValue={defaultValue}
        height={height}
        width={width}
        readOnly={readOnly}
        onValueChanged={(e) => onChange && onChange(e.value)}
      >
        {!readOnly && (
          <Toolbar multiline={false}>
            <Item formatName="undo" />
            <Item formatName="redo" />
            <Item formatName="separator" />
            <Item formatName="header" formatValues={[false, 1, 2, 3, 4, 5]} />
            <Item formatName="separator" />
            <Item formatName="bold" />
            <Item formatName="italic" />
            <Item formatName="strike" />
            <Item formatName="underline" />
            <Item formatName="separator" />
            <Item formatName="alignLeft" />
            <Item formatName="alignCenter" />
            <Item formatName="alignRight" />
            <Item formatName="alignJustify" />
            <Item formatName="separator" />
            <Item formatName="orderedList" />
            <Item formatName="bulletList" />
            <Item formatName="separator" />
            <Item formatName="color" />
            <Item formatName="background" />
            <Item formatName="separator" />
            <Item formatName="clear" />
          </Toolbar>
        )}
        <Validator>{required && <RequiredRule />}</Validator>
      </DxHtmlEditor>
    ),
    [readOnly, width, height, defaultValue, required, onChange]
  );

  return MemorizedEditor;
};
