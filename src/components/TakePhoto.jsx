import { Flex } from '@radix-ui/themes';
import { RiCameraLine, RiRefreshLine } from '@remixicon/react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';

import { imageType } from '../lib/constants.js';
import { useWindowBlur } from '../lib/useWindowBlur';
import { useWindowFocus } from '../lib/useWindowFocus';
import { canvasToBlob } from '../shared/react/canvasToBlob';
import { isMobile } from '../shared/react/device.js';
import { idbStorage } from '../shared/react/indexDB.js';
import { md5Hash } from '../shared/react/md5Hash';
import { IconButtonWithText } from './IconButtonWithText.jsx';
import { getCameraSize, renderError, stopStream, VideoWrapper } from './TakeVideo.jsx';

const Video = styled.video`
  width: ${props => `${props.size}px`};
  height: ${props => `${props.size}px`};
`;

export const TakePhoto = React.memo(({ onSelect }) => {
  const streamRef = useRef(null);
  const videoRef = useRef(null);
  const [error, setError] = useState(null);

  const facingModeRef = useRef(isMobile() ? 'environment' : 'user');
  const isDestroyedRef = useRef(false);

  const handleRequestCamera = useCallback(async mode => {
    setError(null);
    stopStream(streamRef.current);
    streamRef.current = null;
    const { data, error } = await requestStream(mode);
    if (data) {
      streamRef.current = data;
      if (videoRef.current) {
        videoRef.current.srcObject = data;
      }
    }
    if (error) {
      setError(error);
    }
  }, []);

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
    const mode = facingModeRef.current === 'user' ? 'environment' : 'user';
    facingModeRef.current = mode;
    handleRequestCamera(mode);
  }, [handleRequestCamera]);

  const handleWindowBlur = useCallback(() => {
    if (streamRef.current) {
      stopStream(streamRef.current);
      streamRef.current = null;
    }
  }, []);

  const handleWindowFocus = useCallback(() => {
    if (!streamRef.current) {
      handleRequestCamera(facingModeRef.current);
    }
  }, [handleRequestCamera]);

  useEffect(() => {
    isDestroyedRef.current = false;
    stopStream(streamRef.current);
    streamRef.current = null;
    requestStream(facingModeRef.current).then(({ data, error }) => {
      if (data) {
        if (isDestroyedRef.current) {
          stopStream(data);
          return;
        }

        streamRef.current = data;
        if (videoRef.current) {
          videoRef.current.srcObject = data;
        }
      }
      if (error) {
        setError(error);
      }
    });

    return () => {
      stopStream(streamRef.current);
      streamRef.current = null;
      isDestroyedRef.current = true;
    };
  }, []);

  // eslint-disable-next-line react-compiler/react-compiler
  useWindowBlur(handleWindowBlur);
  // eslint-disable-next-line react-compiler/react-compiler
  useWindowFocus(handleWindowFocus);

  const size = getCameraSize();

  const errorElement = useMemo(() => renderError(error, size), [error, size]);

  return (
    <VideoWrapper>
      <Video ref={videoRef} autoPlay muted playsInline size={size} />

      {errorElement}

      <Flex justify="center" align="center" py="2" gap="2">
        <IconButtonWithText onClick={handleCapture} disabled={!!error} text="Capture">
          <RiCameraLine />
        </IconButtonWithText>

        <IconButtonWithText onClick={handleChangeFacingMode} variant="soft" text="Flip">
          <RiRefreshLine />
        </IconButtonWithText>
      </Flex>
    </VideoWrapper>
  );
});

async function requestStream(mode) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: mode },
        width: { ideal: 900 },
        height: { ideal: 900 },
      },
    });

    return { data: stream, error: null };
  } catch (error) {
    return { data: null, error };
  }
}
