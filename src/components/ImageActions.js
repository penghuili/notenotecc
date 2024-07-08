import { DropdownMenu, IconButton } from '@radix-ui/themes';
import { RiDeleteBinLine, RiMoreLine, RiShareLine } from '@remixicon/react';
import { useAtomValue } from 'jotai';
import React, { useState } from 'react';

import { shareImageFromImgTag, supportShare } from '../lib/shareFile';
import { errorColor } from '../shared-private/react/AppWrapper';
import { Confirm } from '../shared-private/react/Confirm';
import { isDeletingImageAtom } from '../store/note/noteAtoms';
import { deleteImageEffect } from '../store/note/noteEffects';

export function ImageActions({ noteId, image, imageRef, onDeleteLocal }) {
  const isDeleting = useAtomValue(isDeletingImageAtom);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <IconButton radius="full">
            <RiMoreLine />
          </IconButton>
        </DropdownMenu.Trigger>

        <DropdownMenu.Content variant="soft">
          {supportShare() && (
            <>
              <DropdownMenu.Item
                onClick={() => {
                  shareImageFromImgTag(imageRef.current);
                }}
              >
                <RiShareLine />
                Share photo
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
        </DropdownMenu.Content>
      </DropdownMenu.Root>

      <Confirm
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        message="Are you sure you want to delete this photo?"
        onConfirm={() => {
          setShowDeleteConfirm(false);
          if (noteId) {
            deleteImageEffect(noteId, { imagePath: image.path });
          } else {
            if (onDeleteLocal) {
              onDeleteLocal(image);
            }
          }
        }}
      />
    </>
  );
}
