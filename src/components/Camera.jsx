import { Flex, IconButton, Tabs } from '@radix-ui/themes';
import { RiCameraLine, RiImageAddLine, RiPlayLine, RiVideoOnLine } from '@remixicon/react';
import React, { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';

import { cameraTypes } from '../lib/cameraTypes.js';
import { fileTypes } from '../lib/constants.js';
import { isMobileWidth } from '../shared/react/device';
import { idbStorage } from '../shared/react/indexDB.js';
import { md5 } from '../shared/react/md5';
import { FullscreenPopup } from './FullscreenPopup.jsx';
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
      const hash = await md5(newImage.blob);
      setImages([...images, { ...newImage, hash }]);

      idbStorage.setItem(hash, newImage.blob);
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

      <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Trigger value={cameraTypes.takePhoto}>
            <RiCameraLine />
          </Tabs.Trigger>
          <Tabs.Trigger value={cameraTypes.takeVideo}>
            <RiVideoOnLine />
          </Tabs.Trigger>
          <Tabs.Trigger value={cameraTypes.pickPhoto}>
            <RiImageAddLine />
          </Tabs.Trigger>
        </Tabs.List>
      </Tabs.Root>

      {!!images?.length && <ImagesPreview images={images} />}
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

const ImagesPreview = React.memo(({ images }) => {
  const reversedImages = useMemo(() => [...(images || [])].reverse(), [images]);

  if (!reversedImages.length) {
    return null;
  }

  const cameraSize = getCameraSize();

  return (
    <ImagesWrapper cameraSize={cameraSize}>
      <PreviewItem image={reversedImages[0]} />
      {reversedImages.length}
    </ImagesWrapper>
  );
});

const PreviewItem = React.memo(({ image, translateX, zIndex }) => {
  return (
    <div>
      {(image.type === fileTypes.webp || image.type === fileTypes.jpeg) && (
        <PreviewImage src={image.localUrl} translateX={translateX} zIndex={zIndex} />
      )}

      {(image.type === fileTypes.webm || image.type === fileTypes.mp4) && (
        <>
          <PreviewVideo
            src={image.localUrl}
            controls={false}
            translateX={translateX}
            zIndex={zIndex}
          />
          <Flex justify="center" width="100%" position="absolute" top="30px">
            <IconButton size="1">
              <RiPlayLine />
            </IconButton>
          </Flex>
        </>
      )}
    </div>
  );
});
