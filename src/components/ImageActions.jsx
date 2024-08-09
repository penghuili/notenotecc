import { DropdownMenu, IconButton } from '@radix-ui/themes';
import {
  RiDeleteBinLine,
  RiDownloadLine,
  RiInformationLine,
  RiMore2Line,
  RiShareLine,
} from '@remixicon/react';
import React, { useCallback, useState } from 'react';
import { useCat } from 'usecat';

import { downloadFileWithUrl, shareFileWithUrl, supportShare } from '../lib/shareFile';
import { errorColor } from '../shared-private/react/AppWrapper.jsx';
import { Confirm } from '../shared-private/react/Confirm.jsx';
import { getFileSizeString } from '../shared-private/react/file';
import { setToastEffect } from '../shared-private/react/store/sharedEffects.js';
import { toastTypes } from '../shared-private/react/Toast.jsx';
import { isDeletingImageCat } from '../store/note/noteCats.js';
import { deleteImageEffect } from '../store/note/noteEffects';

export const ImageActions = React.memo(({ noteId, image, onDeleteLocal }) => {
  const isDeleting = useCat(isDeletingImageCat);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleShare = useCallback(() => {
    shareFileWithUrl(image.url, image.type);
  }, [image]);

  const handleShareMP4 = useCallback(async () => {
    setToastEffect('This will take some time.', toastTypes.info);
    await shareFileWithUrl(image.url, image.type, true);
    setToastEffect('Done!');
  }, [image]);

  const handleDownload = useCallback(() => {
    downloadFileWithUrl(image.url, image.type);
  }, [image]);

  const handleDownloadMP4 = useCallback(async () => {
    setToastEffect('This will take some time.', toastTypes.info);
    await downloadFileWithUrl(image.url, image.type, true);
    setToastEffect('Done!');
  }, [image]);

  const handleShowDeleteConfirm = useCallback(() => {
    setShowDeleteConfirm(true);
  }, []);

  const handleDelete = useCallback(async () => {
    if (noteId) {
      await deleteImageEffect(noteId, { imagePath: image.path });
    } else {
      if (onDeleteLocal) {
        onDeleteLocal(image);
      }
    }
    setShowDeleteConfirm(false);
  }, [noteId, image, onDeleteLocal]);

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

              {image.type === 'image/webm' && (
                <DropdownMenu.Item onClick={handleShareMP4}>
                  <RiShareLine />
                  Share (MP4)
                </DropdownMenu.Item>
              )}
            </>
          )}

          <DropdownMenu.Item onClick={handleDownload}>
            <RiDownloadLine />
            Download
          </DropdownMenu.Item>

          {image.type === 'image/webm' && (
            <DropdownMenu.Item onClick={handleDownloadMP4}>
              <RiDownloadLine />
              Download (MP4)
            </DropdownMenu.Item>
          )}

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

      <Confirm
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        message="Are you sure you want to delete this file?"
        onConfirm={handleDelete}
        isSaving={isDeleting}
      />
    </>
  );
});
