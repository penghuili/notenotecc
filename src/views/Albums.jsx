import { Box, Flex } from '@radix-ui/themes';
import React from 'react';
import { useCat } from 'usecat';

import { AlbumItem } from '../components/AlbumItem.jsx';
import { PrepareData } from '../components/PrepareData.jsx';
import { useScrollToTop } from '../lib/useScrollToTop.js';
import { PageHeader } from '../shared-private/react/PageHeader.jsx';
import { Reorder } from '../shared-private/react/Reorder.jsx';
import { RouteLink } from '../shared-private/react/RouteLink.jsx';
import { userCat } from '../shared-private/react/store/sharedCats.js';
import { albumsCat, isDeletingAlbumCat, isLoadingAlbumsCat } from '../store/album/albumCats.js';
import { fetchAlbumsEffect, updateAlbumEffect } from '../store/album/albumEffects';

async function load() {
  await fetchAlbumsEffect();
}

export function Albums() {
  useScrollToTop();

  return (
    <PrepareData load={load}>
      <Header />

      <AlbumItems />

      <NoAlbumNotesLink />

      <ReorderAlbums />
    </PrepareData>
  );
}

const Header = React.memo(() => {
  const isLoading = useCat(isLoadingAlbumsCat);
  const isDeleting = useCat(isDeletingAlbumCat);

  return <PageHeader title="Albums" isLoading={isLoading || isDeleting} fixed hasBack />;
});

const AlbumItems = React.memo(() => {
  const albums = useCat(albumsCat);

  if (!albums?.length) {
    return null;
  }

  return (
    <Flex wrap="wrap" mb="6">
      {albums?.map(album => (
        <AlbumItem key={album.sortKey} album={album} />
      ))}
    </Flex>
  );
});

const NoAlbumNotesLink = React.memo(() => {
  const account = useCat(userCat);

  const noalbumSortKey = `album_noalbum_${account?.id}`;

  return <RouteLink to={`/albums/${noalbumSortKey}`}>Notes without album</RouteLink>;
});

const ReorderAlbums = React.memo(() => {
  const albums = useCat(albumsCat);

  return (
    <Box mt="6">
      <Reorder
        items={albums}
        reverse
        onReorder={({ itemId, newPosition, onSucceeded }) => {
          updateAlbumEffect(itemId, {
            position: newPosition,
            onSucceeded,
          });
        }}
      />
    </Box>
  );
});
