import { DropdownMenu, Flex, IconButton } from '@radix-ui/themes';
import {
  RiDeleteBinLine,
  RiImageAddLine,
  RiLockLine,
  RiMore2Line,
  RiPencilLine,
} from '@remixicon/react';
import React, { useCallback, useState } from 'react';
import { useCat } from 'usecat';

import { useRerenderDetector } from '../lib/useRerenderDetector.js';
import { errorColor } from '../shared/react/AppWrapper.jsx';
import { isDeletingNoteCat, isUpdatingNoteCat } from '../store/note/noteCats.js';
import {
  addImagesEffect,
  deleteNoteEffect,
  encryptExistingNoteEffect,
} from '../store/note/noteEffects';
import { Camera } from './Camera.jsx';

export const NoteActions = React.memo(({ note, goBackAfterDelete, onEdit }) => {
  const isUpdating = useCat(isUpdatingNoteCat);

  const [showCamera, setShowCamera] = useState(false);

  const handleEncrypt = useCallback(
    e => {
      e.stopPropagation();
      encryptExistingNoteEffect(note);
    },
    [note]
  );

  const handleAddImages = useCallback(
    async newImages => {
      addImagesEffect(note.sortKey, {
        encryptedPassword: note.encryptedPassword,
        images: newImages,
      });
      setShowCamera(false);
    },
    [note.encryptedPassword, note.sortKey]
  );

  const handleShowCamera = useCallback(e => {
    e.stopPropagation();
    setShowCamera(true);
  }, []);

  const handleHideCamera = useCallback(() => {
    setShowCamera(false);
  }, []);

  if (!note) {
    return null;
  }

  if (!note.encrypted) {
    return (
      <IconButton variant="ghost" onClick={handleEncrypt} mr="2" disabled={isUpdating}>
        <RiLockLine />
      </IconButton>
    );
  }

  return (
    <Flex align="center" gap="2">
      <IconButton variant="ghost" onClick={handleShowCamera} mr="2">
        <RiImageAddLine />
      </IconButton>

      <IconButton variant="ghost" onClick={onEdit} mr="2">
        <RiPencilLine />
      </IconButton>

      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <IconButton variant="ghost" mr="2">
            <RiMore2Line />
          </IconButton>
        </DropdownMenu.Trigger>

        <DropdownMenu.Content variant="soft">
          <DeleteAction noteId={note.sortKey} goBackAfterDelete={goBackAfterDelete} />
        </DropdownMenu.Content>
      </DropdownMenu.Root>

      {!!showCamera && <Camera onSelect={handleAddImages} onClose={handleHideCamera} />}
    </Flex>
  );
});

const DeleteAction = React.memo(({ noteId, goBackAfterDelete }) => {
  const isDeleting = useCat(isDeletingNoteCat);

  useRerenderDetector('DeleteAction', {
    noteId,
    goBackAfterDelete,
    isDeleting,
  });

  const handleDelete = useCallback(async () => {
    deleteNoteEffect(noteId, {
      goBack: !!goBackAfterDelete,
    });
  }, [noteId, goBackAfterDelete]);

  return (
    <DropdownMenu.Item onClick={handleDelete} color={errorColor} disabled={isDeleting}>
      <RiDeleteBinLine />
      Delete
    </DropdownMenu.Item>
  );
});
