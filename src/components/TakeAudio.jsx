import { Flex, IconButton, Progress } from '@radix-ui/themes';
import { RiPauseLine, RiPlayLine, RiRestartLine, RiStopLine } from '@remixicon/react';
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import { cameraTypes } from '../lib/cameraTypes.js';
import { getCameraSize, renderError, VideoWrapper } from './TakePhoto.jsx';

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

const RECORDING_DURATION = 15600;

export function TakeAudio({ onSelect }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const progressIntervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const elapsedTimeRef = useRef(0);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const clearTimers = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  const startRecording = async () => {
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

      updateProgress();
    } catch (e) {
      setError(e);
    }
  };

  const updateProgress = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    progressIntervalRef.current = setInterval(() => {
      const timeChange = Date.now() - startTimeRef.current;
      const newElapsedTime = elapsedTimeRef.current + timeChange;
      const newProgress = Math.min((newElapsedTime / RECORDING_DURATION) * 100, 100);
      setProgress(newProgress);

      if (newProgress >= 100) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
        stopRecording();
      }
    }, 100);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.ondataavailable = null;
      mediaRecorderRef.current = null;
    }

    const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
    const url = URL.createObjectURL(blob);
    console.log(url, blob.size, recordedChunksRef.current.length);
    onSelect({ blob, url, size: blob.size, type: cameraTypes.takeAudio });

    setIsRecording(false);
    setIsPaused(false);
    clearTimers();

    recordedChunksRef.current = [];
    elapsedTimeRef.current = 0;
    setProgress(0);
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && !isPaused) {
      mediaRecorderRef.current.pause();
      clearTimers();
      elapsedTimeRef.current += Date.now() - startTimeRef.current;
      setIsPaused(true);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      startTimeRef.current = Date.now();
      updateProgress();
    }
  };

  const size = getCameraSize();

  return (
    <VideoWrapper>
      <AnimationWrapper size={size}>
        <AudioAnimation isRecording={isRecording} />
      </AnimationWrapper>

      {!!mediaRecorderRef.current && (
        <div style={{ width: '100%', position: 'absolute', top: size, left: 0 }}>
          <Progress size="1" value={progress} />
        </div>
      )}

      {renderError(error, size)}

      <Flex justify="center" align="center" py="2" gap="2">
        {!isRecording && (
          <IconButton size="4" onClick={startRecording} disabled={!!error}>
            <RiPlayLine />
          </IconButton>
        )}

        {isRecording && !isPaused && (
          <IconButton size="4" onClick={pauseRecording} disabled={!!error}>
            <RiPauseLine />
          </IconButton>
        )}

        {isRecording && isPaused && (
          <IconButton size="4" onClick={resumeRecording} disabled={!!error}>
            <RiRestartLine />
          </IconButton>
        )}

        {isRecording && progress < 100 && (
          <IconButton size="4" onClick={stopRecording} disabled={!!error}>
            <RiStopLine />
          </IconButton>
        )}
      </Flex>
    </VideoWrapper>
  );
}
