import { DropdownMenu, Flex, IconButton } from '@radix-ui/themes';
import {
  RiDeleteBinLine,
  RiImageAddLine,
  RiImageLine,
  RiMore2Line,
  RiPencilLine,
  RiRestartLine,
  RiStickyNoteAddLine,
} from '@remixicon/react';
import { useAtomValue } from 'jotai';
import React, { useMemo, useState } from 'react';

import { formatImages } from '../lib/formatImages';
import { errorColor } from '../shared-private/react/AppWrapper.jsx';
import { Confirm } from '../shared-private/react/Confirm.jsx';
import { navigateEffect } from '../shared-private/react/store/sharedEffects';
import { isDeletingNoteAtom } from '../store/note/noteAtoms';
import {
  addImagesEffect,
  convertNoteImagesEffect,
  deleteNoteEffect,
  setNoteEffect,
} from '../store/note/noteEffects';
import { Camera } from './Camera.jsx';

export function NoteActions({ note, goBackAfterDelete }) {
  const isDeleting = useAtomValue(isDeletingNoteAtom);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  const hasPNG = useMemo(() => {
    return !!note?.images?.find(img => img.path.endsWith('.png'));
  }, [note]);

  function handleEidt() {
    setNoteEffect(note);
    navigateEffect(`/notes/${note.sortKey}`);
  }

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

      <IconButton variant="ghost" onClick={handleEidt} mr="2">
        <RiStickyNoteAddLine />
      </IconButton>

      {hasPNG && (
        <IconButton
          variant="ghost"
          onClick={() => {
            convertNoteImagesEffect(note, {});
          }}
          mr="2"
        >
          <RiRestartLine />
        </IconButton>
      )}

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
            const images = await formatImages(newImages);
            addImagesEffect(note.sortKey, {
              images,
            });
            setShowCamera(false);
          }}
          onClose={() => setShowCamera(false)}
        />
      )}
    </Flex>
  );
}
