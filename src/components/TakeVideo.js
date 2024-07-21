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

import { renderError } from './TakePhoto';

const Video = styled.video`
  width: ${props => `${props.size}px`};
  height: ${props => `${props.size}px`};
`;

export function getCameraSize() {
  let size = Math.min(600, window.innerWidth, window.innerHeight);
  if (window.innerWidth > window.innerHeight) {
    size = size - 230 - 48;
  }

  return size;
}

export function TakeVideo({ onSelect }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [timeLeft, setTimeLeft] = useState(15);
  const [error, setError] = useState(null);
  const [facingMode, setFacingMode] = useState('environment');

  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    requestPermission('environment');

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const requestPermission = async mode => {
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
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
    } catch (e) {
      setError(e);
    }
  };

  const startRecording = async () => {
    try {
      if (!streamRef.current) {
        await requestPermission(facingMode);
      }

      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 1000000, // 1 Mbps
      });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = handleDataAvailable;
      mediaRecorder.start(1000);

      setIsRecording(true);
      setIsPaused(false);
      setTimeLeft(15);

      timerRef.current = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            stopRecording();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } catch (e) {
      setError(e);
    }
  };

  const handleDataAvailable = event => {
    if (event.data.size > 0) {
      setRecordedChunks(prev => prev.concat(event.data));
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setIsPaused(false);
    clearInterval(timerRef.current);

    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    onSelect({ blob, url });

    setRecordedChunks([]);
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && !isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      clearInterval(timerRef.current);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      timerRef.current = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            stopRecording();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
  };

  const size = getCameraSize();

  return (
    <div style={{ position: 'relative' }}>
      <Video ref={videoRef} autoPlay muted size={size} />
      <Progress size="1" value={100 - (timeLeft / 15) * 100} />

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
                requestPermission(mode);
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

        {isRecording && timeLeft > 0 && (
          <IconButton size="4" onClick={stopRecording} disabled={!!error}>
            <RiStopLine />
          </IconButton>
        )}
      </Flex>
    </div>
  );
}
