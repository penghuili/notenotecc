import { Flex, IconButton } from '@radix-ui/themes';
import { RiPauseLine, RiPlayLine, RiRestartLine, RiStopLine } from '@remixicon/react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';

import { useWindowBlur } from '../lib/useWindowBlur.js';
import { getCameraSize, RECORDING_DURATION, renderError, VideoWrapper } from './TakeVideo.jsx';
import { TimeProgress } from './TimeProgress.jsx';

const AnimationWrapper = styled.div`
  width: ${props => `${props.size}px`};
  height: ${props => `${props.size}px`};
  display: flex;
  justify-content: center;
  align-items: center;
`;

const AudioAnimation = styled.div`
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background-color: #33b4ae;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  color: white;
  font-weight: bold;
  transition: all 0.3s ease;

  animation: ${props => (props.isRecording ? 'pulse 1.5s infinite' : 'none')};

  &:hover {
    transform: scale(1.05);
  }

  @keyframes pulse {
    0% {
      transform: scale(1);
      box-shadow: 0 0 0 0 rgba(51, 180, 174, 0.7);
    }
    70% {
      transform: scale(1.05);
      box-shadow: 0 0 0 10px rgba(51, 180, 174, 0);
    }
    100% {
      transform: scale(1);
      box-shadow: 0 0 0 0 rgba(51, 180, 174, 0);
    }
  }
`;

export const TakeAudio = React.memo(({ onSelect }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const timerIdRef = useRef(null);
  const startTimeRef = useRef(null);
  const elapsedTimeRef = useRef(0);
  const progressElementRef = useRef(null);

  const clearTimers = useCallback(() => {
    if (timerIdRef.current) {
      clearTimeout(timerIdRef.current);
      timerIdRef.current = null;
    }
  }, []);

  const handleSetupTimer = useCallback(() => {
    clearTimers();

    timerIdRef.current = setTimeout(() => {
      handleStopRecording();
      clearTimers();
    }, RECORDING_DURATION - elapsedTimeRef.current);
  }, [clearTimers, handleStopRecording]);

  const handleStartRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
      mediaRecorderRef.current.ondataavailable = event => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };
      mediaRecorderRef.current.start(100);

      setIsRecording(true);
      setIsPaused(false);
      setProgress(0);
      recordedChunksRef.current = [];
      startTimeRef.current = Date.now();
      elapsedTimeRef.current = 0;

      handleSetupTimer();
    } catch (e) {
      setError(e);
    }
  }, [handleSetupTimer]);

  const handleStopRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.ondataavailable = null;
      mediaRecorderRef.current = null;
    }

    const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
    const url = URL.createObjectURL(blob);
    onSelect({ blob, url, size: blob.size, type: 'audio/webm' });

    setIsRecording(false);
    setIsPaused(false);
    clearTimers();

    recordedChunksRef.current = [];
    elapsedTimeRef.current = 0;
    progressElementRef.current.stop();
  }, [clearTimers, onSelect]);

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

  const handleWindowBlur = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.ondataavailable = null;
      mediaRecorderRef.current = null;
    }

    setIsRecording(false);
    setIsPaused(false);
    clearTimers();

    recordedChunksRef.current = [];
    elapsedTimeRef.current = 0;
    progressElementRef.current.stop();
  }, [clearTimers]);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.ondataavailable = null;
        mediaRecorderRef.current = null;
      }
    };
  }, []);

  useWindowBlur(handleWindowBlur);

  const size = getCameraSize();

  const errorElement = useMemo(() => renderError(error, size), [error, size]);

  return (
    <VideoWrapper>
      <AnimationWrapper size={size}>
        <AudioAnimation isRecording={isRecording} />
      </AnimationWrapper>

      {!!mediaRecorderRef.current && (
        <div style={{ width: '100%', position: 'absolute', top: size, left: 0 }}>
          <TimeProgress ref={progressElementRef} totalTime={RECORDING_DURATION} />
        </div>
      )}

      {errorElement}

      <Flex justify="center" align="center" py="2" gap="2">
        {!isRecording && (
          <IconButton size="4" onClick={handleStartRecording} disabled={!!error}>
            <RiPlayLine />
          </IconButton>
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

        {isRecording && progress < 100 && (
          <IconButton size="4" onClick={handleStopRecording} disabled={!!error}>
            <RiStopLine />
          </IconButton>
        )}
      </Flex>
    </VideoWrapper>
  );
});
