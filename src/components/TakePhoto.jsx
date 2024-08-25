import { Flex } from '@radix-ui/themes';
import { RiCameraLine, RiRefreshLine } from '@remixicon/react';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import styled from 'styled-components';
import { useCat } from 'usecat';

import { imageType } from '../lib/constants.js';
import {
  hasAudioCat,
  isUsingVideoStreamCat,
  requestVideoStream,
  rotateCamera,
  stopVideoStream,
  videoStreamCat,
  videoStreamErrorCat,
} from '../lib/videoStream.js';
import { canvasToBlob } from '../shared/react/canvasToBlob';
import { idbStorage } from '../shared/react/indexDB.js';
import { md5Hash } from '../shared/react/md5Hash';
import { IconButtonWithText } from './IconButtonWithText.jsx';
import { getCameraSize, renderError, VideoWrapper } from './TakeVideo.jsx';

const Video = styled.video`
  width: ${props => `${props.size}px`};
  height: ${props => `${props.size}px`};
`;

export const TakePhoto = React.memo(({ onSelect }) => {
  const videoStream = useCat(videoStreamCat);
  const videoStreamError = useCat(videoStreamErrorCat);

  const videoRef = useRef(null);

  const handleCapture = useCallback(async () => {
    const tempCanvas = document.createElement('canvas');
    const width = videoRef.current.videoWidth;
    const height = videoRef.current.videoHeight;
    tempCanvas.width = width;
    tempCanvas.height = height;
    const context = tempCanvas.getContext('2d');
    context.drawImage(videoRef.current, 0, 0, width, height);

    const blob = await canvasToBlob(tempCanvas, imageType, 0.8);
    const hash = await md5Hash(blob);
    await idbStorage.setItem(hash, blob);

    onSelect({ hash, size: blob.size, type: imageType });
  }, [onSelect]);

  const handleChangeFacingMode = useCallback(() => {
    rotateCamera();
  }, []);

  useEffect(() => {
    isUsingVideoStreamCat.set(true);
    hasAudioCat.set(false);
    requestVideoStream();

    return () => {
      isUsingVideoStreamCat.set(false);
      stopVideoStream();
    };
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      if (videoStream) {
        videoRef.current.srcObject = videoStream;
      } else {
        videoRef.current.srcObject = null;
        videoRef.current.load();
      }
    }
    // eslint-disable-next-line react-compiler/react-compiler
  }, [videoStream]);

  const size = getCameraSize();

  const errorElement = useMemo(() => renderError(videoStreamError, size), [size, videoStreamError]);

  return (
    <VideoWrapper>
      <Video ref={videoRef} autoPlay muted playsInline size={size} />

      {errorElement}

      <Flex justify="center" align="center" py="2" gap="2">
        <IconButtonWithText onClick={handleCapture} disabled={!!videoStreamError} text="Capture">
          <RiCameraLine />
        </IconButtonWithText>

        <IconButtonWithText onClick={handleChangeFacingMode} variant="soft" text="Flip">
          <RiRefreshLine />
        </IconButtonWithText>
      </Flex>
    </VideoWrapper>
  );
});
