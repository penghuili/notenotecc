import { Box, IconButton } from '@radix-ui/themes';
import { RiImageAddLine, RiSendPlaneLine } from '@remixicon/react';
import { useAtomValue } from 'jotai';
import React, { useState } from 'react';

import { AlbumsSelector } from '../components/AlbumsSelector';
import { Camera } from '../components/Camera';
import { ImageCarousel } from '../components/ImageCarousel';
import { AreaField } from '../shared-private/react/AreaField';
import { ItemsWrapper } from '../shared-private/react/ItemsWrapper';
import { PageHeader } from '../shared-private/react/PageHeader';
import { getQueryParams } from '../shared-private/react/routeHelpers';
import { navigateEffect } from '../shared-private/react/store/sharedEffects';
import { isCreatingNoteAtom } from '../store/note/noteAtoms';
import { createNoteEffect } from '../store/note/noteEffects';

export function NoteAdd() {
  const { image } = getQueryParams();
  const isCreating = useAtomValue(isCreatingNoteAtom);
  const [images, setImages] = useState([]);
  const [note, setNote] = useState('');
  const [selectedAlbumSortKeys, setSelectedAlbumSortKeys] = useState([]);
  const [newAlbumDescription, setNewAlbumDescription] = useState('');

  const [showCamera, setShowCamera] = useState(image !== '0');

  return (
    <>
      <PageHeader
        title="Add note"
        isLoading={isCreating}
        fixed
        hasBack
        right={
          <IconButton
            disabled={(!images?.length && !note) || isCreating}
            onClick={() => {
              createNoteEffect({
                note,
                canvases: images.map(i => i.canvas || i.blob),
                albumDescription: newAlbumDescription || undefined,
                albumIds: selectedAlbumSortKeys?.length ? selectedAlbumSortKeys : undefined,
                goBack: false,
                onSucceeded: () => {
                  setImages([]);
                  setNote('');
                  setSelectedAlbumSortKeys([]);
                  setNewAlbumDescription('');
                  navigateEffect('/');
                },
              });
            }}
            mr="2"
          >
            <RiSendPlaneLine />
          </IconButton>
        }
      />

      {!!images?.length && (
        <Box mb="2">
          <ImageCarousel
            images={images}
            onDeleteLocal={image => setImages(images.filter(i => i.url !== image.url))}
          />
        </Box>
      )}

      <ItemsWrapper>
        <IconButton size="4" onClick={() => setShowCamera(true)}>
          <RiImageAddLine />
        </IconButton>
        <AreaField value={note} onChange={setNote} />

        <AlbumsSelector
          selectedAlbumSortKeys={selectedAlbumSortKeys}
          onSelect={setSelectedAlbumSortKeys}
          newAlbum={newAlbumDescription}
          onNewAlbumChange={setNewAlbumDescription}
        />
      </ItemsWrapper>

      {showCamera && (
        <Camera
          onSelect={newImages => {
            setImages([...images, ...newImages]);
            setShowCamera(false);
          }}
          onClose={() => setShowCamera(false)}
        />
      )}
    </>
  );
}
