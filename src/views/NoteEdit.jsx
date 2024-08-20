import React, { useCallback, useEffect, useMemo } from 'react';
import { createCat, useCat } from 'usecat';

import {
  albumDescriptionCat,
  albumSelectedKeysCat,
  AlbumsSelector,
} from '../components/AlbumsSelector.jsx';
import { Camera } from '../components/Camera.jsx';
import { FullscreenPopup } from '../components/FullscreenPopup.jsx';
import { MarkdownEditor } from '../components/MarkdownEditor/index.jsx';
import { NoteItem } from '../components/NoteItem.jsx';
import { PrepareData } from '../components/PrepareData.jsx';
import { debounceAndQueue } from '../lib/debounce.js';
import { addRequestToQueue } from '../lib/requestQueue.js';
import { useGetNoteAlbums } from '../lib/useGetNoteAlbums.js';
import { useScrollToTop } from '../lib/useScrollToTop.js';
import { goBack, navigate, replaceTo } from '../shared/react/my-router.jsx';
import { PageHeader } from '../shared/react/PageHeader.jsx';
import { albumsCat, isCreatingAlbumCat } from '../store/album/albumCats.js';
import { createAlbum } from '../store/album/albumNetwork.js';
import {
  isAddingImagesCat,
  isCreatingNoteCat,
  isDeletingImageCat,
  isDeletingNoteCat,
  isLoadingNoteCat,
  isUpdatingNoteCat,
  noteCat,
  useNote,
} from '../store/note/noteCats.js';
import { addImagesEffect, fetchNoteEffect, updateNoteEffect } from '../store/note/noteEffects';

const descriptionCat = createCat('');
const noteIdCat = createCat(null);
const encryptedPasswordCat = createCat('');
const showEditorCat = createCat(false);
const showCameraCat = createCat(false);
const showAlbumsSelectorCat = createCat(false);

export const NoteEdit = React.memo(
  ({ pathParams: { noteId }, queryParams: { cameraType, editor, albums } }) => {
    const prepareData = useCallback(async () => {
      if (cameraType) {
        showCameraCat.set(true);
        showEditorCat.set(false);
        showAlbumsSelectorCat.set(false);
      } else if (editor) {
        showCameraCat.set(false);
        showEditorCat.set(true);
        showAlbumsSelectorCat.set(false);
      } else if (albums) {
        showCameraCat.set(false);
        showEditorCat.set(false);
        showAlbumsSelectorCat.set(true);
      } else {
        showCameraCat.set(false);
        showEditorCat.set(false);
        showAlbumsSelectorCat.set(false);
      }

      if (noteId) {
        noteIdCat.set(noteId);
        await fetchNoteEffect(noteId);

        const note = noteCat.get();
        if (note) {
          descriptionCat.set(note.note || '');
          encryptedPasswordCat.set(note.encryptedPassword);
          albumSelectedKeysCat.set((note.albumIds || []).map(a => a.albumId));

          return;
        }
      }

      replaceTo('/notes');
    }, [albums, cameraType, editor, noteId]);

    useScrollToTop();

    useEffect(() => {
      return () => {
        albumDescriptionCat.reset();
        albumSelectedKeysCat.reset();
      };
    }, []);

    return (
      <PrepareData load={prepareData}>
        <Header />

        <NoteView />

        <Editor />
        <AddImages cameraType={cameraType} />
        <AddAlbums />
      </PrepareData>
    );
  }
);

const Header = React.memo(() => {
  const isLoading = useCat(isLoadingNoteCat);
  const isCreating = useCat(isCreatingNoteCat);
  const isUpdating = useCat(isUpdatingNoteCat);
  const isDeleting = useCat(isDeletingNoteCat);
  const isAddingImages = useCat(isAddingImagesCat);
  const isDeletingImage = useCat(isDeletingImageCat);
  const showEditor = useCat(showEditorCat);

  const titleMessage = useMemo(() => (showEditor ? 'Update note' : 'Note details'), [showEditor]);

  return (
    <PageHeader
      title={titleMessage}
      isLoading={
        isLoading || isAddingImages || isUpdating || isDeleting || isDeletingImage || isCreating
      }
      fixed
      hasBack
    />
  );
});

