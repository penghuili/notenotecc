import { Flex, IconButton, Progress } from '@radix-ui/themes';
import {
  RiPauseLine,
  RiPlayLine,
  RiRefreshLine,
  RiRestartLine,
  RiStopLine,
} from '@remixicon/react';
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import { getCameraSize, renderError, VideoWrapper } from './TakePhoto';

const Video = styled.video`
  width: ${props => `${props.size}px`};
  height: ${props => `${props.size}px`};
`;

const RECORDING_DURATION = 15000;

export function TakeVideo({ onSelect }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [facingMode, setFacingMode] = useState('environment');

  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const progressIntervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const elapsedTimeRef = useRef(0);

  useEffect(() => {
    function handleStart() {
      requestStream(facingMode);
    }
    function handleStop() {
      stopStream();
    }
    window.addEventListener('focus', handleStart);
    window.addEventListener('blur', handleStop);
    requestStream('environment');

    return () => {
      stopStream();
      window.removeEventListener('focus', handleStart);
      window.removeEventListener('blur', handleStop);

      clearAllTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearAllTimers = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  const requestStream = async mode => {
    try {
      if (streamRef.current && mode === facingMode) {
        return;
      }
      if (streamRef.current) {
        stopStream();
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 720 },
          height: { ideal: 720 },
          frameRate: 30,
          facingMode: { exact: mode },
        },
        audio: true,
      });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
    } catch (e) {
      setError(e);
    }
  };
  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const startRecording = async () => {
    try {
      await requestStream(facingMode);

      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 1000000,
      });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = handleDataAvailable;
      mediaRecorder.start(100);

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

  const handleDataAvailable = event => {
    if (event.data.size > 0) {
      recordedChunksRef.current.push(event.data);
    }
  };

  const updateProgress = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    progressIntervalRef.current = setInterval(() => {
      const currentTime = Date.now();
      const newElapsedTime = elapsedTimeRef.current + (currentTime - startTimeRef.current);
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

    const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    onSelect({ blob, url, duration: elapsedTimeRef.current });

    setIsRecording(false);
    setIsPaused(false);
    clearAllTimers();

    recordedChunksRef.current = [];
    elapsedTimeRef.current = 0;
    setProgress(0);
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && !isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      clearAllTimers();
      elapsedTimeRef.current += Date.now() - startTimeRef.current;
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
      <Video ref={videoRef} autoPlay muted size={size} />
      {!error && (
        <div style={{ width: '100%', position: 'absolute', top: size, left: 0 }}>
          <Progress size="1" value={progress} />
        </div>
      )}

      {renderError(error, size)}

      <Flex justify="center" align="center" py="2" gap="2">
        {!isRecording && (
          <>
            <IconButton size="4" onClick={startRecording} disabled={!!error}>
              <RiPlayLine />
            </IconButton>

            <IconButton
              size="4"
              onClick={() => {
                const mode = facingMode === 'user' ? 'environment' : 'user';
                setFacingMode(mode);
                requestStream(mode);
              }}
            >
              <RiRefreshLine />
            </IconButton>
          </>
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
