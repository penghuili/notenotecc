import { DropdownMenu, IconButton } from '@radix-ui/themes';
import { RiDeleteBinLine, RiDownloadLine, RiMore2Line, RiShareLine } from '@remixicon/react';
import React, { useCallback, useImperativeHandle, useRef, useState } from 'react';
import fastMemo from 'react-fast-memo';
import { useCat } from 'usecat';

import { downloadFileWithUrl, shareFileWithUrl, supportShare } from '../lib/shareFile';
import { errorColor } from '../shared/radix/AppWrapper.jsx';
import { Confirm } from '../shared/radix/Confirm.jsx';
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
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <IconButton radius="full">
            <RiMore2Line />
          </IconButton>
        </DropdownMenu.Trigger>

        <DropdownMenu.Content variant="soft">
          {supportShare() && !!noteId && (
            <>
              <DropdownMenu.Item onClick={handleShare}>
                <RiShareLine />
                Share
              </DropdownMenu.Item>
            </>
          )}

          <DropdownMenu.Item onClick={handleDownload}>
            <RiDownloadLine />
            Download
          </DropdownMenu.Item>

          <DropdownMenu.Separator />

          <DropdownMenu.Item
            onClick={handleShowDeleteConfirm}
            color={errorColor}
            disabled={isDeleting}
          >
            <RiDeleteBinLine />
            Delete
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>

      <ConfirmDelete ref={deleteRef} onDelete={onDelete} isDeleting={isDeleting} />
    </>
  );
});

const ConfirmDelete = fastMemo(({ ref, onDelete, isDeleting }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleShow = useCallback(() => {
    setShowDeleteConfirm(true);
  }, []);
  const handleDelete = useCallback(async () => {
    await onDelete();
    setShowDeleteConfirm(false);
  }, [onDelete]);

  // eslint-disable-next-line react-compiler/react-compiler
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
});
