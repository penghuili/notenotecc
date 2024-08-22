import { Flex, Text } from '@radix-ui/themes';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { createCat, useCat } from 'usecat';

import { AlbumItem } from '../components/AlbumItem.jsx';
import { albumSelectedKeysCat, AlbumsSelector } from '../components/AlbumsSelector.jsx';
import { Camera } from '../components/Camera.jsx';
import { ImageCarousel } from '../components/ImageCarousel.jsx';
import { MarkdownEditor } from '../components/MarkdownEditor/index.jsx';
import { NoteActions } from '../components/NoteActions.jsx';
import { PrepareData } from '../components/PrepareData.jsx';
import { localStorageKeys } from '../lib/constants.js';
import { debounceAndQueue } from '../lib/debounce.js';
import { useGetNoteAlbums } from '../lib/useGetNoteAlbums.js';
import { useScrollToTop } from '../lib/useScrollToTop.js';
import { formatDateWeekTime } from '../shared/js/date.js';
import { isIOS } from '../shared/react/device.js';
import { LocalStorage } from '../shared/react/LocalStorage.js';
import { goBack, replaceTo } from '../shared/react/my-router.jsx';
import { PageHeader } from '../shared/react/PageHeader.jsx';
import { topBannerCat } from '../shared/react/TopBanner.jsx';
import { actionTypes, dispatchAction } from '../store/allActions.js';
import {
  isAddingImagesCat,
  isCreatingNoteCat,
  isDeletingImageCat,
  isDeletingNoteCat,
  isLoadingNoteCat,
  isUpdatingNoteCat,
  noteCat,
  useNote,
} from '../store/note/noteCats.js';
import { fetchNoteEffect } from '../store/note/noteEffects';

const descriptionCat = createCat('');
const showCameraCat = createCat(false);

export const NoteEdit = React.memo(
  ({ pathParams: { noteId }, queryParams: { cameraType, add } }) => {
    const prepareData = useCallback(async () => {
      showCameraCat.set(!!cameraType);

      if (noteId) {
        await fetchNoteEffect(noteId);

        const note = noteCat.get();
        if (note) {
          descriptionCat.set(note.note || '');
          albumSelectedKeysCat.set(note.albumIds || []);

          return;
        }
      }

      replaceTo('/notes');
    }, [cameraType, noteId]);

    useScrollToTop();

    return (
      <PrepareData load={prepareData}>
        <Header noteId={noteId} />

        <NoteView noteId={noteId} isAddingNote={!cameraType && !!add} />

        <AddImages noteId={noteId} cameraType={cameraType} />
      </PrepareData>
    );
  }
);

const Header = React.memo(({ noteId }) => {
  const isLoading = useCat(isLoadingNoteCat);
  const isCreating = useCat(isCreatingNoteCat);
  const isUpdating = useCat(isUpdatingNoteCat);
  const isDeleting = useCat(isDeletingNoteCat);
  const isAddingImages = useCat(isAddingImagesCat);
  const isDeletingImage = useCat(isDeletingImageCat);
  const noteItem = useNote(noteId);

  const rightElement = useMemo(() => !!noteItem && <NoteActions note={noteItem} />, [noteItem]);

  return (
    <PageHeader
      title="Note details"
      isLoading={
        isLoading || isAddingImages || isUpdating || isDeleting || isDeletingImage || isCreating
      }
      fixed
      hasBack
      right={rightElement}
    />
  );
});

