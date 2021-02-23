import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FileUploader } from 'devextreme-react/file-uploader';
import { DataGrid, Column } from 'devextreme-react/data-grid';
import { createReadonlyDatasource } from '../util/datasource';

export interface AttachmentGridProps {
  readonly: boolean;
  fetchFunc: () => Promise<Array<Record<string, unknown>>>;
  openFunc: (fileName: string) => Promise<string>;
  uploadFunc: (file: File) => Promise<void>;
  deleteFunc: (fileName: string) => Promise<void>;
  showInfo: (message: string) => void;
  showWarning: (message: string) => void;
  showError: (message: string) => void;
}

export const AttachmentGrid = ({
  readonly,
  fetchFunc,
  openFunc,
  uploadFunc,
  deleteFunc,
  showInfo,
  showError,
}: AttachmentGridProps) => {
  const { t } = useTranslation();

  const fileSource = useMemo(
    () => createReadonlyDatasource(fetchFunc, undefined, 'Name'),
    [fetchFunc]
  );

  const fileUploaded = useCallback(() => {
    if (t) {
      fileSource.reload();
      showInfo(t('attachment.messages.added'));
    }
  }, [t, fileSource, showInfo]);

  const fileOpen = useCallback(
    (fileName: string) => {
      openFunc(fileName).then((response) => {
        window.open(response, '_blank');
      });
    },
    [openFunc]
  );

  const fileDelete = useCallback(
    (fileName: string) => {
      if (t) {
        deleteFunc(fileName)
          .then(() => {
            fileSource.reload();
            showInfo(t('attachment.messages.removed'));
          })
          .catch((reason) => showError(reason));
      }
    },
    [t, deleteFunc, fileSource, showError, showInfo]
  );

  const optionTitleRender = () => <React.Fragment></React.Fragment>;

  const optionCellRender = useCallback(
    (options: any) => (
      <React.Fragment>
        {t && (
          <React.Fragment>
            <span
              title={t('attachment.actions.view')}
              style={{ marginRight: '5px' }}
              onClick={() => fileOpen(options.data.Name)}
              data-toggle="tooltip"
            >
              <span
                style={{ fontSize: 18, textDecoration: 'none' }}
                className="bi bi-eye-fill"
              />
            </span>
            {!readonly && (
              <span
                title={t('attachment.actions.remove')}
                style={{ marginRight: '5px' }}
                onClick={() => fileDelete(options.data.Name)}
                data-toggle="tooltip"
              >
                <span
                  style={{ fontSize: 18, textDecoration: 'none' }}
                  className="bi bi-trash-fill"
                />
              </span>
            )}
          </React.Fragment>
        )}
      </React.Fragment>
    ),
    [t, fileDelete, fileOpen, readonly]
  );

  return (
    <React.Fragment>
      {t && (
        <React.Fragment>
          <FileUploader
            disabled={readonly}
            multiple={false}
            accept={'*'}
            uploadMode={'instantly'}
            uploadFile={uploadFunc}
            onUploaded={fileUploaded}
          />
          <DataGrid style={{ height: '100%' }} dataSource={fileSource}>
            <Column dataField={'Name'} caption={t('attachment.columns.name')} />
            <Column
              caption={t('attachment.columns.options')}
              fixed
              fixedPosition={'right'}
              width={100}
              allowEditing={false}
              allowExporting={false}
              allowResizing={false}
              cellRender={optionCellRender}
              headerCellRender={optionTitleRender}
            />
          </DataGrid>
        </React.Fragment>
      )}
    </React.Fragment>
  );
};
