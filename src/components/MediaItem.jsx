import { Box } from '@radix-ui/themes';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

import { fileTypes } from '../lib/constants.js';
import { fetchFileWithUrl } from '../lib/fetchFileWithUrl.js';
import { imagePathToUrl } from '../lib/imagePathToUrl.js';
import { useInView } from '../shared/react/hooks/useInView.js';
import { LoadingSkeleton } from '../shared/react/LoadingSkeleton.jsx';
import { decryptBlob } from '../store/note/noteNetwork.js';
import { AudioPlayer } from './AudioPlayer.jsx';
import { ImageActions } from './ImageActions.jsx';
import { VideoPlayer } from './VideoPlayer.jsx';

export const MediaItem = React.memo(
  ({ noteId, encryptedPassword, localUrl, path, hash, size, encryptedSize, type, onDelete }) => {
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
          localUrl={localUrl}
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
  ({ noteId, encryptedPassword, localUrl, path, hash, size, encryptedSize, type, onDelete }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [innerUrl, setInnerUrl] = useState(null);

    const imageForAction = useMemo(() => {
      return {
        url: innerUrl,
        path,
        size,
        encryptedSize,
        type,
      };
    }, [innerUrl, path, size, encryptedSize, type]);

    const handleLoaded = useCallback(() => {
      setIsLoading(false);
    }, []);

    const handleDelete = useCallback(() => {
      onDelete(path || hash);
    }, [hash, onDelete, path]);

    useEffect(() => {
      if (!path) {
        setInnerUrl(localUrl);
        return;
      }

      if (!encryptedPassword) {
        setInnerUrl(imagePathToUrl(path));
        return;
      }

      setIsLoading(true);
      fetchFileWithUrl(imagePathToUrl(path), type)
        .then(data => decryptBlob(encryptedPassword, data.blob, type))
        .then(blob => {
          setInnerUrl(URL.createObjectURL(blob));
        })
        .catch(e => {
          console.log(e);
          setInnerUrl(null);
          setIsLoading(false);
        });
    }, [encryptedPassword, path, type, localUrl]);

    return (
      <>
        {isLoading && <LoadingSkeleton width="100%" height="100%" />}

        {!!innerUrl && (
          <>
            {(type === fileTypes.webm || type === fileTypes.mp4) && (
              <VideoPlayer src={innerUrl} type={type} hidden={isLoading} onLoaded={handleLoaded} />
            )}

            {type === fileTypes.weba && (
              <AudioPlayer src={innerUrl} onLoaded={handleLoaded} hidden={isLoading} />
            )}

            {(type === fileTypes.webp || type === fileTypes.jpeg) && (
              <ImageElement src={innerUrl} onLoad={handleLoaded} />
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
