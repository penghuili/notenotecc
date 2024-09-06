import {
  RiCameraLine,
  RiImageAddLine,
  RiStickyNoteAddLine,
  RiVideoAddLine,
} from '@remixicon/react';
import React, { useCallback } from 'react';
import { navigateTo } from 'react-baby-router';
import fastMemo from 'react-fast-memo';
import styled from 'styled-components';

import { cameraTypes } from '../lib/cameraTypes';
import { FilePicker } from './FilePicker.jsx';
import { IconButtonWithText } from './IconButtonWithText.jsx';
import { pickedPhotosCat } from './PickPhoto.jsx';
import { ProRequired } from './ProRequired.jsx';

const Wrapper = styled.div`
  position: fixed;
  bottom: 5rem;
  left: ${document.documentElement.clientWidth / 2}px;
  transform: translateX(-50%);

  display: flex;
  gap: 0.5rem;
`;

export const Actions = fastMemo(() => {
  const handleTakePhoto = useCallback(() => {
    navigateTo(`/notes/add?cameraType=${cameraTypes.takePhoto}`);
  }, []);

  const handleTakeVideo = useCallback(() => {
    navigateTo(`/notes/add?cameraType=${cameraTypes.takeVideo}`);
  }, []);

  const handlePickPhotos = useCallback(photos => {
    if (!photos?.length) {
      return;
    }
    pickedPhotosCat.set(Array.from(photos));
    navigateTo(`/notes/add?cameraType=${cameraTypes.pickPhoto}`);
  }, []);

  const handleTakeNote = useCallback(() => {
    navigateTo(`/notes/add`);
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
    </Wrapper>
  );
});
