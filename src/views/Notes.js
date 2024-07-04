import { useAtomValue } from 'jotai';
import React from 'react';

import { NoteItem } from '../components/NoteItem';
import { Padding } from '../components/Padding';
import { FormButton } from '../shared-private/react/FormButton';
import { useEffectOnce } from '../shared-private/react/hooks/useEffectOnce';
import { PageHeader } from '../shared-private/react/PageHeader';
import { albumsObjectAtom } from '../store/album/albumAtoms';
import { isLoadingNotesAtom, notesAtom } from '../store/note/noteAtoms';
import { fetchNotesEffect } from '../store/note/noteEffects';

export function Notes() {
  const isLoading = useAtomValue(isLoadingNotesAtom);
  const { items: notes, startKey, hasMore } = useAtomValue(notesAtom);
  const albumsObject = useAtomValue(albumsObjectAtom);

  useEffectOnce(() => {
    fetchNotesEffect();
  });

  return (
    <>
      <Padding>
        <PageHeader title="SimplestCam" isLoading={isLoading} />
      </Padding>

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
