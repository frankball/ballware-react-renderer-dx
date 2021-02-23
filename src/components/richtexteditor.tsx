import React, { useState, forwardRef, useImperativeHandle } from 'react';

import { HtmlEditor } from './htmleditor';

export interface RichTextEditorProps {
  readonly: boolean;
  required: boolean;
  defaultValue: string;
  valueChanged: (value: string) => void;
  height: string;
}

export interface RichTextEditorRef {
  getValue: () => string;
  setValue: (value: string) => void;
}

export const RichTextEditor = forwardRef<
  RichTextEditorRef,
  RichTextEditorProps
>(({ readonly, required, defaultValue, valueChanged, height }, ref) => {
  const [value, setValue] = useState(defaultValue);

  useImperativeHandle(ref, () => ({
    getValue: () => {
      return value;
    },
    setValue: (newValue) => {
      setValue(newValue);
    },
  }));

  return (
    <HtmlEditor
      readOnly={readonly}
      required={required}
      width={'100%'}
      height={height ?? '200px'}
      defaultValue={value}
      onChange={(value) => {
        valueChanged(value);
      }}
    />
  );
});
