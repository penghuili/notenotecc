import { Flex, IconButton, Text } from '@radix-ui/themes';
import {
  RiPauseLine,
  RiPlayLine,
  RiRefreshLine,
  RiRestartLine,
  RiStopLine,
} from '@remixicon/react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';

import { videoType } from '../lib/constants.js';
import { useRerenderDetector } from '../lib/useRerenderDetector.js';
import { useWindowBlur } from '../lib/useWindowBlur.js';
import { useWindowFocus } from '../lib/useWindowFocus.js';
import { isIOS, isMobile } from '../shared-private/react/device.js';
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
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState(null);

  useRerenderDetector('TakeVideo', {
    isRecording,
    isPaused,
    error,
    onSelect,
  });

  const facingModeRef = useRef(isMobile() ? 'environment' : 'user');
  const streamRef = useRef(null);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const timerIdRef = useRef(null);
  const startTimeRef = useRef(null);
  const elapsedTimeRef = useRef(0);
  const progressElementRef = useRef(null);

  const handleSwitchCamera = useCallback(async () => {
    stopStream(streamRef.current);
    streamRef.current = null;

    const newMode = facingModeRef.current === 'user' ? 'environment' : 'user';
    facingModeRef.current = newMode;
    const { data: stream, error: requestError } = await requestStream(newMode);
    if (stream) {
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
    } else {
      setError(requestError);
    }
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

  const handleStopRecording = useCallback(() => {
    stopMediaRecorder();

    const blob = new Blob(recordedChunksRef.current, { type: videoType });
    const url = URL.createObjectURL(blob);
    onSelect({ blob, url, size: blob.size, type: videoType });

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

    const { data } = await requestStream(facingModeRef.current);

    if (data) {
      stopStream(streamRef.current);
      streamRef.current = data;
      videoRef.current.srcObject = data;

      const mediaRecorder = new MediaRecorder(data, {
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
    }
  }, [stopMediaRecorder]);

  const handleStartRecording = useCallback(async () => {
    try {
      recordedChunksRef.current = [];
      createMediaRecorder();

      setIsRecording(true);
      setIsPaused(false);

      startTimeRef.current = Date.now();
      elapsedTimeRef.current = 0;
      progressElementRef.current.start();

      handleSetupTimer();
    } catch (e) {
      setError(e);
    }
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

  const handleWindowFocus = useCallback(async () => {
    if (streamRef.current) {
      stopStream(streamRef.current);
      streamRef.current = null;
    }

    const { data: stream, error: requestError } = await requestStream(facingModeRef.current);
    if (stream) {
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
    }
    if (requestError) {
      setError(requestError);
    }
  }, []);

  const handleWindowBlur = useCallback(() => {
    stopStream(streamRef.current);
    streamRef.current = null;

    stopMediaRecorder();

    setIsRecording(false);
    setIsPaused(false);
    clearTimers();

    recordedChunksRef.current = [];
    elapsedTimeRef.current = 0;
    progressElementRef.current.stop();
  }, [clearTimers, stopMediaRecorder]);

  useEffect(() => {
    requestStream(facingModeRef.current).then(({ data, error }) => {
      if (data) {
        streamRef.current = data;
        videoRef.current.srcObject = data;
      }
      if (error) {
        setError(error);
      }
    });

    return () => {
      recordedChunksRef.current = [];
      stopStream(streamRef.current);
      streamRef.current = null;
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

  useWindowFocus(handleWindowFocus);
  useWindowBlur(handleWindowBlur);

  const size = getCameraSize();

  const errorElement = useMemo(() => renderError(error, size), [error, size]);

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
            <IconButton size="4" onClick={handleStartRecording} disabled={!!error}>
              <RiPlayLine />
            </IconButton>

            <IconButton size="4" onClick={handleSwitchCamera}>
              <RiRefreshLine />
            </IconButton>
          </>
        )}

        {isRecording && !isPaused && (
          <IconButton size="4" onClick={handlePauseRecording} disabled={!!error}>
            <RiPauseLine />
          </IconButton>
        )}

        {isRecording && isPaused && (
          <IconButton size="4" onClick={handleResumeRecording} disabled={!!error}>
            <RiRestartLine />
          </IconButton>
        )}

        {isRecording && (
          <IconButton size="4" onClick={handleStopRecording} disabled={!!error}>
            <RiStopLine />
          </IconButton>
        )}
      </Flex>
    </VideoWrapper>
  );
});

async function requestStream(mode) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 720 },
        height: { ideal: 720 },
        frameRate: 30,
        facingMode: { ideal: mode },
      },
      audio: true,
    });

    return { data: stream, error: null };
  } catch (error) {
    console.log(error);
    return { data: null, error };
  }
}

export function stopStream(stream) {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
}
