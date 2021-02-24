import React, {
  useImperativeHandle,
  useEffect,
  useState,
  useContext,
  forwardRef,
} from 'react';
import cloneDeep from 'lodash/cloneDeep';

import { EditLayout, CrudItem } from '@ballware/meta-interface';

import { ValidationGroup } from 'devextreme-react/validation-group';
import { ValidationSummary } from 'devextreme-react/validation-summary';
import {
  MetaContext,
  NotificationContext,
  CrudContext,
  EditContext,
} from '@ballware/react-contexts';
import { EditItemsProvider } from '@ballware/react-renderer';
import { Container } from '../layout/container';
import { RenderFactoryContext } from '@ballware/react-renderer';

export interface EditFormRef {
  validate(): boolean;
  submit(): void;
}

export interface EditFormProps {
  functionIdentifier?: string;
  editLayout: EditLayout;
}

export const EditForm = forwardRef<EditFormRef, EditFormProps>(
  (
    { functionIdentifier, editLayout }: EditFormProps,
    ref: React.Ref<EditFormRef>
  ) => {
    const [preparedEditLayout, setPreparedEditLayout] = useState<EditLayout>();

    const { showWarning } = useContext(NotificationContext);
    const { prepareEditLayout, evaluateCustomFunction } = useContext(
      MetaContext
    );
    const { save, saveBatch } = useContext(CrudContext);
    const { item, mode } = useContext(EditContext);
    const { EditLayoutItem } = useContext(RenderFactoryContext);

    const validationGroupRef = React.useRef<ValidationGroup>(null);

    useImperativeHandle(
      ref,
      () =>
        ({
          validate: () => {
            const validationResult = validationGroupRef.current?.instance.validate();

            return validationResult?.isValid ?? false;
          },
          submit: () => {
            if (functionIdentifier && evaluateCustomFunction) {
              evaluateCustomFunction(
                functionIdentifier,
                item as Record<string, unknown>,
                (evaluatedItem) => {
                  if (Array.isArray(evaluatedItem)) {
                    if (saveBatch) {
                      saveBatch(evaluatedItem);
                    }
                  } else {
                    if (save) {
                      save(evaluatedItem as CrudItem);
                    }
                  }
                },
                (message) => {
                  if (showWarning) {
                    showWarning(message);
                  }
                }
              );
            } else {
              if (Array.isArray(item)) {
                if (saveBatch) {
                  saveBatch(item as Array<CrudItem>);
                }
              } else {
                if (save) {
                  save(item as CrudItem);
                }
              }
            }
          },
        } as EditFormRef),
      [
        validationGroupRef,
        save,
        saveBatch,
        showWarning,
        evaluateCustomFunction,
        functionIdentifier,
        item,
      ]
    );

    useEffect(() => {
      if (prepareEditLayout && editLayout && mode) {
        const unpreparedEditLayout = cloneDeep(editLayout);

        prepareEditLayout(mode, unpreparedEditLayout);

        setPreparedEditLayout(unpreparedEditLayout);
      }
    }, [prepareEditLayout, editLayout, mode]);

    let key = 1;

    return (
      <form>
        {preparedEditLayout && EditLayoutItem && (
          <EditItemsProvider>
            <ValidationGroup
              ref={validationGroupRef}
              onInitialized={(e) => e.component?.validate()}
            >
              <Container>
                {preparedEditLayout.items?.map((item) => (
                  <EditLayoutItem
                    key={key++}
                    colCount={preparedEditLayout.colCount}
                    layoutItem={item}
                  />
                ))}
              </Container>
              <div className="dx-fieldset">
                <ValidationSummary />
              </div>
            </ValidationGroup>
          </EditItemsProvider>
        )}
      </form>
    );
  }
);
