import { Flex, Text } from '@radix-ui/themes';
import { RiImageAddLine } from '@remixicon/react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { createCat, useCat } from 'usecat';

import { imageType } from '../lib/constants.js';
import { resizeImage } from '../lib/resizeImage.js';
import { randomHash } from '../shared/js/randomHash.js';
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

  const handlePickPhotos = useCallback(photos => {
    setError(null);
    if (photos) {
      pickedPhotosCat.set(Array.from(photos));
    }
  }, []);

  useEffect(() => {
    if (!pickedPhotos.length) {
      return;
    }

    setError(null);
    Promise.all(pickedPhotos.map(photo => resizeImage(photo))).then(blobs => {
      const succeeded = blobs.filter(b => b.data).map(b => b.data);
      const photos = succeeded.map(resized => ({
        hash: randomHash(),
        size: resized.size,
        type: imageType,
      }));

      succeeded.forEach((blob, index) => {
        idbStorage.setItem(photos[index].hash, blob);
      });

      onSelect(photos);

      const failed = pickedPhotos.filter(b => b.error).map(b => b.error);
      setError(failed[0]);

      pickedPhotosCat.set([]);
    });
  }, [onSelect, pickedPhotos]);

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
        </Flex>
      </HelperTextWrapper>
    );
  }, [error]);

  return (
    <VideoWrapper>
      <CropperWrapper size={size}>
        {!pickedPhotos[0] && !error && (
          <HelperTextWrapper>
            <Text>Pick photos from your device.</Text>
          </HelperTextWrapper>
        )}

        {errorElement}
      </CropperWrapper>

      <Flex justify="center" align="center" py="2" gap="2">
        {(!pickedPhotos?.length || !error) && (
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
    </VideoWrapper>
  );
});
