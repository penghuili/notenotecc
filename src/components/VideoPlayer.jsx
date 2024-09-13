import { IconButton, Slider } from '@radix-ui/themes';
import { RiPlayLargeFill, RiVolumeMuteLine, RiVolumeUpLine } from '@remixicon/react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import fastMemo from 'react-fast-memo';
import styled from 'styled-components';
import { createCat, useCat } from 'usecat';

import { getVideoDuration, getVideoPreviewImage } from '../lib/video';

const mutedCat = createCat(true);

export const VideoPlayer = fastMemo(({ src, type, onLoaded, hidden }) => {
  const muted = useCat(mutedCat);
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [previewImageUrl, setPreviewImageUrl] = useState(null);

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

  const handlePlay = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.play();
      setIsPlaying(true);
    }
  }, [videoRef]);

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

  useEffect(() => {
    const video = videoRef.current;
    const handleVideoEnd = () => {
      if (video) {
        video.currentTime = 0;
        setIsPlaying(false);
      }
    };

    video.addEventListener('ended', handleVideoEnd);

    return () => {
      video.removeEventListener('ended', handleVideoEnd);
    };
  }, []);

  useEffect(() => {
    getVideoPreviewImage(src)
      .then(setPreviewImageUrl)
      .catch(e => console.log(e));
  }, [src]);

  useEffect(() => {
    const video = videoRef.current;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]) {
          if (entries[0].isIntersecting) {
            video.play();
            setIsPlaying(true);
          } else {
            video.pause();
            setIsPlaying(false);
          }
        }
      },
      {
        threshold: 0.5,
      }
    );

    observer.observe(video);
  }, []);

  return (
    <Wrapper hidden={hidden}>
      <Video
        ref={videoRef}
        onClick={togglePlayPause}
        onDoubleClick={toggleFullScreen}
        muted={muted}
        autoPlay
        loop
        playsInline
        preload="auto"
        poster={previewImageUrl}
      >
        <source src={src} type={type} />
      </Video>
      {!isPlaying && (
        <PauseWrapper>
          <RiPlayLargeFill style={{ '--font-size': '50px' }} color="white" onClick={handlePlay} />
        </PauseWrapper>
      )}
      <PlayerActions videoRef={videoRef} src={src} onLoaded={onLoaded} />
    </Wrapper>
  );
});

const PlayerActions = fastMemo(({ videoRef, src, onLoaded }) => {
  const muted = useCat(mutedCat);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(1);

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
      video.muted = !muted;
      mutedCat.set(!muted);
    }
  }, [videoRef, muted]);

  useEffect(() => {
    const video = videoRef.current;

    const handleTimeUpdate = () => {
      if (video) {
        setCurrentTime(video.currentTime);
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [videoRef]);

  useEffect(() => {
    getVideoDuration(src)
      .catch(() => undefined)
      .then(duration => {
        setDuration(duration || 1);
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
        {muted ? <RiVolumeMuteLine color="white" /> : <RiVolumeUpLine color="white" />}
      </IconButton>
    </Actions>
  );
});

const Wrapper = styled.div`
  position: relative;
  display: ${props => (props.hidden ? 'none' : 'block')};
  width: 100%;
  aspect-ratio: 1 / 1;
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
const PauseWrapper = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;
