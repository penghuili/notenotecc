import { Box, CheckboxGroup, Text } from '@radix-ui/themes';
import React, { useEffect } from 'react';
import { useCat } from 'usecat';

import { InputField } from '../shared-private/react/InputField.jsx';
import { albumsCat } from '../store/album/albumCats.js';
import { fetchAlbumsEffect } from '../store/album/albumEffects';

const titleStyle = { userSelect: 'none' };
const checkboxRootStyle = {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: '0.75rem',
};

export function AlbumsSelector({ newAlbum, onNewAlbumChange, selectedAlbumSortKeys, onSelect }) {
  const albums = useCat(albumsCat);

  useEffect(() => {
    fetchAlbumsEffect();
  }, []);

  return (
    <div>
      <Text style={titleStyle}>Albums</Text>

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
            style={checkboxRootStyle}
          >
            {albums.map(album => (
              <CheckboxGroup.Item key={album.sortKey} value={album.sortKey}>
                <Text style={titleStyle}>{album.title}</Text>
              </CheckboxGroup.Item>
            ))}
          </CheckboxGroup.Root>
        </>
      )}
    </div>
  );
}
