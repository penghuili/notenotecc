import { Flex, IconButton, Text } from '@radix-ui/themes';
import { RiCameraLensLine, RiRefreshLine } from '@remixicon/react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import fastMemo from 'react-fast-memo';
import styled from 'styled-components';
import { createCat, useCat } from 'usecat';

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
import { isIOSBrowser } from '../shared/react/device.js';
import { idbStorage } from '../shared/react/indexDB.js';
import { getCameraSize, renderError, VideoWrapper } from './TakeVideo.jsx';

const Video = styled.video`
  width: ${props => `${props.size}px`};
  height: ${props => `${props.size}px`};
`;

const tapTwiceCat = createCat(true);

export const TakePhoto = fastMemo(({ onSelect }) => {
  const videoStream = useCat(videoStreamCat);
  const videoStreamError = useCat(videoStreamErrorCat);
  const tapTwice = useCat(tapTwiceCat);

  const videoRef = useRef(null);
  const [isTaking, setIsTaking] = useState(false);
  const [zoomCapability, setZoomCapability] = useState(null);
  const [zoomValue, setZoomValue] = useState(1);

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
      tapTwiceCat.set(false);
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

        const videoTrack = videoStream.getVideoTracks()[0];
        if (videoTrack?.getCapabilities) {
          const capabilities = videoTrack.getCapabilities();
          setZoomCapability(capabilities?.zoom);
        }
      } else {
        videoRef.current.srcObject = null;
        videoRef.current.load();
      }
    }
    // eslint-disable-next-line react-compiler/react-compiler
  }, [videoStream]);

  const size = getCameraSize();

  const zoomSteps = useMemo(() => {
    if (!zoomCapability) {
      return null;
    }

    return (
      <ZoomSlider
        type="range"
        min={zoomCapability.min || 1}
        max={zoomCapability.max || 1}
        step={zoomCapability.step || 0.1}
        value={zoomValue}
        onChange={async e => {
          setZoomValue(e.target.value);

          try {
            const videoTrack = videoStream.getVideoTracks()[0];
            await videoTrack.applyConstraints({ advanced: [{ zoom: Number(e.target.value) }] });
          } catch (error) {
            console.error('Error applying zoom constraints:', error);
          }
        }}
        style={{
          position: 'absolute',
          top: size - 40,
          right: '50%',
          transform: 'translateX(50%)',
        }}
      />
    );
  }, [zoomCapability, zoomValue, size, videoStream]);

  const errorElement = useMemo(() => renderError(videoStreamError, size), [size, videoStreamError]);

  return (
    <VideoWrapper>
      <Video ref={videoRef} autoPlay muted playsInline size={size} />

      {zoomSteps}
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
        {isIOSBrowser() && tapTwice && (
          <Text
            align="center"
            size="2"
            style={{
              position: 'absolute',
              top: size + 60,
              right: '50%',
              transform: 'translateX(50%)',
            }}
          >
            Tap twice to take the first photo
          </Text>
        )}

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

const ZoomSlider = styled.input`
  position: absolute;
  border-radius: 2rem;
  background-color: rgba(0, 0, 0, 0.5);

  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;

  &:focus {
    outline: none;
  }
`;
