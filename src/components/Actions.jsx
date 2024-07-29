import { IconButton } from '@radix-ui/themes';
import {
  RiCameraLine,
  RiImageAddLine,
  RiSpeakLine,
  RiStickyNoteAddLine,
  RiVideoAddLine,
} from '@remixicon/react';
import React from 'react';
import styled from 'styled-components';

import { cameraTypes } from '../lib/cameraTypes';
import { navigateEffect } from '../shared-private/react/store/sharedEffects';

const Wrapper = styled.div`
  position: fixed;
  bottom: 3rem;
  left: 50%;
  transform: translateX(-50%);

  display: flex;
  gap: 0.5rem;
`;

export function Actions() {
  return (
    <Wrapper>
      <IconButton
        size="4"
        onClick={() => {
          navigateEffect(`/notes/add?cameraType=${cameraTypes.takePhoto}`);
        }}
      >
        <RiCameraLine />
      </IconButton>
      <IconButton
        size="4"
        onClick={() => {
          navigateEffect(`/notes/add?cameraType=${cameraTypes.takeVideo}`);
        }}
      >
        <RiVideoAddLine />
      </IconButton>
      <IconButton
        size="4"
        onClick={() => {
          navigateEffect(`/notes/add?cameraType=${cameraTypes.takeAudio}`);
        }}
      >
        <RiSpeakLine />
      </IconButton>
      <IconButton
        size="4"
        onClick={() => {
          navigateEffect(`/notes/add?cameraType=${cameraTypes.pickPhoto}`);
        }}
      >
        <RiImageAddLine />
      </IconButton>
      <IconButton
        size="4"
        onClick={() => {
          navigateEffect(`/notes/add`);
        }}
      >
        <RiStickyNoteAddLine />
      </IconButton>
    </Wrapper>
  );
}