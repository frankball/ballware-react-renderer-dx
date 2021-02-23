import React, {
  forwardRef,
  useRef,
  useImperativeHandle,
  useState,
} from 'react';

import 'ace-builds';
import 'ace-builds/webpack-resolver';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/mode-json5';
import 'ace-builds/src-noconflict/mode-sqlserver';
import 'ace-builds/src-noconflict/theme-github';
import beautify from 'ace-builds/src-noconflict/ext-beautify';
import AceEditor from 'react-ace';

export interface AceEditorRef {
  getValue: () => string;
  setValue: (value: string) => void;
}

export interface AceEditorProps {
  mode: 'javascript' | 'json5' | 'sqlserver';
  readOnly?: boolean;
  defaultValue?: string;
  width?: string;
  height?: string;
  onChange?: (value?: string) => void;
}

export const BeautifiedAceEditor = forwardRef<AceEditorRef, AceEditorProps>(
  ({ mode, readOnly, defaultValue, width, height, onChange }, ref) => {
    const [value, setValue] = useState(defaultValue);

    const editorRef = useRef<AceEditor | null>();

    useImperativeHandle(
      ref,
      () =>
        ({
          getValue: () => {
            return value;
          },
          setValue: (newValue) => {
            setValue(newValue);
          },
        } as AceEditorRef)
    );

    let currentValue = defaultValue;

    const onBlur = () => {
      if (currentValue !== defaultValue && onChange) {
        onChange(currentValue);
      }
    };

    return (
      <AceEditor
        ref={(ref) => {
          editorRef.current = ref;
          if (ref) beautify.beautify(ref?.editor.session);
        }}
        readOnly={readOnly}
        width={width}
        height={height}
        mode={mode}
        theme={'github'}
        defaultValue={defaultValue}
        onBlur={onBlur}
        focus={!readOnly}
        onChange={(value: string) => (currentValue = value)}
        setOptions={{ useWorker: true }}
      />
    );
  }
);
