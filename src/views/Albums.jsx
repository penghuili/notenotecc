import { DropdownMenu, Flex, IconButton } from '@radix-ui/themes';
import { RiMore2Line, RiSortDesc } from '@remixicon/react';
import React, { useCallback, useMemo } from 'react';
import { useCat } from 'usecat';

import { AlbumItem } from '../components/AlbumItem.jsx';
import { PrepareData } from '../components/PrepareData.jsx';
import { useScrollToTop } from '../lib/useScrollToTop.js';
import { RouteLink } from '../shared-private/react/my-router.jsx';
import { PageHeader } from '../shared-private/react/PageHeader.jsx';
import { userCat } from '../shared-private/react/store/sharedCats.js';
import { navigateEffect } from '../shared-private/react/store/sharedEffects.js';
import { albumsCat, isDeletingAlbumCat, isLoadingAlbumsCat } from '../store/album/albumCats.js';
import { fetchAlbumsEffect } from '../store/album/albumEffects';

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
    </PrepareData>
  );
}

const Header = React.memo(() => {
  const isLoading = useCat(isLoadingAlbumsCat);
  const isDeleting = useCat(isDeletingAlbumCat);

  const handleNavigateToReorder = useCallback(() => {
    navigateEffect('/albums/reorder');
  }, []);

  const rightElement = useMemo(
    () => (
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <IconButton variant="ghost" mr="2">
            <RiMore2Line />
          </IconButton>
        </DropdownMenu.Trigger>

        <DropdownMenu.Content variant="soft">
          <DropdownMenu.Item onClick={handleNavigateToReorder}>
            <RiSortDesc />
            Reorder albums
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    ),
    [handleNavigateToReorder]
  );

  return (
    <PageHeader
      title="Albums"
      isLoading={isLoading || isDeleting}
      fixed
      hasBack
      right={rightElement}
    />
  );
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
