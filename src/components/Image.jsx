import { Box, Spinner } from '@radix-ui/themes';
import React, { Suspense, useEffect, useState } from 'react';

import { fetchFileWithUrl } from '../lib/fetchFileWithUrl.js';
import { imagePathToUrl } from '../lib/imagePathToUrl';
import { useInView } from '../shared-private/react/hooks/useInView';
import { LoadingSkeleton } from '../shared-private/react/LoadingSkeleton.jsx';
import { updateAtomValue } from '../shared-private/react/store/atomHelpers';
import { fullScreenImageUrlAtom } from '../store/note/noteAtoms';
import { decryptBlob } from '../store/note/noteNetwork.js';
import { AudioPlayer } from './AudioPlayer.jsx';
import { ImageActions } from './ImageActions.jsx';

const VideoPlayer = React.lazy(() => import('./VideoPlayer.jsx'));

export function Image({ noteId, encryptedPassword, url, path, size, type, onDeleteLocal }) {
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
        size={size}
        type={type}
        onDeleteLocal={onDeleteLocal}
      />
    );
  }

  return (
    <>
      <div
        ref={ref}
        style={{ position: 'relative', aspectRatio: '1/1', width: '100%', maxWidth: 600 }}
        onDoubleClick={() => {
          updateAtomValue(fullScreenImageUrlAtom, url);
        }}
      >
        {renderContent()}
      </div>
    </>
  );
}

function InnerImage({ noteId, encryptedPassword, url, path, size, type, onDeleteLocal }) {
  const [isLoading, setIsLoading] = useState(true);
  const [innerUrl, setInnerUrl] = useState(null);

  useEffect(() => {
    if (path) {
      if (!encryptedPassword) {
        setInnerUrl(imagePathToUrl(path));
        return;
      }

      setIsLoading(true);
      fetchFileWithUrl(imagePathToUrl(path))
        .then(data => decryptBlob(encryptedPassword, data.blob, type))
        .then(blob => {
          setInnerUrl(URL.createObjectURL(blob));
        })
        .catch(e => {
          console.log(e);
          setInnerUrl(null);
          setIsLoading(false);
        });
    } else {
      setInnerUrl(url);
    }
  }, [encryptedPassword, path, type, url]);

  return (
    <>
      {isLoading && <LoadingSkeleton width="100%" height="100%" />}

      {!!innerUrl && (
        <>
          {type === 'video/webm' && (
            <Suspense fallback={<Spinner />}>
              <VideoPlayer src={innerUrl} onLoad={() => setIsLoading(false)} hidden={isLoading} />
            </Suspense>
          )}

          {type === 'audio/webm' && (
            <AudioPlayer src={innerUrl} onLoad={() => setIsLoading(false)} hidden={isLoading} />
          )}

          {type === 'image/webp' && (
            <img
              src={innerUrl}
              style={{ width: '100%', display: isLoading ? 'none' : 'block' }}
              onLoad={() => {
                setIsLoading(false);
              }}
            />
          )}

          <Box position="absolute" top="2" right="2">
            <ImageActions
              noteId={noteId}
              image={{ url: innerUrl, path: path, size, type }}
              onDeleteLocal={onDeleteLocal}
            />
          </Box>
        </>
      )}
    </>
  );
}