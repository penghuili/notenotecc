import { Button } from '@radix-ui/themes';
import React, { useCallback, useMemo } from 'react';
import { createCat, useCat } from 'usecat';

import { PrepareData } from '../components/PrepareData.jsx';
import { useScrollToTop } from '../lib/useScrollToTop.js';
import { InputField } from '../shared/react/InputField.jsx';
import { PageHeader } from '../shared/react/PageHeader.jsx';
import { albumsCat, findAlbum, isUpdatingAlbumCat } from '../store/album/albumCats.js';
import { fetchAlbumsEffect, updateAlbumEffect } from '../store/album/albumEffects';

const titleCat = createCat('');
const encryptedPasswordCat = createCat('');

export const AlbumEdit = React.memo(({ pathParams: { albumId } }) => {
  const load = useCallback(async () => {
    await fetchAlbumsEffect();
    const album = findAlbum(albumsCat.get(), albumId);
    if (album) {
      titleCat.set(album.title);
      encryptedPasswordCat.set(album.encryptedPassword);
    }
  }, [albumId]);

  useScrollToTop();

  return (
    <PrepareData load={load}>
      <Header albumId={albumId} />

      <Form albumId={albumId} />
    </PrepareData>
  );
});

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
      <Button disabled={isUpdating || !hasTitle} onClick={handleSend} mr="2">
        Send
      </Button>
    ),
    [handleSend, isUpdating, hasTitle]
  );

  return <PageHeader title="Edit tag" isLoading={isUpdating} fixed hasBack right={rightElement} />;
});

const Form = React.memo(() => {
  const title = useCat(titleCat);

  const handleChange = useCallback(title => {
    titleCat.set(title);
  }, []);

  return <InputField value={title} onChange={handleChange} />;
});
