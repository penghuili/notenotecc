import { Flex, IconButton, Text } from '@radix-ui/themes';
import { RiCameraLine, RiRefreshLine } from '@remixicon/react';
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import { cameraTypes } from '../lib/cameraTypes';
import { canvasToBlob } from '../shared-private/react/canvasToBlob';

export const VideoWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;
const Video = styled.video`
  width: ${props => `${props.size}px`};
  height: ${props => `${props.size}px`};
`;
const ErrorWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: ${props => `${props.size}px`};

  display: flex;
  justify-content: center;
  align-items: center;
`;

export function getCameraSize() {
  let size = Math.min(600, window.innerWidth, window.innerHeight);
  if (window.innerWidth > window.innerHeight) {
    size = size - 230 - 48;
  }

  return size;
}

export function renderError(mediaError, size) {
  if (!mediaError) {
    return null;
  }

  let errorMessage = 'Camera error';
  if (mediaError.name === 'NotFoundError' || mediaError.name === 'DevicesNotFoundError') {
    errorMessage = 'Camera not found';
  }
  if (mediaError.name === 'NotAllowedError' || mediaError.name === 'PermissionDeniedError') {
    errorMessage = 'Camera access not allowed';
  }
  if (mediaError.name === 'NotReadableError' || mediaError.name === 'TrackStartError') {
    errorMessage = 'Camera in use';
  }

  return (
    <ErrorWrapper size={size}>
      <Text as="p">{errorMessage}</Text>
    </ErrorWrapper>
  );
}

export function TakePhoto({ onSelect }) {
  const videoStreamRef = useRef(null);
  const videoRef = useRef(null);
  const [facingMode, setFacingMode] = useState('environment');
  const [error, setError] = useState(null);

  function requestCameraPermission(mode) {
    const constraints = {
      video: {
        facingMode: { exact: mode },
        width: { ideal: 900 },
        height: { ideal: 900 },
      },
    };

    setError(null);
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then(stream => {
        videoStreamRef.current = stream;
        videoRef.current.srcObject = stream;
      })
      .catch(error => {
        setError(error);
      });
  }

  useEffect(() => {
    function startVideoStream() {
      if (videoStreamRef.current) {
        return;
      }

      requestCameraPermission('environment');
    }

    function stopVideoStream() {
      if (videoStreamRef.current) {
        videoStreamRef.current.getTracks().forEach(track => track.stop());
        videoStreamRef.current = null;
      }
    }

    window.addEventListener('focus', startVideoStream);
    window.addEventListener('blur', stopVideoStream);

    startVideoStream();

    return () => {
      stopVideoStream();
      window.removeEventListener('focus', startVideoStream);
      window.removeEventListener('blur', stopVideoStream);
    };
  }, []);

  async function handleCapture() {
    const tempCanvas = document.createElement('canvas');
    const width = videoRef.current.videoWidth;
    const height = videoRef.current.videoHeight;
    tempCanvas.width = width;
    tempCanvas.height = height;
    const context = tempCanvas.getContext('2d');
    context.drawImage(videoRef.current, 0, 0, width, height);

    const blob = await canvasToBlob(tempCanvas, 'image/webp', 0.8);
    const imageUrl = tempCanvas.toDataURL('image/webp');

    onSelect({ blob, url: imageUrl, size: blob.size, type: cameraTypes.takePhoto });
  }

  const size = getCameraSize();

  return (
    <VideoWrapper>
      <Video ref={videoRef} autoPlay size={size} />

      {renderError(error, size)}

      <Flex justify="center" align="center" py="2" gap="2">
        <IconButton size="4" onClick={handleCapture} disabled={!!error}>
          <RiCameraLine />
        </IconButton>

        <IconButton
          size="4"
          onClick={() => {
            const mode = facingMode === 'user' ? 'environment' : 'user';
            setFacingMode(mode);
            requestCameraPermission(mode);
          }}
        >
          <RiRefreshLine />
        </IconButton>
      </Flex>
    </VideoWrapper>
  );
}
