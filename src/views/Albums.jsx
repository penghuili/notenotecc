import { Dropdown, Typography } from '@douyinfe/semi-ui';
import { RiMore2Line, RiSortDesc } from '@remixicon/react';
import React, { useCallback, useMemo } from 'react';
import { navigateTo } from 'react-baby-router';
import fastMemo from 'react-fast-memo';
import { useCat } from 'usecat';

import { AlbumItem } from '../components/AlbumItem.jsx';
import { AddNewAlbum } from '../components/AlbumsSelector.jsx';
import { PageContent } from '../shared/browser/PageContent.jsx';
import { userCat } from '../shared/browser/store/sharedCats.js';
import { Flex } from '../shared/semi/Flex.jsx';
import { IconButton } from '../shared/semi/IconButton.jsx';
import { PageEmpty } from '../shared/semi/PageEmpty.jsx';
import { PageHeader } from '../shared/semi/PageHeader.jsx';
import { PrepareData } from '../shared/semi/PrepareData.jsx';
import { RouteLink } from '../shared/semi/RouteLink.jsx';
import { albumsCat, isDeletingAlbumCat, isLoadingAlbumsCat } from '../store/album/albumCats.js';
import { fetchAlbumsEffect } from '../store/album/albumEffects';

async function load() {
  await fetchAlbumsEffect();
}

export const Albums = fastMemo(() => {
  return (
    <PrepareData load={load}>
      <PageContent>
        <Header />

        <AlbumItems />

        <NotesWithoutTags />

        <div style={{ marginTop: '2rem' }}>
          <AddNewAlbum />
        </div>
      </PageContent>
    </PrepareData>
  );
});

const Header = fastMemo(() => {
  const isLoading = useCat(isLoadingAlbumsCat);
  const isDeleting = useCat(isDeletingAlbumCat);

  const handleNavigateToReorder = useCallback(() => {
    navigateTo('/albums/reorder');
  }, []);

  const rightElement = useMemo(
    () => (
      <Dropdown
        trigger="click"
        clickToHide
        render={
          <Dropdown.Menu>
            <Dropdown.Item icon={<RiSortDesc />} onClick={handleNavigateToReorder}>
              Reorder tags
            </Dropdown.Item>
          </Dropdown.Menu>
        }
      >
        <IconButton
          theme="borderless"
          icon={<RiMore2Line />}
          style={{
            position: 'absolute',
            top: '0.5rem',
            right: '0.5rem',
          }}
        />
      </Dropdown>
    ),
    [handleNavigateToReorder]
  );

  return (
    <PageHeader
      title="Tags"
      isLoading={isLoading || isDeleting}
      fixed
      hasBack
      right={rightElement}
    />
  );
});

const AlbumItems = fastMemo(() => {
  const albums = useCat(albumsCat);

  if (albums?.length) {
    return (
      <Flex direction="row" wrap="wrap">
        {albums?.map(album => (
          <AlbumItem key={album.sortKey} album={album} />
        ))}
      </Flex>
    );
  }

  if (!albums?.length) {
    return (
      <PageEmpty>
        <Typography.Paragraph>No tags yet.</Typography.Paragraph>
      </PageEmpty>
    );
  }

  return null;
});

const NotesWithoutTags = fastMemo(() => {
  const account = useCat(userCat);

  if (!account?.id) {
    return null;
  }

  return (
    <RouteLink to={`/albums/details?albumId=album_noalbum_${account?.id}`}>
      Notes without tags
    </RouteLink>
  );
});
