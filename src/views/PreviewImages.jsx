import { Typography } from '@douyinfe/semi-ui';
import { RiArrowLeftLine } from '@remixicon/react';
import React, { useCallback, useMemo } from 'react';
import { goBack } from 'react-baby-router';
import fastMemo from 'react-fast-memo';
import styled from 'styled-components';
import { useCat } from 'usecat';

import { imagesCat } from '../components/Camera.jsx';
import { ImageCarousel } from '../components/ImageCarousel.jsx';
import { stopPropagation } from '../lib/stopPropagation.js';
import { widthWithoutScrollbar } from '../shared/browser/getScrollbarWidth.js';
import { Flex } from '../shared/semi/Flex.jsx';
import { IconButton } from '../shared/semi/IconButton.jsx';

const CarouselWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: ${widthWithoutScrollbar}px;
  height: 100%;
  background-color: black;
`;
const CarouselContent = styled.div`
  width: 100%;
  padding: 0 0.5rem;
`;
const CarouselTop = styled.div`
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
        <IconButton theme="borderless" icon={<RiArrowLeftLine />} onClick={handleGoBack} />
      </CarouselTop>
      <CarouselContent onClick={stopPropagation}>
        {images?.length ? (
          <ImageCarousel images={reversedImages} onDelete={handleDeleteImage} />
        ) : (
          <Flex direction="row" justify="center">
            <Typography.Text style={{ color: 'white' }}>No images</Typography.Text>
          </Flex>
        )}
      </CarouselContent>
    </CarouselWrapper>
  );
});
