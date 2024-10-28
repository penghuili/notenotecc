import { Typography } from '@douyinfe/semi-ui';
import { RiImageAddLine } from '@remixicon/react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import fastMemo from 'react-fast-memo';
import styled from 'styled-components';
import { createCat, useCat } from 'usecat';

import { imageType } from '../lib/constants.js';
import { resizeImage } from '../lib/resizeImage.js';
import { idbStorage } from '../shared/browser/indexDB.js';
import { asyncMap } from '../shared/js/asyncMap.js';
import { randomHash } from '../shared/js/randomHash.js';
import { Flex } from '../shared/semi/Flex.jsx';
import { IconButton } from '../shared/semi/IconButton.jsx';
import { FilePicker } from './FilePicker.jsx';
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

export async function processPickedPhotos(pickedPhotos) {
  const resizedBlobs = await asyncMap(pickedPhotos, photo => resizeImage(photo));
  const succeeded = resizedBlobs.filter(b => b.data).map(b => b.data);
  const photos = succeeded.map(resized => ({
    hash: randomHash(),
    size: resized.size,
    type: imageType,
  }));

  succeeded.forEach((blob, index) => {
    idbStorage.setItem(photos[index].hash, blob);
  });

  const failed = pickedPhotos.filter(b => b.error).map(b => b.error);

  return { succeeded: photos, failed };
}

export const PickPhoto = fastMemo(({ onSelect }) => {
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
    processPickedPhotos(pickedPhotos).then(({ succeeded, failed }) => {
      if (succeeded.length) {
        onSelect(succeeded);
      }
      if (failed.length) {
        setError(failed[0]);
      }

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
        <Flex direction="column" gap="0.5rem">
          <Typography.Paragraph style={{ textAlign: 'center' }}>
            notenote.cc can't process this photo, you can take a screenshot of it, and choose the
            screenshot.
          </Typography.Paragraph>
        </Flex>
      </HelperTextWrapper>
    );
  }, [error]);

  return (
    <VideoWrapper>
      <CropperWrapper size={size}>
        {!pickedPhotos[0] && !error && (
          <HelperTextWrapper>
            <Typography.Paragraph>Pick photos from your device.</Typography.Paragraph>
          </HelperTextWrapper>
        )}

        {errorElement}
      </CropperWrapper>

      <Flex
        direction="row"
        justify="center"
        align="center"
        gap="0.5rem"
        style={{ paddingTop: '12px' }}
      >
        {(!pickedPhotos?.length || !error) && (
          <FilePicker
            accept="image/*"
            takePhoto={false}
            multiple
            onSelect={handlePickPhotos}
            height="auto"
          >
            <IconButton theme="solid" icon={<RiImageAddLine />} round size={50} />
          </FilePicker>
        )}
      </Flex>
    </VideoWrapper>
  );
});
