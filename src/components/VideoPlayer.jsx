import { RiPlayLargeFill, RiVolumeMuteLine, RiVolumeUpLine } from '@remixicon/react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import fastMemo from 'react-fast-memo';
import styled from 'styled-components';
import { createCat, useCat } from 'usecat';

import { getVideoPreviewImage } from '../lib/video';
import { IconButton } from '../shared/semi/IconButton';

const mutedCat = createCat(true);

export const VideoPlayer = fastMemo(({ src, type, hidden }) => {
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

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = !muted;
      mutedCat.set(!muted);
    }
  }, [videoRef, muted]);

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

      <IconButton
        icon={muted ? <RiVolumeMuteLine color="white" /> : <RiVolumeUpLine color="white" />}
        theme="solid"
        round
        onClick={toggleMute}
        style={{
          position: 'absolute',
          bottom: '1rem',
          right: '0.5rem',
          margin: 0,
        }}
      />
    </Wrapper>
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
const PauseWrapper = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;
