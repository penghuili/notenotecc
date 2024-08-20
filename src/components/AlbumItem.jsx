import { Badge } from '@radix-ui/themes';
import React from 'react';

import { CustomRouteLink } from '../shared/react/my-router.jsx';

export const AlbumItem = React.memo(({ album, to, color }) => {
  return (
    <CustomRouteLink to={to || `/albums/${album.sortKey}`} mr="3" mb="2">
      <Badge color={color}>{album.title}</Badge>
    </CustomRouteLink>
  );
});
