import { Box, CheckboxGroup, Text } from '@radix-ui/themes';
import React, { useCallback, useEffect } from 'react';
import { createCat, useCat } from 'usecat';

import { useRerenderDetector } from '../lib/useRerenderDetector.js';
import { InputField } from '../shared/react/InputField.jsx';
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
  return (
    <div>
      <Text style={titleStyle} weight="bold">
        Albums
      </Text>

      <AlbumDescription />

      <AlbumItems />
    </div>
  );
});

const AlbumDescription = React.memo(() => {
  const description = useCat(albumDescriptionCat);

  useRerenderDetector('AlbumDescription', { description });

  const handleNewAlbumChange = useCallback(value => {
    albumDescriptionCat.set(value);
  }, []);

  useEffect(() => {
    return () => {
      albumDescriptionCat.reset();
    };
  }, []);

  return (
    <Box p="1.5px">
      <InputField
        placeholder="New album name"
        value={description}
        onChange={handleNewAlbumChange}
      />
    </Box>
  );
});

const AlbumItems = React.memo(() => {
  const albums = useCat(albumsCat);
  const selectedKeys = useCat(albumSelectedKeysCat);

  useRerenderDetector('AlbumItems', { albums, selectedKeys });

  const handleSelectedKeysChange = useCallback(value => {
    albumSelectedKeysCat.set(value);
  }, []);

  useEffect(() => {
    return () => {
      albumSelectedKeysCat.reset();
    };
  }, []);

  if (!albums?.length) {
    return null;
  }

  return (
    <>
      <CheckboxGroup.Root
        name="album"
        value={selectedKeys}
        onValueChange={handleSelectedKeysChange}
        style={checkboxRootStyle}
        mt="2"
      >
        {albums.map(album => (
          <CheckboxGroup.Item key={album.sortKey} value={album.sortKey}>
            <Text style={titleStyle}>{album.title}</Text>
          </CheckboxGroup.Item>
        ))}
      </CheckboxGroup.Root>
    </>
  );
});
