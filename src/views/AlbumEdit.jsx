import { IconButton } from '@radix-ui/themes';
import { RiSendPlaneLine } from '@remixicon/react';
import React, { useCallback, useEffect, useState } from 'react';
import { useCat } from 'usecat';
import { useParams } from 'wouter';

import { scrollToTop } from '../lib/scrollToTop.js';
import { InputField } from '../shared-private/react/InputField.jsx';
import { PageHeader } from '../shared-private/react/PageHeader.jsx';
import { isUpdatingAlbumCat, useAlbum } from '../store/album/albumCats.js';
import { updateAlbumEffect } from '../store/album/albumEffects';

export const AlbumEdit = React.memo(() => {
  const { albumId } = useParams();

  const album = useAlbum(albumId);

  const [title, setTitle] = useState('');

  useEffect(() => {
    scrollToTop();
  }, []);

  useEffect(() => {
    if (!album) {
      return;
    }

    setTitle(album.title);
  }, [album]);

  return (
    <>
      <Header albumId={albumId} title={title} encryptedPassword={album?.encryptedPassword} />

      <InputField value={title} onChange={setTitle} />
    </>
  );
});

const Header = React.memo(({ albumId, encryptedPassword, title }) => {
  const isUpdating = useCat(isUpdatingAlbumCat);

  const handleSend = useCallback(() => {
    updateAlbumEffect(albumId, {
      encryptedPassword,
      title,
      goBack: false,
    });
  }, [albumId, encryptedPassword, title]);

  return (
    <PageHeader
      title="Edit album"
      isLoading={isUpdating}
      fixed
      hasBack
      right={
        <IconButton disabled={isUpdating || !title} onClick={handleSend} mr="2">
          <RiSendPlaneLine />
        </IconButton>
      }
    />
  );
});
