import { Box, IconButton } from '@radix-ui/themes';
import { RiImageAddLine, RiSendPlaneLine } from '@remixicon/react';
import React, { useCallback, useState } from 'react';
import { useCat } from 'usecat';

import { AlbumsSelector } from '../components/AlbumsSelector.jsx';
import { Camera } from '../components/Camera.jsx';
import { ImageCarousel } from '../components/ImageCarousel.jsx';
import { cameraTypes } from '../lib/cameraTypes.js';
import { AreaField } from '../shared-private/react/AreaField.jsx';
import { ItemsWrapper } from '../shared-private/react/ItemsWrapper.jsx';
import { PageHeader } from '../shared-private/react/PageHeader.jsx';
import { getQueryParams } from '../shared-private/react/routeHelpers';
import { goBackEffect, navigateEffect } from '../shared-private/react/store/sharedEffects';
import { isCreatingNoteCat } from '../store/note/noteCats.js';
import { createNoteEffect } from '../store/note/noteEffects';

export function NoteAdd() {
  const { cameraType } = getQueryParams();
  const isCreating = useCat(isCreatingNoteCat);

  const [images, setImages] = useState([]);
  const [note, setNote] = useState('');
  const [selectedAlbumSortKeys, setSelectedAlbumSortKeys] = useState([]);
  const [newAlbumDescription, setNewAlbumDescription] = useState('');
  const [showCamera, setShowCamera] = useState(
    [
      cameraTypes.takePhoto,
      cameraTypes.takeVideo,
      cameraTypes.takeAudio,
      cameraTypes.pickPhoto,
    ].includes(cameraType)
  );

  const handleAlbumChange = useCallback(({ newAlbum, selectedKeys }) => {
    if (newAlbum !== undefined) {
      setNewAlbumDescription(newAlbum);
    }

    if (selectedKeys !== undefined) {
      setSelectedAlbumSortKeys(selectedKeys);
    }
  }, []);

  const handleDeleteLocalImage = useCallback(
    image => {
      setImages(images.filter(i => i.url !== image.url));
    },
    [images]
  );

  const handleAddImages = useCallback(
    newImages => {
      setImages([...images, ...newImages]);
      setShowCamera(false);
    },
    [images]
  );

  const handleCloseCamera = useCallback(() => {
    goBackEffect();
  }, []);

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
            onClick={async () => {
              createNoteEffect({
                note,
                images,
                albumDescription: newAlbumDescription || undefined,
                albumIds: selectedAlbumSortKeys,
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
          <ImageCarousel images={images} onDeleteLocal={handleDeleteLocalImage} />
        </Box>
      )}

      <ItemsWrapper>
        <IconButton size="4" onClick={() => setShowCamera(true)}>
          <RiImageAddLine />
        </IconButton>
        <AreaField autofocus={!cameraType} value={note} onChange={setNote} />

        <AlbumsSelector onSelect={handleAlbumChange} />
      </ItemsWrapper>

      {showCamera && (
        <Camera type={cameraType} onSelect={handleAddImages} onClose={handleCloseCamera} />
      )}
    </>
  );
}
