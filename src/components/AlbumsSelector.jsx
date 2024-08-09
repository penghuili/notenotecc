import { Box, CheckboxGroup, Text } from '@radix-ui/themes';
import React, { useCallback } from 'react';
import { createCat, useCat } from 'usecat';

import { useRerenderDetector } from '../lib/useRerenderDetector.js';
import { InputField } from '../shared-private/react/InputField.jsx';
import { albumsCat } from '../store/album/albumCats.js';

const titleStyle = { userSelect: 'none' };
const checkboxRootStyle = {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: '0.75rem',
};

export const albumDescriptionCat = createCat('');
export const albumSelectedKeysCat = createCat([]);

export const AlbumsSelector = React.memo(() => {
  const description = useCat(albumDescriptionCat);
  const selectedKeys = useCat(albumSelectedKeysCat);

  const albums = useCat(albumsCat);

  useRerenderDetector('AlbumsSelector', {
    description,
    selectedKeys,
    albums,
  });

  const handleNewAlbumChange = useCallback(value => {
    albumDescriptionCat.set(value);
  }, []);
  const handleSelectedKeysChange = useCallback(value => {
    albumSelectedKeysCat.set(value);
  }, []);

  return (
    <div>
      <Text style={titleStyle}>Albums</Text>

      <Box p="1.5px">
        <InputField
          placeholder="New album name"
          value={description}
          onChange={handleNewAlbumChange}
        />
      </Box>

      {!!albums?.length && (
        <>
          <Text>Existing albums</Text>
          <CheckboxGroup.Root
            name="album"
            value={selectedKeys}
            onValueChange={handleSelectedKeysChange}
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
});
