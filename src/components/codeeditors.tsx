import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
} from 'react';

import JSON5 from 'json5';
import { BeautifiedAceEditor, AceEditorRef } from './ace';

export interface CodeEditorRef {
  getValue: () => string;
  setValue: (value: string) => void;
}

export interface CodeEditorProps {
  readOnly?: boolean;
  setValue?: (value?: string) => void;
  defaultValue: string | object;
  height: string;
}

export const JsonEditor = forwardRef<CodeEditorRef, CodeEditorProps>(
  ({ readOnly, setValue, defaultValue, height }, ref) => {
    const editorRef = useRef<AceEditorRef>(null);

    useImperativeHandle(ref, () => ({
      getValue: () => {
        return editorRef.current?.getValue() ?? '';
      },
      setValue: (newValue) => {
        editorRef.current?.setValue(newValue);
      },
    }));

    const onValueChanged = useCallback(
      (value?: string) => {
        if (typeof defaultValue === 'string') {
          if (setValue) {
            setValue(value);
          }
        } else {
          try {
            if (setValue) {
              setValue(value && JSON5.parse(value));
            }
          } catch {
            console.error('No valid json value');
          }
        }
      },
      [setValue, defaultValue]
    );

    let initialValue: string = '';

    try {
      initialValue = JSON5.stringify(
        typeof defaultValue === 'string'
          ? JSON5.parse(defaultValue as string)
          : defaultValue,
        null,
        '\t'
      );
    } catch {}

    return (
      <BeautifiedAceEditor
        ref={editorRef}
        readOnly={readOnly}
        width={'100%'}
        height={height ?? '200px'}
        mode={'json5'}
        defaultValue={initialValue}
        onChange={onValueChanged}
      />
    );
  }
);

export const JavascriptEditor = forwardRef<CodeEditorRef, CodeEditorProps>(
  ({ readOnly, defaultValue, setValue, height }, ref) => {
    const editorRef = useRef<AceEditorRef>(null);

    useImperativeHandle(ref, () => ({
      getValue: () => {
        return editorRef.current?.getValue() ?? '';
      },
      setValue: (newValue) => {
        editorRef.current?.setValue(newValue);
      },
    }));

    return (
      <BeautifiedAceEditor
        ref={editorRef}
        readOnly={readOnly}
        width={'100%'}
        height={height ?? '200px'}
        mode={'javascript'}
        defaultValue={defaultValue as string}
        onChange={(value) => setValue && setValue(value)}
      />
    );
  }
);

export const SqlEditor = forwardRef<CodeEditorRef, CodeEditorProps>(
  ({ readOnly, defaultValue, setValue, height }, ref) => {
    const editorRef = useRef<AceEditorRef>(null);

    useImperativeHandle(ref, () => ({
      getValue: () => {
        return editorRef.current?.getValue() ?? '';
      },
      setValue: (newValue) => {
        editorRef.current?.setValue(newValue);
      },
    }));

    return (
      <BeautifiedAceEditor
        ref={editorRef}
        readOnly={readOnly}
        width={'100%'}
        height={height ?? '200px'}
        mode={'sqlserver'}
        defaultValue={defaultValue as string}
        onChange={(value) => setValue && setValue(value)}
      />
    );
  }
);
