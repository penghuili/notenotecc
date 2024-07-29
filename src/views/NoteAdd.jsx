import { Box, IconButton } from '@radix-ui/themes';
import { RiImageAddLine, RiSendPlaneLine } from '@remixicon/react';
import { useAtomValue } from 'jotai';
import React, { useState } from 'react';

import { AlbumsSelector } from '../components/AlbumsSelector.jsx';
import { Camera } from '../components/Camera.jsx';
import { ImageCarousel } from '../components/ImageCarousel.jsx';
import { cameraTypes } from '../lib/cameraTypes.js';
import { AreaField } from '../shared-private/react/AreaField.jsx';
import { ItemsWrapper } from '../shared-private/react/ItemsWrapper.jsx';
import { PageHeader } from '../shared-private/react/PageHeader.jsx';
import { getQueryParams } from '../shared-private/react/routeHelpers';
import { navigateEffect } from '../shared-private/react/store/sharedEffects';
import { isCreatingNoteAtom } from '../store/note/noteAtoms';
import { createNoteEffect } from '../store/note/noteEffects';

export function NoteAdd() {
  const { cameraType } = getQueryParams();
  const isCreating = useAtomValue(isCreatingNoteAtom);

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
        <AreaField autofocus={!cameraType} value={note} onChange={setNote} />

        <AlbumsSelector
          selectedAlbumSortKeys={selectedAlbumSortKeys}
          onSelect={setSelectedAlbumSortKeys}
          newAlbum={newAlbumDescription}
          onNewAlbumChange={setNewAlbumDescription}
        />
      </ItemsWrapper>

      {showCamera && (
        <Camera
          type={cameraType}
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
