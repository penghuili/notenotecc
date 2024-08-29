import { Box } from '@radix-ui/themes';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';

import { fileTypes } from '../lib/constants.js';
import { useImageLocalUrl } from '../lib/useImageLocalUrl.js';
import { useImageRemoteUrl } from '../lib/useImageRemoteUrl.js';
import { useInView } from '../shared/react/hooks/useInView.js';
import { LoadingSkeleton } from '../shared/react/LoadingSkeleton.jsx';
import { AudioPlayer } from './AudioPlayer.jsx';
import { fullScreenImageUrlCat } from './FullScreenImage.jsx';
import { ImageActions } from './ImageActions.jsx';
import { VideoPlayer } from './VideoPlayer.jsx';

export const MediaItem = React.memo(
  ({ noteId, encryptedPassword, url, path, hash, size, encryptedSize, type, onDelete }) => {
    const [showImage, setShowImage] = useState(false);

    const ref = useInView(
      () => {
        setShowImage(true);
      },
      {
        threshold: 0.1,
      }
    );

    function renderContent() {
      if (!showImage) {
        return <LoadingSkeleton width="100%" height="100%" />;
      }

      return (
        <InnerImage
          noteId={noteId}
          encryptedPassword={encryptedPassword}
          url={url}
          path={path}
          hash={hash}
          size={size}
          encryptedSize={encryptedSize}
          type={type}
          onDelete={onDelete}
        />
      );
    }

    return <Wrapper ref={ref}>{renderContent()}</Wrapper>;
  }
);

const Wrapper = styled.div`
  position: relative;
  aspect-ratio: 1 / 1;
  width: 100%;
  max-width: 600px;
`;

const ImageWrapper = styled.div`
  width: 100%;
  height: 100%;
  background-image: url(${props => props.imageUrl});
  background-size: cover;

  display: ${props => (props.hidden ? 'none' : 'block')};
`;
const ImageBGCover = styled.div`
  width: 100%;
  height: 100%;

  display: flex;
  justify-content: center;
  align-items: center;

  background: rgba(139, 137, 137, 0.52);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
`;
const ImageElement = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
`;

const InnerImage = React.memo(
  ({ noteId, encryptedPassword, url, path, hash, size, encryptedSize, type, onDelete }) => {
    const { url: remoteUrl, isLoading: isLoadingRemote } = useImageRemoteUrl(
      encryptedPassword,
      path,
      type
    );
    const { url: localUrl, isLoading: isLoadingLocal } = useImageLocalUrl(hash);
    const [isLoadingContent, setIsLoadingContent] = useState(true);

    const [isLoadingTotal, setIsLoadingTotal] = useState(false);
    const timerRef = useRef(null);

    useEffect(() => {
      clearTimeout(timerRef.current);

      timerRef.current = setTimeout(() => {
        setIsLoadingTotal(isLoadingRemote || isLoadingLocal || isLoadingContent);
      }, 400);

      return () => {
        clearTimeout(timerRef.current);
      };
    }, [isLoadingContent, isLoadingLocal, isLoadingRemote]);

    const innerUrl = url || remoteUrl || localUrl;

    const imageForAction = useMemo(() => {
      return {
        url: innerUrl,
        hash,
        path,
        size,
        encryptedSize,
        type,
      };
    }, [innerUrl, hash, path, size, encryptedSize, type]);

    const handleContentLoaded = useCallback(() => {
      setIsLoadingContent(false);
    }, []);

    const handleDelete = useCallback(() => {
      onDelete(path || hash || url);
    }, [hash, onDelete, path, url]);

    const handleOpenFullScreen = useCallback(() => {
      fullScreenImageUrlCat.set(innerUrl);
    }, [innerUrl]);

    return (
      <>
        {isLoadingTotal && <LoadingSkeleton width="100%" height="100%" />}

        {!!innerUrl && (
          <>
            {(type === fileTypes.webm || type === fileTypes.mp4) && (
              <VideoPlayer
                src={innerUrl}
                type={type}
                hidden={isLoadingTotal}
                onLoaded={handleContentLoaded}
              />
            )}

            {type === fileTypes.weba && (
              <AudioPlayer src={innerUrl} onLoaded={handleContentLoaded} hidden={isLoadingTotal} />
            )}

            {(type === fileTypes.webp || type === fileTypes.jpeg) && (
              <ImageWrapper
                hidden={isLoadingTotal}
                imageUrl={innerUrl}
                onLoad={handleContentLoaded}
                onDoubleClick={handleOpenFullScreen}
              >
                <ImageBGCover>
                  <ImageElement src={innerUrl} />
                </ImageBGCover>
              </ImageWrapper>
            )}

            <Box position="absolute" top="2" right="2">
              <ImageActions noteId={noteId} image={imageForAction} onDelete={handleDelete} />
            </Box>
          </>
        )}
      </>
    );
  }
);
