import { DropdownMenu, Flex, IconButton } from '@radix-ui/themes';
import { RiDeleteBinLine, RiImageAddLine, RiMore2Line, RiPencilLine } from '@remixicon/react';
import React, { useCallback, useState } from 'react';
import { useCat } from 'usecat';

import { cameraTypes } from '../lib/cameraTypes.js';
import { errorColor } from '../shared/react/AppWrapper.jsx';
import { Confirm } from '../shared/react/Confirm.jsx';
import { navigate } from '../shared/react/my-router.jsx';
import { actionTypes, dispatchAction } from '../store/allActions.js';
import { isDeletingNoteCat, noteCat } from '../store/note/noteCats.js';
import { ProRequired } from './ProRequired.jsx';

export const NoteActions = React.memo(({ note }) => {
  const isDetailsPage = window.location.pathname === '/notes/details';
  const isDeleting = useCat(isDeletingNoteCat);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleShowCamera = useCallback(
    e => {
      e.stopPropagation();
      noteCat.set(note);
      navigate(`/add-images?noteId=${note.sortKey}&cameraType=${cameraTypes.takePhoto}`);
    },
    [note]
  );

  const handleNavigateToDetails = useCallback(() => {
    navigate(`/notes/details?noteId=${note.sortKey}`);
  }, [note.sortKey]);

  const handleShowConfirm = useCallback(() => {
    setShowDeleteConfirm(true);
  }, []);

  const handleDelete = useCallback(async () => {
    dispatchAction({
      type: actionTypes.DELETE_NOTE,
      payload: { ...note, goBack: isDetailsPage },
    });
  }, [isDetailsPage, note]);

  if (!note) {
    return null;
  }

  return (
    <Flex align="center" gap="2">
      <ProRequired>
        <IconButton variant="ghost" onClick={handleShowCamera} mr="2">
          <RiImageAddLine />
        </IconButton>
      </ProRequired>

      {!isDetailsPage && (
        <IconButton variant="ghost" onClick={handleNavigateToDetails} mr="2">
          <RiPencilLine />
        </IconButton>
      )}

      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <IconButton variant="ghost" mr="2">
            <RiMore2Line />
          </IconButton>
        </DropdownMenu.Trigger>

        <DropdownMenu.Content variant="soft">
          <DropdownMenu.Item onClick={handleShowConfirm} color={errorColor}>
            <RiDeleteBinLine />
            Delete
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>

      <Confirm
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        message="Are you sure you want to delete this note?"
        onConfirm={handleDelete}
        isSaving={isDeleting}
      />
    </Flex>
  );
});
