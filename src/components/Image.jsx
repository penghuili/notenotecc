import { Box, Spinner } from '@radix-ui/themes';
import React, { Suspense, useMemo, useState } from 'react';

import { cameraTypes } from '../lib/cameraTypes.js';
import { imagePathToUrl } from '../lib/imagePathToUrl';
import { useInView } from '../shared-private/react/hooks/useInView';
import { LoadingSkeleton } from '../shared-private/react/LoadingSkeleton.jsx';
import { updateAtomValue } from '../shared-private/react/store/atomHelpers';
import { fullScreenImageUrlAtom } from '../store/note/noteAtoms';
import { AudioPlayer } from './AudioPlayer.jsx';
import { ImageActions } from './ImageActions.jsx';

const VideoPlayer = React.lazy(() => import('./VideoPlayer.jsx'));

export function Image({ noteId, url, path, size, type, onDeleteLocal }) {
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

function InnerImage({ noteId, url, path, size, type, onDeleteLocal }) {
  const [isLoading, setIsLoading] = useState(true);

  const innerUrl = useMemo(() => {
    if (path) {
      return imagePathToUrl(path);
    }

    return url;
  }, [url, path]);

  return (
    <>
      {isLoading && <LoadingSkeleton width="100%" height="100%" />}

      {type === cameraTypes.takeVideo && (
        <Suspense fallback={<Spinner />}>
          <VideoPlayer src={innerUrl} onLoad={() => setIsLoading(false)} hidden={isLoading} />
        </Suspense>
      )}

      {type === cameraTypes.takeAudio && (
        <AudioPlayer src={innerUrl} onLoad={() => setIsLoading(false)} hidden={isLoading} />
      )}

      {(type === cameraTypes.takePhoto || type === cameraTypes.pickPhoto) && (
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
          image={{ url: innerUrl, path: path, size }}
          onDeleteLocal={onDeleteLocal}
        />
      </Box>
    </>
  );
}
