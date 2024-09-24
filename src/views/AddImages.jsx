import React, { useCallback, useEffect, useRef } from 'react';
import { goBack, navigateTo, replaceTo } from 'react-baby-router';
import fastMemo from 'react-fast-memo';
import { useCat } from 'usecat';

import { Camera } from '../components/Camera.jsx';
import { PrepareData } from '../components/PrepareData.jsx';
import { localStorageKeys } from '../lib/constants.js';
import { isIOSBrowser } from '../shared/browser/device.js';
import { LocalStorage } from '../shared/browser/LocalStorage.js';
import { PageContent } from '../shared/browser/PageContent.jsx';
import { topBannerCat } from '../shared/radix/TopBanner.jsx';
import { actionTypes, dispatchAction } from '../store/allActions.js';
import { isAddingImagesCat, noteCat, useNote } from '../store/note/noteCats.js';
import { fetchNoteEffect } from '../store/note/noteEffects';

export const AddImagess = fastMemo(({ queryParams: { noteId, cameraType } }) => {
  const prepareData = useCallback(async () => {
    if (noteId) {
      await fetchNoteEffect(noteId);

      const note = noteCat.get();
      if (note) {
        return;
      }
      replaceTo('/');
    }
  }, [noteId]);

  return (
    <PrepareData load={prepareData}>
      <PageContent>
        <AddImages noteId={noteId} cameraType={cameraType} />
      </PageContent>
    </PrepareData>
  );
});

const AddImages = fastMemo(({ noteId, cameraType }) => {
  const noteItem = useNote(noteId);
  const isAddingImages = useCat(isAddingImagesCat);

  const prevShowCamera = useRef();

  const handleAddImages = useCallback(newImages => {
    dispatchAction({
      type: actionTypes.ADD_IMAGES,
      payload: { ...noteCat.get(), newImages },
    });
  }, []);

  const handleShowPreview = useCallback(() => {
    navigateTo(`/preview-images`);
  }, []);

  useEffect(() => {
    if (!isIOSBrowser()) {
      return;
    }

    if (prevShowCamera.current && !cameraType) {
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
      prevShowCamera.current = cameraType;
    }
  }, [cameraType]);

  if (!cameraType || !noteId || noteItem?.sortKey !== noteId) {
    return null;
  }

  return (
    <Camera
      noteId={noteId}
      type={cameraType}
      disabled={isAddingImages}
      onShowPreviewCaruosel={handleShowPreview}
      onSelect={handleAddImages}
      onClose={goBack}
    />
  );
});
