import React from 'react';
import { useCat } from 'usecat';

import { PrepareData } from '../components/PrepareData.jsx';
import { Reorder } from '../components/Reorder.jsx';
import { useScrollToTop } from '../lib/useScrollToTop.js';
import { PageHeader } from '../shared/react/PageHeader.jsx';
import { albumsCat, isLoadingAlbumsCat } from '../store/album/albumCats.js';
import { fetchAlbumsEffect, updateAlbumEffect } from '../store/album/albumEffects';

async function load() {
  await fetchAlbumsEffect();
}

export function AlbumsReorder() {
  useScrollToTop();

  return (
    <PrepareData load={load}>
      <Header />

      <ReorderAlbums />
    </PrepareData>
  );
}

const Header = React.memo(() => {
  const isLoading = useCat(isLoadingAlbumsCat);

  return <PageHeader title="Reorder tags" isLoading={isLoading} fixed hasBack />;
});

const ReorderAlbums = React.memo(() => {
  const albums = useCat(albumsCat);

  return (
    <Reorder
      items={albums}
      onReorder={({ newItems, newPosition, itemId }) => {
        albumsCat.set(newItems);

        if (itemId && newPosition) {
          updateAlbumEffect(itemId, {
            position: newPosition,
          });
        }
      }}
      reverse
    />
  );
});
