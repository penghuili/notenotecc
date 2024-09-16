import {
  RiCameraLine,
  RiImageAddLine,
  RiPaletteLine,
  RiStickyNoteAddLine,
  RiVideoAddLine,
} from '@remixicon/react';
import React, { useCallback } from 'react';
import { navigateTo } from 'react-baby-router';
import fastMemo from 'react-fast-memo';
import styled from 'styled-components';

import { cameraTypes } from '../lib/cameraTypes';
import { generateNoteSortKey } from '../lib/generateSortKey.js';
import { objectToQueryString } from '../shared/react/routeHelpers.js';
import { actionTypes, dispatchAction } from '../store/allActions.js';
import { noteCat } from '../store/note/noteCats.js';
import { imagesCat } from './Camera.jsx';
import { FilePicker } from './FilePicker.jsx';
import { IconButtonWithText } from './IconButtonWithText.jsx';
import { pickedPhotosCat } from './PickPhoto.jsx';
import { ProRequired } from './ProRequired.jsx';

const Wrapper = styled.div`
  position: sticky;
  top: calc(100% - 3rem);
  z-index: 1;

  display: flex;
  justify-content: center;
  gap: 0.5rem;
  height: 0;
  overflow: visible;
`;

const handleAdd = cameraType => {
  const timestamp = Date.now();
  const sortKey = generateNoteSortKey(timestamp);
  dispatchAction({
    type: actionTypes.CREATE_NOTE,
    payload: { sortKey, timestamp, note: '' },
  });

  const note = noteCat.get();
  if (note) {
    const query = objectToQueryString({ noteId: note.sortKey });
    navigateTo(`/notes/details?${query}`);
    if (cameraType) {
      requestAnimationFrame(() => {
        imagesCat.reset();
        const query = objectToQueryString({ noteId: note.sortKey, cameraType });
        navigateTo(`/add-images?${query}`);
      });
    }
  }
};

export const Actions = fastMemo(() => {
  const handleTakePhoto = useCallback(() => {
    handleAdd(cameraTypes.takePhoto);
  }, []);

  const handleTakeVideo = useCallback(() => {
    handleAdd(cameraTypes.takeVideo);
  }, []);

  const handlePickPhotos = useCallback(photos => {
    if (!photos?.length) {
      return;
    }
    pickedPhotosCat.set(Array.from(photos));
    handleAdd(cameraTypes.pickPhoto);
  }, []);

  const handleTakeNote = useCallback(() => {
    handleAdd();
  }, []);

  const handleDraw = useCallback(() => {
    handleAdd(cameraTypes.draw);
  }, []);

  return (
    <Wrapper>
      <IconButtonWithText onClick={handleTakeNote} text="Text">
        <RiStickyNoteAddLine />
      </IconButtonWithText>
      <ProRequired>
        <IconButtonWithText onClick={handleTakePhoto} text="Camera">
          <RiCameraLine />
        </IconButtonWithText>
      </ProRequired>
      <ProRequired>
        <IconButtonWithText onClick={handleTakeVideo} text="Video">
          <RiVideoAddLine />
        </IconButtonWithText>
      </ProRequired>
      <ProRequired>
        <FilePicker
          accept="image/*"
          takePhoto={false}
          multiple
          onSelect={handlePickPhotos}
          height="auto"
        >
          <IconButtonWithText text="Photo">
            <RiImageAddLine />
          </IconButtonWithText>
        </FilePicker>
      </ProRequired>
      <ProRequired>
        <IconButtonWithText onClick={handleDraw} text="Draw">
          <RiPaletteLine />
        </IconButtonWithText>
      </ProRequired>
    </Wrapper>
  );
});
