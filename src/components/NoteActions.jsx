import { DropdownMenu, Flex, IconButton } from '@radix-ui/themes';
import {
  RiDeleteBinLine,
  RiImageAddLine,
  RiImageLine,
  RiLockLine,
  RiMore2Line,
  RiPencilLine,
  RiStickyNoteAddLine,
} from '@remixicon/react';
import React, { useState } from 'react';

import { errorColor } from '../shared-private/react/AppWrapper.jsx';
import { Confirm } from '../shared-private/react/Confirm.jsx';
import { useCat } from '../shared-private/react/store/cat.js';
import { navigateEffect } from '../shared-private/react/store/sharedEffects';
import {
  isDeletingNoteCat,
  isUpdatingNoteCat,
} from '../store/note/noteCats.js';
import {
  addImagesEffect,
  deleteNoteEffect,
  encryptExistingNoteEffect,
  setNoteEffect,
} from '../store/note/noteEffects';
import { Camera } from './Camera.jsx';

export function NoteActions({ note, goBackAfterDelete }) {
  const isDeleting = useCat(isDeletingNoteCat);
  const isUpdating = useCat(isUpdatingNoteCat);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  function handleEidt() {
    setNoteEffect(note);
    navigateEffect(`/notes/${note.sortKey}`);
  }

  if (!note) {
    return null;
  }

  if (!note.encrypted) {
    return (
      <IconButton
        variant="ghost"
        onClick={() => {
          encryptExistingNoteEffect(note);
        }}
        mr="2"
        disabled={isUpdating}
      >
        <RiLockLine />
      </IconButton>
    );
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

      <IconButton variant="ghost" onClick={handleEidt} mr="2">
        <RiStickyNoteAddLine />
      </IconButton>

      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <IconButton variant="ghost" mr="2">
            <RiMore2Line />
          </IconButton>
        </DropdownMenu.Trigger>

        <DropdownMenu.Content variant="soft">
          <DropdownMenu.Item onClick={handleEidt}>
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
          onSelect={async newImages => {
            addImagesEffect(note.sortKey, {
              encryptedPassword: note.encryptedPassword,
              images: newImages,
            });
            setShowCamera(false);
          }}
          onClose={() => setShowCamera(false)}
        />
      )}
    </Flex>
  );
}
