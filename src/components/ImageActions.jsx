import { DropdownMenu, IconButton } from '@radix-ui/themes';
import {
  RiCloseLine,
  RiDeleteBinLine,
  RiDownloadLine,
  RiInformationLine,
  RiMore2Line,
  RiShareLine,
} from '@remixicon/react';
import React, { useCallback, useImperativeHandle, useRef, useState } from 'react';
import { useCat } from 'usecat';

import { downloadFileWithUrl, shareFileWithUrl, supportShare } from '../lib/shareFile';
import { errorColor } from '../shared-private/react/AppWrapper.jsx';
import { Confirm } from '../shared-private/react/Confirm.jsx';
import { getFileSizeString } from '../shared-private/react/file';
import { isDeletingImageCat } from '../store/note/noteCats.js';
import { deleteImageEffect } from '../store/note/noteEffects';

export const ImageActions = React.memo(({ noteId, image, onDeleteLocal }) => {
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

  const handleDelete = useCallback(async () => {
    if (onDeleteLocal) {
      onDeleteLocal();
      return;
    }

    if (noteId) {
      await deleteImageEffect(noteId, { imagePath: image.path });
    }
  }, [onDeleteLocal, noteId, image.path]);

  return (
    <>
      {onDeleteLocal ? (
        <IconButton onClick={handleShowDeleteConfirm}>
          <RiCloseLine />
        </IconButton>
      ) : (
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

            {!!image.size && (
              <>
                <DropdownMenu.Separator />
                <DropdownMenu.Item>
                  <RiInformationLine />
                  {getFileSizeString(image.size)}
                </DropdownMenu.Item>
              </>
            )}
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      )}

      <ConfirmDelete ref={deleteRef} onDelete={handleDelete} isDeleting={isDeleting} />
    </>
  );
});

const ConfirmDelete = React.memo(({ ref, onDelete, isDeleting }) => {
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
});
