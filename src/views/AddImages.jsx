import React, { useCallback, useEffect, useRef } from 'react';
import { useCat } from 'usecat';

import { Camera } from '../components/Camera.jsx';
import { PrepareData } from '../components/PrepareData.jsx';
import { localStorageKeys } from '../lib/constants.js';
import { isIOS } from '../shared/react/device.js';
import { LocalStorage } from '../shared/react/LocalStorage.js';
import { goBack, replaceTo } from '../shared/react/my-router.jsx';
import { useScrollToTop } from '../shared/react/ScrollToTop.jsx';
import { topBannerCat } from '../shared/react/TopBanner.jsx';
import { actionTypes, dispatchAction } from '../store/allActions.js';
import { isAddingImagesCat, noteCat, useNote } from '../store/note/noteCats.js';
import { fetchNoteEffect } from '../store/note/noteEffects';

export const AddImagess = React.memo(({ queryParams: { noteId, cameraType } }) => {
  const prepareData = useCallback(async () => {
    if (noteId) {
      await fetchNoteEffect(noteId);

      const note = noteCat.get();
      if (note) {
        return;
      }
    }

    replaceTo('/notes');
  }, [noteId]);

  useScrollToTop();

  return (
    <PrepareData load={prepareData}>
      <AddImages noteId={noteId} cameraType={cameraType} />
    </PrepareData>
  );
});

export const AddImages = React.memo(({ noteId, cameraType }) => {
  const noteItem = useNote(noteId);
  const isAddingImages = useCat(isAddingImagesCat);

  const prevShowCamera = useRef();

  const handleAddImages = useCallback(async newImages => {
    dispatchAction({
      type: actionTypes.ADD_IMAGES,
      payload: { ...noteCat.get(), newImages },
    });
  }, []);

  useEffect(() => {
    if (!isIOS()) {
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
      type={cameraType}
      disabled={isAddingImages}
      onSelect={handleAddImages}
      onClose={goBack}
    />
  );
});