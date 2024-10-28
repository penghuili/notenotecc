import { Typography } from '@douyinfe/semi-ui';
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
import { canvasToBlob } from '../shared/browser/canvasToBlob';
import { isIOSBrowser } from '../shared/browser/device.js';
import { idbStorage } from '../shared/browser/indexDB.js';
import { randomHash } from '../shared/js/randomHash.js';
import { Flex } from '../shared/semi/Flex.jsx';
import { IconButton } from '../shared/semi/IconButton.jsx';
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

      <Flex
        direction="row"
        justify="center"
        align="center"
        gap="0.5rem"
        style={{ paddingTop: '12px' }}
      >
        <IconButton
          icon={<RiCameraLensLine size={40} />}
          theme="solid"
          size={50}
          round
          onClick={handleCapture}
          disabled={!!videoStreamError || !videoStream || isTaking}
        />
        {isIOSBrowser() && tapTwice && (
          <Typography.Text
            size="small"
            style={{
              position: 'absolute',
              top: size + 60,
              right: '50%',
              transform: 'translateX(50%)',
              textAlign: 'center',
            }}
          >
            Tap twice to take the first photo
          </Typography.Text>
        )}

        <IconButton
          icon={<RiRefreshLine />}
          size={50}
          round
          onClick={rotateCamera}
          style={{
            position: 'absolute',
            top: size + 12,
            right: 12,
          }}
        />
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
