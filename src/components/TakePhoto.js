import { Flex, IconButton, Text } from '@radix-ui/themes';
import { RiCameraLine, RiRefreshLine } from '@remixicon/react';
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import { disableBodyScroll, enableBodyScroll } from '../shared-private/react/bodySccroll';

const Video = styled.video`
  width: ${props => `${props.size}px`};
  height: ${props => `${props.size}px`};
`;
const ErrorWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: ${props => `${props.size}px`};
  height: ${props => `${props.size}px`};

  display: flex;
  justify-content: center;
  align-items: center;
`;

const errorTypes = {
  notFound: 'notFound',
  notAllowed: 'notAllowed',
  inUse: 'inUse',
  other: 'other',
};

export function getCameraSize() {
  let size = Math.min(600, window.innerWidth, window.innerHeight);
  if (window.innerWidth > window.innerHeight) {
    size = size - 230 - 48;
  }

  return size;
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
        if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
          setError(errorTypes.notFound);
        } else if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          setError(errorTypes.notAllowed);
        } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
          setError(errorTypes.inUse);
        } else {
          setError(errorTypes.other);
        }
      });
  }

  useEffect(() => {
    disableBodyScroll();
    return () => {
      enableBodyScroll();
    };
  }, []);

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

  function handleCapture() {
    const tempCanvas = document.createElement('canvas');
    const width = videoRef.current.videoWidth;
    const height = videoRef.current.videoHeight;
    tempCanvas.width = width;
    tempCanvas.height = height;
    const context = tempCanvas.getContext('2d');
    context.drawImage(videoRef.current, 0, 0, width, height);
    const imageUrl = tempCanvas.toDataURL('image/png');

    onSelect({ canvas: tempCanvas, url: imageUrl });
  }

  const size = getCameraSize();

  function renderError() {
    let errorMessage;
    if (error === errorTypes.notFound) {
      errorMessage = 'Camera not found';
    }
    if (error === errorTypes.notAllowed) {
      errorMessage = 'Camera access not allowed';
    }
    if (error === errorTypes.inUse) {
      errorMessage = 'Camera in use';
    }
    if (error === errorTypes.other) {
      errorMessage = 'Camera error';
    }
    if (!errorMessage) {
      return null;
    }

    return (
      <ErrorWrapper size={size}>
        <Text as="p">{errorMessage}</Text>
      </ErrorWrapper>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <Video ref={videoRef} autoPlay size={size} />

      {renderError()}

      <Flex justify="center" align="center" py="2" gap="2">
        <IconButton size="4" onClick={handleCapture} disabled={!videoStreamRef.current || !!error}>
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
    </div>
  );
}
