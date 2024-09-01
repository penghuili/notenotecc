import { Badge } from '@radix-ui/themes';
import React from 'react';
import { BabyLink } from 'react-baby-router';

export const AlbumItem = React.memo(({ album, to, color }) => {
  return (
    <BabyLink to={to || `/albums/details?albumId=${album.sortKey}`}>
      <Badge color={color} mr="3" mb="2">
        {album.title}
      </Badge>
    </BabyLink>
  );
});