const NoteView = React.memo(({ noteId, isAddingNote }) => {
  const noteItem = useNote(noteId);
  const getNoteAlbums = useGetNoteAlbums();

  const handleDeleteImage = useCallback(
    imagePath => {
      dispatchAction({
        type: actionTypes.DELETE_IMAGE,
        payload: { ...noteItem, imagePath },
      });
    },
    [noteItem]
  );

  const albumsElement = useMemo(() => {
    const albums = getNoteAlbums(noteItem);
    if (!albums?.length) {
      return null;
    }

    return (
      <Flex wrap="wrap" mt="2">
        {albums.map(album => (
          <AlbumItem key={album.sortKey} album={album} to={`/albums/${album.sortKey}`} />
        ))}
      </Flex>
    );
  }, [getNoteAlbums, noteItem]);

  if (!noteItem) {
    return null;
  }

  return (
    <>
      <Flex justify="between" align="center" mb="2">
        <Text size="2" as="p" style={{ userSelect: 'none' }}>
          {formatDateWeekTime(noteItem.createdAt)}
        </Text>
      </Flex>
      {!!noteItem.images?.length && (
        <ImageCarousel
          noteId={noteItem.sortKey}
          encryptedPassword={noteItem.encryptedPassword}
          images={noteItem.images}
          onDelete={handleDeleteImage}
        />
      )}
      <Editor noteId={noteId} autoFocus={isAddingNote} />

      {albumsElement}

      <AddAlbums noteId={noteId} />
    </>
  );
});

const saveDescription = async newNote => {
  dispatchAction({
    type: actionTypes.UPDATE_NOTE,
    payload: newNote,
  });
};
const debouncedSaveDescription = debounceAndQueue(saveDescription, 500);

const Editor = React.memo(({ noteId, autoFocus }) => {
  const noteItem = useNote(noteId);
  const description = useCat(descriptionCat);

  const handleChange = useCallback(
    newDescription => {
      descriptionCat.set(newDescription);

      debouncedSaveDescription({
        ...noteItem,
        note: newDescription,
      });
    },
    [noteItem]
  );

  return <MarkdownEditor autoFocus={autoFocus} defaultText={description} onChange={handleChange} />;
});

const AddImages = React.memo(({ noteId, cameraType }) => {
  const noteItem = useNote(noteId);
  const showCamera = useCat(showCameraCat);
  const isAddingImages = useCat(isAddingImagesCat);

  const prevShowCamera = useRef();

  const handleClose = useCallback(() => {
    goBack();
  }, []);

  const handleAddImages = useCallback(
    async newImages => {
      dispatchAction({
        type: actionTypes.ADD_IMAGES,
        payload: { ...noteItem, newImages },
      });

      goBack();
    },
    [noteItem]
  );

  useEffect(() => {
    if (!isIOS()) {
      return;
    }

    if (prevShowCamera.current && !showCamera) {
      const prevTimestamp = LocalStorage.get(localStorageKeys.showIOSCameraBanner);
      if (
        !prevTimestamp ||
        prevTimestamp.timestamp <
          Date.now() - Math.min(prevTimestamp.times * 2, 90) * 24 * 60 * 60 * 1000
      ) {
        topBannerCat.set({
          message:
            'Your iPhone may shows that notenote.cc is still recording, but it isn’t. iOS browsers have limitations.',
          buttonText: 'Close',
        });

        LocalStorage.set(localStorageKeys.showIOSCameraBanner, {
          timestamp: Date.now(),
          times: (prevTimestamp?.times || 0) + 1,
        });
      }
    } else {
      prevShowCamera.current = showCamera;
    }
  }, [showCamera]);

  if (!showCamera) {
    return null;
  }

  return (
    <Camera
      type={cameraType}
      disabled={isAddingImages}
      onSelect={handleAddImages}
      onClose={handleClose}
    />
  );
});

const AddAlbums = React.memo(({ noteId }) => {
  const noteItem = useNote(noteId);

  const handleChange = useCallback(
    async albumIds => {
      const encryptedPassword = noteItem?.encryptedPassword;
      if (!noteId || !encryptedPassword) {
        return;
      }

      dispatchAction({
        type: actionTypes.UPDATE_NOTE,
        payload: {
          ...noteItem,
          albumIds,
        },
      });
    },
    [noteId, noteItem]
  );

  return <AlbumsSelector onChange={handleChange} mt="6" />;
});
