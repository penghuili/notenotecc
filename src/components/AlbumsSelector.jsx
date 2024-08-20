import { Button, CheckboxGroup, Flex, Text } from '@radix-ui/themes';
import React, { useCallback } from 'react';
import { createCat, useCat } from 'usecat';

import { InputField } from '../shared/react/InputField.jsx';
import { albumsCat } from '../store/album/albumCats.js';
import { createAlbumEffect } from '../store/album/albumEffects.js';

const checkboxRootStyle = {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: '0.75rem',
};

export const albumDescriptionCat = createCat('');
export const albumSelectedKeysCat = createCat([]);

export const AlbumsSelector = React.memo(({ onChange }) => {
  return (
    <>
      <Flex direction="column" gap="4">
        <AlbumItems onChange={onChange} />

        <AlbumDescription onChange={onChange} />
      </Flex>
    </>
  );
});

const AlbumDescription = React.memo(({ onChange }) => {
  const description = useCat(albumDescriptionCat);

  const handleCreate = useCallback(async () => {
    await createAlbumEffect({
      title: description,
      onSucceeded: () => {
        onChange(albumSelectedKeysCat.get());
      },
    });
  }, [description, onChange]);

  return (
    <Flex gap="2">
      <InputField
        placeholder="New tag name"
        value={description}
        onChange={albumDescriptionCat.set}
      />
      <Button onClick={handleCreate} variant="soft">
        Add new tag
      </Button>
    </Flex>
  );
});

const AlbumItems = React.memo(({ onChange }) => {
  const albums = useCat(albumsCat);
  const selectedKeys = useCat(albumSelectedKeysCat);

  const handleSelectedKeysChange = useCallback(
    value => {
      albumSelectedKeysCat.set(value);
      onChange(albumSelectedKeysCat.get());
    },
    [onChange]
  );

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
