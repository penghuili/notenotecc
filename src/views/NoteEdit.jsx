import { Button, IconButton } from '@radix-ui/themes';
import { RiImageAddLine } from '@remixicon/react';
import React, { useCallback, useMemo, useState } from 'react';
import { createCat, useCat } from 'usecat';

import {
  albumDescriptionCat,
  albumSelectedKeysCat,
  AlbumsSelector,
} from '../components/AlbumsSelector.jsx';
import { Camera } from '../components/Camera.jsx';
import { ImageCarousel } from '../components/ImageCarousel.jsx';
import { MarkdownEditor } from '../components/MarkdownEditor/index.jsx';
import { NoteItem } from '../components/NoteItem.jsx';
import { PrepareData } from '../components/PrepareData.jsx';
import { useGetNoteAlbums } from '../lib/useGetNoteAlbums.js';
import { useRerenderDetector } from '../lib/useRerenderDetector.js';
import { useScrollToTop } from '../lib/useScrollToTop.js';
import { ItemsWrapper } from '../shared/react/ItemsWrapper.jsx';
import { replaceTo } from '../shared/react/my-router.jsx';
import { PageHeader } from '../shared/react/PageHeader.jsx';
import {
  isAddingImagesCat,
  isLoadingNoteCat,
  isUpdatingNoteCat,
  noteCat,
  useNote,
} from '../store/note/noteCats.js';
import { addImagesEffect, fetchNoteEffect, updateNoteEffect } from '../store/note/noteEffects';

const descriptionCat = createCat('');

export const NoteEdit = React.memo(({ pathParams: { noteId }, queryParams: { view } }) => {
  const prepareData = useCallback(async () => {
    await fetchNoteEffect(noteId);

    const note = noteCat.get();
    if (note) {
      descriptionCat.set(note.note);
      albumSelectedKeysCat.set((note?.albumIds || []).map(a => a.albumId));
    }
  }, [noteId]);

  useScrollToTop();

  return (
    <PrepareData load={prepareData}>
      <Header noteId={noteId} viewMode={!!view} />

      {view ? (
        <NoteView noteId={noteId} />
      ) : (
        <>
          <Form noteId={noteId} />
          <AddImage noteId={noteId} />
          <Images noteId={noteId} />
        </>
      )}
    </PrepareData>
  );
});

const Header = React.memo(({ noteId, viewMode }) => {
  const noteItem = useNote(noteId);
  const isLoading = useCat(isLoadingNoteCat);
  const isUpdating = useCat(isUpdatingNoteCat);
  const isAddingImages = useCat(isAddingImagesCat);

  const description = useCat(descriptionCat);
  const albumDescription = useCat(albumDescriptionCat);
  const selectedAlbumSortKeys = useCat(albumSelectedKeysCat);

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
        replaceTo(`/notes/${noteId}?view=1`);
      },
    });
  }, [albumDescription, description, noteId, noteItem?.encryptedPassword, selectedAlbumSortKeys]);

  const handleEdit = useCallback(() => {
    replaceTo(`/notes/${noteId}`);
  }, [noteId]);

  const rightElement = useMemo(
    () =>
      viewMode ? (
        <Button disabled={isDisabled} onClick={handleEdit} mr="2">
          Edit
        </Button>
      ) : (
        <Button disabled={isDisabled} onClick={handleSend} mr="2">
          Send
        </Button>
      ),
    [handleEdit, handleSend, isDisabled, viewMode]
  );
  const titleMessage = useMemo(() => (viewMode ? 'Note details' : 'Update note'), [viewMode]);

  return (
    <PageHeader
      title={titleMessage}
      isLoading={isLoading || isAddingImages || isUpdating}
      fixed
      hasBack
      right={rightElement}
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
      <IconButton size="4" my="4" onClick={handleShowCamera}>
        <RiImageAddLine />
      </IconButton>

      {showCamera && <Camera onSelect={handleAddNewImages} onClose={handleCloseCamera} />}
    </>
  );
});

const Form = React.memo(({ noteId }) => {
  const noteItem = useNote(noteId);

  const description = useCat(descriptionCat);

  const currentSelectedKeys = useMemo(() => {
    return (noteItem?.albumIds || []).map(a => a.albumId).join('/');
  }, [noteItem?.albumIds]);

  useRerenderDetector('NoteEditForm', {
    noteItem,
    description,
    currentSelectedKeys,
  });

  return (
    <ItemsWrapper>
      <MarkdownEditor autoFocus defaultText={description} onChange={descriptionCat.set} />

      <AlbumsSelector />
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

const NoteView = React.memo(({ noteId }) => {
  const noteItem = useNote(noteId);
  const getNoteAlbums = useGetNoteAlbums();

  if (!noteItem) {
    return null;
  }

  return (
    <NoteItem
      key={noteItem.sortKey}
      note={noteItem}
      albums={getNoteAlbums(noteItem)}
      showEdit={false}
    />
  );
});
