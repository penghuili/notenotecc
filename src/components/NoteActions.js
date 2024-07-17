import { DropdownMenu, IconButton } from '@radix-ui/themes';
import { Flex } from '@radix-ui/themes/dist/cjs/index.js';
import {
  RiDeleteBinLine,
  RiImageAddLine,
  RiImageLine,
  RiMore2Line,
  RiPencilLine,
} from '@remixicon/react';
import { useAtomValue } from 'jotai';
import React, { useState } from 'react';

import { errorColor } from '../shared-private/react/AppWrapper';
import { Confirm } from '../shared-private/react/Confirm';
import { navigateEffect } from '../shared-private/react/store/sharedEffects';
import { isDeletingNoteAtom } from '../store/note/noteAtoms';
import { addImagesEffect, deleteNoteEffect } from '../store/note/noteEffects';
import { Camera } from './Camera';

export function NoteActions({ note, goBackAfterDelete }) {
  const isDeleting = useAtomValue(isDeletingNoteAtom);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  if (!note) {
    return null;
  }

  return (
    <Flex align="center" gap="2">
      <IconButton
        variant="ghost"
        onClick={() => {
          setShowCamera(true);
        }}
        mr="2"
      >
        <RiImageAddLine />
      </IconButton>

      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <IconButton variant="ghost" mr="2">
            <RiMore2Line />
          </IconButton>
        </DropdownMenu.Trigger>

        <DropdownMenu.Content variant="soft">
          <DropdownMenu.Item
            onClick={() => {
              navigateEffect(`/notes/${note.sortKey}`);
            }}
          >
            <RiPencilLine />
            Update
          </DropdownMenu.Item>

          <DropdownMenu.Separator />

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
    </Flex>
  );
}
