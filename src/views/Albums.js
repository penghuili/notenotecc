import { Box, Flex, IconButton } from '@radix-ui/themes/dist/cjs/index.js';
import { RiDeleteBinLine } from '@remixicon/react';
import { useAtomValue } from 'jotai';
import React from 'react';

import { Padding } from '../components/Padding';
import { useEffectOnce } from '../shared-private/react/hooks/useEffectOnce';
import { PageHeader } from '../shared-private/react/PageHeader';
import { Reorder } from '../shared-private/react/Reorder';
import { RouteLink } from '../shared-private/react/RouteLink';
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

  useEffectOnce(() => {
    fetchAlbumsEffect();
  });

  return (
    <>
      <Padding>
        <PageHeader title="Albums" isLoading={isLoading || isDeleting} fixed hasBack />

        {!!albums?.length &&
          albums?.map(album => (
            <RouteLink key={album.sortKey} to={`/albums/${album.sortKey}`} mr="3">
              #{album.title}
            </RouteLink>
          ))}

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
                <IconButton
                  radius="full"
                  ml="2"
                  onClick={e => {
                    e.stopPropagation();
                    deleteAlbumEffect(item.sortKey, {});
                  }}
                >
                  <RiDeleteBinLine />
                </IconButton>
              </Flex>
            )}
          />
        </Box>
      </Padding>
    </>
  );
}
