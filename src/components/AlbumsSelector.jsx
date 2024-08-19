import { CheckboxGroup, Flex, Text } from '@radix-ui/themes';
import React, { useCallback } from 'react';
import { createCat, useCat } from 'usecat';

import { useRerenderDetector } from '../lib/useRerenderDetector.js';
import { InputField } from '../shared/react/InputField.jsx';
import { albumsCat } from '../store/album/albumCats.js';

const checkboxRootStyle = {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: '0.75rem',
};

export const albumDescriptionCat = createCat('');
export const albumSelectedKeysCat = createCat([]);

export const AlbumsSelector = React.memo(() => {
  return (
    <>
      <Flex direction="column" gap="2">
        <AlbumItems />

        <AlbumDescription />
      </Flex>
    </>
  );
});

const AlbumDescription = React.memo(() => {
  const description = useCat(albumDescriptionCat);

  useRerenderDetector('AlbumDescription', { description });

  const handleNewAlbumChange = useCallback(value => {
    albumDescriptionCat.set(value);
  }, []);

  return (
    <InputField placeholder="New album name" value={description} onChange={handleNewAlbumChange} />
  );
});

const AlbumItems = React.memo(() => {
  const albums = useCat(albumsCat);
  const selectedKeys = useCat(albumSelectedKeysCat);

  useRerenderDetector('AlbumItems', { albums, selectedKeys });

  const handleSelectedKeysChange = useCallback(value => {
    albumSelectedKeysCat.set(value);
  }, []);

  if (!albums?.length) {
    return null;
  }

  return (
    <CheckboxGroup.Root
      name="album"
      value={selectedKeys}
      onValueChange={handleSelectedKeysChange}
      style={checkboxRootStyle}
    >
      {albums.map(album => (
        <CheckboxGroup.Item key={album.sortKey} value={album.sortKey}>
          <Text>{album.title}</Text>
        </CheckboxGroup.Item>
      ))}
    </CheckboxGroup.Root>
  );
});
