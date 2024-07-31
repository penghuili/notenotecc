import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useCat } from 'usecat';

import {
  disableBodyScroll,
  enableBodyScroll,
} from '../shared-private/react/bodySccroll';
import { fullScreenImageUrlCat } from '../store/note/noteCats';

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
  const url = useCat(fullScreenImageUrlCat);
  useEffect(() => {
    if (url) {
      disableBodyScroll();
    } else {
      enableBodyScroll();
    }
  }, [url]);

  if (!url) {
    return null;
  }

  const size = Math.min(window.innerWidth, window.innerHeight, 900);

  return (
    <FullScreenWrapper onClick={() => fullScreenImageUrlCat.set(null)}>
      <img src={url} style={{ width: size, height: size }} onClick={e => e.stopPropagation()} />
    </FullScreenWrapper>
  );
}
