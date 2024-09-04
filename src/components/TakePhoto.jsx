import { Flex, IconButton } from '@radix-ui/themes';
import { RiCameraLensLine, RiRefreshLine } from '@remixicon/react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import fastMemo from 'react-fast-memo';
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
import { randomHash } from '../shared/js/randomHash.js';
import { canvasToBlob } from '../shared/react/canvasToBlob';
import { idbStorage } from '../shared/react/indexDB.js';
import { getCameraSize, renderError, VideoWrapper } from './TakeVideo.jsx';

const Video = styled.video`
  width: ${props => `${props.size}px`};
  height: ${props => `${props.size}px`};
`;

export const TakePhoto = fastMemo(({ onSelect }) => {
  const videoStream = useCat(videoStreamCat);
  const videoStreamError = useCat(videoStreamErrorCat);

  const videoRef = useRef(null);
  const [isTaking, setIsTaking] = useState(false);

  const handleCapture = useCallback(async () => {
    setIsTaking(true);

    const tempCanvas = document.createElement('canvas');
    const width = videoRef.current.videoWidth;
    const height = videoRef.current.videoHeight;
    tempCanvas.width = width;
    tempCanvas.height = height;
    const context = tempCanvas.getContext('2d');
    context.drawImage(videoRef.current, 0, 0, width, height);

    requestAnimationFrame(async () => {
      const blob = await canvasToBlob(tempCanvas, imageType, 0.8);
      const hash = randomHash();
      await idbStorage.setItem(hash, blob);
      onSelect({ hash, size: blob.size, type: imageType });
      setIsTaking(false);
    });
  }, [onSelect]);

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

      <Flex justify="center" align="center" pt="12px" gap="2">
        <IconButton
          size="4"
          onClick={handleCapture}
          disabled={!!videoStreamError || !videoStream || isTaking}
          radius="full"
        >
          <RiCameraLensLine style={{ '--font-size': '40px' }} />
        </IconButton>

        <IconButton
          size="4"
          onClick={rotateCamera}
          variant="soft"
          radius="full"
          style={{ position: 'absolute', top: size + 12, right: 12 }}
        >
          <RiRefreshLine />
        </IconButton>
      </Flex>
    </VideoWrapper>
  );
});
