import { Button } from '@douyinfe/semi-ui';
import React from 'react';
import { BabyLink } from 'react-baby-router';
import fastMemo from 'react-fast-memo';

export const AlbumItem = fastMemo(({ album, to }) => {
  return (
    <BabyLink to={to || `/albums/details?albumId=${album.sortKey}`}>
      <Button size="small" style={{ margin: '0 0.5rem 0.5rem 0' }}>
        {album.title}
      </Button>
    </BabyLink>
  );
});
