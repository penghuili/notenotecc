import React, { useEffect } from 'react';
import { useCat } from 'usecat';
import { useParams } from 'wouter';

import { NoteItem } from '../components/NoteItem.jsx';
import { FormButton } from '../shared-private/react/FormButton.jsx';
import { PageHeader } from '../shared-private/react/PageHeader.jsx';
import { useAlbumsObject } from '../store/album/albumCats.js';
import { isLoadingAlbumItemsCat, useAlbumNotes } from '../store/album/albumItemCats.js';
import { fetchAlbumItemsEffect } from '../store/album/albumItemEffects';
import { isAddingImagesCat } from '../store/note/noteCats.js';

export function AlbumDetails() {
  const { albumId } = useParams();

  const isLoading = useCat(isLoadingAlbumItemsCat);
  const isAddingImages = useCat(isAddingImagesCat);
  const { items: notes, startKey, hasMore } = useAlbumNotes(albumId);
  const albumsObject = useAlbumsObject();

  useEffect(() => {
    fetchAlbumItemsEffect(albumId, { startKey: null });
  }, [albumId]);

  return (
    <>
      <PageHeader title="Album details" isLoading={isLoading || isAddingImages} fixed hasBack />

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
