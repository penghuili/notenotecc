import { IconButton, Slider } from '@radix-ui/themes';
import { RiVolumeMuteLine, RiVolumeUpLine } from '@remixicon/react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import { getVideoDuration } from '../lib/getVideoDuration';

export const VideoPlayer = React.memo(({ src, onLoaded, muted = true }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlayPause = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      if (isPlaying) {
        video.pause();
      } else {
        video.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying, videoRef]);

  const toggleFullScreen = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        video.requestFullscreen();
      }
    }
  }, [videoRef]);

  return (
    <Wrapper>
      <Video
        ref={videoRef}
        src={src}
        onClick={togglePlayPause}
        onDoubleClick={toggleFullScreen}
        muted={muted}
      />
      <PlayerActions videoRef={videoRef} src={src} onLoaded={onLoaded} muted={muted} />
    </Wrapper>
  );
});

const PlayerActions = React.memo(({ videoRef, src, onLoaded, muted }) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(1);
  const [isMuted, setIsMuted] = useState(muted);

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      setCurrentTime(video.currentTime);
    }
  }, [videoRef]);

  const handleProgressChange = useCallback(
    value => {
      const newTime = (+value[0] / 100) * duration;
      // eslint-disable-next-line react-compiler/react-compiler
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    },
    [videoRef, duration]
  );

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [videoRef, isMuted]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.addEventListener('timeupdate', handleTimeUpdate);
      return () => {
        video.removeEventListener('timeupdate', handleTimeUpdate);
      };
    }
  }, [handleTimeUpdate, videoRef]);

  useEffect(() => {
    getVideoDuration(src)
      .catch(() => undefined)
      .then(duration => {
        setDuration(duration || 0);
        onLoaded();
      });
  }, [onLoaded, src]);

  return (
    <Actions>
      <Slider
        value={[(currentTime / duration) * 100]}
        onValueChange={handleProgressChange}
        size="1"
        style={{ width: '100%' }}
      />
      <IconButton onClick={toggleMute} variant="ghost" ml="2">
        {isMuted ? <RiVolumeMuteLine /> : <RiVolumeUpLine />}
      </IconButton>
    </Actions>
  );
});

const Wrapper = styled.div`
  position: relative;
`;
const Video = styled.video`
  width: 100%;
  cursor: pointer;
`;
const Actions = styled.div`
  box-sizing: border-box;
  position: absolute;
  bottom: 0;
  display: flex;
  align-items: center;
  width: 100%;
  padding: 12px 4px;
`;
