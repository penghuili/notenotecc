import { Flex, IconButton } from '@radix-ui/themes';
import { RiCameraLine, RiRefreshLine } from '@remixicon/react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';

import { imageType } from '../lib/constants.js';
import { useWindowBlur } from '../lib/useWindowBlur';
import { useWindowFocus } from '../lib/useWindowFocus';
import { canvasToBlob } from '../shared-private/react/canvasToBlob';
import { isMobile } from '../shared-private/react/device.js';
import { getCameraSize, renderError, stopStream, VideoWrapper } from './TakeVideo.jsx';

const Video = styled.video`
  width: ${props => `${props.size}px`};
  height: ${props => `${props.size}px`};
`;

export const TakePhoto = React.memo(({ onSelect }) => {
  const videoStreamRef = useRef(null);
  const videoRef = useRef(null);
  const [error, setError] = useState(null);

  const facingModeRef = useRef(isMobile() ? 'environment' : 'user');

  const handleRequestCamera = useCallback(async mode => {
    setError(null);
    const { data, error } = await requestStream(mode);
    if (data) {
      videoStreamRef.current = data;
      videoRef.current.srcObject = data;
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
    const imageUrl = tempCanvas.toDataURL(imageType);

    onSelect({ blob, url: imageUrl, size: blob.size, type: imageType });
  }, [onSelect]);

  const handleChangeFacingMode = useCallback(() => {
    const mode = facingModeRef.current === 'user' ? 'environment' : 'user';
    facingModeRef.current = mode;
    handleRequestCamera(mode);
  }, [handleRequestCamera]);

  const handleWindowBlur = useCallback(() => {
    if (videoStreamRef.current) {
      stopStream(videoStreamRef.current);
      videoStreamRef.current = null;
    }
  }, []);

  const handleWindowFocus = useCallback(() => {
    if (!videoStreamRef.current) {
      handleRequestCamera(facingModeRef.current);
    }
  }, [handleRequestCamera]);

  useEffect(() => {
    requestStream(facingModeRef.current).then(({ data, error }) => {
      if (data) {
        videoStreamRef.current = data;
        videoRef.current.srcObject = data;
      }
      if (error) {
        setError(error);
      }
    });

    return () => {
      stopStream(videoStreamRef.current);
      videoStreamRef.current = null;
    };
  }, []);

  useWindowBlur(handleWindowBlur);
  useWindowFocus(handleWindowFocus);

  const size = getCameraSize();

  const errorElement = useMemo(() => renderError(error, size), [error, size]);

  return (
    <VideoWrapper>
      <Video ref={videoRef} autoPlay playsInline size={size} />

      {errorElement}

      <Flex justify="center" align="center" py="2" gap="2">
        <IconButton size="4" onClick={handleCapture} disabled={!!error}>
          <RiCameraLine />
        </IconButton>

        <IconButton size="4" onClick={handleChangeFacingMode} variant="soft">
          <RiRefreshLine />
        </IconButton>
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
