import { IconButton } from '@radix-ui/themes';
import { RiCheckLine } from '@remixicon/react';
import { useAtomValue } from 'jotai';
import React, { useState } from 'react';
import { useParams } from 'wouter';

import { Padding } from '../components/Padding';
import { useListener } from '../shared-private/react/hooks/useListener';
import { InputField } from '../shared-private/react/InputField';
import { PageHeader } from '../shared-private/react/PageHeader';
import { isUpdatingAlbumAtom, useAlbum } from '../store/album/albumAtoms';
import { updateAlbumEffect } from '../store/album/albumEffects';

export function AlbumEdit() {
  const { albumId } = useParams();
  const isUpdating = useAtomValue(isUpdatingAlbumAtom);
  const album = useAlbum(albumId);

  const [title, setTitle] = useState('');

  useListener(album, value => {
    if (!value) {
      return;
    }

    setTitle(value.title);
  });

  return (
    <>
      <Padding>
        <PageHeader
          title="Edit album"
          isLoading={isUpdating}
          fixed
          hasBack
          right={
            <IconButton
              disabled={!title || isUpdating}
              onClick={() => {
                updateAlbumEffect(albumId, {
                  title,
                  goBack: false,
                });
              }}
              mr="2"
            >
              <RiCheckLine />
            </IconButton>
          }
        />

        <InputField value={title} onChange={setTitle} />
      </Padding>
    </>
  );
}
