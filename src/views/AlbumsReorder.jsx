import React, { useCallback } from 'react';
import { useCat } from 'usecat';

import { PrepareData } from '../components/PrepareData.jsx';
import { Reorder } from '../components/Reorder.jsx';
import { PageHeader } from '../shared/react/PageHeader.jsx';
import { useScrollToTop } from '../shared/react/ScrollToTop.jsx';
import { albumsCat, isLoadingAlbumsCat } from '../store/album/albumCats.js';
import { fetchAlbumsEffect } from '../store/album/albumEffects';
import { actionTypes, dispatchAction } from '../store/allActions.js';

async function load() {
  await fetchAlbumsEffect();
}

export const AlbumsReorder = React.memo(() => {
  useScrollToTop();

  return (
    <PrepareData load={load}>
      <Header />

      <ReorderAlbums />
    </PrepareData>
  );
});

const Header = React.memo(() => {
  const isLoading = useCat(isLoadingAlbumsCat);

  return <PageHeader title="Reorder tags" isLoading={isLoading} hasBack />;
});

const ReorderAlbums = React.memo(() => {
  const albums = useCat(albumsCat);

  const handleReorder = useCallback(({ newItems, item }) => {
    albumsCat.set(newItems);

    if (item) {
      dispatchAction({
        type: actionTypes.UPDATE_ALBUM,
        payload: { ...item, goBack: false },
      });
    }
  }, []);

  return <Reorder items={albums} onReorder={handleReorder} reverse />;
});
