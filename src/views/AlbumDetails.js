import { useAtomValue } from 'jotai';
import React from 'react';
import { useParams } from 'wouter';

import { NoteItem } from '../components/NoteItem';
import { Padding } from '../components/Padding';
import { FormButton } from '../shared-private/react/FormButton';
import { useEffectOnce } from '../shared-private/react/hooks/useEffectOnce';
import { PageHeader } from '../shared-private/react/PageHeader';
import { albumsObjectAtom } from '../store/album/albumAtoms';
import { isLoadingAlbumItemsAtom, useAlbumNotes } from '../store/album/albumItemAtoms';
import { fetchAlbumItemsEffect } from '../store/album/albumItemEffects';
import { isAddingImagesAtom } from '../store/note/noteAtoms';

export function AlbumDetails() {
  const { albumId } = useParams();

  const isLoading = useAtomValue(isLoadingAlbumItemsAtom);
  const isAddingImages = useAtomValue(isAddingImagesAtom);
  const { items: notes, startKey, hasMore } = useAlbumNotes(albumId);
  const albumsObject = useAtomValue(albumsObjectAtom);

  useEffectOnce(() => {
    fetchAlbumItemsEffect(albumId, { startKey: null });
  });

  return (
    <>
      <Padding>
        <PageHeader title="Album details" isLoading={isLoading || isAddingImages} fixed hasBack />
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
        <FormButton
          onClick={() => fetchAlbumItemsEffect(albumId, { startKey })}
          disabled={isLoading}
        >
          Load more
        </FormButton>
      )}
    </>
  );
}
