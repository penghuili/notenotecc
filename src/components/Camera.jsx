import { Flex, IconButton, SegmentedControl, Theme } from '@radix-ui/themes';
import { RiPlayLine } from '@remixicon/react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import fastMemo from 'react-fast-memo';
import styled from 'styled-components';
import { createCat, useCat } from 'usecat';

import { cameraTypes } from '../lib/cameraTypes.js';
import { fileTypes } from '../lib/constants.js';
import { useImageLocalUrl } from '../lib/useImageLocalUrl.js';
import { isMobileWidth } from '../shared/react/device';
import { Draw } from './Draw.jsx';
import { FullscreenPopup } from './FullscreenPopup.jsx';
import { PickPhoto } from './PickPhoto.jsx';
import { TakePhoto } from './TakePhoto.jsx';
import { getCameraSize, TakeVideo } from './TakeVideo.jsx';

export const imagesCat = createCat([]);

export const Camera = fastMemo(({ type, disabled, onShowPreviewCaruosel, onSelect, onClose }) => {
  const images = useCat(imagesCat);
  const imagesRef = useRef(images);
  const [activeTab, setActiveTab] = useState(type);

  const handleAddNewImage = useCallback(
    async newImage => {
      const updated = [...images, newImage];
      imagesCat.set(updated);
    },
    [images]
  );

  const handleAddNewImages = useCallback(
    async newImages => {
      const updated = [...images, ...newImages];
      imagesCat.set(updated);
    },
    [images]
  );

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(() => {
    return () => {
      onSelect(imagesRef.current);
    };
  }, [onSelect]);

  return (
    <Theme appearance="dark">
      <FullscreenPopup onBack={onClose} disabled={disabled}>
        {activeTab === cameraTypes.takePhoto && <TakePhoto onSelect={handleAddNewImage} />}

        {activeTab === cameraTypes.takeVideo && <TakeVideo onSelect={handleAddNewImage} />}

        {activeTab === cameraTypes.pickPhoto && <PickPhoto onSelect={handleAddNewImages} />}

        {activeTab === cameraTypes.draw && <Draw onSelect={handleAddNewImage} />}

        <SegmentedControl.Root value={activeTab} onValueChange={setActiveTab} size="1" mt="9">
          <SegmentedControl.Item value={cameraTypes.takePhoto}>PHOTO</SegmentedControl.Item>
          <SegmentedControl.Item value={cameraTypes.takeVideo}>VIDEO</SegmentedControl.Item>
          <SegmentedControl.Item value={cameraTypes.pickPhoto}>PICK</SegmentedControl.Item>
          <SegmentedControl.Item value={cameraTypes.draw}>DRAW</SegmentedControl.Item>
        </SegmentedControl.Root>

        {!!images?.length && (
          <ImagesPreview images={images} onShowPreviewCaruosel={onShowPreviewCaruosel} />
        )}
      </FullscreenPopup>
    </Theme>
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

const ImagesPreview = fastMemo(({ images, onShowPreviewCaruosel }) => {
  const reversedImages = useMemo(() => [...(images || [])].reverse(), [images]);

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
    </>
  );
});

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
