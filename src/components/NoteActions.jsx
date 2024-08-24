import { DropdownMenu, Flex, IconButton } from '@radix-ui/themes';
import { RiDeleteBinLine, RiImageAddLine, RiMore2Line, RiPencilLine } from '@remixicon/react';
import React, { useCallback, useMemo, useState } from 'react';
import { useCat } from 'usecat';

import { errorColor } from '../shared/react/AppWrapper.jsx';
import { Confirm } from '../shared/react/Confirm.jsx';
import { currentPathCat, navigate } from '../shared/react/my-router.jsx';
import { actionTypes, dispatchAction } from '../store/allActions.js';
import { isDeletingNoteCat } from '../store/note/noteCats.js';
import { Camera } from './Camera.jsx';
import { ProRequired } from './ProRequired.jsx';

export const NoteActions = React.memo(({ note }) => {
  const currentPath = useCat(currentPathCat);
  const isDetailsPage = useMemo(() => {
    return currentPath === `/notes/${note.sortKey}`;
  }, [currentPath, note.sortKey]);
  const isDeleting = useCat(isDeletingNoteCat);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  const handleAddImages = useCallback(
    async newImages => {
      dispatchAction({
        type: actionTypes.ADD_IMAGES,
        payload: { ...note, newImages },
      });
      setShowCamera(false);
    },
    [note]
  );

  const handleShowCamera = useCallback(e => {
    e.stopPropagation();
    setShowCamera(true);
  }, []);

  const handleHideCamera = useCallback(() => {
    setShowCamera(false);
  }, []);

  const handleNavigateToDetails = useCallback(() => {
    navigate(`/notes/${note.sortKey}`);
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

      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <IconButton variant="ghost" mr="2">
            <RiMore2Line />
          </IconButton>
        </DropdownMenu.Trigger>

        <DropdownMenu.Content variant="soft">
          {!isDetailsPage && (
            <>
              <DropdownMenu.Item onClick={handleNavigateToDetails}>
                <RiPencilLine />
                Update
              </DropdownMenu.Item>
              <DropdownMenu.Separator />
            </>
          )}

          <DropdownMenu.Item onClick={handleShowConfirm} color={errorColor}>
            <RiDeleteBinLine />
            Delete
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>

      {!!showCamera && <Camera onSelect={handleAddImages} onClose={handleHideCamera} />}
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
