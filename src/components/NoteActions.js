import { DropdownMenu, IconButton } from '@radix-ui/themes';
import {
  RiDeleteBinLine,
  RiImageLine,
  RiMoreLine,
  RiPencilLine,
  RiRefreshLine,
} from '@remixicon/react';
import { useAtomValue } from 'jotai';
import React, { useState } from 'react';

import { errorColor } from '../shared-private/react/AppWrapper';
import { Confirm } from '../shared-private/react/Confirm';
import { navigateEffect } from '../shared-private/react/store/sharedEffects';
import { isDeletingNoteAtom, isUpdatingImageUrlsAtom } from '../store/note/noteAtoms';
import {
  addImagesEffect,
  deleteNoteEffect,
  updateImageUrlsEffect,
} from '../store/note/noteEffects';
import { Camera } from './Camera';

export function NoteActions({ note, showUpdate, goBackAfterDelete }) {
  const isUpdatingImageUrls = useAtomValue(isUpdatingImageUrlsAtom);
  const isDeleting = useAtomValue(isDeletingNoteAtom);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  if (!note) {
    return null;
  }

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <IconButton variant="ghost" mr="2">
            <RiMoreLine />
          </IconButton>
        </DropdownMenu.Trigger>

        <DropdownMenu.Content variant="soft">
          {!!showUpdate && (
            <>
              <DropdownMenu.Item
                onClick={() => {
                  navigateEffect(`/notes/${note.sortKey}`);
                }}
              >
                <RiPencilLine />
                Update
              </DropdownMenu.Item>
              <DropdownMenu.Separator />
            </>
          )}

          <DropdownMenu.Item
            onClick={() => {
              updateImageUrlsEffect(note.sortKey, { showSuccess: true });
            }}
            disabled={isUpdatingImageUrls}
          >
            <RiRefreshLine />
            Refresh images
          </DropdownMenu.Item>

          <DropdownMenu.Item
            onClick={() => {
              setShowCamera(true);
            }}
          >
            <RiImageLine />
            Add images
          </DropdownMenu.Item>

          <DropdownMenu.Separator />

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
        message="Are you sure you want to delete this note?"
        onConfirm={() => {
          setShowDeleteConfirm(false);
          deleteNoteEffect(note.sortKey, {
            goBack: !!goBackAfterDelete,
          });
        }}
      />
      {!!showCamera && (
        <Camera
          onSelect={newImages => {
            addImagesEffect(note.sortKey, {
              canvases: newImages.map(i => i.canvas),
            });
            setShowCamera(false);
          }}
          onClose={() => setShowCamera(false)}
        />
      )}
    </>
  );
}
