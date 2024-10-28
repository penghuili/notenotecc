import { Dropdown } from '@douyinfe/semi-ui';
import { RiDeleteBinLine, RiEdit2Line, RiImageAddLine, RiMore2Line } from '@remixicon/react';
import React, { useCallback, useState } from 'react';
import { navigateTo } from 'react-baby-router';
import fastMemo from 'react-fast-memo';
import { useCat } from 'usecat';

import { cameraTypes } from '../lib/cameraTypes.js';
import { Confirm } from '../shared/semi/Confirm.jsx';
import { Flex } from '../shared/semi/Flex.jsx';
import { IconButton } from '../shared/semi/IconButton.jsx';
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
    <Flex direction="row" align="center" gap="0.5rem">
      <ProRequired>
        <IconButton
          icon={<RiImageAddLine />}
          onClick={handleShowCamera}
          style={{ marginRight: '0.5rem' }}
        />
      </ProRequired>

      {!isDetailsPage && (
        <IconButton
          icon={<RiEdit2Line />}
          onClick={handleNavigateToDetails}
          style={{ marginRight: '0.5rem' }}
        />
      )}

      <Dropdown
        trigger="click"
        clickToHide
        render={
          <Dropdown.Menu>
            <Dropdown.Item type="danger" icon={<RiDeleteBinLine />} onClick={handleShowConfirm}>
              Delete
            </Dropdown.Item>
          </Dropdown.Menu>
        }
      >
        <IconButton theme="borderless" icon={<RiMore2Line />} style={{ marginRight: '0.5rem' }} />
      </Dropdown>

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
