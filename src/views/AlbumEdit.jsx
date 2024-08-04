import { IconButton } from '@radix-ui/themes';
import { RiSendPlaneLine } from '@remixicon/react';
import React, { useCallback, useEffect, useMemo } from 'react';
import { createCat, useCat } from 'usecat';
import { useParams } from 'wouter';

import { useScrollToTop } from '../lib/useScrollToTop.js';
import { InputField } from '../shared-private/react/InputField.jsx';
import { PageHeader } from '../shared-private/react/PageHeader.jsx';
import { isUpdatingAlbumCat, useAlbum } from '../store/album/albumCats.js';
import { updateAlbumEffect } from '../store/album/albumEffects';

export const AlbumEdit = React.memo(() => {
  const { albumId } = useParams();

  useScrollToTop();

  return (
    <>
      <Header albumId={albumId} />

      <Form albumId={albumId} />
    </>
  );
});

const titleCat = createCat('');
const encryptedPasswordCat = createCat('');

const Header = React.memo(({ albumId }) => {
  const isUpdating = useCat(isUpdatingAlbumCat);
  const title = useCat(titleCat);
  const encryptedPassword = useCat(encryptedPasswordCat);

  const hasTitle = useMemo(() => !!title, [title]);

  const handleSend = useCallback(() => {
    updateAlbumEffect(albumId, {
      encryptedPassword,
      title,
      goBack: false,
    });
  }, [albumId, encryptedPassword, title]);

  const rightElement = useMemo(
    () => (
      <IconButton disabled={isUpdating || !hasTitle} onClick={handleSend} mr="2">
        <RiSendPlaneLine />
      </IconButton>
    ),
    [handleSend, isUpdating, hasTitle]
  );

  return (
    <PageHeader title="Edit album" isLoading={isUpdating} fixed hasBack right={rightElement} />
  );
});

const Form = React.memo(({ albumId }) => {
  const album = useAlbum(albumId);
  const title = useCat(titleCat);

  const handleChange = useCallback(title => {
    titleCat.set(title);
  }, []);

  useEffect(() => {
    if (!album) {
      return;
    }

    titleCat.set(album.title);
    encryptedPasswordCat.set(album.encryptedPassword);
  }, [album]);

  useEffect(() => {
    return () => {
      titleCat.set('');
      encryptedPasswordCat.set('');
    };
  }, []);

  return <InputField value={title} onChange={handleChange} />;
});
