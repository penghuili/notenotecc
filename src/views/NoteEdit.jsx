import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { addRequestToQueue } from '../lib/requestQueue.js';
import { useDebounce } from '../lib/useDebounce.js';
import { useGetNoteAlbums } from '../lib/useGetNoteAlbums.js';
import { useScrollToTop } from '../lib/useScrollToTop.js';
import { replaceTo } from '../shared/react/my-router.jsx';
import { PageHeader } from '../shared/react/PageHeader.jsx';
import { albumsCat, isCreatingAlbumCat } from '../store/album/albumCats.js';
import { createAlbum } from '../store/album/albumNetwork.js';
import {
  isAddingImagesCat,
  isLoadingNoteCat,
  isUpdatingNoteCat,
  noteCat,
  useNote,
} from '../store/note/noteCats.js';
import {
  addImagesEffect,
  createNoteEffect,
  fetchNoteEffect,
  updateNoteEffect,
} from '../store/note/noteEffects';

const descriptionCat = createCat('');
const showEditorCat = createCat(false);
const showCameraCat = createCat(false);
export const showAlbumsSelectorCat = createCat(false);

export const NoteEdit = React.memo(
  ({ pathParams: { noteId }, queryParams: { cameraType, editor } }) => {
    const [innerNoteId, setInnerNoteId] = useState(noteId);

    const prepareData = useCallback(async () => {
      if (cameraType) {
        showCameraCat.set(true);
        showEditorCat.set(false);
      } else if (editor) {
        showCameraCat.set(false);
        showEditorCat.set(true);
      } else {
        showCameraCat.set(false);
        showEditorCat.set(false);
      }

      if (!noteId) {
        return;
      }

      await fetchNoteEffect(noteId);

      const note = noteCat.get();
      if (note) {
        descriptionCat.set(note.note);
        albumSelectedKeysCat.set((note?.albumIds || []).map(a => a.albumId));
      }
    }, [cameraType, editor, noteId]);

    useEffect(() => {
      async function createNote() {
        await createNoteEffect({ note: '', goBack: false, showSuccess: false });
        setInnerNoteId(noteCat.get()?.sortKey);
      }

      if (!noteId) {
        addRequestToQueue({
          args: [],
          handler: createNote,
        });
      }
    }, [noteId]);

    useScrollToTop();

    useEffect(() => {
      return () => {
        descriptionCat.reset();
        albumDescriptionCat.reset();
        albumSelectedKeysCat.reset();
      };
    }, []);

    return (
      <PrepareData load={prepareData}>
        <Header />

        <NoteView noteId={innerNoteId} />

        <Editor noteId={innerNoteId} />
        <AddImages noteId={innerNoteId} cameraType={cameraType} />
        <AddAlbums noteId={innerNoteId} />
      </PrepareData>
    );
  }
);

const Header = React.memo(() => {
  const isLoading = useCat(isLoadingNoteCat);
  const isUpdating = useCat(isUpdatingNoteCat);
  const isAddingImages = useCat(isAddingImagesCat);
  const showEditor = useCat(showEditorCat);

  const titleMessage = useMemo(() => (showEditor ? 'Update note' : 'Note details'), [showEditor]);

  return (
    <PageHeader
      title={titleMessage}
      isLoading={isLoading || isAddingImages || isUpdating}
      fixed
      hasBack
    />
  );
});

const NoteView = React.memo(({ noteId }) => {
  const noteItem = useNote(noteId);
  const getNoteAlbums = useGetNoteAlbums();

  const handleShowAlbumsSelector = useCallback(() => {
    showAlbumsSelectorCat.set(true);
  }, []);

  const handleShowEditor = useCallback(() => {
    replaceTo(`/notes/${noteId}?editor=1`);
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

const Editor = React.memo(({ noteId }) => {
  const noteItem = useNote(noteId);

  const description = useCat(descriptionCat);
  const isUpdating = useCat(isUpdatingNoteCat);
  const showEditor = useCat(showEditorCat);

  const handleAutoSave = useCallback(() => {
    addRequestToQueue({
      args: [{ noteId, description, encryptedPassword: noteItem?.encryptedPassword }],
      handler: saveDescription,
    });
  }, [description, noteId, noteItem?.encryptedPassword]);

  useDebounce(description, handleAutoSave, 500);

  const handleBack = useCallback(() => {
    replaceTo(`/notes/${noteId}`);
  }, [noteId]);

  if (!showEditor) {
    return null;
  }

  return (
    <FullscreenPopup onBack={handleBack} disabled={isUpdating}>
      <MarkdownEditor autoFocus defaultText={description} onChange={descriptionCat.set} />
    </FullscreenPopup>
  );
});

const saveImages = async ({ noteId, images, encryptedPassword }) => {
  await addImagesEffect(noteId, {
    encryptedPassword: encryptedPassword,
    images,
  });
};

const AddImages = React.memo(({ noteId, cameraType }) => {
  const showCamera = useCat(showCameraCat);
  const isAddingImages = useCat(isAddingImagesCat);
  const noteItem = useNote(noteId);

  const handleClose = useCallback(() => {
    replaceTo(`/notes/${noteId}`);
  }, [noteId]);

  const handleAddImages = useCallback(
    async newImages => {
      addRequestToQueue({
        args: [{ noteId, images: newImages, encryptedPassword: noteItem?.encryptedPassword }],
        handler: saveImages,
      });
      replaceTo(`/notes/${noteId}`);
    },
    [noteId, noteItem?.encryptedPassword]
  );

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

const AddAlbums = React.memo(({ noteId }) => {
  const noteItem = useNote(noteId);
  const isAddingAlbum = useCat(isCreatingAlbumCat);
  const isUpdating = useCat(isUpdatingNoteCat);
  const showAlbumsSelector = useCat(showAlbumsSelectorCat);

  const handleConfirm = useCallback(async () => {
    addRequestToQueue({
      args: [{ noteId, encryptedPassword: noteItem?.encryptedPassword }],
      handler: saveAlbums,
    });
    showAlbumsSelectorCat.set(false);
  }, [noteId, noteItem?.encryptedPassword]);

  const handleClose = useCallback(() => {
    showAlbumsSelectorCat.set(false);
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
