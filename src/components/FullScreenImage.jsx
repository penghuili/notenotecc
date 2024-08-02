import React, { useCallback, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { useCat } from 'usecat';

import { disableBodyScroll, enableBodyScroll } from '../shared-private/react/bodySccroll';
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

const Img = styled.img`
  width: ${props => `${props.size}px`};
  height: ${props => `${props.size}px`};
`;

export function FullScreenImage() {
  const url = useCat(fullScreenImageUrlCat);

  const size = useMemo(() => {
    return Math.min(window.innerWidth, window.innerHeight, 900);
  }, []);

  const handleClose = useCallback(() => {
    fullScreenImageUrlCat.set(null);
  }, []);

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

  return (
    <FullScreenWrapper onClick={handleClose}>
      <Img src={url} size={size} onClick={e => e.stopPropagation()} />
    </FullScreenWrapper>
  );
}
