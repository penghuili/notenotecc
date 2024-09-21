import { Box } from '@radix-ui/themes';
import React, { useCallback, useMemo, useState } from 'react';
import fastMemo from 'react-fast-memo';
import styled from 'styled-components';

import { fileTypes } from '../lib/constants';
import { useImageLocalUrl } from '../lib/useImageLocalUrl';
import { cachedImageUrls, useImageRemoteUrl } from '../lib/useImageRemoteUrl';
import { useInView } from '../shared/browser/hooks/useInView';
import { LoadingSkeleton } from '../shared/radix/LoadingSkeleton.jsx';
import { AudioPlayer } from './AudioPlayer.jsx';
import { fullScreenImageUrlCat } from './FullScreenImage.jsx';
import { ImageActions } from './ImageActions.jsx';
import { VideoPlayer } from './VideoPlayer.jsx';

export const MediaItem = fastMemo(
  ({ noteId, encryptedPassword, url, path, hash, size, encryptedSize, type, onDelete }) => {
    const [showImage, setShowImage] = useState(!!cachedImageUrls[path]);

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

  border-radius: 8px;
  overflow: hidden;
`;
const ImageElement = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
`;

const InnerImage = fastMemo(
  ({ noteId, encryptedPassword, url, path, hash, size, encryptedSize, type, onDelete }) => {
    const { url: remoteUrl, isLoading: isLoadingRemote } = useImageRemoteUrl(
      encryptedPassword,
      path,
      type
    );
    const { url: localUrl, isLoading: isLoadingLocal } = useImageLocalUrl(hash);
    const [isLoadingContent, setIsLoadingContent] = useState(true);

    const innerUrl = url || remoteUrl || localUrl;
    const isLoadingTotal = !innerUrl && (isLoadingRemote || isLoadingLocal || isLoadingContent);

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
              <SquareImage
                url={innerUrl}
                hidden={isLoadingTotal}
                onLoad={handleContentLoaded}
                onDoubleClick={handleOpenFullScreen}
              />
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

export const SquareImage = fastMemo(({ url, hidden, onLoad, onClick, onDoubleClick }) => {
  return (
    <ImageWrapper
      hidden={hidden}
      imageUrl={url}
      onLoad={onLoad}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      <ImageBGCover>
        <ImageElement src={url} />
      </ImageBGCover>
    </ImageWrapper>
  );
});
