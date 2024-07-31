import { Box, CheckboxGroup, Text } from '@radix-ui/themes';
import React, { useEffect } from 'react';

import { InputField } from '../shared-private/react/InputField.jsx';
import { useCat } from '../shared-private/react/store/cat.js';
import { albumsCat } from '../store/album/albumCats.js';
import { fetchAlbumsEffect } from '../store/album/albumEffects';

export function AlbumsSelector({ newAlbum, onNewAlbumChange, selectedAlbumSortKeys, onSelect }) {
  const albums = useCat(albumsCat);

  useEffect(() => {
    fetchAlbumsEffect();
  }, []);

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
              gap: '0.75rem',
            }}
          >
            {albums.map(album => (
              <CheckboxGroup.Item key={album.sortKey} value={album.sortKey}>
                <Text style={{ userSelect: 'none' }}>{album.title}</Text>
              </CheckboxGroup.Item>
            ))}
          </CheckboxGroup.Root>
        </>
      )}
    </div>
  );
}
