import { IconButton } from '@radix-ui/themes';
import { RiImageAddLine, RiSendPlaneLine } from '@remixicon/react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createCat, useCat } from 'usecat';
import { useParams } from 'wouter';

import { AlbumsSelector } from '../components/AlbumsSelector.jsx';
import { Camera } from '../components/Camera.jsx';
import { ImageCarousel } from '../components/ImageCarousel.jsx';
import { useScrollToTop } from '../lib/useScrollToTop.js';
import { AreaField } from '../shared-private/react/AreaField.jsx';
import { ItemsWrapper } from '../shared-private/react/ItemsWrapper.jsx';
import { PageHeader } from '../shared-private/react/PageHeader.jsx';
import {
  isAddingImagesCat,
  isLoadingNoteCat,
  isUpdatingNoteCat,
  useNote,
} from '../store/note/noteCats.js';
import { addImagesEffect, fetchNoteEffect, updateNoteEffect } from '../store/note/noteEffects';

export function NoteEdit() {
  const { noteId } = useParams();

  useScrollToTop();

  useEffect(() => {
    fetchNoteEffect(noteId);
  }, [noteId]);

  return (
    <>
      <Header noteId={noteId} />

      <AddImage noteId={noteId} />

      <Form noteId={noteId} />

      <Images noteId={noteId} />
    </>
  );
}

const descriptionCat = createCat('');
const albumDescriptionCat = createCat('');
const selectedAlbumSortKeysCat = createCat([]);

const Header = React.memo(({ noteId }) => {
  const noteItem = useNote(noteId);
  const isLoading = useCat(isLoadingNoteCat);
  const isUpdating = useCat(isUpdatingNoteCat);
  const isAddingImages = useCat(isAddingImagesCat);

  const description = useCat(descriptionCat);
  const albumDescription = useCat(albumDescriptionCat);
  const selectedAlbumSortKeys = useCat(selectedAlbumSortKeysCat);

  const isDisabled = useMemo(
    () => (!noteItem?.images?.length && !description) || isUpdating,
    [noteItem?.images?.length, description, isUpdating]
  );

  const handleSend = useCallback(() => {
    updateNoteEffect(noteId, {
      encryptedPassword: noteItem?.encryptedPassword,
      note: description || null,
      albumDescription: albumDescription || null,
      albumIds: selectedAlbumSortKeys,
      goBack: false,
      onSucceeded: () => {
        albumDescriptionCat.set('');
      },
    });
  }, [albumDescription, description, noteId, noteItem?.encryptedPassword, selectedAlbumSortKeys]);

  const submitButton = useMemo(
    () => (
      <IconButton disabled={isDisabled} onClick={handleSend} mr="2">
        <RiSendPlaneLine />
      </IconButton>
    ),
    [handleSend, isDisabled]
  );

  return (
    <PageHeader
      title="Update note"
      isLoading={isLoading || isAddingImages || isUpdating}
      fixed
      hasBack
      right={submitButton}
    />
  );
});

const AddImage = React.memo(({ noteId }) => {
  const noteItem = useNote(noteId);

  const [showCamera, setShowCamera] = useState(false);

  const handleShowCamera = useCallback(() => {
    setShowCamera(true);
  }, []);

  const handleAddNewImages = useCallback(
    newImages => {
      addImagesEffect(noteId, {
        encryptedPassword: noteItem?.encryptedPassword,
        images: newImages,
      });
      setShowCamera(false);
    },
    [noteId, noteItem?.encryptedPassword]
  );

  const handleCloseCamera = useCallback(() => {
    setShowCamera(false);
  }, []);

  return (
    <>
      <IconButton my="4" onClick={handleShowCamera}>
        <RiImageAddLine />
      </IconButton>

      {showCamera && <Camera onSelect={handleAddNewImages} onClose={handleCloseCamera} />}
    </>
  );
});

const Form = React.memo(({ noteId }) => {
  const noteItem = useNote(noteId);

  const description = useCat(descriptionCat);

  const [currentSelectedKeys, setCurrentSelectedKeys] = useState(null);

  const handleAlbumsChange = useCallback(({ newAlbum, selectedKeys }) => {
    if (newAlbum !== undefined) {
      albumDescriptionCat.set(newAlbum);
    }

    if (selectedKeys !== undefined) {
      selectedAlbumSortKeysCat.set(selectedKeys);
    }
  }, []);

  useEffect(() => {
    if (!noteItem) {
      return;
    }

    descriptionCat.set(noteItem.note || '');
    selectedAlbumSortKeysCat.set((noteItem.albumIds || []).map(a => a.albumId));
    setCurrentSelectedKeys((noteItem.albumIds || []).map(a => a.albumId).join('/'));
  }, [noteItem]);

  return (
    <ItemsWrapper>
      <AreaField autofocus value={description} onChange={descriptionCat.set} />

      {currentSelectedKeys !== null && (
        <AlbumsSelector currentSelectedKeys={currentSelectedKeys} onChange={handleAlbumsChange} />
      )}
    </ItemsWrapper>
  );
});

const Images = React.memo(({ noteId }) => {
  const noteItem = useNote(noteId);

  if (!noteItem?.images?.length) {
    return null;
  }

  return (
    <ImageCarousel
      noteId={noteId}
      encryptedPassword={noteItem?.encryptedPassword}
      images={noteItem.images}
    />
  );
});
