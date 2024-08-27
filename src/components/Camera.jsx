import { Flex, IconButton, SegmentedControl } from '@radix-ui/themes';
import { RiArrowLeftLine, RiPlayLine } from '@remixicon/react';
import React, { useCallback, useMemo, useState } from 'react';
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

export const Camera = React.memo(({ type, disabled, onSelect, onClose }) => {
  const [activeTab, setActiveTab] = useState(type || cameraTypes.takePhoto);
  const [images, setImages] = useState([]);

  const handleSelect = useCallback(() => {
    onSelect(images);
  }, [images, onSelect]);

  const handleAddNewImage = useCallback(
    async newImage => {
      setImages([...images, newImage]);
    },
    [images]
  );

  const handleDeleteImage = useCallback(
    hash => {
      setImages(images.filter(image => image.hash !== hash));
    },
    [images]
  );

  return (
    <FullscreenPopup
      onConfirm={handleSelect}
      onClose={onClose}
      disabled={disabled || !images?.length}
    >
      {activeTab === cameraTypes.takePhoto && <TakePhoto onSelect={handleAddNewImage} />}

      {activeTab === cameraTypes.takeVideo && <TakeVideo onSelect={handleAddNewImage} />}

      {activeTab === cameraTypes.pickPhoto && <PickPhoto onSelect={handleAddNewImage} />}

      <SegmentedControl.Root value={activeTab} onValueChange={setActiveTab} size="1" mt="9">
        <SegmentedControl.Item value={cameraTypes.takePhoto}>PHOTO</SegmentedControl.Item>
        <SegmentedControl.Item value={cameraTypes.takeVideo}>VIDEO</SegmentedControl.Item>
        <SegmentedControl.Item value={cameraTypes.pickPhoto}>PICK</SegmentedControl.Item>
      </SegmentedControl.Root>

      {!!images?.length && <ImagesPreview images={images} onDelete={handleDeleteImage} />}
    </FullscreenPopup>
  );
});

const ImagesWrapper = styled.div`
  position: absolute;
  top: ${props => `calc(${props.cameraSize}px + var(--space-8) + var(--space-2) + 12px)`};
  left: ${props => `calc(50% - ${props.cameraSize / 2}px + ${isMobileWidth() ? '12px' : '0px'})`};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: white;
`;

const PreviewImage = styled.img`
  position: relative;
  width: 80px;
  height: 80px;
  border: 1px solid #ddd;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
  cursor: pointer;

  border-radius: 8px;
  overflow: hidden;
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
const CarouselTop = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 0.5rem;
`;

const ImagesPreview = React.memo(({ images, onDelete }) => {
  const reversedImages = useMemo(() => [...(images || [])].reverse(), [images]);

  const [showCarousel, setShowCarousel] = useState(false);

  const handleDelete = useCallback(
    hash => {
      onDelete(hash);
    },
    [onDelete]
  );
  const handleHideCarousel = useCallback(() => {
    setShowCarousel(false);
  }, []);
  const handleShowCarousel = useCallback(() => {
    setShowCarousel(true);
  }, []);

  if (!reversedImages.length) {
    return null;
  }

  const cameraSize = getCameraSize();

  return (
    <>
      <ImagesWrapper cameraSize={cameraSize}>
        <PreviewItem image={reversedImages[0]} onClick={handleShowCarousel} />
        {reversedImages.length}
      </ImagesWrapper>

      {showCarousel && (
        <CarouselWrapper onClick={handleHideCarousel}>
          <CarouselTop>
            <IconButton onClick={handleHideCarousel}>
              <RiArrowLeftLine />
            </IconButton>
          </CarouselTop>
          <div onClick={stopPropagation}>
            <ImageCarousel images={reversedImages} onDelete={handleDelete} />
          </div>
        </CarouselWrapper>
      )}
    </>
  );
});

const PreviewItem = React.memo(({ image, onClick }) => {
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
