import React, { useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { createCat, useCat } from 'usecat';

import { disableBodyScroll, enableBodyScroll } from '../shared/react/bodySccroll';
import { SquareImage } from './MediaItem.jsx';

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

const ImageWrapper = styled.div`
  position: relative;
  aspect-ratio: 1 / 1;
  width: 100%;
  max-width: 900px;
`;

export const fullScreenImageUrlCat = createCat(null);

export function FullScreenImage() {
  const url = useCat(fullScreenImageUrlCat);

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
        .setAttribute('content', 'width=device-width, initial-scale=1');
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
      <ImageWrapper>
        <SquareImage url={url} onClick={handleClickImage} />
      </ImageWrapper>
    </FullScreenWrapper>
  );
}
