import { Button, Flex, IconButton, Tabs } from '@radix-ui/themes';
import {
  RiCameraLine,
  RiCheckLine,
  RiCloseLine,
  RiImageLine,
  RiSkipDownLine,
  RiSkipUpLine,
  RiVideoOnLine,
} from '@remixicon/react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

import { cameraTypes } from '../lib/cameraTypes.js';
import { fileTypes } from '../lib/constants.js';
import { disableBodyScroll, enableBodyScroll } from '../shared-private/react/bodySccroll';
import { ImageCarousel } from './ImageCarousel.jsx';
import { PickPhoto } from './PickPhoto.jsx';
import { TakePhoto } from './TakePhoto.jsx';
import { TakeVideo } from './TakeVideo.jsx';

const Wrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 3000;
  background-color: white;

  display: flex;
  flex-direction: column;
  align-items: center;
`;
const Top = styled(Flex)`
  max-width: 600px;
`;

export const Camera = React.memo(({ type, onSelect, onClose }) => {
  const [activeTab, setActiveTab] = useState(type || cameraTypes.takePhoto);
  const [images, setImages] = useState([]);

  const handleSelect = useCallback(() => {
    onSelect(images);
  }, [images, onSelect]);

  const handleAddNewImage = useCallback(
    newImage => {
      setImages([...images, newImage]);
    },
    [images]
  );

  const handleDeleteImage = useCallback(
    image => {
      setImages(images.filter(i => i.url !== image.url));
    },
    [images]
  );

  useEffect(() => {
    disableBodyScroll();

    return () => {
      enableBodyScroll();
    };
  }, []);

  return (
    <Wrapper>
      <Top justify="between" width="100%" p="2">
        <IconButton variant="soft" onClick={onClose}>
          <RiCloseLine />
        </IconButton>

        <IconButton onClick={handleSelect} disabled={!images?.length}>
          <RiCheckLine />
        </IconButton>
      </Top>

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
            <RiImageLine />
          </Tabs.Trigger>
        </Tabs.List>
      </Tabs.Root>

      {!!images?.length && <ImagesPreview images={images} onDelete={handleDeleteImage} />}
    </Wrapper>
  );
});

const ImagesWrapper = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  background-color: white;
`;
const PreviewWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: flex-end;
  width: ${props => `${props.width}px`};
`;
const PreviewImage = styled.img`
  position: relative;
  width: 100px;
  height: 100px;
  border: 1px solid #ddd;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
  cursor: pointer;

  transform: ${props => `translateX(${props.translateX}px)`};
  z-index: ${props => `${props.zIndex}`};
`;
const PreviewVideo = styled.video`
  position: relative;
  width: 100px;
  height: 100px;
  border: 1px solid #ddd;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
  cursor: pointer;

  transform: ${props => `translateX(${props.translateX}px)`};
  z-index: ${props => `${props.zIndex}`};
`;
const AudioWrapper = styled.div`
  position: relative;
  width: 100px;
  height: 100px;
  border: 1px solid #ddd;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
  cursor: pointer;

  display: flex;
  justify-content: center;
  align-items: center;

  transform: ${props => `translateX(${props.translateX}px)`};
  z-index: ${props => `${props.zIndex}`};
`;
const PreviewAudio = styled.audio`
  width: 100%;
`;

const ImagesPreview = React.memo(({ images, onDelete }) => {
  const [showImages, setShowImages] = useState(false);
  const reversedImages = useMemo(() => [...(images || [])].reverse(), [images]);

  const handleDeleteLocalImage = useCallback(
    image => {
      onDelete(image);
    },
    [onDelete]
  );

  const handleToggleImages = useCallback(() => {
    setShowImages(!showImages);
  }, [showImages]);

  if (!reversedImages.length) {
    return null;
  }

  return (
    <ImagesWrapper>
      <Button onClick={handleToggleImages} variant="ghost">
        {showImages ? <RiSkipDownLine /> : <RiSkipUpLine />} ({images.length})
      </Button>

      {showImages ? (
        <ImageCarousel images={reversedImages} onDeleteLocal={handleDeleteLocalImage} />
      ) : (
        <PreviewWrapper
          width={(reversedImages.length - 1) * 20 + 100}
          onClick={() => setShowImages(true)}
        >
          {reversedImages.map((image, index) => {
            const translateX = -index * 80;
            const zIndex = reversedImages.length - index;
            return (
              <PreviewItem key={image.url} image={image} translateX={translateX} zIndex={zIndex} />
            );
          })}
        </PreviewWrapper>
      )}
    </ImagesWrapper>
  );
});

const PreviewItem = React.memo(({ image, translateX, zIndex }) => {
  return (
    <div>
      {image.type === fileTypes.webp && (
        <PreviewImage src={image.url} translateX={translateX} zIndex={zIndex} />
      )}

      {image.type === fileTypes.webm ||
        (image.type === fileTypes.mp4 && (
          <PreviewVideo src={image.url} controls translateX={translateX} zIndex={zIndex} />
        ))}

      {image.type === fileTypes.audio && (
        <AudioWrapper translateX={translateX} zIndex={zIndex}>
          <PreviewAudio src={image.url} controls />
        </AudioWrapper>
      )}
    </div>
  );
});
