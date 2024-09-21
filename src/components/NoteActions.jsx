import { DropdownMenu, Flex, IconButton } from '@radix-ui/themes';
import { RiDeleteBinLine, RiImageAddLine, RiMore2Line, RiPencilLine } from '@remixicon/react';
import React, { useCallback, useState } from 'react';
import { navigateTo } from 'react-baby-router';
import fastMemo from 'react-fast-memo';
import { useCat } from 'usecat';

import { cameraTypes } from '../lib/cameraTypes.js';
import { isMobileWidth } from '../shared/browser/device.js';
import { errorColor } from '../shared/radix/AppWrapper.jsx';
import { Confirm } from '../shared/radix/Confirm.jsx';
import { actionTypes, dispatchAction } from '../store/allActions.js';
import { isDeletingNoteCat } from '../store/note/noteCats.js';
import { imagesCat } from './Camera.jsx';
import { ProRequired } from './ProRequired.jsx';

export const NoteActions = fastMemo(({ note, isDetailsPage }) => {
  const isDeleting = useCat(isDeletingNoteCat);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleShowCamera = useCallback(
    e => {
      e.stopPropagation();
      imagesCat.reset();
      requestAnimationFrame(() => {
        navigateTo(`/add-images?noteId=${note.sortKey}&cameraType=${cameraTypes.takePhoto}`);
      });
    },
    [note.sortKey]
  );

  const handleNavigateToDetails = useCallback(() => {
    navigateTo(`/notes/details?noteId=${note.sortKey}`);
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
        <IconButton variant="soft" onClick={handleShowCamera} mr="2">
          <RiImageAddLine />
        </IconButton>
      </ProRequired>

      {!isDetailsPage && (
        <IconButton variant="soft" onClick={handleNavigateToDetails} mr="2">
          <RiPencilLine />
        </IconButton>
      )}

      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <IconButton variant="ghost" mr={isMobileWidth() ? '2' : '4'}>
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
