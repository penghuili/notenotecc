import { DropdownMenu, Flex, IconButton } from '@radix-ui/themes';
import { RiDeleteBinLine, RiImageAddLine, RiMore2Line, RiPencilLine } from '@remixicon/react';
import React, { useCallback, useMemo, useState } from 'react';
import { useCat } from 'usecat';

import { errorColor } from '../shared/react/AppWrapper.jsx';
import { currentPathCat, navigate } from '../shared/react/my-router.jsx';
import { actionTypes, dispatchAction } from '../store/allActions.js';
import { isDeletingNoteCat } from '../store/note/noteCats.js';
import { Camera } from './Camera.jsx';

export const NoteActions = React.memo(({ note }) => {
  const currentPath = useCat(currentPathCat);
  const isDetailsPage = useMemo(() => {
    return currentPath === `/notes/${note.sortKey}`;
  }, [currentPath, note.sortKey]);

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

  if (!note) {
    return null;
  }

  return (
    <Flex align="center" gap="2">
      <IconButton variant="ghost" onClick={handleShowCamera} mr="2">
        <RiImageAddLine />
      </IconButton>

      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <IconButton variant="ghost" mr="2">
            <RiMore2Line />
          </IconButton>
        </DropdownMenu.Trigger>

        <DropdownMenu.Content variant="soft">
          {!isDetailsPage && (
            <DropdownMenu.Item onClick={handleNavigateToDetails}>
              <RiPencilLine />
              Update
            </DropdownMenu.Item>
          )}

          <DropdownMenu.Separator />

          <DeleteAction note={note} goBackAfterDelete={isDetailsPage} />
        </DropdownMenu.Content>
      </DropdownMenu.Root>

      {!!showCamera && <Camera onSelect={handleAddImages} onClose={handleHideCamera} />}
    </Flex>
  );
});

const DeleteAction = React.memo(({ note, goBackAfterDelete }) => {
  const isDeleting = useCat(isDeletingNoteCat);

  const handleDelete = useCallback(async () => {
    dispatchAction({
      type: actionTypes.DELETE_NOTE,
      payload: { ...note, goBack: !!goBackAfterDelete },
    });
  }, [goBackAfterDelete, note]);

  return (
    <DropdownMenu.Item onClick={handleDelete} color={errorColor} disabled={isDeleting}>
      <RiDeleteBinLine />
      Delete
    </DropdownMenu.Item>
  );
});
