import { Flex, IconButton } from '@radix-ui/themes';
import { Button } from '@radix-ui/themes/dist/cjs/index.js';
import {
  RiCameraLine,
  RiCheckLine,
  RiCloseLine,
  RiImageLine,
  RiSkipDownLine,
  RiSkipUpLine,
  RiVideoOnLine,
} from '@remixicon/react';
import React, { useMemo, useState } from 'react';
import styled from 'styled-components';

import { disableBodyScroll, enableBodyScroll } from '../shared-private/react/bodySccroll';
import { useEffectOnce } from '../shared-private/react/hooks/useEffectOnce';
import { LocalImages } from './LocalImages';
import { PickPhoto } from './PickPhoto';
import { TakePhoto } from './TakePhoto';
import { TakeVideo } from './TakeVideo';

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

const types = {
  takePhoto: 'takePhoto',
  takeVideo: 'takeVideo',
  pickPhoto: 'pickPhoto',
};

export function Camera({ onSelect, onClose }) {
  const [activeTab, setActiveTab] = useState(types.takePhoto);
  const [images, setImages] = useState([]);

  useEffectOnce(() => {
    disableBodyScroll();

    return () => {
      enableBodyScroll();
    };
  });

  return (
    <Wrapper>
      <Flex justify="between" width="100%" p="2" style={{ maxWidth: '600px' }}>
        <IconButton variant="soft" onClick={onClose}>
          <RiCloseLine />
        </IconButton>

        <IconButton
          onClick={() => {
            onSelect(images);
          }}
        >
          <RiCheckLine />
        </IconButton>
      </Flex>

      {activeTab === types.takePhoto && (
        <TakePhoto
          onSelect={value => {
            setImages([...images, value]);
          }}
        />
      )}

      {activeTab === types.takeVideo && (
        <TakeVideo
          onSelect={value => {
            setImages([...images, value]);
          }}
        />
      )}

      {activeTab === types.pickPhoto && (
        <PickPhoto
          onSelect={value => {
            setImages([...images, value]);
          }}
        />
      )}

      <Flex>
        <IconButton
          radius="none"
          size="4"
          variant={activeTab === types.takePhoto ? 'solid' : 'soft'}
          onClick={() => setActiveTab(types.takePhoto)}
        >
          <RiCameraLine />
        </IconButton>
        <IconButton
          radius="none"
          size="4"
          variant={activeTab === types.takeVideo ? 'solid' : 'soft'}
          onClick={() => setActiveTab(types.takeVideo)}
        >
          <RiVideoOnLine />
        </IconButton>
        <IconButton
          radius="none"
          size="4"
          variant={activeTab === types.pickPhoto ? 'solid' : 'soft'}
          onClick={() => setActiveTab(types.pickPhoto)}
        >
          <RiImageLine />
        </IconButton>
      </Flex>

      {!!images?.length && (
        <ImagesWrapper>
          <ImagesPreview
            images={images}
            onDelete={item => setImages(images.filter(i => i.url !== item.url))}
          />
        </ImagesWrapper>
      )}
    </Wrapper>
  );
}

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
  width: 100px;
  height: 100px;
  border: 1px solid #ddd;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
  cursor: pointer;
`;
const PreviewVideo = styled.video`
  width: 100px;
  height: 100px;
  border: 1px solid #ddd;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
  cursor: pointer;
`;

function ImagesPreview({ images, onDelete }) {
  const [showImages, setShowImages] = useState(false);
  const reversedImages = useMemo(() => [...(images || [])].reverse(), [images]);

  if (!reversedImages.length) {
    return null;
  }

  return (
    <>
      <Button onClick={() => setShowImages(!showImages)} variant="ghost">
        {showImages ? <RiSkipDownLine /> : <RiSkipUpLine />} ({images.length})
      </Button>

      {showImages ? (
        <LocalImages
          images={reversedImages}
          onDelete={onDelete}
          onClick={() => setShowImages(false)}
        />
      ) : (
        <PreviewWrapper
          width={(reversedImages.length - 1) * 20 + 100}
          onClick={() => setShowImages(true)}
        >
          {reversedImages.map((image, index) => {
            const translateX = -index * 80;
            const zIndex = reversedImages.length - index;
            return image.canvas ? (
              <PreviewImage
                key={image.url}
                src={image.url}
                style={{
                  transform: `translateX(${translateX}px)`,
                  zIndex: zIndex,
                }}
              />
            ) : (
              <PreviewVideo
                key={image.url}
                src={image.url}
                controls
                style={{
                  transform: `translateX(${translateX}px)`,
                  zIndex: zIndex,
                }}
              />
            );
          })}
        </PreviewWrapper>
      )}
    </>
  );
}
