import { Flex, IconButton } from '@radix-ui/themes';
import { RiCropLine, RiImageAddLine, RiSquareLine } from '@remixicon/react';
import React, { useCallback, useRef } from 'react';
import styled from 'styled-components';
import { createCat, useCat } from 'usecat';

import { imageType } from '../lib/constants.js';
import { makeImageSquare } from '../lib/makeImageSquare';
import { resizeCanvas } from '../lib/resizeCanvas';
import { canvasToBlob } from '../shared-private/react/canvasToBlob.js';
import { ImageCropper } from '../shared-private/react/ImageCropper.jsx';
import { FilePicker } from './FilePicker.jsx';
import { getCameraSize, VideoWrapper } from './TakeVideo.jsx';

const CropperWrapper = styled.div`
  width: ${props => `${props.size}px`};
  height: ${props => `${props.size}px`};

  display: flex;
  align-items: center;
  justify-content: center;
`;

export const pickedPhotoCat = createCat(null);

export const PickPhoto = React.memo(({ onSelect }) => {
  const pickedPhoto = useCat(pickedPhotoCat);

  const cropperRef = useRef(null);

  const handleCrop = useCallback(async () => {
    const canvas = cropperRef.current.crop(900);
    const blob = await canvasToBlob(canvas, imageType, 0.8);
    const imageUrl = canvas.toDataURL(imageType);
    onSelect({ blob, url: imageUrl, size: blob.size, type: imageType });
    pickedPhotoCat.set(null);
  }, [onSelect]);

  const handleSquare = useCallback(async () => {
    const squareCanvas = await makeImageSquare(pickedPhoto);
    const resizedCanvas = resizeCanvas(squareCanvas, 900, 900);
    const blob = await canvasToBlob(resizedCanvas, imageType, 0.8);
    const imageUrl = resizedCanvas.toDataURL(imageType);
    onSelect({ blob, url: imageUrl, type: imageType });
    pickedPhotoCat.set(null);
  }, [onSelect, pickedPhoto]);

  const size = getCameraSize();

  return (
    <VideoWrapper>
      <CropperWrapper size={size}>
        <ImageCropper ref={cropperRef} width={size} pickedImage={pickedPhoto} />
      </CropperWrapper>

      <Flex justify="center" align="center" py="2" gap="2">
        {pickedPhoto ? (
          <>
            <IconButton size="4" onClick={handleCrop}>
              <RiCropLine />
            </IconButton>
            <IconButton size="4" onClick={handleSquare}>
              <RiSquareLine />
            </IconButton>
          </>
        ) : (
          <FilePicker
            accept="image/*"
            takePhoto={false}
            onSelect={pickedPhotoCat.set}
            height="auto"
          >
            <IconButton size="4">
              <RiImageAddLine />
            </IconButton>
          </FilePicker>
        )}
      </Flex>
    </VideoWrapper>
  );
});
