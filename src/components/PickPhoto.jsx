import { Button, Flex, Text } from '@radix-ui/themes';
import { RiCropLine, RiDeleteBinLine, RiImageAddLine, RiSquareLine } from '@remixicon/react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { createCat, useCat } from 'usecat';

import { imageType } from '../lib/constants.js';
import { makeImageSquare } from '../lib/makeImageSquare';
import { resizeCanvas } from '../lib/resizeCanvas';
import { randomHash } from '../shared/js/randomHash.js';
import { canvasToBlob } from '../shared/react/canvasToBlob.js';
import { ImageCropper } from '../shared/react/ImageCropper.jsx';
import { idbStorage } from '../shared/react/indexDB.js';
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
  const [error, setError] = useState(null);

  const cropperRef = useRef(null);

  const handleNextPhoto = useCallback(() => {
    setError(null);
    const left = pickedPhotos.slice(1);
    pickedPhotosCat.set(left);
  }, [pickedPhotos]);

  const handlePickPhotos = useCallback(photos => {
    setError(null);
    if (photos) {
      pickedPhotosCat.set(Array.from(photos));
    }
  }, []);

  const handleCrop = useCallback(async () => {
    const canvas = cropperRef.current.crop(900);
    const blob = await canvasToBlob(canvas, imageType, 0.8);
    const hash = randomHash();
    idbStorage.setItem(hash, blob);
    onSelect({ hash, size: blob.size, type: imageType });

    handleNextPhoto();
  }, [handleNextPhoto, onSelect]);

  const handleSquare = useCallback(async () => {
    const squareCanvas = await makeImageSquare(pickedPhotos[0]);
    const resizedCanvas = resizeCanvas(squareCanvas, 900, 900);
    const blob = await canvasToBlob(resizedCanvas, imageType, 0.8);
    const hash = randomHash();
    idbStorage.setItem(hash, blob);
    onSelect({ hash, type: imageType });

    handleNextPhoto();
  }, [handleNextPhoto, onSelect, pickedPhotos]);

  useEffect(() => {
    return () => {
      pickedPhotosCat.set([]);
    };
  }, []);

  const size = getCameraSize();

  const errorElement = useMemo(() => {
    if (!error) {
      return null;
    }
    return (
      <HelperTextWrapper>
        <Flex direction="column" gap="2">
          <Text align="center">
            notenote.cc can't process this photo, you can take a screenshot of it, and choose the
            screenshot.
          </Text>
          {pickedPhotos.length > 1 && <Button onClick={handleNextPhoto}>Check next photo</Button>}
        </Flex>
      </HelperTextWrapper>
    );
  }, [error, handleNextPhoto, pickedPhotos.length]);

  return (
    <VideoWrapper>
      <CropperWrapper size={size}>
        <ImageCropper
          ref={cropperRef}
          width={size}
          pickedImage={pickedPhotos[0]}
          onError={setError}
        />

        {!pickedPhotos[0] && !error && (
          <HelperTextWrapper>
            <Text>Pick photos from your device.</Text>
          </HelperTextWrapper>
        )}

        {errorElement}
      </CropperWrapper>

      <Flex justify="center" align="center" py="2" gap="2">
        {pickedPhotos[0] && !error && (
          <>
            <IconButtonWithText onClick={handleCrop} text="Crop">
              <RiCropLine />
            </IconButtonWithText>
            <IconButtonWithText onClick={handleSquare} text="Square">
              <RiSquareLine />
            </IconButtonWithText>
            <IconButtonWithText onClick={handleNextPhoto} text="Delete" variant="soft">
              <RiDeleteBinLine />
            </IconButtonWithText>
          </>
        )}

        {(!pickedPhotos[0] || (!!error && pickedPhotos.length === 1)) && (
          <FilePicker
            accept="image/*"
            takePhoto={false}
            multiple
            onSelect={handlePickPhotos}
            height="auto"
          >
            <IconButtonWithText text="Pick">
              <RiImageAddLine />
            </IconButtonWithText>
          </FilePicker>
        )}
      </Flex>
      {pickedPhotos[0] && !error && (
        <Flex position="absolute" top="-2rem">
          <Text>Crop it or turn it into a square photo.</Text>
        </Flex>
      )}
    </VideoWrapper>
  );
});
