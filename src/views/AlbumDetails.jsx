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

  useEffect(() => {
    fetchAlbumItemsEffect(albumId, { startKey: null });
  }, [albumId]);

  return (
    <>
      <Header />

      <Notes albumId={albumId} />

      <LoadMore albumId={albumId} />
    </>
  );
});

const Header = React.memo(() => {
  const isLoading = useCat(isLoadingAlbumItemsCat);
  const isAddingImages = useCat(isAddingImagesCat);

  return <PageHeader title="Album details" isLoading={isLoading || isAddingImages} fixed hasBack />;
});

const Notes = React.memo(({ albumId }) => {
  const { items: notes } = useAlbumNotes(albumId);

  return <NotesList notes={notes} />;
});

const LoadMore = React.memo(({ albumId }) => {
  const isLoading = useCat(isLoadingAlbumItemsCat);
  const { startKey, hasMore } = useAlbumNotes(albumId);

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
