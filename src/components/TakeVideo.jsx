import { Typography } from '@douyinfe/semi-ui';
import { RiRecordCircleLine, RiRefreshLine, RiStopCircleLine } from '@remixicon/react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import fastMemo from 'react-fast-memo';
import styled from 'styled-components';
import { createCat, useCat } from 'usecat';

import { videoType } from '../lib/constants.js';
import {
  hasAudioCat,
  isUsingVideoStreamCat,
  requestVideoStream,
  rotateCamera,
  stopVideoStream,
  videoStreamCat,
  videoStreamErrorCat,
} from '../lib/videoStream.js';
import { isIOSBrowser, isMobileBrowser } from '../shared/browser/device.js';
import { idbStorage } from '../shared/browser/indexDB.js';
import { randomHash } from '../shared/js/randomHash.js';
import { Flex } from '../shared/semi/Flex.jsx';
import { IconButton } from '../shared/semi/IconButton.jsx';
import { TimeProgress } from './TimeProgress.jsx';

export const VideoWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  align-items: center;
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

export function renderError(mediaError, size) {
  if (!mediaError) {
    return null;
  }

  let errorMessage = mediaError.message;
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
      <Typography.Paragraph>
        {mediaError.name} {errorMessage}
      </Typography.Paragraph>
    </ErrorWrapper>
  );
}

export function getCameraSize() {
  let size = Math.min(600, window.innerWidth, window.innerHeight);
  if (window.innerWidth > window.innerHeight) {
    size = size - 230 - 48;
  }

  return size;
}

const Video = styled.video`
  width: ${props => `${props.size}px`};
  height: ${props => `${props.size}px`};
`;

export const RECORDING_DURATION = 15600;

const tapTwiceCat = createCat(true);

export const TakeVideo = fastMemo(({ onSelect }) => {
  const videoStream = useCat(videoStreamCat);
  const videoStreamError = useCat(videoStreamErrorCat);
  const tapTwice = useCat(tapTwiceCat);

  const [isRecording, setIsRecording] = useState(false);

  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const timerIdRef = useRef(null);
  const progressElementRef = useRef(null);

  const clearTimers = () => {
    if (timerIdRef.current) {
      clearTimeout(timerIdRef.current);
      timerIdRef.current = null;
    }
  };

  const stopMediaRecorder = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.ondataavailable = null;
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current = null;
    }
  };

  const handleOnStop = async () => {
    stopMediaRecorder();
    setIsRecording(false);
    clearTimers();

    progressElementRef.current.stop();

    const blob = new Blob(recordedChunksRef.current, { type: videoType });
    const hash = randomHash();
    idbStorage.setItem(hash, blob);
    onSelect({ hash, size: blob.size, type: videoType });

    recordedChunksRef.current = [];
  };

  const handleStopRecording = async () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
  };

  const handleSetupTimer = () => {
    clearTimers();

    timerIdRef.current = setTimeout(() => {
      handleStopRecording();
      clearTimers();
    }, RECORDING_DURATION);
  };

  const createMediaRecorder = async () => {
    if (mediaRecorderRef.current) {
      stopMediaRecorder();
    }

    const mediaRecorder = new MediaRecorder(videoStream, {
      mimeType: isIOSBrowser() ? 'video/mp4' : 'video/webm',
      videoBitsPerSecond: 1000000,
    });
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = event => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };
    mediaRecorder.onstop = handleOnStop;
    mediaRecorder.start(100);
  };

  const handleStartRecording = async () => {
    recordedChunksRef.current = [];
    createMediaRecorder();

    setIsRecording(true);

    progressElementRef.current.start();

    handleSetupTimer();

    tapTwiceCat.set(false);
  };

  useEffect(() => {
    isUsingVideoStreamCat.set(true);
    hasAudioCat.set(true);
    requestVideoStream();

    return () => {
      stopVideoStream();
      isUsingVideoStreamCat.set(false);

      recordedChunksRef.current = [];
      if (timerIdRef.current) {
        clearTimeout(timerIdRef.current);
        timerIdRef.current = null;
      }
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.ondataavailable = null;
        mediaRecorderRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      if (videoStream) {
        videoRef.current.srcObject = videoStream;
      } else {
        videoRef.current.srcObject = null;
        videoRef.current.load();

        stopMediaRecorder();

        setIsRecording(false);
        clearTimers();

        recordedChunksRef.current = [];
        progressElementRef.current.stop();
      }
    }
  }, [videoStream]);

  const size = getCameraSize();

  const errorElement = useMemo(() => renderError(videoStreamError, size), [size, videoStreamError]);

  return (
    <VideoWrapper>
      <Video ref={videoRef} autoPlay muted playsInline size={size} />
      <div style={{ width: '100%', position: 'absolute', top: size, left: 0 }}>
        <TimeProgress ref={progressElementRef} totalTime={RECORDING_DURATION} />
      </div>

      {errorElement}

      <Flex
        direction="row"
        justify="center"
        align="center"
        gap="0.5rem"
        style={{
          paddingTop: '12px',
        }}
      >
        {!isRecording && (
          <>
            <IconButton
              icon={<RiRecordCircleLine size={40} />}
              theme="solid"
              size={50}
              round
              onClick={handleStartRecording}
              disabled={!!videoStreamError || !videoStream}
            />

            {isIOSBrowser() && tapTwice && (
              <Typography.Paragraph
                size="small"
                style={{
                  position: 'absolute',
                  top: size + 60,
                  right: '50%',
                  transform: 'translateX(50%)',
                  textAlign: 'center',
                }}
              >
                Tap twice to take the first video
              </Typography.Paragraph>
            )}

            {isMobileBrowser() && (
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
            )}
          </>
        )}

        {isRecording && (
          <IconButton
            icon={<RiStopCircleLine />}
            size={50}
            round
            onClick={handleStopRecording}
            disabled={!!videoStreamError}
          />
        )}
      </Flex>
    </VideoWrapper>
  );
});
