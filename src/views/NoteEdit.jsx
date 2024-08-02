import { IconButton } from '@radix-ui/themes';
import { RiImageAddLine, RiSendPlaneLine } from '@remixicon/react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useCat } from 'usecat';
import { useParams } from 'wouter';

import { AlbumsSelector } from '../components/AlbumsSelector.jsx';
import { Camera } from '../components/Camera.jsx';
import { ImageCarousel } from '../components/ImageCarousel.jsx';
import { scrollToTop } from '../lib/scrollToTop.js';
import { AreaField } from '../shared-private/react/AreaField.jsx';
import { ItemsWrapper } from '../shared-private/react/ItemsWrapper.jsx';
import { PageHeader } from '../shared-private/react/PageHeader.jsx';
import { goBackEffect } from '../shared-private/react/store/sharedEffects.js';
import {
  isAddingImagesCat,
  isLoadingNoteCat,
  isUpdatingNoteCat,
  useNote,
} from '../store/note/noteCats.js';
import { addImagesEffect, fetchNoteEffect, updateNoteEffect } from '../store/note/noteEffects';

export function NoteEdit() {
  const { noteId } = useParams();

  const isLoading = useCat(isLoadingNoteCat);
  const isUpdating = useCat(isUpdatingNoteCat);
  const isAddingImages = useCat(isAddingImagesCat);
  const noteItem = useNote(noteId);

  const [images, setImages] = useState([]);
  const [note, setNote] = useState('');
  const [currentSelectedKeys, setCurrentSelectedKeys] = useState(null);
  const [selectedAlbumSortKeys, setSelectedAlbumSortKeys] = useState([]);
  const [newAlbumDescription, setNewAlbumDescription] = useState('');
  const [showCamera, setShowCamera] = useState(false);

  const handleAlbumChange = useCallback(({ newAlbum, selectedKeys }) => {
    if (newAlbum !== undefined) {
      setNewAlbumDescription(newAlbum);
    }

    if (selectedKeys !== undefined) {
      setSelectedAlbumSortKeys(selectedKeys);
    }
  }, []);

  const handleShowCamera = useCallback(() => {
    setShowCamera(true);
  }, []);

  const handleAddNewImages = useCallback(
    newImages => {
      addImagesEffect(noteId, {
        encryptedPassword: noteItem.encryptedPassword,
        images: newImages,
      });
      setShowCamera(false);
    },
    [noteId, noteItem?.encryptedPassword]
  );

  const handleCloseCamera = useCallback(() => {
    goBackEffect();
  }, []);

  useEffect(() => {
    scrollToTop();
  }, []);

  useEffect(() => {
    fetchNoteEffect(noteId);
  }, [noteId]);

  useEffect(() => {
    if (!noteItem) {
      return;
    }

    setImages(noteItem.images || []);
    setNote(noteItem.note || '');
    setCurrentSelectedKeys((noteItem.albumIds || []).map(a => a.albumId).join('/'));
  }, [noteItem]);

  const submitButton = useMemo(
    () => (
      <IconButton
        disabled={(!images?.length && !note) || isUpdating}
        onClick={() => {
          updateNoteEffect(noteId, {
            encryptedPassword: noteItem?.encryptedPassword,
            note,
            albumDescription: newAlbumDescription || null,
            albumIds: selectedAlbumSortKeys,
            goBack: false,
            onSucceeded: () => {
              setNewAlbumDescription('');
            },
          });
        }}
        mr="2"
      >
        <RiSendPlaneLine />
      </IconButton>
    ),
    [
      images?.length,
      isUpdating,
      newAlbumDescription,
      note,
      noteId,
      noteItem?.encryptedPassword,
      selectedAlbumSortKeys,
    ]
  );

  return (
    <>
      <PageHeader
        title="Update note"
        isLoading={isLoading || isAddingImages || isUpdating}
        fixed
        hasBack
        right={submitButton}
      />

      <IconButton my="4" onClick={handleShowCamera}>
        <RiImageAddLine />
      </IconButton>

      <ItemsWrapper>
        <AreaField autofocus value={note} onChange={setNote} />

        {currentSelectedKeys !== null && (
          <AlbumsSelector currentSelectedKeys={currentSelectedKeys} onChange={handleAlbumChange} />
        )}
      </ItemsWrapper>

      {!!images?.length && (
        <ImageCarousel
          noteId={noteId}
          encryptedPassword={noteItem?.encryptedPassword}
          images={images}
        />
      )}

      {showCamera && <Camera onSelect={handleAddNewImages} onCancel={handleCloseCamera} />}
    </>
  );
}
