import { DropdownMenu, IconButton } from '@radix-ui/themes';
import { RiDeleteBinLine, RiInformationLine, RiMore2Line, RiShareLine } from '@remixicon/react';
import React, { useCallback, useState } from 'react';
import { useCat } from 'usecat';

import { shareFileWithUrl, supportShare } from '../lib/shareFile';
import { errorColor } from '../shared-private/react/AppWrapper.jsx';
import { Confirm } from '../shared-private/react/Confirm.jsx';
import { getFileSizeString } from '../shared-private/react/file';
import { isDeletingImageCat } from '../store/note/noteCats.js';
import { deleteImageEffect } from '../store/note/noteEffects';

export const ImageActions = React.memo(({ noteId, image, onDeleteLocal }) => {
  const isDeleting = useCat(isDeletingImageCat);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleShare = useCallback(() => {
    shareFileWithUrl(image.url, image.type);
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

              <DropdownMenu.Separator />
            </>
          )}

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
