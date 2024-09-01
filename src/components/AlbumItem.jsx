import { Button } from '@radix-ui/themes';
import React from 'react';
import { BabyLink } from 'react-baby-router';

export const AlbumItem = React.memo(({ album, to, color }) => {
  return (
    <BabyLink to={to || `/albums/details?albumId=${album.sortKey}`}>
      <Button color={color} variant="soft" size="1" mr="3" mb="2">
        {album.title}
      </Button>
    </BabyLink>
  );
});
