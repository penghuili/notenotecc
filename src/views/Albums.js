import { Box, DropdownMenu, Flex, IconButton } from '@radix-ui/themes';
import { RiDeleteBinLine, RiMore2Line, RiPencilLine } from '@remixicon/react';
import { useAtomValue } from 'jotai';
import React from 'react';

import { errorColor } from '../shared-private/react/AppWrapper';
import { useEffectOnce } from '../shared-private/react/hooks/useEffectOnce';
import { PageHeader } from '../shared-private/react/PageHeader';
import { Reorder } from '../shared-private/react/Reorder';
import { RouteLink } from '../shared-private/react/RouteLink';
import { userAtom } from '../shared-private/react/store/sharedAtoms';
import { navigateEffect } from '../shared-private/react/store/sharedEffects';
import { albumsAtom, isDeletingAlbumAtom, isLoadingAlbumsAtom } from '../store/album/albumAtoms';
import {
  deleteAlbumEffect,
  fetchAlbumsEffect,
  updateAlbumEffect,
} from '../store/album/albumEffects';

export function Albums() {
  const isLoading = useAtomValue(isLoadingAlbumsAtom);
  const isDeleting = useAtomValue(isDeletingAlbumAtom);
  const albums = useAtomValue(albumsAtom);
  const account = useAtomValue(userAtom);

  useEffectOnce(() => {
    fetchAlbumsEffect();
  });

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
