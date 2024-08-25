import { Flex, Text } from '@radix-ui/themes';
import {
  RiPauseLine,
  RiPlayLine,
  RiRefreshLine,
  RiRestartLine,
  RiStopLine,
} from '@remixicon/react';
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
import { isIOS } from '../shared/react/device.js';
import { idbStorage } from '../shared/react/indexDB.js';
import { md5Hash } from '../shared/react/md5Hash.js';
import { IconButtonWithText } from './IconButtonWithText.jsx';
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
  const [isPaused, setIsPaused] = useState(false);

  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const timerIdRef = useRef(null);
  const startTimeRef = useRef(null);
  const elapsedTimeRef = useRef(0);
  const progressElementRef = useRef(null);

  const handleSwitchCamera = useCallback(() => {
    rotateCamera();
  }, []);

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
      mediaRecorderRef.current = null;
    }
  }, []);

  const handleStopRecording = useCallback(async () => {
    stopMediaRecorder();

    const blob = new Blob(recordedChunksRef.current, { type: videoType });
    const hash = await md5Hash(blob);
    await idbStorage.setItem(hash, blob);
    onSelect({ hash, size: blob.size, type: videoType });

    setIsRecording(false);
    setIsPaused(false);
    clearTimers();

    recordedChunksRef.current = [];
    elapsedTimeRef.current = 0;
    progressElementRef.current.stop();
  }, [clearTimers, onSelect, stopMediaRecorder]);

  const handleSetupTimer = useCallback(() => {
    clearTimers();

    timerIdRef.current = setTimeout(() => {
      handleStopRecording();
      clearTimers();
    }, RECORDING_DURATION - elapsedTimeRef.current);
  }, [clearTimers, handleStopRecording]);

  const createMediaRecorder = useCallback(async () => {
    if (mediaRecorderRef.current) {
      stopMediaRecorder();
    }

    const mediaRecorder = new MediaRecorder(videoStream, {
      mimeType: isIOS() ? 'video/mp4' : 'video/webm;codecs=vp9',
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
    setIsPaused(false);

    startTimeRef.current = Date.now();
    elapsedTimeRef.current = 0;
    progressElementRef.current.start();

    handleSetupTimer();
  }, [createMediaRecorder, handleSetupTimer]);

  const handlePauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && !isPaused) {
      mediaRecorderRef.current.pause();
      clearTimers();
      elapsedTimeRef.current += Date.now() - startTimeRef.current;
      progressElementRef.current.pause();
      setIsPaused(true);
    }
  }, [clearTimers, isPaused]);

  const handleResumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && isPaused) {
      mediaRecorderRef.current.resume();
      startTimeRef.current = Date.now();
      progressElementRef.current.resume();
      handleSetupTimer();
      setIsPaused(false);
    }
  }, [handleSetupTimer, isPaused]);

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
        setIsPaused(false);
        clearTimers();

        recordedChunksRef.current = [];
        elapsedTimeRef.current = 0;
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

      <Flex justify="center" align="center" py="2" gap="2">
        {!isRecording && (
          <>
            <IconButtonWithText
              onClick={handleStartRecording}
              text="Record"
              disabled={!!videoStreamError}
            >
              <RiPlayLine />
            </IconButtonWithText>

            <IconButtonWithText onClick={handleSwitchCamera} variant="soft" text="Flip">
              <RiRefreshLine />
            </IconButtonWithText>
          </>
        )}

        {isRecording && !isPaused && (
          <IconButtonWithText
            onClick={handlePauseRecording}
            text="Pause"
            disabled={!!videoStreamError}
            variant="soft"
          >
            <RiPauseLine />
          </IconButtonWithText>
        )}

        {isRecording && isPaused && (
          <IconButtonWithText
            onClick={handleResumeRecording}
            text="Resume"
            disabled={!!videoStreamError}
            variant="soft"
          >
            <RiRestartLine />
          </IconButtonWithText>
        )}

        {isRecording && (
          <IconButtonWithText
            onClick={handleStopRecording}
            text="Finish"
            disabled={!!videoStreamError}
          >
            <RiStopLine />
          </IconButtonWithText>
        )}
      </Flex>
    </VideoWrapper>
  );
});
