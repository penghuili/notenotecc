import React from 'react';
import styled from 'styled-components';

import { updateAtomValue, useAtomValue } from '../shared-private/react/store/atomHelpers';
import { fullScreenImageUrlAtom } from '../store/note/noteAtoms';

const FullScreenWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 3000;
  background: black;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export function FullScreenImage() {
  const url = useAtomValue(fullScreenImageUrlAtom);
  if (!url) {
    return null;
  }

  const size = Math.min(window.innerWidth, window.innerHeight, 900);

  return (
    <FullScreenWrapper onClick={() => updateAtomValue(fullScreenImageUrlAtom, null)}>
      <img src={url} style={{ width: size, height: size }} onClick={e => e.stopPropagation()} />
    </FullScreenWrapper>
  );
}
