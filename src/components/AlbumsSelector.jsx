import { Button, CheckboxGroup, Flex, Heading, Text } from '@radix-ui/themes';
import React, { useCallback } from 'react';
import fastMemo from 'react-fast-memo';
import { createCat, useCat } from 'usecat';

import { generateAlbumSortKey } from '../lib/generateSortKey.js';
import { InputField } from '../shared/radix/InputField.jsx';
import { albumsCat, isCreatingAlbumCat } from '../store/album/albumCats.js';
import { actionTypes, dispatchAction } from '../store/allActions.js';

const checkboxRootStyle = {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: '0.75rem',
};

export const albumDescriptionCat = createCat('');
export const albumSelectedKeysCat = createCat([]);

export const AlbumsSelector = fastMemo(({ onChange, mt }) => {
  return (
    <>
      <Flex direction="column" gap="2" mt={mt}>
        <Heading as="h3" size="3">
          Tags
        </Heading>

        <AlbumItems onChange={onChange} />

        <AddNewAlbum onChange={onChange} />
      </Flex>
    </>
  );
});

export const AddNewAlbum = fastMemo(({ onChange }) => {
  const description = useCat(albumDescriptionCat);
  const isCreating = useCat(isCreatingAlbumCat);

  const handleCreate = useCallback(async () => {
    const timestamp = Date.now();
    const sortKey = generateAlbumSortKey(timestamp);
    dispatchAction({
      type: actionTypes.CREATE_ALBUM,
      payload: {
        sortKey,
        timestamp,
        title: description,
      },
    });
    onChange?.(albumSelectedKeysCat.get());
  }, [description, onChange]);

  return (
    <Flex gap="2" direction="column" align="start">
      <InputField
        placeholder="New tag name"
        value={description}
        onChange={albumDescriptionCat.set}
      />
      <Button onClick={handleCreate} variant="soft" disabled={!description || isCreating}>
        Add new tag
      </Button>
    </Flex>
  );
});

const AlbumItems = fastMemo(({ onChange }) => {
  const albums = useCat(albumsCat);
  const selectedKeys = useCat(albumSelectedKeysCat);

  const handleSelectedKeysChange = useCallback(
    value => {
      albumSelectedKeysCat.set(value);
      onChange?.(albumSelectedKeysCat.get());
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
