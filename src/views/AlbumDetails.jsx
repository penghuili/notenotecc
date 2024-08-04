import React, { useCallback, useEffect } from 'react';
import { useCat } from 'usecat';
import { useParams } from 'wouter';

import { FormButton } from '../shared-private/react/FormButton.jsx';
import { PageHeader } from '../shared-private/react/PageHeader.jsx';
import { isLoadingAlbumItemsCat, useAlbumNotes } from '../store/album/albumItemCats.js';
import { fetchAlbumItemsEffect } from '../store/album/albumItemEffects';
import { isAddingImagesCat } from '../store/note/noteCats.js';
import { NotesList } from './Notes.jsx';

export const AlbumDetails = React.memo(() => {
  const { albumId } = useParams();

  const isLoading = useCat(isLoadingAlbumItemsCat);
  const isAddingImages = useCat(isAddingImagesCat);
  const { items: notes, startKey, hasMore } = useAlbumNotes(albumId);

  useEffect(() => {
    fetchAlbumItemsEffect(albumId, { startKey: null });
  }, [albumId]);

  return (
    <>
      <PageHeader title="Album details" isLoading={isLoading || isAddingImages} fixed hasBack />

      <NotesList notes={notes} />

      <LoadMore albumId={albumId} startKey={startKey} hasMore={hasMore} />
    </>
  );
});

const LoadMore = React.memo(({ hasMore, albumId, startKey }) => {
  const isLoading = useCat(isLoadingAlbumItemsCat);

  const handleFetch = useCallback(() => {
    fetchAlbumItemsEffect(albumId, { startKey });
  }, [albumId, startKey]);

  if (!hasMore) {
    return null;
  }

  return (
    <FormButton onClick={handleFetch} disabled={isLoading}>
      Load more
    </FormButton>
  );
});
