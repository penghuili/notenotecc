import { Button, CheckboxGroup, Input, Typography } from '@douyinfe/semi-ui';
import React, { useCallback, useMemo } from 'react';
import fastMemo from 'react-fast-memo';
import { createCat, useCat } from 'usecat';

import { generateAlbumSortKey } from '../lib/generateSortKey.js';
import { Flex } from '../shared/semi/Flex.jsx';
import { albumsCat, isCreatingAlbumCat } from '../store/album/albumCats.js';
import { actionTypes, dispatchAction } from '../store/allActions.js';

export const albumDescriptionCat = createCat('');
export const albumSelectedKeysCat = createCat([]);

export const AlbumsSelector = fastMemo(({ onChange }) => {
  return (
    <>
      <Flex direction="column" gap="0.5rem" m="1rem 0 0">
        <Typography.Title heading={5}>Tags</Typography.Title>

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
    <Flex gap="0.5rem" direction="column" align="start">
      <Input placeholder="New tag name" value={description} onChange={albumDescriptionCat.set} />
      <Button onClick={handleCreate} disabled={!description || isCreating}>
        Add new tag
      </Button>
    </Flex>
  );
});

const AlbumItems = fastMemo(({ onChange }) => {
  const albums = useCat(albumsCat);
  const selectedKeys = useCat(albumSelectedKeysCat);

  const options = useMemo(() => {
    return albums.map(album => {
      return {
        label: album.title,
        value: album.sortKey,
      };
    });
  }, [albums]);

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
    <CheckboxGroup
      value={selectedKeys}
      onChange={handleSelectedKeysChange}
      options={options}
      direction="horizontal"
    />
  );
});
