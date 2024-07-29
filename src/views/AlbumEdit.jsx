import { IconButton } from '@radix-ui/themes';
import { RiSendPlaneLine } from '@remixicon/react';
import { useAtomValue } from 'jotai';
import React, { useEffect, useState } from 'react';
import { useParams } from 'wouter';

import { InputField } from '../shared-private/react/InputField.jsx';
import { PageHeader } from '../shared-private/react/PageHeader.jsx';
import { isUpdatingAlbumAtom, useAlbum } from '../store/album/albumAtoms';
import { updateAlbumEffect } from '../store/album/albumEffects';

export function AlbumEdit() {
  const { albumId } = useParams();
  const isUpdating = useAtomValue(isUpdatingAlbumAtom);
  const album = useAlbum(albumId);

  const [title, setTitle] = useState('');

  useEffect(() => {
    if (!album) {
      return;
    }

    setTitle(album.title);
  }, [album]);

  return (
    <>
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
                encryptedPassword: album?.encryptedPassword,
                title,
                goBack: false,
              });
            }}
            mr="2"
          >
            <RiSendPlaneLine />
          </IconButton>
        }
      />

      <InputField value={title} onChange={setTitle} />
    </>
  );
}