const NoteView = React.memo(() => {
  const noteId = useCat(noteIdCat);
  const noteItem = useNote(noteId);
  const getNoteAlbums = useGetNoteAlbums();

  const handleShowAlbumsSelector = useCallback(() => {
    navigate(`/notes/${noteId}?albums=1`);
  }, [noteId]);

  const handleShowEditor = useCallback(() => {
    navigate(`/notes/${noteId}?editor=1`);
  }, [noteId]);

  if (!noteItem) {
    return null;
  }

  return (
    <NoteItem
      key={noteItem.sortKey}
      note={noteItem}
      albums={getNoteAlbums(noteItem)}
      onEdit={handleShowEditor}
      showFullText
      onAlbum={handleShowAlbumsSelector}
    />
  );
});

const saveDescription = async ({ noteId, description, encryptedPassword }) => {
  await updateNoteEffect(noteId, {
    encryptedPassword: encryptedPassword,
    note: description || null,
    goBack: false,
    showSuccess: false,
  });
};
const debouncedSaveDescription = debounceAndQueue(saveDescription, 500);

const Editor = React.memo(() => {
  const description = useCat(descriptionCat);
  const showEditor = useCat(showEditorCat);

  const handleChange = useCallback(newDescription => {
    descriptionCat.set(newDescription);

    debouncedSaveDescription({
      noteId: noteIdCat.get(),
      description: newDescription,
      encryptedPassword: encryptedPasswordCat.get(),
    });
  }, []);

  const handleBack = useCallback(() => {
    goBack();
  }, []);

  if (!showEditor) {
    return null;
  }

  return (
    <FullscreenPopup onBack={handleBack}>
      <MarkdownEditor autoFocus defaultText={description} onChange={handleChange} />
    </FullscreenPopup>
  );
});

const saveImages = async ({ noteId, images, encryptedPassword }) => {
  await addImagesEffect(noteId, {
    encryptedPassword: encryptedPassword,
    images,
  });
};

const AddImages = React.memo(({ cameraType }) => {
  const showCamera = useCat(showCameraCat);
  const isAddingImages = useCat(isAddingImagesCat);

  const handleClose = useCallback(() => {
    goBack();
  }, []);

  const handleAddImages = useCallback(async newImages => {
    const noteId = noteIdCat.get();
    const encryptedPassword = encryptedPasswordCat.get();
    if (!noteId || !encryptedPassword) {
      return;
    }
    addRequestToQueue({
      args: [{ noteId, images: newImages, encryptedPassword }],
      handler: saveImages,
    });
    goBack();
  }, []);

  if (!showCamera) {
    return null;
  }

  return (
    <Camera
      type={cameraType}
      disabled={isAddingImages}
      onSelect={handleAddImages}
      onClose={handleClose}
    />
  );
});

const saveAlbums = async ({ noteId, encryptedPassword }) => {
  const albumDescription = albumDescriptionCat.get();
  if (albumDescription) {
    isCreatingAlbumCat.set(true);

    const { data } = await createAlbum({ title: albumDescription });
    if (data) {
      albumsCat.set([...albumsCat.get(), data]);
      albumSelectedKeysCat.set([data.sortKey, ...albumSelectedKeysCat.get()]);
      albumDescriptionCat.set('');
    }

    isCreatingAlbumCat.set(false);
  }

  await updateNoteEffect(noteId, {
    encryptedPassword: encryptedPassword,
    albumIds: albumSelectedKeysCat.get(),
    goBack: false,
  });
};

const AddAlbums = React.memo(() => {
  const isAddingAlbum = useCat(isCreatingAlbumCat);
  const isUpdating = useCat(isUpdatingNoteCat);
  const showAlbumsSelector = useCat(showAlbumsSelectorCat);

  const handleConfirm = useCallback(async () => {
    const noteId = noteIdCat.get();
    const encryptedPassword = encryptedPasswordCat.get();
    if (!noteId || !encryptedPassword) {
      return;
    }

    addRequestToQueue({
      args: [{ noteId, encryptedPassword }],
      handler: saveAlbums,
    });
    goBack();
  }, []);

  const handleClose = useCallback(() => {
    goBack();
  }, []);

  if (!showAlbumsSelector) {
    return null;
  }

  return (
    <FullscreenPopup
      onConfirm={handleConfirm}
      onClose={handleClose}
      disabled={isUpdating || isAddingAlbum}
    >
      <AlbumsSelector />
    </FullscreenPopup>
  );
});
