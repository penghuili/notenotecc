import { Flex, IconButton, Text } from '@radix-ui/themes';
import { RiArrowLeftLine } from '@remixicon/react';
import React, { useCallback, useMemo } from 'react';
import { goBack } from 'react-baby-router';
import fastMemo from 'react-fast-memo';
import styled from 'styled-components';
import { useCat } from 'usecat';

import { imagesCat } from '../components/Camera.jsx';
import { ImageCarousel } from '../components/ImageCarousel.jsx';
import { stopPropagation } from '../lib/stopPropagation.js';
import { widthWithoutScrollbar } from '../shared/react/getScrollbarWidth.js';

const CarouselWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: ${widthWithoutScrollbar}px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: black;
`;
const CarouselContent = styled.div`
  width: 100%;
  padding: 0 0.5rem;
`;
const CarouselTop = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 0.5rem;
`;

export const PreviewImages = fastMemo(() => {
  const images = useCat(imagesCat);
  const reversedImages = useMemo(() => [...(images || [])].reverse(), [images]);

  const handleGoBack = useCallback(e => {
    e.stopPropagation();
    goBack();
  }, []);

  const handleDeleteImage = useCallback(
    hash => {
      const updated = images.filter(image => image.hash !== hash);
      imagesCat.set(updated);
    },
    [images]
  );

  return (
    <CarouselWrapper onClick={handleGoBack}>
      <CarouselTop>
        <IconButton onClick={handleGoBack}>
          <RiArrowLeftLine />
        </IconButton>
      </CarouselTop>
      <CarouselContent onClick={stopPropagation}>
        {images?.length ? (
          <ImageCarousel images={reversedImages} onDelete={handleDeleteImage} />
        ) : (
          <Flex justify="center">
            <Text style={{ color: 'white' }}>No images</Text>
          </Flex>
        )}
      </CarouselContent>
    </CarouselWrapper>
  );
});