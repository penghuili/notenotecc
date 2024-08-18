import React, { useCallback, useEffect, useMemo } from 'react';
import { createCat, useCat } from 'usecat';

import { albumSelectedKeysCat, useResetAlbumsSelector } from '../components/AlbumsSelector.jsx';
import { FullscreenPopup } from '../components/FullscreenPopup.jsx';
import { MarkdownEditor } from '../components/MarkdownEditor/index.jsx';
import { NoteItem } from '../components/NoteItem.jsx';
import { PrepareData } from '../components/PrepareData.jsx';
import { useDebounce } from '../lib/useDebounce.js';
import { useGetNoteAlbums } from '../lib/useGetNoteAlbums.js';
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
import { fetchNoteEffect, updateNoteEffect } from '../store/note/noteEffects';
import { AddAlbums, showAlbumsSelectorCat } from './NoteAdd.jsx';

const descriptionCat = createCat('');

export const NoteEdit = React.memo(({ pathParams: { noteId }, queryParams: { view, albums } }) => {
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
      <Header viewMode={!!view} />

      <NoteView noteId={noteId} />

      <Editor noteId={noteId} viewMode={!!view} />

      <AlbumsEditor noteId={noteId} viewMode={!!view} showAlbums={!!albums} />
    </PrepareData>
  );
});

const Header = React.memo(({ viewMode }) => {
  const isLoading = useCat(isLoadingNoteCat);
  const isUpdating = useCat(isUpdatingNoteCat);
  const isAddingImages = useCat(isAddingImagesCat);

  const titleMessage = useMemo(() => (viewMode ? 'Note details' : 'Update note'), [viewMode]);

  return (
    <PageHeader
      title={titleMessage}
      isLoading={isLoading || isAddingImages || isUpdating}
      fixed
      hasBack
    />
  );
});

const Editor = React.memo(({ noteId, viewMode }) => {
  const noteItem = useNote(noteId);

  const description = useCat(descriptionCat);
  const isUpdating = useCat(isUpdatingNoteCat);

  const handleAutoSave = useCallback(() => {
    updateNoteEffect(noteId, {
      encryptedPassword: noteItem?.encryptedPassword,
      note: description || null,
      goBack: false,
      showSuccess: false,
    });
  }, [description, noteId, noteItem?.encryptedPassword]);

  const debounceRef = useDebounce(description, handleAutoSave, 1000);

  const handleSend = useCallback(() => {
    clearTimeout(debounceRef.current);

    updateNoteEffect(noteId, {
      encryptedPassword: noteItem?.encryptedPassword,
      note: description || null,
      goBack: false,
      onSucceeded: () => {
        replaceTo(`/notes/${noteId}?view=1`);
      },
    });
  }, [debounceRef, description, noteId, noteItem?.encryptedPassword]);

  const handleClose = useCallback(() => {
    replaceTo(`/notes/${noteId}?view=1`);
  }, [noteId]);

  if (viewMode) {
    return null;
  }

  return (
    <FullscreenPopup onConfirm={handleSend} onClose={handleClose} disabled={isUpdating}>
      <MarkdownEditor autoFocus defaultText={description} onChange={descriptionCat.set} />
    </FullscreenPopup>
  );
});

const AlbumsEditor = React.memo(({ noteId, viewMode, showAlbums }) => {
  const noteItem = useNote(noteId);
  const isUpdating = useCat(isUpdatingNoteCat);

  const selectedAlbumSortKeys = useCat(albumSelectedKeysCat);

  const handleSave = useCallback(() => {
    updateNoteEffect(noteId, {
      encryptedPassword: noteItem?.encryptedPassword,
      albumIds: selectedAlbumSortKeys,
      goBack: false,
    });
  }, [noteId, noteItem?.encryptedPassword, selectedAlbumSortKeys]);

  const handleClose = useCallback(() => {
    const query = viewMode ? '?view=1' : '';
    replaceTo(`/notes/${noteId}${query}`);
  }, [noteId, viewMode]);

  useEffect(() => {
    showAlbumsSelectorCat.set(showAlbums);
  }, [showAlbums]);

  return <AddAlbums onConfirm={handleSave} onClose={handleClose} disabled={isUpdating} />;
});

const NoteView = React.memo(({ noteId }) => {
  const noteItem = useNote(noteId);
  const getNoteAlbums = useGetNoteAlbums();

  const handleShowAlbumsSelector = useCallback(() => {
    showAlbumsSelectorCat.set(true);
  }, []);

  const handleShowEditor = useCallback(() => {
    replaceTo(`/notes/${noteId}`);
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
