import { Box, Button, Flex, Text } from '@radix-ui/themes';
import React, { useCallback, useEffect, useMemo } from 'react';
import { createCat, useCat } from 'usecat';

import {
  albumDescriptionCat,
  albumSelectedKeysCat,
  AlbumsSelector,
  useResetAlbumsSelector,
} from '../components/AlbumsSelector.jsx';
import { Camera } from '../components/Camera.jsx';
import { FullscreenPopup } from '../components/FullscreenPopup.jsx';
import { ImageCarousel } from '../components/ImageCarousel.jsx';
import { MarkdownEditor } from '../components/MarkdownEditor/index.jsx';
import { PrepareData } from '../components/PrepareData.jsx';
import { cameraTypes } from '../lib/cameraTypes.js';
import { useScrollToTop } from '../lib/useScrollToTop.js';
import { PageHeader } from '../shared/react/PageHeader.jsx';
import { navigateEffect } from '../shared/react/store/sharedEffects';
import { albumsCat, isCreatingAlbumCat, useAlbumsObject } from '../store/album/albumCats.js';
import { createAlbum } from '../store/album/albumNetwork.js';
import { isCreatingNoteCat } from '../store/note/noteCats.js';
import { createNoteEffect } from '../store/note/noteEffects';

export const NoteAdd = React.memo(({ queryParams: { cameraType } }) => {
  useScrollToTop();
  useResetAlbumsSelector();

  return (
    <PrepareData>
      <Header />

      <Images />

      <Form cameraType={cameraType} />

      <SelectedAlbums />
    </PrepareData>
  );
});

const imagesCat = createCat([]);
const descriptionCat = createCat('');

const Header = React.memo(() => {
  const isCreating = useCat(isCreatingNoteCat);
  const images = useCat(imagesCat);
  const description = useCat(descriptionCat);
  const selectedAlbumSortKeys = useCat(albumSelectedKeysCat);

  const handleSend = useCallback(async () => {
    await createNoteEffect({
      note: description,
      images,
      albumIds: selectedAlbumSortKeys,
      goBack: false,
      onSucceeded: () => {
        imagesCat.reset();
        descriptionCat.reset();
        albumSelectedKeysCat.reset();
        albumDescriptionCat.reset();
        navigateEffect('/');
      },
    });
  }, [description, images, selectedAlbumSortKeys]);

  const rightElement = useMemo(
    () => (
      <Button
        disabled={(!images?.length && !description) || isCreating}
        onClick={handleSend}
        mr="2"
      >
        Send
      </Button>
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

export const showCameraCat = createCat(false);
export const showAlbumsSelectorCat = createCat(false);

const Form = React.memo(({ cameraType }) => {
  const description = useCat(descriptionCat);

  const handleShowCamera = useCallback(() => {
    showCameraCat.set(true);
  }, []);

  const handleShowAlbumsSelector = useCallback(() => {
    showAlbumsSelectorCat.set(true);
  }, []);

  useEffect(() => {
    showCameraCat.set(
      [cameraTypes.takePhoto, cameraTypes.takeVideo, cameraTypes.pickPhoto].includes(cameraType)
    );
  }, [cameraType]);

  useEffect(() => {
    return () => {
      descriptionCat.reset();
      imagesCat.reset();
      showCameraCat.reset();
      showAlbumsSelectorCat.reset();
    };
  }, []);

  return (
    <>
      <MarkdownEditor
        autoFocus={!cameraType}
        defaultText={description}
        onChange={descriptionCat.set}
        onImage={handleShowCamera}
        onAlbum={handleShowAlbumsSelector}
      />

      <AddAlbums />
      <AddImageWrapper cameraType={cameraType} />
    </>
  );
});

const AddImageWrapper = React.memo(({ cameraType }) => {
  const handleAddImages = useCallback(newImages => {
    imagesCat.set([...imagesCat.get(), ...newImages]);
  }, []);

  return <AddImage cameraType={cameraType} onAdd={handleAddImages} />;
});

export const AddImage = React.memo(({ cameraType, onAdd }) => {
  const showCamera = useCat(showCameraCat);

  const handleClose = useCallback(() => {
    showCameraCat.set(false);
  }, []);

  const handleAddImages = useCallback(
    async newImages => {
      await onAdd(newImages);
      showCameraCat.set(false);
    },
    [onAdd]
  );

  useEffect(() => {
    return () => {
      showCameraCat.reset();
    };
  }, []);

  if (!showCamera) {
    return null;
  }

  return <Camera type={cameraType} onSelect={handleAddImages} onClose={handleClose} />;
});

export const AddAlbums = React.memo(() => {
  const showAlbumsSelector = useCat(showAlbumsSelectorCat);
  const albumDescription = useCat(albumDescriptionCat);
  const isAddingAlbum = useCat(isCreatingAlbumCat);

  const handleConfirm = useCallback(async () => {
    if (albumDescription) {
      isCreatingAlbumCat.set(true);

      const { data } = await createAlbum({ title: albumDescription });
      if (data) {
        albumsCat.set([...albumsCat.get(), data]);
        albumSelectedKeysCat.set([data.sortKey, ...albumSelectedKeysCat.get()]);
        albumDescriptionCat.set('');
      }

      isCreatingAlbumCat.set(false);
    }

    showAlbumsSelectorCat.set(false);
  }, [albumDescription]);

  const handleClose = useCallback(() => {
    showAlbumsSelectorCat.set(false);
  }, []);

  useEffect(() => {
    return () => {
      showAlbumsSelectorCat.reset();
    };
  }, []);

  if (!showAlbumsSelector) {
    return null;
  }

  return (
    <FullscreenPopup onConfirm={handleConfirm} onClose={handleClose} disabled={isAddingAlbum}>
      <AlbumsSelector />
    </FullscreenPopup>
  );
});

export const SelectedAlbums = React.memo(() => {
  const selectedKeys = useCat(albumSelectedKeysCat);
  const albumsObject = useAlbumsObject();

  const selectedAlbums = useMemo(() => {
    return selectedKeys.map(key => albumsObject[key]).filter(Boolean);
  }, [albumsObject, selectedKeys]);

  if (!selectedAlbums?.length) {
    return null;
  }

  return (
    <Flex wrap="wrap" mt="2">
      {selectedAlbums.map(album => (
        <Text key={album.sortKey} mr="2">
          #{album.title}
        </Text>
      ))}
    </Flex>
  );
});
