import React, { useCallback } from 'react';
import { useCat } from 'usecat';

import { PrepareData } from '../components/PrepareData.jsx';
import { ScrollToTop } from '../components/ScrollToTop.jsx';
import { useScrollToTop } from '../lib/useScrollToTop.js';
import { FormButton } from '../shared/react/FormButton.jsx';
import { PageHeader } from '../shared/react/PageHeader.jsx';
import { isLoadingAlbumItemsCat, useAlbumNotes } from '../store/album/albumItemCats.js';
import { fetchAlbumItemsEffect } from '../store/album/albumItemEffects';
import { isAddingImagesCat } from '../store/note/noteCats.js';
import { NotesList } from './Notes.jsx';

export const AlbumDetails = React.memo(({ pathParams: { albumId } }) => {
  const load = useCallback(async () => {
    await fetchAlbumItemsEffect(albumId, { startKey: null });
  }, [albumId]);

  useScrollToTop();

  return (
    <PrepareData load={load}>
      <Header />

      <Notes albumId={albumId} />

      <LoadMore albumId={albumId} />
    </PrepareData>
  );
});

const Header = React.memo(() => {
  const isLoading = useCat(isLoadingAlbumItemsCat);
  const isAddingImages = useCat(isAddingImagesCat);

  return (
    <PageHeader
      title="Tag details"
      isLoading={isLoading || isAddingImages}
      fixed
      hasBack
      right={<ScrollToTop />}
    />
  );
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
