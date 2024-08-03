import { Flex, IconButton } from '@radix-ui/themes';
import {
  RiPauseLine,
  RiPlayLine,
  RiRefreshLine,
  RiRestartLine,
  RiStopLine,
} from '@remixicon/react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';

import { useRerenderDetector } from '../lib/useRerenderDetector.js';
import { getCameraSize, renderError, VideoWrapper } from './TakePhoto.jsx';
import { TimeProgress } from './TimeProgress.jsx';

const Video = styled.video`
  width: ${props => `${props.size}px`};
  height: ${props => `${props.size}px`};
`;

const RECORDING_DURATION = 15600;

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

  const facingModeRef = useRef('environment');
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
      clearInterval(timerIdRef.current);
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

    const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    onSelect({ blob, url, size: blob.size, type: 'video/webm' });

    setIsRecording(false);
    setIsPaused(false);
    clearTimers();

    recordedChunksRef.current = [];
    elapsedTimeRef.current = 0;
    progressElementRef.current.stop();
  }, [clearTimers, onSelect, stopMediaRecorder]);

  const handleCancleRecording = useCallback(() => {
    stopMediaRecorder();

    setIsRecording(false);
    setIsPaused(false);
    clearTimers();

    recordedChunksRef.current = [];
    elapsedTimeRef.current = 0;
    progressElementRef.current.stop();
  }, [clearTimers, stopMediaRecorder]);

  const handleSetupTimer = useCallback(() => {
    clearTimers();

    timerIdRef.current = setTimeout(() => {
      handleStopRecording();
      clearTimers();
    }, RECORDING_DURATION - elapsedTimeRef.current);
  }, [clearTimers, handleStopRecording]);

  const createMediaRecorder = useCallback(() => {
    if (mediaRecorderRef.current) {
      stopMediaRecorder();
    }

    const mediaRecorder = new MediaRecorder(streamRef.current, {
      mimeType: 'video/webm;codecs=vp9',
      videoBitsPerSecond: 1000000,
    });
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = event => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };
    mediaRecorder.start(100);
  }, [stopMediaRecorder]);

  const handleStartRecording = useCallback(async () => {
    try {
      createMediaRecorder();

      setIsRecording(true);
      setIsPaused(false);

      recordedChunksRef.current = [];
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
      setIsPaused(false);
      startTimeRef.current = Date.now();
      progressElementRef.current.resume();
      handleSetupTimer();
    }
  }, [handleSetupTimer, isPaused]);

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
      stopStream(streamRef.current);
      streamRef.current = null;
      if (timerIdRef.current) {
        clearTimeout(timerIdRef.current);
        timerIdRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    async function handleFocus() {
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
    }

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  useEffect(() => {
    function handleBlur() {
      stopStream(streamRef.current);
      streamRef.current = null;

      handleCancleRecording();
    }

    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('blur', handleBlur);
    };
  }, [handleCancleRecording]);

  const size = getCameraSize();

  const errorElement = useMemo(() => renderError(error, size), [error, size]);

  return (
    <VideoWrapper>
      <Video ref={videoRef} autoPlay muted size={size} />
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
        facingMode: { exact: mode },
      },
      audio: true,
    });

    return { data: stream, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

function stopStream(stream) {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
}
