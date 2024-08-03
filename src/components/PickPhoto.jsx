import { Flex, IconButton } from '@radix-ui/themes';
import { RiCropLine, RiImageAddLine, RiSquareLine } from '@remixicon/react';
import React, { useCallback, useRef, useState } from 'react';
import styled from 'styled-components';

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

export const PickPhoto = React.memo(({ onSelect }) => {
  const [pickedImage, setPickedImage] = useState(null);

  const cropperRef = useRef(null);

  const handleCrop = useCallback(async () => {
    const canvas = cropperRef.current.crop(900);
    const blob = await canvasToBlob(canvas, 'image/webp', 0.8);
    const imageUrl = canvas.toDataURL('image/webp');
    onSelect({ blob, url: imageUrl, size: blob.size, type: 'image/webp' });
    setPickedImage(null);
  }, [onSelect]);

  const handleSquare = useCallback(async () => {
    const squareCanvas = await makeImageSquare(pickedImage);
    const resizedCanvas = resizeCanvas(squareCanvas, 900, 900);
    const blob = await canvasToBlob(resizedCanvas, 'image/webp', 0.8);
    const imageUrl = resizedCanvas.toDataURL('image/webp');
    onSelect({ blob, url: imageUrl, type: 'image/webp' });
    setPickedImage(null);
  }, [onSelect, pickedImage]);

  const size = getCameraSize();

  return (
    <VideoWrapper>
      <CropperWrapper size={size}>
        <ImageCropper ref={cropperRef} width={size} pickedImage={pickedImage} />
      </CropperWrapper>

      <Flex justify="center" align="center" py="2" gap="2">
        {pickedImage ? (
          <>
            <IconButton size="4" onClick={handleCrop}>
              <RiCropLine />
            </IconButton>
            <IconButton size="4" onClick={handleSquare}>
              <RiSquareLine />
            </IconButton>
          </>
        ) : (
          <FilePicker accept="image/*" takePhoto={false} onSelect={setPickedImage} height="auto">
            <IconButton size="4">
              <RiImageAddLine />
            </IconButton>
          </FilePicker>
        )}
      </Flex>
    </VideoWrapper>
  );
});
