import { Box, Button, Flex } from '@radix-ui/themes';
import { RiImageAddLine, RiStickyNoteLine } from '@remixicon/react';
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
import { Markdown, MarkdownEditor } from '../components/MarkdownEditor/index.jsx';
import { BadgeStyled } from '../components/NoteItem.jsx';
import { PrepareData } from '../components/PrepareData.jsx';
import { cameraTypes } from '../lib/cameraTypes.js';
import { useScrollToTop } from '../lib/useScrollToTop.js';
import { PageHeader } from '../shared/react/PageHeader.jsx';
import { navigateEffect } from '../shared/react/store/sharedEffects';
import { albumsCat, isCreatingAlbumCat, useAlbumsObject } from '../store/album/albumCats.js';
import { createAlbum } from '../store/album/albumNetwork.js';
import { isCreatingNoteCat } from '../store/note/noteCats.js';
import { createNoteEffect } from '../store/note/noteEffects';

const showEditorCat = createCat(false);
const showCameraCat = createCat(false);
export const showAlbumsSelectorCat = createCat(false);

export const NoteAdd = React.memo(({ queryParams: { cameraType } }) => {
  const load = useCallback(async () => {
    if (!cameraType) {
      showEditorCat.set(true);
    } else {
      showCameraCat.set(
        [cameraTypes.takePhoto, cameraTypes.takeVideo, cameraTypes.pickPhoto].includes(cameraType)
      );
    }
  }, [cameraType]);

  useScrollToTop();
  useResetAlbumsSelector();

  return (
    <PrepareData load={load}>
      <Header />

      <NoteView />

      <Editor />
      <AddImageWrapper cameraType={cameraType} />
    </PrepareData>
  );
});

const imagesCat = createCat([]);
const descriptionCat = createCat('');

const Header = React.memo(() => {
  const isCreating = useCat(isCreatingNoteCat);
  const images = useCat(imagesCat);
  const description = useCat(descriptionCat);
  const albumDescription = useCat(albumDescriptionCat);
  const selectedAlbumSortKeys = useCat(albumSelectedKeysCat);

  const handleSend = useCallback(async () => {
    await createNoteEffect({
      note: description,
      images,
      albumDescription,
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
  }, [albumDescription, description, images, selectedAlbumSortKeys]);

  const rightElement = useMemo(
    () => (
      <Button
        disabled={(!images?.length && !description) || isCreating}
        onClick={handleSend}
        mr="2"
      >
        Create
      </Button>
    ),
    [description, handleSend, images?.length, isCreating]
  );

  return <PageHeader title="Add note" isLoading={isCreating} fixed hasBack right={rightElement} />;
});

const NoteView = React.memo(() => {
  const images = useCat(imagesCat);
  const decription = useCat(descriptionCat);

  const handleDeleteLocalImage = useCallback(
    image => {
      imagesCat.set(images.filter(i => i.url !== image.url));
    },
    [images]
  );

  const handleShowCamera = useCallback(() => {
    showCameraCat.set(true);
  }, []);

  const handleShowEditor = useCallback(() => {
    showEditorCat.set(true);
  }, []);

  return (
    <Flex mb="2" direction="column" align="start">
      {images?.length ? (
        <>
          <Button onClick={handleShowCamera} variant="soft" size="1" mb="2">
            <RiImageAddLine /> Add more images
          </Button>
          <ImageCarousel images={images} onDeleteLocal={handleDeleteLocalImage} />
        </>
      ) : (
        <Button onClick={handleShowCamera} variant="soft">
          <RiImageAddLine /> Add images
        </Button>
      )}

      {decription ? (
        <Box onClick={handleShowEditor} my="4">
          <Markdown markdown={decription} />
        </Box>
      ) : (
        <Button onClick={handleShowEditor} variant="soft" my="4">
          <RiStickyNoteLine /> Add note
        </Button>
      )}

      <AlbumsSelector />
    </Flex>
  );
});

const Editor = React.memo(() => {
  const showEditor = useCat(showEditorCat);
  const description = useCat(descriptionCat);

  const handleClose = useCallback(() => {
    showEditorCat.set(false);
  }, []);

  if (!showEditor) {
    return null;
  }

  return (
    <FullscreenPopup onConfirm={handleClose} onClose={handleClose}>
      <MarkdownEditor autoFocus defaultText={description} onChange={descriptionCat.set} />
    </FullscreenPopup>
  );
});

const AddImageWrapper = React.memo(({ cameraType }) => {
  const handleAddImages = useCallback(newImages => {
    imagesCat.set([...imagesCat.get(), ...newImages]);
  }, []);

  useEffect(() => {}, [cameraType]);

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

export const AddAlbums = React.memo(({ onConfirm, onClose, disabled }) => {
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

    if (onConfirm) {
      await onConfirm(albumSelectedKeysCat.get());
    }

    showAlbumsSelectorCat.set(false);
  }, [albumDescription, onConfirm]);

  const handleClose = useCallback(() => {
    if (onClose) {
      onClose();
    } else {
      showAlbumsSelectorCat.set(false);
    }
  }, [onClose]);

  useEffect(() => {
    return () => {
      showAlbumsSelectorCat.reset();
    };
  }, []);

  if (!showAlbumsSelector) {
    return null;
  }

  return (
    <FullscreenPopup
      onConfirm={handleConfirm}
      onClose={handleClose}
      disabled={disabled || isAddingAlbum}
    >
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

  const handleShowSelector = useCallback(() => {
    showAlbumsSelectorCat.set(true);
  }, []);

  return (
    <Flex wrap="wrap">
      {selectedAlbums.map(album => (
        <BadgeStyled key={album.sortKey} onClick={handleShowSelector} mr="2">
          #{album.title}
        </BadgeStyled>
      ))}
      <BadgeStyled onClick={handleShowSelector} mr="2" color="orange">
        + Add album
      </BadgeStyled>
    </Flex>
  );
});
