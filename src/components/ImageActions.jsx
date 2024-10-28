import { Dropdown } from '@douyinfe/semi-ui';
import { RiDeleteBinLine, RiDownloadLine, RiMore2Line, RiShareLine } from '@remixicon/react';
import React, { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import fastMemo from 'react-fast-memo';
import { useCat } from 'usecat';

import { downloadFileWithUrl, shareFileWithUrl, supportShare } from '../lib/shareFile';
import { Confirm } from '../shared/semi/Confirm.jsx';
import { IconButton } from '../shared/semi/IconButton.jsx';
import { isDeletingImageCat } from '../store/note/noteCats.js';

export const ImageActions = fastMemo(({ noteId, image, onDelete }) => {
  const isDeleting = useCat(isDeletingImageCat);

  const deleteRef = useRef(null);

  const handleShare = useCallback(() => {
    shareFileWithUrl(image.url, image.type);
  }, [image]);

  const handleDownload = useCallback(() => {
    downloadFileWithUrl(image.url, image.type);
  }, [image]);

  const handleShowDeleteConfirm = useCallback(() => {
    deleteRef.current.show();
  }, []);

  return (
    <>
      <Dropdown
        trigger="click"
        clickToHide
        render={
          <Dropdown.Menu>
            {supportShare() && !!noteId && (
              <>
                <Dropdown.Item icon={<RiShareLine />} onClick={handleShare}>
                  Share
                </Dropdown.Item>
              </>
            )}
            <Dropdown.Item icon={<RiDownloadLine />} onClick={handleDownload}>
              Download
            </Dropdown.Item>

            <Dropdown.Divider />

            <Dropdown.Item
              type="danger"
              icon={<RiDeleteBinLine />}
              disabled={isDeleting}
              onClick={handleShowDeleteConfirm}
            >
              Delete
            </Dropdown.Item>
          </Dropdown.Menu>
        }
      >
        <IconButton
          theme="solid"
          icon={<RiMore2Line />}
          round
          style={{
            position: 'absolute',
            top: '0.5rem',
            right: 0,
          }}
        />
      </Dropdown>

      <ConfirmDelete ref={deleteRef} onDelete={onDelete} isDeleting={isDeleting} />
    </>
  );
});

const ConfirmDelete = fastMemo(
  forwardRef(({ onDelete, isDeleting }, ref) => {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleShow = useCallback(() => {
      setShowDeleteConfirm(true);
    }, []);
    const handleDelete = useCallback(async () => {
      await onDelete();
      setShowDeleteConfirm(false);
    }, [onDelete]);

    useImperativeHandle(ref, () => ({
      show: handleShow,
    }));

    return (
      <Confirm
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        message="Are you sure you want to delete this?"
        onConfirm={handleDelete}
        isSaving={isDeleting}
      />
    );
  })
);
