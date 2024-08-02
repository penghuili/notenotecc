import { Box, CheckboxGroup, Text } from '@radix-ui/themes';
import React, { useCallback, useEffect, useState } from 'react';
import { useCat } from 'usecat';

import { checkRerender } from '../lib/checkRerender.js';
import { InputField } from '../shared-private/react/InputField.jsx';
import { albumsCat } from '../store/album/albumCats.js';

const titleStyle = { userSelect: 'none' };
const checkboxRootStyle = {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: '0.75rem',
};

export const AlbumsSelector = React.memo(({ currentSelectedKeys, onChange }) => {
  checkRerender('AlbumsSelector');

  const [newAlbum, setNewAlbum] = useState('');
  const [selectedKeys, setSelectedKeys] = useState([]);

  const albums = useCat(albumsCat);

  const handleNewAlbumChange = useCallback(
    value => {
      setNewAlbum(value);
      onChange({ newAlbum: value });
    },
    [onChange]
  );
  const handleSelectedKeysChange = useCallback(
    value => {
      setSelectedKeys(value);
      onChange({ selectedKeys: value });
    },
    [onChange]
  );

  useEffect(() => {
    setSelectedKeys((currentSelectedKeys || '').split('/'));
  }, [currentSelectedKeys]);

  return (
    <div>
      <Text style={titleStyle}>Albums</Text>

      <Box p="1.5px">
        <InputField placeholder="New album name" value={newAlbum} onChange={handleNewAlbumChange} />
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
