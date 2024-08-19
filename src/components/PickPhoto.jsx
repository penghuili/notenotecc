import { Flex, Text } from '@radix-ui/themes';
import { RiCropLine, RiImageAddLine, RiSquareLine } from '@remixicon/react';
import React, { useCallback, useRef, useState } from 'react';
import styled from 'styled-components';
import { createCat, useCat } from 'usecat';

import { imageType } from '../lib/constants.js';
import { makeImageSquare } from '../lib/makeImageSquare';
import { resizeCanvas } from '../lib/resizeCanvas';
import { canvasToBlob } from '../shared/react/canvasToBlob.js';
import { ImageCropper } from '../shared/react/ImageCropper.jsx';
import { FilePicker } from './FilePicker.jsx';
import { IconButtonWithText } from './IconButtonWithText.jsx';
import { getCameraSize, VideoWrapper } from './TakeVideo.jsx';

const CropperWrapper = styled.div`
  width: ${props => `${props.size}px`};
  height: ${props => `${props.size}px`};

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const HelperTextWrapper = styled.div`
  position: absolute;
`;

export const pickedPhotosCat = createCat([]);

export const PickPhoto = React.memo(({ onSelect }) => {
  const pickedPhotos = useCat(pickedPhotosCat);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const cropperRef = useRef(null);

  const handleNextPhoto = useCallback(() => {
    if (currentPhotoIndex < pickedPhotos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1);
    } else {
      setCurrentPhotoIndex(0);
      pickedPhotosCat.set([]);
    }
  }, [currentPhotoIndex, pickedPhotos.length]);

  const handleCrop = useCallback(async () => {
    const canvas = cropperRef.current.crop(900);
    const blob = await canvasToBlob(canvas, imageType, 0.8);
    const imageUrl = canvas.toDataURL(imageType);
    onSelect({ blob, url: imageUrl, size: blob.size, type: imageType });

    handleNextPhoto();
  }, [handleNextPhoto, onSelect]);

  const handleSquare = useCallback(async () => {
    const squareCanvas = await makeImageSquare(pickedPhotos[currentPhotoIndex]);
    const resizedCanvas = resizeCanvas(squareCanvas, 900, 900);
    const blob = await canvasToBlob(resizedCanvas, imageType, 0.8);
    const imageUrl = resizedCanvas.toDataURL(imageType);
    onSelect({ blob, url: imageUrl, type: imageType });

    handleNextPhoto();
  }, [currentPhotoIndex, handleNextPhoto, onSelect, pickedPhotos]);

  const size = getCameraSize();

  return (
    <VideoWrapper>
      <CropperWrapper size={size}>
        <ImageCropper ref={cropperRef} width={size} pickedImage={pickedPhotos[currentPhotoIndex]} />
        {!pickedPhotos[currentPhotoIndex] && (
          <HelperTextWrapper>
            <Text>Pick a photo from your device.</Text>
          </HelperTextWrapper>
        )}
      </CropperWrapper>

      <Flex justify="center" align="center" py="2" gap="2">
        {pickedPhotos[currentPhotoIndex] ? (
          <>
            <IconButtonWithText onClick={handleCrop} text="Crop">
              <RiCropLine />
            </IconButtonWithText>
            <IconButtonWithText onClick={handleSquare} text="Square">
              <RiSquareLine />
            </IconButtonWithText>
          </>
        ) : (
          <FilePicker
            accept="image/*"
            takePhoto={false}
            multiple
            onSelect={pickedPhotosCat.set}
            height="auto"
          >
            <IconButtonWithText text="Pick">
              <RiImageAddLine />
            </IconButtonWithText>
          </FilePicker>
        )}
      </Flex>
    </VideoWrapper>
  );
});
