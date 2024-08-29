import { Flex, IconButton, Text } from '@radix-ui/themes';
import { RiRecordCircleLine, RiRefreshLine, RiStopCircleLine } from '@remixicon/react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { useCat } from 'usecat';

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
import { randomHash } from '../shared/js/randomHash.js';
import { isIOSBrowser, isMobileBrowser } from '../shared/react/device.js';
import { idbStorage } from '../shared/react/indexDB.js';
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
      <Text as="p">
        {mediaError.name} {errorMessage}
      </Text>
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

export const TakeVideo = React.memo(({ onSelect }) => {
  const videoStream = useCat(videoStreamCat);
  const videoStreamError = useCat(videoStreamErrorCat);

  const [isRecording, setIsRecording] = useState(false);

  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const timerIdRef = useRef(null);
  const progressElementRef = useRef(null);

  const clearTimers = useCallback(() => {
    if (timerIdRef.current) {
      clearTimeout(timerIdRef.current);
      timerIdRef.current = null;
    }
  }, []);

  const stopMediaRecorder = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.ondataavailable = null;
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current = null;
    }
  }, []);

  const handleStopRecording = useCallback(async () => {
    const handleStop = async () => {
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
    mediaRecorderRef.current.onstop = handleStop;

    if (mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    } else {
      handleStop();
    }
  }, [clearTimers, onSelect, stopMediaRecorder]);

  const handleSetupTimer = useCallback(() => {
    clearTimers();

    timerIdRef.current = setTimeout(() => {
      handleStopRecording();
      clearTimers();
    }, RECORDING_DURATION);
  }, [clearTimers, handleStopRecording]);

  const createMediaRecorder = useCallback(async () => {
    if (mediaRecorderRef.current) {
      stopMediaRecorder();
    }

    const mediaRecorder = new MediaRecorder(videoStream, {
      mimeType: isIOSBrowser() ? 'video/mp4' : 'video/webm;codecs=vp9',
      videoBitsPerSecond: 1000000,
    });
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = event => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };
    mediaRecorder.start(100);
  }, [stopMediaRecorder, videoStream]);

  const handleStartRecording = useCallback(async () => {
    recordedChunksRef.current = [];
    createMediaRecorder();

    setIsRecording(true);

    progressElementRef.current.start();

    handleSetupTimer();
  }, [createMediaRecorder, handleSetupTimer]);

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
    // eslint-disable-next-line react-compiler/react-compiler
  }, [clearTimers, stopMediaRecorder, videoStream]);

  const size = getCameraSize();

  const errorElement = useMemo(() => renderError(videoStreamError, size), [size, videoStreamError]);

  return (
    <VideoWrapper>
      <Video ref={videoRef} autoPlay muted playsInline size={size} />
      <div style={{ width: '100%', position: 'absolute', top: size, left: 0 }}>
        <TimeProgress ref={progressElementRef} totalTime={RECORDING_DURATION} />
      </div>

      {errorElement}

      <Flex justify="center" align="center" pt="12px" gap="2">
        {!isRecording && (
          <>
            <IconButton
              size="4"
              radius="full"
              onClick={handleStartRecording}
              disabled={!!videoStreamError || !videoStream}
            >
              <RiRecordCircleLine style={{ '--font-size': '40px' }} />
            </IconButton>

            {isMobileBrowser() && (
              <IconButton
                size="4"
                radius="full"
                onClick={rotateCamera}
                variant="soft"
                style={{ position: 'absolute', top: size + 12, right: 12 }}
              >
                <RiRefreshLine />
              </IconButton>
            )}
          </>
        )}

        {isRecording && (
          <IconButton
            size="4"
            radius="full"
            onClick={handleStopRecording}
            disabled={!!videoStreamError}
          >
            <RiStopCircleLine style={{ '--font-size': '40px' }} />
          </IconButton>
        )}
      </Flex>
    </VideoWrapper>
  );
});
