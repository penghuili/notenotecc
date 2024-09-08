import { Flex, IconButton, SegmentedControl } from '@radix-ui/themes';
import { RiArrowLeftLine, RiPlayLine } from '@remixicon/react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { goBack } from 'react-baby-router';
import fastMemo from 'react-fast-memo';
import styled from 'styled-components';

import { cameraTypes } from '../lib/cameraTypes.js';
import { fileTypes } from '../lib/constants.js';
import { stopPropagation } from '../lib/stopPropagation.js';
import { useImageLocalUrl } from '../lib/useImageLocalUrl.js';
import { isMobileWidth } from '../shared/react/device';
import { widthWithoutScrollbar } from '../shared/react/getScrollbarWidth.js';
import { FullscreenPopup } from './FullscreenPopup.jsx';
import { ImageCarousel } from './ImageCarousel.jsx';
import { PickPhoto } from './PickPhoto.jsx';
import { TakePhoto } from './TakePhoto.jsx';
import { getCameraSize, TakeVideo } from './TakeVideo.jsx';

export const Camera = fastMemo(
  ({ type, disabled, showPreviewCarousel, onShowPreviewCaruosel, onSelect, onClose }) => {
    const [activeTab, setActiveTab] = useState(type || cameraTypes.takePhoto);
    const [images, setImages] = useState([]);
    const imagesRef = useRef([]);

    const handleAddNewImage = useCallback(
      async newImage => {
        const updated = [...images, newImage];
        setImages(updated);
        imagesRef.current = updated;
      },
      [images]
    );

    const handleAddNewImages = useCallback(
      async newImages => {
        const updated = [...images, ...newImages];
        setImages(updated);
        imagesRef.current = updated;
      },
      [images]
    );

    const handleDeleteImage = useCallback(
      hash => {
        const updated = images.filter(image => image.hash !== hash);
        setImages(updated);
        imagesRef.current = updated;
      },
      [images]
    );

    useEffect(() => {
      return () => {
        onSelect(imagesRef.current);
      };
    }, [onSelect]);

    return (
      <FullscreenPopup onBack={onClose} disabled={disabled}>
        {activeTab === cameraTypes.takePhoto && <TakePhoto onSelect={handleAddNewImage} />}

        {activeTab === cameraTypes.takeVideo && <TakeVideo onSelect={handleAddNewImage} />}

        {activeTab === cameraTypes.pickPhoto && <PickPhoto onSelect={handleAddNewImages} />}

        <SegmentedControl.Root value={activeTab} onValueChange={setActiveTab} size="1" mt="9">
          <SegmentedControl.Item value={cameraTypes.takePhoto}>PHOTO</SegmentedControl.Item>
          <SegmentedControl.Item value={cameraTypes.takeVideo}>VIDEO</SegmentedControl.Item>
          <SegmentedControl.Item value={cameraTypes.pickPhoto}>PICK</SegmentedControl.Item>
        </SegmentedControl.Root>

        {!!images?.length && (
          <ImagesPreview
            images={images}
            showPreviewCaruosel={showPreviewCarousel}
            onShowPreviewCaruosel={onShowPreviewCaruosel}
            onDelete={handleDeleteImage}
          />
        )}
      </FullscreenPopup>
    );
  }
);

const ImagesWrapper = styled.div`
  position: absolute;
  top: ${props => `calc(${props.cameraSize}px + var(--space-8) + var(--space-2) + 12px)`};
  left: ${props => `calc(50% - ${props.cameraSize / 2}px + ${isMobileWidth() ? '12px' : '0px'})`};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: var(--color-background);
`;

const PreviewImage = styled.img`
  position: relative;
  width: 80px;
  height: 80px;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
  cursor: pointer;

  border-radius: 8px;
  overflow: hidden;
  object-fit: cover;
`;
const PreviewVideo = styled.video`
  position: relative;
  width: 80px;
  height: 80px;
  border: 1px solid #ddd;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
  cursor: pointer;

  border-radius: 8px;
  overflow: hidden;
`;
const CarouselWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: ${widthWithoutScrollbar}px;
  max-width: 600px;
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

const ImagesPreview = fastMemo(
  ({ images, showPreviewCaruosel, onShowPreviewCaruosel, onDelete }) => {
    const reversedImages = useMemo(() => [...(images || [])].reverse(), [images]);

    const handleDelete = useCallback(
      hash => {
        onDelete(hash);
      },
      [onDelete]
    );

    const handleGoBack = useCallback(e => {
      e.stopPropagation();
      goBack();
    }, []);

    if (!reversedImages.length) {
      return null;
    }

    const cameraSize = getCameraSize();

    return (
      <>
        <ImagesWrapper cameraSize={cameraSize}>
          <PreviewItem image={reversedImages[0]} onClick={onShowPreviewCaruosel} />
          {reversedImages.length}
        </ImagesWrapper>

        {showPreviewCaruosel && (
          <CarouselWrapper onClick={handleGoBack}>
            <CarouselTop>
              <IconButton onClick={handleGoBack}>
                <RiArrowLeftLine />
              </IconButton>
            </CarouselTop>
            <CarouselContent onClick={stopPropagation}>
              <ImageCarousel images={reversedImages} onDelete={handleDelete} />
            </CarouselContent>
          </CarouselWrapper>
        )}
      </>
    );
  }
);

const PreviewItem = fastMemo(({ image, onClick }) => {
  const { url } = useImageLocalUrl(image.hash);
  if (!url) {
    return null;
  }

  return (
    <div onClick={onClick}>
      {(image.type === fileTypes.webp || image.type === fileTypes.jpeg) && (
        <PreviewImage src={url} />
      )}

      {(image.type === fileTypes.webm || image.type === fileTypes.mp4) && (
        <>
          <PreviewVideo src={url} controls={false} />
          <Flex justify="center" width="100%" position="absolute" top="30px">
            <IconButton size="1" variant="soft">
              <RiPlayLine />
            </IconButton>
          </Flex>
        </>
      )}
    </div>
  );
});
