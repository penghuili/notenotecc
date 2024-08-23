import { Box } from '@radix-ui/themes';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

import { fileTypes } from '../lib/constants.js';
import { fetchFileWithUrl } from '../lib/fetchFileWithUrl.js';
import { imagePathToUrl } from '../lib/imagePathToUrl.js';
import { useImageLocalUrl } from '../lib/useImageLocalUrl.js';
import { useInView } from '../shared/react/hooks/useInView.js';
import { LoadingSkeleton } from '../shared/react/LoadingSkeleton.jsx';
import { decryptBlob } from '../store/note/noteNetwork.js';
import { AudioPlayer } from './AudioPlayer.jsx';
import { fullScreenImageUrlCat } from './FullScreenImage.jsx';
import { ImageActions } from './ImageActions.jsx';
import { VideoPlayer } from './VideoPlayer.jsx';

export const MediaItem = React.memo(
  ({ noteId, encryptedPassword, path, hash, size, encryptedSize, type, onDelete }) => {
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

const ImageElement = styled.img`
  width: 100%;
  display: ${props => (props.isLoading ? 'none' : 'block')};
`;

const InnerImage = React.memo(
  ({ noteId, encryptedPassword, path, hash, size, encryptedSize, type, onDelete }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [remoteUrl, setRemoteUrl] = useState(null);
    const localUrl = useImageLocalUrl(hash);
    const url = remoteUrl || localUrl;

    const imageForAction = useMemo(() => {
      return {
        url,
        path,
        size,
        encryptedSize,
        type,
      };
    }, [url, path, size, encryptedSize, type]);

    const handleLoaded = useCallback(() => {
      setIsLoading(false);
    }, []);

    const handleDelete = useCallback(() => {
      onDelete(path || hash);
    }, [hash, onDelete, path]);

    const handleOpenFullScreen = useCallback(() => {
      fullScreenImageUrlCat.set(remoteUrl);
    }, [remoteUrl]);

    useEffect(() => {
      if (!path || !encryptedPassword) {
        return;
      }

      setIsLoading(true);
      fetchFileWithUrl(imagePathToUrl(path), type)
        .then(data => decryptBlob(encryptedPassword, data.blob, type))
        .then(blob => {
          setRemoteUrl(URL.createObjectURL(blob));
        })
        .catch(e => {
          console.log(e);
          setRemoteUrl(null);
          setIsLoading(false);
        });
    }, [encryptedPassword, path, type]);

    return (
      <>
        {isLoading && <LoadingSkeleton width="100%" height="100%" />}

        {!!url && (
          <>
            {(type === fileTypes.webm || type === fileTypes.mp4) && (
              <VideoPlayer src={url} type={type} hidden={isLoading} onLoaded={handleLoaded} />
            )}

            {type === fileTypes.weba && (
              <AudioPlayer src={url} onLoaded={handleLoaded} hidden={isLoading} />
            )}

            {(type === fileTypes.webp || type === fileTypes.jpeg) && (
              <div onDoubleClick={handleOpenFullScreen}>
                <ImageElement src={url} onLoad={handleLoaded} />
              </div>
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
