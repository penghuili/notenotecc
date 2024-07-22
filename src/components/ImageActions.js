import { DropdownMenu, IconButton } from '@radix-ui/themes';
import { RiDeleteBinLine, RiMore2Line, RiShareLine } from '@remixicon/react';
import { useAtomValue } from 'jotai';
import React, { useState } from 'react';

import { imagePathToUrl } from '../lib/imagePathToUrl';
import { shareFileWithUrl, supportShare } from '../lib/shareFile';
import { errorColor } from '../shared-private/react/AppWrapper';
import { Confirm } from '../shared-private/react/Confirm';
import { getFileSizeString } from '../shared-private/react/file';
import { isDeletingImageAtom } from '../store/note/noteAtoms';
import { deleteImageEffect } from '../store/note/noteEffects';

export function ImageActions({ noteId, image, onDeleteLocal }) {
  const isDeleting = useAtomValue(isDeletingImageAtom);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
              <DropdownMenu.Item
                onClick={() => {
                  shareFileWithUrl(imagePathToUrl(image.path));
                }}
              >
                <RiShareLine />
                Share
              </DropdownMenu.Item>

              <DropdownMenu.Separator />
            </>
          )}

          <DropdownMenu.Item
            onClick={() => {
              setShowDeleteConfirm(true);
            }}
            color={errorColor}
            disabled={isDeleting}
          >
            <RiDeleteBinLine />
            Delete
          </DropdownMenu.Item>

          {!!image.size && (
            <>
              <DropdownMenu.Separator />
              <DropdownMenu.Item>{getFileSizeString(image.size)}</DropdownMenu.Item>
            </>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Root>

      <Confirm
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        message="Are you sure you want to delete this photo?"
        onConfirm={async () => {
          if (noteId) {
            await deleteImageEffect(noteId, { imagePath: image.path });
          } else {
            if (onDeleteLocal) {
              onDeleteLocal(image);
            }
          }
          setShowDeleteConfirm(false);
        }}
        isSaving={isDeleting}
      />
    </>
  );
}
