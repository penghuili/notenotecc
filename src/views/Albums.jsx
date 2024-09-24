import { Box, DropdownMenu, Flex, IconButton, Text } from '@radix-ui/themes';
import { RiMore2Line, RiSortDesc } from '@remixicon/react';
import React, { useCallback, useMemo } from 'react';
import { navigateTo } from 'react-baby-router';
import fastMemo from 'react-fast-memo';
import { useCat } from 'usecat';

import { AlbumItem } from '../components/AlbumItem.jsx';
import { AddNewAlbum } from '../components/AlbumsSelector.jsx';
import { PrepareData } from '../components/PrepareData.jsx';
import { PageContent } from '../shared/browser/PageContent.jsx';
import { userCat } from '../shared/browser/store/sharedCats.js';
import { PageEmpty } from '../shared/radix/PageEmpty.jsx';
import { PageHeader } from '../shared/radix/PageHeader.jsx';
import { RouteLink } from '../shared/radix/RouteLink.jsx';
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

        <Box mt="6">
          <AddNewAlbum />
        </Box>
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

const AlbumItems = fastMemo(() => {
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
