import { IconButton } from '@radix-ui/themes';
import { RiArrowUpSLine } from '@remixicon/react';
import React, { useCallback, useMemo } from 'react';
import { useCat } from 'usecat';
import { useParams } from 'wouter';

import { PrepareData } from '../components/PrepareData.jsx';
import { scrollToTop } from '../lib/scrollToTop.js';
import { useScrollToTop } from '../lib/useScrollToTop.js';
import { FormButton } from '../shared-private/react/FormButton.jsx';
import { PageHeader } from '../shared-private/react/PageHeader.jsx';
import { isLoadingAlbumItemsCat, useAlbumNotes } from '../store/album/albumItemCats.js';
import { fetchAlbumItemsEffect } from '../store/album/albumItemEffects';
import { isAddingImagesCat } from '../store/note/noteCats.js';
import { NotesList } from './Notes.jsx';

export const AlbumDetails = React.memo(() => {
  const { albumId } = useParams();

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

  const rightElement = useMemo(
    () => (
      <IconButton onClick={scrollToTop} mr="2" variant="ghost">
        <RiArrowUpSLine />
      </IconButton>
    ),
    []
  );

  return (
    <PageHeader
      title="Album details"
      isLoading={isLoading || isAddingImages}
      fixed
      hasBack
      right={rightElement}
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
