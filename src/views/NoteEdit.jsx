import { Box, Flex, Text } from '@radix-ui/themes';
import React, { useCallback, useEffect, useRef } from 'react';
import { createCat, useCat } from 'usecat';

import {
  albumDescriptionCat,
  albumSelectedKeysCat,
  AlbumsSelector,
} from '../components/AlbumsSelector.jsx';
import { Camera } from '../components/Camera.jsx';
import { ImageCarousel } from '../components/ImageCarousel.jsx';
import { MarkdownEditor } from '../components/MarkdownEditor/index.jsx';
import { NoteActions } from '../components/NoteActions.jsx';
import { PrepareData } from '../components/PrepareData.jsx';
import { localStorageKeys } from '../lib/constants.js';
import { debounceAndQueue } from '../lib/debounce.js';
import { addRequestToQueue } from '../lib/requestQueue.js';
import { useScrollToTop } from '../lib/useScrollToTop.js';
import { formatDateWeekTime } from '../shared/js/date.js';
import { isIOS } from '../shared/react/device.js';
import { LocalStorage } from '../shared/react/LocalStorage.js';
import { goBack, replaceTo } from '../shared/react/my-router.jsx';
import { PageHeader } from '../shared/react/PageHeader.jsx';
import { topBannerCat } from '../shared/react/TopBanner.jsx';
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
import { addImagesEffect, fetchNoteEffect, updateNoteEffect } from '../store/note/noteEffects';

const descriptionCat = createCat('');
const noteIdCat = createCat(null);
const encryptedPasswordCat = createCat('');
const showCameraCat = createCat(false);

export const NoteEdit = React.memo(({ pathParams: { noteId }, queryParams: { cameraType } }) => {
  const prepareData = useCallback(async () => {
    if (cameraType) {
      showCameraCat.set(true);
    } else {
      showCameraCat.set(false);
    }

    if (noteId) {
      noteIdCat.set(noteId);
      await fetchNoteEffect(noteId);

      const note = noteCat.get();
      if (note) {
        descriptionCat.set(note.note || '');
        encryptedPasswordCat.set(note.encryptedPassword);
        albumSelectedKeysCat.set((note.albumIds || []).map(a => a.albumId));

        return;
      }
    }

    replaceTo('/notes');
  }, [cameraType, noteId]);

  useScrollToTop();

  useEffect(() => {
    return () => {
      albumDescriptionCat.reset();
      albumSelectedKeysCat.reset();
    };
  }, []);

  return (
    <PrepareData load={prepareData}>
      <Header />

      <NoteView />

      <AddImages cameraType={cameraType} />
    </PrepareData>
  );
});

const Header = React.memo(() => {
  const isLoading = useCat(isLoadingNoteCat);
  const isCreating = useCat(isCreatingNoteCat);
  const isUpdating = useCat(isUpdatingNoteCat);
  const isDeleting = useCat(isDeletingNoteCat);
  const isAddingImages = useCat(isAddingImagesCat);
  const isDeletingImage = useCat(isDeletingImageCat);

  return (
    <PageHeader
      title="Note details"
      isLoading={
        isLoading || isAddingImages || isUpdating || isDeleting || isDeletingImage || isCreating
      }
      fixed
      hasBack
    />
  );
});

const NoteView = React.memo(() => {
  const noteId = useCat(noteIdCat);
  const noteItem = useNote(noteId);

  if (!noteItem) {
    return null;
  }

  return (
    <>
      <Flex justify="between" align="center" mb="2">
        <Text size="2" as="p" style={{ userSelect: 'none' }}>
          {formatDateWeekTime(noteItem.createdAt)}
        </Text>

        <NoteActions note={noteItem} goBackAfterDelete />
      </Flex>
      {!!noteItem.images?.length && (
        <ImageCarousel
          noteId={noteItem.sortKey}
          encryptedPassword={noteItem.encryptedPassword}
          images={noteItem.images}
        />
      )}
      <Box mb="6">
        <Editor />
      </Box>

      <AddAlbums />
    </>
  );
});

const saveDescription = async ({ noteId, description, encryptedPassword }) => {
  await updateNoteEffect(noteId, {
    encryptedPassword: encryptedPassword,
    note: description || null,
    goBack: false,
    showSuccess: false,
  });
};
const debouncedSaveDescription = debounceAndQueue(saveDescription, 500);

const Editor = React.memo(() => {
  const description = useCat(descriptionCat);

  const handleChange = useCallback(newDescription => {
    descriptionCat.set(newDescription);

    debouncedSaveDescription({
      noteId: noteIdCat.get(),
      description: newDescription,
      encryptedPassword: encryptedPasswordCat.get(),
    });
  }, []);

  return <MarkdownEditor defaultText={description} onChange={handleChange} />;
});

const saveImages = async ({ noteId, images, encryptedPassword }) => {
  await addImagesEffect(noteId, {
    encryptedPassword: encryptedPassword,
    images,
  });
};

const AddImages = React.memo(({ cameraType }) => {
  const showCamera = useCat(showCameraCat);
  const isAddingImages = useCat(isAddingImagesCat);

  const prevShowCamera = useRef();

  const handleClose = useCallback(() => {
    goBack();
  }, []);

  const handleAddImages = useCallback(async newImages => {
    const noteId = noteIdCat.get();
    const encryptedPassword = encryptedPasswordCat.get();
    if (!noteId || !encryptedPassword) {
      return;
    }
    addRequestToQueue({
      args: [{ noteId, images: newImages, encryptedPassword }],
      handler: saveImages,
    });
    goBack();
  }, []);

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

const saveAlbums = async ({ noteId, encryptedPassword, albumIds }) => {
  await updateNoteEffect(noteId, {
    encryptedPassword: encryptedPassword,
    albumIds,
    goBack: false,
  });
};

const AddAlbums = React.memo(() => {
  const handleChange = useCallback(async albumIds => {
    const noteId = noteIdCat.get();
    const encryptedPassword = encryptedPasswordCat.get();
    if (!noteId || !encryptedPassword) {
      return;
    }

    addRequestToQueue({
      args: [{ noteId, encryptedPassword, albumIds }],
      handler: saveAlbums,
    });
  }, []);

  return <AlbumsSelector onChange={handleChange} />;
});
