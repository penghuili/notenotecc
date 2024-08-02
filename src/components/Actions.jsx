import { IconButton } from '@radix-ui/themes';
import {
  RiCameraLine,
  RiImageAddLine,
  RiSpeakLine,
  RiStickyNoteAddLine,
  RiVideoAddLine,
} from '@remixicon/react';
import React, { useCallback } from 'react';
import styled from 'styled-components';

import { cameraTypes } from '../lib/cameraTypes';
import { navigateEffect } from '../shared-private/react/store/sharedEffects';

const Wrapper = styled.div`
  position: fixed;
  bottom: 5rem;
  left: 50%;
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

  const handleTakeAudio = useCallback(() => {
    navigateEffect(`/notes/add?cameraType=${cameraTypes.takeAudio}`);
  }, []);

  const handlePickPhoto = useCallback(() => {
    navigateEffect(`/notes/add?cameraType=${cameraTypes.pickPhoto}`);
  }, []);

  const handleTakeNote = useCallback(() => {
    navigateEffect(`/notes/add`);
  }, []);

  return (
    <Wrapper>
      <IconButton size="4" onClick={handleTakePhoto}>
        <RiCameraLine />
      </IconButton>
      <IconButton size="4" onClick={handleTakeVideo}>
        <RiVideoAddLine />
      </IconButton>
      <IconButton size="4" onClick={handleTakeAudio}>
        <RiSpeakLine />
      </IconButton>
      <IconButton size="4" onClick={handlePickPhoto}>
        <RiImageAddLine />
      </IconButton>
      <IconButton size="4" onClick={handleTakeNote}>
        <RiStickyNoteAddLine />
      </IconButton>
    </Wrapper>
  );
});
