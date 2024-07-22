import { Box } from '@radix-ui/themes';
import React, { useMemo, useRef, useState } from 'react';

import { imagePathToUrl } from '../lib/imagePathToUrl';
import { useInView } from '../shared-private/react/hooks/useInView';
import { LoadingSkeleton } from '../shared-private/react/LoadingSkeleton';
import { updateAtomValue } from '../shared-private/react/store/atomHelpers';
import { fullScreenImageUrlAtom } from '../store/note/noteAtoms';
import { ImageActions } from './ImageActions';

export function Image({ noteId, imageUrl, imagePath, size, isVideo, onDeleteLocal }) {
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
        imageUrl={imageUrl}
        imagePath={imagePath}
        size={size}
        isVideo={isVideo}
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
          updateAtomValue(fullScreenImageUrlAtom, imageUrl);
        }}
      >
        {renderContent()}
      </div>
    </>
  );
}

function InnerImage({ noteId, imageUrl, imagePath, size, isVideo, onDeleteLocal }) {
  const imageRef = useRef(null);

  const [isLoading, setIsLoading] = useState(!isVideo);

  const url = useMemo(() => {
    if (imagePath) {
      return imagePathToUrl(imagePath);
    }

    return imageUrl;
  }, [imageUrl, imagePath]);

  return (
    <>
      {isLoading && <LoadingSkeleton width="100%" height="100%" />}

      {isVideo ? (
        <video src={url} style={{ width: '100%' }} controls muted />
      ) : (
        <img
          ref={imageRef}
          src={url}
          style={{ width: '100%', display: isLoading ? 'none' : 'block' }}
          onLoad={() => {
            setIsLoading(false);
          }}
        />
      )}

      <Box position="absolute" top="2" right="2">
        <ImageActions
          noteId={noteId}
          image={{ url: imageUrl, path: imagePath, size }}
          imageRef={imageRef}
          onDeleteLocal={onDeleteLocal}
        />
      </Box>
    </>
  );
}
