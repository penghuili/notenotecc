import React, { useCallback, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { createCat, useCat } from 'usecat';

import { disableBodyScroll, enableBodyScroll } from '../shared/react/bodySccroll';

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

export const fullScreenImageUrlCat = createCat(null);

export function FullScreenImage() {
  const url = useCat(fullScreenImageUrlCat);

  const size = useMemo(() => {
    return Math.min(window.innerWidth, window.innerHeight, 900);
  }, []);

  const handleClose = useCallback(() => {
    fullScreenImageUrlCat.set(null);
  }, []);

  const handleClickImage = useCallback(e => {
    e.stopPropagation();
  }, []);

  useEffect(() => {
    if (url) {
      disableBodyScroll();
      document
        .querySelector('meta[name="viewport"]')
        .setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1.0');
    } else {
      document
        .querySelector('meta[name="viewport"]')
        .setAttribute(
          'content',
          'width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=no'
        );
      enableBodyScroll();
    }
  }, [url]);

  if (!url) {
    return null;
  }

  return (
    <FullScreenWrapper onClick={handleClose}>
      <Img src={url} size={size} onClick={handleClickImage} />
    </FullScreenWrapper>
  );
}
