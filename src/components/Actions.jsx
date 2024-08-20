import {
  RiCameraLine,
  RiImageAddLine,
  RiStickyNoteAddLine,
  RiVideoAddLine,
} from '@remixicon/react';
import React, { useCallback } from 'react';
import styled from 'styled-components';

import { cameraTypes } from '../lib/cameraTypes';
import { navigate } from '../shared/react/my-router.jsx';
import { IconButtonWithText } from './IconButtonWithText.jsx';

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
    navigate(`/notes/add?cameraType=${cameraTypes.takePhoto}`);
  }, []);

  const handleTakeVideo = useCallback(() => {
    navigate(`/notes/add?cameraType=${cameraTypes.takeVideo}`);
  }, []);

  const handlePickPhotos = useCallback(() => {
    navigate(`/notes/add?cameraType=${cameraTypes.pickPhoto}`);
  }, []);

  const handleTakeNote = useCallback(() => {
    navigate(`/notes/add?editor=1`);
  }, []);

  return (
    <Wrapper>
      <IconButtonWithText onClick={handleTakePhoto} text="Camera">
        <RiCameraLine />
      </IconButtonWithText>
      <IconButtonWithText onClick={handleTakeVideo} text="Video">
        <RiVideoAddLine />
      </IconButtonWithText>
      <IconButtonWithText onClick={handlePickPhotos} text="Photo">
        <RiImageAddLine />
      </IconButtonWithText>
      <IconButtonWithText onClick={handleTakeNote} text="Text">
        <RiStickyNoteAddLine />
      </IconButtonWithText>
    </Wrapper>
  );
});
