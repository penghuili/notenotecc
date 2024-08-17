import { Button } from '@radix-ui/themes';
import React, { useCallback, useMemo } from 'react';
import { createCat, useCat } from 'usecat';

import { albumSelectedKeysCat, useResetAlbumsSelector } from '../components/AlbumsSelector.jsx';
import { ImageCarousel } from '../components/ImageCarousel.jsx';
import { MarkdownEditor } from '../components/MarkdownEditor/index.jsx';
import { NoteItem } from '../components/NoteItem.jsx';
import { PrepareData } from '../components/PrepareData.jsx';
import { cameraTypes } from '../lib/cameraTypes.js';
import { useDebounce } from '../lib/useDebounce.js';
import { useGetNoteAlbums } from '../lib/useGetNoteAlbums.js';
import { useRerenderDetector } from '../lib/useRerenderDetector.js';
import { useScrollToTop } from '../lib/useScrollToTop.js';
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
import {
  AddAlbums,
  AddImage,
  SelectedAlbums,
  showAlbumsSelectorCat,
  showCameraCat,
} from './NoteAdd.jsx';

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
  useResetAlbumsSelector();

  return (
    <PrepareData load={prepareData}>
      <Header noteId={noteId} viewMode={!!view} />

      {view ? (
        <NoteView noteId={noteId} />
      ) : (
        <>
          <Images noteId={noteId} />
          <Form noteId={noteId} />
          <SelectedAlbums />
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
  const selectedAlbumSortKeys = useCat(albumSelectedKeysCat);

  const isDisabled = useMemo(
    () => (!noteItem?.images?.length && !description) || isUpdating,
    [noteItem?.images?.length, description, isUpdating]
  );

  const handleAutoSave = useCallback(() => {
    if (viewMode) {
      return;
    }

    updateNoteEffect(noteId, {
      encryptedPassword: noteItem?.encryptedPassword,
      note: description || null,
      albumIds: selectedAlbumSortKeys,
      goBack: false,
      showSuccess: false,
    });
  }, [description, noteId, noteItem?.encryptedPassword, selectedAlbumSortKeys, viewMode]);

  const debounce1Ref = useDebounce(description, handleAutoSave, 1000);
  const debounce2Ref = useDebounce(selectedAlbumSortKeys, handleAutoSave, 1000);

  const handleSend = useCallback(() => {
    clearTimeout(debounce1Ref.current);
    clearTimeout(debounce2Ref.current);

    updateNoteEffect(noteId, {
      encryptedPassword: noteItem?.encryptedPassword,
      note: description || null,
      albumIds: selectedAlbumSortKeys,
      goBack: false,
      onSucceeded: () => {
        replaceTo(`/notes/${noteId}?view=1`);
      },
    });
  }, [
    debounce1Ref,
    debounce2Ref,
    description,
    noteId,
    noteItem?.encryptedPassword,
    selectedAlbumSortKeys,
  ]);

  const handleEdit = useCallback(() => {
    replaceTo(`/notes/${noteId}`);
  }, [noteId]);

  const rightElement = useMemo(
    () =>
      viewMode ? (
        <Button disabled={isDisabled} onClick={handleEdit} mr="2" variant="soft">
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

const Form = React.memo(({ noteId }) => {
  const noteItem = useNote(noteId);

  const description = useCat(descriptionCat);

  const currentSelectedKeys = useMemo(() => {
    return (noteItem?.albumIds || []).map(a => a.albumId).join('/');
  }, [noteItem?.albumIds]);

  const handleShowCamera = useCallback(() => {
    showCameraCat.set(true);
  }, []);

  const handleShowAlbumsSelector = useCallback(() => {
    showAlbumsSelectorCat.set(true);
  }, []);

  useRerenderDetector('NoteEditForm', {
    noteItem,
    description,
    currentSelectedKeys,
  });

  return (
    <>
      <MarkdownEditor
        autoFocus
        defaultText={description}
        onChange={descriptionCat.set}
        onImage={handleShowCamera}
        onAlbum={handleShowAlbumsSelector}
      />

      <AddAlbums />

      <AddImageWrapper noteId={noteId} cameraType={cameraTypes.takePhoto} />
    </>
  );
});

const AddImageWrapper = React.memo(({ noteId, cameraType }) => {
  const noteItem = useNote(noteId);

  const handleAddImages = useCallback(
    newImages => {
      addImagesEffect(noteId, {
        encryptedPassword: noteItem?.encryptedPassword,
        images: newImages,
      });
    },
    [noteId, noteItem?.encryptedPassword]
  );

  return <AddImage cameraType={cameraType} onAdd={handleAddImages} />;
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
      showFullText
    />
  );
});
