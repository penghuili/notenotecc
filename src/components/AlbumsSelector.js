import { Box, CheckboxGroup, Text } from '@radix-ui/themes';
import { useAtomValue } from 'jotai';
import React from 'react';

import { useEffectOnce } from '../shared-private/react/hooks/useEffectOnce';
import { InputField } from '../shared-private/react/InputField';
import { albumsAtom } from '../store/album/albumAtoms';
import { fetchAlbumsEffect } from '../store/album/albumEffects';

export function AlbumsSelector({ newAlbum, onNewAlbumChange, selectedAlbumSortKeys, onSelect }) {
  const albums = useAtomValue(albumsAtom);

  useEffectOnce(fetchAlbumsEffect);

  return (
    <div>
      <Text style={{ userSelect: 'none' }}>Albums</Text>

      <Box p="1.5px">
        <InputField placeholder="New album name" value={newAlbum} onChange={onNewAlbumChange} />
      </Box>

      {!!albums?.length && (
        <>
          <Text>Existing albums</Text>
          <CheckboxGroup.Root
            name="album"
            value={selectedAlbumSortKeys}
            onValueChange={onSelect}
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
            }}
          >
            {albums.map(album => (
              <CheckboxGroup.Item key={album.sortKey} value={album.sortKey}>
                <Text mr="3" style={{ userSelect: 'none' }}>
                  {album.title}
                </Text>
              </CheckboxGroup.Item>
            ))}
          </CheckboxGroup.Root>
        </>
      )}
    </div>
  );
}
