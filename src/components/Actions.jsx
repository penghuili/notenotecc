import {
  RiCameraLine,
  RiImageAddLine,
  RiStickyNoteAddLine,
  RiVideoAddLine,
} from '@remixicon/react';
import React, { useCallback } from 'react';
import styled from 'styled-components';

import { cameraTypes } from '../lib/cameraTypes';
import { navigateEffect } from '../shared/react/store/sharedEffects';
import { FilePicker } from './FilePicker.jsx';
import { IconButtonWithText } from './IconButtonWithText.jsx';
import { pickedPhotosCat } from './PickPhoto.jsx';

const Wrapper = styled.div`
  position: fixed;
  bottom: 5rem;
  left: ${document.documentElement.clientWidth / 2}px;
  transform: translateX(-50%);

  display: flex;
  gap: 0.5rem;
`;

export const Actions = React.memo(() => {
  const handleTakePhoto = useCallback(() => {
    navigateEffect(`/notes/add?cameraType=${cameraTypes.takePhoto}`);
  }, []);

  const handleTakeVideo = useCallback(() => {
    navigateEffect(`/notes/add?cameraType=${cameraTypes.takeVideo}`);
  }, []);

  const handlePickPhotos = useCallback(photos => {
    if (photos) {
      pickedPhotosCat.set(photos);

      navigateEffect(`/notes/add?cameraType=${cameraTypes.pickPhoto}`);
    }
  }, []);

  const handleTakeNote = useCallback(() => {
    navigateEffect(`/notes/add?editor=1`);
  }, []);

  return (
    <Wrapper>
      <IconButtonWithText onClick={handleTakePhoto} text="Camera">
        <RiCameraLine />
      </IconButtonWithText>
      <IconButtonWithText onClick={handleTakeVideo} text="Video">
        <RiVideoAddLine />
      </IconButtonWithText>

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

      <IconButtonWithText onClick={handleTakeNote} text="Text">
        <RiStickyNoteAddLine />
      </IconButtonWithText>
    </Wrapper>
  );
});
