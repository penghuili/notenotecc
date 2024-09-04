import { Button } from '@radix-ui/themes';
import React from 'react';
import { BabyLink } from 'react-baby-router';
import fastMemo from 'react-fast-memo';

export const AlbumItem = fastMemo(({ album, to, color }) => {
  return (
    <BabyLink to={to || `/albums/details?albumId=${album.sortKey}`}>
      <Button color={color} variant="soft" size="1" mr="3" mb="2">
        {album.title}
      </Button>
    </BabyLink>
  );
});
