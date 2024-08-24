import { Box, DropdownMenu, Flex, IconButton, Text } from '@radix-ui/themes';
import { RiMore2Line, RiSortDesc } from '@remixicon/react';
import React, { useCallback, useMemo } from 'react';
import { useCat } from 'usecat';

import { AlbumItem } from '../components/AlbumItem.jsx';
import { AddNewAlbum } from '../components/AlbumsSelector.jsx';
import { PrepareData } from '../components/PrepareData.jsx';
import { navigate, RouteLink } from '../shared/react/my-router.jsx';
import { PageEmpty } from '../shared/react/PageEmpty.jsx';
import { PageHeader } from '../shared/react/PageHeader.jsx';
import { useScrollToTop } from '../shared/react/ScrollToTop.jsx';
import { userCat } from '../shared/react/store/sharedCats.js';
import { albumsCat, isDeletingAlbumCat, isLoadingAlbumsCat } from '../store/album/albumCats.js';
import { fetchAlbumsEffect } from '../store/album/albumEffects';

async function load() {
  await fetchAlbumsEffect();
}

export const Albums = React.memo(() => {
  useScrollToTop();

  return (
    <PrepareData load={load}>
      <Header />

      <AlbumItems />

      <NotesWithoutTags />

      <Box mt="6">
        <AddNewAlbum />
      </Box>
    </PrepareData>
  );
});

const Header = React.memo(() => {
  const isLoading = useCat(isLoadingAlbumsCat);
  const isDeleting = useCat(isDeletingAlbumCat);

  const handleNavigateToReorder = useCallback(() => {
    navigate('/albums/reorder');
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
            Reorder tags
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
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

const AlbumItems = React.memo(() => {
  const albums = useCat(albumsCat);

  if (albums?.length) {
    return (
      <Flex wrap="wrap">
        {albums?.map(album => (
          <AlbumItem key={album.sortKey} album={album} />
        ))}
      </Flex>
    );
  }

  if (!albums?.length) {
    return (
      <PageEmpty>
        <Text>No tags yet.</Text>
      </PageEmpty>
    );
  }

  return null;
});

const NotesWithoutTags = React.memo(() => {
  const account = useCat(userCat);

  if (!account?.id) {
    return null;
  }

  return <RouteLink to={`/albums/album_noalbum_${account?.id}`}>Notes without tags</RouteLink>;
});
