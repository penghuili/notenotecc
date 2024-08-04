import { Box, DropdownMenu, Flex, IconButton } from '@radix-ui/themes';
import { RiDeleteBinLine, RiMore2Line, RiPencilLine } from '@remixicon/react';
import React from 'react';
import { useCat } from 'usecat';

import { useScrollToTop } from '../lib/useScrollToTop.js';
import { errorColor } from '../shared-private/react/AppWrapper.jsx';
import { PageHeader } from '../shared-private/react/PageHeader.jsx';
import { Reorder } from '../shared-private/react/Reorder.jsx';
import { RouteLink } from '../shared-private/react/RouteLink.jsx';
import { userCat } from '../shared-private/react/store/sharedCats.js';
import { navigateEffect } from '../shared-private/react/store/sharedEffects';
import { albumsCat, isDeletingAlbumCat, isLoadingAlbumsCat } from '../store/album/albumCats.js';
import { deleteAlbumEffect, updateAlbumEffect } from '../store/album/albumEffects';

export function Albums() {
  const isLoading = useCat(isLoadingAlbumsCat);
  const isDeleting = useCat(isDeletingAlbumCat);
  const albums = useCat(albumsCat);
  const account = useCat(userCat);

  useScrollToTop();

  const noalbumSortKey = `album_noalbum_${account?.id}`;
  return (
    <>
      <PageHeader title="Albums" isLoading={isLoading || isDeleting} fixed hasBack />

      {!!albums?.length && (
        <Flex wrap="wrap" mb="6">
          {albums?.map(album => (
            <RouteLink key={album.sortKey} to={`/albums/${album.sortKey}`} mr="3">
              #{album.title}
            </RouteLink>
          ))}
        </Flex>
      )}

      <RouteLink to={`/albums/${noalbumSortKey}`}>Notes without album</RouteLink>

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
          renderItem={item => (
            <Flex align="center">
              {item.title}

              <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                  <IconButton radius="full" ml="2" variant="soft">
                    <RiMore2Line />
                  </IconButton>
                </DropdownMenu.Trigger>

                <DropdownMenu.Content variant="soft">
                  <DropdownMenu.Item
                    onClick={e => {
                      e.stopPropagation();
                      navigateEffect(`/albums/${item.sortKey}/edit`);
                    }}
                  >
                    <RiPencilLine />
                    Edit
                  </DropdownMenu.Item>

                  <DropdownMenu.Item
                    onClick={e => {
                      e.stopPropagation();
                      deleteAlbumEffect(item.sortKey, {});
                    }}
                    color={errorColor}
                    disabled={isDeleting}
                  >
                    <RiDeleteBinLine />
                    Delete
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            </Flex>
          )}
        />
      </Box>
    </>
  );
}
