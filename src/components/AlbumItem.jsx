import { Badge } from '@radix-ui/themes';
import React from 'react';

import { CustomRouteLink } from '../shared/react/my-router.jsx';

export const AlbumItem = React.memo(({ album, to, color }) => {
  return (
    <CustomRouteLink to={to || `/albums/${album.sortKey}`} color={color} mr="3" mb="2">
      <Badge>{album.title}</Badge>
    </CustomRouteLink>
  );
});
