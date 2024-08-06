import { Box, IconButton } from '@radix-ui/themes';
import { RiImageAddLine, RiSendPlaneLine } from '@remixicon/react';
import React, { useCallback, useMemo, useState } from 'react';
import { createCat, useCat } from 'usecat';

import { AlbumsSelector } from '../components/AlbumsSelector.jsx';
import { Camera } from '../components/Camera.jsx';
import { ImageCarousel } from '../components/ImageCarousel.jsx';
import { PrepareData } from '../components/PrepareData.jsx';
import { cameraTypes } from '../lib/cameraTypes.js';
import { AreaField } from '../shared-private/react/AreaField.jsx';
import { ItemsWrapper } from '../shared-private/react/ItemsWrapper.jsx';
import { PageHeader } from '../shared-private/react/PageHeader.jsx';
import { goBackEffect, navigateEffect } from '../shared-private/react/store/sharedEffects';
import { isCreatingNoteCat } from '../store/note/noteCats.js';
import { createNoteEffect } from '../store/note/noteEffects';

export const NoteAdd = React.memo(({ queryParams: { cameraType } }) => {
  return (
    <PrepareData>
      <Header />

      <Images />

      <Form cameraType={cameraType} />
    </PrepareData>
  );
});

const imagesCat = createCat([]);
const descriptionCat = createCat('');
const albumDescriptionCat = createCat('');
const selectedAlbumSortKeysCat = createCat([]);

const Header = React.memo(() => {
  const isCreating = useCat(isCreatingNoteCat);
  const images = useCat(imagesCat);
  const description = useCat(descriptionCat);
  const albumDescription = useCat(albumDescriptionCat);
  const selectedAlbumSortKeys = useCat(selectedAlbumSortKeysCat);

  const handleSend = useCallback(async () => {
    await createNoteEffect({
      note: description,
      images,
      albumDescription: albumDescription || undefined,
      albumIds: selectedAlbumSortKeys,
      goBack: false,
      onSucceeded: () => {
        imagesCat.reset();
        descriptionCat.reset();
        selectedAlbumSortKeysCat.reset();
        albumDescriptionCat.reset();
        navigateEffect('/');
      },
    });
  }, [albumDescription, description, images, selectedAlbumSortKeys]);

  const rightElement = useMemo(
    () => (
      <IconButton
        disabled={(!images?.length && !description) || isCreating}
        onClick={handleSend}
        mr="2"
      >
        <RiSendPlaneLine />
      </IconButton>
    ),
    [description, handleSend, images?.length, isCreating]
  );

  return <PageHeader title="Add note" isLoading={isCreating} fixed hasBack right={rightElement} />;
});

const Images = React.memo(() => {
  const images = useCat(imagesCat);

  const handleDeleteLocalImage = useCallback(
    image => {
      imagesCat.set(images.filter(i => i.url !== image.url));
    },
    [images]
  );

  if (!images?.length) {
    return null;
  }

  return (
    <Box mb="2">
      <ImageCarousel images={images} onDeleteLocal={handleDeleteLocalImage} />
    </Box>
  );
});

const Form = React.memo(({ cameraType }) => {
  const description = useCat(descriptionCat);

  const handleAlbumsChange = useCallback(({ newAlbum, selectedKeys }) => {
    if (newAlbum !== undefined) {
      albumDescriptionCat.set(newAlbum);
    }

    if (selectedKeys !== undefined) {
      selectedAlbumSortKeysCat.set(selectedKeys);
    }
  }, []);

  return (
    <ItemsWrapper>
      <AddImage cameraType={cameraType} />

      <AreaField autofocus={!cameraType} value={description} onChange={descriptionCat.set} />

      <AlbumsSelector onChange={handleAlbumsChange} />
    </ItemsWrapper>
  );
});

const AddImage = React.memo(({ cameraType }) => {
  const [showCamera, setShowCamera] = useState(
    [
      cameraTypes.takePhoto,
      cameraTypes.takeVideo,
      cameraTypes.takeAudio,
      cameraTypes.pickPhoto,
    ].includes(cameraType)
  );

  const handleShow = useCallback(() => {
    setShowCamera(true);
  }, []);

  const handleClose = useCallback(() => {
    goBackEffect();
  }, []);

  const handleAddImages = useCallback(newImages => {
    imagesCat.set([...imagesCat.get(), ...newImages]);
    setShowCamera(false);
  }, []);

  return (
    <>
      <IconButton size="4" onClick={handleShow}>
        <RiImageAddLine />
      </IconButton>

      {showCamera && <Camera type={cameraType} onSelect={handleAddImages} onClose={handleClose} />}
    </>
  );
});
