import { Button, Input } from '@douyinfe/semi-ui';
import React, { useCallback, useMemo } from 'react';
import fastMemo from 'react-fast-memo';
import { createCat, useCat } from 'usecat';

import { PageContent } from '../shared/browser/PageContent.jsx';
import { PageHeader } from '../shared/semi/PageHeader.jsx';
import { PrepareData } from '../shared/semi/PrepareData.jsx';
import { albumsCat, findAlbum, isUpdatingAlbumCat, useAlbum } from '../store/album/albumCats.js';
import { fetchAlbumsEffect } from '../store/album/albumEffects';
import { actionTypes, dispatchAction } from '../store/allActions.js';

const titleCat = createCat('');

export const AlbumEdit = fastMemo(({ queryParams: { albumId } }) => {
  const load = useCallback(async () => {
    await fetchAlbumsEffect();
    const album = findAlbum(albumsCat.get(), albumId);
    if (album) {
      titleCat.set(album.title);
    }
  }, [albumId]);

  return (
    <PrepareData load={load}>
      <PageContent>
        <Header albumId={albumId} />

        <Form albumId={albumId} />
      </PageContent>
    </PrepareData>
  );
});

const Header = fastMemo(({ albumId }) => {
  const isUpdating = useCat(isUpdatingAlbumCat);
  const title = useCat(titleCat);
  const album = useAlbum(albumId);

  const hasTitle = useMemo(() => !!title, [title]);

  const handleSend = useCallback(() => {
    dispatchAction({ type: actionTypes.UPDATE_ALBUM, payload: { ...album, title, goBack: true } });
  }, [album, title]);

  const rightElement = useMemo(
    () => (
      <Button
        theme="solid"
        disabled={isUpdating || !hasTitle}
        onClick={handleSend}
        style={{ marginRight: '0.5rem' }}
      >
        Send
      </Button>
    ),
    [handleSend, isUpdating, hasTitle]
  );

  return <PageHeader title="Edit tag" isLoading={isUpdating} hasBack right={rightElement} />;
});

const Form = fastMemo(() => {
  const title = useCat(titleCat);

  const handleChange = useCallback(title => {
    titleCat.set(title);
  }, []);

  return <Input value={title} onChange={handleChange} />;
});
