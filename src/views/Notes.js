import { IconButton } from '@radix-ui/themes';
import {
  RiHashtag,
  RiHistoryLine,
  RiImageAddLine,
  RiRefreshLine,
  RiStickyNoteAddLine,
} from '@remixicon/react';
import { useAtomValue } from 'jotai';
import React from 'react';

import { NoteItem } from '../components/NoteItem';
import { NotesCount } from '../components/NotesCount';
import { FormButton } from '../shared-private/react/FormButton';
import { useEffectOnce } from '../shared-private/react/hooks/useEffectOnce';
import { PageHeader } from '../shared-private/react/PageHeader';
import { fetchSettingsEffect, navigateEffect } from '../shared-private/react/store/sharedEffects';
import { albumsObjectAtom } from '../store/album/albumAtoms';
import { isAddingImagesAtom, isLoadingNotesAtom, notesAtom } from '../store/note/noteAtoms';
import { fetchNotesEffect } from '../store/note/noteEffects';

export function Notes() {
  const isLoading = useAtomValue(isLoadingNotesAtom);
  const isAddingImages = useAtomValue(isAddingImagesAtom);
  const { items: notes, startKey, hasMore } = useAtomValue(notesAtom);
  const albumsObject = useAtomValue(albumsObjectAtom);

  useEffectOnce(() => {
    fetchNotesEffect();
  });

  return (
    <>
      <PageHeader
        isLoading={isLoading || isAddingImages}
        fixed
        title={
          <IconButton
            onClick={() => {
              fetchNotesEffect();
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
            <IconButton onClick={() => navigateEffect('/notes/add')} mr="2">
              <RiImageAddLine />
            </IconButton>

            <IconButton onClick={() => navigateEffect('/notes/add?image=0')} mr="2">
              <RiStickyNoteAddLine />
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

      <NotesCount />

      {!!notes?.length &&
        notes.map(note => (
          <NoteItem
            key={note.sortKey}
            note={note}
            albums={note?.albumIds?.map(a => albumsObject[a.albumId])?.filter(Boolean)}
          />
        ))}

      {hasMore && (
        <FormButton onClick={() => fetchNotesEffect(startKey)} disabled={isLoading}>
          Load more
        </FormButton>
      )}
    </>
  );
}
