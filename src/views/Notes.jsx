import { IconButton } from '@radix-ui/themes';
import { RiArrowUpSLine, RiHashtag, RiHistoryLine, RiRefreshLine } from '@remixicon/react';
import React, { useCallback, useEffect } from 'react';
import { useCat } from 'usecat';

import { Actions } from '../components/Actions.jsx';
import { NoteItem } from '../components/NoteItem.jsx';
import { scrollToTop } from '../lib/scrollToTop.js';
import { useGetNoteAlbums } from '../lib/useGetNoteAlbums.js';
import { FormButton } from '../shared-private/react/FormButton.jsx';
import { PageHeader } from '../shared-private/react/PageHeader.jsx';
import { fetchSettingsEffect, navigateEffect } from '../shared-private/react/store/sharedEffects';
import { isAddingImagesCat, isLoadingNotesCat, notesCat } from '../store/note/noteCats.js';
import { fetchNotesEffect } from '../store/note/noteEffects';

export function Notes() {
  const { items: notes, startKey, hasMore } = useCat(notesCat);

  useEffect(() => {
    fetchNotesEffect();
  }, []);

  return (
    <>
      <Header />

      <NotesList notes={notes} />

      <LoadMore hasMore={hasMore} startKey={startKey} />

      <Actions />
    </>
  );
}

const Header = React.memo(() => {
  const isLoading = useCat(isLoadingNotesCat);
  const isAddingImages = useCat(isAddingImagesCat);

  return (
    <PageHeader
      isLoading={isLoading || isAddingImages}
      fixed
      title={
        <IconButton
          onClick={() => {
            fetchNotesEffect(null, true);
            fetchSettingsEffect(true);
          }}
          mr="2"
          variant="soft"
        >
          <RiRefreshLine />
        </IconButton>
      }
      right={
        <>
          <IconButton onClick={scrollToTop} mr="2" variant="ghost">
            <RiArrowUpSLine />
          </IconButton>

          <IconButton onClick={() => navigateEffect('/on-this-day')} mr="2" variant="ghost">
            <RiHistoryLine />
          </IconButton>

          <IconButton onClick={() => navigateEffect('/albums')} mr="2" variant="ghost">
            <RiHashtag />
          </IconButton>
        </>
      }
    />
  );
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

const LoadMore = React.memo(({ hasMore, startKey }) => {
  const isLoading = useCat(isLoadingNotesCat);

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
