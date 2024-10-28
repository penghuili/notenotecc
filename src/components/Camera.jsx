import { Radio, RadioGroup } from '@douyinfe/semi-ui';
import { RiPlayLine } from '@remixicon/react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import fastMemo from 'react-fast-memo';
import styled from 'styled-components';
import { createCat, useCat } from 'usecat';

import { cameraTypes } from '../lib/cameraTypes.js';
import { fileTypes } from '../lib/constants.js';
import { useImageLocalUrl } from '../lib/useImageLocalUrl.js';
import { isMobileWidth } from '../shared/browser/device';
import { Flex } from '../shared/semi/Flex.jsx';
import { IconButton } from '../shared/semi/IconButton.jsx';
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
    <FullscreenPopup alwaysDark onBack={onClose} disabled={disabled}>
      {activeTab === cameraTypes.takePhoto && <TakePhoto onSelect={handleAddNewImage} />}

      {activeTab === cameraTypes.takeVideo && <TakeVideo onSelect={handleAddNewImage} />}

      {activeTab === cameraTypes.pickPhoto && <PickPhoto onSelect={handleAddNewImages} />}

      {activeTab === cameraTypes.draw && <Draw onSelect={handleAddNewImage} />}

      <RadioGroup
        type="button"
        buttonSize="small"
        value={activeTab}
        onChange={e => {
          setActiveTab(e.target.value);
        }}
        style={{ marginTop: '4rem' }}
      >
        <Radio value={cameraTypes.takePhoto}>PHOTO</Radio>
        <Radio value={cameraTypes.takeVideo}>VIDEO</Radio>
        <Radio value={cameraTypes.pickPhoto}>PICK</Radio>
        <Radio value={cameraTypes.draw}>DRAW</Radio>
      </RadioGroup>

      {!!images?.length && (
        <ImagesPreview images={images} onShowPreviewCaruosel={onShowPreviewCaruosel} />
      )}
    </FullscreenPopup>
  );
});

const ImagesWrapper = styled.div`
  position: absolute;
  top: ${props => `calc(${props.cameraSize}px + 3.5rem + 12px)`};
  left: ${props => `calc(50% - ${props.cameraSize / 2}px + ${isMobileWidth() ? '12px' : '0px'})`};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: var(--semi-color-bg-0);
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
          <Flex
            justify="center"
            style={{
              width: '100%',
              position: 'absolute',
              top: '30px',
            }}
          >
            <IconButton size={24} icon={<RiPlayLine size={16} />} />
          </Flex>
        </>
      )}
    </div>
  );
});
