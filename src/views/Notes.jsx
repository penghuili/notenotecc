import { IconButton } from '@radix-ui/themes';
import {
  RiArrowUpSLine,
  RiHashtag,
  RiHistoryLine,
  RiRefreshLine,
} from '@remixicon/react';
import React, { useEffect } from 'react';

import { Actions } from '../components/Actions.jsx';
import { NoteItem } from '../components/NoteItem.jsx';
import { scrollToTop } from '../lib/scrollToTop.js';
import { FormButton } from '../shared-private/react/FormButton.jsx';
import { PageHeader } from '../shared-private/react/PageHeader.jsx';
import { useCat } from '../shared-private/react/store/cat.js';
import {
  fetchSettingsEffect,
  navigateEffect,
} from '../shared-private/react/store/sharedEffects';
import { useAlbumsObject } from '../store/album/albumCats.js';
import {
  isAddingImagesCat,
  isLoadingNotesCat,
  notesCat,
} from '../store/note/noteCats.js';
import { fetchNotesEffect } from '../store/note/noteEffects';

export function Notes() {
  const isLoading = useCat(isLoadingNotesCat);
  const isAddingImages = useCat(isAddingImagesCat);
  const { items: notes, startKey, hasMore } = useCat(notesCat);
  const albumsObject = useAlbumsObject();

  useEffect(() => {
    fetchNotesEffect();
  }, []);

  return (
    <>
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

      {!!notes?.length &&
        notes.map(note => (
          <NoteItem
            key={note.sortKey}
            note={note}
            albums={note?.albumIds?.map(a => albumsObject[a.albumId])?.filter(Boolean)}
          />
        ))}

      {hasMore && (
        <FormButton onClick={() => fetchNotesEffect(startKey, true)} disabled={isLoading}>
          Load more
        </FormButton>
      )}

      <Actions />
    </>
  );
}
