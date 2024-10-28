import React, { useCallback } from 'react';
import fastMemo from 'react-fast-memo';
import { useCat } from 'usecat';

import { PageContent } from '../shared/browser/PageContent.jsx';
import { ReorderItems } from '../shared/browser/ReorderItems.jsx';
import { PageHeader } from '../shared/semi/PageHeader.jsx';
import { PrepareData } from '../shared/semi/PrepareData.jsx';
import { albumsCat, isLoadingAlbumsCat } from '../store/album/albumCats.js';
import { fetchAlbumsEffect } from '../store/album/albumEffects';
import { actionTypes, dispatchAction } from '../store/allActions.js';

async function load() {
  await fetchAlbumsEffect();
}

export const AlbumsReorder = fastMemo(() => {
  return (
    <PrepareData load={load}>
      <PageContent>
        <Header />

        <ReorderAlbums />
      </PageContent>
    </PrepareData>
  );
});

const Header = fastMemo(() => {
  const isLoading = useCat(isLoadingAlbumsCat);

  return <PageHeader title="Reorder tags" isLoading={isLoading} hasBack />;
});

const ReorderAlbums = fastMemo(() => {
  const albums = useCat(albumsCat);

  const handleReorder = useCallback(({ item }) => {
    if (item) {
      dispatchAction({
        type: actionTypes.UPDATE_ALBUM,
        payload: { ...item, goBack: false },
      });
    }
  }, []);

  return (
    <ReorderItems
      items={albums}
      onReorder={handleReorder}
      reverse
      renderItem={item => item.title}
      bgColor="var(--semi-color-bg-0)"
    />
  );
});
