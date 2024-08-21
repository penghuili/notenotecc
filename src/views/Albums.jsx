import { Box, DropdownMenu, Flex, IconButton, Text } from '@radix-ui/themes';
import { RiCircleLine, RiMore2Line, RiSortDesc } from '@remixicon/react';
import React, { useCallback, useMemo } from 'react';
import { useCat } from 'usecat';

import { AlbumItem } from '../components/AlbumItem.jsx';
import { AddNewAlbum } from '../components/AlbumsSelector.jsx';
import { PageEmpty } from '../components/PageEmpty.jsx';
import { PrepareData } from '../components/PrepareData.jsx';
import { useScrollToTop } from '../lib/useScrollToTop.js';
import { navigate } from '../shared/react/my-router.jsx';
import { PageHeader } from '../shared/react/PageHeader.jsx';
import { userCat } from '../shared/react/store/sharedCats.js';
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

      <Box mt="6">
        <AddNewAlbum />
      </Box>
    </PrepareData>
  );
}

const Header = React.memo(() => {
  const isLoading = useCat(isLoadingAlbumsCat);
  const isDeleting = useCat(isDeletingAlbumCat);
  const account = useCat(userCat);

  const handleNavigateToReorder = useCallback(() => {
    navigate('/albums/reorder');
  }, []);

  const handleNavigateToWithoutTags = useCallback(() => {
    const url = `/albums/album_noalbum_${account?.id}`;
    navigate(url);
  }, [account?.id]);

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
          <DropdownMenu.Item onClick={handleNavigateToWithoutTags}>
            <RiCircleLine />
            Notes without tags
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    ),
    [handleNavigateToReorder, handleNavigateToWithoutTags]
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
