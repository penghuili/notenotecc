import { IconButton } from '@radix-ui/themes';
import { RiArrowUpSLine, RiHashtag, RiHistoryLine, RiRefreshLine } from '@remixicon/react';
import React, { useCallback, useMemo } from 'react';
import { useCat } from 'usecat';

import { Actions } from '../components/Actions.jsx';
import { NoteItem } from '../components/NoteItem.jsx';
import { PrepareData } from '../components/PrepareData.jsx';
import { scrollToTop } from '../lib/scrollToTop.js';
import { useGetNoteAlbums } from '../lib/useGetNoteAlbums.js';
import { FormButton } from '../shared-private/react/FormButton.jsx';
import { PageHeader } from '../shared-private/react/PageHeader.jsx';
import { fetchSettingsEffect, navigateEffect } from '../shared-private/react/store/sharedEffects';
import { isAddingImagesCat, isLoadingNotesCat, notesCat } from '../store/note/noteCats.js';
import { fetchNotesEffect } from '../store/note/noteEffects';

async function load() {
  await fetchNotesEffect();
}

export function Notes() {
  return (
    <PrepareData load={load} source="Notes">
      <Header />

      <NotesItems />

      <LoadMore />

      <Actions />
    </PrepareData>
  );
}

const Header = React.memo(() => {
  const isLoading = useCat(isLoadingNotesCat);
  const isAddingImages = useCat(isAddingImagesCat);

  const handleNavigateToHistory = useCallback(() => {
    navigateEffect('/on-this-day');
  }, []);

  const handleNavigateToAlbums = useCallback(() => {
    navigateEffect('/albums');
  }, []);

  const handleFetch = useCallback(async () => {
    isLoadingNotesCat.set(true);
    await fetchSettingsEffect(true);
    await fetchNotesEffect(null, true);
  }, []);

  const rightElement = useMemo(
    () => (
      <>
        <IconButton onClick={scrollToTop} mr="2" variant="ghost">
          <RiArrowUpSLine />
        </IconButton>

        <IconButton onClick={handleNavigateToHistory} mr="2" variant="ghost">
          <RiHistoryLine />
        </IconButton>

        <IconButton onClick={handleNavigateToAlbums} mr="2" variant="ghost">
          <RiHashtag />
        </IconButton>
      </>
    ),
    [handleNavigateToAlbums, handleNavigateToHistory]
  );

  return (
    <PageHeader
      isLoading={isLoading || isAddingImages}
      fixed
      title={
        <IconButton onClick={handleFetch} mr="2" variant="soft">
          <RiRefreshLine />
        </IconButton>
      }
      right={rightElement}
    />
  );
});

const NotesItems = React.memo(() => {
  const { items: notes } = useCat(notesCat);
  return <NotesList notes={notes} />;
});

export const NotesList = React.memo(({ notes }) => {
  const getNoteAlbums = useGetNoteAlbums();

  if (!notes?.length) {
    return null;
  }

  return notes.map(note => (
    <NoteItem key={note.sortKey} note={note} albums={getNoteAlbums(note)} />
  ));
});

const LoadMore = React.memo(() => {
  const isLoading = useCat(isLoadingNotesCat);
  const { startKey, hasMore } = useCat(notesCat);

  const handleFetch = useCallback(() => {
    fetchNotesEffect(startKey, true);
  }, [startKey]);

  if (!hasMore) {
    return null;
  }

  return (
    <FormButton onClick={handleFetch} disabled={isLoading}>
      Load more
    </FormButton>
  );
});
